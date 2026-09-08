import type {
  DiffBlockLabels,
  MarkdownLabels,
  ReadBlockLabels,
  SearchBlockLabels,
  TerminalBlockLabels,
  WebBlockLabels,
} from '@deepseek-ai/dsh-client-ui-primitives'

const hiddenLines = (hidden: number): string => `Show ${String(hidden)} hidden line${hidden === 1 ? '' : 's'}`

export const MARKDOWN_LABELS: MarkdownLabels = {
  code: { copyLabel: 'Copy', copiedLabel: 'Copied' },
  footnotes: 'Footnotes',
}

export const TERMINAL_LABELS: TerminalBlockLabels = {
  signal: signal => `Signal ${signal}`,
  exitCode: code => `Exit ${String(code)}`,
  running: 'Running',
  failed: 'Failed',
  done: 'Done',
  copy: 'Copy',
  copied: 'Copied',
  noOutput: 'No output',
  collapseAria: 'Collapse command output',
  collapse: 'Collapse',
  expandAria: hiddenLines,
  expand: hiddenLines,
}

export const READ_LABELS: ReadBlockLabels = {
  window: (shown, total) => `Showing ${String(shown)} of ${String(total)} lines`,
  copy: 'Copy',
  copied: 'Copied',
  collapseAria: 'Collapse file content',
  expandAria: hiddenLines,
  collapse: 'Collapse',
  expand: hiddenLines,
}

export const DIFF_LABELS: DiffBlockLabels = {
  copy: 'Copy',
  copied: 'Copied',
  collapseAria: 'Collapse diff',
  expandAria: hiddenLines,
  collapse: 'Collapse',
  expand: hiddenLines,
  files: count => `${String(count)} file${count === 1 ? '' : 's'}`,
}

export const SEARCH_LABELS: SearchBlockLabels = {
  pathsSummary: (shown, total, truncated) => truncated
    ? `Showing ${String(shown)} of ${String(total)} paths`
    : `${String(total)} path${total === 1 ? '' : 's'}`,
  matchesSummary: (shown, total, files, truncated) => {
    const summary = `${String(shown)} match${shown === 1 ? '' : 'es'} in ${String(files)} file${files === 1 ? '' : 's'}`
    return truncated ? `${summary} (${String(total)} total)` : summary
  },
  copy: 'Copy',
  copied: 'Copied',
  noResults: 'No results',
  collapseAria: 'Collapse search results',
  expandAria: hiddenLines,
  collapse: 'Collapse',
  expand: hiddenLines,
}

export const WEB_LABELS: WebBlockLabels = {
  noResults: 'No results',
  sourcesTruncated: 'Sources truncated',
  http: 'HTTP',
  contentTruncated: 'Content truncated',
  markdown: MARKDOWN_LABELS,
}
