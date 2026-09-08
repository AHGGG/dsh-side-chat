import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createElement } from 'react';
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js';
import { SelectionQuote } from '../panel/SelectionQuote.js';
import { conversationAnnotations, parseAnnotatedConversationPrompt, } from './add-to-conversation.js';
import { parseReferencedConversationPrompt, } from './referenced-conversation.js';
function currentLocale() {
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}
/** The interactive annotation capsule occupying the reserved first composer row. */
export function ParentComposerAnnotations({ input, onRemove, locale = currentLocale(), }) {
    const annotations = conversationAnnotations(input);
    if (annotations.length === 0)
        return null;
    return (_jsx("div", { className: "dsh-side-chat-parent-annotation-dock", children: _jsx(SelectionQuote, { selections: annotations, messages: SIDE_CHAT_MESSAGES[locale], onRemove: onRemove }) }));
}
function contentText(content) {
    return content.map((block) => {
        if (typeof block !== 'object' || block === null)
            return '';
        const value = block;
        return value.type === 'text' && typeof value.text === 'string' ? value.text : '';
    }).join('');
}
function visibleMessage(message) {
    const wrapped = /^<user_question>\n?([\s\S]*?)\n?<\/user_question>$/u.exec(message);
    return wrapped?.[1]?.trim() ?? message;
}
function replaceTextContent(content, message) {
    let replaced = false;
    const next = content.flatMap((block) => {
        if (typeof block !== 'object' || block === null)
            return [block];
        const value = block;
        if (value.type !== 'text' || typeof value.text !== 'string')
            return [block];
        if (replaced)
            return [];
        replaced = true;
        return [{ ...value, text: message }];
    });
    return replaced ? next : [{ type: 'text', text: message }, ...next];
}
function parsePluginPrompt(text) {
    let message = text;
    let annotations;
    let reference;
    for (let index = 0; index < 2; index += 1) {
        const annotated = annotations === undefined ? parseAnnotatedConversationPrompt(message) : undefined;
        if (annotated !== undefined) {
            annotations = annotated.annotations;
            message = annotated.message;
            continue;
        }
        const referenced = reference === undefined ? parseReferencedConversationPrompt(message) : undefined;
        if (referenced !== undefined) {
            reference = referenced.reference;
            message = referenced.message;
            continue;
        }
        break;
    }
    if (annotations === undefined && reference === undefined)
        return;
    return {
        ...(annotations === undefined ? {} : { annotations }),
        ...(reference === undefined ? {} : { reference }),
        message,
    };
}
/** Wrap DSH's own user renderer only when this plugin's durable prefix exists. */
export function annotatedUserMessageRenderer(Original) {
    return function AnnotatedUserMessageRenderer(props) {
        const parsed = parsePluginPrompt(contentText(props.node.data.content));
        if (parsed === undefined)
            return createElement(Original, props);
        const body = visibleMessage(parsed.message);
        const visible = parsed.reference === undefined
            ? body
            : [`@${parsed.reference.title}`, body].filter(part => part.length > 0).join('\n\n');
        const existingLabels = props.node.data.referenceLabels ?? [];
        const node = {
            ...props.node,
            data: {
                ...props.node.data,
                content: replaceTextContent(props.node.data.content, visible),
                ...(parsed.reference === undefined
                    ? {}
                    : { referenceLabels: [...new Set([parsed.reference.title, ...existingLabels])] }),
            },
        };
        const original = createElement(Original, { ...props, node });
        if (parsed.annotations === undefined)
            return original;
        return (_jsxs("div", { className: "dsh-side-chat-parent-user-message", children: [_jsx(SelectionQuote, { selections: parsed.annotations, messages: SIDE_CHAT_MESSAGES[currentLocale()] }), _jsx("div", { className: "dsh-side-chat-parent-user-message-body", children: original })] }));
    };
}
/** Mount the composer capsule and a thin wrapper around DSH's user renderers. */
export function mountParentConversationAnnotations(ctx, removeAnnotations) {
    const slots = ctx.slots;
    const removeDock = slots.inject('conversation.input.dock', () => slots.register({
        name: 'conversation.input.dock',
        id: 'dsh-side-chat-annotations',
        // This zero-height projection must follow Todo (0), Goal (10), and Queue
        // (20), so its absolute child remains anchored to the input card below.
        order: 30,
    }, ({ input }) => (_jsx(ParentComposerAnnotations, { input: input, onRemove: removeAnnotations }))));
    const shadow = (key) => slots.inject('conversation.chat.node', () => {
        const ShadowedUserMessage = (props) => {
            // Built-in keyed renderers can register after this declaration callback.
            // Resolve the next-priority renderer at render time so load order does
            // not decide whether annotations are projected.
            const original = slots.entries('conversation.chat.node')
                .find(entry => entry.options.key === key
                && entry.component !== ShadowedUserMessage
                && (entry.options.priority ?? 0) >= 0)
                ?.component;
            if (original === undefined)
                return null;
            const Renderer = annotatedUserMessageRenderer(original);
            return createElement(Renderer, props);
        };
        return slots.register({
            name: 'conversation.chat.node',
            key,
            priority: -100,
            locale: 'conversation',
        }, ShadowedUserMessage);
    });
    const removeUser = shadow('user');
    const removeSteering = shadow('steering');
    return () => {
        removeSteering();
        removeUser();
        removeDock();
    };
}
