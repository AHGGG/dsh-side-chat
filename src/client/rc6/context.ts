import type { Context } from '@deepseek-ai/cordis'
import type { ClientRemote } from '@deepseek-ai/dsh-api-remotes/client'
import type { ISessions, SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'

/** Browser-only Cordis view for a package that also compiles the Host half. */
export type Rc6ClientContext = Omit<Context, 'remote' | 'sessions' | 'slots'> & {
  readonly remote: ClientRemote
  readonly sessions: ISessions
  readonly slots: SlotRegistry
}
