import type { SessionId } from '../../shared/contracts.js'
import { SELECTION_REFERENCE_SOURCE } from './add-to-conversation.js'
import { SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE } from './referenced-conversation.js'
import type { ParentComposerInput, ParentComposerInputSnapshot, ParentComposerOccurrence } from './composer-reference.js'

const STORAGE_PREFIX = 'dsh-side-chat:composer-references:'
interface ReferenceStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
interface StoredDraft {
  readonly version: 1
  readonly draft: string
  readonly occurrences: readonly ParentComposerOccurrence[]
}
function browserSessionStorage(): ReferenceStorage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.sessionStorage } catch { return }
}
function ownsReference(snapshot: ParentComposerInputSnapshot): boolean {
  return snapshot.occurrences.some(occurrence => occurrence.source === SELECTION_REFERENCE_SOURCE
    || occurrence.source === SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE)
}
function validOccurrences(draft: string, value: unknown): value is readonly ParentComposerOccurrence[] {
  if (!Array.isArray(value) || value.length === 0) return false
  let end = 0
  return value.every((candidate: unknown) => {
    if (typeof candidate !== 'object' || candidate === null) return false
    const item = candidate as ParentComposerOccurrence
    if (!Number.isSafeInteger(item.offset) || !Number.isSafeInteger(item.length)
      || item.offset < end || item.length < 0 || item.offset + item.length > draft.length
      || typeof item.source !== 'string' || typeof item.ref !== 'string'
      || typeof item.label !== 'string' || typeof item.clipboardText !== 'string'
      || draft.slice(item.offset, item.offset + item.length) !== item.clipboardText
      || (item.appearance !== undefined && !['session', 'file', 'folder'].includes(item.appearance))) return false
    end = item.offset + item.length
    return true
  })
}

/** Recover the complete reference-bearing draft, not only a leading annotation.
 * DSH persists clipboard text, so conversation chips need recovery as well. */
export class ConversationAnnotationPersistence {
  private readonly observedInputs = new WeakSet<ParentComposerInput>()
  private reconciling = false
  constructor(private readonly storage: ReferenceStorage | undefined = browserSessionStorage()) {}

  reconcile(sessionId: SessionId, input: ParentComposerInput): void {
    if (this.reconciling || this.storage === undefined) return
    this.reconciling = true
    const key = STORAGE_PREFIX + encodeURIComponent(sessionId)
    try {
      const snapshot = input.state.getSnapshot()
      if (ownsReference(snapshot)) {
        this.observedInputs.add(input)
        this.storage.setItem(key, JSON.stringify({ version: 1, draft: snapshot.draft, occurrences: snapshot.occurrences } satisfies StoredDraft))
        return
      }
      // Deleting a chip in the same editor is authoritative. Never resurrect
      // it just because its plain-text clipboard projection is unchanged.
      if (this.observedInputs.has(input)) {
        this.storage.removeItem(key)
        return
      }
      const raw = this.storage.getItem(key)
      if (raw === null) return
      const stored = JSON.parse(raw) as StoredDraft | null
      if (stored === null || stored.version !== 1 || typeof stored.draft !== 'string'
        || !validOccurrences(stored.draft, stored.occurrences)) {
        this.storage.removeItem(key)
        return
      }
      // A fresh Session shell starts empty before its persisted draft is seeded.
      if (snapshot.draft === '') return
      if (snapshot.draft !== stored.draft || snapshot.occurrences.length !== 0) {
        this.storage.removeItem(key)
        return
      }
      if (snapshot.phase !== undefined && snapshot.phase !== 'plain') return
      if (this.restore(input, stored)) this.observedInputs.add(input)
    } catch {
      // Storage denial or a stale codec must not alter or erase the user's draft.
    } finally {
      this.reconciling = false
    }
  }

  private restore(input: ParentComposerInput, stored: StoredDraft): boolean {
    let ownedSnapshot: ParentComposerInputSnapshot | undefined
    let complete = false
    try {
      // Right-to-left edits leave every unprocessed clipboard offset unchanged.
      for (const occurrence of [...stored.occurrences].reverse()) {
        const before = input.state.getSnapshot()
        if (before.draft !== stored.draft) return false
        if (!input.insertReference({
          source: occurrence.source, ref: occurrence.ref, label: occurrence.label,
          clipboardText: occurrence.clipboardText,
          ...(occurrence.appearance === undefined ? {} : { appearance: occurrence.appearance }),
        }, { start: occurrence.offset, end: occurrence.offset + occurrence.length, draftRev: before.draftRev })) return false
        const after = input.state.getSnapshot()
        const addedGap = stored.draft[occurrence.offset + occurrence.length] !== ' '
        const expected = addedGap
          ? stored.draft.slice(0, occurrence.offset + occurrence.length) + ' '
            + stored.draft.slice(occurrence.offset + occurrence.length)
          : stored.draft
        if (after.draft !== expected) return false
        ownedSnapshot = after
        if (addedGap) {
          if (!input.replaceText('', {
            start: occurrence.offset + 1, end: occurrence.offset + 2, draftRev: after.draftRev,
          })) return false
          const normalized = input.state.getSnapshot()
          if (normalized.draft !== stored.draft) return false
          ownedSnapshot = normalized
        }
      }
      complete = true
      return true
    } finally {
      // Keep a refused multi-chip restoration retryable; don't save a partial
      // projection, and don't roll back edits from synchronous subscribers.
      const current = input.state.getSnapshot()
      if (!complete && ownedSnapshot === current) {
        const length = current.draft.length - current.occurrences.reduce((sum, item) => sum + item.length - 1, 0)
        input.replaceText(stored.draft, { start: 0, end: length, draftRev: current.draftRev })
      }
    }
  }
}
