import type { ConversationSelection, SideChatPromptPart } from '../../shared/contracts.js'

function escapeXmlText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/** Add the selected quote to the first child prompt. */
export function buildSideChatPrompt(
  selection: ConversationSelection | undefined,
  question: string,
): readonly SideChatPromptPart[] {
  const trimmed = question.trim()
  if (selection === undefined) return [{ type: 'text', text: trimmed }]
  return [{
    type: 'text',
    text: [
      `<selected_context source="current-conversation" event-seq="${selection.atSeq}">`,
      escapeXmlText(selection.text),
      '</selected_context>',
      '',
      '<user_question>',
      escapeXmlText(trimmed),
      '</user_question>',
    ].join('\n'),
  }]
}
