import type { ContentBlock } from '@deepseek-ai/dsh-api-remotes/client';
import type { RunningToolCall, ToolCallBlock } from './runtime-compat.js';
export type ToolState = 'pending' | 'running' | 'success' | 'error' | 'interrupted';
export declare function toolOutputText(content: readonly ContentBlock[]): string;
export declare function ToolCard({ callId, name, argsRaw, state, output, callView, resultView, cwd, }: {
    readonly callId: string;
    readonly name: string;
    readonly argsRaw: string;
    readonly state: ToolState;
    readonly output?: string | undefined;
    readonly callView?: unknown;
    readonly resultView?: unknown;
    readonly cwd?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
export declare function ToolBlockCard({ block, cwd }: {
    readonly block: ToolCallBlock;
    readonly cwd?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
export declare function RunningToolCard({ call, cwd }: {
    readonly call: RunningToolCall;
    readonly cwd?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
