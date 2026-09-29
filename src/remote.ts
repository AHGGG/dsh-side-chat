import type { RemoteResult, RemoteStreamHandle, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { SIDE_CHAT_INVOCATIONS } from './typert.js'
import type {
  ChatRequest, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest,
  SelectSideChatModelValue, SendSideChatRequest, SideChatResult, SideChatStreamEvent,
} from './shared/contracts.js'
export type CreateResult = SideChatResult<CreateSideChatValue>
export type SelectModelResult = SideChatResult<SelectSideChatModelValue>
export type CancelResult = SideChatResult<{ cancelled: true }>
export type CloseResult = SideChatResult<{ closed: true }>

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespace$7369646543686174 {
    create: (request: CreateSideChatRequest) => Promise<RemoteResult<CreateResult>>
    selectModel: (request: SelectSideChatModelRequest) => Promise<RemoteResult<SelectModelResult>>
    stream: (request: SendSideChatRequest) => RemoteStreamHandle<SideChatStreamEvent, never>
    cancel: (request: ChatRequest) => Promise<RemoteResult<CancelResult>>
    close: (request: ChatRequest) => Promise<RemoteResult<CloseResult>>
  }
  interface TypertRemoteMap {
    'sideChat/create': TypertRemoteNamespace$7369646543686174['create']
    'sideChat/selectModel': TypertRemoteNamespace$7369646543686174['selectModel']
    'sideChat/stream': TypertRemoteNamespace$7369646543686174['stream']
    'sideChat/cancel': TypertRemoteNamespace$7369646543686174['cancel']
    'sideChat/close': TypertRemoteNamespace$7369646543686174['close']
  }
  interface TypertRemoteNamespaceMap { sideChat: TypertRemoteNamespace$7369646543686174 }
}
export const TYPERT_REMOTE: TypertRemoteContribution = { package: '@ahggg/dsh-side-chat', descriptors: SIDE_CHAT_INVOCATIONS }
export default TYPERT_REMOTE
export type {
  ChatRequest, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest,
  SelectSideChatModelValue, SendSideChatRequest, SideChatStreamEvent, SideChatRemote,
  SideChatResult, SideChatWireError,
} from './shared/contracts.js'
export { SIDE_CHAT_ERROR_CODES, isSideChatErrorCode } from './shared/error-codes.js'
