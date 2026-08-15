import type { SideChatModelSelection } from '../shared/contracts.js'

const STORAGE_KEY = 'dsh-side-chat:model-preference:v1'

interface ModelPreferenceStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface StoredPreference {
  readonly version: 1
  readonly selection: SideChatModelSelection
}

function browserLocalStorage(): ModelPreferenceStorage | undefined {
  if (typeof window === 'undefined') return
  try {
    return window.localStorage
  } catch {
    return
  }
}

function modelSelection(value: unknown): SideChatModelSelection | undefined {
  if (typeof value !== 'object' || value === null) return
  const candidate = value as Partial<SideChatModelSelection>
  if (typeof candidate.provider !== 'string' || candidate.provider === ''
    || typeof candidate.model !== 'string' || candidate.model === ''
    || (candidate.reasoningEffort !== undefined
      && (typeof candidate.reasoningEffort !== 'string' || candidate.reasoningEffort === ''))) {
    return
  }
  return {
    provider: candidate.provider,
    model: candidate.model,
    ...(candidate.reasoningEffort === undefined ? {} : { reasoningEffort: candidate.reasoningEffort }),
  }
}

/** Browser-persistent default shared by every Side Chat in this DSH profile. */
export class SideChatModelPreferences {
  constructor(private readonly storage: ModelPreferenceStorage | undefined = browserLocalStorage()) {}

  get(): SideChatModelSelection | undefined {
    if (this.storage === undefined) return
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (raw === null) return
      const parsed = JSON.parse(raw) as Partial<StoredPreference>
      return parsed.version === 1 ? modelSelection(parsed.selection) : undefined
    } catch {
      return
    }
  }

  set(selection: SideChatModelSelection): void {
    if (this.storage === undefined) return
    const preference: StoredPreference = { version: 1, selection: { ...selection } }
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(preference))
    } catch {
      // A denied or full localStorage must not block Side Chat model selection.
    }
  }
}
