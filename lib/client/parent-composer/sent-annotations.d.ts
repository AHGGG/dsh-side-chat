import type { UserTextNodeProps, UserTextRule } from '@deepseek-ai/dsh-client-ui-conversation/client';
import { type ConversationAnnotation } from './add-to-conversation.js';
export declare const SIDE_CHAT_PROMPT_NODE = "dsh-side-chat-prompt";
interface SentPromptPresentation {
    readonly annotations: readonly ConversationAnnotation[];
    readonly references: readonly string[];
    readonly question: string;
    readonly annotationOnly: boolean;
}
declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
    interface UserTextDataMap {
        'dsh-side-chat-prompt': SentPromptPresentation;
    }
}
/** Consume only the plugin's leading metadata; native DSH rules still see the original message body. */
export declare const sentAnnotationRule: UserTextRule<typeof SIDE_CHAT_PROMPT_NODE>;
export declare function SentAnnotations({ node, interactive }: Pick<UserTextNodeProps<typeof SIDE_CHAT_PROMPT_NODE>, 'node' | 'interactive'>): import("react/jsx-runtime").JSX.Element;
export {};
