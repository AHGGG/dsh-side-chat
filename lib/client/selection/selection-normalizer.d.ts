import type { ConversationSelection, SelectionFragment, SelectionRect, SessionId } from '../../shared/contracts.js';
import type { SideChatErrorCode } from '../../shared/error-codes.js';
export declare class SelectionValidationError extends Error {
    readonly code: SideChatErrorCode;
    constructor(code: SideChatErrorCode, message: string);
}
export declare function normalizeSelectedText(value: string): string;
export interface ConversationSelectionInput {
    readonly parentSessionId: SessionId;
    readonly fragments: readonly SelectionFragment[];
    readonly rawText: string;
    readonly rect: SelectionRect;
}
export declare function finalizeConversationSelection(input: ConversationSelectionInput): ConversationSelection;
export declare function assertSelectionCurrent(selection: ConversationSelection, currentSessionId: SessionId | undefined): void;
