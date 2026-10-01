import { shouldBlockChesscomTimeClass } from '@/utils/config';
import { matchChesscomGameStartClick } from '@/utils/chesscom-triggers';
import { installGameStartGuard } from '@/utils/game-start-guard';

// chess.com's matchmaking has no confirmation step: once matched you land on
// /game/<numeric id> with a real opponent already paired — too late to back
// out politely. So instead of waiting for that URL (see utils/game-urls.ts,
// still used as a background.ts backstop for entry points we haven't found
// yet, e.g. challenge links), we intercept the click that starts it.
export default defineContentScript({
  matches: ['*://*.chess.com/*'],
  main() {
    installGameStartGuard({
      matchClick: matchChesscomGameStartClick,
      shouldBlock: (config, match) => shouldBlockChesscomTimeClass(config, match.timeClass),
      allowedMessageType: 'chesscom-game-allowed',
    });
  },
});
