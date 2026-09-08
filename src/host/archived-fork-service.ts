import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import { installModelSelection, type Agent, type AgentHandle, type AgentOptions, type ModelSelection, type ModelSelectionRef } from '@deepseek-ai/dsh-agent'
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import { foldRequestHeader, SessionId as dshSessionId } from '@deepseek-ai/dsh-session'
import type { SessionEvent, SessionHeader } from '@deepseek-ai/dsh-session/types'
import type {
  CloseSideChatRequest,
  CloseSideChatValue,
  CreateSideChatRequest,
  CreateSideChatValue,
  SelectSideChatModelRequest,
  SelectSideChatModelValue,
  SessionId,
  SideChatModelSelection,
  SideChatResult,
} from '../shared/contracts.js'
import { SessionId as clientSessionId } from '../shared/contracts.js'
import type { SideChatErrorCode } from '../shared/error-codes.js'

interface ArchivedForkRecord {
  readonly parentSessionId: SessionId
  readonly childSessionId: SessionId
  readonly handle: AgentHandle
  readonly selection: ModelSelectionRef
  closeOperation?: Promise<SideChatResult<CloseSideChatValue>>
}

interface ParentSource {
  readonly id: ReturnType<typeof dshSessionId>
  readonly header: SessionHeader
  readonly events: readonly SessionEvent[]
  readonly api: 'legacy' | 'split'
  readonly live?: Agent
}

interface BoundaryCut {
  readonly boundarySeq: number
  readonly cut: number
  readonly inheritedThroughSeq: number
}

interface ForkComposition {
  readonly agentPreset?: string
  readonly setup?: (childCtx: Context) => void | Promise<void>
}

interface CompatibleLiveSession {
  readonly header: SessionHeader
  readonly events?: readonly SessionEvent[]
  snapshotEvents?: () => readonly SessionEvent[]
}

interface CompatibleSessionInspection {
  readonly meta: SessionHeader
  readonly events: readonly SessionEvent[]
  readonly inheritedEventCount?: number
}

interface CompatibleSessionPersistence {
  inspect(id: ReturnType<typeof dshSessionId>): Promise<CompatibleSessionInspection>
}

function failure<T>(code: SideChatErrorCode, message: string, recoverable = false): SideChatResult<T> {
  return { ok: false, error: { code, message, recoverable } }
}

function wireSelection(selection: ModelSelection): SideChatModelSelection
function wireSelection(selection: undefined): undefined
function wireSelection(selection: ModelSelection | undefined): SideChatModelSelection | undefined
function wireSelection(selection: ModelSelection | undefined): SideChatModelSelection | undefined {
  if (selection === undefined) return undefined
  return {
    provider: selection.provider,
    model: selection.model,
    ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: String(selection.reasoningEffort) }),
  }
}

function persistenceNotFound(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const candidate = error as Error & { readonly code?: unknown }
  return candidate.name === 'SessionPersistenceNotFoundError'
    || candidate.code === 'session/not-found'
    || /^session ["'].+["'] not found$/iu.test(candidate.message)
}

function sessionPreset(header: SessionHeader, events: readonly SessionEvent[]): string | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type !== 'agent-preset/selected') continue
    const value = (event.data as { readonly agentPreset?: unknown }).agentPreset
    if (typeof value === 'string' && value.length > 0) return value
  }
  return header.agentPreset
}

function inheritedSelection(source: ParentSource): ModelSelection | undefined {
  const config = (source.live?.session.requestHeader() ?? foldRequestHeader(source.events))?.config
  if (config !== undefined) {
    return {
      provider: config.provider,
      model: config.model,
      ...(config.reasoningEffort === undefined ? {} : { reasoningEffort: config.reasoningEffort }),
    }
  }
  const provider = source.live?.options.provider
  const model = source.live?.options.model
  return provider === undefined || model === undefined ? undefined : { provider, model }
}

function boundaryCut(events: readonly SessionEvent[], atSeq: number): BoundaryCut | undefined {
  const anchor = Math.floor(atSeq)
  const lastSeq = events.at(-1)?.seq ?? -1
  let boundaryIndex = events.findIndex(event => event.type === 'turn/end' && event.seq >= anchor)
  if (boundaryIndex < 0 && anchor > lastSeq) {
    boundaryIndex = events.findLastIndex(event => event.type === 'turn/end')
  }
  const boundary = events[boundaryIndex]
  if (boundaryIndex < 0 || boundary?.type !== 'turn/end') return undefined

  let cut = boundaryIndex + 1
  while (cut < events.length && events[cut]?.type !== 'turn/start') cut += 1
  return {
    boundarySeq: boundary.seq,
    cut,
    inheritedThroughSeq: events[cut - 1]?.seq ?? boundary.seq,
  }
}

/** Stock rc.6 implementation backed by one ordinary archived Session fork. */
export class ArchivedForkSideChatService {
  private readonly records = new Map<SessionId, ArchivedForkRecord>()
  private readonly pendingCreates = new Set<Promise<SideChatResult<CreateSideChatValue>>>()
  private disposed = false

  constructor(private readonly ctx: Context) {}

  async create(request: CreateSideChatRequest): Promise<SideChatResult<CreateSideChatValue>> {
    if (this.disposed) return failure('transport_error', 'The Side Chat service is unloading.', true)
    const operation = this.createFork(request)
    this.pendingCreates.add(operation)
    try {
      return await operation
    } finally {
      this.pendingCreates.delete(operation)
    }
  }

  async selectModel(request: SelectSideChatModelRequest): Promise<SideChatResult<SelectSideChatModelValue>> {
    const record = this.records.get(request.childSessionId)
    if (record === undefined) return failure('side_chat_not_found', 'The Side Chat no longer exists.')
    if (this.disposed || record.closeOperation !== undefined) {
      return failure('side_chat_model_failed', 'The Side Chat is closing.', true)
    }
    try {
      const selected = await this.resolveModelSelection(request)
      if (this.records.get(request.childSessionId) !== record || this.disposed) {
        return failure('side_chat_not_found', 'The Side Chat no longer exists.')
      }
      if (record.closeOperation !== undefined) {
        return failure('side_chat_model_failed', 'The Side Chat is closing.', true)
      }
      record.selection.current = selected
      return { ok: true, value: { selected: wireSelection(selected) } }
    } catch (error) {
      return failure(
        'side_chat_model_failed',
        error instanceof Error ? error.message : `The model could not be selected: ${String(error)}`,
        true,
      )
    }
  }

  async close(request: CloseSideChatRequest): Promise<SideChatResult<CloseSideChatValue>> {
    const record = this.records.get(request.childSessionId)
    if (record === undefined) return failure('side_chat_not_found', 'The Side Chat no longer exists.')
    const operation = record.closeOperation ?? this.closeRecord(record)
    record.closeOperation = operation
    const result = await operation
    if (!result.ok && record.closeOperation === operation) delete record.closeOperation
    return result
  }

  async dispose(): Promise<void> {
    if (this.disposed) return
    this.disposed = true
    await Promise.allSettled(this.pendingCreates)
    await Promise.allSettled([...this.records.values()].map(async (record) => {
      if (record.closeOperation !== undefined) await record.closeOperation
      if (this.records.has(record.childSessionId)) await this.closeRecord(record)
    }))
  }

  private async createFork(request: CreateSideChatRequest): Promise<SideChatResult<CreateSideChatValue>> {
    let source: ParentSource
    try {
      source = await this.readParent(request.parentSessionId)
    } catch (error) {
      if (persistenceNotFound(error)) {
        return failure('parent_session_missing', 'The parent session could not be found.')
      }
      this.ctx.logger.warn(`archived Side Chat source read failed: ${String(error)}`)
      return failure('internal_error', 'The parent session could not be read.', true)
    }

    const boundary = boundaryCut(source.events, request.atSeq)
    if (boundary === undefined) {
      return failure('fork_unavailable', 'Wait for the selected response to finish before opening a Side Chat.', true)
    }

    let selected: ModelSelection | undefined
    try {
      selected = request.modelSelection === undefined
        ? inheritedSelection(source)
        : await this.resolveModelSelection(request.modelSelection)
    } catch (error) {
      return failure(
        'side_chat_model_failed',
        error instanceof Error ? error.message : `The model could not be selected: ${String(error)}`,
        true,
      )
    }

    const childDshId = dshSessionId(`session-${randomUUID()}`)
    const childSessionId = clientSessionId(childDshId)
    const selection: ModelSelectionRef = { current: selected, assembled: undefined }
    let handle: AgentHandle | undefined
    try {
      const composition = await this.resolveComposition(source)
      const agentOptions: AgentOptions = source.live === undefined ? {} : { ...source.live.options }
      const setup = async (childCtx: Context): Promise<void> => {
        installModelSelection(childCtx, selection)
        if (composition.setup !== undefined) await composition.setup(childCtx)
      }
      const seed = source.events.slice(0, boundary.cut)
      const commonMeta = {
        ...(source.header.cwd === undefined ? {} : { cwd: source.header.cwd }),
        parentSession: source.id,
        ...(composition.agentPreset === undefined ? {} : { agentPreset: composition.agentPreset }),
      }
      const createOptions = source.api === 'split'
        ? {
            sessionId: childDshId,
            seed,
            inheritedEventCount: boundary.cut,
            meta: { ...commonMeta, isSeeded: true as const },
            agentOptions,
            setup,
          }
        : {
            sessionId: childDshId,
            seed,
            meta: { ...commonMeta, seedLength: boundary.cut },
            agentOptions,
            setup,
          }
      handle = await this.ctx.agents.create(
        createOptions as Parameters<typeof this.ctx.agents.create>[0],
      )
      const cwd = source.header.cwd
      const workspace = cwd === undefined ? undefined : await this.ctx.workspaceRegistry.resolveByPath(cwd)
      await workspace?.attachSession(childDshId)
    } catch (error) {
      if (handle !== undefined) await this.archiveAndDispose(childSessionId, handle)
      this.ctx.logger.warn(`archived Side Chat fork failed: ${String(error)}`)
      return failure('internal_error', 'The Side Chat fork could not be created.', true)
    }

    if (this.disposed) {
      await this.archiveAndDispose(childSessionId, handle)
      return failure('transport_error', 'The Side Chat service unloaded while creating the fork.', true)
    }

    this.records.set(childSessionId, {
      parentSessionId: request.parentSessionId,
      childSessionId,
      handle,
      selection,
    })
    const modelSelection = wireSelection(selected)
    return {
      ok: true,
      value: {
        parentSessionId: request.parentSessionId,
        childSessionId,
        boundarySeq: boundary.boundarySeq,
        inheritedThroughSeq: boundary.inheritedThroughSeq,
        ...(modelSelection === undefined ? {} : { modelSelection }),
      },
    }
  }

  private async resolveModelSelection(selection: SideChatModelSelection): Promise<ModelSelection> {
    const resolved = await this.ctx.llm.resolveCallConfig({
      provider: selection.provider,
      model: selection.model,
      ...(selection.reasoningEffort === undefined
        ? {}
        : { reasoningEffort: ReasoningEffortId(selection.reasoningEffort) }),
    })
    return {
      provider: resolved.provider,
      model: resolved.model,
      ...(resolved.reasoningEffort === undefined ? {} : { reasoningEffort: resolved.reasoningEffort }),
    }
  }

  private async readParent(parentSessionId: SessionId): Promise<ParentSource> {
    const id = dshSessionId(parentSessionId)
    const live = this.ctx.agents.get(id)
    if (live !== undefined) {
      const session = live.session as unknown as CompatibleLiveSession
      const snapshotEvents = session.snapshotEvents
      const split = typeof snapshotEvents === 'function'
      const events = split
        ? snapshotEvents.call(session)
        : session.events ?? []
      return {
        id,
        header: session.header,
        events: [...events],
        api: split ? 'split' : 'legacy',
        live,
      }
    }
    const persistence = this.ctx.get('sessionPersistence') as unknown as
      | CompatibleSessionPersistence
      | undefined
    if (persistence === undefined) throw new Error('Session persistence is unavailable.')
    const inspected = await persistence.inspect(id)
    return {
      id: inspected.meta.id,
      header: inspected.meta,
      events: inspected.events,
      api: inspected.inheritedEventCount === undefined ? 'legacy' : 'split',
    }
  }

  private async resolveComposition(source: ParentSource): Promise<ForkComposition> {
    const presets = this.ctx.get('agentPresets')
    if (presets === undefined) return {}
    const live = source.live
    if (live !== undefined) {
      const agentPreset = presets.composedPreset(live.ctx)
      return {
        ...(agentPreset === undefined ? {} : { agentPreset }),
        setup: (childCtx: Context) => { presets.composeFrom(childCtx, live.ctx) },
      }
    }
    const resolved = await presets.resolve(sessionPreset(source.header, source.events))
    return {
      agentPreset: resolved.id,
      setup: async (childCtx: Context) => { await presets.mount(childCtx, resolved.id) },
    }
  }

  private async closeRecord(record: ArchivedForkRecord): Promise<SideChatResult<CloseSideChatValue>> {
    try {
      if (record.handle.agent.status === 'running') {
        record.handle.agent.cancel({ kind: 'user' })
        await record.handle.agent.whenIdle()
      }
      await this.ctx.workspaceRegistry.archiveSession(dshSessionId(record.childSessionId))
      await record.handle.dispose()
    } catch (error) {
      this.ctx.logger.warn(`archived Side Chat close failed: ${String(error)}`)
      return failure('side_chat_destroy_failed', 'The Side Chat could not be archived and released.', true)
    }
    this.records.delete(record.childSessionId)
    return { ok: true, value: { closed: true } }
  }

  private async archiveAndDispose(childSessionId: SessionId, handle: AgentHandle): Promise<void> {
    await this.ctx.workspaceRegistry.archiveSession(dshSessionId(childSessionId)).catch(() => undefined)
    await handle.dispose().catch(() => undefined)
  }
}

export { boundaryCut as resolveArchivedForkBoundary }
