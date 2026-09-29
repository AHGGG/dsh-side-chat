import type { ConversationSelection, SessionId, SideChatModelSelection, SideChatRemote, SideChatState } from '../shared/contracts.js';
import type { SideChatActionResult, SideChatClientSessions } from './contracts.js';
/** Owns only plugin UI state and a cancellable model stream, never a child Session. */
export declare class SideChatController {
    private readonly remote;
    private readonly sessions;
    private readonly observable;
    private generation;
    private modelGeneration;
    private requestSequence;
    private disposed;
    private releaseParent;
    private creating;
    private closing;
    private running;
    private cancelling;
    private pendingRequest;
    constructor(remote: SideChatRemote, sessions: SideChatClientSessions);
    getSnapshot: () => SideChatState;
    subscribe: (listener: () => void) => (() => void);
    openDraft(input?: {
        readonly parentSessionId?: SessionId;
        readonly selection?: ConversationSelection;
        readonly draft?: string;
    }): SideChatActionResult;
    setDraft(draft: string): SideChatActionResult;
    clearSelection(): SideChatActionResult;
    initializeModel(model: SideChatModelSelection): SideChatActionResult<SideChatModelSelection>;
    selectModel(model: SideChatModelSelection): Promise<SideChatActionResult<SideChatModelSelection>>;
    sendFirst(question: string): Promise<SideChatActionResult>;
    /** Resolves at admission; the independently consumed stream continues to update the transcript. */
    send(question: string): Promise<SideChatActionResult>;
    cancel(): Promise<SideChatActionResult>;
    retry(): Promise<SideChatActionResult>;
    close(): Promise<SideChatActionResult>;
    dispose(): Promise<void>;
    private consume;
    private streamFailure;
    private closeCurrent;
    private fail;
    private disposeStream;
    private invoke;
}
