import { describe, expect, it, vi } from 'vitest'
import type { SessionFace } from '@deepseek-ai/dsh-api-session-controller/client'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import { SessionId } from '@deepseek-ai/dsh-session'
import { compatibleConversationFace } from '../../src/client/rc6/runtime-compat.js'

function observable<T>(read: () => T) {
  return {
    getSnapshot: read,
    subscribe: vi.fn(() => () => {}),
  }
}

function currentSession(snapshot: object) {
  return {
    sessionId: SessionId('child-1'),
    snapshot,
    subscribe(this: { readonly snapshot: object }, _listener: () => void) {
      void this.snapshot
      return () => {}
    },
    getSnapshot(this: { readonly snapshot: object }) {
      return this.snapshot
    },
    prompt: vi.fn(async () => ({ ok: true as const, value: { accepted: true as const } })),
    updateQueue: vi.fn(async () => ({ ok: true as const, value: { accepted: true as const } })),
    cancel: vi.fn(async () => ({ ok: true as const, value: { accepted: true as const } })),
    rename: vi.fn(async () => ({ ok: true as const, value: { title: 'Side Chat', seq: 1 } })),
    open: vi.fn(async () => {}),
  }
}

describe('DSH client runtime compatibility', () => {
  it('combines 0.1.2 lifecycle, Chat target, and pending-interaction stores', async () => {
    const lifecycle = {
      queue: [{ id: 'queue-1', placement: 'queued', preview: 'Later' }],
      running: true,
      openState: 'open',
      promptError: null,
      lastAgentError: null,
    }
    const session = currentSession(lifecycle)
    const chatNodeStore = { get: vi.fn(() => undefined), values: () => [] }
    const chatSnapshot = {
      nodes: chatNodeStore,
      legacy: {
        nodes: [{ kind: 'user', seq: 4, time: 1, content: [], source: {} }],
        turnEnds: new Map([[1, 7]]),
        turnTimings: new Map(),
        partial: null,
        runningCalls: [],
      },
    } as unknown as ChatSnapshot
    const answer = vi.fn(async () => {})
    let pendingMap = new Map<ReturnType<typeof SessionId>, unknown>([[SessionId('child-1'), {
      kind: 'approval' as const,
      key: 'approval-1',
      sessionId: SessionId('child-1'),
      toolName: 'bash',
      reason: 'Run tests',
      answer,
    }]])
    const chat = observable(() => chatSnapshot)
    const pending = observable(() => pendingMap)
    const face = compatibleConversationFace(session as unknown as SessionFace, { chat, pending })

    const first = face.getSnapshot()
    expect(face.getSnapshot()).toBe(first)
    expect(first.nodes).toEqual(chatSnapshot.legacy.nodes)
    expect(first.turnEnds.get(1)).toBe(7)
    expect(first.queue[0]?.preview).toBe('Later')
    expect(first.pending[0]).toMatchObject({
      kind: 'approval',
      key: 'approval-1',
      toolName: 'bash',
      reason: 'Run tests',
    })
    const wait = first.pending[0]
    if (wait?.kind !== 'approval') throw new Error('approval was not adapted')
    expect(await wait.respond('approve')).toBe(true)
    expect(answer).toHaveBeenCalledWith('allowed-once')

    const cancelQuestion = vi.fn(async () => {})
    pendingMap = new Map([[SessionId('child-1'), {
      kind: 'plan-review' as const,
      key: 'question-1',
      sessionId: SessionId('child-1'),
      questions: [{ id: 'review', question: 'Approve this plan?' }],
      answer: vi.fn(async () => {}),
      cancel: cancelQuestion,
    }]])
    const next = face.getSnapshot()
    expect(next).not.toBe(first)
    expect(next.pending[0]).toMatchObject({ kind: 'question', key: 'question-1' })
    const question = next.pending[0]
    if (question?.kind !== 'question') throw new Error('question was not adapted')
    expect(await question.respond(null)).toBe(true)
    expect(cancelQuestion).toHaveBeenCalledOnce()

    const remove = face.subscribe(() => {})
    expect(chat.subscribe).toHaveBeenCalledOnce()
    expect(pending.subscribe).toHaveBeenCalledOnce()
    remove()
    await face.open()
    expect(session.open).toHaveBeenCalledOnce()
  })

  it('retains 0.1.0/0.1.1 combined snapshots and response envelopes', async () => {
    const approvalResponse = vi.fn(async () => ({ accepted: true }))
    const questionResponse = vi.fn(async () => ({ accepted: true }))
    const snapshot = {
      nodes: [],
      turnEnds: new Map(),
      partial: null,
      runningCalls: [],
      pending: [{
        kind: 'approval' as const,
        key: 'approval-old',
        sessionId: SessionId('child-1'),
        payload: {
          approvalId: 'approval-id',
          toolName: 'read',
          reason: 'Read a file',
        },
        respond: approvalResponse,
      }, {
        kind: 'question' as const,
        key: 'question-old',
        sessionId: SessionId('child-1'),
        payload: {
          questions: [{ id: 'choice', question: 'Continue?' }],
        },
        respond: questionResponse,
      }],
      queue: [],
      running: false,
      openState: 'open',
      promptError: null,
      lastAgentError: null,
      chat: { nodes: { get: () => undefined } },
    }
    const session = currentSession(snapshot)
    const face = compatibleConversationFace(session as unknown as SessionFace)
    const adapted = face.getSnapshot()

    const approval = adapted.pending.find(wait => wait.kind === 'approval')
    if (approval?.kind !== 'approval') throw new Error('approval was not adapted')
    expect(await approval.respond('decline')).toBe(true)
    expect(approvalResponse).toHaveBeenCalledWith({
      ok: true,
      value: {
        sessionId: 'child-1',
        approvalId: 'approval-id',
        outcome: 'rejected',
      },
    })

    const question = adapted.pending.find(wait => wait.kind === 'question')
    if (question?.kind !== 'question') throw new Error('question was not adapted')
    expect(await question.respond(null)).toBe(true)
    expect(questionResponse).toHaveBeenCalledWith({
      ok: false,
      error: { code: 'cancelled', message: 'Question cancelled.', details: {} },
    })
  })
})
