import type { Context } from '@deepseek-ai/cordis'
import type { ClientRemote } from '@deepseek-ai/dsh-api-remotes/client'
import type { ISessions, SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import type {
  ParentConversationService,
  SelectionReferenceSource,
} from '../parent-composer/add-to-conversation.js'

/** Browser-only Cordis view for a package that also compiles the Host half. */
export type Rc6ClientContext = Omit<
  Context,
  'conversation' | 'inputTriggers' | 'remote' | 'sessions' | 'slots'
> & {
  readonly conversation: ParentConversationService
  readonly inputTriggers: {
    registerSource(source: SelectionReferenceSource): () => void
  }
  readonly remote: ClientRemote
  readonly sessions: ISessions
  readonly slots: SlotRegistry
}
