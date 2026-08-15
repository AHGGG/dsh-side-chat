import type {
  ConversationSelection,
  SessionId,
  SideChatModelSelection,
  SideChatPromptPart,
  SideChatWireError,
} from '../shared/contracts.js'
import type { HostObservable } from '../shared/observable.js'

export interface SideChatSessionSnapshot {
  readonly status: 'idle' | 'running' | 'needs-input' | 'needs-approval' | 'failed' | 'interrupted'
}

export interface SideChatQuestionAnswer {
  readonly answers: readonly {
    readonly id: string
    readonly selected: readonly string[]
    readonly custom?: string
  }[]
}

export interface SideChatSessionBinding extends HostObservable<SideChatSessionSnapshot> {
  readonly sessionId: SessionId
  prompt(
    content: readonly SideChatPromptPart[],
    mode: 'queue' | 'steer',
  ): Promise<{ readonly ok: true } | { readonly ok: false; readonly error: SideChatWireError }>
  updateQueue(
    itemId: string,
    action: { readonly kind: 'edit'; readonly content: readonly SideChatPromptPart[] }
      | { readonly kind: 'remove' }
      | { readonly kind: 'steer' },
  ): Promise<{ readonly ok: true } | { readonly ok: false; readonly error: SideChatWireError }>
  cancel(): Promise<{ readonly ok: true } | { readonly ok: false; readonly error: SideChatWireError }>
  respondApproval(
    interactionId: string,
    decision: 'approve' | 'decline',
  ): Promise<{ readonly ok: true } | { readonly ok: false; readonly error: SideChatWireError }>
  respondQuestion(
    interactionId: string,
    answer: SideChatQuestionAnswer | null,
  ): Promise<{ readonly ok: true } | { readonly ok: false; readonly error: SideChatWireError }>
}

export interface SideChatSessionLease {
  readonly sessionId: SessionId
  readonly binding: SideChatSessionBinding
  release(): void
}

export interface SideChatClientSessions {
  currentSessionId(): SessionId | undefined
  lastCompletedSeq(parentSessionId: SessionId): number | undefined
  selectionIsCurrent(selection: ConversationSelection): boolean
  sideChatModelPreference(): SideChatModelSelection | undefined
  rememberSideChatModelPreference(selection: SideChatModelSelection): void
  retain(sessionId: SessionId): Promise<SideChatSessionLease>
  openSession(sessionId: SessionId): Promise<void>
  notify(message: { readonly kind: 'status' | 'warning'; readonly text: string }): void
}

export type SideChatActionResult<T = void> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SideChatWireError }
