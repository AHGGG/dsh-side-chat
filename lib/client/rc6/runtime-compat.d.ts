import type { SessionFace as CurrentSessionFace } from '@deepseek-ai/dsh-api-session-controller/client';
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { AssistantBlock, ConversationNode, PartialAssistant, RunningToolCall, ToolCallBlock } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { AskUserQuestionAnswer, AskUserQuestionItem } from '@deepseek-ai/dsh-user-questions/types';
export type { AssistantBlock, ConversationNode, RunningToolCall, ToolCallBlock, };
interface RuntimeFailure {
    readonly code: string;
    readonly message: string;
}
export type RuntimeResult<T = unknown> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly error: RuntimeFailure;
};
interface ObservableSnapshot<T> {
    readonly getSnapshot: () => T;
    readonly subscribe: (listener: () => void) => () => void;
}
export interface SideChatNodeStore {
    get(key: string): {
        readonly key: string;
        readonly kind: string;
        readonly anchorSeq: number;
        readonly visibility: 'visible' | 'hidden';
        readonly location: {
            readonly kind: 'session' | 'unresolved';
        } | {
            readonly kind: 'turn';
            readonly turn: {
                readonly turn: number;
                readonly status: 'open' | 'closed' | 'unknown';
            };
        } | {
            readonly kind: 'step';
            readonly turn: {
                readonly turn: number;
                readonly status: 'open' | 'closed' | 'unknown';
            };
            readonly step: {
                readonly status: 'open' | 'closed' | 'unknown';
            };
        };
    } | undefined;
}
export interface SideChatApprovalInteraction {
    readonly kind: 'approval';
    readonly key: string;
    readonly toolName: string;
    readonly reason?: string;
    respond(decision: 'approve' | 'decline'): Promise<boolean>;
}
export interface SideChatQuestionInteraction {
    readonly kind: 'question';
    readonly key: string;
    readonly questions: readonly AskUserQuestionItem[];
    respond(answer: AskUserQuestionAnswer | null): Promise<boolean>;
}
export type SideChatPendingInteraction = SideChatApprovalInteraction | SideChatQuestionInteraction;
export interface SideChatQueuedMessage {
    readonly id: string;
    readonly placement: 'queued' | 'steering' | 'context';
    readonly preview: string;
}
export interface SideChatConversationSnapshot {
    readonly nodes: readonly ConversationNode[];
    readonly turnEnds: ReadonlyMap<number, number>;
    readonly partial: PartialAssistant | null;
    readonly runningCalls: readonly RunningToolCall[];
    readonly pending: readonly SideChatPendingInteraction[];
    readonly queue: readonly SideChatQueuedMessage[];
    readonly running: boolean;
    readonly openState: 'cold' | 'loading' | 'open' | 'error';
    readonly promptError: {
        readonly error: RuntimeFailure;
    } | null;
    readonly lastAgentError: string | null;
    readonly chatNodes: SideChatNodeStore;
}
/** Stable surface consumed by Side Chat on both the monolithic and split DSH clients. */
export interface SideChatConversationFace extends ObservableSnapshot<SideChatConversationSnapshot> {
    readonly sessionId: SessionId;
    prompt(content: unknown[], mode: 'queue' | 'steer'): Promise<RuntimeResult>;
    updateQueue(itemId: string, action: unknown): Promise<RuntimeResult>;
    cancel(): Promise<RuntimeResult>;
    rename(title: string): Promise<RuntimeResult>;
    open(): Promise<void>;
}
interface RuntimeSessionFace {
    readonly sessionId: SessionId;
    getSnapshot(): unknown;
    subscribe(listener: () => void): () => void;
    prompt(content: unknown[], mode: 'queue' | 'steer'): Promise<RuntimeResult>;
    updateQueue(itemId: string, action: unknown): Promise<RuntimeResult>;
    cancel(): Promise<RuntimeResult>;
    rename(title: string): Promise<RuntimeResult>;
    open?: () => Promise<void>;
}
/** Bridge DSH <=0.1.1's combined Session snapshot and 0.1.2's split stores. */
export declare class CompatibleConversationFace implements SideChatConversationFace {
    private readonly session;
    private readonly chat?;
    private readonly pending?;
    readonly sessionId: SessionId;
    private cache;
    constructor(session: RuntimeSessionFace, chat?: ObservableSnapshot<ChatSnapshot | undefined> | undefined, pending?: ObservableSnapshot<ReadonlyMap<SessionId, unknown>> | undefined);
    readonly subscribe: (listener: () => void) => (() => void);
    readonly getSnapshot: () => SideChatConversationSnapshot;
    prompt(content: unknown[], mode: 'queue' | 'steer'): Promise<RuntimeResult>;
    updateQueue(itemId: string, action: unknown): Promise<RuntimeResult>;
    cancel(): Promise<RuntimeResult>;
    rename(title: string): Promise<RuntimeResult>;
    open(): Promise<void>;
}
export declare function compatibleConversationFace(session: CurrentSessionFace, sources?: {
    readonly chat?: ObservableSnapshot<ChatSnapshot | undefined>;
    readonly pending?: ObservableSnapshot<ReadonlyMap<SessionId, unknown>>;
}): CompatibleConversationFace;
