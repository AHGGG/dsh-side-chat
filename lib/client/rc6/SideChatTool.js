import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { CodeBlock, DiffBlock, DisclosureRow, IconApiOutline14, IconBrowseOutline16, IconCodeOutline16, IconEditOutline16, IconSearchOutline16, IconSparkle16, ReadBlock, SearchBlock, StateDot, TerminalBlock, WebBlock, } from '@deepseek-ai/dsh-client-ui-primitives';
import { DIFF_LABELS, READ_LABELS, SEARCH_LABELS, TERMINAL_LABELS, WEB_LABELS, } from './primitive-labels.js';
const TOOL_VARIANTS = {
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
};
const VARIANT_TITLES = {
    search: 'Search',
    read: 'Read',
    bash: 'Bash',
    write: 'Write',
    edit: 'Edit',
    code: 'Code',
    others: 'Tool call',
};
const SUMMARY_KEYS = {
    bash: ['description', 'command'],
    read: ['path', 'file_path', 'url'],
    search: ['query', 'pattern', 'url'],
    write: ['path', 'file_path'],
    edit: ['path', 'file_path'],
    code: ['description'],
    others: [],
};
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value
        : null;
}
function stringValue(value) {
    return typeof value === 'string' && value !== '' ? value : undefined;
}
function numberValue(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function booleanValue(value) {
    return typeof value === 'boolean' ? value : undefined;
}
function firstLine(text) {
    const newline = text.indexOf('\n');
    return newline === -1 ? text : text.slice(0, newline);
}
function stringify(value) {
    if (typeof value === 'string')
        return value;
    try {
        return JSON.stringify(value, null, 2);
    }
    catch {
        return String(value);
    }
}
function contentText(content) {
    return content.map((block) => {
        if (block.type === 'text' || block.type === 'reasoning')
            return block.text;
        if (block.type === 'image')
            return '[Image]';
        if (block.type === 'tool-call')
            return `${block.name}(${block.arguments})`;
        if (block.type === 'tool-result')
            return contentText(block.content);
        return stringify(block);
    }).filter(Boolean).join('\n');
}
export function toolOutputText(content) {
    const text = contentText(content);
    const fileEnvelope = /^<path>[\s\S]*?<\/path>\s*<type>[\s\S]*?<\/type>\s*<content>\s*\n?([\s\S]*?)\n?<\/content>\s*$/u.exec(text);
    return fileEnvelope?.[1]?.trimEnd() ?? text;
}
function parseArguments(argsRaw) {
    try {
        return record(JSON.parse(argsRaw));
    }
    catch {
        return null;
    }
}
function formattedArguments(argsRaw) {
    try {
        return JSON.stringify(JSON.parse(argsRaw), null, 2);
    }
    catch {
        return argsRaw;
    }
}
function classifyTool(name) {
    return TOOL_VARIANTS[name.toLowerCase()] ?? 'others';
}
function toolTitle(name, variant) {
    if (name.toLowerCase() === 'pwsh')
        return 'Pwsh';
    return VARIANT_TITLES[variant];
}
function pickArgument(args, keys) {
    for (const key of keys) {
        const value = stringValue(args[key]);
        if (value !== undefined)
            return value;
    }
    return Object.values(args).find((value) => typeof value === 'string' && value !== '');
}
function relativizeToCwd(path, cwd) {
    if (cwd === undefined || cwd === '')
        return path;
    const root = cwd.replace(/[/\\]+$/u, '');
    const lowerPath = path.toLowerCase();
    const lowerRoot = root.toLowerCase();
    return lowerPath.startsWith(`${lowerRoot}/`) || lowerPath.startsWith(`${lowerRoot}\\`)
        ? path.slice(root.length + 1)
        : path;
}
function summaryFromArguments(name, variant, argsRaw, callId, cwd) {
    const args = parseArguments(argsRaw);
    const picked = args === null ? undefined : pickArgument(args, SUMMARY_KEYS[variant]);
    const base = relativizeToCwd(firstLine(picked ?? (argsRaw === '' || argsRaw === '{}' ? callId : argsRaw)), cwd);
    return variant === 'others' && name !== '' ? `${name} · ${base}` : base;
}
function filePathFromArguments(variant, argsRaw) {
    if (variant !== 'read' && variant !== 'write' && variant !== 'edit')
        return undefined;
    const args = parseArguments(argsRaw);
    if (args === null)
        return undefined;
    return stringValue(args['path']) ?? stringValue(args['file_path']);
}
function variantIcon(variant) {
    switch (variant) {
        case 'search': return _jsx(IconSearchOutline16, { size: 14 });
        case 'read': return _jsx(IconBrowseOutline16, { size: 14 });
        case 'bash': return _jsx(IconApiOutline14, { size: 14 });
        case 'write':
        case 'edit': return _jsx(IconEditOutline16, { size: 14 });
        case 'code': return _jsx(IconCodeOutline16, { size: 14 });
        case 'others': return _jsx(IconSparkle16, { size: 14 });
    }
}
function resolveTerminalCwd(viewCwd, cwd) {
    if (viewCwd === undefined || viewCwd === '')
        return cwd;
    if (cwd === undefined || cwd === '' || /^(?:[A-Za-z]:[/\\]|[/\\]{1,2})/u.test(viewCwd))
        return viewCwd;
    return `${cwd.replace(/[/\\]+$/u, '')}\\${viewCwd}`;
}
function terminalCard(variant, argsRaw, state, output, callView, resultView, cwd) {
    const call = record(callView);
    const result = record(resultView);
    const callIsTerminal = call?.['card'] === 'terminal';
    const resultIsTerminal = result?.['card'] === 'terminal';
    if (variant !== 'bash' && !callIsTerminal && !resultIsTerminal)
        return null;
    const args = parseArguments(argsRaw);
    const command = stringValue(result?.['title'])
        ?? stringValue(call?.['title'])
        ?? (args === null ? undefined : stringValue(args['command']))
        ?? '';
    return {
        command,
        cwd: resolveTerminalCwd(stringValue(call?.['cwd']), cwd),
        output: stringValue(result?.['output']) ?? output,
        exitCode: numberValue(result?.['exitCode']),
        signal: stringValue(result?.['signal']),
        running: state === 'running' || state === 'pending',
        description: stringValue(call?.['description']),
    };
}
function languageForPath(path) {
    if (path === undefined)
        return undefined;
    const extension = /\.([^.\\/]+)$/u.exec(path)?.[1]?.toLowerCase();
    const aliases = {
        js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
        json: 'json', css: 'css', html: 'html', md: 'markdown',
        yml: 'yaml', yaml: 'yaml', py: 'python', ps1: 'powershell',
        sh: 'bash', toml: 'toml', xml: 'xml',
    };
    return extension === undefined ? undefined : aliases[extension];
}
function validReadLines(value) {
    if (!Array.isArray(value))
        return null;
    const lines = [];
    for (const item of value) {
        const line = record(item);
        const number = numberValue(line?.['number']);
        const text = stringValue(line?.['text']) ?? (line?.['text'] === '' ? '' : undefined);
        if (number === undefined || text === undefined)
            return null;
        lines.push({ number, text });
    }
    return lines;
}
function readCard(name, argsRaw, state, output, resultView, cwd) {
    if (state === 'running' || state === 'pending' || state === 'error' || state === 'interrupted')
        return null;
    const result = record(resultView);
    if (result?.['card'] === 'read') {
        const lines = validReadLines(result['lines']);
        const totalLines = numberValue(result['totalLines']);
        const path = stringValue(result['path']);
        if (lines === null || totalLines === undefined)
            return null;
        return {
            label: stringValue(result['title']) ?? (path === undefined ? undefined : relativizeToCwd(path, cwd)),
            lines,
            totalLines,
            lang: stringValue(result['lang']),
        };
    }
    if (name.toLowerCase() !== 'read' || output === undefined)
        return null;
    const path = filePathFromArguments('read', argsRaw);
    const texts = output.split('\n');
    return {
        label: path === undefined ? undefined : relativizeToCwd(path, cwd),
        lines: texts.map((text, index) => ({ number: index + 1, text })),
        totalLines: texts.length,
        lang: languageForPath(path),
    };
}
function validSearchCard(resultView) {
    const result = record(resultView);
    if (result?.['card'] !== 'search')
        return null;
    const truncated = booleanValue(result['truncated']);
    const total = numberValue(result['total']);
    if (truncated === undefined || total === undefined)
        return null;
    if (result['shape'] === 'paths') {
        const paths = result['paths'];
        return Array.isArray(paths) && paths.every((path) => typeof path === 'string')
            ? { kind: 'paths', paths, truncated, total, labels: SEARCH_LABELS }
            : null;
    }
    if (result['shape'] !== 'matches' || !Array.isArray(result['files']))
        return null;
    const files = [];
    for (const item of result['files']) {
        const file = record(item);
        const path = stringValue(file?.['path']);
        const matchesValue = file?.['matches'];
        if (path === undefined || !Array.isArray(matchesValue))
            return null;
        const matches = [];
        for (const matchValue of matchesValue) {
            const match = record(matchValue);
            const lineNumber = numberValue(match?.['lineNumber']);
            const line = stringValue(match?.['line']) ?? (match?.['line'] === '' ? '' : undefined);
            if (lineNumber === undefined || line === undefined)
                return null;
            matches.push({ lineNumber, line });
        }
        files.push({ path, matches });
    }
    return { kind: 'matches', files, truncated, total, labels: SEARCH_LABELS };
}
function validDiffs(view) {
    const value = record(view);
    if (value?.['card'] !== 'diff' || !Array.isArray(value['diffs']) || value['diffs'].length === 0)
        return null;
    const diffs = [];
    for (const item of value['diffs']) {
        const hunk = record(item);
        const path = stringValue(hunk?.['path']);
        const oldText = hunk?.['oldText'];
        const newText = stringValue(hunk?.['newText']) ?? (hunk?.['newText'] === '' ? '' : undefined);
        if (path === undefined || (oldText !== null && typeof oldText !== 'string') || newText === undefined)
            return null;
        diffs.push({ path, oldText, newText });
    }
    return diffs;
}
function validWebCard(view) {
    const result = record(view);
    if (result?.['card'] !== 'web')
        return null;
    const truncated = booleanValue(result['truncated']);
    if (truncated === undefined)
        return null;
    if (result['kind'] === 'fetch') {
        const url = stringValue(result['url']);
        const statusCode = numberValue(result['statusCode']);
        return url === undefined || statusCode === undefined
            ? null
            : { kind: 'fetch', url, statusCode, truncated, labels: WEB_LABELS };
    }
    if (result['kind'] !== 'search' || !Array.isArray(result['sources']))
        return null;
    const sources = [];
    for (const item of result['sources']) {
        const source = record(item);
        const url = stringValue(source?.['url']);
        if (url === undefined)
            return null;
        const title = stringValue(source?.['title']);
        const snippet = stringValue(source?.['snippet']);
        const publishedAt = stringValue(source?.['publishedAt']);
        sources.push({
            url,
            ...(title === undefined ? {} : { title }),
            ...(snippet === undefined ? {} : { snippet }),
            ...(publishedAt === undefined ? {} : { publishedAt }),
        });
    }
    const answer = stringValue(result['answer']);
    return {
        kind: 'search',
        sources,
        truncated,
        labels: WEB_LABELS,
        ...(answer === undefined ? {} : { answer }),
    };
}
function genericBody(variant, argsRaw) {
    if (argsRaw === '' || argsRaw === '{}')
        return null;
    if (variant === 'read' || variant === 'write' || variant === 'edit')
        return null;
    return formattedArguments(argsRaw);
}
function leadingFor(state, icon) {
    if (state === 'error')
        return _jsx(StateDot, { state: "error" });
    if (state === 'interrupted')
        return _jsx(StateDot, { state: "warning" });
    return icon;
}
function toolStatus(state) {
    if (state === 'running' || state === 'pending')
        return 'Running';
    if (state === 'error')
        return 'Failed';
    if (state === 'interrupted')
        return 'Stopped';
    return null;
}
export function ToolCard({ callId, name, argsRaw, state, output, callView, resultView, cwd, }) {
    const [expanded, setExpanded] = useState(false);
    const variant = classifyTool(name);
    const terminal = terminalCard(variant, argsRaw, state, output, callView, resultView, cwd);
    const terminalFailed = terminal !== null
        && !terminal.running
        && ((terminal.exitCode !== undefined && terminal.exitCode !== 0) || terminal.signal !== undefined);
    const visualState = state === 'success' && terminalFailed ? 'error' : state;
    const read = readCard(name, argsRaw, visualState, output, resultView, cwd);
    const search = validSearchCard(resultView);
    const diffs = validDiffs(resultView) ?? validDiffs(callView);
    const web = validWebCard(resultView);
    const args = parseArguments(argsRaw);
    const code = variant === 'code' && args !== null ? stringValue(args['code']) : undefined;
    const body = genericBody(variant, argsRaw);
    const summary = terminal?.description
        ?? stringValue(record(resultView)?.['title'])
        ?? summaryFromArguments(name, variant, argsRaw, callId, cwd);
    const failureLine = visualState === 'error' && output !== undefined ? firstLine(output) : null;
    const summaryText = failureLine ?? summary;
    const hasSpecialCard = terminal !== null || read !== null || search !== null || diffs !== null || web !== null || code !== undefined;
    const expandable = hasSpecialCard || body !== null || output !== undefined;
    const open = expanded && expandable;
    const status = toolStatus(visualState);
    return (_jsxs("section", { className: "dsh-side-chat-tool", "data-call-id": callId, "data-state": visualState, "data-expanded": open || undefined, children: [status !== null && _jsx("span", { className: "dsh-side-chat-tool-visually-hidden", children: status }), _jsx(DisclosureRow, { rowClassName: "dsh-side-chat-tool-row", leadingClassName: "dsh-side-chat-tool-leading", titleClassName: "dsh-side-chat-tool-title", chevronClassName: "dsh-side-chat-tool-chevron", icon: leadingFor(visualState, variantIcon(variant)), title: toolTitle(name, variant), open: open, expandable: expandable, expandOnRowClick: true, keepContentWhenOpen: true, onToggle: () => { setExpanded(current => !current); }, collapsedContent: summaryText !== '' && (_jsxs(_Fragment, { children: [_jsx("span", { className: "dsh-side-chat-tool-separator", "aria-hidden": "true" }), _jsx("span", { className: failureLine === null
                                ? 'dsh-side-chat-tool-summary'
                                : 'dsh-side-chat-tool-summary dsh-side-chat-tool-error-summary', children: summaryText })] })), children: _jsx("div", { className: "dsh-side-chat-tool-body-wrap", children: terminal !== null
                        ? (_jsx(TerminalBlock, { command: terminal.command, cwd: terminal.cwd, output: terminal.output, exitCode: terminal.exitCode, signal: terminal.signal, running: terminal.running, maxLines: Infinity, className: "dsh-side-chat-tool-terminal", labels: TERMINAL_LABELS }))
                        : read !== null
                            ? _jsx(ReadBlock, { ...read, labels: READ_LABELS, maxLines: 8, className: "dsh-side-chat-tool-read" })
                            : search !== null
                                ? _jsx(SearchBlock, { ...search, maxLines: 8, className: "dsh-side-chat-tool-search" })
                                : diffs !== null
                                    ? _jsx(DiffBlock, { diffs: diffs, labels: DIFF_LABELS, maxLines: 8, className: "dsh-side-chat-tool-diff" })
                                    : web !== null
                                        ? _jsx(WebBlock, { ...web, className: "dsh-side-chat-tool-web" })
                                        : code !== undefined
                                            ? _jsx(CodeBlock, { code: code, lang: "typescript", copyLabel: "Copy", copiedLabel: "Copied", className: "dsh-side-chat-tool-code" })
                                            : (body !== null || output !== undefined) && (_jsxs("div", { className: "dsh-side-chat-tool-io-card", children: [body !== null && (_jsxs("div", { className: "dsh-side-chat-tool-io-section", children: [_jsx("span", { className: "dsh-side-chat-tool-io-label", children: "IN" }), _jsx("span", { className: "dsh-side-chat-tool-io-text", children: body })] })), body !== null && output !== undefined && _jsx("span", { className: "dsh-side-chat-tool-io-divider", "aria-hidden": "true" }), output !== undefined && (_jsxs("div", { className: "dsh-side-chat-tool-io-section", children: [_jsx("span", { className: "dsh-side-chat-tool-io-label", children: "OUT" }), _jsx("span", { className: "dsh-side-chat-tool-io-text", "data-error": visualState === 'error' || undefined, children: output })] }))] })) }) })] }));
}
function resultState(node, output) {
    if (!node.isError)
        return 'success';
    const identity = `${node.error?.name ?? ''} ${node.error?.code ?? ''} ${output}`;
    return /\b(?:aborted|cancelled|canceled)\b/iu.test(identity) ? 'interrupted' : 'error';
}
export function ToolBlockCard({ block, cwd }) {
    const presentation = block;
    const settled = 'kind' in block;
    const output = settled ? toolOutputText(block.content) : undefined;
    const state = settled ? resultState(block, output ?? '') : 'running';
    const name = settled ? block.call?.name ?? block.callId : block.name;
    const argsRaw = settled ? block.call?.argsRaw ?? '{}' : block.argsRaw;
    return (_jsxs("div", { className: "dsh-side-chat-tool-branch", children: [_jsx(ToolCard, { callId: block.callId, name: name, argsRaw: argsRaw, state: state, output: output, callView: presentation.callView, resultView: settled ? presentation.resultView : null, cwd: cwd }), block.subCalls.length > 0 && (_jsx("div", { className: "dsh-side-chat-tool-subcalls", "data-subcalls": true, children: block.subCalls.map(child => _jsx(ToolBlockCard, { block: child, cwd: cwd }, child.callId)) }))] }));
}
export function RunningToolCard({ call, cwd }) {
    return _jsx(ToolBlockCard, { block: call, cwd: cwd });
}
