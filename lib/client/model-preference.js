const STORAGE_KEY = 'dsh-side-chat:model-preference:v1';
function browserLocalStorage() {
    if (typeof window === 'undefined')
        return;
    try {
        return window.localStorage;
    }
    catch {
        return;
    }
}
function modelSelection(value) {
    if (typeof value !== 'object' || value === null)
        return;
    const candidate = value;
    if (typeof candidate.provider !== 'string' || candidate.provider === ''
        || typeof candidate.model !== 'string' || candidate.model === ''
        || (candidate.reasoningEffort !== undefined
            && (typeof candidate.reasoningEffort !== 'string' || candidate.reasoningEffort === ''))) {
        return;
    }
    return {
        provider: candidate.provider,
        model: candidate.model,
        ...(candidate.reasoningEffort === undefined ? {} : { reasoningEffort: candidate.reasoningEffort }),
    };
}
/** Browser-persistent default shared by every Side Chat in this DSH profile. */
export class SideChatModelPreferences {
    storage;
    constructor(storage = browserLocalStorage()) {
        this.storage = storage;
    }
    get() {
        if (this.storage === undefined)
            return;
        try {
            const raw = this.storage.getItem(STORAGE_KEY);
            if (raw === null)
                return;
            const parsed = JSON.parse(raw);
            return parsed.version === 1 ? modelSelection(parsed.selection) : undefined;
        }
        catch {
            return;
        }
    }
    set(selection) {
        if (this.storage === undefined)
            return;
        const preference = { version: 1, selection: { ...selection } };
        try {
            this.storage.setItem(STORAGE_KEY, JSON.stringify(preference));
        }
        catch {
            // A denied or full localStorage must not block Side Chat model selection.
        }
    }
}
