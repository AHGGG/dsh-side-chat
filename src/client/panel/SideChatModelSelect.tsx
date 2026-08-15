import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'
import type { ModelProviderGroup } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import {
  IconCheckOutline16,
  IconChevronDownOutline14,
  IconChevronRightOutline14,
  IconWarningOutline16,
  Toast,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { SideChatModelSelection } from '../../shared/contracts.js'
import type { SideChatActionResult } from '../contracts.js'

interface ModelMessages {
  readonly selectModel: string
  readonly menu: string
  readonly model: string
  readonly effort: string
  readonly providerDefault: string
  readonly loading: string
  readonly reload: string
  readonly emptyModels: string
  readonly emptyEfforts: string
  readonly aria: (model: string, effort?: string) => string
  readonly operationFailed: (message: string) => string
  readonly groupFailed: (name: string, message: string) => string
}

const MODEL_MESSAGES: Readonly<Record<'en' | 'zh-CN', ModelMessages>> = {
  en: {
    selectModel: 'Select model',
    menu: 'Model and reasoning effort',
    model: 'Model',
    effort: 'Effort',
    providerDefault: 'Default',
    loading: 'Refreshing model list…',
    reload: 'Reload',
    emptyModels: 'No models available.',
    emptyEfforts: 'This model provides no reasoning effort levels.',
    aria: (model, effort) => effort === undefined
      ? `Select model, current ${model}`
      : `Select model, current ${model}, reasoning effort ${effort}`,
    operationFailed: message => `Model operation failed: ${message}`,
    groupFailed: (name, message) => `${name} failed to load: ${message}`,
  },
  'zh-CN': {
    selectModel: '选择模型',
    menu: '模型与推理等级',
    model: '模型',
    effort: '推理等级',
    providerDefault: 'Default',
    loading: '正在刷新模型列表…',
    reload: '重新加载',
    emptyModels: '没有可用的模型。',
    emptyEfforts: '当前模型未提供推理等级。',
    aria: (model, effort) => effort === undefined
      ? `选择模型，当前 ${model}`
      : `选择模型，当前 ${model}，推理等级 ${effort}`,
    operationFailed: message => `模型操作失败：${message}`,
    groupFailed: (name, message) => `${name} 加载失败：${message}`,
  },
}

type ModelCatalogModel = ModelProviderGroup['models'][number]

interface ModelChoice {
  readonly group: ModelProviderGroup
  readonly model: ModelCatalogModel
}

interface EffortChoice {
  readonly key: string
  readonly effort?: string | undefined
  readonly label: string
  readonly description?: string | undefined
}

export interface SideChatModelSelectProps {
  readonly directory: ModelDirectory
  readonly selection?: SideChatModelSelection | undefined
  readonly locked: boolean
  readonly locale?: 'en' | 'zh-CN'
  readonly onInitialize: (selection: SideChatModelSelection) => void
  readonly onSelect: (
    selection: SideChatModelSelection,
  ) => Promise<SideChatActionResult<SideChatModelSelection>>
}

function sameModel(
  selection: SideChatModelSelection | undefined,
  provider: string,
  model: string,
): boolean {
  return selection?.provider === provider && selection.model === model
}

/** Side Chat projection of DSH Web's native composer model selector. */
export function SideChatModelSelect({
  directory,
  selection,
  locked,
  locale = 'en',
  onInitialize,
  onSelect,
}: SideChatModelSelectProps) {
  const messages = MODEL_MESSAGES[locale]
  const state = useSyncExternalStore(
    listener => directory.store.subscribe(listener),
    () => directory.store.getSnapshot(),
    () => directory.store.getSnapshot(),
  )
  const [open, setOpen] = useState(false)
  const [pane, setPane] = useState<'root' | 'model' | 'effort'>('root')
  const [selecting, setSelecting] = useState(false)
  const [toast, setToast] = useState<{ readonly seq: number; readonly text: string } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const initialized = useRef(false)
  const operation = useRef(0)
  const toastSequence = useRef(0)
  const id = useId()

  const choices = useMemo<ModelChoice[]>(
    () => state.groups.flatMap(group => group.models.map(model => ({ group, model }))),
    [state.groups],
  )
  const current = selection ?? state.current ?? undefined
  const currentChoice = choices.find(choice => sameModel(current, choice.group.id, choice.model.id))
  const reasoning = currentChoice?.model.reasoning
  const effectiveEffort = current?.reasoningEffort ?? reasoning?.defaultEffort
  const effortLabel = reasoning === undefined
    ? undefined
    : effectiveEffort === undefined
      ? messages.providerDefault
      : reasoning.efforts.find(level => level.id === effectiveEffort)?.name ?? effectiveEffort
  const effortChoices = useMemo<EffortChoice[]>(() => reasoning === undefined
    ? []
    : [
        ...(reasoning.defaultEffort === undefined
          ? [{ key: 'provider-default', effort: undefined, label: messages.providerDefault }]
          : []),
        ...reasoning.efforts.map(effort => ({
          key: `effort:${effort.id}`,
          effort: effort.id,
          label: effort.name,
          ...(effort.description === undefined ? {} : { description: effort.description }),
        })),
      ], [messages.providerDefault, reasoning])
  const modelLabel = currentChoice?.model.name ?? messages.selectModel
  const triggerLabel = effortLabel === undefined ? modelLabel : `${modelLabel} · ${effortLabel}`

  const reload = (): void => {
    void directory.load().catch(() => undefined)
  }

  useEffect(() => { reload() }, [directory])

  useEffect(() => {
    if (initialized.current || selection !== undefined || state.current === null) return
    initialized.current = true
    onInitialize({
      provider: state.current.provider,
      model: state.current.model,
      ...(state.current.reasoningEffort === undefined
        ? {}
        : { reasoningEffort: state.current.reasoningEffort }),
    })
  }, [onInitialize, selection, state.current])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOutside)
    return () => { document.removeEventListener('mousedown', closeOutside) }
  }, [open])

  const show = (): void => {
    setPane('root')
    setOpen(true)
    reload()
  }
  const close = (restoreFocus = false): void => {
    setOpen(false)
    setPane('root')
    if (restoreFocus) queueMicrotask(() => { triggerRef.current?.focus() })
  }
  const moveFocus = (offset: number): void => {
    const items = itemRefs.current.filter((item): item is HTMLButtonElement => item !== null)
    if (items.length === 0) return
    const active = items.findIndex(item => item === document.activeElement)
    items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      if (pane !== 'root') setPane('root')
      else close(true)
      return
    }
    if (!open || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return
    event.preventDefault()
    moveFocus(event.key === 'ArrowDown' ? 1 : -1)
  }
  const onBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return
    close()
  }
  const submitSelection = async (next: SideChatModelSelection): Promise<void> => {
    const generation = ++operation.current
    setSelecting(true)
    const result = await onSelect(next)
    if (generation !== operation.current) return
    setSelecting(false)
    if (!result.ok) {
      toastSequence.current += 1
      setToast({
        seq: toastSequence.current,
        text: messages.operationFailed(result.error.message),
      })
      return
    }
    close(true)
  }
  const chooseModel = (group: ModelProviderGroup, model: ModelCatalogModel): void => {
    if (sameModel(current, group.id, model.id)) {
      close(true)
      return
    }
    void submitSelection({
      provider: group.id,
      model: model.id,
      ...(model.reasoning?.defaultEffort === undefined
        ? {}
        : { reasoningEffort: model.reasoning.defaultEffort }),
    })
  }
  const chooseEffort = (effort: string | undefined): void => {
    if (current === undefined) return
    if (effectiveEffort === effort) {
      close(true)
      return
    }
    void submitSelection({
      provider: current.provider,
      model: current.model,
      ...(effort === undefined ? {} : { reasoningEffort: effort }),
    })
  }

  itemRefs.current = []
  let itemIndex = 0
  const itemRef = () => {
    const index = itemIndex++
    return (node: HTMLButtonElement | null): void => { itemRefs.current[index] = node }
  }

  return (
    <div
      ref={rootRef}
      className="dsh-side-chat-model-root"
      data-side-chat-model-select=""
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        className="dsh-side-chat-model-trigger"
        aria-label={messages.aria(modelLabel, effortLabel)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        title={triggerLabel}
        disabled={locked}
        onClick={() => { if (open) close(); else show() }}
      >
        <span className="dsh-side-chat-model-trigger-label">{modelLabel}</span>
        {effortLabel !== undefined && (
          <span className="dsh-side-chat-model-trigger-effort">{effortLabel}</span>
        )}
        <IconChevronDownOutline14
          className={`dsh-side-chat-model-chevron${open ? ' dsh-side-chat-model-chevron-open' : ''}`}
        />
      </button>

      {open && (
        <div
          id={`${id}-menu`}
          className="dsh-side-chat-model-menu"
          role="menu"
          aria-label={messages.menu}
          aria-busy={state.status === 'loading' || selecting}
        >
          {pane === 'root' && (
            <>
              <button
                ref={itemRef()}
                type="button"
                role="menuitem"
                className="dsh-side-chat-model-cell"
                onClick={() => { setPane('model') }}
              >
                <span className="dsh-side-chat-model-cell-label">{messages.model}</span>
                <span className="dsh-side-chat-model-cell-value">{modelLabel}</span>
                <IconChevronRightOutline14 className="dsh-side-chat-model-cell-chevron" />
              </button>
              {reasoning !== undefined && (
                <button
                  ref={itemRef()}
                  type="button"
                  role="menuitem"
                  className="dsh-side-chat-model-cell"
                  onClick={() => { setPane('effort') }}
                >
                  <span className="dsh-side-chat-model-cell-label">{messages.effort}</span>
                  <span className="dsh-side-chat-model-cell-value">{effortLabel}</span>
                  <IconChevronRightOutline14 className="dsh-side-chat-model-cell-chevron" />
                </button>
              )}
            </>
          )}

          {pane === 'model' && (
            <>
              {state.status === 'loading' && (
                <div className="dsh-side-chat-model-status">{messages.loading}</div>
              )}
              {state.error !== null && (
                <div className="dsh-side-chat-model-error" role="alert">
                  <span>{messages.operationFailed(state.error)}</span>
                  <button type="button" className="dsh-side-chat-model-retry" onClick={reload}>
                    {messages.reload}
                  </button>
                </div>
              )}
              {state.failures.map(failure => (
                <div key={failure.id} className="dsh-side-chat-model-warning">
                  <span>{messages.groupFailed(failure.name, failure.message)}</span>
                  <button type="button" className="dsh-side-chat-model-retry" onClick={reload}>
                    {messages.reload}
                  </button>
                </div>
              ))}
              <div className="dsh-side-chat-model-groups scrollable">
                {state.groups.map(group => {
                  const headingId = `${id}-${group.id}`
                  return (
                    <section
                      key={group.id}
                      role="group"
                      aria-labelledby={headingId}
                      className="dsh-side-chat-model-group"
                    >
                      <div id={headingId} className="dsh-side-chat-model-group-title">{group.name}</div>
                      {group.models.map(model => {
                        const selected = sameModel(current, group.id, model.id)
                        return (
                          <button
                            key={model.id}
                            ref={itemRef()}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selected}
                            className={`dsh-side-chat-model-option${selected ? ' dsh-side-chat-model-selected' : ''}`}
                            title={model.name}
                            disabled={selecting}
                            onClick={() => { chooseModel(group, model) }}
                          >
                            <span className="dsh-side-chat-model-option-copy">
                              <span className="dsh-side-chat-model-name">{model.name}</span>
                              {model.description !== undefined && (
                                <span className="dsh-side-chat-model-description">{model.description}</span>
                              )}
                            </span>
                            <span className="dsh-side-chat-model-check">
                              {selected ? <IconCheckOutline16 /> : null}
                            </span>
                          </button>
                        )
                      })}
                    </section>
                  )
                })}
              </div>
              {state.status === 'ready' && choices.length === 0 && (
                <div className="dsh-side-chat-model-empty">{messages.emptyModels}</div>
              )}
            </>
          )}

          {pane === 'effort' && (
            effortChoices.length === 0
              ? <div className="dsh-side-chat-model-empty">{messages.emptyEfforts}</div>
              : effortChoices.map(level => {
                  const selected = effectiveEffort === level.effort
                  return (
                    <button
                      key={level.key}
                      ref={itemRef()}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      className={`dsh-side-chat-model-option${selected ? ' dsh-side-chat-model-selected' : ''}`}
                      disabled={selecting}
                      onClick={() => { chooseEffort(level.effort) }}
                    >
                      <span className="dsh-side-chat-model-option-copy">
                        <span className="dsh-side-chat-model-name">{level.label}</span>
                        {level.description !== undefined && (
                          <span className="dsh-side-chat-model-description">{level.description}</span>
                        )}
                      </span>
                      <span className="dsh-side-chat-model-check">
                        {selected ? <IconCheckOutline16 /> : null}
                      </span>
                    </button>
                  )
                })
          )}
        </div>
      )}
      {toast !== null && (
        <Toast
          key={toast.seq}
          text={toast.text}
          icon={<IconWarningOutline16 />}
          anchor={rootRef.current?.closest<HTMLElement>('[data-composer-card]') ?? null}
          onDone={() => { setToast(null) }}
        />
      )}
    </div>
  )
}
