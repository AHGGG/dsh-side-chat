import { describe, expect, it } from 'vitest'
import { addSelectionToConversation, conversationAnnotations, removeConversationAnnotations } from '../../src/client/parent-composer/add-to-conversation.js'
import { ConversationAnnotationPersistence } from '../../src/client/parent-composer/annotation-persistence.js'
import { addReferencedSideChatToConversation } from '../../src/client/parent-composer/referenced-conversation.js'
import { SessionId, type ConversationSelection } from '../../src/shared/contracts.js'
import { lexicalComposerReferenceFixture } from './composer-reference-fixture.js'

const selection: ConversationSelection = {
  parentSessionId: SessionId('parent-1'), fragments: [], text: 'Selected text', atSeq: 7,
  rect: { x: 20, y: 20, width: 80, height: 20, viewportWidth: 800, viewportHeight: 600 },
}
const parent = SessionId('parent-1')
class MemoryStorage {
  readonly values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
  removeItem(key: string): void { this.values.delete(key) }
}
function populatedDraft() {
  const fixture = lexicalComposerReferenceFixture('Question')
  fixture.input.insertReference({ source: 'files', ref: 'README.md', label: 'README.md',
    clipboardText: '@README.md', appearance: 'file' }, { start: 0, end: 0, draftRev: 0 })
  addSelectionToConversation(fixture.input, selection, 'Note')
  addReferencedSideChatToConversation(fixture.input, {
    version: 1, conversationId: SessionId('child-1'), title: 'Side Chat',
    conversation: [{ role: 'assistant', content: 'Useful conclusion' }],
  })
  return fixture
}

describe('DSH 0.2 reference draft recovery', () => {
  it('restores annotations, conversation snapshots and file chips without changing the draft', () => {
    const original = populatedDraft()
    const storage = new MemoryStorage()
    new ConversationAnnotationPersistence(storage).reconcile(parent, original.input)
    const restored = lexicalComposerReferenceFixture()
    const persistence = new ConversationAnnotationPersistence(storage)
    persistence.reconcile(parent, restored.input)
    expect(storage.values.size).toBe(1)
    restored.input.setDraft(original.snapshot().draft)
    persistence.reconcile(parent, restored.input)
    expect(restored.snapshot().draft).toBe(original.snapshot().draft)
    expect(restored.snapshot().occurrences.map(({ occurrenceId: _id, ...item }) => item))
      .toEqual(original.snapshot().occurrences.map(({ occurrenceId: _id, ...item }) => item))
    expect(conversationAnnotations(restored.snapshot())).toEqual([{ text: 'Selected text', comment: 'Note' }])
  })

  it('does not resurrect a reference deliberately replaced by its own clipboard text', () => {
    const fixture = lexicalComposerReferenceFixture('Question')
    addSelectionToConversation(fixture.input, selection)
    const storage = new MemoryStorage()
    const persistence = new ConversationAnnotationPersistence(storage)
    persistence.reconcile(parent, fixture.input)
    fixture.input.replaceText(selection.text, { start: 0, end: 1, draftRev: fixture.snapshot().draftRev })
    const before = fixture.snapshot()
    persistence.reconcile(parent, fixture.input)
    expect(fixture.snapshot()).toBe(before)
    expect(fixture.snapshot().occurrences).toHaveLength(0)
    expect(storage.values.size).toBe(0)
  })

  it('does not treat a new editor generation as a deliberate send/removal', () => {
    const storage = new MemoryStorage()
    const persistence = new ConversationAnnotationPersistence(storage)
    const first = populatedDraft()
    persistence.reconcile(parent, first.input)
    const next = lexicalComposerReferenceFixture()
    persistence.reconcile(parent, next.input)
    next.input.setDraft(first.snapshot().draft)
    persistence.reconcile(parent, next.input)
    expect(next.snapshot().occurrences).toHaveLength(3)
  })

  it('leaves a changed draft alone and clears records after removing the final plugin chip', () => {
    const storage = new MemoryStorage()
    const original = lexicalComposerReferenceFixture('Question')
    addSelectionToConversation(original.input, selection)
    const persistence = new ConversationAnnotationPersistence(storage)
    persistence.reconcile(parent, original.input)
    const changed = lexicalComposerReferenceFixture(`${original.snapshot().draft} edited`)
    persistence.reconcile(parent, changed.input)
    expect(changed.snapshot().occurrences).toHaveLength(0)
    expect(storage.values.size).toBe(0)
    persistence.reconcile(parent, original.input)
    removeConversationAnnotations(original.input)
    persistence.reconcile(parent, original.input)
    expect(storage.values.size).toBe(0)
  })

  it('rolls back a partial refused restoration and retries the entire record', () => {
    const storage = new MemoryStorage()
    const original = populatedDraft()
    new ConversationAnnotationPersistence(storage).reconcile(parent, original.input)
    const fixture = lexicalComposerReferenceFixture(original.snapshot().draft)
    let calls = 0
    let refuse = true
    const input = { ...fixture.input, insertReference: (...args: Parameters<typeof fixture.input.insertReference>) => {
      calls += 1
      return refuse && calls === 2 ? false : fixture.input.insertReference(...args)
    } }
    const persistence = new ConversationAnnotationPersistence(storage)
    persistence.reconcile(parent, input)
    expect(fixture.snapshot()).toMatchObject({ draft: original.snapshot().draft, occurrences: [] })
    expect(storage.values.size).toBe(1)
    refuse = false
    persistence.reconcile(parent, input)
    expect(fixture.snapshot().occurrences).toHaveLength(3)
  })

  it('ignores corrupt storage and never deletes a draft because storage is denied', () => {
    const input = lexicalComposerReferenceFixture('Keep my text')
    const storage = { getItem: () => { throw new Error('denied') }, setItem: () => {}, removeItem: () => {} }
    new ConversationAnnotationPersistence(storage).reconcile(parent, input.input)
    expect(input.snapshot().draft).toBe('Keep my text')
  })
})
