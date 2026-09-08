import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function AddToConversationIcon() {
    return (_jsxs("svg", { className: "dsh-side-chat-add-to-conversation-icon", viewBox: "0 0 20 20", "aria-hidden": "true", children: [_jsx("path", { d: "M4.25 4.5h11.5v8.25H9l-3.5 2.75v-2.75H4.25z" }), _jsx("path", { d: "M10 6.5v4M8 8.5h4" })] }));
}
export function SideChatHeader({ phase, messages, addToConversationDisabled = false, onAddToConversation, onFocusParent, onClose, }) {
    return (_jsxs("header", { className: "dsh-side-chat-header", children: [_jsx("button", { type: "button", className: "dsh-side-chat-heading", onClick: onFocusParent, children: _jsx("strong", { children: messages.title }) }), _jsxs("div", { className: "dsh-side-chat-header-actions", children: [onAddToConversation !== undefined && (_jsxs("button", { type: "button", className: "dsh-side-chat-add-to-conversation", disabled: addToConversationDisabled, onClick: onAddToConversation, children: [_jsx(AddToConversationIcon, {}), _jsx("span", { children: messages.addToConversation })] })), _jsx("button", { type: "button", className: "dsh-side-chat-close", "aria-label": messages.close, disabled: phase === 'closing', onClick: onClose, children: "\u00D7" })] })] }));
}
