import { describe, expect, it, vi } from 'vitest'
import {
  addSelectionToConversation, buildSideChatPrompt, conversationAnnotations, conversationSelectionAnnotations,
  decodeSelectionReference, parseAnnotatedConversationPrompt, parseSideChatPrompt, removeConversationAnnotation,
  removeConversationAnnotations, selectionReferenceSource, sideChatQuestionText, updateConversationAnnotation,
} from '../../src/client/parent-composer/add-to-conversation.js'
import { SessionId, type ConversationSelection } from '../../src/shared/contracts.js'
import { lexicalComposerReferenceFixture } from './composer-reference-fixture.js'

export const selection: ConversationSelection = {
  parentSessionId: SessionId('parent-1'), fragments: [], text: 'A < selected & passage.', atSeq: 7,
  rect: { x: 10, y: 20, width: 30, height: 10, viewportWidth: 800, viewportHeight: 600 },
}

describe('DSH 0.2 composer annotations', () => {
  it('inserts, aggregates, edits and removes a single atomic reference', async () => {
    const fixture = lexicalComposerReferenceFixture(' Existing draft')
    const second = { ...selection, text: 'Second passage', atSeq: 9 }
    expect(addSelectionToConversation(fixture.input, selection, 'Initial note')).toBe(true)
    expect(fixture.snapshot().draft).toBe(`${selection.text} Existing draft`)
    expect(addSelectionToConversation(fixture.input, second)).toBe(true)
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(conversationSelectionAnnotations(fixture.snapshot()).map(item => item.selection)).toEqual([selection, second])
    expect(updateConversationAnnotation(fixture.input, 0, 'Updated < & note')).toBe(true)
    expect(updateConversationAnnotation(fixture.input, 9, 'Missing')).toBe(false)
    const ref = fixture.snapshot().occurrences[0]?.ref ?? ''
    const serialized = await selectionReferenceSource.codec.serialize(ref, new AbortController().signal)
    expect(parseAnnotatedConversationPrompt(`${serialized}\n\nExplain.`)).toEqual({
      annotations: [{ text: selection.text, comment: 'Updated < & note' }, { text: second.text }],
      message: 'Explain.',
    })
    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(conversationAnnotations(fixture.snapshot())).toEqual([{ text: second.text }])
    expect(removeConversationAnnotation(fixture.input, 0)).toBe(true)
    expect(fixture.snapshot()).toMatchObject({ draft: ' Existing draft', occurrences: [] })
    expect(removeConversationAnnotations(fixture.input)).toBe(false)
  })

  it('preserves another reference before the annotation in atomic coordinates', () => {
    const fixture = lexicalComposerReferenceFixture('Question')
    addSelectionToConversation(fixture.input, selection)
    fixture.input.insertReference({ source: 'files', ref: 'README.md', label: 'README.md',
      clipboardText: '@README.md' }, { start: 0, end: 0, draftRev: fixture.snapshot().draftRev })
    expect(updateConversationAnnotation(fixture.input, 0, 'Keep file chip')).toBe(true)
    expect(removeConversationAnnotations(fixture.input)).toBe(true)
    expect(fixture.snapshot().occurrences).toHaveLength(1)
    expect(fixture.snapshot().occurrences[0]?.source).toBe('files')
    expect(fixture.snapshot().draft).toBe('@README.md  Question')
  })

  it('leaves existing draft and annotations untouched if insertion is refused', () => {
    const fixture = lexicalComposerReferenceFixture('Keep me')
    addSelectionToConversation(fixture.input, selection)
    const before = fixture.snapshot()
    const input = { ...fixture.input, insertReference: vi.fn(() => false) }
    expect(addSelectionToConversation(input, { ...selection, text: 'Another passage' })).toBe(false)
    expect(fixture.snapshot()).toBe(before)
  })

  it('does not decode unsupported old annotation payloads', () => {
    expect(() => decodeSelectionReference(JSON.stringify({ text: 'old text' }))).toThrow()
    expect(() => decodeSelectionReference(JSON.stringify({ version: 1, annotations: [{ text: 'old' }] }))).toThrow()
  })

  it('uses one prompt format and decodes escaped question text only inside it', () => {
    const prompt = buildSideChatPrompt(selection, ' Why is a < b & c > d? ')[0]
    if (prompt?.type !== 'text') throw new Error('text prompt missing')
    expect(parseAnnotatedConversationPrompt(prompt.text)?.annotations).toEqual([{ text: selection.text }])
    expect(sideChatQuestionText(prompt.text)).toBe('Why is a < b & c > d?')
    expect(sideChatQuestionText('<user_question>literal text</user_question>'))
      .toBe('<user_question>literal text</user_question>')
    expect(buildSideChatPrompt(undefined, ' question ')).toEqual([{ type: 'text', text: 'question' }])
  })

  it.each(['\n', '\r\n'])('decodes a complete prompt with %j line endings and leading whitespace', (newline) => {
    const question = 'Why is <x> &amp; <user_question>this</user_question>?'
    const prompt = buildSideChatPrompt(selection, question)[0]
    if (prompt?.type !== 'text') throw new Error('text prompt missing')
    const serialized = ` \n${prompt.text}`.replaceAll('\n', newline)
    expect(parseSideChatPrompt(serialized)).toEqual({
      annotations: [{ text: selection.text }], message: question,
    })
    expect(sideChatQuestionText(serialized)).toBe(question)
  })

  it('keeps trailing content without exposing the generated question wrapper', () => {
    const prompt = buildSideChatPrompt(selection, 'Explain <this> & that.')[0]
    if (prompt?.type !== 'text') throw new Error('text prompt missing')
    expect(parseSideChatPrompt(`${prompt.text}\n[Image]\nAdditional text &amp; literal.`)).toEqual({
      annotations: [{ text: selection.text }],
      message: 'Explain <this> & that.\n[Image]\nAdditional text &amp; literal.',
    })
    expect(sideChatQuestionText('Show <selected_context>literally</selected_context>.'))
      .toBe('Show <selected_context>literally</selected_context>.')
  })

  it('honors serializer cancellation', async () => {
    const fixture = lexicalComposerReferenceFixture()
    addSelectionToConversation(fixture.input, selection)
    const abort = new AbortController()
    abort.abort(new Error('cancelled'))
    await expect(selectionReferenceSource.codec.serialize(fixture.snapshot().occurrences[0]?.ref ?? '', abort.signal))
      .rejects.toThrow('cancelled')
  })
})
