import type { ConversationNode } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { SessionId } from '../../shared/contracts.js';
import type { ParentComposerInput, SelectionReferenceSource } from './composer-reference.js';
export declare const SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE = "dsh-side-chat-conversation";
export interface ReferencedConversationMessage {
    readonly role: 'user' | 'assistant';
    readonly content: string;
}
/** One immutable snapshot carried by the parent composer's conversation label. */
export interface ReferencedSideChatConversation {
    readonly version: 1;
    readonly conversationId: SessionId;
    readonly title: string;
    readonly conversation: readonly ReferencedConversationMessage[];
}
export interface ParsedReferencedConversationPrompt {
    readonly reference: ReferencedSideChatConversation;
    readonly message: string;
}
/** Project exactly the user/assistant history visible in the Side Chat modal. */
export declare function referencedSideChatConversation(input: {
    readonly conversationId: SessionId;
    readonly title: string;
    readonly nodes: readonly ConversationNode[];
    readonly inheritedThroughSeq: number;
}): ReferencedSideChatConversation;
/** Durable model-facing form of the referenced conversation label. */
export declare function serializeReferencedConversation(reference: ReferencedSideChatConversation): string;
/** Parse a sent reference prefix so the main thread can keep showing one label. */
export declare function parseReferencedConversationPrompt(text: string): ParsedReferencedConversationPrompt | undefined;
/** Insert or refresh one Side Chat label without duplicating an older snapshot. */
export declare function addReferencedSideChatToConversation(input: ParentComposerInput, reference: ReferencedSideChatConversation): boolean;
/** Reference codec used by the native composer chip and submit pipeline. */
export declare const sideChatConversationReferenceSource: SelectionReferenceSource;
