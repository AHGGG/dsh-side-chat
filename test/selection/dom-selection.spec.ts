// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import {
  captureDomConversationSelection,
  restoreDomConversationSelection,
} from '../../src/client/selection/selection-controller.js'
import { SessionId } from '../../src/shared/contracts.js'

function resolver(anchor: HTMLElement) {
  return {
    nodeKey: anchor.dataset['chatAnchorKey'] ?? 'missing',
    nodeKind: 'assistant',
    turnKey: anchor.dataset['turn'] ?? 'turn-1',
    seq: Number(anchor.dataset['seq'] ?? '4'),
    source: 'assistant' as const,
    modelVisible: true,
    settled: true,
  }
}

describe('rc.6 DOM selection', () => {
  it('captures visible text inside one public Chat anchor', async () => {
    document.body.innerHTML = '<main id="root"><p data-chat-anchor-key="node-1" data-turn="turn-1" data-seq="4">hello <em>world</em><button>Copy</button></p></main>'
    const root = document.querySelector<HTMLElement>('#root')!
    const first = root.querySelector('p')!.firstChild!
    const last = root.querySelector('em')!.firstChild!
    const range = document.createRange()
    range.setStart(first, 1)
    range.setEnd(last, 3)
    Object.defineProperty(range, 'getBoundingClientRect', {
      value: () => ({ x: 10, y: 20, width: 80, height: 18 }),
    })
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    const captured = await captureDomConversationSelection({
      selection,
      conversationRoot: root,
      parentSessionId: SessionId('parent-1'),
      resolver: { resolve: resolver },
    })
    expect(captured.text).toBe('ello wor')
    expect(captured.fragments[0]).toMatchObject({ nodeKey: 'node-1', seq: 4 })

    selection.removeAllRanges()
    const restored = restoreDomConversationSelection({ selection: captured, conversationRoot: root })
    expect(restored?.ranges.map(restoredRange => restoredRange.toString())).toEqual(['ello ', 'wor'])
    expect(restored?.browserRange.toString()).toBe('ello wor')
    selection.addRange(restored!.browserRange)
    expect(selection.toString()).toBe('ello wor')

    last.textContent = 'changed'
    expect(restoreDomConversationSelection({ selection: captured, conversationRoot: root })).toBeUndefined()
  })

  it('fails closed across message anchors', async () => {
    document.body.innerHTML = '<main id="root"><p data-chat-anchor-key="a">one</p><p data-chat-anchor-key="b">two</p></main>'
    const root = document.querySelector<HTMLElement>('#root')!
    const texts = root.querySelectorAll('p')
    const range = document.createRange()
    range.setStart(texts[0]!.firstChild!, 0)
    range.setEnd(texts[1]!.firstChild!, 2)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    await expect(captureDomConversationSelection({
      selection,
      conversationRoot: root,
      parentSessionId: SessionId('parent-1'),
      resolver: { resolve: resolver },
    })).rejects.toMatchObject({ code: 'selection_crosses_unsupported_nodes' })
  })

  it('never slices through a Unicode surrogate pair', async () => {
    document.body.innerHTML = '<main id="root"><p data-chat-anchor-key="emoji">😀</p></main>'
    const root = document.querySelector<HTMLElement>('#root')!
    const text = root.querySelector('p')!.firstChild!
    const range = document.createRange()
    range.setStart(text, 0)
    range.setEnd(text, 1)
    Object.defineProperty(range, 'getBoundingClientRect', {
      value: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    })
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    const captured = await captureDomConversationSelection({
      selection,
      conversationRoot: root,
      parentSessionId: SessionId('parent-1'),
      resolver: { resolve: resolver },
    })
    expect(captured.text).toBe('😀')
    expect(captured.fragments[0]).toMatchObject({ startOffset: 0, endOffset: 2 })
  })
})
