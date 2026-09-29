import type { Context } from '@deepseek-ai/cordis';
import { type SessionEvent } from '@deepseek-ai/dsh-session';
import { type ChatRequest, type CreateSideChatRequest, type CreateSideChatValue, type SelectSideChatModelRequest, type SelectSideChatModelValue, type SendSideChatRequest, type SideChatResult, type SideChatStreamEvent } from '../shared/contracts.js';
export declare function completedContextBoundary(events: readonly SessionEvent[], atSeq: number): number | undefined;
/** Ephemeral text discussions. This class never creates, appends, forks, or archives a Session. */
export declare class ReadOnlySideChatService {
    private readonly ctx;
    private readonly chats;
    private readonly lifetime;
    private readonly pendingCreates;
    private creating;
    private disposed;
    private readonly sweep;
    constructor(ctx: Context);
    create(request: CreateSideChatRequest, owner: string, signal: AbortSignal): Promise<SideChatResult<CreateSideChatValue>>;
    private createDiscussion;
    selectModel(request: SelectSideChatModelRequest, owner: string, signal: AbortSignal): Promise<SideChatResult<SelectSideChatModelValue>>;
    stream(request: SendSideChatRequest, owner: string, signal: AbortSignal): AsyncGenerator<SideChatStreamEvent>;
    cancel(request: ChatRequest, owner: string): Promise<SideChatResult<{
        cancelled: true;
    }>>;
    close(request: ChatRequest, owner: string): Promise<SideChatResult<{
        closed: true;
    }>>;
    closeOwner(owner: string): void;
    dispose(): Promise<void>;
    private owned;
    private missing;
    private resolveModel;
}
