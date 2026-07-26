/* Multi-project and multi-file workspace for Osoos. */

import JSZip from 'jszip';

class ProjectManager {
  constructor(app) {
    this.app = app;
    this.storageKey = 'osoos-project-workspace-v1';
    this.workspace = null;
    this.isSwitching = false;
    this.activeExternalFileId = null;
    this.directoryHandles = new Map();
    this.fileHandles = new Map();
    this.maxImportedFiles = 400;
    this.supportedTextExtensions = new Set([
      'html', 'htm', 'css', 'js', 'mjs', 'cjs', 'json', 'txt', 'md', 'xml',
      'csv', 'webmanifest', 'map', 'yaml', 'yml'
    ]);
    this.supportedAssetExtensions = new Set([
      'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'avif',
      'woff', 'woff2', 'ttf', 'otf', 'eot', 'mp3', 'wav', 'ogg', 'mp4', 'webm'
    ]);
  }

  init() {
    this.injectInterface();
    this.bindInterface();
    this.ensureLinkedStyleTag();

    const legacyPage = this.createHtmlFile('index.html', {
      content: this.app.getPersistentCanvasHTML(),
      css: this.app.editor.customCSS || '',
      js: this.app.editor.customJS || '',
      interactions: typeof this.app.editor.getInteractionDefinitions === 'function'
        ? this.app.editor.getInteractionDefinitions()
        : [],
      settings: Object.assign({}, this.app.getPageSettings())
    });

    this.workspace = this.loadWorkspace();
    if (!this.workspace || !Array.isArray(this.workspace.projects) || this.workspace.projects.length === 0) {
      const project = this.createProject('مشروعي الأول', [legacyPage]);
      this.workspace = { version: 1, activeProjectId: project.id, projects: [project] };
    }

    this.repairWorkspace();
    this.activateProject(this.workspace.activeProjectId, { initial: true });
    this.persistWorkspace();

    window.addEventListener('beforeunload', () => {
      this.captureWorkspaceState();
      this.persistWorkspace();
    });

    document.addEventListener('keydown', event => {
      if (!(event.ctrlKey || event.metaKey) || String(event.key).toLowerCase() !== 's') return;
      event.preventDefault();
      this.captureWorkspaceState();
      this.persistWorkspace();
      const handle = this.directoryHandles.get(this.project.id);
      if (handle) this.saveProjectToFolder();
      else this.notice('تم حفظ المشروع محليًا — استخدم «حفظ في مجلد» لكتابته على جهازك');
    });
  }

  get project() {
    if (!this.workspace) return null;
    return this.workspace.projects.find(item => item.id === this.workspace.activeProjectId) || null;
  }

  uid(prefix = 'file') {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  createProject(name, files = []) {
    const model = window.OsoosReactServices && window.OsoosReactServices.projects;
    if (model && typeof model.createProject === 'function') {
      return model.createProject(this, name, files);
    }
    const htmlFile = files.find(file => file.kind === 'html');
    return {
      id: this.uid('project'),
      name: String(name || 'مشروع جديد').trim() || 'مشروع جديد',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files,
      activeFileId: htmlFile ? htmlFile.id : (files[0] ? files[0].id : null),
      lastPageId: htmlFile ? htmlFile.id : null
    };
  }

  createHtmlFile(path, state = {}) {
    const model = window.OsoosReactServices && window.OsoosReactServices.projects;
    if (model && typeof model.createHtmlFile === 'function') {
      return model.createHtmlFile(this, path, state);
    }
    return {
      id: this.uid('file'),
      path: this.normalizePath(path || 'index.html'),
      kind: 'html',
      content: String(state.content || ''),
      css: String(state.css || ''),
      js: String(state.js || ''),
      interactions: Array.isArray(state.interactions) ? structuredClone(state.interactions) : [],
      settings: Object.assign({
        dir: 'rtl',
        lang: 'ar',
        title: this.baseName(path || 'index.html').replace(/\.html?$/i, '') || 'صفحة جديدة',
        description: ''
      }, state.settings || {}),
      links: Array.isArray(state.links) ? Array.from(new Set(state.links)) : [],
      references: Object.assign({ styles: [], scripts: [] }, state.references || {})
    };
  }

  createCodeFile(path, kind, content = '') {
    const model = window.OsoosReactServices && window.OsoosReactServices.projects;
    if (model && typeof model.createCodeFile === 'function') {
      return model.createCodeFile(this, path, kind, content);
    }
    return {
      id: this.uid('file'),
      path: this.normalizePath(path),
      kind,
      content: String(content || '')
    };
  }

  createAssetFile(path, dataUrl, mime = '') {
    const model = window.OsoosReactServices && window.OsoosReactServices.projects;
    if (model && typeof model.createAssetFile === 'function') {
      return model.createAssetFile(this, path, dataUrl, mime);
    }
    return {
      id: this.uid('file'),
      path: this.normalizePath(path),
      kind: 'asset',
      content: '',
      dataUrl: String(dataUrl || ''),
      mime: String(mime || '')
    };
  }

  repairWorkspace() {
    const model = window.OsoosReactServices && window.OsoosReactServices.projects;
    if (model && typeof model.repairWorkspace === 'function') {
      model.repairWorkspace(this);
      return;
    }
    this.workspace.version = 1;
    this.workspace.projects = this.workspace.projects.filter(project => project && Array.isArray(project.files));
    if (!this.workspace.projects.length) {
      const blank = this.createHtmlFile('index.html', { content: '<main><h1>مشروع جديد</h1></main>' });
      this.workspace.projects.push(this.createProject('مشروع جديد', [blank]));
    }

    this.workspace.projects.forEach(project => {
      project.id = project.id || this.uid('project');
      project.name = String(project.name || 'مشروع').trim() || 'مشروع';
      project.files = project.files.filter(Boolean).map(file => {
        file.id = file.id || this.uid('file');
        file.path = this.normalizePath(file.path || `file-${Date.now()}.txt`);
        file.kind = file.kind || this.kindFromPath(file.path);
        if (file.kind === 'html') {
          file.content = String(file.content || '');
          file.css = String(file.css || '');
          file.js = String(file.js || '');
          file.settings = Object.assign({ dir: 'rtl', lang: 'ar', title: this.baseName(file.path), description: '' }, file.settings || {});
          file.links = Array.isArray(file.links) ? Array.from(new Set(file.links)) : [];
          file.references = Object.assign({ styles: [], scripts: [] }, file.references || {});
        } else {
          file.content = String(file.content || '');
        }
        return file;
      });

      let firstPage = project.files.find(file => file.kind === 'html');
      if (!firstPage) {
        firstPage = this.createHtmlFile('index.html', { content: '<main><h1>صفحة جديدة</h1></main>' });
        project.files.unshift(firstPage);
      }
      if (!project.files.some(file => file.id === project.lastPageId && file.kind === 'html')) project.lastPageId = firstPage.id;
      if (!project.files.some(file => file.id === project.activeFileId)) project.activeFileId = project.lastPageId;
      this.resolveProjectReferences(project);
    });

    if (!this.workspace.projects.some(project => project.id === this.workspace.activeProjectId)) {
      this.workspace.activeProjectId = this.workspace.projects[0].id;
    }
  }

  loadWorkspace() {
    const storageService = window.OsoosReactServices && window.OsoosReactServices.storage;
    if (storageService && typeof storageService.readWorkspace === 'function') {
      const result = storageService.readWorkspace(this.storageKey);
      if (!result.corrupt) return result.workspace;

      console.warn('تعذر تحميل مساحة المشاريع.', result.error);
      this._workspaceStorageLocked = result.storageLocked;
      this.notice(
        result.backupSaved
          ? 'ملف المشاريع تالف. حُفظت نسخة احتياطية منه قبل إنشاء مساحة جديدة.'
          : 'ملف المشاريع تالف وتعذر نسخه احتياطيًا. لن تتم الكتابة فوقه؛ صدّره أو حرّر مساحة التخزين أولًا.',
        9000
      );
      return null;
    }

    let raw = null;
    try {
      raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('تعذر تحميل مساحة المشاريع.', error);
      let backupSaved = false;
      try {
        localStorage.setItem(this.storageKey + '-corrupt-backup', raw);
        backupSaved = true;
      } catch (backupError) {
        console.warn('تعذر حفظ نسخة احتياطية من مساحة المشاريع التالفة.', backupError);
        // Keep the corrupt primary value intact if there is no durable backup.
        this._workspaceStorageLocked = true;
      }
      this.notice(
        backupSaved
          ? 'ملف المشاريع تالف. حُفظت نسخة احتياطية منه قبل إنشاء مساحة جديدة.'
          : 'ملف المشاريع تالف وتعذر نسخه احتياطيًا. لن تتم الكتابة فوقه؛ صدّره أو حرّر مساحة التخزين أولًا.',
        9000
      );
      return null;
    }
  }

  persistWorkspace() {
    if (!this.workspace) return;
    if (this._workspaceStorageLocked) {
      if (!this._corruptStorageNoticeShown) {
        this._corruptStorageNoticeShown = true;
        this.notice('الحفظ المحلي متوقف لحماية ملف المشاريع التالف من الكتابة فوقه.', 9000);
      }
      return;
    }
    try {
      if (this.project) this.project.updatedAt = Date.now();
      const storageService = window.OsoosReactServices && window.OsoosReactServices.storage;
      if (storageService && typeof storageService.writeWorkspace === 'function') {
        storageService.writeWorkspace(this.workspace, this.storageKey);
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(this.workspace));
      }
    } catch (error) {
      console.warn('تعذر حفظ مساحة المشاريع.', error);
      if (!this._storageFailureNotified) {
        this._storageFailureNotified = true;
        this.notice('تعذر حفظ كل ملفات المشروع محليًا؛ قد تكون الملفات كبيرة. احفظ المشروع في مجلد أو صدّره الآن', 7000);
        setTimeout(() => { this._storageFailureNotified = false; }, 30000);
      }
    }
  }

  saveFromEditor() {
    if (this.isSwitching || !this.project) return;
    this.captureWorkspaceState();
    this.persistWorkspace();
    this.render();
  }

  captureWorkspaceState() {
    if (this.isSwitching || !this.project) return;
    this.captureActivePage();
    const external = this.getActiveEditableFile();
    if (external && this.app.editor && this.app.editor.textarea) {
      external.content = this.app.editor.textarea.value;
    }
  }

  captureActivePage() {
    const project = this.project;
    if (!project || !project.lastPageId) return;
    const page = project.files.find(file => file.id === project.lastPageId && file.kind === 'html');
    if (!page || !this.app.canvas || !this.app.editor) return;
    page.content = this.app.getPersistentCanvasHTML();
    page.css = this.app.editor.customCSS || '';
    page.js = this.app.editor.customJS || '';
    page.interactions = typeof this.app.editor.getInteractionDefinitions === 'function'
      ? this.app.editor.getInteractionDefinitions()
      : [];
    page.settings = Object.assign({}, this.app.getPageSettings());
  }

  activateProject(projectId, options = {}) {
    if (!options.initial) {
      this.captureWorkspaceState();
      this.persistWorkspace();
    }
    const target = this.workspace.projects.find(project => project.id === projectId) || this.workspace.projects[0];
    if (!target) return;

    this.workspace.activeProjectId = target.id;
    const desiredFile = target.files.find(file => file.id === target.activeFileId);
    const page = desiredFile && desiredFile.kind === 'html'
      ? desiredFile
      : target.files.find(file => file.id === target.lastPageId && file.kind === 'html') || target.files.find(file => file.kind === 'html');

    this.loadPageIntoBuilder(page, { keepActiveFile: !!(desiredFile && desiredFile.kind !== 'html') });
    if (desiredFile && desiredFile.kind !== 'html') this.openExternalFile(desiredFile, { skipCapture: true });
    this.render();
    this.persistWorkspace();
  }

  openFile(fileId) {
    const file = this.project && this.project.files.find(item => item.id === fileId);
    if (!file) return;
    if (this.app.editor && typeof this.app.editor.flushPendingEditorInput === 'function') {
      this.app.editor.flushPendingEditorInput();
    }
    this.captureWorkspaceState();
    if (file.kind === 'html') this.loadPageIntoBuilder(file);
    else if (file.kind === 'asset') {
      this.project.activeFileId = file.id;
      this.activeExternalFileId = null;
      this.render();
      this.notice('هذا ملف وسائط محفوظ داخل المشروع وسيتم تضمينه عند الحفظ أو التصدير');
    } else this.openExternalFile(file);
    this.persistWorkspace();
  }

  loadPageIntoBuilder(page, options = {}) {
    if (!page) return;
    this.isSwitching = true;
    try {
      this.project.lastPageId = page.id;
      if (!options.keepActiveFile) this.project.activeFileId = page.id;
      this.activeExternalFileId = null;
      this.app.selectElement(null);
      this.app.canvas.innerHTML = this.app.sanitizeRestoredHtml(page.content || '');
      this.app.editor.customCSS = page.css || '';
      this.app.editor.customJS = page.js || '';
      if (typeof this.app.editor.setInteractionDefinitions === 'function') {
        const migrated = this.app.editor.setInteractionDefinitions(page.interactions || []);
        page.interactions = this.app.editor.getInteractionDefinitions();
        if (migrated) page.js = this.app.editor.customJS;
      } else {
        this.app.editor.interactionDefinitions = Array.isArray(page.interactions)
          ? structuredClone(page.interactions)
          : [];
      }
      this.app.pageSettings = Object.assign({}, page.settings || {});
      this.applyPageSettingControls();
      this.app.applyCustomCSS(this.app.editor.customCSS);
      this.updateLinkedPreview();
      this.app.reattachCanvasListeners();
      if (this.app.domTree) this.app.domTree.render();
      this.setEditorLanguage('html');
      this.app.editor.refreshEditorContent();
      ['scanAndRenderVariables', 'renderBlocksDashboard', 'renderVisualLinksDashboard'].forEach(method => {
        try {
          if (typeof this.app.editor[method] === 'function') this.app.editor[method]();
        } catch (error) {
          console.warn(`تعذر تحديث ${method} عند تبديل الصفحة.`, error);
        }
      });
      if (this.app.history) {
        this.app.history.undoStack = [];
        this.app.history.redoStack = [];
        this.app.history.updateButtons();
      }
      if (typeof this.app.setWorkspaceMode === 'function') this.app.setWorkspaceMode('designer');
    } finally {
      this.isSwitching = false;
    }
    if (this.app.history) this.app.history.saveState('Open project page');
    this.updateEditorBadge();
    this.render();
  }

  openExternalFile(file, options = {}) {
    if (!file || file.kind === 'html' || file.kind === 'asset') return;
    if (!options.skipCapture) this.captureWorkspaceState();
    this.project.activeFileId = file.id;
    this.activeExternalFileId = file.id;
    this.setEditorLanguage(file.kind === 'css' || file.kind === 'js' ? file.kind : 'text');
    this.app.editor.textarea.value = file.content || '';
    this.app.editor.updateLineNumbers();
    if (typeof this.app.setWorkspaceMode === 'function') this.app.setWorkspaceMode('code');
    this.updateEditorBadge();
    this.render();
  }

  getActiveEditableFile() {
    if (!this.project || !this.activeExternalFileId) return null;
    const file = this.project.files.find(item => item.id === this.activeExternalFileId);
    return file && file.kind !== 'html' && file.kind !== 'asset' ? file : null;
  }

  handleLanguageTabRequest(language) {
    const external = this.getActiveEditableFile();
    if (!external) return false;
    const externalLanguage = external.kind === 'css' || external.kind === 'js' ? external.kind : 'text';
    if (externalLanguage === language) return false;
    external.content = this.app.editor.textarea.value;
    this.activeExternalFileId = null;
    this.project.activeFileId = this.project.lastPageId;
    this.updateLinkedPreview();
    this.updateEditorBadge();
    this.render();
    this.persistWorkspace();
    return false;
  }

  syncActiveExternalFile(value, language) {
    const file = this.getActiveEditableFile();
    if (!file) return false;
    const expectedLanguage = file.kind === 'css' || file.kind === 'js' ? file.kind : 'text';
    if (language !== expectedLanguage) return false;
    file.content = String(value || '');
    if (file.kind === 'css') this.updateLinkedPreview();
    this.persistWorkspace();
    return true;
  }

  setEditorLanguage(language) {
    this.app.editor.currentLanguage = language;
    this.app.editor.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.lang === language));
  }

  applyPageSettingControls() {
    this.app.applyPageSettingsToCanvas();
    const settings = this.app.getPageSettings();
    const dirSegment = document.getElementById('page-dir-segmented');
    if (dirSegment) dirSegment.querySelectorAll('.segment-btn').forEach(button => {
      const active = button.dataset.val === settings.dir;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const language = document.getElementById('page-lang-select');
    const title = document.getElementById('page-title-input');
    const description = document.getElementById('page-desc-input');
    if (language) language.value = settings.lang;
    if (title) title.value = settings.title;
    if (description) description.value = settings.description || '';
  }

  ensureLinkedStyleTag() {
    this.linkedStyleTag = document.getElementById('project-linked-styles');
    if (!this.linkedStyleTag) {
      this.linkedStyleTag = document.createElement('style');
      this.linkedStyleTag.id = 'project-linked-styles';
      document.head.appendChild(this.linkedStyleTag);
    }
  }

  updateLinkedPreview() {
    this.ensureLinkedStyleTag();
    const linkedCss = this.getLinkedContent('css');
    this.linkedStyleTag.textContent = this.app && typeof this.app.scopeCssForCanvas === 'function'
      ? this.app.scopeCssForCanvas(linkedCss)
      : linkedCss;
    setTimeout(() => this.app.updateHighlighter(), 80);
  }

  getLinkedContent(kind) {
    const project = this.project;
    if (!project || !project.lastPageId) return '';
    const page = project.files.find(file => file.id === project.lastPageId && file.kind === 'html');
    if (!page) return '';
    return (page.links || [])
      .map(id => project.files.find(file => file.id === id && file.kind === kind))
      .filter(Boolean)
      .map(file => `/* ${file.path} */\n${file.content || ''}`)
      .join('\n\n');
  }

  toggleFileLink(fileId, forceState) {
    const page = this.getActivePage();
    const file = this.project && this.project.files.find(item => item.id === fileId);
    if (!page || !file || (file.kind !== 'css' && file.kind !== 'js')) return;
    page.links = Array.isArray(page.links) ? page.links : [];
    const isLinked = page.links.includes(file.id);
    const shouldLink = typeof forceState === 'boolean' ? forceState : !isLinked;
    if (shouldLink && !isLinked) page.links.push(file.id);
    if (!shouldLink && isLinked) page.links = page.links.filter(id => id !== file.id);
    this.updateLinkedPreview();
    this.persistWorkspace();
    this.render();
  }

  getActivePage() {
    if (!this.project) return null;
    return this.project.files.find(file => file.id === this.project.lastPageId && file.kind === 'html') || null;
  }

  injectInterface() {
    if (document.getElementById('project-drawer-backdrop')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="project-drawer-backdrop" id="project-drawer-backdrop" aria-hidden="true">
        <aside class="project-drawer" role="dialog" aria-label="ملفات المشروع">
          <div class="project-drawer-header">
            <div class="project-drawer-header-top">
              <div class="project-drawer-title"><i class="fas fa-folder-tree"></i><span>مساحة المشاريع والملفات</span></div>
              <button type="button" class="project-icon-btn" id="project-drawer-close" title="إغلاق"><i class="fas fa-xmark"></i></button>
            </div>
            <select class="project-select" id="project-select" aria-label="المشروع الحالي"></select>
          </div>
          <div class="project-toolbar">
            <button type="button" class="btn btn-primary" id="project-new-btn"><i class="fas fa-folder-plus"></i> مشروع جديد</button>
            <button type="button" class="btn btn-secondary" id="project-new-file-btn"><i class="fas fa-file-circle-plus"></i> ملف جديد</button>
            <button type="button" class="btn btn-secondary" id="project-open-file-btn"><i class="fas fa-file-import"></i> فتح ملفات</button>
            <button type="button" class="btn btn-secondary" id="project-open-folder-btn"><i class="fas fa-folder-open"></i> فتح مجلد</button>
            <button type="button" class="btn btn-secondary btn-wide" id="project-save-folder-btn"><i class="fas fa-floppy-disk"></i> حفظ المشروع في مجلد</button>
          </div>
          <div class="project-path-row"><span>مكان المشروع</span><code id="project-location-label">ذاكرة المتصفح المحلية</code></div>
          <div class="project-files-list" id="project-files-list"></div>
          <div class="project-drawer-footer">
            <div class="project-link-summary" id="project-link-summary"><i class="fas fa-link"></i><span>لا توجد ملفات مرتبطة بالصفحة</span></div>
            <button type="button" class="btn btn-secondary" id="project-manage-links-btn" style="margin-top: 9px;"><i class="fas fa-link"></i> ربط الملفات والصفحات</button>
          </div>
        </aside>
      </div>
      <div class="project-modal-backdrop" id="project-modal-backdrop" aria-hidden="true">
        <div class="project-modal" id="project-modal" role="dialog" aria-modal="true"></div>
      </div>
      <input type="file" id="project-open-file-input" multiple hidden
        accept=".html,.htm,.css,.js,.mjs,.cjs,.json,.txt,.md,.xml,.csv,.webmanifest,.yaml,.yml,.png,.jpg,.jpeg,.gif,.webp,.svg,.ico,.avif,.woff,.woff2,.ttf,.otf,.eot,.mp3,.wav,.ogg,.mp4,.webm">
      <input type="file" id="project-open-folder-input" webkitdirectory directory multiple hidden>
    `);

    const indicator = document.querySelector('.editor-sync-indicator');
    if (indicator && !document.getElementById('project-editor-file-badge')) {
      const badge = document.createElement('span');
      badge.id = 'project-editor-file-badge';
      badge.className = 'project-editor-file-badge';
      indicator.prepend(badge);
    }
  }

  bindInterface() {
    const drawer = document.getElementById('project-drawer-backdrop');
    const modal = document.getElementById('project-modal-backdrop');
    document.getElementById('project-manager-btn').addEventListener('click', () => this.openDrawer());
    document.getElementById('project-drawer-close').addEventListener('click', () => this.closeDrawer());
    drawer.addEventListener('click', event => {
      if (event.target === drawer) this.closeDrawer();
    });
    modal.addEventListener('click', event => {
      if (event.target === modal) this.closeModal();
    });
    document.getElementById('project-select').addEventListener('change', event => this.activateProject(event.target.value));
    document.getElementById('project-new-btn').addEventListener('click', () => this.showNewProjectDialog());
    document.getElementById('project-new-file-btn').addEventListener('click', () => this.showNewFileDialog());
    document.getElementById('project-open-file-btn').addEventListener('click', () => this.chooseFiles());
    document.getElementById('project-open-folder-btn').addEventListener('click', () => this.chooseFolder());
    document.getElementById('project-save-folder-btn').addEventListener('click', () => this.saveProjectToFolder());
    document.getElementById('project-manage-links-btn').addEventListener('click', () => this.showLinksDialog());
    document.getElementById('project-open-file-input').addEventListener('change', async event => {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (files.length) await this.importFilesIntoCurrentProject(files);
    });
    document.getElementById('project-open-folder-input').addEventListener('change', async event => {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (files.length) await this.importFolderFiles(files);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (modal.classList.contains('open')) this.closeModal();
      else if (drawer.classList.contains('open')) this.closeDrawer();
    });
  }

  openDrawer() {
    const drawer = document.getElementById('project-drawer-backdrop');
    this.captureWorkspaceState();
    this.render();
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  closeDrawer() {
    const drawer = document.getElementById('project-drawer-backdrop');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  render() {
    if (!this.workspace || !this.project) return;
    const select = document.getElementById('project-select');
    const previousValue = select.value;
    select.replaceChildren();
    this.workspace.projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      option.selected = project.id === this.workspace.activeProjectId;
      select.appendChild(option);
    });
    if (previousValue && this.workspace.projects.some(project => project.id === previousValue) && !select.value) select.value = previousValue;

    const headerLabel = document.getElementById('active-project-label');
    if (headerLabel) headerLabel.textContent = this.project.name;
    const activeHeaderFile = document.getElementById('header-active-file-label');
    const activeFile = this.project.files.find(file => file.id === this.project.activeFileId) || this.getActivePage();
    if (activeHeaderFile) activeHeaderFile.textContent = activeFile ? `- ${activeFile.path}` : '';
    const location = document.getElementById('project-location-label');
    const directoryHandle = this.directoryHandles.get(this.project.id);
    location.textContent = directoryHandle ? directoryHandle.name : 'ذاكرة المتصفح المحلية';

    const list = document.getElementById('project-files-list');
    list.replaceChildren();
    const files = [...this.project.files].sort((a, b) => a.path.localeCompare(b.path, 'en'));
    const activePage = this.getActivePage();
    files.forEach(file => list.appendChild(this.createFileRow(file, activePage)));
    if (!files.length) {
      const empty = document.createElement('div');
      empty.className = 'project-files-empty';
      empty.textContent = 'لا توجد ملفات بعد. أنشئ ملفًا جديدًا أو افتح ملفات من جهازك.';
      list.appendChild(empty);
    }

    const linkedCount = activePage ? (activePage.links || []).filter(id => this.project.files.some(file => file.id === id)).length : 0;
    const summary = document.getElementById('project-link-summary');
    const summaryText = summary.querySelector('span');
    summaryText.textContent = activePage
      ? `${this.baseName(activePage.path)} مرتبطة بـ ${linkedCount} ملف${linkedCount === 1 ? '' : 'ات'}`
      : 'لا توجد صفحة HTML نشطة';
    document.getElementById('project-manage-links-btn').disabled = !activePage;
    this.updateEditorBadge();
  }

  createFileRow(file, activePage) {
    const row = document.createElement('div');
    const linked = !!(activePage && (activePage.links || []).includes(file.id));
    row.className = `project-file-row${this.project.activeFileId === file.id ? ' active' : ''}${linked ? ' linked' : ''}`;

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'project-file-main';
    main.title = `فتح ${file.path}`;
    main.addEventListener('click', () => this.openFile(file.id));

    const icon = document.createElement('i');
    icon.className = `project-file-icon ${this.iconForFile(file)}`;
    const copy = document.createElement('span');
    copy.className = 'project-file-copy';
    const name = document.createElement('span');
    name.className = 'project-file-name';
    name.textContent = this.baseName(file.path);
    const path = document.createElement('span');
    path.className = 'project-file-path';
    path.textContent = file.path;
    copy.append(name, path);
    main.append(icon, copy);

    const actions = document.createElement('div');
    actions.className = 'project-file-actions';
    if (file.kind === 'css' || file.kind === 'js') {
      actions.appendChild(this.actionButton(linked ? 'fas fa-link' : 'fas fa-link-slash', linked ? 'إلغاء ربط الملف بالصفحة' : 'ربط الملف بالصفحة', () => this.toggleFileLink(file.id), linked));
    }
    actions.appendChild(this.actionButton('fas fa-copy', 'نسخ مسار الملف', () => this.copyFilePath(file.path)));
    actions.appendChild(this.actionButton('fas fa-pen', 'إعادة تسمية الملف', () => this.showRenameDialog(file)));
    actions.appendChild(this.actionButton('fas fa-trash', 'حذف الملف من المشروع', () => this.deleteFile(file), false, true));
    row.append(main, actions);
    return row;
  }

  actionButton(iconClass, title, action, active = false, danger = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `project-icon-btn${active ? ' active' : ''}${danger ? ' danger' : ''}`;
    button.title = title;
    const icon = document.createElement('i');
    icon.className = iconClass;
    button.appendChild(icon);
    button.addEventListener('click', event => {
      event.stopPropagation();
      action();
    });
    return button;
  }

  iconForFile(file) {
    if (file.kind === 'html') return 'fab fa-html5';
    if (file.kind === 'css') return 'fab fa-css3-alt';
    if (file.kind === 'js') return 'fab fa-js-square';
    if (file.kind === 'asset') return 'fas fa-image';
    return 'fas fa-file-code';
  }

  updateEditorBadge() {
    const badge = document.getElementById('project-editor-file-badge');
    if (!badge || !this.project) return;
    const active = this.project.files.find(file => file.id === this.project.activeFileId);
    const page = this.getActivePage();
    badge.textContent = active ? active.path : (page ? page.path : '');
    badge.title = active ? active.path : '';
  }

  showNewProjectDialog() {
    const nameInput = document.createElement('input');
    nameInput.name = 'project-name';
    nameInput.placeholder = 'مثال: موقع الشركة';
    nameInput.value = `مشروع ${this.workspace.projects.length + 1}`;
    this.openFormModal({
      title: 'إنشاء مشروع جديد',
      description: 'سيبقى المشروع الحالي محفوظًا ويمكنك الرجوع إليه من قائمة المشاريع.',
      fields: [{ label: 'اسم المشروع', control: nameInput }],
      submitLabel: 'إنشاء المشروع',
      onSubmit: () => {
        const name = nameInput.value.trim();
        if (!name) throw new Error('اكتب اسمًا للمشروع');
        this.captureWorkspaceState();
        const page = this.createHtmlFile('index.html', {
          content: '<main><h1>مرحبًا بك في مشروعك الجديد</h1></main>',
          settings: { title: name, dir: 'rtl', lang: 'ar', description: '' }
        });
        const project = this.createProject(name, [page]);
        this.workspace.projects.push(project);
        this.workspace.activeProjectId = project.id;
        this.loadPageIntoBuilder(page);
        this.persistWorkspace();
        this.render();
        this.notice(`تم إنشاء مشروع «${name}»`);
      }
    });
  }

  showNewFileDialog() {
    const nameInput = document.createElement('input');
    nameInput.name = 'file-name';
    nameInput.placeholder = 'مثال: pages/about.html أو css/theme.css';
    nameInput.value = 'page.html';
    nameInput.dir = 'ltr';
    const typeSelect = document.createElement('select');
    [
      ['html', 'صفحة HTML'],
      ['css', 'ملف CSS'],
      ['js', 'ملف JavaScript'],
      ['text', 'ملف نصي / JSON']
    ].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      typeSelect.appendChild(option);
    });
    typeSelect.addEventListener('change', () => {
      const defaults = { html: 'page.html', css: 'styles.css', js: 'script.js', text: 'data.json' };
      nameInput.value = defaults[typeSelect.value];
    });

    this.openFormModal({
      title: 'إنشاء ملف جديد',
      description: 'يمكنك إنشاء أي عدد من الملفات، واستخدام مجلدات فرعية داخل الاسم.',
      fields: [
        { label: 'نوع الملف', control: typeSelect },
        { label: 'اسم الملف أو مساره', control: nameInput }
      ],
      submitLabel: 'إنشاء وفتح',
      onSubmit: () => {
        const kind = typeSelect.value;
        let path = this.normalizePath(nameInput.value);
        if (!path) throw new Error('اكتب اسم الملف');
        path = this.ensureExtension(path, kind);
        if (this.project.files.some(file => file.path.toLowerCase() === path.toLowerCase())) {
          throw new Error('يوجد ملف بهذا المسار بالفعل');
        }
        let file;
        if (kind === 'html') {
          file = this.createHtmlFile(path, {
            content: '<main><h1>صفحة جديدة</h1></main>',
            settings: { title: this.baseName(path).replace(/\.html?$/i, ''), dir: 'rtl', lang: 'ar', description: '' }
          });
        } else {
          const templates = {
            css: '/* تنسيقات الملف */\n',
            js: '// كود JavaScript للملف\n',
            text: path.toLowerCase().endsWith('.json') ? '{\n  \n}\n' : ''
          };
          file = this.createCodeFile(path, kind, templates[kind]);
        }
        this.project.files.push(file);
        const activePage = this.getActivePage();
        if (activePage && (kind === 'css' || kind === 'js')) activePage.links.push(file.id);
        this.openFile(file.id);
        this.updateLinkedPreview();
        this.persistWorkspace();
        this.notice(`تم إنشاء ${path}`);
      }
    });
  }

  showRenameDialog(file) {
    const input = document.createElement('input');
    input.value = file.path;
    input.dir = 'ltr';
    this.openFormModal({
      title: 'إعادة تسمية الملف',
      description: 'يمكنك أيضًا نقله إلى مجلد فرعي بتغيير المسار.',
      fields: [{ label: 'المسار الجديد', control: input }],
      submitLabel: 'حفظ الاسم',
      onSubmit: () => {
        const nextPath = this.normalizePath(input.value);
        if (!nextPath) throw new Error('المسار غير صالح');
        if (this.project.files.some(item => item.id !== file.id && item.path.toLowerCase() === nextPath.toLowerCase())) {
          throw new Error('يوجد ملف بهذا المسار بالفعل');
        }
        const oldPath = file.path;
        file.path = nextPath;
        const handleKey = `${this.project.id}:${oldPath}`;
        if (this.fileHandles.has(handleKey)) {
          this.fileHandles.set(`${this.project.id}:${nextPath}`, this.fileHandles.get(handleKey));
          this.fileHandles.delete(handleKey);
        }
        this.persistWorkspace();
        this.render();
        this.notice(`تم تغيير المسار إلى ${nextPath}`);
      }
    });
  }

  openFormModal(config) {
    const modal = document.getElementById('project-modal');
    modal.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = config.title;
    const description = document.createElement('p');
    description.className = 'project-modal-description';
    description.textContent = config.description || '';
    const form = document.createElement('form');
    config.fields.forEach(field => {
      const label = document.createElement('label');
      label.className = 'project-form-field';
      const span = document.createElement('span');
      span.textContent = field.label;
      label.append(span, field.control);
      form.appendChild(label);
    });
    const error = document.createElement('div');
    error.style.cssText = 'display:none;color:var(--accent-red);font-size:11px;margin-top:8px;';
    const actions = document.createElement('div');
    actions.className = 'project-modal-actions';
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'btn btn-primary';
    submit.textContent = config.submitLabel || 'حفظ';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-secondary';
    cancel.textContent = 'إلغاء';
    cancel.addEventListener('click', () => this.closeModal());
    actions.append(submit, cancel);
    form.append(error, actions);
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        config.onSubmit();
        this.closeModal();
      } catch (formError) {
        error.textContent = formError.message || 'تعذر إكمال العملية';
        error.style.display = 'block';
      }
    });
    modal.append(title, description, form);
    this.openModal();
    setTimeout(() => {
      const firstControl = config.fields[0] && config.fields[0].control;
      if (firstControl) firstControl.focus();
    });
  }

  showLinksDialog() {
    const page = this.getActivePage();
    if (!page) return;
    this.captureActivePage();
    const modal = document.getElementById('project-modal');
    modal.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = `ربط الملفات مع ${this.baseName(page.path)}`;
    const description = document.createElement('p');
    description.className = 'project-modal-description';
    description.textContent = 'ملفات CSS المرتبطة تعمل في المعاينة وتُضاف إلى <head>، وملفات JavaScript تُضاف قبل نهاية <body> عند المعاينة أو التصدير.';
    const list = document.createElement('div');
    list.className = 'project-link-list';
    const linkable = this.project.files.filter(file => file.kind === 'css' || file.kind === 'js');
    linkable.forEach(file => {
      const label = document.createElement('label');
      label.className = 'project-link-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = (page.links || []).includes(file.id);
      checkbox.addEventListener('change', () => this.toggleFileLink(file.id, checkbox.checked));
      const icon = document.createElement('i');
      icon.className = this.iconForFile(file);
      const copy = document.createElement('span');
      copy.className = 'project-link-option-copy';
      copy.textContent = file.path;
      const hint = document.createElement('small');
      hint.textContent = file.kind === 'css' ? '<link rel="stylesheet">' : '<script src="…">';
      copy.appendChild(hint);
      label.append(checkbox, icon, copy);
      list.appendChild(label);
    });
    if (!linkable.length) {
      const empty = document.createElement('div');
      empty.className = 'project-files-empty';
      empty.textContent = 'أنشئ ملف CSS أو JavaScript أولًا ليظهر هنا.';
      list.appendChild(empty);
    }

    const otherPages = this.project.files.filter(file => file.kind === 'html' && file.id !== page.id);
    if (otherPages.length) {
      const pagesTitle = document.createElement('h3');
      pagesTitle.className = 'project-pages-link-title';
      pagesTitle.textContent = 'ربط صفحات HTML ببعضها';
      list.appendChild(pagesTitle);
      otherPages.forEach(target => {
        const row = document.createElement('div');
        row.className = 'project-page-link-row';
        const path = document.createElement('code');
        path.textContent = target.path;
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'btn btn-outline';
        add.textContent = 'إضافة رابط للصفحة';
        add.addEventListener('click', () => this.insertPageLink(page, target));
        row.append(path, add);
        list.appendChild(row);
      });
    }

    const actions = document.createElement('div');
    actions.className = 'project-modal-actions';
    const done = document.createElement('button');
    done.type = 'button';
    done.className = 'btn btn-primary';
    done.textContent = 'تم';
    done.addEventListener('click', () => this.closeModal());
    actions.appendChild(done);
    modal.append(title, description, list, actions);
    this.openModal();
  }

  insertPageLink(sourcePage, targetPage) {
    if (this.getActivePage().id !== sourcePage.id) this.loadPageIntoBuilder(sourcePage);
    const link = document.createElement('a');
    link.href = this.relativePath(sourcePage.path, targetPage.path);
    link.textContent = targetPage.settings && targetPage.settings.title ? targetPage.settings.title : this.baseName(targetPage.path);
    this.app.canvas.appendChild(link);
    this.app.reattachCanvasListeners();
    this.app.syncAll();
    this.captureActivePage();
    this.persistWorkspace();
    this.notice(`تمت إضافة رابط إلى ${targetPage.path}`);
  }

  openModal() {
    const modal = document.getElementById('project-modal-backdrop');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  closeModal() {
    const modal = document.getElementById('project-modal-backdrop');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  deleteFile(file) {
    const htmlFiles = this.project.files.filter(item => item.kind === 'html');
    if (file.kind === 'html' && htmlFiles.length === 1) {
      this.notice('لا يمكن حذف صفحة HTML الوحيدة في المشروع');
      return;
    }
    if (!window.confirm(`هل تريد حذف «${file.path}» من المشروع؟`)) return;
    const wasActive = this.project.activeFileId === file.id;
    this.project.files = this.project.files.filter(item => item.id !== file.id);
    this.project.files.filter(item => item.kind === 'html').forEach(page => {
      page.links = (page.links || []).filter(id => id !== file.id);
    });
    if (file.id === this.project.lastPageId) {
      const nextPage = this.project.files.find(item => item.kind === 'html');
      this.project.lastPageId = nextPage.id;
      this.loadPageIntoBuilder(nextPage);
    } else if (wasActive) {
      this.project.activeFileId = this.project.lastPageId;
      this.activeExternalFileId = null;
      this.setEditorLanguage('html');
      this.app.editor.refreshEditorContent();
    }
    this.updateLinkedPreview();
    this.persistWorkspace();
    this.render();
    this.notice(`تم حذف ${file.path}`);
  }

  async chooseFiles() {
    if (typeof window.showOpenFilePicker !== 'function') {
      document.getElementById('project-open-file-input').click();
      return;
    }
    try {
      const handles = await window.showOpenFilePicker({
        multiple: true,
        types: [{
          description: 'ملفات مشروع الويب',
          accept: {
            'text/html': ['.html', '.htm'],
            'text/css': ['.css'],
            'text/javascript': ['.js', '.mjs', '.cjs'],
            'application/json': ['.json'],
            'text/plain': ['.txt', '.md', '.xml', '.csv', '.yaml', '.yml'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif']
          }
        }]
      });
      const entries = [];
      for (const handle of handles) entries.push({ file: await handle.getFile(), handle });
      await this.importFilesIntoCurrentProject(entries.map(entry => entry.file), entries);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.warn('تعذر استخدام منتقي الملفات الحديث، سيتم استخدام البديل.', error);
        document.getElementById('project-open-file-input').click();
      }
    }
  }

  async chooseFolder() {
    this.captureWorkspaceState();
    this.persistWorkspace();
    if (typeof window.showDirectoryPicker !== 'function') {
      document.getElementById('project-open-folder-input').click();
      return;
    }
    try {
      const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
      const entries = [];
      await this.collectDirectoryEntries(directory, '', entries);
      if (!entries.length) {
        this.notice('لم أجد ملفات ويب مدعومة داخل هذا المجلد');
        return;
      }
      const records = [];
      for (const entry of entries.slice(0, this.maxImportedFiles)) {
        const record = await this.recordFromBrowserFile(entry.file, entry.path);
        if (record) {
          records.push(record);
          this.fileHandles.set(`pending:${record.path}`, entry.handle);
        }
      }
      const project = this.createProject(directory.name, records);
      this.finishImportedProject(project);
      this.workspace.projects.push(project);
      this.workspace.activeProjectId = project.id;
      this.directoryHandles.set(project.id, directory);
      records.forEach(record => {
        const pending = this.fileHandles.get(`pending:${record.path}`);
        if (pending) {
          this.fileHandles.set(`${project.id}:${record.path}`, pending);
          this.fileHandles.delete(`pending:${record.path}`);
        }
      });
      this.activateProject(project.id, { initial: true });
      if (entries.length > this.maxImportedFiles) this.notice(`تم فتح أول ${this.maxImportedFiles} ملف لتجنب تجميد المتصفح`);
      else this.notice(`تم فتح المجلد «${directory.name}» وفيه ${records.length} ملف`);
    } catch (error) {
      if (error && error.name !== 'AbortError') this.notice(`تعذر فتح المجلد: ${error.message}`);
    }
  }

  async collectDirectoryEntries(directory, prefix, output) {
    const ignoredFolders = new Set(['.git', '.svn', 'node_modules']);
    for await (const [name, handle] of directory.entries()) {
      if (output.length >= this.maxImportedFiles + 1) return;
      const path = prefix ? `${prefix}/${name}` : name;
      if (handle.kind === 'directory') {
        if (!ignoredFolders.has(name)) await this.collectDirectoryEntries(handle, path, output);
      } else if (this.isSupportedPath(path)) {
        output.push({ path: this.normalizePath(path), handle, file: await handle.getFile() });
      }
    }
  }

  async importFilesIntoCurrentProject(files, handleEntries = []) {
    const imported = [];
    for (const browserFile of files.slice(0, this.maxImportedFiles)) {
      const path = this.uniquePath(this.normalizePath(browserFile.name), this.project);
      const record = await this.recordFromBrowserFile(browserFile, path);
      if (!record) continue;
      imported.push(record);
      this.project.files.push(record);
      const handleEntry = handleEntries.find(entry => entry.file === browserFile || entry.file.name === browserFile.name);
      if (handleEntry && handleEntry.handle) this.fileHandles.set(`${this.project.id}:${record.path}`, handleEntry.handle);
    }
    this.resolveProjectReferences(this.project);
    const first = imported.find(file => file.kind === 'html') || imported[0];
    if (first) this.openFile(first.id);
    this.persistWorkspace();
    this.render();
    this.notice(`تمت إضافة ${imported.length} ملف إلى المشروع`);
  }

  async importFolderFiles(files) {
    this.captureWorkspaceState();
    this.persistWorkspace();
    const firstRelative = files[0] && files[0].webkitRelativePath ? files[0].webkitRelativePath : '';
    const rootName = firstRelative.split('/')[0] || 'مجلد مستورد';
    const records = [];
    for (const browserFile of files.slice(0, this.maxImportedFiles)) {
      if (!this.isSupportedPath(browserFile.name)) continue;
      let path = browserFile.webkitRelativePath || browserFile.name;
      const parts = path.split('/');
      if (parts.length > 1) parts.shift();
      path = this.normalizePath(parts.join('/'));
      const record = await this.recordFromBrowserFile(browserFile, path);
      if (record) records.push(record);
    }
    const project = this.createProject(rootName, records);
    this.finishImportedProject(project);
    this.workspace.projects.push(project);
    this.workspace.activeProjectId = project.id;
    this.activateProject(project.id, { initial: true });
    this.notice(`تم استيراد المجلد «${rootName}» وفيه ${records.length} ملف`);
  }

  finishImportedProject(project) {
    let firstPage = project.files.find(file => file.kind === 'html');
    if (!firstPage) {
      firstPage = this.createHtmlFile('index.html', { content: '<main><h1>صفحة المشروع</h1></main>' });
      project.files.unshift(firstPage);
    }
    project.lastPageId = firstPage.id;
    project.activeFileId = firstPage.id;
    this.resolveProjectReferences(project);
  }

  async recordFromBrowserFile(browserFile, path) {
    if (!browserFile || !this.isSupportedPath(path)) return null;
    const kind = this.kindFromPath(path);
    if (kind === 'asset') {
      const dataUrl = await this.readFileAsDataUrl(browserFile);
      return this.createAssetFile(path, dataUrl, browserFile.type);
    }
    const text = await browserFile.text();
    if (kind === 'html') return this.parseHtmlFile(path, text);
    return this.createCodeFile(path, kind, text);
  }

  parseHtmlFile(path, source) {
    const parser = new DOMParser();
    const documentValue = parser.parseFromString(String(source || ''), 'text/html');
    const inlineCss = Array.from(documentValue.querySelectorAll('style')).map(style => style.textContent || '').join('\n\n');
    const inlineJs = Array.from(documentValue.querySelectorAll('script:not([src])')).map(script => script.textContent || '').join('\n\n');
    const styleReferences = Array.from(documentValue.querySelectorAll('link[rel~="stylesheet"][href]')).map(link => link.getAttribute('href')).filter(Boolean);
    const scriptReferences = Array.from(documentValue.querySelectorAll('script[src]')).map(script => script.getAttribute('src')).filter(Boolean);
    const description = documentValue.querySelector('meta[name="description"]');
    documentValue.querySelectorAll('script, style').forEach(node => node.remove());
    const safeBody = this.app && typeof this.app.sanitizeRestoredHtml === 'function'
      ? this.app.sanitizeRestoredHtml(documentValue.body ? documentValue.body.innerHTML : '')
      : (documentValue.body ? documentValue.body.innerHTML : '');
    return this.createHtmlFile(path, {
      content: safeBody,
      css: inlineCss,
      js: inlineJs,
      settings: {
        dir: documentValue.documentElement.getAttribute('dir') || 'ltr',
        lang: documentValue.documentElement.getAttribute('lang') || 'en',
        title: documentValue.title || this.baseName(path).replace(/\.html?$/i, ''),
        description: description ? description.getAttribute('content') || '' : ''
      },
      references: { styles: styleReferences, scripts: scriptReferences }
    });
  }

  resolveProjectReferences(project) {
    if (!project) return;
    project.files.filter(file => file.kind === 'html').forEach(page => {
      page.links = Array.isArray(page.links) ? page.links.filter(id => project.files.some(file => file.id === id)) : [];
      page.references = Object.assign({ styles: [], scripts: [] }, page.references || {});
      const remainingStyles = [];
      (page.references.styles || []).forEach(reference => {
        const match = this.findReferencedFile(project, page.path, reference, 'css');
        if (match) page.links.push(match.id);
        else remainingStyles.push(reference);
      });
      const remainingScripts = [];
      (page.references.scripts || []).forEach(reference => {
        const match = this.findReferencedFile(project, page.path, reference, 'js');
        if (match) page.links.push(match.id);
        else remainingScripts.push(reference);
      });
      page.links = Array.from(new Set(page.links));
      page.references.styles = Array.from(new Set(remainingStyles));
      page.references.scripts = Array.from(new Set(remainingScripts));
    });
  }

  findReferencedFile(project, pagePath, reference, kind) {
    const cleanReference = String(reference || '').split(/[?#]/)[0];
    if (!cleanReference || /^(?:[a-z]+:)?\/\//i.test(cleanReference) || cleanReference.startsWith('data:')) return null;
    const resolved = this.resolvePath(pagePath, cleanReference).toLowerCase();
    return project.files.find(file => file.kind === kind && file.path.toLowerCase() === resolved) || null;
  }

  async saveProjectToFolder() {
    this.captureWorkspaceState();
    let directory = this.directoryHandles.get(this.project.id);
    if (!directory) {
      if (typeof window.showDirectoryPicker !== 'function') {
        this.notice('المتصفح لا يدعم الكتابة المباشرة للمجلد؛ سيتم تنزيل المشروع كملف ZIP');
        this.exportProject();
        return;
      }
      try {
        directory = await window.showDirectoryPicker({ mode: 'readwrite' });
        this.directoryHandles.set(this.project.id, directory);
      } catch (error) {
        if (error && error.name !== 'AbortError') this.notice(`تعذر اختيار مجلد الحفظ: ${error.message}`);
        return;
      }
    }

    try {
      if (typeof directory.requestPermission === 'function') {
        const permission = await directory.requestPermission({ mode: 'readwrite' });
        if (permission !== 'granted') throw new Error('لم يُسمح بالكتابة إلى المجلد');
      }
      const outputs = this.buildProjectOutputs(this.project);
      for (const output of outputs) {
        await this.writeFileToDirectory(directory, output.path, output);
      }
      this.persistWorkspace();
      this.render();
      this.notice(`تم حفظ ${outputs.length} ملف داخل مجلد «${directory.name}»`);
    } catch (error) {
      console.error('تعذر حفظ المشروع في المجلد.', error);
      this.notice(`تعذر الحفظ في المجلد: ${error.message}`);
    }
  }

  async writeFileToDirectory(root, path, file) {
    const parts = this.normalizePath(path).split('/').filter(Boolean);
    const fileName = parts.pop();
    let directory = root;
    for (const part of parts) directory = await directory.getDirectoryHandle(part, { create: true });
    const handle = await directory.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();
    if (file.kind === 'asset') {
      const blob = await fetch(file.dataUrl).then(response => response.blob());
      await writable.write(blob);
    } else {
      await writable.write(file.kind === 'html' ? file.content : file.content || '');
    }
    await writable.close();
    this.fileHandles.set(`${this.project.id}:${path}`, handle);
  }

  exportProject() {
    this.captureWorkspaceState();
    const project = this.project;
    if (!project) return;
    const outputs = this.buildProjectOutputs(project);
    const safeProjectName = this.safeDownloadName(project.name || 'project');
    if (JSZip) {
      const zip = new JSZip();
      const folder = zip.folder(safeProjectName);
      outputs.forEach(file => {
        if (file.kind === 'asset') {
          const base64 = String(file.dataUrl || '').split(',')[1] || '';
          folder.file(file.path, base64, { base64: true });
        } else folder.file(file.path, file.content || '');
      });
      zip.generateAsync({ type: 'blob' }).then(blob => {
        this.downloadBlob(blob, `${safeProjectName}.zip`);
        this.notice(`تم تصدير المشروع كاملًا (${outputs.length} ملف)`);
      }).catch(error => {
        console.error('تعذر إنشاء ZIP.', error);
        this.downloadOutputsIndividually(outputs);
      });
    } else {
      this.downloadOutputsIndividually(outputs);
    }
  }

  downloadOutputsIndividually(outputs) {
    outputs.forEach(file => {
      if (file.kind === 'asset') {
        fetch(file.dataUrl).then(response => response.blob()).then(blob => this.downloadBlob(blob, this.baseName(file.path)));
      } else {
        const mime = file.kind === 'html' ? 'text/html' : file.kind === 'css' ? 'text/css' : file.kind === 'js' ? 'text/javascript' : 'text/plain';
        this.downloadBlob(new Blob([file.content || ''], { type: `${mime};charset=utf-8` }), this.baseName(file.path));
      }
    });
    this.notice('تم تنزيل الملفات منفردة لأن مكتبة ZIP غير متاحة');
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  buildActivePreviewDocument() {
    this.captureActivePage();
    const page = this.getActivePage();
    return page ? this.composeHtmlPage(page, true).content : '<!DOCTYPE html><html><body></body></html>';
  }

  buildActivePreviewAssets() {
    this.captureActivePage();
    const page = this.getActivePage();
    if (!page) {
      return {
        html: '<!DOCTYPE html><html><body></body></html>',
        js: ''
      };
    }
    const output = this.composeHtmlPage(page, true, {
      pageScriptSrc: '__OSOOS_PREVIEW_SCRIPT__'
    });
    return { html: output.content, js: output.scriptContent || '' };
  }

  pageJavaScript(page) {
    const raw = String(page && page.js || '');
    if (this.app.editor && typeof this.app.editor.getExportJavaScript === 'function') {
      return this.app.editor.getExportJavaScript(raw, page && page.interactions);
    }
    return raw
      .replace(/^\s*\/\/ OSOOS_COMPONENT_DATA:.*(?:\r?\n|$)/gm, '')
      .trim();
  }

  pageScriptPath(page, project = this.project) {
    const stem = this.normalizePath(page.path || 'index.html')
      .replace(/\.html?$/i, '')
      .split('/')
      .map(part => part.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'page')
      .join('--');
    const preferred = `assets/js/${stem || 'index'}.js`;
    const collision = project && project.files.some(file =>
      file.id !== page.id && this.normalizePath(file.path).toLowerCase() === preferred.toLowerCase()
    );
    return collision ? `assets/js/${stem || 'index'}.generated.js` : preferred;
  }

  buildProjectOutputs(project = this.project) {
    if (!project) return [];
    const outputs = project.files.map(file =>
      file.kind === 'html' ? this.composeHtmlPage(file, false) : file
    );
    project.files.filter(file => file.kind === 'html').forEach(page => {
      const script = this.pageJavaScript(page);
      if (!script.trim()) return;
      outputs.push({
        id: `${page.id}-generated-script`,
        path: this.pageScriptPath(page, project),
        kind: 'js',
        content: script
      });
    });
    return outputs;
  }

  composeHtmlPage(page, inlineLinked, options = {}) {
    const project = this.project;
    const isActive = project && page.id === project.lastPageId;
    const cleanHtml = isActive && this.app.editor && typeof this.app.editor.getExportCleanHTML === 'function'
      ? this.app.editor.getExportCleanHTML()
      : String(page.content || '');
    let inlineCss = String(page.css || '');
    if (this.app.styleEngine && typeof this.app.styleEngine.getExportCSS === 'function') {
      try { inlineCss = this.app.styleEngine.getExportCSS(inlineCss); } catch { /* Keep raw CSS. */ }
    }
    let inlineJs = this.pageJavaScript(page);
    const linkedCss = [];
    const linkedJs = [];
    (page.links || []).forEach(id => {
      const file = project.files.find(item => item.id === id);
      if (!file) return;
      if (file.kind === 'css') linkedCss.push(file);
      if (file.kind === 'js') linkedJs.push(file);
    });

    let styleLinks = '';
    let scriptLinks = '';
    if (inlineLinked) {
      inlineCss += linkedCss.map(file => `\n\n/* ${file.path} */\n${file.content || ''}`).join('');
      inlineJs += linkedJs.map(file => `\n\n// ${file.path}\n${file.content || ''}`).join('');
    } else {
      styleLinks = linkedCss.map(file => `\n  <link rel="stylesheet" href="${this.escapeAttribute(this.relativePath(page.path, file.path))}">`).join('');
      scriptLinks = linkedJs.map(file => `\n  <script src="${this.escapeAttribute(this.relativePath(page.path, file.path))}"></script>`).join('');
    }

    const references = Object.assign({ styles: [], scripts: [] }, page.references || {});
    styleLinks += (references.styles || []).map(reference => `\n  <link rel="stylesheet" href="${this.escapeAttribute(reference)}">`).join('');
    scriptLinks += (references.scripts || []).map(reference => `\n  <script src="${this.escapeAttribute(reference)}"></script>`).join('');
    const pageScriptSrc = inlineJs.trim()
      ? (options.pageScriptSrc || (!inlineLinked
        ? this.relativePath(page.path, this.pageScriptPath(page, project))
        : ''))
      : '';
    if (pageScriptSrc) {
      scriptLinks += `\n  <script data-osoos-page-script src="${this.escapeAttribute(pageScriptSrc)}"></script>`;
    }

    const settings = Object.assign({ dir: 'rtl', lang: 'ar', title: this.baseName(page.path), description: '' }, page.settings || {});
    const description = settings.description
      ? `\n  <meta name="description" content="${this.escapeAttribute(settings.description)}">`
      : '';
    const fontLinks = typeof this.app.buildExportFontLinks === 'function'
      ? this.app.buildExportFontLinks(inlineCss + linkedCss.map(file => file.content || '').join('\n'), cleanHtml)
      : '';
    const safeCss = typeof this.app.sanitizeCssForInlineStyle === 'function'
      ? this.app.sanitizeCssForInlineStyle(inlineCss)
      : inlineCss.replace(/<\/style/gi, '<\\/style');
    const safeJs = inlineJs.replace(/<\/script/gi, '<\\/script');
    const inlineScript = inlineJs.trim() && !pageScriptSrc
      ? `\n  <script data-osoos-page-script>\n    ${safeJs}\n  </script>`
      : '';
    const content = `<!DOCTYPE html>
<html lang="${this.escapeAttribute(settings.lang)}" dir="${this.escapeAttribute(settings.dir)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">${description}
  <title>${this.escapeText(settings.title)}</title>${fontLinks}${styleLinks}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; }

    ${safeCss}
  </style>
</head>
<body>

  ${cleanHtml}
${scriptLinks}
${inlineScript}
</body>
</html>`;
    return Object.assign({}, page, { content, scriptContent: inlineJs });
  }

  copyFilePath(path) {
    const onSuccess = () => this.notice(`تم نسخ المسار: ${path}`);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(path).then(onSuccess).catch(() => this.fallbackCopy(path, onSuccess));
    } else this.fallbackCopy(path, onSuccess);
  }

  fallbackCopy(value, onSuccess) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); onSuccess(); } catch { this.notice(value); }
    textarea.remove();
  }

  normalizePath(path) {
    const parts = String(path || '').replace(/\\/g, '/').split('/');
    const safe = [];
    parts.forEach(part => {
      const clean = part.trim();
      if (!clean || clean === '.') return;
      if (clean === '..') safe.pop();
      // Strip Windows-invalid path characters and ASCII controls.
      // eslint-disable-next-line no-control-regex
      else safe.push(clean.replace(/[<>:"|?*\x00-\x1F]/g, '-'));
    });
    return safe.join('/');
  }

  baseName(path) {
    return this.normalizePath(path).split('/').pop() || '';
  }

  extension(path) {
    const name = this.baseName(path);
    const index = name.lastIndexOf('.');
    return index >= 0 ? name.slice(index + 1).toLowerCase() : '';
  }

  kindFromPath(path) {
    const extension = this.extension(path);
    if (extension === 'html' || extension === 'htm') return 'html';
    if (extension === 'css') return 'css';
    if (extension === 'js' || extension === 'mjs' || extension === 'cjs') return 'js';
    if (this.supportedAssetExtensions.has(extension)) return 'asset';
    return 'text';
  }

  isSupportedPath(path) {
    const extension = this.extension(path);
    return this.supportedTextExtensions.has(extension) || this.supportedAssetExtensions.has(extension);
  }

  ensureExtension(path, kind) {
    if (this.extension(path)) return path;
    const extensions = { html: '.html', css: '.css', js: '.js', text: '.txt' };
    return path + (extensions[kind] || '.txt');
  }

  uniquePath(path, project) {
    if (!project.files.some(file => file.path.toLowerCase() === path.toLowerCase())) return path;
    const dot = path.lastIndexOf('.');
    const base = dot > path.lastIndexOf('/') ? path.slice(0, dot) : path;
    const extension = dot > path.lastIndexOf('/') ? path.slice(dot) : '';
    let index = 2;
    let candidate = `${base}-${index}${extension}`;
    while (project.files.some(file => file.path.toLowerCase() === candidate.toLowerCase())) {
      index += 1;
      candidate = `${base}-${index}${extension}`;
    }
    return candidate;
  }

  resolvePath(fromFile, reference) {
    if (String(reference).startsWith('/')) return this.normalizePath(String(reference).slice(1));
    const baseParts = this.normalizePath(fromFile).split('/');
    baseParts.pop();
    return this.normalizePath([...baseParts, ...String(reference).split('/')].join('/'));
  }

  relativePath(fromFile, toFile) {
    const from = this.normalizePath(fromFile).split('/');
    const to = this.normalizePath(toFile).split('/');
    from.pop();
    while (from.length && to.length && from[0] === to[0]) {
      from.shift();
      to.shift();
    }
    const result = [...from.map(() => '..'), ...to].join('/');
    return result || this.baseName(toFile);
  }

  safeDownloadName(name) {
    return String(name || 'project').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').slice(0, 80) || 'project';
  }

  escapeAttribute(value) {
    if (typeof this.app.escapeHtmlAttribute === 'function') return this.app.escapeHtmlAttribute(value);
    return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  escapeText(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('تعذر قراءة الملف'));
      reader.readAsDataURL(file);
    });
  }

  notice(message, duration) {
    if (this.app && typeof this.app.showToastNotice === 'function') this.app.showToastNotice(message, duration);
    else console.info(message);
  }
}

export { ProjectManager };
