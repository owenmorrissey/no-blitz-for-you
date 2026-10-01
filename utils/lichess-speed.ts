// lichess's own speed classification, copied directly from
// lichess-org/lila ui/lib/src/game/index.ts's clockToSpeed (confirmed
// against lila's master branch 2026-10-01) — not a guess, their actual
// formula: total = initial seconds + increment seconds * 40.
export type LichessSpeed = 'ultraBullet' | 'bullet' | 'blitz' | 'rapid' | 'classical';

export function classifySpeed(initialSeconds: number, incrementSeconds: number): LichessSpeed {
  const total = initialSeconds + incrementSeconds * 40;
  if (total < 30) return 'ultraBullet';
  if (total < 180) return 'bullet';
  if (total < 480) return 'blitz';
  if (total < 1500) return 'rapid';
  return 'classical';
}
