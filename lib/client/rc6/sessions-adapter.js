import { SessionId as sideChatSessionId } from '../../shared/contracts.js';
import { addSelectionToConversation as addSelectionToParentComposer, conversationAnnotations, removeConversationAnnotation as removeParentConversationAnnotation, removeConversationAnnotations as removeParentConversationAnnotations, updateConversationAnnotation as updateParentConversationAnnotation, } from '../parent-composer/add-to-conversation.js';
import { ConversationAnnotationPersistence } from '../parent-composer/annotation-persistence.js';
import { addReferencedSideChatToConversation as addReferencedSideChatToParentComposer, } from '../parent-composer/referenced-conversation.js';
import { SideChatModelPreferences } from '../model-preference.js';
import { compatibleConversationFace, } from './runtime-compat.js';
const BINDING_WAIT_MS = 8_000;
function sideChatError(error, fallback) {
    const badRequest = error.code === 'bad-request' || error.code === 'gateway/bad-request';
    const missing = error.code === 'session-not-found' || error.code === 'session/not-found';
    return {
        code: missing ? 'side_chat_not_found' : fallback,
        message: error.message,
        recoverable: !badRequest,
    };
}
function operationError(code, message) {
    return { code, message, recoverable: true };
}
function dshSessionId(id) {
    return id;
}
function latestCompleted(snapshot) {
    let latest;
    for (const seq of snapshot.turnEnds.values()) {
        if (latest === undefined || seq > latest)
            latest = seq;
    }
    return latest;
}
function locationSettled(location) {
    if (location.kind === 'turn')
        return location.turn.status === 'closed';
    if (location.kind === 'step')
        return location.turn.status === 'closed' && location.step.status === 'closed';
    return false;
}
function childSnapshot(face) {
    const snapshot = face.getSnapshot();
    const pending = snapshot.pending[0];
    const status = pending?.kind === 'approval'
        ? 'needs-approval'
        : pending?.kind === 'question'
            ? 'needs-input'
            : snapshot.openState === 'error' || snapshot.lastAgentError !== null
                ? 'failed'
                : snapshot.running
                    ? 'running'
                    : 'idle';
    return { status };
}
class Rc6SessionBinding {
    face;
    sessionId;
    constructor(face) {
        this.face = face;
        this.sessionId = sideChatSessionId(face.sessionId);
    }
    getSnapshot = () => childSnapshot(this.face);
    subscribe = (listener) => this.face.subscribe(listener);
    async prompt(content, mode) {
        const result = await this.face.prompt(content.map(part => ({ ...part })), mode);
        return result.ok
            ? { ok: true }
            : { ok: false, error: sideChatError(result.error, 'side_chat_prompt_failed') };
    }
    async updateQueue(itemId, action) {
        if (action.kind === 'edit' && action.content.some(part => part.type !== 'text')) {
            return {
                ok: false,
                error: operationError('invalid_request', 'Queued image messages cannot be edited in the Side Chat panel.'),
            };
        }
        const normalized = action.kind === 'edit'
            ? { kind: 'edit', content: action.content.map(part => ({ type: 'text', text: part.type === 'text' ? part.text : '' })) }
            : action;
        const result = await this.face.updateQueue(itemId, normalized);
        return result.ok
            ? { ok: true }
            : { ok: false, error: sideChatError(result.error, 'side_chat_prompt_failed') };
    }
    async cancel() {
        const result = await this.face.cancel();
        return result.ok
            ? { ok: true }
            : { ok: false, error: sideChatError(result.error, 'side_chat_interrupt_failed') };
    }
    async respondApproval(interactionId, decision) {
        const wait = this.face.getSnapshot().pending.find((item) => item.key === interactionId && item.kind === 'approval');
        if (wait === undefined) {
            return { ok: false, error: operationError('invalid_request', 'The approval is no longer pending.') };
        }
        try {
            return await wait.respond(decision)
                ? { ok: true }
                : { ok: false, error: operationError('transport_error', 'The approval response arrived too late.') };
        }
        catch {
            return { ok: false, error: operationError('transport_error', 'The approval response failed.') };
        }
    }
    async respondQuestion(interactionId, answer) {
        const wait = this.face.getSnapshot().pending.find((item) => item.key === interactionId && item.kind === 'question');
        if (wait === undefined) {
            return { ok: false, error: operationError('invalid_request', 'The question is no longer pending.') };
        }
        try {
            const normalized = answer === null
                ? null
                : {
                    answers: answer.answers.map(item => ({
                        id: item.id,
                        selected: [...item.selected],
                        ...(item.custom === undefined ? {} : { custom: item.custom }),
                    })),
                };
            return await wait.respond(normalized)
                ? { ok: true }
                : { ok: false, error: operationError('transport_error', 'The question response arrived too late.') };
        }
        catch {
            return { ok: false, error: operationError('transport_error', 'The question response failed.') };
        }
    }
}
/** Adapter over rc.6's public SessionRuntime and exported concrete Session type. */
export class Rc6SideChatSessions {
    ctx;
    renamed = new Set();
    faces = new Map();
    annotationPersistence = new ConversationAnnotationPersistence();
    modelPreferences = new SideChatModelPreferences();
    constructor(ctx) {
        this.ctx = ctx;
    }
    /** Observable rc.6 Session-list surface used to follow main-session switches. */
    subscribeList = (listener) => this.ctx.sessions.list.subscribe(listener);
    /** Follow both current-session switches and that session's composer state. */
    subscribeConversationInput = (listener) => {
        let input;
        let removeInputListener = () => { };
        const bindInput = () => {
            const next = this.currentParentInput();
            if (next === input)
                return;
            removeInputListener();
            input = next;
            removeInputListener = input?.state.subscribe?.(listener) ?? (() => { });
        };
        bindInput();
        const removeListListener = this.ctx.sessions.list.subscribe(() => {
            bindInput();
            listener();
        });
        return () => {
            removeListListener();
            removeInputListener();
        };
    };
    currentConversationInputSnapshot = () => this.currentParentInput()?.state.getSnapshot();
    currentSessionId() {
        const current = this.ctx.sessions.list.getSnapshot().current;
        return current === undefined ? undefined : sideChatSessionId(current);
    }
    lastCompletedSeq(parentSessionId) {
        const snapshot = this.face(parentSessionId)?.getSnapshot();
        return snapshot === undefined ? undefined : latestCompleted(snapshot);
    }
    selectionIsCurrent(selection) {
        if (this.currentSessionId() !== selection.parentSessionId)
            return false;
        const snapshot = this.face(selection.parentSessionId)?.getSnapshot();
        if (snapshot === undefined)
            return false;
        return selection.fragments.every((fragment) => {
            const node = snapshot.chatNodes.get(fragment.nodeKey);
            return node !== undefined
                && node.visibility === 'visible'
                && node.kind === fragment.nodeKind
                && node.anchorSeq === fragment.seq
                && locationSettled(node.location);
        });
    }
    /** Add one selected passage to the native composer of its parent Session. */
    addSelectionToConversation(selection, comment) {
        if (this.currentSessionId() !== selection.parentSessionId)
            return false;
        const input = this.currentParentInput();
        if (input === undefined || !addSelectionToParentComposer(input, selection, comment))
            return false;
        this.annotationPersistence.reconcile(selection.parentSessionId, input);
        return true;
    }
    /** Add one immutable Side Chat transcript to its parent Session's composer. */
    addSideChatToConversation(parentSessionId, reference) {
        const scope = this.ctx.sessions.scope(dshSessionId(parentSessionId));
        const input = scope === undefined ? undefined : this.ctx.conversation.input.for(scope);
        if (input === undefined || !addReferencedSideChatToParentComposer(input, reference))
            return false;
        this.annotationPersistence.reconcile(parentSessionId, input);
        return true;
    }
    /** Remove one existing unsent annotation from the aggregated occurrence. */
    removeConversationAnnotation(annotationIndex) {
        const sessionId = this.currentSessionId();
        const input = this.currentParentInput();
        if (sessionId === undefined
            || input === undefined
            || !removeParentConversationAnnotation(input, annotationIndex))
            return false;
        this.annotationPersistence.reconcile(sessionId, input);
        return true;
    }
    /** Update an existing unsent annotation without adding a duplicate passage. */
    updateConversationAnnotation(annotationIndex, comment) {
        const sessionId = this.currentSessionId();
        const input = this.currentParentInput();
        if (sessionId === undefined
            || input === undefined
            || !updateParentConversationAnnotation(input, annotationIndex, comment))
            return false;
        this.annotationPersistence.reconcile(sessionId, input);
        return true;
    }
    /** Mirror or recover the current Session's unsent annotation occurrence. */
    reconcileConversationAnnotationPersistence() {
        const sessionId = this.currentSessionId();
        const input = this.currentParentInput();
        if (sessionId !== undefined && input !== undefined) {
            this.annotationPersistence.reconcile(sessionId, input);
        }
    }
    /** Number assigned to the next annotation shown beside the selected passage. */
    nextConversationAnnotationNumber() {
        const snapshot = this.currentConversationInputSnapshot();
        return snapshot === undefined ? 1 : conversationAnnotations(snapshot).length + 1;
    }
    /** Remove the current Session's unsent selected-passage annotations. */
    removeConversationAnnotations() {
        const sessionId = this.currentSessionId();
        const input = this.currentParentInput();
        if (sessionId === undefined
            || input === undefined
            || !removeParentConversationAnnotations(input))
            return false;
        this.annotationPersistence.reconcile(sessionId, input);
        return true;
    }
    async retain(sessionId) {
        const binding = await this.waitForBinding(dshSessionId(sessionId));
        const face = this.adaptedFace(binding.session);
        await face.open();
        if (!this.renamed.has(sessionId)) {
            this.renamed.add(sessionId);
            const parentTitle = this.ctx.sessions.list.getSnapshot().byId[dshSessionId(sessionId)]?.displayTitle;
            const title = parentTitle === undefined ? 'Side Chat' : `Side Chat · ${parentTitle}`;
            await face.rename(title.slice(0, 160)).catch(() => undefined);
        }
        const adapted = new Rc6SessionBinding(face);
        return { sessionId, binding: adapted, release: () => { } };
    }
    async openSession(sessionId) {
        this.ctx.sessions.open(dshSessionId(sessionId));
    }
    notify(message) {
        const method = message.kind === 'warning' ? 'warn' : 'info';
        console[method](`[dsh-side-chat] ${message.text}`);
    }
    face(sessionId) {
        const source = this.ctx.sessions.binding(dshSessionId(sessionId))?.session;
        return source === undefined ? undefined : this.adaptedFace(source);
    }
    title(sessionId) {
        return this.ctx.sessions.list.getSnapshot().byId[dshSessionId(sessionId)]?.displayTitle;
    }
    cwd(sessionId) {
        return this.ctx.sessions.list.getSnapshot().byId[dshSessionId(sessionId)]?.cwd;
    }
    modelDirectory(sessionId) {
        try {
            return this.ctx.modelDirectories.directoryFor(dshSessionId(sessionId));
        }
        catch {
            return undefined;
        }
    }
    sideChatModelPreference() {
        return this.modelPreferences.get();
    }
    rememberSideChatModelPreference(selection) {
        this.modelPreferences.set(selection);
    }
    adaptedFace(source) {
        const existing = this.faces.get(source.sessionId);
        if (existing?.source === source)
            return existing.compatible;
        const chat = this.ctx.uiConversation?.binding(source.sessionId).target('chat');
        const pending = this.ctx.uiSession?.pendingInteractions;
        const compatible = compatibleConversationFace(source, {
            ...(chat === undefined ? {} : { chat }),
            ...(pending === undefined ? {} : { pending }),
        });
        this.faces.set(source.sessionId, { source, compatible });
        return compatible;
    }
    currentParentInput() {
        const sessionId = this.currentSessionId();
        if (sessionId === undefined)
            return;
        const scope = this.ctx.sessions.scope(dshSessionId(sessionId));
        return scope === undefined ? undefined : this.ctx.conversation.input.for(scope);
    }
    waitForBinding(sessionId) {
        const immediate = this.ctx.sessions.binding(sessionId);
        if (immediate !== undefined)
            return Promise.resolve(immediate);
        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = () => {
                if (settled)
                    return;
                const binding = this.ctx.sessions.binding(sessionId);
                if (binding === undefined)
                    return;
                settled = true;
                clearTimeout(timer);
                unsubscribe();
                resolve(binding);
            };
            const unsubscribe = this.ctx.sessions.list.subscribe(finish);
            const timer = setTimeout(() => {
                if (settled)
                    return;
                settled = true;
                unsubscribe();
                reject(new Error(`Side Chat child ${sessionId} did not appear in the rc.6 Session list.`));
            }, BINDING_WAIT_MS);
            finish();
        });
    }
}
export function selectionDescriptor(snapshot, anchorKey) {
    const node = snapshot.chatNodes.get(anchorKey);
    if (node === undefined || node.visibility !== 'visible')
        return undefined;
    const source = node.kind === 'user' || node.kind === 'steering'
        ? 'user'
        : node.kind === 'assistant-step'
            ? 'assistant'
            : node.kind === 'context'
                ? 'context'
                : undefined;
    const turn = node.location.kind === 'turn' || node.location.kind === 'step'
        ? node.location.turn.turn
        : undefined;
    if (source === undefined || turn === undefined)
        return undefined;
    return {
        nodeKey: node.key,
        nodeKind: node.kind,
        turnKey: `turn:${String(turn)}`,
        seq: node.anchorSeq,
        source,
        modelVisible: true,
        settled: locationSettled(node.location),
    };
}
