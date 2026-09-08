import type {
  AssistantBlock,
  ConversationNode,
} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SessionId } from '../../shared/contracts.js'
import { draftWithoutOccurrence } from './composer-reference.js'
import type {
  ParentComposerInput,
  ParentComposerInputSnapshot,
  ParentComposerOccurrence,
  SelectionReferenceSource,
} from './composer-reference.js'

export const SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE = 'dsh-side-chat-conversation'

const OPEN_TAG = '<referenced_conversation>'
const CLOSE_TAG = '</referenced_conversation>'

export interface ReferencedConversationMessage {
  readonly role: 'user' | 'assistant'
  readonly content: string
}

/** One immutable snapshot carried by the parent composer's conversation label. */
export interface ReferencedSideChatConversation {
  readonly version: 1
  readonly conversationId: SessionId
  readonly title: string
  readonly conversation: readonly ReferencedConversationMessage[]
}

export interface ParsedReferencedConversationPrompt {
  readonly reference: ReferencedSideChatConversation
  readonly message: string
}

function normalizedTitle(title: string): string {
  const normalized = title.trim().replace(/\s+/gu, ' ')
  return normalized.length === 0 ? 'Side Chat' : normalized
}

function visibleContentText(content: readonly unknown[]): string {
  return content.map((block) => {
    if (typeof block !== 'object' || block === null) return ''
    const value = block as { readonly type?: unknown; readonly text?: unknown }
    if (value.type === 'text' && typeof value.text === 'string') return value.text
    if (value.type === 'image') return '[Image attachment]'
    return ''
  }).filter(Boolean).join('\n').trim()
}

function assistantText(node: Extract<ConversationNode, { kind: 'assistant' }>): string {
  return node.blocks
    .flatMap((block: AssistantBlock) => block.kind === 'text' ? [block.text] : [])
    .join('\n')
    .trim()
}

/** Project exactly the user/assistant history visible in the Side Chat modal. */
export function referencedSideChatConversation(input: {
  readonly conversationId: SessionId
  readonly title: string
  readonly nodes: readonly ConversationNode[]
  readonly inheritedThroughSeq: number
}): ReferencedSideChatConversation {
  const conversation: ReferencedConversationMessage[] = []
  for (const node of input.nodes) {
    if (node.seq <= input.inheritedThroughSeq) continue
    if (node.kind === 'user' || node.kind === 'steering') {
      const content = visibleContentText(node.content)
      if (content.length > 0) conversation.push({ role: 'user', content })
      continue
    }
    if (node.kind === 'assistant') {
      const content = assistantText(node)
      if (content.length > 0) conversation.push({ role: 'assistant', content })
    }
  }
  return {
    version: 1,
    conversationId: input.conversationId,
    title: normalizedTitle(input.title),
    conversation,
  }
}

function isReferencedConversationMessage(value: unknown): value is ReferencedConversationMessage {
  if (typeof value !== 'object' || value === null) return false
  const message = value as Partial<ReferencedConversationMessage>
  return (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && message.content.length > 0
}

function decodeReferencedConversation(ref: string): ReferencedSideChatConversation {
  const value = JSON.parse(ref) as unknown
  if (typeof value !== 'object' || value === null) {
    throw new Error('The referenced Side Chat conversation is no longer valid.')
  }
  const reference = value as Partial<ReferencedSideChatConversation>
  if (reference.version !== 1
    || typeof reference.conversationId !== 'string'
    || reference.conversationId.length === 0
    || typeof reference.title !== 'string'
    || reference.title.length === 0
    || !Array.isArray(reference.conversation)
    || reference.conversation.length === 0
    || !reference.conversation.every(isReferencedConversationMessage)) {
    throw new Error('The referenced Side Chat conversation is no longer valid.')
  }
  return {
    version: 1,
    conversationId: reference.conversationId as SessionId,
    title: reference.title,
    conversation: reference.conversation,
  }
}

function encodeReferencedConversation(reference: ReferencedSideChatConversation): string {
  return JSON.stringify(reference)
}

function stringifyTagSafeJson(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

/** Durable model-facing form of the referenced conversation label. */
export function serializeReferencedConversation(reference: ReferencedSideChatConversation): string {
  return [
    OPEN_TAG,
    stringifyTagSafeJson({
      conversationId: reference.conversationId,
      title: reference.title,
      conversation: reference.conversation,
    }),
    CLOSE_TAG,
  ].join('\n')
}

/** Parse a sent reference prefix so the main thread can keep showing one label. */
export function parseReferencedConversationPrompt(
  text: string,
): ParsedReferencedConversationPrompt | undefined {
  const prefix = `${OPEN_TAG}\n`
  if (!text.startsWith(prefix)) return
  const closeToken = `\n${CLOSE_TAG}`
  const closeIndex = text.indexOf(closeToken, prefix.length)
  if (closeIndex < 0) return
  const json = text.slice(prefix.length, closeIndex)
  if (json.length === 0) return
  try {
    const parsed = JSON.parse(json) as {
      readonly conversationId?: unknown
      readonly title?: unknown
      readonly conversation?: unknown
    }
    const reference = decodeReferencedConversation(JSON.stringify({
      version: 1,
      conversationId: parsed.conversationId,
      title: parsed.title,
      conversation: parsed.conversation,
    }))
    return {
      reference,
      message: text.slice(closeIndex + closeToken.length).trim(),
    }
  } catch {
    return
  }
}

function matchingOccurrences(
  snapshot: ParentComposerInputSnapshot,
  reference: ReferencedSideChatConversation,
): readonly ParentComposerOccurrence[] {
  return snapshot.occurrences.filter((occurrence) => {
    if (occurrence.source !== SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE) return false
    try {
      return decodeReferencedConversation(occurrence.ref).conversationId === reference.conversationId
    } catch {
      return false
    }
  })
}

function removeOccurrence(input: ParentComposerInput, occurrenceId: number): void {
  const snapshot = input.state.getSnapshot()
  const occurrence = snapshot.occurrences.find(candidate => candidate.occurrenceId === occurrenceId)
  if (occurrence === undefined) return
  let title: string
  try {
    title = decodeReferencedConversation(occurrence.ref).title
  } catch {
    return
  }
  const draft = draftWithoutOccurrence(snapshot, occurrence, title, { consumeAdjacentSpace: true })
  if (draft !== undefined) input.setDraft(draft)
}

/** Insert or refresh one Side Chat label without duplicating an older snapshot. */
export function addReferencedSideChatToConversation(
  input: ParentComposerInput,
  reference: ReferencedSideChatConversation,
): boolean {
  if (reference.conversation.length === 0) return false
  const before = input.state.getSnapshot()
  const existing = matchingOccurrences(before, reference)
  const encoded = encodeReferencedConversation(reference)
  if (existing.some(occurrence => occurrence.ref === encoded)) return true

  const inserted = input.insertReference({
    source: SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE,
    ref: encoded,
    label: reference.title,
    appearance: 'session',
    clipboardText: `@${reference.title}`,
  }, {
    start: 0,
    end: 0,
    draftRev: before.draftRev,
  })
  if (!inserted) return false

  for (const occurrence of existing) removeOccurrence(input, occurrence.occurrenceId)
  return true
}

/** Reference codec used by the native composer chip and submit pipeline. */
export const sideChatConversationReferenceSource: SelectionReferenceSource = {
  trigger: '@',
  name: SIDE_CHAT_CONVERSATION_REFERENCE_SOURCE,
  order: 1_001,
  candidates: async () => [],
  onPick: () => undefined,
  codec: {
    clipboardText: ref => `@${decodeReferencedConversation(ref).title}`,
    serialize: async (ref, signal) => {
      if (signal.aborted) throw signal.reason
      return serializeReferencedConversation(decodeReferencedConversation(ref))
    },
  },
}
