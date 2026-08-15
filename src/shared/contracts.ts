import type { SideChatErrorCode } from './error-codes.js'

declare const brand: unique symbol

export type SessionId = string & { readonly [brand]: 'SessionId' }

export function SessionId(value: string): SessionId {
  return value as SessionId
}

/** Provider/model choice owned by one Side Chat fork. */
export interface SideChatModelSelection {
  readonly provider: string
  readonly model: string
  readonly reasoningEffort?: string | undefined
}

export type SideChatResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SideChatWireError }

export interface SideChatWireError {
  readonly code: SideChatErrorCode
  readonly message: string
  readonly recoverable: boolean
}

export type SideChatOperation = 'create' | 'open' | 'prompt' | 'close'

export interface SideChatClientError extends SideChatWireError {
  readonly operation: SideChatOperation
}

export interface SelectionRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly viewportWidth: number
  readonly viewportHeight: number
}

export interface SelectionFragment {
  readonly nodeKey: string
  readonly nodeKind: string
  readonly turnKey: string
  readonly seq: number
  readonly startOffset: number
  readonly endOffset: number
  readonly text: string
  readonly source: 'user' | 'assistant' | 'context' | 'code'
  readonly modelVisible: boolean
  readonly settled: boolean
}

export interface ConversationSelection {
  readonly parentSessionId: SessionId
  readonly fragments: readonly SelectionFragment[]
  readonly text: string
  readonly atSeq: number
  readonly rect: SelectionRect
}

export type SideChatPhase =
  | 'closed'
  | 'draft'
  | 'creating'
  | 'opening'
  | 'ready'
  | 'running'
  | 'needs-input'
  | 'needs-approval'
  | 'closing'
  | 'error'

export interface SideChatState {
  readonly phase: SideChatPhase
  readonly modelSelection?: SideChatModelSelection | undefined
  readonly parentSessionId?: SessionId | undefined
  readonly childSessionId?: SessionId | undefined
  readonly boundarySeq?: number | undefined
  readonly inheritedThroughSeq?: number | undefined
  readonly selection?: ConversationSelection | undefined
  readonly draft: string
  readonly firstQuestion?: string | undefined
  readonly error?: SideChatClientError | undefined
}

export interface CreateSideChatRequest {
  readonly parentSessionId: SessionId
  readonly atSeq: number
  readonly modelSelection?: SideChatModelSelection | undefined
}

export interface CreateSideChatValue {
  readonly parentSessionId: SessionId
  readonly childSessionId: SessionId
  readonly boundarySeq: number
  readonly inheritedThroughSeq: number
  readonly modelSelection?: SideChatModelSelection | undefined
}

export interface SelectSideChatModelRequest extends SideChatModelSelection {
  readonly childSessionId: SessionId
}

export interface SelectSideChatModelValue {
  readonly selected: SideChatModelSelection
}

export interface CloseSideChatRequest {
  readonly childSessionId: SessionId
}

export interface CloseSideChatValue {
  readonly closed: true
}

export interface SideChatRemote {
  create(request: CreateSideChatRequest): Promise<SideChatResult<CreateSideChatValue>>
  selectModel(request: SelectSideChatModelRequest): Promise<SideChatResult<SelectSideChatModelValue>>
  close(request: CloseSideChatRequest): Promise<SideChatResult<CloseSideChatValue>>
}

export type SideChatPromptPart =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'image'; readonly mediaType: string; readonly data: string; readonly name?: string }
