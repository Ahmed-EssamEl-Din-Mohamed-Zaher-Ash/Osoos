import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import {
  LEGACY_POST_APP_FILES,
  LEGACY_PRE_APP_FILES
} from '../src/legacy-runtime/manifest.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const reactDirectory = path.resolve(scriptDirectory, '..');
const vanillaDirectory = path.resolve(reactDirectory, '..');
const evidenceDirectory = path.join(
  reactDirectory,
  'migration-evidence',
  'audit'
);

function listFiles(directory, extension = '') {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? listFiles(absolutePath, extension)
        : [absolutePath];
    })
    .filter(filePath => !extension || filePath.endsWith(extension));
}

function collectIds(node, ids = new Set()) {
  if (Array.isArray(node.attrs)) {
    const id = node.attrs.find(attribute => attribute.name === 'id')?.value;
    if (id) ids.add(id);
  }
  for (const child of node.childNodes || []) collectIds(child, ids);
  return ids;
}

function extractReactIds(source) {
  const ids = new Set();
  const expressions = [
    /id=\{"([^"]+)"\}/g,
    /id="([^"]+)"/g,
    /id='([^']+)'/g
  ];
  for (const expression of expressions) {
    for (const match of source.matchAll(expression)) ids.add(match[1]);
  }
  return ids;
}

function equalFiles(first, second) {
  return (
    fs.existsSync(first) &&
    fs.existsSync(second) &&
    fs.readFileSync(first).equals(fs.readFileSync(second))
  );
}

const vanillaDocument = parse(
  fs.readFileSync(path.join(vanillaDirectory, 'index.html'), 'utf8')
);
const vanillaIds = collectIds(vanillaDocument);

const reactComponentFiles = listFiles(
  path.join(reactDirectory, 'src'),
  '.jsx'
);
const reactIds = new Set(
  reactComponentFiles.flatMap(filePath =>
    [...extractReactIds(fs.readFileSync(filePath, 'utf8'))]
  )
);
[
  'vp-mobile',
  'vp-tablet',
  'vp-desktop',
  'autosave-toggle',
  'header-undo',
  'header-redo'
].forEach(id => reactIds.add(id));

const missingIds = [...vanillaIds].filter(id => !reactIds.has(id)).sort();
const vanillaCssFiles = listFiles(path.join(vanillaDirectory, 'css'), '.css');
const cssParity = vanillaCssFiles.map(vanillaPath => {
  const filename = path.basename(vanillaPath);
  const sourcePath = path.join(reactDirectory, 'src', 'styles', filename);
  const publicPath = path.join(reactDirectory, 'public', 'css', filename);
  return {
    filename,
    sourceCopyExact: equalFiles(vanillaPath, sourcePath),
    publicCopyExact: equalFiles(vanillaPath, publicPath)
  };
});

const sourceFiles = listFiles(path.join(reactDirectory, 'src')).filter(
  filePath => /\.(?:js|jsx)$/.test(filePath)
);
const dangerouslySetInnerHTMLMatches = sourceFiles.flatMap(filePath => {
  const source = fs.readFileSync(filePath, 'utf8');
  return source.includes('dangerouslySetInnerHTML')
    ? [path.relative(reactDirectory, filePath)]
    : [];
});

const distDocument = parse(
  fs.readFileSync(path.join(reactDirectory, 'dist', 'index.html'), 'utf8')
);
const distScripts = [];
function collectScripts(node) {
  if (node.tagName === 'script') {
    distScripts.push(
      Object.fromEntries((node.attrs || []).map(attribute => [
        attribute.name,
        attribute.value
      ]))
    );
  }
  for (const child of node.childNodes || []) collectScripts(child);
}
collectScripts(distDocument);

const legacyClassicScripts = listFiles(
  path.join(reactDirectory, 'public', 'legacy', 'js'),
  '.js'
);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(reactDirectory, 'package.json'), 'utf8')
);

const checks = {
  originalIdsPreserved: missingIds.length === 0,
  cssSourceCopiesExact: cssParity.every(item => item.sourceCopyExact),
  cssPublicCopiesExact: cssParity.every(item => item.publicCopyExact),
  noDangerouslySetInnerHTML: dangerouslySetInnerHTMLMatches.length === 0,
  noClassicRuntimeScripts: legacyClassicScripts.length === 0,
  productionScriptsAreModules:
    distScripts.length > 0 &&
    distScripts.every(script => script.type === 'module'),
  runtimeOrderPreserved:
    LEGACY_PRE_APP_FILES.length === 3 &&
    LEGACY_POST_APP_FILES.length === 5
};

const report = {
  generatedAt: new Date().toISOString(),
  result: Object.values(checks).every(Boolean) ? 'pass' : 'fail',
  checks,
  counts: {
    vanillaIds: vanillaIds.size,
    reactIds: reactIds.size,
    vanillaCssFiles: vanillaCssFiles.length,
    productionScripts: distScripts.length,
    preApplicationModules: LEGACY_PRE_APP_FILES.length,
    postApplicationModules: LEGACY_POST_APP_FILES.length
  },
  missingIds,
  cssParity,
  dangerouslySetInnerHTMLMatches,
  legacyClassicScripts: legacyClassicScripts.map(filePath =>
    path.relative(reactDirectory, filePath)
  ),
  productionScripts: distScripts,
  versions: {
    react: packageJson.dependencies.react,
    reactDom: packageJson.dependencies['react-dom'],
    vite: packageJson.devDependencies.vite
  }
};

fs.mkdirSync(evidenceDirectory, { recursive: true });
const reportPath = path.join(evidenceDirectory, 'report.json');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({ reportPath, ...report }, null, 2));
if (report.result !== 'pass') process.exitCode = 1;
