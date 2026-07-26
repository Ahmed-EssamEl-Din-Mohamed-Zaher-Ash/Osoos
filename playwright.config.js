import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'msedge',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  },
  projects: [
    {
      name: 'desktop',
      testMatch: '**/*.spec.js',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } }
    },
    {
      name: 'tablet',
      testMatch: '**/app.spec.js',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } }
    },
    {
      name: 'mobile',
      testMatch: '**/app.spec.js',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } }
    }
  ]
});
