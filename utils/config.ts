import type { TimeClass } from './chesscom/time-class';
import type { LichessSpeed } from './lichess/speed';

export const REDIRECT_TARGETS = [
  { value: 'lichess-puzzles', label: 'Lichess puzzles', url: 'https://lichess.org/training' },
  { value: 'lichess-practice', label: 'Lichess practice', url: 'https://lichess.org/practice' },
  {
    value: 'chesscom-puzzles',
    label: 'Chess.com puzzles',
    url: 'https://www.chess.com/puzzles/rated',
  },
  { value: 'chesscom-lessons', label: 'Chess.com lessons', url: 'https://www.chess.com/lessons' },
  { value: 'block', label: 'Empty page', url: 'about:blank' },
] as const;

export type RedirectTarget = (typeof REDIRECT_TARGETS)[number]['value'];

export interface Config {
  enabled: boolean;
  // Independent per site, so a chess.com game redirects to chess.com
  // puzzles by default and a lichess game to lichess puzzles — each can
  // still be pointed at the other site (or anywhere else) if you want.
  chesscomRedirectTarget: RedirectTarget;
  lichessRedirectTarget: RedirectTarget;
  // Which time classes/speeds to redirect away from, per site (each site
  // has its own vocabulary and thresholds). A class not in the relevant
  // list is allowed to start normally (e.g. leave 'rapid' out to allow
  // rapid games through). A click whose class can't be determined is always
  // blocked regardless of these lists — fail closed, since this is an
  // anti-impulse tool. See shouldBlock in utils/game-start-guard.ts.
  blockedChesscomTimeClasses: TimeClass[];
  blockedLichessSpeeds: LichessSpeed[];
}

export const DEFAULT_CONFIG: Config = {
  enabled: true,
  chesscomRedirectTarget: 'chesscom-puzzles',
  lichessRedirectTarget: 'lichess-puzzles',
  blockedChesscomTimeClasses: ['bullet', 'blitz'],
  blockedLichessSpeeds: ['ultraBullet', 'bullet', 'blitz'],
};

export function redirectUrl(target: RedirectTarget): string {
  return REDIRECT_TARGETS.find((t) => t.value === target)!.url;
}

// The one place stored settings are merged with defaults (missing keys fall
// back; there is no other source of defaults).
export function withDefaults(stored: unknown): Config {
  return { ...DEFAULT_CONFIG, ...(stored as Partial<Config> | undefined) };
}

export async function getConfig(): Promise<Config> {
  const stored = await browser.storage.sync.get('config');
  return withDefaults(stored.config);
}

export async function setConfig(config: Config): Promise<void> {
  await browser.storage.sync.set({ config });
}
