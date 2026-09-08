import { ObservableValue } from '../shared/observable.js';
import { buildSideChatPrompt } from './parent-composer/add-to-conversation.js';
import { assertSelectionCurrent } from './selection/selection-normalizer.js';
const INITIAL_STATE = Object.freeze({ phase: 'closed', draft: '' });
function success(value) {
    return { ok: true, value };
}
function failure(error) {
    return { ok: false, error };
}
function localError(code, message, recoverable = true) {
    return { code, message, recoverable };
}
function phaseOf(snapshot) {
    switch (snapshot.status) {
        case 'idle': return 'ready';
        case 'running': return 'running';
        case 'needs-input': return 'needs-input';
        case 'needs-approval': return 'needs-approval';
        case 'failed': return 'error';
        case 'interrupted': return 'ready';
    }
}
/** Small controller for the stock rc.6 archived-fork path. */
export class SideChatController {
    remote;
    sessions;
    observable = new ObservableValue(INITIAL_STATE, 'dsh-side-chat');
    lease;
    childUnsubscribe;
    opening;
    closing;
    closeRequested = false;
    disposed = false;
    constructor(remote, sessions) {
        this.remote = remote;
        this.sessions = sessions;
    }
    getSnapshot = () => this.observable.getSnapshot();
    subscribe = (listener) => this.observable.subscribe(listener);
    openDraft(input = {}) {
        if (this.disposed)
            return failure(localError('transport_error', 'The Side Chat controller is disposed.', false));
        if (this.getSnapshot().phase !== 'closed') {
            return failure(localError('side_chat_already_open', 'A Side Chat is already open.'));
        }
        const parentSessionId = input.parentSessionId ?? this.sessions.currentSessionId();
        if (parentSessionId === undefined) {
            return failure(localError('parent_session_missing', 'Start the main conversation first.'));
        }
        try {
            if (input.selection !== undefined)
                assertSelectionCurrent(input.selection, parentSessionId);
        }
        catch (error) {
            return failure(localError('selection_stale', error instanceof Error ? error.message : 'The selected text is no longer available.', false));
        }
        const modelSelection = this.sessions.sideChatModelPreference();
        this.publish({
            phase: 'draft',
            parentSessionId,
            ...(input.selection === undefined ? {} : { selection: input.selection }),
            ...(modelSelection === undefined ? {} : { modelSelection }),
            draft: input.draft ?? '',
        });
        return success(undefined);
    }
    setDraft(draft) {
        const state = this.getSnapshot();
        if (state.phase === 'closed' || state.phase === 'creating' || state.phase === 'opening'
            || state.phase === 'closing' || state.childSessionId !== undefined) {
            return failure(localError('invalid_request', 'The draft is not editable right now.', false));
        }
        this.publish({ ...state, draft });
        return success(undefined);
    }
    clearSelection() {
        const state = this.getSnapshot();
        if (state.selection === undefined)
            return success(undefined);
        if (state.childSessionId !== undefined || !['draft', 'error'].includes(state.phase)) {
            return failure(localError('invalid_request', 'The selected passage has already been sent.', false));
        }
        this.publish({ ...state, selection: undefined });
        return success(undefined);
    }
    initializeModel(selection) {
        const state = this.getSnapshot();
        if (state.childSessionId !== undefined || !['draft', 'error'].includes(state.phase)
            || state.error?.operation === 'close') {
            return failure(localError('invalid_request', 'The Side Chat model cannot be initialized right now.', false));
        }
        const selected = { ...selection };
        this.publish({ ...state, modelSelection: selected });
        return success(selected);
    }
    async selectModel(selection) {
        const state = this.getSnapshot();
        if (state.phase === 'closed' || ['creating', 'opening', 'closing'].includes(state.phase)
            || state.error?.operation === 'close') {
            return failure(localError('invalid_request', 'The Side Chat model cannot be changed right now.', false));
        }
        const selected = { ...selection };
        const childSessionId = state.childSessionId;
        if (childSessionId === undefined) {
            const initialized = this.initializeModel(selected);
            if (initialized.ok)
                this.sessions.rememberSideChatModelPreference(initialized.value);
            return initialized;
        }
        const result = await this.invoke(() => this.remote.selectModel({
            childSessionId,
            ...selected,
        }));
        if (!result.ok)
            return failure(result.error);
        const latest = this.getSnapshot();
        if (latest.childSessionId === childSessionId && !['closed', 'closing'].includes(latest.phase)) {
            this.publish({ ...latest, modelSelection: result.value.selected });
            this.sessions.rememberSideChatModelPreference(result.value.selected);
        }
        return success(result.value.selected);
    }
    async sendFirst(question) {
        if (this.opening !== undefined) {
            return failure(localError('invalid_request', 'The Side Chat is already opening.', false));
        }
        const state = this.getSnapshot();
        const trimmed = question.trim();
        if (trimmed.length === 0)
            return failure(localError('invalid_request', 'Enter a Side Chat question.', false));
        if (state.parentSessionId === undefined || !['draft', 'error'].includes(state.phase)) {
            return failure(localError('invalid_request', 'The first Side Chat message cannot be sent now.', false));
        }
        if (state.error?.operation === 'close') {
            return failure(localError('side_chat_destroy_failed', 'Retry closing the current Side Chat first.'));
        }
        if (state.childSessionId === undefined && state.selection !== undefined
            && !this.sessions.selectionIsCurrent(state.selection)) {
            const error = localError('selection_stale', 'Select the passage again before sending.', false);
            this.fail(error, 'create', { draft: trimmed, firstQuestion: trimmed });
            return failure(error);
        }
        const atSeq = state.selection?.atSeq ?? this.sessions.lastCompletedSeq(state.parentSessionId);
        if (atSeq === undefined) {
            const error = localError('parent_session_not_ready', 'Wait for a completed main-conversation turn first.');
            this.fail(error, 'create', { draft: trimmed, firstQuestion: trimmed });
            return failure(error);
        }
        const operation = this.createOpenAndPrompt(state.parentSessionId, atSeq, trimmed);
        this.opening = operation;
        try {
            return await operation;
        }
        finally {
            if (this.opening === operation)
                this.opening = undefined;
        }
    }
    async send(text, mode = 'queue') {
        const trimmed = text.trim();
        if (trimmed.length === 0)
            return failure(localError('invalid_request', 'Enter a message.', false));
        return await this.sendParts([{ type: 'text', text: trimmed }], mode);
    }
    async sendParts(content, mode = 'queue') {
        if (content.length === 0)
            return failure(localError('invalid_request', 'Enter a message.', false));
        const binding = this.bindingTarget();
        if (!binding.ok)
            return binding;
        const result = await this.invoke(() => binding.value.prompt(content, mode));
        if (this.getSnapshot().phase === 'closing' || this.getSnapshot().phase === 'closed') {
            return failure(localError('transport_error', 'The Side Chat was closed.', false));
        }
        if (!result.ok)
            this.fail(result.error, 'prompt');
        return result.ok ? success(undefined) : failure(result.error);
    }
    async updateQueue(itemId, action) {
        const binding = this.bindingTarget();
        if (!binding.ok)
            return binding;
        const result = await this.invoke(() => binding.value.updateQueue(itemId, action));
        return result.ok ? success(undefined) : failure(result.error);
    }
    async cancel() {
        const binding = this.bindingTarget();
        if (!binding.ok)
            return binding;
        const result = await this.invoke(() => binding.value.cancel());
        return result.ok ? success(undefined) : failure(result.error);
    }
    async respondApproval(interactionId, decision) {
        const binding = this.bindingTarget();
        if (!binding.ok)
            return binding;
        const result = await this.invoke(() => binding.value.respondApproval(interactionId, decision));
        return result.ok ? success(undefined) : failure(result.error);
    }
    async respondQuestion(interactionId, answer) {
        const binding = this.bindingTarget();
        if (!binding.ok)
            return binding;
        const result = await this.invoke(() => binding.value.respondQuestion(interactionId, answer));
        return result.ok ? success(undefined) : failure(result.error);
    }
    async close() {
        const state = this.getSnapshot();
        if (state.phase === 'closed')
            return success(undefined);
        if (state.childSessionId === undefined && this.opening === undefined) {
            this.reset();
            return success(undefined);
        }
        if (this.opening !== undefined) {
            this.closeRequested = true;
            this.publish({ ...state, phase: 'closing', error: undefined });
            await this.opening;
            const after = this.getSnapshot();
            if (after.phase === 'closed')
                return success(undefined);
            if (after.error?.operation === 'close')
                return failure(after.error);
            if (after.childSessionId === undefined) {
                this.reset();
                return success(undefined);
            }
            return await this.closeChild(after.childSessionId);
        }
        if (state.childSessionId === undefined) {
            this.reset();
            return success(undefined);
        }
        return await this.closeChild(state.childSessionId);
    }
    async retry() {
        const state = this.getSnapshot();
        if (state.error?.operation === 'close')
            return await this.close();
        if (state.error?.operation === 'create'
            || state.error?.operation === 'open'
            || state.error?.operation === 'prompt') {
            return await this.sendFirst(state.firstQuestion ?? state.draft);
        }
        return failure(localError('invalid_request', 'There is no failed operation to retry.', false));
    }
    async dispose() {
        if (this.disposed)
            return;
        if (this.getSnapshot().phase !== 'closed') {
            const result = await this.close();
            if (!result.ok) {
                this.sessions.notify({ kind: 'warning', text: 'The Side Chat could not be closed cleanly.' });
            }
        }
        this.disposed = true;
        this.detachLease();
        this.observable.dispose();
    }
    async createOpenAndPrompt(parentSessionId, atSeq, question) {
        const original = this.getSnapshot();
        let childSessionId = original.childSessionId;
        if (childSessionId === undefined) {
            this.publish({ ...original, phase: 'creating', draft: question, firstQuestion: question, error: undefined });
            const created = await this.invoke(() => this.remote.create({
                parentSessionId,
                atSeq,
                ...(original.modelSelection === undefined ? {} : { modelSelection: original.modelSelection }),
            }));
            if (!created.ok) {
                if (this.closeRequested)
                    this.reset();
                else
                    this.fail(created.error, 'create', { draft: question, firstQuestion: question });
                return failure(created.error);
            }
            childSessionId = created.value.childSessionId;
            this.publishCreated(created.value, question);
            if (this.closeRequested || this.disposed) {
                const closed = await this.closeChild(childSessionId);
                return closed.ok
                    ? failure(localError('transport_error', 'The Side Chat was closed.', false))
                    : closed;
            }
        }
        if (this.lease === undefined) {
            this.publish({ ...this.getSnapshot(), phase: 'opening', error: undefined });
            try {
                const lease = await this.sessions.retain(childSessionId);
                if (this.closeRequested || this.disposed) {
                    lease.release();
                    const closed = await this.closeChild(childSessionId);
                    return closed.ok
                        ? failure(localError('transport_error', 'The Side Chat was closed.', false))
                        : closed;
                }
                this.attachLease(lease, childSessionId);
            }
            catch {
                const error = localError('side_chat_open_failed', 'The child Session could not be opened.');
                this.fail(error, 'open', { firstQuestion: question, draft: question });
                return failure(error);
            }
        }
        const binding = this.lease?.binding;
        if (binding === undefined) {
            const error = localError('side_chat_open_failed', 'The child Session is unavailable.');
            this.fail(error, 'open', { firstQuestion: question, draft: question });
            return failure(error);
        }
        const prompted = await this.invoke(() => binding.prompt(buildSideChatPrompt(original.selection, question), 'queue'));
        if (!prompted.ok) {
            this.fail(prompted.error, 'prompt', { firstQuestion: question, draft: question });
            return failure(prompted.error);
        }
        this.publish({
            ...this.getSnapshot(),
            phase: phaseOf(binding.getSnapshot()),
            draft: '',
            firstQuestion: undefined,
            error: undefined,
        });
        return success(undefined);
    }
    publishCreated(created, question) {
        this.publish({
            ...this.getSnapshot(),
            phase: 'opening',
            parentSessionId: created.parentSessionId,
            childSessionId: created.childSessionId,
            boundarySeq: created.boundarySeq,
            inheritedThroughSeq: created.inheritedThroughSeq,
            ...(created.modelSelection === undefined ? {} : { modelSelection: created.modelSelection }),
            firstQuestion: question,
            error: undefined,
        });
    }
    async closeChild(childSessionId) {
        if (this.closing !== undefined)
            return await this.closing;
        const operation = this.performClose(childSessionId);
        this.closing = operation;
        try {
            return await operation;
        }
        finally {
            if (this.closing === operation)
                this.closing = undefined;
        }
    }
    async performClose(childSessionId) {
        this.publish({ ...this.getSnapshot(), phase: 'closing', error: undefined });
        const closed = await this.invoke(() => this.remote.close({ childSessionId }));
        if (!closed.ok) {
            this.fail(closed.error, 'close');
            return failure(closed.error);
        }
        this.reset();
        return success(undefined);
    }
    bindingTarget() {
        const state = this.getSnapshot();
        const binding = this.lease?.binding;
        if (binding === undefined || state.childSessionId !== binding.sessionId
            || !['ready', 'running', 'needs-input', 'needs-approval'].includes(state.phase)) {
            return failure(localError('invalid_request', 'The Side Chat is not accepting messages.', false));
        }
        return success(binding);
    }
    attachLease(lease, expectedSessionId) {
        if (lease.sessionId !== expectedSessionId || lease.binding.sessionId !== expectedSessionId) {
            lease.release();
            throw new Error('The opened Session does not match the Side Chat child.');
        }
        this.detachLease();
        this.lease = lease;
        this.childUnsubscribe = lease.binding.subscribe(() => { this.updateFromChild(); });
        this.updateFromChild();
    }
    detachLease() {
        this.childUnsubscribe?.();
        this.childUnsubscribe = undefined;
        this.lease?.release();
        this.lease = undefined;
    }
    updateFromChild() {
        const state = this.getSnapshot();
        const snapshot = this.lease?.binding.getSnapshot();
        if (snapshot === undefined || ['closed', 'closing', 'error'].includes(state.phase))
            return;
        if (snapshot.status === 'failed') {
            this.fail(localError('side_chat_prompt_failed', 'The Side Chat turn failed.'), 'prompt');
            return;
        }
        this.publish({ ...state, phase: phaseOf(snapshot), error: undefined });
    }
    fail(error, operation, patch = {}) {
        this.publish({
            ...this.getSnapshot(),
            ...patch,
            phase: 'error',
            error: { ...error, operation },
        });
    }
    async invoke(operation) {
        try {
            return await operation();
        }
        catch {
            return { ok: false, error: localError('transport_error', 'The Side Chat connection was interrupted.') };
        }
    }
    reset() {
        this.detachLease();
        this.closeRequested = false;
        this.publish(INITIAL_STATE);
    }
    publish(state) {
        this.observable.publish(Object.freeze(state));
    }
}
