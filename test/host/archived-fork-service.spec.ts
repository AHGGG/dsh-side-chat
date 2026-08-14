import { describe, expect, it } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { SessionId as dshSessionId } from '@deepseek-ai/dsh-session'
import type { SessionEvent } from '@deepseek-ai/dsh-session/types'
import {
  ArchivedForkSideChatService,
  resolveArchivedForkBoundary,
} from '../../src/host/archived-fork-service.js'
import { archivedCreateRequestSchema } from '../../src/shared/archived-wire.js'
import { SessionId } from '../../src/shared/contracts.js'

function event(seq: number, type: string): SessionEvent {
  return { seq, time: 1_000 + seq, type, data: {} } as unknown as SessionEvent
}

const PARENT_EVENTS = [
  event(0, 'user/message'),
  event(1, 'turn/start'),
  event(2, 'assistant/message'),
  event(3, 'turn/end'),
  event(4, 'session/title'),
  event(5, 'turn/start'),
  event(6, 'assistant/message'),
] as const

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(resolver => { resolve = resolver })
  return { promise, resolve }
}

interface FakeCreateInput {
  readonly sessionId: ReturnType<typeof dshSessionId>
  readonly seed: readonly SessionEvent[]
  readonly meta: Record<string, unknown>
  readonly agentOptions: Record<string, unknown>
  readonly setup?: (ctx: Context) => void
}

class FakeArchivedRuntime {
  readonly calls: string[] = []
  readonly warnings: string[] = []
  readonly parentCtx = {} as Context
  readonly childCtx = {} as Context
  readonly parentOptions = { provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'high' }
  readonly parentHeader = {
    id: dshSessionId('parent-1'),
    cwd: 'E:\\workspace',
    agentPreset: 'parent-composition',
  }
  readonly childAgent = {
    status: 'idle' as 'idle' | 'running',
    session: { events: [] as readonly SessionEvent[] },
    cancel: (): void => {
      this.calls.push('cancel')
      this.childAgent.status = 'idle'
    },
    whenIdle: async (): Promise<void> => { this.calls.push('idle') },
  }
  readonly childHandle = {
    agent: this.childAgent,
    dispose: async (): Promise<void> => { this.calls.push('dispose') },
  }
  createInput: FakeCreateInput | undefined
  parentLive = true
  archiveGate: Promise<void> | undefined
  archiveEntered: (() => void) | undefined

  readonly context = {
    agents: {
      get: (id: ReturnType<typeof dshSessionId>) => this.parentLive && id === dshSessionId('parent-1')
        ? {
            id,
            ctx: this.parentCtx,
            options: this.parentOptions,
            session: { events: PARENT_EVENTS, header: this.parentHeader },
          }
        : undefined,
      create: async (input: FakeCreateInput) => {
        this.calls.push('create')
        this.createInput = input
        this.childAgent.session.events = input.seed
        input.setup?.(this.childCtx)
        return this.childHandle
      },
    },
    get: (name: string) => {
      if (name === 'agentPresets') return {
          composedPreset: () => 'parent-composition',
          composeFrom: (child: Context, parent: Context) => {
            this.calls.push(child === this.childCtx && parent === this.parentCtx
              ? 'preset:compose-parent'
              : 'preset:compose-other')
          },
          resolve: async (id: string | undefined) => ({ id: id ?? 'default' }),
          mount: async (child: Context, id: string | undefined) => {
            this.calls.push(child === this.childCtx ? `preset:mount:${String(id)}` : 'preset:mount-other')
            return { id }
          },
        }
      if (name === 'sessionPersistence') return {
        list: async () => [this.parentHeader],
        inspect: async () => ({ meta: this.parentHeader, events: PARENT_EVENTS }),
      }
      return undefined
    },
    workspaceRegistry: {
      resolveByPath: async (cwd: string) => ({
        attachSession: async (id: ReturnType<typeof dshSessionId>) => {
          this.calls.push(`attach:${cwd}:${String(id)}`)
        },
      }),
      archiveSession: async (id: ReturnType<typeof dshSessionId>) => {
        this.calls.push(`archive:${String(id)}`)
        this.archiveEntered?.()
        if (this.archiveGate !== undefined) await this.archiveGate
      },
    },
    logger: { warn: (message: string) => { this.warnings.push(message) } },
  } as unknown as Context
}

function createRequest(atSeq = 2) {
  return { parentSessionId: SessionId('parent-1'), atSeq }
}

describe('ArchivedForkSideChatService', () => {
  it('uses a completed-turn cut and keeps trailing between-turn events', () => {
    expect(archivedCreateRequestSchema.parse({ parentSessionId: 'parent-1', atSeq: 2.75 }).atSeq).toBe(2.75)
    expect(resolveArchivedForkBoundary(PARENT_EVENTS, 2)).toEqual({
      boundarySeq: 3,
      cut: 5,
      inheritedThroughSeq: 4,
    })
    expect(resolveArchivedForkBoundary(PARENT_EVENTS, 6)).toBeUndefined()
    expect(resolveArchivedForkBoundary(PARENT_EVENTS, 99)?.boundarySeq).toBe(3)
    expect(resolveArchivedForkBoundary(PARENT_EVENTS, 2.75)?.boundarySeq).toBe(3)
  })

  it('copies the exact prefix, parent options, preset composition, and workspace', async () => {
    const runtime = new FakeArchivedRuntime()
    const service = new ArchivedForkSideChatService(runtime.context)
    const created = await service.create(createRequest())

    expect(created.ok).toBe(true)
    if (!created.ok) return
    expect(created.value).toMatchObject({
      parentSessionId: 'parent-1',
      boundarySeq: 3,
      inheritedThroughSeq: 4,
    })
    expect(runtime.createInput?.seed).toEqual(PARENT_EVENTS.slice(0, 5))
    expect(runtime.createInput?.agentOptions).toEqual(runtime.parentOptions)
    expect(runtime.createInput?.meta).toMatchObject({
      cwd: 'E:\\workspace',
      parentSession: 'parent-1',
      seedLength: 5,
      agentPreset: 'parent-composition',
    })
    expect(runtime.calls).toContain('preset:compose-parent')
    expect(runtime.calls.some(call => call.startsWith('attach:E:\\workspace:session-'))).toBe(true)
  })

  it('forks a persisted parent with its recorded preset when no live Agent exists', async () => {
    const runtime = new FakeArchivedRuntime()
    runtime.parentLive = false
    const service = new ArchivedForkSideChatService(runtime.context)

    const created = await service.create(createRequest(2.75))

    expect(created.ok).toBe(true)
    expect(runtime.createInput?.seed).toEqual(PARENT_EVENTS.slice(0, 5))
    expect(runtime.createInput?.agentOptions).toEqual({})
    expect(runtime.createInput?.meta).toMatchObject({
      parentSession: 'parent-1',
      agentPreset: 'parent-composition',
    })
    expect(runtime.calls).toContain('preset:mount:parent-composition')
    expect(runtime.calls).not.toContain('preset:compose-parent')
  })

  it('joins concurrent close calls and cancels before archive and dispose', async () => {
    const runtime = new FakeArchivedRuntime()
    const service = new ArchivedForkSideChatService(runtime.context)
    const created = await service.create(createRequest())
    if (!created.ok) throw new Error('create failed')

    const entered = deferred<void>()
    const gate = deferred<void>()
    runtime.archiveEntered = () => { entered.resolve(undefined) }
    runtime.archiveGate = gate.promise
    runtime.childAgent.status = 'running'
    const request = { childSessionId: created.value.childSessionId }
    const first = service.close(request)
    await entered.promise
    const second = service.close(request)
    gate.resolve(undefined)

    expect(await Promise.all([first, second])).toEqual([
      { ok: true, value: { closed: true } },
      { ok: true, value: { closed: true } },
    ])
    expect(runtime.calls.filter(call => call === 'cancel')).toHaveLength(1)
    expect(runtime.calls.filter(call => call.startsWith('archive:'))).toHaveLength(1)
    expect(runtime.calls.filter(call => call === 'dispose')).toHaveLength(1)
  })

  it('rejects an open turn and archives active forks on plugin unload', async () => {
    const runtime = new FakeArchivedRuntime()
    const service = new ArchivedForkSideChatService(runtime.context)
    expect(await service.create(createRequest(6))).toMatchObject({
      ok: false,
      error: { code: 'fork_unavailable' },
    })
    expect((await service.create(createRequest())).ok).toBe(true)
    await service.dispose()
    expect(runtime.calls.some(call => call.startsWith('archive:session-'))).toBe(true)
    expect(runtime.calls).toContain('dispose')
    expect(await service.create(createRequest())).toMatchObject({
      ok: false,
      error: { code: 'transport_error' },
    })
  })
})
