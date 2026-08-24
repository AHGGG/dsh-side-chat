import type { ConversationNode } from '@deepseek-ai/dsh-client-runtime/client'
import { describe, expect, it, vi } from 'vitest'
import type { ParentComposerInput } from '../../src/client/parent-composer/add-to-conversation.js'
import {
  addReferencedSideChatToConversation,
  parseReferencedConversationPrompt,
  referencedSideChatConversation,
  sideChatConversationReferenceSource,
  SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE,
} from '../../src/client/parent-composer/referenced-conversation.js'
import { SessionId } from '../../src/shared/contracts.js'

function conversationNodes(): readonly ConversationNode[] {
  return [{
    kind: 'user',
    seq: 7,
    content: [{ type: 'text', text: 'Inherited parent prompt' }],
  }, {
    kind: 'user',
    seq: 8,
    content: [{
      type: 'text',
      text: '<selected_context>Chosen line</selected_context>\n<user_question>Why?</user_question>',
    }],
  }, {
    kind: 'assistant',
    seq: 9,
    blocks: [{ kind: 'reasoning', text: 'Private reasoning' }, {
      kind: 'text',
      text: 'Because <script>alert("no")</script>.',
    }],
  }, {
    kind: 'tool-result',
    seq: 10,
    content: [{ type: 'text', text: 'Tool output' }],
  }] as unknown as readonly ConversationNode[]
}

function composerFixture(initialDraft = 'Existing draft') {
  let nextOccurrenceId = 0
  let snapshot: ReturnType<ParentComposerInput['state']['getSnapshot']> = {
    draft: initialDraft,
    draftRev: 0,
    occurrences: [],
  }
  const insertReference = vi.fn<ParentComposerInput['insertReference']>((reference, span) => {
    if (span.draftRev !== snapshot.draftRev) return false
    const display = `@${reference.label}`
    const gap = snapshot.draft.startsWith(' ') ? '' : ' '
    const insertedLength = display.length + gap.length
    nextOccurrenceId += 1
    snapshot = {
      draft: `${display}${gap}${snapshot.draft}`,
      draftRev: snapshot.draftRev + 1,
      occurrences: [{
        occurrenceId: nextOccurrenceId,
        source: reference.source,
        ref: reference.ref,
        offset: 0,
        length: display.length,
      }, ...snapshot.occurrences.map(occurrence => ({
        ...occurrence,
        offset: occurrence.offset + insertedLength,
      }))],
    }
    return true
  })
  const setDraft = vi.fn((draft: string) => {
    const previous = snapshot.draft
    let prefix = 0
    while (prefix < previous.length && prefix < draft.length && previous[prefix] === draft[prefix]) {
      prefix += 1
    }
    let suffix = 0
    while (suffix < previous.length - prefix
      && suffix < draft.length - prefix
      && previous[previous.length - suffix - 1] === draft[draft.length - suffix - 1]) {
      suffix += 1
    }
    const end = previous.length - suffix
    const insertedLength = draft.length - prefix - suffix
    const delta = insertedLength - (end - prefix)
    snapshot = {
      draft,
      draftRev: snapshot.draftRev + 1,
      occurrences: snapshot.occurrences.flatMap((occurrence) => {
        const length = occurrence.length ?? 1
        if (occurrence.offset + length <= prefix) return [occurrence]
        if (occurrence.offset >= end) return [{ ...occurrence, offset: occurrence.offset + delta }]
        return []
      }),
    }
  })
  const input: ParentComposerInput = {
    state: { getSnapshot: () => snapshot },
    insertReference,
    setDraft,
  }
  return { input, insertReference, setDraft, snapshot: () => snapshot }
}

function reference() {
  return referencedSideChatConversation({
    conversationId: SessionId('child-1'),
    title: '  Side Chat · Project\n ',
    nodes: conversationNodes(),
    inheritedThroughSeq: 7,
  })
}

describe('referenced Side Chat conversation', () => {
  it('captures only the modal user/assistant history and serializes it safely', async () => {
    const captured = reference()
    expect(captured).toEqual({
      version: 1,
      conversationId: 'child-1',
      title: 'Side Chat · Project',
      conversation: [{
        role: 'user',
        content: '<selected_context>Chosen line</selected_context>\n<user_question>Why?</user_question>',
      }, {
        role: 'assistant',
        content: 'Because <script>alert("no")</script>.',
      }],
    })

    const fixture = composerFixture()
    expect(addReferencedSideChatToConversation(fixture.input, captured)).toBe(true)
    const inserted = fixture.insertReference.mock.calls[0]?.[0]
    expect(inserted).toMatchObject({
      source: SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE,
      label: 'Side Chat · Project',
      appearance: 'session',
      clipboardText: '@Side Chat · Project',
    })

    const serialized = await sideChatConversationReferenceSource.codec.serialize(
      inserted?.ref ?? '',
      new AbortController().signal,
    )
    expect(serialized).toContain('<referenced_conversation>')
    expect(serialized).not.toContain('<script>')
    expect(serialized).toContain('\\u003cscript>')
    expect(parseReferencedConversationPrompt(`${serialized}\n\nUse this conclusion in the main chat.`))
      .toEqual({
        reference: captured,
        message: 'Use this conclusion in the main chat.',
      })
  })

  it('keeps one native conversation label and refreshes its snapshot in place', () => {
    const fixture = composerFixture()
    const first = reference()
    expect(addReferencedSideChatToConversation(fixture.input, first)).toBe(true)
    expect(fixture.snapshot().draft).toBe('@Side Chat · Project Existing draft')
    expect(fixture.snapshot().occurrences).toHaveLength(1)

    expect(addReferencedSideChatToConversation(fixture.input, first)).toBe(true)
    expect(fixture.insertReference).toHaveBeenCalledOnce()

    const refreshed = {
      ...first,
      conversation: [...first.conversation, { role: 'user' as const, content: 'One follow-up' }],
    }
    expect(addReferencedSideChatToConversation(fixture.input, refreshed)).toBe(true)
    expect(fixture.insertReference).toHaveBeenCalledTimes(2)
    expect(fixture.setDraft).toHaveBeenCalledOnce()
    expect(fixture.snapshot().draft).toBe('@Side Chat · Project Existing draft')
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(fixture.snapshot().occurrences[0]?.ref).toContain('One follow-up')
  })

  it('does not mutate the parent draft when insertion is refused', () => {
    const setDraft = vi.fn()
    const input: ParentComposerInput = {
      state: { getSnapshot: () => ({ draft: 'Keep this', draftRev: 3, occurrences: [] }) },
      insertReference: () => false,
      setDraft,
    }

    expect(addReferencedSideChatToConversation(input, reference())).toBe(false)
    expect(setDraft).not.toHaveBeenCalled()
  })
})
