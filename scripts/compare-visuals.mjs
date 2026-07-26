import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { chromium } from '@playwright/test';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const outputDirectory = path.resolve(
  projectDirectory,
  'migration-evidence',
  'visual-comparison'
);
const browserExecutable =
  process.env.BROWSER_PATH ||
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const targets = {
  vanilla: process.env.VANILLA_URL || 'http://127.0.0.1:5500/index.html',
  react: process.env.REACT_URL || 'http://127.0.0.1:4173/index.html'
};

const viewports = {
  desktop: { width: 1440, height: 1000 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 }
};

fs.mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath: browserExecutable,
  headless: true
});

const captures = {};
const runtimeErrors = {};

async function captureTarget(targetName, targetUrl, viewportName, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    locale: 'ar-EG'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('favicon')) {
      errors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('osoos:onboarding-tour-completed:v1', 'completed');
    localStorage.setItem('osoos:experience-mode', 'beginner');
  });

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => Boolean(window.appInstance?.projectManager),
    null,
    { timeout: 20000 }
  );
  await page.evaluate(() => document.fonts?.ready || Promise.resolve());
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        caret-color: transparent !important;
        transition: none !important;
      }
    `
  });
  await page.waitForTimeout(350);

  const filePath = path.join(
    outputDirectory,
    `${viewportName}-${targetName}.png`
  );
  await page.screenshot({
    path: filePath,
    fullPage: false,
    animations: 'disabled'
  });

  const geometry = await page.evaluate(() => {
    const selectors = [
      '.app-header',
      '.thin-sidebar',
      '.panel-left',
      '.center-workspace',
      '.panel-right',
      '.preview-canvas-wrapper',
      '#builder-canvas',
      '.bottom-panel'
    ];
    return Object.fromEntries(
      selectors.map(selector => {
        const node = document.querySelector(selector);
        if (!node) return [selector, null];
        const rect = node.getBoundingClientRect();
        return [
          selector,
          {
            x: Math.round(rect.x * 100) / 100,
            y: Math.round(rect.y * 100) / 100,
            width: Math.round(rect.width * 100) / 100,
            height: Math.round(rect.height * 100) / 100
          }
        ];
      })
    );
  });

  await context.close();
  runtimeErrors[`${viewportName}:${targetName}`] = errors;
  return { filePath, geometry };
}

try {
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    captures[viewportName] = {};
    for (const [targetName, targetUrl] of Object.entries(targets)) {
      captures[viewportName][targetName] = await captureTarget(
        targetName,
        targetUrl,
        viewportName,
        viewport
      );
    }
  }
} finally {
  await browser.close();
}

const comparisons = {};

for (const viewportName of Object.keys(viewports)) {
  const vanilla = PNG.sync.read(
    fs.readFileSync(captures[viewportName].vanilla.filePath)
  );
  const react = PNG.sync.read(
    fs.readFileSync(captures[viewportName].react.filePath)
  );

  if (vanilla.width !== react.width || vanilla.height !== react.height) {
    throw new Error(`${viewportName}: screenshot dimensions differ`);
  }

  const diff = new PNG({ width: vanilla.width, height: vanilla.height });
  const differentPixels = pixelmatch(
    vanilla.data,
    react.data,
    diff.data,
    vanilla.width,
    vanilla.height,
    {
      threshold: 0.1,
      includeAA: false
    }
  );
  const pixelCount = vanilla.width * vanilla.height;
  const diffPath = path.join(outputDirectory, `${viewportName}-diff.png`);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const geometryDifferences = {};
  for (const selector of Object.keys(captures[viewportName].vanilla.geometry)) {
    const before = captures[viewportName].vanilla.geometry[selector];
    const after = captures[viewportName].react.geometry[selector];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      geometryDifferences[selector] = { vanilla: before, react: after };
    }
  }

  comparisons[viewportName] = {
    width: vanilla.width,
    height: vanilla.height,
    differentPixels,
    differenceRatio: differentPixels / pixelCount,
    geometryDifferences,
    diffPath
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  targets,
  viewports,
  comparisons,
  runtimeErrors
};

const reportPath = path.join(outputDirectory, 'report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(JSON.stringify({ reportPath, comparisons, runtimeErrors }, null, 2));
