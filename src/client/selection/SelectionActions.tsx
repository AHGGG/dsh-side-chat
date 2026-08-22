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
  if (touch && belowFits) top = below
  else if (aboveFits) top = above
  else if (belowFits) top = below
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
  onDismiss,
}: SelectionActionsProps) {
  const [editingAnnotation, setEditingAnnotation] = useState(annotationEditor !== undefined)
  const [comment, setComment] = useState(annotationEditor?.initialComment ?? '')
  const [toolbarGeometry, setToolbarGeometry] = useState(() => ({
    width: 0,
    height: 0,
    viewportWidth: selection.rect.viewportWidth,
    viewportHeight: selection.rect.viewportHeight,
    viewportOffsetLeft: 0,
    viewportOffsetTop: 0,
  }))
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const touchActivationRef = useRef<{
    readonly target: HTMLButtonElement
    readonly timeStamp: number
  } | null>(null)
  const toolbarPosition = calculateSelectionActionsPosition(
    selection.rect,
    toolbarGeometry,
    touchInteraction,
    {
      width: toolbarGeometry.viewportWidth,
      height: toolbarGeometry.viewportHeight,
      offsetLeft: toolbarGeometry.viewportOffsetLeft,
      offsetTop: toolbarGeometry.viewportOffsetTop,
    },
  )
  const style: CSSProperties = {
    left: toolbarPosition.left,
    top: toolbarPosition.top,
  }
  const editorWidth = Math.min(420, selection.rect.viewportWidth - 16)
  const editorAbove = selection.rect.y - 118
  const editorStyle: CSSProperties = {
    left: clamp(
      selection.rect.x + selection.rect.width + 28,
      8,
      selection.rect.viewportWidth - editorWidth - 8,
    ),
    top: editorAbove >= 8
      ? editorAbove
      : clamp(
          selection.rect.y + selection.rect.height + 12,
          8,
          selection.rect.viewportHeight - 126,
        ),
    width: editorWidth,
  }
  const markerStyle: CSSProperties = {
    left: clamp(selection.rect.x + selection.rect.width + 3, 4, selection.rect.viewportWidth - 26),
    top: clamp(selection.rect.y - 12, 4, selection.rect.viewportHeight - 26),
  }
  const markerNumber = annotationNumber > 99 ? '99+' : String(annotationNumber)
  const keepSelection = (event: MouseEvent<HTMLDivElement>): void => { event.preventDefault() }

  useLayoutEffect(() => {
    if (editingAnnotation) return
    const toolbar = toolbarRef.current
    if (toolbar === null) return
    const measure = (): void => {
      const bounds = toolbar.getBoundingClientRect()
      const visualViewport = window.visualViewport
      const viewportWidth = visualViewport?.width ?? window.innerWidth ?? selection.rect.viewportWidth
      const viewportHeight = visualViewport?.height ?? window.innerHeight ?? selection.rect.viewportHeight
      const next = {
        width: bounds.width,
        height: bounds.height,
        viewportWidth,
        viewportHeight,
        viewportOffsetLeft: visualViewport?.offsetLeft ?? 0,
        viewportOffsetTop: visualViewport?.offsetTop ?? 0,
      }
      setToolbarGeometry(current => current.width === next.width
        && current.height === next.height
        && current.viewportWidth === next.viewportWidth
        && current.viewportHeight === next.viewportHeight
        && current.viewportOffsetLeft === next.viewportOffsetLeft
        && current.viewportOffsetTop === next.viewportOffsetTop
        ? current
        : next)
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    observer?.observe(toolbar)
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('scroll', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('scroll', measure)
    }
  }, [editingAnnotation, selection, touchInteraction])

  useEffect(() => {
    if (editingAnnotation) commentRef.current?.focus()
  }, [editingAnnotation])

  const closeEditor = (): void => {
    setEditingAnnotation(false)
    setComment('')
    onAnnotationEditorChange?.(false)
    if (annotationEditor !== undefined) onDismiss()
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
