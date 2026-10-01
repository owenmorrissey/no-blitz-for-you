import { DEFAULT_CONFIG, REDIRECT_URLS, getConfig, type Config } from './config';

// Shared by every per-site content script (chesscom.content.ts,
// lichess.content.ts, ...): cache config locally (storage reads are async,
// but we must preventDefault synchronously inside the click handler — by
// the time an `await getConfig()` resolved, the page's own handler would
// already have started matchmaking), intercept the click in the capture
// phase before the page sees it, and either redirect or let it through.
export function installGameStartGuard<Match>(options: {
  matchClick: (target: HTMLElement | null) => Match | null;
  shouldBlock: (config: Config, match: Match) => boolean;
}): void {
  let config: Config = DEFAULT_CONFIG;
  getConfig().then((c) => {
    config = c;
  });
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.config) {
      config = { ...DEFAULT_CONFIG, ...(changes.config.newValue as Partial<Config>) };
    }
  });

  document.addEventListener(
    'click',
    (event) => {
      if (!config.enabled) return;

      const target = event.target as HTMLElement | null;
      const match = options.matchClick(target);
      if (!match) return;
      if (!options.shouldBlock(config, match)) return;

      // Capture phase + stopImmediatePropagation: runs before the page's
      // own click handler, so matchmaking never starts.
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = REDIRECT_URLS[config.redirectTarget];
    },
    true, // capture
  );
}
