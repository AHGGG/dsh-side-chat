import type {
  ConversationSelection,
  CreateSideChatValue,
  SessionId,
  SideChatClientError,
  SideChatPhase,
  SideChatPromptPart,
  SideChatRemote,
  SideChatState,
  SideChatWireError,
} from '../shared/contracts.js'
import type { HostObservable } from '../shared/observable.js'
import { ObservableValue } from '../shared/observable.js'
import type {
  SideChatActionResult,
  SideChatClientSessions,
  SideChatQuestionAnswer,
  SideChatSessionBinding,
  SideChatSessionLease,
  SideChatSessionSnapshot,
} from './contracts.js'
import { buildSideChatPrompt } from './parent-composer/add-to-conversation.js'
import { assertSelectionCurrent } from './selection/selection-normalizer.js'

const INITIAL_STATE: SideChatState = Object.freeze({ phase: 'closed', draft: '' })

function success<T>(value: T): SideChatActionResult<T> {
  return { ok: true, value }
}

function failure<T>(error: SideChatWireError): SideChatActionResult<T> {
  return { ok: false, error }
}

function localError(
  code: SideChatWireError['code'],
  message: string,
  recoverable = true,
): SideChatWireError {
  return { code, message, recoverable }
}

function phaseOf(snapshot: SideChatSessionSnapshot): SideChatPhase {
  switch (snapshot.status) {
    case 'idle': return 'ready'
    case 'running': return 'running'
    case 'needs-input': return 'needs-input'
    case 'needs-approval': return 'needs-approval'
    case 'failed': return 'error'
    case 'interrupted': return 'ready'
  }
}

/** Small controller for the stock rc.6 archived-fork path. */
export class SideChatController implements HostObservable<SideChatState> {
  private readonly observable = new ObservableValue(INITIAL_STATE, 'dsh-side-chat')
  private lease: SideChatSessionLease | undefined
  private childUnsubscribe: (() => void) | undefined
  private opening: Promise<SideChatActionResult<void>> | undefined
  private closing: Promise<SideChatActionResult<void>> | undefined
  private closeRequested = false
  private disposed = false

  constructor(
    private readonly remote: SideChatRemote,
    private readonly sessions: SideChatClientSessions,
  ) {}

  getSnapshot = (): SideChatState => this.observable.getSnapshot()

  subscribe = (listener: () => void): (() => void) => this.observable.subscribe(listener)

  openDraft(input: {
    readonly parentSessionId?: SessionId
    readonly selection?: ConversationSelection
    readonly draft?: string
  } = {}): SideChatActionResult<void> {
    if (this.disposed) return failure(localError('transport_error', 'The Side Chat controller is disposed.', false))
    if (this.getSnapshot().phase !== 'closed') {
      return failure(localError('side_chat_already_open', 'A Side Chat is already open.'))
    }
    const parentSessionId = input.parentSessionId ?? this.sessions.currentSessionId()
    if (parentSessionId === undefined) {
      return failure(localError('parent_session_missing', 'Start the main conversation first.'))
    }
    try {
      if (input.selection !== undefined) assertSelectionCurrent(input.selection, parentSessionId)
    } catch (error) {
      return failure(localError(
        'selection_stale',
        error instanceof Error ? error.message : 'The selected text is no longer available.',
        false,
      ))
    }
    this.publish({
      phase: 'draft',
      parentSessionId,
      ...(input.selection === undefined ? {} : { selection: input.selection }),
      draft: input.draft ?? '',
    })
    return success(undefined)
  }

  setDraft(draft: string): SideChatActionResult<void> {
    const state = this.getSnapshot()
    if (state.phase === 'closed' || state.phase === 'creating' || state.phase === 'opening'
      || state.phase === 'closing' || state.childSessionId !== undefined) {
      return failure(localError('invalid_request', 'The draft is not editable right now.', false))
    }
    this.publish({ ...state, draft })
    return success(undefined)
  }

  clearSelection(): SideChatActionResult<void> {
    const state = this.getSnapshot()
    if (state.selection === undefined) return success(undefined)
    if (state.childSessionId !== undefined || !['draft', 'error'].includes(state.phase)) {
      return failure(localError('invalid_request', 'The selected passage has already been sent.', false))
    }
    this.publish({ ...state, selection: undefined })
    return success(undefined)
  }

  async sendFirst(question: string): Promise<SideChatActionResult<void>> {
    if (this.opening !== undefined) {
      return failure(localError('invalid_request', 'The Side Chat is already opening.', false))
    }
    const state = this.getSnapshot()
    const trimmed = question.trim()
    if (trimmed.length === 0) return failure(localError('invalid_request', 'Enter a Side Chat question.', false))
    if (state.parentSessionId === undefined || !['draft', 'error'].includes(state.phase)) {
      return failure(localError('invalid_request', 'The first Side Chat message cannot be sent now.', false))
    }
    if (state.error?.operation === 'close') {
      return failure(localError('side_chat_destroy_failed', 'Retry closing the current Side Chat first.'))
    }
    if (state.childSessionId === undefined && state.selection !== undefined
      && !this.sessions.selectionIsCurrent(state.selection)) {
      const error = localError('selection_stale', 'Select the passage again before sending.', false)
      this.fail(error, 'create', { draft: trimmed, firstQuestion: trimmed })
      return failure(error)
    }
    const atSeq = state.selection?.atSeq ?? this.sessions.lastCompletedSeq(state.parentSessionId)
    if (atSeq === undefined) {
      const error = localError('parent_session_not_ready', 'Wait for a completed main-conversation turn first.')
      this.fail(error, 'create', { draft: trimmed, firstQuestion: trimmed })
      return failure(error)
    }

    const operation = this.createOpenAndPrompt(state.parentSessionId, atSeq, trimmed)
    this.opening = operation
    try {
      return await operation
    } finally {
      if (this.opening === operation) this.opening = undefined
    }
  }

  async send(text: string, mode: 'queue' | 'steer' = 'queue'): Promise<SideChatActionResult<void>> {
    const trimmed = text.trim()
    if (trimmed.length === 0) return failure(localError('invalid_request', 'Enter a message.', false))
    return await this.sendParts([{ type: 'text', text: trimmed }], mode)
  }

  async sendParts(
    content: readonly SideChatPromptPart[],
    mode: 'queue' | 'steer' = 'queue',
  ): Promise<SideChatActionResult<void>> {
    if (content.length === 0) return failure(localError('invalid_request', 'Enter a message.', false))
    const binding = this.bindingTarget()
    if (!binding.ok) return binding
    const result = await this.invoke(() => binding.value.prompt(content, mode))
    if (this.getSnapshot().phase === 'closing' || this.getSnapshot().phase === 'closed') {
      return failure(localError('transport_error', 'The Side Chat was closed.', false))
    }
    if (!result.ok) this.fail(result.error, 'prompt')
    return result.ok ? success(undefined) : failure(result.error)
  }

  async updateQueue(
    itemId: string,
    action: { readonly kind: 'edit'; readonly content: readonly SideChatPromptPart[] }
      | { readonly kind: 'remove' }
      | { readonly kind: 'steer' },
  ): Promise<SideChatActionResult<void>> {
    const binding = this.bindingTarget()
    if (!binding.ok) return binding
    const result = await this.invoke(() => binding.value.updateQueue(itemId, action))
    return result.ok ? success(undefined) : failure(result.error)
  }

  async cancel(): Promise<SideChatActionResult<void>> {
    const binding = this.bindingTarget()
    if (!binding.ok) return binding
    const result = await this.invoke(() => binding.value.cancel())
    return result.ok ? success(undefined) : failure(result.error)
  }

  async respondApproval(
    interactionId: string,
    decision: 'approve' | 'decline',
  ): Promise<SideChatActionResult<void>> {
    const binding = this.bindingTarget()
    if (!binding.ok) return binding
    const result = await this.invoke(() => binding.value.respondApproval(interactionId, decision))
    return result.ok ? success(undefined) : failure(result.error)
  }

  async respondQuestion(
    interactionId: string,
    answer: SideChatQuestionAnswer | null,
  ): Promise<SideChatActionResult<void>> {
    const binding = this.bindingTarget()
    if (!binding.ok) return binding
    const result = await this.invoke(() => binding.value.respondQuestion(interactionId, answer))
    return result.ok ? success(undefined) : failure(result.error)
  }

  async close(): Promise<SideChatActionResult<void>> {
    const state = this.getSnapshot()
    if (state.phase === 'closed') return success(undefined)
    if (state.childSessionId === undefined && this.opening === undefined) {
      this.reset()
      return success(undefined)
    }
    if (this.opening !== undefined) {
      this.closeRequested = true
      this.publish({ ...state, phase: 'closing', error: undefined })
      await this.opening
      const after = this.getSnapshot()
      if (after.phase === 'closed') return success(undefined)
      if (after.error?.operation === 'close') return failure(after.error)
      if (after.childSessionId === undefined) {
        this.reset()
        return success(undefined)
      }
      return await this.closeChild(after.childSessionId)
    }
    if (state.childSessionId === undefined) {
      this.reset()
      return success(undefined)
    }
    return await this.closeChild(state.childSessionId)
  }

  async retry(): Promise<SideChatActionResult<unknown>> {
    const state = this.getSnapshot()
    if (state.error?.operation === 'close') return await this.close()
    if (state.error?.operation === 'create'
      || state.error?.operation === 'open'
      || state.error?.operation === 'prompt') {
      return await this.sendFirst(state.firstQuestion ?? state.draft)
    }
    return failure(localError('invalid_request', 'There is no failed operation to retry.', false))
  }

  async dispose(): Promise<void> {
    if (this.disposed) return
    if (this.getSnapshot().phase !== 'closed') {
      const result = await this.close()
      if (!result.ok) {
        this.sessions.notify({ kind: 'warning', text: 'The Side Chat could not be closed cleanly.' })
      }
    }
    this.disposed = true
    this.detachLease()
    this.observable.dispose()
  }

  private async createOpenAndPrompt(
    parentSessionId: SessionId,
    atSeq: number,
    question: string,
  ): Promise<SideChatActionResult<void>> {
    const original = this.getSnapshot()
    let childSessionId = original.childSessionId
    if (childSessionId === undefined) {
      this.publish({ ...original, phase: 'creating', draft: question, firstQuestion: question, error: undefined })
      const created = await this.invoke(() => this.remote.create({ parentSessionId, atSeq }))
      if (!created.ok) {
        if (this.closeRequested) this.reset()
        else this.fail(created.error, 'create', { draft: question, firstQuestion: question })
        return failure(created.error)
      }
      childSessionId = created.value.childSessionId
      this.publishCreated(created.value, question)
      if (this.closeRequested || this.disposed) {
        const closed = await this.closeChild(childSessionId)
        return closed.ok
          ? failure(localError('transport_error', 'The Side Chat was closed.', false))
          : closed
      }
    }

    if (this.lease === undefined) {
      this.publish({ ...this.getSnapshot(), phase: 'opening', error: undefined })
      try {
        const lease = await this.sessions.retain(childSessionId)
        if (this.closeRequested || this.disposed) {
          lease.release()
          const closed = await this.closeChild(childSessionId)
          return closed.ok
            ? failure(localError('transport_error', 'The Side Chat was closed.', false))
            : closed
        }
        this.attachLease(lease, childSessionId)
      } catch {
        const error = localError('side_chat_open_failed', 'The child Session could not be opened.')
        this.fail(error, 'open', { firstQuestion: question, draft: question })
        return failure(error)
      }
    }

    const binding = this.lease?.binding
    if (binding === undefined) {
      const error = localError('side_chat_open_failed', 'The child Session is unavailable.')
      this.fail(error, 'open', { firstQuestion: question, draft: question })
      return failure(error)
    }
    const prompted = await this.invoke(() => binding.prompt(buildSideChatPrompt(original.selection, question), 'queue'))
    if (!prompted.ok) {
      this.fail(prompted.error, 'prompt', { firstQuestion: question, draft: question })
      return failure(prompted.error)
    }
    this.publish({
      ...this.getSnapshot(),
      phase: phaseOf(binding.getSnapshot()),
      draft: '',
      firstQuestion: undefined,
      error: undefined,
    })
    return success(undefined)
  }

  private publishCreated(created: CreateSideChatValue, question: string): void {
    this.publish({
      ...this.getSnapshot(),
      phase: 'opening',
      parentSessionId: created.parentSessionId,
      childSessionId: created.childSessionId,
      boundarySeq: created.boundarySeq,
      inheritedThroughSeq: created.inheritedThroughSeq,
      firstQuestion: question,
      error: undefined,
    })
  }

  private async closeChild(childSessionId: SessionId): Promise<SideChatActionResult<void>> {
    if (this.closing !== undefined) return await this.closing
    const operation = this.performClose(childSessionId)
    this.closing = operation
    try {
      return await operation
    } finally {
      if (this.closing === operation) this.closing = undefined
    }
  }

  private async performClose(childSessionId: SessionId): Promise<SideChatActionResult<void>> {
    this.publish({ ...this.getSnapshot(), phase: 'closing', error: undefined })
    const closed = await this.invoke(() => this.remote.close({ childSessionId }))
    if (!closed.ok) {
      this.fail(closed.error, 'close')
      return failure(closed.error)
    }
    this.reset()
    return success(undefined)
  }

  private bindingTarget(): SideChatActionResult<SideChatSessionBinding> {
    const state = this.getSnapshot()
    const binding = this.lease?.binding
    if (binding === undefined || state.childSessionId !== binding.sessionId
      || !['ready', 'running', 'needs-input', 'needs-approval'].includes(state.phase)) {
      return failure(localError('invalid_request', 'The Side Chat is not accepting messages.', false))
    }
    return success(binding)
  }

  private attachLease(lease: SideChatSessionLease, expectedSessionId: SessionId): void {
    if (lease.sessionId !== expectedSessionId || lease.binding.sessionId !== expectedSessionId) {
      lease.release()
      throw new Error('The opened Session does not match the Side Chat child.')
    }
    this.detachLease()
    this.lease = lease
    this.childUnsubscribe = lease.binding.subscribe(() => { this.updateFromChild() })
    this.updateFromChild()
  }

  private detachLease(): void {
    this.childUnsubscribe?.()
    this.childUnsubscribe = undefined
    this.lease?.release()
    this.lease = undefined
  }

  private updateFromChild(): void {
    const state = this.getSnapshot()
    const snapshot = this.lease?.binding.getSnapshot()
    if (snapshot === undefined || ['closed', 'closing', 'error'].includes(state.phase)) return
    if (snapshot.status === 'failed') {
      this.fail(localError('side_chat_prompt_failed', 'The Side Chat turn failed.'), 'prompt')
      return
    }
    this.publish({ ...state, phase: phaseOf(snapshot), error: undefined })
  }

  private fail(
    error: SideChatWireError,
    operation: SideChatClientError['operation'],
    patch: Partial<SideChatState> = {},
  ): void {
    this.publish({
      ...this.getSnapshot(),
      ...patch,
      phase: 'error',
      error: { ...error, operation },
    })
  }

  private async invoke<Result extends { readonly ok: boolean }>(
    operation: () => Promise<Result>,
  ): Promise<Result | { readonly ok: false; readonly error: SideChatWireError }> {
    try {
      return await operation()
    } catch {
      return { ok: false, error: localError('transport_error', 'The Side Chat connection was interrupted.') }
    }
  }

  private reset(): void {
    this.detachLease()
    this.closeRequested = false
    this.publish(INITIAL_STATE)
  }

  private publish(state: SideChatState): void {
    this.observable.publish(Object.freeze(state))
  }
}
