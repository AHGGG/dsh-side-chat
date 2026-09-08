/** UTF-8 byte length used by the complete selection admission limit. */
export declare function utf8ByteLength(value: string): number;
/** Whether a selected passage fits the v1 privacy and performance limit. */
export declare function selectionFitsLimit(value: string): boolean;
/** Code-point-safe preview that never cuts a surrogate pair. */
export declare function summarizeSelection(value: string, maxCodePoints?: number): string;
