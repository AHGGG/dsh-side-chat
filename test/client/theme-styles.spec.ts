import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const sideChatCss = readFileSync(
  new URL('../../src/client/panel/side-chat.css', import.meta.url),
  'utf8',
)
const harnessThemeClient = readFileSync(
  require.resolve('@deepseek-ai/dsh-client-ui-theme/client'),
  'utf8',
)
const embeddedThemeMatch = /design-platform\.css\.mjs\r?\n\s*var\s+\w+\s*=\s*("(?:\\.|[^"\\])*");/.exec(
  harnessThemeClient,
)
if (embeddedThemeMatch?.[1] === undefined) {
  throw new Error('Supported DSH theme bundle does not contain design-platform.css')
}
const parsedThemeCss: unknown = JSON.parse(embeddedThemeMatch[1])
if (typeof parsedThemeCss !== 'string') {
  throw new Error('Supported DSH theme bundle contains an invalid design-platform.css payload')
}
const harnessThemeCss = parsedThemeCss

function themeValues(dark: boolean): Map<string, string> {
  const values = new Map<string, string>()
  for (const block of harnessThemeCss.matchAll(/body(\[data-ds-dark-theme\])?\s*\{([^}]*)\}/g)) {
    if (block[1] !== undefined && !dark) continue
    for (const declaration of (block[2] ?? '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      values.set(declaration[1] ?? '', (declaration[2] ?? '').trim())
    }
  }
  return values
}

function resolveThemeValue(name: string, values: ReadonlyMap<string, string>, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular theme token: ${name}`)
  const value = values.get(name)
  if (value === undefined) throw new Error(`Missing theme token: ${name}`)
  const reference = /^var\((--[\w-]+)\)$/.exec(value)?.[1]
  if (reference === undefined) return value
  return resolveThemeValue(reference, values, new Set([...seen, name]))
}

function rgb(value: string): readonly [number, number, number] {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value)?.[1]
  if (hex !== undefined) {
    const expanded = hex.length === 3
      ? [...hex].map(channel => channel.repeat(2)).join('')
      : hex
    return [
      Number.parseInt(expanded.slice(0, 2), 16),
      Number.parseInt(expanded.slice(2, 4), 16),
      Number.parseInt(expanded.slice(4, 6), 16),
    ]
  }
  const channels = /^rgba?\(([^)]+)\)$/i.exec(value)?.[1]
    ?.split(',')
    .slice(0, 3)
    .map(channel => Number(channel.trim()))
  if (channels?.length !== 3 || channels.some(channel => !Number.isFinite(channel))) {
    throw new Error(`Expected an RGB color, received: ${value}`)
  }
  return [channels[0]!, channels[1]!, channels[2]!]
}

function contrastRatio(foreground: string, background: string): number {
  const luminance = (value: string): number => {
    const linearize = (channel: number): number => {
      const normalized = channel / 255
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4
    }
    const [red, green, blue] = rgb(value)
    return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue)
  }
  const foregroundLuminance = luminance(foreground)
  const backgroundLuminance = luminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

describe('Side Chat theme styles', () => {
  it('derives surfaces, text, and accent controls from semantic theme aliases', () => {
    expect(sideChatCss).toContain(
      '--side-chat-bg: var(--dsw-alias-bg-layer-2, var(--dsw-surface, #ffffff))',
    )
    expect(sideChatCss).toContain(
      '--side-chat-text: var(--dsw-alias-label-primary, var(--dsw-text, #19191d))',
    )
    expect(sideChatCss).toContain(
      '--side-chat-accent-fill: var(--dsw-alias-button-info-fill, #4176e6)',
    )
    expect(sideChatCss).toContain(
      '--side-chat-accent-text: var(--dsw-alias-label-primary-foreground, #ffffff)',
    )
  })

  it('only references semantic tokens published by the supported DSH theme', () => {
    const referenced = new Set(
      [...sideChatCss.matchAll(/var\((--dsw-(?:alias|specific)-[\w-]+)/g)].map(match => match[1]),
    )
    const published = new Set(
      [...harnessThemeCss.matchAll(/(--dsw-(?:alias|specific)-[\w-]+)\s*:/g)].map(match => match[1]),
    )
    expect([...referenced].filter(token => !published.has(token)).sort()).toEqual([])
  })

  it('keeps primary surfaces and accent controls legible in light and dark palettes', () => {
    for (const dark of [false, true]) {
      const values = themeValues(dark)
      const resolve = (token: string): string => resolveThemeValue(token, values)
      expect(contrastRatio(
        resolve('--dsw-alias-label-primary'),
        resolve('--dsw-alias-bg-layer-2'),
      )).toBeGreaterThanOrEqual(7)
      expect(contrastRatio(
        resolve('--dsw-alias-label-primary'),
        resolve('--dsw-alias-button-floating-fill'),
      )).toBeGreaterThanOrEqual(7)
      expect(contrastRatio(
        resolve('--dsw-alias-label-primary-foreground'),
        resolve('--dsw-alias-button-info-fill'),
      )).toBeGreaterThanOrEqual(3)
    }
  })

  it('uses theme-aware surfaces and foregrounds for selection controls', () => {
    expect(sideChatCss).toMatch(/\.dsh-side-chat-selection-actions\s*\{[^}]*background:\s*var\(--dsw-alias-button-floating-fill, var\(--side-chat-bg\)\)[^}]*color:\s*var\(--side-chat-text\)/s)
    expect(sideChatCss).toMatch(/\.dsh-side-chat-selection-comment\s*\{[^}]*background:\s*var\(--side-chat-bg\)[^}]*color:\s*var\(--side-chat-text\)/s)
    expect(sideChatCss).toMatch(/\.dsh-side-chat-selection-comment-save\s*\{[^}]*background:\s*var\(--side-chat-accent-fill\)[^}]*color:\s*var\(--side-chat-accent-text\)/s)
    expect(sideChatCss).not.toContain('--dsw-alias-button-info,')
  })

  it('keeps touch selection actions slightly more compact than the initial mobile treatment', () => {
    expect(sideChatCss).toMatch(/\.dsh-side-chat-selection-actions\[data-touch\] button\s*\{[^}]*min-height:\s*42px;[^}]*padding-inline:\s*14px;[^}]*white-space:\s*nowrap;/s)
  })
})
