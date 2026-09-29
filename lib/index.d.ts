import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService, type RemoteStream } from '@deepseek-ai/dsh-typert-protocol';
import { ReadOnlySideChatService } from './host/read-only-chat-service.js';
import type { ChatRequest, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest, SelectSideChatModelValue, SendSideChatRequest, SideChatResult, SideChatStreamEvent } from './shared/contracts.js';
export * from './host/index.js';
export * from './shared/constants.js';
export * from './shared/contracts.js';
export * from './shared/error-codes.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        sideChat: DshSideChatPlugin;
    }
}
/** Read-only model calls; no Agent, Session, or workspace lifecycle is created. */
export declare class DshSideChatPlugin extends TypertRemoteService {
    static inject: string[];
    readonly conversations: ReadOnlySideChatService;
    private readonly owners;
    constructor(ctx: Context);
    create(request: CreateSideChatRequest, signal: AbortSignal): Promise<SideChatResult<CreateSideChatValue>>;
    selectModel(request: SelectSideChatModelRequest, signal: AbortSignal): Promise<SideChatResult<SelectSideChatModelValue>>;
    stream(request: SendSideChatRequest, signal: AbortSignal): RemoteStream<SideChatStreamEvent>;
    cancel(request: ChatRequest): Promise<SideChatResult<{
        cancelled: true;
    }>>;
    close(request: ChatRequest): Promise<SideChatResult<{
        closed: true;
    }>>;
    private owner;
}
export default DshSideChatPlugin;
