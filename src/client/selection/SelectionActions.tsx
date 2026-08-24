import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import type { ConversationSelection } from '../../shared/contracts.js'

export interface SelectionActionsProps {
  readonly selection: ConversationSelection
  readonly touchInteraction?: boolean
  readonly askDisabledReason?: string
  readonly annotationNumber?: number
  /** Opens only the comment editor, used when an existing marker is clicked. */
  readonly annotationEditor?: {
    readonly initialComment?: string
    readonly dialogLabel?: string
  }
  readonly onAddToChat: (selection: ConversationSelection, comment?: string) => void
  readonly onMoreDetails: (selection: ConversationSelection) => void
  readonly onAskInSideChat: (selection: ConversationSelection) => void
  readonly onAnnotationEditorChange?: (open: boolean) => void
  /** Explicit destructive action offered only while editing a persisted annotation. */
  readonly onRemoveAnnotation?: () => void
  readonly onDismiss: () => void
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(minimum, value), Math.max(minimum, maximum))
}

export function calculateSelectionActionsPosition(
  rect: ConversationSelection['rect'],
  size: { readonly width: number; readonly height: number },
  touch: boolean,
  viewport: {
    readonly width: number
    readonly height: number
    readonly offsetLeft?: number
    readonly offsetTop?: number
  } = {
    width: rect.viewportWidth,
    height: rect.viewportHeight,
  },
): { readonly left: number; readonly top: number } {
  const edge = 8
  const width = Math.max(0, size.width)
  const height = Math.max(0, size.height)
  // Range and fixed-position coordinates use the layout viewport origin. A
  // visual viewport must therefore contribute both its size and its offset.
  const viewportLeft = viewport.offsetLeft ?? 0
  const viewportTop = viewport.offsetTop ?? 0
  const viewportRight = viewportLeft + viewport.width
  const viewportBottom = viewportTop + viewport.height
  const left = clamp(
    rect.x + rect.width / 2 - width / 2,
    viewportLeft + edge,
    viewportRight - width - edge,
  )
  const belowGap = touch ? 12 : 8
  const aboveGap = touch ? 64 : 8
  const below = rect.y + rect.height + belowGap
  const above = rect.y - height - aboveGap
  const belowFits = below + height <= viewportBottom - edge
  const aboveFits = above >= viewportTop + edge
  let top: number
  if (belowFits) top = below
  else if (aboveFits) top = above
  else {
    const roomAbove = rect.y - aboveGap - viewportTop - edge
    const roomBelow = viewportBottom - edge - rect.y - rect.height - belowGap
    top = roomAbove >= roomBelow ? above : below
  }
  return {
    left,
    top: clamp(top, viewportTop + edge, viewportBottom - height - edge),
  }
}

export function SelectionActions({
  selection,
  touchInteraction = false,
  askDisabledReason,
  annotationNumber = 1,
  annotationEditor,
  onAddToChat,
  onMoreDetails,
  onAskInSideChat,
  onAnnotationEditorChange,
  onRemoveAnnotation,
  onDismiss,
}: SelectionActionsProps) {
  const [editingAnnotation, setEditingAnnotation] = useState(annotationEditor !== undefined)
  const [comment, setComment] = useState(annotationEditor?.initialComment ?? '')
  const [toolbarSize, setToolbarSize] = useState(() => ({
    width: 0,
    height: 0,
  }))
  const [viewport, setViewport] = useState(() => ({
    width: selection.rect.viewportWidth,
    height: selection.rect.viewportHeight,
    offsetLeft: 0,
    offsetTop: 0,
  }))
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const touchActivationRef = useRef<{
    readonly target: HTMLButtonElement
    readonly timeStamp: number
  } | null>(null)
  const toolbarPosition = calculateSelectionActionsPosition(
    selection.rect,
    toolbarSize,
    touchInteraction,
    viewport,
  )
  const style: CSSProperties = {
    left: toolbarPosition.left,
    top: toolbarPosition.top,
  }
  const viewportLeft = viewport.offsetLeft
  const viewportTop = viewport.offsetTop
  const viewportRight = viewportLeft + viewport.width
  const viewportBottom = viewportTop + viewport.height
  const editorEdge = 8
  const editorHeight = 118
  const editorWidth = Math.max(0, Math.min(420, viewport.width - editorEdge * 2))
  const editorAbove = selection.rect.y - editorHeight
  const editorBelow = selection.rect.y + selection.rect.height + 12
  const editorStyle: CSSProperties = {
    left: clamp(
      selection.rect.x + selection.rect.width + 28,
      viewportLeft + editorEdge,
      viewportRight - editorWidth - editorEdge,
    ),
    top: clamp(
      editorAbove >= viewportTop + editorEdge ? editorAbove : editorBelow,
      viewportTop + editorEdge,
      viewportBottom - editorHeight - editorEdge,
    ),
    width: editorWidth,
  }
  const markerEdge = 4
  const markerSize = 22
  const markerStyle: CSSProperties = {
    left: clamp(
      selection.rect.x + selection.rect.width + 3,
      viewportLeft + markerEdge,
      viewportRight - markerSize - markerEdge,
    ),
    top: clamp(
      selection.rect.y - 12,
      viewportTop + markerEdge,
      viewportBottom - markerSize - markerEdge,
    ),
  }
  const markerNumber = annotationNumber > 99 ? '99+' : String(annotationNumber)
  const keepSelection = (event: MouseEvent<HTMLDivElement>): void => { event.preventDefault() }

  useLayoutEffect(() => {
    const visualViewport = window.visualViewport
    const measure = (): void => {
      const nextViewport = {
        width: visualViewport?.width ?? window.innerWidth ?? selection.rect.viewportWidth,
        height: visualViewport?.height ?? window.innerHeight ?? selection.rect.viewportHeight,
        offsetLeft: visualViewport?.offsetLeft ?? 0,
        offsetTop: visualViewport?.offsetTop ?? 0,
      }
      setViewport(current => current.width === nextViewport.width
        && current.height === nextViewport.height
        && current.offsetLeft === nextViewport.offsetLeft
        && current.offsetTop === nextViewport.offsetTop
        ? current
        : nextViewport)
      const toolbar = toolbarRef.current
      if (toolbar === null) return
      const bounds = toolbar.getBoundingClientRect()
      const nextSize = { width: bounds.width, height: bounds.height }
      setToolbarSize(current => current.width === nextSize.width
        && current.height === nextSize.height
        ? current
        : nextSize)
    }
    measure()
    const toolbar = toolbarRef.current
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    if (toolbar !== null) observer?.observe(toolbar)
    window.addEventListener('resize', measure)
    visualViewport?.addEventListener('resize', measure)
    visualViewport?.addEventListener('scroll', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      visualViewport?.removeEventListener('resize', measure)
      visualViewport?.removeEventListener('scroll', measure)
    }
  }, [editingAnnotation, selection, touchInteraction])

  useEffect(() => {
    if (editingAnnotation) commentRef.current?.focus()
  }, [editingAnnotation])

  const closeEditor = (): void => {
    setEditingAnnotation(false)
    setComment('')
    onAnnotationEditorChange?.(false)
    onDismiss()
  }
  const saveAnnotation = (): void => {
    const trimmed = comment.trim()
    onAddToChat(selection, trimmed.length === 0 ? undefined : trimmed)
    onAnnotationEditorChange?.(false)
    onDismiss()
  }
  const submitAnnotation = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    saveAnnotation()
  }
  const annotationKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeEditor()
      return
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      saveAnnotation()
    }
  }
  const openAnnotationEditor = (): void => {
    setEditingAnnotation(true)
    onAnnotationEditorChange?.(true)
  }
  const showMoreDetails = (): void => {
    onMoreDetails(selection)
    onDismiss()
  }
  const askInSideChat = (): void => {
    onAskInSideChat(selection)
    onDismiss()
  }
  const activateOnTouch = (
    event: ReactPointerEvent<HTMLButtonElement>,
    action: () => void,
  ): void => {
    if (!touchInteraction || event.pointerType !== 'touch' || event.currentTarget.disabled) return
    event.preventDefault()
    touchActivationRef.current = {
      target: event.currentTarget,
      timeStamp: event.timeStamp,
    }
    action()
  }
  const activateOnClick = (
    event: MouseEvent<HTMLButtonElement>,
    action: () => void,
  ): void => {
    const touchActivation = touchActivationRef.current
    touchActivationRef.current = null
    const elapsed = touchActivation === null ? Number.POSITIVE_INFINITY : event.timeStamp - touchActivation.timeStamp
    if (event.detail !== 0
      && touchActivation?.target === event.currentTarget
      && elapsed >= 0
      && elapsed < 1_000) {
      event.preventDefault()
      return
    }
    action()
  }

  if (editingAnnotation) {
    return (
      <>
        {annotationEditor === undefined && (
          <span
            className="dsh-side-chat-selection-marker"
            aria-hidden="true"
            data-large={annotationNumber > 99 || undefined}
            style={markerStyle}
          >{markerNumber}</span>
        )}
        <form
          className="dsh-side-chat-selection-comment"
          role="dialog"
          aria-label={annotationEditor?.dialogLabel ?? 'Add annotation comment'}
          style={editorStyle}
          onSubmit={submitAnnotation}
          onMouseDown={(event) => { event.stopPropagation() }}
          onKeyUp={(event) => { event.stopPropagation() }}
        >
          <textarea
            ref={commentRef}
            value={comment}
            rows={2}
            aria-label="Optional annotation comment"
            placeholder="Add an optional comment…"
            onChange={(event) => { setComment(event.currentTarget.value) }}
            onKeyDown={annotationKeyDown}
          />
          <div className="dsh-side-chat-selection-comment-actions">
            {annotationEditor !== undefined && onRemoveAnnotation !== undefined && (
              <button type="button" onClick={onRemoveAnnotation}>Remove</button>
            )}
            <button type="button" onClick={closeEditor}>Cancel</button>
            <button type="submit" className="dsh-side-chat-selection-comment-save">Save</button>
          </div>
        </form>
      </>
    )
  }

  return (
    <div
      ref={toolbarRef}
      className="dsh-side-chat-selection-actions"
      role="toolbar"
      aria-label="Selected conversation text actions"
      data-touch={touchInteraction || undefined}
      style={style}
      onMouseDown={keepSelection}
      onPointerDown={(event) => {
        if (touchInteraction && event.pointerType === 'touch') event.preventDefault()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
      }}
    >
      <button
        type="button"
        onPointerDown={(event) => { activateOnTouch(event, openAnnotationEditor) }}
        onClick={(event) => { activateOnClick(event, openAnnotationEditor) }}
      >
        Add to chat
      </button>
      <button
        type="button"
        disabled={askDisabledReason !== undefined}
        title={askDisabledReason}
        onPointerDown={(event) => { activateOnTouch(event, showMoreDetails) }}
        onClick={(event) => { activateOnClick(event, showMoreDetails) }}
      >
        More details
      </button>
      <button
        type="button"
        disabled={askDisabledReason !== undefined}
        title={askDisabledReason}
        onPointerDown={(event) => { activateOnTouch(event, askInSideChat) }}
        onClick={(event) => { activateOnClick(event, askInSideChat) }}
      >
        Ask in side chat
      </button>
    </div>
  )
}
