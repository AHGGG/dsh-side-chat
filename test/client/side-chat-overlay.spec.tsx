// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render as renderReact, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ModelDirectory, ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { SideChatModelPreferences } from '../../src/client/model-preference.js'
import type { SideChatClientSessions } from '../../src/client/contracts.js'
import {
  addSelectionToConversation,
  conversationAnnotations,
  removeConversationAnnotation,
  updateConversationAnnotation,
} from '../../src/client/parent-composer/add-to-conversation.js'
import { SideChatOverlay as Rc6SideChatOverlay } from '../../src/client/dsh/SideChatOverlay.js'
import { lexicalComposerReferenceFixture } from './composer-reference-fixture.js'
import type { DshSideChatSessions as Rc6SideChatSessions } from '../../src/client/dsh/sessions-adapter.js'
import { SideChatController } from '../../src/client/side-chat-controller.js'
import type { ConversationSelection, SideChatModelSelection, SideChatRemote } from '../../src/shared/contracts.js'
import { SessionId, SideChatId } from '../../src/shared/contracts.js'
import { FakeClientSessions, FakeRemote } from '../fixtures/client-runtime.js'

const render = (ui: Parameters<typeof renderReact>[0]) => renderReact(ui, {
  wrapper: ({ children }) => <div data-conversation-session="parent-1">{children}</div>,
})

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
  retainParent: () => () => {},
  subscribeConversationInput: () => () => {},
  currentConversationInputSnapshot: () => undefined,
  removeConversationAnnotation: () => false,
  updateConversationAnnotation: () => false,
  sideChatModelPreference: () => undefined,
  rememberSideChatModelPreference: () => {},
}

function parentComposerFixture() {
  return lexicalComposerReferenceFixture()
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  captureMocks.capture.mockReset()
})

describe('Side Chat overlay selection lifecycle', () => {
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
    await waitFor(() => { expect(screen.getByRole('textbox')).toHaveFocus() })
  })

  it('saves an annotation through the DSH 0.2 Lexical composer', async () => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)
    const composer = lexicalComposerReferenceFixture()
    const notify = vi.fn()
    const sessions = {
      subscribeList: () => () => {},
      subscribeConversationInput: composer.input.state.subscribe,
      currentConversationInputSnapshot: composer.input.state.getSnapshot,
      currentSessionId: () => SessionId('parent-1'),
      face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => conversationAnnotations(composer.snapshot()).length + 1,
      addSelectionToConversation: (selection: ConversationSelection, comment?: string) =>
        addSelectionToConversation(composer.input, selection, comment),
      reconcileConversationAnnotationPersistence: vi.fn(),
      notify,
    }
    const controller = new SideChatController(
      {} as SideChatRemote,
      sessions as unknown as SideChatClientSessions,
    )

    render(<>
      <div data-chat-flow />
      <div data-composer-seat><textarea /></div>
      <Rc6SideChatOverlay
        controller={controller}
        sessions={sessions as unknown as Rc6SideChatSessions}
      />
    </>)

    fireEvent.mouseUp(document.body)
    fireEvent.click(await screen.findByRole('button', { name: 'Add to chat' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Optional annotation comment' }), {
      target: { value: 'My Lexical note' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(conversationAnnotations(composer.snapshot())).toEqual([{
      text: 'Selected text',
      comment: 'My Lexical note',
    }])
    expect(composer.snapshot().occurrences).toHaveLength(1)
    expect(notify).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Add annotation comment' })).not.toBeInTheDocument()
  })

  it('adds the settled Side Chat history to the parent composer from the header', async () => {
    const state = {
      phase: 'ready' as const,
      parentSessionId: SessionId('parent-1'),
      chatId: SideChatId('chat-1'),
      boundarySeq: 7,
      draft: '',
      messages: [
        { id: 'u', role: 'user', text: 'Compare the options.', status: 'complete' },
        { id: 'a', role: 'assistant', text: 'Use the second option.', status: 'complete' },
      ],
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
    const addSideChatToConversation = vi.fn(() => true)
    const openSession = vi.fn(async () => {})
    const sessions = {
      ...EMPTY_CONVERSATION_INPUT,
      subscribeList: () => () => {},
      currentSessionId: () => SessionId('parent-1'),
      face: () => undefined,
      title: () => 'Architecture',
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
        conversationId: 'chat-1',
        title: 'Side Chat · Architecture',
        conversation: [{
          role: 'user',
          content: 'Compare the options.',
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

  it.each(['Ask in side chat', 'More details'])('opens %s without a child Session and without XML in the question', async action => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)
    const remote = new FakeRemote()
    remote.autoFinish = true
    const sessions = Object.assign(new FakeClientSessions(), EMPTY_CONVERSATION_INPUT, {
      subscribeList: () => () => {}, face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => 1, title: () => 'Main',
    })
    const controller = new SideChatController(remote, sessions)
    render(<><div data-chat-flow /><Rc6SideChatOverlay controller={controller}
      sessions={sessions as unknown as Rc6SideChatSessions} /></>)
    fireEvent.mouseUp(document.body)
    fireEvent.click(await screen.findByRole('button', { name: action }))
    const question = action === 'More details' ? 'Please explain the selected passage in more detail.' : 'Why this part?'
    if (action === 'Ask in side chat') {
      expect(remote.createCalls).toHaveLength(0)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: question } })
      fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    }
    await waitFor(() => expect(controller.getSnapshot().phase).toBe('ready'))
    expect(remote.createCalls).toHaveLength(1)
    expect(remote.streamCalls[0]?.text).toBe(question)
    expect(screen.getByText(question).closest('.dsh-side-chat-message')).not.toBeNull()
    expect(screen.getAllByRole('button', { name: 'Expand: Selected passage' })).toHaveLength(1)
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(sessions.opened).toEqual([])
    await act(async () => { await controller.dispose() })
  })

  it.each(['Ask in side chat', 'More details'])('keeps thinking-level choices available during %s and remembers them for More details', async action => {
    captureMocks.capture.mockResolvedValue(selectedPassage)
    vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)
    let saved: string | null = null
    const storage = { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value } }
    const preferences = new SideChatModelPreferences(storage)
    const modelState: ModelDirectoryState = {
      status: 'ready', current: { provider: 'test', model: 'test-model', reasoningEffort: 'low' },
      routable: true, pending: null, error: null, failures: [], groups: [{
        id: 'test', name: 'Test', models: [{
          id: 'test-model', name: 'Test Model', reasoning: { defaultEffort: 'low', efforts: [
            { id: 'low', name: 'Low' }, { id: 'high', name: 'High' },
          ] },
        }],
      }],
    }
    const directory = {
      store: { getSnapshot: () => modelState, subscribe: () => () => {} }, load: async () => modelState,
    } as unknown as ModelDirectory
    const remote = new FakeRemote()
    const sessions = Object.assign(new FakeClientSessions(), EMPTY_CONVERSATION_INPUT, {
      subscribeList: () => () => {}, face: () => ({ getSnapshot: () => ({}) }),
      nextConversationAnnotationNumber: () => 1, title: () => 'Main', modelDirectory: () => directory,
      sideChatModelPreference: () => preferences.get(),
      rememberSideChatModelPreference: (choice: SideChatModelSelection) => { preferences.set(choice) },
    })
    const controller = new SideChatController(remote, sessions)
    render(<><div data-chat-flow /><Rc6SideChatOverlay controller={controller}
      sessions={sessions as unknown as Rc6SideChatSessions} /></>)
    try {
      fireEvent.mouseUp(document.body)
      fireEvent.click(await screen.findByRole('button', { name: action }))
      if (action === 'Ask in side chat') {
        expect(screen.getByRole('button', { name: /Select model/ })).not.toBeDisabled()
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Why this part?' } })
        fireEvent.click(screen.getByRole('button', { name: 'Send' }))
      }
      await waitFor(() => expect(controller.getSnapshot().phase).toBe('running'))
      const firstModel = remote.streamModels[0]
      const trigger = screen.getByRole('button', { name: /Select model/ })
      expect(trigger).not.toBeDisabled()
      fireEvent.click(trigger)
      fireEvent.click(screen.getByRole('menuitem', { name: /Effort/ }))
      fireEvent.click(screen.getByRole('menuitemradio', { name: /High/ }))
      await waitFor(() => expect(controller.getSnapshot().modelSelection?.reasoningEffort).toBe('high'))
      const chosen = { provider: 'test', model: 'test-model', reasoningEffort: 'high' }
      expect(new SideChatModelPreferences(storage).get()).toEqual(chosen)
      expect(remote.streamModels[0]).toEqual(firstModel)
      expect(remote.cancelCalls).toHaveLength(0)
      fireEvent.click(screen.getByRole('button', { name: 'Close Side Chat' }))
      await waitFor(() => expect(controller.getSnapshot().phase).toBe('closed'))

      fireEvent.mouseUp(document.body)
      fireEvent.click(await screen.findByRole('button', { name: 'More details' }))
      await waitFor(() => expect(controller.getSnapshot().phase).toBe('running'))
      expect(remote.createCalls[1]?.modelSelection).toEqual(chosen)
      expect(remote.streamModels[1]).toEqual(chosen)
      expect(screen.getByRole('button', { name: /Select model/ })).toHaveTextContent('High')
    } finally { await act(async () => { await controller.dispose() }) }
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
      expect(composer.snapshot()).toMatchObject({ draft: ' ', occurrences: [] })
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

  it('does not archive a Side Chat when Escape is handled elsewhere', async () => {
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
    expect(screen.getByRole('complementary', { name: 'Side Chat' })).toBeInTheDocument()
  })
})
