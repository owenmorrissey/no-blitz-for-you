// chess.com has used stable, documented URL paths for live/daily games for
// years: /game/live/<id> and /game/daily/<id>.
const CHESSCOM_GAME_PATTERN = /^\/game\/(live|daily)\//;

// Lichess game URLs are just /<8-char-id>, which collides with a handful of
// static routes that happen to also be 8 characters (e.g. /training is not
// 8 chars, but something like it could be). This is a best-effort heuristic —
// verify against the live site and extend the denylist if false positives
// or misses show up.
const LICHESS_GAME_ID_PATTERN = /^\/([a-zA-Z0-9]{8})(?:\/(black|white))?\/?$/;
const LICHESS_STATIC_ROUTE_DENYLIST = new Set([
  'training', 'tournament', 'swiss', 'simul', 'practice', 'study',
  'broadcast', 'streamer', 'ublog', 'account', 'password', 'contact',
  'sitemap', 'patron', 'coach', 'mobile', 'editor', 'analysis',
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
    return !LICHESS_STATIC_ROUTE_DENYLIST.has(gameId.toLowerCase());
  }

  return false;
}
