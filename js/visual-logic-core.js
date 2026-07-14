/* Universal Visual Logic Builder - Phase A pure data/code layer.
 *
 * This file intentionally has no DOM-editor dependencies.  The browser UI uses
 * it through window.VisualLogicCore and the Node test suite requires it
 * directly.  Keeping the schema/compiler here makes saved links deterministic
 * and lets the popup reopen from metadata instead of guessing from JavaScript.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.VisualLogicCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCHEMA_VERSION = 10;

  const QUICK_RECIPES = {
    /* ── Data Transfer ── */
    transferText: {
      label: '📝 نقل النص',
      description: 'نقل نص من حقل إدخال إلى عنصر آخر.',
      icon: 'fa-exchange-alt',
      group: 'dataTransfer',
      actionType: 'transferText',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { sourceElementId: '', targetElementId: '', transferMode: 'replace', clearInput: false, skipEmpty: false, trimSpaces: false },
      steps: [
        { id: 'source', title: 'اختر العنصر المصدر', subtitle: 'حقل الإدخال الذي سيُنقل منه النص', type: 'elementPicker', filter: 'inputs' },
        { id: 'target', title: 'اختر العنصر الهدف', subtitle: 'العنصر الذي سيظهر فيه النص', type: 'elementPicker', filter: 'textTargets' },
        { id: 'mode', title: 'اختر طريقة النقل', subtitle: 'كيف سيتم وضع النص في الهدف', type: 'radio', options: [
          { value: 'replace', label: 'استبدال النص', icon: 'fa-sync-alt' },
          { value: 'append', label: 'إضافة في النهاية', icon: 'fa-indent' },
          { value: 'prepend', label: 'إضافة في البداية', icon: 'fa-outdent' }
        ]},
        { id: 'options', title: 'خيارات إضافية', subtitle: 'ضبط سلوك النقل', type: 'checkboxes', options: [
          { key: 'clearInput', label: 'مسح حقل الإدخال بعد النقل' },
          { key: 'skipEmpty', label: 'تجاهل إذا كان الإدخال فارغًا' },
          { key: 'trimSpaces', label: 'إزالة المسافات الزائدة' }
        ]}
      ]
    },
    /* ── DOM Elements ── */
    addElement: {
      label: '➕ إضافة عنصر',
      description: 'إنشاء عنصر HTML جديد وإضافته.',
      icon: 'fa-plus-circle',
      group: 'elements',
      actionType: 'addElement',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { tagName: 'div', content: '', insertPosition: 'beforeend' },
      steps: [
        { id: 'tag', title: 'نوع العنصر', subtitle: 'اختر نوع العنصر المراد إنشاؤه', type: 'radio', options: [
          { value: 'div', label: 'div — حاوية', icon: 'fa-square' },
          { value: 'p', label: 'p — فقرة', icon: 'fa-paragraph' },
          { value: 'span', label: 'span — نص مضمن', icon: 'fa-font' },
          { value: 'li', label: 'li — عنصر قائمة', icon: 'fa-list' },
          { value: 'button', label: 'button — زر', icon: 'fa-hand-pointer' }
        ]},
        { id: 'content', title: 'المحتوى', subtitle: 'النص أو المحتوى الداخلي', type: 'textInput', placeholder: 'مثال: عنصر جديد' },
        { id: 'position', title: 'موضع الإدراج', subtitle: 'أين يُضاف العنصر الجديد', type: 'radio', options: [
          { value: 'beforeend', label: 'في النهاية (آخر ابن)', icon: 'fa-arrow-down' },
          { value: 'afterbegin', label: 'في البداية (أول ابن)', icon: 'fa-arrow-up' },
          { value: 'beforebegin', label: 'قبل العنصر الهدف', icon: 'fa-level-up-alt' },
          { value: 'afterend', label: 'بعد العنصر الهدف', icon: 'fa-level-down-alt' }
        ]}
      ]
    },
    removeElement: {
      label: '❌ حذف عنصر',
      description: 'إزالة العنصر المستهدف من الصفحة.',
      icon: 'fa-trash-alt',
      group: 'elements',
      actionType: 'remove',
      defaults: {}
    },
    changeText: {
      label: '✏️ تغيير النص',
      description: 'استبدال النص داخل العنصر المستهدف.',
      icon: 'fa-i-cursor',
      group: 'elements',
      actionType: 'text',
      defaults: { text: 'تم التغيير' }
    },
    changeImage: {
      label: '🖼️ تغيير الصورة',
      description: 'تغيير مصدر صورة أو خلفية عنصر.',
      icon: 'fa-image',
      group: 'elements',
      actionType: 'changeImage',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { imageUrl: '', changeType: 'src' },
      steps: [
        { id: 'type', title: 'نوع التغيير', subtitle: 'ماذا تريد تغييره', type: 'radio', options: [
          { value: 'src', label: 'مصدر الصورة (src)', icon: 'fa-image' },
          { value: 'background', label: 'صورة الخلفية (background)', icon: 'fa-fill-drip' }
        ]},
        { id: 'url', title: 'رابط الصورة', subtitle: 'أدخل رابط URL للصورة الجديدة', type: 'textInput', placeholder: 'https://example.com/image.jpg' }
      ]
    },
    changeLink: {
      label: '🔗 تغيير الرابط',
      description: 'تغيير رابط href لعنصر رابط.',
      icon: 'fa-link',
      group: 'elements',
      actionType: 'changeLink',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { url: '', openInNewTab: false },
      steps: [
        { id: 'url', title: 'الرابط الجديد', subtitle: 'أدخل رابط URL الجديد', type: 'textInput', placeholder: 'https://example.com' },
        { id: 'options', title: 'خيارات', subtitle: 'إعدادات إضافية', type: 'checkboxes', options: [
          { key: 'openInNewTab', label: 'فتح في تبويب جديد' }
        ]}
      ]
    },
    /* ── Styling ── */
    changeCSS: {
      label: '🎨 تغيير CSS',
      description: 'تغيير خاصية CSS واحدة وقيمتها.',
      icon: 'fa-palette',
      group: 'styling',
      actionType: 'style',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { property: 'color', value: '#f59e0b' },
      steps: [
        { id: 'property', title: 'خاصية CSS', subtitle: 'اختر الخاصية المراد تغييرها', type: 'radio', options: [
          { value: 'color', label: 'لون النص', icon: 'fa-font' },
          { value: 'background-color', label: 'لون الخلفية', icon: 'fa-fill-drip' },
          { value: 'font-size', label: 'حجم الخط', icon: 'fa-text-height' },
          { value: 'border', label: 'الحدود', icon: 'fa-border-style' },
          { value: 'opacity', label: 'الشفافية', icon: 'fa-adjust' },
          { value: 'transform', label: 'التحويل', icon: 'fa-arrows-alt' }
        ]},
        { id: 'value', title: 'القيمة الجديدة', subtitle: 'أدخل قيمة CSS الجديدة', type: 'textInput', placeholder: 'مثال: #f59e0b أو 16px' },
        { id: 'preview', title: 'معاينة', subtitle: 'تأكد من الإعدادات', type: 'preview' }
      ]
    },
    /* ── Visibility ── */
    showElement: {
      label: '👁️ إظهار عنصر',
      description: 'إعادة إظهار العنصر المستهدف.',
      icon: 'fa-eye',
      group: 'visibility',
      actionType: 'show',
      defaults: { display: 'block' }
    },
    hideElement: {
      label: '🙈 إخفاء عنصر',
      description: 'إخفاء العنصر المستهدف عبر display.',
      icon: 'fa-eye-slash',
      group: 'visibility',
      actionType: 'hide',
      defaults: {}
    },
    toggleVisibility: {
      label: '🔄 Toggle',
      description: 'تبديل إظهار/إخفاء العنصر.',
      icon: 'fa-exchange-alt',
      group: 'visibility',
      actionType: 'toggleVisibility',
      defaults: {}
    },
    /* ── Classes ── */
    addClass: {
      label: '📦 إضافة Class',
      description: 'إضافة فئة CSS إلى العنصر.',
      icon: 'fa-plus-square',
      group: 'classes',
      actionType: 'addClass',
      defaults: { className: 'active' }
    },
    removeClass: {
      label: '🗑️ إزالة Class',
      description: 'إزالة فئة CSS من العنصر.',
      icon: 'fa-minus-square',
      group: 'classes',
      actionType: 'removeClass',
      defaults: { className: 'active' }
    },
    toggleClass: {
      label: '🔀 Toggle Class',
      description: 'إضافة الفئة أو إزالتها حسب حالتها.',
      icon: 'fa-toggle-on',
      group: 'classes',
      actionType: 'toggleClass',
      defaults: { className: 'active' }
    },
    /* ── Navigation ── */
    scrollTo: {
      label: '📜 Scroll إلى عنصر',
      description: 'تمرير الصفحة إلى عنصر محدد.',
      icon: 'fa-arrow-down',
      group: 'navigation',
      actionType: 'scrollTo',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { behavior: 'smooth', block: 'start' },
      steps: [
        { id: 'behavior', title: 'نمط التمرير', subtitle: 'كيف سيتم التمرير', type: 'radio', options: [
          { value: 'smooth', label: 'سلس (smooth)', icon: 'fa-water' },
          { value: 'instant', label: 'فوري (instant)', icon: 'fa-bolt' }
        ]},
        { id: 'block', title: 'موضع العنصر', subtitle: 'أين يظهر العنصر بعد التمرير', type: 'radio', options: [
          { value: 'start', label: 'في أعلى الشاشة', icon: 'fa-arrow-up' },
          { value: 'center', label: 'في وسط الشاشة', icon: 'fa-arrows-alt-v' },
          { value: 'end', label: 'في أسفل الشاشة', icon: 'fa-arrow-down' }
        ]}
      ]
    },
    /* ── Alerts/Utils ── */
    alertMessage: {
      label: '📢 Alert',
      description: 'عرض رسالة تنبيه للمستخدم.',
      icon: 'fa-bell',
      group: 'utilities',
      actionType: 'alertMessage',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { message: 'مرحباً!', alertType: 'alert' },
      steps: [
        { id: 'type', title: 'نوع التنبيه', subtitle: 'اختر نوع الرسالة', type: 'radio', options: [
          { value: 'alert', label: 'تنبيه (alert)', icon: 'fa-exclamation-circle' },
          { value: 'confirm', label: 'تأكيد (confirm)', icon: 'fa-question-circle' },
          { value: 'prompt', label: 'إدخال (prompt)', icon: 'fa-keyboard' }
        ]},
        { id: 'message', title: 'نص الرسالة', subtitle: 'اكتب الرسالة التي ستظهر', type: 'textInput', placeholder: 'مثال: مرحباً بك!' }
      ]
    },
    copyToClipboard: {
      label: '📋 نسخ إلى الحافظة',
      description: 'نسخ نص العنصر إلى الحافظة.',
      icon: 'fa-clipboard',
      group: 'utilities',
      actionType: 'copyToClipboard',
      defaults: {}
    },
    /* ── Storage ── */
    localStorageSave: {
      label: '💾 Local Storage حفظ',
      description: 'حفظ قيمة في التخزين المحلي.',
      icon: 'fa-database',
      group: 'storage',
      actionType: 'localStorageSave',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { key: '', valueSource: 'target', customValue: '' },
      steps: [
        { id: 'key', title: 'اسم المفتاح', subtitle: 'مفتاح التخزين', type: 'textInput', placeholder: 'مثال: username' },
        { id: 'value', title: 'مصدر القيمة', subtitle: 'من أين تأتي القيمة', type: 'radio', options: [
          { value: 'target', label: 'نص العنصر الهدف', icon: 'fa-crosshairs' },
          { value: 'source', label: 'قيمة العنصر المصدر', icon: 'fa-mouse-pointer' },
          { value: 'custom', label: 'قيمة مخصصة', icon: 'fa-pencil-alt' }
        ]},
        { id: 'customValue', title: 'القيمة المخصصة', subtitle: 'أدخل القيمة (فقط إذا اخترت قيمة مخصصة)', type: 'textInput', placeholder: 'مثال: قيمة ثابتة', condition: { field: 'valueSource', equals: 'custom' } }
      ]
    },
    localStorageGet: {
      label: '💾 Local Storage قراءة',
      description: 'قراءة قيمة من التخزين المحلي وعرضها.',
      icon: 'fa-download',
      group: 'storage',
      actionType: 'localStorageGet',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { key: '', fallback: '' },
      steps: [
        { id: 'key', title: 'اسم المفتاح', subtitle: 'مفتاح التخزين المراد قراءته', type: 'textInput', placeholder: 'مثال: username' },
        { id: 'fallback', title: 'القيمة الافتراضية', subtitle: 'القيمة التي تظهر إذا لم يوجد المفتاح', type: 'textInput', placeholder: 'مثال: زائر' }
      ]
    },
    cookieSet: {
      label: '🍪 Cookie حفظ',
      description: 'حفظ قيمة في الكوكيز.',
      icon: 'fa-cookie-bite',
      group: 'storage',
      actionType: 'cookieSet',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { key: '', value: '', days: '7' },
      steps: [
        { id: 'key', title: 'اسم الكوكي', subtitle: 'مفتاح الكوكي', type: 'textInput', placeholder: 'مثال: theme' },
        { id: 'value', title: 'القيمة', subtitle: 'القيمة المراد حفظها', type: 'textInput', placeholder: 'مثال: dark' },
        { id: 'days', title: 'مدة الحفظ (أيام)', subtitle: 'عدد الأيام قبل انتهاء الصلاحية', type: 'textInput', placeholder: '7' }
      ]
    },
    /* ── Network ── */
    fetchAPI: {
      label: '🌐 Fetch API',
      description: 'إرسال طلب HTTP وعرض النتيجة.',
      icon: 'fa-cloud-download-alt',
      group: 'network',
      actionType: 'fetchAPI',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { url: '', method: 'GET', displayResult: true },
      steps: [
        { id: 'url', title: 'رابط الـ API', subtitle: 'أدخل رابط URL للطلب', type: 'textInput', placeholder: 'https://api.example.com/data' },
        { id: 'method', title: 'نوع الطلب', subtitle: 'اختر HTTP Method', type: 'radio', options: [
          { value: 'GET', label: 'GET — جلب بيانات', icon: 'fa-download' },
          { value: 'POST', label: 'POST — إرسال بيانات', icon: 'fa-upload' }
        ]},
        { id: 'display', title: 'عرض النتيجة', subtitle: 'خيارات العرض', type: 'checkboxes', options: [
          { key: 'displayResult', label: 'عرض النتيجة في العنصر الهدف' }
        ]}
      ]
    },
    /* ── Timing ── */
    timerDelay: {
      label: '⏳ Timer تأخير',
      description: 'تنفيذ إجراء بعد فترة زمنية.',
      icon: 'fa-hourglass-half',
      group: 'timing',
      actionType: 'timerDelay',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { delay: '1000', action: 'hide' },
      steps: [
        { id: 'delay', title: 'مدة التأخير (مللي ثانية)', subtitle: '1000 = ثانية واحدة', type: 'textInput', placeholder: '1000' },
        { id: 'action', title: 'الإجراء بعد التأخير', subtitle: 'ماذا يحدث بعد انتهاء المدة', type: 'radio', options: [
          { value: 'hide', label: 'إخفاء العنصر', icon: 'fa-eye-slash' },
          { value: 'show', label: 'إظهار العنصر', icon: 'fa-eye' },
          { value: 'remove', label: 'حذف العنصر', icon: 'fa-trash-alt' },
          { value: 'addClass', label: 'إضافة Class', icon: 'fa-plus-square' },
          { value: 'text', label: 'تغيير النص', icon: 'fa-i-cursor' }
        ]},
        { id: 'actionValue', title: 'قيمة الإجراء', subtitle: 'اسم Class أو النص (حسب الإجراء)', type: 'textInput', placeholder: 'مثال: active أو تم!', condition: { field: 'action', notEquals: 'hide' } }
      ]
    },
    timerInterval: {
      label: '🔁 Loop تكرار',
      description: 'تكرار إجراء كل فترة زمنية.',
      icon: 'fa-redo',
      group: 'timing',
      actionType: 'timerInterval',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { interval: '1000', maxCount: '', action: 'text' },
      steps: [
        { id: 'interval', title: 'الفترة الزمنية (مللي ثانية)', subtitle: 'الفاصل بين كل تنفيذ', type: 'textInput', placeholder: '1000' },
        { id: 'count', title: 'عدد مرات التكرار', subtitle: 'اتركه فارغاً للتكرار بلا نهاية', type: 'textInput', placeholder: 'مثال: 10 أو اتركه فارغاً' },
        { id: 'action', title: 'الإجراء المتكرر', subtitle: 'ماذا يحدث في كل تكرار', type: 'radio', options: [
          { value: 'text', label: 'تحديث النص (عداد)', icon: 'fa-sort-numeric-up' },
          { value: 'toggleClass', label: 'تبديل Class', icon: 'fa-toggle-on' },
          { value: 'toggleVisibility', label: 'تبديل الظهور', icon: 'fa-exchange-alt' }
        ]}
      ]
    },
    /* ── Logic ── */
    ifCondition: {
      label: '✅ شرط If',
      description: 'تنفيذ إجراء بناءً على شرط.',
      icon: 'fa-code-branch',
      group: 'logic',
      actionType: 'ifCondition',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { conditionSource: 'sourceValue', operator: '===', compareValue: '', thenAction: 'text', thenValue: 'تم!', elseAction: 'none', elseValue: '' },
      steps: [
        { id: 'condition', title: 'مصدر الشرط', subtitle: 'ماذا نفحص', type: 'radio', options: [
          { value: 'sourceValue', label: 'قيمة العنصر المصدر', icon: 'fa-keyboard' },
          { value: 'targetText', label: 'نص العنصر الهدف', icon: 'fa-font' },
          { value: 'targetVisible', label: 'هل العنصر مرئي', icon: 'fa-eye' },
          { value: 'checked', label: 'هل checkbox محدد', icon: 'fa-check-square' }
        ]},
        { id: 'compare', title: 'المقارنة', subtitle: 'اختر عامل المقارنة والقيمة', type: 'conditionCompare' },
        { id: 'then', title: 'إذا تحقق الشرط (then)', subtitle: 'ماذا يحدث عند تحقق الشرط', type: 'radio', options: [
          { value: 'text', label: 'تغيير النص', icon: 'fa-i-cursor' },
          { value: 'show', label: 'إظهار العنصر', icon: 'fa-eye' },
          { value: 'hide', label: 'إخفاء العنصر', icon: 'fa-eye-slash' },
          { value: 'addClass', label: 'إضافة Class', icon: 'fa-plus-square' },
          { value: 'style', label: 'تغيير Style', icon: 'fa-palette' }
        ]},
        { id: 'thenValue', title: 'قيمة الإجراء', subtitle: 'النص أو الـ Class أو القيمة', type: 'textInput', placeholder: 'مثال: تم! أو active' }
      ]
    },
    /* ── Media ── */
    playAudio: {
      label: '🎵 تشغيل صوت',
      description: 'تشغيل ملف صوتي.',
      icon: 'fa-volume-up',
      group: 'media',
      actionType: 'playAudio',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { audioUrl: '', loop: false },
      steps: [
        { id: 'url', title: 'رابط الصوت', subtitle: 'أدخل رابط ملف الصوت', type: 'textInput', placeholder: 'https://example.com/sound.mp3' },
        { id: 'options', title: 'خيارات', subtitle: 'إعدادات التشغيل', type: 'checkboxes', options: [
          { key: 'loop', label: 'تكرار التشغيل' }
        ]}
      ]
    },
    playVideo: {
      label: '🎥 تشغيل فيديو',
      description: 'تشغيل أو إيقاف فيديو.',
      icon: 'fa-play-circle',
      group: 'media',
      actionType: 'playVideo',
      hasWizard: true,
      defaults: {},
      wizardDefaults: { videoAction: 'play' },
      steps: [
        { id: 'action', title: 'الإجراء', subtitle: 'ماذا تريد فعله بالفيديو', type: 'radio', options: [
          { value: 'play', label: 'تشغيل', icon: 'fa-play' },
          { value: 'pause', label: 'إيقاف مؤقت', icon: 'fa-pause' },
          { value: 'toggle', label: 'تبديل تشغيل/إيقاف', icon: 'fa-exchange-alt' },
          { value: 'restart', label: 'إعادة من البداية', icon: 'fa-undo' }
        ]}
      ]
    },
    /* ── Forms ── */
    submitForm: {
      label: '📤 إرسال Form',
      description: 'إرسال النموذج برمجياً.',
      icon: 'fa-paper-plane',
      group: 'forms',
      actionType: 'submitForm',
      defaults: {}
    },
    /* ── Custom Logic ── */
    custom: {
      label: '🔧 كود مخصص',
      description: 'كتابة JavaScript مخصص مع متغيرات جاهزة.',
      icon: 'fa-code',
      group: 'logic',
      actionType: 'custom',
      defaults: { code: 'targetElement.innerText = "تم الضغط";' }
    }
  };

  const ACTION_TYPES = {
    text: { label: 'غيّر نص العنصر', params: ['text'] },
    style: { label: 'غيّر Style', params: ['property', 'value'] },
    addClass: { label: 'أضف Class', params: ['className'] },
    removeClass: { label: 'احذف Class', params: ['className'] },
    toggleClass: { label: 'بدّل Class', params: ['className'] },
    show: { label: 'أظهر العنصر', params: ['display'] },
    hide: { label: 'أخفِ العنصر', params: [] },
    disable: { label: 'عطّل العنصر', params: [] },
    enable: { label: 'فعّل العنصر', params: [] },
    attribute: { label: 'غيّر Attribute', params: ['name', 'value'] },
    inputValue: { label: 'غيّر قيمة Input', params: ['value'] },
    remove: { label: 'احذف العنصر', params: [] },
    custom: { label: 'شغّل كود مخصص', params: ['code'] },
    
    // New action types
    transferText: { label: '📝 نقل النص', params: ['sourceElementId', 'targetElementId', 'transferMode', 'clearInput', 'skipEmpty', 'trimSpaces'] },
    addElement: { label: '➕ إضافة عنصر', params: ['tagName', 'content', 'insertPosition'] },
    changeImage: { label: '🖼️ تغيير الصورة', params: ['imageUrl', 'changeType'] },
    changeLink: { label: '🔗 تغيير الرابط', params: ['url', 'openInNewTab'] },
    toggleVisibility: { label: '🔄 Toggle الظهور', params: [] },
    scrollTo: { label: 'Scroll إلى عنصر', params: ['behavior', 'block'] },
    alertMessage: { label: '📢 Alert تنبيه', params: ['message', 'alertType'] },
    copyToClipboard: { label: '📋 نسخ إلى الحافظة', params: [] },
    localStorageSave: { label: '💾 حفظ في Local Storage', params: ['key', 'valueSource', 'customValue'] },
    localStorageGet: { label: '💾 قراءة من Local Storage', params: ['key', 'fallback'] },
    cookieSet: { label: '🍪 حفظ في Cookie', params: ['key', 'value', 'days'] },
    fetchAPI: { label: '🌐 Fetch API طلب', params: ['url', 'method', 'displayResult'] },
    timerDelay: { label: '⏳ مؤقت تأخير', params: ['delay', 'action', 'actionValue'] },
    timerInterval: { label: '🔁 مؤقت تكرار', params: ['interval', 'maxCount', 'action'] },
    ifCondition: { label: '✅ شرط If', params: ['conditionSource', 'operator', 'compareValue', 'thenAction', 'thenValue', 'elseAction', 'elseValue'] },
    playAudio: { label: '🎵 تشغيل صوت', params: ['audioUrl', 'loop'] },
    playVideo: { label: '🎥 تشغيل فيديو', params: ['videoAction'] },
    submitForm: { label: '📤 إرسال النموذج', params: [] }
  };

  const EVENT_TYPES = ['click', 'input', 'change', 'submit', 'mouseenter', 'mouseleave', 'focus', 'blur', 'keydown', 'load'];
  const CONDITION_OPERATORS = ['===', '!==', '>', '<', '>=', '<=', 'includes', 'containsClass', 'isEmpty', 'isChecked'];
  const TARGET_KINDS = ['source', 'target', 'eventTarget', 'parent', 'children', 'firstChild', 'lastChild', 'next', 'previous', 'closest', 'querySelector', 'element', 'document', 'window'];

  /* عدّاد + طابع زمني: 900k قيمة عشوائية وحدها كانت تسمح بتصادم يجعل
     findExpressionNodeById يعدّل العقدة الخطأ ويخلط بين الروابط. */
  let idSequence = 0;
  function makeId(prefix) {
    idSequence += 1;
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix || 'item'}-${random}${idSequence.toString(36)}${Date.now().toString(36).slice(-3)}`;
  }

  /* JSON.clone كان يُسقط الـ aliases غير القابلة للتعداد (variables/functionDef)،
     فتصبح cloned.variables خاصية ميتة منفصلة عن state → فقدان بيانات صامت. */
  function clone(value) {
    const copy = JSON.parse(JSON.stringify(value));
    if (value && typeof value === 'object' && !Array.isArray(value)
      && Object.prototype.hasOwnProperty.call(value, 'state')
      && Object.getOwnPropertyDescriptor(value, 'variables')
      && typeof Object.getOwnPropertyDescriptor(value, 'variables').get === 'function') {
      attachV2CompatibilityAliases(copy, (copy.functions && copy.functions[0]) || null);
    }
    return copy;
  }

  function text(value, fallback) {
    if (value === undefined || value === null) return fallback === undefined ? '' : String(fallback);
    return String(value);
  }

  function safeIdentifier(value, fallback) {
    let result = text(value, fallback || 'value').replace(/[^a-zA-Z0-9_$]/g, '_');
    if (!/^[a-zA-Z_$]/.test(result)) result = '_' + result;
    return result || fallback || 'value';
  }

  function safeLinkId(value, fallback) {
    const result = text(value, fallback || makeId('link')).replace(/[^a-zA-Z0-9_-]/g, '_');
    return result || fallback || makeId('link');
  }

  function commentValue(value) {
    return text(value).replace(/[\r\n\u2028\u2029]/g, ' ');
  }

  function jsString(value) {
    return JSON.stringify(text(value));
  }

  function indent(code, spaces) {
    const pad = ' '.repeat(spaces === undefined ? 2 : spaces);
    return text(code).split('\n').map(line => pad + line).join('\n');
  }

  function defaultTargetRef() {
    return { kind: 'target', id: '' };
  }

  function normalizeTargetRef(ref) {
    const value = ref && typeof ref === 'object' ? ref : { kind: ref || 'target' };
    const kind = TARGET_KINDS.indexOf(value.kind) >= 0 ? value.kind : 'target';
    return { kind, id: text(value.id), selector: text(value.selector), baseId: text(value.baseId) };
  }

  function normalizeAction(action, index) {
    const source = action && typeof action === 'object' ? action : {};
    const type = ACTION_TYPES[source.type] ? source.type : 'text';
    return {
      id: text(source.id, `action-${index + 1}`),
      type,
      target: normalizeTargetRef(source.target),
      params: source.params && typeof source.params === 'object' ? clone(source.params) : {}
    };
  }

  function normalizeCondition(condition, index) {
    const source = condition && typeof condition === 'object' ? condition : {};
    return {
      id: text(source.id, `condition-${index + 1}`),
      join: index === 0 ? 'AND' : (source.join === 'OR' ? 'OR' : 'AND'),
      left: text(source.left, 'targetElement.innerText'),
      operator: CONDITION_OPERATORS.indexOf(source.operator) >= 0 ? source.operator : '===',
      right: text(source.right, "'نص'")
    };
  }

  function normalizeVariable(variable, index) {
    const source = variable && typeof variable === 'object' ? variable : {};
    const type = ['let', 'const', 'boolean'].indexOf(source.type) >= 0 ? source.type : 'let';
    return {
      id: text(source.id, `variable-${index + 1}`),
      name: safeIdentifier(source.name, `value${index + 1}`),
      type,
      initialValue: text(source.initialValue, type === 'boolean' ? 'false' : '0'),
      scope: source.scope === 'inside' ? 'inside' : 'outside'
    };
  }

  function actionFromRecipe(recipeType, params) {
    const legacyRecipeMap = {
      text: 'changeText',
      style: 'changeCSS',
      show: 'showElement',
      hide: 'hideElement',
      remove: 'removeElement'
    };
    const activeKey = legacyRecipeMap[recipeType] || recipeType;
    const recipe = QUICK_RECIPES[activeKey] || QUICK_RECIPES.changeText || QUICK_RECIPES.custom;
    const recipeDefaults = recipe.defaults || recipe.wizardDefaults || {};
    const merged = Object.assign({}, clone(recipeDefaults), params && typeof params === 'object' ? clone(params) : {});
    return normalizeAction({
      id: 'action-1',
      type: recipe.actionType,
      target: defaultTargetRef(),
      params: merged
    }, 0);
  }

  function migrateLegacy(input) {
    const source = input || {};
    const legacyMode = source.mode || 'custom';
    const params = source.params || {};
    const modeMap = {
      text: 'text', style: 'style', toggleclass: 'toggleClass', custom: 'custom'
    };
    let recipeType = modeMap[legacyMode] || 'custom';
    let recipeParams = {};
    let variables = [];
    let builderMode = 'quick';
    let requiresManual = false;
    if (legacyMode === 'text') recipeParams = { text: params.text };
    else if (legacyMode === 'style') recipeParams = { property: params.prop, value: params.val };
    else if (legacyMode === 'toggleclass') recipeParams = { className: params.className };
    else if (legacyMode === 'custom') recipeParams = { code: text(params.logic, 'targetElement.innerText = "تم الضغط";') };
    else if (legacyMode === 'action') {
      const action = params.action;
      recipeType = ['show', 'hide'].indexOf(action) >= 0 ? action : (action === 'color' ? 'style' : 'custom');
      recipeParams = action === 'color'
        ? { property: 'color', value: '#f59e0b' }
        : (action === 'shake' ? { code: "targetElement.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 200 });" } : {});
    } else if (legacyMode === 'counter') {
      recipeParams = { code: `let count = Number(targetElement.dataset.count || 0);\ncount = count + ${parseInt(params.step, 10) || 1};\ntargetElement.dataset.count = count;\ntargetElement.innerText = count;` };
    } else if (legacyMode === 'if') {
      recipeParams = { code: `if (${params.left || 'true'} ${params.op || '==='} ${params.right || 'true'}) {\n${indent(params.then || '// ...', 2)}\n}` };
    } else if (legacyMode === 'storage') {
      const key = jsString(text(params.k, 'name').trim());
      if (params.op === 'get') recipeParams = { code: `targetElement.innerText = localStorage.getItem(${key}) || '';` };
      else if (params.op === 'remove') recipeParams = { code: `localStorage.removeItem(${key});` };
      else recipeParams = { code: `localStorage.setItem(${key}, ${text(params.valueExpr, "''").trim() || "''"});` };
    } else if (legacyMode === 'variable') {
      builderMode = 'advanced';
      recipeType = '';
      const name = safeIdentifier(params.name, 'myValue');
      variables = [normalizeVariable({
        id: 'variable-1',
        name,
        type: params.kind === 'const' ? 'const' : 'let',
        initialValue: text(params.value, '0'),
        scope: params.placement === 'handler' ? 'inside' : 'outside'
      }, 0)];
      recipeParams = { code: `targetElement.innerText = ${name};` };
    } else if (legacyMode === 'array') {
      requiresManual = true;
      recipeParams = { code: '// رابط مصفوفة قديم محفوظ في وضع الكود اليدوي حتى المرحلة C.' };
    } else {
      requiresManual = true;
      recipeParams = { code: '// هذا رابط قديم. الكود التنفيذي الأصلي محفوظ حتى يتم تحويله يدوياً.' };
    }
    const action = legacyMode === 'variable'
      ? normalizeAction({ id: 'action-1', type: 'custom', target: defaultTargetRef(), params: recipeParams }, 0)
      : actionFromRecipe(recipeType, recipeParams);
    return {
      schemaVersion: SCHEMA_VERSION,
      id: safeLinkId(source.id, makeId('link')),
      sourceId: text(source.sourceId),
      targetId: text(source.targetId, source.sourceId),
      builderMode,
      event: text(source.event, 'click'),
      recipeType,
      conditions: [],
      actions: [action],
      variables,
      customLogic: recipeType === 'custom' ? text(action.params.code) : '',
      settings: {
        migratedLegacy: true,
        legacyRequiresManual: requiresManual,
        manualCode: text(source.manualCode),
        legacyBinding: {
          sourceId: text(source.sourceId),
          targetId: text(source.targetId, source.sourceId),
          event: text(source.event, 'click')
        }
      }
    };
  }

  function createDefinition(sourceId, targetId, id) {
    return normalizeDefinition({
      schemaVersion: SCHEMA_VERSION,
      id: id || makeId('link'),
      sourceId,
      targetId: targetId || sourceId,
      builderMode: 'quick',
      event: 'click',
      recipeType: '',
      conditions: [],
      actions: [],
      variables: [],
      customLogic: '',
      settings: {}
    });
  }

  function normalizeDefinition(input) {
    if (!input || typeof input !== 'object') return createDefinition('', '', makeId('link'));
    if (!input.schemaVersion && (input.mode || input.params)) return migrateLegacy(input);

    const legacyRecipeMap = {
      text: 'changeText',
      style: 'changeCSS',
      show: 'showElement',
      hide: 'hideElement',
      remove: 'removeElement'
    };
    
    let inputRecipeType = input.recipeType;
    if (legacyRecipeMap[inputRecipeType]) {
      inputRecipeType = legacyRecipeMap[inputRecipeType];
    }

    const builderMode = input.builderMode === 'advanced' ? 'advanced' : 'quick';
    const recipeType = QUICK_RECIPES[inputRecipeType] ? inputRecipeType : '';
    let actions = Array.isArray(input.actions) ? input.actions.map(normalizeAction) : [];
    if (builderMode === 'quick' && recipeType && actions.length === 0) {
      let params = input.recipeParams;
      const recipe = QUICK_RECIPES[recipeType];
      if (recipe && recipe.hasWizard && (!input.settings || !input.settings.wizardConfig)) {
        const config = Object.assign({}, recipe.wizardDefaults);
        if (recipeType === 'changeCSS' && params) {
          config.property = params.property || params.prop || 'color';
          config.value = params.value || params.val || '#f59e0b';
        }
        if (!input.settings) input.settings = {};
        input.settings.wizardConfig = config;
        params = Object.assign({}, params, config);
      }
      actions = [actionFromRecipe(recipeType, params)];
    }

    return {
      schemaVersion: SCHEMA_VERSION,
      id: safeLinkId(input.id, makeId('link')),
      sourceId: text(input.sourceId),
      targetId: text(input.targetId, input.sourceId),
      builderMode,
      event: EVENT_TYPES.indexOf(input.event) >= 0 ? input.event : 'click',
      recipeType,
      conditions: Array.isArray(input.conditions) ? input.conditions.map(normalizeCondition) : [],
      actions,
      variables: Array.isArray(input.variables) ? input.variables.map(normalizeVariableV2) : (Array.isArray(input.state) ? input.state.map(normalizeVariableV2) : []),
      customLogic: text(input.customLogic),
      settings: input.settings && typeof input.settings === 'object' ? clone(input.settings) : {}
    };
  }

  function encodeMetadata(definition) {
    return encodeURIComponent(JSON.stringify(normalizeDefinition(definition)));
  }

  function decodeMetadata(raw) {
    try {
      return normalizeDefinition(JSON.parse(decodeURIComponent(text(raw))));
    } catch (error) {
      return null;
    }
  }

  function targetExpression(ref, definition) {
    const target = normalizeTargetRef(ref);
    if (target.kind === 'source') return 'sourceElement';
    if (target.kind === 'parent') return 'targetElement.parentElement';
    if (target.kind === 'firstChild') return 'targetElement.firstElementChild';
    if (target.kind === 'next') return 'targetElement.nextElementSibling';
    if (target.kind === 'previous') return 'targetElement.previousElementSibling';
    if (target.kind === 'element') return `document.getElementById(${jsString(target.id || definition.targetId)})`;
    if (target.kind === 'document') return 'document';
    if (target.kind === 'window') return 'window';
    return 'targetElement';
  }

  function generateCondition(condition) {
    const left = text(condition.left, 'targetElement.innerText').trim() || 'targetElement.innerText';
    const right = text(condition.right, "'نص'").trim() || "''";
    switch (condition.operator) {
      case 'includes': return `String(${left}).includes(${right})`;
      case 'containsClass': return `${left}.classList.contains(${right})`;
      case 'isEmpty': return `String(${left} ?? '').trim() === ''`;
      case 'isChecked': return `Boolean(${left}.checked)`;
      default: return `${left} ${condition.operator || '==='} ${right}`;
    }
  }

  function generateConditionExpression(conditions) {
    if (!conditions || conditions.length === 0) return '';
    return conditions.map((condition, index) => {
      const prefix = index === 0 ? '' : (condition.join === 'OR' ? ' || ' : ' && ');
      return prefix + `(${generateCondition(condition)})`;
    }).join('');
  }

  function generateActionStatement(action, targetName) {
    const params = action.params || {};
    switch (action.type) {
      case 'text': return `${targetName}.innerText = ${jsString(params.text)};`;
      case 'style': {
        const property = text(params.property, 'color').trim().replace(/[^a-zA-Z-]/g, '') || 'color';
        return `${targetName}.style[${jsString(property)}] = ${jsString(params.value)};`;
      }
      case 'addClass': return `${targetName}.classList.add(${jsString(text(params.className, 'active').trim())});`;
      case 'removeClass': return `${targetName}.classList.remove(${jsString(text(params.className, 'active').trim())});`;
      case 'toggleClass': return `${targetName}.classList.toggle(${jsString(text(params.className, 'active').trim())});`;
      case 'show': return `${targetName}.style.display = ${jsString(params.display || 'block')};`;
      case 'hide': return `${targetName}.style.display = 'none';`;
      case 'disable': return `${targetName}.disabled = true;`;
      case 'enable': return `${targetName}.disabled = false;`;
      case 'attribute': return `${targetName}.setAttribute(${jsString(params.name || 'data-state')}, ${jsString(params.value)});`;
      case 'inputValue': return `${targetName}.value = ${jsString(params.value)};`;
      case 'remove': return `${targetName}.remove();`;
      case 'custom': return text(params.code, '// اكتب الكود المخصص هنا');
      
      // New actions
      case 'transferText': {
        const srcId = params.sourceElementId || '';
        const mode = params.transferMode || 'replace';
        const clear = params.clearInput === true || params.clearInput === 'true';
        const skip = params.skipEmpty === true || params.skipEmpty === 'true';
        const trim = params.trimSpaces === true || params.trimSpaces === 'true';
        
        let srcExpr = srcId ? `document.getElementById(${jsString(srcId)})` : 'sourceElement';
        let valExpr = `${srcExpr}.value`;
        if (trim) valExpr = `${valExpr}.trim()`;
        
        let assignText = '';
        if (mode === 'append') {
          assignText = `${targetName}.textContent += ${valExpr};`;
        } else if (mode === 'prepend') {
          assignText = `${targetName}.textContent = ${valExpr} + ${targetName}.textContent;`;
        } else {
          assignText = `${targetName}.textContent = ${valExpr};`;
        }
        
        let body = '';
        if (skip) {
          body = `if (${srcExpr}.value.trim() !== '') {\n  ${assignText}\n}`;
        } else {
          body = `${assignText}`;
        }
        
        if (clear) {
          body += `\n${srcExpr}.value = '';`;
        }
        
        return `const sourceEl = ${srcExpr};\nif (sourceEl) {\n${indent(body, 2)}\n}`;
      }
      
      case 'addElement': {
        const tag = jsString(params.tagName || 'div');
        const content = jsString(params.content || '');
        const pos = jsString(params.insertPosition || 'beforeend');
        return `const newEl = document.createElement(${tag});\nnewEl.textContent = ${content};\n${targetName}.insertAdjacentElement(${pos}, newEl);`;
      }
      
      case 'changeImage': {
        const url = jsString(params.imageUrl || '');
        const type = params.changeType || 'src';
        if (type === 'background') {
          return `${targetName}.style.backgroundImage = 'url(' + ${url} + ')';`;
        } else {
          return `${targetName}.src = ${url};`;
        }
      }
      
      case 'changeLink': {
        const url = jsString(params.url || '');
        const newTab = params.openInNewTab === true || params.openInNewTab === 'true';
        let code = `${targetName}.href = ${url};`;
        if (newTab) {
          code += `\n${targetName}.target = '_blank';`;
        }
        return code;
      }
      
      case 'toggleVisibility': {
        return `if (${targetName}.style.display === 'none') {\n  ${targetName}.style.display = 'block';\n} else {\n  ${targetName}.style.display = 'none';\n}`;
      }
      
      case 'scrollTo': {
        const beh = jsString(params.behavior || 'smooth');
        const blk = jsString(params.block || 'start');
        return `${targetName}.scrollIntoView({ behavior: ${beh}, block: ${blk} });`;
      }
      
      case 'alertMessage': {
        const msg = jsString(params.message || '');
        const type = params.alertType || 'alert';
        if (type === 'confirm') {
          return `confirm(${msg});`;
        } else if (type === 'prompt') {
          return `prompt(${msg});`;
        } else {
          return `alert(${msg});`;
        }
      }
      
      case 'copyToClipboard': {
        return `const textToCopy = ${targetName}.textContent || ${targetName}.value || '';\nnavigator.clipboard.writeText(textToCopy);`;
      }
      
      case 'localStorageSave': {
        const key = jsString(params.key || 'key');
        const src = params.valueSource || 'target';
        const customVal = jsString(params.customValue || '');
        let valExpr = '';
        if (src === 'source') {
          valExpr = `(sourceElement.value || sourceElement.textContent || '')`;
        } else if (src === 'custom') {
          valExpr = customVal;
        } else {
          valExpr = `(${targetName}.textContent || ${targetName}.value || '')`;
        }
        return `localStorage.setItem(${key}, ${valExpr});`;
      }
      
      case 'localStorageGet': {
        const key = jsString(params.key || 'key');
        const fb = jsString(params.fallback || '');
        return `const val = localStorage.getItem(${key}) || ${fb};\nif (${targetName}.tagName === 'INPUT' || ${targetName}.tagName === 'TEXTAREA') {\n  ${targetName}.value = val;\n} else {\n  ${targetName}.textContent = val;\n}`;
      }
      
      case 'cookieSet': {
        const key = jsString(params.key || 'cookie');
        const val = jsString(params.value || '');
        const days = parseInt(params.days, 10) || 7;
        return `const d = new Date();\nd.setTime(d.getTime() + (${days}*24*60*60*1000));\ndocument.cookie = ${key} + '=' + ${val} + ';expires=' + d.toUTCString() + ';path=/';`;
      }
      
      case 'fetchAPI': {
        const url = jsString(params.url || '');
        const method = jsString(params.method || 'GET');
        const display = params.displayResult === true || params.displayResult === 'true';
        let code = `fetch(${url}, { method: ${method} })\n  .then(response => response.text())\n  .then(data => {\n`;
        if (display) {
          code += `    if (${targetName}.tagName === 'INPUT' || ${targetName}.tagName === 'TEXTAREA') {\n      ${targetName}.value = data;\n    } else {\n      ${targetName}.textContent = data;\n    }\n`;
        } else {
          code += `    console.log(data);\n`;
        }
        code += `  });`;
        return code;
      }
      
      case 'timerDelay': {
        const delay = parseInt(params.delay, 10) || 1000;
        const act = params.action || 'hide';
        const actVal = jsString(params.actionValue || '');
        let actionCode = '';
        if (act === 'show') {
          actionCode = `${targetName}.style.display = 'block';`;
        } else if (act === 'remove') {
          actionCode = `${targetName}.remove();`;
        } else if (act === 'addClass') {
          actionCode = `${targetName}.classList.add(${actVal});`;
        } else if (act === 'text') {
          actionCode = `${targetName}.textContent = ${actVal};`;
        } else {
          actionCode = `${targetName}.style.display = 'none';`;
        }
        return `setTimeout(() => {\n  ${actionCode}\n}, ${delay});`;
      }
      
      case 'timerInterval': {
        const interval = parseInt(params.interval, 10) || 1000;
        const max = params.maxCount ? parseInt(params.maxCount, 10) : 0;
        const act = params.action || 'text';
        let actCode = '';
        if (act === 'toggleClass') {
          actCode = `${targetName}.classList.toggle('active');`;
        } else if (act === 'toggleVisibility') {
          actCode = `if (${targetName}.style.display === 'none') { ${targetName}.style.display = 'block'; } else { ${targetName}.style.display = 'none'; }`;
        } else {
          actCode = `let count = Number(${targetName}.textContent || 0) + 1;\n${targetName}.textContent = count;`;
        }
        
        if (max > 0) {
          return `let runCount = 0;\nconst inst = setInterval(() => {\n  runCount++;\n  if (runCount >= ${max}) clearInterval(inst);\n  ${actCode}\n}, ${interval});`;
        } else {
          return `setInterval(() => {\n  ${actCode}\n}, ${interval});`;
        }
      }
      
      case 'ifCondition': {
        const src = params.conditionSource || 'sourceValue';
        const op = params.operator || '===';
        const comp = jsString(params.compareValue || '');
        const thenAct = params.thenAction || 'text';
        const thenVal = jsString(params.thenValue || '');
        
        let condExpr = '';
        if (src === 'targetText') {
          condExpr = `${targetName}.textContent ${op} ${comp}`;
        } else if (src === 'targetVisible') {
          condExpr = `${targetName}.style.display !== 'none'`;
        } else if (src === 'checked') {
          condExpr = `${targetName}.checked`;
        } else {
          condExpr = `sourceElement.value ${op} ${comp}`;
        }
        
        let thenCode = '';
        if (thenAct === 'show') {
          thenCode = `${targetName}.style.display = 'block';`;
        } else if (thenAct === 'hide') {
          thenCode = `${targetName}.style.display = 'none';`;
        } else if (thenAct === 'addClass') {
          thenCode = `${targetName}.classList.add(${thenVal});`;
        } else if (thenAct === 'style') {
          thenCode = `${targetName}.style.color = ${thenVal};`;
        } else {
          thenCode = `${targetName}.textContent = ${thenVal};`;
        }
        
        return `if (${condExpr}) {\n  ${thenCode}\n}`;
      }
      
      case 'playAudio': {
        const url = jsString(params.audioUrl || '');
        const lp = params.loop === true || params.loop === 'true';
        return `const audio = new Audio(${url});\naudio.loop = ${lp};\naudio.play();`;
      }
      
      case 'playVideo': {
        const act = params.videoAction || 'play';
        if (act === 'pause') {
          return `${targetName}.pause();`;
        } else if (act === 'toggle') {
          return `if (${targetName}.paused) { ${targetName}.play(); } else { ${targetName}.pause(); }`;
        } else if (act === 'restart') {
          return `${targetName}.currentTime = 0;\n${targetName}.play();`;
        } else {
          return `${targetName}.play();`;
        }
      }
      
      case 'submitForm': {
        return `${targetName}.submit();`;
      }
      
      default: return '// إجراء غير معروف';
    }
  }

  function generateActions(definition) {
    return definition.actions.map((action, index) => {
      const name = `actionTarget${index + 1}`;
      const expression = targetExpression(action.target, definition);
      let statement = generateActionStatement(action, name);
      if (action.type === 'custom') {
        // Custom Logic keeps the documented targetElement contract while each
        // Advanced action can still select an independent target.
        statement = `const targetElement = ${name};\nconst actionTarget = targetElement;\n${statement}`;
      }
      return `const ${name} = ${expression};\nif (${name}) {\n${indent(statement, 2)}\n}`;
    }).join('\n');
  }

  function variableDeclaration(variable) {
    const name = safeIdentifier(variable.name, 'value');
    const keyword = variable.type === 'const' ? 'const' : 'let';
    let value = text(variable.initialValue, variable.type === 'boolean' ? 'false' : '0').trim();
    if (variable.type === 'boolean' && value !== 'true' && value !== 'false') value = 'false';
    return `${keyword} ${name} = ${value || '0'};`;
  }

  function generateExecutable(input) {
    const definition = normalizeDefinition(input);
    if (definition.settings && text(definition.settings.manualCode).trim()) {
      return text(definition.settings.manualCode).trim();
    }

    const outsideVariables = definition.variables.filter(variable => variable.scope === 'outside');
    const insideVariables = definition.variables.filter(variable => variable.scope === 'inside');
    const condition = generateConditionExpression(definition.conditions);
    const actions = generateActions(definition) || '// لا توجد إجراءات بعد';
    let handlerBody = '';
    if (definition.event === 'submit') handlerBody += 'event.preventDefault();\n';
    if (insideVariables.length) handlerBody += insideVariables.map(variableDeclaration).join('\n') + '\n';
    handlerBody += condition ? `if (${condition}) {\n${indent(actions, 2)}\n}` : actions;

    const eventSource = definition.event === 'load' ? 'window' : 'sourceElement';
    let code = '(function () {\n';
    code += `  const sourceElement = document.getElementById(${jsString(definition.sourceId)});\n`;
    code += `  const targetElement = document.getElementById(${jsString(definition.targetId)});\n`;
    code += '  if (!sourceElement || !targetElement) { return; }\n';
    code += '  const state = Object.create(null);\n';
    if (outsideVariables.length) code += indent(outsideVariables.map(variableDeclaration).join('\n'), 2) + '\n';
    code += `  ${eventSource}.addEventListener(${jsString(definition.event)}, (event) => {\n`;
    code += indent(handlerBody, 4) + '\n';
    code += '  });\n';
    code += '})();';
    return code;
  }

  function generateBlock(input) {
    const definition = normalizeDefinition(input);
    const legacyModeMap = {
      text: 'text',
      changeText: 'text',
      style: 'style',
      changeCSS: 'style',
      toggleClass: 'toggleclass',
      custom: 'custom'
    };
    const legacyMode = definition.builderMode === 'quick'
      ? (legacyModeMap[definition.recipeType] || 'custom')
      : 'custom';
    const firstParams = definition.actions[0] ? definition.actions[0].params : {};
    let legacyParams = firstParams;
    if (definition.recipeType === 'style' || definition.recipeType === 'changeCSS') {
      legacyParams = { prop: firstParams.property, val: firstParams.value };
    }
    if (definition.recipeType === 'toggleClass') legacyParams = { className: firstParams.className };
    if (definition.recipeType === 'custom') legacyParams = { logic: firstParams.code || definition.customLogic || '' };
    const markerId = safeLinkId(definition.id, makeId('link'));
    return `// OSOOS_VISUAL_LINK_START id="${markerId}"\n` +
      `// OSOOS_LOGIC_DATA: ${encodeMetadata(definition)}\n` +
      `// SOURCE_ID: ${commentValue(definition.sourceId)}\n` +
      `// TARGET_ID: ${commentValue(definition.targetId)}\n` +
      `// EVENT: ${commentValue(definition.event)}\n` +
      `// MODE: ${legacyMode}\n` +
      `// PARAMS: ${encodeURIComponent(JSON.stringify(legacyParams))}\n` +
      generateExecutable(definition) + '\n' +
      `// OSOOS_VISUAL_LINK_END id="${markerId}"`;
  }

  function parseVisualLinks(customJS) {
    const lines = text(customJS).split(/\r?\n/);
    const links = [];
    let current = null;

    for (let index = 0; index < lines.length; index += 1) {
      const trimmed = lines[index].trim();
      if (!current && trimmed.indexOf('// OSOOS_VISUAL_LINK_START') === 0) {
        const match = trimmed.match(/id="([^"]+)"/);
        if (match) {
          current = {
            id: match[1], sourceId: '', targetId: '', event: 'click', mode: 'custom', params: {},
            startIndex: index, rawLines: [lines[index]], metadata: null, metadataSeen: false, headerOpen: true
          };
        }
        continue;
      }
      if (!current) continue;
      current.rawLines.push(lines[index]);
      if (current.headerOpen && !current.metadataSeen && trimmed.indexOf('// OSOOS_LOGIC_DATA:') === 0) {
        current.metadataSeen = true;
        current.metadata = decodeMetadata(trimmed.substring('// OSOOS_LOGIC_DATA:'.length).trim());
      } else if (current.headerOpen && trimmed.indexOf('// SOURCE_ID:') === 0) current.sourceId = trimmed.substring(13).trim();
      else if (current.headerOpen && trimmed.indexOf('// TARGET_ID:') === 0) current.targetId = trimmed.substring(13).trim();
      else if (current.headerOpen && trimmed.indexOf('// EVENT:') === 0) current.event = trimmed.substring(9).trim();
      else if (current.headerOpen && trimmed.indexOf('// MODE:') === 0) current.mode = trimmed.substring(8).trim();
      else if (current.headerOpen && trimmed.indexOf('// PARAMS:') === 0) {
        try { current.params = JSON.parse(decodeURIComponent(trimmed.substring(10).trim())); } catch (error) { current.params = {}; }
      } else if (trimmed.indexOf('// OSOOS_VISUAL_LINK_END') === 0) {
        const endMatch = trimmed.match(/id="([^"]+)"/);
        // Marker-looking comments inside Custom Logic must not truncate a
        // block. Only the matching explicit end marker closes this link.
        if (!endMatch || endMatch[1] !== current.id) continue;
        const matchingEnd = `// OSOOS_VISUAL_LINK_END id="${current.id}"`;
        const hasLaterMatchingEnd = lines.slice(index + 1).some(line => line.trim() === matchingEnd);
        if (hasLaterMatchingEnd) continue;
        current.endIndex = index;
        let definition;
        if (current.metadata) {
          definition = normalizeDefinition(current.metadata);
          definition.id = current.id;
        } else {
          const executable = current.rawLines.slice(1, -1)
            .filter(line => line.trim().indexOf('// SOURCE_ID:') !== 0)
            .filter(line => line.trim().indexOf('// TARGET_ID:') !== 0)
            .filter(line => line.trim().indexOf('// EVENT:') !== 0)
            .filter(line => line.trim().indexOf('// MODE:') !== 0)
            .filter(line => line.trim().indexOf('// PARAMS:') !== 0)
            .join('\n').trim();
          definition = migrateLegacy(Object.assign({}, current, { manualCode: executable }));
        }
        definition.startIndex = current.startIndex;
        definition.endIndex = current.endIndex;
        links.push(definition);
        current = null;
      } else if (current.headerOpen && trimmed !== '') {
        current.headerOpen = false;
      }
    }
    return links;
  }

  function validateDefinition(input) {
    const definition = normalizeDefinition(input);
    const errors = [];
    if (!definition.sourceId) errors.push('يجب اختيار Source.');
    if (!definition.targetId) errors.push('يجب اختيار Target.');
    if (definition.actions.length === 0 && !(definition.settings && text(definition.settings.manualCode).trim())) {
      errors.push('أضف إجراءً واحدًا على الأقل.');
    }
    try {
      // Syntax-only validation. Generated code does not execute here.
      new Function(generateBlock(definition));
    } catch (error) {
      errors.push(`خطأ في JavaScript: ${error.message}`);
    }
    return { valid: errors.length === 0, errors, definition };
  }

  /* ============================================================
     E1.1–E1.3 schemaVersion 3 engine (with v1/v2 migration)
     Trigger -> Reads -> Conditions -> Actions -> Targets -> State
     ============================================================ */

  function schemaEntry(label, category, fields, extra) {
    return Object.assign({ label, category, fields: fields || [] }, extra || {});
  }

  /* Structured values remain truthy for the legacy UI and allow the unified
     builder to render only the fields used by a selected read. */
  const E1_READ_TYPES = {
    sourceValue: schemaEntry('قيمة Source', 'source', [], { sourceKinds: ['source'], resultHint: 'inputValue' }),
    sourceTextContent: schemaEntry('textContent من Source', 'source', [], { sourceKinds: ['source'], resultHint: 'sourceText' }),
    sourceInnerText: schemaEntry('innerText من Source', 'source', [], { sourceKinds: ['source'], resultHint: 'sourceText' }),
    sourceInnerHTML: schemaEntry('innerHTML من Source', 'source', [], { sourceKinds: ['source'], resultHint: 'sourceHtml' }),
    inputValue: schemaEntry('قيمة Input آخر', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'inputValue' }),
    selectValue: schemaEntry('قيمة Select', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'selectedValue' }),
    textareaValue: schemaEntry('قيمة Textarea', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'textareaValue' }),
    checked: schemaEntry('حالة Checkbox', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'checkedValue' }),
    radioValue: schemaEntry('قيمة Radio المحدد', 'element', ['elementId', 'name'], { sourceKinds: ['element', 'document'], resultHint: 'radioValue' }),
    textContent: schemaEntry('نص عنصر', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'textValue' }),
    innerText: schemaEntry('innerText لعنصر', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'textValue' }),
    innerHTML: schemaEntry('HTML داخلي', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'htmlValue' }),
    attribute: schemaEntry('Attribute', 'element', ['elementId', 'attribute'], { sourceKinds: ['element'], resultHint: 'attributeValue' }),
    dataAttribute: schemaEntry('data attribute', 'element', ['elementId', 'key'], { sourceKinds: ['element'], resultHint: 'dataValue' }),
    hasClass: schemaEntry('هل Class موجودة؟', 'element', ['elementId', 'className'], { sourceKinds: ['element'], resultHint: 'hasClass' }),
    styleProperty: schemaEntry('خاصية Style', 'element', ['elementId', 'property'], { sourceKinds: ['element'], resultHint: 'styleValue' }),
    childCount: schemaEntry('عدد العناصر الأبناء', 'element', ['elementId'], { sourceKinds: ['element'], resultHint: 'childCount' }),
    eventTarget: schemaEntry('العنصر الحالي داخل Event', 'event', [], { sourceKinds: ['event'], resultHint: 'eventTarget' }),
    eventTargetValue: schemaEntry('قيمة العنصر الحالي داخل Event', 'event', [], { sourceKinds: ['event'], resultHint: 'eventValue' }),
    stateValue: schemaEntry('متغير من State', 'data', ['name'], { sourceKinds: ['state'], resultHint: 'stateValue' }),
    counterValue: schemaEntry('Counter', 'data', ['name'], { sourceKinds: ['state'], resultHint: 'counterValue' }),
    booleanValue: schemaEntry('Boolean', 'data', ['name'], { sourceKinds: ['state'], resultHint: 'booleanValue' }),
    arrayValue: schemaEntry('Array', 'data', ['name'], { sourceKinds: ['state'], resultHint: 'arrayValue' }),
    arrayItem: schemaEntry('عنصر من Array', 'data', ['name', 'index'], { sourceKinds: ['state'], resultHint: 'arrayItem' }),
    arrayLength: schemaEntry('طول Array', 'data', ['name'], { sourceKinds: ['state'], resultHint: 'arrayLength' }),
    objectProperty: schemaEntry('خاصية Object', 'data', ['name', 'property'], { sourceKinds: ['state'], resultHint: 'propertyValue' }),
    localStorage: schemaEntry('قيمة localStorage', 'data', ['key', 'fallback', 'json'], { sourceKinds: ['storage'], resultHint: 'storedValue' }),
    sessionStorage: schemaEntry('قيمة sessionStorage', 'data', ['key', 'fallback', 'json'], { sourceKinds: ['storage'], resultHint: 'sessionValue' }),
    functionResult: schemaEntry('نتيجة Function', 'data', ['functionName', 'arguments', 'await'], { sourceKinds: ['function'], resultHint: 'functionResult' }),
    browserUrl: schemaEntry('URL الحالي', 'browser', [], { sourceKinds: ['browser'], resultHint: 'currentUrl' }),
    queryParameter: schemaEntry('Query parameter', 'browser', ['key'], { sourceKinds: ['browser'], resultHint: 'queryValue' }),
    viewportWidth: schemaEntry('عرض الشاشة', 'browser', [], { sourceKinds: ['browser'], resultHint: 'viewportWidth' }),
    viewportHeight: schemaEntry('ارتفاع الشاشة', 'browser', [], { sourceKinds: ['browser'], resultHint: 'viewportHeight' }),
    scrollX: schemaEntry('موضع Scroll الأفقي', 'browser', [], { sourceKinds: ['browser'], resultHint: 'scrollX' }),
    scrollY: schemaEntry('موضع Scroll الرأسي', 'browser', [], { sourceKinds: ['browser'], resultHint: 'scrollY' }),
    currentTime: schemaEntry('الوقت الحالي', 'browser', ['locale'], { sourceKinds: ['browser'], resultHint: 'currentTime' }),
    currentDate: schemaEntry('التاريخ الحالي', 'browser', ['locale'], { sourceKinds: ['browser'], resultHint: 'currentDate' })
  };

  const E1_ACTION_TYPES = {
    setText: 'تغيير النص',
    setStyle: 'تغيير Style',
    addClass: 'إضافة Class',
    removeClass: 'إزالة Class',
    toggleClass: 'تبديل Class',
    show: 'إظهار عنصر',
    hide: 'إخفاء عنصر',
    toggleVisibility: 'فتح / إغلاق عنصر',
    clearInput: 'مسح حقل',
    setInputValue: 'تغيير قيمة Input',
    appendListItem: 'إضافة عنصر إلى قائمة',
    appendElement: 'إضافة عنصر HTML',
    removeElement: 'حذف عنصر',
    incrementVariable: 'زيادة متغير / Counter',
    decrementVariable: 'إنقاص متغير / Counter',
    toggleBoolean: 'تبديل Boolean',
    setInnerText: 'تغيير innerText', setHTML: 'تغيير innerHTML', appendText: 'إضافة نص', clearText: 'مسح النص', copyValue: 'نسخ قيمة بين عنصرين',
    setColor: 'تغيير لون النص', setBackground: 'تغيير الخلفية', setWidth: 'تغيير العرض', setHeight: 'تغيير الارتفاع', setOpacity: 'تغيير الشفافية', setTransform: 'تغيير transform', removeStyle: 'إزالة Style',
    toggleHidden: 'تبديل hidden', toggleDisplay: 'تبديل display', openElement: 'فتح عنصر', closeElement: 'إغلاق عنصر', disable: 'تعطيل عنصر', enable: 'تفعيل عنصر',
    createElement: 'إنشاء عنصر', insertBefore: 'إضافة قبل عنصر', insertAfter: 'إضافة بعد عنصر', prepend: 'إضافة في البداية', append: 'إضافة في النهاية', cloneElement: 'تكرار عنصر', clearElement: 'تفريغ عنصر', createCard: 'إنشاء Card من بيانات',
    setAttribute: 'تعيين Attribute', removeAttribute: 'إزالة Attribute', setHref: 'تغيير href', setSrc: 'تغيير src', setAlt: 'تغيير alt', setPlaceholder: 'تغيير placeholder', setDataAttribute: 'تغيير data attribute',
    setVariable: 'تغيير قيمة متغير', arrayPush: 'إضافة إلى Array', arrayRemove: 'حذف من Array', arraySet: 'تحديث عنصر Array',
    localStorageSet: 'حفظ localStorage', localStorageGet: 'قراءة localStorage وعرضها', localStorageRemove: 'حذف localStorage', sessionStorageSet: 'حفظ sessionStorage', sessionStorageGet: 'قراءة sessionStorage وعرضها', sessionStorageRemove: 'حذف sessionStorage',
    alert: 'عرض Alert', confirm: 'عرض Confirm', prompt: 'عرض Prompt', openUrl: 'فتح رابط', redirect: 'تغيير الصفحة', scrollTo: 'Scroll إلى عنصر', clipboard: 'نسخ إلى Clipboard', print: 'طباعة الصفحة',
    setTimeout: 'تنفيذ بعد مدة', setInterval: 'تنفيذ متكرر', clearInterval: 'إيقاف Interval', delayedAction: 'تأخير Action',
    callFunction: 'استدعاء Function',
    custom: 'تشغيل كود مخصص',
    setLinkText: 'تغيير نص الرابط',
    setTarget: 'تغيير target الرابط',
    setRel: 'تغيير rel الرابط',
    branch: 'شرط متفرع (Branch)',
    loop: 'تكرار (Loop)'
  };

  const E1_CONDITION_OPERATORS = {
    notEmpty: 'ليست فارغة',
    isEmpty: 'فارغة',
    '===': 'تساوي',
    '!==': 'لا تساوي',
    '>': 'أكبر من',
    '<': 'أصغر من',
    '>=': 'أكبر أو تساوي',
    '<=': 'أصغر أو تساوي',
    includes: 'تتضمن', notIncludes: 'لا تحتوي', startsWith: 'تبدأ بـ', endsWith: 'تنتهي بـ',
    lengthGreater: 'الطول أكبر من', lengthLess: 'الطول أقل من', regex: 'يطابق Regular Expression',
    hasClass: 'يحتوي Class', notHasClass: 'لا يحتوي Class', visible: 'ظاهر', hidden: 'مخفي', disabled: 'معطل', checked: 'محدد', focused: 'عليه Focus', hasChildren: 'يحتوي أبناء', hasAttribute: 'Attribute موجود',
    arrayIncludes: 'Array تحتوي قيمة', arrayNotIncludes: 'Array لا تحتوي قيمة', arrayEmpty: 'Array فارغة', arrayNotEmpty: 'Array ليست فارغة', arrayLengthEquals: 'طول Array يساوي', arraySome: 'يوجد عنصر يطابق شرطًا',
    isTrue: 'Boolean true', isFalse: 'Boolean false', storageHasKey: 'Storage يحتوي key', variableExists: 'المتغير موجود', isNull: 'القيمة null', isUndefined: 'القيمة undefined',
    isChecked: 'محددة'
  };

  const VARIABLE_SCOPES = ['outsideEvent', 'insideEvent', 'function'];
  const E1_VARIABLE_TYPES = {
    Number: schemaEntry('Number', 'number', [], { defaultValue: '0', scopes: VARIABLE_SCOPES }),
    Counter: schemaEntry('Counter', 'number', [], { defaultValue: '0', scopes: VARIABLE_SCOPES }),
    String: schemaEntry('String', 'text', [], { defaultValue: "''", scopes: VARIABLE_SCOPES }),
    Boolean: schemaEntry('Boolean', 'boolean', [], { defaultValue: 'false', scopes: VARIABLE_SCOPES }),
    Array: schemaEntry('Array', 'collection', [], { defaultValue: '[]', scopes: VARIABLE_SCOPES }),
    Object: schemaEntry('Object', 'collection', [], { defaultValue: '{}', scopes: VARIABLE_SCOPES }),
    Set: schemaEntry('Set', 'collection', [], { defaultValue: '[]', scopes: VARIABLE_SCOPES }),
    Date: schemaEntry('Date', 'date', [], { defaultValue: '', scopes: VARIABLE_SCOPES }),
    Storage: schemaEntry('Storage', 'storage', ['storageType', 'key', 'fallback', 'json'], { defaultValue: "''", scopes: VARIABLE_SCOPES })
  };
  const E1_RECIPE_TYPES = {
    inputText: { label: 'Input → Text', description: 'اقرأ حقلًا وحدّث نص عنصر.' },
    taskList: { label: 'Input → Add List Item', description: 'أضف قيمة الحقل إلى قائمة ثم امسح الحقل.' },
    hamburger: { label: 'Hamburger Toggle', description: 'افتح وأغلق القائمة بتبديل Class.' },
    openClose: { label: 'Open / Close Element', description: 'بدّل ظهور عنصر عند الضغط.' },
    counter: { label: 'Counter', description: 'زد أو أنقص رقمًا واعرضه.' }
  };

  const E1_EVENTS = ['click', 'input', 'change', 'submit', 'mouseenter', 'mouseleave', 'focus', 'blur', 'keydown', 'load',
    'dblclick', 'contextmenu', 'keyup', 'scroll', 'resize', 'dragstart', 'dragend', 'touchstart', 'touchend',
    'animationend', 'transitionend', 'custom'];

  const ACTION_SCHEMAS = {};
  Object.keys(E1_ACTION_TYPES).forEach(type => {
    let category = 'content';
    if (/Style|Color|Background|Width|Height|Opacity|Transform|Class/.test(type)) category = 'style';
    else if (/show|hide|toggle|openElement|closeElement|disable|enable/i.test(type)) category = 'visibility';
    else if (/Element|prepend|append|insert|clone|createCard/.test(type)) category = 'elements';
    else if (/Attribute|Href|Src|Alt|Placeholder/.test(type)) category = 'attributes';
    else if (/Variable|array|Storage/.test(type)) category = 'data';
    else if (/alert|confirm|prompt|openUrl|redirect|scrollTo|clipboard|print/.test(type)) category = 'browser';
    else if (/Timeout|Interval|delayed/.test(type)) category = 'timers';
    else if (type === 'callFunction') category = 'functions';
    else if (type === 'custom') category = 'custom';
    const targetless = /^(branch|loop|setVariable|arrayPush|arrayRemove|arraySet|(local|session)Storage(Set|Remove)|alert|confirm|prompt|openUrl|redirect|clipboard|print|setTimeout|setInterval|clearInterval|delayedAction|callFunction|custom)$/.test(type);
    ACTION_SCHEMAS[type] = schemaEntry(E1_ACTION_TYPES[type], category, [], { requiresTarget: !targetless });
  });
  const ACTION_FIELD_SCHEMAS = {
    setText: ['valueSource'], setInnerText: ['valueSource'], setHTML: ['valueSource'], appendText: ['valueSource'], clearText: [],
    copyValue: ['sourceId', 'property'], setInputValue: ['valueSource'], clearInput: [],
    setStyle: ['property', 'styleValue', 'valueSource'], setColor: ['valueSource'], setBackground: ['valueSource'], setWidth: ['valueSource'], setHeight: ['valueSource'], setOpacity: ['valueSource'], setTransform: ['valueSource'], removeStyle: ['property'],
    addClass: ['className'], removeClass: ['className'], toggleClass: ['className'], show: ['display'], hide: [], toggleVisibility: ['method', 'className'], toggleHidden: [], toggleDisplay: ['display'], openElement: [], closeElement: [], disable: [], enable: [],
    appendListItem: ['valueSource', 'arrayName'], appendElement: ['tagName', 'valueSource', 'html', 'className'], createElement: ['tagName', 'valueSource', 'html', 'className'], prepend: ['tagName', 'valueSource', 'html', 'className'], append: ['tagName', 'valueSource', 'html', 'className'], insertBefore: ['tagName', 'valueSource', 'html', 'className'], insertAfter: ['tagName', 'valueSource', 'html', 'className'], removeElement: [], cloneElement: ['deep'], clearElement: [], createCard: ['valueSource', 'html', 'className'],
    setAttribute: ['name', 'valueSource'], removeAttribute: ['name'], setHref: ['valueSource'], setSrc: ['valueSource'], setAlt: ['valueSource'], setPlaceholder: ['valueSource'], setDataAttribute: ['key', 'valueSource'],
    setVariable: ['variableName', 'valueSource'], incrementVariable: ['variableName', 'step', 'display'], decrementVariable: ['variableName', 'step', 'display'], toggleBoolean: ['variableName', 'className'], arrayPush: ['arrayName', 'valueSource'], arrayRemove: ['arrayName', 'index', 'count'], arraySet: ['arrayName', 'index', 'valueSource'],
    localStorageSet: ['key', 'valueSource', 'json'], localStorageGet: ['key', 'fallback', 'json', 'resultName'], localStorageRemove: ['key'], sessionStorageSet: ['key', 'valueSource', 'json'], sessionStorageGet: ['key', 'fallback', 'json', 'resultName'], sessionStorageRemove: ['key'],
    alert: ['valueSource'], confirm: ['valueSource', 'resultName'], prompt: ['valueSource', 'defaultValue', 'resultName'], openUrl: ['valueSource', 'target'], redirect: ['valueSource'], scrollTo: ['behavior', 'block'], clipboard: ['valueSource'], print: [],
    setTimeout: ['delay', 'body', 'resultName'], setInterval: ['delay', 'body', 'resultName'], clearInterval: ['timer'], delayedAction: ['delay', 'body'], callFunction: ['functionName', 'arguments', 'await', 'resultName'], custom: ['code'],
    setLinkText: ['valueSource'], setTarget: ['valueSource'], setRel: ['valueSource'],
    branch: [],
    loop: []
  };
  Object.keys(ACTION_FIELD_SCHEMAS).forEach(type => {
    if (ACTION_SCHEMAS[type]) ACTION_SCHEMAS[type].fields = ACTION_FIELD_SCHEMAS[type].slice();
  });
  const CONDITION_SCHEMAS = {};
  Object.keys(E1_CONDITION_OPERATORS).forEach(operator => {
    let category = 'comparison';
    if (/Empty|includes|starts|ends|length|regex/i.test(operator)) category = 'strings';
    if (/Class|visible|hidden|disabled|checked|focused|Children|Attribute/.test(operator)) category = 'elements';
    if (/^array/.test(operator)) category = 'arrays';
    if (/True|False|storage|variable|Null|Undefined/.test(operator)) category = 'data';
    CONDITION_SCHEMAS[operator] = schemaEntry(E1_CONDITION_OPERATORS[operator], category, operator === 'regex' ? ['pattern', 'flags'] : []);
  });

  /* E1.1–E1.3 advanced-tool registry. Descriptors are deliberately data-only so
     the UI can render categories and fields without knowing compiler details. */
  const ADVANCED_DESTINATIONS = ['reads', 'conditions', 'actions', 'state', 'functions'];
  const ADVANCED_TOOL_GROUPS = [
    { id: 'strings', label: 'النصوص Strings', description: 'قراءة النصوص وتحويلها والبحث داخلها.', order: 10 },
    { id: 'math', label: 'الحساب Math', description: 'إجراء العمليات الحسابية وتحويل الأرقام.', order: 20 },
    { id: 'arrays', label: 'المصفوفات Arrays', description: 'إنشاء المصفوفات وتعديلها وقراءة عناصرها وعرضها.', order: 30 },
    { id: 'browser', label: 'المتصفح Browser', description: 'استخدام رسائل المتصفح والروابط والتاريخ وأدوات الصفحة.', order: 40 },
    { id: 'storage', label: 'التخزين Storage', description: 'حفظ البيانات وقراءتها من التخزين المحلي أو المؤقت.', order: 50 },
    { id: 'objects', label: 'الكائنات Objects', description: 'إنشاء الكائنات وقراءة خصائصها وتحديثها.', order: 60 },
    { id: 'timers', label: 'الوقت Timers', description: 'تنفيذ خطوات بعد مدة أو بصورة متكررة.', order: 70 },
    { id: 'dom', label: 'العناصر DOM', description: 'التنقل بين علاقات العناصر والبحث داخلها.', order: 80 },
    { id: 'events', label: 'الأحداث المتقدمة Events', description: 'الاستماع لأحداث إضافية أو إطلاق حدث مخصص.', order: 90 },
    { id: 'functions', label: 'الدوال Functions', description: 'استدعاء دالة منظمة وتمرير Arguments وحفظ النتيجة.', order: 100 },
    { id: 'custom', label: 'كود مخصص Custom Code', description: 'تشغيل كود اختياري مع المتغيرات الآمنة المتاحة.', order: 110 }
  ];

  function advancedField(key, label, type, defaultValue, extra) {
    return Object.assign({ key, name: key, label, type, default: defaultValue }, extra || {});
  }

  const ADVANCED_TOOLS = {};
  const ADVANCED_TOOL_ALIASES = {};

  function registerAdvancedTool(toolId, category, label, description, config) {
    const options = config || {};
    const allowedDestinations = Array.isArray(options.allowedDestinations) && options.allowedDestinations.length
      ? options.allowedDestinations.filter(item => ADVANCED_DESTINATIONS.includes(item))
      : ADVANCED_DESTINATIONS.slice();
    const descriptor = {
      toolId,
      category,
      group: category,
      operation: text(options.operation, toolId.split('.').pop()),
      label,
      description,
      fields: Array.isArray(options.fields) ? options.fields : [],
      defaultDestination: ADVANCED_DESTINATIONS.includes(options.defaultDestination) ? options.defaultDestination : 'actions',
      allowedDestinations,
      destinations: allowedDestinations.slice(),
      producesResult: options.producesResult === true,
      defaultResultName: text(options.defaultResultName),
      legacyBlockIds: Array.isArray(options.legacyBlockIds) ? options.legacyBlockIds.slice() : []
    };
    ADVANCED_TOOLS[toolId] = descriptor;
    descriptor.legacyBlockIds.forEach(alias => { ADVANCED_TOOL_ALIASES[alias] = toolId; });
    return descriptor;
  }

  const stringValueField = () => advancedField('value', 'Value', 'expression', 'inputValue', { required: true });
  const mathValueField = () => advancedField('value', 'Value', 'expression', '0', { required: true });
  const arrayValueField = () => advancedField('array', 'Array', 'expression', 'items', { required: true });

  [
    ['string.length', 'Length', 'Return the number of characters.', 'textLength', ['strLength']],
    ['string.uppercase', 'Uppercase', 'Convert text to uppercase.', 'upperText', ['strUpper']],
    ['string.lowercase', 'Lowercase', 'Convert text to lowercase.', 'lowerText', ['strLower']],
    ['string.trim', 'Trim', 'Remove whitespace from both ends.', 'cleanText', ['strTrim']]
  ].forEach(item => registerAdvancedTool(item[0], 'strings', item[1], item[2], {
    fields: [stringValueField()], defaultDestination: 'reads', producesResult: true,
    defaultResultName: item[3], legacyBlockIds: item[4]
  }));
  [
    ['string.includes', 'Includes', 'Test whether text contains a value.', 'containsText', ['strIncludes']],
    ['string.startsWith', 'Starts with', 'Test the beginning of text.', 'startsWithText', []],
    ['string.endsWith', 'Ends with', 'Test the end of text.', 'endsWithText', []]
  ].forEach(item => registerAdvancedTool(item[0], 'strings', item[1], item[2], {
    fields: [stringValueField(), advancedField('search', 'Search text', 'text', '', { required: true })],
    defaultDestination: 'conditions', producesResult: true, defaultResultName: item[3], legacyBlockIds: item[4]
  }));
  registerAdvancedTool('string.replace', 'strings', 'Replace', 'Replace the first matching text.', {
    fields: [stringValueField(), advancedField('search', 'Search text', 'text', '', { required: true }), advancedField('replacement', 'Replacement', 'text', '')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'replacedText', legacyBlockIds: ['strReplace']
  });
  registerAdvancedTool('string.replaceAll', 'strings', 'Replace all', 'Replace every matching text.', {
    fields: [stringValueField(), advancedField('search', 'Search text', 'text', '', { required: true }), advancedField('replacement', 'Replacement', 'text', '')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'replacedText'
  });
  registerAdvancedTool('string.split', 'strings', 'Split', 'Split text into an array.', {
    fields: [stringValueField(), advancedField('separator', 'Separator', 'text', ' ')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'textParts', legacyBlockIds: ['strSplit']
  });
  ['slice', 'substring'].forEach(method => registerAdvancedTool(`string.${method}`, 'strings', method === 'slice' ? 'Slice' : 'Substring', `Read a section of text with ${method}().`, {
    fields: [stringValueField(), advancedField('start', 'Start', 'expression', '0'), advancedField('end', 'End', 'expression', '')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: `${method}Text`, legacyBlockIds: method === 'substring' ? ['strSubstring'] : []
  }));
  registerAdvancedTool('string.charAt', 'strings', 'Character at', 'Read one character by index.', {
    fields: [stringValueField(), advancedField('index', 'Index', 'expression', '0')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'character'
  });
  registerAdvancedTool('string.template', 'strings', 'Template string', 'Insert the value wherever {{value}} appears.', {
    fields: [stringValueField(), advancedField('template', 'Template', 'text', 'Value: {{value}}', { required: true })],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'formattedText'
  });

  [
    ['math.add', 'Add', '+', 'sum', ['sum']],
    ['math.subtract', 'Subtract', '-', 'difference', ['sub']],
    ['math.multiply', 'Multiply', '*', 'product', ['mult']],
    ['math.divide', 'Divide', '/', 'quotient', ['div']],
    ['math.modulo', 'Modulo', '%', 'remainder', []]
  ].forEach(item => registerAdvancedTool(item[0], 'math', item[1], `Calculate left ${item[2]} right.`, {
    fields: [advancedField('left', 'First value', 'expression', '0', { required: true }), advancedField('right', 'Second value', 'expression', '0', { required: true })],
    defaultDestination: 'reads', producesResult: true, defaultResultName: item[3], legacyBlockIds: item[4]
  }));
  [
    ['math.increment', 'Increment', 'incrementedValue'], ['math.decrement', 'Decrement', 'decrementedValue'],
    ['math.round', 'Math.round', 'roundedValue'], ['math.floor', 'Math.floor', 'flooredValue'],
    ['math.ceil', 'Math.ceil', 'ceiledValue'], ['math.number', 'Number', 'numberValue'],
    ['math.parseInt', 'parseInt', 'integerValue'], ['math.parseFloat', 'parseFloat', 'floatValue']
  ].forEach(item => registerAdvancedTool(item[0], 'math', item[1], `Calculate ${item[1]} for a value.`, {
    fields: [mathValueField()].concat(item[0] === 'math.parseInt' ? [advancedField('radix', 'Radix', 'expression', '10')] : []),
    defaultDestination: 'reads', producesResult: true, defaultResultName: item[2],
    legacyBlockIds: item[0] === 'math.round' ? ['round'] : (item[0] === 'math.floor' ? ['mathFloor'] : (item[0] === 'math.ceil' ? ['mathCeil'] : []))
  }));
  registerAdvancedTool('math.random', 'math', 'Math.random', 'Generate a random number from 0 up to 1.', {
    fields: [], defaultDestination: 'reads', producesResult: true, defaultResultName: 'randomValue', legacyBlockIds: ['random']
  });
  registerAdvancedTool('math.randomRange', 'math', 'Random range', 'Generate a whole number inside a range.', {
    fields: [advancedField('min', 'Minimum', 'expression', '0'), advancedField('max', 'Maximum', 'expression', '10')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'randomValue', legacyBlockIds: ['mathRandomRange']
  });
  registerAdvancedTool('math.pow', 'math', 'Math.pow', 'Raise a base number to an exponent.', {
    fields: [advancedField('base', 'Base', 'expression', '2'), advancedField('exponent', 'Exponent', 'expression', '2')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'powerValue', legacyBlockIds: ['mathPow']
  });
  registerAdvancedTool('math.sqrt', 'math', 'Math.sqrt', 'Calculate a square root.', {
    fields: [mathValueField()], defaultDestination: 'reads', producesResult: true, defaultResultName: 'rootValue', legacyBlockIds: ['mathSqrt']
  });
  registerAdvancedTool('math.clamp', 'math', 'Clamp', 'Keep a number between a minimum and maximum.', {
    fields: [mathValueField(), advancedField('min', 'Minimum', 'expression', '0'), advancedField('max', 'Maximum', 'expression', '100')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'clampedValue', legacyBlockIds: ['mathClamp']
  });
  ['min', 'max'].forEach(method => registerAdvancedTool(`math.${method}`, 'math', `Math.${method}`, `Return the ${method}imum of two values.`, {
    fields: [advancedField('left', 'First value', 'expression', '0'), advancedField('right', 'Second value', 'expression', '0')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: `${method}Value`, legacyBlockIds: [method === 'min' ? 'mathMin' : 'mathMax']
  }));

  registerAdvancedTool('array.create', 'arrays', 'Create array', 'Declare a new array.', {
    fields: [advancedField('declaration', 'Declaration', 'select', 'let', { options: ['let', 'const'] }), advancedField('values', 'Initial values', 'expression', '[]', { required: true })],
    defaultDestination: 'state', allowedDestinations: ['state', 'actions', 'functions'], producesResult: true, defaultResultName: 'items', legacyBlockIds: ['arrNew']
  });
  registerAdvancedTool('array.push', 'arrays', 'Push', 'Append a value to an array.', {
    fields: [arrayValueField(), advancedField('value', 'Value', 'expression', 'inputValue', { required: true })],
    defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['arrPush']
  });
  ['pop', 'shift'].forEach(method => registerAdvancedTool(`array.${method}`, 'arrays', method === 'pop' ? 'Pop' : 'Shift', `Remove and return the ${method === 'pop' ? 'last' : 'first'} item.`, {
    fields: [arrayValueField()], defaultDestination: 'actions', producesResult: true,
    defaultResultName: method === 'pop' ? 'removedItem' : 'shiftedItem', legacyBlockIds: method === 'pop' ? ['arrPop'] : []
  }));
  registerAdvancedTool('array.unshift', 'arrays', 'Unshift', 'Insert a value at the beginning.', {
    fields: [arrayValueField(), advancedField('value', 'Value', 'expression', 'inputValue', { required: true })], defaultDestination: 'actions', producesResult: false
  });
  registerAdvancedTool('array.splice', 'arrays', 'Splice', 'Remove or insert array items.', {
    fields: [arrayValueField(), advancedField('start', 'Start', 'expression', '0'), advancedField('deleteCount', 'Delete count', 'expression', '1'), advancedField('items', 'Items to insert', 'expressionList', '')],
    defaultDestination: 'actions', producesResult: true, defaultResultName: 'removedItems'
  });
  ['find', 'filter'].forEach(method => registerAdvancedTool(`array.${method}`, 'arrays', method === 'find' ? 'Find' : 'Filter', `${method === 'find' ? 'Find the first' : 'Keep'} item matching an expression.`, {
    fields: [arrayValueField(), advancedField('predicate', 'Predicate', 'expression', 'Boolean(item)', { required: true, variables: ['item', 'index'] })],
    defaultDestination: 'reads', producesResult: true, defaultResultName: method === 'find' ? 'foundItem' : 'filteredItems', legacyBlockIds: method === 'filter' ? ['arrFilter'] : []
  }));
  registerAdvancedTool('array.map', 'arrays', 'Map', 'Transform every array item.', {
    fields: [arrayValueField(), advancedField('transform', 'Transform', 'expression', 'item', { required: true, variables: ['item', 'index'] })],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'mappedItems', legacyBlockIds: ['arrMap']
  });
  registerAdvancedTool('array.forEach', 'arrays', 'For each', 'Run statements for every array item.', {
    fields: [arrayValueField(), advancedField('body', 'Statements', 'code', 'console.log(item);', { required: true, variables: ['item', 'index'] })],
    defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['arrForEach']
  });
  registerAdvancedTool('array.includes', 'arrays', 'Includes', 'Test whether an array contains a value.', {
    fields: [arrayValueField(), advancedField('value', 'Value', 'expression', 'inputValue', { required: true })],
    defaultDestination: 'conditions', producesResult: true, defaultResultName: 'containsItem', legacyBlockIds: ['arrIncludes']
  });
  registerAdvancedTool('array.indexOf', 'arrays', 'Index of', 'Find the index of a value.', {
    fields: [arrayValueField(), advancedField('value', 'Value', 'expression', 'inputValue', { required: true })],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'itemIndex'
  });
  registerAdvancedTool('array.concat', 'arrays', 'Concat', 'Combine two arrays without changing either one.', {
    fields: [arrayValueField(), advancedField('other', 'Other array', 'expression', '[]')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'combinedItems', legacyBlockIds: ['arrConcat']
  });
  registerAdvancedTool('array.join', 'arrays', 'Join', 'Join array items into text.', {
    fields: [arrayValueField(), advancedField('separator', 'Separator', 'text', ', ')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'joinedItems', legacyBlockIds: ['arrJoin']
  });
  registerAdvancedTool('array.length', 'arrays', 'Length', 'Read an array length.', {
    fields: [arrayValueField()], defaultDestination: 'reads', producesResult: true, defaultResultName: 'itemCount', legacyBlockIds: ['arrLength']
  });
  ['sort', 'reverse'].forEach(method => registerAdvancedTool(`array.${method}`, 'arrays', method === 'sort' ? 'Sort' : 'Reverse', `${method === 'sort' ? 'Sort' : 'Reverse'} an array in place.`, {
    fields: [arrayValueField()].concat(method === 'sort' ? [advancedField('compare', 'Compare expression', 'expression', 'String(a).localeCompare(String(b))', { variables: ['a', 'b'] })] : []),
    defaultDestination: 'actions', producesResult: false
  }));
  registerAdvancedTool('array.getIndex', 'arrays', 'Read index', 'Read an item by index.', {
    fields: [arrayValueField(), advancedField('index', 'Index', 'expression', '0')], defaultDestination: 'reads', producesResult: true, defaultResultName: 'arrayItem'
  });
  registerAdvancedTool('array.setIndex', 'arrays', 'Update index', 'Replace an item by index.', {
    fields: [arrayValueField(), advancedField('index', 'Index', 'expression', '0'), advancedField('value', 'Value', 'expression', 'inputValue')], defaultDestination: 'actions', producesResult: false
  });
  registerAdvancedTool('array.removeIndex', 'arrays', 'Remove index', 'Remove one item by index.', {
    fields: [arrayValueField(), advancedField('index', 'Index', 'expression', '0')], defaultDestination: 'actions', producesResult: true, defaultResultName: 'removedItems'
  });
  registerAdvancedTool('array.renderList', 'arrays', 'Render list', 'Render array items into an HTML list.', {
    fields: [arrayValueField(), advancedField('targetId', 'Target element id', 'element', '', { required: true }), advancedField('tagName', 'Item tag', 'select', 'li', { options: ['li', 'div', 'p', 'span'] }), advancedField('text', 'Item text expression', 'expression', 'item', { variables: ['item', 'index'] }), advancedField('clear', 'Clear target first', 'boolean', true)],
    defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['arrRender', 'renderList']
  });

  registerAdvancedTool('browser.alert', 'browser', 'Alert', 'Show an alert message.', {
    fields: [advancedField('message', 'Message', 'text', 'Hello!')], defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['alert', 'alertMessage']
  });
  registerAdvancedTool('browser.confirm', 'browser', 'Confirm', 'Ask a yes/no question.', {
    fields: [advancedField('message', 'Question', 'text', 'Continue?')], defaultDestination: 'actions', producesResult: true, defaultResultName: 'confirmed', legacyBlockIds: ['confirm']
  });
  registerAdvancedTool('browser.prompt', 'browser', 'Prompt', 'Ask the user for text.', {
    fields: [advancedField('message', 'Question', 'text', 'Enter a value:'), advancedField('defaultValue', 'Default value', 'text', '')], defaultDestination: 'actions', producesResult: true, defaultResultName: 'answer', legacyBlockIds: ['prompt']
  });
  registerAdvancedTool('browser.log', 'browser', 'Console log', 'Write a value to the browser console.', {
    fields: [advancedField('value', 'Value', 'expression', 'inputValue')], defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['consoleLog', 'log']
  });
  registerAdvancedTool('browser.open', 'browser', 'Open URL', 'Open a URL in a browser tab or window.', {
    fields: [advancedField('url', 'URL', 'text', 'https://example.com', { required: true }), advancedField('target', 'Target', 'select', '_blank', { options: ['_blank', '_self'] })], defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['open', 'openUrl']
  });
  registerAdvancedTool('browser.redirect', 'browser', 'Redirect', 'Navigate the current page; Try mode blocks this operation.', {
    fields: [advancedField('url', 'URL', 'text', 'https://example.com', { required: true })], defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['redirect']
  });
  registerAdvancedTool('browser.date', 'browser', 'Current date', 'Read the current local date.', {
    fields: [advancedField('locale', 'Locale', 'text', '')], defaultDestination: 'reads', producesResult: true, defaultResultName: 'currentDate', legacyBlockIds: ['currentDate']
  });
  registerAdvancedTool('browser.time', 'browser', 'Current time', 'Read the current local time.', {
    fields: [advancedField('locale', 'Locale', 'text', '')], defaultDestination: 'reads', producesResult: true, defaultResultName: 'currentTime', legacyBlockIds: ['currentTime']
  });
  registerAdvancedTool('browser.dateTime', 'browser', 'Current date and time', 'Read the current local date and time.', {
    fields: [advancedField('locale', 'Locale', 'text', '')], defaultDestination: 'reads', producesResult: true, defaultResultName: 'currentDateTime', legacyBlockIds: ['dateNow']
  });
  registerAdvancedTool('browser.clipboard', 'browser', 'Copy to clipboard', 'Copy a value with the Clipboard API.', {
    fields: [advancedField('value', 'Value', 'expression', 'inputValue')], defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['copyToClipboard']
  });
  registerAdvancedTool('browser.print', 'browser', 'Print', 'Open the browser print dialog.', {
    fields: [], defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['print']
  });

  ['local', 'session'].forEach(storageType => {
    const title = storageType === 'local' ? 'Local storage' : 'Session storage';
    registerAdvancedTool(`storage.${storageType}.set`, 'storage', `${title}: set`, 'Save a value by key.', {
      fields: [advancedField('key', 'Key', 'text', 'key', { required: true }), advancedField('value', 'Value', 'expression', 'inputValue'), advancedField('json', 'Store as JSON', 'boolean', false)],
      defaultDestination: 'actions', producesResult: false,
      legacyBlockIds: storageType === 'local' ? ['setStorage', 'localStorageSave'] : []
    });
    registerAdvancedTool(`storage.${storageType}.get`, 'storage', `${title}: get`, 'Read a value by key.', {
      fields: [advancedField('key', 'Key', 'text', 'key', { required: true }), advancedField('fallback', 'Fallback', 'expression', "''"), advancedField('json', 'Parse JSON', 'boolean', false)],
      defaultDestination: 'reads', producesResult: true, defaultResultName: storageType === 'local' ? 'storedValue' : 'sessionValue',
      legacyBlockIds: storageType === 'local' ? ['getStorage', 'localStorageGet'] : []
    });
    registerAdvancedTool(`storage.${storageType}.remove`, 'storage', `${title}: remove`, 'Remove a value by key.', {
      fields: [advancedField('key', 'Key', 'text', 'key', { required: true })], defaultDestination: 'actions', producesResult: false,
      legacyBlockIds: storageType === 'local' ? ['removeStorage'] : []
    });
  });

  const objectValueField = () => advancedField('object', 'Object', 'expression', 'data', { required: true });
  registerAdvancedTool('object.create', 'objects', 'Create object', 'إنشاء كائن جديد من JSON أو Expression.', {
    fields: [advancedField('declaration', 'Declaration', 'select', 'let', { options: ['let', 'const'] }), advancedField('value', 'Initial object', 'expression', '{}', { required: true })],
    defaultDestination: 'state', allowedDestinations: ['state', 'reads', 'actions', 'functions'], producesResult: true, defaultResultName: 'data', legacyBlockIds: ['objNew']
  });
  registerAdvancedTool('object.get', 'objects', 'Get property', 'قراءة خاصية من كائن بأمان.', {
    fields: [objectValueField(), advancedField('property', 'Property', 'text', 'key', { required: true }), advancedField('fallback', 'Fallback', 'expression', 'undefined')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'propertyValue'
  });
  registerAdvancedTool('object.set', 'objects', 'Set property', 'تحديث خاصية داخل كائن.', {
    fields: [objectValueField(), advancedField('property', 'Property', 'text', 'key', { required: true }), advancedField('value', 'Value', 'expression', 'inputValue')],
    defaultDestination: 'actions', producesResult: false
  });
  registerAdvancedTool('object.keys', 'objects', 'Object.keys', 'قراءة مفاتيح الكائن.', {
    fields: [objectValueField()], defaultDestination: 'reads', producesResult: true, defaultResultName: 'objectKeys', legacyBlockIds: ['objKeys']
  });
  registerAdvancedTool('object.values', 'objects', 'Object.values', 'قراءة قيم الكائن.', {
    fields: [objectValueField()], defaultDestination: 'reads', producesResult: true, defaultResultName: 'objectValues', legacyBlockIds: ['objValues']
  });
  registerAdvancedTool('object.has', 'objects', 'Has property', 'التحقق من وجود خاصية مملوكة للكائن.', {
    fields: [objectValueField(), advancedField('property', 'Property', 'text', 'key', { required: true })],
    defaultDestination: 'conditions', producesResult: true, defaultResultName: 'hasProperty', legacyBlockIds: ['objHasProp']
  });
  registerAdvancedTool('object.assign', 'objects', 'Object.assign', 'دمج كائنات في كائن جديد.', {
    fields: [objectValueField(), advancedField('other', 'Other object', 'expression', '{}')],
    defaultDestination: 'reads', producesResult: true, defaultResultName: 'mergedObject', legacyBlockIds: ['objAssign']
  });
  registerAdvancedTool('object.freeze', 'objects', 'Object.freeze', 'تجميد كائن لمنع تعديله.', {
    fields: [objectValueField()], defaultDestination: 'actions', producesResult: true, defaultResultName: 'frozenObject', legacyBlockIds: ['objFreeze']
  });

  const domStartField = () => advancedField('start', 'Start element', 'expression', 'sourceElement', { required: true });
  [
    ['dom.parent', 'Parent element', 'parentElement', 'parentElement'],
    ['dom.children', 'Children', 'children', 'childElements'],
    ['dom.firstChild', 'First child', 'firstElementChild', 'firstChild'],
    ['dom.lastChild', 'Last child', 'lastElementChild', 'lastChild'],
    ['dom.nextSibling', 'Next sibling', 'nextElementSibling', 'nextElement'],
    ['dom.previousSibling', 'Previous sibling', 'previousElementSibling', 'previousElement'],
    ['dom.childCount', 'Child count', 'childElementCount', 'childCount']
  ].forEach(item => registerAdvancedTool(item[0], 'dom', item[1], `قراءة ${item[2]} من العنصر المحدد.`, {
    fields: [domStartField()], defaultDestination: 'reads', producesResult: true, defaultResultName: item[3]
  }));
  registerAdvancedTool('dom.closest', 'dom', 'Closest', 'البحث عن أقرب أب يطابق Selector.', {
    fields: [domStartField(), advancedField('selector', 'Selector', 'text', '.card', { required: true })], defaultDestination: 'reads', producesResult: true, defaultResultName: 'closestElement'
  });
  registerAdvancedTool('dom.querySelector', 'dom', 'querySelector', 'البحث عن أول عنصر داخل العنصر المحدد.', {
    fields: [domStartField(), advancedField('selector', 'Selector', 'text', '.item', { required: true })], defaultDestination: 'reads', producesResult: true, defaultResultName: 'foundElement'
  });
  registerAdvancedTool('dom.querySelectorAll', 'dom', 'querySelectorAll', 'البحث عن جميع العناصر المطابقة داخل العنصر المحدد.', {
    fields: [domStartField(), advancedField('selector', 'Selector', 'text', '.item', { required: true })], defaultDestination: 'reads', producesResult: true, defaultResultName: 'foundElements'
  });

  registerAdvancedTool('timer.timeout', 'timers', 'setTimeout', 'تنفيذ كود مرة واحدة بعد مدة.', {
    fields: [advancedField('delay', 'Delay (ms)', 'expression', '1000'), advancedField('body', 'Code', 'code', '// code', { required: true })],
    defaultDestination: 'actions', producesResult: true, defaultResultName: 'timeoutId', legacyBlockIds: ['setTimeout']
  });
  registerAdvancedTool('timer.interval', 'timers', 'setInterval', 'تنفيذ كود بصورة متكررة.', {
    fields: [advancedField('delay', 'Interval (ms)', 'expression', '1000'), advancedField('body', 'Code', 'code', '// code', { required: true })],
    defaultDestination: 'actions', producesResult: true, defaultResultName: 'intervalId', legacyBlockIds: ['setInterval']
  });
  registerAdvancedTool('timer.clearInterval', 'timers', 'clearInterval', 'إيقاف Interval محفوظ.', {
    fields: [advancedField('timer', 'Interval id', 'expression', 'intervalId', { required: true })], defaultDestination: 'actions', producesResult: false, legacyBlockIds: ['clearInterval']
  });
  registerAdvancedTool('timer.delayAction', 'timers', 'Delayed action', 'تأخير خطوة مخصصة مع الاحتفاظ بسياق الحدث.', {
    fields: [advancedField('delay', 'Delay (ms)', 'expression', '500'), advancedField('body', 'Action code', 'code', 'actionTarget.textContent = inputValue;', { required: true })],
    defaultDestination: 'actions', producesResult: false
  });

  const advancedEventNames = ['dblclick', 'contextmenu', 'keyup', 'keydown', 'scroll', 'resize', 'dragstart', 'dragend', 'touchstart', 'touchend', 'animationend', 'transitionend'];
  advancedEventNames.forEach(eventName => registerAdvancedTool(`event.${eventName}`, 'events', eventName, `الاستماع إلى حدث ${eventName}.`, {
    fields: [advancedField('target', 'Event target', 'expression', eventName === 'resize' ? 'window' : 'sourceElement', { required: true }),
      advancedField('key', 'Keyboard key', 'text', '', { visibleWhen: { event: ['keydown', 'keyup'] } }),
      advancedField('preventDefault', 'Prevent default', 'boolean', eventName === 'contextmenu'), advancedField('once', 'Run once', 'boolean', false),
      advancedField('body', 'Event code', 'code', '// code', { required: true })],
    defaultDestination: 'actions', producesResult: false
  }));
  registerAdvancedTool('event.custom', 'events', 'Custom event listener', 'الاستماع إلى حدث مخصص بالاسم.', {
    fields: [advancedField('target', 'Event target', 'expression', 'sourceElement', { required: true }), advancedField('eventName', 'Event name', 'text', 'osoos:event', { required: true }), advancedField('body', 'Event code', 'code', '// code', { required: true })],
    defaultDestination: 'actions', producesResult: false
  });
  registerAdvancedTool('event.dispatch', 'events', 'Dispatch custom event', 'إطلاق CustomEvent مع بيانات اختيارية.', {
    fields: [advancedField('target', 'Event target', 'expression', 'sourceElement', { required: true }), advancedField('eventName', 'Event name', 'text', 'osoos:event', { required: true }), advancedField('detail', 'Detail', 'expression', '{}')],
    defaultDestination: 'actions', producesResult: false
  });

  registerAdvancedTool('function.call', 'functions', 'Call function', 'استدعاء Function وتمرير Arguments وحفظ النتيجة.', {
    fields: [advancedField('functionName', 'Function', 'text', 'myFunction', { required: true }), advancedField('arguments', 'Arguments', 'expressionList', ''), advancedField('await', 'Await async result', 'boolean', false)],
    defaultDestination: 'actions', producesResult: true, defaultResultName: 'functionResult'
  });
  registerAdvancedTool('function.return', 'functions', 'Return value', 'إرجاع قيمة من Function الحالية.', {
    fields: [advancedField('value', 'Return value', 'expression', 'undefined')], defaultDestination: 'functions', allowedDestinations: ['functions'], producesResult: false
  });
  registerAdvancedTool('custom.code', 'custom', 'Custom code', 'تشغيل كود مخصص مع sourceElement وevent وstate.', {
    fields: [advancedField('code', 'JavaScript code', 'code', '// custom code', { required: true })], defaultDestination: 'actions', producesResult: false
  });

  function registerAdvancedAlias(aliasId, canonicalId, label) {
    const canonical = ADVANCED_TOOLS[canonicalId];
    if (!canonical || ADVANCED_TOOLS[aliasId]) return;
    registerAdvancedTool(aliasId, canonical.category, label || canonical.label, canonical.description, {
      fields: canonical.fields.map(field => clone(field)), defaultDestination: canonical.defaultDestination,
      allowedDestinations: canonical.allowedDestinations.slice(), producesResult: canonical.producesResult,
      defaultResultName: canonical.defaultResultName, legacyBlockIds: []
    });
  }
  registerAdvancedAlias('dom.parentElement', 'dom.parent');
  registerAdvancedAlias('dom.firstElementChild', 'dom.firstChild');
  registerAdvancedAlias('dom.lastElementChild', 'dom.lastChild');
  registerAdvancedAlias('dom.nextElementSibling', 'dom.nextSibling');
  registerAdvancedAlias('dom.previousElementSibling', 'dom.previousSibling');
  registerAdvancedAlias('timer.setTimeout', 'timer.timeout');
  registerAdvancedAlias('timer.setInterval', 'timer.interval');
  registerAdvancedAlias('timer.delayedAction', 'timer.delayAction');
  registerAdvancedAlias('object.hasProperty', 'object.has');
  registerAdvancedTool('dom.findInParent', 'dom', 'Find inside parent', 'البحث عن عنصر مطابق داخل العنصر الأب.', {
    fields: [domStartField(), advancedField('selector', 'Selector', 'text', '.item', { required: true })], defaultDestination: 'reads', producesResult: true, defaultResultName: 'foundInParent'
  });

  function legacyNative(blockId, destination, nativeType) { return { blockId, kind: 'native', destination, nativeType }; }
  function legacyAdvanced(blockId, destination, toolId) { return { blockId, kind: 'advanced', destination, toolId }; }
  function legacyCustom(blockId, reason) { return { blockId, kind: 'legacyCustom', destination: 'legacyCustom', reason }; }

  /* Complete inventory of editor.blocksDb.  This map is intentionally
     independent from the legacy drawer: old blocks remain editable even when
     their creation card is hidden. */
  const LEGACY_BLOCK_MAPPINGS = {
    onclick: legacyNative('onclick', 'trigger', 'click'),
    onmouseenter: legacyNative('onmouseenter', 'trigger', 'mouseenter'),
    onmouseleave: legacyNative('onmouseleave', 'trigger', 'mouseleave'),
    oninput: legacyNative('oninput', 'trigger', 'input'),
    onchange: legacyNative('onchange', 'trigger', 'change'),
    onsubmit: legacyNative('onsubmit', 'trigger', 'submit'),
    onload: legacyNative('onload', 'trigger', 'load'),
    onkeydown: legacyNative('onkeydown', 'trigger', 'keydown'),
    setText: legacyNative('setText', 'actions', 'setInnerText'),
    setHTML: legacyNative('setHTML', 'actions', 'setHTML'),
    setStyle: legacyNative('setStyle', 'actions', 'setStyle'),
    addClass: legacyNative('addClass', 'actions', 'addClass'),
    removeClass: legacyNative('removeClass', 'actions', 'removeClass'),
    toggleClass: legacyNative('toggleClass', 'actions', 'toggleClass'),
    hide: legacyNative('hide', 'actions', 'hide'),
    show: legacyNative('show', 'actions', 'show'),
    playSound: legacyCustom('playSound', 'Audio playback keeps its original custom code and browser permissions.'),
    shake: legacyCustom('shake', 'Web Animations keyframes cannot be inferred losslessly.'),
    if: legacyNative('if', 'conditions', 'group'),
    'else-if': legacyNative('else-if', 'conditions', 'elseIfGroup'),
    else: legacyNative('else', 'conditions', 'elseGroup'),
    equals: legacyNative('equals', 'conditions', '==='),
    'not-equals': legacyNative('not-equals', 'conditions', '!=='),
    and: legacyNative('and', 'conditions', 'AND'),
    or: legacyNative('or', 'conditions', 'OR'),
    alert: legacyAdvanced('alert', 'actions', 'browser.alert'),
    confirm: legacyAdvanced('confirm', 'actions', 'browser.confirm'),
    prompt: legacyAdvanced('prompt', 'actions', 'browser.prompt'),
    log: legacyAdvanced('log', 'actions', 'browser.log'),
    redirect: legacyAdvanced('redirect', 'actions', 'browser.redirect'),
    open: legacyAdvanced('open', 'actions', 'browser.open'),
    setTimeout: legacyAdvanced('setTimeout', 'actions', 'timer.timeout'),
    setInterval: legacyAdvanced('setInterval', 'actions', 'timer.interval'),
    clearInterval: legacyAdvanced('clearInterval', 'actions', 'timer.clearInterval'),
    dateNow: legacyAdvanced('dateNow', 'reads', 'browser.dateTime'),
    setStorage: legacyAdvanced('setStorage', 'actions', 'storage.local.set'),
    getStorage: legacyAdvanced('getStorage', 'reads', 'storage.local.get'),
    removeStorage: legacyAdvanced('removeStorage', 'actions', 'storage.local.remove'),
    jsonString: legacyCustom('jsonString', 'JSON serialization remains preserved as legacy custom code.'),
    jsonParse: legacyCustom('jsonParse', 'JSON parsing remains preserved as legacy custom code.'),
    fetch: legacyCustom('fetch', 'Network requests require a dedicated future structured schema.'),
    let: legacyNative('let', 'state', 'Number'),
    const: legacyNative('const', 'state', 'Number'),
    increment: legacyNative('increment', 'actions', 'incrementVariable'),
    decrement: legacyNative('decrement', 'actions', 'decrementVariable'),
    sum: legacyAdvanced('sum', 'reads', 'math.add'),
    sub: legacyAdvanced('sub', 'reads', 'math.subtract'),
    mult: legacyAdvanced('mult', 'reads', 'math.multiply'),
    div: legacyAdvanced('div', 'reads', 'math.divide'),
    random: legacyAdvanced('random', 'reads', 'math.random'),
    round: legacyAdvanced('round', 'reads', 'math.round'),
    strLength: legacyAdvanced('strLength', 'reads', 'string.length'),
    strUpper: legacyAdvanced('strUpper', 'reads', 'string.uppercase'),
    strLower: legacyAdvanced('strLower', 'reads', 'string.lowercase'),
    strIncludes: legacyAdvanced('strIncludes', 'conditions', 'string.includes'),
    strReplace: legacyAdvanced('strReplace', 'reads', 'string.replace'),
    strSubstring: legacyAdvanced('strSubstring', 'reads', 'string.substring'),
    strTrim: legacyAdvanced('strTrim', 'reads', 'string.trim'),
    strSplit: legacyAdvanced('strSplit', 'reads', 'string.split'),
    arrNew: legacyAdvanced('arrNew', 'state', 'array.create'),
    arrPush: legacyAdvanced('arrPush', 'actions', 'array.push'),
    arrPop: legacyAdvanced('arrPop', 'actions', 'array.pop'),
    arrLength: legacyAdvanced('arrLength', 'reads', 'array.length'),
    arrForEach: legacyAdvanced('arrForEach', 'actions', 'array.forEach'),
    arrIncludes: legacyAdvanced('arrIncludes', 'conditions', 'array.includes'),
    arrFilter: legacyAdvanced('arrFilter', 'reads', 'array.filter'),
    arrMap: legacyAdvanced('arrMap', 'reads', 'array.map'),
    arrConcat: legacyAdvanced('arrConcat', 'reads', 'array.concat'),
    arrJoin: legacyAdvanced('arrJoin', 'reads', 'array.join'),
    objNew: legacyAdvanced('objNew', 'state', 'object.create'),
    objKeys: legacyAdvanced('objKeys', 'reads', 'object.keys'),
    objValues: legacyAdvanced('objValues', 'reads', 'object.values'),
    objHasProp: legacyAdvanced('objHasProp', 'conditions', 'object.has'),
    objAssign: legacyAdvanced('objAssign', 'reads', 'object.assign'),
    objFreeze: legacyAdvanced('objFreeze', 'actions', 'object.freeze'),
    mathRandomRange: legacyAdvanced('mathRandomRange', 'reads', 'math.randomRange'),
    mathCeil: legacyAdvanced('mathCeil', 'reads', 'math.ceil'),
    mathFloor: legacyAdvanced('mathFloor', 'reads', 'math.floor'),
    mathPow: legacyAdvanced('mathPow', 'reads', 'math.pow'),
    mathSqrt: legacyAdvanced('mathSqrt', 'reads', 'math.sqrt'),
    mathMax: legacyAdvanced('mathMax', 'reads', 'math.max'),
    mathMin: legacyAdvanced('mathMin', 'reads', 'math.min'),
    mathClamp: legacyAdvanced('mathClamp', 'reads', 'math.clamp'),
    valEmail: legacyNative('valEmail', 'conditions', 'regex'),
    valEmpty: legacyNative('valEmpty', 'conditions', 'isEmpty'),
    valDisable: legacyNative('valDisable', 'actions', 'disable'),
    valEnable: legacyNative('valEnable', 'actions', 'enable'),
    valReset: legacyCustom('valReset', 'Form reset remains preserved because it can affect multiple fields.'),
    valFocus: legacyCustom('valFocus', 'Focus side effects remain preserved as legacy custom code.'),
    valChecked: legacyNative('valChecked', 'reads', 'checked'),
    valRadio: legacyNative('valRadio', 'reads', 'radioValue'),
    cssPos: legacyNative('cssPos', 'actions', 'setStyle'),
    cssOpacity: legacyNative('cssOpacity', 'actions', 'setOpacity'),
    cssTransition: legacyNative('cssTransition', 'actions', 'setStyle'),
    cssBgImage: legacyNative('cssBgImage', 'actions', 'setBackground'),
    cssShadow: legacyNative('cssShadow', 'actions', 'setStyle'),
    domWidth: legacyCustom('domWidth', 'offsetWidth is retained as a legacy computed-layout read.'),
    domHeight: legacyCustom('domHeight', 'offsetHeight is retained as a legacy computed-layout read.'),
    domScrollInto: legacyNative('domScrollInto', 'actions', 'scrollTo'),
    domScrollToTop: legacyCustom('domScrollToTop', 'Window scrolling keeps its original custom options.'),
    domMousePos: legacyCustom('domMousePos', 'Pointer coordinates depend on the original event scope.')
  };

  function getLegacyBlockMapping(blockId) {
    return LEGACY_BLOCK_MAPPINGS[text(blockId)] || null;
  }

  const ADVANCED_ARABIC_DESCRIPTIONS = {
    'string.length': 'يعيد عدد أحرف النص.',
    'string.uppercase': 'يحوّل النص إلى أحرف إنجليزية كبيرة.',
    'string.lowercase': 'يحوّل النص إلى أحرف إنجليزية صغيرة.',
    'string.trim': 'يزيل المسافات الزائدة من بداية النص ونهايته.',
    'string.includes': 'يتحقق هل يحتوي النص على كلمة أو جزء محدد.',
    'string.startsWith': 'يتحقق هل يبدأ النص بقيمة محددة.',
    'string.endsWith': 'يتحقق هل ينتهي النص بقيمة محددة.',
    'string.replace': 'يستبدل أول جزء مطابق داخل النص.',
    'string.replaceAll': 'يستبدل كل الأجزاء المطابقة داخل النص.',
    'string.split': 'يقسّم النص إلى مصفوفة باستخدام فاصل.',
    'string.slice': 'يقتطع جزءًا من النص بين موضعين.',
    'string.substring': 'يقرأ جزءًا من النص بين موضعين.',
    'string.charAt': 'يعيد حرفًا واحدًا حسب موضعه.',
    'string.template': 'ينشئ نصًا من قالب ويضع القيمة داخله.',
    'math.add': 'يجمع رقمين ويحفظ الناتج.',
    'math.subtract': 'يطرح الرقم الثاني من الأول.',
    'math.multiply': 'يضرب رقمين ويحفظ الناتج.',
    'math.divide': 'يقسم الرقم الأول على الثاني.',
    'math.modulo': 'يعيد باقي قسمة رقمين.',
    'math.increment': 'يزيد القيمة الرقمية بمقدار واحد.',
    'math.decrement': 'ينقص القيمة الرقمية بمقدار واحد.',
    'math.round': 'يقرّب الرقم إلى أقرب عدد صحيح.',
    'math.floor': 'يقرّب الرقم إلى الأسفل.',
    'math.ceil': 'يقرّب الرقم إلى الأعلى.',
    'math.random': 'ينشئ رقمًا عشوائيًا بين صفر وواحد.',
    'math.randomRange': 'ينشئ عددًا صحيحًا عشوائيًا داخل نطاق.',
    'math.min': 'يعيد أصغر قيمة بين رقمين.',
    'math.max': 'يعيد أكبر قيمة بين رقمين.',
    'math.number': 'يحوّل القيمة إلى رقم.',
    'math.parseInt': 'يحوّل القيمة إلى عدد صحيح.',
    'math.parseFloat': 'يحوّل القيمة إلى رقم عشري.',
    'math.pow': 'يرفع رقمًا إلى قوة محددة.',
    'math.sqrt': 'يحسب الجذر التربيعي لرقم.',
    'math.clamp': 'يحصر الرقم بين حد أدنى وحد أعلى.',
    'array.create': 'ينشئ مصفوفة جديدة بقيم ابتدائية اختيارية.',
    'array.push': 'يضيف قيمة إلى نهاية المصفوفة.',
    'array.pop': 'يحذف آخر عنصر من المصفوفة ويعيده.',
    'array.shift': 'يحذف أول عنصر من المصفوفة ويعيده.',
    'array.unshift': 'يضيف قيمة إلى بداية المصفوفة.',
    'array.splice': 'يحذف أو يضيف عناصر ابتداءً من موضع محدد.',
    'array.find': 'يعثر على أول عنصر يطابق شرطًا.',
    'array.filter': 'ينشئ مصفوفة بالعناصر التي تطابق شرطًا.',
    'array.map': 'ينشئ مصفوفة بعد تحويل كل عنصر.',
    'array.forEach': 'ينفذ تعليمات على كل عنصر في المصفوفة.',
    'array.includes': 'يتحقق هل تحتوي المصفوفة على قيمة.',
    'array.indexOf': 'يعيد موضع قيمة داخل المصفوفة.',
    'array.concat': 'يدمج مصفوفتين دون تعديلهما.',
    'array.join': 'يحوّل عناصر المصفوفة إلى نص بفاصل.',
    'array.length': 'يعيد عدد عناصر المصفوفة.',
    'array.sort': 'يرتب عناصر المصفوفة حسب تعبير مقارنة.',
    'array.reverse': 'يعكس ترتيب عناصر المصفوفة.',
    'array.getIndex': 'يقرأ عنصرًا من المصفوفة حسب موضعه.',
    'array.setIndex': 'يغيّر عنصرًا داخل المصفوفة حسب موضعه.',
    'array.removeIndex': 'يحذف عنصرًا من المصفوفة حسب موضعه.',
    'array.renderList': 'يعرض عناصر المصفوفة داخل قائمة HTML.',
    'browser.alert': 'يعرض رسالة تنبيه للزائر.',
    'browser.confirm': 'يعرض سؤال تأكيد ويحفظ إجابة نعم أو لا.',
    'browser.prompt': 'يطلب نصًا من الزائر ويحفظ الإجابة.',
    'browser.log': 'يطبع قيمة في Console للمساعدة في الفحص.',
    'browser.open': 'يفتح رابطًا في تبويب أو نافذة.',
    'browser.redirect': 'ينقل الصفحة الحالية إلى رابط جديد.',
    'browser.date': 'يقرأ التاريخ الحالي بصيغة محلية.',
    'browser.time': 'يقرأ الوقت الحالي بصيغة محلية.',
    'browser.dateTime': 'يقرأ التاريخ والوقت الحاليين معًا.',
    'browser.clipboard': 'ينسخ قيمة إلى حافظة الجهاز.',
    'browser.print': 'يفتح نافذة طباعة الصفحة.',
    'storage.local.set': 'يحفظ قيمة في التخزين المحلي باسم مفتاح.',
    'storage.local.get': 'يقرأ قيمة من التخزين المحلي.',
    'storage.local.remove': 'يحذف قيمة من التخزين المحلي.',
    'storage.session.set': 'يحفظ قيمة مؤقتًا خلال جلسة التصفح.',
    'storage.session.get': 'يقرأ قيمة من تخزين جلسة التصفح.',
    'storage.session.remove': 'يحذف قيمة من تخزين جلسة التصفح.'
  };
  const ADVANCED_ARABIC_FALLBACKS = {
    strings: 'ينفذ عملية منظمة على قيمة نصية.',
    math: 'ينفذ عملية حسابية منظمة.',
    arrays: 'ينفذ عملية منظمة على مصفوفة.',
    browser: 'ينفذ أداة آمنة من أدوات المتصفح.',
    storage: 'ينفذ عملية منظمة على تخزين المتصفح.',
    objects: 'ينفذ عملية منظمة على كائن وخصائصه.',
    timers: 'يشغّل عملية مؤقتة أو متكررة بطريقة منظمة.',
    dom: 'يتنقل بين عناصر الصفحة أو يبحث داخل عنصر.',
    events: 'يضيف مستمعًا لحدث متقدم أو يطلق حدثًا مخصصًا.',
    functions: 'يستدعي دالة ويمرر القيم ويحفظ النتيجة.',
    custom: 'يشغّل كود JavaScript مخصصًا داخل سياق التفاعل.'
  };
  Object.keys(ADVANCED_TOOLS).forEach(toolId => {
    const descriptor = ADVANCED_TOOLS[toolId];
    descriptor.descriptionEn = descriptor.description;
    descriptor.description = ADVANCED_ARABIC_DESCRIPTIONS[toolId] || ADVANCED_ARABIC_FALLBACKS[descriptor.category];
  });

  function resolveAdvancedToolId(toolId) {
    const requested = text(toolId).trim();
    if (ADVANCED_TOOLS[requested]) return requested;
    if (ADVANCED_TOOL_ALIASES[requested]) return ADVANCED_TOOL_ALIASES[requested];
    const dotted = requested.replace(/^strings\./, 'string.').replace(/^arrays\./, 'array.');
    return ADVANCED_TOOLS[dotted] ? dotted : requested;
  }

  function normalizeAdvancedFieldValue(field, value) {
    let next = value;
    if (next && typeof next === 'object' && !Array.isArray(next) && Object.prototype.hasOwnProperty.call(next, 'value')) next = next.value;
    if (next === undefined) next = clone(field.default);
    if (field.type === 'boolean') return next === true || next === 'true' || next === 1 || next === '1';
    if (field.type === 'select' && Array.isArray(field.options) && !field.options.includes(next)) return field.default;
    return text(next, field.default);
  }

  function normalizeAdvancedOperation(operation, index) {
    const source = operation && typeof operation === 'object' ? operation : {};
    const toolId = resolveAdvancedToolId(source.toolId || source.type || source.blockId);
    const descriptor = ADVANCED_TOOLS[toolId] || null;
    const suppliedSettings = Object.assign(
      {},
      source.inputs && typeof source.inputs === 'object' ? source.inputs : {},
      source.settings && typeof source.settings === 'object' ? source.settings : {}
    );
    const settings = clone(suppliedSettings);
    if (descriptor) descriptor.fields.forEach(field => { settings[field.key] = normalizeAdvancedFieldValue(field, suppliedSettings[field.key]); });
    const requestedDestination = text(source.destination);
    const destination = ADVANCED_DESTINATIONS.includes(requestedDestination)
      ? requestedDestination
      : (descriptor ? descriptor.defaultDestination : 'actions');
    const fallbackResult = descriptor && descriptor.producesResult ? descriptor.defaultResultName : '';
    const requestedResult = source.resultName !== undefined ? source.resultName : source.outputName;
    const resultName = text(requestedResult, fallbackResult).trim();
    const numericOrder = Number(source.order);
    return {
      id: safeLinkId(source.id, `advanced-${Number(index || 0) + 1}`),
      toolId,
      category: descriptor ? descriptor.category : text(source.category, 'custom'),
      destination,
      settings,
      resultName: resultName ? safeIdentifier(resultName, fallbackResult || 'result') : '',
      order: Number.isFinite(numericOrder) ? numericOrder : Number(index || 0),
      enabled: source.enabled !== false
    };
  }

  function createAdvancedOperation(toolId, overrides) {
    const descriptor = ADVANCED_TOOLS[resolveAdvancedToolId(toolId)];
    const source = Object.assign({}, overrides && typeof overrides === 'object' ? overrides : {}, { toolId: resolveAdvancedToolId(toolId) });
    if (!source.id) source.id = makeId('advanced');
    if (source.destination === undefined && descriptor) source.destination = descriptor.defaultDestination;
    return normalizeAdvancedOperation(source, Number(source.order) || 0);
  }

  function normalizeFunctionV3(functionDef, index) {
    const source = functionDef && typeof functionDef === 'object' ? functionDef : {};
    const rawParameters = Array.isArray(source.parameters) ? source.parameters : (Array.isArray(source.params) ? source.params : text(source.parameters || source.params).split(',').map(item => item.trim()).filter(Boolean));
    const parameters = rawParameters.map((parameter, parameterIndex) => {
      if (parameter && typeof parameter === 'object') {
        return {
          name: safeIdentifier(parameter.name, `arg${parameterIndex + 1}`),
          defaultValue: text(parameter.defaultValue !== undefined ? parameter.defaultValue : parameter.default)
        };
      }
      const pieces = text(parameter).split('=');
      return { name: safeIdentifier(pieces.shift(), `arg${parameterIndex + 1}`), defaultValue: pieces.join('=').trim() };
    });
    let type = text(source.type || source.kind, source.async ? 'async' : 'normal');
    if (!['normal', 'arrow', 'async'].includes(type)) type = 'normal';
    const functionSettings = source.settings && typeof source.settings === 'object' ? clone(source.settings) : {};
    const functionName = safeIdentifier(source.name, 'myFunction');
    if (text(source.name) && text(source.name) !== functionName) functionSettings.originalName = text(source.name);
    else delete functionSettings.originalName;
    return {
      id: safeLinkId(source.id, `function-${Number(index || 0) + 1}`),
      name: functionName,
      type,
      parameters,
      actions: Array.isArray(source.actions) ? source.actions.map((action, actionIndex) => normalizeActionV2(action, actionIndex, '')) : [],
      conditions: Array.isArray(source.conditions) ? source.conditions.map(normalizeConditionV2) : [],
      returnValue: text(source.returnValue),
      customCode: text(source.customCode),
      enabled: source.enabled !== false,
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : Number(index || 0),
      settings: functionSettings
    };
  }

  function createFunction(overrides, index) {
    return normalizeFunctionV3(Object.assign({ name: 'myFunction', type: 'normal', parameters: [], actions: [], conditions: [] }, overrides || {}), index || 0);
  }

  function attachV2CompatibilityAliases(definition, fallbackFunction) {
    const fallback = normalizeFunctionV3(fallbackFunction, 0);
    Object.defineProperty(definition, 'variables', {
      enumerable: false,
      configurable: true,
      get() { return this.state; },
      set(value) { this.state = Array.isArray(value) ? value.map(normalizeVariableV2) : []; }
    });
    Object.defineProperty(definition, 'functionDef', {
      enumerable: false,
      configurable: true,
      get() { return this.functions[0] || fallback; },
      set(value) {
        const normalized = normalizeFunctionV3(value, 0);
        if (this.functions.length) this.functions[0] = normalized;
        else this.functions.push(normalized);
      }
    });
    return definition;
  }

  function normalizeReadV2(read, index) {
    const source = read && typeof read === 'object' ? read : {};
    const aliases = { sourceText: 'sourceTextContent', html: 'innerHTML', data: 'dataAttribute', class: 'hasClass', style: 'styleProperty', eventValue: 'eventTargetValue', variable: 'stateValue', url: 'browserUrl', query: 'queryParameter', time: 'currentTime', date: 'currentDate' };
    const requestedType = aliases[source.type] || source.type;
    const type = E1_READ_TYPES[requestedType] ? requestedType : (requestedType || 'inputValue');
    const descriptor = E1_READ_TYPES[type] || E1_READ_TYPES.inputValue;
    const settings = Object.assign({}, source.settings && typeof source.settings === 'object' ? clone(source.settings) : {});
    ['attribute', 'key', 'className', 'property', 'name', 'index', 'fallback', 'json', 'functionName', 'arguments', 'await', 'locale', 'trim'].forEach(key => {
      if (source[key] !== undefined && settings[key] === undefined) settings[key] = clone(source[key]);
    });
    const elementId = text(source.elementId || (source.source && source.source.elementId));
    const readSource = source.source && typeof source.source === 'object'
      ? clone(source.source)
      : { kind: descriptor.category === 'source' ? 'source' : (descriptor.category === 'element' ? 'element' : descriptor.category), elementId };
    if (readSource.elementId === undefined && elementId) readSource.elementId = elementId;
    const numericOrder = Number(source.order);
    const normalizedName = safeIdentifier(source.name, descriptor.resultHint || 'inputValue');
    /* لزوجة originalName كانت تقفل الحفظ للأبد: نضبطه على الحالة الراهنة فقط */
    if (text(source.name) && text(source.name) !== normalizedName) settings.originalName = text(source.name);
    else delete settings.originalName;
    return {
      id: text(source.id, `read-${index + 1}`),
      type,
      elementId,
      source: readSource,
      name: normalizedName,
      settings,
      order: Number.isFinite(numericOrder) ? numericOrder : Number(index || 0),
      enabled: source.enabled !== false
    };
  }

  function normalizeConditionV2(condition, index) {
    const source = condition && typeof condition === 'object' ? condition : {};
    const oldMap = { isEmpty: 'isEmpty', isChecked: 'checked', containsClass: 'hasClass' };
    const requested = oldMap[source.operator] || source.operator;
    const settings = Object.assign({}, source.settings && typeof source.settings === 'object' ? clone(source.settings) : {});
    ['pattern', 'flags', 'className', 'attribute', 'key', 'predicate', 'storageType'].forEach(key => {
      if (source[key] !== undefined && settings[key] === undefined) settings[key] = clone(source[key]);
    });
    const numericOrder = Number(source.order);
    const left = source.left && typeof source.left === 'object' ? clone(source.left) : text(source.left, 'inputValue');
    const right = source.right && typeof source.right === 'object' ? clone(source.right) : text(source.right);
    let rightType = source.rightType;
    if (source.right && typeof source.right === 'object') {
      rightType = source.right.valueType || source.right.sourceType || source.rightType;
    }
    if (!rightType) rightType = 'literal';

    const isVisualExpression = source.isVisualExpression === true || source.isVisualExpression === 'true';

    return {
      id: text(source.id, `condition-${index + 1}`),
      join: index === 0 ? 'AND' : (source.join === 'OR' ? 'OR' : 'AND'),
      /* Visual Expression conditions keep the whole AST in `left`; normalizing it
         here preserves Expression Node IDs across save/reopen (metadata roundtrip). */
      left: isVisualExpression ? normalizeExpressionV2(left) : left,
      operator: requested || 'notEmpty',
      right,
      rightType,
      isVisualExpression,
      groupId: text(source.groupId || (source.group && source.group.id)),
      groupJoin: source.groupJoin === 'OR' || (source.group && source.group.join === 'OR') ? 'OR' : 'AND',
      settings,
      order: Number.isFinite(numericOrder) ? numericOrder : Number(index || 0),
      enabled: source.enabled !== false
    };
  }

  function mapOldActionTypeV2(type) {
    const map = {
      text: 'setText', style: 'setStyle', addClass: 'addClass', removeClass: 'removeClass',
      toggleClass: 'toggleClass', show: 'show', hide: 'hide', disable: 'disable', enable: 'enable',
      attribute: 'setAttribute', inputValue: 'setInputValue', remove: 'removeElement', custom: 'custom',
      innerHTML: 'setHTML', innerText: 'setInnerText', localStorageSave: 'localStorageSet',
      localStorageGet: 'localStorageGet', scroll: 'scrollTo', open: 'openUrl'
    };
    return map[type] || type;
  }

  function normalizeActionV2(action, index, defaultTargetId) {
    const source = action && typeof action === 'object' ? action : {};
    const requestedType = mapOldActionTypeV2(source.type);
    const type = requestedType || 'setText';
    const params = Object.assign({}, source.params && typeof source.params === 'object' ? clone(source.params) : {}, source.settings && typeof source.settings === 'object' ? clone(source.settings) : {});
    let targetId = text(source.targetId);
    const target = source.target && typeof source.target === 'object' ? normalizeTargetRef(source.target) : null;
    if (!targetId && target && target.kind === 'element') targetId = target.id;
    if (!targetId && (!target || target.kind === 'target')) targetId = text(defaultTargetId);
    let value = source.value !== undefined ? source.value : undefined;
    if (value === undefined) {
      if (type === 'setText') value = params.text;
      else if (type === 'setInputValue') value = params.value;
      else if (type === 'custom') value = params.code;
      else value = params.value;
    }
    let valueSource;
    if (source.valueSource && typeof source.valueSource === 'object') valueSource = clone(source.valueSource);
    else if (typeof source.valueSource === 'string' && source.valueSource) valueSource = { kind: source.valueSource, value: text(value) };
    else valueSource = { kind: source.valueType === 'literal' ? 'literal' : 'expression', value: text(value), inferred: true };
    const numericOrder = Number(source.order);
    const resultAction = {
      id: text(source.id, `action-${index + 1}`),
      type,
      targetId,
      target: target || { kind: targetId ? 'element' : 'target', id: targetId },
      value: text(value),
      valueType: source.valueType === 'literal' ? 'literal' : 'expression',
      valueSource,
      params,
      settings: clone(params),
      order: Number.isFinite(numericOrder) ? numericOrder : Number(index || 0),
      enabled: source.enabled !== false
    };
    if (type === 'branch') {
      resultAction.branches = Array.isArray(source.branches) ? source.branches.map((br, brIdx) => {
        return {
          id: text(br.id, `branch-case-${brIdx + 1}`),
          branchType: ['if', 'elseIf', 'else'].includes(br.branchType) ? br.branchType : 'if',
          condition: br.condition ? {
            conditions: Array.isArray(br.condition.conditions) ? br.condition.conditions.map(normalizeConditionV2) : [],
            conditionGroups: Array.isArray(br.condition.conditionGroups) ? br.condition.conditionGroups.map((g, gIdx) => ({
              id: safeLinkId(g && g.id, `condition-group-${gIdx + 1}`),
              join: g && g.join === 'OR' ? 'OR' : 'AND',
              order: Number.isFinite(Number(g && g.order)) ? Number(g.order) : gIdx,
              enabled: !g || g.enabled !== false
            })) : []
          } : { conditions: [], conditionGroups: [] },
          actions: Array.isArray(br.actions) ? br.actions.map((act, actIdx) => normalizeActionV2(act, actIdx, defaultTargetId)) : []
        };
      }) : [];
    }
    if (type === 'loop') {
      resultAction.loopType = ['forEach', 'repeat', 'while'].includes(source.loopType) ? source.loopType : 'forEach';
      
      if (source.source && typeof source.source === 'object') {
        resultAction.source = {
          sourceType: text(source.source.sourceType || source.source.kind, 'state'),
          variableName: text(source.source.variableName || source.source.value || ''),
          selector: text(source.source.selector || ''),
          value: text(source.source.value || '')
        };
      } else {
        resultAction.source = { sourceType: 'state', variableName: '', selector: '', value: '' };
      }
      
      const vars = source.variables || {};
      resultAction.variables = {
        itemName: text(vars.itemName, 'item'),
        indexName: text(vars.indexName, 'index'),
        collectionName: text(vars.collectionName, '')
      };
      
      if (source.count && typeof source.count === 'object') {
        resultAction.count = {
          sourceType: text(source.count.sourceType || source.count.kind, 'literal'),
          dataType: text(source.count.dataType, 'number'),
          value: text(source.count.value, '0')
        };
      } else {
        resultAction.count = { sourceType: 'literal', dataType: 'number', value: text(source.count, '0') };
      }
      
      if (source.startAt && typeof source.startAt === 'object') {
        resultAction.startAt = {
          sourceType: text(source.startAt.sourceType || source.startAt.kind, 'literal'),
          dataType: text(source.startAt.dataType, 'number'),
          value: text(source.startAt.value, '0')
        };
      } else {
        resultAction.startAt = { sourceType: 'literal', dataType: 'number', value: text(source.startAt, '0') };
      }
      
      resultAction.condition = source.condition ? {
        conditions: Array.isArray(source.condition.conditions) ? source.condition.conditions.map(normalizeConditionV2) : [],
        conditionGroups: Array.isArray(source.condition.conditionGroups) ? source.condition.conditionGroups.map((g, gIdx) => ({
          id: safeLinkId(g && g.id, `condition-group-${gIdx + 1}`),
          join: g && g.join === 'OR' ? 'OR' : 'AND',
          order: Number.isFinite(Number(g && g.order)) ? Number(g.order) : gIdx,
          enabled: !g || g.enabled !== false
        })) : []
      } : { conditions: [], conditionGroups: [] };
      
      const safety = source.safety || {};
      resultAction.safety = {
        maxIterations: Number.isFinite(Number(safety.maxIterations)) ? Number(safety.maxIterations) : 1000
      };
      
      resultAction.actions = Array.isArray(source.actions) ? source.actions.map((act, actIdx) => normalizeActionV2(act, actIdx, defaultTargetId)) : [];
    }
    return resultAction;
  }

  function normalizeVariableV2(variable, index) {
    const source = variable && typeof variable === 'object' ? variable : {};
    let type = source.type;
    if (type === 'counter' || type === 'let' || type === 'const') type = 'Counter';
    if (type === 'boolean') type = 'Boolean';
    if (type === 'array') type = 'Array';
    if (type === 'number') type = 'Number';
    if (type === 'string') type = 'String';
    if (type === 'object') type = 'Object';
    if (type === 'set') type = 'Set';
    if (type === 'date') type = 'Date';
    if (type === 'storage' || type === 'localStorage' || type === 'sessionStorage') type = 'Storage';
    if (!E1_VARIABLE_TYPES[type]) type = 'Counter';
    let initialValue = text(source.initialValue, source.value);
    const descriptor = E1_VARIABLE_TYPES[type] || E1_VARIABLE_TYPES.Counter;
    if (!initialValue) initialValue = descriptor.defaultValue;
    let scope = text(source.scope || source.declarationScope, 'outsideEvent');
    const scopeAliases = { page: 'outsideEvent', global: 'outsideEvent', interaction: 'insideEvent', event: 'insideEvent', insideFunction: 'function' };
    scope = scopeAliases[scope] || scope;
    if (!VARIABLE_SCOPES.includes(scope)) scope = 'outsideEvent';
    const settings = source.settings && typeof source.settings === 'object' ? clone(source.settings) : {};
    if ((source.type === 'localStorage' || source.type === 'sessionStorage') && settings.storageType === undefined) settings.storageType = source.type === 'sessionStorage' ? 'session' : 'local';
    const numericOrder = Number(source.order);
    const fallbackName = type === 'Counter' ? 'counter' : (type === 'Boolean' ? 'isOpen' : (type === 'String' ? 'textValue' : 'items'));
    const normalizedName = safeIdentifier(source.name, fallbackName);
    /* لزوجة originalName كانت تقفل الحفظ للأبد: نضبطه على الحالة الراهنة فقط */
    if (text(source.name) && text(source.name) !== normalizedName) settings.originalName = text(source.name);
    else delete settings.originalName;
    return {
      id: text(source.id, `var-${index + 1}`),
      name: normalizedName,
      type,
      initialValue,
      scope,
      declaration: source.declaration === 'const' ? 'const' : 'let',
      settings,
      order: Number.isFinite(numericOrder) ? numericOrder : Number(index || 0),
      enabled: source.enabled !== false
    };
  }

  function migrateDefinitionV1ToV2(input) {
    const source = input && typeof input === 'object' ? input : {};
    const targetId = text(source.targetId);
    const actions = Array.isArray(source.actions)
      ? source.actions.map((action, index) => normalizeActionV2(action, index, targetId))
      : [];
    return normalizeDefinitionV2({
      schemaVersion: 2,
      id: source.id,
      sourceId: source.sourceId,
      targetId,
      event: source.event,
      builderMode: source.builderMode === 'quick' ? 'recipe' : 'general',
      recipeType: E1_RECIPE_TYPES[source.recipeType] ? source.recipeType : '',
      reads: [],
      conditions: source.conditions || [],
      actions,
      variables: source.variables || [],
      customLogic: source.customLogic,
      settings: Object.assign({}, source.settings || {}, { migratedFromSchema: source.schemaVersion || 1 })
    });
  }

  function normalizeFunctionDefV2(functionDef) {
    const source = functionDef && typeof functionDef === 'object' ? functionDef : {};
    const parameters = Array.isArray(source.parameters)
      ? source.parameters.map((parameter, index) => safeIdentifier(parameter, `arg${index + 1}`))
      : text(source.parameters).split(',').map(item => item.trim()).filter(Boolean).map((item, index) => safeIdentifier(item, `arg${index + 1}`));
    return {
      name: safeIdentifier(source.name, 'myFunction'),
      parameters,
      actions: Array.isArray(source.actions) ? source.actions.map((action, index) => normalizeActionV2(action, index, '')) : []
    };
  }

  function normalizeDefinitionV2(input) {
    if (!input || typeof input !== 'object') return createDefinitionV2('', '');
    if (!input.schemaVersion && (input.mode || input.params)) {
      const legacy = migrateLegacy(input);
      return migrateDefinitionV1ToV2(Object.assign({}, legacy, { schemaVersion: 1 }));
    }
    const declaredVersion = Number(input.schemaVersion || 1);
    if (declaredVersion < 2 || (declaredVersion < 3 && (input.builderMode === 'quick' || input.builderMode === 'advanced'))) {
      return migrateDefinitionV1ToV2(input);
    }
    const sourceVersion = Number(input.schemaVersion || 2);
    const allowedModes = ['general', 'recipe', 'function', 'custom'];
    const builderMode = allowedModes.indexOf(input.builderMode) >= 0 ? input.builderMode : 'general';
    const targetId = text(input.targetId);
    const eventValue = input.event && typeof input.event === 'object' ? input.event.type : input.event;
    const stateSource = Array.isArray(input.state) ? input.state : (Array.isArray(input.variables) ? input.variables : []);
    let functionsSource = Array.isArray(input.functions) ? input.functions : [];
    if (!functionsSource.length && input.functionDef && (sourceVersion < 3 || builderMode === 'function')) functionsSource = [input.functionDef];
    const settings = input.settings && typeof input.settings === 'object' ? clone(input.settings) : {};
    if (sourceVersion < 3 && settings.migratedFromSchema === undefined) settings.migratedFromSchema = sourceVersion;
    if (input.event && typeof input.event === 'object' && input.event.settings && settings.eventSettings === undefined) settings.eventSettings = clone(input.event.settings);
    const definition = {
      schemaVersion: SCHEMA_VERSION,
      id: safeLinkId(input.id, makeId('link')),
      sourceId: text(input.sourceId),
      targetId,
      event: E1_EVENTS.indexOf(eventValue) >= 0 ? eventValue : 'click',
      builderMode,
      recipeType: E1_RECIPE_TYPES[input.recipeType] ? input.recipeType : '',
      reads: Array.isArray(input.reads) ? input.reads.map(normalizeReadV2) : [],
      conditions: Array.isArray(input.conditions) ? input.conditions.map(normalizeConditionV2) : [],
      conditionGroups: Array.isArray(input.conditionGroups) ? input.conditionGroups.map((group, index) => ({
        id: safeLinkId(group && group.id, `condition-group-${index + 1}`),
        join: group && group.join === 'OR' ? 'OR' : 'AND',
        order: Number.isFinite(Number(group && group.order)) ? Number(group.order) : index,
        enabled: !group || group.enabled !== false
      })) : [],
      actions: Array.isArray(input.actions) ? input.actions.map((action, index) => normalizeActionV2(action, index, targetId)) : [],
      state: stateSource.map(normalizeVariableV2),
      functions: functionsSource.map(normalizeFunctionV3),
      advancedOperations: Array.isArray(input.advancedOperations) ? input.advancedOperations.map(normalizeAdvancedOperation) : [],
      customLogic: text(input.customLogic),
      settings
    };
    return attachV2CompatibilityAliases(definition, input.functionDef);
  }

  function createDefinitionV2(sourceId, targetId, id, builderMode) {
    return normalizeDefinitionV2({
      schemaVersion: SCHEMA_VERSION,
      id: id || makeId('link'),
      sourceId,
      targetId: targetId || '',
      event: 'click',
      builderMode: builderMode || 'general',
      recipeType: '',
      reads: [], conditions: [], conditionGroups: [], actions: [], state: [], functions: [], advancedOperations: [],
      customLogic: '', settings: {}
    });
  }

  function migrateDefinitionV2ToV3(input) {
    const source = input && typeof input === 'object' ? Object.assign({}, input, { schemaVersion: 2 }) : { schemaVersion: 2 };
    return normalizeDefinitionV2(source);
  }

  function buildRecipeDefinitionV2(recipeType, config) {
    const values = config && typeof config === 'object' ? config : {};
    const definition = createDefinitionV2(values.sourceId, values.targetId, values.id, 'recipe');
    definition.recipeType = E1_RECIPE_TYPES[recipeType] ? recipeType : 'inputText';
    definition.event = values.event || 'click';
    if (recipeType === 'inputText') {
      definition.reads = [normalizeReadV2({ type: 'inputValue', elementId: values.inputId, name: 'inputValue' }, 0)];
      definition.actions = [normalizeActionV2({ type: 'setText', targetId: values.targetId, value: 'inputValue', valueType: 'expression' }, 0, values.targetId)];
    } else if (recipeType === 'taskList') {
      definition.reads = [normalizeReadV2({ type: 'inputValue', elementId: values.inputId, name: 'inputValue' }, 0)];
      definition.conditions = [normalizeConditionV2({ left: 'inputValue', operator: 'notEmpty' }, 0)];
      definition.actions = [
        normalizeActionV2({ type: 'appendListItem', targetId: values.targetId, value: 'inputValue', valueType: 'expression', params: { arrayName: values.arrayName || '' } }, 0, values.targetId),
        normalizeActionV2({ type: 'clearInput', targetId: values.inputId }, 1, values.inputId)
      ];
      if (values.arrayName) definition.variables = [normalizeVariableV2({ name: values.arrayName, type: 'Array', initialValue: '[]' }, 0)];
    } else if (recipeType === 'hamburger') {
      const variableName = safeIdentifier(values.variableName, 'menuOpen');
      definition.variables = [normalizeVariableV2({ name: variableName, type: 'Boolean', initialValue: 'false' }, 0)];
      definition.actions = [normalizeActionV2({ type: 'toggleBoolean', targetId: values.targetId, params: { variableName, className: values.className || 'open' } }, 0, values.targetId)];
    } else if (recipeType === 'openClose') {
      definition.actions = [normalizeActionV2({ type: 'toggleVisibility', targetId: values.targetId, params: { method: values.method || 'hidden', className: values.className || 'open' } }, 0, values.targetId)];
    } else if (recipeType === 'counter') {
      const variableName = safeIdentifier(values.variableName, 'counter');
      definition.variables = [normalizeVariableV2({ name: variableName, type: 'Counter', initialValue: text(values.initialValue, '0') }, 0)];
      definition.actions = [normalizeActionV2({
        type: values.direction === 'decrement' ? 'decrementVariable' : 'incrementVariable',
        targetId: values.targetId,
        params: { variableName, step: text(values.step, '1'), display: true }
      }, 0, values.targetId)];
    }
    return normalizeDefinitionV2(definition);
  }

  class ValidationError extends String {
    constructor(message, type) {
      super(message);
      this.type = type || 'user'; // 'user', 'reference', 'schema'
      this.message = message;
    }
  }

  class ValidationWarning extends String {
    constructor(message, type) {
      super(message);
      this.type = type || 'user'; // 'user', 'reference', 'schema'
      this.message = message;
    }
  }

  function knownValueNamesV2(definition) {
    const names = new Set(['sourceElement', 'event', 'state', 'event.target', 'event.target.value']);
    if (!definition) return names;
    const reads = Array.isArray(definition.reads) ? definition.reads : [];
    const state = Array.isArray(definition.state) ? definition.state : (Array.isArray(definition.variables) ? definition.variables : []);
    const advancedOps = Array.isArray(definition.advancedOperations) ? definition.advancedOperations : [];
    const actions = Array.isArray(definition.actions) ? definition.actions : [];

    reads.filter(read => read && read.enabled !== false).forEach(read => names.add(read.name));
    state.filter(variable => variable && variable.enabled !== false).forEach(variable => names.add(variable.name));
    advancedOps.forEach(operation => {
      if (operation && operation.enabled && operation.resultName) names.add(operation.resultName);
    });
    actions.forEach(action => {
      if (!action) return;
      const params = Object.assign({}, action.settings || {}, action.params || {});
      if (action.enabled !== false && params.resultName) names.add(safeIdentifier(params.resultName, 'result'));
    });
    const activeFunction = (definition.functions && definition.functions[0]) || definition.functionDef || { parameters: [] };
    (activeFunction.parameters || []).forEach(parameter => names.add(typeof parameter === 'string' ? parameter : parameter.name));
    (definition.functions || []).forEach(fn => (fn.parameters || []).forEach(parameter => names.add(typeof parameter === 'string' ? parameter : parameter.name)));
    return names;
  }

  function normalizeExpressionV2(expr) {
    if (!expr || typeof expr !== 'object') {
      return { id: makeId('expr'), type: 'literal', dataType: 'null', value: null };
    }
    const node = Object.assign({}, expr);
    if (!node.id) node.id = expr.id || makeId('expr');
    if (!node.type) node.type = 'literal';

    if (node.type === 'literal') {
      node.dataType = node.dataType || 'string';
      if (node.dataType === 'number') {
        node.value = isNaN(Number(node.value)) ? 0 : Number(node.value);
      } else if (node.dataType === 'boolean') {
        node.value = node.value === true || String(node.value) === 'true';
      } else if (node.dataType === 'null') {
        node.value = null;
      } else {
        node.dataType = 'string';
        node.value = node.value === undefined ? '' : String(node.value);
      }
    } else if (node.type === 'reference') {
      node.referenceType = node.referenceType || 'state';
      node.name = text(node.name).trim();
      node.sourceId = node.sourceId || null;
    } else if (node.type === 'property') {
      node.object = normalizeExpressionV2(node.object);
      node.property = text(node.property).trim();
      node.optional = node.optional === true;
      node.accessMode = node.accessMode || 'strict';
    } else if (node.type === 'binary') {
      node.operator = node.operator || '===';
      node.left = normalizeExpressionV2(node.left);
      node.right = normalizeExpressionV2(node.right);
      node.variant = node.variant || 'arithmetic';
    } else if (node.type === 'logical') {
      node.operator = node.operator || '&&';
      node.left = normalizeExpressionV2(node.left);
      node.right = normalizeExpressionV2(node.right);
    } else if (node.type === 'unary') {
      node.operator = node.operator || '!';
      node.argument = normalizeExpressionV2(node.argument);
    } else if (node.type === 'group') {
      node.expression = normalizeExpressionV2(node.expression);
    } else if (node.type === 'preset') {
      node.presetType = node.presetType || 'empty';
      node.arguments = Array.isArray(node.arguments)
        ? node.arguments.map(normalizeExpressionV2)
        : [];
    } else if (node.type === 'legacyExpression') {
      node.raw = text(node.raw);
      node.readOnly = true;
      node.migrationStatus = node.migrationStatus || 'manual-rebuild-required';
    } else if (node.type === 'placeholder') {
      node.expectedType = node.expectedType || null;
    } else {
      node.type = 'literal';
      node.dataType = 'null';
      node.value = null;
    }
    return node;
  }

  const PRESET_REGISTRY = {
    empty: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'فارغ بعد الحذف',
      generate: (left) => `(String(${left} ?? '').trim() === '')`
    },
    notEmpty: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'ليس فارغاً',
      generate: (left) => `(String(${left} ?? '').trim() !== '')`
    },
    contains: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: ['string', 'unknown'],
      outputType: 'boolean',
      reviewLabel: 'يحتوي على',
      generate: (left, right) => `(String(${left} ?? '').includes(${right}))`
    },
    notContains: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: ['string', 'unknown'],
      outputType: 'boolean',
      reviewLabel: 'لا يحتوي على',
      generate: (left, right) => `(!String(${left} ?? '').includes(${right}))`
    },
    startsWith: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: ['string', 'unknown'],
      outputType: 'boolean',
      reviewLabel: 'يبدأ بـ',
      generate: (left, right) => `(String(${left} ?? '').startsWith(${right}))`
    },
    endsWith: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: ['string', 'unknown'],
      outputType: 'boolean',
      reviewLabel: 'ينتهي بـ',
      generate: (left, right) => `(String(${left} ?? '').endsWith(${right}))`
    },
    length: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: [],
      outputType: 'number',
      reviewLabel: 'طول النص',
      generate: (left) => `(String(${left} ?? '').length)`
    },
    lowercase: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: [],
      outputType: 'string',
      reviewLabel: 'حروف صغيرة',
      generate: (left) => `(String(${left} ?? '').toLowerCase())`
    },
    uppercase: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: [],
      outputType: 'string',
      reviewLabel: 'حروف كبيرة',
      generate: (left) => `(String(${left} ?? '').toUpperCase())`
    },
    trim: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: [],
      outputType: 'string',
      reviewLabel: 'إزالة الفراغات',
      generate: (left) => `(String(${left} ?? '').trim())`
    },
    arrayLength: {
      inputTypes: ['array', 'unknown'],
      argumentTypes: [],
      outputType: 'number',
      reviewLabel: 'عدد عناصر المصفوفة',
      generate: (left) => `(Array.isArray(${left}) ? ${left}.length : 0)`
    },
    arrayContains: {
      inputTypes: ['array', 'unknown'],
      argumentTypes: ['any'],
      outputType: 'boolean',
      reviewLabel: 'المصفوفة تحتوي على',
      generate: (left, right) => `(Array.isArray(${left}) && ${left}.includes(${right}))`
    },
    arrayEmpty: {
      inputTypes: ['array', 'unknown'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'المصفوفة فارغة',
      generate: (left) => `(Array.isArray(${left}) && ${left}.length === 0)`
    },
    arrayNotEmpty: {
      inputTypes: ['array', 'unknown'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'المصفوفة ليست فارغة',
      generate: (left) => `(Array.isArray(${left}) && ${left}.length > 0)`
    },
    exists: {
      inputTypes: ['any'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'موجود (وليس Null)',
      generate: (left) => `(typeof ${left} !== 'undefined' && ${left} !== null)`
    },
    notExists: {
      inputTypes: ['any'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'غير موجود (أو Null)',
      generate: (left) => `(typeof ${left} === 'undefined' || ${left} === null)`
    },
    isValidNumber: {
      inputTypes: ['any'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'رقم صالح',
      generate: (left) => `(!isNaN(Number(${left})) && isFinite(Number(${left})))`
    },
    isBoolean: {
      inputTypes: ['any'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'قيمة منطقية',
      generate: (left) => `(typeof ${left} === 'boolean')`
    },
    email: {
      inputTypes: ['string', 'unknown'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'بريد إلكتروني صالح',
      generate: (left) => `(typeof ${left} === 'string' && /^[\\w.%+-]+@[\\w.-]+\\.[a-zA-Z]{2,}$/.test(${left}))`
    },
    toNumber: {
      inputTypes: ['any'],
      argumentTypes: [],
      outputType: 'number',
      reviewLabel: 'تحويل إلى رقم',
      generate: (left) => `Number(${left})`
    },
    toString: {
      inputTypes: ['any'],
      argumentTypes: [],
      outputType: 'string',
      reviewLabel: 'تحويل إلى نص',
      generate: (left) => `String(${left} ?? '')`
    },
    toBoolean: {
      inputTypes: ['any'],
      argumentTypes: [],
      outputType: 'boolean',
      reviewLabel: 'تحويل إلى صحيح/خطأ',
      generate: (left) => `Boolean(${left})`
    }
  };

  /* قوائم السماح كانت محليّة جوه validateExpressionV2 فقط، والمولّد بيتنده عليه
     للمعاينة الحيّة بمعزل عن المدقق — يعني معامل زي: , fetch('//evil'), true
     كان يعدّي حرفيًا للكود المولَّد. رفعناها لنطاق الموديول ونفرضها في الاتنين. */
  const E1_ALLOWED_BINARY_OPERATORS = new Set(['===', '!==', '>', '<', '>=', '<=', '+', '-', '*', '/', '%']);
  const E1_ALLOWED_LOGICAL_OPERATORS = new Set(['&&', '||']);
  const E1_ALLOWED_UNARY_OPERATORS = new Set(['!', '-']);

  function generateExpressionV2(expr, definition, options) {
    if (!expr) return "null";
    const node = normalizeExpressionV2(expr);
    const opts = options || {};

    switch (node.type) {
      case 'literal': {
        if (node.dataType === 'string') {
          return jsString(node.value);
        }
        if (node.dataType === 'number') {
          return String(node.value);
        }
        if (node.dataType === 'boolean') {
          return node.value ? 'true' : 'false';
        }
        if (node.dataType === 'null') {
          return 'null';
        }
        return "''";
      }

      case 'reference': {
        if (node.sourceId && definition) {
          if (node.referenceType === 'state') {
            const state = Array.isArray(definition.state) ? definition.state : (Array.isArray(definition.variables) ? definition.variables : []);
            const variable = state.find(v => v && v.id === node.sourceId);
            if (variable) return variable.name;
          } else if (node.referenceType === 'read') {
            const reads = Array.isArray(definition.reads) ? definition.reads : [];
            const read = reads.find(r => r && r.id === node.sourceId);
            if (read) return read.name;
          }
        }
        const name = text(node.name).trim();
        if (!name) return "''";

        if (node.referenceType === 'loopVariable') {
          if (name === 'loopItem' || name === 'item') {
            return resolveLoopItemName(opts) || 'item';
          }
          return name;
        }

        if (node.referenceType === 'stateValue') {
          return `state[${jsString(name)}]`;
        }

        /* اسم المرجع يُحقن حرفياً في الكود — لا نسمح إلا بمعرّفات JS صالحة
           (اسم مثل "alert(1)" كان يمرّ حرفياً، و"my value" كان يكسر الكود). */
        if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(name)) return "''";
        return name;
      }

      case 'property': {
        const objCode = generateExpressionV2(node.object, definition, opts);
        const prop = node.property;
        const isSafe = node.accessMode === 'safe';
        const isValidId = /^[a-zA-Z_$][\w$]*$/.test(prop);

        if (isValidId) {
          const op = isSafe ? '?.' : '.';
          return `${objCode}${op}${prop}`;
        } else {
          const op = isSafe ? '?.' : '';
          return `${objCode}${op}[${JSON.stringify(prop)}]`;
        }
      }

      case 'binary': {
        /* دفاع بالعمق: المولّد ما يثقش في node.operator حتى لو المدقق اشتغل قبله */
        if (!E1_ALLOWED_BINARY_OPERATORS.has(node.operator)) return "null";
        const left = generateExpressionV2(node.left, definition, opts);
        const right = generateExpressionV2(node.right, definition, opts);
        return `(${left} ${node.operator} ${right})`;
      }

      case 'logical': {
        if (!E1_ALLOWED_LOGICAL_OPERATORS.has(node.operator)) return "null";
        const left = generateExpressionV2(node.left, definition, opts);
        const right = generateExpressionV2(node.right, definition, opts);
        return `(${left} ${node.operator} ${right})`;
      }

      case 'unary': {
        if (!E1_ALLOWED_UNARY_OPERATORS.has(node.operator)) return "null";
        const arg = generateExpressionV2(node.argument, definition, opts);
        return `(${node.operator}${arg})`;
      }

      case 'group': {
        const inner = generateExpressionV2(node.expression, definition, opts);
        return `(${inner})`;
      }

      case 'preset': {
        const args = node.arguments || [];
        const left = args[0] ? generateExpressionV2(args[0], definition, opts) : "''";
        const right = args[1] ? generateExpressionV2(args[1], definition, opts) : "''";

        const reg = PRESET_REGISTRY[node.presetType];
        if (reg && typeof reg.generate === 'function') {
          return reg.generate(left, right);
        }
        return "false";
      }

      case 'legacyExpression': {
        return node.raw || "null";
      }

      case 'placeholder': {
        return "undefined";
      }

      default:
        return "null";
    }
  }

  function inferExpressionType(expr, definition, options) {
    if (!expr) return 'unknown';
    const node = normalizeExpressionV2(expr);
    const opts = options || {};
    
    switch (node.type) {
      case 'literal': {
        return node.dataType || 'unknown';
      }
      
      case 'reference': {
        if (node.sourceId && definition) {
          if (node.referenceType === 'state') {
            const state = Array.isArray(definition.state) ? definition.state : (Array.isArray(definition.variables) ? definition.variables : []);
            const variable = state.find(v => v && v.id === node.sourceId);
            if (variable) {
              const t = String(variable.type).toLowerCase();
              if (t === 'number' || t === 'counter') return 'number';
              if (t === 'boolean') return 'boolean';
              if (t === 'array') return 'array';
              if (t === 'object') return 'object';
              if (t === 'string') return 'string';
            }
          } else if (node.referenceType === 'read') {
            const reads = Array.isArray(definition.reads) ? definition.reads : [];
            const read = reads.find(r => r && r.id === node.sourceId);
            if (read) {
              const readMode = read.settings ? (read.settings.readMode || read.settings.type) : null;
              if (readMode === 'number' || readMode === 'valueAsNumber' || read.type === 'childCount') return 'number';
              if (readMode === 'checked' || ['checked', 'hasClass', 'visible', 'hidden', 'disabled'].includes(read.type)) return 'boolean';
              return 'string';
            }
          }
        }

        const name = text(node.name).trim();
        if (!name) return 'unknown';
        
        if (node.referenceType === 'loopVariable') {
          if (name === 'index' || name.endsWith('Index') || name === 'i') return 'number';
          return 'unknown';
        }
        
        if (definition && Array.isArray(definition.state)) {
          const variable = definition.state.find(v => v.name === name);
          if (variable) {
            const t = String(variable.type).toLowerCase();
            if (t === 'number' || t === 'counter') return 'number';
            if (t === 'boolean') return 'boolean';
            if (t === 'array') return 'array';
            if (t === 'object') return 'object';
            if (t === 'string') return 'string';
          }
        }
        
        if (definition && Array.isArray(definition.reads)) {
          const read = definition.reads.find(r => r.name === name);
          if (read) {
            const t = read.type;
            const readMode = read.settings ? (read.settings.readMode || read.settings.type) : null;
            if (readMode === 'number' || readMode === 'valueAsNumber' || t === 'childCount') return 'number';
            if (readMode === 'checked' || ['checked', 'hasClass', 'visible', 'hidden', 'disabled'].includes(t)) return 'boolean';
            return 'string';
          }
        }

        if (name === 'event') return 'object';
        if (name === 'sourceElement') return 'element';
        
        return 'unknown';
      }
      
      case 'property': {
        const prop = node.property;
        if (prop === 'length') {
          const objType = inferExpressionType(node.object, definition, opts);
          if (objType === 'string' || objType === 'array') return 'number';
        }
        return 'unknown';
      }
      
      case 'binary': {
        const op = node.operator;
        if (['===', '!==', '>', '<', '>=', '<='].includes(op)) return 'boolean';
        if (['+', '-', '*', '/', '%'].includes(op)) {
          if (op === '+') {
            if (node.variant === 'concat') return 'string';
            if (node.variant === 'arithmetic') return 'number';
            const leftT = inferExpressionType(node.left, definition, opts);
            const rightT = inferExpressionType(node.right, definition, opts);
            if (leftT === 'string' || rightT === 'string') return 'string';
            if (leftT === 'unknown' || rightT === 'unknown') return 'unknown';
          }
          return 'number';
        }
        return 'unknown';
      }
      
      case 'logical': {
        return 'boolean';
      }
      
      case 'unary': {
        if (node.operator === '!') return 'boolean';
        if (node.operator === '-') return 'number';
        return 'unknown';
      }
      
      case 'group': {
        return inferExpressionType(node.expression, definition, opts);
      }
      
      case 'preset': {
        const reg = PRESET_REGISTRY[node.presetType];
        if (reg) return reg.outputType;
        return 'unknown';
      }
      
      default:
        return 'unknown';
    }
  }

  function validateExpressionV2(expr, definition, expectedType, options) {
    const errors = [];
    const warnings = [];
    const opts = options || {};
    const depth = opts.depth || 0;
    
    if (depth > 10) {
      errors.push(new ValidationError("عمق التعبيرات كبير جداً (أكثر من 10 مستويات تعشيش).", 'schema'));
      return { errors, warnings };
    }
    
    if (!expr) {
      errors.push(new ValidationError("تعبير فارغ أو غير مكتمل.", 'user'));
      return { errors, warnings };
    }
    
    const node = normalizeExpressionV2(expr);
    const subOpts = Object.assign({}, opts, { depth: depth + 1 });
    const knownNames = knownValueNamesV2(definition);

    const availableLoopVars = new Set();
    let loopCtx = opts.loopContext;
    while (loopCtx) {
      if (loopCtx.loopVariables) {
        if (loopCtx.loopVariables.item) availableLoopVars.add(loopCtx.loopVariables.item);
        if (loopCtx.loopVariables.index) availableLoopVars.add(loopCtx.loopVariables.index);
      }
      loopCtx = loopCtx.parentContext;
    }

    /* نفس القوائم المشتركة مع المولّد — مصدر واحد للحقيقة */
    const allowedBinaryOperators = E1_ALLOWED_BINARY_OPERATORS;
    const allowedLogicalOperators = E1_ALLOWED_LOGICAL_OPERATORS;
    const allowedUnaryOperators = E1_ALLOWED_UNARY_OPERATORS;
    /* stateValue مدعوم في المولّد — توحيد المجموعتين حتى لا يرفضه التحقق */
    const allowedReferenceTypes = new Set(['state', 'read', 'loopVariable', 'parameter', 'event', 'stateValue']);

    switch (node.type) {
      case 'placeholder': {
        errors.push(new ValidationError("التعبير غير مكتمل.", 'user'));
        break;
      }

      case 'legacyExpression': {
        warnings.push(new ValidationWarning("هذا التعبير القديم يحتاج إلى إعادة بناء بصري قبل إعادة التصدير.", 'user'));
        break;
      }

      case 'literal': {
        if (node.dataType === 'number' && isNaN(Number(node.value))) {
          errors.push(new ValidationError(`القيمة الثابتة ${node.value} ليست رقماً صالحاً.`, 'user'));
        }
        break;
      }
      
      case 'reference': {
        if (!allowedReferenceTypes.has(node.referenceType)) {
          errors.push(new ValidationError(`نوع المرجع ${node.referenceType} غير مدعوم.`, 'schema'));
          break;
        }

        const name = text(node.name).trim();
        if (!name) {
          errors.push(new ValidationError("لم يتم تحديد اسم للمرجع (Reference).", 'user'));
          break;
        }
        /* خطأ صريح بدل تحذير: الاسم يدخل الكود المولّد مباشرة */
        if (node.referenceType !== 'stateValue' && !/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(name)) {
          errors.push(new ValidationError(`اسم المرجع ${name} غير صالح — استخدم حروفاً وأرقاماً بلا مسافات أو رموز.`, 'user'));
          break;
        }

        if (node.sourceId && definition) {
          if (node.referenceType === 'state') {
            const state = Array.isArray(definition.state) ? definition.state : (Array.isArray(definition.variables) ? definition.variables : []);
            const variable = state.find(v => v && v.id === node.sourceId);
            if (!variable) {
              errors.push(new ValidationError(`المتغير المستخدم في هذا الشرط تم حذفه.`, 'reference'));
            }
          } else if (node.referenceType === 'read') {
            const reads = Array.isArray(definition.reads) ? definition.reads : [];
            const read = reads.find(r => r && r.id === node.sourceId);
            if (!read) {
              errors.push(new ValidationError(`العنصر المقروء المستخدم في هذا الشرط تم حذفه.`, 'reference'));
            }
          }
        } else {
          if (node.referenceType === 'loopVariable') {
            if (name === 'loopItem' || name === 'item') {
              if (!resolveLoopItemName(opts)) {
                errors.push(new ValidationError("تم استخدام العنصر الحالي للحلقة (item) خارج نطاق حلقة التكرار.", 'user'));
              }
            } else if (!availableLoopVars.has(name)) {
              errors.push(new ValidationError(`المتغير ${name} الخاص بالحلقة غير متوفر في النطاق الحالي.`, 'user'));
            }
          } else if (node.referenceType === 'state') {
            if (!knownNames.has(name)) {
              errors.push(new ValidationError(`متغير الحالة ${name} غير معرف في هذا التفاعل.`, 'reference'));
            }
          } else if (node.referenceType === 'read') {
            if (!knownNames.has(name)) {
              errors.push(new ValidationError(`العنصر المقروء ${name} غير معرف في هذا التفاعل.`, 'reference'));
            }
          } else {
            if (!knownNames.has(name) && !availableLoopVars.has(name) && !['event', 'sourceElement'].includes(name)) {
              warnings.push(new ValidationWarning(`المرجع ${name} قد لا يكون معرفاً في وقت التشغيل.`, 'user'));
            }
          }
        }
        break;
      }
      
      case 'property': {
        if (!text(node.property).trim()) {
          errors.push(new ValidationError("اسم الخاصية فارغ.", 'user'));
        }
        const sub = validateExpressionV2(node.object, definition, null, subOpts);
        errors.push(...sub.errors);
        warnings.push(...sub.warnings);
        break;
      }
      
      case 'binary': {
        if (!allowedBinaryOperators.has(node.operator)) {
          errors.push(new ValidationError(`العملية الثنائية ${node.operator} غير مدعومة.`, 'schema'));
          break;
        }

        const subLeft = validateExpressionV2(node.left, definition, null, subOpts);
        const subRight = validateExpressionV2(node.right, definition, null, subOpts);
        errors.push(...subLeft.errors, ...subRight.errors);
        warnings.push(...subLeft.warnings, ...subRight.warnings);
        
        if (node.operator === '/') {
          const rNode = normalizeExpressionV2(node.right);
          if (rNode.type === 'literal' && rNode.dataType === 'number' && Number(rNode.value) === 0) {
            errors.push(new ValidationError("القسمة على صفر ثابت غير مسموح بها.", 'user'));
          }
        }
        
        const leftType = inferExpressionType(node.left, definition, opts);
        const rightType = inferExpressionType(node.right, definition, opts);
        
        if (node.operator === '+') {
          if (node.variant === 'arithmetic') {
            if (leftType !== 'number' && leftType !== 'unknown') {
              warnings.push(new ValidationWarning(`عملية جمع الأرقام تتطلب أرقاماً، لكن الطرف الأيسر من النوع ${leftType}.`, 'user'));
            }
            if (rightType !== 'number' && rightType !== 'unknown') {
              warnings.push(new ValidationWarning(`عملية جمع الأرقام تتطلب أرقاماً، لكن الطرف الأيمن من النوع ${rightType}.`, 'user'));
            }
          } else if (node.variant === 'concat') {
            if (leftType !== 'string' && leftType !== 'unknown') {
              warnings.push(new ValidationWarning(`عملية دمج النصوص تتطلب نصوصاً، لكن الطرف الأيسر من النوع ${leftType}.`, 'user'));
            }
            if (rightType !== 'string' && rightType !== 'unknown') {
              warnings.push(new ValidationWarning(`عملية دمج النصوص تتطلب نصوصاً، لكن الطرف الأيمن من النوع ${rightType}.`, 'user'));
            }
          } else {
            if (leftType === 'string' && rightType === 'number') {
              warnings.push(new ValidationWarning("مقارنة أو جمع غير متوافق: محاولة جمع نص ورقم.", 'user'));
            }
          }
        }

        if (['-', '*', '/', '%'].includes(node.operator)) {
          if (leftType === 'boolean' || rightType === 'boolean') {
            warnings.push(new ValidationWarning(`تنبيه: محاولة إجراء عملية حسابية (${node.operator}) على قيمة منطقية (Boolean).`, 'user'));
          }
          if (leftType === 'string' || rightType === 'string') {
            warnings.push(new ValidationWarning(`تنبيه: محاولة إجراء عملية حسابية (${node.operator}) على نص (String).`, 'user'));
          }
        }
        break;
      }
      
      case 'logical': {
        if (!allowedLogicalOperators.has(node.operator)) {
          errors.push(new ValidationError(`العملية المنطقية ${node.operator} غير مدعومة.`, 'schema'));
          break;
        }

        const subLeft = validateExpressionV2(node.left, definition, 'boolean', subOpts);
        const subRight = validateExpressionV2(node.right, definition, 'boolean', subOpts);
        errors.push(...subLeft.errors, ...subRight.errors);
        warnings.push(...subLeft.warnings, ...subRight.warnings);
        break;
      }
      
      case 'unary': {
        if (!allowedUnaryOperators.has(node.operator)) {
          errors.push(new ValidationError(`العملية الأحادية ${node.operator} غير مدعومة.`, 'schema'));
          break;
        }

        const subArg = validateExpressionV2(node.argument, definition, null, subOpts);
        errors.push(...subArg.errors);
        warnings.push(...subArg.warnings);
        break;
      }
      
      case 'group': {
        const sub = validateExpressionV2(node.expression, definition, expectedType, subOpts);
        errors.push(...sub.errors);
        warnings.push(...sub.warnings);
        break;
      }
      
      case 'preset': {
        const reg = PRESET_REGISTRY[node.presetType];
        if (!reg) {
          errors.push(new ValidationError(`العملية الجاهزة ${node.presetType} غير مدعومة.`, 'schema'));
          break;
        }

        const args = node.arguments || [];
        if (args.length < reg.argumentTypes.length) {
          errors.push(new ValidationError(`العملية الجاهزة ${node.presetType} تتطلب معاملات إضافية.`, 'user'));
        }
        args.forEach(arg => {
          const sub = validateExpressionV2(arg, definition, null, subOpts);
          errors.push(...sub.errors);
          warnings.push(...sub.warnings);
        });
        break;
      }

      default: {
        errors.push(new ValidationError(`نوع عقدة التعبير ${node.type} غير معروف.`, 'schema'));
        break;
      }
    }
    
    if (expectedType && expectedType !== 'unknown') {
      const type = inferExpressionType(node, definition, opts);
      if (type !== 'unknown' && type !== expectedType) {
        warnings.push(new ValidationWarning(`تعارض نوع الناتج: متوقع ${expectedType} ولكن الناتج سيكون ${type}.`, 'user'));
      }
    }
    
    return { errors, warnings };
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Expression V2 helpers — reference linking (sourceId), rename safety and
   * the Arabic review sentence. Used by the visual builder UI (phase-a).
   * ──────────────────────────────────────────────────────────────────────── */

  const EXPRESSION_TYPE_LABELS_AR = {
    literal: 'قيمة ثابتة',
    reference: 'قراءة / متغير',
    property: 'خاصية من كائن',
    binary: 'عملية مقارنة / حساب',
    logical: 'ربط منطقي (و / أو)',
    unary: 'عملية أحادية (نفي / سالب)',
    group: 'أقواس ( )',
    preset: 'عملية جاهزة',
    legacyExpression: 'تعبير قديم (نصي)',
    placeholder: 'جزء غير مكتمل'
  };

  function walkExpressionTree(expr, visitor, depth) {
    const level = depth || 0;
    if (!expr || typeof expr !== 'object' || level > 32) return;
    visitor(expr, level);
    if (expr.type === 'property') walkExpressionTree(expr.object, visitor, level + 1);
    else if (expr.type === 'binary' || expr.type === 'logical') {
      walkExpressionTree(expr.left, visitor, level + 1);
      walkExpressionTree(expr.right, visitor, level + 1);
    } else if (expr.type === 'unary') walkExpressionTree(expr.argument, visitor, level + 1);
    else if (expr.type === 'group') walkExpressionTree(expr.expression, visitor, level + 1);
    else if (expr.type === 'preset') (Array.isArray(expr.arguments) ? expr.arguments : []).forEach(argument => walkExpressionTree(argument, visitor, level + 1));
  }

  function expressionContainsLegacy(expr) {
    let found = false;
    walkExpressionTree(expr, node => { if (node.type === 'legacyExpression') found = true; });
    return found;
  }

  function findExpressionNodeById(expr, nodeId) {
    let found = null;
    if (!nodeId) return null;
    walkExpressionTree(expr, node => { if (!found && node.id === nodeId) found = node; });
    return found;
  }

  function replaceExpressionNodeById(expr, nodeId, nextNode) {
    if (!expr || typeof expr !== 'object' || !nodeId) return expr;
    if (expr.id === nodeId) return nextNode;
    const replaceIn = (holder, key) => {
      if (holder[key] && typeof holder[key] === 'object') holder[key] = replaceExpressionNodeById(holder[key], nodeId, nextNode);
    };
    if (expr.type === 'property') replaceIn(expr, 'object');
    else if (expr.type === 'binary' || expr.type === 'logical') { replaceIn(expr, 'left'); replaceIn(expr, 'right'); }
    else if (expr.type === 'unary') replaceIn(expr, 'argument');
    else if (expr.type === 'group') replaceIn(expr, 'expression');
    else if (expr.type === 'preset' && Array.isArray(expr.arguments)) {
      expr.arguments = expr.arguments.map(argument => replaceExpressionNodeById(argument, nodeId, nextNode));
    }
    return expr;
  }

  /* Bind loose references (name only) to stable ids so later renames are safe.
     Returns how many references got linked. */
  function linkExpressionReferences(expr, definition) {
    if (!definition) return 0;
    const state = Array.isArray(definition.state) ? definition.state : (Array.isArray(definition.variables) ? definition.variables : []);
    const reads = Array.isArray(definition.reads) ? definition.reads : [];
    let linked = 0;
    walkExpressionTree(expr, node => {
      if (node.type !== 'reference' || node.sourceId) return;
      const name = text(node.name).trim();
      if (!name) return;
      const variable = state.find(item => item && item.name === name);
      if (variable && variable.id) {
        node.sourceId = variable.id;
        node.referenceType = 'state';
        linked += 1;
        return;
      }
      const read = reads.find(item => item && item.name === name);
      if (read && read.id) {
        node.sourceId = read.id;
        node.referenceType = 'read';
        linked += 1;
      }
    });
    return linked;
  }

  /* Refresh the cached display name of id-linked references (e.g. after the
     source variable/read was renamed elsewhere). Returns how many changed. */
  function refreshExpressionReferenceNames(expr, definition) {
    if (!definition) return 0;
    const state = Array.isArray(definition.state) ? definition.state : (Array.isArray(definition.variables) ? definition.variables : []);
    const reads = Array.isArray(definition.reads) ? definition.reads : [];
    let changed = 0;
    walkExpressionTree(expr, node => {
      if (node.type !== 'reference' || !node.sourceId) return;
      const source = node.referenceType === 'read'
        ? reads.find(item => item && item.id === node.sourceId)
        : state.find(item => item && item.id === node.sourceId);
      if (source && source.name && source.name !== node.name) {
        node.name = source.name;
        changed += 1;
      }
    });
    return changed;
  }

  /* Apply a variable/read rename inside one expression tree.
     rename = { sourceId, oldName, newName, referenceType }. Id-linked nodes are
     matched by sourceId; loose nodes are matched by oldName and adopt the id. */
  function updateExpressionReferencesOnRename(expr, rename) {
    if (!rename || !rename.newName) return 0;
    let changed = 0;
    walkExpressionTree(expr, node => {
      if (node.type !== 'reference') return;
      if (rename.sourceId && node.sourceId === rename.sourceId) {
        if (node.name !== rename.newName) { node.name = rename.newName; changed += 1; }
        return;
      }
      if (!node.sourceId && rename.oldName && node.name === rename.oldName) {
        node.name = rename.newName;
        if (rename.sourceId) {
          node.sourceId = rename.sourceId;
          if (rename.referenceType) node.referenceType = rename.referenceType;
        }
        changed += 1;
      }
    });
    return changed;
  }

  /* Arabic review sentence for the full expression addendum: every node type
     (literal, reference, property, binary, logical, unary, group, preset,
     legacyExpression, placeholder) and every PRESET_REGISTRY entry. */
  function explainExpressionInArabic(expr, definition, options) {
    const opts = options || {};
    const depth = opts.depth || 0;
    if (depth > 12) return '…';
    if (!expr) return 'قيمة غير مكتملة';
    const node = normalizeExpressionV2(expr);
    const sub = child => explainExpressionInArabic(child, definition, Object.assign({}, opts, { depth: depth + 1 }));

    switch (node.type) {
      case 'literal': {
        if (node.dataType === 'number') return `الرقم ${node.value}`;
        if (node.dataType === 'boolean') return node.value ? 'صحيح (true)' : 'خطأ (false)';
        if (node.dataType === 'null') return 'لا شيء (null)';
        const value = String(node.value === undefined || node.value === null ? '' : node.value);
        return value === '' ? 'نص فارغ ("")' : `النص "${value}"`;
      }

      case 'reference': {
        let name = text(node.name).trim();
        let deleted = false;
        if (node.sourceId && definition) {
          const state = Array.isArray(definition.state) ? definition.state : (Array.isArray(definition.variables) ? definition.variables : []);
          const reads = Array.isArray(definition.reads) ? definition.reads : [];
          const source = node.referenceType === 'read'
            ? reads.find(item => item && item.id === node.sourceId)
            : (node.referenceType === 'state' ? state.find(item => item && item.id === node.sourceId) : null);
          if (source) name = source.name || name;
          else if (node.referenceType === 'state' || node.referenceType === 'read') deleted = true;
        }
        if (!name) return 'مرجع بدون اسم';
        if (deleted) return `مرجع محذوف (${name})`;
        if (node.referenceType === 'read') return `القيمة المقروءة ${name}`;
        if (node.referenceType === 'loopVariable') {
          if (name === 'item' || name === 'loopItem') return 'العنصر الحالي في الحلقة (item)';
          if (name === 'index' || name === 'i' || /Index$/.test(name)) return `عدّاد الحلقة ${name}`;
          return `متغير الحلقة ${name}`;
        }
        if (node.referenceType === 'parameter') return `الباراميتر ${name}`;
        if (node.referenceType === 'event' || name === 'event') return `بيانات الحدث (${name})`;
        if (name === 'sourceElement') return 'عنصر المصدر (sourceElement)';
        return `المتغير ${name}`;
      }

      case 'property': {
        const safe = node.accessMode === 'safe' ? ' بوصول آمن (?.)' : '';
        return `خاصية ${node.property || '؟'} من ${sub(node.object)}${safe}`;
      }

      case 'binary': {
        const left = sub(node.left);
        const right = sub(node.right);
        const comparisons = {
          '===': 'يساوي', '!==': 'لا يساوي',
          '>': 'أكبر من', '<': 'أصغر من',
          '>=': 'أكبر من أو يساوي', '<=': 'أصغر من أو يساوي'
        };
        if (comparisons[node.operator]) return `${left} ${comparisons[node.operator]} ${right}`;
        if (node.operator === '+') {
          if (node.variant === 'concat') return `دمج ${left} مع ${right}`;
          return `ناتج جمع ${left} و ${right}`;
        }
        if (node.operator === '-') return `ناتج طرح ${right} من ${left}`;
        if (node.operator === '*') return `ناتج ضرب ${left} في ${right}`;
        if (node.operator === '/') return `ناتج قسمة ${left} على ${right}`;
        if (node.operator === '%') return `باقي قسمة ${left} على ${right}`;
        return `عملية ${node.operator} بين ${left} و ${right}`;
      }

      case 'logical': {
        const joiner = node.operator === '||' ? 'أو' : 'و';
        return `(${sub(node.left)}) ${joiner} (${sub(node.right)})`;
      }

      case 'unary': {
        if (node.operator === '!') return `عكس القيمة المنطقية لـ ${sub(node.argument)}`;
        if (node.operator === '-') return `سالب ${sub(node.argument)}`;
        return `عملية ${node.operator} على ${sub(node.argument)}`;
      }

      case 'group':
        return `(${sub(node.expression)})`;

      case 'preset': {
        const registryEntry = PRESET_REGISTRY[node.presetType];
        const args = Array.isArray(node.arguments) ? node.arguments : [];
        const left = args.length ? sub(args[0]) : 'قيمة غير محددة';
        const right = args.length > 1 ? sub(args[1]) : '';
        const templates = {
          empty: () => `${left} فارغ بعد إزالة الفراغات`,
          notEmpty: () => `${left} ليس فارغاً`,
          contains: () => `${left} يحتوي على ${right}`,
          notContains: () => `${left} لا يحتوي على ${right}`,
          startsWith: () => `${left} يبدأ بـ ${right}`,
          endsWith: () => `${left} ينتهي بـ ${right}`,
          length: () => `طول النص ${left}`,
          lowercase: () => `تحويل ${left} إلى حروف صغيرة`,
          uppercase: () => `تحويل ${left} إلى حروف كبيرة`,
          trim: () => `إزالة الفراغات من طرفي ${left}`,
          arrayLength: () => `عدد عناصر المصفوفة ${left}`,
          arrayContains: () => `المصفوفة ${left} تحتوي على ${right}`,
          arrayEmpty: () => `المصفوفة ${left} فارغة`,
          arrayNotEmpty: () => `المصفوفة ${left} ليست فارغة`,
          exists: () => `${left} موجود (وليس null)`,
          notExists: () => `${left} غير موجود (أو null)`,
          isValidNumber: () => `${left} رقم صالح`,
          isBoolean: () => `${left} قيمة منطقية (Boolean)`,
          email: () => `${left} بريد إلكتروني صالح`,
          toNumber: () => `تحويل ${left} إلى رقم`,
          toString: () => `تحويل ${left} إلى نص`,
          toBoolean: () => `تحويل ${left} إلى صحيح/خطأ`
        };
        if (templates[node.presetType]) return templates[node.presetType]();
        if (registryEntry && registryEntry.reviewLabel) {
          return right ? `${left} ${registryEntry.reviewLabel} ${right}` : `${left} ${registryEntry.reviewLabel}`;
        }
        return `عملية جاهزة غير معروفة (${node.presetType})`;
      }

      case 'legacyExpression': {
        const raw = text(node.raw).trim();
        return `تعبير قديم بصيغة نصية${raw ? `: "${raw}"` : ''} — يحتاج إعادة بناء بصري`;
      }

      case 'placeholder':
        return 'جزء غير مكتمل — اختر قيمة';

      default:
        return 'تعبير غير معروف';
    }
  }

  function valueExpressionV2(value, valueType, definition) {
    if (value && typeof value === 'object') {
      if (['literal', 'reference', 'property', 'binary', 'logical', 'unary', 'group', 'preset'].includes(value.type)) {
        return generateExpressionV2(value, definition);
      }
      if (value.value && typeof value.value === 'object' && ['literal', 'reference', 'property', 'binary', 'logical', 'unary', 'group', 'preset'].includes(value.value.type)) {
        return generateExpressionV2(value.value, definition);
      }
      if ((value.valueType === 'expression' || value.sourceType === 'expression') && typeof value.value === 'string') {
        const migrated = attemptLegacyMigration(value.value, definition);
        if (migrated) return generateExpressionV2(migrated, definition);
      }
    } else if (typeof value === 'string' && valueType === 'expression') {
      const migrated = attemptLegacyMigration(value, definition);
      if (migrated) return generateExpressionV2(migrated, definition);
    }

    let rawValue = value;
    let type = valueType;
    let dataType = null;

    if (value && typeof value === 'object') {
      rawValue = value.value;
      type = value.valueType || value.sourceType || valueType;
      dataType = value.dataType;
    }

    const raw = text(rawValue).trim();

    if (dataType === 'number') {
      return isNaN(Number(raw)) ? '0' : raw;
    }
    if (dataType === 'boolean') {
      return raw === 'true' ? 'true' : 'false';
    }
    if (dataType === 'null') {
      return 'null';
    }

    if (type === 'number') {
      return isNaN(Number(raw)) ? '0' : raw;
    }
    if (type === 'boolean') {
      return raw === 'true' ? 'true' : 'false';
    }
    if (type === 'null') {
      return 'null';
    }
    if (type === 'string') {
      return jsString(rawValue);
    }
    if (type === 'variable' || type === 'stateValue' || type === 'readValue' || type === 'eventValue' || type === 'loopVariable') {
      if (type === 'stateValue') {
        return `state[${jsString(raw)}]`;
      }
      return raw || "''";
    }

    if (type === 'literal') {
      if (/^(true|false|null|-?\d+(?:\.\d+)?)$/.test(raw)) return raw;
      return jsString(rawValue);
    }

    const knownNames = knownValueNamesV2(definition);
    const baseName = raw.match(/^([a-zA-Z_$][\w$]*)/);
    let result = jsString(rawValue);
    if (knownNames.has(raw) || (baseName && knownNames.has(baseName[1])) || /^(event|sourceElement|state)(\.|\[)/.test(raw)) result = raw || "''";
    else if (/^(true|false|null|-?\d+(?:\.\d+)?)$/.test(raw)) result = raw;
    return result;
  }

  function advancedExpression(value, fallback) {
    const raw = text(value).trim();
    return raw || (fallback === undefined ? "''" : text(fallback));
  }

  function fallbackExpression(value, fallback, explicitExpression) {
    const raw = text(value).trim();
    if (!raw) return fallback === undefined ? "''" : text(fallback);
    if (explicitExpression || /^(?:['"`]|\{|\[|true$|false$|null$|undefined$|-?\d)/.test(raw)) return raw;
    return jsString(raw);
  }

  function advancedResultStatement(operation, expression, declaration) {
    if (!operation.resultName) return `${expression};`;
    return `${declaration || 'const'} ${safeIdentifier(operation.resultName, 'result')} = ${expression};`;
  }

  function advancedTemplateExpression(template, valueExpression) {
    const escaped = text(template, '{{value}}').split('{{value}}').map(part => part
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${'));
    return '`' + escaped.join('${' + valueExpression + '}') + '`';
  }

  function advancedStateSync(expression) {
    const name = text(expression).trim();
    return /^[a-zA-Z_$][\w$]*$/.test(name) ? `\nstate.${name} = ${name};` : '';
  }

  function advancedLocalName(operation, prefix) {
    return safeIdentifier(`${prefix}_${operation.id}`, prefix);
  }

  /* ── B12: حارس المصفوفات ───────────────────────────────────────────────────
     المشكلة: متغيّر حالة ليس مصفوفة (لم يُهيَّأ، أو أُعيدت تسميته) كان يرمي جوّه
     معالج النقر في الموقع المصدَّر — items.push(...) على undefined — فتتوقف بقية
     الأفعال في نفس المعالج.

     الفخ المهم: التغليف الساذج `(Array.isArray(items) ? items : [])` يكسر
     advancedStateSync فوق، لأنها لا تُصدر سطر `state.items = items` إلا لو كان
     التعبير معرِّفًا مجردًا. التغليف يحوّله لتعبير مركّب → تختفي المزامنة بصمت
     ويضيع التعديل من الحالة. لذلك نفصل مسارين:

       • القراءة (find/map/join/length…): لا تستدعي المزامنة أصلًا → التغليف آمن.
       • التعديل (push/pop/sort…): نحرس بشرط ونُبقي اسم المتغير مجردًا كما هو،
         ونمرّر التعبير الأصلي لـ advancedStateSync فتظل المزامنة تعمل بالضبط. */
  function isPlainArrayReference(expression) {
    return /^[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*$/.test(text(expression).trim());
  }

  function safeArrayRead(expression) {
    const raw = text(expression).trim();
    if (!raw) return '[]';
    /* معرِّف أو مسار بسيط: تقييمه مرتين آمن (قراءة بلا آثار جانبية) */
    if (isPlainArrayReference(raw)) return `(Array.isArray(${raw}) ? ${raw} : [])`;
    /* تعبير مركّب قد يستدعي دالة: نقيّمه مرة واحدة فقط */
    return `(() => { const source = ${raw}; return Array.isArray(source) ? source : []; })()`;
  }

  function arrayMutationTarget(expression, operation) {
    const raw = text(expression).trim() || 'items';
    /* المعرِّف يبقى كما هو حتى لا تنكسر advancedStateSync */
    if (isPlainArrayReference(raw)) return { prelude: '', ref: raw };
    const localName = advancedLocalName(operation, 'arrayTarget');
    return { prelude: `const ${localName} = ${raw};\n`, ref: localName };
  }

  function arraySkipWarning(reference, toolId) {
    return ` else { console.warn(${jsString(`Osoos: ${reference} ليست مصفوفة — تم تخطي ${toolId}`)}); }`;
  }

  function advancedTryWarning(toolId, message) {
    const payload = JSON.stringify({ type: 'osoos-e1-warning', toolId, message });
    return `if (window.parent && typeof window.parent.postMessage === 'function') { window.parent.postMessage(${payload}, '*'); }\nconsole.warn(${jsString(message)});`;
  }

  function generateAdvancedOperation(operation, definition, options) {
    const op = normalizeAdvancedOperation(operation, 0);
    if (!op.enabled) return '';
    const descriptor = ADVANCED_TOOLS[op.toolId];
    if (!descriptor) return `// Unknown Osoos advanced tool: ${commentValue(op.toolId)}`;
    const s = op.settings;
    const compilerAliases = {
      'dom.parentElement': 'dom.parent', 'dom.firstElementChild': 'dom.firstChild', 'dom.lastElementChild': 'dom.lastChild',
      'dom.nextElementSibling': 'dom.nextSibling', 'dom.previousElementSibling': 'dom.previousSibling',
      'timer.setTimeout': 'timer.timeout', 'timer.setInterval': 'timer.interval', 'timer.delayedAction': 'timer.delayAction',
      'object.hasProperty': 'object.has'
    };
    const toolId = compilerAliases[op.toolId] || op.toolId;
    const value = advancedExpression(s.value, 'inputValue');

    if (toolId.indexOf('string.') === 0) {
      const base = `String(${value} ?? '')`;
      if (toolId === 'string.length') return advancedResultStatement(op, `${base}.length`);
      if (toolId === 'string.uppercase') return advancedResultStatement(op, `${base}.toUpperCase()`);
      if (toolId === 'string.lowercase') return advancedResultStatement(op, `${base}.toLowerCase()`);
      if (toolId === 'string.trim') return advancedResultStatement(op, `${base}.trim()`);
      if (toolId === 'string.includes') return advancedResultStatement(op, `${base}.includes(${jsString(s.search)})`);
      if (toolId === 'string.startsWith') return advancedResultStatement(op, `${base}.startsWith(${jsString(s.search)})`);
      if (toolId === 'string.endsWith') return advancedResultStatement(op, `${base}.endsWith(${jsString(s.search)})`);
      if (toolId === 'string.replace') return advancedResultStatement(op, `${base}.replace(${jsString(s.search)}, ${jsString(s.replacement)})`);
      if (toolId === 'string.replaceAll') return advancedResultStatement(op, `${base}.replaceAll(${jsString(s.search)}, ${jsString(s.replacement)})`);
      if (toolId === 'string.split') return advancedResultStatement(op, `${base}.split(${jsString(s.separator)})`);
      if (toolId === 'string.slice' || toolId === 'string.substring') {
        const method = toolId.substring('string.'.length);
        const end = advancedExpression(s.end, '');
        const args = end ? `${advancedExpression(s.start, '0')}, ${end}` : advancedExpression(s.start, '0');
        return advancedResultStatement(op, `${base}.${method}(${args})`);
      }
      if (toolId === 'string.charAt') return advancedResultStatement(op, `${base}.charAt(${advancedExpression(s.index, '0')})`);
      if (toolId === 'string.template') return advancedResultStatement(op, advancedTemplateExpression(s.template, value));
    }

    if (toolId.indexOf('math.') === 0) {
      const binary = { 'math.add': '+', 'math.subtract': '-', 'math.multiply': '*', 'math.divide': '/', 'math.modulo': '%' };
      if (binary[toolId]) return advancedResultStatement(op, `Number(${advancedExpression(s.left, '0')}) ${binary[toolId]} Number(${advancedExpression(s.right, '0')})`);
      if (toolId === 'math.increment') return advancedResultStatement(op, `Number(${advancedExpression(s.value, '0')}) + 1`);
      if (toolId === 'math.decrement') return advancedResultStatement(op, `Number(${advancedExpression(s.value, '0')}) - 1`);
      if (toolId === 'math.round' || toolId === 'math.floor' || toolId === 'math.ceil') return advancedResultStatement(op, `Math.${toolId.substring(5)}(Number(${advancedExpression(s.value, '0')}))`);
      if (toolId === 'math.random') return advancedResultStatement(op, 'Math.random()');
      if (toolId === 'math.randomRange') return advancedResultStatement(op, `Math.floor(Math.random() * (Number(${advancedExpression(s.max, '10')}) - Number(${advancedExpression(s.min, '0')}) + 1)) + Number(${advancedExpression(s.min, '0')})`);
      if (toolId === 'math.min' || toolId === 'math.max') return advancedResultStatement(op, `Math.${toolId.substring(5)}(Number(${advancedExpression(s.left, '0')}), Number(${advancedExpression(s.right, '0')}))`);
      if (toolId === 'math.pow') return advancedResultStatement(op, `Math.pow(Number(${advancedExpression(s.base, '2')}), Number(${advancedExpression(s.exponent, '2')}))`);
      if (toolId === 'math.sqrt') return advancedResultStatement(op, `Math.sqrt(Number(${advancedExpression(s.value, '0')}))`);
      if (toolId === 'math.clamp') return advancedResultStatement(op, `Math.min(Math.max(Number(${advancedExpression(s.value, '0')}), Number(${advancedExpression(s.min, '0')})), Number(${advancedExpression(s.max, '100')}))`);
      if (toolId === 'math.number') return advancedResultStatement(op, `Number(${advancedExpression(s.value, '0')})`);
      if (toolId === 'math.parseInt') return advancedResultStatement(op, `Number.parseInt(${advancedExpression(s.value, '0')}, ${advancedExpression(s.radix, '10')})`);
      if (toolId === 'math.parseFloat') return advancedResultStatement(op, `Number.parseFloat(${advancedExpression(s.value, '0')})`);
    }

    if (toolId.indexOf('array.') === 0) {
      const array = advancedExpression(s.array, 'items');
      if (toolId === 'array.create') {
        const name = safeIdentifier(op.resultName, 'items');
        const declaration = s.declaration === 'const' ? 'const' : 'let';
        return `${declaration} ${name} = ${advancedExpression(s.values, '[]')};\nstate.${name} = ${name};`;
      }

      /* B12: مرجع التعديل يبقى مجردًا، والمزامنة تأخذ التعبير الأصلي دائمًا */
      const mutation = arrayMutationTarget(array, op);
      const ref = mutation.ref;
      const sync = advancedStateSync(array);
      const skip = arraySkipWarning(ref, toolId);
      /* مصفوفة القراءة مغلَّفة: عمليات القراءة لا تُزامن الحالة فالتغليف آمن */
      const readArray = safeArrayRead(array);

      /* ── تعديل بلا نتيجة: حراسة بشرط ── */
      if (toolId === 'array.push') return `${mutation.prelude}if (Array.isArray(${ref})) { ${ref}.push(${advancedExpression(s.value, 'inputValue')}); }${skip}${sync}`;
      if (toolId === 'array.unshift') return `${mutation.prelude}if (Array.isArray(${ref})) { ${ref}.unshift(${advancedExpression(s.value, 'inputValue')}); }${skip}${sync}`;
      if (toolId === 'array.sort') return `${mutation.prelude}if (Array.isArray(${ref})) { ${ref}.sort((a, b) => (${advancedExpression(s.compare, 'String(a).localeCompare(String(b))')})); }${skip}${sync}`;
      if (toolId === 'array.reverse') return `${mutation.prelude}if (Array.isArray(${ref})) { ${ref}.reverse(); }${skip}${sync}`;
      if (toolId === 'array.setIndex') return `${mutation.prelude}if (Array.isArray(${ref})) { ${ref}[${advancedExpression(s.index, '0')}] = ${advancedExpression(s.value, 'inputValue')}; }${skip}${sync}`;

      /* ── تعديل بنتيجة: شرط ثلاثي لا كتلة { }، حتى يبقى const في نطاق الخطوات التالية ── */
      if (toolId === 'array.pop' || toolId === 'array.shift') {
        const method = toolId.substring(6);
        return mutation.prelude + advancedResultStatement(op, `(Array.isArray(${ref}) ? ${ref}.${method}() : undefined)`) + sync;
      }
      if (toolId === 'array.splice') {
        const items = text(s.items).trim();
        const expression = `(Array.isArray(${ref}) ? ${ref}.splice(${advancedExpression(s.start, '0')}, ${advancedExpression(s.deleteCount, '1')}${items ? `, ${items}` : ''}) : [])`;
        return mutation.prelude + advancedResultStatement(op, expression) + sync;
      }
      if (toolId === 'array.removeIndex') return mutation.prelude + advancedResultStatement(op, `(Array.isArray(${ref}) ? ${ref}.splice(${advancedExpression(s.index, '0')}, 1) : [])`) + sync;

      /* ── قراءة فقط: تغليف المستقبِل (لا مزامنة هنا أصلًا) ── */
      if (toolId === 'array.find' || toolId === 'array.filter') return advancedResultStatement(op, `${readArray}.${toolId.substring(6)}((item, index) => (${advancedExpression(s.predicate, 'Boolean(item)')}))`);
      if (toolId === 'array.map') return advancedResultStatement(op, `${readArray}.map((item, index) => (${advancedExpression(s.transform, 'item')}))`);
      if (toolId === 'array.forEach') return `${readArray}.forEach((item, index) => {\n${indent(advancedExpression(s.body, 'console.log(item);'), 2)}\n});`;
      if (toolId === 'array.includes') return advancedResultStatement(op, `${readArray}.includes(${advancedExpression(s.value, 'inputValue')})`);
      if (toolId === 'array.indexOf') return advancedResultStatement(op, `${readArray}.indexOf(${advancedExpression(s.value, 'inputValue')})`);
      if (toolId === 'array.concat') return advancedResultStatement(op, `${readArray}.concat(${advancedExpression(s.other, '[]')})`);
      if (toolId === 'array.join') return advancedResultStatement(op, `${readArray}.join(${jsString(s.separator)})`);
      if (toolId === 'array.length') return advancedResultStatement(op, `${readArray}.length`);
      if (toolId === 'array.getIndex') return advancedResultStatement(op, `${readArray}[${advancedExpression(s.index, '0')}]`);
      if (toolId === 'array.renderList') {
        const target = advancedLocalName(op, 'listTarget');
        const child = advancedLocalName(op, 'listItem');
        const tagName = /^(li|div|p|span)$/.test(text(s.tagName)) ? s.tagName : 'li';
        let code = `const ${target} = document.getElementById(${jsString(s.targetId)});\nif (${target}) {\n`;
        if (s.clear) code += `  ${target}.textContent = '';\n`;
        code += `  ${readArray}.forEach((item, index) => {\n    const ${child} = document.createElement(${jsString(tagName)});\n    ${child}.textContent = String(${advancedExpression(s.text, 'item')});\n    ${target}.appendChild(${child});\n  });\n}`;
        return code;
      }
    }

    if (toolId.indexOf('browser.') === 0) {
      if (toolId === 'browser.alert') return `if (typeof window.alert === 'function') { window.alert(${jsString(s.message)}); } else if (typeof alert === 'function') { alert(${jsString(s.message)}); }`;
      if (toolId === 'browser.confirm') return advancedResultStatement(op, `(typeof window.confirm === 'function' ? window.confirm(${jsString(s.message)}) : (typeof confirm === 'function' ? confirm(${jsString(s.message)}) : false))`);
      if (toolId === 'browser.prompt') return advancedResultStatement(op, `(typeof window.prompt === 'function' ? window.prompt(${jsString(s.message)}, ${jsString(s.defaultValue)}) : (typeof prompt === 'function' ? prompt(${jsString(s.message)}, ${jsString(s.defaultValue)}) : null))`);
      if (toolId === 'browser.log') return `console.log(${advancedExpression(s.value, 'inputValue')});`;
      if (toolId === 'browser.open') {
        const tryMode = !!(options && (options.tryMode || options.mode === 'try')) || !!(definition && definition.settings && definition.settings.tryMode);
        if (tryMode) return advancedTryWarning(toolId, `Try Now blocked opening ${s.url}`);
        return `if (typeof window.open === 'function') { window.open(${jsString(s.url)}, ${jsString(s.target)}); }`;
      }
      if (toolId === 'browser.redirect') {
        const tryMode = !!(options && (options.tryMode || options.mode === 'try')) || !!(definition && definition.settings && definition.settings.tryMode);
        if (tryMode) return advancedTryWarning(toolId, `Try Now blocked redirect to ${s.url}`);
        return `if (window.location && typeof window.location.assign === 'function') { window.location.assign(${jsString(s.url)}); } else if (window.location) { window.location.href = ${jsString(s.url)}; }`;
      }
      if (toolId === 'browser.date' || toolId === 'browser.time') {
        const method = toolId === 'browser.date' ? 'toLocaleDateString' : 'toLocaleTimeString';
        return advancedResultStatement(op, `new Date().${method}(${text(s.locale).trim() ? jsString(s.locale) : ''})`);
      }
      if (toolId === 'browser.dateTime') return advancedResultStatement(op, `new Date().toLocaleString(${text(s.locale).trim() ? jsString(s.locale) : ''})`);
      if (toolId === 'browser.clipboard') {
        const navigatorName = advancedLocalName(op, 'clipboardNavigator');
        return `const ${navigatorName} = window.navigator || (typeof navigator !== 'undefined' ? navigator : null);\nif (${navigatorName} && ${navigatorName}.clipboard && typeof ${navigatorName}.clipboard.writeText === 'function') { ${navigatorName}.clipboard.writeText(String(${advancedExpression(s.value, 'inputValue')})); }`;
      }
      if (toolId === 'browser.print') return `if (typeof window.print === 'function') { window.print(); }`;
    }

    if (toolId.indexOf('storage.') === 0) {
      const parts = toolId.split('.');
      const property = parts[1] === 'session' ? 'sessionStorage' : 'localStorage';
      const method = parts[2];
      const storageName = advancedLocalName(op, property);
      const tryMode = !!(options && (options.tryMode || options.mode === 'try')) || !!(definition && definition.settings && definition.settings.tryMode);
      const bucket = property === 'sessionStorage' ? 'session' : 'local';
      const storageExpression = tryMode
        ? `(() => { const stores = window.__osoosTryStorage || (window.__osoosTryStorage = { local: Object.create(null), session: Object.create(null) }); const data = stores.${bucket}; return { setItem(key, value) { data[String(key)] = String(value); }, getItem(key) { key = String(key); return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; }, removeItem(key) { delete data[String(key)]; } }; })()`
        : `(() => { try { return window.${property} || (typeof ${property} !== 'undefined' ? ${property} : null); } catch (error) { return null; } })()`;
      if (method === 'set') {
        const storedValue = s.json ? `JSON.stringify(${advancedExpression(s.value, 'inputValue')})` : `String(${advancedExpression(s.value, 'inputValue')})`;
        return `const ${storageName} = ${storageExpression};\nif (${storageName}) { ${storageName}.setItem(${jsString(s.key)}, ${storedValue}); }`;
      }
      if (method === 'remove') return `const ${storageName} = ${storageExpression};\nif (${storageName}) { ${storageName}.removeItem(${jsString(s.key)}); }`;
      if (method === 'get') {
        const rawName = advancedLocalName(op, 'storedRaw');
        const fallback = advancedExpression(s.fallback, "''");
        let resultExpression = `${rawName} === null ? ${fallback} : ${rawName}`;
        if (s.json) resultExpression = `${rawName} === null ? ${fallback} : (() => { try { return JSON.parse(${rawName}); } catch (error) { return ${fallback}; } })()`;
        return `const ${storageName} = ${storageExpression};\nconst ${rawName} = ${storageName} ? ${storageName}.getItem(${jsString(s.key)}) : null;\n${advancedResultStatement(op, resultExpression)}`;
      }
    }

    if (toolId.indexOf('object.') === 0) {
      const object = advancedExpression(s.object, 'data');
      if (toolId === 'object.create') {
        const name = safeIdentifier(op.resultName, 'data');
        const declaration = s.declaration === 'const' ? 'const' : 'let';
        return `${declaration} ${name} = ${advancedExpression(s.value, '{}')};\nstate.${name} = ${name};`;
      }
      if (toolId === 'object.get') return advancedResultStatement(op, `(${object} == null || !Object.prototype.hasOwnProperty.call(Object(${object}), ${jsString(s.property)}) ? ${advancedExpression(s.fallback, 'undefined')} : ${object}[${jsString(s.property)}])`);
      if (toolId === 'object.set') return `if (${object} != null) { ${object}[${jsString(s.property)}] = ${advancedExpression(s.value, 'inputValue')}; }${advancedStateSync(object)}`;
      if (toolId === 'object.keys') return advancedResultStatement(op, `Object.keys(${object} == null ? {} : Object(${object}))`);
      if (toolId === 'object.values') return advancedResultStatement(op, `Object.values(${object} == null ? {} : Object(${object}))`);
      if (toolId === 'object.has') return advancedResultStatement(op, `(${object} != null && Object.prototype.hasOwnProperty.call(Object(${object}), ${jsString(s.property)}))`);
      if (toolId === 'object.assign') return advancedResultStatement(op, `Object.assign({}, ${object} || {}, ${advancedExpression(s.other, '{}')} || {})`);
      if (toolId === 'object.freeze') return advancedResultStatement(op, `Object.freeze(${object})`);
    }

    if (toolId.indexOf('dom.') === 0) {
      const start = advancedExpression(s.start, 'sourceElement');
      const properties = {
        'dom.parent': 'parentElement', 'dom.children': 'children', 'dom.firstChild': 'firstElementChild',
        'dom.lastChild': 'lastElementChild', 'dom.nextSibling': 'nextElementSibling',
        'dom.previousSibling': 'previousElementSibling', 'dom.childCount': 'childElementCount'
      };
      if (properties[toolId]) return advancedResultStatement(op, `(${start} == null ? ${toolId === 'dom.childCount' ? '0' : 'null'} : ${start}.${properties[toolId]})`);
      if (toolId === 'dom.closest') return advancedResultStatement(op, `(${start} && typeof ${start}.closest === 'function' ? ${start}.closest(${jsString(s.selector)}) : null)`);
      if (toolId === 'dom.querySelector') return advancedResultStatement(op, `(${start} && typeof ${start}.querySelector === 'function' ? ${start}.querySelector(${jsString(s.selector)}) : null)`);
      if (toolId === 'dom.querySelectorAll') return advancedResultStatement(op, `(${start} && typeof ${start}.querySelectorAll === 'function' ? Array.from(${start}.querySelectorAll(${jsString(s.selector)})) : [])`);
      if (toolId === 'dom.findInParent') return advancedResultStatement(op, `(${start} && ${start}.parentElement && typeof ${start}.parentElement.querySelector === 'function' ? ${start}.parentElement.querySelector(${jsString(s.selector)}) : null)`);
    }

    if (toolId.indexOf('timer.') === 0) {
      const delay = `Math.max(0, Number(${advancedExpression(s.delay, '0')}) || 0)`;
      if (toolId === 'timer.timeout' || toolId === 'timer.interval') {
        const method = toolId === 'timer.interval' ? 'setInterval' : 'setTimeout';
        const expression = `${method}(() => {\n${indent(advancedExpression(s.body, '// code'), 2)}\n}, ${delay})`;
        return advancedResultStatement(op, expression);
      }
      if (toolId === 'timer.clearInterval') return `clearInterval(${advancedExpression(s.timer, 'intervalId')});`;
      if (toolId === 'timer.delayAction') return `setTimeout(() => {\n${indent(advancedExpression(s.body, '// action'), 2)}\n}, ${delay});`;
    }

    if (toolId.indexOf('event.') === 0) {
      if (toolId === 'event.dispatch') {
        const target = advancedExpression(s.target, 'sourceElement');
        return `if (${target} && typeof ${target}.dispatchEvent === 'function') { ${target}.dispatchEvent(new CustomEvent(${jsString(s.eventName)}, { detail: ${advancedExpression(s.detail, '{}')} })); }`;
      }
      const eventName = toolId === 'event.custom' ? text(s.eventName, 'osoos:event') : toolId.substring('event.'.length);
      const target = advancedExpression(s.target, eventName === 'resize' ? 'window' : 'sourceElement');
      let body = '';
      if (s.preventDefault) body += `event.preventDefault();\n`;
      if ((eventName === 'keydown' || eventName === 'keyup') && text(s.key).trim()) body += `if (event.key !== ${jsString(s.key)}) { return; }\n`;
      body += advancedExpression(s.body, '// code');
      return `if (${target} && typeof ${target}.addEventListener === 'function') {\n  ${target}.addEventListener(${jsString(eventName)}, (event) => {\n${indent(body, 4)}\n  }, { once: ${s.once === true ? 'true' : 'false'} });\n}`;
    }

    if (toolId === 'function.call') {
      const functionName = safeIdentifier(s.functionName, 'myFunction');
      const invocation = `(typeof window.${functionName} === 'function' ? window.${functionName}(${text(s.arguments).trim()}) : undefined)`;
      return advancedResultStatement(op, s.await ? `Promise.resolve(${invocation})` : invocation);
    }
    if (toolId === 'function.return') return `return ${advancedExpression(s.value, 'undefined')};`;
    if (toolId === 'custom.code') return advancedExpression(s.code, '// custom code');
    return `// Unsupported Osoos advanced tool: ${commentValue(toolId)}`;
  }

  function orderedAdvancedOperations(definition, destination) {
    return definition.advancedOperations
      .map((operation, index) => ({ operation, index }))
      .filter(item => item.operation.enabled && item.operation.destination === destination)
      .sort((left, right) => left.operation.order - right.operation.order || left.index - right.index)
      .map(item => item.operation);
  }

  function generateAdvancedPhaseV3(definition, destination, options) {
    return orderedAdvancedOperations(definition, destination)
      .map(operation => generateAdvancedOperation(operation, definition, options))
      .filter(Boolean)
      .join('\n');
  }

  function previewAdvancedOperation(operation, definition, options) {
    const op = typeof operation === 'string' ? createAdvancedOperation(operation) : operation;
    return generateAdvancedOperation(op, definition || createDefinitionV2('', ''), options);
  }

  function validateAdvancedOperation(operation, index, definition) {
    const normalized = normalizeAdvancedOperation(operation, index || 0);
    const descriptor = ADVANCED_TOOLS[normalized.toolId];
    const errors = [];
    if (!normalized.enabled) return { valid: true, errors, operation: normalized, code: '' };
    if (!descriptor) errors.push(`Unknown advanced tool: ${normalized.toolId || '(empty)'}.`);
    if (descriptor) {
      if (!descriptor.allowedDestinations.includes(normalized.destination)) errors.push(`${descriptor.label} cannot be added to ${normalized.destination}.`);
      descriptor.fields.forEach(field => {
        if (field.required && text(normalized.settings[field.key]).trim() === '') errors.push(`${descriptor.label}: ${field.label} is required.`);
      });
      if (descriptor.producesResult && !normalized.resultName) errors.push(`${descriptor.label} requires a result name.`);
    }
    let code = '';
    if (!errors.length) {
      code = generateAdvancedOperation(normalized, definition || createDefinitionV2('', ''));
      try { new Function(code); } catch (error) { errors.push(`Invalid advanced operation JavaScript: ${error.message}`); }
    }
    return { valid: errors.length === 0, errors, operation: normalized, code };
  }

  function targetExpressionV2(action, definition, options) {
    if (action.targetId) return `document.getElementById(${jsString(action.targetId)})`;
    if (action.target) {
      const kind = action.target.kind || action.target.targetType;
      if (kind === 'loopItem') return resolveLoopItemName(options) || 'item';
      if (kind === 'source') return 'sourceElement';
      if (kind === 'eventTarget') return 'event.target';
      const baseId = action.target.baseId || definition.targetId;
      const base = `document.getElementById(${jsString(baseId)})`;
      if (kind === 'parent') return `${base}?.parentElement`;
      if (kind === 'firstChild' || kind === 'child') return `${base}?.firstElementChild`;
      if (kind === 'lastChild') return `${base}?.lastElementChild`;
      if (kind === 'children') return `${base}?.children`;
      if (kind === 'next') return `${base}?.nextElementSibling`;
      if (kind === 'previous') return `${base}?.previousElementSibling`;
      if (kind === 'closest') return `${base}?.closest(${jsString(action.target.selector)})`;
      if (kind === 'querySelector') return `${base}?.querySelector(${jsString(action.target.selector)})`;
      if (kind === 'document') return 'document';
      if (kind === 'window') return 'window';
      if (kind === 'element' && action.target.id) return `document.getElementById(${jsString(action.target.id)})`;
      return base;
    }
    if (definition.targetId) return `document.getElementById(${jsString(definition.targetId)})`;
    return 'null';
  }

  function variableInitialExpressionV2(variable) {
    const raw = text(variable.initialValue).trim();
    if (variable.type === 'Array') {
      try { return Array.isArray(JSON.parse(raw)) ? raw : '[]'; } catch (error) { return '[]'; }
    }
    if (variable.type === 'Object') {
      try { const parsed = JSON.parse(raw); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? raw : '{}'; } catch (error) { return '{}'; }
    }
    if (variable.type === 'Set') {
      try { const parsed = JSON.parse(raw || '[]'); return `new Set(${JSON.stringify(Array.isArray(parsed) ? parsed : [])})`; } catch (error) { return 'new Set()'; }
    }
    if (variable.type === 'String') {
      if (/^(['"`]).*\1$/s.test(raw)) return raw;
      return jsString(raw);
    }
    if (variable.type === 'Boolean') return raw === 'true' ? 'true' : 'false';
    if (variable.type === 'Date') {
      if (!raw) return 'new Date()';
      return `new Date(${/^(['"`]).*\1$/s.test(raw) || /^-?\d+$/.test(raw) ? raw : jsString(raw)})`;
    }
    if (variable.type === 'Storage') {
      const settings = variable.settings || {};
      const property = settings.storageType === 'session' ? 'sessionStorage' : 'localStorage';
      const fallback = advancedExpression(settings.fallback || raw, "''");
      const storage = generatedStorageAccessor(property);
      const read = `(() => { const storage = ${storage}; return storage ? storage.getItem(${jsString(settings.key || variable.name)}) : null; })()`;
      if (settings.json) return `(() => { const raw = ${read}; if (raw === null) return ${fallback}; try { return JSON.parse(raw); } catch (error) { return ${fallback}; } })()`;
      return `(${read} ?? ${fallback})`;
    }
    return Number.isFinite(Number(raw)) ? String(Number(raw)) : '0';
  }

  function generateVariablesV2(definition, scope) {
    const requestedScope = scope || 'outsideEvent';
    return definition.state.map((variable, index) => ({ variable, index }))
      .filter(item => item.variable.enabled !== false && item.variable.scope === requestedScope)
      .sort((a, b) => a.variable.order - b.variable.order || a.index - b.index)
      .map(item => {
      const variable = item.variable;
      const name = safeIdentifier(variable.name, 'value');
      const declaration = variable.declaration === 'const' ? 'const' : 'let';
      return `${declaration} ${name} = ${variableInitialExpressionV2(variable)};\nstate.${name} = ${name};`;
    }).join('\n');
  }

  function generateReadsSetupV2(definition) {
    const setup = [];
    const elementTypes = new Set(['inputValue', 'selectValue', 'textareaValue', 'checked', 'radioValue', 'textContent', 'innerText', 'innerHTML', 'attribute', 'dataAttribute', 'hasClass', 'styleProperty', 'childCount']);
    definition.reads.filter(read => read.enabled !== false).sort((a, b) => a.order - b.order).forEach((read, index) => {
      if (!elementTypes.has(read.type) || (read.type === 'radioValue' && !read.elementId)) return;
      setup.push(`const readElement${index + 1} = document.getElementById(${jsString(read.elementId || definition.sourceId)});`);
    });
    return setup.join('\n');
  }

  function readStorageExpression(read, property) {
    const settings = read.settings || {};
    const fallback = advancedExpression(settings.fallback, "''");
    const storage = `(() => { try { return window.${property} || null; } catch (error) { return null; } })()`;
    const raw = `(() => { const storage = ${storage}; return storage ? storage.getItem(${jsString(settings.key || '')}) : null; })()`;
    if (settings.json === true || settings.json === 'true') return `(() => { const raw = ${raw}; if (raw === null) return ${fallback}; try { return JSON.parse(raw); } catch (error) { return ${fallback}; } })()`;
    return `(${raw} ?? ${fallback})`;
  }

  function readExpressionV3(read, elementName, definition) {
    const settings = read.settings || {};
    const name = safeIdentifier(settings.name, 'value');
    let expression;
    if (read.type === 'sourceValue') expression = 'sourceElement.value';
    else if (read.type === 'sourceTextContent') expression = 'sourceElement.textContent';
    else if (read.type === 'sourceInnerText') expression = 'sourceElement.innerText';
    else if (read.type === 'sourceInnerHTML') expression = 'sourceElement.innerHTML';
    else if (['inputValue', 'selectValue', 'textareaValue'].includes(read.type)) expression = `${elementName}.value`;
    else if (read.type === 'checked') expression = `Boolean(${elementName}.checked)`;
    else if (read.type === 'radioValue') {
      expression = read.elementId
        ? `(${elementName}.checked ? ${elementName}.value : null)`
        : `(document.querySelector(${jsString(`input[name="${text(settings.name).replace(/["\\]/g, '\\$&')}"]:checked`)})?.value ?? null)`;
    } else if (read.type === 'textContent') expression = `${elementName}.textContent`;
    else if (read.type === 'innerText') expression = `${elementName}.innerText`;
    else if (read.type === 'innerHTML') expression = `${elementName}.innerHTML`;
    else if (read.type === 'attribute') expression = `${elementName}.getAttribute(${jsString(settings.attribute || settings.name || '')})`;
    else if (read.type === 'dataAttribute') expression = `${elementName}.dataset[${jsString(settings.key || '')}]`;
    else if (read.type === 'hasClass') expression = `${elementName}.classList.contains(${jsString(settings.className || '')})`;
    else if (read.type === 'styleProperty') expression = `(${elementName}.style[${jsString(settings.property || '')}] || (typeof getComputedStyle === 'function' ? getComputedStyle(${elementName})[${jsString(settings.property || '')}] : ''))`;
    else if (read.type === 'childCount') expression = `Number(${elementName}.childElementCount !== undefined ? ${elementName}.childElementCount : (${elementName}.children || []).length)`;
    else if (read.type === 'eventTarget') expression = 'event.target';
    else if (read.type === 'eventTargetValue') expression = 'event.target && event.target.value';
    else if (['stateValue', 'counterValue', 'booleanValue', 'arrayValue'].includes(read.type)) expression = `state[${jsString(settings.name || name)}]`;
    else if (read.type === 'arrayItem') expression = `(state[${jsString(settings.name || name)}] || [])[${advancedExpression(settings.index, '0')}]`;
    else if (read.type === 'arrayLength') expression = `(state[${jsString(settings.name || name)}] || []).length`;
    else if (read.type === 'objectProperty') expression = `(state[${jsString(settings.name || name)}] || {})[${jsString(settings.property || '')}]`;
    else if (read.type === 'localStorage') expression = readStorageExpression(read, 'localStorage');
    else if (read.type === 'sessionStorage') expression = readStorageExpression(read, 'sessionStorage');
    else if (read.type === 'functionResult') {
      const functionName = safeIdentifier(settings.functionName, 'myFunction');
      const invocation = `(typeof window.${functionName} === 'function' ? window.${functionName}(${text(settings.arguments).trim()}) : undefined)`;
      expression = settings.await ? `await Promise.resolve(${invocation})` : invocation;
    } else if (read.type === 'browserUrl') expression = `(window.location ? window.location.href : '')`;
    else if (read.type === 'queryParameter') expression = `new URLSearchParams(window.location && window.location.search ? window.location.search : '').get(${jsString(settings.key || '')})`;
    else if (read.type === 'viewportWidth') expression = `Number(window.innerWidth || 0)`;
    else if (read.type === 'viewportHeight') expression = `Number(window.innerHeight || 0)`;
    else if (read.type === 'scrollX') expression = `Number(window.scrollX || window.pageXOffset || 0)`;
    else if (read.type === 'scrollY') expression = `Number(window.scrollY || window.pageYOffset || 0)`;
    else if (read.type === 'currentTime') expression = `new Date().toLocaleTimeString(${text(settings.locale).trim() ? jsString(settings.locale) : ''})`;
    else if (read.type === 'currentDate') expression = `new Date().toLocaleDateString(${text(settings.locale).trim() ? jsString(settings.locale) : ''})`;
    else expression = 'undefined';
    if (settings.trim === true || settings.trim === 'true') expression = `String(${expression} ?? '').trim()`;
    return expression;
  }

  function generateReadsBodyV2(definition) {
    const elementReadTypes = new Set(['inputValue', 'selectValue', 'textareaValue', 'checked', 'radioValue', 'textContent', 'innerText', 'innerHTML', 'attribute', 'dataAttribute', 'hasClass', 'styleProperty', 'childCount']);
    const readFallback = read => {
      const readMode = read.settings ? (read.settings.readMode || read.settings.type) : null;
      if (readMode === 'number' || readMode === 'valueAsNumber' || read.type === 'childCount') return '0';
      if (read.type === 'checked' || read.type === 'hasClass') return 'false';
      return "''";
    };
    return definition.reads.filter(read => read.enabled !== false).sort((a, b) => a.order - b.order).map((read, index) => {
      const name = safeIdentifier(read.name, `value${index + 1}`);
      const elementName = `readElement${index + 1}`;
      const expression = readExpressionV3(read, elementName, definition);
      /* عنصر القراءة قد يختفي أو يتبدل بعد التحميل — قيمة آمنة بدل تعطيل التفاعل كله */
      if (elementReadTypes.has(read.type) && !(read.type === 'radioValue' && !read.elementId)) {
        return `const ${name} = ${elementName} ? (${expression}) : ${readFallback(read)};`;
      }
      return `const ${name} = ${expression};`;
    }).join('\n');
  }

  function attemptLegacyMigration(str, definition) {
    const s = text(str).trim();
    if (!s) return null;

    const unaryMatch = s.match(/^!\s*([a-zA-Z_$][\w$]*)$/);
    if (unaryMatch) {
      return {
        id: makeId('expr'),
        type: 'unary',
        operator: '!',
        argument: { id: makeId('expr'), type: 'reference', referenceType: 'state', name: unaryMatch[1] }
      };
    }

    const compRegex = /^([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\s*(===|!==|>=|<=|>|<)\s*(.+)$/;
    const compMatch = s.match(compRegex);
    if (compMatch) {
      const leftStr = compMatch[1];
      const op = compMatch[2];
      const rightStr = compMatch[3].trim();
      
      let leftNode;
      if (leftStr.includes('.')) {
        const parts = leftStr.split('.');
        leftNode = {
          id: makeId('expr'),
          type: 'property',
          object: { id: makeId('expr'), type: 'reference', referenceType: 'loopVariable', name: parts[0] },
          property: parts[1],
          optional: false,
          accessMode: 'strict'
        };
      } else {
        leftNode = { id: makeId('expr'), type: 'reference', referenceType: 'state', name: leftStr };
      }

      let rightNode = null;
      if (/^(true|false)$/.test(rightStr)) {
        rightNode = { id: makeId('expr'), type: 'literal', dataType: 'boolean', value: rightStr === 'true' };
      } else if (/^null$/.test(rightStr)) {
        rightNode = { id: makeId('expr'), type: 'literal', dataType: 'null', value: null };
      } else if (/^-?\d+(?:\.\d+)?$/.test(rightStr)) {
        rightNode = { id: makeId('expr'), type: 'literal', dataType: 'number', value: Number(rightStr) };
      } else {
        const strMatch = rightStr.match(/^['"](.*)['"]$/);
        if (strMatch) {
          rightNode = { id: makeId('expr'), type: 'literal', dataType: 'string', value: strMatch[1] };
        }
      }

      if (rightNode) {
        return {
          id: makeId('expr'),
          type: 'binary',
          operator: op,
          left: leftNode,
          right: rightNode
        };
      }
    }

    return {
      id: makeId('expr'),
      type: 'legacyExpression',
      raw: s,
      readOnly: true,
      migrationStatus: 'manual-rebuild-required'
    };
  }

  function migrateDefinitionToExpressionV2(definition) {
    if (!definition) return null;
    const cloned = clone(definition);
    try {
      cloned.schemaVersion = 10;
      
      if (Array.isArray(cloned.reads)) {
        cloned.reads = cloned.reads.map(normalizeReadV2);
      }
      
      if (Array.isArray(cloned.state)) {
        cloned.state = cloned.state.map(normalizeVariableV2);
      } else if (Array.isArray(cloned.variables)) {
        cloned.state = cloned.variables.map(normalizeVariableV2);
        delete cloned.variables;
      }
      
      const migrateActions = (actions) => {
        if (!Array.isArray(actions)) return;
        actions.forEach(action => {
          if (!action) return;
          
          if (action.valueType === 'expression' && typeof action.value === 'string') {
            action.value = attemptLegacyMigration(action.value, cloned);
            action.valueType = 'expression';
          } else if (action.value && typeof action.value === 'object') {
            action.value = normalizeExpressionV2(action.value);
          }
          
          if (Array.isArray(action.branches)) {
            action.branches.forEach(branch => {
              if (branch.condition) {
                branch.condition = mapConditionToExpressionAST(branch.condition);
              }
              migrateActions(branch.actions);
            });
          }
          
          if (action.type === 'loop') {
            if (action.loopType === 'while' && action.condition) {
              action.condition = mapConditionToExpressionAST(action.condition);
            }
            if (action.count && (action.count.sourceType === 'expression' || action.count.valueType === 'expression') && typeof action.count.value === 'string') {
              action.count.value = attemptLegacyMigration(action.count.value, cloned);
              action.count.sourceType = 'expression';
            }
            if (action.startAt && (action.startAt.sourceType === 'expression' || action.startAt.valueType === 'expression') && typeof action.startAt.value === 'string') {
              action.startAt.value = attemptLegacyMigration(action.startAt.value, cloned);
              action.startAt.sourceType = 'expression';
            }
            migrateActions(action.actions);
          }
        });
      };
      
      migrateActions(cloned.actions);
      
      const validation = validateDefinitionV2(cloned);
      if (validation && validation.errors && validation.errors.length > 0) {
        const hasSchemaError = validation.errors.some(err => err.type === 'schema');
        if (hasSchemaError) {
          throw new Error("فشل التحقق من المخطط بعد الترحيل.");
        }
      }
      
      return cloned;
    } catch (e) {
      console.warn("Migration to V10 failed, falling back to original definition:", e);
      return definition;
    }
  }

  function mapConditionToExpressionAST(condition) {
    if (!condition) return null;
    if (condition.isVisualExpression === true || condition.isVisualExpression === 'true') {
      return condition.left;
    }
    const op = condition.operator;
    const leftNode = condition.left;
    const rightNode = condition.right;

    function wrapVal(val, valType) {
      if (val && typeof val === 'object' && ['literal', 'reference', 'property', 'binary', 'logical', 'unary', 'group', 'preset'].includes(val.type)) {
        return val;
      }
      if (valType === 'literal') {
        if (/^(true|false)$/.test(val)) return { type: 'literal', dataType: 'boolean', value: val === 'true' };
        if (/^-?\d+(?:\.\d+)?$/.test(val)) return { type: 'literal', dataType: 'number', value: Number(val) };
        return { type: 'literal', dataType: 'string', value: String(val) };
      }
      return { type: 'reference', referenceType: 'state', name: String(val) };
    }

    const L = wrapVal(leftNode, 'expression');
    const R = wrapVal(rightNode, condition.rightType || 'literal');

    switch (op) {
      case 'isEmpty':
        return { type: 'preset', presetType: 'empty', arguments: [L] };
      case 'notEmpty':
        return { type: 'preset', presetType: 'notEmpty', arguments: [L] };
      case 'includes':
        return { type: 'preset', presetType: 'contains', arguments: [L, R] };
      case 'notIncludes':
        return { type: 'preset', presetType: 'notContains', arguments: [L, R] };
      case 'startsWith':
        return { type: 'preset', presetType: 'startsWith', arguments: [L, R] };
      case 'endsWith':
        return { type: 'preset', presetType: 'endsWith', arguments: [L, R] };
      case 'lengthGreater':
        return { type: 'binary', operator: '>', left: { type: 'preset', presetType: 'length', arguments: [L] }, right: R };
      case 'lengthLess':
        return { type: 'binary', operator: '<', left: { type: 'preset', presetType: 'length', arguments: [L] }, right: R };
      case 'isTrue':
        return { type: 'binary', operator: '===', left: L, right: { type: 'literal', dataType: 'boolean', value: true } };
      case 'isFalse':
        return { type: 'binary', operator: '===', left: L, right: { type: 'literal', dataType: 'boolean', value: false } };
      case 'isNull':
        return { type: 'binary', operator: '===', left: L, right: { type: 'literal', dataType: 'null', value: null } };
      case 'isUndefined':
        return { type: 'preset', presetType: 'notExists', arguments: [L] };
      case 'arrayEmpty':
        return { type: 'preset', presetType: 'arrayEmpty', arguments: [L] };
      case 'arrayNotEmpty':
        return { type: 'preset', presetType: 'arrayNotEmpty', arguments: [L] };
      case 'arrayLengthEquals':
        return { type: 'binary', operator: '===', left: { type: 'preset', presetType: 'arrayLength', arguments: [L] }, right: R };

      default:
        if (['===', '!==', '>', '<', '>=', '<='].includes(op)) {
          return { type: 'binary', operator: op, left: L, right: R };
        }
        return null;
    }
  }

  function conditionExpressionV2(condition, definition) {
    const ast = mapConditionToExpressionAST(condition);
    if (ast) {
      return generateExpressionV2(ast, definition);
    }
    const left = valueExpressionV2(condition.left, 'expression', definition);
    const right = valueExpressionV2(condition.right, condition.rightType, definition);
    const settings = condition.settings || {};
    if (condition.operator === 'notEmpty') return `String(${left} ?? '').trim() !== ''`;
    if (condition.operator === 'isEmpty') return `String(${left} ?? '').trim() === ''`;
    if (condition.operator === 'includes') return `String(${left}).includes(${right})`;
    if (condition.operator === 'notIncludes') return `!String(${left}).includes(${right})`;
    if (condition.operator === 'startsWith') return `String(${left}).startsWith(${right})`;
    if (condition.operator === 'endsWith') return `String(${left}).endsWith(${right})`;
    if (condition.operator === 'lengthGreater') return `String(${left}).length > Number(${right})`;
    if (condition.operator === 'lengthLess') return `String(${left}).length < Number(${right})`;
    if (condition.operator === 'regex') return `new RegExp(${jsString(settings.pattern || condition.right)}, ${jsString(settings.flags || '')}).test(String(${left}))`;
    if (condition.operator === 'hasClass') return `Boolean(${left} && ${left}.classList && ${left}.classList.contains(${jsString(settings.className || condition.right)}))`;
    if (condition.operator === 'notHasClass') return `!(${left} && ${left}.classList && ${left}.classList.contains(${jsString(settings.className || condition.right)}))`;
    if (condition.operator === 'visible') return `Boolean(${left} && !${left}.hidden && (!${left}.style || ${left}.style.display !== 'none'))`;
    if (condition.operator === 'hidden') return `Boolean(!${left} || ${left}.hidden || (${left}.style && ${left}.style.display === 'none'))`;
    if (condition.operator === 'disabled') return `Boolean(${left} && ${left}.disabled)`;
    if (condition.operator === 'checked' || condition.operator === 'isChecked') return `Boolean(${left} && (${left}.checked !== undefined ? ${left}.checked : ${left}))`;
    if (condition.operator === 'focused') return `Boolean(${left} && document.activeElement === ${left})`;
    if (condition.operator === 'hasChildren') return `Boolean(${left} && (Number(${left}.childElementCount) || (${left}.children || []).length))`;
    if (condition.operator === 'hasAttribute') return `Boolean(${left} && typeof ${left}.hasAttribute === 'function' && ${left}.hasAttribute(${jsString(settings.attribute || condition.right)}))`;
    if (condition.operator === 'arrayIncludes') return `Array.isArray(${left}) && ${left}.includes(${right})`;
    if (condition.operator === 'arrayNotIncludes') return `Array.isArray(${left}) && !${left}.includes(${right})`;
    if (condition.operator === 'arrayEmpty') return `Array.isArray(${left}) && ${left}.length === 0`;
    if (condition.operator === 'arrayNotEmpty') return `Array.isArray(${left}) && ${left}.length > 0`;
    if (condition.operator === 'arrayLengthEquals') return `Array.isArray(${left}) && ${left}.length === Number(${right})`;
    if (condition.operator === 'arraySome') return `Array.isArray(${left}) && ${left}.some((item, index) => (${advancedExpression(settings.predicate || condition.right, 'Boolean(item)')}))`;
    if (condition.operator === 'isTrue') return `${left} === true`;
    if (condition.operator === 'isFalse') return `${left} === false`;
    if (condition.operator === 'storageHasKey') {
      const property = settings.storageType === 'session' ? 'sessionStorage' : 'localStorage';
      return `(() => { try { return Boolean(window.${property} && window.${property}.getItem(${jsString(settings.key || condition.right)}) !== null); } catch (error) { return false; } })()`;
    }
    if (condition.operator === 'variableExists') {
      const identifier = safeIdentifier(condition.left, 'value');
      return `typeof ${identifier} !== 'undefined'`;
    }
    if (condition.operator === 'isNull') return `${left} === null`;
    if (condition.operator === 'isUndefined') return `typeof ${left} === 'undefined'`;
    if (['===', '!==', '>', '<', '>=', '<='].includes(condition.operator)) return `${left} ${condition.operator} ${right}`;
    return 'false';
  }

  function conditionsExpressionV2(definition) {
    const ordered = definition.conditions
      .map((condition, index) => ({ condition, index }))
      .filter(item => item.condition.enabled !== false)
      .sort((a, b) => a.condition.order - b.condition.order || a.index - b.index)
      .map(item => item.condition);
    if (!ordered.some(condition => condition.groupId)) return ordered.map((condition, index) => {
      const join = index === 0 ? '' : (condition.join === 'OR' ? ' || ' : ' && ');
      return `${join}(${conditionExpressionV2(condition, definition)})`;
    }).join('');
    const groups = new Map();
    const units = [];
    ordered.forEach((condition, index) => {
      if (!condition.groupId) {
        units.push({ order: condition.order, index, join: condition.join, expression: `(${conditionExpressionV2(condition, definition)})` });
        return;
      }
      if (!groups.has(condition.groupId)) {
        const groupDefinition = (definition.conditionGroups || []).find(group => group.id === condition.groupId);
        const unit = { order: groupDefinition ? groupDefinition.order : condition.order, index, join: groupDefinition ? groupDefinition.join : condition.groupJoin, conditions: [] };
        groups.set(condition.groupId, unit); units.push(unit);
      }
      groups.get(condition.groupId).conditions.push(condition);
    });
    units.forEach(unit => {
      if (!unit.conditions) return;
      unit.expression = '(' + unit.conditions.map((condition, index) => `${index ? (condition.join === 'OR' ? ' || ' : ' && ') : ''}(${conditionExpressionV2(condition, definition)})`).join('') + ')';
    });
    return units.sort((a, b) => a.order - b.order || a.index - b.index).map((unit, index) => `${index ? (unit.join === 'OR' ? ' || ' : ' && ') : ''}${unit.expression}`).join('');
  }

  function actionValueExpressionV3(action, definition, options) {
    const source = action.valueSource && typeof action.valueSource === 'object' ? action.valueSource : null;
    if (!source) return valueExpressionV2(action.value, action.valueType, definition);
    const raw = source.value !== undefined ? source.value : (source.name !== undefined ? source.name : action.value);
    if (source.kind === 'literal' || source.kind === 'text') return jsString(raw);
    if (source.kind === 'state') return `state[${jsString(source.name || raw)}]`;
    if (source.kind === 'element') {
      const element = `document.getElementById(${jsString(source.elementId || source.id || '')})`;
      const property = /^[a-zA-Z_$][\w$]*$/.test(text(source.property)) ? source.property : 'value';
      return `${element}?.${property}`;
    }
    if (source.kind === 'expression' || source.kind === 'read' || source.kind === 'functionResult') {
      return source.inferred ? valueExpressionV2(raw, 'expression', definition) : advancedExpression(raw, "''");
    }
    if (source.kind === 'loopVariable') {
      return source.variableName || raw;
    }
    if (source.kind === 'loopItem') {
      return resolveLoopItemName(options) || 'item';
    }
    return advancedExpression(raw, "''");
  }

  function styleAccessor(targetName, property) {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(property) ? `${targetName}.style.${property}` : `${targetName}.style[${jsString(property)}]`;
  }

  function generatedStorageAccessor(property) {
    return `(() => { try { return window.${property} || (typeof ${property} !== 'undefined' ? ${property} : null); } catch (error) { return null; } })()`;
  }

  function generateActionBodyV2(action, targetName, definition, options) {
    const params = Object.assign({}, action.settings || {}, action.params || {});
    const value = actionValueExpressionV3(action, definition, options);
    if (action.type === 'loop') {
      return generateLoopActionV2(action, definition, options);
    }
    if (action.type === 'branch') {
      const branchCodes = [];
      (action.branches || []).forEach((br, brIdx) => {
        if (br.branchType === 'if' || br.branchType === 'elseIf') {
          const subDef = Object.assign({}, definition, { conditions: br.condition ? br.condition.conditions || [] : [], conditionGroups: br.condition ? br.condition.conditionGroups || [] : [] });
          const condExpr = conditionsExpressionV2(subDef) || 'true';
          const subActionsCode = generateActionsV2(definition, br.actions, options);
          const keyword = br.branchType === 'if' ? 'if' : 'else if';
          branchCodes.push(`${keyword} (${condExpr}) {\n${indent(subActionsCode || '// لا توجد إجراءات', 2)}\n}`);
        } else if (br.branchType === 'else') {
          const subActionsCode = generateActionsV2(definition, br.actions, options);
          branchCodes.push(`else {\n${indent(subActionsCode || '// لا توجد إجراءات', 2)}\n}`);
        }
      });
      return branchCodes.join(' ');
    }
    if (action.type === 'setText') {
      /* whitelist: params تأتي من metadata قابلة للتحرير ولا يجوز حقنها في موضع عضو */
      const requestedMethod = text(params.method);
      const method = ['textContent', 'innerText', 'innerHTML'].includes(requestedMethod) ? requestedMethod : 'textContent';
      return `${targetName}.${method} = ${value};`;
    }
    if (action.type === 'setInnerText') return `${targetName}.innerText = ${value};`;
    if (action.type === 'setHTML') return `${targetName}.innerHTML = ${value};`;
    if (action.type === 'appendText') return `${targetName}.textContent += String(${value} ?? '');`;
    if (action.type === 'clearText') return `${targetName}.textContent = '';`;
    if (action.type === 'copyValue') {
      const source = `document.getElementById(${jsString(params.sourceId || '')})`;
      const property = params.property === 'textContent' || params.property === 'innerHTML' ? params.property : 'value';
      return `const copySource = ${source};\nif (copySource) { ${targetName}.${property} = copySource.${property}; }`;
    }
    if (action.type === 'setStyle') {
      const property = text(params.property, 'color').replace(/[^a-zA-Z-]/g, '') || 'color';
      const rawStyleValue = text(params.styleValue).trim();
      /* قيمة CSS تُكتب غالباً نصاً مباشراً (none / red / 16px) فتُقتبس كسلسلة؛
         وتُعامل كتعبير فقط إذا طابقت اسم قراءة/متغير معروفاً أو كانت مقتبسة يدوياً. */
      let styleValue;
      if (!rawStyleValue) styleValue = value; /* توافق مع تفاعلات قديمة ملأت خانة القيمة العامة */
      else if (knownValueNamesV2(definition).has(rawStyleValue)) styleValue = rawStyleValue;
      else if (/^['"].*['"]$/.test(rawStyleValue)) styleValue = valueExpressionV2(rawStyleValue, 'expression', definition);
      else styleValue = jsString(rawStyleValue);
      return `${styleAccessor(targetName, property)} = ${styleValue};`;
    }
    const styleActions = { setColor: 'color', setBackground: 'background', setWidth: 'width', setHeight: 'height', setOpacity: 'opacity', setTransform: 'transform' };
    if (styleActions[action.type]) return `${styleAccessor(targetName, styleActions[action.type])} = String(${value});`;
    if (action.type === 'removeStyle') return `${targetName}.style.removeProperty(${jsString(params.property || '')});`;
    if (action.type === 'addClass') return `${targetName}.classList.add(${jsString(text(params.className, 'active').trim())});`;
    if (action.type === 'removeClass') return `${targetName}.classList.remove(${jsString(text(params.className, 'active').trim())});`;
    if (action.type === 'toggleClass') return `${targetName}.classList.toggle(${jsString(text(params.className, 'active').trim())});`;
    if (action.type === 'show') return `${targetName}.hidden = false;\n${targetName}.style.display = ${jsString(params.display || '')};`;
    if (action.type === 'hide') return `${targetName}.hidden = true;`;
    if (action.type === 'toggleVisibility') {
      if (params.method === 'class') return `${targetName}.classList.toggle(${jsString(params.className || 'open')});`;
      if (params.method === 'display') return `${targetName}.style.display = ${targetName}.style.display === 'none' ? '' : 'none';`;
      return `${targetName}.hidden = !${targetName}.hidden;`;
    }
    if (action.type === 'toggleHidden') return `${targetName}.hidden = !${targetName}.hidden;`;
    if (action.type === 'toggleDisplay') return `${targetName}.style.display = ${targetName}.style.display === 'none' ? ${jsString(params.display || '')} : 'none';`;
    if (action.type === 'openElement') return `${targetName}.hidden = false;\n${targetName}.setAttribute && ${targetName}.setAttribute('aria-expanded', 'true');`;
    if (action.type === 'closeElement') return `${targetName}.hidden = true;\n${targetName}.setAttribute && ${targetName}.setAttribute('aria-expanded', 'false');`;
    if (action.type === 'disable') return `${targetName}.disabled = true;`;
    if (action.type === 'enable') return `${targetName}.disabled = false;`;
    if (action.type === 'clearInput') return `${targetName}.value = '';`;
    if (action.type === 'setInputValue') return `${targetName}.value = ${value};`;
    if (['appendListItem', 'appendElement', 'createElement', 'prepend', 'append', 'insertBefore', 'insertAfter', 'createCard'].includes(action.type)) {
      const tag = action.type === 'appendListItem' ? 'li' : (action.type === 'createCard' ? 'article' : (text(params.tag || params.tagName, 'div').replace(/[^a-zA-Z0-9-]/g, '') || 'div'));
      let code = `const newElement = document.createElement(${jsString(tag)});\nnewElement.textContent = ${value};\n${targetName}.appendChild(newElement);`;
      if (params.html) code = `const newElement = document.createElement(${jsString(tag)});\nnewElement.innerHTML = ${jsString(params.html)};\n${targetName}.appendChild(newElement);`;
      if (params.className) code = code.replace(`${targetName}.appendChild(newElement);`, `newElement.className = ${jsString(params.className)};\n${targetName}.appendChild(newElement);`);
      if (action.type === 'prepend') code = code.replace(`${targetName}.appendChild(newElement);`, `if (typeof ${targetName}.prepend === 'function') { ${targetName}.prepend(newElement); } else { ${targetName}.insertBefore(newElement, ${targetName}.firstChild); }`);
      if (action.type === 'insertBefore') code = code.replace(`${targetName}.appendChild(newElement);`, `${targetName}.parentNode && ${targetName}.parentNode.insertBefore(newElement, ${targetName});`);
      if (action.type === 'insertAfter') code = code.replace(`${targetName}.appendChild(newElement);`, `${targetName}.parentNode && ${targetName}.parentNode.insertBefore(newElement, ${targetName}.nextSibling);`);
      if (params.arrayName) {
        const arrayName = safeIdentifier(params.arrayName, 'items');
        code = `${arrayName}.push(${value});\nstate.${arrayName} = ${arrayName};\n` + code;
      }
      return code;
    }
    if (action.type === 'removeElement') return `${targetName}.remove();`;
    if (action.type === 'cloneElement') return `const clonedElement = ${targetName}.cloneNode(${params.deep !== false ? 'true' : 'false'});\nif (${targetName}.parentNode) { ${targetName}.parentNode.insertBefore(clonedElement, ${targetName}.nextSibling); }`;
    if (action.type === 'clearElement') return `${targetName}.replaceChildren ? ${targetName}.replaceChildren() : (${targetName}.textContent = '');`;
    if (action.type === 'setAttribute') return `${targetName}.setAttribute(${jsString(params.name || params.attribute || '')}, String(${value}));`;
    if (action.type === 'removeAttribute') return `${targetName}.removeAttribute(${jsString(params.name || params.attribute || '')});`;
    if (action.type === 'setSrc') {
      let code = `${targetName}.setAttribute('src', String(${value}));`;
      if (params.alt) {
        const altVal = valueExpressionV2(params.alt, params.altType || 'literal', definition);
        code += `\n  ${targetName}.setAttribute('alt', String(${altVal}));`;
      }
      return code;
    }
    if (action.type === 'setHref') {
      let code = `${targetName}.setAttribute('href', String(${value}));`;
      if (params.text) {
        const textVal = valueExpressionV2(params.text, params.textType || 'literal', definition);
        code += `\n  ${targetName}.textContent = String(${textVal});`;
      }
      if (params.target) {
        const targetVal = valueExpressionV2(params.target, params.targetType || 'literal', definition);
        code += `\n  ${targetName}.setAttribute('target', String(${targetVal}));`;
      }
      if (params.rel) {
        const relVal = valueExpressionV2(params.rel, params.relType || 'literal', definition);
        code += `\n  ${targetName}.setAttribute('rel', String(${relVal}));`;
      }
      return code;
    }
    if (action.type === 'setLinkText') return `${targetName}.textContent = String(${value});`;
    if (action.type === 'setTarget') return `${targetName}.setAttribute('target', String(${value}));`;
    if (action.type === 'setRel') return `${targetName}.setAttribute('rel', String(${value}));`;
    const attributeActions = { setAlt: 'alt', setPlaceholder: 'placeholder' };
    if (attributeActions[action.type]) return `${targetName}.setAttribute(${jsString(attributeActions[action.type])}, String(${value}));`;
    if (action.type === 'setDataAttribute') return `${targetName}.dataset[${jsString(params.key || '')}] = String(${value});`;
    if (action.type === 'setVariable') {
      const name = safeIdentifier(params.variableName || params.name, 'value');
      return `${name} = ${value};\nstate.${name} = ${name};`;
    }
    if (action.type === 'incrementVariable' || action.type === 'decrementVariable') {
      const name = safeIdentifier(params.variableName, 'counter');
      const step = Number.isFinite(Number(params.step)) ? Math.abs(Number(params.step)) : 1;
      const operator = action.type === 'decrementVariable' ? '-=' : '+=';
      let code = `${name} ${operator} ${step};\nstate.${name} = ${name};`;
      if (params.display !== false && targetName) code += `\n${targetName}.textContent = ${name};`;
      return code;
    }
    if (action.type === 'toggleBoolean') {
      const name = safeIdentifier(params.variableName, 'isOpen');
      let code = `${name} = !${name};\nstate.${name} = ${name};`;
      if (targetName && params.className) code += `\n${targetName}.classList.toggle(${jsString(params.className)}, ${name});`;
      else if (targetName) code += `\n${targetName}.hidden = !${name};`;
      return code;
    }
    if (action.type === 'arrayPush') {
      const name = safeIdentifier(params.arrayName || params.variableName, 'items');
      return `${name}.push(${value});\nstate.${name} = ${name};`;
    }
    if (action.type === 'arrayRemove') {
      const name = safeIdentifier(params.arrayName || params.variableName, 'items');
      return `${name}.splice(Number(${advancedExpression(params.index, '0')}), Number(${advancedExpression(params.count, '1')}));\nstate.${name} = ${name};`;
    }
    if (action.type === 'arraySet') {
      const name = safeIdentifier(params.arrayName || params.variableName, 'items');
      return `${name}[Number(${advancedExpression(params.index, '0')})] = ${value};\nstate.${name} = ${name};`;
    }
    if (/^(local|session)Storage(Set|Get|Remove)$/.test(action.type)) {
      const session = action.type.indexOf('session') === 0;
      const property = session ? 'sessionStorage' : 'localStorage';
      const storage = `actionStorage`;
      const key = jsString(params.key || '');
      /* مزامنة متغيرات Storage المرتبطة بنفس المفتاح حتى لا تبقى قيمتها القديمة في الذاكرة */
      const storageSync = assignment => (Array.isArray(definition.state) ? definition.state : [])
        .filter(variable => variable && variable.enabled !== false && variable.type === 'Storage')
        .filter(variable => {
          const varSettings = variable.settings || {};
          const varSession = varSettings.storageType === 'session' || varSettings.storageType === 'sessionStorage';
          return text(varSettings.key) === text(params.key) && varSession === session;
        })
        .map(variable => {
          const name = safeIdentifier(variable.name, 'value');
          return `\n${name} = ${assignment};\nstate.${name} = ${name};`;
        }).join('');
      if (action.type.endsWith('Set')) return `const ${storage} = ${generatedStorageAccessor(property)};\nif (${storage}) { ${storage}.setItem(${key}, ${params.json ? `JSON.stringify(${value})` : `String(${value})`}); }${storageSync(params.json ? value : `String(${value})`)}`;
      if (action.type.endsWith('Remove')) return `const ${storage} = ${generatedStorageAccessor(property)};\nif (${storage}) { ${storage}.removeItem(${key}); }${storageSync('null')}`;
      const result = safeIdentifier(params.resultName, 'storedValue');
      const fallback = advancedExpression(params.fallback, "''");
      const parse = params.json ? `(() => { try { return JSON.parse(actionStoredRaw); } catch (error) { return ${fallback}; } })()` : `actionStoredRaw`;
      let code = `const ${storage} = ${generatedStorageAccessor(property)};\nconst actionStoredRaw = ${storage} ? ${storage}.getItem(${key}) : null;\nconst ${result} = actionStoredRaw === null ? ${fallback} : ${parse};\nstate.${result} = ${result};`;
      if (targetName) code += `\n${targetName}.textContent = String(${result} ?? '');`;
      return code;
    }
    if (action.type === 'alert') return `if (typeof window.alert === 'function') { window.alert(String(${value})); }`;
    if (action.type === 'consoleLog' || action.type === 'log') return `console.log(${value});`;
    if (action.type === 'confirm' || action.type === 'prompt') {
      const method = action.type;
      const result = safeIdentifier(params.resultName, method === 'confirm' ? 'confirmed' : 'answer');
      const args = method === 'prompt' ? `String(${value}), ${jsString(params.defaultValue || '')}` : `String(${value})`;
      return `const ${result} = typeof window.${method} === 'function' ? window.${method}(${args}) : ${method === 'confirm' ? 'false' : 'null'};\nstate.${result} = ${result};`;
    }
    if (action.type === 'openUrl' || action.type === 'redirect') {
      const tryMode = !!(options && options.tryMode) || !!(definition.settings && definition.settings.tryMode);
      if (tryMode) return advancedTryWarning(action.type, `Try Now blocked navigation`);
      if (action.type === 'openUrl') return `if (typeof window.open === 'function') { window.open(String(${value}), ${jsString(params.target || '_blank')}); }`;
      return `if (window.location && typeof window.location.assign === 'function') { window.location.assign(String(${value})); }`;
    }
    if (action.type === 'scrollTo') return `${targetName}.scrollIntoView({ behavior: ${jsString(params.behavior || 'smooth')}, block: ${jsString(params.block || 'start')} });`;
    if (action.type === 'clipboard') return `if (window.navigator && window.navigator.clipboard) { window.navigator.clipboard.writeText(String(${value})); }`;
    if (action.type === 'print') return `if (typeof window.print === 'function') { window.print(); }`;
    if (action.type === 'setTimeout' || action.type === 'setInterval' || action.type === 'delayedAction') {
      const method = action.type === 'setInterval' ? 'setInterval' : 'setTimeout';
      const body = text(params.body || params.code, '// delayed action');
      const expression = `${method}(() => {\n${indent(body, 2)}\n}, Math.max(0, Number(${advancedExpression(params.delay, '0')}) || 0))`;
      const resultName = safeIdentifier(params.resultName, action.type === 'setInterval' ? 'intervalId' : 'timeoutId');
      return action.type === 'delayedAction' ? `${expression};` : `const ${resultName} = ${expression};\nstate.${resultName} = ${resultName};`;
    }
    if (action.type === 'clearInterval') return `clearInterval(${advancedExpression(params.timer || params.intervalId, 'intervalId')});`;
    if (action.type === 'callFunction') {
      const functionName = safeIdentifier(params.functionName, 'myFunction');
      const invocation = `(typeof window.${functionName} === 'function' ? window.${functionName}(${text(params.arguments).trim()}) : undefined)`;
      if (params.resultName) {
        const resultName = safeIdentifier(params.resultName, 'functionResult');
        if (params.await && options && options.asyncAllowed) return `const ${resultName} = await Promise.resolve(${invocation});\nstate.${resultName} = ${resultName};`;
        if (params.await) return `Promise.resolve(${invocation}).then(value => { state.${resultName} = value; });`;
        return `const ${resultName} = ${invocation};\nstate.${resultName} = ${resultName};`;
      }
      return params.await && options && options.asyncAllowed ? `await Promise.resolve(${invocation});` : `${invocation};`;
    }
    const custom = text(action.value || params.code, '// اكتب الكود المخصص هنا');
    return targetName ? `const targetElement = ${targetName};\nconst actionTarget = targetElement;\n${custom}` : custom;
  }

  function resolveLoopItemName(options) {
    let ctx = options && options.loopContext;
    while (ctx) {
      if (ctx.scopeType === 'loop' && ctx.loopVariables && ctx.loopVariables.item) {
        return ctx.loopVariables.item;
      }
      ctx = ctx.parentContext;
    }
    return null;
  }

  function generateLoopActionV2(action, definition, options) {
    const loopType = action.loopType || 'forEach';
    const vars = action.variables || {};
    const itemName = safeIdentifier(vars.itemName, 'item');
    const indexName = safeIdentifier(vars.indexName, 'index');
    
    const loopContext = {
      parentContext: (options && options.loopContext) || null,
      scopeType: 'loop',
      loopVariables: {
        item: itemName,
        index: indexName,
        collection: vars.collectionName || ''
      }
    };
    const subOptions = Object.assign({}, options, { loopContext });

    if (loopType === 'forEach') {
      let sourceExpr = '[]';
      if (action.source) {
        const src = action.source;
        if (src.sourceType === 'state' || src.kind === 'state') {
          const stateSourceName = text(src.variableName || src.value).trim();
          sourceExpr = stateSourceName ? `state[${jsString(stateSourceName)}]` : '[]';
        } else if (src.sourceType === 'read' || src.kind === 'read') {
          const readSourceName = text(src.variableName || src.value).trim();
          sourceExpr = readSourceName ? safeIdentifier(readSourceName, 'items') : '[]';
        } else if (src.sourceType === 'dom' || src.kind === 'dom') {
          if (src.selector) {
            sourceExpr = `Array.from(document.querySelectorAll(${jsString(src.selector)}))`;
          } else {
            sourceExpr = `[]`;
          }
        } else if (src.sourceType === 'loopVariable' || src.kind === 'loopVariable') {
          sourceExpr = src.variableName || src.value || 'item';
        } else {
          sourceExpr = valueExpressionV2(src, src.sourceType || src.kind || 'expression', definition);
        }
      }
      const subActionsCode = generateActionsV2(definition, action.actions, subOptions);
      const loopId = action.id.replace(/[^a-zA-Z0-9_$]/g, '_');
      const sourceVar = `loopSource_loop_${loopId}`;
      return `const ${sourceVar} = ${sourceExpr};\nif (${sourceVar} != null && (typeof ${sourceVar}[Symbol.iterator] === "function" || typeof ${sourceVar}.length === "number")) {\n  Array.from(${sourceVar}).forEach((${itemName}, ${indexName}) => {\n${indent(subActionsCode || '// لا توجد إجراءات', 4)}\n  });\n}`;
    }

    if (loopType === 'repeat') {
      const countExpr = valueExpressionV2(action.count, (action.count && action.count.sourceType) || 'literal', definition);
      const startExpr = valueExpressionV2(action.startAt || 0, (action.startAt && action.startAt.sourceType) || 'literal', definition);
      const subActionsCode = generateActionsV2(definition, action.actions, subOptions);
      const loopId = action.id.replace(/[^a-zA-Z0-9_$]/g, '_');
      const startVar = `repeatStart_loop_${loopId}`;
      const countVar = `repeatCount_loop_${loopId}`;
      return `const ${startVar} = Number(${startExpr});\nconst ${countVar} = Number(${countExpr});\nif (Number.isFinite(${startVar}) && Number.isFinite(${countVar}) && ${countVar} >= 0) {\n  for (let ${indexName} = ${startVar}; ${indexName} < ${startVar} + ${countVar}; ${indexName} += 1) {\n${indent(subActionsCode || '// لا توجد إجراءات', 4)}\n  }\n}`;
    }

    if (loopType === 'while') {
      const safety = action.safety || {};
      const maxIter = Number(safety.maxIterations || 1000);
      const safetyLimit = isNaN(maxIter) || maxIter <= 0 ? 1000 : maxIter;
      
      const subDef = Object.assign({}, definition, { conditions: action.condition ? action.condition.conditions || [] : [], conditionGroups: action.condition ? action.condition.conditionGroups || [] : [] });
      const condExpr = conditionsExpressionV2(subDef) || 'true';
      
      const subActionsCode = generateActionsV2(definition, action.actions, subOptions);
      const safetyVar = `loopSafety_${action.id.replace(/[^a-zA-Z0-9_$]/g, '_')}`;
      return `let ${safetyVar} = 0;\nwhile (${condExpr}) {\n  if (${safetyVar} >= ${safetyLimit}) {\n    console.warn("Osoos: loop stopped after reaching the safety limit.");\n    break;\n  }\n  ${safetyVar} += 1;\n${indent(subActionsCode || '// لا توجد إجراءات', 2)}\n}`;
    }

    return '// نوع تكرار غير معروف';
  }

  function generateActionsV2(definition, actions, options) {
    const targetless = new Set(['branch', 'loop', 'setVariable', 'arrayPush', 'arrayRemove', 'arraySet', 'localStorageSet', 'localStorageRemove', 'sessionStorageSet', 'sessionStorageRemove', 'alert', 'confirm', 'prompt', 'openUrl', 'redirect', 'clipboard', 'print', 'setTimeout', 'setInterval', 'clearInterval', 'delayedAction', 'callFunction', 'consoleLog', 'log']);
    return (actions || definition.actions).map((action, index) => ({ action, index }))
      .filter(item => item.action.enabled !== false)
      .sort((a, b) => a.action.order - b.action.order || a.index - b.index)
      .map((item, outputIndex) => {
      const action = item.action;
      const needsTarget = !targetless.has(action.type) && !(action.type === 'custom' && !action.targetId) && !((action.type === 'localStorageGet' || action.type === 'sessionStorageGet') && !action.targetId);
      const targetName = needsTarget ? `actionTarget${outputIndex + 1}` : '';
      const body = generateActionBodyV2(action, targetName, definition, options || {});
      if (!needsTarget) return body;
      return `const ${targetName} = ${targetExpressionV2(action, definition, options)};\nif (${targetName}) {\n${indent(body, 2)}\n}`;
    }).join('\n');
  }

  function functionParametersSource(fn) {
    return (fn.parameters || []).map((parameter, index) => {
      const normalized = typeof parameter === 'string' ? { name: safeIdentifier(parameter, `arg${index + 1}`), defaultValue: '' } : parameter;
      const name = safeIdentifier(normalized.name, `arg${index + 1}`);
      return text(normalized.defaultValue).trim() ? `${name} = ${advancedExpression(normalized.defaultValue, 'undefined')}` : name;
    }).join(', ');
  }

  function generateAdvancedFunctionPhase(definition, fn, functionIndex, options) {
    return orderedAdvancedOperations(definition, 'functions')
      .filter(operation => {
        const settings = operation.settings || {};
        if (settings.functionId) return settings.functionId === fn.id;
        if (settings.functionName) return settings.functionName === fn.name;
        return functionIndex === 0;
      })
      .map(operation => generateAdvancedOperation(operation, definition, options))
      .filter(Boolean).join('\n');
  }

  function generateOneFunctionV3(definition, fn, functionIndex, options, standaloneState) {
    const fnDefinition = Object.assign({}, definition, { actions: fn.actions, conditions: fn.conditions });
    let body = standaloneState ? 'const state = Object.create(null);\n' : '';
    const functionVariables = generateVariablesV2(fnDefinition, 'function');
    if (functionVariables) body += functionVariables + '\n';
    if (text(fn.customCode).trim()) body += text(fn.customCode).trim() + '\n';
    const nativeActions = generateActionsV2(fnDefinition, fn.actions, Object.assign({}, options, { asyncAllowed: fn.type === 'async' }));
    const advancedFunctionActions = generateAdvancedFunctionPhase(definition, fn, functionIndex, options);
    const actions = [nativeActions, advancedFunctionActions].filter(Boolean).join('\n');
    const condition = conditionsExpressionV2(fnDefinition);
    if (actions) body += condition ? `if (${condition}) {\n${indent(actions, 2)}\n}\n` : actions + '\n';
    if (text(fn.returnValue).trim()) body += `return ${advancedExpression(fn.returnValue, 'undefined')};\n`;
    if (!body.trim()) body = '// لا توجد خطوات\n';
    const parameters = functionParametersSource(fn);
    if (fn.type === 'arrow') return `window.${fn.name} = (${parameters}) => {\n${indent(body.trimEnd(), 2)}\n};`;
    const asyncPrefix = fn.type === 'async' ? 'async ' : '';
    return `window.${fn.name} = ${asyncPrefix}function ${fn.name}(${parameters}) {\n${indent(body.trimEnd(), 2)}\n};`;
  }

  function generateFunctionsV3(definition, options, standaloneState) {
    return definition.functions.map((fn, index) => ({ fn, index }))
      .filter(item => item.fn.enabled !== false)
      .sort((a, b) => a.fn.order - b.fn.order || a.index - b.index)
      .map(item => generateOneFunctionV3(definition, item.fn, item.index, options || {}, standaloneState))
      .join('\n');
  }

  function generateFunctionExecutableV2(definition, options) {
    const functions = generateFunctionsV3(definition, options, false);
    if (!functions) return '// لا توجد Functions مفعلة';
    const sharedVariables = generateVariablesV2(definition, 'outsideEvent');
    const advancedState = generateAdvancedPhaseV3(definition, 'state', options);
    /* حاوية state تُكتب فقط إذا كان الكود المولد يستخدمها فعلاً */
    const stateIsUsed = /\bstate[.[]/.test([sharedVariables, advancedState, functions].filter(Boolean).join('\n'));
    let body = stateIsUsed ? 'const state = Object.create(null);\n' : '';
    if (sharedVariables) body += sharedVariables + '\n';
    if (advancedState) body += advancedState + '\n';
    body += functions;
    return `(function () {\n${indent(body.trimEnd(), 2)}\n})();`;
  }

  function generateExecutableV2(input, options) {
    const definition = normalizeDefinitionV2(input);
    if (definition.settings && text(definition.settings.manualCode).trim()) return text(definition.settings.manualCode).trim();
    if (definition.builderMode === 'function') return generateFunctionExecutableV2(definition, options);
    let handler = '';
    const eventSettings = definition.settings && definition.settings.eventSettings && typeof definition.settings.eventSettings === 'object' ? definition.settings.eventSettings : {};
    if (definition.event === 'submit') handler += 'event.preventDefault();\n';
    if (eventSettings.preventDefault) handler += 'event.preventDefault();\n';
    if (eventSettings.stopPropagation) handler += 'event.stopPropagation();\n';
    if ((definition.event === 'keydown' || definition.event === 'keyup') && text(eventSettings.key).trim()) handler += `if (event.key !== ${jsString(eventSettings.key)}) { return; }\n`;
    const eventVariables = generateVariablesV2(definition, 'insideEvent');
    if (eventVariables) handler += eventVariables + '\n';
    /* البحث عن عناصر القراءة لحظة الحدث: لا مراجع قديمة ولا تعطيل كامل عند غياب عنصر */
    const readSetup = generateReadsSetupV2(definition);
    if (readSetup) handler += readSetup + '\n';
    const reads = generateReadsBodyV2(definition);
    if (reads) handler += reads + '\n';
    const advancedReads = generateAdvancedPhaseV3(definition, 'reads', options);
    if (advancedReads) handler += advancedReads + '\n';
    const advancedConditions = generateAdvancedPhaseV3(definition, 'conditions', options);
    if (advancedConditions) handler += advancedConditions + '\n';
    let advancedActionsCode = generateAdvancedPhaseV3(definition, 'actions', options);
    if (advancedActionsCode && /\b(actionTarget|targetElement)\b/.test(advancedActionsCode)) {
      /* قوالب الأدوات المتقدمة تشير إلى actionTarget/targetElement — نعرّفهما في نطاق المعالج */
      advancedActionsCode = `const targetElement = ${definition.targetId ? `document.getElementById(${jsString(definition.targetId)})` : 'sourceElement'};\nconst actionTarget = targetElement;\n${advancedActionsCode}`;
    }
    const actions = [generateActionsV2(definition, null, Object.assign({}, options, { asyncAllowed: true })), advancedActionsCode].filter(Boolean).join('\n') || '// لا توجد إجراءات';
    const condition = conditionsExpressionV2(definition);
    handler += condition ? `if (${condition}) {\n${indent(actions, 2)}\n}` : actions;
    let code = '(function () {\n';
    /* سجل الروابط: إعادة تشغيل الكود تلغي مستمعات النسخة السابقة بدل مضاعفتها */
    code += `  const previousController = window.__osoos_links && window.__osoos_links[${jsString(definition.id)}];\n`;
    code += `  if (previousController) { previousController.abort(); }\n`;
    code += `  const controller = new AbortController();\n`;
    code += `  (window.__osoos_links = window.__osoos_links || {})[${jsString(definition.id)}] = controller;\n`;
    const eventUsesWindow = definition.event === 'load' || definition.event === 'resize' || (definition.event === 'scroll' && eventSettings.target === 'window');
    code += `  const sourceElement = ${definition.sourceId ? `document.getElementById(${jsString(definition.sourceId)})` : (eventUsesWindow ? '(document.documentElement || document.body || document)' : 'null')};\n`;
    if (!eventUsesWindow) code += '  if (!sourceElement) { return; }\n';
    const variables = generateVariablesV2(definition, 'outsideEvent');
    const advancedState = generateAdvancedPhaseV3(definition, 'state', options);
    const functions = generateFunctionsV3(definition, options, false);
    /* لا نصرّح بحاوية state إلا عند استخدامها فعلاً — كود أنظف وأسهل قراءة */
    const stateIsUsed = /\bstate[.[]/.test([variables, advancedState, functions, handler].filter(Boolean).join('\n'));
    if (stateIsUsed) code += '  const state = Object.create(null);\n';
    if (variables) code += indent(variables, 2) + '\n';
    if (advancedState) code += indent(advancedState, 2) + '\n';
    if (functions) code += indent(functions, 2) + '\n';
    const eventSource = eventUsesWindow ? 'window' : 'sourceElement';
    const eventName = definition.event === 'custom' ? text(eventSettings.eventName || eventSettings.name, 'osoos:event') : definition.event;
    /* async فقط إذا احتوى الجسم على await، وخيارات addEventListener فقط عند تفعيلها */
    const handlerIsAsync = /\bawait\b/.test(handler);
    const listenerOptions = ['signal: controller.signal'];
    if (eventSettings.once) listenerOptions.push('once: true');
    if (eventSettings.capture) listenerOptions.push('capture: true');
    if (eventSettings.passive) listenerOptions.push('passive: true');
    code += `  ${eventSource}.addEventListener(${jsString(eventName)}, ${handlerIsAsync ? 'async ' : ''}(event) => {\n`;
    code += indent(handler, 4) + `\n  }, { ${listenerOptions.join(', ')} });\n})();`;
    return code;
  }

  function encodeMetadataV2(definition) {
    return encodeURIComponent(JSON.stringify(normalizeDefinitionV2(definition)));
  }

  function decodeMetadataV2(raw) {
    try { return normalizeDefinitionV2(JSON.parse(decodeURIComponent(text(raw)))); } catch (error) { return null; }
  }

  function generateBlockV2(input, options) {
    const definition = normalizeDefinitionV2(input);
    const id = safeLinkId(definition.id, makeId('link'));
    return `// OSOOS_VISUAL_LINK_START id="${id}"\n` +
      `// OSOOS_LOGIC_DATA: ${encodeMetadataV2(definition)}\n` +
      `// SOURCE_ID: ${commentValue(definition.sourceId)}\n` +
      `// TARGET_ID: ${commentValue(definition.targetId)}\n` +
      `// EVENT: ${commentValue(definition.event)}\n` +
      `// MODE: ${commentValue(definition.builderMode)}\n` +
      `// PARAMS: ${encodeURIComponent(JSON.stringify({ recipeType: definition.recipeType }))}\n` +
      generateExecutableV2(definition, options) + '\n' +
      `// OSOOS_VISUAL_LINK_END id="${id}"`;
  }

  function parseVisualLinksV2(customJS) {
    const lines = text(customJS).split(/\r?\n/);
    const links = [];
    let current = null;
    for (let index = 0; index < lines.length; index += 1) {
      const trimmed = lines[index].trim();
      if (trimmed.indexOf('// OSOOS_VISUAL_LINK_START') === 0) {
        /* بلوك معلّق (نهايته محذوفة) كان يبتلع كل البلوكات التالية — نغلقه هنا */
        const match = trimmed.match(/id="([^"]+)"/);
        if (match) current = { id: match[1], startIndex: index, rawLines: [lines[index]], metadata: null, metadataSeen: false, headerOpen: true, sourceId: '', targetId: '', event: 'click', mode: 'custom', params: {} };
        else if (!current) continue;
        continue;
      }
      if (!current) continue;
      current.rawLines.push(lines[index]);
      if (current.headerOpen && !current.metadataSeen && trimmed.indexOf('// OSOOS_LOGIC_DATA:') === 0) {
        current.metadataSeen = true;
        current.metadata = decodeMetadataV2(trimmed.substring('// OSOOS_LOGIC_DATA:'.length).trim());
      } else if (current.headerOpen && trimmed.indexOf('// SOURCE_ID:') === 0) current.sourceId = trimmed.substring(13).trim();
      else if (current.headerOpen && trimmed.indexOf('// TARGET_ID:') === 0) current.targetId = trimmed.substring(13).trim();
      else if (current.headerOpen && trimmed.indexOf('// EVENT:') === 0) current.event = trimmed.substring(9).trim();
      else if (current.headerOpen && trimmed.indexOf('// MODE:') === 0) current.mode = trimmed.substring(8).trim();
      else if (current.headerOpen && trimmed.indexOf('// PARAMS:') === 0) {
        try { current.params = JSON.parse(decodeURIComponent(trimmed.substring(10).trim())); } catch (error) { current.params = {}; }
      } else if (trimmed.indexOf('// OSOOS_VISUAL_LINK_END') === 0) {
        const endMatch = trimmed.match(/id="([^"]+)"/);
        if (!endMatch || endMatch[1] !== current.id) continue;
        /* نغلق عند أول END مطابق. القاعدة القديمة كانت تنتظر آخر END فتدمج
           بلوكين بنفس المعرف (نسخ/لصق) في رابط واحد ثم يُحذف أحدهما بصمت. */
        current.endIndex = index;
        let definition;
        if (current.metadata) definition = normalizeDefinitionV2(current.metadata);
        else {
          const executable = current.rawLines.slice(1, -1).filter(line => !/^\s*\/\/ (SOURCE_ID|TARGET_ID|EVENT|MODE|PARAMS):/.test(line)).join('\n').trim();
          const legacy = migrateLegacy(Object.assign({}, current, { manualCode: executable }));
          definition = migrateDefinitionV1ToV2(Object.assign({}, legacy, { schemaVersion: 1 }));
        }
        definition.id = safeLinkId(current.id, definition.id);
        definition.startIndex = current.startIndex;
        definition.endIndex = current.endIndex;
        links.push(definition);
        current = null;
      } else if (current.headerOpen && trimmed !== '') current.headerOpen = false;
    }
    return links;
  }

  function validateDefinitionV2(input) {
    const definition = normalizeDefinitionV2(input);
    const errors = [];
    function getOperandStringValue(operand) {
      if (operand && typeof operand === 'object') {
        return String(operand.value || '').trim();
      }
      return String(operand || '').trim();
    }
    const enabledAdvancedActions = definition.advancedOperations.filter(operation => operation.enabled && operation.destination === 'actions');
    if (definition.builderMode === 'function') {
      if (!definition.functions.some(fn => fn.enabled !== false)) errors.push('أضف Function واحدة على الأقل.');
    } else {
      const eventSettings = definition.settings.eventSettings || {};
      const windowEvent = definition.event === 'load' || definition.event === 'resize' || (definition.event === 'scroll' && eventSettings.target === 'window');
      if (!definition.sourceId && !windowEvent) errors.push('يجب اختيار Source.');
      if (!definition.actions.some(action => action.enabled !== false) && !enabledAdvancedActions.length && !(definition.settings && text(definition.settings.manualCode).trim())) errors.push('أضف إجراءً واحدًا على الأقل.');
    }
    const names = new Set();
    const resultNames = definition.advancedOperations.filter(operation => operation.enabled && operation.resultName).map(operation => operation.resultName);
    [...definition.reads.filter(read => read.enabled !== false).map(read => read.name), ...definition.state.filter(variable => variable.enabled !== false).map(variable => variable.name), ...resultNames].forEach(name => {
      if (names.has(name)) errors.push(`الاسم ${name} مستخدم أكثر من مرة.`);
      names.add(name);
    });
    /* أسماء الدوال تُسند إلى window: اسم مثل alert أو fetch يظلّل الأصلي
       ويكسر الكود المولّد في مواضع أخرى تعتمد عليه. */
    const reservedGlobalNames = new Set(['alert', 'confirm', 'prompt', 'fetch', 'print', 'open', 'close', 'focus', 'blur', 'scroll', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'localStorage', 'sessionStorage', 'document', 'window', 'location', 'history', 'navigator', 'console', 'event', 'name', 'top', 'self', 'parent', 'length', 'status', 'origin']);
    definition.functions.forEach((fn, index) => {
      if (fn.enabled === false) return;
      if (reservedGlobalNames.has(text(fn.name))) {
        errors.push(`اسم Function ${fn.name} محجوز في المتصفح — اختر اسماً آخر (مثل ${fn.name}Handler).`);
      }
    });
    const operationIds = new Set();
    definition.advancedOperations.forEach((operation, index) => {
      if (operationIds.has(operation.id)) errors.push(`Advanced operation id ${operation.id} is duplicated.`);
      operationIds.add(operation.id);
      const result = validateAdvancedOperation(operation, index, definition);
      errors.push(...result.errors);
    });
    definition.reads.forEach((read, index) => {
      if (read.enabled === false) return;
      const descriptor = E1_READ_TYPES[read.type];
      if (!descriptor) errors.push(`نوع القراءة ${read.type} غير معروف في القراءة ${index + 1}.`);
      if (descriptor && descriptor.sourceKinds.includes('element') && read.type !== 'radioValue' && !read.elementId) errors.push(`اختر عنصر القراءة ${index + 1}.`);
      if (read.settings.originalName) errors.push(`اسم متغير القراءة ${read.settings.originalName} غير صالح.`);
      if (read.type === 'functionResult' && !text(read.settings.functionName).trim()) errors.push(`اختر Function للقراءة ${index + 1}.`);
    });
    definition.conditions.forEach((condition, index) => {
      if (condition.enabled === false) return;
      if (condition.isVisualExpression === true || condition.isVisualExpression === 'true') {
        const expressionResult = validateExpressionV2(condition.left, definition, 'boolean');
        expressionResult.errors.forEach(item => errors.push(`الشرط ${index + 1}: ${item.message || item}`));
        return;
      }
      if (!E1_CONDITION_OPERATORS[condition.operator]) errors.push(`عامل الشرط ${condition.operator} غير معروف في الشرط ${index + 1}.`);
      if (condition.operator === 'regex') {
        try { new RegExp(condition.settings.pattern || condition.right, condition.settings.flags || ''); } catch (error) { errors.push(`Regular Expression غير صالح في الشرط ${index + 1}: ${error.message}`); }
      }
      const leftVal = getOperandStringValue(condition.left);
      if (/^[A-Za-z_$][\w$]*$/.test(leftVal)) {
        const definedVariables = new Set([
          ...definition.state.filter(v => v.enabled !== false).map(v => v.name),
          ...definition.reads.filter(r => r.enabled !== false).map(r => r.name),
          ...definition.advancedOperations.filter(o => o.enabled !== false && o.resultName).map(o => o.resultName),
          'event', 'sourceElement'
        ]);
        if (!definedVariables.has(leftVal)) {
          errors.push(`الشرط ${index + 1} يعتمد على متغير غير موجود: ${leftVal}`);
        }
      }
      if (condition.rightType === 'expression') {
        const rightVal = getOperandStringValue(condition.right);
        if (/^[A-Za-z_$][\w$]*$/.test(rightVal)) {
          const definedVariables = new Set([
            ...definition.state.filter(v => v.enabled !== false).map(v => v.name),
            ...definition.reads.filter(r => r.enabled !== false).map(r => r.name),
            ...definition.advancedOperations.filter(o => o.enabled !== false && o.resultName).map(o => o.resultName),
            'event', 'sourceElement'
          ]);
          if (!definedVariables.has(rightVal)) {
            errors.push(`الشرط ${index + 1} يقارن بمتغير غير موجود: ${rightVal}`);
          }
        }
      }
    });
    /* حلقات التكرار: مصدر فارغ كان يولّد state[""] ويفشل بصمت — نمسكه قبل الحفظ */
    const validateLoopActions = (actionsList, pathLabel) => {
      (actionsList || []).forEach((action, index) => {
        if (!action || action.enabled === false) return;
        if (action.type === 'loop') {
          const loopType = action.loopType || 'forEach';
          if (loopType === 'forEach') {
            const src = action.source || {};
            const namedSource = text(src.variableName || src.value).trim();
            const domSelector = text(src.selector).trim();
            if (!namedSource && !domSelector) errors.push(`حلقة التكرار ${pathLabel}${index + 1}: اختر مصدر التكرار (مصفوفة أو قراءة أو عناصر DOM).`);
          }
          validateLoopActions(action.actions, `${pathLabel}${index + 1} ← `);
        }
        if (Array.isArray(action.branches)) action.branches.forEach(branch => validateLoopActions(branch && branch.actions, pathLabel));
      });
    };
    validateLoopActions(definition.actions, '');
    definition.state.forEach((variable, index) => {
      if (variable.enabled === false) return;
      if (!E1_VARIABLE_TYPES[variable.type]) errors.push(`نوع State غير معروف في المتغير ${index + 1}.`);
      if (variable.settings.originalName) errors.push(`اسم المتغير ${variable.settings.originalName} غير صالح.`);
      if (!VARIABLE_SCOPES.includes(variable.scope)) errors.push(`مكان تعريف المتغير ${variable.name} غير صالح.`);
      if (variable.type === 'Array' || variable.type === 'Object' || variable.type === 'Set') {
        try {
          const parsed = JSON.parse(text(variable.initialValue) || (variable.type === 'Object' ? '{}' : '[]'));
          if (variable.type === 'Object' && (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))) throw new Error('expected object');
          if ((variable.type === 'Array' || variable.type === 'Set') && !Array.isArray(parsed)) throw new Error('expected array');
        } catch (error) { errors.push(`القيمة الأولية للمتغير ${variable.name} غير صالحة لنوع ${variable.type}.`); }
      }
    });

    // Advanced Operations dependency checks
    definition.advancedOperations.forEach((operation, index) => {
      if (operation.enabled === false) return;
      const descriptor = ADVANCED_TOOLS[operation.toolId];
      if (!descriptor) return;

      const definedVariables = new Set([
        ...definition.state.filter(v => v.enabled !== false).map(v => v.name),
        ...definition.reads.filter(r => r.enabled !== false).map(r => r.name),
        ...definition.advancedOperations.filter(o => o.enabled !== false && o.resultName).map(o => o.resultName)
      ]);

      if (operation.destination === 'functions') {
        const fnId = operation.settings && (operation.settings.functionId || operation.settings.functionName);
        const fn = definition.functions.find(f => f.id === fnId || f.name === fnId);
        if (fn && fn.parameters) {
          fn.parameters.forEach(p => {
            const pName = typeof p === 'string' ? p : p.name;
            if (pName) definedVariables.add(pName);
          });
        } else {
          definition.functions.forEach(f => {
            if (f.parameters) {
              f.parameters.forEach(p => {
                const pName = typeof p === 'string' ? p : p.name;
                if (pName) definedVariables.add(pName);
              });
            }
          });
        }
      }

      const definedFunctions = new Set([
        ...definition.functions.filter(f => f.enabled !== false).map(f => f.name),
        'alert', 'prompt', 'confirm', 'parseInt', 'parseFloat', 'setTimeout', 'setInterval', 'clearInterval',
        'Number', 'String', 'Boolean', 'Object', 'Array', 'Math', 'JSON', 'Date', 'console'
      ]);

      descriptor.fields.forEach(field => {
        const key = field.key || field.name;
        const val = String(operation.settings && operation.settings[key] || '').trim();
        if (!val) return;

        if (/^[A-Za-z_$][\w$]*$/.test(val)) {
          if (key === 'array') {
            if (!definedVariables.has(val) && val !== 'items') {
              errors.push(`الأداة «${descriptor.label}» تعتمد على مصفوفة غير موجودة: ${val}`);
            }
          }
          if (key === 'object') {
            if (!definedVariables.has(val)) {
              errors.push(`الأداة «${descriptor.label}» تعتمد على كائن غير موجود: ${val}`);
            }
          }
          if (key === 'timer') {
            if (!definedVariables.has(val)) {
              errors.push(`الأداة «${descriptor.label}» تعتمد على مؤقت غير موجود: ${val}`);
            }
          }
          if (key === 'functionName') {
            if (!definedFunctions.has(val)) {
              errors.push(`الأداة «${descriptor.label}» تعتمد على Function غير موجودة: ${val}`);
            }
          }
        }
      });
    });
    const actions = definition.builderMode === 'function' ? definition.functions.flatMap(fn => fn.actions) : definition.actions;
    const validateActions = (actionsList, pathPrefix) => {
      actionsList.forEach((action, index) => {
        if (action.enabled === false) return;
        const label = pathPrefix ? `${pathPrefix} -> الإجراء ${index + 1}` : `الإجراء ${index + 1}`;
        const schema = ACTION_SCHEMAS[action.type];
        if (action.type === 'branch') {
          if (!Array.isArray(action.branches) || action.branches.length === 0) {
            errors.push(`${label}: يجب إضافة فرع واحد على الأقل للشرط المتفرع.`);
            return;
          }
          let elseCount = 0;
          action.branches.forEach((br, brIdx) => {
            const brLabel = `${label} -> الفرع ${brIdx + 1} (${br.branchType})`;
            if (br.branchType === 'if' || br.branchType === 'elseIf') {
              if (!br.condition || !Array.isArray(br.condition.conditions) || br.condition.conditions.length === 0) {
                errors.push(`${brLabel}: يجب تحديد شرط لهذا الفرع.`);
              } else {
                br.condition.conditions.forEach((condition, condIdx) => {
                  if (condition.enabled === false) return;
                  if (!E1_CONDITION_OPERATORS[condition.operator]) errors.push(`${brLabel} -> الشرط ${condIdx + 1}: عامل الشرط ${condition.operator} غير معروف.`);
                  if (condition.operator === 'regex') {
                    try { new RegExp(condition.settings.pattern || condition.right, condition.settings.flags || ''); } catch (err) { errors.push(`${brLabel} -> الشرط ${condIdx + 1}: Regular Expression غير صالح: ${err.message}`); }
                  }
                  const leftVal = getOperandStringValue(condition.left);
                  if (/^[A-Za-z_$][\w$]*$/.test(leftVal)) {
                    const definedVariables = new Set([
                      ...definition.state.filter(v => v.enabled !== false).map(v => v.name),
                      ...definition.reads.filter(r => r.enabled !== false).map(r => r.name),
                      ...definition.advancedOperations.filter(o => o.enabled !== false && o.resultName).map(o => o.resultName),
                      'event', 'sourceElement'
                    ]);
                    if (!definedVariables.has(leftVal)) {
                      errors.push(`${brLabel} -> الشرط ${condIdx + 1} يعتمد على متغير غير موجود: ${leftVal}`);
                    }
                  }
                  if (condition.rightType === 'expression') {
                    const rightVal = getOperandStringValue(condition.right);
                    if (/^[A-Za-z_$][\w$]*$/.test(rightVal)) {
                      const definedVariables = new Set([
                        ...definition.state.filter(v => v.enabled !== false).map(v => v.name),
                        ...definition.reads.filter(r => r.enabled !== false).map(r => r.name),
                        ...definition.advancedOperations.filter(o => o.enabled !== false && o.resultName).map(o => o.resultName),
                        'event', 'sourceElement'
                      ]);
                      if (!definedVariables.has(rightVal)) {
                        errors.push(`${brLabel} -> الشرط ${condIdx + 1} يقارن بمتغير غير موجود: ${rightVal}`);
                      }
                    }
                  }
                });
              }
            } else if (br.branchType === 'else') {
              elseCount++;
              if (brIdx !== action.branches.length - 1) {
                errors.push(`${brLabel}: فرع Else يجب أن يكون آخر فرع في التفرع.`);
              }
            }
            if (elseCount > 1) {
              errors.push(`${label}: لا يمكن وجود أكثر من فرع Else واحد.`);
            }
            validateActions(br.actions || [], brLabel);
          });
          return;
        }
        if (action.type === 'loop') {
          const loopLabel = `${label} -> تكرار (${action.loopType})`;
          const vars = action.variables || {};
          const itemName = safeIdentifier(vars.itemName, '');
          const indexName = safeIdentifier(vars.indexName, '');
          const definedVariables = new Set([
            ...definition.state.filter(v => v.enabled !== false).map(v => v.name),
            ...definition.reads.filter(r => r.enabled !== false).map(r => r.name),
            ...definition.advancedOperations.filter(o => o.enabled !== false && o.resultName).map(o => o.resultName),
            'event', 'sourceElement'
          ]);
          
          if (action.loopType === 'forEach') {
            if (!action.source || (!action.source.variableName && !action.source.selector && !action.source.value)) {
              errors.push(`${loopLabel}: يجب تحديد مصدر لتكرار العناصر.`);
            }
            if (!itemName) {
              errors.push(`${loopLabel}: يجب تحديد اسم لمتغير العنصر الحالي.`);
            } else if (definedVariables.has(itemName)) {
              errors.push(`${loopLabel}: اسم العنصر الحالي تعارض مع متغير معرف مسبقاً (${itemName}).`);
            }
            if (!indexName) {
              errors.push(`${loopLabel}: يجب تحديد اسم لمتغير رقم التكرار.`);
            } else if (definedVariables.has(indexName)) {
              errors.push(`${loopLabel}: اسم رقم التكرار تعارض مع متغير معرف مسبقاً (${indexName}).`);
            }
          }
          if (action.loopType === 'repeat') {
            if (!action.count || !action.count.value) {
              errors.push(`${loopLabel}: يجب تحديد عدد مرات التكرار.`);
            }
            if (!indexName) {
              errors.push(`${loopLabel}: يجب تحديد اسم لمتغير رقم التكرار.`);
            } else if (definedVariables.has(indexName)) {
              errors.push(`${loopLabel}: اسم رقم التكرار تعارض مع متغير معرف مسبقاً (${indexName}).`);
            }
          }
          if (action.loopType === 'while') {
            if (!action.condition || !Array.isArray(action.condition.conditions) || action.condition.conditions.length === 0) {
              errors.push(`${loopLabel}: يجب تحديد شرط لحلقة While.`);
            }
            const safety = action.safety || {};
            if (!safety.maxIterations || safety.maxIterations <= 0) {
              errors.push(`${loopLabel}: حد الأمان الأقصى للتكرار يجب أن يكون رقماً موجباً أكبر من الصفر.`);
            }
          }
          if (!action.actions || action.actions.length === 0) {
            errors.push(`${loopLabel}: حلقة التكرار فارغة ولا تحتوي على أي إجراءات.`);
          }
          validateActions(action.actions || [], loopLabel);
          return;
        }
        if (!schema) errors.push(`نوع الإجراء ${action.type} غير معروف في ${label}.`);
        const needsTarget = schema ? schema.requiresTarget : false;
        if (needsTarget && !action.targetId && !(action.target && action.target.kind !== 'target')) errors.push(`اختر Target لـ ${label}.`);
        if (['addClass', 'removeClass', 'toggleClass'].includes(action.type) && !/^\S+$/.test(text(action.params.className).trim())) errors.push(`اسم Class في ${label} غير صالح.`);
        if (['incrementVariable', 'decrementVariable', 'toggleBoolean', 'setVariable', 'arrayPush', 'arrayRemove', 'arraySet'].includes(action.type)) {
          const name = safeIdentifier(action.params.variableName || action.params.arrayName, '');
          if (!definition.state.some(variable => variable.name === name)) errors.push(`متغير ${label} غير موجود.`);
        }
        if (action.type === 'callFunction' && !definition.functions.some(fn => fn.name === safeIdentifier(action.params.functionName, ''))) {
          if (!text(action.params.functionName).trim()) errors.push(`اختر Function لـ ${label}.`);
        }
      });
    };
    validateActions(actions, '');
    const functionNames = new Set();
    definition.functions.forEach((fn, index) => {
      if (fn.enabled === false) return;
      if (functionNames.has(fn.name)) errors.push(`اسم Function ${fn.name} مستخدم أكثر من مرة.`);
      functionNames.add(fn.name);
      if (fn.settings.originalName) errors.push(`اسم Function ${fn.settings.originalName} غير صالح.`);
      const parameterNames = new Set();
      fn.parameters.forEach(parameter => {
        if (parameterNames.has(parameter.name)) errors.push(`Parameter ${parameter.name} مكرر داخل ${fn.name}.`);
        parameterNames.add(parameter.name);
      });
      if (!fn.actions.some(action => action.enabled !== false) && !text(fn.customCode).trim() && !text(fn.returnValue).trim() && !definition.advancedOperations.some(operation => operation.destination === 'functions' && operation.enabled && (!operation.settings.functionId || operation.settings.functionId === fn.id))) {
        errors.push(`أضف خطوة أو Return Value داخل Function ${index + 1}.`);
      }
    });
    try { new Function(generateBlockV2(definition)); } catch (error) { errors.push(`خطأ في JavaScript: ${error.message}`); }
    return { valid: errors.length === 0, errors, definition };
  }

  function getRelationshipsV2(input) {
    const definition = normalizeDefinitionV2(input);
    if (definition.builderMode === 'function') return [];
    const relationships = [];
    definition.reads.forEach((read, index) => {
      if (read.elementId && read.elementId !== definition.sourceId) relationships.push({ sourceId: definition.sourceId, targetId: read.elementId, label: `قراءة ${index + 1}`, role: 'read' });
    });
    definition.actions.forEach((action, index) => {
      const targetId = action.targetId || (action.target && action.target.id) || definition.targetId;
      if (targetId) relationships.push({ sourceId: definition.sourceId, targetId, label: `إجراء ${index + 1}`, role: 'action' });
    });
    definition.advancedOperations.forEach((operation, index) => {
      const targetId = text(operation.settings && operation.settings.targetId);
      if (operation.enabled && targetId) relationships.push({ sourceId: definition.sourceId, targetId, label: `Advanced ${index + 1}`, role: operation.destination === 'reads' ? 'read' : 'action' });
    });
    if (!relationships.length && definition.targetId) relationships.push({ sourceId: definition.sourceId, targetId: definition.targetId, label: 'Target', role: 'target' });
    return relationships;
  }

  function parseComponents(customJS) {
    const lines = (customJS || '').split(/\r?\n/);
    const components = [];
    let current = null;
    for (let index = 0; index < lines.length; index += 1) {
      const trimmed = lines[index].trim();
      if (!current && trimmed.indexOf('// OSOOS_COMPONENT_START') === 0) {
        const idMatch = trimmed.match(/id="([^"]+)"/);
        const typeMatch = trimmed.match(/type="([^"]+)"/);
        if (idMatch && typeMatch) {
          current = {
            id: idMatch[1],
            componentType: typeMatch[1],
            startIndex: index,
            rawLines: [lines[index]],
            metadata: null
          };
        }
        continue;
      }
      if (!current) continue;
      current.rawLines.push(lines[index]);
      if (trimmed.indexOf('// OSOOS_COMPONENT_DATA:') === 0) {
        const rawJson = trimmed.substring('// OSOOS_COMPONENT_DATA:'.length).trim();
        try {
          current.metadata = JSON.parse(decodeURIComponent(rawJson));
        } catch (e) {
          console.warn('Failed to parse component metadata', e);
        }
      } else if (trimmed.indexOf('// OSOOS_COMPONENT_END') === 0) {
        const endMatch = trimmed.match(/id="([^"]+)"/);
        if (endMatch && endMatch[1] === current.id) {
          current.endIndex = index;
          if (!current.metadata) {
            current.metadata = {
              schemaVersion: 4,
              id: current.id,
              componentType: current.componentType,
              legacyManual: true,
              rawCode: current.rawLines.slice(2, -1).join('\n')
            };
          }
          components.push(current);
          current = null;
        }
      }
    }
    return components;
  }

  function generateAccordionCode(metadata) {
    const items = metadata.items || [];
    const settings = metadata.settings || {};
    const method = settings.method || 'class';
    const activeClass = settings.activeClass || 'open';
    const allowMultiple = !!settings.allowMultiple;
    const collapsible = settings.collapsible !== false;
    const keyboard = !!settings.keyboard;
    const accessibility = settings.accessibility !== false;
    const eventName = settings.event || 'click';
    const compId = (metadata.id || 'comp-unknown').replace(/[^a-zA-Z0-9]/g, '_');
    
    let code = `  const triggers_${compId} = [\n`;
    items.forEach(item => {
      code += `    document.getElementById(${JSON.stringify(item.triggerId)}),\n`;
    });
    code += `  ].filter(Boolean);\n\n`;
    
    code += `  const contents_${compId} = [\n`;
    items.forEach(item => {
      code += `    document.getElementById(${JSON.stringify(item.contentId)}),\n`;
    });
    code += `  ].filter(Boolean);\n\n`;
    
    code += `  triggers_${compId}.forEach((trigger, index) => {\n`;
    code += `    const content = contents_${compId}[index];\n`;
    code += `    if (!content) return;\n\n`;
    
    if (accessibility) {
      code += `    if (trigger.tagName !== 'BUTTON') {\n`;
      code += `      trigger.setAttribute('role', 'button');\n`;
      code += `      if (!trigger.hasAttribute('tabindex')) trigger.setAttribute('tabindex', '0');\n`;
      code += `    }\n`;
      code += `    if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');\n`;
      code += `    if (!content.hasAttribute('aria-hidden')) content.setAttribute('aria-hidden', 'true');\n`;
      code += `    trigger.setAttribute('aria-controls', content.id || '');\n\n`;
    }
    
    code += `    const toggleItem = (event) => {\n`;
    code += `      if (event) event.preventDefault();\n`;
    
    if (method === 'class') {
      code += `      const isOpen = content.classList.contains(${JSON.stringify(activeClass)});\n`;
    } else if (method === 'hidden') {
      code += `      const isOpen = !content.hidden;\n`;
    } else if (method === 'display') {
      code += `      const isOpen = content.style.display !== 'none';\n`;
    } else if (method === 'max-height') {
      code += `      const isOpen = content.classList.contains(${JSON.stringify(activeClass)});\n`;
    }
    
    if (!allowMultiple) {
      code += `      contents_${compId}.forEach((otherContent, otherIndex) => {\n`;
      code += `        if (otherIndex !== index) {\n`;
      if (method === 'class') {
        code += `          otherContent.classList.remove(${JSON.stringify(activeClass)});\n`;
      } else if (method === 'hidden') {
        code += `          otherContent.hidden = true;\n`;
      } else if (method === 'display') {
        code += `          otherContent.style.display = 'none';\n`;
      } else if (method === 'max-height') {
        code += `          otherContent.classList.remove(${JSON.stringify(activeClass)});\n`;
        code += `          otherContent.style.maxHeight = '0px';\n`;
      }
      if (accessibility) {
        code += `          triggers_${compId}[otherIndex].setAttribute('aria-expanded', 'false');\n`;
        code += `          otherContent.setAttribute('aria-hidden', 'true');\n`;
      }
      code += `        }\n`;
      code += `      });\n`;
    }
    
    code += `      if (isOpen) {\n`;
    code += `        if (${collapsible}) {\n`;
    if (method === 'class') {
      code += `          content.classList.remove(${JSON.stringify(activeClass)});\n`;
    } else if (method === 'hidden') {
      code += `          content.hidden = true;\n`;
    } else if (method === 'display') {
      code += `          content.style.display = 'none';\n`;
    } else if (method === 'max-height') {
      code += `          content.classList.remove(${JSON.stringify(activeClass)});\n`;
      code += `          content.style.maxHeight = '0px';\n`;
    }
    if (accessibility) {
      code += `          trigger.setAttribute('aria-expanded', 'false');\n`;
      code += `          content.setAttribute('aria-hidden', 'true');\n`;
    }
    code += `        }\n`;
    code += `      } else {\n`;
    if (method === 'class') {
      code += `        content.classList.add(${JSON.stringify(activeClass)});\n`;
    } else if (method === 'hidden') {
      code += `        content.hidden = false;\n`;
    } else if (method === 'display') {
      code += `        content.style.display = '';\n`;
    } else if (method === 'max-height') {
      code += `        content.classList.add(${JSON.stringify(activeClass)});\n`;
      code += `        content.style.maxHeight = content.scrollHeight + 'px';\n`;
    }
    if (accessibility) {
      code += `        trigger.setAttribute('aria-expanded', 'true');\n`;
      code += `        content.setAttribute('aria-hidden', 'false');\n`;
    }
    code += `      }\n`;
    code += `    };\n\n`;
    
    code += `    trigger.addEventListener(${JSON.stringify(eventName)}, toggleItem, { signal: controller.signal });\n`;
    
    if (keyboard) {
      code += `    trigger.addEventListener('keydown', (e) => {\n`;
      code += `      if (e.key === 'Enter' || e.key === ' ') {\n`;
      code += `        e.preventDefault();\n`;
      code += `        toggleItem(e);\n`;
      code += `      } else if (e.key === 'ArrowDown') {\n`;
      code += `        e.preventDefault();\n`;
      code += `        const nextIndex = (index + 1) % triggers_${compId}.length;\n`;
      code += `        triggers_${compId}[nextIndex].focus();\n`;
      code += `      } else if (e.key === 'ArrowUp') {\n`;
      code += `        e.preventDefault();\n`;
      code += `        const prevIndex = (index - 1 + triggers_${compId}.length) % triggers_${compId}.length;\n`;
      code += `        triggers_${compId}[prevIndex].focus();\n`;
      code += `      } else if (e.key === 'Home') {\n`;
      code += `        e.preventDefault();\n`;
      code += `        triggers_${compId}[0].focus();\n`;
      code += `      } else if (e.key === 'End') {\n`;
      code += `        e.preventDefault();\n`;
      code += `        triggers_${compId}[triggers_${compId}.length - 1].focus();\n`;
      code += `      }\n`;
      code += `    }, { signal: controller.signal });\n`;
    }
    
    code += `  });\n`;
    
    items.forEach((item, index) => {
      if (item.initialOpen) {
        code += `  if (triggers_${compId}[${index}] && contents_${compId}[${index}]) {\n`;
        if (method === 'class' || method === 'max-height') {
          code += `    contents_${compId}[${index}].classList.add(${JSON.stringify(activeClass)});\n`;
          if (method === 'max-height') {
            code += `    contents_${compId}[${index}].style.maxHeight = contents_${compId}[${index}].scrollHeight + 'px';\n`;
          }
        } else if (method === 'hidden') {
          code += `    contents_${compId}[${index}].hidden = false;\n`;
        } else if (method === 'display') {
          code += `    contents_${compId}[${index}].style.display = '';\n`;
        }
        if (accessibility) {
          code += `    triggers_${compId}[${index}].setAttribute('aria-expanded', 'true');\n`;
          code += `    contents_${compId}[${index}].setAttribute('aria-hidden', 'false');\n`;
        }
        code += `  }\n`;
      }
    });

    return code;
  }

  function generateTabsCode(metadata) {
    const items = metadata.items || [];
    const settings = metadata.settings || {};
    const buttonClass = settings.buttonActiveClass || 'active';
    const panelClass = settings.panelActiveClass || 'active';
    const hideMethod = settings.hideMethod || 'class';
    const defaultIndex = Number(settings.defaultIndex) || 0;
    const keyboard = !!settings.keyboard;
    const keyboardActivation = settings.keyboardActivation || 'automatic';
    const accessibility = settings.accessibility !== false;
    const compId = (metadata.id || 'comp-unknown').replace(/[^a-zA-Z0-9]/g, '_');
    
    let code = `  const tabButtons_${compId} = [\n`;
    items.forEach(item => {
      code += `    document.getElementById(${JSON.stringify(item.tabId)}),\n`;
    });
    code += `  ].filter(Boolean);\n\n`;
    
    code += `  const tabPanels_${compId} = [\n`;
    items.forEach(item => {
      code += `    document.getElementById(${JSON.stringify(item.panelId)}),\n`;
    });
    code += `  ].filter(Boolean);\n\n`;
    
    if (accessibility) {
      if (metadata.tabListId) {
        code += `  const tabList_${compId} = document.getElementById(${JSON.stringify(metadata.tabListId)});\n`;
        code += `  if (tabList_${compId}) tabList_${compId}.setAttribute('role', 'tablist');\n\n`;
      } else {
        code += `  if (tabButtons_${compId}.length > 0 && tabButtons_${compId}[0].parentElement) {\n`;
        code += `    tabButtons_${compId}[0].parentElement.setAttribute('role', 'tablist');\n`;
        code += `  }\n\n`;
      }
    }
    
    code += `  function activateTab_${compId}(index) {\n`;
    code += `    tabButtons_${compId}.forEach((btn, idx) => {\n`;
    code += `      const panel = tabPanels_${compId}[idx];\n`;
    code += `      const isActive = idx === index;\n\n`;
    
    code += `      btn.classList.toggle(${JSON.stringify(buttonClass)}, isActive);\n`;
    if (accessibility) {
      code += `      btn.setAttribute('role', 'tab');\n`;
      code += `      btn.setAttribute('aria-selected', String(isActive));\n`;
      code += `      btn.tabIndex = isActive ? 0 : -1;\n`;
      code += `      if (panel) {\n`;
      code += `        btn.setAttribute('aria-controls', panel.id || '');\n`;
      code += `      }\n`;
    }
    
    code += `\n      if (panel) {\n`;
    if (accessibility) {
      code += `        panel.setAttribute('role', 'tabpanel');\n`;
      code += `        panel.setAttribute('aria-labelledby', btn.id || '');\n`;
      code += `        panel.setAttribute('aria-hidden', String(!isActive));\n`;
    }
    if (hideMethod === 'class') {
      code += `        panel.classList.toggle(${JSON.stringify(panelClass)}, isActive);\n`;
    } else if (hideMethod === 'hidden') {
      code += `        panel.hidden = !isActive;\n`;
    } else if (hideMethod === 'display') {
      code += `        panel.style.display = isActive ? '' : 'none';\n`;
    }
    code += `      }\n`;
    code += `    });\n`;
    code += `  }\n\n`;
    
    code += `  tabButtons_${compId}.forEach((btn, index) => {\n`;
    code += `    btn.addEventListener('click', (e) => {\n`;
    code += `      e.preventDefault();\n`;
    code += `      activateTab_${compId}(index);\n`;
    code += `    }, { signal: controller.signal });\n`;
    
    if (keyboard) {
      code += `    btn.addEventListener('keydown', (e) => {\n`;
      code += `      let targetIndex = -1;\n`;
      code += `      if (e.key === 'ArrowRight') {\n`;
      code += `        targetIndex = (index + 1) % tabButtons_${compId}.length;\n`;
      code += `      } else if (e.key === 'ArrowLeft') {\n`;
      code += `        targetIndex = (index - 1 + tabButtons_${compId}.length) % tabButtons_${compId}.length;\n`;
      code += `      } else if (e.key === 'Home') {\n`;
      code += `        targetIndex = 0;\n`;
      code += `      } else if (e.key === 'End') {\n`;
      code += `        targetIndex = tabButtons_${compId}.length - 1;\n`;
      code += `      } else if (e.key === ' ' || e.key === 'Enter') {\n`;
      code += `        e.preventDefault();\n`;
      code += `        activateTab_${compId}(index);\n`;
      code += `      }\n`;
      code += `      if (targetIndex >= 0 && tabButtons_${compId}[targetIndex]) {\n`;
      code += `        e.preventDefault();\n`;
      code += `        tabButtons_${compId}[targetIndex].focus();\n`;
      code += `        if (${JSON.stringify(keyboardActivation)} === 'automatic') {\n`;
      code += `          activateTab_${compId}(targetIndex);\n`;
      code += `        }\n`;
      code += `      }\n`;
      code += `    }, { signal: controller.signal });\n`;
    }
    code += `  });\n\n`;
    
    code += `  activateTab_${compId}(${defaultIndex});\n`;
    
    return code;
  }

  function generateModalCode(metadata) {
    const settings = (metadata && metadata.settings) || {};
    const compId = ((metadata && metadata.id) || 'modal-unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const method = settings.method || 'class';
    const openClass = settings.openClass || 'open';
    const closeOnCloseTrigger = settings.closeOnCloseTrigger !== false;
    const closeOnEscape = settings.closeOnEscape !== false;
    const closeOnOutsideClick = !!settings.closeOnOutsideClick;
    const closeOnOverlayClick = settings.closeOnOverlayClick !== false;
    const preventCloseInside = settings.preventCloseInside !== false;
    const trapFocus = settings.trapFocus !== false;
    const restoreFocus = settings.restoreFocus !== false;
    const lockBodyScroll = settings.lockBodyScroll !== false;
    const accessibility = settings.accessibility !== false;
    const closeOtherModals = settings.closeOtherModals !== false;
    const openOnLoad = !!settings.openOnLoad;
    const openDelay = Math.max(0, Number(settings.openDelay) || 0);
    const openOnce = !!settings.openOnce;
    const storageKey = settings.storageKey || `osoos-modal-opened-${metadata && metadata.id || 'modal'}`;
    const focusableSelector = 'button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

    let code = '';
    code += `  const descriptorOne_${compId} = (descriptor) => {\n`;
    code += `    if (!descriptor) return null;\n`;
    code += `    if (typeof descriptor === 'string') { try { return document.querySelector(descriptor); } catch (error) { return null; } }\n`;
    code += `    if (descriptor.id) return document.getElementById(descriptor.id);\n`;
    code += `    if (descriptor.selector) { try { return document.querySelector(descriptor.selector); } catch (error) { return null; } }\n`;
    code += `    return null;\n`;
    code += `  };\n`;
    code += `  const descriptorMany_${compId} = (descriptors) => {\n`;
    code += `    const result = [];\n`;
    code += `    (Array.isArray(descriptors) ? descriptors : []).forEach((descriptor) => {\n`;
    code += `      if (!descriptor) return;\n`;
    code += `      if (descriptor.selector && !descriptor.id) {\n`;
    code += `        try { document.querySelectorAll(descriptor.selector).forEach((element) => { if (!result.includes(element)) result.push(element); }); } catch (error) {}\n`;
    code += `      } else { const element = descriptorOne_${compId}(descriptor); if (element && !result.includes(element)) result.push(element); }\n`;
    code += `    });\n`;
    code += `    return result;\n`;
    code += `  };\n\n`;
    code += `  const modal_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata && metadata.modalDescriptor || null)});\n`;
    code += `  if (!modal_${compId}) return;\n`;
    code += `  const openTriggers_${compId} = descriptorMany_${compId}(${JSON.stringify(metadata && metadata.openTriggers || [])});\n`;
    code += `  const closeTriggers_${compId} = descriptorMany_${compId}(${JSON.stringify(metadata && metadata.closeTriggers || [])});\n`;
    code += `  const overlay_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata && metadata.overlayDescriptor || null)});\n`;
    code += `  const title_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata && metadata.titleDescriptor || null)});\n`;
    code += `  const description_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata && metadata.descriptionDescriptor || null)});\n`;
    code += `  let lastTrigger_${compId} = null;\n`;
    code += `  let previousBodyOverflow_${compId} = '';\n`;
    code += `  let isOpen_${compId} = false;\n`;
    code += `  window.__osoos_modal_instances = window.__osoos_modal_instances || {};\n\n`;

    code += `  const setVisible_${compId} = (element, visible) => {\n`;
    code += `    if (!element) return;\n`;
    if (method === 'hidden') {
      code += `    element.hidden = !visible;\n`;
    } else if (method === 'display') {
      code += `    element.style.display = visible ? '' : 'none';\n`;
    } else {
      code += `    element.classList.toggle(${JSON.stringify(openClass)}, visible);\n`;
    }
    code += `  };\n`;
    code += `  const focusables_${compId} = () => Array.from(modal_${compId}.querySelectorAll(${JSON.stringify(focusableSelector)})).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');\n`;

    code += `  const closeModal_${compId} = (options = {}) => {\n`;
    code += `    if (!isOpen_${compId} && !options.force) return;\n`;
    code += `    isOpen_${compId} = false;\n`;
    code += `    setVisible_${compId}(modal_${compId}, false);\n`;
    code += `    setVisible_${compId}(overlay_${compId}, false);\n`;
    if (accessibility) code += `    modal_${compId}.setAttribute('aria-hidden', 'true');\n`;
    if (lockBodyScroll) {
      code += `    const anotherOpen = Object.values(window.__osoos_modal_instances).some((instance) => instance.id !== ${JSON.stringify(metadata && metadata.id || '')} && instance.isOpen());\n`;
      code += `    if (!anotherOpen) document.body.style.overflow = previousBodyOverflow_${compId};\n`;
    }
    if (restoreFocus) code += `    if (!options.skipRestore && lastTrigger_${compId} && typeof lastTrigger_${compId}.focus === 'function') lastTrigger_${compId}.focus();\n`;
    code += `  };\n`;

    code += `  const openModal_${compId} = (trigger) => {\n`;
    if (closeOtherModals) code += `    Object.values(window.__osoos_modal_instances).forEach((instance) => { if (instance.id !== ${JSON.stringify(metadata && metadata.id || '')}) instance.close({ skipRestore: true }); });\n`;
    code += `    lastTrigger_${compId} = trigger || document.activeElement || null;\n`;
    code += `    isOpen_${compId} = true;\n`;
    code += `    setVisible_${compId}(modal_${compId}, true);\n`;
    code += `    setVisible_${compId}(overlay_${compId}, true);\n`;
    if (accessibility) code += `    modal_${compId}.setAttribute('aria-hidden', 'false');\n`;
    if (lockBodyScroll) {
      code += `    previousBodyOverflow_${compId} = document.body.style.overflow;\n`;
      code += `    document.body.style.overflow = 'hidden';\n`;
    }
    if (trapFocus) {
      code += `    const focusable = focusables_${compId}();\n`;
      code += `    const focusTarget = focusable[0] || modal_${compId};\n`;
      code += `    if (typeof focusTarget.focus === 'function') focusTarget.focus();\n`;
    }
    code += `  };\n\n`;

    if (accessibility) {
      code += `  if (title_${compId} && !title_${compId}.id) title_${compId}.id = ${JSON.stringify(`${compId}-title`)};\n`;
      code += `  if (description_${compId} && !description_${compId}.id) description_${compId}.id = ${JSON.stringify(`${compId}-description`)};\n`;
      code += `  modal_${compId}.setAttribute('role', 'dialog');\n`;
      code += `  modal_${compId}.setAttribute('aria-modal', 'true');\n`;
      code += `  modal_${compId}.setAttribute('aria-hidden', 'true');\n`;
      code += `  if (!modal_${compId}.hasAttribute('tabindex')) modal_${compId}.setAttribute('tabindex', '-1');\n`;
      code += `  if (title_${compId} && title_${compId}.id) modal_${compId}.setAttribute('aria-labelledby', title_${compId}.id);\n`;
      code += `  if (description_${compId} && description_${compId}.id) modal_${compId}.setAttribute('aria-describedby', description_${compId}.id);\n`;
    }
    code += `  closeModal_${compId}({ force: true, skipRestore: true });\n`;
    code += `  window.__osoos_modal_instances[${JSON.stringify(metadata && metadata.id || '')}] = { id: ${JSON.stringify(metadata && metadata.id || '')}, open: openModal_${compId}, close: closeModal_${compId}, isOpen: () => isOpen_${compId} };\n`;
    code += `  controller.signal.addEventListener('abort', () => {\n`;
    code += `    closeModal_${compId}({ skipRestore: true });\n`;
    code += `    if (window.__osoos_modal_instances[${JSON.stringify(metadata && metadata.id || '')}] && window.__osoos_modal_instances[${JSON.stringify(metadata && metadata.id || '')}].close === closeModal_${compId}) delete window.__osoos_modal_instances[${JSON.stringify(metadata && metadata.id || '')}];\n`;
    code += `  });\n`;
    code += `  openTriggers_${compId}.forEach((trigger) => trigger.addEventListener('click', (event) => { event.preventDefault(); openModal_${compId}(trigger); }, { signal: controller.signal }));\n`;
    if (closeOnCloseTrigger) code += `  closeTriggers_${compId}.forEach((trigger) => trigger.addEventListener('click', (event) => { event.preventDefault(); closeModal_${compId}(); }, { signal: controller.signal }));\n`;
    if (closeOnOverlayClick) code += `  if (overlay_${compId}) overlay_${compId}.addEventListener('click', (event) => { if (event.target === overlay_${compId}) closeModal_${compId}(); }, { signal: controller.signal });\n`;
    if (closeOnOutsideClick) {
      code += `  document.addEventListener('click', (event) => {\n`;
      code += `    if (!isOpen_${compId}) return;\n`;
      if (preventCloseInside) code += `    if (modal_${compId}.contains(event.target)) return;\n`;
      code += `    if (openTriggers_${compId}.some((trigger) => trigger === event.target || trigger.contains(event.target))) return;\n`;
      code += `    closeModal_${compId}();\n`;
      code += `  }, { signal: controller.signal });\n`;
    }
    if (closeOnEscape || trapFocus) {
      code += `  document.addEventListener('keydown', (event) => {\n`;
      code += `    if (!isOpen_${compId}) return;\n`;
      if (closeOnEscape) code += `    if (event.key === 'Escape') { event.preventDefault(); closeModal_${compId}(); return; }\n`;
      if (trapFocus) {
        code += `    if (event.key !== 'Tab') return;\n`;
        code += `    const focusable = focusables_${compId}();\n`;
        code += `    if (!focusable.length) { event.preventDefault(); modal_${compId}.focus(); return; }\n`;
        code += `    const first = focusable[0]; const last = focusable[focusable.length - 1];\n`;
        code += `    if (event.shiftKey && (document.activeElement === first || !modal_${compId}.contains(document.activeElement))) { event.preventDefault(); last.focus(); }\n`;
        code += `    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }\n`;
      }
      code += `  }, { signal: controller.signal });\n`;
    }

    if (openOnLoad || openDelay > 0) {
      code += `  const autoOpen_${compId} = () => {\n`;
      if (openOnce) {
        code += `    try { if (localStorage.getItem(${JSON.stringify(storageKey)}) === '1') return; localStorage.setItem(${JSON.stringify(storageKey)}, '1'); } catch (error) {}\n`;
      }
      code += `    openModal_${compId}(null);\n`;
      code += `  };\n`;
      if (openDelay > 0) {
        code += `  const autoTimer_${compId} = window.setTimeout(autoOpen_${compId}, ${openDelay});\n`;
        code += `  controller.signal.addEventListener('abort', () => window.clearTimeout(autoTimer_${compId}));\n`;
      } else {
        code += `  autoOpen_${compId}();\n`;
      }
    }
    return code;
  }

  function generateDropdownCode(metadata) {
    const settings = (metadata && metadata.settings) || {};
    const compId = ((metadata && metadata.id) || 'dropdown-unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const mode = metadata.mode || 'manual';
    const method = settings.method || 'class';
    const openClass = settings.openClass || 'open';
    const activation = settings.activation || 'click';
    const closeOnEscape = settings.closeOnEscape !== false;
    const closeOnOutsideClick = settings.closeOnOutsideClick !== false;
    const closeOnItemClick = !!settings.closeOnItemClick;
    const closeOthers = settings.closeOthers !== false;
    const restoreFocus = settings.restoreFocus !== false;
    const focusFirstItemOnOpen = !!settings.focusFirstItemOnOpen;
    const accessibility = settings.accessibility !== false;
    const openOnLoad = !!settings.openOnLoad;
    const openDelay = Math.max(0, Number(settings.openDelay) || 0);
    const closeDelay = Math.max(0, Number(settings.closeDelay) || 0);

    let code = '';
    code += `  const descriptorOne_${compId} = (descriptor) => {\n`;
    code += `    if (!descriptor) return null;\n`;
    code += `    if (typeof descriptor === 'string') { try { return document.querySelector(descriptor); } catch (error) { return null; } }\n`;
    code += `    if (descriptor.id) return document.getElementById(descriptor.id);\n`;
    code += `    if (descriptor.selector) { try { return document.querySelector(descriptor.selector); } catch (error) { return null; } }\n`;
    code += `    return null;\n`;
    code += `  };\n`;
    code += `  const descriptorMany_${compId} = (descriptors) => {\n`;
    code += `    const result = [];\n`;
    code += `    (Array.isArray(descriptors) ? descriptors : []).forEach((descriptor) => {\n`;
    code += `      if (!descriptor) return;\n`;
    code += `      if (descriptor.selector && !descriptor.id) {\n`;
    code += `        try { document.querySelectorAll(descriptor.selector).forEach((element) => { if (!result.includes(element)) result.push(element); }); } catch (error) {}\n`;
    code += `      } else { const element = descriptorOne_${compId}(descriptor); if (element && !result.includes(element)) result.push(element); }\n`;
    code += `    });\n`;
    code += `    return result;\n`;
    code += `  };\n\n`;

    if (mode === 'container') {
      code += `  const wrapper_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata.wrapperDescriptor || null)});\n`;
      code += `  const rootNode_${compId} = wrapper_${compId} || document;\n`;
      code += `  const trigger_${compId} = rootNode_${compId}.querySelector(${JSON.stringify(metadata.triggerDescriptor && metadata.triggerDescriptor.selector || '')});\n`;
      code += `  const menu_${compId} = rootNode_${compId}.querySelector(${JSON.stringify(metadata.menuDescriptor && metadata.menuDescriptor.selector || '')});\n`;
    } else {
      code += `  const trigger_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata.triggerDescriptor || null)});\n`;
      code += `  const menu_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata.menuDescriptor || null)});\n`;
    }

    code += `  if (!trigger_${compId} || !menu_${compId}) return;\n`;

    if (mode === 'container') {
      code += `  const getItems_${compId} = () => {\n`;
      code += `    try { return Array.from(rootNode_${compId}.querySelectorAll(${JSON.stringify(metadata.itemDescriptors && metadata.itemDescriptors[0] && metadata.itemDescriptors[0].selector || 'a,button')})).filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true'); }\n`;
      code += `    catch (e) { return []; }\n`;
      code += `  };\n`;
    } else {
      code += `  const staticItems_${compId} = descriptorMany_${compId}(${JSON.stringify(metadata.itemDescriptors || [])});\n`;
      code += `  const getItems_${compId} = () => staticItems_${compId};\n`;
    }

    code += `  let isOpen_${compId} = false;\n`;
    code += `  let hoverTimer_${compId} = null;\n`;
    code += `  let closeTimer_${compId} = null;\n`;
    code += `  window.__osoos_dropdown_instances = window.__osoos_dropdown_instances || {};\n\n`;

    code += `  const setVisible_${compId} = (element, visible) => {\n`;
    code += `    if (!element) return;\n`;
    code += `    if (${JSON.stringify(method)} === 'hidden') {\n`;
    code += `      element.hidden = !visible;\n`;
    code += `    } else if (${JSON.stringify(method)} === 'display') {\n`;
    code += `      element.style.display = visible ? '' : 'none';\n`;
    code += `    } else {\n`;
    code += `      element.classList.toggle(${JSON.stringify(openClass)}, visible);\n`;
    code += `    }\n`;
    code += `  };\n\n`;

    code += `  const openDropdown_${compId} = (focusFirst = false) => {\n`;
    code += `    if (isOpen_${compId}) return;\n`;
    if (closeOthers) {
      code += `    Object.values(window.__osoos_dropdown_instances).forEach((instance) => {\n`;
      code += `      if (instance.id !== ${JSON.stringify(metadata.id)}) instance.close();\n`;
      code += `    });\n`;
    }
    code += `    isOpen_${compId} = true;\n`;
    code += `    setVisible_${compId}(menu_${compId}, true);\n`;
    if (accessibility) {
      code += `    trigger_${compId}.setAttribute('aria-expanded', 'true');\n`;
      code += `    menu_${compId}.setAttribute('aria-hidden', 'false');\n`;
      code += `    applyItemAttrs_${compId}();\n`;
    }
    code += `    if (focusFirst) {\n`;
    code += `      const currentItems = getItems_${compId}();\n`;
    code += `      if (currentItems[0] && typeof currentItems[0].focus === 'function') currentItems[0].focus();\n`;
    code += `    }\n`;
    code += `  };\n\n`;

    code += `  const closeDropdown_${compId} = () => {\n`;
    code += `    if (!isOpen_${compId}) return;\n`;
    code += `    isOpen_${compId} = false;\n`;
    code += `    setVisible_${compId}(menu_${compId}, false);\n`;
    if (accessibility) {
      code += `    trigger_${compId}.setAttribute('aria-expanded', 'false');\n`;
      code += `    menu_${compId}.setAttribute('aria-hidden', 'true');\n`;
    }
    code += `    if (${JSON.stringify(restoreFocus)} && typeof trigger_${compId}.focus === 'function') trigger_${compId}.focus();\n`;
    code += `  };\n\n`;

    code += `  const toggleDropdown_${compId} = () => {\n`;
    code += `    if (isOpen_${compId}) closeDropdown_${compId}();\n`;
    code += `    else openDropdown_${compId}(${focusFirstItemOnOpen});\n`;
    code += `  };\n\n`;

    code += `  window.__osoos_dropdown_instances[${JSON.stringify(metadata.id)}] = {\n`;
    code += `    id: ${JSON.stringify(metadata.id)},\n`;
    code += `    open: () => openDropdown_${compId}(false),\n`;
    code += `    close: closeDropdown_${compId},\n`;
    code += `    isOpen: () => isOpen_${compId}\n`;
    code += `  };\n\n`;

    code += `  controller.signal.addEventListener('abort', () => {\n`;
    code += `    closeDropdown_${compId}();\n`;
    code += `    if (window.__osoos_dropdown_instances[${JSON.stringify(metadata.id)}] && window.__osoos_dropdown_instances[${JSON.stringify(metadata.id)}].close === closeDropdown_${compId}) delete window.__osoos_dropdown_instances[${JSON.stringify(metadata.id)}];\n`;
    code += `  });\n\n`;

    if (accessibility) {
      code += `  trigger_${compId}.setAttribute('aria-haspopup', 'menu');\n`;
      code += `  trigger_${compId}.setAttribute('aria-expanded', 'false');\n`;
      code += `  if (menu_${compId} && !menu_${compId}.id) menu_${compId}.id = ${JSON.stringify(`${compId}-menu`)};\n`;
      code += `  if (menu_${compId} && menu_${compId}.id) trigger_${compId}.setAttribute('aria-controls', menu_${compId}.id);\n`;
      code += `  menu_${compId}.setAttribute('role', 'menu');\n`;
      code += `  menu_${compId}.setAttribute('aria-hidden', 'true');\n`;
      code += `  if (trigger_${compId}.tagName !== 'BUTTON') {\n`;
      code += `    if (!trigger_${compId}.hasAttribute('role')) trigger_${compId}.setAttribute('role', 'button');\n`;
      code += `    if (!trigger_${compId}.hasAttribute('tabindex')) trigger_${compId}.setAttribute('tabindex', '0');\n`;
      code += `  }\n`;
      code += `  const applyItemAttrs_${compId} = () => {\n`;
      code += `    getItems_${compId}().forEach(item => {\n`;
      code += `      if (!item.hasAttribute('role')) item.setAttribute('role', 'menuitem');\n`;
      code += `      if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '-1');\n`;
      code += `    });\n`;
      code += `  };\n`;
      code += `  applyItemAttrs_${compId}();\n`;
    }

    code += `  setVisible_${compId}(menu_${compId}, false);\n`;

    if (activation === 'click') {
      code += `  trigger_${compId}.addEventListener('click', (event) => {\n`;
      code += `    event.preventDefault();\n`;
      code += `    toggleDropdown_${compId}();\n`;
      code += `  }, { signal: controller.signal });\n`;
    } else if (activation === 'hover') {
      code += `  trigger_${compId}.addEventListener('mouseenter', () => {\n`;
      code += `    window.clearTimeout(closeTimer_${compId});\n`;
      if (openDelay > 0) {
        code += `    hoverTimer_${compId} = window.setTimeout(() => openDropdown_${compId}(false), ${openDelay});\n`;
      } else {
        code += `    openDropdown_${compId}(false);\n`;
      }
      code += `  }, { signal: controller.signal });\n`;

      code += `  trigger_${compId}.addEventListener('mouseleave', () => {\n`;
      code += `    window.clearTimeout(hoverTimer_${compId});\n`;
      if (closeDelay > 0) {
        code += `    closeTimer_${compId} = window.setTimeout(closeDropdown_${compId}, ${closeDelay});\n`;
      } else {
        code += `    closeDropdown_${compId}();\n`;
      }
      code += `  }, { signal: controller.signal });\n`;

      code += `  menu_${compId}.addEventListener('mouseenter', () => {\n`;
      code += `    window.clearTimeout(closeTimer_${compId});\n`;
      code += `  }, { signal: controller.signal });\n`;

      code += `  menu_${compId}.addEventListener('mouseleave', () => {\n`;
      if (closeDelay > 0) {
        code += `    closeTimer_${compId} = window.setTimeout(closeDropdown_${compId}, ${closeDelay});\n`;
      } else {
        code += `    closeDropdown_${compId}();\n`;
      }
      code += `  }, { signal: controller.signal });\n`;
    } else if (activation === 'focus') {
      code += `  trigger_${compId}.addEventListener('focus', () => {\n`;
      code += `    openDropdown_${compId}(false);\n`;
      code += `  }, { signal: controller.signal });\n`;

      code += `  trigger_${compId}.addEventListener('blur', () => {\n`;
      code += `    window.setTimeout(() => {\n`;
      code += `      if (!menu_${compId}.contains(document.activeElement) && document.activeElement !== trigger_${compId}) closeDropdown_${compId}();\n`;
      code += `    }, 50);\n`;
      code += `  }, { signal: controller.signal });\n`;

      code += `  menu_${compId}.addEventListener('focusout', () => {\n`;
      code += `    window.setTimeout(() => {\n`;
      code += `      if (!menu_${compId}.contains(document.activeElement) && document.activeElement !== trigger_${compId}) closeDropdown_${compId}();\n`;
      code += `    }, 50);\n`;
      code += `  }, { signal: controller.signal });\n`;
    }

    code += `  const handleKeydown_${compId} = (event) => {\n`;
    code += `    if (!isOpen_${compId}) {\n`;
    code += `      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {\n`;
    code += `        event.preventDefault();\n`;
    code += `        openDropdown_${compId}(true);\n`;
    code += `      }\n`;
    code += `      return;\n`;
    code += `    }\n`;
    code += `    const currentItems = getItems_${compId}();\n`;
    code += `    const activeIdx = currentItems.indexOf(document.activeElement);\n`;
    code += `    if (event.key === 'ArrowDown') {\n`;
    code += `      event.preventDefault();\n`;
    code += `      const nextIdx = activeIdx < 0 ? 0 : (activeIdx + 1) % currentItems.length;\n`;
    code += `      if (currentItems[nextIdx]) currentItems[nextIdx].focus();\n`;
    code += `    } else if (event.key === 'ArrowUp') {\n`;
    code += `      event.preventDefault();\n`;
    code += `      const prevIdx = activeIdx < 0 ? currentItems.length - 1 : (activeIdx - 1 + currentItems.length) % currentItems.length;\n`;
    code += `      if (currentItems[prevIdx]) currentItems[prevIdx].focus();\n`;
    code += `    } else if (event.key === 'Home') {\n`;
    code += `      event.preventDefault();\n`;
    code += `      if (currentItems[0]) currentItems[0].focus();\n`;
    code += `    } else if (event.key === 'End') {\n`;
    code += `      event.preventDefault();\n`;
    code += `      if (currentItems[currentItems.length - 1]) currentItems[currentItems.length - 1].focus();\n`;
    code += `    } else if (event.key === 'Escape') {\n`;
    code += `      event.preventDefault();\n`;
    code += `      closeDropdown_${compId}();\n`;
    code += `    } else if (event.key === 'Tab') {\n`;
    code += `      window.setTimeout(() => {\n`;
    code += `        if (!menu_${compId}.contains(document.activeElement) && document.activeElement !== trigger_${compId}) closeDropdown_${compId}();\n`;
    code += `      }, 20);\n`;
    code += `    }\n`;
    code += `  };\n\n`;

    code += `  trigger_${compId}.addEventListener('keydown', handleKeydown_${compId}, { signal: controller.signal });\n`;
    code += `  menu_${compId}.addEventListener('keydown', handleKeydown_${compId}, { signal: controller.signal });\n`;

    if (closeOnEscape) {
      code += `  document.addEventListener('keydown', (event) => {\n`;
      code += `    if (event.key === 'Escape' && isOpen_${compId}) {\n`;
      code += `      event.preventDefault();\n`;
      code += `      closeDropdown_${compId}();\n`;
      code += `    }\n`;
      code += `  }, { signal: controller.signal });\n`;
    }

    if (closeOnOutsideClick) {
      code += `  document.addEventListener('click', (event) => {\n`;
      code += `    if (!isOpen_${compId}) return;\n`;
      code += `    if (trigger_${compId}.contains(event.target) || menu_${compId}.contains(event.target)) return;\n`;
      code += `    closeDropdown_${compId}();\n`;
      code += `  }, { signal: controller.signal });\n`;
    }

    if (closeOnItemClick) {
      code += `  menu_${compId}.addEventListener('click', (event) => {\n`;
      code += `    const currentItems = getItems_${compId}();\n`;
      code += `    if (currentItems.some(item => item === event.target || item.contains(event.target))) {\n`;
      code += `      closeDropdown_${compId}();\n`;
      code += `    }\n`;
      code += `  }, { signal: controller.signal });\n`;
    }

    if (openOnLoad) {
      code += `  openDropdown_${compId}(false);\n`;
    }

    return code;
  }

  function generateSidebarCode(metadata) {
    const settings = (metadata && metadata.settings) || {};
    const compId = ((metadata && metadata.id) || 'sidebar-unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const id = metadata.id || '';
    const method = settings.method || 'class';
    const openClass = settings.openClass || 'open';
    const position = settings.position || 'left';
    const behavior = settings.behavior || 'overlay';
    const closeOnEscape = settings.closeOnEscape !== false;
    const closeOnOutsideClick = settings.closeOnOutsideClick !== false;
    const closeOnOverlayClick = settings.closeOnOverlayClick !== false;
    const closeOnItemClick = !!settings.closeOnItemClick;
    const closeOthers = settings.closeOthers !== false;
    const restoreFocus = settings.restoreFocus !== false;
    const focusFirstItemOnOpen = !!settings.focusFirstItemOnOpen;
    const trapFocus = !!settings.trapFocus;
    const lockBodyScroll = settings.lockBodyScroll !== false;
    const accessibility = settings.accessibility !== false;
    const openOnLoad = !!settings.openOnLoad;
    const openDelay = Math.max(0, Number(settings.openDelay) || 0);
    const closeDelay = Math.max(0, Number(settings.closeDelay) || 0);
    const openOnce = !!settings.openOnce;

    let code = '';
    code += `  const descriptorOne_${compId} = (descriptor) => {\n`;
    code += `    if (!descriptor) return null;\n`;
    code += `    if (typeof descriptor === 'string') { try { return document.querySelector(descriptor); } catch (error) { return null; } }\n`;
    code += `    if (descriptor.id) return document.getElementById(descriptor.id);\n`;
    code += `    if (descriptor.selector) { try { return document.querySelector(descriptor.selector); } catch (error) { return null; } }\n`;
    code += `    return null;\n`;
    code += `  };\n`;
    code += `  const descriptorMany_${compId} = (descriptors) => {\n`;
    code += `    const result = [];\n`;
    code += `    (Array.isArray(descriptors) ? descriptors : []).forEach((descriptor) => {\n`;
    code += `      if (!descriptor) return;\n`;
    code += `      if (descriptor.selector && !descriptor.id) {\n`;
    code += `        try { document.querySelectorAll(descriptor.selector).forEach((element) => { if (!result.includes(element)) result.push(element); }); } catch (error) {}\n`;
    code += `      } else { const element = descriptorOne_${compId}(descriptor); if (element && !result.includes(element)) result.push(element); }\n`;
    code += `    });\n`;
    code += `    return result;\n`;
    code += `  };\n\n`;

    code += `  const sidebar_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata.sidebarDescriptor || null)});\n`;
    code += `  const openTriggers_${compId} = descriptorMany_${compId}(${JSON.stringify(metadata.openTriggers || [])});\n`;
    code += `  const closeTriggers_${compId} = descriptorMany_${compId}(${JSON.stringify(metadata.closeTriggers || [])});\n`;
    code += `  const overlay_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata.overlayDescriptor || null)});\n`;
    code += `  const navItems_${compId} = descriptorMany_${compId}(${JSON.stringify(metadata.navItemDescriptors || [])});\n`;
    code += `  const title_${compId} = descriptorOne_${compId}(${JSON.stringify(metadata.titleDescriptor || null)});\n\n`;

    code += `  if (!sidebar_${compId}) return;\n\n`;

    code += `  let isOpen_${compId} = false;\n`;
    code += `  let lastTrigger_${compId} = null;\n`;
    code += `  let previousBodyOverflow_${compId} = null;\n`;
    code += `  let openTimer_${compId} = null;\n`;
    code += `  let closeTimer_${compId} = null;\n\n`;

    if (method === 'transform') {
      code += `  sidebar_${compId}.style.transition = 'transform 0.3s ease';\n`;
      code += `  if (sidebar_${compId}.style.transform === '') {\n`;
      if (position === 'left') code += `    sidebar_${compId}.style.transform = 'translateX(-100%)';\n`;
      else if (position === 'right') code += `    sidebar_${compId}.style.transform = 'translateX(100%)';\n`;
      else if (position === 'top') code += `    sidebar_${compId}.style.transform = 'translateY(-100%)';\n`;
      else if (position === 'bottom') code += `    sidebar_${compId}.style.transform = 'translateY(100%)';\n`;
      code += `  }\n\n`;
    }

    code += `  const focusables_${compId} = () => {\n`;
    code += `    return Array.from(sidebar_${compId}.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))\n`;
    code += `      .filter(el => !el.hasAttribute('disabled') && el.getBoundingClientRect().width > 0);\n`;
    code += `  };\n\n`;

    code += `  const setVisible_${compId} = (element, visible) => {\n`;
    code += `    if (!element) return;\n`;
    code += `    if (element === sidebar_${compId} && ${JSON.stringify(method)} === 'transform') {\n`;
    code += `      element.style.transform = visible ? 'translate(0, 0)' : ${JSON.stringify(position === 'left' ? 'translateX(-100%)' : position === 'right' ? 'translateX(100%)' : position === 'top' ? 'translateY(-100%)' : 'translateY(100%)')};\n`;
    code += `      return;\n`;
    code += `    }\n`;
    code += `    if (${JSON.stringify(method)} === 'class') {\n`;
    code += `      if (visible) element.classList.add(${JSON.stringify(openClass)});\n`;
    code += `      else element.classList.remove(${JSON.stringify(openClass)});\n`;
    code += `    } else if (${JSON.stringify(method)} === 'hidden') {\n`;
    code += `      element.hidden = !visible;\n`;
    code += `    } else if (${JSON.stringify(method)} === 'display') {\n`;
    code += `      element.style.display = visible ? 'block' : 'none';\n`;
    code += `    }\n`;
    code += `  };\n\n`;

    code += `  const setOverlayVisible_${compId} = (element, visible) => {\n`;
    code += `    if (!element) return;\n`;
    code += `    if (${JSON.stringify(method)} === 'class' || ${JSON.stringify(method)} === 'transform') {\n`;
    code += `      if (visible) element.classList.add(${JSON.stringify(openClass)});\n`;
    code += `      else element.classList.remove(${JSON.stringify(openClass)});\n`;
    code += `    } else if (${JSON.stringify(method)} === 'hidden') {\n`;
    code += `      element.hidden = !visible;\n`;
    code += `    } else if (${JSON.stringify(method)} === 'display') {\n`;
    code += `      element.style.display = visible ? 'block' : 'none';\n`;
    code += `    }\n`;
    code += `  };\n\n`;

    code += `  setVisible_${compId}(sidebar_${compId}, false);\n`;
    code += `  setOverlayVisible_${compId}(overlay_${compId}, false);\n\n`;

    code += `  const openSidebar_${compId} = (trigger) => {\n`;
    code += `    if (isOpen_${compId}) return;\n`;
    if (closeOthers) {
      code += `    if (window.__osoos_sidebar_instances) {\n`;
      code += `      Object.keys(window.__osoos_sidebar_instances).forEach((instanceId) => {\n`;
      code += `        if (instanceId !== ${JSON.stringify(id)} && typeof window.__osoos_sidebar_instances[instanceId] === 'function') {\n`;
      code += `          window.__osoos_sidebar_instances[instanceId]();\n`;
      code += `        }\n`;
      code += `      });\n`;
      code += `    }\n`;
    }
    code += `    lastTrigger_${compId} = trigger || document.activeElement || null;\n`;
    code += `    isOpen_${compId} = true;\n`;
    code += `    setVisible_${compId}(sidebar_${compId}, true);\n`;
    code += `    setOverlayVisible_${compId}(overlay_${compId}, true);\n`;
    code += `    document.body.classList.add(${JSON.stringify(`sidebar-open-${position}`)});\n`;
    if (behavior === 'push') {
      code += `    document.body.classList.add('sidebar-push');\n`;
    }
    if (accessibility) {
      code += `    sidebar_${compId}.setAttribute('aria-hidden', 'false');\n`;
      code += `    openTriggers_${compId}.forEach((t) => t.setAttribute('aria-expanded', 'true'));\n`;
    }
    if (lockBodyScroll) {
      code += `    previousBodyOverflow_${compId} = document.body.style.overflow;\n`;
      code += `    document.body.style.overflow = 'hidden';\n`;
    }
    if (focusFirstItemOnOpen) {
      code += `    const focusable = focusables_${compId}();\n`;
      code += `    const target = focusable[0] || sidebar_${compId};\n`;
      code += `    if (target && typeof target.focus === 'function') target.focus();\n`;
    }
    code += `  };\n\n`;

    code += `  const closeSidebar_${compId} = (options = {}) => {\n`;
    code += `    if (!isOpen_${compId}) return;\n`;
    code += `    isOpen_${compId} = false;\n`;
    code += `    setVisible_${compId}(sidebar_${compId}, false);\n`;
    code += `    setOverlayVisible_${compId}(overlay_${compId}, false);\n`;
    code += `    document.body.classList.remove(${JSON.stringify(`sidebar-open-${position}`)});\n`;
    if (behavior === 'push') {
      code += `    document.body.classList.remove('sidebar-push');\n`;
    }
    if (accessibility) {
      code += `    sidebar_${compId}.setAttribute('aria-hidden', 'true');\n`;
      code += `    openTriggers_${compId}.forEach((t) => t.setAttribute('aria-expanded', 'false'));\n`;
    }
    if (lockBodyScroll) {
      code += `    if (previousBodyOverflow_${compId} !== null) {\n`;
      code += `      document.body.style.overflow = previousBodyOverflow_${compId};\n`;
      code += `      previousBodyOverflow_${compId} = null;\n`;
      code += `    }\n`;
    }
    if (restoreFocus) {
      code += `    if (!options.skipRestore && lastTrigger_${compId}) {\n`;
      code += `      if (typeof lastTrigger_${compId}.focus === 'function') lastTrigger_${compId}.focus();\n`;
      code += `    }\n`;
    }
    code += `  };\n\n`;

    code += `  const triggerClose_${compId} = () => {\n`;
    code += `    if (openTimer_${compId}) { clearTimeout(openTimer_${compId}); openTimer_${compId} = null; }\n`;
    code += `    if (${closeDelay} > 0) {\n`;
    code += `      closeTimer_${compId} = setTimeout(() => closeSidebar_${compId}(), ${closeDelay});\n`;
    code += `    } else {\n`;
    code += `      closeSidebar_${compId}();\n`;
    code += `    }\n`;
    code += `  };\n\n`;

    if (accessibility) {
      code += `  if (sidebar_${compId}) {\n`;
      code += `    sidebar_${compId}.setAttribute('aria-hidden', 'true');\n`;
      code += `    if (!sidebar_${compId}.hasAttribute('tabindex')) sidebar_${compId}.setAttribute('tabindex', '-1');\n`;
      if (settings.role === 'navigation') {
        code += `    sidebar_${compId}.setAttribute('role', 'navigation');\n`;
      } else {
        code += `    sidebar_${compId}.setAttribute('role', 'dialog');\n`;
        code += `    sidebar_${compId}.setAttribute('aria-modal', ${JSON.stringify(String(!!trapFocus))});\n`;
      }
      code += `  }\n`;
      code += `  openTriggers_${compId}.forEach((trigger) => {\n`;
      code += `    trigger.setAttribute('aria-expanded', 'false');\n`;
      code += `    if (sidebar_${compId}.id) trigger.setAttribute('aria-controls', sidebar_${compId}.id);\n`;
      code += `  });\n`;
      code += `  closeTriggers_${compId}.forEach((trigger) => {\n`;
      code += `    if (!trigger.textContent.trim() && !trigger.hasAttribute('aria-label')) {\n`;
      code += `      trigger.setAttribute('aria-label', 'Close');\n`;
      code += `    }\n`;
      code += `  });\n\n`;
    }

    code += `  if (typeof window.__osoos_sidebar_instances === 'undefined') {\n`;
    code += `    window.__osoos_sidebar_instances = {};\n`;
    code += `  }\n`;
    code += `  window.__osoos_sidebar_instances[${JSON.stringify(id)}] = () => {\n`;
    code += `    closeSidebar_${compId}({ skipRestore: true });\n`;
    code += `  };\n\n`;

    code += `  controller.signal.addEventListener('abort', () => {\n`;
    code += `    closeSidebar_${compId}({ skipRestore: true });\n`;
    code += `    if (openTimer_${compId}) clearTimeout(openTimer_${compId});\n`;
    code += `    if (closeTimer_${compId}) clearTimeout(closeTimer_${compId});\n`;
    code += `    if (window.__osoos_sidebar_instances && window.__osoos_sidebar_instances[${JSON.stringify(id)}]) {\n`;
    code += `      delete window.__osoos_sidebar_instances[${JSON.stringify(id)}];\n`;
    code += `    }\n`;
    code += `  });\n\n`;

    code += `  openTriggers_${compId}.forEach((trigger) => {\n`;
    code += `    trigger.addEventListener('click', (event) => {\n`;
    code += `      event.preventDefault();\n`;
    code += `      if (closeTimer_${compId}) { clearTimeout(closeTimer_${compId}); closeTimer_${compId} = null; }\n`;
    code += `      if (${openDelay} > 0) {\n`;
    code += `        openTimer_${compId} = setTimeout(() => openSidebar_${compId}(trigger), ${openDelay});\n`;
    code += `      } else {\n`;
    code += `        openSidebar_${compId}(trigger);\n`;
    code += `      }\n`;
    code += `    }, { signal: controller.signal });\n`;
    code += `  });\n\n`;

    code += `  closeTriggers_${compId}.forEach((trigger) => {\n`;
    code += `    trigger.addEventListener('click', (event) => {\n`;
    code += `      event.preventDefault();\n`;
    code += `      triggerClose_${compId}();\n`;
    code += `    }, { signal: controller.signal });\n`;
    code += `  });\n\n`;

    if (closeOnOverlayClick) {
      code += `  if (overlay_${compId}) {\n`;
      code += `    overlay_${compId}.addEventListener('click', (event) => {\n`;
      code += `      if (event.target === overlay_${compId}) {\n`;
      code += `        triggerClose_${compId}();\n`;
      code += `      }\n`;
      code += `    }, { signal: controller.signal });\n`;
      code += `  }\n\n`;
    }

    if (closeOnOutsideClick) {
      code += `  document.addEventListener('click', (event) => {\n`;
      code += `    if (!isOpen_${compId}) return;\n`;
      code += `    if (sidebar_${compId}.contains(event.target)) return;\n`;
      code += `    if (openTriggers_${compId}.some((t) => t === event.target || t.contains(event.target))) return;\n`;
      code += `    if (overlay_${compId} && (overlay_${compId} === event.target || overlay_${compId}.contains(event.target))) return;\n`;
      code += `    triggerClose_${compId}();\n`;
      code += `  }, { signal: controller.signal });\n\n`;
    }

    if (closeOnItemClick) {
      code += `  navItems_${compId}.forEach((item) => {\n`;
      code += `    item.addEventListener('click', () => triggerClose_${compId}(), { signal: controller.signal });\n`;
      code += `  });\n\n`;
    }

    if (closeOnEscape || trapFocus) {
      code += `  document.addEventListener('keydown', (event) => {\n`;
      code += `    if (!isOpen_${compId}) return;\n`;
      code += `    if (${String(closeOnEscape)} && event.key === 'Escape') {\n`;
      code += `      event.preventDefault();\n`;
      code += `      triggerClose_${compId}();\n`;
      code += `      return;\n`;
      code += `    }\n`;
      if (trapFocus) {
        code += `    if (event.key === 'Tab') {\n`;
        code += `      const focusable = focusables_${compId}();\n`;
        code += `      if (!focusable.length) { event.preventDefault(); sidebar_${compId}.focus(); return; }\n`;
        code += `      const first = focusable[0]; const last = focusable[focusable.length - 1];\n`;
        code += `      if (event.shiftKey && (document.activeElement === first || !sidebar_${compId}.contains(document.activeElement))) {\n`;
        code += `        event.preventDefault(); last.focus();\n`;
        code += `      } else if (!event.shiftKey && document.activeElement === last) {\n`;
        code += `        event.preventDefault(); first.focus();\n`;
        code += `      }\n`;
        code += `    }\n`;
      }
      code += `  }, { signal: controller.signal });\n\n`;
    }

    if (openOnLoad || openDelay > 0) {
      code += `  const autoOpen_${compId} = () => {\n`;
      if (openOnce) {
        code += `    if (localStorage.getItem('__osoos_sidebar_opened_' + ${JSON.stringify(id)})) return;\n`;
        code += `    localStorage.setItem('__osoos_sidebar_opened_' + ${JSON.stringify(id)}, 'true');\n`;
      }
      code += `    openSidebar_${compId}();\n`;
      code += `  };\n`;
      if (openDelay > 0) {
        code += `    const timer = setTimeout(autoOpen_${compId}, ${openDelay});\n`;
        code += `    controller.signal.addEventListener('abort', () => clearTimeout(timer));\n`;
      } else {
        code += `    autoOpen_${compId}();\n`;
      }
    }

    return code;
  }

  function generateComponentBlock(component) {
    const id = component.id;
    const type = component.componentType;
    const encodedData = encodeURIComponent(JSON.stringify(component.metadata));
    const compId = (id || 'comp-unknown').replace(/[^a-zA-Z0-9]/g, '_');
    
    let executableCode = `(function() {\n`;
    executableCode += `  // AbortController registry for cleanup\n`;
    executableCode += `  if (typeof window.__osoos_component_registry === 'undefined') {\n`;
    executableCode += `    window.__osoos_component_registry = {};\n`;
    executableCode += `  }\n`;
    executableCode += `  if (window.__osoos_component_registry[${JSON.stringify(id)}]) {\n`;
    executableCode += `    window.__osoos_component_registry[${JSON.stringify(id)}].abort();\n`;
    executableCode += `  }\n`;
    executableCode += `  const controller = new AbortController();\n`;
    executableCode += `  window.__osoos_component_registry[${JSON.stringify(id)}] = controller;\n\n`;
    
    if (type === 'accordion') {
      executableCode += generateAccordionCode(component.metadata);
      // Add ResizeObserver for max-height method
      const settings = (component.metadata && component.metadata.settings) || {};
      if (settings.method === 'max-height') {
        executableCode += `\n  // ResizeObserver for max-height recalculation\n`;
        executableCode += `  if (typeof ResizeObserver !== 'undefined') {\n`;
        executableCode += `    const resizeObs_${compId} = new ResizeObserver((entries) => {\n`;
        executableCode += `      entries.forEach((entry) => {\n`;
        executableCode += `        const el = entry.target;\n`;
        executableCode += `        if (el.classList.contains(${JSON.stringify(settings.activeClass || 'open')})) {\n`;
        executableCode += `          el.style.maxHeight = el.scrollHeight + 'px';\n`;
        executableCode += `        }\n`;
        executableCode += `      });\n`;
        executableCode += `    });\n`;
        executableCode += `    contents_${compId}.forEach((c) => { if (c) resizeObs_${compId}.observe(c); });\n`;
        executableCode += `    controller.signal.addEventListener('abort', () => resizeObs_${compId}.disconnect());\n`;
        executableCode += `  } else {\n`;
        executableCode += `    window.addEventListener('resize', () => {\n`;
        executableCode += `      contents_${compId}.forEach((c) => {\n`;
        executableCode += `        if (c && c.classList.contains(${JSON.stringify(settings.activeClass || 'open')})) {\n`;
        executableCode += `          c.style.maxHeight = c.scrollHeight + 'px';\n`;
        executableCode += `        }\n`;
        executableCode += `      });\n`;
        executableCode += `    }, { signal: controller.signal });\n`;
        executableCode += `  }\n`;
      }
    } else if (type === 'tabs') {
      executableCode += generateTabsCode(component.metadata);
    } else if (type === 'modal') {
      executableCode += generateModalCode(component.metadata);
    } else if (type === 'dropdown') {
      executableCode += generateDropdownCode(component.metadata);
    } else if (type === 'sidebar') {
      executableCode += generateSidebarCode(component.metadata);
    }
    executableCode += `\n})();`;
    
    return `// OSOOS_COMPONENT_START id="${id}" type="${type}"\n` +
           `// OSOOS_COMPONENT_DATA: ${encodedData}\n` +
           executableCode + '\n' +
           `// OSOOS_COMPONENT_END id="${id}"`;
  }

  return {
    SCHEMA_VERSION,
    QUICK_RECIPES,
    ACTION_TYPES: E1_ACTION_TYPES,
    ACTION_SCHEMAS,
    ACTION_FIELD_SCHEMAS,
    EVENT_TYPES: E1_EVENTS,
    CONDITION_OPERATORS: Object.keys(E1_CONDITION_OPERATORS),
    CONDITION_SCHEMAS,
    TARGET_KINDS,
    READ_TYPES: E1_READ_TYPES,
    VARIABLE_TYPES: E1_VARIABLE_TYPES,
    VARIABLE_SCOPES,
    STATE_SCOPES: VARIABLE_SCOPES,
    RECIPE_TYPES: E1_RECIPE_TYPES,
    ACTION_LABELS: E1_ACTION_TYPES,
    CONDITION_LABELS: E1_CONDITION_OPERATORS,
    ADVANCED_DESTINATIONS,
    ADVANCED_TOOL_GROUPS,
    ADVANCED_TOOLS,
    LEGACY_BLOCK_MAPPINGS,
    makeId,
    clone,
    safeIdentifier,
    createDefinition: createDefinitionV2,
    normalizeDefinition: normalizeDefinitionV2,
    normalizeAction: normalizeActionV2,
    normalizeCondition: normalizeConditionV2,
    normalizeVariable: normalizeVariableV2,
    normalizeRead: normalizeReadV2,
    normalizeTargetRef,
    normalizeAdvancedOperation,
    normalizeFunction: normalizeFunctionV3,
    createFunction,
    createAdvancedOperation,
    generateAdvancedOperation,
    previewAdvancedOperation,
    validateAdvancedOperation,
    getLegacyBlockMapping,
    generateAdvancedPhase: generateAdvancedPhaseV3,
    migrateDefinitionV2ToV3,
    actionFromRecipe,
    buildRecipeDefinition: buildRecipeDefinitionV2,
    encodeMetadata: encodeMetadataV2,
    decodeMetadata: decodeMetadataV2,
    targetExpression,
    generateConditionExpression: conditionsExpressionV2,
    generateExecutable: generateExecutableV2,
    generateBlock: generateBlockV2,
    parseVisualLinks: parseVisualLinksV2,
    validateDefinition: validateDefinitionV2,
    getRelationships: getRelationshipsV2,
    parseComponents,
    generateAccordionCode,
    generateTabsCode,
    generateModalCode,
    generateDropdownCode,
    generateSidebarCode,
    generateComponentBlock,
    normalizeExpressionV2,
    generateExpressionV2,
    validateExpressionV2,
    inferExpressionType,
    attemptLegacyMigration,
    mapConditionToExpressionAST,
    PRESET_REGISTRY,
    migrateDefinitionToExpressionV2,
    EXPRESSION_TYPE_LABELS_AR,
    walkExpressionTree,
    expressionContainsLegacy,
    findExpressionNodeById,
    replaceExpressionNodeById,
    linkExpressionReferences,
    refreshExpressionReferenceNames,
    updateExpressionReferencesOnRename,
    explainExpressionInArabic
  };
});
