import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, KeyboardEvent, MouseEvent } from 'react'
import type { ConversationSelection } from '../../shared/contracts.js'

export interface SelectionActionsProps {
  readonly selection: ConversationSelection
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

export function SelectionActions({
  selection,
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
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const center = selection.rect.x + selection.rect.width / 2
  const style: CSSProperties = {
    left: Math.min(Math.max(8, center), selection.rect.viewportWidth - 8),
    top: selection.rect.y < 56
      ? selection.rect.y + selection.rect.height + 8
      : selection.rect.y - 8,
    transform: selection.rect.y < 56 ? 'translate(0, 0)' : 'translate(0, -100%)',
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
      className="dsh-side-chat-selection-actions"
      role="toolbar"
      aria-label="Selected conversation text actions"
      style={style}
      onMouseDown={keepSelection}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
      }}
    >
      <button
        type="button"
        onClick={() => {
          setEditingAnnotation(true)
          onAnnotationEditorChange?.(true)
        }}
      >
        Add to chat
      </button>
      <button
        type="button"
        disabled={askDisabledReason !== undefined}
        title={askDisabledReason}
        onClick={() => {
          onMoreDetails(selection)
          onDismiss()
        }}
      >
        More details
      </button>
      <button
        type="button"
        disabled={askDisabledReason !== undefined}
        title={askDisabledReason}
        onClick={() => {
          onAskInSideChat(selection)
          onDismiss()
        }}
      >
        Ask in side chat
      </button>
    </div>
  )
}
