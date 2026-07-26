import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

const systemFontPath = [
  'C:\\Windows\\Fonts\\arial.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'
].find(existsSync);

async function waitForRuntime(page) {
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.reactMigrationReady === 'true' &&
      window.appInstance?.projectManager?.ready === true,
    null,
    { timeout: 20000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('osoos:onboarding-tour-completed:v1', 'completed');
  });
  await page.goto('/index.html');
  await waitForRuntime(page);
});

test('persists embedded project assets in IndexedDB and restores them', async ({
  page
}) => {
  const marker = 'OSOOS-LARGE-FONT-PERSISTENCE';
  const saved = await page.evaluate(async markerValue => {
    const app = window.appInstance;
    const payload = 'A'.repeat(200_000);
    app.editor.customCSS =
      `/* ${markerValue} */\n` +
      `@font-face { font-family: 'SavedFont'; src: url('data:font/woff2;base64,${payload}'); }`;
    app.saveProgress(false);
    const result = await app.projectManager._persistQueue;
    return {
      result,
      backend: app.projectManager.storageBackend,
      localWorkspace: localStorage.getItem(app.projectManager.storageKey),
      localCss: localStorage.getItem('builder-css')
    };
  }, marker);

  expect(saved.result.saved).toBe(true);
  expect(saved.backend).toBe('indexeddb');
  expect(saved.localWorkspace).toBeNull();
  expect(saved.localCss).toBeNull();

  await page.reload();
  await waitForRuntime(page);

  const restored = await page.evaluate(markerValue => ({
    backend: window.appInstance.projectManager.storageBackend,
    hasMarker: window.appInstance.editor.customCSS.includes(markerValue),
    cssLength: window.appInstance.editor.customCSS.length
  }), marker);

  expect(restored.backend).toBe('indexeddb');
  expect(restored.hasMarker).toBe(true);
  expect(restored.cssLength).toBeGreaterThan(200_000);
});

test('accepts a local font file with an arbitrary extension and embeds it', async ({
  page
}) => {
  await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML = '<p id="local-font-target">اختبار الخط</p>';
    app.selectElement(app.canvas.querySelector('#local-font-target'));
    document.getElementById('custom-font-family').value = 'Device Font';
  });

  if (!systemFontPath) {
    await page.evaluate(() => {
      window.appInstance.properties.validateLocalFont = async () => true;
    });
  }
  const fontBytes = systemFontPath
    ? readFileSync(systemFontPath)
    : Buffer.from('font-bytes-for-browser-validation');
  const mimeType = systemFontPath ? 'font/ttf' : 'application/octet-stream';
  await page.locator('#custom-font-file').setInputFiles({
    name: 'device-font.customfont',
    mimeType,
    buffer: fontBytes
  });

  await expect.poll(() => page.evaluate(() =>
    window.appInstance.editor.customCSS.includes('OSOOS_LOCAL_FONT:')
  )).toBe(true);

  const state = await page.evaluate(() => {
    const app = window.appInstance;
    const target = app.canvas.querySelector('#local-font-target');
    return {
      accept: document.getElementById('custom-font-file').getAttribute('accept'),
      hasEmbeddedData: /data:(?:font\/ttf|application\/octet-stream);base64,/.test(
        app.editor.customCSS
      ),
      appliedFamily: app.styleEngine.getStyleValue(target, 'font-family', {
        breakpoint: app.properties.activeBreakpoint,
        pseudo: 'normal'
      }),
      listed: app.properties.customFonts.some(
        font => font.family === 'Device Font' && font.local
      )
    };
  });

  expect(state).toEqual({
    accept: '*/*',
    hasEmbeddedData: true,
    appliedFamily: "'Device Font'",
    listed: true
  });
});

test('keeps flex shorthand and grow shrink basis controls synchronized', async ({
  page
}) => {
  await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML =
      '<div id="flex-parent"><div id="flex-child">عنصر</div></div>';
    const parent = app.canvas.querySelector('#flex-parent');
    const child = app.canvas.querySelector('#flex-child');
    app.styleEngine.setStyle(parent, 'display', 'flex');
    app.selectElement(child);
    document.getElementById('accordion-flex-layout').classList.add('open');
  });

  await page.locator('#prop-flex-grow').fill('2');
  await expect(page.locator('#prop-flex-value')).toHaveValue('2 1 auto');

  await page.locator('#prop-flex-value').fill('0 0 12px');
  await expect(page.locator('#prop-flex-grow')).toHaveValue('0');
  await expect(page.locator('#prop-flex-shrink')).toHaveValue('0');
  await expect(page.locator('#prop-flex-basis')).toHaveValue('12px');

  const state = await page.evaluate(() => {
    const app = window.appInstance;
    const child = app.canvas.querySelector('#flex-child');
    const shorthandLabel = document.querySelector('.flex-shorthand-field');
    const labelRect = shorthandLabel.querySelector('span').getBoundingClientRect();
    const inputRect = shorthandLabel.querySelector('input').getBoundingClientRect();
    return {
      flex: app.styleEngine.getStyleValue(child, 'flex'),
      growRule: app.styleEngine.getStyleValue(child, 'flex-grow'),
      shrinkRule: app.styleEngine.getStyleValue(child, 'flex-shrink'),
      basisRule: app.styleEngine.getStyleValue(child, 'flex-basis'),
      fieldsDoNotOverlap: labelRect.bottom <= inputRect.top + 1
    };
  });

  expect(state).toEqual({
    flex: '0 0 12px',
    growRule: '',
    shrinkRule: '',
    basisRule: '',
    fieldsDoNotOverlap: true
  });
});
