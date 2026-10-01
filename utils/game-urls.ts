// Confirmed live 2026-10-01: starting a game from chess.com/play/online
// lands on /game/<numeric id> (e.g. /game/184662556846) once matchmaking
// finds an opponent — not /game/live/<id> as older docs suggested.
const CHESSCOM_GAME_PATTERN = /^\/game\/\d+/;

// Lichess game URLs are /<8-char-id>, matching Round.watcher's route:
//   GET /$gameId<\w{8}>
//   GET /$gameId<\w{8}>/$color<white|black>
// (conf/routes in lichess-org/lila). That 8-char pattern collides with a
// handful of *other* bare top-level routes that are also exactly 8 word
// characters. Play Framework resolves this server-side by matching routes
// top-to-bottom (those static routes are declared earlier in the file than
// Round.watcher, so they win), but we're just regex-matching client-side, so
// we need an explicit denylist. Verified directly against conf/routes as of
// 2026-10-01 — grep for `^(GET|POST)\s+/<word>(\s|$)` where <word> is exactly
// 8 word characters. Re-check this list if lichess adds new top-level routes.
const LICHESS_GAME_ID_PATTERN = /^\/(\w{8})(?:\/(black|white))?\/?$/;
const LICHESS_STATIC_ROUTE_DENYLIST = new Set([
  'analysis', 'features', 'practice', 'streamer', 'timeline', 'training',
]);

export function isLiveGameUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.hostname.endsWith('chess.com')) {
    return CHESSCOM_GAME_PATTERN.test(parsed.pathname);
  }

  if (parsed.hostname.endsWith('lichess.org')) {
    const match = LICHESS_GAME_ID_PATTERN.exec(parsed.pathname);
    const gameId = match?.[1];
    if (!gameId) return false;
    return !LICHESS_STATIC_ROUTE_DENYLIST.has(gameId);
  }

  return false;
}
