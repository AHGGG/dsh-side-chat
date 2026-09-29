// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { conversationChatRoot, focusConversationComposer } from '../../src/client/selection/conversation-dom.js'
import { SessionId } from '../../src/shared/contracts.js'

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })

describe('Session-scoped conversation DOM', () => {
  it('selects the requested Session instead of the first mounted transcript', () => {
    document.body.innerHTML = `
      <section data-conversation-session="other"><div data-chat-flow id="other-chat"></div></section>
      <section data-conversation-session="parent"><div data-chat-flow id="parent-chat"></div></section>`
    expect(conversationChatRoot(SessionId('parent'))?.id).toBe('parent-chat')
    expect(conversationChatRoot(SessionId('missing'))).toBeUndefined()
  })

  it('ignores hidden and Side Chat panel copies of the same Session', () => {
    document.body.innerHTML = `
      <section hidden data-conversation-session="parent"><div data-chat-flow></div></section>
      <aside data-side-chat-panel><section data-conversation-session="parent"><div data-chat-flow></div></section></aside>
      <section data-conversation-session="parent"><div data-chat-flow id="visible"></div></section>`
    expect(conversationChatRoot(SessionId('parent'))?.id).toBe('visible')
  })

  it('focuses only the requested parent composer after the navigation frame', () => {
    let callback: FrameRequestCallback | undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(frame => { callback = frame; return 1 })
    document.body.innerHTML = `
      <section data-conversation-session="other"><div data-composer-seat><textarea id="other"></textarea></div></section>
      <section data-conversation-session="parent"><div data-composer-seat><textarea id="parent"></textarea></div></section>`
    focusConversationComposer(SessionId('parent'))
    callback?.(0)
    expect(document.activeElement?.id).toBe('parent')
  })
})
