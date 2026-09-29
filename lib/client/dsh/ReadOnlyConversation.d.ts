import { type ReactNode } from 'react';
import type { SideChatState } from '../../shared/contracts.js';
import type { SideChatController } from '../side-chat-controller.js';
/** The UI renders structured plugin messages, never model-facing prompt serialization. */
export declare function ReadOnlyConversation({ state, controller, modelControl, locale }: {
    readonly state: SideChatState;
    readonly controller: SideChatController;
    readonly modelControl?: ReactNode;
    readonly locale?: 'en' | 'zh-CN';
}): import("react/jsx-runtime").JSX.Element;
