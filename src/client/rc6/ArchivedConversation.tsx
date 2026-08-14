import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react'
import type {
  AssistantBlock,
  ConversationNode,
  PendingInteraction,
  QueuedMessage,
  RunningToolCall,
  SessionFace,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { ContentBlock } from '@deepseek-ai/dsh-api-remotes/client'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConversationSelection } from '../../shared/contracts.js'
import type { SideChatController } from '../side-chat-controller.js'
import type { SideChatQuestionAnswer } from '../contracts.js'
import { SIDE_CHAT_MESSAGES } from '../panel/messages.js'
import { SelectionQuote } from '../panel/SelectionQuote.js'
import { SendIcon } from '../panel/SendIcon.js'
import { StopIcon } from '../panel/StopIcon.js'
import { useAutoGrowingTextarea } from '../panel/use-auto-growing-textarea.js'

function stringify(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function contentText(content: readonly ContentBlock[]): string {
  return content.map((block) => {
    if (block.type === 'text' || block.type === 'reasoning') return block.text
    if (block.type === 'image') return '[Image]'
    if (block.type === 'tool-call') return `${block.name}(${block.arguments})`
    if (block.type === 'tool-result') return contentText(block.content)
    return stringify(block)
  }).filter(Boolean).join('\n')
}

function toolOutputText(content: readonly ContentBlock[]): string {
  const text = contentText(content)
  const fileEnvelope = /^<path>[\s\S]*?<\/path>\s*<type>[\s\S]*?<\/type>\s*<content>\s*\n?([\s\S]*?)\n?<\/content>\s*$/u.exec(text)
  return fileEnvelope?.[1]?.trimEnd() ?? text
}

function firstSideChatQuestion(text: string): string {
  const match = /<user_question>([\s\S]*?)<\/user_question>/u.exec(text)
  return match?.[1]?.trim() ?? text
}

type ToolResultNode = Extract<ConversationNode, { kind: 'tool-result' }>
type ToolState = 'pending' | 'running' | 'success' | 'error' | 'interrupted'

function parsedToolArguments(argsRaw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(argsRaw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

function displayToolName(name: string): string {
  if (name.toLowerCase() === 'pwsh') return 'Pwsh'
  return name
    .split(/[-_\s]+/u)
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function toolSummary(name: string, argsRaw: string): string | null {
  const args = parsedToolArguments(argsRaw)
  if (args === null) return null
  const normalizedName = name.toLowerCase()
  const candidates = normalizedName === 'pwsh'
    ? ['description', 'command']
    : normalizedName === 'grep'
      ? ['pattern', 'path']
      : ['file_path', 'path', 'pattern', 'query', 'url', 'command', 'description']
  for (const key of candidates) {
    const value = args[key]
    if (typeof value !== 'string' || value.trim().length === 0) continue
    if (key === 'file_path') {
      const segments = value.split(/[\\/]/u)
      return segments.at(-1) ?? value
    }
    return value
  }
  return null
}

function formattedToolArguments(argsRaw: string): string {
  try {
    return JSON.stringify(JSON.parse(argsRaw), null, 2)
  } catch {
    return argsRaw
  }
}

function ToolCard({
  callId,
  name,
  argsRaw,
  state,
  output,
}: {
  readonly callId: string
  readonly name: string
  readonly argsRaw: string
  readonly state: ToolState
  readonly output?: string
}) {
  const [expanded, setExpanded] = useState(state === 'error')
  useEffect(() => {
    if (state === 'error') setExpanded(true)
  }, [state])
  const summary = toolSummary(name, argsRaw)
  const label = state === 'running'
    ? `Running tool · ${displayToolName(name)}`
    : state === 'error'
      ? `Tool failed · ${displayToolName(name)}`
      : state === 'interrupted'
        ? `Tool stopped · ${displayToolName(name)}`
        : `Tool · ${displayToolName(name)}`
  return (
    <section
      className="dsh-side-chat-tool"
      data-call-id={callId}
      data-state={state}
      data-expanded={expanded || undefined}
    >
      <button
        type="button"
        className="dsh-side-chat-tool-toggle"
        aria-label={label}
        aria-expanded={expanded}
        onClick={() => { setExpanded(current => !current) }}
      >
        <span className="dsh-side-chat-tool-status" aria-hidden="true" />
        <span className="dsh-side-chat-tool-name">{displayToolName(name)}</span>
        {summary !== null && <span className="dsh-side-chat-tool-summary">{summary}</span>}
        <span className="dsh-side-chat-tool-state">{state === 'running' ? 'Running' : state === 'error' ? 'Failed' : state === 'interrupted' ? 'Stopped' : ''}</span>
      </button>
      {expanded && (
        <div className="dsh-side-chat-tool-body">
          <section>
            <strong>Input</strong>
            <pre>{formattedToolArguments(argsRaw)}</pre>
          </section>
          {output !== undefined && (
            <section>
              <strong>Output</strong>
              <pre>{output}</pre>
            </section>
          )}
        </div>
      )}
    </section>
  )
}

function ToolResultCard({ node }: { readonly node: ToolResultNode }) {
  const output = toolOutputText(node.content)
  const errorIdentity = `${node.error?.name ?? ''} ${node.error?.code ?? ''} ${output}`
  const state: ToolState = node.isError
    ? /\b(?:aborted|cancelled|canceled)\b/iu.test(errorIdentity) ? 'interrupted' : 'error'
    : 'success'
  return (
    <ToolCard
      callId={node.callId}
      name={node.call?.name ?? node.callId}
      argsRaw={node.call?.argsRaw ?? '{}'}
      state={state}
      output={output}
    />
  )
}

function RunningToolCard({ call }: { readonly call: RunningToolCall }) {
  return <ToolCard callId={call.callId} name={call.name} argsRaw={call.argsRaw} state="running" />
}

function AssistantBlocks({ blocks, streaming = false, projectedToolCallIds, unprojectedToolState = 'pending' }: {
  readonly blocks: readonly AssistantBlock[]
  readonly streaming?: boolean
  readonly projectedToolCallIds: ReadonlySet<string>
  readonly unprojectedToolState?: Extract<ToolState, 'pending' | 'running' | 'interrupted'>
}) {
  return <>{blocks.map((block, index) => {
    const key = `${block.kind}-${String(index)}`
    if (block.kind === 'text') return <MarkdownText key={key} text={block.text} streaming={streaming} />
    if (block.kind === 'reasoning') {
      return <details key={key} className="dsh-side-chat-reasoning"><summary>Reasoning</summary><pre>{block.text}</pre></details>
    }
    if (block.kind === 'image') return <div key={key}>[Image attachment]</div>
    if (block.kind === 'tool-call') {
      if (projectedToolCallIds.has(block.callId)) return null
      return (
        <ToolCard
          key={key}
          callId={block.callId}
          name={block.name}
          argsRaw={block.argsRaw}
          state={unprojectedToolState}
        />
      )
    }
    return <pre key={key}>{stringify(block.block)}</pre>
  })}</>
}

function MessageRow({ node, projectedToolCallIds }: {
  readonly node: ConversationNode
  readonly projectedToolCallIds: ReadonlySet<string>
}) {
  if (node.kind === 'user' || node.kind === 'steering') {
    return (
      <article className="dsh-side-chat-message" data-role="user">
        <span className="dsh-side-chat-message-role">You</span>
        <div className="dsh-side-chat-message-text">{firstSideChatQuestion(contentText(node.content))}</div>
      </article>
    )
  }
  if (node.kind === 'assistant') {
    return (
      <article className="dsh-side-chat-message" data-role="assistant">
        <span className="dsh-side-chat-message-role">Assistant</span>
        <AssistantBlocks
          blocks={node.blocks}
          projectedToolCallIds={projectedToolCallIds}
          unprojectedToolState={node.interrupted === true ? 'interrupted' : 'pending'}
        />
        {node.interrupted === true && <span className="dsh-side-chat-message-note">Stopped</span>}
      </article>
    )
  }
  if (node.kind === 'context') {
    return (
      <details className="dsh-side-chat-message dsh-side-chat-context-message">
        <summary>Context · {node.provenance.label ?? node.provenance.role}</summary>
        <pre>{contentText(node.content)}</pre>
      </details>
    )
  }
  if (node.kind === 'tool-result') {
    return <ToolResultCard node={node} />
  }
  if (node.kind === 'turn-error') {
    return <div className="dsh-side-chat-turn-notice" role="alert">{node.message}</div>
  }
  if (node.kind === 'turn-max-tokens') {
    return <div className="dsh-side-chat-turn-notice">The response reached its output-token limit.</div>
  }
  if (node.kind === 'model-retry') {
    return <div className="dsh-side-chat-turn-notice">Model retry: {node.retryState}</div>
  }
  if (node.kind === 'command') {
    return <div className="dsh-side-chat-turn-notice">/{node.name ?? 'command'} {node.outcome?.text ?? ''}</div>
  }
  if (node.kind === 'compaction') {
    return <details className="dsh-side-chat-turn-notice"><summary>Context compacted</summary><pre>{node.summary}</pre></details>
  }
  return <details className="dsh-side-chat-turn-notice"><summary>{node.type}</summary><pre>{stringify(node.data)}</pre></details>
}

function ApprovalCard({
  wait,
  onRespond,
}: {
  readonly wait: Extract<PendingInteraction, { kind: 'approval' }>
  readonly onRespond: (decision: 'approve' | 'decline') => void
}) {
  return (
    <section className="dsh-side-chat-interaction" aria-label="Tool approval required">
      <strong>Allow tool: {wait.payload.toolName}?</strong>
      {wait.payload.reason !== undefined && <p>{wait.payload.reason}</p>}
      <div className="dsh-side-chat-interaction-actions">
        <button type="button" onClick={() => { onRespond('decline') }}>Decline</button>
        <button type="button" onClick={() => { onRespond('approve') }}>Allow once</button>
      </div>
    </section>
  )
}

interface DraftAnswer {
  readonly selected: readonly string[]
  readonly custom: string
}

function QuestionCard({
  wait,
  onRespond,
}: {
  readonly wait: Extract<PendingInteraction, { kind: 'question' }>
  readonly onRespond: (answer: SideChatQuestionAnswer | null) => void
}) {
  const questions = wait.payload.questions
  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>(() => Object.fromEntries(
    questions.map(question => [question.id, { selected: [], custom: '' }]),
  ))
  const update = (id: string, answer: DraftAnswer): void => {
    setAnswers(current => ({ ...current, [id]: answer }))
  }
  const submit = (): void => {
    onRespond({
      answers: questions.map((question) => {
        const answer = answers[question.id] ?? { selected: [], custom: '' }
        const custom = answer.custom.trim()
        return {
          id: question.id,
          selected: [...answer.selected],
          ...(custom.length === 0 ? {} : { custom }),
        }
      }),
    })
  }
  return (
    <section className="dsh-side-chat-interaction" aria-label="Assistant question">
      {questions.map((question) => {
        const answer = answers[question.id] ?? { selected: [], custom: '' }
        return (
          <fieldset key={question.id}>
            <legend>{question.header === undefined ? question.question : `${question.header} · ${question.question}`}</legend>
            {question.detail !== undefined && <p>{question.detail}</p>}
            {question.options?.map(option => (
              <label key={option.label} className="dsh-side-chat-question-option">
                <input
                  type={question.multiSelect === true ? 'checkbox' : 'radio'}
                  name={`${wait.key}-${question.id}`}
                  checked={answer.selected.includes(option.label)}
                  onChange={(event) => {
                    const selected = question.multiSelect === true
                      ? event.target.checked
                        ? [...answer.selected, option.label]
                        : answer.selected.filter(value => value !== option.label)
                      : [option.label]
                    update(question.id, { ...answer, selected })
                  }}
                />
                <span><strong>{option.label}</strong>{option.description === undefined ? '' : ` — ${option.description}`}</span>
              </label>
            ))}
            <textarea
              rows={2}
              value={answer.custom}
              placeholder={question.options === undefined ? 'Your answer' : 'Other (optional)'}
              onChange={(event) => { update(question.id, { ...answer, custom: event.target.value }) }}
            />
          </fieldset>
        )
      })}
      <div className="dsh-side-chat-interaction-actions">
        <button type="button" onClick={() => { onRespond(null) }}>Cancel</button>
        <button type="button" onClick={submit}>Submit</button>
      </div>
    </section>
  )
}

function PendingCards({
  pending,
  controller,
}: {
  readonly pending: readonly PendingInteraction[]
  readonly controller: SideChatController
}) {
  return <>{pending.map((wait): ReactNode => wait.kind === 'approval'
    ? (
        <ApprovalCard
          key={wait.key}
          wait={wait}
          onRespond={(decision) => { void controller.respondApproval(wait.key, decision) }}
        />
      )
    : (
        <QuestionCard
          key={wait.key}
          wait={wait}
          onRespond={(answer) => { void controller.respondQuestion(wait.key, answer) }}
        />
      ))}</>
}

function QueueRows({ queue, controller }: { readonly queue: readonly QueuedMessage[]; readonly controller: SideChatController }) {
  if (queue.length === 0) return null
  return (
    <section className="dsh-side-chat-queue" aria-label="Queued Side Chat messages">
      <strong>Queued</strong>
      {queue.filter(item => item.placement === 'queued').map(item => (
        <div key={item.id}>
          <span>{item.preview}</span>
          <button type="button" onClick={() => { void controller.updateQueue(item.id, { kind: 'remove' }) }}>Remove</button>
        </div>
      ))}
    </section>
  )
}

/** Functional rc.6 conversation surface bound to a non-current child Session. */
export function ArchivedConversation({
  face,
  inheritedThroughSeq,
  controller,
  selection,
  locale = 'en',
}: {
  readonly face: SessionFace
  readonly inheritedThroughSeq: number
  readonly controller: SideChatController
  readonly selection?: ConversationSelection
  readonly locale?: 'en' | 'zh-CN'
}) {
  const snapshot = useSyncExternalStore(
    listener => face.subscribe(listener),
    () => face.getSnapshot(),
    () => face.getSnapshot(),
  )
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const draftRef = useAutoGrowingTextarea(draft)
  const scrollRef = useRef<HTMLDivElement>(null)
  const nodes = useMemo(
    () => snapshot.nodes.filter(node => node.seq > inheritedThroughSeq),
    [snapshot.nodes, inheritedThroughSeq],
  )
  const runningCalls = snapshot.runningCalls ?? []
  const projectedToolCallIds = useMemo(() => new Set([
    ...nodes.filter((node): node is ToolResultNode => node.kind === 'tool-result').map(node => node.callId),
    ...runningCalls.map(call => call.callId),
  ]), [nodes, runningCalls])
  const annotatedUserNode = selection === undefined
    ? undefined
    : nodes.find(node => node.kind === 'user' || node.kind === 'steering')
  useEffect(() => {
    const element = scrollRef.current
    if (element !== null) element.scrollTop = element.scrollHeight
  }, [nodes.length, snapshot.partial, snapshot.pending.length, snapshot.queue.length])

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const text = draft.trim()
    if (text.length === 0 || sending) return
    setSending(true)
    try {
      const result = await controller.send(text, snapshot.running ? 'steer' : 'queue')
      if (result.ok) setDraft('')
    } finally {
      setSending(false)
    }
  }

  if (snapshot.openState === 'cold' || snapshot.openState === 'loading') {
    return <div className="dsh-side-chat-loading">Loading Side Chat…</div>
  }
  if (snapshot.openState === 'error') {
    return <div className="dsh-side-chat-loading" role="alert">Could not load Side Chat history.</div>
  }
  return (
    <div className="dsh-side-chat-conversation">
      <div ref={scrollRef} className="dsh-side-chat-transcript" aria-live="polite">
        {nodes.map(node => selection !== undefined && node === annotatedUserNode
          ? (
              <div key={`${node.kind}-${String(node.seq)}`} className="dsh-side-chat-annotated-user-message">
                <SelectionQuote
                  selections={[selection]}
                  messages={SIDE_CHAT_MESSAGES[locale]}
                />
                <MessageRow node={node} projectedToolCallIds={projectedToolCallIds} />
              </div>
            )
          : <MessageRow key={`${node.kind}-${String(node.seq)}`} node={node} projectedToolCallIds={projectedToolCallIds} />)}
        {snapshot.partial !== null && (
          <article className="dsh-side-chat-message" data-role="assistant">
            <span className="dsh-side-chat-message-role">Assistant</span>
            <AssistantBlocks
              blocks={snapshot.partial.blocks}
              streaming
              projectedToolCallIds={projectedToolCallIds}
              unprojectedToolState="running"
            />
          </article>
        )}
        {runningCalls.map(call => (
          <RunningToolCard key={call.callId} call={call} />
        ))}
        <PendingCards pending={snapshot.pending} controller={controller} />
        <QueueRows queue={snapshot.queue} controller={controller} />
        {snapshot.promptError !== null && <div className="dsh-side-chat-turn-notice" role="alert">{snapshot.promptError.error.message}</div>}
      </div>
      <form className="dsh-side-chat-composer" onSubmit={(event) => { void submit(event) }}>
        <textarea
          ref={draftRef}
          rows={1}
          value={draft}
          placeholder={snapshot.running ? 'Steer the current response' : 'Reply in Side Chat'}
          onChange={(event) => { setDraft(event.target.value) }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <div>
          {snapshot.running ? (
            <button
              type="button"
              className="dsh-side-chat-stop-button"
              aria-label="Stop generating"
              title="Stop generating"
              onClick={() => { void controller.cancel() }}
            >
              <StopIcon />
            </button>
          ) : (
            <button
              type="submit"
              className="dsh-side-chat-send-button"
              aria-label="Send"
              disabled={sending || draft.trim().length === 0}
            >
              <SendIcon />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
