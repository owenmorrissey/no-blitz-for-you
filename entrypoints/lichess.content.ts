import { shouldBlockLichessSpeed } from '@/utils/config';
import { matchLichessGameStartClick } from '@/utils/lichess-triggers';
import { installGameStartGuard } from '@/utils/game-start-guard';

// lichess's homepage pool pairing has no confirmation step either: clicking
// a time control joins matchmaking immediately (see
// utils/lichess-triggers.ts for the details, sourced directly from lila).
// Entry points we haven't taught this to recognize yet (the Custom modal,
// challenges, the #pool/ hash auto-join) aren't blocked at all — there's no
// click to intercept for those, see README.
export default defineContentScript({
  matches: ['*://*.lichess.org/*'],
  main() {
    installGameStartGuard({
      matchClick: matchLichessGameStartClick,
      shouldBlock: (config, match) => shouldBlockLichessSpeed(config, match.speed),
      redirectTarget: (config) => config.lichessRedirectTarget,
    });
  },
});
