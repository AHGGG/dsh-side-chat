import type { ConversationSelection, SideChatPromptPart } from '../../shared/contracts.js';
import type { ParentComposerInput, ParentComposerInputSnapshot, SelectionReferenceSource } from './composer-reference.js';
export type { ParentComposerInput, ParentComposerInputSnapshot, ParentComposerOccurrence, ParentConversationService, SelectionReferenceSource, } from './composer-reference.js';
export declare const SELECTION_REFERENCE_LABEL = "__dsh_side_chat_annotations__";
export interface ConversationAnnotation {
    readonly text: string;
    readonly comment?: string;
}
export interface ConversationSelectionAnnotation extends ConversationAnnotation {
    /** Zero-based position in the aggregated composer annotation list. */
    readonly annotationIndex: number;
    readonly selection: ConversationSelection;
}
export declare function decodeSelectionReference(ref: string): readonly ConversationAnnotation[];
/** Read all plugin annotations represented by the current DSH input occurrence. */
export declare function conversationAnnotations(snapshot: ParentComposerInputSnapshot): readonly ConversationAnnotation[];
/** Read annotations that retain an exact source-selection anchor. */
export declare function conversationSelectionAnnotations(snapshot: ParentComposerInputSnapshot): readonly ConversationSelectionAnnotation[];
/** Remove every unsent plugin annotation while preserving the user's draft. */
export declare function removeConversationAnnotations(input: ParentComposerInput): boolean;
/** Reference codec used by DSH's native composer chip and submit pipeline. */
export declare const selectionReferenceSource: SelectionReferenceSource;
/** Add one passage to the parent composer's aggregated annotation occurrence. */
export declare function addSelectionToConversation(input: ParentComposerInput, selection: ConversationSelection, comment?: string): boolean;
/** Remove one unsent selected-passage annotation, retaining the aggregate when needed. */
export declare function removeConversationAnnotation(input: ParentComposerInput, annotationIndex: number): boolean;
/** Replace the optional comment on one unsent selected-passage annotation. */
export declare function updateConversationAnnotation(input: ParentComposerInput, annotationIndex: number, comment?: string): boolean;
export interface ConversationAnnotationRecoveryRecord {
    readonly ref: string;
    readonly displayDraft: string;
    readonly mirrorDraft: string;
    readonly baseDraft: string;
}
/** Describe both the display draft and DSH's persisted clipboard projection. */
export declare function conversationAnnotationRecoveryRecord(snapshot: ParentComposerInputSnapshot): ConversationAnnotationRecoveryRecord | undefined;
/** Return the valid aggregated reference currently occupying the leading draft slot. */
export declare function conversationAnnotationReference(snapshot: ParentComposerInputSnapshot): string | undefined;
/** Remove the plugin-owned prefix when rc.6 restored its draft without occurrences. */
export declare function removeOrphanedConversationAnnotationPlaceholder(input: ParentComposerInput): boolean;
/** Rehydrate a lost occurrence over either its display draft or exact mirror projection. */
export declare function restoreConversationAnnotationReference(input: ParentComposerInput, ref: string, expectedMirrorDraft?: string, expectedBaseDraft?: string): boolean;
export interface AnnotatedConversationPrompt {
    readonly annotations: readonly ConversationAnnotation[];
    readonly message: string;
}
/** Parse the durable model form back into the user-facing annotation capsule. */
export declare function parseAnnotatedConversationPrompt(text: string): AnnotatedConversationPrompt | undefined;
/** Add the selected quote to the first child prompt. */
export declare function buildSideChatPrompt(selection: ConversationSelection | undefined, question: string): readonly SideChatPromptPart[];
