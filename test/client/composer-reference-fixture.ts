import type {
  ParentComposerInput, ParentComposerInputSnapshot,
} from '../../src/client/parent-composer/composer-reference.js'

type TextUnit = { readonly kind: 'text'; readonly value: string }
type ReferenceUnit = { readonly kind: 'reference'; readonly occurrenceId: number }
  & Parameters<ParentComposerInput['insertReference']>[0]
type Unit = TextUnit | ReferenceUnit
const textUnits = (text: string): TextUnit[] => text.split('').map(value => ({ kind: 'text', value }))

/** DSH 0.2: atomic mutation coordinates, clipboard-projected observable state. */
export function lexicalComposerReferenceFixture(initialDraft = '') {
  let nextOccurrenceId = 0
  let revision = 0
  let units: Unit[] = textUnits(initialDraft)
  let snapshot: ParentComposerInputSnapshot
  const listeners = new Set<() => void>()
  const project = (): ParentComposerInputSnapshot => {
    let draft = ''
    const occurrences: ParentComposerInputSnapshot['occurrences'][number][] = []
    for (const unit of units) {
      if (unit.kind === 'text') { draft += unit.value; continue }
      const offset = draft.length
      draft += unit.clipboardText
      occurrences.push({
        occurrenceId: unit.occurrenceId, source: unit.source, ref: unit.ref, offset,
        length: unit.clipboardText.length, label: unit.label, clipboardText: unit.clipboardText,
        ...(unit.appearance === undefined ? {} : { appearance: unit.appearance }),
      })
    }
    return { draft, draftRev: revision, occurrences, phase: 'plain' }
  }
  snapshot = project()
  const publish = (): void => {
    revision += 1
    snapshot = project()
    for (const listener of listeners) listener()
  }
  const validSpan = (span: Parameters<ParentComposerInput['replaceText']>[1]): boolean =>
    span.draftRev === revision && Number.isSafeInteger(span.start) && Number.isSafeInteger(span.end)
    && span.start >= 0 && span.start <= span.end && span.end <= units.length
  const input: ParentComposerInput = {
    state: {
      getSnapshot: () => snapshot,
      subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
    },
    setDraft: draft => {
      if (draft === snapshot.draft) return
      units = textUnits(draft)
      publish()
    },
    replaceText: (text, span) => {
      if (!validSpan(span)) return false
      units.splice(span.start, span.end - span.start, ...textUnits(text))
      publish()
      return true
    },
    insertReference: (reference, span) => {
      if (!validSpan(span)) return false
      const tail = units[span.end]
      const inserted: Unit[] = [{ kind: 'reference', occurrenceId: ++nextOccurrenceId, ...reference }]
      if (tail?.kind !== 'text' || tail.value !== ' ') inserted.push({ kind: 'text', value: ' ' })
      units.splice(span.start, span.end - span.start, ...inserted)
      publish()
      return true
    },
  }
  return { input, snapshot: () => snapshot }
}
