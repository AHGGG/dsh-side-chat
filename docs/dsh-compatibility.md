# DSH compatibility

`package.json` is the source of truth for DSH compatibility. The unreleased source targets DSH `0.2.2-rc.5` and Cordis `4.1.0`. The published `@ahggg/dsh-side-chat@1.0.3` still targets DSH `0.2.1-rc.2`; see the [installation instructions](../README.md#install).

The DSH target is mirrored in `dshCompatibility.testedVersions`, DSH peer and development dependencies, and the DSH Store-compatible `dsh.compatibility` map. The [official compatibility gate](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/boot/app-boot/src/plugin-compatibility.ts) checks the DSH peer requirements when `engines.dsh` is absent. Updating Store metadata alone does not make a bundle compatible.

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

## Runtime artifacts

`lib/` is committed so DSH Store can verify and install a fixed Git commit without executing lifecycle scripts. The Client and Typert entries bundle their Zod runtime, while DSH integration packages remain peers, so the manifest has no runtime or optional dependencies. `pnpm pack:verify` rebuilds the package, checks the packed and fixed-source size/file bounds, and, in CI, fails when the committed artifacts are missing or stale. The package intentionally has no `prepare` script.

## Updating DSH

Dependabot groups `@deepseek-ai/dsh-*` upgrades into one release-train pull request. To validate and adopt a new train locally, run:

```powershell
pnpm dsh:update <exact-version>
pnpm check
pnpm clean-profile:verify
```

The update command verifies that every direct DSH package exists at the requested version, replaces the tested train, synchronizes both compatibility manifests plus peer/development dependency metadata, and regenerates a clean lockfile. If a package was renamed or removed, update the imports and dependencies before retrying.

Before resolving the new train, the command removes the previous DSH `minimumReleaseAgeExclude` entries from `pnpm-workspace.yaml`. pnpm 11 matches the first exclusion for a package name, so separate rc.1 and rc.2 entries for the same package would leave the rc.2 entry ineffective. For freshly published trains, pnpm adds the new exact package versions during installation; review that list before committing. CI checks only the declared train.
