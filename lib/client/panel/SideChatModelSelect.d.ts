import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { SideChatModelSelection } from '../../shared/contracts.js';
import type { SideChatActionResult } from '../contracts.js';
export interface SideChatModelSelectProps {
    readonly directory: ModelDirectory;
    readonly selection?: SideChatModelSelection | undefined;
    readonly locked: boolean;
    readonly validateInitialSelection?: boolean;
    readonly locale?: 'en' | 'zh-CN';
    readonly onInitialize: (selection: SideChatModelSelection, options: {
        readonly remember: boolean;
    }) => void;
    readonly onSelect: (selection: SideChatModelSelection) => Promise<SideChatActionResult<SideChatModelSelection>>;
}
/** Side Chat projection of DSH Web's native composer model selector. */
export declare function SideChatModelSelect({ directory, selection, locked, validateInitialSelection, locale, onInitialize, onSelect, }: SideChatModelSelectProps): import("react/jsx-runtime").JSX.Element;
