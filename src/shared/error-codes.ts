export const SIDE_CHAT_ERROR_CODES = [
  'selection_empty',
  'selection_outside_conversation',
  'selection_not_model_visible',
  'selection_too_large',
  'selection_stale',
  'selection_crosses_unsupported_nodes',
  'parent_session_missing',
  'parent_session_not_ready',
  'fork_unavailable',
  'side_chat_already_open',
  'side_chat_not_found',
  'side_chat_open_failed',
  'side_chat_prompt_failed',
  'side_chat_model_failed',
  'side_chat_interrupt_failed',
  'side_chat_destroy_failed',
  'transport_error',
  'invalid_request',
  'internal_error',
] as const

export type SideChatErrorCode = (typeof SIDE_CHAT_ERROR_CODES)[number]

export function isSideChatErrorCode(value: unknown): value is SideChatErrorCode {
  return typeof value === 'string'
    && (SIDE_CHAT_ERROR_CODES as readonly string[]).includes(value)
}
