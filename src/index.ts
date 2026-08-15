import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-agent-presets'
import type {} from '@deepseek-ai/dsh-workspace'
import { ArchivedForkSideChatService } from './host/archived-fork-service.js'
import type {
  CloseSideChatRequest,
  CloseSideChatValue,
  CreateSideChatRequest,
  CreateSideChatValue,
  SelectSideChatModelRequest,
  SelectSideChatModelValue,
  SideChatResult,
} from './shared/contracts.js'

export * from './host/index.js'
export * from './shared/constants.js'
export * from './shared/contracts.js'
export * from './shared/error-codes.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    sideChat: DshSideChatPlugin
  }
}

/** Stock DSH rc.6 Host plugin. */
export class DshSideChatPlugin extends TypertRemoteService {
  static inject = ['agents', 'llm', 'sessionPersistence', 'workspaceRegistry']
  readonly archived: ArchivedForkSideChatService

  constructor(ctx: Context) {
    super(ctx, 'sideChat', { namespace: 'sideChatArchived' })
    this.archived = new ArchivedForkSideChatService(ctx)
    ctx.effect(() => async () => { await this.archived.dispose() }, 'dsh-side-chat.lifecycle')
  }

  createArchived(request: CreateSideChatRequest): Promise<SideChatResult<CreateSideChatValue>> {
    return this.archived.create(request)
  }

  selectArchivedModel(request: SelectSideChatModelRequest): Promise<SideChatResult<SelectSideChatModelValue>> {
    return this.archived.selectModel(request)
  }

  closeArchived(request: CloseSideChatRequest): Promise<SideChatResult<CloseSideChatValue>> {
    return this.archived.close(request)
  }
}

export default DshSideChatPlugin
