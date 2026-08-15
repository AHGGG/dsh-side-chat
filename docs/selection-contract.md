# Conversation selection

The rc.6 Client reads a browser selection only after it appears inside `[data-chat-flow]` and one `[data-chat-anchor-key]` message.

A valid selection:

- contains visible non-empty text;
- stays inside one completed user, assistant, or context message;
- is at most 16 KiB after UTF-8 encoding;
- still belongs to the current parent Session when first sent.

The selected text is shown as a quote in the panel and added to the first child prompt. Host receives only `parentSessionId` and the selected message event sequence when creating the fork.

An unsent **Add to chat** annotation keeps its public message anchor and visible-text offsets inside the existing composer reference. The Client rebuilds a highlight and numbered edit marker only while that exact anchored text still matches the rendered message. Removing or sending the composer annotation removes that projection; legacy references without an anchor remain readable but are never matched by text alone.

Because rc.6 persists the draft separately from its runtime occurrence table, the Client mirrors the exact annotation reference in tab-scoped `sessionStorage`. On refresh it rehydrates only when the Session id and raw draft signature both match. Otherwise it removes the plugin-owned orphan prefix so `U+FFFC` cannot be submitted as visible user text.
