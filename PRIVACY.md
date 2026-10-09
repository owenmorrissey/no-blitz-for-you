# Privacy Policy — No blitz for you!

_Last updated: 2026-10-09_

**No blitz for you!** does not collect, store, transmit, sell, or share any personal data. It has no analytics, no tracking, no accounts, and no servers.

## What the extension does on your device

- On chess.com and lichess.org only, a content script watches your clicks to detect buttons that start a live game, and reads the selected time control from the page (for example a dropdown label or a link's query string). This happens entirely inside your browser. Nothing it sees is recorded or sent anywhere.
- If a click would start a game in a time control you chose to block, the extension cancels it and sends your browser to the redirect page you selected (such as chess puzzles).

## What is stored

Your settings only: whether the extension is on, which time controls to block, and where to redirect on each site. They are saved with the browser's extension storage (`storage.sync`), so your browser (for example, Chrome or Firefox sync) may sync them across your own devices under your browser account's own policies. We never receive them.

## Network access

The extension makes no network requests of its own and loads no remote code.

## Permissions

- `storage`: to save your settings.
- Access to `chess.com` and `lichess.org` pages (content scripts): to detect game-start clicks as described above. It does not run on any other site.

## Changes

If this policy changes, the updated version will be published in this file with a new date.

## Contact

Questions: morrisseyowen3@gmail.com
