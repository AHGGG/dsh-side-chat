// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
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

function stubVisualViewport(bounds: {
  readonly width: number
  readonly height: number
  readonly offsetLeft: number
  readonly offsetTop: number
}): EventTarget & {
  width: number
  height: number
  offsetLeft: number
  offsetTop: number
} {
  const viewport = Object.assign(new EventTarget(), bounds)
  vi.stubGlobal('visualViewport', viewport)
  return viewport
}

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

  it('places desktop actions below the selection to avoid native selection controls', () => {
    expect(calculateSelectionActionsPosition(
      selectedPassage.rect,
      { width: 300, height: 36 },
      false,
    )).toEqual({ left: 8, top: 128 })
  })

  it('uses visual viewport offsets when checking space and clamping edges', () => {
    expect(calculateSelectionActionsPosition(
      {
        ...selectedPassage.rect,
        x: 120,
        y: 210,
        viewportWidth: 800,
        viewportHeight: 800,
      },
      { width: 300, height: 42 },
      true,
      { width: 500, height: 300, offsetLeft: 40, offsetTop: 200 },
    )).toEqual({ left: 48, top: 242 })
  })

  it('passes live visual viewport offsets to the toolbar positioner', () => {
    stubVisualViewport({
      width: 500,
      height: 300,
      offsetLeft: 40,
      offsetTop: 200,
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
          y: 210,
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

    expect(screen.getByRole('toolbar')).toHaveStyle({ left: '48px', top: '242px' })
  })

  it('keeps the annotation editor and marker inside a changing visual viewport', () => {
    const visualViewport = stubVisualViewport({
      width: 500,
      height: 300,
      offsetLeft: 40,
      offsetTop: 200,
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
    const view = render(<SelectionActions
      selection={{
        ...selectedPassage,
        rect: {
          ...selectedPassage.rect,
          x: 480,
          y: 450,
          viewportWidth: 800,
          viewportHeight: 800,
        },
      }}
      onAddToChat={NOOP}
      onMoreDetails={NOOP}
      onAskInSideChat={NOOP}
      onDismiss={NOOP}
    />)

    fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
    const dialog = screen.getByRole('dialog', { name: 'Add annotation comment' })
    const marker = view.container.querySelector('.dsh-side-chat-selection-marker')
    expect(dialog).toHaveStyle({ left: '112px', top: '332px', width: '420px' })
    expect(marker).toHaveStyle({ left: '514px', top: '438px' })

    act(() => {
      Object.assign(visualViewport, {
        width: 400,
        height: 150,
        offsetLeft: 100,
        offsetTop: 450,
      })
      visualViewport.dispatchEvent(new Event('scroll'))
    })

    expect(dialog).toHaveStyle({ left: '108px', top: '474px', width: '384px' })
    expect(marker).toHaveStyle({ left: '474px', top: '454px' })
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

  it('fully dismisses a new annotation from Cancel', () => {
    const onDismiss = vi.fn()
    render(<SelectionActions
      selection={selectedPassage}
      onAddToChat={NOOP}
      onMoreDetails={NOOP}
      onAskInSideChat={NOOP}
      onDismiss={onDismiss}
    />)

    fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('keeps persisted Cancel non-destructive and exposes Remove separately', () => {
    const onDismiss = vi.fn()
    const onRemoveAnnotation = vi.fn()
    const view = render(<SelectionActions
      selection={selectedPassage}
      annotationEditor={{ initialComment: 'Existing note', dialogLabel: 'Edit annotation comment' }}
      onAddToChat={NOOP}
      onMoreDetails={NOOP}
      onAskInSideChat={NOOP}
      onRemoveAnnotation={onRemoveAnnotation}
      onDismiss={onDismiss}
    />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(onRemoveAnnotation).not.toHaveBeenCalled()

    view.unmount()
    render(<SelectionActions
      selection={selectedPassage}
      annotationEditor={{ initialComment: 'Existing note', dialogLabel: 'Edit annotation comment' }}
      onAddToChat={NOOP}
      onMoreDetails={NOOP}
      onAskInSideChat={NOOP}
      onRemoveAnnotation={onRemoveAnnotation}
      onDismiss={NOOP}
    />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemoveAnnotation).toHaveBeenCalledOnce()
  })

  it('submits the optional annotation comment from Save', () => {
    const onAddToChat = vi.fn()
    const onDismiss = vi.fn()
    render(<SelectionActions
      selection={selectedPassage}
      onAddToChat={onAddToChat}
      onMoreDetails={NOOP}
      onAskInSideChat={NOOP}
      onDismiss={onDismiss}
    />)

    fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Optional annotation comment' }), {
      target: { value: '  Keep this note  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onAddToChat).toHaveBeenCalledWith(selectedPassage, 'Keep this note')
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
