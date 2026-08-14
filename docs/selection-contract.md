# Conversation selection

The rc.6 Client reads a browser selection only after it appears inside `[data-chat-flow]` and one `[data-chat-anchor-key]` message.

A valid selection:

- contains visible non-empty text;
- stays inside one completed user, assistant, or context message;
- is at most 16 KiB after UTF-8 encoding;
- still belongs to the current parent Session when first sent.

The selected text is shown as a quote in the panel and added to the first child prompt. Host receives only `parentSessionId` and the selected message event sequence when creating the fork.
