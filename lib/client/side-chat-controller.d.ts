import type { ConversationSelection, SessionId, SideChatModelSelection, SideChatPromptPart, SideChatRemote, SideChatState } from '../shared/contracts.js';
import type { HostObservable } from '../shared/observable.js';
import type { SideChatActionResult, SideChatClientSessions, SideChatQuestionAnswer } from './contracts.js';
/** Small controller for the stock rc.6 archived-fork path. */
export declare class SideChatController implements HostObservable<SideChatState> {
    private readonly remote;
    private readonly sessions;
    private readonly observable;
    private lease;
    private childUnsubscribe;
    private opening;
    private closing;
    private closeRequested;
    private disposed;
    constructor(remote: SideChatRemote, sessions: SideChatClientSessions);
    getSnapshot: () => SideChatState;
    subscribe: (listener: () => void) => (() => void);
    openDraft(input?: {
        readonly parentSessionId?: SessionId;
        readonly selection?: ConversationSelection;
        readonly draft?: string;
    }): SideChatActionResult<void>;
    setDraft(draft: string): SideChatActionResult<void>;
    clearSelection(): SideChatActionResult<void>;
    initializeModel(selection: SideChatModelSelection): SideChatActionResult<SideChatModelSelection>;
    selectModel(selection: SideChatModelSelection): Promise<SideChatActionResult<SideChatModelSelection>>;
    sendFirst(question: string): Promise<SideChatActionResult<void>>;
    send(text: string, mode?: 'queue' | 'steer'): Promise<SideChatActionResult<void>>;
    sendParts(content: readonly SideChatPromptPart[], mode?: 'queue' | 'steer'): Promise<SideChatActionResult<void>>;
    updateQueue(itemId: string, action: {
        readonly kind: 'edit';
        readonly content: readonly SideChatPromptPart[];
    } | {
        readonly kind: 'remove';
    } | {
        readonly kind: 'steer';
    }): Promise<SideChatActionResult<void>>;
    cancel(): Promise<SideChatActionResult<void>>;
    respondApproval(interactionId: string, decision: 'approve' | 'decline'): Promise<SideChatActionResult<void>>;
    respondQuestion(interactionId: string, answer: SideChatQuestionAnswer | null): Promise<SideChatActionResult<void>>;
    close(): Promise<SideChatActionResult<void>>;
    retry(): Promise<SideChatActionResult<unknown>>;
    dispose(): Promise<void>;
    private createOpenAndPrompt;
    private publishCreated;
    private closeChild;
    private performClose;
    private bindingTarget;
    private attachLease;
    private detachLease;
    private updateFromChild;
    private fail;
    private invoke;
    private reset;
    private publish;
}
