import type {
  SessionId,
  SideChatModelSelection,
  SideChatPromptPart,
  SideChatRemote,
  SideChatResult,
  SideChatWireError,
} from '../../src/shared/contracts.js'
import { SessionId as sessionId } from '../../src/shared/contracts.js'
import { ObservableValue } from '../../src/shared/observable.js'
import type {
  SideChatClientSessions,
  SideChatQuestionAnswer,
  SideChatSessionBinding,
  SideChatSessionLease,
  SideChatSessionSnapshot,
} from '../../src/client/contracts.js'

export function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(resolver => { resolve = resolver })
  return { promise, resolve }
}

export class FakeBinding implements SideChatSessionBinding {
  readonly observable = new ObservableValue<SideChatSessionSnapshot>({ status: 'idle' }, 'fake-binding')
  readonly calls: Array<{ kind: string; args: unknown[] }> = []
  nextError: SideChatWireError | undefined

  constructor(readonly sessionId: SessionId) {}

  getSnapshot = (): SideChatSessionSnapshot => this.observable.getSnapshot()
  subscribe = (listener: () => void): (() => void) => this.observable.subscribe(listener)

  setStatus(status: SideChatSessionSnapshot['status']): void {
    this.observable.publish({ status })
  }

  async prompt(content: readonly SideChatPromptPart[], mode: 'queue' | 'steer') {
    this.calls.push({ kind: 'prompt', args: [content, mode, this.sessionId] })
    return this.result()
  }

  async updateQueue(itemId: string, action: Parameters<SideChatSessionBinding['updateQueue']>[1]) {
    this.calls.push({ kind: 'queue', args: [itemId, action, this.sessionId] })
    return this.result()
  }

  async cancel() {
    this.calls.push({ kind: 'cancel', args: [this.sessionId] })
    return this.result()
  }

  async respondApproval(interactionId: string, decision: 'approve' | 'decline') {
    this.calls.push({ kind: 'approval', args: [interactionId, decision, this.sessionId] })
    return this.result()
  }

  async respondQuestion(interactionId: string, answer: SideChatQuestionAnswer | null) {
    this.calls.push({ kind: 'question', args: [interactionId, answer, this.sessionId] })
    return this.result()
  }

  private result() {
    if (this.nextError === undefined) return { ok: true as const }
    const error = this.nextError
    this.nextError = undefined
    return { ok: false as const, error }
  }
}

export class FakeClientSessions implements SideChatClientSessions {
  current = sessionId('parent-1')
  lastSeq: number | undefined = 4
  readonly binding = new FakeBinding(sessionId('child-1'))
  readonly retainCalls: SessionId[] = []
  readonly opened: SessionId[] = []
  readonly notifications: string[] = []
  modelPreference: SideChatModelSelection | undefined
  released = 0
  failRetain = false
  selectionCurrent = true
  retainDeferred: ReturnType<typeof deferred<void>> | undefined

  currentSessionId(): SessionId | undefined { return this.current }
  lastCompletedSeq(_parentSessionId: SessionId): number | undefined { return this.lastSeq }
  selectionIsCurrent(): boolean { return this.selectionCurrent }
  sideChatModelPreference(): SideChatModelSelection | undefined {
    return this.modelPreference
  }
  rememberSideChatModelPreference(selection: SideChatModelSelection): void {
    this.modelPreference = { ...selection }
  }

  async retain(id: SessionId): Promise<SideChatSessionLease> {
    this.retainCalls.push(id)
    if (this.retainDeferred !== undefined) await this.retainDeferred.promise
    if (this.failRetain) throw new Error('retain failed')
    if (this.binding.sessionId !== id) throw new Error('unexpected child id')
    return { sessionId: id, binding: this.binding, release: () => { this.released += 1 } }
  }

  async openSession(id: SessionId): Promise<void> {
    this.opened.push(id)
    this.current = id
  }

  notify(message: { readonly kind: 'status' | 'warning'; readonly text: string }): void {
    this.notifications.push(`${message.kind}:${message.text}`)
  }
}

type CreateResult = Awaited<ReturnType<SideChatRemote['create']>>

export class FakeRemote implements SideChatRemote {
  readonly createCalls: Parameters<SideChatRemote['create']>[0][] = []
  readonly selectModelCalls: Parameters<SideChatRemote['selectModel']>[0][] = []
  readonly closeCalls: Parameters<SideChatRemote['close']>[0][] = []
  createDeferred: ReturnType<typeof deferred<CreateResult>> | undefined
  createResult: CreateResult | undefined
  closeResults: SideChatResult<{ closed: true }>[] = []

  async create(request: Parameters<SideChatRemote['create']>[0]): Promise<CreateResult> {
    this.createCalls.push(request)
    if (this.createDeferred !== undefined) return await this.createDeferred.promise
    if (this.createResult !== undefined) return this.createResult
    return {
      ok: true,
      value: {
        parentSessionId: sessionId('parent-1'),
        childSessionId: sessionId('child-1'),
        boundarySeq: 6,
        inheritedThroughSeq: 6,
      },
    }
  }

  async selectModel(request: Parameters<SideChatRemote['selectModel']>[0]) {
    this.selectModelCalls.push(request)
    return {
      ok: true as const,
      value: {
        selected: {
          provider: request.provider,
          model: request.model,
          ...(request.reasoningEffort === undefined ? {} : { reasoningEffort: request.reasoningEffort }),
        },
      },
    }
  }

  async close(request: Parameters<SideChatRemote['close']>[0]) {
    this.closeCalls.push(request)
    return this.closeResults.shift() ?? { ok: true as const, value: { closed: true as const } }
  }
}
