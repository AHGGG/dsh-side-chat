export interface SideChatMessages {
    readonly title: string;
    readonly close: string;
    readonly addToConversation: string;
    readonly placeholder: string;
    readonly send: string;
    readonly selectedPassage: string;
    readonly selectionAttachments: (count: number) => string;
    readonly selectionPreviewLabel: string;
    readonly selectionCommentLabel: string;
    readonly removeSelection: string;
    readonly expand: string;
    readonly collapse: string;
    readonly temporary: string;
    readonly referenceOnly: string;
    readonly cannotReopen: string;
    readonly sharedWorkspace: string;
    readonly retry: string;
    readonly genericError: string;
    readonly closeError: string;
}
export declare const SIDE_CHAT_MESSAGES: Readonly<Record<'en' | 'zh-CN', SideChatMessages>>;
