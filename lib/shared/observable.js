/** Immutable-value observable with contained subscriber failures. */
export class ObservableValue {
    value;
    label;
    listeners = new Set();
    disposed = false;
    constructor(value, label) {
        this.value = value;
        this.label = label;
    }
    /** Return the current stable snapshot. */
    getSnapshot = () => this.value;
    /** Subscribe until the returned disposer is called. */
    subscribe = (listener) => {
        if (this.disposed)
            return () => { };
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    /** Replace the snapshot and notify every surviving listener. */
    publish(value) {
        if (this.disposed)
            return;
        this.value = value;
        for (const listener of this.listeners) {
            try {
                listener();
            }
            catch (error) {
                console.error(`[${this.label}] subscriber threw`, error);
            }
        }
    }
    /** Drop listeners and refuse later publication. */
    dispose() {
        this.disposed = true;
        this.listeners.clear();
    }
}
