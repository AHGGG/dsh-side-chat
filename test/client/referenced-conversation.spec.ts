import { describe, expect, it, vi } from 'vitest'
import {
  addReferencedSideChatToConversation, parseReferencedConversationPrompt, referencedSideChatConversation,
  sideChatConversationReferenceSource,
} from '../../src/client/parent-composer/referenced-conversation.js'
import { SideChatId } from '../../src/shared/contracts.js'
import { lexicalComposerReferenceFixture } from './composer-reference-fixture.js'

const reference = () => referencedSideChatConversation({
  conversationId: SideChatId('discussion-1'), title: '  Side Chat · Project\n ',
  messages: [
    { id: 'u', role: 'user', text: 'Why?', status: 'complete' },
    { id: 'a', role: 'assistant', reasoning: 'Reasoning', text: 'Because <script>alert("no")</script>.', status: 'complete' },
    { id: 'pending', role: 'assistant', text: 'Not settled', status: 'streaming' },
  ],
})

describe('referenced Side Chat conversation', () => {
  it('captures only settled plugin messages, omits reasoning, and serializes tag-safe JSON', async () => {
    const captured = reference()
    expect(captured.conversation).toEqual([
      { role: 'user', content: 'Why?' }, { role: 'assistant', content: 'Because <script>alert("no")</script>.' },
    ])
    expect(captured.title).toBe('Side Chat · Project')
    const fixture = lexicalComposerReferenceFixture('Existing draft')
    expect(addReferencedSideChatToConversation(fixture.input, captured)).toBe(true)
    const ref = fixture.snapshot().occurrences[0]?.ref ?? ''
    const serialized = await sideChatConversationReferenceSource.codec.serialize(ref, new AbortController().signal)
    expect(serialized).not.toContain('<script>')
    expect(serialized).toContain('\\u003cscript>')
    expect(parseReferencedConversationPrompt(`${serialized}\n\nUse this.`))
      .toEqual({ reference: captured, message: 'Use this.' })
  })

  it('keeps the selected passage in the saved reference without copying parent history', () => {
    const captured = referencedSideChatConversation({ conversationId: SideChatId('discussion'), title: 'Side Chat', messages: [
      { id: 'u', role: 'user', text: 'Why?', selectedText: 'Selected line', status: 'complete' },
      { id: 'a', role: 'assistant', text: 'Partial answer', status: 'stopped' },
    ] })
    expect(captured.conversation).toEqual([
      { role: 'user', content: 'Selected passage:\nSelected line\n\nQuestion:\nWhy?' },
      { role: 'assistant', content: 'Partial answer' },
    ])
  })

  it('refreshes the existing chip atomically and leaves unrelated text intact', () => {
    const fixture = lexicalComposerReferenceFixture('Existing draft')
    const captured = reference()
    expect(addReferencedSideChatToConversation(fixture.input, captured)).toBe(true)
    const before = fixture.snapshot()
    expect(addReferencedSideChatToConversation(fixture.input, captured)).toBe(true)
    expect(fixture.snapshot()).toBe(before)
    expect(addReferencedSideChatToConversation(fixture.input, { ...captured,
      conversation: [...captured.conversation, { role: 'user', content: 'Follow-up' }],
    })).toBe(true)
    expect(fixture.snapshot().draft).toBe(before.draft)
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(fixture.snapshot().occurrences[0]?.ref).toContain('Follow-up')
  })

  it('does not flatten other chips or mutate the draft when insertion is refused', () => {
    const fixture = lexicalComposerReferenceFixture('Keep this')
    const before = fixture.snapshot()
    const input = { ...fixture.input, insertReference: vi.fn(() => false) }
    expect(addReferencedSideChatToConversation(input, reference())).toBe(false)
    expect(fixture.snapshot()).toBe(before)
  })
})
