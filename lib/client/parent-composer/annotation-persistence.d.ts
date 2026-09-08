import type { SessionId } from '../../shared/contracts.js';
import type { ParentComposerInput } from './add-to-conversation.js';
interface AnnotationStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
/** Tab-scoped recovery for drafts persisted as a reference clipboard projection. */
export declare class ConversationAnnotationPersistence {
    private readonly storage;
    private readonly observedSessions;
    constructor(storage?: AnnotationStorage | undefined);
    reconcile(sessionId: SessionId, input: ParentComposerInput): void;
    private read;
    private write;
    private remove;
}
export {};
