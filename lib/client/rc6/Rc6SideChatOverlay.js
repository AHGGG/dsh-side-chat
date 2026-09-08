import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, } from 'react';
import { conversationSelectionAnnotations, } from '../parent-composer/add-to-conversation.js';
import { referencedSideChatConversation } from '../parent-composer/referenced-conversation.js';
import { SideChatModelSelect } from '../panel/SideChatModelSelect.js';
import { SideChatPanel } from '../panel/SideChatPanel.js';
import { ConversationAnnotationMarkers } from '../selection/ConversationAnnotationMarkers.js';
import { captureDomConversationSelection } from '../selection/selection-controller.js';
import { SelectionActions } from '../selection/SelectionActions.js';
import { ArchivedConversation } from './ArchivedConversation.js';
import { Rc6SideChatSessions, selectionDescriptor } from './sessions-adapter.js';
const MORE_DETAILS_PROMPT = 'Please explain the selected passage in more detail.';
const TOUCH_SELECTION_SETTLE_MS = 300;
const TOUCH_ACTIVATION_SUPPRESS_MS = 750;
function captureEvent(event) {
    if (event instanceof KeyboardEvent && event.key === 'Escape')
        return false;
    const target = event.target;
    return !(target instanceof Element
        && target.closest([
            '[data-side-chat-panel]',
            '.dsh-side-chat-selection-actions',
            '.dsh-side-chat-selection-comment',
            '.dsh-side-chat-annotation-marker',
        ].join(', ')) !== null);
}
function focusParentComposer() {
    const input = document.querySelector([
        '[data-composer-seat] textarea',
        '[data-composer-seat] [role="textbox"]',
        '[data-composer-seat] [contenteditable="true"]',
    ].join(', '));
    if (input === null)
        return;
    input.focus();
    if (input instanceof HTMLTextAreaElement) {
        input.setSelectionRange(input.value.length, input.value.length);
        return;
    }
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}
/** rc.6 compatibility surface: selection toolbar plus a non-current child conversation panel. */
export function Rc6SideChatOverlay({ controller, sessions, }) {
    const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const currentSessionId = useSyncExternalStore(sessions.subscribeList, () => sessions.currentSessionId(), () => sessions.currentSessionId());
    const composerInput = useSyncExternalStore(sessions.subscribeConversationInput, sessions.currentConversationInputSnapshot, sessions.currentConversationInputSnapshot);
    const annotations = useMemo(() => composerInput === undefined ? [] : conversationSelectionAnnotations(composerInput), [composerInput]);
    const [activeSelection, setActiveSelection] = useState(null);
    const [editingAnnotation, setEditingAnnotation] = useState(null);
    const captureGeneration = useRef(0);
    const captureTimer = useRef(undefined);
    const mouseDownPoint = useRef(null);
    const annotationEditing = useRef(false);
    const touchInteraction = useRef(false);
    const suppressTouchCaptureUntil = useRef(0);
    const capture = useCallback(async (touch) => {
        const generation = ++captureGeneration.current;
        const parentSessionId = sessions.currentSessionId();
        const face = parentSessionId === undefined ? undefined : sessions.face(parentSessionId);
        const conversationRoot = document.querySelector('[data-chat-flow]');
        const browserSelection = window.getSelection();
        if (parentSessionId === undefined
            || face === undefined
            || conversationRoot === null
            || browserSelection === null
            || browserSelection.isCollapsed) {
            if (generation === captureGeneration.current)
                setActiveSelection(null);
            return;
        }
        const snapshot = face.getSnapshot();
        try {
            const captured = await captureDomConversationSelection({
                selection: browserSelection,
                conversationRoot,
                parentSessionId,
                resolver: {
                    resolve(anchor) {
                        const key = anchor.dataset['chatAnchorKey'];
                        return key === undefined ? undefined : selectionDescriptor(snapshot, key);
                    },
                },
            });
            if (generation === captureGeneration.current) {
                setActiveSelection({ value: captured, touch });
            }
        }
        catch {
            if (generation === captureGeneration.current)
                setActiveSelection(null);
        }
    }, [sessions]);
    const cancelScheduledCapture = useCallback(() => {
        if (captureTimer.current === undefined)
            return;
        window.clearTimeout(captureTimer.current);
        captureTimer.current = undefined;
    }, []);
    const scheduleTouchCapture = useCallback(() => {
        cancelScheduledCapture();
        const generation = ++captureGeneration.current;
        captureTimer.current = window.setTimeout(() => {
            captureTimer.current = undefined;
            if (generation !== captureGeneration.current || annotationEditing.current)
                return;
            void capture(true);
        }, TOUCH_SELECTION_SETTLE_MS);
    }, [cancelScheduledCapture, capture]);
    useEffect(() => {
        const clearSelection = () => {
            cancelScheduledCapture();
            mouseDownPoint.current = null;
            annotationEditing.current = false;
            ++captureGeneration.current;
            setActiveSelection(null);
            setEditingAnnotation(null);
        };
        const touchCaptureSuppressed = () => Date.now() < suppressTouchCaptureUntil.current;
        const onPointerDown = (event) => {
            if (!captureEvent(event))
                return;
            if (event.pointerType === 'touch' && touchCaptureSuppressed())
                return;
            if (event.pointerType !== 'touch')
                suppressTouchCaptureUntil.current = 0;
            touchInteraction.current = event.pointerType === 'touch';
            if (touchInteraction.current)
                clearSelection();
        };
        const onTouchStart = (event) => {
            if (!captureEvent(event) || touchCaptureSuppressed())
                return;
            touchInteraction.current = true;
            clearSelection();
        };
        const onTouchEnd = (event) => {
            if (!captureEvent(event) || touchCaptureSuppressed())
                return;
            touchInteraction.current = true;
            scheduleTouchCapture();
        };
        const onMouseDown = (event) => {
            if (touchInteraction.current || touchCaptureSuppressed()) {
                mouseDownPoint.current = null;
                return;
            }
            if (!captureEvent(event)) {
                mouseDownPoint.current = null;
                return;
            }
            cancelScheduledCapture();
            mouseDownPoint.current = { x: event.clientX, y: event.clientY };
            annotationEditing.current = false;
            ++captureGeneration.current;
            setActiveSelection(null);
            setEditingAnnotation(null);
        };
        const onMouseUp = (event) => {
            const start = mouseDownPoint.current;
            mouseDownPoint.current = null;
            if (!captureEvent(event) || touchCaptureSuppressed())
                return;
            if (touchInteraction.current) {
                scheduleTouchCapture();
                return;
            }
            const moved = start === null
                || Math.abs(event.clientX - start.x) > 2
                || Math.abs(event.clientY - start.y) > 2;
            if (moved || event.detail > 1 || event.shiftKey)
                void capture(false);
        };
        const onSelectionChange = () => {
            if (annotationEditing.current)
                return;
            if (touchInteraction.current) {
                scheduleTouchCapture();
                return;
            }
            const browserSelection = window.getSelection();
            if (browserSelection !== null && !browserSelection.isCollapsed)
                return;
            cancelScheduledCapture();
            ++captureGeneration.current;
            setActiveSelection(null);
        };
        const onKeyUp = (event) => {
            touchInteraction.current = false;
            cancelScheduledCapture();
            if (event.key === 'Escape') {
                ++captureGeneration.current;
                annotationEditing.current = false;
                setActiveSelection(null);
                setEditingAnnotation(null);
                void controller.close();
                return;
            }
            if (captureEvent(event))
                void capture(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('selectionchange', onSelectionChange);
        document.addEventListener('keyup', onKeyUp);
        return () => {
            cancelScheduledCapture();
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('selectionchange', onSelectionChange);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [cancelScheduledCapture, capture, controller, scheduleTouchCapture]);
    useEffect(() => {
        cancelScheduledCapture();
        ++captureGeneration.current;
        annotationEditing.current = false;
        setActiveSelection(null);
        setEditingAnnotation(null);
    }, [cancelScheduledCapture, currentSessionId]);
    useEffect(() => {
        if (composerInput !== undefined)
            sessions.reconcileConversationAnnotationPersistence();
    }, [composerInput, sessions]);
    useEffect(() => {
        if (editingAnnotation === null)
            return;
        if (annotations.some(annotation => annotation.annotationIndex === editingAnnotation.annotationIndex))
            return;
        annotationEditing.current = false;
        setEditingAnnotation(null);
    }, [annotations, editingAnnotation]);
    const dismissActiveSelection = useCallback(() => {
        cancelScheduledCapture();
        if (touchInteraction.current) {
            suppressTouchCaptureUntil.current = Date.now() + TOUCH_ACTIVATION_SUPPRESS_MS;
        }
        touchInteraction.current = false;
        annotationEditing.current = false;
        ++captureGeneration.current;
        setActiveSelection(null);
    }, [cancelScheduledCapture]);
    const askDisabledReason = state.phase === 'closed'
        ? undefined
        : 'Close the current Side Chat before starting another one.';
    const childFace = state.childSessionId === undefined ? undefined : sessions.face(state.childSessionId);
    const childCwd = state.childSessionId === undefined ? undefined : sessions.cwd(state.childSessionId);
    const inheritedThroughSeq = state.inheritedThroughSeq;
    const locale = navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
    const modelDirectory = state.parentSessionId === undefined
        ? undefined
        : sessions.modelDirectory?.(state.parentSessionId);
    const addToConversationDisabled = childFace === undefined
        || inheritedThroughSeq === undefined
        || state.parentSessionId === undefined
        || state.childSessionId === undefined
        || state.phase !== 'ready';
    const addToConversation = () => {
        const parentSessionId = state.parentSessionId;
        const childSessionId = state.childSessionId;
        const face = childSessionId === undefined ? undefined : sessions.face(childSessionId);
        if (parentSessionId === undefined
            || childSessionId === undefined
            || inheritedThroughSeq === undefined
            || face === undefined) {
            sessions.notify({ kind: 'warning', text: 'The Side Chat conversation is not ready to add yet.' });
            return;
        }
        const reference = referencedSideChatConversation({
            conversationId: childSessionId,
            title: sessions.title(childSessionId) ?? (locale === 'zh-CN' ? '侧边对话' : 'Side Chat'),
            nodes: face.getSnapshot().nodes,
            inheritedThroughSeq,
        });
        if (reference.conversation.length === 0) {
            sessions.notify({ kind: 'warning', text: 'The Side Chat does not have any conversation history to add yet.' });
            return;
        }
        try {
            if (!sessions.addSideChatToConversation(parentSessionId, reference)) {
                sessions.notify({ kind: 'warning', text: 'Could not add the Side Chat to the main conversation.' });
                return;
            }
            void sessions.openSession(parentSessionId).then(focusParentComposer, () => {
                sessions.notify({ kind: 'warning', text: 'The Side Chat was added, but its parent conversation could not be opened.' });
            });
        }
        catch {
            sessions.notify({ kind: 'warning', text: 'Could not add the Side Chat to the main conversation.' });
        }
    };
    const modelControl = modelDirectory === undefined
        ? undefined
        : (_jsx(SideChatModelSelect, { directory: modelDirectory, selection: state.modelSelection, locked: ['creating', 'opening', 'closing'].includes(state.phase) || state.error?.operation === 'close', validateInitialSelection: state.childSessionId === undefined, locale: locale, onInitialize: (selection, options) => {
                if (options.remember)
                    void controller.selectModel(selection);
                else
                    controller.initializeModel(selection);
            }, onSelect: (selection) => controller.selectModel(selection) }, `${state.parentSessionId}:${state.childSessionId ?? 'draft'}`));
    return (_jsxs("div", { className: "dsh-side-chat-overlay", children: [_jsx(ConversationAnnotationMarkers, { annotations: annotations, ...editingAnnotation === null
                    ? {}
                    : { activeAnnotationIndex: editingAnnotation.annotationIndex }, onEdit: (annotation, restoredSelection) => {
                    annotationEditing.current = true;
                    cancelScheduledCapture();
                    ++captureGeneration.current;
                    setActiveSelection(null);
                    setEditingAnnotation({ ...annotation, selection: restoredSelection });
                } }), activeSelection !== null && (_jsx(SelectionActions, { selection: activeSelection.value, touchInteraction: activeSelection.touch, annotationNumber: sessions.nextConversationAnnotationNumber(), ...askDisabledReason === undefined ? {} : { askDisabledReason }, onAddToChat: (captured, comment) => {
                    try {
                        if (sessions.addSelectionToConversation(captured, comment))
                            focusParentComposer();
                        else
                            sessions.notify({ kind: 'warning', text: 'Could not add the selection to the current chat.' });
                    }
                    catch {
                        sessions.notify({ kind: 'warning', text: 'Could not add the selection to the current chat.' });
                    }
                    dismissActiveSelection();
                }, onAnnotationEditorChange: (open) => {
                    annotationEditing.current = open;
                    if (open && touchInteraction.current) {
                        suppressTouchCaptureUntil.current = Date.now() + TOUCH_ACTIVATION_SUPPRESS_MS;
                    }
                }, onMoreDetails: (captured) => {
                    const opened = controller.openDraft({ selection: captured });
                    if (!opened.ok)
                        sessions.notify({ kind: 'warning', text: opened.error.message });
                    else
                        void controller.sendFirst(MORE_DETAILS_PROMPT);
                    dismissActiveSelection();
                }, onAskInSideChat: (captured) => {
                    const opened = controller.openDraft({ selection: captured });
                    if (!opened.ok)
                        sessions.notify({ kind: 'warning', text: opened.error.message });
                    dismissActiveSelection();
                }, onDismiss: dismissActiveSelection })), editingAnnotation !== null && (_jsx(SelectionActions, { selection: editingAnnotation.selection, annotationNumber: editingAnnotation.annotationIndex + 1, annotationEditor: {
                    ...(editingAnnotation.comment === undefined
                        ? {}
                        : { initialComment: editingAnnotation.comment }),
                    dialogLabel: 'Edit annotation comment',
                }, onAddToChat: (_captured, comment) => {
                    try {
                        if (!sessions.updateConversationAnnotation(editingAnnotation.annotationIndex, comment)) {
                            sessions.notify({ kind: 'warning', text: 'Could not update the annotation.' });
                        }
                    }
                    catch {
                        sessions.notify({ kind: 'warning', text: 'Could not update the annotation.' });
                    }
                    annotationEditing.current = false;
                    setEditingAnnotation(null);
                }, onAnnotationEditorChange: (open) => { annotationEditing.current = open; }, onRemoveAnnotation: () => {
                    try {
                        if (!sessions.removeConversationAnnotation(editingAnnotation.annotationIndex)) {
                            sessions.notify({ kind: 'warning', text: 'Could not remove the annotation.' });
                        }
                    }
                    catch {
                        sessions.notify({ kind: 'warning', text: 'Could not remove the annotation.' });
                    }
                    annotationEditing.current = false;
                    setEditingAnnotation(null);
                }, onMoreDetails: () => { }, onAskInSideChat: () => { }, onDismiss: () => {
                    annotationEditing.current = false;
                    setEditingAnnotation(null);
                } }, `annotation:${String(editingAnnotation.annotationIndex)}`)), state.phase !== 'closed' && (_jsx(SideChatPanel, { state: state, locale: locale, ...childFace === undefined || inheritedThroughSeq === undefined
                    ? {}
                    : {
                        embeddedConversation: (_jsx(ArchivedConversation, { face: childFace, inheritedThroughSeq: inheritedThroughSeq, controller: controller, cwd: childCwd, ...state.selection === undefined ? {} : { selection: state.selection }, locale: locale, modelControl: modelControl })),
                    }, modelControl: modelControl, onDraftChange: (draft) => { controller.setDraft(draft); }, onFirstSend: (question) => controller.sendFirst(question), onClose: () => controller.close(), onRetry: () => controller.retry(), onFocusParent: () => {
                    if (state.parentSessionId !== undefined)
                        void sessions.openSession(state.parentSessionId);
                }, onAddToConversation: addToConversation, addToConversationDisabled: addToConversationDisabled, onRemoveSelection: () => { controller.clearSelection(); } }))] }));
}
