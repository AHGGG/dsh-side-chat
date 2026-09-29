import { createElement } from 'react';
import sideChatCss from './panel/side-chat.css';
import { selectionReferenceSource } from './parent-composer/add-to-conversation.js';
import { mountParentConversationAnnotations } from './parent-composer/ParentConversationAnnotations.js';
import { sideChatConversationReferenceSource } from './parent-composer/referenced-conversation.js';
import { SideChatController } from './side-chat-controller.js';
import { mountSideChatRemote } from './dsh/remote-adapter.js';
import { SideChatOverlay } from './dsh/SideChatOverlay.js';
import { DshSideChatSessions } from './dsh/sessions-adapter.js';
export const name = 'side-chat-client';
export const inject = ['conversation', 'inputTriggers', 'modelDirectories', 'remote', 'sessions', 'slots', 'uiConversation', 'uiWorkspace'];
export async function apply(ctx) {
    const cleanups = [];
    let disposed = false;
    let cleanupOperation;
    const cleanup = () => {
        disposed = true;
        cleanupOperation ??= (async () => {
            for (const dispose of cleanups.splice(0).reverse()) {
                try {
                    await dispose();
                }
                catch (error) {
                    console.warn('[dsh-side-chat] Cleanup failed', error);
                }
            }
        })();
        return cleanupOperation;
    };
    ctx.effect(() => cleanup, 'dsh-side-chat.clientLifecycle');
    try {
        const stylesheet = document.createElement('style');
        stylesheet.textContent = sideChatCss;
        stylesheet.dataset.plugin = 'dsh-side-chat';
        stylesheet.dataset['dshSideChat'] = 'styles';
        document.head.append(stylesheet);
        cleanups.push(() => { stylesheet.remove(); });
        const clientCtx = ctx;
        const mounted = await mountSideChatRemote(clientCtx);
        if (disposed) {
            await mounted.dispose();
            return;
        }
        cleanups.push(mounted.dispose);
        cleanups.push(clientCtx.inputTriggers.registerSource(selectionReferenceSource));
        cleanups.push(clientCtx.inputTriggers.registerSource(sideChatConversationReferenceSource));
        const sessions = new DshSideChatSessions(clientCtx);
        cleanups.push(mountParentConversationAnnotations(clientCtx, sessionId => { sessions.removeConversationAnnotations(sessionId); }));
        const controller = new SideChatController(mounted.remote, sessions);
        cleanups.push(() => controller.dispose());
        cleanups.push(clientCtx.slots.inject('shell.overlay', () => clientCtx.slots.register({
            name: 'shell.overlay', id: 'dsh-side-chat', order: 90,
        }, () => createElement(SideChatOverlay, { controller, sessions }))));
    }
    catch (error) {
        await cleanup();
        throw error;
    }
}
