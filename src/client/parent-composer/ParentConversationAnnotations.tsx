import { createElement, type ElementType, type ReactNode } from 'react'
import type { Rc6ClientContext } from '../rc6/context.js'
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js'
import { SelectionQuote } from '../panel/SelectionQuote.js'
import {
  conversationAnnotations,
  parseAnnotatedConversationPrompt,
  type ParentComposerInputSnapshot,
} from './add-to-conversation.js'

type Locale = keyof typeof SIDE_CHAT_MESSAGES
interface UserNodeProps {
  readonly node: {
    readonly data: { readonly content: readonly unknown[] }
    readonly [key: string]: unknown
  }
  readonly [key: string]: unknown
}
type UserNodeRenderer = ElementType<UserNodeProps>

interface DynamicSlots {
  inject(name: string, mount: () => () => void): () => void
  register(
    options: {
      readonly name: string
      readonly id?: string
      readonly key?: string
      readonly order?: number
      readonly priority?: number
      readonly locale?: string
    },
    component: unknown,
  ): () => void
  entries(name: string): readonly {
    readonly component: unknown
    readonly options: { readonly key?: string; readonly priority?: number }
  }[]
}

function currentLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

/** The interactive annotation capsule occupying the reserved first composer row. */
export function ParentComposerAnnotations({
  input,
  onRemove,
  locale = currentLocale(),
}: {
  readonly input: ParentComposerInputSnapshot
  readonly onRemove: () => void
  readonly locale?: Locale
}) {
  const annotations = conversationAnnotations(input)
  if (annotations.length === 0) return null
  return (
    <div className="dsh-side-chat-parent-annotation-dock">
      <SelectionQuote
        selections={annotations}
        messages={SIDE_CHAT_MESSAGES[locale]}
        onRemove={onRemove}
      />
    </div>
  )
}

function contentText(content: readonly unknown[]): string {
  return content.map((block) => {
    if (typeof block !== 'object' || block === null) return ''
    const value = block as { readonly type?: unknown; readonly text?: unknown }
    return value.type === 'text' && typeof value.text === 'string' ? value.text : ''
  }).join('')
}

function visibleMessage(message: string): string {
  const wrapped = /^<user_question>\n?([\s\S]*?)\n?<\/user_question>$/u.exec(message)
  return wrapped?.[1]?.trim() ?? message
}

function replaceTextContent(content: readonly unknown[], message: string): readonly unknown[] {
  let replaced = false
  const next = content.flatMap((block) => {
    if (typeof block !== 'object' || block === null) return [block]
    const value = block as { readonly type?: unknown; readonly text?: unknown }
    if (value.type !== 'text' || typeof value.text !== 'string') return [block]
    if (replaced) return []
    replaced = true
    return [{ ...value, text: message }]
  })
  return replaced ? next : [{ type: 'text', text: message }, ...next]
}

/** Wrap DSH's own user renderer only when this plugin's durable prefix exists. */
export function annotatedUserMessageRenderer(Original: UserNodeRenderer): (props: UserNodeProps) => ReactNode {
  return function AnnotatedUserMessageRenderer(props: UserNodeProps): ReactNode {
    const parsed = parseAnnotatedConversationPrompt(contentText(props.node.data.content))
    if (parsed === undefined) return createElement(Original, props)
    const node = {
      ...props.node,
      data: {
        ...props.node.data,
        content: replaceTextContent(props.node.data.content, visibleMessage(parsed.message)),
      },
    } as UserNodeProps['node']
    return (
      <div className="dsh-side-chat-parent-user-message">
        <SelectionQuote
          selections={parsed.annotations}
          messages={SIDE_CHAT_MESSAGES[currentLocale()]}
        />
        {createElement(Original, { ...props, node })}
      </div>
    )
  }
}

/** Mount the composer capsule and a thin wrapper around DSH's user renderers. */
export function mountParentConversationAnnotations(
  ctx: Rc6ClientContext,
  removeAnnotations: () => void,
): () => void {
  const slots = ctx.slots as unknown as DynamicSlots
  const removeDock = slots.inject('conversation.input.dock', () => slots.register({
    name: 'conversation.input.dock',
    id: 'dsh-side-chat-annotations',
    order: -100,
  }, ({ input }: { readonly input: ParentComposerInputSnapshot }) => (
    <ParentComposerAnnotations input={input} onRemove={removeAnnotations} />
  )))

  const shadow = (key: 'user' | 'steering'): (() => void) => slots.inject(
    'conversation.chat.node',
    () => {
      const ShadowedUserMessage = (props: UserNodeProps): ReactNode => {
        // Built-in keyed renderers can register after this declaration callback.
        // Resolve the next-priority renderer at render time so load order does
        // not decide whether annotations are projected.
        const original = slots.entries('conversation.chat.node')
          .find(entry => entry.options.key === key
            && entry.component !== ShadowedUserMessage
            && (entry.options.priority ?? 0) >= 0)
          ?.component
        if (original === undefined) return null
        const Renderer = annotatedUserMessageRenderer(original as UserNodeRenderer)
        return createElement(Renderer, props)
      }
      return slots.register({
        name: 'conversation.chat.node',
        key,
        priority: -100,
        locale: 'conversation',
      }, ShadowedUserMessage)
    },
  )
  const removeUser = shadow('user')
  const removeSteering = shadow('steering')
  return () => {
    removeSteering()
    removeUser()
    removeDock()
  }
}
