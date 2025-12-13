/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 30 * 1000,
  testDir: 'tests/playwright',
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000'
  },
  webServer: {
    command: 'npm start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: false
  }
};

module.exports = config;
