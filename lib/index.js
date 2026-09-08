import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { ArchivedForkSideChatService } from './host/archived-fork-service.js';
export * from './host/index.js';
export * from './shared/constants.js';
export * from './shared/contracts.js';
export * from './shared/error-codes.js';
/** Stock DSH rc.6 Host plugin. */
export class DshSideChatPlugin extends TypertRemoteService {
    static inject = ['agents', 'llm', 'sessionPersistence', 'workspaceRegistry'];
    archived;
    constructor(ctx) {
        super(ctx, 'sideChat', { namespace: 'sideChatArchived' });
        this.archived = new ArchivedForkSideChatService(ctx);
        ctx.effect(() => async () => { await this.archived.dispose(); }, 'dsh-side-chat.lifecycle');
    }
    createArchived(request) {
        return this.archived.create(request);
    }
    selectArchivedModel(request) {
        return this.archived.selectModel(request);
    }
    closeArchived(request) {
        return this.archived.close(request);
    }
}
export default DshSideChatPlugin;
