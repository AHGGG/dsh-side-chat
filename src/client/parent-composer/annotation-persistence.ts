import type { SessionId } from '../../shared/contracts.js'
import {
  conversationAnnotationReference,
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

interface StoredAnnotationDraft {
  readonly version: 1
  readonly draft: string
  readonly ref: string
}

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

function recordOf(snapshot: ParentComposerInputSnapshot): StoredAnnotationDraft | undefined {
  const ref = conversationAnnotationReference(snapshot)
  return ref === undefined ? undefined : { version: 1, draft: snapshot.draft, ref }
}

/** Tab-scoped recovery for rc.6 drafts that persist U+FFFC without occurrences. */
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
    if (stored !== undefined && snapshot.draft === stored.draft) {
      this.observedSessions.add(key)
      if (restoreConversationAnnotationReference(input, stored.ref)) return
      this.remove(key)
      removeOrphanedConversationAnnotationPlaceholder(input)
      return
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
      const value = JSON.parse(raw) as Partial<StoredAnnotationDraft>
      return value.version === 1 && typeof value.draft === 'string' && typeof value.ref === 'string'
        ? { version: 1, draft: value.draft, ref: value.ref }
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
