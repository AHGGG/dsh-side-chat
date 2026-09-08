import type { RemoteFailure } from '@deepseek-ai/dsh-typert-protocol'
import TYPERT_REMOTE from '../../remote.js'
import type {
  CloseSideChatRequest,
  CloseSideChatValue,
  CreateSideChatRequest,
  CreateSideChatValue,
  SelectSideChatModelRequest,
  SelectSideChatModelValue,
  SideChatRemote,
  SideChatResult,
  SideChatWireError,
} from '../../shared/contracts.js'
import type { Rc6ClientContext } from './context.js'

interface ArchivedClientRemote {
  create(request: CreateSideChatRequest): Promise<RemoteResult<SideChatResult<CreateSideChatValue>>>
  selectModel(request: SelectSideChatModelRequest): Promise<RemoteResult<SideChatResult<SelectSideChatModelValue>>>
  close(request: CloseSideChatRequest): Promise<RemoteResult<SideChatResult<CloseSideChatValue>>>
}

type RemoteResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: RemoteFailure }

function remoteFailure(error: RemoteFailure): SideChatWireError {
  const code: string = error.code
  const badRequest = code === 'bad-request' || code === 'gateway/bad-request'
  return {
    code: badRequest ? 'invalid_request' : 'transport_error',
    message: error.message || 'The Side Chat RPC failed.',
    recoverable: !badRequest,
  }
}

export async function mountArchivedRemote(ctx: Rc6ClientContext): Promise<{
  readonly remote: SideChatRemote
  readonly dispose: () => Promise<void>
}> {
  const dispose = await ctx.remote.$mount(TYPERT_REMOTE)
  const archived = ctx.get('remote.sideChatArchived') as unknown as ArchivedClientRemote
  return {
    remote: {
      create: async (request) => {
        const result = await archived.create({
          ...request,
          atSeq: Math.floor(request.atSeq),
        })
        return result.ok ? result.value : { ok: false, error: remoteFailure(result.error) }
      },
      selectModel: async (request) => {
        const result = await archived.selectModel(request)
        return result.ok ? result.value : { ok: false, error: remoteFailure(result.error) }
      },
      close: async (request) => {
        const result = await archived.close(request)
        return result.ok ? result.value : { ok: false, error: remoteFailure(result.error) }
      },
    },
    dispose,
  }
}
