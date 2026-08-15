export { apply, inject, name } from './apply.js'
export type {
  SideChatActionResult,
  SideChatClientSessions,
  SideChatSessionBinding,
  SideChatSessionLease,
  SideChatSessionSnapshot,
} from './contracts.js'
export { SideChatController } from './side-chat-controller.js'
export { buildSideChatPrompt } from './parent-composer/add-to-conversation.js'
export { SideChatPanel, type SideChatPanelProps } from './panel/SideChatPanel.js'
export { SelectionActions, type SelectionActionsProps } from './selection/SelectionActions.js'
export {
  captureDomConversationSelection,
  restoreDomConversationSelection,
  type RestoredConversationSelection,
  type SelectionAnchorResolver,
  type SelectionNodeDescriptor,
} from './selection/selection-controller.js'
export { selectionFitsLimit, summarizeSelection, utf8ByteLength } from './selection/selection-limits.js'
export {
  assertSelectionCurrent,
  finalizeConversationSelection,
  normalizeSelectedText,
  SelectionValidationError,
  type ConversationSelectionInput,
} from './selection/selection-normalizer.js'
export type {
  ConversationSelection,
  SelectionFragment,
  SelectionRect,
  SideChatModelSelection,
  SideChatState,
} from '../shared/contracts.js'
