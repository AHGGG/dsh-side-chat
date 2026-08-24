import { describe, expect, it } from 'vitest'
import {
  addSelectionToConversation,
  conversationAnnotations,
  removeConversationAnnotations,
  SELECTION_REFERENCE_LABEL,
  selectionReferenceSource,
  type ParentComposerInput,
  type ParentComposerOccurrence,
} from '../../src/client/parent-composer/add-to-conversation.js'
import { ConversationAnnotationPersistence } from '../../src/client/parent-composer/annotation-persistence.js'
import type { ConversationSelection } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'

const selection: ConversationSelection = {
  parentSessionId: SessionId('parent-1'),
  fragments: [{
    nodeKey: 'node-1',
    nodeKind: 'assistant-step',
    turnKey: 'turn:1',
    seq: 7,
    startOffset: 0,
    endOffset: 13,
    text: 'Selected text',
    source: 'assistant',
    modelVisible: true,
    settled: true,
  }],
  text: 'Selected text',
  atSeq: 7,
  rect: { x: 20, y: 20, width: 80, height: 20, viewportWidth: 800, viewportHeight: 600 },
}

class MemoryStorage {
  private readonly values = new Map<string, string>()

  get size(): number { return this.values.size }
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
  removeItem(key: string): void { this.values.delete(key) }
}

function composerFixture(
  draft = '',
  initialOccurrences: readonly ParentComposerOccurrence[] = [],
) {
  let snapshot: ReturnType<ParentComposerInput['state']['getSnapshot']> = {
    draft,
    draftRev: 0,
    occurrences: initialOccurrences,
  }
  const input: ParentComposerInput = {
    state: { getSnapshot: () => snapshot },
    insertReference: (reference, span) => {
      if (span.draftRev !== snapshot.draftRev) return false
      snapshot = {
        draft: `\uFFFC${snapshot.draft}`,
        draftRev: snapshot.draftRev + 1,
        occurrences: [{
          occurrenceId: 1,
          source: reference.source,
          ref: reference.ref,
          offset: 0,
        }],
      }
      return true
    },
    setDraft: (nextDraft) => {
      snapshot = {
        draft: nextDraft,
        draftRev: snapshot.draftRev + 1,
        occurrences: nextDraft.includes('\uFFFC') ? snapshot.occurrences : [],
      }
    },
  }
  return { input, snapshot: () => snapshot }
}

function currentComposerFixture(draft = '') {
  let snapshot: ReturnType<ParentComposerInput['state']['getSnapshot']> = {
    draft,
    draftRev: 0,
    occurrences: [],
  }
  const input: ParentComposerInput = {
    state: { getSnapshot: () => snapshot },
    insertReference: (reference, span) => {
      if (span.draftRev !== snapshot.draftRev) return false
      const display = `@${reference.label}`
      const gap = snapshot.draft.length === 0 || snapshot.draft[0] !== ' ' ? ' ' : ''
      snapshot = {
        draft: `${display}${gap}${snapshot.draft}`,
        draftRev: snapshot.draftRev + 1,
        occurrences: [{
          occurrenceId: 1,
          source: reference.source,
          ref: reference.ref,
          offset: 0,
          length: display.length,
          clipboardText: reference.clipboardText,
        }],
      }
      return true
    },
    setDraft: (nextDraft) => {
      const previous = snapshot.draft
      let prefix = 0
      const common = Math.min(previous.length, nextDraft.length)
      while (prefix < common && previous[prefix] === nextDraft[prefix]) prefix += 1
      let suffix = 0
      while (suffix < common - prefix
        && previous[previous.length - 1 - suffix] === nextDraft[nextDraft.length - 1 - suffix]) suffix += 1
      const end = previous.length - suffix
      const insertedLength = nextDraft.length - suffix - prefix
      const delta = insertedLength - (end - prefix)
      const occurrences = snapshot.occurrences.flatMap((occurrence) => {
        const length = occurrence.length ?? 1
        if (occurrence.offset + length <= prefix) return [occurrence]
        if (occurrence.offset >= end) return [{ ...occurrence, offset: occurrence.offset + delta }]
        return []
      })
      snapshot = { draft: nextDraft, draftRev: snapshot.draftRev + 1, occurrences }
    },
  }
  return { input, snapshot: () => snapshot }
}

describe('parent annotation refresh persistence', () => {
  it('rehydrates the exact reference after rc.6 restores only its raw draft', async () => {
    const storage = new MemoryStorage()
    const beforeReload = composerFixture('Question')
    expect(addSelectionToConversation(beforeReload.input, selection, 'Initial note')).toBe(true)
    const rawDraft = beforeReload.snapshot().draft

    const firstLifetime = new ConversationAnnotationPersistence(storage)
    firstLifetime.reconcile(SessionId('parent-1'), beforeReload.input)
    expect(storage.size).toBe(1)

    const afterReload = composerFixture()
    const secondLifetime = new ConversationAnnotationPersistence(storage)
    // ConversationSession seeds the persisted draft after its first empty render.
    secondLifetime.reconcile(SessionId('parent-1'), afterReload.input)
    expect(storage.size).toBe(1)
    afterReload.input.setDraft(rawDraft)
    secondLifetime.reconcile(SessionId('parent-1'), afterReload.input)

    expect(afterReload.snapshot().draft).toBe(rawDraft)
    expect(conversationAnnotations(afterReload.snapshot())).toEqual([
      { text: 'Selected text', comment: 'Initial note' },
    ])
    const occurrence = afterReload.snapshot().occurrences[0]
    expect(occurrence).toBeDefined()
    const serialized = await selectionReferenceSource.codec.serialize(
      occurrence?.ref ?? '',
      new AbortController().signal,
    )
    expect(serialized).toContain('Selected text')
    expect(serialized).not.toContain('\uFFFC')

    expect(removeConversationAnnotations(afterReload.input)).toBe(true)
    secondLifetime.reconcile(SessionId('parent-1'), afterReload.input)
    expect(storage.size).toBe(0)
    expect(afterReload.snapshot().draft).toBe('Question')
  })

  it('rehydrates the clipboard projection persisted by current DSH', () => {
    const storage = new MemoryStorage()
    const beforeReload = currentComposerFixture('Question')
    expect(addSelectionToConversation(beforeReload.input, selection, 'Current note')).toBe(true)
    expect(beforeReload.snapshot().draft).toBe(`@${SELECTION_REFERENCE_LABEL}\n\nQuestion`)

    const firstLifetime = new ConversationAnnotationPersistence(storage)
    firstLifetime.reconcile(SessionId('parent-1'), beforeReload.input)
    expect(storage.size).toBe(1)

    const afterReload = currentComposerFixture()
    const secondLifetime = new ConversationAnnotationPersistence(storage)
    secondLifetime.reconcile(SessionId('parent-1'), afterReload.input)
    afterReload.input.setDraft('Selected text\n\nQuestion')
    secondLifetime.reconcile(SessionId('parent-1'), afterReload.input)

    expect(afterReload.snapshot().draft).toBe(`@${SELECTION_REFERENCE_LABEL}\n\nQuestion`)
    expect(conversationAnnotations(afterReload.snapshot())).toEqual([
      { text: 'Selected text', comment: 'Current note' },
    ])

    expect(removeConversationAnnotations(afterReload.input)).toBe(true)
    secondLifetime.reconcile(SessionId('parent-1'), afterReload.input)
    expect(storage.size).toBe(0)
    expect(afterReload.snapshot()).toMatchObject({ draft: 'Question', occurrences: [] })
  })

  it.each([
    `\uFFFC\n\nQuestion`,
    `@${SELECTION_REFERENCE_LABEL}\n\nQuestion`,
  ])('removes an unmatched orphan prefix instead of allowing it to send', (draft) => {
    const orphan = composerFixture(draft)
    const persistence = new ConversationAnnotationPersistence(undefined)

    persistence.reconcile(SessionId('parent-1'), orphan.input)

    expect(orphan.snapshot()).toMatchObject({ draft: 'Question', occurrences: [] })
    expect(orphan.snapshot().draft).not.toContain('\uFFFC')
    expect(orphan.snapshot().draft).not.toContain(SELECTION_REFERENCE_LABEL)
  })
})
