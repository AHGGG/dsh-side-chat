import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { createAssistantMessage, createUserMessage, type GenerateOptions, type StreamChunk } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { ReadOnlySideChatService, completedContextBoundary } from '../../src/host/read-only-chat-service.js'
import { createRequestSchema } from '../../src/shared/side-chat-wire.js'
import { SessionId, type SideChatStreamEvent } from '../../src/shared/contracts.js'
import { deferred } from '../fixtures/client-runtime.js'

const MODEL = { provider: 'test', model: 'model' }
const signal = () => new AbortController().signal
function event(seq: number, type: string, data: unknown, surfaceOp?: unknown): SessionEvent {
  return { seq, time: seq, type, data, ...(surfaceOp === undefined ? {} : { surfaceOp }) } as SessionEvent
}
function parentEvents(): SessionEvent[] {
  return [
    event(0, 'request/header', { header: { config: MODEL }, reason: 'initial' }),
    event(1, 'user/message', createUserMessage({ content: [{ type: 'text', text: 'Parent question' }], source: { kind: 'user' } }), 'append'),
    event(2, 'turn/start', { turn: 1 }),
    event(3, 'assistant/message', { turn: 1, step: 1, stream: [], message: createAssistantMessage({
      source: MODEL, content: [{ type: 'reasoning', text: 'Private reasoning' }, { type: 'text', text: 'Parent answer' }],
    }) }, 'append'),
    event(4, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    event(5, 'user/message', createUserMessage({ content: [{ type: 'text', text: 'Later parent question' }], source: { kind: 'user' } }), 'append'),
  ]
}
const services = new Set<ReadOnlySideChatService>()
afterEach(async () => { await Promise.all([...services].map(service => service.dispose())); services.clear() })
function fixture() {
  const events = parentEvents()
  const release = vi.fn()
  const observe = vi.fn(async (_id: string, _options: { signal: AbortSignal; projectionMode: 'none' }) => ({
    events, header: { id: 'parent-1' }, [Symbol.dispose]: release,
  }))
  let provider: (options: GenerateOptions) => AsyncIterable<StreamChunk> = async function* () {
    yield { type: 'text-delta', index: 0, text: 'Side answer' }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }
  const stream = vi.fn((options: GenerateOptions) => provider(options))
  const prepare = vi.fn(async (config: object) => ({ config, stream }))
  const createSession = vi.fn(() => { throw new Error('Session creation is forbidden') })
  const createAgent = vi.fn(() => { throw new Error('Agent creation is forbidden') })
  const persist = vi.fn(() => { throw new Error('Persistence writes are forbidden') })
  const archive = vi.fn(() => { throw new Error('Archiving is forbidden') })
  const service = new ReadOnlySideChatService({
    sessions: { messageProjections: [], create: createSession }, agents: { create: createAgent },
    sessionQuery: { observeSession: observe }, sessionPersistence: { create: persist },
    workspaceRegistry: { archiveSession: archive }, llm: { prepareCall: prepare },
  } as unknown as Context)
  services.add(service)
  const create = async (owner = 'browser') => {
    const result = await service.create({ parentSessionId: SessionId('parent-1'), atSeq: 3, selectedText: 'Parent answer' }, owner, signal())
    if (!result.ok) throw new Error(result.error.message)
    return result.value
  }
  return { service, events, release, observe, prepare, stream, createSession, createAgent, persist, archive, create,
    setProvider: (next: typeof provider) => { provider = next } }
}
async function collect(stream: AsyncIterable<SideChatStreamEvent>): Promise<SideChatStreamEvent[]> {
  const result: SideChatStreamEvent[] = []
  for await (const event of stream) result.push(event)
  return result
}
describe('session-free read-only Side Chat', () => {
  it('captures the selected completed boundary without creating or writing a Session', async () => {
    const f = fixture()
    const original = JSON.stringify(f.events)
    const chat = await f.create()
    expect(chat.boundarySeq).toBe(4)
    expect(chat.chatId).toMatch(/^side-chat-/)
    expect(chat.modelSelection).toEqual(MODEL)
    expect(f.release).toHaveBeenCalledOnce()
    const result = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Why?' }, 'browser', signal()))
    expect(result.at(-1)).toEqual({ type: 'finished', status: 'complete' })
    const request = f.stream.mock.calls[0]![0]
    const context = JSON.stringify(request.messages)
    expect(context).toContain('Parent question')
    expect(context).toContain('Parent answer')
    expect(context).not.toContain('Later parent question')
    expect(context).not.toContain('Private reasoning')
    expect(request.tools).toEqual([])
    expect(request.sessionId).toBeUndefined()
    expect(request.system).toContain('read-only')
    await f.service.close({ chatId: chat.chatId }, 'browser')
    expect(f.createSession).not.toHaveBeenCalled()
    expect(f.createAgent).not.toHaveBeenCalled()
    expect(f.persist).not.toHaveBeenCalled()
    expect(f.archive).not.toHaveBeenCalled()
    expect(JSON.stringify(f.events)).toBe(original)
  })
  it('keeps the captured context fixed and includes only this discussion in follow-ups', async () => {
    const f = fixture()
    const chat = await f.create()
    await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'First' }, 'browser', signal()))
    f.events.push(event(6, 'user/message', createUserMessage({ content: [{ type: 'text', text: 'New unrelated parent text' }], source: { kind: 'user' } }), 'append'))
    await collect(f.service.stream({ chatId: chat.chatId, requestId: 'two', text: 'Follow-up' }, 'browser', signal()))
    expect(f.observe).toHaveBeenCalledOnce()
    const request = f.stream.mock.calls[1]![0]
    expect(JSON.stringify(request.messages)).toContain('Side answer')
    expect(JSON.stringify(request.messages)).toContain('Follow-up')
    expect(JSON.stringify(request.messages)).not.toContain('New unrelated parent text')
  })
  it('replays an admitted request identity without making another model call', async () => {
    const f = fixture(), chat = await f.create()
    const request = { chatId: chat.chatId, requestId: 'same', text: 'Question' }
    await collect(f.service.stream(request, 'browser', signal()))
    const replay = await collect(f.service.stream(request, 'browser', signal()))
    expect(f.stream).toHaveBeenCalledOnce()
    expect(replay).toContainEqual({ type: 'content', text: 'Side answer', reasoning: '' })
    expect((await collect(f.service.stream({ ...request, text: 'Different' }, 'browser', signal())))[0])
      .toMatchObject({ type: 'error', error: { code: 'invalid_request' } })
  })
  it('rejects stale/fractional/incomplete anchors and releases read leases on failure', async () => {
    const f = fixture()
    expect(completedContextBoundary(f.events, 3)).toBe(4)
    expect(completedContextBoundary(f.events, 5)).toBeUndefined()
    expect(completedContextBoundary(f.events, 3.5)).toBeUndefined()
    expect(createRequestSchema.safeParse({ parentSessionId: 'parent-1', atSeq: 3.5 }).success).toBe(false)
    const result = await f.service.create({ parentSessionId: SessionId('parent-1'), atSeq: 99 }, 'browser', signal())
    expect(result).toMatchObject({ ok: false, error: { code: 'context_unavailable' } })
    expect(f.release).toHaveBeenCalledOnce()
  })
  it('cancels an in-flight provider stream and permits a later question', async () => {
    const f = fixture(), chat = await f.create(), started = deferred<void>()
    f.setProvider(async function* (request) {
      yield { type: 'text-delta', index: 0, text: 'Partial' }
      started.resolve()
      await new Promise<void>(resolve => request.signal!.addEventListener('abort', () => resolve(), { once: true }))
      request.signal!.throwIfAborted()
    })
    const output = collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Question' }, 'browser', signal()))
    await started.promise
    const busy = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'two', text: 'Too soon' }, 'browser', signal()))
    expect(busy[0]).toMatchObject({ type: 'error' })
    await f.service.cancel({ chatId: chat.chatId }, 'browser')
    expect((await output).at(-1)).toEqual({ type: 'finished', status: 'stopped' })
    f.setProvider(async function* () { yield { type: 'finish', reason: { kind: 'stop' } } })
    expect((await collect(f.service.stream({ chatId: chat.chatId, requestId: 'two', text: 'Later' }, 'browser', signal()))).at(-1))
      .toEqual({ type: 'finished', status: 'complete' })
  })
  it('changes thinking level for later turns without interrupting or reconfiguring the active reply', async () => {
    const f = fixture(), chat = await f.create(), started = deferred<void>(), finish = deferred<void>()
    const low = { ...MODEL, reasoningEffort: 'low' }
    const high = { ...MODEL, reasoningEffort: 'high' }
    expect((await f.service.selectModel({ chatId: chat.chatId, ...low }, 'browser', signal())).ok).toBe(true)
    f.setProvider(async function* (request) {
      yield { type: 'text-delta', index: 0, text: 'Partial' }
      started.resolve()
      await Promise.race([
        finish.promise,
        new Promise<void>(resolve => request.signal!.addEventListener('abort', () => resolve(), { once: true })),
      ])
      request.signal!.throwIfAborted()
      yield { type: 'finish', reason: { kind: 'stop' } }
    })
    const output = collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Question' }, 'browser', signal()))
    await started.promise
    try {
      expect(await f.service.selectModel({ chatId: chat.chatId, ...high }, 'browser', signal()))
        .toEqual({ ok: true, value: { selected: high } })
      expect(f.stream.mock.calls[0]![0].reasoningEffort).toBe('low')
      expect(f.stream.mock.calls[0]![0].signal?.aborted).toBe(false)
    } finally { finish.resolve() }
    const first = await output
    expect(first[0]).toMatchObject({ type: 'started', modelSelection: low })
    expect(first.at(-1)).toEqual({ type: 'finished', status: 'complete' })
    f.setProvider(async function* () { yield { type: 'finish', reason: { kind: 'stop' } } })
    const next = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'two', text: 'Follow-up' }, 'browser', signal()))
    expect(next[0]).toMatchObject({ type: 'started', modelSelection: high })
    expect(f.stream.mock.calls[1]![0].reasoningEffort).toBe('high')
    expect(f.createAgent).not.toHaveBeenCalled()
  })
  it('does not let an older delayed model resolution undo the latest accepted choice', async () => {
    const f = fixture(), chat = await f.create()
    const delayed = deferred<Awaited<ReturnType<typeof f.prepare>>>()
    f.prepare.mockImplementationOnce(() => delayed.promise)
    const older = f.service.selectModel({ chatId: chat.chatId, ...MODEL, reasoningEffort: 'low' }, 'browser', signal())
    expect((await f.service.selectModel({ chatId: chat.chatId, ...MODEL, reasoningEffort: 'high' }, 'browser', signal())).ok).toBe(true)
    delayed.resolve({ config: { ...MODEL, reasoningEffort: 'low' }, stream: f.stream })
    expect(await older).toMatchObject({ ok: false, error: { code: 'side_chat_model_failed' } })
    const result = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Question' }, 'browser', signal()))
    expect(result[0]).toMatchObject({ type: 'started', modelSelection: { ...MODEL, reasoningEffort: 'high' } })
    expect(f.stream.mock.calls[0]![0].reasoningEffort).toBe('high')
  })
  it('keeps the accepted reasoning level when the provider rejects a new choice', async () => {
    const f = fixture(), chat = await f.create()
    await f.service.selectModel({ chatId: chat.chatId, ...MODEL, reasoningEffort: 'low' }, 'browser', signal())
    f.prepare.mockRejectedValueOnce(new Error('Unsupported effort'))
    expect(await f.service.selectModel({ chatId: chat.chatId, ...MODEL, reasoningEffort: 'invalid' }, 'browser', signal()))
      .toMatchObject({ ok: false, error: { code: 'side_chat_model_failed' } })
    await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Question' }, 'browser', signal()))
    expect(f.stream.mock.calls[0]![0].reasoningEffort).toBe('low')
  })
  it('isolates browser ownership and deletes only that peer’s discussions on disconnect', async () => {
    const f = fixture(), chat = await f.create()
    const denied = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Peek' }, 'another-peer', signal()))
    expect(denied[0]).toMatchObject({ type: 'error', error: { code: 'side_chat_not_found' } })
    expect((await f.service.close({ chatId: chat.chatId }, 'another-peer')).ok).toBe(false)
    f.service.closeOwner('browser')
    expect((await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Expired' }, 'browser', signal())))[0])
      .toMatchObject({ type: 'error', error: { code: 'side_chat_not_found' } })
    expect(f.stream).not.toHaveBeenCalled()
  })
  it('cancels a disconnected peer’s pending context read instead of retaining an orphan discussion', async () => {
    const f = fixture()
    const observation = deferred<Awaited<ReturnType<typeof f.observe>>>()
    f.observe.mockImplementationOnce(() => observation.promise)
    const creating = f.service.create({ parentSessionId: SessionId('parent-1'), atSeq: 3 }, 'browser', signal())
    f.service.closeOwner('browser')
    expect(f.observe.mock.calls[0]![1].signal.aborted).toBe(true)
    observation.resolve({ events: f.events, header: { id: 'parent-1' }, [Symbol.dispose]: f.release })
    expect(await creating).toMatchObject({ ok: false })
    expect(f.release).toHaveBeenCalledOnce()
    expect(f.stream).not.toHaveBeenCalled()
    expect(await f.create()).toMatchObject({ parentSessionId: 'parent-1' })
  })
  it('releases a pending read before completing plugin disposal', async () => {
    const f = fixture()
    const observation = deferred<Awaited<ReturnType<typeof f.observe>>>()
    f.observe.mockImplementationOnce(() => observation.promise)
    const creating = f.service.create({ parentSessionId: SessionId('parent-1'), atSeq: 3 }, 'browser', signal())
    const disposing = f.service.dispose()
    expect(f.observe.mock.calls[0]![1].signal.aborted).toBe(true)
    observation.resolve({ events: f.events, header: { id: 'parent-1' }, [Symbol.dispose]: f.release })
    await disposing
    expect(await creating).toMatchObject({ ok: false })
    expect(f.release).toHaveBeenCalledOnce()
    expect(f.stream).not.toHaveBeenCalled()
  })
  it('bounds an oversized reply and reports explicitly that only partial output was kept', async () => {
    const f = fixture(), chat = await f.create()
    f.setProvider(async function* () {
      yield { type: 'text-delta', index: 0, text: 'x'.repeat(256 * 1024 + 1) }
      yield { type: 'finish', reason: { kind: 'stop' } }
    })
    const result = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Question' }, 'browser', signal()))
    const content = result.find(item => item.type === 'content')
    expect(content?.type === 'content' && content.text.length).toBe(256 * 1024)
    expect(result.at(-1)).toMatchObject({ type: 'error', error: { message: expect.stringContaining('partial output') } })
  })
  it('refuses model tool calls rather than executing or adding them to follow-up history', async () => {
    const f = fixture(), chat = await f.create()
    f.setProvider(async function* () {
      yield { type: 'block-end', index: 0, block: { type: 'tool-call', id: 'tool-1', name: 'write', arguments: '{}' } } as StreamChunk
    })
    expect((await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Edit a file' }, 'browser', signal()))).at(-1))
      .toMatchObject({ type: 'error', error: { message: expect.stringContaining('read-only') } })
    expect(f.createAgent).not.toHaveBeenCalled()
  })
  it('rejects a stream that ends without a provider completion status', async () => {
    const f = fixture(), chat = await f.create()
    f.setProvider(async function* () { yield { type: 'text-delta', index: 0, text: 'Partial' } })
    const result = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Question' }, 'browser', signal()))
    expect(result.at(-1)).toMatchObject({ type: 'error', error: { message: expect.stringContaining('completion status') } })
  })
  it('surfaces provider finish errors instead of accepting an empty successful answer', async () => {
    const f = fixture(), chat = await f.create()
    f.setProvider(async function* () { yield { type: 'finish', reason: { kind: 'error', failure: { code: 'AUTH', message: 'Provider unavailable' } } } })
    const result = await collect(f.service.stream({ chatId: chat.chatId, requestId: 'one', text: 'Question' }, 'browser', signal()))
    expect(result.at(-1)).toMatchObject({ type: 'error', error: { message: 'Provider unavailable', recoverable: false } })
  })
})
