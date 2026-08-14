# DSH compatibility

The package supports exactly `@deepseek-ai/dsh@0.1.0-rc.6`. All DSH peer dependencies are pinned to that release; no compatibility is claimed for another version.

The implementation uses these published APIs:

- Host Agent lookup/create and ordinary Session seeds;
- Agent preset composition;
- workspace attach and archive;
- concrete Client `Session.open()` and `SessionFace`;
- `data-chat-*` DOM anchors;
- Typert Remote mounting;
- the additive `shell.overlay` slot.

Verification includes TypeScript, lint, unit/component tests, package inspection, clean-profile imports, installation through `dsh plugin --profile web add`, and a real rc.6 Web Host HTTP smoke test.

```powershell
pnpm check
pnpm clean-profile:verify
```
