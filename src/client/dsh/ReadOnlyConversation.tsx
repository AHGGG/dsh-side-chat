import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { DisclosureRow, IconThinkOutlineRegular, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SideChatMessage, SideChatState } from '../../shared/contracts.js'
import type { SideChatController } from '../side-chat-controller.js'
import { SelectionQuote } from '../panel/SelectionQuote.js'
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js'
import { SendIcon } from '../panel/SendIcon.js'
import { StopIcon } from '../panel/StopIcon.js'
import { useAutoGrowingTextarea } from '../panel/use-auto-growing-textarea.js'
import { MARKDOWN_LABELS } from './primitive-labels.js'

function Reasoning({ text, running }: { readonly text: string; readonly running: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const lines = text.trimEnd().split('\n')
  return <div className="dsh-side-chat-reasoning" data-variant="think" data-state={running ? 'running' : 'ok'}>
    <DisclosureRow rowClassName="dsh-side-chat-reasoning-row" leadingClassName="dsh-side-chat-reasoning-leading"
      titleClassName="dsh-side-chat-reasoning-title" chevronClassName="dsh-side-chat-reasoning-chevron"
      icon={<IconThinkOutlineRegular size={14} />} title="Think" open={expanded} expandable expandOnRowClick
      onToggle={() => { setExpanded(value => !value) }}
      collapsedContent={<span className="dsh-side-chat-reasoning-summary">{running ? lines.at(-1) : lines[0]}</span>}
    ><div className="dsh-side-chat-reasoning-body">{text}</div></DisclosureRow>
  </div>
}
function Message({ message, locale }: { readonly message: SideChatMessage; readonly locale: 'en' | 'zh-CN' }) {
  const bubble = <article className="dsh-side-chat-message" data-role={message.role}>
    <span className="dsh-side-chat-message-role">{message.role === 'user' ? 'You' : 'Assistant'}</span>
    {message.role === 'user'
      ? <div className="dsh-side-chat-message-text">{message.text}</div>
      : <>
          {message.reasoning && <Reasoning text={message.reasoning} running={message.status === 'streaming'} />}
          <MarkdownText text={message.text} streaming={message.status === 'streaming'} labels={MARKDOWN_LABELS} />
          {message.status === 'streaming' && message.text === '' && !message.reasoning && <span>Thinking…</span>}
          {message.status === 'stopped' && <span className="dsh-side-chat-message-note">Stopped</span>}
          {message.status === 'error' && <span className="dsh-side-chat-message-note">Reply failed</span>}
        </>}
  </article>
  return message.selectedText === undefined ? bubble : <div className="dsh-side-chat-annotated-user-message">
    <SelectionQuote selections={[{ text: message.selectedText }]} messages={SIDE_CHAT_MESSAGES[locale]} />
    {bubble}
  </div>
}

/** The UI renders structured plugin messages, never model-facing prompt serialization. */
export function ReadOnlyConversation({ state, controller, modelControl, locale = 'en' }: {
  readonly state: SideChatState
  readonly controller: SideChatController
  readonly modelControl?: ReactNode
  readonly locale?: 'en' | 'zh-CN'
}) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [actionError, setActionError] = useState<string | undefined>()
  const sendingRef = useRef(false)
  const stoppingRef = useRef(false)
  const revision = useRef(0)
  const follow = useRef(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useAutoGrowingTextarea(draft)
  const running = state.phase === 'running'
  const showStop = running || stopping
  const interactive = ['ready', 'running'].includes(state.phase)
  useEffect(() => {
    const element = scrollRef.current
    if (element !== null && follow.current) element.scrollTop = element.scrollHeight
  }, [state.messages])
  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    if (draft.trim().length === 0 || !interactive || running || sendingRef.current || stoppingRef.current) return
    const before = revision.current
    sendingRef.current = true
    setSending(true)
    setActionError(undefined)
    try {
      const result = await controller.send(draft)
      if (result.ok && before === revision.current) setDraft('')
      else if (!result.ok && controller.getSnapshot().error?.message !== result.error.message) setActionError(result.error.message)
    } catch { setActionError('The message could not be sent. Your draft has been kept.') }
    finally { sendingRef.current = false; setSending(false) }
  }
  const stop = async (): Promise<void> => {
    if (stoppingRef.current) return
    stoppingRef.current = true
    setStopping(true)
    setActionError(undefined)
    try {
      const result = await controller.cancel()
      if (!result.ok) setActionError(result.error.message)
    } catch { setActionError('The request could not be stopped. Try closing Side Chat.') }
    finally { stoppingRef.current = false; setStopping(false) }
  }
  return <div className="dsh-side-chat-conversation">
    <div ref={scrollRef} className="dsh-side-chat-transcript" aria-live="polite" onScroll={event => {
      const element = event.currentTarget
      follow.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48
    }}>
      {state.messages.map(message => <Message key={message.id} message={message} locale={locale} />)}
      {actionError !== undefined && <div className="dsh-side-chat-turn-notice" role="alert">{actionError}</div>}
    </div>
    <form className="dsh-side-chat-composer" data-composer-card="" onSubmit={event => { void submit(event) }}>
      <textarea ref={inputRef} rows={1} value={draft} disabled={!interactive} placeholder="Reply in Side Chat"
        onChange={event => { ++revision.current; setDraft(event.target.value) }}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
            event.preventDefault(); event.currentTarget.form?.requestSubmit()
          }
        }} />
      <div className="dsh-side-chat-composer-actions">
        {modelControl}
        <button type={showStop ? 'button' : 'submit'}
          className={showStop ? 'dsh-side-chat-stop-button' : 'dsh-side-chat-send-button'}
          aria-label={showStop ? 'Stop generating' : 'Send'} aria-busy={stopping || sending || undefined}
          disabled={!interactive || (showStop ? stopping : sending || draft.trim().length === 0)}
          onClick={event => {
            if (!showStop) return
            // Do not submit a retained draft if cancellation changes the button
            // back to Send before this click's default action completes.
            event.preventDefault()
            void stop()
          }}>
          {showStop ? <StopIcon /> : <SendIcon />}
        </button>
      </div>
    </form>
  </div>
}
