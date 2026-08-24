import type { ConversationSelection, SideChatPromptPart } from '../../shared/contracts.js'
import {
  draftWithoutOccurrence,
  LEGACY_REFERENCE_PLACEHOLDER,
  newlyInsertedOccurrence,
  occurrenceMatchesDraft,
  occurrenceRange,
  referenceDisplayText,
} from './composer-reference.js'
import type {
  ParentComposerInput,
  ParentComposerInputSnapshot,
  ParentComposerOccurrence,
  SelectionReferenceSource,
} from './composer-reference.js'

export type {
  ParentComposerInput,
  ParentComposerInputSnapshot,
  ParentComposerOccurrence,
  ParentConversationService,
  SelectionReferenceSource,
} from './composer-reference.js'

const SELECTION_REFERENCE_SOURCE = 'dsh-side-chat-selection'
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
  let current = snapshot
  for (const occurrence of occurrences) {
    const draft = draftWithoutOccurrence(current, occurrence, SELECTION_REFERENCE_LABEL)
    if (draft === undefined) continue
    current = { ...current, draft }
  }
  let draft = current.draft
  // Add to chat owns the separator immediately after its leading occurrence.
  if (occurrences.some(occurrence => occurrence.offset === 0)) {
    if (draft.startsWith('\n\n')) draft = draft.slice(2)
    else if (draft.startsWith('\n') || draft.startsWith(' ')) draft = draft.slice(1)
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
  const insertionState = input.state.getSnapshot()
  if (insertionState.draftRev !== before.draftRev || insertionState.draft !== before.draft) return false

  const ref = encodeSelectionReference(annotations)
  const inserted = input.insertReference({
    source: SELECTION_REFERENCE_SOURCE,
    ref,
    label: SELECTION_REFERENCE_LABEL,
    clipboardText: annotations.map(annotation => annotation.text).join('\n\n'),
  }, {
    start: 0,
    end: 0,
    draftRev: insertionState.draftRev,
  })
  // Existing annotations are intentionally still live here. If DSH rejects the
  // insertion, the operation is a no-op instead of deleting the previous chip.
  if (!inserted) return false

  const afterInsert = input.state.getSnapshot()
  const occurrence = newlyInsertedOccurrence(
    insertionState,
    afterInsert,
    SELECTION_REFERENCE_SOURCE,
    ref,
  )
  const rollbackInsertion = (): void => {
    const current = input.state.getSnapshot()
    const insertedOccurrence = occurrence === undefined
      ? undefined
      : current.occurrences.find(candidate => candidate.occurrenceId === occurrence.occurrenceId)
    if (insertedOccurrence === undefined || insertedOccurrence.offset !== 0) return
    const insertedRange = occurrenceRange(current, insertedOccurrence, SELECTION_REFERENCE_LABEL)
    if (insertedRange === undefined || insertedRange.start !== 0) return
    let tail = current.draft.slice(insertedRange.end)
    if (tail.startsWith(' ') && tail.slice(1) === before.draft) tail = before.draft
    else if (tail !== before.draft) return
    input.setDraft(tail)
  }
  if (occurrence === undefined || occurrence.offset !== 0) {
    rollbackInsertion()
    return false
  }
  const range = occurrenceRange(afterInsert, occurrence, SELECTION_REFERENCE_LABEL)
  if (range === undefined || range.start !== 0) {
    rollbackInsertion()
    return false
  }

  // Current DSH inserts the complete `@label` display text followed by an
  // optional ASCII separating gap. Older releases insert a one-unit U+FFFC
  // placeholder. At this point the old occurrence is still in the tail; one
  // tail replacement preserves the new occurrence and removes the old one.
  let rest = afterInsert.draft.slice(range.end)
  if (rest.startsWith(' ') && rest.slice(1) === before.draft) rest = before.draft
  else if (rest !== before.draft) {
    rollbackInsertion()
    return false
  }
  const display = afterInsert.draft.slice(range.start, range.end)
  const normalizedDraft = `${display}\n\n${draft}`

  // insertReference and setDraft are separate public transactions. Re-read the
  // exact occurrence before the second write so a synchronous subscriber cannot
  // make us normalize a stale insertion.
  const current = input.state.getSnapshot()
  const currentOccurrence = current.occurrences.find(candidate => candidate.occurrenceId === occurrence.occurrenceId)
  if (current.draftRev !== afterInsert.draftRev
    || current.draft !== afterInsert.draft
    || currentOccurrence === undefined
    || currentOccurrence.source !== SELECTION_REFERENCE_SOURCE
    || currentOccurrence.ref !== ref
    || !occurrenceMatchesDraft(current, currentOccurrence, SELECTION_REFERENCE_LABEL)) {
    rollbackInsertion()
    return false
  }

  input.setDraft(normalizedDraft)
  const normalized = input.state.getSnapshot()
  const retained = normalized.occurrences.find(candidate => candidate.occurrenceId === occurrence.occurrenceId)
  return normalized.draft === normalizedDraft
    && retained !== undefined
    && retained.source === SELECTION_REFERENCE_SOURCE
    && retained.ref === ref
    && retained.offset === 0
    && occurrenceMatchesDraft(normalized, retained, SELECTION_REFERENCE_LABEL)
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

/** Remove one unsent selected-passage annotation, retaining the aggregate when needed. */
export function removeConversationAnnotation(
  input: ParentComposerInput,
  annotationIndex: number,
): boolean {
  const before = input.state.getSnapshot()
  const annotations = [...storedConversationAnnotations(before)]
  if (!Number.isSafeInteger(annotationIndex) || annotations[annotationIndex] === undefined) return false
  annotations.splice(annotationIndex, 1)
  if (annotations.length === 0) {
    input.setDraft(draftWithoutSelectionOccurrences(before))
    return selectionOccurrences(input.state.getSnapshot()).length === 0
  }
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

export interface ConversationAnnotationRecoveryRecord {
  readonly ref: string
  readonly displayDraft: string
  readonly mirrorDraft: string
  readonly baseDraft: string
}

function exactClipboardProjection(
  snapshot: ParentComposerInputSnapshot,
  annotationOccurrence: ParentComposerOccurrence,
  annotationClipboardText: string,
): string | undefined {
  let projected = ''
  let cursor = 0
  const occurrences = [...snapshot.occurrences].sort((left, right) => left.offset - right.offset)
  for (const occurrence of occurrences) {
    const expectedLabel = occurrence.occurrenceId === annotationOccurrence.occurrenceId
      ? SELECTION_REFERENCE_LABEL
      : occurrence.label
    if (occurrence.length === undefined
      && !snapshot.draft.startsWith(LEGACY_REFERENCE_PLACEHOLDER, occurrence.offset)
      && expectedLabel === undefined) return
    const range = occurrenceRange(snapshot, occurrence, expectedLabel ?? '')
    if (range === undefined || range.start < cursor) return
    const clipboardText = occurrence.occurrenceId === annotationOccurrence.occurrenceId
      ? annotationClipboardText
      : occurrence.clipboardText
    if (clipboardText === undefined) return
    projected += snapshot.draft.slice(cursor, range.start) + clipboardText
    cursor = range.end
  }
  return projected + snapshot.draft.slice(cursor)
}

function annotationSeparator(draftTail: string): string {
  if (draftTail.startsWith('\n\n')) return '\n\n'
  if (draftTail.startsWith('\n')) return '\n'
  if (draftTail.startsWith(' ')) return ' '
  return ''
}

function baseDraftFromMirror(
  mirrorDraft: string,
  clipboardText: string,
  expectedBaseDraft?: string,
): string | undefined {
  const separators = ['\n\n', '\n', ' ', ''] as const
  if (expectedBaseDraft !== undefined) {
    return separators.some(
      separator => mirrorDraft === clipboardText + separator + expectedBaseDraft,
    )
      ? expectedBaseDraft
      : undefined
  }
  for (const separator of separators.slice(0, -1)) {
    const prefix = clipboardText + separator
    if (mirrorDraft.startsWith(prefix)) return mirrorDraft.slice(prefix.length)
  }
  return mirrorDraft === clipboardText ? '' : undefined
}

/** Describe both the display draft and DSH's persisted clipboard projection. */
export function conversationAnnotationRecoveryRecord(
  snapshot: ParentComposerInputSnapshot,
): ConversationAnnotationRecoveryRecord | undefined {
  const occurrence = selectionOccurrences(snapshot).find(candidate => candidate.offset === 0)
  const ref = conversationAnnotationReference(snapshot)
  if (occurrence === undefined || ref === undefined) return
  const range = occurrenceRange(snapshot, occurrence, SELECTION_REFERENCE_LABEL)
  if (range === undefined || range.start !== 0) return
  let annotations: readonly StoredConversationAnnotation[]
  try {
    annotations = decodeStoredSelectionReference(ref)
  } catch {
    return
  }
  const clipboardText = annotations.map(annotation => annotation.text).join('\n\n')
  const mirrorDraft = exactClipboardProjection(snapshot, occurrence, clipboardText)
  if (mirrorDraft === undefined) return
  const separator = annotationSeparator(snapshot.draft.slice(range.end))
  const mirrorPrefix = clipboardText + separator
  if (!mirrorDraft.startsWith(mirrorPrefix)) return
  return {
    ref,
    displayDraft: snapshot.draft,
    mirrorDraft,
    baseDraft: mirrorDraft.slice(mirrorPrefix.length),
  }
}

/** Return the valid aggregated reference currently occupying the leading draft slot. */
export function conversationAnnotationReference(
  snapshot: ParentComposerInputSnapshot,
): string | undefined {
  const occurrence = selectionOccurrences(snapshot).find(candidate => candidate.offset === 0)
  if (occurrence === undefined
    || !occurrenceMatchesDraft(snapshot, occurrence, SELECTION_REFERENCE_LABEL)) return
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
  if (snapshot.occurrences.some(occurrence => occurrence.offset === 0)) return
  const legacyPrefix = `${LEGACY_REFERENCE_PLACEHOLDER}\n\n`
  if (snapshot.draft.startsWith(legacyPrefix)) return snapshot.draft.slice(legacyPrefix.length)

  const display = referenceDisplayText(SELECTION_REFERENCE_LABEL)
  if (!snapshot.draft.startsWith(display)) return
  let rest = snapshot.draft.slice(display.length)
  if (rest.startsWith('\n\n')) rest = rest.slice(2)
  else if (rest.startsWith(' ')) rest = rest.slice(1)
  else return
  return rest
}

/** Remove the plugin-owned prefix when rc.6 restored its draft without occurrences. */
export function removeOrphanedConversationAnnotationPlaceholder(input: ParentComposerInput): boolean {
  const draft = draftWithoutOrphanedAnnotationPrefix(input.state.getSnapshot())
  if (draft === undefined) return false
  input.setDraft(draft)
  return true
}

/** Rehydrate a lost occurrence over either its display draft or exact mirror projection. */
export function restoreConversationAnnotationReference(
  input: ParentComposerInput,
  ref: string,
  expectedMirrorDraft?: string,
  expectedBaseDraft?: string,
): boolean {
  let annotations: readonly StoredConversationAnnotation[]
  try {
    annotations = decodeStoredSelectionReference(ref)
  } catch {
    return false
  }
  const snapshot = input.state.getSnapshot()
  const orphanDraft = draftWithoutOrphanedAnnotationPrefix(snapshot)
  const clipboardText = annotations.map(annotation => annotation.text).join('\n\n')
  const mirrorBaseDraft = expectedMirrorDraft === undefined
    ? undefined
    : baseDraftFromMirror(expectedMirrorDraft, clipboardText, expectedBaseDraft)
  const draft = orphanDraft
    ?? (expectedMirrorDraft !== undefined
      && snapshot.occurrences.length === 0
      && snapshot.draft === expectedMirrorDraft
      && mirrorBaseDraft !== undefined
      ? mirrorBaseDraft
      : undefined)
  if (draft === undefined) return false
  if (draft !== snapshot.draft) input.setDraft(draft)
  const beforeWrite = input.state.getSnapshot()
  if (beforeWrite.draft !== draft || beforeWrite.occurrences.length !== 0) return false
  if (writeConversationAnnotations(input, beforeWrite, annotations)) return true
  // Recovery must be content preserving. If DSH rejects insertion, put the
  // exact mirror projection back rather than leaving a partially stripped draft.
  const afterFailure = input.state.getSnapshot()
  if (afterFailure.occurrences.length === 0 && expectedMirrorDraft !== undefined) {
    input.setDraft(expectedMirrorDraft)
  }
  return false
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
