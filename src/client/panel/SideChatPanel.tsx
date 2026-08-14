import { useState, type FormEvent, type ReactNode } from 'react'
import type { SideChatState } from '../../shared/contracts.js'
import type { SideChatActionResult } from '../contracts.js'
import { SIDE_CHAT_MESSAGES } from './messages.js'
import { SelectionQuote } from './SelectionQuote.js'
import { SendIcon } from './SendIcon.js'
import { SideChatBody } from './SideChatBody.js'
import { SideChatErrorState } from './SideChatErrorState.js'
import { SideChatHeader } from './SideChatHeader.js'
import { useAutoGrowingTextarea } from './use-auto-growing-textarea.js'

export interface SideChatPanelProps {
  readonly state: SideChatState
  readonly locale?: 'en' | 'zh-CN'
  readonly embeddedConversation?: ReactNode
  readonly onDraftChange: (draft: string) => void
  readonly onFirstSend: (question: string) => Promise<SideChatActionResult<void>>
  readonly onClose: () => Promise<SideChatActionResult<void>>
  readonly onRetry: () => Promise<SideChatActionResult<unknown>>
  readonly onFocusParent: () => void
  readonly onRemoveSelection?: () => void
}

export function SideChatPanel({
  state,
  locale = 'en',
  embeddedConversation,
  onDraftChange,
  onFirstSend,
  onClose,
  onRetry,
  onFocusParent,
  onRemoveSelection,
}: SideChatPanelProps) {
  const messages = SIDE_CHAT_MESSAGES[locale]
  const [submitting, setSubmitting] = useState(false)
  const draftRef = useAutoGrowingTextarea(state.draft)
  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await onFirstSend(state.draft)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <aside
      className="dsh-side-chat-panel"
      data-side-chat-panel=""
      aria-label={messages.title}
      aria-busy={['creating', 'opening', 'closing'].includes(state.phase) || undefined}
    >
      <SideChatHeader
        phase={state.phase}
        messages={messages}
        onFocusParent={onFocusParent}
        onClose={() => { void onClose() }}
      />

      {state.error !== undefined && (
        <SideChatErrorState error={state.error} messages={messages} onRetry={() => { void onRetry() }} />
      )}

      {state.childSessionId !== undefined && embeddedConversation !== undefined
        ? <SideChatBody>{embeddedConversation}</SideChatBody>
        : (
          <form className="dsh-side-chat-draft" onSubmit={(event) => { void submit(event) }}>
            {state.selection !== undefined && (
              <SelectionQuote
                selections={[state.selection]}
                messages={messages}
                {...onRemoveSelection === undefined ? {} : { onRemove: onRemoveSelection }}
              />
            )}
            <label htmlFor="dsh-side-chat-draft-input">{messages.placeholder}</label>
            <textarea
              id="dsh-side-chat-draft-input"
              ref={draftRef}
              autoFocus
              rows={1}
              value={state.draft}
              disabled={['creating', 'opening', 'closing'].includes(state.phase)}
              placeholder={messages.placeholder}
              onChange={(event) => { onDraftChange(event.target.value) }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
            />
            <button
              type="submit"
              className="dsh-side-chat-send-button"
              aria-label={messages.send}
              disabled={submitting || state.draft.trim().length === 0}
            >
              <SendIcon />
            </button>
          </form>
        )}

      <footer className="dsh-side-chat-footer">
        <span>{messages.temporary}</span>
        <span>{messages.referenceOnly}</span>
        <span>{messages.cannotReopen}</span>
        <span>{messages.sharedWorkspace}</span>
      </footer>
      <div className="dsh-side-chat-announcer" aria-live="polite">
        {state.phase === 'running' ? 'Side Chat running' : `Side Chat ${state.phase}`}
      </div>
    </aside>
  )
}
