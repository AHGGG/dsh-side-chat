import type { Context } from '@deepseek-ai/cordis';
export declare const LEGACY_REFERENCE_PLACEHOLDER = "\uFFFC";
export interface ParentComposerOccurrence {
    readonly occurrenceId: number;
    readonly source: string;
    readonly ref: string;
    readonly offset: number;
    /** Occupied projection length (display text through 0.1.1, clipboard text in 0.1.2). */
    readonly length?: number;
    /** Insert-time display label, present in current DSH input snapshots. */
    readonly label?: string;
    /** Draft-persistence projection cached by current DSH input snapshots. */
    readonly clipboardText?: string;
    readonly appearance?: 'session' | 'file' | 'folder';
}
export interface ParentComposerInputSnapshot {
    readonly draft: string;
    readonly draftRev: number;
    readonly occurrences: readonly ParentComposerOccurrence[];
}
export interface ParentComposerSpan {
    readonly start: number;
    readonly end: number;
    readonly draftRev: number;
}
export interface ParentComposerInput {
    readonly state: {
        getSnapshot(): ParentComposerInputSnapshot;
        subscribe?(listener: () => void): () => void;
    };
    /** DSH 0.1.2's Lexical editor projects each reference as one mutation coordinate. */
    readonly referenceMode?: 'text' | 'lexical';
    setDraft(text: string): void;
    /** Atomic plain-text replacement supplied by Side Chat's scoped input-event adapter. */
    replaceText?(text: string, span: ParentComposerSpan): boolean;
    insertReference(reference: {
        readonly source: string;
        readonly ref: string;
        readonly label: string;
        readonly appearance?: 'session' | 'file' | 'folder';
        readonly clipboardText: string;
    }, span: ParentComposerSpan): boolean;
}
export interface ParentConversationService {
    readonly input: {
        for(scope: Context): ParentComposerInput;
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
export interface OccurrenceRange {
    readonly start: number;
    readonly end: number;
}
export declare function referenceDisplayText(label: string): string;
/**
 * Resolve one occurrence's occupied draft range across both DSH reference
 * representations: current full `@label` text with `length`, and the legacy
 * one-code-unit U+FFFC placeholder without it.
 */
export declare function occurrenceRange(snapshot: ParentComposerInputSnapshot, occurrence: ParentComposerOccurrence, expectedLabel: string): OccurrenceRange | undefined;
export declare function occurrenceMatchesDraft(snapshot: ParentComposerInputSnapshot, occurrence: ParentComposerOccurrence, expectedLabel: string): boolean;
/** Convert one published occurrence range to the host input machine's mutation coordinates. */
export declare function occurrenceEditSpan(input: ParentComposerInput, snapshot: ParentComposerInputSnapshot, occurrence: ParentComposerOccurrence, options?: {
    readonly consumeFollowingSeparator?: boolean;
}): ParentComposerSpan | undefined;
/** Find the exact occurrence minted by one synchronous insertReference call. */
export declare function newlyInsertedOccurrence(before: ParentComposerInputSnapshot, after: ParentComposerInputSnapshot, source: string, ref: string): ParentComposerOccurrence | undefined;
/** Remove one occurrence's display range and, optionally, its separating ASCII gap. */
export declare function draftWithoutOccurrence(snapshot: ParentComposerInputSnapshot, occurrence: ParentComposerOccurrence, expectedLabel: string, options?: {
    readonly consumeAdjacentSpace?: boolean;
}): string | undefined;
