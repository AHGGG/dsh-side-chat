# DSH compatibility

`package.json` is the source of truth for DSH compatibility. The exact release trains in `dshCompatibility.testedVersions` are mirrored by every DSH `peerDependencies` entry, so package managers warn only for versions the plugin has not validated.

Because DSH is still prerelease software, the package does not claim an open-ended semver range. Development dependencies use the newest tested train for type checking and builds, while clean-profile verification installs and probes every declared train independently without mixing DSH package versions. The DSH Store-compatible `dsh.compatibility` map mirrors the same exact release list.

The implementation uses these published APIs:

- Host Agent lookup/create and ordinary Session seeds;
- Agent preset composition;
- workspace attach and archive;
- concrete Client `Session.open()`;
- the combined `SessionFace` snapshot on DSH 0.1.0/0.1.1;
- Session Controller lifecycle plus Conversation `chat` target and UI Session interactions on DSH 0.1.2;
- `data-chat-*` DOM anchors;
- Typert Remote mounting;
- the additive `shell.overlay` slot.

A version-neutral adapter combines the split 0.1.2 stores into the surface Side Chat already consumes. The Host fork path likewise selects the legacy `seedLength` metadata or the 0.1.2 `isSeeded`/`inheritedEventCount` contract at runtime.

## Runtime artifacts

`lib/` is committed so DSH Store can verify and install a fixed Git commit without executing lifecycle scripts. The Client and Typert entries bundle their Zod runtime, while DSH integration packages remain peers, so the manifest has no runtime or optional dependencies. `pnpm pack:verify` rebuilds the package, checks the packed and fixed-source size/file bounds, and, in CI, fails when the committed artifacts are missing or stale. The package intentionally has no `prepare` script.

## Updating DSH

Dependabot groups `@deepseek-ai/dsh-*` upgrades into one release-train pull request. To validate and adopt a new train locally, run:

```powershell
pnpm dsh:update <exact-version>
pnpm check
pnpm clean-profile:verify
```

The update command verifies that every direct DSH package exists at the requested version, preserves all previously tested trains, appends a new requested train, synchronizes both compatibility manifests plus peer/development dependency metadata, and regenerates a clean lockfile so prerelease trains cannot mix. CI derives its compatibility matrix directly from `dshCompatibility.testedVersions`.
