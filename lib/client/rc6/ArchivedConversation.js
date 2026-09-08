import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, } from 'react';
import { DisclosureRow, IconThinkOutline14, MarkdownText, } from '@deepseek-ai/dsh-client-ui-primitives';
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js';
import { SelectionQuote } from '../panel/SelectionQuote.js';
import { SendIcon } from '../panel/SendIcon.js';
import { StopIcon } from '../panel/StopIcon.js';
import { useAutoGrowingTextarea } from '../panel/use-auto-growing-textarea.js';
import { RunningToolCard, ToolBlockCard, ToolCard, } from './SideChatTool.js';
import { MARKDOWN_LABELS } from './primitive-labels.js';
function stringify(value) {
    if (typeof value === 'string')
        return value;
    try {
        return JSON.stringify(value, null, 2);
    }
    catch {
        return String(value);
    }
}
function contentText(content) {
    return content.map((block) => {
        if (block.type === 'text' || block.type === 'reasoning')
            return block.text;
        if (block.type === 'image')
            return '[Image]';
        if (block.type === 'tool-call')
            return `${block.name}(${block.arguments})`;
        if (block.type === 'tool-result')
            return contentText(block.content);
        return stringify(block);
    }).filter(Boolean).join('\n');
}
function firstSideChatQuestion(text) {
    const match = /<user_question>([\s\S]*?)<\/user_question>/u.exec(text);
    return match?.[1]?.trim() ?? text;
}
function firstLine(text) {
    const newline = text.indexOf('\n');
    return newline === -1 ? text : text.slice(0, newline);
}
function latestLine(text) {
    const visible = text.trimEnd();
    const newline = visible.lastIndexOf('\n');
    return newline === -1 ? visible : visible.slice(newline + 1);
}
function useThrottledVisualUpdate(update, intervalFrames = 3) {
    const updateRef = useRef(update);
    updateRef.current = update;
    const pendingFrameRef = useRef(null);
    useLayoutEffect(() => () => {
        if (pendingFrameRef.current === null)
            return;
        cancelAnimationFrame(pendingFrameRef.current);
        pendingFrameRef.current = null;
    }, []);
    return useCallback(() => {
        if (pendingFrameRef.current !== null)
            return;
        let remainingFrames = intervalFrames;
        const advance = () => {
            remainingFrames -= 1;
            if (remainingFrames > 0) {
                pendingFrameRef.current = requestAnimationFrame(advance);
                return;
            }
            pendingFrameRef.current = null;
            updateRef.current();
        };
        pendingFrameRef.current = requestAnimationFrame(advance);
    }, [intervalFrames]);
}
function ReasoningRow({ text, running, locale }) {
    const [expanded, setExpanded] = useState(false);
    const summaryRef = useRef(null);
    const summary = running ? latestLine(text) : firstLine(text);
    const scheduleSummaryScroll = useThrottledVisualUpdate(() => {
        const element = summaryRef.current;
        if (element === null)
            return;
        element.scrollLeft = running ? element.scrollWidth - element.clientWidth : 0;
    });
    useEffect(() => {
        scheduleSummaryScroll();
    }, [running, scheduleSummaryScroll, summary]);
    return (_jsxs("div", { className: "dsh-side-chat-reasoning", "data-variant": "think", "data-state": running ? 'running' : 'ok', children: [running && (_jsx("span", { className: "dsh-side-chat-reasoning-visually-hidden", children: locale === 'zh-CN' ? '运行中' : 'Running' })), _jsx(DisclosureRow, { rowClassName: "dsh-side-chat-reasoning-row", leadingClassName: "dsh-side-chat-reasoning-leading", titleClassName: "dsh-side-chat-reasoning-title", chevronClassName: "dsh-side-chat-reasoning-chevron", icon: _jsx(IconThinkOutline14, { size: 14 }), title: "Think", open: expanded, expandable: true, expandOnRowClick: true, onToggle: () => { setExpanded(value => !value); }, collapsedContent: (_jsxs(_Fragment, { children: [_jsx("span", { className: "dsh-side-chat-reasoning-separator", "aria-hidden": "true" }), _jsx("span", { ref: summaryRef, className: "dsh-side-chat-reasoning-summary", "data-follow-end": running || undefined, children: summary })] })), children: _jsx("div", { className: "dsh-side-chat-reasoning-body", children: text }) })] }));
}
function AssistantBlocks({ blocks, streaming = false, projectedToolCallIds, unprojectedToolState = 'pending', cwd, locale }) {
    return _jsx(_Fragment, { children: blocks.map((block, index) => {
            const key = `${block.kind}-${String(index)}`;
            if (block.kind === 'text') {
                return _jsx(MarkdownText, { text: block.text, streaming: streaming, labels: MARKDOWN_LABELS }, key);
            }
            if (block.kind === 'reasoning') {
                return (_jsx(ReasoningRow, { text: block.text, running: streaming && index === blocks.length - 1, locale: locale }, key));
            }
            if (block.kind === 'image')
                return _jsx("div", { children: "[Image attachment]" }, key);
            if (block.kind === 'tool-call') {
                if (projectedToolCallIds.has(block.callId))
                    return null;
                return (_jsx(ToolCard, { callId: block.callId, name: block.name, argsRaw: block.argsRaw, state: unprojectedToolState, cwd: cwd }, key));
            }
            return _jsx("pre", { children: stringify(block.block) }, key);
        }) });
}
function MessageRow({ node, projectedToolCallIds, cwd, locale }) {
    if (node.kind === 'user' || node.kind === 'steering') {
        return (_jsxs("article", { className: "dsh-side-chat-message", "data-role": "user", children: [_jsx("span", { className: "dsh-side-chat-message-role", children: "You" }), _jsx("div", { className: "dsh-side-chat-message-text", children: firstSideChatQuestion(contentText(node.content)) })] }));
    }
    if (node.kind === 'assistant') {
        return (_jsxs("article", { className: "dsh-side-chat-message", "data-role": "assistant", children: [_jsx("span", { className: "dsh-side-chat-message-role", children: "Assistant" }), _jsx(AssistantBlocks, { blocks: node.blocks, projectedToolCallIds: projectedToolCallIds, unprojectedToolState: node.interrupted === true ? 'interrupted' : 'pending', cwd: cwd, locale: locale }), node.interrupted === true && _jsx("span", { className: "dsh-side-chat-message-note", children: "Stopped" })] }));
    }
    if (node.kind === 'context') {
        return (_jsxs("details", { className: "dsh-side-chat-message dsh-side-chat-context-message", children: [_jsxs("summary", { children: ["Context \u00B7 ", node.provenance.label ?? node.provenance.role] }), _jsx("pre", { children: contentText(node.content) })] }));
    }
    if (node.kind === 'tool-result') {
        return _jsx(ToolBlockCard, { block: node, cwd: cwd });
    }
    if (node.kind === 'turn-error') {
        return _jsx("div", { className: "dsh-side-chat-turn-notice", role: "alert", children: node.message });
    }
    if (node.kind === 'turn-max-tokens') {
        return _jsx("div", { className: "dsh-side-chat-turn-notice", children: "The response reached its output-token limit." });
    }
    if (node.kind === 'model-retry') {
        return _jsxs("div", { className: "dsh-side-chat-turn-notice", children: ["Model retry: ", node.retryState] });
    }
    if (node.kind === 'command') {
        return _jsxs("div", { className: "dsh-side-chat-turn-notice", children: ["/", node.name ?? 'command', " ", node.outcome?.text ?? ''] });
    }
    if (node.kind === 'compaction') {
        return _jsxs("details", { className: "dsh-side-chat-turn-notice", children: [_jsx("summary", { children: "Context compacted" }), _jsx("pre", { children: node.summary })] });
    }
    return _jsxs("details", { className: "dsh-side-chat-turn-notice", children: [_jsx("summary", { children: node.type }), _jsx("pre", { children: stringify(node.data) })] });
}
function ApprovalCard({ wait, onRespond, }) {
    return (_jsxs("section", { className: "dsh-side-chat-interaction", "aria-label": "Tool approval required", children: [_jsxs("strong", { children: ["Allow tool: ", wait.toolName, "?"] }), wait.reason !== undefined && _jsx("p", { children: wait.reason }), _jsxs("div", { className: "dsh-side-chat-interaction-actions", children: [_jsx("button", { type: "button", onClick: () => { onRespond('decline'); }, children: "Decline" }), _jsx("button", { type: "button", onClick: () => { onRespond('approve'); }, children: "Allow once" })] })] }));
}
function QuestionCard({ wait, onRespond, }) {
    const questions = wait.questions;
    const [answers, setAnswers] = useState(() => Object.fromEntries(questions.map(question => [question.id, { selected: [], custom: '' }])));
    const update = (id, answer) => {
        setAnswers(current => ({ ...current, [id]: answer }));
    };
    const submit = () => {
        onRespond({
            answers: questions.map((question) => {
                const answer = answers[question.id] ?? { selected: [], custom: '' };
                const custom = answer.custom.trim();
                return {
                    id: question.id,
                    selected: [...answer.selected],
                    ...(custom.length === 0 ? {} : { custom }),
                };
            }),
        });
    };
    return (_jsxs("section", { className: "dsh-side-chat-interaction", "aria-label": "Assistant question", children: [questions.map((question) => {
                const answer = answers[question.id] ?? { selected: [], custom: '' };
                return (_jsxs("fieldset", { children: [_jsx("legend", { children: question.header === undefined ? question.question : `${question.header} · ${question.question}` }), question.detail !== undefined && _jsx("p", { children: question.detail }), question.options?.map(option => (_jsxs("label", { className: "dsh-side-chat-question-option", children: [_jsx("input", { type: question.multiSelect === true ? 'checkbox' : 'radio', name: `${wait.key}-${question.id}`, checked: answer.selected.includes(option.label), onChange: (event) => {
                                        const selected = question.multiSelect === true
                                            ? event.target.checked
                                                ? [...answer.selected, option.label]
                                                : answer.selected.filter(value => value !== option.label)
                                            : [option.label];
                                        update(question.id, { ...answer, selected });
                                    } }), _jsxs("span", { children: [_jsx("strong", { children: option.label }), option.description === undefined ? '' : ` — ${option.description}`] })] }, option.label))), _jsx("textarea", { rows: 2, value: answer.custom, placeholder: question.options === undefined ? 'Your answer' : 'Other (optional)', onChange: (event) => { update(question.id, { ...answer, custom: event.target.value }); } })] }, question.id));
            }), _jsxs("div", { className: "dsh-side-chat-interaction-actions", children: [_jsx("button", { type: "button", onClick: () => { onRespond(null); }, children: "Cancel" }), _jsx("button", { type: "button", onClick: submit, children: "Submit" })] })] }));
}
function PendingCards({ pending, controller, }) {
    return _jsx(_Fragment, { children: pending.map((wait) => wait.kind === 'approval'
            ? (_jsx(ApprovalCard, { wait: wait, onRespond: (decision) => { void controller.respondApproval(wait.key, decision); } }, wait.key))
            : (_jsx(QuestionCard, { wait: wait, onRespond: (answer) => { void controller.respondQuestion(wait.key, answer); } }, wait.key))) });
}
function QueueRows({ queue, controller }) {
    if (queue.length === 0)
        return null;
    return (_jsxs("section", { className: "dsh-side-chat-queue", "aria-label": "Queued Side Chat messages", children: [_jsx("strong", { children: "Queued" }), queue.filter(item => item.placement === 'queued').map(item => (_jsxs("div", { children: [_jsx("span", { children: item.preview }), _jsx("button", { type: "button", onClick: () => { void controller.updateQueue(item.id, { kind: 'remove' }); }, children: "Remove" })] }, item.id)))] }));
}
/** Functional rc.6 conversation surface bound to a non-current child Session. */
export function ArchivedConversation({ face, inheritedThroughSeq, controller, selection, locale = 'en', cwd, modelControl, }) {
    const snapshot = useSyncExternalStore(listener => face.subscribe(listener), () => face.getSnapshot(), () => face.getSnapshot());
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const draftRef = useAutoGrowingTextarea(draft);
    const scrollRef = useRef(null);
    const nodes = useMemo(() => snapshot.nodes.filter(node => node.seq > inheritedThroughSeq), [snapshot.nodes, inheritedThroughSeq]);
    const runningCalls = snapshot.runningCalls ?? [];
    const projectedToolCallIds = useMemo(() => new Set([
        ...nodes.filter((node) => node.kind === 'tool-result').map(node => node.callId),
        ...runningCalls.map(call => call.callId),
    ]), [nodes, runningCalls]);
    const annotatedUserNode = selection === undefined
        ? undefined
        : nodes.find(node => node.kind === 'user' || node.kind === 'steering');
    useEffect(() => {
        const element = scrollRef.current;
        if (element !== null)
            element.scrollTop = element.scrollHeight;
    }, [nodes.length, snapshot.partial, snapshot.pending.length, snapshot.queue.length]);
    const submit = async (event) => {
        event.preventDefault();
        const text = draft.trim();
        if (text.length === 0 || sending)
            return;
        setSending(true);
        try {
            const result = await controller.send(text, snapshot.running ? 'steer' : 'queue');
            if (result.ok)
                setDraft('');
        }
        finally {
            setSending(false);
        }
    };
    if (snapshot.openState === 'cold' || snapshot.openState === 'loading') {
        return _jsx("div", { className: "dsh-side-chat-loading", children: "Loading Side Chat\u2026" });
    }
    if (snapshot.openState === 'error') {
        return _jsx("div", { className: "dsh-side-chat-loading", role: "alert", children: "Could not load Side Chat history." });
    }
    return (_jsxs("div", { className: "dsh-side-chat-conversation", children: [_jsxs("div", { ref: scrollRef, className: "dsh-side-chat-transcript", "aria-live": "polite", children: [nodes.map(node => selection !== undefined && node === annotatedUserNode
                        ? (_jsxs("div", { className: "dsh-side-chat-annotated-user-message", children: [_jsx(SelectionQuote, { selections: [selection], messages: SIDE_CHAT_MESSAGES[locale] }), _jsx(MessageRow, { node: node, projectedToolCallIds: projectedToolCallIds, cwd: cwd, locale: locale })] }, `${node.kind}-${String(node.seq)}`))
                        : _jsx(MessageRow, { node: node, projectedToolCallIds: projectedToolCallIds, cwd: cwd, locale: locale }, `${node.kind}-${String(node.seq)}`)), snapshot.partial !== null && (_jsxs("article", { className: "dsh-side-chat-message", "data-role": "assistant", children: [_jsx("span", { className: "dsh-side-chat-message-role", children: "Assistant" }), _jsx(AssistantBlocks, { blocks: snapshot.partial.blocks, streaming: true, projectedToolCallIds: projectedToolCallIds, unprojectedToolState: "running", cwd: cwd, locale: locale })] })), runningCalls.map(call => (_jsx(RunningToolCard, { call: call, cwd: cwd }, call.callId))), _jsx(PendingCards, { pending: snapshot.pending, controller: controller }), _jsx(QueueRows, { queue: snapshot.queue, controller: controller }), snapshot.promptError !== null && _jsx("div", { className: "dsh-side-chat-turn-notice", role: "alert", children: snapshot.promptError.error.message })] }), _jsxs("form", { className: "dsh-side-chat-composer", "data-composer-card": "", onSubmit: (event) => { void submit(event); }, children: [_jsx("textarea", { ref: draftRef, rows: 1, value: draft, placeholder: snapshot.running ? 'Steer the current response' : 'Reply in Side Chat', onChange: (event) => { setDraft(event.target.value); }, onKeyDown: (event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                event.currentTarget.form?.requestSubmit();
                            }
                        } }), _jsxs("div", { className: "dsh-side-chat-composer-actions", children: [modelControl, snapshot.running ? (_jsx("button", { type: "button", className: "dsh-side-chat-stop-button", "aria-label": "Stop generating", title: "Stop generating", onClick: () => { void controller.cancel(); }, children: _jsx(StopIcon, {}) })) : (_jsx("button", { type: "submit", className: "dsh-side-chat-send-button", "aria-label": "Send", disabled: sending || draft.trim().length === 0, children: _jsx(SendIcon, {}) }))] })] })] }));
}
