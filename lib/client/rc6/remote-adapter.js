import TYPERT_REMOTE from '../../remote.js';
function remoteFailure(error) {
    const code = error.code;
    const badRequest = code === 'bad-request' || code === 'gateway/bad-request';
    return {
        code: badRequest ? 'invalid_request' : 'transport_error',
        message: error.message || 'The Side Chat RPC failed.',
        recoverable: !badRequest,
    };
}
export async function mountArchivedRemote(ctx) {
    const dispose = await ctx.remote.$mount(TYPERT_REMOTE);
    const archived = ctx.get('remote.sideChatArchived');
    return {
        remote: {
            create: async (request) => {
                const result = await archived.create({
                    ...request,
                    atSeq: Math.floor(request.atSeq),
                });
                return result.ok ? result.value : { ok: false, error: remoteFailure(result.error) };
            },
            selectModel: async (request) => {
                const result = await archived.selectModel(request);
                return result.ok ? result.value : { ok: false, error: remoteFailure(result.error) };
            },
            close: async (request) => {
                const result = await archived.close(request);
                return result.ok ? result.value : { ok: false, error: remoteFailure(result.error) };
            },
        },
        dispose,
    };
}
