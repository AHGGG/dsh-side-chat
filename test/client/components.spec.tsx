// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SideChatPanel } from '../../src/client/panel/SideChatPanel.js'
import { SelectionActions } from '../../src/client/selection/SelectionActions.js'
import { annotatedUserMessageRenderer, mountParentConversationAnnotations, ParentComposerAnnotations } from '../../src/client/parent-composer/ParentConversationAnnotations.js'
import { addSelectionToConversation, buildSideChatPrompt } from '../../src/client/parent-composer/add-to-conversation.js'
import { serializeReferencedConversation } from '../../src/client/parent-composer/referenced-conversation.js'
import { SessionId, SideChatId, type ConversationSelection, type SideChatState } from '../../src/shared/contracts.js'
import { lexicalComposerReferenceFixture } from './composer-reference-fixture.js'

const selection: ConversationSelection = {
  parentSessionId: SessionId('parent-1'), fragments: [], text: 'A selected passage.', atSeq: 7,
  rect: { x: 100, y: 100, width: 80, height: 20, viewportWidth: 800, viewportHeight: 600 },
}
const draftState: SideChatState = { phase: 'draft', parentSessionId: SessionId('parent-1'), selection,
  draft: 'What does this mean?', messages: [] }
const ok = async () => ({ ok: true as const, value: undefined })
const panelProps = { state: draftState, onDraftChange: () => {}, onFirstSend: ok,
  onClose: ok, onRetry: ok, onFocusParent: () => {} }
afterEach(() => { cleanup(); vi.restoreAllMocks() })
const NativeUserMessage = ({ node }: { readonly node: { readonly data: {
  readonly content: readonly unknown[]; readonly referenceLabels?: readonly string[]
} } }) => <div data-testid="native-message" data-labels={JSON.stringify(node.data.referenceLabels ?? [])}>
  {node.data.content.map(block => typeof block === 'object' && block !== null && 'text' in block ? String(block.text) : '').join('')}
</div>

describe('Side Chat panel and parent annotations', () => {
  it('collects a comment, while Ask and More details open focused discussions', () => {
    const add = vi.fn(), ask = vi.fn(), more = vi.fn(), dismiss = vi.fn()
    const actions = <SelectionActions selection={selection} onAddToChat={add} onAskInSideChat={ask} onMoreDetails={more} onDismiss={dismiss} />
    render(actions)
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['Add to chat', 'More details', 'Ask in side chat'])
    fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
    const input = screen.getByRole('textbox', { name: 'Optional annotation comment' })
    fireEvent.change(input, { target: { value: 'Important' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(add).toHaveBeenCalledWith(selection, 'Important')
    expect(dismiss).toHaveBeenCalledOnce()
    cleanup(); render(actions)
    fireEvent.click(screen.getByRole('button', { name: 'More details' }))
    expect(more).toHaveBeenCalledWith(selection)
    cleanup(); render(actions)
    fireEvent.click(screen.getByRole('button', { name: 'Ask in side chat' }))
    expect(ask).toHaveBeenCalledWith(selection)
  })
  it('edits an existing annotation without reopening the selection toolbar', () => {
    const update = vi.fn()
    render(<SelectionActions selection={selection} annotationNumber={2}
      annotationEditor={{ initialComment: 'Existing note', dialogLabel: 'Edit annotation comment' }}
      onAddToChat={update} onMoreDetails={() => {}} onAskInSideChat={() => {}} onDismiss={() => {}} />)
    const editor = screen.getByRole('textbox', { name: 'Optional annotation comment' })
    expect(editor).toHaveValue('Existing note')
    expect(screen.queryByRole('button', { name: 'Add to chat' })).not.toBeInTheDocument()
    fireEvent.change(editor, { target: { value: 'Revised note' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(update).toHaveBeenCalledWith(selection, 'Revised note')
  })
  it('explains why opening another discussion is disabled', () => {
    render(<SelectionActions selection={selection} askDisabledReason="Close the current Side Chat first"
      onAddToChat={() => {}} onMoreDetails={() => {}} onAskInSideChat={() => {}} onDismiss={() => {}} />)
    expect(screen.getByRole('button', { name: 'Ask in side chat' })).toHaveAttribute('title', 'Close the current Side Chat first')
    expect(screen.getByRole('button', { name: 'More details' })).toHaveAttribute('title', 'Close the current Side Chat first')
  })
  it('submits plain text and closes without a confirmation dialog', async () => {
    const send = vi.fn(ok), close = vi.fn(ok)
    render(<SideChatPanel {...panelProps} onFirstSend={send} onClose={close} />)
    const quote = screen.getByRole('button', { name: 'Expand: Selected passage' })
    expect(quote).toHaveTextContent('1 annotation')
    fireEvent.click(quote)
    expect(screen.getByText(selection.text)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(send).toHaveBeenCalledWith(draftState.draft))
    fireEvent.click(screen.getByRole('button', { name: 'Close Side Chat' }))
    expect(close).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Read-only parent context; no Session copy')).toBeInTheDocument()
    expect(screen.getByText('No tools or file changes')).toBeInTheDocument()
  })
  it('handles IME and Shift+Enter without sending, then sends on Enter', async () => {
    const send = vi.fn(ok)
    render(<SideChatPanel {...panelProps} onFirstSend={send} />)
    const input = screen.getByRole('textbox')
    expect(fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })).toBe(true)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    expect(send).not.toHaveBeenCalled()
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(send).toHaveBeenCalledOnce())
  })
  it('lets the expanded preview consume Escape before the panel', () => {
    const close = vi.fn(ok)
    render(<SideChatPanel {...panelProps} onClose={close} />)
    const quote = screen.getByRole('button', { name: 'Expand: Selected passage' })
    fireEvent.click(quote); fireEvent.keyDown(quote, { key: 'Escape' })
    expect(close).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
    expect(close).toHaveBeenCalledOnce()
  })
  it('removes the selected attachment before context capture', () => {
    const remove = vi.fn()
    render(<SideChatPanel {...panelProps} onRemoveSelection={remove} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove annotation' }))
    expect(remove).toHaveBeenCalledOnce()
  })
  it('constrains the preview to the panel boundary', () => {
    render(<SideChatPanel {...panelProps} />)
    const panel = screen.getByRole('complementary', { name: 'Side Chat' })
    const preview = screen.getByRole('tooltip')
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ left: 100, right: 700 } as DOMRect)
    vi.spyOn(preview, 'getBoundingClientRect').mockReturnValue({ left: 50, right: 570 } as DOMRect)
    fireEvent.mouseEnter(screen.getByRole('region', { name: 'Selected passage' }))
    expect(preview.style.getPropertyValue('--dsh-side-chat-quote-offset-x')).toBe('66px')
  })
  it('keeps the preview open across the pointer gap', () => {
    vi.useFakeTimers()
    try {
      render(<SideChatPanel {...panelProps} />)
      const quote = screen.getByRole('region', { name: 'Selected passage' })
      fireEvent.mouseEnter(quote); fireEvent.mouseLeave(quote)
      act(() => { vi.advanceTimersByTime(219) })
      expect(quote).toHaveAttribute('data-hovered')
      act(() => { vi.advanceTimersByTime(1) })
      expect(quote).not.toHaveAttribute('data-hovered')
    } finally { vi.useRealTimers() }
  })
  it('shows the add action only when its caller allows capturing the transcript', () => {
    const add = vi.fn()
    const state: SideChatState = { ...draftState, phase: 'ready', chatId: SideChatId('discussion'),
      messages: [{ id: 'u', role: 'user', text: 'Why?', status: 'complete' }] }
    const { rerender } = render(<SideChatPanel {...panelProps} state={state}
      embeddedConversation={<div>Transcript</div>} onAddToConversation={add} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to conversation' }))
    expect(add).toHaveBeenCalledOnce()
    expect(screen.getByText('Transcript')).toBeInTheDocument()
    rerender(<SideChatPanel {...panelProps} state={{ ...state, phase: 'running' }} onAddToConversation={add} addToConversationDisabled />)
    expect(screen.getByRole('button', { name: 'Add to conversation' })).toBeDisabled()
  })
  it('keeps close errors visible and retryable', () => {
    render(<SideChatPanel {...panelProps} state={{ ...draftState, phase: 'error',
      error: { code: 'transport_error', message: 'Offline', recoverable: true, operation: 'close' } }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Offline')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
  it('reserves the visible capsule width for the durable composer reference', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 150.75 } as DOMRect)
    const fixture = lexicalComposerReferenceFixture()
    addSelectionToConversation(fixture.input, selection)
    const { unmount } = render(<div data-composer-seat=""><ParentComposerAnnotations input={fixture.snapshot()} onRemove={() => {}} />
      <span data-composer-chip="dsh-side-chat-selection" /></div>)
    const seat = document.querySelector<HTMLElement>('[data-composer-seat]')!
    expect(seat.style.getPropertyValue('--dsh-side-chat-parent-annotation-width')).toBe('150.75px')
    unmount()
    expect(seat.style.getPropertyValue('--dsh-side-chat-parent-annotation-width')).toBe('')
  })
  it('registers and removes the parent annotation docks and renderer wrappers', () => {
    const remove = vi.fn()
    const register = vi.fn(() => remove)
    const inject = vi.fn((_name: string, mount: () => () => void) => mount())
    const dispose = mountParentConversationAnnotations({ slots: { register, inject, entries: () => [] } } as never, () => {})
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ name: 'conversation.input.dock', order: 30 }), expect.any(Function))
    dispose()
    expect(remove).toHaveBeenCalledTimes(3)
  })
  it.each(['\n', '\r\n'])('projects stored annotated prompts without double-decoding literal XML (%j)', newline => {
    const question = '<user_question>Literal &amp; text.</user_question>'
    const prompt = buildSideChatPrompt(selection, question)[0]!
    const Renderer = annotatedUserMessageRenderer(NativeUserMessage)
    render(<Renderer node={{ data: { content: [{ type: 'text', text: ` \n${prompt.text}`.replaceAll('\n', newline) }] } }} />)
    expect(screen.getByTestId('native-message').textContent?.trim()).toBe(question)
    expect(screen.getAllByRole('button', { name: 'Expand: Selected passage' })).toHaveLength(1)
  })
  it('renders several referenced discussions as labels, not their serialized histories', () => {
    const first = { version: 1 as const, conversationId: 'discussion-1', title: 'First', conversation: [{ role: 'user' as const, content: 'Hidden first question' }] }
    const second = { ...first, conversationId: 'discussion-2', title: 'Second' }
    const Renderer = annotatedUserMessageRenderer(NativeUserMessage)
    render(<Renderer node={{ data: { content: [{ type: 'text',
      text: `${serializeReferencedConversation(first)}\n\n${serializeReferencedConversation(second)}\n\nContinue.`,
    }] } }} />)
    expect(screen.getByTestId('native-message')).toHaveTextContent('@First @Second Continue.')
    expect(screen.getByTestId('native-message')).toHaveAttribute('data-labels', '["First","Second"]')
    expect(screen.getByTestId('native-message')).not.toHaveTextContent('Hidden first question')
  })
})
