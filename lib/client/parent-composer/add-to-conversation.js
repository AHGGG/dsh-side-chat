import { newlyInsertedOccurrence, occurrenceEditSpan, occurrenceMatchesDraft } from './composer-reference.js';
export const SELECTION_REFERENCE_SOURCE = 'dsh-side-chat-selection';
export const SELECTION_REFERENCE_LABEL = '__dsh_side_chat_annotations__';
function escapeXmlText(value) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
export function unescapeXmlText(value) {
    return value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}
function isSelection(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const selection = value;
    if (typeof selection.parentSessionId !== 'string' || typeof selection.text !== 'string'
        || !Number.isSafeInteger(selection.atSeq) || !Array.isArray(selection.fragments)
        || typeof selection.rect !== 'object' || selection.rect === null)
        return false;
    const rect = selection.rect;
    if (![rect.x, rect.y, rect.width, rect.height, rect.viewportWidth, rect.viewportHeight]
        .every(number => typeof number === 'number' && Number.isFinite(number)))
        return false;
    return selection.fragments.every((candidate) => {
        if (typeof candidate !== 'object' || candidate === null)
            return false;
        const fragment = candidate;
        return typeof fragment.nodeKey === 'string' && typeof fragment.nodeKind === 'string'
            && typeof fragment.turnKey === 'string' && Number.isSafeInteger(fragment.seq)
            && Number.isSafeInteger(fragment.startOffset) && Number.isSafeInteger(fragment.endOffset)
            && typeof fragment.text === 'string'
            && ['user', 'assistant', 'context', 'code'].includes(fragment.source ?? '')
            && typeof fragment.modelVisible === 'boolean' && typeof fragment.settled === 'boolean';
    });
}
function decodeStoredSelectionReference(ref) {
    const payload = JSON.parse(ref);
    if (payload === null || payload.version !== 2 || !Array.isArray(payload.annotations)
        || payload.annotations.length === 0 || !payload.annotations.every((value) => {
        if (typeof value !== 'object' || value === null)
            return false;
        const annotation = value;
        return typeof annotation.text === 'string' && isSelection(annotation.selection)
            && (annotation.comment === undefined || typeof annotation.comment === 'string');
    }))
        throw new Error('The selected conversation annotation is no longer valid.');
    return payload.annotations;
}
function visibleAnnotation(annotation) {
    return { text: annotation.text, ...(annotation.comment === undefined ? {} : { comment: annotation.comment }) };
}
export function decodeSelectionReference(ref) {
    return decodeStoredSelectionReference(ref).map(visibleAnnotation);
}
function selectionOccurrences(snapshot) {
    return snapshot.occurrences.filter(occurrence => occurrence.source === SELECTION_REFERENCE_SOURCE);
}
function storedAnnotations(snapshot) {
    return selectionOccurrences(snapshot).flatMap(occurrence => {
        try {
            return [...decodeStoredSelectionReference(occurrence.ref)];
        }
        catch {
            return [];
        }
    });
}
export function conversationAnnotations(snapshot) {
    return storedAnnotations(snapshot).map(visibleAnnotation);
}
export function conversationSelectionAnnotations(snapshot) {
    return storedAnnotations(snapshot).map((annotation, annotationIndex) => ({ ...annotation, annotationIndex }));
}
/** A single atomic chip replacement preserves other references and the user's draft. */
function writeAnnotations(input, before, annotations) {
    const existing = selectionOccurrences(before);
    if (existing.length > 1)
        return false;
    const previous = existing[0];
    const span = previous === undefined ? { start: 0, end: 0, draftRev: before.draftRev }
        : occurrenceEditSpan(input, before, previous);
    if (span === undefined)
        return false;
    const ref = JSON.stringify({ version: 2, annotations });
    const inserted = input.insertReference({
        source: SELECTION_REFERENCE_SOURCE, ref, label: SELECTION_REFERENCE_LABEL,
        clipboardText: annotations.map(annotation => annotation.text).join('\n\n'),
    }, span);
    if (!inserted)
        return false;
    const after = input.state.getSnapshot();
    const occurrence = newlyInsertedOccurrence(before, after, SELECTION_REFERENCE_SOURCE, ref);
    return occurrence !== undefined && selectionOccurrences(after).length === 1
        && occurrenceMatchesDraft(after, occurrence, SELECTION_REFERENCE_LABEL);
}
export function addSelectionToConversation(input, selection, comment) {
    const before = input.state.getSnapshot();
    const trimmed = comment?.trim();
    return writeAnnotations(input, before, [...storedAnnotations(before), {
            text: selection.text, selection, ...(trimmed ? { comment: trimmed } : {}),
        }]);
}
export function removeConversationAnnotations(input) {
    const occurrences = selectionOccurrences(input.state.getSnapshot());
    if (occurrences.length === 0)
        return false;
    for (const occurrenceId of occurrences.map(occurrence => occurrence.occurrenceId).reverse()) {
        const snapshot = input.state.getSnapshot();
        const occurrence = snapshot.occurrences.find(candidate => candidate.occurrenceId === occurrenceId);
        if (occurrence === undefined)
            continue;
        // Delete only the chip, never a possibly user-owned leading space/newline.
        const span = occurrenceEditSpan(input, snapshot, occurrence);
        if (span === undefined || !input.replaceText('', span))
            return false;
    }
    return selectionOccurrences(input.state.getSnapshot()).length === 0;
}
export function removeConversationAnnotation(input, annotationIndex) {
    const before = input.state.getSnapshot();
    const annotations = [...storedAnnotations(before)];
    if (!Number.isSafeInteger(annotationIndex) || annotations[annotationIndex] === undefined)
        return false;
    annotations.splice(annotationIndex, 1);
    return annotations.length === 0 ? removeConversationAnnotations(input) : writeAnnotations(input, before, annotations);
}
export function updateConversationAnnotation(input, annotationIndex, comment) {
    const before = input.state.getSnapshot();
    const annotations = [...storedAnnotations(before)];
    const annotation = annotations[annotationIndex];
    if (!Number.isSafeInteger(annotationIndex) || annotation === undefined)
        return false;
    const trimmed = comment?.trim();
    annotations[annotationIndex] = { text: annotation.text, selection: annotation.selection,
        ...(trimmed ? { comment: trimmed } : {}) };
    return writeAnnotations(input, before, annotations);
}
function selectedContext(annotations) {
    return ['<selected_context>', ...annotations.flatMap((annotation, index) => [
            `<annotation index="${String(index + 1)}">`,
            '<selected_text>', escapeXmlText(annotation.text), '</selected_text>',
            ...(annotation.comment === undefined ? [] : ['<user_comment>', escapeXmlText(annotation.comment), '</user_comment>']),
            '</annotation>',
        ]), '</selected_context>'].join('\n');
}
export const selectionReferenceSource = {
    trigger: '@', name: SELECTION_REFERENCE_SOURCE, order: 1_000,
    candidates: async () => [], onPick: () => undefined,
    codec: {
        clipboardText: ref => decodeSelectionReference(ref).map(annotation => annotation.text).join('\n\n'),
        serialize: async (ref, signal) => {
            if (signal.aborted)
                throw signal.reason;
            return selectedContext(decodeSelectionReference(ref));
        },
    },
};
export function parseAnnotatedConversationPrompt(text) {
    // Stored messages outlive a plugin update. Reading their durable text does
    // not require an old DSH runtime or an old composer implementation.
    const prefix = /^\s*<selected_context(?: source="current-conversation" event-seq="\d+")?>\r?\n([\s\S]*?)\r?\n<\/selected_context>\s*/u.exec(text);
    if (prefix === null)
        return;
    const annotations = [];
    if (prefix[0].trimStart().startsWith('<selected_context source=')) {
        annotations.push({ text: unescapeXmlText(prefix[1] ?? '') });
    }
    else {
        for (const match of prefix[1]?.matchAll(/<annotation(?: index="\d+")?>\r?\n([\s\S]*?)\r?\n<\/annotation>/gu) ?? []) {
            const body = match[1] ?? '';
            const parts = /^<selected_text>\r?\n([\s\S]*?)\r?\n<\/selected_text>(?:\r?\n<user_comment>\r?\n([\s\S]*?)\r?\n<\/user_comment>)?$/u.exec(body);
            annotations.push({ text: unescapeXmlText(parts?.[1] ?? body),
                ...(parts?.[2] === undefined ? {} : { comment: unescapeXmlText(parts[2]) }) });
        }
    }
    return annotations.length === 0 ? undefined : { annotations, message: text.slice(prefix[0].length).trim() };
}
/** The first prompt uses the same durable annotation format as the main composer. */
export function buildSideChatPrompt(selection, question) {
    const trimmed = question.trim();
    return [{ type: 'text', text: selection === undefined ? trimmed : [
                selectedContext([{ text: selection.text }]), '',
                '<user_question>', escapeXmlText(trimmed), '</user_question>',
            ].join('\n') }];
}
/** Decode a question only after recognizing this plugin's annotation prefix. */
export function annotationMessageText(message) {
    const question = /^<user_question>(?:\r?\n)?([\s\S]*?)(?:\r?\n)?<\/user_question>(?=$|\s)/u.exec(message);
    if (question === null)
        return message;
    const text = unescapeXmlText((question[1] ?? '').trim());
    // Attachments or additional text blocks must not make the question wrapper
    // reappear, nor be discarded while projecting the model-facing payload.
    const suffix = message.slice(question[0].length).trim();
    return [text, suffix].filter(part => part.length > 0).join('\n');
}
/** One projection supplies both the annotation capsule and the visible question. */
export function parseSideChatPrompt(text) {
    const annotated = parseAnnotatedConversationPrompt(text);
    return annotated === undefined ? undefined : {
        annotations: annotated.annotations,
        message: annotationMessageText(annotated.message),
    };
}
export function sideChatQuestionText(text) {
    return parseSideChatPrompt(text)?.message ?? text;
}
