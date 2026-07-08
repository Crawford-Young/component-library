import { defineConfig, devices } from '@playwright/test'

// Override with SB_PORT when a parallel worktree session already owns :6006 —
// reuseExistingServer would otherwise silently test that session's stories.
const STORYBOOK_PORT = Number(process.env['SB_PORT'] ?? 6006)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${STORYBOOK_PORT}`,
    trace: 'on-first-retry',
    // Settle motion-safe transitions instantly so axe never samples a mid-fade blended color.
    contextOptions: { reducedMotion: 'reduce' },
    // Pinned so TZ-sensitive stories (e.g. calendar day-membership around midnight) render
    // deterministically in CI (ubuntu-latest defaults to UTC) and locally regardless of host
    // TZ — never rely on the host/CI machine's timezone for a story's rendered output.
    timezoneId: 'America/New_York',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm storybook dev -p ${STORYBOOK_PORT} --no-open`,
    url: `http://localhost:${STORYBOOK_PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
})
