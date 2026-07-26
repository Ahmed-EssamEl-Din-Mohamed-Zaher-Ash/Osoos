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
  await page.goto('/index.html');
  await waitForRuntime(page);
});

test('closes the icon picker with its close button', async ({ page }) => {
  await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML = '<p id="icon-target">نص تجريبي</p>';
    app.selectElement(app.canvas.querySelector('#icon-target'));
    app.properties.openIconPicker();
  });

  const overlay = page.locator('#icon-picker-overlay');
  await expect(overlay).toBeVisible();

  await page.locator('#icon-picker-close').click();
  await expect(overlay).toBeHidden();
  await expect(overlay).toHaveAttribute('hidden', '');
});

test('edits link text and underline without following the link', async ({ page }) => {
  await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML =
      '<a id="editable-link" href="https://example.com">النص القديم</a>';
    app.reattachCanvasListeners();
  });

  const originalUrl = page.url();
  await page.locator('#builder-canvas #editable-link').click();
  await expect(page).toHaveURL(originalUrl);

  await page.locator('#prop-link-text').fill('النص الجديد');
  await page.locator('#prop-link-underline').selectOption('none');

  await expect(page.locator('#builder-canvas #editable-link')).toHaveText('النص الجديد');
  const state = await page.evaluate(() => {
    const app = window.appInstance;
    const link = app.canvas.querySelector('#editable-link');
    return {
      selectedId: app.selectedElement?.id,
      textDecorationLine: app.styleEngine.getStyleValue(
        link,
        'text-decoration-line',
        { breakpoint: app.properties.activeBreakpoint, pseudo: 'normal' }
      )
    };
  });

  expect(state).toEqual({
    selectedId: 'editable-link',
    textDecorationLine: 'none'
  });
});

test('keeps the HTML caret in place after the debounced canvas sync', async ({
  page
}) => {
  const expectedCaret = await page.evaluate(() => {
    const app = window.appInstance;
    const textarea = app.editor.textarea;
    app.setWorkspaceMode('code');
    app.editor.currentLanguage = 'html';
    textarea.value =
      '<section id="caret-test">\n  <p>قبل المؤشر وبعده</p>\n</section>';
    const caret = textarea.value.indexOf('وبعده');
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
    textarea.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: null
      })
    );
    return caret;
  });

  await page.waitForTimeout(700);

  const editorState = await page.evaluate(() => {
    const textarea = window.appInstance.editor.textarea;
    return {
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      length: textarea.value.length
    };
  });

  expect(editorState.selectionStart).toBe(expectedCaret);
  expect(editorState.selectionEnd).toBe(expectedCaret);
  expect(editorState.selectionStart).toBeLessThan(editorState.length);
});
