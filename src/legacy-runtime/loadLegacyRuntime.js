import JSZip from 'jszip';
import { builderStorageService } from '../services/storage/builderStorage.js';
import { historyService } from '../services/history/HistoryManager.js';
import { workspaceModelService } from '../services/projects/workspaceModel.js';
import { styleEngineService } from '../services/styles/OsoosStyleEngine.js';
import { HTML_ELEMENTS_DB, getElementInfo } from '../data/htmlElements.js';

let runtimePromise;

async function loadPreApplicationModules() {
  await import('../features/compat-runtime/visual-logic-phase-a.js');
  await import('../features/compat-runtime/interaction-hub.js');
  await import('../features/compat-runtime/interaction-demo.js');
}

async function loadPostApplicationModules() {
  await import('../features/compat-runtime/beginner-mode.js');
  await import('../features/compat-runtime/responsive-shell.js');
  await import('../features/compat-runtime/selection-toolbar-responsive.js');
  await import('../features/compat-runtime/dom-tree-clarity.js');
  await import('../features/compat-runtime/onboarding-tour.js');
}

async function waitForApplication() {
  const startedAt = performance.now();
  while (!window.appInstance?.projectManager) {
    if (performance.now() - startedAt > 15000) {
      throw new Error('انتهت مهلة تهيئة تطبيق أُسُس');
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  const app = window.appInstance;
  if (app.projectManager.readyPromise) {
    await app.projectManager.readyPromise;
  }
  return app;
}

async function initializeRuntime() {
  const [
    { visualLogicCore },
    { interactionHubCore },
    { interactionTutorials },
    { DragDropManager },
    { DOMTreeManager },
    { CodeEditorManager },
    { PropertiesManager },
    { ProjectManager },
    { WebBuilderApp }
  ] = await Promise.all([
    import('../engines/visualLogicCore.js'),
    import('../engines/interactionHubCore.js'),
    import('../engines/interactionTutorials.js'),
    import('../features/canvas/DragDropManager.js'),
    import('../features/dom-tree/DOMTreeManager.js'),
    import('../features/editor/CodeEditorManager.js'),
    import('../features/inspector/PropertiesManager.js'),
    import('../features/projects/ProjectManager.js'),
    import('../app/WebBuilderApp.js')
  ]);

  window.JSZip ||= JSZip;
  window.HTML_ELEMENTS_DB = HTML_ELEMENTS_DB;
  window.getElementInfo = getElementInfo;
  window.DragDropManager = DragDropManager;
  window.DOMTreeManager = DOMTreeManager;
  window.CodeEditorManager = CodeEditorManager;
  window.PropertiesManager = PropertiesManager;
  window.ProjectManager = ProjectManager;
  window.VisualLogicCore = visualLogicCore;
  window.OsoosInteractionHubCore = interactionHubCore;
  window.OsoosInteractionTutorials = interactionTutorials;
  window.OsoosReactServices = Object.freeze({
    storage: builderStorageService,
    history: historyService,
    projects: workspaceModelService,
    styles: styleEngineService
  });

  await loadPreApplicationModules();

  window.appInstance = new WebBuilderApp();

  await loadPostApplicationModules();

  const app = await waitForApplication();

  window.OsoosReactMigration = Object.freeze({
    mode: 'react-modules',
    ready: true,
    app
  });
  document.documentElement.dataset.reactMigrationReady = 'true';
  window.dispatchEvent(
    new CustomEvent('osoos:react-runtime-ready', { detail: { app } })
  );

  return app;
}

export function loadLegacyRuntime() {
  runtimePromise ||= initializeRuntime().catch(error => {
    document.documentElement.dataset.reactMigrationReady = 'error';
    console.error('[React migration] Legacy runtime initialization failed', error);
    throw error;
  });
  return runtimePromise;
}
