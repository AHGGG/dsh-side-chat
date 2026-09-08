import type { SideChatPhase } from '../../shared/contracts.js';
import type { SideChatMessages } from './messages.js';
export declare function SideChatHeader({ phase, messages, addToConversationDisabled, onAddToConversation, onFocusParent, onClose, }: {
    readonly phase: SideChatPhase;
    readonly messages: SideChatMessages;
    readonly addToConversationDisabled?: boolean;
    readonly onAddToConversation?: () => void;
    readonly onFocusParent: () => void;
    readonly onClose: () => void;
}): import("react/jsx-runtime").JSX.Element;
