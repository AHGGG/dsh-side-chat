# Changelog

## [0.2.0-alpha.1](https://github.com/AHGGG/dsh-side-chat/compare/v0.1.0-alpha.1...v0.2.0-alpha.1) (2026-08-14)


### Features

* implement archived-fork side chat for DSH rc.6 ([3a08098](https://github.com/AHGGG/dsh-side-chat/commit/3a080980da8cba6e0a20173966e1114079b145bd))


### Bug Fixes

* recover release bootstrap and demo ([337f17b](https://github.com/AHGGG/dsh-side-chat/commit/337f17bdaf46660a851023b9f9414145907ca348))
* register scoped client bundle ([f0e7a04](https://github.com/AHGGG/dsh-side-chat/commit/f0e7a047b693855c0e63e10a06e8d8855c377b4d))

## 0.1.0-alpha.1 - 2026-08-14

- Added `Ask in side chat` for stock DSH `0.1.0-rc.6`.
- Added complete-prefix ordinary Session forks with inherited Agent options, presets, and workspace.
- Added a right-side child conversation with text turns, steer, Stop, tools, approvals, and questions.
- Added direct cancel → idle → archive → Agent-dispose close behavior.
- Built the Web client as the lazy ModuleLoader CJS bundle required by DSH rc.6.
- Added local install, npm publish, storage, and usage documentation.

Known limitations: archived child history remains on disk; there is no automatic cleanup, reopen, attachments, `Add to conversation`, or `/side`.
