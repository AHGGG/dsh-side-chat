import type { SessionId } from '../../shared/contracts.js'

/** Resolve the exact Session, never the first chat/composer in a multi-panel UI. */
export function conversationElement(sessionId: SessionId): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>('[data-conversation-session]')]
    .find(element => element.dataset['conversationSession'] === sessionId
      && element.closest('[data-side-chat-panel], [hidden], [aria-hidden="true"]') === null)
}

export function conversationChatRoot(sessionId: SessionId): HTMLElement | undefined {
  return conversationElement(sessionId)?.querySelector<HTMLElement>('[data-chat-flow]') ?? undefined
}

export function focusConversationComposer(sessionId: SessionId): void {
  // Workspace navigation schedules React rendering; focus after that commit,
  // and never fall back to a different Session's composer.
  window.requestAnimationFrame(() => {
    const input = conversationElement(sessionId)?.querySelector<HTMLElement>([
      '[data-composer-seat] textarea', '[data-composer-seat] [role="textbox"]',
      '[data-composer-seat] [contenteditable="true"]',
    ].join(', '))
    if (input === undefined || input === null) return
    input.focus()
    if (input instanceof HTMLTextAreaElement) input.setSelectionRange(input.value.length, input.value.length)
  })
}
