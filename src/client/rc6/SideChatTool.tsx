import { useState, type ReactNode } from 'react'
import type {
  ConversationNode,
  RunningToolCall,
  ToolCallBlock,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { ContentBlock } from '@deepseek-ai/dsh-api-remotes/client'
import {
  CodeBlock,
  DiffBlock,
  DisclosureRow,
  IconApiOutline14,
  IconBrowseOutline16,
  IconCodeOutline16,
  IconEditOutline16,
  IconSearchOutline16,
  IconSparkle16,
  ReadBlock,
  SearchBlock,
  StateDot,
  TerminalBlock,
  WebBlock,
  type DiffHunk,
  type ReadBlockLine,
  type SearchBlockProps,
  type WebBlockProps,
} from '@deepseek-ai/dsh-client-ui-primitives'

type ToolResultNode = Extract<ConversationNode, { kind: 'tool-result' }>

export type ToolState = 'pending' | 'running' | 'success' | 'error' | 'interrupted'

type ToolVariant = 'search' | 'read' | 'bash' | 'write' | 'edit' | 'code' | 'others'

const TOOL_VARIANTS: Readonly<Record<string, ToolVariant>> = {
  bash: 'bash',
  pwsh: 'bash',
  read: 'read',
  web_fetch: 'read',
  web_search: 'search',
  grep: 'search',
  glob: 'search',
  write: 'write',
  edit: 'edit',
  run_code: 'code',
}

const VARIANT_TITLES: Readonly<Record<ToolVariant, string>> = {
  search: 'Search',
  read: 'Read',
  bash: 'Bash',
  write: 'Write',
  edit: 'Edit',
  code: 'Code',
  others: 'Tool call',
}

const SUMMARY_KEYS: Readonly<Record<ToolVariant, readonly string[]>> = {
  bash: ['description', 'command'],
  read: ['path', 'file_path', 'url'],
  search: ['query', 'pattern', 'url'],
  write: ['path', 'file_path'],
  edit: ['path', 'file_path'],
  code: ['description'],
  others: [],
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function firstLine(text: string): string {
  const newline = text.indexOf('\n')
  return newline === -1 ? text : text.slice(0, newline)
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function contentText(content: readonly ContentBlock[]): string {
  return content.map((block) => {
    if (block.type === 'text' || block.type === 'reasoning') return block.text
    if (block.type === 'image') return '[Image]'
    if (block.type === 'tool-call') return `${block.name}(${block.arguments})`
    if (block.type === 'tool-result') return contentText(block.content)
    return stringify(block)
  }).filter(Boolean).join('\n')
}

export function toolOutputText(content: readonly ContentBlock[]): string {
  const text = contentText(content)
  const fileEnvelope = /^<path>[\s\S]*?<\/path>\s*<type>[\s\S]*?<\/type>\s*<content>\s*\n?([\s\S]*?)\n?<\/content>\s*$/u.exec(text)
  return fileEnvelope?.[1]?.trimEnd() ?? text
}

function parseArguments(argsRaw: string): Record<string, unknown> | null {
  try {
    return record(JSON.parse(argsRaw))
  } catch {
    return null
  }
}

function formattedArguments(argsRaw: string): string {
  try {
    return JSON.stringify(JSON.parse(argsRaw), null, 2)
  } catch {
    return argsRaw
  }
}

function classifyTool(name: string): ToolVariant {
  return TOOL_VARIANTS[name.toLowerCase()] ?? 'others'
}

function toolTitle(name: string, variant: ToolVariant): string {
  if (name.toLowerCase() === 'pwsh') return 'Pwsh'
  return VARIANT_TITLES[variant]
}

function pickArgument(args: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = stringValue(args[key])
    if (value !== undefined) return value
  }
  return Object.values(args).find((value): value is string => typeof value === 'string' && value !== '')
}

function relativizeToCwd(path: string, cwd: string | undefined): string {
  if (cwd === undefined || cwd === '') return path
  const root = cwd.replace(/[/\\]+$/u, '')
  const lowerPath = path.toLowerCase()
  const lowerRoot = root.toLowerCase()
  return lowerPath.startsWith(`${lowerRoot}/`) || lowerPath.startsWith(`${lowerRoot}\\`)
    ? path.slice(root.length + 1)
    : path
}

function summaryFromArguments(
  name: string,
  variant: ToolVariant,
  argsRaw: string,
  callId: string,
  cwd: string | undefined,
): string {
  const args = parseArguments(argsRaw)
  const picked = args === null ? undefined : pickArgument(args, SUMMARY_KEYS[variant])
  const base = relativizeToCwd(firstLine(picked ?? (argsRaw === '' || argsRaw === '{}' ? callId : argsRaw)), cwd)
  return variant === 'others' && name !== '' ? `${name} · ${base}` : base
}

function filePathFromArguments(variant: ToolVariant, argsRaw: string): string | undefined {
  if (variant !== 'read' && variant !== 'write' && variant !== 'edit') return undefined
  const args = parseArguments(argsRaw)
  if (args === null) return undefined
  return stringValue(args['path']) ?? stringValue(args['file_path'])
}

function variantIcon(variant: ToolVariant): ReactNode {
  switch (variant) {
    case 'search': return <IconSearchOutline16 size={14} />
    case 'read': return <IconBrowseOutline16 size={14} />
    case 'bash': return <IconApiOutline14 size={14} />
    case 'write':
    case 'edit': return <IconEditOutline16 size={14} />
    case 'code': return <IconCodeOutline16 size={14} />
    case 'others': return <IconSparkle16 size={14} />
  }
}

interface TerminalCard {
  readonly command: string
  readonly cwd?: string | undefined
  readonly output?: string | undefined
  readonly exitCode?: number | undefined
  readonly signal?: string | undefined
  readonly running: boolean
  readonly description?: string | undefined
}

function resolveTerminalCwd(viewCwd: string | undefined, cwd: string | undefined): string | undefined {
  if (viewCwd === undefined || viewCwd === '') return cwd
  if (cwd === undefined || cwd === '' || /^(?:[A-Za-z]:[/\\]|[/\\]{1,2})/u.test(viewCwd)) return viewCwd
  return `${cwd.replace(/[/\\]+$/u, '')}\\${viewCwd}`
}

function terminalCard(
  variant: ToolVariant,
  argsRaw: string,
  state: ToolState,
  output: string | undefined,
  callView: unknown,
  resultView: unknown,
  cwd: string | undefined,
): TerminalCard | null {
  const call = record(callView)
  const result = record(resultView)
  const callIsTerminal = call?.['card'] === 'terminal'
  const resultIsTerminal = result?.['card'] === 'terminal'
  if (variant !== 'bash' && !callIsTerminal && !resultIsTerminal) return null
  const args = parseArguments(argsRaw)
  const command = stringValue(result?.['title'])
    ?? stringValue(call?.['title'])
    ?? (args === null ? undefined : stringValue(args['command']))
    ?? ''
  return {
    command,
    cwd: resolveTerminalCwd(stringValue(call?.['cwd']), cwd),
    output: stringValue(result?.['output']) ?? output,
    exitCode: numberValue(result?.['exitCode']),
    signal: stringValue(result?.['signal']),
    running: state === 'running' || state === 'pending',
    description: stringValue(call?.['description']),
  }
}

function languageForPath(path: string | undefined): string | undefined {
  if (path === undefined) return undefined
  const extension = /\.([^.\\/]+)$/u.exec(path)?.[1]?.toLowerCase()
  const aliases: Readonly<Record<string, string>> = {
    js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    json: 'json', css: 'css', html: 'html', md: 'markdown',
    yml: 'yaml', yaml: 'yaml', py: 'python', ps1: 'powershell',
    sh: 'bash', toml: 'toml', xml: 'xml',
  }
  return extension === undefined ? undefined : aliases[extension]
}

interface ReadCard {
  readonly label?: string | undefined
  readonly lines: readonly ReadBlockLine[]
  readonly totalLines: number
  readonly lang?: string | undefined
}

function validReadLines(value: unknown): ReadBlockLine[] | null {
  if (!Array.isArray(value)) return null
  const lines: ReadBlockLine[] = []
  for (const item of value) {
    const line = record(item)
    const number = numberValue(line?.['number'])
    const text = stringValue(line?.['text']) ?? (line?.['text'] === '' ? '' : undefined)
    if (number === undefined || text === undefined) return null
    lines.push({ number, text })
  }
  return lines
}

function readCard(
  name: string,
  argsRaw: string,
  state: ToolState,
  output: string | undefined,
  resultView: unknown,
  cwd: string | undefined,
): ReadCard | null {
  if (state === 'running' || state === 'pending' || state === 'error' || state === 'interrupted') return null
  const result = record(resultView)
  if (result?.['card'] === 'read') {
    const lines = validReadLines(result['lines'])
    const totalLines = numberValue(result['totalLines'])
    const path = stringValue(result['path'])
    if (lines === null || totalLines === undefined) return null
    return {
      label: stringValue(result['title']) ?? (path === undefined ? undefined : relativizeToCwd(path, cwd)),
      lines,
      totalLines,
      lang: stringValue(result['lang']),
    }
  }
  if (name.toLowerCase() !== 'read' || output === undefined) return null
  const path = filePathFromArguments('read', argsRaw)
  const texts = output.split('\n')
  return {
    label: path === undefined ? undefined : relativizeToCwd(path, cwd),
    lines: texts.map((text, index) => ({ number: index + 1, text })),
    totalLines: texts.length,
    lang: languageForPath(path),
  }
}

function validSearchCard(resultView: unknown): SearchBlockProps | null {
  const result = record(resultView)
  if (result?.['card'] !== 'search') return null
  const truncated = booleanValue(result['truncated'])
  const total = numberValue(result['total'])
  if (truncated === undefined || total === undefined) return null
  if (result['shape'] === 'paths') {
    const paths = result['paths']
    return Array.isArray(paths) && paths.every((path): path is string => typeof path === 'string')
      ? { kind: 'paths', paths, truncated, total }
      : null
  }
  if (result['shape'] !== 'matches' || !Array.isArray(result['files'])) return null
  const files: Array<{ path: string; matches: Array<{ lineNumber: number; line: string }> }> = []
  for (const item of result['files']) {
    const file = record(item)
    const path = stringValue(file?.['path'])
    const matchesValue = file?.['matches']
    if (path === undefined || !Array.isArray(matchesValue)) return null
    const matches: Array<{ lineNumber: number; line: string }> = []
    for (const matchValue of matchesValue) {
      const match = record(matchValue)
      const lineNumber = numberValue(match?.['lineNumber'])
      const line = stringValue(match?.['line']) ?? (match?.['line'] === '' ? '' : undefined)
      if (lineNumber === undefined || line === undefined) return null
      matches.push({ lineNumber, line })
    }
    files.push({ path, matches })
  }
  return { kind: 'matches', files, truncated, total }
}

function validDiffs(view: unknown): DiffHunk[] | null {
  const value = record(view)
  if (value?.['card'] !== 'diff' || !Array.isArray(value['diffs']) || value['diffs'].length === 0) return null
  const diffs: DiffHunk[] = []
  for (const item of value['diffs']) {
    const hunk = record(item)
    const path = stringValue(hunk?.['path'])
    const oldText = hunk?.['oldText']
    const newText = stringValue(hunk?.['newText']) ?? (hunk?.['newText'] === '' ? '' : undefined)
    if (path === undefined || (oldText !== null && typeof oldText !== 'string') || newText === undefined) return null
    diffs.push({ path, oldText, newText })
  }
  return diffs
}

function validWebCard(view: unknown): WebBlockProps | null {
  const result = record(view)
  if (result?.['card'] !== 'web') return null
  const truncated = booleanValue(result['truncated'])
  if (truncated === undefined) return null
  if (result['kind'] === 'fetch') {
    const url = stringValue(result['url'])
    const statusCode = numberValue(result['statusCode'])
    return url === undefined || statusCode === undefined ? null : { kind: 'fetch', url, statusCode, truncated }
  }
  if (result['kind'] !== 'search' || !Array.isArray(result['sources'])) return null
  const sources: Array<{ url: string; title?: string; snippet?: string; publishedAt?: string }> = []
  for (const item of result['sources']) {
    const source = record(item)
    const url = stringValue(source?.['url'])
    if (url === undefined) return null
    const title = stringValue(source?.['title'])
    const snippet = stringValue(source?.['snippet'])
    const publishedAt = stringValue(source?.['publishedAt'])
    sources.push({
      url,
      ...(title === undefined ? {} : { title }),
      ...(snippet === undefined ? {} : { snippet }),
      ...(publishedAt === undefined ? {} : { publishedAt }),
    })
  }
  const answer = stringValue(result['answer'])
  return { kind: 'search', sources, truncated, ...(answer === undefined ? {} : { answer }) }
}

function genericBody(variant: ToolVariant, argsRaw: string): string | null {
  if (argsRaw === '' || argsRaw === '{}') return null
  if (variant === 'read' || variant === 'write' || variant === 'edit') return null
  return formattedArguments(argsRaw)
}

function leadingFor(state: ToolState, icon: ReactNode): ReactNode {
  if (state === 'error') return <StateDot state="error" />
  if (state === 'interrupted') return <StateDot state="warning" />
  return icon
}

function toolStatus(state: ToolState): string | null {
  if (state === 'running' || state === 'pending') return 'Running'
  if (state === 'error') return 'Failed'
  if (state === 'interrupted') return 'Stopped'
  return null
}

export function ToolCard({
  callId,
  name,
  argsRaw,
  state,
  output,
  callView,
  resultView,
  cwd,
}: {
  readonly callId: string
  readonly name: string
  readonly argsRaw: string
  readonly state: ToolState
  readonly output?: string | undefined
  readonly callView?: unknown
  readonly resultView?: unknown
  readonly cwd?: string | undefined
}) {
  const [expanded, setExpanded] = useState(false)
  const variant = classifyTool(name)
  const terminal = terminalCard(variant, argsRaw, state, output, callView, resultView, cwd)
  const terminalFailed = terminal !== null
    && !terminal.running
    && ((terminal.exitCode !== undefined && terminal.exitCode !== 0) || terminal.signal !== undefined)
  const visualState: ToolState = state === 'success' && terminalFailed ? 'error' : state
  const read = readCard(name, argsRaw, visualState, output, resultView, cwd)
  const search = validSearchCard(resultView)
  const diffs = validDiffs(resultView) ?? validDiffs(callView)
  const web = validWebCard(resultView)
  const args = parseArguments(argsRaw)
  const code = variant === 'code' && args !== null ? stringValue(args['code']) : undefined
  const body = genericBody(variant, argsRaw)
  const summary = terminal?.description
    ?? stringValue(record(resultView)?.['title'])
    ?? summaryFromArguments(name, variant, argsRaw, callId, cwd)
  const failureLine = visualState === 'error' && output !== undefined ? firstLine(output) : null
  const summaryText = failureLine ?? summary
  const hasSpecialCard = terminal !== null || read !== null || search !== null || diffs !== null || web !== null || code !== undefined
  const expandable = hasSpecialCard || body !== null || output !== undefined
  const open = expanded && expandable
  const status = toolStatus(visualState)
  return (
    <section
      className="dsh-side-chat-tool"
      data-call-id={callId}
      data-state={visualState}
      data-expanded={open || undefined}
    >
      {status !== null && <span className="dsh-side-chat-tool-visually-hidden">{status}</span>}
      <DisclosureRow
        rowClassName="dsh-side-chat-tool-row"
        leadingClassName="dsh-side-chat-tool-leading"
        titleClassName="dsh-side-chat-tool-title"
        chevronClassName="dsh-side-chat-tool-chevron"
        icon={leadingFor(visualState, variantIcon(variant))}
        title={toolTitle(name, variant)}
        open={open}
        expandable={expandable}
        expandOnRowClick
        keepContentWhenOpen
        onToggle={() => { setExpanded(current => !current) }}
        collapsedContent={summaryText !== '' && (
          <>
            <span className="dsh-side-chat-tool-separator" aria-hidden="true" />
            <span className={failureLine === null
              ? 'dsh-side-chat-tool-summary'
              : 'dsh-side-chat-tool-summary dsh-side-chat-tool-error-summary'}>
              {summaryText}
            </span>
          </>
        )}
      >
        <div className="dsh-side-chat-tool-body-wrap">
          {terminal !== null
            ? (
                <TerminalBlock
                  command={terminal.command}
                  cwd={terminal.cwd}
                  output={terminal.output}
                  exitCode={terminal.exitCode}
                  signal={terminal.signal}
                  running={terminal.running}
                  maxLines={Infinity}
                  className="dsh-side-chat-tool-terminal"
                />
              )
            : read !== null
              ? <ReadBlock {...read} maxLines={8} className="dsh-side-chat-tool-read" />
              : search !== null
                ? <SearchBlock {...search} maxLines={8} className="dsh-side-chat-tool-search" />
                : diffs !== null
                  ? <DiffBlock diffs={diffs} maxLines={8} className="dsh-side-chat-tool-diff" />
                  : web !== null
                    ? <WebBlock {...web} className="dsh-side-chat-tool-web" />
                    : code !== undefined
                      ? <CodeBlock code={code} lang="typescript" copyLabel="Copy" copiedLabel="Copied" className="dsh-side-chat-tool-code" />
                      : (body !== null || output !== undefined) && (
                          <div className="dsh-side-chat-tool-io-card">
                            {body !== null && (
                              <div className="dsh-side-chat-tool-io-section">
                                <span className="dsh-side-chat-tool-io-label">IN</span>
                                <span className="dsh-side-chat-tool-io-text">{body}</span>
                              </div>
                            )}
                            {body !== null && output !== undefined && <span className="dsh-side-chat-tool-io-divider" aria-hidden="true" />}
                            {output !== undefined && (
                              <div className="dsh-side-chat-tool-io-section">
                                <span className="dsh-side-chat-tool-io-label">OUT</span>
                                <span className="dsh-side-chat-tool-io-text" data-error={visualState === 'error' || undefined}>{output}</span>
                              </div>
                            )}
                          </div>
                        )}
        </div>
      </DisclosureRow>
    </section>
  )
}

function resultState(node: ToolResultNode, output: string): ToolState {
  if (!node.isError) return 'success'
  const identity = `${node.error?.name ?? ''} ${node.error?.code ?? ''} ${output}`
  return /\b(?:aborted|cancelled|canceled)\b/iu.test(identity) ? 'interrupted' : 'error'
}

export function ToolBlockCard({ block, cwd }: {
  readonly block: ToolCallBlock
  readonly cwd?: string | undefined
}) {
  const settled = 'kind' in block
  const output = settled ? toolOutputText(block.content) : undefined
  const state = settled ? resultState(block, output ?? '') : 'running'
  const name = settled ? block.call?.name ?? block.callId : block.name
  const argsRaw = settled ? block.call?.argsRaw ?? '{}' : block.argsRaw
  return (
    <div className="dsh-side-chat-tool-branch">
      <ToolCard
        callId={block.callId}
        name={name}
        argsRaw={argsRaw}
        state={state}
        output={output}
        callView={block.callView}
        resultView={settled ? block.resultView : null}
        cwd={cwd}
      />
      {block.subCalls.length > 0 && (
        <div className="dsh-side-chat-tool-subcalls" data-subcalls>
          {block.subCalls.map(child => <ToolBlockCard key={child.callId} block={child} cwd={cwd} />)}
        </div>
      )}
    </div>
  )
}

export function RunningToolCard({ call, cwd }: {
  readonly call: RunningToolCall
  readonly cwd?: string | undefined
}) {
  return <ToolBlockCard block={call} cwd={cwd} />
}
