import type { TimeClass } from './time-class';
import type { LichessSpeed } from './lichess-speed';

export type RedirectTarget =
  | 'lichess-puzzles'
  | 'lichess-practice'
  | 'chesscom-puzzles'
  | 'chesscom-lessons'
  | 'block';

export interface Config {
  enabled: boolean;
  // Independent per site, so a chess.com game redirects to chess.com
  // puzzles by default and a lichess game to lichess puzzles — each can
  // still be pointed at the other site (or anywhere else) if you want.
  chesscomRedirectTarget: RedirectTarget;
  lichessRedirectTarget: RedirectTarget;
  // Which time classes/speeds to redirect away from, per site (each site
  // has its own vocabulary and thresholds — see utils/time-class.ts and
  // utils/lichess-speed.ts). A class not in the relevant set is allowed to
  // start normally (e.g. leave 'rapid' out to allow rapid games through).
  // Triggers where the class can't be determined (see
  // utils/chesscom-triggers.ts / utils/lichess-triggers.ts) are always
  // blocked regardless of these sets — fail closed, since this is an
  // anti-impulse tool.
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

export const REDIRECT_URLS: Record<RedirectTarget, string> = {
  'lichess-puzzles': 'https://lichess.org/training',
  'lichess-practice': 'https://lichess.org/practice',
  'chesscom-puzzles': 'https://www.chess.com/lessons/all-lessons',
  'chesscom-lessons': 'https://www.chess.com/lessons',
  block: 'about:blank',
};

export async function getConfig(): Promise<Config> {
  const stored = await browser.storage.sync.get('config');
  return { ...DEFAULT_CONFIG, ...(stored.config as Partial<Config> | undefined) };
}

export async function setConfig(config: Config): Promise<void> {
  await browser.storage.sync.set({ config });
}

export function shouldBlockChesscomTimeClass(
  config: Config,
  timeClass: TimeClass | 'unknown',
): boolean {
  if (timeClass === 'unknown') return true; // fail closed
  return config.blockedChesscomTimeClasses.includes(timeClass);
}

export function shouldBlockLichessSpeed(config: Config, speed: LichessSpeed | 'unknown'): boolean {
  if (speed === 'unknown') return true; // fail closed
  return config.blockedLichessSpeeds.includes(speed);
}
