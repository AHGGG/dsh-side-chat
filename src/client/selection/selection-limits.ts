import { MAX_SELECTION_BYTES } from '../../shared/constants.js'

/** UTF-8 byte length used by the complete selection admission limit. */
export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

/** Whether a selected passage fits the v1 privacy and performance limit. */
export function selectionFitsLimit(value: string): boolean {
  return utf8ByteLength(value) <= MAX_SELECTION_BYTES
}

/** Code-point-safe preview that never cuts a surrogate pair. */
export function summarizeSelection(value: string, maxCodePoints = 240): string {
  const points = [...value]
  if (points.length <= maxCodePoints) return value
  const headLength = Math.ceil(maxCodePoints * 0.65)
  const tailLength = maxCodePoints - headLength
  return `${points.slice(0, headLength).join('')}…${points.slice(-tailLength).join('')}`
}
