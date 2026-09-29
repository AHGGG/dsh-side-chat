// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReadOnlyConversation } from '../../src/client/dsh/ReadOnlyConversation.js'
import type { SideChatController } from '../../src/client/side-chat-controller.js'
import { SideChatId, type SideChatState } from '../../src/shared/contracts.js'
import { deferred } from '../fixtures/client-runtime.js'

afterEach(cleanup)
const state: SideChatState = { phase: 'ready', chatId: SideChatId('discussion'), draft: '', messages: [
  { id: 'user', role: 'user', text: 'Why <this> & that?', selectedText: 'Selected passage', status: 'complete' },
  { id: 'assistant', role: 'assistant', text: '# Explanation\n\n**Important**', reasoning: 'Inspect the context.\nThen explain.', status: 'complete' },
] }
describe('read-only conversation', () => {
  it('renders exactly one annotation and the plain question, with an empty follow-up composer', () => {
    const { container } = render(<ReadOnlyConversation state={state} controller={{} as SideChatController} />)
    expect(screen.getAllByRole('button', { name: 'Expand: Selected passage' })).toHaveLength(1)
    expect(container.querySelector('.dsh-side-chat-message-text')?.textContent).toBe('Why <this> & that?')
    expect(container.textContent).not.toContain('<selected_context>')
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.getByRole('heading', { name: 'Explanation' })).toBeInTheDocument()
    expect(screen.getByText('Important').tagName).toBe('STRONG')
    expect(screen.queryByRole('button', { name: /Allow once|Steer/ })).not.toBeInTheDocument()
  })
  it('does not parse a user-authored XML-looking question as internal prompt data', () => {
    const text = '<selected_context>Literal</selected_context> <user_question>Literal</user_question>'
    const { container } = render(<ReadOnlyConversation state={{ ...state, messages: [{ id: 'u', role: 'user', text, status: 'complete' }] }}
      controller={{} as SideChatController} />)
    expect(container.querySelector('.dsh-side-chat-message-text')?.textContent).toBe(text)
    expect(screen.queryByRole('button', { name: 'Expand: Selected passage' })).not.toBeInTheDocument()
  })
  it('preserves edits typed before admission and handles IME safely', async () => {
    const admission = deferred<{ ok: true; value: undefined }>()
    const send = vi.fn(() => admission.promise)
    render(<ReadOnlyConversation state={state} controller={{ send } as unknown as SideChatController} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'First follow-up' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(send).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    fireEvent.change(input, { target: { value: 'Next draft' } })
    await act(async () => { admission.resolve({ ok: true, value: undefined }) })
    expect(send).toHaveBeenCalledWith('First follow-up')
    expect(input).toHaveValue('Next draft')
  })
  it('shows early send rejections without losing the follow-up draft', async () => {
    const send = vi.fn(async () => ({ ok: false, error: { message: 'Wait for Stop to finish' } }))
    render(<ReadOnlyConversation state={state} controller={{ send, getSnapshot: () => state } as unknown as SideChatController} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Keep this question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Wait for Stop to finish')
    expect(screen.getByRole('textbox')).toHaveValue('Keep this question')
  })
  it('offers Stop but not Steer or tool approval controls while running', async () => {
    const cancel = vi.fn(async () => ({ ok: false, error: { message: 'Stop failed' } }))
    render(<ReadOnlyConversation state={{ ...state, phase: 'running' }} controller={{ cancel } as unknown as SideChatController} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Later' } })
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Stop generating' }))
    expect(cancel).toHaveBeenCalledOnce()
    expect(await screen.findByRole('alert')).toHaveTextContent('Stop failed')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Stop generating' })).not.toBeDisabled())
    expect(screen.queryByRole('button', { name: 'Steer' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Tool approval required' })).not.toBeInTheDocument()
  })
  it('keeps reasoning in its own disclosure', () => {
    const { container } = render(<ReadOnlyConversation state={state} controller={{} as SideChatController} />)
    const disclosure = screen.getByRole('button', { name: /Think.*Inspect the context/ })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(disclosure)
    expect(container.querySelector('.dsh-side-chat-reasoning-body')).toHaveTextContent('Inspect the context. Then explain.')
  })
  it('does not force scrolling to the bottom after the user scrolls up', () => {
    const { container, rerender } = render(<ReadOnlyConversation state={state} controller={{} as SideChatController} />)
    const transcript = container.querySelector<HTMLElement>('.dsh-side-chat-transcript')!
    Object.defineProperty(transcript, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(transcript, 'clientHeight', { value: 200, configurable: true })
    transcript.scrollTop = 100
    fireEvent.scroll(transcript)
    rerender(<ReadOnlyConversation state={{ ...state, messages: [...state.messages,
      { id: 'later', role: 'assistant', text: 'New tokens', status: 'streaming' },
    ] }} controller={{} as SideChatController} />)
    expect(transcript.scrollTop).toBe(100)
  })
})
