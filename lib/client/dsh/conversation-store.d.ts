import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
export type SideChatNodeStore = ChatSnapshot['nodes'];
export interface ParentConversationSnapshot {
    readonly turnEnds: ReadonlyMap<number, number>;
    readonly chatNodes: Pick<SideChatNodeStore, 'get'>;
}
export interface ParentConversationFace {
    getSnapshot(): ParentConversationSnapshot;
    subscribe(listener: () => void): () => void;
}
/** Read-only parent Chat projection, used only for selection anchors and turn boundaries. */
export declare class DshParentConversation implements ParentConversationFace {
    private readonly chat;
    private source;
    private snapshot;
    constructor(chat: {
        getSnapshot(): ChatSnapshot | undefined;
        subscribe(listener: () => void): () => void;
    });
    subscribe: (listener: () => void) => (() => void);
    getSnapshot: () => ParentConversationSnapshot;
}
