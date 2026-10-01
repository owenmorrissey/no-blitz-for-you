import { DEFAULT_CONFIG, REDIRECT_URLS, getConfig, setConfig } from '@/utils/config';
import { isLiveGameUrl } from '@/utils/game-urls';

// How long a tab's "this game was already evaluated and allowed" status
// lasts. Needs to outlive matchmaking plus chess.com's own habit of
// redirecting you back into an active game — a few minutes, not seconds.
const ALLOW_WINDOW_MS = 5 * 60 * 1000;

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
      await setConfig(DEFAULT_CONFIG);
    }
  });

  // chesscom.content.ts and lichess.content.ts intercept clicks *before*
  // matchmaking, so they know the time class/speed and can decide to let a
  // game through (e.g. rapid, when only bullet/blitz are blocked). But once
  // that click is allowed, the resulting navigation still matches
  // isLiveGameUrl below — without this, the backstop would immediately
  // redirect away every game the content script just approved, since a URL
  // match alone carries no time-class info. So the content scripts message
  // us to suppress the backstop for this tab for a while.
  const ALLOWED_MESSAGE_TYPES = new Set(['chesscom-game-allowed', 'lichess-game-allowed']);
  const allowedTabs = new Map<number, number>(); // tabId -> allowed-until timestamp

  browser.runtime.onMessage.addListener((message, sender) => {
    if (ALLOWED_MESSAGE_TYPES.has(message?.type) && sender.tab?.id !== undefined) {
      allowedTabs.set(sender.tab.id, Date.now() + ALLOW_WINDOW_MS);
    }
  });

  async function handleNavigation(details: { tabId: number; url: string; frameId: number }) {
    if (details.frameId !== 0) return; // only the top-level frame, not iframes/ads
    if (!isLiveGameUrl(details.url)) return;

    const allowedUntil = allowedTabs.get(details.tabId);
    if (allowedUntil !== undefined) {
      if (Date.now() < allowedUntil) return;
      allowedTabs.delete(details.tabId);
    }

    const config = await getConfig();
    if (!config.enabled) return;

    await browser.tabs.update(details.tabId, { url: REDIRECT_URLS[config.redirectTarget] });
  }

  // onCommitted catches normal page loads; onHistoryStateUpdated catches
  // SPA (pushState) navigations, which is how both sites actually start games.
  browser.webNavigation.onCommitted.addListener(handleNavigation);
  browser.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);
});
