import type { SideChatController } from '../side-chat-controller.js';
import { DshSideChatSessions } from './sessions-adapter.js';
/** Selection toolbar and plugin-owned read-only discussion panel. */
export declare function SideChatOverlay({ controller, sessions, }: {
    readonly controller: SideChatController;
    readonly sessions: DshSideChatSessions;
}): import("react/jsx-runtime").JSX.Element;
