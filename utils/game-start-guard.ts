import {
  getConfig,
  redirectUrl,
  withDefaults,
  type Config,
} from './config';

type StringListKey = {
  [K in keyof Config]: Config[K] extends string[] ? K : never;
}[keyof Config];
type RedirectKey = 'chesscomRedirectTarget' | 'lichessRedirectTarget';

// The single policy: a class we couldn't determine is always blocked (fail
// closed); otherwise block exactly what the user listed.
export function shouldBlock(blocked: readonly string[], cls: string): boolean {
  return cls === 'unknown' || blocked.includes(cls);
}

// Shared by every per-site content script. The click is the one decision
// point: `matchClick` maps it to a time-class string, 'unknown', or null
// (not a game-start control). Config is loaded *before* the listener is
// installed — it must be read synchronously inside the click handler (an
// `await` there would let the page's own handler start matchmaking first),
// and we never act on placeholder defaults.
export async function installGameStartGuard(options: {
  matchClick: (target: HTMLElement | null) => string | null;
  blockedKey: StringListKey;
  redirectKey: RedirectKey;
}): Promise<void> {
  let config = await getConfig();
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.config) config = withDefaults(changes.config.newValue);
  });

  document.addEventListener(
    'click',
    (event) => {
      if (!config.enabled) return;

      const cls = options.matchClick(event.target as HTMLElement | null);
      if (cls === null) return;
      if (!shouldBlock(config[options.blockedKey], cls)) return;

      // Capture phase + stopImmediatePropagation: runs before the page's
      // own click handler, so matchmaking never starts.
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = redirectUrl(config[options.redirectKey]);
    },
    true, // capture
  );
}
