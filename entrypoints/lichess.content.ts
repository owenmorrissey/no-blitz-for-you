import { matchLichessGameStartClick } from '@/utils/lichess/triggers';
import { installGameStartGuard } from '@/utils/game-start-guard';

// lichess's homepage pool pairing has no confirmation step either: clicking
// a time control joins matchmaking immediately (see
// utils/lichess/triggers.ts). Entry points with no click (the #pool/ hash
// auto-join, challenges, ...) aren't covered — see README.
export default defineContentScript({
  matches: ['*://*.lichess.org/*'],
  main: () =>
    installGameStartGuard({
      matchClick: matchLichessGameStartClick,
      blockedKey: 'blockedLichessSpeeds',
      redirectKey: 'lichessRedirectTarget',
    }),
});
