# Privacy and retention

On DSH `0.1.0-rc.6`, every Side Chat is an ordinary persistent Session fork.

- The copied parent prefix and child turns can be written to normal Session storage.
- The child can appear in normal Session navigation while open.
- Close archives the Session; it does not delete Session files.
- There is no automatic cleanup in the first release.
- A crash or forced exit can prevent archive and leave the child visible.

Selection text is placed in the first child prompt. The package does not log the selected text itself.

Unsent parent-composer annotations are mirrored in tab-scoped `sessionStorage` so the plugin can rebuild rc.6 reference occurrences after a page refresh. That record contains the selected text, optional comment, source anchor, and the exact raw draft signature. It is keyed by parent Session, removed when the annotation is removed or sent, and discarded by the browser when the tab closes. If storage is unavailable or the signature does not match, the plugin removes only its orphaned placeholder and does not restore by text matching.

Parent and child share the same workspace and normal DSH tool permissions. File writes, commands, and external side effects are not rolled back on close.

The child copies the complete legal event prefix and inserts no extra system/developer message before the first new user question. This is cache-friendly but does not guarantee a provider cache hit.
