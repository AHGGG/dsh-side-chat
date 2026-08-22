// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  calculateSelectionActionsPosition,
  SelectionActions,
} from '../../src/client/selection/SelectionActions.js'
import type { ConversationSelection } from '../../src/shared/contracts.js'
import { SessionId } from '../../src/shared/contracts.js'

const selectedPassage: ConversationSelection = {
  parentSessionId: SessionId('parent-1'),
  fragments: [{
    nodeKey: 'node-1',
    nodeKind: 'assistant-step',
    turnKey: 'turn:1',
    seq: 7,
    startOffset: 0,
    endOffset: 13,
    text: 'Selected text',
    source: 'assistant',
    modelVisible: true,
    settled: true,
  }],
  text: 'Selected text',
  atSeq: 7,
  rect: { x: 20, y: 100, width: 80, height: 20, viewportWidth: 800, viewportHeight: 600 },
}

const NOOP = (): void => {}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('selection action positioning', () => {
  it('places touch actions below the selection and keeps them inside the horizontal viewport', () => {
    expect(calculateSelectionActionsPosition(
      selectedPassage.rect,
      { width: 300, height: 42 },
      true,
    )).toEqual({ left: 8, top: 132 })

    expect(calculateSelectionActionsPosition(
      { ...selectedPassage.rect, x: 760, width: 30 },
      { width: 300, height: 42 },
      true,
    )).toEqual({ left: 492, top: 132 })
  })

  it('moves touch actions above a bottom selection with native-toolbar clearance', () => {
    expect(calculateSelectionActionsPosition(
      { ...selectedPassage.rect, y: 550 },
      { width: 300, height: 42 },
      true,
    )).toEqual({ left: 8, top: 444 })
  })

  it('keeps the compact desktop placement above the selection', () => {
    expect(calculateSelectionActionsPosition(
      selectedPassage.rect,
      { width: 300, height: 36 },
      false,
    )).toEqual({ left: 8, top: 56 })
  })

  it('uses visual viewport offsets when checking space and clamping edges', () => {
    expect(calculateSelectionActionsPosition(
      {
        ...selectedPassage.rect,
        x: 120,
        y: 500,
        viewportWidth: 800,
        viewportHeight: 800,
      },
      { width: 300, height: 42 },
      true,
      { width: 500, height: 400, offsetLeft: 100, offsetTop: 200 },
    )).toEqual({ left: 108, top: 532 })
  })

  it('passes live visual viewport offsets to the toolbar positioner', () => {
    vi.stubGlobal('visualViewport', {
      width: 500,
      height: 400,
      offsetLeft: 100,
      offsetTop: 200,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 300,
      height: 42,
      top: 0,
      right: 300,
      bottom: 42,
      left: 0,
      toJSON: () => ({}),
    })

    render(<SelectionActions
      selection={{
        ...selectedPassage,
        rect: {
          ...selectedPassage.rect,
          x: 120,
          y: 500,
          viewportWidth: 800,
          viewportHeight: 800,
        },
      }}
      touchInteraction
      onAddToChat={NOOP}
      onMoreDetails={NOOP}
      onAskInSideChat={NOOP}
      onDismiss={NOOP}
    />)

    expect(screen.getByRole('toolbar')).toHaveStyle({ left: '108px', top: '532px' })
  })
})

describe('selection action touch activation', () => {
  it('runs a touch action on pointerdown and suppresses its following click', () => {
    const onAskInSideChat = vi.fn()
    const onDismiss = vi.fn()
    render(<SelectionActions
      selection={selectedPassage}
      touchInteraction
      onAddToChat={NOOP}
      onMoreDetails={NOOP}
      onAskInSideChat={onAskInSideChat}
      onDismiss={onDismiss}
    />)

    const toolbar = screen.getByRole('toolbar', { name: 'Selected conversation text actions' })
    expect(toolbar).toHaveAttribute('data-touch', 'true')
    const button = screen.getByRole('button', { name: 'Ask in side chat' })
    const pointerDown = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerType: 'touch',
    })
    fireEvent(button, pointerDown)

    expect(pointerDown.defaultPrevented).toBe(true)
    expect(onAskInSideChat).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()

    fireEvent.click(button, { detail: 1 })
    expect(onAskInSideChat).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('keeps keyboard click activation and does not bypass disabled actions', () => {
    const onMoreDetails = vi.fn()
    const onAskInSideChat = vi.fn()
    render(<SelectionActions
      selection={selectedPassage}
      touchInteraction
      askDisabledReason="Close the current Side Chat first."
      onAddToChat={NOOP}
      onMoreDetails={onMoreDetails}
      onAskInSideChat={onAskInSideChat}
      onDismiss={NOOP}
    />)

    const moreDetails = screen.getByRole('button', { name: 'More details' })
    fireEvent.pointerDown(moreDetails, { pointerType: 'touch' })
    expect(onMoreDetails).not.toHaveBeenCalled()

    const addToChat = screen.getByRole('button', { name: 'Add to chat' })
    fireEvent.click(addToChat, { detail: 0 })
    expect(screen.getByRole('dialog', { name: 'Add annotation comment' })).toBeInTheDocument()
    expect(onAskInSideChat).not.toHaveBeenCalled()
  })
})
