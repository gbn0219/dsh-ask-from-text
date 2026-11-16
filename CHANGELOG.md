# Changelog

All notable changes to `dsh-ask-from-text` are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project follows [Semantic Versioning](https://semver.org/).

## [0.1.24] - 2026-11-16

### Fixed

- Enforce exactly one sidebar section per root conversation and deduplicate
  branch rows, preventing the same list from appearing twice while DSH
  replaces a row wrapper.

## [0.1.23] - 2026-11-16

### Fixed

- Group branch rows separately for each root conversation in the left sidebar,
  using a stable custom row instead of moving React-managed Session rows. This
  prevents duplicate rows after collapse/expand and keeps multiple main
  conversations independent.
- Clicking a sidebar branch switches to its root conversation first, then opens
  the branch and scrolls to the source quote.

## [0.1.22] - 2026-11-13

### Fixed

- Collapse the host's “show remaining conversations” / “show less” controls
  together with the `追问分支` group, and label the group with the total number
  of branch sessions rather than only the rendered rows.

## [0.1.21] - 2026-11-13

### Added

- Runtime dictionaries and Plugin Manager metadata for Japanese, Spanish,
  French, German, Russian, and Brazilian Portuguese, completing the eight DSH
  languages. Unsupported locales fall back to English.

## [0.1.20] - 2026-11-13

### Added

- Runtime UI localization for Chinese and English. The active DSH language is
  read through `ctx.locale`; other languages fall back to English. Native
  conversation and Plugin Manager metadata continue to follow DSH.

## [0.1.19] - 2026-11-13

### Fixed

- Do not pin a selected branch row above the group. Only the root/main Session
  is allowed above `追问分支`; clicking a branch keeps it in the group.

## [0.1.18] - 2026-11-13

### Fixed

- Put the shared `追问分支` header before the topmost branch row in visual
  document order, so collapsing/expanding no longer moves it below the group.

## [0.1.17] - 2026-11-13

### Fixed

- Keep the shared branch-group header when the group is collapsed by ignoring
  rows hidden by the plugin itself, while still ignoring rows hidden inside a
  folded Workspace or a stale search tree.

## [0.1.16] - 2026-11-13

### Fixed

- Restore the shared `追问分支` header by inserting it inside the first branch
  row wrapper, where the sidebar animation layer participates in layout, and
  keep only one header for all branch rows.

## [0.1.15] - 2026-11-13

### Fixed

- Group all branch Session rows under one shared `追问分支` header even when
  the sidebar gives each row its own animated wrapper, and keep the selected
  main row above that shared header.

## [0.1.14] - 2026-11-13

### Fixed

- Handle main and branch Sessions that the sidebar places in different
  Workspace sections by moving the main section above the first branch section.

## [0.1.13] - 2026-11-13

### Fixed

- README screenshots now use absolute CDN URLs so they render on the npm package page.

## [0.1.24] - 2026-11-16

### Fixed

- Enforce exactly one sidebar section per root conversation and deduplicate
  branch rows, preventing the same list from appearing twice while DSH
  replaces a row wrapper.

## [0.1.23] - 2026-11-16

### Fixed

- Group branch rows separately for each root conversation in the left sidebar,
  using a stable custom row instead of moving React-managed Session rows. This
  prevents duplicate rows after collapse/expand and keeps multiple main
  conversations independent.
- Clicking a sidebar branch switches to its root conversation first, then opens
  the branch and scrolls to the source quote.

## [0.1.22] - 2026-11-13

### Fixed

- Collapse the host's “show remaining conversations” / “show less” controls
  together with the `追问分支` group, and label the group with the total number
  of branch sessions rather than only the rendered rows.

## [0.1.21] - 2026-11-13

### Added

- Runtime dictionaries and Plugin Manager metadata for Japanese, Spanish,
  French, German, Russian, and Brazilian Portuguese, completing the eight DSH
  languages. Unsupported locales fall back to English.

## [0.1.20] - 2026-11-13

### Added

- Runtime UI localization for Chinese and English. The active DSH language is
  read through `ctx.locale`; other languages fall back to English. Native
  conversation and Plugin Manager metadata continue to follow DSH.

## [0.1.19] - 2026-11-13

### Fixed

- Do not pin a selected branch row above the group. Only the root/main Session
  is allowed above `追问分支`; clicking a branch keeps it in the group.

## [0.1.18] - 2026-11-13

### Fixed

- Put the shared `追问分支` header before the topmost branch row in visual
  document order, so collapsing/expanding no longer moves it below the group.

## [0.1.17] - 2026-11-13

### Fixed

- Keep the shared branch-group header when the group is collapsed by ignoring
  rows hidden by the plugin itself, while still ignoring rows hidden inside a
  folded Workspace or a stale search tree.

## [0.1.16] - 2026-11-13

### Fixed

- Restore the shared `追问分支` header by inserting it inside the first branch
  row wrapper, where the sidebar animation layer participates in layout, and
  keep only one header for all branch rows.

## [0.1.15] - 2026-11-13

### Fixed

- Group all branch Session rows under one shared `追问分支` header even when
  the sidebar gives each row its own animated wrapper, and keep the selected
  main row above that shared header.

## [0.1.14] - 2026-11-13

### Fixed

- Handle main and branch Sessions that the sidebar places in different
  Workspace sections by moving the main section above the first branch section.

## [0.1.13] - 2026-11-13

### Fixed

- Prefer the selected sidebar row when pinning the main conversation above its
  branch group, and re-evaluate when the selected Session changes.

## [0.1.12] - 2026-11-13

### Changed

- The main conversation row stays above its branch rows in the left sidebar,
  regardless of the host recency sort.

## [0.1.11] - 2026-11-13

### Changed

- The stage now shows the selected quote as a colored, independent block above
  the conversation and hides the duplicate native blockquote.
- The stage branch tree now matches the richer design: main-chat root, path/all
  tabs, quote preview, parent context, status, and current/context badges.

## [0.1.10] - 2026-11-13

### Changed

- Renamed the package and GitHub repository to `dsh-ask-from-text`. The
  localStorage UI key stays `dsh.inline-followup.v1` so existing branch metadata
  survives the rename.

## [0.1.9] - 2026-11-13

### Changed

- Renamed the user-facing product to **划词追问 / Ask from Text**. At this
  version the internal package name was still `dsh-inline-followup`.

## [0.1.8] - 2026-11-13

### Added

- Selection-based follow-up branches for completed assistant answers.
- Real Session forks at the durable anchor sequence, rendered with the shared
  Conversation UI (`SessionProvider` + embedded `conversation.content`).
- Colored underlines, gutter `#n` markers, and a bottom-right branch dock.
- Independent floating conversation and new-draft input windows; both drag and
  resize, while existing sent branches use one panel with the native composer.
- Stage view with breadcrumbs, back/forward history, branch tree, restore, and
  close-to-main.
- Exact-range centering when opening a branch from the dock; the selected text
  is centered rather than only its Turn.
- A collapsible `追问分支` group for branch Sessions in the left sidebar.
- Draft deletion from the input window header, branch dock, and stage tree.
- Light/dark theme support for highlights, panels, and the branch tree.

### Changed

- New drafts open only a compact input window; the selected quote remains in the
  transcript under its colored underline, without a duplicate quote window.
- The stage excludes the left sidebar and clears the macOS window-chrome band.
- Falling back to the native turn navigator when an anchored Turn is not mounted.
- Branch tree rows are ordered depth-first, matching the context hierarchy.

### Known limitations

- Branch Sessions remain visible in the normal DSH Session list (now groupable
  with the collapsible `追问分支` header).
- Sent branches cannot be deleted from the plugin; archive them in DSH. Only
  unsent drafts can be deleted.
- Inherited branch context is loaded by the model but hidden in the UI through
  DOM filtering; it is not an expandable context viewer yet.
- Desktop-focused. Narrow-screen and mobile polish are deferred.
- No merge between sibling branches, no cross-device branch tree sync.

## [0.1.0] - 2026-11-13

### Added

- Initial local prototype: selection chip, floating draft, real Session fork,
  native conversation rendering, colored marks, stage, and branch tree.

[0.1.8]: https://github.com/gbn0219/dsh-inline-followup/releases/tag/v0.1.8
[0.1.9]: https://github.com/gbn0219/dsh-inline-followup/releases/tag/v0.1.9
[0.1.10]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.10
[0.1.11]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.11
[0.1.12]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.12
[0.1.13]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.13
[0.1.14]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.14
[0.1.15]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.15
[0.1.16]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.16
[0.1.17]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.17
[0.1.18]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.18
[0.1.19]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.19
[0.1.20]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.20
[0.1.21]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.21
[0.1.22]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.22
[0.1.23]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.23
[0.1.24]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.24
[0.1.13]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.13
[0.1.14]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.14
[0.1.15]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.15
[0.1.16]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.16
[0.1.17]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.17
[0.1.18]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.18
[0.1.19]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.19
[0.1.20]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.20
[0.1.21]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.21
[0.1.22]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.22
[0.1.23]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.23
[0.1.24]: https://github.com/gbn0219/dsh-ask-from-text/releases/tag/v0.1.24
