# Changelog

## [0.6.1](https://github.com/AHGGG/dsh-side-chat/compare/v0.6.0...v0.6.1) (2026-08-17)


### Bug Fixes

* complete dark theme token support ([49aa259](https://github.com/AHGGG/dsh-side-chat/commit/49aa2593cc1c958867b878ed422e14609b1b4f76))
* use Harness theme aliases in dark mode ([392e8a6](https://github.com/AHGGG/dsh-side-chat/commit/392e8a6eb1cc0cb2edbca7c61833431083eb2b19))

## [0.6.0](https://github.com/AHGGG/dsh-side-chat/compare/v0.5.0...v0.6.0) (2026-08-15)


### Features

* add Side Chat model and reasoning controls ([3bafeac](https://github.com/AHGGG/dsh-side-chat/commit/3bafeac715655be5749f58b0ebc9b9e971d6e2c9))
* add side chat model selection ([de921cc](https://github.com/AHGGG/dsh-side-chat/commit/de921cc5988c5edea86dbd8b0410df2accfc130a))
* remember side chat model choice ([b0ad8d8](https://github.com/AHGGG/dsh-side-chat/commit/b0ad8d80995975b23c2566f3c85c439ec2e316f9))


### Bug Fixes

* match native side chat reasoning style ([c527efd](https://github.com/AHGGG/dsh-side-chat/commit/c527efdde7b49768b91411bf92b3a1bc5e194fd0))

## [0.5.0](https://github.com/AHGGG/dsh-side-chat/compare/v0.4.2...v0.5.0) (2026-08-15)


### Features

* persist conversation annotations ([cb05613](https://github.com/AHGGG/dsh-side-chat/commit/cb056134a4cf3b6974500baf4919dc81d97a7540))
* persist conversation annotations ([d1fd773](https://github.com/AHGGG/dsh-side-chat/commit/d1fd7732f82d107bdaffb188dc7b792fd9aa9c97))

## [0.4.2](https://github.com/AHGGG/dsh-side-chat/compare/v0.4.1...v0.4.2) (2026-08-15)


### Bug Fixes

* align side chat tools with native dsh ([da58bdd](https://github.com/AHGGG/dsh-side-chat/commit/da58bdd45b077e90ee00fa36a058ec1df1602e67))

## [0.4.1](https://github.com/AHGGG/dsh-side-chat/compare/v0.4.0...v0.4.1) (2026-08-14)


### Bug Fixes

* stabilize side chat tool rendering ([48e356a](https://github.com/AHGGG/dsh-side-chat/commit/48e356a747446e6908b473c7204355202bbd87aa))

## [0.4.0](https://github.com/AHGGG/dsh-side-chat/compare/v0.3.0...v0.4.0) (2026-08-14)


### Features

* add annotated selections to main chat ([e485eae](https://github.com/AHGGG/dsh-side-chat/commit/e485eaebd0e009b00fec7d0d82c75011dbdcbba4))


### Bug Fixes

* polish annotation preview and demo ([e7196d8](https://github.com/AHGGG/dsh-side-chat/commit/e7196d8579a21e25042605f9d4de2f4e834bac8b))

## [0.3.0](https://github.com/AHGGG/dsh-side-chat/compare/v0.2.0...v0.3.0) (2026-08-14)


### Features

* improve side chat actions and markdown ([acb1368](https://github.com/AHGGG/dsh-side-chat/commit/acb1368c0f2c05bfa672a6cd09575a1f99b4ecf9))


### Bug Fixes

* polish side chat popovers and demo ([6e977fb](https://github.com/AHGGG/dsh-side-chat/commit/6e977fb9b715e49c05b0321b0a29a34b3c2274e6))

## [0.2.0](https://github.com/AHGGG/dsh-side-chat/compare/v0.2.0-alpha.1...v0.2.0) (2026-08-14)


### Bug Fixes

* release stable version ([653bda6](https://github.com/AHGGG/dsh-side-chat/commit/653bda66c85c64a18abc88301e1ef5bd41e44963))

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
