/* Osoos Interaction Hub - pure catalog and compatibility helpers.
 *
 * The browser UI consumes this module through window.OsoosInteractionHubCore,
 * while the Node test suite requires the same API through CommonJS.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OsoosInteractionHubCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const STARTER_CATALOG = Object.freeze([
    starter({
      id: 'inputText',
      kind: 'recipe',
      title: 'اكتب في حقل واعرض النص',
      description: 'اعرض ما يكتبه الزائر داخل عنصر آخر فورًا.',
      icon: 'fas fa-i-cursor',
      keywords: [
        'input', 'text', 'field', 'value', 'typing', 'write', 'display', 'output',
        'إدخال', 'حقل', 'كتابة', 'اكتب', 'نص', 'اعرض', 'قيمة'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'taskList',
      kind: 'recipe',
      title: 'اكتب مهمة وأضفها إلى قائمة',
      description: 'حوّل النص المكتوب إلى عنصر جديد في قائمة المهام.',
      icon: 'fas fa-list-check',
      keywords: [
        'task', 'todo', 'list', 'item', 'add', 'input', 'tasks',
        'مهمة', 'مهام', 'قائمة', 'عنصر', 'أضف', 'اضف', 'إضافة'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'hamburger',
      kind: 'recipe',
      title: 'افتح وأغلق قائمة الهاتف',
      description: 'بدّل حالة قائمة التنقل عند الضغط على زر القائمة.',
      icon: 'fas fa-bars',
      keywords: [
        'hamburger', 'menu', 'mobile', 'navigation', 'navbar', 'toggle', 'class',
        'قائمة', 'هاتف', 'موبايل', 'تنقل', 'افتح', 'أغلق', 'زر'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'openClose',
      kind: 'recipe',
      title: 'أظهر عنصرًا وأخفِه',
      description: 'افتح أو أغلق أي جزء من الصفحة بضغطة واحدة.',
      icon: 'fas fa-eye',
      keywords: [
        'open', 'close', 'show', 'hide', 'visible', 'visibility', 'toggle',
        'فتح', 'إغلاق', 'اظهر', 'أظهر', 'إظهار', 'اخف', 'أخف', 'إخفاء',
        'ظهور', 'اختفاء', 'عرض'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'counter',
      kind: 'recipe',
      title: 'أنشئ عدّادًا يزيد أو ينقص',
      description: 'غيّر رقمًا مع كل ضغطة واعرض النتيجة تلقائيًا.',
      icon: 'fas fa-calculator',
      keywords: [
        'counter', 'count', 'number', 'increment', 'decrement', 'plus', 'minus',
        'عداد', 'عدّاد', 'رقم', 'زيادة', 'نقصان', 'زائد', 'ناقص'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'accordion',
      kind: 'component',
      title: 'رتّب المحتوى في أقسام قابلة للفتح',
      description: 'اعرض سؤالًا أو عنوانًا، وافتح المحتوى المرتبط به عند الضغط.',
      icon: 'fas fa-list-ul',
      keywords: [
        'accordion', 'faq', 'collapse', 'expand', 'question', 'answer',
        'أكورديون', 'اسئلة', 'أسئلة', 'سؤال', 'جواب', 'فتح', 'طي'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'tabs',
      kind: 'component',
      title: 'قسّم المحتوى إلى تبويبات',
      description: 'اعرض قسمًا واحدًا في كل مرة وانتقل بين الأقسام بسهولة.',
      icon: 'fas fa-table-columns',
      keywords: [
        'tabs', 'tab', 'panels', 'sections', 'switch',
        'تبويبات', 'تبويب', 'أقسام', 'اقسام', 'لوحات', 'تنقل'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'modal',
      kind: 'component',
      title: 'اعرض نافذة منبثقة',
      description: 'افتح محتوى مهمًا فوق الصفحة مع وسائل إغلاق واضحة.',
      icon: 'fas fa-window-maximize',
      keywords: [
        'modal', 'popup', 'dialog', 'overlay', 'window',
        'نافذة', 'منبثقة', 'حوار', 'طبقة', 'رسالة', 'تأكيد'
      ],
      difficulty: 'متوسط'
    }),
    starter({
      id: 'dropdown',
      kind: 'component',
      title: 'أنشئ قائمة منسدلة',
      description: 'أظهر مجموعة خيارات صغيرة أسفل زر أو عنصر تحكّم.',
      icon: 'fas fa-caret-square-down',
      keywords: [
        'dropdown', 'menu', 'options', 'select', 'account',
        'قائمة', 'منسدلة', 'خيارات', 'اختيار', 'حساب'
      ],
      difficulty: 'سهل'
    }),
    starter({
      id: 'sidebar',
      kind: 'component',
      title: 'افتح قائمة جانبية',
      description: 'اعرض لوحة للتنقل أو الأدوات من جانب الصفحة.',
      icon: 'fas fa-columns',
      keywords: [
        'sidebar', 'drawer', 'offcanvas', 'side', 'menu', 'navigation',
        'جانبية', 'درج', 'لوحة', 'قائمة', 'تنقل', 'أدوات'
      ],
      difficulty: 'متوسط'
    })
  ]);

  validateStarterCatalog(STARTER_CATALOG);

  const EVENT_LABELS = Object.freeze({
    click: 'النقر',
    input: 'الكتابة',
    change: 'تغيير القيمة',
    submit: 'إرسال النموذج',
    mouseenter: 'دخول المؤشر',
    mouseleave: 'خروج المؤشر',
    focus: 'التركيز',
    blur: 'فقدان التركيز',
    keydown: 'ضغط مفتاح',
    keyup: 'رفع مفتاح',
    load: 'تحميل الصفحة',
    dblclick: 'النقر المزدوج',
    contextmenu: 'فتح القائمة السياقية',
    scroll: 'التمرير',
    resize: 'تغيير الحجم',
    dragstart: 'بدء السحب',
    dragend: 'انتهاء السحب',
    touchstart: 'بدء اللمس',
    touchend: 'انتهاء اللمس',
    animationend: 'انتهاء الحركة',
    transitionend: 'انتهاء الانتقال',
    custom: 'حدث مخصّص'
  });

  const ACTION_LABELS = Object.freeze({
    custom: 'تشغيل كود مخصّص',
    hide: 'إخفاء العنصر',
    show: 'إظهار العنصر',
    text: 'تغيير النص',
    setText: 'تغيير النص',
    color: 'تغيير لون النص',
    setColor: 'تغيير لون النص',
    addclass: 'إضافة Class',
    addClass: 'إضافة Class',
    removeclass: 'إزالة Class',
    removeClass: 'إزالة Class',
    toggleclass: 'تبديل Class',
    toggleClass: 'تبديل Class',
    alert: 'عرض تنبيه'
  });

  const SUPPORTED_EVENTS = Object.freeze([
    'click', 'input', 'change', 'submit', 'mouseenter', 'mouseleave', 'focus',
    'blur', 'keydown', 'load', 'dblclick', 'contextmenu', 'keyup', 'scroll',
    'resize', 'dragstart', 'dragend', 'touchstart', 'touchend',
    'animationend', 'transitionend', 'custom'
  ]);

  function starter(value) {
    const item = Object.assign({}, value, {
      type: value.id,
      validated: true,
      keywords: Object.freeze(value.keywords.slice())
    });
    if (value.kind === 'recipe') item.recipeType = value.id;
    if (value.kind === 'component') item.componentType = value.id;
    return Object.freeze(item);
  }

  function validateStarterCatalog(catalog) {
    const expected = [
      'recipe:inputText', 'recipe:taskList', 'recipe:hamburger',
      'recipe:openClose', 'recipe:counter', 'component:accordion',
      'component:tabs', 'component:modal', 'component:dropdown',
      'component:sidebar'
    ];
    if (!Array.isArray(catalog) || catalog.length !== expected.length) {
      throw new Error('Interaction Hub starter catalog must contain exactly 10 items.');
    }
    const actual = catalog.map(item => `${item.kind}:${item.id}`);
    expected.forEach((key, index) => {
      const item = catalog[index];
      if (actual[index] !== key) throw new Error(`Invalid Interaction Hub starter at index ${index}.`);
      if (!item.title || !item.description || !item.icon || !item.difficulty) {
        throw new Error(`Interaction Hub starter "${item.id}" is missing required content.`);
      }
      if (!/^fa[srbld]?\s+fa-/.test(item.icon) || !Array.isArray(item.keywords) || !item.keywords.length) {
        throw new Error(`Interaction Hub starter "${item.id}" has invalid discovery metadata.`);
      }
    });
    return true;
  }

  function normalizeSearchText(value) {
    let normalized = value === undefined || value === null ? '' : String(value);
    normalized = normalized.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    if (typeof normalized.normalize === 'function') normalized = normalized.normalize('NFKD');
    return normalized
      .toLowerCase()
      .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, '')
      .replace(/\u0640/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/[ؤ]/g, 'و')
      .replace(/[ئىي]/g, 'ي')
      .replace(/[ةۀ]/g, 'ه')
      .replace(/[ک]/g, 'ك')
      .replace(/[گ]/g, 'ج')
      .replace(/[پ]/g, 'ب')
      .replace(/[چ]/g, 'ج')
      .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function searchCatalog(query, catalog) {
    const source = Array.isArray(catalog) ? catalog : STARTER_CATALOG;
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return source.slice();
    const queryTokens = normalizedQuery.split(' ').filter(Boolean);

    return source.filter(item => {
      if (!item || typeof item !== 'object') return false;
      const searchable = normalizeSearchText([
        item.id,
        item.type,
        item.kind,
        item.title,
        item.description,
        item.difficulty,
        Array.isArray(item.keywords) ? item.keywords.join(' ') : item.keywords
      ].join(' '));
      const words = searchable.split(' ');
      return queryTokens.every(token => tokenMatches(token, searchable, words));
    });
  }

  function tokenMatches(token, searchable, words) {
    const variants = [token];
    if (/[\u0600-\u06ff]/.test(token)) {
      if (token.startsWith('و') && token.length > 3) variants.push(token.slice(1));
      if (token.startsWith('ال') && token.length > 4) variants.push(token.slice(2));
      if (token.startsWith('وال') && token.length > 5) variants.push(token.slice(3));
    } else {
      if (token.length > 3 && token.endsWith('s')) variants.push(token.slice(0, -1));
      if (token.length > 4 && token.endsWith('es')) variants.push(token.slice(0, -2));
    }
    return variants.some(variant => (
      searchable.indexOf(variant) >= 0
      || words.some(word => (
        word.length > 2
        && variant.length > 2
        && (word.startsWith(variant) || variant.startsWith(word))
      ))
    ));
  }

  function createUnifiedItems(input, componentItems, legacyItems) {
    let modernLinks;
    let components;
    let legacyInteractions;

    if (Array.isArray(input)) {
      modernLinks = input;
      components = Array.isArray(componentItems) ? componentItems : [];
      legacyInteractions = Array.isArray(legacyItems) ? legacyItems : [];
    } else {
      const values = input && typeof input === 'object' ? input : {};
      modernLinks = Array.isArray(values.modernLinks)
        ? values.modernLinks
        : (Array.isArray(values.links) ? values.links : []);
      components = Array.isArray(values.components) ? values.components : [];
      legacyInteractions = Array.isArray(values.legacyInteractions) ? values.legacyInteractions : [];
    }

    return modernLinks.map(normalizeModernItem)
      .concat(components.map(normalizeComponentItem))
      .concat(legacyInteractions.map(normalizeLegacyItem));
  }

  function normalizeModernItem(link, index) {
    const raw = link;
    const wrappedDefinition = link && (link.definition || link.metadata);
    const definition = wrappedDefinition && typeof wrappedDefinition === 'object'
      ? wrappedDefinition
      : objectValue(link);
    const recipe = catalogItem(definition.recipeType, 'recipe');
    const settings = objectValue(definition.settings);
    const sourceIds = uniqueIds(arrayValue(definition.sourceIds).concat([definition.sourceId]));
    const targetIds = uniqueIds(arrayValue(definition.targetIds).concat(
      [definition.targetId],
      collectActionTargetIds(definition.actions)
    ));
    const title = firstText(
      definition.title,
      settings.title,
      settings.name,
      recipe && recipe.title,
      `تفاعل عند ${eventLabel(definition.event)}`
    );
    const actionSummary = actionListSummary(definition.actions);
    const sourceSummary = sourceIds.length ? ` على #${sourceIds.join(' و#')}` : '';
    const summary = firstText(
      definition.summary,
      settings.summary,
      actionSummary
        ? `عند ${eventLabel(definition.event)}${sourceSummary}: ${actionSummary}.`
        : `تفاعل يبدأ عند ${eventLabel(definition.event)}${sourceSummary}.`
    );
    return {
      kind: 'modern',
      id: firstText(definition.id, `modern-${index + 1}`),
      title,
      summary,
      sourceIds,
      targetIds,
      raw
    };
  }

  function normalizeComponentItem(component, index) {
    const raw = component;
    const metadata = objectValue(component && component.metadata);
    const definition = Object.keys(metadata).length ? metadata : objectValue(component);
    const componentType = firstText(
      definition.componentType,
      component && component.componentType,
      definition.type
    );
    const catalogEntry = catalogItem(componentType, 'component');
    const settings = objectValue(definition.settings);
    const ids = componentRelationshipIds(definition, componentType);
    const title = firstText(
      definition.title,
      settings.title,
      catalogEntry && catalogEntry.title,
      'مكوّن تفاعلي'
    );
    const summary = firstText(
      definition.summary,
      definition.description,
      catalogEntry && catalogEntry.description,
      'مكوّن تفاعلي جاهز.'
    );
    return {
      kind: 'component',
      id: firstText(component && component.id, definition.id, `component-${index + 1}`),
      title,
      summary,
      sourceIds: ids.sourceIds,
      targetIds: ids.targetIds,
      raw
    };
  }

  function normalizeLegacyItem(interaction, index) {
    const raw = interaction;
    const value = objectValue(interaction);
    const sourceIds = uniqueIds(arrayValue(value.sourceIds).concat([value.sourceId]));
    const targetIds = uniqueIds(arrayValue(value.targetIds).concat([value.targetId]));
    if (!targetIds.length && ['same', 'parent', 'child'].includes(normalizeSearchText(value.targetType))) {
      targetIds.push.apply(targetIds, sourceIds);
    }
    const sourceSummary = sourceIds.length ? ` على #${sourceIds.join(' و#')}` : '';
    return {
      kind: 'legacy',
      id: firstText(value.id, `legacy-${index + 1}`),
      title: firstText(value.title, 'تفاعل قديم'),
      summary: firstText(
        value.summary,
        `عند ${eventLabel(value.event)}${sourceSummary}: ${actionLabel(value.action)}.`
      ),
      sourceIds,
      targetIds,
      raw
    };
  }

  function componentRelationshipIds(definition, componentType) {
    const sourceIds = arrayValue(definition.sourceIds);
    const targetIds = arrayValue(definition.targetIds);
    const items = Array.isArray(definition.items) ? definition.items : [];

    if (componentType === 'accordion') {
      items.forEach(item => {
        sourceIds.push(item && item.triggerId);
        targetIds.push(item && item.contentId);
      });
    } else if (componentType === 'tabs') {
      items.forEach(item => {
        sourceIds.push(item && item.tabId);
        targetIds.push(item && item.panelId);
      });
    } else if (componentType === 'modal') {
      descriptorIds(definition.openTriggers).forEach(id => sourceIds.push(id));
      descriptorIds(definition.closeTriggers).forEach(id => sourceIds.push(id));
      descriptorIds(definition.modalDescriptor).forEach(id => targetIds.push(id));
      descriptorIds(definition.overlayDescriptor).forEach(id => targetIds.push(id));
    } else if (componentType === 'dropdown') {
      descriptorIds(definition.triggerDescriptor).forEach(id => sourceIds.push(id));
      descriptorIds(definition.menuDescriptor).forEach(id => targetIds.push(id));
      descriptorIds(definition.wrapperDescriptor).forEach(id => targetIds.push(id));
      descriptorIds(definition.itemDescriptors).forEach(id => targetIds.push(id));
    } else if (componentType === 'sidebar') {
      descriptorIds(definition.openTriggers).forEach(id => sourceIds.push(id));
      descriptorIds(definition.closeTriggers).forEach(id => sourceIds.push(id));
      descriptorIds(definition.sidebarDescriptor).forEach(id => targetIds.push(id));
      descriptorIds(definition.overlayDescriptor).forEach(id => targetIds.push(id));
      descriptorIds(definition.navItemDescriptors).forEach(id => targetIds.push(id));
    }

    return {
      sourceIds: uniqueIds(sourceIds),
      targetIds: uniqueIds(targetIds)
    };
  }

  function descriptorIds(value) {
    const descriptors = Array.isArray(value) ? value : [value];
    const result = [];
    descriptors.forEach(descriptor => {
      if (typeof descriptor === 'string') result.push(descriptor);
      else if (descriptor && typeof descriptor === 'object') result.push(descriptor.id);
    });
    return uniqueIds(result);
  }

  function collectActionTargetIds(actions) {
    const ids = [];
    (Array.isArray(actions) ? actions : []).forEach(action => {
      if (!action || typeof action !== 'object') return;
      ids.push(action.targetId);
      if (action.target && action.target.kind === 'element') ids.push(action.target.id);
      if (Array.isArray(action.actions)) ids.push.apply(ids, collectActionTargetIds(action.actions));
      if (Array.isArray(action.branches)) {
        action.branches.forEach(branch => {
          ids.push.apply(ids, collectActionTargetIds(branch && branch.actions));
        });
      }
    });
    return uniqueIds(ids);
  }

  function actionListSummary(actions) {
    const labels = (Array.isArray(actions) ? actions : [])
      .filter(action => action && action.enabled !== false)
      .map(action => actionLabel(action.type));
    return labels.join(' ثم ');
  }

  function mapLegacyInteraction(interaction, visualLogicCore) {
    const source = objectValue(interaction);
    const core = visualLogicCore || (root && root.VisualLogicCore);
    const sourceId = firstText(source.sourceId);
    const legacyTargetId = firstText(source.targetId);
    const legacyId = firstText(source.id, 'legacy-interaction');
    const rawEvent = firstText(source.event, 'click');
    const availableEvents = core && Array.isArray(core.EVENT_TYPES) ? core.EVENT_TYPES : SUPPORTED_EVENTS;
    const event = availableEvents.indexOf(rawEvent) >= 0
      ? rawEvent
      : (availableEvents.indexOf('custom') >= 0 ? 'custom' : 'click');
    const target = mapLegacyTarget(source, sourceId, legacyTargetId);
    const settings = clonePlainObject(source.settings);
    settings.migratedFromLegacyInteraction = true;
    settings.legacyInteractionId = legacyId;
    settings.legacyTargetType = firstText(source.targetType, 'same');
    settings.legacyAction = firstText(source.action, 'custom');
    if (event === 'custom') {
      settings.eventSettings = Object.assign(
        {},
        clonePlainObject(settings.eventSettings),
        { eventName: rawEvent }
      );
    }

    let definition;
    if (core && typeof core.createDefinition === 'function') {
      definition = core.createDefinition(sourceId, legacyTargetId, legacyId, 'general');
    } else {
      definition = {
        schemaVersion: 10,
        id: legacyId,
        sourceId,
        targetId: legacyTargetId,
        event: 'click',
        builderMode: 'general',
        recipeType: '',
        reads: [],
        conditions: [],
        conditionGroups: [],
        actions: [],
        state: [],
        functions: [],
        advancedOperations: [],
        customLogic: '',
        settings: {}
      };
    }

    definition.schemaVersion = 10;
    definition.sourceId = sourceId;
    definition.targetId = legacyTargetId;
    definition.event = event;
    definition.builderMode = 'general';
    definition.recipeType = '';
    definition.actions = [mapLegacyAction(source, target, legacyId)];
    definition.settings = settings;

    if (core && typeof core.normalizeDefinition === 'function') {
      definition = core.normalizeDefinition(definition);
    }

    definition.schemaVersion = 10;
    definition.sourceId = sourceId;
    definition.targetId = legacyTargetId;
    definition.event = event;
    definition.settings = Object.assign({}, clonePlainObject(definition.settings), settings);
    definition.settings.migratedFromLegacyInteraction = true;
    return definition;
  }

  function mapLegacyTarget(interaction, sourceId, targetId) {
    const targetType = normalizeSearchText(interaction.targetType || 'same').replace(/\s/g, '');
    if (targetType === 'same' || targetType === 'source') {
      return {
        targetId: '',
        target: { kind: 'source', id: sourceId, selector: '', baseId: sourceId }
      };
    }
    if (targetType === 'parent') {
      return {
        targetId: '',
        target: { kind: 'parent', id: '', selector: '', baseId: sourceId }
      };
    }
    if (targetType === 'child' || targetType === 'firstchild') {
      return {
        targetId: '',
        target: { kind: 'firstChild', id: '', selector: '', baseId: sourceId }
      };
    }
    if (targetId) {
      return {
        targetId,
        target: { kind: 'element', id: targetId, selector: '', baseId: '' }
      };
    }
    return {
      targetId: '',
      target: { kind: 'source', id: sourceId, selector: '', baseId: sourceId }
    };
  }

  function mapLegacyAction(interaction, target, legacyId) {
    const actionName = normalizeSearchText(interaction.action || 'custom').replace(/\s/g, '');
    const param = interaction.param === undefined || interaction.param === null
      ? ''
      : String(interaction.param);
    let type = 'custom';
    let value = '';
    let params = {};

    if (actionName === 'hide') {
      type = 'hide';
    } else if (actionName === 'show') {
      type = 'show';
      params = { display: 'block' };
    } else if (actionName === 'text') {
      type = 'setText';
      value = param || 'نص جديد';
      params = { method: 'innerText' };
    } else if (actionName === 'color') {
      type = 'setColor';
      value = param || '#f59e0b';
    } else if (actionName === 'addclass') {
      type = 'addClass';
      params = { className: param || 'active-card' };
    } else if (actionName === 'removeclass') {
      type = 'removeClass';
      params = { className: param || 'active-card' };
    } else if (actionName === 'toggleclass') {
      type = 'toggleClass';
      params = { className: param || 'active-card' };
    } else if (actionName === 'alert') {
      type = 'alert';
      value = param || 'تنبيه!';
    } else {
      type = 'custom';
      value = actionName === 'custom'
        ? (param || 'console.log("تم تفعيل الحدث!");')
        : `// الإجراء القديم "${firstText(interaction.action, 'غير معروف')}" يحتاج مراجعة يدوية.`;
      params = { code: value };
    }

    return {
      id: `${legacyId}-action-1`,
      type,
      targetId: target.targetId,
      target: clonePlainObject(target.target),
      value,
      valueType: 'literal',
      valueSource: { kind: 'literal', value },
      params: clonePlainObject(params),
      settings: clonePlainObject(params),
      order: 0,
      enabled: true
    };
  }

  function catalogItem(id, kind) {
    return STARTER_CATALOG.find(item => item.id === id && (!kind || item.kind === kind)) || null;
  }

  function eventLabel(event) {
    const key = firstText(event, 'click');
    return EVENT_LABELS[key] || key;
  }

  function actionLabel(action) {
    const key = firstText(action, 'custom');
    return ACTION_LABELS[key] || key;
  }

  function arrayValue(value) {
    return Array.isArray(value) ? value.slice() : [];
  }

  function objectValue(value) {
    return value && typeof value === 'object' ? value : {};
  }

  function firstText() {
    for (let index = 0; index < arguments.length; index += 1) {
      const value = arguments[index];
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return '';
  }

  function uniqueIds(values) {
    const seen = Object.create(null);
    return (Array.isArray(values) ? values : []).reduce((result, value) => {
      const id = value === undefined || value === null ? '' : String(value).trim();
      if (!id || seen[id]) return result;
      seen[id] = true;
      result.push(id);
      return result;
    }, []);
  }

  function clonePlainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.keys(value).reduce((copy, key) => {
      const item = value[key];
      if (Array.isArray(item)) {
        copy[key] = item.map(entry => (
          entry && typeof entry === 'object' ? clonePlainObject(entry) : entry
        ));
      } else if (item && typeof item === 'object') {
        copy[key] = clonePlainObject(item);
      } else {
        copy[key] = item;
      }
      return copy;
    }, {});
  }

  /* ── أسماء ودّية للعناصر ──────────────────────────────────────────────
     غير المبرمج يقرأ «قائمة "المهام"» بارتياح، بينما ul#ul-b0n2wuff يخيفه.
     المعرّف التقني يبقى متاحًا في تلميح العنصر فقط. */
  const FRIENDLY_TAG_NAMES = Object.freeze({
    ul: 'قائمة', ol: 'قائمة مرقّمة', li: 'سطر في قائمة', button: 'زر',
    input: 'حقل إدخال', textarea: 'مساحة كتابة', select: 'قائمة اختيار',
    form: 'نموذج', a: 'رابط', img: 'صورة', p: 'فقرة', span: 'نص',
    div: 'حاوية', section: 'قسم', header: 'ترويسة', footer: 'تذييل',
    nav: 'شريط تنقّل', main: 'المحتوى الرئيسي', article: 'مقال',
    h1: 'عنوان رئيسي', h2: 'عنوان', h3: 'عنوان', h4: 'عنوان', h5: 'عنوان', h6: 'عنوان',
    label: 'تسمية حقل', table: 'جدول', video: 'فيديو', audio: 'صوت', canvas: 'لوحة رسم'
  });

  const FRIENDLY_INPUT_TYPES = Object.freeze({
    checkbox: 'مربع اختيار', radio: 'زر اختيار', number: 'حقل رقم',
    email: 'حقل بريد', password: 'حقل كلمة مرور', date: 'حقل تاريخ',
    color: 'منتقي لون', range: 'شريط تمرير', file: 'حقل ملف',
    button: 'زر', submit: 'زر إرسال', reset: 'زر مسح', search: 'حقل بحث'
  });

  /* يبني وصفًا خفيفًا من عنصر DOM (يمرَّر العنصر نفسه؛ لا استخدام لـ document) */
  function describeDomElement(element) {
    if (!element || !element.tagName) return null;
    const tag = String(element.tagName || '').toLowerCase();
    const attr = name => (typeof element.getAttribute === 'function' ? element.getAttribute(name) : null);
    return {
      tag,
      id: element.id || '',
      inputType: tag === 'input' ? String(element.type || attr('type') || '') : '',
      text: firstText(attr('aria-label'), tag === 'img' ? attr('alt') : element.textContent, attr('placeholder'), element.value)
    };
  }

  function friendlyElementLabel(descriptor) {
    const item = descriptor || {};
    const tag = String(item.tag || '').toLowerCase();
    const inputType = String(item.inputType || '').toLowerCase();
    let base = FRIENDLY_TAG_NAMES[tag] || (tag ? `عنصر ${tag}` : 'عنصر');
    if (tag === 'input' && FRIENDLY_INPUT_TYPES[inputType]) base = FRIENDLY_INPUT_TYPES[inputType];
    const text = firstText(item.text).replace(/\s+/g, ' ');
    const preview = text.length > 24 ? `${text.slice(0, 23)}…` : text;
    if (preview) return `${base} «${preview}»`;
    return item.id ? `${base} (#${item.id})` : base;
  }

  function technicalElementName(descriptor) {
    const item = descriptor || {};
    const tag = String(item.tag || 'element').toLowerCase();
    return item.id ? `${tag}#${item.id}` : tag;
  }

  /* ── الجملة الحية: تفاعل كامل في سطر عربي واحد ──────────────────────── */
  function summarizeDefinition(definition, options) {
    const opts = options || {};
    const labelFor = typeof opts.labelFor === 'function' ? opts.labelFor : (id => (id ? `#${id}` : 'العنصر'));
    const eventLabels = opts.eventLabels || {};
    const draft = definition || {};
    const eventLabel = eventLabels[draft.event] || draft.event || 'الحدث';
    const actions = (draft.actions || []).filter(action => action && action.enabled !== false);
    const phrases = actions
      .map(action => (typeof opts.actionPhrase === 'function' ? opts.actionPhrase(action) : String(action.type || '')))
      .filter(Boolean);
    let sentence = `${eventLabel} على ${labelFor(draft.sourceId)}`;
    if (phrases.length) sentence += ` ← ${phrases.join(' ← ')}`;
    const condition = (draft.conditions || []).filter(item => item && item.enabled !== false)[0];
    if (condition && typeof opts.conditionPhrase === 'function') {
      const phrase = opts.conditionPhrase(condition);
      if (phrase) sentence += ` — ${phrase}`;
    }
    return sentence;
  }

  /* ── التمثيل الموحّد لقيمة «ما يكتبه المستخدم في حقل…» ────────────────── */
  function fieldReadName(elementId, sourceId, core) {
    if (!elementId || elementId === sourceId) return 'sourceValue';
    const safe = String(elementId).replace(/[^a-zA-Z0-9]+/g, '_');
    return core.safeIdentifier(`field_${safe}`, 'fieldValue');
  }

  function fieldReadId(elementId, sourceId) {
    return !elementId || elementId === sourceId ? 'hub-source-read' : `hub-field-read-${elementId}`;
  }

  /* المتغيرات التي تحتاجها إجراءات العدادات والحالات — تُعلن تلقائيًا */
  function collectHubAutoVariables(actions, core, previousState) {
    const previous = new Map((previousState || []).map(variable => [variable.name, variable]));
    const map = new Map();
    (actions || []).forEach(action => {
      if (!action || action.enabled === false) return;
      const params = action.params || {};
      if (action.type === 'incrementVariable' || action.type === 'decrementVariable') {
        const name = core.safeIdentifier(params.variableName || 'counter', 'counter');
        if (!map.has(name)) map.set(name, { type: 'Counter', initialValue: '0' });
      }
      if (action.type === 'toggleBoolean') {
        const name = core.safeIdentifier(params.variableName || 'menuOpen', 'menuOpen');
        if (!map.has(name)) map.set(name, { type: 'Boolean', initialValue: 'false' });
      }
    });
    return Array.from(map.entries()).map(([name, meta], index) => {
      const existing = previous.get(name);
      return core.normalizeVariable({
        id: `hub-var-${name}`,
        name,
        type: meta.type,
        initialValue: existing && existing.type === meta.type ? existing.initialValue : meta.initialValue,
        scope: 'outsideEvent',
        enabled: true,
        order: index
      }, index);
    });
  }

  /* ── توحيد المسارين: الفكرة الجاهزة تُترجم إلى مسودة المعالج المبسّط ────
     نفس الشاشة ذات الخطوات الثلاث، لكن الحقول معبّأة مسبقًا. */
  function buildStarterDraft(starterId, context, core) {
    const ctx = context || {};
    const sourceId = String(ctx.sourceId || '');
    if (!sourceId) return null;
    const definition = core.createDefinition(sourceId, sourceId, null, 'general');
    definition.settings = Object.assign({}, definition.settings || {}, {
      entry: 'interaction-hub',
      starter: starterId
    });
    const fieldId = String(ctx.fieldId || '') || (ctx.sourceIsField ? sourceId : '');
    const listId = String(ctx.listId || '') || sourceId;
    const displayId = String(ctx.displayId || '') || sourceId;
    const toggleId = String(ctx.toggleId || '') || sourceId;
    const elementTarget = id => ({ targetId: id, target: { kind: 'element', id } });
    const readName = fieldReadName(fieldId, sourceId, core);
    const fieldRead = fieldId ? core.normalizeRead({
      id: fieldReadId(fieldId, sourceId),
      type: 'inputValue',
      elementId: fieldId,
      name: readName,
      enabled: true,
      order: 0
    }, 0) : null;
    const notEmptyCondition = fieldRead ? core.normalizeCondition({
      id: 'hub-source-condition',
      left: readName,
      operator: 'notEmpty',
      right: '',
      enabled: true,
      order: 0
    }, 0) : null;
    const action = (payload, index, targetId) => core.normalizeAction(Object.assign({
      id: `hub-starter-action-${index + 1}`,
      enabled: true,
      order: index
    }, payload), index, targetId);

    if (starterId === 'inputText') {
      definition.event = ctx.event || (ctx.sourceIsField ? 'input' : 'click');
      if (fieldRead) definition.reads = [fieldRead];
      definition.actions = [action(Object.assign({
        type: 'setText',
        value: fieldRead ? readName : 'نص جديد',
        valueType: fieldRead ? 'expression' : 'literal'
      }, elementTarget(displayId)), 0, displayId)];
    } else if (starterId === 'taskList') {
      definition.event = ctx.event || (ctx.sourceTag === 'form' ? 'submit' : (ctx.sourceIsField ? 'change' : 'click'));
      if (fieldRead) {
        definition.reads = [fieldRead];
        definition.conditions = [notEmptyCondition];
      }
      definition.actions = [
        action(Object.assign({
          type: 'appendListItem',
          value: fieldRead ? readName : 'مهمة جديدة',
          valueType: fieldRead ? 'expression' : 'literal',
          params: { arrayName: '' }
        }, elementTarget(listId)), 0, listId)
      ];
      if (fieldId) {
        definition.actions.push(action(Object.assign({
          type: 'clearInput',
          value: '',
          valueType: 'literal'
        }, elementTarget(fieldId)), 1, fieldId));
      }
    } else if (starterId === 'hamburger') {
      definition.event = ctx.event || 'click';
      definition.actions = [action(Object.assign({
        type: 'toggleBoolean',
        value: 'open',
        valueType: 'literal',
        params: { variableName: 'menuOpen', className: 'open' }
      }, elementTarget(toggleId)), 0, toggleId)];
    } else if (starterId === 'openClose') {
      definition.event = ctx.event || 'click';
      definition.actions = [action(Object.assign({
        type: 'toggleVisibility',
        value: '',
        valueType: 'literal',
        params: { method: 'hidden', className: 'open' }
      }, elementTarget(toggleId)), 0, toggleId)];
    } else if (starterId === 'counter') {
      definition.event = ctx.event || 'click';
      definition.actions = [action(Object.assign({
        type: 'incrementVariable',
        value: '1',
        valueType: 'literal',
        params: { variableName: 'counter', step: '1', display: true }
      }, elementTarget(displayId)), 0, displayId)];
    } else {
      return null;
    }

    definition.state = collectHubAutoVariables(definition.actions, core, []);
    definition.targetId = (definition.actions.find(item => item.targetId) || {}).targetId || sourceId;
    return core.normalizeDefinition(definition);
  }

  return {
    CATALOG: STARTER_CATALOG,
    STARTER_CATALOG,
    normalizeSearchText,
    searchCatalog,
    createUnifiedItems,
    mapLegacyInteraction,
    validateStarterCatalog,
    FRIENDLY_TAG_NAMES,
    FRIENDLY_INPUT_TYPES,
    describeDomElement,
    friendlyElementLabel,
    technicalElementName,
    summarizeDefinition,
    fieldReadName,
    fieldReadId,
    collectHubAutoVariables,
    buildStarterDraft
  };
});
