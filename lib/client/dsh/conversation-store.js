const EMPTY = { turnEnds: new Map(), chatNodes: { get: () => undefined } };
/** Read-only parent Chat projection, used only for selection anchors and turn boundaries. */
export class DshParentConversation {
    chat;
    source;
    snapshot = EMPTY;
    constructor(chat) {
        this.chat = chat;
    }
    subscribe = (listener) => this.chat.subscribe(listener);
    getSnapshot = () => {
        const source = this.chat.getSnapshot();
        if (source !== this.source) {
            this.source = source;
            this.snapshot = source === undefined ? EMPTY : { turnEnds: source.legacy.turnEnds, chatNodes: source.nodes };
        }
        return this.snapshot;
    };
}
