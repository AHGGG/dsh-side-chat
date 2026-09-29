import { describe, expect, it, vi } from 'vitest'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import { DshParentConversation } from '../../src/client/dsh/conversation-store.js'
import { DshSideChatSessions, selectionDescriptor } from '../../src/client/dsh/sessions-adapter.js'
import type { DshClientContext } from '../../src/client/dsh/context.js'
import { SessionId } from '../../src/shared/contracts.js'
function observable<T>(value: T) {
  let snapshot = value
  const listeners = new Set<() => void>()
  return { getSnapshot: () => snapshot,
    subscribe: vi.fn((listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }),
    set: (next: T) => { snapshot = next; for (const listener of listeners) listener() },
  }
}
function fixture() {
  const node = { key: 'answer', kind: 'assistant-step', anchorSeq: 5, visibility: 'visible',
    location: { kind: 'step', turn: { turn: 1, status: 'closed' }, step: { status: 'closed' } } }
  const chat = observable<ChatSnapshot | undefined>({
    nodes: { get: (key: string) => key === 'answer' ? node : undefined }, legacy: { turnEnds: new Map([[1, 7]]) },
  } as unknown as ChatSnapshot)
  const activate = vi.fn()
  const source = { sessionId: 'parent-1' }
  const release = vi.fn()
  const retain = vi.fn(() => ({ ready: Promise.resolve({ session: source }), release }))
  const context = {
    sessions: { list: observable({ byId: { 'parent-1': { retainedBy: { mainView: 1 } } } }),
      binding: () => ({ session: source }), retain },
    uiConversation: { binding: () => ({ activate, target: () => chat }) },
  } as unknown as DshClientContext
  return { chat, activate, release, retain, context }
}
describe('read-only parent Chat access', () => {
  it('publishes stable snapshots from only the parent Chat target', () => {
    const { chat } = fixture()
    const face = new DshParentConversation(chat)
    const first = face.getSnapshot()
    expect(face.getSnapshot()).toBe(first)
    expect(first.turnEnds.get(1)).toBe(7)
    const listener = vi.fn()
    const off = face.subscribe(listener)
    chat.set(undefined)
    expect(listener).toHaveBeenCalledOnce()
    expect(face.getSnapshot().turnEnds.size).toBe(0)
    off()
    chat.set(undefined)
    expect(listener).toHaveBeenCalledOnce()
  })
  it('activates Chat before reads and pins only the parent without navigating', () => {
    const { context, activate, retain, release } = fixture()
    const adapter = new DshSideChatSessions(context)
    const off = adapter.retainParent(SessionId('parent-1'))
    expect(adapter.lastCompletedSeq(SessionId('parent-1'))).toBe(7)
    expect(activate).toHaveBeenCalledWith('chat')
    expect(retain).toHaveBeenCalledOnce()
    expect(retain).toHaveBeenCalledWith('parent-1', { source: 'sideChat' })
    expect(adapter.currentSessionId()).toBe('parent-1')
    expect('retain' in adapter).toBe(false)
    off()
    expect(release).toHaveBeenCalledOnce()
  })
  it('resolves selection anchors only from visible completed parent messages', () => {
    const { chat } = fixture()
    const snapshot = new DshParentConversation(chat).getSnapshot()
    expect(selectionDescriptor(snapshot, 'answer')).toMatchObject({ source: 'assistant', settled: true, seq: 5, turnKey: 'turn:1' })
    expect(selectionDescriptor(snapshot, 'missing')).toBeUndefined()
  })
})
