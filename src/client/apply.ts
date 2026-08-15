import { createElement } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import sideChatCss from './panel/side-chat.css'
import { selectionReferenceSource } from './parent-composer/add-to-conversation.js'
import { mountParentConversationAnnotations } from './parent-composer/ParentConversationAnnotations.js'
import { SideChatController } from './side-chat-controller.js'
import { mountArchivedRemote } from './rc6/remote-adapter.js'
import { Rc6SideChatOverlay } from './rc6/Rc6SideChatOverlay.js'
import { Rc6SideChatSessions } from './rc6/sessions-adapter.js'
import type { Rc6ClientContext } from './rc6/context.js'

export const name = 'side-chat-client'
export const inject = ['conversation', 'inputTriggers', 'modelDirectories', 'remote', 'sessions', 'slots']

export async function apply(ctx: Context): Promise<void> {
  const stylesheet = document.createElement('style')
  stylesheet.textContent = sideChatCss
  stylesheet.dataset.plugin = 'dsh-side-chat'
  stylesheet.dataset['dshSideChat'] = 'styles'
  document.head.append(stylesheet)

  const clientCtx = ctx as unknown as Rc6ClientContext
  const mounted = await mountArchivedRemote(clientCtx)
  const removeSelectionReferenceSource = clientCtx.inputTriggers.registerSource(selectionReferenceSource)
  const sessions = new Rc6SideChatSessions(clientCtx)
  const removeParentAnnotations = mountParentConversationAnnotations(
    clientCtx,
    () => { sessions.removeConversationAnnotations() },
  )
  const controller = new SideChatController(mounted.remote, sessions)
  const removeOverlay = clientCtx.slots.inject('shell.overlay', () => clientCtx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-side-chat',
    order: 90,
  }, () => createElement(Rc6SideChatOverlay, { controller, sessions })))

  ctx.effect(() => async () => {
    try {
      await controller.dispose()
    } finally {
      removeParentAnnotations()
      removeSelectionReferenceSource()
      removeOverlay()
      await mounted.dispose()
      stylesheet.remove()
    }
  }, 'dsh-side-chat.clientLifecycle')
}
