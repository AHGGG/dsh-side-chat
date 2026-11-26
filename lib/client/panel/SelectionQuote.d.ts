import type { SideChatMessages } from './messages.js';
export interface SelectionQuoteItem {
    readonly text: string;
    readonly comment?: string;
}
/** Selected passage displayed separately from the user's first question. */
export declare function SelectionQuote({ selections, messages, onRemove, inline, }: {
    readonly selections: readonly SelectionQuoteItem[];
    readonly messages: SideChatMessages;
    readonly onRemove?: () => void;
    /** DSH's user-text slot sits inside a span, so use only phrasing elements there. */
    readonly inline?: boolean;
}): import("react/jsx-runtime").JSX.Element;
