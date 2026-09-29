# dsh-side-chat

在不离开当前 DeepSeek Harness 主会话的情况下，针对选中的文本发起一个独立的侧边对话。

[English](README.md)

![先在 Side Chat 中询问选中文本，再将 Side Chat 对话添加到主会话](https://raw.githubusercontent.com/AHGGG/dsh-side-chat/master/docs/assets/side-chat-demo.gif)

## 安装

如果尚未安装 DSH 0.2.0-rc.1，先安装它。该版本对应 npm 的 `next` 标签，而非 `latest`。添加插件前只刷新这个包的 registry metadata，避免刚发布新版本时 pnpm 仍复用旧的 `latest`：

```powershell
npm install --global @deepseek-ai/dsh@0.2.0-rc.1
pnpm cache delete "@ahggg/dsh-side-chat"
dsh plugin --profile web add @ahggg/dsh-side-chat@latest
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
- 使用发送按钮旁的模型控件可以选择 provider/model 及其可用的推理等级；该选择只属于 Side Chat，不会修改主会话，并会成为下次打开 Side Chat 时使用的全局默认值。
- 点击 `Add to chat` 后，按 `Enter` 或点击 `Save` 保存 annotation；点击批注框外部或点击 `Cancel` 则直接取消。
- `Add to chat` 会保留输入框中已有的草稿，并可把多段带序号的文本及各自的可选批注汇总到同一个 annotation 胶囊中。
- `Add to conversation` 会捕获 Side Chat 中的用户/助手历史、保留主会话草稿；再次点击时会刷新已有引用，而不是重复添加。
- 输入框会随内容自动增高，达到最大高度后在内部滚动。
- 回复生成期间，可使用 Stop 中断；等回复结束或停止后再发送追问。等待发送结果时新输入的文字会保留在输入框中。
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

刷新这个包的 registry metadata，升级到最新稳定版，然后重启 DSH：

```powershell
pnpm cache delete "@ahggg/dsh-side-chat"
dsh plugin --profile web update @ahggg/dsh-side-chat --latest
```

卸载插件：

```powershell
dsh plugin --profile web remove @ahggg/dsh-side-chat
```

## 许可证

MIT

## References

- https://www.v2ex.com
- https://linux.do
- https://linux.sb
