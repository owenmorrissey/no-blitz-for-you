import './style.css';
import { getConfig, setConfig, type RedirectTarget } from '@/utils/config';

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
  </div>
`;

const enabledInput = document.querySelector<HTMLInputElement>('#enabled')!;
const redirectTargetSelect = document.querySelector<HTMLSelectElement>('#redirectTarget')!;

const config = await getConfig();
enabledInput.checked = config.enabled;
redirectTargetSelect.value = config.redirectTarget;

async function persist() {
  await setConfig({
    enabled: enabledInput.checked,
    redirectTarget: redirectTargetSelect.value as RedirectTarget,
  });
}

enabledInput.addEventListener('change', persist);
redirectTargetSelect.addEventListener('change', persist);
