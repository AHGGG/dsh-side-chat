import { type ReactNode } from 'react';
import type { SideChatState } from '../../shared/contracts.js';
import type { SideChatActionResult } from '../contracts.js';
export interface SideChatPanelProps {
    readonly state: SideChatState;
    readonly locale?: 'en' | 'zh-CN';
    readonly embeddedConversation?: ReactNode;
    readonly modelControl?: ReactNode;
    readonly onDraftChange: (draft: string) => void;
    readonly onFirstSend: (question: string) => Promise<SideChatActionResult<void>>;
    readonly onClose: () => Promise<SideChatActionResult<void>>;
    readonly onRetry: () => Promise<SideChatActionResult<unknown>>;
    readonly onFocusParent: () => void;
    readonly onAddToConversation?: () => void;
    readonly addToConversationDisabled?: boolean;
    readonly onRemoveSelection?: () => void;
}
export declare function SideChatPanel({ state, locale, embeddedConversation, modelControl, onDraftChange, onFirstSend, onClose, onRetry, onFocusParent, onAddToConversation, addToConversationDisabled, onRemoveSelection, }: SideChatPanelProps): import("react/jsx-runtime").JSX.Element;
