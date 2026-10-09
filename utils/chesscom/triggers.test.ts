// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { matchChesscomGameStartClick } from './triggers';

function click(selector: string) {
  return matchChesscomGameStartClick(document.querySelector<HTMLElement>(selector));
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Start Game + dropdown', () => {
  const page = (label: string | null) => {
    document.body.innerHTML =
      (label === null ? '' : `<span class="cc-dropdown-button-label">${label}</span>`) +
      '<button id="go">Start Game</button>';
  };
  it.each([
    ['1 min (Bullet)', 'bullet'],
    ['10 min (Rapid)', 'rapid'],
    ['30 sec', 'bullet'],
    ['3 min', 'blitz'],
    ['3 days', 'daily'],
    ['3days', 'daily'],
    ['garbage', 'unknown'],
  ])('%j -> %s', (label, cls) => {
    page(label);
    expect(click('#go')).toBe(cls);
  });
  it('missing dropdown -> unknown', () => {
    page(null);
    expect(click('#go')).toBe('unknown');
  });
});

describe('quick-start link', () => {
  const link = (qs: string) => {
    document.body.innerHTML = `<a id="l" href="/play/online/new?action=createLiveChallenge${qs}"><span id="in">x</span></a>`;
  };
  it('reads base=', () => {
    link('&base=60');
    expect(click('#in')).toBe('bullet');
    link('&base=900');
    expect(click('#in')).toBe('rapid');
  });
  it.each(['', '&base=', '&base=abc'])('malformed %j -> unknown', (qs) => {
    link(qs);
    expect(click('#in')).toBe('unknown');
  });
  it('ignores non-live actions', () => {
    document.body.innerHTML = '<a id="l" href="/play/online/new?action=other&base=60">x</a>';
    expect(click('#l')).toBeNull();
  });
});

describe('New N min / Rematch', () => {
  it('parses the label', () => {
    document.body.innerHTML = '<button id="b" aria-label="New 10 min">x</button>';
    expect(click('#b')).toBe('rapid');
  });
  it('does not match unrelated "New ..." buttons', () => {
    document.body.innerHTML = '<button id="b">New Game</button>';
    expect(click('#b')).toBeNull();
  });
  it('Rematch reads the sibling', () => {
    document.body.innerHTML =
      '<div><button aria-label="New 3 min">a</button><button id="r" aria-label="Rematch">b</button></div>';
    expect(click('#r')).toBe('blitz');
  });
  it('Rematch with no sibling -> unknown', () => {
    document.body.innerHTML = '<div><button id="r" aria-label="Rematch">b</button></div>';
    expect(click('#r')).toBe('unknown');
  });
});

it('unrelated clicks -> null', () => {
  document.body.innerHTML = '<button id="b">Settings</button>';
  expect(click('#b')).toBeNull();
  expect(matchChesscomGameStartClick(null)).toBeNull();
});
