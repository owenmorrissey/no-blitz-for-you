# Blockchess

A browser extension to stop you from impulsively starting a chess game.

1. Redirect games to puzzles
- When the user attempts to start a live chess game (on chess.com or lichess.org), they are redirected to the lichess puzzles page instead
- possible configuration:
    - only for certain time controls (e.g. redirect on blitz/bullet but allow rapid/daily games)
    - redirect location
        - could simply just block instead of redirect
        - could also optionally redirect to lichess puzzles, chesscom puzzles, chesscom lessons, chessable etc.
            - should be configurable, but with a reasonable default (lichess puzzles)

## How it works

No chess.com/lichess API access is needed for this — it works by watching
the URL of the active tab from the extension's background script
(`webNavigation` API) and redirecting to the puzzles page as soon as the URL
matches a "live game started" pattern (see `utils/game-urls.ts`). Settings
(enabled/disabled, redirect target) are stored via `browser.storage.sync`
and edited from the toolbar popup (`entrypoints/popup`).

## Stack

- [WXT](https://wxt.dev) — cross-browser WebExtension framework (Vite-based), builds one codebase to Chrome (Manifest V3) and Firefox (Manifest V2, WXT's default for Firefox) targets.
- TypeScript

## Project layout

- `entrypoints/background.ts` — watches navigation, decides whether to redirect
- `entrypoints/popup/` — toolbar popup UI for settings
- `utils/config.ts` — settings schema + storage read/write
- `utils/game-urls.ts` — URL pattern matching for "a live game just started"

## Developing

```sh
npm install
npm run dev            # Chrome, with hot reload — opens a dev browser profile
npm run dev:firefox    # Firefox equivalent
```

To load it manually instead:
- **Chrome**: `npm run build`, then go to `chrome://extensions`, enable
  "Developer mode", click "Load unpacked", and select `.output/chrome-mv3`.
- **Firefox**: `npm run build:firefox`, then go to `about:debugging#/runtime/this-firefox`,
  click "Load Temporary Add-on", and select any file inside `.output/firefox-mv2`
  (e.g. `manifest.json`).

```sh
npm run compile        # typecheck
npm run zip             # Chrome production zip, in .output/
npm run zip:firefox     # Firefox production zip, in .output/
```

# TODO

- **Verify the lichess URL heuristic against the live site.** Lichess game
  URLs are just `/<8-char-id>`, which is ambiguous with a handful of static
  routes (see the denylist in `utils/game-urls.ts`) — needs real-world
  testing to catch any that slipped through.
- **Time-control filtering** (e.g. allow rapid/daily, block blitz/bullet).
  The current approach (redirect after the URL changes) doesn't have the
  time control at that point — this likely needs a content script that reads
  the picked time control from the page *before* the game starts, which
  requires inspecting each site's current DOM/UI.
- **Replace placeholder icons** in `public/icon/` (currently WXT's default) and pick a real Firefox extension id in `wxt.config.ts` before publishing.
- Chesscom lessons/chessable as additional redirect target options.
- Publish to Chrome Web Store / Firefox Add-ons (needs developer accounts, listing assets, review).
