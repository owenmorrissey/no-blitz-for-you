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

function redirectSelect(id: string): string {
  const options = REDIRECT_TARGETS.map(
    ({ value, label }) => `<option value="${value}">${label}</option>`,
  ).join('');
  return `
    <label class="row">
      <span>Redirect to</span>
      <select id="${id}">${options}</select>
    </label>`;
}

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="card">
    <h1>No blitz for you!</h1>
    <label class="row">
      <input type="checkbox" id="enabled" />
      Activate extension
    </label>
    <fieldset class="time-classes">
      <legend>Block on chess.com</legend>
      ${checkboxGroup('chesscom-checkbox', CHESSCOM_TIME_CLASSES)}
      <p class="hint">Daily/correspondence games are never blocked.</p>
      ${redirectSelect('chesscomRedirectTarget')}
    </fieldset>
    <fieldset class="time-classes">
      <legend>Block on lichess</legend>
      ${checkboxGroup('lichess-checkbox', LICHESS_SPEEDS)}
      <p class="hint">Correspondence games are never blocked.</p>
      ${redirectSelect('lichessRedirectTarget')}
    </fieldset>
  </div>
`;

const enabledInput = document.querySelector<HTMLInputElement>('#enabled')!;
const chesscomRedirectSelect =
  document.querySelector<HTMLSelectElement>('#chesscomRedirectTarget')!;
const lichessRedirectSelect =
  document.querySelector<HTMLSelectElement>('#lichessRedirectTarget')!;
const chesscomCheckboxes = document.querySelectorAll<HTMLInputElement>('.chesscom-checkbox');
const lichessCheckboxes = document.querySelectorAll<HTMLInputElement>('.lichess-checkbox');

function checkedValues<T extends string>(checkboxes: NodeListOf<HTMLInputElement>): T[] {
  return Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value as T);
}

const config = await getConfig();
enabledInput.checked = config.enabled;
chesscomRedirectSelect.value = config.chesscomRedirectTarget;
lichessRedirectSelect.value = config.lichessRedirectTarget;
chesscomCheckboxes.forEach((checkbox) => {
  checkbox.checked = config.blockedChesscomTimeClasses.includes(checkbox.value as TimeClass);
});
lichessCheckboxes.forEach((checkbox) => {
  checkbox.checked = config.blockedLichessSpeeds.includes(checkbox.value as LichessSpeed);
});

async function persist() {
  await setConfig({
    enabled: enabledInput.checked,
    chesscomRedirectTarget: chesscomRedirectSelect.value as RedirectTarget,
    lichessRedirectTarget: lichessRedirectSelect.value as RedirectTarget,
    blockedChesscomTimeClasses: checkedValues<TimeClass>(chesscomCheckboxes),
    blockedLichessSpeeds: checkedValues<LichessSpeed>(lichessCheckboxes),
  });
}

enabledInput.addEventListener('change', persist);
chesscomRedirectSelect.addEventListener('change', persist);
lichessRedirectSelect.addEventListener('change', persist);
chesscomCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', persist));
lichessCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', persist));
