import { createElement, type ElementType, type ReactNode, useLayoutEffect, useRef } from 'react'
import type { DshClientContext } from '../dsh/context.js'
import { SessionId } from '../../shared/contracts.js'
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js'
import { SelectionQuote } from '../panel/SelectionQuote.js'
import {
  annotationMessageText,
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
    if (dock === null || seat === undefined || chip === undefined || seat === null || chip === null) return

    // The durable host reference stays in Lexical's document flow. Match its
    // occupied width to this visible overlay so the caret starts at the edge
    // users see instead of after the longer internal serialization label.
    const syncPosition = (): void => {
      const width = chip.getBoundingClientRect().width
      if (width > 0) seat.style.setProperty(ANNOTATION_CHIP_WIDTH_PROPERTY, `${String(width)}px`)
      const reference = seat.querySelector<HTMLElement>('[data-composer-chip="dsh-side-chat-selection"]')
      if (reference === null) return
      const referenceRect = reference.getBoundingClientRect()
      const dockRect = dock.getBoundingClientRect()
      if (Number.isFinite(referenceRect.left) && Number.isFinite(dockRect.left)) {
        dock.style.setProperty('--annotation-left', `${referenceRect.left - dockRect.left}px`)
        dock.style.setProperty('--annotation-top', `${referenceRect.top - dockRect.top}px`)
      }
    }
    let frame: number | undefined
    const schedule = (): void => {
      if (frame !== undefined) return
      frame = window.requestAnimationFrame(() => { frame = undefined; syncPosition() })
    }
    syncPosition()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule)
    observer?.observe(chip)
    observer?.observe(seat)
    const mutations = new MutationObserver(schedule)
    mutations.observe(seat, { childList: true, characterData: true, subtree: true })
    seat.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      observer?.disconnect()
      mutations.disconnect()
      seat.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      seat.style.removeProperty(ANNOTATION_CHIP_WIDTH_PROPERTY)
    }
  }, [input, locale])

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
  readonly references: readonly ReferencedSideChatConversation[]
  readonly message: string
}

function parsePluginPrompt(text: string): ParsedPluginPrompt | undefined {
  let message = text
  let annotations: readonly ConversationAnnotation[] | undefined
  const references: ReferencedSideChatConversation[] = []
  while (message.length > 0) {
    const annotated = annotations === undefined ? parseAnnotatedConversationPrompt(message) : undefined
    if (annotated !== undefined) {
      annotations = annotated.annotations
      message = annotated.message
      continue
    }
    const referenced = parseReferencedConversationPrompt(message)
    if (referenced !== undefined) {
      references.push(referenced.reference)
      message = referenced.message
      continue
    }
    break
  }
  if (annotations === undefined && references.length === 0) return
  return { ...(annotations === undefined ? {} : { annotations }), references, message }
}

/** Wrap DSH's own user renderer only when this plugin's durable prefix exists. */
export function annotatedUserMessageRenderer(Original: UserNodeRenderer): (props: UserNodeProps) => ReactNode {
  return function AnnotatedUserMessageRenderer(props: UserNodeProps): ReactNode {
    const parsed = parsePluginPrompt(contentText(props.node.data.content))
    if (parsed === undefined) return createElement(Original, props)
    const body = parsed.annotations === undefined ? parsed.message : annotationMessageText(parsed.message)
    const visible = [...parsed.references.map(reference => `@${reference.title}`), body]
      .filter(part => part.length > 0).join('\n\n')
    const existingLabels = props.node.data.referenceLabels ?? []
    const node = {
      ...props.node,
      data: {
        ...props.node.data,
        content: replaceTextContent(props.node.data.content, visible),
        referenceLabels: [...new Set([...parsed.references.map(reference => reference.title), ...existingLabels])],
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
  ctx: DshClientContext,
  removeAnnotations: (sessionId: SessionId) => void,
): () => void {
  const slots = ctx.slots as unknown as DynamicSlots
  const removeDock = slots.inject('conversation.input.dock', () => slots.register({
    name: 'conversation.input.dock',
    id: 'dsh-side-chat-annotations',
    // This zero-height projection must follow Todo (0), Goal (10), and Queue
    // (20), so its absolute child remains anchored to the input card below.
    order: 30,
  }, ({ input, session }: { readonly input: ParentComposerInputSnapshot; readonly session: { readonly sessionId: string } }) => (
    <ParentComposerAnnotations input={input} onRemove={() => removeAnnotations(SessionId(session.sessionId))} />
  )))

  const shadow = (key: 'user' | 'steering'): (() => void) => slots.inject(
    'conversation.chat.node',
    () => {
      let cachedOriginal: UserNodeRenderer | undefined
      let CachedRenderer: ReturnType<typeof annotatedUserMessageRenderer> | undefined
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
        if (original !== cachedOriginal || CachedRenderer === undefined) {
          cachedOriginal = original as UserNodeRenderer
          CachedRenderer = annotatedUserMessageRenderer(cachedOriginal)
        }
        return createElement(CachedRenderer, props)
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
