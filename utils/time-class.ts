// chess.com's own classification (confirmed via their help docs): bullet is
// under 3 minutes base time, blitz is 3 to under 10, rapid is 10+.
// Correspondence/daily games aren't "minutes" at all and aren't handled by
// any of our triggers, so there's no 'daily' case here.
export type TimeClass = 'bullet' | 'blitz' | 'rapid';

export function classifyByBaseSeconds(baseSeconds: number): TimeClass | 'unknown' {
  // Guards against NaN (e.g. an unparseable query param) silently falling
  // through every `< n` check to the final 'rapid' bucket — fail closed,
  // not open, since 'rapid' is allowed by default.
  if (!Number.isFinite(baseSeconds)) return 'unknown';
  const baseMinutes = baseSeconds / 60;
  if (baseMinutes < 3) return 'bullet';
  if (baseMinutes < 10) return 'blitz';
  return 'rapid';
}
