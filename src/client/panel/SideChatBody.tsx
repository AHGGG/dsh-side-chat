import type { ReactNode } from 'react'

/** Body seat for the upstream EmbeddedConversationSurface. */
export function SideChatBody({ children }: { readonly children: ReactNode }) {
  return <div className="dsh-side-chat-body">{children}</div>
}
