import { chromium } from '@playwright/test';

const targetUrl = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const executablePath =
  process.env.BROWSER_PATH ||
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const browser = await chromium.launch({
  executablePath,
  headless: true
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleMessages.push({
        type: message.type(),
        text: message.text()
      });
    }
  });
  page.on('pageerror', error => pageErrors.push(error.stack || error.message));
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText || 'unknown'
    });
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      badResponses.push({
        url: response.url(),
        status: response.status()
      });
    }
  });

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const state = await page.evaluate(() => ({
    documentReadyState: document.readyState,
    migrationState: document.documentElement.dataset.reactMigrationReady || null,
    rootChildren: document.getElementById('root')?.children.length || 0,
    appContainerPresent: Boolean(document.querySelector('.app-container')),
    builderCanvasPresent: Boolean(document.getElementById('builder-canvas')),
    appInstancePresent: Boolean(window.appInstance),
    projectManagerPresent: Boolean(window.appInstance?.projectManager),
    runtimeBridge: window.OsoosReactMigration
      ? {
          mode: window.OsoosReactMigration.mode,
          ready: window.OsoosReactMigration.ready
        }
      : null,
    globals: {
      elements: typeof HTML_ELEMENTS_DB !== 'undefined',
      visualLogic: Boolean(window.VisualLogicCore),
      hubCore: Boolean(window.OsoosInteractionHubCore),
      hub: Boolean(window.OsoosInteractionHub)
    },
    legacyScripts: [...document.querySelectorAll('script[data-osoos-legacy-script]')].map(
      script => ({
        name: script.dataset.osoosLegacyScript,
        loaded: script.dataset.loaded || null,
        src: script.src
      })
    )
  }));

  console.log(
    JSON.stringify(
      {
        targetUrl,
        state,
        consoleMessages,
        pageErrors,
        failedRequests,
        badResponses
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
