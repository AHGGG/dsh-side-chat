import type { DshClientContext } from '../dsh/context.js';
import { SessionId } from '../../shared/contracts.js';
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js';
import { type ParentComposerInputSnapshot } from './add-to-conversation.js';
type Locale = keyof typeof SIDE_CHAT_MESSAGES;
/** The interactive annotation capsule occupying the reserved first composer row. */
export declare function ParentComposerAnnotations({ input, onRemove, locale, }: {
    readonly input: ParentComposerInputSnapshot;
    readonly onRemove: () => void;
    readonly locale?: Locale;
}): import("react/jsx-runtime").JSX.Element | null;
/** Mount the draft capsule and contribute display-only nodes to DSH's native user text. */
export declare function mountParentConversationAnnotations({ slots, uiConversation }: Pick<DshClientContext, 'slots' | 'uiConversation'>, removeAnnotations: (sessionId: SessionId) => void): () => void;
export {};
