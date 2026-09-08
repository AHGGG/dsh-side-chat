import type {
  ParentComposerInput,
  ParentComposerInputSnapshot,
} from '../../src/client/parent-composer/composer-reference.js'

export type ComposerReferenceMode = 'legacy' | 'current'

function editRange(previous: string, next: string): {
  readonly start: number
  readonly end: number
  readonly insertedLength: number
} {
  let start = 0
  const common = Math.min(previous.length, next.length)
  while (start < common && previous[start] === next[start]) start += 1
  let suffix = 0
  while (suffix < common - start
    && previous[previous.length - suffix - 1] === next[next.length - suffix - 1]) suffix += 1
  return {
    start,
    end: previous.length - suffix,
    insertedLength: next.length - suffix - start,
  }
}

export function composerReferenceFixture(
  initialDraft = '',
  mode: ComposerReferenceMode = 'current',
  initialOccurrences: ParentComposerInputSnapshot['occurrences'] = [],
) {
  let nextOccurrenceId = initialOccurrences.reduce(
    (maximum, occurrence) => Math.max(maximum, occurrence.occurrenceId),
    0,
  )
  let snapshot: ParentComposerInputSnapshot = {
    draft: initialDraft,
    draftRev: 0,
    occurrences: [...initialOccurrences],
  }
  const listeners = new Set<() => void>()
  const publish = (): void => { for (const listener of listeners) listener() }

  const reconcile = (range: { readonly start: number; readonly end: number; readonly insertedLength: number }): void => {
    const delta = range.insertedLength - (range.end - range.start)
    snapshot = {
      ...snapshot,
      occurrences: snapshot.occurrences.flatMap((occurrence) => {
        const length = occurrence.length ?? 1
        if (occurrence.offset + length <= range.start) return [occurrence]
        if (occurrence.offset >= range.end) {
          return [delta === 0 ? occurrence : { ...occurrence, offset: occurrence.offset + delta }]
        }
        return []
      }),
    }
  }

  const input: ParentComposerInput = {
    state: {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    },
    insertReference: (reference, span) => {
      if (span.draftRev !== snapshot.draftRev) return false
      const tail = snapshot.draft.slice(span.end)
      const display = mode === 'current' ? `@${reference.label}` : '\uFFFC'
      const gap = mode === 'current' && (tail.length === 0 || tail[0] !== ' ') ? ' ' : ''
      const inserted = display + gap
      reconcile({ start: span.start, end: span.end, insertedLength: inserted.length })
      nextOccurrenceId += 1
      const occurrence = {
        occurrenceId: nextOccurrenceId,
        source: reference.source,
        ref: reference.ref,
        offset: span.start,
        ...(mode === 'current' ? { length: display.length, label: reference.label } : {}),
      }
      snapshot = {
        draft: snapshot.draft.slice(0, span.start) + inserted + tail,
        draftRev: snapshot.draftRev + 1,
        occurrences: [...snapshot.occurrences, occurrence].sort((left, right) => left.offset - right.offset),
      }
      publish()
      return true
    },
    setDraft: (draft) => {
      if (draft === snapshot.draft) return
      reconcile(editRange(snapshot.draft, draft))
      snapshot = { ...snapshot, draft, draftRev: snapshot.draftRev + 1 }
      publish()
    },
  }

  return { input, snapshot: () => snapshot }
}

interface LexicalTextUnit {
  readonly kind: 'text'
  readonly value: string
}

interface LexicalReferenceUnit {
  readonly kind: 'reference'
  readonly occurrenceId: number
  readonly source: string
  readonly ref: string
  readonly label: string
  readonly clipboardText: string
  readonly appearance?: 'session' | 'file' | 'folder'
}

type LexicalUnit = LexicalTextUnit | LexicalReferenceUnit

function lexicalTextUnits(text: string): LexicalTextUnit[] {
  return text.split('').map(value => ({ kind: 'text', value }))
}

/** DSH 0.1.2 fixture: references are atomic editor nodes with clipboard-projected snapshots. */
export function lexicalComposerReferenceFixture(initialDraft = '') {
  let nextOccurrenceId = 0
  let revision = 0
  let units: LexicalUnit[] = lexicalTextUnits(initialDraft)
  let snapshot: ParentComposerInputSnapshot
  const listeners = new Set<() => void>()

  const project = (): ParentComposerInputSnapshot => {
    let draft = ''
    const occurrences: ParentComposerInputSnapshot['occurrences'][number][] = []
    for (const unit of units) {
      if (unit.kind === 'text') {
        draft += unit.value
        continue
      }
      const offset = draft.length
      draft += unit.clipboardText
      occurrences.push({
        occurrenceId: unit.occurrenceId,
        source: unit.source,
        ref: unit.ref,
        offset,
        length: unit.clipboardText.length,
        label: unit.label,
        clipboardText: unit.clipboardText,
        ...(unit.appearance === undefined ? {} : { appearance: unit.appearance }),
      })
    }
    return { draft, draftRev: revision, occurrences }
  }
  snapshot = project()
  const publish = (): void => {
    revision += 1
    snapshot = project()
    for (const listener of listeners) listener()
  }
  const validSpan = (span: { readonly start: number; readonly end: number; readonly draftRev: number }): boolean =>
    span.draftRev === revision
      && Number.isSafeInteger(span.start)
      && Number.isSafeInteger(span.end)
      && span.start >= 0
      && span.start <= span.end
      && span.end <= units.length

  const input: ParentComposerInput = {
    referenceMode: 'lexical',
    state: {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    },
    setDraft: (draft) => {
      if (draft === snapshot.draft) return
      units = lexicalTextUnits(draft)
      publish()
    },
    replaceText: (text, span) => {
      if (!validSpan(span)) return false
      units.splice(span.start, span.end - span.start, ...lexicalTextUnits(text))
      publish()
      return true
    },
    insertReference: (reference, span) => {
      if (!validSpan(span)) return false
      const tail = units[span.end]
      nextOccurrenceId += 1
      const inserted: LexicalUnit[] = [{
        kind: 'reference',
        occurrenceId: nextOccurrenceId,
        source: reference.source,
        ref: reference.ref,
        label: reference.label,
        clipboardText: reference.clipboardText,
        ...(reference.appearance === undefined ? {} : { appearance: reference.appearance }),
      }]
      if (tail?.kind !== 'text' || tail.value !== ' ') inserted.push({ kind: 'text', value: ' ' })
      units.splice(span.start, span.end - span.start, ...inserted)
      publish()
      return true
    },
  }

  return { input, snapshot: () => snapshot }
}
