import { shouldBlockLichessSpeed } from '@/utils/config';
import { matchLichessGameStartClick } from '@/utils/lichess-triggers';
import { installGameStartGuard } from '@/utils/game-start-guard';

// lichess's homepage pool pairing has no confirmation step either: clicking
// a time control joins matchmaking immediately (see
// utils/lichess-triggers.ts for the details, sourced directly from lila).
// background.ts's URL-based backstop remains the catch-all for entry points
// not covered here yet (custom game modal, challenges, ...).
export default defineContentScript({
  matches: ['*://*.lichess.org/*'],
  main() {
    installGameStartGuard({
      matchClick: matchLichessGameStartClick,
      shouldBlock: (config, match) => shouldBlockLichessSpeed(config, match.speed),
      allowedMessageType: 'lichess-game-allowed',
    });
  },
});
