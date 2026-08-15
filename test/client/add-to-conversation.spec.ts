import { describe, expect, it, vi } from 'vitest'
import {
  addSelectionToConversation,
  conversationAnnotations,
  conversationSelectionAnnotations,
  parseAnnotatedConversationPrompt,
  removeConversationAnnotations,
  selectionReferenceSource,
  updateConversationAnnotation,
  type ParentComposerInput,
} from '../../src/client/parent-composer/add-to-conversation.js'
import type { ConversationSelection } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'

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

  it('aggregates multiple passages in one removable annotation occurrence', () => {
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
    let snapshot: ReturnType<ParentComposerInput['state']['getSnapshot']> = {
      draft: '', draftRev: 0, occurrences: [],
    }
    let serializedRef = ''
    const input: ParentComposerInput = {
      state: { getSnapshot: () => snapshot },
      insertReference: (reference) => {
        serializedRef = reference.ref
        snapshot = {
          draft: '\uFFFC',
          draftRev: snapshot.draftRev + 1,
          occurrences: [{ occurrenceId: 1, source: reference.source, ref: reference.ref, offset: 0 }],
        }
        return true
      },
      setDraft: (draft) => {
        snapshot = {
          ...snapshot,
          draft,
          draftRev: snapshot.draftRev + 1,
          occurrences: draft.includes('\uFFFC') ? snapshot.occurrences : [],
        }
      },
    }

    expect(addSelectionToConversation(input, selection, 'Why is this important?')).toBe(true)
    expect(addSelectionToConversation(input, { ...selection, text: 'Second passage' })).toBe(true)
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

  it('leaves the draft untouched when DSH refuses the reference insertion', () => {
    const setDraft = vi.fn()
    const input: ParentComposerInput = {
      state: { getSnapshot: () => ({ draft: 'Keep me', draftRev: 2, occurrences: [] }) },
      insertReference: () => false,
      setDraft,
    }

    expect(addSelectionToConversation(input, selection)).toBe(false)
    expect(setDraft).not.toHaveBeenCalled()
  })
})
