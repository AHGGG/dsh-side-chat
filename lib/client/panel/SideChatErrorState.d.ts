import type { SideChatClientError } from '../../shared/contracts.js';
import type { SideChatMessages } from './messages.js';
/** Error strip with one direct retry action. */
export declare function SideChatErrorState({ error, messages, onRetry, }: {
    readonly error: SideChatClientError;
    readonly messages: SideChatMessages;
    readonly onRetry: () => void;
}): import("react/jsx-runtime").JSX.Element;
