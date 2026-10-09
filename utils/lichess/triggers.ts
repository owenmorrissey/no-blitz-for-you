import { classifySpeed, type LichessSpeed } from './speed';

// lichess's homepage "quick pairing" pool, sourced from lila's own code
// (ui/lobby/src/view/pools.ts, confirmed against master 2026-10-01):
//
//   <div class="lpool" data-id="1+0">...</div>
//   <div class="lpool" data-id="custom">...</div>
//
// Clicking a pool div calls ctrl.clickPool(id), which immediately joins
// matchmaking for that pool — no separate "Start" confirmation, same
// instant-start pattern as chess.com's Rematch/"New N min" buttons. The
// data-id is literally "<limitMinutes>+<incrementSeconds>" (verified against
// modules/pool/src/main/PoolList.scala's default pool list), so the time
// control is right there, no page-state digging needed.
//
// "custom" opens a modal to configure a one-off game/seek instead of
// pairing immediately — not handled yet (see README TODO). Likewise not yet
// handled: challenging a friend, accepting an incoming challenge, and the
// "#pool/<id>" URL-hash auto-join (joinPoolFromLocationHash in lila's
// ctrl.ts) used by shared pool links, none of which are a click on a
// ".lpool" element.
const POOL_ID_PATTERN = /^(\d+)\+(\d+)$/;

export function matchLichessGameStartClick(target: HTMLElement | null): LichessSpeed | 'unknown' | null {
  if (!target) return null;

  const pool = target.closest<HTMLElement>('.lpool[data-id]');
  if (!pool) return null;

  const id = pool.dataset['id'];
  if (!id || id === 'custom') return null; // opens a modal, doesn't start a game itself

  const match = POOL_ID_PATTERN.exec(id);
  if (!match) return 'unknown';

  const [, limitMinutes, incrementSeconds] = match;
  return classifySpeed(Number(limitMinutes) * 60, Number(incrementSeconds));
}
