window.__ModuleLoader__.load({id:`@ahggg/dsh-side-chat`,factory:e=>{var t={exports:{}},n=t.exports;Object.defineProperty(n,Symbol.toStringTag,{value:`Module`});let r=e("react"),i=e("react/jsx-runtime"),a=e("@deepseek-ai/dsh-client-ui-primitives");var o=`.dsh-side-chat-overlay,
.dsh-side-chat-parent-annotation-dock,
.dsh-side-chat-parent-user-message {
  /* DSH rc.6 themes publish the semantic alias layer. Keep the legacy tokens
     as fallbacks for older hosts instead of falling through to light colors
     while the host has selected its dark palette. */
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
  background: var(--dsw-specific-menu, var(--side-chat-bg));
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
  background: var(--dsw-specific-menu, var(--side-chat-bg));
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
.dsh-side-chat-annotated-user-message .dsh-side-chat-quote-details {
  top: calc(100% + 8px);
  right: 0;
  bottom: auto;
  left: auto;
}
.dsh-side-chat-annotated-user-message .dsh-side-chat-quote-details::before {
  top: -8px;
  bottom: auto;
}
.dsh-side-chat-quote-details-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dsh-side-chat-quote-details-header strong { color: var(--side-chat-muted); font-size: 13px; font-weight: 500; }
.dsh-side-chat-quote-detail + .dsh-side-chat-quote-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--side-chat-border);
}
.dsh-side-chat-quote pre {
  max-height: 180px;
  margin: 4px 0 0;
  overflow: auto;
  white-space: pre-wrap;
  font: inherit;
}
.dsh-side-chat-quote-comment {
  margin-top: 9px;
}
.dsh-side-chat-quote-comment > strong { color: var(--side-chat-muted); font-size: 13px; font-weight: 500; }
.dsh-side-chat-quote-comment > pre { margin-top: 4px; }
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
[data-composer-seat] [data-composer-chip="dsh-side-chat-selection"],
[data-composer-seat] [data-decoration="chip"][title="__dsh_side_chat_annotations__"] {
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
  top: 16px;
  left: 16px;
  pointer-events: auto;
}
.dsh-side-chat-parent-user-message {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}
.dsh-side-chat-parent-user-message > .dsh-side-chat-quote { align-self: flex-end; }
/* rc.6 caps its inner user stack at 82%; give that percentage the full chat
   column as its containing width instead of the annotation chip's shrink width. */
.dsh-side-chat-parent-user-message-body { width: 100%; min-width: 0; }
.dsh-side-chat-parent-user-message > .dsh-side-chat-quote .dsh-side-chat-quote-details {
  right: 0;
  left: auto;
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
`;function s(e){return`@${e}`}function c(e,t,n){let r=t.offset;if(!Number.isSafeInteger(r)||r<0||r>e.draft.length)return;if(t.length!==void 0&&Number.isSafeInteger(t.length)&&t.length>0&&r+t.length<=e.draft.length)return{start:r,end:r+t.length};if(e.draft.startsWith(`￼`,r))return{start:r,end:r+1};let i=s(n);if(e.draft.startsWith(i,r))return{start:r,end:r+i.length}}function l(e,t,n){let r=c(e,t,n);if(r===void 0)return!1;let i=e.draft.slice(r.start,r.end);return i===`￼`||i===s(n)||t.label===n&&t.clipboardText!==void 0&&i===t.clipboardText}function u(e,t,n,r={}){let i=c(t,n,n.label??``);if(i===void 0)return;let a=i.start,o=i.end;if(e.referenceMode===`lexical`){if(n.length===void 0)return;a=n.offset;for(let e of[...t.occurrences].sort((e,t)=>e.offset-t.offset)){if(e.occurrenceId===n.occurrenceId)break;if(e.offset>n.offset||e.length===void 0)return;a-=e.length-1}o=a+1}if(r.consumeFollowingSeparator===!0){let e=t.draft.slice(i.end);e.startsWith(`

`)?o+=2:(e.startsWith(`
`)||e.startsWith(` `))&&(o+=1)}return{start:a,end:o,draftRev:t.draftRev}}function d(e,t,n,r){let i=new Set(e.occurrences.map(e=>e.occurrenceId)),a=t.occurrences.filter(e=>!i.has(e.occurrenceId)&&e.source===n&&e.ref===r);return a.length===1?a[0]:void 0}function f(e,t,n,r={}){let i=c(e,t,n);if(i===void 0)return;let{start:a,end:o}=i;return r.consumeAdjacentSpace===!0&&(e.draft[o]===` `?o+=1:a>0&&e.draft[a-1]===` `&&--a),e.draft.slice(0,a)+e.draft.slice(o)}let p=`dsh-side-chat-selection`,m=`__dsh_side_chat_annotations__`;function h(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function g(e,t){let n=t?.trim();return{text:e.text,selection:e,...n===void 0||n.length===0?{}:{comment:n}}}function _(e){return JSON.stringify({version:2,annotations:e})}function v(e){if(typeof e!=`object`||!e)return!1;let t=e;if(typeof t.parentSessionId!=`string`||typeof t.text!=`string`||!Number.isSafeInteger(t.atSeq)||!Array.isArray(t.fragments)||typeof t.rect!=`object`||t.rect===null)return!1;let n=t.rect;return[n.x,n.y,n.width,n.height,n.viewportWidth,n.viewportHeight].every(e=>typeof e==`number`&&Number.isFinite(e))?t.fragments.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.nodeKey==`string`&&typeof t.nodeKind==`string`&&typeof t.turnKey==`string`&&Number.isSafeInteger(t.seq)&&Number.isSafeInteger(t.startOffset)&&Number.isSafeInteger(t.endOffset)&&typeof t.text==`string`&&[`user`,`assistant`,`context`,`code`].includes(t.source??``)&&typeof t.modelVisible==`boolean`&&typeof t.settled==`boolean`}):!1}function y(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.text==`string`&&(t.comment===void 0||typeof t.comment==`string`)&&(t.selection===void 0||v(t.selection))}function b(e){return{text:e.text,...e.comment===void 0?{}:{comment:e.comment}}}function x(e){let t=JSON.parse(e);if(y(t))return[t];if(typeof t!=`object`||!t)throw Error(`The selected conversation annotation is no longer valid.`);let n=t;if(n.version!==1&&n.version!==2||!Array.isArray(n.annotations)||n.annotations.length===0||!n.annotations.every(y))throw Error(`The selected conversation annotation is no longer valid.`);return n.annotations}function S(e){return x(e).map(b)}function C(e){return[`<selected_context>`,...e.flatMap((e,t)=>e.comment===void 0?[`<annotation index="${String(t+1)}">`,h(e.text),`</annotation>`]:[`<annotation index="${String(t+1)}">`,`<selected_text>`,h(e.text),`</selected_text>`,`<user_comment>`,h(e.comment),`</user_comment>`,`</annotation>`]),`</selected_context>`].join(`
`)}function w(e){return e.occurrences.filter(e=>e.source===p)}function T(e){return w(e).flatMap(e=>{try{return[...x(e.ref)]}catch{return[]}})}function E(e){return T(e).map(b)}function D(e){let t=[];return T(e).forEach((e,n)=>{e.selection!==void 0&&t.push({...b(e),annotationIndex:n,selection:e.selection})}),t}function O(e){let t=[...w(e)].sort((e,t)=>t.offset-e.offset),n=e;for(let e of t){let t=f(n,e,m);t!==void 0&&(n={...n,draft:t})}let r=n.draft;return t.some(e=>e.offset===0)&&(r.startsWith(`

`)?r=r.slice(2):(r.startsWith(`
`)||r.startsWith(` `))&&(r=r.slice(1))),r}function k(e){let t=e.state.getSnapshot(),n=w(t);if(n.length===0)return!1;if(e.referenceMode===`lexical`&&e.replaceText!==void 0){for(let t of n.map(e=>e.occurrenceId).reverse()){let n=e.state.getSnapshot(),r=n.occurrences.find(e=>e.occurrenceId===t);if(r===void 0)continue;let i=u(e,n,r,{consumeFollowingSeparator:!0});if(i===void 0||!e.replaceText(``,i))return!1}return w(e.state.getSnapshot()).length===0}return e.setDraft(O(t)),!0}let A={trigger:`@`,name:p,order:1e3,candidates:async()=>[],onPick:()=>void 0,codec:{clipboardText:e=>S(e).map(e=>e.text).join(`

`),serialize:async(e,t)=>{if(t.aborted)throw t.reason;return C(S(e))}}};function j(e,t,n){let r=O(t),i=e.state.getSnapshot();if(i.draftRev!==t.draftRev||i.draft!==t.draft)return!1;let a=_(n);if(!e.insertReference({source:p,ref:a,label:`__dsh_side_chat_annotations__`,clipboardText:n.map(e=>e.text).join(`

`)},{start:0,end:0,draftRev:i.draftRev}))return!1;let o=e.state.getSnapshot(),s=d(i,o,p,a),u=()=>{let n=e.state.getSnapshot(),r=s===void 0?void 0:n.occurrences.find(e=>e.occurrenceId===s.occurrenceId);if(r===void 0||r.offset!==0)return;let i=c(n,r,m);if(i===void 0||i.start!==0)return;let a=n.draft.slice(i.end);if(a.startsWith(` `)&&a.slice(1)===t.draft)a=t.draft;else if(a!==t.draft)return;e.setDraft(a)};if(s===void 0||s.offset!==0)return u(),!1;let f=c(o,s,m);if(f===void 0||f.start!==0)return u(),!1;let h=o.draft.slice(f.end);if(h.startsWith(` `)&&h.slice(1)===t.draft)h=t.draft;else if(h!==t.draft)return u(),!1;let g=`${o.draft.slice(f.start,f.end)}\n\n${r}`,v=e.state.getSnapshot(),y=v.occurrences.find(e=>e.occurrenceId===s.occurrenceId);if(v.draftRev!==o.draftRev||v.draft!==o.draft||y===void 0||y.source!==p||y.ref!==a||!l(v,y,`__dsh_side_chat_annotations__`))return u(),!1;e.setDraft(g);let b=e.state.getSnapshot(),x=b.occurrences.find(e=>e.occurrenceId===s.occurrenceId);return b.draft===g&&x!==void 0&&x.source===p&&x.ref===a&&x.offset===0&&l(b,x,`__dsh_side_chat_annotations__`)}function M(e,t,n){if(e.replaceText===void 0)return!1;let r=w(t);if(r.length>1)return!1;let i=r[0];if(i!==void 0&&i.length===void 0)return!1;let a=t,o=!1;if(i===void 0){if(!e.replaceText(` `,{start:0,end:0,draftRev:t.draftRev})||(a=e.state.getSnapshot(),a.draft!==` ${t.draft}`))return!1;o=!0}let s=i===void 0?{start:0,end:0,draftRev:a.draftRev}:u(e,a,i);if(s===void 0)return!1;let c=_(n),f=n.map(e=>e.text).join(`

`);if(!e.insertReference({source:p,ref:c,label:`__dsh_side_chat_annotations__`,clipboardText:f},s)){if(o){let n=e.state.getSnapshot();n.draft===` ${t.draft}`&&e.replaceText(``,{start:0,end:1,draftRev:n.draftRev})}return!1}let m=e.state.getSnapshot(),h=d(a,m,p,c),g=i===void 0?0:i.offset+(i.length??0),v=i===void 0?a.draft:a.draft.slice(g),y=v.startsWith(` `)?``:` `,b=i===void 0?`${f}${a.draft}`:a.draft.slice(0,i.offset)+f+y+v;if(h!==void 0&&w(m).length===1&&h.offset===(i?.offset??0)&&h.label===`__dsh_side_chat_annotations__`&&h.clipboardText===f&&l(m,h,`__dsh_side_chat_annotations__`)&&m.draft===b)return!0;if(i===void 0&&h!==void 0){let t=u(e,m,h,{consumeFollowingSeparator:!0});t!==void 0&&e.replaceText(``,t)}return!1}function ee(e,t,n){return e.referenceMode===`lexical`?M(e,t,n):j(e,t,n)}function te(e,t,n){let r=e.state.getSnapshot();return ee(e,r,[...T(r),g(t,n)])}function ne(e,t){let n=e.state.getSnapshot(),r=[...T(n)];return!Number.isSafeInteger(t)||r[t]===void 0?!1:(r.splice(t,1),r.length===0?k(e):ee(e,n,r))}function re(e,t,n){let r=e.state.getSnapshot(),i=[...T(r)],a=i[t];if(!Number.isSafeInteger(t)||a===void 0)return!1;let o=n?.trim();return i[t]={text:a.text,...a.selection===void 0?{}:{selection:a.selection},...o===void 0||o.length===0?{}:{comment:o}},ee(e,r,i)}function ie(e,t,n){let r=``,i=0,a=[...e.occurrences].sort((e,t)=>e.offset-t.offset);for(let o of a){let a=o.occurrenceId===t.occurrenceId?m:o.label;if(o.length===void 0&&!e.draft.startsWith(`￼`,o.offset)&&a===void 0)return;let s=c(e,o,a??``);if(s===void 0||s.start<i)return;let l=o.occurrenceId===t.occurrenceId?n:o.clipboardText;if(l===void 0)return;r+=e.draft.slice(i,s.start)+l,i=s.end}return r+e.draft.slice(i)}function N(e){return e.startsWith(`

`)?`

`:e.startsWith(`
`)?`
`:e.startsWith(` `)?` `:``}function ae(e,t,n){let r=[`

`,`
`,` `,``];if(n!==void 0)return r.some(r=>e===t+r+n)?n:void 0;for(let n of r.slice(0,-1)){let r=t+n;if(e.startsWith(r))return e.slice(r.length)}return e===t?``:void 0}function oe(e){let t=w(e).find(e=>e.offset===0),n=se(e);if(t===void 0||n===void 0)return;let r=c(e,t,m);if(r===void 0||r.start!==0)return;let i;try{i=x(n)}catch{return}let a=i.map(e=>e.text).join(`

`),o=ie(e,t,a);if(o===void 0)return;let s=a+N(e.draft.slice(r.end));if(o.startsWith(s))return{ref:n,displayDraft:e.draft,mirrorDraft:o,baseDraft:o.slice(s.length)}}function se(e){let t=w(e).find(e=>e.offset===0);if(t!==void 0&&l(e,t,`__dsh_side_chat_annotations__`))try{return x(t.ref),t.ref}catch{return}}function ce(e){if(e.occurrences.some(e=>e.offset===0))return;if(e.draft.startsWith(`￼

`))return e.draft.slice(3);let t=s(m);if(!e.draft.startsWith(t))return;let n=e.draft.slice(t.length);if(n.startsWith(`

`))n=n.slice(2);else if(n.startsWith(` `))n=n.slice(1);else return;return n}function le(e){let t=ce(e.state.getSnapshot());return t!==void 0&&(e.setDraft(t),!0)}function ue(e,t,n,r){let i;try{i=x(t)}catch{return!1}let a=e.state.getSnapshot(),o=ce(a),s=i.map(e=>e.text).join(`

`),c=n===void 0?void 0:ae(n,s,r),l=o??(n!==void 0&&a.occurrences.length===0&&a.draft===n&&c!==void 0?c:void 0);if(l===void 0)return!1;l!==a.draft&&e.setDraft(l);let u=e.state.getSnapshot();return u.draft!==l||u.occurrences.length!==0?!1:ee(e,u,i)?!0:(e.state.getSnapshot().occurrences.length===0&&n!==void 0&&e.setDraft(n),!1)}function de(e){return e.replaceAll(`&lt;`,`<`).replaceAll(`&gt;`,`>`).replaceAll(`&amp;`,`&`)}function fe(e){let t=/^<selected_text>\n([\s\S]*?)\n<\/selected_text>(?:\n<user_comment>\n([\s\S]*?)\n<\/user_comment>)?$/u.exec(e);if(t===null)return{text:de(e)};let n=t[2];return{text:de(t[1]??``),...n===void 0?{}:{comment:de(n)}}}function pe(e){let t=/^<selected_context>\n([\s\S]*?)\n<\/selected_context>\s*/u.exec(e);if(t!==null){let n=[];for(let e of t[1]?.matchAll(/<annotation(?: index="\d+")?>\n([\s\S]*?)\n<\/annotation>/gu)??[])n.push(fe(e[1]??``));if(n.length>0)return{annotations:n,message:e.slice(t[0].length).trim()}}let n=/^<selected_context source="current-conversation" event-seq="(\d+)">\n?([\s\S]*?)\n?<\/selected_context>\s*/u.exec(e);if(n!==null)return{annotations:[{text:de(n[2]??``)}],message:e.slice(n[0].length).trim()};let r=/^Selected passage from the current conversation \(message (\d+)\):\n([\s\S]*?)\nEnd selected passage\.\s*/u.exec(e);if(r!==null)return{annotations:[{text:r[2]??``}],message:e.slice(r[0].length).trim()}}function me(e,t){let n=t.trim();return e===void 0?[{type:`text`,text:n}]:[{type:`text`,text:[`<selected_context source="current-conversation" event-seq="${e.atSeq}">`,h(e.text),`</selected_context>`,``,`<user_question>`,h(n),`</user_question>`].join(`
`)}]}let he=Object.freeze({en:Object.freeze({title:`Side Chat`,close:`Close Side Chat`,addToConversation:`Add to conversation`,placeholder:`Ask about this in a Side Chat`,send:`Send`,selectedPassage:`Selected passage`,selectionAttachments:e=>`${String(e)} ${e===1?`annotation`:`annotations`}`,selectionPreviewLabel:`Selected text`,selectionCommentLabel:`User comment`,removeSelection:`Remove annotation`,expand:`Expand`,collapse:`Collapse`,temporary:`Archived when closed; history remains on disk`,referenceOnly:`Inherits the complete parent conversation prefix`,cannotReopen:`No reopen action`,sharedWorkspace:`Shares the parent workspace`,retry:`Retry`,genericError:`Side Chat error`,closeError:`Could not close the Side Chat`}),"zh-CN":Object.freeze({title:`侧边对话`,close:`关闭侧边对话`,addToConversation:`添加到主对话`,placeholder:`在侧边对话中询问这段内容`,send:`发送`,selectedPassage:`所选段落`,selectionAttachments:e=>`${String(e)} 条引用`,selectionPreviewLabel:`所选文本`,selectionCommentLabel:`用户批注`,removeSelection:`移除引用`,expand:`展开`,collapse:`收起`,temporary:`关闭时归档；历史仍保存在磁盘上`,referenceOnly:`完整继承父会话对话前缀`,cannotReopen:`不提供重新打开操作`,sharedWorkspace:`与父会话共享工作区`,retry:`重试`,genericError:`侧边对话错误`,closeError:`无法关闭侧边对话`})});function ge({selections:e,messages:t,onRemove:n}){let[a,o]=(0,r.useState)(!1),[s,c]=(0,r.useState)(!1),l=(0,r.useRef)(null),u=(0,r.useRef)(null),d=(0,r.useRef)(),f=()=>{d.current!==void 0&&window.clearTimeout(d.current),d.current=void 0,c(!0)},p=()=>{d.current!==void 0&&window.clearTimeout(d.current),d.current=window.setTimeout(()=>{d.current=void 0,c(!1)},220)};(0,r.useEffect)(()=>()=>{d.current!==void 0&&window.clearTimeout(d.current)},[]),(0,r.useEffect)(()=>{if(!a)return;let e=e=>{let t=l.current,n=e.target;t!==null&&n instanceof Node&&t.contains(n)||(d.current!==void 0&&window.clearTimeout(d.current),d.current=void 0,c(!1),o(!1))};return document.addEventListener(`mousedown`,e,!0),()=>{document.removeEventListener(`mousedown`,e,!0)}},[a]);let m=()=>{let e=u.current,t=l.current?.closest(`.dsh-side-chat-panel, [data-composer-seat], [data-chat-flow-kind]`);if(e===null)return;e.style.setProperty(`--dsh-side-chat-quote-offset-x`,`0px`);let n=e.getBoundingClientRect(),r=t?.getBoundingClientRect(),i=(r?.left??0)+16,a=(r?.right??window.innerWidth)-16,o=n.left<i?i-n.left:n.right>a?a-n.right:0;e.style.setProperty(`--dsh-side-chat-quote-offset-x`,`${String(o)}px`)};return(0,i.jsxs)(`section`,{ref:l,className:`dsh-side-chat-quote`,"aria-label":t.selectedPassage,"data-expanded":a||void 0,"data-hovered":s||void 0,onMouseEnter:()=>{f(),m()},onMouseLeave:p,onFocusCapture:m,children:[(0,i.jsxs)(`div`,{className:`dsh-side-chat-quote-chip`,children:[(0,i.jsxs)(`button`,{type:`button`,className:`dsh-side-chat-quote-trigger`,"aria-expanded":a,"aria-label":`${a?t.collapse:t.expand}: ${t.selectedPassage}`,onClick:()=>{a&&(d.current!==void 0&&window.clearTimeout(d.current),d.current=void 0,c(!1)),o(e=>!e)},children:[(0,i.jsxs)(`svg`,{className:`dsh-side-chat-quote-icon`,viewBox:`0 0 24 24`,"aria-hidden":`true`,children:[(0,i.jsx)(`path`,{d:`M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z`}),(0,i.jsx)(`path`,{d:`M8 8h8M8 12h5`})]}),(0,i.jsx)(`strong`,{children:t.selectionAttachments(e.length)})]}),n!==void 0&&(0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-quote-remove`,"aria-label":t.removeSelection,onClick:n,children:`×`})]}),(0,i.jsx)(`div`,{ref:u,className:`dsh-side-chat-quote-details`,role:`tooltip`,children:e.map((e,n)=>(0,i.jsxs)(`div`,{className:`dsh-side-chat-quote-detail`,children:[(0,i.jsx)(`div`,{className:`dsh-side-chat-quote-details-header`,children:(0,i.jsxs)(`strong`,{children:[String(n+1),`. `,t.selectionPreviewLabel,`:`]})}),(0,i.jsx)(`pre`,{children:e.text}),e.comment!==void 0&&(0,i.jsxs)(`div`,{className:`dsh-side-chat-quote-comment`,children:[(0,i.jsxs)(`strong`,{children:[t.selectionCommentLabel,`:`]}),(0,i.jsx)(`pre`,{children:e.comment})]})]},`${String(n)}-${e.text}`))})]})}let _e=`<referenced_conversation>`,ve=`</referenced_conversation>`;function ye(e){let t=e.trim().replace(/\s+/gu,` `);return t.length===0?`Side Chat`:t}function be(e){return e.map(e=>{if(typeof e!=`object`||!e)return``;let t=e;return t.type===`text`&&typeof t.text==`string`?t.text:t.type===`image`?`[Image attachment]`:``}).filter(Boolean).join(`
`).trim()}function xe(e){return e.blocks.flatMap(e=>e.kind===`text`?[e.text]:[]).join(`
`).trim()}function Se(e){let t=[];for(let n of e.nodes)if(!(n.seq<=e.inheritedThroughSeq)){if(n.kind===`user`||n.kind===`steering`){let e=be(n.content);e.length>0&&t.push({role:`user`,content:e});continue}if(n.kind===`assistant`){let e=xe(n);e.length>0&&t.push({role:`assistant`,content:e})}}return{version:1,conversationId:e.conversationId,title:ye(e.title),conversation:t}}function Ce(e){if(typeof e!=`object`||!e)return!1;let t=e;return(t.role===`user`||t.role===`assistant`)&&typeof t.content==`string`&&t.content.length>0}function we(e){let t=JSON.parse(e);if(typeof t!=`object`||!t)throw Error(`The referenced Side Chat conversation is no longer valid.`);let n=t;if(n.version!==1||typeof n.conversationId!=`string`||n.conversationId.length===0||typeof n.title!=`string`||n.title.length===0||!Array.isArray(n.conversation)||n.conversation.length===0||!n.conversation.every(Ce))throw Error(`The referenced Side Chat conversation is no longer valid.`);return{version:1,conversationId:n.conversationId,title:n.title,conversation:n.conversation}}function Te(e){return JSON.stringify(e)}function Ee(e){return JSON.stringify(e).replaceAll(`<`,`\\u003c`)}function De(e){return[_e,Ee({conversationId:e.conversationId,title:e.title,conversation:e.conversation}),ve].join(`
`)}function Oe(e){let t=`${_e}\n`;if(!e.startsWith(t))return;let n=`\n${ve}`,r=e.indexOf(n,t.length);if(r<0)return;let i=e.slice(t.length,r);if(i.length!==0)try{let t=JSON.parse(i);return{reference:we(JSON.stringify({version:1,conversationId:t.conversationId,title:t.title,conversation:t.conversation})),message:e.slice(r+n.length).trim()}}catch{return}}function ke(e,t){return e.occurrences.filter(e=>{if(e.source!==`dsh-side-chat-conversation`)return!1;try{return we(e.ref).conversationId===t.conversationId}catch{return!1}})}function Ae(e,t){let n=e.state.getSnapshot(),r=n.occurrences.find(e=>e.occurrenceId===t);if(r===void 0)return;let i;try{i=we(r.ref).title}catch{return}if(e.referenceMode===`lexical`&&e.replaceText!==void 0){let t=u(e,n,r,{consumeFollowingSeparator:!0});t!==void 0&&e.replaceText(``,t);return}let a=f(n,r,i,{consumeAdjacentSpace:!0});a!==void 0&&e.setDraft(a)}function je(e,t){if(t.conversation.length===0)return!1;let n=e.state.getSnapshot(),r=ke(n,t),i=Te(t);if(r.some(e=>e.ref===i))return!0;let a=e.referenceMode===`lexical`?r[0]:void 0,o=a===void 0?{start:0,end:0,draftRev:n.draftRev}:u(e,n,a);if(o===void 0||!e.insertReference({source:`dsh-side-chat-conversation`,ref:i,label:t.title,appearance:`session`,clipboardText:`@${t.title}`},o))return!1;if(e.referenceMode===`lexical`){if(d(n,e.state.getSnapshot(),`dsh-side-chat-conversation`,i)===void 0)return!1;for(let t of r.slice(1))Ae(e,t.occurrenceId);return ke(e.state.getSnapshot(),t).length===1}for(let t of r)Ae(e,t.occurrenceId);return!0}let Me={trigger:`@`,name:`dsh-side-chat-conversation`,order:1001,candidates:async()=>[],onPick:()=>void 0,codec:{clipboardText:e=>`@${we(e).title}`,serialize:async(e,t)=>{if(t.aborted)throw t.reason;return De(we(e))}}};function Ne(){return navigator.language.toLowerCase().startsWith(`zh`)?`zh-CN`:`en`}let Pe=`--dsh-side-chat-parent-annotation-width`;function Fe({input:e,onRemove:t,locale:n=Ne()}){let a=E(e),o=(0,r.useRef)(null);return(0,r.useLayoutEffect)(()=>{let e=o.current,t=e?.closest(`[data-composer-seat]`),n=e?.querySelector(`.dsh-side-chat-quote-chip`);if(t===void 0||n===void 0||t===null||n===null)return;let r=()=>{let e=n.getBoundingClientRect().width;e>0&&t.style.setProperty(Pe,`${String(e)}px`)};r();let i=typeof ResizeObserver>`u`?void 0:new ResizeObserver(r);return i?.observe(n),()=>{i?.disconnect(),t.style.removeProperty(Pe)}},[a.length,n]),a.length===0?null:(0,i.jsx)(`div`,{ref:o,className:`dsh-side-chat-parent-annotation-dock`,children:(0,i.jsx)(ge,{selections:a,messages:he[n],onRemove:t})})}function Ie(e){return e.map(e=>{if(typeof e!=`object`||!e)return``;let t=e;return t.type===`text`&&typeof t.text==`string`?t.text:``}).join(``)}function Le(e){return/^<user_question>\n?([\s\S]*?)\n?<\/user_question>$/u.exec(e)?.[1]?.trim()??e}function Re(e,t){let n=!1,r=e.flatMap(e=>{if(typeof e!=`object`||!e)return[e];let r=e;return r.type!==`text`||typeof r.text!=`string`?[e]:n?[]:(n=!0,[{...r,text:t}])});return n?r:[{type:`text`,text:t},...r]}function ze(e){let t=e,n,r;for(let e=0;e<2;e+=1){let e=n===void 0?pe(t):void 0;if(e!==void 0){n=e.annotations,t=e.message;continue}let i=r===void 0?Oe(t):void 0;if(i!==void 0){r=i.reference,t=i.message;continue}break}if(n!==void 0||r!==void 0)return{...n===void 0?{}:{annotations:n},...r===void 0?{}:{reference:r},message:t}}function Be(e){return function(t){let n=ze(Ie(t.node.data.content));if(n===void 0)return(0,r.createElement)(e,t);let a=Le(n.message),o=n.reference===void 0?a:[`@${n.reference.title}`,a].filter(e=>e.length>0).join(`

`),s=t.node.data.referenceLabels??[],c={...t.node,data:{...t.node.data,content:Re(t.node.data.content,o),...n.reference===void 0?{}:{referenceLabels:[...new Set([n.reference.title,...s])]}}},l=(0,r.createElement)(e,{...t,node:c});return n.annotations===void 0?l:(0,i.jsxs)(`div`,{className:`dsh-side-chat-parent-user-message`,children:[(0,i.jsx)(ge,{selections:n.annotations,messages:he[Ne()]}),(0,i.jsx)(`div`,{className:`dsh-side-chat-parent-user-message-body`,children:l})]})}}function Ve(e,t){let n=e.slots,a=n.inject(`conversation.input.dock`,()=>n.register({name:`conversation.input.dock`,id:`dsh-side-chat-annotations`,order:30},({input:e})=>(0,i.jsx)(Fe,{input:e,onRemove:t}))),o=e=>n.inject(`conversation.chat.node`,()=>{let t=i=>{let a=n.entries(`conversation.chat.node`).find(n=>n.options.key===e&&n.component!==t&&(n.options.priority??0)>=0)?.component;if(a===void 0)return null;let o=Be(a);return(0,r.createElement)(o,i)};return n.register({name:`conversation.chat.node`,key:e,priority:-100,locale:`conversation`},t)}),s=o(`user`),c=o(`steering`);return()=>{c(),s(),a()}}var He=class{value;label;listeners=new Set;disposed=!1;constructor(e,t){this.value=e,this.label=t}getSnapshot=()=>this.value;subscribe=e=>this.disposed?()=>{}:(this.listeners.add(e),()=>{this.listeners.delete(e)});publish(e){if(!this.disposed){this.value=e;for(let e of this.listeners)try{e()}catch(e){console.error(`[${this.label}] subscriber threw`,e)}}}dispose(){this.disposed=!0,this.listeners.clear()}};Object.freeze({repository:`https://github.com/deepseek-ai/deepseek-harness`,npmPackage:`@deepseek-ai/dsh`,npmVersion:`0.1.0-rc.6`,npmIntegrity:`sha512-brpZfED7ieRa2PQ5tUxMhHrM1pb2CmKFVM/f6yMULBDMicahk+Z2OsHgTwTDnoiZm23Ftu9rQz0NN4pflaoJcg==`,sourceCommit:null,publicRepositoryHead:`47f943859bef60e4160492346772ded9b24f765a`,publicRepositoryHeadVersion:`0.1.0-rc.5`,node:`^22.19.0 || >=24.0.0`,pnpm:`11.7.0`,matchingNpmReleaseAvailable:!0});function Ue(e){return new TextEncoder().encode(e).byteLength}function We(e){return Ue(e)<=16384}function Ge(e,t=240){let n=[...e];if(n.length<=t)return e;let r=Math.ceil(t*.65),i=t-r;return`${n.slice(0,r).join(``)}…${n.slice(-i).join(``)}`}var P=class extends Error{code;constructor(e,t){super(t),this.code=e,this.name=`SelectionValidationError`}};function Ke(e){return e.replace(/\r\n?/gu,`
`).replace(/\n(?:[\t ]*\n){3,}/gu,`


`).trim()}function qe(e){let t=e.fragments[0];if(t===void 0)throw new P(`selection_empty`,`Select some conversation text first.`);if(e.fragments.length!==1)throw new P(`selection_crosses_unsupported_nodes`,`Select text inside one completed message.`);let n=Ke(e.rawText);if(n.length===0)throw new P(`selection_empty`,`The selection contains only whitespace.`);if(Ue(n)>16384)throw new P(`selection_too_large`,`The selected text is too large.`);if(!t.modelVisible||!t.settled)throw new P(`fork_unavailable`,`Wait for this message to finish before branching.`);if(!Number.isSafeInteger(t.seq)||t.seq<0)throw new P(`selection_stale`,`The selected message is no longer available.`);return Object.freeze({parentSessionId:e.parentSessionId,fragments:Object.freeze([{...t}]),text:n,atSeq:t.seq,rect:Object.freeze({...e.rect})})}function Je(e,t){if(t!==e.parentSessionId)throw new P(`selection_stale`,`The parent conversation changed after selection.`)}let Ye=Object.freeze({phase:`closed`,draft:``});function F(e){return{ok:!0,value:e}}function I(e){return{ok:!1,error:e}}function L(e,t,n=!0){return{code:e,message:t,recoverable:n}}function Xe(e){switch(e.status){case`idle`:return`ready`;case`running`:return`running`;case`needs-input`:return`needs-input`;case`needs-approval`:return`needs-approval`;case`failed`:return`error`;case`interrupted`:return`ready`}}var Ze=class{remote;sessions;observable=new He(Ye,`dsh-side-chat`);lease;childUnsubscribe;opening;closing;closeRequested=!1;disposed=!1;constructor(e,t){this.remote=e,this.sessions=t}getSnapshot=()=>this.observable.getSnapshot();subscribe=e=>this.observable.subscribe(e);openDraft(e={}){if(this.disposed)return I(L(`transport_error`,`The Side Chat controller is disposed.`,!1));if(this.getSnapshot().phase!==`closed`)return I(L(`side_chat_already_open`,`A Side Chat is already open.`));let t=e.parentSessionId??this.sessions.currentSessionId();if(t===void 0)return I(L(`parent_session_missing`,`Start the main conversation first.`));try{e.selection!==void 0&&Je(e.selection,t)}catch(e){return I(L(`selection_stale`,e instanceof Error?e.message:`The selected text is no longer available.`,!1))}let n=this.sessions.sideChatModelPreference();return this.publish({phase:`draft`,parentSessionId:t,...e.selection===void 0?{}:{selection:e.selection},...n===void 0?{}:{modelSelection:n},draft:e.draft??``}),F(void 0)}setDraft(e){let t=this.getSnapshot();return t.phase===`closed`||t.phase===`creating`||t.phase===`opening`||t.phase===`closing`||t.childSessionId!==void 0?I(L(`invalid_request`,`The draft is not editable right now.`,!1)):(this.publish({...t,draft:e}),F(void 0))}clearSelection(){let e=this.getSnapshot();return e.selection===void 0?F(void 0):e.childSessionId!==void 0||![`draft`,`error`].includes(e.phase)?I(L(`invalid_request`,`The selected passage has already been sent.`,!1)):(this.publish({...e,selection:void 0}),F(void 0))}initializeModel(e){let t=this.getSnapshot();if(t.childSessionId!==void 0||![`draft`,`error`].includes(t.phase)||t.error?.operation===`close`)return I(L(`invalid_request`,`The Side Chat model cannot be initialized right now.`,!1));let n={...e};return this.publish({...t,modelSelection:n}),F(n)}async selectModel(e){let t=this.getSnapshot();if(t.phase===`closed`||[`creating`,`opening`,`closing`].includes(t.phase)||t.error?.operation===`close`)return I(L(`invalid_request`,`The Side Chat model cannot be changed right now.`,!1));let n={...e},r=t.childSessionId;if(r===void 0){let e=this.initializeModel(n);return e.ok&&this.sessions.rememberSideChatModelPreference(e.value),e}let i=await this.invoke(()=>this.remote.selectModel({childSessionId:r,...n}));if(!i.ok)return I(i.error);let a=this.getSnapshot();return a.childSessionId===r&&![`closed`,`closing`].includes(a.phase)&&(this.publish({...a,modelSelection:i.value.selected}),this.sessions.rememberSideChatModelPreference(i.value.selected)),F(i.value.selected)}async sendFirst(e){if(this.opening!==void 0)return I(L(`invalid_request`,`The Side Chat is already opening.`,!1));let t=this.getSnapshot(),n=e.trim();if(n.length===0)return I(L(`invalid_request`,`Enter a Side Chat question.`,!1));if(t.parentSessionId===void 0||![`draft`,`error`].includes(t.phase))return I(L(`invalid_request`,`The first Side Chat message cannot be sent now.`,!1));if(t.error?.operation===`close`)return I(L(`side_chat_destroy_failed`,`Retry closing the current Side Chat first.`));if(t.childSessionId===void 0&&t.selection!==void 0&&!this.sessions.selectionIsCurrent(t.selection)){let e=L(`selection_stale`,`Select the passage again before sending.`,!1);return this.fail(e,`create`,{draft:n,firstQuestion:n}),I(e)}let r=t.selection?.atSeq??this.sessions.lastCompletedSeq(t.parentSessionId);if(r===void 0){let e=L(`parent_session_not_ready`,`Wait for a completed main-conversation turn first.`);return this.fail(e,`create`,{draft:n,firstQuestion:n}),I(e)}let i=this.createOpenAndPrompt(t.parentSessionId,r,n);this.opening=i;try{return await i}finally{this.opening===i&&(this.opening=void 0)}}async send(e,t=`queue`){let n=e.trim();return n.length===0?I(L(`invalid_request`,`Enter a message.`,!1)):await this.sendParts([{type:`text`,text:n}],t)}async sendParts(e,t=`queue`){if(e.length===0)return I(L(`invalid_request`,`Enter a message.`,!1));let n=this.bindingTarget();if(!n.ok)return n;let r=await this.invoke(()=>n.value.prompt(e,t));return this.getSnapshot().phase===`closing`||this.getSnapshot().phase===`closed`?I(L(`transport_error`,`The Side Chat was closed.`,!1)):(r.ok||this.fail(r.error,`prompt`),r.ok?F(void 0):I(r.error))}async updateQueue(e,t){let n=this.bindingTarget();if(!n.ok)return n;let r=await this.invoke(()=>n.value.updateQueue(e,t));return r.ok?F(void 0):I(r.error)}async cancel(){let e=this.bindingTarget();if(!e.ok)return e;let t=await this.invoke(()=>e.value.cancel());return t.ok?F(void 0):I(t.error)}async respondApproval(e,t){let n=this.bindingTarget();if(!n.ok)return n;let r=await this.invoke(()=>n.value.respondApproval(e,t));return r.ok?F(void 0):I(r.error)}async respondQuestion(e,t){let n=this.bindingTarget();if(!n.ok)return n;let r=await this.invoke(()=>n.value.respondQuestion(e,t));return r.ok?F(void 0):I(r.error)}async close(){let e=this.getSnapshot();if(e.phase===`closed`)return F(void 0);if(e.childSessionId===void 0&&this.opening===void 0)return this.reset(),F(void 0);if(this.opening!==void 0){this.closeRequested=!0,this.publish({...e,phase:`closing`,error:void 0}),await this.opening;let t=this.getSnapshot();return t.phase===`closed`?F(void 0):t.error?.operation===`close`?I(t.error):t.childSessionId===void 0?(this.reset(),F(void 0)):await this.closeChild(t.childSessionId)}return e.childSessionId===void 0?(this.reset(),F(void 0)):await this.closeChild(e.childSessionId)}async retry(){let e=this.getSnapshot();return e.error?.operation===`close`?await this.close():e.error?.operation===`create`||e.error?.operation===`open`||e.error?.operation===`prompt`?await this.sendFirst(e.firstQuestion??e.draft):I(L(`invalid_request`,`There is no failed operation to retry.`,!1))}async dispose(){this.disposed||(this.getSnapshot().phase!==`closed`&&((await this.close()).ok||this.sessions.notify({kind:`warning`,text:`The Side Chat could not be closed cleanly.`})),this.disposed=!0,this.detachLease(),this.observable.dispose())}async createOpenAndPrompt(e,t,n){let r=this.getSnapshot(),i=r.childSessionId;if(i===void 0){this.publish({...r,phase:`creating`,draft:n,firstQuestion:n,error:void 0});let a=await this.invoke(()=>this.remote.create({parentSessionId:e,atSeq:t,...r.modelSelection===void 0?{}:{modelSelection:r.modelSelection}}));if(!a.ok)return this.closeRequested?this.reset():this.fail(a.error,`create`,{draft:n,firstQuestion:n}),I(a.error);if(i=a.value.childSessionId,this.publishCreated(a.value,n),this.closeRequested||this.disposed){let e=await this.closeChild(i);return e.ok?I(L(`transport_error`,`The Side Chat was closed.`,!1)):e}}if(this.lease===void 0){this.publish({...this.getSnapshot(),phase:`opening`,error:void 0});try{let e=await this.sessions.retain(i);if(this.closeRequested||this.disposed){e.release();let t=await this.closeChild(i);return t.ok?I(L(`transport_error`,`The Side Chat was closed.`,!1)):t}this.attachLease(e,i)}catch{let e=L(`side_chat_open_failed`,`The child Session could not be opened.`);return this.fail(e,`open`,{firstQuestion:n,draft:n}),I(e)}}let a=this.lease?.binding;if(a===void 0){let e=L(`side_chat_open_failed`,`The child Session is unavailable.`);return this.fail(e,`open`,{firstQuestion:n,draft:n}),I(e)}let o=await this.invoke(()=>a.prompt(me(r.selection,n),`queue`));return o.ok?(this.publish({...this.getSnapshot(),phase:Xe(a.getSnapshot()),draft:``,firstQuestion:void 0,error:void 0}),F(void 0)):(this.fail(o.error,`prompt`,{firstQuestion:n,draft:n}),I(o.error))}publishCreated(e,t){this.publish({...this.getSnapshot(),phase:`opening`,parentSessionId:e.parentSessionId,childSessionId:e.childSessionId,boundarySeq:e.boundarySeq,inheritedThroughSeq:e.inheritedThroughSeq,...e.modelSelection===void 0?{}:{modelSelection:e.modelSelection},firstQuestion:t,error:void 0})}async closeChild(e){if(this.closing!==void 0)return await this.closing;let t=this.performClose(e);this.closing=t;try{return await t}finally{this.closing===t&&(this.closing=void 0)}}async performClose(e){this.publish({...this.getSnapshot(),phase:`closing`,error:void 0});let t=await this.invoke(()=>this.remote.close({childSessionId:e}));return t.ok?(this.reset(),F(void 0)):(this.fail(t.error,`close`),I(t.error))}bindingTarget(){let e=this.getSnapshot(),t=this.lease?.binding;return t===void 0||e.childSessionId!==t.sessionId||![`ready`,`running`,`needs-input`,`needs-approval`].includes(e.phase)?I(L(`invalid_request`,`The Side Chat is not accepting messages.`,!1)):F(t)}attachLease(e,t){if(e.sessionId!==t||e.binding.sessionId!==t)throw e.release(),Error(`The opened Session does not match the Side Chat child.`);this.detachLease(),this.lease=e,this.childUnsubscribe=e.binding.subscribe(()=>{this.updateFromChild()}),this.updateFromChild()}detachLease(){this.childUnsubscribe?.(),this.childUnsubscribe=void 0,this.lease?.release(),this.lease=void 0}updateFromChild(){let e=this.getSnapshot(),t=this.lease?.binding.getSnapshot();if(!(t===void 0||[`closed`,`closing`,`error`].includes(e.phase))){if(t.status===`failed`){this.fail(L(`side_chat_prompt_failed`,`The Side Chat turn failed.`),`prompt`);return}this.publish({...e,phase:Xe(t),error:void 0})}}fail(e,t,n={}){this.publish({...this.getSnapshot(),...n,phase:`error`,error:{...e,operation:t}})}async invoke(e){try{return await e()}catch{return{ok:!1,error:L(`transport_error`,`The Side Chat connection was interrupted.`)}}}reset(){this.detachLease(),this.closeRequested=!1,this.publish(Ye)}publish(e){this.observable.publish(Object.freeze(e))}},Qe;function R(e,t,n){function r(n,r){if(n._zod||Object.defineProperty(n,"_zod",{value:{def:r,constr:o,traits:new Set},enumerable:!1}),n._zod.traits.has(e))return;n._zod.traits.add(e),t(n,r);let i=o.prototype,a=Object.keys(i);for(let e=0;e<a.length;e++){let t=a[e];t in n||(n[t]=i[t].bind(n))}}let i=n?.Parent??Object;class a extends i{}Object.defineProperty(a,"name",{value:e});function o(e){var t;let i=n?.Parent?new a:this;r(i,e),(t=i._zod).deferred??(t.deferred=[]);for(let e of i._zod.deferred)e();return i}return Object.defineProperty(o,"init",{value:r}),Object.defineProperty(o,Symbol.hasInstance,{value:t=>n?.Parent&&t instanceof n.Parent?!0:t?._zod?.traits?.has(e)}),Object.defineProperty(o,"name",{value:e}),o}var $e=class extends Error{constructor(){super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`)}},et=class extends Error{constructor(e){super(`Encountered unidirectional transform during encode: ${e}`),this.name=`ZodEncodeError`}};(Qe=globalThis).__zod_globalConfig??(Qe.__zod_globalConfig={});let tt=globalThis.__zod_globalConfig;function nt(e){return e&&Object.assign(tt,e),tt}function rt(e){let t=Object.values(e).filter(e=>typeof e==`number`);return Object.entries(e).filter(([e,n])=>t.indexOf(+e)===-1).map(([e,t])=>t)}function it(e,t){return typeof t==`bigint`?t.toString():t}function at(e){return{get value(){{let t=e();return Object.defineProperty(this,"value",{value:t}),t}}}}function ot(e){return e==null}function st(e){let t=+!!e.startsWith(`^`),n=e.endsWith(`$`)?e.length-1:e.length;return e.slice(t,n)}function ct(e,t){let n=e/t,r=Math.round(n),i=2**-52*Math.max(Math.abs(n),1);return Math.abs(n-r)<i?0:n-r}let lt=Symbol(`evaluating`);function z(e,t,n){let r;Object.defineProperty(e,t,{get(){if(r!==lt)return r===void 0&&(r=lt,r=n()),r},set(n){Object.defineProperty(e,t,{value:n})},configurable:!0})}function ut(e,t,n){Object.defineProperty(e,t,{value:n,writable:!0,enumerable:!0,configurable:!0})}function dt(...e){let t={};for(let n of e){let e=Object.getOwnPropertyDescriptors(n);Object.assign(t,e)}return Object.defineProperties({},t)}function ft(e){return JSON.stringify(e)}function pt(e){return e.toLowerCase().trim().replace(/[^\w\s-]/g,``).replace(/[\s_-]+/g,`-`).replace(/^-+|-+$/g,``)}let mt=`captureStackTrace`in Error?Error.captureStackTrace:(...e)=>{};function ht(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}let gt=at(()=>{if(tt.jitless||typeof navigator<`u`&&navigator?.userAgent?.includes(`Cloudflare`))return!1;try{return Function(``),!0}catch{return!1}});function _t(e){if(ht(e)===!1)return!1;let t=e.constructor;if(t===void 0||typeof t!=`function`)return!0;let n=t.prototype;return ht(n)!==!1&&Object.prototype.hasOwnProperty.call(n,`isPrototypeOf`)!==!1}function vt(e){return _t(e)?{...e}:Array.isArray(e)?[...e]:e instanceof Map?new Map(e):e instanceof Set?new Set(e):e}let yt=new Set([`string`,`number`,`symbol`]);function bt(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function xt(e,t,n){let r=new e._zod.constr(t??e._zod.def);return(!t||n?.parent)&&(r._zod.parent=e),r}function B(e){let t=e;if(!t)return{};if(typeof t==`string`)return{error:()=>t};if(t?.message!==void 0){if(t?.error!==void 0)throw Error("Cannot specify both `message` and `error` params");t.error=t.message}return delete t.message,typeof t.error==`string`?{...t,error:()=>t.error}:t}function St(e){return Object.keys(e).filter(t=>e[t]._zod.optin===`optional`&&e[t]._zod.optout===`optional`)}let Ct={safeint:[-(2**53-1),2**53-1],int32:[-2147483648,2147483647],uint32:[0,4294967295],float32:[-34028234663852886e22,34028234663852886e22],float64:[-Number.MAX_VALUE,Number.MAX_VALUE]};function wt(e,t){let n=e._zod.def,r=n.checks;if(r&&r.length>0)throw Error(`.pick() cannot be used on object schemas containing refinements`);return xt(e,dt(e._zod.def,{get shape(){let e={};for(let r in t){if(!(r in n.shape))throw Error(`Unrecognized key: "${r}"`);t[r]&&(e[r]=n.shape[r])}return ut(this,`shape`,e),e},checks:[]}))}function Tt(e,t){let n=e._zod.def,r=n.checks;if(r&&r.length>0)throw Error(`.omit() cannot be used on object schemas containing refinements`);return xt(e,dt(e._zod.def,{get shape(){let r={...e._zod.def.shape};for(let e in t){if(!(e in n.shape))throw Error(`Unrecognized key: "${e}"`);t[e]&&delete r[e]}return ut(this,`shape`,r),r},checks:[]}))}function Et(e,t){if(!_t(t))throw Error(`Invalid input to extend: expected a plain object`);let n=e._zod.def.checks;if(n&&n.length>0){let n=e._zod.def.shape;for(let e in t)if(Object.getOwnPropertyDescriptor(n,e)!==void 0)throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.")}return xt(e,dt(e._zod.def,{get shape(){let n={...e._zod.def.shape,...t};return ut(this,`shape`,n),n}}))}function Dt(e,t){if(!_t(t))throw Error(`Invalid input to safeExtend: expected a plain object`);return xt(e,dt(e._zod.def,{get shape(){let n={...e._zod.def.shape,...t};return ut(this,`shape`,n),n}}))}function Ot(e,t){if(e._zod.def.checks?.length)throw Error(`.merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.`);return xt(e,dt(e._zod.def,{get shape(){let n={...e._zod.def.shape,...t._zod.def.shape};return ut(this,`shape`,n),n},get catchall(){return t._zod.def.catchall},checks:t._zod.def.checks??[]}))}function kt(e,t,n){let r=t._zod.def.checks;if(r&&r.length>0)throw Error(`.partial() cannot be used on object schemas containing refinements`);return xt(t,dt(t._zod.def,{get shape(){let r=t._zod.def.shape,i={...r};if(n)for(let t in n){if(!(t in r))throw Error(`Unrecognized key: "${t}"`);n[t]&&(i[t]=e?new e({type:`optional`,innerType:r[t]}):r[t])}else for(let t in r)i[t]=e?new e({type:`optional`,innerType:r[t]}):r[t];return ut(this,`shape`,i),i},checks:[]}))}function At(e,t,n){return xt(t,dt(t._zod.def,{get shape(){let r=t._zod.def.shape,i={...r};if(n)for(let t in n){if(!(t in i))throw Error(`Unrecognized key: "${t}"`);n[t]&&(i[t]=new e({type:`nonoptional`,innerType:r[t]}))}else for(let t in r)i[t]=new e({type:`nonoptional`,innerType:r[t]});return ut(this,`shape`,i),i}}))}function jt(e,t=0){if(e.aborted===!0)return!0;for(let n=t;n<e.issues.length;n++)if(e.issues[n]?.continue!==!0)return!0;return!1}function Mt(e,t=0){if(e.aborted===!0)return!0;for(let n=t;n<e.issues.length;n++)if(e.issues[n]?.continue===!1)return!0;return!1}function Nt(e,t){return t.map(t=>{var n;return(n=t).path??(n.path=[]),t.path.unshift(e),t})}function Pt(e){return typeof e==`string`?e:e?.message}function Ft(e,t,n){let r=e.message?e.message:Pt(e.inst?._zod.def?.error?.(e))??Pt(t?.error?.(e))??Pt(n.customError?.(e))??Pt(n.localeError?.(e))??`Invalid input`,{inst:i,continue:a,input:o,...s}=e;return s.path??=[],s.message=r,t?.reportInput&&(s.input=o),s}function It(e){return Array.isArray(e)?`array`:typeof e==`string`?`string`:`unknown`}function Lt(...e){let[t,n,r]=e;return typeof t==`string`?{message:t,code:`custom`,input:n,inst:r}:{...t}}let Rt=(e,t)=>{e.name=`$ZodError`,Object.defineProperty(e,"_zod",{value:e._zod,enumerable:!1}),Object.defineProperty(e,"issues",{value:t,enumerable:!1}),e.message=JSON.stringify(t,it,2),Object.defineProperty(e,"toString",{value:()=>e.message,enumerable:!1})},zt=R(`$ZodError`,Rt),Bt=R(`$ZodError`,Rt,{Parent:Error});function Vt(e,t=e=>e.message){let n={},r=[];for(let i of e.issues)i.path.length>0?(n[i.path[0]]=n[i.path[0]]||[],n[i.path[0]].push(t(i))):r.push(t(i));return{formErrors:r,fieldErrors:n}}function Ht(e,t=e=>e.message){let n={_errors:[]},r=(e,i=[])=>{for(let a of e.issues)if(a.code===`invalid_union`&&a.errors.length)a.errors.map(e=>r({issues:e},[...i,...a.path]));else if(a.code===`invalid_key`)r({issues:a.issues},[...i,...a.path]);else if(a.code===`invalid_element`)r({issues:a.issues},[...i,...a.path]);else{let e=[...i,...a.path];if(e.length===0)n._errors.push(t(a));else{let r=n,i=0;for(;i<e.length;){let n=e[i];i===e.length-1?(r[n]=r[n]||{_errors:[]},r[n]._errors.push(t(a))):r[n]=r[n]||{_errors:[]},r=r[n],i++}}}};return r(e),n}let Ut=e=>(t,n,r,i)=>{let a=r?{...r,async:!1}:{async:!1},o=t._zod.run({value:n,issues:[]},a);if(o instanceof Promise)throw new $e;if(o.issues.length){let t=new((i?.Err)??e)(o.issues.map(e=>Ft(e,a,nt())));throw mt(t,i?.callee),t}return o.value},Wt=e=>async(t,n,r,i)=>{let a=r?{...r,async:!0}:{async:!0},o=t._zod.run({value:n,issues:[]},a);if(o instanceof Promise&&(o=await o),o.issues.length){let t=new((i?.Err)??e)(o.issues.map(e=>Ft(e,a,nt())));throw mt(t,i?.callee),t}return o.value},Gt=e=>(t,n,r)=>{let i=r?{...r,async:!1}:{async:!1},a=t._zod.run({value:n,issues:[]},i);if(a instanceof Promise)throw new $e;return a.issues.length?{success:!1,error:new(e??zt)(a.issues.map(e=>Ft(e,i,nt())))}:{success:!0,data:a.value}},Kt=Gt(Bt),qt=e=>async(t,n,r)=>{let i=r?{...r,async:!0}:{async:!0},a=t._zod.run({value:n,issues:[]},i);return a instanceof Promise&&(a=await a),a.issues.length?{success:!1,error:new e(a.issues.map(e=>Ft(e,i,nt())))}:{success:!0,data:a.value}},Jt=qt(Bt),Yt=e=>(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return Ut(e)(t,n,i)},Xt=e=>(t,n,r)=>Ut(e)(t,n,r),Zt=e=>async(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return Wt(e)(t,n,i)},Qt=e=>async(t,n,r)=>Wt(e)(t,n,r),$t=e=>(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return Gt(e)(t,n,i)},en=e=>(t,n,r)=>Gt(e)(t,n,r),tn=e=>async(t,n,r)=>{let i=r?{...r,direction:`backward`}:{direction:`backward`};return qt(e)(t,n,i)},nn=e=>async(t,n,r)=>qt(e)(t,n,r),rn=/^[cC][0-9a-z]{6,}$/,an=/^[0-9a-z]+$/,on=/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,sn=/^[0-9a-vA-V]{20}$/,cn=/^[A-Za-z0-9]{27}$/,ln=/^[a-zA-Z0-9_-]{21}$/,un=/^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,dn=/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,fn=e=>e?RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`):/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,pn=/^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;function mn(){return RegExp(`^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`,`u`)}let hn=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,gn=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,_n=/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,vn=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,yn=/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,bn=/^[A-Za-z0-9_-]*$/,xn=/^https?$/,Sn=/^\+[1-9]\d{6,14}$/,Cn=`(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`,wn=RegExp(`^${Cn}$`);function Tn(e){let t=`(?:[01]\\d|2[0-3]):[0-5]\\d`;return typeof e.precision==`number`?e.precision===-1?`${t}`:e.precision===0?`${t}:[0-5]\\d`:`${t}:[0-5]\\d\\.\\d{${e.precision}}`:`${t}(?::[0-5]\\d(?:\\.\\d+)?)?`}function En(e){return RegExp(`^${Tn(e)}$`)}function Dn(e){let t=Tn({precision:e.precision}),n=[`Z`];e.local&&n.push(``),e.offset&&n.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);let r=`${t}(?:${n.join(`|`)})`;return RegExp(`^${Cn}T(?:${r})$`)}let On=e=>{let t=e?`[\\s\\S]{${e?.minimum??0},${e?.maximum??``}}`:`[\\s\\S]*`;return RegExp(`^${t}$`)},kn=/^-?\d+$/,An=/^-?\d+(?:\.\d+)?$/,jn=/^(?:true|false)$/i,Mn=/^[^A-Z]*$/,Nn=/^[^a-z]*$/,V=R(`$ZodCheck`,(e,t)=>{var n;e._zod??={},e._zod.def=t,(n=e._zod).onattach??(n.onattach=[])}),Pn={number:`number`,bigint:`bigint`,object:`date`},Fn=R(`$ZodCheckLessThan`,(e,t)=>{V.init(e,t);let n=Pn[typeof t.value];e._zod.onattach.push(e=>{let n=e._zod.bag,r=(t.inclusive?n.maximum:n.exclusiveMaximum)??1/0;t.value<r&&(t.inclusive?n.maximum=t.value:n.exclusiveMaximum=t.value)}),e._zod.check=r=>{(t.inclusive?r.value<=t.value:r.value<t.value)||r.issues.push({origin:n,code:`too_big`,maximum:typeof t.value==`object`?t.value.getTime():t.value,input:r.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),In=R(`$ZodCheckGreaterThan`,(e,t)=>{V.init(e,t);let n=Pn[typeof t.value];e._zod.onattach.push(e=>{let n=e._zod.bag,r=(t.inclusive?n.minimum:n.exclusiveMinimum)??-1/0;t.value>r&&(t.inclusive?n.minimum=t.value:n.exclusiveMinimum=t.value)}),e._zod.check=r=>{(t.inclusive?r.value>=t.value:r.value>t.value)||r.issues.push({origin:n,code:`too_small`,minimum:typeof t.value==`object`?t.value.getTime():t.value,input:r.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),Ln=R(`$ZodCheckMultipleOf`,(e,t)=>{V.init(e,t),e._zod.onattach.push(e=>{var n;(n=e._zod.bag).multipleOf??(n.multipleOf=t.value)}),e._zod.check=n=>{if(typeof n.value!=typeof t.value)throw Error(`Cannot mix number and bigint in multiple_of check.`);(typeof n.value==`bigint`?n.value%t.value===BigInt(0):ct(n.value,t.value)===0)||n.issues.push({origin:typeof n.value,code:`not_multiple_of`,divisor:t.value,input:n.value,inst:e,continue:!t.abort})}}),Rn=R(`$ZodCheckNumberFormat`,(e,t)=>{V.init(e,t),t.format=t.format||`float64`;let n=t.format?.includes(`int`),r=n?`int`:`number`,[i,a]=Ct[t.format];e._zod.onattach.push(e=>{let r=e._zod.bag;r.format=t.format,r.minimum=i,r.maximum=a,n&&(r.pattern=kn)}),e._zod.check=o=>{let s=o.value;if(n){if(!Number.isInteger(s)){o.issues.push({expected:r,format:t.format,code:`invalid_type`,continue:!1,input:s,inst:e});return}if(!Number.isSafeInteger(s)){s>0?o.issues.push({input:s,code:`too_big`,maximum:2**53-1,note:`Integers must be within the safe integer range.`,inst:e,origin:r,inclusive:!0,continue:!t.abort}):o.issues.push({input:s,code:`too_small`,minimum:-(2**53-1),note:`Integers must be within the safe integer range.`,inst:e,origin:r,inclusive:!0,continue:!t.abort});return}}s<i&&o.issues.push({origin:`number`,input:s,code:`too_small`,minimum:i,inclusive:!0,inst:e,continue:!t.abort}),s>a&&o.issues.push({origin:`number`,input:s,code:`too_big`,maximum:a,inclusive:!0,inst:e,continue:!t.abort})}}),zn=R(`$ZodCheckMaxLength`,(e,t)=>{var n;V.init(e,t),(n=e._zod.def).when??(n.when=e=>{let t=e.value;return!ot(t)&&t.length!==void 0}),e._zod.onattach.push(e=>{let n=e._zod.bag.maximum??1/0;t.maximum<n&&(e._zod.bag.maximum=t.maximum)}),e._zod.check=n=>{let r=n.value;if(r.length<=t.maximum)return;let i=It(r);n.issues.push({origin:i,code:`too_big`,maximum:t.maximum,inclusive:!0,input:r,inst:e,continue:!t.abort})}}),Bn=R(`$ZodCheckMinLength`,(e,t)=>{var n;V.init(e,t),(n=e._zod.def).when??(n.when=e=>{let t=e.value;return!ot(t)&&t.length!==void 0}),e._zod.onattach.push(e=>{let n=e._zod.bag.minimum??-1/0;t.minimum>n&&(e._zod.bag.minimum=t.minimum)}),e._zod.check=n=>{let r=n.value;if(r.length>=t.minimum)return;let i=It(r);n.issues.push({origin:i,code:`too_small`,minimum:t.minimum,inclusive:!0,input:r,inst:e,continue:!t.abort})}}),Vn=R(`$ZodCheckLengthEquals`,(e,t)=>{var n;V.init(e,t),(n=e._zod.def).when??(n.when=e=>{let t=e.value;return!ot(t)&&t.length!==void 0}),e._zod.onattach.push(e=>{let n=e._zod.bag;n.minimum=t.length,n.maximum=t.length,n.length=t.length}),e._zod.check=n=>{let r=n.value,i=r.length;if(i===t.length)return;let a=It(r),o=i>t.length;n.issues.push({origin:a,...o?{code:`too_big`,maximum:t.length}:{code:`too_small`,minimum:t.length},inclusive:!0,exact:!0,input:n.value,inst:e,continue:!t.abort})}}),Hn=R(`$ZodCheckStringFormat`,(e,t)=>{var n,r;V.init(e,t),e._zod.onattach.push(e=>{let n=e._zod.bag;n.format=t.format,t.pattern&&(n.patterns??=new Set,n.patterns.add(t.pattern))}),t.pattern?(n=e._zod).check??(n.check=n=>{t.pattern.lastIndex=0,!t.pattern.test(n.value)&&n.issues.push({origin:`string`,code:`invalid_format`,format:t.format,input:n.value,...t.pattern?{pattern:t.pattern.toString()}:{},inst:e,continue:!t.abort})}):(r=e._zod).check??(r.check=()=>{})}),Un=R(`$ZodCheckRegex`,(e,t)=>{Hn.init(e,t),e._zod.check=n=>{t.pattern.lastIndex=0,!t.pattern.test(n.value)&&n.issues.push({origin:`string`,code:`invalid_format`,format:`regex`,input:n.value,pattern:t.pattern.toString(),inst:e,continue:!t.abort})}}),Wn=R(`$ZodCheckLowerCase`,(e,t)=>{t.pattern??=Mn,Hn.init(e,t)}),Gn=R(`$ZodCheckUpperCase`,(e,t)=>{t.pattern??=Nn,Hn.init(e,t)}),Kn=R(`$ZodCheckIncludes`,(e,t)=>{V.init(e,t);let n=bt(t.includes),r=new RegExp(typeof t.position==`number`?`^.{${t.position}}${n}`:n);t.pattern=r,e._zod.onattach.push(e=>{let t=e._zod.bag;t.patterns??=new Set,t.patterns.add(r)}),e._zod.check=n=>{n.value.includes(t.includes,t.position)||n.issues.push({origin:`string`,code:`invalid_format`,format:`includes`,includes:t.includes,input:n.value,inst:e,continue:!t.abort})}}),qn=R(`$ZodCheckStartsWith`,(e,t)=>{V.init(e,t);let n=RegExp(`^${bt(t.prefix)}.*`);t.pattern??=n,e._zod.onattach.push(e=>{let t=e._zod.bag;t.patterns??=new Set,t.patterns.add(n)}),e._zod.check=n=>{n.value.startsWith(t.prefix)||n.issues.push({origin:`string`,code:`invalid_format`,format:`starts_with`,prefix:t.prefix,input:n.value,inst:e,continue:!t.abort})}}),Jn=R(`$ZodCheckEndsWith`,(e,t)=>{V.init(e,t);let n=RegExp(`.*${bt(t.suffix)}$`);t.pattern??=n,e._zod.onattach.push(e=>{let t=e._zod.bag;t.patterns??=new Set,t.patterns.add(n)}),e._zod.check=n=>{n.value.endsWith(t.suffix)||n.issues.push({origin:`string`,code:`invalid_format`,format:`ends_with`,suffix:t.suffix,input:n.value,inst:e,continue:!t.abort})}}),Yn=R(`$ZodCheckOverwrite`,(e,t)=>{V.init(e,t),e._zod.check=e=>{e.value=t.tx(e.value)}});var Xn=class{constructor(e=[]){this.content=[],this.indent=0,this&&(this.args=e)}indented(e){this.indent+=1,e(this),--this.indent}write(e){if(typeof e==`function`){e(this,{execution:`sync`}),e(this,{execution:`async`});return}let t=e.split(`
`).filter(e=>e),n=Math.min(...t.map(e=>e.length-e.trimStart().length)),r=t.map(e=>e.slice(n)).map(e=>` `.repeat(this.indent*2)+e);for(let e of r)this.content.push(e)}compile(){let e=Function,t=this?.args,n=[...(this?.content??[``]).map(e=>`  ${e}`)];return new e(...t,n.join(`
`))}};let Zn={major:4,minor:4,patch:3},H=R(`$ZodType`,(e,t)=>{var n;e??={},e._zod.def=t,e._zod.bag=e._zod.bag||{},e._zod.version=Zn;let r=[...e._zod.def.checks??[]];e._zod.traits.has(`$ZodCheck`)&&r.unshift(e);for(let t of r)for(let n of t._zod.onattach)n(e);if(r.length===0)(n=e._zod).deferred??(n.deferred=[]),e._zod.deferred?.push(()=>{e._zod.run=e._zod.parse});else{let t=(e,t,n)=>{let r=jt(e),i;for(let a of t){if(a._zod.def.when){if(Mt(e)||!a._zod.def.when(e))continue}else if(r)continue;let t=e.issues.length,o=a._zod.check(e);if(o instanceof Promise&&n?.async===!1)throw new $e;if(i||o instanceof Promise)i=(i??Promise.resolve()).then(async()=>{await o,e.issues.length!==t&&(r||=jt(e,t))});else{if(e.issues.length===t)continue;r||=jt(e,t)}}return i?i.then(()=>e):e},n=(n,i,a)=>{if(jt(n))return n.aborted=!0,n;let o=t(i,r,a);if(o instanceof Promise){if(a.async===!1)throw new $e;return o.then(t=>e._zod.parse(t,a))}return e._zod.parse(o,a)};e._zod.run=(i,a)=>{if(a.skipChecks)return e._zod.parse(i,a);if(a.direction===`backward`){let t=e._zod.parse({value:i.value,issues:[]},{...a,skipChecks:!0});return t instanceof Promise?t.then(e=>n(e,i,a)):n(t,i,a)}let o=e._zod.parse(i,a);if(o instanceof Promise){if(a.async===!1)throw new $e;return o.then(e=>t(e,r,a))}return t(o,r,a)}}z(e,`~standard`,()=>({validate:t=>{try{let n=Kt(e,t);return n.success?{value:n.data}:{issues:n.error?.issues}}catch{return Jt(e,t).then(e=>e.success?{value:e.data}:{issues:e.error?.issues})}},vendor:`zod`,version:1}))}),Qn=R(`$ZodString`,(e,t)=>{H.init(e,t),e._zod.pattern=[...e?._zod.bag?.patterns??[]].pop()??On(e._zod.bag),e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=String(n.value)}catch{}return typeof n.value==`string`||n.issues.push({expected:`string`,code:`invalid_type`,input:n.value,inst:e}),n}}),U=R(`$ZodStringFormat`,(e,t)=>{Hn.init(e,t),Qn.init(e,t)}),$n=R(`$ZodGUID`,(e,t)=>{t.pattern??=dn,U.init(e,t)}),er=R(`$ZodUUID`,(e,t)=>{if(t.version){let e={v1:1,v2:2,v3:3,v4:4,v5:5,v6:6,v7:7,v8:8}[t.version];if(e===void 0)throw Error(`Invalid UUID version: "${t.version}"`);t.pattern??=fn(e)}else t.pattern??=fn();U.init(e,t)}),tr=R(`$ZodEmail`,(e,t)=>{t.pattern??=pn,U.init(e,t)}),nr=R(`$ZodURL`,(e,t)=>{U.init(e,t),e._zod.check=n=>{try{let r=n.value.trim();if(!t.normalize&&t.protocol?.source===xn.source&&!/^https?:\/\//i.test(r)){n.issues.push({code:`invalid_format`,format:`url`,note:`Invalid URL format`,input:n.value,inst:e,continue:!t.abort});return}let i=new URL(r);t.hostname&&(t.hostname.lastIndex=0,t.hostname.test(i.hostname)||n.issues.push({code:`invalid_format`,format:`url`,note:`Invalid hostname`,pattern:t.hostname.source,input:n.value,inst:e,continue:!t.abort})),t.protocol&&(t.protocol.lastIndex=0,t.protocol.test(i.protocol.endsWith(`:`)?i.protocol.slice(0,-1):i.protocol)||n.issues.push({code:`invalid_format`,format:`url`,note:`Invalid protocol`,pattern:t.protocol.source,input:n.value,inst:e,continue:!t.abort})),n.value=t.normalize?i.href:r;return}catch{n.issues.push({code:`invalid_format`,format:`url`,input:n.value,inst:e,continue:!t.abort})}}}),rr=R(`$ZodEmoji`,(e,t)=>{t.pattern??=mn(),U.init(e,t)}),ir=R(`$ZodNanoID`,(e,t)=>{t.pattern??=ln,U.init(e,t)}),ar=R(`$ZodCUID`,(e,t)=>{t.pattern??=rn,U.init(e,t)}),or=R(`$ZodCUID2`,(e,t)=>{t.pattern??=an,U.init(e,t)}),sr=R(`$ZodULID`,(e,t)=>{t.pattern??=on,U.init(e,t)}),cr=R(`$ZodXID`,(e,t)=>{t.pattern??=sn,U.init(e,t)}),lr=R(`$ZodKSUID`,(e,t)=>{t.pattern??=cn,U.init(e,t)}),ur=R(`$ZodISODateTime`,(e,t)=>{t.pattern??=Dn(t),U.init(e,t)}),dr=R(`$ZodISODate`,(e,t)=>{t.pattern??=wn,U.init(e,t)}),fr=R(`$ZodISOTime`,(e,t)=>{t.pattern??=En(t),U.init(e,t)}),pr=R(`$ZodISODuration`,(e,t)=>{t.pattern??=un,U.init(e,t)}),mr=R(`$ZodIPv4`,(e,t)=>{t.pattern??=hn,U.init(e,t),e._zod.bag.format=`ipv4`}),hr=R(`$ZodIPv6`,(e,t)=>{t.pattern??=gn,U.init(e,t),e._zod.bag.format=`ipv6`,e._zod.check=n=>{try{new URL(`http://[${n.value}]`)}catch{n.issues.push({code:`invalid_format`,format:`ipv6`,input:n.value,inst:e,continue:!t.abort})}}}),gr=R(`$ZodCIDRv4`,(e,t)=>{t.pattern??=_n,U.init(e,t)}),_r=R(`$ZodCIDRv6`,(e,t)=>{t.pattern??=vn,U.init(e,t),e._zod.check=n=>{let r=n.value.split(`/`);try{if(r.length!==2)throw Error();let[e,t]=r;if(!t)throw Error();let n=Number(t);if(`${n}`!==t||n<0||n>128)throw Error();new URL(`http://[${e}]`)}catch{n.issues.push({code:`invalid_format`,format:`cidrv6`,input:n.value,inst:e,continue:!t.abort})}}});function vr(e){if(e===``)return!0;if(/\s/.test(e)||e.length%4!=0)return!1;try{return atob(e),!0}catch{return!1}}let yr=R(`$ZodBase64`,(e,t)=>{t.pattern??=yn,U.init(e,t),e._zod.bag.contentEncoding=`base64`,e._zod.check=n=>{vr(n.value)||n.issues.push({code:`invalid_format`,format:`base64`,input:n.value,inst:e,continue:!t.abort})}});function br(e){if(!bn.test(e))return!1;let t=e.replace(/[-_]/g,e=>e===`-`?`+`:`/`);return vr(t.padEnd(Math.ceil(t.length/4)*4,`=`))}let xr=R(`$ZodBase64URL`,(e,t)=>{t.pattern??=bn,U.init(e,t),e._zod.bag.contentEncoding=`base64url`,e._zod.check=n=>{br(n.value)||n.issues.push({code:`invalid_format`,format:`base64url`,input:n.value,inst:e,continue:!t.abort})}}),Sr=R(`$ZodE164`,(e,t)=>{t.pattern??=Sn,U.init(e,t)});function Cr(e,t=null){try{let n=e.split(`.`);if(n.length!==3)return!1;let[r]=n;if(!r)return!1;let i=JSON.parse(atob(r));return!(`typ`in i&&i?.typ!==`JWT`||!i.alg||t&&(!(`alg`in i)||i.alg!==t))}catch{return!1}}let wr=R(`$ZodJWT`,(e,t)=>{U.init(e,t),e._zod.check=n=>{Cr(n.value,t.alg)||n.issues.push({code:`invalid_format`,format:`jwt`,input:n.value,inst:e,continue:!t.abort})}}),Tr=R(`$ZodNumber`,(e,t)=>{H.init(e,t),e._zod.pattern=e._zod.bag.pattern??An,e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=Number(n.value)}catch{}let i=n.value;if(typeof i==`number`&&!Number.isNaN(i)&&Number.isFinite(i))return n;let a=typeof i==`number`?Number.isNaN(i)?`NaN`:Number.isFinite(i)?void 0:`Infinity`:void 0;return n.issues.push({expected:`number`,code:`invalid_type`,input:i,inst:e,...a?{received:a}:{}}),n}}),Er=R(`$ZodNumberFormat`,(e,t)=>{Rn.init(e,t),Tr.init(e,t)}),Dr=R(`$ZodBoolean`,(e,t)=>{H.init(e,t),e._zod.pattern=jn,e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=!!n.value}catch{}let i=n.value;return typeof i==`boolean`||n.issues.push({expected:`boolean`,code:`invalid_type`,input:i,inst:e}),n}}),Or=R(`$ZodUnknown`,(e,t)=>{H.init(e,t),e._zod.parse=e=>e}),kr=R(`$ZodNever`,(e,t)=>{H.init(e,t),e._zod.parse=(t,n)=>(t.issues.push({expected:`never`,code:`invalid_type`,input:t.value,inst:e}),t)});function Ar(e,t,n){e.issues.length&&t.issues.push(...Nt(n,e.issues)),t.value[n]=e.value}let jr=R(`$ZodArray`,(e,t)=>{H.init(e,t),e._zod.parse=(n,r)=>{let i=n.value;if(!Array.isArray(i))return n.issues.push({expected:`array`,code:`invalid_type`,input:i,inst:e}),n;n.value=Array(i.length);let a=[];for(let e=0;e<i.length;e++){let o=i[e],s=t.element._zod.run({value:o,issues:[]},r);s instanceof Promise?a.push(s.then(t=>Ar(t,n,e))):Ar(s,n,e)}return a.length?Promise.all(a).then(()=>n):n}});function Mr(e,t,n,r,i,a){let o=n in r;if(e.issues.length){if(i&&a&&!o)return;t.issues.push(...Nt(n,e.issues))}if(!o&&!i){e.issues.length||t.issues.push({code:`invalid_type`,expected:`nonoptional`,input:void 0,path:[n]});return}e.value===void 0?o&&(t.value[n]=void 0):t.value[n]=e.value}function Nr(e){let t=Object.keys(e.shape);for(let n of t)if(!e.shape?.[n]?._zod?.traits?.has(`$ZodType`))throw Error(`Invalid element at key "${n}": expected a Zod schema`);let n=St(e.shape);return{...e,keys:t,keySet:new Set(t),numKeys:t.length,optionalKeys:new Set(n)}}function Pr(e,t,n,r,i,a){let o=[],s=i.keySet,c=i.catchall._zod,l=c.def.type,u=c.optin===`optional`,d=c.optout===`optional`;for(let i in t){if(i===`__proto__`||s.has(i))continue;if(l===`never`){o.push(i);continue}let a=c.run({value:t[i],issues:[]},r);a instanceof Promise?e.push(a.then(e=>Mr(e,n,i,t,u,d))):Mr(a,n,i,t,u,d)}return o.length&&n.issues.push({code:`unrecognized_keys`,keys:o,input:t,inst:a}),e.length?Promise.all(e).then(()=>n):n}let Fr=R(`$ZodObject`,(e,t)=>{if(H.init(e,t),!Object.getOwnPropertyDescriptor(t,`shape`)?.get){let e=t.shape;Object.defineProperty(t,"shape",{get:()=>{let n={...e};return Object.defineProperty(t,"shape",{value:n}),n}})}let n=at(()=>Nr(t));z(e._zod,`propValues`,()=>{let e=t.shape,n={};for(let t in e){let r=e[t]._zod;if(r.values){n[t]??(n[t]=new Set);for(let e of r.values)n[t].add(e)}}return n});let r=ht,i=t.catchall,a;e._zod.parse=(t,o)=>{a??=n.value;let s=t.value;if(!r(s))return t.issues.push({expected:`object`,code:`invalid_type`,input:s,inst:e}),t;t.value={};let c=[],l=a.shape;for(let e of a.keys){let n=l[e],r=n._zod.optin===`optional`,i=n._zod.optout===`optional`,a=n._zod.run({value:s[e],issues:[]},o);a instanceof Promise?c.push(a.then(n=>Mr(n,t,e,s,r,i))):Mr(a,t,e,s,r,i)}return i?Pr(c,s,t,o,n.value,e):c.length?Promise.all(c).then(()=>t):t}}),Ir=R(`$ZodObjectJIT`,(e,t)=>{Fr.init(e,t);let n=e._zod.parse,r=at(()=>Nr(t)),i=e=>{let t=new Xn([`shape`,`payload`,`ctx`]),n=r.value,i=e=>{let t=ft(e);return`shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`};t.write(`const input = payload.value;`);let a=Object.create(null),o=0;for(let e of n.keys)a[e]=`key_${o++}`;t.write(`const newResult = {};`);for(let r of n.keys){let n=a[r],o=ft(r),s=e[r],c=s?._zod?.optin===`optional`,l=s?._zod?.optout===`optional`;t.write(`const ${n} = ${i(r)};`),c&&l?t.write(`
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

      `)}t.write(`payload.value = newResult;`),t.write(`return payload;`);let s=t.compile();return(t,n)=>s(e,t,n)},a,o=ht,s=!tt.jitless,c=s&&gt.value,l=t.catchall,u;e._zod.parse=(d,f)=>{u??=r.value;let p=d.value;return o(p)?s&&c&&f?.async===!1&&f.jitless!==!0?(a||=i(t.shape),d=a(d,f),l?Pr([],p,d,f,u,e):d):n(d,f):(d.issues.push({expected:`object`,code:`invalid_type`,input:p,inst:e}),d)}});function Lr(e,t,n,r){for(let n of e)if(n.issues.length===0)return t.value=n.value,t;let i=e.filter(e=>!jt(e));return i.length===1?(t.value=i[0].value,i[0]):(t.issues.push({code:`invalid_union`,input:t.value,inst:n,errors:e.map(e=>e.issues.map(e=>Ft(e,r,nt())))}),t)}let Rr=R(`$ZodUnion`,(e,t)=>{H.init(e,t),z(e._zod,`optin`,()=>t.options.some(e=>e._zod.optin===`optional`)?`optional`:void 0),z(e._zod,`optout`,()=>t.options.some(e=>e._zod.optout===`optional`)?`optional`:void 0),z(e._zod,`values`,()=>{if(t.options.every(e=>e._zod.values))return new Set(t.options.flatMap(e=>Array.from(e._zod.values)))}),z(e._zod,`pattern`,()=>{if(t.options.every(e=>e._zod.pattern)){let e=t.options.map(e=>e._zod.pattern);return RegExp(`^(${e.map(e=>st(e.source)).join(`|`)})$`)}});let n=t.options.length===1?t.options[0]._zod.run:null;e._zod.parse=(r,i)=>{if(n)return n(r,i);let a=!1,o=[];for(let e of t.options){let t=e._zod.run({value:r.value,issues:[]},i);if(t instanceof Promise)o.push(t),a=!0;else{if(t.issues.length===0)return t;o.push(t)}}return a?Promise.all(o).then(t=>Lr(t,r,e,i)):Lr(o,r,e,i)}}),zr=R(`$ZodDiscriminatedUnion`,(e,t)=>{t.inclusive=!1,Rr.init(e,t);let n=e._zod.parse;z(e._zod,`propValues`,()=>{let e={};for(let n of t.options){let r=n._zod.propValues;if(!r||Object.keys(r).length===0)throw Error(`Invalid discriminated union option at index "${t.options.indexOf(n)}"`);for(let[t,n]of Object.entries(r)){e[t]||(e[t]=new Set);for(let r of n)e[t].add(r)}}return e});let r=at(()=>{let e=t.options,n=new Map;for(let r of e){let e=r._zod.propValues?.[t.discriminator];if(!e||e.size===0)throw Error(`Invalid discriminated union option at index "${t.options.indexOf(r)}"`);for(let t of e){if(n.has(t))throw Error(`Duplicate discriminator value "${String(t)}"`);n.set(t,r)}}return n});e._zod.parse=(i,a)=>{let o=i.value;if(!ht(o))return i.issues.push({code:`invalid_type`,expected:`object`,input:o,inst:e}),i;let s=r.value.get(o?.[t.discriminator]);return s?s._zod.run(i,a):t.unionFallback||a.direction===`backward`?n(i,a):(i.issues.push({code:`invalid_union`,errors:[],note:`No matching discriminator`,discriminator:t.discriminator,options:Array.from(r.value.keys()),input:o,path:[t.discriminator],inst:e}),i)}}),Br=R(`$ZodIntersection`,(e,t)=>{H.init(e,t),e._zod.parse=(e,n)=>{let r=e.value,i=t.left._zod.run({value:r,issues:[]},n),a=t.right._zod.run({value:r,issues:[]},n);return i instanceof Promise||a instanceof Promise?Promise.all([i,a]).then(([t,n])=>Hr(e,t,n)):Hr(e,i,a)}});function Vr(e,t){if(e===t||e instanceof Date&&t instanceof Date&&+e==+t)return{valid:!0,data:e};if(_t(e)&&_t(t)){let n=Object.keys(t),r=Object.keys(e).filter(e=>n.indexOf(e)!==-1),i={...e,...t};for(let n of r){let r=Vr(e[n],t[n]);if(!r.valid)return{valid:!1,mergeErrorPath:[n,...r.mergeErrorPath]};i[n]=r.data}return{valid:!0,data:i}}if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return{valid:!1,mergeErrorPath:[]};let n=[];for(let r=0;r<e.length;r++){let i=e[r],a=t[r],o=Vr(i,a);if(!o.valid)return{valid:!1,mergeErrorPath:[r,...o.mergeErrorPath]};n.push(o.data)}return{valid:!0,data:n}}return{valid:!1,mergeErrorPath:[]}}function Hr(e,t,n){let r=new Map,i;for(let n of t.issues)if(n.code===`unrecognized_keys`){i??=n;for(let e of n.keys)r.has(e)||r.set(e,{}),r.get(e).l=!0}else e.issues.push(n);for(let t of n.issues)if(t.code===`unrecognized_keys`)for(let e of t.keys)r.has(e)||r.set(e,{}),r.get(e).r=!0;else e.issues.push(t);let a=[...r].filter(([,e])=>e.l&&e.r).map(([e])=>e);if(a.length&&i&&e.issues.push({...i,keys:a}),jt(e))return e;let o=Vr(t.value,n.value);if(!o.valid)throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);return e.value=o.data,e}let Ur=R(`$ZodEnum`,(e,t)=>{H.init(e,t);let n=rt(t.entries),r=new Set(n);e._zod.values=r,e._zod.pattern=RegExp(`^(${n.filter(e=>yt.has(typeof e)).map(e=>typeof e==`string`?bt(e):e.toString()).join(`|`)})$`),e._zod.parse=(t,i)=>{let a=t.value;return r.has(a)||t.issues.push({code:`invalid_value`,values:n,input:a,inst:e}),t}}),Wr=R(`$ZodLiteral`,(e,t)=>{if(H.init(e,t),t.values.length===0)throw Error(`Cannot create literal schema with no valid values`);let n=new Set(t.values);e._zod.values=n,e._zod.pattern=RegExp(`^(${t.values.map(e=>typeof e==`string`?bt(e):e?bt(e.toString()):String(e)).join(`|`)})$`),e._zod.parse=(r,i)=>{let a=r.value;return n.has(a)||r.issues.push({code:`invalid_value`,values:t.values,input:a,inst:e}),r}}),Gr=R(`$ZodTransform`,(e,t)=>{H.init(e,t),e._zod.optin=`optional`,e._zod.parse=(n,r)=>{if(r.direction===`backward`)throw new et(e.constructor.name);let i=t.transform(n.value,n);if(r.async)return(i instanceof Promise?i:Promise.resolve(i)).then(e=>(n.value=e,n.fallback=!0,n));if(i instanceof Promise)throw new $e;return n.value=i,n.fallback=!0,n}});function Kr(e,t){return t===void 0&&(e.issues.length||e.fallback)?{issues:[],value:void 0}:e}let qr=R(`$ZodOptional`,(e,t)=>{H.init(e,t),e._zod.optin=`optional`,e._zod.optout=`optional`,z(e._zod,`values`,()=>t.innerType._zod.values?new Set([...t.innerType._zod.values,void 0]):void 0),z(e._zod,`pattern`,()=>{let e=t.innerType._zod.pattern;return e?RegExp(`^(${st(e.source)})?$`):void 0}),e._zod.parse=(e,n)=>{if(t.innerType._zod.optin===`optional`){let r=e.value,i=t.innerType._zod.run(e,n);return i instanceof Promise?i.then(e=>Kr(e,r)):Kr(i,r)}return e.value===void 0?e:t.innerType._zod.run(e,n)}}),Jr=R(`$ZodExactOptional`,(e,t)=>{qr.init(e,t),z(e._zod,`values`,()=>t.innerType._zod.values),z(e._zod,`pattern`,()=>t.innerType._zod.pattern),e._zod.parse=(e,n)=>t.innerType._zod.run(e,n)}),Yr=R(`$ZodNullable`,(e,t)=>{H.init(e,t),z(e._zod,`optin`,()=>t.innerType._zod.optin),z(e._zod,`optout`,()=>t.innerType._zod.optout),z(e._zod,`pattern`,()=>{let e=t.innerType._zod.pattern;return e?RegExp(`^(${st(e.source)}|null)$`):void 0}),z(e._zod,`values`,()=>t.innerType._zod.values?new Set([...t.innerType._zod.values,null]):void 0),e._zod.parse=(e,n)=>e.value===null?e:t.innerType._zod.run(e,n)}),Xr=R(`$ZodDefault`,(e,t)=>{H.init(e,t),e._zod.optin=`optional`,z(e._zod,`values`,()=>t.innerType._zod.values),e._zod.parse=(e,n)=>{if(n.direction===`backward`)return t.innerType._zod.run(e,n);if(e.value===void 0)return e.value=t.defaultValue,e;let r=t.innerType._zod.run(e,n);return r instanceof Promise?r.then(e=>Zr(e,t)):Zr(r,t)}});function Zr(e,t){return e.value===void 0&&(e.value=t.defaultValue),e}let Qr=R(`$ZodPrefault`,(e,t)=>{H.init(e,t),e._zod.optin=`optional`,z(e._zod,`values`,()=>t.innerType._zod.values),e._zod.parse=(e,n)=>(n.direction===`backward`||e.value===void 0&&(e.value=t.defaultValue),t.innerType._zod.run(e,n))}),$r=R(`$ZodNonOptional`,(e,t)=>{H.init(e,t),z(e._zod,`values`,()=>{let e=t.innerType._zod.values;return e?new Set([...e].filter(e=>e!==void 0)):void 0}),e._zod.parse=(n,r)=>{let i=t.innerType._zod.run(n,r);return i instanceof Promise?i.then(t=>ei(t,e)):ei(i,e)}});function ei(e,t){return!e.issues.length&&e.value===void 0&&e.issues.push({code:`invalid_type`,expected:`nonoptional`,input:e.value,inst:t}),e}let ti=R(`$ZodCatch`,(e,t)=>{H.init(e,t),e._zod.optin=`optional`,z(e._zod,`optout`,()=>t.innerType._zod.optout),z(e._zod,`values`,()=>t.innerType._zod.values),e._zod.parse=(e,n)=>{if(n.direction===`backward`)return t.innerType._zod.run(e,n);let r=t.innerType._zod.run(e,n);return r instanceof Promise?r.then(r=>(e.value=r.value,r.issues.length&&(e.value=t.catchValue({...e,error:{issues:r.issues.map(e=>Ft(e,n,nt()))},input:e.value}),e.issues=[],e.fallback=!0),e)):(e.value=r.value,r.issues.length&&(e.value=t.catchValue({...e,error:{issues:r.issues.map(e=>Ft(e,n,nt()))},input:e.value}),e.issues=[],e.fallback=!0),e)}}),ni=R(`$ZodPipe`,(e,t)=>{H.init(e,t),z(e._zod,`values`,()=>t.in._zod.values),z(e._zod,`optin`,()=>t.in._zod.optin),z(e._zod,`optout`,()=>t.out._zod.optout),z(e._zod,`propValues`,()=>t.in._zod.propValues),e._zod.parse=(e,n)=>{if(n.direction===`backward`){let r=t.out._zod.run(e,n);return r instanceof Promise?r.then(e=>ri(e,t.in,n)):ri(r,t.in,n)}let r=t.in._zod.run(e,n);return r instanceof Promise?r.then(e=>ri(e,t.out,n)):ri(r,t.out,n)}});function ri(e,t,n){return e.issues.length?(e.aborted=!0,e):t._zod.run({value:e.value,issues:e.issues,fallback:e.fallback},n)}let ii=R(`$ZodReadonly`,(e,t)=>{H.init(e,t),z(e._zod,`propValues`,()=>t.innerType._zod.propValues),z(e._zod,`values`,()=>t.innerType._zod.values),z(e._zod,`optin`,()=>t.innerType?._zod?.optin),z(e._zod,`optout`,()=>t.innerType?._zod?.optout),e._zod.parse=(e,n)=>{if(n.direction===`backward`)return t.innerType._zod.run(e,n);let r=t.innerType._zod.run(e,n);return r instanceof Promise?r.then(ai):ai(r)}});function ai(e){return e.value=Object.freeze(e.value),e}let oi=R(`$ZodCustom`,(e,t)=>{V.init(e,t),H.init(e,t),e._zod.parse=(e,t)=>e,e._zod.check=n=>{let r=n.value,i=t.fn(r);if(i instanceof Promise)return i.then(t=>si(t,n,r,e));si(i,n,r,e)}});function si(e,t,n,r){if(!e){let e={code:`custom`,input:n,inst:r,path:[...r._zod.def.path??[]],continue:!r._zod.def.abort};r._zod.def.params&&(e.params=r._zod.def.params),t.issues.push(Lt(e))}}var ci,li=class{constructor(){this._map=new WeakMap,this._idmap=new Map}add(e,...t){let n=t[0];return this._map.set(e,n),n&&typeof n==`object`&&`id`in n&&this._idmap.set(n.id,e),this}clear(){return this._map=new WeakMap,this._idmap=new Map,this}remove(e){let t=this._map.get(e);return t&&typeof t==`object`&&`id`in t&&this._idmap.delete(t.id),this._map.delete(e),this}get(e){let t=e._zod.parent;if(t){let n={...this.get(t)??{}};delete n.id;let r={...n,...this._map.get(e)};return Object.keys(r).length?r:void 0}return this._map.get(e)}has(e){return this._map.has(e)}};function ui(){return new li}(ci=globalThis).__zod_globalRegistry??(ci.__zod_globalRegistry=ui());let di=globalThis.__zod_globalRegistry;function fi(e,t){return new e({type:`string`,...B(t)})}function pi(e,t){return new e({type:`string`,format:`email`,check:`string_format`,abort:!1,...B(t)})}function mi(e,t){return new e({type:`string`,format:`guid`,check:`string_format`,abort:!1,...B(t)})}function hi(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,...B(t)})}function gi(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,version:`v4`,...B(t)})}function _i(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,version:`v6`,...B(t)})}function vi(e,t){return new e({type:`string`,format:`uuid`,check:`string_format`,abort:!1,version:`v7`,...B(t)})}function yi(e,t){return new e({type:`string`,format:`url`,check:`string_format`,abort:!1,...B(t)})}function bi(e,t){return new e({type:`string`,format:`emoji`,check:`string_format`,abort:!1,...B(t)})}function xi(e,t){return new e({type:`string`,format:`nanoid`,check:`string_format`,abort:!1,...B(t)})}function Si(e,t){return new e({type:`string`,format:`cuid`,check:`string_format`,abort:!1,...B(t)})}function Ci(e,t){return new e({type:`string`,format:`cuid2`,check:`string_format`,abort:!1,...B(t)})}function wi(e,t){return new e({type:`string`,format:`ulid`,check:`string_format`,abort:!1,...B(t)})}function Ti(e,t){return new e({type:`string`,format:`xid`,check:`string_format`,abort:!1,...B(t)})}function Ei(e,t){return new e({type:`string`,format:`ksuid`,check:`string_format`,abort:!1,...B(t)})}function Di(e,t){return new e({type:`string`,format:`ipv4`,check:`string_format`,abort:!1,...B(t)})}function Oi(e,t){return new e({type:`string`,format:`ipv6`,check:`string_format`,abort:!1,...B(t)})}function ki(e,t){return new e({type:`string`,format:`cidrv4`,check:`string_format`,abort:!1,...B(t)})}function Ai(e,t){return new e({type:`string`,format:`cidrv6`,check:`string_format`,abort:!1,...B(t)})}function ji(e,t){return new e({type:`string`,format:`base64`,check:`string_format`,abort:!1,...B(t)})}function Mi(e,t){return new e({type:`string`,format:`base64url`,check:`string_format`,abort:!1,...B(t)})}function Ni(e,t){return new e({type:`string`,format:`e164`,check:`string_format`,abort:!1,...B(t)})}function Pi(e,t){return new e({type:`string`,format:`jwt`,check:`string_format`,abort:!1,...B(t)})}function Fi(e,t){return new e({type:`string`,format:`datetime`,check:`string_format`,offset:!1,local:!1,precision:null,...B(t)})}function Ii(e,t){return new e({type:`string`,format:`date`,check:`string_format`,...B(t)})}function Li(e,t){return new e({type:`string`,format:`time`,check:`string_format`,precision:null,...B(t)})}function Ri(e,t){return new e({type:`string`,format:`duration`,check:`string_format`,...B(t)})}function zi(e,t){return new e({type:`number`,checks:[],...B(t)})}function Bi(e,t){return new e({type:`number`,check:`number_format`,abort:!1,format:`safeint`,...B(t)})}function Vi(e,t){return new e({type:`boolean`,...B(t)})}function Hi(e){return new e({type:`unknown`})}function Ui(e,t){return new e({type:`never`,...B(t)})}function Wi(e,t){return new Fn({check:`less_than`,...B(t),value:e,inclusive:!1})}function Gi(e,t){return new Fn({check:`less_than`,...B(t),value:e,inclusive:!0})}function Ki(e,t){return new In({check:`greater_than`,...B(t),value:e,inclusive:!1})}function qi(e,t){return new In({check:`greater_than`,...B(t),value:e,inclusive:!0})}function Ji(e,t){return new Ln({check:`multiple_of`,...B(t),value:e})}function Yi(e,t){return new zn({check:`max_length`,...B(t),maximum:e})}function Xi(e,t){return new Bn({check:`min_length`,...B(t),minimum:e})}function Zi(e,t){return new Vn({check:`length_equals`,...B(t),length:e})}function Qi(e,t){return new Un({check:`string_format`,format:`regex`,...B(t),pattern:e})}function $i(e){return new Wn({check:`string_format`,format:`lowercase`,...B(e)})}function ea(e){return new Gn({check:`string_format`,format:`uppercase`,...B(e)})}function ta(e,t){return new Kn({check:`string_format`,format:`includes`,...B(t),includes:e})}function na(e,t){return new qn({check:`string_format`,format:`starts_with`,...B(t),prefix:e})}function ra(e,t){return new Jn({check:`string_format`,format:`ends_with`,...B(t),suffix:e})}function ia(e){return new Yn({check:`overwrite`,tx:e})}function aa(e){return ia(t=>t.normalize(e))}function oa(){return ia(e=>e.trim())}function sa(){return ia(e=>e.toLowerCase())}function ca(){return ia(e=>e.toUpperCase())}function la(){return ia(e=>pt(e))}function ua(e,t,n){return new e({type:`array`,element:t,...B(n)})}function da(e,t,n){return new e({type:`custom`,check:`custom`,fn:t,...B(n)})}function fa(e,t){let n=pa(t=>(t.addIssue=e=>{if(typeof e==`string`)t.issues.push(Lt(e,t.value,n._zod.def));else{let r=e;r.fatal&&(r.continue=!1),r.code??=`custom`,r.input??=t.value,r.inst??=n,r.continue??=!n._zod.def.abort,t.issues.push(Lt(r))}},e(t.value,t)),t);return n}function pa(e,t){let n=new V({check:`custom`,...B(t)});return n._zod.check=e,n}function ma(e){let t=e?.target??`draft-2020-12`;return t===`draft-4`&&(t=`draft-04`),t===`draft-7`&&(t=`draft-07`),{processors:e.processors??{},metadataRegistry:e?.metadata??di,target:t,unrepresentable:e?.unrepresentable??`throw`,override:e?.override??(()=>{}),io:e?.io??`output`,counter:0,seen:new Map,cycles:e?.cycles??`ref`,reused:e?.reused??`inline`,external:e?.external??void 0}}function W(e,t,n={path:[],schemaPath:[]}){var r;let i=e._zod.def,a=t.seen.get(e);if(a)return a.count++,n.schemaPath.includes(e)&&(a.cycle=n.path),a.schema;let o={schema:{},count:1,cycle:void 0,path:n.path};t.seen.set(e,o);let s=e._zod.toJSONSchema?.();if(s)o.schema=s;else{let r={...n,schemaPath:[...n.schemaPath,e],path:n.path};if(e._zod.processJSONSchema)e._zod.processJSONSchema(t,o.schema,r);else{let n=o.schema,a=t.processors[i.type];if(!a)throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);a(e,t,n,r)}let a=e._zod.parent;a&&(o.ref||=a,W(a,t,r),t.seen.get(a).isParent=!0)}let c=t.metadataRegistry.get(e);return c&&Object.assign(o.schema,c),t.io===`input`&&G(e)&&(delete o.schema.examples,delete o.schema.default),t.io===`input`&&`_prefault`in o.schema&&((r=o.schema).default??(r.default=o.schema._prefault)),delete o.schema._prefault,t.seen.get(e).schema}function ha(e,t){let n=e.seen.get(t);if(!n)throw Error(`Unprocessed schema. This is a bug in Zod.`);let r=new Map;for(let t of e.seen.entries()){let n=e.metadataRegistry.get(t[0])?.id;if(n){let e=r.get(n);if(e&&e!==t[0])throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);r.set(n,t[0])}}let i=t=>{let r=e.target===`draft-2020-12`?`$defs`:`definitions`;if(e.external){let n=e.external.registry.get(t[0])?.id,i=e.external.uri??(e=>e);if(n)return{ref:i(n)};let a=t[1].defId??t[1].schema.id??`schema${e.counter++}`;return t[1].defId=a,{defId:a,ref:`${i(`__shared`)}#/${r}/${a}`}}if(t[1]===n)return{ref:`#`};let i=`#/${r}/`,a=t[1].schema.id??`__schema${e.counter++}`;return{defId:a,ref:i+a}},a=e=>{if(e[1].schema.$ref)return;let t=e[1],{ref:n,defId:r}=i(e);t.def={...t.schema},r&&(t.defId=r);let a=t.schema;for(let e in a)delete a[e];a.$ref=n};if(e.cycles===`throw`)for(let t of e.seen.entries()){let e=t[1];if(e.cycle)throw Error(`Cycle detected: #/${e.cycle?.join(`/`)}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`)}for(let n of e.seen.entries()){let r=n[1];if(t===n[0]){a(n);continue}if(e.external){let r=e.external.registry.get(n[0])?.id;if(t!==n[0]&&r){a(n);continue}}if(e.metadataRegistry.get(n[0])?.id){a(n);continue}if(r.cycle){a(n);continue}if(r.count>1&&e.reused===`ref`){a(n);continue}}}function ga(e,t){let n=e.seen.get(t);if(!n)throw Error(`Unprocessed schema. This is a bug in Zod.`);let r=t=>{let n=e.seen.get(t);if(n.ref===null)return;let i=n.def??n.schema,a={...i},o=n.ref;if(n.ref=null,o){r(o);let n=e.seen.get(o),s=n.schema;if(s.$ref&&(e.target===`draft-07`||e.target===`draft-04`||e.target===`openapi-3.0`)?(i.allOf=i.allOf??[],i.allOf.push(s)):Object.assign(i,s),Object.assign(i,a),t._zod.parent===o)for(let e in i)e!==`$ref`&&e!==`allOf`&&(e in a||delete i[e]);if(s.$ref&&n.def)for(let e in i)e!==`$ref`&&e!==`allOf`&&e in n.def&&JSON.stringify(i[e])===JSON.stringify(n.def[e])&&delete i[e]}let s=t._zod.parent;if(s&&s!==o){r(s);let t=e.seen.get(s);if(t?.schema.$ref&&(i.$ref=t.schema.$ref,t.def))for(let e in i)e!==`$ref`&&e!==`allOf`&&e in t.def&&JSON.stringify(i[e])===JSON.stringify(t.def[e])&&delete i[e]}e.override({zodSchema:t,jsonSchema:i,path:n.path??[]})};for(let t of[...e.seen.entries()].reverse())r(t[0]);let i={};if(e.target===`draft-2020-12`?i.$schema=`https://json-schema.org/draft/2020-12/schema`:e.target===`draft-07`?i.$schema=`http://json-schema.org/draft-07/schema#`:e.target===`draft-04`?i.$schema=`http://json-schema.org/draft-04/schema#`:e.target,e.external?.uri){let n=e.external.registry.get(t)?.id;if(!n)throw Error("Schema is missing an `id` property");i.$id=e.external.uri(n)}Object.assign(i,n.def??n.schema);let a=e.metadataRegistry.get(t)?.id;a!==void 0&&i.id===a&&delete i.id;let o=e.external?.defs??{};for(let t of e.seen.entries()){let e=t[1];e.def&&e.defId&&(e.def.id===e.defId&&delete e.def.id,o[e.defId]=e.def)}e.external||Object.keys(o).length>0&&(e.target===`draft-2020-12`?i.$defs=o:i.definitions=o);try{let n=JSON.parse(JSON.stringify(i));return Object.defineProperty(n,"~standard",{value:{...t[`~standard`],jsonSchema:{input:va(t,`input`,e.processors),output:va(t,`output`,e.processors)}},enumerable:!1,writable:!1}),n}catch{throw Error(`Error converting schema to JSON.`)}}function G(e,t){let n=t??{seen:new Set};if(n.seen.has(e))return!1;n.seen.add(e);let r=e._zod.def;if(r.type===`transform`)return!0;if(r.type===`array`)return G(r.element,n);if(r.type===`set`)return G(r.valueType,n);if(r.type===`lazy`)return G(r.getter(),n);if(r.type===`promise`||r.type===`optional`||r.type===`nonoptional`||r.type===`nullable`||r.type===`readonly`||r.type==="default"||r.type===`prefault`)return G(r.innerType,n);if(r.type===`intersection`)return G(r.left,n)||G(r.right,n);if(r.type===`record`||r.type===`map`)return G(r.keyType,n)||G(r.valueType,n);if(r.type===`pipe`)return e._zod.traits.has(`$ZodCodec`)?!0:G(r.in,n)||G(r.out,n);if(r.type===`object`){for(let e in r.shape)if(G(r.shape[e],n))return!0;return!1}if(r.type===`union`){for(let e of r.options)if(G(e,n))return!0;return!1}if(r.type===`tuple`){for(let e of r.items)if(G(e,n))return!0;return!!(r.rest&&G(r.rest,n))}return!1}let _a=(e,t={})=>n=>{let r=ma({...n,processors:t});return W(e,r),ha(r,e),ga(r,e)},va=(e,t,n={})=>r=>{let{libraryOptions:i,target:a}=r??{},o=ma({...i??{},target:a,io:t,processors:n});return W(e,o),ha(o,e),ga(o,e)},ya={guid:`uuid`,url:`uri`,datetime:`date-time`,json_string:`json-string`,regex:``},ba=(e,t,n,r)=>{let i=n;i.type=`string`;let{minimum:a,maximum:o,format:s,patterns:c,contentEncoding:l}=e._zod.bag;if(typeof a==`number`&&(i.minLength=a),typeof o==`number`&&(i.maxLength=o),s&&(i.format=ya[s]??s,i.format===``&&delete i.format,s===`time`&&delete i.format),l&&(i.contentEncoding=l),c&&c.size>0){let e=[...c];e.length===1?i.pattern=e[0].source:e.length>1&&(i.allOf=[...e.map(e=>({...t.target===`draft-07`||t.target===`draft-04`||t.target===`openapi-3.0`?{type:`string`}:{},pattern:e.source}))])}},xa=(e,t,n,r)=>{let i=n,{minimum:a,maximum:o,format:s,multipleOf:c,exclusiveMaximum:l,exclusiveMinimum:u}=e._zod.bag;i.type=typeof s==`string`&&s.includes(`int`)?`integer`:`number`;let d=typeof u==`number`&&u>=(a??-1/0),f=typeof l==`number`&&l<=(o??1/0),p=t.target===`draft-04`||t.target===`openapi-3.0`;d?p?(i.minimum=u,i.exclusiveMinimum=!0):i.exclusiveMinimum=u:typeof a==`number`&&(i.minimum=a),f?p?(i.maximum=l,i.exclusiveMaximum=!0):i.exclusiveMaximum=l:typeof o==`number`&&(i.maximum=o),typeof c==`number`&&(i.multipleOf=c)},Sa=(e,t,n,r)=>{n.type=`boolean`},Ca=(e,t,n,r)=>{n.not={}},wa=(e,t,n,r)=>{let i=e._zod.def,a=rt(i.entries);a.every(e=>typeof e==`number`)&&(n.type=`number`),a.every(e=>typeof e==`string`)&&(n.type=`string`),n.enum=a},Ta=(e,t,n,r)=>{let i=e._zod.def,a=[];for(let e of i.values)if(e===void 0){if(t.unrepresentable===`throw`)throw Error("Literal `undefined` cannot be represented in JSON Schema")}else if(typeof e==`bigint`){if(t.unrepresentable===`throw`)throw Error(`BigInt literals cannot be represented in JSON Schema`);a.push(Number(e))}else a.push(e);if(a.length!==0){if(a.length===1){let e=a[0];n.type=e===null?`null`:typeof e,t.target===`draft-04`||t.target===`openapi-3.0`?n.enum=[e]:n.const=e}else a.every(e=>typeof e==`number`)&&(n.type=`number`),a.every(e=>typeof e==`string`)&&(n.type=`string`),a.every(e=>typeof e==`boolean`)&&(n.type=`boolean`),a.every(e=>e===null)&&(n.type=`null`),n.enum=a}},Ea=(e,t,n,r)=>{if(t.unrepresentable===`throw`)throw Error(`Custom types cannot be represented in JSON Schema`)},Da=(e,t,n,r)=>{if(t.unrepresentable===`throw`)throw Error(`Transforms cannot be represented in JSON Schema`)},Oa=(e,t,n,r)=>{let i=n,a=e._zod.def,{minimum:o,maximum:s}=e._zod.bag;typeof o==`number`&&(i.minItems=o),typeof s==`number`&&(i.maxItems=s),i.type=`array`,i.items=W(a.element,t,{...r,path:[...r.path,`items`]})},ka=(e,t,n,r)=>{let i=n,a=e._zod.def;i.type=`object`,i.properties={};let o=a.shape;for(let e in o)i.properties[e]=W(o[e],t,{...r,path:[...r.path,`properties`,e]});let s=new Set(Object.keys(o)),c=new Set([...s].filter(e=>{let n=a.shape[e]._zod;return t.io===`input`?n.optin===void 0:n.optout===void 0}));c.size>0&&(i.required=Array.from(c)),a.catchall?._zod.def.type===`never`?i.additionalProperties=!1:a.catchall?a.catchall&&(i.additionalProperties=W(a.catchall,t,{...r,path:[...r.path,`additionalProperties`]})):t.io===`output`&&(i.additionalProperties=!1)},Aa=(e,t,n,r)=>{let i=e._zod.def,a=i.inclusive===!1,o=i.options.map((e,n)=>W(e,t,{...r,path:[...r.path,a?`oneOf`:`anyOf`,n]}));a?n.oneOf=o:n.anyOf=o},ja=(e,t,n,r)=>{let i=e._zod.def,a=W(i.left,t,{...r,path:[...r.path,`allOf`,0]}),o=W(i.right,t,{...r,path:[...r.path,`allOf`,1]}),s=e=>`allOf`in e&&Object.keys(e).length===1;n.allOf=[...s(a)?a.allOf:[a],...s(o)?o.allOf:[o]]},Ma=(e,t,n,r)=>{let i=e._zod.def,a=W(i.innerType,t,r),o=t.seen.get(e);t.target===`openapi-3.0`?(o.ref=i.innerType,n.nullable=!0):n.anyOf=[a,{type:`null`}]},Na=(e,t,n,r)=>{let i=e._zod.def;W(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType},Pa=(e,t,n,r)=>{let i=e._zod.def;W(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType,n.default=JSON.parse(JSON.stringify(i.defaultValue))},Fa=(e,t,n,r)=>{let i=e._zod.def;W(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType,t.io===`input`&&(n._prefault=JSON.parse(JSON.stringify(i.defaultValue)))},Ia=(e,t,n,r)=>{let i=e._zod.def;W(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType;let o;try{o=i.catchValue(void 0)}catch{throw Error(`Dynamic catch values are not supported in JSON Schema`)}n.default=o},La=(e,t,n,r)=>{let i=e._zod.def,a=i.in._zod.traits.has(`$ZodTransform`),o=t.io===`input`?a?i.out:i.in:i.out;W(o,t,r);let s=t.seen.get(e);s.ref=o},Ra=(e,t,n,r)=>{let i=e._zod.def;W(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType,n.readOnly=!0},za=(e,t,n,r)=>{let i=e._zod.def;W(i.innerType,t,r);let a=t.seen.get(e);a.ref=i.innerType},Ba=R(`ZodISODateTime`,(e,t)=>{ur.init(e,t),J.init(e,t)});function Va(e){return Fi(Ba,e)}let Ha=R(`ZodISODate`,(e,t)=>{dr.init(e,t),J.init(e,t)});function Ua(e){return Ii(Ha,e)}let Wa=R(`ZodISOTime`,(e,t)=>{fr.init(e,t),J.init(e,t)});function Ga(e){return Li(Wa,e)}let Ka=R(`ZodISODuration`,(e,t)=>{pr.init(e,t),J.init(e,t)});function qa(e){return Ri(Ka,e)}let K=R(`ZodError`,(e,t)=>{zt.init(e,t),e.name=`ZodError`,Object.defineProperties(e,{format:{value:t=>Ht(e,t)},flatten:{value:t=>Vt(e,t)},addIssue:{value:t=>{e.issues.push(t),e.message=JSON.stringify(e.issues,it,2)}},addIssues:{value:t=>{e.issues.push(...t),e.message=JSON.stringify(e.issues,it,2)}},isEmpty:{get(){return e.issues.length===0}}})},{Parent:Error}),Ja=Ut(K),Ya=Wt(K),Xa=Gt(K),Za=qt(K),Qa=Yt(K),$a=Xt(K),eo=Zt(K),to=Qt(K),no=$t(K),ro=en(K),io=tn(K),ao=nn(K),oo=new WeakMap;function so(e,t,n){let r=Object.getPrototypeOf(e),i=oo.get(r);if(i||(i=new Set,oo.set(r,i)),!i.has(t)){i.add(t);for(let e in n){let t=n[e];Object.defineProperty(r,e,{configurable:!0,enumerable:!1,get(){let n=t.bind(this);return Object.defineProperty(this,e,{configurable:!0,writable:!0,enumerable:!0,value:n}),n},set(t){Object.defineProperty(this,e,{configurable:!0,writable:!0,enumerable:!0,value:t})}})}}}let q=R(`ZodType`,(e,t)=>(H.init(e,t),Object.assign(e[`~standard`],{jsonSchema:{input:va(e,`input`),output:va(e,`output`)}}),e.toJSONSchema=_a(e,{}),e.def=t,e.type=t.type,Object.defineProperty(e,"_def",{value:t}),e.parse=(t,n)=>Ja(e,t,n,{callee:e.parse}),e.safeParse=(t,n)=>Xa(e,t,n),e.parseAsync=async(t,n)=>Ya(e,t,n,{callee:e.parseAsync}),e.safeParseAsync=async(t,n)=>Za(e,t,n),e.spa=e.safeParseAsync,e.encode=(t,n)=>Qa(e,t,n),e.decode=(t,n)=>$a(e,t,n),e.encodeAsync=async(t,n)=>eo(e,t,n),e.decodeAsync=async(t,n)=>to(e,t,n),e.safeEncode=(t,n)=>no(e,t,n),e.safeDecode=(t,n)=>ro(e,t,n),e.safeEncodeAsync=async(t,n)=>io(e,t,n),e.safeDecodeAsync=async(t,n)=>ao(e,t,n),so(e,`ZodType`,{check(...e){let t=this.def;return this.clone(dt(t,{checks:[...t.checks??[],...e.map(e=>typeof e==`function`?{_zod:{check:e,def:{check:`custom`},onattach:[]}}:e)]}),{parent:!0})},with(...e){return this.check(...e)},clone(e,t){return xt(this,e,t)},brand(){return this},register(e,t){return e.add(this,t),this},refine(e,t){return this.check(xs(e,t))},superRefine(e,t){return this.check(Ss(e,t))},overwrite(e){return this.check(ia(e))},optional(){return rs(this)},exactOptional(){return as(this)},nullable(){return ss(this)},nullish(){return rs(ss(this))},nonoptional(e){return ps(this,e)},array(){return Ho(this)},or(e){return Go([this,e])},and(e){return Yo(this,e)},transform(e){return _s(this,ts(e))},default(e){return ls(this,e)},prefault(e){return ds(this,e)},catch(e){return hs(this,e)},pipe(e){return _s(this,e)},readonly(){return ys(this)},describe(e){let t=this.clone();return di.add(t,{description:e}),t},meta(...e){if(e.length===0)return di.get(this);let t=this.clone();return di.add(t,e[0]),t},isOptional(){return this.safeParse(void 0).success},isNullable(){return this.safeParse(null).success},apply(e){return e(this)}}),Object.defineProperty(e,"description",{get(){return di.get(e)?.description},configurable:!0}),e)),co=R(`_ZodString`,(e,t)=>{Qn.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ba(e,t,n,r);let n=e._zod.bag;e.format=n.format??null,e.minLength=n.minimum??null,e.maxLength=n.maximum??null,so(e,`_ZodString`,{regex(...e){return this.check(Qi(...e))},includes(...e){return this.check(ta(...e))},startsWith(...e){return this.check(na(...e))},endsWith(...e){return this.check(ra(...e))},min(...e){return this.check(Xi(...e))},max(...e){return this.check(Yi(...e))},length(...e){return this.check(Zi(...e))},nonempty(...e){return this.check(Xi(1,...e))},lowercase(e){return this.check($i(e))},uppercase(e){return this.check(ea(e))},trim(){return this.check(oa())},normalize(...e){return this.check(aa(...e))},toLowerCase(){return this.check(sa())},toUpperCase(){return this.check(ca())},slugify(){return this.check(la())}})}),lo=R(`ZodString`,(e,t)=>{Qn.init(e,t),co.init(e,t),e.email=t=>e.check(pi(fo,t)),e.url=t=>e.check(yi(ho,t)),e.jwt=t=>e.check(Pi(Ao,t)),e.emoji=t=>e.check(bi(go,t)),e.guid=t=>e.check(mi(po,t)),e.uuid=t=>e.check(hi(mo,t)),e.uuidv4=t=>e.check(gi(mo,t)),e.uuidv6=t=>e.check(_i(mo,t)),e.uuidv7=t=>e.check(vi(mo,t)),e.nanoid=t=>e.check(xi(_o,t)),e.guid=t=>e.check(mi(po,t)),e.cuid=t=>e.check(Si(vo,t)),e.cuid2=t=>e.check(Ci(yo,t)),e.ulid=t=>e.check(wi(bo,t)),e.base64=t=>e.check(ji(Do,t)),e.base64url=t=>e.check(Mi(Oo,t)),e.xid=t=>e.check(Ti(xo,t)),e.ksuid=t=>e.check(Ei(So,t)),e.ipv4=t=>e.check(Di(Co,t)),e.ipv6=t=>e.check(Oi(wo,t)),e.cidrv4=t=>e.check(ki(To,t)),e.cidrv6=t=>e.check(Ai(Eo,t)),e.e164=t=>e.check(Ni(ko,t)),e.datetime=t=>e.check(Va(t)),e.date=t=>e.check(Ua(t)),e.time=t=>e.check(Ga(t)),e.duration=t=>e.check(qa(t))});function uo(e){return fi(lo,e)}let J=R(`ZodStringFormat`,(e,t)=>{U.init(e,t),co.init(e,t)}),fo=R(`ZodEmail`,(e,t)=>{tr.init(e,t),J.init(e,t)}),po=R(`ZodGUID`,(e,t)=>{$n.init(e,t),J.init(e,t)}),mo=R(`ZodUUID`,(e,t)=>{er.init(e,t),J.init(e,t)}),ho=R(`ZodURL`,(e,t)=>{nr.init(e,t),J.init(e,t)}),go=R(`ZodEmoji`,(e,t)=>{rr.init(e,t),J.init(e,t)}),_o=R(`ZodNanoID`,(e,t)=>{ir.init(e,t),J.init(e,t)}),vo=R(`ZodCUID`,(e,t)=>{ar.init(e,t),J.init(e,t)}),yo=R(`ZodCUID2`,(e,t)=>{or.init(e,t),J.init(e,t)}),bo=R(`ZodULID`,(e,t)=>{sr.init(e,t),J.init(e,t)}),xo=R(`ZodXID`,(e,t)=>{cr.init(e,t),J.init(e,t)}),So=R(`ZodKSUID`,(e,t)=>{lr.init(e,t),J.init(e,t)}),Co=R(`ZodIPv4`,(e,t)=>{mr.init(e,t),J.init(e,t)}),wo=R(`ZodIPv6`,(e,t)=>{hr.init(e,t),J.init(e,t)}),To=R(`ZodCIDRv4`,(e,t)=>{gr.init(e,t),J.init(e,t)}),Eo=R(`ZodCIDRv6`,(e,t)=>{_r.init(e,t),J.init(e,t)}),Do=R(`ZodBase64`,(e,t)=>{yr.init(e,t),J.init(e,t)}),Oo=R(`ZodBase64URL`,(e,t)=>{xr.init(e,t),J.init(e,t)}),ko=R(`ZodE164`,(e,t)=>{Sr.init(e,t),J.init(e,t)}),Ao=R(`ZodJWT`,(e,t)=>{wr.init(e,t),J.init(e,t)}),jo=R(`ZodNumber`,(e,t)=>{Tr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>xa(e,t,n,r),so(e,`ZodNumber`,{gt(e,t){return this.check(Ki(e,t))},gte(e,t){return this.check(qi(e,t))},min(e,t){return this.check(qi(e,t))},lt(e,t){return this.check(Wi(e,t))},lte(e,t){return this.check(Gi(e,t))},max(e,t){return this.check(Gi(e,t))},int(e){return this.check(Po(e))},safe(e){return this.check(Po(e))},positive(e){return this.check(Ki(0,e))},nonnegative(e){return this.check(qi(0,e))},negative(e){return this.check(Wi(0,e))},nonpositive(e){return this.check(Gi(0,e))},multipleOf(e,t){return this.check(Ji(e,t))},step(e,t){return this.check(Ji(e,t))},finite(){return this}});let n=e._zod.bag;e.minValue=Math.max(n.minimum??-1/0,n.exclusiveMinimum??-1/0)??null,e.maxValue=Math.min(n.maximum??1/0,n.exclusiveMaximum??1/0)??null,e.isInt=(n.format??``).includes(`int`)||Number.isSafeInteger(n.multipleOf??.5),e.isFinite=!0,e.format=n.format??null});function Mo(e){return zi(jo,e)}let No=R(`ZodNumberFormat`,(e,t)=>{Er.init(e,t),jo.init(e,t)});function Po(e){return Bi(No,e)}let Fo=R(`ZodBoolean`,(e,t)=>{Dr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Sa(e,t,n,r)});function Io(e){return Vi(Fo,e)}let Lo=R(`ZodUnknown`,(e,t)=>{Or.init(e,t),q.init(e,t),e._zod.processJSONSchema=(e,t,n)=>void 0});function Ro(){return Hi(Lo)}let zo=R(`ZodNever`,(e,t)=>{kr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Ca(e,t,n,r)});function Bo(e){return Ui(zo,e)}let Vo=R(`ZodArray`,(e,t)=>{jr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Oa(e,t,n,r),e.element=t.element,so(e,`ZodArray`,{min(e,t){return this.check(Xi(e,t))},nonempty(e){return this.check(Xi(1,e))},max(e,t){return this.check(Yi(e,t))},length(e,t){return this.check(Zi(e,t))},unwrap(){return this.element}})});function Ho(e,t){return ua(Vo,e,t)}let Uo=R(`ZodObject`,(e,t)=>{Ir.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ka(e,t,n,r),z(e,`shape`,()=>t.shape),so(e,`ZodObject`,{keyof(){return Zo(Object.keys(this._zod.def.shape))},catchall(e){return this.clone({...this._zod.def,catchall:e})},passthrough(){return this.clone({...this._zod.def,catchall:Ro()})},loose(){return this.clone({...this._zod.def,catchall:Ro()})},strict(){return this.clone({...this._zod.def,catchall:Bo()})},strip(){return this.clone({...this._zod.def,catchall:void 0})},extend(e){return Et(this,e)},safeExtend(e){return Dt(this,e)},merge(e){return Ot(this,e)},pick(e){return wt(this,e)},omit(e){return Tt(this,e)},partial(...e){return kt(ns,this,e[0])},required(...e){return At(fs,this,e[0])}})});function Y(e,t){let n={type:`object`,shape:e??{},...B(t)};return new Uo(n)}let Wo=R(`ZodUnion`,(e,t)=>{Rr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Aa(e,t,n,r),e.options=t.options});function Go(e,t){return new Wo({type:`union`,options:e,...B(t)})}let Ko=R(`ZodDiscriminatedUnion`,(e,t)=>{Wo.init(e,t),zr.init(e,t)});function qo(e,t,n){return new Ko({type:`union`,options:t,discriminator:e,...B(n)})}let Jo=R(`ZodIntersection`,(e,t)=>{Br.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>ja(e,t,n,r)});function Yo(e,t){return new Jo({type:`intersection`,left:e,right:t})}let Xo=R(`ZodEnum`,(e,t)=>{Ur.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>wa(e,t,n,r),e.enum=t.entries,e.options=Object.values(t.entries);let n=new Set(Object.keys(t.entries));e.extract=(e,r)=>{let i={};for(let r of e)if(n.has(r))i[r]=t.entries[r];else throw Error(`Key ${r} not found in enum`);return new Xo({...t,checks:[],...B(r),entries:i})},e.exclude=(e,r)=>{let i={...t.entries};for(let t of e)if(n.has(t))delete i[t];else throw Error(`Key ${t} not found in enum`);return new Xo({...t,checks:[],...B(r),entries:i})}});function Zo(e,t){let n=Array.isArray(e)?Object.fromEntries(e.map(e=>[e,e])):e;return new Xo({type:`enum`,entries:n,...B(t)})}let Qo=R(`ZodLiteral`,(e,t)=>{Wr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Ta(e,t,n,r),e.values=new Set(t.values),Object.defineProperty(e,"value",{get(){if(t.values.length>1)throw Error("This schema contains multiple valid literal values. Use `.values` instead.");return t.values[0]}})});function $o(e,t){return new Qo({type:`literal`,values:Array.isArray(e)?e:[e],...B(t)})}let es=R(`ZodTransform`,(e,t)=>{Gr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Da(e,t,n,r),e._zod.parse=(n,r)=>{if(r.direction===`backward`)throw new et(e.constructor.name);n.addIssue=r=>{if(typeof r==`string`)n.issues.push(Lt(r,n.value,t));else{let t=r;t.fatal&&(t.continue=!1),t.code??=`custom`,t.input??=n.value,t.inst??=e,n.issues.push(Lt(t))}};let i=t.transform(n.value,n);return i instanceof Promise?i.then(e=>(n.value=e,n.fallback=!0,n)):(n.value=i,n.fallback=!0,n)}});function ts(e){return new es({type:`transform`,transform:e})}let ns=R(`ZodOptional`,(e,t)=>{qr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>za(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function rs(e){return new ns({type:`optional`,innerType:e})}let is=R(`ZodExactOptional`,(e,t)=>{Jr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>za(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function as(e){return new is({type:`optional`,innerType:e})}let os=R(`ZodNullable`,(e,t)=>{Yr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Ma(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function ss(e){return new os({type:`nullable`,innerType:e})}let cs=R(`ZodDefault`,(e,t)=>{Xr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Pa(e,t,n,r),e.unwrap=()=>e._zod.def.innerType,e.removeDefault=e.unwrap});function ls(e,t){return new cs({type:`default`,innerType:e,get defaultValue(){return typeof t==`function`?t():vt(t)}})}let us=R(`ZodPrefault`,(e,t)=>{Qr.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Fa(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function ds(e,t){return new us({type:`prefault`,innerType:e,get defaultValue(){return typeof t==`function`?t():vt(t)}})}let fs=R(`ZodNonOptional`,(e,t)=>{$r.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Na(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function ps(e,t){return new fs({type:`nonoptional`,innerType:e,...B(t)})}let ms=R(`ZodCatch`,(e,t)=>{ti.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Ia(e,t,n,r),e.unwrap=()=>e._zod.def.innerType,e.removeCatch=e.unwrap});function hs(e,t){return new ms({type:`catch`,innerType:e,catchValue:typeof t==`function`?t:()=>t})}let gs=R(`ZodPipe`,(e,t)=>{ni.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>La(e,t,n,r),e.in=t.in,e.out=t.out});function _s(e,t){return new gs({type:`pipe`,in:e,out:t})}let vs=R(`ZodReadonly`,(e,t)=>{ii.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Ra(e,t,n,r),e.unwrap=()=>e._zod.def.innerType});function ys(e){return new vs({type:`readonly`,innerType:e})}let bs=R(`ZodCustom`,(e,t)=>{oi.init(e,t),q.init(e,t),e._zod.processJSONSchema=(t,n,r)=>Ea(e,t,n,r)});function xs(e,t={}){return da(bs,e,t)}function Ss(e,t){return fa(e,t)}let Cs=[`selection_empty`,`selection_outside_conversation`,`selection_not_model_visible`,`selection_too_large`,`selection_stale`,`selection_crosses_unsupported_nodes`,`parent_session_missing`,`parent_session_not_ready`,`fork_unavailable`,`side_chat_already_open`,`side_chat_not_found`,`side_chat_open_failed`,`side_chat_prompt_failed`,`side_chat_model_failed`,`side_chat_interrupt_failed`,`side_chat_destroy_failed`,`transport_error`,`invalid_request`,`internal_error`],X=uo().min(1).max(512),ws=Y({provider:X,model:X,reasoningEffort:X.optional()}).strict(),Ts=Y({code:Zo(Cs),message:uo(),recoverable:Io()}).strict(),Es=Y({parentSessionId:X,atSeq:Mo().finite().nonnegative(),modelSelection:ws.optional()}).strict(),Ds=Y({childSessionId:X,provider:X,model:X,reasoningEffort:X.optional()}).strict(),Os=Y({childSessionId:X}).strict(),ks=Y({parentSessionId:X,childSessionId:X,boundarySeq:Mo().int().nonnegative(),inheritedThroughSeq:Mo().int().nonnegative(),modelSelection:ws.optional()}).strict(),As=Y({selected:ws}).strict(),js=Y({closed:$o(!0)}).strict();function Ms(e){return qo(`ok`,[Y({ok:$o(!0),value:e}).strict(),Y({ok:$o(!1),error:Ts}).strict()])}let Ns=Ms(ks),Ps=Ms(As),Fs=Ms(js);function Is(e,t,n,r){let i=e===`create`?`CreateSideChatRequest`:e===`selectModel`?`SelectSideChatModelRequest`:`CloseSideChatRequest`,a=e===`create`?`ArchivedCreateResult`:e===`selectModel`?`ArchivedSelectModelResult`:`ArchivedCloseResult`;return{id:`@ahggg/dsh-side-chat#sideChatArchived/${e}`,service:`sideChat`,namespace:`sideChatArchived`,method:e,implementation:t,invocation:{kind:`direct`},parameters:[{name:`request`,wire:`request`,source:`json`,codec:{mode:`strict`,typeSymbol:`@ahggg/dsh-side-chat/remote#${i}`,schema:n}}],result:{mode:`strict`,typeSymbol:`@ahggg/dsh-side-chat/remote#${a}`,schema:r},sourceLocation:{file:`src/index.ts`,line:1,column:1}}}let Ls={package:`@ahggg/dsh-side-chat`,descriptors:[Is(`create`,`createArchived`,Es,Ns),Is(`selectModel`,`selectArchivedModel`,Ds,Ps),Is(`close`,`closeArchived`,Os,Fs)]};function Rs(e){let t=e.code,n=t===`bad-request`||t===`gateway/bad-request`;return{code:n?`invalid_request`:`transport_error`,message:e.message||`The Side Chat RPC failed.`,recoverable:!n}}async function zs(e){let t=await e.remote.$mount(Ls),n=e.get(`remote.sideChatArchived`);return{remote:{create:async e=>{let t=await n.create({...e,atSeq:Math.floor(e.atSeq)});return t.ok?t.value:{ok:!1,error:Rs(t.error)}},selectModel:async e=>{let t=await n.selectModel(e);return t.ok?t.value:{ok:!1,error:Rs(t.error)}},close:async e=>{let t=await n.close(e);return t.ok?t.value:{ok:!1,error:Rs(t.error)}}},dispose:t}}let Bs={en:{selectModel:`Select model`,menu:`Model and reasoning effort`,model:`Model`,effort:`Effort`,providerDefault:`Default`,loading:`Refreshing model list…`,reload:`Reload`,emptyModels:`No models available.`,emptyEfforts:`This model provides no reasoning effort levels.`,aria:(e,t)=>t===void 0?`Select model, current ${e}`:`Select model, current ${e}, reasoning effort ${t}`,operationFailed:e=>`Model operation failed: ${e}`,groupFailed:(e,t)=>`${e} failed to load: ${t}`},"zh-CN":{selectModel:`选择模型`,menu:`模型与推理等级`,model:`模型`,effort:`推理等级`,providerDefault:`Default`,loading:`正在刷新模型列表…`,reload:`重新加载`,emptyModels:`没有可用的模型。`,emptyEfforts:`当前模型未提供推理等级。`,aria:(e,t)=>t===void 0?`选择模型，当前 ${e}`:`选择模型，当前 ${e}，推理等级 ${t}`,operationFailed:e=>`模型操作失败：${e}`,groupFailed:(e,t)=>`${e} 加载失败：${t}`}};function Vs(e,t,n){return e?.provider===t&&e.model===n}function Hs(e,t){return e.provider===t.provider&&e.model===t.model&&e.reasoningEffort===t.reasoningEffort}function Us(e,t,n){let r=t.find(t=>Vs(e,t.group.id,t.model.id));if(r===void 0)return n;let i=r.model.reasoning;return i===void 0?{provider:e.provider,model:e.model}:e.reasoningEffort===void 0||i.efforts.some(t=>t.id===e.reasoningEffort)?e:{provider:e.provider,model:e.model,...i.defaultEffort===void 0?{}:{reasoningEffort:i.defaultEffort}}}function Ws({directory:e,selection:t,locked:n,validateInitialSelection:o=!0,locale:s=`en`,onInitialize:c,onSelect:l}){let u=Bs[s],d=(0,r.useSyncExternalStore)(t=>e.store.subscribe(t),()=>e.store.getSnapshot(),()=>e.store.getSnapshot()),[f,p]=(0,r.useState)(!1),[m,h]=(0,r.useState)(`root`),[g,_]=(0,r.useState)(!1),[v,y]=(0,r.useState)(null),b=(0,r.useRef)(null),x=(0,r.useRef)(null),S=(0,r.useRef)([]),C=(0,r.useRef)(!1),w=(0,r.useRef)(0),T=(0,r.useRef)(0),E=(0,r.useId)(),D=(0,r.useMemo)(()=>d.groups.flatMap(e=>e.models.map(t=>({group:e,model:t}))),[d.groups]),O=t??d.current??void 0,k=D.find(e=>Vs(O,e.group.id,e.model.id)),A=k?.model.reasoning,j=O?.reasoningEffort??A?.defaultEffort,M=A===void 0?void 0:j===void 0?u.providerDefault:A.efforts.find(e=>e.id===j)?.name??j,ee=(0,r.useMemo)(()=>A===void 0?[]:[...A.defaultEffort===void 0?[{key:`provider-default`,effort:void 0,label:u.providerDefault}]:[],...A.efforts.map(e=>({key:`effort:${e.id}`,effort:e.id,label:e.name,...e.description===void 0?{}:{description:e.description}}))],[u.providerDefault,A]),te=k?.model.name??u.selectModel,ne=M===void 0?te:`${te} · ${M}`,re=()=>{e.load().catch(()=>void 0)};(0,r.useEffect)(()=>{re()},[e]),(0,r.useEffect)(()=>{if(C.current)return;if(t!==void 0&&!o){C.current=!0;return}if(d.current===null)return;let e={provider:d.current.provider,model:d.current.model,...d.current.reasoningEffort===void 0?{}:{reasoningEffort:d.current.reasoningEffort}};if(t===void 0){C.current=!0,c(e,{remember:!1});return}if(d.status!==`ready`)return;C.current=!0;let n=Us(t,D,e);Hs(t,n)||c(n,{remember:!0})},[D,c,t,d.current,d.status,o]),(0,r.useEffect)(()=>{if(!f)return;let e=e=>{b.current?.contains(e.target)||p(!1)};return document.addEventListener(`mousedown`,e),()=>{document.removeEventListener(`mousedown`,e)}},[f]);let ie=()=>{h(`root`),p(!0),re()},N=(e=!1)=>{p(!1),h(`root`),e&&queueMicrotask(()=>{x.current?.focus()})},ae=e=>{let t=S.current.filter(e=>e!==null);if(t.length===0)return;let n=t.findIndex(e=>e===document.activeElement);t[(Math.max(n,0)+e+t.length)%t.length]?.focus()},oe=e=>{if(e.key===`Escape`&&f){e.preventDefault(),m===`root`?N(!0):h(`root`);return}!f||e.key!==`ArrowDown`&&e.key!==`ArrowUp`||(e.preventDefault(),ae(e.key===`ArrowDown`?1:-1))},se=e=>{e.relatedTarget instanceof Node&&b.current?.contains(e.relatedTarget)||N()},ce=async e=>{let t=++w.current;_(!0);let n=await l(e);if(t===w.current){if(_(!1),!n.ok){T.current+=1,y({seq:T.current,text:u.operationFailed(n.error.message)});return}N(!0)}},le=(e,t)=>{if(Vs(O,e.id,t.id)){N(!0);return}ce({provider:e.id,model:t.id,...t.reasoning?.defaultEffort===void 0?{}:{reasoningEffort:t.reasoning.defaultEffort}})},ue=e=>{if(O!==void 0){if(j===e){N(!0);return}ce({provider:O.provider,model:O.model,...e===void 0?{}:{reasoningEffort:e}})}};S.current=[];let de=0,fe=()=>{let e=de++;return t=>{S.current[e]=t}};return(0,i.jsxs)(`div`,{ref:b,className:`dsh-side-chat-model-root`,"data-side-chat-model-select":``,onKeyDown:oe,onBlur:se,children:[(0,i.jsxs)(`button`,{ref:x,type:`button`,className:`dsh-side-chat-model-trigger`,"aria-label":u.aria(te,M),"aria-haspopup":`menu`,"aria-expanded":f,"aria-controls":f?`${E}-menu`:void 0,title:ne,disabled:n,onClick:()=>{f?N():ie()},children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-model-trigger-label`,children:te}),M!==void 0&&(0,i.jsx)(`span`,{className:`dsh-side-chat-model-trigger-effort`,children:M}),(0,i.jsx)(a.IconChevronDownOutline14,{className:`dsh-side-chat-model-chevron${f?` dsh-side-chat-model-chevron-open`:``}`})]}),f&&(0,i.jsxs)(`div`,{id:`${E}-menu`,className:`dsh-side-chat-model-menu`,role:`menu`,"aria-label":u.menu,"aria-busy":d.status===`loading`||g,children:[m===`root`&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(`button`,{ref:fe(),type:`button`,role:`menuitem`,className:`dsh-side-chat-model-cell`,onClick:()=>{h(`model`)},children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-label`,children:u.model}),(0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-value`,children:te}),(0,i.jsx)(a.IconChevronRightOutline14,{className:`dsh-side-chat-model-cell-chevron`})]}),A!==void 0&&(0,i.jsxs)(`button`,{ref:fe(),type:`button`,role:`menuitem`,className:`dsh-side-chat-model-cell`,onClick:()=>{h(`effort`)},children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-label`,children:u.effort}),(0,i.jsx)(`span`,{className:`dsh-side-chat-model-cell-value`,children:M}),(0,i.jsx)(a.IconChevronRightOutline14,{className:`dsh-side-chat-model-cell-chevron`})]})]}),m===`model`&&(0,i.jsxs)(i.Fragment,{children:[d.status===`loading`&&(0,i.jsx)(`div`,{className:`dsh-side-chat-model-status`,children:u.loading}),d.error!==null&&(0,i.jsxs)(`div`,{className:`dsh-side-chat-model-error`,role:`alert`,children:[(0,i.jsx)(`span`,{children:u.operationFailed(d.error)}),(0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-model-retry`,onClick:re,children:u.reload})]}),d.failures.map(e=>(0,i.jsxs)(`div`,{className:`dsh-side-chat-model-warning`,children:[(0,i.jsx)(`span`,{children:u.groupFailed(e.name,e.message)}),(0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-model-retry`,onClick:re,children:u.reload})]},e.id)),(0,i.jsx)(`div`,{className:`dsh-side-chat-model-groups scrollable`,children:d.groups.map(e=>{let t=`${E}-${e.id}`;return(0,i.jsxs)(`section`,{role:`group`,"aria-labelledby":t,className:`dsh-side-chat-model-group`,children:[(0,i.jsx)(`div`,{id:t,className:`dsh-side-chat-model-group-title`,children:e.name}),e.models.map(t=>{let n=Vs(O,e.id,t.id);return(0,i.jsxs)(`button`,{ref:fe(),type:`button`,role:`menuitemradio`,"aria-checked":n,className:`dsh-side-chat-model-option${n?` dsh-side-chat-model-selected`:``}`,title:t.name,disabled:g,onClick:()=>{le(e,t)},children:[(0,i.jsxs)(`span`,{className:`dsh-side-chat-model-option-copy`,children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-model-name`,children:t.name}),t.description!==void 0&&(0,i.jsx)(`span`,{className:`dsh-side-chat-model-description`,children:t.description})]}),(0,i.jsx)(`span`,{className:`dsh-side-chat-model-check`,children:n?(0,i.jsx)(a.IconCheckOutline16,{}):null})]},t.id)})]},e.id)})}),d.status===`ready`&&D.length===0&&(0,i.jsx)(`div`,{className:`dsh-side-chat-model-empty`,children:u.emptyModels})]}),m===`effort`&&(ee.length===0?(0,i.jsx)(`div`,{className:`dsh-side-chat-model-empty`,children:u.emptyEfforts}):ee.map(e=>{let t=j===e.effort;return(0,i.jsxs)(`button`,{ref:fe(),type:`button`,role:`menuitemradio`,"aria-checked":t,className:`dsh-side-chat-model-option${t?` dsh-side-chat-model-selected`:``}`,disabled:g,onClick:()=>{ue(e.effort)},children:[(0,i.jsxs)(`span`,{className:`dsh-side-chat-model-option-copy`,children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-model-name`,children:e.label}),e.description!==void 0&&(0,i.jsx)(`span`,{className:`dsh-side-chat-model-description`,children:e.description})]}),(0,i.jsx)(`span`,{className:`dsh-side-chat-model-check`,children:t?(0,i.jsx)(a.IconCheckOutline16,{}):null})]},e.key)}))]}),v!==null&&(0,i.jsx)(a.Toast,{text:v.text,icon:(0,i.jsx)(a.IconWarningOutline16,{}),anchor:b.current?.closest(`[data-composer-card]`)??null,onDone:()=>{y(null)}},v.seq)]})}function Gs(){return(0,i.jsx)(`svg`,{viewBox:`0 0 16 16`,width:`16`,height:`16`,"aria-hidden":`true`,children:(0,i.jsx)(`path`,{d:`M8.3125 0.980183C8.66767 1.0531 8.97902 1.20418 9.2627 1.43233C9.48724 1.61297 9.73029 1.85793 9.97949 2.10714L14.707 6.83468L13.293 8.24874L9 3.95577V15.0417H7V3.95577L2.70703 8.24874L1.29297 6.83468L6.02051 2.10714C6.26971 1.85793 6.51277 1.61297 6.7373 1.43233C6.97662 1.23986 7.28445 1.04402 7.6875 0.980183C7.8973 0.947006 8.1031 0.95516 8.3125 0.980183Z`,fill:`currentColor`})})}function Ks({children:e}){return(0,i.jsx)(`div`,{className:`dsh-side-chat-body`,children:e})}function qs({error:e,messages:t,onRetry:n}){return(0,i.jsxs)(`section`,{className:`dsh-side-chat-error`,role:`alert`,children:[(0,i.jsx)(`strong`,{children:e.code===`side_chat_destroy_failed`?t.closeError:t.genericError}),(0,i.jsx)(`p`,{children:e.message}),e.recoverable&&(0,i.jsx)(`button`,{type:`button`,onClick:n,children:t.retry})]})}function Js(){return(0,i.jsxs)(`svg`,{className:`dsh-side-chat-add-to-conversation-icon`,viewBox:`0 0 20 20`,"aria-hidden":`true`,children:[(0,i.jsx)(`path`,{d:`M4.25 4.5h11.5v8.25H9l-3.5 2.75v-2.75H4.25z`}),(0,i.jsx)(`path`,{d:`M10 6.5v4M8 8.5h4`})]})}function Ys({phase:e,messages:t,addToConversationDisabled:n=!1,onAddToConversation:r,onFocusParent:a,onClose:o}){return(0,i.jsxs)(`header`,{className:`dsh-side-chat-header`,children:[(0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-heading`,onClick:a,children:(0,i.jsx)(`strong`,{children:t.title})}),(0,i.jsxs)(`div`,{className:`dsh-side-chat-header-actions`,children:[r!==void 0&&(0,i.jsxs)(`button`,{type:`button`,className:`dsh-side-chat-add-to-conversation`,disabled:n,onClick:r,children:[(0,i.jsx)(Js,{}),(0,i.jsx)(`span`,{children:t.addToConversation})]}),(0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-close`,"aria-label":t.close,disabled:e===`closing`,onClick:o,children:`×`})]})]})}function Xs(e){let t=(0,r.useRef)(null);return(0,r.useLayoutEffect)(()=>{let e=t.current;if(e===null)return;e.style.height=`auto`;let n=Number.parseFloat(getComputedStyle(e).maxHeight),r=Number.isFinite(n)?Math.min(e.scrollHeight,n):e.scrollHeight;e.style.height=`${String(r)}px`,e.style.overflowY=Number.isFinite(n)&&e.scrollHeight>n?`auto`:`hidden`},[e]),t}function Zs({state:e,locale:t=`en`,embeddedConversation:n,modelControl:a,onDraftChange:o,onFirstSend:s,onClose:c,onRetry:l,onFocusParent:u,onAddToConversation:d,addToConversationDisabled:f,onRemoveSelection:p}){let m=he[t],[h,g]=(0,r.useState)(!1),_=Xs(e.draft),v=async t=>{if(t.preventDefault(),!h){g(!0);try{await s(e.draft)}finally{g(!1)}}};return(0,i.jsxs)(`aside`,{className:`dsh-side-chat-panel`,"data-side-chat-panel":``,"aria-label":m.title,"aria-busy":[`creating`,`opening`,`closing`].includes(e.phase)||void 0,children:[(0,i.jsx)(Ys,{phase:e.phase,messages:m,...d===void 0?{}:{onAddToConversation:d},...f===void 0?{}:{addToConversationDisabled:f},onFocusParent:u,onClose:()=>{c()}}),e.error!==void 0&&(0,i.jsx)(qs,{error:e.error,messages:m,onRetry:()=>{l()}}),e.childSessionId!==void 0&&n!==void 0?(0,i.jsx)(Ks,{children:n}):(0,i.jsxs)(`form`,{className:`dsh-side-chat-draft`,"data-composer-card":``,onSubmit:e=>{v(e)},children:[e.selection!==void 0&&(0,i.jsx)(ge,{selections:[e.selection],messages:m,...p===void 0?{}:{onRemove:p}}),(0,i.jsx)(`label`,{htmlFor:`dsh-side-chat-draft-input`,children:m.placeholder}),(0,i.jsx)(`textarea`,{id:`dsh-side-chat-draft-input`,ref:_,autoFocus:!0,rows:1,value:e.draft,disabled:[`creating`,`opening`,`closing`].includes(e.phase),placeholder:m.placeholder,onChange:e=>{o(e.target.value)},onKeyDown:e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),e.currentTarget.form?.requestSubmit())}}),(0,i.jsxs)(`div`,{className:`dsh-side-chat-draft-actions`,children:[a,(0,i.jsx)(`button`,{type:`submit`,className:`dsh-side-chat-send-button`,"aria-label":m.send,disabled:h||e.draft.trim().length===0,children:(0,i.jsx)(Gs,{})})]})]}),(0,i.jsxs)(`footer`,{className:`dsh-side-chat-footer`,children:[(0,i.jsx)(`span`,{children:m.temporary}),(0,i.jsx)(`span`,{children:m.referenceOnly}),(0,i.jsx)(`span`,{children:m.cannotReopen}),(0,i.jsx)(`span`,{children:m.sharedWorkspace})]}),(0,i.jsx)(`div`,{className:`dsh-side-chat-announcer`,"aria-live":`polite`,children:e.phase===`running`?`Side Chat running`:`Side Chat ${e.phase}`})]})}function Qs(e){return(e.nodeType===Node.ELEMENT_NODE?e:e.parentElement)?.closest(`[data-chat-anchor-key]`)??null}function $s(e,t){let n=e.parentElement;return n===null||!t.contains(n)||n.closest([`[data-selection-exclude]`,`[data-side-chat-panel]`,`[aria-hidden="true"]`,`button`,`textarea`,`input`,`[role="button"]`].join(`,`))!==null}function ec(e,t){let n=[],r=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),i=r.nextNode();for(;i!==null;){let e=i;$s(e,t)||n.push(e),i=r.nextNode()}return n}function tc(e,t){if(!e.intersectsNode(t))return;let n=e.startContainer===t?e.startOffset:0,r=e.endContainer===t?e.endOffset:t.data.length;if(n>0&&/[\uDC00-\uDFFF]/u.test(t.data[n]??``)&&/[\uD800-\uDBFF]/u.test(t.data[n-1]??``)&&--n,r>0&&r<t.data.length&&/[\uD800-\uDBFF]/u.test(t.data[r-1]??``)&&/[\uDC00-\uDFFF]/u.test(t.data[r]??``)&&(r+=1),!(r<=n))return{start:n,end:r,text:t.data.slice(n,r)}}async function nc(e){let t=e.selection?.rangeCount===1?e.selection.getRangeAt(0):void 0;if(t===void 0||t.collapsed)throw new P(`selection_empty`,`Select some conversation text first.`);if(!e.conversationRoot.contains(t.startContainer)||!e.conversationRoot.contains(t.endContainer))throw new P(`selection_outside_conversation`,`The selection must stay inside the current conversation.`);let n=Qs(t.startContainer),r=Qs(t.endContainer);if(n===null||r===null||n!==r)throw new P(`selection_crosses_unsupported_nodes`,`This compatibility adapter supports a selection inside one message only.`);let i=e.resolver.resolve(n);if(i===void 0)throw new P(`selection_stale`,`The selected message is no longer in the Session snapshot.`);let a=ec(n,e.conversationRoot),o=[],s,c,l=0;for(let e of a){let n=tc(t,e);n!==void 0&&(s??=l+n.start,c=l+n.end,o.push(n.text)),l+=e.data.length}if(s===void 0||c===void 0)throw new P(`selection_not_model_visible`,`The selection contains no supported visible text.`);let u=t.getBoundingClientRect();return await qe({parentSessionId:e.parentSessionId,fragments:[{...i,startOffset:s,endOffset:c,text:o.join(``)}],rawText:o.join(``),rect:{x:u.x,y:u.y,width:u.width,height:u.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}})}function rc(e,t){return[...e.querySelectorAll(`[data-chat-anchor-key]`)].find(e=>e.dataset.chatAnchorKey===t)}function ic(e,t){let n=rc(e,t.nodeKey);if(n===void 0)return;let r=ec(n,e),i=r.map(e=>e.data).join(``);if(!Number.isSafeInteger(t.startOffset)||!Number.isSafeInteger(t.endOffset)||t.startOffset<0||t.endOffset<=t.startOffset||t.endOffset>i.length||i.slice(t.startOffset,t.endOffset)!==t.text)return;let a=[],o=0;for(let e of r){let n=o+e.data.length,r=Math.max(t.startOffset,o)-o,i=Math.min(t.endOffset,n)-o;if(i>r){let t=document.createRange();t.setStart(e,r),t.setEnd(e,i),a.push(t)}if(o=n,o>=t.endOffset)break}return a.length===0?void 0:a}function ac(e){let t=[];for(let n of e.selection.fragments){let r=ic(e.conversationRoot,n);if(r===void 0)return;t.push(...r)}let n=t[0],r=t.at(-1);if(n===void 0||r===void 0)return;let i=document.createRange();return i.setStart(n.startContainer,n.startOffset),i.setEnd(r.endContainer,r.endOffset),{ranges:t,browserRange:i}}let oc=`dsh-side-chat-annotations`,sc=`dsh-side-chat-active-annotation`;function cc(e,t,n){return Math.min(Math.max(t,e),Math.max(t,n))}function lc(e){let t=Number.isFinite(e.left)?e.left:e.x,n=Number.isFinite(e.top)?e.top:e.y,r=Number.isFinite(e.right)?e.right:t+e.width,i=Number.isFinite(e.bottom)?e.bottom:n+e.height;return[t,n,r,i].every(Number.isFinite)?{left:t,top:n,right:r,bottom:i}:void 0}function uc(e){let t=[];for(let n of e){let e=typeof n.getClientRects==`function`?[...n.getClientRects()]:[],r=e.length>0?e:typeof n.getBoundingClientRect==`function`?[n.getBoundingClientRect()]:[];for(let e of r){let n=lc(e);n!==void 0&&(n.right>n.left||n.bottom>n.top)&&t.push(n)}}if(t.length!==0)return{left:Math.min(...t.map(e=>e.left)),top:Math.min(...t.map(e=>e.top)),right:Math.max(...t.map(e=>e.right)),bottom:Math.max(...t.map(e=>e.bottom))}}function dc(e){return{x:e.left,y:e.top,width:e.right-e.left,height:e.bottom-e.top,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}}function fc(e){let t={left:0,top:0,right:window.innerWidth,bottom:window.innerHeight},n=e.startContainer,r=(n.nodeType===Node.ELEMENT_NODE?n:n.parentElement)?.closest(`[data-conversation-scroll]`);if(r==null)return t;let i=lc(r.getBoundingClientRect());i!==void 0&&i.right>i.left&&i.bottom>i.top&&(t={left:Math.max(t.left,i.left),top:Math.max(t.top,i.top),right:Math.min(t.right,i.right),bottom:Math.min(t.bottom,i.bottom)});let a=r.querySelector(`[data-composer-seat]`),o=a===null?void 0:lc(a.getBoundingClientRect());return o!==void 0&&o.right>o.left&&o.bottom>o.top&&o.bottom>t.top&&o.top<t.bottom&&(t={...t,bottom:Math.min(t.bottom,o.top)}),t}function pc(e,t){return e.right>t.left&&e.bottom>t.top&&e.left<t.right&&e.top<t.bottom}function mc(e,t){return e.length===t.length&&e.every((e,n)=>{let r=t[n];return r!==void 0&&r.annotationIndex===e.annotationIndex&&r.left===e.left&&r.top===e.top})}function hc(){typeof CSS>`u`||CSS.highlights===void 0||(CSS.highlights.delete(oc),CSS.highlights.delete(sc))}function gc(e,t){if(typeof CSS>`u`||CSS.highlights===void 0||typeof Highlight>`u`)return;if(CSS.highlights.set(oc,new Highlight(...e)),t.length===0){CSS.highlights.delete(sc);return}let n=new Highlight(...t);n.priority=1,CSS.highlights.set(sc,n)}function _c(e){let t=window.getSelection();t!==null&&(t.removeAllRanges(),t.addRange(e))}function vc({annotations:e,activeAnnotationIndex:t,onEdit:n}){let a=(0,r.useRef)(new Map),[o,s]=(0,r.useState)([]);return(0,r.useEffect)(()=>{if(e.length===0){a.current.clear(),s(e=>e.length===0?e:[]),hc();return}let n,r=null,i,o=()=>{n=void 0;let o=document.querySelector(`[data-chat-flow]`);o!==r&&(i?.disconnect(),r=o,o!==null&&i?.observe(o));let c=new Map,l=[],u=[],d=[];if(o!==null)for(let n of e){let e=ac({selection:n.selection,conversationRoot:o});if(e===void 0)continue;u.push(...e.ranges),n.annotationIndex===t&&d.push(...e.ranges);let r=uc(e.ranges),i=fc(e.browserRange);if(r===void 0||!pc(r,i))continue;let a=dc(r);c.set(n.annotationIndex,{browserRange:e.browserRange,rect:a}),l.push({annotationIndex:n.annotationIndex,left:cc(r.right+3,i.left+4,i.right-26),top:cc(r.top-12,i.top+4,i.bottom-26)})}a.current=c,s(e=>mc(e,l)?e:l),gc(u,d)},c=()=>{n===void 0&&(n=window.requestAnimationFrame(o))};i=typeof ResizeObserver>`u`?void 0:new ResizeObserver(c),o();let l=new MutationObserver(c);return l.observe(document.body,{childList:!0,characterData:!0,subtree:!0}),document.addEventListener(`scroll`,c,!0),window.addEventListener(`resize`,c),()=>{n!==void 0&&window.cancelAnimationFrame(n),l?.disconnect(),i?.disconnect(),document.removeEventListener(`scroll`,c,!0),window.removeEventListener(`resize`,c),hc()}},[t,e]),o.map(r=>{let o=e.find(e=>e.annotationIndex===r.annotationIndex);if(o===void 0)return null;let s={left:r.left,top:r.top},c=o.annotationIndex+1,l=c>99?`99+`:String(c);return(0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-annotation-marker`,style:s,"data-active":o.annotationIndex===t||void 0,"data-large":c>99||void 0,"aria-label":`Edit annotation ${String(c)}`,title:`Edit annotation ${String(c)}`,onMouseDown:e=>{e.preventDefault(),e.stopPropagation()},onClick:()=>{let e=a.current.get(o.annotationIndex);e!==void 0&&(_c(e.browserRange),n(o,{...o.selection,rect:e.rect}),window.requestAnimationFrame(()=>{_c(e.browserRange)}))},children:l},`${o.selection.parentSessionId}:${o.selection.fragments[0]?.nodeKey??``}:${String(o.annotationIndex)}`)})}function yc(e,t,n){return Math.min(Math.max(t,e),Math.max(t,n))}function bc(e,t,n,r={width:e.viewportWidth,height:e.viewportHeight}){let i=Math.max(0,t.width),a=Math.max(0,t.height),o=r.offsetLeft??0,s=r.offsetTop??0,c=o+r.width,l=s+r.height,u=yc(e.x+e.width/2-i/2,o+8,c-i-8),d=n?12:8,f=n?64:8,p=e.y+e.height+d,m=e.y-a-f,h=p+a<=l-8,g=m>=s+8,_;return _=h?p:g||e.y-f-s-8>=l-8-e.y-e.height-d?m:p,{left:u,top:yc(_,s+8,l-a-8)}}function xc({selection:e,touchInteraction:t=!1,askDisabledReason:n,annotationNumber:a=1,annotationEditor:o,onAddToChat:s,onMoreDetails:c,onAskInSideChat:l,onAnnotationEditorChange:u,onRemoveAnnotation:d,onDismiss:f}){let[p,m]=(0,r.useState)(o!==void 0),[h,g]=(0,r.useState)(o?.initialComment??``),[_,v]=(0,r.useState)(()=>({width:0,height:0})),[y,b]=(0,r.useState)(()=>({width:e.rect.viewportWidth,height:e.rect.viewportHeight,offsetLeft:0,offsetTop:0})),x=(0,r.useRef)(null),S=(0,r.useRef)(null),C=(0,r.useRef)(null),w=bc(e.rect,_,t,y),T={left:w.left,top:w.top},E=y.offsetLeft,D=y.offsetTop,O=E+y.width,k=D+y.height,A=Math.max(0,Math.min(420,y.width-16)),j=e.rect.y-118,M=e.rect.y+e.rect.height+12,ee={left:yc(e.rect.x+e.rect.width+28,E+8,O-A-8),top:yc(j>=D+8?j:M,D+8,k-118-8),width:A},te={left:yc(e.rect.x+e.rect.width+3,E+4,O-22-4),top:yc(e.rect.y-12,D+4,k-22-4)},ne=a>99?`99+`:String(a),re=e=>{e.preventDefault()};(0,r.useLayoutEffect)(()=>{let t=window.visualViewport,n=()=>{let n={width:t?.width??window.innerWidth??e.rect.viewportWidth,height:t?.height??window.innerHeight??e.rect.viewportHeight,offsetLeft:t?.offsetLeft??0,offsetTop:t?.offsetTop??0};b(e=>e.width===n.width&&e.height===n.height&&e.offsetLeft===n.offsetLeft&&e.offsetTop===n.offsetTop?e:n);let r=S.current;if(r===null)return;let i=r.getBoundingClientRect(),a={width:i.width,height:i.height};v(e=>e.width===a.width&&e.height===a.height?e:a)};n();let r=S.current,i=typeof ResizeObserver>`u`?void 0:new ResizeObserver(n);return r!==null&&i?.observe(r),window.addEventListener(`resize`,n),t?.addEventListener(`resize`,n),t?.addEventListener(`scroll`,n),()=>{i?.disconnect(),window.removeEventListener(`resize`,n),t?.removeEventListener(`resize`,n),t?.removeEventListener(`scroll`,n)}},[p,e,t]),(0,r.useEffect)(()=>{p&&x.current?.focus()},[p]);let ie=()=>{m(!1),g(``),u?.(!1),f()},N=()=>{let t=h.trim();s(e,t.length===0?void 0:t),u?.(!1),f()},ae=e=>{e.preventDefault(),N()},oe=e=>{if(e.key===`Escape`){e.preventDefault(),e.stopPropagation(),ie();return}e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),N())},se=()=>{m(!0),u?.(!0)},ce=()=>{c(e),f()},le=()=>{l(e),f()},ue=(e,n)=>{t&&e.pointerType===`touch`&&!e.currentTarget.disabled&&(e.preventDefault(),C.current={target:e.currentTarget,timeStamp:e.timeStamp},n())},de=(e,t)=>{let n=C.current;C.current=null;let r=n===null?1/0:e.timeStamp-n.timeStamp;if(e.detail!==0&&n?.target===e.currentTarget&&r>=0&&r<1e3){e.preventDefault();return}t()};return p?(0,i.jsxs)(i.Fragment,{children:[o===void 0&&(0,i.jsx)(`span`,{className:`dsh-side-chat-selection-marker`,"aria-hidden":`true`,"data-large":a>99||void 0,style:te,children:ne}),(0,i.jsxs)(`form`,{className:`dsh-side-chat-selection-comment`,role:`dialog`,"aria-label":o?.dialogLabel??`Add annotation comment`,style:ee,onSubmit:ae,onMouseDown:e=>{e.stopPropagation()},onKeyUp:e=>{e.stopPropagation()},children:[(0,i.jsx)(`textarea`,{ref:x,value:h,rows:2,"aria-label":`Optional annotation comment`,placeholder:`Add an optional comment…`,onChange:e=>{g(e.currentTarget.value)},onKeyDown:oe}),(0,i.jsxs)(`div`,{className:`dsh-side-chat-selection-comment-actions`,children:[o!==void 0&&d!==void 0&&(0,i.jsx)(`button`,{type:`button`,onClick:d,children:`Remove`}),(0,i.jsx)(`button`,{type:`button`,onClick:ie,children:`Cancel`}),(0,i.jsx)(`button`,{type:`submit`,className:`dsh-side-chat-selection-comment-save`,children:`Save`})]})]})]}):(0,i.jsxs)(`div`,{ref:S,className:`dsh-side-chat-selection-actions`,role:`toolbar`,"aria-label":`Selected conversation text actions`,"data-touch":t||void 0,style:T,onMouseDown:re,onPointerDown:e=>{t&&e.pointerType===`touch`&&e.preventDefault()},onKeyDown:e=>{e.key===`Escape`&&f()},children:[(0,i.jsx)(`button`,{type:`button`,onPointerDown:e=>{ue(e,se)},onClick:e=>{de(e,se)},children:`Add to chat`}),(0,i.jsx)(`button`,{type:`button`,disabled:n!==void 0,title:n,onPointerDown:e=>{ue(e,ce)},onClick:e=>{de(e,ce)},children:`More details`}),(0,i.jsx)(`button`,{type:`button`,disabled:n!==void 0,title:n,onPointerDown:e=>{ue(e,le)},onClick:e=>{de(e,le)},children:`Ask in side chat`})]})}function Sc(){return(0,i.jsx)(`svg`,{viewBox:`0 0 16 16`,width:`16`,height:`16`,"aria-hidden":`true`,children:(0,i.jsx)(`rect`,{x:`3`,y:`3`,width:`10`,height:`10`,rx:`3`,fill:`currentColor`})})}let Cc=e=>`Show ${String(e)} hidden line${e===1?``:`s`}`,wc={code:{copyLabel:`Copy`,copiedLabel:`Copied`},footnotes:`Footnotes`},Tc={signal:e=>`Signal ${e}`,exitCode:e=>`Exit ${String(e)}`,running:`Running`,failed:`Failed`,done:`Done`,copy:`Copy`,copied:`Copied`,noOutput:`No output`,collapseAria:`Collapse command output`,collapse:`Collapse`,expandAria:Cc,expand:Cc},Ec={window:(e,t)=>`Showing ${String(e)} of ${String(t)} lines`,copy:`Copy`,copied:`Copied`,collapseAria:`Collapse file content`,expandAria:Cc,collapse:`Collapse`,expand:Cc},Dc={copy:`Copy`,copied:`Copied`,collapseAria:`Collapse diff`,expandAria:Cc,collapse:`Collapse`,expand:Cc,files:e=>`${String(e)} file${e===1?``:`s`}`},Oc={pathsSummary:(e,t,n)=>n?`Showing ${String(e)} of ${String(t)} paths`:`${String(t)} path${t===1?``:`s`}`,matchesSummary:(e,t,n,r)=>{let i=`${String(e)} match${e===1?``:`es`} in ${String(n)} file${n===1?``:`s`}`;return r?`${i} (${String(t)} total)`:i},copy:`Copy`,copied:`Copied`,noResults:`No results`,collapseAria:`Collapse search results`,expandAria:Cc,collapse:`Collapse`,expand:Cc},kc={noResults:`No results`,sourcesTruncated:`Sources truncated`,http:`HTTP`,contentTruncated:`Content truncated`,markdown:wc},Ac={bash:`bash`,pwsh:`bash`,read:`read`,web_fetch:`read`,web_search:`search`,grep:`search`,glob:`search`,write:`write`,edit:`edit`,run_code:`code`},jc={search:`Search`,read:`Read`,bash:`Bash`,write:`Write`,edit:`Edit`,code:`Code`,others:`Tool call`},Mc={bash:[`description`,`command`],read:[`path`,`file_path`,`url`],search:[`query`,`pattern`,`url`],write:[`path`,`file_path`],edit:[`path`,`file_path`],code:[`description`],others:[]};function Z(e){return typeof e==`object`&&e&&!Array.isArray(e)?e:null}function Q(e){return typeof e==`string`&&e!==``?e:void 0}function Nc(e){return typeof e==`number`&&Number.isFinite(e)?e:void 0}function Pc(e){return typeof e==`boolean`?e:void 0}function Fc(e){let t=e.indexOf(`
`);return t===-1?e:e.slice(0,t)}function Ic(e){if(typeof e==`string`)return e;try{return JSON.stringify(e,null,2)}catch{return String(e)}}function Lc(e){return e.map(e=>e.type===`text`||e.type===`reasoning`?e.text:e.type===`image`?`[Image]`:e.type===`tool-call`?`${e.name}(${e.arguments})`:e.type===`tool-result`?Lc(e.content):Ic(e)).filter(Boolean).join(`
`)}function Rc(e){let t=Lc(e);return/^<path>[\s\S]*?<\/path>\s*<type>[\s\S]*?<\/type>\s*<content>\s*\n?([\s\S]*?)\n?<\/content>\s*$/u.exec(t)?.[1]?.trimEnd()??t}function zc(e){try{return Z(JSON.parse(e))}catch{return null}}function Bc(e){try{return JSON.stringify(JSON.parse(e),null,2)}catch{return e}}function Vc(e){return Ac[e.toLowerCase()]??`others`}function Hc(e,t){return e.toLowerCase()===`pwsh`?`Pwsh`:jc[t]}function Uc(e,t){for(let n of t){let t=Q(e[n]);if(t!==void 0)return t}return Object.values(e).find(e=>typeof e==`string`&&e!==``)}function Wc(e,t){if(t===void 0||t===``)return e;let n=t.replace(/[/\\]+$/u,``),r=e.toLowerCase(),i=n.toLowerCase();return r.startsWith(`${i}/`)||r.startsWith(`${i}\\`)?e.slice(n.length+1):e}function Gc(e,t,n,r,i){let a=zc(n),o=Wc(Fc((a===null?void 0:Uc(a,Mc[t]))??(n===``||n===`{}`?r:n)),i);return t===`others`&&e!==``?`${e} · ${o}`:o}function Kc(e,t){if(e!==`read`&&e!==`write`&&e!==`edit`)return;let n=zc(t);if(n!==null)return Q(n.path)??Q(n.file_path)}function qc(e){switch(e){case`search`:return(0,i.jsx)(a.IconSearchOutline16,{size:14});case`read`:return(0,i.jsx)(a.IconBrowseOutline16,{size:14});case`bash`:return(0,i.jsx)(a.IconApiOutline14,{size:14});case`write`:case`edit`:return(0,i.jsx)(a.IconEditOutline16,{size:14});case`code`:return(0,i.jsx)(a.IconCodeOutline16,{size:14});case`others`:return(0,i.jsx)(a.IconSparkle16,{size:14})}}function Jc(e,t){return e===void 0||e===``?t:t===void 0||t===``||/^(?:[A-Za-z]:[/\\]|[/\\]{1,2})/u.test(e)?e:`${t.replace(/[/\\]+$/u,``)}\\${e}`}function Yc(e,t,n,r,i,a,o){let s=Z(i),c=Z(a),l=s?.card===`terminal`,u=c?.card===`terminal`;if(e!==`bash`&&!l&&!u)return null;let d=zc(t);return{command:Q(c?.title)??Q(s?.title)??(d===null?void 0:Q(d.command))??``,cwd:Jc(Q(s?.cwd),o),output:Q(c?.output)??r,exitCode:Nc(c?.exitCode),signal:Q(c?.signal),running:n===`running`||n===`pending`,description:Q(s?.description)}}function Xc(e){if(e===void 0)return;let t=/\.([^.\\/]+)$/u.exec(e)?.[1]?.toLowerCase();return t===void 0?void 0:{js:`javascript`,jsx:`jsx`,ts:`typescript`,tsx:`tsx`,json:`json`,css:`css`,html:`html`,md:`markdown`,yml:`yaml`,yaml:`yaml`,py:`python`,ps1:`powershell`,sh:`bash`,toml:`toml`,xml:`xml`}[t]}function Zc(e){if(!Array.isArray(e))return null;let t=[];for(let n of e){let e=Z(n),r=Nc(e?.number),i=Q(e?.text)??(e?.text===``?``:void 0);if(r===void 0||i===void 0)return null;t.push({number:r,text:i})}return t}function Qc(e,t,n,r,i,a){if(n===`running`||n===`pending`||n===`error`||n===`interrupted`)return null;let o=Z(i);if(o?.card===`read`){let e=Zc(o.lines),t=Nc(o.totalLines),n=Q(o.path);return e===null||t===void 0?null:{label:Q(o.title)??(n===void 0?void 0:Wc(n,a)),lines:e,totalLines:t,lang:Q(o.lang)}}if(e.toLowerCase()!==`read`||r===void 0)return null;let s=Kc(`read`,t),c=r.split(`
`);return{label:s===void 0?void 0:Wc(s,a),lines:c.map((e,t)=>({number:t+1,text:e})),totalLines:c.length,lang:Xc(s)}}function $c(e){let t=Z(e);if(t?.card!==`search`)return null;let n=Pc(t.truncated),r=Nc(t.total);if(n===void 0||r===void 0)return null;if(t.shape===`paths`){let e=t.paths;return Array.isArray(e)&&e.every(e=>typeof e==`string`)?{kind:`paths`,paths:e,truncated:n,total:r,labels:Oc}:null}if(t.shape!==`matches`||!Array.isArray(t.files))return null;let i=[];for(let e of t.files){let t=Z(e),n=Q(t?.path),r=t?.matches;if(n===void 0||!Array.isArray(r))return null;let a=[];for(let e of r){let t=Z(e),n=Nc(t?.lineNumber),r=Q(t?.line)??(t?.line===``?``:void 0);if(n===void 0||r===void 0)return null;a.push({lineNumber:n,line:r})}i.push({path:n,matches:a})}return{kind:`matches`,files:i,truncated:n,total:r,labels:Oc}}function el(e){let t=Z(e);if(t?.card!==`diff`||!Array.isArray(t.diffs)||t.diffs.length===0)return null;let n=[];for(let e of t.diffs){let t=Z(e),r=Q(t?.path),i=t?.oldText,a=Q(t?.newText)??(t?.newText===``?``:void 0);if(r===void 0||i!==null&&typeof i!=`string`||a===void 0)return null;n.push({path:r,oldText:i,newText:a})}return n}function tl(e){let t=Z(e);if(t?.card!==`web`)return null;let n=Pc(t.truncated);if(n===void 0)return null;if(t.kind===`fetch`){let e=Q(t.url),r=Nc(t.statusCode);return e===void 0||r===void 0?null:{kind:`fetch`,url:e,statusCode:r,truncated:n,labels:kc}}if(t.kind!==`search`||!Array.isArray(t.sources))return null;let r=[];for(let e of t.sources){let t=Z(e),n=Q(t?.url);if(n===void 0)return null;let i=Q(t?.title),a=Q(t?.snippet),o=Q(t?.publishedAt);r.push({url:n,...i===void 0?{}:{title:i},...a===void 0?{}:{snippet:a},...o===void 0?{}:{publishedAt:o}})}let i=Q(t.answer);return{kind:`search`,sources:r,truncated:n,labels:kc,...i===void 0?{}:{answer:i}}}function nl(e,t){return t===``||t===`{}`||e===`read`||e===`write`||e===`edit`?null:Bc(t)}function rl(e,t){return e===`error`?(0,i.jsx)(a.StateDot,{state:`error`}):e===`interrupted`?(0,i.jsx)(a.StateDot,{state:`warning`}):t}function il(e){return e===`running`||e===`pending`?`Running`:e===`error`?`Failed`:e===`interrupted`?`Stopped`:null}function al({callId:e,name:t,argsRaw:n,state:o,output:s,callView:c,resultView:l,cwd:u}){let[d,f]=(0,r.useState)(!1),p=Vc(t),m=Yc(p,n,o,s,c,l,u),h=m!==null&&!m.running&&(m.exitCode!==void 0&&m.exitCode!==0||m.signal!==void 0),g=o===`success`&&h?`error`:o,_=Qc(t,n,g,s,l,u),v=$c(l),y=el(l)??el(c),b=tl(l),x=zc(n),S=p===`code`&&x!==null?Q(x.code):void 0,C=nl(p,n),w=m?.description??Q(Z(l)?.title)??Gc(t,p,n,e,u),T=g===`error`&&s!==void 0?Fc(s):null,E=T??w,D=m!==null||_!==null||v!==null||y!==null||b!==null||S!==void 0||C!==null||s!==void 0,O=d&&D,k=il(g);return(0,i.jsxs)(`section`,{className:`dsh-side-chat-tool`,"data-call-id":e,"data-state":g,"data-expanded":O||void 0,children:[k!==null&&(0,i.jsx)(`span`,{className:`dsh-side-chat-tool-visually-hidden`,children:k}),(0,i.jsx)(a.DisclosureRow,{rowClassName:`dsh-side-chat-tool-row`,leadingClassName:`dsh-side-chat-tool-leading`,titleClassName:`dsh-side-chat-tool-title`,chevronClassName:`dsh-side-chat-tool-chevron`,icon:rl(g,qc(p)),title:Hc(t,p),open:O,expandable:D,expandOnRowClick:!0,keepContentWhenOpen:!0,onToggle:()=>{f(e=>!e)},collapsedContent:E!==``&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-tool-separator`,"aria-hidden":`true`}),(0,i.jsx)(`span`,{className:T===null?`dsh-side-chat-tool-summary`:`dsh-side-chat-tool-summary dsh-side-chat-tool-error-summary`,children:E})]}),children:(0,i.jsx)(`div`,{className:`dsh-side-chat-tool-body-wrap`,children:m===null?_===null?v===null?y===null?b===null?S===void 0?(C!==null||s!==void 0)&&(0,i.jsxs)(`div`,{className:`dsh-side-chat-tool-io-card`,children:[C!==null&&(0,i.jsxs)(`div`,{className:`dsh-side-chat-tool-io-section`,children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-tool-io-label`,children:`IN`}),(0,i.jsx)(`span`,{className:`dsh-side-chat-tool-io-text`,children:C})]}),C!==null&&s!==void 0&&(0,i.jsx)(`span`,{className:`dsh-side-chat-tool-io-divider`,"aria-hidden":`true`}),s!==void 0&&(0,i.jsxs)(`div`,{className:`dsh-side-chat-tool-io-section`,children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-tool-io-label`,children:`OUT`}),(0,i.jsx)(`span`,{className:`dsh-side-chat-tool-io-text`,"data-error":g===`error`||void 0,children:s})]})]}):(0,i.jsx)(a.CodeBlock,{code:S,lang:`typescript`,copyLabel:`Copy`,copiedLabel:`Copied`,className:`dsh-side-chat-tool-code`}):(0,i.jsx)(a.WebBlock,{...b,className:`dsh-side-chat-tool-web`}):(0,i.jsx)(a.DiffBlock,{diffs:y,labels:Dc,maxLines:8,className:`dsh-side-chat-tool-diff`}):(0,i.jsx)(a.SearchBlock,{...v,maxLines:8,className:`dsh-side-chat-tool-search`}):(0,i.jsx)(a.ReadBlock,{..._,labels:Ec,maxLines:8,className:`dsh-side-chat-tool-read`}):(0,i.jsx)(a.TerminalBlock,{command:m.command,cwd:m.cwd,output:m.output,exitCode:m.exitCode,signal:m.signal,running:m.running,maxLines:1/0,className:`dsh-side-chat-tool-terminal`,labels:Tc})})})]})}function ol(e,t){if(!e.isError)return`success`;let n=`${e.error?.name??``} ${e.error?.code??``} ${t}`;return/\b(?:aborted|cancelled|canceled)\b/iu.test(n)?`interrupted`:`error`}function sl({block:e,cwd:t}){let n=e,r=`kind`in e,a=r?Rc(e.content):void 0,o=r?ol(e,a??``):`running`,s=r?e.call?.name??e.callId:e.name,c=r?e.call?.argsRaw??`{}`:e.argsRaw;return(0,i.jsxs)(`div`,{className:`dsh-side-chat-tool-branch`,children:[(0,i.jsx)(al,{callId:e.callId,name:s,argsRaw:c,state:o,output:a,callView:n.callView,resultView:r?n.resultView:null,cwd:t}),e.subCalls.length>0&&(0,i.jsx)(`div`,{className:`dsh-side-chat-tool-subcalls`,"data-subcalls":!0,children:e.subCalls.map(e=>(0,i.jsx)(sl,{block:e,cwd:t},e.callId))})]})}function cl({call:e,cwd:t}){return(0,i.jsx)(sl,{block:e,cwd:t})}function ll(e){if(typeof e==`string`)return e;try{return JSON.stringify(e,null,2)}catch{return String(e)}}function ul(e){return e.map(e=>e.type===`text`||e.type===`reasoning`?e.text:e.type===`image`?`[Image]`:e.type===`tool-call`?`${e.name}(${e.arguments})`:e.type===`tool-result`?ul(e.content):ll(e)).filter(Boolean).join(`
`)}function dl(e){return/<user_question>([\s\S]*?)<\/user_question>/u.exec(e)?.[1]?.trim()??e}function fl(e){let t=e.indexOf(`
`);return t===-1?e:e.slice(0,t)}function pl(e){let t=e.trimEnd(),n=t.lastIndexOf(`
`);return n===-1?t:t.slice(n+1)}function ml(e,t=3){let n=(0,r.useRef)(e);n.current=e;let i=(0,r.useRef)(null);return(0,r.useLayoutEffect)(()=>()=>{i.current!==null&&(cancelAnimationFrame(i.current),i.current=null)},[]),(0,r.useCallback)(()=>{if(i.current!==null)return;let e=t,r=()=>{if(--e,e>0){i.current=requestAnimationFrame(r);return}i.current=null,n.current()};i.current=requestAnimationFrame(r)},[t])}function hl({text:e,running:t,locale:n}){let[o,s]=(0,r.useState)(!1),c=(0,r.useRef)(null),l=t?pl(e):fl(e),u=ml(()=>{let e=c.current;e!==null&&(e.scrollLeft=t?e.scrollWidth-e.clientWidth:0)});return(0,r.useEffect)(()=>{u()},[t,u,l]),(0,i.jsxs)(`div`,{className:`dsh-side-chat-reasoning`,"data-variant":`think`,"data-state":t?`running`:`ok`,children:[t&&(0,i.jsx)(`span`,{className:`dsh-side-chat-reasoning-visually-hidden`,children:n===`zh-CN`?`运行中`:`Running`}),(0,i.jsx)(a.DisclosureRow,{rowClassName:`dsh-side-chat-reasoning-row`,leadingClassName:`dsh-side-chat-reasoning-leading`,titleClassName:`dsh-side-chat-reasoning-title`,chevronClassName:`dsh-side-chat-reasoning-chevron`,icon:(0,i.jsx)(a.IconThinkOutline14,{size:14}),title:`Think`,open:o,expandable:!0,expandOnRowClick:!0,onToggle:()=>{s(e=>!e)},collapsedContent:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-reasoning-separator`,"aria-hidden":`true`}),(0,i.jsx)(`span`,{ref:c,className:`dsh-side-chat-reasoning-summary`,"data-follow-end":t||void 0,children:l})]}),children:(0,i.jsx)(`div`,{className:`dsh-side-chat-reasoning-body`,children:e})})]})}function gl({blocks:e,streaming:t=!1,projectedToolCallIds:n,unprojectedToolState:r=`pending`,cwd:o,locale:s}){return(0,i.jsx)(i.Fragment,{children:e.map((c,l)=>{let u=`${c.kind}-${String(l)}`;return c.kind===`text`?(0,i.jsx)(a.MarkdownText,{text:c.text,streaming:t,labels:wc},u):c.kind===`reasoning`?(0,i.jsx)(hl,{text:c.text,running:t&&l===e.length-1,locale:s},u):c.kind===`image`?(0,i.jsx)(`div`,{children:`[Image attachment]`},u):c.kind===`tool-call`?n.has(c.callId)?null:(0,i.jsx)(al,{callId:c.callId,name:c.name,argsRaw:c.argsRaw,state:r,cwd:o},u):(0,i.jsx)(`pre`,{children:ll(c.block)},u)})})}function _l({node:e,projectedToolCallIds:t,cwd:n,locale:r}){return e.kind===`user`||e.kind===`steering`?(0,i.jsxs)(`article`,{className:`dsh-side-chat-message`,"data-role":`user`,children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-message-role`,children:`You`}),(0,i.jsx)(`div`,{className:`dsh-side-chat-message-text`,children:dl(ul(e.content))})]}):e.kind===`assistant`?(0,i.jsxs)(`article`,{className:`dsh-side-chat-message`,"data-role":`assistant`,children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-message-role`,children:`Assistant`}),(0,i.jsx)(gl,{blocks:e.blocks,projectedToolCallIds:t,unprojectedToolState:e.interrupted===!0?`interrupted`:`pending`,cwd:n,locale:r}),e.interrupted===!0&&(0,i.jsx)(`span`,{className:`dsh-side-chat-message-note`,children:`Stopped`})]}):e.kind===`context`?(0,i.jsxs)(`details`,{className:`dsh-side-chat-message dsh-side-chat-context-message`,children:[(0,i.jsxs)(`summary`,{children:[`Context · `,e.provenance.label??e.provenance.role]}),(0,i.jsx)(`pre`,{children:ul(e.content)})]}):e.kind===`tool-result`?(0,i.jsx)(sl,{block:e,cwd:n}):e.kind===`turn-error`?(0,i.jsx)(`div`,{className:`dsh-side-chat-turn-notice`,role:`alert`,children:e.message}):e.kind===`turn-max-tokens`?(0,i.jsx)(`div`,{className:`dsh-side-chat-turn-notice`,children:`The response reached its output-token limit.`}):e.kind===`model-retry`?(0,i.jsxs)(`div`,{className:`dsh-side-chat-turn-notice`,children:[`Model retry: `,e.retryState]}):e.kind===`command`?(0,i.jsxs)(`div`,{className:`dsh-side-chat-turn-notice`,children:[`/`,e.name??`command`,` `,e.outcome?.text??``]}):e.kind===`compaction`?(0,i.jsxs)(`details`,{className:`dsh-side-chat-turn-notice`,children:[(0,i.jsx)(`summary`,{children:`Context compacted`}),(0,i.jsx)(`pre`,{children:e.summary})]}):(0,i.jsxs)(`details`,{className:`dsh-side-chat-turn-notice`,children:[(0,i.jsx)(`summary`,{children:e.type}),(0,i.jsx)(`pre`,{children:ll(e.data)})]})}function vl({wait:e,onRespond:t}){return(0,i.jsxs)(`section`,{className:`dsh-side-chat-interaction`,"aria-label":`Tool approval required`,children:[(0,i.jsxs)(`strong`,{children:[`Allow tool: `,e.toolName,`?`]}),e.reason!==void 0&&(0,i.jsx)(`p`,{children:e.reason}),(0,i.jsxs)(`div`,{className:`dsh-side-chat-interaction-actions`,children:[(0,i.jsx)(`button`,{type:`button`,onClick:()=>{t(`decline`)},children:`Decline`}),(0,i.jsx)(`button`,{type:`button`,onClick:()=>{t(`approve`)},children:`Allow once`})]})]})}function yl({wait:e,onRespond:t}){let n=e.questions,[a,o]=(0,r.useState)(()=>Object.fromEntries(n.map(e=>[e.id,{selected:[],custom:``}]))),s=(e,t)=>{o(n=>({...n,[e]:t}))};return(0,i.jsxs)(`section`,{className:`dsh-side-chat-interaction`,"aria-label":`Assistant question`,children:[n.map(t=>{let n=a[t.id]??{selected:[],custom:``};return(0,i.jsxs)(`fieldset`,{children:[(0,i.jsx)(`legend`,{children:t.header===void 0?t.question:`${t.header} · ${t.question}`}),t.detail!==void 0&&(0,i.jsx)(`p`,{children:t.detail}),t.options?.map(r=>(0,i.jsxs)(`label`,{className:`dsh-side-chat-question-option`,children:[(0,i.jsx)(`input`,{type:t.multiSelect===!0?`checkbox`:`radio`,name:`${e.key}-${t.id}`,checked:n.selected.includes(r.label),onChange:e=>{let i=t.multiSelect===!0?e.target.checked?[...n.selected,r.label]:n.selected.filter(e=>e!==r.label):[r.label];s(t.id,{...n,selected:i})}}),(0,i.jsxs)(`span`,{children:[(0,i.jsx)(`strong`,{children:r.label}),r.description===void 0?``:` — ${r.description}`]})]},r.label)),(0,i.jsx)(`textarea`,{rows:2,value:n.custom,placeholder:t.options===void 0?`Your answer`:`Other (optional)`,onChange:e=>{s(t.id,{...n,custom:e.target.value})}})]},t.id)}),(0,i.jsxs)(`div`,{className:`dsh-side-chat-interaction-actions`,children:[(0,i.jsx)(`button`,{type:`button`,onClick:()=>{t(null)},children:`Cancel`}),(0,i.jsx)(`button`,{type:`button`,onClick:()=>{t({answers:n.map(e=>{let t=a[e.id]??{selected:[],custom:``},n=t.custom.trim();return{id:e.id,selected:[...t.selected],...n.length===0?{}:{custom:n}}})})},children:`Submit`})]})]})}function bl({pending:e,controller:t}){return(0,i.jsx)(i.Fragment,{children:e.map(e=>e.kind===`approval`?(0,i.jsx)(vl,{wait:e,onRespond:n=>{t.respondApproval(e.key,n)}},e.key):(0,i.jsx)(yl,{wait:e,onRespond:n=>{t.respondQuestion(e.key,n)}},e.key))})}function xl({queue:e,controller:t}){return e.length===0?null:(0,i.jsxs)(`section`,{className:`dsh-side-chat-queue`,"aria-label":`Queued Side Chat messages`,children:[(0,i.jsx)(`strong`,{children:`Queued`}),e.filter(e=>e.placement===`queued`).map(e=>(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`span`,{children:e.preview}),(0,i.jsx)(`button`,{type:`button`,onClick:()=>{t.updateQueue(e.id,{kind:`remove`})},children:`Remove`})]},e.id))]})}function Sl({face:e,inheritedThroughSeq:t,controller:n,selection:a,locale:o=`en`,cwd:s,modelControl:c}){let l=(0,r.useSyncExternalStore)(t=>e.subscribe(t),()=>e.getSnapshot(),()=>e.getSnapshot()),[u,d]=(0,r.useState)(``),[f,p]=(0,r.useState)(!1),m=Xs(u),h=(0,r.useRef)(null),g=(0,r.useMemo)(()=>l.nodes.filter(e=>e.seq>t),[l.nodes,t]),_=l.runningCalls??[],v=(0,r.useMemo)(()=>new Set([...g.filter(e=>e.kind===`tool-result`).map(e=>e.callId),..._.map(e=>e.callId)]),[g,_]),y=a===void 0?void 0:g.find(e=>e.kind===`user`||e.kind===`steering`);(0,r.useEffect)(()=>{let e=h.current;e!==null&&(e.scrollTop=e.scrollHeight)},[g.length,l.partial,l.pending.length,l.queue.length]);let b=async e=>{e.preventDefault();let t=u.trim();if(!(t.length===0||f)){p(!0);try{(await n.send(t,l.running?`steer`:`queue`)).ok&&d(``)}finally{p(!1)}}};return l.openState===`cold`||l.openState===`loading`?(0,i.jsx)(`div`,{className:`dsh-side-chat-loading`,children:`Loading Side Chat…`}):l.openState===`error`?(0,i.jsx)(`div`,{className:`dsh-side-chat-loading`,role:`alert`,children:`Could not load Side Chat history.`}):(0,i.jsxs)(`div`,{className:`dsh-side-chat-conversation`,children:[(0,i.jsxs)(`div`,{ref:h,className:`dsh-side-chat-transcript`,"aria-live":`polite`,children:[g.map(e=>a!==void 0&&e===y?(0,i.jsxs)(`div`,{className:`dsh-side-chat-annotated-user-message`,children:[(0,i.jsx)(ge,{selections:[a],messages:he[o]}),(0,i.jsx)(_l,{node:e,projectedToolCallIds:v,cwd:s,locale:o})]},`${e.kind}-${String(e.seq)}`):(0,i.jsx)(_l,{node:e,projectedToolCallIds:v,cwd:s,locale:o},`${e.kind}-${String(e.seq)}`)),l.partial!==null&&(0,i.jsxs)(`article`,{className:`dsh-side-chat-message`,"data-role":`assistant`,children:[(0,i.jsx)(`span`,{className:`dsh-side-chat-message-role`,children:`Assistant`}),(0,i.jsx)(gl,{blocks:l.partial.blocks,streaming:!0,projectedToolCallIds:v,unprojectedToolState:`running`,cwd:s,locale:o})]}),_.map(e=>(0,i.jsx)(cl,{call:e,cwd:s},e.callId)),(0,i.jsx)(bl,{pending:l.pending,controller:n}),(0,i.jsx)(xl,{queue:l.queue,controller:n}),l.promptError!==null&&(0,i.jsx)(`div`,{className:`dsh-side-chat-turn-notice`,role:`alert`,children:l.promptError.error.message})]}),(0,i.jsxs)(`form`,{className:`dsh-side-chat-composer`,"data-composer-card":``,onSubmit:e=>{b(e)},children:[(0,i.jsx)(`textarea`,{ref:m,rows:1,value:u,placeholder:l.running?`Steer the current response`:`Reply in Side Chat`,onChange:e=>{d(e.target.value)},onKeyDown:e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),e.currentTarget.form?.requestSubmit())}}),(0,i.jsxs)(`div`,{className:`dsh-side-chat-composer-actions`,children:[c,l.running?(0,i.jsx)(`button`,{type:`button`,className:`dsh-side-chat-stop-button`,"aria-label":`Stop generating`,title:`Stop generating`,onClick:()=>{n.cancel()},children:(0,i.jsx)(Sc,{})}):(0,i.jsx)(`button`,{type:`submit`,className:`dsh-side-chat-send-button`,"aria-label":`Send`,disabled:f||u.trim().length===0,children:(0,i.jsx)(Gs,{})})]})]})]})}function Cl(e){return e}function wl(){if(!(typeof window>`u`))try{return window.sessionStorage}catch{return}}function Tl(e){return`dsh-side-chat:composer-annotations:${encodeURIComponent(e)}`}function El(e){let t=oe(e);return t===void 0?void 0:{version:2,...t}}function Dl(e){return e.version===1?e.draft:e.displayDraft}function Ol(e){return e.version===1?e.projection:e.mirrorDraft}var kl=class{storage;observedSessions=new Set;constructor(e=wl()){this.storage=e}reconcile(e,t){let n=Tl(e),r=t.state.getSnapshot(),i=El(r);if(i!==void 0){this.observedSessions.add(n),this.write(n,i);return}let a=this.read(n);if(a!==void 0){let e=r.draft===Dl(a),i=Ol(a),o=i!==void 0&&r.draft===i;if(e||o){if(this.observedSessions.add(n),ue(t,a.ref,i,a.version===2?a.baseDraft:void 0)||i!==void 0&&t.state.getSnapshot().draft===i)return;this.remove(n),le(t);return}}if(this.observedSessions.has(n)){this.remove(n),le(t);return}(a===void 0||r.draft!==``)&&(a!==void 0&&this.remove(n),le(t))}read(e){if(this.storage!==void 0)try{let t=this.storage.getItem(e);if(t===null)return;let n=JSON.parse(t);return n.version===1&&typeof n.draft==`string`&&typeof n.ref==`string`&&(n.projection===void 0||typeof n.projection==`string`)?{version:1,draft:n.draft,...n.projection===void 0?{}:{projection:n.projection},ref:n.ref}:n.version===2&&typeof n.displayDraft==`string`&&typeof n.mirrorDraft==`string`&&typeof n.baseDraft==`string`&&typeof n.ref==`string`?{version:2,displayDraft:n.displayDraft,mirrorDraft:n.mirrorDraft,baseDraft:n.baseDraft,ref:n.ref}:void 0}catch{return}}write(e,t){if(this.storage!==void 0)try{this.storage.setItem(e,JSON.stringify(t))}catch{}}remove(e){if(this.storage!==void 0)try{this.storage.removeItem(e)}catch{}}};let Al=`dsh-side-chat:model-preference:v1`;function jl(){if(!(typeof window>`u`))try{return window.localStorage}catch{return}}function Ml(e){if(typeof e!=`object`||!e)return;let t=e;if(typeof t.provider==`string`&&t.provider!==``&&typeof t.model==`string`&&t.model!==``&&(t.reasoningEffort===void 0||typeof t.reasoningEffort==`string`&&t.reasoningEffort!==``))return{provider:t.provider,model:t.model,...t.reasoningEffort===void 0?{}:{reasoningEffort:t.reasoningEffort}}}var Nl=class{storage;constructor(e=jl()){this.storage=e}get(){if(this.storage!==void 0)try{let e=this.storage.getItem(Al);if(e===null)return;let t=JSON.parse(e);return t.version===1?Ml(t.selection):void 0}catch{return}}set(e){if(this.storage===void 0)return;let t={version:1,selection:{...e}};try{this.storage.setItem(Al,JSON.stringify(t))}catch{}}};let Pl=[],Fl=new Map,Il=[],Ll=[],Rl={get:()=>void 0};function zl(e){return typeof e==`object`&&!!e&&Array.isArray(e.nodes)&&Array.isArray(e.pending)}function Bl(e,t){let n=e?.get(t);if(typeof n!=`object`||!n)return;let r=n;if(r.kind===`approval`&&typeof r.key==`string`&&typeof r.toolName==`string`&&typeof r.answer==`function`||(r.kind===`question`||r.kind===`plan-review`)&&typeof r.key==`string`&&Array.isArray(r.questions)&&typeof r.answer==`function`&&typeof r.cancel==`function`)return n}function Vl(e){return e.kind===`approval`?{kind:`approval`,key:e.key,toolName:e.payload.toolName,...e.payload.reason===void 0?{}:{reason:e.payload.reason},respond:async t=>(await e.respond({ok:!0,value:{sessionId:e.sessionId,approvalId:e.payload.approvalId,outcome:t===`approve`?`allowed-once`:`rejected`}})).accepted}:{kind:`question`,key:e.key,questions:e.payload.questions,respond:async t=>(await e.respond(t===null?{ok:!1,error:{code:`cancelled`,message:`Question cancelled.`,details:{}}}:{ok:!0,value:{sessionId:e.sessionId,answer:t}})).accepted}}function Hl(e){return e.kind===`approval`?{kind:`approval`,key:e.key,toolName:e.toolName,...e.reason===void 0?{}:{reason:e.reason},respond:async t=>(await e.answer(t===`approve`?`allowed-once`:`rejected`),!0)}:{kind:`question`,key:e.key,questions:e.questions,respond:async t=>(t===null?await e.cancel():await e.answer(t),!0)}}var Ul=class{session;chat;pending;sessionId;cache;constructor(e,t,n){this.session=e,this.chat=t,this.pending=n,this.sessionId=e.sessionId}subscribe=e=>{let t=[this.session.subscribe(e)];return this.chat!==void 0&&t.push(this.chat.subscribe(e)),this.pending!==void 0&&t.push(this.pending.subscribe(e)),()=>{for(let e of t)e()}};getSnapshot=()=>{let e=this.session.getSnapshot();if(zl(e)){if(this.cache?.session===e)return this.cache.value;let t={nodes:e.nodes,turnEnds:e.turnEnds,partial:e.partial,runningCalls:e.runningCalls,pending:e.pending.map(Vl),queue:e.queue,running:e.running,openState:e.openState,promptError:e.promptError,lastAgentError:e.lastAgentError,chatNodes:e.chat.nodes};return this.cache={session:e,chat:void 0,pending:void 0,value:t},t}let t=e,n=this.chat?.getSnapshot(),r=this.pending?.getSnapshot(),i=this.cache;if(i!==void 0&&i.session===e&&i.chat===n&&i.pending===r)return i.value;let a=n?.legacy,o=Bl(r,this.sessionId),s={nodes:a?.nodes??Pl,turnEnds:a?.turnEnds??Fl,partial:a?.partial??null,runningCalls:a?.runningCalls??Il,pending:o===void 0?Ll:[Hl(o)],queue:t.queue,running:t.running,openState:t.openState,promptError:t.promptError,lastAgentError:t.lastAgentError,chatNodes:n?.nodes??Rl};return this.cache={session:e,chat:n,pending:r,value:s},s};prompt(e,t){return this.session.prompt(e,t)}updateQueue(e,t){return this.session.updateQueue(e,t)}cancel(){return this.session.cancel()}rename(e){return this.session.rename(e)}async open(){await this.session.open?.call(this.session)}};function Wl(e,t={}){return new Ul(e,t.chat,t.pending)}function Gl(e,t){let n=e.code===`bad-request`||e.code===`gateway/bad-request`;return{code:e.code===`session-not-found`||e.code===`session/not-found`?`side_chat_not_found`:t,message:e.message,recoverable:!n}}function Kl(e,t){return{code:e,message:t,recoverable:!0}}function $(e){return e}function ql(e){let t;for(let n of e.turnEnds.values())(t===void 0||n>t)&&(t=n);return t}function Jl(e){return e.kind===`turn`?e.turn.status===`closed`:e.kind===`step`&&e.turn.status===`closed`&&e.step.status===`closed`}function Yl(e){let t=e.getSnapshot(),n=t.pending[0];return{status:n?.kind===`approval`?`needs-approval`:n?.kind===`question`?`needs-input`:t.openState===`error`||t.lastAgentError!==null?`failed`:t.running?`running`:`idle`}}var Xl=class{face;sessionId;constructor(e){this.face=e,this.sessionId=Cl(e.sessionId)}getSnapshot=()=>Yl(this.face);subscribe=e=>this.face.subscribe(e);async prompt(e,t){let n=await this.face.prompt(e.map(e=>({...e})),t);return n.ok?{ok:!0}:{ok:!1,error:Gl(n.error,`side_chat_prompt_failed`)}}async updateQueue(e,t){if(t.kind===`edit`&&t.content.some(e=>e.type!==`text`))return{ok:!1,error:Kl(`invalid_request`,`Queued image messages cannot be edited in the Side Chat panel.`)};let n=t.kind===`edit`?{kind:`edit`,content:t.content.map(e=>({type:`text`,text:e.type===`text`?e.text:``}))}:t,r=await this.face.updateQueue(e,n);return r.ok?{ok:!0}:{ok:!1,error:Gl(r.error,`side_chat_prompt_failed`)}}async cancel(){let e=await this.face.cancel();return e.ok?{ok:!0}:{ok:!1,error:Gl(e.error,`side_chat_interrupt_failed`)}}async respondApproval(e,t){let n=this.face.getSnapshot().pending.find(t=>t.key===e&&t.kind===`approval`);if(n===void 0)return{ok:!1,error:Kl(`invalid_request`,`The approval is no longer pending.`)};try{return await n.respond(t)?{ok:!0}:{ok:!1,error:Kl(`transport_error`,`The approval response arrived too late.`)}}catch{return{ok:!1,error:Kl(`transport_error`,`The approval response failed.`)}}}async respondQuestion(e,t){let n=this.face.getSnapshot().pending.find(t=>t.key===e&&t.kind===`question`);if(n===void 0)return{ok:!1,error:Kl(`invalid_request`,`The question is no longer pending.`)};try{let e=t===null?null:{answers:t.answers.map(e=>({id:e.id,selected:[...e.selected],...e.custom===void 0?{}:{custom:e.custom}}))};return await n.respond(e)?{ok:!0}:{ok:!1,error:Kl(`transport_error`,`The question response arrived too late.`)}}catch{return{ok:!1,error:Kl(`transport_error`,`The question response failed.`)}}}},Zl=class{ctx;renamed=new Set;faces=new Map;parentInputs=new WeakMap;annotationPersistence=new kl;modelPreferences=new Nl;constructor(e){this.ctx=e}subscribeList=e=>this.ctx.sessions.list.subscribe(e);subscribeConversationInput=e=>{let t,n=()=>{},r=()=>{let r=this.currentParentInput();r!==t&&(n(),t=r,n=t?.state.subscribe?.(e)??(()=>{}))};r();let i=this.ctx.sessions.list.subscribe(()=>{r(),e()});return()=>{i(),n()}};currentConversationInputSnapshot=()=>this.currentParentInput()?.state.getSnapshot();currentSessionId(){let e=this.ctx.sessions.list.getSnapshot().current;return e===void 0?void 0:Cl(e)}lastCompletedSeq(e){let t=this.face(e)?.getSnapshot();return t===void 0?void 0:ql(t)}selectionIsCurrent(e){if(this.currentSessionId()!==e.parentSessionId)return!1;let t=this.face(e.parentSessionId)?.getSnapshot();return t!==void 0&&e.fragments.every(e=>{let n=t.chatNodes.get(e.nodeKey);return n!==void 0&&n.visibility===`visible`&&n.kind===e.nodeKind&&n.anchorSeq===e.seq&&Jl(n.location)})}addSelectionToConversation(e,t){if(this.currentSessionId()!==e.parentSessionId)return!1;let n=this.currentParentInput();return n===void 0||!te(n,e,t)?!1:(this.annotationPersistence.reconcile(e.parentSessionId,n),!0)}addSideChatToConversation(e,t){let n=this.ctx.sessions.scope($(e)),r=n===void 0?void 0:this.parentInput(n);return r===void 0||!je(r,t)?!1:(this.annotationPersistence.reconcile(e,r),!0)}removeConversationAnnotation(e){let t=this.currentSessionId(),n=this.currentParentInput();return t===void 0||n===void 0||!ne(n,e)?!1:(this.annotationPersistence.reconcile(t,n),!0)}updateConversationAnnotation(e,t){let n=this.currentSessionId(),r=this.currentParentInput();return n===void 0||r===void 0||!re(r,e,t)?!1:(this.annotationPersistence.reconcile(n,r),!0)}reconcileConversationAnnotationPersistence(){let e=this.currentSessionId(),t=this.currentParentInput();e!==void 0&&t!==void 0&&this.annotationPersistence.reconcile(e,t)}nextConversationAnnotationNumber(){let e=this.currentConversationInputSnapshot();return e===void 0?1:E(e).length+1}removeConversationAnnotations(){let e=this.currentSessionId(),t=this.currentParentInput();return e===void 0||t===void 0||!k(t)?!1:(this.annotationPersistence.reconcile(e,t),!0)}async retain(e){let t=await this.waitForBinding($(e)),n=this.adaptedFace(t.session);if(await n.open(),!this.renamed.has(e)){this.renamed.add(e);let t=this.ctx.sessions.list.getSnapshot().byId[$(e)]?.displayTitle,r=t===void 0?`Side Chat`:`Side Chat · ${t}`;await n.rename(r.slice(0,160)).catch(()=>void 0)}return{sessionId:e,binding:new Xl(n),release:()=>{}}}async openSession(e){this.ctx.sessions.open($(e))}notify(e){let t=e.kind===`warning`?`warn`:`info`;console[t](`[dsh-side-chat] ${e.text}`)}face(e){let t=this.ctx.sessions.binding($(e))?.session;return t===void 0?void 0:this.adaptedFace(t)}title(e){return this.ctx.sessions.list.getSnapshot().byId[$(e)]?.displayTitle}cwd(e){return this.ctx.sessions.list.getSnapshot().byId[$(e)]?.cwd}modelDirectory(e){try{return this.ctx.modelDirectories.directoryFor($(e))}catch{return}}sideChatModelPreference(){return this.modelPreferences.get()}rememberSideChatModelPreference(e){this.modelPreferences.set(e)}adaptedFace(e){let t=this.faces.get(e.sessionId);if(t?.source===e)return t.compatible;let n=this.ctx.get(`uiConversation`),r=this.ctx.get(`uiSession`),i=n?.binding(e.sessionId).target(`chat`),a=r?.pendingInteractions,o=Wl(e,{...i===void 0?{}:{chat:i},...a===void 0?{}:{pending:a}});return this.faces.set(e.sessionId,{source:e,compatible:o}),o}currentParentInput(){let e=this.currentSessionId();if(e===void 0)return;let t=this.ctx.sessions.scope($(e));return t===void 0?void 0:this.parentInput(t)}parentInput(e){let t=this.ctx.conversation.input.for(e);if(t===void 0||this.ctx.get(`uiConversation`)===void 0)return t;let n=this.parentInputs.get(t);if(n!==void 0)return n;let r={referenceMode:`lexical`,state:t.state,setDraft:e=>{t.setDraft(e)},insertReference:(e,n)=>t.insertReference(e,n),replaceText:(t,n)=>e.bail(e,`slash/input-insert-text`,{text:t,span:n})===!0};return this.parentInputs.set(t,r),r}waitForBinding(e){let t=this.ctx.sessions.binding(e);return t===void 0?new Promise((t,n)=>{let r=!1,i=()=>{if(r)return;let n=this.ctx.sessions.binding(e);n!==void 0&&(r=!0,clearTimeout(o),a(),t(n))},a=this.ctx.sessions.list.subscribe(i),o=setTimeout(()=>{r||(r=!0,a(),n(Error(`Side Chat child ${e} did not appear in the rc.6 Session list.`)))},8e3);i()}):Promise.resolve(t)}};function Ql(e,t){let n=e.chatNodes.get(t);if(n===void 0||n.visibility!==`visible`)return;let r=n.kind===`user`||n.kind===`steering`?`user`:n.kind===`assistant-step`?`assistant`:n.kind===`context`?`context`:void 0,i=n.location.kind===`turn`||n.location.kind===`step`?n.location.turn.turn:void 0;if(r!==void 0&&i!==void 0)return{nodeKey:n.key,nodeKind:n.kind,turnKey:`turn:${String(i)}`,seq:n.anchorSeq,source:r,modelVisible:!0,settled:Jl(n.location)}}function $l(e){if(e instanceof KeyboardEvent&&e.key===`Escape`)return!1;let t=e.target;return!(t instanceof Element&&t.closest([`[data-side-chat-panel]`,`.dsh-side-chat-selection-actions`,`.dsh-side-chat-selection-comment`,`.dsh-side-chat-annotation-marker`].join(`, `))!==null)}function eu(){let e=document.querySelector([`[data-composer-seat] textarea`,`[data-composer-seat] [role="textbox"]`,`[data-composer-seat] [contenteditable="true"]`].join(`, `));if(e===null)return;if(e.focus(),e instanceof HTMLTextAreaElement){e.setSelectionRange(e.value.length,e.value.length);return}let t=document.createRange();t.selectNodeContents(e),t.collapse(!1);let n=window.getSelection();n?.removeAllRanges(),n?.addRange(t)}function tu({controller:e,sessions:t}){let n=(0,r.useSyncExternalStore)(e.subscribe,e.getSnapshot,e.getSnapshot),a=(0,r.useSyncExternalStore)(t.subscribeList,()=>t.currentSessionId(),()=>t.currentSessionId()),o=(0,r.useSyncExternalStore)(t.subscribeConversationInput,t.currentConversationInputSnapshot,t.currentConversationInputSnapshot),s=(0,r.useMemo)(()=>o===void 0?[]:D(o),[o]),[c,l]=(0,r.useState)(null),[u,d]=(0,r.useState)(null),f=(0,r.useRef)(0),p=(0,r.useRef)(void 0),m=(0,r.useRef)(null),h=(0,r.useRef)(!1),g=(0,r.useRef)(!1),_=(0,r.useRef)(0),v=(0,r.useCallback)(async e=>{let n=++f.current,r=t.currentSessionId(),i=r===void 0?void 0:t.face(r),a=document.querySelector(`[data-chat-flow]`),o=window.getSelection();if(r===void 0||i===void 0||a===null||o===null||o.isCollapsed){n===f.current&&l(null);return}let s=i.getSnapshot();try{let t=await nc({selection:o,conversationRoot:a,parentSessionId:r,resolver:{resolve(e){let t=e.dataset.chatAnchorKey;return t===void 0?void 0:Ql(s,t)}}});n===f.current&&l({value:t,touch:e})}catch{n===f.current&&l(null)}},[t]),y=(0,r.useCallback)(()=>{p.current!==void 0&&(window.clearTimeout(p.current),p.current=void 0)},[]),b=(0,r.useCallback)(()=>{y();let e=++f.current;p.current=window.setTimeout(()=>{p.current=void 0,!(e!==f.current||h.current)&&v(!0)},300)},[y,v]);(0,r.useEffect)(()=>{let t=()=>{y(),m.current=null,h.current=!1,++f.current,l(null),d(null)},n=()=>Date.now()<_.current,r=e=>{$l(e)&&(e.pointerType===`touch`&&n()||(e.pointerType!==`touch`&&(_.current=0),g.current=e.pointerType===`touch`,g.current&&t()))},i=e=>{$l(e)&&!n()&&(g.current=!0,t())},a=e=>{$l(e)&&!n()&&(g.current=!0,b())},o=e=>{if(g.current||n()){m.current=null;return}if(!$l(e)){m.current=null;return}y(),m.current={x:e.clientX,y:e.clientY},h.current=!1,++f.current,l(null),d(null)},s=e=>{let t=m.current;if(m.current=null,$l(e)&&!n()){if(g.current){b();return}(t===null||Math.abs(e.clientX-t.x)>2||Math.abs(e.clientY-t.y)>2||e.detail>1||e.shiftKey)&&v(!1)}},c=()=>{if(h.current)return;if(g.current){b();return}let e=window.getSelection();(e===null||e.isCollapsed)&&(y(),++f.current,l(null))},u=t=>{if(g.current=!1,y(),t.key===`Escape`){++f.current,h.current=!1,l(null),d(null),e.close();return}$l(t)&&v(!1)};return document.addEventListener(`pointerdown`,r),document.addEventListener(`touchstart`,i,{passive:!0}),document.addEventListener(`touchend`,a,{passive:!0}),document.addEventListener(`mousedown`,o),document.addEventListener(`mouseup`,s),document.addEventListener(`selectionchange`,c),document.addEventListener(`keyup`,u),()=>{y(),document.removeEventListener(`pointerdown`,r),document.removeEventListener(`touchstart`,i),document.removeEventListener(`touchend`,a),document.removeEventListener(`mousedown`,o),document.removeEventListener(`mouseup`,s),document.removeEventListener(`selectionchange`,c),document.removeEventListener(`keyup`,u)}},[y,v,e,b]),(0,r.useEffect)(()=>{y(),++f.current,h.current=!1,l(null),d(null)},[y,a]),(0,r.useEffect)(()=>{o!==void 0&&t.reconcileConversationAnnotationPersistence()},[o,t]),(0,r.useEffect)(()=>{u!==null&&(s.some(e=>e.annotationIndex===u.annotationIndex)||(h.current=!1,d(null)))},[s,u]);let x=(0,r.useCallback)(()=>{y(),g.current&&(_.current=Date.now()+750),g.current=!1,h.current=!1,++f.current,l(null)},[y]),S=n.phase===`closed`?void 0:`Close the current Side Chat before starting another one.`,C=n.childSessionId===void 0?void 0:t.face(n.childSessionId),w=n.childSessionId===void 0?void 0:t.cwd(n.childSessionId),T=n.inheritedThroughSeq,E=navigator.language.toLowerCase().startsWith(`zh`)?`zh-CN`:`en`,O=n.parentSessionId===void 0?void 0:t.modelDirectory?.(n.parentSessionId),k=C===void 0||T===void 0||n.parentSessionId===void 0||n.childSessionId===void 0||n.phase!==`ready`,A=()=>{let e=n.parentSessionId,r=n.childSessionId,i=r===void 0?void 0:t.face(r);if(e===void 0||r===void 0||T===void 0||i===void 0){t.notify({kind:`warning`,text:`The Side Chat conversation is not ready to add yet.`});return}let a=Se({conversationId:r,title:t.title(r)??(E===`zh-CN`?`侧边对话`:`Side Chat`),nodes:i.getSnapshot().nodes,inheritedThroughSeq:T});if(a.conversation.length===0){t.notify({kind:`warning`,text:`The Side Chat does not have any conversation history to add yet.`});return}try{if(!t.addSideChatToConversation(e,a)){t.notify({kind:`warning`,text:`Could not add the Side Chat to the main conversation.`});return}t.openSession(e).then(eu,()=>{t.notify({kind:`warning`,text:`The Side Chat was added, but its parent conversation could not be opened.`})})}catch{t.notify({kind:`warning`,text:`Could not add the Side Chat to the main conversation.`})}},j=O===void 0?void 0:(0,i.jsx)(Ws,{directory:O,selection:n.modelSelection,locked:[`creating`,`opening`,`closing`].includes(n.phase)||n.error?.operation===`close`,validateInitialSelection:n.childSessionId===void 0,locale:E,onInitialize:(t,n)=>{n.remember?e.selectModel(t):e.initializeModel(t)},onSelect:t=>e.selectModel(t)},`${n.parentSessionId}:${n.childSessionId??`draft`}`);return(0,i.jsxs)(`div`,{className:`dsh-side-chat-overlay`,children:[(0,i.jsx)(vc,{annotations:s,...u===null?{}:{activeAnnotationIndex:u.annotationIndex},onEdit:(e,t)=>{h.current=!0,y(),++f.current,l(null),d({...e,selection:t})}}),c!==null&&(0,i.jsx)(xc,{selection:c.value,touchInteraction:c.touch,annotationNumber:t.nextConversationAnnotationNumber(),...S===void 0?{}:{askDisabledReason:S},onAddToChat:(e,n)=>{try{t.addSelectionToConversation(e,n)?eu():t.notify({kind:`warning`,text:`Could not add the selection to the current chat.`})}catch{t.notify({kind:`warning`,text:`Could not add the selection to the current chat.`})}x()},onAnnotationEditorChange:e=>{h.current=e,e&&g.current&&(_.current=Date.now()+750)},onMoreDetails:n=>{let r=e.openDraft({selection:n});r.ok?e.sendFirst(`Please explain the selected passage in more detail.`):t.notify({kind:`warning`,text:r.error.message}),x()},onAskInSideChat:n=>{let r=e.openDraft({selection:n});r.ok||t.notify({kind:`warning`,text:r.error.message}),x()},onDismiss:x}),u!==null&&(0,i.jsx)(xc,{selection:u.selection,annotationNumber:u.annotationIndex+1,annotationEditor:{...u.comment===void 0?{}:{initialComment:u.comment},dialogLabel:`Edit annotation comment`},onAddToChat:(e,n)=>{try{t.updateConversationAnnotation(u.annotationIndex,n)||t.notify({kind:`warning`,text:`Could not update the annotation.`})}catch{t.notify({kind:`warning`,text:`Could not update the annotation.`})}h.current=!1,d(null)},onAnnotationEditorChange:e=>{h.current=e},onRemoveAnnotation:()=>{try{t.removeConversationAnnotation(u.annotationIndex)||t.notify({kind:`warning`,text:`Could not remove the annotation.`})}catch{t.notify({kind:`warning`,text:`Could not remove the annotation.`})}h.current=!1,d(null)},onMoreDetails:()=>{},onAskInSideChat:()=>{},onDismiss:()=>{h.current=!1,d(null)}},`annotation:${String(u.annotationIndex)}`),n.phase!==`closed`&&(0,i.jsx)(Zs,{state:n,locale:E,...C===void 0||T===void 0?{}:{embeddedConversation:(0,i.jsx)(Sl,{face:C,inheritedThroughSeq:T,controller:e,cwd:w,...n.selection===void 0?{}:{selection:n.selection},locale:E,modelControl:j})},modelControl:j,onDraftChange:t=>{e.setDraft(t)},onFirstSend:t=>e.sendFirst(t),onClose:()=>e.close(),onRetry:()=>e.retry(),onFocusParent:()=>{n.parentSessionId!==void 0&&t.openSession(n.parentSessionId)},onAddToConversation:A,addToConversationDisabled:k,onRemoveSelection:()=>{e.clearSelection()}})]})}let nu=[`conversation`,`inputTriggers`,`modelDirectories`,`remote`,`sessions`,`slots`];async function ru(e){let t=document.createElement(`style`);t.textContent=o,t.dataset.plugin=`dsh-side-chat`,t.dataset.dshSideChat=`styles`,document.head.append(t);let n=e,i=await zs(n),a=n.inputTriggers.registerSource(A),s=n.inputTriggers.registerSource(Me),c=new Zl(n),l=Ve(n,()=>{c.removeConversationAnnotations()}),u=new Ze(i.remote,c),d=n.slots.inject(`shell.overlay`,()=>n.slots.register({name:`shell.overlay`,id:`dsh-side-chat`,order:90},()=>(0,r.createElement)(tu,{controller:u,sessions:c})));e.effect(()=>async()=>{try{await u.dispose()}finally{l(),s(),a(),d(),await i.dispose(),t.remove()}},`dsh-side-chat.clientLifecycle`)}return n.SelectionActions=xc,n.SelectionValidationError=P,n.SideChatController=Ze,n.SideChatPanel=Zs,n.apply=ru,n.assertSelectionCurrent=Je,n.buildSideChatPrompt=me,n.captureDomConversationSelection=nc,n.finalizeConversationSelection=qe,n.inject=nu,n.name=`side-chat-client`,n.normalizeSelectedText=Ke,n.restoreDomConversationSelection=ac,n.selectionFitsLimit=We,n.summarizeSelection=Ge,n.utf8ByteLength=Ue,t.exports}});