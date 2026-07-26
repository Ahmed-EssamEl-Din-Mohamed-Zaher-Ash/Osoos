export const WORKSPACE_SCHEMA_VERSION = 1;

export function createProject(manager, name, files = []) {
  const htmlFile = files.find(file => file.kind === 'html');
  return {
    id: manager.uid('project'),
    name: String(name || 'مشروع جديد').trim() || 'مشروع جديد',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files,
    activeFileId: htmlFile ? htmlFile.id : files[0]?.id || null,
    lastPageId: htmlFile ? htmlFile.id : null
  };
}

export function createHtmlFile(manager, filePath, state = {}) {
  const normalizedPath = manager.normalizePath(filePath || 'index.html');
  return {
    id: manager.uid('file'),
    path: normalizedPath,
    kind: 'html',
    content: String(state.content || ''),
    css: String(state.css || ''),
    js: String(state.js || ''),
    interactions: Array.isArray(state.interactions)
      ? structuredClone(state.interactions)
      : [],
    settings: Object.assign(
      {
        dir: 'rtl',
        lang: 'ar',
        title:
          manager.baseName(filePath || 'index.html').replace(/\.html?$/i, '') ||
          'صفحة جديدة',
        description: ''
      },
      state.settings || {}
    ),
    links: Array.isArray(state.links) ? [...new Set(state.links)] : [],
    references: Object.assign(
      { styles: [], scripts: [] },
      state.references || {}
    )
  };
}

export function createCodeFile(manager, filePath, kind, content = '') {
  return {
    id: manager.uid('file'),
    path: manager.normalizePath(filePath),
    kind,
    content: String(content || '')
  };
}

export function createAssetFile(manager, filePath, dataUrl, mime = '') {
  return {
    id: manager.uid('file'),
    path: manager.normalizePath(filePath),
    kind: 'asset',
    content: '',
    dataUrl: String(dataUrl || ''),
    mime: String(mime || '')
  };
}

export function repairWorkspace(manager) {
  const workspace = manager.workspace;
  workspace.version = WORKSPACE_SCHEMA_VERSION;
  workspace.projects = workspace.projects.filter(
    project => project && Array.isArray(project.files)
  );

  if (!workspace.projects.length) {
    const blank = manager.createHtmlFile('index.html', {
      content: '<main><h1>مشروع جديد</h1></main>'
    });
    workspace.projects.push(manager.createProject('مشروع جديد', [blank]));
  }

  workspace.projects.forEach(project => {
    project.id ||= manager.uid('project');
    project.name = String(project.name || 'مشروع').trim() || 'مشروع';
    project.files = project.files.filter(Boolean).map(file => {
      file.id ||= manager.uid('file');
      file.path = manager.normalizePath(
        file.path || `file-${Date.now()}.txt`
      );
      file.kind ||= manager.kindFromPath(file.path);

      if (file.kind === 'html') {
        file.content = String(file.content || '');
        file.css = String(file.css || '');
        file.js = String(file.js || '');
        file.interactions = Array.isArray(file.interactions)
          ? structuredClone(file.interactions)
          : [];
        file.settings = Object.assign(
          {
            dir: 'rtl',
            lang: 'ar',
            title: manager.baseName(file.path),
            description: ''
          },
          file.settings || {}
        );
        file.links = Array.isArray(file.links)
          ? [...new Set(file.links)]
          : [];
        file.references = Object.assign(
          { styles: [], scripts: [] },
          file.references || {}
        );
      } else {
        file.content = String(file.content || '');
      }
      return file;
    });

    let firstPage = project.files.find(file => file.kind === 'html');
    if (!firstPage) {
      firstPage = manager.createHtmlFile('index.html', {
        content: '<main><h1>صفحة جديدة</h1></main>'
      });
      project.files.unshift(firstPage);
    }

    if (
      !project.files.some(
        file => file.id === project.lastPageId && file.kind === 'html'
      )
    ) {
      project.lastPageId = firstPage.id;
    }
    if (!project.files.some(file => file.id === project.activeFileId)) {
      project.activeFileId = project.lastPageId;
    }
    manager.resolveProjectReferences(project);
  });

  if (
    !workspace.projects.some(
      project => project.id === workspace.activeProjectId
    )
  ) {
    workspace.activeProjectId = workspace.projects[0].id;
  }

  return workspace;
}

export const workspaceModelService = Object.freeze({
  schemaVersion: WORKSPACE_SCHEMA_VERSION,
  createAssetFile,
  createCodeFile,
  createHtmlFile,
  createProject,
  repairWorkspace
});
