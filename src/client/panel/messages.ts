export interface SideChatMessages {
  readonly title: string
  readonly close: string
  readonly addToConversation: string
  readonly placeholder: string
  readonly send: string
  readonly selectedPassage: string
  readonly selectionAttachments: (count: number) => string
  readonly selectionPreviewLabel: string
  readonly selectionCommentLabel: string
  readonly removeSelection: string
  readonly expand: string
  readonly collapse: string
  readonly temporary: string
  readonly referenceOnly: string
  readonly cannotReopen: string
  readonly readOnly: string
  readonly retry: string
  readonly genericError: string
  readonly closeError: string
}

export const SIDE_CHAT_MESSAGES: Readonly<Record<'en' | 'zh-CN', SideChatMessages>> = Object.freeze({
  en: Object.freeze({
    title: 'Side Chat',
    close: 'Close Side Chat',
    addToConversation: 'Add to conversation',
    placeholder: 'Ask about this in a Side Chat',
    send: 'Send',
    selectedPassage: 'Selected passage',
    selectionAttachments: (count: number) => `${String(count)} ${count === 1 ? 'annotation' : 'annotations'}`,
    selectionPreviewLabel: 'Selected text',
    selectionCommentLabel: 'User comment',
    removeSelection: 'Remove annotation',
    expand: 'Expand',
    collapse: 'Collapse',
    temporary: 'Temporary; discarded when closed or reloaded',
    referenceOnly: 'Read-only parent context; no Session copy',
    cannotReopen: 'Add to conversation to keep this discussion',
    readOnly: 'No tools or file changes',
    retry: 'Retry',
    genericError: 'Side Chat error',
    closeError: 'Could not close the Side Chat',
  }),
  'zh-CN': Object.freeze({
    title: '侧边对话',
    close: '关闭侧边对话',
    addToConversation: '添加到主对话',
    placeholder: '在侧边对话中询问这段内容',
    send: '发送',
    selectedPassage: '所选段落',
    selectionAttachments: (count: number) => `${String(count)} 条引用`,
    selectionPreviewLabel: '所选文本',
    selectionCommentLabel: '用户批注',
    removeSelection: '移除引用',
    expand: '展开',
    collapse: '收起',
    temporary: '临时对话；关闭或刷新后丢弃',
    referenceOnly: '只读父会话上下文；不复制 Session',
    cannotReopen: '添加到主对话以保留讨论内容',
    readOnly: '不使用工具，不修改文件',
    retry: '重试',
    genericError: '侧边对话错误',
    closeError: '无法关闭侧边对话',
  }),
})
