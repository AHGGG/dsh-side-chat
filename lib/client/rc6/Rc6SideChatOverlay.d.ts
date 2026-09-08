import type { SideChatController } from '../side-chat-controller.js';
import { Rc6SideChatSessions } from './sessions-adapter.js';
/** rc.6 compatibility surface: selection toolbar plus a non-current child conversation panel. */
export declare function Rc6SideChatOverlay({ controller, sessions, }: {
    readonly controller: SideChatController;
    readonly sessions: Rc6SideChatSessions;
}): import("react/jsx-runtime").JSX.Element;
