import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService, type RemoteStream } from '@deepseek-ai/dsh-typert-protocol'
import { ReadOnlySideChatService } from './host/read-only-chat-service.js'
import type {
  ChatRequest, CreateSideChatRequest, CreateSideChatValue, SelectSideChatModelRequest,
  SelectSideChatModelValue, SendSideChatRequest, SideChatResult, SideChatStreamEvent,
} from './shared/contracts.js'

export * from './host/index.js'
export * from './shared/constants.js'
export * from './shared/contracts.js'
export * from './shared/error-codes.js'
declare module '@deepseek-ai/cordis' { interface Context { sideChat: DshSideChatPlugin } }

/** Read-only model calls; no Agent, Session, or workspace lifecycle is created. */
export class DshSideChatPlugin extends TypertRemoteService {
  static inject = ['llm', 'sessions', 'sessionQuery']
  readonly conversations: ReadOnlySideChatService
  private readonly owners = new Set<string>()
  constructor(ctx: Context) {
    super(ctx, 'sideChat')
    this.conversations = new ReadOnlySideChatService(ctx)
    ctx.effect(() => async () => { await this.conversations.dispose() }, 'dsh-side-chat.lifecycle')
  }
  create(request: CreateSideChatRequest, signal: AbortSignal): Promise<SideChatResult<CreateSideChatValue>> {
    return this.conversations.create(request, this.owner(), signal)
  }
  selectModel(request: SelectSideChatModelRequest, signal: AbortSignal): Promise<SideChatResult<SelectSideChatModelValue>> {
    return this.conversations.selectModel(request, this.owner(), signal)
  }
  stream(request: SendSideChatRequest, signal: AbortSignal): RemoteStream<SideChatStreamEvent> {
    return this.conversations.stream(request, this.owner(), signal)
  }
  cancel(request: ChatRequest): Promise<SideChatResult<{ cancelled: true }>> {
    return this.conversations.cancel(request, this.owner())
  }
  close(request: ChatRequest): Promise<SideChatResult<{ closed: true }>> {
    return this.conversations.close(request, this.owner())
  }
  private owner(): string {
    const peer = this.ctx.invocation?.peer
    if (peer === undefined) return 'local'
    const id = String(peer.id)
    if (!this.owners.has(id)) {
      this.owners.add(id)
      peer.ctx.effect(() => () => {
        this.owners.delete(id)
        this.conversations.closeOwner(id)
      }, 'dsh-side-chat.peer')
    }
    return id
  }
}
export default DshSideChatPlugin
