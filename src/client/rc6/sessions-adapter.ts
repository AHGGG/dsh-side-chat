import type {
  ConversationLocation,
  ConversationSnapshot,
  Session as ConcreteSession,
  SessionFace,
  SessionBinding,
} from '@deepseek-ai/dsh-client-runtime/client'
import type {
  MessageId,
  PromptContentPart,
  QueueAction,
  RpcError,
  SessionId as DshSessionId,
} from '@deepseek-ai/dsh-api-remotes/client'
import type { AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions/types'
import type {
  SideChatClientSessions,
  SideChatQuestionAnswer,
  SideChatSessionBinding,
  SideChatSessionLease,
  SideChatSessionSnapshot,
} from '../contracts.js'
import type {
  ConversationSelection,
  SessionId,
  SideChatPromptPart,
  SideChatWireError,
} from '../../shared/contracts.js'
import { SessionId as sideChatSessionId } from '../../shared/contracts.js'
import {
  addSelectionToConversation as addSelectionToParentComposer,
  conversationAnnotations,
  removeConversationAnnotations as removeParentConversationAnnotations,
  updateConversationAnnotation as updateParentConversationAnnotation,
} from '../parent-composer/add-to-conversation.js'
import type {
  ParentComposerInput,
  ParentComposerInputSnapshot,
} from '../parent-composer/add-to-conversation.js'
import { ConversationAnnotationPersistence } from '../parent-composer/annotation-persistence.js'
import type { Rc6ClientContext } from './context.js'

const BINDING_WAIT_MS = 8_000

function sideChatError(error: RpcError, fallback: SideChatWireError['code']): SideChatWireError {
  return {
    code: error.code === 'session-not-found' ? 'side_chat_not_found' : fallback,
    message: error.message,
    recoverable: error.code !== 'bad-request',
  }
}

function operationError(code: SideChatWireError['code'], message: string): SideChatWireError {
  return { code, message, recoverable: true }
}

function dshSessionId(id: SessionId): DshSessionId {
  return id as unknown as DshSessionId
}

function latestCompleted(snapshot: ConversationSnapshot): number | undefined {
  let latest: number | undefined
  for (const seq of snapshot.turnEnds.values()) {
    if (latest === undefined || seq > latest) latest = seq
  }
  return latest
}

function locationSettled(location: ConversationLocation): boolean {
  if (location.kind === 'turn') return location.turn.status === 'closed'
  if (location.kind === 'step') return location.turn.status === 'closed' && location.step.status === 'closed'
  return false
}

function childSnapshot(face: SessionFace): SideChatSessionSnapshot {
  const snapshot = face.getSnapshot()
  const pending = snapshot.pending[0]
  const status: SideChatSessionSnapshot['status'] = pending?.kind === 'approval'
    ? 'needs-approval'
    : pending?.kind === 'question'
      ? 'needs-input'
      : snapshot.openState === 'error' || snapshot.lastAgentError !== null
        ? 'failed'
        : snapshot.running
          ? 'running'
          : 'idle'
  return { status }
}

class Rc6SessionBinding implements SideChatSessionBinding {
  readonly sessionId: SessionId

  constructor(readonly face: SessionFace) {
    this.sessionId = sideChatSessionId(face.sessionId)
  }

  getSnapshot = (): SideChatSessionSnapshot => childSnapshot(this.face)

  subscribe = (listener: () => void): (() => void) => this.face.subscribe(listener)

  async prompt(content: readonly SideChatPromptPart[], mode: 'queue' | 'steer') {
    const result = await this.face.prompt(content.map(part => ({ ...part })) as PromptContentPart[], mode)
    return result.ok
      ? { ok: true as const }
      : { ok: false as const, error: sideChatError(result.error, 'side_chat_prompt_failed') }
  }

  async updateQueue(
    itemId: string,
    action: { readonly kind: 'edit'; readonly content: readonly SideChatPromptPart[] }
      | { readonly kind: 'remove' }
      | { readonly kind: 'steer' },
  ) {
    if (action.kind === 'edit' && action.content.some(part => part.type !== 'text')) {
      return {
        ok: false as const,
        error: operationError('invalid_request', 'Queued image messages cannot be edited in the Side Chat panel.'),
      }
    }
    const normalized: QueueAction = action.kind === 'edit'
      ? { kind: 'edit', content: action.content.map(part => ({ type: 'text', text: part.type === 'text' ? part.text : '' })) }
      : action
    const result = await this.face.updateQueue(itemId as MessageId, normalized)
    return result.ok
      ? { ok: true as const }
      : { ok: false as const, error: sideChatError(result.error, 'side_chat_prompt_failed') }
  }

  async cancel() {
    const result = await this.face.cancel()
    return result.ok
      ? { ok: true as const }
      : { ok: false as const, error: sideChatError(result.error, 'side_chat_interrupt_failed') }
  }

  async respondApproval(interactionId: string, decision: 'approve' | 'decline') {
    const wait = this.face.getSnapshot().pending
      .find(item => item.key === interactionId && item.kind === 'approval') as
        | Extract<ConversationSnapshot['pending'][number], { kind: 'approval' }>
        | undefined
    if (wait === undefined) {
      return { ok: false as const, error: operationError('invalid_request', 'The approval is no longer pending.') }
    }
    try {
      const receipt = await wait.respond({
        ok: true,
        value: {
          sessionId: wait.sessionId,
          approvalId: wait.payload.approvalId,
          outcome: decision === 'approve' ? 'allowed-once' : 'rejected',
        },
      })
      return receipt.accepted
        ? { ok: true as const }
        : { ok: false as const, error: operationError('transport_error', 'The approval response arrived too late.') }
    } catch {
      return { ok: false as const, error: operationError('transport_error', 'The approval response failed.') }
    }
  }

  async respondQuestion(interactionId: string, answer: SideChatQuestionAnswer | null) {
    const wait = this.face.getSnapshot().pending
      .find(item => item.key === interactionId && item.kind === 'question') as
        | Extract<ConversationSnapshot['pending'][number], { kind: 'question' }>
        | undefined
    if (wait === undefined) {
      return { ok: false as const, error: operationError('invalid_request', 'The question is no longer pending.') }
    }
    try {
      const result = answer === null
        ? {
            ok: false as const,
            error: { code: 'cancelled' as const, message: 'Question cancelled.', details: {} },
          }
        : {
            ok: true as const,
            value: {
              sessionId: wait.sessionId,
              answer: {
                answers: answer.answers.map(item => ({
                  id: item.id,
                  selected: [...item.selected],
                  ...(item.custom === undefined ? {} : { custom: item.custom }),
                })),
              } satisfies AskUserQuestionAnswer,
            },
          }
      const receipt = await wait.respond(result)
      return receipt.accepted
        ? { ok: true as const }
        : { ok: false as const, error: operationError('transport_error', 'The question response arrived too late.') }
    } catch {
      return { ok: false as const, error: operationError('transport_error', 'The question response failed.') }
    }
  }
}

/** Adapter over rc.6's public SessionRuntime and exported concrete Session type. */
export class Rc6SideChatSessions implements SideChatClientSessions {
  private readonly renamed = new Set<SessionId>()
  private readonly annotationPersistence = new ConversationAnnotationPersistence()

  constructor(private readonly ctx: Rc6ClientContext) {}

  /** Observable rc.6 Session-list surface used to follow main-session switches. */
  readonly subscribeList = (listener: () => void): (() => void) => this.ctx.sessions.list.subscribe(listener)

  /** Follow both current-session switches and that session's composer state. */
  readonly subscribeConversationInput = (listener: () => void): (() => void) => {
    let input: ParentComposerInput | undefined
    let removeInputListener = (): void => {}
    const bindInput = (): void => {
      const next = this.currentParentInput()
      if (next === input) return
      removeInputListener()
      input = next
      removeInputListener = input?.state.subscribe?.(listener) ?? (() => {})
    }
    bindInput()
    const removeListListener = this.ctx.sessions.list.subscribe(() => {
      bindInput()
      listener()
    })
    return () => {
      removeListListener()
      removeInputListener()
    }
  }

  readonly currentConversationInputSnapshot = (): ParentComposerInputSnapshot | undefined =>
    this.currentParentInput()?.state.getSnapshot()

  currentSessionId(): SessionId | undefined {
    const current = this.ctx.sessions.list.getSnapshot().current
    return current === undefined ? undefined : sideChatSessionId(current)
  }

  lastCompletedSeq(parentSessionId: SessionId): number | undefined {
    const snapshot = this.ctx.sessions.binding(dshSessionId(parentSessionId))?.session.getSnapshot()
    return snapshot === undefined ? undefined : latestCompleted(snapshot)
  }

  selectionIsCurrent(selection: ConversationSelection): boolean {
    if (this.currentSessionId() !== selection.parentSessionId) return false
    const snapshot = this.ctx.sessions.binding(dshSessionId(selection.parentSessionId))?.session.getSnapshot()
    if (snapshot === undefined) return false
    return selection.fragments.every((fragment) => {
      const node = snapshot.chat.nodes.get(fragment.nodeKey)
      return node !== undefined
        && node.visibility === 'visible'
        && node.kind === fragment.nodeKind
        && node.anchorSeq === fragment.seq
        && locationSettled(node.location)
    })
  }

  /** Add one selected passage to the native composer of its parent Session. */
  addSelectionToConversation(selection: ConversationSelection, comment?: string): boolean {
    if (this.currentSessionId() !== selection.parentSessionId) return false
    const input = this.currentParentInput()
    if (input === undefined || !addSelectionToParentComposer(input, selection, comment)) return false
    this.annotationPersistence.reconcile(selection.parentSessionId, input)
    return true
  }

  /** Update an existing unsent annotation without adding a duplicate passage. */
  updateConversationAnnotation(annotationIndex: number, comment?: string): boolean {
    const sessionId = this.currentSessionId()
    const input = this.currentParentInput()
    if (sessionId === undefined
      || input === undefined
      || !updateParentConversationAnnotation(input, annotationIndex, comment)) return false
    this.annotationPersistence.reconcile(sessionId, input)
    return true
  }

  /** Mirror or recover the current Session's unsent annotation occurrence. */
  reconcileConversationAnnotationPersistence(): void {
    const sessionId = this.currentSessionId()
    const input = this.currentParentInput()
    if (sessionId !== undefined && input !== undefined) {
      this.annotationPersistence.reconcile(sessionId, input)
    }
  }

  /** Number assigned to the next annotation shown beside the selected passage. */
  nextConversationAnnotationNumber(): number {
    const snapshot = this.currentConversationInputSnapshot()
    return snapshot === undefined ? 1 : conversationAnnotations(snapshot).length + 1
  }

  /** Remove the current Session's unsent selected-passage annotations. */
  removeConversationAnnotations(): boolean {
    const sessionId = this.currentSessionId()
    const input = this.currentParentInput()
    if (sessionId === undefined
      || input === undefined
      || !removeParentConversationAnnotations(input)) return false
    this.annotationPersistence.reconcile(sessionId, input)
    return true
  }

  async retain(sessionId: SessionId): Promise<SideChatSessionLease> {
    const binding = await this.waitForBinding(dshSessionId(sessionId))
    const concrete = binding.session as ConcreteSession
    await concrete.open()
    if (!this.renamed.has(sessionId)) {
      this.renamed.add(sessionId)
      const parentTitle = this.ctx.sessions.list.getSnapshot().byId[dshSessionId(sessionId)]?.displayTitle
      const title = parentTitle === undefined ? 'Side Chat' : `Side Chat · ${parentTitle}`
      await binding.session.rename(title.slice(0, 160)).catch(() => undefined)
    }
    const adapted = new Rc6SessionBinding(binding.session)
    return { sessionId, binding: adapted, release: () => {} }
  }

  async openSession(sessionId: SessionId): Promise<void> {
    this.ctx.sessions.open(dshSessionId(sessionId))
  }

  notify(message: { readonly kind: 'status' | 'warning'; readonly text: string }): void {
    const method = message.kind === 'warning' ? 'warn' : 'info'
    console[method](`[dsh-side-chat] ${message.text}`)
  }

  face(sessionId: SessionId): SessionFace | undefined {
    return this.ctx.sessions.binding(dshSessionId(sessionId))?.session
  }

  title(sessionId: SessionId): string | undefined {
    return this.ctx.sessions.list.getSnapshot().byId[dshSessionId(sessionId)]?.displayTitle
  }

  cwd(sessionId: SessionId): string | undefined {
    return this.ctx.sessions.list.getSnapshot().byId[dshSessionId(sessionId)]?.cwd
  }

  private currentParentInput(): ParentComposerInput | undefined {
    const sessionId = this.currentSessionId()
    if (sessionId === undefined) return
    const scope = this.ctx.sessions.scope(dshSessionId(sessionId))
    return scope === undefined ? undefined : this.ctx.conversation.input.for(scope)
  }

  private waitForBinding(sessionId: DshSessionId): Promise<SessionBinding> {
    const immediate = this.ctx.sessions.binding(sessionId)
    if (immediate !== undefined) return Promise.resolve(immediate)
    return new Promise((resolve, reject) => {
      let settled = false
      const finish = (): void => {
        if (settled) return
        const binding = this.ctx.sessions.binding(sessionId)
        if (binding === undefined) return
        settled = true
        clearTimeout(timer)
        unsubscribe()
        resolve(binding)
      }
      const unsubscribe = this.ctx.sessions.list.subscribe(finish)
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        unsubscribe()
        reject(new Error(`Side Chat child ${sessionId} did not appear in the rc.6 Session list.`))
      }, BINDING_WAIT_MS)
      finish()
    })
  }
}

export function selectionDescriptor(
  snapshot: ConversationSnapshot,
  anchorKey: string,
): {
  readonly nodeKey: string
  readonly nodeKind: string
  readonly turnKey: string
  readonly seq: number
  readonly source: 'user' | 'assistant' | 'context' | 'code'
  readonly modelVisible: boolean
  readonly settled: boolean
} | undefined {
  const node = snapshot.chat.nodes.get(anchorKey)
  if (node === undefined || node.visibility !== 'visible') return undefined
  const source = node.kind === 'user' || node.kind === 'steering'
    ? 'user'
    : node.kind === 'assistant-step'
      ? 'assistant'
      : node.kind === 'context'
        ? 'context'
        : undefined
  const turn = node.location.kind === 'turn' || node.location.kind === 'step'
    ? node.location.turn.turn
    : undefined
  if (source === undefined || turn === undefined) return undefined
  return {
    nodeKey: node.key,
    nodeKind: node.kind,
    turnKey: `turn:${String(turn)}`,
    seq: node.anchorSeq,
    source,
    modelVisible: true,
    settled: locationSettled(node.location),
  }
}
