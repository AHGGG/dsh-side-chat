import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Error strip with one direct retry action. */
export function SideChatErrorState({ error, messages, onRetry, }) {
    return (_jsxs("section", { className: "dsh-side-chat-error", role: "alert", children: [_jsx("strong", { children: error.code === 'side_chat_destroy_failed' ? messages.closeError : messages.genericError }), _jsx("p", { children: error.message }), error.recoverable && _jsx("button", { type: "button", onClick: onRetry, children: messages.retry })] }));
}
