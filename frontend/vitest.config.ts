import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'firefox' }],
      screenshotFailures: false,
      viewport: {
        width: 1920,
        height: 1080,
      },
    },
    mockReset: true,
    setupFiles: 'src/test/setup.ts',
    exclude: ['src/test/e2e/*.ts'],
  },
  optimizeDeps: {
    exclude: ['chromium-bidi'],
  },
});
