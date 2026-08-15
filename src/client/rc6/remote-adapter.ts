import type { RemoteFailure } from '@deepseek-ai/dsh-typert-protocol'
import TYPERT_REMOTE from '../../remote.js'
import type { SideChatRemote, SideChatWireError } from '../../shared/contracts.js'
import type { Rc6ClientContext } from './context.js'

function remoteFailure(error: RemoteFailure): SideChatWireError {
  return {
    code: error.code === 'bad-request' ? 'invalid_request' : 'transport_error',
    message: error.message || 'The Side Chat RPC failed.',
    recoverable: error.code !== 'bad-request',
  }
}

export async function mountArchivedRemote(ctx: Rc6ClientContext): Promise<{
  readonly remote: SideChatRemote
  readonly dispose: () => Promise<void>
}> {
  const dispose = await ctx.remote.$mount(TYPERT_REMOTE)
  const archived = ctx.get('remote.sideChatArchived') as Rc6ClientContext['remote']['sideChatArchived']
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
