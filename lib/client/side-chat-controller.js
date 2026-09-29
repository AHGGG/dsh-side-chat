import { ObservableValue } from '../shared/observable.js';
import { assertSelectionCurrent } from './selection/selection-normalizer.js';
const INITIAL = Object.freeze({ phase: 'closed', draft: '', messages: [] });
const success = (value) => ({ ok: true, value });
const failure = (error) => ({ ok: false, error });
function localError(message, code = 'invalid_request', recoverable = false) {
    return { code, message, recoverable };
}
/** Owns only plugin UI state and a cancellable model stream, never a child Session. */
export class SideChatController {
    remote;
    sessions;
    observable = new ObservableValue(INITIAL, 'dsh-side-chat');
    generation = 0;
    modelGeneration = 0;
    requestSequence = 0;
    disposed = false;
    releaseParent;
    creating;
    closing;
    running;
    cancelling = false;
    pendingRequest;
    constructor(remote, sessions) {
        this.remote = remote;
        this.sessions = sessions;
    }
    getSnapshot = () => this.observable.getSnapshot();
    subscribe = (listener) => this.observable.subscribe(listener);
    openDraft(input = {}) {
        if (this.disposed)
            return failure(localError('Side Chat has been disposed.'));
        if (this.getSnapshot().phase !== 'closed')
            return failure(localError('Close the current Side Chat first.', 'side_chat_already_open'));
        const parentSessionId = input.parentSessionId ?? this.sessions.currentSessionId();
        if (parentSessionId === undefined)
            return failure(localError('Start the main conversation first.', 'parent_session_missing'));
        try {
            if (input.selection !== undefined)
                assertSelectionCurrent(input.selection, parentSessionId);
            this.releaseParent = this.sessions.retainParent(parentSessionId);
        }
        catch (cause) {
            return failure(localError(cause instanceof Error ? cause.message : 'The parent conversation is unavailable.', 'selection_stale'));
        }
        ++this.generation;
        this.observable.publish({ phase: 'draft', parentSessionId, selection: input.selection,
            modelSelection: this.sessions.sideChatModelPreference(), draft: input.draft ?? '', messages: [] });
        return success(undefined);
    }
    setDraft(draft) {
        const state = this.getSnapshot();
        if (!['draft', 'error', 'ready'].includes(state.phase) || state.messages.length > 0 || state.error?.operation === 'close') {
            return failure(localError('The draft is not editable right now.'));
        }
        this.observable.publish({ ...state, draft });
        return success(undefined);
    }
    clearSelection() {
        const state = this.getSnapshot();
        if (state.chatId !== undefined || !['draft', 'error'].includes(state.phase))
            return failure(localError('The selected context is already captured.'));
        this.observable.publish({ ...state, selection: undefined });
        return success(undefined);
    }
    initializeModel(model) {
        const state = this.getSnapshot();
        if (state.chatId !== undefined || !['draft', 'error'].includes(state.phase))
            return failure(localError('The model cannot be initialized now.'));
        this.observable.publish({ ...state, modelSelection: { ...model } });
        return success({ ...model });
    }
    async selectModel(model) {
        const state = this.getSnapshot();
        if (this.cancelling || !['draft', 'error', 'ready'].includes(state.phase) || state.error?.operation === 'close')
            return failure(localError('Stop the reply before changing models.'));
        if (state.chatId === undefined) {
            const result = this.initializeModel(model);
            if (result.ok)
                this.sessions.rememberSideChatModelPreference(result.value);
            return result;
        }
        const generation = this.generation;
        const version = ++this.modelGeneration;
        const result = await this.invoke(() => this.remote.selectModel({ chatId: state.chatId, ...model }));
        if (!result.ok)
            return result;
        if (generation === this.generation && version === this.modelGeneration && this.getSnapshot().phase !== 'running') {
            this.observable.publish({ ...this.getSnapshot(), modelSelection: result.value.selected });
            this.sessions.rememberSideChatModelPreference(result.value.selected);
        }
        return success(result.value.selected);
    }
    async sendFirst(question) {
        const state = this.getSnapshot();
        const text = question.trim();
        if (text.length === 0 || state.parentSessionId === undefined || state.messages.length > 0
            || !['draft', 'error', 'ready'].includes(state.phase) || state.error?.operation === 'close') {
            return failure(localError('Enter a question in an open Side Chat draft.'));
        }
        if (state.chatId === undefined) {
            if (state.selection !== undefined && !this.sessions.selectionIsCurrent(state.selection)) {
                return this.fail(localError('Select the passage again before sending.', 'selection_stale'), 'create');
            }
            const atSeq = state.selection?.atSeq ?? this.sessions.lastCompletedSeq(state.parentSessionId);
            if (atSeq === undefined)
                return this.fail(localError('Wait for a completed parent turn.', 'parent_session_not_ready', true), 'create');
            const generation = this.generation;
            this.observable.publish({ ...state, phase: 'creating', draft: text, error: undefined });
            const operation = this.invoke(() => this.remote.create({
                parentSessionId: state.parentSessionId, atSeq,
                selectedText: state.selection?.text, modelSelection: state.modelSelection,
            }));
            this.creating = operation;
            const result = await operation;
            if (this.creating === operation)
                this.creating = undefined;
            if (generation !== this.generation)
                return failure(localError('The Side Chat was closed.'));
            if (!result.ok)
                return this.fail(result.error, 'create');
            this.observable.publish({ ...this.getSnapshot(), phase: 'ready', chatId: result.value.chatId,
                boundarySeq: result.value.boundarySeq, modelSelection: result.value.modelSelection, error: undefined });
        }
        return await this.send(text);
    }
    /** Resolves at admission; the independently consumed stream continues to update the transcript. */
    async send(question) {
        const state = this.getSnapshot();
        const text = question.trim();
        if (text.length === 0 || state.chatId === undefined || this.running !== undefined || this.cancelling
            || !['ready', 'error'].includes(state.phase) || state.error?.operation === 'close') {
            return failure(localError('Wait for the current reply or stop it before sending.'));
        }
        const request = this.pendingRequest?.chatId === state.chatId && this.pendingRequest.text === text
            ? this.pendingRequest : { chatId: state.chatId, requestId: `${state.chatId}:${++this.requestSequence}`, text };
        this.pendingRequest = request;
        let stream;
        try {
            stream = this.remote.stream(request);
        }
        catch (cause) {
            return this.fail(localError(String(cause), 'transport_error', true), 'prompt');
        }
        const active = { stream, generation: this.generation, request, cancelled: false };
        this.running = active;
        this.observable.publish({ ...state, phase: state.messages.length === 0 ? 'creating' : 'running', error: undefined });
        const admission = new Promise(resolve => { active.done = this.consume(active, resolve); });
        return await admission;
    }
    async cancel() {
        const chatId = this.getSnapshot().chatId;
        if (chatId === undefined || this.running === undefined)
            return success(undefined);
        this.cancelling = true;
        const active = this.running;
        active.cancelled = true;
        this.disposeStream(active.stream);
        try {
            const result = await this.invoke(() => this.remote.cancel({ chatId }));
            await active.done;
            return result.ok ? success(undefined) : result;
        }
        finally {
            this.cancelling = false;
        }
    }
    async retry() {
        const state = this.getSnapshot();
        if (state.error?.operation === 'close')
            return await this.close();
        if (state.messages.length === 0)
            return await this.sendFirst(state.draft);
        if (this.pendingRequest !== undefined)
            return await this.send(this.pendingRequest.text);
        return failure(localError('An admitted question is never replayed automatically. Send a follow-up to continue.'));
    }
    async close() {
        if (this.closing !== undefined)
            return await this.closing;
        if (this.getSnapshot().phase === 'closed')
            return success(undefined);
        const operation = this.closeCurrent();
        this.closing = operation;
        try {
            return await operation;
        }
        finally {
            if (this.closing === operation)
                this.closing = undefined;
        }
    }
    async dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        try {
            const result = await this.close();
            if (!result.ok)
                this.sessions.notify({ kind: 'warning', text: result.error.message });
        }
        finally {
            if (this.running !== undefined)
                this.disposeStream(this.running.stream);
            this.releaseParent?.();
            this.releaseParent = undefined;
            this.observable.dispose();
        }
    }
    async consume(active, resolve) {
        let admitted = false;
        let terminal = false;
        const current = () => active.generation === this.generation && this.running === active;
        const assistantId = `${active.request.requestId}:assistant`;
        try {
            for await (const event of active.stream) {
                if (!current())
                    break;
                const state = this.getSnapshot();
                if (event.type === 'started') {
                    if (admitted || event.requestId !== active.request.requestId)
                        throw new Error('Invalid Side Chat admission response.');
                    admitted = true;
                    this.pendingRequest = undefined;
                    this.observable.publish({ ...state, phase: 'running', draft: '', modelSelection: event.modelSelection,
                        messages: [...state.messages,
                            { id: `${active.request.requestId}:user`, role: 'user', text: active.request.text, status: 'complete',
                                selectedText: state.messages.length === 0 ? state.selection?.text : undefined },
                            { id: assistantId, role: 'assistant', text: '', reasoning: '', status: 'streaming' },
                        ], error: undefined });
                    this.sessions.rememberSideChatModelPreference(event.modelSelection);
                    resolve(success(undefined));
                }
                else if (event.type === 'content') {
                    if (!admitted)
                        throw new Error('Side Chat content arrived before admission.');
                    this.observable.publish({ ...state, messages: state.messages.map(message => message.id === assistantId
                            ? { ...message, text: event.text, reasoning: event.reasoning } : message) });
                }
                else if (event.type === 'finished') {
                    if (!admitted)
                        throw new Error('Side Chat ended before admission.');
                    terminal = true;
                    this.observable.publish({ ...state, phase: 'ready', messages: state.messages.map(message => message.id === assistantId
                            ? { ...message, status: event.status } : message) });
                    break;
                }
                else {
                    terminal = true;
                    const issue = { ...event.error, recoverable: !admitted && event.error.recoverable };
                    this.streamFailure(issue, assistantId);
                    resolve(failure(issue));
                    break;
                }
            }
            if (current() && !terminal && !active.cancelled)
                throw new Error('The Side Chat connection ended before the reply completed.');
        }
        catch (cause) {
            if (current() && !active.cancelled) {
                const issue = localError(cause instanceof Error ? cause.message : String(cause), 'transport_error', !admitted);
                this.streamFailure(issue, assistantId);
                resolve(failure(issue));
            }
        }
        finally {
            if (current() && active.cancelled) {
                this.pendingRequest = undefined;
                const state = this.getSnapshot();
                this.observable.publish({ ...state, phase: 'ready', error: undefined,
                    messages: state.messages.map(message => message.id === assistantId ? { ...message, status: 'stopped' } : message) });
            }
            this.disposeStream(active.stream);
            if (this.running === active)
                this.running = undefined;
            resolve(failure(localError('The Side Chat was closed.')));
        }
    }
    streamFailure(issue, assistantId) {
        const state = this.getSnapshot();
        this.observable.publish({ ...state, phase: state.messages.length === 0 ? 'error' : 'ready',
            messages: state.messages.map(message => message.id === assistantId ? { ...message, status: 'error' } : message),
            error: { ...issue, operation: 'prompt' } });
    }
    async closeCurrent() {
        const state = this.getSnapshot();
        const creating = this.creating;
        ++this.generation;
        if (this.running !== undefined)
            this.disposeStream(this.running.stream);
        this.running = undefined;
        this.observable.publish({ ...state, phase: 'closing', error: undefined });
        let chatId = state.chatId;
        if (creating !== undefined) {
            const created = await creating;
            if (created.ok)
                chatId = created.value.chatId;
        }
        if (chatId !== undefined) {
            const result = await this.invoke(() => this.remote.close({ chatId: chatId }));
            if (!result.ok && result.error.code !== 'side_chat_not_found') {
                this.observable.publish({ ...this.getSnapshot(), phase: 'error', chatId, error: { ...result.error, operation: 'close' } });
                return result;
            }
        }
        this.pendingRequest = undefined;
        this.releaseParent?.();
        this.releaseParent = undefined;
        this.observable.publish(INITIAL);
        return success(undefined);
    }
    fail(issue, operation) {
        this.observable.publish({ ...this.getSnapshot(), phase: 'error', error: { ...issue, operation } });
        return failure(issue);
    }
    disposeStream(stream) {
        try {
            stream.dispose();
        }
        catch { /* A broken carrier must not prevent the explicit Host cancel/close RPC or parent release. */ }
    }
    async invoke(operation) {
        try {
            return await operation();
        }
        catch (cause) {
            return failure(localError(cause instanceof Error ? cause.message : String(cause), 'transport_error', true));
        }
    }
}
