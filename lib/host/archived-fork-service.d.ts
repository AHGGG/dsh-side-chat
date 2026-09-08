import type { Context } from '@deepseek-ai/cordis';
import type { SessionEvent } from '@deepseek-ai/dsh-session/types';
import type { CloseSideChatRequest, CloseSideChatValue, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest, SelectSideChatModelValue, SideChatResult } from '../shared/contracts.js';
interface BoundaryCut {
    readonly boundarySeq: number;
    readonly cut: number;
    readonly inheritedThroughSeq: number;
}
declare function boundaryCut(events: readonly SessionEvent[], atSeq: number): BoundaryCut | undefined;
/** Stock rc.6 implementation backed by one ordinary archived Session fork. */
export declare class ArchivedForkSideChatService {
    private readonly ctx;
    private readonly records;
    private readonly pendingCreates;
    private disposed;
    constructor(ctx: Context);
    create(request: CreateSideChatRequest): Promise<SideChatResult<CreateSideChatValue>>;
    selectModel(request: SelectSideChatModelRequest): Promise<SideChatResult<SelectSideChatModelValue>>;
    close(request: CloseSideChatRequest): Promise<SideChatResult<CloseSideChatValue>>;
    dispose(): Promise<void>;
    private createFork;
    private resolveModelSelection;
    private readParent;
    private resolveComposition;
    private closeRecord;
    private archiveAndDispose;
}
export { boundaryCut as resolveArchivedForkBoundary };
