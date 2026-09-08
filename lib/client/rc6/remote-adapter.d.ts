import type { SideChatRemote } from '../../shared/contracts.js';
import type { Rc6ClientContext } from './context.js';
export declare function mountArchivedRemote(ctx: Rc6ClientContext): Promise<{
    readonly remote: SideChatRemote;
    readonly dispose: () => Promise<void>;
}>;
