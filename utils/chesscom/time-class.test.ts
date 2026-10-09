import { describe, expect, it } from 'vitest';
import { classifyByBaseParam, classifyByBaseSeconds, classifyByDurationLabel } from './time-class';

describe('classifyByBaseSeconds', () => {
  it.each([
    [30, 'bullet'],
    [179, 'bullet'],
    [180, 'blitz'],
    [599, 'blitz'],
    [600, 'rapid'],
    [1800, 'rapid'],
  ])('%s s -> %s', (s, cls) => expect(classifyByBaseSeconds(s)).toBe(cls));

  it.each([NaN, Infinity, -60, 0])('%s -> unknown', (s) =>
    expect(classifyByBaseSeconds(s)).toBe('unknown'),
  );
});

describe('classifyByDurationLabel', () => {
  it.each([
    ['30 sec', 'bullet'],
    ['1 min', 'bullet'],
    ['3 min', 'blitz'],
    ['10 min', 'rapid'],
    ['10 mins', 'rapid'],
    ['3 days', 'daily'],
    ['3days', 'daily'],
    ['1 day', 'daily'],
  ])('%j -> %s', (label, cls) => expect(classifyByDurationLabel(label)).toBe(cls));

  it.each(['', '10', 'abc', 'min', '10 hours', '1.5 min', '-1 min', '0 min'])(
    '%j -> unknown',
    (label) => expect(classifyByDurationLabel(label)).toBe('unknown'),
  );
});

describe('classifyByBaseParam', () => {
  it('parses whole seconds', () => expect(classifyByBaseParam('60')).toBe('bullet'));
  it.each([null, '', ' ', 'abc', '1e3', '-60', '6.5'])('%j -> unknown', (v) =>
    expect(classifyByBaseParam(v)).toBe('unknown'),
  );
});
