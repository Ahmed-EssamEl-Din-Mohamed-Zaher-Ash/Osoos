import { expect, test } from '@playwright/test';

async function waitForRuntime(page) {
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.reactMigrationReady === 'true' &&
      Boolean(window.appInstance?.projectManager),
    null,
    { timeout: 20000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('osoos:onboarding-tour-completed:v1', 'completed');
  });
});

test('opens the React shell and initializes the complete builder runtime', async ({
  page
}) => {
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));

  await page.goto('/index.html');
  await waitForRuntime(page);

  await expect(page.locator('.app-container')).toBeVisible();
  await expect(page.locator('#builder-canvas')).toBeVisible();
  await expect(page.locator('#code-textarea')).toBeAttached();
  await expect(page.locator('#project-manager-btn')).toBeVisible();

  const state = await page.evaluate(() => ({
    reactRoot: Boolean(document.getElementById('root')?._reactRootContainer) ||
      Boolean(document.querySelector('#root > .app-container')),
    projectManager: Boolean(window.appInstance?.projectManager),
    scriptCount: document.querySelectorAll('script[data-osoos-legacy-script]').length,
    storageKey: window.appInstance.projectManager.storageKey,
    direction: document.documentElement.dir
  }));

  expect(state).toEqual({
    reactRoot: true,
    projectManager: true,
    scriptCount: 0,
    storageKey: 'osoos-project-workspace-v1',
    direction: 'rtl'
  });
  expect(runtimeErrors).toEqual([]);
});

test('preserves existing Local Storage data and page direction', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('builder-html', '<main id="migrated-data">قديم</main>');
    localStorage.setItem('builder-css', '#migrated-data { color: rgb(1, 2, 3); }');
    localStorage.setItem('builder-js', 'window.__legacyDataLoaded = true;');
    localStorage.setItem(
      'builder-page-settings',
      JSON.stringify({
        dir: 'ltr',
        lang: 'en',
        title: 'Saved project',
        description: 'Existing data'
      })
    );
  });

  await page.goto('/index.html');
  await waitForRuntime(page);

  await expect(page.locator('#builder-canvas #migrated-data')).toHaveText('قديم');
  await expect(page.locator('#builder-canvas')).toHaveAttribute('dir', 'ltr');

  const persisted = await page.evaluate(() => ({
    html: localStorage.getItem('builder-html'),
    css: localStorage.getItem('builder-css'),
    javascript: localStorage.getItem('builder-js'),
    settings: JSON.parse(localStorage.getItem('builder-page-settings'))
  }));

  expect(persisted.html).toContain('migrated-data');
  expect(persisted.css).toContain('rgb(1, 2, 3)');
  expect(persisted.javascript).toContain('__legacyDataLoaded');
  expect(persisted.settings.dir).toBe('ltr');
});

test('keeps viewport controls, project drawer, and Undo/Redo interactions', async ({
  page
}) => {
  await page.goto('/index.html');
  await waitForRuntime(page);

  await page.locator('#vp-mobile').click();
  await expect(page.locator('#builder-canvas')).toHaveAttribute(
    'data-osoos-breakpoint',
    '375'
  );
  const canvasWidth = await expect
    .poll(
      () =>
        page
          .locator('#builder-canvas')
          .evaluate(node => node.getBoundingClientRect().width),
      { timeout: 5000 }
    )
    .toBeLessThanOrEqual(375)
    .then(() =>
      page
        .locator('#builder-canvas')
        .evaluate(node => node.getBoundingClientRect().width)
    );
  expect(canvasWidth).toBeGreaterThanOrEqual(360);
  expect(canvasWidth).toBeLessThanOrEqual(375);

  await page.locator('#project-manager-btn').click();
  await expect(page.locator('#project-drawer-backdrop')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#project-drawer-backdrop')).not.toHaveClass(/open/);

  const undoState = await page.evaluate(() => {
    const app = window.appInstance;
    const before = app.canvas.innerHTML;
    const node = document.createElement('p');
    node.id = 'react-history-check';
    node.textContent = 'history';
    app.canvas.appendChild(node);
    app.history.saveState('React E2E history');
    app.history.undo();
    return {
      before,
      afterUndo: app.canvas.innerHTML,
      canRedo: app.history.canRedo()
    };
  });

  expect(undoState.afterUndo).toBe(undoState.before);
  expect(undoState.canRedo).toBe(true);
});

test('does not erase the document or CSS while an HTML tag is incomplete', async ({
  page
}) => {
  await page.goto('/index.html');
  await waitForRuntime(page);

  const result = await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML = '<div class="safe-card">آمن</div>';
    app.editor.customCSS = '.safe-card { padding: 24px; }';
    app.editor.currentLanguage = 'html';
    app.editor.textarea.value = '<div';
    app.editor.syncEditorToCanvas();
    return {
      cardPresent: Boolean(app.canvas.querySelector('.safe-card')),
      css: app.editor.customCSS
    };
  });

  expect(result.cardPresent).toBe(true);
  expect(result.css).toContain('.safe-card');
});
