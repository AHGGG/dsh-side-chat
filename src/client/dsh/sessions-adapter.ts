import type { Context } from '@deepseek-ai/cordis'
import type { SessionFace } from '@deepseek-ai/dsh-api-session-controller/client'
import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { SessionId as DshSessionId } from '@deepseek-ai/dsh-session/types'
import type { SideChatClientSessions } from '../contracts.js'
import { SessionId, type ConversationSelection, type SideChatModelSelection } from '../../shared/contracts.js'
import {
  addSelectionToConversation as addSelection, conversationAnnotations,
  removeConversationAnnotation as removeAnnotation, removeConversationAnnotations as removeAnnotations,
  updateConversationAnnotation as updateAnnotation,
  type ParentComposerInput, type ParentComposerInputSnapshot,
} from '../parent-composer/add-to-conversation.js'
import { ConversationAnnotationPersistence } from '../parent-composer/annotation-persistence.js'
import { addReferencedSideChatToConversation, type ReferencedSideChatConversation } from '../parent-composer/referenced-conversation.js'
import { SideChatModelPreferences } from '../model-preference.js'
import type { DshClientContext } from './context.js'
import { DshParentConversation, type ParentConversationFace, type ParentConversationSnapshot, type SideChatNodeStore } from './conversation-store.js'

declare module '@deepseek-ai/dsh-api-session-controller/client' { interface SessionReferenceSourceMap { sideChat: unknown } }
function dshId(id: SessionId): DshSessionId { return id as unknown as DshSessionId }
function locationSettled(location: NonNullable<ReturnType<SideChatNodeStore['get']>>['location']): boolean {
  if (location.kind === 'turn') return location.turn.status === 'closed'
  if (location.kind === 'step') return location.turn.status === 'closed' && location.step.status === 'closed'
  return false
}
/** The only Session touched by the plugin is the parent: read its Chat, retain its editor, and insert explicit references. */
export class DshSideChatSessions implements SideChatClientSessions {
  private readonly faces = new WeakMap<SessionFace, ParentConversationFace>()
  private readonly parentInputs = new WeakMap<object, ParentComposerInput>()
  private readonly annotationPersistence = new ConversationAnnotationPersistence()
  private readonly modelPreferences = new SideChatModelPreferences()
  constructor(private readonly ctx: DshClientContext) {}
  readonly subscribeList = (listener: () => void): (() => void) => this.ctx.sessions.list.subscribe(listener)
  readonly subscribeConversationInput = (listener: () => void): (() => void) => {
    let input: ParentComposerInput | undefined
    let removeInput = (): void => {}
    const bind = (): void => {
      const next = this.currentParentInput()
      if (next === input) return
      removeInput()
      input = next
      removeInput = input?.state.subscribe(listener) ?? (() => {})
    }
    bind()
    const removeList = this.ctx.sessions.list.subscribe(() => { bind(); listener() })
    return () => { removeList(); removeInput() }
  }
  readonly currentConversationInputSnapshot = (): ParentComposerInputSnapshot | undefined => this.currentParentInput()?.state.getSnapshot()
  currentSessionId(): SessionId | undefined {
    const current = Object.entries(this.ctx.sessions.list.getSnapshot().byId)
      .find(([, summary]) => (summary.retainedBy.mainView ?? 0) > 0)?.[0]
    return current === undefined ? undefined : SessionId(current)
  }
  lastCompletedSeq(parentSessionId: SessionId): number | undefined {
    const snapshot = this.face(parentSessionId)?.getSnapshot()
    let latest: number | undefined
    for (const seq of snapshot?.turnEnds.values() ?? []) if (latest === undefined || seq > latest) latest = seq
    return latest
  }
  selectionIsCurrent(selection: ConversationSelection): boolean {
    const snapshot = this.face(selection.parentSessionId)?.getSnapshot()
    if (snapshot === undefined) return false
    return selection.fragments.every(fragment => {
      const node = snapshot.chatNodes.get(fragment.nodeKey)
      return node !== undefined && node.visibility === 'visible' && node.kind === fragment.nodeKind
        && node.anchorSeq === fragment.seq && locationSettled(node.location)
    })
  }
  addSelectionToConversation(selection: ConversationSelection, comment?: string): boolean {
    if (this.currentSessionId() !== selection.parentSessionId) return false
    const input = this.currentParentInput()
    if (input === undefined || !addSelection(input, selection, comment)) return false
    this.annotationPersistence.reconcile(selection.parentSessionId, input)
    return true
  }
  addSideChatToConversation(parentSessionId: SessionId, reference: ReferencedSideChatConversation): boolean {
    const scope = this.ctx.sessions.scope(dshId(parentSessionId))
    const input = scope === undefined ? undefined : this.parentInput(scope)
    if (input === undefined || !addReferencedSideChatToConversation(input, reference)) return false
    this.annotationPersistence.reconcile(parentSessionId, input)
    return true
  }
  removeConversationAnnotation(index: number): boolean {
    const id = this.currentSessionId()
    const input = this.currentParentInput()
    if (id === undefined || input === undefined || !removeAnnotation(input, index)) return false
    this.annotationPersistence.reconcile(id, input)
    return true
  }
  updateConversationAnnotation(index: number, comment?: string): boolean {
    const id = this.currentSessionId()
    const input = this.currentParentInput()
    if (id === undefined || input === undefined || !updateAnnotation(input, index, comment)) return false
    this.annotationPersistence.reconcile(id, input)
    return true
  }
  reconcileConversationAnnotationPersistence(): void {
    const id = this.currentSessionId()
    const input = this.currentParentInput()
    if (id !== undefined && input !== undefined) this.annotationPersistence.reconcile(id, input)
  }
  nextConversationAnnotationNumber(): number {
    const snapshot = this.currentConversationInputSnapshot()
    return snapshot === undefined ? 1 : conversationAnnotations(snapshot).length + 1
  }
  removeConversationAnnotations(id = this.currentSessionId()): boolean {
    const scope = id === undefined ? undefined : this.ctx.sessions.scope(dshId(id))
    const input = scope === undefined ? undefined : this.parentInput(scope)
    if (id === undefined || input === undefined || !removeAnnotations(input)) return false
    this.annotationPersistence.reconcile(id, input)
    return true
  }
  retainParent(id: SessionId): () => void {
    const reference = this.ctx.sessions.retain(dshId(id), { source: 'sideChat' })
    let active = true
    void reference.ready.catch(() => { if (active) this.notify({ kind: 'warning', text: 'The parent conversation could not be loaded.' }) })
    return () => { active = false; reference.release() }
  }
  async openSession(id: SessionId): Promise<void> { this.ctx.uiWorkspace.openSession(dshId(id)) }
  notify(message: { readonly kind: 'status' | 'warning'; readonly text: string }): void {
    console[message.kind === 'warning' ? 'warn' : 'info'](`[dsh-side-chat] ${message.text}`)
    this.currentParentInput()?.notify?.(message.kind === 'warning' ? 'error' : 'info', message.text)
  }
  face(id: SessionId): ParentConversationFace | undefined {
    const source = this.ctx.sessions.binding(dshId(id))?.session
    if (source === undefined) return
    const existing = this.faces.get(source)
    if (existing !== undefined) return existing
    const conversation = this.ctx.uiConversation.binding(source.sessionId)
    conversation.activate('chat')
    const face = new DshParentConversation(conversation.target('chat'))
    this.faces.set(source, face)
    return face
  }
  title(id: SessionId): string | undefined { return this.ctx.sessions.list.getSnapshot().byId[dshId(id)]?.displayTitle }
  modelDirectory(id: SessionId): ModelDirectory | undefined {
    try { return this.ctx.modelDirectories.directoryFor(dshId(id)) } catch { return undefined }
  }
  sideChatModelPreference(): SideChatModelSelection | undefined { return this.modelPreferences.get() }
  rememberSideChatModelPreference(model: SideChatModelSelection): void { this.modelPreferences.set(model) }
  private currentParentInput(): ParentComposerInput | undefined {
    const id = this.currentSessionId()
    const scope = id === undefined ? undefined : this.ctx.sessions.scope(dshId(id))
    return scope === undefined ? undefined : this.parentInput(scope)
  }
  private parentInput(scope: Context): ParentComposerInput | undefined {
    const source = this.ctx.conversation.input.for(scope)
    if (source === undefined) return
    const existing = this.parentInputs.get(source)
    if (existing !== undefined) return existing
    const input: ParentComposerInput = {
      state: source.state, setDraft: text => { source.setDraft(text) },
      notify: (level, text) => source.notify?.(level, text),
      insertReference: (reference, span) => source.insertReference(reference, span),
      replaceText: (text, span) => scope.bail(scope, 'slash/input-insert-text', { text, span }) === true,
    }
    this.parentInputs.set(source, input)
    return input
  }
}
export function selectionDescriptor(snapshot: ParentConversationSnapshot, anchorKey: string): {
  readonly nodeKey: string; readonly nodeKind: string; readonly turnKey: string; readonly seq: number
  readonly source: 'user' | 'assistant' | 'context' | 'code'; readonly modelVisible: boolean; readonly settled: boolean
} | undefined {
  const node = snapshot.chatNodes.get(anchorKey)
  if (node === undefined || node.visibility !== 'visible') return
  const source = node.kind === 'user' || node.kind === 'steering' ? 'user'
    : node.kind === 'assistant-step' ? 'assistant' : node.kind === 'context' ? 'context' : undefined
  const turn = node.location.kind === 'turn' || node.location.kind === 'step' ? node.location.turn.turn : undefined
  if (source === undefined || turn === undefined) return
  return { nodeKey: node.key, nodeKind: node.kind, turnKey: `turn:${String(turn)}`, seq: node.anchorSeq,
    source, modelVisible: true, settled: locationSettled(node.location) }
}
