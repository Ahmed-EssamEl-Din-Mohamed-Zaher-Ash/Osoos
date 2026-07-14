/* Osoos E1.2 — Unified JavaScript Interaction Builder (schemaVersion 3).
 * Loaded after editor.js and before app.js. No external dependencies.
 */
(function () {
  'use strict';
  if (typeof CodeEditorManager === 'undefined' || typeof VisualLogicCore === 'undefined') return;

  const core = VisualLogicCore;
  const proto = CodeEditorManager.prototype;
  const legacyHandleTargetPicked = proto.handleTargetPicked;
  const legacyRenderBlocksList = proto.renderBlocksList;
  const legacyOpenBlockConfig = proto.openBlockConfig;
  const legacyRenderVisualLinksDashboard = proto.renderVisualLinksDashboard;
  const EVENT_LABELS = {
    click: 'عند النقر (click)', input: 'عند الكتابة (input)', change: 'عند التغيير (change)',
    submit: 'عند إرسال النموذج (submit)', mouseenter: 'دخول الفأرة (mouseenter)',
    mouseleave: 'خروج الفأرة (mouseleave)', focus: 'التركيز (focus)', blur: 'فقد التركيز (blur)',
    keydown: 'ضغط مفتاح (keydown)', keyup: 'رفع مفتاح (keyup)', load: 'تحميل الصفحة (load)',
    dblclick: 'نقر مزدوج (dblclick)', contextmenu: 'القائمة السياقية (contextmenu)', scroll: 'التمرير (scroll)', resize: 'تغيير الحجم (resize)',
    dragstart: 'بدء السحب (dragstart)', dragend: 'انتهاء السحب (dragend)', touchstart: 'بدء اللمس (touchstart)', touchend: 'انتهاء اللمس (touchend)',
    animationend: 'انتهاء Animation', transitionend: 'انتهاء Transition', custom: 'حدث مخصص (Custom Event)'
  };
  const STEPS = [
    ['Trigger', 'متى يحدث؟'], ['Read', 'هل تريد قراءة قيمة؟'], ['Condition', 'هل يوجد شرط؟'],
    ['Actions', 'ماذا سيحدث؟'], ['State', 'البيانات والحالة'], ['Functions', 'الدوال المستخدمة'],
    ['Advanced Tools', 'أدوات اختيارية'], ['Review', 'راجع السلوك']
  ];
  /* E1.3.3 — المسار البسيط: تسميات عربية قصيرة + الخطوات المتقدمة تحت زر «متقدم» */
  const E13_STEP_LABELS_AR = ['البداية', 'القراءة', 'الشرط', 'الإجراءات', 'البيانات', 'الدوال', 'أدوات متقدمة', 'المراجعة'];
  const E13_ADVANCED_STEPS = [5, 6, 7];
  const DESTINATION_LABELS = {
    reads: 'Reads', conditions: 'Conditions', actions: 'Actions', state: 'State', functions: 'Functions'
  };
  const COMPONENT_UX_CATALOG = {
    accordion: {
      name: 'الأكورديون', english: 'Accordion', icon: 'fa-list-ul', difficulty: 'سهل',
      description: 'أسئلة أو عناوين تفتح محتواها وتغلقه.',
      use: 'مناسب للأسئلة الشائعة والدروس المقسمة.',
      examples: ['FAQ', 'درس مقسّم إلى أسئلة', 'قائمة تعليمات']
    },
    tabs: {
      name: 'التبويبات', english: 'Tabs', icon: 'fa-table-columns', difficulty: 'سهل',
      description: 'أقسام متعددة يظهر منها قسم واحد في كل مرة.',
      use: 'مناسب لتنظيم معلومات كثيرة في مساحة صغيرة.',
      examples: ['وصف / مميزات / سعر', 'HTML / CSS / JS', 'معلومات منتج']
    },
    modal: {
      name: 'النافذة المنبثقة', english: 'Modal', icon: 'fa-window-maximize', difficulty: 'متوسط',
      description: 'نافذة تظهر فوق الصفحة لإبراز محتوى أو طلب إجراء.',
      use: 'مناسبة للتأكيدات والنماذج والتنبيهات المهمة.',
      examples: ['تسجيل دخول', 'رسالة تأكيد', 'إعلان مهم']
    },
    dropdown: {
      name: 'القائمة المنسدلة', english: 'Dropdown', icon: 'fa-caret-square-down', difficulty: 'سهل',
      description: 'قائمة صغيرة تظهر أسفل زر أو عنصر تحكم.',
      use: 'مناسبة للخيارات المختصرة وقوائم الحساب.',
      examples: ['قائمة حساب المستخدم', 'قائمة روابط', 'اختيار قسم']
    },
    sidebar: {
      name: 'القائمة الجانبية', english: 'Sidebar', icon: 'fa-columns', difficulty: 'متوسط',
      description: 'لوحة جانبية تظهر من اتجاه تختاره.',
      use: 'مناسبة للتنقل والفلاتر والأدوات الجانبية.',
      examples: ['قائمة موبايل', 'لوحة تحكم', 'قائمة دروس']
    }
  };
  const COMPONENT_BEGINNER_ERRORS = {
    invalidSelector: 'الـSelector المكتوب غير صحيح. جرّب اختيار العنصر من الصفحة بدل الكتابة اليدوية.',
    missingElement: 'هذا العنصر لم يعد موجودًا في الصفحة. اختر عنصرًا بديلًا أو احذف العلاقة.',
    countMismatch: 'عدد الأزرار لا يساوي عدد المحتويات. يجب أن يكون لكل زر محتوى مرتبط به.',
    duplicateElement: 'تم اختيار العنصر نفسه أكثر من مرة. اختر عنصرًا مختلفًا لكل علاقة.'
  };

  function getMovedLegacyBlockIds() {
    const ids = new Set();
    Object.values(core.ADVANCED_TOOLS || {}).forEach(tool => (tool.legacyBlockIds || []).forEach(id => ids.add(id)));
    return ids;
  }

  /* Keep the complete blocksDb registry for OSOOS_JS_BLOCK edit/delete compatibility.
     E1.3 removes the creation library; this guard also prevents old cards from resurfacing. */
  if (legacyRenderBlocksList) {
    proto.renderBlocksList = function (searchVal, filterCat) {
      const fullDb = this.blocksDb;
      const moved = getMovedLegacyBlockIds();
      this.blocksDb = fullDb.filter(block => !moved.has(block.id));
      try {
        return legacyRenderBlocksList.call(this, searchVal, filterCat && filterCat !== 'all' && !this.blocksDb.some(block => block.cat === filterCat) ? 'all' : filterCat);
      } finally {
        this.blocksDb = fullDb;
      }
    };
  }
  if (legacyOpenBlockConfig) {
    proto.openBlockConfig = function (block, existing) {
      const result = legacyOpenBlockConfig.call(this, block, existing);
      if (existing) {
        const legacyTools = document.querySelector('.e1-legacy-tools');
        if (legacyTools) legacyTools.open = true;
      }
      return result;
    };
  }

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function opt(value, label, selected) {
    return `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
  }
  function clone(value) { return core.clone(value); }

  const E12_GROUP_LABELS = {
    strings: ['النصوص', 'fa-font'], math: ['الحساب', 'fa-calculator'], arrays: ['المصفوفات', 'fa-list'],
    objects: ['الكائنات', 'fa-cubes'], browser: ['المتصفح', 'fa-window-maximize'], storage: ['التخزين', 'fa-database'],
    timers: ['المؤقتات', 'fa-clock'], dom: ['DOM والعناصر', 'fa-code-branch'], events: ['الأحداث المتقدمة', 'fa-bolt'],
    functions: ['الدوال', 'fa-code'], custom: ['كود مخصص', 'fa-terminal']
  };
  const E12_SCOPE_LABELS = {
    interaction: 'داخل التفاعل', local: 'داخل التفاعل', page: 'الصفحة الحالية', global: 'عام على الصفحة',
    outsideEvent: 'خارج الحدث (مشترك)', insideEvent: 'داخل كل تشغيل للحدث', function: 'داخل Function',
    localStorage: 'localStorage', sessionStorage: 'sessionStorage'
  };
  const E12_ACTION_CATEGORY_LABELS = {
    content: 'المحتوى والوسائط', style: 'التنسيق وCSS', classes: 'Classes', visibility: 'الظهور',
    dom: 'DOM والعناصر', elements: 'إنشاء وترتيب العناصر', attributes: 'Attributes وData', forms: 'النماذج',
    state: 'الحالة والمتغيرات', data: 'البيانات والتخزين', events: 'الأحداث', browser: 'المتصفح', timers: 'المؤقتات',
    navigation: 'التنقل', media: 'الوسائط', functions: 'الدوال', custom: 'مخصص', general: 'إجراءات عامة'
  };

  function asDescriptor(id, value, fallbackLabel) {
    if (value && typeof value === 'object' && !Array.isArray(value)) return Object.assign({ id, label: value.label || value.title || fallbackLabel || id }, value);
    return { id, label: value || fallbackLabel || id };
  }
  function descriptorEntries(registry, labels) {
    if (Array.isArray(registry)) return registry.map((entry, index) => {
      if (typeof entry === 'string') return asDescriptor(entry, labels && labels[entry], entry);
      const id = entry.id || entry.type || entry.value || `item-${index + 1}`;
      return asDescriptor(id, entry, labels && labels[id]);
    });
    return Object.keys(registry || {}).map(id => asDescriptor(id, registry[id], labels && labels[id]));
  }
  function fieldDescriptors(fields, overrides) {
    const defaults = {
      elementId: { key: 'elementId', label: 'العنصر', type: 'element' }, name: { key: 'name', label: 'الاسم', placeholder: 'value' },
      attribute: { key: 'attribute', label: 'اسم Attribute', placeholder: 'aria-label' }, key: { key: 'key', label: 'المفتاح', placeholder: 'key' },
      className: { key: 'className', label: 'Class', placeholder: 'active' }, property: { key: 'property', label: 'الخاصية', placeholder: 'color' },
      index: { key: 'index', label: 'Index', type: 'number', default: '0' }, count: { key: 'count', label: 'العدد', type: 'number', default: '1' },
      fallback: { key: 'fallback', label: 'قيمة بديلة', placeholder: "''" }, json: { key: 'json', label: 'JSON', type: 'boolean' },
      functionName: { key: 'functionName', label: 'Function Name', placeholder: 'myFunction' }, arguments: { key: 'arguments', label: 'Arguments', placeholder: 'value, count' },
      await: { key: 'await', label: 'انتظار Promise', type: 'boolean' }, locale: { key: 'locale', label: 'Locale', placeholder: 'ar-EG' },
      pattern: { key: 'pattern', label: 'Pattern', placeholder: '^[A-Z]' }, flags: { key: 'flags', label: 'Flags', placeholder: 'i أو gi' },
      storageType: { key: 'storageType', label: 'نوع التخزين', type: 'select', options: [{ value: 'local', label: 'localStorage' }, { value: 'session', label: 'sessionStorage' }] }
      ,sourceId: { key: 'sourceId', label: 'العنصر المصدر', type: 'element' }, valueSource: { key: 'valueSource', label: 'القيمة' },
      styleValue: { key: 'styleValue', label: 'CSS Value', placeholder: '#f59e0b' }, tagName: { key: 'tagName', label: 'HTML Tag', placeholder: 'div' },
      html: { key: 'html', label: 'HTML اختياري', type: 'code' }, deep: { key: 'deep', label: 'نسخ عميق', type: 'boolean' },
      display: { key: 'display', label: 'Display اختياري', placeholder: 'block' }, resultName: { key: 'resultName', label: 'اسم النتيجة', placeholder: 'resultValue' },
      variableName: { key: 'variableName', label: 'اسم المتغير', placeholder: 'counter' }, arrayName: { key: 'arrayName', label: 'اسم Array', placeholder: 'items' },
      step: { key: 'step', label: 'المقدار', type: 'number', default: '1' }, defaultValue: { key: 'defaultValue', label: 'القيمة الافتراضية' },
      target: { key: 'target', label: 'نافذة الرابط', type: 'select', options: ['_blank', '_self'] },
      method: { key: 'method', label: 'الطريقة', type: 'select', options: ['hidden', 'display', 'class'] },
      behavior: { key: 'behavior', label: 'Scroll behavior', type: 'select', options: ['smooth', 'auto'] }, block: { key: 'block', label: 'موضع Scroll', type: 'select', options: ['start', 'center', 'end', 'nearest'] },
      delay: { key: 'delay', label: 'المدة بالمللي ثانية', type: 'number', default: '0' }, body: { key: 'body', label: 'الكود المؤقت', type: 'code' },
      code: { key: 'code', label: 'Custom Code', type: 'code' }, timer: { key: 'timer', label: 'Timer ID', placeholder: 'intervalId' }
    };
    return (Array.isArray(fields) ? fields : []).map(field => {
      if (field && typeof field === 'object') return field;
      return Object.assign({ key: String(field), label: String(field) }, defaults[field] || {}, overrides && overrides[field] || {});
    });
  }
  function isIdentifier(value) { return /^[A-Za-z_$][\w$]*$/.test(String(value || '').trim()); }
  function boolAttr(value) { return value === false ? '' : 'checked'; }

  proto.ensureElementId = function (element) {
    if (!element) return '';
    if (element.id) return element.id;
    this.flushPendingHistoryBeforeVisualLink();
    let id;
    do { id = `${element.tagName.toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`; } while (document.getElementById(id));
    element.id = id;
    if (!this._vlTransientElementIds) this._vlTransientElementIds = [];
    this._vlTransientElementIds.push({ element, id });
    return id;
  };

  proto.releaseTransientVisualLinkIds = function () {
    (this._vlTransientElementIds || []).forEach(entry => {
      if (entry.element && entry.element.id === entry.id && !this.customJS.includes(`'${entry.id}'`) && !this.customJS.includes(`"${entry.id}"`)) entry.element.removeAttribute('id');
    });
    this._vlTransientElementIds = [];
  };
  proto.commitTransientVisualLinkIds = function () {
    this._vlTransientElementIds = [];
    if (this.app.domTree) this.app.domTree.render();
  };
  proto.flushPendingHistoryBeforeVisualLink = function () {
    const history = this.app && this.app.history;
    if (!history || !history.debounceTimeout) return;
    clearTimeout(history.debounceTimeout);
    history.debounceTimeout = null;
    history.saveState('Flush Pending Before Visual Link');
  };

  proto.parseVisualLinks = function () { return core.parseVisualLinks(this.customJS); };
  proto.generateVisualLinkCode = function (definition) { return core.generateBlock(definition); };
  proto.escapeVisualLinkDashboardValue = function (value) { return esc(value); };
  proto.getVisualLinkModeLabel = function (link) {
    if (link.builderMode === 'function') return `Function: ${link.functionDef.name}`;
    if (link.builderMode === 'recipe') return (core.RECIPE_TYPES[link.recipeType] || {}).label || 'وصفة E1';
    if (link.builderMode === 'custom') return 'Custom Logic';
    return `تفاعل عام · ${link.actions.length} إجراء`;
  };
  proto.getVisualElementLabel = function (id) {
    const element = document.getElementById(id);
    return id ? `${element ? element.tagName.toLowerCase() : 'element'}#${id}` : 'لم يُحدد بعد';
  };
  proto.getCanvasElementOptions = function (selectedId) {
    const canvas = document.getElementById('builder-canvas');
    const elements = canvas ? Array.from(canvas.querySelectorAll('[id]')) : [];
    let html = `<option value="">— اختر عنصرًا —</option>`;
    if (selectedId && !elements.some(element => element.id === selectedId)) html += opt(selectedId, `عنصر مفقود: #${selectedId}`, selectedId);
    html += elements.map(element => opt(element.id, `${element.tagName.toLowerCase()}#${element.id}`, selectedId)).join('');
    return html;
  };
  proto.getEventOptionsE1 = function (selected) {
    return core.EVENT_TYPES.map(eventName => opt(eventName, EVENT_LABELS[eventName] || eventName, selected)).join('');
  };

  proto.organizeAdvancedJsToolsE1 = function () {
    const region = document.querySelector('.js-region-blocks');
    if (!region || region.closest('.e1-legacy-tools')) return;
    const details = document.createElement('details');
    details.className = 'e1-legacy-tools';
    const summary = document.createElement('summary');
    summary.innerHTML = '<i class="fas fa-box-archive"></i> مكتبة الكتل القديمة — الأدوات المتبقية';
    region.parentNode.insertBefore(details, region);
    details.appendChild(summary);
    details.appendChild(region);

    const moved = getMovedLegacyBlockIds();
    const filters = document.getElementById('js-categories-filter-row');
    if (filters) {
      filters.querySelectorAll('[data-js-cat]').forEach(button => {
        const category = button.dataset.jsCat;
        if (category === 'all') return;
        const hasVisibleTool = this.blocksDb.some(block => block.cat === category && !moved.has(block.id));
        button.hidden = !hasVisibleTool;
      });
    }
    this.renderBlocksList(this.searchBar ? this.searchBar.value : '', 'all');
  };

  proto.setupVisualLinks = function () {
    this.initVisualLinkModes();
    this.organizeAdvancedJsToolsE1();
    document.addEventListener('click', event => {
      if (!event.target.closest('#js-link-menu-dropdown') && !event.target.closest('#bubble-js-link')) {
        const menu = document.getElementById('js-link-menu-dropdown');
        if (menu) menu.style.display = 'none';
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const menu = document.getElementById('js-link-menu-dropdown');
        if (menu) menu.style.display = 'none';
      }
    });
    this.renderVisualLinksDashboard();
  };

  proto.toggleJsLinkMenu = function () {
    const menu = document.getElementById('js-link-menu-dropdown');
    const selected = this.app.selectedElement;
    if (!menu || !selected) return;
    if (menu.style.display === 'block') { menu.style.display = 'none'; return; }
    const sourceId = () => this.ensureElementId(selected);
    const items = [
      ['fa-wand-magic-sparkles', 'إنشاء تفاعل جديد', () => this.openVisualLinkPopup({ sourceId: sourceId(), entry: 'general', step: 1 })],
      ['fa-puzzle-piece', 'اختيار تفاعل جاهز (وصفات)', () => this.openVisualLinkPopup({ sourceId: sourceId(), entry: 'recipes' })],
      ['fa-cubes', 'المكونات التفاعلية (Accordion / Tabs / Modal / Dropdown)', () => this.openVisualLinkPopup({ sourceId: sourceId(), entry: 'recipes' })],
      ['fa-magnifying-glass', 'قراءة قيمة من عنصر', () => this.openVisualLinkPopup({ sourceId: sourceId(), entry: 'read', step: 2 })],
      ['fa-bolt', 'تنفيذ إجراء على عنصر', () => { const id = sourceId(); this.openVisualLinkPopup({ sourceId: id, targetId: id, entry: 'action', step: 4 }); }],
      ['fa-box', 'إنشاء متغير أو حالة', () => this.openVisualLinkPopup({ sourceId: sourceId(), entry: 'state', step: 5 })],
      ['fa-gear', 'إنشاء Function', () => this.openVisualLinkPopup({ sourceId: selected.id || '', entry: 'function' })],
      ['fa-arrows-rotate', 'استخدام العنصر في تفاعل موجود', () => this.showExistingLinksInMenuE1(menu, selected.id || '')],
      ['fa-screwdriver-wrench', 'كتابة منطق مخصص', () => { const id = sourceId(); this.openVisualLinkPopup({ sourceId: id, targetId: id, entry: 'custom', step: 4 }); }]
    ];
    menu.innerHTML = items.map((item, index) => `<button type="button" class="e1-link-menu-item" data-e1-menu-index="${index}"><i class="fas ${item[0]}"></i><span>${item[1]}</span></button>`).join('');
    menu.querySelectorAll('[data-e1-menu-index]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      const item = items[Number(button.dataset.e1MenuIndex)];
      if (Number(button.dataset.e1MenuIndex) !== 7) menu.style.display = 'none';
      item[2]();
    }));
    menu.style.display = 'block';
  };

  proto.showExistingLinksInMenuE1 = function (menu, elementId) {
    const links = this.parseVisualLinks().filter(link => link.sourceId === elementId || core.getRelationships(link).some(rel => rel.targetId === elementId));
    menu.innerHTML = `<button type="button" class="e1-link-menu-back"><i class="fas fa-arrow-right"></i> رجوع</button>` +
      (links.length ? links.map(link => `<button type="button" class="e1-link-menu-item" data-existing-link="${esc(link.id)}"><i class="fas fa-pen"></i><span>${esc(this.getVisualLinkModeLabel(link))}</span></button>`).join('') : '<div class="e1-menu-empty">لا يوجد تفاعل يستخدم هذا العنصر.</div>');
    menu.querySelector('.e1-link-menu-back').addEventListener('click', () => { menu.style.display = 'none'; this.toggleJsLinkMenu(); });
    menu.querySelectorAll('[data-existing-link]').forEach(button => button.addEventListener('click', () => {
      const link = this.parseVisualLinks().find(item => item.id === button.dataset.existingLink);
      menu.style.display = 'none';
      if (link) this.openVisualLinkPopup(null, link);
    }));
  };

  proto.createE1DefinitionFromSeed = function (seed) {
    const entry = (seed && seed.entry) || 'general';
    const mode = entry === 'recipes' ? 'recipe' : (entry === 'function' ? 'function' : (entry === 'custom' ? 'custom' : 'general'));
    const definition = core.createDefinition(seed && seed.sourceId, seed && seed.targetId, null, mode);
    definition.settings.entry = entry;
    if (entry === 'read') definition.reads = [core.normalizeRead({ type: 'sourceValue', name: 'inputValue' }, 0)];
    if (entry === 'action') definition.actions = [core.normalizeAction({ type: 'setText', targetId: seed.targetId, value: 'نص جديد', valueType: 'literal' }, 0, seed.targetId)];
    if (entry === 'custom') definition.actions = [core.normalizeAction({ type: 'custom', targetId: seed.targetId, value: 'targetElement.textContent = "تم التنفيذ";', valueType: 'expression' }, 0, seed.targetId)];
    return core.normalizeDefinition(definition);
  };

  proto.openVisualLinkPopup = function (seed, existing) {
    this.closeVisualLinkPopup({ keepTransient: true });
    
    let definition;
    if (existing && existing.componentType) {
      definition = existing;
    } else {
      definition = existing ? core.normalizeDefinition(existing) : this.createE1DefinitionFromSeed(seed || {});
    }
    
    this.visualLinkDraft = definition;
    const isComponent = !!definition.componentType;
    
    this.activeVisualLink = { 
      existingId: existing ? existing.id : null, 
      draftId: definition.id, 
      sourceId: isComponent ? '' : definition.sourceId, 
      targetId: isComponent ? '' : definition.targetId 
    };
    this.e1PendingVariableRenames = [];
    
    if (isComponent) {
      this.compCurrentStep = this.compCurrentStep || 1;
    } else {
      this.e1CurrentStep = definition.builderMode === 'function'
        ? 6
        : (existing && definition.builderMode === 'general' ? 8 : Math.max(1, Math.min(8, Number(seed && seed.step) || 1)));
    }
    
    this.e1RecipeConfig = isComponent ? null : this.deriveRecipeConfigE1(definition);
    this.e11AdvancedView = { groupId: '', toolId: '', editingId: '', draft: null };
    const firstFunction = !isComponent && ((definition.functions || [])[0] || (definition.builderMode === 'function' ? definition.functionDef : null));
    this.e12FunctionView = { editingId: firstFunction && firstFunction.id ? firstFunction.id : '' };
    this.e12RawVariableNames = Object.create(null);
    this.e12RawFunctionNames = Object.create(null);
    this.previewLinkArrow = null;
    this.componentWizardOpen = false;
    this.componentWizardSuggestion = '';

    const overlay = document.createElement('div');
    overlay.id = 'vl-popup-overlay';
    overlay.className = 'vl-popup-overlay vl-universal-overlay e1-overlay';
    
    const title = isComponent 
      ? (definition.componentType === 'modal' ? `<i class="fas fa-window-maximize"></i> Modal Builder — E2.2.1` : (definition.componentType === 'dropdown' ? `<i class="fas fa-caret-square-down"></i> Dropdown Builder — E2.2.2` : (definition.componentType === 'sidebar' ? `<i class="fas fa-columns"></i> Sidebar Builder — E2.2.3` : `<i class="fas fa-cubes"></i> منشئ المكونات التفاعلية (E2.1)`))) 
      : `<i class="fas fa-wand-magic-sparkles"></i> منشئ تفاعلات JavaScript — E1.3`;
      
    overlay.innerHTML = `
      <div class="vl-popup vl-universal e1-dialog" role="dialog" aria-modal="true">
        <header class="vl-popup-header e1-dialog-header">
          <div class="vl-title-stack"><span class="vl-popup-title">${title}</span><span class="vl-title-kicker">${isComponent ? (definition.componentType === 'modal' ? 'العناصر ← السلوك ← الوصول ← العلاقات ← التجربة والحفظ' : (definition.componentType === 'dropdown' ? 'العناصر ← السلوك ← الوصول ← العلاقات ← التجربة والحفظ' : (definition.componentType === 'sidebar' ? 'العناصر ← السلوك ← الحركة ← الوصول ← مراجعة ← حفظ' : 'العناصر ← السلوك ← الحالة الافتراضية ← مراجعة ← حفظ'))) : 'Trigger → Read → Condition → Actions → State → Functions → Advanced Tools → Review'}</span></div>
          <button type="button" class="block-config-close" id="e1-close">&times;</button>
        </header>
        <div class="e1-source-strip" id="e1-source-strip">
          <span>Source</span>
          <button type="button" class="vl-inline-badge" id="e1-source-badge"></button>
          <button type="button" class="vl-link-button" id="e1-change-source">تغيير Source</button>
        </div>
        <nav class="e1-stepper" id="e1-stepper"></nav>
        <div class="vl-universal-scroll e1-scroll">
          <div class="e1-content" id="e1-content"></div>
          <div class="vl-validation-errors" id="vl-validation-errors"></div>
        </div>
        <footer class="vl-popup-footer e1-footer">
          ${existing ? '<button type="button" id="e1-delete" class="btn btn-secondary vl-delete-btn"><i class="fas fa-trash"></i></button>' : ''}
          <button type="button" id="e1-try" class="btn btn-secondary vl-try-btn" data-e13-tip="ينفّذ التفاعل مؤقتاً في المعاينة دون حفظ — جرّب بلا خوف"><i class="fas fa-play"></i> جرّب الآن</button>
          <span class="vl-footer-spacer"></span>
          <button type="button" id="e1-prev" class="btn btn-secondary" data-e13-tip="الرجوع خطوة في التسلسل">السابق</button>
          <button type="button" id="e1-next" class="btn btn-secondary" data-e13-tip="الخطوة التالية في التسلسل: حدث ← قراءة ← شرط ← تنفيذ ← مراجعة">التالي</button>
          <button type="button" id="e1-cancel" class="btn btn-secondary">إلغاء</button>
          <button type="button" id="e1-save" class="btn btn-primary"><i class="fas fa-save"></i> ${existing ? 'حفظ التعديل' : 'حفظ التفاعل'}</button>
        </footer>
      </div>`;
    document.body.appendChild(overlay);
    this.bindE1PopupEvents();
    this.renderE1Builder();
    this.updateVisualLinkArrows();
  };

  proto.bindE1PopupEvents = function () {
    const overlay = document.getElementById('vl-popup-overlay');
    if (!overlay) return;
    overlay.querySelector('#e1-close').addEventListener('click', () => this.closeVisualLinkPopup());
    overlay.querySelector('#e1-cancel').addEventListener('click', () => this.closeVisualLinkPopup());
    overlay.querySelector('#e1-save').addEventListener('click', () => this.saveVisualLinkFromPopup());
    overlay.querySelector('#e1-try').addEventListener('click', () => this.tryVisualLinkFromPopup());
    overlay.querySelector('#e1-prev').addEventListener('click', () => this.moveE1Step(-1));
    overlay.querySelector('#e1-next').addEventListener('click', () => this.moveE1Step(1));
    overlay.querySelector('#e1-source-badge').addEventListener('click', () => this.focusElementByIdE1(this.visualLinkDraft.sourceId));
    overlay.querySelector('#e1-change-source').addEventListener('click', () => this.startE1Picking({ role: 'source' }));
    overlay.querySelectorAll('[data-e1-step]').forEach(button => button.addEventListener('click', () => {
      this.syncE1DraftFromUI(); this.e1CurrentStep = Number(button.dataset.e1Step); this.renderE1Builder();
    }));
    const del = overlay.querySelector('#e1-delete');
    if (del) del.addEventListener('click', () => { if (confirm('هل تريد حذف هذا التفاعل؟')) this.deleteVisualLink(this.activeVisualLink.existingId); });
    overlay.addEventListener('mousedown', event => { if (event.target === overlay) this.closeVisualLinkPopup(); });
    this._vlKeyHandler = event => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      if (this.e1Picking) this.cancelE1Picking();
      else if (document.getElementById('vl-trial-overlay')) this.closeVisualLinkTrial();
      else this.closeVisualLinkPopup();
    };
    document.addEventListener('keydown', this._vlKeyHandler, true);
  };

  proto.moveE1Step = function (direction) {
    const isComponent = this.visualLinkDraft && (this.visualLinkDraft.builderMode === 'component' || !!this.visualLinkDraft.componentType);
    if (isComponent) {
      this.syncComponentDraftFromUI();
      const componentType = this.visualLinkDraft.componentType;
      const maxSteps = componentType === 'sidebar' ? 6 : 5;
      this.compCurrentStep = Math.max(1, Math.min(maxSteps, this.compCurrentStep + direction));
    } else {
      this.syncE1DraftFromUI();
      if (this.visualLinkDraft && this.visualLinkDraft.builderMode === 'function') {
        this.e1CurrentStep = direction > 0 ? 8 : 6;
      } else {
        /* التنقل يمشي على الخطوات الظاهرة فقط (القراءة قد تكون مخفية والمتقدم مطوياً) */
        const visibleSteps = this.getE13VisibleSteps();
        const currentIndex = visibleSteps.indexOf(this.e1CurrentStep);
        const nextIndex = Math.max(0, Math.min(visibleSteps.length - 1, (currentIndex < 0 ? 0 : currentIndex) + direction));
        this.e1CurrentStep = visibleSteps[nextIndex];
      }
    }
    this.renderE1Builder();
  };

  proto.renderE1Builder = function () {
    const holder = document.getElementById('e1-content');
    if (!holder || !this.visualLinkDraft) return;
    this.hideE13DocPanel();
    
    const isComponent = this.visualLinkDraft.builderMode === 'component' || !!this.visualLinkDraft.componentType;
    
    if (isComponent) {
      this.compCurrentStep = this.compCurrentStep || 1;
      const stepper = document.getElementById('e1-stepper');
      const componentType = this.visualLinkDraft.componentType;
      const componentSteps = componentType === 'sidebar'
        ? ['اختر العناصر', 'اضبط السلوك', 'الاتجاه والحركة', 'الوصول والتركيز', 'مراجعة العلاقات', 'جرّب واحفظ']
        : ((componentType === 'modal' || componentType === 'dropdown')
          ? ['اختر العناصر', 'اضبط السلوك', 'الوصول وتجربة المستخدم', 'راجع العلاقات', 'جرّب واحفظ']
          : ['اختر العناصر', 'اضبط السلوك', 'الحالة الافتراضية', 'مراجعة العلاقات', 'تجربة وحفظ']);
      const maxSteps = componentSteps.length;
      if (stepper) {
        stepper.hidden = false;
        stepper.innerHTML = componentSteps.map((label, index) => `<button type="button" data-comp-step="${index + 1}" class="${index + 1 === this.compCurrentStep ? 'active' : ''}"><span>${index + 1}</span><small>${label}</small></button>`).join('');
        
        stepper.querySelectorAll('[data-comp-step]').forEach(button => button.addEventListener('click', () => {
          this.syncComponentDraftFromUI();
          this.compCurrentStep = Number(button.dataset.compStep);
          this.renderE1Builder();
        }));
      }
      
      document.getElementById('e1-source-strip').hidden = true;
      document.getElementById('e1-prev').hidden = this.compCurrentStep === 1;
      document.getElementById('e1-next').hidden = this.compCurrentStep === maxSteps;
      
      this.renderComponentBuilder(holder);
      this.bindE1ContentEvents();
      this.previewLinkArrow = null;
      this.updateVisualLinkArrows();
      return;
    }
    
    const functionMode = this.visualLinkDraft.builderMode === 'function';
    const recipeMode = this.visualLinkDraft.builderMode === 'recipe';
    const stepper = document.getElementById('e1-stepper');
    const visibleSteps = this.getE13VisibleSteps();
    if (!visibleSteps.includes(this.e1CurrentStep)) {
      /* الخطوة الحالية اتخفت (مثلاً القراءة) — انتقل لأقرب خطوة ظاهرة قبلها */
      this.e1CurrentStep = visibleSteps.filter(stepId => stepId <= this.e1CurrentStep).pop() || visibleSteps[0];
    }
    if (stepper) {
      stepper.hidden = recipeMode;
      const advancedOpen = this.isE13AdvancedOpen();
      const buttons = visibleSteps.map((stepId, index) => `<button type="button" data-e1-step="${stepId}" data-e13-tip="${esc(STEPS[stepId - 1][1])}" class="${stepId === this.e1CurrentStep ? 'active' : ''}${E13_ADVANCED_STEPS.includes(stepId) ? ' is-advanced' : ''}"><span>${index + 1}</span><small>${E13_STEP_LABELS_AR[stepId - 1] || STEPS[stepId - 1][0]}</small></button>`);
      let advancedToggle = '';
      if (!functionMode) {
        if (!advancedOpen) advancedToggle = `<button type="button" class="e13-advanced-toggle" data-e13-advanced-toggle="open" data-e13-tip="البيانات (State) والدوال والأدوات المتقدمة — التفاعلات البسيطة لا تحتاجها"><i class="fas fa-layer-group"></i> متقدم</button>`;
        else if (!this.e13DraftUsesAdvanced()) advancedToggle = `<button type="button" class="e13-advanced-toggle is-open" data-e13-advanced-toggle="close" data-e13-tip="إخفاء الخطوات المتقدمة والرجوع للمسار البسيط"><i class="fas fa-layer-group"></i> تبسيط</button>`;
      }
      stepper.innerHTML = buttons.slice(0, -1).join('') + advancedToggle + (buttons.length ? buttons[buttons.length - 1] : '');
      stepper.querySelectorAll('[data-e1-step]').forEach(button => button.addEventListener('click', () => {
        this.syncE1DraftFromUI(); this.e1CurrentStep = Number(button.dataset.e1Step); this.renderE1Builder();
      }));
      const advancedToggleButton = stepper.querySelector('[data-e13-advanced-toggle]');
      if (advancedToggleButton) advancedToggleButton.addEventListener('click', () => {
        this.syncE1DraftFromUI();
        this.e1AdvancedTabsOpen = advancedToggleButton.dataset.e13AdvancedToggle === 'open';
        this.renderE1Builder();
      });
    }
    document.getElementById('e1-source-strip').hidden = functionMode;
    const sourceBadge = document.getElementById('e1-source-badge');
    if (sourceBadge) sourceBadge.textContent = this.getVisualElementLabel(this.visualLinkDraft.sourceId);
    
    document.getElementById('e1-prev').hidden = recipeMode || this.e1CurrentStep === 1 || (functionMode && this.e1CurrentStep === 6);
    document.getElementById('e1-next').hidden = recipeMode || this.e1CurrentStep === 8;
    if (functionMode && this.e1CurrentStep === 8) holder.innerHTML = this.renderE1ReviewStep();
    else if (functionMode) this.renderE1FunctionBuilder(holder);
    else if (recipeMode) this.renderE1Recipes(holder);
    else this.renderE1GeneralStep(holder);
    if (!recipeMode) holder.insertAdjacentHTML('afterbegin', this.renderE13FlowBanner(this.e1CurrentStep) + this.renderE11StepOverview());
    this.bindE1ContentEvents();
    this.previewLinkArrow = null;
    this.updateVisualLinkArrows();
  };

  proto.renderE1GeneralStep = function (holder) {
    if (this.e1CurrentStep === 1) holder.innerHTML = this.renderE1TriggerStep();
    else if (this.e1CurrentStep === 2) holder.innerHTML = this.renderE1ReadsStep();
    else if (this.e1CurrentStep === 3) holder.innerHTML = this.renderE1ConditionsStep();
    else if (this.e1CurrentStep === 4) holder.innerHTML = this.renderE1ActionsStep(this.visualLinkDraft.actions, false);
    else if (this.e1CurrentStep === 5) holder.innerHTML = this.renderE1StateStep();
    else if (this.e1CurrentStep === 6) holder.innerHTML = this.renderE1FunctionsStep();
    else if (this.e1CurrentStep === 7) holder.innerHTML = this.renderE11AdvancedToolsStep();
    else holder.innerHTML = this.renderE1ReviewStep();
  };

  proto.renderE11StepOverview = function () {
    const definition = this.visualLinkDraft;
    const state = definition.state || definition.variables || [];
    const actions = definition.builderMode === 'function' ? (definition.functions || []).reduce((all, fn) => all.concat(fn.actions || []), []) : definition.actions;
    return `<div class="e11-step-overview"><span>لديك:</span><b>${definition.reads.length} قراءة</b><b>${definition.conditions.length} شرط</b><b>${actions.length} إجراء</b><b>${state.length} State</b><b>${(definition.functions || []).length} Function</b><b>${(definition.advancedOperations || []).length} عملية متقدمة</b></div>`;
  };

  /* ── E1.3.3: المسار البسيط + الإرشادات ─────────────────────────────── */

  proto.e13DraftUsesAdvanced = function () {
    const draft = this.visualLinkDraft || {};
    const stateList = draft.state || draft.variables || [];
    return draft.builderMode === 'function' || !!(stateList.length || (draft.functions || []).length || (draft.advancedOperations || []).length);
  };

  proto.isE13AdvancedOpen = function () {
    return !!this.e1AdvancedTabsOpen || this.e13DraftUsesAdvanced();
  };

  proto.getE13VisibleSteps = function () {
    if (this.visualLinkDraft && this.visualLinkDraft.builderMode === 'function') return [6, 8];
    const steps = [1];
    if (this.shouldShowE13ReadStep()) steps.push(2);
    steps.push(3, 4);
    if (this.isE13AdvancedOpen()) steps.push(5, 6, 7);
    steps.push(8);
    return steps;
  };

  proto.getE13ElementInfo = function (elementId) {
    const element = elementId ? document.getElementById(elementId) : null;
    if (!element) return null;
    const tag = element.tagName.toLowerCase();
    const inputType = tag === 'input' ? String(element.type || 'text').toLowerCase() : '';
    return {
      tag,
      inputType,
      isFormControl: ['input', 'textarea', 'select'].includes(tag),
      isCheckable: tag === 'input' && ['checkbox', 'radio'].includes(inputType),
      isImage: tag === 'img',
      isLink: tag === 'a'
    };
  };

  proto.e13SourceIsReadable = function () {
    const info = this.getE13ElementInfo(this.visualLinkDraft && this.visualLinkDraft.sourceId);
    return !info || info.isFormControl;
  };

  proto.shouldShowE13ReadStep = function () {
    const draft = this.visualLinkDraft || {};
    if ((draft.reads || []).length) return true;      /* فيه قراءات فعلاً — لا نخفي بياناته */
    if (this.isE13AdvancedOpen()) return true;        /* الوضع المتقدم يعرض كل الخطوات */
    return this.e13SourceIsReadable();                /* مصدر غير قابل للقراءة (صورة/div) → أخفِ الخطوة */
  };

  /* فلترة أنواع القراءة حسب العنصر: input يعرض قيم الحقول، الصورة لا تعرض نص/قيمة… */
  proto.e13FilterReadDescriptors = function (descriptors, read) {
    const draft = this.visualLinkDraft || {};
    const elementId = read.type === 'sourceValue' || !read.elementId ? (read.type === 'sourceValue' ? draft.sourceId : read.elementId) : read.elementId;
    const info = this.getE13ElementInfo(read.type === 'sourceValue' ? draft.sourceId : read.elementId);
    const sourceInfo = this.getE13ElementInfo(draft.sourceId);
    const formValueTypes = new Set(['inputValue', 'valueAsNumber']);
    const textTypes = new Set(['textContent', 'innerText', 'innerHTML']);
    return descriptors.filter(descriptor => {
      if (descriptor.id === read.type) return true;                                  /* النوع المختار حالياً يبقى دائماً */
      if (descriptor.id === 'sourceValue') return !sourceInfo || sourceInfo.isFormControl;
      if (['event', 'browser', 'general'].includes(descriptor.category)) return true;
      if (!info) return true;                                                        /* لم يُختر عنصر بعد → لا فلترة */
      if (descriptor.id === 'selectValue' || descriptor.id === 'selectedValue') return info.tag === 'select';
      if (descriptor.id === 'textareaValue') return info.tag === 'textarea';
      if (descriptor.id === 'radioValue') return info.tag === 'input' && info.inputType === 'radio';
      if (descriptor.id === 'checked') return info.isCheckable;
      if (formValueTypes.has(descriptor.id)) return info.isFormControl;
      if (textTypes.has(descriptor.id)) return !info.isFormControl && !info.isImage;
      return true;
    });
  };

  /* شريط التسلسل التنفيذي: يوضح مكانك في خط سير البرنامج وما قبله وما بعده */
  proto.renderE13FlowBanner = function (stepId) {
    const stages = [
      { icon: 'fa-bolt', label: 'الحدث', steps: [1] },
      { icon: 'fa-eye', label: 'اقرأ القيم', steps: [2] },
      { icon: 'fa-circle-question', label: 'افحص الشروط', steps: [3] },
      { icon: 'fa-play', label: 'نفّذ الإجراءات', steps: [4, 5, 6, 7] },
      { icon: 'fa-clipboard-check', label: 'راجع واحفظ', steps: [8] }
    ];
    const messages = {
      1: 'كل تفاعل يبدأ من حدث على عنصر المصدر. بعد وقوع الحدث ينفّذ الكمبيوتر الخطوات بالترتيب: قراءة ← فحص ← تنفيذ.',
      2: 'خطوة اختيارية: اقرأ القيم التي ستحتاجها لاحقاً (مثل نص حقل إدخال) وخزّنها باسم واضح. لا تحتاج قيمة؟ تخطَّها.',
      3: 'هنا يقرر الكمبيوتر: أُكمل أم أقف؟ لو تحققت الشروط ينتقل للإجراءات، ولو لم تتحقق يتوقف بلا تنفيذ.',
      4: 'لحظة التنفيذ الفعلي — الإجراءات تعمل واحداً تلو الآخر من الأعلى للأسفل.',
      5: 'البيانات (State) صناديق قيم تبقى محفوظة بين كل تشغيل للحدث والذي يليه — تخدم خطوة التنفيذ.',
      6: 'الدالة تجمع خطوات متكررة تحت اسم واحد تستدعيه من الإجراءات وقتما تشاء.',
      7: 'أدوات جاهزة (نصوص، مصفوفات، مؤقتات…) تضيف عمليات أدق داخل نفس التسلسل.',
      8: 'راجع القصة كاملة بالعربية، افحص الكود المولد، وجرّب قبل الحفظ.'
    };
    const activeIndex = stages.findIndex(stage => stage.steps.includes(stepId));
    const pills = stages.map((stage, index) => {
      const status = index < activeIndex ? ' is-done' : (index === activeIndex ? ' is-current' : '');
      return `<span class="e13-flow-stage${status}"><i class="fas ${stage.icon}"></i>${stage.label}</span>${index < stages.length - 1 ? '<i class="fas fa-arrow-left e13-flow-arrow"></i>' : ''}`;
    }).join('');
    return `<div class="e13-flow-banner"><div class="e13-flow-track">${pills}</div><p>${messages[stepId] || ''}</p></div>`;
  };

  proto.renderE1TriggerStep = function () {
    const sourceInfo = this.getE13ElementInfo(this.visualLinkDraft.sourceId);
    const sourceNote = sourceInfo && !sourceInfo.isFormControl
      ? `<p class="e13-next-hint"><i class="fas fa-lightbulb"></i> عنصر المصدر (${esc(sourceInfo.tag)}) ليس حقل إدخال، لذلك خطوة القراءة مخفية — الخطوة التالية مباشرة: الشرط ثم الإجراءات.</p>`
      : `<p class="e13-next-hint"><i class="fas fa-lightbulb"></i> بعد اختيار الحدث اضغط «التالي» لقراءة القيم التي يحتاجها التفاعل.</p>`;
    return `<section class="e1-step-card"><div class="e1-step-question"><span>1</span><div><h3>متى يحدث التفاعل؟</h3><p>اختر الحدث الذي سيبدأ السلوك.</p></div></div><label class="vl-field-group" data-e13-tip="الحدث هو لحظة البداية — كل ما بعده يُنفَّذ فقط عندما يقع هذا الحدث على عنصر المصدر"><span class="vl-field-label">Trigger / Event</span><select class="js-linker-select e1-event">${this.getEventOptionsE1(this.visualLinkDraft.event)}</select></label>${sourceNote}</section>`;
  };

  proto.getE11AdvancedOperations = function (destination) {
    return (this.visualLinkDraft.advancedOperations || [])
      .filter(operation => operation.destination === destination)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  };

  proto.renderE11DestinationSummary = function (destination) {
    const operations = this.getE11AdvancedOperations(destination);
    if (!operations.length) return '';
    const tools = core.ADVANCED_TOOLS || {};
    return `<div class="e11-destination-summary"><div class="e11-destination-title"><i class="fas fa-wand-magic-sparkles"></i><span>عمليات متقدمة مضافة هنا (${operations.length})</span></div>${operations.map(operation => {
      const tool = tools[operation.toolId] || {};
      return `<div class="e11-destination-item"><span><strong>${esc(tool.label || operation.toolId)}</strong>${operation.resultName ? `<small> → ${esc(operation.resultName)}</small>` : ''}</span><span><button type="button" class="vl-mini-btn" data-e1-command="edit-advanced-operation" data-operation-id="${esc(operation.id)}" title="تعديل"><i class="fas fa-pen"></i></button><button type="button" class="vl-mini-btn danger" data-e1-command="remove-advanced-operation" data-operation-id="${esc(operation.id)}" title="حذف"><i class="fas fa-trash"></i></button></span></div>`;
    }).join('')}</div>`;
  };

  proto.renderE12DescriptorOptions = function (descriptors, selected, categoryLabels) {
    const groups = new Map();
    descriptors.forEach(descriptor => {
      const category = descriptor.category || descriptor.family || 'general';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(descriptor);
    });
    if (groups.size <= 1) return descriptors.map(descriptor => opt(descriptor.id, descriptor.label, selected)).join('');
    return Array.from(groups.entries()).map(([category, items]) => `<optgroup label="${esc((categoryLabels && categoryLabels[category]) || category)}">${items.map(descriptor => opt(descriptor.id, descriptor.label, selected)).join('')}</optgroup>`).join('');
  };

  proto.getE12ReadDescriptors = function () {
    const descriptors = descriptorEntries(core.READ_TYPES || {}, core.READ_LABELS || {});
    const fallback = {
      sourceValue: { category: 'element', requiresElement: false, resultHint: 'قيمة Source الحالي' },
      inputValue: { category: 'element', requiresElement: true, resultHint: 'قيمة حقل الإدخال' },
      textContent: { category: 'element', requiresElement: true, resultHint: 'النص الظاهر داخل العنصر' },
      innerHTML: { category: 'element', requiresElement: true, resultHint: 'محتوى HTML داخل العنصر' },
      checked: { category: 'forms', requiresElement: true, resultHint: 'true أو false' },
      selectedValue: { category: 'forms', requiresElement: true, resultHint: 'قيمة الخيار المحدد' },
      attribute: { category: 'element', requiresElement: true, fields: [{ key: 'attribute', label: 'اسم Attribute', placeholder: 'aria-label', required: true }] },
      dataset: { category: 'element', requiresElement: true, fields: [{ key: 'key', label: 'مفتاح Dataset', placeholder: 'userId', required: true }] },
      style: { category: 'style', requiresElement: true, fields: [{ key: 'property', label: 'CSS Property', placeholder: 'color', required: true }] },
      computedStyle: { category: 'style', requiresElement: true, fields: [{ key: 'property', label: 'CSS Property', placeholder: 'display', required: true }] },
      eventProperty: { category: 'event', requiresElement: false, fields: [{ key: 'path', label: 'خاصية Event', placeholder: 'key', required: true }] },
      urlParameter: { category: 'browser', requiresElement: false, fields: [{ key: 'name', label: 'اسم Query Parameter', placeholder: 'id', required: true }] }
    };
    return descriptors.map(descriptor => {
      const merged = Object.assign({}, fallback[descriptor.id] || {}, descriptor);
      merged.requiresElement = merged.requiresElement !== undefined ? merged.requiresElement : !!((merged.sourceKinds || []).includes('element') || (merged.fields || []).includes('elementId'));
      merged.fields = fieldDescriptors(merged.fields || merged.settings || []).filter(field => field.key !== 'elementId');
      return merged;
    });
  };

  proto.getE12ReadDescriptor = function (type) {
    return this.getE12ReadDescriptors().find(descriptor => descriptor.id === type) || asDescriptor(type, (core.READ_TYPES || {})[type], type);
  };

  proto.renderE12ReadSetting = function (read, field) {
    const settings = read.settings || {};
    const key = field.key || field.name;
    const value = settings[key] !== undefined ? settings[key] : (field.default !== undefined ? field.default : '');
    const common = `class="${field.type === 'checkbox' || field.type === 'boolean' ? 'e12-check-input' : 'js-linker-input'} e1-read-setting" data-read-setting="${esc(key)}"`;
    if (field.type === 'select') {
      const options = Array.isArray(field.options) ? field.options : Object.keys(field.options || {}).map(id => ({ value: id, label: field.options[id] }));
      return `<label class="vl-field-group"><span class="vl-field-label">${esc(field.label || key)}</span><select class="js-linker-select e1-read-setting" data-read-setting="${esc(key)}">${options.map(entry => {
        const optionValue = typeof entry === 'string' ? entry : (entry.value !== undefined ? entry.value : entry.id);
        return opt(optionValue, typeof entry === 'string' ? entry : (entry.label || optionValue), value);
      }).join('')}</select></label>`;
    }
    if (field.type === 'checkbox' || field.type === 'boolean') return `<label class="e12-toggle-field"><input type="checkbox" ${common} ${value === true || value === 'true' ? 'checked' : ''}><span>${esc(field.label || key)}</span></label>`;
    if (field.type === 'textarea' || field.type === 'code' || field.multiline) return `<label class="vl-field-group vl-span-2"><span class="vl-field-label">${esc(field.label || key)}</span><textarea ${common} rows="3" placeholder="${esc(field.placeholder || '')}">${esc(value)}</textarea></label>`;
    return `<label class="vl-field-group"><span class="vl-field-label">${esc(field.label || key)}</span><input ${common} type="${field.type === 'number' ? 'number' : 'text'}" value="${esc(value)}" placeholder="${esc(field.placeholder || '')}"></label>`;
  };

  proto.renderE1ReadsStep = function () {
    const descriptors = this.getE12ReadDescriptors();
    const sourceInfo = this.getE13ElementInfo(this.visualLinkDraft.sourceId);
    const sourceHint = sourceInfo && !sourceInfo.isFormControl
      ? `<div class="e13-read-source-hint"><i class="fas fa-circle-info"></i><span>عنصر المصدر <b>${esc(this.getVisualElementLabel(this.visualLinkDraft.sourceId))}</b> ليس حقل إدخال، لذلك أنواع القراءة غير المناسبة له مخفية تلقائياً. يمكنك القراءة من عنصر آخر (نص، Attribute…) أو من الحدث نفسه.</span></div>`
      : '';
    const reads = this.visualLinkDraft.reads.map((read, index) => {
      const descriptor = this.getE12ReadDescriptor(read.type);
      const availableDescriptors = this.e13FilterReadDescriptors(descriptors, read);
      const requiresElement = descriptor.requiresElement !== undefined ? descriptor.requiresElement : read.type !== 'sourceValue';
      const readSettings = (descriptor.fields || descriptor.settings || []).map(field => this.renderE12ReadSetting(read, field)).join('');
      const sourceLabel = read.type === 'sourceValue' ? this.getVisualElementLabel(this.visualLinkDraft.sourceId) : this.getVisualElementLabel(read.elementId);
      return `<div class="e1-repeat-card e12-read-card ${read.enabled === false ? 'is-disabled' : ''}" data-read-id="${esc(read.id)}">
        <div class="e1-repeat-head"><span class="e12-card-title"><label class="e12-enable"><input type="checkbox" class="e1-read-enabled" ${boolAttr(read.enabled)}><span></span></label><strong>قراءة ${index + 1}</strong><code>${esc(read.id)}</code></span><div class="vl-row-actions"><button type="button" class="vl-mini-btn" data-e1-command="read-up" ${index ? '' : 'disabled'} title="تحريك لأعلى"><i class="fas fa-arrow-up"></i></button><button type="button" class="vl-mini-btn" data-e1-command="read-down" ${index < this.visualLinkDraft.reads.length - 1 ? '' : 'disabled'} title="تحريك لأسفل"><i class="fas fa-arrow-down"></i></button><button type="button" class="vl-mini-btn danger" data-e1-command="delete-read" title="حذف"><i class="fas fa-trash"></i></button></div></div>
        <div class="vl-fields-grid">
          <label class="vl-field-group" data-e13-tip="أي معلومة تريد أخذها؟ القائمة تعرض المناسب للعنصر المختار فقط"><span class="vl-field-label">ماذا نقرأ؟</span><select class="js-linker-select e1-read-type">${this.renderE12DescriptorOptions(availableDescriptors, read.type, { element: 'العنصر', forms: 'النماذج', style: 'التنسيق', event: 'الحدث', browser: 'المتصفح', general: 'عام' })}</select></label>
          <label class="vl-field-group" data-e13-tip="اسم الصندوق الذي ستوضع فيه القيمة — ستستدعيه بهذا الاسم في الشروط والإجراءات"><span class="vl-field-label">اسم النتيجة</span><input class="js-linker-input e1-read-name" value="${esc(read.name)}" placeholder="inputValue"><small class="e12-field-feedback">يُستخدم هذا الاسم في الشروط والإجراءات.</small></label>
          ${requiresElement ? this.renderE1ElementField('e1-read-element', read.elementId, 'read', read.id) : `<div class="vl-field-help vl-span-2">مصدر القراءة: <button type="button" class="vl-inline-badge e1-focus-element" data-element-id="${esc(this.visualLinkDraft.sourceId)}">${esc(sourceLabel)}</button></div>`}
          ${readSettings}
        </div>
        <div class="e12-result-preview"><i class="fas fa-arrow-left"></i><span><code>${esc(read.name || 'result')}</code> سيحمل ${esc(descriptor.resultHint || descriptor.label || read.type)} من ${esc(sourceLabel)}</span></div>
      </div>`;
    }).join('');
    return `<section class="e1-step-card"><div class="e1-step-question"><span>2</span><div><h3>ماذا تريد أن تقرأ؟</h3><p>كل قراءة لها مصدر واسم نتيجة ثابت يمكن استخدامه لاحقًا.</p></div></div>${sourceHint}<div class="e1-repeat-list">${reads || '<div class="vl-empty-list">لا أحتاج قيمة في هذا التفاعل.</div>'}</div><button type="button" class="vl-add-row-btn" data-e1-command="add-read"><i class="fas fa-plus"></i> إضافة قراءة</button>${this.renderE11DestinationSummary('reads')}</section>`;
  };

  proto.getE12ConditionDescriptors = function () {
    const labels = core.CONDITION_LABELS || {};
    const registry = core.CONDITION_OPERATORS || labels;
    const descriptors = descriptorEntries(registry, labels).map(descriptor => Object.assign({}, (core.CONDITION_SCHEMAS || {})[descriptor.id] || {}, descriptor));
    const noRight = new Set(['notEmpty', 'isEmpty', 'isChecked', 'isUnchecked', 'isTrue', 'isFalse', 'exists', 'notExists', 'isNull', 'isUndefined']);
    return descriptors.map(descriptor => {
      const id = descriptor.id;
      let family = descriptor.family || descriptor.category;
      if (!family) {
        if (/regex|match/i.test(id)) family = 'regex';
        else if (/empty|null|undefined|exist/i.test(id)) family = 'presence';
        else if (/include|contain|start|end|length/i.test(id)) family = 'text';
        else if (/checked|true|false/i.test(id)) family = 'boolean';
        else if (/^[<>]=?$|between|number/i.test(id)) family = 'number';
        else family = 'comparison';
      }
      const impliedNoRight = /^(visible|hidden|disabled|checked|focused|hasChildren|arrayEmpty|arrayNotEmpty|isTrue|isFalse|variableExists|isNull|isUndefined|isChecked)$/.test(id);
      const next = Object.assign({ family, requiresRight: !noRight.has(id) && !impliedNoRight, advanced: /regex|match/i.test(id) }, descriptor);
      next.fields = fieldDescriptors(descriptor.fields || []);
      return next;
    });
  };

  proto.getE12ConditionDescriptor = function (operator) {
    return this.getE12ConditionDescriptors().find(descriptor => descriptor.id === operator) || { id: operator, label: operator, family: 'comparison', requiresRight: true };
  };

  proto.renderE12ConditionCard = function (condition, index, count, names, allConditions) {
    const descriptor = this.getE12ConditionDescriptor(condition.operator);
    const settings = condition.settings || {};
    const groupIds = Array.from(new Set((allConditions || []).map(item => item.groupId || 'group-1')));
    const groupId = condition.groupId || 'group-1';
    if (!groupIds.includes(groupId)) groupIds.push(groupId);
    const firstInGroup = !(allConditions || []).slice(0, index).some(item => (item.groupId || 'group-1') === groupId);
    const datalistId = `e12-condition-values-${esc(condition.id)}`;
    const isVisual = condition.isVisualExpression === true || condition.isVisualExpression === 'true';
    const regexAdvanced = !isVisual && (descriptor.advanced || /regex|match/i.test(condition.operator));
    const schemaFields = (descriptor.fields || []).filter(field => !['pattern', 'flags'].includes(field.key || field.name)).map(field => {
      const key = field.key || field.name;
      const value = settings[key] !== undefined ? settings[key] : (field.default !== undefined ? field.default : '');
      return `<label class="vl-field-group"><span class="vl-field-label">${esc(field.label || key)}</span><input class="js-linker-input e1-condition-setting" data-condition-setting="${esc(key)}" value="${esc(value)}" placeholder="${esc(field.placeholder || '')}"></label>`;
    }).join('');
    return `<div class="e1-repeat-card e12-condition-card ${condition.enabled === false ? 'is-disabled' : ''}" data-condition-id="${esc(condition.id)}" data-condition-group="${esc(groupId)}">
      <div class="e1-repeat-head"><span class="e12-card-title"><label class="e12-enable"><input type="checkbox" class="e1-condition-enabled" ${boolAttr(condition.enabled)}><span></span></label><strong>شرط ${index + 1}</strong><code>${esc(condition.id)}</code></span><div class="vl-row-actions"><button type="button" class="vl-mini-btn" data-e1-command="condition-up" ${index ? '' : 'disabled'} title="تحريك لأعلى"><i class="fas fa-arrow-up"></i></button><button type="button" class="vl-mini-btn" data-e1-command="condition-down" ${index < count - 1 ? '' : 'disabled'} title="تحريك لأسفل"><i class="fas fa-arrow-down"></i></button><button type="button" class="vl-mini-btn danger" data-e1-command="delete-condition"><i class="fas fa-trash"></i></button></div></div>
      <div class="e12-condition-groupbar"><label data-e13-tip="الشروط داخل المجموعة الواحدة تُحسب معاً كوحدة واحدة"><span>المجموعة</span><select class="js-linker-select e1-condition-group">${groupIds.map((id, groupIndex) => opt(id, `المجموعة ${groupIndex + 1}`, groupId)).join('')}</select></label><label data-e13-tip="AND: يجب تحقق الكل · OR: يكفي تحقق واحد"><span>${firstInGroup ? 'ربط المجموعة' : 'الربط داخلها'}</span><select class="js-linker-select ${firstInGroup ? 'e1-condition-group-join' : 'e1-condition-join'}">${opt('AND', 'AND · و', firstInGroup ? condition.groupJoin : condition.join)}${opt('OR', 'OR · أو', firstInGroup ? condition.groupJoin : condition.join)}</select></label></div>
      ${isVisual ? this.renderE13ExpressionBuilder(condition, names) : `<div class="e12-condition-expression">
        <label class="vl-field-group"><span class="vl-field-label">القيمة اليسرى</span><input class="js-linker-input e1-condition-left" list="${datalistId}" value="${esc(condition.left)}" placeholder="inputValue"><datalist id="${datalistId}">${names.map(name => `<option value="${esc(name)}"></option>`).join('')}</datalist></label>
        <label class="vl-field-group"><span class="vl-field-label">نوع المقارنة</span><select class="js-linker-select e1-condition-op">${this.renderE12DescriptorOptions(this.getE12ConditionDescriptors(), condition.operator, { comparison: 'المقارنة', number: 'الأرقام', text: 'النصوص والمصفوفات', presence: 'الوجود والفراغ', boolean: 'Boolean', regex: 'Regex متقدم' })}</select></label>
        ${descriptor.requiresRight === false ? '<div class="vl-field-help e12-condition-no-right">لا يحتاج هذا الشرط قيمة مقارنة.</div>' : `<label class="vl-field-group"><span class="vl-field-label">القيمة اليمنى</span><input class="js-linker-input e1-condition-right" value="${esc(condition.right)}" placeholder="قيمة المقارنة"></label><label class="vl-field-group"><span class="vl-field-label">مصدر القيمة</span><select class="js-linker-select e1-condition-right-type">${opt('literal', 'قيمة ثابتة', condition.rightType)}${opt('expression', 'قراءة / متغير / Expression', condition.rightType)}</select></label>`}
        ${schemaFields}
        <div class="vl-field-help vl-span-2 e13-enable-visual-wrap"><button type="button" class="vl-link-button" data-e1-command="expr-enable-visual"><i class="fas fa-diagram-project"></i> التحويل إلى Expression بصري</button><small>ابنِ الشرط كقطع متداخلة بدل كتابة نص واحد.</small></div>
      </div>`}
      ${regexAdvanced ? `<details class="e12-regex-advanced" ${settings.flags || settings.pattern ? 'open' : ''}><summary><i class="fas fa-asterisk"></i> إعدادات Regex المتقدمة</summary><div class="vl-fields-grid"><label class="vl-field-group"><span class="vl-field-label">Pattern (اختياري بدل القيمة اليمنى)</span><input class="js-linker-input e1-condition-setting" data-condition-setting="pattern" value="${esc(settings.pattern || '')}" placeholder="^[A-Z]"></label><label class="vl-field-group"><span class="vl-field-label">Flags</span><input class="js-linker-input e1-condition-setting" data-condition-setting="flags" value="${esc(settings.flags || '')}" placeholder="i أو gi"></label></div><p>يُنشأ RegExp فقط عند اختيار مشغّل Regex؛ بقية الشروط تبقى مبسطة.</p></details>` : ''}
    </div>`;
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * E1.3.3 — Visual Expression Builder (شروط كقطع متداخلة).
   * كل عقدة تُرسم بعنصر يحمل data-expr-node-id، فتبقى معرفات العقد محفوظة في
   * DOM ويعاد ربط أي تعديل بالعقدة الصحيحة عند القراءة (syncE1DraftFromUI).
   * ──────────────────────────────────────────────────────────────────────── */

  const E13_MAX_RENDER_DEPTH = 7;
  const E13_PRESET_CATEGORIES = {
    strings: ['النصوص', ['empty', 'notEmpty', 'contains', 'notContains', 'startsWith', 'endsWith', 'length', 'lowercase', 'uppercase', 'trim']],
    arrays: ['المصفوفات', ['arrayLength', 'arrayContains', 'arrayEmpty', 'arrayNotEmpty']],
    checks: ['فحوصات', ['exists', 'notExists', 'isValidNumber', 'isBoolean', 'email']],
    casts: ['تحويلات', ['toNumber', 'toString', 'toBoolean']]
  };
  const E13_BINARY_OPERATOR_LABELS = {
    '===': '=== · يساوي', '!==': '!== · لا يساوي', '>': '> · أكبر من', '<': '< · أصغر من',
    '>=': '>= · أكبر أو يساوي', '<=': '<= · أصغر أو يساوي',
    '+': '+ · جمع / دمج', '-': '- · طرح', '*': '× · ضرب', '/': '÷ · قسمة', '%': '% · باقي القسمة'
  };
  const E13_REFERENCE_TYPE_LABELS = {
    state: 'متغير حالة (State)', read: 'قيمة مقروءة (Read)', loopVariable: 'متغير حلقة (Loop)',
    parameter: 'باراميتر Function', event: 'الحدث (event)'
  };

  /* ── لوحة الشرح الجانبية (E13 Docs): تشرح كل مفهوم بصورة ذهنية + مثال ── */

  const E13_REF_ONE_LINERS = {
    state: 'صندوق قيمة يتذكّر بين الضغطات',
    read: 'قيمة التقطتها خطوة القراءة لحظة الحدث',
    loopVariable: 'العنصر الحالي ورقم اللفة داخل التكرار',
    parameter: 'قيمة تدخل للدالة وقت استدعائها',
    event: 'معلومات عن الحدث الذي وقع حالاً'
  };

  const E13_DOCS = {
    'refType.state': {
      title: 'متغير حالة (State)',
      body: ['صندوق له اسم يحتفظ بقيمة، والقيمة تفضل محفوظة بين كل تشغيل للحدث والتشغيل اللي بعده.', 'البرنامج يقدر يقرأ اللي جوه الصندوق أو يغيّره في أي لحظة.'],
      example: { code: 'counter = counter + 1', note: 'صندوق اسمه counter يبدأ بـ 0: الضغطة الأولى تخلّيه 1، والثانية 2 — القيمة «اتفتكرت» لأنها متخزنة في الصندوق.' },
      when: 'استخدمه لما تحتاج تتذكّر شيئاً بين الضغطات (عدّاد، وضع مفتوح/مغلق…). بتنشئه من تبويب «البيانات».'
    },
    'refType.read': {
      title: 'قيمة مقروءة (Read)',
      body: ['اسم لنتيجة قراءة ضبطتها في خطوة «القراءة» — الصندوق ده بيتملى بالقيمة لحظة وقوع الحدث.'],
      example: { code: 'inputValue', note: 'قراءة اسمها inputValue بتلتقط نص حقل الإدخال. لو المستخدم كاتب «أحمد» → قيمتها "أحمد".' },
      when: 'استخدمه للفحص على اللي كتبه أو اختاره المستخدم الآن.'
    },
    'refType.loopVariable': {
      title: 'متغير حلقة (Loop)',
      body: ['موجود داخل التكرار فقط: item = العنصر اللي عليه الدور دلوقتي، و index = رقم اللفة (يبدأ من 0).'],
      example: { code: 'items = ["تفاح", "موز"]', note: 'اللفة الأولى: item = "تفاح" و index = 0. اللفة الثانية: item = "موز" و index = 1.' },
      when: 'استخدمه فقط لو الشرط داخل حلقة تكرار.'
    },
    'refType.parameter': {
      title: 'باراميتر Function',
      body: ['خانة في «استمارة» الدالة، بتتملى بقيمة وقت الاستدعاء — كل استدعاء ممكن يبعت قيمة مختلفة.'],
      example: { code: 'function greet(name) {... }', note: 'لو استدعيت greet("سارة") فقيمة name داخل الدالة = "سارة".' },
      when: 'استخدمه لو الشرط داخل Function من تبويب «الدوال».'
    },
    'refType.event': {
      title: 'الحدث (event)',
      body: ['ورقة معلومات عن اللي حصل حالاً: مين العنصر اللي اتضغط، أنهي مفتاح اتكبس، فين الماوس…'],
      example: { code: 'event.target.value', note: 'قيمة العنصر اللي وقع عليه الحدث — مفيدة مع أحداث الكتابة (input).' },
      when: 'استخدمه لما تحتاج تفاصيل الحدث نفسه مش قيمة مخزنة.'
    },
    'reference.name': {
      title: 'اسم المرجع',
      body: ['اكتب اسم الصندوق اللي عايز قيمته — نفس الاسم اللي ظهر في خطوة «القراءة» أو تبويب «البيانات».', 'افتح القائمة المنسدلة وهتلاقي الأسماء المتاحة جاهزة.'],
      when: 'لو الاسم طابق قراءة أو متغيراً موجوداً، هيتربط تلقائياً وتظهر شارة «مرتبط».'
    },
    'reference.linked': {
      title: 'مرتبط / غير مرتبط',
      body: ['مرتبط: القطعة ماسكة «المعرّف الثابت» للقراءة أو المتغير — لو غيّرت اسمه لاحقاً يفضل الشرط شغالاً صح.', 'غير مرتبط: اسم حر لسه ما اتطابقش — أول ما يطابق اسماً موجوداً هيتربط لوحده.']
    },
    'literal.string': { title: 'قيمة ثابتة — نص', body: ['قيمة بتكتبها بنفسك وما بتتغيرش وقت التشغيل.'], example: { code: '"مرحبا"', note: 'النص بيتكتب بين علامتي تنصيص في الكود المولد.' } },
    'literal.number': { title: 'قيمة ثابتة — رقم', body: ['رقم صريح يدخل في مقارنة أو عملية حسابية.'], example: { code: '10', note: 'مثال: العدّاد أكبر من 10.' } },
    'literal.boolean': { title: 'قيمة ثابتة — صح/خطأ (Boolean)', body: ['قيمة منطقية بحالتين فقط: true (صح) أو false (خطأ).'], example: { code: 'true / false', note: 'مثال: قارن متغير «مفتوح؟» بـ true.' } },
    'literal.null': { title: 'بدون قيمة (null)', body: ['معناها «لا يوجد شيء» — مفيدة لفحص هل القيمة موجودة أصلاً أم لا.'] },
    'literal.value': { title: 'القيمة الثابتة', body: ['اكتب القيمة نفسها هنا.', 'انتبه: "10" كنص غير 10 كرقم — النوع بيحدد طريقة المقارنة.'] },
    'property.main': {
      title: 'خاصية من كائن',
      body: ['وصول لمعلومة داخل شيء أكبر — زي ما تفتح ورقة وتقرأ خانة معينة منها.'],
      example: { code: 'event.target.value', note: 'event ورقة الحدث ← جوّاها target (العنصر) ← وجوّاه value (قيمته الحالية).' }
    },
    'property.access': {
      title: 'الوصول المباشر (.) والآمن (?.)',
      body: ['المباشر يفترض أن الشيء موجود، ولو مش موجود الكود يقف بخطأ.', 'الآمن يسأل الأول «موجود؟» — لو لأ يرجّع undefined ويكمل من غير كسر.']
    },
    'binary.variant': { title: 'نوع الجمع (+)', body: ['علامة + ليها وضعان:', 'جمع أرقام: 2 + 3 = 5.', 'دمج نصوص: "أب" + "ت" = "أبت".'] },
    'logical.and': { title: 'AND · و', body: ['يرجع «صح» فقط لو الطرفان تحققا معاً.'], example: { code: '(a) && (b)', note: 'مثال: الاسم ليس فارغاً و العمر أكبر من 18 — لازم الشرطين مع بعض.' } },
    'logical.or': { title: 'OR · أو', body: ['يكفي تحقق طرف واحد عشان النتيجة تبقى «صح».'], example: { code: '(a) || (b)', note: 'مثال: مشترك أو معه كوبون — أي واحدة تكفي للدخول.' } },
    'unary.main': { title: 'النفي (!) والسالب (-)', body: ['! تقلب القيمة المنطقية: صح تبقى خطأ والعكس.', '- تخلي الرقم سالباً.'], example: { code: '!isOpen', note: 'لو isOpen = خطأ → !isOpen = صح. مفيد لفحص «القائمة مقفولة؟».' } },
    'group.main': { title: 'أقواس ( )', body: ['بتلمّ جزءاً ليُحسب أولاً — نفس فكرة أقواس الرياضيات.'], example: { code: '(a + b) * c', note: 'من غير الأقواس الضرب ينفذ الأول؛ بالأقواس الجمع ينفذ الأول.' } },
    'wrap.main': { title: 'لفّ داخل…', body: ['بياخد القطعة الحالية ويحطها جوه عملية أكبر بدل ما تبدأ من الصفر.'], example: { code: 'counter  ←  counter > 10', note: 'عندك counter؟ لفّه داخل «مقارنة» فيصبح الطرف الأول وتكمل الطرف الثاني.' }, list: ['خيارات اللف في القائمة:', 'مقارنة / حساب ← القطعة تصبح الطرف الأول وتكمل الثاني', 'و / أو ← تربط القطعة بشرط ثانٍ', 'نفي (!) ← يقلب نتيجتها: صح تبقى خطأ', 'أقواس ( ) ← تجميع يُحسب أولاً', 'عملية جاهزة ← القطعة تصبح المُدخل'] },
    'nodeType.placeholder': { title: 'جزء غير مكتمل', body: ['مكان محجوز فاضي — اختر نوع القيمة من قائمة «النوع» عشان تكمله.', 'التعبير لا يصلح للحفظ وفيه أجزاء غير مكتملة.'] },
    'nodeType.legacyExpression': { title: 'تعبير قديم (نصي)', body: ['جزء محفوظ كنص من نسخة قديمة — شغّال لكنه بلا فحص بصري.', 'جرّب «إعادة بناء تلقائية» أو ابنه من جديد قطعة قطعة.'] },
    'action.target': { title: 'العنصر المستهدف (Target)', body: ['العنصر اللي الإجراء هيتطبق عليه — هو اللي هيتغير.', 'ممكن يكون غير عنصر المصدر: تضغط زراً (مصدر) فتتغير فقرة (هدف).'], when: 'اختر من القائمة أو اضغط «اختر من المعاينة» وحدده بالماوس مباشرة.' },
    'element.pick': { title: 'اختيار عنصر', body: ['حدد العنصر اللي هتؤخذ منه القيمة.'], when: 'اختر من القائمة أو من المعاينة مباشرة.' },
    'action.value': { title: 'خانة القيمة', body: ['القيمة اللي هيستخدمها الإجراء.', 'معناها يتحدد من «مصدر القيمة» اللي جنبها: ثابتة كما كتبتها، أو اسم صندوق يُجاب محتواه وقت التشغيل.'], example: { code: 'inputValue', note: 'مع مصدر «قراءة/متغير»: يظهر اللي كتبه المستخدم فعلاً، مش كلمة inputValue.' } },
    'action.styleProperty': { title: 'الخاصية (CSS Property)', body: ['اسم خاصية CSS اللي هتتغير — بالإنجليزية زي ما تكتبها في ملف CSS.'], example: { code: 'display · color · font-size', note: 'display تتحكم في الظهور: block يُظهر العنصر، و none يخفيه.' } },
    'action.styleValue': { title: 'قيمة الخاصية (CSS Value)', body: ['اكتب قيمة CSS مباشرة من غير علامات تنصيص — المولد يتكفل بالباقي.', 'لو كتبت اسم قراءة أو متغير معروف (زي inputValue) هتُستخدم قيمته الفعلية وقت التشغيل.'], example: { code: 'none / red / 16px', note: 'display + none = إخفاء العنصر · display + block = إظهاره.' } },
    'action.className': { title: 'اسم الكلاس (Class)', body: ['اسم كلاس CSS من غير نقطة — يتضاف للعنصر أو يتشال منه فيتغير شكله دفعة واحدة.'], example: { code: 'active', note: 'في CSS تكتب ‎.active { ... }‎ وهنا تكتب active فقط.' } },
    'action.method': { title: 'طريقة التطبيق', body: ['تحدد كيف يُنفَّذ الإجراء بالضبط — بدّل بين الخيارات ولاحظ وصف كل واحد.'] },
    'action.variableName': { title: 'اسم المتغير', body: ['اسم صندوق State اللي هيتعدل — لازم يكون معرفاً في تبويب «البيانات».'], example: { code: 'counter', note: 'زيادة counter بمقدار 1 مع كل ضغطة = عدّاد نقرات.' } },
    'action.step': { title: 'المقدار', body: ['كم يزيد أو ينقص المتغير في كل تنفيذ للإجراء.'] },
    'action.functionName': { title: 'اسم الدالة', body: ['الدالة اللي هتستدعى — عرّفها أولاً في تبويب «الدوال».'] },
    'action.arguments': { title: 'قيم الاستدعاء (Arguments)', body: ['قيم تتبعت للدالة مفصولة بفواصل — تملى باراميترات الدالة بالترتيب.'], example: { code: 'inputValue, 5', note: 'الباراميتر الأول ياخد inputValue والثاني ياخد 5.' } },
    'action.arrayName': { title: 'اسم المصفوفة', body: ['اسم صندوق Array اللي هيتضاف إليه العنصر الجديد.'] },
    'action.tag': { title: 'نوع العنصر (HTML Tag)', body: ['نوع العنصر الجديد اللي هيتنشأ: div أو p أو li…'] },
    'action.resultName': { title: 'اسم النتيجة', body: ['صندوق جديد يتخزن فيه ناتج الاستدعاء لتستخدمه في إجراءات لاحقة.'] }
  };

  const E13_BINARY_OPERATOR_DOCS = {
    '===': 'يساوي تماماً (بالقيمة والنوع)', '!==': 'لا يساوي',
    '>': 'أكبر من', '<': 'أصغر من', '>=': 'أكبر من أو يساوي', '<=': 'أصغر من أو يساوي',
    '+': 'جمع أرقام أو دمج نصوص (حسب «نوع الجمع»)', '-': 'طرح', '*': 'ضرب', '/': 'قسمة', '%': 'باقي القسمة'
  };

  const E13_PRESET_DOC_LINES = {
    empty: 'يشيل الفراغات من الطرفين ثم يسأل: النص فاضي؟',
    notEmpty: 'يتأكد أن فيه كتابة حقيقية مش مجرد مسافات.',
    contains: 'يدوّر على جزء معين داخل النص.',
    notContains: 'يتأكد أن الجزء غير موجود في النص.',
    startsWith: 'يبص على أول النص فقط.',
    endsWith: 'يبص على آخر النص فقط.',
    length: 'يعدّ حروف النص ويرجع رقماً.',
    lowercase: 'يرجع نسخة كل حروفها الإنجليزية صغيرة.',
    uppercase: 'يرجع نسخة كل حروفها الإنجليزية كبيرة.',
    trim: 'يشيل الفراغات من أول النص وآخره.',
    arrayLength: 'يعدّ عناصر القائمة ويرجع رقماً.',
    arrayContains: 'يسأل: العنصر ده موجود في القائمة؟',
    arrayEmpty: 'يسأل: القائمة فاضية تماماً؟',
    arrayNotEmpty: 'يسأل: القائمة فيها عناصر؟',
    exists: 'يسأل: القيمة موجودة ومش null؟',
    notExists: 'يسأل: القيمة غير موجودة أو null؟',
    isValidNumber: 'يسأل: القيمة تنفع رقماً حقيقياً؟ "12" تنفع، "أبج" لأ.',
    isBoolean: 'يسأل: نوع القيمة صح/خطأ (Boolean)؟',
    email: 'يفحص هل شكل النص شكل بريد إلكتروني سليم.',
    toNumber: 'يحوّل القيمة لرقم: "12" تبقى 12.',
    toString: 'يحوّل القيمة لنص: 12 يبقى "12".',
    toBoolean: 'يحوّل لصح/خطأ: النص الفاضي والصفر → خطأ، وغيرهما → صح.'
  };

  proto.getE13DocForElement = function (element) {
    const staticKey = element.dataset ? element.dataset.e13Doc : '';
    const dynamicKind = element.dataset ? element.dataset.e13DocDynamic : '';
    if (staticKey) return E13_DOCS[staticKey] || null;
    if (!dynamicKind) return null;
    const value = element.value;

    if (dynamicKind === 'refType') {
      const doc = E13_DOCS['refType.' + value];
      if (!doc) return null;
      const others = Object.keys(E13_REF_ONE_LINERS).filter(key => key !== value)
        .map(key => `${(E13_REFERENCE_TYPE_LABELS[key] || key).split(' (')[0]}: ${E13_REF_ONE_LINERS[key]}`);
      return Object.assign({}, doc, { list: ['الأنواع الأخرى:'].concat(others) });
    }
    if (dynamicKind === 'actionValueType') {
      if (value === 'literal') return { title: 'مصدر القيمة: قيمة ثابتة', body: ['اللي مكتوب في خانة القيمة هيستخدم كما هو حرفياً.', 'كتبت «أهلاً»؟ النص «أهلاً» نفسه هو اللي هيظهر.'] };
      if (value === 'upload') return { title: 'مصدر القيمة: رفع صورة (Data URL)', body: ['ترفع صورة من جهازك وتتخزن داخل الكود كنص طويل.', 'مناسب للصور الصغيرة فقط — الكبيرة تثقل الصفحة.'] };
      return { title: 'مصدر القيمة: قراءة / متغير', body: ['اكتب في خانة القيمة اسم صندوق موجود (قراءة أو متغير)، والقيمة الفعلية هتتجاب منه لحظة التنفيذ.', 'كتبت inputValue؟ هيظهر اللي المستخدم كتبه في الحقل، مش كلمة inputValue.'], when: 'مش فاكر الأسماء؟ راجع خطوة «القراءة» أو تبويب «البيانات».' };
    }
    if (dynamicKind === 'literalType') return E13_DOCS['literal.' + value] || E13_DOCS['literal.value'];
    if (dynamicKind === 'binaryOperator') {
      const isComparison = ['===', '!==', '>', '<', '>=', '<='].includes(value);
      return {
        title: isComparison ? 'مقارنة بين قيمتين' : 'عملية حسابية',
        body: [
          `المشغل الحالي: ${value} · ${E13_BINARY_OPERATOR_DOCS[value] || ''}`,
          isComparison ? 'ياخد الطرفين ويرجع صح أو خطأ.' : 'يحسب قيمة جديدة من الطرفين.'
        ],
        example: isComparison
          ? { code: `counter ${value} 10`, note: 'لو counter = 12 والمشغل >= فالنتيجة صح (true).' }
          : { code: value === '%' ? '7 % 2' : `price ${value} count`, note: value === '%' ? 'باقي قسمة 7 على 2 = 1 — مفيد لمعرفة زوجي/فردي.' : 'الناتج رقم جديد يدخل في المقارنة أو العرض.' },
        list: ['كل العمليات في القائمة:'].concat(Object.keys(E13_BINARY_OPERATOR_DOCS).map(op => `${op} ← ${E13_BINARY_OPERATOR_DOCS[op]}`))
      };
    }
    if (dynamicKind === 'logicalOperator') return value === '||' ? E13_DOCS['logical.or'] : E13_DOCS['logical.and'];
    if (dynamicKind === 'preset') {
      const registryEntry = (core.PRESET_REGISTRY || {})[value];
      if (!registryEntry) return null;
      let exampleCode = '';
      try { exampleCode = registryEntry.generate('inputValue', '"نص"'); } catch (error) { exampleCode = ''; }
      return {
        title: `عملية جاهزة: ${registryEntry.reviewLabel || value}`,
        body: [E13_PRESET_DOC_LINES[value] || 'عملية معدّة مسبقاً بتطبّق على «المُدخل» وترجع النتيجة.', 'غيّر الاختيار من القائمة والشرح هيتحدث.'],
        example: exampleCode ? { code: exampleCode, note: 'الكود الفعلي الذي سيتولد لهذه العملية.' } : null
      };
    }
    if (dynamicKind === 'nodeType') {
      const typeOneLiners = {
        placeholder: 'مكان فاضي محجوز — اختر نوعه أولاً',
        literal: 'قيمة تكتبها بنفسك (نص / رقم / صح-خطأ)',
        reference: 'قيمة من صندوق موجود (قراءة أو متغير)',
        property: 'معلومة من داخل كائن (مثل event.target.value)',
        binary: 'مقارنة أو حساب بين طرفين',
        logical: 'ربط شرطين بـ «و» أو «أو»',
        unary: 'نفي (!) أو سالب (-)',
        group: 'أقواس تجمع جزءاً ليُحسب أولاً',
        preset: 'فحص أو تحويل جاهز (يحتوي على، ليس فارغاً…)'
      };
      const typeLabels = core.EXPRESSION_TYPE_LABELS_AR || {};
      const fullList = ['كل أنواع القطع في القائمة:'].concat(Object.keys(typeOneLiners).map(key => `${typeLabels[key] || key} ← ${typeOneLiners[key]}`));
      const aliases = {
        literal: 'literal.value', reference: 'refType.state', property: 'property.main',
        binary: null, logical: 'logical.and', unary: 'unary.main', group: 'group.main',
        placeholder: 'nodeType.placeholder', legacyExpression: 'nodeType.legacyExpression'
      };
      let baseDoc = null;
      if (value === 'binary') baseDoc = { title: 'مقارنة / حساب', body: ['قطعة بطرفين: تقارن بينهما (يساوي/أكبر…) أو تحسب منهما (جمع/طرح…).'], example: { code: 'counter > 10', note: 'الطرف الأول والثاني ممكن يكونوا أي قطع تانية.' } };
      else if (value === 'preset') baseDoc = { title: 'عملية جاهزة', body: ['فحص أو تحويل معمول مسبقاً: «يحتوي على»، «ليس فارغاً»، «تحويل لرقم»…', 'أسهل بداية للمبتدئ — اختر العملية واملأ المُدخل.'] };
      else if (value === 'reference') baseDoc = { title: 'قراءة / متغير', body: ['قطعة بتجيب قيمة من صندوق موجود: قراءة، متغير حالة، باراميتر…'] };
      else baseDoc = E13_DOCS[aliases[value]] || { title: typeLabels[value] || value, body: [typeOneLiners[value] || ''] };
      return Object.assign({}, baseDoc, { list: fullList });
    }
    return null;
  };

  proto.ensureE13DocPanel = function () {
    if (this._e13DocPanel && document.body.contains(this._e13DocPanel)) return this._e13DocPanel;
    const panel = document.createElement('aside');
    panel.id = 'e13-doc-panel';
    panel.className = 'e13-doc-panel';
    panel.hidden = true;
    document.body.appendChild(panel);
    this._e13DocPanel = panel;
    if (!this._e13DocGlobalBound) {
      this._e13DocGlobalBound = true;
      /* إخفاء تلقائي: أي حركة ماوس خارج البيلدر واللوحة، أو تمرير، أو Escape */
      document.addEventListener('mouseover', event => {
        if (!this._e13DocPanel || this._e13DocPanel.hidden) return;
        const node = event.target;
        const inside = node && node.closest && (node.closest('#e1-content') || node.closest('#e13-doc-panel'));
        if (!inside) this.hideE13DocPanel();
      });
      document.addEventListener('scroll', event => {
        if (!this._e13DocPanel || this._e13DocPanel.hidden) return;
        if (event.target && event.target.closest && event.target.closest('#e13-doc-panel')) return;
        this.hideE13DocPanel();
      }, true);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') this.hideE13DocPanel();
      });
    }
    return panel;
  };

  proto.hideE13DocPanel = function () {
    if (this._e13DocHideTimer) { clearTimeout(this._e13DocHideTimer); this._e13DocHideTimer = null; }
    if (this._e13DocPanel) this._e13DocPanel.hidden = true;
    this._e13DocAnchor = null;
  };

  proto.scheduleE13DocPanelHide = function () {
    if (this._e13DocHideTimer) clearTimeout(this._e13DocHideTimer);
    this._e13DocHideTimer = setTimeout(() => { this._e13DocHideTimer = null; this.hideE13DocPanel(); }, 200);
  };

  proto.showE13DocPanel = function (anchor) {
    const doc = this.getE13DocForElement(anchor);
    if (!doc) return;
    const panel = this.ensureE13DocPanel();
    const bodyHtml = (doc.body || []).map(line => `<p>${esc(line)}</p>`).join('');
    const exampleHtml = doc.example ? `<div class="e13-doc-example"><span>مثال</span><code dir="ltr">${esc(doc.example.code)}</code>${doc.example.note ? `<p>${esc(doc.example.note)}</p>` : ''}</div>` : '';
    const whenHtml = doc.when ? `<p class="e13-doc-when"><i class="fas fa-hand-point-left"></i> ${esc(doc.when)}</p>` : '';
    const listHtml = doc.list && doc.list.length ? `<ul class="e13-doc-list">${doc.list.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : '';
    panel.innerHTML = `<header><i class="fas fa-graduation-cap"></i><strong>${esc(doc.title)}</strong></header>${bodyHtml}${exampleHtml}${whenHtml}${listHtml}`;
    panel.style.visibility = 'hidden';
    panel.hidden = false;
    const dialog = anchor.closest ? anchor.closest('.e1-dialog') : null;
    const dialogRect = dialog ? dialog.getBoundingClientRect() : { left: window.innerWidth / 2 };
    const anchorRect = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { top: 100 };
    const panelWidth = 280;
    let left = dialogRect.left - panelWidth - 14;
    if (left < 8) left = 8;
    let top = anchorRect.top - 10;
    const maxTop = window.innerHeight - panel.offsetHeight - 10;
    if (top > maxTop) top = maxTop;
    if (top < 10) top = 10;
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.visibility = '';
    this._e13DocAnchor = anchor;
    if (this._e13DocHideTimer) { clearTimeout(this._e13DocHideTimer); this._e13DocHideTimer = null; }
  };

  proto.e13DefaultNode = function (type) {
    const placeholder = () => ({ type: 'placeholder' });
    const map = {
      placeholder: { type: 'placeholder' },
      literal: { type: 'literal', dataType: 'string', value: '' },
      reference: { type: 'reference', referenceType: 'state', name: '' },
      property: { type: 'property', object: placeholder(), property: '', accessMode: 'strict' },
      binary: { type: 'binary', operator: '===', variant: 'arithmetic', left: placeholder(), right: placeholder() },
      logical: { type: 'logical', operator: '&&', left: placeholder(), right: placeholder() },
      unary: { type: 'unary', operator: '!', argument: placeholder() },
      group: { type: 'group', expression: placeholder() },
      preset: { type: 'preset', presetType: 'notEmpty', arguments: [placeholder()] }
    };
    return core.normalizeExpressionV2(clone(map[type] || map.placeholder));
  };

  proto.e13PresetArgumentCount = function (presetType) {
    const registryEntry = (core.PRESET_REGISTRY || {})[presetType];
    return 1 + ((registryEntry && registryEntry.argumentTypes) || []).length;
  };

  proto.renderE13TypeOptions = function (selected) {
    const labels = core.EXPRESSION_TYPE_LABELS_AR || {};
    const order = ['placeholder', 'literal', 'reference', 'property', 'binary', 'logical', 'unary', 'group', 'preset'];
    const options = order.map(type => opt(type, labels[type] || type, selected));
    if (selected === 'legacyExpression') options.unshift(opt('legacyExpression', labels.legacyExpression || 'تعبير قديم', selected));
    return options.join('');
  };

  proto.renderE13PresetOptions = function (selected) {
    const registry = core.PRESET_REGISTRY || {};
    const used = new Set();
    const groups = Object.keys(E13_PRESET_CATEGORIES).map(key => {
      const [label, ids] = E13_PRESET_CATEGORIES[key];
      const items = ids.filter(id => registry[id]).map(id => { used.add(id); return opt(id, registry[id].reviewLabel || id, selected); }).join('');
      return items ? `<optgroup label="${esc(label)}">${items}</optgroup>` : '';
    }).join('');
    const rest = Object.keys(registry).filter(id => !used.has(id)).map(id => opt(id, registry[id].reviewLabel || id, selected)).join('');
    return groups + (rest ? `<optgroup label="أخرى">${rest}</optgroup>` : '');
  };

  proto.renderE13ExpressionSlot = function (label, child, names, depth) {
    return `<div class="e13-expr-slot"><span class="e13-expr-slot-label">${esc(label)}</span>${this.renderE13ExpressionNode(child, names, depth + 1)}</div>`;
  };

  proto.renderE13ExpressionNode = function (rawNode, names, depth) {
    const node = core.normalizeExpressionV2(rawNode);
    const level = depth || 0;
    if (level > E13_MAX_RENDER_DEPTH) {
      return `<div class="e13-expr-node e13-too-deep" data-expr-node-id="${esc(node.id)}" data-expr-node-type="${esc(node.type)}"><i class="fas fa-layer-group"></i> تعبير عميق جداً — بسّطه أو قسّمه على شرطين. <code>${esc(core.generateExpressionV2(node, this.visualLinkDraft))}</code></div>`;
    }
    const typeLabels = core.EXPRESSION_TYPE_LABELS_AR || {};
    const canUnwrap = ['group', 'unary', 'binary', 'logical', 'property', 'preset'].includes(node.type);
    const isLegacy = node.type === 'legacyExpression';
    let body = '';

    if (node.type === 'literal') {
      const dataTypeSelect = `<label class="e13-expr-field-wrap"><span>النوع</span><select class="js-linker-select e13-expr-select" data-expr-field="dataType" data-e13-doc-dynamic="literalType">${opt('string', 'نص', node.dataType)}${opt('number', 'رقم', node.dataType)}${opt('boolean', 'صحيح/خطأ', node.dataType)}${opt('null', 'بدون قيمة (null)', node.dataType)}</select></label>`;
      let valueField = '';
      if (node.dataType === 'boolean') valueField = `<label class="e13-expr-field-wrap"><span>القيمة</span><select class="js-linker-select e13-expr-select" data-expr-field="value" data-e13-doc="literal.boolean">${opt('true', 'صحيح (true)', String(node.value))}${opt('false', 'خطأ (false)', String(node.value))}</select></label>`;
      else if (node.dataType === 'null') valueField = '<span class="e13-expr-null-note">لا شيء (null)</span>';
      else valueField = `<label class="e13-expr-field-wrap e13-grow"><span>القيمة</span><input class="js-linker-input e13-expr-input" data-expr-field="value" data-e13-doc="literal.value" value="${esc(node.value)}" placeholder="${node.dataType === 'number' ? '0' : 'اكتب النص'}"></label>`;
      body = `<div class="e13-expr-fields">${dataTypeSelect}${valueField}</div>`;
    } else if (node.type === 'reference') {
      const referenceOptions = Object.keys(E13_REFERENCE_TYPE_LABELS).map(key => opt(key, E13_REFERENCE_TYPE_LABELS[key], node.referenceType)).join('');
      const referenceListId = `e13-ref-names-${esc(node.id)}`;
      const referenceNames = [...new Set([...(names || []), 'item', 'index', 'event', 'sourceElement'])];
      const linkedBadge = node.sourceId
        ? '<span class="e13-expr-linked" data-e13-doc="reference.linked"><i class="fas fa-link"></i> مرتبط</span>'
        : '<span class="e13-expr-unlinked" data-e13-doc="reference.linked"><i class="fas fa-link-slash"></i> غير مرتبط</span>';
      body = `<div class="e13-expr-fields"><label class="e13-expr-field-wrap"><span>المصدر</span><select class="js-linker-select e13-expr-select" data-expr-field="referenceType" data-e13-doc-dynamic="refType">${referenceOptions}</select></label><label class="e13-expr-field-wrap e13-grow"><span>الاسم</span><input class="js-linker-input e13-expr-input" data-expr-field="name" data-e13-doc="reference.name" list="${referenceListId}" value="${esc(node.name)}" placeholder="inputValue"><datalist id="${referenceListId}">${referenceNames.map(name => `<option value="${esc(name)}"></option>`).join('')}</datalist></label>${linkedBadge}</div>`;
    } else if (node.type === 'property') {
      body = `<div class="e13-expr-fields"><label class="e13-expr-field-wrap e13-grow"><span>اسم الخاصية</span><input class="js-linker-input e13-expr-input" data-expr-field="property" data-e13-doc="property.main" value="${esc(node.property)}" placeholder="value"></label><label class="e13-expr-field-wrap"><span>الوصول</span><select class="js-linker-select e13-expr-select" data-expr-field="accessMode" data-e13-doc="property.access">${opt('strict', 'مباشر (.)', node.accessMode)}${opt('safe', 'آمن (?.)', node.accessMode)}</select></label></div>${this.renderE13ExpressionSlot('الكائن', node.object, names, level)}`;
    } else if (node.type === 'binary') {
      const operatorOptions = Object.keys(E13_BINARY_OPERATOR_LABELS).map(op => opt(op, E13_BINARY_OPERATOR_LABELS[op], node.operator)).join('');
      const variantField = node.operator === '+' ? `<label class="e13-expr-field-wrap"><span>نوع الجمع</span><select class="js-linker-select e13-expr-select" data-expr-field="variant" data-e13-doc="binary.variant">${opt('arithmetic', 'جمع أرقام', node.variant)}${opt('concat', 'دمج نصوص', node.variant)}</select></label>` : '';
      body = `<div class="e13-expr-fields"><label class="e13-expr-field-wrap"><span>العملية</span><select class="js-linker-select e13-expr-select" data-expr-field="operator" data-e13-doc-dynamic="binaryOperator">${operatorOptions}</select></label>${variantField}</div>${this.renderE13ExpressionSlot('الطرف الأول', node.left, names, level)}${this.renderE13ExpressionSlot('الطرف الثاني', node.right, names, level)}`;
    } else if (node.type === 'logical') {
      body = `<div class="e13-expr-fields"><label class="e13-expr-field-wrap"><span>الربط</span><select class="js-linker-select e13-expr-select" data-expr-field="operator" data-e13-doc-dynamic="logicalOperator">${opt('&&', 'AND · يجب تحقق الطرفين', node.operator)}${opt('||', 'OR · يكفي أحدهما', node.operator)}</select></label></div>${this.renderE13ExpressionSlot('الشرط الأول', node.left, names, level)}${this.renderE13ExpressionSlot('الشرط الثاني', node.right, names, level)}`;
    } else if (node.type === 'unary') {
      body = `<div class="e13-expr-fields"><label class="e13-expr-field-wrap"><span>العملية</span><select class="js-linker-select e13-expr-select" data-expr-field="operator" data-e13-doc="unary.main">${opt('!', '! · عكس منطقي', node.operator)}${opt('-', '- · سالب', node.operator)}</select></label></div>${this.renderE13ExpressionSlot('القيمة', node.argument, names, level)}`;
    } else if (node.type === 'group') {
      body = this.renderE13ExpressionSlot('داخل الأقواس', node.expression, names, level);
    } else if (node.type === 'preset') {
      const argumentCount = this.e13PresetArgumentCount(node.presetType);
      const args = Array.isArray(node.arguments) ? node.arguments.slice() : [];
      while (args.length < argumentCount) args.push({ type: 'placeholder' });
      const slots = args.slice(0, argumentCount).map((argument, argumentIndex) => this.renderE13ExpressionSlot(argumentIndex === 0 ? 'المُدخل' : `القيمة ${argumentIndex + 1}`, argument, names, level)).join('');
      body = `<div class="e13-expr-fields"><label class="e13-expr-field-wrap e13-grow"><span>العملية الجاهزة</span><select class="js-linker-select e13-expr-select" data-expr-field="presetType" data-e13-doc-dynamic="preset">${this.renderE13PresetOptions(node.presetType)}</select></label></div>${slots}`;
    } else if (node.type === 'legacyExpression') {
      body = `<div class="e13-expr-legacy-warning"><i class="fas fa-triangle-exclamation"></i><div><strong>تعبير قديم بصيغة نصية</strong><code dir="ltr">${esc(node.raw)}</code><p>هذا الجزء محفوظ كما هو ولن يستفيد من الفحص البصري. أعد بناءه لتحصل على التحقق والشرح العربي.</p><div class="e13-expr-legacy-actions"><button type="button" class="vl-mini-btn" data-e1-command="expr-migrate-legacy"><i class="fas fa-wand-magic-sparkles"></i> إعادة بناء تلقائية</button><button type="button" class="vl-mini-btn danger" data-e1-command="expr-clear-node"><i class="fas fa-eraser"></i> البدء من جديد</button></div></div></div>`;
    } else {
      body = '<div class="e13-expr-placeholder-hint"><i class="fas fa-hand-pointer"></i> اختر نوع القيمة من قائمة «النوع» بالأعلى — خطوة واحدة فقط.</div>';
    }

    return `<div class="e13-expr-node e13-type-${esc(node.type)}${isLegacy ? ' has-legacy' : ''}" data-expr-node-id="${esc(node.id)}" data-expr-node-type="${esc(node.type)}">
      <div class="e13-expr-node-head">
        <span class="e13-expr-node-badge">${esc(typeLabels[node.type] || node.type)}</span>
        ${isLegacy ? '' : `<select class="js-linker-select e13-expr-type-select" data-e13-doc-dynamic="nodeType" title="تغيير نوع هذه القطعة">${this.renderE13TypeOptions(node.type)}</select>`}
        <select class="js-linker-select e13-expr-wrap-select" data-e13-doc="wrap.main" title="لفّ هذه القطعة داخل عملية أكبر"><option value="">لفّ داخل…</option><option value="binary">مقارنة / حساب</option><option value="logical">و / أو</option><option value="unary">نفي (!)</option><option value="group">أقواس ( )</option><option value="preset">عملية جاهزة</option></select>
        <div class="vl-row-actions">
          ${canUnwrap ? '<button type="button" class="vl-mini-btn" data-e1-command="expr-unwrap" title="فك الغلاف والإبقاء على الجزء الداخلي"><i class="fas fa-box-open"></i></button>' : ''}
          ${node.type === 'placeholder' ? '' : '<button type="button" class="vl-mini-btn danger" data-e1-command="expr-clear-node" title="مسح هذه القطعة"><i class="fas fa-eraser"></i></button>'}
        </div>
      </div>
      ${body}
    </div>`;
  };

  proto.renderE13ExpressionBuilder = function (condition, names) {
    const definition = this.visualLinkDraft;
    const ast = condition.left && typeof condition.left === 'object' ? core.normalizeExpressionV2(condition.left) : this.e13DefaultNode('placeholder');
    const legacyCount = (() => { let count = 0; core.walkExpressionTree(ast, node => { if (node.type === 'legacyExpression') count += 1; }); return count; })();
    const validation = core.validateExpressionV2(ast, definition, 'boolean');
    const issues = [
      ...validation.errors.map(item => `<li class="is-error"><i class="fas fa-circle-xmark"></i>${esc(item.message || item)}</li>`),
      ...validation.warnings.map(item => `<li class="is-warning"><i class="fas fa-triangle-exclamation"></i>${esc(item.message || item)}</li>`)
    ].join('');
    const generated = core.generateExpressionV2(ast, definition);
    return `<div class="e13-expr-builder" data-expr-root-id="${esc(ast.id)}">
      <div class="e13-expr-toolbar">
        <span class="e13-expr-mode-badge"><i class="fas fa-diagram-project"></i> Expression بصري</span>
        ${legacyCount ? `<span class="e13-expr-legacy-count"><i class="fas fa-triangle-exclamation"></i> ${legacyCount} تعبير قديم يحتاج إعادة بناء</span>` : ''}
        <button type="button" class="vl-link-button" data-e1-command="expr-disable-visual"><i class="fas fa-rotate-left"></i> العودة للوضع البسيط</button>
      </div>
      <div class="e13-expr-tree">${this.renderE13ExpressionNode(ast, names, 0)}</div>
      <div class="e13-expr-review"><i class="fas fa-comment-dots"></i><span>${esc(core.explainExpressionInArabic(ast, definition))}</span></div>
      <div class="e13-expr-js"><span>الكود:</span><code dir="ltr">${esc(generated)}</code></div>
      ${issues ? `<ul class="e13-expr-issues">${issues}</ul>` : '<div class="e13-expr-ok"><i class="fas fa-circle-check"></i> التعبير مكتمل وصالح.</div>'}
    </div>`;
  };

  proto.applyE13ExpressionEdits = function (card, ast) {
    card.querySelectorAll('[data-expr-field]').forEach(field => {
      const wrapper = field.closest('[data-expr-node-id]');
      if (!wrapper) return;
      const node = core.findExpressionNodeById(ast, wrapper.dataset.exprNodeId);
      if (!node) return;
      const key = field.dataset.exprField;
      const value = field.type === 'checkbox' ? field.checked : field.value;
      if (key === 'name' && node.type === 'reference' && node.sourceId && value !== node.name) {
        node.sourceId = null; /* the user retargeted this reference by hand */
      }
      node[key] = value;
    });
    return ast;
  };

  proto.getE13ConditionFromNode = function (button) {
    const conditionCard = button.closest('[data-condition-id]');
    if (!conditionCard) return null;
    const conditions = this.getE12ConditionsForNode(button);
    const condition = conditions.find(item => item.id === conditionCard.dataset.conditionId);
    return condition ? { conditions, condition, conditionCard } : null;
  };

  proto.handleE13ExpressionCommand = function (command, button) {
    const context = this.getE13ConditionFromNode(button);
    if (!context) return false;
    const { condition } = context;
    const nodeWrapper = button.closest('[data-expr-node-id]');
    const nodeId = nodeWrapper ? nodeWrapper.dataset.exprNodeId : '';

    if (command === 'expr-enable-visual') {
      const settings = condition.settings || (condition.settings = {});
      settings.simpleBackup = { left: condition.left, operator: condition.operator, right: condition.right, rightType: condition.rightType };
      let ast = settings.visualBackup ? clone(settings.visualBackup) : null;
      if (!ast) {
        const mapped = core.mapConditionToExpressionAST(Object.assign({}, condition, { isVisualExpression: false }));
        ast = mapped ? mapped : { type: 'placeholder' };
      }
      condition.isVisualExpression = true;
      condition.left = core.normalizeExpressionV2(ast);
      core.linkExpressionReferences(condition.left, this.visualLinkDraft);
      delete settings.visualBackup;
      return true;
    }

    if (command === 'expr-disable-visual') {
      const settings = condition.settings || (condition.settings = {});
      if (condition.left && typeof condition.left === 'object') settings.visualBackup = clone(condition.left);
      const backup = settings.simpleBackup || {};
      condition.isVisualExpression = false;
      condition.left = typeof backup.left === 'string' && backup.left ? backup.left : this.getE12DefaultConditionLeft(button);
      condition.operator = backup.operator || 'notEmpty';
      condition.right = typeof backup.right === 'string' ? backup.right : '';
      condition.rightType = backup.rightType || 'literal';
      delete settings.simpleBackup;
      this.showToastNotice('عاد الشرط للوضع البسيط؛ الشجرة البصرية محفوظة ويمكن استرجاعها.');
      return true;
    }

    if (!condition.isVisualExpression || !condition.left || typeof condition.left !== 'object') return false;

    if (command === 'expr-clear-node' && nodeId) {
      const replacement = Object.assign(this.e13DefaultNode('placeholder'), { id: nodeId });
      condition.left = core.replaceExpressionNodeById(condition.left, nodeId, replacement);
      return true;
    }

    if (command === 'expr-unwrap' && nodeId) {
      const node = core.findExpressionNodeById(condition.left, nodeId);
      if (!node) return true;
      const child = node.type === 'group' ? node.expression
        : node.type === 'unary' ? node.argument
        : node.type === 'property' ? node.object
        : node.type === 'preset' ? (node.arguments || [])[0]
        : (node.type === 'binary' || node.type === 'logical') ? node.left
        : null;
      if (child) condition.left = core.replaceExpressionNodeById(condition.left, nodeId, child);
      return true;
    }

    if (command === 'expr-migrate-legacy' && nodeId) {
      const node = core.findExpressionNodeById(condition.left, nodeId);
      if (!node || node.type !== 'legacyExpression') return true;
      const migrated = core.attemptLegacyMigration(node.raw, this.visualLinkDraft);
      if (migrated && migrated.type !== 'legacyExpression') {
        condition.left = core.replaceExpressionNodeById(condition.left, nodeId, core.normalizeExpressionV2(migrated));
        core.linkExpressionReferences(condition.left, this.visualLinkDraft);
        this.showToastNotice('تمت إعادة بناء التعبير القديم تلقائياً.');
      } else {
        this.showToastNotice('تعذّرت إعادة البناء التلقائية؛ ابنِ التعبير يدوياً بقطع صغيرة.');
      }
      return true;
    }

    return false;
  };

  proto.handleE13ExpressionSelectChange = function (select) {
    const context = this.getE13ConditionFromNode(select);
    if (!context || !context.condition.isVisualExpression) return false;
    const { condition } = context;
    const wrapper = select.closest('[data-expr-node-id]');
    if (!wrapper || !condition.left || typeof condition.left !== 'object') return false;
    const nodeId = wrapper.dataset.exprNodeId;

    if (select.classList.contains('e13-expr-type-select')) {
      const currentNode = core.findExpressionNodeById(condition.left, nodeId);
      if (!currentNode || currentNode.type === select.value) return false;
      const replacement = Object.assign(this.e13DefaultNode(select.value), { id: nodeId });
      condition.left = core.replaceExpressionNodeById(condition.left, nodeId, replacement);
      return true;
    }

    if (select.classList.contains('e13-expr-wrap-select')) {
      const wrapType = select.value;
      select.value = '';
      const currentNode = core.findExpressionNodeById(condition.left, nodeId);
      if (!currentNode || !wrapType) return false;
      const parent = this.e13DefaultNode(wrapType);
      if (wrapType === 'unary') parent.argument = currentNode;
      else if (wrapType === 'group') parent.expression = currentNode;
      else if (wrapType === 'preset') parent.arguments = [currentNode];
      else parent.left = currentNode;
      condition.left = core.replaceExpressionNodeById(condition.left, nodeId, parent);
      return true;
    }

    if (select.classList.contains('e13-expr-select') && select.dataset.exprField === 'presetType') {
      const node = core.findExpressionNodeById(condition.left, nodeId);
      if (!node || node.type !== 'preset') return false;
      node.presetType = select.value;
      const argumentCount = this.e13PresetArgumentCount(select.value);
      node.arguments = Array.isArray(node.arguments) ? node.arguments : [];
      while (node.arguments.length < argumentCount) node.arguments.push(this.e13DefaultNode('placeholder'));
      node.arguments = node.arguments.slice(0, argumentCount);
      return true;
    }

    return true; /* بقية حقول e13 تُقرأ في applyE13ExpressionEdits؛ يكفي إعادة الرسم */
  };

  proto.renderE1ConditionsStep = function () {
    const names = [...this.visualLinkDraft.reads.map(read => read.name), ...(this.visualLinkDraft.variables || []).map(variable => variable.name), 'event.type', 'event.target.value'];
    const legacyExpressionCount = this.visualLinkDraft.conditions.reduce((total, condition) => {
      if ((condition.isVisualExpression === true || condition.isVisualExpression === 'true') && condition.left && typeof condition.left === 'object' && core.expressionContainsLegacy(condition.left)) return total + 1;
      return total;
    }, 0);
    const legacyBanner = legacyExpressionCount
      ? `<div class="e13-legacy-banner"><i class="fas fa-triangle-exclamation"></i><div><strong>${legacyExpressionCount === 1 ? 'يوجد شرط واحد يحتوي تعبيراً قديماً' : `توجد ${legacyExpressionCount} شروط تحتوي تعبيرات قديمة`}</strong><span>التعبيرات القديمة محفوظة كنص ولن تستفيد من الفحص البصري. افتح الشرط واستخدم «إعادة بناء تلقائية» أو ابنِه من جديد قطعةً قطعة.</span></div></div>`
      : '';
    const conditions = this.visualLinkDraft.conditions.map((condition, index) => this.renderE12ConditionCard(condition, index, this.visualLinkDraft.conditions.length, names, this.visualLinkDraft.conditions)).join('');
    return `<section class="e1-step-card"><div class="e1-step-question"><span>3</span><div><h3>متى تُنفّذ الإجراءات؟</h3><p>رتّب شروطًا متعددة واجمعها بـAND أو OR داخل مجموعات مستقلة.</p></div></div>${legacyBanner}<div class="e12-condition-legend"><span><b>داخل المجموعة</b> تُقرأ الشروط بالترتيب</span><i class="fas fa-arrow-left"></i><span><b>بين المجموعات</b> اختر AND أو OR</span></div><div class="e1-repeat-list">${conditions || '<div class="vl-empty-list">لا يوجد شرط؛ نفّذ مباشرة.</div>'}</div><div class="e12-add-actions"><button type="button" class="vl-add-row-btn" data-e1-command="add-condition"><i class="fas fa-plus"></i> إضافة شرط</button><button type="button" class="vl-add-row-btn secondary" data-e1-command="add-condition-group"><i class="fas fa-object-group"></i> إضافة مجموعة</button></div>${this.renderE11DestinationSummary('conditions')}</section>`;
  };

  proto.renderE1ElementField = function (className, selectedId, role, itemId) {
    return `<div class="vl-field-group vl-span-2" data-e13-doc="${role === 'action' ? 'action.target' : 'element.pick'}"><span class="vl-field-label">اختر العنصر</span><div class="e1-element-field"><select class="js-linker-select ${className}">${this.getCanvasElementOptions(selectedId)}</select><button type="button" class="btn btn-secondary" data-e1-command="pick-element" data-pick-role="${role}" data-item-id="${esc(itemId || '')}"><i class="fas fa-crosshairs"></i> اختر من المعاينة</button></div><button type="button" class="vl-inline-badge e1-focus-element" data-element-id="${esc(selectedId)}">${esc(this.getVisualElementLabel(selectedId))}</button></div>`;
  };

  proto.renderE1ActionsStep = function (actions, functionMode) {
    const cards = actions.map((action, index) => this.renderE1ActionCard(action, index, actions.length, functionMode)).join('');
    return `<section class="e1-step-card e12-actions-section"><div class="e1-step-question"><span>${functionMode ? 'ƒ' : '4'}</span><div><h3>${functionMode ? 'خطوات Function' : 'ماذا سيحدث؟'}</h3><p>كل إجراء مستقل: نوعه وTarget وترتيبه وحالته المؤقتة.</p></div></div><div class="e1-repeat-list" data-actions-container-id="main">${cards || '<div class="vl-empty-list">أضف إجراءً واحدًا على الأقل.</div>'}</div><div style="display:flex; gap:10px; margin-top:10px;"><button type="button" class="vl-add-row-btn" data-e1-command="add-action" style="flex:1;"><i class="fas fa-plus"></i> إضافة إجراء</button><button type="button" class="vl-add-row-btn secondary" data-e1-command="add-branch-action" style="flex:1;"><i class="fas fa-code-branch"></i> إضافة شرط متفرع (Branch)</button></div>${this.renderE11DestinationSummary(functionMode ? 'functions' : 'actions')}</section>`;
  };

  proto.getE12ActionDescriptors = function () {
    const registry = core.ACTION_TYPES || core.ACTION_LABELS || {};
    const labels = Object.assign({}, core.ACTION_LABELS || {}, {
      setText: 'تغيير النص',
      setHTML: 'تغيير HTML الداخلي',
      setSrc: 'تغيير الصورة src',
      setAlt: 'تغيير alt',
      setHref: 'تغيير الرابط href',
      setLinkText: 'تغيير نص الرابط',
      setTarget: 'تغيير target الرابط',
      setRel: 'تغيير rel الرابط'
    });
    const targetless = new Set(['callFunction', 'setVariable', 'incrementVariable', 'decrementVariable', 'toggleBoolean', 'alert', 'consoleLog', 'customCode', 'return']);
    
    return descriptorEntries(registry, labels).map(baseDescriptor => {
      const descriptor = Object.assign({}, (core.ACTION_SCHEMAS || {})[baseDescriptor.id] || {}, baseDescriptor);
      let category = descriptor.category || descriptor.group;
      
      // Classify D2 actions under 'content' category ("المحتوى والوسائط")
      const contentMediaActions = ['setText', 'setInnerText', 'setHTML', 'setSrc', 'setAlt', 'setHref', 'setLinkText', 'setTarget', 'setRel'];
      if (contentMediaActions.includes(baseDescriptor.id)) {
        category = 'content';
      }
      
      if (!category) {
        if (/class/i.test(descriptor.id)) category = 'classes';
        else if (/style|css/i.test(descriptor.id)) category = 'style';
        else if (/show|hide|visible/i.test(descriptor.id)) category = 'visibility';
        else if (/variable|counter|boolean|state/i.test(descriptor.id)) category = 'state';
        else if (/function/i.test(descriptor.id)) category = 'functions';
        else if (/form|input|select|submit|reset/i.test(descriptor.id)) category = 'forms';
        else if (/append|element|remove|attribute|dataset|focus|scroll/i.test(descriptor.id)) category = 'dom';
        else if (/event|dispatch|trigger/i.test(descriptor.id)) category = 'events';
        else if (/navigate|redirect|openUrl/i.test(descriptor.id)) category = 'navigation';
        else if (/custom/i.test(descriptor.id)) category = 'custom';
        else category = 'content';
      }
      
      const next = Object.assign({ category, requiresTarget: !targetless.has(descriptor.id) }, descriptor);
      
      // Customize fields list dynamically for D2 actions:
      if (descriptor.id === 'setText') {
        next.fields = [
          { key: 'value', store: 'value', label: 'النص الجديد', placeholder: 'اكتب النص أو اختر تعبيرًا' },
          { key: 'valueType', store: 'valueType', label: 'مصدر القيمة', type: 'select', options: [{ value: 'literal', label: 'نص ثابت' }, { value: 'expression', label: 'قراءة / متغير / Expression' }] },
          { key: 'method', store: 'params', label: 'طريقة التطبيق', type: 'select', options: [{ value: 'textContent', label: 'textContent (نص عادي)' }, { value: 'innerText', label: 'innerText (نص مرئي)' }, { value: 'innerHTML', label: 'innerHTML (محتوى HTML)' }] }
        ];
      } else if (descriptor.id === 'setSrc') {
        next.fields = [
          { key: 'value', store: 'value', label: 'مصدر الصورة (URL أو Data URL)', placeholder: 'رابط الصورة أو كود Data URL' },
          { key: 'valueType', store: 'valueType', label: 'نوع المصدر', type: 'select', options: [{ value: 'literal', label: 'رابط مباشر (URL)' }, { value: 'upload', label: 'رفع صورة من الجهاز (Data URL)' }, { value: 'expression', label: 'قراءة / متغير / Expression' }] },
          { key: 'alt', store: 'params', label: 'النص البديل Alt (اختياري)', placeholder: 'وصف الصورة للـ SEO' }
        ];
      } else if (descriptor.id === 'setHref') {
        next.fields = [
          { key: 'value', store: 'value', label: 'الرابط (href)', placeholder: 'مثال: https://google.com' },
          { key: 'valueType', store: 'valueType', label: 'مصدر الرابط', type: 'select', options: [{ value: 'literal', label: 'رابط ثابت' }, { value: 'expression', label: 'قراءة / متغير / Expression' }] },
          { key: 'text', store: 'params', label: 'نص الرابط (اختياري)', placeholder: 'تغيير النص الظاهر للرابط' },
          { key: 'target', store: 'params', label: 'مكان الفتح', type: 'select', options: [{ value: '', label: 'نفس التبويب (_self)' }, { value: '_blank', label: 'تبويب جديد (_blank)' }] },
          { key: 'rel', store: 'params', label: 'rel (اختياري)', placeholder: 'noopener noreferrer' }
        ];
      } else if (descriptor.id === 'setStyle') {
        /* خانتان واضحتان فقط؛ حقلا «القيمة/مصدر القيمة» العامان كانا بلا تأثير هنا */
        next.fields = [
          { key: 'property', store: 'params', label: 'الخاصية (CSS Property)', placeholder: 'display أو color أو font-size' },
          { key: 'styleValue', store: 'params', label: 'قيمة الخاصية (CSS Value)', placeholder: 'none أو red أو 16px — اكتبها مباشرة' }
        ];
      } else {
        next.fields = fieldDescriptors(descriptor.fields || []).reduce((fields, field) => {
          if (field.key === 'valueSource') {
            fields.push({ key: 'value', store: 'value', label: 'القيمة', placeholder: 'قراءة أو متغير أو نص' });
            fields.push({ key: 'valueType', store: 'valueType', label: 'مصدر القيمة', type: 'select', options: [{ value: 'expression', label: 'قراءة / متغير / Expression' }, { value: 'literal', label: 'قيمة ثابتة' }] });
          } else fields.push(field);
          return fields;
        }, []);
      }
      
      return next;
    });
  };

  proto.getE12ActionDescriptor = function (type) {
    return this.getE12ActionDescriptors().find(descriptor => descriptor.id === type) || { id: type, label: type, category: 'general', requiresTarget: true };
  };

  proto.getE12ActionFallbackFields = function (type) {
    const textValue = [{ key: 'value', store: 'value', label: 'القيمة', placeholder: 'inputValue أو نص' }, { key: 'valueType', store: 'valueType', label: 'مصدر القيمة', type: 'select', options: [{ value: 'expression', label: 'قراءة / متغير' }, { value: 'literal', label: 'نص ثابت' }] }];
    const fields = {
      setText: textValue, setInputValue: textValue, appendListItem: textValue.concat([{ key: 'arrayName', label: 'اسم Array (اختياري)', placeholder: 'tasks' }]),
      appendElement: textValue.concat([{ key: 'tag', label: 'HTML Tag', placeholder: 'div', default: 'div' }]),
      setStyle: [{ key: 'property', label: 'CSS Property', placeholder: 'color', default: 'color' }, { key: 'styleValue', label: 'CSS Value', placeholder: '#f59e0b' }],
      addClass: [{ key: 'className', label: 'Class', placeholder: 'active' }], removeClass: [{ key: 'className', label: 'Class', placeholder: 'active' }], toggleClass: [{ key: 'className', label: 'Class', placeholder: 'active' }],
      toggleVisibility: [{ key: 'method', label: 'الطريقة', type: 'select', options: ['hidden', 'display', { value: 'class', label: 'toggle Class' }] }, { key: 'className', label: 'Class عند الحاجة', placeholder: 'open' }],
      incrementVariable: [{ key: 'variableName', label: 'اسم المتغير', placeholder: 'counter' }, { key: 'step', label: 'المقدار', type: 'number', default: '1' }],
      decrementVariable: [{ key: 'variableName', label: 'اسم المتغير', placeholder: 'counter' }, { key: 'step', label: 'المقدار', type: 'number', default: '1' }],
      toggleBoolean: [{ key: 'variableName', label: 'اسم Boolean', placeholder: 'isOpen' }, { key: 'className', label: 'Class اختياري', placeholder: 'open' }],
      callFunction: [{ key: 'functionName', label: 'Function Name', placeholder: 'myFunction' }, { key: 'arguments', label: 'Arguments', placeholder: 'inputValue, counter' }, { key: 'await', label: 'انتظر النتيجة', type: 'boolean' }, { key: 'resultName', label: 'اسم النتيجة', placeholder: 'functionResult' }],
      custom: [{ key: 'value', store: 'value', label: 'Custom Logic', type: 'code', placeholder: 'targetElement.textContent = "تم";' }]
    };
    return fields[type] || [];
  };

  proto.renderE12ActionField = function (action, field) {
    const key = field.key || field.name;
    const store = field.store || (key === 'value' || key === 'valueType' || key === 'valueSource' ? key : 'params');
    let value;
    if (store === 'value') value = action.value;
    else if (store === 'valueType') value = action.valueType;
    else if (store === 'valueSource') value = action.valueSource;
    else value = ((action[store] || {})[key] !== undefined ? (action[store] || {})[key] : ((action.params || {})[key] !== undefined ? (action.params || {})[key] : (action.settings || {})[key]));
    if (value === undefined) value = field.default !== undefined ? field.default : '';
    const legacyClasses = { value: 'e1-action-value', valueType: 'e1-action-value-type', property: 'e1-action-property', styleValue: 'e1-action-style-value', className: 'e1-action-class', method: 'e1-action-method', variableName: 'e1-action-variable', step: 'e1-action-step', functionName: 'e1-action-function', arguments: 'e1-action-arguments', tag: 'e1-action-tag', arrayName: 'e1-action-array' };
    const classes = `e1-action-field ${legacyClasses[key] || ''}`;
    const attrs = `data-action-field="${esc(key)}" data-action-store="${esc(store)}"`;
    const fieldDocs = { value: 'action.value', styleValue: 'action.styleValue', property: 'action.styleProperty', className: 'action.className', method: 'action.method', variableName: 'action.variableName', step: 'action.step', functionName: 'action.functionName', arguments: 'action.arguments', arrayName: 'action.arrayName', tag: 'action.tag', resultName: 'action.resultName' };
    const docAttr = key === 'valueType' ? 'data-e13-doc-dynamic="actionValueType"' : (fieldDocs[key] ? `data-e13-doc="${fieldDocs[key]}"` : '');
    if (key === 'value' && action.type === 'setSrc' && action.valueType === 'upload') {
      const uniqueId = `action-upload-${action.id}`;
      const isBig = value && value.length > 500 * 1024 * 1.33;
      return `
        <label class="vl-field-group vl-span-2">
          <span class="vl-field-label">${esc(field.label || key)}</span>
          <div style="display: flex; gap: 8px; align-items: center; width: 100%;">
            <input class="js-linker-input ${classes}" ${attrs} id="${uniqueId}-input" type="text" value="${esc(value)}" placeholder="اختر صورة لتحويلها إلى Data URL..." readonly style="flex: 1; font-family: monospace; font-size: 10px; direction: ltr; opacity: 0.8; height: 26px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-tertiary); color: var(--text-main); padding: 0 8px;">
            <input type="file" accept="image/*" id="${uniqueId}-file" class="action-file-selector" style="display: none;">
            <button type="button" class="btn btn-secondary vl-action-upload-btn" data-target-input="${uniqueId}-input" data-file-input="${uniqueId}-file" style="height: 26px; padding: 0 10px; font-size: 10px; white-space: nowrap;">
              <i class="fas fa-upload" style="margin-left: 4px;"></i>اختر صورة
            </button>
          </div>
          <div id="${uniqueId}-warning" style="display: ${isBig ? 'block' : 'none'}; color: var(--accent-orange); font-size: 9px; margin-top: 4px;">
            ⚠️ تحذير: حجم الصورة كبير جداً، قد يؤثر ذلك على أداء الصفحة وحجم التصدير!
          </div>
        </label>
      `;
    }
    if (field.type === 'element' || field.type === 'target') return `<label class="vl-field-group" ${docAttr}><span class="vl-field-label">${esc(field.label || key)}</span><select class="js-linker-select ${classes}" ${attrs}>${this.getCanvasElementOptions(value)}</select></label>`;
    if (field.type === 'select') {
      const options = Array.isArray(field.options) ? field.options : Object.keys(field.options || {}).map(id => ({ value: id, label: field.options[id] }));
      return `<label class="vl-field-group" ${docAttr}><span class="vl-field-label">${esc(field.label || key)}</span><select class="js-linker-select ${classes}" ${attrs}>${options.map(entry => {
        const optionValue = typeof entry === 'string' ? entry : (entry.value !== undefined ? entry.value : entry.id);
        return opt(optionValue, typeof entry === 'string' ? entry : (entry.label || optionValue), value);
      }).join('')}</select></label>`;
    }
    if (field.type === 'boolean' || field.type === 'checkbox') return `<label class="e12-toggle-field" ${docAttr}><input type="checkbox" class="${classes}" ${attrs} ${value === true || value === 'true' ? 'checked' : ''}><span>${esc(field.label || key)}</span></label>`;
    if (field.type === 'code' || field.type === 'textarea' || field.multiline) return `<label class="vl-field-group vl-span-2" ${docAttr}><span class="vl-field-label">${esc(field.label || key)}</span>${action.type === 'custom' ? '<div class="vl-custom-vars">sourceElement · targetElement · actionTarget · event · state</div>' : ''}<textarea class="vl-code-input ${classes} ${key === 'value' ? 'e1-action-custom' : ''}" ${attrs} rows="${field.rows || 6}" placeholder="${esc(field.placeholder || '')}">${esc(value)}</textarea></label>`;
    return `<label class="vl-field-group" ${docAttr}><span class="vl-field-label">${esc(field.label || key)}</span><input class="js-linker-input ${classes}" ${attrs} type="${field.type === 'number' ? 'number' : (field.type === 'color' ? 'color' : 'text')}" value="${esc(value)}" placeholder="${esc(field.placeholder || '')}"></label>`;
  };

  /* جملة عربية واحدة توضح ماذا سيفعل الإجراء فعلياً — تغذية راجعة فورية للمبتدئ */
  proto.describeE12ActionInArabic = function (action) {
    const descriptor = this.getE12ActionDescriptor(action.type);
    const params = Object.assign({}, action.settings || {}, action.params || {});
    const target = action.targetId ? this.getVisualElementLabel(action.targetId) : 'العنصر المستهدف';
    const rawValue = action.value === undefined || action.value === null || typeof action.value === 'object' ? '' : String(action.value);
    const isExpression = action.valueType === 'expression';
    const valuePhrase = rawValue === '' ? 'قيمة فارغة' : (isExpression ? `قيمة الصندوق ${rawValue}` : `«${rawValue}»`);
    const map = {
      setText: () => `سيضع ${valuePhrase} كنصٍّ داخل ${target}.`,
      setInnerText: () => `سيضع ${valuePhrase} كنصٍّ مرئي داخل ${target}.`,
      setHTML: () => `سيستبدل محتوى HTML داخل ${target} بـ ${valuePhrase}.`,
      appendText: () => `سيضيف ${valuePhrase} في نهاية نص ${target}.`,
      setInputValue: () => `سيملأ حقل ${target} بـ ${valuePhrase}.`,
      setStyle: () => `سيغيّر خاصية ${params.property || 'CSS'} للعنصر ${target} إلى «${params.styleValue || ''}».`,
      setColor: () => `سيغيّر لون نص ${target} إلى ${valuePhrase}.`,
      setBackground: () => `سيغيّر خلفية ${target} إلى ${valuePhrase}.`,
      addClass: () => `سيضيف كلاس ${params.className || '؟'} إلى ${target}.`,
      removeClass: () => `سيزيل كلاس ${params.className || '؟'} من ${target}.`,
      toggleClass: () => `سيبدّل كلاس ${params.className || '؟'} على ${target}: موجود؟ يشيله. غير موجود؟ يضيفه.`,
      show: () => `سيُظهر ${target}.`,
      hide: () => `سيخفي ${target}.`,
      toggleVisibility: () => `سيبدّل ظهور ${target}: ظاهر؟ يخفيه. مخفي؟ يُظهره.`,
      setSrc: () => `سيغيّر صورة ${target}.`,
      setHref: () => `سيغيّر رابط ${target}${rawValue ? ` إلى ${valuePhrase}` : ''}.`,
      incrementVariable: () => `سيزيد الصندوق ${params.variableName || '؟'} بمقدار ${params.step || 1}.`,
      decrementVariable: () => `سينقص الصندوق ${params.variableName || '؟'} بمقدار ${params.step || 1}.`,
      toggleBoolean: () => `سيقلب قيمة ${params.variableName || '؟'} بين صح وخطأ.`,
      callFunction: () => `سيستدعي الدالة ${params.functionName || '؟'}${params.resultName ? ` ويخزن الناتج في ${params.resultName}` : ''}.`,
      custom: () => 'سينفذ الكود المخصص المكتوب في الخانة.'
    };
    return map[action.type] ? map[action.type]() : `${descriptor.label || action.type} — على ${target}.`;
  };

  proto.renderE1ActionCard = function (action, index, count, functionMode) {
    if (action.type === 'branch') {
      return this.renderE1BranchCard(action, index, count, functionMode);
    }
    const descriptor = this.getE12ActionDescriptor(action.type);
    let warningHtml = '';
    if (action.targetId) {
      const targetEl = document.getElementById(action.targetId);
      const tag = targetEl ? targetEl.tagName.toLowerCase() : '';
      if (action.type === 'setSrc' && tag !== 'img') {
        warningHtml = `<div class="vl-field-help vl-span-2" style="color: var(--accent-orange); font-size: 10px; font-weight: bold; padding: 6px; border: 1px dashed var(--accent-orange); border-radius: var(--radius-sm); margin-top: 4px; display: flex; align-items: center; gap: 6px;"><i class="fas fa-exclamation-triangle"></i><span>تنبيه: العنصر المستهدف ليس عنصر صورة (&lt;img&gt;).</span></div>`;
      } else if (action.type === 'setHref' && tag !== 'a') {
        warningHtml = `<div class="vl-field-help vl-span-2" style="color: var(--accent-orange); font-size: 10px; font-weight: bold; padding: 6px; border: 1px dashed var(--accent-orange); border-radius: var(--radius-sm); margin-top: 4px; display: flex; align-items: center; gap: 6px;"><i class="fas fa-exclamation-triangle"></i><span>تنبيه: العنصر المستهدف ليس عنصر رابط (&lt;a&gt;).</span></div>`;
      }
    }
    if (action.type === 'setText' && (action.params || {}).method === 'innerHTML') {
      warningHtml = `<div class="vl-field-help vl-span-2" style="color: var(--accent-orange); font-size: 10px; font-weight: bold; padding: 6px; border: 1px dashed var(--accent-orange); border-radius: var(--radius-sm); margin-top: 4px; display: flex; align-items: center; gap: 6px;"><i class="fas fa-exclamation-triangle"></i><span>تحذير: استخدام innerHTML قد يعرض الموقع لثغرات أمنية (XSS).</span></div>`;
    }
    return `<div class="e1-repeat-card e1-action-card ${action.enabled === false ? 'is-disabled' : ''}" data-action-id="${esc(action.id)}">
      <div class="e1-repeat-head"><span class="e12-card-title"><label class="e12-enable"><input type="checkbox" class="e1-action-enabled" ${boolAttr(action.enabled)}><span></span></label><strong>إجراء ${index + 1}</strong><code>${esc(action.id)}</code></span><div class="vl-row-actions"><button type="button" class="vl-mini-btn" data-e1-command="action-up" ${index ? '' : 'disabled'} title="تحريك لأعلى"><i class="fas fa-arrow-up"></i></button><button type="button" class="vl-mini-btn" data-e1-command="action-down" ${index < count - 1 ? '' : 'disabled'} title="تحريك لأسفل"><i class="fas fa-arrow-down"></i></button><button type="button" class="vl-mini-btn" data-e1-command="duplicate-action" title="تكرار"><i class="fas fa-clone"></i></button><button type="button" class="vl-mini-btn" data-e1-command="copy-action" title="نسخ JSON"><i class="fas fa-copy"></i></button><button type="button" class="vl-mini-btn danger" data-e1-command="delete-action" title="حذف"><i class="fas fa-trash"></i></button></div></div>
      <div class="vl-fields-grid">
        <label class="vl-field-group" data-e13-tip="نوع التغيير الذي سيحدث فعلياً — نص، شكل، ظهور، تنقل…"><span class="vl-field-label">نوع الإجراء</span><select class="js-linker-select e1-action-type">${this.renderE12DescriptorOptions(this.getE12ActionDescriptors(), action.type, E12_ACTION_CATEGORY_LABELS)}</select><small class="e12-field-feedback">${esc(descriptor.description || E12_ACTION_CATEGORY_LABELS[descriptor.category] || '')}</small></label>
        ${descriptor.requiresTarget === false && action.type !== 'custom' ? '<div class="vl-field-help">هذا الإجراء لا يحتاج Target.</div>' : this.renderE1ElementField('e1-action-target', action.targetId, 'action', action.id)}
        ${this.renderE1ActionParams(action, functionMode)}
        <div class="e13-action-summary vl-span-2"><i class="fas fa-play"></i><span>${esc(this.describeE12ActionInArabic(action))}</span></div>
        ${warningHtml}
      </div>
    </div>`;
  };

  /* functionMode بيتمرر من renderE1ActionCard (سطر 1598) وكان بيتسقط بصمت
     لأن الدالة مكانتش مصرّحة بيه — التصريح بيوضّح العقد ويخلي استخدامه سطر واحد. */
  proto.renderE1ActionParams = function (action, functionMode) {
    const descriptor = this.getE12ActionDescriptor(action.type);
    const described = Array.isArray(descriptor.fields) && descriptor.fields.length ? descriptor.fields : (Array.isArray(descriptor.settings) && descriptor.settings.length ? descriptor.settings : null);
    const fields = described || this.getE12ActionFallbackFields(action.type);
    return fields.length ? fields.map(field => this.renderE12ActionField(action, field)).join('') : '<div class="vl-field-help vl-span-2">لا يحتاج هذا الإجراء حقولًا إضافية.</div>';
  };

  proto.getE12VariableDescriptors = function () {
    const fallbacks = {
      Counter: { label: 'Counter', defaultValue: '0', inputType: 'number' }, Number: { label: 'Number', defaultValue: '0', inputType: 'number' },
      String: { label: 'String', defaultValue: '', inputType: 'text' }, Boolean: { label: 'Boolean', defaultValue: 'false', inputType: 'boolean' },
      Array: { label: 'Array', defaultValue: '[]', inputType: 'json' }, Object: { label: 'Object', defaultValue: '{}', inputType: 'json' },
      Set: { label: 'Set', defaultValue: '[]', inputType: 'json' }, Date: { label: 'Date', defaultValue: '', inputType: 'text' },
      Storage: { label: 'Storage', defaultValue: '', inputType: 'text' }
    };
    return descriptorEntries(core.VARIABLE_TYPES || {}, {}).map(descriptor => Object.assign({}, fallbacks[descriptor.id] || {}, descriptor));
  };

  proto.getE12VariableScopes = function () {
    const source = core.STATE_SCOPES || core.VARIABLE_SCOPES || ['outsideEvent', 'insideEvent', 'function'];
    return descriptorEntries(source, E12_SCOPE_LABELS).map(descriptor => Object.assign({ label: E12_SCOPE_LABELS[descriptor.id] || descriptor.label }, descriptor));
  };

  proto.renderE12InitialValueField = function (variable, descriptor) {
    const rawValue = variable.initialValue === undefined ? descriptor.defaultValue : variable.initialValue;
    if (descriptor.inputType === 'boolean' || variable.type === 'Boolean') return `<label class="vl-field-group"><span class="vl-field-label">القيمة الابتدائية</span><select class="js-linker-select e1-variable-initial">${opt('false', 'false · غير مفعّل', rawValue)}${opt('true', 'true · مفعّل', rawValue)}</select></label>`;
    if (descriptor.inputType === 'json' || ['Array', 'Object', 'Set'].includes(variable.type)) return `<label class="vl-field-group vl-span-2"><span class="vl-field-label">القيمة الابتدائية (${esc(variable.type)})</span><textarea class="vl-code-input e1-variable-initial" rows="3" dir="ltr" placeholder="${variable.type === 'Object' ? '{}' : '[]'}">${esc(rawValue)}</textarea><small class="e12-field-feedback">أدخل JSON صالحًا.</small></label>`;
    return `<label class="vl-field-group"><span class="vl-field-label">القيمة الابتدائية</span><input class="js-linker-input e1-variable-initial" type="${descriptor.inputType === 'number' ? 'number' : 'text'}" value="${esc(rawValue)}" placeholder="${esc(descriptor.defaultValue || '')}"></label>`;
  };

  proto.renderE12VariableSetting = function (variable, field) {
    const key = field.key || field.name; const settings = variable.settings || {};
    const value = settings[key] !== undefined ? settings[key] : (field.default !== undefined ? field.default : '');
    if (field.type === 'select') return `<label class="vl-field-group"><span class="vl-field-label">${esc(field.label || key)}</span><select class="js-linker-select e1-variable-setting" data-variable-setting="${esc(key)}">${(field.options || []).map(entry => { const id = typeof entry === 'string' ? entry : (entry.value !== undefined ? entry.value : entry.id); return opt(id, typeof entry === 'string' ? entry : (entry.label || id), value); }).join('')}</select></label>`;
    if (field.type === 'boolean' || field.type === 'checkbox') return `<label class="e12-toggle-field"><input type="checkbox" class="e1-variable-setting" data-variable-setting="${esc(key)}" ${value === true || value === 'true' ? 'checked' : ''}><span>${esc(field.label || key)}</span></label>`;
    return `<label class="vl-field-group"><span class="vl-field-label">${esc(field.label || key)}</span><input class="js-linker-input e1-variable-setting" data-variable-setting="${esc(key)}" value="${esc(value)}" placeholder="${esc(field.placeholder || '')}"></label>`;
  };

  proto.renderE1StateStep = function () {
    const descriptors = this.getE12VariableDescriptors();
    const scopes = this.getE12VariableScopes();
    const variables = (this.visualLinkDraft.variables || []).map((variable, index) => {
      const descriptor = descriptors.find(item => item.id === variable.type) || { id: variable.type, label: variable.type, defaultValue: '' };
      const rawName = this.e12RawVariableNames && this.e12RawVariableNames[variable.id] !== undefined ? this.e12RawVariableNames[variable.id] : variable.name;
      const validName = isIdentifier(rawName);
      const typeSettings = fieldDescriptors(descriptor.fields || []).map(field => this.renderE12VariableSetting(variable, field)).join('');
      return `<div class="e1-repeat-card e12-variable-card ${variable.enabled === false ? 'is-disabled' : ''}" data-variable-id="${esc(variable.id)}">
        <div class="e1-repeat-head"><span class="e12-card-title"><label class="e12-enable"><input type="checkbox" class="e1-variable-enabled" ${boolAttr(variable.enabled)}><span></span></label><strong>متغير ${index + 1}</strong><code>${esc(variable.id)}</code></span><div class="vl-row-actions"><button type="button" class="vl-mini-btn" data-e1-command="variable-up" ${index ? '' : 'disabled'}><i class="fas fa-arrow-up"></i></button><button type="button" class="vl-mini-btn" data-e1-command="variable-down" ${index < this.visualLinkDraft.variables.length - 1 ? '' : 'disabled'}><i class="fas fa-arrow-down"></i></button><button type="button" class="vl-mini-btn danger" data-e1-command="delete-variable"><i class="fas fa-trash"></i></button></div></div>
        <div class="vl-fields-grid">
          <label class="vl-field-group"><span class="vl-field-label">النوع</span><select class="js-linker-select e1-variable-type">${descriptors.map(item => opt(item.id, item.label, variable.type)).join('')}</select></label>
          <label class="vl-field-group ${validName ? '' : 'has-error'}"><span class="vl-field-label">اسم المتغير</span><input class="js-linker-input e1-variable-name" value="${esc(rawName)}" placeholder="counter"><small class="e12-name-feedback">${validName ? 'اسم JavaScript صالح.' : 'ابدأ بحرف أو _ أو $، ومن دون مسافات.'}</small></label>
          <label class="vl-field-group"><span class="vl-field-label">النطاق</span><select class="js-linker-select e1-variable-scope">${scopes.map(scope => opt(scope.id, scope.label, variable.scope || 'outsideEvent')).join('')}</select><small class="e12-field-feedback">يحدد مكان ووقت إنشاء المتغير.</small></label>
          ${this.renderE12InitialValueField(variable, descriptor)}
          ${typeSettings}
        </div>
      </div>`;
    }).join('');
    return `<section class="e1-step-card"><div class="e1-step-question"><span>5</span><div><h3>البيانات والحالة</h3><p>اختر النوع والنطاق والقيمة الابتدائية، مع تحقق مباشر من الاسم.</p></div></div><div class="e12-scope-note"><i class="fas fa-layer-group"></i><span><b>خارج الحدث</b> يحفظ القيمة بين التشغيلات، و<b>داخل الحدث</b> يبدأ من جديد كل مرة، و<b>Function</b> يخص الدوال.</span></div><div class="e1-repeat-list">${variables || '<div class="vl-empty-list">لا يحتاج هذا التفاعل إلى State.</div>'}</div><button type="button" class="vl-add-row-btn" data-e1-command="add-variable"><i class="fas fa-plus"></i> إضافة متغير</button>${this.renderE11DestinationSummary('state')}</section>`;
  };

  proto.normalizeE12Function = function (fn, index) {
    if (core.normalizeFunction) return core.normalizeFunction(fn, index || 0);
    const source = fn && typeof fn === 'object' ? fn : {};
    const parameters = Array.isArray(source.parameters) ? source.parameters.map((parameter, parameterIndex) => {
      if (parameter && typeof parameter === 'object') return { name: core.safeIdentifier(parameter.name, `arg${parameterIndex + 1}`), defaultValue: parameter.defaultValue === undefined ? '' : String(parameter.defaultValue) };
      return { name: core.safeIdentifier(parameter, `arg${parameterIndex + 1}`), defaultValue: '' };
    }) : [];
    return Object.assign({}, source, {
      id: source.id || core.makeId('function'), name: core.safeIdentifier(source.name, 'myFunction'),
      type: ['normal', 'arrow', 'async'].includes(source.type) ? source.type : 'normal', parameters,
      conditions: Array.isArray(source.conditions) ? source.conditions : [], actions: Array.isArray(source.actions) ? source.actions : [],
      returnValue: source.returnValue || '', customCode: source.customCode || '', enabled: source.enabled !== false, order: Number.isFinite(Number(source.order)) ? Number(source.order) : Number(index || 0)
    });
  };

  proto.createDefaultFunctionE12 = function (index) {
    const overrides = { id: core.makeId('function'), name: `myFunction${Number(index || 0) + 1}`, type: 'normal', parameters: [], conditions: [], actions: [], returnValue: '', customCode: '', enabled: true, order: Number(index || 0) };
    return core.createFunction ? core.createFunction(overrides, Number(index || 0)) : this.normalizeE12Function(overrides, index);
  };

  proto.getE12Functions = function () {
    if (!Array.isArray(this.visualLinkDraft.functions)) this.visualLinkDraft.functions = [];
    if (this.visualLinkDraft.builderMode === 'function' && !this.visualLinkDraft.functions.length) {
      const legacy = this.visualLinkDraft.functionDef;
      this.visualLinkDraft.functions.push(this.normalizeE12Function(legacy && legacy.name ? legacy : this.createDefaultFunctionE12(0), 0));
    }
    return this.visualLinkDraft.functions;
  };

  proto.renderE12FunctionEditor = function (fn, index) {
    const rawName = this.e12RawFunctionNames && this.e12RawFunctionNames[fn.id] !== undefined ? this.e12RawFunctionNames[fn.id] : fn.name;
    const parameters = (fn.parameters || []).map((parameter, parameterIndex) => {
      const normalized = parameter && typeof parameter === 'object' ? parameter : { name: parameter, defaultValue: '' };
      return `<div class="e12-function-param" data-function-param-index="${parameterIndex}"><span>${parameterIndex + 1}</span><input class="js-linker-input e1-function-param-name" value="${esc(normalized.name)}" placeholder="parameter"><input class="js-linker-input e1-function-param-default" value="${esc(normalized.defaultValue || '')}" placeholder="قيمة افتراضية (Expression)"><button type="button" class="vl-mini-btn danger" data-e1-command="delete-function-param" title="حذف Parameter"><i class="fas fa-times"></i></button></div>`;
    }).join('');
    const parameterNames = (fn.parameters || []).map(parameter => typeof parameter === 'string' ? parameter : parameter.name).filter(Boolean);
    const availableNames = [...parameterNames, ...this.visualLinkDraft.reads.map(read => read.name), ...(this.visualLinkDraft.variables || []).map(variable => variable.name), 'event'];
    const conditions = (fn.conditions || []).map((condition, conditionIndex) => this.renderE12ConditionCard(condition, conditionIndex, fn.conditions.length, availableNames, fn.conditions)).join('');
    const actions = (fn.actions || []).map((action, actionIndex) => this.renderE1ActionCard(action, actionIndex, fn.actions.length, true)).join('');
    return `<div class="e12-function-editor" data-function-editor="${esc(fn.id)}">
      <div class="e12-function-editor-head"><div><span>تحرير Function ${index + 1}</span><code>${esc(fn.id)}</code></div><button type="button" class="vl-link-button" data-e1-command="close-function-editor">إغلاق المحرر</button></div>
      <div class="vl-fields-grid">
        <label class="vl-field-group ${isIdentifier(rawName) ? '' : 'has-error'}"><span class="vl-field-label">Function Name</span><input class="js-linker-input e1-function-name" value="${esc(rawName)}" placeholder="myFunction"><small class="e12-name-feedback">${isIdentifier(rawName) ? 'اسم صالح للاستدعاء.' : 'اسم JavaScript غير صالح.'}</small></label>
        <label class="vl-field-group"><span class="vl-field-label">نوع Function</span><select class="js-linker-select e1-function-type">${opt('normal', 'Normal · function', fn.type)}${opt('arrow', 'Arrow · const fn = () =>', fn.type)}${opt('async', 'Async · async function', fn.type)}</select></label>
        <label class="e12-toggle-field"><input type="checkbox" class="e1-function-enabled" ${boolAttr(fn.enabled)}><span>Function مفعّلة وتظهر في الكود</span></label>
      </div>
      <section class="e12-function-subsection"><div class="e12-subsection-head"><div><h4>Parameters والقيم الافتراضية</h4><p>يُستخدم الاسم داخل الشروط والإجراءات بالأسفل.</p></div><button type="button" class="vl-add-row-btn compact" data-e1-command="add-function-param"><i class="fas fa-plus"></i> Parameter</button></div><div class="e12-function-params">${parameters || '<div class="vl-empty-list">لا توجد Parameters.</div>'}</div></section>
      <section class="e12-function-subsection" data-function-conditions><div class="e12-subsection-head"><div><h4>شروط Function</h4><p>اختيارية؛ تستخدم Parameters أو State أو Reads.</p></div><div class="e12-add-actions"><button type="button" class="vl-add-row-btn compact" data-e1-command="add-condition"><i class="fas fa-plus"></i> شرط</button><button type="button" class="vl-add-row-btn compact secondary" data-e1-command="add-condition-group"><i class="fas fa-object-group"></i> مجموعة</button></div></div><div class="e1-repeat-list">${conditions || '<div class="vl-empty-list">لا شروط داخل Function.</div>'}</div></section>
      <section class="e12-function-subsection" data-function-actions><div class="e12-subsection-head"><div><h4>إجراءات Function</h4><p>لكل إجراء Target وإعدادات وحالة مستقلة.</p></div><button type="button" class="vl-add-row-btn compact" data-e1-command="add-action"><i class="fas fa-plus"></i> إجراء</button></div><div class="e1-repeat-list">${actions || '<div class="vl-empty-list">لا إجراءات داخل Function.</div>'}</div></section>
      <section class="e12-function-subsection"><div class="vl-fields-grid"><label class="vl-field-group vl-span-2"><span class="vl-field-label">Return (Expression اختياري)</span><input class="js-linker-input e1-function-return" value="${esc(fn.returnValue || '')}" placeholder="result أو { ok: true }"></label><label class="vl-field-group vl-span-2"><span class="vl-field-label">Custom Code اختياري</span><div class="vl-custom-vars">Parameters · event · state · القيم المقروءة</div><textarea class="vl-code-input e1-function-custom" rows="6" placeholder="// كود إضافي داخل Function">${esc(fn.customCode || '')}</textarea></label></div></section>
    </div>`;
  };

  proto.renderE1FunctionsStep = function () {
    const functions = this.getE12Functions();
    const view = this.e12FunctionView || { editingId: '' };
    this.e12FunctionView = view;
    const cards = functions.map((fn, index) => `<div class="e12-function-item ${fn.enabled === false ? 'is-disabled' : ''}" data-function-id="${esc(fn.id)}"><span class="e12-function-kind"><i class="fas ${fn.type === 'async' ? 'fa-cloud-arrow-down' : (fn.type === 'arrow' ? 'fa-arrow-right-long' : 'fa-code')}"></i></span><div><strong>${esc(fn.name || 'myFunction')}</strong><small>${esc((fn.parameters || []).map(parameter => typeof parameter === 'string' ? parameter : parameter.name).join(', ')) || 'بدون Parameters'} · ${fn.type || 'normal'} · ${(fn.actions || []).length} إجراء</small></div><div class="vl-row-actions"><button type="button" class="vl-mini-btn" data-e1-command="function-up" ${index ? '' : 'disabled'}><i class="fas fa-arrow-up"></i></button><button type="button" class="vl-mini-btn" data-e1-command="function-down" ${index < functions.length - 1 ? '' : 'disabled'}><i class="fas fa-arrow-down"></i></button><button type="button" class="vl-mini-btn" data-e1-command="edit-function"><i class="fas fa-pen"></i></button><button type="button" class="vl-mini-btn" data-e1-command="duplicate-function"><i class="fas fa-clone"></i></button><button type="button" class="vl-mini-btn danger" data-e1-command="delete-function"><i class="fas fa-trash"></i></button></div></div>`).join('');
    const editingIndex = functions.findIndex(fn => fn.id === view.editingId);
    const editor = editingIndex >= 0 ? this.renderE12FunctionEditor(functions[editingIndex], editingIndex) : '';
    return `<section class="e1-step-card e12-functions-step"><div class="e1-step-question"><span>6</span><div><h3>Function Builder</h3><p>أنشئ عدة Functions عادية أو Arrow أو Async، مع Parameters وشروط وإجراءات وReturn.</p></div></div><div class="e12-functions-toolbar"><span>${functions.length} Function داخل هذا السلوك</span><button type="button" class="vl-add-row-btn" data-e1-command="add-function"><i class="fas fa-plus"></i> Function جديدة</button></div><div class="e12-functions-list">${cards || '<div class="vl-empty-list">لا توجد Functions. أضف واحدة عند الحاجة.</div>'}</div>${editor}${this.renderE11DestinationSummary('functions')}</section>`;
  };

  proto.getE11AdvancedGroups = function () {
    const groups = core.ADVANCED_TOOL_GROUPS || {};
    const normalized = Array.isArray(groups)
      ? groups.map(group => Object.assign({}, group, { id: group.id || group.category }))
      : Object.keys(groups).map(id => Object.assign({ id }, groups[id]));
    const known = new Set(normalized.map(group => group.id));
    this.getE11AdvancedTools().forEach(tool => {
      const id = this.getE11ToolGroupId(tool);
      if (!id || known.has(id)) return;
      const fallback = E12_GROUP_LABELS[id] || [id, 'fa-folder-open'];
      normalized.push({ id, label: fallback[0], icon: fallback[1], description: 'أدوات JavaScript منظمة ضمن منشئ E1.2.' });
      known.add(id);
    });
    return normalized;
  };

  proto.getE11AdvancedTools = function () {
    return Object.keys(core.ADVANCED_TOOLS || {}).map(id => Object.assign({ id }, core.ADVANCED_TOOLS[id]));
  };

  proto.getE11ToolGroupId = function (tool) {
    return tool.groupId || tool.group || tool.category || '';
  };

  proto.renderE11ToolCard = function (tool, searchCard) {
    const programmatic = tool.programmaticName || tool.operation || tool.id;
    return `<button type="button" class="e11-tool-card" data-e1-command="open-advanced-tool" data-tool-id="${esc(tool.id)}" data-tool-search="${esc(`${tool.label || ''} ${tool.description || ''} ${programmatic}`.toLowerCase())}" ${searchCard ? 'hidden' : ''}><span class="e11-tool-icon"><i class="fas ${esc(tool.icon || 'fa-code')}"></i></span><span><strong>${esc(tool.label || tool.id)}</strong><small>${esc(tool.description || 'عملية JavaScript منظمة قابلة للإضافة إلى التفاعل.')}</small><code>${esc(programmatic)}</code></span></button>`;
  };

  proto.renderE11ExistingOperations = function () {
    const operations = (this.visualLinkDraft.advancedOperations || []).slice().sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    if (!operations.length) return '<div class="vl-empty-list">لم تُضف عملية متقدمة بعد.</div>';
    const tools = core.ADVANCED_TOOLS || {};
    return operations.map(operation => {
      const tool = tools[operation.toolId] || {};
      return `<div class="e11-operation-row"><span><strong>${esc(tool.label || operation.toolId)}</strong><small>${esc(DESTINATION_LABELS[operation.destination] || operation.destination)}${operation.resultName ? ` · ${esc(operation.resultName)}` : ''}</small></span><span><button type="button" class="vl-mini-btn" data-e1-command="edit-advanced-operation" data-operation-id="${esc(operation.id)}"><i class="fas fa-pen"></i></button><button type="button" class="vl-mini-btn danger" data-e1-command="remove-advanced-operation" data-operation-id="${esc(operation.id)}"><i class="fas fa-trash"></i></button></span></div>`;
    }).join('');
  };

  proto.renderE11AdvancedField = function (field, value) {
    const key = field.key || field.name;
    const type = field.type || 'text';
    const label = field.label || key;
    const required = field.required ? 'required' : '';
    if (type === 'select') {
      const rawOptions = field.options || [];
      const options = Array.isArray(rawOptions) ? rawOptions : Object.keys(rawOptions).map(optionValue => [optionValue, rawOptions[optionValue]]);
      return `<label class="vl-field-group"><span class="vl-field-label">${esc(label)}</span><select class="js-linker-select e11-advanced-field" data-field-key="${esc(key)}" ${required}>${options.map(option => {
        const optionValue = typeof option === 'string' ? option : (Array.isArray(option) ? option[0] : (option.value !== undefined ? option.value : option.id));
        const optionLabel = typeof option === 'string' ? option : (Array.isArray(option) ? option[1] : (option.label || optionValue));
        return opt(optionValue, optionLabel, value);
      }).join('')}</select></label>`;
    }
    if (type === 'element' || type === 'target') {
      return `<div class="vl-field-group"><span class="vl-field-label">${esc(label)}</span><div class="e12-inline-picker"><select class="js-linker-select e11-advanced-field" data-field-key="${esc(key)}" ${required}>${this.getCanvasElementOptions(value)}</select><button type="button" class="vl-mini-btn" data-e1-command="pick-element" data-pick-role="advanced-setting" data-field-key="${esc(key)}" title="اختر من المعاينة"><i class="fas fa-crosshairs"></i></button></div></div>`;
    }
    if (type === 'checkbox' || type === 'boolean') {
      return `<label class="e11-checkbox-field"><input type="checkbox" class="e11-advanced-field" data-field-key="${esc(key)}" ${value === true || value === 'true' ? 'checked' : ''}><span>${esc(label)}</span></label>`;
    }
    if (type === 'textarea' || type === 'code') {
      return `<label class="vl-field-group vl-span-2"><span class="vl-field-label">${esc(label)}</span><textarea class="vl-code-input e11-advanced-field" data-field-key="${esc(key)}" rows="4" placeholder="${esc(field.placeholder || '')}" ${required}>${esc(value)}</textarea></label>`;
    }
    return `<label class="vl-field-group"><span class="vl-field-label">${esc(label)}</span><input class="js-linker-input e11-advanced-field" data-field-key="${esc(key)}" type="${type === 'number' ? 'number' : 'text'}" value="${esc(value)}" placeholder="${esc(field.placeholder || '')}" ${required}></label>`;
  };

  proto.renderE11AdvancedToolConfig = function (tool) {
    const view = this.e11AdvancedView || {};
    const draft = view.draft || core.createAdvancedOperation(tool.id);
    view.draft = draft;
    this.e11AdvancedView = view;
    const settings = draft.settings || {};
    const fields = (tool.fields || []).map(field => this.renderE11AdvancedField(field, settings[field.key || field.name] !== undefined ? settings[field.key || field.name] : (field.default !== undefined ? field.default : ''))).join('');
    const destinations = tool.destinations || tool.allowedDestinations || Object.keys(DESTINATION_LABELS);
    let preview = '';
    try { preview = core.previewAdvancedOperation ? core.previewAdvancedOperation(draft, this.visualLinkDraft) : core.generateAdvancedOperation(draft, this.visualLinkDraft, { preview: true }); } catch (error) { preview = ''; }
    return `<div class="e11-tool-config"><button type="button" class="e11-back" data-e1-command="back-advanced-tools"><i class="fas fa-arrow-right"></i> رجوع إلى الأدوات</button><div class="e11-tool-heading"><span class="e11-tool-icon"><i class="fas ${esc(tool.icon || 'fa-code')}"></i></span><div><h3>${esc(tool.label || tool.id)}</h3><p>${esc(tool.description || '')}</p><code>${esc(tool.programmaticName || tool.operation || tool.id)}</code></div></div><div class="vl-fields-grid e11-config-fields">${fields}<label class="vl-field-group"><span class="vl-field-label">أضف الناتج إلى</span><select class="js-linker-select e11-advanced-destination">${destinations.map(destination => opt(destination, DESTINATION_LABELS[destination] || destination, draft.destination)).join('')}</select></label>${tool.producesResult ? `<label class="vl-field-group"><span class="vl-field-label">اسم الناتج</span><input class="js-linker-input e11-advanced-result" value="${esc(draft.resultName || '')}" placeholder="resultValue"></label>` : ''}</div><div class="e11-code-preview ${preview ? '' : 'is-pending'}"><div><span>معاينة الكود</span><small>${preview ? 'تتحدث من الحقول أعلاه' : 'أكمل الحقول المطلوبة لعرض الكود'}</small></div>${preview ? `<pre class="js-code-preview" id="e11-operation-preview">${this.renderCodePreview(preview)}</pre>` : ''}</div><button type="button" class="btn btn-primary e11-add-operation" data-e1-command="save-advanced-operation"><i class="fas fa-plus"></i> ${view.editingId ? 'حفظ العملية' : 'إضافة إلى التفاعل'}</button></div>`;
  };

  proto.renderE11AdvancedToolsStep = function () {
    const view = this.e11AdvancedView || { groupId: '', toolId: '', editingId: '', draft: null };
    this.e11AdvancedView = view;
    const tools = this.getE11AdvancedTools();
    if (view.toolId && core.ADVANCED_TOOLS && core.ADVANCED_TOOLS[view.toolId]) {
      return `<section class="e1-step-card e11-advanced-step"><div class="e1-step-question"><span>7</span><div><h3>أدوات JavaScript المتقدمة</h3><p>اضبط أداة واحدة ثم أضف JSON المنظم إلى المكان المناسب.</p></div></div>${this.renderE11AdvancedToolConfig(Object.assign({ id: view.toolId }, core.ADVANCED_TOOLS[view.toolId]))}</section>`;
    }
    const activeTools = view.groupId ? tools.filter(tool => this.getE11ToolGroupId(tool) === view.groupId) : [];
    const groups = this.getE11AdvancedGroups();
    const browser = view.groupId
      ? `<button type="button" class="e11-back" data-e1-command="back-advanced-groups"><i class="fas fa-arrow-right"></i> رجوع إلى المجموعات</button><div class="e11-tools-grid">${activeTools.map(tool => this.renderE11ToolCard(tool, false)).join('')}</div>`
      : `<div class="e11-groups-grid">${groups.map(group => {
        const count = tools.filter(tool => this.getE11ToolGroupId(tool) === group.id).length;
        return `<button type="button" class="e11-group-card" data-e1-command="open-advanced-group" data-group-id="${esc(group.id)}"><span><i class="fas ${esc(group.icon || 'fa-folder-open')}"></i></span><strong>${esc(group.label || group.id)}</strong><small>${esc(group.description || '')}</small><em>${count} أداة</em></button>`;
      }).join('')}</div><div class="e11-search-results" hidden>${tools.map(tool => this.renderE11ToolCard(tool, true)).join('')}</div>`;
    return `<section class="e1-step-card e11-advanced-step"><div class="e1-step-question"><span>7</span><div><h3>أدوات JavaScript المتقدمة</h3><p>اختيارية ومغلقة افتراضيًا؛ افتح مجموعة واحدة ثم أداة واحدة فقط.</p></div></div><label class="e11-search"><i class="fas fa-search"></i><input class="js-linker-input e11-tool-search" placeholder="ابحث باسم عربي أو برمجي…"></label>${browser}<div class="e11-added-panel"><h4>العمليات المضافة</h4>${this.renderE11ExistingOperations()}</div></section>`;
  };

  proto.getE1Summary = function (definition) {
    if (definition.builderMode === 'function') {
      const functions = definition.functions || [];
      return `أنشئ ${functions.length} Function (${functions.map(fn => fn.name).join('، ') || 'بدون اسم'}) تنفّذ ${functions.reduce((sum, fn) => sum + (fn.actions || []).filter(action => action.enabled !== false).length, 0)} إجراء مفعّل.`;
    }
    const recipe = definition.builderMode === 'recipe' ? (core.RECIPE_TYPES[definition.recipeType] || {}).label : '';
    return `${recipe ? `وصفة ${recipe}: ` : ''}عند ${EVENT_LABELS[definition.event] || definition.event} على ${this.getVisualElementLabel(definition.sourceId)}، اقرأ ${definition.reads.filter(read => read.enabled !== false).length} قيمة، تحقّق من ${definition.conditions.filter(condition => condition.enabled !== false).length} شرط داخل ${new Set(definition.conditions.map(condition => condition.groupId || 'group-1')).size || 0} مجموعة، ثم نفّذ ${definition.actions.filter(action => action.enabled !== false).length} إجراء و${(definition.advancedOperations || []).filter(operation => operation.enabled !== false).length} عملية متقدمة على ${new Set(definition.actions.map(action => action.targetId).filter(Boolean)).size} Target.`;
  };

  /* جملة عربية واحدة تصف الشرط — تدعم الشروط البصرية (Expression AST) والقديمة. */
  proto.describeE12ConditionInArabic = function (condition, definition) {
    if (condition.isVisualExpression === true || condition.isVisualExpression === 'true') {
      return core.explainExpressionInArabic(condition.left, definition || this.visualLinkDraft);
    }
    const descriptor = this.getE12ConditionDescriptor(condition.operator);
    const leftText = typeof condition.left === 'object' ? (condition.left && condition.left.value) || '' : condition.left;
    return `${leftText} ${descriptor.label}${descriptor.requiresRight === false ? '' : ` ${typeof condition.right === 'object' ? '' : condition.right}`}`;
  };

  proto.renderE12ReviewSection = function (step, icon, title, content, count) {
    const canEdit = this.visualLinkDraft.builderMode !== 'function' || step === 6;
    return `<article class="e12-review-section"><header><span><i class="fas ${icon}"></i><strong>${esc(title)}</strong><em>${count}</em></span>${canEdit ? `<button type="button" class="vl-link-button" data-e1-command="edit-step" data-step="${step}"><i class="fas fa-pen"></i> تعديل</button>` : ''}</header><div>${content || '<span class="e12-review-empty">لا شيء في هذه الخطوة.</span>'}</div></article>`;
  };

  proto.renderE1ReviewStep = function () {
    const definition = this.visualLinkDraft;
    const variables = definition.state || definition.variables || [];
    const functions = definition.functions || [];
    const counts = { reads: definition.reads.length, conditions: definition.conditions.length, actions: definition.actions.length, state: variables.length, functions: functions.length, advanced: (definition.advancedOperations || []).length };
    const reads = definition.reads.map(read => `<p class="${read.enabled === false ? 'is-muted' : ''}"><code>${esc(read.name)}</code> ← ${esc(this.getE12ReadDescriptor(read.type).label)} ${read.elementId ? `من ${esc(this.getVisualElementLabel(read.elementId))}` : 'من Source'}</p>`).join('');
    const conditions = definition.conditions.map(condition => {
      const isVisual = condition.isVisualExpression === true || condition.isVisualExpression === 'true';
      const visualBadge = isVisual ? '<span class="e13-review-visual-badge"><i class="fas fa-diagram-project"></i> Expression</span> ' : '';
      const legacyBadge = isVisual && condition.left && typeof condition.left === 'object' && core.expressionContainsLegacy(condition.left)
        ? ' <span class="e13-review-legacy-badge" title="يحتوي تعبيراً قديماً يحتاج إعادة بناء بصري"><i class="fas fa-triangle-exclamation"></i> تعبير قديم</span>'
        : '';
      return `<p class="${condition.enabled === false ? 'is-muted' : ''}"><b>${esc(condition.groupId || 'group-1')}</b> · ${visualBadge}${esc(this.describeE12ConditionInArabic(condition, definition))}${legacyBadge}</p>`;
    }).join('');
    const actions = definition.actions.map((action, index) => this.renderActionReviewHtml(action, index, 0)).join('');
    const state = variables.map(variable => `<p class="${variable.enabled === false ? 'is-muted' : ''}"><code>${esc(variable.name)}</code> · ${esc(variable.type)} · ${esc(E12_SCOPE_LABELS[variable.scope] || variable.scope || 'outsideEvent')} = ${esc(variable.initialValue)}</p>`).join('');
    const functionRows = functions.map(fn => `<p class="${fn.enabled === false ? 'is-muted' : ''}"><code>${esc(fn.name)}</code> · ${esc(fn.type || 'normal')} · ${(fn.parameters || []).length} parameter · ${(fn.actions || []).length} إجراء${fn.returnValue ? ' · Return' : ''}</p>`).join('');
    const advanced = (definition.advancedOperations || []).map(operation => `<p class="${operation.enabled === false ? 'is-muted' : ''}">${esc(((core.ADVANCED_TOOLS || {})[operation.toolId] || {}).label || operation.toolId)} → ${esc(DESTINATION_LABELS[operation.destination] || operation.destination)}${operation.resultName ? ` باسم ${esc(operation.resultName)}` : ''}</p>`).join('');
    const sections = definition.builderMode === 'function'
      ? this.renderE12ReviewSection(6, 'fa-code', 'الدوال', functionRows, counts.functions)
      : [
        this.renderE12ReviewSection(1, 'fa-bolt', 'بداية السلوك', `<p>عند <b>${esc(EVENT_LABELS[definition.event] || definition.event)}</b> على ${esc(this.getVisualElementLabel(definition.sourceId))}</p>`, 1),
        this.renderE12ReviewSection(2, 'fa-arrow-down-wide-short', 'القراءات', reads, counts.reads),
        this.renderE12ReviewSection(3, 'fa-code-branch', 'الشروط والمجموعات', conditions, counts.conditions),
        this.renderE12ReviewSection(4, 'fa-list-check', 'الإجراءات بالترتيب', actions, counts.actions),
        this.renderE12ReviewSection(5, 'fa-database', 'الحالة والمتغيرات', state, counts.state),
        this.renderE12ReviewSection(6, 'fa-code', 'الدوال', functionRows, counts.functions),
        this.renderE12ReviewSection(7, 'fa-wand-magic-sparkles', 'الأدوات المتقدمة', advanced, counts.advanced)
      ].join('');
    return `<section class="e1-step-card e12-review-step"><div class="e1-step-question"><span>8</span><div><h3>راجع السلوك بالعربية</h3><p>انتقل مباشرة إلى أي خطوة للتعديل، ثم جرّب أو احفظ.</p></div></div><div class="e11-review-counts"><span>Reads <strong>${counts.reads}</strong></span><span>Conditions <strong>${counts.conditions}</strong></span><span>Actions <strong>${counts.actions}</strong></span><span>State <strong>${counts.state}</strong></span><span>Functions <strong>${counts.functions}</strong></span><span>Advanced <strong>${counts.advanced}</strong></span></div><div class="vl-summary"><i class="fas fa-circle-info"></i><span>${esc(this.getE1Summary(definition))}</span></div><div class="e12-review-sections">${sections}</div>${definition.settings.manualCode ? '<div class="vl-manual-warning">هذا رابط قديم محفوظ في Legacy Custom Code Mode؛ Metadata معروضة للتوافق ولم يُفقد الكود الأصلي.</div>' : ''}<details class="e1-code-review" open><summary>الكود المولد</summary><pre class="js-code-preview" id="e1-code-preview">${this.renderCodePreview(core.generateBlock(definition))}</pre><button type="button" class="btn btn-secondary" data-e1-command="copy-code"><i class="fas fa-copy"></i> نسخ</button></details></section>`;
  };

  proto.renderE1FunctionBuilder = function (holder) {
    holder.innerHTML = `${this.renderE1FunctionsStep()}<details class="e1-code-review" open><summary>معاينة Functions المولدة</summary><pre class="js-code-preview" id="e1-code-preview">${this.renderCodePreview(core.generateBlock(this.visualLinkDraft))}</pre></details>`;
  };

  proto.deriveRecipeConfigE1 = function (definition) {
    const firstRead = definition.reads[0] || {};
    const firstAction = definition.actions[0] || { params: {} };
    const variable = definition.variables[0] || {};
    const config = {
      sourceId: definition.sourceId, inputId: firstRead.elementId || '', targetId: firstAction.targetId || definition.targetId || '',
      className: firstAction.params.className || 'open', method: firstAction.params.method || 'hidden',
      variableName: variable.name || (definition.recipeType === 'counter' ? 'counter' : 'menuOpen'),
      initialValue: variable.initialValue || '0', step: firstAction.params.step || '1',
      direction: firstAction.type === 'decrementVariable' ? 'decrement' : 'increment', arrayName: firstAction.params.arrayName || ''
    };
    return config;
  };

  proto.renderComponentCatalogCards = function () {
    return `<div class="component-catalog-toolbar">
      <button type="button" class="btn btn-secondary component-chooser-open" data-e1-command="open-component-wizard"><i class="fas fa-wand-magic-sparkles"></i> ساعدني أختار المكوّن المناسب</button>
    </div>
    <div class="component-catalog-grid">
      ${Object.entries(COMPONENT_UX_CATALOG).map(([type, item]) => `<article class="component-choice-card" data-component-card="${type}">
        <div class="component-choice-heading"><span class="component-choice-icon"><i class="fas ${item.icon}"></i></span><div><h4>${item.name}</h4><small>${item.english}</small></div><span class="component-difficulty">${item.difficulty}</span></div>
        <p>${item.description}</p>
        <p class="component-use"><i class="fas fa-circle-info"></i> ${item.use}</p>
        <details class="component-examples"><summary>أمثلة استخدام</summary><ul>${item.examples.map(example => `<li>${example}</li>`).join('')}</ul></details>
        <button type="button" class="btn btn-primary component-create-button" data-e1-command="create-component" data-type="${type}"><i class="fas fa-plus"></i> إنشاء جديد</button>
      </article>`).join('')}
    </div>`;
  };

  proto.renderComponentChooserWizard = function () {
    const suggestion = this.componentWizardSuggestion || '';
    const questions = [
      ['accordion', 'هل تريد إظهار وإخفاء محتوى مرتبط بعنوان أو سؤال؟'],
      ['tabs', 'هل تريد عرض أقسام متعددة في المكان نفسه والتنقل بينها؟'],
      ['modal', 'هل تريد نافذة تظهر فوق الصفحة ثم يمكن إغلاقها؟'],
      ['dropdown', 'هل تريد قائمة صغيرة تظهر أسفل زر؟'],
      ['sidebar', 'هل تريد قائمة أو لوحة تظهر من جانب الصفحة؟']
    ];
    const suggestedItem = suggestion ? COMPONENT_UX_CATALOG[suggestion] : null;
    return `<div class="component-wizard" data-component-wizard>
      <div class="component-wizard-head"><div><h4><i class="fas fa-compass"></i> مساعد اختيار المكوّن</h4><p>اختر الوصف الأقرب لما تريد. لن يتم إنشاء أي شيء قبل تأكيدك.</p></div><button type="button" class="btn btn-secondary" data-e1-command="close-component-wizard"><i class="fas fa-arrow-right"></i> رجوع للمكوّنات</button></div>
      ${suggestedItem ? `<div class="component-wizard-result" data-wizard-suggestion="${suggestion}"><span>الاقتراح المناسب</span><strong>${suggestedItem.name} <small>${suggestedItem.english}</small></strong><p>${suggestedItem.description}</p><div><button type="button" class="btn btn-primary" data-e1-command="use-component-suggestion" data-type="${suggestion}"><i class="fas fa-check"></i> استخدم هذا المكوّن</button><button type="button" class="btn btn-secondary" data-e1-command="reset-component-wizard">تغيير الإجابة</button></div></div>` : `<div class="component-wizard-questions">${questions.map(([type, question], index) => `<article><span>${index + 1}</span><p>${question}</p><button type="button" class="btn btn-secondary" data-e1-command="choose-component-suggestion" data-type="${type}">نعم، هذا ما أريده</button></article>`).join('')}</div>`}
    </div>`;
  };

  proto.renderE1Recipes = function (holder) {
    if (!this.visualLinkDraft.recipeType) {
      holder.innerHTML = `
        <section class="e1-step-card">
          <div class="e1-step-question">
            <span>🧩</span>
            <div>
              <h3>اختر تفاعلًا جاهزًا (E1 Recipes)</h3>
              <p>خمس وصفات E1 تسأل عن الحقول الضرورية فقط.</p>
            </div>
          </div>
          <div class="e1-recipe-grid">
            ${Object.keys(core.RECIPE_TYPES).map((type, index) => { const recipe = core.RECIPE_TYPES[type]; return `<button type="button" class="e1-recipe-card" data-e1-command="select-recipe" data-recipe="${type}"><span>${index + 1}</span><strong>${recipe.label}</strong><small>${recipe.description}</small></button>`; }).join('')}
          </div>
        </section>
        
        <section class="e1-step-card" style="margin-top: 15px;">
          <div class="e1-step-question" style="border-top: 1px solid var(--border-color); padding-top: 15px;">
            <span>📦</span>
            <div>
              <h3>المكونات التفاعلية البصرية (E2 Components)</h3>
              <p>أنشئ مكوّنات متكاملة تفاعلية مباشرة بدون كتابة أكواد JavaScript.</p>
            </div>
          </div>
          ${this.componentWizardOpen ? this.renderComponentChooserWizard() : this.renderComponentCatalogCards()}
        </section>
      `;
      return;
    }
    const type = this.visualLinkDraft.recipeType;
    const recipe = core.RECIPE_TYPES[type];
    const c = this.e1RecipeConfig;
    let fields = '';
    if (type === 'inputText' || type === 'taskList') fields += this.renderE1ElementField('e1-recipe-input', c.inputId, 'recipe-input', 'inputId');
    fields += this.renderE1ElementField('e1-recipe-target', c.targetId, 'recipe-target', 'targetId');
    if (type === 'taskList') fields += `<label class="vl-field-group vl-span-2"><span class="vl-field-label">Array اختياري</span><input class="js-linker-input e1-recipe-array" value="${esc(c.arrayName)}" placeholder="tasks"></label>`;
    if (type === 'hamburger') fields += `<label class="vl-field-group"><span class="vl-field-label">Class الفتح</span><input class="js-linker-input e1-recipe-class" value="${esc(c.className)}"></label><label class="vl-field-group"><span class="vl-field-label">Boolean</span><input class="js-linker-input e1-recipe-variable" value="${esc(c.variableName)}"></label>`;
    if (type === 'openClose') fields += `<label class="vl-field-group"><span class="vl-field-label">طريقة التحكم</span><select class="js-linker-select e1-recipe-method">${opt('hidden', 'hidden', c.method)}${opt('display', 'display', c.method)}${opt('class', 'toggle Class', c.method)}</select></label>${c.method === 'class' ? `<label class="vl-field-group"><span class="vl-field-label">Class</span><input class="js-linker-input e1-recipe-class" value="${esc(c.className)}"></label>` : ''}`;
    if (type === 'counter') fields += `<label class="vl-field-group"><span class="vl-field-label">اسم Counter</span><input class="js-linker-input e1-recipe-variable" value="${esc(c.variableName)}"></label><label class="vl-field-group"><span class="vl-field-label">البداية</span><input type="number" class="js-linker-input e1-recipe-initial" value="${esc(c.initialValue)}"></label><label class="vl-field-group"><span class="vl-field-label">المقدار</span><input type="number" class="js-linker-input e1-recipe-step" value="${esc(c.step)}"></label><label class="vl-field-group"><span class="vl-field-label">الاتجاه</span><select class="js-linker-select e1-recipe-direction">${opt('increment', 'زيادة', c.direction)}${opt('decrement', 'نقصان', c.direction)}</select></label>`;
    holder.innerHTML = `<section class="e1-step-card"><div class="e1-repeat-head"><div><h3>${recipe.label}</h3><p>${recipe.description}</p></div><button type="button" class="vl-link-button" data-e1-command="change-recipe">تغيير الوصفة</button></div><div class="vl-fields-grid e1-recipe-fields">${fields}</div><div class="vl-summary"><i class="fas fa-circle-info"></i><span id="e1-live-summary">${esc(this.getE1Summary(this.visualLinkDraft))}</span></div><details class="e1-code-review"><summary>معاينة الكود</summary><pre class="js-code-preview" id="e1-code-preview">${this.renderCodePreview(core.generateBlock(this.visualLinkDraft))}</pre></details></section>`;
  };

  proto.createDefaultActionE1 = function (type) {
    const defaults = {
      setText: { value: 'نص جديد', valueType: 'literal' }, setStyle: { params: { property: 'color', styleValue: '#f59e0b' } },
      addClass: { params: { className: 'active' } }, removeClass: { params: { className: 'active' } }, toggleClass: { params: { className: 'active' } },
      toggleVisibility: { params: { method: 'hidden', className: 'open' } }, appendListItem: { value: 'inputValue', valueType: 'expression' },
      appendElement: { value: 'نص جديد', valueType: 'literal', params: { tag: 'div' } }, incrementVariable: { params: { variableName: 'counter', step: '1', display: true } },
      decrementVariable: { params: { variableName: 'counter', step: '1', display: true } }, toggleBoolean: { params: { variableName: 'isOpen', className: 'open' } },
      callFunction: { params: { functionName: 'myFunction', arguments: '' } }, custom: { value: 'targetElement.textContent = "تم التنفيذ";' }
    };
    const value = defaults[type] || {};
    return core.normalizeAction(Object.assign({ id: core.makeId('action'), type: type || 'setText', targetId: this.visualLinkDraft.targetId || '', enabled: true }, value), 0, this.visualLinkDraft.targetId || '');
  };

  proto.getE12FunctionFromNode = function (node) {
    const editor = node && node.closest ? node.closest('[data-function-editor]') : null;
    if (!editor) return null;
    return this.getE12Functions().find(fn => fn.id === editor.dataset.functionEditor) || null;
  };

  proto.getE12ActionsForNode = function (node) {
    const fn = this.getE12FunctionFromNode(node);
    const rootActions = fn ? fn.actions || (fn.actions = []) : this.visualLinkDraft.actions;
    const container = node && node.closest ? node.closest('[data-actions-container-id]') : null;
    if (!container) return rootActions;
    const containerId = container.dataset.actionsContainerId;
    if (containerId === 'main') return rootActions;
    return this.findNestedActionsList(rootActions, containerId) || rootActions;
  };

  proto.getE12ConditionsForNode = function (node) {
    const fn = this.getE12FunctionFromNode(node);
    const rootConditions = fn ? fn.conditions || (fn.conditions = []) : this.visualLinkDraft.conditions;
    const rootActions = fn ? fn.actions || (fn.actions = []) : this.visualLinkDraft.actions;
    const container = node && node.closest ? node.closest('[data-conditions-container-id]') : null;
    if (!container) return rootConditions;
    const containerId = container.dataset.conditionsContainerId;
    if (containerId === 'main') return rootConditions;
    const branchCase = this.findNestedBranchCase(rootActions, containerId);
    return (branchCase && branchCase.condition && branchCase.condition.conditions) || rootConditions;
  };

  proto.getE12DefaultConditionLeft = function (node) {
    const fn = this.getE12FunctionFromNode(node);
    if (fn && fn.parameters && fn.parameters.length) return typeof fn.parameters[0] === 'string' ? fn.parameters[0] : fn.parameters[0].name;
    return (this.visualLinkDraft.reads[0] || this.visualLinkDraft.variables[0] || {}).name || 'event.target.value';
  };

  proto.bindE1ContentEvents = function () {
    const holder = document.getElementById('e1-content');
    if (!holder || holder.dataset.bound === 'true') return;
    holder.dataset.bound = 'true';
    holder.addEventListener('click', event => {
      const compButton = event.target.closest('[data-comp-command]');
      if (compButton) {
        event.stopPropagation();
        this.syncComponentDraftFromUI();
        const cmd = compButton.dataset.compCommand;
        const itemId = compButton.dataset.itemId;
        
        if (cmd === 'add-item') {
          this.addComponentItemDraft();
          this.renderE1Builder();
        } else if (cmd === 'remove-item') {
          this.visualLinkDraft.items = this.visualLinkDraft.items.filter(it => it.id !== itemId);
          this.renderE1Builder();
        } else if (cmd === 'move-item-up') {
          const index = this.visualLinkDraft.items.findIndex(it => it.id === itemId);
          if (index > 0) {
            const temp = this.visualLinkDraft.items[index];
            this.visualLinkDraft.items[index] = this.visualLinkDraft.items[index - 1];
            this.visualLinkDraft.items[index - 1] = temp;
            this.renderE1Builder();
          }
        } else if (cmd === 'move-item-down') {
          const index = this.visualLinkDraft.items.findIndex(it => it.id === itemId);
          if (index >= 0 && index < this.visualLinkDraft.items.length - 1) {
            const temp = this.visualLinkDraft.items[index];
            this.visualLinkDraft.items[index] = this.visualLinkDraft.items[index + 1];
            this.visualLinkDraft.items[index + 1] = temp;
            this.renderE1Builder();
          }
        } else if (cmd === 'pick-element') {
          this.startE1Picking({
            role: compButton.dataset.pickRole,
            itemId: itemId
          });
        } else if (cmd === 'show-element') {
          this.showComponentElement({ id: compButton.dataset.elementId || '', selector: compButton.dataset.elementSelector || '' });
        } else if (cmd === 'modal-add-open') {
          this.visualLinkDraft.openTriggers = this.visualLinkDraft.openTriggers || [];
          this.visualLinkDraft.openTriggers.push({ id: '', selector: '' });
          this.renderE1Builder();
        } else if (cmd === 'modal-remove-open') {
          this.visualLinkDraft.openTriggers.splice(Number(itemId), 1);
          this.renderE1Builder();
        } else if (cmd === 'modal-add-close') {
          this.visualLinkDraft.closeTriggers = this.visualLinkDraft.closeTriggers || [];
          this.visualLinkDraft.closeTriggers.push({ id: '', selector: '' });
          this.renderE1Builder();
        } else if (cmd === 'modal-remove-close') {
          this.visualLinkDraft.closeTriggers.splice(Number(itemId), 1);
          this.renderE1Builder();
        } else if (cmd === 'dropdown-add-item') {
          this.visualLinkDraft.itemDescriptors = this.visualLinkDraft.itemDescriptors || [];
          this.visualLinkDraft.itemDescriptors.push({ id: '', selector: '' });
          this.renderE1Builder();
        } else if (cmd === 'dropdown-remove-item') {
          this.visualLinkDraft.itemDescriptors.splice(Number(itemId), 1);
          this.renderE1Builder();
        } else if (cmd === 'sidebar-add-open') {
          this.visualLinkDraft.openTriggers = this.visualLinkDraft.openTriggers || [];
          this.visualLinkDraft.openTriggers.push({ id: '', selector: '' });
          this.renderE1Builder();
        } else if (cmd === 'sidebar-remove-open') {
          this.visualLinkDraft.openTriggers.splice(Number(itemId), 1);
          this.renderE1Builder();
        } else if (cmd === 'sidebar-add-close') {
          this.visualLinkDraft.closeTriggers = this.visualLinkDraft.closeTriggers || [];
          this.visualLinkDraft.closeTriggers.push({ id: '', selector: '' });
          this.renderE1Builder();
        } else if (cmd === 'sidebar-remove-close') {
          this.visualLinkDraft.closeTriggers.splice(Number(itemId), 1);
          this.renderE1Builder();
        } else if (cmd === 'sidebar-add-item') {
          this.visualLinkDraft.navItemDescriptors = this.visualLinkDraft.navItemDescriptors || [];
          this.visualLinkDraft.navItemDescriptors.push({ id: '', selector: '' });
          this.renderE1Builder();
        } else if (cmd === 'sidebar-remove-item') {
          this.visualLinkDraft.navItemDescriptors.splice(Number(itemId), 1);
          this.renderE1Builder();
        } else if (cmd === 'try-comp') {
          this.tryComponentFromPopup();
        } else if (cmd === 'save-comp') {
          this.saveComponentFromPopup();
        } else if (cmd === 'convert-to-visual') {
          delete this.visualLinkDraft.legacyManual;
          delete this.visualLinkDraft.rawCode;
          this.visualLinkDraft.items = [];
          this.addComponentItemDraft();
          this.compCurrentStep = 1;
          this.renderE1Builder();
        }
        return;
      }

      const button = event.target.closest('[data-e1-command]');
      if (!button) {
        const badge = event.target.closest('.e1-focus-element');
        if (badge) this.focusElementByIdE1(badge.dataset.elementId);
        return;
      }
      const command = button.dataset.e1Command;
      this.syncE1DraftFromUI();
      const readCard = button.closest('[data-read-id]');
      const conditionCard = button.closest('[data-condition-id]');
      const actionCard = button.closest('[data-action-id]');
      const variableCard = button.closest('[data-variable-id]');
      const functionItem = button.closest('[data-function-id]');
      const functionEditor = button.closest('[data-function-editor]');
      const actions = this.getE12ActionsForNode(button);
      const conditions = this.getE12ConditionsForNode(button);
      if (command === 'open-advanced-group') {
        this.e11AdvancedView = { groupId: button.dataset.groupId, toolId: '', editingId: '', draft: null };
      } else if (command === 'back-advanced-groups') {
        this.e11AdvancedView = { groupId: '', toolId: '', editingId: '', draft: null };
      } else if (command === 'open-advanced-tool') {
        const toolId = button.dataset.toolId;
        const tool = (core.ADVANCED_TOOLS || {})[toolId] || {};
        this.e11AdvancedView = { groupId: this.getE11ToolGroupId(tool), toolId, editingId: '', draft: core.createAdvancedOperation(toolId) };
      } else if (command === 'back-advanced-tools') {
        const groupId = (this.e11AdvancedView && this.e11AdvancedView.groupId) || '';
        this.e11AdvancedView = { groupId, toolId: '', editingId: '', draft: null };
      } else if (command === 'save-advanced-operation') {
        const view = this.e11AdvancedView || {};
        const operations = this.visualLinkDraft.advancedOperations || [];
        const normalized = core.normalizeAdvancedOperation(view.draft, Math.max(0, operations.length));
        if (view.editingId) {
          const index = operations.findIndex(operation => operation.id === view.editingId);
          if (index >= 0) operations[index] = Object.assign({}, normalized, { id: view.editingId, order: operations[index].order });
        } else {
          normalized.order = operations.length;
          operations.push(normalized);
        }
        this.visualLinkDraft.advancedOperations = operations;
        this.e11AdvancedView = { groupId: '', toolId: '', editingId: '', draft: null };
        this.showToastNotice(view.editingId ? 'تم تحديث العملية المتقدمة' : 'تمت إضافة العملية إلى التفاعل');
      } else if (command === 'open-component-wizard') {
        this.componentWizardOpen = true;
        this.componentWizardSuggestion = '';
        this.renderE1Builder();
        return;
      } else if (command === 'close-component-wizard') {
        this.componentWizardOpen = false;
        this.componentWizardSuggestion = '';
        this.renderE1Builder();
        return;
      } else if (command === 'choose-component-suggestion') {
        this.componentWizardSuggestion = button.dataset.type || '';
        this.renderE1Builder();
        return;
      } else if (command === 'reset-component-wizard') {
        this.componentWizardSuggestion = '';
        this.renderE1Builder();
        return;
      } else if (command === 'use-component-suggestion') {
        const type = button.dataset.type;
        this.componentWizardOpen = false;
        this.componentWizardSuggestion = '';
        this.initializeComponentDraft(type);
        this.renderE1Builder();
        return;
      } else if (command === 'create-component') {
        const type = button.dataset.type;
        this.initializeComponentDraft(type);
        this.renderE1Builder();
        return;
      } else if (command === 'edit-advanced-operation') {
        const operation = (this.visualLinkDraft.advancedOperations || []).find(item => item.id === button.dataset.operationId);
        if (!operation) return;
        const tool = (core.ADVANCED_TOOLS || {})[operation.toolId] || {};
        this.e1CurrentStep = 7;
        this.e11AdvancedView = { groupId: this.getE11ToolGroupId(tool), toolId: operation.toolId, editingId: operation.id, draft: core.clone(operation) };
      } else if (command === 'remove-advanced-operation') {
        this.visualLinkDraft.advancedOperations = (this.visualLinkDraft.advancedOperations || []).filter(operation => operation.id !== button.dataset.operationId).map((operation, index) => Object.assign({}, operation, { order: index }));
        if (this.e11AdvancedView && this.e11AdvancedView.editingId === button.dataset.operationId) this.e11AdvancedView = { groupId: '', toolId: '', editingId: '', draft: null };
      } else if (command === 'add-read') {
        /* لو المصدر غير قابل للقراءة (صورة/div) ابدأ بقراءة نص من عنصر آخر بدل sourceValue */
        const sourceReadable = this.e13SourceIsReadable();
        this.visualLinkDraft.reads.push(core.normalizeRead({ id: core.makeId('read'), type: sourceReadable ? 'sourceValue' : 'textContent', name: `${sourceReadable ? 'sourceValue' : 'readValue'}${this.visualLinkDraft.reads.length + 1}`, enabled: true, order: this.visualLinkDraft.reads.length }, this.visualLinkDraft.reads.length));
      }
      else if (command === 'delete-read' && readCard) this.visualLinkDraft.reads = this.visualLinkDraft.reads.filter(item => item.id !== readCard.dataset.readId);
      else if ((command === 'read-up' || command === 'read-down') && readCard) {
        const index = this.visualLinkDraft.reads.findIndex(item => item.id === readCard.dataset.readId);
        const nextIndex = command === 'read-up' ? index - 1 : index + 1;
        if (index >= 0 && nextIndex >= 0 && nextIndex < this.visualLinkDraft.reads.length) this.visualLinkDraft.reads.splice(nextIndex, 0, this.visualLinkDraft.reads.splice(index, 1)[0]);
      } else if (command === 'add-condition' || command === 'add-condition-group') {
        const existingGroups = new Set(conditions.map(item => item.groupId || 'group-1'));
        const groupId = command === 'add-condition-group' ? `group-${existingGroups.size + 1}` : ((conditions[conditions.length - 1] || {}).groupId || 'group-1');
        conditions.push(core.normalizeCondition({ id: core.makeId('condition'), left: this.getE12DefaultConditionLeft(button), operator: 'notEmpty', groupId, groupJoin: conditions.length ? 'AND' : 'AND', join: 'AND', enabled: true, order: conditions.length, settings: {} }, conditions.length));
      } else if (command === 'delete-condition' && conditionCard) {
        const conditionsList = this.getE12ConditionsForNode(button);
        const index = conditionsList.findIndex(item => item.id === conditionCard.dataset.conditionId);
        if (index >= 0) conditionsList.splice(index, 1);
      } else if ((command === 'condition-up' || command === 'condition-down') && conditionCard) {
        const index = conditions.findIndex(item => item.id === conditionCard.dataset.conditionId);
        const nextIndex = command === 'condition-up' ? index - 1 : index + 1;
        if (index >= 0 && nextIndex >= 0 && nextIndex < conditions.length) conditions.splice(nextIndex, 0, conditions.splice(index, 1)[0]);
      } else if (command && command.indexOf('expr-') === 0 && conditionCard) {
        if (!this.handleE13ExpressionCommand(command, button)) return;
      }
      else if (command === 'add-action') actions.push(this.createDefaultActionE1('setText'));
      else if (command === 'delete-action' && actionCard) {
        const actionsList = this.getE12ActionsForNode(button);
        const index = actionsList.findIndex(item => item.id === actionCard.dataset.actionId);
        if (index >= 0) actionsList.splice(index, 1);
      } else if ((command === 'action-up' || command === 'action-down') && actionCard) {
        const index = actions.findIndex(item => item.id === actionCard.dataset.actionId);
        const nextIndex = command === 'action-up' ? index - 1 : index + 1;
        if (index >= 0 && nextIndex >= 0 && nextIndex < actions.length) actions.splice(nextIndex, 0, actions.splice(index, 1)[0]);
      } else if (command === 'duplicate-action' && actionCard) {
        const index = actions.findIndex(item => item.id === actionCard.dataset.actionId);
        if (index >= 0) {
          /* تجديد كل المعرفات المتداخلة (فروع/شروط/إجراءات/عقد التعبير) وإلا صار
             تعديل النسخة يعدّل الأصل لأن البحث بالمعرف يرجع أول تطابق. */
          const copy = this.reidActionDeepE1(clone(actions[index]));
          copy.order = index + 1;
          actions.splice(index + 1, 0, core.normalizeAction(copy, index + 1, copy.targetId || ''));
        }
      } else if (command === 'add-branch-action') {
        const actionsList = this.getE12ActionsForNode(button);
        actionsList.push({
          id: core.makeId('action'),
          type: 'branch',
          branches: [
            {
              id: core.makeId('branch-case'),
              branchType: 'if',
              condition: { conditions: [], conditionGroups: [] },
              actions: []
            }
          ],
          order: actionsList.length,
          enabled: true
        });
      } else if (command === 'add-branch-condition' || command === 'add-branch-condition-group') {
        const caseId = button.dataset.branchCaseId;
        const branchCase = this.findNestedBranchCase(this.visualLinkDraft.actions, caseId);
        if (branchCase) {
          const conditionsList = branchCase.condition.conditions || (branchCase.condition.conditions = []);
          const existingGroups = new Set(conditionsList.map(item => item.groupId || 'group-1'));
          const groupId = command === 'add-branch-condition-group' ? `group-${existingGroups.size + 1}` : ((conditionsList[conditionsList.length - 1] || {}).groupId || 'group-1');
          conditionsList.push(core.normalizeCondition({
            id: core.makeId('condition'),
            left: this.getE12DefaultConditionLeft(button),
            operator: 'notEmpty',
            groupId,
            groupJoin: conditionsList.length ? 'AND' : 'AND',
            join: 'AND',
            enabled: true,
            order: conditionsList.length,
            settings: {}
          }, conditionsList.length));
        }
      } else if (command === 'add-branch-subaction') {
        const caseId = button.dataset.branchCaseId;
        const branchCase = this.findNestedBranchCase(this.visualLinkDraft.actions, caseId);
        if (branchCase) {
          const actionsList = branchCase.actions || (branchCase.actions = []);
          actionsList.push(this.createDefaultActionE1('setText'));
        }
      } else if (command === 'add-branch-subbranch') {
        const caseId = button.dataset.branchCaseId;
        const branchCase = this.findNestedBranchCase(this.visualLinkDraft.actions, caseId);
        if (branchCase) {
          const actionsList = branchCase.actions || (branchCase.actions = []);
          actionsList.push({
            id: core.makeId('action'),
            type: 'branch',
            branches: [
              {
                id: core.makeId('branch-case'),
                branchType: 'if',
                condition: { conditions: [], conditionGroups: [] },
                actions: []
              }
            ],
            order: actionsList.length,
            enabled: true
          });
        }
      } else if (command === 'add-branch-else-if') {
        const actionId = button.dataset.branchActionId;
        const actionsList = this.getE12ActionsForNode(button);
        const action = this.findActionById(actionsList, actionId);
        if (action && action.type === 'branch') {
          const elseIndex = action.branches.findIndex(b => b.branchType === 'else');
          const newBranch = {
            id: core.makeId('branch-case'),
            branchType: 'elseIf',
            condition: { conditions: [], conditionGroups: [] },
            actions: []
          };
          if (elseIndex >= 0) {
            action.branches.splice(elseIndex, 0, newBranch);
          } else {
            action.branches.push(newBranch);
          }
        }
      } else if (command === 'add-branch-else') {
        const actionId = button.dataset.branchActionId;
        const actionsList = this.getE12ActionsForNode(button);
        const action = this.findActionById(actionsList, actionId);
        if (action && action.type === 'branch') {
          const hasElse = action.branches.some(b => b.branchType === 'else');
          if (!hasElse) {
            action.branches.push({
              id: core.makeId('branch-case'),
              branchType: 'else',
              actions: []
            });
          }
        }
      } else if (command === 'delete-branch-case') {
        const caseId = button.dataset.branchCaseId;
        const action = this.findParentBranchAction(this.visualLinkDraft.actions, caseId);
        if (action && action.branches) {
          action.branches = action.branches.filter(b => b.id !== caseId);
        }
      } else if (command === 'branch-case-up' || command === 'branch-case-down') {
        const caseId = button.dataset.branchCaseId;
        const action = this.findParentBranchAction(this.visualLinkDraft.actions, caseId);
        if (action && action.branches) {
          const index = action.branches.findIndex(b => b.id === caseId);
          const nextIndex = command === 'branch-case-up' ? index - 1 : index + 1;
          if (index >= 0 && nextIndex >= 0 && nextIndex < action.branches.length) {
            const targetType = action.branches[nextIndex].branchType;
            if (targetType !== 'if' && targetType !== 'else') {
              action.branches.splice(nextIndex, 0, action.branches.splice(index, 1)[0]);
            }
          }
        }
      } else if (command === 'copy-action' && actionCard) {
        const action = actions.find(item => item.id === actionCard.dataset.actionId); if (action) this.copyTextE1(JSON.stringify(action, null, 2)); return;
      } else if (command === 'add-variable') {
        const descriptor = this.getE12VariableDescriptors()[0] || { id: 'Counter', defaultValue: '0' };
        this.visualLinkDraft.variables.push(core.normalizeVariable({ id: core.makeId('var'), name: `stateValue${this.visualLinkDraft.variables.length + 1}`, type: descriptor.id, initialValue: descriptor.defaultValue || '0', scope: 'outsideEvent', enabled: true, order: this.visualLinkDraft.variables.length }, this.visualLinkDraft.variables.length));
      }
      else if (command === 'delete-variable' && variableCard) this.visualLinkDraft.variables = this.visualLinkDraft.variables.filter(item => item.id !== variableCard.dataset.variableId);
      else if ((command === 'variable-up' || command === 'variable-down') && variableCard) {
        const index = this.visualLinkDraft.variables.findIndex(item => item.id === variableCard.dataset.variableId);
        const nextIndex = command === 'variable-up' ? index - 1 : index + 1;
        if (index >= 0 && nextIndex >= 0 && nextIndex < this.visualLinkDraft.variables.length) this.visualLinkDraft.variables.splice(nextIndex, 0, this.visualLinkDraft.variables.splice(index, 1)[0]);
      } else if (command === 'add-function') {
        const functions = this.getE12Functions(); const fn = this.createDefaultFunctionE12(functions.length); functions.push(fn); this.e12FunctionView = { editingId: fn.id };
      } else if (command === 'edit-function' && functionItem) this.e12FunctionView = { editingId: functionItem.dataset.functionId };
      else if (command === 'close-function-editor') this.e12FunctionView = { editingId: '' };
      else if (command === 'delete-function' && functionItem) {
        const fnId = functionItem.dataset.functionId;
        const fn = this.getE12Functions().find(f => f.id === fnId);
        if (fn) {
          const fnName = fn.name;
          const actions = [...(this.visualLinkDraft.actions || []), ...(this.visualLinkDraft.functions || []).reduce((all, f) => all.concat(f.actions || []), [])];
          const isUsedInAction = actions.some(action => action.type === 'callFunction' && (action.settings && action.settings.functionName === fnName || action.params && action.params.functionName === fnName));
          const isUsedInAdvanced = (this.visualLinkDraft.advancedOperations || []).some(op => op.toolId === 'function.call' && op.settings && op.settings.functionName === fnName);
          const isUsedInRead = (this.visualLinkDraft.reads || []).some(read => read.type === 'functionResult' && read.settings && read.settings.functionName === fnName);
          if (isUsedInAction || isUsedInAdvanced || isUsedInRead) {
            if (!confirm(`تحذير: هذه الدالة «${fnName}» مستخدمة في التفاعل. هل أنت متأكد من رغبتك في حذفها؟`)) {
              return;
            }
          }
        }
        this.visualLinkDraft.functions = this.getE12Functions().filter(f => f.id !== fnId);
        if (this.e12FunctionView && this.e12FunctionView.editingId === fnId) this.e12FunctionView.editingId = '';
      } else if ((command === 'function-up' || command === 'function-down') && functionItem) {
        const functions = this.getE12Functions(); const index = functions.findIndex(fn => fn.id === functionItem.dataset.functionId); const nextIndex = command === 'function-up' ? index - 1 : index + 1;
        if (index >= 0 && nextIndex >= 0 && nextIndex < functions.length) functions.splice(nextIndex, 0, functions.splice(index, 1)[0]);
      } else if (command === 'duplicate-function' && functionItem) {
        const functions = this.getE12Functions(); const index = functions.findIndex(fn => fn.id === functionItem.dataset.functionId);
        if (index >= 0) { const copy = clone(functions[index]); copy.id = core.makeId('function'); copy.name = `${copy.name || 'myFunction'}Copy`; copy.actions = (copy.actions || []).map(action => Object.assign({}, action, { id: core.makeId('action') })); copy.conditions = (copy.conditions || []).map(condition => Object.assign({}, condition, { id: core.makeId('condition') })); functions.splice(index + 1, 0, this.normalizeE12Function(copy, index + 1)); this.e12FunctionView = { editingId: copy.id }; }
      } else if (command === 'add-function-param' && functionEditor) {
        const fn = this.getE12FunctionFromNode(button); if (fn) fn.parameters.push({ name: `arg${fn.parameters.length + 1}`, defaultValue: '' });
      } else if (command === 'delete-function-param' && functionEditor) {
        const fn = this.getE12FunctionFromNode(button); const row = button.closest('[data-function-param-index]'); if (fn && row) fn.parameters.splice(Number(row.dataset.functionParamIndex), 1);
      } else if (command === 'edit-step') { this.e1CurrentStep = Number(button.dataset.step); this.renderE1Builder(); return; }
      else if (command === 'pick-element') { this.startE1Picking({ role: button.dataset.pickRole, itemId: button.dataset.itemId, fieldKey: button.dataset.fieldKey }); return; }
      else if (command === 'select-recipe') {
        this.visualLinkDraft.recipeType = button.dataset.recipe;
        this.e1RecipeConfig = { sourceId: this.visualLinkDraft.sourceId, inputId: '', targetId: '', className: 'open', method: 'hidden', variableName: button.dataset.recipe === 'counter' ? 'counter' : 'menuOpen', initialValue: '0', step: '1', direction: 'increment', arrayName: '' };
        this.rebuildRecipeDefinitionE1();
      } else if (command === 'change-recipe') { this.visualLinkDraft.recipeType = ''; this.visualLinkDraft.reads = []; this.visualLinkDraft.actions = []; this.visualLinkDraft.conditions = []; this.visualLinkDraft.variables = []; }
      else if (command === 'copy-code') { this.copyTextE1(core.generateBlock(this.visualLinkDraft)); return; }
      else return;
      this.renderE1Builder();
    });
    holder.addEventListener('input', event => {
      if (event.target.classList.contains('e11-tool-search')) {
        const value = event.target.value.trim().toLowerCase();
        const groups = holder.querySelector('.e11-groups-grid');
        const results = holder.querySelector('.e11-search-results');
        if (groups) groups.hidden = !!value;
        if (results) {
          results.hidden = !value;
          results.querySelectorAll('[data-tool-search]').forEach(card => { card.hidden = !value || !card.dataset.toolSearch.includes(value); });
        }
        return;
      }
      this.syncE1DraftFromUI(); this.refreshE1PreviewOnly(); this.refreshE11AdvancedPreview();
      this.refreshE12ValidationHints();
    });
    holder.addEventListener('change', event => {
      this.syncE1DraftFromUI();
      let dynamic = event.target.matches('.e1-read-type,.e1-condition-op,.e1-action-type,.e1-action-method,.e1-variable-type,.e1-recipe-method,.comp-binding-mode,.comp-setting-method,.comp-setting-hide-method');
      if (event.target.matches('.e13-expr-type-select,.e13-expr-wrap-select,.e13-expr-select')) {
        this.handleE13ExpressionSelectChange(event.target);
        dynamic = true; /* إعادة رسم شجرة التعبير والجملة العربية والفحوصات */
      }
      if (event.target.classList.contains('e1-action-type')) {
        const card = event.target.closest('[data-action-id]');
        const actions = this.getE12ActionsForNode(card);
        const index = actions.findIndex(action => action.id === card.dataset.actionId);
        if (index >= 0) actions[index] = Object.assign(this.createDefaultActionE1(event.target.value), { id: actions[index].id, targetId: actions[index].targetId, target: actions[index].target, enabled: actions[index].enabled, order: actions[index].order });
      }
      if (dynamic) this.renderE1Builder(); else { this.refreshE1PreviewOnly(); this.refreshE11AdvancedPreview(); this.refreshE12ValidationHints(); }
    });

    /* لوحة الشرح الجانبية: تظهر عند الوقوف أو التركيز على أي عنصر موثق */
    holder.addEventListener('mouseover', event => {
      const anchor = event.target.closest ? event.target.closest('[data-e13-doc],[data-e13-doc-dynamic]') : null;
      if (!anchor) return;
      if (this._e13DocHideTimer) { clearTimeout(this._e13DocHideTimer); this._e13DocHideTimer = null; }
      if (this._e13DocAnchor === anchor && this._e13DocPanel && !this._e13DocPanel.hidden) return;
      this.showE13DocPanel(anchor);
    });
    holder.addEventListener('mouseout', event => {
      const anchor = event.target.closest ? event.target.closest('[data-e13-doc],[data-e13-doc-dynamic]') : null;
      if (!anchor || anchor !== this._e13DocAnchor) return;
      if (event.relatedTarget && anchor.contains(event.relatedTarget)) return;
      this.scheduleE13DocPanelHide();
    });
    holder.addEventListener('focusin', event => {
      const anchor = event.target.closest ? event.target.closest('[data-e13-doc],[data-e13-doc-dynamic]') : null;
      if (anchor) this.showE13DocPanel(anchor);
    });
  };

  proto.syncE1DraftFromUI = function () {
    const holder = document.getElementById('e1-content');
    if (!holder || !this.visualLinkDraft) return this.visualLinkDraft;
    
    const isComponent = this.visualLinkDraft.builderMode === 'component' || !!this.visualLinkDraft.componentType;
    if (isComponent) {
      this.syncComponentDraftFromUI();
      return this.visualLinkDraft;
    }
    
    this.syncE11AdvancedDraftFromUI(holder);
    const eventSelect = holder.querySelector('.e1-event'); if (eventSelect) this.visualLinkDraft.event = eventSelect.value;
    if (this.visualLinkDraft.builderMode === 'recipe') {
      const value = selector => { const node = holder.querySelector(selector); return node ? node.value : undefined; };
      ['inputId', 'targetId', 'arrayName', 'className', 'variableName', 'initialValue', 'step', 'direction', 'method'].forEach(key => {
        const selectors = { inputId: '.e1-recipe-input', targetId: '.e1-recipe-target', arrayName: '.e1-recipe-array', className: '.e1-recipe-class', variableName: '.e1-recipe-variable', initialValue: '.e1-recipe-initial', step: '.e1-recipe-step', direction: '.e1-recipe-direction', method: '.e1-recipe-method' };
        const current = value(selectors[key]); if (current !== undefined) this.e1RecipeConfig[key] = current;
      });
      this.rebuildRecipeDefinitionE1();
      return this.visualLinkDraft;
    }
    const readCards = Array.from(holder.querySelectorAll('[data-read-id]'));
    if (readCards.length) this.visualLinkDraft.reads = readCards.map((card, index) => {
      const previous = this.visualLinkDraft.reads.find(read => read.id === card.dataset.readId) || {};
      const settings = Object.assign({}, previous.settings || {});
      card.querySelectorAll('.e1-read-setting').forEach(field => { settings[field.dataset.readSetting] = field.type === 'checkbox' ? field.checked : field.value; });
      return core.normalizeRead(Object.assign({}, previous, {
        id: card.dataset.readId, type: card.querySelector('.e1-read-type').value, name: card.querySelector('.e1-read-name').value,
        elementId: card.querySelector('.e1-read-element') ? card.querySelector('.e1-read-element').value : previous.elementId || '',
        settings, enabled: card.querySelector('.e1-read-enabled') ? card.querySelector('.e1-read-enabled').checked : previous.enabled !== false, order: index
      }), index);
    });
    const topConditionCards = Array.from(holder.querySelectorAll('[data-condition-id]'))
      .filter(card => !card.closest('[data-function-editor]') && !card.closest('[data-branch-case-id]'));
    if (topConditionCards.length) {
      this.visualLinkDraft.conditions = topConditionCards.map((card, index) => this.readE12ConditionCard(card, index, this.visualLinkDraft.conditions));
    }
    const topActionCards = Array.from(holder.querySelectorAll('[data-action-id]'))
      .filter(card => !card.closest('[data-function-editor]') && !card.closest('[data-branch-case-id]'));
    if (topActionCards.length) {
      const mainActionsList = holder.querySelector('.e12-actions-section > .e1-repeat-list') || holder.querySelector('.e1-repeat-list');
      if (mainActionsList) {
        this.visualLinkDraft.actions = this.readActionsContainer(mainActionsList, this.visualLinkDraft.actions);
      }
    }
    const variableCards = Array.from(holder.querySelectorAll('[data-variable-id]'));
    if (variableCards.length) this.visualLinkDraft.variables = variableCards.map((card, index) => {
      const previous = this.visualLinkDraft.variables.find(variable => variable.id === card.dataset.variableId) || {};
      const rawName = card.querySelector('.e1-variable-name').value;
      const oldName = previous.name;
      const newName = isIdentifier(rawName) ? rawName : oldName;
      if (oldName && newName && oldName !== newName) {
        this.renameVariableInDraft(oldName, newName, card.dataset.variableId);
        if (this.activeVisualLink && this.activeVisualLink.existingId) {
          this.queueVariableRenameE1(card.dataset.variableId, oldName, newName);
        }
      }
      this.e12RawVariableNames[card.dataset.variableId] = rawName;
      const settings = Object.assign({}, previous.settings || {}, { rawName });
      card.querySelectorAll('.e1-variable-setting').forEach(field => { settings[field.dataset.variableSetting] = field.type === 'checkbox' ? field.checked : field.value; });
      return core.normalizeVariable(Object.assign({}, previous, { id: card.dataset.variableId, type: card.querySelector('.e1-variable-type').value, name: rawName, initialValue: card.querySelector('.e1-variable-initial').value, scope: card.querySelector('.e1-variable-scope').value, settings, enabled: card.querySelector('.e1-variable-enabled').checked, order: index }), index);
    });
    const functionEditor = holder.querySelector('[data-function-editor]');
    if (functionEditor) {
      const functions = this.getE12Functions();
      const functionIndex = functions.findIndex(fn => fn.id === functionEditor.dataset.functionEditor);
      if (functionIndex >= 0) {
        const previous = functions[functionIndex];
        const rawName = functionEditor.querySelector('.e1-function-name').value;
        this.e12RawFunctionNames[previous.id] = rawName;
        const parameters = Array.from(functionEditor.querySelectorAll('[data-function-param-index]')).map(row => ({ name: row.querySelector('.e1-function-param-name').value, defaultValue: row.querySelector('.e1-function-param-default').value }));
        const conditionCards = Array.from(functionEditor.querySelectorAll('[data-condition-id]'));
        const actionCards = Array.from(functionEditor.querySelectorAll('[data-action-id]'));
        const next = Object.assign({}, previous, {
          name: rawName, type: functionEditor.querySelector('.e1-function-type').value, parameters,
          conditions: conditionCards.map((card, index) => this.readE12ConditionCard(card, index, previous.conditions || [])),
          actions: actionCards.map((card, index) => this.readE1ActionCard(card, index, previous.actions || [])),
          returnValue: functionEditor.querySelector('.e1-function-return').value,
          customCode: functionEditor.querySelector('.e1-function-custom').value,
          enabled: functionEditor.querySelector('.e1-function-enabled').checked,
          order: functionIndex,
          settings: Object.assign({}, previous.settings || {}, { rawName })
        });
        functions[functionIndex] = this.normalizeE12Function(next, functionIndex);
      }
    }
    this.visualLinkDraft = core.normalizeDefinition(this.visualLinkDraft);
    return this.visualLinkDraft;
  };

  proto.readE12ConditionCard = function (card, index, sourceConditions) {
    const previous = (sourceConditions || []).find(condition => condition.id === card.dataset.conditionId) || {};
    const settings = Object.assign({}, previous.settings || {});
    card.querySelectorAll('.e1-condition-setting').forEach(field => { settings[field.dataset.conditionSetting] = field.type === 'checkbox' ? field.checked : field.value; });
    const join = card.querySelector('.e1-condition-join');
    const groupJoin = card.querySelector('.e1-condition-group-join');

    /* الشروط البصرية: الشجرة كلها في left؛ نطبّق تعديلات الحقول بمطابقة
       data-expr-node-id الموجودة في DOM على العقد نفسها، ثم نعيد ربط المراجع. */
    const visualHolder = card.querySelector('.e13-expr-builder');
    if (visualHolder || previous.isVisualExpression === true || previous.isVisualExpression === 'true') {
      const ast = previous.left && typeof previous.left === 'object'
        ? core.normalizeExpressionV2(clone(previous.left))
        : this.e13DefaultNode('placeholder');
      if (visualHolder) this.applyE13ExpressionEdits(card, ast);
      core.linkExpressionReferences(ast, this.visualLinkDraft);
      core.refreshExpressionReferenceNames(ast, this.visualLinkDraft);
      return core.normalizeCondition(Object.assign({}, previous, {
        id: card.dataset.conditionId, isVisualExpression: true, left: ast,
        operator: previous.operator || 'notEmpty',
        right: typeof previous.right === 'string' ? previous.right : '',
        rightType: previous.rightType || 'literal',
        groupId: card.querySelector('.e1-condition-group').value,
        groupJoin: groupJoin ? groupJoin.value : (previous.groupJoin || 'AND'), join: join ? join.value : (previous.join || 'AND'),
        settings, enabled: card.querySelector('.e1-condition-enabled').checked, order: index
      }), index);
    }

    const right = card.querySelector('.e1-condition-right');
    const rightType = card.querySelector('.e1-condition-right-type');
    return core.normalizeCondition(Object.assign({}, previous, {
      id: card.dataset.conditionId, groupId: card.querySelector('.e1-condition-group').value,
      groupJoin: groupJoin ? groupJoin.value : (previous.groupJoin || 'AND'), join: join ? join.value : (previous.join || 'AND'),
      left: card.querySelector('.e1-condition-left').value, operator: card.querySelector('.e1-condition-op').value,
      right: right ? right.value : '', rightType: rightType ? rightType.value : (previous.rightType || 'literal'), settings,
      enabled: card.querySelector('.e1-condition-enabled').checked, order: index
    }), index);
  };

  proto.refreshE12ValidationHints = function () {
    const holder = document.getElementById('e1-content'); if (!holder) return;
    holder.querySelectorAll('.e1-variable-name,.e1-function-name,.e1-function-param-name,.e1-read-name').forEach(input => {
      const valid = isIdentifier(input.value); const group = input.closest('.vl-field-group') || input.parentElement;
      if (group) group.classList.toggle('has-error', !valid);
      const feedback = group && group.querySelector('.e12-name-feedback');
      if (feedback) feedback.textContent = valid ? 'اسم JavaScript صالح.' : 'ابدأ بحرف أو _ أو $، ومن دون مسافات.';
    });
    holder.querySelectorAll('.e12-variable-card').forEach(card => {
      const type = card.querySelector('.e1-variable-type'); const input = card.querySelector('.e1-variable-initial');
      if (!type || !input || !['Array', 'Object', 'Set'].includes(type.value)) return;
      let valid = true; try { const parsed = JSON.parse(input.value); valid = type.value === 'Object' ? !!parsed && typeof parsed === 'object' && !Array.isArray(parsed) : Array.isArray(parsed); } catch (error) { valid = false; }
      const group = input.closest('.vl-field-group'); if (group) group.classList.toggle('has-error', !valid);
    });
  };

  proto.syncE11AdvancedDraftFromUI = function (holder) {
    const view = this.e11AdvancedView;
    if (!view || !view.draft || !holder.querySelector('.e11-tool-config')) return;
    const settings = Object.assign({}, view.draft.settings || {});
    holder.querySelectorAll('.e11-advanced-field').forEach(field => { settings[field.dataset.fieldKey] = field.type === 'checkbox' ? field.checked : field.value; });
    const destination = holder.querySelector('.e11-advanced-destination');
    const result = holder.querySelector('.e11-advanced-result');
    view.draft = Object.assign({}, view.draft, {
      destination: destination ? destination.value : view.draft.destination,
      resultName: result ? result.value : view.draft.resultName,
      settings
    });
  };

  proto.refreshE11AdvancedPreview = function () {
    const holder = document.getElementById('e1-content');
    const panel = holder && holder.querySelector('.e11-code-preview');
    const view = this.e11AdvancedView;
    if (!panel || !view || !view.draft) return;
    let preview = '';
    try { preview = core.previewAdvancedOperation ? core.previewAdvancedOperation(view.draft, this.visualLinkDraft) : core.generateAdvancedOperation(view.draft, this.visualLinkDraft, { preview: true }); } catch (error) { preview = ''; }
    panel.classList.toggle('is-pending', !preview);
    panel.innerHTML = `<div><span>معاينة الكود</span><small>${preview ? 'تتحدث من الحقول أعلاه' : 'أكمل الحقول المطلوبة لعرض الكود'}</small></div>${preview ? `<pre class="js-code-preview" id="e11-operation-preview">${this.renderCodePreview(preview)}</pre>` : ''}`;
  };

  proto.readE1ActionCard = function (card, index, sourceActions) {
    const type = card.querySelector('.e1-action-type').value;
    const previous = (sourceActions || []).find(action => action.id === card.dataset.actionId) || {};
    const next = Object.assign({}, previous, { id: card.dataset.actionId, type, params: Object.assign({}, previous.params || {}), settings: Object.assign({}, previous.settings || {}), enabled: card.querySelector('.e1-action-enabled') ? card.querySelector('.e1-action-enabled').checked : previous.enabled !== false, order: index });
    const target = card.querySelector('.e1-action-target');
    if (target) { next.targetId = target.value; next.target = { kind: target.value ? 'element' : 'target', id: target.value }; }
    let editedValue = false; let editedValueType = false; let editedStructuredSource = false;
    card.querySelectorAll('.e1-action-field').forEach(field => {
      const key = field.dataset.actionField; const store = field.dataset.actionStore || 'params'; const value = field.type === 'checkbox' ? field.checked : field.value;
      if (store === 'value' || store === 'valueType' || store === 'valueSource') {
        next[store] = value;
        editedValue = editedValue || store === 'value'; editedValueType = editedValueType || store === 'valueType'; editedStructuredSource = editedStructuredSource || store === 'valueSource';
      }
      else {
        if (!next[store] || typeof next[store] !== 'object') next[store] = {};
        next[store][key] = value;
        next.params[key] = value;
        next.settings[key] = value;
      }
    });
    if (next.value === undefined) next.value = '';
    if (!next.valueType) next.valueType = next.valueSource && typeof next.valueSource === 'object' ? next.valueSource.kind : 'expression';
    if (editedStructuredSource && typeof next.valueSource === 'string') next.valueSource = { kind: next.valueSource, value: next.value };
    else if (editedValue || editedValueType || !next.valueSource) next.valueSource = { kind: next.valueType === 'literal' ? 'literal' : 'expression', value: next.value };
    return core.normalizeAction(next, index, next.targetId || '');
  };

  proto.findNestedActionsList = function (actionsList, targetContainerId) {
    for (const action of actionsList) {
      if (action.type === 'branch' && Array.isArray(action.branches)) {
        for (const br of action.branches) {
          if (br.id === targetContainerId) return br.actions || (br.actions = []);
          const nested = this.findNestedActionsList(br.actions || [], targetContainerId);
          if (nested) return nested;
        }
      }
    }
    return null;
  };

  proto.findNestedBranchCase = function (actionsList, branchCaseId) {
    for (const action of actionsList) {
      if (action.type === 'branch' && Array.isArray(action.branches)) {
        for (const br of action.branches) {
          if (br.id === branchCaseId) return br;
          const nested = this.findNestedBranchCase(br.actions || [], branchCaseId);
          if (nested) return nested;
        }
      }
    }
    return null;
  };

  proto.findParentBranchAction = function (actionsList, branchCaseId) {
    for (const action of actionsList) {
      if (action.type === 'branch' && Array.isArray(action.branches)) {
        if (action.branches.some(b => b.id === branchCaseId)) return action;
        for (const br of action.branches) {
          const found = this.findParentBranchAction(br.actions || [], branchCaseId);
          if (found) return found;
        }
      }
    }
    return null;
  };

  proto.findActionById = function (actionsList, actionId) {
    for (const action of actionsList) {
      if (action.id === actionId) return action;
      if (action.type === 'branch' && Array.isArray(action.branches)) {
        for (const br of action.branches) {
          const found = this.findActionById(br.actions || [], actionId);
          if (found) return found;
        }
      }
    }
    return null;
  };

  proto.readActionsContainer = function (container, currentActionsArray) {
    return Array.from(container.children)
      .filter(child => child.dataset && child.dataset.actionId)
      .map((card, index) => {
        const actionId = card.dataset.actionId;
        const previous = (currentActionsArray || []).find(act => act.id === actionId) || {};
        const typeSelect = card.querySelector(':scope > .vl-fields-grid > .vl-field-group > .e1-action-type');
        const type = typeSelect ? typeSelect.value : (previous.type || 'setText');

        if (type === 'branch') {
          const branchCards = Array.from(card.querySelectorAll(':scope > .e1-branch-card-body > .e1-branch-cases-container > .e1-branch-case-card'));
          const branches = branchCards.map((brCard, brIdx) => {
            const brId = brCard.dataset.branchCaseId;
            const prevBranch = (previous.branches || []).find(b => b.id === brId) || {};
            
            const condContainer = brCard.querySelector(':scope > .e1-branch-case-body > .e1-branch-conditions-container > .e1-branch-conditions-list');
            let condition = { conditions: [], conditionGroups: [] };
            if (condContainer) {
              const condCards = Array.from(condContainer.children).filter(child => child.dataset && child.dataset.conditionId);
              condition.conditions = condCards.map((condCard, condIdx) => {
                return this.readE12ConditionCard(condCard, condIdx, prevBranch.condition ? prevBranch.condition.conditions : []);
              });
            }
            
            const actContainer = brCard.querySelector(':scope > .e1-branch-case-body > .e1-branch-actions-container > .e1-branch-actions-list');
            const actions = actContainer ? this.readActionsContainer(actContainer, prevBranch.actions || []) : [];

            return {
              id: brId,
              branchType: brCard.dataset.branchType || 'if',
              condition,
              actions
            };
          });

          return {
            id: actionId,
            type: 'branch',
            branches,
            enabled: card.querySelector(':scope > .e1-repeat-head .e1-action-enabled')?.checked !== false,
            order: index
          };
        }

        return this.readE1ActionCard(card, index, currentActionsArray);
      });
  };

  proto.renderActionReviewHtml = function (action, index, indentLevel = 0) {
    const spacing = '&nbsp;&nbsp;'.repeat(indentLevel * 2);
    const mutedClass = action.enabled === false ? 'is-muted' : '';
    
    if (action.type === 'branch') {
      const branchesHtml = (action.branches || []).map(br => {
        let title = '';
        if (br.branchType === 'if') {
          title = `<b>إذا تحقق الشرط:</b>`;
        } else if (br.branchType === 'elseIf') {
          title = `<b>وإلا إذا تحقق الشرط:</b>`;
        } else {
          title = `<b>وإلا:</b>`;
        }
        
        let conditionText = '';
        if (br.branchType !== 'else') {
          const condText = (br.condition.conditions || []).map(c => esc(this.describeE12ConditionInArabic(c, this.visualLinkDraft))).join(' و ');
          conditionText = ` [${condText || 'شرط فارغ'}]`;
        }
        
        const subActionsReview = (br.actions || []).map((subAct, subActIdx) => {
          return this.renderActionReviewHtml(subAct, subActIdx, indentLevel + 1);
        }).join('');

        return `
          <div class="e12-review-branch-case" style="margin-top: 4px; margin-bottom: 4px;">
            <p class="${mutedClass}">${spacing} ${title}${conditionText}</p>
            ${subActionsReview || `<p class="e12-review-empty" style="margin-left: 20px; font-style: italic;">${spacing}&nbsp;&nbsp; (لا توجد إجراءات)</p>`}
          </div>
        `;
      }).join('');

      return `
        <div class="e12-review-branch-action" style="border-right: 2px dashed var(--border-color); padding-right: 8px; margin-bottom: 6px; margin-top: 6px;">
          <p class="${mutedClass}"><b>${spacing}${index + 1}. شرط متفرع (Branch)</b></p>
          ${branchesHtml}
        </div>
      `;
    }

    const label = this.getE12ActionDescriptor(action.type).label;
    const target = action.targetId ? ` على ${esc(this.getVisualElementLabel(action.targetId))}` : '';
    return `<p class="${mutedClass}">${spacing}<b>${index + 1}.</b> ${esc(label)}${target}</p>`;
  };

  proto.renderE1BranchCard = function (action, index, count, functionMode) {
    const branchesHtml = (action.branches || []).map((br, brIdx) => {
      const isIf = br.branchType === 'if';
      const isElseIf = br.branchType === 'elseIf';
      const isElse = br.branchType === 'else';
      
      let conditionHtml = '';
      if (!isElse) {
        const names = [...this.visualLinkDraft.reads.map(read => read.name), ...(this.visualLinkDraft.variables || []).map(variable => variable.name), 'event.type', 'event.target.value'];
        const condCards = (br.condition.conditions || []).map((condition, condIdx) => {
          return this.renderE12ConditionCard(condition, condIdx, br.condition.conditions.length, names, br.condition.conditions);
        }).join('');
        
        conditionHtml = `
          <div class="e1-branch-conditions-container" data-conditions-container-id="${esc(br.id)}">
            <div class="e1-branch-conditions-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span style="font-size:11px; font-weight:bold; color:var(--text-color-secondary);">شروط الفرع:</span>
              <div class="e12-add-actions" style="display:flex; gap:5px;">
                <button type="button" class="vl-mini-btn" data-e1-command="add-branch-condition" data-branch-case-id="${esc(br.id)}" title="إضافة شرط"><i class="fas fa-plus"></i> شرط</button>
                <button type="button" class="vl-mini-btn secondary" data-e1-command="add-branch-condition-group" data-branch-case-id="${esc(br.id)}" title="إضافة مجموعة شروط"><i class="fas fa-object-group"></i> مجموعة</button>
              </div>
            </div>
            <div class="e1-repeat-list e1-branch-conditions-list" style="margin-left:10px; border-left:1px solid var(--border-color); padding-left:10px; margin-bottom:10px;">${condCards || '<div class="vl-empty-list small">لا يوجد شرط لهذا الفرع.</div>'}</div>
          </div>
        `;
      }

      const subActionCards = (br.actions || []).map((subAct, subActIdx) => {
        return this.renderE1ActionCard(subAct, subActIdx, br.actions.length, functionMode);
      }).join('');

      const actionsContainerHtml = `
        <div class="e1-branch-actions-container" data-actions-container-id="${esc(br.id)}">
          <div class="e1-branch-actions-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:11px; font-weight:bold; color:var(--text-color-secondary);">إجراءات الفرع:</span>
            <div class="e12-add-actions" style="display:flex; gap:5px;">
              <button type="button" class="vl-mini-btn" data-e1-command="add-branch-subaction" data-branch-case-id="${esc(br.id)}" title="إضافة إجراء للفرع"><i class="fas fa-plus"></i> إجراء</button>
              <button type="button" class="vl-mini-btn secondary" data-e1-command="add-branch-subbranch" data-branch-case-id="${esc(br.id)}" title="إضافة تفرع متداخل"><i class="fas fa-code-branch"></i> تفرع</button>
            </div>
          </div>
          <div class="e1-repeat-list e1-branch-actions-list" style="margin-left:10px; border-left:1px dashed var(--border-color); padding-left:10px; min-height: 40px;">${subActionCards || '<div class="vl-empty-list small">لا توجد إجراءات مضافة في هذا الفرع.</div>'}</div>
        </div>
      `;

      let branchTitle = '';
      if (isIf) branchTitle = 'إذا تحقق الشرط (IF)';
      else if (isElseIf) branchTitle = 'وإلا إذا تحقق الشرط (ELSE IF)';
      else branchTitle = 'وإلا (ELSE)';

      let deleteBranchBtn = '';
      if (!isIf) {
        deleteBranchBtn = `<button type="button" class="vl-mini-btn danger" data-e1-command="delete-branch-case" data-branch-case-id="${esc(br.id)}" title="حذف هذا الفرع بالكامل"><i class="fas fa-trash"></i></button>`;
      }

      let moveBranchUpBtn = '';
      let moveBranchDownBtn = '';
      if (isElseIf) {
        const elseIfIdxs = (action.branches || []).map((b, idx) => ({ b, idx })).filter(item => item.b.branchType === 'elseIf');
        const currentPos = elseIfIdxs.findIndex(item => item.b.id === br.id);
        const upDisabled = currentPos === 0 ? 'disabled' : '';
        const downDisabled = currentPos === elseIfIdxs.length - 1 ? 'disabled' : '';
        moveBranchUpBtn = `<button type="button" class="vl-mini-btn" data-e1-command="branch-case-up" data-branch-case-id="${esc(br.id)}" ${upDisabled} title="تحريك لأعلى"><i class="fas fa-arrow-up"></i></button>`;
        moveBranchDownBtn = `<button type="button" class="vl-mini-btn" data-e1-command="branch-case-down" data-branch-case-id="${esc(br.id)}" ${downDisabled} title="تحريك لأسفل"><i class="fas fa-arrow-down"></i></button>`;
      }

      return `
        <div class="e1-branch-case-card" data-branch-case-id="${esc(br.id)}" data-branch-type="${esc(br.branchType)}" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 10px; background-color: rgba(255,255,255,0.02);">
          <div class="e1-branch-case-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
            <strong style="color: var(--accent-orange); font-size:12px;">${branchTitle}</strong>
            <div class="vl-row-actions" style="display:flex; gap:5px;">
              ${moveBranchUpBtn}
              ${moveBranchDownBtn}
              ${deleteBranchBtn}
            </div>
          </div>
          <div class="e1-branch-case-body">
            ${conditionHtml}
            ${actionsContainerHtml}
          </div>
        </div>
      `;
    }).join('');

    const hasElse = (action.branches || []).some(b => b.branchType === 'else');
    const elseIfBtn = `<button type="button" class="vl-add-row-btn compact" data-e1-command="add-branch-else-if" data-branch-action-id="${esc(action.id)}" style="flex:1; font-size:11px; padding:4px 8px;"><i class="fas fa-plus"></i> إضافة Else If</button>`;
    const elseBtn = hasElse ? '' : `<button type="button" class="vl-add-row-btn compact secondary" data-e1-command="add-branch-else" data-branch-action-id="${esc(action.id)}" style="flex:1; font-size:11px; padding:4px 8px;"><i class="fas fa-plus"></i> إضافة Else</button>`;

    return `
      <div class="e1-repeat-card e1-action-card e1-branch-action-card ${action.enabled === false ? 'is-disabled' : ''}" data-action-id="${esc(action.id)}" style="border-left: 4px solid var(--accent-orange);">
        <div class="e1-repeat-head" style="margin-bottom: 10px;">
          <span class="e12-card-title">
            <label class="e12-enable">
              <input type="checkbox" class="e1-action-enabled" ${boolAttr(action.enabled)}>
              <span></span>
            </label>
            <strong style="color: var(--accent-orange);"><i class="fas fa-code-branch"></i> شرط متفرع (Branch)</strong>
            <code>${esc(action.id)}</code>
          </span>
          <div class="vl-row-actions">
            <button type="button" class="vl-mini-btn" data-e1-command="action-up" ${index ? '' : 'disabled'} title="تحريك لأعلى"><i class="fas fa-arrow-up"></i></button>
            <button type="button" class="vl-mini-btn" data-e1-command="action-down" ${index < count - 1 ? '' : 'disabled'} title="تحريك لأسفل"><i class="fas fa-arrow-down"></i></button>
            <button type="button" class="vl-mini-btn danger" data-e1-command="delete-action" title="حذف التفرع بالكامل"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="e1-branch-card-body" style="padding: 5px 0 5px 10px;">
          <div class="e1-branch-cases-container">
            ${branchesHtml}
          </div>
          <div class="e1-branch-controls" style="display:flex; gap:10px; margin-top:10px;">
            ${elseIfBtn}
            ${elseBtn}
          </div>
        </div>
      </div>
    `;
  };

  /* إعادة توليد كل المعرفات داخل شجرة إجراء منسوخ (بما فيها عقد التعبيرات) */
  proto.reidActionDeepE1 = function (action) {
    if (!action || typeof action !== 'object') return action;
    const reidExpression = node => {
      if (!node || typeof node !== 'object' || !node.type) return node;
      if (node.id) node.id = core.makeId('expr');
      ['object', 'left', 'right', 'argument', 'expression'].forEach(key => { if (node[key]) reidExpression(node[key]); });
      if (Array.isArray(node.arguments)) node.arguments.forEach(reidExpression);
      return node;
    };
    const reidCondition = condition => {
      if (!condition) return;
      condition.id = core.makeId('condition');
      if (condition.left && typeof condition.left === 'object') reidExpression(condition.left);
      if (condition.right && typeof condition.right === 'object') reidExpression(condition.right);
    };
    action.id = core.makeId('action');
    if (action.value && typeof action.value === 'object') reidExpression(action.value);
    (action.branches || []).forEach(branch => {
      if (!branch) return;
      branch.id = core.makeId('branch');
      if (branch.condition) {
        (branch.condition.conditions || []).forEach(reidCondition);
        (branch.condition.conditionGroups || []).forEach(group => { if (group) group.id = core.makeId('group'); });
      }
      (branch.actions || []).forEach(sub => this.reidActionDeepE1(sub));
    });
    (action.conditions || []).forEach(reidCondition);
    (action.actions || []).forEach(sub => this.reidActionDeepE1(sub));
    return action;
  };

  proto.renameVariableInDraft = function (oldName, newName, variableId) {
    /* إعادة التسمية الآمنة داخل أشجار Expression: العقد المرتبطة بمعرّف ثابت
       (sourceId) يتحدّث اسمها المعروض فقط، والعقد غير المرتبطة تُطابَق بالاسم
       القديم وتتبنى المعرّف حتى لا تنكسر مع أي تسمية لاحقة. */
    const rename = { sourceId: variableId || null, oldName, newName, referenceType: 'state' };
    const renameInExpression = value => {
      if (value && typeof value === 'object' && value.type) core.updateExpressionReferencesOnRename(value, rename);
    };
    const renameInCondition = condition => {
      if (!condition) return;
      if ((condition.isVisualExpression === true || condition.isVisualExpression === 'true') && condition.left && typeof condition.left === 'object') {
        renameInExpression(condition.left);
      }
      if (condition.right && typeof condition.right === 'object') renameInExpression(condition.right);
    };
    /* params/settings/مصادر الحلقات كانت تُعالَج للمستوى العلوي فقط، فيبقى
       incrementVariable داخل فرع أو loop.source بالاسم القديم → متغير مفقود. */
    const renameInParamsBag = bag => {
      if (!bag || typeof bag !== 'object') return;
      ['variableName', 'arrayName', 'styleValue', 'resultName'].forEach(key => {
        if (bag[key] === oldName) bag[key] = newName;
      });
    };
    const renameInActions = actions => (actions || []).forEach(action => {
      if (!action) return;
      renameInExpression(action.value);
      if (action.valueSource && typeof action.valueSource === 'object') renameInExpression(action.valueSource.value);
      renameInParamsBag(action.params);
      renameInParamsBag(action.settings);
      if (action.source && typeof action.source === 'object' && action.source.variableName === oldName) action.source.variableName = newName;
      if (action.count && typeof action.count === 'object') renameInExpression(action.count.value);
      if (action.condition && action.condition.conditions) (action.condition.conditions || []).forEach(renameInCondition);
      (action.branches || []).forEach(branch => {
        if (branch && branch.condition) (branch.condition.conditions || []).forEach(renameInCondition);
        renameInActions(branch ? branch.actions : []);
      });
      if (action.type === 'loop') renameInActions(action.actions);
    });
    (this.visualLinkDraft.conditions || []).forEach(renameInCondition);
    renameInActions(this.visualLinkDraft.actions);
    (this.visualLinkDraft.functions || []).forEach(fn => {
      (fn.conditions || []).forEach(renameInCondition);
      renameInActions(fn.actions);
    });

    (this.visualLinkDraft.conditions || []).forEach(condition => {
      if (condition.left === oldName) condition.left = newName;
      if (condition.rightType === 'expression' && condition.right === oldName) condition.right = newName;
    });
    (this.visualLinkDraft.actions || []).forEach(action => {
      if (action.valueType === 'expression' && action.value === oldName) action.value = newName;
      const params = action.params || {};
      if (params.variableName === oldName) params.variableName = newName;
      if (params.arrayName === oldName) params.arrayName = newName;
      if (params.styleValue === oldName) params.styleValue = newName;
      const settings = action.settings || {};
      if (settings.variableName === oldName) settings.variableName = newName;
      if (settings.arrayName === oldName) settings.arrayName = newName;
      if (settings.styleValue === oldName) settings.styleValue = newName;
    });
    (this.visualLinkDraft.advancedOperations || []).forEach(operation => {
      if (operation.resultName === oldName) operation.resultName = newName;
      const settings = operation.settings || {};
      Object.keys(settings).forEach(key => {
        if (settings[key] === oldName) settings[key] = newName;
      });
      const params = operation.params || {};
      Object.keys(params).forEach(key => {
        if (params[key] === oldName) params[key] = newName;
      });
    });
  };

  proto.queueVariableRenameE1 = function (variableId, oldName, newName) {
    const pending = this.e1PendingVariableRenames || (this.e1PendingVariableRenames = []);
    const existing = pending.find(rename => rename.variableId === variableId);
    if (existing) {
      existing.newName = newName;
      if (existing.oldName === existing.newName) {
        this.e1PendingVariableRenames = pending.filter(rename => rename !== existing);
      }
      return;
    }
    pending.push({ variableId, oldName, newName });
  };

  /* إعادة التسمية داخل الرابط الحالي فقط.
     البلوك يُعاد توليده بالكامل من التعريف في composeVisualLinkDraftJS، لذلك لا
     نلمس customJS إطلاقاً — الاستبدال العام بـ regex كان يعيد كتابة روابط أخرى
     وكود المستخدم اليدوي والنصوص الحرفية. هنا نكتفي بالتحقق من صحة الأسماء. */
  proto.applyPendingVariableRenamesE1 = function (customJS) {
    const renames = this.e1PendingVariableRenames || [];
    const draft = this.visualLinkDraft || {};
    const draftNames = new Set([
      ...(draft.state || draft.variables || []).map(variable => variable && variable.name),
      ...(draft.reads || []).map(read => read && read.name)
    ].filter(Boolean));
    for (const rename of renames) {
      if (!isIdentifier(rename.newName)) {
        return { valid: false, customJS, error: `الاسم ${rename.newName} ليس معرّف JavaScript صالحاً.` };
      }
      /* تعارض الأسماء داخل نفس الرابط فقط — أسماء الروابط الأخرى معزولة في IIFE مستقل */
      const duplicates = [...(draft.state || draft.variables || []), ...(draft.reads || [])]
        .filter(item => item && item.name === rename.newName && item.id !== rename.variableId);
      if (duplicates.length) {
        return { valid: false, customJS, error: `الاسم ${rename.newName} مستخدم بالفعل في هذا التفاعل.` };
      }
      if (!draftNames.has(rename.newName)) {
        return { valid: false, customJS, error: `تعذّر تطبيق إعادة التسمية إلى ${rename.newName}.` };
      }
    }
    return { valid: true, customJS: String(customJS || ''), error: '' };
  };

  proto.rebuildRecipeDefinitionE1 = function () {
    if (!this.visualLinkDraft.recipeType) return;
    const id = this.visualLinkDraft.id; const settings = this.visualLinkDraft.settings; const event = this.visualLinkDraft.event;
    this.e1RecipeConfig.sourceId = this.visualLinkDraft.sourceId;
    const next = core.buildRecipeDefinition(this.visualLinkDraft.recipeType, Object.assign({}, this.e1RecipeConfig, { id, event }));
    next.settings = settings; this.visualLinkDraft = next;
  };

  proto.refreshE1PreviewOnly = function () {
    const preview = document.getElementById('e1-code-preview');
    if (preview) preview.innerHTML = this.renderCodePreview(core.generateBlock(this.visualLinkDraft));
    const summary = document.getElementById('e1-live-summary'); if (summary) summary.textContent = this.getE1Summary(this.visualLinkDraft);
  };

  proto.copyTextE1 = function (value) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(() => this.showToastNotice('تم نسخ الكود'));
    else { const textarea = document.createElement('textarea'); textarea.value = value; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); textarea.remove(); this.showToastNotice('تم نسخ الكود'); }
  };

  proto.startE1Picking = function (pick) {
    this.syncE1DraftFromUI();
    this.e1Picking = pick;
    this.isPickingTarget = true;
    this.pickingContext = 'e1-picker';
    const overlay = document.getElementById('vl-popup-overlay'); if (overlay) overlay.style.visibility = 'hidden';
    const notice = document.createElement('div'); notice.id = 'vl-picking-notice'; notice.className = 'vl-picking-notice'; notice.textContent = 'اختر عنصرًا من المعاينة · Esc للإلغاء'; document.body.appendChild(notice);
  };
  proto.cancelE1Picking = function (silent) {
    this.e1Picking = null; this.isPickingTarget = false; this.pickingContext = null;
    const notice = document.getElementById('vl-picking-notice'); if (notice) notice.remove();
    const overlay = document.getElementById('vl-popup-overlay'); if (overlay && !silent) overlay.style.visibility = 'visible';
  };
  proto.handleTargetPicked = function (target) {
    if (this.pickingContext !== 'e1-picker' || !this.e1Picking || !this.visualLinkDraft) return legacyHandleTargetPicked.call(this, target);
    const id = this.ensureElementId(target); const pick = this.e1Picking;
    if (pick.role === 'source') this.visualLinkDraft.sourceId = id;
    else if (pick.role === 'read') { const read = this.visualLinkDraft.reads.find(item => item.id === pick.itemId); if (read) read.elementId = id; }
    else if (pick.role === 'action') {
      const actions = [...(this.visualLinkDraft.actions || []), ...(this.visualLinkDraft.functions || []).reduce((all, fn) => all.concat(fn.actions || []), [])];
      const action = actions.find(item => item.id === pick.itemId); if (action) { action.targetId = id; action.target = { kind: 'element', id }; }
    } else if (pick.role === 'advanced-setting' && this.e11AdvancedView && this.e11AdvancedView.draft) {
      this.e11AdvancedView.draft.settings = Object.assign({}, this.e11AdvancedView.draft.settings || {}, { [pick.fieldKey]: id });
    } else if (pick.role === 'recipe-input') this.e1RecipeConfig.inputId = id;
    else if (pick.role === 'recipe-target') this.e1RecipeConfig.targetId = id;
    else if (pick.role === 'comp-trigger') {
      const item = this.visualLinkDraft.items.find(it => it.id === pick.itemId);
      if (item) item.triggerId = id;
    } else if (pick.role === 'comp-content') {
      const item = this.visualLinkDraft.items.find(it => it.id === pick.itemId);
      if (item) item.contentId = id;
    } else if (pick.role === 'comp-tab') {
      const item = this.visualLinkDraft.items.find(it => it.id === pick.itemId);
      if (item) item.tabId = id;
    } else if (pick.role === 'comp-panel') {
      const item = this.visualLinkDraft.items.find(it => it.id === pick.itemId);
      if (item) item.panelId = id;
    } else if (pick.role === 'comp-tablist') {
      this.visualLinkDraft.tabListId = id;
    } else if (pick.role === 'comp-panels-container') {
      this.visualLinkDraft.panelsContainerId = id;
    } else if (pick.role === 'comp-container-id') {
      this.visualLinkDraft.containerId = id;
    } else if (pick.role === 'modal-open') {
      this.visualLinkDraft.openTriggers[Number(pick.itemId)] = { id, selector: '' };
    } else if (pick.role === 'modal-close') {
      this.visualLinkDraft.closeTriggers[Number(pick.itemId)] = { id, selector: '' };
    } else if (pick.role === 'modal-modal') {
      this.visualLinkDraft.modalDescriptor = { id, selector: '' };
    } else if (pick.role === 'modal-overlay') {
      this.visualLinkDraft.overlayDescriptor = { id, selector: '' };
    } else if (pick.role === 'modal-title') {
      this.visualLinkDraft.titleDescriptor = { id, selector: '' };
    } else if (pick.role === 'modal-description') {
      this.visualLinkDraft.descriptionDescriptor = { id, selector: '' };
    } else if (pick.role === 'dropdown-trigger') {
      this.visualLinkDraft.triggerDescriptor = { id, selector: '' };
    } else if (pick.role === 'dropdown-menu') {
      this.visualLinkDraft.menuDescriptor = { id, selector: '' };
    } else if (pick.role === 'dropdown-item') {
      this.visualLinkDraft.itemDescriptors[Number(pick.itemId)] = { id, selector: '' };
    } else if (pick.role === 'dropdown-wrapper') {
      this.visualLinkDraft.wrapperDescriptor = { id, selector: '' };
    } else if (pick.role === 'sidebar-open') {
      this.visualLinkDraft.openTriggers[Number(pick.itemId)] = { id, selector: '' };
    } else if (pick.role === 'sidebar-close') {
      this.visualLinkDraft.closeTriggers[Number(pick.itemId)] = { id, selector: '' };
    } else if (pick.role === 'sidebar-sidebar') {
      this.visualLinkDraft.sidebarDescriptor = { id, selector: '' };
    } else if (pick.role === 'sidebar-overlay') {
      this.visualLinkDraft.overlayDescriptor = { id, selector: '' };
    } else if (pick.role === 'sidebar-item') {
      this.visualLinkDraft.navItemDescriptors[Number(pick.itemId)] = { id, selector: '' };
    } else if (pick.role === 'sidebar-title') {
      this.visualLinkDraft.titleDescriptor = { id, selector: '' };
    }
    if (this.visualLinkDraft.builderMode === 'recipe') this.rebuildRecipeDefinitionE1();
    this.cancelE1Picking(); this.renderE1Builder(); this.app.selectElement(target); target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  proto.focusElementByIdE1 = function (id) {
    const element = document.getElementById(id); if (!element) return;
    this.app.selectElement(element); element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); this.updateVisualLinkArrows();
  };

  proto.validateE1Draft = function () {
    this.syncE1DraftFromUI();
    const result = core.validateDefinition(this.visualLinkDraft);
    const definition = result.definition;
    if (definition.builderMode !== 'function' && !document.getElementById(definition.sourceId)) result.errors.push('عنصر Source غير موجود.');
    definition.reads.forEach((read, index) => {
      const descriptor = this.getE12ReadDescriptor(read.type);
      const requiresElement = descriptor.requiresElement !== undefined ? descriptor.requiresElement : read.type !== 'sourceValue';
      if (requiresElement && !document.getElementById(read.elementId)) result.errors.push(`عنصر القراءة ${index + 1} غير موجود.`);
      if (!isIdentifier(read.name)) result.errors.push(`اسم نتيجة القراءة ${index + 1} غير صالح.`);
    });
    const readNames = definition.reads.map(read => read.name);
    if (new Set(readNames).size !== readNames.length) result.errors.push('أسماء نتائج القراءة يجب أن تكون فريدة.');
    Object.keys(this.e12RawVariableNames || {}).forEach(id => { if (!isIdentifier(this.e12RawVariableNames[id])) result.errors.push(`اسم المتغير «${this.e12RawVariableNames[id]}» غير صالح.`); });
    Object.keys(this.e12RawFunctionNames || {}).forEach(id => { if (!isIdentifier(this.e12RawFunctionNames[id])) result.errors.push(`اسم Function «${this.e12RawFunctionNames[id]}» غير صالح.`); });
    const actions = [...(definition.actions || []), ...(definition.functions || []).reduce((all, fn) => all.concat(fn.actions || []), [])];
    actions.forEach((action, index) => { if (action.targetId && !document.getElementById(action.targetId)) result.errors.push(`Target الإجراء ${index + 1} غير موجود.`); });
    const binding = definition.settings && definition.settings.legacyBinding;
    if (definition.settings && definition.settings.legacyRequiresManual && binding && (definition.sourceId !== binding.sourceId || definition.targetId !== binding.targetId || definition.event !== binding.event)) result.errors.push('هذا الرابط القديم يعتمد على Manual Code؛ لا يمكن تغيير Source أو Target أو Event قبل تحويله إلى وصفة E1.');

    /* B13: تصادم أسماء الدوال عبر الروابط.
       كل دالة بتتكتب على window.<name>، وفحص التكرار في core محصور بالتعريف
       الواحد — فرابطين بيسمّوا دالة formatPrice كان واحد يدوس التاني بصمت
       وقت التشغيل. الفحص هنا لأن هنا بس عندنا رؤية لباقي الروابط. */
    const ownFunctions = (definition.functions || []).filter(fn => fn.enabled !== false && fn.name);
    if (ownFunctions.length) {
      const takenNames = new Map();
      this.parseVisualLinks().forEach(other => {
        if (!other || other.id === definition.id) return;
        (other.functions || []).forEach(fn => {
          if (fn && fn.enabled !== false && fn.name) takenNames.set(fn.name, other.id);
        });
      });
      ownFunctions.forEach(fn => {
        if (takenNames.has(fn.name)) {
          result.errors.push(`اسم الدالة «${fn.name}» مستخدم في رابط آخر (${takenNames.get(fn.name)}) — الاثنان يكتبان على window.${fn.name} وسيدوس أحدهما على الآخر. غيّر الاسم.`);
        }
      });
    }

    result.valid = result.errors.length === 0;
    const holder = document.getElementById('vl-validation-errors');
    if (holder) { holder.classList.toggle('visible', !result.valid); holder.innerHTML = result.errors.map(error => `<div><i class="fas fa-circle-exclamation"></i> ${esc(error)}</div>`).join(''); }
    return result;
  };
  proto.composeVisualLinkDraftJS = function (definition) {
    const wrapped = core.generateBlock(definition);
    const existingId = this.activeVisualLink && this.activeVisualLink.existingId;
    const existing = existingId ? this.parseVisualLinks().find(link => link.id === existingId) : null;
    if (!existing) return `${this.customJS.replace(/\s+$/, '')}\n${wrapped}\n`;
    const lines = this.customJS.split(/\r?\n/); lines.splice(existing.startIndex, existing.endIndex - existing.startIndex + 1, ...wrapped.split('\n')); return lines.join('\n');
  };
  proto.saveVisualLinkFromPopup = function () {
    const validation = this.validateE1Draft(); if (!validation.valid) { this.showToastNotice('راجع الحقول قبل الحفظ'); return; }
    const renameResult = this.applyPendingVariableRenamesE1(this.customJS);
    if (!renameResult.valid) { this.showToastNotice(renameResult.error); return; }
    const existing = !!this.activeVisualLink.existingId; this.flushPendingHistoryBeforeVisualLink();
    this.customJS = renameResult.customJS;
    this.customJS = this.composeVisualLinkDraftJS(validation.definition);
    if (this.currentLanguage === 'js') { this.textarea.value = this.customJS; this.updateLineNumbers(); }
    this.commitTransientVisualLinkIds(); this.app.saveProgress(false); this.app.history.saveState(existing ? 'Update Visual Link E1' : 'Create Visual Link E1');
    this.closeVisualLinkPopup({ keepTransient: true }); this.renderVisualLinksDashboard(); this.scanAndRenderVariables(); this.showToastNotice(existing ? 'تم حفظ التعديل' : 'تم إنشاء التفاعل');
  };
  proto.deleteVisualLink = function (id) {
    const match = this.parseVisualLinks().find(link => link.id === id); if (!match) return;
    this.flushPendingHistoryBeforeVisualLink(); const lines = this.customJS.split(/\r?\n/); lines.splice(match.startIndex, match.endIndex - match.startIndex + 1); this.customJS = lines.join('\n');
    if (this.currentLanguage === 'js') { this.textarea.value = this.customJS; this.updateLineNumbers(); }
    this.releaseTransientVisualLinkIds(); this.app.saveProgress(false); this.app.history.saveState('Delete Visual Link E1'); delete this.hiddenLinkArrows[id];
    if (this.activeVisualLink && this.activeVisualLink.existingId === id) this.closeVisualLinkPopup({ keepTransient: true }); this.renderVisualLinksDashboard(); this.scanAndRenderVariables(); this.showToastNotice('تم حذف التفاعل');
  };

  proto.tryVisualLinkFromPopup = function () {
    const validation = this.validateE1Draft(); if (!validation.valid) { this.showToastNotice('أكمل التفاعل قبل التجربة'); return; }
    this.closeVisualLinkTrial(); const originalJS = this.customJS; let documentHTML = '';
    const trialDefinition = core.clone(validation.definition);
    trialDefinition.settings = Object.assign({}, trialDefinition.settings || {}, { tryMode: true });
    const advancedTools = core.ADVANCED_TOOLS || {};
    const hasNavigation = (trialDefinition.advancedOperations || []).some(operation => {
      const descriptor = advancedTools[operation.toolId] || {};
      const name = descriptor.operation || operation.toolId || '';
      return ['redirect', 'open', 'browser.redirect', 'browser.open'].includes(name) || /(?:^|\.)(?:redirect|open)$/.test(name);
    });
    const hasStorage = (trialDefinition.advancedOperations || []).some(operation => {
      const descriptor = advancedTools[operation.toolId] || {};
      return (descriptor.category || descriptor.group || '').replace(/s$/, '') === 'storage' || /^storage\./.test(operation.toolId || '');
    });
    try { this.customJS = this.composeVisualLinkDraftJS(trialDefinition); documentHTML = this.app.buildExportDocument(); } finally { this.customJS = originalJS; }
    const bridge = `<script>window.addEventListener('error',e=>parent.postMessage({type:'osoos-e1-error',message:e.message},'*'));window.addEventListener('unhandledrejection',e=>parent.postMessage({type:'osoos-e1-error',message:String(e.reason)},'*'));<\/script>`;
    documentHTML = documentHTML.replace('</head>', `${bridge}</head>`);
    const notes = ['لم يُحفظ شيء بعد.'];
    if (hasNavigation) notes.push('الانتقال وفتح الروابط محظوران داخل التجربة المعزولة.');
    if (hasStorage) notes.push('التخزين مؤقت داخل Try Now ولا يغيّر بيانات مشروعك.');
    const overlay = document.createElement('div'); overlay.id = 'vl-trial-overlay'; overlay.innerHTML = `<div class="vl-trial-toolbar"><span class="vl-trial-title"><i class="fas fa-flask"></i> تجربة E1.3 معزولة</span><span class="vl-trial-note">${esc(notes.join(' '))}</span><button class="btn btn-secondary" id="e1-trial-cancel">إلغاء التجربة</button><button class="btn btn-secondary" id="e1-trial-edit">تعديل</button><button class="btn btn-primary" id="e1-trial-save">حفظ</button></div><iframe class="vl-trial-frame" sandbox="allow-scripts allow-modals"></iframe>`;
    document.body.appendChild(overlay); overlay.querySelector('iframe').srcdoc = documentHTML;
    overlay.querySelector('#e1-trial-cancel').addEventListener('click', () => this.closeVisualLinkTrial()); overlay.querySelector('#e1-trial-edit').addEventListener('click', () => this.closeVisualLinkTrial()); overlay.querySelector('#e1-trial-save').addEventListener('click', () => { this.closeVisualLinkTrial(); this.saveVisualLinkFromPopup(); });
    const trialFrame = overlay.querySelector('iframe');
    this._vlTrialMessageHandler = event => {
      /* كان بيثق في أي رسالة من أي مصدر — دلوقتي بس من iframe التجربة نفسه */
      if (trialFrame && event.source !== trialFrame.contentWindow) return;
      if (!event.data) return;
      if (event.data.type === 'osoos-e1-error') this.showToastNotice(`خطأ في التجربة: ${event.data.message}`, 'error');
      if (event.data.type === 'osoos-e1-warning') this.showToastNotice(event.data.message || 'تم حظر إجراء غير آمن داخل Try Now', 'warning');
    }; window.addEventListener('message', this._vlTrialMessageHandler);
  };
  proto.closeVisualLinkTrial = function () { const overlay = document.getElementById('vl-trial-overlay'); if (overlay) overlay.remove(); if (this._vlTrialMessageHandler) { window.removeEventListener('message', this._vlTrialMessageHandler); this._vlTrialMessageHandler = null; } };
  proto.closeVisualLinkPopup = function (options) {
    const settings = options || {}; this.closeVisualLinkTrial(); const overlay = document.getElementById('vl-popup-overlay'); if (overlay) overlay.remove();
    if (this._vlKeyHandler) { document.removeEventListener('keydown', this._vlKeyHandler, true); this._vlKeyHandler = null; }
    if (this.e1Picking) this.cancelE1Picking(true); this.activeVisualLink = null; this.visualLinkDraft = null; this.e1RecipeConfig = null; this.e11AdvancedView = null; this.e12FunctionView = null; this.e12RawVariableNames = null; this.e12RawFunctionNames = null; this.e1PendingVariableRenames = null; this.previewLinkArrow = null;
    if (!settings.keepTransient) this.releaseTransientVisualLinkIds(); this.updateVisualLinkArrows();
  };

  proto.updateVisualLinkArrows = function () {
    if (this._updateArrowsFrameId) {
      cancelAnimationFrame(this._updateArrowsFrameId);
    }
    this._updateArrowsFrameId = requestAnimationFrame(() => {
      this._updateArrowsFrameId = null;
      this.updateVisualLinkArrowsSync();
    });
  };

  proto.updateVisualLinkArrowsSync = function () {
    const svg = document.getElementById('visual-links-overlay'); if (!svg) return;
    svg.querySelectorAll('.vl-arrow,.vl-arrow-label,.vl-arrow-badge-group').forEach(node => node.remove());
    if (document.body.classList.contains('preview-mode-active')) return;
    
    const links = this.parseVisualLinks();
    const components = this.parseComponents();
    const relations = [];
    
    // Parse visual links relations
    links.forEach(link => {
      if (!this.hiddenLinkArrows[link.id]) {
        core.getRelationships(link).forEach(rel => {
          relations.push(Object.assign({ linkId: link.id, isComponent: false }, rel));
        });
      }
    });
    
    // Parse component relations
    components.forEach(comp => {
      const metadata = comp.metadata;
      if (!metadata || this.hiddenLinkArrows[comp.id]) return;
      if (comp.componentType === 'modal') {
        const modalElement = this.resolveModalDescriptor(metadata.modalDescriptor, false);
        if (!modalElement) return;
        this.resolveModalDescriptorList(metadata.openTriggers).forEach(element => relations.push({ linkId: comp.id, sourceElement: element, targetElement: modalElement, label: 'Open Modal', role: 'modal', isComponent: true }));
        this.resolveModalDescriptorList(metadata.closeTriggers).forEach(element => relations.push({ linkId: comp.id, sourceElement: element, targetElement: modalElement, label: 'Close Modal', role: 'modal', isComponent: true }));
        const overlayElement = this.resolveModalDescriptor(metadata.overlayDescriptor, false);
        if (overlayElement) relations.push({ linkId: comp.id, sourceElement: overlayElement, targetElement: modalElement, label: 'Overlay Close', role: 'modal', isComponent: true });
        return;
      }
      if (comp.componentType === 'dropdown') {
        const triggerElement = this.resolveModalDescriptor(metadata.triggerDescriptor, false);
        const menuElement = this.resolveModalDescriptor(metadata.menuDescriptor, false);
        if (triggerElement && menuElement) {
          relations.push({ linkId: comp.id, sourceElement: triggerElement, targetElement: menuElement, label: 'Open Dropdown', role: 'dropdown', isComponent: true });
          const wrapperElement = this.resolveModalDescriptor(metadata.wrapperDescriptor, false);
          if (wrapperElement) {
            relations.push({ linkId: comp.id, sourceElement: triggerElement, targetElement: wrapperElement, label: 'Dropdown Menu', role: 'dropdown', isComponent: true });
          }
          this.resolveModalDescriptorList(metadata.itemDescriptors).forEach(element => {
            relations.push({ linkId: comp.id, sourceElement: menuElement, targetElement: element, label: 'Menu Item', role: 'dropdown', isComponent: true });
          });
        }
        return;
      }
      if (comp.componentType === 'sidebar') {
        const sidebarElement = this.resolveModalDescriptor(metadata.sidebarDescriptor, false);
        if (sidebarElement) {
          this.resolveModalDescriptorList(metadata.openTriggers).forEach(element => {
            relations.push({ linkId: comp.id, sourceElement: element, targetElement: sidebarElement, label: 'Open Sidebar', role: 'sidebar', isComponent: true });
          });
          this.resolveModalDescriptorList(metadata.closeTriggers).forEach(element => {
            relations.push({ linkId: comp.id, sourceElement: element, targetElement: sidebarElement, label: 'Close Sidebar', role: 'sidebar', isComponent: true });
          });
          const overlayElement = this.resolveModalDescriptor(metadata.overlayDescriptor, false);
          if (overlayElement) {
            relations.push({ linkId: comp.id, sourceElement: overlayElement, targetElement: sidebarElement, label: 'Overlay Close', role: 'sidebar', isComponent: true });
          }
          this.resolveModalDescriptorList(metadata.navItemDescriptors).forEach(element => {
            relations.push({ linkId: comp.id, sourceElement: sidebarElement, targetElement: element, label: 'Sidebar Item', role: 'sidebar', isComponent: true });
          });
        }
        return;
      }
      const typeLabel = comp.componentType === 'accordion' ? 'Accordion' : 'Tab';
      const items = metadata.items || [];
      items.forEach((item, index) => {
        const triggerId = comp.componentType === 'accordion' ? item.triggerId : item.tabId;
        const contentId = comp.componentType === 'accordion' ? item.contentId : item.panelId;
        if (triggerId && contentId) {
          relations.push({
            linkId: comp.id,
            sourceId: triggerId,
            targetId: contentId,
            label: `${typeLabel} ${index + 1}`,
            role: comp.componentType,
            isComponent: true
          });
        }
      });
    });
    
    // Add current draft preview relations
    if (this.visualLinkDraft) {
      const isComponentDraft = this.visualLinkDraft.builderMode === 'component' || !!this.visualLinkDraft.componentType;
      if (isComponentDraft) {
        const comp = this.visualLinkDraft;
        if (comp.componentType === 'modal') {
          const modalElement = this.resolveModalDescriptor(comp.modalDescriptor, false);
          if (modalElement) {
            this.resolveModalDescriptorList(comp.openTriggers).forEach(element => relations.push({ linkId: '__draft', sourceElement: element, targetElement: modalElement, label: 'Open Modal', role: 'modal', preview: true, isComponent: true }));
            this.resolveModalDescriptorList(comp.closeTriggers).forEach(element => relations.push({ linkId: '__draft', sourceElement: element, targetElement: modalElement, label: 'Close Modal', role: 'modal', preview: true, isComponent: true }));
            const overlayElement = this.resolveModalDescriptor(comp.overlayDescriptor, false);
            if (overlayElement) relations.push({ linkId: '__draft', sourceElement: overlayElement, targetElement: modalElement, label: 'Overlay Close', role: 'modal', preview: true, isComponent: true });
          }
        } else if (comp.componentType === 'dropdown') {
          const triggerElement = this.resolveModalDescriptor(comp.triggerDescriptor, false);
          const menuElement = this.resolveModalDescriptor(comp.menuDescriptor, false);
          if (triggerElement && menuElement) {
            relations.push({ linkId: '__draft', sourceElement: triggerElement, targetElement: menuElement, label: 'Open Dropdown', role: 'dropdown', preview: true, isComponent: true });
            const wrapperElement = this.resolveModalDescriptor(comp.wrapperDescriptor, false);
            if (wrapperElement) {
              relations.push({ linkId: '__draft', sourceElement: triggerElement, targetElement: wrapperElement, label: 'Dropdown Menu', role: 'dropdown', preview: true, isComponent: true });
            }
            this.resolveModalDescriptorList(comp.itemDescriptors).forEach(element => {
              relations.push({ linkId: '__draft', sourceElement: menuElement, targetElement: element, label: 'Menu Item', role: 'dropdown', preview: true, isComponent: true });
            });
          }
        } else if (comp.componentType === 'sidebar') {
          const sidebarElement = this.resolveModalDescriptor(comp.sidebarDescriptor, false);
          if (sidebarElement) {
            this.resolveModalDescriptorList(comp.openTriggers).forEach(element => {
              relations.push({ linkId: '__draft', sourceElement: element, targetElement: sidebarElement, label: 'Open Sidebar', role: 'sidebar', preview: true, isComponent: true });
            });
            this.resolveModalDescriptorList(comp.closeTriggers).forEach(element => {
              relations.push({ linkId: '__draft', sourceElement: element, targetElement: sidebarElement, label: 'Close Sidebar', role: 'sidebar', preview: true, isComponent: true });
            });
            const overlayElement = this.resolveModalDescriptor(comp.overlayDescriptor, false);
            if (overlayElement) {
              relations.push({ linkId: '__draft', sourceElement: overlayElement, targetElement: sidebarElement, label: 'Overlay Close', role: 'sidebar', preview: true, isComponent: true });
            }
            this.resolveModalDescriptorList(comp.navItemDescriptors).forEach(element => {
              relations.push({ linkId: '__draft', sourceElement: sidebarElement, targetElement: element, label: 'Sidebar Item', role: 'sidebar', preview: true, isComponent: true });
            });
          }
        } else {
        const typeLabel = comp.componentType === 'accordion' ? 'Accordion' : 'Tab';
        const items = comp.items || [];
        items.forEach((item, index) => {
          const triggerId = comp.componentType === 'accordion' ? item.triggerId : item.tabId;
          const contentId = comp.componentType === 'accordion' ? item.contentId : item.panelId;
          if (triggerId && contentId) {
            relations.push({
              linkId: '__draft',
              sourceId: triggerId,
              targetId: contentId,
              label: `${typeLabel} ${index + 1}`,
              role: comp.componentType,
              preview: true,
              isComponent: true
            });
          }
        });
        }
      } else {
        core.getRelationships(this.visualLinkDraft).forEach(rel => {
          relations.push(Object.assign({ linkId: '__draft', preview: true, isComponent: false }, rel));
        });
      }
    }
    
    const rect = svg.parentElement.getBoundingClientRect(); const ns = 'http://www.w3.org/2000/svg';
    relations.forEach((relation, index) => {
      const source = relation.sourceElement || document.getElementById(relation.sourceId); const target = relation.targetElement || document.getElementById(relation.targetId); if (!source || !target) return;
      const sr = source.getBoundingClientRect(); const tr = target.getBoundingClientRect(); const x1 = sr.left + sr.width / 2 - rect.left; const y1 = sr.top + sr.height / 2 - rect.top; const x2 = tr.left + tr.width / 2 - rect.left; const y2 = tr.top + tr.height / 2 - rect.top;
      const offset = 28 + (index % 4) * 12; const mx = (x1 + x2) / 2; const my = Math.min(y1, y2) - offset;
      
      // Draw path with pointer-events: none
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
      path.setAttribute('class', `vl-arrow ${relation.preview ? 'vl-arrow-preview' : ''} vl-arrow-${relation.role}`);
      path.setAttribute('marker-end', 'url(#vl-arrowhead)');
      path.style.pointerEvents = 'none';
      svg.appendChild(path);
      
      // Draw Clickable Capsule Badge
      const labelText = relation.label;
      const badgeGroup = document.createElementNS(ns, 'g');
      badgeGroup.setAttribute('class', `vl-arrow-badge-group ${relation.preview ? 'vl-arrow-preview' : ''}`);
      badgeGroup.style.cursor = relation.preview ? 'default' : 'pointer';
      
      const rectBg = document.createElementNS(ns, 'rect');
      const textWidth = labelText.length * 6 + 14;
      rectBg.setAttribute('x', mx - textWidth / 2);
      rectBg.setAttribute('y', my - 8);
      rectBg.setAttribute('width', textWidth);
      rectBg.setAttribute('height', 16);
      rectBg.setAttribute('rx', 8);
      rectBg.setAttribute('ry', 8);
      
      let badgeColor = '#f59e0b'; // action
      if (relation.role === 'accordion') badgeColor = '#3b82f6';
      else if (relation.role === 'tabs') badgeColor = '#ec4899';
      else if (relation.role === 'modal') badgeColor = '#8b5cf6';
      else if (relation.role === 'dropdown') badgeColor = '#10b981';
      else if (relation.role === 'sidebar') badgeColor = '#db2777';
      else if (relation.role === 'read') badgeColor = '#22d3ee';
      
      rectBg.setAttribute('fill', badgeColor);
      rectBg.setAttribute('stroke', '#ffffff');
      rectBg.setAttribute('stroke-width', '1');
      badgeGroup.appendChild(rectBg);
      
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', mx);
      label.setAttribute('y', my + 3);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#ffffff');
      label.setAttribute('font-family', 'system-ui, sans-serif');
      label.setAttribute('font-size', '8px');
      label.setAttribute('font-weight', 'bold');
      label.style.pointerEvents = 'none';
      label.textContent = labelText;
      badgeGroup.appendChild(label);
      
      if (!relation.preview) {
        badgeGroup.addEventListener('click', event => {
          event.stopPropagation();
          if (relation.isComponent) {
            const comp = this.parseComponents().find(item => item.id === relation.linkId);
            if (comp) {
              this.openComponentPopup(comp);
              if (relation.sourceElement) {
                this.app.selectElement(relation.sourceElement);
                relation.sourceElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          } else {
            const link = this.parseVisualLinks().find(item => item.id === relation.linkId);
            if (link) this.openVisualLinkPopup(null, link);
          }
        });
      }
      
      svg.appendChild(badgeGroup);
    });
  };

  // Phase D2: Global event delegation for action upload buttons and change events
  document.addEventListener('click', event => {
    const btn = event.target.closest('.vl-action-upload-btn');
    if (btn) {
      const fileInput = document.getElementById(btn.dataset.fileInput);
      if (fileInput) fileInput.click();
    }
  });

  document.addEventListener('change', event => {
    if (event.target && event.target.classList.contains('action-file-selector')) {
      const fileInput = event.target;
      const file = fileInput.files[0];
      if (!file) return;

      const warningDiv = document.getElementById(fileInput.id.replace('-file', '-warning'));
      if (warningDiv) {
        if (file.size > 500 * 1024) {
          warningDiv.style.display = 'block';
        } else {
          warningDiv.style.display = 'none';
        }
      }

      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target.result;
        const textInput = document.getElementById(fileInput.id.replace('-file', '-input'));
        if (textInput) {
          textInput.value = dataUrl;
          textInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
      reader.readAsDataURL(file);
    }
  });

  proto.parseComponents = function () {
    return core.parseComponents ? core.parseComponents(this.customJS) : [];
  };

  proto.getComponentManagementInfo = function (component) {
    const metadata = component.metadata || component;
    const type = component.componentType || metadata.componentType;
    const catalog = COMPONENT_UX_CATALOG[type] || { name: type || 'مكوّن', english: type || 'Component', icon: 'fa-cube' };
    let detail = '';
    let descriptor = null;
    if (type === 'accordion' || type === 'tabs') {
      const count = (metadata.items || []).length;
      detail = `${count} ${type === 'tabs' ? 'تبويبات' : 'عناصر'}`;
      const first = (metadata.items || [])[0] || {};
      descriptor = { id: type === 'tabs' ? (first.tabId || first.panelId || '') : (first.triggerId || first.contentId || ''), selector: '' };
    } else if (type === 'modal') {
      descriptor = metadata.modalDescriptor || null;
      detail = this.modalDescriptorValue(descriptor) || 'عنصر النافذة غير محدد';
    } else if (type === 'dropdown') {
      descriptor = metadata.menuDescriptor || null;
      detail = this.modalDescriptorValue(descriptor) || 'عنصر القائمة غير محدد';
    } else if (type === 'sidebar') {
      descriptor = metadata.sidebarDescriptor || null;
      detail = this.modalDescriptorValue(descriptor) || 'عنصر القائمة الجانبية غير محدد';
    }
    return { type, catalog, detail, descriptor };
  };

  proto.renderComponentsManagementList = function () {
    const container = document.getElementById('js-components-management');
    if (!container) return;
    const components = this.parseComponents();
    const rows = components.map(component => {
      const info = this.getComponentManagementInfo(component);
      return `<article class="component-management-item" data-component-id="${esc(component.id)}">
        <div class="component-management-main"><span class="component-management-icon"><i class="fas ${info.catalog.icon}"></i></span><div><strong>${esc(info.catalog.name)} <small>${esc(info.catalog.english)}</small></strong><code>${esc(info.detail)}</code></div></div>
        <div class="component-management-actions">
          <button type="button" data-component-action="highlight" title="إظهار وتحديد المكوّن"><i class="fas fa-location-crosshairs"></i><span>تحديد</span></button>
          <button type="button" data-component-action="edit" title="تعديل المكوّن"><i class="fas fa-pen"></i><span>تعديل</span></button>
          <button type="button" data-component-action="test" title="اختبار المكوّن"><i class="fas fa-flask"></i><span>اختبار</span></button>
          <button type="button" data-component-action="delete" class="danger" title="حذف المكوّن"><i class="fas fa-trash"></i><span>حذف</span></button>
        </div>
      </article>`;
    }).join('');
    container.innerHTML = `<div class="js-dashboard-title"><i class="fas fa-cubes"></i> المكوّنات التفاعلية (${components.length})</div>${components.length ? `<div class="component-management-list">${rows}</div>` : '<div class="component-management-empty">لا توجد مكوّنات محفوظة بعد.</div>'}`;
    container.querySelectorAll('[data-component-action]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      const row = button.closest('[data-component-id]');
      const component = this.parseComponents().find(item => item.id === row.dataset.componentId);
      if (!component) return;
      const action = button.dataset.componentAction;
      if (action === 'edit') this.openComponentPopup(component);
      else if (action === 'test') { this.openComponentPopup(component); this.tryComponentFromPopup(); }
      else if (action === 'delete') { if (confirm('هل تريد حذف هذا المكوّن نهائيًا؟')) this.deleteVisualLink(component.id); }
      else if (action === 'highlight') {
        const info = this.getComponentManagementInfo(component);
        delete this.hiddenLinkArrows[component.id];
        this.showComponentElement(info.descriptor);
        this.updateVisualLinkArrows();
      }
    }));
  };

  if (legacyRenderVisualLinksDashboard) {
    proto.renderVisualLinksDashboard = function () {
      this.renderComponentsManagementList();
      return legacyRenderVisualLinksDashboard.call(this);
    };
  }

  proto.openComponentPopup = function (component) {
    this.closeVisualLinkPopup({ keepTransient: true });
    this.compCurrentStep = 1;
    this.openVisualLinkPopup(null, component.metadata);
    if (this.activeVisualLink) {
      this.activeVisualLink.existingId = component.id;
    }
  };

  proto.initializeComponentDraft = function (type) {
    if (type === 'modal') {
      this.visualLinkDraft = {
        schemaVersion: 5,
        id: `component-modal-${Date.now()}`,
        builderMode: 'component',
        componentType: 'modal',
        openTriggers: [{ id: '', selector: '' }],
        modalDescriptor: { id: '', selector: '' },
        closeTriggers: [{ id: '', selector: '' }],
        overlayDescriptor: null,
        titleDescriptor: null,
        descriptionDescriptor: null,
        settings: {
          method: 'class', openClass: 'open', closeOnCloseTrigger: true,
          closeOnEscape: true, closeOnOutsideClick: false, closeOnOverlayClick: true, preventCloseInside: true,
          trapFocus: true, restoreFocus: true, lockBodyScroll: true,
          accessibility: true, closeOtherModals: true, openOnLoad: false,
          openDelay: 0, openOnce: false, storageKey: ''
        }
      };
      this.compCurrentStep = 1;
      return;
    }
    if (type === 'dropdown') {
      this.visualLinkDraft = {
        schemaVersion: 6,
        id: `component-dropdown-${Date.now()}`,
        builderMode: 'component',
        componentType: 'dropdown',
        mode: 'manual',
        triggerDescriptor: { id: '', selector: '' },
        menuDescriptor: { id: '', selector: '' },
        itemDescriptors: [],
        wrapperDescriptor: null,
        settings: {
          method: 'class', openClass: 'open', activation: 'click',
          closeOnEscape: true, closeOnOutsideClick: true, closeOnItemClick: true,
          closeOthers: true, restoreFocus: true, focusFirstItemOnOpen: true,
          accessibility: true, openOnLoad: false, closeDelay: 0, openDelay: 0
        }
      };
      this.compCurrentStep = 1;
      return;
    }
    if (type === 'sidebar') {
      this.visualLinkDraft = {
        schemaVersion: 7,
        id: `component-sidebar-${Date.now()}`,
        builderMode: 'component',
        componentType: 'sidebar',
        openTriggers: [{ id: '', selector: '' }],
        sidebarDescriptor: { id: '', selector: '' },
        closeTriggers: [{ id: '', selector: '' }],
        overlayDescriptor: null,
        navItemDescriptors: [],
        titleDescriptor: null,
        settings: {
          method: 'class', openClass: 'open', position: 'left', behavior: 'overlay',
          closeOnEscape: true, closeOnOutsideClick: true, closeOnOverlayClick: true, closeOnItemClick: false,
          closeOthers: true, restoreFocus: true, focusFirstItemOnOpen: true, trapFocus: false,
          lockBodyScroll: true, accessibility: true, openOnLoad: false, openDelay: 0, closeDelay: 0, openOnce: false
        }
      };
      this.compCurrentStep = 1;
      return;
    }
    this.visualLinkDraft = {
      schemaVersion: 4,
      id: `comp-${Date.now()}`,
      builderMode: 'component',
      componentType: type,
      bindingMode: 'manual',
      items: [],
      settings: type === 'accordion' ? {
        event: 'click',
        method: 'class',
        activeClass: 'open',
        allowMultiple: false,
        collapsible: true,
        keyboard: true,
        accessibility: true
      } : {
        buttonActiveClass: 'active',
        panelActiveClass: 'active',
        hideMethod: 'class',
        defaultIndex: 0,
        keyboard: true,
        keyboardActivation: 'automatic',
        accessibility: true
      }
    };
    this.addComponentItemDraft();
    this.compCurrentStep = 1;
  };

  proto.addComponentItemDraft = function () {
    const type = this.visualLinkDraft.componentType;
    if (type === 'modal') return;
    const item = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    if (type === 'accordion') {
      item.triggerId = '';
      item.contentId = '';
      item.initialOpen = false;
    } else {
      item.tabId = '';
      item.panelId = '';
    }
    this.visualLinkDraft.items.push(item);
  };

  proto.renderComponentBuilder = function (holder) {
    const draft = this.visualLinkDraft;
    if (draft.componentType === 'modal') {
      this.renderModalComponentBuilder(holder);
      return;
    }
    if (draft.componentType === 'dropdown') {
      this.renderDropdownComponentBuilder(holder);
      return;
    }
    if (draft.componentType === 'sidebar') {
      this.renderSidebarComponentBuilder(holder);
      return;
    }
    
    if (draft.legacyManual) {
      holder.innerHTML = `
        <section class="e1-step-card">
          <div class="e1-step-question">
            <span style="color: var(--accent-red); margin-inline-end: 10px;"><i class="fas fa-exclamation-triangle"></i></span>
            <div>
              <h3>بيانات المكوّن تالفة (Legacy Manual Mode)</h3>
              <p>يحتوي المكوّن على كود مخصص بدون Metadata صالحة للتعديل البصري.</p>
            </div>
          </div>
          
          <div class="vl-summary" style="margin-top: 15px; border-color: var(--accent-red); text-align: start;">
            <i class="fas fa-triangle-exclamation" style="color: var(--accent-red); margin-inline-end: 5px;"></i>
            <span>تنبيه: التعديل البصري للمكوّن غير متاح حالياً للمحافظة على الكود الخاص بك دون حذفه أو تخريبه.</span>
          </div>
          
          <details class="e1-code-review" style="margin-top: 15px;">
            <summary>تفاصيل تقنية متقدمة: الكود البرمجي للمكوّن</summary>
            <pre class="js-code-preview">${this.renderCodePreview(draft.rawCode || '')}</pre>
          </details>
          
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button type="button" class="btn btn-secondary" data-comp-command="convert-to-visual" style="flex: 1;"><i class="fas fa-wand-magic-sparkles"></i> إعادة بناء بصرية (فرمتة)</button>
            <button type="button" class="btn btn-primary" data-comp-command="save-comp" style="flex: 1;"><i class="fas fa-save"></i> حفظ المكوّن كما هو</button>
          </div>
        </section>
      `;
      // Hide stepper and footer navigation
      const stepper = document.getElementById('e1-stepper');
      if (stepper) stepper.hidden = true;
      document.getElementById('e1-prev').hidden = true;
      document.getElementById('e1-next').hidden = true;
      return;
    }
    
    const isAccordion = draft.componentType === 'accordion';
    const step = this.compCurrentStep;
    
    let html = '';
    if (step === 1) {
      const bindingMode = draft.bindingMode || 'manual';
      const triggersLabel = isAccordion ? 'عنوان / زر التحكم (Trigger)' : 'تبويب / زر التحكم (Tab Button)';
      const contentLabel = isAccordion ? 'لوحة المحتوى (Content)' : 'لوحة التبويب (Tab Panel)';
      
      html += `
        <section class="e1-step-card">
          <div class="e1-step-question">
            <span>1</span>
            <div>
              <h3>اختر عناصر المكوّن</h3>
              <p>حدد عناصر العرض والتحكم للمكوّن الحالي.</p>
            </div>
          </div>
          
          <label class="vl-field-group">
            <span class="vl-field-label">طريقة ربط العناصر</span>
            <select class="js-linker-select comp-binding-mode" data-comp-bind="bindingMode">
              ${opt('manual', 'ربط يدوي (عنصر لكل عنوان)', bindingMode)}
              ${opt('container', 'ربط تلقائي (عبر الحاوية والكلاسات)', bindingMode)}
            </select>
          </label>
      `;
      
      if (bindingMode === 'manual') {
        html += `<div class="comp-manual-items-list" style="margin-top: 15px; display: flex; flex-direction: column; gap: 15px;">`;
        (draft.items || []).forEach((item, index) => {
          const triggerIdVal = isAccordion ? (item.triggerId || '') : (item.tabId || '');
          const contentIdVal = isAccordion ? (item.contentId || '') : (item.panelId || '');
          
          const trigExists = triggerIdVal ? !!document.getElementById(triggerIdVal) : true;
          const contExists = contentIdVal ? !!document.getElementById(contentIdVal) : true;
          const triggerElement = triggerIdVal ? document.getElementById(triggerIdVal) : null;
          const contentElement = contentIdVal ? document.getElementById(contentIdVal) : null;
          
          const triggerWarning = !trigExists ? `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}"><i class="fas fa-exclamation-triangle"></i> العنصر غير موجود<span class="component-legacy-test-marker"> مفقود</span></span>` : '';
          const contentWarning = !contExists ? `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}"><i class="fas fa-exclamation-triangle"></i> العنصر غير موجود<span class="component-legacy-test-marker"> مفقود</span></span>` : '';
          
          html += `
            <div class="comp-manual-item-row" data-item-id="${item.id}" style="padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>العنصر #${index + 1}</strong>
                <div style="display: flex; gap: 5px;">
                  <button type="button" class="vl-mini-btn" data-comp-command="move-item-up" data-item-id="${item.id}" title="تحريك لأعلى" ${index === 0 ? 'disabled' : ''}><i class="fas fa-chevron-up"></i></button>
                  <button type="button" class="vl-mini-btn" data-comp-command="move-item-down" data-item-id="${item.id}" title="تحريك لأسفل" ${index === (draft.items.length - 1) ? 'disabled' : ''}><i class="fas fa-chevron-down"></i></button>
                  <button type="button" class="vl-mini-btn danger" data-comp-command="remove-item" data-item-id="${item.id}" title="حذف" ${draft.items.length <= 1 ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
                </div>
              </div>
              <div class="vl-fields-grid" style="grid-template-columns: 1fr 1fr; gap: 10px;">
                <label class="vl-field-group">
                  <span class="vl-field-label">${triggersLabel} ${triggerWarning}</span>
                  ${triggerElement ? `<code class="component-element-chip">${esc(this.getComponentElementReadableName(triggerElement))}</code>${this.renderComponentSemanticWarning(triggerElement, isAccordion ? 'trigger' : 'tab')}` : ''}
                  <div style="display: flex; gap: 5px;">
                    <input type="text" class="js-linker-input comp-trigger-input" value="${esc(triggerIdVal)}" placeholder="example-trigger-id">
                  </div>
                  <div class="component-element-actions"><button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="comp-${isAccordion ? 'trigger' : 'tab'}" data-item-id="${item.id}"><i class="fas fa-mouse-pointer"></i> ${triggerElement ? 'تغيير العنصر' : 'اختيار من الصفحة'}</button>${triggerElement ? `<button type="button" class="btn btn-secondary" data-comp-command="show-element" data-element-id="${esc(triggerIdVal)}"><i class="fas fa-location-crosshairs"></i> إظهار العنصر في الصفحة</button>` : ''}</div>
                </label>
                <label class="vl-field-group">
                  <span class="vl-field-label">${contentLabel} ${contentWarning}</span>
                  ${contentElement ? `<code class="component-element-chip">${esc(this.getComponentElementReadableName(contentElement))}</code>` : ''}
                  <div style="display: flex; gap: 5px;">
                    <input type="text" class="js-linker-input comp-content-input" value="${esc(contentIdVal)}" placeholder="example-panel-id">
                  </div>
                  <div class="component-element-actions"><button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="comp-${isAccordion ? 'content' : 'panel'}" data-item-id="${item.id}"><i class="fas fa-mouse-pointer"></i> ${contentElement ? 'تغيير العنصر' : 'اختيار من الصفحة'}</button>${contentElement ? `<button type="button" class="btn btn-secondary" data-comp-command="show-element" data-element-id="${esc(contentIdVal)}"><i class="fas fa-location-crosshairs"></i> إظهار العنصر في الصفحة</button>` : ''}</div>
                </label>
              </div>
            </div>
          `;
        });
        html += `
            <button type="button" class="btn btn-secondary" data-comp-command="add-item" style="align-self: flex-start; margin-top: 5px;"><i class="fas fa-plus"></i> إضافة عنصر جديد</button>
          </div>
        `;
      } else {
        const containerId = draft.containerId || '';
        const triggerSelector = draft.triggerSelector || (isAccordion ? '.accordion-title' : '.tab-button');
        const panelSelector = draft.panelSelector || (isAccordion ? '.accordion-content' : '.tab-panel');
        const matchingMethod = draft.matchingMethod || 'index';
        
        const containerExists = containerId ? !!document.getElementById(containerId) : true;
        const containerWarning = !containerExists ? `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}"><i class="fas fa-exclamation-triangle"></i> العنصر غير موجود</span>` : '';
        
        let countPreview = 'لم يتم تحديد حاوية صالحة بعد.';
        if (containerId && containerExists) {
          const containerEl = document.getElementById(containerId);
          let trigCount = 0, panelCount = 0, selectorError = '';
          try {
            trigCount = containerEl.querySelectorAll(triggerSelector).length;
          } catch (e) {
            selectorError = COMPONENT_BEGINNER_ERRORS.invalidSelector;
          }
          try {
            panelCount = containerEl.querySelectorAll(panelSelector).length;
          } catch (e) {
            selectorError += (selectorError ? '<br>' : '') + COMPONENT_BEGINNER_ERRORS.invalidSelector;
          }
          if (selectorError) {
            countPreview = `<span style="color: var(--accent-red);"><i class="fas fa-exclamation-triangle"></i> ${selectorError}</span>`;
          } else {
            countPreview = `تم العثور على <b>${trigCount} Triggers</b> و <b>${panelCount} Panels</b> داخل الحاوية.`;
            if (trigCount !== panelCount && matchingMethod === 'index') {
              countPreview += ` <span style="color: var(--accent-red); display: block; margin-top: 5px;"><i class="fas fa-exclamation-triangle"></i> ${COMPONENT_BEGINNER_ERRORS.countMismatch}</span>`;
            }
          }
        }
        
        html += `
          <div class="vl-fields-grid" style="grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
            <label class="vl-field-group vl-span-2">
              <span class="vl-field-label">معرّف الحاوية (ID) ${containerWarning}</span>
              <div style="display: flex; gap: 5px;">
                <input type="text" class="js-linker-input comp-container-id" value="${esc(containerId)}" placeholder="accordion-wrapper">
                <button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="comp-container-id"><i class="fas fa-mouse-pointer"></i> اختيار من الصفحة</button>
              </div>
            </label>
            <label class="vl-field-group">
              <span class="vl-field-label">Selector للـ Triggers</span>
              <input type="text" class="js-linker-input comp-trigger-selector" value="${esc(triggerSelector)}" placeholder=".accordion-title">
            </label>
            <label class="vl-field-group">
              <span class="vl-field-label">Selector للـ Panels / Contents</span>
              <input type="text" class="js-linker-input comp-panel-selector" value="${esc(panelSelector)}" placeholder=".accordion-content">
            </label>
            <label class="vl-field-group vl-span-2">
              <span class="vl-field-label">طريقة الربط الداخلي للمطابقة</span>
              <select class="js-linker-select comp-matching-method">
                ${opt('index', 'حسب الترتيب (Index)', matchingMethod)}
                ${opt('data', 'حسب سمات البيانات (data-tab و data-panel)', matchingMethod)}
              </select>
            </label>
          </div>
          <div class="vl-summary" style="margin-top: 15px;"><i class="fas fa-magnifying-glass"></i><span>${countPreview}</span></div>
        `;
      }
      
      html += `</section>`;
      
    } else if (step === 2) {
      html += `
        <section class="e1-step-card">
          <div class="e1-step-question">
            <span>2</span>
            <div>
              <h3>اضبط سلوك المكوّن</h3>
              <p>اضبط خيارات الفتح والإغلاق وإمكانيات الكيبورد والوصول.</p>
            </div>
          </div>
          <div class="vl-fields-grid" style="grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
      `;
      
      const settings = draft.settings || {};
      
      if (isAccordion) {
        const eventVal = settings.event || 'click';
        const methodVal = settings.method || 'class';
        const activeClassVal = settings.activeClass || 'open';
        const allowMultipleVal = !!settings.allowMultiple;
        const collapsibleVal = settings.collapsible !== false;
        const keyboardVal = !!settings.keyboard;
        const accessibilityVal = settings.accessibility !== false;
        
        html += `
          <label class="vl-field-group">
            <span class="vl-field-label">الحدث المشغل (Event)</span>
            <select class="js-linker-select comp-setting-event">
              ${opt('click', 'عند النقر (Click)', eventVal)}
              ${opt('mouseenter', 'عند حث الماوس (Hover)', eventVal)}
            </select>
          </label>
          <label class="vl-field-group">
            <span class="vl-field-label">طريقة العرض والتأثير</span>
            <select class="js-linker-select comp-setting-method">
              ${opt('class', 'تبديل كلاس النشاط (Active Class)', methodVal)}
              ${opt('hidden', 'تبديل خاصية hidden', methodVal)}
              ${opt('display', 'تبديل display: none/block', methodVal)}
              ${opt('max-height', 'تأثير إغلاق تدريجي (Max-Height)', methodVal)}
            </select>
          </label>
          <label class="vl-field-group">
            <span class="vl-field-label">اسم الـ Active Class</span>
            <input type="text" class="js-linker-input comp-setting-active-class" value="${esc(activeClassVal)}" placeholder="open">
          </label>
          
          <div class="vl-span-2" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
            <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" class="comp-setting-allow-multiple" ${allowMultipleVal ? 'checked' : ''}>
              <span>السماح بفتح أكثر من جزء نشط في نفس الوقت (Allow Multiple Active)</span>
            </label>
            <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" class="comp-setting-collapsible" ${collapsibleVal ? 'checked' : ''}>
              <span>السماح بإغلاق كافة الأجزاء بالكامل (Collapsible)</span>
            </label>
            <details class="e1-code-review component-accessibility-advanced" style="margin-top:4px;"><summary>إعدادات متقدمة: الوصول ولوحة المفاتيح</summary><div style="display:grid;gap:8px;margin-top:10px;">
              <label class="vl-checkbox-row"><input type="checkbox" class="comp-setting-keyboard" ${keyboardVal ? 'checked' : ''}><span>تفعيل التنقل ولوحة المفاتيح (Enter وSpace)</span></label>
              <label class="vl-checkbox-row"><input type="checkbox" class="comp-setting-accessibility" ${accessibilityVal ? 'checked' : ''}><span>تحسينات الوصول التلقائي (aria-expanded وaria-hidden)</span></label>
            </div></details>
          </div>
        `;
        if (methodVal === 'max-height') {
          html += `<div class="vl-summary vl-span-2" style="margin-top: 10px;"><i class="fas fa-info-circle"></i><span>تنبيه: يجب إضافة كود CSS transition على عنصر المحتوى في مشروعك لتحقيق حركة ناعمة.</span></div>`;
        }
      } else {
        const btnClass = settings.buttonActiveClass || 'active';
        const panelClass = settings.panelActiveClass || 'active';
        const hideMethod = settings.hideMethod || 'class';
        const keyboardVal = !!settings.keyboard;
        const keyboardActivation = settings.keyboardActivation || 'automatic';
        const accessibilityVal = settings.accessibility !== false;
        
        const tabListIdVal = draft.tabListId || '';
        const panelsContainerIdVal = draft.panelsContainerId || '';
        
        const tabListExists = tabListIdVal ? !!document.getElementById(tabListIdVal) : true;
        const panelsContExists = panelsContainerIdVal ? !!document.getElementById(panelsContainerIdVal) : true;
        
        const tabListWarning = !tabListExists ? `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}"><i class="fas fa-exclamation-triangle"></i> العنصر غير موجود</span>` : '';
        const panelsContWarning = !panelsContExists ? `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}"><i class="fas fa-exclamation-triangle"></i> العنصر غير موجود</span>` : '';
        
        html += `
          <label class="vl-field-group">
            <span class="vl-field-label">كلاس التبويب النشط (Tab Button Class)</span>
            <input type="text" class="js-linker-input comp-setting-button-class" value="${esc(btnClass)}" placeholder="active">
          </label>
          <label class="vl-field-group">
            <span class="vl-field-label">كلاس اللوحة النشطة (Panel Class)</span>
            <input type="text" class="js-linker-input comp-setting-panel-class" value="${esc(panelClass)}" placeholder="active">
          </label>
          <label class="vl-field-group">
            <span class="vl-field-label">طريقة إخفاء التبويبات غير النشطة</span>
            <select class="js-linker-select comp-setting-hide-method">
              ${opt('class', 'تبديل الكلاس النشط (Toggle Panel Class)', hideMethod)}
              ${opt('hidden', 'خاصية hidden', hideMethod)}
              ${opt('display', 'خاصية display: none', hideMethod)}
            </select>
          </label>
          <label class="vl-field-group">
            <span class="vl-field-label">حاوية الـ Tab List (ID اختياري) ${tabListWarning}</span>
            <div style="display: flex; gap: 5px;">
              <input type="text" class="js-linker-input comp-tablist-id" value="${esc(tabListIdVal)}" placeholder="tab-list-wrapper">
              <button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="comp-tablist"><i class="fas fa-mouse-pointer"></i> اختيار من الصفحة</button>
            </div>
          </label>
          <label class="vl-field-group vl-span-2">
            <span class="vl-field-label">حاوية الـ Panels (ID اختياري) ${panelsContWarning}</span>
            <div style="display: flex; gap: 5px;">
              <input type="text" class="js-linker-input comp-panels-container-id" value="${esc(panelsContainerIdVal)}" placeholder="panels-wrapper">
              <button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="comp-panels-container"><i class="fas fa-mouse-pointer"></i> اختيار من الصفحة</button>
            </div>
          </label>
          
          <details class="e1-code-review component-accessibility-advanced vl-span-2" style="margin-top:10px;"><summary>إعدادات متقدمة: الوصول ولوحة المفاتيح</summary><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
            <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" class="comp-setting-keyboard" ${keyboardVal ? 'checked' : ''}>
              <span>تفعيل التنقل بالكيبورد (الأسهم، Home، End، Enter)</span>
            </label>
            <label class="vl-field-group comp-keyboard-activation-group" style="margin-top: 5px; margin-inline-start: 22px;" ${!keyboardVal ? 'hidden' : ''}>
              <span class="vl-field-label">طريقة تنشيط التبويب عبر الكيبورد</span>
              <select class="js-linker-select comp-setting-keyboard-activation">
                ${opt('automatic', 'تنشيط تلقائي (بمجرد التركيز بالأسهم - Recommended)', keyboardActivation)}
                ${opt('manual', 'تنشيط يدوي (عند الضغط على Enter أو Space)', keyboardActivation)}
              </select>
            </label>
            <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" class="comp-setting-accessibility" ${accessibilityVal ? 'checked' : ''}>
              <span>تفعيل ARIA Roles & Attributes (role="tablist" و role="tab" و role="tabpanel")</span>
            </label>
          </div></details>
        `;
      }
      
      html += `
          </div>
        </section>
      `;
      
    } else if (step === 3) {
      html += `
        <section class="e1-step-card">
          <div class="e1-step-question">
            <span>3</span>
            <div>
              <h3>الحالة الافتراضية للمكوّن</h3>
              <p>حدد أي التبويبات أو العناصر تكون مفتوحة/نشطة افتراضيًا عند تحميل الصفحة.</p>
            </div>
          </div>
          <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
      `;
      
      const settings = draft.settings || {};
      
      if (isAccordion) {
        const allowMultipleVal = !!settings.allowMultiple;
        
        (draft.items || []).forEach((item, idx) => {
          const triggerLabel = item.triggerId || `Item ${idx + 1}`;
          if (allowMultipleVal) {
            html += `
              <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 4px;">
                <input type="checkbox" class="comp-default-open-checkbox" data-index="${idx}" ${item.initialOpen ? 'checked' : ''}>
                <span>العنصر #${idx + 1} (${esc(this.getVisualElementLabel(triggerLabel))}) مفتوح افتراضيًا</span>
              </label>
            `;
          } else {
            html += `
              <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 4px;">
                <input type="radio" name="comp-default-open-radio" class="comp-default-open-radio" data-index="${idx}" ${item.initialOpen ? 'checked' : ''}>
                <span>العنصر #${idx + 1} (${esc(this.getVisualElementLabel(triggerLabel))}) مفتوح افتراضيًا</span>
              </label>
            `;
          }
        });
        
        if (!allowMultipleVal) {
          const noneOpen = !(draft.items || []).some(it => it.initialOpen);
          html += `
            <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 4px;">
              <input type="radio" name="comp-default-open-radio" class="comp-default-open-radio" data-index="-1" ${noneOpen ? 'checked' : ''}>
              <span>إغلاق الكل افتراضيًا</span>
            </label>
          `;
        }
      } else {
        const defaultIndexVal = Number(settings.defaultIndex) || 0;
        (draft.items || []).forEach((item, idx) => {
          const tabLabel = item.tabId || `Tab ${idx + 1}`;
          html += `
            <label class="vl-checkbox-row" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border: 1px solid var(--border-color); border-radius: 4px;">
              <input type="radio" name="comp-default-tab-radio" class="comp-default-tab-radio" data-index="${idx}" ${idx === defaultIndexVal ? 'checked' : ''}>
              <span>التبويب #${idx + 1} (${esc(this.getVisualElementLabel(tabLabel))}) نشط افتراضيًا</span>
            </label>
          `;
        });
      }
      
      html += `
          </div>
        </section>
      `;
      
    } else if (step === 4) {
      const bindingModeStr = draft.bindingMode === 'container' ? 'تلقائي (عبر الحاوية والكلاسات)' : 'يدوي (عنصر لكل جزء)';
      const itemsCount = (draft.items || []).length;
      const beginnerSummary = isAccordion
        ? 'عند الضغط على السؤال، سيتم فتح الإجابة المرتبطة به.'
        : 'عند الضغط على تبويب، سيتم إظهار المحتوى الخاص به وإخفاء باقي المحتويات.';
      let reviewCode = '';
      try { reviewCode = core.generateComponentBlock({ id: draft.id, componentType: draft.componentType, metadata: draft }); }
      catch (error) { reviewCode = 'فشل توليد كود المعاينة: ' + error.message; }
      
      let summaryDetails = '';
      if (draft.bindingMode === 'container') {
        summaryDetails = `
          <p><b>حاوية المكوّن:</b> #${esc(draft.containerId || 'غير محدد')}</p>
          <p><b>Selector للـ Triggers:</b> <code>${esc(draft.triggerSelector)}</code></p>
          <p><b>Selector للـ Panels:</b> <code>${esc(draft.panelSelector)}</code></p>
        `;
      } else {
        summaryDetails = `
          <p><b>عدد أزواج العناصر:</b> ${itemsCount} عناصر</p>
          <div style="font-size: 10px; max-height: 120px; overflow-y: auto; border: 1px solid var(--border-color); padding: 5px; border-radius: 4px; background: rgba(0,0,0,0.1);">
            ${(draft.items || []).map((it, idx) => `<div style="padding: 2px 0;"><b>العنصر ${idx + 1}:</b> Trigger: #${esc(it.triggerId || it.tabId || 'مفقود')} → Content: #${esc(it.contentId || it.panelId || 'مفقود')}</div>`).join('')}
          </div>
        `;
      }
      
      html += `
        <section class="e1-step-card">
          <div class="e1-step-question">
            <span>4</span>
            <div>
              <h3>مراجعة تفاصيل المكوّن</h3>
              <p>راجع الهيكل والربط بالعربية قبل المتابعة.</p>
            </div>
          </div>
          <div class="vl-summary component-beginner-summary"><i class="fas fa-circle-check"></i><span>${beginnerSummary}</span></div>
          <details class="e1-code-review component-advanced-review" style="margin-top: 12px;">
            <summary>تفاصيل تقنية متقدمة</summary>
            <div class="component-technical-summary">
              <p><b>نوع المكوّن:</b> ${isAccordion ? 'Accordion' : 'Tabs'}</p>
              <p><b>طريقة الربط:</b> ${bindingModeStr}</p>
              ${summaryDetails}
              <p><b>التنقل بالكيبورد:</b> ${draft.settings.keyboard ? 'مفعّل' : 'معطّل'}</p>
              <p><b>دعم سهولة الوصول:</b> ${draft.settings.accessibility ? 'مفعّل' : 'معطّل'}</p>
            </div>
            <details class="e1-code-review component-code-preview"><summary>Advanced Code Preview</summary><pre class="js-code-preview" id="comp-code-preview">${this.renderCodePreview(reviewCode)}</pre></details>
          </details>
        </section>
      `;
      
    } else if (step === 5) {
      html += `
        <section class="e1-step-card">
          <div class="e1-step-question">
            <span>5</span>
            <div>
              <h3>جرّب واحفظ المكوّن</h3>
              <p>جرّب المكوّن في بيئة معزولة، ثم احفظه في مشروعك. توجد المعاينة التقنية في خطوة المراجعة السابقة.</p>
            </div>
          </div>
          
          <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; gap: 10px;">
              <button type="button" class="btn btn-secondary" data-comp-command="try-comp" style="flex: 1; height: 36px;"><i class="fas fa-play"></i> جرّب الآن (Try Now)</button>
              <button type="button" class="btn btn-primary" data-comp-command="save-comp" style="flex: 1; height: 36px;"><i class="fas fa-save"></i> حفظ المكوّن التفاعلي</button>
            </div>
            
          </div>
        </section>
      `;
    }
    
    holder.innerHTML = html;
    
    if (step === 2) {
      const keyboardCh = holder.querySelector('.comp-setting-keyboard');
      const activationGroup = holder.querySelector('.comp-keyboard-activation-group');
      if (keyboardCh && activationGroup) {
        keyboardCh.addEventListener('change', () => {
          activationGroup.hidden = !keyboardCh.checked;
        });
      }
    }
  };

  proto.modalDescriptorValue = function (descriptor) {
    if (!descriptor) return '';
    if (descriptor.id) return `#${descriptor.id}`;
    return descriptor.selector || '';
  };

  proto.resolveModalDescriptor = function (descriptor, many) {
    if (!descriptor) return many ? [] : null;
    if (descriptor.id) {
      const element = document.getElementById(descriptor.id);
      return many ? (element ? [element] : []) : element;
    }
    if (!descriptor.selector) return many ? [] : null;
    try {
      return many ? Array.from(document.querySelectorAll(descriptor.selector)) : document.querySelector(descriptor.selector);
    } catch (error) {
      return many ? [] : null;
    }
  };

  proto.parseModalDescriptorValue = function (rawValue, selectedId) {
    if (selectedId) return { id: selectedId, selector: '' };
    const value = String(rawValue || '').trim();
    if (!value) return null;
    if (value[0] === '#' && document.getElementById(value.slice(1))) return { id: value.slice(1), selector: '' };
    if (document.getElementById(value)) return { id: value, selector: '' };
    return { id: '', selector: value };
  };

  proto.getComponentElementReadableName = function (element) {
    if (!element) return '';
    const tag = String(element.tagName || 'element').toLowerCase();
    if (element.id) return `${tag}#${element.id}`;
    const classes = Array.from(element.classList || []).slice(0, 2);
    return classes.length ? `${tag}.${classes.join('.')}` : tag;
  };

  proto.renderComponentSemanticWarning = function (element, role) {
    if (!element) return '';
    const interactiveRoles = ['trigger', 'tab', 'open', 'close'];
    const structuralRoles = {
      modal: ['DIALOG', 'DIV', 'SECTION', 'ASIDE'],
      menu: ['DIV', 'UL', 'OL', 'NAV'],
      sidebar: ['ASIDE', 'NAV', 'DIV', 'SECTION']
    };
    const tag = element.tagName;
    const unsuitableInteractive = interactiveRoles.includes(role) && !['BUTTON', 'A', 'INPUT', 'SUMMARY'].includes(tag);
    const unsuitableStructural = structuralRoles[role] && !structuralRoles[role].includes(tag);
    return unsuitableInteractive || unsuitableStructural
      ? '<span class="component-semantic-warning"><i class="fas fa-triangle-exclamation"></i> هذا العنصر غير معتاد لهذا الدور، لكن يمكنك الاستمرار أو اختيار عنصر أنسب.</span>'
      : '';
  };

  proto.showComponentElement = function (descriptor) {
    const element = this.resolveModalDescriptor(descriptor, false);
    if (!element) {
      this.showToastNotice(COMPONENT_BEGINNER_ERRORS.missingElement);
      return;
    }
    if (this.app && typeof this.app.selectElement === 'function') this.app.selectElement(element);
    if (typeof element.scrollIntoView === 'function') element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  proto.renderDropdownDescriptorField = function (label, descriptor, role, index, optional) {
    const value = this.modalDescriptorValue(descriptor);
    const resolved = this.resolveModalDescriptor(descriptor, false);
    const status = value ? (resolved ? '<span class="vl-badge success">تم الاختيار</span>' : `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}">العنصر غير موجود<span class="component-legacy-test-marker"> Missing</span></span>`) : (optional ? '<span class="vl-badge">اختياري</span>' : '<span class="vl-badge danger">مطلوب</span>');
    const options = Array.from(this.app.canvas.querySelectorAll('[id]')).map(element => `<option value="${esc(element.id)}" ${descriptor && descriptor.id === element.id ? 'selected' : ''}>${esc(element.tagName.toLowerCase())}#${esc(element.id)}</option>`).join('');
    const indexAttr = index === undefined || index === null ? '' : ` data-dropdown-index="${index}"`;
    const readable = resolved ? this.getComponentElementReadableName(resolved) : '';
    const showButton = resolved ? `<button type="button" class="btn btn-secondary" data-comp-command="show-element" data-element-id="${esc(descriptor && descriptor.id || '')}" data-element-selector="${esc(descriptor && descriptor.selector || '')}"><i class="fas fa-location-crosshairs"></i> إظهار العنصر في الصفحة</button>` : '';
    return `<label class="vl-field-group dropdown-descriptor-field" data-dropdown-role="${role}"${indexAttr}>
      <span class="vl-field-label">${label} ${status}</span>
      ${readable ? `<code class="component-element-chip">${esc(readable)}</code>${this.renderComponentSemanticWarning(resolved, role)}` : ''}
      <div class="component-element-select-row">
        <select class="js-linker-select dropdown-descriptor-select"><option value="">اختر من قائمة العناصر</option>${options}</select>
        <button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="dropdown-${role}" data-item-id="${index === undefined || index === null ? '' : index}"><i class="fas fa-mouse-pointer"></i> ${resolved ? 'تغيير العنصر' : 'اختيار من الصفحة'}</button>
      </div>
      <input class="js-linker-input dropdown-descriptor-input" value="${esc(value)}" placeholder="#element-id أو selector يدوي">
      ${showButton}
    </label>`;
  };

  proto.renderDropdownComponentBuilder = function (holder) {
    const draft = this.visualLinkDraft;
    const step = this.compCurrentStep;
    const settings = draft.settings || {};
    const checked = value => value ? 'checked' : '';
    let html = '';

    if (step === 1) {
      const mode = draft.mode || 'manual';
      const isManual = mode === 'manual';
      const detectedCount = mode === 'container' ? this.resolveModalDescriptorList(draft.itemDescriptors).length : 0;
      
      let elementsHtml = '';
      if (isManual) {
        const itemRows = (draft.itemDescriptors || []).map((descriptor, index) => 
          `<div class="dropdown-multi-row" data-dropdown-kind="item" data-dropdown-index="${index}">
            ${this.renderDropdownDescriptorField(`عنصر القائمة ${index + 1}`, descriptor, 'item', index, true)}
            <button class="vl-mini-btn danger" type="button" data-comp-command="dropdown-remove-item" data-item-id="${index}"><i class="fas fa-trash"></i></button>
          </div>`
        ).join('');

        elementsHtml = `
          <div class="vl-fields-grid">
            ${this.renderDropdownDescriptorField('زر / عنصر التحكم (Trigger)', draft.triggerDescriptor, 'trigger', null, false)}
            ${this.renderDropdownDescriptorField('عنصر القائمة (Menu)', draft.menuDescriptor, 'menu', null, false)}
          </div>
          <h4 style="margin-top:14px;">عناصر القائمة (Menu Items) <span class="vl-badge">اختياري</span></h4>
          <div class="dropdown-item-list">${itemRows}</div>
          <button type="button" class="btn btn-secondary" style="margin-top:8px;" data-comp-command="dropdown-add-item"><i class="fas fa-plus"></i> إضافة عنصر قائمة</button>
          <h4 style="margin-top:14px;">الحاوية الخارجية (Wrapper) <span class="vl-badge">اختياري</span></h4>
          <div class="vl-fields-grid">
            ${this.renderDropdownDescriptorField('الحاوية الخارجية', draft.wrapperDescriptor, 'wrapper', null, true)}
          </div>
        `;
      } else {
        elementsHtml = `
          <div class="vl-fields-grid">
            ${this.renderDropdownDescriptorField('الحاوية الخارجية (Wrapper)', draft.wrapperDescriptor, 'wrapper', null, false)}
          </div>
          <div class="vl-fields-grid" style="margin-top:12px;">
            <label class="vl-field-group">
              <span class="vl-field-label">Selector لزر التحكم (Trigger Selector) <span class="vl-badge danger">مطلوب</span></span>
              <input class="js-linker-input dropdown-container-trigger-selector" value="${esc(draft.triggerDescriptor && draft.triggerDescriptor.selector || '')}" placeholder="مثال: button.dropdown-toggle">
            </label>
            <label class="vl-field-group">
              <span class="vl-field-label">Selector للقائمة (Menu Selector) <span class="vl-badge danger">مطلوب</span></span>
              <input class="js-linker-input dropdown-container-menu-selector" value="${esc(draft.menuDescriptor && draft.menuDescriptor.selector || '')}" placeholder="مثال: ul.dropdown-menu">
            </label>
          </div>
          <div class="vl-fields-grid" style="margin-top:12px;">
            <label class="vl-field-group">
              <span class="vl-field-label">Selector لعناصر القائمة (Items Selector) <span class="vl-badge">اختياري</span></span>
              <input class="js-linker-input dropdown-container-items-selector" value="${esc(draft.itemDescriptors && draft.itemDescriptors[0] && draft.itemDescriptors[0].selector || '')}" placeholder="مثال: li > a">
            </label>
          </div>
          <div class="vl-summary" style="margin-top:15px; text-align:start;">
            <i class="fas fa-circle-info" style="color:var(--accent-blue); margin-inline-end:5px;"></i>
            <span>العناصر المكتشفة حالياً: <strong>${detectedCount} عناصر</strong></span>
          </div>
        `;
      }

      html = `
        <section class="e1-step-card dropdown-builder-step" data-dropdown-step="elements">
          <div class="e1-step-question">
            <span>1</span>
            <div>
              <h3>اختر عناصر الـ Dropdown</h3>
              <p>حدد أسلوب الاختيار وعنصر التحكم والقائمة المنسدلة.</p>
            </div>
          </div>
          <div style="display:flex; gap:10px; margin-bottom:15px;">
            <button type="button" class="btn ${isManual ? 'btn-primary' : 'btn-secondary'}" style="flex:1;" data-dropdown-mode="manual"><i class="fas fa-hand-pointer"></i> أسلوب يدوي (Manual)</button>
            <button type="button" class="btn ${!isManual ? 'btn-primary' : 'btn-secondary'}" style="flex:1;" data-dropdown-mode="container"><i class="fas fa-box-open"></i> أسلوب الحاوية (Container)</button>
          </div>
          ${elementsHtml}
        </section>
      `;
    } else if (step === 2) {
      html = `
        <section class="e1-step-card dropdown-builder-step" data-dropdown-step="behavior">
          <div class="e1-step-question">
            <span>2</span>
            <div>
              <h3>اضبط سلوك الفتح والإغلاق</h3>
              <p>حدد طريقة عرض القائمة وطريقة التفعيل وشروط إغلاقها.</p>
            </div>
          </div>
          <div class="vl-fields-grid">
            <label class="vl-field-group"><span class="vl-field-label">طريقة الفتح وإخفاء القائمة</span><select class="js-linker-select dropdown-setting-method">${opt('class','class',settings.method)}${opt('hidden','hidden',settings.method)}${opt('display','display',settings.method)}</select></label>
            <label class="vl-field-group"><span class="vl-field-label">Class الفتح (Active Class)</span><input class="js-linker-input dropdown-setting-open-class" value="${esc(settings.openClass || 'open')}"></label>
          </div>
          <div class="vl-fields-grid" style="margin-top:10px;">
            <label class="vl-field-group"><span class="vl-field-label">طريقة التفعيل (Activation)</span><select class="js-linker-select dropdown-setting-activation">${opt('click','click',settings.activation)}${opt('hover','hover',settings.activation)}${opt('focus','focus',settings.activation)}</select></label>
          </div>
          <div class="dropdown-setting-checks" style="display:grid;gap:8px;margin-top:12px;">
            <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-escape" ${checked(settings.closeOnEscape !== false)}> إغلاق عند الضغط على مفتاح Escape</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-outside" ${checked(settings.closeOnOutsideClick !== false)}> إغلاق عند الضغط خارج القائمة</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-item-click" ${checked(!!settings.closeOnItemClick)}> إغلاق عند الضغط على عنصر داخل القائمة</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-close-others" ${checked(settings.closeOthers !== false)}> إغلاق القوائم الأخرى عند فتح هذه القائمة</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-restore-focus" ${checked(settings.restoreFocus !== false)}> إعادة التركيز إلى زر التحكم بعد الإغلاق</label>
          </div>
          <details class="e1-code-review dropdown-advanced-settings" style="margin-top:14px;">
            <summary>الإعدادات المتقدمة</summary>
            <div style="display:grid;gap:8px;margin-top:10px;">
              <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-open-load" ${checked(!!settings.openOnLoad)}> فتح القائمة تلقائياً عند تحميل الصفحة</label>
              <label class="vl-field-group"><span class="vl-field-label">تأخير الفتح عند الـ Hover (ms)</span><input type="number" min="0" class="js-linker-input dropdown-setting-open-delay" value="${Number(settings.openDelay) || 0}"></label>
              <label class="vl-field-group"><span class="vl-field-label">تأخير الإغلاق عند خروج الماوس (ms)</span><input type="number" min="0" class="js-linker-input dropdown-setting-close-delay" value="${Number(settings.closeDelay) || 0}"></label>
            </div>
          </details>
        </section>
      `;
    } else if (step === 3) {
      const triggerElement = this.resolveModalDescriptor(draft.triggerDescriptor, false);
      const isNotButton = triggerElement && triggerElement.tagName !== 'BUTTON';
      const warningHtml = isNotButton ? `
        <div class="vl-summary" style="border-color:var(--accent-orange); text-align:start; margin-bottom:12px;">
          <i class="fas fa-triangle-exclamation" style="color:var(--accent-orange); margin-inline-end:5px;"></i>
          <span>تحذير: عنصر التحكم المختار ليس Button. سيتم تطبيق دور role="button" و tabindex="0" عليه تلقائياً لتحسين الوصول.</span>
        </div>
      ` : '';

      html = `
        <section class="e1-step-card dropdown-builder-step" data-dropdown-step="accessibility">
          <div class="e1-step-question">
            <span>3</span>
            <div>
              <h3>إمكانية الوصول وتجربة المستخدم</h3>
              <p>إعدادات ARIA وتجربة التنقل بلوحة المفاتيح مفعلة افتراضياً.</p>
            </div>
          </div>
          ${warningHtml}
          <div class="vl-summary"><i class="fas fa-universal-access"></i><span>دعم لوحة المفاتيح والوصول مفعّل افتراضيًا.</span></div>
          <details class="e1-code-review dropdown-accessibility-advanced" style="margin-top:14px;"><summary>إعدادات متقدمة: الوصول ولوحة المفاتيح</summary><div style="display:grid;gap:9px;margin-top:10px;">
            <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-accessibility" ${checked(settings.accessibility !== false)}> تطبيق سمات الوصول (ARIA roles, states & attributes)</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="dropdown-setting-focus-first" ${checked(settings.focusFirstItemOnOpen !== false)}> نقل التركيز البصري (Focus) لأول عنصر عند الفتح</label>
          </div></details>
          <details class="e1-code-review" style="margin-top:14px;">
            <summary>تنسيق CSS وظيفي مقترح (يمكنك إضافته لملف الستايل الخاص بك)</summary>
            <pre>.dropdown-menu[hidden] { display: none; }\n.dropdown-menu.open { display: block; }</pre>
          </details>
        </section>
      `;
    } else if (step === 4) {
      const isManual = draft.mode !== 'container';
      const triggerName = this.modalDescriptorValue(draft.triggerDescriptor) || (draft.triggerDescriptor && draft.triggerDescriptor.selector) || 'غير محدد';
      const menuName = this.modalDescriptorValue(draft.menuDescriptor) || (draft.menuDescriptor && draft.menuDescriptor.selector) || 'غير محدد';
      const itemsCount = isManual ? (draft.itemDescriptors || []).length : this.resolveModalDescriptorList(draft.itemDescriptors).length;
      
      html = `
        <section class="e1-step-card dropdown-builder-step" data-dropdown-step="review">
          <div class="e1-step-question">
            <span>4</span>
            <div>
              <h3>راجع سلوك القائمة</h3>
              <p>ملخص واضح أولًا، والتفاصيل التقنية اختيارية.</p>
            </div>
          </div>
          <div class="vl-summary component-beginner-summary"><i class="fas fa-circle-check"></i><span>عند الضغط على الزر، ستظهر قائمة صغيرة مرتبطة به.</span></div>
          <details class="e1-code-review component-advanced-review"><summary>تفاصيل تقنية متقدمة</summary><div class="component-technical-summary"><p>زر التحكم: <strong>${esc(triggerName)}</strong></p><p>قائمة الخيارات: <strong>${esc(menuName)}</strong></p><p>عدد العناصر: <strong>${itemsCount}</strong></p></div><details class="e1-code-review component-code-preview"><summary>Advanced Code Preview</summary><pre class="js-code-preview">${this.renderCodePreview(core.generateComponentBlock({ id: draft.id, componentType: 'dropdown', metadata: draft }))}</pre></details></details>
        </section>
      `;
    } else {
      html = `
        <section class="e1-step-card dropdown-builder-step" data-dropdown-step="save">
          <div class="e1-step-question">
            <span>5</span>
            <div>
              <h3>جرّب واحفظ المكوّن</h3>
              <p>زر Try Now يفتح نافذة معزولة تماماً لاختبار التفاعل بدون التأثير على الصفحة الحالية.</p>
            </div>
          </div>
          <div style="display:flex;gap:10px;">
            <button type="button" class="btn btn-secondary" data-comp-command="try-comp"><i class="fas fa-flask"></i> تجربة التفاعل (Try Now)</button>
            <button type="button" class="btn btn-primary" data-comp-command="save-comp"><i class="fas fa-save"></i> حفظ الـ Dropdown</button>
          </div>
        </section>
      `;
    }

    holder.innerHTML = html;

    holder.querySelectorAll('[data-dropdown-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.syncDropdownComponentDraftFromUI();
        draft.mode = btn.dataset.dropdownMode;
        if (draft.mode === 'container') {
          draft.wrapperDescriptor = draft.wrapperDescriptor || { id: '', selector: '' };
          draft.triggerDescriptor = draft.triggerDescriptor || { id: '', selector: 'button.dropdown-toggle' };
          draft.menuDescriptor = draft.menuDescriptor || { id: '', selector: 'ul.dropdown-menu' };
          draft.itemDescriptors = [{ id: '', selector: 'a,button' }];
        } else {
          draft.wrapperDescriptor = null;
          draft.triggerDescriptor = { id: '', selector: '' };
          draft.menuDescriptor = { id: '', selector: '' };
          draft.itemDescriptors = [];
        }
        this.renderE1Builder();
      });
    });
  };

  proto.syncDropdownComponentDraftFromUI = function () {
    const draft = this.visualLinkDraft;
    const holder = document.getElementById('e1-content');
    if (!holder || !draft || draft.componentType !== 'dropdown') return;
    const mode = draft.mode || 'manual';
    const isManual = mode === 'manual';

    const readField = field => field ? this.parseModalDescriptorValue((field.querySelector('.dropdown-descriptor-input') || {}).value, (field.querySelector('.dropdown-descriptor-select') || {}).value) : null;

    if (this.compCurrentStep === 1) {
      if (isManual) {
        draft.triggerDescriptor = readField(holder.querySelector('.dropdown-descriptor-field[data-dropdown-role="trigger"]'));
        draft.menuDescriptor = readField(holder.querySelector('.dropdown-descriptor-field[data-dropdown-role="menu"]'));
        draft.wrapperDescriptor = readField(holder.querySelector('.dropdown-descriptor-field[data-dropdown-role="wrapper"]'));
        draft.itemDescriptors = Array.from(holder.querySelectorAll('.dropdown-multi-row[data-dropdown-kind="item"]')).map(row => readField(row.querySelector('.dropdown-descriptor-field'))).filter(Boolean);
      } else {
        draft.wrapperDescriptor = readField(holder.querySelector('.dropdown-descriptor-field[data-dropdown-role="wrapper"]'));
        const triggerSelector = (holder.querySelector('.dropdown-container-trigger-selector') || {}).value || '';
        const menuSelector = (holder.querySelector('.dropdown-container-menu-selector') || {}).value || '';
        const itemsSelector = (holder.querySelector('.dropdown-container-items-selector') || {}).value || '';
        draft.triggerDescriptor = { id: '', selector: triggerSelector.trim() };
        draft.menuDescriptor = { id: '', selector: menuSelector.trim() };
        draft.itemDescriptors = [{ id: '', selector: itemsSelector.trim() }];
      }
    } else if (this.compCurrentStep === 2) {
      const value = selector => holder.querySelector(selector);
      if (value('.dropdown-setting-method')) draft.settings.method = value('.dropdown-setting-method').value;
      if (value('.dropdown-setting-open-class')) draft.settings.openClass = value('.dropdown-setting-open-class').value.trim() || 'open';
      if (value('.dropdown-setting-activation')) draft.settings.activation = value('.dropdown-setting-activation').value;
      
      const booleans = {
        closeOnEscape: '.dropdown-setting-escape',
        closeOnOutsideClick: '.dropdown-setting-outside',
        closeOnItemClick: '.dropdown-setting-item-click',
        closeOthers: '.dropdown-setting-close-others',
        restoreFocus: '.dropdown-setting-restore-focus',
        openOnLoad: '.dropdown-setting-open-load'
      };
      Object.entries(booleans).forEach(([key, selector]) => { const field = value(selector); if (field) draft.settings[key] = field.checked; });
      if (value('.dropdown-setting-open-delay')) draft.settings.openDelay = Math.max(0, Number(value('.dropdown-setting-open-delay').value) || 0);
      if (value('.dropdown-setting-close-delay')) draft.settings.closeDelay = Math.max(0, Number(value('.dropdown-setting-close-delay').value) || 0);
    } else if (this.compCurrentStep === 3) {
      const accessibility = holder.querySelector('.dropdown-setting-accessibility');
      const focusFirst = holder.querySelector('.dropdown-setting-focus-first');
      if (accessibility) draft.settings.accessibility = accessibility.checked;
      if (focusFirst) draft.settings.focusFirstItemOnOpen = focusFirst.checked;
    }
  };

  proto.validateDropdownComponentDraft = function () {
    const draft = this.visualLinkDraft;
    const errors = [];
    const mode = draft.mode || 'manual';
    const isManual = mode === 'manual';

    const invalidSelector = descriptor => {
      if (!descriptor || !descriptor.selector) return false;
      try { document.querySelectorAll(descriptor.selector); return false; } catch (error) { return true; }
    };

    if (isManual) {
      if (!draft.triggerDescriptor || (!draft.triggerDescriptor.id && !draft.triggerDescriptor.selector)) {
        errors.push('يجب اختيار عنصر التحكم Trigger.');
      } else if (invalidSelector(draft.triggerDescriptor)) {
        errors.push(`Trigger Selector: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      } else if (!this.resolveModalDescriptor(draft.triggerDescriptor, false)) {
        errors.push(`Trigger: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
      }

      if (!draft.menuDescriptor || (!draft.menuDescriptor.id && !draft.menuDescriptor.selector)) {
        errors.push('يجب اختيار عنصر القائمة Menu.');
      } else if (invalidSelector(draft.menuDescriptor)) {
        errors.push(`Menu Selector: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      } else if (!this.resolveModalDescriptor(draft.menuDescriptor, false)) {
        errors.push(`Menu: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
      }

      (draft.itemDescriptors || []).forEach((descriptor, index) => {
        if (descriptor && invalidSelector(descriptor)) errors.push(`عنصر القائمة #${index + 1}: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      });
    } else {
      if (!draft.wrapperDescriptor || (!draft.wrapperDescriptor.id && !draft.wrapperDescriptor.selector)) {
        errors.push('يجب اختيار الحاوية الخارجية Wrapper.');
      } else if (invalidSelector(draft.wrapperDescriptor)) {
        errors.push(`Wrapper Selector: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      } else if (!this.resolveModalDescriptor(draft.wrapperDescriptor, false)) {
        errors.push(`Wrapper: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
      }

      if (!draft.triggerDescriptor || !draft.triggerDescriptor.selector) {
        errors.push('يجب إدخال Selector لزر التحكم.');
      } else if (invalidSelector(draft.triggerDescriptor)) {
        errors.push(`Trigger Selector: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      } else {
        const wrapperEl = this.resolveModalDescriptor(draft.wrapperDescriptor, false);
        if (wrapperEl) {
          try {
            if (!wrapperEl.querySelector(draft.triggerDescriptor.selector)) {
              errors.push(`Trigger: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
            }
          } catch (e) {
            errors.push(`Trigger Selector: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
          }
        }
      }

      if (!draft.menuDescriptor || !draft.menuDescriptor.selector) {
        errors.push('يجب إدخال Selector للقائمة Menu.');
      } else if (invalidSelector(draft.menuDescriptor)) {
        errors.push(`Menu Selector: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      } else {
        const wrapperEl = this.resolveModalDescriptor(draft.wrapperDescriptor, false);
        if (wrapperEl) {
          try {
            if (!wrapperEl.querySelector(draft.menuDescriptor.selector)) {
              errors.push(`Menu: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
            }
          } catch (e) {
            errors.push(`Menu Selector: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
          }
        }
      }

      if (draft.itemDescriptors && draft.itemDescriptors[0] && draft.itemDescriptors[0].selector) {
        if (invalidSelector(draft.itemDescriptors[0])) errors.push(COMPONENT_BEGINNER_ERRORS.invalidSelector);
      }
    }

    const valid = errors.length === 0;
    const holder = document.getElementById('vl-validation-errors');
    if (holder) {
      holder.classList.toggle('visible', !valid);
      holder.innerHTML = errors.map(error => `<div><i class="fas fa-circle-exclamation"></i> ${esc(error)}</div>`).join('');
    }
    return { valid, errors, error: errors[0] || '' };
  };

  proto.renderSidebarDescriptorField = function (label, descriptor, role, index, optional) {
    const value = this.modalDescriptorValue(descriptor);
    const resolved = this.resolveModalDescriptor(descriptor, false);
    const status = value 
      ? (resolved ? '<span class="vl-badge success">تم الاختيار</span>' : `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}">العنصر غير موجود<span class="component-legacy-test-marker"> Missing</span></span>`) 
      : (optional ? '<span class="vl-badge">اختياري</span>' : '<span class="vl-badge danger">مطلوب</span>');
    const options = Array.from(this.app.canvas.querySelectorAll('[id]')).map(element => 
      `<option value="${esc(element.id)}" ${descriptor && descriptor.id === element.id ? 'selected' : ''}>${esc(element.tagName.toLowerCase())}#${esc(element.id)}</option>`
    ).join('');
    const indexAttr = index === undefined || index === null ? '' : ` data-sidebar-index="${index}"`;
    const readable = resolved ? this.getComponentElementReadableName(resolved) : '';
    const showButton = resolved ? `<button type="button" class="btn btn-secondary" data-comp-command="show-element" data-element-id="${esc(descriptor && descriptor.id || '')}" data-element-selector="${esc(descriptor && descriptor.selector || '')}"><i class="fas fa-location-crosshairs"></i> إظهار العنصر في الصفحة</button>` : '';
    return `<label class="vl-field-group sidebar-descriptor-field" data-sidebar-role="${role}"${indexAttr}>
      <span class="vl-field-label">${label} ${status}</span>
      ${readable ? `<code class="component-element-chip">${esc(readable)}</code>${this.renderComponentSemanticWarning(resolved, role)}` : ''}
      <div class="component-element-select-row">
        <select class="js-linker-select sidebar-descriptor-select"><option value="">اختر من قائمة العناصر</option>${options}</select>
        <button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="sidebar-${role}" data-item-id="${index === undefined || index === null ? '' : index}"><i class="fas fa-mouse-pointer"></i> ${resolved ? 'تغيير العنصر' : 'اختيار من الصفحة'}</button>
      </div>
      <input class="js-linker-input sidebar-descriptor-input" value="${esc(value)}" placeholder="#element-id أو selector يدوي">
      ${showButton}
    </label>`;
  };

  proto.renderSidebarComponentBuilder = function (holder) {
    const draft = this.visualLinkDraft;
    const step = this.compCurrentStep;
    const settings = draft.settings || {};
    const checked = value => value ? 'checked' : '';
    let html = '';

    if (step === 1) {
      const openRows = (draft.openTriggers || []).map((descriptor, index) => 
        `<div class="sidebar-multi-row" data-sidebar-kind="open" data-sidebar-index="${index}">
          ${this.renderSidebarDescriptorField(`زر الفتح ${index + 1}`, descriptor, 'open', index, false)}
          ${draft.openTriggers.length > 1 ? `<button class="vl-mini-btn danger" type="button" data-comp-command="sidebar-remove-open" data-item-id="${index}"><i class="fas fa-trash"></i></button>` : ''}
        </div>`
      ).join('');

      const closeRows = (draft.closeTriggers || []).map((descriptor, index) => 
        `<div class="sidebar-multi-row" data-sidebar-kind="close" data-sidebar-index="${index}">
          ${this.renderSidebarDescriptorField(`زر الإغلاق ${index + 1}`, descriptor, 'close', index, true)}
          <button class="vl-mini-btn danger" type="button" data-comp-command="sidebar-remove-close" data-item-id="${index}"><i class="fas fa-trash"></i></button>
        </div>`
      ).join('');

      const itemRows = (draft.navItemDescriptors || []).map((descriptor, index) => 
        `<div class="sidebar-multi-row" data-sidebar-kind="item" data-sidebar-index="${index}">
          ${this.renderSidebarDescriptorField(`رابط داخلي ${index + 1}`, descriptor, 'item', index, true)}
          <button class="vl-mini-btn danger" type="button" data-comp-command="sidebar-remove-item" data-item-id="${index}"><i class="fas fa-trash"></i></button>
        </div>`
      ).join('');

      html = `
        <section class="e1-step-card sidebar-builder-step" data-sidebar-step="elements">
          <div class="e1-step-question">
            <span>1</span>
            <div>
              <h3>اختر عناصر الـ Sidebar</h3>
              <p>حدد عنصر القائمة الجانبية، أزرار الفتح والإغلاق، وعناصر العلاقات.</p>
            </div>
          </div>
          
          <h4 style="margin-top:10px;">أزرار الفتح (Open Triggers) <span class="vl-badge danger">مطلوب</span></h4>
          <div class="sidebar-open-list">${openRows}</div>
          <button type="button" class="btn btn-secondary" style="margin-top:6px; margin-bottom:14px;" data-comp-command="sidebar-add-open"><i class="fas fa-plus"></i> إضافة زر فتح</button>

          <h4 style="margin-top:10px;">عنصر القائمة الجانبية (Sidebar) <span class="vl-badge danger">مطلوب</span></h4>
          <div class="vl-fields-grid">
            ${this.renderSidebarDescriptorField('عنصر الـ Sidebar', draft.sidebarDescriptor, 'sidebar', null, false)}
          </div>

          <h4 style="margin-top:14px;">أزرار الإغلاق (Close Buttons) <span class="vl-badge">اختياري</span></h4>
          <div class="sidebar-close-list">${closeRows}</div>
          <button type="button" class="btn btn-secondary" style="margin-top:6px; margin-bottom:14px;" data-comp-command="sidebar-add-close"><i class="fas fa-plus"></i> إضافة زر إغلاق</button>

          <h4 style="margin-top:14px;">العناصر الإضافية والروابط <span class="vl-badge">اختياري</span></h4>
          <div class="vl-fields-grid">
            ${this.renderSidebarDescriptorField('عنصر الخلفية (Overlay)', draft.overlayDescriptor, 'overlay', null, true)}
            ${this.renderSidebarDescriptorField('عنوان الـ Sidebar', draft.titleDescriptor, 'title', null, true)}
          </div>

          <h4 style="margin-top:14px;">الروابط الداخلية (Nav Items) <span class="vl-badge">اختياري</span></h4>
          <div class="sidebar-item-list">${itemRows}</div>
          <button type="button" class="btn btn-secondary" style="margin-top:6px;" data-comp-command="sidebar-add-item"><i class="fas fa-plus"></i> إضافة رابط داخلي</button>
        </section>
      `;
    } else if (step === 2) {
      html = `
        <section class="e1-step-card sidebar-builder-step" data-sidebar-step="behavior">
          <div class="e1-step-question">
            <span>2</span>
            <div>
              <h3>اضبط سلوك الفتح والإغلاق</h3>
              <p>حدد طريقة عرض وإخفاء القائمة الجانبية وشروط إغلاقها.</p>
            </div>
          </div>
          <div class="vl-fields-grid">
            <label class="vl-field-group"><span class="vl-field-label">طريقة التبديل</span><select class="js-linker-select sidebar-setting-method">${opt('class','class',settings.method)}${opt('hidden','hidden',settings.method)}${opt('display','display',settings.method)}${opt('transform','transform',settings.method)}</select></label>
            <label class="vl-field-group"><span class="vl-field-label">Class الفتح (Active Class)</span><input class="js-linker-input sidebar-setting-open-class" value="${esc(settings.openClass || 'open')}"></label>
          </div>
          <div class="sidebar-setting-checks" style="display:grid;gap:8px;margin-top:12px;">
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-escape" ${checked(settings.closeOnEscape !== false)}> إغلاق عند الضغط على مفتاح Escape</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-overlay-click" ${checked(settings.closeOnOverlayClick !== false)}> إغلاق عند الضغط على الـ Overlay</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-outside" ${checked(settings.closeOnOutsideClick !== false)}> إغلاق عند الضغط خارج الـ Sidebar</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-item-click" ${checked(!!settings.closeOnItemClick)}> إغلاق عند الضغط على رابط داخلي</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-close-others" ${checked(settings.closeOthers !== false)}> إغلاق قوائم الـ Sidebar الأخرى عند فتح هذا العنصر</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-restore-focus" ${checked(settings.restoreFocus !== false)}> إعادة التركيز إلى زر الفتح بعد الإغلاق</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-lock-body" ${checked(settings.lockBodyScroll !== false)}> منع التمرير في الصفحة (Lock Scroll) أثناء الفتح</label>
          </div>
          <details class="e1-code-review sidebar-advanced-settings" style="margin-top:14px;">
            <summary>الإعدادات المتقدمة</summary>
            <div style="display:grid;gap:8px;margin-top:10px;">
              <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-open-load" ${checked(!!settings.openOnLoad)}> فتح تلقائي عند تحميل الصفحة</label>
              <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-open-once" ${checked(!!settings.openOnce)}> فتح مرة واحدة فقط (باستخدام localStorage)</label>
              <label class="vl-field-group"><span class="vl-field-label">تأخير الفتح عند النقر (ms)</span><input type="number" min="0" class="js-linker-input sidebar-setting-open-delay" value="${Number(settings.openDelay) || 0}"></label>
              <label class="vl-field-group"><span class="vl-field-label">تأخير الإغلاق عند النقر (ms)</span><input type="number" min="0" class="js-linker-input sidebar-setting-close-delay" value="${Number(settings.closeDelay) || 0}"></label>
            </div>
          </details>
        </section>
      `;
    } else if (step === 3) {
      html = `
        <section class="e1-step-card sidebar-builder-step" data-sidebar-step="motion">
          <div class="e1-step-question">
            <span>3</span>
            <div>
              <h3>الاتجاه والحركة</h3>
              <p>حدد اتجاه ظهور القائمة الجانبية وأسلوب تفاعلها مع الصفحة.</p>
            </div>
          </div>
          <div class="vl-fields-grid">
            <label class="vl-field-group"><span class="vl-field-label">الاتجاه (Position)</span><select class="js-linker-select sidebar-setting-position">${opt('left','اليسار (left)',settings.position)}${opt('right','اليمين (right)',settings.position)}${opt('top','الأعلى (top)',settings.position)}${opt('bottom','الأسفل (bottom)',settings.position)}</select></label>
            <label class="vl-field-group"><span class="vl-field-label">سلوك الحركة (Behavior Mode)</span><select class="js-linker-select sidebar-setting-behavior">${opt('overlay','فوق محتوى الصفحة (overlay)',settings.behavior)}${opt('push','إزاحة محتوى الصفحة (push)',settings.behavior)}${opt('static','عرض وتثبيت عادي (static)',settings.behavior)}</select></label>
          </div>
        </section>
      `;
    } else if (step === 4) {
      html = `
        <section class="e1-step-card sidebar-builder-step" data-sidebar-step="accessibility">
          <div class="e1-step-question">
            <span>4</span>
            <div>
              <h3>الوصول وتجربة المستخدم</h3>
              <p>تفعيل إعدادات لوحة المفاتيح والتركيز البصري افتراضياً.</p>
            </div>
          </div>
          <div class="vl-summary"><i class="fas fa-universal-access"></i><span>دعم لوحة المفاتيح والوصول مفعّل افتراضيًا.</span></div>
          <details class="e1-code-review sidebar-accessibility-advanced" style="margin-top:14px;"><summary>إعدادات متقدمة: الوصول ولوحة المفاتيح</summary><div class="vl-fields-grid" style="margin-top:10px;">
            <label class="vl-field-group"><span class="vl-field-label">دور المكوّن (ARIA Role)</span><select class="js-linker-select sidebar-setting-role">${opt('dialog','لوحة منبثقة تفاعلية (dialog)',settings.role)}${opt('navigation','شريط قائمة تنقل (navigation)',settings.role)}</select></label>
          </div>
          <div class="sidebar-setting-checks" style="display:grid;gap:8px;margin-top:12px;">
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-accessibility" ${checked(settings.accessibility !== false)}> تطبيق سمات الوصول (ARIA controls, expanded & hidden)</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-focus-first" ${checked(settings.focusFirstItemOnOpen !== false)}> نقل التركيز لأول عنصر داخل القائمة عند الفتح</label>
            <label class="vl-checkbox-row"><input type="checkbox" class="sidebar-setting-trap-focus" ${checked(!!settings.trapFocus)}> حصر التركيز البصري (Focus Trap) داخل القائمة (للوحة الـ dialog)</label>
          </div></details>
          <details class="e1-code-review" style="margin-top:14px;">
            <summary>تنسيق CSS وظيفي مقترح للتحول (transform)</summary>
            <pre>/* يمكنك إدراج هذا الستايل للتحول السلس */\n.sidebar { transition: transform 0.3s ease; }\n.sidebar[data-position="left"] { transform: translateX(-100%); }\n.sidebar.open { transform: translateX(0); }</pre>
          </details>
        </section>
      `;
    } else if (step === 5) {
      const openCount = (draft.openTriggers || []).filter(t => t.id || t.selector).length;
      const closeCount = (draft.closeTriggers || []).filter(t => t.id || t.selector).length;
      const itemsCount = (draft.navItemDescriptors || []).filter(t => t.id || t.selector).length;
      const sidebarName = this.modalDescriptorValue(draft.sidebarDescriptor) || (draft.sidebarDescriptor && draft.sidebarDescriptor.selector) || 'غير محدد';
      
      html = `
        <section class="e1-step-card sidebar-builder-step" data-sidebar-step="review">
          <div class="e1-step-question">
            <span>5</span>
            <div>
              <h3>راجع سلوك القائمة الجانبية</h3>
              <p>ملخص واضح أولًا، والتفاصيل التقنية اختيارية.</p>
            </div>
          </div>
          <div class="vl-summary component-beginner-summary"><i class="fas fa-circle-check"></i><span>عند الضغط على زر القائمة، ستظهر قائمة جانبية من الاتجاه المحدد.</span></div>
          <details class="e1-code-review component-advanced-review"><summary>تفاصيل تقنية متقدمة</summary><div class="component-technical-summary"><p>أزرار الفتح: <strong>${openCount}</strong></p><p>عنصر Sidebar: <strong>${esc(sidebarName)}</strong></p><p>أزرار الإغلاق: <strong>${closeCount}</strong></p><p>الروابط الداخلية: <strong>${itemsCount}</strong></p></div><details class="e1-code-review component-code-preview"><summary>Advanced Code Preview</summary><pre class="js-code-preview">${this.renderCodePreview(core.generateComponentBlock({ id: draft.id, componentType: 'sidebar', metadata: draft }))}</pre></details></details>
        </section>
      `;
    } else {
      html = `
        <section class="e1-step-card sidebar-builder-step" data-sidebar-step="save">
          <div class="e1-step-question">
            <span>6</span>
            <div>
              <h3>جرّب واحفظ المكوّن</h3>
              <p>زر Try Now يفتح نافذة معزولة تماماً لاختبار التفاعل بدون التأثير على الصفحة الحالية.</p>
            </div>
          </div>
          <div style="display:flex;gap:10px;">
            <button type="button" class="btn btn-secondary" data-comp-command="try-comp"><i class="fas fa-flask"></i> تجربة التفاعل (Try Now)</button>
            <button type="button" class="btn btn-primary" data-comp-command="save-comp"><i class="fas fa-save"></i> حفظ الـ Sidebar</button>
          </div>
        </section>
      `;
    }

    holder.innerHTML = html;
  };

  proto.syncSidebarComponentDraftFromUI = function () {
    const draft = this.visualLinkDraft;
    const holder = document.getElementById('e1-content');
    if (!holder || !draft || draft.componentType !== 'sidebar') return;

    const readField = field => field ? this.parseModalDescriptorValue((field.querySelector('.sidebar-descriptor-input') || {}).value, (field.querySelector('.sidebar-descriptor-select') || {}).value) : null;

    if (this.compCurrentStep === 1) {
      draft.openTriggers = Array.from(holder.querySelectorAll('.sidebar-multi-row[data-sidebar-kind="open"]')).map(row => readField(row.querySelector('.sidebar-descriptor-field'))).filter(Boolean);
      if (draft.openTriggers.length === 0) draft.openTriggers = [{ id: '', selector: '' }];
      
      draft.sidebarDescriptor = readField(holder.querySelector('.sidebar-descriptor-field[data-sidebar-role="sidebar"]')) || { id: '', selector: '' };
      
      draft.closeTriggers = Array.from(holder.querySelectorAll('.sidebar-multi-row[data-sidebar-kind="close"]')).map(row => readField(row.querySelector('.sidebar-descriptor-field'))).filter(Boolean);
      if (draft.closeTriggers.length === 0) draft.closeTriggers = [{ id: '', selector: '' }];
      
      draft.overlayDescriptor = readField(holder.querySelector('.sidebar-descriptor-field[data-sidebar-role="overlay"]'));
      draft.titleDescriptor = readField(holder.querySelector('.sidebar-descriptor-field[data-sidebar-role="title"]'));
      
      draft.navItemDescriptors = Array.from(holder.querySelectorAll('.sidebar-multi-row[data-sidebar-kind="item"]')).map(row => readField(row.querySelector('.sidebar-descriptor-field'))).filter(Boolean);
    } else if (this.compCurrentStep === 2) {
      const value = selector => holder.querySelector(selector);
      if (value('.sidebar-setting-method')) draft.settings.method = value('.sidebar-setting-method').value;
      if (value('.sidebar-setting-open-class')) draft.settings.openClass = value('.sidebar-setting-open-class').value.trim() || 'open';
      
      const booleans = {
        closeOnEscape: '.sidebar-setting-escape',
        closeOnOverlayClick: '.sidebar-setting-overlay-click',
        closeOnOutsideClick: '.sidebar-setting-outside',
        closeOnItemClick: '.sidebar-setting-item-click',
        closeOthers: '.sidebar-setting-close-others',
        restoreFocus: '.sidebar-setting-restore-focus',
        lockBodyScroll: '.sidebar-setting-lock-body',
        openOnLoad: '.sidebar-setting-open-load',
        openOnce: '.sidebar-setting-open-once'
      };
      Object.entries(booleans).forEach(([key, selector]) => { const field = value(selector); if (field) draft.settings[key] = field.checked; });
      if (value('.sidebar-setting-open-delay')) draft.settings.openDelay = Math.max(0, Number(value('.sidebar-setting-open-delay').value) || 0);
      if (value('.sidebar-setting-close-delay')) draft.settings.closeDelay = Math.max(0, Number(value('.sidebar-setting-close-delay').value) || 0);
    } else if (this.compCurrentStep === 3) {
      const value = selector => holder.querySelector(selector);
      if (value('.sidebar-setting-position')) draft.settings.position = value('.sidebar-setting-position').value;
      if (value('.sidebar-setting-behavior')) draft.settings.behavior = value('.sidebar-setting-behavior').value;
    } else if (this.compCurrentStep === 4) {
      const value = selector => holder.querySelector(selector);
      if (value('.sidebar-setting-role')) draft.settings.role = value('.sidebar-setting-role').value;
      if (value('.sidebar-setting-accessibility')) draft.settings.accessibility = value('.sidebar-setting-accessibility').checked;
      if (value('.sidebar-setting-focus-first')) draft.settings.focusFirstItemOnOpen = value('.sidebar-setting-focus-first').checked;
      if (value('.sidebar-setting-trap-focus')) draft.settings.trapFocus = value('.sidebar-setting-trap-focus').checked;
    }
  };

  proto.validateSidebarComponentDraft = function () {
    const draft = this.visualLinkDraft;
    const errors = [];

    const invalidSelector = descriptor => {
      if (!descriptor || !descriptor.selector) return false;
      try { document.querySelectorAll(descriptor.selector); return false; } catch (error) { return true; }
    };

    const hasOpenTrigger = (draft.openTriggers || []).some(t => t.id || t.selector);
    if (!hasOpenTrigger) {
      errors.push('يجب اختيار زر واحد على الأقل للفتح (Open Trigger).');
    } else {
      draft.openTriggers.forEach((t, i) => {
        if (invalidSelector(t)) errors.push(`زر الفتح #${i + 1}: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
        else if (t.id && !document.getElementById(t.id)) errors.push(`زر الفتح #${i + 1}: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
      });
    }

    if (!draft.sidebarDescriptor || (!draft.sidebarDescriptor.id && !draft.sidebarDescriptor.selector)) {
      errors.push('يجب اختيار عنصر الـ Sidebar.');
    } else if (invalidSelector(draft.sidebarDescriptor)) {
      errors.push(COMPONENT_BEGINNER_ERRORS.invalidSelector);
    } else if (draft.sidebarDescriptor.id && !document.getElementById(draft.sidebarDescriptor.id)) {
      errors.push(COMPONENT_BEGINNER_ERRORS.missingElement);
    }

    (draft.closeTriggers || []).forEach((t, i) => {
      if (invalidSelector(t)) errors.push(`زر الإغلاق #${i + 1}: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      else if (t.id && !document.getElementById(t.id)) errors.push(`زر الإغلاق #${i + 1}: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
    });

    if (draft.overlayDescriptor) {
      if (invalidSelector(draft.overlayDescriptor)) errors.push(`Overlay: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      else if (draft.overlayDescriptor.id && !document.getElementById(draft.overlayDescriptor.id)) errors.push(`Overlay: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
    }

    if (draft.titleDescriptor) {
      if (invalidSelector(draft.titleDescriptor)) errors.push(`Title: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
      else if (draft.titleDescriptor.id && !document.getElementById(draft.titleDescriptor.id)) errors.push(`Title: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
    }

    (draft.navItemDescriptors || []).forEach((t, i) => {
      if (invalidSelector(t)) errors.push(`الرابط الداخلي #${i + 1}: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
    });

    const valid = errors.length === 0;
    const holder = document.getElementById('vl-validation-errors');
    if (holder) {
      holder.classList.toggle('visible', !valid);
      holder.innerHTML = errors.map(error => `<div><i class="fas fa-circle-exclamation"></i> ${esc(error)}</div>`).join('');
    }
    return { valid, errors, error: errors[0] || '' };
  };

  proto.renderModalDescriptorField = function (label, descriptor, role, index, optional) {
    const value = this.modalDescriptorValue(descriptor);
    const resolved = this.resolveModalDescriptor(descriptor, false);
    const status = value ? (resolved ? '<span class="vl-badge success">تم الاختيار</span>' : `<span class="vl-badge danger" title="${COMPONENT_BEGINNER_ERRORS.missingElement}">العنصر غير موجود<span class="component-legacy-test-marker"> Missing</span></span>`) : (optional ? '<span class="vl-badge">اختياري</span>' : '<span class="vl-badge danger">مطلوب</span>');
    const options = Array.from(this.app.canvas.querySelectorAll('[id]')).map(element => `<option value="${esc(element.id)}" ${descriptor && descriptor.id === element.id ? 'selected' : ''}>${esc(element.tagName.toLowerCase())}#${esc(element.id)}</option>`).join('');
    const indexAttr = index === undefined || index === null ? '' : ` data-modal-index="${index}"`;
    const readable = resolved ? this.getComponentElementReadableName(resolved) : '';
    const showButton = resolved ? `<button type="button" class="btn btn-secondary" data-comp-command="show-element" data-element-id="${esc(descriptor && descriptor.id || '')}" data-element-selector="${esc(descriptor && descriptor.selector || '')}"><i class="fas fa-location-crosshairs"></i> إظهار العنصر في الصفحة</button>` : '';
    return `<label class="vl-field-group modal-descriptor-field" data-modal-role="${role}"${indexAttr}>
      <span class="vl-field-label">${label} ${status}</span>
      ${readable ? `<code class="component-element-chip">${esc(readable)}</code>${this.renderComponentSemanticWarning(resolved, role)}` : ''}
      <div class="component-element-select-row">
        <select class="js-linker-select modal-descriptor-select"><option value="">اختر من قائمة العناصر</option>${options}</select>
        <button type="button" class="btn btn-secondary" data-comp-command="pick-element" data-pick-role="modal-${role}" data-item-id="${index === undefined || index === null ? '' : index}"><i class="fas fa-mouse-pointer"></i> ${resolved ? 'تغيير العنصر' : 'اختيار من الصفحة'}</button>
      </div>
      <input class="js-linker-input modal-descriptor-input" value="${esc(value)}" placeholder="#element-id أو selector يدوي">
      ${showButton}
    </label>`;
  };

  proto.renderModalComponentBuilder = function (holder) {
    const draft = this.visualLinkDraft;
    const step = this.compCurrentStep;
    const settings = draft.settings || {};
    const checked = value => value ? 'checked' : '';
    let html = '';
    if (step === 1) {
      const openRows = (draft.openTriggers || []).map((descriptor, index) => `<div class="modal-multi-row" data-modal-kind="open" data-modal-index="${index}">${this.renderModalDescriptorField(`زر الفتح ${index + 1}`, descriptor, 'open', index, false)}${draft.openTriggers.length > 1 ? `<button class="vl-mini-btn danger" type="button" data-comp-command="modal-remove-open" data-item-id="${index}"><i class="fas fa-trash"></i></button>` : ''}</div>`).join('');
      const closeRows = (draft.closeTriggers || []).map((descriptor, index) => `<div class="modal-multi-row" data-modal-kind="close" data-modal-index="${index}">${this.renderModalDescriptorField(`زر الإغلاق ${index + 1}`, descriptor, 'close', index, false)}${draft.closeTriggers.length > 1 ? `<button class="vl-mini-btn danger" type="button" data-comp-command="modal-remove-close" data-item-id="${index}"><i class="fas fa-trash"></i></button>` : ''}</div>`).join('');
      html = `<section class="e1-step-card modal-builder-step" data-modal-step="elements">
        <div class="e1-step-question"><span>1</span><div><h3>اختر عناصر الـModal</h3><p>يمكن الاختيار من القائمة أو Canvas أو كتابة Selector يدوي.</p></div></div>
        <h4>أزرار الفتح</h4><div class="modal-open-list">${openRows}</div><button type="button" class="btn btn-secondary" data-comp-command="modal-add-open"><i class="fas fa-plus"></i> إضافة زر فتح</button>
        <div class="vl-fields-grid" style="margin-top:14px;">${this.renderModalDescriptorField('عنصر الـModal', draft.modalDescriptor, 'modal', null, false)}</div>
        <h4 style="margin-top:14px;">أزرار الإغلاق</h4><div class="modal-close-list">${closeRows}</div><button type="button" class="btn btn-secondary" data-comp-command="modal-add-close"><i class="fas fa-plus"></i> إضافة زر إغلاق</button>
        <div class="vl-fields-grid" style="margin-top:14px;">
          ${this.renderModalDescriptorField('Overlay', draft.overlayDescriptor, 'overlay', null, true)}
          ${this.renderModalDescriptorField('عنوان الـModal', draft.titleDescriptor, 'title', null, true)}
          ${this.renderModalDescriptorField('وصف الـModal', draft.descriptionDescriptor, 'description', null, true)}
        </div>
      </section>`;
    } else if (step === 2) {
      html = `<section class="e1-step-card modal-builder-step" data-modal-step="behavior">
        <div class="e1-step-question"><span>2</span><div><h3>اضبط سلوك الفتح والإغلاق</h3><p>الإعدادات الأساسية واضحة، والمتقدمة مغلقة افتراضيًا.</p></div></div>
        <div class="vl-fields-grid">
          <label class="vl-field-group"><span class="vl-field-label">طريقة العرض</span><select class="js-linker-select modal-setting-method">${opt('class','class',settings.method)}${opt('hidden','hidden',settings.method)}${opt('display','display',settings.method)}</select></label>
          <label class="vl-field-group"><span class="vl-field-label">Class الفتح</span><input class="js-linker-input modal-setting-open-class" value="${esc(settings.openClass || 'open')}"></label>
        </div>
        <div class="modal-setting-checks" style="display:grid;gap:8px;margin-top:12px;">
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-close-trigger" ${checked(settings.closeOnCloseTrigger !== false)}> الإغلاق بزر Close</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-escape" ${checked(settings.closeOnEscape !== false)}> الإغلاق بزر Escape</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-outside" ${checked(!!settings.closeOnOutsideClick)}> الإغلاق عند الضغط خارج الـModal</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-overlay" ${checked(settings.closeOnOverlayClick !== false)}> الإغلاق عند الضغط على Overlay</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-prevent-inside" ${checked(settings.preventCloseInside !== false)}> منع الإغلاق عند الضغط داخل محتوى الـModal</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-restore-focus" ${checked(settings.restoreFocus !== false)}> إعادة التركيز لزر الفتح</label>
        </div>
        <details class="e1-code-review modal-advanced-settings" style="margin-top:14px;"><summary>الإعدادات المتقدمة</summary><div style="display:grid;gap:8px;margin-top:10px;">
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-close-others" ${checked(settings.closeOtherModals !== false)}> إغلاق أي Modal آخر عند الفتح</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-lock-scroll" ${checked(settings.lockBodyScroll !== false)}> منع Scroll في body أثناء الفتح</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-open-load" ${checked(!!settings.openOnLoad)}> فتح عند تحميل الصفحة</label>
          <label class="vl-field-group"><span class="vl-field-label">تأخير الفتح (ms)</span><input type="number" min="0" class="js-linker-input modal-setting-delay" value="${Number(settings.openDelay) || 0}"></label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-open-once" ${checked(!!settings.openOnce)}> فتح تلقائي مرة واحدة باستخدام localStorage</label>
          <label class="vl-field-group"><span class="vl-field-label">Storage Key</span><input class="js-linker-input modal-setting-storage-key" value="${esc(settings.storageKey || '')}" placeholder="osoos-modal-once"></label>
        </div></details>
      </section>`;
    } else if (step === 3) {
      const modalElement = this.resolveModalDescriptor(draft.modalDescriptor, false);
      const semanticWarning = modalElement && !['DIALOG','DIV','SECTION','ASIDE'].includes(modalElement.tagName) ? '<div class="vl-summary" style="border-color:var(--accent-orange);">تحذير: العنصر المختار غير معتاد كنافذة حوار، لكن يمكن حفظه.</div>' : '';
      html = `<section class="e1-step-card modal-builder-step" data-modal-step="accessibility">
        <div class="e1-step-question"><span>3</span><div><h3>الوصول وتجربة المستخدم</h3><p>إعدادات الوصول مفعّلة افتراضيًا.</p></div></div>${semanticWarning}
        <div class="vl-summary"><i class="fas fa-universal-access"></i><span>إعدادات الوصول الموصى بها مفعّلة افتراضيًا، ويمكن تعديلها عند الحاجة.</span></div>
        <details class="e1-code-review modal-accessibility-advanced" style="margin-top:14px;"><summary>إعدادات متقدمة: الوصول ولوحة المفاتيح</summary><div style="display:grid;gap:9px;margin-top:10px;">
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-accessibility" ${checked(settings.accessibility !== false)}> ARIA: dialog / aria-modal / aria-hidden / labels</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-trap-focus" ${checked(settings.trapFocus !== false)}> Focus trap داخل الـModal</label>
          <label class="vl-checkbox-row"><input type="checkbox" class="modal-setting-restore-focus" ${checked(settings.restoreFocus !== false)}> Restore focus بعد الإغلاق</label>
        </div></details>
        <details class="e1-code-review" style="margin-top:14px;"><summary>CSS وظيفي مقترح (لا يضاف تلقائيًا)</summary><pre>.modal[hidden] { display: none; }\n.body-modal-open { overflow: hidden; }</pre></details>
      </section>`;
    } else if (step === 4) {
      const openCount = this.resolveModalDescriptorList(draft.openTriggers).length;
      const closeCount = this.resolveModalDescriptorList(draft.closeTriggers).length;
      html = `<section class="e1-step-card modal-builder-step" data-modal-step="review"><div class="e1-step-question"><span>4</span><div><h3>راجع سلوك النافذة</h3><p>ملخص واضح أولًا، والتفاصيل التقنية اختيارية.</p></div></div>
        <div class="vl-summary component-beginner-summary"><i class="fas fa-circle-check"></i><span>عند الضغط على زر الفتح، ستظهر نافذة فوق الصفحة ويمكن إغلاقها.</span></div>
        <details class="e1-code-review component-advanced-review"><summary>تفاصيل تقنية متقدمة</summary><div class="component-technical-summary"><p>${openCount} Open Trigger → Modal</p><p>${closeCount} Close Trigger → Modal</p><p>${draft.overlayDescriptor ? '1 Overlay → Modal' : 'لا يوجد Overlay'}</p></div><details class="e1-code-review component-code-preview"><summary>Advanced Code Preview</summary><pre class="js-code-preview">${this.renderCodePreview(core.generateComponentBlock({ id: draft.id, componentType: 'modal', metadata: draft }))}</pre></details></details>
      </section>`;
    } else {
      html = `<section class="e1-step-card modal-builder-step" data-modal-step="save"><div class="e1-step-question"><span>5</span><div><h3>جرّب واحفظ</h3><p>Try Now يعمل داخل iframe معزول ولا يغيّر Canvas أو History.</p></div></div>
        <div style="display:flex;gap:10px;"><button type="button" class="btn btn-secondary" data-comp-command="try-comp"><i class="fas fa-flask"></i> Try Now</button><button type="button" class="btn btn-primary" data-comp-command="save-comp"><i class="fas fa-save"></i> حفظ Modal</button></div>
      </section>`;
    }
    holder.innerHTML = html;
  };

  proto.resolveModalDescriptorList = function (descriptors) {
    const result = [];
    (descriptors || []).forEach(descriptor => this.resolveModalDescriptor(descriptor, true).forEach(element => { if (!result.includes(element)) result.push(element); }));
    return result;
  };

  proto.syncModalComponentDraftFromUI = function () {
    const draft = this.visualLinkDraft;
    const holder = document.getElementById('e1-content');
    if (!holder || !draft || draft.componentType !== 'modal') return;
    const readField = field => field ? this.parseModalDescriptorValue((field.querySelector('.modal-descriptor-input') || {}).value, (field.querySelector('.modal-descriptor-select') || {}).value) : null;
    if (this.compCurrentStep === 1) {
      draft.openTriggers = Array.from(holder.querySelectorAll('.modal-multi-row[data-modal-kind="open"]')).map(row => readField(row.querySelector('.modal-descriptor-field'))).filter(Boolean);
      draft.closeTriggers = Array.from(holder.querySelectorAll('.modal-multi-row[data-modal-kind="close"]')).map(row => readField(row.querySelector('.modal-descriptor-field'))).filter(Boolean);
      if (!draft.openTriggers.length) draft.openTriggers = [{ id: '', selector: '' }];
      if (!draft.closeTriggers.length) draft.closeTriggers = [{ id: '', selector: '' }];
      draft.modalDescriptor = readField(holder.querySelector('.modal-descriptor-field[data-modal-role="modal"]'));
      draft.overlayDescriptor = readField(holder.querySelector('.modal-descriptor-field[data-modal-role="overlay"]'));
      draft.titleDescriptor = readField(holder.querySelector('.modal-descriptor-field[data-modal-role="title"]'));
      draft.descriptionDescriptor = readField(holder.querySelector('.modal-descriptor-field[data-modal-role="description"]'));
    } else if (this.compCurrentStep === 2) {
      const value = selector => holder.querySelector(selector);
      if (value('.modal-setting-method')) draft.settings.method = value('.modal-setting-method').value;
      if (value('.modal-setting-open-class')) draft.settings.openClass = value('.modal-setting-open-class').value.trim() || 'open';
      const booleans = { closeOnCloseTrigger:'.modal-setting-close-trigger',closeOnEscape:'.modal-setting-escape',closeOnOutsideClick:'.modal-setting-outside',closeOnOverlayClick:'.modal-setting-overlay',preventCloseInside:'.modal-setting-prevent-inside',restoreFocus:'.modal-setting-restore-focus',closeOtherModals:'.modal-setting-close-others',lockBodyScroll:'.modal-setting-lock-scroll',openOnLoad:'.modal-setting-open-load',openOnce:'.modal-setting-open-once' };
      Object.entries(booleans).forEach(([key, selector]) => { const field = value(selector); if (field) draft.settings[key] = field.checked; });
      if (value('.modal-setting-delay')) draft.settings.openDelay = Math.max(0, Number(value('.modal-setting-delay').value) || 0);
      if (value('.modal-setting-storage-key')) draft.settings.storageKey = value('.modal-setting-storage-key').value.trim();
    } else if (this.compCurrentStep === 3) {
      const accessibility = holder.querySelector('.modal-setting-accessibility');
      const trapFocus = holder.querySelector('.modal-setting-trap-focus');
      const restoreFocus = holder.querySelector('.modal-setting-restore-focus');
      if (accessibility) draft.settings.accessibility = accessibility.checked;
      if (trapFocus) draft.settings.trapFocus = trapFocus.checked;
      if (restoreFocus) draft.settings.restoreFocus = restoreFocus.checked;
    }
  };

  proto.syncComponentDraftFromUI = function () {
    const draft = this.visualLinkDraft;
    if (!draft || !draft.componentType) return;
    if (draft.componentType === 'modal') {
      this.syncModalComponentDraftFromUI();
      return;
    }
    if (draft.componentType === 'dropdown') {
      this.syncDropdownComponentDraftFromUI();
      return;
    }
    if (draft.componentType === 'sidebar') {
      this.syncSidebarComponentDraftFromUI();
      return;
    }
    
    const holder = document.getElementById('e1-content');
    if (!holder) return;
    
    const step = this.compCurrentStep;
    
    if (step === 1) {
      const modeSel = holder.querySelector('.comp-binding-mode');
      if (modeSel) draft.bindingMode = modeSel.value;
      
      if (draft.bindingMode === 'manual') {
        const itemRows = holder.querySelectorAll('.comp-manual-item-row');
        draft.items = Array.from(itemRows).map(row => {
          const itemId = row.dataset.itemId;
          const trigInput = row.querySelector('.comp-trigger-input');
          const contInput = row.querySelector('.comp-content-input');
          
          const oldItem = draft.items.find(it => it.id === itemId) || {};
          
          if (draft.componentType === 'accordion') {
            return {
              id: itemId,
              triggerId: trigInput ? trigInput.value.trim() : '',
              contentId: contInput ? contInput.value.trim() : '',
              initialOpen: oldItem.initialOpen || false
            };
          } else {
            return {
              id: itemId,
              tabId: trigInput ? trigInput.value.trim() : '',
              panelId: contInput ? contInput.value.trim() : '',
              initialOpen: oldItem.initialOpen || false
            };
          }
        });
      } else {
        const containerInput = holder.querySelector('.comp-container-id');
        const triggerSelectorInput = holder.querySelector('.comp-trigger-selector');
        const panelSelectorInput = holder.querySelector('.comp-panel-selector');
        const matchingMethodSel = holder.querySelector('.comp-matching-method');
        
        if (containerInput) draft.containerId = containerInput.value.trim();
        if (triggerSelectorInput) draft.triggerSelector = triggerSelectorInput.value.trim();
        if (panelSelectorInput) draft.panelSelector = panelSelectorInput.value.trim();
        if (matchingMethodSel) draft.matchingMethod = matchingMethodSel.value;
        
        if (draft.containerId && document.getElementById(draft.containerId)) {
          const containerEl = document.getElementById(draft.containerId);
          let triggers = [], panels = [];
          try { triggers = Array.from(containerEl.querySelectorAll(draft.triggerSelector || '')); } catch (e) { /* invalid selector */ }
          try { panels = Array.from(containerEl.querySelectorAll(draft.panelSelector || '')); } catch (e) { /* invalid selector */ }
          
          draft.items = [];
          const count = Math.max(triggers.length, panels.length);
          for (let i = 0; i < count; i++) {
            const trig = triggers[i];
            const pan = panels[i];
            
            const trigId = trig ? (trig.id || this.ensureElementId(trig)) : '';
            const panId = pan ? (pan.id || this.ensureElementId(pan)) : '';
            
            if (draft.componentType === 'accordion') {
              draft.items.push({
                id: `item-auto-${i}`,
                triggerId: trigId,
                contentId: panId,
                initialOpen: false
              });
            } else {
              draft.items.push({
                id: `item-auto-${i}`,
                tabId: trigId,
                panelId: panId,
                initialOpen: i === 0
              });
            }
          }
        }
      }
      
    } else if (step === 2) {
      draft.settings = draft.settings || {};
      if (draft.componentType === 'accordion') {
        const eventSel = holder.querySelector('.comp-setting-event');
        const methodSel = holder.querySelector('.comp-setting-method');
        const activeClassInput = holder.querySelector('.comp-setting-active-class');
        
        const allowMultipleCh = holder.querySelector('.comp-setting-allow-multiple');
        const collapsibleCh = holder.querySelector('.comp-setting-collapsible');
        const keyboardCh = holder.querySelector('.comp-setting-keyboard');
        const accessibilityCh = holder.querySelector('.comp-setting-accessibility');
        
        if (eventSel) draft.settings.event = eventSel.value;
        if (methodSel) draft.settings.method = methodSel.value;
        if (activeClassInput) draft.settings.activeClass = activeClassInput.value.trim() || 'open';
        
        if (allowMultipleCh) draft.settings.allowMultiple = allowMultipleCh.checked;
        if (collapsibleCh) draft.settings.collapsible = collapsibleCh.checked;
        if (keyboardCh) draft.settings.keyboard = keyboardCh.checked;
        if (accessibilityCh) draft.settings.accessibility = accessibilityCh.checked;
      } else {
        const btnClassInput = holder.querySelector('.comp-setting-button-class');
        const panelClassInput = holder.querySelector('.comp-setting-panel-class');
        const hideMethodSel = holder.querySelector('.comp-setting-hide-method');
        
        const tabListInput = holder.querySelector('.comp-tablist-id');
        const panelsContainerInput = holder.querySelector('.comp-panels-container-id');
        
        const keyboardCh = holder.querySelector('.comp-setting-keyboard');
        const keyboardActivationSel = holder.querySelector('.comp-setting-keyboard-activation');
        const accessibilityCh = holder.querySelector('.comp-setting-accessibility');
        
        if (btnClassInput) draft.settings.buttonActiveClass = btnClassInput.value.trim() || 'active';
        if (panelClassInput) draft.settings.panelActiveClass = panelClassInput.value.trim() || 'active';
        if (hideMethodSel) draft.settings.hideMethod = hideMethodSel.value;
        
        if (tabListInput) draft.tabListId = tabListInput.value.trim();
        if (panelsContainerInput) draft.panelsContainerId = panelsContainerInput.value.trim();
        
        if (keyboardCh) draft.settings.keyboard = keyboardCh.checked;
        if (keyboardActivationSel) draft.settings.keyboardActivation = keyboardActivationSel.value;
        if (accessibilityCh) draft.settings.accessibility = accessibilityCh.checked;
      }
      
    } else if (step === 3) {
      if (draft.componentType === 'accordion') {
        if (draft.settings.allowMultiple) {
          const checkboxes = holder.querySelectorAll('.comp-default-open-checkbox');
          checkboxes.forEach(ch => {
            const index = Number(ch.dataset.index);
            if (draft.items[index]) {
              draft.items[index].initialOpen = ch.checked;
            }
          });
        } else {
          const radios = holder.querySelectorAll('.comp-default-open-radio');
          radios.forEach(rd => {
            const index = Number(rd.dataset.index);
            if (rd.checked) {
              draft.items.forEach((it, idx) => {
                it.initialOpen = (idx === index);
              });
            }
          });
        }
      } else {
        const radios = holder.querySelectorAll('.comp-default-tab-radio');
        radios.forEach(rd => {
          const index = Number(rd.dataset.index);
          if (rd.checked) {
            draft.settings.defaultIndex = index;
            draft.items.forEach((it, idx) => {
              it.initialOpen = (idx === index);
            });
          }
        });
      }
    }
  };

  proto.validateComponentDraft = function () {
    this.syncComponentDraftFromUI();
    const draft = this.visualLinkDraft;
    if (draft.componentType === 'modal') return this.validateModalComponentDraft();
    if (draft.componentType === 'dropdown') return this.validateDropdownComponentDraft();
    if (draft.componentType === 'sidebar') return this.validateSidebarComponentDraft();
    const errors = [];
    
    if (draft.bindingMode === 'container') {
      if (!draft.containerId) {
        errors.push('يجب إدخال معرّف الحاوية (Container ID).');
      } else if (!document.getElementById(draft.containerId)) {
        errors.push(COMPONENT_BEGINNER_ERRORS.missingElement);
      }
      if (!draft.triggerSelector) {
        errors.push('يجب إدخال Selector للـ Triggers.');
      }
      if (!draft.panelSelector) {
        errors.push('يجب إدخال Selector للـ Panels.');
      }
      
      if (draft.containerId && document.getElementById(draft.containerId)) {
        const containerEl = document.getElementById(draft.containerId);
        let trigCount = 0, panelCount = 0;
        try { trigCount = containerEl.querySelectorAll(draft.triggerSelector).length; } catch (e) {
          errors.push(COMPONENT_BEGINNER_ERRORS.invalidSelector);
        }
        try { panelCount = containerEl.querySelectorAll(draft.panelSelector).length; } catch (e) {
          errors.push(COMPONENT_BEGINNER_ERRORS.invalidSelector);
        }
        if (trigCount === 0 && !errors.some(e => e.includes('Trigger Selector'))) {
          errors.push('لم يتم العثور على أي Triggers باستخدام الـ Selector المحدد.');
        }
        if (panelCount === 0 && !errors.some(e => e.includes('Panel Selector'))) {
          errors.push('لم يتم العثور على أي Panels باستخدام الـ Selector المحدد.');
        }
        if (draft.matchingMethod === 'index' && trigCount !== panelCount) {
          errors.push(COMPONENT_BEGINNER_ERRORS.countMismatch);
        }
      }
    } else {
      if (!draft.items || draft.items.length === 0) {
        errors.push('يجب إضافة عنصر واحد على الأقل للمكوّن.');
      } else {
        const triggerIds = [];
        const contentIds = [];
        
        draft.items.forEach((item, index) => {
          const isAccordion = draft.componentType === 'accordion';
          const triggerId = isAccordion ? item.triggerId : item.tabId;
          const contentId = isAccordion ? item.contentId : item.panelId;
          
          if (!triggerId) {
            errors.push(`العنصر #${index + 1}: حقل العنوان/الـ Trigger فارغ.`);
          } else if (!document.getElementById(triggerId)) {
            errors.push(`العنصر #${index + 1}: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
          } else {
            if (triggerIds.includes(triggerId)) {
              errors.push(`العنصر #${index + 1}: ${COMPONENT_BEGINNER_ERRORS.duplicateElement}`);
            }
            triggerIds.push(triggerId);
          }
          
          if (!contentId) {
            errors.push(`العنصر #${index + 1}: حقل اللوحة/المحتوى فارغ.`);
          } else if (!document.getElementById(contentId)) {
            errors.push(`العنصر #${index + 1}: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
          } else {
            if (contentIds.includes(contentId)) {
              errors.push(`العنصر #${index + 1}: ${COMPONENT_BEGINNER_ERRORS.duplicateElement}`);
            }
            contentIds.push(contentId);
          }
        });
      }
    }
    
    if (draft.componentType === 'tabs' && draft.settings.accessibility) {
      if (draft.tabListId && !document.getElementById(draft.tabListId)) {
        errors.push(COMPONENT_BEGINNER_ERRORS.missingElement);
      }
      if (draft.panelsContainerId && !document.getElementById(draft.panelsContainerId)) {
        errors.push(COMPONENT_BEGINNER_ERRORS.missingElement);
      }
    }
    
    const valid = errors.length === 0;
    const holder = document.getElementById('vl-validation-errors');
    if (holder) {
      holder.classList.toggle('visible', !valid);
      holder.innerHTML = errors.map(error => `<div><i class="fas fa-circle-exclamation"></i> ${esc(error)}</div>`).join('');
    }
    
    return { valid, errors, error: errors[0] || '' };
  };

  proto.validateModalComponentDraft = function () {
    const draft = this.visualLinkDraft;
    const errors = [];
    const invalidSelector = descriptor => {
      if (!descriptor || !descriptor.selector) return false;
      try { document.querySelectorAll(descriptor.selector); return false; } catch (error) { return true; }
    };
    const validateRequiredList = (descriptors, label) => {
      if (!descriptors || !descriptors.length) { errors.push(`يجب اختيار ${label} واحد على الأقل.`); return; }
      descriptors.forEach((descriptor, index) => {
        if (invalidSelector(descriptor)) errors.push(`${label} #${index + 1}: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
        else if (!this.resolveModalDescriptor(descriptor, true).length) errors.push(`${label} #${index + 1}: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
      });
    };
    validateRequiredList(draft.openTriggers, 'Open Trigger');
    if (!draft.modalDescriptor) errors.push('يجب اختيار عنصر الـModal.');
    else if (invalidSelector(draft.modalDescriptor)) errors.push(`Modal: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`);
    else if (!this.resolveModalDescriptor(draft.modalDescriptor, false)) errors.push(`Modal: ${COMPONENT_BEGINNER_ERRORS.missingElement}`);
    validateRequiredList(draft.closeTriggers, 'Close Trigger');
    const optionalDescriptors = [['Overlay', draft.overlayDescriptor], ['Title', draft.titleDescriptor], ['Description', draft.descriptionDescriptor]];
    optionalDescriptors.forEach(([label, descriptor]) => { if (descriptor && invalidSelector(descriptor)) errors.push(`${label}: ${COMPONENT_BEGINNER_ERRORS.invalidSelector}`); });
    if (draft.settings.method === 'class' && !String(draft.settings.openClass || '').trim()) errors.push('يجب إدخال Class الفتح.');
    const valid = errors.length === 0;
    const holder = document.getElementById('vl-validation-errors');
    if (holder) {
      holder.classList.toggle('visible', !valid);
      holder.innerHTML = errors.map(error => `<div><i class="fas fa-circle-exclamation"></i> ${esc(error)}</div>`).join('');
    }
    return { valid, errors, error: errors[0] || '' };
  };

  proto.saveComponentFromPopup = function () {
    const validation = this.validateComponentDraft();
    if (!validation.valid) {
      this.showToastNotice(`راجع الحقول: ${validation.error || 'أكمل الحقول المطلوبة قبل الحفظ'}`);
      return;
    }
    
    const draft = this.visualLinkDraft;
    const existingId = this.activeVisualLink.existingId;
    const isNew = !existingId;
    
    const componentId = existingId || (draft.componentType === 'modal' ? `component-modal-${Date.now()}` : (draft.componentType === 'dropdown' ? `component-dropdown-${Date.now()}` : (draft.componentType === 'sidebar' ? `component-sidebar-${Date.now()}` : `comp-${Date.now()}`)));
    draft.id = componentId;
    
    const componentBlock = core.generateComponentBlock({
      id: componentId,
      componentType: draft.componentType,
      metadata: draft
    });
    
    this.flushPendingHistoryBeforeVisualLink();
    
    if (isNew) {
      this.customJS = (this.customJS || '').trim() + '\n\n' + componentBlock;
    } else {
      const startMarker = `// OSOOS_COMPONENT_START id="${existingId}"`;
      const endMarker = `// OSOOS_COMPONENT_END id="${existingId}"`;
      const lines = this.customJS.split(/\r?\n/);
      let startIndex = -1;
      let endIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(startMarker)) startIndex = i;
        if (lines[i].includes(endMarker)) endIndex = i;
      }
      if (startIndex >= 0 && endIndex >= 0) {
        lines.splice(startIndex, endIndex - startIndex + 1, componentBlock);
        this.customJS = lines.join('\n');
      } else {
        this.customJS = (this.customJS || '').trim() + '\n\n' + componentBlock;
      }
    }
    
    if (this.currentLanguage === 'js') {
      this.textarea.value = this.customJS;
      this.updateLineNumbers();
    }
    
    this.app.saveProgress(false);
    const historyReason = draft.componentType === 'modal'
      ? (isNew ? 'Create Modal E2.2.1' : 'Update Modal E2.2.1')
      : (draft.componentType === 'dropdown'
        ? (isNew ? 'Create Dropdown E2.2.2' : 'Update Dropdown E2.2.2')
        : (draft.componentType === 'sidebar'
          ? (isNew ? 'Create Sidebar E2.2.3' : 'Update Sidebar E2.2.3')
          : (isNew ? 'Create Component E2.1' : 'Update Component E2.1')));
    this.app.history.saveState(historyReason);
    this.commitTransientVisualLinkIds();
    this.closeVisualLinkPopup({ keepTransient: true });
    this.showToastNotice(isNew ? 'تم إنشاء المكوّن بنجاح' : 'تم حفظ تعديل المكوّن');
  };

  proto.tryComponentFromPopup = function () {
    const validation = this.validateComponentDraft();
    if (!validation.valid) {
      this.showToastNotice(validation.error || 'أكمل الحقول المطلوبة قبل التجربة');
      return;
    }
    
    this.closeVisualLinkTrial();
    
    const componentBlock = core.generateComponentBlock({
      id: this.visualLinkDraft.id || 'comp-trial',
      componentType: this.visualLinkDraft.componentType,
      metadata: this.visualLinkDraft
    });
    
    const originalJS = this.customJS;
    let documentHTML = '';
    try {
      this.customJS = (this.customJS || '') + '\n\n' + componentBlock;
      documentHTML = this.app.buildExportDocument();
    } finally {
      this.customJS = originalJS;
    }
    
    const bridge = `<script>window.addEventListener('error',e=>parent.postMessage({type:'osoos-e1-error',message:e.message},'*'));window.addEventListener('unhandledrejection',e=>parent.postMessage({type:'osoos-e1-error',message:String(e.reason)},'*'));<\/script>`;
    documentHTML = documentHTML.replace('</head>', `${bridge}</head>`);
    
    const notes = ['لم يُحفظ المكوّن بعد. التجربة في iframe نظيف لا يكرر Listeners.'];
    const overlay = document.createElement('div');
    overlay.id = 'vl-trial-overlay';
    overlay.innerHTML = `<div class="vl-trial-toolbar"><span class="vl-trial-title"><i class="fas fa-flask"></i> تجربة المكوّن معزولة (Try Now)</span><span class="vl-trial-note">${esc(notes.join(' '))}</span><button class="btn btn-secondary" id="e1-trial-cancel">إلغاء التجربة</button><button class="btn btn-secondary" id="e1-trial-edit">تعديل</button><button class="btn btn-primary" id="e1-trial-save">حفظ المكوّن</button></div><iframe class="vl-trial-frame" sandbox="allow-scripts allow-modals"></iframe>`;
    document.body.appendChild(overlay);
    
    // Error bridge listener with cleanup
    const trialFrame = overlay.querySelector('iframe');
    const errorHandler = (event) => {
      /* فحص المصدر (S7) + التقاط التحذيرات: النسخة دي كانت بتسقط
         osoos-e1-warning بعكس نسخة الروابط العامة — نسخ ولصق اتفرّق. */
      if (trialFrame && event.source !== trialFrame.contentWindow) return;
      if (!event.data) return;
      if (event.data.type === 'osoos-e1-error') {
        this.showToastNotice(`خطأ في التجربة: ${event.data.message}`, 'error');
      }
      if (event.data.type === 'osoos-e1-warning') {
        this.showToastNotice(event.data.message || 'تم حظر إجراء غير آمن داخل Try Now', 'warning');
      }
    };
    window.addEventListener('message', errorHandler);
    
    overlay.querySelector('iframe').srcdoc = documentHTML;
    overlay.querySelector('#e1-trial-cancel').addEventListener('click', () => { window.removeEventListener('message', errorHandler); this.closeVisualLinkTrial(); });
    overlay.querySelector('#e1-trial-edit').addEventListener('click', () => { window.removeEventListener('message', errorHandler); this.closeVisualLinkTrial(); });
    overlay.querySelector('#e1-trial-save').addEventListener('click', () => {
      window.removeEventListener('message', errorHandler);
      this.closeVisualLinkTrial();
      this.saveComponentFromPopup();
    });
  };

  const originalSaveVisualLinkFromPopup = proto.saveVisualLinkFromPopup;
  proto.saveVisualLinkFromPopup = function () {
    const isComponent = this.visualLinkDraft && (this.visualLinkDraft.builderMode === 'component' || !!this.visualLinkDraft.componentType);
    if (isComponent) {
      this.saveComponentFromPopup();
      return;
    }
    originalSaveVisualLinkFromPopup.call(this);
  };

  const originalTryVisualLinkFromPopup = proto.tryVisualLinkFromPopup;
  proto.tryVisualLinkFromPopup = function () {
    const isComponent = this.visualLinkDraft && (this.visualLinkDraft.builderMode === 'component' || !!this.visualLinkDraft.componentType);
    if (isComponent) {
      this.tryComponentFromPopup();
      return;
    }
    originalTryVisualLinkFromPopup.call(this);
  };

  const originalDeleteVisualLink = proto.deleteVisualLink;
  proto.deleteVisualLink = function (id) {
    const component = id && this.parseComponents().find(item => item.id === id);
    if (component) {
      const comp = component;
      this.flushPendingHistoryBeforeVisualLink();
      const lines = this.customJS.split(/\r?\n/);
      lines.splice(comp.startIndex, comp.endIndex - comp.startIndex + 1);
      this.customJS = lines.join('\n');
      if (this.currentLanguage === 'js') {
        this.textarea.value = this.customJS;
        this.updateLineNumbers();
      }
      this.app.saveProgress(false);
      this.app.history.saveState(comp.componentType === 'modal' ? 'Delete Modal E2.2.1' : (comp.componentType === 'dropdown' ? 'Delete Dropdown E2.2.2' : (comp.componentType === 'sidebar' ? 'Delete Sidebar E2.2.3' : 'Delete Component E2.1')));
      delete this.hiddenLinkArrows[id];
      if (this.activeVisualLink && this.activeVisualLink.existingId === id) {
        this.closeVisualLinkPopup({ keepTransient: true });
      }
      this.renderVisualLinksDashboard();
      this.showToastNotice('تم حذف المكوّن');
      return;
    }
    originalDeleteVisualLink.call(this, id);
  };

})();
