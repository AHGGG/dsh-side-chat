import type { UserTextNodeProps, UserTextRule } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ReferenceChip } from '@deepseek-ai/dsh-client-ui-primitives'
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js'
import { SelectionQuote } from '../panel/SelectionQuote.js'
import { readAnnotatedConversationPrefix, readAnnotationQuestionPrefix, type ConversationAnnotation } from './add-to-conversation.js'
import { readReferencedConversationPrefix } from './referenced-conversation.js'

export const SIDE_CHAT_PROMPT_NODE = 'dsh-side-chat-prompt'

interface SentPromptPresentation {
  readonly annotations: readonly ConversationAnnotation[]
  readonly references: readonly string[]
  readonly question: string
  readonly annotationOnly: boolean
}

declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
  interface UserTextDataMap {
    'dsh-side-chat-prompt': SentPromptPresentation
  }
}

/** Consume only the plugin's leading metadata; native DSH rules still see the original message body. */
export const sentAnnotationRule: UserTextRule<typeof SIDE_CHAT_PROMPT_NODE> = {
  id: SIDE_CHAT_PROMPT_NODE,
  order: -100,
  match(text, from) {
    if (from !== 0) return
    let end = 0
    let annotations: readonly ConversationAnnotation[] = []
    const references: string[] = []
    while (end < text.length) {
      const rest = text.slice(end)
      const selected = annotations.length === 0 ? readAnnotatedConversationPrefix(rest) : undefined
      if (selected !== undefined) {
        annotations = selected.annotations
        end += selected.end
        continue
      }
      const referenced = readReferencedConversationPrefix(rest)
      if (referenced === undefined) break
      references.push(referenced.reference.title)
      end += referenced.end
    }
    if (end === 0) return

    // Older stored prompts can include a generated question wrapper as well.
    const wrapped = annotations.length === 0 ? undefined : readAnnotationQuestionPrefix(text.slice(end))
    let question = ''
    if (wrapped !== undefined) {
      const suffix = text.slice(end + wrapped.end).trimStart()
      end = text.length - suffix.length
      question = wrapped.text + (wrapped.text && suffix ? '\n' : '')
    }
    return {
      id: SIDE_CHAT_PROMPT_NODE,
      start: 0,
      end,
      data: { annotations, references, question, annotationOnly: end === text.length && !question && references.length === 0 },
    }
  },
}

export function SentAnnotations({ node, interactive }: Pick<UserTextNodeProps<typeof SIDE_CHAT_PROMPT_NODE>, 'node' | 'interactive'>) {
  const { annotations, references, question, annotationOnly } = node.data
  const locale = navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
  const messages = SIDE_CHAT_MESSAGES[locale]
  return <>
    {annotations.length > 0 && <span className="dsh-side-chat-sent-annotation" data-annotation-only={annotationOnly || undefined}>
      {interactive ? <SelectionQuote inline selections={annotations} messages={messages} />
        : <span className="dsh-side-chat-sent-annotation-summary">{messages.selectionAttachments(annotations.length)}</span>}
    </span>}
    {references.map((title, index) => <span key={`${String(index)}:${title}`}>
      <ReferenceChip appearance="session" label={title} title={`@${title}`} />{' '}
    </span>)}
    {question}
  </>
}
