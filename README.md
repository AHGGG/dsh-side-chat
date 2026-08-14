# dsh-side-chat

Ask a focused follow-up about selected text without leaving your current DeepSeek Harness conversation.

> Compatibility: this release targets `@deepseek-ai/dsh@0.1.0-rc.6` exactly.

[简体中文](README.zh-CN.md)

## Install

Install DSH rc.6 if it is not already available, then add the plugin to the Web profile:

```powershell
npm install --global @deepseek-ai/dsh@0.1.0-rc.6
dsh plugin --profile web add @ahggg/dsh-side-chat@0.1.0-alpha.1
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
3. Click `Ask in side chat`.
4. Enter a question and press `Enter` to send it.
5. Press `Esc` or click `×` when you are done.

Useful details:

- `Shift+Enter` inserts a newline.
- The input grows with its content and becomes scrollable at its maximum height.
- Hover over `1 annotation` to preview the selected text.
- Before the first send, hover over the annotation and click `×` to remove it.
- The main conversation stays visible and is never switched to the child Session.

## What happens to the conversation

The first send creates a real DSH Session fork at the selected message. The child inherits the complete event prefix, model configuration, presets, and workspace. Keeping the prefix unchanged is friendly to provider prompt caching, although a cache hit is never guaranteed.

Closing Side Chat stops active work, archives the child Session, and releases its Agent. It does not delete the child's history from disk. The child and copied prefix therefore consume normal DSH Session storage.

The parent and child share the same workspace. File changes, commands, and other tool side effects made in Side Chat are real and are not reverted when the panel closes.

## Current limitations

- A selection must stay inside one completed message.
- Attachments, `Add to conversation`, and `/side` are not supported yet.
- Closed Side Chats cannot be reopened from the panel.
- There is no automatic history cleanup or “keep as normal chat” action.
- An archived child may briefly appear in normal Session lists.

## Upgrade or remove

Install the new exact plugin version and restart DSH:

```powershell
dsh plugin --profile web add @ahggg/dsh-side-chat@<version>
```

Remove the plugin with:

```powershell
dsh plugin --profile web remove @ahggg/dsh-side-chat
```

<details>
<summary>Local development and publishing</summary>

Requires Node.js `^22.19.0 || >=24.0.0` and pnpm `11.7.0`.

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm clean-profile:verify
```

Build and install a local package:

```powershell
npm pack
dsh plugin --profile web add .\ahggg-dsh-side-chat-0.1.0-alpha.1.tgz
```

Publish after the checks pass:

```powershell
npm pack --dry-run
npm pack
npm login
npm publish .\ahggg-dsh-side-chat-0.1.0-alpha.1.tgz --access public --tag alpha
```

The first release must be published manually because npm only allows Trusted Publishing to be configured for an existing package. After `0.1.0-alpha.1` exists, configure its npm Trusted Publisher with:

- Organization or user: `AHGGG`
- Repository: `dsh-side-chat`
- Workflow: `release.yml`
- Environment: `npm`
- Allowed action: `npm publish`

Future releases follow the same flow as `pi-kanban`: conventional commits update a release pull request; merging that pull request creates the GitHub prerelease and publishes the matching npm version under the `alpha` tag through OIDC. No `NPM_TOKEN` secret is required.

</details>

## License

MIT
