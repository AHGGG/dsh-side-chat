import { z } from 'zod'
import { SIDE_CHAT_ERROR_CODES } from './error-codes.js'

const id = z.string().min(1).max(512)

export const sideChatWireErrorSchema = z.object({
  code: z.enum(SIDE_CHAT_ERROR_CODES),
  message: z.string(),
  recoverable: z.boolean(),
}).strict()

export const archivedCreateRequestSchema = z.object({
  parentSessionId: id,
  atSeq: z.number().finite().nonnegative(),
}).strict()

export const archivedCloseRequestSchema = z.object({
  childSessionId: id,
}).strict()

const createValueSchema = z.object({
  parentSessionId: id,
  childSessionId: id,
  boundarySeq: z.number().int().nonnegative(),
  inheritedThroughSeq: z.number().int().nonnegative(),
}).strict()

const closeValueSchema = z.object({ closed: z.literal(true) }).strict()

function resultSchema<Value extends z.ZodType>(value: Value) {
  return z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), value }).strict(),
    z.object({ ok: z.literal(false), error: sideChatWireErrorSchema }).strict(),
  ])
}

export const archivedCreateResultSchema = resultSchema(createValueSchema)
export const archivedCloseResultSchema = resultSchema(closeValueSchema)
