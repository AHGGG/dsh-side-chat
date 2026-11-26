import { useLayoutEffect, useRef } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { DshClientContext } from '../dsh/context.js'
import { SessionId } from '../../shared/contracts.js'
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js'
import { SelectionQuote } from '../panel/SelectionQuote.js'
import { conversationAnnotations, type ParentComposerInputSnapshot } from './add-to-conversation.js'
import { SentAnnotations, sentAnnotationRule, SIDE_CHAT_PROMPT_NODE } from './sent-annotations.js'

type Locale = keyof typeof SIDE_CHAT_MESSAGES

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

/** Mount the draft capsule and contribute display-only nodes to DSH's native user text. */
export function mountParentConversationAnnotations(
  { slots, uiConversation }: Pick<DshClientContext, 'slots' | 'uiConversation'>,
  removeAnnotations: (sessionId: SessionId) => void,
): () => void {
  const removeDock = slots.inject('conversation.input.dock', () => slots.register({
    name: 'conversation.input.dock',
    id: 'dsh-side-chat-annotations',
    // This zero-height projection must follow Todo (0), Goal (10), and Queue
    // (20), so its absolute child remains anchored to the input card below.
    order: 30,
  }, ({ input, session }: PropsRuntime<'conversation.input.dock'>) => (
    <ParentComposerAnnotations input={input} onRemove={() => removeAnnotations(SessionId(session.sessionId))} />
  )))

  const removeSent = slots.inject('conversation.user.text.node', function* () {
    // Keep the matcher live only while its renderer is registered. Do not
    // shadow the native user/steering rows, which own their own child slots.
    yield slots.register({ name: 'conversation.user.text.node', key: SIDE_CHAT_PROMPT_NODE }, SentAnnotations)
    yield uiConversation.userText.register(sentAnnotationRule)
  })
  return () => {
    removeSent()
    removeDock()
  }
}
