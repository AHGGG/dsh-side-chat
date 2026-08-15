import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const sideChatCss = readFileSync(
  new URL('../../src/client/panel/side-chat.css', import.meta.url),
  'utf8',
)

describe('Side Chat theme styles', () => {
  it('derives surfaces, borders, and text from the DSH semantic theme aliases', () => {
    expect(sideChatCss).toContain(
      '--side-chat-border: var(--dsw-alias-border-l2, var(--dsw-border, #d8d8de))',
    )
    expect(sideChatCss).toContain(
      '--side-chat-bg: var(--dsw-alias-bg-layer-2, var(--dsw-surface, #ffffff))',
    )
    expect(sideChatCss).toContain(
      '--side-chat-text: var(--dsw-alias-label-primary, var(--dsw-text, #19191d))',
    )
  })

  it('uses theme-aware floating and dialog surfaces for selection controls', () => {
    expect(sideChatCss).toMatch(/\.dsh-side-chat-selection-actions\s*\{[^}]*background:\s*var\(--dsw-alias-button-floating-fill, var\(--side-chat-bg\)\)/s)
    expect(sideChatCss).toMatch(/\.dsh-side-chat-selection-comment\s*\{[^}]*background:\s*var\(--side-chat-bg\)/s)
    expect(sideChatCss).toMatch(/\.dsh-side-chat-selection-actions button \+ button\s*\{[^}]*border-left:\s*1px solid var\(--side-chat-border\)/s)
  })
})
