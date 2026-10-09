import { describe, expect, it } from 'vitest';
import { classifySpeed } from './speed';

describe('classifySpeed', () => {
  it.each([
    [15, 0, 'ultraBullet'],
    [60, 0, 'bullet'],
    [120, 1, 'bullet'], // 160
    [180, 0, 'blitz'],
    [300, 3, 'blitz'], // 420
    [600, 0, 'rapid'],
    [900, 10, 'rapid'], // 1300
    [1800, 0, 'classical'],
  ])('%s+%s -> %s', (i, inc, cls) => expect(classifySpeed(i, inc)).toBe(cls));

  it.each([
    [NaN, 0],
    [60, NaN],
    [Infinity, 0],
    [-1, 0],
    [60, -1],
  ])('%s+%s -> unknown', (i, inc) => expect(classifySpeed(i, inc)).toBe('unknown'));
});
