import { classifyByBaseSeconds, type TimeClass } from './time-class';

// chess.com has several different code paths that start a live game,
// confirmed live 2026-10-01:
//
// 1. The matchmaking picker at /play/online: <button>Start Game</button>,
//    Vue click handler (no href), kicks off a websocket seek. Time control
//    is read from a sibling dropdown button with a label like "1 min (Bullet)".
// 2. Quick-start widgets elsewhere (e.g. the /home page): a plain
//    <a href="/play/online/new?action=createLiveChallenge&rated=rated&
//    base=60&timeIncrement=0&..."> link — base (seconds) is right there in
//    the query string, no DOM lookup needed.
// 3. On a finished game's page (/game/live/<id>), three more:
//    - the "New Game" tab: same dropdown + <button>Start Game</button> as #1.
//    - aria-label="New <N> min" (e.g. "New 1 min") — minutes in the label.
//    - aria-label="Rematch" — no time control in the click target itself,
//      but confirmed live 2026-10-01: it's always rendered as a sibling of
//      a "New <N> min" button in the same button group (both the
//      analysis-tab bar and the game-over modal's secondary actions row put
//      them side by side), so we read the time control off that neighbor.
//
// There are likely more entry points we haven't found yet (accept an
// incoming challenge, puzzle-rush-adjacent promos, ...). This is
// intentionally not exhaustive — utils/game-urls.ts's /game/<id> URL match
// in background.ts is the backstop for anything that slips past this list.
const NEW_GAME_SAME_CONTROL_LABEL = /^new\s+(\d+)\s*min/i;

export interface ChesscomGameStartMatch {
  timeClass: TimeClass | 'unknown';
}

function parseTimeClassFromDropdownLabel(label: string): TimeClass | 'unknown' {
  const category = /\((bullet|blitz|rapid)\)/i.exec(label)?.[1];
  if (category) return category.toLowerCase() as TimeClass;

  const minutes = /^(\d+)/.exec(label.trim())?.[1];
  if (minutes) return classifyByBaseSeconds(Number(minutes) * 60);

  return 'unknown';
}

// The Start Game button itself carries no time-control info — it's a
// sibling dropdown that does. Not scoped to a specific wrapper class since
// /play/online and the "New Game" tab don't share one; only one such
// dropdown should ever be visible at a time.
function currentlySelectedTimeClass(): TimeClass | 'unknown' {
  const label = document.querySelector('.cc-dropdown-button-label')?.textContent;
  return label ? parseTimeClassFromDropdownLabel(label) : 'unknown';
}

// Rematch has no time control of its own — it implicitly reuses the current
// game's, which happens to already be spelled out on its sibling "New <N>
// min" button in the same button group.
function siblingNewGameTimeClass(rematchButton: Element): TimeClass | 'unknown' {
  const container = rematchButton.parentElement;
  if (!container) return 'unknown';

  for (const sibling of container.querySelectorAll('button')) {
    if (sibling === rematchButton) continue;
    const label = (sibling.getAttribute('aria-label') ?? sibling.textContent ?? '').trim();
    const minutes = NEW_GAME_SAME_CONTROL_LABEL.exec(label)?.[1];
    if (minutes) return classifyByBaseSeconds(Number(minutes) * 60);
  }

  return 'unknown';
}

export function matchChesscomGameStartClick(target: HTMLElement | null): ChesscomGameStartMatch | null {
  if (!target) return null;

  const link = target.closest('a[href*="/play/online/new"]');
  if (link) {
    const href = link.getAttribute('href');
    if (href) {
      const url = new URL(href, location.origin);
      const action = url.searchParams.get('action') ?? '';
      if (/live/i.test(action)) {
        const base = url.searchParams.get('base');
        const timeClass = base ? classifyByBaseSeconds(Number(base)) : 'unknown';
        return { timeClass };
      }
    }
  }

  const button = target.closest('button');
  if (button) {
    const label = (button.getAttribute('aria-label') ?? button.textContent ?? '').trim();
    const normalized = label.toLowerCase();

    if (normalized === 'start game') {
      return { timeClass: currentlySelectedTimeClass() };
    }

    if (normalized === 'rematch') {
      return { timeClass: siblingNewGameTimeClass(button) };
    }

    const newGameMatch = NEW_GAME_SAME_CONTROL_LABEL.exec(label);
    if (newGameMatch) {
      return { timeClass: classifyByBaseSeconds(Number(newGameMatch[1]) * 60) };
    }
  }

  return null;
}
