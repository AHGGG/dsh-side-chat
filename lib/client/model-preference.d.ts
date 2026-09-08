import type { SideChatModelSelection } from '../shared/contracts.js';
interface ModelPreferenceStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
/** Browser-persistent default shared by every Side Chat in this DSH profile. */
export declare class SideChatModelPreferences {
    private readonly storage;
    constructor(storage?: ModelPreferenceStorage | undefined);
    get(): SideChatModelSelection | undefined;
    set(selection: SideChatModelSelection): void;
}
export {};
