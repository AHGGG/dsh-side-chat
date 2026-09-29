import type { RemoteFailure, RemoteResult, TypertRemoteNamespace } from '@deepseek-ai/dsh-typert-protocol'
import TYPERT_REMOTE from '../../remote.js'
import type { SideChatRemote, SideChatResult, SideChatWireError } from '../../shared/contracts.js'
import type { DshClientContext } from './context.js'

function remoteFailure(error: RemoteFailure): SideChatWireError {
  const code: string = error.code
  const badRequest = code === 'bad-request' || code === 'gateway/bad-request'
  return { code: badRequest ? 'invalid_request' : 'transport_error',
    message: error.message || 'The Side Chat RPC failed.', recoverable: !badRequest }
}
async function unwrap<T>(result: Promise<RemoteResult<SideChatResult<T>>>): Promise<SideChatResult<T>> {
  const value = await result
  return value.ok ? value.value : { ok: false, error: remoteFailure(value.error) }
}
export async function mountSideChatRemote(ctx: DshClientContext): Promise<{
  readonly remote: SideChatRemote
  readonly dispose: () => Promise<void>
}> {
  const dispose = await ctx.remote.$mount(TYPERT_REMOTE)
  const rpc = ctx.get('remote.sideChat') as unknown as TypertRemoteNamespace<'sideChat'>
  return { remote: {
    create: request => unwrap(rpc.create(request)),
    selectModel: request => unwrap(rpc.selectModel(request)),
    stream: request => rpc.stream(request),
    cancel: request => unwrap(rpc.cancel(request)),
    close: request => unwrap(rpc.close(request)),
  }, dispose }
}
