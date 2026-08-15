import type { Context } from '@deepseek-ai/cordis'
import type { ConversationSelection, SideChatPromptPart } from '../../shared/contracts.js'

const SELECTION_REFERENCE_SOURCE = 'dsh-side-chat-selection'
const OBJECT_REPLACEMENT_CHARACTER = '\uFFFC'
export const SELECTION_REFERENCE_LABEL = '__dsh_side_chat_annotations__'

export interface ConversationAnnotation {
  readonly text: string
  readonly comment?: string
}

interface StoredConversationAnnotation extends ConversationAnnotation {
  readonly selection?: ConversationSelection
}

export interface ConversationSelectionAnnotation extends ConversationAnnotation {
  /** Zero-based position in the aggregated composer annotation list. */
  readonly annotationIndex: number
  readonly selection: ConversationSelection
}

interface SelectionReferencePayload {
  readonly version: 2
  readonly annotations: readonly StoredConversationAnnotation[]
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
  readonly state: {
    getSnapshot(): ParentComposerInputSnapshot
    subscribe?(listener: () => void): () => void
  }
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
): StoredConversationAnnotation {
  const trimmedComment = comment?.trim()
  return {
    text: selection.text,
    selection,
    ...(trimmedComment === undefined || trimmedComment.length === 0
      ? {}
      : { comment: trimmedComment }),
  }
}

function encodeSelectionReference(annotations: readonly StoredConversationAnnotation[]): string {
  return JSON.stringify({
    version: 2,
    annotations,
  } satisfies SelectionReferencePayload)
}

function isSelection(value: unknown): value is ConversationSelection {
  if (typeof value !== 'object' || value === null) return false
  const selection = value as Partial<ConversationSelection>
  if (typeof selection.parentSessionId !== 'string'
    || typeof selection.text !== 'string'
    || !Number.isSafeInteger(selection.atSeq)
    || !Array.isArray(selection.fragments)
    || typeof selection.rect !== 'object'
    || selection.rect === null) return false
  const rect = selection.rect as Partial<ConversationSelection['rect']>
  if (![rect.x, rect.y, rect.width, rect.height, rect.viewportWidth, rect.viewportHeight]
    .every(number => typeof number === 'number' && Number.isFinite(number))) return false
  return selection.fragments.every((candidate) => {
    if (typeof candidate !== 'object' || candidate === null) return false
    const fragment = candidate as Partial<ConversationSelection['fragments'][number]>
    return typeof fragment.nodeKey === 'string'
      && typeof fragment.nodeKind === 'string'
      && typeof fragment.turnKey === 'string'
      && Number.isSafeInteger(fragment.seq)
      && Number.isSafeInteger(fragment.startOffset)
      && Number.isSafeInteger(fragment.endOffset)
      && typeof fragment.text === 'string'
      && ['user', 'assistant', 'context', 'code'].includes(fragment.source ?? '')
      && typeof fragment.modelVisible === 'boolean'
      && typeof fragment.settled === 'boolean'
  })
}

function isStoredAnnotation(value: unknown): value is StoredConversationAnnotation {
  if (typeof value !== 'object' || value === null) return false
  const annotation = value as Partial<StoredConversationAnnotation>
  return typeof annotation.text === 'string'
    && (annotation.comment === undefined || typeof annotation.comment === 'string')
    && (annotation.selection === undefined || isSelection(annotation.selection))
}

function visibleAnnotation(annotation: StoredConversationAnnotation): ConversationAnnotation {
  return {
    text: annotation.text,
    ...(annotation.comment === undefined ? {} : { comment: annotation.comment }),
  }
}

function decodeStoredSelectionReference(ref: string): readonly StoredConversationAnnotation[] {
  const value = JSON.parse(ref) as unknown
  // Accept the one-selection payload written by the first Add-to-chat build.
  if (isStoredAnnotation(value)) return [value]
  if (typeof value !== 'object' || value === null) {
    throw new Error('The selected conversation annotation is no longer valid.')
  }
  const payload = value as { readonly version?: unknown; readonly annotations?: unknown }
  if ((payload.version !== 1 && payload.version !== 2)
    || !Array.isArray(payload.annotations)
    || payload.annotations.length === 0
    || !payload.annotations.every(isStoredAnnotation)) {
    throw new Error('The selected conversation annotation is no longer valid.')
  }
  return payload.annotations
}

export function decodeSelectionReference(ref: string): readonly ConversationAnnotation[] {
  return decodeStoredSelectionReference(ref).map(visibleAnnotation)
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

function storedConversationAnnotations(
  snapshot: ParentComposerInputSnapshot,
): readonly StoredConversationAnnotation[] {
  return selectionOccurrences(snapshot).flatMap((occurrence) => {
    try {
      return [...decodeStoredSelectionReference(occurrence.ref)]
    } catch {
      return []
    }
  })
}

/** Read all plugin annotations represented by the current DSH input occurrence. */
export function conversationAnnotations(
  snapshot: ParentComposerInputSnapshot,
): readonly ConversationAnnotation[] {
  return storedConversationAnnotations(snapshot).map(visibleAnnotation)
}

/** Read annotations that retain an exact source-selection anchor. */
export function conversationSelectionAnnotations(
  snapshot: ParentComposerInputSnapshot,
): readonly ConversationSelectionAnnotation[] {
  const anchored: ConversationSelectionAnnotation[] = []
  storedConversationAnnotations(snapshot).forEach((annotation, annotationIndex) => {
    if (annotation.selection === undefined) return
    anchored.push({
      ...visibleAnnotation(annotation),
      annotationIndex,
      selection: annotation.selection,
    })
  })
  return anchored
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

function writeConversationAnnotations(
  input: ParentComposerInput,
  before: ParentComposerInputSnapshot,
  annotations: readonly StoredConversationAnnotation[],
): boolean {
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

/** Add one passage to the parent composer's aggregated annotation occurrence. */
export function addSelectionToConversation(
  input: ParentComposerInput,
  selection: ConversationSelection,
  comment?: string,
): boolean {
  const before = input.state.getSnapshot()
  const annotations = [...storedConversationAnnotations(before), annotationFromSelection(selection, comment)]
  return writeConversationAnnotations(input, before, annotations)
}

/** Replace the optional comment on one unsent selected-passage annotation. */
export function updateConversationAnnotation(
  input: ParentComposerInput,
  annotationIndex: number,
  comment?: string,
): boolean {
  const before = input.state.getSnapshot()
  const annotations = [...storedConversationAnnotations(before)]
  const current = annotations[annotationIndex]
  if (!Number.isSafeInteger(annotationIndex) || current === undefined) return false
  const trimmedComment = comment?.trim()
  annotations[annotationIndex] = {
    text: current.text,
    ...(current.selection === undefined ? {} : { selection: current.selection }),
    ...(trimmedComment === undefined || trimmedComment.length === 0
      ? {}
      : { comment: trimmedComment }),
  }
  return writeConversationAnnotations(input, before, annotations)
}

/** Return the valid aggregated reference currently occupying the leading draft slot. */
export function conversationAnnotationReference(
  snapshot: ParentComposerInputSnapshot,
): string | undefined {
  const occurrence = selectionOccurrences(snapshot).find(candidate => candidate.offset === 0)
  if (occurrence === undefined || !snapshot.draft.startsWith(OBJECT_REPLACEMENT_CHARACTER)) return
  try {
    decodeStoredSelectionReference(occurrence.ref)
    return occurrence.ref
  } catch {
    return
  }
}

function draftWithoutOrphanedAnnotationPrefix(
  snapshot: ParentComposerInputSnapshot,
): string | undefined {
  const prefix = `${OBJECT_REPLACEMENT_CHARACTER}\n\n`
  if (!snapshot.draft.startsWith(prefix)
    || snapshot.occurrences.some(occurrence => occurrence.offset === 0)) return
  return snapshot.draft.slice(prefix.length)
}

/** Remove the plugin-owned prefix when rc.6 restored its draft without occurrences. */
export function removeOrphanedConversationAnnotationPlaceholder(input: ParentComposerInput): boolean {
  const draft = draftWithoutOrphanedAnnotationPrefix(input.state.getSnapshot())
  if (draft === undefined) return false
  input.setDraft(draft)
  return true
}

/** Rehydrate a lost rc.6 occurrence only over the exact plugin-owned orphan prefix. */
export function restoreConversationAnnotationReference(
  input: ParentComposerInput,
  ref: string,
): boolean {
  let annotations: readonly StoredConversationAnnotation[]
  try {
    annotations = decodeStoredSelectionReference(ref)
  } catch {
    return false
  }
  const draft = draftWithoutOrphanedAnnotationPrefix(input.state.getSnapshot())
  if (draft === undefined) return false
  input.setDraft(draft)
  return writeConversationAnnotations(input, input.state.getSnapshot(), annotations)
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
