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

function checkboxGroup(className: string, options: { value: string; label: string }[]): string {
  return options
    .map(
      ({ value, label }) => `
      <label class="row">
        <input type="checkbox" class="${className}" value="${value}" />
        ${label}
      </label>`,
    )
    .join('');
}

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="card">
    <h1>Blockchess</h1>
    <label class="row">
      <input type="checkbox" id="enabled" />
      Redirect live games to puzzles
    </label>
    <label class="row">
      <span>Redirect to</span>
      <select id="redirectTarget">
        <option value="lichess-puzzles">Lichess puzzles</option>
        <option value="chesscom-puzzles">Chess.com puzzles</option>
        <option value="chesscom-lessons">Chess.com lessons</option>
        <option value="block">Just block (blank page)</option>
      </select>
    </label>
    <fieldset class="time-classes">
      <legend>Block on chess.com</legend>
      ${checkboxGroup('chesscom-checkbox', CHESSCOM_TIME_CLASSES)}
      <p class="hint">Daily/correspondence games are never blocked.</p>
    </fieldset>
    <fieldset class="time-classes">
      <legend>Block on lichess</legend>
      ${checkboxGroup('lichess-checkbox', LICHESS_SPEEDS)}
      <p class="hint">Correspondence games are never blocked.</p>
    </fieldset>
  </div>
`;

const enabledInput = document.querySelector<HTMLInputElement>('#enabled')!;
const redirectTargetSelect = document.querySelector<HTMLSelectElement>('#redirectTarget')!;
const chesscomCheckboxes = document.querySelectorAll<HTMLInputElement>('.chesscom-checkbox');
const lichessCheckboxes = document.querySelectorAll<HTMLInputElement>('.lichess-checkbox');

function checkedValues<T extends string>(checkboxes: NodeListOf<HTMLInputElement>): T[] {
  return Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value as T);
}

const config = await getConfig();
enabledInput.checked = config.enabled;
redirectTargetSelect.value = config.redirectTarget;
chesscomCheckboxes.forEach((checkbox) => {
  checkbox.checked = config.blockedChesscomTimeClasses.includes(checkbox.value as TimeClass);
});
lichessCheckboxes.forEach((checkbox) => {
  checkbox.checked = config.blockedLichessSpeeds.includes(checkbox.value as LichessSpeed);
});

async function persist() {
  await setConfig({
    enabled: enabledInput.checked,
    redirectTarget: redirectTargetSelect.value as RedirectTarget,
    blockedChesscomTimeClasses: checkedValues<TimeClass>(chesscomCheckboxes),
    blockedLichessSpeeds: checkedValues<LichessSpeed>(lichessCheckboxes),
  });
}

enabledInput.addEventListener('change', persist);
redirectTargetSelect.addEventListener('change', persist);
chesscomCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', persist));
lichessCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', persist));
