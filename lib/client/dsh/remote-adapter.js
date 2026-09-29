import TYPERT_REMOTE from '../../remote.js';
function remoteFailure(error) {
    const code = error.code;
    const badRequest = code === 'bad-request' || code === 'gateway/bad-request';
    return { code: badRequest ? 'invalid_request' : 'transport_error',
        message: error.message || 'The Side Chat RPC failed.', recoverable: !badRequest };
}
async function unwrap(result) {
    const value = await result;
    return value.ok ? value.value : { ok: false, error: remoteFailure(value.error) };
}
export async function mountSideChatRemote(ctx) {
    const dispose = await ctx.remote.$mount(TYPERT_REMOTE);
    const rpc = ctx.get('remote.sideChat');
    return { remote: {
            create: request => unwrap(rpc.create(request)),
            selectModel: request => unwrap(rpc.selectModel(request)),
            stream: request => rpc.stream(request),
            cancel: request => unwrap(rpc.cancel(request)),
            close: request => unwrap(rpc.close(request)),
        }, dispose };
}
