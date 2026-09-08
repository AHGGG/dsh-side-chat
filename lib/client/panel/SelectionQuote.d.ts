import type { SideChatMessages } from './messages.js';
export interface SelectionQuoteItem {
    readonly text: string;
    readonly comment?: string;
}
/** Selected passage displayed separately from the user's first question. */
export declare function SelectionQuote({ selections, messages, onRemove, }: {
    readonly selections: readonly SelectionQuoteItem[];
    readonly messages: SideChatMessages;
    readonly onRemove?: () => void;
}): import("react/jsx-runtime").JSX.Element;
