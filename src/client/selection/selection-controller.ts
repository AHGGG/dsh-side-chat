import type {
  ConversationSelection,
  SelectionFragment,
  SessionId,
} from '../../shared/contracts.js'
import {
  finalizeConversationSelection,
  SelectionValidationError,
} from './selection-normalizer.js'

/** Authoritative Chat Node information resolved from the locked DSH DOM anchor. */
export interface SelectionNodeDescriptor {
  readonly nodeKey: string
  readonly nodeKind: string
  readonly turnKey: string
  readonly seq: number
  readonly source: SelectionFragment['source']
  readonly modelVisible: boolean
  readonly settled: boolean
}

/** Resolves only public `data-chat-*` anchors against the current snapshot. */
export interface SelectionAnchorResolver {
  resolve(anchor: HTMLElement): SelectionNodeDescriptor | undefined
}

export interface RestoredConversationSelection {
  /** Exact visible text-node slices used by the Custom Highlight API. */
  readonly ranges: readonly Range[]
  /** One encompassing range used to restore the browser selection. */
  readonly browserRange: Range
}

function anchorOf(node: Node): HTMLElement | null {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
  return element?.closest<HTMLElement>('[data-chat-anchor-key]') ?? null
}

function excluded(node: Text, root: HTMLElement): boolean {
  const parent = node.parentElement
  if (parent === null || !root.contains(parent)) return true
  return parent.closest([
    '[data-selection-exclude]',
    '[data-side-chat-panel]',
    '[aria-hidden="true"]',
    'button',
    'textarea',
    'input',
    '[role="button"]',
  ].join(',')) !== null
}

function acceptedTextNodes(anchor: HTMLElement, root: HTMLElement): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(anchor, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current !== null) {
    const text = current as Text
    if (!excluded(text, root)) nodes.push(text)
    current = walker.nextNode()
  }
  return nodes
}

function selectedSlice(range: Range, node: Text): { start: number; end: number; text: string } | undefined {
  if (!range.intersectsNode(node)) return
  let start = range.startContainer === node ? range.startOffset : 0
  let end = range.endContainer === node ? range.endOffset : node.data.length
  if (start > 0
    && /[\uDC00-\uDFFF]/u.test(node.data[start] ?? '')
    && /[\uD800-\uDBFF]/u.test(node.data[start - 1] ?? '')) {
    start -= 1
  }
  if (end > 0
    && end < node.data.length
    && /[\uD800-\uDBFF]/u.test(node.data[end - 1] ?? '')
    && /[\uDC00-\uDFFF]/u.test(node.data[end] ?? '')) {
    end += 1
  }
  if (end <= start) return
  return { start, end, text: node.data.slice(start, end) }
}

/**
 * Locked-commit fallback capture. It intentionally fails closed unless every
 * selected text node belongs to one public Chat anchor.
 */
export async function captureDomConversationSelection(input: {
  readonly selection: Selection | null
  readonly conversationRoot: HTMLElement
  readonly parentSessionId: SessionId
  readonly resolver: SelectionAnchorResolver
}): Promise<ConversationSelection> {
  const range = input.selection?.rangeCount === 1 ? input.selection.getRangeAt(0) : undefined
  if (range === undefined || range.collapsed) {
    throw new SelectionValidationError('selection_empty', 'Select some conversation text first.')
  }
  if (!input.conversationRoot.contains(range.startContainer)
    || !input.conversationRoot.contains(range.endContainer)) {
    throw new SelectionValidationError(
      'selection_outside_conversation',
      'The selection must stay inside the current conversation.',
    )
  }
  const startAnchor = anchorOf(range.startContainer)
  const endAnchor = anchorOf(range.endContainer)
  if (startAnchor === null || endAnchor === null || startAnchor !== endAnchor) {
    throw new SelectionValidationError(
      'selection_crosses_unsupported_nodes',
      'This compatibility adapter supports a selection inside one message only.',
    )
  }
  const descriptor = input.resolver.resolve(startAnchor)
  if (descriptor === undefined) {
    throw new SelectionValidationError('selection_stale', 'The selected message is no longer in the Session snapshot.')
  }

  const nodes = acceptedTextNodes(startAnchor, input.conversationRoot)
  const pieces: string[] = []
  let startOffset: number | undefined
  let endOffset: number | undefined
  let visibleOffset = 0
  for (const node of nodes) {
    const slice = selectedSlice(range, node)
    if (slice !== undefined) {
      startOffset ??= visibleOffset + slice.start
      endOffset = visibleOffset + slice.end
      pieces.push(slice.text)
    }
    visibleOffset += node.data.length
  }
  if (startOffset === undefined || endOffset === undefined) {
    throw new SelectionValidationError('selection_not_model_visible', 'The selection contains no supported visible text.')
  }
  const rect = range.getBoundingClientRect()
  return await finalizeConversationSelection({
    parentSessionId: input.parentSessionId,
    fragments: [{
      ...descriptor,
      startOffset,
      endOffset,
      text: pieces.join(''),
    }],
    rawText: pieces.join(''),
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    },
  })
}

function anchorByKey(root: HTMLElement, nodeKey: string): HTMLElement | undefined {
  return [...root.querySelectorAll<HTMLElement>('[data-chat-anchor-key]')]
    .find(anchor => anchor.dataset['chatAnchorKey'] === nodeKey)
}

function restoreFragmentRanges(
  root: HTMLElement,
  fragment: SelectionFragment,
): readonly Range[] | undefined {
  const anchor = anchorByKey(root, fragment.nodeKey)
  if (anchor === undefined) return
  const nodes = acceptedTextNodes(anchor, root)
  const visibleText = nodes.map(node => node.data).join('')
  if (!Number.isSafeInteger(fragment.startOffset)
    || !Number.isSafeInteger(fragment.endOffset)
    || fragment.startOffset < 0
    || fragment.endOffset <= fragment.startOffset
    || fragment.endOffset > visibleText.length
    || visibleText.slice(fragment.startOffset, fragment.endOffset) !== fragment.text) {
    return
  }

  const ranges: Range[] = []
  let visibleOffset = 0
  for (const node of nodes) {
    const nodeEnd = visibleOffset + node.data.length
    const start = Math.max(fragment.startOffset, visibleOffset) - visibleOffset
    const end = Math.min(fragment.endOffset, nodeEnd) - visibleOffset
    if (end > start) {
      const range = document.createRange()
      range.setStart(node, start)
      range.setEnd(node, end)
      ranges.push(range)
    }
    visibleOffset = nodeEnd
    if (visibleOffset >= fragment.endOffset) break
  }
  return ranges.length === 0 ? undefined : ranges
}

/** Rebuild a saved selection only when its anchored visible text still matches. */
export function restoreDomConversationSelection(input: {
  readonly selection: ConversationSelection
  readonly conversationRoot: HTMLElement
}): RestoredConversationSelection | undefined {
  const ranges: Range[] = []
  for (const fragment of input.selection.fragments) {
    const restored = restoreFragmentRanges(input.conversationRoot, fragment)
    if (restored === undefined) return
    ranges.push(...restored)
  }
  const first = ranges[0]
  const last = ranges.at(-1)
  if (first === undefined || last === undefined) return
  const browserRange = document.createRange()
  browserRange.setStart(first.startContainer, first.startOffset)
  browserRange.setEnd(last.endContainer, last.endOffset)
  return { ranges, browserRange }
}
