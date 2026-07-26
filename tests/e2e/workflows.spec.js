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
    if (!sessionStorage.getItem('osoos:e2e-workflow-initialized')) {
      localStorage.clear();
      sessionStorage.setItem('osoos:e2e-workflow-initialized', 'true');
    }
    localStorage.setItem('osoos:onboarding-tour-completed:v1', 'completed');
    localStorage.setItem('osoos:experience-mode', 'advanced');
  });

  await page.goto('/index.html');
  await waitForRuntime(page);
});

test('navigates every workspace section and opens the interaction flow', async ({
  page
}) => {
  await page.locator('#tab-btn-js').click();
  await expect(page.locator('#js-logic-blocks-container-sidebar')).toBeVisible();
  await expect(page.locator('#js-interaction-hub')).not.toBeEmpty();

  await page.locator('#tab-btn-settings').click();
  await expect(page.locator('#settings-panel-container')).toBeVisible();

  await page.locator('#tab-btn-history').click();
  await expect(page.locator('#history-panel-container')).toBeVisible();

  await page.locator('#tab-btn-code').click();
  await expect
    .poll(() => page.evaluate(() => window.appInstance.workspaceMode))
    .toBe('code');
  await expect(page.locator('#code-textarea')).toBeVisible();

  await page.locator('#tab-btn-css').click();
  await expect
    .poll(() => page.evaluate(() => window.appInstance.workspaceMode))
    .toBe('designer');
  await expect(page.locator('#css-properties-container')).toBeVisible();

  await page.locator('#tab-btn-demo').click();
  await expect(page.locator('#interaction-demo-overlay')).toBeVisible();
  await expect(page.locator('#interaction-demo-body')).not.toBeEmpty();
  await page.locator('.interaction-demo-close').click();
  await expect(page.locator('#interaction-demo-overlay')).toHaveCount(0);
});

test('supports palette drag-and-drop and the input type modal', async ({ page }) => {
  const canvas = page.locator('#builder-canvas');
  const paragraphCard = page.locator('.element-card[data-tag="p"]');
  const inputCard = page.locator('.element-card[data-tag="input"]');

  await page.evaluate(() => window.appInstance.collapseRight(false));
  await paragraphCard.scrollIntoViewIfNeeded();
  await expect(paragraphCard).toBeVisible();

  const paragraphCount = await canvas.locator('p').count();
  await paragraphCard.dragTo(canvas);
  await expect(canvas.locator('p')).toHaveCount(paragraphCount + 1);
  await expect(page.locator('#dom-tree-root [data-id]')).not.toHaveCount(0);

  const inputCount = await canvas.locator('input').count();
  await inputCard.scrollIntoViewIfNeeded();
  await inputCard.click();
  await expect(page.locator('#input-type-modal')).toHaveClass(/open/);
  await page.locator('.input-type-option', { hasText: 'email' }).click();
  await expect(canvas.locator('input')).toHaveCount(inputCount + 1);
  await expect(canvas.locator('input[type="email"]')).toHaveCount(1);
});

test('uses clear interaction labels and purpose-driven button conditions', async ({
  page
}) => {
  await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML = '<button id="add-button">إضافة</button><h3 id="count">0</h3>';
    app.reattachCanvasListeners();
    const button = app.canvas.querySelector('#add-button');
    app.selectElement(button);
  });

  await page.locator('#tab-btn-demo').click();
  await expect(page.locator('#interaction-demo-title')).toHaveText(
    'مصمّم التفاعلات'
  );
  await expect(page.locator('#demo-tab-flow')).toContainText(
    'الخطوات والنتيجة'
  );
  await expect(page.locator('#demo-tab-condition')).toContainText(
    'متى يبدأ؟'
  );
  await page.locator('#demo-tab-condition').click();

  await expect(page.locator('#demo-condition-title')).toContainText(
    'متى يبدأ التنفيذ؟'
  );
  await expect(page.locator('.demo-condition-direct')).toBeVisible();
  await expect(page.locator('#interaction-demo-body')).not.toContainText(
    'ليس فارغًا'
  );

  await page
    .locator('[data-demo-action="set-condition-mode"][data-value="conditional"]')
    .click();
  await expect(page.locator('#interaction-demo-body')).toContainText(
    'الزر جاهز للاستخدام'
  );
  await expect(page.locator('#interaction-demo-body')).toContainText(
    'الزر معطّل'
  );
  await expect(page.locator('#interaction-demo-body')).not.toContainText(
    'ليس فارغًا'
  );
});

test('moves restricted list items through forgiving DOM-tree drop targets', async ({
  page
}) => {
  await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML = `
      <ul id="source-list"><li id="moving-li">Moving</li></ul>
      <ul id="target-list"><li id="existing-li">Existing</li></ul>
    `;
    app.reattachCanvasListeners();
    app.domTree.render();
  });

  const movingHandle = () =>
    page.locator(
      '#dom-tree-root .dom-tree-item[data-id="moving-li"] > .dom-tree-node-wrapper .dom-drag-handle'
    );
  const targetListRow = page.locator(
    '#dom-tree-root .dom-tree-item[data-id="target-list"] > .dom-tree-node-wrapper'
  );

  async function dispatchDomDrag(source, target, targetOffsetY) {
    const targetBox = await target.boundingBox();
    expect(targetBox).not.toBeNull();
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await source.dispatchEvent('dragstart', { dataTransfer });
    await target.dispatchEvent('dragover', {
      dataTransfer,
      clientX: targetBox.x + Math.min(80, targetBox.width / 2),
      clientY: targetBox.y + targetOffsetY
    });
    await target.dispatchEvent('drop', {
      dataTransfer,
      clientX: targetBox.x + Math.min(80, targetBox.width / 2),
      clientY: targetBox.y + targetOffsetY
    });
    await dataTransfer.dispose();
  }

  // The very top of the ul row used to mean "beside ul" and reject li.
  await dispatchDomDrag(movingHandle(), targetListRow, 2);
  await expect(page.locator('#target-list > #moving-li')).toHaveCount(1);

  const existingRow = page.locator(
    '#dom-tree-root .dom-tree-item[data-id="existing-li"] > .dom-tree-node-wrapper'
  );

  // The middle of an li row used to mean "inside li" and reject another li.
  await dispatchDomDrag(movingHandle(), existingRow, 18);

  const order = await page
    .locator('#target-list > li')
    .evaluateAll(nodes => nodes.map(node => node.id));
  expect(order).toEqual(['moving-li', 'existing-li']);
});

test('creates, validates, imports, restores, and exports a project', async ({
  page
}) => {
  await page.locator('#project-manager-btn').click();
  await page.locator('#project-new-btn').click();
  await page.locator('#project-modal input[name="project-name"]').fill('React acceptance');
  await page.locator('#project-modal form').evaluate(form => form.requestSubmit());
  await expect(page.locator('#active-project-label')).toContainText(
    'React acceptance'
  );

  await page.locator('#project-new-file-btn').click();
  await page.locator('#project-modal select').selectOption('css');
  await page
    .locator('#project-modal input[name="file-name"]')
    .fill('assets/theme.css');
  await page.locator('#project-modal form').evaluate(form => form.requestSubmit());
  await expect(page.locator('#project-modal-backdrop')).not.toHaveClass(/open/);

  await page.locator('#project-new-file-btn').click();
  await page.locator('#project-modal select').selectOption('css');
  await page
    .locator('#project-modal input[name="file-name"]')
    .fill('assets/theme.css');
  await page.locator('#project-modal form').evaluate(form => form.requestSubmit());
  const formError = page.locator('#project-modal form > div').first();
  await expect(formError).toBeVisible();
  await expect(formError).not.toBeEmpty();
  await page.keyboard.press('Escape');

  await page.locator('#project-open-file-input').setInputFiles({
    name: 'imported.html',
    mimeType: 'text/html',
    buffer: Buffer.from(
      '<main id="restored-import"><h1>Imported React project</h1></main>'
    )
  });
  await expect(page.locator('#builder-canvas #restored-import')).toBeVisible();

  const storedBeforeReload = await page.evaluate(() => {
    const manager = window.appInstance.projectManager;
    const stored = JSON.parse(localStorage.getItem(manager.storageKey));
    const project = stored.projects.find(item => item.name === 'React acceptance');
    return {
      activeProjectId: stored.activeProjectId,
      projectId: project?.id,
      paths: project?.files.map(file => file.path).sort()
    };
  });
  expect(storedBeforeReload.activeProjectId).toBe(storedBeforeReload.projectId);
  expect(storedBeforeReload.paths).toEqual(
    expect.arrayContaining(['assets/theme.css', 'imported.html'])
  );

  await page.reload();
  await waitForRuntime(page);
  await expect(page.locator('#active-project-label')).toContainText(
    'React acceptance'
  );
  await expect(page.locator('#builder-canvas #restored-import')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-btn').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.zip$/i);
});

test('keeps authored output isolated and final preview export-faithful', async ({
  page
}) => {
  const checks = await page.evaluate(() => {
    const app = window.appInstance;
    app.canvas.innerHTML =
      '<main id="safe-output"><a id="unsafe-link" href="javascript:alert(1)">x</a></main>';
    app.editor.customCSS =
      'body { display: none; } #safe-output { color: rgb(12, 34, 56); }';
    app.editor.customJS =
      "document.getElementById('safe-output')?.setAttribute('data-preview-executed', 'yes');";
    app.editor.interactionDefinitions = [];
    app.applyCustomCSS(app.editor.customCSS);

    const sanitized = app.sanitizeRestoredHtml(
      '<iframe srcdoc="<script>parent.__pwned=true;<\\/script>"></iframe>' +
        '<button id="unsafe-button" onclick="parent.__pwned=true">Run</button>' +
        '<a id="unsafe-url" href="java&#9;script:alert(1)">Bad</a>' +
        '<p id="safe-copy">Safe</p>'
    );
    const holder = document.createElement('div');
    holder.innerHTML = sanitized;
    const exported = app.buildExportDocument();
    app.projectManager.captureActivePage();
    const projectOutputs = app.projectManager.buildProjectOutputs();
    const htmlOutput = projectOutputs.find(file => file.kind === 'html');
    const generatedScript = projectOutputs.find(file =>
      file.kind === 'js' && file.id?.endsWith('-generated-script')
    );

    return {
      appVisible: getComputedStyle(document.body).display !== 'none',
      canvasRuleScoped:
        app.customStyleTag.textContent.startsWith('@scope (#builder-canvas)'),
      activeContentRemoved: !holder.querySelector('iframe,script'),
      handlerRemoved: !holder.querySelector('#unsafe-button')?.hasAttribute('onclick'),
      unsafeUrlRemoved: !holder.querySelector('#unsafe-url')?.hasAttribute('href'),
      safeContentKept: holder.querySelector('#safe-copy')?.textContent === 'Safe',
      exportHasCss: exported.includes(
        '#safe-output { color: rgb(12, 34, 56); }'
      ),
      exportHasRtl: /<html[^>]+dir="rtl"/.test(exported),
      projectHtmlUsesExternalJs:
        /<script data-osoos-page-script src="[^"]+\.js"><\/script>/.test(
          htmlOutput?.content || ''
        ) &&
        !htmlOutput?.content.includes('data-preview-executed'),
      generatedScriptIsClean:
        generatedScript?.content.includes('data-preview-executed') &&
        !generatedScript?.content.includes('OSOOS_LOGIC_DATA') &&
        !generatedScript?.content.includes('__osoos_links')
    };
  });

  expect(checks).toEqual({
    appVisible: true,
    canvasRuleScoped: true,
    activeContentRemoved: true,
    handlerRemoved: true,
    unsafeUrlRemoved: true,
    safeContentKept: true,
    exportHasCss: true,
    exportHasRtl: true,
    projectHtmlUsesExternalJs: true,
    generatedScriptIsClean: true
  });

  await page.locator('#final-preview-btn').click();
  await expect(page.locator('#final-preview-overlay')).toBeVisible();
  await expect(page.locator('#final-preview-frame')).toHaveAttribute(
    'sandbox',
    'allow-scripts allow-modals allow-forms allow-popups'
  );
  const source = await page.locator('#final-preview-frame').getAttribute('srcdoc');
  expect(source).toContain('#safe-output { color: rgb(12, 34, 56); }');
  expect(source).toMatch(/<html[^>]+dir="rtl"/);
  expect(source).toContain('data-osoos-preview-bridge');
  expect(source).not.toContain('data-osoos-page-script');
  expect(source).not.toContain('data-preview-executed');
  await expect(
    page
      .frameLocator('#final-preview-frame')
      .locator('#safe-output')
  ).toHaveAttribute('data-preview-executed', 'yes');
  await page.locator('#final-preview-close-btn').click();
  await expect(page.locator('#final-preview-overlay')).toHaveCount(0);
});
