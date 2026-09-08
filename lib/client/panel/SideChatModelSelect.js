import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, } from 'react';
import { IconCheckOutline16, IconChevronDownOutline14, IconChevronRightOutline14, IconWarningOutline16, Toast, } from '@deepseek-ai/dsh-client-ui-primitives';
const MODEL_MESSAGES = {
    en: {
        selectModel: 'Select model',
        menu: 'Model and reasoning effort',
        model: 'Model',
        effort: 'Effort',
        providerDefault: 'Default',
        loading: 'Refreshing model list…',
        reload: 'Reload',
        emptyModels: 'No models available.',
        emptyEfforts: 'This model provides no reasoning effort levels.',
        aria: (model, effort) => effort === undefined
            ? `Select model, current ${model}`
            : `Select model, current ${model}, reasoning effort ${effort}`,
        operationFailed: message => `Model operation failed: ${message}`,
        groupFailed: (name, message) => `${name} failed to load: ${message}`,
    },
    'zh-CN': {
        selectModel: '选择模型',
        menu: '模型与推理等级',
        model: '模型',
        effort: '推理等级',
        providerDefault: 'Default',
        loading: '正在刷新模型列表…',
        reload: '重新加载',
        emptyModels: '没有可用的模型。',
        emptyEfforts: '当前模型未提供推理等级。',
        aria: (model, effort) => effort === undefined
            ? `选择模型，当前 ${model}`
            : `选择模型，当前 ${model}，推理等级 ${effort}`,
        operationFailed: message => `模型操作失败：${message}`,
        groupFailed: (name, message) => `${name} 加载失败：${message}`,
    },
};
function sameModel(selection, provider, model) {
    return selection?.provider === provider && selection.model === model;
}
function sameSelection(left, right) {
    return left.provider === right.provider
        && left.model === right.model
        && left.reasoningEffort === right.reasoningEffort;
}
function repairSelection(selection, choices, fallback) {
    const choice = choices.find(candidate => sameModel(selection, candidate.group.id, candidate.model.id));
    if (choice === undefined)
        return fallback;
    const reasoning = choice.model.reasoning;
    if (reasoning === undefined)
        return { provider: selection.provider, model: selection.model };
    if (selection.reasoningEffort === undefined
        || reasoning.efforts.some(effort => effort.id === selection.reasoningEffort)) {
        return selection;
    }
    return {
        provider: selection.provider,
        model: selection.model,
        ...(reasoning.defaultEffort === undefined ? {} : { reasoningEffort: reasoning.defaultEffort }),
    };
}
/** Side Chat projection of DSH Web's native composer model selector. */
export function SideChatModelSelect({ directory, selection, locked, validateInitialSelection = true, locale = 'en', onInitialize, onSelect, }) {
    const messages = MODEL_MESSAGES[locale];
    const state = useSyncExternalStore(listener => directory.store.subscribe(listener), () => directory.store.getSnapshot(), () => directory.store.getSnapshot());
    const [open, setOpen] = useState(false);
    const [pane, setPane] = useState('root');
    const [selecting, setSelecting] = useState(false);
    const [toast, setToast] = useState(null);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const itemRefs = useRef([]);
    const initialized = useRef(false);
    const operation = useRef(0);
    const toastSequence = useRef(0);
    const id = useId();
    const choices = useMemo(() => state.groups.flatMap(group => group.models.map(model => ({ group, model }))), [state.groups]);
    const current = selection ?? state.current ?? undefined;
    const currentChoice = choices.find(choice => sameModel(current, choice.group.id, choice.model.id));
    const reasoning = currentChoice?.model.reasoning;
    const effectiveEffort = current?.reasoningEffort ?? reasoning?.defaultEffort;
    const effortLabel = reasoning === undefined
        ? undefined
        : effectiveEffort === undefined
            ? messages.providerDefault
            : reasoning.efforts.find(level => level.id === effectiveEffort)?.name ?? effectiveEffort;
    const effortChoices = useMemo(() => reasoning === undefined
        ? []
        : [
            ...(reasoning.defaultEffort === undefined
                ? [{ key: 'provider-default', effort: undefined, label: messages.providerDefault }]
                : []),
            ...reasoning.efforts.map(effort => ({
                key: `effort:${effort.id}`,
                effort: effort.id,
                label: effort.name,
                ...(effort.description === undefined ? {} : { description: effort.description }),
            })),
        ], [messages.providerDefault, reasoning]);
    const modelLabel = currentChoice?.model.name ?? messages.selectModel;
    const triggerLabel = effortLabel === undefined ? modelLabel : `${modelLabel} · ${effortLabel}`;
    const reload = () => {
        void directory.load().catch(() => undefined);
    };
    useEffect(() => { reload(); }, [directory]);
    useEffect(() => {
        if (initialized.current)
            return;
        if (selection !== undefined && !validateInitialSelection) {
            initialized.current = true;
            return;
        }
        if (state.current === null)
            return;
        const directoryCurrent = {
            provider: state.current.provider,
            model: state.current.model,
            ...(state.current.reasoningEffort === undefined
                ? {}
                : { reasoningEffort: state.current.reasoningEffort }),
        };
        if (selection === undefined) {
            initialized.current = true;
            onInitialize(directoryCurrent, { remember: false });
            return;
        }
        if (state.status !== 'ready')
            return;
        initialized.current = true;
        const repaired = repairSelection(selection, choices, directoryCurrent);
        if (!sameSelection(selection, repaired))
            onInitialize(repaired, { remember: true });
    }, [choices, onInitialize, selection, state.current, state.status, validateInitialSelection]);
    useEffect(() => {
        if (!open)
            return;
        const closeOutside = (event) => {
            if (!rootRef.current?.contains(event.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', closeOutside);
        return () => { document.removeEventListener('mousedown', closeOutside); };
    }, [open]);
    const show = () => {
        setPane('root');
        setOpen(true);
        reload();
    };
    const close = (restoreFocus = false) => {
        setOpen(false);
        setPane('root');
        if (restoreFocus)
            queueMicrotask(() => { triggerRef.current?.focus(); });
    };
    const moveFocus = (offset) => {
        const items = itemRefs.current.filter((item) => item !== null);
        if (items.length === 0)
            return;
        const active = items.findIndex(item => item === document.activeElement);
        items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus();
    };
    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            if (pane !== 'root')
                setPane('root');
            else
                close(true);
            return;
        }
        if (!open || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp'))
            return;
        event.preventDefault();
        moveFocus(event.key === 'ArrowDown' ? 1 : -1);
    };
    const onBlur = (event) => {
        if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget))
            return;
        close();
    };
    const submitSelection = async (next) => {
        const generation = ++operation.current;
        setSelecting(true);
        const result = await onSelect(next);
        if (generation !== operation.current)
            return;
        setSelecting(false);
        if (!result.ok) {
            toastSequence.current += 1;
            setToast({
                seq: toastSequence.current,
                text: messages.operationFailed(result.error.message),
            });
            return;
        }
        close(true);
    };
    const chooseModel = (group, model) => {
        if (sameModel(current, group.id, model.id)) {
            close(true);
            return;
        }
        void submitSelection({
            provider: group.id,
            model: model.id,
            ...(model.reasoning?.defaultEffort === undefined
                ? {}
                : { reasoningEffort: model.reasoning.defaultEffort }),
        });
    };
    const chooseEffort = (effort) => {
        if (current === undefined)
            return;
        if (effectiveEffort === effort) {
            close(true);
            return;
        }
        void submitSelection({
            provider: current.provider,
            model: current.model,
            ...(effort === undefined ? {} : { reasoningEffort: effort }),
        });
    };
    itemRefs.current = [];
    let itemIndex = 0;
    const itemRef = () => {
        const index = itemIndex++;
        return (node) => { itemRefs.current[index] = node; };
    };
    return (_jsxs("div", { ref: rootRef, className: "dsh-side-chat-model-root", "data-side-chat-model-select": "", onKeyDown: onKeyDown, onBlur: onBlur, children: [_jsxs("button", { ref: triggerRef, type: "button", className: "dsh-side-chat-model-trigger", "aria-label": messages.aria(modelLabel, effortLabel), "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? `${id}-menu` : undefined, title: triggerLabel, disabled: locked, onClick: () => { if (open)
                    close();
                else
                    show(); }, children: [_jsx("span", { className: "dsh-side-chat-model-trigger-label", children: modelLabel }), effortLabel !== undefined && (_jsx("span", { className: "dsh-side-chat-model-trigger-effort", children: effortLabel })), _jsx(IconChevronDownOutline14, { className: `dsh-side-chat-model-chevron${open ? ' dsh-side-chat-model-chevron-open' : ''}` })] }), open && (_jsxs("div", { id: `${id}-menu`, className: "dsh-side-chat-model-menu", role: "menu", "aria-label": messages.menu, "aria-busy": state.status === 'loading' || selecting, children: [pane === 'root' && (_jsxs(_Fragment, { children: [_jsxs("button", { ref: itemRef(), type: "button", role: "menuitem", className: "dsh-side-chat-model-cell", onClick: () => { setPane('model'); }, children: [_jsx("span", { className: "dsh-side-chat-model-cell-label", children: messages.model }), _jsx("span", { className: "dsh-side-chat-model-cell-value", children: modelLabel }), _jsx(IconChevronRightOutline14, { className: "dsh-side-chat-model-cell-chevron" })] }), reasoning !== undefined && (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitem", className: "dsh-side-chat-model-cell", onClick: () => { setPane('effort'); }, children: [_jsx("span", { className: "dsh-side-chat-model-cell-label", children: messages.effort }), _jsx("span", { className: "dsh-side-chat-model-cell-value", children: effortLabel }), _jsx(IconChevronRightOutline14, { className: "dsh-side-chat-model-cell-chevron" })] }))] })), pane === 'model' && (_jsxs(_Fragment, { children: [state.status === 'loading' && (_jsx("div", { className: "dsh-side-chat-model-status", children: messages.loading })), state.error !== null && (_jsxs("div", { className: "dsh-side-chat-model-error", role: "alert", children: [_jsx("span", { children: messages.operationFailed(state.error) }), _jsx("button", { type: "button", className: "dsh-side-chat-model-retry", onClick: reload, children: messages.reload })] })), state.failures.map(failure => (_jsxs("div", { className: "dsh-side-chat-model-warning", children: [_jsx("span", { children: messages.groupFailed(failure.name, failure.message) }), _jsx("button", { type: "button", className: "dsh-side-chat-model-retry", onClick: reload, children: messages.reload })] }, failure.id))), _jsx("div", { className: "dsh-side-chat-model-groups scrollable", children: state.groups.map(group => {
                                    const headingId = `${id}-${group.id}`;
                                    return (_jsxs("section", { role: "group", "aria-labelledby": headingId, className: "dsh-side-chat-model-group", children: [_jsx("div", { id: headingId, className: "dsh-side-chat-model-group-title", children: group.name }), group.models.map(model => {
                                                const selected = sameModel(current, group.id, model.id);
                                                return (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitemradio", "aria-checked": selected, className: `dsh-side-chat-model-option${selected ? ' dsh-side-chat-model-selected' : ''}`, title: model.name, disabled: selecting, onClick: () => { chooseModel(group, model); }, children: [_jsxs("span", { className: "dsh-side-chat-model-option-copy", children: [_jsx("span", { className: "dsh-side-chat-model-name", children: model.name }), model.description !== undefined && (_jsx("span", { className: "dsh-side-chat-model-description", children: model.description }))] }), _jsx("span", { className: "dsh-side-chat-model-check", children: selected ? _jsx(IconCheckOutline16, {}) : null })] }, model.id));
                                            })] }, group.id));
                                }) }), state.status === 'ready' && choices.length === 0 && (_jsx("div", { className: "dsh-side-chat-model-empty", children: messages.emptyModels }))] })), pane === 'effort' && (effortChoices.length === 0
                        ? _jsx("div", { className: "dsh-side-chat-model-empty", children: messages.emptyEfforts })
                        : effortChoices.map(level => {
                            const selected = effectiveEffort === level.effort;
                            return (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitemradio", "aria-checked": selected, className: `dsh-side-chat-model-option${selected ? ' dsh-side-chat-model-selected' : ''}`, disabled: selecting, onClick: () => { chooseEffort(level.effort); }, children: [_jsxs("span", { className: "dsh-side-chat-model-option-copy", children: [_jsx("span", { className: "dsh-side-chat-model-name", children: level.label }), level.description !== undefined && (_jsx("span", { className: "dsh-side-chat-model-description", children: level.description }))] }), _jsx("span", { className: "dsh-side-chat-model-check", children: selected ? _jsx(IconCheckOutline16, {}) : null })] }, level.key));
                        }))] })), toast !== null && (_jsx(Toast, { text: toast.text, icon: _jsx(IconWarningOutline16, {}), anchor: rootRef.current?.closest('[data-composer-card]') ?? null, onDone: () => { setToast(null); } }, toast.seq))] }));
}
