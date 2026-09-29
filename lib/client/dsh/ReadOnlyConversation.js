import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { DisclosureRow, IconThinkOutlineRegular, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives';
import { SelectionQuote } from '../panel/SelectionQuote.js';
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js';
import { SendIcon } from '../panel/SendIcon.js';
import { StopIcon } from '../panel/StopIcon.js';
import { useAutoGrowingTextarea } from '../panel/use-auto-growing-textarea.js';
import { MARKDOWN_LABELS } from './primitive-labels.js';
function Reasoning({ text, running }) {
    const [expanded, setExpanded] = useState(false);
    const lines = text.trimEnd().split('\n');
    return _jsx("div", { className: "dsh-side-chat-reasoning", "data-variant": "think", "data-state": running ? 'running' : 'ok', children: _jsx(DisclosureRow, { rowClassName: "dsh-side-chat-reasoning-row", leadingClassName: "dsh-side-chat-reasoning-leading", titleClassName: "dsh-side-chat-reasoning-title", chevronClassName: "dsh-side-chat-reasoning-chevron", icon: _jsx(IconThinkOutlineRegular, { size: 14 }), title: "Think", open: expanded, expandable: true, expandOnRowClick: true, onToggle: () => { setExpanded(value => !value); }, collapsedContent: _jsx("span", { className: "dsh-side-chat-reasoning-summary", children: running ? lines.at(-1) : lines[0] }), children: _jsx("div", { className: "dsh-side-chat-reasoning-body", children: text }) }) });
}
function Message({ message, locale }) {
    const bubble = _jsxs("article", { className: "dsh-side-chat-message", "data-role": message.role, children: [_jsx("span", { className: "dsh-side-chat-message-role", children: message.role === 'user' ? 'You' : 'Assistant' }), message.role === 'user'
                ? _jsx("div", { className: "dsh-side-chat-message-text", children: message.text })
                : _jsxs(_Fragment, { children: [message.reasoning && _jsx(Reasoning, { text: message.reasoning, running: message.status === 'streaming' }), _jsx(MarkdownText, { text: message.text, streaming: message.status === 'streaming', labels: MARKDOWN_LABELS }), message.status === 'streaming' && message.text === '' && !message.reasoning && _jsx("span", { children: "Thinking\u2026" }), message.status === 'stopped' && _jsx("span", { className: "dsh-side-chat-message-note", children: "Stopped" }), message.status === 'error' && _jsx("span", { className: "dsh-side-chat-message-note", children: "Reply failed" })] })] });
    return message.selectedText === undefined ? bubble : _jsxs("div", { className: "dsh-side-chat-annotated-user-message", children: [_jsx(SelectionQuote, { selections: [{ text: message.selectedText }], messages: SIDE_CHAT_MESSAGES[locale] }), bubble] });
}
/** The UI renders structured plugin messages, never model-facing prompt serialization. */
export function ReadOnlyConversation({ state, controller, modelControl, locale = 'en' }) {
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [actionError, setActionError] = useState();
    const sendingRef = useRef(false);
    const stoppingRef = useRef(false);
    const revision = useRef(0);
    const follow = useRef(true);
    const scrollRef = useRef(null);
    const inputRef = useAutoGrowingTextarea(draft);
    const running = state.phase === 'running';
    const interactive = ['ready', 'running'].includes(state.phase);
    useEffect(() => {
        const element = scrollRef.current;
        if (element !== null && follow.current)
            element.scrollTop = element.scrollHeight;
    }, [state.messages]);
    const submit = async (event) => {
        event.preventDefault();
        if (draft.trim().length === 0 || !interactive || running || sendingRef.current || stoppingRef.current)
            return;
        const before = revision.current;
        sendingRef.current = true;
        setSending(true);
        setActionError(undefined);
        try {
            const result = await controller.send(draft);
            if (result.ok && before === revision.current)
                setDraft('');
            else if (!result.ok && controller.getSnapshot().error?.message !== result.error.message)
                setActionError(result.error.message);
        }
        catch {
            setActionError('The message could not be sent. Your draft has been kept.');
        }
        finally {
            sendingRef.current = false;
            setSending(false);
        }
    };
    const stop = async () => {
        if (stoppingRef.current)
            return;
        stoppingRef.current = true;
        setStopping(true);
        setActionError(undefined);
        try {
            const result = await controller.cancel();
            if (!result.ok)
                setActionError(result.error.message);
        }
        catch {
            setActionError('The request could not be stopped. Try closing Side Chat.');
        }
        finally {
            stoppingRef.current = false;
            setStopping(false);
        }
    };
    return _jsxs("div", { className: "dsh-side-chat-conversation", children: [_jsxs("div", { ref: scrollRef, className: "dsh-side-chat-transcript", "aria-live": "polite", onScroll: event => {
                    const element = event.currentTarget;
                    follow.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
                }, children: [state.messages.map(message => _jsx(Message, { message: message, locale: locale }, message.id)), actionError !== undefined && _jsx("div", { className: "dsh-side-chat-turn-notice", role: "alert", children: actionError })] }), _jsxs("form", { className: "dsh-side-chat-composer", "data-composer-card": "", onSubmit: event => { void submit(event); }, children: [_jsx("textarea", { ref: inputRef, rows: 1, value: draft, disabled: !interactive, placeholder: "Reply in Side Chat", onChange: event => { ++revision.current; setDraft(event.target.value); }, onKeyDown: event => {
                            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                                event.preventDefault();
                                event.currentTarget.form?.requestSubmit();
                            }
                        } }), _jsxs("div", { className: "dsh-side-chat-composer-actions", children: [modelControl, running && _jsx("button", { type: "button", className: "dsh-side-chat-stop-button", "aria-label": "Stop generating", disabled: !interactive || stopping, onClick: () => { void stop(); }, children: _jsx(StopIcon, {}) }), _jsx("button", { type: "submit", className: "dsh-side-chat-send-button", "aria-label": "Send", disabled: !interactive || running || sending || stopping || draft.trim().length === 0, children: _jsx(SendIcon, {}) })] })] })] });
}
