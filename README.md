# No blitz for you!

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

No chess.com/lichess API access is needed for this, and there's no
background script at all — just two content scripts and a popup.

- **chess.com**: a content script (`entrypoints/chesscom.content.ts`)
  intercepts the click that starts a game — on `/play/online`, the home page
  quick-start widget, and the "Rematch"/"New Game" buttons shown after a
  game ends (see `utils/chesscom/triggers.ts` for the full list of entry
  points found so far, each confirmed against the live site). This runs
  *before* matchmaking, so it never pairs you with a real opponent just to
  then redirect away. Per-time-class blocking (bullet/blitz always block;
  rapid configurable by default) is resolved at click time from whatever the
  clicked element exposes — a query param, a label, a sibling dropdown, or
  (for Rematch, which has no time control of its own) a sibling "New N min"
  button in the same button group — see `utils/chesscom/time-class.ts`.
- **lichess**: a content script (`entrypoints/lichess.content.ts`)
  intercepts clicks on the homepage "quick pairing" pool (`.lpool[data-id]`
  elements — see `utils/lichess/triggers.ts`), the same before-matchmaking
  approach as chess.com. The pool's `data-id` is literally
  `"<limitMinutes>+<incrementSeconds>"`, and the bullet/blitz/rapid/
  classical classification (`utils/lichess/speed.ts`) is copied directly
  from lichess's own open-source formula (`clockToSpeed` in
  lichess-org/lila), not guessed.

Every game-start action we know about is handled entirely at the click, by
the content script that's already on the page — there's no second system to
reconcile it with. The tradeoff: entry points we haven't taught a content
script to recognize (see Status below) have *no* interception at all, not a
weaker fallback — there's no click to hook into once you're past one of
those, so nothing redirects you.

Settings (enabled/disabled, which chess.com time classes and lichess speeds
to block, and each site's own redirect target — chess.com defaults to
chess.com puzzles, lichess to lichess puzzles, independently configurable)
are stored via `browser.storage.sync` and edited from the toolbar popup
(`entrypoints/popup`).

## Status: what's actually implemented

### chess.com — click-intercepted, time-class aware (the "should work correctly" list)

All of these are caught by `entrypoints/chesscom.content.ts` *before*
matchmaking starts, and correctly respect the bullet/blitz/rapid checkboxes
in the popup (default: block bullet + blitz, allow rapid):

- `/play/online` picker: "Start Game" button, time class read from the
  sibling time-control dropdown at click time.
- Home page (`/home`) quick-start widget: the `<a>` link's `base=<seconds>`
  query param gives the time class directly, no DOM lookup needed.
- Finished-game page "New Game" tab: same "Start Game" + dropdown pattern as
  `/play/online`.
- "New N min" button (shown on a finished game's Analysis tab and in the
  game-over modal): time class parsed straight from the label text (e.g.
  "New 1 min").
- "Rematch" button: has no time control of its own (it implicitly reuses
  the current game's), but it's always rendered next to a "New N min"
  button in the same button group, so we read the time class off that
  sibling instead.

### chess.com — NOT covered at all (plays normally, no redirect)

- Accepting an incoming challenge
- Puzzle-rush-adjacent promos and anything else not in the list above

### lichess — click-intercepted, speed-aware, but only the homepage pool

`entrypoints/lichess.content.ts` catches the homepage "quick pairing" pool
(the 6-or-so clock buttons like "1+0", "3+2", "10+0" on lichess.org/), speed-
aware per the `ultraBullet`/`bullet`/`blitz`/`rapid`/`classical` checkboxes
in the popup (default: block ultraBullet + bullet + blitz, allow rapid +
classical).

### lichess — NOT covered at all (plays normally, no redirect)

- the "Custom" pool option (opens a modal to configure a one-off game/seek)
- challenging a friend, or accepting an incoming challenge
- the `#pool/<id>` URL-hash auto-join lichess uses for shared pool links
  (`joinPoolFromLocationHash` in lila's `ctrl.ts`) — this never fires a
  click at all, so click interception structurally can't catch it; would
  need its own handling (e.g. watching for the hash) if it matters in
  practice.

This is a deliberate tradeoff, not a gap we're unaware of: see "How it
works" above for why there's no fallback for these.

## Stack

- [WXT](https://wxt.dev) — cross-browser WebExtension framework (Vite-based), builds one codebase to Chrome (Manifest V3) and Firefox (Manifest V2, WXT's default for Firefox) targets.
- TypeScript

## Project layout

- `entrypoints/chesscom.content.ts` — intercepts chess.com's "start game" clicks before matchmaking
- `entrypoints/lichess.content.ts` — intercepts lichess's pool-pairing clicks before matchmaking
- `entrypoints/popup/` — toolbar popup UI for settings
- `utils/config.ts` — settings schema, defaults (merged in one place), redirect targets, storage read/write
- `utils/chesscom/triggers.ts` — DOM matching for chess.com's various "start game" buttons/links
- `utils/lichess/triggers.ts` — DOM matching for lichess's pool-pairing buttons
- `utils/chesscom/time-class.ts` — chess.com bullet/blitz/rapid classification from base time in seconds
- `utils/lichess/speed.ts` — lichess ultraBullet/bullet/blitz/rapid/classical classification, sourced from lila
- `utils/game-start-guard.ts` — shared click-interception logic and the single `shouldBlock` policy (unknown class fails closed)
- `utils/**/*.test.ts` — vitest unit tests (`npm test`)

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
npm test               # unit tests (vitest)
npm run zip             # Chrome production zip, in .output/
npm run zip:firefox     # Firefox production zip, in .output/
```

## Build instructions for reviewers (Firefox AMO)

This extension is built with [WXT](https://wxt.dev) on top of Vite, which
bundles and minifies the shipped JS — per [Mozilla's source code submission
policy](https://extensionworkshop.com/documentation/publish/source-code-submission/),
that requires submitting source alongside build instructions to reproduce
it. `npm run zip:firefox` generates both `*-firefox.zip` (the build to
install) and `*-sources.zip` (everything below) automatically.

- **Environment**: no special requirements — any reasonably recent Node.js
  (built and tested with Node 24.2.0 / npm 11.3.0, close to AMO's default
  review environment of Node 24.14.0 / npm 11.9.0 at time of writing).
- **Dependencies**: entirely public npm packages, versions locked in
  `package-lock.json` — no private registries, no custom/vendored tooling.
- **Build**:
  ```sh
  npm install
  npm run build:firefox
  ```
- **Output**: `.output/firefox-mv2/`, which should match the submitted
  build exactly — diff it against the contents of the uploaded
  `*-firefox.zip`.
- **No obfuscation**: only Vite's standard minification. Nothing transforms
  code to intentionally resist reading.
