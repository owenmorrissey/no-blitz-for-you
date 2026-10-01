import { shouldBlockChesscomTimeClass } from '@/utils/config';
import { matchChesscomGameStartClick } from '@/utils/chesscom-triggers';
import { installGameStartGuard } from '@/utils/game-start-guard';

// chess.com's matchmaking has no confirmation step: once matched you land on
// /game/<numeric id> with a real opponent already paired — too late to back
// out politely. So we intercept the click that starts it instead, where the
// time class is always knowable right there (a label, a query param, a
// sibling dropdown — see utils/chesscom-triggers.ts). Entry points we
// haven't taught this to recognize yet (challenge links, ...) aren't
// blocked at all — there's no click to intercept once you're past one of
// those, see README.
export default defineContentScript({
  matches: ['*://*.chess.com/*'],
  main() {
    installGameStartGuard({
      matchClick: matchChesscomGameStartClick,
      shouldBlock: (config, match) => shouldBlockChesscomTimeClass(config, match.timeClass),
      redirectTarget: (config) => config.chesscomRedirectTarget,
    });
  },
});
