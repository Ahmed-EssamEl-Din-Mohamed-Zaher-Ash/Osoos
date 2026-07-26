(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OsoosInteractionDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const NO_VALUE_OPERATORS = new Set([
    'isEmpty', 'notEmpty', 'isChecked', 'isTrue', 'isFalse',
    'visible', 'hidden', 'enabled', 'disabled', 'focused', 'hasChildren'
  ]);

  const OPERATOR_GROUPS = Object.freeze({
    text: [
      { value: 'notEmpty', label: 'ليس فارغًا' },
      { value: 'isEmpty', label: 'فارغ' },
      { value: 'includes', label: 'يحتوي على...' },
      { value: '===', label: 'يساوي...' },
      { value: '!==', label: 'لا يساوي...' },
      { value: 'startsWith', label: 'يبدأ بـ...' },
      { value: 'endsWith', label: 'ينتهي بـ...' },
      { value: 'lengthGreater', label: 'أطول من...' }
    ],
    number: [
      { value: '>', label: 'أكبر من' },
      { value: '>=', label: 'أكبر أو يساوي' },
      { value: '===', label: 'يساوي' },
      { value: '!==', label: 'لا يساوي' },
      { value: '<', label: 'أصغر من' },
      { value: '<=', label: 'أصغر أو يساوي' }
    ],
    boolean: [
      { value: 'isChecked', label: 'محدّد' },
      { value: 'isFalse', label: 'غير محدّد' }
    ],
    button: [
      { value: 'enabled', label: 'الزر جاهز للاستخدام' },
      { value: 'disabled', label: 'الزر معطّل' },
      { value: 'visible', label: 'الزر ظاهر للمستخدم' },
      { value: 'hidden', label: 'الزر مخفي' },
      { value: 'hasClass', label: 'يحمل حالة (Class)...' }
    ],
    field: [
      { value: 'notEmpty', label: 'تم إدخال قيمة' },
      { value: 'isEmpty', label: 'الحقل ما زال فارغًا' },
      { value: 'includes', label: 'القيمة تحتوي على...' },
      { value: '===', label: 'القيمة تساوي...' },
      { value: '!==', label: 'القيمة لا تساوي...' }
    ],
    select: [
      { value: 'notEmpty', label: 'تم اختيار قيمة' },
      { value: 'isEmpty', label: 'لم يتم اختيار قيمة' },
      { value: '===', label: 'القيمة المختارة هي...' },
      { value: '!==', label: 'القيمة المختارة ليست...' }
    ],
    container: [
      { value: 'visible', label: 'العنصر ظاهر للمستخدم' },
      { value: 'hidden', label: 'العنصر مخفي' },
      { value: 'hasChildren', label: 'يحتوي عناصر بداخله' },
      { value: 'hasClass', label: 'يحمل حالة (Class)...' }
    ],
    displayText: [
      { value: 'includes', label: 'النص يحتوي على...' },
      { value: '===', label: 'النص يساوي...' },
      { value: 'notEmpty', label: 'يوجد نص معروض' },
      { value: 'isEmpty', label: 'لا يوجد نص معروض' },
      { value: 'visible', label: 'العنصر ظاهر للمستخدم' }
    ]
  });

  const ACTION_GROUPS = Object.freeze([
    { key: 'common', label: 'الإجراءات الشائعة' },
    { key: 'content', label: 'نصوص ومحتوى' },
    { key: 'elements', label: 'إنشاء وحذف عناصر' },
    { key: 'style', label: 'تنسيق CSS' },
    { key: 'attributes', label: 'خصائص Attributes' },
    { key: 'data', label: 'متغيرات وعدادات' },
    { key: 'lists', label: 'عمليات القوائم (Array)' },
    { key: 'strings', label: 'عمليات النصوص (String)' },
    { key: 'console', label: 'الكونسول (نافذة المطوّر)' },
    { key: 'storage', label: 'تخزين محلي' },
    { key: 'browser', label: 'المتصفح والتنقل' },
    { key: 'advanced', label: 'متقدم' }
  ]);

  /* حقول جاهزة تُعاد في أكثر من نوع إجراء */
  const FIELD_PRESETS = Object.freeze({
    cssProperty: { key: 'property', label: 'اسم الخاصية', placeholder: 'مثل: font-size', defaultValue: 'color', dir: 'ltr', list: 'demo-css-properties' },
    tagName: {
      key: 'tagName', label: 'نوع العنصر', type: 'select', defaultValue: 'div',
      options: [['div', 'div'], ['li', 'li — عنصر قائمة'], ['p', 'p — فقرة'], ['span', 'span'], ['button', 'button — زر'], ['a', 'a — رابط'], ['h3', 'h3 — عنوان'], ['img', 'img — صورة'], ['section', 'section']]
    },
    className: { key: 'className', label: 'Class للعنصر (اختياري)', placeholder: 'مثل: task-item', defaultValue: '', dir: 'ltr' },
    variableName: { key: 'variableName', label: 'اسم المتغير', placeholder: 'مثل: counter', defaultValue: 'counter', dir: 'ltr', list: 'demo-variable-names' },
    storageKey: { key: 'key', label: 'المفتاح', placeholder: 'مثل: userName', defaultValue: 'myKey', dir: 'ltr' },
    /* اسم القائمة: نفس صندوق الذاكرة من نوع Array الذي نُعلنه تلقائيًا قبل الحدث */
    arrayName: { key: 'arrayName', label: 'اسم القائمة', placeholder: 'مثل: items', defaultValue: 'items', dir: 'ltr', list: 'demo-variable-names' },
    /* اسم الناتج: الصندوق الذي تُخزَّن فيه نتيجة العملية لتستعملها خطوة تالية */
    resultName: { key: 'resultName', label: 'خزّن الناتج في صندوق باسم', placeholder: 'مثل: result', defaultValue: '', dir: 'ltr', list: 'demo-variable-names' },
    /* العدّاد لا يُعرَض دائمًا: أحيانًا يكون رقمًا داخليًا (موضع شريحة مثلاً) */
    counterDisplay: { key: 'display', type: 'select', label: 'اعرض الرقم داخل العنصر؟', defaultValue: 'yes', options: [['yes', 'نعم — اكتب الرقم في العنصر'], ['no', 'لا — رقم داخلي فقط']] },
    /* «دُر داخل قائمة»: بعد آخر عنصر يعود إلى الأول — سطر النسبة المئوية % الذي يكتبه المبرمج */
    counterCycle: { key: 'cycleArray', label: 'دُر داخل قائمة (اختياري)', placeholder: 'مثل: slides', defaultValue: '', dir: 'ltr', list: 'demo-variable-names' }
  });

  /* الكتالوج الكامل: كل نوع هنا موجود فعلاً في محرك VisualLogicCore (E1)،
     فالشاشة البسيطة تكشف قدرة المحرك كاملة بدون أي محرك جديد. */
  const ACTION_TYPES = Object.freeze({
    /* الشائعة — نفس الإجراءات الأصلية بلا تغيير في سلوكها */
    setText: { group: 'common', label: 'غيّر النص', icon: 'fa-pen', valueLabel: 'النص الجديد', defaultValue: 'تم تنفيذ التفاعل', dynamic: true },
    setInputValue: { group: 'common', label: 'غيّر قيمة الحقل', icon: 'fa-i-cursor', valueLabel: 'القيمة الجديدة', defaultValue: 'تم التنفيذ', dynamic: true },
    show: { group: 'common', label: 'أظهر العنصر', icon: 'fa-eye' },
    hide: { group: 'common', label: 'أخفِ العنصر', icon: 'fa-eye-slash' },
    toggleVisibility: { group: 'common', label: 'بدّل الظهور', icon: 'fa-toggle-on' },
    setColor: { group: 'common', label: 'غيّر لون النص', icon: 'fa-palette', valueLabel: 'اللون', defaultValue: '#ef4444', dynamic: true },
    setBackground: { group: 'common', label: 'غيّر الخلفية', icon: 'fa-fill-drip', valueLabel: 'لون الخلفية', defaultValue: '#dcfce7', dynamic: true },
    addClass: { group: 'common', label: 'أضف Class', icon: 'fa-plus', valueLabel: 'اسم الـClass', defaultValue: 'active' },
    removeClass: { group: 'common', label: 'احذف Class', icon: 'fa-minus', valueLabel: 'اسم الـClass', defaultValue: 'active' },
    toggleClass: { group: 'common', label: 'بدّل Class', icon: 'fa-arrows-rotate', valueLabel: 'اسم الـClass', defaultValue: 'active' },
    disable: { group: 'common', label: 'عطّل العنصر', icon: 'fa-ban' },
    enable: { group: 'common', label: 'فعّل العنصر', icon: 'fa-circle-check' },

    /* نصوص ومحتوى */
    setHTML: { group: 'content', label: 'غيّر HTML الداخلي', icon: 'fa-code', valueLabel: 'كود HTML', defaultValue: '<b>نص جديد</b>', dynamic: true },
    appendText: { group: 'content', label: 'أضف نصًا في النهاية', icon: 'fa-align-left', valueLabel: 'النص المُضاف', defaultValue: ' …', dynamic: true },
    clearText: { group: 'content', label: 'امسح النص', icon: 'fa-eraser' },
    clearInput: { group: 'content', label: 'امسح الحقل', icon: 'fa-delete-left', targetHint: 'حقل الإدخال الذي سيُمسح' },
    copyValue: {
      group: 'content', label: 'انسخ قيمة من عنصر لآخر', icon: 'fa-copy', targetHint: 'العنصر الذي سيستقبل القيمة',
      fields: [
        { key: 'sourceKey', type: 'element', label: 'انسخ من' },
        { key: 'property', type: 'select', label: 'الخاصية المنسوخة', defaultValue: 'value', options: [['value', 'قيمة الحقل'], ['textContent', 'النص'], ['innerHTML', 'HTML الداخلي']] }
      ]
    },

    /* إنشاء وحذف عناصر */
    appendListItem: { group: 'elements', label: 'أضف عنصرًا إلى قائمة', icon: 'fa-list', valueLabel: 'نص العنصر الجديد', defaultValue: 'مهمة جديدة', dynamic: true, targetHint: 'القائمة (ul أو ol)' },
    renderList: {
      group: 'elements', label: 'اعرض قائمة البيانات (Array) داخل القائمة', icon: 'fa-table-list',
      targetHint: 'عنصر القائمة الذي سيعرض البيانات (ul أو ol)',
      fields: [
        { key: 'arrayName', label: 'اسم قائمة البيانات', defaultValue: 'items', dir: 'ltr', list: 'demo-variable-names' },
        { key: 'itemTag', type: 'select', label: 'شكل كل عنصر', defaultValue: 'li', options: [['li', 'سطر قائمة li'], ['div', 'حاوية div'], ['p', 'فقرة p']] }
      ]
    },
    appendElement: { group: 'elements', label: 'أنشئ عنصرًا داخل الهدف (في النهاية)', icon: 'fa-square-plus', valueLabel: 'نص العنصر', defaultValue: 'عنصر جديد', dynamic: true, fields: [FIELD_PRESETS.tagName, FIELD_PRESETS.className] },
    prepend: { group: 'elements', label: 'أنشئ عنصرًا داخل الهدف (في البداية)', icon: 'fa-square-plus', valueLabel: 'نص العنصر', defaultValue: 'عنصر جديد', dynamic: true, fields: [FIELD_PRESETS.tagName, FIELD_PRESETS.className] },
    insertBefore: { group: 'elements', label: 'أنشئ عنصرًا قبل الهدف', icon: 'fa-arrow-up-long', valueLabel: 'نص العنصر', defaultValue: 'عنصر جديد', dynamic: true, fields: [FIELD_PRESETS.tagName, FIELD_PRESETS.className] },
    insertAfter: { group: 'elements', label: 'أنشئ عنصرًا بعد الهدف', icon: 'fa-arrow-down-long', valueLabel: 'نص العنصر', defaultValue: 'عنصر جديد', dynamic: true, fields: [FIELD_PRESETS.tagName, FIELD_PRESETS.className] },
    cloneElement: { group: 'elements', label: 'كرّر العنصر (نسخة بجواره)', icon: 'fa-clone' },
    clearElement: { group: 'elements', label: 'فرّغ محتويات العنصر', icon: 'fa-broom' },
    removeElement: { group: 'elements', label: 'احذف العنصر من الصفحة', icon: 'fa-trash-can' },

    /* تنسيق CSS */
    setStyle: { group: 'style', label: 'غيّر أي خاصية CSS', icon: 'fa-brush', valueLabel: 'القيمة', defaultValue: 'red', dynamic: true, fields: [FIELD_PRESETS.cssProperty] },
    setWidth: { group: 'style', label: 'غيّر العرض', icon: 'fa-arrows-left-right', valueLabel: 'العرض', defaultValue: '200px', dynamic: true },
    setHeight: { group: 'style', label: 'غيّر الارتفاع', icon: 'fa-arrows-up-down', valueLabel: 'الارتفاع', defaultValue: '100px', dynamic: true },
    setOpacity: { group: 'style', label: 'غيّر الشفافية', icon: 'fa-circle-half-stroke', valueLabel: 'من 0 إلى 1', defaultValue: '0.5', dynamic: true },
    setTransform: { group: 'style', label: 'غيّر transform', icon: 'fa-up-right-and-down-left-from-center', valueLabel: 'قيمة transform', defaultValue: 'scale(1.05)', dynamic: true },
    removeStyle: { group: 'style', label: 'أزل خاصية CSS', icon: 'fa-xmark', fields: [FIELD_PRESETS.cssProperty] },

    /* خصائص Attributes */
    setAttribute: { group: 'attributes', label: 'عيّن Attribute', icon: 'fa-tag', valueLabel: 'القيمة', defaultValue: '', dynamic: true, fields: [{ key: 'name', label: 'اسم الخاصية', placeholder: 'مثل: title', defaultValue: 'title', dir: 'ltr' }] },
    removeAttribute: { group: 'attributes', label: 'أزل Attribute', icon: 'fa-tag', fields: [{ key: 'name', label: 'اسم الخاصية', placeholder: 'مثل: title', defaultValue: '', dir: 'ltr' }] },
    setHref: { group: 'attributes', label: 'غيّر رابط href', icon: 'fa-link', valueLabel: 'الرابط الجديد', defaultValue: 'https://example.com', dynamic: true, targetHint: 'عنصر الرابط a' },
    setSrc: { group: 'attributes', label: 'غيّر مصدر الصورة src', icon: 'fa-image', valueLabel: 'مسار الصورة', defaultValue: 'image.png', dynamic: true, targetHint: 'عنصر الصورة img' },
    setPlaceholder: { group: 'attributes', label: 'غيّر النص المؤقت placeholder', icon: 'fa-i-cursor', valueLabel: 'النص المؤقت', defaultValue: 'اكتب هنا…', dynamic: true },
    setDataAttribute: { group: 'attributes', label: 'غيّر data attribute', icon: 'fa-database', valueLabel: 'القيمة', defaultValue: '', dynamic: true, fields: [{ key: 'key', label: 'اسم data-*', placeholder: 'مثل: state', defaultValue: 'state', dir: 'ltr' }] },

    /* متغيرات وعدادات */
    setVariable: { group: 'data', label: 'خزّن قيمة في متغير', icon: 'fa-box', targetless: true, valueLabel: 'القيمة', defaultValue: '', dynamic: true, fields: [FIELD_PRESETS.variableName] },
    incrementVariable: { group: 'data', label: 'زد عدادًا', icon: 'fa-circle-plus', targetHint: 'العنصر الذي يعرض قيمة العداد', fields: [FIELD_PRESETS.variableName, { key: 'step', type: 'number', label: 'مقدار الزيادة', defaultValue: '1' }, FIELD_PRESETS.counterDisplay, FIELD_PRESETS.counterCycle] },
    decrementVariable: { group: 'data', label: 'أنقص عدادًا', icon: 'fa-circle-minus', targetHint: 'العنصر الذي يعرض قيمة العداد', fields: [FIELD_PRESETS.variableName, { key: 'step', type: 'number', label: 'مقدار النقص', defaultValue: '1' }, FIELD_PRESETS.counterDisplay, FIELD_PRESETS.counterCycle] },
    toggleBoolean: { group: 'data', label: 'بدّل قيمة Boolean (فتح/إغلاق)', icon: 'fa-toggle-off', targetHint: 'العنصر المتأثر بالحالة', fields: [{ ...FIELD_PRESETS.variableName, defaultValue: 'isOpen' }, { key: 'className', label: 'Class عند التفعيل (اختياري)', placeholder: 'مثل: open', defaultValue: '', dir: 'ltr' }] },

    /* عمليات القوائم (Array) — كل بطاقة هنا تكتب سطر JavaScript واحدًا،
       بنفس ترتيب ما يكتبه المبرمج بيده: نأخذ القائمة، ننفّذ العملية، نخزّن الناتج. */
    arrayPush: { group: 'lists', label: 'أضف قيمة في نهاية القائمة', icon: 'fa-layer-group', targetless: true, valueLabel: 'القيمة المُضافة', defaultValue: '', dynamic: true, fields: [FIELD_PRESETS.arrayName] },
    arrayUnshift: { group: 'lists', label: 'أضف قيمة في بداية القائمة', icon: 'fa-angles-up', targetless: true, valueLabel: 'القيمة المُضافة', defaultValue: '', dynamic: true, fields: [FIELD_PRESETS.arrayName] },
    arrayPop: { group: 'lists', label: 'احذف آخر عنصر من القائمة', icon: 'fa-delete-left', targetless: true, fields: [FIELD_PRESETS.arrayName, { ...FIELD_PRESETS.resultName, label: 'خزّن العنصر المحذوف باسم (اختياري)', placeholder: 'مثل: lastItem' }] },
    arrayShift: { group: 'lists', label: 'احذف أول عنصر من القائمة', icon: 'fa-delete-left', targetless: true, fields: [FIELD_PRESETS.arrayName, { ...FIELD_PRESETS.resultName, label: 'خزّن العنصر المحذوف باسم (اختياري)', placeholder: 'مثل: firstItem' }] },
    arrayClear: { group: 'lists', label: 'فرّغ القائمة كلها', icon: 'fa-broom', targetless: true, fields: [FIELD_PRESETS.arrayName] },
    arraySort: {
      group: 'lists', label: 'رتّب عناصر القائمة', icon: 'fa-arrow-down-a-z', targetless: true,
      fields: [
        FIELD_PRESETS.arrayName,
        { key: 'direction', type: 'select', label: 'اتجاه الترتيب', defaultValue: 'asc', options: [['asc', 'تصاعدي'], ['desc', 'تنازلي']] },
        { key: 'numeric', type: 'select', label: 'نوع المقارنة', defaultValue: 'text', options: [['text', 'نصية (أ ← ي)'], ['number', 'رقمية (1 ← 9)']] }
      ]
    },
    arrayReverse: { group: 'lists', label: 'اعكس ترتيب القائمة', icon: 'fa-right-left', targetless: true, fields: [FIELD_PRESETS.arrayName] },
    arrayUnique: { group: 'lists', label: 'احذف القيم المكررة', icon: 'fa-filter-circle-xmark', targetless: true, fields: [FIELD_PRESETS.arrayName, { ...FIELD_PRESETS.resultName, placeholder: 'مثل: uniqueItems' }] },
    arrayFilter: {
      group: 'lists', label: 'صفِّ القائمة بشرط', icon: 'fa-filter', targetless: true,
      fields: [
        FIELD_PRESETS.arrayName,
        {
          key: 'operator', type: 'select', label: 'اترك العنصر لو', defaultValue: 'includes',
          options: [['includes', 'يحتوي على'], ['notIncludes', 'لا يحتوي على'], ['===', 'يساوي'], ['!==', 'لا يساوي'], ['startsWith', 'يبدأ بـ'], ['endsWith', 'ينتهي بـ'], ['>', 'أكبر من'], ['<', 'أصغر من'], ['>=', 'أكبر أو يساوي'], ['<=', 'أصغر أو يساوي'], ['notEmpty', 'غير فارغ'], ['isEmpty', 'فارغ']]
        },
        /* القيمة إما نصّ تكتبه، وإما اسم صندوق فتُقارن بما بداخله لحظة التنفيذ */
        { key: 'compareValue', label: 'قيمة المقارنة (نص أو اسم صندوق)', placeholder: 'مثل: تفاح أو searchText', defaultValue: '', list: 'demo-variable-names' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: filteredItems' }
      ]
    },
    arrayMap: {
      group: 'lists', label: 'حوّل كل عناصر القائمة', icon: 'fa-wand-magic-sparkles', targetless: true,
      fields: [
        FIELD_PRESETS.arrayName,
        { key: 'transform', type: 'select', label: 'التحويل المطلوب', defaultValue: 'upper', options: [['upper', 'حروف كبيرة'], ['lower', 'حروف صغيرة'], ['trim', 'إزالة المسافات'], ['number', 'تحويل إلى رقم'], ['template', 'قالب نصي مخصص']] },
        { key: 'template', label: 'القالب — {{value}} مكان العنصر', placeholder: 'مثل: • {{value}}', defaultValue: '' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: mappedItems' }
      ]
    },
    arraySlice: {
      group: 'lists', label: 'اقتطع جزءًا من القائمة', icon: 'fa-scissors', targetless: true,
      fields: [
        FIELD_PRESETS.arrayName,
        { key: 'start', label: 'من الموضع', placeholder: '0 = البداية', defaultValue: '0', dir: 'ltr' },
        { key: 'end', label: 'إلى الموضع (فارغ = حتى النهاية)', placeholder: 'مثل: 3', defaultValue: '', dir: 'ltr' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: firstThree' }
      ]
    },
    arrayJoin: {
      group: 'lists', label: 'ادمج القائمة في نص واحد', icon: 'fa-link', targetless: true,
      fields: [
        FIELD_PRESETS.arrayName,
        { key: 'separator', label: 'الفاصل بين العناصر', placeholder: 'مثل: ، ', defaultValue: '، ' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: itemsText' }
      ]
    },
    arrayLength: { group: 'lists', label: 'احسب عدد عناصر القائمة', icon: 'fa-hashtag', targetless: true, fields: [FIELD_PRESETS.arrayName, { ...FIELD_PRESETS.resultName, placeholder: 'مثل: itemsCount' }] },
    arraySum: { group: 'lists', label: 'اجمع أرقام القائمة', icon: 'fa-plus-minus', targetless: true, fields: [FIELD_PRESETS.arrayName, { ...FIELD_PRESETS.resultName, placeholder: 'مثل: total' }] },
    arrayIndexOf: { group: 'lists', label: 'ابحث عن موضع قيمة في القائمة', icon: 'fa-magnifying-glass', targetless: true, valueLabel: 'القيمة المطلوب موضعها', defaultValue: '', dynamic: true, fields: [FIELD_PRESETS.arrayName, { ...FIELD_PRESETS.resultName, placeholder: 'مثل: itemIndex' }] },
    /* عكس «ابحث عن الموضع»: عندك الموضع وتريد العنصر — items[2] */
    arrayItem: {
      group: 'lists', label: 'خذ عنصرًا من القائمة بموضعه', icon: 'fa-crosshairs', targetless: true,
      fields: [
        FIELD_PRESETS.arrayName,
        { key: 'index', label: 'الموضع (يبدأ من 0) أو اسم صندوق', placeholder: 'مثل: 0 أو slideIndex', defaultValue: '0', dir: 'ltr', list: 'demo-variable-names' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: currentItem' }
      ]
    },

    /* عمليات النصوص (String) — النص يأتي من مصدر واحد: ثابت أو عنصر أو صندوق */
    stringSlice: {
      group: 'strings', label: 'اقتطع جزءًا من نص', icon: 'fa-scissors', targetless: true, valueLabel: 'النص', defaultValue: '', dynamic: true,
      fields: [
        { key: 'start', label: 'من الحرف رقم', placeholder: '0 = أول حرف', defaultValue: '0', dir: 'ltr' },
        { key: 'end', label: 'إلى الحرف رقم (فارغ = حتى النهاية)', placeholder: 'مثل: 5', defaultValue: '', dir: 'ltr' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: shortText' }
      ]
    },
    stringSplit: {
      group: 'strings', label: 'قسّم نصًا إلى قائمة', icon: 'fa-table-columns', targetless: true, valueLabel: 'النص', defaultValue: '', dynamic: true,
      fields: [
        { key: 'separator', label: 'القسمة عند', placeholder: 'مسافة، أو فاصلة…', defaultValue: ' ' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: words' }
      ]
    },
    stringReplace: {
      group: 'strings', label: 'استبدل داخل نص', icon: 'fa-right-left', targetless: true, valueLabel: 'النص', defaultValue: '', dynamic: true,
      fields: [
        { key: 'search', label: 'ابحث عن', placeholder: 'النص القديم', defaultValue: '' },
        { key: 'replacement', label: 'استبدله بـ', placeholder: 'النص الجديد', defaultValue: '' },
        { key: 'all', type: 'select', label: 'مدى الاستبدال', defaultValue: 'all', options: [['all', 'كل التكرارات'], ['first', 'أول تكرار فقط']] },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: newText' }
      ]
    },
    stringCase: {
      group: 'strings', label: 'غيّر حالة الأحرف', icon: 'fa-font', targetless: true, valueLabel: 'النص', defaultValue: '', dynamic: true,
      fields: [
        { key: 'mode', type: 'select', label: 'الحالة المطلوبة', defaultValue: 'upper', options: [['upper', 'حروف كبيرة'], ['lower', 'حروف صغيرة']] },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: newText' }
      ]
    },
    stringTrim: { group: 'strings', label: 'أزل المسافات الزائدة', icon: 'fa-broom', targetless: true, valueLabel: 'النص', defaultValue: '', dynamic: true, fields: [{ ...FIELD_PRESETS.resultName, placeholder: 'مثل: cleanText' }] },
    stringLength: { group: 'strings', label: 'احسب عدد حروف نص', icon: 'fa-hashtag', targetless: true, valueLabel: 'النص', defaultValue: '', dynamic: true, fields: [{ ...FIELD_PRESETS.resultName, placeholder: 'مثل: textLength' }] },
    stringConcat: {
      group: 'strings', label: 'ادمج نصين', icon: 'fa-link', targetless: true, valueLabel: 'النص الأول', defaultValue: '', dynamic: true,
      fields: [
        { key: 'suffix', label: 'النص الثاني', placeholder: 'مثل: أهلاً', defaultValue: '' },
        { key: 'separator', label: 'الفاصل بينهما (اختياري)', placeholder: 'مثل: مسافة', defaultValue: '' },
        { ...FIELD_PRESETS.resultName, placeholder: 'مثل: fullText' }
      ]
    },
    stringNumber: { group: 'strings', label: 'حوّل نصًا إلى رقم', icon: 'fa-calculator', targetless: true, valueLabel: 'النص', defaultValue: '', dynamic: true, fields: [{ ...FIELD_PRESETS.resultName, placeholder: 'مثل: numberValue' }] },

    /* الكونسول — نافذة المطوّر: هنا يرى المستخدم قيمه أثناء التنفيذ (F12 ← Console) */
    consoleLog: {
      group: 'console', label: 'اطبع قيمة في الكونسول', icon: 'fa-terminal', targetless: true, valueLabel: 'القيمة المطبوعة', defaultValue: '', dynamic: true,
      fields: [
        { key: 'label', label: 'عنوان قبل القيمة (اختياري)', placeholder: 'مثل: عدد المهام', defaultValue: '' },
        { key: 'level', type: 'select', label: 'نوع الرسالة', defaultValue: 'log', options: [['log', 'عادية'], ['info', 'معلومة'], ['warn', 'تحذير'], ['error', 'خطأ']] }
      ]
    },
    consoleTable: { group: 'console', label: 'اعرض القائمة كجدول في الكونسول', icon: 'fa-table', targetless: true, fields: [FIELD_PRESETS.arrayName] },
    consoleClear: { group: 'console', label: 'امسح الكونسول', icon: 'fa-eraser', targetless: true },

    /* تخزين محلي */
    localStorageSet: { group: 'storage', label: 'احفظ في localStorage', icon: 'fa-floppy-disk', targetless: true, valueLabel: 'القيمة المحفوظة', defaultValue: '', dynamic: true, fields: [FIELD_PRESETS.storageKey] },
    localStorageGet: { group: 'storage', label: 'اقرأ من localStorage واعرضه', icon: 'fa-folder-open', targetHint: 'العنصر الذي يعرض القيمة', fields: [FIELD_PRESETS.storageKey, { key: 'fallback', label: 'قيمة بديلة إن لم توجد', placeholder: 'اختياري', defaultValue: '' }, { ...FIELD_PRESETS.resultName, placeholder: 'مثل: savedTheme' }] },
    localStorageRemove: { group: 'storage', label: 'احذف من localStorage', icon: 'fa-trash', targetless: true, fields: [FIELD_PRESETS.storageKey] },
    sessionStorageSet: { group: 'storage', label: 'احفظ في sessionStorage', icon: 'fa-floppy-disk', targetless: true, valueLabel: 'القيمة المحفوظة', defaultValue: '', dynamic: true, fields: [FIELD_PRESETS.storageKey] },
    sessionStorageGet: { group: 'storage', label: 'اقرأ من sessionStorage واعرضه', icon: 'fa-folder-open', targetHint: 'العنصر الذي يعرض القيمة', fields: [FIELD_PRESETS.storageKey, { key: 'fallback', label: 'قيمة بديلة إن لم توجد', placeholder: 'اختياري', defaultValue: '' }] },
    sessionStorageRemove: { group: 'storage', label: 'احذف من sessionStorage', icon: 'fa-trash', targetless: true, fields: [FIELD_PRESETS.storageKey] },

    /* المتصفح والتنقل */
    alert: { group: 'browser', label: 'اعرض تنبيه Alert', icon: 'fa-bell', targetless: true, valueLabel: 'نص الرسالة', defaultValue: 'رسالة تنبيه', dynamic: true },
    clipboard: { group: 'browser', label: 'انسخ إلى الحافظة', icon: 'fa-clipboard', targetless: true, valueLabel: 'النص المنسوخ', defaultValue: '', dynamic: true },
    openUrl: { group: 'browser', label: 'افتح رابطًا', icon: 'fa-up-right-from-square', targetless: true, valueLabel: 'الرابط', defaultValue: 'https://', dynamic: true, fields: [{ key: 'target', type: 'select', label: 'مكان الفتح', defaultValue: '_blank', options: [['_blank', 'تبويب جديد'], ['_self', 'نفس التبويب']] }] },
    redirect: { group: 'browser', label: 'انتقل إلى صفحة', icon: 'fa-route', targetless: true, valueLabel: 'الرابط', defaultValue: '', dynamic: true },
    scrollTo: { group: 'browser', label: 'مرّر الشاشة إلى العنصر', icon: 'fa-arrows-down-to-line', fields: [{ key: 'behavior', type: 'select', label: 'طريقة التمرير', defaultValue: 'smooth', options: [['smooth', 'انزلاق ناعم'], ['auto', 'انتقال مباشر']] }] },
    print: { group: 'browser', label: 'اطبع الصفحة', icon: 'fa-print', targetless: true },

    /* متقدم */
    repeatLoop: { group: 'advanced', label: '🔁 كرّر كودًا عدة مرات', icon: 'fa-repeat', targetless: true, fields: [{ key: 'count', type: 'number', label: 'عدد المرات', defaultValue: '3' }, { key: 'code', type: 'code', label: 'الكود المُكرَّر — index متاح داخله', placeholder: "console.log('المرة رقم', index);" }] },
    forEachLoop: { group: 'advanced', label: '🔁 لكل عنصر في قائمة (Array)', icon: 'fa-arrows-spin', targetless: true, fields: [{ key: 'arrayName', label: 'اسم القائمة', defaultValue: 'items', dir: 'ltr', list: 'demo-variable-names' }, { key: 'code', type: 'code', label: 'كود لكل عنصر — item وindex متاحان', placeholder: "console.log(item, index);" }] },
    delayedAction: { group: 'advanced', label: 'نفّذ كود JS بعد مدة', icon: 'fa-hourglass-half', targetless: true, fields: [{ key: 'delay', type: 'number', label: 'المدة (مللي ثانية)', defaultValue: '1000' }, { key: 'body', type: 'code', label: 'كود JavaScript', placeholder: "document.getElementById('msg').hidden = true;" }] },
    setInterval: { group: 'advanced', label: 'كرّر كود JS كل مدة', icon: 'fa-rotate', targetless: true, fields: [{ key: 'delay', type: 'number', label: 'المدة (مللي ثانية)', defaultValue: '1000' }, { key: 'body', type: 'code', label: 'كود JavaScript', placeholder: '// يتكرر تلقائيًا' }] },
    clearInterval: { group: 'advanced', label: 'أوقف التكرار Interval', icon: 'fa-stop', targetless: true, fields: [{ key: 'timer', label: 'اسم المؤقت', defaultValue: 'state.intervalId', dir: 'ltr' }] },
    callFunction: { group: 'advanced', label: 'استدعِ Function', icon: 'fa-bolt', targetless: true, fields: [{ key: 'functionName', label: 'اسم الدالة', placeholder: 'مثل: myFunction', defaultValue: 'myFunction', dir: 'ltr' }, { key: 'arguments', label: 'المعاملات (اختياري)', placeholder: "مثل: 'نص', 5", defaultValue: '', dir: 'ltr' }] },
    custom: { group: 'advanced', label: 'كود JavaScript مخصص (غير محدود)', icon: 'fa-terminal', targetHint: 'متاح داخل الكود باسم targetElement', fields: [{ key: 'code', type: 'code', label: 'كود JavaScript', placeholder: "targetElement.textContent = 'أي شيء تتخيله';" }] }
  });

  const EVENT_LABELS = Object.freeze({
    click: 'النقر',
    dblclick: 'النقر المزدوج',
    input: 'الكتابة',
    change: 'تغيير القيمة',
    submit: 'إرسال النموذج',
    focus: 'التركيز',
    blur: 'مغادرة الحقل',
    mouseenter: 'دخول المؤشر',
    mouseleave: 'خروج المؤشر',
    keydown: 'ضغط مفتاح',
    keyup: 'رفع مفتاح',
    contextmenu: 'النقر بالزر الأيمن',
    scroll: 'التمرير',
    load: 'اكتمال تحميل الصفحة',
    resize: 'تغيير حجم النافذة',
    dragstart: 'بداية السحب',
    dragend: 'نهاية السحب',
    touchstart: 'بداية اللمس',
    touchend: 'نهاية اللمس',
    animationend: 'انتهاء الأنيميشن',
    transitionend: 'انتهاء الانتقال'
  });

  /* كل الأحداث المدعومة في المحرك (عدا custom الذي يحتاج اسم حدث يدوي) */
  const ALL_EVENTS = Object.freeze([
    'click', 'dblclick', 'contextmenu', 'mouseenter', 'mouseleave',
    'input', 'change', 'submit', 'focus', 'blur', 'keydown', 'keyup',
    'scroll', 'load', 'resize', 'dragstart', 'dragend', 'touchstart', 'touchend',
    'animationend', 'transitionend'
  ]);

  const KEY_FILTER_EVENTS = Object.freeze(['keydown', 'keyup']);

  function clone(value) {
    if (value === undefined || value === null) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncate(value, maxLength) {
    const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    const limit = Number(maxLength) || 34;
    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
  }

  function inferElementProfile(input) {
    const descriptor = input || {};
    const tag = String(descriptor.tag || descriptor.tagName || '').toLowerCase();
    const inputType = String(descriptor.inputType || descriptor.type || '').toLowerCase();

    if (tag === 'input' && ['checkbox', 'radio'].includes(inputType)) {
      return { valueKind: 'boolean', readType: 'checked', inputType: 'checkbox' };
    }
    if (tag === 'input' && ['number', 'range'].includes(inputType)) {
      return { valueKind: 'number', readType: 'inputValue', inputType: 'number' };
    }
    if (tag === 'select') return { valueKind: 'text', readType: 'selectValue', inputType: 'text' };
    if (tag === 'textarea') return { valueKind: 'text', readType: 'textareaValue', inputType: 'text' };
    if (tag === 'input') return { valueKind: 'text', readType: 'inputValue', inputType: 'text' };
    return { valueKind: 'text', readType: 'textContent', inputType: 'text' };
  }

  /* أسماء ودّية: «زر «أضف»» بدل button#button — المعرّف التقني يبقى للتلميحات فقط */
  const FRIENDLY_TAGS = Object.freeze({
    ul: 'قائمة', ol: 'قائمة مرقّمة', li: 'سطر في قائمة', button: 'زر',
    input: 'حقل إدخال', textarea: 'مساحة كتابة', select: 'قائمة اختيار',
    form: 'نموذج', a: 'رابط', img: 'صورة', p: 'فقرة', span: 'نص',
    div: 'حاوية', section: 'قسم', header: 'ترويسة', footer: 'تذييل',
    nav: 'شريط تنقّل', main: 'المحتوى الرئيسي', article: 'مقال', label: 'تسمية حقل',
    h1: 'عنوان رئيسي', h2: 'عنوان', h3: 'عنوان', h4: 'عنوان', h5: 'عنوان', h6: 'عنوان',
    table: 'جدول', video: 'فيديو', audio: 'صوت'
  });

  const FRIENDLY_INPUTS = Object.freeze({
    checkbox: 'مربع اختيار', radio: 'زر اختيار', number: 'حقل رقم', email: 'حقل بريد',
    password: 'حقل كلمة مرور', date: 'حقل تاريخ', color: 'منتقي لون', range: 'شريط تمرير',
    search: 'حقل بحث', button: 'زر', submit: 'زر إرسال', reset: 'زر مسح'
  });

  function friendlyName(tag, inputType, textPreview, id) {
    let base = FRIENDLY_TAGS[tag] || (tag ? `عنصر ${tag}` : 'عنصر');
    if (tag === 'input' && FRIENDLY_INPUTS[String(inputType || '').toLowerCase()]) {
      base = FRIENDLY_INPUTS[String(inputType || '').toLowerCase()];
    }
    if (textPreview) return `${base} «${textPreview}»`;
    return id ? `${base} (#${id})` : base;
  }

  function normalizeDescriptor(input, index) {
    if (!input) return null;
    const profile = inferElementProfile(input);
    const tag = String(input.tag || input.tagName || 'element').toLowerCase();
    const id = String(input.id || '');
    const key = String(input.key || id || `element-${Number(index || 0) + 1}`);
    const inputType = String(input.inputType || input.type || '');
    const textPreview = truncate(input.textPreview || input.text || input.sampleValue || '', 24);
    const identity = id ? `${tag}#${id}` : tag;
    const friendly = friendlyName(tag, inputType, textPreview, id);
    return {
      key,
      id,
      tag,
      inputType,
      label: String(input.label || friendly),
      shortLabel: String(input.shortLabel || friendly),
      technical: identity,
      textPreview,
      sampleValue: input.sampleValue,
      disabled: Boolean(input.disabled),
      visible: input.visible !== false,
      classNames: Array.isArray(input.classNames) ? input.classNames.slice() : [],
      hasChildren: Boolean(input.hasChildren),
      valueKind: input.valueKind || profile.valueKind,
      readType: input.readType || profile.readType,
      controlType: input.controlType || profile.inputType
    };
  }

  function descriptorByKey(state, key) {
    return (state.elements || []).find(item => item.key === key) || null;
  }

  function descriptorById(state, id) {
    return (state.elements || []).find(item => item.id && item.id === id) || null;
  }

  function conditionProfile(source) {
    const tag = String(source && source.tag || '').toLowerCase();
    const inputType = String(source && source.inputType || '').toLowerCase();
    const valueKind = (source && source.valueKind) || inferElementProfile(source).valueKind;
    if (tag === 'button' || (tag === 'input' && ['button', 'submit', 'reset'].includes(inputType))) return 'button';
    if (valueKind === 'boolean') return 'boolean';
    if (valueKind === 'number') return 'number';
    if (tag === 'select') return 'select';
    if (tag === 'input' || tag === 'textarea') return 'field';
    if (['div', 'section', 'main', 'article', 'header', 'footer', 'nav', 'ul', 'ol', 'form'].includes(tag)) return 'container';
    return 'displayText';
  }

  function operatorOptions(source) {
    const kind = typeof source === 'string'
      ? ({ checkbox: 'boolean', boolean: 'boolean', counter: 'number', number: 'number' }[source] || 'displayText')
      : conditionProfile(source);
    return (OPERATOR_GROUPS[kind] || OPERATOR_GROUPS.text).map(option => Object.assign({}, option));
  }

  function defaultOperator(source) {
    const kind = conditionProfile(source);
    if (kind === 'button') return 'enabled';
    if (kind === 'boolean') return 'isChecked';
    if (kind === 'number') return '>';
    if (kind === 'container') return 'visible';
    if (kind === 'displayText') return 'includes';
    return 'notEmpty';
  }

  function defaultCompareValue(source) {
    const kind = (source && source.valueKind) || inferElementProfile(source).valueKind;
    if (kind === 'number') return '0';
    return '';
  }

  function readTypeForCondition(source, operator) {
    if (['enabled', 'disabled', 'visible', 'hidden', 'hasClass', 'notHasClass', 'focused', 'hasChildren', 'hasAttribute'].includes(operator)) {
      return 'element';
    }
    return source ? source.readType : 'textContent';
  }

  function eventOptionsFor(source) {
    const tag = String(source && source.tag || '').toLowerCase();
    const inputType = String(source && source.inputType || '').toLowerCase();
    let events;
    if (tag === 'form') events = ['submit', 'change'];
    else if (tag === 'input' && ['button', 'submit', 'reset'].includes(inputType)) events = ['click', 'dblclick'];
    else if (['input', 'textarea'].includes(tag)) events = ['input', 'change', 'focus', 'blur', 'keydown'];
    else if (tag === 'select') events = ['change', 'focus', 'blur'];
    else events = ['click', 'dblclick', 'mouseenter', 'mouseleave'];
    return events.map(value => ({ value, label: EVENT_LABELS[value] || value }));
  }

  function defaultEventFor(source) {
    return eventOptionsFor(source)[0].value;
  }

  function actionNeedsValue(kind) {
    const meta = ACTION_TYPES[kind];
    return Boolean(meta && meta.valueLabel);
  }

  function actionMeta(kind) {
    return ACTION_TYPES[kind] || ACTION_TYPES.setText;
  }

  function defaultParamsFor(kind) {
    const params = {};
    (actionMeta(kind).fields || []).forEach(field => {
      params[field.key] = field.defaultValue !== undefined ? String(field.defaultValue) : '';
    });
    return params;
  }

  /* عند قراءة القيمة من عنصر: أي خاصية تُقرأ منه فعليًا وقت التنفيذ */
  function propertyForDescriptor(descriptor) {
    if (!descriptor) return 'value';
    if (descriptor.readType === 'checked') return 'checked';
    if (['inputValue', 'selectValue', 'textareaValue'].includes(descriptor.readType)) return 'value';
    return 'textContent';
  }

  /* يحوّل اختيار المستخدم (ثابت / من عنصر / من متغير) إلى valueSource يفهمه المحرك */
  function buildValueSource(action, state) {
    const mode = action.valueMode || 'static';
    if (mode === 'element') {
      const descriptor = descriptorByKey(state, action.valueElementKey || '');
      if (!descriptor) throw new Error('اختر العنصر الذي ستُؤخذ منه القيمة.');
      if (!descriptor.id) throw new Error('العنصر الذي تُقرأ منه القيمة يحتاج معرّفًا قبل الحفظ.');
      return { kind: 'element', elementId: descriptor.id, property: propertyForDescriptor(descriptor) };
    }
    if (mode === 'variable') {
      const name = String(action.valueVariable || '').trim();
      if (!name) throw new Error('اكتب اسم المتغير الذي ستُؤخذ منه القيمة.');
      return { kind: 'state', name };
    }
    return { kind: 'literal', value: String(action.value == null ? '' : action.value) };
  }

  function defaultActionKind(source) {
    const tag = String(source && source.tag || '').toLowerCase();
    return ['input', 'textarea', 'select'].includes(tag) ? 'setInputValue' : 'setText';
  }

  function makeAction(group, source, serial) {
    const normalizedGroup = ['inside', 'else', 'outside'].includes(group) ? group : 'inside';
    const kind = normalizedGroup === 'inside'
      ? defaultActionKind(source)
      : (normalizedGroup === 'else' ? 'setColor' : 'setBackground');
    const meta = ACTION_TYPES[kind];
    return {
      id: `demo-${normalizedGroup}-${Number(serial || 0) + 1}`,
      kind,
      targetKey: source ? source.key : '',
      targetId: source ? source.id : '',
      value: meta && meta.defaultValue ? meta.defaultValue : '',
      valueMode: 'static',
      valueElementKey: '',
      valueVariable: '',
      params: defaultParamsFor(kind)
    };
  }

  function createInitialState(selected, elements) {
    const normalizedElements = (elements || (selected ? [selected] : []))
      .map(normalizeDescriptor)
      .filter(Boolean);
    const normalizedSelected = selected
      ? (normalizedElements.find(item => item.key === selected.key || (selected.id && item.id === selected.id))
        || normalizeDescriptor(selected, 0))
      : null;

    if (normalizedSelected && !normalizedElements.some(item => item.key === normalizedSelected.key)) {
      normalizedElements.unshift(normalizedSelected);
    }

    const source = normalizedSelected;
    const second = normalizedElements.find(item => !source || item.key !== source.key) || source;
    return {
      view: 'flow',
      selectedKey: source ? source.key : '',
      event: source ? defaultEventFor(source) : 'click',
      eventKey: '',
      devMode: false,
      palette: '',
      paletteCategory: 'common',
      /* مرحلة «قبل الحدث»: تعمل مرة واحدة عند تحميل الصفحة */
      memory: [],
      recipes: [],
      preCode: '',
      elements: normalizedElements,
      sourceKey: source ? source.key : '',
      conditionEnabled: false,
      operator: source ? defaultOperator(source) : 'notEmpty',
      compareValue: source ? defaultCompareValue(source) : '',
      secondCondition: false,
      secondSourceKey: second ? second.key : '',
      secondOperator: second ? defaultOperator(second) : 'notEmpty',
      secondCompareValue: second ? defaultCompareValue(second) : '',
      join: 'AND',
      insideActions: source ? [makeAction('inside', source, 0)] : [],
      elseActions: [],
      outsideActions: [],
      savedDefinitionId: '',
      savedAt: '',
      saveMessage: '',
      dirty: false,
      /* درس جارٍ: فارغ يعني أن المستخدم يبني بنفسه بلا توجيه */
      lesson: { tutorialId: '', stepIndex: 0, roles: {}, done: false, stage: '' }
    };
  }

  function moveAction(actions, fromIndex, toIndex) {
    const next = Array.isArray(actions) ? actions.map(item => Object.assign({}, item)) : [];
    if (!next.length) return next;
    const from = Math.max(0, Math.min(next.length - 1, Number(fromIndex)));
    const to = Math.max(0, Math.min(next.length - 1, Number(toIndex)));
    if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) return next;
    const moved = next.splice(from, 1)[0];
    next.splice(to, 0, moved);
    return next;
  }

  /* ═══════════════ الدروس الجاهزة: من كتالوج بيانات إلى بطاقات حقيقية ═══════════════

     الدرس لا يكتب كودًا ولا يزرع بطاقات سحرية. كل خطوة فيه تضيف إلى الحالة
     البطاقة نفسها التي كان المستخدم سيضيفها بيده، فيبقى الناتج قابلًا للتعديل
     والحذف بعد انتهاء الدرس. هذا هو الفرق بين «درس» و«قالب جاهز».              */

  /* الكتالوج ملف بيانات منفصل. نقرؤه من المتصفح إن كان محمَّلًا، ومن Node
     عند الاختبار، ونعيد كتالوجًا فارغًا إن غاب بدل أن تنكسر اللوحة كلها. */
  let tutorialCatalogueCache = null;
  function tutorialCatalogue() {
    if (tutorialCatalogueCache) return tutorialCatalogueCache;
    if (root && root.OsoosInteractionTutorials) {
      tutorialCatalogueCache = root.OsoosInteractionTutorials;
      return tutorialCatalogueCache;
    }
    try {
      if (typeof require === 'function') {
        tutorialCatalogueCache = require('./interaction-tutorials.js');
        return tutorialCatalogueCache;
      }
    } catch (error) {
      /* الملف غير محمَّل: تبويب الدروس يعرض رسالة، وبقية اللوحة تعمل */
    }
    return { TUTORIALS: [], getTutorial: () => null, listTutorials: () => [] };
  }

  /* عائلات الوسوم: الدور يطلب span، وأي وعاء نصّي يفي بالغرض. المطابقة
     متسامحة عمدًا لأن صفحة المستخدم ليست مطابقة لصفحة كاتب الدرس. */
  const TUTORIAL_ROLE_FAMILIES = Object.freeze({
    button: ['button', 'a'],
    input: ['input', 'textarea', 'select'],
    ul: ['ul', 'ol'],
    img: ['img'],
    span: ['span', 'p', 'label', 'strong', 'em', 'small', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'li'],
    div: ['div', 'section', 'article', 'aside', 'main', 'form', 'header', 'footer', 'nav']
  });

  /* وعاء نصّي يقبل دورًا نصّيًا والعكس: كتابة نصّ داخل div تعمل كما تعمل في span */
  const TUTORIAL_TEXT_HOLDERS = new Set(
    TUTORIAL_ROLE_FAMILIES.span.concat(TUTORIAL_ROLE_FAMILIES.div)
  );

  /* درجة صلاحية عنصر لدور: صفر = لا يصلح، والأعلى أنسب */
  function tutorialRoleScore(role, descriptor) {
    if (!role || !descriptor) return 0;
    const wanted = String(role.tag || '').toLowerCase();
    const tag = String(descriptor.tag || '').toLowerCase();
    const wantedType = String(role.inputType || '').toLowerCase();
    const type = String(descriptor.inputType || '').toLowerCase();
    if (!wanted) return 1;

    if (tag === wanted) {
      if (!wantedType) return 6;
      return type === wantedType ? 8 : 3;
    }
    const family = TUTORIAL_ROLE_FAMILIES[wanted] || [wanted];
    if (family.includes(tag)) return wantedType ? 2 : 4;
    /* آخر ملاذ: أي وعاء نصّي يقبل دورًا نصّيًا */
    if (TUTORIAL_TEXT_HOLDERS.has(wanted) && TUTORIAL_TEXT_HOLDERS.has(tag)) return 1;
    return 0;
  }

  /* يوزّع أدوار الدرس على عناصر الصفحة الفعلية.
     اختيار المستخدم يُحجز أولًا، ثم تُملأ البقية آليًا بأفضل المتاح دون تكرار. */
  function resolveTutorialRoles(tutorial, elements, overrides) {
    const pool = (elements || []).map(normalizeDescriptor).filter(Boolean);
    const roles = (tutorial && tutorial.roles) || [];
    const chosen = {};
    const candidates = {};
    const used = new Set();
    const missing = [];

    roles.forEach(role => {
      candidates[role.key] = pool
        .map(item => ({ item, score: tutorialRoleScore(role, item) }))
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(entry => entry.item);
    });

    /* ١) ما اختاره المستخدم بنفسه يُحجز قبل أي مطابقة آلية */
    roles.forEach(role => {
      const forced = String((overrides || {})[role.key] || '');
      if (!forced) return;
      const descriptor = pool.find(item => item.key === forced);
      if (!descriptor) return;
      chosen[role.key] = descriptor.key;
      used.add(descriptor.key);
    });

    /* ٢) ثم تُملأ الأدوار الباقية بأفضل عنصر لم يُستعمل بعد */
    roles.forEach(role => {
      if (chosen[role.key]) return;
      const pick = (candidates[role.key] || []).find(item => !used.has(item.key));
      if (pick) {
        chosen[role.key] = pick.key;
        used.add(pick.key);
        return;
      }
      if (!role.optional) missing.push(role.key);
    });

    return { roles: chosen, candidates, missing, ready: missing.length === 0 };
  }

  /* قيم البطاقات في الواجهة نصوص دائمًا (تأتي من حقول ومن قوائم اختيار).
     تحويلها هنا يمنع خطأ صامتًا مثل display:false الذي لا يساوي 'no'. */
  function tutorialParams(kind, params) {
    const result = defaultParamsFor(kind);
    Object.keys(params || {}).forEach(key => {
      result[key] = String(params[key] == null ? '' : params[key]);
    });
    return result;
  }

  /* يبني بطاقة تنفيذ من خطوة درس. يعيد null إذا كان الدور المطلوب اختياريًا
     ولا عنصر له في الصفحة — فتُتخطّى الخطوة بدل أن تُكتب على عنصر خطأ. */
  function tutorialAction(step, roleMap, state) {
    const op = (step && step.op) || {};
    if (!ACTION_TYPES[op.kind]) return null;
    const meta = actionMeta(op.kind);
    const map = roleMap || {};

    const targetKey = op.targetRole ? String(map[op.targetRole] || '') : '';
    if (op.targetRole && !targetKey) return null;
    const valueKey = op.valueRole ? String(map[op.valueRole] || '') : '';
    if (op.valueRole && !valueKey) return null;

    const resolvedTargetKey = targetKey || state.selectedKey || '';
    const target = descriptorByKey(state, resolvedTargetKey);
    const valueMode = op.valueMode || 'static';

    return {
      id: `lesson-${step.id}`,
      kind: op.kind,
      targetKey: resolvedTargetKey,
      targetId: target ? target.id : '',
      value: op.value !== undefined ? String(op.value) : String(meta.defaultValue || ''),
      valueMode,
      valueElementKey: valueMode === 'element' ? (valueKey || state.selectedKey || '') : '',
      valueVariable: valueMode === 'variable' ? String(op.valueVariable || '') : '',
      params: tutorialParams(op.kind, op.params)
    };
  }

  /* ينفّذ خطوة واحدة على الحالة. الحالة تُعدَّل في مكانها ثم تُعاد. */
  function applyTutorialStep(state, step, roleMap) {
    const op = (step && step.op) || {};
    const map = roleMap || {};
    const keyFor = role => String(map[role] || '');

    if (op.type === 'box') {
      const memory = (state.memory || []).slice();
      if (!memory.some(box => box.name === op.name)) {
        memory.push({
          id: `lesson-${step.id}`,
          name: String(op.name || ''),
          type: String(op.valueType || 'Number'),
          initialValue: String(op.initialValue == null ? '' : op.initialValue)
        });
      }
      state.memory = memory;
      return state;
    }

    if (op.type === 'trigger') {
      const key = keyFor(op.role);
      if (key) {
        state.selectedKey = key;
        /* الشرط يقرأ من المُشغِّل ما لم تغيّره خطوة شرط لاحقة */
        state.sourceKey = key;
      }
      state.event = String(op.event || 'click');
      return state;
    }

    if (op.type === 'condition') {
      const key = keyFor(op.role);
      if (key) state.sourceKey = key;
      state.conditionEnabled = true;
      state.operator = String(op.operator || 'notEmpty');
      state.compareValue = String(op.compareValue == null ? '' : op.compareValue);
      return state;
    }

    if (op.type !== 'action') return state;
    const action = tutorialAction(step, map, state);
    if (!action) return state;
    const list = op.group === 'inside'
      ? 'insideActions'
      : (op.group === 'else' ? 'elseActions' : 'outsideActions');
    state[list] = (state[list] || []).concat(action);
    return state;
  }

  /* بدء الدرس يُفرغ القوائم الثلاث ليرى المستخدم الملف ينمو من الصفر.
     البطاقات الافتراضية التي يزرعها createInitialState تُحذف هنا عمدًا. */
  function startTutorial(state, tutorial, roleMap) {
    state.memory = [];
    state.recipes = [];
    state.preCode = '';
    state.insideActions = [];
    state.elseActions = [];
    state.outsideActions = [];
    state.conditionEnabled = false;
    state.secondCondition = false;
    state.compareValue = '';
    state.savedDefinitionId = '';
    state.savedAt = '';
    state.saveMessage = '';

    /* العنصر الذي سيحمل المعالج معروف من أول لحظة (دور المُشغِّل في الدرس)،
       فنثبّته الآن حتى تكون خريطة الكود مقروءة قبل الوصول إلى خطوة الربط. */
    const triggerStep = ((tutorial && tutorial.steps) || [])
      .find(item => item && item.op && item.op.type === 'trigger');
    if (triggerStep) {
      const key = String((roleMap || {})[triggerStep.op.role] || '');
      if (key) {
        state.selectedKey = key;
        state.sourceKey = key;
      }
    }

    state.lesson = {
      tutorialId: String(tutorial && tutorial.id || ''),
      stepIndex: 0,
      roles: Object.assign({}, roleMap || {}),
      done: false,
      stage: 'run'
    };
    return state;
  }

  /* يعيد بناء الحالة من الصفر حتى الخطوة رقم count — أبسط من التراجع خطوة خطوة،
     ويضمن أن «رجوع» يعطي نفس نتيجة «تقدّم» تمامًا. */
  function applyTutorialUpTo(state, tutorial, roleMap, count) {
    startTutorial(state, tutorial, roleMap);
    const steps = (tutorial && tutorial.steps) || [];
    const limit = Math.max(0, Math.min(steps.length, Number(count) || 0));
    for (let index = 0; index < limit; index += 1) {
      applyTutorialStep(state, steps[index], roleMap);
    }
    state.lesson.stepIndex = limit;
    state.lesson.done = limit >= steps.length;
    return state;
  }

  function comparableValue(source, operator, compareValue) {
    if (!source) return '';
    if (operator === 'enabled' || operator === 'disabled') return Boolean(source.disabled);
    if (operator === 'visible' || operator === 'hidden') return Boolean(source.visible);
    if (operator === 'hasChildren') return Boolean(source.hasChildren);
    if (operator === 'hasClass' || operator === 'notHasClass') {
      return Array.isArray(source.classNames) && source.classNames.includes(String(compareValue || ''));
    }
    if (source.valueKind === 'boolean') return Boolean(source.sampleValue);
    if (source.valueKind === 'number') return Number(source.sampleValue);
    return String(source.sampleValue == null ? '' : source.sampleValue);
  }

  function evaluateSingle(left, operator, right) {
    switch (operator) {
      case 'isEmpty': return String(left == null ? '' : left).trim() === '';
      case 'notEmpty': return String(left == null ? '' : left).trim() !== '';
      case 'isChecked':
      case 'isTrue': return Boolean(left) === true;
      case 'isFalse': return Boolean(left) === false;
      case 'enabled': return Boolean(left) === false;
      case 'disabled': return Boolean(left) === true;
      case 'visible': return Boolean(left) === true;
      case 'hidden': return Boolean(left) === false;
      case 'hasChildren': return Boolean(left) === true;
      case 'hasClass': return Boolean(left) === true;
      case 'notHasClass': return Boolean(left) === false;
      case 'includes': return String(left).includes(String(right));
      case 'startsWith': return String(left).startsWith(String(right));
      case 'endsWith': return String(left).endsWith(String(right));
      case 'lengthGreater': return String(left).length > Number(right);
      case '===': return typeof left === 'number' ? left === Number(right) : String(left) === String(right);
      case '!==': return typeof left === 'number' ? left !== Number(right) : String(left) !== String(right);
      case '>': return Number(left) > Number(right);
      case '<': return Number(left) < Number(right);
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
      default: return false;
    }
  }

  function evaluateCondition(state) {
    const primarySource = descriptorByKey(state, state.sourceKey);
    if (!state.conditionEnabled) return true;
    const primary = evaluateSingle(
      comparableValue(primarySource, state.operator, state.compareValue),
      state.operator,
      state.compareValue
    );
    if (!state.secondCondition) return primary;
    const secondarySource = descriptorByKey(state, state.secondSourceKey);
    const secondary = evaluateSingle(
      comparableValue(secondarySource, state.secondOperator, state.secondCompareValue),
      state.secondOperator,
      state.secondCompareValue
    );
    return state.join === 'OR' ? primary || secondary : primary && secondary;
  }

  function operatorLabel(source, operator) {
    const option = operatorOptions(source).find(item => item.value === operator);
    return option ? option.label.replace(/\.\.\.$/, '') : operator;
  }

  function conditionPart(source, operator, compareValue) {
    if (!source) return 'عنصر غير محدد';
    let sentence = `${source.shortLabel} ${operatorLabel(source, operator)}`;
    if (!NO_VALUE_OPERATORS.has(operator)) sentence += ` «${compareValue}»`;
    return sentence;
  }

  function conditionSentence(state) {
    if (!state.conditionEnabled) return 'بدون شرط إضافي — نفّذ عند وقوع الحدث مباشرة';
    const first = conditionPart(descriptorByKey(state, state.sourceKey), state.operator, state.compareValue);
    if (!state.secondCondition) return first;
    const second = conditionPart(
      descriptorByKey(state, state.secondSourceKey),
      state.secondOperator,
      state.secondCompareValue
    );
    return `${first} ${state.join === 'OR' ? 'أو' : 'و'} ${second}`;
  }

  /* جملة إنسانية لكل إجراء داخل القاعدة */
  function actionPhrase(action, state) {
    const meta = ACTION_TYPES[action.kind] || ACTION_TYPES.setText;
    const target = descriptorByKey(state, action.targetKey);
    const targetLabel = target ? `«${target.shortLabel}»` : 'العنصر';
    const valueSourceElement = action.valueMode === 'element'
      ? descriptorByKey(state, action.valueElementKey)
      : null;
    const fieldLabel = valueSourceElement ? `«${valueSourceElement.shortLabel}»` : 'الحقل';
    if (action.kind === 'appendListItem') {
      return valueSourceElement
        ? `أضِف ما كُتب في ${fieldLabel} إلى ${targetLabel}`
        : `أضِف سطرًا جديدًا إلى ${targetLabel}`;
    }
    if (action.kind === 'clearInput') return `فرّغ ${targetLabel}`;
    if (action.kind === 'setText' && valueSourceElement) return `اعرض قيمة ${fieldLabel} في ${targetLabel}`;
    if (action.kind === 'setText') return `غيّر نص ${targetLabel}`;
    if (action.kind === 'setInputValue' && valueSourceElement) return `انقل قيمة ${fieldLabel} إلى ${targetLabel}`;
    if (action.kind === 'incrementVariable' || action.kind === 'decrementVariable') {
      const counterParams = action.params || {};
      const verb = action.kind === 'incrementVariable' ? 'زد' : 'أنقص';
      const boxName = String(counterParams.variableName || 'counter').trim() || 'counter';
      const cycle = String(counterParams.cycleArray || '').trim();
      const tail = counterParams.display === 'no' ? '' : ` واعرضه في ${targetLabel}`;
      return cycle
        ? `${verb} «${boxName}» ودُر داخل «${cycle}»${tail}`
        : `${verb} «${boxName}»${tail}`;
    }
    if (action.kind === 'removeElement') return `احذف ${targetLabel}`;
    if (action.kind === 'arrayPush') {
      const arrayName = (action.params && action.params.arrayName) || 'items';
      return valueSourceElement
        ? `خزّن ما كُتب في ${fieldLabel} داخل قائمة «${arrayName}»`
        : `أضف قيمة إلى قائمة «${arrayName}»`;
    }
    if (action.kind === 'renderList') return `اعرض قائمة «${(action.params && action.params.arrayName) || 'items'}» داخل ${targetLabel}`;

    /* بطاقات القوائم والنصوص والكونسول لا تعمل على عنصر في الصفحة،
       فجملتها تصف العملية على البيانات نفسها لا على عنصر. */
    const cardParams = action.params || {};
    const listLabel = `«${cardParams.arrayName || 'items'}»`;
    const resultPhrase = String(cardParams.resultName || '').trim()
      ? ` وخزّن الناتج في «${String(cardParams.resultName).trim()}»`
      : '';
    if (action.kind === 'arrayUnshift') return `أضف قيمة في بداية القائمة ${listLabel}`;
    if (action.kind === 'arrayPop') return `احذف آخر عنصر من ${listLabel}${resultPhrase}`;
    if (action.kind === 'arrayShift') return `احذف أول عنصر من ${listLabel}${resultPhrase}`;
    if (action.kind === 'arrayClear') return `فرّغ القائمة ${listLabel}`;
    if (action.kind === 'arraySort') return `رتّب ${listLabel} ${cardParams.direction === 'desc' ? 'تنازليًا' : 'تصاعديًا'}`;
    if (action.kind === 'arrayReverse') return `اعكس ترتيب ${listLabel}`;
    if (action.kind === 'arrayUnique') return `احذف القيم المكررة من ${listLabel}${resultPhrase}`;
    if (action.kind === 'arrayFilter') return `صفِّ ${listLabel} بشرط${resultPhrase}`;
    if (action.kind === 'arrayMap') return `حوّل كل عناصر ${listLabel}${resultPhrase}`;
    if (action.kind === 'arraySlice') return `اقتطع جزءًا من ${listLabel}${resultPhrase}`;
    if (action.kind === 'arrayJoin') return `ادمج ${listLabel} في نص واحد${resultPhrase}`;
    if (action.kind === 'arrayLength') return `احسب عدد عناصر ${listLabel}${resultPhrase}`;
    if (action.kind === 'arraySum') return `اجمع أرقام ${listLabel}${resultPhrase}`;
    if (action.kind === 'arrayIndexOf') return `ابحث عن موضع قيمة في ${listLabel}${resultPhrase}`;
    if (action.kind === 'arrayItem') return `خذ العنصر رقم ${String(cardParams.index || '0').trim() || '0'} من ${listLabel}${resultPhrase}`;
    if (/^string[A-Z]/.test(action.kind)) {
      const from = valueSourceElement ? `نص ${fieldLabel}` : 'النص';
      const phrases = {
        stringSlice: `اقتطع جزءًا من ${from}`,
        stringSplit: `قسّم ${from} إلى قائمة`,
        stringReplace: `استبدل داخل ${from}`,
        stringCase: `غيّر حالة أحرف ${from}`,
        stringTrim: `أزل المسافات الزائدة من ${from}`,
        stringLength: `احسب عدد حروف ${from}`,
        stringConcat: `ادمج ${from} مع نص آخر`,
        stringNumber: `حوّل ${from} إلى رقم`
      };
      return `${phrases[action.kind] || meta.label}${resultPhrase}`;
    }
    if (action.kind === 'consoleLog') return `اطبع ${valueSourceElement ? `قيمة ${fieldLabel}` : 'قيمة'} في الكونسول`;
    if (action.kind === 'consoleTable') return `اعرض ${listLabel} كجدول في الكونسول`;
    if (action.kind === 'consoleClear') return 'امسح الكونسول';
    if (action.kind === 'repeatLoop') return `كرّر كودًا ${(action.params && action.params.count) || 3} مرات`;
    if (action.kind === 'forEachLoop') return `نفّذ كودًا لكل عنصر في «${(action.params && action.params.arrayName) || 'items'}»`;
    if (action.kind === 'callFunction') return `نفّذ الوصفة «${(action.params && action.params.functionName) || 'myFunction'}»`;
    if (meta.targetless) return meta.label;
    return `${meta.label} — ${targetLabel}`;
  }

  /* القاعدة كلها في جملة واحدة: عند … لو … ← … وإلا ← … */
  function ruleSentence(state) {
    const selected = descriptorByKey(state, state.selectedKey);
    if (!selected) return 'اختر عنصرًا من الصفحة لبدء قاعدة جديدة.';
    const eventLabel = EVENT_LABELS[state.event] || state.event;
    const keySuffix = KEY_FILTER_EVENTS.includes(state.event) && String(state.eventKey || '').trim()
      ? ` (${String(state.eventKey).trim()})`
      : '';
    const inside = (state.insideActions || []).map(action => actionPhrase(action, state));
    const elsePhrases = (state.elseActions || []).map(action => actionPhrase(action, state));
    const outside = (state.outsideActions || []).map(action => actionPhrase(action, state));
    let sentence = state.conditionEnabled
      ? `عند ${eventLabel}${keySuffix} على «${selected.shortLabel}»، إذا كان ${conditionSentence(state)} ← ${inside.length ? inside.join('، ثم ') : 'لا خطوات بعد'}`
      : `عند ${eventLabel}${keySuffix} على «${selected.shortLabel}» ← ${inside.length ? inside.join('، ثم ') : 'لا خطوات بعد'}`;
    if (state.conditionEnabled && elsePhrases.length) sentence += `؛ وإلا ← ${elsePhrases.join('، ثم ')}`;
    if (outside.length) sentence += `؛ ودائمًا: ${outside.join('، ثم ')}`;
    const prepParts = [];
    if ((state.memory || []).length) prepParts.push(`${state.memory.length} صندوق ذاكرة`);
    if ((state.recipes || []).length) prepParts.push(`${state.recipes.length} وصفة`);
    if (String(state.preCode || '').trim()) prepParts.push('كود تجهيز');
    if (prepParts.length) sentence += ` (مع تجهيز مسبق: ${prepParts.join(' و')})`;
    return `${sentence}.`;
  }

  function renderRuleBar(state) {
    const selected = descriptorByKey(state, state.selectedKey);
    if (!selected) return '';
    const valid = evaluateCondition(state);
    const hasElse = (state.elseActions || []).length > 0;
    const lampText = !state.conditionEnabled
      ? 'تنفيذ مباشر — الخطوات ستعمل فور وقوع الحدث'
      : (valid
      ? 'الشرط متحقق الآن — القاعدة ستعمل فور وقوع الحدث'
      : (hasElse
        ? 'الشرط غير متحقق الآن — سيعمل مسار «وإلا»'
        : 'الشرط غير متحقق الآن — لن يحدث شيء حتى يتحقق'));
    return `<span class="demo-rule-lamp" data-lamp="${valid ? 'green' : 'red'}" title="${escapeHtml(lampText)}" aria-hidden="true"></span>
      <span class="demo-rule-text">
        <strong id="demo-rule-sentence">${escapeHtml(ruleSentence(state))}</strong>
        <small id="demo-rule-status">${escapeHtml(lampText)}</small>
      </span>`;
  }

  function toCoreAction(action, order, core, defaultTargetId, state) {
    const kind = ACTION_TYPES[action.kind] ? action.kind : 'setText';
    const meta = actionMeta(kind);
    const targetId = action.targetId || defaultTargetId;
    const payload = {
      id: action.id || `demo-action-${order + 1}`,
      type: kind,
      targetId,
      target: { kind: 'element', id: targetId },
      order,
      enabled: true
    };

    const params = {};
    (meta.fields || []).forEach(field => {
      let raw = action.params && action.params[field.key] !== undefined
        ? action.params[field.key]
        : (field.defaultValue !== undefined ? field.defaultValue : '');
      if (field.type === 'element') {
        /* حقل من نوع عنصر (مثل «انسخ من») يُخزَّن كمفتاح ويُحفَظ كمعرّف حقيقي */
        const descriptor = state ? descriptorByKey(state, String(raw || '')) : null;
        if (!descriptor || !descriptor.id) {
          throw new Error(`اختر عنصر «${field.label}» في إجراء «${meta.label}» قبل الحفظ.`);
        }
        params.sourceId = descriptor.id;
        return;
      }
      if (field.type === 'number') {
        const numeric = Number(raw);
        params[field.key] = Number.isFinite(numeric) ? numeric : Number(field.defaultValue || 0);
        return;
      }
      params[field.key] = String(raw == null ? '' : raw);
    });

    if (actionNeedsValue(kind)) {
      const valueSource = meta.dynamic
        ? buildValueSource(action, state)
        : { kind: 'literal', value: String(action.value == null ? '' : action.value) };
      payload.valueSource = valueSource;
      payload.valueType = valueSource.kind === 'literal' ? 'literal' : 'expression';
      payload.value = valueSource.kind === 'literal'
        ? String(valueSource.value == null ? '' : valueSource.value)
        : String(action.value == null ? '' : action.value);
    }

    if (kind === 'setText') params.method = 'textContent';
    if (kind === 'show') params.display = '';
    if (['addClass', 'removeClass', 'toggleClass'].includes(kind)) {
      params.className = String(action.value || 'active');
    }
    /* «اعرض الرقم» قائمة اختيار نصّية في الواجهة، وقيمة منطقية في المحرك */
    if (kind === 'incrementVariable' || kind === 'decrementVariable') params.display = params.display !== 'no';

    /* «اعرض قائمة البيانات»: المستخدم لا يكتب كودًا — نولّده نحن من إعداداته.
       سطر التعليق الأول علامة تُمكّن إعادة فتح البطاقة كما هي عند التعديل. */
    if (kind === 'renderList') {
      const arrayName = core.safeIdentifier(String(params.arrayName || 'items'), 'items');
      const itemTag = ['li', 'div', 'p'].includes(params.itemTag) ? params.itemTag : 'li';
      payload.type = 'custom';
      payload.params = {
        code: `// osoos-demo:renderList ${arrayName} ${itemTag}\n` +
          `const renderItems = Array.isArray(${arrayName}) ? ${arrayName} : [];\n` +
          `if (targetElement.replaceChildren) { targetElement.replaceChildren(); } else { targetElement.textContent = ''; }\n` +
          `renderItems.forEach(item => {\n` +
          `  const renderedNode = document.createElement(${JSON.stringify(itemTag)});\n` +
          `  renderedNode.textContent = String(item ?? '');\n` +
          `  targetElement.appendChild(renderedNode);\n` +
          `});`
      };
      return core.normalizeAction(payload, order, targetId);
    }

    /* حلقات التكرار: تُترجم إلى loop حقيقي في المحرك وبداخله كود المستخدم */
    if (kind === 'repeatLoop' || kind === 'forEachLoop') {
      payload.type = 'loop';
      payload.loopType = kind === 'repeatLoop' ? 'repeat' : 'forEach';
      if (kind === 'repeatLoop') {
        const count = Number(params.count);
        payload.count = { sourceType: 'literal', dataType: 'number', value: String(Number.isFinite(count) && count > 0 ? count : 3) };
      } else {
        payload.source = { sourceType: 'state', variableName: String(params.arrayName || 'items') };
      }
      payload.variables = { itemName: 'item', indexName: 'index' };
      payload.actions = [{
        id: `${payload.id}-body`,
        type: 'custom',
        target: { kind: 'target', id: '' },
        params: { code: String(params.code || '// اكتب الكود هنا') },
        enabled: true,
        order: 0
      }];
      return core.normalizeAction(payload, order, targetId);
    }

    if (Object.keys(params).length) payload.params = params;
    return core.normalizeAction(payload, order, targetId);
  }

  /* نوع ناتج كل بطاقة، حتى يبدأ الصندوق بقيمة ابتدائية منطقية:
     0 للأعداد، [] للقوائم، '' لما عداهما. */
  const RESULT_TYPES = Object.freeze({
    arrayUnique: 'Array', arrayFilter: 'Array', arrayMap: 'Array', arraySlice: 'Array', stringSplit: 'Array',
    arrayLength: 'Number', arraySum: 'Number', arrayIndexOf: 'Number', stringLength: 'Number', stringNumber: 'Number'
  });

  /* المتغيرات المستخدمة في الإجراءات تُعلَن تلقائيًا في التعريف حتى يعمل الكود المولد مباشرة */
  function collectAutoVariables(state) {
    const rank = { String: 0, Number: 1, Boolean: 2, Array: 3 };
    const registry = new Map();
    const use = (name, type) => {
      const clean = String(name == null ? '' : name).trim();
      if (!clean || /^state\./.test(clean)) return;
      const existing = registry.get(clean);
      if (!existing || rank[type] > rank[existing]) registry.set(clean, type);
    };
    []
      .concat(state.insideActions || [], state.elseActions || [], state.outsideActions || [])
      .forEach(action => {
        const params = action.params || {};
        if (action.kind === 'incrementVariable' || action.kind === 'decrementVariable') use(params.variableName || 'counter', 'Number');
        if (action.kind === 'toggleBoolean') use(params.variableName || 'isOpen', 'Boolean');
        /* كل بطاقة تعمل على قائمة تحتاج صندوقًا من نوع Array معرَّفًا قبل الحدث،
           وإلا أشار الكود المولَّد إلى اسم غير موجود. */
        if (/^array[A-Z]/.test(action.kind) || action.kind === 'consoleTable') use(params.arrayName || 'items', 'Array');
        if (action.kind === 'forEachLoop') use(params.arrayName || 'items', 'Array');
        if (action.kind === 'renderList') use(params.arrayName || 'items', 'Array');
        if (action.kind === 'setVariable') use(params.variableName || 'value', 'String');
        /* اسم الناتج يصير صندوقًا معلنًا قبل الحدث، فتقرأه الخطوات التالية
           وفرعا «وإلا» و«دائمًا» بلا خطأ، وتبقى قيمته بين نقرة وأخرى. */
        if (String(params.resultName || '').trim()) use(params.resultName, RESULT_TYPES[action.kind] || 'String');
        if (actionMeta(action.kind).dynamic && action.valueMode === 'variable') use(action.valueVariable, 'String');
      });
    return registry;
  }

  function buildCondition(state, source, operator, compareValue, index, core, readName) {
    return core.normalizeCondition({
      id: `demo-condition-${index + 1}`,
      left: readName,
      operator,
      right: NO_VALUE_OPERATORS.has(operator) ? '' : String(compareValue == null ? '' : compareValue),
      rightType: 'literal',
      join: index === 0 ? 'AND' : (state.join === 'OR' ? 'OR' : 'AND'),
      order: index,
      enabled: true
    }, index);
  }

  function valueNameFor(source, core, fallback) {
    const id = source && source.id ? source.id : '';
    if (core && typeof core.readableValueName === 'function') return core.readableValueName(id, fallback);
    return core.safeIdentifier(fallback, 'fieldValue');
  }

  function buildRead(source, operator, index, core, readName) {
    if (!source || !source.id) throw new Error('العنصر المستخدم في الفحص يحتاج معرّفًا قبل الحفظ.');
    return core.normalizeRead({
      id: `demo-read-${index + 1}`,
      type: readTypeForCondition(source, operator),
      elementId: source.id,
      source: { kind: 'element', elementId: source.id },
      name: readName,
      order: index,
      enabled: true
    }, index);
  }

  function buildDefinition(state, core) {
    if (!core || typeof core.createDefinition !== 'function') {
      throw new Error('VisualLogicCore is required to build the Demo definition.');
    }
    const selected = descriptorByKey(state, state.selectedKey);
    const primarySource = descriptorByKey(state, state.sourceKey);
    if (!selected || !selected.id) throw new Error('اختر عنصرًا من الصفحة قبل الحفظ.');
    const conditionEnabled = Boolean(state.conditionEnabled);
    if (conditionEnabled && (!primarySource || !primarySource.id)) throw new Error('اختر عنصرًا صالحًا للفحص.');

    const allActions = []
      .concat(state.insideActions || [], state.elseActions || [], state.outsideActions || []);
    const firstTarget = allActions.find(action => action.targetId);
    const targetId = firstTarget ? firstTarget.targetId : selected.id;
    const definitionId = state.savedDefinitionId || `osoos-demo-${selected.id}`;
    const definition = core.createDefinition(selected.id, targetId, definitionId, 'general');
    definition.event = state.event || defaultEventFor(selected);
    /* اسم القيمة يُشتق من معرّف العنصر نفسه ليقرأ المستخدم كودًا مفهومًا:
       note-input ← noteInputValue، بدل اسم آلي مثل demoValue. */
    const readName = conditionEnabled ? valueNameFor(primarySource, core, 'fieldValue') : '';
    definition.reads = conditionEnabled
      ? [buildRead(primarySource, state.operator, 0, core, readName)]
      : [];

    const conditions = conditionEnabled
      ? [buildCondition(state, primarySource, state.operator, state.compareValue, 0, core, readName)]
      : [];
    if (conditionEnabled && state.secondCondition) {
      const secondSource = descriptorByKey(state, state.secondSourceKey);
      if (!secondSource || !secondSource.id) throw new Error('العنصر المستخدم في الفحص الثاني يحتاج معرّفًا.');
      /* لو أدّى الاشتقاق إلى نفس الاسم (نفس العنصر مرتين) نميّز الثاني برقم */
      const candidate = valueNameFor(secondSource, core, 'fieldValue2');
      const secondName = candidate === readName ? candidate + '2' : candidate;
      definition.reads.push(buildRead(secondSource, state.secondOperator, 1, core, secondName));
      conditions.push(buildCondition(
        state,
        secondSource,
        state.secondOperator,
        state.secondCompareValue,
        1,
        core,
        secondName
      ));
    }

    const ifActions = (state.insideActions || []).map((action, index) =>
      toCoreAction(action, index, core, targetId, state)
    );
    const elseActions = (state.elseActions || []).map((action, index) =>
      toCoreAction(action, index, core, targetId, state)
    );
    const branches = [{
      id: 'demo-branch-if',
      branchType: 'if',
      condition: { conditions, conditionGroups: [] },
      actions: ifActions
    }];
    if (elseActions.length) {
      branches.push({
        id: 'demo-branch-else',
        branchType: 'else',
        condition: { conditions: [], conditionGroups: [] },
        actions: elseActions
      });
    }

    /* بوابة بلا خطوات = «if» فارغ في الكود الناتج، ومعه سطر قراءة لا يقرؤه أحد.
       المستخدم طلب كودًا مقروءًا، فلا نكتب له سطورًا لا تفعل شيئًا: نحذف
       البوابة وقراءتها، ونعيدهما لحظة إضافة أول خطوة داخلها. */
    const gateHasSteps = conditionEnabled && (ifActions.length > 0 || elseActions.length > 0);
    if (!gateHasSteps) definition.reads = [];

    const branch = gateHasSteps ? core.normalizeAction({
      id: 'demo-condition-gate',
      type: 'branch',
      targetId,
      target: { kind: 'element', id: targetId },
      order: 0,
      enabled: true,
      branches
    }, 0, targetId) : null;
    const outsideActions = (state.outsideActions || []).map((action, index) =>
      toCoreAction(action, index + (branch ? 1 : ifActions.length), core, targetId, state)
    );
    definition.actions = conditionEnabled
      ? (branch ? [branch] : []).concat(outsideActions)
      : ifActions.concat(outsideActions);

    /* ── مرحلة «قبل الحدث» ──
       1) صناديق الذاكرة التي عرّفها المستخدم  2) المتغيرات التلقائية للعدادات
       3) الوصفات (Functions)  4) كود التجهيز الحر */
    const memoryVars = (state.memory || [])
      .filter(box => String(box.name || '').trim())
      .map((box, index) => core.normalizeVariable({
        id: `demo-box-${index + 1}`,
        name: box.name,
        type: ['Number', 'String', 'Boolean', 'Array'].includes(box.type) ? box.type : 'Number',
        initialValue: String(box.initialValue == null ? '' : box.initialValue),
        scope: 'outsideEvent',
        enabled: true,
        order: index
      }, index));
    const declaredNames = new Set(memoryVars.map(variable => variable.name));
    const autoVariables = collectAutoVariables(state);
    const autoVars = Array.from(autoVariables.entries())
      .filter(([name]) => !declaredNames.has(name))
      .map(([name, type], index) => core.normalizeVariable({
        id: `demo-var-${index + 1}`,
        name,
        type,
        scope: 'outsideEvent',
        enabled: true,
        order: memoryVars.length + index
      }, memoryVars.length + index));
    definition.state = memoryVars.concat(autoVars);

    definition.functions = (state.recipes || [])
      .filter(recipe => String(recipe.name || '').trim() && String(recipe.code || '').trim())
      .map((recipe, index) => core.normalizeFunction({
        id: `demo-recipe-${index + 1}`,
        name: recipe.name,
        parameters: String(recipe.params || ''),
        customCode: String(recipe.code || ''),
        enabled: true,
        order: index
      }, index));

    if (String(state.preCode || '').trim()) {
      definition.advancedOperations = [core.normalizeAdvancedOperation({
        id: 'demo-precode',
        toolId: 'custom.code',
        destination: 'state',
        settings: { code: String(state.preCode) },
        enabled: true,
        order: 0
      }, 0)];
    }

    const settings = {
      entry: 'interaction-demo',
      selectedElementId: selected.id,
      title: `Demo — ${selected.shortLabel}`
    };
    const keyFilter = String(state.eventKey || '').trim();
    if (KEY_FILTER_EVENTS.includes(definition.event) && keyFilter) {
      settings.eventSettings = { key: keyFilter };
    }
    definition.settings = Object.assign({}, definition.settings || {}, settings);
    return core.normalizeDefinition(definition);
  }

  /* شرح قصير لكل نوع صندوق، يظهر تحت صفّه في قائمة التعريف.
     الفكرة: السطر لا ينفّذ شيئًا الآن، بل يحجز خانة ستُملأ لاحقًا. */
  const DECLARE_NOTES = Object.freeze({
    Number: 'خانة تحفظ رقمًا. لا تفعل شيئًا الآن، لكن خطوات التنفيذ تكتب فيها وتقرأ منها.',
    String: 'خانة تحفظ نصًا. تبدأ بقيمة، ثم تتغيّر عند التنفيذ.',
    Boolean: 'خانة تحفظ نعم/لا فقط (true أو false).',
    Array: 'خانة تحفظ قائمة قيم — تُضيف إليها وتقرأ منها وتعرضها.'
  });

  /* شريحة الكود على البطاقة لا تكرّر ما تقوله البطاقة نفسها:
     نحذف سطر «// رقم. اسم الإجراء» وعلامة البطاقة الداخلية. */
  function cleanCodeFragment(fragment) {
    return String(fragment == null ? '' : fragment)
      .split('\n')
      .filter(line => !/^\s*\/\/\s*\d+\.\s/.test(line) && !/^\s*\/\/\s*osoos-demo:/.test(line))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /* خريطة الكود المولَّد مقسومة إلى قائمتين بنفس ترتيب سطور الملف:
     «التعريف» — ما يُحجز مرة واحدة قبل الحدث (أسماء وخانات ووصفات)،
     «التنفيذ» — ما يجري فعلًا عند وقوع الحدث (قراءة، فحص، خطوات).
     ولكل صفٍّ سطره الحقيقي كما سيُكتب في الملف، لا شرحًا عنه. */
  function buildCodeOutline(state, core) {
    const outline = { ok: false, error: '', code: '', declare: [], execute: [] };
    if (!core || typeof core.generateTracedCode !== 'function') {
      outline.error = 'محرّك الكود غير متاح الآن.';
      return outline;
    }
    let definition;
    let traced = { code: '', steps: {} };
    try {
      definition = buildDefinition(state, core);
    } catch (error) {
      outline.error = (error && error.message) || 'أكمل القاعدة أولًا.';
      return outline;
    }
    /* القاعدة قد تكون ناقصة أثناء البناء: نعرض الصفوف على أي حال
       (بلا شريحة كود) حتى يبقى المستخدم قادرًا على إكمالها من مكانه. */
    try {
      traced = core.generateTracedCode(definition);
      outline.ok = true;
      outline.code = traced.code;
    } catch (error) {
      outline.error = (error && error.message) || 'أكمل القاعدة أولًا.';
    }

    let counter = 0;
    const add = (list, row) => {
      row.number = ++counter;
      row.code = cleanCodeFragment(traced.steps[row.id]);
      list.push(row);
      return row;
    };
    const selected = descriptorByKey(state, state.selectedKey);

    /* ①  التعريف — بالترتيب الذي يكتبه المولّد: العنصر، الصناديق، كود التجهيز، الوصفات */
    add(outline.declare, {
      id: 'decl:source-element',
      editor: 'source',
      icon: 'fa-hand-pointer',
      title: `أمسك العنصر: ${selected ? selected.shortLabel : ''}`,
      note: 'أول سطر في أي كود: نحضر العنصر من الصفحة ونحفظه باسم، فلا نبحث عنه مرة أخرى.'
    });

    const memoryBoxes = (state.memory || []).filter(box => String(box.name || '').trim());
    (definition.state || []).forEach(variable => {
      const match = /^demo-box-(\d+)$/.exec(String(variable.id || ''));
      const box = match ? memoryBoxes[Number(match[1]) - 1] : null;
      add(outline.declare, {
        id: `decl:${variable.id}`,
        editor: box ? 'memory' : 'auto',
        boxId: box ? box.id : '',
        icon: box ? 'fa-brain' : 'fa-wand-magic-sparkles',
        title: box ? `صندوق: ${variable.name}` : `صندوق تلقائي: ${variable.name}`,
        note: box
          ? (DECLARE_NOTES[variable.type] || '')
          : 'أنشأناه لك لأن إحدى بطاقات التنفيذ تكتب نتيجتها فيه — بدونه لا يعمل الكود.'
      });
    });

    (definition.advancedOperations || [])
      .filter(operation => operation.destination === 'state' && operation.enabled !== false)
      .forEach(operation => add(outline.declare, {
        id: `decl:${operation.id}`,
        editor: 'preCode',
        icon: 'fa-gears',
        title: 'كود تجهيز حر',
        note: 'يعمل مرة واحدة قبل الحدث — بعد الصناديق مباشرة.'
      }));

    const recipes = (state.recipes || [])
      .filter(recipe => String(recipe.name || '').trim() && String(recipe.code || '').trim());
    (definition.functions || []).forEach((fn, index) => {
      const recipe = recipes[index];
      add(outline.declare, {
        id: `decl:${fn.id}`,
        editor: 'recipe',
        recipeId: recipe ? recipe.id : '',
        icon: 'fa-box-open',
        title: `وصفة: ${fn.name}`,
        note: 'كود محفوظ باسم. لا يعمل الآن؛ ينتظر خطوة تنفيذ تناديه.'
      });
    });

    /* ②  التنفيذ — الحدث، ثم القراءة، ثم البوابة، ثم الخطوات بترتيبها */
    add(outline.execute, {
      id: 'run:trigger',
      editor: 'trigger',
      icon: 'fa-bolt',
      title: `عند ${EVENT_LABELS[state.event] || state.event} على ${selected ? selected.shortLabel : ''}`,
      note: 'من هنا يبدأ التنفيذ الفعلي. كل ما تحته لا يعمل إلا بعد وقوع الحدث.'
    });
    if (traced.steps['run:reads']) {
      const readSource = descriptorByKey(state, state.sourceKey);
      add(outline.execute, {
        id: 'run:reads',
        editor: 'read',
        icon: 'fa-eye',
        title: `اقرأ قيمة: ${readSource ? readSource.shortLabel : ''}`,
        note: 'القراءة تحدث لحظة الحدث، فتحصل على القيمة الحالية لا القديمة.'
      });
    }
    /* الصفّ يظهر فقط إن كانت البوابة موجودة فعلًا في الكود — نسأل التعريف
       نفسه لا الحالة، فلا يفترق ما يراه المستخدم عمّا يُكتب له. */
    if ((definition.actions || []).some(action => action.id === 'demo-condition-gate')) {
      add(outline.execute, {
        id: 'demo-condition-gate',
        editor: 'condition',
        icon: 'fa-code-branch',
        title: `لو: ${conditionSentence(state)}`,
        note: 'ما بين القوسين يعمل عند تحقق الشرط، وما بعد «وإلا» عند عدم تحققه.'
      });
    }

    (state.conditionEnabled
      ? [['inside', state.insideActions], ['else', state.elseActions], ['outside', state.outsideActions]]
      : [['inside', state.insideActions], ['outside', state.outsideActions]])
      .forEach(pair => {
        const group = pair[0];
        (pair[1] || []).forEach((action, index) => {
          const meta = ACTION_TYPES[action.kind] || ACTION_TYPES.setText;
          add(outline.execute, {
            id: action.id,
            editor: 'action',
            group,
            index,
            total: (pair[1] || []).length,
            action,
            icon: meta.icon || 'fa-bolt',
            title: actionLabel(action, state),
            note: group === 'else'
              ? 'يعمل فقط عندما لا يتحقق الشرط.'
              : (group === 'outside' ? 'خارج البوابة — يعمل في كل مرة يقع فيها الحدث.' : '')
          });
        });
      });

    return outline;
  }

  function actionValueFromCore(action) {
    if (!action) return '';
    if (['addClass', 'removeClass', 'toggleClass'].includes(action.type)) {
      return String((action.params && action.params.className) || action.value || 'active');
    }
    const source = action.valueSource;
    if (source && typeof source === 'object' && source.kind !== 'literal' && source.kind !== 'text') {
      /* القيمة الديناميكية لا تُعرَض كنص ثابت؛ الوضع نفسه يُستعاد في actionFromCore */
      return '';
    }
    return String(action.value == null ? '' : action.value);
  }

  function actionFromCore(action, state, group, index) {
    /* كود مولّد من بطاقة «اعرض قائمة البيانات» → يعود بطاقة كما كان، لا كودًا خامًا */
    if (action.type === 'custom') {
      const code = String((action.params && action.params.code) || action.value || '');
      const marker = code.match(/^\/\/ osoos-demo:renderList (\S+) (\S+)/);
      if (marker) {
        const target = descriptorById(state, action.targetId) || descriptorByKey(state, state.selectedKey);
        const params = defaultParamsFor('renderList');
        params.arrayName = marker[1];
        params.itemTag = ['li', 'div', 'p'].includes(marker[2]) ? marker[2] : 'li';
        return {
          id: action.id || `demo-${group}-${index + 1}`,
          kind: 'renderList',
          targetKey: target ? target.key : state.selectedKey,
          targetId: action.targetId || (target && target.id) || '',
          value: '',
          valueMode: 'static',
          valueElementKey: '',
          valueVariable: '',
          params
        };
      }
    }
    /* loop حقيقي محفوظ → بطاقة تكرار قابلة للتعديل في الواجهة */
    if (action.type === 'loop') {
      const loopKind = action.loopType === 'forEach' ? 'forEachLoop' : 'repeatLoop';
      const bodyAction = (action.actions || []).find(item => item && item.type === 'custom');
      const bodyCode = bodyAction
        ? String((bodyAction.params && bodyAction.params.code) || bodyAction.value || '')
        : '';
      const loopParams = defaultParamsFor(loopKind);
      loopParams.code = bodyCode;
      if (loopKind === 'repeatLoop') {
        loopParams.count = String((action.count && action.count.value) || '3');
      } else {
        loopParams.arrayName = String((action.source && action.source.variableName) || 'items');
      }
      return {
        id: action.id || `demo-${group}-${index + 1}`,
        kind: loopKind,
        targetKey: state.selectedKey,
        targetId: action.targetId || '',
        value: '',
        valueMode: 'static',
        valueElementKey: '',
        valueVariable: '',
        params: loopParams
      };
    }
    const kind = ACTION_TYPES[action.type] ? action.type : 'setText';
    const meta = actionMeta(kind);
    const target = descriptorById(state, action.targetId) || descriptorByKey(state, state.selectedKey);
    const coreParams = action.params || {};
    const result = {
      id: action.id || `demo-${group}-${index + 1}`,
      kind,
      targetKey: target ? target.key : state.selectedKey,
      targetId: action.targetId || (target && target.id) || '',
      value: actionValueFromCore(action),
      valueMode: 'static',
      valueElementKey: '',
      valueVariable: '',
      params: defaultParamsFor(kind)
    };

    (meta.fields || []).forEach(field => {
      if (field.type === 'element') {
        const descriptor = descriptorById(state, String(coreParams.sourceId || ''));
        if (descriptor) result.params[field.key] = descriptor.key;
        return;
      }
      if (coreParams[field.key] !== undefined && coreParams[field.key] !== null) {
        result.params[field.key] = String(coreParams[field.key]);
      }
    });
    if (kind === 'custom' && !String(result.params.code || '').trim()) {
      result.params.code = String(coreParams.code || action.value || '');
    }
    if ((kind === 'delayedAction' || kind === 'setInterval') && !String(result.params.body || '').trim()) {
      result.params.body = String(coreParams.body || coreParams.code || '');
    }

    const source = action.valueSource;
    if (meta.dynamic && source && typeof source === 'object') {
      if (source.kind === 'element') {
        const descriptor = descriptorById(state, String(source.elementId || source.id || ''));
        if (descriptor) {
          result.valueMode = 'element';
          result.valueElementKey = descriptor.key;
        }
      } else if (source.kind === 'state') {
        result.valueMode = 'variable';
        result.valueVariable = String(source.name || source.value || '');
      }
    }
    return result;
  }

  function hydrateStateFromDefinition(baseState, definition) {
    const state = clone(baseState);
    state.savedDefinitionId = definition.id || '';
    state.event = definition.event || state.event;
    const savedEventSettings = definition.settings && definition.settings.eventSettings;
    state.eventKey = savedEventSettings && savedEventSettings.key ? String(savedEventSettings.key) : '';
    const branch = (definition.actions || []).find(action => action.type === 'branch');
    const ifBranch = branch && (branch.branches || []).find(item => item.branchType === 'if');
    const elseBranch = branch && (branch.branches || []).find(item => item.branchType === 'else');
    const conditions = ifBranch && ifBranch.condition ? (ifBranch.condition.conditions || []) : [];
    state.conditionEnabled = Boolean(branch);

    if (definition.reads && definition.reads[0]) {
      const source = descriptorById(state, definition.reads[0].elementId);
      if (source) state.sourceKey = source.key;
    }
    if (conditions[0]) {
      state.operator = conditions[0].operator;
      state.compareValue = String(conditions[0].right == null ? '' : conditions[0].right);
    }
    if (definition.reads && definition.reads[1] && conditions[1]) {
      const second = descriptorById(state, definition.reads[1].elementId);
      state.secondCondition = true;
      if (second) state.secondSourceKey = second.key;
      state.secondOperator = conditions[1].operator;
      state.secondCompareValue = String(conditions[1].right == null ? '' : conditions[1].right);
      state.join = conditions[1].join === 'OR' ? 'OR' : 'AND';
    }

    state.insideActions = ifBranch
      ? (ifBranch.actions || []).map((action, index) => actionFromCore(action, state, 'inside', index))
      : (definition.actions || [])
        .filter(action => action.type !== 'branch')
        .map((action, index) => actionFromCore(action, state, 'inside', index));
    state.elseActions = elseBranch
      ? (elseBranch.actions || []).map((action, index) => actionFromCore(action, state, 'else', index))
      : [];
    state.outsideActions = branch
      ? (definition.actions || [])
        .filter(action => action.type !== 'branch')
        .map((action, index) => actionFromCore(action, state, 'outside', index))
      : [];

    /* استرجاع مرحلة «قبل الحدث»: الصناديق والوصفات وكود التجهيز */
    const autoNames = collectAutoVariables(state);
    state.memory = (definition.state || [])
      .filter(variable => variable && variable.enabled !== false)
      .filter(variable => String(variable.id || '').indexOf('demo-box-') === 0 || !autoNames.has(variable.name))
      .map(variable => ({
        id: variable.id || `box-${variable.name}`,
        name: String(variable.name || ''),
        type: ['Number', 'String', 'Boolean', 'Array'].includes(variable.type)
          ? variable.type
          : (variable.type === 'Counter' ? 'Number' : 'String'),
        initialValue: String(variable.initialValue == null ? '' : variable.initialValue)
      }));
    state.recipes = (definition.functions || [])
      .filter(fn => fn && fn.enabled !== false)
      .map(fn => ({
        id: fn.id || `recipe-${fn.name}`,
        name: String(fn.name || ''),
        params: (fn.parameters || []).map(parameter => parameter.name || parameter).join(', '),
        code: String(fn.customCode || '')
      }));
    const preOp = (definition.advancedOperations || []).find(operation =>
      operation && operation.enabled !== false && operation.toolId === 'custom.code' && operation.destination === 'state'
    );
    state.preCode = preOp ? String((preOp.settings && preOp.settings.code) || '') : '';
    state.dirty = false;
    state.saveMessage = 'تم تحميل التفاعل المحفوظ لهذا العنصر. أي تعديل لن يُطبّق إلا عند الضغط على «حفظ التفاعل».';
    return state;
  }

  function iconForElement(source) {
    const tag = String(source && source.tag || '').toLowerCase();
    if (tag === 'button') return 'fa-hand-pointer';
    if (tag === 'input' || tag === 'textarea') return 'fa-i-cursor';
    if (tag === 'select') return 'fa-list';
    if (/^h[1-6]$/.test(tag)) return 'fa-heading';
    if (tag === 'img') return 'fa-image';
    if (tag === 'form') return 'fa-table-list';
    if (tag === 'a') return 'fa-link';
    return 'fa-cube';
  }

  function renderElementOptions(state, selectedKey) {
    const labelCounts = (state.elements || []).reduce((counts, source) => {
      counts[source.label] = (counts[source.label] || 0) + 1;
      return counts;
    }, {});
    return (state.elements || []).map(source => {
      const needsDisambiguation = labelCounts[source.label] > 1 && source.technical;
      const label = needsDisambiguation ? `${source.label} — ${source.technical}` : source.label;
      return `<option value="${escapeHtml(source.key)}" title="${escapeHtml(source.technical || '')}" ${source.key === selectedKey ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');
  }

  function renderSourceChips(state) {
    const chips = (state.elements || []).slice(0, 8).map(source => {
      const checked = state.sourceKey === source.key;
      return `<label class="demo-chip${checked ? ' is-selected' : ''}">
        <input type="radio" name="demo-source" value="${escapeHtml(source.key)}" ${checked ? 'checked' : ''}>
        <i class="fas ${iconForElement(source)}" aria-hidden="true"></i>
        <span>${escapeHtml(source.shortLabel)}</span>
        ${checked ? '<i class="fas fa-check demo-chip__check" aria-hidden="true"></i>' : ''}
      </label>`;
    }).join('');

    return `${chips}
      <label class="demo-page-element-picker">
        <i class="fas fa-crosshairs" aria-hidden="true"></i>
        <span>كل عناصر الصفحة</span>
        <select data-demo-input="source-select" aria-label="اختر عنصر الفحص من الصفحة">
          ${renderElementOptions(state, state.sourceKey)}
        </select>
      </label>`;
  }

  function renderOperatorChips(state, source, operator, name) {
    return operatorOptions(source).map(option => {
      const checked = operator === option.value;
      return `<label class="demo-chip demo-chip--operator${checked ? ' is-selected' : ''}">
        <input type="radio" name="${name}" value="${escapeHtml(option.value)}" ${checked ? 'checked' : ''}>
        <span>${escapeHtml(option.label)}</span>
        ${checked ? '<i class="fas fa-check demo-chip__check" aria-hidden="true"></i>' : ''}
      </label>`;
    }).join('');
  }

  function formatSampleValue(source, operator, compareValue) {
    if (!source) return 'غير متاح';
    if (operator === 'enabled' || operator === 'disabled') return source.disabled ? 'معطّل' : 'جاهز للاستخدام';
    if (operator === 'visible' || operator === 'hidden') return source.visible ? 'ظاهر' : 'مخفي';
    if (operator === 'hasChildren') return source.hasChildren ? 'يحتوي عناصر' : 'لا يحتوي عناصر';
    if (operator === 'hasClass' || operator === 'notHasClass') {
      return Array.isArray(source.classNames) && source.classNames.includes(String(compareValue || ''))
        ? `يحمل Class «${compareValue}»`
        : `لا يحمل Class «${compareValue}»`;
    }
    if (source.valueKind === 'boolean') return source.sampleValue ? 'مفعّلة' : 'غير مفعّلة';
    const value = String(source.sampleValue == null ? '' : source.sampleValue);
    return value || 'فارغة';
  }

  function renderCompareField(id, inputName, source, operator, value) {
    if (NO_VALUE_OPERATORS.has(operator)) return '';
    return `<div class="demo-question demo-value demo-value-row">
      <label for="${id}"><b>القيمة:</b></label>
      <input id="${id}" data-demo-input="${inputName}" type="${source && source.valueKind === 'number' ? 'number' : 'text'}" value="${escapeHtml(value)}" dir="ltr">
    </div>`;
  }

  function renderSecondCondition(state) {
    if (!state.secondCondition) return '';
    const source = descriptorByKey(state, state.secondSourceKey);
    return `<div class="demo-second-condition">
      <label>
        <span>العنصر الثاني</span>
        <select data-demo-input="second-source">${renderElementOptions(state, state.secondSourceKey)}</select>
      </label>
      <div class="demo-chipset">${renderOperatorChips(state, source, state.secondOperator, 'demo-second-operator')}</div>
      ${renderCompareField('demo-second-compare-value', 'second-compare-value', source, state.secondOperator, state.secondCompareValue)}
    </div>`;
  }

  /* ── مرحلة «قبل الحدث»: صناديق الذاكرة + الوصفات + كود التجهيز ── */
  const MEMORY_TYPES = Object.freeze([
    ['Number', 'رقم'],
    ['String', 'نص'],
    ['Boolean', 'نعم / لا'],
    ['Array', 'قائمة Array']
  ]);

  const MEMORY_PLACEHOLDERS = Object.freeze({
    Number: 'مثل: 0',
    String: "مثل: زائر",
    Boolean: 'true أو false',
    /* القائمة تقبل بيانات جاهزة لا [] فقط — والتلميح يقول ذلك بمثال */
    Array: 'مثل: [] أو ["أحمد", "منى"]'
  });

  /* محرّر صندوق واحد — يعيش الآن داخل صفّه في «قائمة التعريف»،
     فيرى المستخدم الخانة التي يحرّرها والسطر الذي تكتبه جنبًا إلى جنب. */
  function renderMemoryEditor(box) {
    if (!box) return '';
    return `<div class="demo-memory-row" data-box-id="${escapeHtml(box.id)}">
      <input data-demo-input="memory-name" data-box-id="${escapeHtml(box.id)}" dir="ltr" value="${escapeHtml(box.name)}" placeholder="اسم لاتيني مثل: score" aria-label="اسم الصندوق">
      <select data-demo-input="memory-type" data-box-id="${escapeHtml(box.id)}" aria-label="نوع الصندوق">${MEMORY_TYPES.map(([value, label]) => `<option value="${value}" ${box.type === value ? 'selected' : ''}>${label}</option>`).join('')}</select>
      <input data-demo-input="memory-initial" data-box-id="${escapeHtml(box.id)}" dir="ltr" value="${escapeHtml(box.initialValue)}" placeholder="${escapeHtml(MEMORY_PLACEHOLDERS[box.type] || 'القيمة الأولية')}" aria-label="القيمة الأولية">
    </div>`;
  }

  function renderRecipeEditor(recipe) {
    if (!recipe) return '';
    return `<div class="demo-recipe-row" data-recipe-id="${escapeHtml(recipe.id)}">
      <div class="demo-recipe-row__head">
        <input data-demo-input="recipe-name" data-recipe-id="${escapeHtml(recipe.id)}" dir="ltr" value="${escapeHtml(recipe.name)}" placeholder="اسم الوصفة مثل: addTask" aria-label="اسم الوصفة">
        <input data-demo-input="recipe-params" data-recipe-id="${escapeHtml(recipe.id)}" dir="ltr" value="${escapeHtml(recipe.params)}" placeholder="المدخلات (اختياري): text, count" aria-label="مدخلات الوصفة">
      </div>
      <textarea data-demo-input="recipe-code" data-recipe-id="${escapeHtml(recipe.id)}" class="demo-action-code" dir="ltr" rows="3" spellcheck="false" placeholder="// كود الوصفة — sourceElement وstate متاحان">${escapeHtml(recipe.code)}</textarea>
    </div>`;
  }

  function renderPreCodeEditor(state) {
    return `<textarea data-demo-input="pre-code" class="demo-action-code" dir="ltr" rows="4" spellcheck="false" placeholder="// يعمل بعد تعريف الصناديق مباشرة — sourceElement وstate متاحان">${escapeHtml(state.preCode || '')}</textarea>`;
  }

  /* شريحة الكود: السطر الحقيقي الذي كتبه هذا الصفّ في الملف — لا شرحًا عنه.
     الاتجاه LTR لأن الكود إنجليزي، بينما البطاقة حولها عربية RTL. */
  function renderCodeChip(code) {
    const text = String(code == null ? '' : code).trim();
    if (!text) return '';
    return `<pre class="demo-code-chip" dir="ltr" aria-label="السطر الذي يكتبه هذا الصف">${escapeHtml(text)}</pre>`;
  }

  /* صفّ في «قائمة التعريف»: رقمه، عنوانه، ما يفعله، محرّره، ثم سطره. */
  function renderDeclareRow(row, state) {
    const box = row.editor === 'memory'
      ? (state.memory || []).find(item => item.id === row.boxId)
      : null;
    const recipe = row.editor === 'recipe'
      ? (state.recipes || []).find(item => item.id === row.recipeId)
      : null;
    let editorMarkup = '';
    let removeMarkup = '';
    if (row.editor === 'memory' && box) {
      editorMarkup = renderMemoryEditor(box);
      removeMarkup = `<button type="button" data-demo-action="remove-memory" data-box-id="${escapeHtml(box.id)}" aria-label="حذف الصندوق"><i class="fas fa-trash" aria-hidden="true"></i></button>`;
    } else if (row.editor === 'recipe' && recipe) {
      editorMarkup = renderRecipeEditor(recipe);
      removeMarkup = `<button type="button" data-demo-action="remove-recipe" data-recipe-id="${escapeHtml(recipe.id)}" aria-label="حذف الوصفة"><i class="fas fa-trash" aria-hidden="true"></i></button>`;
    } else if (row.editor === 'preCode') {
      editorMarkup = renderPreCodeEditor(state);
      removeMarkup = '<button type="button" data-demo-action="remove-precode" aria-label="احذف كود التجهيز"><i class="fas fa-trash" aria-hidden="true"></i></button>';
    }
    return `<li class="demo-flow-step demo-step demo-declare-step demo-declare-step--${escapeHtml(row.editor)}" data-step-id="${escapeHtml(row.id)}" data-run-state="idle">
      <span class="demo-step-number demo-step-number--declare">${row.number}</span>
      <span class="demo-step-label">
        <strong><i class="fas ${escapeHtml(row.icon)}" aria-hidden="true"></i> ${escapeHtml(row.title)}</strong>
        ${row.note ? `<small class="demo-step-note">${escapeHtml(row.note)}</small>` : ''}
        ${editorMarkup}
        ${row.editor === 'preCode' ? '' : renderCodeChip(row.code)}
      </span>
      ${removeMarkup ? `<div class="demo-step-controls">${removeMarkup}</div>` : ''}
    </li>`;
  }

  function renderConditionBoard(state) {
    const source = descriptorByKey(state, state.sourceKey);
    const valid = evaluateCondition(state);
    const schemaVersion = root && root.VisualLogicCore ? root.VisualLogicCore.SCHEMA_VERSION : 10;
    const conditionEditor = state.conditionEnabled ? `
      <fieldset class="demo-question">
        <legend><b>١ · ما العنصر الذي يحدد القرار؟</b></legend>
        <p>اختر الحقل أو العنصر الذي تحمل حالته معنى حقيقيًا في هذا التفاعل.</p>
        <div class="demo-chipset">${renderSourceChips(state)}</div>
      </fieldset>

      <fieldset class="demo-question">
        <legend><b>٢ · ما الحالة التي تنتظرها؟</b></legend>
        <p>هذه الاختيارات مخصّصة لنوع «${escapeHtml(source ? source.shortLabel : 'العنصر')}»؛ لن نعرض فحوص النص لزر أو فحوص الرقم لحاوية.</p>
        <div class="demo-chipset">${renderOperatorChips(state, source, state.operator, 'demo-operator')}</div>
      </fieldset>

      ${renderCompareField('demo-compare-value', 'compare-value', source, state.operator, state.compareValue)}

      <div class="demo-preview-row demo-summary" data-state="${valid ? 'success' : 'error'}">
        <output class="demo-sentence" id="demo-sentence" aria-live="polite">
          <strong>القرار:</strong> إذا كان ${escapeHtml(conditionSentence(state))} <i class="fas fa-arrow-left" aria-hidden="true"></i> نفّذ الخطوات.
        </output>
        <div class="demo-condition-result demo-summary-status" id="demo-condition-result" data-valid="${valid}" data-state="${valid ? 'success' : 'error'}" role="status">
          <i class="fas ${valid ? 'fa-circle-check' : 'fa-circle-xmark'}" aria-hidden="true"></i>
          <span>الحالة الحالية: «${escapeHtml(formatSampleValue(source, state.operator, state.compareValue))}» — ${valid ? 'سيمر التنفيذ' : 'سينتقل إلى «وإلا»'}</span>
        </div>
      </div>

      <div class="demo-test-value">
        <span><i class="fas fa-link" aria-hidden="true"></i> تُقرأ الحالة من العنصر الحقيقي لحظة وقوع الحدث.</span>
        <button type="button" class="demo-btn demo-btn--secondary" data-demo-action="refresh-page-value"><i class="fas fa-rotate" aria-hidden="true"></i> حدّث القراءة</button>
      </div>

      <div class="demo-condition-join demo-condition-joins demo-question--join" aria-label="ربط فحص آخر">
        <button type="button" class="demo-join-btn demo-chip${state.join === 'AND' ? ' is-selected' : ''}" data-demo-action="set-join" data-value="AND">يجب تحقق الاثنين (و)</button>
        <button type="button" class="demo-join-btn demo-chip${state.join === 'OR' ? ' is-selected' : ''}" data-demo-action="set-join" data-value="OR">يكفي أحدهما (أو)</button>
        <button type="button" class="demo-add-condition demo-chip demo-chip--add${state.secondCondition ? ' is-added' : ''}" data-demo-action="toggle-second-condition">
          <i class="fas ${state.secondCondition ? 'fa-check' : 'fa-plus'}" aria-hidden="true"></i>
          ${state.secondCondition ? 'ألغِ القرار الثاني' : 'أضف قرارًا ثانيًا'}
        </button>
      </div>
      ${renderSecondCondition(state)}

      ${state.devMode ? `<code class="demo-schema-preview demo-code" dir="ltr">source: "${escapeHtml(source && (source.id || source.key))}" · op: "${escapeHtml(state.operator)}" · schemaVersion ${schemaVersion}</code>` : ''}`
      : `<div class="demo-condition-direct demo-summary" data-state="success">
          <i class="fas fa-bolt" aria-hidden="true"></i>
          <div>
            <strong>التنفيذ مباشر وبسيط</strong>
            <p>عند وقوع الحدث المختار ستعمل الخطوات فورًا. استخدم الشرط فقط عندما توجد حالة حقيقية قد تغيّر القرار، مثل حقل مكتوب أو زر معطّل أو قسم مخفي.</p>
          </div>
        </div>`;
    return `<section class="interaction-demo-board interaction-demo-board--condition" aria-labelledby="demo-condition-title">
      <header class="interaction-demo-board__header interaction-demo-header">
        <div>
          <h3 id="demo-condition-title" tabindex="-1"><i class="fas fa-route" aria-hidden="true"></i> متى يبدأ التنفيذ؟</h3>
          <p>الحدث هو البداية. أضف شرطًا فقط إذا كانت هناك حالة أخرى يجب التحقق منها قبل تنفيذ الخطوات.</p>
        </div>
      </header>

      <div class="interaction-demo-board__body interaction-demo-body">
        <form class="demo-condition-form demo-condition-card" onsubmit="return false">
          <fieldset class="demo-question demo-condition-mode">
            <legend><b>هل تحتاج قرارًا إضافيًا بعد الحدث؟</b></legend>
            <div class="demo-chipset">
              <button type="button" class="demo-chip${state.conditionEnabled ? '' : ' is-selected'}" data-demo-action="set-condition-mode" data-value="always">
                <i class="fas fa-bolt" aria-hidden="true"></i>
                لا — نفّذ مباشرة
              </button>
              <button type="button" class="demo-chip${state.conditionEnabled ? ' is-selected' : ''}" data-demo-action="set-condition-mode" data-value="conditional">
                <i class="fas fa-code-branch" aria-hidden="true"></i>
                نعم — افحص حالة أولًا
              </button>
            </div>
          </fieldset>
          ${conditionEditor}
        </form>
      </div>

      <footer class="interaction-demo-board__footer demo-controls">
        ${state.conditionEnabled ? '<button type="button" class="demo-btn demo-btn--secondary" data-demo-action="try-condition"><i class="fas fa-play" aria-hidden="true"></i> جرّب القرار</button>' : ''}
        <button type="button" class="demo-btn demo-btn--secondary" data-demo-action="run-flow"><i class="fas fa-forward" aria-hidden="true"></i> جرّب القاعدة كاملة</button>
        <button type="button" class="demo-btn demo-btn--primary" data-demo-action="done-condition">تم — إلى الخطوات <i class="fas fa-arrow-left" aria-hidden="true"></i></button>
      </footer>
    </section>`;
  }

  function actionGroupKey(group) {
    if (group === 'else') return 'elseActions';
    if (group === 'outside') return 'outsideActions';
    return 'insideActions';
  }

  function actionLabel(action, state) {
    const meta = ACTION_TYPES[action.kind] || ACTION_TYPES.setText;
    if (meta.targetless) {
      const hintKey = ['variableName', 'arrayName', 'key', 'functionName', 'count'].find(key =>
        action.params && String(action.params[key] || '').trim()
      );
      return hintKey ? `${meta.label} — ${String(action.params[hintKey]).trim()}` : meta.label;
    }
    const target = descriptorByKey(state, action.targetKey);
    return `${meta.label} — ${target ? target.shortLabel : 'عنصر غير محدد'}`;
  }

  function renderKindOptions(currentKind) {
    return ACTION_GROUPS.map(group => {
      const options = Object.entries(ACTION_TYPES)
        .filter(([, item]) => (item.group || 'common') === group.key)
        .map(([value, item]) =>
          `<option value="${value}" ${value === currentKind ? 'selected' : ''}>${escapeHtml(item.label)}</option>`
        ).join('');
      return options ? `<optgroup label="${escapeHtml(group.label)}">${options}</optgroup>` : '';
    }).join('');
  }

  function renderParamField(field, action, group, index, state) {
    const raw = action.params && action.params[field.key] !== undefined
      ? action.params[field.key]
      : (field.defaultValue !== undefined ? field.defaultValue : '');
    const common = `data-demo-input="action-param" data-param="${escapeHtml(field.key)}" data-group="${group}" data-index="${index}" aria-label="${escapeHtml(field.label)}" title="${escapeHtml(field.label)}"`;
    if (field.type === 'select') {
      const options = (field.options || []).map(([value, label]) =>
        `<option value="${escapeHtml(value)}" ${String(raw) === value ? 'selected' : ''}>${escapeHtml(label)}</option>`
      ).join('');
      return `<select ${common}>${options}</select>`;
    }
    if (field.type === 'element') {
      return `<select ${common} data-param-type="element">${renderElementOptions(state, String(raw || ''))}</select>`;
    }
    if (field.type === 'code') {
      return `<textarea ${common} class="demo-action-code" dir="ltr" rows="3" spellcheck="false" placeholder="${escapeHtml(field.placeholder || '// JavaScript')}">${escapeHtml(raw)}</textarea>`;
    }
    if (field.type === 'number') {
      return `<input type="number" ${common} class="demo-param-input demo-param-input--number" value="${escapeHtml(raw)}" placeholder="${escapeHtml(field.placeholder || field.label)}">`;
    }
    const dir = field.dir === 'ltr' ? 'dir="ltr"' : '';
    const list = field.list ? `list="${escapeHtml(field.list)}"` : '';
    return `<input ${common} class="demo-param-input" ${dir} ${list} value="${escapeHtml(raw)}" placeholder="${escapeHtml(field.placeholder || field.label)}">`;
  }

  function renderValueControl(action, meta, group, index, state) {
    if (!meta.valueLabel) return '';
    const mode = meta.dynamic ? (action.valueMode || 'static') : 'static';
    const modeSelect = meta.dynamic
      ? `<select data-demo-input="action-value-mode" data-group="${group}" data-index="${index}" class="demo-value-mode" aria-label="مصدر القيمة" title="مصدر القيمة">
          <option value="static" ${mode === 'static' ? 'selected' : ''}>✏️ نص ثابت</option>
          <option value="element" ${mode === 'element' ? 'selected' : ''}>🔗 قيمة عنصر</option>
          <option value="variable" ${mode === 'variable' ? 'selected' : ''}>📦 من متغير</option>
        </select>`
      : '';
    let control;
    if (mode === 'element') {
      const currentKey = action.valueElementKey || '';
      control = `<select data-demo-input="action-value-element" data-group="${group}" data-index="${index}" aria-label="العنصر الذي تُؤخذ منه القيمة" title="تُقرأ قيمته لحظة التنفيذ">${renderElementOptions(state, currentKey)}</select>`;
    } else if (mode === 'variable') {
      control = `<input data-demo-input="action-value-variable" data-group="${group}" data-index="${index}" class="demo-param-input" dir="ltr" list="demo-variable-names" value="${escapeHtml(action.valueVariable || '')}" placeholder="اسم المتغير" aria-label="اسم المتغير">`;
    } else {
      control = `<input data-demo-input="action-value" data-group="${group}" data-index="${index}" value="${escapeHtml(action.value)}" placeholder="${escapeHtml(meta.valueLabel)}" aria-label="${escapeHtml(meta.valueLabel)}">`;
    }
    return modeSelect + control;
  }

  /* لوحة البطاقات: الإجراءات كأيقونات تُضاف بنقرة — بديل مرئي للقائمة المنسدلة */
  function renderActionPalette(state) {
    const activeCategory = state.paletteCategory || 'common';
    const groupLabels = { inside: 'عند تحقق الشرط', else: 'مسار «وإلا»', outside: 'الخطوات الدائمة' };
    const chips = ACTION_GROUPS.map(group =>
      `<button type="button" class="demo-palette-cat${group.key === activeCategory ? ' is-active' : ''}" data-demo-action="palette-category" data-category="${group.key}">${escapeHtml(group.label)}</button>`
    ).join('');
    const cards = Object.entries(ACTION_TYPES)
      .filter(([, meta]) => (meta.group || 'common') === activeCategory)
      .map(([kind, meta]) =>
        `<button type="button" class="demo-palette-card" data-demo-action="palette-add" data-kind="${kind}" data-group="${escapeHtml(state.palette)}" title="${escapeHtml(meta.label)}">
          <i class="fas ${escapeHtml(meta.icon || 'fa-bolt')}" aria-hidden="true"></i>
          <span>${escapeHtml(meta.label)}</span>
        </button>`
      ).join('');
    return `<div class="demo-action-palette" role="region" aria-label="لوحة الإجراءات">
      <div class="demo-action-palette__head">
        <strong><i class="fas fa-shapes" aria-hidden="true"></i> اختر بطاقة لإضافتها إلى: ${escapeHtml(groupLabels[state.palette] || '')}</strong>
        <button type="button" class="demo-palette-close" data-demo-action="open-palette" data-group="${escapeHtml(state.palette)}" aria-label="إغلاق اللوحة"><i class="fas fa-xmark" aria-hidden="true"></i></button>
      </div>
      <div class="demo-palette-cats">${chips}</div>
      <div class="demo-palette-grid">${cards}</div>
    </div>`;
  }

  function renderActionRow(action, number, group, index, total, state, row) {
    const meta = ACTION_TYPES[action.kind] || ACTION_TYPES.setText;
    const outlineRow = row || {};
    const canMoveUp = index > 0;
    const canMoveDown = index < total - 1;
    const paramFields = (meta.fields || []).map(field => renderParamField(field, action, group, index, state)).join('');
    const targetControl = meta.targetless
      ? ''
      : `<select data-demo-input="action-target" data-group="${group}" data-index="${index}" aria-label="${escapeHtml(meta.targetHint || 'العنصر المستهدف')}" title="${escapeHtml(meta.targetHint || 'العنصر المستهدف')}">${renderElementOptions(state, action.targetKey)}</select>`;
    return `<li class="demo-flow-step demo-flow-step--action demo-step demo-step--inside" draggable="true" data-step-id="${escapeHtml(action.id)}" data-group="${group}" data-index="${index}" data-run-state="idle">
      <span class="demo-step-number demo-step-number--action">${number}</span>
      <span class="demo-step-label">
        <strong>${group === 'else' ? 'وإلا: ' : ''}${escapeHtml(actionLabel(action, state))}</strong>
        <span class="demo-action-editor demo-action-editor--flex">
          <select data-demo-input="action-kind" data-group="${group}" data-index="${index}" aria-label="نوع الإجراء">${renderKindOptions(action.kind)}</select>
          ${targetControl}
          ${paramFields}
          ${renderValueControl(action, meta, group, index, state)}
        </span>
        ${meta.targetHint && !meta.targetless ? `<small class="demo-action-hint">${escapeHtml(meta.targetHint)}</small>` : ''}
        ${renderCodeChip(outlineRow.code)}
      </span>
      ${group === 'outside' ? '<small class="demo-step-meta">خارج البوابة — يعمل دائمًا</small>' : ''}
      <div class="demo-step-controls">
        <button type="button" class="demo-drag-handle demo-step-handle" data-demo-handle data-group="${group}" data-index="${index}" aria-label="إعادة ترتيب الإجراء"><i class="fas fa-grip-vertical" aria-hidden="true"></i></button>
        <button type="button" data-demo-action="move-action" data-group="${group}" data-index="${index}" data-direction="-1" ${canMoveUp ? '' : 'disabled'} aria-label="حرّك لأعلى"><i class="fas fa-chevron-up" aria-hidden="true"></i></button>
        <button type="button" data-demo-action="move-action" data-group="${group}" data-index="${index}" data-direction="1" ${canMoveDown ? '' : 'disabled'} aria-label="حرّك لأسفل"><i class="fas fa-chevron-down" aria-hidden="true"></i></button>
        <button type="button" data-demo-action="remove-action" data-group="${group}" data-index="${index}" aria-label="حذف الإجراء"><i class="fas fa-trash" aria-hidden="true"></i></button>
      </div>
    </li>`;
  }

  function renderFlowBoard(state) {
    const selected = descriptorByKey(state, state.selectedKey);
    /* الخريطة الحقيقية للكود: كل صفٍّ يعرف رقمه وسطره كما سيُكتبان في الملف. */
    const outline = buildCodeOutline(state, root && root.VisualLogicCore);
    const rowById = new Map();
    outline.declare.concat(outline.execute).forEach(row => rowById.set(row.id, row));
    const rowFor = id => rowById.get(id) || {};
    const numberFor = (id, fallback) => {
      const row = rowById.get(id);
      return row && row.number ? row.number : fallback;
    };

    const declareRows = outline.declare.map(row => renderDeclareRow(row, state)).join('');
    const renderGroupRows = (group, actions) => (actions || []).map((action, index) =>
      renderActionRow(action, numberFor(action.id, index + 1), group, index, (actions || []).length, state, rowFor(action.id))
    ).join('');
    const insideRows = renderGroupRows('inside', state.insideActions);
    const elseRows = renderGroupRows('else', state.elseActions);
    const outsideRows = renderGroupRows('outside', state.outsideActions);
    const suggested = eventOptionsFor(selected);
    const suggestedValues = new Set(suggested.map(option => option.value));
    const restOptions = ALL_EVENTS.filter(value => !suggestedValues.has(value));
    const renderEventOption = value =>
      `<option value="${value}" ${value === state.event ? 'selected' : ''}>${escapeHtml(EVENT_LABELS[value] || value)}</option>`;
    const eventOptions =
      `<optgroup label="مقترحة لهذا العنصر">${suggested.map(option => renderEventOption(option.value)).join('')}</optgroup>` +
      `<optgroup label="كل الأحداث">${restOptions.map(renderEventOption).join('')}</optgroup>`;
    const keyFilterControl = KEY_FILTER_EVENTS.includes(state.event)
      ? ` <span class="demo-event-key"><label for="demo-event-key-input">المفتاح</label><input id="demo-event-key-input" data-demo-input="event-key" dir="ltr" list="demo-key-suggestions" value="${escapeHtml(state.eventKey || '')}" placeholder="مثل: Enter" title="اتركه فارغًا ليعمل مع أي مفتاح"></span>`
      : '';
    const variableNames = new Set();
    []
      .concat(state.insideActions || [], state.elseActions || [], state.outsideActions || [])
      .forEach(action => {
        const params = action.params || {};
        ['variableName', 'arrayName', 'resultName'].forEach(key => {
          const name = String(params[key] || '').trim();
          if (name) variableNames.add(name);
        });
        const dynamicName = String(action.valueVariable || '').trim();
        if (dynamicName) variableNames.add(dynamicName);
      });
    const dataLists =
      `<datalist id="demo-css-properties">${['color', 'background', 'font-size', 'font-weight', 'width', 'height', 'margin', 'padding', 'border', 'border-radius', 'display', 'opacity', 'transform', 'transition', 'box-shadow', 'text-align', 'cursor'].map(property => `<option value="${property}"></option>`).join('')}</datalist>` +
      `<datalist id="demo-key-suggestions">${['Enter', 'Escape', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'].map(key => `<option value="${escapeHtml(key)}"></option>`).join('')}</datalist>` +
      `<datalist id="demo-variable-names">${Array.from(variableNames).map(name => `<option value="${escapeHtml(name)}"></option>`).join('')}</datalist>`;

    return `<section class="interaction-demo-board interaction-demo-board--flow" aria-labelledby="demo-flow-title">
      <header class="interaction-demo-board__header interaction-demo-board__header--flow interaction-demo-header">
        <div>
          <h3 id="demo-flow-title" tabindex="-1"><i class="fas fa-list-ol" aria-hidden="true"></i> خطوات التفاعل</h3>
          <p>رتّب ما يحتاجه التفاعل أولًا، ثم ما سيحدث عند وقوع الحدث. يظهر تحت كل خطوة سطرها الحقيقي في JavaScript.</p>
        </div>
        <div class="demo-flow-header-actions demo-controls">
          <button type="button" class="demo-btn demo-btn--secondary" data-demo-action="run-flow"><i class="fas fa-play" aria-hidden="true"></i> جرّب المسار</button>
          <button type="button" class="demo-btn demo-btn--primary" data-demo-action="save-demo"><i class="fas fa-floppy-disk" aria-hidden="true"></i> حفظ التفاعل</button>
        </div>
      </header>

      <div class="interaction-demo-board__body interaction-demo-body">
        <div class="demo-selected-context">
          <i class="fas ${iconForElement(selected)}" aria-hidden="true"></i>
          <span>العنصر الذي تتحكم فيه الآن</span>
          <strong>${escapeHtml(selected ? selected.label : '')}</strong>
        </div>

        ${dataLists}

        <!-- ①  قائمة التعريف: أسطر تحجز خانات وأسماء، ولا تنفّذ شيئًا بعد -->
        <section class="demo-code-list demo-code-list--declare" aria-labelledby="demo-declare-title">
          <div class="demo-code-list__head">
            <h4 id="demo-declare-title"><i class="fas fa-table-columns" aria-hidden="true"></i> ١ · التعريف <small>قبل الحدث</small></h4>
            <p>هذه الأسطر <strong>لا تنفّذ شيئًا الآن</strong>؛ كل سطر يحجز خانة أو اسمًا ستستعمله خطوات التنفيذ بالأسفل.</p>
          </div>
          <ol class="demo-flow demo-flow--declare" id="demo-declare-list" aria-label="أسطر التعريف">${declareRows}</ol>
          <div class="demo-add-row">
            <button type="button" class="demo-add-step demo-add" data-demo-action="add-memory"><i class="fas fa-brain" aria-hidden="true"></i> أضف صندوقًا (متغيّر)</button>
            <button type="button" class="demo-add-step demo-add" data-demo-action="add-recipe"><i class="fas fa-box-open" aria-hidden="true"></i> أضف وصفة (Function)</button>
            ${String(state.preCode || '').trim() ? '' : '<button type="button" class="demo-add-step demo-add" data-demo-action="add-precode"><i class="fas fa-gears" aria-hidden="true"></i> كود تجهيز حر</button>'}
          </div>
        </section>

        <!-- ②  قائمة التنفيذ: من هنا يبدأ الفعل، بالترتيب نفسه الذي سيجري به -->
        <section class="demo-code-list demo-code-list--execute" aria-labelledby="demo-execute-title">
          <div class="demo-code-list__head">
            <h4 id="demo-execute-title"><i class="fas fa-play" aria-hidden="true"></i> ٢ · التنفيذ <small>عند وقوع الحدث</small></h4>
            <p>هنا تحدث الأفعال بالترتيب: يقع الحدث، تُقرأ القيمة، يُفحص الشرط، ثم تعمل الخطوات سطرًا بعد سطر.</p>
          </div>
          <ol class="demo-flow demo-flow--execute" id="demo-execute-list" aria-label="خطوات التنفيذ">
          <li class="demo-flow-step demo-flow-step--trigger demo-step demo-step--trigger" data-step-id="trigger" data-run-state="idle">
            <span class="demo-step-number">${numberFor('run:trigger', 1)}</span>
            <span class="demo-step-label">
              <strong><i class="fas fa-bolt" aria-hidden="true"></i> عند <select data-demo-input="event" aria-label="حدث بدء التفاعل">${eventOptions}</select> على ${escapeHtml(selected ? selected.shortLabel : '')}${keyFilterControl}</strong>
              <small>المصدر مرتبط بالعنصر المحدد، وليس بزر ثابت.</small>
              ${renderCodeChip(rowFor('run:trigger').code)}
            </span>
            <small class="demo-step-meta"><i class="fas fa-thumbtack" aria-hidden="true"></i> البداية دائمًا</small>
          </li>

          ${rowFor('run:reads').code ? `<li class="demo-flow-step demo-flow-step--read demo-step" data-step-id="reads" data-run-state="idle">
            <span class="demo-step-number">${numberFor('run:reads', 2)}</span>
            <span class="demo-step-label">
              <strong><i class="fas fa-eye" aria-hidden="true"></i> ${escapeHtml(rowFor('run:reads').title || 'اقرأ القيمة')}</strong>
              <small class="demo-step-note">${escapeHtml(rowFor('run:reads').note || '')}</small>
              ${renderCodeChip(rowFor('run:reads').code)}
            </span>
          </li>` : ''}

          <li class="demo-flow-gate">
            <button type="button" class="demo-flow-step demo-flow-step--gate demo-step demo-step--gate" data-step-id="gate" data-run-state="idle" data-demo-action="edit-condition">
              <span class="demo-step-number demo-step-number--gate">${state.conditionEnabled ? numberFor('demo-condition-gate', 3) : '—'}</span>
              <span class="demo-step-label">
                <span><i class="fas ${state.conditionEnabled ? 'fa-code-branch' : 'fa-bolt'}" aria-hidden="true"></i> ${state.conditionEnabled ? `قرار: ${escapeHtml(conditionSentence(state))}` : 'تنفيذ مباشر عند وقوع الحدث'}</span>
                ${renderCodeChip(rowFor('demo-condition-gate').code)}
              </span>
              <small class="demo-step-meta">${state.conditionEnabled ? 'اضغط لتعديل القرار' : 'اضغط إذا أردت إضافة شرط'}</small>
            </button>

            <ol class="demo-inside-actions" aria-label="الخطوات عند تحقق الشرط">${insideRows}</ol>
            <div class="demo-add-row">
              <button type="button" class="demo-add-step demo-add" data-demo-action="add-action" data-group="inside"><i class="fas fa-plus" aria-hidden="true"></i> أضف خطوة</button>
              <button type="button" class="demo-add-step demo-add demo-add--palette" data-demo-action="open-palette" data-group="inside" aria-expanded="${state.palette === 'inside' ? 'true' : 'false'}"><i class="fas fa-shapes" aria-hidden="true"></i> اختر من البطاقات</button>
            </div>
            ${state.palette === 'inside' ? renderActionPalette(state) : ''}

            ${state.conditionEnabled && elseRows ? `<div class="demo-else-heading"><strong>وإلا</strong><span>عندما لا يتحقق الشرط</span></div><ol class="demo-inside-actions demo-else-actions">${elseRows}</ol>` : ''}
            ${state.conditionEnabled ? `<div class="demo-add-row">
              <button type="button" class="demo-add-step demo-add demo-add--else" data-demo-action="add-action" data-group="else"><i class="fas fa-reply" aria-hidden="true"></i> أضف خطوة للمسار البديل (وإلا)</button>
              <button type="button" class="demo-add-step demo-add demo-add--palette" data-demo-action="open-palette" data-group="else" aria-expanded="${state.palette === 'else' ? 'true' : 'false'}"><i class="fas fa-shapes" aria-hidden="true"></i> بطاقات</button>
            </div>
            ${state.palette === 'else' ? renderActionPalette(state) : ''}` : ''}
          </li>

          ${outsideRows}
          </ol>

          <div class="demo-flow-additions demo-controls">
            <button type="button" class="demo-add-step demo-add" data-demo-action="add-action" data-group="outside"><i class="fas fa-plus" aria-hidden="true"></i> خطوة تعمل دائمًا</button>
            <button type="button" class="demo-add-step demo-add demo-add--palette" data-demo-action="open-palette" data-group="outside" aria-expanded="${state.palette === 'outside' ? 'true' : 'false'}"><i class="fas fa-shapes" aria-hidden="true"></i> بطاقات</button>
            <button type="button" class="demo-add-step demo-add-step--gate demo-add demo-add--gate" data-demo-action="edit-condition"><i class="fas fa-code-branch" aria-hidden="true"></i> تعديل الشرط (لو)</button>
          </div>
          ${state.palette === 'outside' ? renderActionPalette(state) : ''}
        </section>

        ${outline.ok ? '' : `<div class="demo-code-status" data-state="warn"><i class="fas fa-circle-info" aria-hidden="true"></i> الأسطر ستظهر فور اكتمال القاعدة — ${escapeHtml(outline.error)}</div>`}

        <div class="demo-run-status" id="demo-run-status" role="status" aria-live="assertive">
          ${state.saveMessage
            ? escapeHtml(state.saveMessage)
            : 'المسودة مرتبطة بالعنصر المحدد. لن يتغيّر كود المشروع إلا عند الضغط على «حفظ التفاعل».'}
        </div>
      </div>

      <footer class="interaction-demo-board__footer interaction-demo-board__footer--flow demo-controls">
        <span><i class="fas fa-floppy-disk" aria-hidden="true"></i> الحفظ يحوّل القاعدة إلى تفاعل حقيقي في مشروعك ويمكن تعديله لاحقًا من هنا.${state.devMode ? ' <code class="demo-code" dir="ltr">schemaVersion 10</code>' : ''}</span>
        ${state.savedDefinitionId ? '<button type="button" class="demo-reset-btn demo-delete-saved" data-demo-action="delete-saved"><i class="fas fa-trash" aria-hidden="true"></i> احذف التفاعل المحفوظ</button>' : ''}
        <button type="button" class="demo-reset-btn" data-demo-action="reset-demo"><i class="fas fa-rotate-left" aria-hidden="true"></i> إعادة ضبط المسودة</button>
      </footer>
    </section>`;
  }

  /* ═══════════════════ لوح الدروس ═══════════════════

     ثلاث شاشات في تبويب واحد، بالترتيب الذي يمشي به المتعلّم:
     ١) الكتالوج: اختر تطبيقًا.  ٢) الأدوار: أي عنصر في صفحتك يقوم بأي دور.
     ٣) التنفيذ: خطوة واحدة أمامك، تقرأ فائدتها، تضغط «نفّذ»، فترى سطرها يظهر.

     الدرس لا يزرع نتيجة جاهزة: كل خطوة تضيف نفس البطاقة التي كان
     المستخدم سيضيفها بيده، فيبقى كل شيء قابلًا للتعديل بعد انتهاء الدرس. */

  const LESSON_LEVELS = Object.freeze({ 1: 'مبتدئ', 2: 'متوسط', 3: 'متقدّم' });

  /* النقاط مرسومة بالـ CSS لا بأيقونات خارجية، فتظهر حتى لو تعذّر تحميل خطّ الأيقونات */
  function lessonLevelMarkup(level) {
    const value = Math.min(3, Math.max(1, Number(level) || 1));
    const dots = [1, 2, 3]
      .map(step => `<i data-on="${step <= value ? 'yes' : 'no'}" aria-hidden="true"></i>`)
      .join('');
    return `<span class="demo-lesson-level" title="المستوى: ${LESSON_LEVELS[value]}">${dots}<small>${LESSON_LEVELS[value]}</small></span>`;
  }

  /* اسم الخطوة في اللوحين: «تعريف» يحجز خانة، «تنفيذ» يفعل شيئًا.
     هذا هو الفرق الذي يبنيه الدرس في ذهن المتعلّم، فنسمّيه صراحةً. */
  function lessonBoardBadge(step) {
    const op = (step && step.op) || {};
    if (op.type === 'box') return '<span class="demo-lesson-badge demo-lesson-badge--declare"><i class="fas fa-table-columns" aria-hidden="true"></i> تعريف · يحجز خانة</span>';
    if (op.type === 'trigger') return '<span class="demo-lesson-badge demo-lesson-badge--trigger"><i class="fas fa-bolt" aria-hidden="true"></i> ربط · من هنا يبدأ التنفيذ</span>';
    if (op.type === 'condition') return '<span class="demo-lesson-badge demo-lesson-badge--gate"><i class="fas fa-code-branch" aria-hidden="true"></i> شرط · بوابة قبل الخطوات</span>';
    return '<span class="demo-lesson-badge demo-lesson-badge--execute"><i class="fas fa-play" aria-hidden="true"></i> تنفيذ · يفعل شيئًا</span>';
  }

  /* السطر الذي كتبته هذه الخطوة فعلًا في الملف — يُقرأ من خريطة الكود نفسها
     لا من نصّ محفوظ، فما يراه المتعلّم هو ما سيُحفظ حرفيًا. */
  function lessonStepCode(outline, step) {
    if (!outline || !outline.ok) return '';
    const op = (step && step.op) || {};
    const id = `lesson-${step.id}`;
    if (op.type === 'box') {
      const row = outline.declare.find(item => item.boxId === id);
      return row ? row.code : '';
    }
    if (op.type === 'action') {
      const row = outline.execute.find(item => item.id === id);
      return row ? row.code : '';
    }
    const wanted = op.type === 'condition' ? 'demo-condition-gate' : 'run:trigger';
    const row = outline.execute.find(item => item.id === wanted);
    return row ? row.code : '';
  }

  /* خطوة نُفِّذت ولم يظهر لها سطر: نقول السبب صراحةً بدل ترك فراغ يبدو عطلًا.
     المتعلّم هنا يبحث تلقائيًا عن «الفعل» في كل سطر، فحين لا يوجد فعل
     نسمّي ذلك بوضوح: هذه الخطوة ضبطت شيئًا، ولم تكتب سطرًا بعد. */
  function lessonStepNote(step, roles) {
    const op = (step && step.op) || {};
    if (op.type === 'condition') {
      return 'لم تكتب هذه الخطوة سطرًا جديدًا — وضعت بوابة <code dir="ltr">if</code> ستحيط بخطوات التنفيذ، وسطرها يظهر مع أول خطوة تنفيذ بعدها.';
    }
    if (op.type === 'action' && op.role && !String((roles || {})[op.role] || '')) {
      return 'تُخُطّيت هذه الخطوة: لا يوجد في صفحتك عنصر لهذا الدور، والتطبيق يعمل بدونه.';
    }
    return 'ضبطت هذه الخطوة إعدادًا داخل سطر موجود، فلم تُضِف سطرًا جديدًا إلى الملف.';
  }

  /* ① الكتالوج */
  function renderLessonsCatalogue(state) {
    const catalogue = tutorialCatalogue();
    const tutorials = catalogue.TUTORIALS || [];
    if (!tutorials.length) {
      return `<div class="demo-empty-state">
        <i class="fas fa-graduation-cap" aria-hidden="true"></i>
        <h4>ملف الدروس غير محمَّل</h4>
        <p>تأكّد من وجود <code dir="ltr">js/interaction-tutorials.js</code> قبل <code dir="ltr">js/interaction-demo.js</code> في الصفحة.</p>
      </div>`;
    }
    const cards = tutorials.map(tutorial => {
      const resolved = resolveTutorialRoles(tutorial, state.elements || []);
      const readiness = resolved.ready
        ? '<span class="demo-lesson-ready" data-state="yes"><i class="fas fa-circle-check" aria-hidden="true"></i> عناصر صفحتك تكفي</span>'
        : `<span class="demo-lesson-ready" data-state="no"><i class="fas fa-circle-plus" aria-hidden="true"></i> ينقصك ${resolved.missing.length} عنصر</span>`;
      return `<button type="button" class="demo-lesson-card" data-demo-action="lesson-pick" data-lesson="${escapeHtml(tutorial.id)}">
        <span class="demo-lesson-card__icon"><i class="fas ${escapeHtml(tutorial.icon || 'fa-cube')}" aria-hidden="true"></i></span>
        <span class="demo-lesson-card__body">
          <strong>${escapeHtml(tutorial.title)}</strong>
          <small>${escapeHtml(tutorial.subtitle || '')}</small>
          <span class="demo-lesson-card__tags">${(tutorial.tags || []).map(tag => `<em>${escapeHtml(tag)}</em>`).join('')}</span>
        </span>
        <span class="demo-lesson-card__meta">
          ${lessonLevelMarkup(tutorial.difficulty)}
          <span class="demo-lesson-steps">${tutorial.steps.length} خطوة</span>
          ${readiness}
        </span>
      </button>`;
    }).join('');

    return `<div class="demo-lesson-intro">
        <p>اختر تطبيقًا وابنِه معي <strong>خطوة واحدة في كل مرة</strong>. قبل كل خطوة تقرأ لماذا نفعلها، وبعدها ترى السطر الذي كتبته في الملف.</p>
      </div>
      <div class="demo-lesson-grid">${cards}</div>`;
  }

  /* ② توزيع الأدوار على عناصر الصفحة الحقيقية */
  function renderLessonSetup(state) {
    const tutorial = tutorialCatalogue().getTutorial(state.lesson.tutorialId);
    if (!tutorial) return renderLessonsCatalogue(state);
    const resolved = resolveTutorialRoles(tutorial, state.elements || [], state.lesson.roles);

    const rows = (tutorial.roles || []).map(role => {
      const options = resolved.candidates[role.key] || [];
      const current = resolved.roles[role.key] || '';
      if (!options.length) {
        return `<li class="demo-lesson-role" data-state="${role.optional ? 'skip' : 'missing'}">
          <span class="demo-lesson-role__label"><strong>${escapeHtml(role.label)}</strong>
            <small>${escapeHtml(role.hint || '')}</small></span>
          <span class="demo-lesson-role__missing">
            <i class="fas ${role.optional ? 'fa-circle-minus' : 'fa-triangle-exclamation'}" aria-hidden="true"></i>
            ${role.optional
              ? 'لا يوجد عنصر مناسب — سنتخطّى الخطوات التي تحتاجه، والدرس يعمل.'
              : `أضف إلى صفحتك ${escapeHtml(role.hint || 'عنصرًا مناسبًا')} أولًا، ثم ارجع إلى هنا.`}
          </span>
        </li>`;
      }
      const optionMarkup = options.map(item =>
        `<option value="${escapeHtml(item.key)}" ${item.key === current ? 'selected' : ''}>${escapeHtml(item.label)}</option>`
      ).join('');
      return `<li class="demo-lesson-role" data-state="ok">
        <span class="demo-lesson-role__label"><strong>${escapeHtml(role.label)}</strong>
          <small>${escapeHtml(role.hint || '')}</small></span>
        <select data-demo-input="lesson-role" data-role="${escapeHtml(role.key)}" aria-label="العنصر الذي يقوم بدور ${escapeHtml(role.label)}">
          ${role.optional ? `<option value="" ${current ? '' : 'selected'}>— بدون —</option>` : ''}
          ${optionMarkup}
        </select>
      </li>`;
    }).join('');

    const hasDraft = (state.memory || []).length
      || (state.insideActions || []).length
      || (state.elseActions || []).length
      || (state.outsideActions || []).length;

    return `<div class="demo-lesson-setup">
      <div class="demo-lesson-setup__head">
        <span class="demo-lesson-card__icon"><i class="fas ${escapeHtml(tutorial.icon || 'fa-cube')}" aria-hidden="true"></i></span>
        <div>
          <h4>${escapeHtml(tutorial.title)}</h4>
          <p>${escapeHtml(tutorial.intro || tutorial.subtitle || '')}</p>
        </div>
      </div>

      <div class="demo-lesson-setup__roles">
        <h5><i class="fas fa-diagram-project" aria-hidden="true"></i> من يقوم بأي دور في صفحتك؟</h5>
        <p>الدرس لا يصنع عناصر جديدة، بل يشتغل على عناصر صفحتك أنت. اخترتُ لك أقرب عنصر لكل دور — غيّره إن أردت.</p>
        <ul class="demo-lesson-roles">${rows}</ul>
      </div>

      ${hasDraft ? `<div class="demo-lesson-warning"><i class="fas fa-circle-info" aria-hidden="true"></i>
        بدء الدرس يفرغ القائمتين الحاليتين ليبدأ الملف من الصفر. ما هو محفوظ في مشروعك لا يتأثّر.</div>` : ''}

      <div class="demo-lesson-setup__controls demo-controls">
        <button type="button" class="demo-btn demo-btn--ghost" data-demo-action="lesson-cancel"><i class="fas fa-arrow-right" aria-hidden="true"></i> رجوع للقائمة</button>
        <button type="button" class="demo-btn demo-btn--primary" data-demo-action="lesson-start" ${resolved.ready ? '' : 'disabled'}>
          <i class="fas fa-play" aria-hidden="true"></i> ابدأ الدرس (${tutorial.steps.length} خطوة)
        </button>
      </div>
    </div>`;
  }

  /* ③ التنفيذ خطوة خطوة */
  function renderLessonRunner(state) {
    const tutorial = tutorialCatalogue().getTutorial(state.lesson.tutorialId);
    if (!tutorial) return renderLessonsCatalogue(state);
    const steps = tutorial.steps || [];
    const index = Math.max(0, Math.min(steps.length, Number(state.lesson.stepIndex) || 0));
    const outline = buildCodeOutline(state, root && root.VisualLogicCore);
    const percent = steps.length ? Math.round((index / steps.length) * 100) : 0;

    const done = steps.slice(0, index).map((step, position) => {
      const code = lessonStepCode(outline, step);
      return `<li class="demo-lesson-done-step">
        <span class="demo-lesson-done-step__num"><i class="fas fa-check" aria-hidden="true"></i>${position + 1}</span>
        <span class="demo-lesson-done-step__body">
          <strong>${escapeHtml(step.title)}</strong>
          ${code
            ? renderCodeChip(code)
            : `<p class="demo-lesson-done-step__note">${lessonStepNote(step, state.lesson.roles)}</p>`}
        </span>
      </li>`;
    }).join('');

    const current = index < steps.length ? steps[index] : null;
    const currentMarkup = current
      ? `<article class="demo-lesson-current" aria-labelledby="demo-lesson-step-title">
          <header>
            <span class="demo-lesson-current__num">${index + 1}</span>
            <div>
              ${lessonBoardBadge(current)}
              <h4 id="demo-lesson-step-title" tabindex="-1">${escapeHtml(current.title)}</h4>
            </div>
          </header>
          <p class="demo-lesson-why">${escapeHtml(current.why || '')}</p>
          <div class="demo-lesson-current__controls demo-controls">
            <button type="button" class="demo-btn demo-btn--primary" data-demo-action="lesson-next">
              <i class="fas fa-circle-play" aria-hidden="true"></i> نفّذ هذه الخطوة
            </button>
            ${index > 0 ? '<button type="button" class="demo-btn demo-btn--ghost" data-demo-action="lesson-back"><i class="fas fa-rotate-left" aria-hidden="true"></i> تراجع خطوة</button>' : ''}
          </div>
        </article>`
      : `<article class="demo-lesson-current demo-lesson-current--done" aria-labelledby="demo-lesson-step-title">
          <header>
            <span class="demo-lesson-current__num"><i class="fas fa-flag-checkered" aria-hidden="true"></i></span>
            <div><h4 id="demo-lesson-step-title" tabindex="-1">انتهى الدرس — التطبيق جاهز</h4></div>
          </header>
          <p class="demo-lesson-why">كل ما بنيته الآن بطاقات عادية في القائمتين، يمكنك تعديلها أو حذفها أو إضافة خطوة من عندك. افتح تبويب «الكود الناتج» لترى الملف كاملًا، ثم اضغط «حفظ التفاعل» ليعمل في مشروعك فعلًا.</p>
          <div class="demo-lesson-current__controls demo-controls">
            <button type="button" class="demo-btn demo-btn--primary" data-demo-action="save-demo"><i class="fas fa-floppy-disk" aria-hidden="true"></i> حفظ التفاعل</button>
            <button type="button" class="demo-btn demo-btn--secondary" data-demo-action="lesson-open-flow"><i class="fas fa-list-ol" aria-hidden="true"></i> افتح القائمتين وعدّل بنفسك</button>
            <button type="button" class="demo-btn demo-btn--ghost" data-demo-action="lesson-back"><i class="fas fa-rotate-left" aria-hidden="true"></i> تراجع خطوة</button>
          </div>
        </article>`;

    return `<div class="demo-lesson-runner">
      <div class="demo-lesson-progress">
        <div class="demo-lesson-progress__text">
          <strong>${escapeHtml(tutorial.title)}</strong>
          <span>الخطوة ${Math.min(index + 1, steps.length)} من ${steps.length}</span>
        </div>
        <div class="demo-lesson-progress__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="تقدّمك في الدرس">
          <span style="width:${percent}%"></span>
        </div>
      </div>

      ${currentMarkup}

      <section class="demo-lesson-file" aria-labelledby="demo-lesson-file-title">
        <h5 id="demo-lesson-file-title"><i class="fas fa-file-code" aria-hidden="true"></i> ملفك حتى الآن <small>${index} من ${steps.length} خطوة</small></h5>
        ${index
          ? `<ol class="demo-lesson-done">${done}</ol>`
          : '<p class="demo-lesson-file__empty">لم تُنفَّذ خطوة بعد. اضغط «نفّذ هذه الخطوة» وسيظهر أول سطر هنا.</p>'}
      </section>

      <div class="demo-run-status" id="demo-run-status" role="status" aria-live="polite">${
        state.lesson.done
          ? 'انتهت كل الخطوات. البطاقات أمامك في تبويب «التعريف ثم التنفيذ».'
          : 'اقرأ فائدة الخطوة أولًا، ثم نفّذها وشاهد سطرها يظهر بالأسفل.'
      }</div>

      <footer class="demo-lesson-footer demo-controls">
        <button type="button" class="demo-btn demo-btn--ghost" data-demo-action="lesson-restart"><i class="fas fa-arrows-rotate" aria-hidden="true"></i> ابدأ الدرس من أوله</button>
        <button type="button" class="demo-btn demo-btn--ghost" data-demo-action="lesson-cancel"><i class="fas fa-list" aria-hidden="true"></i> اخرج إلى قائمة الدروس</button>
      </footer>
    </div>`;
  }

  function renderLessonsBoard(state) {
    const lesson = state.lesson || {};
    const inner = lesson.stage === 'run'
      ? renderLessonRunner(state)
      : (lesson.stage === 'setup' ? renderLessonSetup(state) : renderLessonsCatalogue(state));
    return `<section class="interaction-demo-board interaction-demo-board--lessons" aria-labelledby="demo-lessons-title">
      <header class="interaction-demo-board__header interaction-demo-header">
        <div>
          <h3 id="demo-lessons-title" tabindex="-1"><i class="fas fa-graduation-cap" aria-hidden="true"></i> دروس جاهزة — ابنِ التطبيق خطوة خطوة</h3>
          <p>ليست قوالب تُلصق. كل خطوة تشرح فائدتها أولًا، ثم تضيف بطاقة حقيقية إلى قائمتك تستطيع تعديلها بعد الدرس.</p>
        </div>
      </header>
      <div class="interaction-demo-board__body interaction-demo-body">${inner}</div>
    </section>`;
  }

  /* خرائط التبويبات في مكان واحد حتى لا يُنسى تبويب عند إضافة الرابع */
  const DEMO_VIEW_HEADINGS = Object.freeze({
    lessons: '#demo-lessons-title',
    flow: '#demo-flow-title',
    condition: '#demo-condition-title',
    code: '#demo-code-title'
  });
  const DEMO_VIEW_TABS = Object.freeze({
    lessons: 'demo-tab-lessons',
    flow: 'demo-tab-flow',
    condition: 'demo-tab-condition',
    code: 'demo-tab-code'
  });

  function renderEmptyState() {
    return `<section class="interaction-demo-board interaction-demo-board--empty" aria-labelledby="demo-empty-title">
      <header class="interaction-demo-board__header interaction-demo-header">
        <div>
          <h3 id="demo-empty-title" tabindex="-1"><i class="fas fa-hand-pointer" aria-hidden="true"></i> اختر عنصرًا أولًا</h3>
          <p>Demo لم يعد شاشة ثابتة؛ يحتاج عنصرًا حقيقيًا من اللوحة ليعرض لك التحكم المناسب.</p>
        </div>
      </header>
      <div class="interaction-demo-board__body interaction-demo-body">
        <div class="demo-empty-state">
          <i class="fas fa-arrow-pointer" aria-hidden="true"></i>
          <h4>اضغط على أي عنصر داخل الصفحة</h4>
          <p>بعد التحديد افتح زر <b>القواعد</b> بجوار «التفاعلات وJS» في شريط العنصر، وستُبنى قاعدة «لو / إذن / وإلا» مرتبطة بهذا العنصر.</p>
          <button type="button" class="demo-btn demo-btn--primary" data-demo-action="close">العودة لاختيار عنصر</button>
        </div>
      </div>
    </section>`;
  }

  class DemoController {
    constructor(app, options) {
      this.app = app || null;
      this.options = options || {};
      this.document = this.options.document || (root && root.document);
      this.state = createInitialState();
      this.panel = null;
      this.overlay = null;
      this.trigger = null;
      this.selectedElement = null;
      this.elementKeys = typeof WeakMap === 'function' ? new WeakMap() : null;
      this.elementsByKey = new Map();
      this.keySerial = 0;
      this.actionSerial = 20;
      this.prepSerial = 20;
      this.dragInfo = null;
      this.runNonce = 0;
      this._boundKeydown = event => this.handleKeydown(event);
      this._boundClick = event => this.handleClick(event);
      this._boundChange = event => this.handleChange(event);
      this._boundInput = event => this.handleInput(event);
      this._boundDragStart = event => this.handleDragStart(event);
      this._boundDragOver = event => this.handleDragOver(event);
      this._boundDrop = event => this.handleDrop(event);
      this._boundDragEnd = event => this.handleDragEnd(event);
    }

    init() {
      if (!this.document) return this;
      this.panel = this.document.getElementById('interaction-demo-panel');
      if (!this.panel) return this;
      this.panel.addEventListener('click', event => {
        const button = event.target.closest('[data-demo-panel-open]');
        if (!button) return;
        this.open(button, button.dataset.demoPanelOpen);
      });
      this.syncSelection(this.app && this.app.selectedElement);
      return this;
    }

    renderLauncher() {
      if (!this.panel) return;
      const selected = descriptorByKey(this.state, this.state.selectedKey);
      this.panel.innerHTML = `<div class="interaction-demo-launcher-card">
        <span class="interaction-demo-launcher__eyebrow">قواعد التفاعل · لو / إذن / وإلا</span>
        <h2>${selected ? 'ابنِ قاعدة للعنصر المحدد' : 'ابدأ باختيار عنصر من الصفحة'}</h2>
        <p>${selected
          ? `العنصر الحالي: ${escapeHtml(selected.label)}. القاعدة جملة عربية: لو تحقق الشرط ← نفّذ خطوات، وإلا ← نفّذ غيرها.`
          : 'اضغط على عنصر داخل اللوحة، ثم افتح «القواعد» من شريطه العائم. كل شيء يُقرأ من صفحتك الحقيقية.'}</p>
        <div class="interaction-demo-launcher__map" aria-hidden="true">
          <span><b>لو</b> الشرط</span><i class="fas fa-arrow-left"></i><span><b>إذن</b> الخطوات</span><i class="fas fa-arrow-left"></i><span><b>وإلا</b> مسار بديل</span>
        </div>
        <button type="button" class="btn btn-primary" id="interaction-demo-open" data-demo-panel-open="flow"><i class="fas fa-play" aria-hidden="true"></i> افتح قواعد التفاعل</button>
        <button type="button" class="btn btn-secondary" data-demo-panel-open="lessons"><i class="fas fa-graduation-cap" aria-hidden="true"></i> ابنِ تطبيقًا جاهزًا خطوة خطوة</button>
        <button type="button" class="btn btn-secondary" data-demo-panel-open="condition"><i class="fas fa-circle-question" aria-hidden="true"></i> ابدأ من الشرط (لو)</button>
        <small><i class="fas fa-shield-halved" aria-hidden="true"></i> لن يتغيّر المشروع أثناء التعديل؛ التغيير يحدث فقط عند «حفظ التفاعل».</small>
      </div>`;
    }

    elementKey(element) {
      if (!element) return '';
      if (this.elementKeys && this.elementKeys.has(element)) return this.elementKeys.get(element);
      const key = `canvas-element-${++this.keySerial}`;
      if (this.elementKeys) this.elementKeys.set(element, key);
      return key;
    }

    readElementValue(element) {
      if (!element) return '';
      const tag = String(element.tagName || '').toLowerCase();
      const type = String(element.type || '').toLowerCase();
      if (tag === 'input' && ['checkbox', 'radio'].includes(type)) return Boolean(element.checked);
      if (['input', 'textarea', 'select'].includes(tag)) return element.value == null ? '' : element.value;
      return String(element.textContent || '').replace(/\s+/g, ' ').trim();
    }

    describeElement(element) {
      const tag = String(element && element.tagName || 'element').toLowerCase();
      const id = String(element && element.id || '');
      const sampleValue = this.readElementValue(element);
      const preview = truncate(
        element && (element.getAttribute('aria-label') || element.getAttribute('title')) || sampleValue,
        30
      );
      /* لا نمرّر label هنا عمدًا: normalizeDescriptor يبني الاسم البشري
         («زر «أضف مهمة»») ولا يُظهر المعرّف التقني إلا حين لا يوجد نصّ
         يميّز العنصر. الاسم المرعب مثل ul#ul-b0n2wuff يبقى في حقل
         technical لمن يحتاجه، لا في القوائم التي يقرأها المستخدم. */
      return normalizeDescriptor({
        key: this.elementKey(element),
        id,
        tag,
        inputType: element && element.type,
        textPreview: preview,
        sampleValue,
        disabled: Boolean(element && element.disabled),
        visible: Boolean(element && !element.hidden && (!element.style || element.style.display !== 'none')),
        classNames: element ? Array.from(element.classList || []) : [],
        hasChildren: Boolean(element && element.children && element.children.length)
      });
    }

    collectCanvasElements(selected) {
      this.elementsByKey = new Map();
      const canvas = this.app && this.app.canvas;
      if (!canvas) return [];
      const nodes = Array.from(canvas.querySelectorAll('*'))
        .filter(element => !['script', 'style', 'link', 'meta'].includes(String(element.tagName || '').toLowerCase()));
      if (selected && canvas.contains(selected)) {
        const selectedIndex = nodes.indexOf(selected);
        if (selectedIndex >= 0) nodes.splice(selectedIndex, 1);
        nodes.unshift(selected);
      }
      return nodes.map(element => {
        const descriptor = this.describeElement(element);
        this.elementsByKey.set(descriptor.key, element);
        return descriptor;
      });
    }

    findSavedDefinition(selected, state) {
      const editor = this.app && this.app.editor;
      if (!selected || !selected.id || !editor || typeof editor.parseVisualLinks !== 'function') return null;
      return editor.parseVisualLinks().find(definition =>
        definition.sourceId === selected.id
        && definition.settings
        && definition.settings.entry === 'interaction-demo'
      ) || null;
    }

    syncSelection(element) {
      const canvas = this.app && this.app.canvas;
      const selected = element && canvas && canvas.contains(element) ? element : null;
      const changed = selected !== this.selectedElement;
      this.selectedElement = selected;
      const elements = this.collectCanvasElements(selected);

      /* درس جارٍ لا تُمسح خطواته بضغطة على اللوحة. نحدّث قائمة العناصر فقط،
         لأن العنصر الذي يعمل عليه الدرس محدَّد بأدواره لا بتحديد المستخدم. */
      if (this.state.lesson && this.state.lesson.stage) {
        this.state.elements = elements;
        this.renderLauncher();
        if (this.isOpen()) this.renderBody();
        return this.state;
      }

      if (!selected) {
        this.state = createInitialState(null, elements);
      } else if (changed || !this.state.selectedKey) {
        const descriptor = elements.find(item => item.key === this.elementKey(selected)) || this.describeElement(selected);
        const baseState = createInitialState(descriptor, elements);
        const existing = this.findSavedDefinition(selected, baseState);
        this.state = existing ? hydrateStateFromDefinition(baseState, existing) : baseState;
      } else {
        this.state.elements = elements;
        const selectedDescriptor = elements.find(item => item.key === this.state.selectedKey);
        if (!selectedDescriptor) {
          const descriptor = this.describeElement(selected);
          this.state = createInitialState(descriptor, elements);
        }
      }

      this.renderLauncher();
      if (this.isOpen()) this.renderBody();
      return this.state;
    }

    handleSelectionChange(element) {
      return this.syncSelection(element);
    }

    isOpen() {
      return Boolean(this.overlay && this.overlay.isConnected);
    }

    open(trigger, view) {
      if (!this.document) return;
      this.syncSelection(this.app && this.app.selectedElement);
      if (this.isOpen()) {
        this.setView(view || this.state.view);
        return;
      }
      this.trigger = trigger || this.document.getElementById('tab-btn-demo');
      this.state.view = ['condition', 'lessons', 'code'].includes(view) ? view : 'flow';
      const wrapper = this.document.createElement('div');
      wrapper.id = 'interaction-demo-overlay';
      wrapper.className = 'interaction-demo-overlay';
      wrapper.innerHTML = `<section class="interaction-demo-dialog" role="dialog" aria-modal="true" aria-labelledby="interaction-demo-title" aria-describedby="interaction-demo-description">
        <header class="interaction-demo-header">
          <div>
            <span class="interaction-demo-kicker">تفاعل حقيقي · مرتبط بالعنصر المحدد</span>
            <h2 id="interaction-demo-title" tabindex="-1">مصمّم التفاعلات</h2>
            <p id="interaction-demo-description">اختر لحظة البدء، ثم رتّب الخطوات. أضف قرارًا شرطيًا فقط عندما تحتاجه فعلًا.</p>
          </div>
          <button type="button" class="interaction-demo-devtoggle" data-demo-action="toggle-dev-mode" title="وضع المطوّر: إظهار التفاصيل التقنية" aria-label="وضع المطوّر" aria-pressed="false"><i class="fas fa-code" aria-hidden="true"></i></button>
          <button type="button" class="interaction-demo-close" data-demo-action="close" aria-label="إغلاق قواعد التفاعل"><i class="fas fa-xmark" aria-hidden="true"></i></button>
        </header>
        <div class="interaction-demo-tabs" role="tablist" aria-label="أقسام مصمّم التفاعلات">
          <button type="button" class="interaction-demo-tab interaction-demo-tab--lessons" id="demo-tab-lessons" role="tab" aria-controls="interaction-demo-body" data-demo-view="lessons"><span><i class="fas fa-graduation-cap" aria-hidden="true"></i></span> أمثلة جاهزة</button>
          <button type="button" class="interaction-demo-tab" id="demo-tab-flow" role="tab" aria-controls="interaction-demo-body" data-demo-view="flow"><span>١ ثم ٢</span> الخطوات والنتيجة</button>
          <button type="button" class="interaction-demo-tab" id="demo-tab-condition" role="tab" aria-controls="interaction-demo-body" data-demo-view="condition"><span><i class="fas fa-route" aria-hidden="true"></i></span> متى يبدأ؟</button>
          <button type="button" class="interaction-demo-tab" id="demo-tab-code" role="tab" aria-controls="interaction-demo-body" data-demo-view="code"><span>&lt;/&gt;</span> معاينة JavaScript</button>
        </div>
        <div class="demo-rule-bar" id="demo-rule-bar" aria-live="polite"></div>
        <main class="interaction-demo-body" id="interaction-demo-body" role="tabpanel"></main>
      </section>`;
      this.document.body.appendChild(wrapper);
      this.overlay = wrapper;
      this.document.body.classList.add('interaction-demo-is-open');
      this.setExpanded(true);

      wrapper.addEventListener('click', this._boundClick);
      wrapper.addEventListener('change', this._boundChange);
      wrapper.addEventListener('input', this._boundInput);
      wrapper.addEventListener('dragstart', this._boundDragStart);
      wrapper.addEventListener('dragover', this._boundDragOver);
      wrapper.addEventListener('drop', this._boundDrop);
      wrapper.addEventListener('dragend', this._boundDragEnd);
      this.document.addEventListener('keydown', this._boundKeydown, true);
      this.renderBody();
      const title = wrapper.querySelector('#interaction-demo-title');
      if (title) title.focus({ preventScroll: true });
    }

    setExpanded(expanded) {
      const railButton = this.document && this.document.getElementById('tab-btn-demo');
      const bubbleButton = this.document && this.document.getElementById('bubble-demo');
      [railButton, bubbleButton, this.trigger].filter(Boolean).forEach(button =>
        button.setAttribute('aria-expanded', String(Boolean(expanded)))
      );
    }

    close(options) {
      const settings = options || {};
      if (!this.isOpen()) return;
      this.runNonce += 1;
      const overlay = this.overlay;
      overlay.removeEventListener('click', this._boundClick);
      overlay.removeEventListener('change', this._boundChange);
      overlay.removeEventListener('input', this._boundInput);
      overlay.removeEventListener('dragstart', this._boundDragStart);
      overlay.removeEventListener('dragover', this._boundDragOver);
      overlay.removeEventListener('drop', this._boundDrop);
      overlay.removeEventListener('dragend', this._boundDragEnd);
      this.document.removeEventListener('keydown', this._boundKeydown, true);
      overlay.remove();
      this.overlay = null;
      this.document.body.classList.remove('interaction-demo-is-open');
      this.setExpanded(false);
      if (settings.restoreFocus !== false && this.trigger && typeof this.trigger.focus === 'function') {
        this.trigger.focus();
      }
    }

    setView(view, focusMode) {
      this.state.view = ['condition', 'flow', 'code', 'lessons'].includes(view) ? view : 'flow';
      if (!this.isOpen()) return;
      this.renderBody();
      if (focusMode === 'tab') {
        const tab = this.overlay.querySelector(`[data-demo-view="${this.state.view}"]`);
        if (tab) tab.focus();
      } else {
        const headingId = DEMO_VIEW_HEADINGS[this.state.view] || '#demo-flow-title';
        const heading = this.overlay.querySelector(headingId);
        if (heading) heading.focus({ preventScroll: true });
      }
    }

    syncTabs() {
      if (!this.isOpen()) return;
      this.overlay.querySelectorAll('[data-demo-view]').forEach(tab => {
        const selected = tab.dataset.demoView === this.state.view;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      const body = this.overlay.querySelector('#interaction-demo-body');
      if (body) {
        body.setAttribute('aria-labelledby', DEMO_VIEW_TABS[this.state.view] || 'demo-tab-flow');
      }
    }

    renderBody(focusSelector) {
      if (!this.isOpen()) return;
      this.syncTabs();
      this.updateRuleBar();
      const body = this.overlay.querySelector('#interaction-demo-body');
      /* تبويب الدروس يعمل قبل اختيار عنصر: الكتالوج وحده لا يحتاج تحديدًا،
         وشاشة الأدوار هي التي تقول للمستخدم ما ينقص صفحته. */
      body.innerHTML = this.state.view === 'lessons'
        ? renderLessonsBoard(this.state)
        : (!this.state.selectedKey
          ? renderEmptyState()
          : (this.state.view === 'condition'
            ? renderConditionBoard(this.state)
            : (this.state.view === 'code' ? this.renderCodeBoard() : renderFlowBoard(this.state))));
      const devToggle = this.overlay.querySelector('[data-demo-action="toggle-dev-mode"]');
      if (devToggle) {
        devToggle.setAttribute('aria-pressed', this.state.devMode ? 'true' : 'false');
        devToggle.classList.toggle('is-active', !!this.state.devMode);
      }
      if (focusSelector) {
        const target = body.querySelector(focusSelector);
        if (target) target.focus();
      }
    }

    /* تبويب «الكود الناتج»: القاعدة نفسها كما ستُكتب فعلًا — للتعلم وللمطوّرين.
       القراءة فقط؛ التعديل يظل من التبويبين الأولين حفاظًا على البساطة. */
    renderCodeBoard() {
      const core = root && root.VisualLogicCore;
      let statusMarkup;
      let codeMarkup;
      try {
        const definition = buildDefinition(this.state, core);
        const validation = core.validateDefinition(definition);
        const code = core.generateExecutable(definition);
        this._lastGeneratedCode = code;
        statusMarkup = validation.valid
          ? '<div class="demo-code-status" data-state="success"><i class="fas fa-circle-check" aria-hidden="true"></i> القاعدة سليمة — هذا هو الكود الحقيقي الذي سيُحفظ ويعمل.</div>'
          : `<div class="demo-code-status" data-state="warn"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> ${escapeHtml(validation.errors[0] || 'راجع القاعدة.')}</div>`;
        codeMarkup = `<pre class="demo-code-view" dir="ltr">${escapeHtml(code)}</pre>`;
      } catch (error) {
        this._lastGeneratedCode = '';
        statusMarkup = `<div class="demo-code-status" data-state="warn"><i class="fas fa-circle-info" aria-hidden="true"></i> أكمل القاعدة أولًا — ${escapeHtml(error.message)}</div>`;
        codeMarkup = '<pre class="demo-code-view demo-code-view--empty" dir="ltr">// سيظهر الكود هنا فور اكتمال القاعدة</pre>';
      }
      return `<section class="interaction-demo-board interaction-demo-board--code" aria-labelledby="demo-code-title">
        <header class="interaction-demo-board__header interaction-demo-header">
          <div>
            <h3 id="demo-code-title" tabindex="-1"><i class="fas fa-code" aria-hidden="true"></i> الكود الناتج — ما يفعله المتصفح فعلًا</h3>
            <p>أنت تبنيه بالبطاقات والجُمل، وهذه ترجمته الحرفية: التجهيز أولًا، ثم الحدث وبداخله الشرط والخطوات.</p>
          </div>
          <div class="demo-flow-header-actions demo-controls">
            <button type="button" class="demo-btn demo-btn--secondary" data-demo-action="copy-code"><i class="fas fa-copy" aria-hidden="true"></i> انسخ الكود</button>
          </div>
        </header>
        <div class="interaction-demo-board__body interaction-demo-body">
          ${statusMarkup}
          ${codeMarkup}
          <p class="demo-prep-hint"><i class="fas fa-graduation-cap" aria-hidden="true"></i> تلميح للتعلم: عدّل شيئًا في «التجهيز والشرط» أو «التنفيذ» ثم ارجع هنا وشاهد ما الذي تغيّر في الكود.</p>
        </div>
        <footer class="interaction-demo-board__footer demo-controls">
          <button type="button" class="demo-btn demo-btn--secondary" data-demo-action="run-flow"><i class="fas fa-play" aria-hidden="true"></i> جرّب المسار</button>
          <button type="button" class="demo-btn demo-btn--primary" data-demo-action="save-demo"><i class="fas fa-floppy-disk" aria-hidden="true"></i> حفظ التفاعل</button>
        </footer>
      </section>`;
    }

    /* الشريط العلوي الثابت: جملة القاعدة كاملة + لمبة حالة الشرط الآن */
    updateRuleBar() {
      if (!this.isOpen()) return;
      const bar = this.overlay.querySelector('#demo-rule-bar');
      if (!bar) return;
      const markup = this.state.selectedKey ? renderRuleBar(this.state) : '';
      bar.innerHTML = markup;
      bar.hidden = !markup;
    }

    markDirty() {
      this.state.dirty = true;
      this.state.saveMessage = 'لديك تعديلات غير محفوظة. لن يتغيّر المشروع قبل الضغط على «حفظ التفاعل».';
    }

    refreshLiveValues(render) {
      this.state.elements = (this.state.elements || []).map(descriptor => {
        const element = this.elementsByKey.get(descriptor.key);
        if (!element) return descriptor;
        return Object.assign({}, descriptor, {
          id: element.id || '',
          sampleValue: this.readElementValue(element),
          disabled: Boolean(element.disabled),
          visible: Boolean(!element.hidden && (!element.style || element.style.display !== 'none')),
          classNames: Array.from(element.classList || []),
          hasChildren: Boolean(element.children && element.children.length)
        });
      });
      if (render !== false && this.isOpen()) this.renderBody();
    }

    updateConditionPreview() {
      if (!this.isOpen()) return;
      this.updateRuleBar();
      if (this.state.view !== 'condition') return;
      const valid = evaluateCondition(this.state);
      const source = descriptorByKey(this.state, this.state.sourceKey);
      const sentence = this.overlay.querySelector('#demo-sentence');
      const result = this.overlay.querySelector('#demo-condition-result');
      if (sentence) {
        sentence.innerHTML = `<strong>القرار:</strong> إذا كان ${escapeHtml(conditionSentence(this.state))} <i class="fas fa-arrow-left" aria-hidden="true"></i> نفّذ الخطوات.`;
      }
      if (result) {
        result.dataset.valid = String(valid);
        result.dataset.state = valid ? 'success' : 'error';
        const summary = result.closest('.demo-summary');
        if (summary) summary.dataset.state = valid ? 'success' : 'error';
        result.innerHTML = `<i class="fas ${valid ? 'fa-circle-check' : 'fa-circle-xmark'}" aria-hidden="true"></i><span>الحالة الحالية: «${escapeHtml(formatSampleValue(source, this.state.operator, this.state.compareValue))}» — ${valid ? 'سيمر التنفيذ' : 'سينتقل إلى «وإلا»'}</span>`;
      }
    }

    handleClick(event) {
      if (event.target === this.overlay) {
        this.close();
        return;
      }
      const tab = event.target.closest('[data-demo-view]');
      if (tab) {
        this.setView(tab.dataset.demoView, 'tab');
        return;
      }
      const control = event.target.closest('[data-demo-action]');
      if (!control) return;
      const action = control.dataset.demoAction;

      if (action === 'close') this.close();
      else if (action === 'edit-condition') this.setView('condition', 'heading');
      else if (action === 'done-condition') this.setView('flow', 'heading');
      else if (action === 'set-condition-mode') {
        this.state.conditionEnabled = control.dataset.value === 'conditional';
        if (!this.state.conditionEnabled) this.state.secondCondition = false;
        this.markDirty();
        this.renderBody(`[data-demo-action="set-condition-mode"][data-value="${control.dataset.value}"]`);
      }
      else if (action === 'try-condition') {
        this.refreshLiveValues(false);
        this.updateConditionPreview();
        const result = this.overlay.querySelector('#demo-condition-result');
        if (result) {
          result.classList.remove('is-pulsing');
          void result.offsetWidth;
          result.classList.add('is-pulsing');
        }
      } else if (action === 'refresh-page-value') {
        this.refreshLiveValues(true);
      } else if (action === 'set-join') {
        this.state.join = control.dataset.value === 'OR' ? 'OR' : 'AND';
        this.markDirty();
        this.renderBody(`[data-demo-action="set-join"][data-value="${this.state.join}"]`);
      } else if (action === 'toggle-second-condition') {
        this.state.secondCondition = !this.state.secondCondition;
        this.markDirty();
        this.renderBody('[data-demo-action="toggle-second-condition"]');
      } else if (action === 'move-action') {
        const index = Number(control.dataset.index);
        this.moveGroup(control.dataset.group, index, index + Number(control.dataset.direction));
      } else if (action === 'add-action') {
        this.addAction(control.dataset.group);
      } else if (action === 'remove-action') {
        this.removeAction(control.dataset.group, Number(control.dataset.index));
      } else if (action === 'run-flow') {
        /* «جرّب القاعدة كاملة» متاح من شاشة الشرط أيضًا — ننتقل للتنفيذ ثم نشغّل */
        if (this.state.view !== 'flow') {
          this.setView('flow');
          const controller = this;
          root.setTimeout(() => controller.runFlow(), 60);
        } else {
          this.runFlow();
        }
      } else if (action === 'toggle-dev-mode') {
        this.state.devMode = !this.state.devMode;
        this.renderBody();
      } else if (action === 'copy-code') {
        const code = this._lastGeneratedCode || '';
        if (code && root && root.navigator && root.navigator.clipboard) {
          root.navigator.clipboard.writeText(code);
          this.announce('نُسخ الكود إلى الحافظة.');
        } else {
          this.announce('لا يوجد كود مكتمل للنسخ بعد.');
        }
      } else if (action === 'delete-saved') {
        const editor = this.app && this.app.editor;
        const savedId = this.state.savedDefinitionId;
        if (savedId && editor && typeof editor.deleteVisualLink === 'function' && root.confirm('هل تريد حذف هذا التفاعل المحفوظ نهائيًا من المشروع؟')) {
          editor.deleteVisualLink(savedId);
          this.state.savedDefinitionId = '';
          this.state.saveMessage = 'حُذف التفاعل المحفوظ. المسودة الحالية ما زالت أمامك ويمكن حفظها من جديد.';
          this.renderBody('[data-demo-action="save-demo"]');
        }
      } else if (action === 'add-memory') {
        this.state.memory = (this.state.memory || []).concat({
          id: `box-${++this.prepSerial}`,
          name: `box${this.state.memory.length + 1}`,
          type: 'Number',
          initialValue: '0'
        });
        this.markDirty();
        this.renderBody(`[data-demo-input="memory-name"][data-box-id="box-${this.prepSerial}"]`);
      } else if (action === 'remove-memory') {
        this.state.memory = (this.state.memory || []).filter(box => box.id !== control.dataset.boxId);
        this.markDirty();
        this.renderBody('[data-demo-action="add-memory"]');
      } else if (action === 'add-recipe') {
        this.state.recipes = (this.state.recipes || []).concat({
          id: `recipe-${++this.prepSerial}`,
          name: `myRecipe${this.state.recipes.length + 1}`,
          params: '',
          code: ''
        });
        this.markDirty();
        this.renderBody(`[data-demo-input="recipe-name"][data-recipe-id="recipe-${this.prepSerial}"]`);
      } else if (action === 'remove-recipe') {
        this.state.recipes = (this.state.recipes || []).filter(recipe => recipe.id !== control.dataset.recipeId);
        this.markDirty();
        this.renderBody('[data-demo-action="add-recipe"]');
      } else if (action === 'add-precode') {
        /* الكود الحر صفٌّ في قائمة التعريف: يظهر فور وجود نص فيه */
        if (!String(this.state.preCode || '').trim()) {
          this.state.preCode = '// يعمل مرة واحدة قبل الحدث\n';
          this.markDirty();
        }
        this.renderBody('[data-demo-input="pre-code"]');
      } else if (action === 'remove-precode') {
        this.state.preCode = '';
        this.markDirty();
        this.renderBody('[data-demo-action="add-precode"]');
      } else if (action === 'go-prep') {
        this.setView('flow');
        const prep = this.overlay.querySelector('#demo-declare-list');
        if (prep) prep.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (action === 'open-palette') {
        const group = control.dataset.group || 'inside';
        this.state.palette = this.state.palette === group ? '' : group;
        this.renderBody(`[data-demo-action="open-palette"][data-group="${group}"]`);
      } else if (action === 'palette-category') {
        this.state.paletteCategory = control.dataset.category || 'common';
        this.renderBody(`[data-demo-action="palette-category"][data-category="${this.state.paletteCategory}"]`);
      } else if (action === 'palette-add') {
        const group = control.dataset.group || this.state.palette || 'inside';
        this.addAction(group, control.dataset.kind);
        this.state.palette = '';
      } else if (action === 'save-demo') {
        this.saveDemo();
      } else if (action === 'reset-demo') {
        this.resetDemo();
      } else if (action.indexOf('lesson-') === 0) {
        this.handleLessonClick(action, control);
      }
    }

    /* ═════ أزرار الدروس ═════
       كل ضغطة تعيد بناء الحالة من الكتالوج حتى الخطوة المطلوبة، فلا فرق
       بين «تقدّم» و«تراجع» في النتيجة — وهذا ما يجعل التراجع آمنًا دائمًا. */
    handleLessonClick(action, control) {
      const catalogue = tutorialCatalogue();
      const lesson = this.state.lesson || (this.state.lesson = { tutorialId: '', stepIndex: 0, roles: {}, done: false, stage: '' });

      if (action === 'lesson-pick') {
        const tutorial = catalogue.getTutorial(control.dataset.lesson);
        if (!tutorial) return;
        const resolved = resolveTutorialRoles(tutorial, this.state.elements || []);
        /* شاشة الأدوار لا تلمس قوائم المستخدم؛ الإفراغ يحدث عند «ابدأ الدرس» فقط */
        this.state.lesson = {
          tutorialId: tutorial.id,
          stepIndex: 0,
          roles: Object.assign({}, resolved.roles),
          done: false,
          stage: 'setup'
        };
        this.renderBody('[data-demo-action="lesson-start"]');
        return;
      }

      if (action === 'lesson-cancel') {
        this.state.lesson = { tutorialId: '', stepIndex: 0, roles: {}, done: false, stage: '' };
        this.renderBody();
        return;
      }

      const tutorial = catalogue.getTutorial(lesson.tutorialId);
      if (!tutorial) return;

      if (action === 'lesson-start' || action === 'lesson-restart') {
        const resolved = resolveTutorialRoles(tutorial, this.state.elements || [], lesson.roles);
        if (!resolved.ready) {
          this.announce('ما زال ينقص صفحتك عنصر لهذا الدرس.');
          return;
        }
        applyTutorialUpTo(this.state, tutorial, resolved.roles, 0);
        this.markDirty();
        this.renderBody('[data-demo-action="lesson-next"]');
        return;
      }

      if (action === 'lesson-next' || action === 'lesson-back') {
        const target = Number(lesson.stepIndex) + (action === 'lesson-next' ? 1 : -1);
        applyTutorialUpTo(this.state, tutorial, lesson.roles, target);
        this.markDirty();
        this.renderBody('#demo-lesson-step-title');
        const step = tutorial.steps[this.state.lesson.stepIndex - 1];
        if (action === 'lesson-next' && step) this.announce(`تمّت الخطوة: ${step.title}`);
        return;
      }

      if (action === 'lesson-open-flow') this.setView('flow', 'heading');
    }

    setPrimarySource(key) {
      const source = descriptorByKey(this.state, key);
      if (!source) return;
      this.state.sourceKey = source.key;
      this.state.operator = defaultOperator(source);
      this.state.compareValue = defaultCompareValue(source);
      this.markDirty();
    }

    handleChange(event) {
      const input = event.target;
      if (input.dataset.demoInput === 'lesson-role') {
        /* تغيير الدور يدويًا: نحجزه ثم نعيد التوزيع حتى لا يُسرَق لعنصر آخر */
        const lesson = this.state.lesson || {};
        const roles = Object.assign({}, lesson.roles);
        if (input.value) roles[input.dataset.role] = input.value;
        else delete roles[input.dataset.role];
        const tutorial = tutorialCatalogue().getTutorial(lesson.tutorialId);
        const resolved = tutorial ? resolveTutorialRoles(tutorial, this.state.elements || [], roles) : { roles };
        /* الدور الاختياري الذي أفرغه المستخدم عمدًا يبقى فارغًا */
        if (!input.value) delete resolved.roles[input.dataset.role];
        this.state.lesson = Object.assign({}, lesson, { roles: resolved.roles });
        this.renderBody(`[data-demo-input="lesson-role"][data-role="${input.dataset.role}"]`);
        return;
      }
      if (input.name === 'demo-source' || input.dataset.demoInput === 'source-select') {
        this.setPrimarySource(input.value);
        this.renderBody(input.name === 'demo-source'
          ? `input[name="demo-source"][value="${input.value}"]`
          : '[data-demo-input="source-select"]');
      } else if (input.name === 'demo-operator') {
        this.state.operator = input.value;
        this.markDirty();
        this.renderBody(`input[name="demo-operator"][value="${input.value}"]`);
      } else if (input.name === 'demo-second-operator') {
        this.state.secondOperator = input.value;
        this.markDirty();
        this.renderBody(`input[name="demo-second-operator"][value="${input.value}"]`);
      } else if (input.dataset.demoInput === 'second-source') {
        const source = descriptorByKey(this.state, input.value);
        if (source) {
          this.state.secondSourceKey = source.key;
          this.state.secondOperator = defaultOperator(source);
          this.state.secondCompareValue = defaultCompareValue(source);
          this.markDirty();
          this.renderBody('[data-demo-input="second-source"]');
        }
      } else if (input.dataset.demoInput === 'event') {
        this.state.event = input.value;
        this.markDirty();
        this.renderBody('[data-demo-input="event"]');
      } else if (input.dataset.demoInput === 'action-kind') {
        const action = this.getAction(input.dataset.group, Number(input.dataset.index));
        if (!action) return;
        action.kind = ACTION_TYPES[input.value] ? input.value : 'setText';
        action.value = ACTION_TYPES[action.kind].defaultValue || '';
        action.params = defaultParamsFor(action.kind);
        (actionMeta(action.kind).fields || []).forEach(field => {
          if (field.type === 'element' && !action.params[field.key]) {
            action.params[field.key] = this.state.sourceKey || this.state.selectedKey || '';
          }
        });
        action.valueMode = 'static';
        action.valueElementKey = '';
        action.valueVariable = '';
        this.markDirty();
        this.renderBody(`[data-demo-input="action-kind"][data-group="${input.dataset.group}"][data-index="${input.dataset.index}"]`);
      } else if (input.dataset.demoInput === 'action-target') {
        const action = this.getAction(input.dataset.group, Number(input.dataset.index));
        const target = descriptorByKey(this.state, input.value);
        if (!action || !target) return;
        action.targetKey = target.key;
        action.targetId = target.id || '';
        this.markDirty();
        this.renderBody(`[data-demo-input="action-target"][data-group="${input.dataset.group}"][data-index="${input.dataset.index}"]`);
      } else if (input.dataset.demoInput === 'action-value-mode') {
        const action = this.getAction(input.dataset.group, Number(input.dataset.index));
        if (!action) return;
        action.valueMode = ['static', 'element', 'variable'].includes(input.value) ? input.value : 'static';
        if (action.valueMode === 'element' && !action.valueElementKey) {
          action.valueElementKey = this.state.sourceKey || this.state.selectedKey || '';
        }
        this.markDirty();
        this.renderBody(`[data-demo-input="action-value-mode"][data-group="${input.dataset.group}"][data-index="${input.dataset.index}"]`);
      } else if (input.dataset.demoInput === 'action-value-element') {
        const action = this.getAction(input.dataset.group, Number(input.dataset.index));
        const source = descriptorByKey(this.state, input.value);
        if (!action || !source) return;
        action.valueElementKey = source.key;
        this.markDirty();
        this.renderBody(`[data-demo-input="action-value-element"][data-group="${input.dataset.group}"][data-index="${input.dataset.index}"]`);
      } else if (input.dataset.demoInput === 'action-param' && input.tagName === 'SELECT') {
        const action = this.getAction(input.dataset.group, Number(input.dataset.index));
        if (!action) return;
        action.params = action.params || {};
        action.params[input.dataset.param] = input.value;
        this.markDirty();
        this.renderBody(`[data-demo-input="action-param"][data-param="${input.dataset.param}"][data-group="${input.dataset.group}"][data-index="${input.dataset.index}"]`);
      } else if (input.dataset.demoInput === 'memory-type') {
        const box = (this.state.memory || []).find(item => item.id === input.dataset.boxId);
        if (!box) return;
        box.type = input.value;
        this.markDirty();
        this.renderBody(`[data-demo-input="memory-type"][data-box-id="${input.dataset.boxId}"]`);
      }
    }

    handleInput(event) {
      const kind = event.target.dataset.demoInput;
      if (kind === 'compare-value') {
        this.state.compareValue = event.target.value;
        this.markDirty();
        this.updateConditionPreview();
      } else if (kind === 'second-compare-value') {
        this.state.secondCompareValue = event.target.value;
        this.markDirty();
        this.updateConditionPreview();
      } else if (kind === 'action-value') {
        const action = this.getAction(event.target.dataset.group, Number(event.target.dataset.index));
        if (action) {
          action.value = event.target.value;
          this.markDirty();
          this.updateRuleBar();
        }
      } else if (kind === 'action-value-variable') {
        const action = this.getAction(event.target.dataset.group, Number(event.target.dataset.index));
        if (action) {
          action.valueVariable = event.target.value;
          this.markDirty();
          this.updateRuleBar();
        }
      } else if (kind === 'action-param' && event.target.tagName !== 'SELECT') {
        const action = this.getAction(event.target.dataset.group, Number(event.target.dataset.index));
        if (action) {
          action.params = action.params || {};
          action.params[event.target.dataset.param] = event.target.value;
          this.markDirty();
          this.updateRuleBar();
        }
      } else if (kind === 'event-key') {
        this.state.eventKey = event.target.value;
        this.markDirty();
        this.updateRuleBar();
      } else if (kind === 'memory-name' || kind === 'memory-initial') {
        const box = (this.state.memory || []).find(item => item.id === event.target.dataset.boxId);
        if (box) {
          box[kind === 'memory-name' ? 'name' : 'initialValue'] = event.target.value;
          this.markDirty();
          this.updateRuleBar();
        }
      } else if (kind === 'recipe-name' || kind === 'recipe-params' || kind === 'recipe-code') {
        const recipe = (this.state.recipes || []).find(item => item.id === event.target.dataset.recipeId);
        if (recipe) {
          const field = kind === 'recipe-name' ? 'name' : (kind === 'recipe-params' ? 'params' : 'code');
          recipe[field] = event.target.value;
          this.markDirty();
          this.updateRuleBar();
        }
      } else if (kind === 'pre-code') {
        this.state.preCode = event.target.value;
        this.markDirty();
        this.updateRuleBar();
      }
    }

    handleKeydown(event) {
      if (!this.isOpen()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.close();
        return;
      }
      const tab = event.target.closest('[data-demo-view]');
      if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const tabs = Array.from(this.overlay.querySelectorAll('[data-demo-view]'));
        let index = tabs.indexOf(tab);
        if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = tabs.length - 1;
        else index = (index + (event.key === 'ArrowLeft' ? 1 : -1) + tabs.length) % tabs.length;
        this.setView(tabs[index].dataset.demoView, 'tab');
        return;
      }
      const handle = event.target.closest('[data-demo-handle]');
      if (handle && ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const group = handle.dataset.group;
        const list = this.state[actionGroupKey(group)] || [];
        const from = Number(handle.dataset.index);
        let to = from;
        if (event.key === 'ArrowUp') to -= 1;
        else if (event.key === 'ArrowDown') to += 1;
        else if (event.key === 'Home') to = 0;
        else to = list.length - 1;
        this.moveGroup(group, from, to);
        return;
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(this.overlay.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(element => !element.hidden && element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && this.document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && this.document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    handleDragStart(event) {
      const row = event.target.closest('[draggable="true"][data-group]');
      if (!row) return;
      this.dragInfo = { group: row.dataset.group, index: Number(row.dataset.index) };
      row.dataset.dragging = 'true';
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `${this.dragInfo.group}:${this.dragInfo.index}`);
      }
    }

    handleDragOver(event) {
      const row = event.target.closest('[draggable="true"][data-group]');
      if (!row || !this.dragInfo || row.dataset.group !== this.dragInfo.group) return;
      event.preventDefault();
      row.dataset.dropTarget = 'true';
    }

    handleDrop(event) {
      const row = event.target.closest('[draggable="true"][data-group]');
      if (!row || !this.dragInfo || row.dataset.group !== this.dragInfo.group) return;
      event.preventDefault();
      this.moveGroup(this.dragInfo.group, this.dragInfo.index, Number(row.dataset.index));
      this.dragInfo = null;
    }

    handleDragEnd() {
      this.dragInfo = null;
      if (!this.isOpen()) return;
      this.overlay.querySelectorAll('[data-dragging], [data-drop-target]').forEach(row => {
        delete row.dataset.dragging;
        delete row.dataset.dropTarget;
      });
    }

    getAction(group, index) {
      const list = this.state[actionGroupKey(group)] || [];
      return list[index] || null;
    }

    moveGroup(group, from, to) {
      const key = actionGroupKey(group);
      const list = this.state[key] || [];
      const destination = Math.max(0, Math.min(list.length - 1, to));
      if (from < 0 || from >= list.length || destination === from) return;
      this.state[key] = moveAction(list, from, destination);
      this.markDirty();
      this.renderBody(`[data-demo-handle][data-group="${group}"][data-index="${destination}"]`);
    }

    addAction(group, kind) {
      const normalizedGroup = ['inside', 'else', 'outside'].includes(group) ? group : 'outside';
      const selected = descriptorByKey(this.state, this.state.selectedKey);
      const action = makeAction(normalizedGroup, selected, ++this.actionSerial);
      if (kind && ACTION_TYPES[kind]) {
        action.kind = kind;
        action.value = ACTION_TYPES[kind].defaultValue || '';
        action.params = defaultParamsFor(kind);
      }
      const key = actionGroupKey(normalizedGroup);
      this.state[key] = (this.state[key] || []).concat(action);
      this.markDirty();
      const index = this.state[key].length - 1;
      this.renderBody(`[data-demo-input="action-kind"][data-group="${normalizedGroup}"][data-index="${index}"]`);
      this.announce(`أُضيفت خطوة: ${actionLabel(action, this.state)}.`);
    }

    removeAction(group, index) {
      const key = actionGroupKey(group);
      const list = this.state[key] || [];
      if (index < 0 || index >= list.length) return;
      const removed = list[index];
      this.state[key] = list.filter((item, itemIndex) => itemIndex !== index);
      this.markDirty();
      this.renderBody();
      this.announce(`حُذف الإجراء: ${actionLabel(removed, this.state)}.`);
    }

    announce(message) {
      if (!this.isOpen()) return;
      const status = this.overlay.querySelector('#demo-run-status');
      if (status) status.textContent = message;
    }

    async pause(milliseconds, nonce) {
      await new Promise(resolve => root.setTimeout(resolve, milliseconds));
      return this.isOpen() && nonce === this.runNonce;
    }

    stepNode(stepId) {
      if (!this.isOpen()) return null;
      return Array.from(this.overlay.querySelectorAll('[data-step-id]'))
        .find(node => node.dataset.stepId === stepId) || null;
    }

    async visitStep(stepId, label, nonce) {
      const node = this.stepNode(stepId);
      if (!node) return false;
      node.dataset.runState = 'current';
      node.setAttribute('aria-current', 'step');
      this.announce(`ينفّذ الآن: ${label}`);
      if (!await this.pause(220, nonce)) return false;
      node.dataset.runState = 'done';
      node.removeAttribute('aria-current');
      return true;
    }

    async runFlow() {
      if (!this.isOpen() || this.state.view !== 'flow') return;
      this.refreshLiveValues(false);
      this.renderBody();
      this.runNonce += 1;
      const nonce = this.runNonce;
      const body = this.overlay.querySelector('#interaction-demo-body');
      const runButton = this.overlay.querySelector('[data-demo-action="run-flow"]');
      if (body) body.setAttribute('aria-busy', 'true');
      if (runButton) runButton.disabled = true;
      this.overlay.querySelectorAll('[data-step-id]').forEach(node => {
        node.dataset.runState = 'idle';
        node.removeAttribute('aria-current');
      });

      const selected = descriptorByKey(this.state, this.state.selectedKey);
      /* المحاكاة تمشي بترتيب الملف نفسه: أسطر التعريف أولًا (تُحجز الخانات)،
         ثم الحدث، ثم القراءة، ثم الشرط — فيرى المستخدم التسلسل لا النتيجة فقط. */
      const declareNodes = Array.from(this.overlay.querySelectorAll('#demo-declare-list > [data-step-id]'));
      for (const node of declareNodes) {
        const title = node.querySelector('.demo-step-label strong');
        if (!await this.visitStep(node.dataset.stepId, `تعريف: ${title ? title.textContent.trim() : ''}`, nonce)) return;
      }
      if (!await this.visitStep('trigger', `${EVENT_LABELS[this.state.event] || this.state.event} على ${selected.shortLabel}`, nonce)) return;
      if (this.stepNode('reads') && !await this.visitStep('reads', 'قراءة القيمة الحالية من الصفحة', nonce)) return;
      if (!await this.visitStep(
        'gate',
        this.state.conditionEnabled ? `قرار: ${conditionSentence(this.state)}` : 'تنفيذ مباشر بلا شرط إضافي',
        nonce
      )) return;
      const passed = this.state.conditionEnabled ? evaluateCondition(this.state) : true;
      const active = passed ? this.state.insideActions : this.state.elseActions;
      const skipped = passed ? this.state.elseActions : this.state.insideActions;
      skipped.forEach(action => {
        const node = this.stepNode(action.id);
        if (node) node.dataset.runState = 'skipped';
      });
      for (const action of active) {
        if (!await this.visitStep(action.id, actionLabel(action, this.state), nonce)) return;
      }
      for (const action of this.state.outsideActions) {
        if (!await this.visitStep(action.id, `${actionLabel(action, this.state)} — يعمل دائمًا`, nonce)) return;
      }
      if (nonce !== this.runNonce || !this.isOpen()) return;
      if (body) body.setAttribute('aria-busy', 'false');
      if (runButton) runButton.disabled = false;
      this.announce(!this.state.conditionEnabled
        ? 'اكتملت المحاكاة: وقع الحدث فتم تنفيذ الخطوات مباشرة.'
        : (passed
          ? 'اكتملت المحاكاة: تحقق الشرط، فتم المرور داخل البوابة ثم تنفيذ الإجراءات الدائمة.'
          : 'اكتملت المحاكاة: لم يتحقق الشرط، فتم تنفيذ مسار «وإلا» ثم الإجراءات الدائمة.'));
    }

    requiredElementKeys() {
      const keys = new Set([this.state.selectedKey]);
      if (this.state.conditionEnabled) keys.add(this.state.sourceKey);
      if (this.state.conditionEnabled && this.state.secondCondition) keys.add(this.state.secondSourceKey);
      ['insideActions', 'elseActions', 'outsideActions'].forEach(group => {
        (this.state[group] || []).forEach(action => {
          const meta = actionMeta(action.kind);
          if (!meta.targetless) keys.add(action.targetKey);
          if (meta.dynamic && action.valueMode === 'element' && action.valueElementKey) {
            keys.add(action.valueElementKey);
          }
          (meta.fields || []).forEach(field => {
            if (field.type === 'element' && action.params && action.params[field.key]) {
              keys.add(action.params[field.key]);
            }
          });
        });
      });
      keys.delete('');
      return keys;
    }

    prepareElementIdsForSave() {
      const editor = this.app && this.app.editor;
      if (!editor || typeof editor.ensureInteractionHubElementId !== 'function') {
        throw new Error('تعذّر الوصول إلى نظام ربط عناصر الصفحة.');
      }
      this.requiredElementKeys().forEach(key => {
        const element = this.elementsByKey.get(key);
        if (!element || !element.isConnected) throw new Error('أحد العناصر المختارة لم يعد موجودًا في الصفحة.');
        const id = element.id || editor.ensureInteractionHubElementId(element);
        const descriptor = descriptorByKey(this.state, key);
        if (descriptor) descriptor.id = id;
      });
      ['insideActions', 'elseActions', 'outsideActions'].forEach(group => {
        (this.state[group] || []).forEach(action => {
          const target = descriptorByKey(this.state, action.targetKey);
          action.targetId = target ? target.id : '';
        });
      });
    }

    saveDemo() {
      const core = root && root.VisualLogicCore;
      const editor = this.app && this.app.editor;
      try {
        if (!this.state.selectedKey) throw new Error('اختر عنصرًا من الصفحة أولًا.');
        if (!editor || typeof editor.saveVisualLinkFromPopup !== 'function') {
          throw new Error('نظام حفظ التفاعلات غير متاح.');
        }
        this.prepareElementIdsForSave();
        const definition = buildDefinition(this.state, core);
        const validation = core.validateDefinition(definition);
        if (!validation.valid) throw new Error(validation.errors[0] || 'التعريف غير صالح.');

        const existing = typeof editor.parseVisualLinks === 'function'
          ? editor.parseVisualLinks().find(item => item.id === definition.id)
          : null;
        const before = String(editor.customJS || '');
        editor.visualLinkDraft = definition;
        editor.activeVisualLink = {
          existingId: existing ? existing.id : null,
          draftId: definition.id,
          sourceId: definition.sourceId,
          targetId: definition.targetId
        };
        editor.e1PendingVariableRenames = [];
        editor.e12RawVariableNames = Object.create(null);
        editor.e12RawFunctionNames = Object.create(null);
        editor.saveVisualLinkFromPopup();

        const saved = typeof editor.parseVisualLinks === 'function'
          ? editor.parseVisualLinks().find(item => item.id === definition.id)
          : null;
        if (!saved || String(editor.customJS || '') === before && !existing) {
          throw new Error('لم يؤكد نظام التفاعلات عملية الحفظ.');
        }
        this.state.savedDefinitionId = definition.id;
        this.state.savedAt = new Date().toISOString();
        this.state.dirty = false;
        this.state.saveMessage = existing
          ? `تم تحديث التفاعل الحقيقي للعنصر ${definition.sourceId} داخل «التفاعلات وJS».`
          : `تم إنشاء تفاعل حقيقي للعنصر ${definition.sourceId} داخل «التفاعلات وJS».`;
        this.refreshLiveValues(false);
      } catch (error) {
        if (editor && typeof editor.releaseTransientVisualLinkIds === 'function') {
          editor.releaseTransientVisualLinkIds();
        }
        this.state.saveMessage = `تعذّر الحفظ: ${error.message}`;
      }
      this.renderBody('[data-demo-action="save-demo"]');
    }

    resetDemo() {
      this.runNonce += 1;
      const selected = this.selectedElement;
      const elements = this.collectCanvasElements(selected);
      const descriptor = selected
        ? elements.find(item => item.key === this.elementKey(selected)) || this.describeElement(selected)
        : null;
      const view = this.state.view;
      this.state = createInitialState(descriptor, elements);
      this.state.view = view;
      this.state.saveMessage = 'أُعيد ضبط المسودة فقط؛ أي تفاعل محفوظ سابقًا لم يُحذف.';
      this.renderBody('[data-demo-action="reset-demo"]');
    }
  }

  function createController(app, options) {
    return new DemoController(app, options);
  }

  return {
    ACTION_TYPES,
    ACTION_GROUPS,
    EVENT_LABELS,
    NO_VALUE_OPERATORS,
    ruleSentence,
    actionPhrase,
    createInitialState,
    inferElementProfile,
    normalizeDescriptor,
    operatorOptions,
    eventOptionsFor,
    moveAction,
    evaluateCondition,
    conditionSentence,
    buildDefinition,
    buildCodeOutline,
    cleanCodeFragment,
    hydrateStateFromDefinition,
    tutorialCatalogue,
    resolveTutorialRoles,
    applyTutorialStep,
    startTutorial,
    applyTutorialUpTo,
    DemoController,
    createController
  };
});
