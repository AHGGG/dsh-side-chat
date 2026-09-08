import { describe, expect, it, vi } from 'vitest'
import {
  addSelectionToConversation,
  conversationAnnotations,
  conversationSelectionAnnotations,
  parseAnnotatedConversationPrompt,
  removeConversationAnnotation,
  removeConversationAnnotations,
  selectionReferenceSource,
  updateConversationAnnotation,
  type ParentComposerInput,
} from '../../src/client/parent-composer/add-to-conversation.js'
import type { ConversationSelection } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'
import {
  composerReferenceFixture,
  lexicalComposerReferenceFixture,
} from './composer-reference-fixture.js'

const selection: ConversationSelection = {
  parentSessionId: SessionId('parent-1'),
  fragments: [],
  text: 'A < selected & passage.',
  atSeq: 7,
  rect: { x: 10, y: 20, width: 30, height: 10, viewportWidth: 800, viewportHeight: 600 },
}

describe('Add to chat composer integration', () => {
  it('inserts a native reference chip above the existing draft', async () => {
    let snapshot: ReturnType<ParentComposerInput['state']['getSnapshot']> = {
      draft: 'Existing draft', draftRev: 4, occurrences: [],
    }
    const insertReference = vi.fn<ParentComposerInput['insertReference']>((reference, span) => {
      if (span.draftRev !== snapshot.draftRev) return false
      snapshot = {
        draft: `\uFFFC ${snapshot.draft}`,
        draftRev: snapshot.draftRev + 1,
        occurrences: [{ occurrenceId: 1, source: reference.source, ref: reference.ref, offset: 0 }],
      }
      return true
    })
    const setDraft = vi.fn((draft: string) => {
      snapshot = {
        draft,
        draftRev: snapshot.draftRev + 1,
        occurrences: draft.includes('\uFFFC')
          ? snapshot.occurrences.map(occurrence => ({ ...occurrence, offset: draft.indexOf('\uFFFC') }))
          : [],
      }
    })
    const input: ParentComposerInput = {
      state: { getSnapshot: () => snapshot },
      insertReference,
      setDraft,
    }

    expect(addSelectionToConversation(input, selection)).toBe(true)
    expect(snapshot.draft).toBe('\uFFFC\n\nExisting draft')
    expect(insertReference).toHaveBeenCalledOnce()
    const reference = insertReference.mock.calls[0]?.[0]
    expect(reference).toMatchObject({
      source: 'dsh-side-chat-selection',
      label: '__dsh_side_chat_annotations__',
      clipboardText: selection.text,
    })
    expect(selectionReferenceSource.codec.clipboardText(reference?.ref ?? '')).toBe(selection.text)
    await expect(selectionReferenceSource.codec.serialize(
      reference?.ref ?? '',
      new AbortController().signal,
    )).resolves.toBe([
      '<selected_context>',
      '<annotation index="1">',
      'A &lt; selected &amp; passage.',
      '</annotation>',
      '</selected_context>',
    ].join('\n'))

    expect(conversationAnnotations(snapshot)).toEqual([{ text: selection.text }])
    expect(conversationSelectionAnnotations(snapshot)).toEqual([{
      annotationIndex: 0,
      text: selection.text,
      selection,
    }])
  })

  it('keeps the current DSH @label occurrence while reserving the annotation dock row', () => {
    const fixture = composerReferenceFixture(' Existing draft')

    expect(addSelectionToConversation(fixture.input, selection, 'Current runtime')).toBe(true)
    expect(fixture.snapshot().draft).toBe('@__dsh_side_chat_annotations__\n\n Existing draft')
    expect(fixture.snapshot().occurrences).toEqual([expect.objectContaining({
      occurrenceId: 1,
      source: 'dsh-side-chat-selection',
      offset: 0,
      length: '@__dsh_side_chat_annotations__'.length,
      label: '__dsh_side_chat_annotations__',
    })])
    expect(conversationAnnotations(fixture.snapshot())).toEqual([{
      text: selection.text,
      comment: 'Current runtime',
    }])

    expect(removeConversationAnnotations(fixture.input)).toBe(true)
    expect(fixture.snapshot()).toMatchObject({ draft: ' Existing draft', occurrences: [] })
  })

  it('aggregates and updates annotations with current DSH occurrence lengths', () => {
    const fixture = composerReferenceFixture('Question')
    const second = { ...selection, text: 'Second passage', atSeq: 9 }

    expect(addSelectionToConversation(fixture.input, selection, 'First note')).toBe(true)
    expect(addSelectionToConversation(fixture.input, second)).toBe(true)
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([
      { text: selection.text, comment: 'First note' },
      { text: second.text },
    ])
    expect(fixture.snapshot().draft).toBe('@__dsh_side_chat_annotations__\n\nQuestion')

    expect(updateConversationAnnotation(fixture.input, 0, 'Updated note')).toBe(true)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([
      { text: selection.text, comment: 'Updated note' },
      { text: second.text },
    ])
    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([{ text: second.text }])
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(fixture.snapshot()).toMatchObject({ draft: 'Question', occurrences: [] })
    expect(removeConversationAnnotations(fixture.input)).toBe(false)
    expect(fixture.snapshot()).toMatchObject({ draft: 'Question', occurrences: [] })
  })

  it('keeps a DSH 0.1.2 Lexical reference through add, update, and removal', () => {
    const fixture = lexicalComposerReferenceFixture(' Existing draft')
    const second = { ...selection, text: 'Second passage', atSeq: 9 }

    expect(addSelectionToConversation(fixture.input, selection, 'Initial note')).toBe(true)
    expect(fixture.snapshot().draft).toBe(`${selection.text}  Existing draft`)
    expect(fixture.snapshot().occurrences).toEqual([expect.objectContaining({
      source: 'dsh-side-chat-selection',
      offset: 0,
      length: selection.text.length,
      clipboardText: selection.text,
    })])
    expect(conversationAnnotations(fixture.snapshot())).toEqual([{
      text: selection.text,
      comment: 'Initial note',
    }])

    expect(addSelectionToConversation(fixture.input, second)).toBe(true)
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([
      { text: selection.text, comment: 'Initial note' },
      { text: second.text },
    ])
    expect(updateConversationAnnotation(fixture.input, 0, 'Revised note')).toBe(true)
    expect(conversationAnnotations(fixture.snapshot())[0]).toEqual({
      text: selection.text,
      comment: 'Revised note',
    })

    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([{ text: second.text }])
    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(fixture.snapshot()).toMatchObject({ draft: ' Existing draft', occurrences: [] })
  })

  it('preserves other DSH 0.1.2 reference nodes when an annotation is removed', () => {
    const fixture = lexicalComposerReferenceFixture('Question')
    expect(fixture.input.insertReference({
      source: 'files',
      ref: 'README.md',
      label: 'README.md',
      appearance: 'file',
      clipboardText: '@README.md',
    }, { start: 0, end: 0, draftRev: 0 })).toBe(true)
    const before = fixture.snapshot()

    expect(addSelectionToConversation(fixture.input, selection)).toBe(true)
    expect(fixture.snapshot().occurrences.map(occurrence => occurrence.source)).toEqual([
      'dsh-side-chat-selection',
      'files',
    ])
    expect(removeConversationAnnotations(fixture.input)).toBe(true)
    expect(fixture.snapshot().draft).toBe(before.draft)
    expect(fixture.snapshot().occurrences).toEqual(before.occurrences)
  })

  it('aggregates multiple passages in one removable legacy annotation occurrence', () => {
    let nextOccurrenceId = 0
    let snapshot: ReturnType<ParentComposerInput['state']['getSnapshot']> = {
      draft: 'Question', draftRev: 0, occurrences: [],
    }
    const input: ParentComposerInput = {
      state: { getSnapshot: () => snapshot },
      insertReference: (reference, span) => {
        if (span.draftRev !== snapshot.draftRev) return false
        nextOccurrenceId += 1
        snapshot = {
          draft: `\uFFFC ${snapshot.draft}`,
          draftRev: snapshot.draftRev + 1,
          occurrences: [{
            occurrenceId: nextOccurrenceId,
            source: reference.source,
            ref: reference.ref,
            offset: 0,
          }],
        }
        return true
      },
      setDraft: (draft) => {
        snapshot = {
          draft,
          draftRev: snapshot.draftRev + 1,
          occurrences: draft.includes('\uFFFC')
            ? snapshot.occurrences.map(occurrence => ({ ...occurrence, offset: draft.indexOf('\uFFFC') }))
            : [],
        }
      },
    }
    const second = { ...selection, text: 'Second passage', atSeq: 9 }

    expect(addSelectionToConversation(input, selection, 'First note')).toBe(true)
    expect(addSelectionToConversation(input, second)).toBe(true)
    expect(snapshot.occurrences).toHaveLength(1)
    expect(conversationAnnotations(snapshot)).toEqual([
      { text: selection.text, comment: 'First note' },
      { text: second.text },
    ])
    expect(snapshot.draft).toBe('\uFFFC\n\nQuestion')

    expect(updateConversationAnnotation(input, 0, 'Updated note')).toBe(true)
    expect(conversationAnnotations(snapshot)).toEqual([
      { text: selection.text, comment: 'Updated note' },
      { text: second.text },
    ])
    expect(conversationSelectionAnnotations(snapshot).map(annotation => annotation.selection.text))
      .toEqual([selection.text, second.text])
    expect(updateConversationAnnotation(input, 8, 'Missing')).toBe(false)

    expect(removeConversationAnnotations(input)).toBe(true)
    expect(snapshot.draft).toBe('Question')
    expect(snapshot.occurrences).toEqual([])
  })

  it('keeps version 1 composer references readable without guessing source anchors', () => {
    const snapshot = {
      draft: '\uFFFC',
      draftRev: 1,
      occurrences: [{
        occurrenceId: 1,
        source: 'dsh-side-chat-selection',
        ref: JSON.stringify({
          version: 1,
          annotations: [{ text: 'Legacy passage', comment: 'Legacy note' }],
        }),
        offset: 0,
      }],
    }

    expect(conversationAnnotations(snapshot)).toEqual([
      { text: 'Legacy passage', comment: 'Legacy note' },
    ])
    expect(conversationSelectionAnnotations(snapshot)).toEqual([])
  })

  it('parses the durable prefix without exposing it in the user message', () => {
    expect(parseAnnotatedConversationPrompt([
      '<selected_context>',
      '<annotation>',
      'A &lt; selected &amp; passage.',
      '</annotation>',
      '<annotation>',
      'Second passage',
      '</annotation>',
      '</selected_context>',
      '',
      'What does this mean?',
    ].join('\n'))).toEqual({
      annotations: [
        { text: 'A < selected & passage.' },
        { text: 'Second passage' },
      ],
      message: 'What does this mean?',
    })
  })

  it('numbers annotations and preserves optional user comments', async () => {
    const fixture = composerReferenceFixture('', 'legacy')

    expect(addSelectionToConversation(fixture.input, selection, 'Why is this important?')).toBe(true)
    expect(addSelectionToConversation(fixture.input, { ...selection, text: 'Second passage' })).toBe(true)
    const serializedRef = fixture.snapshot().occurrences[0]?.ref ?? ''
    const serialized = await selectionReferenceSource.codec.serialize(
      serializedRef,
      new AbortController().signal,
    )
    expect(serialized).toContain('<annotation index="1">')
    expect(serialized).toContain('<user_comment>\nWhy is this important?\n</user_comment>')
    expect(serialized).toContain('<annotation index="2">\nSecond passage\n</annotation>')
    expect(parseAnnotatedConversationPrompt(`${serialized}\n\nExplain both.`)).toEqual({
      annotations: [
        { text: selection.text, comment: 'Why is this important?' },
        { text: 'Second passage' },
      ],
      message: 'Explain both.',
    })
  })

  it('leaves the draft untouched when DSH refuses the first reference insertion', () => {
    const setDraft = vi.fn()
    const input: ParentComposerInput = {
      state: { getSnapshot: () => ({ draft: 'Keep me', draftRev: 2, occurrences: [] }) },
      insertReference: () => false,
      setDraft,
    }

    expect(addSelectionToConversation(input, selection)).toBe(false)
    expect(setDraft).not.toHaveBeenCalled()
  })

  it('removes one annotation while retaining the aggregate until the last item', () => {
    const fixture = composerReferenceFixture('Question')
    const second = { ...selection, text: 'Second passage', atSeq: 9 }
    expect(addSelectionToConversation(fixture.input, selection, 'First note')).toBe(true)
    expect(addSelectionToConversation(fixture.input, second, 'Second note')).toBe(true)

    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([{
      text: 'Second passage',
      comment: 'Second note',
    }])
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(fixture.snapshot().draft).toBe('@__dsh_side_chat_annotations__\n\nQuestion')

    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(fixture.snapshot()).toMatchObject({ draft: 'Question', occurrences: [] })
  })

  it('keeps an existing annotation intact when its replacement insertion is refused', () => {
    const fixture = composerReferenceFixture('Question')
    expect(addSelectionToConversation(fixture.input, selection, 'Original note')).toBe(true)
    const before = fixture.snapshot()
    const input: ParentComposerInput = {
      state: fixture.input.state,
      insertReference: () => false,
      setDraft: fixture.input.setDraft,
    }

    expect(addSelectionToConversation(input, { ...selection, text: 'Second passage' })).toBe(false)
    expect(fixture.snapshot()).toEqual(before)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([{
      text: selection.text,
      comment: 'Original note',
    }])
  })
})
