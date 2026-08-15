import { useEffect, useRef, useState } from 'react'
import type { SideChatMessages } from './messages.js'

export interface SelectionQuoteItem {
  readonly text: string
  readonly comment?: string
}

/** Selected passage displayed separately from the user's first question. */
export function SelectionQuote({
  selections,
  messages,
  onRemove,
}: {
  readonly selections: readonly SelectionQuoteItem[]
  readonly messages: SideChatMessages
  readonly onRemove?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const quoteRef = useRef<HTMLElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const leaveTimerRef = useRef<number>()

  const keepHoverOpen = () => {
    if (leaveTimerRef.current !== undefined) window.clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = undefined
    setHovered(true)
  }

  const closeHoverAfterGrace = () => {
    if (leaveTimerRef.current !== undefined) window.clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = window.setTimeout(() => {
      leaveTimerRef.current = undefined
      setHovered(false)
    }, 220)
  }

  useEffect(() => () => {
    if (leaveTimerRef.current !== undefined) window.clearTimeout(leaveTimerRef.current)
  }, [])

  useEffect(() => {
    if (!expanded) return
    const dismissOutside = (event: MouseEvent): void => {
      const quote = quoteRef.current
      const target = event.target
      if (quote !== null && target instanceof Node && quote.contains(target)) return
      if (leaveTimerRef.current !== undefined) window.clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = undefined
      setHovered(false)
      setExpanded(false)
    }
    document.addEventListener('mousedown', dismissOutside, true)
    return () => { document.removeEventListener('mousedown', dismissOutside, true) }
  }, [expanded])

  const constrainDetailsToBoundary = () => {
    const details = detailsRef.current
    const boundary = quoteRef.current?.closest<HTMLElement>(
      '.dsh-side-chat-panel, [data-composer-seat], [data-chat-flow-kind]',
    )
    if (details === null) return
    details.style.setProperty('--dsh-side-chat-quote-offset-x', '0px')
    const detailsRect = details.getBoundingClientRect()
    const boundaryRect = boundary?.getBoundingClientRect()
    const leftEdge = (boundaryRect?.left ?? 0) + 16
    const rightEdge = (boundaryRect?.right ?? window.innerWidth) - 16
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
      data-hovered={hovered || undefined}
      onMouseEnter={() => {
        keepHoverOpen()
        constrainDetailsToBoundary()
      }}
      onMouseLeave={closeHoverAfterGrace}
      onFocusCapture={constrainDetailsToBoundary}
    >
      <div className="dsh-side-chat-quote-chip">
        <button
          type="button"
          className="dsh-side-chat-quote-trigger"
          aria-expanded={expanded}
          aria-label={`${expanded ? messages.collapse : messages.expand}: ${messages.selectedPassage}`}
          onClick={() => {
            if (expanded) {
              if (leaveTimerRef.current !== undefined) window.clearTimeout(leaveTimerRef.current)
              leaveTimerRef.current = undefined
              setHovered(false)
            }
            setExpanded(value => !value)
          }}
        >
          <svg className="dsh-side-chat-quote-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
            <path d="M8 8h8M8 12h5" />
          </svg>
          <strong>{messages.selectionAttachments(selections.length)}</strong>
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
        {selections.map((selection, index) => (
          <div className="dsh-side-chat-quote-detail" key={`${String(index)}-${selection.text}`}>
            <div className="dsh-side-chat-quote-details-header">
              <strong>{String(index + 1)}. {messages.selectionPreviewLabel}:</strong>
            </div>
            <pre>{selection.text}</pre>
            {selection.comment !== undefined && (
              <div className="dsh-side-chat-quote-comment">
                <strong>{messages.selectionCommentLabel}:</strong>
                <pre>{selection.comment}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
