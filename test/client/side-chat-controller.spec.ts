import { describe, expect, it } from 'vitest'
import { SideChatController } from '../../src/client/side-chat-controller.js'
import { SessionId, type ConversationSelection } from '../../src/shared/contracts.js'
import { deferred, FakeClientSessions, FakeRemote } from '../fixtures/client-runtime.js'

function setup() {
  const remote = new FakeRemote()
  const sessions = new FakeClientSessions()
  const controller = new SideChatController(remote, sessions)
  return { remote, sessions, controller }
}

function selection(): ConversationSelection {
  return {
    parentSessionId: SessionId('parent-1'),
    fragments: [],
    text: 'selected text',
    atSeq: 4,
    rect: { x: 1, y: 1, width: 10, height: 10, viewportWidth: 100, viewportHeight: 100 },
  }
}

describe('SideChatController', () => {
  it('creates lazily on first send and keeps the parent current', async () => {
    const { controller, remote, sessions } = setup()
    expect(controller.openDraft()).toEqual({ ok: true, value: undefined })
    expect(remote.createCalls).toHaveLength(0)

    expect((await controller.sendFirst('Why this choice?')).ok).toBe(true)
    expect(remote.createCalls).toEqual([{ parentSessionId: 'parent-1', atSeq: 4 }])
    expect(sessions.retainCalls).toEqual([SessionId('child-1')])
    expect(sessions.current).toBe('parent-1')
    expect(sessions.binding.calls[0]?.kind).toBe('prompt')
  })

  it('revalidates a selected message before creating', async () => {
    const { controller, remote, sessions } = setup()
    expect(controller.openDraft({ selection: selection() }).ok).toBe(true)
    sessions.selectionCurrent = false

    expect(await controller.sendFirst('question')).toMatchObject({
      ok: false,
      error: { code: 'selection_stale' },
    })
    expect(remote.createCalls).toHaveLength(0)
  })

  it('removes an unsent selection from the first child prompt', async () => {
    const { controller, sessions } = setup()
    expect(controller.openDraft({ selection: selection() }).ok).toBe(true)

    expect(controller.clearSelection()).toEqual({ ok: true, value: undefined })
    expect(controller.getSnapshot().selection).toBeUndefined()
    expect((await controller.sendFirst('question')).ok).toBe(true)
    expect(sessions.binding.calls[0]?.args[0]).toEqual([{ type: 'text', text: 'question' }])
  })

  it('routes child interactions through the captured child binding', async () => {
    const { controller, sessions } = setup()
    controller.openDraft()
    await controller.sendFirst('first')
    await controller.send('later')
    await controller.send('steer now', 'steer')
    await controller.updateQueue('item-1', { kind: 'remove' })
    await controller.cancel()
    await controller.respondApproval('approval-1', 'decline')
    await controller.respondQuestion('question-1', {
      answers: [{ id: 'question', selected: [], custom: 'answer' }],
    })

    expect(sessions.binding.calls.slice(1).map(call => call.kind)).toEqual([
      'prompt', 'prompt', 'queue', 'cancel', 'approval', 'question',
    ])
    expect(sessions.binding.calls.every(call => call.args.at(-1) === 'child-1')).toBe(true)
  })

  it('closes a running child directly through the Host', async () => {
    const { controller, sessions, remote } = setup()
    controller.openDraft()
    await controller.sendFirst('first')
    sessions.binding.setStatus('running')

    expect(await controller.close()).toEqual({ ok: true, value: undefined })
    expect(remote.closeCalls).toEqual([{ childSessionId: 'child-1' }])
    expect(sessions.released).toBe(1)
    expect(controller.getSnapshot().phase).toBe('closed')
  })

  it('waits for an in-flight create and closes the returned child', async () => {
    const { controller, remote } = setup()
    const pending = deferred<Awaited<ReturnType<FakeRemote['create']>>>()
    remote.createDeferred = pending
    controller.openDraft()
    const sending = controller.sendFirst('first')
    await Promise.resolve()
    const closing = controller.close()

    pending.resolve({
      ok: true,
      value: {
        parentSessionId: SessionId('parent-1'),
        childSessionId: SessionId('child-1'),
        boundarySeq: 5,
        inheritedThroughSeq: 5,
      },
    })
    await Promise.all([sending, closing])
    expect(remote.closeCalls).toEqual([{ childSessionId: 'child-1' }])
    expect(controller.getSnapshot().phase).toBe('closed')
  })

  it('keeps a created child available for close when opening fails', async () => {
    const { controller, remote, sessions } = setup()
    sessions.failRetain = true
    controller.openDraft()

    expect(await controller.sendFirst('first')).toMatchObject({
      ok: false,
      error: { code: 'side_chat_open_failed' },
    })
    expect(controller.getSnapshot()).toMatchObject({ phase: 'error', childSessionId: 'child-1' })
    expect((await controller.close()).ok).toBe(true)
    expect(remote.closeCalls).toEqual([{ childSessionId: 'child-1' }])
  })

  it('shows a close failure and retries the same simple close action', async () => {
    const { controller, remote } = setup()
    controller.openDraft()
    await controller.sendFirst('first')
    remote.closeResults.push({
      ok: false,
      error: { code: 'side_chat_destroy_failed', message: 'still alive', recoverable: true },
    })

    expect((await controller.close()).ok).toBe(false)
    expect(controller.getSnapshot()).toMatchObject({
      phase: 'error',
      error: { operation: 'close' },
    })
    expect((await controller.retry()).ok).toBe(true)
    expect(remote.closeCalls).toHaveLength(2)
    expect(controller.getSnapshot().phase).toBe('closed')
  })

  it('rejects a duplicate first send while creation is in flight', async () => {
    const { controller, remote } = setup()
    const pending = deferred<Awaited<ReturnType<FakeRemote['create']>>>()
    remote.createDeferred = pending
    controller.openDraft()
    const first = controller.sendFirst('first')
    expect(await controller.sendFirst('duplicate')).toMatchObject({ ok: false, error: { code: 'invalid_request' } })
    pending.resolve({
      ok: true,
      value: {
        parentSessionId: SessionId('parent-1'),
        childSessionId: SessionId('child-1'),
        boundarySeq: 5,
        inheritedThroughSeq: 5,
      },
    })
    await first
    expect(remote.createCalls).toHaveLength(1)
  })
})
