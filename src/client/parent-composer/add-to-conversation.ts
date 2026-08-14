import type { Context } from '@deepseek-ai/cordis'
import type { ConversationSelection, SideChatPromptPart } from '../../shared/contracts.js'

const SELECTION_REFERENCE_SOURCE = 'dsh-side-chat-selection'
const OBJECT_REPLACEMENT_CHARACTER = '\uFFFC'
export const SELECTION_REFERENCE_LABEL = '__dsh_side_chat_annotations__'

export interface ConversationAnnotation {
  readonly text: string
  readonly comment?: string
}

interface SelectionReferencePayload {
  readonly version: 1
  readonly annotations: readonly ConversationAnnotation[]
}

export interface ParentComposerOccurrence {
  readonly occurrenceId: number
  readonly source: string
  readonly ref: string
  readonly offset: number
}

export interface ParentComposerInputSnapshot {
  readonly draft: string
  readonly draftRev: number
  readonly occurrences: readonly ParentComposerOccurrence[]
}

export interface ParentComposerInput {
  readonly state: { getSnapshot(): ParentComposerInputSnapshot }
  setDraft(text: string): void
  insertReference(
    reference: {
      readonly source: string
      readonly ref: string
      readonly label: string
      readonly clipboardText: string
    },
    span: { readonly start: number; readonly end: number; readonly draftRev: number },
  ): boolean
}

export interface ParentConversationService {
  readonly input: { for(scope: Context): ParentComposerInput }
}

export interface SelectionReferenceSource {
  readonly trigger: '@'
  readonly name: string
  readonly order: number
  candidates(): Promise<readonly never[]>
  onPick(): undefined
  readonly codec: {
    clipboardText(ref: string): string
    serialize(ref: string, signal: AbortSignal): Promise<string>
  }
}

function escapeXmlText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function annotationFromSelection(
  selection: ConversationSelection,
  comment?: string,
): ConversationAnnotation {
  const trimmedComment = comment?.trim()
  return {
    text: selection.text,
    ...(trimmedComment === undefined || trimmedComment.length === 0
      ? {}
      : { comment: trimmedComment }),
  }
}

function encodeSelectionReference(annotations: readonly ConversationAnnotation[]): string {
  return JSON.stringify({
    version: 1,
    annotations,
  } satisfies SelectionReferencePayload)
}

function isAnnotation(value: unknown): value is ConversationAnnotation {
  if (typeof value !== 'object' || value === null) return false
  const annotation = value as Partial<ConversationAnnotation>
  return typeof annotation.text === 'string'
    && (annotation.comment === undefined || typeof annotation.comment === 'string')
}

export function decodeSelectionReference(ref: string): readonly ConversationAnnotation[] {
  const value = JSON.parse(ref) as Partial<SelectionReferencePayload> & Partial<ConversationAnnotation>
  // Accept the one-selection payload written by the first Add-to-chat build.
  if (isAnnotation(value)) return [value]
  if (value.version !== 1
    || !Array.isArray(value.annotations)
    || value.annotations.length === 0
    || !value.annotations.every(isAnnotation)) {
    throw new Error('The selected conversation annotation is no longer valid.')
  }
  return value.annotations
}

function selectedContext(annotations: readonly ConversationAnnotation[]): string {
  return [
    '<selected_context>',
    ...annotations.flatMap((annotation, index) => annotation.comment === undefined
      ? [
          `<annotation index="${String(index + 1)}">`,
          escapeXmlText(annotation.text),
          '</annotation>',
        ]
      : [
          `<annotation index="${String(index + 1)}">`,
          '<selected_text>',
          escapeXmlText(annotation.text),
          '</selected_text>',
          '<user_comment>',
          escapeXmlText(annotation.comment),
          '</user_comment>',
          '</annotation>',
        ]),
    '</selected_context>',
  ].join('\n')
}

function selectionOccurrences(snapshot: ParentComposerInputSnapshot): readonly ParentComposerOccurrence[] {
  return snapshot.occurrences.filter(occurrence => occurrence.source === SELECTION_REFERENCE_SOURCE)
}

/** Read all plugin annotations represented by the current DSH input occurrence. */
export function conversationAnnotations(
  snapshot: ParentComposerInputSnapshot,
): readonly ConversationAnnotation[] {
  return selectionOccurrences(snapshot).flatMap((occurrence) => {
    try {
      return [...decodeSelectionReference(occurrence.ref)]
    } catch {
      return []
    }
  })
}

function draftWithoutSelectionOccurrences(snapshot: ParentComposerInputSnapshot): string {
  const occurrences = [...selectionOccurrences(snapshot)].sort((a, b) => b.offset - a.offset)
  let draft = snapshot.draft
  for (const occurrence of occurrences) {
    draft = draft.slice(0, occurrence.offset) + draft.slice(occurrence.offset + 1)
  }
  // Add to chat owns the blank lines immediately after its leading occurrence.
  if (occurrences.some(occurrence => occurrence.offset === 0)) {
    if (draft.startsWith('\n\n')) draft = draft.slice(2)
    else if (draft.startsWith('\n')) draft = draft.slice(1)
  }
  return draft
}

/** Remove every unsent plugin annotation while preserving the user's draft. */
export function removeConversationAnnotations(input: ParentComposerInput): boolean {
  const snapshot = input.state.getSnapshot()
  if (selectionOccurrences(snapshot).length === 0) return false
  input.setDraft(draftWithoutSelectionOccurrences(snapshot))
  return true
}

/** Reference codec used by DSH's native composer chip and submit pipeline. */
export const selectionReferenceSource: SelectionReferenceSource = {
  trigger: '@',
  name: SELECTION_REFERENCE_SOURCE,
  order: 1_000,
  candidates: async () => [],
  onPick: () => undefined,
  codec: {
    clipboardText: ref => decodeSelectionReference(ref).map(annotation => annotation.text).join('\n\n'),
    serialize: async (ref, signal) => {
      if (signal.aborted) throw signal.reason
      return selectedContext(decodeSelectionReference(ref))
    },
  },
}

/** Add one passage to the parent composer's aggregated annotation occurrence. */
export function addSelectionToConversation(
  input: ParentComposerInput,
  selection: ConversationSelection,
  comment?: string,
): boolean {
  const before = input.state.getSnapshot()
  const annotations = [...conversationAnnotations(before), annotationFromSelection(selection, comment)]
  const draft = draftWithoutSelectionOccurrences(before)
  if (selectionOccurrences(before).length > 0) input.setDraft(draft)
  const insertionState = input.state.getSnapshot()
  const inserted = input.insertReference({
    source: SELECTION_REFERENCE_SOURCE,
    ref: encodeSelectionReference(annotations),
    label: SELECTION_REFERENCE_LABEL,
    clipboardText: annotations.map(annotation => annotation.text).join('\n\n'),
  }, {
    start: 0,
    end: 0,
    draftRev: insertionState.draftRev,
  })
  if (!inserted) return false

  // DSH keeps the occurrence and owns its model serialization. The two blank
  // lines reserve the first visual row for the plugin's interactive capsule.
  input.setDraft(`${OBJECT_REPLACEMENT_CHARACTER}\n\n${draft}`)
  return true
}

function unescapeXmlText(value: string): string {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

export interface AnnotatedConversationPrompt {
  readonly annotations: readonly ConversationAnnotation[]
  readonly message: string
}

function parseAnnotationBody(body: string): ConversationAnnotation {
  const selectedText = /^<selected_text>\n([\s\S]*?)\n<\/selected_text>(?:\n<user_comment>\n([\s\S]*?)\n<\/user_comment>)?$/u.exec(body)
  if (selectedText === null) return { text: unescapeXmlText(body) }
  const comment = selectedText[2]
  return {
    text: unescapeXmlText(selectedText[1] ?? ''),
    ...(comment === undefined ? {} : { comment: unescapeXmlText(comment) }),
  }
}

/** Parse the durable model form back into the user-facing annotation capsule. */
export function parseAnnotatedConversationPrompt(text: string): AnnotatedConversationPrompt | undefined {
  const current = /^<selected_context>\n([\s\S]*?)\n<\/selected_context>\s*/u.exec(text)
  if (current !== null) {
    const annotations: ConversationAnnotation[] = []
    const annotationPattern = /<annotation(?: index="\d+")?>\n([\s\S]*?)\n<\/annotation>/gu
    for (const match of current[1]?.matchAll(annotationPattern) ?? []) {
      annotations.push(parseAnnotationBody(match[1] ?? ''))
    }
    if (annotations.length > 0) {
      return { annotations, message: text.slice(current[0].length).trim() }
    }
  }

  const legacyXml = /^<selected_context source="current-conversation" event-seq="(\d+)">\n?([\s\S]*?)\n?<\/selected_context>\s*/u.exec(text)
  if (legacyXml !== null) {
    return {
      annotations: [{ text: unescapeXmlText(legacyXml[2] ?? '') }],
      message: text.slice(legacyXml[0].length).trim(),
    }
  }

  const legacyText = /^Selected passage from the current conversation \(message (\d+)\):\n([\s\S]*?)\nEnd selected passage\.\s*/u.exec(text)
  if (legacyText === null) return undefined
  return {
    annotations: [{ text: legacyText[2] ?? '' }],
    message: text.slice(legacyText[0].length).trim(),
  }
}

/** Add the selected quote to the first child prompt. */
export function buildSideChatPrompt(
  selection: ConversationSelection | undefined,
  question: string,
): readonly SideChatPromptPart[] {
  const trimmed = question.trim()
  if (selection === undefined) return [{ type: 'text', text: trimmed }]
  return [{
    type: 'text',
    text: [
      `<selected_context source="current-conversation" event-seq="${selection.atSeq}">`,
      escapeXmlText(selection.text),
      '</selected_context>',
      '',
      '<user_question>',
      escapeXmlText(trimmed),
      '</user_question>',
    ].join('\n'),
  }]
}
