import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const sourceFile = path.resolve(projectDirectory, '..', 'js', 'app.js');
const outputFile = path.resolve(
  projectDirectory,
  'src',
  'app',
  'WebBuilderApp.js'
);

let source = fs.readFileSync(sourceFile, 'utf8');

const historyStart = source.indexOf('class HistoryState');
const appStart = source.indexOf('class WebBuilderApp');
if (historyStart < 0 || appStart < 0 || appStart <= historyStart) {
  throw new Error('Could not locate the Vanilla history and application classes');
}

source = `${source.slice(0, historyStart)}${source.slice(appStart)}`;

const imports = `import { HTML_ELEMENTS_DB } from '../data/htmlElements.js';
import { DragDropManager } from '../features/canvas/DragDropManager.js';
import { DOMTreeManager } from '../features/dom-tree/DOMTreeManager.js';
import { CodeEditorManager } from '../features/editor/CodeEditorManager.js';
import { PropertiesManager } from '../features/inspector/PropertiesManager.js';
import { ProjectManager } from '../features/projects/ProjectManager.js';
import { HistoryManager } from '../services/history/HistoryManager.js';
import { OsoosStyleEngine } from '../services/styles/OsoosStyleEngine.js';

`;

source = `${imports}${source}`;

const replacements = [
  [
    `    if (typeof window.ProjectManager === 'function') {
      this.projectManager = new window.ProjectManager(this);
      this.projectManager.init();
    }`,
    `    this.projectManager = new ProjectManager(this);
    this.projectManager.init();`
  ],
  [
    `// Initialize application on load
window.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new WebBuilderApp();
});`,
    `export { WebBuilderApp };`
  ]
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`Expected WebBuilderApp source fragment was not found: ${before}`);
  }
  source = source.replace(before, after);
}

fs.writeFileSync(outputFile, source, 'utf8');

console.log(
  JSON.stringify(
    {
      outputFile,
      sourceBytes: fs.statSync(sourceFile).size,
      moduleBytes: Buffer.byteLength(source),
      removedEmbeddedHistory: !source.includes('class HistoryState'),
      exportsWebBuilderApp: source.includes('export { WebBuilderApp };')
    },
    null,
    2
  )
);
