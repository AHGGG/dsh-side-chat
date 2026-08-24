# DSH compatibility

`package.json` is the source of truth for DSH compatibility. The exact release trains in `dshCompatibility.testedVersions` are mirrored by every DSH `peerDependencies` entry, so package managers warn only for versions the plugin has not validated.

Because DSH is still prerelease software, the package does not claim an open-ended semver range. Development dependencies use the newest tested train for type checking and builds, while clean-profile verification installs and probes every declared train independently without mixing DSH package versions.

The implementation uses these published APIs:

- Host Agent lookup/create and ordinary Session seeds;
- Agent preset composition;
- workspace attach and archive;
- concrete Client `Session.open()` and `SessionFace`;
- `data-chat-*` DOM anchors;
- Typert Remote mounting;
- the additive `shell.overlay` slot.

## Updating DSH

Dependabot groups `@deepseek-ai/dsh-*` upgrades into one release-train pull request. To validate and adopt a new train locally, run:

```powershell
pnpm dsh:update <exact-version>
pnpm check
pnpm clean-profile:verify
```

The update command verifies that every direct DSH package exists at the requested version, retains the oldest supported train, makes the requested train the newest tested version, synchronizes peer and development dependency metadata, and regenerates a clean lockfile so prerelease trains cannot mix. CI derives its compatibility matrix directly from `dshCompatibility.testedVersions`.
