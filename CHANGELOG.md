# Changelog

All notable changes to `dsh-ask-from-text` are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project follows [Semantic Versioning](https://semver.org/).

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
