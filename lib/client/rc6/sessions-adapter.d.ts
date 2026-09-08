import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { SideChatClientSessions, SideChatSessionLease } from '../contracts.js';
import type { ConversationSelection, SessionId, SideChatModelSelection } from '../../shared/contracts.js';
import type { ParentComposerInputSnapshot } from '../parent-composer/add-to-conversation.js';
import { type ReferencedSideChatConversation } from '../parent-composer/referenced-conversation.js';
import type { Rc6ClientContext } from './context.js';
import { type SideChatConversationFace, type SideChatConversationSnapshot } from './runtime-compat.js';
/** Adapter over rc.6's public SessionRuntime and exported concrete Session type. */
export declare class Rc6SideChatSessions implements SideChatClientSessions {
    private readonly ctx;
    private readonly renamed;
    private readonly faces;
    private readonly parentInputs;
    private readonly annotationPersistence;
    private readonly modelPreferences;
    constructor(ctx: Rc6ClientContext);
    /** Observable rc.6 Session-list surface used to follow main-session switches. */
    readonly subscribeList: (listener: () => void) => (() => void);
    /** Follow both current-session switches and that session's composer state. */
    readonly subscribeConversationInput: (listener: () => void) => (() => void);
    readonly currentConversationInputSnapshot: () => ParentComposerInputSnapshot | undefined;
    currentSessionId(): SessionId | undefined;
    lastCompletedSeq(parentSessionId: SessionId): number | undefined;
    selectionIsCurrent(selection: ConversationSelection): boolean;
    /** Add one selected passage to the native composer of its parent Session. */
    addSelectionToConversation(selection: ConversationSelection, comment?: string): boolean;
    /** Add one immutable Side Chat transcript to its parent Session's composer. */
    addSideChatToConversation(parentSessionId: SessionId, reference: ReferencedSideChatConversation): boolean;
    /** Remove one existing unsent annotation from the aggregated occurrence. */
    removeConversationAnnotation(annotationIndex: number): boolean;
    /** Update an existing unsent annotation without adding a duplicate passage. */
    updateConversationAnnotation(annotationIndex: number, comment?: string): boolean;
    /** Mirror or recover the current Session's unsent annotation occurrence. */
    reconcileConversationAnnotationPersistence(): void;
    /** Number assigned to the next annotation shown beside the selected passage. */
    nextConversationAnnotationNumber(): number;
    /** Remove the current Session's unsent selected-passage annotations. */
    removeConversationAnnotations(): boolean;
    retain(sessionId: SessionId): Promise<SideChatSessionLease>;
    openSession(sessionId: SessionId): Promise<void>;
    notify(message: {
        readonly kind: 'status' | 'warning';
        readonly text: string;
    }): void;
    face(sessionId: SessionId): SideChatConversationFace | undefined;
    title(sessionId: SessionId): string | undefined;
    cwd(sessionId: SessionId): string | undefined;
    modelDirectory(sessionId: SessionId): ModelDirectory | undefined;
    sideChatModelPreference(): SideChatModelSelection | undefined;
    rememberSideChatModelPreference(selection: SideChatModelSelection): void;
    private adaptedFace;
    private currentParentInput;
    private parentInput;
    private waitForBinding;
}
export declare function selectionDescriptor(snapshot: SideChatConversationSnapshot, anchorKey: string): {
    readonly nodeKey: string;
    readonly nodeKind: string;
    readonly turnKey: string;
    readonly seq: number;
    readonly source: 'user' | 'assistant' | 'context' | 'code';
    readonly modelVisible: boolean;
    readonly settled: boolean;
} | undefined;
