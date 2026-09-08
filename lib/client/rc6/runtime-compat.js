const EMPTY_NODES = [];
const EMPTY_TURN_ENDS = new Map();
const EMPTY_RUNNING_CALLS = [];
const EMPTY_PENDING = [];
const EMPTY_NODE_STORE = { get: () => undefined };
function isLegacySnapshot(snapshot) {
    return typeof snapshot === 'object'
        && snapshot !== null
        && Array.isArray(snapshot.nodes)
        && Array.isArray(snapshot.pending);
}
function currentPending(source, sessionId) {
    const pending = source?.get(sessionId);
    if (typeof pending !== 'object' || pending === null)
        return;
    const candidate = pending;
    if (candidate.kind === 'approval'
        && typeof candidate.key === 'string'
        && typeof candidate.toolName === 'string'
        && typeof candidate.answer === 'function') {
        return pending;
    }
    if ((candidate.kind === 'question' || candidate.kind === 'plan-review')
        && typeof candidate.key === 'string'
        && Array.isArray(candidate.questions)
        && typeof candidate.answer === 'function'
        && typeof candidate.cancel === 'function') {
        return pending;
    }
    return undefined;
}
function normalizeLegacyPending(wait) {
    if (wait.kind === 'approval') {
        return {
            kind: 'approval',
            key: wait.key,
            toolName: wait.payload.toolName,
            ...(wait.payload.reason === undefined ? {} : { reason: wait.payload.reason }),
            respond: async (decision) => {
                const receipt = await wait.respond({
                    ok: true,
                    value: {
                        sessionId: wait.sessionId,
                        approvalId: wait.payload.approvalId,
                        outcome: decision === 'approve' ? 'allowed-once' : 'rejected',
                    },
                });
                return receipt.accepted;
            },
        };
    }
    return {
        kind: 'question',
        key: wait.key,
        questions: wait.payload.questions,
        respond: async (answer) => {
            const receipt = await wait.respond(answer === null
                ? {
                    ok: false,
                    error: { code: 'cancelled', message: 'Question cancelled.', details: {} },
                }
                : {
                    ok: true,
                    value: { sessionId: wait.sessionId, answer },
                });
            return receipt.accepted;
        },
    };
}
function normalizeCurrentPending(wait) {
    if (wait.kind === 'approval') {
        return {
            kind: 'approval',
            key: wait.key,
            toolName: wait.toolName,
            ...(wait.reason === undefined ? {} : { reason: wait.reason }),
            respond: async (decision) => {
                await wait.answer(decision === 'approve' ? 'allowed-once' : 'rejected');
                return true;
            },
        };
    }
    return {
        kind: 'question',
        key: wait.key,
        questions: wait.questions,
        respond: async (answer) => {
            if (answer === null)
                await wait.cancel();
            else
                await wait.answer(answer);
            return true;
        },
    };
}
/** Bridge DSH <=0.1.1's combined Session snapshot and 0.1.2's split stores. */
export class CompatibleConversationFace {
    session;
    chat;
    pending;
    sessionId;
    cache;
    constructor(session, chat, pending) {
        this.session = session;
        this.chat = chat;
        this.pending = pending;
        this.sessionId = session.sessionId;
    }
    subscribe = (listener) => {
        const removers = [this.session.subscribe(listener)];
        if (this.chat !== undefined)
            removers.push(this.chat.subscribe(listener));
        if (this.pending !== undefined)
            removers.push(this.pending.subscribe(listener));
        return () => {
            for (const remove of removers)
                remove();
        };
    };
    getSnapshot = () => {
        const session = this.session.getSnapshot();
        if (isLegacySnapshot(session)) {
            if (this.cache?.session === session)
                return this.cache.value;
            const value = {
                nodes: session.nodes,
                turnEnds: session.turnEnds,
                partial: session.partial,
                runningCalls: session.runningCalls,
                pending: session.pending.map(normalizeLegacyPending),
                queue: session.queue,
                running: session.running,
                openState: session.openState,
                promptError: session.promptError,
                lastAgentError: session.lastAgentError,
                chatNodes: session.chat.nodes,
            };
            this.cache = { session, chat: undefined, pending: undefined, value };
            return value;
        }
        const lifecycle = session;
        const chat = this.chat?.getSnapshot();
        const pending = this.pending?.getSnapshot();
        const cached = this.cache;
        if (cached !== undefined
            && cached.session === session
            && cached.chat === chat
            && cached.pending === pending) {
            return cached.value;
        }
        const legacy = chat?.legacy;
        const wait = currentPending(pending, this.sessionId);
        const value = {
            nodes: legacy?.nodes ?? EMPTY_NODES,
            turnEnds: legacy?.turnEnds ?? EMPTY_TURN_ENDS,
            partial: legacy?.partial ?? null,
            runningCalls: legacy?.runningCalls ?? EMPTY_RUNNING_CALLS,
            pending: wait === undefined ? EMPTY_PENDING : [normalizeCurrentPending(wait)],
            queue: lifecycle.queue,
            running: lifecycle.running,
            openState: lifecycle.openState,
            promptError: lifecycle.promptError,
            lastAgentError: lifecycle.lastAgentError,
            chatNodes: chat?.nodes ?? EMPTY_NODE_STORE,
        };
        this.cache = { session, chat, pending, value };
        return value;
    };
    prompt(content, mode) {
        return this.session.prompt(content, mode);
    }
    updateQueue(itemId, action) {
        return this.session.updateQueue(itemId, action);
    }
    cancel() {
        return this.session.cancel();
    }
    rename(title) {
        return this.session.rename(title);
    }
    async open() {
        await this.session.open?.call(this.session);
    }
}
export function compatibleConversationFace(session, sources = {}) {
    return new CompatibleConversationFace(session, sources.chat, sources.pending);
}
