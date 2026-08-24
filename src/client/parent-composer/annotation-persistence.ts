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
  readonly projection?: string
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

function mirrorDraft(record: StoredAnnotationDraft): string | undefined {
  return record.version === 1 ? record.projection : record.mirrorDraft
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
      const storedMirrorDraft = mirrorDraft(stored)
      const exactMirrorDraft = storedMirrorDraft !== undefined && snapshot.draft === storedMirrorDraft
      if (exactDisplayDraft || exactMirrorDraft) {
        this.observedSessions.add(key)
        const restored = restoreConversationAnnotationReference(
          input,
          stored.ref,
          storedMirrorDraft,
          stored.version === 2 ? stored.baseDraft : undefined,
        )
        if (restored) return
        // A refused insertion may move an exact display record to its exact
        // mirror. Keep either v1 or v2 storage retryable from that safe state.
        if (storedMirrorDraft !== undefined
          && input.state.getSnapshot().draft === storedMirrorDraft) return
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
        readonly projection?: unknown
        readonly displayDraft?: unknown
        readonly mirrorDraft?: unknown
        readonly baseDraft?: unknown
        readonly ref?: unknown
      }
      if (value.version === 1
        && typeof value.draft === 'string'
        && typeof value.ref === 'string'
        && (value.projection === undefined || typeof value.projection === 'string')) {
        return {
          version: 1,
          draft: value.draft,
          ...(value.projection === undefined ? {} : { projection: value.projection }),
          ref: value.ref,
        }
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
