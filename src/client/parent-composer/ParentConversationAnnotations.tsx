import { createElement, type ElementType, type ReactNode, useLayoutEffect, useRef } from 'react'
import type { Rc6ClientContext } from '../rc6/context.js'
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js'
import { SelectionQuote } from '../panel/SelectionQuote.js'
import {
  conversationAnnotations,
  parseAnnotatedConversationPrompt,
  type ConversationAnnotation,
  type ParentComposerInputSnapshot,
} from './add-to-conversation.js'
import {
  parseReferencedConversationPrompt,
  type ReferencedSideChatConversation,
} from './referenced-conversation.js'

type Locale = keyof typeof SIDE_CHAT_MESSAGES
interface UserNodeProps {
  readonly node: {
    readonly data: {
      readonly content: readonly unknown[]
      readonly referenceLabels?: readonly string[]
      readonly [key: string]: unknown
    }
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

const ANNOTATION_CHIP_WIDTH_PROPERTY = '--dsh-side-chat-parent-annotation-width'

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
  const dockRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const dock = dockRef.current
    const seat = dock?.closest<HTMLElement>('[data-composer-seat]')
    const chip = dock?.querySelector<HTMLElement>('.dsh-side-chat-quote-chip')
    if (seat === undefined || chip === undefined || seat === null || chip === null) return

    // The durable host reference stays in Lexical's document flow. Match its
    // occupied width to this visible overlay so the caret starts at the edge
    // users see instead of after the longer internal serialization label.
    const syncWidth = (): void => {
      const width = chip.getBoundingClientRect().width
      if (width > 0) seat.style.setProperty(ANNOTATION_CHIP_WIDTH_PROPERTY, `${String(width)}px`)
    }
    syncWidth()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(syncWidth)
    observer?.observe(chip)
    return () => {
      observer?.disconnect()
      seat.style.removeProperty(ANNOTATION_CHIP_WIDTH_PROPERTY)
    }
  }, [annotations.length, locale])

  if (annotations.length === 0) return null
  return (
    <div ref={dockRef} className="dsh-side-chat-parent-annotation-dock">
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

interface ParsedPluginPrompt {
  readonly annotations?: readonly ConversationAnnotation[]
  readonly reference?: ReferencedSideChatConversation
  readonly message: string
}

function parsePluginPrompt(text: string): ParsedPluginPrompt | undefined {
  let message = text
  let annotations: readonly ConversationAnnotation[] | undefined
  let reference: ReferencedSideChatConversation | undefined
  for (let index = 0; index < 2; index += 1) {
    const annotated = annotations === undefined ? parseAnnotatedConversationPrompt(message) : undefined
    if (annotated !== undefined) {
      annotations = annotated.annotations
      message = annotated.message
      continue
    }
    const referenced = reference === undefined ? parseReferencedConversationPrompt(message) : undefined
    if (referenced !== undefined) {
      reference = referenced.reference
      message = referenced.message
      continue
    }
    break
  }
  if (annotations === undefined && reference === undefined) return
  return {
    ...(annotations === undefined ? {} : { annotations }),
    ...(reference === undefined ? {} : { reference }),
    message,
  }
}

/** Wrap DSH's own user renderer only when this plugin's durable prefix exists. */
export function annotatedUserMessageRenderer(Original: UserNodeRenderer): (props: UserNodeProps) => ReactNode {
  return function AnnotatedUserMessageRenderer(props: UserNodeProps): ReactNode {
    const parsed = parsePluginPrompt(contentText(props.node.data.content))
    if (parsed === undefined) return createElement(Original, props)
    const body = visibleMessage(parsed.message)
    const visible = parsed.reference === undefined
      ? body
      : [`@${parsed.reference.title}`, body].filter(part => part.length > 0).join('\n\n')
    const existingLabels = props.node.data.referenceLabels ?? []
    const node = {
      ...props.node,
      data: {
        ...props.node.data,
        content: replaceTextContent(props.node.data.content, visible),
        ...(parsed.reference === undefined
          ? {}
          : { referenceLabels: [...new Set([parsed.reference.title, ...existingLabels])] }),
      },
    } as UserNodeProps['node']
    const original = createElement(Original, { ...props, node })
    if (parsed.annotations === undefined) return original
    return (
      <div className="dsh-side-chat-parent-user-message">
        <SelectionQuote
          selections={parsed.annotations}
          messages={SIDE_CHAT_MESSAGES[currentLocale()]}
        />
        <div className="dsh-side-chat-parent-user-message-body">
          {original}
        </div>
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
    // This zero-height projection must follow Todo (0), Goal (10), and Queue
    // (20), so its absolute child remains anchored to the input card below.
    order: 30,
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
