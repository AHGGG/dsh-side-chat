import { describe, expect, it } from 'vitest'
import { SideChatModelPreferences } from '../../src/client/model-preference.js'

const STORAGE_KEY = 'dsh-side-chat:model-preference:v1'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

describe('SideChatModelPreferences', () => {
  it('restores the last Side Chat choice globally across instances', () => {
    const storage = new MemoryStorage()
    const first = new SideChatModelPreferences(storage)
    first.set({ provider: 'deepseek', model: 'deepseek-v4-pro', reasoningEffort: 'off' })

    expect(new SideChatModelPreferences(storage).get()).toEqual({
      provider: 'deepseek',
      model: 'deepseek-v4-pro',
      reasoningEffort: 'off',
    })

    first.set({ provider: 'openai', model: 'gpt-fast' })
    expect(new SideChatModelPreferences(storage).get()).toEqual({
      provider: 'openai',
      model: 'gpt-fast',
    })
  })

  it('ignores corrupt records and storage failures', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      selection: { provider: 'deepseek', model: '', reasoningEffort: 'off' },
    }))
    expect(new SideChatModelPreferences(storage).get()).toBeUndefined()

    const denied = new SideChatModelPreferences({
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
    })
    expect(denied.get()).toBeUndefined()
    expect(() => { denied.set({ provider: 'deepseek', model: 'chat' }) }).not.toThrow()
  })
})
