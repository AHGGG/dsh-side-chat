import { SessionId, SideChatId, type SideChatModelSelection, type SideChatRemote, type SideChatResult,
  type SideChatStream, type SideChatStreamEvent } from '../../src/shared/contracts.js'
import type { SideChatClientSessions } from '../../src/client/contracts.js'

export function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
export class ManualStream implements SideChatStream {
  private readonly items: SideChatStreamEvent[] = []
  private waiting: ((item: IteratorResult<SideChatStreamEvent>) => void) | undefined
  disposed = false
  push(item: SideChatStreamEvent): void {
    if (this.disposed) return
    if (this.waiting !== undefined) { const next = this.waiting; this.waiting = undefined; next({ done: false, value: item }) }
    else this.items.push(item)
  }
  finish(): void { this.push({ type: 'finished', status: 'complete' }) }
  dispose(): void {
    this.disposed = true
    this.items.length = 0
    this.waiting?.({ done: true, value: undefined })
    this.waiting = undefined
  }
  [Symbol.asyncIterator](): AsyncIterator<SideChatStreamEvent> {
    return {
      next: async () => {
        const value = this.items.shift()
        if (value !== undefined) return { done: false, value }
        if (this.disposed) return { done: true, value: undefined }
        return await new Promise<IteratorResult<SideChatStreamEvent>>(resolve => { this.waiting = resolve })
      },
      return: async () => { this.dispose(); return { done: true, value: undefined } },
    }
  }
}
export class FakeClientSessions implements SideChatClientSessions {
  current = SessionId('parent-1')
  lastSeq: number | undefined = 7
  readonly opened: SessionId[] = []
  readonly notifications: string[] = []
  modelPreference: SideChatModelSelection | undefined
  parentsRetained = 0
  selectionCurrent = true
  currentSessionId(): SessionId | undefined { return this.current }
  lastCompletedSeq(): number | undefined { return this.lastSeq }
  selectionIsCurrent(): boolean { return this.selectionCurrent }
  sideChatModelPreference(): SideChatModelSelection | undefined { return this.modelPreference }
  rememberSideChatModelPreference(model: SideChatModelSelection): void { this.modelPreference = { ...model } }
  retainParent(): () => void { ++this.parentsRetained; return () => { --this.parentsRetained } }
  async openSession(id: SessionId): Promise<void> { this.opened.push(id); this.current = id }
  notify(message: { readonly kind: 'status' | 'warning'; readonly text: string }): void { this.notifications.push(message.text) }
}
export const MODEL = { provider: 'test', model: 'test-model' }
type CreateResult = Awaited<ReturnType<SideChatRemote['create']>>
export class FakeRemote implements SideChatRemote {
  readonly createCalls: Parameters<SideChatRemote['create']>[0][] = []
  readonly selectModelCalls: Parameters<SideChatRemote['selectModel']>[0][] = []
  readonly streamCalls: Parameters<SideChatRemote['stream']>[0][] = []
  readonly cancelCalls: Parameters<SideChatRemote['cancel']>[0][] = []
  readonly closeCalls: Parameters<SideChatRemote['close']>[0][] = []
  readonly streams: ManualStream[] = []
  readonly streamModels: SideChatModelSelection[] = []
  private readonly models = new Map<SideChatId, SideChatModelSelection>()
  createDeferred: ReturnType<typeof deferred<CreateResult>> | undefined
  createResult: CreateResult | undefined
  closeResults: SideChatResult<{ closed: true }>[] = []
  autoStart = true
  autoFinish = false
  async create(request: Parameters<SideChatRemote['create']>[0]): Promise<CreateResult> {
    this.createCalls.push(request)
    const result: CreateResult = this.createDeferred === undefined
      ? this.createResult ?? { ok: true, value: { parentSessionId: request.parentSessionId,
          chatId: SideChatId(`side-chat-${this.createCalls.length}`), boundarySeq: 7,
          modelSelection: request.modelSelection ?? MODEL } }
      : await this.createDeferred.promise
    if (result.ok) this.models.set(result.value.chatId, { ...result.value.modelSelection })
    return result
  }
  async selectModel(request: Parameters<SideChatRemote['selectModel']>[0]) {
    this.selectModelCalls.push(request)
    const selected = { provider: request.provider, model: request.model, reasoningEffort: request.reasoningEffort }
    this.models.set(request.chatId, selected)
    return { ok: true as const, value: { selected } }
  }
  stream(request: Parameters<SideChatRemote['stream']>[0]): ManualStream {
    this.streamCalls.push(request)
    const stream = new ManualStream()
    this.streams.push(stream)
    const model = { ...(this.models.get(request.chatId) ?? MODEL) }
    this.streamModels.push(model)
    if (this.autoStart) stream.push({ type: 'started', requestId: request.requestId, modelSelection: model })
    if (this.autoFinish) { stream.push({ type: 'content', text: 'Because this is the result.', reasoning: '' }); stream.finish() }
    return stream
  }
  async cancel(request: Parameters<SideChatRemote['cancel']>[0]) {
    this.cancelCalls.push(request)
    return { ok: true as const, value: { cancelled: true as const } }
  }
  async close(request: Parameters<SideChatRemote['close']>[0]) {
    this.closeCalls.push(request)
    return this.closeResults.shift() ?? { ok: true as const, value: { closed: true as const } }
  }
}
