import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { ReadOnlySideChatService } from './host/read-only-chat-service.js';
export * from './host/index.js';
export * from './shared/constants.js';
export * from './shared/contracts.js';
export * from './shared/error-codes.js';
/** Read-only model calls; no Agent, Session, or workspace lifecycle is created. */
export class DshSideChatPlugin extends TypertRemoteService {
    static inject = ['llm', 'sessions', 'sessionQuery'];
    conversations;
    owners = new Set();
    constructor(ctx) {
        super(ctx, 'sideChat');
        this.conversations = new ReadOnlySideChatService(ctx);
        ctx.effect(() => async () => { await this.conversations.dispose(); }, 'dsh-side-chat.lifecycle');
    }
    create(request, signal) {
        return this.conversations.create(request, this.owner(), signal);
    }
    selectModel(request, signal) {
        return this.conversations.selectModel(request, this.owner(), signal);
    }
    stream(request, signal) {
        return this.conversations.stream(request, this.owner(), signal);
    }
    cancel(request) {
        return this.conversations.cancel(request, this.owner());
    }
    close(request) {
        return this.conversations.close(request, this.owner());
    }
    owner() {
        const peer = this.ctx.invocation?.peer;
        if (peer === undefined)
            return 'local';
        const id = String(peer.id);
        if (!this.owners.has(id)) {
            this.owners.add(id);
            peer.ctx.effect(() => () => {
                this.owners.delete(id);
                this.conversations.closeOwner(id);
            }, 'dsh-side-chat.peer');
        }
        return id;
    }
}
export default DshSideChatPlugin;
