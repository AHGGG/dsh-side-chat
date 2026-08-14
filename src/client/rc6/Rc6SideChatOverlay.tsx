import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ConversationSelection } from '../../shared/contracts.js'
import type { SideChatController } from '../side-chat-controller.js'
import { SideChatPanel } from '../panel/SideChatPanel.js'
import { captureDomConversationSelection } from '../selection/selection-controller.js'
import { SelectionActions } from '../selection/SelectionActions.js'
import { ArchivedConversation } from './ArchivedConversation.js'
import { Rc6SideChatSessions, selectionDescriptor } from './sessions-adapter.js'

const MORE_DETAILS_PROMPT = 'Please explain the selected passage in more detail.'

function captureEvent(event: MouseEvent | KeyboardEvent): boolean {
  if (event instanceof KeyboardEvent && event.key === 'Escape') return false
  const target = event.target
  return !(target instanceof Element
    && target.closest([
      '[data-side-chat-panel]',
      '.dsh-side-chat-selection-actions',
      '.dsh-side-chat-selection-comment',
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
  const [selection, setSelection] = useState<ConversationSelection | null>(null)
  const captureGeneration = useRef(0)
  const mouseDownPoint = useRef<{ readonly x: number; readonly y: number } | null>(null)
  const annotationEditing = useRef(false)

  const capture = useCallback(async (): Promise<void> => {
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
      if (generation === captureGeneration.current) setSelection(null)
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
      if (generation === captureGeneration.current) setSelection(captured)
    } catch {
      if (generation === captureGeneration.current) setSelection(null)
    }
  }, [sessions])

  useEffect(() => {
    const onMouseDown = (event: MouseEvent): void => {
      if (!captureEvent(event)) {
        mouseDownPoint.current = null
        return
      }
      mouseDownPoint.current = { x: event.clientX, y: event.clientY }
      annotationEditing.current = false
      ++captureGeneration.current
      setSelection(null)
    }
    const onMouseUp = (event: MouseEvent): void => {
      const start = mouseDownPoint.current
      mouseDownPoint.current = null
      if (!captureEvent(event)) return
      const moved = start === null
        || Math.abs(event.clientX - start.x) > 2
        || Math.abs(event.clientY - start.y) > 2
      if (moved || event.detail > 1 || event.shiftKey) void capture()
    }
    const onSelectionChange = (): void => {
      if (annotationEditing.current) return
      const browserSelection = window.getSelection()
      if (browserSelection !== null && !browserSelection.isCollapsed) return
      ++captureGeneration.current
      setSelection(null)
    }
    const onKeyUp = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        ++captureGeneration.current
        setSelection(null)
        void controller.close()
        return
      }
      if (captureEvent(event)) void capture()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [capture, controller])

  useEffect(() => {
    ++captureGeneration.current
    annotationEditing.current = false
    setSelection(null)
  }, [currentSessionId])

  const askDisabledReason = state.phase === 'closed'
    ? undefined
    : 'Close the current Side Chat before starting another one.'
  const childFace = state.childSessionId === undefined ? undefined : sessions.face(state.childSessionId)
  const inheritedThroughSeq = state.inheritedThroughSeq
  const locale = navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' as const : 'en' as const
  const copySelection = (text: string): void => {
    void navigator.clipboard.writeText(text).catch(() => {
      sessions.notify({ kind: 'warning', text: 'Could not copy the selected text.' })
    })
  }

  return (
    <div className="dsh-side-chat-overlay">
      {selection !== null && (
        <SelectionActions
          selection={selection}
          annotationNumber={sessions.nextConversationAnnotationNumber()}
          {...askDisabledReason === undefined ? {} : { askDisabledReason }}
          onAddToChat={(captured, comment) => {
            try {
              if (sessions.addSelectionToConversation(captured, comment)) focusParentComposer()
              else sessions.notify({ kind: 'warning', text: 'Could not add the selection to the current chat.' })
            } catch {
              sessions.notify({ kind: 'warning', text: 'Could not add the selection to the current chat.' })
            }
            setSelection(null)
          }}
          onAnnotationEditorChange={(open) => { annotationEditing.current = open }}
          onMoreDetails={(captured) => {
            const opened = controller.openDraft({ selection: captured })
            if (!opened.ok) sessions.notify({ kind: 'warning', text: opened.error.message })
            else void controller.sendFirst(MORE_DETAILS_PROMPT)
            setSelection(null)
          }}
          onAskInSideChat={(captured) => {
            const opened = controller.openDraft({ selection: captured })
            if (!opened.ok) sessions.notify({ kind: 'warning', text: opened.error.message })
            setSelection(null)
          }}
          onDismiss={() => {
            annotationEditing.current = false
            setSelection(null)
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
                    {...state.selection === undefined ? {} : { selection: state.selection }}
                    locale={locale}
                    onCopySelection={copySelection}
                  />
                ),
              }}
          onDraftChange={(draft) => { controller.setDraft(draft) }}
          onFirstSend={(question) => controller.sendFirst(question)}
          onClose={() => controller.close()}
          onRetry={() => controller.retry()}
          onFocusParent={() => {
            if (state.parentSessionId !== undefined) void sessions.openSession(state.parentSessionId)
          }}
          onCopySelection={copySelection}
          onRemoveSelection={() => { controller.clearSelection() }}
        />
      )}
    </div>
  )
}
