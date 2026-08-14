// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ConversationSnapshot, SessionFace } from '@deepseek-ai/dsh-client-runtime/client'
import { SideChatPanel } from '../../src/client/panel/SideChatPanel.js'
import { ArchivedConversation } from '../../src/client/rc6/ArchivedConversation.js'
import { SelectionActions } from '../../src/client/selection/SelectionActions.js'
import type { SideChatController } from '../../src/client/side-chat-controller.js'
import type { ConversationSelection, SideChatState } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'

const selection: ConversationSelection = {
  parentSessionId: SessionId('parent-1'),
  fragments: [],
  text: 'A selected passage.',
  atSeq: 7,
  rect: { x: 100, y: 100, width: 80, height: 20, viewportWidth: 800, viewportHeight: 600 },
}

const draftState: SideChatState = {
  phase: 'draft',
  parentSessionId: SessionId('parent-1'),
  selection,
  draft: 'What does this mean?',
}

afterEach(cleanup)

describe('Side Chat components', () => {
  it('offers More details before Ask in side chat', () => {
    const ask = vi.fn()
    const moreDetails = vi.fn()
    const dismiss = vi.fn()
    render(<SelectionActions
      selection={selection}
      onMoreDetails={moreDetails}
      onAskInSideChat={ask}
      onDismiss={dismiss}
    />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map(button => button.textContent)).toEqual(['More details', 'Ask in side chat'])
    fireEvent.click(screen.getByRole('button', { name: 'More details' }))
    expect(moreDetails).toHaveBeenCalledWith(selection)
    expect(dismiss).toHaveBeenCalledOnce()

    dismiss.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Ask in side chat' }))
    expect(ask).toHaveBeenCalledWith(selection)
    expect(dismiss).toHaveBeenCalledOnce()
  })

  it('shows why another Side Chat cannot be opened', () => {
    render(<SelectionActions
      selection={selection}
      askDisabledReason="Close the current Side Chat first"
      onMoreDetails={() => {}}
      onAskInSideChat={() => {}}
      onDismiss={() => {}}
    />)
    expect(screen.getByRole('button', { name: 'More details' }))
      .toHaveAttribute('title', 'Close the current Side Chat first')
    expect(screen.getByRole('button', { name: 'Ask in side chat' }))
      .toHaveAttribute('title', 'Close the current Side Chat first')
  })

  it('submits and closes directly without a confirmation dialog', async () => {
    const send = vi.fn(async () => ({ ok: true as const, value: undefined }))
    const close = vi.fn(async () => ({ ok: true as const, value: undefined }))
    render(<SideChatPanel
      state={draftState}
      onDraftChange={() => {}}
      onFirstSend={send}
      onClose={close}
      onRetry={async () => ({ ok: true, value: undefined })}
      onFocusParent={() => {}}
    />)
    const attachment = screen.getByRole('button', { name: 'Expand: Selected passage' })
    const quote = attachment.closest('.dsh-side-chat-quote')
    expect(attachment).toHaveTextContent('1 annotation')
    expect(quote).not.toHaveAttribute('data-expanded')
    fireEvent.click(attachment)
    expect(quote).toHaveAttribute('data-expanded')
    expect(screen.getByText('A selected passage.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => { expect(send).toHaveBeenCalledWith('What does this mean?') })
    fireEvent.click(screen.getByRole('button', { name: 'Close Side Chat' }))
    await waitFor(() => { expect(close).toHaveBeenCalledOnce() })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sends the first question with Enter and preserves Shift+Enter for a newline', async () => {
    const send = vi.fn(async () => ({ ok: true as const, value: undefined }))
    render(<SideChatPanel
      state={draftState}
      onDraftChange={() => {}}
      onFirstSend={send}
      onClose={async () => ({ ok: true, value: undefined })}
      onRetry={async () => ({ ok: true, value: undefined })}
      onFocusParent={() => {}}
    />)
    const input = screen.getByRole('textbox', { name: 'Ask about this in a Side Chat' })

    expect(fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })).toBe(true)
    expect(send).not.toHaveBeenCalled()
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(false)
    await waitFor(() => { expect(send).toHaveBeenCalledWith('What does this mean?') })
  })

  it('removes the selection attachment before the first send', () => {
    const remove = vi.fn()
    render(<SideChatPanel
      state={draftState}
      onDraftChange={() => {}}
      onFirstSend={async () => ({ ok: true, value: undefined })}
      onClose={async () => ({ ok: true, value: undefined })}
      onRetry={async () => ({ ok: true, value: undefined })}
      onFocusParent={() => {}}
      onRemoveSelection={remove}
    />)

    fireEvent.click(screen.getByRole('button', { name: 'Remove annotation' }))
    expect(remove).toHaveBeenCalledOnce()
  })

  it('keeps the selection preview inside the Side Chat panel', () => {
    render(<SideChatPanel
      state={draftState}
      onDraftChange={() => {}}
      onFirstSend={async () => ({ ok: true, value: undefined })}
      onClose={async () => ({ ok: true, value: undefined })}
      onRetry={async () => ({ ok: true, value: undefined })}
      onFocusParent={() => {}}
    />)

    const panel = screen.getByRole('complementary', { name: 'Side Chat' })
    const quote = screen.getByRole('region', { name: 'Selected passage' })
    const preview = screen.getByRole('tooltip')
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ left: 100, right: 700 } as DOMRect)
    vi.spyOn(preview, 'getBoundingClientRect').mockReturnValue({ left: 50, right: 570 } as DOMRect)

    fireEvent.mouseEnter(quote)

    expect(preview.style.getPropertyValue('--dsh-side-chat-quote-offset-x')).toBe('66px')
  })

  it('keeps a recoverable close error visible with one retry', () => {
    render(<SideChatPanel
      state={{
        ...draftState,
        phase: 'error',
        childSessionId: SessionId('child-1'),
        error: {
          code: 'side_chat_destroy_failed',
          message: 'It may still be running.',
          recoverable: true,
          operation: 'close',
        },
      }}
      embeddedConversation={<div>Child transcript</div>}
      onDraftChange={() => {}}
      onFirstSend={async () => ({ ok: true, value: undefined })}
      onClose={async () => ({ ok: true, value: undefined })}
      onRetry={async () => ({ ok: true, value: undefined })}
      onFocusParent={() => {}}
    />)
    expect(screen.getByRole('alert')).toHaveTextContent('It may still be running.')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('keeps the rc.6 SessionFace receiver while reading its snapshot', () => {
    const snapshot = {
      nodes: [],
      openState: 'cold',
      partial: null,
      pending: [],
      queue: [],
    } as unknown as ConversationSnapshot
    const face = {
      snapshot,
      subscribe(this: { readonly snapshot: ConversationSnapshot }) {
        void this.snapshot
        return () => {}
      },
      getSnapshot(this: { readonly snapshot: ConversationSnapshot }) {
        return this.snapshot
      },
    } as unknown as SessionFace

    render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
    />)

    expect(screen.getByText('Loading Side Chat…')).toBeInTheDocument()
  })

  it('moves the selection attachment above the first sent user message', async () => {
    const snapshot = {
      nodes: [{
        kind: 'user',
        seq: 8,
        content: [{
          type: 'text',
          text: '<selected_context>A selected passage.</selected_context>\n<user_question>Why?</user_question>',
        }],
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
      snapshot,
      subscribe(this: { readonly snapshot: ConversationSnapshot }) {
        void this.snapshot
        return () => {}
      },
      getSnapshot(this: { readonly snapshot: ConversationSnapshot }) {
        return this.snapshot
      },
    } as unknown as SessionFace

    const send = vi.fn(async () => ({ ok: true as const, value: undefined }))
    render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{ send } as unknown as SideChatController}
      selection={selection}
    />)

    const attachment = screen.getByRole('button', { name: 'Expand: Selected passage' })
    const userMessage = screen.getByText('Why?').closest('article')
    expect(userMessage).not.toBeNull()
    expect(attachment.closest('form')).toBeNull()
    expect(attachment.compareDocumentPosition(userMessage as Node) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy()

    const reply = screen.getByPlaceholderText('Reply in Side Chat')
    fireEvent.change(reply, { target: { value: 'Follow up' } })
    expect(fireEvent.keyDown(reply, { key: 'Enter', shiftKey: true })).toBe(true)
    expect(send).not.toHaveBeenCalled()
    expect(fireEvent.keyDown(reply, { key: 'Enter' })).toBe(false)
    await waitFor(() => { expect(send).toHaveBeenCalledWith('Follow up', 'queue') })
  })

  it('uses DSH\'s icon-only stop action while a response is running', () => {
    const snapshot = {
      nodes: [],
      openState: 'open',
      partial: null,
      pending: [],
      queue: [],
      runningCalls: [],
      running: true,
      promptError: null,
    } as unknown as ConversationSnapshot
    const face = {
      snapshot,
      subscribe() { return () => {} },
      getSnapshot: () => snapshot,
    } as unknown as SessionFace
    const cancel = vi.fn(async () => ({ ok: true as const, value: undefined }))

    render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{ cancel } as unknown as SideChatController}
    />)

    const stop = screen.getByRole('button', { name: 'Stop generating' })
    expect(stop).toHaveTextContent('')
    expect(stop.querySelector('rect')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument()
    fireEvent.click(stop)
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('renders assistant text as native DSH Markdown', () => {
    const snapshot = {
      nodes: [{
        kind: 'assistant',
        seq: 8,
        blocks: [{
          kind: 'text',
          text: '# Details\n\n**Important**\n\n- First item\n- Second item',
        }],
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
      snapshot,
      subscribe() { return () => {} },
      getSnapshot: () => snapshot,
    } as unknown as SessionFace

    render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
    />)

    expect(screen.getByRole('heading', { name: 'Details' })).toBeInTheDocument()
    expect(screen.getByText('Important').tagName).toBe('STRONG')
    expect(screen.getAllByRole('listitem').map(item => item.textContent))
      .toEqual(['First item', 'Second item'])
  })
})
