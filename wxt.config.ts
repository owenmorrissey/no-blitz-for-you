import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Blockchess',
    description:
      'Stops you from impulsively starting a live chess game — redirects to puzzles instead.',
    permissions: ['storage', 'webNavigation', 'tabs'],
    host_permissions: ['*://*.chess.com/*', '*://*.lichess.org/*'],
    browser_specific_settings: {
      gecko: {
        // Required by Firefox before publishing to AMO. Replace with a real
        // id (any unique string, conventionally an email-shaped one) when
        // you're ready to submit — not needed for local testing.
        id: 'blockchess@example.com',
      },
    },
  },
});
