# dsh-side-chat

在不离开当前 DeepSeek Harness 主会话的情况下，针对选中的文本发起聚焦讨论。支持 **DeepSeek Harness 桌面端和 Web 端**。

[English](README.md)

![先在 Side Chat 中询问选中文本，再将 Side Chat 对话添加到主会话](https://raw.githubusercontent.com/AHGGG/dsh-side-chat/master/docs/assets/side-chat-demo.gif)

## 安装

当前源码已适配 DSH `0.2.0-rc.2`。npm 已发布的 `@ahggg/dsh-side-chat@1.0.1` 仍只支持 `0.2.0-rc.1`；rc.2 桌面端需要安装包含本次兼容更新的新插件版本。以下命令对应已发布的 rc.1 版本。

请配合使用以下确切版本：

- **Side Chat：** `@ahggg/dsh-side-chat@1.0.1`
- **DeepSeek Harness 运行时：** `0.2.0-rc.1`

### DeepSeek Harness 桌面端

Side Chat 现已支持桌面应用。在桌面端的插件安装对话框中，输入完整的包名和版本：

```text
@ahggg/dsh-side-chat@1.0.1
```

安装后重启 DeepSeek Harness 桌面应用。桌面端请使用应用内的插件管理功能；下方 CLI 命令仅针对 Web profile。

### Web 端（`dsh web`）

如有需要，先安装匹配版本的 DSH CLI，再安装并固定插件版本：

```powershell
npm install --global @deepseek-ai/dsh@0.2.0-rc.1
dsh plugin --profile web add @ahggg/dsh-side-chat@1.0.1 --save-exact
```

从希望 Agent 操作的真实工程目录启动 DSH：

```powershell
cd E:\path\to\your-project
dsh web --port 3080
```

打开 DSH 输出的网址，插件会自动加载到 Web 客户端中。

### 本地链接调试

当 `dsh plugin --profile web list` 显示插件来自 `link:` 工作区时，DSH 加载的是已提交的 `lib/client.js`，而不是 `src/`。切换分支或修改客户端源码后，需要重新构建并重启 `dsh web` 进程：

```powershell
pnpm install --frozen-lockfile
pnpm build
```

## 使用 Side Chat

在手机或平板上，可以长按已完成消息中的文字进行选中。有足够空间时，Side Chat 操作条会显示在选区下方，把浏览器系统选文菜单留在上方。你可以直接在触摸操作条中使用 `Add to chat`、`More details` 或 `Ask in side chat`。

1. 在主会话中至少完成一轮对话。
2. 在一条已完成的用户或助手消息内选中文字。
3. 点击 `Add to chat` 可以先填写一条可选批注，再把引用加入主会话输入框；点击 `More details` 可以立即发送详细解释请求；点击 `Ask in side chat` 可以自己输入聚焦问题。
4. 自己输入消息或问题时，按 `Enter` 发送。
5. Side Chat 回复完成后，点击 `Add to conversation`，即可把这段聚焦讨论作为一个会话引用加入主会话输入框。
6. 完成后点击 `×` 关闭，或者在 Side Chat 面板内聚焦时按 `Esc`。在其他输入框或菜单中按 Escape 不会关闭 Side Chat。

常用操作：

- `Shift+Enter` 换行。
- 点击发送按钮旁的模型控件，再选择 **Effort（推理等级）**，即可调整模型的思考等级。回复生成期间也可以修改：当前回复仍使用原设置，新选择会用于下一次回复，并记住为当前客户端之后 **Ask in side chat** 和 **More details** 请求的默认设置，不会修改主会话。
- 点击 `Add to chat` 后，按 `Enter` 或点击 `Save` 保存 annotation；点击批注框外部或点击 `Cancel` 则直接取消。
- `Add to chat` 会保留输入框中已有的草稿，并可把多段带序号的文本及各自的可选批注汇总到同一个 annotation 胶囊中。
- `Add to conversation` 会捕获 Side Chat 中的用户/助手历史、保留主会话草稿；再次点击时会刷新已有引用，而不是重复添加。
- 输入框会随内容自动增高，达到最大高度后在内部滚动。
- 输入框只保留一个操作按钮：空闲时为 **Send（发送）**，生成期间切换为 **Stop（停止）**。回复结束或停止后恢复为发送按钮，并保留追问草稿。等待发送结果时新输入的文字也会保留。
- Assistant 回复使用 DSH 原生 Markdown 渲染。
- hover `N annotations` 可以预览每一段所选文本及对应批注。
- 发送前可以 hover annotation 胶囊并点击 `×` 移除；发送后，同一个胶囊会显示在用户消息上方。
- Side Chat 的首条消息会把选区显示为一个 annotation，问题正文保持纯文本，不显示内部 XML。
- 主会话会一直保留在页面中，插件不会创建 child Session。

## 会话和数据如何处理

`Ask in side chat` 和 `More details` 直接通过 DSH 配置的 provider 发起流式模型调用。第一次发送时，插件读取主会话截至所选消息所在轮次结束的**只读文本快照**，不包含后续主会话问题。此后追问一直使用这份固定上下文。仅打开草稿不会调用模型。

Side Chat 只在内存中保留独立的临时讨论历史，**不会 fork、复制、创建或归档 DSH Session，也不会启动 Agent 或写入 Session 事件日志**。它**没有工具调用、命令执行和文件修改能力**。主会话的推理内容以及图片、文件附件的字节不会传入；过去的工具文本仅作为参考资料。初始模型优先使用已保存的 Side Chat 选择，否则使用所选父会话轮次的配置；之后切换模型只影响 Side Chat 的后续回复。

关闭面板、刷新或断开客户端、卸载插件时，会取消正在运行的请求并丢弃临时讨论。Host 记录闲置 30 分钟后也会过期。如果希望保留讨论，请点击 **Add to conversation**，然后**发送主会话草稿**，将引用存入主会话历史。只添加引用不会自动发送；已经添加到主会话草稿的引用独立于临时面板，不会随面板关闭而删除。

每次调用模型仍会发送文本快照和 Side Chat 历史，因此仍产生正常的 provider token 用量；不复制 Session 不代表不消耗上下文 token，也不保证缓存复用。旧版插件创建的归档 Session 不会自动删除。

## 当前限制

- 选区必须位于同一条已完成消息内。
- 这是纯文本只读讨论，不是另一个 Agent；不支持附件、工具、Steer 和 `/side`。
- 关闭或过期后不能重新打开，也没有“保留为普通 Session”操作。
- 父上下文上限为 2,097,152 个字符，超过时明确拒绝而不会静默截断。每条问题上限为 65,536 个字符，每次回复（含推理）上限为 262,144 个字符；每次讨论最多 64 条问题，问题、回复和推理合计最多 2,097,152 个字符。达到输出上限会明确报错，仅保留已经显示的部分回复。
- 单次模型请求两分钟后超时；provider 自身的上下文或输出限制可能更低。

## 升级或卸载

### 桌面端

在桌面应用的插件管理功能中，使用以下确切包版本进行更新或重新安装，然后重启应用：

```text
@ahggg/dsh-side-chat@1.0.1
```

如果 DSH `0.2.0-rc.2` 桌面端提示 `@ahggg/dsh-side-chat@1.0.1` 要求 rc.1，说明已发布的插件尚未适配这个运行时。请在兼容更新发布后，安装明确支持 rc.2 的 Side Chat 新版本。桌面端和 Web profile 的插件安装相互独立，请更新实际使用的 profile，并保留 DSH 的兼容性检查。

卸载时，在桌面应用的插件管理功能中移除 Side Chat 即可。

### Web 端

要将已有的 Web 安装升级到 `1.0.1`，请重新添加这个确切版本。`add --save-exact` 会替换已安装的包版本，并将依赖固定到该版本：

```powershell
dsh plugin --profile web add @ahggg/dsh-side-chat@1.0.1 --save-exact
```

更新后重启 `dsh web` 并刷新浏览器。卸载 Web profile 中的插件：

```powershell
dsh plugin --profile web remove @ahggg/dsh-side-chat
```

## 许可证

MIT

## References

- https://www.v2ex.com
- https://linux.do
- https://linux.sb
