import type { SessionFace as CurrentSessionFace } from '@deepseek-ai/dsh-api-session-controller/client'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import type {
  AssistantBlock,
  ConversationNode,
  PartialAssistant,
  RunningToolCall,
  ToolCallBlock,
} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  AskUserQuestionAnswer,
  AskUserQuestionItem,
} from '@deepseek-ai/dsh-user-questions/types'

export type {
  AssistantBlock,
  ConversationNode,
  RunningToolCall,
  ToolCallBlock,
}

interface RuntimeFailure {
  readonly code: string
  readonly message: string
}

export type RuntimeResult<T = unknown> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: RuntimeFailure }

interface ObservableSnapshot<T> {
  readonly getSnapshot: () => T
  readonly subscribe: (listener: () => void) => () => void
}

export interface SideChatNodeStore {
  get(key: string): {
    readonly key: string
    readonly kind: string
    readonly anchorSeq: number
    readonly visibility: 'visible' | 'hidden'
    readonly location:
      | { readonly kind: 'session' | 'unresolved' }
      | {
          readonly kind: 'turn'
          readonly turn: { readonly turn: number; readonly status: 'open' | 'closed' | 'unknown' }
        }
      | {
          readonly kind: 'step'
          readonly turn: { readonly turn: number; readonly status: 'open' | 'closed' | 'unknown' }
          readonly step: { readonly status: 'open' | 'closed' | 'unknown' }
        }
  } | undefined
}

export interface SideChatApprovalInteraction {
  readonly kind: 'approval'
  readonly key: string
  readonly toolName: string
  readonly reason?: string
  respond(decision: 'approve' | 'decline'): Promise<boolean>
}

export interface SideChatQuestionInteraction {
  readonly kind: 'question'
  readonly key: string
  readonly questions: readonly AskUserQuestionItem[]
  respond(answer: AskUserQuestionAnswer | null): Promise<boolean>
}

export type SideChatPendingInteraction =
  | SideChatApprovalInteraction
  | SideChatQuestionInteraction

export interface SideChatQueuedMessage {
  readonly id: string
  readonly placement: 'queued' | 'steering' | 'context'
  readonly preview: string
}

export interface SideChatConversationSnapshot {
  readonly nodes: readonly ConversationNode[]
  readonly turnEnds: ReadonlyMap<number, number>
  readonly partial: PartialAssistant | null
  readonly runningCalls: readonly RunningToolCall[]
  readonly pending: readonly SideChatPendingInteraction[]
  readonly queue: readonly SideChatQueuedMessage[]
  readonly running: boolean
  readonly openState: 'cold' | 'loading' | 'open' | 'error'
  readonly promptError: { readonly error: RuntimeFailure } | null
  readonly lastAgentError: string | null
  readonly chatNodes: SideChatNodeStore
}

/** Stable surface consumed by Side Chat on both the monolithic and split DSH clients. */
export interface SideChatConversationFace extends ObservableSnapshot<SideChatConversationSnapshot> {
  readonly sessionId: SessionId
  prompt(content: unknown[], mode: 'queue' | 'steer'): Promise<RuntimeResult>
  updateQueue(itemId: string, action: unknown): Promise<RuntimeResult>
  cancel(): Promise<RuntimeResult>
  rename(title: string): Promise<RuntimeResult>
  open(): Promise<void>
}

interface LegacyApprovalWait {
  readonly kind: 'approval'
  readonly key: string
  readonly sessionId: SessionId
  readonly payload: {
    readonly approvalId: string
    readonly toolName: string
    readonly reason?: string
  }
  respond(result: unknown): Promise<{ readonly accepted: boolean }>
}

interface LegacyQuestionWait {
  readonly kind: 'question'
  readonly key: string
  readonly sessionId: SessionId
  readonly payload: { readonly questions: readonly AskUserQuestionItem[] }
  respond(result: unknown): Promise<{ readonly accepted: boolean }>
}

type LegacyPendingWait = LegacyApprovalWait | LegacyQuestionWait

interface CurrentApprovalWait {
  readonly kind: 'approval'
  readonly key: string
  readonly toolName: string
  readonly reason?: string
  answer(outcome: 'allowed-once' | 'rejected'): Promise<void>
}

interface CurrentQuestionWait {
  readonly kind: 'question' | 'plan-review'
  readonly key: string
  readonly questions: readonly AskUserQuestionItem[]
  answer(answer: AskUserQuestionAnswer): Promise<void>
  cancel(): Promise<void>
}

type CurrentPendingWait = CurrentApprovalWait | CurrentQuestionWait

interface LegacyConversationSnapshot {
  readonly nodes: readonly ConversationNode[]
  readonly turnEnds: ReadonlyMap<number, number>
  readonly partial: PartialAssistant | null
  readonly runningCalls: readonly RunningToolCall[]
  readonly pending: readonly LegacyPendingWait[]
  readonly queue: SideChatConversationSnapshot['queue']
  readonly running: boolean
  readonly openState: SideChatConversationSnapshot['openState']
  readonly promptError: SideChatConversationSnapshot['promptError']
  readonly lastAgentError: string | null
  readonly chat: { readonly nodes: SideChatNodeStore }
}

interface RuntimeSessionFace {
  readonly sessionId: SessionId
  getSnapshot(): unknown
  subscribe(listener: () => void): () => void
  prompt(content: unknown[], mode: 'queue' | 'steer'): Promise<RuntimeResult>
  updateQueue(itemId: string, action: unknown): Promise<RuntimeResult>
  cancel(): Promise<RuntimeResult>
  rename(title: string): Promise<RuntimeResult>
  open?: () => Promise<void>
}

const EMPTY_NODES: readonly ConversationNode[] = []
const EMPTY_TURN_ENDS: ReadonlyMap<number, number> = new Map()
const EMPTY_RUNNING_CALLS: readonly RunningToolCall[] = []
const EMPTY_PENDING: readonly SideChatPendingInteraction[] = []
const EMPTY_NODE_STORE: SideChatNodeStore = { get: () => undefined }

function isLegacySnapshot(snapshot: unknown): snapshot is LegacyConversationSnapshot {
  return typeof snapshot === 'object'
    && snapshot !== null
    && Array.isArray((snapshot as { readonly nodes?: unknown }).nodes)
    && Array.isArray((snapshot as { readonly pending?: unknown }).pending)
}

function currentPending(
  source: ReadonlyMap<SessionId, unknown> | undefined,
  sessionId: SessionId,
): CurrentPendingWait | undefined {
  const pending = source?.get(sessionId)
  if (typeof pending !== 'object' || pending === null) return
  const candidate = pending as Partial<CurrentPendingWait>
  if (candidate.kind === 'approval'
    && typeof candidate.key === 'string'
    && typeof candidate.toolName === 'string'
    && typeof candidate.answer === 'function') {
    return pending as CurrentApprovalWait
  }
  if ((candidate.kind === 'question' || candidate.kind === 'plan-review')
    && typeof candidate.key === 'string'
    && Array.isArray(candidate.questions)
    && typeof candidate.answer === 'function'
    && typeof candidate.cancel === 'function') {
    return pending as CurrentQuestionWait
  }
  return undefined
}

function normalizeLegacyPending(wait: LegacyPendingWait): SideChatPendingInteraction {
  if (wait.kind === 'approval') {
    return {
      kind: 'approval',
      key: wait.key,
      toolName: wait.payload.toolName,
      ...(wait.payload.reason === undefined ? {} : { reason: wait.payload.reason }),
      respond: async (decision) => {
        const receipt = await wait.respond({
          ok: true,
          value: {
            sessionId: wait.sessionId,
            approvalId: wait.payload.approvalId,
            outcome: decision === 'approve' ? 'allowed-once' : 'rejected',
          },
        })
        return receipt.accepted
      },
    }
  }
  return {
    kind: 'question',
    key: wait.key,
    questions: wait.payload.questions,
    respond: async (answer) => {
      const receipt = await wait.respond(answer === null
        ? {
            ok: false,
            error: { code: 'cancelled', message: 'Question cancelled.', details: {} },
          }
        : {
            ok: true,
            value: { sessionId: wait.sessionId, answer },
          })
      return receipt.accepted
    },
  }
}

function normalizeCurrentPending(wait: CurrentPendingWait): SideChatPendingInteraction {
  if (wait.kind === 'approval') {
    return {
      kind: 'approval',
      key: wait.key,
      toolName: wait.toolName,
      ...(wait.reason === undefined ? {} : { reason: wait.reason }),
      respond: async (decision) => {
        await wait.answer(decision === 'approve' ? 'allowed-once' : 'rejected')
        return true
      },
    }
  }
  return {
    kind: 'question',
    key: wait.key,
    questions: wait.questions,
    respond: async (answer) => {
      if (answer === null) await wait.cancel()
      else await wait.answer(answer)
      return true
    },
  }
}

interface SnapshotCache {
  readonly session: unknown
  readonly chat: ChatSnapshot | undefined
  readonly pending: ReadonlyMap<SessionId, unknown> | undefined
  readonly value: SideChatConversationSnapshot
}

/** Bridge DSH <=0.1.1's combined Session snapshot and 0.1.2's split stores. */
export class CompatibleConversationFace implements SideChatConversationFace {
  readonly sessionId: SessionId
  private cache: SnapshotCache | undefined

  constructor(
    private readonly session: RuntimeSessionFace,
    private readonly chat?: ObservableSnapshot<ChatSnapshot | undefined>,
    private readonly pending?: ObservableSnapshot<ReadonlyMap<SessionId, unknown>>,
  ) {
    this.sessionId = session.sessionId
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    const removers = [this.session.subscribe(listener)]
    if (this.chat !== undefined) removers.push(this.chat.subscribe(listener))
    if (this.pending !== undefined) removers.push(this.pending.subscribe(listener))
    return () => {
      for (const remove of removers) remove()
    }
  }

  readonly getSnapshot = (): SideChatConversationSnapshot => {
    const session = this.session.getSnapshot()
    if (isLegacySnapshot(session)) {
      if (this.cache?.session === session) return this.cache.value
      const value: SideChatConversationSnapshot = {
        nodes: session.nodes,
        turnEnds: session.turnEnds,
        partial: session.partial,
        runningCalls: session.runningCalls,
        pending: session.pending.map(normalizeLegacyPending),
        queue: session.queue,
        running: session.running,
        openState: session.openState,
        promptError: session.promptError,
        lastAgentError: session.lastAgentError,
        chatNodes: session.chat.nodes,
      }
      this.cache = { session, chat: undefined, pending: undefined, value }
      return value
    }

    const lifecycle = session as ReturnType<CurrentSessionFace['getSnapshot']>
    const chat = this.chat?.getSnapshot()
    const pending = this.pending?.getSnapshot()
    const cached = this.cache
    if (cached !== undefined
      && cached.session === session
      && cached.chat === chat
      && cached.pending === pending) {
      return cached.value
    }
    const legacy = chat?.legacy
    const wait = currentPending(pending, this.sessionId)
    const value: SideChatConversationSnapshot = {
      nodes: legacy?.nodes ?? EMPTY_NODES,
      turnEnds: legacy?.turnEnds ?? EMPTY_TURN_ENDS,
      partial: legacy?.partial ?? null,
      runningCalls: legacy?.runningCalls ?? EMPTY_RUNNING_CALLS,
      pending: wait === undefined ? EMPTY_PENDING : [normalizeCurrentPending(wait)],
      queue: lifecycle.queue as SideChatConversationSnapshot['queue'],
      running: lifecycle.running,
      openState: lifecycle.openState,
      promptError: lifecycle.promptError,
      lastAgentError: lifecycle.lastAgentError,
      chatNodes: chat?.nodes ?? EMPTY_NODE_STORE,
    }
    this.cache = { session, chat, pending, value }
    return value
  }

  prompt(content: unknown[], mode: 'queue' | 'steer'): Promise<RuntimeResult> {
    return this.session.prompt(content, mode)
  }

  updateQueue(itemId: string, action: unknown): Promise<RuntimeResult> {
    return this.session.updateQueue(itemId, action)
  }

  cancel(): Promise<RuntimeResult> {
    return this.session.cancel()
  }

  rename(title: string): Promise<RuntimeResult> {
    return this.session.rename(title)
  }

  async open(): Promise<void> {
    await this.session.open?.call(this.session)
  }
}

export function compatibleConversationFace(
  session: CurrentSessionFace,
  sources: {
    readonly chat?: ObservableSnapshot<ChatSnapshot | undefined>
    readonly pending?: ObservableSnapshot<ReadonlyMap<SessionId, unknown>>
  } = {},
): CompatibleConversationFace {
  return new CompatibleConversationFace(
    session as unknown as RuntimeSessionFace,
    sources.chat,
    sources.pending,
  )
}
