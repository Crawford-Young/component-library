import { defineConfig, devices } from '@playwright/test'

const isStaticCI = !!process.env['STORYBOOK_STATIC']

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // On CI: serve the pre-built static output. Locally: spin up the dev server.
    command: isStaticCI ? 'npx serve storybook-static -p 6006 --no-clipboard' : 'pnpm storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
})
