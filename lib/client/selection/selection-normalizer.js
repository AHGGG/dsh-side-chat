import { MAX_SELECTION_BYTES } from '../../shared/constants.js';
import { utf8ByteLength } from './selection-limits.js';
export class SelectionValidationError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'SelectionValidationError';
    }
}
export function normalizeSelectedText(value) {
    return value.replace(/\r\n?/gu, '\n').replace(/\n(?:[\t ]*\n){3,}/gu, '\n\n\n').trim();
}
export function finalizeConversationSelection(input) {
    const fragment = input.fragments[0];
    if (fragment === undefined) {
        throw new SelectionValidationError('selection_empty', 'Select some conversation text first.');
    }
    if (input.fragments.length !== 1) {
        throw new SelectionValidationError('selection_crosses_unsupported_nodes', 'Select text inside one completed message.');
    }
    const text = normalizeSelectedText(input.rawText);
    if (text.length === 0) {
        throw new SelectionValidationError('selection_empty', 'The selection contains only whitespace.');
    }
    if (utf8ByteLength(text) > MAX_SELECTION_BYTES) {
        throw new SelectionValidationError('selection_too_large', 'The selected text is too large.');
    }
    if (!fragment.modelVisible || !fragment.settled) {
        throw new SelectionValidationError('fork_unavailable', 'Wait for this message to finish before branching.');
    }
    if (!Number.isSafeInteger(fragment.seq) || fragment.seq < 0) {
        throw new SelectionValidationError('selection_stale', 'The selected message is no longer available.');
    }
    return Object.freeze({
        parentSessionId: input.parentSessionId,
        fragments: Object.freeze([{ ...fragment }]),
        text,
        atSeq: fragment.seq,
        rect: Object.freeze({ ...input.rect }),
    });
}
export function assertSelectionCurrent(selection, currentSessionId) {
    if (currentSessionId !== selection.parentSessionId) {
        throw new SelectionValidationError('selection_stale', 'The parent conversation changed after selection.');
    }
}
