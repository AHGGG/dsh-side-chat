import type { SideChatPhase } from '../../shared/contracts.js'
import type { SideChatMessages } from './messages.js'

export function SideChatHeader({
  phase,
  messages,
  onFocusParent,
  onClose,
}: {
  readonly phase: SideChatPhase
  readonly messages: SideChatMessages
  readonly onFocusParent: () => void
  readonly onClose: () => void
}) {
  return (
    <header className="dsh-side-chat-header">
      <button type="button" className="dsh-side-chat-heading" onClick={onFocusParent}>
        <strong>{messages.title}</strong>
      </button>
      <button
        type="button"
        aria-label={messages.close}
        disabled={phase === 'closing'}
        onClick={onClose}
      >×</button>
    </header>
  )
}
