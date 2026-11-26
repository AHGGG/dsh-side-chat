window.__ModuleLoader__.load({id:`@ahggg/dsh-side-chat`,factory:e=>{var t={exports:{}},n=t.exports;Object.defineProperty(n,Symbol.toStringTag,{value:`Module`});let r=e("react"),i=e("react/jsx-runtime"),a=e("@deepseek-ai/dsh-client-ui-primitives");var o=`.dsh-side-chat-overlay,
.dsh-side-chat-parent-annotation-dock,
.dsh-side-chat-sent-annotation {
  /* Use DSH's semantic theme aliases in both light and dark mode. */
  --side-chat-border: var(--dsw-alias-border-l2, var(--dsw-border, #d8d8de));
  --side-chat-bg: var(--dsw-alias-bg-layer-2, var(--dsw-surface, #ffffff));
  --side-chat-muted: var(--dsw-alias-label-tertiary, var(--dsw-text-muted, #62636a));
  --side-chat-text: var(--dsw-alias-label-primary, var(--dsw-text, #19191d));
  --side-chat-accent: var(--dsw-alias-state-business-primary, #1473e6);
  --side-chat-accent-fill: var(--dsw-alias-button-info-fill, #4176e6);
  --side-chat-accent-hover: var(--dsw-alias-button-info-hover, #3467d6);
  --side-chat-accent-text: var(--dsw-alias-label-primary-foreground, #ffffff);
  color: var(--side-chat-text);
}

.dsh-side-chat-overlay {
  pointer-events: none;
}

.dsh-side-chat-overlay > * {
  pointer-events: auto;
}

.dsh-side-chat-panel {
  position: fixed;
  z-index: 70;
  right: clamp(12px, 2vw, 20px);
  bottom: clamp(12px, 2vw, 20px);
  display: flex;
  width: min(840px, calc(100vw - 32px));
  height: clamp(460px, 62dvh, 980px);
  max-height: calc(100dvh - 32px);
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--side-chat-border);
  border-radius: 28px;
  background: var(--side-chat-bg);
  color: var(--side-chat-text);
  box-shadow: 0 12px 36px rgb(0 0 0 / 11%), 0 2px 8px rgb(0 0 0 / 6%);
}

.dsh-side-chat-controls {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.dsh-side-chat-conversation {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.dsh-side-chat-transcript {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 18px 20px 24px;
  scrollbar-color: color-mix(in srgb, var(--side-chat-muted) 34%, transparent) transparent;
  scrollbar-width: thin;
}

.dsh-side-chat-message {
  max-width: 92%;
  padding: 10px 12px;
  border: 1px solid var(--side-chat-border);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-3, var(--dsw-surface-subtle, #f7f7f9));
}

.dsh-side-chat-message[data-role="user"] {
  align-self: end;
  background: var(--dsw-specific-bubble, var(--dsw-accent-soft, #eef4ff));
}

.dsh-side-chat-message[data-role="assistant"] {
  align-self: start;
  min-width: 0;
  max-width: 100%;
  border-color: transparent;
  background: transparent;
  overflow-wrap: anywhere;
}
.dsh-side-chat-message-role,
.dsh-side-chat-message-note { display: block; margin-bottom: 5px; color: var(--side-chat-muted); font-size: 12px; }
.dsh-side-chat-message-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.dsh-side-chat-message pre,
.dsh-side-chat-turn-notice pre { overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
.dsh-side-chat-message[data-role="assistant"] :where(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
.dsh-side-chat-reasoning {
  display: flex;
  flex-direction: column;
}
.dsh-side-chat-reasoning-row {
  position: relative;
  overflow: hidden;
}
.dsh-side-chat-reasoning[data-state="running"] .dsh-side-chat-reasoning-row::after {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 300px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--dsw-alias-bg-base, #fff) 60%, transparent) 55%,
    transparent 100%
  );
  content: '';
  pointer-events: none;
  animation: dsh-side-chat-reasoning-sweep 2.6s ease-out infinite;
}
@keyframes dsh-side-chat-reasoning-sweep {
  0% { left: -300px; }
  90%, 100% { left: 100%; }
}
.dsh-side-chat-reasoning-leading { flex-shrink: 0; }
.dsh-side-chat-reasoning-chevron { color: var(--dsw-alias-label-secondary, var(--side-chat-muted)); }
.dsh-side-chat-reasoning-title { font-weight: 400; }
.dsh-side-chat-reasoning-separator {
  width: 2px;
  height: 2px;
  flex: none;
  margin: 0 8px;
  border-radius: 1px;
  background: var(--dsw-alias-label-caption, #a1a1aa);
}
.dsh-side-chat-reasoning-summary {
  min-width: 0;
  flex: auto;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
  font-size: 14px;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-side-chat-reasoning-summary[data-follow-end] { text-overflow: clip; }
.dsh-side-chat-reasoning-body {
  padding: 4px 0 4px 22px;
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
  font-size: 14px;
  line-height: 24px;
  white-space: pre-wrap;
  word-break: break-word;
}
.dsh-side-chat-reasoning-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.dsh-side-chat-tool-branch {
  min-width: 0;
  max-width: 100%;
  flex: 0 0 auto;
}
.dsh-side-chat-tool {
  display: flex;
  min-width: 0;
  max-width: 100%;
  flex: 0 0 auto;
  flex-direction: column;
  border-radius: 6px;
}
.dsh-side-chat-tool-row {
  position: relative;
  overflow: hidden;
}
.dsh-side-chat-tool[data-state="running"] .dsh-side-chat-tool-row::after,
.dsh-side-chat-tool[data-state="pending"] .dsh-side-chat-tool-row::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 300px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--dsw-alias-bg-base, #fff) 60%, transparent) 55%,
    transparent 100%
  );
  content: '';
  pointer-events: none;
  animation: dsh-side-chat-tool-sweep 2.6s ease-out infinite;
}
@keyframes dsh-side-chat-tool-sweep {
  0% { left: -300px; }
  90%, 100% { left: 100%; }
}
.dsh-side-chat-tool-row:focus-visible {
  border-radius: 4px;
  outline: 2px solid color-mix(in srgb, var(--side-chat-accent) 42%, transparent);
  outline-offset: 1px;
}
.dsh-side-chat-tool-leading { flex-shrink: 0; }
.dsh-side-chat-tool-chevron { color: var(--dsw-alias-label-secondary, var(--side-chat-muted)); }
.dsh-side-chat-tool-title { font-weight: 400; }
.dsh-side-chat-tool-separator {
  width: 2px;
  height: 2px;
  flex: none;
  margin: 0 8px;
  border-radius: 1px;
  background: var(--dsw-alias-label-caption, #a1a1aa);
}
.dsh-side-chat-tool-summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
  font-size: 14px;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-side-chat-tool-error-summary { color: var(--dsw-alias-state-error-primary, var(--dsw-danger, #b42318)); }
.dsh-side-chat-tool-body-wrap {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.dsh-side-chat-tool-code,
.dsh-side-chat-tool-diff,
.dsh-side-chat-tool-read,
.dsh-side-chat-tool-search,
.dsh-side-chat-tool-terminal,
.dsh-side-chat-tool-web {
  margin: 4px 0 4px 4px;
}
.dsh-side-chat-tool-code { --dsl-code-block-content-font: var(--dsw-font-markdown-code-block-small); }
.dsh-side-chat-tool-terminal {
  --dsl-terminal-font: var(--dsw-font-markdown-code-block-small);
  --dsl-terminal-line-height: 18px;
  --dsl-terminal-output-max-height: 224px;
  border: 1px solid var(--dsw-alias-border-l1, var(--side-chat-border));
}
.dsh-side-chat-tool-io-card {
  display: flex;
  flex-direction: column;
  margin: 4px 0 4px 4px;
  border: 1px solid var(--dsw-alias-border-l1, var(--side-chat-border));
  border-radius: 12px;
  background: var(--dsw-alias-markdown-code-block, #f6f6f7);
  font: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Consolas, monospace);
}
.dsh-side-chat-tool-io-section {
  display: grid;
  max-height: 150px;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 14px;
  align-items: baseline;
  overflow-y: auto;
  padding: 12px 16px;
}
.dsh-side-chat-tool-io-divider {
  height: 1px;
  flex: none;
  background: var(--dsw-alias-border-l2, var(--side-chat-border));
}
.dsh-side-chat-tool-io-label {
  position: sticky;
  top: 0;
  align-self: start;
  color: var(--dsw-alias-label-caption, #8d8d95);
}
.dsh-side-chat-tool-io-text {
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--dsw-alias-label-secondary, #4b4b52);
}
.dsh-side-chat-tool-io-text[data-error] { color: var(--dsw-alias-state-error-primary, var(--dsw-danger, #b42318)); }
.dsh-side-chat-tool-subcalls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 4px 0 2px 22px;
  padding-left: 8px;
  border-left: 1px solid var(--dsw-alias-border-l2, var(--side-chat-border));
}
.dsh-side-chat-tool-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.dsh-side-chat-turn-notice,
.dsh-side-chat-interaction,
.dsh-side-chat-queue { padding: 10px; border: 1px solid var(--side-chat-border); border-radius: 10px; }
.dsh-side-chat-interaction fieldset { margin: 8px 0; border: 1px solid var(--side-chat-border); border-radius: 8px; }
.dsh-side-chat-question-option { display: flex; gap: 8px; margin: 8px 0; }
.dsh-side-chat-interaction textarea { width: 100%; box-sizing: border-box; resize: vertical; }
.dsh-side-chat-interaction-actions,
.dsh-side-chat-queue > div { display: flex; justify-content: end; gap: 8px; }
.dsh-side-chat-interaction button,
.dsh-side-chat-queue button { min-height: 32px; border: 1px solid var(--side-chat-border); border-radius: 7px; background: var(--dsw-alias-interactive-bg-hover-solid, var(--dsw-control, #f7f7f9)); color: inherit; cursor: pointer; }
.dsh-side-chat-composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  align-items: end;
  margin: 0 12px 12px;
  padding: 8px 8px 8px 12px;
  border: 1px solid var(--side-chat-border);
  border-radius: 24px;
  background: var(--side-chat-bg);
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
}
.dsh-side-chat-composer textarea {
  grid-column: 1 / -1;
  width: 100%;
  height: auto;
  min-height: 24px;
  max-height: 160px;
  box-sizing: border-box;
  resize: none;
  overflow-y: hidden;
  padding: 6px;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 1.5;
}
.dsh-side-chat-composer-actions,
.dsh-side-chat-draft-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.dsh-side-chat-model-root {
  position: relative;
  min-width: 0;
}
.dsh-side-chat-model-trigger {
  display: flex;
  width: auto;
  height: 28px;
  min-height: 28px;
  max-width: 220px;
  align-items: center;
  gap: 4px;
  padding: 0 4px 0 8px;
  border: 0;
  border-radius: 24px;
  outline: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary, var(--side-chat-muted));
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
.dsh-side-chat-model-trigger:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5));
}
.dsh-side-chat-model-trigger:focus-visible {
  box-shadow: 0 0 0 2px var(--dsw-alias-border-l3, var(--side-chat-border));
}
.dsh-side-chat-model-trigger:disabled {
  color: var(--dsw-alias-label-dimmed, #a1a1aa);
  cursor: default;
}
.dsh-side-chat-model-trigger-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-side-chat-model-trigger-effort {
  flex: none;
  color: var(--dsw-alias-label-caption, #8d8d95);
}
.dsh-side-chat-model-chevron {
  flex: none;
  color: var(--dsw-alias-label-caption, #8d8d95);
  transition: transform 120ms ease;
}
.dsh-side-chat-model-chevron-open { transform: rotate(180deg); }
.dsh-side-chat-model-menu {
  position: absolute;
  z-index: 20;
  right: 0;
  bottom: calc(100% + 8px);
  display: flex;
  width: min(240px, calc(100vw - 32px));
  max-height: min(360px, calc(100dvh - 96px));
  flex-direction: column;
  overflow: hidden;
  padding: 4px;
  border: 1px solid var(--dsw-alias-border-inverted, var(--side-chat-border));
  border-radius: 12px;
  /* DSH's menu tint is translucent; keep transcript text out of this surface. */
  background: var(--side-chat-bg);
  box-shadow: var(--dsw-shadow-lv3, 0 8px 24px rgb(0 0 0 / 16%));
  color: var(--dsw-alias-label-primary, inherit);
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2, #a1a1aa);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2, #71717a);
}
.dsh-side-chat-model-status,
.dsh-side-chat-model-empty {
  padding: 10px;
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
  font-size: 13px;
  line-height: 20px;
}
.dsh-side-chat-model-error,
.dsh-side-chat-model-warning {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  padding: 7px 8px;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover-danger, #fff1f0);
  color: var(--dsw-alias-state-error-primary, var(--dsw-danger, #b42318));
  font-size: 12px;
  line-height: 18px;
}
.dsh-side-chat-model-warning {
  background: var(--dsw-alias-bg-module-platform, #fff8e6);
  color: var(--dsw-alias-state-warn-label, #8a5a00);
}
.dsh-side-chat-model-retry {
  min-height: 0;
  flex: none;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}
.dsh-side-chat-model-groups {
  min-height: 0;
  overflow-y: auto;
}
.dsh-side-chat-model-group + .dsh-side-chat-model-group { margin-top: 4px; }
.dsh-side-chat-model-group-title {
  position: sticky;
  z-index: 1;
  top: 0;
  padding: 5px 8px 3px;
  background: var(--side-chat-bg);
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}
.dsh-side-chat-model-option {
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 0;
  border-radius: 10px;
  outline: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}
.dsh-side-chat-model-option:hover:not(:disabled),
.dsh-side-chat-model-option:focus-visible {
  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5));
}
.dsh-side-chat-model-selected { background: transparent; }
.dsh-side-chat-model-option:disabled {
  color: var(--dsw-alias-label-dimmed, #a1a1aa);
  cursor: default;
}
.dsh-side-chat-model-option-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}
.dsh-side-chat-model-name {
  overflow: hidden;
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-side-chat-model-description {
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-side-chat-model-check {
  display: grid;
  flex: 0 0 18px;
  place-items: center;
  color: var(--dsw-alias-label-primary, inherit);
}
.dsh-side-chat-model-cell {
  display: flex;
  width: 100%;
  height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-primary, inherit);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  text-align: left;
}
.dsh-side-chat-model-cell:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5));
}
.dsh-side-chat-model-cell-label {
  min-width: 0;
  flex: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-side-chat-model-cell-value {
  min-width: 0;
  flex: 0 auto;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-side-chat-model-cell-chevron {
  flex: none;
  color: var(--dsw-alias-label-tertiary, var(--side-chat-muted));
}
.dsh-side-chat-loading { display: grid; height: 100%; place-items: center; color: var(--side-chat-muted); }

.dsh-side-chat-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  align-items: center;
  flex: 0 0 auto;
  min-height: 46px;
  box-sizing: border-box;
  padding: 5px 10px 5px 16px;
  border-bottom: 1px solid var(--side-chat-border);
  background: var(--side-chat-bg);
}

.dsh-side-chat-heading { display: flex; min-width: 0; flex-direction: column; }
.dsh-side-chat-heading strong { font-size: 14px; font-weight: 600; }
.dsh-side-chat-footer { color: var(--side-chat-muted); font-size: 12px; }
.dsh-side-chat-header button,
.dsh-side-chat-inline-actions button,
.dsh-side-chat-error button,
.dsh-side-chat-selection-actions button {
  min-height: 32px;
  border: 1px solid var(--side-chat-border);
  border-radius: 7px;
  background: var(--dsw-alias-interactive-bg-hover-solid, var(--dsw-control, #f7f7f9));
  color: inherit;
  cursor: pointer;
}
.dsh-side-chat-header button:disabled { cursor: not-allowed; opacity: .55; }
.dsh-side-chat-header .dsh-side-chat-heading {
  align-items: flex-start;
  min-height: 0;
  padding: 4px 0;
  border: 0;
  background: transparent;
  text-align: left;
}
.dsh-side-chat-header-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}
.dsh-side-chat-header .dsh-side-chat-add-to-conversation {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, var(--side-chat-muted));
  font: inherit;
  font-size: 13px;
  white-space: nowrap;
}
.dsh-side-chat-add-to-conversation:hover:not(:disabled),
.dsh-side-chat-add-to-conversation:focus-visible {
  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5));
  color: var(--side-chat-text);
}
.dsh-side-chat-add-to-conversation-icon {
  width: 18px;
  height: 18px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}
.dsh-side-chat-header .dsh-side-chat-close {
  width: 32px;
  min-height: 32px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font-size: 20px;
  line-height: 1;
}
.dsh-side-chat-close:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5)); }

.dsh-side-chat-quote { position: relative; max-width: 100%; align-self: flex-start; }
.dsh-side-chat-quote-chip {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--side-chat-border);
  border-radius: 999px;
  background: var(--side-chat-bg);
  transition: background-color 120ms ease;
}
.dsh-side-chat-quote:hover .dsh-side-chat-quote-chip,
.dsh-side-chat-quote:focus-within .dsh-side-chat-quote-chip,
.dsh-side-chat-quote[data-expanded] .dsh-side-chat-quote-chip { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5)); }
.dsh-side-chat-quote-chip .dsh-side-chat-quote-trigger {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}
.dsh-side-chat-quote-trigger strong { font-size: 13px; font-weight: 500; line-height: 1; }
.dsh-side-chat-quote-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  color: var(--side-chat-muted);
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}
.dsh-side-chat-quote-chip .dsh-side-chat-quote-remove {
  display: grid;
  width: 30px;
  height: 34px;
  min-height: 34px;
  box-sizing: border-box;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--side-chat-muted);
  cursor: pointer;
  font: inherit;
  font-size: 18px;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  transition: opacity 100ms ease, background-color 100ms ease;
}
.dsh-side-chat-quote:hover .dsh-side-chat-quote-remove,
.dsh-side-chat-quote:focus-within .dsh-side-chat-quote-remove {
  opacity: 1;
  pointer-events: auto;
}
.dsh-side-chat-quote-remove:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); color: inherit; }
.dsh-side-chat-quote-details {
  position: absolute;
  z-index: 10;
  bottom: calc(100% + 8px);
  left: 0;
  width: min(520px, calc(100vw - 64px));
  max-width: calc(100vw - 48px);
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid var(--side-chat-border);
  border-radius: 16px;
  background: var(--side-chat-bg);
  box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
  font-size: 14px;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transform: translate(var(--dsh-side-chat-quote-offset-x, 0px), 4px);
  visibility: hidden;
  transition: opacity 100ms ease, transform 120ms ease, visibility 100ms ease;
}
.dsh-side-chat-quote-details::before {
  content: '';
  position: absolute;
  right: 0;
  bottom: -8px;
  left: 0;
  height: 8px;
}
.dsh-side-chat-quote[data-hovered] .dsh-side-chat-quote-details,
.dsh-side-chat-quote[data-expanded] .dsh-side-chat-quote-details {
  opacity: 1;
  pointer-events: auto;
  transform: translate(var(--dsh-side-chat-quote-offset-x, 0px), 0);
  visibility: visible;
}
.dsh-side-chat-annotated-user-message .dsh-side-chat-quote-details,
.dsh-side-chat-sent-annotation .dsh-side-chat-quote-details {
  top: calc(100% + 8px);
  right: 0;
  bottom: auto;
  left: auto;
}
.dsh-side-chat-annotated-user-message .dsh-side-chat-quote-details::before,
.dsh-side-chat-sent-annotation .dsh-side-chat-quote-details::before {
  top: -8px;
  bottom: auto;
}
.dsh-side-chat-quote-details-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsh-side-chat-quote-details-header strong { color: var(--side-chat-muted); font-size: 13px; font-weight: 500; }
.dsh-side-chat-quote-detail { display: block; }
.dsh-side-chat-quote-detail + .dsh-side-chat-quote-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--side-chat-border);
}
.dsh-side-chat-quote-text {
  display: block;
  max-height: 180px;
  margin: 4px 0 0;
  overflow: auto;
  white-space: pre-wrap;
  font: inherit;
}
.dsh-side-chat-quote-comment {
  display: block;
  margin-top: 9px;
}
.dsh-side-chat-quote-comment > strong { color: var(--side-chat-muted); font-size: 13px; font-weight: 500; }
.dsh-side-chat-error { margin: 10px 16px 0; padding: 10px 12px; border: 1px solid var(--side-chat-border); border-radius: 14px; background: var(--dsw-alias-interactive-bg-hover-danger, var(--dsw-surface-subtle, #f7f7f9)); }
.dsh-side-chat-error { border-color: var(--dsw-alias-state-error-primary, var(--dsw-danger, #b42318)); }
.dsh-side-chat-body { min-height: 0; flex: 1; overflow: hidden; }
.dsh-side-chat-annotated-user-message {
  display: flex;
  max-width: 92%;
  align-self: end;
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
}
.dsh-side-chat-annotated-user-message .dsh-side-chat-message { max-width: 100%; align-self: stretch; }

/* The DSH occurrence remains the durable serialization carrier, while this
   plugin-owned capsule supplies the visible and interactive projection. */
[data-composer-seat] [data-composer-chip="dsh-side-chat-selection"] {
  display: inline-block;
  width: var(--dsh-side-chat-parent-annotation-width, auto);
  box-sizing: border-box;
  visibility: hidden;
}
.dsh-side-chat-parent-annotation-dock {
  position: relative;
  z-index: 20;
  width: calc(100% - 32px);
  max-width: var(--dsh-composer-card-max-width, 780px);
  height: 0;
  /* The terminal zero-height dock would otherwise add a second gap between
     Todo/Goal/Queue and the input card. Its child still lands 10px inside the
     following card: -gap + top:16px against the card's own 6px gap. */
  margin: calc(0px - var(--dsh-composer-stack-gap, 6px)) auto 0;
  pointer-events: none;
}
.dsh-side-chat-parent-annotation-dock > .dsh-side-chat-quote {
  position: absolute;
  top: var(--annotation-top, 16px);
  left: var(--annotation-left, 16px);
  pointer-events: auto;
}
/* The user-text seat is inline. Reserve a row above annotated bubbles and
   move only our 36px chip there, leaving the native bubble and actions alone. */
[data-message-bubble]:has(.dsh-side-chat-sent-annotation) {
  --dsh-side-chat-sent-gap: 8px;
  position: relative;
  margin-block-start: calc(36px + var(--dsh-side-chat-sent-gap));
}
[data-message-bubble] .dsh-side-chat-sent-annotation {
  position: absolute;
  inset-block-end: calc(100% + var(--dsh-side-chat-sent-gap));
  inset-inline-end: 0;
  display: flex;
  /* Start over the bubble like in Side Chat, but stay inside the right
     edge when a short message is narrower than its chip. */
  inline-size: max-content;
  min-inline-size: 100%;
  pointer-events: none;
  white-space: nowrap;
}
[data-message-bubble] .dsh-side-chat-sent-annotation > .dsh-side-chat-quote {
  display: flex;
  pointer-events: auto;
}
.dsh-side-chat-sent-annotation-summary { margin-inline-end: .5em; }
[data-message-bubble] .dsh-side-chat-sent-annotation-summary {
  margin-inline-end: 0;
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  padding-inline: 11px;
  border: 1px solid var(--side-chat-border);
  border-radius: 999px;
  background: var(--side-chat-bg);
  font-size: 13px;
}
/* Do not draw an empty blue bubble when only an annotation was sent.
   Keep native unknown-content blocks if the row has any. */
[data-message-bubble]:has(> :only-child .dsh-side-chat-sent-annotation[data-annotation-only]) {
  padding: 0;
  background: transparent;
}
.dsh-side-chat-draft {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 0;
  flex: 0 0 auto;
  gap: 6px;
  align-items: end;
  margin: auto 12px 12px;
  padding: 12px;
  border: 1px solid var(--side-chat-border);
  border-radius: 24px;
  background: var(--side-chat-bg);
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
}
.dsh-side-chat-draft > .dsh-side-chat-quote { grid-column: 1 / -1; }
.dsh-side-chat-draft label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.dsh-side-chat-draft textarea {
  grid-column: 1 / -1;
  width: 100%;
  height: auto;
  min-height: 24px;
  max-height: 160px;
  box-sizing: border-box;
  resize: none;
  overflow-y: hidden;
  padding: 6px 2px;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 1.5;
}
.dsh-side-chat-panel .dsh-side-chat-send-button,
.dsh-side-chat-panel .dsh-side-chat-stop-button {
  display: grid;
  width: 34px;
  height: 34px;
  min-height: 34px;
  flex: none;
  place-items: center;
  padding: 1px 6px;
  border: 0;
  border-radius: 999px;
  background: var(--side-chat-accent-fill);
  color: var(--side-chat-accent-text);
  cursor: pointer;
  line-height: 1;
  transform: translateY(-2px);
  transition: background-color 100ms ease;
}
.dsh-side-chat-panel .dsh-side-chat-send-button:hover:not(:disabled),
.dsh-side-chat-panel .dsh-side-chat-stop-button:hover:not(:disabled) {
  background: var(--side-chat-accent-hover);
}
.dsh-side-chat-panel .dsh-side-chat-send-button:disabled,
.dsh-side-chat-panel .dsh-side-chat-stop-button:disabled { cursor: default; opacity: .4; }
.dsh-side-chat-footer { display: none; }
.dsh-side-chat-announcer { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.dsh-side-chat-selection-actions {
  position: fixed;
  z-index: 90;
  display: flex;
  width: max-content;
  max-width: calc(100vw - 16px);
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 0;
  padding: 0;
  border: 1px solid var(--side-chat-border);
  border-radius: 999px;
  background: var(--dsw-alias-button-floating-fill, var(--side-chat-bg));
  box-shadow: 0 4px 14px rgb(0 0 0 / 12%);
  color: var(--side-chat-text);
  overflow: hidden;
}
.dsh-side-chat-selection-actions button {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  transition: background-color 120ms ease;
}
.dsh-side-chat-selection-actions button:hover:not(:disabled),
.dsh-side-chat-selection-actions button:focus-visible {
  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5));
}
.dsh-side-chat-selection-actions button + button {
  border-left: 1px solid var(--side-chat-border);
  border-radius: 0;
}
.dsh-side-chat-selection-actions[data-touch] button {
  min-height: 42px;
  padding-inline: 14px;
  touch-action: manipulation;
  white-space: nowrap;
}

::highlight(dsh-side-chat-annotations) {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #1473e6) 18%, transparent);
}
::highlight(dsh-side-chat-active-annotation) {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #1473e6) 32%, transparent);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #1473e6) 70%, transparent);
  text-decoration-thickness: 1px;
}

.dsh-side-chat-annotation-marker,
.dsh-side-chat-selection-marker {
  position: fixed;
  z-index: 91;
  display: grid;
  width: 22px;
  height: 22px;
  min-height: 22px;
  box-sizing: border-box;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--side-chat-accent-fill);
  box-shadow: 0 2px 6px rgb(0 0 0 / 14%);
  color: var(--side-chat-accent-text);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}
.dsh-side-chat-annotation-marker { cursor: pointer; }
.dsh-side-chat-selection-marker { pointer-events: none; }
.dsh-side-chat-annotation-marker[data-large],
.dsh-side-chat-selection-marker[data-large] { font-size: 9px; }
.dsh-side-chat-annotation-marker[data-active] {
  background: var(--side-chat-accent-hover);
}
.dsh-side-chat-annotation-marker:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--side-chat-accent) 32%, transparent);
  outline-offset: 1px;
}

.dsh-side-chat-selection-comment {
  position: fixed;
  z-index: 92;
  display: grid;
  max-width: calc(100vw - 16px);
  box-sizing: border-box;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--side-chat-border);
  border-radius: 20px;
  background: var(--side-chat-bg);
  box-shadow: 0 5px 18px rgb(0 0 0 / 9%);
  color: var(--side-chat-text);
}
.dsh-side-chat-selection-comment textarea {
  width: 100%;
  min-height: 48px;
  max-height: 128px;
  box-sizing: border-box;
  resize: none;
  padding: 6px 8px;
  overflow-y: auto;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 1.45;
}
.dsh-side-chat-selection-comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.dsh-side-chat-selection-comment-actions button {
  min-height: 32px;
  padding: 0 14px;
  border: 1px solid var(--side-chat-border);
  border-radius: 999px;
  background: var(--side-chat-bg);
  color: inherit;
  cursor: pointer;
  font: inherit;
}
.dsh-side-chat-selection-comment-actions button:hover { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-surface-subtle, #f3f3f5)); }
.dsh-side-chat-selection-comment-actions .dsh-side-chat-selection-comment-save {
  border-color: transparent;
  background: var(--side-chat-accent-fill);
  color: var(--side-chat-accent-text);
}
.dsh-side-chat-selection-comment-actions .dsh-side-chat-selection-comment-save:hover {
  background: var(--side-chat-accent-hover);
}

@media (max-width: 900px) {
  .dsh-side-chat-panel {
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
    max-height: calc(100dvh - 24px);
    border-radius: 24px;
  }
}

@media (max-width: 720px) {
  .dsh-side-chat-panel {
    right: 8px;
    bottom: 8px;
    width: calc(100vw - 16px);
    height: min(78dvh, 760px);
    max-height: calc(100dvh - 16px);
    border-radius: 22px;
  }
  .dsh-side-chat-transcript { padding: 14px 14px 20px; }
  .dsh-side-chat-header { padding-left: 14px; }
  .dsh-side-chat-error { margin-inline: 12px; }
}

@media (max-height: 620px) {
  .dsh-side-chat-panel {
    bottom: 8px;
    height: calc(100dvh - 16px);
    max-height: calc(100dvh - 16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dsh-side-chat-reasoning[data-state="running"] .dsh-side-chat-reasoning-row::after { animation: none; }
}

@media (prefers-reduced-motion: no-preference) {
  .dsh-side-chat-panel { animation: dsh-side-chat-enter 160ms ease-out; }
  @keyframes dsh-side-chat-enter { from { transform: translateY(18px) scale(.985); opacity: .7; } }
}

@media (forced-colors: active) {
.dsh-side-chat-panel,
.dsh-side-chat-selection-actions,
.dsh-side-chat-selection-comment,
.dsh-side-chat-annotation-marker { border: 1px solid CanvasText; }
}
`;function s(e,t,n){let{offset:r,length:i}=t;if(!(!Number.isSafeInteger(r)||!Number.isSafeInteger(i)||r<0||i<0||r+i>e.draft.length||t.label!==n||e.draft.slice(r,r+i)!==t.clipboardText))return{start:r,end:r+i}}function c(e,t,n){return s(e,t,n)!==void 0}function l(e,t,n,r={}){let i=s(t,n,n.label);if(i===void 0)return;let a=i.start;for(let e of t.occurrences)if(!(e.offset>=n.offset)){if(s(t,e,e.label)===void 0||e.offset+e.length>n.offset)return;a-=e.length-1}let o=a+1;return r.consumeFollowingSeparator&&t.draft[i.end]===` `&&(o+=1),{start:a,end:o,draftRev:t.draftRev}}function u(e,t,n,r){let i=new Set(e.occurrences.map(e=>e.occurrenceId)),a=t.occurrences.filter(e=>!i.has(e.occurrenceId)&&e.source===n&&e.ref===r);return a.length===1?a[0]:void 0}let d=`dsh-side-chat-selection`;function f(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function p(e){return e.replaceAll(`&lt;`,`<`).replaceAll(`&gt;`,`>`).replaceAll(`&amp;`,`&`)}function m(e){if(typeof e!=`object`||!e)return!1;let t=e;if(typeof t.parentSessionId!=`string`||typeof t.text!=`string`||!Number.isSafeInteger(t.atSeq)||!Array.isArray(t.fragments)||typeof t.rect!=`object`||t.rect===null)return!1;let n=t.rect;return[n.x,n.y,n.width,n.height,n.viewportWidth,n.viewportHeight].every(e=>typeof e==`number`&&Number.isFinite(e))?t.fragments.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.nodeKey==`string`&&typeof t.nodeKind==`string`&&typeof t.turnKey==`string`&&Number.isSafeInteger(t.seq)&&Number.isSafeInteger(t.startOffset)&&Number.isSafeInteger(t.endOffset)&&typeof t.text==`string`&&[`user`,`assistant`,`context`,`code`].includes(t.source??``)&&typeof t.modelVisible==`boolean`&&typeof t.settled==`boolean`}):!1}function h(e){let t=JSON.parse(e);if(t===null||t.version!==2||!Array.isArray(t.annotations)||t.annotations.length===0||!t.annotations.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.text==`string`&&m(t.selection)&&(t.comment===void 0||typeof t.comment==`string`)}))throw Error(`The selected conversation annotation is no longer valid.`);return t.annotations}function g(e){return{text:e.text,...e.comment===void 0?{}:{comment:e.comment}}}function _(e){return h(e).map(g)}function v(e){return e.occurrences.filter(e=>e.source===d)}function y(e){return v(e).flatMap(e=>{try{return[...h(e.ref)]}catch{return[]}})}function b(e){return y(e).map(g)}function x(e){return y(e).map((e,t)=>({...e,annotationIndex:t}))}function S(e,t,n){let r=v(t);if(r.length>1)return!1;let i=r[0],a=i===void 0?{start:0,end:0,draftRev:t.draftRev}:l(e,t,i);if(a===void 0)return!1;let o=JSON.stringify({version:2,annotations:n});if(!e.insertReference({source:`dsh-side-chat-selection`,ref:o,label:`__dsh_side_chat_annotations__`,clipboardText:n.map(e=>e.text).join(`

`)},a))return!1;let s=e.state.getSnapshot(),f=u(t,s,d,o);return f!==void 0&&v(s).length===1&&c(s,f,`__dsh_side_chat_annotations__`)}function C(e,t,n){let r=e.state.getSnapshot(),i=n?.trim();return S(e,r,[...y(r),{text:t.text,selection:t,...i?{comment:i}:{}}])}function w(e){let t=v(e.state.getSnapshot());if(t.length===0)return!1;for(let n of t.map(e=>e.occurrenceId).reverse()){let t=e.state.getSnapshot(),r=t.occurrences.find(e=>e.occurrenceId===n);if(r===void 0)continue;let i=l(e,t,r);if(i===void 0||!e.replaceText(``,i))return!1}return v(e.state.getSnapshot()).length===0}function T(e,t){let n=e.state.getSnapshot(),r=[...y(n)];return!Number.isSafeInteger(t)||r[t]===void 0?!1:(r.splice(t,1),r.length===0?w(e):S(e,n,r))}function ee(e,t,n){let r=e.state.getSnapshot(),i=[...y(r)],a=i[t];if(!Number.isSafeInteger(t)||a===void 0)return!1;let o=n?.trim();return i[t]={text:a.text,selection:a.selection,...o?{comment:o}:{}},S(e,r,i)}function E(e){return[`<selected_context>`,...e.flatMap((e,t)=>[`<annotation index="${String(t+1)}">`,`<selected_text>`,f(e.text),`</selected_text>`,...e.comment===void 0?[]:[`<user_comment>`,f(e.comment),`</user_comment>`],`</annotation>`]),`</selected_context>`].join(`
`)}let D={trigger:`@`,name:d,order:1e3,candidates:async()=>[],onPick:()=>void 0,codec:{clipboardText:e=>_(e).map(e=>e.text).join(`

`),serialize:async(e,t)=>{if(t.aborted)throw t.reason;return E(_(e))}}};function te(e){let t=/^\s*<selected_context(?: source="current-conversation" event-seq="\d+")?>\r?\n([\s\S]*?)\r?\n<\/selected_context>\s*/u.exec(e);if(t===null)return;let n=[];if(t[0].trimStart().startsWith(`<selected_context source=`))n.push({text:p(t[1]??``)});else for(let e of t[1]?.matchAll(/<annotation(?: index="\d+")?>\r?\n([\s\S]*?)\r?\n<\/annotation>/gu)??[]){let t=e[1]??``,r=/^<selected_text>\r?\n([\s\S]*?)\r?\n<\/selected_text>(?:\r?\n<user_comment>\r?\n([\s\S]*?)\r?\n<\/user_comment>)?$/u.exec(t);n.push({text:p(r?.[1]??t),...r?.[2]===void 0?{}:{comment:p(r[2])}})}return n.length===0?void 0:{annotations:n,end:t[0].length}}function O(e,t){let n=t.trim();return[{type:`text`,text:e===void 0?n:[E([{text:e.text}]),``,`<user_question>`,f(n),`</user_question>`].join(`
`)}]}function ne(e){let t=/^<user_question>(?:\r?\n)?([\s\S]*?)(?:\r?\n)?<\/user_question>(?=$|\s)/u.exec(e);if(t!==null)return{text:p((t[1]??``).trim()),end:t[0].length}}function k(e){return e}let A=Object.freeze({en:Object.freeze({title:`Side Chat`,close:`Close Side Chat`,addToConversation:`Add to conversation`,placeholder:`Ask about this in a Side Chat`,send:`Send`,selectedPassage:`Selected passage`,selectionAttachments:e=>`${String(e)} ${e===1?`annotation`:`annotations`}`,selectionPreviewLabel:`Selected text`,selectionCommentLabel:`User comment`,removeSelection:`Remove annotation`,expand:`Expand`,collapse:`Collapse`,temporary:`Temporary; discarded when closed or reloaded`,referenceOnly:`Read-only parent context; no Session copy`,cannotReopen:`Add to conversation to keep this discussion`,readOnly:`No tools or file changes`,retry:`Retry`,genericError:`Side Chat error`,closeError:`Could not close the Side Chat`}),"zh-CN":Object.freeze({title:`侧边对话`,close:`关闭侧边对话`,addToConversation:`添加到主对话`,placeholder:`在侧边对话中询问这段内容`,send:`发送`,selectedPassage:`所选段落`,selectionAttachments:e=>`${String(e)} 条引用`,selectionPreviewLabel:`所选文本`,selectionCommentLabel:`用户批注`,removeSelection:`移除引用`,expand:`展开`,collapse:`收起`,temporary:`临时对话；关闭或刷新后丢弃`,referenceOnly:`只读父会话上下文；不复制 Session`,cannotReopen:`添加到主对话以保留讨论内容`,readOnly:`不使用工具，不修改文件`,retry:`重试`,genericError:`侧边对话错误`,closeError:`无法关闭侧边对话`})});function j({selections:e,messages:t,onRemove:n,inline:a=!1}){let o=a?`span`:`section`,s=a?`span`:`div`,c=a?`span`:`pre`,[l,u]=(0,r.useState)(!1),[d,f]=(0,r.useState)(!1),p=(0,r.useRef)(null),m=(0,r.useRef)(null),h=(0,r.useRef)(),g=()=>{h.current!==void 0&&window.clearTimeout(h.current),h.current=void 0,f(!0)},_=()=>{h.current!==void 0&&window.clearTimeout(h.current),h.current=window.setTimeout(()=>{h.current=void 0,f(!1)},220)};(0,r.useEffect)(()=>()=>{h.current!==void 0&&window.clearTimeout(h.current)},[]),(0,r.useEffect)(()=>{if(!l)return;let e=e=>{let t=p.current,n=e.target;t!==null&&n instanceof Node&&t.contains(n)||(h.current!==void 0&&window.clearTimeout(h.current),h.current=void 0,f(!1),u(!1))};return document.addEventListener(`mousedown`,e,!0),()=>{document.removeEventListener(`mousedown`,e,!0)}},[l]);let v=()=>{let e=m.current,t=p.current?.closest(`.dsh-side-chat-panel, [data-composer-seat], [data-chat-flow-kind]`);if(e===null)return;e.style.setProperty(`--dsh-side-chat-quote-offset-x`,`0px`);let n=e.getBoundingClientRect(),r=t?.getBoundingClientRect(),i=(r?.left??0)+16,a=(r?.right??window.innerWidth)-16,o=n.left<i?i-n.left:n.right>a?a-n.right:0;e.style.setProperty(`--dsh-side-chat-quote-offset-x`,`${String(o)}px`)};return/* @__PURE__ */ (0,i.jsxs)(o,{ref:e=>{p.current=e},className:`dsh-side-chat-quote`,role:a?`region`:void 0,"aria-label":t.selectedPassage,"data-expanded":l||void 0,"data-hovered":d||void 0,onMouseEnter:()=>{g(),v()},onMouseLeave:_,onFocusCapture:v,onKeyDown:e=>{e.key===`Escape`&&(l||d)&&(e.preventDefault(),e.stopPropagation(),u(!1),f(!1))},children:[/* @__PURE__ */ (0,i.jsxs)(s,{className:`dsh-side-chat-quote-chip`,children:[/* @__PURE__ */ (0,i.jsxs)(`button`,{type:`button`,className:`dsh-side-chat-quote-trigger`,"aria-expanded":l,"aria-label":`${l?t.collapse:t.expand}: ${t.selectedPassage}`,onClick:()=>{l&&(h.current!==void 0&&window.clearTimeout(h.current),h.current=void 0,f(!1)),u(e=>!e)},children:[/* @__PURE__ */ (0,i.jsxs)(`svg`,{className:`dsh-side-chat-quote-icon`,viewBox:`0 0 24 24`,"aria-hidden":`true`,children:[/* @__PURE__ */ (0,i.jsx)(`path`,{d:`M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z`}),/* @__PURE__ */ (0,i.jsx)(`path`,{d:`M8 8h8M8 12h5`})]}),/* @__PURE__ */ (0,i.jsx)(`strong`,{children:t.selectionAttachments(e.length)})]}),n!==void 0&&/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-quote-remove`,"aria-label":t.removeSelection,onClick:n,children:`×`})]}),/* @__PURE__ */ (0,i.jsx)(s,{ref:e=>{m.current=e},className:`dsh-side-chat-quote-details`,role:`tooltip`,children:e.map((e,n)=>/* @__PURE__ */ (0,i.jsxs)(s,{className:`dsh-side-chat-quote-detail`,children:[/* @__PURE__ */ (0,i.jsx)(s,{className:`dsh-side-chat-quote-details-header`,children:/* @__PURE__ */ (0,i.jsxs)(`strong`,{children:[String(n+1),`. `,t.selectionPreviewLabel,`:`]})}),/* @__PURE__ */ (0,i.jsx)(c,{className:`dsh-side-chat-quote-text`,children:e.text}),e.comment!==void 0&&/* @__PURE__ */ (0,i.jsxs)(s,{className:`dsh-side-chat-quote-comment`,children:[/* @__PURE__ */ (0,i.jsxs)(`strong`,{children:[t.selectionCommentLabel,`:`]}),/* @__PURE__ */ (0,i.jsx)(c,{className:`dsh-side-chat-quote-text`,children:e.comment})]})]},`${String(n)}-${e.text}`))})]})}function re(e){let t=e.trim().replace(/\s+/gu,` `);return t.length===0?`Side Chat`:t}function ie(e){let t=e.messages.flatMap(e=>{if(e.status===`streaming`||e.text.trim().length===0)return[];let t=e.selectedText===void 0?e.text:`Selected passage:\n${e.selectedText}\n\nQuestion:\n${e.text}`;return[{role:e.role,content:t}]});return{version:1,conversationId:e.conversationId,title:re(e.title),conversation:t}}function ae(e){if(typeof e!=`object`||!e)return!1;let t=e;return(t.role===`user`||t.role===`assistant`)&&typeof t.content==`string`&&t.content.length>0}function M(e){let t=JSON.parse(e);if(typeof t!=`object`||!t)throw Error(`The referenced Side Chat conversation is no longer valid.`);let n=t;if(n.version!==1||typeof n.conversationId!=`string`||n.conversationId.length===0||typeof n.title!=`string`||n.title.length===0||!Array.isArray(n.conversation)||n.conversation.length===0||!n.conversation.every(ae))throw Error(`The referenced Side Chat conversation is no longer valid.`);return{version:1,conversationId:n.conversationId,title:n.title,conversation:n.conversation}}function oe(e){return JSON.stringify(e)}function se(e){return JSON.stringify(e).replaceAll(`<`,`\\u003c`)}function ce(e){return[`<referenced_conversation>`,se({conversationId:e.conversationId,title:e.title,conversation:e.conversation}),`</referenced_conversation>`].join(`
`)}function le(e){let t=/^\s*<referenced_conversation>\r?\n/u.exec(e);if(t===null)return;let n=e.slice(t[0].length),r=/\r?\n<\/referenced_conversation>\s*/u.exec(n);if(r===null||r.index===0)return;let i=n.slice(0,r.index);try{let e=JSON.parse(i);return{reference:M(JSON.stringify({version:1,conversationId:e.conversationId,title:e.title,conversation:e.conversation})),end:t[0].length+r.index+r[0].length}}catch{return}}function ue(e,t){return e.occurrences.filter(e=>{if(e.source!==`dsh-side-chat-conversation`)return!1;try{return M(e.ref).conversationId===t.conversationId}catch{return!1}})}function de(e,t){let n=e.state.getSnapshot(),r=n.occurrences.find(e=>e.occurrenceId===t);if(r===void 0)return;let i=l(e,n,r);i!==void 0&&e.replaceText(``,i)}function fe(e,t){if(t.conversation.length===0)return!1;let n=e.state.getSnapshot(),r=ue(n,t),i=oe(t);if(r.some(e=>e.ref===i))return!0;let a=r[0],o=a===void 0?{start:0,end:0,draftRev:n.draftRev}:l(e,n,a);if(o===void 0||!e.insertReference({source:`dsh-side-chat-conversation`,ref:i,label:t.title,appearance:`session`,clipboardText:`@${t.title}`},o)||u(n,e.state.getSnapshot(),`dsh-side-chat-conversation`,i)===void 0)return!1;for(let t of r.slice(1))de(e,t.occurrenceId);return ue(e.state.getSnapshot(),t).length===1}let pe={trigger:`@`,name:`dsh-side-chat-conversation`,order:1001,candidates:async()=>[],onPick:()=>void 0,codec:{clipboardText:e=>`@${M(e).title}`,serialize:async(e,t)=>{if(t.aborted)throw t.reason;return ce(M(e))}}},me=`dsh-side-chat-prompt`,he={id:me,order:-100,match(e,t){if(t!==0)return;let n=0,r=[],i=[];for(;n<e.length;){let t=e.slice(n),a=r.length===0?te(t):void 0;if(a!==void 0){r=a.annotations,n+=a.end;continue}let o=le(t);if(o===void 0)break;i.push(o.reference.title),n+=o.end}if(n===0)return;let a=r.length===0?void 0:ne(e.slice(n)),o=``;if(a!==void 0){let t=e.slice(n+a.end).trimStart();n=e.length-t.length,o=a.text+(a.text&&t?`
`:``)}return{id:me,start:0,end:n,data:{annotations:r,references:i,question:o,annotationOnly:n===e.length&&!o&&i.length===0}}}};function ge({node:e,interactive:t}){let{annotations:n,references:r,question:o,annotationOnly:s}=e.data,c=navigator.language.toLowerCase().startsWith(`zh`)?`zh-CN`:`en`,l=A[c];return/* @__PURE__ */ (0,i.jsxs)(i.Fragment,{children:[n.length>0&&/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-sent-annotation`,"data-annotation-only":s||void 0,children:t?/* @__PURE__ */ (0,i.jsx)(j,{inline:!0,selections:n,messages:l}):/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-sent-annotation-summary`,children:l.selectionAttachments(n.length)})}),r.map((e,t)=>/* @__PURE__ */ (0,i.jsxs)(`span`,{children:[/* @__PURE__ */ (0,i.jsx)(a.ReferenceChip,{appearance:`session`,label:e,title:`@${e}`}),` `]},`${String(t)}:${e}`)),o]})}function _e(){return navigator.language.toLowerCase().startsWith(`zh`)?`zh-CN`:`en`}let ve=`--dsh-side-chat-parent-annotation-width`;function ye({input:e,onRemove:t,locale:n=_e()}){let a=b(e),o=(0,r.useRef)(null);return(0,r.useLayoutEffect)(()=>{let e=o.current,t=e?.closest(`[data-composer-seat]`),n=e?.querySelector(`.dsh-side-chat-quote-chip`);if(e===null||t===void 0||n===void 0||t===null||n===null)return;let r=()=>{let r=n.getBoundingClientRect().width;r>0&&t.style.setProperty(ve,`${String(r)}px`);let i=t.querySelector(`[data-composer-chip="dsh-side-chat-selection"]`);if(i===null)return;let a=i.getBoundingClientRect(),o=e.getBoundingClientRect();Number.isFinite(a.left)&&Number.isFinite(o.left)&&(e.style.setProperty(`--annotation-left`,`${a.left-o.left}px`),e.style.setProperty(`--annotation-top`,`${a.top-o.top}px`))},i,a=()=>{i===void 0&&(i=window.requestAnimationFrame(()=>{i=void 0,r()}))};r();let s=typeof ResizeObserver>`u`?void 0:new ResizeObserver(a);s?.observe(n),s?.observe(t);let c=new MutationObserver(a);return c.observe(t,{childList:!0,characterData:!0,subtree:!0}),t.addEventListener(`scroll`,a,!0),window.addEventListener(`resize`,a),()=>{i!==void 0&&window.cancelAnimationFrame(i),s?.disconnect(),c.disconnect(),t.removeEventListener(`scroll`,a,!0),window.removeEventListener(`resize`,a),t.style.removeProperty(ve)}},[e,n]),a.length===0?null:/* @__PURE__ */ (0,i.jsx)(`div`,{ref:o,className:`dsh-side-chat-parent-annotation-dock`,children:/* @__PURE__ */ (0,i.jsx)(j,{selections:a,messages:A[n],onRemove:t})})}function be({slots:e,uiConversation:t},n){let r=e.inject(`conversation.input.dock`,()=>e.register({name:`conversation.input.dock`,id:`dsh-side-chat-annotations`,order:30},({input:e,session:t})=>/* @__PURE__ */ (0,i.jsx)(ye,{input:e,onRemove:()=>n(k(t.sessionId))}))),a=e.inject(`conversation.user.text.node`,function*(){yield e.register({name:`conversation.user.text.node`,key:me},ge),yield t.userText.register(he)});return()=>{a(),r()}}var xe=class{value;label;listeners=/* @__PURE__ */ new Set;disposed=!1;constructor(e,t){this.value=e,this.label=t}getSnapshot=()=>this.value;subscribe=e=>this.disposed?()=>{}:(this.listeners.add(e),()=>{this.listeners.delete(e)});publish(e){if(!this.disposed){this.value=e;for(let e of this.listeners)try{e()}catch(e){console.error(`[${this.label}] subscriber threw`,e)}}}dispose(){this.disposed=!0,this.listeners.clear()}};function Se(e){return new TextEncoder().encode(e).byteLength}function Ce(e){return Se(e)<=16384}function we(e,t=240){let n=[...e];if(n.length<=t)return e;let r=Math.ceil(t*.65),i=t-r;return`${n.slice(0,r).join(``)}…${n.slice(-i).join(``)}`}var N=class extends Error{code;constructor(e,t){super(t),this.code=e,this.name=`SelectionValidationError`}};function Te(e){return e.replace(/\r\n?/gu,`
`).replace(/\n(?:[\t ]*\n){3,}/gu,`


`).trim()}function Ee(e){let t=e.fragments[0];if(t===void 0)throw new N(`selection_empty`,`Select some conversation text first.`);if(e.fragments.length!==1)throw new N(`selection_crosses_unsupported_nodes`,`Select text inside one completed message.`);let n=Te(e.rawText);if(n.length===0)throw new N(`selection_empty`,`The selection contains only whitespace.`);if(Se(n)>16384)throw new N(`selection_too_large`,`The selected text is too large.`);if(!t.modelVisible||!t.settled)throw new N(`context_unavailable`,`Wait for this message to finish before opening Side Chat.`);if(!Number.isSafeInteger(t.seq)||t.seq<0)throw new N(`selection_stale`,`The selected message is no longer available.`);return Object.freeze({parentSessionId:e.parentSessionId,fragments:Object.freeze([{...t}]),text:n,atSeq:t.seq,rect:Object.freeze({...e.rect})})}function De(e,t){if(t!==e.parentSessionId)throw new N(`selection_stale`,`The parent conversation changed after selection.`)}let Oe=Object.freeze({phase:`closed`,draft:``,messages:[]}),P=e=>({ok:!0,value:e}),F=e=>({ok:!1,error:e});function I(e,t=`invalid_request`,n=!1){return{code:t,message:e,recoverable:n}}var ke=class{remote;sessions;observable=new xe(Oe,`dsh-side-chat`);generation=0;modelGeneration=0;requestSequence=0;disposed=!1;releaseParent;creating;closing;running;cancelling=!1;pendingRequest;constructor(e,t){this.remote=e,this.sessions=t}getSnapshot=()=>this.observable.getSnapshot();subscribe=e=>this.observable.subscribe(e);openDraft(e={}){if(this.disposed)return F(I(`Side Chat has been disposed.`));if(this.getSnapshot().phase!==`closed`)return F(I(`Close the current Side Chat first.`,`side_chat_already_open`));let t=e.parentSessionId??this.sessions.currentSessionId();if(t===void 0)return F(I(`Start the main conversation first.`,`parent_session_missing`));try{e.selection!==void 0&&De(e.selection,t),this.releaseParent=this.sessions.retainParent(t)}catch(e){return F(I(e instanceof Error?e.message:`The parent conversation is unavailable.`,`selection_stale`))}return++this.generation,this.observable.publish({phase:`draft`,parentSessionId:t,selection:e.selection,modelSelection:this.sessions.sideChatModelPreference(),draft:e.draft??``,messages:[]}),P(void 0)}setDraft(e){let t=this.getSnapshot();return![`draft`,`error`,`ready`].includes(t.phase)||t.messages.length>0||t.error?.operation===`close`?F(I(`The draft is not editable right now.`)):(this.observable.publish({...t,draft:e}),P(void 0))}clearSelection(){let e=this.getSnapshot();return e.chatId!==void 0||![`draft`,`error`].includes(e.phase)?F(I(`The selected context is already captured.`)):(this.observable.publish({...e,selection:void 0}),P(void 0))}initializeModel(e){let t=this.getSnapshot();return t.chatId!==void 0||![`draft`,`error`].includes(t.phase)?F(I(`The model cannot be initialized now.`)):(this.observable.publish({...t,modelSelection:{...e}}),P({...e}))}async selectModel(e){let t=this.getSnapshot();if(this.cancelling||![`draft`,`error`,`ready`,`running`].includes(t.phase)||t.error?.operation===`close`)return F(I(`The model cannot be changed while Side Chat is opening, stopping, or closing.`));if(t.chatId===void 0){let t=this.initializeModel(e);return t.ok&&this.sessions.rememberSideChatModelPreference(t.value),t}let n=this.generation,r=++this.modelGeneration,i=await this.invoke(()=>this.remote.selectModel({chatId:t.chatId,...e}));return i.ok?(n===this.generation&&r===this.modelGeneration&&(this.observable.publish({...this.getSnapshot(),modelSelection:i.value.selected}),this.sessions.rememberSideChatModelPreference(i.value.selected)),P(i.value.selected)):i}async sendFirst(e){let t=this.getSnapshot(),n=e.trim();if(n.length===0||t.parentSessionId===void 0||t.messages.length>0||![`draft`,`error`,`ready`].includes(t.phase)||t.error?.operation===`close`)return F(I(`Enter a question in an open Side Chat draft.`));if(t.chatId===void 0){if(t.selection!==void 0&&!this.sessions.selectionIsCurrent(t.selection))return this.fail(I(`Select the passage again before sending.`,`selection_stale`),`create`);let e=t.selection?.atSeq??this.sessions.lastCompletedSeq(t.parentSessionId);if(e===void 0)return this.fail(I(`Wait for a completed parent turn.`,`parent_session_not_ready`,!0),`create`);let r=this.generation;this.observable.publish({...t,phase:`creating`,draft:n,error:void 0});let i=this.invoke(()=>this.remote.create({parentSessionId:t.parentSessionId,atSeq:e,selectedText:t.selection?.text,modelSelection:t.modelSelection}));this.creating=i;let a=await i;if(this.creating===i&&(this.creating=void 0),r!==this.generation)return F(I(`The Side Chat was closed.`));if(!a.ok)return this.fail(a.error,`create`);this.observable.publish({...this.getSnapshot(),phase:`ready`,chatId:a.value.chatId,boundarySeq:a.value.boundarySeq,modelSelection:a.value.modelSelection,error:void 0}),this.sessions.rememberSideChatModelPreference(a.value.modelSelection)}return await this.send(n)}async send(e){let t=this.getSnapshot(),n=e.trim();if(n.length===0||t.chatId===void 0||this.running!==void 0||this.cancelling||![`ready`,`error`].includes(t.phase)||t.error?.operation===`close`)return F(I(`Wait for the current reply or stop it before sending.`));let r=this.pendingRequest?.chatId===t.chatId&&this.pendingRequest.text===n?this.pendingRequest:{chatId:t.chatId,requestId:`${t.chatId}:${++this.requestSequence}`,text:n};this.pendingRequest=r;let i;try{i=this.remote.stream(r)}catch(e){return this.fail(I(String(e),`transport_error`,!0),`prompt`)}let a={stream:i,generation:this.generation,request:r,cancelled:!1};return this.running=a,this.observable.publish({...t,phase:t.messages.length===0?`creating`:`running`,error:void 0}),await new Promise(e=>{a.done=this.consume(a,e)})}async cancel(){let e=this.getSnapshot().chatId;if(e===void 0||this.running===void 0)return P(void 0);this.cancelling=!0;let t=this.running;t.cancelled=!0,this.disposeStream(t.stream);try{let n=await this.invoke(()=>this.remote.cancel({chatId:e}));return await t.done,n.ok?P(void 0):n}finally{this.cancelling=!1}}async retry(){let e=this.getSnapshot();return e.error?.operation===`close`?await this.close():e.messages.length===0?await this.sendFirst(e.draft):this.pendingRequest===void 0?F(I(`An admitted question is never replayed automatically. Send a follow-up to continue.`)):await this.send(this.pendingRequest.text)}async close(){if(this.closing!==void 0)return await this.closing;if(this.getSnapshot().phase===`closed`)return P(void 0);let e=this.closeCurrent();this.closing=e;try{return await e}finally{this.closing===e&&(this.closing=void 0)}}async dispose(){if(!this.disposed){this.disposed=!0;try{let e=await this.close();e.ok||this.sessions.notify({kind:`warning`,text:e.error.message})}finally{this.running!==void 0&&this.disposeStream(this.running.stream),this.releaseParent?.(),this.releaseParent=void 0,this.observable.dispose()}}}async consume(e,t){let n=!1,r=!1,i=()=>e.generation===this.generation&&this.running===e,a=`${e.request.requestId}:assistant`;try{for await(let o of e.stream){if(!i())break;let s=this.getSnapshot();if(o.type===`started`){if(n||o.requestId!==e.request.requestId)throw Error(`Invalid Side Chat admission response.`);n=!0,this.pendingRequest=void 0,this.observable.publish({...s,phase:`running`,draft:``,messages:[...s.messages,{id:`${e.request.requestId}:user`,role:`user`,text:e.request.text,status:`complete`,selectedText:s.messages.length===0?s.selection?.text:void 0},{id:a,role:`assistant`,text:``,reasoning:``,status:`streaming`}],error:void 0}),t(P(void 0))}else if(o.type===`content`){if(!n)throw Error(`Side Chat content arrived before admission.`);this.observable.publish({...s,messages:s.messages.map(e=>e.id===a?{...e,text:o.text,reasoning:o.reasoning}:e)})}else if(o.type===`finished`){if(!n)throw Error(`Side Chat ended before admission.`);r=!0,this.observable.publish({...s,phase:`ready`,messages:s.messages.map(e=>e.id===a?{...e,status:o.status}:e)});break}else{r=!0;let e={...o.error,recoverable:!n&&o.error.recoverable};this.streamFailure(e,a),t(F(e));break}}if(i()&&!r&&!e.cancelled)throw Error(`The Side Chat connection ended before the reply completed.`)}catch(r){if(i()&&!e.cancelled){let e=I(r instanceof Error?r.message:String(r),`transport_error`,!n);this.streamFailure(e,a),t(F(e))}}finally{if(i()&&e.cancelled){this.pendingRequest=void 0;let e=this.getSnapshot();this.observable.publish({...e,phase:`ready`,error:void 0,messages:e.messages.map(e=>e.id===a?{...e,status:`stopped`}:e)})}this.disposeStream(e.stream),this.running===e&&(this.running=void 0),t(F(I(`The Side Chat was closed.`)))}}streamFailure(e,t){let n=this.getSnapshot();this.observable.publish({...n,phase:n.messages.length===0?`error`:`ready`,messages:n.messages.map(e=>e.id===t?{...e,status:`error`}:e),error:{...e,operation:`prompt`}})}async closeCurrent(){let e=this.getSnapshot(),t=this.creating;++this.generation,this.running!==void 0&&this.disposeStream(this.running.stream),this.running=void 0,this.observable.publish({...e,phase:`closing`,error:void 0});let n=e.chatId;if(t!==void 0){let e=await t;e.ok&&(n=e.value.chatId)}if(n!==void 0){let e=await this.invoke(()=>this.remote.close({chatId:n}));if(!e.ok&&e.error.code!==`side_chat_not_found`)return this.observable.publish({...this.getSnapshot(),phase:`error`,chatId:n,error:{...e.error,operation:`close`}}),e}return this.pendingRequest=void 0,this.releaseParent?.(),this.releaseParent=void 0,this.observable.publish(Oe),P(void 0)}fail(e,t){return this.observable.publish({...this.getSnapshot(),phase:`error`,error:{...e,operation:t}}),F(e)}disposeStream(e){try{e.dispose()}catch{}}async invoke(e){try{return await e()}catch(e){return F(I(e instanceof Error?e.message:String(e),`transport_error`,!0))}}},Ae;/* @__NO_SIDE_EFFECTS__ */
function L(e,t,n){function r(n,r){if(n._zod||Object.defineProperty(n,"_zod",{value:{def:r,constr:o,traits:/* @__PURE__ */ new Set},enumerable:!1}),n._zod.traits.has(e))return;n._zod.traits.add(e),t(n,r);let i=o.prototype,a=Object.keys(i);for(let e=0;e<a.length;e++){let t=a[e];t in n||(n[t]=i[t].bind(n))}}let i=n?.Parent??Object;class a extends i{}Object.defineProperty(a,"name",{value:e});function o(e){var t;let i=n?.Parent?new a:this;r(i,e),(t=i._zod).deferred??(t.deferred=[]);for(let e of i._zod.deferred)e();return i}return Object.defineProperty(o,"init",{value:r}),Object.defineProperty(o,Symbol.hasInstance,{value:t=>n?.Parent&&t instanceof n.Parent?!0:t?._zod?.traits?.has(e)}),Object.defineProperty(o,"name",{value:e}),o}var je=class extends Error{constructor(){super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`)}},Me=class extends Error{constructor(e){super(`Encountered unidirectional transform during encode: ${e}`),this.name=`ZodEncodeError`}};(Ae=globalThis).__zod_globalConfig??(Ae.__zod_globalConfig={});let Ne=globalThis.__zod_globalConfig;function Pe(e){return e&&Object.assign(Ne,e),Ne}function Fe(e){let t=Object.values(e).filter(e=>typeof e==`number`);return Object.entries(e).filter(([e,n])=>t.indexOf(+e)===-1).map(([e,t])=>t)}function Ie(e,t){return typeof t==`bigint`?t.toString():t}function Le(e){return{get value(){{let t=e();return Object.defineProperty(this,"value",{value:t}),t}}}}function Re(e){return e==null}function ze(e){let t=+!!e.startsWith(`^`),n=e.endsWith(`$`)?e.length-1:e.length;return e.slice(t,n)}function Be(e,t){let n=e/t,r=Math.round(n),i=2**-52*Math.max(Math.abs(n),1);return Math.abs(n-r)<i?0:n-r}let Ve=/* @__PURE__*/ Symbol(`evaluating`);function R(e,t,n){let r;Object.defineProperty(e,t,{get(){if(r!==Ve)return r===void 0&&(r=Ve,r=n()),r},set(n){Object.defineProperty(e,t,{value:n})},configurable:!0})}function He(e,t,n){Object.defineProperty(e,t,{value:n,writable:!0,enumerable:!0,configurable:!0})}function z(...e){let t={};for(let n of e){let e=Object.getOwnPropertyDescriptors(n);Object.assign(t,e)}return Object.defineProperties({},t)}function Ue(e){return JSON.stringify(e)}function We(e){return e.toLowerCase().trim().replace(/[^\w\s-]/g,``).replace(/[\s_-]+/g,`-`).replace(/^-+|-+$/g,``)}let Ge=`captureStackTrace`in Error?Error.captureStackTrace:(...e)=>{};function Ke(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}let qe=/* @__PURE__*/ Le(()=>{if(Ne.jitless||typeof navigator<`u`&&navigator?.userAgent?.includes(`Cloudflare`))return!1;try{return Function(``),!0}catch{return!1}});function Je(e){if(Ke(e)===!1)return!1;let t=e.constructor;if(t===void 0||typeof t!=`function`)return!0;let n=t.prototype;return Ke(n)!==!1&&Object.prototype.hasOwnProperty.call(n,`isPrototypeOf`)!==!1}function Ye(e){return Je(e)?{...e}:Array.isArray(e)?[...e]:e instanceof Map?new Map(e):e instanceof Set?new Set(e):e}let Xe=/* @__PURE__*/ new Set([`string`,`number`,`symbol`]);function Ze(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function B(e,t,n){let r=new e._zod.constr(t??e._zod.def);return(!t||n?.parent)&&(r._zod.parent=e),r}function V(e){let t=e;if(!t)return{};if(typeof t==`string`)return{error:()=>t};if(t?.message!==void 0){if(t?.error!==void 0)throw Error("Cannot specify both `message` and `error` params");t.error=t.message}return delete t.message,typeof t.error==`string`?{...t,error:()=>t.error}:t}function Qe(e){return Object.keys(e).filter(t=>e[t]._zod.optin===`optional`&&e[t]._zod.optout===`optional`)}let $e={safeint:[-(2**53-1),2**53-1],int32:[-2147483648,2147483647],uint32:[0,4294967295],float32:[-34028234663852886e22,34028234663852886e22],float64:[-Number.MAX_VALUE,Number.MAX_VALUE]};function et(e,t){let n=e._zod.def,r=n.checks;if(r&&r.length>0)throw Error(`.pick() cannot be used on object schemas containing refinements`);return B(e,z(e._zod.def,{get shape(){let e={};for(let r in t){if(!(r in n.shape))throw Error(`Unrecognized key: "${r}"`);t[r]&&(e[r]=n.shape[r])}return He(this,`shape`,e),e},checks:[]}))}function tt(e,t){let n=e._zod.def,r=n.checks;if(r&&r.length>0)throw Error(`.omit() cannot be used on object schemas containing refinements`);return B(e,z(e._zod.def,{get shape(){let r={...e._zod.def.shape};for(let e in t){if(!(e in n.shape))throw Error(`Unrecognized key: "${e}"`);t[e]&&delete r[e]}return He(this,`shape`,r),r},checks:[]}))}function nt(e,t){if(!Je(t))throw Error(`Invalid input to extend: expected a plain object`);let n=e._zod.def.checks;if(n&&n.length>0){let n=e._zod.def.shape;for(let e in t)if(Object.getOwnPropertyDescriptor(n,e)!==void 0)throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.")}return B(e,z(e._zod.def,{get shape(){let n={...e._zod.def.shape,...t};return He(this,`shape`,n),n}}))}function rt(e,t){if(!Je(t))throw Error(`Invalid input to safeExtend: expected a plain object`);return B(e,z(e._zod.def,{get shape(){let n={...e._zod.def.shape,...t};return He(this,`shape`,n),n}}))}function it(e,t){if(e._zod.def.checks?.length)throw Error(`.merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.`);return B(e,z(e._zod.def,{get shape(){let n={...e._zod.def.shape,...t._zod.def.shape};return He(this,`shape`,n),n},get catchall(){return t._zod.def.catchall},checks:t._zod.def.checks??[]}))}function at(e,t,n){let r=t._zod.def.checks;if(r&&r.length>0)throw Error(`.partial() cannot be used on object schemas containing refinements`);return B(t,z(t._zod.def,{get shape(){let r=t._zod.def.shape,i={...r};if(n)for(let t in n){if(!(t in r))throw Error(`Unrecognized key: "${t}"`);n[t]&&(i[t]=e?new e({type:`optional`,innerType:r[t]}):r[t])}else for(let t in r)i[t]=e?new e({type:`optional`,innerType:r[t]}):r[t];return He(this,`shape`,i),i},checks:[]}))}function ot(e,t,n){return B(t,z(t._zod.def,{get shape(){let r=t._zod.def.shape,i={...r};if(n)for(let t in n){if(!(t in i))throw Error(`Unrecognized key: "${t}"`);n[t]&&(i[t]=new e({type:`nonoptional`,innerType:r[t]}))}else for(let t in r)i[t]=new e({type:`nonoptional`,innerType:r[t]});return He(this,`shape`,i),i}}))}function st(e,t=0){if(e.aborted===!0)return!0;for(let n=t;n<e.issues.length;n++)if(e.issues[n]?.continue!==!0)return!0;return!1}function ct(e,t=0){if(e.aborted===!0)return!0;for(let n=t;n<e.issues.length;n++)if(e.issues[n]?.continue===!1)return!0;return!1}function lt(e,t){return t.map(t=>{var n;return(n=t).path??(n.path=[]),t.path.unshift(e),t})}function ut(e){return typeof e==`string`?e:e?.message}function dt(e,t,n){let r=e.message?e.message:ut(e.inst?._zod.def?.error?.(e))??ut(t?.error?.(e))??ut(n.customError?.(e))??ut(n.localeError?.(e))??`Invalid input`,{inst:i,continue:a,input:o,...s}=e;return s.path??=[],s.message=r,t?.reportInput&&(s.input=o),s}function ft(e){return Array.isArray(e)?`array`:typeof e==`string`?`string`:`unknown`}function pt(...e){let[t,n,r]=e;return typeof t==`string`?{message:t,code:`custom`,input:n,inst:r}:{...t}}let mt=(e,t)=>{e.name=`$ZodError`,Object.defineProperty(e,"_zod",{value:e._zod,enumerable:!1}),Object.defineProperty(e,"issues",{value:t,enumerable:!1}),e.message=JSON.stringify(t,Ie,2),Object.defineProperty(e,"toString",{value:()=>e.message,enumerable:!1})},ht=/* @__PURE__ */ L(`$ZodError`,mt),gt=/* @__PURE__ */ L(`$ZodError`,mt,{Parent:Error});function _t(e,t=e=>e.message){let n={},r=[];for(let i of e.issues)i.path.length>0?(n[i.path[0]]=n[i.path[0]]||[],n[i.path[0]].push(t(i))):r.push(t(i));return{formErrors:r,fieldErrors:n}}function vt(e,t=e=>e.message){let n={_errors:[]},r=(e,i=[])=>{for(let a of e.issues)if(a.code===`invalid_union`&&a.errors.length)a.errors.map(e=>r({issues:e},[...i,...a.path]));else if(a.code===`invalid_key`)r({issues:a.issues},[...i,...a.path]);else if(a.code===`invalid_element`)r({issues:a.issues},[...i,...a.path]);else{let e=[...i,...a.path];if(e.length===0)n._errors.push(t(a));else{let r=n,i=0;for(;i<e.length;){let n=e[i];i===e.length-1?(r[n]=r[n]||{_errors:[]},r[n]._errors.push(t(a))):r[n]=r[n]||{_errors:[]},r=r[n],i++}}}};return r(e),n}let yt=e=>(t,n,r,i)=>{let a=r?{...r,async:!1}:{async:!1},o=t._zod.run({value:n,issues:[]},a);if(o instanceof Promise)throw new je;if(o.issues.length){let t=new((i?.Err)??e)(o.issues.map(e=>dt(e,a,Pe())));throw Ge(t,i?.callee),t}return o.value},bt=e=>async(t,n,r,i)=>{let a=r?{...r,async:!0}:{async:!0},o=t._zod.run({value:n,issues:[]},a);if(o instanceof Promise&&(o=await o),o.issues.length){let t=new((i?.Err)??e)(o.issues.map(e=>dt(e,a,Pe())));throw Ge(t,i?.callee),t}return o.value},xt=e=>(t,n,r)=>{let i=r?{...r,async:!1}:{async:!1},a=t._zod.run({value:n,issues:[]},i);if(a instanceof Promise)throw new je;return a.issues.length?{success:!1,error:new(e??ht)(a.issues.map(e=>dt(e,i,Pe())))}:{success:!0,data:a.value}},St=/* @__PURE__*/ xt(gt),Ct=e=>async(t,n,r)=>{let i=r?{...r,async:!0}:{async:!0},a=t._zod.run({value:n,issues:[]},i);return a instanceof Promise&&(a=await a),a.issues.length?{success:!1,error:new e(a.issues.map(e=>dt(e,i,Pe())))}:{success:!0,data:a.value}},wt=/* @__PURE__*/ Ct(gt),Tt=e=>(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return yt(e)(t,n,i)},Et=e=>(t,n,r)=>yt(e)(t,n,r),Dt=e=>async(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return bt(e)(t,n,i)},Ot=e=>async(t,n,r)=>bt(e)(t,n,r),kt=e=>(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return xt(e)(t,n,i)},At=e=>(t,n,r)=>xt(e)(t,n,r),jt=e=>async(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return Ct(e)(t,n,i)},Mt=e=>async(t,n,r)=>Ct(e)(t,n,r),Nt=/^[cC][0-9a-z]{6,}$/,Pt=/^[0-9a-z]+$/,Ft=/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,It=/^[0-9a-vA-V]{20}$/,Lt=/^[A-Za-z0-9]{27}$/,Rt=/^[a-zA-Z0-9_-]{21}$/,zt=/^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,Bt=/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,Vt=e=>e?RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`):/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,Ht=/^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;function Ut(){return/* @__PURE__ */ RegExp(`^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`,`u`)}let Wt=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,Gt=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,Kt=/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,qt=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,Jt=/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,Yt=/^[A-Za-z0-9_-]*$/,Xt=/^https?$/,Zt=/^\+[1-9]\d{6,14}$/,Qt=`(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`,$t=/*@__PURE__*/ RegExp(`^${Qt}$`);function en(e){let t=`(?:[01]\\d|2[0-3]):[0-5]\\d`;return typeof e.precision==`number`?e.precision===-1?`${t}`:e.precision===0?`${t}:[0-5]\\d`:`${t}:[0-5]\\d\\.\\d{${e.precision}}`:`${t}(?::[0-5]\\d(?:\\.\\d+)?)?`}function tn(e){return RegExp(`^${en(e)}$`)}function nn(e){let t=en({precision:e.precision}),n=[`Z`];e.local&&n.push(``),e.offset&&n.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);let r=`${t}(?:${n.join(`|`)})`;return RegExp(`^${Qt}T(?:${r})$`)}let rn=e=>{let t=e?`[\\s\\S]{${e?.minimum??0},${e?.maximum??``}}`:`[\\s\\S]*`;return RegExp(`^${t}$`)},an=/^-?\d+$/,on=/^-?\d+(?:\.\d+)?$/,sn=/^(?:true|false)$/i,cn=/^[^A-Z]*$/,ln=/^[^a-z]*$/,H=/*@__PURE__*/ L(`$ZodCheck`,(e,t)=>{var n;e._zod??={},e._zod.def=t,(n=e._zod).onattach??(n.onattach=[])}),un={number:`number`,bigint:`bigint`,object:`date`},dn=/*@__PURE__*/ L(`$ZodCheckLessThan`,(e,t)=>{H.init(e,t);let n=un[typeof t.value];e._zod.onattach.push(e=>{let n=e._zod.bag,r=(t.inclusive?n.maximum:n.exclusiveMaximum)??1/0;t.value<r&&(t.inclusive?n.maximum=t.value:n.exclusiveMaximum=t.value)}),e._zod.check=r=>{(t.inclusive?r.value<=t.value:r.value<t.value)||r.issues.push({origin:n,code:`too_big`,maximum:typeof t.value==`object`?t.value.getTime():t.value,input:r.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),fn=/*@__PURE__*/ L(`$ZodCheckGreaterThan`,(e,t)=>{H.init(e,t);let n=un[typeof t.value];e._zod.onattach.push(e=>{let n=e._zod.bag,r=(t.inclusive?n.minimum:n.exclusiveMinimum)??-1/0;t.value>r&&(t.inclusive?n.minimum=t.value:n.exclusiveMinimum=t.value)}),e._zod.check=r=>{(t.inclusive?r.value>=t.value:r.value>t.value)||r.issues.push({origin:n,code:`too_small`,minimum:typeof t.value==`object`?t.value.getTime():t.value,input:r.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),pn=/*@__PURE__*/ L(`$ZodCheckMultipleOf`,(e,t)=>{H.init(e,t),e._zod.onattach.push(e=>{var n;(n=e._zod.bag).multipleOf??(n.multipleOf=t.value)}),e._zod.check=n=>{if(typeof n.value!=typeof t.value)throw Error(`Cannot mix number and bigint in multiple_of check.`);(typeof n.value==`bigint`?n.value%t.value===BigInt(0):Be(n.value,t.value)===0)||n.issues.push({origin:typeof n.value,code:`not_multiple_of`,divisor:t.value,input:n.value,inst:e,continue:!t.abort})}}),mn=/*@__PURE__*/ L(`$ZodCheckNumberFormat`,(e,t)=>{H.init(e,t),t.format=t.format||`float64`;let n=t.format?.includes(`int`),r=n?`int`:`number`,[i,a]=$e[t.format];e._zod.onattach.push(e=>{let r=e._zod.bag;r.format=t.format,r.minimum=i,r.maximum=a,n&&(r.pattern=an)}),e._zod.check=o=>{let s=o.value;if(n){if(!Number.isInteger(s)){o.issues.push({expected:r,format:t.format,code:`invalid_type`,continue:!1,input:s,inst:e});return}if(!Number.isSafeInteger(s)){s>0?o.issues.push({input:s,code:`too_big`,maximum:2**53-1,note:`Integers must be within the safe integer range.`,inst:e,origin:r,inclusive:!0,continue:!t.abort}):o.issues.push({input:s,code:`too_small`,minimum:-(2**53-1),note:`Integers must be within the safe integer range.`,inst:e,origin:r,inclusive:!0,continue:!t.abort});return}}s<i&&o.issues.push({origin:`number`,input:s,code:`too_small`,minimum:i,inclusive:!0,inst:e,continue:!t.abort}),s>a&&o.issues.push({origin:`number`,input:s,code:`too_big`,maximum:a,inclusive:!0,inst:e,continue:!t.abort})}}),hn=/*@__PURE__*/ L(`$ZodCheckMaxLength`,(e,t)=>{var n;H.init(e,t),(n=e._zod.def).when??(n.when=e=>{let t=e.value;return!Re(t)&&t.length!==void 0}),e._zod.onattach.push(e=>{let n=e._zod.bag.maximum??1/0;t.maximum<n&&(e._zod.bag.maximum=t.maximum)}),e._zod.check=n=>{let r=n.value;if(r.length<=t.maximum)return;let i=ft(r);n.issues.push({origin:i,code:`too_big`,maximum:t.maximum,inclusive:!0,input:r,inst:e,continue:!t.abort})}}),gn=/*@__PURE__*/ L(`$ZodCheckMinLength`,(e,t)=>{var n;H.init(e,t),(n=e._zod.def).when??(n.when=e=>{let t=e.value;return!Re(t)&&t.length!==void 0}),e._zod.onattach.push(e=>{let n=e._zod.bag.minimum??-1/0;t.minimum>n&&(e._zod.bag.minimum=t.minimum)}),e._zod.check=n=>{let r=n.value;if(r.length>=t.minimum)return;let i=ft(r);n.issues.push({origin:i,code:`too_small`,minimum:t.minimum,inclusive:!0,input:r,inst:e,continue:!t.abort})}}),_n=/*@__PURE__*/ L(`$ZodCheckLengthEquals`,(e,t)=>{var n;H.init(e,t),(n=e._zod.def).when??(n.when=e=>{let t=e.value;return!Re(t)&&t.length!==void 0}),e._zod.onattach.push(e=>{let n=e._zod.bag;n.minimum=t.length,n.maximum=t.length,n.length=t.length}),e._zod.check=n=>{let r=n.value,i=r.length;if(i===t.length)return;let a=ft(r),o=i>t.length;n.issues.push({origin:a,...o?{code:`too_big`,maximum:t.length}:{code:`too_small`,minimum:t.length},inclusive:!0,exact:!0,input:n.value,inst:e,continue:!t.abort})}}),vn=/*@__PURE__*/ L(`$ZodCheckStringFormat`,(e,t)=>{var n,r;H.init(e,t),e._zod.onattach.push(e=>{let n=e._zod.bag;n.format=t.format,t.pattern&&(n.patterns??=/* @__PURE__ */ new Set,n.patterns.add(t.pattern))}),t.pattern?(n=e._zod).check??(n.check=n=>{t.pattern.lastIndex=0,t.pattern.test(n.value)||n.issues.push({origin:`string`,code:`invalid_format`,format:t.format,input:n.value,...t.pattern?{pattern:t.pattern.toString()}:{},inst:e,continue:!t.abort})}):(r=e._zod).check??(r.check=()=>{})}),yn=/*@__PURE__*/ L(`$ZodCheckRegex`,(e,t)=>{vn.init(e,t),e._zod.check=n=>{t.pattern.lastIndex=0,t.pattern.test(n.value)||n.issues.push({origin:`string`,code:`invalid_format`,format:`regex`,input:n.value,pattern:t.pattern.toString(),inst:e,continue:!t.abort})}}),bn=/*@__PURE__*/ L(`$ZodCheckLowerCase`,(e,t)=>{t.pattern??=cn,vn.init(e,t)}),xn=/*@__PURE__*/ L(`$ZodCheckUpperCase`,(e,t)=>{t.pattern??=ln,vn.init(e,t)}),Sn=/*@__PURE__*/ L(`$ZodCheckIncludes`,(e,t)=>{H.init(e,t);let n=Ze(t.includes),r=new RegExp(typeof t.position==`number`?`^.{${t.position}}${n}`:n);t.pattern=r,e._zod.onattach.push(e=>{let t=e._zod.bag;t.patterns??=/* @__PURE__ */ new Set,t.patterns.add(r)}),e._zod.check=n=>{n.value.includes(t.includes,t.position)||n.issues.push({origin:`string`,code:`invalid_format`,format:`includes`,includes:t.includes,input:n.value,inst:e,continue:!t.abort})}}),Cn=/*@__PURE__*/ L(`$ZodCheckStartsWith`,(e,t)=>{H.init(e,t);let n=RegExp(`^${Ze(t.prefix)}.*`);t.pattern??=n,e._zod.onattach.push(e=>{let t=e._zod.bag;t.patterns??=/* @__PURE__ */ new Set,t.patterns.add(n)}),e._zod.check=n=>{n.value.startsWith(t.prefix)||n.issues.push({origin:`string`,code:`invalid_format`,format:`starts_with`,prefix:t.prefix,input:n.value,inst:e,continue:!t.abort})}}),wn=/*@__PURE__*/ L(`$ZodCheckEndsWith`,(e,t)=>{H.init(e,t);let n=RegExp(`.*${Ze(t.suffix)}$`);t.pattern??=n,e._zod.onattach.push(e=>{let t=e._zod.bag;t.patterns??=/* @__PURE__ */ new Set,t.patterns.add(n)}),e._zod.check=n=>{n.value.endsWith(t.suffix)||n.issues.push({origin:`string`,code:`invalid_format`,format:`ends_with`,suffix:t.suffix,input:n.value,inst:e,continue:!t.abort})}}),Tn=/*@__PURE__*/ L(`$ZodCheckOverwrite`,(e,t)=>{H.init(e,t),e._zod.check=e=>{e.value=t.tx(e.value)}});var En=class{constructor(e=[]){this.content=[],this.indent=0,this&&(this.args=e)}indented(e){this.indent+=1,e(this),--this.indent}write(e){if(typeof e==`function`){e(this,{execution:`sync`}),e(this,{execution:`async`});return}let t=e.split(`
`).filter(e=>e),n=Math.min(...t.map(e=>e.length-e.trimStart().length)),r=t.map(e=>e.slice(n)).map(e=>` `.repeat(this.indent*2)+e);for(let e of r)this.content.push(e)}compile(){let e=Function,t=this?.args,n=[...(this?.content??[``]).map(e=>`  ${e}`)];return new e(...t,n.join(`
`))}};let Dn={major:4,minor:4,patch:3},U=/*@__PURE__*/ L(`$ZodType`,(e,t)=>{var n;e??={},e._zod.def=t,e._zod.bag=e._zod.bag||{},e._zod.version=Dn;let r=[...e._zod.def.checks??[]];e._zod.traits.has(`$ZodCheck`)&&r.unshift(e);for(let t of r)for(let n of t._zod.onattach)n(e);if(r.length===0)(n=e._zod).deferred??(n.deferred=[]),e._zod.deferred?.push(()=>{e._zod.run=e._zod.parse});else{let t=(e,t,n)=>{let r=st(e),i;for(let a of t){if(a._zod.def.when){if(ct(e)||!a._zod.def.when(e))continue}else if(r)continue;let t=e.issues.length,o=a._zod.check(e);if(o instanceof Promise&&n?.async===!1)throw new je;if(i||o instanceof Promise)i=(i??Promise.resolve()).then(async()=>{await o,e.issues.length!==t&&(r||=st(e,t))});else{if(e.issues.length===t)continue;r||=st(e,t)}}return i?i.then(()=>e):e},n=(n,i,a)=>{if(st(n))return n.aborted=!0,n;let o=t(i,r,a);if(o instanceof Promise){if(a.async===!1)throw new je;return o.then(t=>e._zod.parse(t,a))}return e._zod.parse(o,a)};e._zod.run=(i,a)=>{if(a.skipChecks)return e._zod.parse(i,a);if(a.direction===`backward`){let t=e._zod.parse({value:i.value,issues:[]},{...a,skipChecks:!0});return t instanceof Promise?t.then(e=>n(e,i,a)):n(t,i,a)}let o=e._zod.parse(i,a);if(o instanceof Promise){if(a.async===!1)throw new je;return o.then(e=>t(e,r,a))}return t(o,r,a)}}R(e,`~standard`,()=>({validate:t=>{try{let n=St(e,t);return n.success?{value:n.data}:{issues:n.error?.issues}}catch{return wt(e,t).then(e=>e.success?{value:e.data}:{issues:e.error?.issues})}},vendor:`zod`,version:1}))}),On=/*@__PURE__*/ L(`$ZodString`,(e,t)=>{U.init(e,t),e._zod.pattern=[...e?._zod.bag?.patterns??[]].pop()??rn(e._zod.bag),e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=String(n.value)}catch{}return typeof n.value==`string`||n.issues.push({expected:`string`,code:`invalid_type`,input:n.value,inst:e}),n}}),W=/*@__PURE__*/ L(`$ZodStringFormat`,(e,t)=>{vn.init(e,t),On.init(e,t)}),kn=/*@__PURE__*/ L(`$ZodGUID`,(e,t)=>{t.pattern??=Bt,W.init(e,t)}),An=/*@__PURE__*/ L(`$ZodUUID`,(e,t)=>{if(t.version){let e={v1:1,v2:2,v3:3,v4:4,v5:5,v6:6,v7:7,v8:8}[t.version];if(e===void 0)throw Error(`Invalid UUID version: "${t.version}"`);t.pattern??=Vt(e)}else t.pattern??=Vt();W.init(e,t)}),jn=/*@__PURE__*/ L(`$ZodEmail`,(e,t)=>{t.pattern??=Ht,W.init(e,t)}),Mn=/*@__PURE__*/ L(`$ZodURL`,(e,t)=>{W.init(e,t),e._zod.check=n=>{try{let r=n.value.trim();if(!t.normalize&&t.protocol?.source===Xt.source&&!/^https?:\/\//i.test(r)){n.issues.push({code:`invalid_format`,format:`url`,note:`Invalid URL format`,input:n.value,inst:e,continue:!t.abort});return}let i=new URL(r);t.hostname&&(t.hostname.lastIndex=0,t.hostname.test(i.hostname)||n.issues.push({code:`invalid_format`,format:`url`,note:`Invalid hostname`,pattern:t.hostname.source,input:n.value,inst:e,continue:!t.abort})),t.protocol&&(t.protocol.lastIndex=0,t.protocol.test(i.protocol.endsWith(`:`)?i.protocol.slice(0,-1):i.protocol)||n.issues.push({code:`invalid_format`,format:`url`,note:`Invalid protocol`,pattern:t.protocol.source,input:n.value,inst:e,continue:!t.abort})),n.value=t.normalize?i.href:r;return}catch{n.issues.push({code:`invalid_format`,format:`url`,input:n.value,inst:e,continue:!t.abort})}}}),Nn=/*@__PURE__*/ L(`$ZodEmoji`,(e,t)=>{t.pattern??=Ut(),W.init(e,t)}),Pn=/*@__PURE__*/ L(`$ZodNanoID`,(e,t)=>{t.pattern??=Rt,W.init(e,t)}),Fn=/*@__PURE__*/ L(`$ZodCUID`,(e,t)=>{t.pattern??=Nt,W.init(e,t)}),In=/*@__PURE__*/ L(`$ZodCUID2`,(e,t)=>{t.pattern??=Pt,W.init(e,t)}),Ln=/*@__PURE__*/ L(`$ZodULID`,(e,t)=>{t.pattern??=Ft,W.init(e,t)}),Rn=/*@__PURE__*/ L(`$ZodXID`,(e,t)=>{t.pattern??=It,W.init(e,t)}),zn=/*@__PURE__*/ L(`$ZodKSUID`,(e,t)=>{t.pattern??=Lt,W.init(e,t)}),Bn=/*@__PURE__*/ L(`$ZodISODateTime`,(e,t)=>{t.pattern??=nn(t),W.init(e,t)}),Vn=/*@__PURE__*/ L(`$ZodISODate`,(e,t)=>{t.pattern??=$t,W.init(e,t)}),Hn=/*@__PURE__*/ L(`$ZodISOTime`,(e,t)=>{t.pattern??=tn(t),W.init(e,t)}),Un=/*@__PURE__*/ L(`$ZodISODuration`,(e,t)=>{t.pattern??=zt,W.init(e,t)}),Wn=/*@__PURE__*/ L(`$ZodIPv4`,(e,t)=>{t.pattern??=Wt,W.init(e,t),e._zod.bag.format=`ipv4`}),Gn=/*@__PURE__*/ L(`$ZodIPv6`,(e,t)=>{t.pattern??=Gt,W.init(e,t),e._zod.bag.format=`ipv6`,e._zod.check=n=>{try{new URL(`http://[${n.value}]`)}catch{n.issues.push({code:`invalid_format`,format:`ipv6`,input:n.value,inst:e,continue:!t.abort})}}}),Kn=/*@__PURE__*/ L(`$ZodCIDRv4`,(e,t)=>{t.pattern??=Kt,W.init(e,t)}),qn=/*@__PURE__*/ L(`$ZodCIDRv6`,(e,t)=>{t.pattern??=qt,W.init(e,t),e._zod.check=n=>{let r=n.value.split(`/`);try{if(r.length!==2)throw Error();let[e,t]=r;if(!t)throw Error();let n=Number(t);if(`${n}`!==t||n<0||n>128)throw Error();new URL(`http://[${e}]`)}catch{n.issues.push({code:`invalid_format`,format:`cidrv6`,input:n.value,inst:e,continue:!t.abort})}}});function Jn(e){if(e===``)return!0;if(/\s/.test(e)||e.length%4!=0)return!1;try{return atob(e),!0}catch{return!1}}let Yn=/*@__PURE__*/ L(`$ZodBase64`,(e,t)=>{t.pattern??=Jt,W.init(e,t),e._zod.bag.contentEncoding=`base64`,e._zod.check=n=>{Jn(n.value)||n.issues.push({code:`invalid_format`,format:`base64`,input:n.value,inst:e,continue:!t.abort})}});function Xn(e){if(!Yt.test(e))return!1;let t=e.replace(/[-_]/g,e=>e===`-`?`+`:`/`);return Jn(t.padEnd(Math.ceil(t.length/4)*4,`=`))}let Zn=/*@__PURE__*/ L(`$ZodBase64URL`,(e,t)=>{t.pattern??=Yt,W.init(e,t),e._zod.bag.contentEncoding=`base64url`,e._zod.check=n=>{Xn(n.value)||n.issues.push({code:`invalid_format`,format:`base64url`,input:n.value,inst:e,continue:!t.abort})}}),Qn=/*@__PURE__*/ L(`$ZodE164`,(e,t)=>{t.pattern??=Zt,W.init(e,t)});function $n(e,t=null){try{let n=e.split(`.`);if(n.length!==3)return!1;let[r]=n;if(!r)return!1;let i=JSON.parse(atob(r));return!(`typ`in i&&i?.typ!==`JWT`||!i.alg||t&&(!(`alg`in i)||i.alg!==t))}catch{return!1}}let er=/*@__PURE__*/ L(`$ZodJWT`,(e,t)=>{W.init(e,t),e._zod.check=n=>{$n(n.value,t.alg)||n.issues.push({code:`invalid_format`,format:`jwt`,input:n.value,inst:e,continue:!t.abort})}}),tr=/*@__PURE__*/ L(`$ZodNumber`,(e,t)=>{U.init(e,t),e._zod.pattern=e._zod.bag.pattern??on,e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=Number(n.value)}catch{}let i=n.value;if(typeof i==`number`&&!Number.isNaN(i)&&Number.isFinite(i))return n;let a=typeof i==`number`?Number.isNaN(i)?`NaN`:Number.isFinite(i)?void 0:`Infinity`:void 0;return n.issues.push({expected:`number`,code:`invalid_type`,input:i,inst:e,...a?{received:a}:{}}),n}}),nr=/*@__PURE__*/ L(`$ZodNumberFormat`,(e,t)=>{mn.init(e,t),tr.init(e,t)}),rr=/*@__PURE__*/ L(`$ZodBoolean`,(e,t)=>{U.init(e,t),e._zod.pattern=sn,e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=!!n.value}catch{}let i=n.value;return typeof i==`boolean`||n.issues.push({expected:`boolean`,code:`invalid_type`,input:i,inst:e}),n}}),ir=/*@__PURE__*/ L(`$ZodUnknown`,(e,t)=>{U.init(e,t),e._zod.parse=e=>e}),ar=/*@__PURE__*/ L(`$ZodNever`,(e,t)=>{U.init(e,t),e._zod.parse=(t,n)=>(t.issues.push({expected:`never`,code:`invalid_type`,input:t.value,inst:e}),t)});function or(e,t,n){e.issues.length&&t.issues.push(...lt(n,e.issues)),t.value[n]=e.value}let sr=/*@__PURE__*/ L(`$ZodArray`,(e,t)=>{U.init(e,t),e._zod.parse=(n,r)=>{let i=n.value;if(!Array.isArray(i))return n.issues.push({expected:`array`,code:`invalid_type`,input:i,inst:e}),n;n.value=Array(i.length);let a=[];for(let e=0;e<i.length;e++){let o=i[e],s=t.element._zod.run({value:o,issues:[]},r);s instanceof Promise?a.push(s.then(t=>or(t,n,e))):or(s,n,e)}return a.length?Promise.all(a).then(()=>n):n}});function cr(e,t,n,r,i,a){let o=n in r;if(e.issues.length){if(i&&a&&!o)return;t.issues.push(...lt(n,e.issues))}!o&&!i?e.issues.length||t.issues.push({code:`invalid_type`,expected:`nonoptional`,input:void 0,path:[n]}):e.value===void 0?o&&(t.value[n]=void 0):t.value[n]=e.value}function lr(e){let t=Object.keys(e.shape);for(let n of t)if(!e.shape?.[n]?._zod?.traits?.has(`$ZodType`))throw Error(`Invalid element at key "${n}": expected a Zod schema`);let n=Qe(e.shape);return{...e,keys:t,keySet:new Set(t),numKeys:t.length,optionalKeys:new Set(n)}}function ur(e,t,n,r,i,a){let o=[],s=i.keySet,c=i.catchall._zod,l=c.def.type,u=c.optin===`optional`,d=c.optout===`optional`;for(let i in t){if(i===`__proto__`||s.has(i))continue;if(l===`never`){o.push(i);continue}let a=c.run({value:t[i],issues:[]},r);a instanceof Promise?e.push(a.then(e=>cr(e,n,i,t,u,d))):cr(a,n,i,t,u,d)}return o.length&&n.issues.push({code:`unrecognized_keys`,keys:o,input:t,inst:a}),e.length?Promise.all(e).then(()=>n):n}let dr=/*@__PURE__*/ L(`$ZodObject`,(e,t)=>{if(U.init(e,t),!Object.getOwnPropertyDescriptor(t,`shape`)?.get){let e=t.shape;Object.defineProperty(t,"shape",{get:()=>{let n={...e};return Object.defineProperty(t,"shape",{value:n}),n}})}let n=Le(()=>lr(t));R(e._zod,`propValues`,()=>{let e=t.shape,n={};for(let t in e){let r=e[t]._zod;if(r.values){n[t]??(n[t]=/* @__PURE__ */ new Set);for(let e of r.values)n[t].add(e)}}return n});let r=Ke,i=t.catchall,a;e._zod.parse=(t,o)=>{a??=n.value;let s=t.value;if(!r(s))return t.issues.push({expected:`object`,code:`invalid_type`,input:s,inst:e}),t;t.value={};let c=[],l=a.shape;for(let e of a.keys){let n=l[e],r=n._zod.optin===`optional`,i=n._zod.optout===`optional`,a=n._zod.run({value:s[e],issues:[]},o);a instanceof Promise?c.push(a.then(n=>cr(n,t,e,s,r,i))):cr(a,t,e,s,r,i)}return i?ur(c,s,t,o,n.value,e):c.length?Promise.all(c).then(()=>t):t}}),fr=/*@__PURE__*/ L(`$ZodObjectJIT`,(e,t)=>{dr.init(e,t);let n=e._zod.parse,r=Le(()=>lr(t)),i=e=>{let t=new En([`shape`,`payload`,`ctx`]),n=r.value,i=e=>{let t=Ue(e);return`shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`};t.write(`const input = payload.value;`);let a=Object.create(null),o=0;for(let e of n.keys)a[e]=`key_${o++}`;t.write(`const newResult = {};`);for(let r of n.keys){let n=a[r],o=Ue(r),s=e[r],c=s?._zod?.optin===`optional`,l=s?._zod?.optout===`optional`;t.write(`const ${n} = ${i(r)};`),c&&l?t.write(`
        if (${n}.issues.length) {
          if (${o} in input) {
            payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${o}, ...iss.path] : [${o}]
            })));
          }
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `):c?t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `):t.write(`
        const ${n}_present = ${o} in input;
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${o}]
          });
        }

        if (${n}_present) {
          if (${n}.value === undefined) {
            newResult[${o}] = undefined;
          } else {
            newResult[${o}] = ${n}.value;
          }
        }

      `)}t.write(`payload.value = newResult;`),t.write(`return payload;`);let s=t.compile();return(t,n)=>s(e,t,n)},a,o=Ke,s=!Ne.jitless,c=s&&qe.value,l=t.catchall,u;e._zod.parse=(d,f)=>{u??=r.value;let p=d.value;return o(p)?s&&c&&f?.async===!1&&f.jitless!==!0?(a||=i(t.shape),d=a(d,f),l?ur([],p,d,f,u,e):d):n(d,f):(d.issues.push({expected:`object`,code:`invalid_type`,input:p,inst:e}),d)}});function pr(e,t,n,r){for(let n of e)if(n.issues.length===0)return t.value=n.value,t;let i=e.filter(e=>!st(e));return i.length===1?(t.value=i[0].value,i[0]):(t.issues.push({code:`invalid_union`,input:t.value,inst:n,errors:e.map(e=>e.issues.map(e=>dt(e,r,Pe())))}),t)}let mr=/*@__PURE__*/ L(`$ZodUnion`,(e,t)=>{U.init(e,t),R(e._zod,`optin`,()=>t.options.some(e=>e._zod.optin===`optional`)?`optional`:void 0),R(e._zod,`optout`,()=>t.options.some(e=>e._zod.optout===`optional`)?`optional`:void 0),R(e._zod,`values`,()=>{if(t.options.every(e=>e._zod.values))return new Set(t.options.flatMap(e=>Array.from(e._zod.values)))}),R(e._zod,`pattern`,()=>{if(t.options.every(e=>e._zod.pattern)){let e=t.options.map(e=>e._zod.pattern);return RegExp(`^(${e.map(e=>ze(e.source)).join(`|`)})$`)}});let n=t.options.length===1?t.options[0]._zod.run:null;e._zod.parse=(r,i)=>{if(n)return n(r,i);let a=!1,o=[];for(let e of t.options){let t=e._zod.run({value:r.value,issues:[]},i);if(t instanceof Promise)o.push(t),a=!0;else{if(t.issues.length===0)return t;o.push(t)}}return a?Promise.all(o).then(t=>pr(t,r,e,i)):pr(o,r,e,i)}}),hr=/*@__PURE__*/ L(`$ZodDiscriminatedUnion`,(e,t)=>{t.inclusive=!1,mr.init(e,t);let n=e._zod.parse;R(e._zod,`propValues`,()=>{let e={};for(let n of t.options){let r=n._zod.propValues;if(!r||Object.keys(r).length===0)throw Error(`Invalid discriminated union option at index "${t.options.indexOf(n)}"`);for(let[t,n]of Object.entries(r)){e[t]||(e[t]=/* @__PURE__ */ new Set);for(let r of n)e[t].add(r)}}return e});let r=Le(()=>{let e=t.options,n=/* @__PURE__ */ new Map;for(let r of e){let e=r._zod.propValues?.[t.discriminator];if(!e||e.size===0)throw Error(`Invalid discriminated union option at index "${t.options.indexOf(r)}"`);for(let t of e){if(n.has(t))throw Error(`Duplicate discriminator value "${String(t)}"`);n.set(t,r)}}return n});e._zod.parse=(i,a)=>{let o=i.value;if(!Ke(o))return i.issues.push({code:`invalid_type`,expected:`object`,input:o,inst:e}),i;let s=r.value.get(o?.[t.discriminator]);return s?s._zod.run(i,a):t.unionFallback||a.direction===`backward`?n(i,a):(i.issues.push({code:`invalid_union`,errors:[],note:`No matching discriminator`,discriminator:t.discriminator,options:Array.from(r.value.keys()),input:o,path:[t.discriminator],inst:e}),i)}}),gr=/*@__PURE__*/ L(`$ZodIntersection`,(e,t)=>{U.init(e,t),e._zod.parse=(e,n)=>{let r=e.value,i=t.left._zod.run({value:r,issues:[]},n),a=t.right._zod.run({value:r,issues:[]},n);return i instanceof Promise||a instanceof Promise?Promise.all([i,a]).then(([t,n])=>vr(e,t,n)):vr(e,i,a)}});function _r(e,t){if(e===t||e instanceof Date&&t instanceof Date&&+e==+t)return{valid:!0,data:e};if(Je(e)&&Je(t)){let n=Object.keys(t),r=Object.keys(e).filter(e=>n.indexOf(e)!==-1),i={...e,...t};for(let n of r){let r=_r(e[n],t[n]);if(!r.valid)return{valid:!1,mergeErrorPath:[n,...r.mergeErrorPath]};i[n]=r.data}return{valid:!0,data:i}}if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return{valid:!1,mergeErrorPath:[]};let n=[];for(let r=0;r<e.length;r++){let i=e[r],a=t[r],o=_r(i,a);if(!o.valid)return{valid:!1,mergeErrorPath:[r,...o.mergeErrorPath]};n.push(o.data)}return{valid:!0,data:n}}return{valid:!1,mergeErrorPath:[]}}function vr(e,t,n){let r=/* @__PURE__ */ new Map,i;for(let n of t.issues)if(n.code===`unrecognized_keys`){i??=n;for(let e of n.keys)r.has(e)||r.set(e,{}),r.get(e).l=!0}else e.issues.push(n);for(let t of n.issues)if(t.code===`unrecognized_keys`)for(let e of t.keys)r.has(e)||r.set(e,{}),r.get(e).r=!0;else e.issues.push(t);let a=[...r].filter(([,e])=>e.l&&e.r).map(([e])=>e);if(a.length&&i&&e.issues.push({...i,keys:a}),st(e))return e;let o=_r(t.value,n.value);if(!o.valid)throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);return e.value=o.data,e}let yr=/*@__PURE__*/ L(`$ZodEnum`,(e,t)=>{U.init(e,t);let n=Fe(t.entries),r=new Set(n);e._zod.values=r,e._zod.pattern=RegExp(`^(${n.filter(e=>Xe.has(typeof e)).map(e=>typeof e==`string`?Ze(e):e.toString()).join(`|`)})$`),e._zod.parse=(t,i)=>{let a=t.value;return r.has(a)||t.issues.push({code:`invalid_value`,values:n,input:a,inst:e}),t}}),br=/*@__PURE__*/ L(`$ZodLiteral`,(e,t)=>{if(U.init(e,t),t.values.length===0)throw Error(`Cannot create literal schema with no valid values`);let n=new Set(t.values);e._zod.values=n,e._zod.pattern=RegExp(`^(${t.values.map(e=>typeof e==`string`?Ze(e):e?Ze(e.toString()):String(e)).join(`|`)})$`),e._zod.parse=(r,i)=>{let a=r.value;return n.has(a)||r.issues.push({code:`invalid_value`,values:t.values,input:a,inst:e}),r}}),xr=/*@__PURE__*/ L(`$ZodTransform`,(e,t)=>{U.init(e,t),e._zod.optin=`optional`,e._zod.parse=(n,r)=>{if(r.direction===`backward`)throw new Me(e.constructor.name);let i=t.transform(n.value,n);if(r.async)return(i instanceof Promise?i:Promise.resolve(i)).then(e=>(n.value=e,n.fallback=!0,n));if(i instanceof Promise)throw new je;return n.value=i,n.fallback=!0,n}});function Sr(e,t){return t===void 0&&(e.issues.length||e.fallback)?{issues:[],value:void 0}:e}let Cr=/*@__PURE__*/ L(`$ZodOptional`,(e,t)=>{U.init(e,t),e._zod.optin=`optional`,e._zod.optout=`optional`,R(e._zod,`values`,()=>t.innerType._zod.values?/* @__PURE__ */ new Set([...t.innerType._zod.values,void 0]):void 0),R(e._zod,`pattern`,()=>{let e=t.innerType._zod.pattern;return e?RegExp(`^(${ze(e.source)})?$`):void 0}),e._zod.parse=(e,n)=>{if(t.innerType._zod.optin===`optional`){let r=e.value,i=t.innerType._zod.run(e,n);return i instanceof Promise?i.then(e=>Sr(e,r)):Sr(i,r)}return e.value===void 0?e:t.innerType._zod.run(e,n)}}),wr=/*@__PURE__*/ L(`$ZodExactOptional`,(e,t)=>{Cr.init(e,t),R(e._zod,`values`,()=>t.innerType._zod.values),R(e._zod,`pattern`,()=>t.innerType._zod.pattern),e._zod.parse=(e,n)=>t.innerType._zod.run(e,n)}),Tr=/*@__PURE__*/ L(`$ZodNullable`,(e,t)=>{U.init(e,t),R(e._zod,`optin`,()=>t.innerType._zod.optin),R(e._zod,`optout`,()=>t.innerType._zod.optout),R(e._zod,`pattern`,()=>{let e=t.innerType._zod.pattern;return e?RegExp(`^(${ze(e.source)}|null)$`):void 0}),R(e._zod,`values`,()=>t.innerType._zod.values?/* @__PURE__ */ new Set([...t.innerType._zod.values,null]):void 0),e._zod.parse=(e,n)=>e.value===null?e:t.innerType._zod.run(e,n)}),Er=/*@__PURE__*/ L(`$ZodDefault`,(e,t)=>{U.init(e,t),e._zod.optin=`optional`,R(e._zod,`values`,()=>t.innerType._zod.values),e._zod.parse=(e,n)=>{if(n.direction===`backward`)return t.innerType._zod.run(e,n);if(e.value===void 0)return e.value=t.defaultValue,e;let r=t.innerType._zod.run(e,n);return r instanceof Promise?r.then(e=>Dr(e,t)):Dr(r,t)}});function Dr(e,t){return e.value===void 0&&(e.value=t.defaultValue),e}let Or=/*@__PURE__*/ L(`$ZodPrefault`,(e,t)=>{U.init(e,t),e._zod.optin=`optional`,R(e._zod,`values`,()=>t.innerType._zod.values),e._zod.parse=(e,n)=>(n.direction===`backward`||e.value===void 0&&(e.value=t.defaultValue),t.innerType._zod.run(e,n))}),kr=/*@__PURE__*/ L(`$ZodNonOptional`,(e,t)=>{U.init(e,t),R(e._zod,`values`,()=>{let e=t.innerType._zod.values;return e?new Set([...e].filter(e=>e!==void 0)):void 0}),e._zod.parse=(n,r)=>{let i=t.innerType._zod.run(n,r);return i instanceof Promise?i.then(t=>Ar(t,e)):Ar(i,e)}});function Ar(e,t){return!e.issues.length&&e.value===void 0&&e.issues.push({code:`invalid_type`,expected:`nonoptional`,input:e.value,inst:t}),e}let jr=/*@__PURE__*/ L(`$ZodCatch`,(e,t)=>{U.init(e,t),e._zod.optin=`optional`,R(e._zod,`optout`,()=>t.innerType._zod.optout),R(e._zod,`values`,()=>t.innerType._zod.values),e._zod.parse=(e,n)=>{if(n.direction===`backward`)return t.innerType._zod.run(e,n);let r=t.innerType._zod.run(e,n);return r instanceof Promise?r.then(r=>(e.value=r.value,r.issues.length&&(e.value=t.catchValue({...e,error:{issues:r.issues.map(e=>dt(e,n,Pe()))},input:e.value}),e.issues=[],e.fallback=!0),e)):(e.value=r.value,r.issues.length&&(e.value=t.catchValue({...e,error:{issues:r.issues.map(e=>dt(e,n,Pe()))},input:e.value}),e.issues=[],e.fallback=!0),e)}}),Mr=/*@__PURE__*/ L(`$ZodPipe`,(e,t)=>{U.init(e,t),R(e._zod,`values`,()=>t.in._zod.values),R(e._zod,`optin`,()=>t.in._zod.optin),R(e._zod,`optout`,()=>t.out._zod.optout),R(e._zod,`propValues`,()=>t.in._zod.propValues),e._zod.parse=(e,n)=>{if(n.direction===`backward`){let r=t.out._zod.run(e,n);return r instanceof Promise?r.then(e=>Nr(e,t.in,n)):Nr(r,t.in,n)}let r=t.in._zod.run(e,n);return r instanceof Promise?r.then(e=>Nr(e,t.out,n)):Nr(r,t.out,n)}});function Nr(e,t,n){return e.issues.length?(e.aborted=!0,e):t._zod.run({value:e.value,issues:e.issues,fallback:e.fallback},n)}let Pr=/*@__PURE__*/ L(`$ZodReadonly`,(e,t)=>{U.init(e,t),R(e._zod,`propValues`,()=>t.innerType._zod.propValues),R(e._zod,`values`,()=>t.innerType._zod.values),R(e._zod,`optin`,()=>t.innerType?._zod?.optin),R(e._zod,`optout`,()=>t.innerType?._zod?.optout),e._zod.parse=(e,n)=>{if(n.direction===`backward`)return t.innerType._zod.run(e,n);let r=t.innerType._zod.run(e,n);return r instanceof Promise?r.then(Fr):Fr(r)}});function Fr(e){return e.value=Object.freeze(e.value),e}let Ir=/*@__PURE__*/ L(`$ZodCustom`,(e,t)=>{H.init(e,t),U.init(e,t),e._zod.parse=(e,t)=>e,e._zod.check=n=>{let r=n.value,i=t.fn(r);if(i instanceof Promise)return i.then(t=>Lr(t,n,r,e));Lr(i,n,r,e)}});function Lr(e,t,n,r){if(!e){let e={code:`custom`,input:n,inst:r,path:[...r._zod.def.path??[]],continue:!r._zod.def.abort};r._zod.def.params&&(e.params=r._zod.def.params),t.issues.push(pt(e))}}var Rr,zr=class{constructor(){this._map=/* @__PURE__ */ new WeakMap,this._idmap=/* @__PURE__ */ new Map}add(e,...t){let n=t[0];return this._map.set(e,n),n&&typeof n==`object`&&`id`in n&&this._idmap.set(n.id,e),this}clear(){return this._map=/* @__PURE__ */ new WeakMap,this._idmap=/* @__PURE__ */ new Map,this}remove(e){let t=this._map.get(e);return t&&typeof t==`object`&&`id`in t&&this._idmap.delete(t.id),this._map.delete(e),this}get(e){let t=e._zod.parent;if(t){let n={...this.get(t)??{}};delete n.id;let r={...n,...this._map.get(e)};return Object.keys(r).length?r:void 0}return this._map.get(e)}has(e){return this._map.has(e)}};function Br(){return new zr}(Rr=globalThis).__zod_globalRegistry??(Rr.__zod_globalRegistry=Br());let Vr=globalThis.__zod_globalRegistry;// @__NO_SIDE_EFFECTS__
function Hr(e,t){return new e({type:`string`,...V(t)})}// @__NO_SIDE_EFFECTS__
function Ur(e,t){return new e({type:`string`,format:`email`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function Wr(e,t){return new e({type:`string`,format:`guid`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function Gr(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function Kr(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,version:`v4`,...V(t)})}// @__NO_SIDE_EFFECTS__
function qr(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,version:`v6`,...V(t)})}// @__NO_SIDE_EFFECTS__
function Jr(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,version:`v7`,...V(t)})}// @__NO_SIDE_EFFECTS__
function Yr(e,t){return new e({type:`string`,format:`url`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function Xr(e,t){return new e({type:`string`,format:`emoji`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function Zr(e,t){return new e({type:`string`,format:`nanoid`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function Qr(e,t){return new e({type:`string`,format:`cuid`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function $r(e,t){return new e({type:`string`,format:`cuid2`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ei(e,t){return new e({type:`string`,format:`ulid`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ti(e,t){return new e({type:`string`,format:`xid`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ni(e,t){return new e({type:`string`,format:`ksuid`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ri(e,t){return new e({type:`string`,format:`ipv4`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ii(e,t){return new e({type:`string`,format:`ipv6`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ai(e,t){return new e({type:`string`,format:`cidrv4`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function oi(e,t){return new e({type:`string`,format:`cidrv6`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function si(e,t){return new e({type:`string`,format:`base64`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ci(e,t){return new e({type:`string`,format:`base64url`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function li(e,t){return new e({type:`string`,format:`e164`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function ui(e,t){return new e({type:`string`,format:`jwt`,check:`string_format`,abort:!1,...V(t)})}// @__NO_SIDE_EFFECTS__
function di(e,t){return new e({type:`string`,format:`datetime`,check:`string_format`,offset:!1,local:!1,precision:null,...V(t)})}// @__NO_SIDE_EFFECTS__
function fi(e,t){return new e({type:`string`,format:`date`,check:`string_format`,...V(t)})}// @__NO_SIDE_EFFECTS__
function pi(e,t){return new e({type:`string`,format:`time`,check:`string_format`,precision:null,...V(t)})}// @__NO_SIDE_EFFECTS__
function mi(e,t){return new e({type:`string`,format:`duration`,check:`string_format`,...V(t)})}// @__NO_SIDE_EFFECTS__
function hi(e,t){return new e({type:`number`,checks:[],...V(t)})}// @__NO_SIDE_EFFECTS__
function gi(e,t){return new e({type:`number`,check:`number_format`,abort:!1,format:`safeint`,...V(t)})}// @__NO_SIDE_EFFECTS__
function _i(e,t){return new e({type:`boolean`,...V(t)})}// @__NO_SIDE_EFFECTS__
function vi(e){return new e({type:`unknown`})}// @__NO_SIDE_EFFECTS__
function yi(e,t){return new e({type:`never`,...V(t)})}// @__NO_SIDE_EFFECTS__
function bi(e,t){return new dn({check:`less_than`,...V(t),value:e,inclusive:!1})}// @__NO_SIDE_EFFECTS__
function xi(e,t){return new dn({check:`less_than`,...V(t),value:e,inclusive:!0})}// @__NO_SIDE_EFFECTS__
function Si(e,t){return new fn({check:`greater_than`,...V(t),value:e,inclusive:!1})}// @__NO_SIDE_EFFECTS__
function Ci(e,t){return new fn({check:`greater_than`,...V(t),value:e,inclusive:!0})}// @__NO_SIDE_EFFECTS__
function wi(e,t){return new pn({check:`multiple_of`,...V(t),value:e})}// @__NO_SIDE_EFFECTS__
function Ti(e,t){return new hn({check:`max_length`,...V(t),maximum:e})}// @__NO_SIDE_EFFECTS__
function Ei(e,t){return new gn({check:`min_length`,...V(t),minimum:e})}// @__NO_SIDE_EFFECTS__
function Di(e,t){return new _n({check:`length_equals`,...V(t),length:e})}// @__NO_SIDE_EFFECTS__
function Oi(e,t){return new yn({check:`string_format`,format:`regex`,...V(t),pattern:e})}// @__NO_SIDE_EFFECTS__
function ki(e){return new bn({check:`string_format`,format:`lowercase`,...V(e)})}// @__NO_SIDE_EFFECTS__
function Ai(e){return new xn({check:`string_format`,format:`uppercase`,...V(e)})}// @__NO_SIDE_EFFECTS__
function ji(e,t){return new Sn({check:`string_format`,format:`includes`,...V(t),includes:e})}// @__NO_SIDE_EFFECTS__
function Mi(e,t){return new Cn({check:`string_format`,format:`starts_with`,...V(t),prefix:e})}// @__NO_SIDE_EFFECTS__
function Ni(e,t){return new wn({check:`string_format`,format:`ends_with`,...V(t),suffix:e})}// @__NO_SIDE_EFFECTS__
function Pi(e){return new Tn({check:`overwrite`,tx:e})}// @__NO_SIDE_EFFECTS__
function Fi(e){return/* @__PURE__ */ Pi(t=>t.normalize(e))}// @__NO_SIDE_EFFECTS__
function Ii(){return/* @__PURE__ */ Pi(e=>e.trim())}// @__NO_SIDE_EFFECTS__
function Li(){return/* @__PURE__ */ Pi(e=>e.toLowerCase())}// @__NO_SIDE_EFFECTS__
function Ri(){return/* @__PURE__ */ Pi(e=>e.toUpperCase())}// @__NO_SIDE_EFFECTS__
function zi(){return/* @__PURE__ */ Pi(e=>We(e))}// @__NO_SIDE_EFFECTS__
function Bi(e,t,n){return new e({type:`array`,element:t,...V(n)})}// @__NO_SIDE_EFFECTS__
function Vi(e,t,n){return new e({type:`custom`,check:`custom`,fn:t,...V(n)})}// @__NO_SIDE_EFFECTS__
function Hi(e,t){let n=/* @__PURE__ */ Ui(t=>(t.addIssue=e=>{if(typeof e==`string`)t.issues.push(pt(e,t.value,n._zod.def));else{let r=e;r.fatal&&(r.continue=!1),r.code??=`custom`,r.input??=t.value,r.inst??=n,r.continue??=!n._zod.def.abort,t.issues.push(pt(r))}},e(t.value,t)),t);return n}// @__NO_SIDE_EFFECTS__
function Ui(e,t){let n=new H({check:`custom`,...V(t)});return n._zod.check=e,n}function Wi(e){let t=e?.target??`draft-2020-12`;return t===`draft-4`&&(t=`draft-04`),t===`draft-7`&&(t=`draft-07`),{processors:e.processors??{},metadataRegistry:e?.metadata??Vr,target:t,unrepresentable:e?.unrepresentable??`throw`,override:e?.override??(()=>{}),io:e?.io??`output`,counter:0,seen:/* @__PURE__ */ new Map,cycles:e?.cycles??`ref`,reused:e?.reused??`inline`,external:e?.external??void 0}}function G(e,t,n={path:[],schemaPath:[]}){var r;let i=e._zod.def,a=t.seen.get(e);if(a)return a.count++,n.schemaPath.includes(e)&&(a.cycle=n.path),a.schema;let o={schema:{},count:1,cycle:void 0,path:n.path};t.seen.set(e,o);let s=e._zod.toJSONSchema?.();if(s)o.schema=s;else{let r={...n,schemaPath:[...n.schemaPath,e],path:n.path};if(e._zod.processJSONSchema)e._zod.processJSONSchema(t,o.schema,r);else{let n=o.schema,a=t.processors[i.type];if(!a)throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);a(e,t,n,r)}let a=e._zod.parent;a&&(o.ref||=a,G(a,t,r),t.seen.get(a).isParent=!0)}let c=t.metadataRegistry.get(e);return c&&Object.assign(o.schema,c),t.io===`input`&&K(e)&&(delete o.schema.examples,delete o.schema.default),t.io===`input`&&`_prefault`in o.schema&&((r=o.schema).default??(r.default=o.schema._prefault)),delete o.schema._prefault,t.seen.get(e).schema}function Gi(e,t){let n=e.seen.get(t);if(!n)throw Error(`Unprocessed schema. This is a bug in Zod.`);let r=/* @__PURE__ */ new Map;for(let t of e.seen.entries()){let n=e.metadataRegistry.get(t[0])?.id;if(n){let e=r.get(n);if(e&&e!==t[0])throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);r.set(n,t[0])}}let i=t=>{let r=e.target===`draft-2020-12`?`$defs`:`definitions`;if(e.external){let n=e.external.registry.get(t[0])?.id,i=e.external.uri??(e=>e);if(n)return{ref:i(n)};let a=t[1].defId??t[1].schema.id??`schema${e.counter++}`;return t[1].defId=a,{defId:a,ref:`${i(`__shared`)}#/${r}/${a}`}}if(t[1]===n)return{ref:`#`};let i=`#/${r}/`,a=t[1].schema.id??`__schema${e.counter++}`;return{defId:a,ref:i+a}},a=e=>{if(e[1].schema.$ref)return;let t=e[1],{ref:n,defId:r}=i(e);t.def={...t.schema},r&&(t.defId=r);let a=t.schema;for(let e in a)delete a[e];a.$ref=n};if(e.cycles===`throw`)for(let t of e.seen.entries()){let e=t[1];if(e.cycle)throw Error(`Cycle detected: #/${e.cycle?.join(`/`)}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`)}for(let n of e.seen.entries()){let r=n[1];if(t===n[0])a(n);else{if(e.external){let r=e.external.registry.get(n[0])?.id;if(t!==n[0]&&r){a(n);continue}}(e.metadataRegistry.get(n[0])?.id||r.cycle||r.count>1&&e.reused===`ref`)&&a(n)}}}function Ki(e,t){let n=e.seen.get(t);if(!n)throw Error(`Unprocessed schema. This is a bug in Zod.`);let r=t=>{let n=e.seen.get(t);if(n.ref===null)return;let i=n.def??n.schema,a={...i},o=n.ref;if(n.ref=null,o){r(o);let n=e.seen.get(o),s=n.schema;if(s.$ref&&(e.target===`draft-07`||e.target===`draft-04`||e.target===`openapi-3.0`)?(i.allOf=i.allOf??[],i.allOf.push(s)):Object.assign(i,s),Object.assign(i,a),t._zod.parent===o)for(let e in i)e!==`$ref`&&e!==`allOf`&&(e in a||delete i[e]);if(s.$ref&&n.def)for(let e in i)e!==`$ref`&&e!==`allOf`&&e in n.def&&JSON.stringify(i[e])===JSON.stringify(n.def[e])&&delete i[e]}let s=t._zod.parent;if(s&&s!==o){r(s);let t=e.seen.get(s);if(t?.schema.$ref&&(i.$ref=t.schema.$ref,t.def))for(let e in i)e!==`$ref`&&e!==`allOf`&&e in t.def&&JSON.stringify(i[e])===JSON.stringify(t.def[e])&&delete i[e]}e.override({zodSchema:t,jsonSchema:i,path:n.path??[]})};for(let t of[...e.seen.entries()].reverse())r(t[0]);let i={};if(e.target===`draft-2020-12`?i.$schema=`https://json-schema.org/draft/2020-12/schema`:e.target===`draft-07`?i.$schema=`http://json-schema.org/draft-07/schema#`:e.target===`draft-04`?i.$schema=`http://json-schema.org/draft-04/schema#`:e.target,e.external?.uri){let n=e.external.registry.get(t)?.id;if(!n)throw Error("Schema is missing an `id` property");i.$id=e.external.uri(n)}Object.assign(i,n.def??n.schema);let a=e.metadataRegistry.get(t)?.id;a!==void 0&&i.id===a&&delete i.id;let o=e.external?.defs??{};for(let t of e.seen.entries()){let e=t[1];e.def&&e.defId&&(e.def.id===e.defId&&delete e.def.id,o[e.defId]=e.def)}e.external||Object.keys(o).length>0&&(e.target===`draft-2020-12`?i.$defs=o:i.definitions=o);try{let n=JSON.parse(JSON.stringify(i));return Object.defineProperty(n,"~standard",{value:{...t[`~standard`],jsonSchema:{input:Ji(t,`input`,e.processors),output:Ji(t,`output`,e.processors)}},enumerable:!1,writable:!1}),n}catch{throw Error(`Error converting schema to JSON.`)}}function K(e,t){let n=t??{seen:/* @__PURE__ */ new Set};if(n.seen.has(e))return!1;n.seen.add(e);let r=e._zod.def;if(r.type===`transform`)return!0;if(r.type===`array`)return K(r.element,n);if(r.type===`set`)return K(r.valueType,n);if(r.type===`lazy`)return K(r.getter(),n);if(r.type===`promise`||r.type===`optional`||r.type===`nonoptional`||r.type===`nullable`||r.type===`readonly`||r.type==="default"||r.type===`prefault`)return K(r.innerType,n);if(r.type===`intersection`)return K(r.left,n)||K(r.right,n);if(r.type===`record`||r.type===`map`)return K(r.keyType,n)||K(r.valueType,n);if(r.type===`pipe`)return e._zod.traits.has(`$ZodCodec`)?!0:K(r.in,n)||K(r.out,n);if(r.type===`object`){for(let e in r.shape)if(K(r.shape[e],n))return!0;return!1}if(r.type===`union`){for(let e of r.options)if(K(e,n))return!0;return!1}if(r.type===`tuple`){for(let e of r.items)if(K(e,n))return!0;return!!(r.rest&&K(r.rest,n))}return!1}let qi=(e,t={})=>n=>{let r=Wi({...n,processors:t});return G(e,r),Gi(r,e),Ki(r,e)},Ji=(e,t,n={})=>r=>{let{libraryOptions:i,target:a}=r??{},o=Wi({...i??{},target:a,io:t,processors:n});return G(e,o),Gi(o,e),Ki(o,e)},Yi={guid:`uuid`,url:`uri`,datetime:`date-time`,json_string:`json-string`,regex:``},Xi=(e,t,n,r)=>{let i=n;i.type=`string`;let{minimum:a,maximum:o,format:s,patterns:c,contentEncoding:l}=e._zod.bag;if(typeof a==`number`&&(i.minLength=a),typeof o==`number`&&(i.maxLength=o),s&&(i.format=Yi[s]??s,i.format===``&&delete i.format,s===`time`&&delete i.format),l&&(i.contentEncoding=l),c&&c.size>0){let e=[...c];e.length===1?i.pattern=e[0].source:e.length>1&&(i.allOf=[...e.map(e=>({...t.target===`draft-07`||t.target===`draft-04`||t.target===`openapi-3.0`?{type:`string`}:{},pattern:e.source}))])}},Zi=(e,t,n,r)=>{let i=n,{minimum:a,maximum:o,format:s,multipleOf:c,exclusiveMaximum:l,exclusiveMinimum:u}=e._zod.bag;i.type=typeof s==`string`&&s.includes(`int`)?`integer`:`number`;let d=typeof u==`number`&&u>=(a??-1/0),f=typeof l==`number`&&l<=(o??1/0),p=t.target===`draft-04`||t.target===`openapi-3.0`;d?p?(i.minimum=u,i.exclusiveMinimum=!0):i.exclusiveMinimum=u:typeof a==`number`&&(i.minimum=a),f?p?(i.maximum=l,i.exclusiveMaximum=!0):i.exclusiveMaximum=l:typeof o==`number`&&(i.maximum=o),typeof c==`number`&&(i.multipleOf=c)},Qi=(e,t,n,r)=>{n.type=`boolean`},$i=(e,t,n,r)=>{n.not={}},ea=(e,t,n,r)=>{let i=e._zod.def,a=Fe(i.entries);a.every(e=>typeof e==`number`)&&(n.type=`number`),a.every(e=>typeof e==`string`)&&(n.type=`string`),n.enum=a},ta=(e,t,n,r)=>{let i=e._zod.def,a=[];for(let e of i.values)if(e===void 0){if(t.unrepresentable===`throw`)throw Error("Literal `undefined` cannot be represented in JSON Schema")}else if(typeof e==`bigint`){if(t.unrepresentable===`throw`)throw Error(`BigInt literals cannot be represented in JSON Schema`);a.push(Number(e))}else a.push(e);if(a.length!==0){if(a.length===1){let e=a[0];n.type=e===null?`null`:typeof e,t.target===`draft-04`||t.target===`openapi-3.0`?n.enum=[e]:n.const=e}else a.every(e=>typeof e==`number`)&&(n.type=`number`),a.every(e=>typeof e==`string`)&&(n.type=`string`),a.every(e=>typeof e==`boolean`)&&(n.type=`boolean`),a.every(e=>e===null)&&(n.type=`null`),n.enum=a}},na=(e,t,n,r)=>{if(t.unrepresentable===`throw`)throw Error(`Custom types cannot be represented in JSON Schema`)},ra=(e,t,n,r)=>{if(t.unrepresentable===`throw`)throw Error(`Transforms cannot be represented in JSON Schema`)},ia=(e,t,n,r)=>{let i=n,a=e._zod.def,{minimum:o,maximum:s}=e._zod.bag;typeof o==`number`&&(i.minItems=o),typeof s==`number`&&(i.maxItems=s),i.type=`array`,i.items=G(a.element,t,{...r,path:[...r.path,`items`]})},aa=(e,t,n,r)=>{let i=n,a=e._zod.def;i.type=`object`,i.properties={};let o=a.shape;for(let e in o)i.properties[e]=G(o[e],t,{...r,path:[...r.path,`properties`,e]});let s=new Set(Object.keys(o)),c=new Set([...s].filter(e=>{let n=a.shape[e]._zod;return t.io===`input`?n.optin===void 0:n.optout===void 0}));c.size>0&&(i.required=Array.from(c)),a.catchall?._zod.def.type===`never`?i.additionalProperties=!1:a.catchall?a.catchall&&(i.additionalProperties=G(a.catchall,t,{...r,path:[...r.path,`additionalProperties`]})):t.io===`output`&&(i.additionalProperties=!1)},oa=(e,t,n,r)=>{let i=e._zod.def,a=i.inclusive===!1,o=i.options.map((e,n)=>G(e,t,{...r,path:[...r.path,a?`oneOf`:`anyOf`,n]}));a?n.oneOf=o:n.anyOf=o},sa=(e,t,n,r)=>{let i=e._zod.def,a=G(i.left,t,{...r,path:[...r.path,`allOf`,0]}),o=G(i.right,t,{...r,path:[...r.path,`allOf`,1]}),s=e=>`allOf`in e&&Object.keys(e).length===1;n.allOf=[...s(a)?a.allOf:[a],...s(o)?o.allOf:[o]]},ca=(e,t,n,r)=>{let i=e._zod.def,a=G(i.innerType,t,r),o=t.seen.get(e);t.target===`openapi-3.0`?(o.ref=i.innerType,n.nullable=!0):n.anyOf=[a,{type:`null`}]},la=(e,t,n,r)=>{let i=e._zod.def;G(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType},ua=(e,t,n,r)=>{let i=e._zod.def;G(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType,n.default=JSON.parse(JSON.stringify(i.defaultValue))},da=(e,t,n,r)=>{let i=e._zod.def;G(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType,t.io===`input`&&(n._prefault=JSON.parse(JSON.stringify(i.defaultValue)))},fa=(e,t,n,r)=>{let i=e._zod.def;G(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType;let o;try{o=i.catchValue(void 0)}catch{throw Error(`Dynamic catch values are not supported in JSON Schema`)}n.default=o},pa=(e,t,n,r)=>{let i=e._zod.def,a=i.in._zod.traits.has(`$ZodTransform`),o=t.io===`input`?a?i.out:i.in:i.out;G(o,t,r);let s=t.seen.get(e);s.ref=o},ma=(e,t,n,r)=>{let i=e._zod.def;G(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType,n.readOnly=!0},ha=(e,t,n,r)=>{let i=e._zod.def;G(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType},ga=/*@__PURE__*/ L(`ZodISODateTime`,(e,t)=>{Bn.init(e,t),Y.init(e,t)});function _a(e){return/* @__PURE__ */ di(ga,e)}let va=/*@__PURE__*/ L(`ZodISODate`,(e,t)=>{Vn.init(e,t),Y.init(e,t)});function ya(e){return/* @__PURE__ */ fi(va,e)}let ba=/*@__PURE__*/ L(`ZodISOTime`,(e,t)=>{Hn.init(e,t),Y.init(e,t)});function xa(e){return/* @__PURE__ */ pi(ba,e)}let Sa=/*@__PURE__*/ L(`ZodISODuration`,(e,t)=>{Un.init(e,t),Y.init(e,t)});function Ca(e){return/* @__PURE__ */ mi(Sa,e)}let q=/*@__PURE__*/ L(`ZodError`,(e,t)=>{ht.init(e,t),e.name=`ZodError`,Object.defineProperties(e,{format:{value:t=>vt(e,t)},flatten:{value:t=>_t(e,t)},addIssue:{value:t=>{e.issues.push(t),e.message=JSON.stringify(e.issues,Ie,2)}},addIssues:{value:t=>{e.issues.push(...t),e.message=JSON.stringify(e.issues,Ie,2)}},isEmpty:{get(){return e.issues.length===0}}})},{Parent:Error}),wa=/* @__PURE__ */ yt(q),Ta=/* @__PURE__ */ bt(q),Ea=/* @__PURE__ */ xt(q),Da=/* @__PURE__ */ Ct(q),Oa=/* @__PURE__ */ Tt(q),ka=/* @__PURE__ */ Et(q),Aa=/* @__PURE__ */ Dt(q),ja=/* @__PURE__ */ Ot(q),Ma=/* @__PURE__ */ kt(q),Na=/* @__PURE__ */ At(q),Pa=/* @__PURE__ */ jt(q),Fa=/* @__PURE__ */ Mt(q),Ia=/* @__PURE__ */ new WeakMap;function La(e,t,n){let r=Object.getPrototypeOf(e),i=Ia.get(r);if(i||(i=/* @__PURE__ */ new Set,Ia.set(r,i)),!i.has(t)){i.add(t);for(let e in n){let t=n[e];Object.defineProperty(r,e,{configurable:!0,enumerable:!1,get(){let n=t.bind(this);return Object.defineProperty(this,e,{configurable:!0,writable:!0,enumerable:!0,value:n}),n},set(t){Object.defineProperty(this,e,{configurable:!0,writable:!0,enumerable:!0,value:t})}})}}}let J=/*@__PURE__*/ L(`ZodType`,(e,t)=>(U.init(e,t),Object.assign(e[`~standard`],{jsonSchema:{input:Ji(e,`input`),output:Ji(e,`output`)}}),e.toJSONSchema=qi(e,{}),e.def=t,e.type=t.type,Object.defineProperty(e,"_def",{value:t}),e.parse=(t,n)=>wa(e,t,n,{callee:e.parse}),e.safeParse=(t,n)=>Ea(e,t,n),e.parseAsync=async(t,n)=>Ta(e,t,n,{callee:e.parseAsync}),e.safeParseAsync=async(t,n)=>Da(e,t,n),e.spa=e.safeParseAsync,e.encode=(t,n)=>Oa(e,t,n),e.decode=(t,n)=>ka(e,t,n),e.encodeAsync=async(t,n)=>Aa(e,t,n),e.decodeAsync=async(t,n)=>ja(e,t,n),e.safeEncode=(t,n)=>Ma(e,t,n),e.safeDecode=(t,n)=>Na(e,t,n),e.safeEncodeAsync=async(t,n)=>Pa(e,t,n),e.safeDecodeAsync=async(t,n)=>Fa(e,t,n),La(e,`ZodType`,{check(...e){let t=this.def;return this.clone(z(t,{checks:[...t.checks??[],...e.map(e=>typeof e==`function`?{_zod:{check:e,def:{check:`custom`},onattach:[]}}:e)]}),{parent:!0})},with(...e){return this.check(...e)},clone(e,t){return B(this,e,t)},brand(){return this},register(e,t){return e.add(this,t),this},refine(e,t){return this.check(Xo(e,t))},superRefine(e,t){return this.check(Zo(e,t))},overwrite(e){return this.check(/* @__PURE__ */ Pi(e))},optional(){return Mo(this)},exactOptional(){return Po(this)},nullable(){return Io(this)},nullish(){return Mo(Io(this))},nonoptional(e){return Ho(this,e)},array(){return vo(this)},or(e){return xo([this,e])},and(e){return To(this,e)},transform(e){return Ko(this,Ao(e))},default(e){return Ro(this,e)},prefault(e){return Bo(this,e)},catch(e){return Wo(this,e)},pipe(e){return Ko(this,e)},readonly(){return Jo(this)},describe(e){let t=this.clone();return Vr.add(t,{description:e}),t},meta(...e){if(e.length===0)return Vr.get(this);let t=this.clone();return Vr.add(t,e[0]),t},isOptional(){return this.safeParse(void 0).success},isNullable(){return this.safeParse(null).success},apply(e){return e(this)}}),Object.defineProperty(e,"description",{get(){return Vr.get(e)?.description},configurable:!0}),e)),Ra=/*@__PURE__*/ L(`_ZodString`,(e,t)=>{On.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Xi(e,t,n,r);let n=e._zod.bag;e.format=n.format??null,e.minLength=n.minimum??null,e.maxLength=n.maximum??null,La(e,`_ZodString`,{regex(...e){return this.check(/* @__PURE__ */ Oi(...e))},includes(...e){return this.check(/* @__PURE__ */ ji(...e))},startsWith(...e){return this.check(/* @__PURE__ */ Mi(...e))},endsWith(...e){return this.check(/* @__PURE__ */ Ni(...e))},min(...e){return this.check(/* @__PURE__ */ Ei(...e))},max(...e){return this.check(/* @__PURE__ */ Ti(...e))},length(...e){return this.check(/* @__PURE__ */ Di(...e))},nonempty(...e){return this.check(/* @__PURE__ */ Ei(1,...e))},lowercase(e){return this.check(/* @__PURE__ */ ki(e))},uppercase(e){return this.check(/* @__PURE__ */ Ai(e))},trim(){return this.check(/* @__PURE__ */ Ii())},normalize(...e){return this.check(/* @__PURE__ */ Fi(...e))},toLowerCase(){return this.check(/* @__PURE__ */ Li())},toUpperCase(){return this.check(/* @__PURE__ */ Ri())},slugify(){return this.check(/* @__PURE__ */ zi())}})}),za=/*@__PURE__*/ L(`ZodString`,(e,t)=>{On.init(e,t),Ra.init(e,t),e.email=t=>e.check(/* @__PURE__ */ Ur(Va,t)),e.url=t=>e.check(/* @__PURE__ */ Yr(Wa,t)),e.jwt=t=>e.check(/* @__PURE__ */ ui(ao,t)),e.emoji=t=>e.check(/* @__PURE__ */ Xr(Ga,t)),e.guid=t=>e.check(/* @__PURE__ */ Wr(Ha,t)),e.uuid=t=>e.check(/* @__PURE__ */ Gr(Ua,t)),e.uuidv4=t=>e.check(/* @__PURE__ */ Kr(Ua,t)),e.uuidv6=t=>e.check(/* @__PURE__ */ qr(Ua,t)),e.uuidv7=t=>e.check(/* @__PURE__ */ Jr(Ua,t)),e.nanoid=t=>e.check(/* @__PURE__ */ Zr(Ka,t)),e.guid=t=>e.check(/* @__PURE__ */ Wr(Ha,t)),e.cuid=t=>e.check(/* @__PURE__ */ Qr(qa,t)),e.cuid2=t=>e.check(/* @__PURE__ */ $r(Ja,t)),e.ulid=t=>e.check(/* @__PURE__ */ ei(Ya,t)),e.base64=t=>e.check(/* @__PURE__ */ si(no,t)),e.base64url=t=>e.check(/* @__PURE__ */ ci(ro,t)),e.xid=t=>e.check(/* @__PURE__ */ ti(Xa,t)),e.ksuid=t=>e.check(/* @__PURE__ */ ni(Za,t)),e.ipv4=t=>e.check(/* @__PURE__ */ ri(Qa,t)),e.ipv6=t=>e.check(/* @__PURE__ */ ii($a,t)),e.cidrv4=t=>e.check(/* @__PURE__ */ ai(eo,t)),e.cidrv6=t=>e.check(/* @__PURE__ */ oi(to,t)),e.e164=t=>e.check(/* @__PURE__ */ li(io,t)),e.datetime=t=>e.check(_a(t)),e.date=t=>e.check(ya(t)),e.time=t=>e.check(xa(t)),e.duration=t=>e.check(Ca(t))});function Ba(e){return/* @__PURE__ */ Hr(za,e)}let Y=/*@__PURE__*/ L(`ZodStringFormat`,(e,t)=>{W.init(e,t),Ra.init(e,t)}),Va=/*@__PURE__*/ L(`ZodEmail`,(e,t)=>{jn.init(e,t),Y.init(e,t)}),Ha=/*@__PURE__*/ L(`ZodGUID`,(e,t)=>{kn.init(e,t),Y.init(e,t)}),Ua=/*@__PURE__*/ L(`ZodUUID`,(e,t)=>{An.init(e,t),Y.init(e,t)}),Wa=/*@__PURE__*/ L(`ZodURL`,(e,t)=>{Mn.init(e,t),Y.init(e,t)}),Ga=/*@__PURE__*/ L(`ZodEmoji`,(e,t)=>{Nn.init(e,t),Y.init(e,t)}),Ka=/*@__PURE__*/ L(`ZodNanoID`,(e,t)=>{Pn.init(e,t),Y.init(e,t)}),qa=/*@__PURE__*/ L(`ZodCUID`,(e,t)=>{Fn.init(e,t),Y.init(e,t)}),Ja=/*@__PURE__*/ L(`ZodCUID2`,(e,t)=>{In.init(e,t),Y.init(e,t)}),Ya=/*@__PURE__*/ L(`ZodULID`,(e,t)=>{Ln.init(e,t),Y.init(e,t)}),Xa=/*@__PURE__*/ L(`ZodXID`,(e,t)=>{Rn.init(e,t),Y.init(e,t)}),Za=/*@__PURE__*/ L(`ZodKSUID`,(e,t)=>{zn.init(e,t),Y.init(e,t)}),Qa=/*@__PURE__*/ L(`ZodIPv4`,(e,t)=>{Wn.init(e,t),Y.init(e,t)}),$a=/*@__PURE__*/ L(`ZodIPv6`,(e,t)=>{Gn.init(e,t),Y.init(e,t)}),eo=/*@__PURE__*/ L(`ZodCIDRv4`,(e,t)=>{Kn.init(e,t),Y.init(e,t)}),to=/*@__PURE__*/ L(`ZodCIDRv6`,(e,t)=>{qn.init(e,t),Y.init(e,t)}),no=/*@__PURE__*/ L(`ZodBase64`,(e,t)=>{Yn.init(e,t),Y.init(e,t)}),ro=/*@__PURE__*/ L(`ZodBase64URL`,(e,t)=>{Zn.init(e,t),Y.init(e,t)}),io=/*@__PURE__*/ L(`ZodE164`,(e,t)=>{Qn.init(e,t),Y.init(e,t)}),ao=/*@__PURE__*/ L(`ZodJWT`,(e,t)=>{er.init(e,t),Y.init(e,t)}),oo=/*@__PURE__*/ L(`ZodNumber`,(e,t)=>{tr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Zi(e,t,n,r),La(e,`ZodNumber`,{gt(e,t){return this.check(/* @__PURE__ */ Si(e,t))},gte(e,t){return this.check(/* @__PURE__ */ Ci(e,t))},min(e,t){return this.check(/* @__PURE__ */ Ci(e,t))},lt(e,t){return this.check(/* @__PURE__ */ bi(e,t))},lte(e,t){return this.check(/* @__PURE__ */ xi(e,t))},max(e,t){return this.check(/* @__PURE__ */ xi(e,t))},int(e){return this.check(lo(e))},safe(e){return this.check(lo(e))},positive(e){return this.check(/* @__PURE__ */ Si(0,e))},nonnegative(e){return this.check(/* @__PURE__ */ Ci(0,e))},negative(e){return this.check(/* @__PURE__ */ bi(0,e))},nonpositive(e){return this.check(/* @__PURE__ */ xi(0,e))},multipleOf(e,t){return this.check(/* @__PURE__ */ wi(e,t))},step(e,t){return this.check(/* @__PURE__ */ wi(e,t))},finite(){return this}});let n=e._zod.bag;e.minValue=Math.max(n.minimum??-1/0,n.exclusiveMinimum??-1/0)??null,e.maxValue=Math.min(n.maximum??1/0,n.exclusiveMaximum??1/0)??null,e.isInt=(n.format??``).includes(`int`)||Number.isSafeInteger(n.multipleOf??.5),e.isFinite=!0,e.format=n.format??null});function so(e){return/* @__PURE__ */ hi(oo,e)}let co=/*@__PURE__*/ L(`ZodNumberFormat`,(e,t)=>{nr.init(e,t),oo.init(e,t)});function lo(e){return/* @__PURE__ */ gi(co,e)}let uo=/*@__PURE__*/ L(`ZodBoolean`,(e,t)=>{rr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Qi(e,t,n,r)});function fo(e){return/* @__PURE__ */ _i(uo,e)}let po=/*@__PURE__*/ L(`ZodUnknown`,(e,t)=>{ir.init(e,t),J.init(e,t),e._zod.processJSONSchema=(e,t,n)=>void 0});function mo(){return/* @__PURE__ */ vi(po)}let ho=/*@__PURE__*/ L(`ZodNever`,(e,t)=>{ar.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>$i(e,t,n,r)});function go(e){return/* @__PURE__ */ yi(ho,e)}let _o=/*@__PURE__*/ L(`ZodArray`,(e,t)=>{sr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ia(e,t,n,r),e.element=t.element,La(e,`ZodArray`,{min(e,t){return this.check(/* @__PURE__ */ Ei(e,t))},nonempty(e){return this.check(/* @__PURE__ */ Ei(1,e))},max(e,t){return this.check(/* @__PURE__ */ Ti(e,t))},length(e,t){return this.check(/* @__PURE__ */ Di(e,t))},unwrap(){return this.element}})});function vo(e,t){return/* @__PURE__ */ Bi(_o,e,t)}let yo=/*@__PURE__*/ L(`ZodObject`,(e,t)=>{fr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>aa(e,t,n,r),R(e,`shape`,()=>t.shape),La(e,`ZodObject`,{keyof(){return Do(Object.keys(this._zod.def.shape))},catchall(e){return this.clone({...this._zod.def,catchall:e})},passthrough(){return this.clone({...this._zod.def,catchall:mo()})},loose(){return this.clone({...this._zod.def,catchall:mo()})},strict(){return this.clone({...this._zod.def,catchall:go()})},strip(){return this.clone({...this._zod.def,catchall:void 0})},extend(e){return nt(this,e)},safeExtend(e){return rt(this,e)},merge(e){return it(this,e)},pick(e){return et(this,e)},omit(e){return tt(this,e)},partial(...e){return at(jo,this,e[0])},required(...e){return ot(Vo,this,e[0])}})});function X(e,t){let n={type:`object`,shape:e??{},...V(t)};return new yo(n)}let bo=/*@__PURE__*/ L(`ZodUnion`,(e,t)=>{mr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>oa(e,t,n,r),e.options=t.options});function xo(e,t){return new bo({type:`union`,options:e,...V(t)})}let So=/*@__PURE__*/ L(`ZodDiscriminatedUnion`,(e,t)=>{bo.init(e,t),hr.init(e,t)});function Co(e,t,n){return new So({type:`union`,options:t,discriminator:e,...V(n)})}let wo=/*@__PURE__*/ L(`ZodIntersection`,(e,t)=>{gr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>sa(e,t,n,r)});function To(e,t){return new wo({type:`intersection`,left:e,right:t})}let Eo=/*@__PURE__*/ L(`ZodEnum`,(e,t)=>{yr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ea(e,t,n,r),e.enum=t.entries,e.options=Object.values(t.entries);let n=new Set(Object.keys(t.entries));e.extract=(e,r)=>{let i={};for(let r of e)if(n.has(r))i[r]=t.entries[r];else throw Error(`Key ${r} not found in enum`);return new Eo({...t,checks:[],...V(r),entries:i})},e.exclude=(e,r)=>{let i={...t.entries};for(let t of e)if(n.has(t))delete i[t];else throw Error(`Key ${t} not found in enum`);return new Eo({...t,checks:[],...V(r),entries:i})}});function Do(e,t){let n=Array.isArray(e)?Object.fromEntries(e.map(e=>[e,e])):e;return new Eo({type:`enum`,entries:n,...V(t)})}let Oo=/*@__PURE__*/ L(`ZodLiteral`,(e,t)=>{br.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ta(e,t,n,r),e.values=new Set(t.values),Object.defineProperty(e,"value",{get(){if(t.values.length>1)throw Error("This schema contains multiple valid literal values. Use `.values` instead.");return t.values[0]}})});function Z(e,t){return new Oo({type:`literal`,values:Array.isArray(e)?e:[e],...V(t)})}let ko=/*@__PURE__*/ L(`ZodTransform`,(e,t)=>{xr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ra(e,t,n,r),e._zod.parse=(n,r)=>{if(r.direction===`backward`)throw new Me(e.constructor.name);n.addIssue=r=>{if(typeof r==`string`)n.issues.push(pt(r,n.value,t));else{let t=r;t.fatal&&(t.continue=!1),t.code??=`custom`,t.input??=n.value,t.inst??=e,n.issues.push(pt(t))}};let i=t.transform(n.value,n);return i instanceof Promise?i.then(e=>(n.value=e,n.fallback=!0,n)):(n.value=i,n.fallback=!0,n)}});function Ao(e){return new ko({type:`transform`,transform:e})}let jo=/*@__PURE__*/ L(`ZodOptional`,(e,t)=>{Cr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ha(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function Mo(e){return new jo({type:`optional`,innerType:e})}let No=/*@__PURE__*/ L(`ZodExactOptional`,(e,t)=>{wr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ha(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function Po(e){return new No({type:`optional`,innerType:e})}let Fo=/*@__PURE__*/ L(`ZodNullable`,(e,t)=>{Tr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ca(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function Io(e){return new Fo({type:`nullable`,innerType:e})}let Lo=/*@__PURE__*/ L(`ZodDefault`,(e,t)=>{Er.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ua(e,t,n,r),e.unwrap=()=>e._zod.def.innerType,e.removeDefault=e.unwrap});function Ro(e,t){return new Lo({type:`default`,innerType:e,get defaultValue(){return typeof t==`function`?t():Ye(t)}})}let zo=/*@__PURE__*/ L(`ZodPrefault`,(e,t)=>{Or.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>da(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function Bo(e,t){return new zo({type:`prefault`,innerType:e,get defaultValue(){return typeof t==`function`?t():Ye(t)}})}let Vo=/*@__PURE__*/ L(`ZodNonOptional`,(e,t)=>{kr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>la(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function Ho(e,t){return new Vo({type:`nonoptional`,innerType:e,...V(t)})}let Uo=/*@__PURE__*/ L(`ZodCatch`,(e,t)=>{jr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>fa(e,t,n,r),e.unwrap=()=>e._zod.def.innerType,e.removeCatch=e.unwrap});function Wo(e,t){return new Uo({type:`catch`,innerType:e,catchValue:typeof t==`function`?t:()=>t})}let Go=/*@__PURE__*/ L(`ZodPipe`,(e,t)=>{Mr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>pa(e,t,n,r),e.in=t.in,e.out=t.out});function Ko(e,t){return new Go({type:`pipe`,in:e,out:t})}let qo=/*@__PURE__*/ L(`ZodReadonly`,(e,t)=>{Pr.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ma(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function Jo(e){return new qo({type:`readonly`,innerType:e})}let Yo=/*@__PURE__*/ L(`ZodCustom`,(e,t)=>{Ir.init(e,t),J.init(e,t),e._zod.processJSONSchema=(t,n,r)=>na(e,t,n,r)});function Xo(e,t={}){return/* @__PURE__ */ Vi(Yo,e,t)}function Zo(e,t){return/* @__PURE__ */ Hi(e,t)}let Qo=[`selection_empty`,`selection_outside_conversation`,`selection_not_model_visible`,`selection_too_large`,`selection_stale`,`selection_crosses_unsupported_nodes`,`parent_session_missing`,`parent_session_not_ready`,`context_unavailable`,`context_too_large`,`side_chat_already_open`,`side_chat_not_found`,`side_chat_prompt_failed`,`side_chat_model_failed`,`side_chat_interrupt_failed`,`side_chat_destroy_failed`,`transport_error`,`invalid_request`,`internal_error`],Q=Ba().min(1).max(512),$o=X({provider:Q,model:Q,reasoningEffort:Q.optional()}).strict(),es=X({code:Do(Qo),message:Ba(),recoverable:fo()}).strict(),ts=X({parentSessionId:Q,atSeq:so().int().nonnegative(),selectedText:Ba().max(16384).optional(),modelSelection:$o.optional()}).strict(),ns=X({chatId:Q}).strict(),rs=X({chatId:Q,provider:Q,model:Q,reasoningEffort:Q.optional()}).strict(),is=X({chatId:Q,requestId:Q,text:Ba().min(1).max(65536)}).strict();function as(e){return Co(`ok`,[X({ok:Z(!0),value:e}).strict(),X({ok:Z(!1),error:es}).strict()])}let os=as(X({parentSessionId:Q,chatId:Q,boundarySeq:so().int().nonnegative(),modelSelection:$o}).strict()),ss=as(X({selected:$o}).strict()),cs=as(X({closed:Z(!0)}).strict()),ls=as(X({cancelled:Z(!0)}).strict()),us=Co(`type`,[X({type:Z(`started`),requestId:Q,modelSelection:$o}).strict(),X({type:Z(`content`),text:Ba(),reasoning:Ba()}).strict(),X({type:Z(`finished`),status:Do([`complete`,`stopped`])}).strict(),X({type:Z(`error`),error:es}).strict()]);function ds(e,t,n,r,i,a={}){return{id:`@ahggg/dsh-side-chat#sideChat/${e}`,service:`sideChat`,namespace:`sideChat`,method:e,implementation:e,invocation:{kind:`direct`},...a.stream?{mode:`stream`}:{},...a.cancellation?{cancellation:{parameter:`signal`}}:{},parameters:[{name:`request`,wire:`request`,source:`json`,codec:{mode:`strict`,typeSymbol:`@ahggg/dsh-side-chat/remote#${t}`,create:()=>r}}],result:{mode:`strict`,typeSymbol:`@ahggg/dsh-side-chat/remote#${n}`,create:()=>i},sourceLocation:{file:`src/index.ts`,line:1,column:1}}}let fs={package:`@ahggg/dsh-side-chat`,descriptors:[ds(`create`,`CreateSideChatRequest`,`CreateResult`,ts,os,{cancellation:!0}),ds(`selectModel`,`SelectSideChatModelRequest`,`SelectModelResult`,rs,ss,{cancellation:!0}),ds(`stream`,`SendSideChatRequest`,`SideChatStreamEvent`,is,us,{stream:!0,cancellation:!0}),ds(`cancel`,`ChatRequest`,`CancelResult`,ns,ls),ds(`close`,`ChatRequest`,`CloseResult`,ns,cs)]};function ps(e){let t=e.code,n=t===`bad-request`||t===`gateway/bad-request`;return{code:n?`invalid_request`:`transport_error`,message:e.message||`The Side Chat RPC failed.`,recoverable:!n}}async function ms(e){let t=await e;return t.ok?t.value:{ok:!1,error:ps(t.error)}}async function hs(e){let t=await e.remote.$mount(fs),n=e.get(`remote.sideChat`);return{remote:{create:e=>ms(n.create(e)),selectModel:e=>ms(n.selectModel(e)),stream:e=>n.stream(e),cancel:e=>ms(n.cancel(e)),close:e=>ms(n.close(e))},dispose:t}}let gs={en:{selectModel:`Select model`,menu:`Model and reasoning effort`,model:`Model`,effort:`Effort`,providerDefault:`Default`,loading:`Refreshing model list…`,reload:`Reload`,emptyModels:`No models available.`,emptyEfforts:`This model provides no reasoning effort levels.`,nextReply:`Changes apply to the next reply and future Side Chats.`,aria:(e,t)=>t===void 0?`Select model, current ${e}`:`Select model, current ${e}, reasoning effort ${t}`,operationFailed:e=>`Model operation failed: ${e}`,groupFailed:(e,t)=>`${e} failed to load: ${t}`},"zh-CN":{selectModel:`选择模型`,menu:`模型与推理等级`,model:`模型`,effort:`推理等级`,providerDefault:`Default`,loading:`正在刷新模型列表…`,reload:`重新加载`,emptyModels:`没有可用的模型。`,emptyEfforts:`当前模型未提供推理等级。`,nextReply:`修改将用于下一次回复及之后新开的侧边对话。`,aria:(e,t)=>t===void 0?`选择模型，当前 ${e}`:`选择模型，当前 ${e}，推理等级 ${t}`,operationFailed:e=>`模型操作失败：${e}`,groupFailed:(e,t)=>`${e} 加载失败：${t}`}};function _s(e,t,n){return e?.provider===t&&e.model===n}function vs(e,t){return e.provider===t.provider&&e.model===t.model&&e.reasoningEffort===t.reasoningEffort}function ys(e,t,n){let r=t.find(t=>_s(e,t.group.id,t.model.id));if(r===void 0)return n;let i=r.model.reasoning;return i===void 0?{provider:e.provider,model:e.model}:e.reasoningEffort===void 0||i.efforts.some(t=>t.id===e.reasoningEffort)?e:{provider:e.provider,model:e.model,...i.defaultEffort===void 0?{}:{reasoningEffort:i.defaultEffort}}}function bs({directory:e,selection:t,locked:n,running:o=!1,validateInitialSelection:s=!0,locale:c=`en`,onInitialize:l,onSelect:u}){let d=gs[c],f=(0,r.useSyncExternalStore)(t=>e.store.subscribe(t),()=>e.store.getSnapshot(),()=>e.store.getSnapshot()),[p,m]=(0,r.useState)(!1),[h,g]=(0,r.useState)(`root`),[_,v]=(0,r.useState)(!1),[y,b]=(0,r.useState)(null),x=(0,r.useRef)(null),S=(0,r.useRef)(null),C=(0,r.useRef)([]),w=(0,r.useRef)(!1),T=(0,r.useRef)(0),ee=(0,r.useRef)(0),E=(0,r.useRef)(!1),D=(0,r.useId)(),te=(0,r.useMemo)(()=>f.groups.flatMap(e=>e.models.map(t=>({group:e,model:t}))),[f.groups]),O=t??f.current??void 0,ne=te.find(e=>_s(O,e.group.id,e.model.id)),k=ne?.model.reasoning,A=O?.reasoningEffort??k?.defaultEffort,j=k===void 0?void 0:A===void 0?d.providerDefault:k.efforts.find(e=>e.id===A)?.name??A,re=(0,r.useMemo)(()=>k===void 0?[]:[...k.defaultEffort===void 0?[{key:`provider-default`,effort:void 0,label:d.providerDefault}]:[],...k.efforts.map(e=>({key:`effort:${e.id}`,effort:e.id,label:e.name,...e.description===void 0?{}:{description:e.description}}))],[d.providerDefault,k]),ie=ne?.model.name??O?.model??d.selectModel,ae=j===void 0?ie:`${ie} · ${j}`,M=()=>{e.load().catch(()=>void 0)};(0,r.useEffect)(()=>(w.current=!1,M(),()=>{++T.current}),[e]),(0,r.useEffect)(()=>{n&&m(!1)},[n]),(0,r.useEffect)(()=>{if(w.current||n)return;if(t!==void 0&&!s){w.current=!0;return}if(f.current===null)return;let e={provider:f.current.provider,model:f.current.model,...f.current.reasoningEffort===void 0?{}:{reasoningEffort:f.current.reasoningEffort}};if(t===void 0){w.current=!0,l(e,{remember:!1});return}if(f.status!==`ready`||f.error!==null||f.failures.length>0)return;w.current=!0;let r=ys(t,te,e);vs(t,r)||l(r,{remember:!0})},[te,n,l,t,f.current,f.status,f.error,f.failures,s]),(0,r.useEffect)(()=>{if(!p)return;let e=e=>{x.current?.contains(e.target)||m(!1)};return document.addEventListener(`mousedown`,e),()=>{document.removeEventListener(`mousedown`,e)}},[p]);let oe=()=>{g(`root`),m(!0),M()},se=(e=!1)=>{m(!1),g(`root`),e&&queueMicrotask(()=>{S.current?.focus()})},ce=e=>{let t=C.current.filter(e=>e!==null);if(t.length===0)return;let n=t.findIndex(e=>e===document.activeElement);t[(Math.max(n,0)+e+t.length)%t.length]?.focus()},le=e=>{e.key===`Escape`&&p?(e.preventDefault(),e.stopPropagation(),h===`root`?se(!0):g(`root`)):!p||e.key!==`ArrowDown`&&e.key!==`ArrowUp`||(e.preventDefault(),ce(e.key===`ArrowDown`?1:-1))},ue=e=>{e.relatedTarget instanceof Node&&x.current?.contains(e.relatedTarget)||se()},de=async e=>{if(n||E.current)return;let t=++T.current;E.current=!0,v(!0);try{let n=await u(e);if(t!==T.current)return;if(!n.ok)throw Error(n.error.message);se(!0)}catch(e){if(t!==T.current)return;b({seq:++ee.current,text:d.operationFailed(e instanceof Error?e.message:`Could not select the model.`)})}finally{E.current=!1,t===T.current&&v(!1)}},fe=(e,t)=>{_s(O,e.id,t.id)?se(!0):de({provider:e.id,model:t.id,...t.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:t.reasoning.defaultEffort}})},pe=e=>{O!==void 0&&de({provider:O.provider,model:O.model,...e===void 0?{}:{reasoningEffort:e}})};C.current=[];let me=0,he=()=>{let e=me++;return t=>{C.current[e]=t}};return/* @__PURE__ */ (0,i.jsxs)(`div`,{ref:x,className:`dsh-side-chat-model-root`,"data-side-chat-model-select":``,onKeyDown:le,onBlur:ue,children:[/* @__PURE__ */ (0,i.jsxs)(`button`,{ref:S,type:`button`,className:`dsh-side-chat-model-trigger`,"aria-label":d.aria(ie,j),"aria-haspopup":`menu`,"aria-expanded":p,"aria-controls":p?`${D}-menu`:void 0,title:ae,disabled:n,onClick:()=>{p?se():oe()},children:[/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-trigger-label`,children:ie}),j!==void 0&&/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-trigger-effort`,children:j}),/* @__PURE__ */ (0,i.jsx)(a.IconChevronDownOutlineRegular,{className:`dsh-side-chat-model-chevron${p?` dsh-side-chat-model-chevron-open`:``}`})]}),p&&/* @__PURE__ */ (0,i.jsxs)(`div`,{id:`${D}-menu`,className:`dsh-side-chat-model-menu`,role:`menu`,"aria-label":d.menu,"aria-busy":f.status===`loading`||_,children:[o&&/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-model-status`,children:d.nextReply}),h===`root`&&/* @__PURE__ */ (0,i.jsxs)(i.Fragment,{children:[/* @__PURE__ */ (0,i.jsxs)(`button`,{ref:he(),type:`button`,role:`menuitem`,className:`dsh-side-chat-model-cell`,onClick:()=>{g(`model`)},children:[/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-label`,children:d.model}),/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-value`,children:ie}),/* @__PURE__ */ (0,i.jsx)(a.IconChevronRightOutlineRegular,{className:`dsh-side-chat-model-cell-chevron`})]}),k!==void 0&&/* @__PURE__ */ (0,i.jsxs)(`button`,{ref:he(),type:`button`,role:`menuitem`,className:`dsh-side-chat-model-cell`,onClick:()=>{g(`effort`)},children:[/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-label`,children:d.effort}),/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-value`,children:j}),/* @__PURE__ */ (0,i.jsx)(a.IconChevronRightOutlineRegular,{className:`dsh-side-chat-model-cell-chevron`})]})]}),h===`model`&&/* @__PURE__ */ (0,i.jsxs)(i.Fragment,{children:[f.status===`loading`&&/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-model-status`,children:d.loading}),f.error!==null&&/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-model-error`,role:`alert`,children:[/* @__PURE__ */ (0,i.jsx)(`span`,{children:d.operationFailed(f.error)}),/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-model-retry`,onClick:M,children:d.reload})]}),f.failures.map(e=>/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-model-warning`,children:[/* @__PURE__ */ (0,i.jsx)(`span`,{children:d.groupFailed(e.name,e.message)}),/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-model-retry`,onClick:M,children:d.reload})]},e.id)),/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-model-groups scrollable`,children:f.groups.map(e=>{let t=`${D}-${e.id}`;return/* @__PURE__ */ (0,i.jsxs)(`section`,{role:`group`,"aria-labelledby":t,className:`dsh-side-chat-model-group`,children:[/* @__PURE__ */ (0,i.jsx)(`div`,{id:t,className:`dsh-side-chat-model-group-title`,children:e.name}),e.models.map(t=>{let r=_s(O,e.id,t.id);return/* @__PURE__ */ (0,i.jsxs)(`button`,{ref:he(),type:`button`,role:`menuitemradio`,"aria-checked":r,className:`dsh-side-chat-model-option${r?` dsh-side-chat-model-selected`:``}`,title:t.name,disabled:n||_,onClick:()=>{fe(e,t)},children:[/* @__PURE__ */ (0,i.jsxs)(`span`,{className:`dsh-side-chat-model-option-copy`,children:[/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-name`,children:t.name}),t.description!==void 0&&/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-description`,children:t.description})]}),/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-check`,children:r?/* @__PURE__ */ (0,i.jsx)(a.IconCheckOutlineRegular,{}):null})]},t.id)})]},e.id)})}),f.status===`ready`&&te.length===0&&/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-model-empty`,children:d.emptyModels})]}),h===`effort`&&(re.length===0?/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-model-empty`,children:d.emptyEfforts}):re.map(e=>{let t=A===e.effort;return/* @__PURE__ */ (0,i.jsxs)(`button`,{ref:he(),type:`button`,role:`menuitemradio`,"aria-checked":t,className:`dsh-side-chat-model-option${t?` dsh-side-chat-model-selected`:``}`,disabled:n||_,onClick:()=>{pe(e.effort)},children:[/* @__PURE__ */ (0,i.jsxs)(`span`,{className:`dsh-side-chat-model-option-copy`,children:[/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-name`,children:e.label}),e.description!==void 0&&/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-description`,children:e.description})]}),/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-model-check`,children:t?/* @__PURE__ */ (0,i.jsx)(a.IconCheckOutlineRegular,{}):null})]},e.key)}))]}),y!==null&&/* @__PURE__ */ (0,i.jsx)(a.Toast,{text:y.text,icon:/* @__PURE__ */ (0,i.jsx)(a.IconWarningOutlineRegular,{}),anchor:x.current?.closest(`[data-composer-card]`)??null,onDone:()=>{b(null)}},y.seq)]})}function xs(){return/* @__PURE__ */ (0,i.jsx)(`svg`,{viewBox:`0 0 16 16`,width:`16`,height:`16`,"aria-hidden":`true`,children:/* @__PURE__ */ (0,i.jsx)(`path`,{d:`M8.3125 0.980183C8.66767 1.0531 8.97902 1.20418 9.2627 1.43233C9.48724 1.61297 9.73029 1.85793 9.97949 2.10714L14.707 6.83468L13.293 8.24874L9 3.95577V15.0417H7V3.95577L2.70703 8.24874L1.29297 6.83468L6.02051 2.10714C6.26971 1.85793 6.51277 1.61297 6.7373 1.43233C6.97662 1.23986 7.28445 1.04402 7.6875 0.980183C7.8973 0.947006 8.1031 0.95516 8.3125 0.980183Z`,fill:`currentColor`})})}function Ss({children:e}){return/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-body`,children:e})}function Cs({error:e,messages:t,onRetry:n}){return/* @__PURE__ */ (0,i.jsxs)(`section`,{className:`dsh-side-chat-error`,role:`alert`,children:[/* @__PURE__ */ (0,i.jsx)(`strong`,{children:e.operation===`close`?t.closeError:t.genericError}),/* @__PURE__ */ (0,i.jsx)(`p`,{children:e.message}),e.recoverable&&/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,onClick:n,children:t.retry})]})}function ws(){return/* @__PURE__ */ (0,i.jsxs)(`svg`,{className:`dsh-side-chat-add-to-conversation-icon`,viewBox:`0 0 20 20`,"aria-hidden":`true`,children:[/* @__PURE__ */ (0,i.jsx)(`path`,{d:`M4.25 4.5h11.5v8.25H9l-3.5 2.75v-2.75H4.25z`}),/* @__PURE__ */ (0,i.jsx)(`path`,{d:`M10 6.5v4M8 8.5h4`})]})}function Ts({phase:e,messages:t,addToConversationDisabled:n=!1,onAddToConversation:r,onFocusParent:a,onClose:o}){return/* @__PURE__ */ (0,i.jsxs)(`header`,{className:`dsh-side-chat-header`,children:[/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-heading`,onClick:a,children:/* @__PURE__ */ (0,i.jsx)(`strong`,{children:t.title})}),/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-header-actions`,children:[r!==void 0&&/* @__PURE__ */ (0,i.jsxs)(`button`,{type:`button`,className:`dsh-side-chat-add-to-conversation`,disabled:n,onClick:r,children:[/* @__PURE__ */ (0,i.jsx)(ws,{}),/* @__PURE__ */ (0,i.jsx)(`span`,{children:t.addToConversation})]}),/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-close`,"aria-label":t.close,disabled:e===`closing`,onClick:o,children:`×`})]})]})}function Es(e){let t=(0,r.useRef)(null);return(0,r.useLayoutEffect)(()=>{let e=t.current;if(e===null)return;e.style.height=`auto`;let n=Number.parseFloat(getComputedStyle(e).maxHeight),r=Number.isFinite(n)?Math.min(e.scrollHeight,n):e.scrollHeight;e.style.height=`${String(r)}px`,e.style.overflowY=Number.isFinite(n)&&e.scrollHeight>n?`auto`:`hidden`},[e]),t}function Ds({state:e,locale:t=`en`,embeddedConversation:n,modelControl:a,onDraftChange:o,onFirstSend:s,onClose:c,onRetry:l,onFocusParent:u,onAddToConversation:d,addToConversationDisabled:f,onRemoveSelection:p}){let m=A[t],[h,g]=(0,r.useState)(!1),_=Es(e.draft),v=async t=>{if(t.preventDefault(),!(h||[`creating`,`running`,`closing`].includes(e.phase))){g(!0);try{await s(e.draft)}finally{g(!1)}}};return/* @__PURE__ */ (0,i.jsxs)(`aside`,{className:`dsh-side-chat-panel`,"data-side-chat-panel":``,"aria-label":m.title,"aria-busy":[`creating`,`closing`].includes(e.phase)||void 0,onKeyDown:e=>{e.key===`Escape`&&!e.defaultPrevented&&!e.nativeEvent.isComposing&&(e.preventDefault(),e.stopPropagation(),c())},children:[/* @__PURE__ */ (0,i.jsx)(Ts,{phase:e.phase,messages:m,...d===void 0?{}:{onAddToConversation:d},...f===void 0?{}:{addToConversationDisabled:f},onFocusParent:u,onClose:()=>{c()}}),e.error!==void 0&&/* @__PURE__ */ (0,i.jsx)(Cs,{error:e.error,messages:m,onRetry:()=>{l()}}),e.messages.length>0&&n!==void 0?/* @__PURE__ */ (0,i.jsx)(Ss,{children:n}):/* @__PURE__ */ (0,i.jsxs)(`form`,{className:`dsh-side-chat-draft`,"data-composer-card":``,onSubmit:e=>{v(e)},children:[e.selection!==void 0&&/* @__PURE__ */ (0,i.jsx)(j,{selections:[e.selection],messages:m,...p===void 0?{}:{onRemove:p}}),/* @__PURE__ */ (0,i.jsx)(`label`,{htmlFor:`dsh-side-chat-draft-input`,children:m.placeholder}),/* @__PURE__ */ (0,i.jsx)(`textarea`,{id:`dsh-side-chat-draft-input`,ref:_,autoFocus:!0,rows:1,value:e.draft,disabled:[`creating`,`running`,`closing`].includes(e.phase),placeholder:m.placeholder,onChange:e=>{o(e.target.value)},onKeyDown:e=>{e.key===`Enter`&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.keyCode!==229&&(e.preventDefault(),e.currentTarget.form?.requestSubmit())}}),/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-draft-actions`,children:[a,/* @__PURE__ */ (0,i.jsx)(`button`,{type:`submit`,className:`dsh-side-chat-send-button`,"aria-label":m.send,disabled:h||[`creating`,`running`,`closing`].includes(e.phase)||e.draft.trim().length===0,children:/* @__PURE__ */ (0,i.jsx)(xs,{})})]})]}),/* @__PURE__ */ (0,i.jsxs)(`footer`,{className:`dsh-side-chat-footer`,children:[/* @__PURE__ */ (0,i.jsx)(`span`,{children:m.temporary}),/* @__PURE__ */ (0,i.jsx)(`span`,{children:m.referenceOnly}),/* @__PURE__ */ (0,i.jsx)(`span`,{children:m.cannotReopen}),/* @__PURE__ */ (0,i.jsx)(`span`,{children:m.readOnly})]}),/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-announcer`,"aria-live":`polite`,children:e.phase===`running`?`Side Chat running`:`Side Chat ${e.phase}`})]})}function Os(e){return(e.nodeType===Node.ELEMENT_NODE?e:e.parentElement)?.closest(`[data-chat-anchor-key]`)??null}function ks(e,t){let n=e.parentElement;return n===null||!t.contains(n)||n.closest(`[data-selection-exclude],[data-side-chat-panel],[aria-hidden="true"],[hidden],[inert],script,style,button,textarea,input,[role="button"]`)!==null}function As(e,t){let n=[],r=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),i=r.nextNode();for(;i!==null;){let a=i;!ks(a,t)&&Os(a)===e&&n.push(a),i=r.nextNode()}return n}function js(e,t){if(!e.intersectsNode(t))return;let n=e.startContainer===t?e.startOffset:0,r=e.endContainer===t?e.endOffset:t.data.length;if(n>0&&/[\uDC00-\uDFFF]/u.test(t.data[n]??``)&&/[\uD800-\uDBFF]/u.test(t.data[n-1]??``)&&--n,r>0&&r<t.data.length&&/[\uD800-\uDBFF]/u.test(t.data[r-1]??``)&&/[\uDC00-\uDFFF]/u.test(t.data[r]??``)&&(r+=1),!(r<=n))return{start:n,end:r,text:t.data.slice(n,r)}}async function Ms(e){let t=e.selection?.rangeCount===1?e.selection.getRangeAt(0):void 0;if(t===void 0||t.collapsed)throw new N(`selection_empty`,`Select some conversation text first.`);if(!e.conversationRoot.contains(t.startContainer)||!e.conversationRoot.contains(t.endContainer))throw new N(`selection_outside_conversation`,`The selection must stay inside the current conversation.`);let n=Os(t.startContainer),r=Os(t.endContainer);if(n===null||r===null||n!==r)throw new N(`selection_crosses_unsupported_nodes`,`Select a passage inside one message.`);let i=e.resolver.resolve(n);if(i===void 0)throw new N(`selection_stale`,`The selected message is no longer in the Session snapshot.`);let a=As(n,e.conversationRoot),o=[],s,c,l=0;for(let e of a){let n=js(t,e);n!==void 0&&(s??=l+n.start,c=l+n.end,o.push(n.text)),l+=e.data.length}if(s===void 0||c===void 0)throw new N(`selection_not_model_visible`,`The selection contains no supported visible text.`);let u=t.getBoundingClientRect();return await Ee({parentSessionId:e.parentSessionId,fragments:[{...i,startOffset:s,endOffset:c,text:o.join(``)}],rawText:o.join(``),rect:{x:u.x,y:u.y,width:u.width,height:u.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}})}function Ns(e,t){return[...e.querySelectorAll(`[data-chat-anchor-key]`)].find(e=>e.dataset.chatAnchorKey===t)}function Ps(e,t){let n=Ns(e,t.nodeKey);if(n===void 0)return;let r=As(n,e),i=r.map(e=>e.data).join(``);if(!Number.isSafeInteger(t.startOffset)||!Number.isSafeInteger(t.endOffset)||t.startOffset<0||t.endOffset<=t.startOffset||t.endOffset>i.length||i.slice(t.startOffset,t.endOffset)!==t.text)return;let a=[],o=0;for(let e of r){let n=o+e.data.length,r=Math.max(t.startOffset,o)-o,i=Math.min(t.endOffset,n)-o;if(i>r){let t=document.createRange();t.setStart(e,r),t.setEnd(e,i),a.push(t)}if(o=n,o>=t.endOffset)break}return a.length===0?void 0:a}function Fs(e){let t=[];for(let n of e.selection.fragments){let r=Ps(e.conversationRoot,n);if(r===void 0)return;t.push(...r)}let n=t[0],r=t.at(-1);if(n===void 0||r===void 0)return;let i=document.createRange();return i.setStart(n.startContainer,n.startOffset),i.setEnd(r.endContainer,r.endOffset),{ranges:t,browserRange:i}}function Is(e){return[...document.querySelectorAll(`[data-conversation-session]`)].find(t=>t.dataset.conversationSession===e&&t.closest(`[data-side-chat-panel], [hidden], [aria-hidden="true"]`)===null)}function Ls(e){return Is(e)?.querySelector(`[data-chat-flow]`)??void 0}function Rs(e){window.requestAnimationFrame(()=>{let t=Is(e)?.querySelector(`[data-composer-seat] textarea, [data-composer-seat] [role="textbox"], [data-composer-seat] [contenteditable="true"]`);t!=null&&(t.focus(),t instanceof HTMLTextAreaElement&&t.setSelectionRange(t.value.length,t.value.length))})}let zs=`dsh-side-chat-annotations`,Bs=`dsh-side-chat-active-annotation`;function Vs(e,t,n){return Math.min(Math.max(t,e),Math.max(t,n))}function Hs(e){let t=Number.isFinite(e.left)?e.left:e.x,n=Number.isFinite(e.top)?e.top:e.y,r=Number.isFinite(e.right)?e.right:t+e.width,i=Number.isFinite(e.bottom)?e.bottom:n+e.height;return[t,n,r,i].every(Number.isFinite)?{left:t,top:n,right:r,bottom:i}:void 0}function Us(e){let t=[];for(let n of e){let e=typeof n.getClientRects==`function`?[...n.getClientRects()]:[],r=e.length>0?e:typeof n.getBoundingClientRect==`function`?[n.getBoundingClientRect()]:[];for(let e of r){let n=Hs(e);n!==void 0&&(n.right>n.left||n.bottom>n.top)&&t.push(n)}}if(t.length!==0)return{left:Math.min(...t.map(e=>e.left)),top:Math.min(...t.map(e=>e.top)),right:Math.max(...t.map(e=>e.right)),bottom:Math.max(...t.map(e=>e.bottom))}}function Ws(e){return{x:e.left,y:e.top,width:e.right-e.left,height:e.bottom-e.top,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}}function Gs(e){let t={left:0,top:0,right:window.innerWidth,bottom:window.innerHeight},n=e.startContainer,r=(n.nodeType===Node.ELEMENT_NODE?n:n.parentElement)?.closest(`[data-conversation-scroll]`);if(r==null)return t;let i=Hs(r.getBoundingClientRect());i!==void 0&&i.right>i.left&&i.bottom>i.top&&(t={left:Math.max(t.left,i.left),top:Math.max(t.top,i.top),right:Math.min(t.right,i.right),bottom:Math.min(t.bottom,i.bottom)});let a=r.querySelector(`[data-composer-seat]`),o=a===null?void 0:Hs(a.getBoundingClientRect());return o!==void 0&&o.right>o.left&&o.bottom>o.top&&o.bottom>t.top&&o.top<t.bottom&&(t={...t,bottom:Math.min(t.bottom,o.top)}),t}function Ks(e,t){return e.right>t.left&&e.bottom>t.top&&e.left<t.right&&e.top<t.bottom}function qs(e,t){return e.length===t.length&&e.every((e,n)=>{let r=t[n];return r!==void 0&&r.annotationIndex===e.annotationIndex&&r.left===e.left&&r.top===e.top})}function Js(){typeof CSS<`u`&&CSS.highlights!==void 0&&(CSS.highlights.delete(zs),CSS.highlights.delete(Bs))}function Ys(e,t){if(typeof CSS>`u`||CSS.highlights===void 0||typeof Highlight>`u`)return;if(CSS.highlights.set(zs,new Highlight(...e)),t.length===0){CSS.highlights.delete(Bs);return}let n=new Highlight(...t);n.priority=1,CSS.highlights.set(Bs,n)}function Xs(e){let t=window.getSelection();t!==null&&(t.removeAllRanges(),t.addRange(e))}function Zs({annotations:e,activeAnnotationIndex:t,onEdit:n}){let a=(0,r.useRef)(/* @__PURE__ */ new Map),[o,s]=(0,r.useState)([]);return(0,r.useEffect)(()=>{if(e.length===0){a.current.clear(),s(e=>e.length===0?e:[]),Js();return}let n,r=null,i,o=()=>{n=void 0;let o=e[0]?.selection.parentSessionId,c=o===void 0?null:Ls(o)??null;c!==r&&(i?.disconnect(),r=c,c!==null&&i?.observe(c));let l=/* @__PURE__ */ new Map,u=[],d=[],f=[];if(c!==null)for(let n of e){if(n.selection.parentSessionId!==o)continue;let e=Fs({selection:n.selection,conversationRoot:c});if(e===void 0)continue;d.push(...e.ranges),n.annotationIndex===t&&f.push(...e.ranges);let r=Us(e.ranges),i=Gs(e.browserRange);if(r===void 0||!Ks(r,i))continue;let a=Ws(r);l.set(n.annotationIndex,{browserRange:e.browserRange,rect:a}),u.push({annotationIndex:n.annotationIndex,left:Vs(r.right+3,i.left+4,i.right-26),top:Vs(r.top-12,i.top+4,i.bottom-26)})}a.current=l,s(e=>qs(e,u)?e:u),Ys(d,f)},c=()=>{n===void 0&&(n=window.requestAnimationFrame(o))};i=typeof ResizeObserver>`u`?void 0:new ResizeObserver(c),o();let l=new MutationObserver(c);return l.observe(document.body,{childList:!0,characterData:!0,subtree:!0}),document.addEventListener(`scroll`,c,!0),window.addEventListener(`resize`,c),()=>{n!==void 0&&window.cancelAnimationFrame(n),l?.disconnect(),i?.disconnect(),document.removeEventListener(`scroll`,c,!0),window.removeEventListener(`resize`,c),Js()}},[t,e]),o.map(r=>{let o=e.find(e=>e.annotationIndex===r.annotationIndex);if(o===void 0)return null;let s={left:r.left,top:r.top},c=o.annotationIndex+1,l=c>99?`99+`:String(c);return/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-annotation-marker`,style:s,"data-active":o.annotationIndex===t||void 0,"data-large":c>99||void 0,"aria-label":`Edit annotation ${String(c)}`,title:`Edit annotation ${String(c)}`,onMouseDown:e=>{e.preventDefault(),e.stopPropagation()},onClick:()=>{let e=a.current.get(o.annotationIndex);e!==void 0&&(Xs(e.browserRange),n(o,{...o.selection,rect:e.rect}),window.requestAnimationFrame(()=>{Xs(e.browserRange)}))},children:l},`${o.selection.parentSessionId}:${o.selection.fragments[0]?.nodeKey??``}:${String(o.annotationIndex)}`)})}function Qs(e,t,n){return Math.min(Math.max(t,e),Math.max(t,n))}function $s(e,t,n,r={width:e.viewportWidth,height:e.viewportHeight}){let i=Math.max(0,t.width),a=Math.max(0,t.height),o=r.offsetLeft??0,s=r.offsetTop??0,c=o+r.width,l=s+r.height,u=Qs(e.x+e.width/2-i/2,o+8,c-i-8),d=n?12:8,f=n?64:8,p=e.y+e.height+d,m=e.y-a-f,h=p+a<=l-8,g=m>=s+8,_;return _=h?p:g||e.y-f-s-8>=l-8-e.y-e.height-d?m:p,{left:u,top:Qs(_,s+8,l-a-8)}}function ec({selection:e,touchInteraction:t=!1,askDisabledReason:n,annotationNumber:a=1,annotationEditor:o,onAddToChat:s,onMoreDetails:c,onAskInSideChat:l,onAnnotationEditorChange:u,onRemoveAnnotation:d,onDismiss:f}){let[p,m]=(0,r.useState)(o!==void 0),[h,g]=(0,r.useState)(o?.initialComment??``),[_,v]=(0,r.useState)(()=>({width:0,height:0})),[y,b]=(0,r.useState)(()=>({width:e.rect.viewportWidth,height:e.rect.viewportHeight,offsetLeft:0,offsetTop:0})),x=(0,r.useRef)(null),S=(0,r.useRef)(null),C=(0,r.useRef)(null),w=$s(e.rect,_,t,y),T={left:w.left,top:w.top},ee=y.offsetLeft,E=y.offsetTop,D=ee+y.width,te=E+y.height,O=Math.max(0,Math.min(420,y.width-16)),ne=e.rect.y-118,k=e.rect.y+e.rect.height+12,A={left:Qs(e.rect.x+e.rect.width+28,ee+8,D-O-8),top:Qs(ne>=E+8?ne:k,E+8,te-118-8),width:O},j={left:Qs(e.rect.x+e.rect.width+3,ee+4,D-22-4),top:Qs(e.rect.y-12,E+4,te-22-4)},re=a>99?`99+`:String(a),ie=e=>{e.preventDefault()};(0,r.useLayoutEffect)(()=>{let t=window.visualViewport,n=()=>{let n={width:t?.width??window.innerWidth??e.rect.viewportWidth,height:t?.height??window.innerHeight??e.rect.viewportHeight,offsetLeft:t?.offsetLeft??0,offsetTop:t?.offsetTop??0};b(e=>e.width===n.width&&e.height===n.height&&e.offsetLeft===n.offsetLeft&&e.offsetTop===n.offsetTop?e:n);let r=S.current;if(r===null)return;let i=r.getBoundingClientRect(),a={width:i.width,height:i.height};v(e=>e.width===a.width&&e.height===a.height?e:a)};n();let r=S.current,i=typeof ResizeObserver>`u`?void 0:new ResizeObserver(n);return r!==null&&i?.observe(r),window.addEventListener(`resize`,n),t?.addEventListener(`resize`,n),t?.addEventListener(`scroll`,n),()=>{i?.disconnect(),window.removeEventListener(`resize`,n),t?.removeEventListener(`resize`,n),t?.removeEventListener(`scroll`,n)}},[p,e,t]),(0,r.useEffect)(()=>{p&&x.current?.focus()},[p]);let ae=()=>{m(!1),g(``),u?.(!1),f()},M=()=>{let t=h.trim();s(e,t.length===0?void 0:t),u?.(!1),f()},oe=e=>{e.preventDefault(),M()},se=e=>{e.key===`Escape`?(e.preventDefault(),e.stopPropagation(),ae()):e.key===`Enter`&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.keyCode!==229&&(e.preventDefault(),M())},ce=()=>{m(!0),u?.(!0)},le=()=>{c(e),f()},ue=()=>{l(e),f()},de=(e,n)=>{t&&e.pointerType===`touch`&&!e.currentTarget.disabled&&(e.preventDefault(),C.current={target:e.currentTarget,timeStamp:e.timeStamp},n())},fe=(e,t)=>{let n=C.current;C.current=null;let r=n===null?1/0:e.timeStamp-n.timeStamp;e.detail!==0&&n?.target===e.currentTarget&&r>=0&&r<1e3?e.preventDefault():t()};return p?/* @__PURE__ */ (0,i.jsxs)(i.Fragment,{children:[o===void 0&&/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-selection-marker`,"aria-hidden":`true`,"data-large":a>99||void 0,style:j,children:re}),/* @__PURE__ */ (0,i.jsxs)(`form`,{className:`dsh-side-chat-selection-comment`,role:`dialog`,"aria-label":o?.dialogLabel??`Add annotation comment`,style:A,onSubmit:oe,onMouseDown:e=>{e.stopPropagation()},onKeyUp:e=>{e.stopPropagation()},children:[/* @__PURE__ */ (0,i.jsx)(`textarea`,{ref:x,value:h,rows:2,"aria-label":`Optional annotation comment`,placeholder:`Add an optional comment…`,onChange:e=>{g(e.currentTarget.value)},onKeyDown:se}),/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-selection-comment-actions`,children:[o!==void 0&&d!==void 0&&/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,onClick:d,children:`Remove`}),/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,onClick:ae,children:`Cancel`}),/* @__PURE__ */ (0,i.jsx)(`button`,{type:`submit`,className:`dsh-side-chat-selection-comment-save`,children:`Save`})]})]})]}):/* @__PURE__ */ (0,i.jsxs)(`div`,{ref:S,className:`dsh-side-chat-selection-actions`,role:`toolbar`,"aria-label":`Selected conversation text actions`,"data-touch":t||void 0,style:T,onMouseDown:ie,onPointerDown:e=>{t&&e.pointerType===`touch`&&e.preventDefault()},onKeyDown:e=>{e.key===`Escape`&&f()},children:[/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,onPointerDown:e=>{de(e,ce)},onClick:e=>{fe(e,ce)},children:`Add to chat`}),/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,disabled:n!==void 0,title:n,onPointerDown:e=>{de(e,le)},onClick:e=>{fe(e,le)},children:`More details`}),/* @__PURE__ */ (0,i.jsx)(`button`,{type:`button`,disabled:n!==void 0,title:n,onPointerDown:e=>{de(e,ue)},onClick:e=>{fe(e,ue)},children:`Ask in side chat`})]})}function tc(){return/* @__PURE__ */ (0,i.jsx)(`svg`,{viewBox:`0 0 16 16`,width:`16`,height:`16`,"aria-hidden":`true`,children:/* @__PURE__ */ (0,i.jsx)(`rect`,{x:`3`,y:`3`,width:`10`,height:`10`,rx:`3`,fill:`currentColor`})})}let nc={code:{copyLabel:`Copy`,copiedLabel:`Copied`},footnotes:`Footnotes`};function rc({text:e,running:t}){let[n,o]=(0,r.useState)(!1),s=e.trimEnd().split(`
`);return/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-reasoning`,"data-variant":`think`,"data-state":t?`running`:`ok`,children:/* @__PURE__ */ (0,i.jsx)(a.DisclosureRow,{rowClassName:`dsh-side-chat-reasoning-row`,leadingClassName:`dsh-side-chat-reasoning-leading`,titleClassName:`dsh-side-chat-reasoning-title`,chevronClassName:`dsh-side-chat-reasoning-chevron`,icon:/* @__PURE__ */ (0,i.jsx)(a.IconThinkOutlineRegular,{size:14}),title:`Think`,open:n,expandable:!0,expandOnRowClick:!0,onToggle:()=>{o(e=>!e)},collapsedContent:/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-reasoning-summary`,children:t?s.at(-1):s[0]}),children:/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-reasoning-body`,children:e})})})}function ic({message:e,locale:t}){let n=/* @__PURE__ */ (0,i.jsxs)(`article`,{className:`dsh-side-chat-message`,"data-role":e.role,children:[/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-message-role`,children:e.role===`user`?`You`:`Assistant`}),e.role===`user`?/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-message-text`,children:e.text}):/* @__PURE__ */ (0,i.jsxs)(i.Fragment,{children:[e.reasoning&&/* @__PURE__ */ (0,i.jsx)(rc,{text:e.reasoning,running:e.status===`streaming`}),/* @__PURE__ */ (0,i.jsx)(a.MarkdownText,{text:e.text,streaming:e.status===`streaming`,labels:nc}),e.status===`streaming`&&e.text===``&&!e.reasoning&&/* @__PURE__ */ (0,i.jsx)(`span`,{children:`Thinking…`}),e.status===`stopped`&&/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-message-note`,children:`Stopped`}),e.status===`error`&&/* @__PURE__ */ (0,i.jsx)(`span`,{className:`dsh-side-chat-message-note`,children:`Reply failed`})]})]});return e.selectedText===void 0?n:/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-annotated-user-message`,children:[/* @__PURE__ */ (0,i.jsx)(j,{selections:[{text:e.selectedText}],messages:A[t]}),n]})}function ac({state:e,controller:t,modelControl:n,locale:a=`en`}){let[o,s]=(0,r.useState)(``),[c,l]=(0,r.useState)(!1),[u,d]=(0,r.useState)(!1),[f,p]=(0,r.useState)(),m=(0,r.useRef)(!1),h=(0,r.useRef)(!1),g=(0,r.useRef)(0),_=(0,r.useRef)(!0),v=(0,r.useRef)(null),y=Es(o),b=e.phase===`running`,x=b||u,S=[`ready`,`running`].includes(e.phase);(0,r.useEffect)(()=>{let e=v.current;e!==null&&_.current&&(e.scrollTop=e.scrollHeight)},[e.messages]);let C=async e=>{if(e.preventDefault(),o.trim().length===0||!S||b||m.current||h.current)return;let n=g.current;m.current=!0,l(!0),p(void 0);try{let e=await t.send(o);e.ok&&n===g.current?s(``):!e.ok&&t.getSnapshot().error?.message!==e.error.message&&p(e.error.message)}catch{p(`The message could not be sent. Your draft has been kept.`)}finally{m.current=!1,l(!1)}},w=async()=>{if(!h.current){h.current=!0,d(!0),p(void 0);try{let e=await t.cancel();e.ok||p(e.error.message)}catch{p(`The request could not be stopped. Try closing Side Chat.`)}finally{h.current=!1,d(!1)}}};return/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-conversation`,children:[/* @__PURE__ */ (0,i.jsxs)(`div`,{ref:v,className:`dsh-side-chat-transcript`,"aria-live":`polite`,onScroll:e=>{let t=e.currentTarget;_.current=t.scrollHeight-t.scrollTop-t.clientHeight<48},children:[e.messages.map(e=>/* @__PURE__ */ (0,i.jsx)(ic,{message:e,locale:a},e.id)),f!==void 0&&/* @__PURE__ */ (0,i.jsx)(`div`,{className:`dsh-side-chat-turn-notice`,role:`alert`,children:f})]}),/* @__PURE__ */ (0,i.jsxs)(`form`,{className:`dsh-side-chat-composer`,"data-composer-card":``,onSubmit:e=>{C(e)},children:[/* @__PURE__ */ (0,i.jsx)(`textarea`,{ref:y,rows:1,value:o,disabled:!S,placeholder:`Reply in Side Chat`,onChange:e=>{++g.current,s(e.target.value)},onKeyDown:e=>{e.key===`Enter`&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.keyCode!==229&&(e.preventDefault(),e.currentTarget.form?.requestSubmit())}}),/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-composer-actions`,children:[n,/* @__PURE__ */ (0,i.jsx)(`button`,{type:x?`button`:`submit`,className:x?`dsh-side-chat-stop-button`:`dsh-side-chat-send-button`,"aria-label":x?`Stop generating`:`Send`,"aria-busy":u||c||void 0,disabled:!S||(x?u:c||o.trim().length===0),onClick:e=>{x&&(e.preventDefault(),w())},children:x?/* @__PURE__ */ (0,i.jsx)(tc,{}):/* @__PURE__ */ (0,i.jsx)(xs,{})})]})]})]})}function oc(){try{return typeof window>`u`?void 0:window.sessionStorage}catch{return}}function sc(e){return e.occurrences.some(e=>e.source===`dsh-side-chat-selection`||e.source===`dsh-side-chat-conversation`)}function cc(e,t){if(!Array.isArray(t)||t.length===0)return!1;let n=0;return t.every(t=>{if(typeof t!=`object`||!t)return!1;let r=t;return!Number.isSafeInteger(r.offset)||!Number.isSafeInteger(r.length)||r.offset<n||r.length<0||r.offset+r.length>e.length||typeof r.source!=`string`||typeof r.ref!=`string`||typeof r.label!=`string`||typeof r.clipboardText!=`string`||e.slice(r.offset,r.offset+r.length)!==r.clipboardText||r.appearance!==void 0&&![`session`,`file`,`folder`].includes(r.appearance)?!1:(n=r.offset+r.length,!0)})}var lc=class{storage;observedInputs=/* @__PURE__ */ new WeakSet;reconciling=!1;constructor(e=oc()){this.storage=e}reconcile(e,t){if(this.reconciling||this.storage===void 0)return;this.reconciling=!0;let n=`dsh-side-chat:composer-references:`+encodeURIComponent(e);try{let e=t.state.getSnapshot();if(sc(e)){this.observedInputs.add(t),this.storage.setItem(n,JSON.stringify({version:1,draft:e.draft,occurrences:e.occurrences}));return}if(this.observedInputs.has(t)){this.storage.removeItem(n);return}let r=this.storage.getItem(n);if(r===null)return;let i=JSON.parse(r);if(i===null||i.version!==1||typeof i.draft!=`string`||!cc(i.draft,i.occurrences)){this.storage.removeItem(n);return}if(e.draft===``)return;if(e.draft!==i.draft||e.occurrences.length!==0){this.storage.removeItem(n);return}if(e.phase!==void 0&&e.phase!==`plain`)return;this.restore(t,i)&&this.observedInputs.add(t)}catch{}finally{this.reconciling=!1}}restore(e,t){let n,r=!1;try{for(let r of[...t.occurrences].reverse()){let i=e.state.getSnapshot();if(i.draft!==t.draft||!e.insertReference({source:r.source,ref:r.ref,label:r.label,clipboardText:r.clipboardText,...r.appearance===void 0?{}:{appearance:r.appearance}},{start:r.offset,end:r.offset+r.length,draftRev:i.draftRev}))return!1;let a=e.state.getSnapshot(),o=t.draft[r.offset+r.length]!==` `,s=o?t.draft.slice(0,r.offset+r.length)+` `+t.draft.slice(r.offset+r.length):t.draft;if(a.draft!==s)return!1;if(n=a,o){if(!e.replaceText(``,{start:r.offset+1,end:r.offset+2,draftRev:a.draftRev}))return!1;let i=e.state.getSnapshot();if(i.draft!==t.draft)return!1;n=i}}return r=!0,!0}finally{let i=e.state.getSnapshot();if(!r&&n===i){let n=i.draft.length-i.occurrences.reduce((e,t)=>e+t.length-1,0);e.replaceText(t.draft,{start:0,end:n,draftRev:i.draftRev})}}}};let uc=`dsh-side-chat:model-preference:v1`;function dc(){if(typeof window<`u`)try{return window.localStorage}catch{return}}function fc(e){if(typeof e!=`object`||!e)return;let t=e;if(typeof t.provider==`string`&&t.provider!==``&&typeof t.model==`string`&&t.model!==``&&(t.reasoningEffort===void 0||typeof t.reasoningEffort==`string`&&t.reasoningEffort!==``))return{provider:t.provider,model:t.model,...t.reasoningEffort===void 0?{}:{reasoningEffort:t.reasoningEffort}}}var pc=class{storage;constructor(e=dc()){this.storage=e}get(){if(this.storage!==void 0)try{let e=this.storage.getItem(uc);if(e===null)return;let t=JSON.parse(e);return t.version===1?fc(t.selection):void 0}catch{return}}set(e){if(this.storage===void 0)return;let t={version:1,selection:{...e}};try{this.storage.setItem(uc,JSON.stringify(t))}catch{}}};let mc={turnEnds:/* @__PURE__ */ new Map,chatNodes:{get:()=>void 0}};var hc=class{chat;source;snapshot=mc;constructor(e){this.chat=e}subscribe=e=>this.chat.subscribe(e);getSnapshot=()=>{let e=this.chat.getSnapshot();return e!==this.source&&(this.source=e,this.snapshot=e===void 0?mc:{turnEnds:e.legacy.turnEnds,chatNodes:e.nodes}),this.snapshot}};function $(e){return e}function gc(e){return e.kind===`turn`?e.turn.status===`closed`:e.kind===`step`&&e.turn.status===`closed`&&e.step.status===`closed`}var _c=class{ctx;faces=/* @__PURE__ */ new WeakMap;parentInputs=/* @__PURE__ */ new WeakMap;annotationPersistence=new lc;modelPreferences=new pc;constructor(e){this.ctx=e}subscribeList=e=>this.ctx.sessions.list.subscribe(e);subscribeConversationInput=e=>{let t,n=()=>{},r=()=>{let r=this.currentParentInput();r!==t&&(n(),t=r,n=t?.state.subscribe(e)??(()=>{}))};r();let i=this.ctx.sessions.list.subscribe(()=>{r(),e()});return()=>{i(),n()}};currentConversationInputSnapshot=()=>this.currentParentInput()?.state.getSnapshot();currentSessionId(){let e=Object.entries(this.ctx.sessions.list.getSnapshot().byId).find(([,e])=>(e.retainedBy.mainView??0)>0)?.[0];return e===void 0?void 0:k(e)}lastCompletedSeq(e){let t=this.face(e)?.getSnapshot(),n;for(let e of t?.turnEnds.values()??[])(n===void 0||e>n)&&(n=e);return n}selectionIsCurrent(e){let t=this.face(e.parentSessionId)?.getSnapshot();return t!==void 0&&e.fragments.every(e=>{let n=t.chatNodes.get(e.nodeKey);return n!==void 0&&n.visibility===`visible`&&n.kind===e.nodeKind&&n.anchorSeq===e.seq&&gc(n.location)})}addSelectionToConversation(e,t){if(this.currentSessionId()!==e.parentSessionId)return!1;let n=this.currentParentInput();return n===void 0||!C(n,e,t)?!1:(this.annotationPersistence.reconcile(e.parentSessionId,n),!0)}addSideChatToConversation(e,t){let n=this.ctx.sessions.scope($(e)),r=n===void 0?void 0:this.parentInput(n);return r===void 0||!fe(r,t)?!1:(this.annotationPersistence.reconcile(e,r),!0)}removeConversationAnnotation(e){let t=this.currentSessionId(),n=this.currentParentInput();return t===void 0||n===void 0||!T(n,e)?!1:(this.annotationPersistence.reconcile(t,n),!0)}updateConversationAnnotation(e,t){let n=this.currentSessionId(),r=this.currentParentInput();return n===void 0||r===void 0||!ee(r,e,t)?!1:(this.annotationPersistence.reconcile(n,r),!0)}reconcileConversationAnnotationPersistence(){let e=this.currentSessionId(),t=this.currentParentInput();e!==void 0&&t!==void 0&&this.annotationPersistence.reconcile(e,t)}nextConversationAnnotationNumber(){let e=this.currentConversationInputSnapshot();return e===void 0?1:b(e).length+1}removeConversationAnnotations(e=this.currentSessionId()){let t=e===void 0?void 0:this.ctx.sessions.scope($(e)),n=t===void 0?void 0:this.parentInput(t);return e===void 0||n===void 0||!w(n)?!1:(this.annotationPersistence.reconcile(e,n),!0)}retainParent(e){let t=this.ctx.sessions.retain($(e),{source:`sideChat`}),n=!0;return t.ready.catch(()=>{n&&this.notify({kind:`warning`,text:`The parent conversation could not be loaded.`})}),()=>{n=!1,t.release()}}async openSession(e){this.ctx.uiWorkspace.openSession($(e))}notify(e){console[e.kind===`warning`?`warn`:`info`](`[dsh-side-chat] ${e.text}`),this.currentParentInput()?.notify?.(e.kind===`warning`?`error`:`info`,e.text)}face(e){let t=this.ctx.sessions.binding($(e))?.session;if(t===void 0)return;let n=this.faces.get(t);if(n!==void 0)return n;let r=this.ctx.uiConversation.binding(t.sessionId);r.activate(`chat`);let i=new hc(r.target(`chat`));return this.faces.set(t,i),i}title(e){return this.ctx.sessions.list.getSnapshot().byId[$(e)]?.displayTitle}modelDirectory(e){try{return this.ctx.modelDirectories.directoryFor($(e))}catch{return}}sideChatModelPreference(){return this.modelPreferences.get()}rememberSideChatModelPreference(e){this.modelPreferences.set(e)}currentParentInput(){let e=this.currentSessionId(),t=e===void 0?void 0:this.ctx.sessions.scope($(e));return t===void 0?void 0:this.parentInput(t)}parentInput(e){let t=this.ctx.conversation.input.for(e);if(t===void 0)return;let n=this.parentInputs.get(t);if(n!==void 0)return n;let r={state:t.state,setDraft:e=>{t.setDraft(e)},notify:(e,n)=>t.notify?.(e,n),insertReference:(e,n)=>t.insertReference(e,n),replaceText:(t,n)=>e.bail(e,`slash/input-insert-text`,{text:t,span:n})===!0};return this.parentInputs.set(t,r),r}};function vc(e,t){let n=e.chatNodes.get(t);if(n===void 0||n.visibility!==`visible`)return;let r=n.kind===`user`||n.kind===`steering`?`user`:n.kind===`assistant-step`?`assistant`:n.kind===`context`?`context`:void 0,i=n.location.kind===`turn`||n.location.kind===`step`?n.location.turn.turn:void 0;if(r!==void 0&&i!==void 0)return{nodeKey:n.key,nodeKind:n.kind,turnKey:`turn:${String(i)}`,seq:n.anchorSeq,source:r,modelVisible:!0,settled:gc(n.location)}}function yc(e){if(e instanceof KeyboardEvent&&e.key===`Escape`)return!1;let t=e.target;return!(t instanceof Element&&t.closest(`[data-side-chat-panel], .dsh-side-chat-selection-actions, .dsh-side-chat-selection-comment, .dsh-side-chat-annotation-marker`)!==null)}function bc({controller:e,sessions:t}){let n=(0,r.useSyncExternalStore)(e.subscribe,e.getSnapshot,e.getSnapshot),a=(0,r.useSyncExternalStore)(t.subscribeList,()=>t.currentSessionId(),()=>t.currentSessionId()),o=(0,r.useSyncExternalStore)(t.subscribeConversationInput,t.currentConversationInputSnapshot,t.currentConversationInputSnapshot),s=(0,r.useMemo)(()=>o===void 0?[]:x(o),[o]),[c,l]=(0,r.useState)(null),[u,d]=(0,r.useState)(null),f=(0,r.useRef)(0),p=(0,r.useRef)(void 0),m=(0,r.useRef)(null),h=(0,r.useRef)(!1),g=(0,r.useRef)(!1),_=(0,r.useRef)(0),v=(0,r.useCallback)(async e=>{let n=++f.current,r=t.currentSessionId(),i=r===void 0?void 0:t.face(r),a=r===void 0?void 0:Ls(r),o=window.getSelection();if(r===void 0||i===void 0||a===void 0||o===null||o.isCollapsed){n===f.current&&l(null);return}let s=i.getSnapshot();try{let i=await Ms({selection:o,conversationRoot:a,parentSessionId:r,resolver:{resolve(e){let t=e.dataset.chatAnchorKey;return t===void 0?void 0:vc(s,t)}}});n===f.current&&t.currentSessionId()===r&&l({value:i,touch:e})}catch{n===f.current&&l(null)}},[t]),y=(0,r.useCallback)(()=>{p.current!==void 0&&(window.clearTimeout(p.current),p.current=void 0)},[]),b=(0,r.useCallback)(()=>{y();let e=++f.current;p.current=window.setTimeout(()=>{p.current=void 0,e!==f.current||h.current||v(!0)},300)},[y,v]);(0,r.useEffect)(()=>{let e=()=>{y(),m.current=null,h.current=!1,++f.current,l(null),d(null)},t=()=>Date.now()<_.current,n=n=>{yc(n)&&(n.pointerType===`touch`&&t()||(n.pointerType!==`touch`&&(_.current=0),g.current=n.pointerType===`touch`,g.current&&e()))},r=n=>{yc(n)&&!t()&&(g.current=!0,e())},i=e=>{yc(e)&&!t()&&(g.current=!0,b())},a=e=>{g.current||t()?m.current=null:yc(e)?(y(),m.current={x:e.clientX,y:e.clientY},h.current=!1,++f.current,l(null),d(null)):m.current=null},o=e=>{let n=m.current;m.current=null,yc(e)&&!t()&&(g.current?b():(n===null||Math.abs(e.clientX-n.x)>2||Math.abs(e.clientY-n.y)>2||e.detail>1||e.shiftKey)&&v(!1))},s=()=>{if(h.current)return;if(g.current){b();return}let e=window.getSelection();(e===null||e.isCollapsed)&&(y(),++f.current,l(null))},c=e=>{g.current=!1,y(),e.key===`Escape`?(++f.current,h.current=!1,l(null),d(null)):yc(e)&&v(!1)};return document.addEventListener(`pointerdown`,n),document.addEventListener(`touchstart`,r,{passive:!0}),document.addEventListener(`touchend`,i,{passive:!0}),document.addEventListener(`mousedown`,a),document.addEventListener(`mouseup`,o),document.addEventListener(`selectionchange`,s),document.addEventListener(`keyup`,c),()=>{y(),document.removeEventListener(`pointerdown`,n),document.removeEventListener(`touchstart`,r),document.removeEventListener(`touchend`,i),document.removeEventListener(`mousedown`,a),document.removeEventListener(`mouseup`,o),document.removeEventListener(`selectionchange`,s),document.removeEventListener(`keyup`,c)}},[y,v,e,b]),(0,r.useEffect)(()=>{y(),++f.current,h.current=!1,l(null),d(null)},[y,a]),(0,r.useEffect)(()=>{o!==void 0&&t.reconcileConversationAnnotationPersistence()},[o,t]),(0,r.useEffect)(()=>{u!==null&&(s.some(e=>e.annotationIndex===u.annotationIndex)||(h.current=!1,d(null)))},[s,u]);let S=(0,r.useCallback)(()=>{y(),g.current&&(_.current=Date.now()+750),g.current=!1,h.current=!1,++f.current,l(null)},[y]),C=n.phase===`closed`?void 0:`Close the current Side Chat before starting another one.`,w=navigator.language.toLowerCase().startsWith(`zh`)?`zh-CN`:`en`,T=n.parentSessionId===void 0?void 0:t.modelDirectory?.(n.parentSessionId),ee=n.parentSessionId===void 0||n.chatId===void 0||n.phase!==`ready`||!n.messages.some(e=>e.role===`assistant`&&e.text.trim().length>0),E=()=>{let e=n.parentSessionId,r=n.chatId;if(e===void 0||r===void 0||n.phase!==`ready`){t.notify({kind:`warning`,text:`The Side Chat conversation is not ready to add yet.`});return}let i=t.title(e),a=ie({conversationId:r,title:[w===`zh-CN`?`侧边对话`:`Side Chat`,i].filter(Boolean).join(` · `),messages:n.messages});if(a.conversation.length===0)t.notify({kind:`warning`,text:`The Side Chat does not have any conversation history to add yet.`});else try{if(!t.addSideChatToConversation(e,a)){t.notify({kind:`warning`,text:`Could not add the Side Chat to the main conversation.`});return}t.openSession(e).then(()=>Rs(e),()=>{t.notify({kind:`warning`,text:`The Side Chat was added, but its parent conversation could not be opened.`})})}catch{t.notify({kind:`warning`,text:`Could not add the Side Chat to the main conversation.`})}},D=T===void 0?void 0:/* @__PURE__ */ (0,i.jsx)(bs,{directory:T,selection:n.modelSelection,locked:[`creating`,`closing`].includes(n.phase)||n.error?.operation===`close`,running:n.phase===`running`,validateInitialSelection:n.chatId===void 0,locale:w,onInitialize:(t,n)=>{n.remember?e.selectModel(t):e.initializeModel(t)},onSelect:t=>e.selectModel(t)},`${n.parentSessionId}:${n.chatId??`draft`}`);return/* @__PURE__ */ (0,i.jsxs)(`div`,{className:`dsh-side-chat-overlay`,children:[/* @__PURE__ */ (0,i.jsx)(Zs,{annotations:s,...u===null?{}:{activeAnnotationIndex:u.annotationIndex},onEdit:(e,t)=>{h.current=!0,y(),++f.current,l(null),d({...e,selection:t})}}),c!==null&&/* @__PURE__ */ (0,i.jsx)(ec,{selection:c.value,touchInteraction:c.touch,annotationNumber:t.nextConversationAnnotationNumber(),...C===void 0?{}:{askDisabledReason:C},onAddToChat:(e,n)=>{try{t.addSelectionToConversation(e,n)?Rs(e.parentSessionId):t.notify({kind:`warning`,text:`Could not add the selection to the current chat.`})}catch{t.notify({kind:`warning`,text:`Could not add the selection to the current chat.`})}S()},onAnnotationEditorChange:e=>{h.current=e,e&&g.current&&(_.current=Date.now()+750)},onMoreDetails:n=>{let r=e.openDraft({selection:n});r.ok?e.sendFirst(`Please explain the selected passage in more detail.`):t.notify({kind:`warning`,text:r.error.message}),S()},onAskInSideChat:n=>{let r=e.openDraft({selection:n});r.ok||t.notify({kind:`warning`,text:r.error.message}),S()},onDismiss:S}),u!==null&&/* @__PURE__ */ (0,i.jsx)(ec,{selection:u.selection,annotationNumber:u.annotationIndex+1,annotationEditor:{...u.comment===void 0?{}:{initialComment:u.comment},dialogLabel:`Edit annotation comment`},onAddToChat:(e,n)=>{try{t.updateConversationAnnotation(u.annotationIndex,n)||t.notify({kind:`warning`,text:`Could not update the annotation.`})}catch{t.notify({kind:`warning`,text:`Could not update the annotation.`})}h.current=!1,d(null)},onAnnotationEditorChange:e=>{h.current=e},onRemoveAnnotation:()=>{try{t.removeConversationAnnotation(u.annotationIndex)||t.notify({kind:`warning`,text:`Could not remove the annotation.`})}catch{t.notify({kind:`warning`,text:`Could not remove the annotation.`})}h.current=!1,d(null)},onMoreDetails:()=>{},onAskInSideChat:()=>{},onDismiss:()=>{h.current=!1,d(null)}},`annotation:${String(u.annotationIndex)}`),n.phase!==`closed`&&/* @__PURE__ */ (0,i.jsx)(Ds,{state:n,locale:w,embeddedConversation:/* @__PURE__ */ (0,i.jsx)(ac,{state:n,controller:e,locale:w,modelControl:D},n.chatId),modelControl:D,onDraftChange:t=>{e.setDraft(t)},onFirstSend:t=>e.sendFirst(t),onClose:()=>e.close(),onRetry:()=>e.retry(),onFocusParent:()=>{n.parentSessionId!==void 0&&t.openSession(n.parentSessionId)},onAddToConversation:E,addToConversationDisabled:ee,...n.chatId===void 0?{onRemoveSelection:()=>{e.clearSelection()}}:{}})]})}let xc=[`conversation`,`inputTriggers`,`modelDirectories`,`remote`,`sessions`,`slots`,`uiConversation`,`uiWorkspace`];async function Sc(e){let t=[],n=!1,i,a=()=>(n=!0,i??=(async()=>{for(let e of t.splice(0).reverse())try{await e()}catch(e){console.warn(`[dsh-side-chat] Cleanup failed`,e)}})(),i);e.effect(()=>a,`dsh-side-chat.clientLifecycle`);try{let i=document.createElement(`style`);i.textContent=o,i.dataset.plugin=`dsh-side-chat`,i.dataset.dshSideChat=`styles`,document.head.append(i),t.push(()=>{i.remove()});let a=e,s=await hs(a);if(n){await s.dispose();return}t.push(s.dispose),t.push(a.inputTriggers.registerSource(D)),t.push(a.inputTriggers.registerSource(pe));let c=new _c(a);t.push(be(a,e=>{c.removeConversationAnnotations(e)}));let l=new ke(s.remote,c);t.push(()=>l.dispose()),t.push(a.slots.inject(`shell.overlay`,()=>a.slots.register({name:`shell.overlay`,id:`dsh-side-chat`,order:90},()=>(0,r.createElement)(bc,{controller:l,sessions:c}))))}catch(e){throw await a(),e}}return n.SelectionActions=ec,n.SelectionValidationError=N,n.SideChatController=ke,n.SideChatPanel=Ds,n.apply=Sc,n.assertSelectionCurrent=De,n.buildSideChatPrompt=O,n.captureDomConversationSelection=Ms,n.finalizeConversationSelection=Ee,n.inject=xc,n.name=`side-chat-client`,n.normalizeSelectedText=Te,n.restoreDomConversationSelection=Fs,n.selectionFitsLimit=Ce,n.summarizeSelection=we,n.utf8ByteLength=Se,t.exports}});