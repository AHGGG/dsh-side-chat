export const LEGACY_REFERENCE_PLACEHOLDER = '\uFFFC';
export function referenceDisplayText(label) {
    return `@${label}`;
}
/**
 * Resolve one occurrence's occupied draft range across both DSH reference
 * representations: current full `@label` text with `length`, and the legacy
 * one-code-unit U+FFFC placeholder without it.
 */
export function occurrenceRange(snapshot, occurrence, expectedLabel) {
    const start = occurrence.offset;
    if (!Number.isSafeInteger(start) || start < 0 || start > snapshot.draft.length)
        return;
    if (occurrence.length !== undefined
        && Number.isSafeInteger(occurrence.length)
        && occurrence.length > 0
        && start + occurrence.length <= snapshot.draft.length) {
        return { start, end: start + occurrence.length };
    }
    if (snapshot.draft.startsWith(LEGACY_REFERENCE_PLACEHOLDER, start)) {
        return { start, end: start + LEGACY_REFERENCE_PLACEHOLDER.length };
    }
    const display = referenceDisplayText(expectedLabel);
    if (snapshot.draft.startsWith(display, start))
        return { start, end: start + display.length };
    return;
}
export function occurrenceMatchesDraft(snapshot, occurrence, expectedLabel) {
    const range = occurrenceRange(snapshot, occurrence, expectedLabel);
    if (range === undefined)
        return false;
    const text = snapshot.draft.slice(range.start, range.end);
    if (text === LEGACY_REFERENCE_PLACEHOLDER || text === referenceDisplayText(expectedLabel))
        return true;
    return occurrence.label === expectedLabel
        && occurrence.clipboardText !== undefined
        && text === occurrence.clipboardText;
}
/** Convert one published occurrence range to the host input machine's mutation coordinates. */
export function occurrenceEditSpan(input, snapshot, occurrence, options = {}) {
    const range = occurrenceRange(snapshot, occurrence, occurrence.label ?? '');
    if (range === undefined)
        return;
    let start = range.start;
    let end = range.end;
    if (input.referenceMode === 'lexical') {
        if (occurrence.length === undefined)
            return;
        start = occurrence.offset;
        for (const candidate of [...snapshot.occurrences].sort((left, right) => left.offset - right.offset)) {
            if (candidate.occurrenceId === occurrence.occurrenceId)
                break;
            if (candidate.offset > occurrence.offset || candidate.length === undefined)
                return;
            start -= candidate.length - 1;
        }
        end = start + 1;
    }
    if (options.consumeFollowingSeparator === true) {
        const tail = snapshot.draft.slice(range.end);
        if (tail.startsWith('\n\n'))
            end += 2;
        else if (tail.startsWith('\n') || tail.startsWith(' '))
            end += 1;
    }
    return { start, end, draftRev: snapshot.draftRev };
}
/** Find the exact occurrence minted by one synchronous insertReference call. */
export function newlyInsertedOccurrence(before, after, source, ref) {
    const previousIds = new Set(before.occurrences.map(occurrence => occurrence.occurrenceId));
    const inserted = after.occurrences.filter(occurrence => !previousIds.has(occurrence.occurrenceId)
        && occurrence.source === source
        && occurrence.ref === ref);
    return inserted.length === 1 ? inserted[0] : undefined;
}
/** Remove one occurrence's display range and, optionally, its separating ASCII gap. */
export function draftWithoutOccurrence(snapshot, occurrence, expectedLabel, options = {}) {
    const range = occurrenceRange(snapshot, occurrence, expectedLabel);
    if (range === undefined)
        return;
    let { start, end } = range;
    if (options.consumeAdjacentSpace === true) {
        if (snapshot.draft[end] === ' ')
            end += 1;
        else if (start > 0 && snapshot.draft[start - 1] === ' ')
            start -= 1;
    }
    return snapshot.draft.slice(0, start) + snapshot.draft.slice(end);
}
