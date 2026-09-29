# Session-free Side Chat: verification handoff

Verification of this refactor is **left to the maintainer**. The coding assistant did not run tests, typecheck, lint, package probes, builds, or browser smoke tests for the refactor, as requested. Regression tests were authored but not executed by the assistant. The PR includes the `lib/` artifacts present in the working checkout; they were not rebuilt or checked for freshness during PR preparation. DSH loads `lib/`, not `src/`, so rebuild and verify the final source before relying on the installed plugin.

## Build and automated checks

Use **DSH 0.2.0-rc.1**, not npm's `latest` tag (which previously resolved to 0.1.7-rc.2). Do not bypass the plugin compatibility check.

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm clean-profile:verify
```

`pnpm check` includes the build and package verification. To try the UI first, run `pnpm build`. Restart `dsh web` after building, then reload the browser. Confirm that the plugin is linked to this checkout rather than an older registry installation. Include regenerated `lib/` files when committing or publishing the refactor. Import/package probes do not establish that model streaming works in the Web client.

## Focused manual checks

1. **No Session duplication:** note the Session list and stored Session histories. Select a completed passage, use **Ask in side chat**, send, follow up, and close. Repeat with **More details**. Neither flow should create, fork, archive, or write another Session. The parent history must remain unchanged until you explicitly send its composer. Opening an Ask draft alone should make no model call.
2. **Plain question, one annotation:** the first admitted user message should contain one annotation plus your plain question, with no `<selected_context>` or `<user_question>` wrappers. The follow-up composer should be empty. Repeat with `<`, `>`, `&`, and literal XML-looking text in the question; user-authored text must remain intact. More details should use the same message display.
3. **Fixed parent context:** after adding later parent turns, select an earlier completed response. Side Chat should receive only the model-visible parent text through that response's completed turn, excluding the next user message. Parent messages added after the first Side Chat send must not appear in follow-up context. Test a compacted parent and a parent that is no longer the main view. Stale, fractional, or unfinished boundaries must fail, not fall back to an unrelated turn.
4. **Read-only capability:** request a file edit or command execution. No Agent, tool call, approval, question/plan-review dialog, or workspace mutation should result. The assistant can explain or provide text, but has no execution capability. Parent reasoning and image/file bytes must not be forwarded; past tool text is reference material only.
5. **Streaming, Stop, and failures:** observe partial Markdown/reasoning, stop mid-reply, then send another question. Stop must not cancel the parent Agent. Test provider authentication/network errors, early stream termination, and a two-minute timeout. Accepted questions must not replay automatically. A delivery retry before admission should reuse its request identity rather than invoke the model twice. There is no Steer or queued-message control.
6. **IME and drafts:** Enter confirms a Chinese IME candidate without sending; Enter after composition sends and Shift+Enter inserts a newline. Text typed while admission is pending must remain in the composer. A rejected follow-up must retain its draft and show an error. Sending while Stop is still settling must not admit a second overlapping request.
7. **Models and scrolling:** change Side Chat's model/reasoning effort while idle; the parent configuration must not change. Controls lock during generation. A model-directory failure must not erase a saved choice. Scroll upward while streaming; the panel should not force you to the bottom.
8. **Add to conversation:** after an answer or a stopped partial answer, attach the discussion to the parent. The reference should contain Side Chat questions/answers and the initial selection, not the full parent snapshot or private reasoning. Preserve existing draft text, annotations, and file chips. Clicking Add again refreshes one reference. Close the panel: the added reference should remain. Send the parent draft and confirm that this stores the reference durably.
9. **Parent isolation:** switch the main view while Side Chat remains open, then add its transcript back. Insert into and focus the original parent's composer, never the newly viewed Session's composer. Selection capture and numbered markers must use the correct mounted transcript's anchors.
10. **Close/disconnect races:** close during context loading, first-send admission, or streaming. No late result should reopen the panel or change a newly opened discussion. Refresh/disconnect and disable/re-enable the plugin; pending calls should cancel and peer-owned history should be discarded. A different client must not read, select the model for, or close another client's discussion. An idle Host record expires after 30 minutes; reopening starts fresh. Escape in the main composer/model menu must not discard Side Chat; Escape inside the panel still closes it.
11. **Annotation recovery:** add/edit/remove numbered annotations, including beside file/conversation references and whitespace. Reload and switch away/back: saved references should remain real chips with payloads, not only clipboard labels. Deliberately deleted chips must not resurrect. Stored annotated user messages should still display cleanly.
12. **Limits and presentation:** exercise context/question/reply/discussion limits; expect explicit errors instead of silent context truncation. Check light/dark themes, touch selection, Markdown, reasoning disclosure, and the browser console. No duplicate overlays, reference sources, or styles should remain after re-enabling the plugin.

## Design and compatibility scope

Only DSH 0.2.0-rc.1 is supported. The adapter lives in `src/client/dsh/`; `ChatSnapshot.legacy` is still used because it is DSH 0.2's published parent transcript projection, not an older-runtime fallback.

The Host implementation is `src/host/read-only-chat-service.ts`. It holds a text snapshot and bounded conversation history in memory, calls `llm.prepareCall` directly with no tools or Session identity, and exposes cancellable Typert streams. It does not inherit parent Agent presets, execute an Agent loop, or promise provider prefix-cache reuse. Normal provider token usage still applies.

Old archived child Sessions are not automatically deleted. Existing stored annotation/reference messages remain renderable, but old tab-storage draft metadata is not migrated: recreate unsent chips from before the draft-format repair if they reload as ordinary text. Ordinary draft text is never deleted to guess at a missing reference. The demo GIF has not been refreshed for this refactor.
