// chess.com's own classification (confirmed via their help docs): bullet is
// under 3 minutes base time, blitz is 3 to under 10, rapid is 10+.
// Daily (correspondence) games are measured in days, not a live clock, and
// are never blocked.
export const CHESSCOM_TIME_CLASSES = [
  { value: 'bullet', label: 'Bullet' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'rapid', label: 'Rapid' },
] as const;

export type TimeClass = (typeof CHESSCOM_TIME_CLASSES)[number]['value'];
export type ChesscomClass = TimeClass | 'daily' | 'unknown';

// Anything not a finite, positive number fails closed — 'rapid' is allowed
// by default, so NaN must not fall through every `< n` check into it.
export function classifyByBaseSeconds(baseSeconds: number): TimeClass | 'unknown' {
  if (!Number.isFinite(baseSeconds) || baseSeconds <= 0) return 'unknown';
  const baseMinutes = baseSeconds / 60;
  if (baseMinutes < 3) return 'bullet';
  if (baseMinutes < 10) return 'blitz';
  return 'rapid';
}

const SECONDS_PER_UNIT = { sec: 1, min: 60 } as const;

// "30 sec", "1 min", "3 days" (also "3days", "10 mins"). Units are explicit:
// a bare number, or an unrecognized unit, is 'unknown' rather than a guess.
export function classifyByDurationLabel(label: string): ChesscomClass {
  const match = /^(\d+)\s*(sec|min|day)s?\b/i.exec(label.trim());
  if (!match) return 'unknown';
  const unit = match[2]!.toLowerCase();
  if (unit === 'day') return 'daily';
  return classifyByBaseSeconds(Number(match[1]) * SECONDS_PER_UNIT[unit as 'sec' | 'min']);
}

// chess.com's `base=` query param: whole seconds, digits only. Number('')
// and Number(' ') are 0 and Number('1e2') is 100, so validate the string.
export function classifyByBaseParam(base: string | null): ChesscomClass {
  if (base === null || !/^\d+$/.test(base)) return 'unknown';
  return classifyByBaseSeconds(Number(base));
}
