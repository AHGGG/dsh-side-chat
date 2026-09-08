import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { ArchivedForkSideChatService } from './host/archived-fork-service.js';
import type { CloseSideChatRequest, CloseSideChatValue, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest, SelectSideChatModelValue, SideChatResult } from './shared/contracts.js';
export * from './host/index.js';
export * from './shared/constants.js';
export * from './shared/contracts.js';
export * from './shared/error-codes.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        sideChat: DshSideChatPlugin;
    }
}
/** Stock DSH rc.6 Host plugin. */
export declare class DshSideChatPlugin extends TypertRemoteService {
    static inject: string[];
    readonly archived: ArchivedForkSideChatService;
    constructor(ctx: Context);
    createArchived(request: CreateSideChatRequest): Promise<SideChatResult<CreateSideChatValue>>;
    selectArchivedModel(request: SelectSideChatModelRequest): Promise<SideChatResult<SelectSideChatModelValue>>;
    closeArchived(request: CloseSideChatRequest): Promise<SideChatResult<CloseSideChatValue>>;
}
export default DshSideChatPlugin;
