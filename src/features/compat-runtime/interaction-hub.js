/* Osoos Interaction Hub
 *
 * Beginner-first orchestration layer for the existing VisualLogicCore and the
 * persisted OSOOS_* formats. This file intentionally patches the current
 * CodeEditorManager instead of replacing the compiler or its storage schema.
 */
(function (root) {
  'use strict';

  const Editor = typeof CodeEditorManager !== 'undefined' ? CodeEditorManager : root.CodeEditorManager;
  const visualCore = root.VisualLogicCore;
  const hubCore = root.OsoosInteractionHubCore;
  if (!Editor || !visualCore || !hubCore) return;

  const proto = Editor.prototype;
  const INTRO_KEY = 'osoos-interaction-hub-intro-v1';
  const RECIPE_IDS = new Set(['inputText', 'taskList', 'hamburger', 'openClose', 'counter']);
  const COMPONENT_IDS = new Set(['accordion', 'tabs', 'modal', 'dropdown', 'sidebar']);
  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const EVENT_OPTIONS = [
    ['click', 'عند النقر'],
    ['input', 'أثناء الكتابة'],
    ['change', 'عند تغيير القيمة'],
    ['submit', 'عند إرسال النموذج'],
    ['mouseenter', 'عند دخول المؤشر'],
    ['mouseleave', 'عند خروج المؤشر'],
    ['focus', 'عند التركيز'],
    ['blur', 'عند فقدان التركيز'],
    ['keydown', 'عند ضغط مفتاح']
  ];

  const EVENT_LABELS = Object.freeze(Object.fromEntries(EVENT_OPTIONS));

  const ACTIONS = Object.freeze({
    setText: {
      label: 'غيّر النص',
      icon: 'fa-font',
      valueLabel: 'النص الجديد',
      placeholder: 'اكتب النص الذي سيظهر',
      defaultValue: 'نص جديد',
      requiresValue: true,
      supportsFieldValue: true
    },
    setInputValue: {
      label: 'غيّر قيمة الحقل',
      icon: 'fa-i-cursor',
      valueLabel: 'القيمة الجديدة',
      placeholder: 'اكتب القيمة',
      defaultValue: 'تم',
      requiresValue: true,
      supportsFieldValue: true
    },
    appendListItem: {
      label: 'أضف سطرًا جديدًا إلى قائمة',
      icon: 'fa-list-check',
      valueLabel: 'نص السطر الجديد',
      placeholder: 'نص السطر',
      defaultValue: 'عنصر جديد',
      requiresValue: true,
      supportsFieldValue: true
    },
    clearInput: {
      label: 'امسح الحقل',
      icon: 'fa-eraser',
      valueLabel: '',
      placeholder: '',
      defaultValue: '',
      requiresValue: false
    },
    incrementVariable: {
      label: 'زد العداد واعرضه',
      icon: 'fa-circle-plus',
      valueLabel: 'مقدار الزيادة',
      placeholder: '1',
      defaultValue: '1',
      requiresValue: true,
      counterAction: true
    },
    decrementVariable: {
      label: 'أنقص العداد واعرضه',
      icon: 'fa-circle-minus',
      valueLabel: 'مقدار النقص',
      placeholder: '1',
      defaultValue: '1',
      requiresValue: true,
      counterAction: true
    },
    toggleBoolean: {
      label: 'بدّل حالة فتح/إغلاق (Class)',
      icon: 'fa-toggle-on',
      valueLabel: 'اسم الـClass',
      placeholder: 'open',
      defaultValue: 'open',
      requiresValue: true,
      booleanAction: true
    },
    toggleVisibility: {
      label: 'افتح أو أغلق العنصر',
      icon: 'fa-eye',
      valueLabel: '',
      placeholder: '',
      defaultValue: '',
      requiresValue: false
    },
    show: {
      label: 'أظهر العنصر',
      icon: 'fa-eye',
      valueLabel: '',
      placeholder: '',
      defaultValue: '',
      requiresValue: false
    },
    hide: {
      label: 'أخفِ العنصر',
      icon: 'fa-eye-slash',
      valueLabel: '',
      placeholder: '',
      defaultValue: '',
      requiresValue: false
    },
    setColor: {
      label: 'غيّر لون النص',
      icon: 'fa-palette',
      valueLabel: 'اللون',
      placeholder: '#f59e0b أو red',
      defaultValue: '#f59e0b',
      requiresValue: true
    },
    addClass: {
      label: 'أضف حالة تصميم',
      icon: 'fa-plus',
      valueLabel: 'اسم الـClass',
      placeholder: 'active',
      defaultValue: 'active',
      requiresValue: true
    },
    removeClass: {
      label: 'أزل حالة تصميم',
      icon: 'fa-minus',
      valueLabel: 'اسم الـClass',
      placeholder: 'active',
      defaultValue: 'active',
      requiresValue: true
    },
    toggleClass: {
      label: 'بدّل حالة تصميم',
      icon: 'fa-arrows-rotate',
      valueLabel: 'اسم الـClass',
      placeholder: 'active',
      defaultValue: 'active',
      requiresValue: true
    },
    alert: {
      label: 'اعرض رسالة تنبيه',
      icon: 'fa-message',
      valueLabel: 'نص الرسالة',
      placeholder: 'اكتب الرسالة',
      defaultValue: 'تم تنفيذ التفاعل',
      requiresValue: true,
      targetless: true
    },
    custom: {
      label: 'منطق مخصص محفوظ',
      icon: 'fa-code',
      valueLabel: '',
      placeholder: '',
      defaultValue: '',
      requiresValue: false,
      targetless: true,
      advancedOnly: true
    }
  });

  const originalSetupVisualLinks = proto.setupVisualLinks;
  const originalOpenVisualLinkPopup = proto.openVisualLinkPopup;
  const originalCloseVisualLinkPopup = proto.closeVisualLinkPopup;
  const originalComposeVisualLinkDraftJS = proto.composeVisualLinkDraftJS;
  const originalDeleteVisualLink = proto.deleteVisualLink;
  const originalRenderVisualLinksDashboard = proto.renderVisualLinksDashboard;
  const originalCommitTransientVisualLinkIds = proto.commitTransientVisualLinkIds;
  const originalOpenComponentPopup = proto.openComponentPopup;
  const originalTryVisualLinkFromPopup = proto.tryVisualLinkFromPopup;
  const originalCloseVisualLinkTrial = proto.closeVisualLinkTrial;
  const originalValidateE1Draft = proto.validateE1Draft;

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeStorageGet(key) {
    try { return root.localStorage.getItem(key); } catch (error) { return null; }
  }

  function safeStorageSet(key, value) {
    try { root.localStorage.setItem(key, value); } catch (error) { /* storage is optional */ }
  }

  function visibleFocusable(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE)).filter(element => {
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
      const style = root.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  function focusDescriptor(element) {
    if (!element || element.nodeType !== 1) return null;
    if (element.id) return { type: 'id', value: element.id };
    const starter = element.closest('[data-ih-starter]');
    if (starter) return { type: 'starter', value: starter.dataset.ihStarter };
    const command = element.closest('[data-ih-action]');
    if (command) return { type: 'command', value: command.dataset.ihAction };
    const itemAction = element.closest('[data-ih-item-action]');
    const itemRow = itemAction && itemAction.closest('[data-ih-item-id]');
    if (itemAction && itemRow) {
      return {
        type: 'item',
        value: itemRow.dataset.ihItemId,
        action: itemAction.dataset.ihItemAction
      };
    }
    return null;
  }

  function selectedValue(value, current) {
    return String(value) === String(current) ? ' selected' : '';
  }

  function checked(value) {
    return value ? ' checked' : '';
  }

  function starterKind(item) {
    if (item && (item.kind === 'component' || COMPONENT_IDS.has(item.id))) return 'component';
    return 'recipe';
  }

  function actionMeta(type) {
    return ACTIONS[type] || ACTIONS.setText;
  }

  function actionValue(action) {
    if (!action) return '';
    if (['addClass', 'removeClass', 'toggleClass', 'toggleBoolean'].includes(action.type)) {
      return String((action.params && action.params.className) || action.value || '');
    }
    if (action.type === 'incrementVariable' || action.type === 'decrementVariable') {
      return String((action.params && action.params.step) || action.value || '1');
    }
    if (action.type === 'setColor') {
      return String(action.value || (action.params && action.params.value) || '');
    }
    return String(action.value === undefined ? '' : action.value);
  }

  /* القيمة الديناميكية: الإجراء يقرأ اسم قراءة (expression) بدل نص ثابت */
  function actionFieldElementId(action, draft) {
    if (!action || action.valueType !== 'expression') return '';
    const name = String(action.value || '').trim();
    if (!name) return '';
    const read = (draft.reads || []).find(item => item && item.name === name && item.enabled !== false);
    return read && read.elementId ? read.elementId : '';
  }

  function actionTargetChoice(action, sourceId) {
    const target = action && action.target && typeof action.target === 'object' ? action.target : {};
    if (target.kind === 'source' || (!action.targetId && target.kind === 'target')) return 'source';
    if (target.kind === 'parent') return 'parent';
    if (target.kind === 'firstChild') return 'firstChild';
    const id = action && action.targetId ? action.targetId : target.id;
    if (!id || id === sourceId) return 'source';
    return `id:${id}`;
  }

  function targetFromChoice(choice, sourceId) {
    if (choice === 'parent') {
      return { targetId: '', target: { kind: 'parent', id: '', selector: '', baseId: sourceId } };
    }
    if (choice === 'firstChild') {
      return { targetId: '', target: { kind: 'firstChild', id: '', selector: '', baseId: sourceId } };
    }
    if (String(choice || '').startsWith('id:')) {
      const id = String(choice).slice(3);
      return { targetId: id, target: { kind: 'element', id, selector: '', baseId: '' } };
    }
    return { targetId: '', target: { kind: 'source', id: sourceId, selector: '', baseId: sourceId } };
  }

  function defaultEventFor(element) {
    if (!element || !element.tagName) return 'click';
    const tag = element.tagName.toLowerCase();
    if (tag === 'form') return 'submit';
    if (tag === 'select') return 'change';
    if (tag === 'input' || tag === 'textarea') return 'input';
    return 'click';
  }

  function elementReadableType(element) {
    if (!element || !element.tagName) return 'innerText';
    return ['input', 'textarea', 'select'].includes(element.tagName.toLowerCase()) ? 'inputValue' : 'innerText';
  }

  function elementLabel(element) {
    if (!element || !element.tagName) return 'لا يوجد عنصر محدد';
    /* اسم ودّي («زر "أضف"») بدل tag#id المرعب؛ التقني يبقى في تلميح القوائم فقط */
    return hubCore.friendlyElementLabel(hubCore.describeDomElement(element));
  }

  function elementTechnicalName(element) {
    if (!element || !element.tagName) return '';
    return hubCore.technicalElementName(hubCore.describeDomElement(element));
  }

  function isFieldElement(element) {
    if (!element || !element.tagName) return false;
    const tag = element.tagName.toLowerCase();
    if (tag === 'textarea' || tag === 'select') return true;
    if (tag !== 'input') return false;
    return !['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'image'].includes(String(element.type || '').toLowerCase());
  }

  proto.setupInteractionHub = function () {
    const rootElement = document.getElementById('js-interaction-hub');
    if (!rootElement) return;
    rootElement.classList.add('interaction-hub');
    rootElement.setAttribute('aria-label', 'مركز التفاعلات وJS');

    const advancedHost = document.getElementById('js-interaction-advanced-host');
    if (advancedHost) {
      advancedHost.hidden = true;
      advancedHost.classList.add('ih-advanced-panel');
      advancedHost.style.maxHeight = 'none';
      advancedHost.style.flex = '1 1 auto';
      advancedHost.style.overflowY = 'auto';
      if (!advancedHost.querySelector('#ih-advanced-back')) {
        const back = document.createElement('button');
        back.type = 'button';
        back.id = 'ih-advanced-back';
        back.className = 'btn btn-secondary';
        back.innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i> رجوع إلى مركز التفاعلات';
        back.addEventListener('click', () => this.showInteractionHubHome());
        advancedHost.prepend(back);
      }
      ['js-interactive-linker-panel', 'js-components-management', 'js-visual-links-dashboard'].forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.hidden = true;
      });
    }

    this.renderInteractionHub();
  };

  proto.captureInteractionReturnFocus = function (element) {
    this._ihReturnFocus = element || document.activeElement;
    this._ihReturnFocusDescriptor = focusDescriptor(this._ihReturnFocus);
    return this._ihReturnFocus;
  };

  proto.describeCustomBuilderFocus = function (element) {
    if (!element) return null;
    if (element.id) return { id: element.id };
    const actionIndex = element.dataset && element.dataset.actionIndex;
    const className = ['ih-action-type', 'ih-action-target', 'ih-action-value', 'ih-action-value-source']
      .find(name => element.classList && element.classList.contains(name));
    if (className && actionIndex !== undefined) return { className, actionIndex: String(actionIndex) };
    const command = element.closest && element.closest('[data-ih-builder-command]');
    if (command) {
      return {
        command: command.dataset.ihBuilderCommand,
        actionIndex: command.dataset.actionIndex || '',
        step: command.dataset.step || ''
      };
    }
    return null;
  };

  proto.resolveCustomBuilderFocus = function (descriptor) {
    const dialog = document.getElementById('ih-custom-dialog');
    if (!dialog || !descriptor) return null;
    if (descriptor.id) return document.getElementById(descriptor.id);
    if (descriptor.className) {
      return Array.from(dialog.querySelectorAll(`.${descriptor.className}`))
        .find(element => String(element.dataset.actionIndex) === descriptor.actionIndex) || null;
    }
    if (descriptor.command) {
      return Array.from(dialog.querySelectorAll('[data-ih-builder-command]')).find(element => {
        return element.dataset.ihBuilderCommand === descriptor.command
          && String(element.dataset.actionIndex || '') === descriptor.actionIndex
          && String(element.dataset.step || '') === descriptor.step;
      }) || null;
    }
    return null;
  };

  proto.ensureInteractionHubElementId = function (element) {
    if (!element) return '';
    if (element.id) return element.id;
    let id = '';
    const tag = element.tagName ? element.tagName.toLowerCase() : 'element';
    do {
      id = `${tag}-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (document.getElementById(id));
    element.id = id;
    if (!Array.isArray(this._vlTransientElementIds)) this._vlTransientElementIds = [];
    this._vlTransientElementIds.push({ element, id });
    return id;
  };

  proto.resolveInteractionReturnFocus = function (original, descriptor) {
    if (original && original.isConnected) return original;
    if (!descriptor) return null;
    if (descriptor.type === 'id') return document.getElementById(descriptor.value);
    const roots = ['#js-interaction-hub', '#js-interaction-hub-modal-content'];
    for (const rootSelector of roots) {
      const rootElement = document.querySelector(rootSelector);
      if (!rootElement) continue;
      if (descriptor.type === 'starter') {
        const match = Array.from(rootElement.querySelectorAll('[data-ih-starter]'))
          .find(element => element.dataset.ihStarter === descriptor.value);
        if (match) return match;
      }
      if (descriptor.type === 'command') {
        const match = Array.from(rootElement.querySelectorAll('[data-ih-action]'))
          .find(element => element.dataset.ihAction === descriptor.value);
        if (match) return match;
      }
      if (descriptor.type === 'item') {
        const row = Array.from(rootElement.querySelectorAll('[data-ih-item-id]'))
          .find(element => element.dataset.ihItemId === descriptor.value);
        const match = row && Array.from(row.querySelectorAll('[data-ih-item-action]'))
          .find(element => element.dataset.ihItemAction === descriptor.action);
        if (match) return match;
      }
    }
    return null;
  };

  proto.setupInteractiveLinker = function () {
    this.linkerPanel = document.getElementById('js-interactive-linker-panel');
    this.editingInteractionId = null;
    this.targetElementType = 'same';
    this.setupInteractionHub();
  };

  proto.updateInteractiveLinker = function () {
    this.renderInteractionHub();
  };

  proto.getInteractionHubItems = function () {
    const modernLinks = typeof this.parseVisualLinks === 'function' ? this.parseVisualLinks() : [];
    const components = typeof this.parseComponents === 'function' ? this.parseComponents() : [];
    const legacyInteractions = typeof this.parseInteractions === 'function' ? this.parseInteractions() : [];
    return hubCore.createUnifiedItems({ modernLinks, components, legacyInteractions });
  };

  proto.getInteractionHubSource = function () {
    if (document.getElementById('interaction-hub-overlay') && this._ihHubSourceElement) {
      return this._ihHubSourceElement;
    }
    return (this.app && this.app.selectedElement) || this._ihHubSourceElement || null;
  };

  proto.renderInteractionHubTemplate = function () {
    const source = this.getInteractionHubSource();
    const catalog = hubCore.CATALOG || hubCore.STARTER_CATALOG || [];
    const items = this.getInteractionHubItems();
    const showIntro = !safeStorageGet(INTRO_KEY);
    const sourceText = elementLabel(source);

    const catalogCards = catalog.map(item => {
      const kind = starterKind(item);
      const kindLabel = kind === 'component' ? 'مكوّن جاهز' : 'فكرة جاهزة';
      return `<button type="button" class="ih-template-card" data-ih-starter="${esc(item.id)}" data-ih-kind="${kind}">
        <span class="ih-template-icon"><i class="${esc(item.icon || 'fas fa-bolt')}" aria-hidden="true"></i></span>
        <span class="ih-template-copy"><strong>${esc(item.title)}</strong><small>${esc(item.description)}</small></span>
        <span class="ih-template-meta"><span class="ih-kind-badge ${kind === 'component' ? 'component' : 'modern'}">${kindLabel}</span><span>${esc(item.difficulty || 'سهل')}</span></span>
      </button>`;
    }).join('');

    const savedRows = items.map(item => {
      const kindLabel = item.kind === 'component' ? 'مكوّن' : (item.kind === 'legacy' ? 'قديم' : 'تفاعل حديث');
      const icon = item.kind === 'component' ? 'fa-cubes' : (item.kind === 'legacy' ? 'fa-box-archive' : 'fa-bolt');
      return `<li class="ih-saved-item" data-ih-item-id="${esc(item.id)}" data-ih-item-kind="${esc(item.kind)}">
        <button type="button" class="ih-saved-main" data-ih-item-action="edit" title="تعديل ${esc(item.title)}">
          <i class="fas ${icon}" aria-hidden="true"></i>
          <span><strong>${esc(item.title)}</strong><small>${esc(item.summary)}</small></span>
          <span class="ih-kind-badge ${esc(item.kind)}">${kindLabel}</span>
        </button>
        <span class="ih-saved-actions">
          <button type="button" class="btn btn-secondary" data-ih-item-action="try" title="تجربة" aria-label="تجربة ${esc(item.title)}"><i class="fas fa-play" aria-hidden="true"></i></button>
          <button type="button" class="btn btn-secondary" data-ih-item-action="locate" title="تحديد العناصر" aria-label="تحديد عناصر ${esc(item.title)}"><i class="fas fa-location-crosshairs" aria-hidden="true"></i></button>
          <button type="button" class="btn btn-secondary" data-ih-item-action="delete" title="حذف" aria-label="حذف ${esc(item.title)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
        </span>
      </li>`;
    }).join('');

    return `${showIntro ? `<section class="ih-intro" data-ih-intro>
      <span class="ih-intro-icon"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i></span>
      <div class="ih-intro-copy"><strong>حوّل فكرتك إلى تفاعل من دون كتابة كود</strong><p>ابدأ بفكرة جاهزة أو ابنِ تفاعلك في ثلاث خطوات. يمكنك التجربة قبل الحفظ.</p><button type="button" class="btn btn-secondary" data-ih-action="dismiss-intro">فهمت</button></div>
    </section>` : ''}
    <div class="ih-source-context"><span>العنصر المحدد:</span><code>${esc(sourceText)}</code></div>
    <label class="ih-search">
      <i class="fas fa-search" aria-hidden="true"></i>
      <span class="sr-only">ابحث في الأفكار والمكوّنات</span>
      <input type="search" data-ih-search autocomplete="off" value="${esc(this._ihSearchQuery || '')}" placeholder="ابحث: قائمة، نافذة، input، tabs…">
    </label>
    <div class="ih-path-grid">
      <button type="button" class="ih-path-card primary" data-ih-action="custom">
        <i class="fas fa-route" aria-hidden="true"></i>
        <span><strong>ابنِ تفاعلًا خاصًا</strong><small>متى يبدأ؟ ماذا سيحدث؟ ثم جرّب واحفظ.</small></span>
        <i class="fas fa-arrow-left" aria-hidden="true"></i>
      </button>
      <button type="button" class="ih-path-card" data-ih-action="focus-ready">
        <i class="fas fa-lightbulb" aria-hidden="true"></i>
        <span><strong>اختر فكرة جاهزة</strong><small>عشر أفكار ومكوّنات شائعة قابلة للتخصيص.</small></span>
        <i class="fas fa-arrow-down" aria-hidden="true"></i>
      </button>
    </div>
    <section class="ih-section" data-ih-ready-section>
      <div class="ih-section-head"><h2>أفكار ومكوّنات جاهزة</h2><span class="ih-filter-count" data-ih-filter-count>${catalog.length}</span></div>
      <div class="ih-template-grid" data-ih-template-grid>${catalogCards}</div>
      <div class="ih-empty" data-ih-search-empty hidden><i class="fas fa-search" aria-hidden="true"></i><strong>لم نجد فكرة بهذا الاسم.</strong><br><button type="button" class="btn btn-primary" data-ih-action="custom">ابنِها كتفاعل خاص</button></div>
    </section>
    <section class="ih-section">
      <div class="ih-section-head"><h2>تفاعلات الصفحة</h2><span class="ih-filter-count">${items.length}</span></div>
      ${items.length ? `<ul class="ih-saved-list">${savedRows}</ul>` : '<div class="ih-empty"><i class="fas fa-bolt" aria-hidden="true"></i>لا توجد تفاعلات محفوظة بعد.</div>'}
    </section>
    <details class="ih-advanced">
      <summary><span><i class="fas fa-screwdriver-wrench" aria-hidden="true"></i> أدوات متقدمة</span></summary>
      <div class="ih-advanced-panel">
        <button type="button" class="btn btn-secondary" data-ih-action="advanced-builder"><i class="fas fa-diagram-project" aria-hidden="true"></i> افتح المنشئ الكامل</button>
        <button type="button" class="btn btn-secondary" data-ih-action="legacy-tools"><i class="fas fa-box-archive" aria-hidden="true"></i> الكتل والمتغيرات القديمة</button>
        <button type="button" class="btn btn-secondary" data-ih-action="raw-code"><i class="fas fa-code" aria-hidden="true"></i> افتح كود JavaScript اليدوي</button>
      </div>
    </details>
    <span class="sr-only" aria-live="polite" data-ih-live></span>`;
  };

  proto.bindInteractionHubRoot = function (rootElement) {
    if (!rootElement || rootElement.dataset.ihBound === 'true') return;
    rootElement.dataset.ihBound = 'true';

    rootElement.addEventListener('input', event => {
      if (!event.target.matches('[data-ih-search]')) return;
      this._ihSearchQuery = event.target.value;
      this.filterInteractionHub(rootElement, event.target.value);
    });

    rootElement.addEventListener('click', event => {
      const starter = event.target.closest('[data-ih-starter]');
      if (starter) {
        this.launchInteractionStarter(starter.dataset.ihStarter);
        return;
      }

      const itemAction = event.target.closest('[data-ih-item-action]');
      if (itemAction) {
        const row = itemAction.closest('[data-ih-item-id]');
        if (row) this.handleInteractionHubItem(row.dataset.ihItemId, row.dataset.ihItemKind, itemAction.dataset.ihItemAction);
        return;
      }

      const command = event.target.closest('[data-ih-action]');
      if (!command) return;
      const action = command.dataset.ihAction;
      if (action === 'dismiss-intro') {
        safeStorageSet(INTRO_KEY, '1');
        const intro = rootElement.querySelector('[data-ih-intro]');
        if (intro) intro.remove();
        const search = rootElement.querySelector('[data-ih-search]');
        if (search) search.focus();
      } else if (action === 'custom') {
        this.openCustomInteractionBuilder({ sourceElement: this.getInteractionHubSource() });
      } else if (action === 'focus-ready') {
        const section = rootElement.querySelector('[data-ih-ready-section]');
        const search = rootElement.querySelector('[data-ih-search]');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (search) search.focus();
      } else if (action === 'advanced-builder') {
        this.openAdvancedInteractionBuilder();
      } else if (action === 'legacy-tools') {
        this.showLegacyInteractionTools();
      } else if (action === 'raw-code') {
        this.openRawJavaScriptTools();
      }
    });
  };

  proto.filterInteractionHub = function (rootElement, query) {
    const matches = new Set(hubCore.searchCatalog(query).map(item => item.id));
    let visible = 0;
    rootElement.querySelectorAll('[data-ih-starter]').forEach(card => {
      const show = matches.has(card.dataset.ihStarter);
      card.hidden = !show;
      if (show) visible += 1;
    });
    const count = rootElement.querySelector('[data-ih-filter-count]');
    if (count) count.textContent = String(visible);
    const empty = rootElement.querySelector('[data-ih-search-empty]');
    if (empty) empty.hidden = visible !== 0;
    const live = rootElement.querySelector('[data-ih-live]');
    if (live) live.textContent = visible ? `${visible} نتائج` : 'لا توجد نتائج؛ يمكنك بناء تفاعل خاص';
  };

  proto.renderInteractionHubInto = function (rootElement) {
    if (!rootElement) return;
    rootElement.innerHTML = this.renderInteractionHubTemplate();
    delete rootElement.dataset.ihBound;
    this.bindInteractionHubRoot(rootElement);
    this.filterInteractionHub(rootElement, this._ihSearchQuery || '');
  };

  proto.renderInteractionHub = function () {
    const sidebarRoot = document.getElementById('js-interaction-hub');
    if (sidebarRoot) this.renderInteractionHubInto(sidebarRoot);
    const modalRoot = document.getElementById('js-interaction-hub-modal-content');
    if (modalRoot) this.renderInteractionHubInto(modalRoot);
  };

  proto.showInteractionHubHome = function () {
    const rootElement = document.getElementById('js-interaction-hub');
    const advancedHost = document.getElementById('js-interaction-advanced-host');
    if (rootElement) {
      rootElement.hidden = false;
      rootElement.style.display = '';
      this.renderInteractionHubInto(rootElement);
    }
    if (advancedHost) advancedHost.hidden = true;
  };

  proto.showLegacyInteractionTools = function () {
    const returnFocus = document.activeElement;
    this.closeInteractionHubModal(false);
    const jsTab = document.getElementById('tab-btn-js');
    if (jsTab && !jsTab.classList.contains('active')) jsTab.click();
    const rootElement = document.getElementById('js-interaction-hub');
    const advancedHost = document.getElementById('js-interaction-advanced-host');
    if (rootElement) rootElement.hidden = true;
    if (advancedHost) {
      advancedHost.hidden = false;
      const back = advancedHost.querySelector('#ih-advanced-back');
      if (back) back.focus();
    } else if (returnFocus && typeof returnFocus.focus === 'function') {
      returnFocus.focus();
    }
  };

  proto.openRawJavaScriptTools = function () {
    this.closeInteractionHubModal(false);
    const codeTab = document.getElementById('tab-btn-code');
    if (codeTab) codeTab.click();
    const jsEditorTab = document.querySelector('.editor-tab[data-lang="js"]');
    if (jsEditorTab) jsEditorTab.click();
    if (this.textarea) this.textarea.focus();
  };

  proto.openInteractionHub = function (options) {
    const settings = options || {};
    const sourceElement = settings.sourceElement || (this.app && this.app.selectedElement) || null;
    this.closeInteractionHubModal(false);
    this._ihHubSourceElement = sourceElement;
    if (settings.modal === false) {
      const jsTab = document.getElementById('tab-btn-js');
      if (jsTab && !jsTab.classList.contains('active')) jsTab.click();
      else if (this.app && typeof this.app.collapseLeft === 'function') this.app.collapseLeft(false);
      this.showInteractionHubHome();
      const search = document.querySelector('#js-interaction-hub [data-ih-search]');
      if (search) search.focus();
      return;
    }

    this._ihHubReturnFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.id = 'interaction-hub-overlay';
    overlay.className = 'ih-overlay';
    overlay.innerHTML = `<div class="ih-dialog" id="js-interaction-hub-modal" role="dialog" aria-modal="true" aria-labelledby="interaction-hub-modal-title">
      <header class="ih-dialog-header">
        <div><h1 class="ih-dialog-title" id="interaction-hub-modal-title"><i class="fas fa-bolt" aria-hidden="true"></i> التفاعلات وJS</h1><div class="ih-source-context"><span>اختر فكرة جاهزة أو ابنِ تفاعلًا خاصًا.</span></div></div>
        <button type="button" class="btn btn-secondary" data-ih-close aria-label="إغلاق مركز التفاعلات"><i class="fas fa-xmark" aria-hidden="true"></i></button>
      </header>
      <div class="ih-source-context" aria-live="polite"><span>العنصر الحالي:</span><code>${esc(elementLabel(this._ihHubSourceElement))}</code></div>
      <div class="ih-dialog-body"><div class="interaction-hub" id="js-interaction-hub-modal-content"></div></div>
      <footer class="ih-dialog-footer"><span class="ih-dialog-spacer"></span><button type="button" class="btn btn-secondary" data-ih-close>إغلاق</button></footer>
    </div>`;
    document.body.appendChild(overlay);
    this.renderInteractionHubInto(overlay.querySelector('#js-interaction-hub-modal-content'));

    overlay.querySelectorAll('[data-ih-close]').forEach(button => {
      button.addEventListener('click', () => this.closeInteractionHubModal(true));
    });
    overlay.addEventListener('mousedown', event => {
      if (event.target === overlay) this.closeInteractionHubModal(true);
    });
    this._ihHubKeyHandler = event => {
      if (!document.getElementById('interaction-hub-overlay')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.closeInteractionHubModal(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = visibleFocusable(overlay);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!overlay.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', this._ihHubKeyHandler, true);
    const search = overlay.querySelector('[data-ih-search]');
    const close = overlay.querySelector('[data-ih-close]');
    (search || close).focus();
    const button = document.getElementById('bubble-js-link');
    if (button) button.setAttribute('aria-expanded', 'true');
  };

  proto.closeInteractionHubModal = function (restoreFocus) {
    const overlay = document.getElementById('interaction-hub-overlay');
    if (overlay) overlay.remove();
    if (this._ihHubKeyHandler) {
      document.removeEventListener('keydown', this._ihHubKeyHandler, true);
      this._ihHubKeyHandler = null;
    }
    const button = document.getElementById('bubble-js-link');
    if (button) button.setAttribute('aria-expanded', 'false');
    if (restoreFocus !== false && this._ihHubReturnFocus && this._ihHubReturnFocus.isConnected) {
      this._ihHubReturnFocus.focus();
    }
    if (restoreFocus !== false) this._ihHubReturnFocus = null;
    this._ihHubSourceElement = null;
  };

  proto.toggleJsLinkMenu = function () {
    const selected = this.app && this.app.selectedElement;
    if (!selected) {
      if (typeof this.showToastNotice === 'function') this.showToastNotice('اختر عنصرًا أولًا لبدء التفاعل');
      return;
    }
    this.openInteractionHub({ modal: true, sourceElement: selected });
  };

  proto.launchInteractionStarter = function (starterId) {
    const source = this.getInteractionHubSource();
    const returnFocus = this._ihHubReturnFocus || document.activeElement;
    this.closeInteractionHubModal(false);
    this.captureInteractionReturnFocus(returnFocus);

    if (RECIPE_IDS.has(starterId)) {
      if (!source) {
        this.showToastNotice('اختر عنصرًا من المعاينة أولًا');
        return;
      }
      /* توحيد المسارين: الفكرة الجاهزة تفتح المعالج المبسّط نفسه بحقول معبّأة،
         بدل القفز إلى المنشئ المتقدم. المتقدم يبقى خيارًا من زر «أدوات متقدمة». */
      const sourceId = this.ensureInteractionHubElementId(source);
      const sourceTag = source.tagName ? source.tagName.toLowerCase() : '';
      const sourceIsField = isFieldElement(source);
      const canvasItems = typeof this.getAllCanvasElements === 'function' ? this.getAllCanvasElements() : [];
      const findCanvasId = predicate => {
        const item = canvasItems.find(entry => entry && entry.element && entry.element.id !== sourceId && predicate(entry.element));
        return item ? this.ensureInteractionHubElementId(item.element) : '';
      };
      const needsField = starterId === 'inputText' || starterId === 'taskList';
      const fieldId = needsField ? (sourceIsField ? sourceId : findCanvasId(isFieldElement)) : '';
      const listId = starterId === 'taskList'
        ? (findCanvasId(element => ['ul', 'ol'].includes(element.tagName.toLowerCase())) || sourceId)
        : '';
      const draft = hubCore.buildStarterDraft(starterId, {
        sourceId,
        sourceTag,
        sourceIsField,
        fieldId,
        listId,
        displayId: starterId === 'inputText'
          ? (sourceIsField ? findCanvasId(element => ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'div'].includes(element.tagName.toLowerCase())) || sourceId : sourceId)
          : sourceId,
        toggleId: sourceId
      }, visualCore);
      if (!draft) {
        this.showToastNotice('تعذّر تجهيز الفكرة الجاهزة.');
        return;
      }
      this.openCustomInteractionBuilder({ existing: draft, isNewDraft: true, sourceElement: source });
      return;
    }

    if (COMPONENT_IDS.has(starterId)) {
      this.visualLinkDraft = {};
      this.initializeComponentDraft(starterId);
      if (source) {
        const sourceId = this.ensureInteractionHubElementId(source);
        if (starterId === 'accordion' && this.visualLinkDraft.items[0]) {
          this.visualLinkDraft.items[0].triggerId = sourceId;
        } else if (starterId === 'tabs' && this.visualLinkDraft.items[0]) {
          this.visualLinkDraft.items[0].tabId = sourceId;
        } else if (starterId === 'modal' || starterId === 'sidebar') {
          this.visualLinkDraft.openTriggers = [{ id: sourceId, selector: '' }];
        } else if (starterId === 'dropdown') {
          this.visualLinkDraft.triggerDescriptor = { id: sourceId, selector: '' };
        }
      }
      const componentDraft = visualCore.clone(this.visualLinkDraft);
      this.visualLinkDraft = null;
      this.compCurrentStep = 1;
      this._ihSuppressFocusRestore = true;
      originalOpenVisualLinkPopup.call(this, null, componentDraft);
      this._ihSuppressFocusRestore = false;
      if (this.activeVisualLink) this.activeVisualLink.existingId = null;
      const deleteButton = document.getElementById('e1-delete');
      if (deleteButton) deleteButton.remove();
      const saveButton = document.getElementById('e1-save');
      if (saveButton) saveButton.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> حفظ المكوّن';
      this.enhanceInteractionDialog();
    }
  };

  proto.findInteractionHubItem = function (id, kind) {
    return this.getInteractionHubItems().find(item => item.id === id && (!kind || item.kind === kind));
  };

  proto.canUseBeginnerInteractionEditor = function (definition) {
    if (!definition || definition.builderMode !== 'general') return false;
    if ((definition.functions || []).length) return false;
    if ((definition.advancedOperations || []).length || String(definition.customLogic || '').trim()) return false;

    const actions = (definition.actions || []).filter(action => action && action.enabled !== false);
    if (!actions.length) return false;
    const reads = (definition.reads || []).filter(read => read && read.enabled !== false);
    const readNames = new Set(reads.map(read => read.name));

    if (!actions.every(action => {
      const meta = ACTIONS[action.type];
      if (!meta || action.type === 'custom') return false;
      /* إجراء بلا قيمة (امسح الحقل، أظهر…): نوع القيمة غير مهم */
      if (!meta.requiresValue) return true;
      /* القيمة إمّا نص ثابت أو «ما يكتبه المستخدم في حقل» (قراءة معروفة) */
      return !action.valueType || action.valueType === 'literal'
        || (action.valueType === 'expression' && readNames.has(String(action.value || '').trim()));
    })) return false;
    if (actions.some(action => {
      const kind = action.target && action.target.kind;
      return kind && !['source', 'target', 'element', 'parent', 'firstChild'].includes(kind);
    })) return false;

    /* المتغيرات مقبولة فقط إذا كانت هي نفسها التي تولّدها إجراءات العدادات تلقائيًا */
    const stateList = (definition.state || definition.variables || []).filter(variable => variable && variable.enabled !== false);
    if (stateList.length) {
      const autoNames = new Set(
        hubCore.collectHubAutoVariables(actions, visualCore, stateList).map(variable => variable.name)
      );
      if (!stateList.every(variable => autoNames.has(variable.name))) return false;
    }

    /* القراءات: قراءة قيمة حقل أو نص عنصر، وكل قراءة لها استخدام فعلي */
    if (reads.length > 3) return false;
    if (!reads.every(read => ['inputValue', 'innerText', 'textareaValue', 'selectValue'].includes(read.type) && read.elementId)) return false;
    const conditions = (definition.conditions || []).filter(condition => condition && condition.enabled !== false);
    if (conditions.length > 1) return false;
    const usedNames = new Set(
      actions
        .filter(action => action.valueType === 'expression')
        .map(action => String(action.value || '').trim())
    );
    if (conditions.length) {
      const condition = conditions[0];
      if (condition.operator !== 'notEmpty' || String(condition.right || '') !== '') return false;
      if (!readNames.has(condition.left)) return false;
      usedNames.add(condition.left);
    }
    if (!reads.every(read => usedNames.has(read.name))) return false;
    return true;
  };

  proto.handleInteractionHubItem = function (id, kind, action) {
    const item = this.findInteractionHubItem(id, kind);
    if (!item) return;
    if (action === 'delete') {
      const label = item.kind === 'component' ? 'المكوّن' : 'التفاعل';
      if (!root.confirm(`هل تريد حذف ${label} نهائيًا؟`)) return;
      const hubRoot = document.getElementById('js-interaction-hub-modal-content')
        || document.getElementById('js-interaction-hub');
      const rows = hubRoot ? Array.from(hubRoot.querySelectorAll('[data-ih-item-id]')) : [];
      const rowIndex = rows.findIndex(row => row.dataset.ihItemId === item.id && row.dataset.ihItemKind === item.kind);
      this.deleteInteractionHubItem(item);
      this.renderInteractionHub();
      this.focusInteractionHubAfterMutation(hubRoot, rowIndex);
      return;
    }
    if (action === 'locate') {
      this.locateInteractionHubItem(item);
      return;
    }

    const returnFocus = this._ihHubReturnFocus || document.activeElement;
    this.closeInteractionHubModal(false);
    this.captureInteractionReturnFocus(returnFocus);
    if (item.kind === 'component') {
      this.openComponentPopup(item.raw);
      if (action === 'try') this.tryVisualLinkFromPopup();
    } else if (item.kind === 'legacy') {
      const definition = hubCore.mapLegacyInteraction(item.raw, visualCore);
      this.openCustomInteractionBuilder({ existing: definition, legacyInteraction: item.raw });
      if (action === 'try') this.tryVisualLinkFromPopup();
    } else {
      if (this.canUseBeginnerInteractionEditor(item.raw)) {
        this.openCustomInteractionBuilder({ existing: item.raw });
      } else {
        this.openVisualLinkPopup(null, item.raw);
        this.showToastNotice('هذا التفاعل يستخدم إعدادات متقدمة؛ فُتح في المنشئ الكامل للحفاظ عليها.');
      }
      if (action === 'try') this.tryVisualLinkFromPopup();
    }
  };

  proto.focusInteractionHubAfterMutation = function (hubRoot, preferredRowIndex) {
    root.setTimeout(() => {
      const targetRoot = hubRoot && hubRoot.isConnected
        ? hubRoot
        : (document.getElementById('js-interaction-hub-modal-content') || document.getElementById('js-interaction-hub'));
      if (!targetRoot) return;
      const rows = Array.from(targetRoot.querySelectorAll('[data-ih-item-id]'));
      const index = Math.max(0, Math.min(Number.isFinite(preferredRowIndex) ? preferredRowIndex : 0, rows.length - 1));
      const next = rows[index] && rows[index].querySelector('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      const fallback = targetRoot.querySelector('[data-ih-search], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (next) next.focus();
      else if (fallback) fallback.focus();
    }, 0);
  };

  proto.deleteInteractionHubItem = function (item) {
    if (!item) return false;
    if (item.kind === 'legacy') {
      this.deleteInteraction(item.id);
      return true;
    }
    if (item.kind === 'component') {
      originalDeleteVisualLink.call(this, item.id);
      return true;
    }

    const componentCollision = typeof this.parseComponents === 'function'
      && this.parseComponents().some(component => component.id === item.id);
    if (!componentCollision) {
      originalDeleteVisualLink.call(this, item.id);
      return true;
    }

    const match = this.parseVisualLinks().find(link => (
      link.id === item.id
      && (!Number.isFinite(item.raw && item.raw.startIndex) || link.startIndex === item.raw.startIndex)
    )) || item.raw;
    if (!match || !Number.isFinite(match.startIndex) || !Number.isFinite(match.endIndex)) return false;

    if (typeof this.flushPendingHistoryBeforeVisualLink === 'function') this.flushPendingHistoryBeforeVisualLink();
    const current = String(this.customJS || '');
    const newline = current.includes('\r\n') ? '\r\n' : '\n';
    const lines = current.split(/\r?\n/);
    lines.splice(match.startIndex, match.endIndex - match.startIndex + 1);
    this.customJS = lines.join(newline);
    if (this.currentLanguage === 'js' && this.textarea) {
      this.textarea.value = this.customJS;
      if (typeof this.updateLineNumbers === 'function') this.updateLineNumbers();
    }
    if (typeof this.releaseTransientVisualLinkIds === 'function') this.releaseTransientVisualLinkIds();
    if (this.app && typeof this.app.saveProgress === 'function') this.app.saveProgress(false);
    if (this.app && this.app.history && typeof this.app.history.saveState === 'function') {
      this.app.history.saveState('Delete Visual Link E1');
    }
    delete this.hiddenLinkArrows[item.id];
    if (this.activeVisualLink && this.activeVisualLink.existingId === item.id) {
      this.closeVisualLinkPopup({ keepTransient: true });
    }
    this.renderVisualLinksDashboard();
    if (typeof this.scanAndRenderVariables === 'function') this.scanAndRenderVariables();
    this.showToastNotice('تم حذف التفاعل');
    return true;
  };

  proto.locateInteractionHubItem = function (item) {
    if (item.kind === 'component' && typeof this.getComponentManagementInfo === 'function') {
      const info = this.getComponentManagementInfo(item.raw);
      delete this.hiddenLinkArrows[item.id];
      if (info.descriptor && typeof this.showComponentElement === 'function') this.showComponentElement(info.descriptor);
      this.updateVisualLinkArrows();
      return;
    }
    const id = (item.sourceIds || []).find(value => document.getElementById(value))
      || (item.targetIds || []).find(value => document.getElementById(value));
    if (!id) {
      this.showToastNotice('تعذر العثور على عناصر هذا التفاعل في الصفحة الحالية');
      return;
    }
    this.closeInteractionHubModal(false);
    this.focusElementByIdE1(id);
  };

  proto.getInteractionElementOptions = function (sourceId) {
    const values = typeof this.getAllCanvasElements === 'function' ? this.getAllCanvasElements() : [];
    const seen = new Set();
    const options = [];
    this._ihElementChoiceMap = new Map();
    values.forEach((item, index) => {
      if (!item || !item.element) return;
      const friendly = elementLabel(item.element);
      const technical = elementTechnicalName(item.element);
      if (item.id) {
        if (seen.has(item.id)) return;
        seen.add(item.id);
        options.push({
          id: item.id,
          choice: item.id,
          label: friendly,
          technical,
          isField: isFieldElement(item.element),
          temporary: false
        });
        return;
      }
      const choice = `new:${index}`;
      this._ihElementChoiceMap.set(choice, item.element);
      options.push({
        id: '',
        choice,
        label: friendly,
        technical,
        isField: isFieldElement(item.element),
        temporary: true
      });
    });
    if (sourceId && !seen.has(sourceId)) {
      const element = document.getElementById(sourceId);
      options.unshift({
        id: sourceId,
        choice: sourceId,
        label: elementLabel(element),
        technical: elementTechnicalName(element),
        isField: isFieldElement(element),
        temporary: false
      });
    }
    /* اسمان ودّيان متطابقان؟ أضف المعرّف التقني للتفريق بينهما فقط عند الحاجة */
    const labelCounts = options.reduce((counts, item) => {
      counts[item.label] = (counts[item.label] || 0) + 1;
      return counts;
    }, {});
    options.forEach(item => {
      if (labelCounts[item.label] > 1 && item.technical) item.label = `${item.label} — ${item.technical}`;
      if (item.temporary) item.label = `${item.label} (سيُنشأ له معرّف عند الحفظ)`;
    });
    return options;
  };

  proto.resolveInteractionElementChoice = function (choice) {
    const value = String(choice || '');
    if (!value.startsWith('new:')) return value;
    const element = this._ihElementChoiceMap && this._ihElementChoiceMap.get(value);
    return element ? this.ensureInteractionHubElementId(element) : '';
  };

  proto.pruneUnusedInteractionHubIds = function () {
    if (!Array.isArray(this._vlTransientElementIds) || !this._vlTransientElementIds.length) return;
    let serializedDraft = '';
    try { serializedDraft = JSON.stringify(this.visualLinkDraft || {}); } catch (error) { serializedDraft = ''; }
    this._vlTransientElementIds = this._vlTransientElementIds.filter(entry => {
      const referenced = serializedDraft.includes(`"${entry.id}"`) || String(this.customJS || '').includes(`"${entry.id}"`) || String(this.customJS || '').includes(`'${entry.id}'`);
      if (!referenced && entry.element && entry.element.id === entry.id) entry.element.removeAttribute('id');
      return referenced;
    });
  };

  proto.commitTransientVisualLinkIds = function () {
    this.pruneUnusedInteractionHubIds();
    if (typeof originalCommitTransientVisualLinkIds === 'function') {
      return originalCommitTransientVisualLinkIds.call(this);
    }
    this._vlTransientElementIds = [];
    return undefined;
  };

  proto.createHubAction = function (type, sourceId, index) {
    const meta = actionMeta(type);
    const target = targetFromChoice('source', sourceId);
    const params = {};
    if (type === 'toggleVisibility') Object.assign(params, { method: 'hidden', className: 'open' });
    if (type === 'show') params.display = 'block';
    if (['addClass', 'removeClass', 'toggleClass'].includes(type)) params.className = meta.defaultValue;
    return visualCore.normalizeAction({
      id: visualCore.makeId('action'),
      type,
      targetId: target.targetId,
      target: target.target,
      value: meta.defaultValue,
      valueType: 'literal',
      params,
      enabled: true,
      order: index
    }, index, sourceId);
  };

  proto.openCustomInteractionBuilder = function (options) {
    const settings = options || {};
    const requestedSource = settings.sourceElement || (this.app && this.app.selectedElement);
    if (!settings.existing && !requestedSource) {
      this.showToastNotice('اختر عنصرًا من المعاينة أولًا');
      return;
    }
    const returnFocus = this._ihHubReturnFocus || this._ihReturnFocus || document.activeElement;
    this.closeInteractionHubModal(false);
    this._ihSuppressFocusRestore = true;
    this.closeVisualLinkPopup({ keepTransient: true });
    this._ihSuppressFocusRestore = false;
    this.captureInteractionReturnFocus(returnFocus);

    let definition;
    if (settings.existing) {
      definition = visualCore.normalizeDefinition(visualCore.clone(settings.existing));
    } else {
      const source = requestedSource;
      const sourceId = this.ensureInteractionHubElementId(source);
      definition = visualCore.createDefinition(sourceId, sourceId, null, 'general');
      definition.event = defaultEventFor(source);
      definition.actions = [this.createHubAction('setText', sourceId, 0)];
      definition.settings = Object.assign({}, definition.settings || {}, { entry: 'interaction-hub' });
    }

    if (!definition.actions || !definition.actions.length) {
      definition.actions = [this.createHubAction('setText', definition.sourceId, 0)];
    }
    this.visualLinkDraft = definition;
    this.activeVisualLink = {
      existingId: settings.legacyInteraction
        ? settings.legacyInteraction.id
        : (settings.existing && !settings.legacyInteraction && !settings.isNewDraft ? definition.id : null),
      draftId: definition.id,
      sourceId: definition.sourceId,
      targetId: definition.targetId,
      legacyInteraction: settings.legacyInteraction || null
    };
    this.e1PendingVariableRenames = [];
    this.e12RawVariableNames = Object.create(null);
    this.e12RawFunctionNames = Object.create(null);
    this._ihBuilderStep = 1;
    this._ihBuilderError = null;
    this._ihConditionEnabled = !!(definition.conditions && definition.conditions.length);

    const overlay = document.createElement('div');
    overlay.id = 'vl-popup-overlay';
    overlay.className = 'ih-overlay';
    overlay.innerHTML = '<div class="ih-dialog" id="ih-custom-dialog" role="dialog" aria-modal="true" aria-labelledby="ih-custom-title"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('mousedown', event => {
      if (event.target === overlay) this.closeVisualLinkPopup();
    });
    this.bindCustomInteractionBuilder(overlay);
    this.renderCustomInteractionBuilder();
    this.updateVisualLinkArrows();
  };

  proto.bindCustomInteractionBuilder = function (overlay) {
    overlay.addEventListener('input', event => {
      if (!event.target.closest('#ih-custom-dialog')) return;
      this.syncCustomInteractionBuilder(false);
      /* الجملة الحية أعلى المعالج تتحدث مع كل حرف — تغذية فورية بلا إعادة رسم */
      const liveSummary = document.getElementById('ih-live-summary-text');
      if (liveSummary && this.visualLinkDraft) {
        liveSummary.textContent = this.getCustomInteractionSummary(this.visualLinkDraft);
      }
    });
    overlay.addEventListener('change', event => {
      if (!event.target.closest('#ih-custom-dialog')) return;
      this._ihBuilderFocusRequest = this.describeCustomBuilderFocus(event.target);
      this.syncCustomInteractionBuilder(true);
      this.renderCustomInteractionBuilder();
    });
    overlay.addEventListener('click', event => {
      const command = event.target.closest('[data-ih-builder-command]');
      if (!command) return;
      const action = command.dataset.ihBuilderCommand;
      if (action === 'close' || action === 'cancel') {
        this.closeVisualLinkPopup();
      } else if (action === 'next') {
        this.moveCustomInteractionBuilder(1);
      } else if (action === 'prev') {
        this.moveCustomInteractionBuilder(-1);
      } else if (action === 'step') {
        const targetStep = Number(command.dataset.step);
        if (targetStep <= this._ihBuilderStep || this.validateCustomInteractionStep(this._ihBuilderStep)) {
          this._ihBuilderStep = Math.max(1, Math.min(3, targetStep));
          this._ihBuilderError = null;
          this._ihBuilderHasFocused = false;
          this.renderCustomInteractionBuilder();
        }
      } else if (action === 'add-action') {
        this.syncCustomInteractionBuilder(false);
        this.visualLinkDraft.actions.push(this.createHubAction('setText', this.visualLinkDraft.sourceId, this.visualLinkDraft.actions.length));
        this._ihBuilderFocusRequest = { className: 'ih-action-type', actionIndex: String(this.visualLinkDraft.actions.length - 1) };
        this.renderCustomInteractionBuilder();
      } else if (action === 'remove-action') {
        this.syncCustomInteractionBuilder(false);
        const index = Number(command.dataset.actionIndex);
        if (this.visualLinkDraft.actions.length > 1) this.visualLinkDraft.actions.splice(index, 1);
        this._ihBuilderFocusRequest = { command: 'add-action', actionIndex: '', step: '' };
        this.renderCustomInteractionBuilder();
      } else if (action === 'try') {
        this.syncCustomInteractionBuilder(false);
        if (this.validateCustomInteractionStep(1) && this.validateCustomInteractionStep(2)) this.tryVisualLinkFromPopup();
        else this.renderCustomInteractionBuilder();
      } else if (action === 'save') {
        this.syncCustomInteractionBuilder(false);
        if (this.validateCustomInteractionStep(1) && this.validateCustomInteractionStep(2)) this.saveVisualLinkFromPopup();
        else this.renderCustomInteractionBuilder();
      } else if (action === 'advanced') {
        this.syncCustomInteractionBuilder(false);
        this.openAdvancedInteractionBuilder(this.visualLinkDraft, this.activeVisualLink);
      }
    });

    this._ihBuilderKeyHandler = event => {
      if (!document.getElementById('ih-custom-dialog')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (document.getElementById('vl-trial-overlay')) this.closeVisualLinkTrial();
        else this.closeVisualLinkPopup();
        return;
      }
      if (event.key !== 'Tab') return;
      if (document.getElementById('vl-trial-overlay')) return;
      const dialog = document.getElementById('ih-custom-dialog');
      const focusables = visibleFocusable(dialog);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!overlay.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', this._ihBuilderKeyHandler, true);
  };

  proto.renderCustomInteractionBuilder = function () {
    const dialog = document.getElementById('ih-custom-dialog');
    if (!dialog || !this.visualLinkDraft) return;
    const draft = this.visualLinkDraft;
    const step = this._ihBuilderStep || 1;
    const sourceElement = document.getElementById(draft.sourceId);
    const elementOptions = this.getInteractionElementOptions(draft.sourceId);
    const suggestedEvent = defaultEventFor(sourceElement);
    const existing = !!(this.activeVisualLink && this.activeVisualLink.existingId);
    const legacy = !!(this.activeVisualLink && this.activeVisualLink.legacyInteraction);

    const sourceOptions = elementOptions.map(item => `<option value="${esc(item.choice)}"${selectedValue(item.id, draft.sourceId)}>${esc(item.label)}</option>`).join('');
    const hasVisibleEvent = EVENT_OPTIONS.some(([value]) => value === draft.event);
    const preservedEventOption = hasVisibleEvent ? '' : `<option value="${esc(draft.event)}" selected>حدث محفوظ: ${esc(draft.event)} — عدّله من الأدوات المتقدمة</option>`;
    const eventOptions = preservedEventOption + EVENT_OPTIONS.map(([value, label]) => `<option value="${value}"${selectedValue(value, draft.event)}>${esc(label)}${value === suggestedEvent ? ' — مقترح' : ''}</option>`).join('');
    const targetOptions = action => {
      const current = actionTargetChoice(action, draft.sourceId);
      const currentId = current.startsWith('id:') ? current.slice(3) : '';
      const currentExistsInOptions = currentId && elementOptions.some(item => item.id === currentId);
      const missingOption = currentId && !currentExistsInOptions
        ? `<option value="${esc(current)}" selected>عنصر مفقود: #${esc(currentId)} — اختر بديلًا أو أعد العنصر</option>`
        : '';
      return `${missingOption}<option value="source"${selectedValue('source', current)}>نفس العنصر الذي يبدأ التفاعل</option>
        <option value="parent"${selectedValue('parent', current)}>العنصر الأب المباشر</option>
        <option value="firstChild"${selectedValue('firstChild', current)}>أول عنصر بداخله</option>
        ${elementOptions.filter(item => item.id !== draft.sourceId).map(item => `<option value="${item.temporary ? esc(item.choice) : `id:${esc(item.id)}`}"${selectedValue(`id:${item.id}`, current)}>${esc(item.label)}</option>`).join('')}`;
    };
    const actionOptions = action => Object.entries(ACTIONS)
      .filter(([value, meta]) => !meta.advancedOnly || value === action.type)
      .map(([value, meta]) => `<option value="${value}"${selectedValue(value, action.type)}>${esc(meta.label)}</option>`)
      .join('');
    const fieldChoices = elementOptions.filter(item => item.isField);
    const renderValueField = (action, meta, index) => {
      if (!meta.requiresValue) return '';
      const currentFieldId = actionFieldElementId(action, draft);
      const valueError = this._ihBuilderError && this._ihBuilderError.field === `action-value-${index}` ? ' aria-invalid="true"' : '';
      const sourcePicker = meta.supportsFieldValue && fieldChoices.length
        ? `<select class="ih-action-value-source" data-action-index="${index}" aria-label="من أين تأتي القيمة؟"><option value="static"${currentFieldId ? '' : ' selected'}>نص ثابت أكتبه بنفسي</option>${fieldChoices.map(item => `<option value="field:${esc(item.choice)}"${currentFieldId && item.id && item.id === currentFieldId ? ' selected' : ''}>ما يكتبه المستخدم في: ${esc(item.label)}</option>`).join('')}</select>`
        : '';
      const control = currentFieldId
        ? '<small class="ih-field-note"><i class="fas fa-link" aria-hidden="true"></i> القيمة تُقرأ من الحقل لحظة تنفيذ التفاعل.</small>'
        : `<input id="ih-action-value-${index}" class="ih-action-value" data-action-index="${index}" value="${esc(actionValue(action))}" placeholder="${esc(meta.placeholder)}"${valueError}>`;
      return `<label class="ih-field"><span class="ih-field-label">${esc(meta.valueLabel)}</span>${sourcePicker}${control}</label>`;
    };
    const actionRows = (draft.actions || []).map((action, index) => {
      const meta = actionMeta(action.type);
      return `<section class="ih-expand-card" data-ih-action-row="${index}">
        <summary><span><i class="fas ${esc(meta.icon)}" aria-hidden="true"></i> الإجراء ${index + 1}: ${esc(meta.label)}</span></summary>
        <div class="ih-field-row">
          <label class="ih-field"><span class="ih-field-label">ماذا سيحدث؟</span><select class="ih-action-type" data-action-index="${index}">${actionOptions(action)}</select></label>
          ${meta.targetless ? '<div class="ih-field"><span class="ih-field-label">الهدف</span><small>هذا الإجراء يعرض الرسالة مباشرة ولا يحتاج عنصرًا مستهدفًا.</small></div>' : `<label class="ih-field"><span class="ih-field-label">على أي عنصر؟</span><select id="ih-action-target-${index}" class="ih-action-target" data-action-index="${index}"${this._ihBuilderError && this._ihBuilderError.field === `action-target-${index}` ? ' aria-invalid="true"' : ''}>${targetOptions(action)}</select></label>`}
        </div>
        ${renderValueField(action, meta, index)}
        ${index ? `<button type="button" class="btn btn-secondary" data-ih-builder-command="remove-action" data-action-index="${index}"><i class="fas fa-trash" aria-hidden="true"></i> حذف هذا الإجراء</button>` : ''}
      </section>`;
    }).join('');

    const activeCondition = (draft.conditions || []).find(condition => condition && condition.enabled !== false);
    const conditionRead = activeCondition ? (draft.reads || []).find(read => read.name === activeCondition.left) : null;
    const conditionElement = (conditionRead && document.getElementById(conditionRead.elementId)) || sourceElement;
    const conditionLabel = elementReadableType(conditionElement) === 'inputValue'
      ? `نفّذ فقط عندما لا يكون «${elementLabel(conditionElement)}» فارغًا`
      : `نفّذ فقط عندما لا يكون نص «${elementLabel(conditionElement)}» فارغًا`;
    const summary = this.getCustomInteractionSummary(draft);
    const validationMarkup = this._ihBuilderError ? `<div class="ih-validation" id="vl-validation-errors" role="alert"><i class="fas fa-circle-exclamation" aria-hidden="true"></i><span>${esc(this._ihBuilderError.message)}</span></div>` : '<div class="ih-validation" id="vl-validation-errors" role="alert"></div>';

    let panel = '';
    if (step === 1) {
      panel = `<section class="ih-step-panel" data-step-panel="1">
        <h2>متى يبدأ التفاعل؟</h2><p>العنصر المحدد مرّرناه لك تلقائيًا، واقترحنا الحدث الأنسب لنوعه.</p>
        <label class="ih-field"><span class="ih-field-label">العنصر الذي يبدأ التفاعل</span><select id="ih-source-select"${this._ihBuilderError && this._ihBuilderError.field === 'source' ? ' aria-invalid="true"' : ''}>${sourceOptions}</select><small>يمكنك تغيير العنصر إلى أي عنصر لديه ID في الصفحة.</small></label>
        <label class="ih-field"><span class="ih-field-label">متى يبدأ؟</span><select id="ih-event-select"${this._ihBuilderError && this._ihBuilderError.field === 'event' ? ' aria-invalid="true"' : ''}>${eventOptions}</select><small>الاقتراح الحالي: ${esc(EVENT_LABELS[suggestedEvent] || suggestedEvent)}.</small></label>
        ${validationMarkup}
      </section>`;
    } else if (step === 2) {
      panel = `<section class="ih-step-panel" data-step-panel="2">
        <h2>ماذا سيحدث؟</h2><p>ابدأ بإجراء واحد واضح، ثم أضف إجراءً آخر أو شرطًا إذا احتجت.</p>
        ${actionRows}
        <div class="ih-inline-actions"><button type="button" class="btn btn-secondary" data-ih-builder-command="add-action"><i class="fas fa-plus" aria-hidden="true"></i> أضف إجراءً آخر</button></div>
        <details class="ih-expand-card"${this._ihConditionEnabled ? ' open' : ''}>
          <summary><span><i class="fas fa-code-branch" aria-hidden="true"></i> نفّذ فقط لو… <small>(اختياري)</small></span></summary>
          <label class="ih-field"><span class="ih-field-label">${esc(conditionLabel)}</span><span><input type="checkbox" id="ih-condition-enabled"${checked(this._ihConditionEnabled)}> تفعيل الشرط</span><small>كل ما يلزم يُجهَّز تلقائيًا خلف الكواليس؛ لا إعدادات إضافية.</small></label>
        </details>
        ${validationMarkup}
      </section>`;
    } else {
      panel = `<section class="ih-step-panel" data-step-panel="3">
        <h2>جرّب وراجع</h2><p>التجربة تعمل داخل صفحة معزولة ولا تحفظ أي شيء حتى تضغط «حفظ».</p>
        <div class="ih-summary"><h3>ملخص التفاعل</h3><p>${esc(summary)}</p><ul>${(draft.actions || []).map((action, index) => `<li>الإجراء ${index + 1}: ${esc(this.describeHubActionPhrase(action, draft))}</li>`).join('')}</ul>${this._ihConditionEnabled ? `<p><i class="fas fa-code-branch" aria-hidden="true"></i> ${esc(conditionLabel)}.</p>` : ''}</div>
        <div class="ih-validation success" data-state="success"><i class="fas fa-shield-halved" aria-hidden="true"></i><span>لن يتغير HTML أو JavaScript أو سجل التغييرات أثناء التجربة. تُثبّت المعرّفات المؤقتة عند الحفظ فقط.</span></div>
        <div class="ih-inline-actions"><button type="button" class="btn btn-secondary" data-ih-builder-command="try"><i class="fas fa-play" aria-hidden="true"></i> جرّب الآن</button><button type="button" class="btn btn-secondary" data-ih-builder-command="advanced"><i class="fas fa-screwdriver-wrench" aria-hidden="true"></i> أدوات متقدمة</button></div>
        ${legacy ? '<div class="ih-validation warning"><i class="fas fa-box-archive" aria-hidden="true"></i><span>هذا تفاعل قديم. لن يتحول إلى الصيغة الحديثة إلا عند الضغط على «حفظ التعديل».</span></div>' : ''}
        ${validationMarkup}
      </section>`;
    }

    const starterTitle = draft.settings && draft.settings.starter && !existing ? 'أكمل الفكرة الجاهزة' : null;
    dialog.innerHTML = `<header class="ih-dialog-header">
      <div><h1 class="ih-dialog-title" id="ih-custom-title"><i class="fas fa-route" aria-hidden="true"></i> ${starterTitle || (existing ? 'تعديل التفاعل' : 'ابنِ تفاعلًا خاصًا')}${legacy ? ' <span class="ih-kind-badge legacy">قديم</span>' : ''}</h1><div class="ih-source-context"><span>يبدأ من:</span><strong title="${esc(elementTechnicalName(sourceElement) || '#' + draft.sourceId)}">${esc(elementLabel(sourceElement))}</strong></div></div>
      <button type="button" class="btn btn-secondary" data-ih-builder-command="close" aria-label="إغلاق المنشئ"><i class="fas fa-xmark" aria-hidden="true"></i></button>
    </header>
    <nav class="ih-stepper" aria-label="خطوات إنشاء التفاعل">
      ${[['1', 'متى يبدأ؟'], ['2', 'ماذا سيحدث؟'], ['3', 'جرّب وراجع']].map(([number, label]) => `<button type="button" class="ih-step-tab${step === Number(number) ? ' active' : ''}" data-ih-builder-command="step" data-step="${number}" aria-current="${step === Number(number) ? 'step' : 'false'}"><span class="ih-step-number">${number}</span><strong>${label}</strong></button>`).join('')}
    </nav>
    <div class="ih-live-summary" aria-live="polite"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i><span id="ih-live-summary-text">${esc(summary)}</span></div>
    <div class="ih-dialog-body">${panel}</div>
    <footer class="ih-dialog-footer">
      ${step > 1 ? '<button type="button" class="btn btn-secondary" data-ih-builder-command="prev"><i class="fas fa-arrow-right" aria-hidden="true"></i> السابق</button>' : ''}
      <button type="button" class="btn btn-secondary" data-ih-builder-command="cancel">إلغاء</button>
      ${step < 3 ? '<button type="button" class="btn btn-secondary" data-ih-builder-command="try"><i class="fas fa-play" aria-hidden="true"></i> جرّب الآن</button>' : ''}
      <span class="ih-dialog-spacer"></span>
      ${step < 3 ? '<button type="button" class="btn btn-primary" data-ih-builder-command="next">التالي <i class="fas fa-arrow-left" aria-hidden="true"></i></button>' : `<button type="button" class="btn btn-primary" data-ih-builder-command="save"><i class="fas fa-save" aria-hidden="true"></i> ${existing ? 'حفظ التعديل' : 'حفظ التفاعل'}</button>`}
    </footer>`;

    const requestedFocus = this.resolveCustomBuilderFocus(this._ihBuilderFocusRequest);
    this._ihBuilderFocusRequest = null;
    const first = dialog.querySelector('[aria-invalid="true"]') || dialog.querySelector('.ih-step-panel input, .ih-step-panel select, .ih-step-panel button');
    if (requestedFocus) {
      requestedFocus.focus();
      this._ihBuilderHasFocused = true;
    } else if (first && !this._ihBuilderHasFocused) {
      first.focus();
      this._ihBuilderHasFocused = true;
    }
  };

  proto.syncCustomInteractionBuilder = function (rerendering) {
    const dialog = document.getElementById('ih-custom-dialog');
    const draft = this.visualLinkDraft;
    if (!dialog || !draft) return;

    const sourceSelect = dialog.querySelector('#ih-source-select');
    const eventSelect = dialog.querySelector('#ih-event-select');
    if (sourceSelect) {
      const sourceId = this.resolveInteractionElementChoice(sourceSelect.value);
      if (sourceId) {
        draft.sourceId = sourceId;
        if (!draft.targetId) draft.targetId = sourceId;
      }
    }
    if (eventSelect) draft.event = eventSelect.value;

    /* المسح الأول: نقرأ الصفوف كما هي، ثم نبني القراءات والإجراءات معًا
       حتى تكون «قيمة من حقل» مربوطة بقراءة حقيقية يفهمها المحرك. */
    const specs = [];
    dialog.querySelectorAll('[data-ih-action-row]').forEach((row, index) => {
      const previous = draft.actions[index] || this.createHubAction('setText', draft.sourceId, index);
      const typeField = row.querySelector('.ih-action-type');
      const targetField = row.querySelector('.ih-action-target');
      const valueField = row.querySelector('.ih-action-value');
      const valueSourceField = row.querySelector('.ih-action-value-source');
      const type = typeField ? typeField.value : previous.type;
      const meta = actionMeta(type);
      const typeChanged = type !== previous.type;
      let targetChoice = targetField ? targetField.value : actionTargetChoice(previous, draft.sourceId);
      if (String(targetChoice).startsWith('new:')) {
        const targetId = this.resolveInteractionElementChoice(targetChoice);
        targetChoice = targetId ? `id:${targetId}` : 'source';
      }
      let fieldElementId = '';
      if (meta.supportsFieldValue && !typeChanged) {
        const requested = valueSourceField ? valueSourceField.value : (actionFieldElementId(previous, draft) ? `field:${actionFieldElementId(previous, draft)}` : 'static');
        if (String(requested).startsWith('field:')) {
          fieldElementId = this.resolveInteractionElementChoice(String(requested).slice(6)) || '';
        }
      }
      let rawValue;
      if (typeChanged) rawValue = meta.defaultValue;
      else if (valueField) rawValue = valueField.value;
      else if (previous.valueType === 'expression') rawValue = meta.defaultValue;
      else rawValue = actionValue(previous);
      specs.push({ previous, type, meta, targetChoice, rawValue, fieldElementId, index });
    });

    const sourceElement = document.getElementById(draft.sourceId);
    const conditionToggle = dialog.querySelector('#ih-condition-enabled');
    if (conditionToggle) this._ihConditionEnabled = conditionToggle.checked;

    /* القراءات المُدارة: قراءة لكل حقل مستخدم كقيمة + قراءة الشرط عند تفعيله */
    const managedReads = new Map();
    const addFieldRead = elementId => {
      const name = elementId === draft.sourceId
        ? (elementReadableType(document.getElementById(elementId)) === 'inputValue' ? 'sourceValue' : 'sourceText')
        : hubCore.fieldReadName(elementId, draft.sourceId, visualCore);
      const type = elementId === draft.sourceId
        ? elementReadableType(document.getElementById(elementId))
        : 'inputValue';
      const id = hubCore.fieldReadId(elementId, draft.sourceId);
      if (!managedReads.has(id)) managedReads.set(id, { id, type, elementId, name });
      return managedReads.get(id).name;
    };

    const fieldIds = specs.map(spec => spec.fieldElementId).filter(Boolean);
    const conditionElementId = this._ihConditionEnabled
      ? (fieldIds.includes(draft.sourceId) ? draft.sourceId : (fieldIds[0] || draft.sourceId))
      : '';
    let conditionReadName = '';
    if (conditionElementId) conditionReadName = addFieldRead(conditionElementId);

    const actions = specs.map(spec => {
      const { previous, type, meta, targetChoice, rawValue, fieldElementId, index } = spec;
      const target = targetFromChoice(targetChoice, draft.sourceId);
      const params = Object.assign({}, previous.params || {});
      if (type !== previous.type) {
        Object.keys(params).forEach(key => delete params[key]);
      }
      if (type === 'toggleVisibility') Object.assign(params, { method: params.method || 'hidden', className: params.className || 'open' });
      if (type === 'show') params.display = params.display || 'block';
      if (['addClass', 'removeClass', 'toggleClass'].includes(type)) params.className = rawValue || meta.defaultValue;
      if (type === 'toggleBoolean') {
        params.variableName = visualCore.safeIdentifier(params.variableName || 'menuOpen', 'menuOpen');
        params.className = rawValue || meta.defaultValue;
      }
      if (type === 'incrementVariable' || type === 'decrementVariable') {
        params.variableName = visualCore.safeIdentifier(params.variableName || 'counter', 'counter');
        params.step = String(Number(rawValue) > 0 ? Number(rawValue) : 1);
        params.display = true;
      }
      if (type === 'appendListItem' && params.arrayName === undefined) params.arrayName = '';
      let value = rawValue;
      let valueType = 'literal';
      if (fieldElementId && meta.supportsFieldValue) {
        value = addFieldRead(fieldElementId);
        valueType = 'expression';
      }
      return visualCore.normalizeAction({
        id: previous.id || visualCore.makeId('action'),
        type,
        targetId: target.targetId,
        target: target.target,
        value,
        valueType,
        params,
        enabled: true,
        order: index
      }, index, draft.sourceId);
    });
    if (actions.length) draft.actions = actions;

    /* الشاشة البسيطة تدير القراءات والشروط والمتغيرات بالكامل — لا بقايا قديمة */
    draft.reads = Array.from(managedReads.values()).map((read, index) =>
      visualCore.normalizeRead({
        id: read.id,
        type: read.type,
        elementId: read.elementId,
        name: read.name,
        enabled: true,
        order: index
      }, index));
    draft.conditions = this._ihConditionEnabled && conditionReadName
      ? [visualCore.normalizeCondition({ id: 'hub-source-condition', left: conditionReadName, operator: 'notEmpty', right: '', enabled: true, order: 0 }, 0)]
      : [];
    draft.state = hubCore.collectHubAutoVariables(draft.actions, visualCore, draft.state || draft.variables || []);
    draft.targetId = (draft.actions || []).find(action => action.targetId)?.targetId || draft.sourceId;
    this.visualLinkDraft = visualCore.normalizeDefinition(draft);
    if (!rerendering) this._ihBuilderError = null;
    this.updateVisualLinkArrows();
  };

  proto.validateCustomInteractionStep = function (step) {
    const draft = this.visualLinkDraft;
    let error = null;
    if (!draft || !draft.sourceId || !document.getElementById(draft.sourceId)) {
      error = { field: 'source', message: 'اختر عنصرًا موجودًا يبدأ منه التفاعل.' };
    } else if (step === 1 && !draft.event) {
      error = { field: 'event', message: 'اختر متى يبدأ التفاعل.' };
    } else if (step >= 2) {
      if (!draft.actions || !draft.actions.length) {
        error = { field: 'actions', message: 'أضف إجراءً واحدًا على الأقل.' };
      } else {
        draft.actions.some((action, index) => {
          const meta = actionMeta(action.type);
          const target = action.target || {};
          if (!meta.targetless && action.targetId && !document.getElementById(action.targetId)) {
            error = { field: `action-target-${index}`, message: `العنصر المستهدف في الإجراء ${index + 1} غير موجود.` };
            return true;
          }
          if (!meta.targetless && target.kind === 'parent') {
            const source = document.getElementById(draft.sourceId);
            if (!source || !source.parentElement || source.parentElement === this.app.canvas) {
              error = { field: `action-target-${index}`, message: `العنصر المصدر لا يملك عنصرًا أبًا صالحًا للإجراء ${index + 1}.` };
              return true;
            }
          }
          if (!meta.targetless && target.kind === 'firstChild') {
            const source = document.getElementById(draft.sourceId);
            if (!source || !source.firstElementChild) {
              error = { field: `action-target-${index}`, message: `العنصر المصدر لا يحتوي عنصرًا داخليًا للإجراء ${index + 1}.` };
              return true;
            }
          }
          if (meta.requiresValue && !actionValue(action).trim()) {
            error = { field: `action-value-${index}`, message: `أكمل قيمة الإجراء ${index + 1}: ${meta.valueLabel}.` };
            return true;
          }
          return false;
        });
      }
    }
    this._ihBuilderError = error;
    return !error;
  };

  proto.moveCustomInteractionBuilder = function (direction) {
    this.syncCustomInteractionBuilder(false);
    const current = this._ihBuilderStep || 1;
    if (direction > 0 && !this.validateCustomInteractionStep(current)) {
      this._ihBuilderHasFocused = false;
      this.renderCustomInteractionBuilder();
      const invalid = document.querySelector('#ih-custom-dialog [aria-invalid="true"]');
      if (invalid) invalid.focus();
      return;
    }
    this._ihBuilderStep = Math.max(1, Math.min(3, current + direction));
    this._ihBuilderError = null;
    this._ihBuilderHasFocused = false;
    this.renderCustomInteractionBuilder();
  };

  /* جملة عربية واحدة لكل إجراء: «أضف ما كُتب في الحقل إلى القائمة» */
  proto.describeHubActionPhrase = function (action, draft) {
    const meta = actionMeta(action.type);
    const target = action.target || {};
    let targetLabel;
    if (target.kind === 'parent') targetLabel = 'العنصر الأب';
    else if (target.kind === 'firstChild') targetLabel = 'أول عنصر بداخله';
    else {
      const id = action.targetId || target.id;
      if (!id || id === draft.sourceId) targetLabel = 'العنصر نفسه';
      else {
        const element = document.getElementById(id);
        targetLabel = element ? `«${elementLabel(element)}»` : `العنصر #${id}`;
      }
    }
    const fieldId = actionFieldElementId(action, draft);
    const fieldElement = fieldId ? document.getElementById(fieldId) : null;
    const fieldLabel = fieldElement ? `«${elementLabel(fieldElement)}»` : 'الحقل';
    const value = actionValue(action);
    switch (action.type) {
      case 'setText': return fieldId ? `اعرض ما يكتبه المستخدم في ${targetLabel}` : `غيّر نص ${targetLabel} إلى «${value}»`;
      case 'setInputValue': return fieldId ? `انقل قيمة ${fieldLabel} إلى ${targetLabel}` : `اجعل قيمة ${targetLabel} «${value}»`;
      case 'appendListItem': return fieldId ? `أضف ما كُتب في ${fieldLabel} إلى ${targetLabel}` : `أضف سطرًا جديدًا إلى ${targetLabel}`;
      case 'clearInput': return `امسح ${targetLabel}`;
      case 'toggleVisibility': return `افتح أو أغلق ${targetLabel}`;
      case 'show': return `أظهر ${targetLabel}`;
      case 'hide': return `أخفِ ${targetLabel}`;
      case 'setColor': return `غيّر لون نص ${targetLabel}`;
      case 'addClass': return `أضف حالة «${value}» إلى ${targetLabel}`;
      case 'removeClass': return `أزل حالة «${value}» من ${targetLabel}`;
      case 'toggleClass': return `بدّل حالة «${value}» على ${targetLabel}`;
      case 'incrementVariable': return `زد العداد واعرضه في ${targetLabel}`;
      case 'decrementVariable': return `أنقص العداد واعرضه في ${targetLabel}`;
      case 'toggleBoolean': return `بدّل فتح/إغلاق ${targetLabel}`;
      case 'alert': return `اعرض رسالة «${value}»`;
      default: return meta.label;
    }
  };

  proto.getCustomInteractionSummary = function (draft) {
    return hubCore.summarizeDefinition(draft, {
      eventLabels: EVENT_LABELS,
      labelFor: id => {
        const element = id ? document.getElementById(id) : null;
        return element ? `«${elementLabel(element)}»` : 'العنصر المحدد';
      },
      actionPhrase: action => this.describeHubActionPhrase(action, draft),
      conditionPhrase: condition => {
        const read = (draft.reads || []).find(item => item.name === condition.left);
        const element = read ? document.getElementById(read.elementId) : null;
        return element ? `فقط إذا لم يكن «${elementLabel(element)}» فارغًا` : 'فقط إذا لم تكن القيمة فارغة';
      }
    });
  };

  proto.openAdvancedInteractionBuilder = function (draft, active) {
    const definition = visualCore.clone(draft || this.visualLinkDraft);
    const activeState = active ? Object.assign({}, active) : (this.activeVisualLink ? Object.assign({}, this.activeVisualLink) : null);
    if (!definition) {
      const source = this.getInteractionHubSource();
      if (!source) {
        this.showToastNotice('اختر عنصرًا أولًا');
        return;
      }
      this.closeInteractionHubModal(false);
      this.captureInteractionReturnFocus(this._ihHubReturnFocus || document.activeElement);
      this.openVisualLinkPopup({ sourceId: this.ensureInteractionHubElementId(source), entry: 'general', step: 1 });
      return;
    }

    this._ihSuppressFocusRestore = true;
    this.closeVisualLinkPopup({ keepTransient: true });
    originalOpenVisualLinkPopup.call(this, null, definition);
    this._ihSuppressFocusRestore = false;
    this.visualLinkDraft = definition;
    if (activeState) this.activeVisualLink = activeState;
    this.e1CurrentStep = 1;
    this.e1AdvancedTabsOpen = true;
    this.renderE1Builder();
    this.enhanceInteractionDialog();
  };

  proto.enhanceInteractionDialog = function () {
    const overlay = document.getElementById('vl-popup-overlay');
    const dialog = overlay && overlay.querySelector('[role="dialog"]');
    if (!overlay || !dialog || dialog.id === 'ih-custom-dialog') return;
    const title = dialog.querySelector('.vl-popup-title');
    if (title) {
      title.id = title.id || 'osoos-interaction-dialog-title';
      dialog.setAttribute('aria-labelledby', title.id);
    }
    if (dialog.dataset.ihFocusTrap !== 'true') {
      dialog.dataset.ihFocusTrap = 'true';
      overlay.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const focusables = visibleFocusable(dialog);
        if (!focusables.length) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }
    const first = dialog.querySelector('#e1-close') || visibleFocusable(dialog)[0];
    if (first) first.focus();
  };

  proto.enhanceInteractionTrial = function () {
    const overlay = document.getElementById('vl-trial-overlay');
    if (!overlay) return;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const title = overlay.querySelector('.vl-trial-title');
    if (title) {
      title.id = title.id || 'osoos-interaction-trial-title';
      overlay.setAttribute('aria-labelledby', title.id);
    } else {
      overlay.setAttribute('aria-label', 'تجربة التفاعل المعزولة');
    }
    const save = overlay.querySelector('#e1-trial-save');
    if (save) {
      save.addEventListener('click', () => {
        this._ihTrialSkipRestore = true;
      }, true);
    }
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.closeVisualLinkTrial();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = visibleFocusable(overlay);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    const first = overlay.querySelector('#e1-trial-edit, #e1-trial-cancel, button');
    if (first) first.focus();
  };

  proto.tryVisualLinkFromPopup = function () {
    if (typeof originalTryVisualLinkFromPopup !== 'function') return undefined;
    this._ihTrialReturnFocus = document.activeElement;
    this._ihTrialReturnFocusDescriptor = this.describeCustomBuilderFocus(document.activeElement);
    this._ihOpeningTrial = true;
    const result = originalTryVisualLinkFromPopup.call(this);
    this._ihOpeningTrial = false;
    if (document.getElementById('vl-trial-overlay')) {
      this.enhanceInteractionTrial();
    } else {
      this._ihTrialReturnFocus = null;
      this._ihTrialReturnFocusDescriptor = null;
    }
    return result;
  };

  proto.closeVisualLinkTrial = function () {
    const returnTarget = this._ihTrialReturnFocus;
    const returnDescriptor = this._ihTrialReturnFocusDescriptor;
    const shouldRestore = !this._ihOpeningTrial && !this._ihTrialSkipRestore;
    const result = typeof originalCloseVisualLinkTrial === 'function'
      ? originalCloseVisualLinkTrial.call(this)
      : undefined;
    this._ihTrialReturnFocus = null;
    this._ihTrialReturnFocusDescriptor = null;
    this._ihTrialSkipRestore = false;
    if (shouldRestore) {
      root.setTimeout(() => {
        const target = returnTarget && returnTarget.isConnected
          ? returnTarget
          : this.resolveCustomBuilderFocus(returnDescriptor);
        if (target && typeof target.focus === 'function') target.focus();
      }, 0);
    }
    return result;
  };

  proto.openVisualLinkPopup = function (seed, existing) {
    if (!this._ihReturnFocus) this.captureInteractionReturnFocus(document.activeElement);
    this._ihSuppressFocusRestore = true;
    originalOpenVisualLinkPopup.call(this, seed, existing);
    this._ihSuppressFocusRestore = false;
    this.enhanceInteractionDialog();
  };

  proto.openComponentPopup = function (component) {
    if (typeof originalOpenComponentPopup !== 'function') return undefined;
    this._ihSuppressFocusRestore = true;
    const result = originalOpenComponentPopup.call(this, component);
    this._ihSuppressFocusRestore = false;
    this.enhanceInteractionDialog();
    return result;
  };

  proto.closeVisualLinkPopup = function (options) {
    const restoreTarget = this._ihReturnFocus;
    const restoreDescriptor = this._ihReturnFocusDescriptor;
    if (this._ihBuilderKeyHandler) {
      document.removeEventListener('keydown', this._ihBuilderKeyHandler, true);
      this._ihBuilderKeyHandler = null;
    }
    originalCloseVisualLinkPopup.call(this, options);
    this._ihBuilderStep = null;
    this._ihBuilderError = null;
    this._ihBuilderHasFocused = false;
    this._ihConditionEnabled = false;
    if (!this._ihSuppressFocusRestore) {
      this._ihReturnFocus = null;
      this._ihReturnFocusDescriptor = null;
      this._ihHubReturnFocus = null;
      this.renderInteractionHub();
      root.setTimeout(() => {
        const target = this.resolveInteractionReturnFocus(restoreTarget, restoreDescriptor);
        if (target && typeof target.focus === 'function') target.focus();
      }, 0);
    }
  };

  proto.validateE1Draft = function () {
    const result = typeof originalValidateE1Draft === 'function'
      ? originalValidateE1Draft.call(this)
      : visualCore.validateDefinition(this.visualLinkDraft);
    const legacy = this.activeVisualLink && this.activeVisualLink.legacyInteraction;
    if (!legacy) return result;
    const current = this.parseInteractions().find(item => item.id === legacy.id);
    if (current && Number.isFinite(current.startIndex) && Number.isFinite(current.endIndex)) return result;
    const message = 'تعذر العثور على كتلة التفاعل القديم داخل JavaScript. لم يُحفظ شيء؛ أعد فتح التفاعل ثم حاول مرة أخرى.';
    if (!Array.isArray(result.errors)) result.errors = [];
    if (!result.errors.includes(message)) result.errors.push(message);
    result.valid = false;
    const holder = document.getElementById('vl-validation-errors');
    if (holder) {
      holder.classList.add('visible');
      holder.innerHTML = result.errors.map(error => `<div><i class="fas fa-circle-exclamation" aria-hidden="true"></i> ${esc(error)}</div>`).join('');
    }
    return result;
  };

  proto.composeVisualLinkDraftJS = function (definition) {
    const legacy = this.activeVisualLink && this.activeVisualLink.legacyInteraction;
    const wrapped = visualCore.generateBlock(definition);
    const newline = String(this.customJS || '').includes('\r\n') ? '\r\n' : '\n';
    if (!legacy) {
      const existingId = this.activeVisualLink && this.activeVisualLink.existingId;
      const existing = existingId ? this.parseVisualLinks().find(link => link.id === existingId) : null;
      if (!existing) {
        const current = String(this.customJS || '');
        const separator = current && !/[\r\n]$/.test(current) ? newline : '';
        return `${current}${separator}${wrapped.split('\n').join(newline)}${newline}`;
      }
      const lines = String(this.customJS || '').split(/\r?\n/);
      lines.splice(existing.startIndex, existing.endIndex - existing.startIndex + 1, ...wrapped.split('\n'));
      return lines.join(newline);
    }
    const latest = this.parseInteractions().find(item => item.id === legacy.id) || legacy;
    if (!Number.isFinite(latest.startIndex) || !Number.isFinite(latest.endIndex)) {
      throw new Error('Legacy interaction markers are missing; refusing to append a duplicate visual link.');
    }
    const lines = this.customJS.split(/\r?\n/);
    lines.splice(latest.startIndex, latest.endIndex - latest.startIndex + 1, ...wrapped.split('\n'));
    return lines.join(newline);
  };

  proto.deleteVisualLink = function (id) {
    const legacy = id && this.parseInteractions().find(item => item.id === id);
    const hasModern = id && this.parseVisualLinks().some(item => item.id === id);
    const hasComponent = id && typeof this.parseComponents === 'function' && this.parseComponents().some(item => item.id === id);
    const activeLegacy = this.activeVisualLink && this.activeVisualLink.legacyInteraction
      && this.activeVisualLink.legacyInteraction.id === id;
    if (legacy && (activeLegacy || (!hasModern && !hasComponent))) {
      this.deleteInteraction(id);
      if (this.activeVisualLink && this.activeVisualLink.existingId === id) this.closeVisualLinkPopup({ keepTransient: true });
      this.renderInteractionHub();
      return;
    }
    originalDeleteVisualLink.call(this, id);
    this.renderInteractionHub();
  };

  proto.renderVisualLinksDashboard = function () {
    const result = originalRenderVisualLinksDashboard ? originalRenderVisualLinksDashboard.call(this) : undefined;
    this.renderInteractionHub();
    return result;
  };

  proto.setupVisualLinks = function () {
    const result = originalSetupVisualLinks ? originalSetupVisualLinks.call(this) : undefined;
    this.setupInteractionHub();
    return result;
  };

  root.OsoosInteractionHub = Object.freeze({
    open(editor, options) {
      if (editor && typeof editor.openInteractionHub === 'function') editor.openInteractionHub(options);
    },
    search: hubCore.searchCatalog,
    catalog: hubCore.CATALOG || hubCore.STARTER_CATALOG
  });
})(typeof window !== 'undefined' ? window : globalThis);
