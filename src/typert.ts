import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'
import {
  cancelResultSchema, chatRequestSchema, closeResultSchema, createRequestSchema, createResultSchema,
  selectModelRequestSchema, selectModelResultSchema, sendRequestSchema, streamEventSchema,
} from './shared/side-chat-wire.js'

type Schema = { parse(value: unknown): unknown }
function invocation(method: string, requestType: string, resultType: string,
  request: Schema, result: Schema, options: { stream?: boolean; cancellation?: boolean } = {}): InvocationDescriptor {
  return {
    id: `@ahggg/dsh-side-chat#sideChat/${method}`, service: 'sideChat', namespace: 'sideChat',
    method, implementation: method, invocation: { kind: 'direct' },
    ...(options.stream ? { mode: 'stream' as const } : {}),
    ...(options.cancellation ? { cancellation: { parameter: 'signal' as const } } : {}),
    parameters: [{ name: 'request', wire: 'request', source: 'json', codec: {
      mode: 'strict', typeSymbol: `@ahggg/dsh-side-chat/remote#${requestType}`, create: () => request,
    } }],
    result: { mode: 'strict', typeSymbol: `@ahggg/dsh-side-chat/remote#${resultType}`, create: () => result },
    sourceLocation: { file: 'src/index.ts', line: 1, column: 1 },
  }
}
export const SIDE_CHAT_INVOCATIONS = [
  invocation('create', 'CreateSideChatRequest', 'CreateResult', createRequestSchema, createResultSchema, { cancellation: true }),
  invocation('selectModel', 'SelectSideChatModelRequest', 'SelectModelResult', selectModelRequestSchema, selectModelResultSchema, { cancellation: true }),
  invocation('stream', 'SendSideChatRequest', 'SideChatStreamEvent', sendRequestSchema, streamEventSchema, { stream: true, cancellation: true }),
  invocation('cancel', 'ChatRequest', 'CancelResult', chatRequestSchema, cancelResultSchema),
  invocation('close', 'ChatRequest', 'CloseResult', chatRequestSchema, closeResultSchema),
]
export const TYPERT = {
  package: '@ahggg/dsh-side-chat', face: 'host', schemas: [],
  model: { services: [], events: [], objects: [] }, invocations: SIDE_CHAT_INVOCATIONS,
}
export default TYPERT
