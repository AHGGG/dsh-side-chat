# dsh-side-chat

Ask a focused follow-up about selected text without leaving your current DeepSeek Harness conversation.

> Compatibility: this release targets `@deepseek-ai/dsh@0.1.0-rc.6` exactly.

[简体中文](README.zh-CN.md)

![Ask about selected text in Side Chat, then add an annotated selection to the main chat](https://raw.githubusercontent.com/AHGGG/dsh-side-chat/master/docs/assets/side-chat-demo.gif)

## Install

Install DSH rc.6 if it is not already available. Refresh only this package's registry metadata before adding it, so pnpm cannot reuse an older `latest` value immediately after a release:

```powershell
npm install --global @deepseek-ai/dsh@0.1.0-rc.6
pnpm cache delete "@ahggg/dsh-side-chat"
dsh plugin --profile web add @ahggg/dsh-side-chat@latest
```

Start DSH from the project you want the agent to work in:

```powershell
cd E:\path\to\your-project
dsh web --port 3080
```

Open the URL printed by DSH. The plugin loads automatically in the Web client.

## Use Side Chat

1. Complete at least one turn in the main conversation.
2. Select text inside one completed user or assistant message.
3. Click `Add to chat` to add an optional comment before attaching the passage to the main composer, `More details` to send an explanation request immediately, or `Ask in side chat` to write a focused question.
4. When writing your own message or question, press `Enter` to send it.
5. Press `Esc` or click `×` when you are done.

Useful details:

- `Shift+Enter` inserts a newline.
- Use the model control beside Send to choose a provider/model and its available reasoning effort. The choice belongs to Side Chat, does not change the main conversation, and becomes the global default for the next Side Chat.
- After clicking `Add to chat`, press `Enter` or click `Save` to keep the annotation. Click outside the comment box or click `Cancel` to discard it.
- `Add to chat` keeps any existing draft text and can collect multiple numbered passages, each with its own optional comment, in one annotation capsule.
- The input grows with its content and becomes scrollable at its maximum height.
- While a reply is running, the send icon becomes a stop button.
- Assistant replies use DSH's native Markdown rendering.
- Hover over `N annotations` to preview every selected passage and its comment.
- Before sending, hover over the annotation capsule and click `×` to remove it; after sending, the same capsule appears above the user message.
- The main conversation stays visible and is never switched to the child Session.

## What happens to the conversation

The first send creates a real DSH Session fork at the selected message. The child inherits the complete event prefix, presets, and workspace. Its initial model choice uses the last accepted Side Chat choice when one is saved, otherwise it snapshots the parent configuration; later model or reasoning-effort changes apply to subsequent child steps without changing or following the parent conversation. Keeping the prefix unchanged is friendly to provider prompt caching, although a cache hit is never guaranteed.

Closing Side Chat stops active work, archives the child Session, and releases its Agent. It does not delete the child's history from disk. The child and copied prefix therefore consume normal DSH Session storage.

The parent and child share the same workspace. File changes, commands, and other tool side effects made in Side Chat are real and are not reverted when the panel closes.

## Current limitations

- A selection must stay inside one completed message.
- Attachments and `/side` are not supported yet.
- Closed Side Chats cannot be reopened from the panel.
- There is no automatic history cleanup or “keep as normal chat” action.
- An archived child may briefly appear in normal Session lists.

## Upgrade or remove

Refresh this package's registry metadata, update to the latest stable version, and restart DSH:

```powershell
pnpm cache delete "@ahggg/dsh-side-chat"
dsh plugin --profile web update @ahggg/dsh-side-chat --latest
```

Remove the plugin with:

```powershell
dsh plugin --profile web remove @ahggg/dsh-side-chat
```

## License

MIT

## References

- https://www.v2ex.com
- https://linux.do
- https://linux.sb
