import { type ElementType, type ReactNode } from 'react';
import type { Rc6ClientContext } from '../rc6/context.js';
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js';
import { type ParentComposerInputSnapshot } from './add-to-conversation.js';
type Locale = keyof typeof SIDE_CHAT_MESSAGES;
interface UserNodeProps {
    readonly node: {
        readonly data: {
            readonly content: readonly unknown[];
            readonly referenceLabels?: readonly string[];
            readonly [key: string]: unknown;
        };
        readonly [key: string]: unknown;
    };
    readonly [key: string]: unknown;
}
type UserNodeRenderer = ElementType<UserNodeProps>;
/** The interactive annotation capsule occupying the reserved first composer row. */
export declare function ParentComposerAnnotations({ input, onRemove, locale, }: {
    readonly input: ParentComposerInputSnapshot;
    readonly onRemove: () => void;
    readonly locale?: Locale;
}): import("react/jsx-runtime").JSX.Element | null;
/** Wrap DSH's own user renderer only when this plugin's durable prefix exists. */
export declare function annotatedUserMessageRenderer(Original: UserNodeRenderer): (props: UserNodeProps) => ReactNode;
/** Mount the composer capsule and a thin wrapper around DSH's user renderers. */
export declare function mountParentConversationAnnotations(ctx: Rc6ClientContext, removeAnnotations: () => void): () => void;
export {};
