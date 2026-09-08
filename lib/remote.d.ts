import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { CloseSideChatRequest, CloseSideChatValue, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest, SelectSideChatModelValue, SideChatResult } from './shared/contracts.js';
export type ArchivedCreateResult = SideChatResult<CreateSideChatValue>;
export type ArchivedSelectModelResult = SideChatResult<SelectSideChatModelValue>;
export type ArchivedCloseResult = SideChatResult<CloseSideChatValue>;
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespace$73696465436861744172636869766564 {
        create: (request: CreateSideChatRequest) => Promise<RemoteResult<ArchivedCreateResult>>;
        selectModel: (request: SelectSideChatModelRequest) => Promise<RemoteResult<ArchivedSelectModelResult>>;
        close: (request: CloseSideChatRequest) => Promise<RemoteResult<ArchivedCloseResult>>;
    }
    interface TypertRemoteMap {
        'sideChatArchived/create': (request: CreateSideChatRequest) => Promise<RemoteResult<ArchivedCreateResult>>;
        'sideChatArchived/selectModel': (request: SelectSideChatModelRequest) => Promise<RemoteResult<ArchivedSelectModelResult>>;
        'sideChatArchived/close': (request: CloseSideChatRequest) => Promise<RemoteResult<ArchivedCloseResult>>;
    }
    interface TypertRemoteNamespaceMap {
        sideChatArchived: TypertRemoteNamespace$73696465436861744172636869766564;
    }
}
export declare const TYPERT_REMOTE: TypertRemoteContribution;
export default TYPERT_REMOTE;
export type { CloseSideChatRequest, CloseSideChatValue, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest, SelectSideChatModelValue, SideChatRemote, SideChatResult, SideChatWireError, } from './shared/contracts.js';
export { SIDE_CHAT_ERROR_CODES, isSideChatErrorCode } from './shared/error-codes.js';
