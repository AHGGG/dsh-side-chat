import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { SideChatClientSessions } from '../contracts.js';
import { SessionId, type ConversationSelection, type SideChatModelSelection } from '../../shared/contracts.js';
import { type ParentComposerInputSnapshot } from '../parent-composer/add-to-conversation.js';
import { type ReferencedSideChatConversation } from '../parent-composer/referenced-conversation.js';
import type { DshClientContext } from './context.js';
import { type ParentConversationFace, type ParentConversationSnapshot } from './conversation-store.js';
declare module '@deepseek-ai/dsh-api-session-controller/client' {
    interface SessionReferenceSourceMap {
        sideChat: unknown;
    }
}
/** The only Session touched by the plugin is the parent: read its Chat, retain its editor, and insert explicit references. */
export declare class DshSideChatSessions implements SideChatClientSessions {
    private readonly ctx;
    private readonly faces;
    private readonly parentInputs;
    private readonly annotationPersistence;
    private readonly modelPreferences;
    constructor(ctx: DshClientContext);
    readonly subscribeList: (listener: () => void) => (() => void);
    readonly subscribeConversationInput: (listener: () => void) => (() => void);
    readonly currentConversationInputSnapshot: () => ParentComposerInputSnapshot | undefined;
    currentSessionId(): SessionId | undefined;
    lastCompletedSeq(parentSessionId: SessionId): number | undefined;
    selectionIsCurrent(selection: ConversationSelection): boolean;
    addSelectionToConversation(selection: ConversationSelection, comment?: string): boolean;
    addSideChatToConversation(parentSessionId: SessionId, reference: ReferencedSideChatConversation): boolean;
    removeConversationAnnotation(index: number): boolean;
    updateConversationAnnotation(index: number, comment?: string): boolean;
    reconcileConversationAnnotationPersistence(): void;
    nextConversationAnnotationNumber(): number;
    removeConversationAnnotations(id?: SessionId | undefined): boolean;
    retainParent(id: SessionId): () => void;
    openSession(id: SessionId): Promise<void>;
    notify(message: {
        readonly kind: 'status' | 'warning';
        readonly text: string;
    }): void;
    face(id: SessionId): ParentConversationFace | undefined;
    title(id: SessionId): string | undefined;
    modelDirectory(id: SessionId): ModelDirectory | undefined;
    sideChatModelPreference(): SideChatModelSelection | undefined;
    rememberSideChatModelPreference(model: SideChatModelSelection): void;
    private currentParentInput;
    private parentInput;
}
export declare function selectionDescriptor(snapshot: ParentConversationSnapshot, anchorKey: string): {
    readonly nodeKey: string;
    readonly nodeKind: string;
    readonly turnKey: string;
    readonly seq: number;
    readonly source: 'user' | 'assistant' | 'context' | 'code';
    readonly modelVisible: boolean;
    readonly settled: boolean;
} | undefined;
