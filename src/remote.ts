import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { ARCHIVED_INVOCATIONS } from './typert.js'
import type {
  CloseSideChatRequest,
  CloseSideChatValue,
  CreateSideChatRequest,
  CreateSideChatValue,
  SideChatResult,
} from './shared/contracts.js'

export type ArchivedCreateResult = SideChatResult<CreateSideChatValue>
export type ArchivedCloseResult = SideChatResult<CloseSideChatValue>

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespace$73696465436861744172636869766564 {
    create: (request: CreateSideChatRequest) => Promise<RemoteResult<ArchivedCreateResult>>
    close: (request: CloseSideChatRequest) => Promise<RemoteResult<ArchivedCloseResult>>
  }
  interface TypertRemoteMap {
    'sideChatArchived/create': (request: CreateSideChatRequest) => Promise<RemoteResult<ArchivedCreateResult>>
    'sideChatArchived/close': (request: CloseSideChatRequest) => Promise<RemoteResult<ArchivedCloseResult>>
  }
  interface TypertRemoteNamespaceMap {
    sideChatArchived: TypertRemoteNamespace$73696465436861744172636869766564
  }
}

export const TYPERT_REMOTE: TypertRemoteContribution = {
  package: '@ahggg/dsh-side-chat',
  descriptors: ARCHIVED_INVOCATIONS,
}

export default TYPERT_REMOTE

export type {
  CloseSideChatRequest,
  CloseSideChatValue,
  CreateSideChatRequest,
  CreateSideChatValue,
  SideChatRemote,
  SideChatResult,
  SideChatWireError,
} from './shared/contracts.js'
export { SIDE_CHAT_ERROR_CODES, isSideChatErrorCode } from './shared/error-codes.js'
