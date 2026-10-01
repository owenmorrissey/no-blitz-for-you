import { DEFAULT_CONFIG, REDIRECT_URLS, getConfig, setConfig } from '@/utils/config';
import { isLiveGameUrl } from '@/utils/game-urls';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
      await setConfig(DEFAULT_CONFIG);
    }
  });

  async function handleNavigation(details: { tabId: number; url: string; frameId: number }) {
    if (details.frameId !== 0) return; // only the top-level frame, not iframes/ads
    if (!isLiveGameUrl(details.url)) return;

    const config = await getConfig();
    if (!config.enabled) return;

    await browser.tabs.update(details.tabId, { url: REDIRECT_URLS[config.redirectTarget] });
  }

  // onCommitted catches normal page loads; onHistoryStateUpdated catches
  // SPA (pushState) navigations, which is how both sites actually start games.
  browser.webNavigation.onCommitted.addListener(handleNavigation);
  browser.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);
});
