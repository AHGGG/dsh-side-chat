import { newlyInsertedOccurrence, occurrenceEditSpan, } from './composer-reference.js';
export const SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE = 'dsh-side-chat-conversation';
const OPEN_TAG = '<referenced_conversation>';
const CLOSE_TAG = '</referenced_conversation>';
function normalizedTitle(title) {
    const normalized = title.trim().replace(/\s+/gu, ' ');
    return normalized.length === 0 ? 'Side Chat' : normalized;
}
/** Capture only the plugin transcript, not the parent context or model reasoning. */
export function referencedSideChatConversation(input) {
    const conversation = input.messages.flatMap((message) => {
        if (message.status === 'streaming' || message.text.trim().length === 0)
            return [];
        const content = message.selectedText === undefined ? message.text
            : `Selected passage:\n${message.selectedText}\n\nQuestion:\n${message.text}`;
        return [{ role: message.role, content }];
    });
    return { version: 1, conversationId: input.conversationId, title: normalizedTitle(input.title), conversation };
}
function isReferencedConversationMessage(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const message = value;
    return (message.role === 'user' || message.role === 'assistant')
        && typeof message.content === 'string'
        && message.content.length > 0;
}
function decodeReferencedConversation(ref) {
    const value = JSON.parse(ref);
    if (typeof value !== 'object' || value === null) {
        throw new Error('The referenced Side Chat conversation is no longer valid.');
    }
    const reference = value;
    if (reference.version !== 1
        || typeof reference.conversationId !== 'string'
        || reference.conversationId.length === 0
        || typeof reference.title !== 'string'
        || reference.title.length === 0
        || !Array.isArray(reference.conversation)
        || reference.conversation.length === 0
        || !reference.conversation.every(isReferencedConversationMessage)) {
        throw new Error('The referenced Side Chat conversation is no longer valid.');
    }
    return {
        version: 1,
        conversationId: reference.conversationId,
        title: reference.title,
        conversation: reference.conversation,
    };
}
function encodeReferencedConversation(reference) {
    return JSON.stringify(reference);
}
function stringifyTagSafeJson(value) {
    return JSON.stringify(value).replaceAll('<', '\\u003c');
}
/** Durable model-facing form of the referenced conversation label. */
export function serializeReferencedConversation(reference) {
    return [
        OPEN_TAG,
        stringifyTagSafeJson({
            conversationId: reference.conversationId,
            title: reference.title,
            conversation: reference.conversation,
        }),
        CLOSE_TAG,
    ].join('\n');
}
/** Parse a sent reference prefix so the main thread can keep showing one label. */
export function parseReferencedConversationPrompt(text) {
    const prefix = `${OPEN_TAG}\n`;
    if (!text.startsWith(prefix))
        return;
    const closeToken = `\n${CLOSE_TAG}`;
    const closeIndex = text.indexOf(closeToken, prefix.length);
    if (closeIndex < 0)
        return;
    const json = text.slice(prefix.length, closeIndex);
    if (json.length === 0)
        return;
    try {
        const parsed = JSON.parse(json);
        const reference = decodeReferencedConversation(JSON.stringify({
            version: 1,
            conversationId: parsed.conversationId,
            title: parsed.title,
            conversation: parsed.conversation,
        }));
        return {
            reference,
            message: text.slice(closeIndex + closeToken.length).trim(),
        };
    }
    catch {
        return;
    }
}
function matchingOccurrences(snapshot, reference) {
    return snapshot.occurrences.filter((occurrence) => {
        if (occurrence.source !== SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE)
            return false;
        try {
            return decodeReferencedConversation(occurrence.ref).conversationId === reference.conversationId;
        }
        catch {
            return false;
        }
    });
}
function removeOccurrence(input, occurrenceId) {
    const snapshot = input.state.getSnapshot();
    const occurrence = snapshot.occurrences.find(candidate => candidate.occurrenceId === occurrenceId);
    if (occurrence === undefined)
        return;
    const span = occurrenceEditSpan(input, snapshot, occurrence);
    if (span !== undefined)
        input.replaceText('', span);
}
/** Insert or refresh one Side Chat label without duplicating an older snapshot. */
export function addReferencedSideChatToConversation(input, reference) {
    if (reference.conversation.length === 0)
        return false;
    const before = input.state.getSnapshot();
    const existing = matchingOccurrences(before, reference);
    const encoded = encodeReferencedConversation(reference);
    if (existing.some(occurrence => occurrence.ref === encoded))
        return true;
    const target = existing[0];
    const span = target === undefined
        ? { start: 0, end: 0, draftRev: before.draftRev }
        : occurrenceEditSpan(input, before, target);
    if (span === undefined)
        return false;
    const inserted = input.insertReference({
        source: SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE,
        ref: encoded,
        label: reference.title,
        appearance: 'session',
        clipboardText: `@${reference.title}`,
    }, span);
    if (!inserted)
        return false;
    const after = input.state.getSnapshot();
    const occurrence = newlyInsertedOccurrence(before, after, SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE, encoded);
    if (occurrence === undefined)
        return false;
    for (const duplicate of existing.slice(1))
        removeOccurrence(input, duplicate.occurrenceId);
    return matchingOccurrences(input.state.getSnapshot(), reference).length === 1;
}
/** Reference codec used by the native composer chip and submit pipeline. */
export const sideChatConversationReferenceSource = {
    trigger: '@',
    name: SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE,
    order: 1_001,
    candidates: async () => [],
    onPick: () => undefined,
    codec: {
        clipboardText: ref => `@${decodeReferencedConversation(ref).title}`,
        serialize: async (ref, signal) => {
            if (signal.aborted)
                throw signal.reason;
            return serializeReferencedConversation(decodeReferencedConversation(ref));
        },
    },
};
