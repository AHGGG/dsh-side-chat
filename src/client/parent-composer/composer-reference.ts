import type { Context } from '@deepseek-ai/cordis'
import type {
  InputState, ReferenceInsert, SessionInput, TokenSpan,
} from '@deepseek-ai/dsh-client-ui-conversation/client'

export type ParentComposerOccurrence = InputState['occurrences'][number]
export type ParentComposerSpan = TokenSpan
export type ParentComposerInputSnapshot = Pick<InputState, 'draft' | 'draftRev' | 'occurrences'>
  & Partial<Pick<InputState, 'phase'>>

/** DSH 0.2's Lexical editor: published offsets are clipboard coordinates,
 * mutation spans count each reference chip as one character. */
export interface ParentComposerInput {
  readonly state: {
    getSnapshot(): ParentComposerInputSnapshot
    subscribe(listener: () => void): () => void
  }
  setDraft(text: string): void
  replaceText(text: string, span: ParentComposerSpan): boolean
  insertReference(reference: ReferenceInsert, span: ParentComposerSpan): boolean
  notify?: SessionInput['notify']
}

export interface ParentConversationService {
  readonly input: { for(scope: Context): SessionInput }
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

export function occurrenceRange(
  snapshot: ParentComposerInputSnapshot,
  occurrence: ParentComposerOccurrence,
  expectedLabel: string,
): { start: number; end: number } | undefined {
  const { offset, length } = occurrence
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length)
    || offset < 0 || length < 0 || offset + length > snapshot.draft.length
    || occurrence.label !== expectedLabel
    || snapshot.draft.slice(offset, offset + length) !== occurrence.clipboardText) return
  return { start: offset, end: offset + length }
}

export function occurrenceMatchesDraft(
  snapshot: ParentComposerInputSnapshot,
  occurrence: ParentComposerOccurrence,
  expectedLabel: string,
): boolean {
  return occurrenceRange(snapshot, occurrence, expectedLabel) !== undefined
}

/** Convert a reference's clipboard range to the editor's atomic coordinates. */
export function occurrenceEditSpan(
  _input: ParentComposerInput,
  snapshot: ParentComposerInputSnapshot,
  occurrence: ParentComposerOccurrence,
  options: { readonly consumeFollowingSeparator?: boolean } = {},
): ParentComposerSpan | undefined {
  const range = occurrenceRange(snapshot, occurrence, occurrence.label)
  if (range === undefined) return
  let start = range.start
  for (const previous of snapshot.occurrences) {
    if (previous.offset >= occurrence.offset) continue
    if (occurrenceRange(snapshot, previous, previous.label) === undefined
      || previous.offset + previous.length > occurrence.offset) return
    start -= previous.length - 1
  }
  let end = start + 1
  if (options.consumeFollowingSeparator && snapshot.draft[range.end] === ' ') end += 1
  return { start, end, draftRev: snapshot.draftRev }
}

export function newlyInsertedOccurrence(
  before: ParentComposerInputSnapshot,
  after: ParentComposerInputSnapshot,
  source: string,
  ref: string,
): ParentComposerOccurrence | undefined {
  const previousIds = new Set(before.occurrences.map(occurrence => occurrence.occurrenceId))
  const inserted = after.occurrences.filter(occurrence => !previousIds.has(occurrence.occurrenceId)
    && occurrence.source === source && occurrence.ref === ref)
  return inserted.length === 1 ? inserted[0] : undefined
}
