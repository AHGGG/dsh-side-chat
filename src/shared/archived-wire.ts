import { z } from 'zod'
import { SIDE_CHAT_ERROR_CODES } from './error-codes.js'

const id = z.string().min(1).max(512)

const modelSelectionSchema = z.object({
  provider: id,
  model: id,
  reasoningEffort: id.optional(),
}).strict()

export const sideChatWireErrorSchema = z.object({
  code: z.enum(SIDE_CHAT_ERROR_CODES),
  message: z.string(),
  recoverable: z.boolean(),
}).strict()

export const archivedCreateRequestSchema = z.object({
  parentSessionId: id,
  atSeq: z.number().finite().nonnegative(),
  modelSelection: modelSelectionSchema.optional(),
}).strict()

export const archivedSelectModelRequestSchema = z.object({
  childSessionId: id,
  provider: id,
  model: id,
  reasoningEffort: id.optional(),
}).strict()

export const archivedCloseRequestSchema = z.object({
  childSessionId: id,
}).strict()

const createValueSchema = z.object({
  parentSessionId: id,
  childSessionId: id,
  boundarySeq: z.number().int().nonnegative(),
  inheritedThroughSeq: z.number().int().nonnegative(),
  modelSelection: modelSelectionSchema.optional(),
}).strict()

const selectModelValueSchema = z.object({
  selected: modelSelectionSchema,
}).strict()

const closeValueSchema = z.object({ closed: z.literal(true) }).strict()

function resultSchema<Value extends z.ZodType>(value: Value) {
  return z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), value }).strict(),
    z.object({ ok: z.literal(false), error: sideChatWireErrorSchema }).strict(),
  ])
}

export const archivedCreateResultSchema = resultSchema(createValueSchema)
export const archivedSelectModelResultSchema = resultSchema(selectModelValueSchema)
export const archivedCloseResultSchema = resultSchema(closeValueSchema)
