import { describe, expect, it, vi } from 'vitest'
import { mountArchivedRemote } from '../../src/client/rc6/remote-adapter.js'
import type { Rc6ClientContext } from '../../src/client/rc6/context.js'
import { SessionId } from '../../src/shared/contracts.js'

describe('mountArchivedRemote', () => {
  it('calls the mounted namespace through a Cordis service lookup', async () => {
    const create = vi.fn().mockResolvedValue({
      ok: true,
      value: {
        ok: true,
        value: {
          parentSessionId: SessionId('parent-1'),
          childSessionId: SessionId('child-1'),
          boundarySeq: 6,
          inheritedThroughSeq: 5,
        },
      },
    })
    const close = vi.fn().mockResolvedValue({
      ok: true,
      value: { ok: true, value: { childSessionId: SessionId('child-1') } },
    })
    const dispose = vi.fn().mockResolvedValue(undefined)
    const mount = vi.fn().mockResolvedValue(dispose)
    const namespace = { create, close }
    const remote = new Proxy({ $mount: mount }, {
      get(target, property, receiver) {
        if (property === 'sideChatArchived') {
          throw new Error('cannot get property "remote.sideChatArchived" without inject')
        }
        return Reflect.get(target, property, receiver)
      },
    })
    const get = vi.fn().mockReturnValue(namespace)
    const ctx = { remote, get } as unknown as Rc6ClientContext

    const mounted = await mountArchivedRemote(ctx)
    expect(await mounted.remote.create({ parentSessionId: SessionId('parent-1'), atSeq: 5.9 }))
      .toMatchObject({ ok: true, value: { childSessionId: 'child-1' } })
    expect(create).toHaveBeenCalledWith({ parentSessionId: 'parent-1', atSeq: 5 })
    expect(await mounted.remote.close({ childSessionId: SessionId('child-1') }))
      .toEqual({ ok: true, value: { childSessionId: 'child-1' } })
    expect(get).toHaveBeenCalledWith('remote.sideChatArchived')

    await mounted.dispose()
    expect(dispose).toHaveBeenCalledOnce()
  })
})
