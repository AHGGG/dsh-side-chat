import type { SideChatErrorCode } from './error-codes.js';
declare const brand: unique symbol;
export type SessionId = string & {
    readonly [brand]: 'SessionId';
};
export declare function SessionId(value: string): SessionId;
/** Plugin-local identity. It is never registered as a DSH Session. */
export type SideChatId = string & {
    readonly [brand]: 'SideChatId';
};
export declare function SideChatId(value: string): SideChatId;
export interface SideChatModelSelection {
    readonly provider: string;
    readonly model: string;
    readonly reasoningEffort?: string | undefined;
}
export type SideChatResult<T> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly error: SideChatWireError;
};
export interface SideChatWireError {
    readonly code: SideChatErrorCode;
    readonly message: string;
    readonly recoverable: boolean;
}
export type SideChatOperation = 'create' | 'prompt' | 'close';
export interface SideChatClientError extends SideChatWireError {
    readonly operation: SideChatOperation;
}
export interface SelectionRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly viewportWidth: number;
    readonly viewportHeight: number;
}
export interface SelectionFragment {
    readonly nodeKey: string;
    readonly nodeKind: string;
    readonly turnKey: string;
    readonly seq: number;
    readonly startOffset: number;
    readonly endOffset: number;
    readonly text: string;
    readonly source: 'user' | 'assistant' | 'context' | 'code';
    readonly modelVisible: boolean;
    readonly settled: boolean;
}
export interface ConversationSelection {
    readonly parentSessionId: SessionId;
    readonly fragments: readonly SelectionFragment[];
    readonly text: string;
    readonly atSeq: number;
    readonly rect: SelectionRect;
}
export interface SideChatMessage {
    readonly id: string;
    readonly role: 'user' | 'assistant';
    readonly text: string;
    readonly reasoning?: string | undefined;
    readonly selectedText?: string | undefined;
    readonly status: 'streaming' | 'complete' | 'stopped' | 'error';
}
export type SideChatPhase = 'closed' | 'draft' | 'creating' | 'ready' | 'running' | 'closing' | 'error';
export interface SideChatState {
    readonly phase: SideChatPhase;
    readonly modelSelection?: SideChatModelSelection | undefined;
    readonly parentSessionId?: SessionId | undefined;
    readonly chatId?: SideChatId | undefined;
    readonly boundarySeq?: number | undefined;
    readonly selection?: ConversationSelection | undefined;
    readonly draft: string;
    readonly messages: readonly SideChatMessage[];
    readonly error?: SideChatClientError | undefined;
}
export interface CreateSideChatRequest {
    readonly parentSessionId: SessionId;
    readonly atSeq: number;
    readonly selectedText?: string | undefined;
    readonly modelSelection?: SideChatModelSelection | undefined;
}
export interface CreateSideChatValue {
    readonly parentSessionId: SessionId;
    readonly chatId: SideChatId;
    readonly boundarySeq: number;
    readonly modelSelection: SideChatModelSelection;
}
export interface ChatRequest {
    readonly chatId: SideChatId;
}
export interface SelectSideChatModelRequest extends ChatRequest, SideChatModelSelection {
}
export interface SelectSideChatModelValue {
    readonly selected: SideChatModelSelection;
}
export interface SendSideChatRequest extends ChatRequest {
    /** Stable across a retry when transport failed before admission was observed. */
    readonly requestId: string;
    readonly text: string;
}
export interface CloseSideChatValue {
    readonly closed: true;
}
export type SideChatStreamEvent = {
    readonly type: 'started';
    readonly requestId: string;
    readonly modelSelection: SideChatModelSelection;
} | {
    readonly type: 'content';
    readonly text: string;
    readonly reasoning: string;
} | {
    readonly type: 'finished';
    readonly status: 'complete' | 'stopped';
} | {
    readonly type: 'error';
    readonly error: SideChatWireError;
};
export interface SideChatStream extends AsyncIterable<SideChatStreamEvent> {
    dispose(): void;
}
export interface SideChatRemote {
    create(request: CreateSideChatRequest): Promise<SideChatResult<CreateSideChatValue>>;
    selectModel(request: SelectSideChatModelRequest): Promise<SideChatResult<SelectSideChatModelValue>>;
    stream(request: SendSideChatRequest): SideChatStream;
    cancel(request: ChatRequest): Promise<SideChatResult<{
        readonly cancelled: true;
    }>>;
    close(request: ChatRequest): Promise<SideChatResult<CloseSideChatValue>>;
}
/** Text representation also used by the durable main-composer annotation codec. */
export type SideChatPromptPart = {
    readonly type: 'text';
    readonly text: string;
};
export {};
