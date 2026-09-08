import type { ConversationSelection, SelectionFragment, SessionId } from '../../shared/contracts.js';
/** Authoritative Chat Node information resolved from the locked DSH DOM anchor. */
export interface SelectionNodeDescriptor {
    readonly nodeKey: string;
    readonly nodeKind: string;
    readonly turnKey: string;
    readonly seq: number;
    readonly source: SelectionFragment['source'];
    readonly modelVisible: boolean;
    readonly settled: boolean;
}
/** Resolves only public `data-chat-*` anchors against the current snapshot. */
export interface SelectionAnchorResolver {
    resolve(anchor: HTMLElement): SelectionNodeDescriptor | undefined;
}
export interface RestoredConversationSelection {
    /** Exact visible text-node slices used by the Custom Highlight API. */
    readonly ranges: readonly Range[];
    /** One encompassing range used to restore the browser selection. */
    readonly browserRange: Range;
}
/**
 * Locked-commit fallback capture. It intentionally fails closed unless every
 * selected text node belongs to one public Chat anchor.
 */
export declare function captureDomConversationSelection(input: {
    readonly selection: Selection | null;
    readonly conversationRoot: HTMLElement;
    readonly parentSessionId: SessionId;
    readonly resolver: SelectionAnchorResolver;
}): Promise<ConversationSelection>;
/** Rebuild a saved selection only when its anchored visible text still matches. */
export declare function restoreDomConversationSelection(input: {
    readonly selection: ConversationSelection;
    readonly conversationRoot: HTMLElement;
}): RestoredConversationSelection | undefined;
