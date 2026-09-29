import type { Context } from '@deepseek-ai/cordis';
import type { InputState, ReferenceInsert, SessionInput, TokenSpan } from '@deepseek-ai/dsh-client-ui-conversation/client';
export type ParentComposerOccurrence = InputState['occurrences'][number];
export type ParentComposerSpan = TokenSpan;
export type ParentComposerInputSnapshot = Pick<InputState, 'draft' | 'draftRev' | 'occurrences'> & Partial<Pick<InputState, 'phase'>>;
/** DSH 0.2's Lexical editor: published offsets are clipboard coordinates,
 * mutation spans count each reference chip as one character. */
export interface ParentComposerInput {
    readonly state: {
        getSnapshot(): ParentComposerInputSnapshot;
        subscribe(listener: () => void): () => void;
    };
    setDraft(text: string): void;
    replaceText(text: string, span: ParentComposerSpan): boolean;
    insertReference(reference: ReferenceInsert, span: ParentComposerSpan): boolean;
    notify?: SessionInput['notify'];
}
export interface ParentConversationService {
    readonly input: {
        for(scope: Context): SessionInput;
    };
}
export interface SelectionReferenceSource {
    readonly trigger: '@';
    readonly name: string;
    readonly order: number;
    candidates(): Promise<readonly never[]>;
    onPick(): undefined;
    readonly codec: {
        clipboardText(ref: string): string;
        serialize(ref: string, signal: AbortSignal): Promise<string>;
    };
}
export declare function occurrenceRange(snapshot: ParentComposerInputSnapshot, occurrence: ParentComposerOccurrence, expectedLabel: string): {
    start: number;
    end: number;
} | undefined;
export declare function occurrenceMatchesDraft(snapshot: ParentComposerInputSnapshot, occurrence: ParentComposerOccurrence, expectedLabel: string): boolean;
/** Convert a reference's clipboard range to the editor's atomic coordinates. */
export declare function occurrenceEditSpan(_input: ParentComposerInput, snapshot: ParentComposerInputSnapshot, occurrence: ParentComposerOccurrence, options?: {
    readonly consumeFollowingSeparator?: boolean;
}): ParentComposerSpan | undefined;
export declare function newlyInsertedOccurrence(before: ParentComposerInputSnapshot, after: ParentComposerInputSnapshot, source: string, ref: string): ParentComposerOccurrence | undefined;
