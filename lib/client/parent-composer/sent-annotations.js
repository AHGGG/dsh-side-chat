import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ReferenceChip } from '@deepseek-ai/dsh-client-ui-primitives';
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js';
import { SelectionQuote } from '../panel/SelectionQuote.js';
import { readAnnotatedConversationPrefix, readAnnotationQuestionPrefix } from './add-to-conversation.js';
import { readReferencedConversationPrefix } from './referenced-conversation.js';
export const SIDE_CHAT_PROMPT_NODE = 'dsh-side-chat-prompt';
/** Consume only the plugin's leading metadata; native DSH rules still see the original message body. */
export const sentAnnotationRule = {
    id: SIDE_CHAT_PROMPT_NODE,
    order: -100,
    match(text, from) {
        if (from !== 0)
            return;
        let end = 0;
        let annotations = [];
        const references = [];
        while (end < text.length) {
            const rest = text.slice(end);
            const selected = annotations.length === 0 ? readAnnotatedConversationPrefix(rest) : undefined;
            if (selected !== undefined) {
                annotations = selected.annotations;
                end += selected.end;
                continue;
            }
            const referenced = readReferencedConversationPrefix(rest);
            if (referenced === undefined)
                break;
            references.push(referenced.reference.title);
            end += referenced.end;
        }
        if (end === 0)
            return;
        // Older stored prompts can include a generated question wrapper as well.
        const wrapped = annotations.length === 0 ? undefined : readAnnotationQuestionPrefix(text.slice(end));
        let question = '';
        if (wrapped !== undefined) {
            const suffix = text.slice(end + wrapped.end).trimStart();
            end = text.length - suffix.length;
            question = wrapped.text + (wrapped.text && suffix ? '\n' : '');
        }
        return {
            id: SIDE_CHAT_PROMPT_NODE,
            start: 0,
            end,
            data: { annotations, references, question, annotationOnly: end === text.length && !question && references.length === 0 },
        };
    },
};
export function SentAnnotations({ node, interactive }) {
    const { annotations, references, question, annotationOnly } = node.data;
    const locale = navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
    const messages = SIDE_CHAT_MESSAGES[locale];
    return _jsxs(_Fragment, { children: [annotations.length > 0 && _jsx("span", { className: "dsh-side-chat-sent-annotation", "data-annotation-only": annotationOnly || undefined, children: interactive ? _jsx(SelectionQuote, { inline: true, selections: annotations, messages: messages })
                    : _jsx("span", { className: "dsh-side-chat-sent-annotation-summary", children: messages.selectionAttachments(annotations.length) }) }), references.map((title, index) => _jsxs("span", { children: [_jsx(ReferenceChip, { appearance: "session", label: title, title: `@${title}` }), ' '] }, `${String(index)}:${title}`)), question] });
}
