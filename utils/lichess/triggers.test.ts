// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { matchLichessGameStartClick } from './triggers';

const pool = (id: string) => {
  document.body.innerHTML = `<div class="lpool" data-id="${id}"><div id="in">x</div></div>`;
  return matchLichessGameStartClick(document.querySelector<HTMLElement>('#in'));
};

describe('lichess pool click', () => {
  it.each([
    ['1+0', 'bullet'],
    ['3+2', 'blitz'],
    ['10+0', 'rapid'],
    ['30+0', 'classical'],
  ])('%s -> %s', (id, speed) => expect(pool(id)).toBe(speed));

  it.each(['', 'abc', '1+', '+0', '1.5+0'])('malformed %j -> unknown', (id) =>
    expect(pool(id)).toBe(id === '' ? null : 'unknown'),
  );
  it('custom opens a modal -> null', () => expect(pool('custom')).toBeNull());
  it('non-pool click -> null', () => {
    document.body.innerHTML = '<div id="x">x</div>';
    expect(matchLichessGameStartClick(document.querySelector<HTMLElement>('#x'))).toBeNull();
  });
});
