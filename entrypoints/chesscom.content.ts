import { matchChesscomGameStartClick } from '@/utils/chesscom/triggers';
import { installGameStartGuard } from '@/utils/game-start-guard';

// chess.com's matchmaking has no confirmation step: once matched you land on
// /game/<numeric id> with a real opponent already paired — too late to back
// out politely. So we decide at the click, where the time class is always
// knowable (see utils/chesscom/triggers.ts). Entry points with no click
// (challenge links, ...) aren't covered — see README.
export default defineContentScript({
  matches: ['*://*.chess.com/*'],
  main: () =>
    installGameStartGuard({
      matchClick: matchChesscomGameStartClick,
      blockedKey: 'blockedChesscomTimeClasses',
      redirectKey: 'chesscomRedirectTarget',
    }),
});
