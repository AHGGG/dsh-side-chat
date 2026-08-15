// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConversationAnnotationMarkers } from '../../src/client/selection/ConversationAnnotationMarkers.js'
import type { ConversationSelectionAnnotation } from '../../src/client/parent-composer/add-to-conversation.js'
import { SessionId } from '../../src/shared/contracts.js'

const annotation: ConversationSelectionAnnotation = {
  annotationIndex: 0,
  text: 'selected',
  comment: 'Initial note',
  selection: {
    parentSessionId: SessionId('parent-1'),
    fragments: [{
      nodeKey: 'node-1',
      nodeKind: 'assistant-step',
      turnKey: 'turn:1',
      seq: 7,
      startOffset: 2,
      endOffset: 10,
      text: 'selected',
      source: 'assistant',
      modelVisible: true,
      settled: true,
    }],
    text: 'selected',
    atSeq: 7,
    rect: { x: 0, y: 0, width: 0, height: 0, viewportWidth: 800, viewportHeight: 600 },
  },
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('conversation annotation markers', () => {
  it('restores the exact browser selection and publishes active highlights', () => {
    const originalClientRects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects')
    const originalBoundingRect = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect')
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [],
    })
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 40,
        y: 80,
        left: 40,
        top: 80,
        right: 120,
        bottom: 100,
        width: 80,
        height: 20,
      } as DOMRect),
    })
    const highlights = new Map<string, unknown>()
    class MockHighlight {
      priority = 0
      constructor(readonly ranges: readonly AbstractRange[]) {}
    }
    vi.stubGlobal('CSS', { highlights })
    vi.stubGlobal('Highlight', MockHighlight)
    const onEdit = vi.fn()

    try {
      const view = render(<>
        <main data-chat-flow>
          <p data-chat-anchor-key="node-1">A selected passage.</p>
        </main>
        <ConversationAnnotationMarkers annotations={[annotation]} onEdit={onEdit} />
      </>)

      expect(highlights.has('dsh-side-chat-annotations')).toBe(true)
      const marker = screen.getByRole('button', { name: 'Edit annotation 1' })
      expect(marker).toHaveTextContent('1')
      expect(marker).toHaveStyle({ left: '123px', top: '68px' })

      fireEvent.click(marker)
      expect(window.getSelection()?.toString()).toBe('selected')
      expect(onEdit).toHaveBeenCalledWith(annotation, expect.objectContaining({
        rect: expect.objectContaining({ x: 40, y: 80, width: 80, height: 20 }),
      }))

      view.rerender(<>
        <main data-chat-flow>
          <p data-chat-anchor-key="node-1">A selected passage.</p>
        </main>
        <ConversationAnnotationMarkers
          annotations={[annotation]}
          activeAnnotationIndex={0}
          onEdit={onEdit}
        />
      </>)
      expect(highlights.has('dsh-side-chat-active-annotation')).toBe(true)

      view.rerender(<>
        <main data-chat-flow>
          <p data-chat-anchor-key="node-1">A selected passage.</p>
        </main>
        <ConversationAnnotationMarkers annotations={[]} onEdit={onEdit} />
      </>)
      expect(screen.queryByRole('button', { name: 'Edit annotation 1' })).not.toBeInTheDocument()
      expect(highlights.has('dsh-side-chat-annotations')).toBe(false)
      expect(highlights.has('dsh-side-chat-active-annotation')).toBe(false)
      view.unmount()
    } finally {
      if (originalClientRects === undefined) delete (Range.prototype as Partial<Range>).getClientRects
      else Object.defineProperty(Range.prototype, 'getClientRects', originalClientRects)
      if (originalBoundingRect === undefined) delete (Range.prototype as Partial<Range>).getBoundingClientRect
      else Object.defineProperty(Range.prototype, 'getBoundingClientRect', originalBoundingRect)
    }
  })
})
