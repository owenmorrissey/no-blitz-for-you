import './style.css';
import { getConfig, setConfig, type RedirectTarget } from '@/utils/config';
import type { TimeClass } from '@/utils/time-class';
import type { LichessSpeed } from '@/utils/lichess-speed';

const CHESSCOM_TIME_CLASSES: { value: TimeClass; label: string }[] = [
  { value: 'bullet', label: 'Bullet' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'rapid', label: 'Rapid' },
];

const LICHESS_SPEEDS: { value: LichessSpeed; label: string }[] = [
  { value: 'ultraBullet', label: 'UltraBullet' },
  { value: 'bullet', label: 'Bullet' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'rapid', label: 'Rapid' },
  { value: 'classical', label: 'Classical' },
];

const REDIRECT_TARGETS: { value: RedirectTarget; label: string }[] = [
  { value: 'lichess-puzzles', label: 'Lichess puzzles' },
  { value: 'lichess-practice', label: 'Lichess practice' },
  { value: 'chesscom-puzzles', label: 'Chess.com puzzles' },
  { value: 'chesscom-lessons', label: 'Chess.com lessons' },
  { value: 'block', label: 'Just block (blank page)' },
];

// Small DOM-builder helper so the popup never touches innerHTML — assigns
// properties (safe: .textContent, .value, .className, ...) and appends
// children via Element.append(), which treats string args as text nodes,
// not markup.
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
}

function checkboxRow(className: string, value: string, label: string): HTMLLabelElement {
  const input = el('input', { type: 'checkbox', className, value });
  return el('label', { className: 'row' }, [input, ` ${label}`]);
}

function redirectSelectRow(id: string): { row: HTMLLabelElement; select: HTMLSelectElement } {
  const select = el(
    'select',
    { id },
    REDIRECT_TARGETS.map(({ value, label }) => el('option', { value, textContent: label })),
  );
  const row = el('label', { className: 'row' }, [el('span', {}, ['Redirect to']), select]);
  return { row, select };
}

const chesscomCheckboxRows = CHESSCOM_TIME_CLASSES.map(({ value, label }) =>
  checkboxRow('chesscom-checkbox', value, label),
);
const lichessCheckboxRows = LICHESS_SPEEDS.map(({ value, label }) =>
  checkboxRow('lichess-checkbox', value, label),
);
const { row: chesscomRedirectRow, select: chesscomRedirectSelect } =
  redirectSelectRow('chesscomRedirectTarget');
const { row: lichessRedirectRow, select: lichessRedirectSelect } =
  redirectSelectRow('lichessRedirectTarget');

const enabledInput = el('input', { type: 'checkbox', id: 'enabled' });

const app = document.querySelector<HTMLDivElement>('#app')!;
app.append(
  el('div', { className: 'card' }, [
    el('h1', {}, ['No blitz for you!']),
    el('label', { className: 'row' }, [enabledInput, ' Activate extension']),
    el('fieldset', { className: 'time-classes' }, [
      el('legend', {}, ['Block on chess.com']),
      ...chesscomCheckboxRows,
      el('p', { className: 'hint' }, ['Daily/correspondence games are never blocked.']),
      chesscomRedirectRow,
    ]),
    el('fieldset', { className: 'time-classes' }, [
      el('legend', {}, ['Block on lichess']),
      ...lichessCheckboxRows,
      el('p', { className: 'hint' }, ['Correspondence games are never blocked.']),
      lichessRedirectRow,
    ]),
  ]),
);

const chesscomCheckboxInputs = chesscomCheckboxRows.map((row) => row.querySelector('input')!);
const lichessCheckboxInputs = lichessCheckboxRows.map((row) => row.querySelector('input')!);

function checkedValues<T extends string>(inputs: HTMLInputElement[]): T[] {
  return inputs.filter((input) => input.checked).map((input) => input.value as T);
}

const config = await getConfig();
enabledInput.checked = config.enabled;
chesscomRedirectSelect.value = config.chesscomRedirectTarget;
lichessRedirectSelect.value = config.lichessRedirectTarget;
chesscomCheckboxInputs.forEach((input) => {
  input.checked = config.blockedChesscomTimeClasses.includes(input.value as TimeClass);
});
lichessCheckboxInputs.forEach((input) => {
  input.checked = config.blockedLichessSpeeds.includes(input.value as LichessSpeed);
});

async function persist() {
  await setConfig({
    enabled: enabledInput.checked,
    chesscomRedirectTarget: chesscomRedirectSelect.value as RedirectTarget,
    lichessRedirectTarget: lichessRedirectSelect.value as RedirectTarget,
    blockedChesscomTimeClasses: checkedValues<TimeClass>(chesscomCheckboxInputs),
    blockedLichessSpeeds: checkedValues<LichessSpeed>(lichessCheckboxInputs),
  });
}

enabledInput.addEventListener('change', persist);
chesscomRedirectSelect.addEventListener('change', persist);
lichessRedirectSelect.addEventListener('change', persist);
chesscomCheckboxInputs.forEach((input) => input.addEventListener('change', persist));
lichessCheckboxInputs.forEach((input) => input.addEventListener('change', persist));
