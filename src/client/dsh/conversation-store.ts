import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'

export type SideChatNodeStore = ChatSnapshot['nodes']
export interface ParentConversationSnapshot {
  readonly turnEnds: ReadonlyMap<number, number>
  readonly chatNodes: Pick<SideChatNodeStore, 'get'>
}
export interface ParentConversationFace {
  getSnapshot(): ParentConversationSnapshot
  subscribe(listener: () => void): () => void
}
const EMPTY: ParentConversationSnapshot = { turnEnds: new Map(), chatNodes: { get: () => undefined } }
/** Read-only parent Chat projection, used only for selection anchors and turn boundaries. */
export class DshParentConversation implements ParentConversationFace {
  private source: ChatSnapshot | undefined
  private snapshot: ParentConversationSnapshot = EMPTY
  constructor(private readonly chat: {
    getSnapshot(): ChatSnapshot | undefined
    subscribe(listener: () => void): () => void
  }) {}
  subscribe = (listener: () => void): (() => void) => this.chat.subscribe(listener)
  getSnapshot = (): ParentConversationSnapshot => {
    const source = this.chat.getSnapshot()
    if (source !== this.source) {
      this.source = source
      this.snapshot = source === undefined ? EMPTY : { turnEnds: source.legacy.turnEnds, chatNodes: source.nodes }
    }
    return this.snapshot
  }
}
