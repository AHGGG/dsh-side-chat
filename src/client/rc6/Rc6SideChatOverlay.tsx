import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ConversationSelection } from '../../shared/contracts.js'
import {
  conversationSelectionAnnotations,
  type ConversationSelectionAnnotation,
} from '../parent-composer/add-to-conversation.js'
import type { SideChatController } from '../side-chat-controller.js'
import { SideChatModelSelect } from '../panel/SideChatModelSelect.js'
import { SideChatPanel } from '../panel/SideChatPanel.js'
import { ConversationAnnotationMarkers } from '../selection/ConversationAnnotationMarkers.js'
import { captureDomConversationSelection } from '../selection/selection-controller.js'
import { SelectionActions } from '../selection/SelectionActions.js'
import { ArchivedConversation } from './ArchivedConversation.js'
import { Rc6SideChatSessions, selectionDescriptor } from './sessions-adapter.js'

const MORE_DETAILS_PROMPT = 'Please explain the selected passage in more detail.'
const TOUCH_SELECTION_SETTLE_MS = 300
const TOUCH_ACTIVATION_SUPPRESS_MS = 750

interface ActiveConversationSelection {
  readonly value: ConversationSelection
  readonly touch: boolean
}

function captureEvent(event: Event): boolean {
  if (event instanceof KeyboardEvent && event.key === 'Escape') return false
  const target = event.target
  return !(target instanceof Element
    && target.closest([
      '[data-side-chat-panel]',
      '.dsh-side-chat-selection-actions',
      '.dsh-side-chat-selection-comment',
      '.dsh-side-chat-annotation-marker',
    ].join(', ')) !== null)
}

function focusParentComposer(): void {
  const input = document.querySelector<HTMLElement>([
    '[data-composer-seat] textarea',
    '[data-composer-seat] [role="textbox"]',
    '[data-composer-seat] [contenteditable="true"]',
  ].join(', '))
  if (input === null) return
  input.focus()
  if (input instanceof HTMLTextAreaElement) {
    input.setSelectionRange(input.value.length, input.value.length)
    return
  }
  const range = document.createRange()
  range.selectNodeContents(input)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

/** rc.6 compatibility surface: selection toolbar plus a non-current child conversation panel. */
export function Rc6SideChatOverlay({
  controller,
  sessions,
}: {
  readonly controller: SideChatController
  readonly sessions: Rc6SideChatSessions
}) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
  const currentSessionId = useSyncExternalStore(
    sessions.subscribeList,
    () => sessions.currentSessionId(),
    () => sessions.currentSessionId(),
  )
  const composerInput = useSyncExternalStore(
    sessions.subscribeConversationInput,
    sessions.currentConversationInputSnapshot,
    sessions.currentConversationInputSnapshot,
  )
  const annotations = useMemo(
    () => composerInput === undefined ? [] : conversationSelectionAnnotations(composerInput),
    [composerInput],
  )
  const [activeSelection, setActiveSelection] = useState<ActiveConversationSelection | null>(null)
  const [editingAnnotation, setEditingAnnotation] = useState<ConversationSelectionAnnotation | null>(null)
  const captureGeneration = useRef(0)
  const captureTimer = useRef<number | undefined>(undefined)
  const mouseDownPoint = useRef<{ readonly x: number; readonly y: number } | null>(null)
  const annotationEditing = useRef(false)
  const touchInteraction = useRef(false)
  const suppressTouchCaptureUntil = useRef(0)

  const capture = useCallback(async (touch: boolean): Promise<void> => {
    const generation = ++captureGeneration.current
    const parentSessionId = sessions.currentSessionId()
    const face = parentSessionId === undefined ? undefined : sessions.face(parentSessionId)
    const conversationRoot = document.querySelector<HTMLElement>('[data-chat-flow]')
    const browserSelection = window.getSelection()
    if (parentSessionId === undefined
      || face === undefined
      || conversationRoot === null
      || browserSelection === null
      || browserSelection.isCollapsed) {
      if (generation === captureGeneration.current) setActiveSelection(null)
      return
    }
    const snapshot = face.getSnapshot()
    try {
      const captured = await captureDomConversationSelection({
        selection: browserSelection,
        conversationRoot,
        parentSessionId,
        resolver: {
          resolve(anchor) {
            const key = anchor.dataset['chatAnchorKey']
            return key === undefined ? undefined : selectionDescriptor(snapshot, key)
          },
        },
      })
      if (generation === captureGeneration.current) {
        setActiveSelection({ value: captured, touch })
      }
    } catch {
      if (generation === captureGeneration.current) setActiveSelection(null)
    }
  }, [sessions])

  const cancelScheduledCapture = useCallback((): void => {
    if (captureTimer.current === undefined) return
    window.clearTimeout(captureTimer.current)
    captureTimer.current = undefined
  }, [])

  const scheduleTouchCapture = useCallback((): void => {
    cancelScheduledCapture()
    const generation = ++captureGeneration.current
    captureTimer.current = window.setTimeout(() => {
      captureTimer.current = undefined
      if (generation !== captureGeneration.current || annotationEditing.current) return
      void capture(true)
    }, TOUCH_SELECTION_SETTLE_MS)
  }, [cancelScheduledCapture, capture])

  useEffect(() => {
    const clearSelection = (): void => {
      cancelScheduledCapture()
      mouseDownPoint.current = null
      annotationEditing.current = false
      ++captureGeneration.current
      setActiveSelection(null)
      setEditingAnnotation(null)
    }
    const touchCaptureSuppressed = (): boolean => Date.now() < suppressTouchCaptureUntil.current
    const onPointerDown = (event: PointerEvent): void => {
      if (!captureEvent(event)) return
      if (event.pointerType === 'touch' && touchCaptureSuppressed()) return
      if (event.pointerType !== 'touch') suppressTouchCaptureUntil.current = 0
      touchInteraction.current = event.pointerType === 'touch'
      if (touchInteraction.current) clearSelection()
    }
    const onTouchStart = (event: TouchEvent): void => {
      if (!captureEvent(event) || touchCaptureSuppressed()) return
      touchInteraction.current = true
      clearSelection()
    }
    const onTouchEnd = (event: TouchEvent): void => {
      if (!captureEvent(event) || touchCaptureSuppressed()) return
      touchInteraction.current = true
      scheduleTouchCapture()
    }
    const onMouseDown = (event: MouseEvent): void => {
      if (touchInteraction.current || touchCaptureSuppressed()) {
        mouseDownPoint.current = null
        return
      }
      if (!captureEvent(event)) {
        mouseDownPoint.current = null
        return
      }
      cancelScheduledCapture()
      mouseDownPoint.current = { x: event.clientX, y: event.clientY }
      annotationEditing.current = false
      ++captureGeneration.current
      setActiveSelection(null)
      setEditingAnnotation(null)
    }
    const onMouseUp = (event: MouseEvent): void => {
      const start = mouseDownPoint.current
      mouseDownPoint.current = null
      if (!captureEvent(event) || touchCaptureSuppressed()) return
      if (touchInteraction.current) {
        scheduleTouchCapture()
        return
      }
      const moved = start === null
        || Math.abs(event.clientX - start.x) > 2
        || Math.abs(event.clientY - start.y) > 2
      if (moved || event.detail > 1 || event.shiftKey) void capture(false)
    }
    const onSelectionChange = (): void => {
      if (annotationEditing.current) return
      if (touchInteraction.current) {
        scheduleTouchCapture()
        return
      }
      const browserSelection = window.getSelection()
      if (browserSelection !== null && !browserSelection.isCollapsed) return
      cancelScheduledCapture()
      ++captureGeneration.current
      setActiveSelection(null)
    }
    const onKeyUp = (event: KeyboardEvent): void => {
      touchInteraction.current = false
      cancelScheduledCapture()
      if (event.key === 'Escape') {
        ++captureGeneration.current
        annotationEditing.current = false
        setActiveSelection(null)
        setEditingAnnotation(null)
        void controller.close()
        return
      }
      if (captureEvent(event)) void capture(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      cancelScheduledCapture()
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [cancelScheduledCapture, capture, controller, scheduleTouchCapture])

  useEffect(() => {
    cancelScheduledCapture()
    ++captureGeneration.current
    annotationEditing.current = false
    setActiveSelection(null)
    setEditingAnnotation(null)
  }, [cancelScheduledCapture, currentSessionId])

  useEffect(() => {
    if (composerInput !== undefined) sessions.reconcileConversationAnnotationPersistence()
  }, [composerInput, sessions])

  useEffect(() => {
    if (editingAnnotation === null) return
    if (annotations.some(annotation => annotation.annotationIndex === editingAnnotation.annotationIndex)) return
    annotationEditing.current = false
    setEditingAnnotation(null)
  }, [annotations, editingAnnotation])

  const dismissActiveSelection = useCallback((): void => {
    cancelScheduledCapture()
    if (touchInteraction.current) {
      suppressTouchCaptureUntil.current = Date.now() + TOUCH_ACTIVATION_SUPPRESS_MS
    }
    touchInteraction.current = false
    annotationEditing.current = false
    ++captureGeneration.current
    setActiveSelection(null)
  }, [cancelScheduledCapture])

  const askDisabledReason = state.phase === 'closed'
    ? undefined
    : 'Close the current Side Chat before starting another one.'
  const childFace = state.childSessionId === undefined ? undefined : sessions.face(state.childSessionId)
  const childCwd = state.childSessionId === undefined ? undefined : sessions.cwd(state.childSessionId)
  const inheritedThroughSeq = state.inheritedThroughSeq
  const locale = navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' as const : 'en' as const
  const modelDirectory = state.parentSessionId === undefined
    ? undefined
    : sessions.modelDirectory?.(state.parentSessionId)
  const modelControl = modelDirectory === undefined
    ? undefined
    : (
        <SideChatModelSelect
          key={`${state.parentSessionId}:${state.childSessionId ?? 'draft'}`}
          directory={modelDirectory}
          selection={state.modelSelection}
          locked={['creating', 'opening', 'closing'].includes(state.phase) || state.error?.operation === 'close'}
          validateInitialSelection={state.childSessionId === undefined}
          locale={locale}
          onInitialize={(selection, options) => {
            if (options.remember) void controller.selectModel(selection)
            else controller.initializeModel(selection)
          }}
          onSelect={(selection) => controller.selectModel(selection)}
        />
      )

  return (
    <div className="dsh-side-chat-overlay">
      <ConversationAnnotationMarkers
        annotations={annotations}
        {...editingAnnotation === null
          ? {}
          : { activeAnnotationIndex: editingAnnotation.annotationIndex }}
        onEdit={(annotation, restoredSelection) => {
          annotationEditing.current = true
          cancelScheduledCapture()
          ++captureGeneration.current
          setActiveSelection(null)
          setEditingAnnotation({ ...annotation, selection: restoredSelection })
        }}
      />
      {activeSelection !== null && (
        <SelectionActions
          selection={activeSelection.value}
          touchInteraction={activeSelection.touch}
          annotationNumber={sessions.nextConversationAnnotationNumber()}
          {...askDisabledReason === undefined ? {} : { askDisabledReason }}
          onAddToChat={(captured, comment) => {
            try {
              if (sessions.addSelectionToConversation(captured, comment)) focusParentComposer()
              else sessions.notify({ kind: 'warning', text: 'Could not add the selection to the current chat.' })
            } catch {
              sessions.notify({ kind: 'warning', text: 'Could not add the selection to the current chat.' })
            }
            dismissActiveSelection()
          }}
          onAnnotationEditorChange={(open) => {
            annotationEditing.current = open
            if (open && touchInteraction.current) {
              suppressTouchCaptureUntil.current = Date.now() + TOUCH_ACTIVATION_SUPPRESS_MS
            }
          }}
          onMoreDetails={(captured) => {
            const opened = controller.openDraft({ selection: captured })
            if (!opened.ok) sessions.notify({ kind: 'warning', text: opened.error.message })
            else void controller.sendFirst(MORE_DETAILS_PROMPT)
            dismissActiveSelection()
          }}
          onAskInSideChat={(captured) => {
            const opened = controller.openDraft({ selection: captured })
            if (!opened.ok) sessions.notify({ kind: 'warning', text: opened.error.message })
            dismissActiveSelection()
          }}
          onDismiss={dismissActiveSelection}
        />
      )}
      {editingAnnotation !== null && (
        <SelectionActions
          key={`annotation:${String(editingAnnotation.annotationIndex)}`}
          selection={editingAnnotation.selection}
          annotationNumber={editingAnnotation.annotationIndex + 1}
          annotationEditor={{
            ...(editingAnnotation.comment === undefined
              ? {}
              : { initialComment: editingAnnotation.comment }),
            dialogLabel: 'Edit annotation comment',
          }}
          onAddToChat={(_captured, comment) => {
            try {
              if (!sessions.updateConversationAnnotation(editingAnnotation.annotationIndex, comment)) {
                sessions.notify({ kind: 'warning', text: 'Could not update the annotation.' })
              }
            } catch {
              sessions.notify({ kind: 'warning', text: 'Could not update the annotation.' })
            }
            annotationEditing.current = false
            setEditingAnnotation(null)
          }}
          onAnnotationEditorChange={(open) => { annotationEditing.current = open }}
          onMoreDetails={() => {}}
          onAskInSideChat={() => {}}
          onDismiss={() => {
            annotationEditing.current = false
            setEditingAnnotation(null)
          }}
        />
      )}
      {state.phase !== 'closed' && (
        <SideChatPanel
          state={state}
          locale={locale}
          {...childFace === undefined || inheritedThroughSeq === undefined
            ? {}
            : {
                embeddedConversation: (
                  <ArchivedConversation
                    face={childFace}
                    inheritedThroughSeq={inheritedThroughSeq}
                    controller={controller}
                    cwd={childCwd}
                    {...state.selection === undefined ? {} : { selection: state.selection }}
                    locale={locale}
                    modelControl={modelControl}
                  />
                ),
              }}
          modelControl={modelControl}
          onDraftChange={(draft) => { controller.setDraft(draft) }}
          onFirstSend={(question) => controller.sendFirst(question)}
          onClose={() => controller.close()}
          onRetry={() => controller.retry()}
          onFocusParent={() => {
            if (state.parentSessionId !== undefined) void sessions.openSession(state.parentSessionId)
          }}
          onRemoveSelection={() => { controller.clearSelection() }}
        />
      )}
    </div>
  )
}
