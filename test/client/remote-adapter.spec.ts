import { describe, expect, it, vi } from 'vitest'
import { mountSideChatRemote } from '../../src/client/dsh/remote-adapter.js'
import type { DshClientContext } from '../../src/client/dsh/context.js'
import { SessionId, SideChatId } from '../../src/shared/contracts.js'
import { SIDE_CHAT_INVOCATIONS } from '../../src/typert.js'
import { ManualStream, MODEL } from '../fixtures/client-runtime.js'

describe('read-only Side Chat remote', () => {
  it('mounts the sideChat namespace, unwraps unary calls, and preserves cancellable streaming', async () => {
    const stream = new ManualStream()
    const rpc = {
      create: vi.fn(async () => ({ ok: true, value: { ok: true, value: {
        parentSessionId: SessionId('parent'), chatId: SideChatId('chat'), boundarySeq: 7, modelSelection: MODEL,
      } } })),
      selectModel: vi.fn(async () => ({ ok: true, value: { ok: true, value: { selected: MODEL } } })),
      stream: vi.fn(() => stream),
      cancel: vi.fn(async () => ({ ok: true, value: { ok: true, value: { cancelled: true } } })),
      close: vi.fn(async () => ({ ok: true, value: { ok: true, value: { closed: true } } })),
    }
    const dispose = vi.fn(async () => {})
    const get = vi.fn(() => rpc)
    const context = { remote: { $mount: vi.fn(async () => dispose) }, get } as unknown as DshClientContext
    const mounted = await mountSideChatRemote(context)
    expect(get).toHaveBeenCalledWith('remote.sideChat')
    expect(await mounted.remote.create({ parentSessionId: SessionId('parent'), atSeq: 7 })).toMatchObject({ ok: true, value: { chatId: 'chat' } })
    expect(await mounted.remote.selectModel({ chatId: SideChatId('chat'), ...MODEL })).toMatchObject({ ok: true, value: { selected: MODEL } })
    const handle = mounted.remote.stream({ chatId: SideChatId('chat'), requestId: 'turn', text: 'Question' })
    expect(handle).toBe(stream)
    handle.dispose()
    expect(stream.disposed).toBe(true)
    expect(await mounted.remote.cancel({ chatId: SideChatId('chat') })).toEqual({ ok: true, value: { cancelled: true } })
    expect(await mounted.remote.close({ chatId: SideChatId('chat') })).toEqual({ ok: true, value: { closed: true } })
    await mounted.dispose()
    expect(dispose).toHaveBeenCalledOnce()
  })
  it('translates RPC failures without wrapping stream handles in unary result envelopes', async () => {
    const rpc = { create: vi.fn(async () => ({ ok: false, error: { code: 'gateway/bad-request', message: 'Invalid boundary' } })) }
    const mounted = await mountSideChatRemote({ remote: { $mount: async () => async () => {} }, get: () => rpc } as unknown as DshClientContext)
    expect(await mounted.remote.create({ parentSessionId: SessionId('parent'), atSeq: 2.5 })).toEqual({
      ok: false, error: { code: 'invalid_request', message: 'Invalid boundary', recoverable: false },
    })
  })
  it('declares strict stream item codecs and injects carrier cancellation on the Host', () => {
    const stream = SIDE_CHAT_INVOCATIONS.find(item => item.method === 'stream')!
    expect(stream).toMatchObject({ namespace: 'sideChat', mode: 'stream', cancellation: { parameter: 'signal' } })
    if (stream.result.mode !== 'strict') throw new Error('strict stream schema missing')
    expect(stream.result.create().parse({ type: 'content', text: 'Answer', reasoning: '' })).toEqual({ type: 'content', text: 'Answer', reasoning: '' })
    expect(() => stream.result.mode === 'strict' && stream.result.create().parse({ type: 'tool-call', name: 'write' })).toThrow()
    expect(SIDE_CHAT_INVOCATIONS.every(item => item.namespace === 'sideChat')).toBe(true)
  })
})
