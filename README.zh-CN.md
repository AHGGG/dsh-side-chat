# dsh-side-chat

在不离开当前 DeepSeek Harness 主会话的情况下，针对选中的文本发起一个独立的侧边对话。

> 兼容性：当前版本仅适配 `@deepseek-ai/dsh@0.1.0-rc.6`。

[English](README.md)

![选中文本、打开 Side Chat、提问并按 Escape 关闭](https://raw.githubusercontent.com/AHGGG/dsh-side-chat/master/docs/assets/side-chat-demo.gif)

## 安装

如果尚未安装 DSH rc.6，先安装它，然后把插件添加到 Web profile：

```powershell
npm install --global @deepseek-ai/dsh@0.1.0-rc.6
dsh plugin --profile web add @ahggg/dsh-side-chat
```

从希望 Agent 操作的真实工程目录启动 DSH：

```powershell
cd E:\path\to\your-project
dsh web --port 3080
```

打开 DSH 输出的网址，插件会自动加载到 Web 客户端中。

## 使用 Side Chat

1. 在主会话中至少完成一轮对话。
2. 在一条已完成的用户或助手消息内选中文字。
3. 点击 `Ask in side chat`。
4. 输入问题，按 `Enter` 发送。
5. 完成后按 `Esc`，或者点击 `×` 关闭。

常用操作：

- `Shift+Enter` 换行。
- 输入框会随内容自动增高，达到最大高度后在内部滚动。
- hover `1 annotation` 可以预览所选文本。
- 第一次发送前，可以 hover annotation 并点击 `×` 移除引用。
- 主会话会一直保留在页面中，不会自动切换到 child Session。

## 会话和数据如何处理

第一次发送时，插件会在所选消息处创建一个真实的 DSH Session fork。child 会继承完整事件前缀、模型配置、preset 和 workspace。保持前缀不变有利于供应商的 prompt cache 复用，但不保证一定命中缓存。

关闭 Side Chat 时，插件会停止正在运行的任务、归档 child Session，并释放其 Agent；不会删除 child 的磁盘历史。因此，child 和复制的完整前缀会占用正常的 DSH Session 存储空间。

父会话与 child 共享同一个 workspace。Side Chat 中产生的文件修改、命令执行及其他工具副作用都是真实的，关闭面板不会撤销它们。

## 当前限制

- 选区必须位于同一条已完成消息内。
- 暂不支持附件、`Add to conversation` 和 `/side`。
- 关闭后不能从面板重新打开原 Side Chat。
- 暂无自动历史清理或“保留为普通会话”操作。
- 已归档的 child 可能短暂出现在普通会话列表中。

## 升级或卸载

安装最新版本并重启 DSH：

```powershell
dsh plugin --profile web add @ahggg/dsh-side-chat
```

卸载插件：

```powershell
dsh plugin --profile web remove @ahggg/dsh-side-chat
```

<details>
<summary>本地开发与发布</summary>

要求 Node.js `^22.19.0 || >=24.0.0` 和 pnpm `11.7.0`。

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm clean-profile:verify
```

构建并安装本地包：

```powershell
$packageTarball = (npm pack --ignore-scripts --json | ConvertFrom-Json).filename
dsh plugin --profile web add ".\$packageTarball"
```

检查通过后发布：

```powershell
npm pack --dry-run
$packageTarball = (npm pack --ignore-scripts --json | ConvertFrom-Json).filename
npm login
npm publish ".\$packageTarball" --access public
```

在 npm 中为这个包完成一次 Trusted Publisher 配置：

- Organization or user：`AHGGG`
- Repository：`dsh-side-chat`
- Workflow：`release.yml`
- Environment：`npm`
- Allowed action：`npm publish`

还需要在 GitHub 中开启 **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**，release-please 才能维护 release PR。

后续发布与 `pi-kanban` 一致：conventional commits 自动更新 release PR；合并 release PR 后创建 GitHub Release，并通过 OIDC 将对应版本发布到 npm，不需要配置 `NPM_TOKEN`。

</details>

## 许可证

MIT
