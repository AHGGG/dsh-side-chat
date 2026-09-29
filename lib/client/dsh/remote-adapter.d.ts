import type { SideChatRemote } from '../../shared/contracts.js';
import type { DshClientContext } from './context.js';
export declare function mountSideChatRemote(ctx: DshClientContext): Promise<{
    readonly remote: SideChatRemote;
    readonly dispose: () => Promise<void>;
}>;
