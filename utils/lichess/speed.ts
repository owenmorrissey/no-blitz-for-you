// lichess's own speed classification, copied directly from
// lichess-org/lila ui/lib/src/game/index.ts's clockToSpeed (confirmed
// against lila's master branch 2026-10-01) — not a guess, their actual
// formula: total = initial seconds + increment seconds * 40.
export const LICHESS_SPEEDS = [
  { value: 'ultraBullet', label: 'UltraBullet' },
  { value: 'bullet', label: 'Bullet' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'rapid', label: 'Rapid' },
  { value: 'classical', label: 'Classical' },
] as const;

export type LichessSpeed = (typeof LICHESS_SPEEDS)[number]['value'];

// Non-finite or negative input fails closed ('unknown') instead of falling
// through every `< n` check to 'classical' (allowed by default).
export function classifySpeed(
  initialSeconds: number,
  incrementSeconds: number,
): LichessSpeed | 'unknown' {
  const valid = (n: number) => Number.isFinite(n) && n >= 0;
  if (!valid(initialSeconds) || !valid(incrementSeconds)) return 'unknown';
  const total = initialSeconds + incrementSeconds * 40;
  if (total < 30) return 'ultraBullet';
  if (total < 180) return 'bullet';
  if (total < 480) return 'blitz';
  if (total < 1500) return 'rapid';
  return 'classical';
}
