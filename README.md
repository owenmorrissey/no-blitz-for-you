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

No chess.com/lichess API access is needed for this.

- **chess.com**: a content script (`entrypoints/chesscom.content.ts`)
  intercepts the click that starts a game — on `/play/online`, the home page
  quick-start widget, and the "Rematch"/"New Game" buttons shown after a
  game ends (see `utils/chesscom-triggers.ts` for the full list of entry
  points found so far, each confirmed against the live site). This runs
  *before* matchmaking, so it never pairs you with a real opponent just to
  then redirect away. Per-time-class blocking (bullet/blitz always block;
  rapid configurable by default) is resolved at click time from whatever the
  clicked element exposes — a query param, a label, a sibling dropdown, or
  (for Rematch, which has no time control of its own) a sibling "New N min"
  button in the same button group — see `utils/time-class.ts`.
- **lichess**: a content script (`entrypoints/lichess.content.ts`)
  intercepts clicks on the homepage "quick pairing" pool (`.lpool[data-id]`
  elements — see `utils/lichess-triggers.ts`), the same before-matchmaking
  approach as chess.com. The pool's `data-id` is literally
  `"<limitMinutes>+<incrementSeconds>"`, and the bullet/blitz/rapid/
  classical classification (`utils/lichess-speed.ts`) is copied directly
  from lichess's own open-source formula (`clockToSpeed` in
  lichess-org/lila), not guessed.
- **Both sites**: the background script (`entrypoints/background.ts`)
  additionally watches the active tab's URL (`webNavigation` API) and
  redirects if it ever lands on a live-game URL anyway (`utils/game-urls.ts`)
  — a backstop for any entry point the content scripts don't know about yet
  (e.g. accepting an incoming challenge, lichess's custom-game modal). This
  path has no time-class info, so it always blocks regardless of the
  time-control settings, except for games the content scripts already
  explicitly approved (see the "allow window" note in Status below).

Settings (enabled/disabled, redirect target, which chess.com time classes
and lichess speeds to block) are stored via `browser.storage.sync` and
edited from the toolbar popup (`entrypoints/popup`).

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

### Both sites — URL-based backstop, NOT time-class aware

`entrypoints/background.ts` watches the active tab's URL and redirects if it
ever lands on a live-game URL (`utils/game-urls.ts`), regardless of *why* it
got there. This exists to catch entry points the content script doesn't know
about yet (e.g. accepting an incoming challenge, or any lichess game at all —
see below). It has no way to know the time class, so when it fires, it
**always blocks**, even if rapid is otherwise allowed.

To avoid double-handling games the content script already approved, the
content script sends a `chesscom-game-allowed` message when it lets a click
through, which suppresses the backstop for that tab for 5 minutes
(`ALLOW_WINDOW_MS` in `background.ts`). Known edge case: if that same tab
somehow reaches a *different*, normally-blocked live game within that
5-minute window through a path the content script doesn't intercept, the
backstop would incorrectly let it through too. Low risk in practice, not
actively guarded against.

### lichess — click-intercepted, speed-aware, but only the homepage pool

`entrypoints/lichess.content.ts` catches the homepage "quick pairing" pool
(the 6-or-so clock buttons like "1+0", "3+2", "10+0" on lichess.org/), speed-
aware per the `ultraBullet`/`bullet`/`blitz`/`rapid`/`classical` checkboxes
in the popup (default: block ultraBullet + bullet + blitz, allow rapid +
classical).

NOT yet covered by click interception, so these fall through to the
URL-based backstop (always blocks, no speed awareness):
- the "Custom" pool option (opens a modal to configure a one-off game/seek)
- challenging a friend, or accepting an incoming challenge
- the `#pool/<id>` URL-hash auto-join lichess uses for shared pool links
  (`joinPoolFromLocationHash` in lila's `ctrl.ts`) — this never fires a
  click at all, so no click-interception approach can catch it; would need
  its own handling (e.g. watching for the hash) if it matters in practice.

## Stack

- [WXT](https://wxt.dev) — cross-browser WebExtension framework (Vite-based), builds one codebase to Chrome (Manifest V3) and Firefox (Manifest V2, WXT's default for Firefox) targets.
- TypeScript

## Project layout

- `entrypoints/background.ts` — URL-based backstop, watches navigation
- `entrypoints/chesscom.content.ts` — intercepts chess.com's "start game" clicks before matchmaking
- `entrypoints/lichess.content.ts` — intercepts lichess's pool-pairing clicks before matchmaking
- `entrypoints/popup/` — toolbar popup UI for settings
- `utils/config.ts` — settings schema + storage read/write
- `utils/game-urls.ts` — URL pattern matching for "a live game just started" (background.ts backstop)
- `utils/chesscom-triggers.ts` — DOM matching for chess.com's various "start game" buttons/links
- `utils/lichess-triggers.ts` — DOM matching for lichess's pool-pairing buttons
- `utils/time-class.ts` — chess.com bullet/blitz/rapid classification from base time in seconds
- `utils/lichess-speed.ts` — lichess ultraBullet/bullet/blitz/rapid/classical classification, sourced from lila
- `utils/game-start-guard.ts` — shared click-interception logic used by both content scripts

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

See the "Status" section above for the precise current behavior per entry
point. Next steps, roughly in priority order:

- **lichess: cover more entry points.** Custom game modal, challenge a
  friend, accept an incoming challenge, `#pool/<id>` hash auto-join — see
  the lichess Status section above for specifics on each.
- **chess.com: cover more entry points** in the same vein — challenge a
  friend, accept an incoming challenge, puzzle-rush-adjacent promos, ...
  (anything not listed in the chess.com Status section above).
- **Replace placeholder icons** in `public/icon/` (currently WXT's default) and pick a real Firefox extension id in `wxt.config.ts` before publishing.
- Chesscom lessons/chessable as additional redirect target options.
- Publish to Chrome Web Store / Firefox Add-ons (needs developer accounts, listing assets, review).
