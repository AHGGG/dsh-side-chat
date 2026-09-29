import type { ConversationSelection, SessionId, SideChatModelSelection, SideChatWireError } from '../shared/contracts.js'

/** Parent-only DSH integration. Side discussions never retain a child Session. */
export interface SideChatClientSessions {
  currentSessionId(): SessionId | undefined
  lastCompletedSeq(parentSessionId: SessionId): number | undefined
  selectionIsCurrent(selection: ConversationSelection): boolean
  sideChatModelPreference(): SideChatModelSelection | undefined
  rememberSideChatModelPreference(selection: SideChatModelSelection): void
  retainParent(sessionId: SessionId): () => void
  openSession(sessionId: SessionId): Promise<void>
  notify(message: { readonly kind: 'status' | 'warning'; readonly text: string }): void
}
export type SideChatActionResult<T = void> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SideChatWireError }
