import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { SIDE_CHAT_MESSAGES } from './messages.js';
import { SelectionQuote } from './SelectionQuote.js';
import { SendIcon } from './SendIcon.js';
import { SideChatBody } from './SideChatBody.js';
import { SideChatErrorState } from './SideChatErrorState.js';
import { SideChatHeader } from './SideChatHeader.js';
import { useAutoGrowingTextarea } from './use-auto-growing-textarea.js';
export function SideChatPanel({ state, locale = 'en', embeddedConversation, modelControl, onDraftChange, onFirstSend, onClose, onRetry, onFocusParent, onAddToConversation, addToConversationDisabled, onRemoveSelection, }) {
    const messages = SIDE_CHAT_MESSAGES[locale];
    const [submitting, setSubmitting] = useState(false);
    const draftRef = useAutoGrowingTextarea(state.draft);
    const submit = async (event) => {
        event.preventDefault();
        if (submitting)
            return;
        setSubmitting(true);
        try {
            await onFirstSend(state.draft);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("aside", { className: "dsh-side-chat-panel", "data-side-chat-panel": "", "aria-label": messages.title, "aria-busy": ['creating', 'opening', 'closing'].includes(state.phase) || undefined, children: [_jsx(SideChatHeader, { phase: state.phase, messages: messages, ...onAddToConversation === undefined ? {} : { onAddToConversation }, ...addToConversationDisabled === undefined ? {} : { addToConversationDisabled }, onFocusParent: onFocusParent, onClose: () => { void onClose(); } }), state.error !== undefined && (_jsx(SideChatErrorState, { error: state.error, messages: messages, onRetry: () => { void onRetry(); } })), state.childSessionId !== undefined && embeddedConversation !== undefined
                ? _jsx(SideChatBody, { children: embeddedConversation })
                : (_jsxs("form", { className: "dsh-side-chat-draft", "data-composer-card": "", onSubmit: (event) => { void submit(event); }, children: [state.selection !== undefined && (_jsx(SelectionQuote, { selections: [state.selection], messages: messages, ...onRemoveSelection === undefined ? {} : { onRemove: onRemoveSelection } })), _jsx("label", { htmlFor: "dsh-side-chat-draft-input", children: messages.placeholder }), _jsx("textarea", { id: "dsh-side-chat-draft-input", ref: draftRef, autoFocus: true, rows: 1, value: state.draft, disabled: ['creating', 'opening', 'closing'].includes(state.phase), placeholder: messages.placeholder, onChange: (event) => { onDraftChange(event.target.value); }, onKeyDown: (event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            } }), _jsxs("div", { className: "dsh-side-chat-draft-actions", children: [modelControl, _jsx("button", { type: "submit", className: "dsh-side-chat-send-button", "aria-label": messages.send, disabled: submitting || state.draft.trim().length === 0, children: _jsx(SendIcon, {}) })] })] })), _jsxs("footer", { className: "dsh-side-chat-footer", children: [_jsx("span", { children: messages.temporary }), _jsx("span", { children: messages.referenceOnly }), _jsx("span", { children: messages.cannotReopen }), _jsx("span", { children: messages.sharedWorkspace })] }), _jsx("div", { className: "dsh-side-chat-announcer", "aria-live": "polite", children: state.phase === 'running' ? 'Side Chat running' : `Side Chat ${state.phase}` })] }));
}
