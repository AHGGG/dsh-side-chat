import type { CSSProperties, MouseEvent } from 'react'
import type { ConversationSelection } from '../../shared/contracts.js'

export interface SelectionActionsProps {
  readonly selection: ConversationSelection
  readonly askDisabledReason?: string
  readonly onAskInSideChat: (selection: ConversationSelection) => void
  readonly onDismiss: () => void
}

export function SelectionActions({
  selection,
  askDisabledReason,
  onAskInSideChat,
  onDismiss,
}: SelectionActionsProps) {
  const center = selection.rect.x + selection.rect.width / 2
  const style: CSSProperties = {
    left: Math.min(Math.max(8, center), selection.rect.viewportWidth - 8),
    top: selection.rect.y < 56
      ? selection.rect.y + selection.rect.height + 8
      : selection.rect.y - 8,
    transform: selection.rect.y < 56 ? 'translate(0, 0)' : 'translate(0, -100%)',
  }
  const keepSelection = (event: MouseEvent<HTMLDivElement>): void => { event.preventDefault() }
  return (
    <div
      className="dsh-side-chat-selection-actions"
      role="toolbar"
      aria-label="Selected conversation text actions"
      style={style}
      onMouseDown={keepSelection}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
      }}
    >
      <button
        type="button"
        disabled={askDisabledReason !== undefined}
        title={askDisabledReason}
        onClick={() => {
          onAskInSideChat(selection)
          onDismiss()
        }}
      >
        Ask in side chat
      </button>
    </div>
  )
}
