import { describe, expect, it } from 'vitest';
import { shouldBlock } from './game-start-guard';
import { DEFAULT_CONFIG, withDefaults } from './config';

describe('shouldBlock', () => {
  it('blocks listed classes only', () => {
    expect(shouldBlock(['bullet', 'blitz'], 'blitz')).toBe(true);
    expect(shouldBlock(['bullet', 'blitz'], 'rapid')).toBe(false);
    expect(shouldBlock(['bullet'], 'daily')).toBe(false);
  });
  it('fails closed on unknown, even with an empty list', () => {
    expect(shouldBlock([], 'unknown')).toBe(true);
  });
});

describe('withDefaults', () => {
  it('fills missing keys and keeps stored ones', () => {
    expect(withDefaults(undefined)).toEqual(DEFAULT_CONFIG);
    const c = withDefaults({ enabled: false, blockedLichessSpeeds: [] });
    expect(c.enabled).toBe(false);
    expect(c.blockedLichessSpeeds).toEqual([]);
    expect(c.chesscomRedirectTarget).toBe(DEFAULT_CONFIG.chesscomRedirectTarget);
  });
});
