import { useRef, useState } from 'react'
import type { ConversationSelection } from '../../shared/contracts.js'
import type { SideChatMessages } from './messages.js'

/** Selected passage displayed separately from the user's first question. */
export function SelectionQuote({
  selection,
  messages,
  onCopy,
  onRemove,
}: {
  readonly selection: ConversationSelection
  readonly messages: SideChatMessages
  readonly onCopy?: (text: string) => void
  readonly onRemove?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const quoteRef = useRef<HTMLElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const constrainDetailsToPanel = () => {
    const details = detailsRef.current
    const panel = quoteRef.current?.closest<HTMLElement>('.dsh-side-chat-panel')
    if (details === null || panel === undefined || panel === null) return
    details.style.setProperty('--dsh-side-chat-quote-offset-x', '0px')
    const detailsRect = details.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const leftEdge = panelRect.left + 16
    const rightEdge = panelRect.right - 16
    const offset = detailsRect.left < leftEdge
      ? leftEdge - detailsRect.left
      : detailsRect.right > rightEdge ? rightEdge - detailsRect.right : 0
    details.style.setProperty('--dsh-side-chat-quote-offset-x', `${String(offset)}px`)
  }

  return (
    <section
      ref={quoteRef}
      className="dsh-side-chat-quote"
      aria-label={messages.selectedPassage}
      data-expanded={expanded || undefined}
      onMouseEnter={constrainDetailsToPanel}
      onFocusCapture={constrainDetailsToPanel}
    >
      <div className="dsh-side-chat-quote-chip">
        <button
          type="button"
          className="dsh-side-chat-quote-trigger"
          aria-expanded={expanded}
          aria-label={`${expanded ? messages.collapse : messages.expand}: ${messages.selectedPassage}`}
          onClick={() => { setExpanded(value => !value) }}
        >
          <svg className="dsh-side-chat-quote-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
            <path d="M8 8h8M8 12h5" />
          </svg>
          <strong>{messages.selectionAttachment}</strong>
        </button>
        {onRemove !== undefined && (
          <button
            type="button"
            className="dsh-side-chat-quote-remove"
            aria-label={messages.removeSelection}
            onClick={onRemove}
          >×</button>
        )}
      </div>
      <div ref={detailsRef} className="dsh-side-chat-quote-details" role="tooltip">
        <div className="dsh-side-chat-quote-details-header">
          <strong>1. {messages.selectionPreviewLabel}:</strong>
          {onCopy !== undefined && (
            <button type="button" onClick={() => { onCopy(selection.text) }}>{messages.copy}</button>
          )}
        </div>
        <pre>{selection.text}</pre>
      </div>
    </section>
  )
}
