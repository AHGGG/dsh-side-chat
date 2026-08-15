// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ConversationSnapshot, SessionFace } from '@deepseek-ai/dsh-client-runtime/client'
import { SideChatPanel } from '../../src/client/panel/SideChatPanel.js'
import { annotatedUserMessageRenderer } from '../../src/client/parent-composer/ParentConversationAnnotations.js'
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
  it('collects an optional comment before adding the selection to chat', () => {
    const add = vi.fn()
    const ask = vi.fn()
    const moreDetails = vi.fn()
    const dismiss = vi.fn()
    render(<SelectionActions
      selection={selection}
      onAddToChat={add}
      onMoreDetails={moreDetails}
      onAskInSideChat={ask}
      onDismiss={dismiss}
    />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map(button => button.textContent)).toEqual(['Add to chat', 'More details', 'Ask in side chat'])
    fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
    expect(screen.getByRole('dialog', { name: 'Add annotation comment' })).toBeInTheDocument()
    expect(add).not.toHaveBeenCalled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Optional annotation comment' }), {
      target: { value: 'This is the key line.' },
    })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Optional annotation comment' }), { key: 'Enter' })
    expect(add).toHaveBeenCalledWith(selection, 'This is the key line.')
    expect(dismiss).toHaveBeenCalledOnce()

    cleanup()
    render(<SelectionActions
      selection={selection}
      onAddToChat={add}
      onMoreDetails={moreDetails}
      onAskInSideChat={ask}
      onDismiss={dismiss}
    />)
    dismiss.mockClear()
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
      onAddToChat={() => {}}
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

  it('keeps the annotation preview open while the pointer crosses the popup gap', () => {
    vi.useFakeTimers()
    try {
      render(<SideChatPanel
        state={draftState}
        onDraftChange={() => {}}
        onFirstSend={async () => ({ ok: true, value: undefined })}
        onClose={async () => ({ ok: true, value: undefined })}
        onRetry={async () => ({ ok: true, value: undefined })}
        onFocusParent={() => {}}
      />)
      const quote = screen.getByRole('region', { name: 'Selected passage' })
      fireEvent.mouseEnter(quote)
      fireEvent.mouseLeave(quote)
      expect(quote).toHaveAttribute('data-hovered')
      act(() => { vi.advanceTimersByTime(219) })
      expect(quote).toHaveAttribute('data-hovered')
      act(() => { vi.advanceTimersByTime(1) })
      expect(quote).not.toHaveAttribute('data-hovered')
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders sent main-chat annotations above the native user message', () => {
    const NativeUserMessage = ({ node }: {
      readonly node: { readonly data: { readonly content: readonly unknown[] } }
    }) => (
      <div data-testid="native-user-message">
        {node.data.content.map(block => (
          typeof block === 'object' && block !== null && 'text' in block
            ? String((block as { readonly text: unknown }).text)
            : ''
        )).join('')}
      </div>
    )
    const Renderer = annotatedUserMessageRenderer(NativeUserMessage)
    render(<Renderer node={{
      data: {
        content: [{
          type: 'text',
          text: [
            '<selected_context>',
            '<annotation index="1">',
            '<selected_text>',
            'First passage',
            '</selected_text>',
            '<user_comment>',
            'Explain this one first.',
            '</user_comment>',
            '</annotation>',
            '<annotation index="2">',
            'Second passage',
            '</annotation>',
            '</selected_context>',
            '',
            'Explain both.',
          ].join('\n'),
        }],
      },
    }} />)

    expect(screen.getByRole('button', { name: 'Expand: Selected passage' }))
      .toHaveTextContent('2 annotations')
    expect(screen.getByTestId('native-user-message')).toHaveTextContent('Explain both.')
    expect(screen.getByTestId('native-user-message')).not.toHaveTextContent('selected_context')
    fireEvent.click(screen.getByRole('button', { name: 'Expand: Selected passage' }))
    expect(screen.getByText('First passage')).toBeInTheDocument()
    expect(screen.getByText('Explain this one first.')).toBeInTheDocument()
    expect(screen.getByText('Second passage')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove annotation' })).not.toBeInTheDocument()
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

  it('merges a completed tool call and result into one expandable row', () => {
    const snapshot = {
      nodes: [{
        kind: 'assistant',
        seq: 8,
        blocks: [{
          kind: 'tool-call',
          callId: 'call-read-1',
          name: 'read',
          argsRaw: '{"file_path":"E:\\\\github\\\\dsh-side-chat\\\\package.json"}',
        }],
        interrupted: false,
      }, {
        kind: 'tool-result',
        seq: 9,
        callId: 'call-read-1',
        call: {
          name: 'read',
          argsRaw: '{"file_path":"E:\\\\github\\\\dsh-side-chat\\\\package.json"}',
        },
        callTime: 1,
        content: [{
          type: 'text',
          text: '<path>E:\\github\\dsh-side-chat\\package.json</path>\n<type>file</type>\n<content>\n{"name":"@ahggg/dsh-side-chat"}\n</content>',
        }],
        isError: false,
        callView: null,
        resultView: null,
        subCalls: [],
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

    const { container } = render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
    />)

    const rows = container.querySelectorAll('[data-call-id="call-read-1"]')
    expect(rows).toHaveLength(1)
    const row = rows[0] as HTMLElement
    expect(row).toHaveAttribute('data-state', 'success')
    const toolButton = screen.getByRole('button', { name: /Read.*package\.json/u })
    expect(toolButton).toHaveTextContent(/Read.*package\.json/u)
    expect(row).not.toHaveAttribute('data-expanded')
    fireEvent.click(toolButton)
    expect(row).toHaveAttribute('data-expanded')
    expect(row).toHaveTextContent('{"name":"@ahggg/dsh-side-chat"}')
    expect(screen.queryByText('Input')).not.toBeInTheDocument()
    expect(screen.queryByText('Output')).not.toBeInTheDocument()
    expect(screen.queryByText(/<path>/u)).not.toBeInTheDocument()
  })

  it('renders an in-flight call once while the assistant is streaming', () => {
    const call = {
      callId: 'call-grep-1',
      name: 'grep',
      argsRaw: '{"pattern":"runningCalls","path":"src"}',
      turn: 1,
      step: 1,
      time: 1,
      callView: null,
      subCalls: [],
    }
    const snapshot = {
      nodes: [],
      openState: 'open',
      partial: { turn: 1, step: 1, blocks: [{ kind: 'tool-call', ...call }] },
      pending: [],
      queue: [],
      runningCalls: [call],
      running: true,
      promptError: null,
    } as unknown as ConversationSnapshot
    const face = {
      snapshot,
      subscribe() { return () => {} },
      getSnapshot: () => snapshot,
    } as unknown as SessionFace

    const { container } = render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
    />)

    expect(container.querySelectorAll('[data-call-id="call-grep-1"]')).toHaveLength(1)
    expect(container.querySelector('[data-call-id="call-grep-1"]')).toHaveAttribute('data-state', 'running')
    expect(screen.getByRole('button', { name: /Search.*runningCalls/u })).toHaveTextContent(/Search.*runningCalls/u)
    expect(screen.getByText('Running')).toHaveClass('dsh-side-chat-tool-visually-hidden')
  })

  it('uses the native terminal presenter for a structured Pwsh result', () => {
    const snapshot = {
      nodes: [{
        kind: 'tool-result',
        seq: 8,
        callId: 'call-pwsh-native',
        call: {
          name: 'pwsh',
          argsRaw: '{"command":"Get-Content package.json","description":"Inspect package metadata"}',
        },
        callTime: 1,
        content: [{ type: 'text', text: '{"name":"@ahggg/dsh-side-chat"}' }],
        isError: false,
        callView: {
          card: 'terminal',
          title: 'Get-Content package.json',
          description: 'Inspect package metadata',
          cwd: '.',
        },
        resultView: {
          card: 'terminal',
          title: 'Get-Content package.json',
          output: '{"name":"@ahggg/dsh-side-chat"}',
          exitCode: 0,
        },
        subCalls: [],
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

    const { container } = render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
      cwd={'E:\\github\\dsh-side-chat'}
    />)

    const row = container.querySelector('[data-call-id="call-pwsh-native"]') as HTMLElement
    const toolButton = screen.getByRole('button', { name: /Pwsh.*Inspect package metadata/u })
    fireEvent.click(toolButton)
    expect(row).toHaveAttribute('data-expanded')
    expect(row.querySelector('.dsh-side-chat-tool-terminal')).toHaveTextContent('Get-Content package.json')
    expect(row.querySelector('.dsh-side-chat-tool-terminal')).toHaveTextContent('@ahggg/dsh-side-chat')
  })

  it('uses the native read presenter and shortens workspace paths', () => {
    const snapshot = {
      nodes: [{
        kind: 'tool-result',
        seq: 8,
        callId: 'call-read-native',
        call: {
          name: 'read',
          argsRaw: '{"file_path":"E:\\\\github\\\\dsh-side-chat\\\\src\\\\client\\\\index.ts"}',
        },
        callTime: 1,
        content: [{ type: 'text', text: 'export const ready = true' }],
        isError: false,
        callView: null,
        resultView: {
          card: 'read',
          path: 'E:\\github\\dsh-side-chat\\src\\client\\index.ts',
          lines: [{ number: 1, text: 'export const ready = true' }],
          totalLines: 1,
          lang: 'typescript',
        },
        subCalls: [],
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

    const { container } = render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
      cwd={'E:\\github\\dsh-side-chat'}
    />)

    const row = container.querySelector('[data-call-id="call-read-native"]') as HTMLElement
    const toolButton = screen.getByRole('button', { name: /Read.*src\\client\\index\.ts/u })
    expect(toolButton).not.toHaveTextContent('E:\\github\\dsh-side-chat')
    fireEvent.click(toolButton)
    expect(row.querySelector('.dsh-side-chat-tool-read')).toHaveTextContent('export const ready = true')
  })

  it('keeps failed tool output collapsed with the native error summary', () => {
    const snapshot = {
      nodes: [{
        kind: 'tool-result',
        seq: 8,
        callId: 'call-read-error',
        call: { name: 'read', argsRaw: '{"file_path":"missing-file.txt"}' },
        callTime: 1,
        content: [{ type: 'text', text: 'File not found: missing-file.txt' }],
        isError: true,
        callView: null,
        resultView: null,
        subCalls: [],
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

    const { container } = render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
    />)

    const row = container.querySelector('[data-call-id="call-read-error"]')
    expect(row).toHaveAttribute('data-state', 'error')
    expect(row).not.toHaveAttribute('data-expanded')
    const toolButton = screen.getByRole('button', { name: /Read.*File not found: missing-file\.txt/u })
    fireEvent.click(toolButton)
    expect(row).toHaveAttribute('data-expanded')
    expect(screen.getAllByText('File not found: missing-file.txt')).toHaveLength(2)
  })

  it('distinguishes a user-stopped tool from a failed tool', () => {
    const snapshot = {
      nodes: [{
        kind: 'tool-result',
        seq: 8,
        callId: 'call-pwsh-stopped',
        call: { name: 'pwsh', argsRaw: '{"command":"Start-Sleep -Seconds 8"}' },
        callTime: 1,
        content: [{ type: 'text', text: 'Error: tool call aborted' }],
        isError: true,
        error: { name: 'AbortError', code: 'TOOL_CALL_ABORTED' },
        callView: null,
        resultView: null,
        subCalls: [],
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

    const { container } = render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{} as SideChatController}
    />)

    const row = container.querySelector('[data-call-id="call-pwsh-stopped"]')
    expect(row).toHaveAttribute('data-state', 'interrupted')
    expect(row).not.toHaveAttribute('data-expanded')
    expect(screen.getByRole('button', { name: /Pwsh.*Start-Sleep -Seconds 8/u })).toBeInTheDocument()
    expect(screen.getByText('Stopped')).toHaveClass('dsh-side-chat-tool-visually-hidden')
  })

  it('keeps approval and question tool interactions actionable', () => {
    const respondApproval = vi.fn(async () => ({ ok: true as const, value: undefined }))
    const respondQuestion = vi.fn(async () => ({ ok: true as const, value: undefined }))
    const snapshot = {
      nodes: [],
      openState: 'open',
      partial: null,
      pending: [{
        kind: 'approval',
        key: 'approval:1',
        payload: { toolName: 'Edit', reason: 'Modify one source file' },
      }, {
        kind: 'question',
        key: 'question:1',
        payload: {
          questions: [{
            id: 'scope',
            header: 'Scope',
            question: 'Which files?',
            options: [{ label: 'Source only', description: 'Skip generated files' }, { label: 'All files' }],
          }],
        },
      }],
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

    render(<ArchivedConversation
      face={face}
      inheritedThroughSeq={7}
      controller={{ respondApproval, respondQuestion } as unknown as SideChatController}
    />)

    expect(screen.getByRole('region', { name: 'Tool approval required' })).toHaveTextContent('Allow tool: Edit?')
    fireEvent.click(screen.getByRole('button', { name: 'Allow once' }))
    expect(respondApproval).toHaveBeenCalledWith('approval:1', 'approve')

    fireEvent.click(screen.getByRole('radio', { name: /Source only/u }))
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(respondQuestion).toHaveBeenCalledWith('question:1', {
      answers: [{ id: 'scope', selected: ['Source only'] }],
    })
  })
})
