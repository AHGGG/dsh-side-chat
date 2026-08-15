import {
  archivedCloseRequestSchema,
  archivedCloseResultSchema,
  archivedCreateRequestSchema,
  archivedCreateResultSchema,
  archivedSelectModelRequestSchema,
  archivedSelectModelResultSchema,
} from './shared/archived-wire.js'

function invocation(
  method: 'create' | 'selectModel' | 'close',
  implementation: string,
  parameterSchema: { parse(value: unknown): unknown },
  resultSchema: { parse(value: unknown): unknown },
) {
  const requestType = method === 'create'
    ? 'CreateSideChatRequest'
    : method === 'selectModel'
      ? 'SelectSideChatModelRequest'
      : 'CloseSideChatRequest'
  const resultType = method === 'create'
    ? 'ArchivedCreateResult'
    : method === 'selectModel'
      ? 'ArchivedSelectModelResult'
      : 'ArchivedCloseResult'
  return {
    id: `@ahggg/dsh-side-chat#sideChatArchived/${method}`,
    service: 'sideChat',
    namespace: 'sideChatArchived',
    method,
    implementation,
    invocation: { kind: 'direct' as const },
    parameters: [{
      name: 'request',
      wire: 'request',
      source: 'json' as const,
      codec: {
        mode: 'strict' as const,
        typeSymbol: `@ahggg/dsh-side-chat/remote#${requestType}`,
        schema: parameterSchema,
      },
    }],
    result: {
      mode: 'strict' as const,
      typeSymbol: `@ahggg/dsh-side-chat/remote#${resultType}`,
      schema: resultSchema,
    },
    sourceLocation: { file: 'src/index.ts', line: 1, column: 1 },
  }
}

export const ARCHIVED_INVOCATIONS = [
  invocation('create', 'createArchived', archivedCreateRequestSchema, archivedCreateResultSchema),
  invocation('selectModel', 'selectArchivedModel', archivedSelectModelRequestSchema, archivedSelectModelResultSchema),
  invocation('close', 'closeArchived', archivedCloseRequestSchema, archivedCloseResultSchema),
]

export const TYPERT = {
  package: '@ahggg/dsh-side-chat',
  face: 'host',
  schemas: [],
  model: { services: [], events: [], objects: [] },
  invocations: ARCHIVED_INVOCATIONS,
}

export default TYPERT
