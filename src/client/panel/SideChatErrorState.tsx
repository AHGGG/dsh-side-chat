import type { SideChatClientError } from '../../shared/contracts.js'
import type { SideChatMessages } from './messages.js'

/** Error strip with one direct retry action. */
export function SideChatErrorState({
  error,
  messages,
  onRetry,
}: {
  readonly error: SideChatClientError
  readonly messages: SideChatMessages
  readonly onRetry: () => void
}) {
  return (
    <section className="dsh-side-chat-error" role="alert">
      <strong>{error.code === 'side_chat_destroy_failed' ? messages.closeError : messages.genericError}</strong>
      <p>{error.message}</p>
      {error.recoverable && <button type="button" onClick={onRetry}>{messages.retry}</button>}
    </section>
  )
}
