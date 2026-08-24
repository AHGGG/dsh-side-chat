import type { Context } from '@deepseek-ai/cordis'

export const LEGACY_REFERENCE_PLACEHOLDER = '\uFFFC'

export interface ParentComposerOccurrence {
  readonly occurrenceId: number
  readonly source: string
  readonly ref: string
  readonly offset: number
  /** Complete inline display-text length in current DSH input snapshots. */
  readonly length?: number
  /** Insert-time display label, present in current DSH input snapshots. */
  readonly label?: string
  /** Draft-persistence projection cached by current DSH input snapshots. */
  readonly clipboardText?: string
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
      readonly appearance?: 'session' | 'file' | 'folder'
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

export interface OccurrenceRange {
  readonly start: number
  readonly end: number
}

export function referenceDisplayText(label: string): string {
  return `@${label}`
}

/**
 * Resolve one occurrence's occupied draft range across both DSH reference
 * representations: current full `@label` text with `length`, and the legacy
 * one-code-unit U+FFFC placeholder without it.
 */
export function occurrenceRange(
  snapshot: ParentComposerInputSnapshot,
  occurrence: ParentComposerOccurrence,
  expectedLabel: string,
): OccurrenceRange | undefined {
  const start = occurrence.offset
  if (!Number.isSafeInteger(start) || start < 0 || start > snapshot.draft.length) return

  if (occurrence.length !== undefined
    && Number.isSafeInteger(occurrence.length)
    && occurrence.length > 0
    && start + occurrence.length <= snapshot.draft.length) {
    return { start, end: start + occurrence.length }
  }

  if (snapshot.draft.startsWith(LEGACY_REFERENCE_PLACEHOLDER, start)) {
    return { start, end: start + LEGACY_REFERENCE_PLACEHOLDER.length }
  }

  const display = referenceDisplayText(expectedLabel)
  if (snapshot.draft.startsWith(display, start)) return { start, end: start + display.length }
  return
}

export function occurrenceMatchesDraft(
  snapshot: ParentComposerInputSnapshot,
  occurrence: ParentComposerOccurrence,
  expectedLabel: string,
): boolean {
  const range = occurrenceRange(snapshot, occurrence, expectedLabel)
  if (range === undefined) return false
  const text = snapshot.draft.slice(range.start, range.end)
  return text === LEGACY_REFERENCE_PLACEHOLDER || text === referenceDisplayText(expectedLabel)
}

/** Find the exact occurrence minted by one synchronous insertReference call. */
export function newlyInsertedOccurrence(
  before: ParentComposerInputSnapshot,
  after: ParentComposerInputSnapshot,
  source: string,
  ref: string,
): ParentComposerOccurrence | undefined {
  const previousIds = new Set(before.occurrences.map(occurrence => occurrence.occurrenceId))
  const inserted = after.occurrences.filter(occurrence => !previousIds.has(occurrence.occurrenceId)
    && occurrence.source === source
    && occurrence.ref === ref)
  return inserted.length === 1 ? inserted[0] : undefined
}

/** Remove one occurrence's display range and, optionally, its separating ASCII gap. */
export function draftWithoutOccurrence(
  snapshot: ParentComposerInputSnapshot,
  occurrence: ParentComposerOccurrence,
  expectedLabel: string,
  options: { readonly consumeAdjacentSpace?: boolean } = {},
): string | undefined {
  const range = occurrenceRange(snapshot, occurrence, expectedLabel)
  if (range === undefined) return
  let { start, end } = range
  if (options.consumeAdjacentSpace === true) {
    if (snapshot.draft[end] === ' ') end += 1
    else if (start > 0 && snapshot.draft[start - 1] === ' ') start -= 1
  }
  return snapshot.draft.slice(0, start) + snapshot.draft.slice(end)
}
