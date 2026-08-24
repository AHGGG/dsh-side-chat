import type { SessionId } from '../../shared/contracts.js'
import {
  conversationAnnotationRecoveryRecord,
  removeOrphanedConversationAnnotationPlaceholder,
  restoreConversationAnnotationReference,
} from './add-to-conversation.js'
import type { ParentComposerInput, ParentComposerInputSnapshot } from './add-to-conversation.js'

const STORAGE_PREFIX = 'dsh-side-chat:composer-annotations:'

interface AnnotationStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

interface StoredAnnotationDraftV1 {
  readonly version: 1
  readonly draft: string
  readonly ref: string
}

interface StoredAnnotationDraftV2 {
  readonly version: 2
  readonly displayDraft: string
  readonly mirrorDraft: string
  readonly baseDraft: string
  readonly ref: string
}

type StoredAnnotationDraft = StoredAnnotationDraftV1 | StoredAnnotationDraftV2

function browserSessionStorage(): AnnotationStorage | undefined {
  if (typeof window === 'undefined') return
  try {
    return window.sessionStorage
  } catch {
    return
  }
}

function storageKey(sessionId: SessionId): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(sessionId)}`
}

function recordOf(snapshot: ParentComposerInputSnapshot): StoredAnnotationDraftV2 | undefined {
  const record = conversationAnnotationRecoveryRecord(snapshot)
  return record === undefined ? undefined : { version: 2, ...record }
}

function displayDraft(record: StoredAnnotationDraft): string {
  return record.version === 1 ? record.draft : record.displayDraft
}

/** Tab-scoped recovery for drafts persisted as a reference clipboard projection. */
export class ConversationAnnotationPersistence {
  private readonly observedSessions = new Set<string>()

  constructor(private readonly storage: AnnotationStorage | undefined = browserSessionStorage()) {}

  reconcile(sessionId: SessionId, input: ParentComposerInput): void {
    const key = storageKey(sessionId)
    const snapshot = input.state.getSnapshot()
    const current = recordOf(snapshot)
    if (current !== undefined) {
      this.observedSessions.add(key)
      this.write(key, current)
      return
    }

    const stored = this.read(key)
    if (stored !== undefined) {
      const exactDisplayDraft = snapshot.draft === displayDraft(stored)
      const exactMirrorDraft = stored.version === 2 && snapshot.draft === stored.mirrorDraft
      if (exactDisplayDraft || exactMirrorDraft) {
        this.observedSessions.add(key)
        const restored = restoreConversationAnnotationReference(
          input,
          stored.ref,
          stored.version === 2 ? stored.mirrorDraft : undefined,
          stored.version === 2 ? stored.baseDraft : undefined,
        )
        if (restored) return
        // Keep v2 mirror text recoverable after a transient insert refusal. A
        // malformed or stale display record is removed and sanitized instead.
        if (exactMirrorDraft && input.state.getSnapshot().draft === stored.mirrorDraft) return
        this.remove(key)
        removeOrphanedConversationAnnotationPlaceholder(input)
        return
      }
    }

    // A live occurrence disappeared in this plugin lifetime: removal or send
    // is authoritative, including the transition to an empty draft.
    if (this.observedSessions.has(key)) {
      this.remove(key)
      removeOrphanedConversationAnnotationPlaceholder(input)
      return
    }

    // A new shell starts empty before ConversationSession seeds its persisted
    // draft. Keep the tab record until that one mount-time adoption occurs.
    if (stored !== undefined && snapshot.draft === '') return
    if (stored !== undefined) this.remove(key)
    removeOrphanedConversationAnnotationPlaceholder(input)
  }

  private read(key: string): StoredAnnotationDraft | undefined {
    if (this.storage === undefined) return
    try {
      const raw = this.storage.getItem(key)
      if (raw === null) return
      const value = JSON.parse(raw) as {
        readonly version?: unknown
        readonly draft?: unknown
        readonly displayDraft?: unknown
        readonly mirrorDraft?: unknown
        readonly baseDraft?: unknown
        readonly ref?: unknown
      }
      if (value.version === 1 && typeof value.draft === 'string' && typeof value.ref === 'string') {
        return { version: 1, draft: value.draft, ref: value.ref }
      }
      return value.version === 2
        && typeof value.displayDraft === 'string'
        && typeof value.mirrorDraft === 'string'
        && typeof value.baseDraft === 'string'
        && typeof value.ref === 'string'
        ? {
            version: 2,
            displayDraft: value.displayDraft,
            mirrorDraft: value.mirrorDraft,
            baseDraft: value.baseDraft,
            ref: value.ref,
          }
        : undefined
    } catch {
      return
    }
  }

  private write(key: string, record: StoredAnnotationDraft): void {
    if (this.storage === undefined) return
    try {
      this.storage.setItem(key, JSON.stringify(record))
    } catch {
      // Draft recovery is best-effort; the orphan-prefix guard remains active.
    }
  }

  private remove(key: string): void {
    if (this.storage === undefined) return
    try {
      this.storage.removeItem(key)
    } catch {
      // Storage denial must not block composer cleanup.
    }
  }
}
