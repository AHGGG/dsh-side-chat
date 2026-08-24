import { describe, expect, it } from 'vitest'
import {
  addSelectionToConversation,
  conversationAnnotationRecoveryRecord,
  conversationAnnotations,
  removeConversationAnnotations,
  selectionReferenceSource,
  type ParentComposerInput,
  type ParentComposerOccurrence,
} from '../../src/client/parent-composer/add-to-conversation.js'
import { ConversationAnnotationPersistence } from '../../src/client/parent-composer/annotation-persistence.js'
import type { ConversationSelection } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'
import { composerReferenceFixture } from './composer-reference-fixture.js'

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
  get records(): readonly string[] { return [...this.values.values()] }
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

  it('rehydrates the exact current DSH clipboard projection after refresh', () => {
    const storage = new MemoryStorage()
    const beforeReload = composerReferenceFixture('Question')
    expect(addSelectionToConversation(beforeReload.input, selection, 'Current note')).toBe(true)
    const firstLifetime = new ConversationAnnotationPersistence(storage)
    firstLifetime.reconcile(SessionId('parent-current-refresh'), beforeReload.input)

    const record = JSON.parse(storage.records[0] ?? '{}') as {
      version?: number
      mirrorDraft?: string
      baseDraft?: string
    }
    expect(record).toMatchObject({
      version: 2,
      mirrorDraft: 'Selected text\n\nQuestion',
      baseDraft: 'Question',
    })

    const afterReload = composerReferenceFixture()
    const secondLifetime = new ConversationAnnotationPersistence(storage)
    secondLifetime.reconcile(SessionId('parent-current-refresh'), afterReload.input)
    afterReload.input.setDraft(record.mirrorDraft ?? '')
    secondLifetime.reconcile(SessionId('parent-current-refresh'), afterReload.input)

    expect(afterReload.snapshot().draft).toBe('@__dsh_side_chat_annotations__\n\nQuestion')
    expect(conversationAnnotations(afterReload.snapshot())).toEqual([{
      text: 'Selected text',
      comment: 'Current note',
    }])
    expect(storage.size).toBe(1)
  })

  it('migrates the v0.7.1 projection record after an upgrade', () => {
    const original = composerReferenceFixture('Question')
    expect(addSelectionToConversation(original.input, selection, 'Legacy stored note')).toBe(true)
    const snapshot = original.snapshot()
    const ref = snapshot.occurrences[0]?.ref ?? ''
    const storage = new MemoryStorage()
    storage.setItem('dsh-side-chat:composer-annotations:v0.7.1-upgrade', JSON.stringify({
      version: 1,
      draft: snapshot.draft,
      projection: 'Selected text\n\nQuestion',
      ref,
    }))

    const restored = composerReferenceFixture('Selected text\n\nQuestion')
    new ConversationAnnotationPersistence(storage).reconcile(SessionId('v0.7.1-upgrade'), restored.input)

    expect(restored.snapshot().draft).toBe('@__dsh_side_chat_annotations__\n\nQuestion')
    expect(conversationAnnotations(restored.snapshot())).toEqual([{
      text: 'Selected text',
      comment: 'Legacy stored note',
    }])
    expect(storage.size).toBe(1)
  })

  it('uses every occurrence clipboard projection in the exact recovery mirror', () => {
    const fileOccurrence: ParentComposerOccurrence = {
      occurrenceId: 41,
      source: 'dsh-file-reference',
      ref: 'file-ref',
      offset: 0,
      length: '@file'.length,
      label: 'file',
      clipboardText: '@/full/path',
    }
    const original = composerReferenceFixture('@file Question', 'current', [fileOccurrence])
    expect(addSelectionToConversation(original.input, selection)).toBe(true)

    const record = conversationAnnotationRecoveryRecord(original.snapshot())
    expect(record).toMatchObject({
      mirrorDraft: 'Selected text\n\n@/full/path Question',
      baseDraft: '@/full/path Question',
    })

    const storage = new MemoryStorage()
    new ConversationAnnotationPersistence(storage).reconcile(SessionId('multiple-references'), original.input)
    const restored = composerReferenceFixture(record?.mirrorDraft ?? '')
    new ConversationAnnotationPersistence(storage).reconcile(SessionId('multiple-references'), restored.input)

    expect(restored.snapshot().draft).toBe('@__dsh_side_chat_annotations__\n\n@/full/path Question')
    expect(conversationAnnotations(restored.snapshot())).toEqual([{ text: 'Selected text' }])
  })

  it('does not guess that similar ordinary text is a stored annotation', () => {
    const storage = new MemoryStorage()
    const original = composerReferenceFixture('Question')
    expect(addSelectionToConversation(original.input, selection)).toBe(true)
    new ConversationAnnotationPersistence(storage).reconcile(SessionId('strict-match'), original.input)

    const changed = composerReferenceFixture('Selected text\n\nQuestion edited')
    new ConversationAnnotationPersistence(storage).reconcile(SessionId('strict-match'), changed.input)

    expect(changed.snapshot()).toMatchObject({
      draft: 'Selected text\n\nQuestion edited',
      occurrences: [],
    })
    expect(storage.size).toBe(0)
  })

  it('keeps the exact mirror draft and recovery record when reinsertion is temporarily refused', () => {
    const storage = new MemoryStorage()
    const original = composerReferenceFixture('Question')
    expect(addSelectionToConversation(original.input, selection)).toBe(true)
    new ConversationAnnotationPersistence(storage).reconcile(SessionId('retry-refusal'), original.input)
    const record = JSON.parse(storage.records[0] ?? '{}') as { mirrorDraft?: string }
    const refused = composerReferenceFixture(record.mirrorDraft ?? '')
    const input: ParentComposerInput = {
      state: refused.input.state,
      setDraft: refused.input.setDraft,
      insertReference: () => false,
    }

    const persistence = new ConversationAnnotationPersistence(storage)
    persistence.reconcile(SessionId('retry-refusal'), input)
    expect(refused.snapshot()).toMatchObject({ draft: record.mirrorDraft, occurrences: [] })
    expect(storage.size).toBe(1)
  })

  it('keeps a display draft retryable when reinsertion is temporarily refused', () => {
    const storage = new MemoryStorage()
    const original = composerReferenceFixture('Question')
    expect(addSelectionToConversation(original.input, selection)).toBe(true)
    new ConversationAnnotationPersistence(storage).reconcile(SessionId('display-retry-refusal'), original.input)
    const record = JSON.parse(storage.records[0] ?? '{}') as {
      displayDraft?: string
      mirrorDraft?: string
    }
    const refused = composerReferenceFixture(record.displayDraft ?? '')
    const input: ParentComposerInput = {
      state: refused.input.state,
      setDraft: refused.input.setDraft,
      insertReference: () => false,
    }

    new ConversationAnnotationPersistence(storage).reconcile(SessionId('display-retry-refusal'), input)

    expect(refused.snapshot()).toMatchObject({ draft: record.mirrorDraft, occurrences: [] })
    expect(storage.size).toBe(1)
  })

  it('removes an unmatched orphan prefix instead of allowing U+FFFC to send', () => {
    const orphan = composerFixture('\uFFFC\n\nQuestion')
    const persistence = new ConversationAnnotationPersistence(undefined)

    persistence.reconcile(SessionId('parent-1'), orphan.input)

    expect(orphan.snapshot()).toMatchObject({ draft: 'Question', occurrences: [] })
    expect(orphan.snapshot().draft).not.toContain('\uFFFC')
  })

  it('recognizes the current @label occurrence and cleans an orphaned display prefix', () => {
    const active = composerReferenceFixture('Question')
    expect(addSelectionToConversation(active.input, selection, 'Current note')).toBe(true)
    const storage = new MemoryStorage()
    const persistence = new ConversationAnnotationPersistence(storage)
    persistence.reconcile(SessionId('parent-current'), active.input)
    expect(storage.size).toBe(1)

    const orphan = composerReferenceFixture('@__dsh_side_chat_annotations__\n\nQuestion')
    new ConversationAnnotationPersistence(undefined).reconcile(SessionId('orphan-current'), orphan.input)
    expect(orphan.snapshot()).toMatchObject({ draft: 'Question', occurrences: [] })
  })
})
