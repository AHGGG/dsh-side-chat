// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  SideChatConversationFace as SessionFace,
  SideChatConversationSnapshot as ConversationSnapshot,
} from '../../src/client/rc6/runtime-compat.js'
import type { SideChatClientSessions } from '../../src/client/contracts.js'
import {
  addSelectionToConversation,
  conversationAnnotations,
  removeConversationAnnotation,
  updateConversationAnnotation,
} from '../../src/client/parent-composer/add-to-conversation.js'
import { Rc6SideChatOverlay } from '../../src/client/rc6/Rc6SideChatOverlay.js'
import { composerReferenceFixture } from './composer-reference-fixture.js'
import type { Rc6SideChatSessions } from '../../src/client/rc6/sessions-adapter.js'
import { SideChatController } from '../../src/client/side-chat-controller.js'
import type { ConversationSelection, SideChatRemote } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'

const captureMocks = vi.hoisted(() => ({
  capture: vi.fn(),
}))

vi.mock('../../src/client/selection/selection-controller.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/client/selection/selection-controller.js')>()),
  captureDomConversationSelection: captureMocks.capture,
}))

const selectedPassage: ConversationSelection = {
  parentSessionId: SessionId('parent-1'),
  fragments: [{
    nodeKey: 'node-1',
    nodeKind: 'assistant-step',
    turnKey: 'turn:1',
    seq: 7,
    startOffset: 0,
    endOffset: 13,
    text: 'Selected text',
    source: 'assistant',
    modelVisible: true,
    settled: true,
  }],
  text: 'Selected text',
  atSeq: 7,
  rect: { x: 20, y: 20, width: 80, height: 20, viewportWidth: 800, viewportHeight: 600 },
}

const EMPTY_CONVERSATION_INPUT = {
  subscribeConversationInput: () => () => {},
  currentConversationInputSnapshot: () => undefined,
  removeConversationAnnotation: () => false,
  updateConversationAnnotation: () => false,
  sideChatModelPreference: () => undefined,
  rememberSideChatModelPreference: () => {},
}

function parentComposerFixture() {
  return composerReferenceFixture('', 'legacy')
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
      ...EMPTY_CONVERSATION_INPUT,
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => 1,
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

  it('captures a touch selection after transient selectionchange timing settles', async () => {
    vi.useFakeTimers()
    try {
      captureMocks.capture.mockResolvedValue(selectedPassage)
      let browserSelection = { isCollapsed: true } as Selection
      vi.spyOn(window, 'getSelection').mockImplementation(() => browserSelection)

      const sessions = {
        ...EMPTY_CONVERSATION_INPUT,
        subscribeList: () => () => {},
        currentSessionId: () => SessionId('parent-1'),
        face: () => ({ getSnapshot: () => ({}) }),
        nextConversationAnnotationNumber: () => 1,
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

      fireEvent.touchStart(document.body)
      fireEvent(document, new Event('selectionchange'))
      await act(async () => { await vi.advanceTimersByTimeAsync(100) })

      browserSelection = { isCollapsed: false } as Selection
      fireEvent(document, new Event('selectionchange'))
      fireEvent.touchEnd(document.body)
      fireEvent.mouseDown(document.body)
      fireEvent.mouseUp(document.body)

      await act(async () => { await vi.advanceTimersByTimeAsync(300) })

      expect(captureMocks.capture).toHaveBeenCalledOnce()
      expect(screen.getByRole('toolbar')).toHaveAttribute('data-touch', 'true')

      fireEvent.pointerDown(screen.getByRole('button', { name: 'Add to chat' }), {
        pointerType: 'touch',
      })
      expect(screen.getByRole('dialog', { name: 'Add annotation comment' })).toBeInTheDocument()
      // The touchstart and compatibility mouse events can arrive after
      // pointerdown has already replaced the toolbar with the editor.
      fireEvent.touchStart(document.body)
      fireEvent.touchEnd(document.body)
      fireEvent.mouseDown(document.body)
      fireEvent.mouseUp(document.body)
      fireEvent(document, new Event('selectionchange'))
      await act(async () => { await vi.advanceTimersByTimeAsync(300) })

      expect(captureMocks.capture).toHaveBeenCalledOnce()
      expect(screen.getByRole('dialog', { name: 'Add annotation comment' })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('dialog', { name: 'Add annotation comment' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Ask in side chat' })).not.toBeInTheDocument()
      // Some mobile engines retarget the rest of a touch sequence after Cancel
      // removes the complete interaction. It must not recapture the still-native
      // browser selection.
      fireEvent.touchStart(document.body)
      fireEvent.touchEnd(document.body)
      fireEvent.mouseDown(document.body)
      fireEvent.mouseUp(document.body)
      fireEvent(document, new Event('selectionchange'))
      await act(async () => { await vi.advanceTimersByTimeAsync(300) })

      expect(captureMocks.capture).toHaveBeenCalledOnce()
      expect(screen.queryByRole('button', { name: 'Ask in side chat' })).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not restore a stale browser selection after clicking adjacent whitespace', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)

    const sessions = {
      ...EMPTY_CONVERSATION_INPUT,
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => 1,
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

  it('adds the selection to the parent composer without opening a Side Chat', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)
    const addSelectionToConversation = vi.fn(() => true)

    const sessions = {
      ...EMPTY_CONVERSATION_INPUT,
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => 2,
      addSelectionToConversation,
      notify: vi.fn(),
    }
    const controller = new SideChatController(
      {} as SideChatRemote,
      sessions as unknown as SideChatClientSessions,
    )

    render(<>
      <div data-chat-flow />
      <div data-composer-seat><textarea defaultValue="Existing draft" /></div>
      <Rc6SideChatOverlay
        controller={controller}
        sessions={sessions as unknown as Rc6SideChatSessions}
      />
    </>)

    fireEvent.mouseUp(document.body)
    fireEvent.click(await screen.findByRole('button', { name: 'Add to chat' }))
    expect(screen.getByRole('dialog', { name: 'Add annotation comment' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Optional annotation comment' }), {
      target: { value: 'My note' },
    })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Optional annotation comment' }), { key: 'Enter' })

    expect(addSelectionToConversation).toHaveBeenCalledWith(selectedPassage, 'My note')
    expect(screen.queryByRole('complementary', { name: 'Side Chat' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add to chat' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveFocus()
  })

  it('adds the settled Side Chat history to the parent composer from the header', async () => {
    const state = {
      phase: 'ready' as const,
      parentSessionId: SessionId('parent-1'),
      childSessionId: SessionId('child-1'),
      boundarySeq: 7,
      inheritedThroughSeq: 7,
      draft: '',
    }
    const controller = {
      subscribe: () => () => {},
      getSnapshot: () => state,
      setDraft: vi.fn(),
      sendFirst: vi.fn(),
      close: vi.fn(),
      retry: vi.fn(),
      clearSelection: vi.fn(),
    } as unknown as SideChatController
    const snapshot = {
      nodes: [{
        kind: 'user',
        seq: 7,
        content: [{ type: 'text', text: 'Inherited parent history' }],
      }, {
        kind: 'user',
        seq: 8,
        content: [{ type: 'text', text: '<user_question>Compare the options.</user_question>' }],
      }, {
        kind: 'assistant',
        seq: 9,
        blocks: [{ kind: 'text', text: 'Use the second option.' }],
        interrupted: false,
      }],
      openState: 'open',
      partial: null,
      pending: [],
      queue: [],
      runningCalls: [],
      running: false,
      promptError: null,
    } as unknown as ConversationSnapshot
    const face = {
      subscribe: () => () => {},
      getSnapshot: () => snapshot,
    } as unknown as SessionFace
    const addSideChatToConversation = vi.fn(() => true)
    const openSession = vi.fn(async () => {})
    const sessions = {
      ...EMPTY_CONVERSATION_INPUT,
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: (sessionId: string) => sessionId === 'child-1' ? face : undefined,
      cwd: () => undefined,
      title: () => 'Side Chat · Architecture',
      addSideChatToConversation,
      openSession,
      notify: vi.fn(),
    }

    render(<>
      <div data-composer-seat><textarea /></div>
      <Rc6SideChatOverlay
        controller={controller}
        sessions={sessions as unknown as Rc6SideChatSessions}
      />
    </>)

    fireEvent.click(screen.getByRole('button', { name: 'Add to conversation' }))

    expect(addSideChatToConversation).toHaveBeenCalledWith(
      SessionId('parent-1'),
      {
        version: 1,
        conversationId: 'child-1',
        title: 'Side Chat · Architecture',
        conversation: [{
          role: 'user',
          content: '<user_question>Compare the options.</user_question>',
        }, {
          role: 'assistant',
          content: 'Use the second option.',
        }],
      },
    )
    await waitFor(() => {
      expect(openSession).toHaveBeenCalledWith(SessionId('parent-1'))
      expect(document.querySelector('[data-composer-seat] textarea')).toHaveFocus()
    })
  })

  it('keeps an added annotation marker interactive and edits its comment in place', async () => {
    const originalClientRects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects')
    const originalBoundingRect = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect')
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [],
    })
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 20,
        y: 40,
        left: 20,
        top: 40,
        right: 100,
        bottom: 60,
        width: 80,
        height: 20,
      } as DOMRect),
    })
    const composer = parentComposerFixture()
    const update = vi.fn((annotationIndex: number, comment?: string) =>
      updateConversationAnnotation(composer.input, annotationIndex, comment))
    const remove = vi.fn((annotationIndex: number) =>
      removeConversationAnnotation(composer.input, annotationIndex))
    const reconcilePersistence = vi.fn()
    const sessions = {
      subscribeList: () => () => {},
      subscribeConversationInput: composer.input.state.subscribe,
      currentConversationInputSnapshot: composer.input.state.getSnapshot,
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => conversationAnnotations(composer.snapshot()).length + 1,
      addSelectionToConversation: (selection: ConversationSelection, comment?: string) =>
        addSelectionToConversation(composer.input, selection, comment),
      removeConversationAnnotation: remove,
      updateConversationAnnotation: update,
      reconcileConversationAnnotationPersistence: reconcilePersistence,
      notify: vi.fn(),
    }
    const controller = new SideChatController(
      {} as SideChatRemote,
      sessions as unknown as SideChatClientSessions,
    )

    try {
      render(<>
        <div data-chat-flow><p data-chat-anchor-key="node-1">Selected text</p></div>
        <div data-composer-seat><textarea /></div>
        <Rc6SideChatOverlay
          controller={controller}
          sessions={sessions as unknown as Rc6SideChatSessions}
        />
      </>)
      await waitFor(() => { expect(reconcilePersistence).toHaveBeenCalled() })
      const sourceText = document.querySelector('[data-chat-anchor-key="node-1"]')!.firstChild!
      const sourceRange = document.createRange()
      sourceRange.selectNodeContents(sourceText)
      window.getSelection()!.removeAllRanges()
      window.getSelection()!.addRange(sourceRange)
      captureMocks.capture.mockResolvedValue(selectedPassage)

      fireEvent.mouseUp(document.body)
      fireEvent.click(await screen.findByRole('button', { name: 'Add to chat' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Optional annotation comment' }), {
        target: { value: 'Initial note' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      const marker = await screen.findByRole('button', { name: 'Edit annotation 1' })
      fireEvent.click(marker)
      await waitFor(() => { expect(window.getSelection()?.toString()).toBe('Selected text') })
      const editor = screen.getByRole('textbox', { name: 'Optional annotation comment' })
      expect(editor).toHaveValue('Initial note')
      expect(screen.getByRole('dialog', { name: 'Edit annotation comment' })).toBeInTheDocument()

      fireEvent.change(editor, { target: { value: 'Revised note' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
      expect(update).toHaveBeenCalledWith(0, 'Revised note')
      expect(conversationAnnotations(composer.snapshot())).toEqual([
        { text: 'Selected text', comment: 'Revised note' },
      ])
      expect(screen.queryByRole('dialog', { name: 'Edit annotation comment' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit annotation 1' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Edit annotation 1' }))
      await act(async () => { await new Promise(resolve => window.requestAnimationFrame(resolve)) })
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(remove).not.toHaveBeenCalled()
      expect(conversationAnnotations(composer.snapshot())).toEqual([
        { text: 'Selected text', comment: 'Revised note' },
      ])
      expect(screen.queryByRole('dialog', { name: 'Edit annotation comment' })).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Edit annotation 1' }))
      await act(async () => { await new Promise(resolve => window.requestAnimationFrame(resolve)) })
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
      expect(remove).toHaveBeenCalledWith(0)
      expect(remove).toHaveLastReturnedWith(true)
      expect(conversationAnnotations(composer.snapshot())).toEqual([])
      expect(composer.snapshot()).toMatchObject({ draft: '', occurrences: [] })
      expect(screen.queryByRole('dialog', { name: 'Edit annotation comment' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Edit annotation 1' })).not.toBeInTheDocument()
    } finally {
      cleanup()
      if (originalClientRects === undefined) delete (Range.prototype as Partial<Range>).getClientRects
      else Object.defineProperty(Range.prototype, 'getClientRects', originalClientRects)
      if (originalBoundingRect === undefined) delete (Range.prototype as Partial<Range>).getBoundingClientRect
      else Object.defineProperty(Range.prototype, 'getBoundingClientRect', originalBoundingRect)
    }
  })

  it('opens a Side Chat and immediately sends the More details prompt', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)

    const sessions = {
      ...EMPTY_CONVERSATION_INPUT,
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => 1,
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

  it('cancels the optional annotation comment when clicking outside', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)
    const addSelectionToConversation = vi.fn(() => true)
    const sessions = {
      ...EMPTY_CONVERSATION_INPUT,
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => 1,
      addSelectionToConversation,
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
    fireEvent.click(await screen.findByRole('button', { name: 'Add to chat' }))
    expect(screen.getByRole('dialog', { name: 'Add annotation comment' })).toBeInTheDocument()

    fireEvent.mouseDown(document.body, { clientX: 600, clientY: 400 })

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Add annotation comment' })).not.toBeInTheDocument()
    })
    expect(addSelectionToConversation).not.toHaveBeenCalled()
  })

  it('closes an open Side Chat with Escape', async () => {
    const sessions = {
      ...EMPTY_CONVERSATION_INPUT,
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
