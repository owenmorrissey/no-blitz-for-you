import './style.css';
import { getConfig, setConfig, REDIRECT_TARGETS, type Config } from '@/utils/config';
import { CHESSCOM_TIME_CLASSES } from '@/utils/chesscom/time-class';
import { LICHESS_SPEEDS } from '@/utils/lichess/speed';

interface Site {
  title: string;
  options: readonly { value: string; label: string }[];
  blockedKey: 'blockedChesscomTimeClasses' | 'blockedLichessSpeeds';
  redirectKey: 'chesscomRedirectTarget' | 'lichessRedirectTarget';
  hint: string;
}

const SITES: Site[] = [
  {
    title: 'Block on chess.com',
    options: CHESSCOM_TIME_CLASSES,
    blockedKey: 'blockedChesscomTimeClasses',
    redirectKey: 'chesscomRedirectTarget',
    hint: 'Daily/correspondence games are never blocked.',
  },
  {
    title: 'Block on lichess',
    options: LICHESS_SPEEDS,
    blockedKey: 'blockedLichessSpeeds',
    redirectKey: 'lichessRedirectTarget',
    hint: 'Correspondence games are never blocked.',
  },
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

const config = await getConfig();

const enabledInput = el('input', { type: 'checkbox', name: 'enabled', checked: config.enabled });

function siteFieldset(site: Site): HTMLFieldSetElement {
  const blocked: readonly string[] = config[site.blockedKey];
  const select = el(
    'select',
    { name: site.redirectKey },
    REDIRECT_TARGETS.map(({ value, label }) => el('option', { value, textContent: label })),
  );
  select.value = config[site.redirectKey];

  return el('fieldset', { className: 'time-classes' }, [
    el('legend', {}, [site.title]),
    ...site.options.map(({ value, label }) =>
      el('label', { className: 'row' }, [
        el('input', { type: 'checkbox', name: site.blockedKey, value, checked: blocked.includes(value) }),
        ` ${label}`,
      ]),
    ),
    el('p', { className: 'hint' }, [site.hint]),
    el('label', { className: 'row' }, [el('span', {}, ['Redirect to']), select]),
  ]);
}

const card = el('div', { className: 'card' }, [
  el('h1', {}, ['No blitz for you!']),
  el('label', { className: 'row' }, [enabledInput, ' Activate extension']),
  ...SITES.map(siteFieldset),
]);
document.querySelector<HTMLDivElement>('#app')!.append(card);

// Rebuild the whole config from the form on any change.
card.addEventListener('change', () => {
  const checked = (name: string) =>
    [...card.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)].map((i) => i.value);
  const selected = (name: string) => card.querySelector<HTMLSelectElement>(`select[name="${name}"]`)!.value;

  void setConfig({
    enabled: enabledInput.checked,
    chesscomRedirectTarget: selected('chesscomRedirectTarget') as Config['chesscomRedirectTarget'],
    lichessRedirectTarget: selected('lichessRedirectTarget') as Config['lichessRedirectTarget'],
    blockedChesscomTimeClasses: checked('blockedChesscomTimeClasses') as Config['blockedChesscomTimeClasses'],
    blockedLichessSpeeds: checked('blockedLichessSpeeds') as Config['blockedLichessSpeeds'],
  });
});
