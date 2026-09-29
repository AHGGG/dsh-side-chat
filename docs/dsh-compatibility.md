# DSH compatibility

`package.json` is the source of truth for DSH compatibility. Side Chat targets only DSH `0.2.0-rc.1` (published under npm's `next` tag, not `latest`). Its exact version is mirrored in `dshCompatibility.testedVersions`, DSH peer and development dependencies, and the DSH Store-compatible `dsh.compatibility` map. The plugin makes no promise of compatibility with older or future prerelease trains.

Clean-profile verification installs the declared train and probes the packed Host, Client and Remote entries without mixing DSH package versions. This import probe does not replace an interactive Web-client smoke test.

The implementation uses these published APIs:

- read-only Host `sessionQuery.observeSession` leases, `foldSurface`, `messageProjections`, and `deriveEventMessage` for a completed parent-context snapshot;
- `llm.prepareCall`, cancellable provider streams, and `BlockAssembler` for direct text replies, without an Agent, tools, or a new Session;
- Typert streaming RPCs with strict item codecs, invocation cancellation, and peer-owned temporary discussions;
- Client Session Controller references (`retain`/`release`) to pin only the existing parent without changing the main view;
- explicitly activated parent Conversation `chat` targets for selection anchors and completed-turn boundaries;
- the DSH 0.2 Lexical input facade and atomic reference-edit coordinates;
- Workspace navigation, `data-chat-*` DOM anchors and the `shell.overlay` slot;
- Typert Remote mounting and lazy codec schemas.

The current Client adapter lives in `src/client/dsh/`. Older Session snapshot shapes, old composer representations, and old draft-storage formats are not supported. `ChatSnapshot.legacy` is still used because it is DSH 0.2's published transcript projection, not because older DSH runtimes are supported.

See [verification.md](verification.md) for the handoff checklist for the session-free refactor. Build and runtime verification are left to the maintainer; the coding assistant did not run them for this refactor. Existing archived Side Chat Sessions are left untouched; the refactor creates no new ones.

## Runtime artifacts

`lib/` is committed so DSH Store can verify and install a fixed Git commit without executing lifecycle scripts. The Client and Typert entries bundle their Zod runtime, while DSH integration packages remain peers, so the manifest has no runtime or optional dependencies. `pnpm pack:verify` rebuilds the package, checks the packed and fixed-source size/file bounds, and, in CI, fails when the committed artifacts are missing or stale. The package intentionally has no `prepare` script.

## Updating DSH

Dependabot groups `@deepseek-ai/dsh-*` upgrades into one release-train pull request. To validate and adopt a new train locally, run:

```powershell
pnpm dsh:update <exact-version>
pnpm check
pnpm clean-profile:verify
```

The update command verifies that every direct DSH package exists at the requested version, replaces the tested train, synchronizes both compatibility manifests plus peer/development dependency metadata, and regenerates a clean lockfile. If a package was renamed or removed, update the imports and dependencies before retrying. For freshly published trains, pnpm may add exact package versions to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`; review that list before committing. CI checks only the declared train.
