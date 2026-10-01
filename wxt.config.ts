import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Blockchess',
    description:
      'Stops you from impulsively starting a live chess game — redirects to puzzles instead.',
    // No host_permissions needed: content scripts run per their own
    // `matches` field, and they navigate via `window.location`, not the
    // tabs API — no background script, no cross-origin requests.
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        // Required by Firefox for publishing to AMO. UUID format (Mozilla's
        // current recommendation over email-style ids, since it can't
        // collide with anyone else's). Generated once with `uuidgen` —
        // don't regenerate this, it's this extension's permanent identity
        // on AMO once submitted.
        id: '{2cad3a61-5ce2-4cb8-a105-04ab300d686b}',
      },
    },
  },
});
