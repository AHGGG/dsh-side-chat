import type { SessionId } from '../../shared/contracts.js';
/** Resolve the exact Session, never the first chat/composer in a multi-panel UI. */
export declare function conversationElement(sessionId: SessionId): HTMLElement | undefined;
export declare function conversationChatRoot(sessionId: SessionId): HTMLElement | undefined;
export declare function focusConversationComposer(sessionId: SessionId): void;
