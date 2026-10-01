export type RedirectTarget =
  | 'lichess-puzzles'
  | 'chesscom-puzzles'
  | 'chesscom-lessons'
  | 'block';

export interface Config {
  enabled: boolean;
  redirectTarget: RedirectTarget;
}

export const DEFAULT_CONFIG: Config = {
  enabled: true,
  redirectTarget: 'lichess-puzzles',
};

export const REDIRECT_URLS: Record<RedirectTarget, string> = {
  'lichess-puzzles': 'https://lichess.org/training',
  'chesscom-puzzles': 'https://www.chess.com/puzzles',
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
