import { describe, expect, it } from 'vitest'
import {
  assertSelectionCurrent,
  finalizeConversationSelection,
  normalizeSelectedText,
} from '../../src/client/selection/selection-normalizer.js'
import {
  selectionFitsLimit,
  summarizeSelection,
  utf8ByteLength,
} from '../../src/client/selection/selection-limits.js'
import { SessionId, type SelectionFragment } from '../../src/shared/contracts.js'

const FRAGMENT: SelectionFragment = {
  nodeKey: 'node-1',
  nodeKind: 'assistant',
  turnKey: 'turn-1',
  seq: 4,
  startOffset: 0,
  endOffset: 5,
  text: 'hello',
  source: 'assistant',
  modelVisible: true,
  settled: true,
}

function input(fragments: readonly SelectionFragment[] = [FRAGMENT], rawText = 'hello') {
  return {
    parentSessionId: SessionId('parent-1'),
    fragments,
    rawText,
    rect: { x: 1, y: 2, width: 3, height: 4, viewportWidth: 100, viewportHeight: 100 },
  }
}

describe('selection normalization', () => {
  it('normalizes line endings and limits UTF-8 size without splitting Unicode previews', () => {
    expect(normalizeSelectedText('  a\r\n\r\n\r\n\r\n\r\nb  ')).toBe('a\n\n\nb')
    expect(utf8ByteLength('😀')).toBe(4)
    expect(selectionFitsLimit('x'.repeat(16 * 1024))).toBe(true)
    expect(selectionFitsLimit('😀'.repeat(4_097))).toBe(false)
    expect(summarizeSelection('a😀b😀c', 4)).toContain('…')
  })

  it('finalizes one settled message at its event sequence', () => {
    const selection = finalizeConversationSelection(input())
    expect(selection).toMatchObject({ parentSessionId: 'parent-1', text: 'hello', atSeq: 4 })
  })

  it('rejects multiple messages, unfinished messages, whitespace, and oversize text', () => {
    expect(() => finalizeConversationSelection(input([FRAGMENT, { ...FRAGMENT, nodeKey: 'node-2' }])))
      .toThrow(expect.objectContaining({ code: 'selection_crosses_unsupported_nodes' }))
    expect(() => finalizeConversationSelection(input([{ ...FRAGMENT, settled: false }])))
      .toThrow(expect.objectContaining({ code: 'fork_unavailable' }))
    expect(() => finalizeConversationSelection(input([FRAGMENT], '  ')))
      .toThrow(expect.objectContaining({ code: 'selection_empty' }))
    expect(() => finalizeConversationSelection(input([FRAGMENT], 'x'.repeat(16 * 1024 + 1))))
      .toThrow(expect.objectContaining({ code: 'selection_too_large' }))
  })

  it('detects a selection from another parent conversation', () => {
    const selection = finalizeConversationSelection(input())
    expect(() => assertSelectionCurrent(selection, SessionId('parent-2')))
      .toThrow('parent conversation changed')
  })
})
