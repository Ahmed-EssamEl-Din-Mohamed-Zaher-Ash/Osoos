import { describe, expect, it, vi } from 'vitest';
import {
  WORKSPACE_SCHEMA_VERSION,
  createAssetFile,
  createCodeFile,
  createHtmlFile,
  createProject,
  repairWorkspace
} from '../../src/services/projects/workspaceModel.js';

function createManager() {
  let serial = 0;
  return {
    uid: prefix => `${prefix}-${++serial}`,
    normalizePath: value =>
      String(value || '')
        .replaceAll('\\', '/')
        .replace(/^\/+/, ''),
    baseName: value => String(value).split('/').at(-1),
    kindFromPath: value => {
      const extension = String(value).split('.').at(-1).toLowerCase();
      if (extension === 'html' || extension === 'htm') return 'html';
      if (extension === 'css') return 'css';
      if (extension === 'js') return 'js';
      return 'asset';
    },
    resolveProjectReferences: vi.fn(),
    createHtmlFile(filePath, state) {
      return createHtmlFile(this, filePath, state);
    },
    createProject(name, files) {
      return createProject(this, name, files);
    }
  };
}

describe('workspace schema model', () => {
  it('creates compatible HTML, code and asset records', () => {
    const manager = createManager();
    const html = createHtmlFile(manager, '/pages/about.html', {
      content: '<main>About</main>',
      settings: { dir: 'ltr', lang: 'en' },
      links: ['file-1', 'file-1'],
      interactions: [{ id: 'interaction-1', event: 'click' }]
    });
    const css = createCodeFile(manager, 'assets\\theme.css', 'css', '.card{}');
    const asset = createAssetFile(
      manager,
      'images\\logo.png',
      'data:image/png;base64,AA==',
      'image/png'
    );

    expect(html).toMatchObject({
      path: 'pages/about.html',
      kind: 'html',
      content: '<main>About</main>',
      settings: { dir: 'ltr', lang: 'en' },
      links: ['file-1'],
      interactions: [{ id: 'interaction-1', event: 'click' }],
      references: { styles: [], scripts: [] }
    });
    expect(css).toMatchObject({
      path: 'assets/theme.css',
      kind: 'css',
      content: '.card{}'
    });
    expect(asset).toMatchObject({
      path: 'images/logo.png',
      kind: 'asset',
      dataUrl: 'data:image/png;base64,AA==',
      mime: 'image/png'
    });
  });

  it('keeps the project shape and selects its first HTML file', () => {
    const manager = createManager();
    const html = createHtmlFile(manager, 'index.html');
    const project = createProject(manager, '  مشروعي  ', [html]);

    expect(project).toMatchObject({
      name: 'مشروعي',
      activeFileId: html.id,
      lastPageId: html.id,
      files: [html]
    });
  });

  it('repairs old workspace data without changing schema version', () => {
    const manager = createManager();
    manager.workspace = {
      version: 0,
      activeProjectId: 'missing',
      projects: [
        {
          id: 'project-old',
          name: 'قديم',
          files: [
            {
              id: 'file-old',
              path: 'index.html',
              content: '<main>قديم</main>'
            }
          ]
        }
      ]
    };

    repairWorkspace(manager);

    expect(manager.workspace.version).toBe(WORKSPACE_SCHEMA_VERSION);
    expect(manager.workspace.activeProjectId).toBe('project-old');
    expect(manager.workspace.projects[0].files[0]).toMatchObject({
      id: 'file-old',
      kind: 'html',
      content: '<main>قديم</main>',
      css: '',
      js: '',
      interactions: [],
      links: [],
      references: { styles: [], scripts: [] }
    });
    expect(manager.resolveProjectReferences).toHaveBeenCalledOnce();
  });
});
