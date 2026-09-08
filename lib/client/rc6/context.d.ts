import type { Context } from '@deepseek-ai/cordis';
import type { ClientRemote } from '@deepseek-ai/dsh-api-remotes/client';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { UiConversation } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client';
import type { UiSession } from '@deepseek-ai/dsh-client-ui-session/client';
import type { ParentConversationService, SelectionReferenceSource } from '../parent-composer/add-to-conversation.js';
/** Browser-only Cordis view for a package that also compiles the Host half. */
export type Rc6ClientContext = Omit<Context, 'conversation' | 'inputTriggers' | 'modelDirectories' | 'remote' | 'sessions' | 'slots' | 'uiConversation' | 'uiSession'> & {
    readonly conversation: ParentConversationService;
    readonly inputTriggers: {
        registerSource(source: SelectionReferenceSource): () => void;
    };
    readonly modelDirectories: ModelDirectoryResolver;
    readonly remote: ClientRemote;
    readonly sessions: ISessions;
    readonly slots: SlotRegistry;
    /** Added by DSH 0.1.2; absent on the monolithic 0.1.0/0.1.1 runtime. */
    readonly uiConversation?: Pick<UiConversation, 'binding'>;
    /** Added by DSH 0.1.2; absent on the monolithic 0.1.0/0.1.1 runtime. */
    readonly uiSession?: Pick<UiSession, 'pendingInteractions'>;
};
