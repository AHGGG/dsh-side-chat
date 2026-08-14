// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SideChatClientSessions } from '../../src/client/contracts.js'
import { Rc6SideChatOverlay } from '../../src/client/rc6/Rc6SideChatOverlay.js'
import type { Rc6SideChatSessions } from '../../src/client/rc6/sessions-adapter.js'
import { SideChatController } from '../../src/client/side-chat-controller.js'
import type { ConversationSelection, SideChatRemote } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'

const captureMocks = vi.hoisted(() => ({
  capture: vi.fn(),
}))

vi.mock('../../src/client/selection/selection-controller.js', () => ({
  captureDomConversationSelection: captureMocks.capture,
}))

const selectedPassage: ConversationSelection = {
  parentSessionId: SessionId('parent-1'),
  fragments: [],
  text: 'Selected text',
  atSeq: 7,
  rect: { x: 20, y: 20, width: 80, height: 20, viewportWidth: 800, viewportHeight: 600 },
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  captureMocks.capture.mockReset()
})

describe('rc.6 Side Chat overlay selection lifecycle', () => {
  it('dismisses the selection action when the browser selection collapses after mouseup', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    let browserSelection = { isCollapsed: false } as Selection
    vi.spyOn(window, 'getSelection').mockImplementation(() => browserSelection)

    const sessions = {
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      notify: vi.fn(),
    }
    const controller = new SideChatController(
      {} as SideChatRemote,
      sessions as unknown as SideChatClientSessions,
    )

    render(<>
      <div data-chat-flow />
      <Rc6SideChatOverlay
        controller={controller}
        sessions={sessions as unknown as Rc6SideChatSessions}
      />
    </>)

    fireEvent.mouseUp(document.body)
    expect(await screen.findByRole('button', { name: 'Ask in side chat' })).toBeInTheDocument()

    browserSelection = { isCollapsed: true } as Selection
    fireEvent(document, new Event('selectionchange'))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Ask in side chat' })).not.toBeInTheDocument()
    })
  })

  it('does not restore a stale browser selection after clicking adjacent whitespace', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)

    const sessions = {
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      notify: vi.fn(),
    }
    const controller = new SideChatController(
      {} as SideChatRemote,
      sessions as unknown as SideChatClientSessions,
    )

    render(<>
      <div data-chat-flow />
      <Rc6SideChatOverlay
        controller={controller}
        sessions={sessions as unknown as Rc6SideChatSessions}
      />
    </>)

    fireEvent.mouseUp(document.body)
    expect(await screen.findByRole('button', { name: 'Ask in side chat' })).toBeInTheDocument()

    fireEvent.mouseDown(document.body, { clientX: 500, clientY: 200 })
    fireEvent.mouseUp(document.body, { clientX: 500, clientY: 200, detail: 1 })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Ask in side chat' })).not.toBeInTheDocument()
    })
    expect(captureMocks.capture).toHaveBeenCalledOnce()
  })

  it('opens a Side Chat and immediately sends the More details prompt', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)

    const sessions = {
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      notify: vi.fn(),
    }
    const controller = new SideChatController(
      {} as SideChatRemote,
      sessions as unknown as SideChatClientSessions,
    )
    const sendFirst = vi.spyOn(controller, 'sendFirst')
      .mockResolvedValue({ ok: true, value: undefined })

    render(<>
      <div data-chat-flow />
      <Rc6SideChatOverlay
        controller={controller}
        sessions={sessions as unknown as Rc6SideChatSessions}
      />
    </>)

    fireEvent.mouseUp(document.body)
    fireEvent.click(await screen.findByRole('button', { name: 'More details' }))

    expect(sendFirst).toHaveBeenCalledWith('Please explain the selected passage in more detail.')
    expect(screen.queryByRole('button', { name: 'More details' })).not.toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Side Chat' })).toBeInTheDocument()
  })

  it('closes an open Side Chat with Escape', async () => {
    const sessions = {
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => undefined,
      notify: vi.fn(),
    }
    const controller = new SideChatController(
      {} as SideChatRemote,
      sessions as unknown as SideChatClientSessions,
    )
    controller.openDraft()

    render(<Rc6SideChatOverlay
      controller={controller}
      sessions={sessions as unknown as Rc6SideChatSessions}
    />)
    expect(screen.getByRole('complementary', { name: 'Side Chat' })).toBeInTheDocument()

    fireEvent.keyUp(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('complementary', { name: 'Side Chat' })).not.toBeInTheDocument()
    })
  })
})
