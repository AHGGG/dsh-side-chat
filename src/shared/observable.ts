/** Minimal observable compatible with React's external-store adapter. */
export interface HostObservable<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

/** Immutable-value observable with contained subscriber failures. */
export class ObservableValue<T> implements HostObservable<T> {
  private readonly listeners = new Set<() => void>()
  private disposed = false

  constructor(private value: T, private readonly label: string) {}

  /** Return the current stable snapshot. */
  getSnapshot = (): T => this.value

  /** Subscribe until the returned disposer is called. */
  subscribe = (listener: () => void): (() => void) => {
    if (this.disposed) return () => {}
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Replace the snapshot and notify every surviving listener. */
  publish(value: T): void {
    if (this.disposed) return
    this.value = value
    for (const listener of this.listeners) {
      try {
        listener()
      } catch (error) {
        console.error(`[${this.label}] subscriber threw`, error)
      }
    }
  }

  /** Drop listeners and refuse later publication. */
  dispose(): void {
    this.disposed = true
    this.listeners.clear()
  }
}
