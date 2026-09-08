/** Minimal observable compatible with React's external-store adapter. */
export interface HostObservable<T> {
    getSnapshot(): T;
    subscribe(listener: () => void): () => void;
}
/** Immutable-value observable with contained subscriber failures. */
export declare class ObservableValue<T> implements HostObservable<T> {
    private value;
    private readonly label;
    private readonly listeners;
    private disposed;
    constructor(value: T, label: string);
    /** Return the current stable snapshot. */
    getSnapshot: () => T;
    /** Subscribe until the returned disposer is called. */
    subscribe: (listener: () => void) => (() => void);
    /** Replace the snapshot and notify every surviving listener. */
    publish(value: T): void;
    /** Drop listeners and refuse later publication. */
    dispose(): void;
}
