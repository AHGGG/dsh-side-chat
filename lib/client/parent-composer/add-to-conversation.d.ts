import type { ConversationSelection, SideChatPromptPart } from '../../shared/contracts.js';
import type { ParentComposerInput, ParentComposerInputSnapshot, SelectionReferenceSource } from './composer-reference.js';
export type { ParentComposerInput, ParentComposerInputSnapshot, ParentComposerOccurrence, ParentConversationService, SelectionReferenceSource, } from './composer-reference.js';
export declare const SELECTION_REFERENCE_SOURCE = "dsh-side-chat-selection";
export declare const SELECTION_REFERENCE_LABEL = "__dsh_side_chat_annotations__";
export interface ConversationAnnotation {
    readonly text: string;
    readonly comment?: string;
}
interface StoredConversationAnnotation extends ConversationAnnotation {
    readonly selection: ConversationSelection;
}
export interface ConversationSelectionAnnotation extends StoredConversationAnnotation {
    readonly annotationIndex: number;
}
export declare function unescapeXmlText(value: string): string;
export declare function decodeSelectionReference(ref: string): readonly ConversationAnnotation[];
export declare function conversationAnnotations(snapshot: ParentComposerInputSnapshot): readonly ConversationAnnotation[];
export declare function conversationSelectionAnnotations(snapshot: ParentComposerInputSnapshot): readonly ConversationSelectionAnnotation[];
export declare function addSelectionToConversation(input: ParentComposerInput, selection: ConversationSelection, comment?: string): boolean;
export declare function removeConversationAnnotations(input: ParentComposerInput): boolean;
export declare function removeConversationAnnotation(input: ParentComposerInput, annotationIndex: number): boolean;
export declare function updateConversationAnnotation(input: ParentComposerInput, annotationIndex: number, comment?: string): boolean;
export declare const selectionReferenceSource: SelectionReferenceSource;
export interface AnnotatedConversationPrompt {
    readonly annotations: readonly ConversationAnnotation[];
    readonly message: string;
}
export declare function parseAnnotatedConversationPrompt(text: string): AnnotatedConversationPrompt | undefined;
/** The first prompt uses the same durable annotation format as the main composer. */
export declare function buildSideChatPrompt(selection: ConversationSelection | undefined, question: string): readonly SideChatPromptPart[];
/** Decode a question only after recognizing this plugin's annotation prefix. */
export declare function annotationMessageText(message: string): string;
/** One projection supplies both the annotation capsule and the visible question. */
export declare function parseSideChatPrompt(text: string): AnnotatedConversationPrompt | undefined;
export declare function sideChatQuestionText(text: string): string;
