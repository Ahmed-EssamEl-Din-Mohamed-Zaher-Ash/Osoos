import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const sourceFile = path.resolve(projectDirectory, '..', 'index.html');
const outputFile = path.resolve(
  projectDirectory,
  'src',
  'legacy-generated',
  'StaticShell.jsx'
);

const documentNode = parse(fs.readFileSync(sourceFile, 'utf8'));

const childElements = node =>
  (node.childNodes || []).filter(child => child.tagName);

const findElement = (node, predicate) => {
  if (node.tagName && predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
};

const attribute = (node, name) =>
  (node.attrs || []).find(item => item.name === name)?.value;

const hasClass = (node, className) =>
  (attribute(node, 'class') || '').split(/\s+/).includes(className);

const body = findElement(documentNode, node => node.tagName === 'body');
const appContainer = findElement(body, node => hasClass(node, 'app-container'));
const inputModal = findElement(body, node => attribute(node, 'id') === 'input-type-modal');
const appHeader = findElement(appContainer, node => hasClass(node, 'app-header'));
const viewportSelector = findElement(appHeader, node => hasClass(node, 'viewport-selector'));
const autosaveToggle = findElement(appHeader, node => hasClass(node, 'checkbox-container'));
const undoButton = findElement(appHeader, node => attribute(node, 'id') === 'header-undo');
const redoButton = findElement(appHeader, node => attribute(node, 'id') === 'header-redo');
const workspace = findElement(appContainer, node => hasClass(node, 'app-workspace'));
const navigationRail = findElement(workspace, node => hasClass(node, 'thin-sidebar'));
const inspectorPanel = findElement(workspace, node => hasClass(node, 'panel-left'));
const canvasWorkspace = findElement(workspace, node => hasClass(node, 'center-workspace'));
const elementsPanel = findElement(workspace, node => hasClass(node, 'panel-right'));
const bottomDock = findElement(canvasWorkspace, node => hasClass(node, 'bottom-panel'));

const requiredNodes = {
  appContainer,
  inputModal,
  appHeader,
  viewportSelector,
  autosaveToggle,
  undoButton,
  redoButton,
  workspace,
  navigationRail,
  inspectorPanel,
  canvasWorkspace,
  elementsPanel,
  bottomDock
};

for (const [name, node] of Object.entries(requiredNodes)) {
  if (!node) throw new Error(`Unable to locate the required ${name} node`);
}

const attributeNames = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  contenteditable: 'contentEditable',
  spellcheck: 'spellCheck',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  readonly: 'readOnly',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  srcset: 'srcSet',
  crossorigin: 'crossOrigin',
  referrerpolicy: 'referrerPolicy',
  usemap: 'useMap',
  frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen',
  'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv'
};

const booleanAttributes = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'ismap',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected'
]);

const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

const camelCaseStyleName = name => {
  if (name.startsWith('--')) return name;
  if (name.startsWith('-ms-')) name = name.slice(1);
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

const parseStyle = value => {
  const result = {};
  for (const declaration of value.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    const property = declaration.slice(0, colon).trim();
    const propertyValue = declaration.slice(colon + 1).trim();
    if (!property || !propertyValue) continue;
    result[camelCaseStyleName(property)] = propertyValue;
  }
  return result;
};

const renderAttributes = node => {
  const attributes = [];
  for (const item of node.attrs || []) {
    const rawName = item.name;
    if (rawName === 'src' && item.value === '') {
      attributes.push('src={undefined}');
      continue;
    }

    if (rawName === 'style') {
      attributes.push(`style={${JSON.stringify(parseStyle(item.value))}}`);
      continue;
    }

    if (rawName === 'checked') {
      attributes.push('defaultChecked');
      continue;
    }

    const name = attributeNames[rawName] || rawName;
    if (booleanAttributes.has(rawName) && (!item.value || item.value === rawName)) {
      attributes.push(name);
      continue;
    }

    if (
      rawName === 'value' &&
      (node.tagName === 'input' || node.tagName === 'textarea')
    ) {
      attributes.push(`defaultValue={${JSON.stringify(item.value)}}`);
      continue;
    }

    attributes.push(`${name}={${JSON.stringify(item.value)}}`);
  }
  return attributes.length ? ` ${attributes.join(' ')}` : '';
};

const renderNode = (node, replacements = new Map(), depth = 0) => {
  if (replacements.has(node)) {
    return `${'  '.repeat(depth)}<${replacements.get(node)} />`;
  }

  if (node.nodeName === '#text') {
    if (!node.value) return '';
    return `${'  '.repeat(depth)}{${JSON.stringify(node.value)}}`;
  }

  if (node.nodeName === '#comment' || !node.tagName || node.tagName === 'script') {
    return '';
  }

  const indent = '  '.repeat(depth);
  const attributes = renderAttributes(node);
  if (voidElements.has(node.tagName)) {
    return `${indent}<${node.tagName}${attributes} />`;
  }

  const children = (node.childNodes || [])
    .map(child => renderNode(child, replacements, depth + 1))
    .filter(Boolean);

  if (!children.length) {
    return `${indent}<${node.tagName}${attributes}></${node.tagName}>`;
  }

  return [
    `${indent}<${node.tagName}${attributes}>`,
    ...children,
    `${indent}</${node.tagName}>`
  ].join('\n');
};

const component = (name, node, replacements = new Map()) => `
export function ${name}() {
  return (
${renderNode(node, replacements, 2)}
  );
}
`;

const workspaceReplacements = new Map([
  [navigationRail, 'NavigationRail'],
  [inspectorPanel, 'InspectorPanel'],
  [canvasWorkspace, 'CanvasWorkspace'],
  [elementsPanel, 'ElementsPanel']
]);
const canvasReplacements = new Map([[bottomDock, 'BottomDock']]);
const appReplacements = new Map([
  [appHeader, 'AppHeader'],
  [workspace, 'WorkspaceShell']
]);
const headerReplacements = new Map([
  [viewportSelector, 'ViewportControls'],
  [autosaveToggle, 'AutosaveToggle'],
  [undoButton, 'UndoButton'],
  [redoButton, 'RedoButton']
]);

const generatedHeader = `/* eslint-disable react/no-unknown-property */
/*
 * Generated mechanically from ../index.html.
 *
 * Do not hand-edit this file. Update the source template or the generator so
 * DOM order, IDs, ARIA attributes, and class names stay auditable.
 */
`;

const generatedFiles = new Map([
  [
    'AppHeader.jsx',
    `${generatedHeader}
import {
  AutosaveToggle,
  RedoButton,
  UndoButton,
  ViewportControls
} from '../components/header/HeaderControls.jsx';
${component('AppHeader', appHeader, headerReplacements)}`
  ],
  [
    'NavigationRail.jsx',
    `${generatedHeader}${component('NavigationRail', navigationRail)}`
  ],
  [
    'InspectorPanel.jsx',
    `${generatedHeader}${component('InspectorPanel', inspectorPanel)}`
  ],
  [
    'BottomDock.jsx',
    `${generatedHeader}${component('BottomDock', bottomDock)}`
  ],
  [
    'CanvasWorkspace.jsx',
    `${generatedHeader}
import { BottomDock } from './BottomDock.jsx';
${component('CanvasWorkspace', canvasWorkspace, canvasReplacements)}`
  ],
  [
    'ElementsPanel.jsx',
    `${generatedHeader}${component('ElementsPanel', elementsPanel)}`
  ],
  [
    'WorkspaceShell.jsx',
    `${generatedHeader}
import { CanvasWorkspace } from './CanvasWorkspace.jsx';
import { ElementsPanel } from './ElementsPanel.jsx';
import { InspectorPanel } from './InspectorPanel.jsx';
import { NavigationRail } from './NavigationRail.jsx';
${component('WorkspaceShell', workspace, workspaceReplacements)}`
  ],
  [
    'InputTypeModal.jsx',
    `${generatedHeader}${component('InputTypeModal', inputModal)}`
  ],
  [
    'AppContainer.jsx',
    `${generatedHeader}
import { AppHeader } from './AppHeader.jsx';
import { WorkspaceShell } from './WorkspaceShell.jsx';
${component('AppContainer', appContainer, appReplacements)}`
  ],
  [
    'StaticShell.jsx',
    `${generatedHeader}
import { AppContainer } from './AppContainer.jsx';
import { InputTypeModal } from './InputTypeModal.jsx';

export default function StaticShell() {
  return (
    <>
      <AppContainer />
      <InputTypeModal />
    </>
  );
}
`
  ]
]);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
for (const [fileName, contents] of generatedFiles) {
  fs.writeFileSync(
    path.join(path.dirname(outputFile), fileName),
    contents,
    'utf8'
  );
}
const output = [...generatedFiles.values()].join('\n');

const originalIds = [...fs.readFileSync(sourceFile, 'utf8').matchAll(/\bid=["']([^"']+)["']/g)]
  .map(match => match[1]);
const generatedIds = [...output.matchAll(/\bid=\{["']([^"']+)["']\}/g)]
  .map(match => match[1]);

const reactOwnedIds = new Set([
  'vp-mobile',
  'vp-tablet',
  'vp-desktop',
  'autosave-toggle',
  'header-undo',
  'header-redo'
]);
const missingIds = originalIds.filter(
  id => !generatedIds.includes(id) && !reactOwnedIds.has(id)
);
if (missingIds.length) {
  throw new Error(`Generated shell is missing IDs: ${missingIds.join(', ')}`);
}

console.log(
  JSON.stringify(
    {
      outputFile,
      componentCount: generatedFiles.size,
      originalIdCount: originalIds.length,
      generatedIdCount: generatedIds.length,
      reactOwnedIdCount: reactOwnedIds.size,
      sourceTopLevelElements: childElements(body)
        .filter(node => node.tagName !== 'script')
        .map(node => node.tagName)
    },
    null,
    2
  )
);
