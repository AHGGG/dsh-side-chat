import { type ReactNode } from 'react';
import type { ConversationSelection } from '../../shared/contracts.js';
import type { SideChatController } from '../side-chat-controller.js';
import type { SideChatConversationFace } from './runtime-compat.js';
/** Functional rc.6 conversation surface bound to a non-current child Session. */
export declare function ArchivedConversation({ face, inheritedThroughSeq, controller, selection, locale, cwd, modelControl, }: {
    readonly face: SideChatConversationFace;
    readonly inheritedThroughSeq: number;
    readonly controller: SideChatController;
    readonly selection?: ConversationSelection;
    readonly locale?: 'en' | 'zh-CN';
    readonly cwd?: string | undefined;
    readonly modelControl?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
