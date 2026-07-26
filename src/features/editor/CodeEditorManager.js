/* Code Editor (HTML/CSS/JS Tabs), Bidirectional Workspace Sync and JS Logic Blocks Drawer */

import { HTML_ELEMENTS_DB } from '../../data/htmlElements.js';

class CodeEditorManager {
  constructor(app) {
    this.app = app;
    this.currentLanguage = 'html';
    this.textarea = document.getElementById('code-textarea');
    this.tabs = document.querySelectorAll('.editor-tab');
    this.debounceTimer = null;
    
    // Selection/Cursor position memory
    this.lastSelectionStart = 0;
    this.lastSelectionEnd = 0;
    
    // Logic Blocks Panel Selectors
    this.blocksContainer = document.getElementById('logic-blocks-container');
    this.searchBar = document.getElementById('logic-blocks-search');

    // Block Builder (config panel) state
    this.pickingContext = null;        // 'linker' | 'block' | 'visual-link' — routes canvas target picking
    this.activeBlockConfig = null;     // currently open block config {block, builder, existingId}
    this.blockTargetCandidates = [];   // element refs for the block target dropdown

    // Visual Connection Builder state
    this.pendingVisualLinkSourceId = null; // source element id while picking a link target
    this.previewLinkArrow = null;          // provisional arrow shown while popup is open
    this.activeVisualLink = null;          // {existingId, draftId, sourceId, targetId} while popup open
    this.hiddenLinkArrows = {};            // linkId -> true (session-only arrow visibility)
    this._vlKeyHandler = null;
    this._vlCacheJs = null;
    this._vlCacheLinks = [];

    // Store user custom CSS/JS in memory
    this.customCSS = `/* أضف تنسيقات CSS الإضافية هنا */
.hero {
  padding: 40px 20px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  text-align: center;
  border-radius: 12px;
  margin-bottom: 20px;
}
.card {
  background: white;
  color: #1f2937;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  max-width: 500px;
  margin: 0 auto;
}
.card button {
  background: #f59e0b;
  color: #121211;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s;
}
.card button:hover {
  background: #d97706;
}`;
    this.customJS = '';
    /* تعريفات التفاعلات بيانات محرّر، وليست جزءًا من ملف JavaScript النهائي. */
    this.interactionDefinitions = [];

    // 101 Visual JavaScript Blocks Database (51 Existing + 50 New ones)
    this.blocksDb = [
      // أحداث التفاعل (8 blocks)
      { id: 'onclick', title: 'عند النقر (click)', code: 'element.addEventListener(\'click\', (e) => {\n  // اكتب الأفعال هنا\n});', cat: 'events' },
      { id: 'onmouseenter', title: 'عند دخول الفأرة (hover)', code: 'element.addEventListener(\'mouseenter\', (e) => {\n  // تأثيرات المرور\n});', cat: 'events' },
      { id: 'onmouseleave', title: 'عند مغادرة الفأرة', code: 'element.addEventListener(\'mouseleave\', (e) => {\n  // إلغاء التأثيرات\n});', cat: 'events' },
      { id: 'oninput', title: 'عند إدخال نص', code: 'element.addEventListener(\'input\', (e) => {\n  let text = e.target.value;\n});', cat: 'events' },
      { id: 'onchange', title: 'عند التغيير (change)', code: 'element.addEventListener(\'change\', (e) => {\n  let val = e.target.value;\n});', cat: 'events' },
      { id: 'onsubmit', title: 'عند إرسال النموذج', code: 'form.addEventListener(\'submit\', (e) => {\n  e.preventDefault();\n  // كود الإرسال\n});', cat: 'events' },
      { id: 'onload', title: 'عند تحميل الصفحة', code: 'window.addEventListener(\'load\', () => {\n  // كود البداية\n});', cat: 'events' },
      { id: 'onkeydown', title: 'عند الضغط على مفتاح كيبورد', code: 'document.addEventListener(\'keydown\', (e) => {\n  if (e.key === \'Enter\') {\n    // الكود\n  }\n});', cat: 'events' },

      // أفعال وتأثيرات (10 blocks)
      { id: 'setText', title: 'تغيير النص الداخلي', code: 'element.innerText = "نص جديد";', cat: 'actions' },
      { id: 'setHTML', title: 'تغيير كود HTML بالداخل', code: 'element.innerHTML = "<p>كود HTML جديد</p>";', cat: 'actions' },
      { id: 'setStyle', title: 'تغيير لون النمط (CSS)', code: 'element.style.color = "#f59e0b";', cat: 'actions' },
      { id: 'addClass', title: 'إضافة فئة كلاس CSS', code: 'element.classList.add("card-active");', cat: 'actions' },
      { id: 'removeClass', title: 'حذف فئة كلاس CSS', code: 'element.classList.remove("card-active");', cat: 'actions' },
      { id: 'toggleClass', title: 'تبديل فئة كلاس CSS', code: 'element.classList.toggle("card-active");', cat: 'actions' },
      { id: 'hide', title: 'إخفاء العنصر', code: 'element.style.display = \'none\';', cat: 'actions' },
      { id: 'show', title: 'إظهار العنصر', code: 'element.style.display = \'block\';', cat: 'actions' },
      { id: 'playSound', title: 'تشغيل صوت مخصص', code: 'new Audio("sound.mp3").play();', cat: 'actions' },
      { id: 'shake', title: 'اهتزاز العنصر (حركة)', code: 'element.animate([\n  { transform: \'translateX(0)\' },\n  { transform: \'translateX(-5px)\' },\n  { transform: \'translateX(5px)\' },\n  { transform: \'translateX(0)\' }\n], { duration: 200 });', cat: 'actions' },

      // منطق وشروط (7 blocks)
      { id: 'if', title: 'إذا كان (if)', code: 'if (x === 10) {\n  // الكود\n}', cat: 'logic' },
      { id: 'else-if', title: 'وإلا إذا كان (else if)', code: 'else if (x === 5) {\n  // الكود\n}', cat: 'logic' },
      { id: 'else', title: 'وإلا (else)', code: 'else {\n  // الكود\n}', cat: 'logic' },
      { id: 'equals', title: 'مقارنة يساوي (===)', code: 'x === y', cat: 'logic' },
      { id: 'not-equals', title: 'مقارنة لا يساوي (!==)', code: 'x !== y', cat: 'logic' },
      { id: 'and', title: 'الشرط (و) &&', code: 'x && y', cat: 'logic' },
      { id: 'or', title: 'الشرط (أو) ||', code: 'x || y', cat: 'logic' },

      // نوافذ المتصفح والوقت (10 blocks)
      { id: 'alert', title: 'عرض رسالة تنبيه (alert)', code: 'alert("مرحباً بك!");', cat: 'browser' },
      { id: 'confirm', title: 'تأكيد الموافقة (confirm)', code: 'if (confirm("هل تريد الاستمرار؟")) {\n  // كود التكملة\n}', cat: 'browser' },
      { id: 'prompt', title: 'نافذة إدخال نص (prompt)', code: 'let name = prompt("أدخل اسمك:");', cat: 'browser' },
      { id: 'log', title: 'طباعة كونسول للمطورين', code: 'console.log("تمت العملية بنجاح!");', cat: 'browser' },
      { id: 'redirect', title: 'إعادة توجيه لرابط موقع', code: 'window.location.href = "https://google.com";', cat: 'browser' },
      { id: 'open', title: 'فتح نافذة جديدة', code: 'window.open("https://google.com");', cat: 'browser' },
      { id: 'setTimeout', title: 'تشغيل مؤقت لمرة واحدة', code: 'setTimeout(() => {\n  // ينفذ بعد ثانية واحدة\n}, 1000);', cat: 'timers' },
      { id: 'setInterval', title: 'تشغيل متكرر (Interval)', code: 'let interval = setInterval(() => {\n  // يتكرر كل ثانية\n}, 1000);', cat: 'timers' },
      { id: 'clearInterval', title: 'إيقاف التشغيل المتكرر', code: 'clearInterval(interval);', cat: 'timers' },
      { id: 'dateNow', title: 'التاريخ والوقت الحالي', code: 'new Date().toLocaleString("ar-EG");', cat: 'browser' },

      // تخزين وبيانات (6 blocks)
      { id: 'setStorage', title: 'حفظ قيمة بالذاكرة المحلية', code: 'localStorage.setItem("username", "Ahmed");', cat: 'storage' },
      { id: 'getStorage', title: 'قراءة من الذاكرة المحلية', code: 'let user = localStorage.getItem("username");', cat: 'storage' },
      { id: 'removeStorage', title: 'حذف من الذاكرة المحلية', code: 'localStorage.removeItem("username");', cat: 'storage' },
      { id: 'jsonString', title: 'تحويل لـ نص JSON', code: 'JSON.stringify(object);', cat: 'storage' },
      { id: 'jsonParse', title: 'تحويل من نص JSON', code: 'JSON.parse(jsonString);', cat: 'storage' },
      { id: 'fetch', title: 'جلب بيانات API خارجية', code: 'fetch("https://api.example.com/data")\n  .then(res => res.json())\n  .then(data => {\n    console.log(data);\n  });', cat: 'storage' },

      // حساب ومتغيرات (10 blocks)
      { id: 'let', title: 'تعريف متغير متغير (let)', code: 'let score = 0;', cat: 'variables' },
      { id: 'const', title: 'تعريف متغير ثابت (const)', code: 'const limit = 100;', cat: 'variables' },
      { id: 'increment', title: 'زيادة بمقدار 1', code: 'score++;', cat: 'variables' },
      { id: 'decrement', title: 'نقصان بمقدار 1', code: 'score--;', cat: 'variables' },
      { id: 'sum', title: 'عملية الجمع (+)', code: 'x + y', cat: 'math' },
      { id: 'sub', title: 'عملية الطرح (-)', code: 'x - y', cat: 'math' },
      { id: 'mult', title: 'عملية الضرب (*)', code: 'x * y', cat: 'math' },
      { id: 'div', title: 'عملية القسمة (/)', code: 'x / y', cat: 'math' },
      { id: 'random', title: 'توليد رقم عشوائي', code: 'Math.random();', cat: 'math' },
      { id: 'round', title: 'تقريب الرقم لأقرب عدد', code: 'Math.round(number);', cat: 'math' },

      // العمليات النصية (8 blocks)
      { id: 'strLength', title: 'طول النص (length)', code: 'text.length', cat: 'strings' },
      { id: 'strUpper', title: 'تحويل لأحرف كبيرة', code: 'text.toUpperCase()', cat: 'strings' },
      { id: 'strLower', title: 'تحويل لأحرف صغيرة', code: 'text.toLowerCase()', cat: 'strings' },
      { id: 'strIncludes', title: 'هل النص يحتوي على كلمة', code: 'text.includes("كلمة")', cat: 'strings' },
      { id: 'strReplace', title: 'استبدال كلمة بأخرى', code: 'text.replace("القديم", "الجديد")', cat: 'strings' },
      { id: 'strSubstring', title: 'قص جزء من النص', code: 'text.substring(0, 5)', cat: 'strings' },
      { id: 'strTrim', title: 'إزالة الفراغات الزائدة', code: 'text.trim()', cat: 'strings' },
      { id: 'strSplit', title: 'تقسيم النص لمصفوفة', code: 'text.split(" ")', cat: 'strings' },

      // المصفوفات والتكرار (10 blocks)
      { id: 'arrNew', title: 'مصفوفة جديدة فارغة', code: 'let list = [];', cat: 'arrays' },
      { id: 'arrPush', title: 'إضافة عنصر للمصفوفة', code: 'list.push(item);', cat: 'arrays' },
      { id: 'arrPop', title: 'إزالة آخر عنصر', code: 'list.pop();', cat: 'arrays' },
      { id: 'arrLength', title: 'طول مصفوفة عناصر', code: 'list.length', cat: 'arrays' },
      { id: 'arrForEach', title: 'تكرار على عناصر مصفوفة', code: 'list.forEach((item, index) => {\n  console.log(item);\n});', cat: 'arrays' },
      { id: 'arrIncludes', title: 'هل المصفوفة تحوي عنصر', code: 'list.includes(item)', cat: 'arrays' },
      { id: 'arrFilter', title: 'تصفية عناصر مصفوفة', code: 'let filtered = list.filter(item => item > 10);', cat: 'arrays' },
      { id: 'arrMap', title: 'تحويل عناصر مصفوفة', code: 'let doubled = list.map(item => item * 2);', cat: 'arrays' },
      { id: 'arrConcat', title: 'دمج مصفوفتين معاً', code: 'let combined = list1.concat(list2);', cat: 'arrays' },
      { id: 'arrJoin', title: 'تحويل مصفوفة إلى نص', code: 'list.join(", ");', cat: 'arrays' },

      // الكائنات (6 blocks)
      { id: 'objNew', title: 'كائن فارغ جديد', code: 'let obj = {};', cat: 'objects' },
      { id: 'objKeys', title: 'مفاتيح كائن (Keys)', code: 'Object.keys(obj)', cat: 'objects' },
      { id: 'objValues', title: 'قيم كائن (Values)', code: 'Object.values(obj)', cat: 'objects' },
      { id: 'objHasProp', title: 'هل يحوي خاصية مخصصة', code: 'obj.hasOwnProperty("property")', cat: 'objects' },
      { id: 'objAssign', title: 'دمج كائنين معاً', code: 'Object.assign({}, obj1, obj2)', cat: 'objects' },
      { id: 'objFreeze', title: 'تجميد كائن لمنع التعديل', code: 'Object.freeze(obj)', cat: 'objects' },

      // رياضيات متقدمة (8 blocks)
      { id: 'mathRandomRange', title: 'رقم عشوائي ضمن نطاق', code: 'Math.floor(Math.random() * (max - min + 1)) + min;', cat: 'math' },
      { id: 'mathCeil', title: 'تقريب الرقم للأعلى (Ceil)', code: 'Math.ceil(number)', cat: 'math' },
      { id: 'mathFloor', title: 'تقريب الرقم للأسفل (Floor)', code: 'Math.floor(number)', cat: 'math' },
      { id: 'mathPow', title: 'القوة والأس (Pow)', code: 'Math.pow(base, exponent)', cat: 'math' },
      { id: 'mathSqrt', title: 'الجذر التربيعي (Sqrt)', code: 'Math.sqrt(number)', cat: 'math' },
      { id: 'mathMax', title: 'القيمة القصوى (Max)', code: 'Math.max(x, y, z)', cat: 'math' },
      { id: 'mathMin', title: 'القيمة الصغرى (Min)', code: 'Math.min(x, y, z)', cat: 'math' },
      { id: 'mathClamp', title: 'تحديد رقم بين حدين (Clamp)', code: 'Math.min(Math.max(val, min), max)', cat: 'math' },

      // النماذج والتحقق (8 blocks)
      { id: 'valEmail', title: 'التحقق من البريد الإلكتروني', code: '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)', cat: 'validation' },
      { id: 'valEmpty', title: 'فحص الحقل إذا كان فارغاً', code: 'if (input.value.trim() === "") {\n  // خطأ\n}', cat: 'validation' },
      { id: 'valDisable', title: 'تعطيل زر إدخال ونماذج', code: 'button.disabled = true;', cat: 'validation' },
      { id: 'valEnable', title: 'تمكين زر إدخال ونماذج', code: 'button.disabled = false;', cat: 'validation' },
      { id: 'valReset', title: 'تفريغ حقول النموذج بالكامل', code: 'form.reset();', cat: 'validation' },
      { id: 'valFocus', title: 'التركيز التلقائي على الحقل', code: 'input.focus();', cat: 'validation' },
      { id: 'valChecked', title: 'هل مربع الاختيار محدد', code: 'checkbox.checked', cat: 'validation' },
      { id: 'valRadio', title: 'قيمة الراديو المحدد', code: 'document.querySelector(\'input[name="group"]:checked\')?.value', cat: 'validation' },

      // تحكم متقدم CSS والصفحة (10 blocks)
      { id: 'cssPos', title: 'تغيير الموضع المطلق', code: 'element.style.left = "100px";\nelement.style.top = "50px";', cat: 'actions' },
      { id: 'cssOpacity', title: 'تغيير الشفافية (Opacity)', code: 'element.style.opacity = "0.5";', cat: 'actions' },
      { id: 'cssTransition', title: 'إضافة تأثير انتقال حركي', code: 'element.style.transition = "all 0.3s ease";', cat: 'actions' },
      { id: 'cssBgImage', title: 'تغيير صورة الخلفية بالمسار', code: 'element.style.backgroundImage = "url(\'image.jpg\')";', cat: 'actions' },
      { id: 'cssShadow', title: 'تغيير ظل العنصر بصرياً', code: 'element.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";', cat: 'actions' },
      { id: 'domWidth', title: 'الحصول على العرض الفعلي', code: 'element.offsetWidth', cat: 'actions' },
      { id: 'domHeight', title: 'الحصول على الارتفاع الفعلي', code: 'element.offsetHeight', cat: 'actions' },
      { id: 'domScrollInto', title: 'التمرير التلقائي للعنصر', code: 'element.scrollIntoView({ behavior: \'smooth\' });', cat: 'actions' },
      { id: 'domScrollToTop', title: 'التمرير لأعلى الصفحة', code: 'window.scrollTo({ top: 0, behavior: \'smooth\' });', cat: 'actions' },
      { id: 'domMousePos', title: 'موضع الفأرة في الصفحة', code: 'let mouseX = e.clientX;\nlet mouseY = e.clientY;', cat: 'actions' }
    ];

    this.init();
  }

  init() {
    this.initBlockBuilders();
    this.setupTabs();
    this.setupEditorInput();
    this.setupLineNumbers();
    this.setupBlocksDrawer();
    this.setupSelectionTracker();
    this.setupFormatter();
    this.scanAndRenderVariables();
    this.setupInteractiveLinker();
    this.renderBlocksDashboard();
    this.setupVisualLinks();
  }

  setupTabs() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        /* تفليش التعديلات المعلّقة قبل تبديل التاب: كانت الكتابة ثم التبديل
           خلال 500ms (زمن الـ debounce) تضيع بالكامل عند إعادة تحميل المحتوى. */
        this.flushPendingEditorInput();
        if (this.app.projectManager && typeof this.app.projectManager.handleLanguageTabRequest === 'function') {
          this.app.projectManager.handleLanguageTabRequest(tab.dataset.lang);
        }
        this.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.currentLanguage = tab.dataset.lang;
        this.refreshEditorContent();
      });
    });
  }

  flushPendingEditorInput() {
    if (!this.debounceTimer) return;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    this.syncEditorToCanvas();
  }

  // Track selection start and end to avoid resetting insertion cursor to index 0 on blur
  setupSelectionTracker() {
    const savePos = () => {
      this.lastSelectionStart = this.textarea.selectionStart;
      this.lastSelectionEnd = this.textarea.selectionEnd;
    };
    this.textarea.addEventListener('blur', savePos);
    this.textarea.addEventListener('keyup', savePos);
    this.textarea.addEventListener('mouseup', savePos);
  }

  // Load content into the textarea based on the selected language tab
  refreshEditorContent(options = {}) {
    const preserveSelection = options.preserveSelection === true &&
      document.activeElement === this.textarea;
    const editorState = options.selectionState || (preserveSelection ? {
      start: this.textarea.selectionStart,
      end: this.textarea.selectionEnd,
      direction: this.textarea.selectionDirection,
      scrollTop: this.textarea.scrollTop,
      scrollLeft: this.textarea.scrollLeft
    } : null);
    const projectFile = this.app.projectManager && typeof this.app.projectManager.getActiveEditableFile === 'function'
      ? this.app.projectManager.getActiveEditableFile()
      : null;
    if (projectFile) {
      const projectLanguage = projectFile.kind === 'css' || projectFile.kind === 'js' ? projectFile.kind : 'text';
      if (this.currentLanguage === projectLanguage) {
        this.textarea.value = projectFile.content || '';
        this.updateLineNumbers();
        this.restoreEditorState(editorState);
        return;
      }
    }
    if (this.currentLanguage === 'html') {
      this.textarea.value = this.getCleanCanvasHTML();
    } else if (this.currentLanguage === 'css') {
      this.textarea.value = this.formatCSS(this.customCSS || '');
    } else if (this.currentLanguage === 'js') {
      this.textarea.value = this.formatJS(this.customJS || '');
    }
    this.updateLineNumbers();
    this.restoreEditorState(editorState);
  }

  restoreEditorState(state) {
    if (!state) return;
    const length = this.textarea.value.length;
    const start = Math.min(Math.max(0, state.start), length);
    const end = Math.min(Math.max(start, state.end), length);
    try {
      this.textarea.setSelectionRange(start, end, state.direction || 'none');
    } catch { /* Selection restoration is cosmetic; keep the synced content. */ }
    this.textarea.scrollTop = state.scrollTop;
    this.textarea.scrollLeft = state.scrollLeft;
    this.lastSelectionStart = start;
    this.lastSelectionEnd = end;
  }

  // Bidirectional editing: edit textarea -> update workspace canvas
  setupEditorInput() {
    this.textarea.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.syncEditorToCanvas();
      }, 500);
    });
    /* إغلاق/تحديث التبويب خلال نافذة الـ 500ms كان يُسقط آخر تعديل معلّق —
       نفلّشه هنا ليمر عبر syncEditorToCanvas ومنه إلى saveProgress. */
    window.addEventListener('beforeunload', () => this.flushPendingEditorInput());
  }

  looksLikeIncompleteHTML(value) {
    const source = String(value || '');
    const lastOpen = source.lastIndexOf('<');
    const lastClose = source.lastIndexOf('>');
    if (lastOpen > lastClose) return true;
    return source.lastIndexOf('<!--') > source.lastIndexOf('-->');
  }

  syncEditorToCanvas() {
    const value = this.textarea.value;
    // Capture before rebuilding the canvas: selection changes and panel
    // refreshes during the sync must not move a typing caret to the end.
    const editorSelectionState = document.activeElement === this.textarea ? {
      start: this.textarea.selectionStart,
      end: this.textarea.selectionEnd,
      direction: this.textarea.selectionDirection,
      scrollTop: this.textarea.scrollTop,
      scrollLeft: this.textarea.scrollLeft
    } : null;

    if (this.app.projectManager &&
        typeof this.app.projectManager.syncActiveExternalFile === 'function' &&
        this.app.projectManager.syncActiveExternalFile(value, this.currentLanguage)) {
      this.updateLineNumbers();
      return;
    }
    
    if (this.currentLanguage === 'html') {
      try {
        const canvas = document.getElementById('builder-canvas');
        // text/html repairs unfinished tags instead of exposing parsererror.
        // Wait for the next keystroke rather than treating that repair as an
        // intentional deletion (which also cascades into CSS/JS cleanup).
        if (this.looksLikeIncompleteHTML(value)) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(value, 'text/html');
        if (canvas && canvas.childNodes.length && value.trim() && !doc.body.innerHTML.trim()) return;

        /* المسار ده كان بيتخطى sanitizeRestoredHtml اللي loadSavedProgress بيستدعيها عمدًا:
           لصق <img src=x onerror=...> في تبويب HTML كان يشتغل فورًا جوه البيلدر نفسه
           (الكانفس div عادي مش iframe). التعقيم بيشيل on*= و javascript: و <script>. */
        const safeHtml = typeof this.app.sanitizeRestoredHtml === 'function'
          ? this.app.sanitizeRestoredHtml(doc.body.innerHTML)
          : doc.body.innerHTML;
        const replacementTemplate = document.createElement('template');
        replacementTemplate.innerHTML = safeHtml;
        if (this.app.history && typeof this.app.history.flushPendingState === 'function') {
          this.app.history.flushPendingState('Flush pending state before HTML edit');
        }
        if (typeof this.app.cleanupStructureRemoval === 'function') {
          this.app.cleanupStructureRemoval(Array.from(canvas.children), {
            replacementRoot: replacementTemplate.content
          });
        }
        canvas.innerHTML = safeHtml;

        this.app.selectElement(null);
        this.app.reattachCanvasListeners();
        this.app.syncDOMTree({
          preserveEditorSelection: true,
          editorSelectionState
        });
        if (typeof this.app.refreshInteractionUIAfterStructureCleanup === 'function') {
          this.app.refreshInteractionUIAfterStructureCleanup();
        }
        this.app.history.saveState('Edit HTML structure');
      } catch (err) {
        console.error('Error syncing editor to canvas:', err);
      }
    } else if (this.currentLanguage === 'css') {
      this.customCSS = value;
      this.app.applyCustomCSS(value);
      /* الحفظ كان يعتمد على إجراء لاحق غير مضمون (كتحديد عنصر) — كتابة CSS
         يدويًا ثم إغلاق التبويب كانت تضيع الشغل بصمت. */
      this.app.saveProgress();
    } else if (this.currentLanguage === 'js') {
      this.customJS = value;
      this.scanAndRenderVariables();
      this.renderBlocksDashboard();
      this.renderVisualLinksDashboard();
      /* نفس سبب فرع CSS أعلاه: استمرارية الكود اليدوي لا تنتظر إجراءً آخر. */
      this.app.saveProgress();
    }
  }

  // Automatically generates a variable selector for clicked canvas elements
  generateElementVariable(el) {
    if (!el || el.id === 'builder-canvas') return;
    
    // 1. Ensure element has a unique ID
    if (!el.id) {
      const tagName = el.tagName.toLowerCase();
      el.id = this.generateUniqueElementId(tagName);
      this.app.syncAll(); // Sync to update HTML tab with the generated ID
    }
    
    const varName = el.id.replace(/-/g, '_');
    
    // Avoid creating duplicate selectors for the same ID
    const idCheck = `document.getElementById('${el.id}')`;
    const selectorCheck = `document.querySelector('#${el.id}')`;
    if (this.customJS.includes(idCheck) || this.customJS.includes(selectorCheck)) {
      this.scanAndRenderVariables();
      this.updateInteractiveLinker();
      return; 
    }
    
    // 2. Lookup Arabic tag description
    const tagName = el.tagName.toLowerCase();
    const dbItem = (typeof HTML_ELEMENTS_DB !== 'undefined') ? HTML_ELEMENTS_DB.find(x => x.tag === tagName) : null;
    const label = dbItem ? dbItem.labelAr : tagName;
    
    // 3. Construct descriptive selector snippet with comment
    const commentAndSelector = `\n// تحديد عنصر: ${label} (${tagName})\nconst ${varName} = document.getElementById('${el.id}');\n`;
    
    // 4. Append to JS memory
    this.customJS += commentAndSelector;
    
    // 5. If JS tab is active, display it immediately and scroll down
    if (this.currentLanguage === 'js') {
      this.textarea.value = this.customJS;
      this.textarea.scrollTop = this.textarea.scrollHeight;
      this.lastSelectionStart = this.lastSelectionEnd = this.textarea.value.length;
      this.updateLineNumbers();
    }
    
    this.scanAndRenderVariables();
    this.updateInteractiveLinker();
    this.showToastNotice(`تم ربط العنصر وتوليد المتغير const ${varName}`);
  }

  // Automatically generates and injects event listeners or action methods for dropdown selection
  generateElementLogic(el, actionType) {
    if (!el || el.id === 'builder-canvas') return;
    
    // 1. Ensure variable selector is generated
    this.generateElementVariable(el);
    const varName = el.id.replace(/-/g, '_');
    
    let template = '';
    let label = '';
    
    switch (actionType) {
      case 'evt-click':
        label = 'عند النقر (click)';
        template = `\n// حدث النقر لـ: ${el.tagName.toLowerCase()}#${el.id}\n${varName}.addEventListener('click', (e) => {\n  // اكتب الأفعال هنا\n});\n`;
        break;
      case 'evt-hover':
        label = 'عند مرور الفأرة (hover)';
        template = `\n// حدث دخول/خروج الفأرة لـ: ${el.tagName.toLowerCase()}#${el.id}\n${varName}.addEventListener('mouseenter', (e) => {\n  // تأثير الدخول\n});\n${varName}.addEventListener('mouseleave', (e) => {\n  // تأثير الخروج\n});\n`;
        break;
      case 'evt-input':
        label = 'عند إدخال نص (input)';
        template = `\n// حدث الكتابة والإدخال لـ: ${el.tagName.toLowerCase()}#${el.id}\n${varName}.addEventListener('input', (e) => {\n  let text = e.target.value;\n});\n`;
        break;
      case 'evt-change':
        label = 'عند تغيير القيمة (change)';
        template = `\n// حدث التغيير لـ: ${el.tagName.toLowerCase()}#${el.id}\n${varName}.addEventListener('change', (e) => {\n  let val = e.target.value;\n});\n`;
        break;
      case 'act-hide':
        label = 'إخفاء العنصر';
        template = `\n// إخفاء العنصر\n${varName}.style.display = 'none';\n`;
        break;
      case 'act-show':
        label = 'إظهار العنصر';
        template = `\n// إظهار العنصر\n${varName}.style.display = 'block';\n`;
        break;
      case 'act-shake':
        label = 'اهتزاز وحركة العنصر';
        template = `\n// اهتزاز العنصر حركياً\n${varName}.animate([\n  { transform: 'translateX(0)' },\n  { transform: 'translateX(-5px)' },\n  { transform: 'translateX(5px)' },\n  { transform: 'translateX(0)' }\n], { duration: 200 });\n`;
        break;
      case 'act-color':
        label = 'تلوين بالبرتقالي';
        template = `\n// تلوين العنصر باللون البرتقالي المميز للمشروع\n${varName}.style.color = '#f59e0b';\n`;
        break;
    }
    
    // 2. Switch to JS tab if not already there
    if (this.currentLanguage !== 'js') {
      const jsTab = document.querySelector('.editor-tab[data-lang="js"]');
      if (jsTab) jsTab.click();
    }
    
    // 3. Inject logic code at the end
    this.customJS += template;
    this.textarea.value = this.customJS;
    this.app.saveProgress();
    this.updateLineNumbers();

    // Scroll editor to bottom to show new code
    this.textarea.scrollTop = this.textarea.scrollHeight;
    this.lastSelectionStart = this.lastSelectionEnd = this.textarea.value.length;
    
    this.scanAndRenderVariables();
    this.showToastNotice(`تم ربط [${label}] بنجاح!`);
  }

  // Scans the active JS code to render element variable selections in the sidebar panel
  scanAndRenderVariables() {
    const listContainer = document.getElementById('linked-variables-list');
    const countBadge = document.getElementById('linked-variables-count');
    if (!listContainer || !countBadge) return;

    // Matches e.g. const button_123 = document.getElementById('button-123');
    const regex = /const\s+(\w+)\s*=\s*document\.getElementById\('([\w-]+)'\);/g;
    let match;
    const vars = [];

    while ((match = regex.exec(this.customJS)) !== null) {
      vars.push({ varName: match[1], elemId: match[2] });
    }

    countBadge.textContent = vars.length;

    if (vars.length === 0) {
      listContainer.innerHTML = `<span style="font-size: 9px; color: var(--text-muted); text-align: center; padding: 4px 0;">اضغط على أي عنصر في المعاينة لتوليد متغيره هنا.</span>`;
      return;
    }

    listContainer.innerHTML = '';
    vars.forEach(v => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.backgroundColor = 'var(--bg-primary)';
      item.style.border = '1px solid var(--border-color)';
      item.style.borderRadius = 'var(--radius-sm)';
      item.style.padding = '4px 8px';
      item.style.cursor = 'pointer';
      item.style.fontSize = '9px';
      item.style.fontFamily = 'monospace';
      item.style.transition = 'var(--transition-fast)';

      const prefixTag = v.elemId.split('-')[0] || 'elem';

      item.innerHTML = `
        <span style="color: var(--accent-orange); font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">const ${v.varName}</span>
        <span style="font-size: 8px; background-color: var(--bg-hover); color: var(--text-muted); padding: 1px 4px; border-radius: 2px; text-transform: uppercase;">${prefixTag}</span>
      `;

      item.addEventListener('mouseenter', () => {
        item.style.borderColor = 'var(--accent-orange)';
        item.style.backgroundColor = 'var(--bg-hover)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.borderColor = 'var(--border-color)';
        item.style.backgroundColor = 'var(--bg-primary)';
      });

      // Selection on click
      item.addEventListener('click', () => {
        const el = document.getElementById(v.elemId);
        if (el) {
          this.app.selectElement(el);
          // Pulse animation on canvas
          el.animate([
            { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.7)' },
            { boxShadow: '0 0 0 8px rgba(245, 158, 11, 0)' }
          ], { duration: 500 });
        } else {
          this.showToastNotice(`العنصر #${v.elemId} غير موجود حالياً في المعاينة`);
        }
      });

      listContainer.appendChild(item);
    });
  }

  // Retire the legacy creation drawer while preserving edit compatibility.
  setupBlocksDrawer() {
    // E1.3 retires the old creation library, while retaining blocksDb and the
    // builders/parser for persisted OSOOS_JS_BLOCK compatibility. Move the
    // config host next to the legacy dashboard so it has an edit-only entry.
    const legacyRegion = document.querySelector('.js-region-blocks');
    const configPanel = document.getElementById('js-block-config-panel');
    const dashboard = document.getElementById('js-blocks-dashboard');
    if (configPanel) {
      configPanel.dataset.legacyEditOnly = 'true';
      configPanel.setAttribute('aria-label', 'Legacy JavaScript block editor');
      configPanel.style.marginTop = '8px';
      if (dashboard && dashboard.parentNode) dashboard.insertAdjacentElement('afterend', configPanel);
    }
    if (legacyRegion) legacyRegion.remove();
    this.blocksContainer = null;
    this.searchBar = null;

    // The linked-variable list is unrelated to the retired creation library.
    const toggleVarBtn = document.getElementById('toggle-variables-list');
    const varList = document.getElementById('linked-variables-list');
    if (toggleVarBtn && varList) {
      toggleVarBtn.addEventListener('click', () => {
        if (varList.style.maxHeight === '0px') {
          varList.style.maxHeight = '90px';
          varList.style.marginTop = '6px';
        } else {
          varList.style.maxHeight = '0px';
          varList.style.marginTop = '0px';
        }
      });
    }
  }

  getCategoryInfo(catKey) {
    const categories = {
      'events': { label: 'الأحداث (Events)', class: 'block-events', color: '#f59e0b' },
      'actions': { label: 'الأفعال والتأثيرات (Actions)', class: 'block-actions', color: '#3b82f6' },
      'logic': { label: 'الشروط والمنطق (Logic)', class: 'block-logic', color: '#a78bfa' },
      'variables': { label: 'المتغيرات (Variables)', class: 'block-variables', color: '#ec4899' },
      'strings': { label: 'النصوص (Strings)', class: 'block-strings', color: '#f472b6' },
      'math': { label: 'الأرقام والحساب (Math)', class: 'block-math', color: '#eab308' },
      'storage': { label: 'التخزين والبيانات (Storage)', class: 'block-storage', color: '#22c55e' },
      'browser': { label: 'المتصفح (Browser)', class: 'block-browser', color: '#06b6d4' },
      'timers': { label: 'الوقت والمؤقتات (Timers)', class: 'block-timers', color: '#8b5cf6' },
      'arrays': { label: 'المصفوفات والتكرار (Arrays)', class: 'block-arrays', color: '#14b8a6' },
      'objects': { label: 'الكائنات (Objects)', class: 'block-objects', color: '#818cf8' },
      'validation': { label: 'النماذج والتحقق (Validation)', class: 'block-validation', color: '#84cc16' }
    };
    return categories[catKey] || { label: catKey, class: '', color: '#f59e0b' };
  }

  renderBlocksList(_searchVal = '', _filterCat = 'all') {
    // Compatibility API only. Intentionally never recreates retired cards.
    const staleContainer = document.getElementById('logic-blocks-container');
    if (staleContainer) staleContainer.replaceChildren();
    return [];
  }

  insertAtCursor(textarea, value) {
    let start = (this.lastSelectionStart !== undefined) ? this.lastSelectionStart : textarea.value.length;
    let end = (this.lastSelectionEnd !== undefined) ? this.lastSelectionEnd : textarea.value.length;
    
    if (start > textarea.value.length) start = textarea.value.length;
    if (end > textarea.value.length) end = textarea.value.length;

    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    textarea.value = before + value + after;
    textarea.selectionStart = textarea.selectionEnd = start + value.length;
    this.lastSelectionStart = this.lastSelectionEnd = start + value.length;

    textarea.focus();
  }

  /* ============================================================
     Block Builders — step-by-step config panels for JS blocks
     (same educational style as the JS Linker panel)
     ============================================================ */

  escapeJSString(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r?\n/g, '\\n');
  }

  sanitizeVarName(s, fallback) {
    const t = String(s || '').trim();
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(t) ? t : (fallback || 'myVar');
  }

  indentCode(s) {
    return String(s === undefined ? '' : s).split('\n').map(l => '  ' + l).join('\n');
  }

  initBlockBuilders() {
    const esc = (s) => this.escapeJSString(s);
    const ind = (s) => this.indentCode(s);
    const safeVar = (s, fb) => this.sanitizeVarName(s, fb);
    const bodyField = (label, def) => ({
      key: 'body',
      label: label || 'الكود الذي سينفذ:',
      type: 'textarea',
      default: def !== undefined ? def : '// اكتب الأفعال هنا'
    });

    this.blockBuilders = {
      /* ==== Events ==== */
      onclick: { desc: 'ينفذ الكود عندما ينقر الزائر على العنصر المستهدف.', needsTarget: true, fields: [bodyField()], generate: (v, t) => `${t}.addEventListener('click', (e) => {\n${ind(v.body)}\n});` },
      onmouseenter: { desc: 'ينفذ الكود عند دخول مؤشر الفأرة فوق العنصر المستهدف.', needsTarget: true, fields: [bodyField('كود تأثير الدخول:')], generate: (v, t) => `${t}.addEventListener('mouseenter', (e) => {\n${ind(v.body)}\n});` },
      onmouseleave: { desc: 'ينفذ الكود عند خروج مؤشر الفأرة من العنصر المستهدف.', needsTarget: true, fields: [bodyField('كود تأثير الخروج:')], generate: (v, t) => `${t}.addEventListener('mouseleave', (e) => {\n${ind(v.body)}\n});` },
      oninput: { desc: 'ينفذ الكود أثناء كتابة الزائر داخل حقل الإدخال.', needsTarget: true, fields: [bodyField('الكود (النص المكتوب داخل المتغير text):', 'let text = e.target.value;\nconsole.log(text);')], generate: (v, t) => `${t}.addEventListener('input', (e) => {\n${ind(v.body)}\n});` },
      onchange: { desc: 'ينفذ الكود عند تغيير قيمة الحقل أو القائمة.', needsTarget: true, fields: [bodyField('الكود (القيمة داخل المتغير val):', 'let val = e.target.value;\nconsole.log(val);')], generate: (v, t) => `${t}.addEventListener('change', (e) => {\n${ind(v.body)}\n});` },
      onsubmit: { desc: 'ينفذ الكود عند إرسال النموذج، مع منع إعادة تحميل الصفحة.', needsTarget: true, fields: [bodyField('كود معالجة الإرسال:')], generate: (v, t) => `${t}.addEventListener('submit', (e) => {\n  e.preventDefault();\n${ind(v.body)}\n});` },
      onload: { desc: 'ينفذ الكود مرة واحدة بعد اكتمال تحميل الصفحة.', fields: [bodyField('كود البداية:')], generate: (v) => `window.addEventListener('load', () => {\n${ind(v.body)}\n});` },
      onkeydown: { desc: 'ينفذ الكود عند الضغط على مفتاح معين في لوحة المفاتيح.', fields: [{ key: 'key', label: 'اسم المفتاح (مثال: Enter أو Escape):', type: 'text', default: 'Enter' }, bodyField()], generate: (v) => `document.addEventListener('keydown', (e) => {\n  if (e.key === '${esc(v.key || 'Enter')}') {\n${ind(ind(v.body))}\n  }\n});` },

      /* ==== Actions ==== */
      setText: { desc: 'يغير النص الظاهر داخل العنصر المستهدف.', needsTarget: true, fields: [{ key: 'text', label: 'النص الجديد:', type: 'text', default: 'نص جديد', dir: 'rtl' }], generate: (v, t) => `${t}.innerText = '${esc(v.text)}';` },
      setHTML: { desc: 'يستبدل كود HTML الداخلي للعنصر المستهدف.', needsTarget: true, fields: [{ key: 'html', label: 'كود HTML الجديد:', type: 'textarea', default: '<p>كود HTML جديد</p>' }], generate: (v, t) => `${t}.innerHTML = '${esc(v.html)}';` },
      setStyle: { desc: 'يغير خاصية CSS واحدة للعنصر المستهدف.', needsTarget: true, fields: [{ key: 'prop', label: 'اسم الخاصية (مثال: color أو background-color):', type: 'text', default: 'color' }, { key: 'val', label: 'القيمة:', type: 'text', default: '#f59e0b' }], generate: (v, t) => `${t}.style['${(v.prop || 'color').trim().replace(/[^a-zA-Z-]/g, '')}'] = '${esc(v.val)}';` },
      addClass: { desc: 'يضيف كلاس CSS إلى العنصر المستهدف.', needsTarget: true, fields: [{ key: 'className', label: 'اسم الكلاس:', type: 'text', default: 'card-active' }], generate: (v, t) => `${t}.classList.add('${esc((v.className || 'card-active').trim())}');` },
      removeClass: { desc: 'يحذف كلاس CSS من العنصر المستهدف.', needsTarget: true, fields: [{ key: 'className', label: 'اسم الكلاس:', type: 'text', default: 'card-active' }], generate: (v, t) => `${t}.classList.remove('${esc((v.className || 'card-active').trim())}');` },
      toggleClass: { desc: 'يبدل كلاس CSS على العنصر: يضيفه إن كان غائباً ويحذفه إن كان موجوداً.', needsTarget: true, fields: [{ key: 'className', label: 'اسم الكلاس:', type: 'text', default: 'card-active' }], generate: (v, t) => `${t}.classList.toggle('${esc((v.className || 'card-active').trim())}');` },
      hide: { desc: 'يخفي العنصر المستهدف من الصفحة.', needsTarget: true, fields: [], generate: (v, t) => `${t}.style.display = 'none';` },
      show: { desc: 'يظهر العنصر المستهدف إن كان مخفياً.', needsTarget: true, fields: [], generate: (v, t) => `${t}.style.display = 'block';` },
      shake: { desc: 'يهز العنصر المستهدف حركياً للفت الانتباه.', needsTarget: true, fields: [], generate: (v, t) => `${t}.animate([\n  { transform: 'translateX(0)' },\n  { transform: 'translateX(-5px)' },\n  { transform: 'translateX(5px)' },\n  { transform: 'translateX(0)' }\n], { duration: 200 });` },
      playSound: { desc: 'يشغل ملفاً صوتياً من رابط.', fields: [{ key: 'url', label: 'رابط الملف الصوتي:', type: 'text', default: 'sound.mp3' }], generate: (v) => `new Audio('${esc(v.url)}').play();` },
      cssOpacity: { desc: 'يغير شفافية العنصر (0 = مخفي تماماً، 1 = ظاهر تماماً).', needsTarget: true, fields: [{ key: 'val', label: 'قيمة الشفافية (0 إلى 1):', type: 'text', default: '0.5' }], generate: (v, t) => `${t}.style.opacity = '${esc(v.val)}';` },
      cssTransition: { desc: 'يضيف تأثير انتقال حركي ناعم لتغييرات العنصر.', needsTarget: true, fields: [{ key: 'val', label: 'قيمة الانتقال:', type: 'text', default: 'all 0.3s ease' }], generate: (v, t) => `${t}.style.transition = '${esc(v.val)}';` },
      cssBgImage: { desc: 'يغير صورة خلفية العنصر برابط صورة.', needsTarget: true, fields: [{ key: 'url', label: 'رابط الصورة:', type: 'text', default: 'image.jpg' }], generate: (v, t) => `${t}.style.backgroundImage = "url('${esc(v.url)}')";` },
      cssShadow: { desc: 'يضيف ظلاً بصرياً للعنصر المستهدف.', needsTarget: true, fields: [{ key: 'val', label: 'قيمة الظل:', type: 'text', default: '0 4px 10px rgba(0,0,0,0.15)' }], generate: (v, t) => `${t}.style.boxShadow = '${esc(v.val)}';` },
      domScrollInto: { desc: 'يمرر الصفحة تلقائياً حتى يظهر العنصر المستهدف.', needsTarget: true, fields: [], generate: (v, t) => `${t}.scrollIntoView({ behavior: 'smooth' });` },
      domScrollToTop: { desc: 'يمرر الصفحة إلى الأعلى بشكل ناعم.', fields: [], generate: () => `window.scrollTo({ top: 0, behavior: 'smooth' });` },

      /* ==== Logic ==== */
      'if': { desc: 'ينفذ الكود الداخلي فقط إذا تحقق الشرط.', fields: [
        { key: 'left', label: 'القيمة الأولى (متغير أو رقم):', type: 'text', default: 'score' },
        { key: 'op', label: 'نوع المقارنة:', type: 'select', options: [['===', 'يساوي (===)'], ['!==', 'لا يساوي (!==)'], ['>', 'أكبر من (>)'], ['<', 'أصغر من (<)'], ['>=', 'أكبر أو يساوي (>=)'], ['<=', 'أصغر أو يساوي (<=)']], default: '===' },
        { key: 'right', label: 'القيمة الثانية (رقم أو "نص"):', type: 'text', default: '10' },
        bodyField('الكود الذي سينفذ داخل الشرط:')
      ], generate: (v) => `if (${(v.left || 'x').trim()} ${v.op} ${(v.right || '0').trim()}) {\n${ind(v.body)}\n}` },

      /* ==== Variables ==== */
      'let': { desc: 'ينشئ متغيراً جديداً يمكن تغيير قيمته لاحقاً.', fields: [{ key: 'name', label: 'اسم المتغير (بالإنجليزية):', type: 'text', default: 'score' }, { key: 'value', label: 'القيمة الابتدائية (رقم أو "نص"):', type: 'text', default: '0' }], generate: (v) => `let ${safeVar(v.name, 'myVar')} = ${(v.value || '0').trim()};` },
      'const': { desc: 'ينشئ متغيراً ثابتاً لا يمكن تغيير قيمته.', fields: [{ key: 'name', label: 'اسم المتغير (بالإنجليزية):', type: 'text', default: 'limit' }, { key: 'value', label: 'القيمة (رقم أو "نص"):', type: 'text', default: '100' }], generate: (v) => `const ${safeVar(v.name, 'myConst')} = ${(v.value || '0').trim()};` },
      increment: { desc: 'يزيد قيمة المتغير بمقدار 1.', fields: [{ key: 'name', label: 'اسم المتغير:', type: 'text', default: 'score' }], generate: (v) => `${safeVar(v.name, 'score')}++;` },
      decrement: { desc: 'ينقص قيمة المتغير بمقدار 1.', fields: [{ key: 'name', label: 'اسم المتغير:', type: 'text', default: 'score' }], generate: (v) => `${safeVar(v.name, 'score')}--;` },

      /* ==== Browser ==== */
      alert: { desc: 'يعرض رسالة منبثقة للزائر أعلى الصفحة.', fields: [{ key: 'message', label: 'نص الرسالة:', type: 'text', default: 'مرحباً بك!', dir: 'rtl' }], generate: (v) => `alert('${esc(v.message)}');` },
      confirm: { desc: 'يسأل الزائر سؤال نعم/لا وينفذ الكود عند الموافقة.', fields: [{ key: 'message', label: 'نص السؤال:', type: 'text', default: 'هل تريد الاستمرار؟', dir: 'rtl' }, bodyField('الكود عند الموافقة:')], generate: (v) => `if (confirm('${esc(v.message)}')) {\n${ind(v.body)}\n}` },
      prompt: { desc: 'يطلب من الزائر كتابة نص ويخزنه في متغير.', fields: [{ key: 'varName', label: 'اسم المتغير:', type: 'text', default: 'name' }, { key: 'question', label: 'نص السؤال:', type: 'text', default: 'أدخل اسمك:', dir: 'rtl' }], generate: (v) => `let ${safeVar(v.varName, 'answer')} = prompt('${esc(v.question)}');` },
      log: { desc: 'يطبع رسالة في كونسول المتصفح (أداة المطورين).', fields: [{ key: 'message', label: 'الرسالة:', type: 'text', default: 'تمت العملية بنجاح!', dir: 'rtl' }], generate: (v) => `console.log('${esc(v.message)}');` },
      redirect: { desc: 'ينقل الزائر إلى رابط موقع آخر.', fields: [{ key: 'url', label: 'الرابط:', type: 'text', default: 'https://google.com' }], generate: (v) => `window.location.href = '${esc(v.url)}';` },
      open: { desc: 'يفتح رابطاً في نافذة أو تبويب جديد.', fields: [{ key: 'url', label: 'الرابط:', type: 'text', default: 'https://google.com' }], generate: (v) => `window.open('${esc(v.url)}');` },
      dateNow: { desc: 'يخزن التاريخ والوقت الحاليين في متغير.', fields: [{ key: 'varName', label: 'اسم المتغير:', type: 'text', default: 'timeNow' }], generate: (v) => `let ${safeVar(v.varName, 'timeNow')} = new Date().toLocaleString('ar-EG');` },

      /* ==== Timers ==== */
      setTimeout: { desc: 'ينفذ الكود مرة واحدة بعد مدة زمنية (بالمللي ثانية).', fields: [{ key: 'delay', label: 'المدة بالمللي ثانية (1000 = ثانية واحدة):', type: 'number', default: '1000' }, bodyField('الكود بعد انتهاء المدة:')], generate: (v) => `setTimeout(() => {\n${ind(v.body)}\n}, ${parseInt(v.delay, 10) || 1000});` },
      setInterval: { desc: 'يكرر تنفيذ الكود كل مدة زمنية محددة.', fields: [{ key: 'varName', label: 'اسم متغير المؤقت:', type: 'text', default: 'myInterval' }, { key: 'delay', label: 'المدة بالمللي ثانية:', type: 'number', default: '1000' }, bodyField('الكود المتكرر:')], generate: (v) => `let ${safeVar(v.varName, 'myInterval')} = setInterval(() => {\n${ind(v.body)}\n}, ${parseInt(v.delay, 10) || 1000});` },
      clearInterval: { desc: 'يوقف مؤقتاً متكرراً تم إنشاؤه سابقاً.', fields: [{ key: 'varName', label: 'اسم متغير المؤقت:', type: 'text', default: 'myInterval' }], generate: (v) => `clearInterval(${safeVar(v.varName, 'myInterval')});` },

      /* ==== Storage ==== */
      setStorage: { desc: 'يحفظ قيمة في ذاكرة المتصفح المحلية (تبقى بعد إغلاق الصفحة).', fields: [{ key: 'k', label: 'اسم المفتاح:', type: 'text', default: 'username' }, { key: 'val', label: 'القيمة:', type: 'text', default: 'Ahmed', dir: 'rtl' }], generate: (v) => `localStorage.setItem('${esc(v.k)}', '${esc(v.val)}');` },
      getStorage: { desc: 'يقرأ قيمة محفوظة من ذاكرة المتصفح ويخزنها في متغير.', fields: [{ key: 'varName', label: 'اسم المتغير:', type: 'text', default: 'user' }, { key: 'k', label: 'اسم المفتاح:', type: 'text', default: 'username' }], generate: (v) => `let ${safeVar(v.varName, 'savedValue')} = localStorage.getItem('${esc(v.k)}');` },
      removeStorage: { desc: 'يحذف قيمة محفوظة من ذاكرة المتصفح.', fields: [{ key: 'k', label: 'اسم المفتاح:', type: 'text', default: 'username' }], generate: (v) => `localStorage.removeItem('${esc(v.k)}');` }
    };
  }

  // Short expression snippets (x === y, text.length ...) are inserted at the
  // cursor unwrapped — they are not standalone statements to manage in a list.
  isInlineSnippet(block) {
    if (block.id === 'else-if' || block.id === 'else' || block.id === 'domMousePos') return true;
    return block.code.indexOf(';') === -1 && block.code.indexOf('{') === -1;
  }

  getBlockBuilder(block) {
    const custom = this.blockBuilders[block.id];
    if (custom) {
      return Object.assign({ id: block.id, cat: block.cat, title: block.title, inline: false, fields: [] }, custom);
    }
    const inline = this.isInlineSnippet(block);
    return {
      id: block.id,
      cat: block.cat,
      title: block.title,
      desc: inline
        ? 'مقطع كود قصير — عدّله إن أردت ثم أدرجه عند موضع المؤشر في المحرر.'
        : 'كتلة كود جاهزة — راجع الكود وعدّله بما يناسبك ثم أدرجه.',
      inline: inline,
      fields: [{ key: 'code', label: 'الكود:', type: 'textarea', default: block.code }],
      generate: (v) => (v.code !== undefined ? v.code : block.code)
    };
  }

  getLegacyBlockMapping(blockId) {
    const core = globalThis.VisualLogicCore || null;
    if (!core) return null;
    if (typeof core.getLegacyBlockMapping === 'function') return core.getLegacyBlockMapping(blockId);
    return core.LEGACY_BLOCK_MAPPINGS ? core.LEGACY_BLOCK_MAPPINGS[blockId] || null : null;
  }

  getLegacyEditBuilder(block, existing) {
    const mapping = this.getLegacyBlockMapping(block.id);
    const configured = this.getBlockBuilder(block);
    const hasDedicatedBuilder = !!this.blockBuilders[block.id];
    const params = existing && existing.params && typeof existing.params === 'object' ? existing.params : {};
    const fieldsComplete = configured.fields.every(field => Object.prototype.hasOwnProperty.call(params, field.key));
    const targetComplete = !configured.needsTarget || (
      typeof params.__targetId === 'string' &&
      params.__targetId !== '' &&
      !!document.getElementById(params.__targetId)
    );
    const canUseStructuredConfig = !!(
      existing && existing.metadataPresent && existing.metadataValid &&
      mapping && mapping.kind !== 'legacyCustom' &&
      hasDedicatedBuilder && fieldsComplete && targetComplete
    );

    if (canUseStructuredConfig) {
      return { builder: configured, params: params, mapping: mapping, rawMode: false };
    }

    const rawCode = existing && typeof existing.rawCode === 'string'
      ? existing.rawCode
      : String(block.code || '');
    return {
      builder: {
        id: block.id,
        cat: block.cat || 'legacy',
        title: block.title || block.id || 'Legacy Custom Code',
        desc: 'Legacy Custom Code mode preserves the original source when structured metadata cannot be restored safely.',
        inline: false,
        fields: [{ key: 'code', label: 'Raw JavaScript:', type: 'textarea', default: rawCode }],
        generate: values => String(values.code === undefined ? rawCode : values.code)
      },
      params: { code: rawCode },
      mapping: mapping,
      rawMode: true
    };
  }

  openBlockConfig(block, existing = null) {
    // The legacy surface is edit-only after E1.3. New interactions belong in
    // the unified Interaction Builder.
    if (!existing) {
      this.showToastNotice('Use the Interaction Builder to create new JavaScript behavior.');
      return false;
    }
    const legacyEdit = this.getLegacyEditBuilder(block, existing);
    const builder = legacyEdit.builder;
    const panel = document.getElementById('js-block-config-panel');
    if (!panel) return false;

    this.activeBlockConfig = {
      block: block,
      builder: builder,
      existingId: existing.id,
      legacyRawMode: legacyEdit.rawMode,
      legacyMapping: legacyEdit.mapping,
      originalEntry: existing
    };
    const params = legacyEdit.params;
    const catInfo = this.getCategoryInfo(block.cat);
    const escAttr = (s) => String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let stepNum = 0;
    let stepsHTML = '';

    // Step: settings fields
    if (builder.fields.length > 0) {
      stepNum++;
      let inner = '';
      builder.fields.forEach(f => {
        const val = params[f.key] !== undefined ? params[f.key] : f.default;
        const dir = f.dir || 'ltr';
        const align = dir === 'rtl' ? 'right' : 'left';
        if (f.type === 'textarea') {
          inner += `
            <div class="js-linker-field-group">
              <span class="js-linker-label">${f.label}</span>
              <textarea class="js-linker-input block-config-field block-config-textarea" data-key="${f.key}" rows="3" style="direction:${dir}; text-align:${align};">${escAttr(val)}</textarea>
            </div>`;
        } else if (f.type === 'select') {
          const opts = f.options.map(o => `<option value="${escAttr(o[0])}" ${String(val) === String(o[0]) ? 'selected' : ''}>${o[1]}</option>`).join('');
          inner += `
            <div class="js-linker-field-group">
              <span class="js-linker-label">${f.label}</span>
              <select class="js-linker-select block-config-field" data-key="${f.key}">${opts}</select>
            </div>`;
        } else {
          inner += `
            <div class="js-linker-field-group">
              <span class="js-linker-label">${f.label}</span>
              <input type="${f.type === 'number' ? 'number' : 'text'}" class="js-linker-input block-config-field" data-key="${f.key}" value="${escAttr(val)}" placeholder="${escAttr(f.placeholder || '')}" style="direction:${dir}; text-align:${align};">
            </div>`;
        }
      });
      stepsHTML += `
        <div class="js-step-container">
          <div class="js-step-header"><span class="js-step-badge">${stepNum}</span><span class="js-step-title">اضبط الإعدادات</span></div>
          <div class="js-step-content">${inner}</div>
        </div>`;
    }

    // Step: target element (same linker-style selection)
    if (builder.needsTarget) {
      stepNum++;
      const selEl = this.app.selectedElement;
      const savedType = existing ? 'other' : (selEl ? 'same' : 'other');
      const sameOpts = selEl ? `
        <option value="same" ${savedType === 'same' ? 'selected' : ''}>نفس العنصر المحدد حالياً (&lt;${selEl.tagName.toLowerCase()}&gt;)</option>
        <option value="parent">العنصر الأب المباشر</option>
        <option value="child">أول عنصر ابن</option>` : '';
      stepsHTML += `
        <div class="js-step-container">
          <div class="js-step-header"><span class="js-step-badge">${stepNum}</span><span class="js-step-title">اختر العنصر المستهدف (Target)</span></div>
          <div class="js-step-content">
            <select id="block-target-type" class="js-linker-select">
              ${sameOpts}
              <option value="other" ${savedType === 'other' ? 'selected' : ''}>عنصر من الصفحة (من القائمة)</option>
              <option value="pick">اختيار عنصر من المعاينة بالضغط عليه 🎯</option>
            </select>
            <select id="block-target-select" class="js-linker-select" style="display: none; font-family: monospace; direction: ltr; text-align: left;"></select>
            <button type="button" id="block-target-picker-btn" class="btn btn-secondary" style="display: none; height: 24px; font-size: 9px; width: 100%;">
              <i class="fas fa-crosshair"></i> ابدأ تحديد العنصر من المعاينة
            </button>
          </div>
        </div>`;
    }

    // Step: live code preview
    stepNum++;
    stepsHTML += `
      <div class="js-step-container">
        <div class="js-step-header"><span class="js-step-badge">${stepNum}</span><span class="js-step-title">معاينة الكود الناتج</span></div>
        <div class="js-step-content"><pre id="block-code-preview" class="js-code-preview" dir="ltr"></pre></div>
      </div>`;

    const mappingKind = legacyEdit.mapping ? legacyEdit.mapping.kind : 'legacyCustom';
    const mappingTarget = legacyEdit.mapping
      ? (legacyEdit.mapping.toolId || legacyEdit.mapping.nativeType || legacyEdit.mapping.destination || '')
      : '';
    panel.innerHTML = `
      <div class="block-config-card legacy-block-edit-card" data-legacy-mode="${legacyEdit.rawMode ? 'raw' : 'structured'}" style="--block-accent: ${catInfo.color};">
        <div class="block-config-header">
          <span class="block-config-title"><span class="cat-dot" style="background: ${catInfo.color};"></span>${escAttr(builder.title)}</span>
          <button type="button" class="block-config-close" id="block-config-close" title="إغلاق اللوحة">&times;</button>
        </div>
        <div class="block-config-note legacy-edit-only-note" data-legacy-mapping-kind="${escAttr(mappingKind)}">
          <i class="fas fa-box-archive"></i> Legacy edit-only mode · ${escAttr(mappingKind)}${mappingTarget ? ` → ${escAttr(mappingTarget)}` : ''}${legacyEdit.rawMode ? ' · raw source preserved' : ''}
        </div>
        <p class="block-config-desc">${builder.desc}</p>
        ${builder.inline ? '<div class="block-config-note"><i class="fas fa-i-cursor"></i> مقطع قصير: سيُدرج عند موضع المؤشر داخل محرر الكود.</div>' : ''}
        ${stepsHTML}
        <div style="display: flex; gap: 6px;">
          <button type="button" id="block-config-insert" class="btn btn-primary" style="flex: 2; height: 30px; font-weight: bold;">
            <i class="fas fa-plus-circle"></i> ${existing ? 'تحديث الكود' : 'إدراج الكود'}
          </button>
          <button type="button" id="block-config-cancel" class="btn btn-secondary" style="flex: 1; height: 30px;">إلغاء</button>
        </div>
      </div>`;
    panel.style.display = 'block';

    // Populate target dropdown with live canvas elements
    if (builder.needsTarget) {
      const typeSel = document.getElementById('block-target-type');
      const targetSel = document.getElementById('block-target-select');
      const pickBtn = document.getElementById('block-target-picker-btn');

      this.blockTargetCandidates = this.getAllCanvasElements().filter(item => item.id !== 'builder-canvas');
      const savedId = existing ? (params.__targetId || '') : '';
      this.blockTargetCandidates.forEach((item, i) => {
        const opt = document.createElement('option');
        opt.value = item.id ? `id:${item.id}` : `idx:${i}`;
        opt.textContent = item.label;
        if (savedId && item.id === savedId) opt.selected = true;
        targetSel.appendChild(opt);
      });

      const applyTargetVisibility = () => {
        const type = typeSel.value;
        targetSel.style.display = (type === 'other' || type === 'pick') ? 'block' : 'none';
        pickBtn.style.display = type === 'pick' ? 'block' : 'none';
      };
      applyTargetVisibility();

      typeSel.addEventListener('change', () => {
        applyTargetVisibility();
        this.updateBlockPreview();
      });
      targetSel.addEventListener('change', () => this.updateBlockPreview());
      pickBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isPickingTarget = true;
        this.pickingContext = 'block';
        this.showToastNotice('وضع تحديد الهدف: اضغط على أي عنصر في المعاينة لتحديده...');
      });
    }

    // Wire fields to live preview (no history recording while typing)
    panel.querySelectorAll('.block-config-field').forEach(fieldEl => {
      const evt = fieldEl.tagName === 'SELECT' ? 'change' : 'input';
      fieldEl.addEventListener(evt, () => this.updateBlockPreview());
    });

    document.getElementById('block-config-close').addEventListener('click', () => this.closeBlockConfig());
    document.getElementById('block-config-cancel').addEventListener('click', () => this.closeBlockConfig());
    document.getElementById('block-config-insert').addEventListener('click', () => this.commitBlockConfig());

    this.updateBlockPreview();

    // Keep the sticky config panel fully visible
    const region = panel.closest('.js-region-blocks');
    if (region) region.scrollTop = 0;
  }

  closeBlockConfig() {
    const panel = document.getElementById('js-block-config-panel');
    if (panel) {
      panel.style.display = 'none';
      panel.innerHTML = '';
    }
    this.activeBlockConfig = null;
    this.blockTargetCandidates = [];
    if (this.pickingContext === 'block') {
      this.pickingContext = null;
      this.isPickingTarget = false;
    }
  }

  collectBlockValues() {
    const panel = document.getElementById('js-block-config-panel');
    const values = {};
    if (!panel) return values;
    panel.querySelectorAll('.block-config-field').forEach(f => {
      values[f.dataset.key] = f.value;
    });
    const typeSel = document.getElementById('block-target-type');
    if (typeSel) {
      values.__targetType = typeSel.value;
      const targetSel = document.getElementById('block-target-select');
      if (targetSel) values.__targetSelectValue = targetSel.value;
    }
    return values;
  }

  resolveBlockTarget(values, forCommit) {
    const type = values.__targetType || 'same';
    let el = null;
    const sel = this.app.selectedElement;

    if (type === 'same') {
      el = sel;
    } else if (type === 'parent') {
      el = sel && sel.parentElement && sel.parentElement !== this.app.canvas ? sel.parentElement : sel;
    } else if (type === 'child') {
      el = sel && sel.firstElementChild ? sel.firstElementChild : sel;
    } else { // other | pick
      const selVal = values.__targetSelectValue || '';
      if (selVal.indexOf('id:') === 0) {
        el = document.getElementById(selVal.substring(3));
      } else if (selVal.indexOf('idx:') === 0) {
        const cand = this.blockTargetCandidates[parseInt(selVal.substring(4), 10)];
        el = cand && cand.element && cand.element.isConnected ? cand.element : null;
      }
    }

    if (!el || el === this.app.canvas) return null;

    if (forCommit && !el.id) {
      el.id = this.generateUniqueElementId(el.tagName);
      this.app.syncAll();
    }

    const elId = el.id || `${el.tagName.toLowerCase()}-auto`;
    const varName = el.id ? this.getElementVariableName(el) : `${el.tagName.toLowerCase()}_element`;
    return { el: el, id: elId, varName: varName };
  }

  generateBlockCode(builder, values, forCommit) {
    let targetVar = null;
    let decl = '';
    if (builder.needsTarget) {
      const t = this.resolveBlockTarget(values, forCommit);
      if (!t) {
        return { error: 'اختر عنصراً مستهدفاً أولاً: حدد عنصراً من المعاينة أو اختر من القائمة.' };
      }
      targetVar = t.varName;
      values.__targetId = t.el.id || '';
      // Ignore the block currently being replaced. Its declaration is removed
      // with the old wrapper, so treating it as reusable would lose the target.
      let declarationScope = this.customJS;
      const existingId = this.activeBlockConfig && this.activeBlockConfig.existingId;
      if (existingId) {
        const existing = this.parseJsBlocks().find(block => block.id === existingId);
        if (existing) {
          const scopeLines = declarationScope.split(/\r?\n/);
          scopeLines.splice(existing.startIndex, existing.endIndex - existing.startIndex + 1);
          declarationScope = scopeLines.join('\n');
        }
      }
      // Reuse an existing declaration outside the edited block; declare otherwise.
      if (!declarationScope.includes(`const ${targetVar} =`)) {
        decl = `const ${targetVar} = document.getElementById('${t.id}');\n`;
      }
    }
    const code = builder.generate(values, targetVar);
    return { code: decl + code };
  }

  updateBlockPreview() {
    if (!this.activeBlockConfig) return;
    const preview = document.getElementById('block-code-preview');
    if (!preview) return;
    const values = this.collectBlockValues();
    const res = this.generateBlockCode(this.activeBlockConfig.builder, values, false);
    if (res.error) {
      preview.innerHTML = `<span class="code-line"><span class="tok-comment">// ${res.error}</span></span>`;
    } else {
      preview.innerHTML = this.renderCodePreview(res.code);
    }
  }

  createUniqueLegacyBlockId() {
    const used = new Set(this.parseJsBlocks().map(block => block.id));
    this._legacyBlockIdSequence = (this._legacyBlockIdSequence || 0) + 1;
    let candidate;
    do {
      let token;
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        token = crypto.randomUUID();
      } else {
        token = `${Date.now().toString(36)}-${this._legacyBlockIdSequence.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      }
      candidate = `block-${token.replace(/[^A-Za-z0-9_-]/g, '')}`;
    } while (used.has(candidate));
    return candidate;
  }

  commitBlockConfig() {
    if (!this.activeBlockConfig) return;
    const builder = this.activeBlockConfig.builder;
    const existingId = this.activeBlockConfig.existingId;
    const values = this.collectBlockValues();
    const res = this.generateBlockCode(builder, values, true);
    if (res.error) {
      this.showToastNotice(res.error);
      return;
    }

    // Show the JS tab so the user sees the inserted result
    if (this.currentLanguage !== 'js') {
      const jsTab = document.querySelector('.editor-tab[data-lang="js"]');
      if (jsTab) jsTab.click();
    }

    if (builder.inline) {
      // Short snippet: insert at the cursor, unwrapped
      this.insertAtCursor(this.textarea, res.code + '\n');
      this.customJS = this.textarea.value;
      this.app.saveProgress();
      this.app.history.saveState('Insert JS Snippet');
      this.updateLineNumbers();
      this.flashEditorShell();
      this.closeBlockConfig();
      this.showToastNotice(`تم إدراج [${builder.title}] عند موضع المؤشر`);
      return;
    }

    const savedValues = Object.assign({}, values);
    delete savedValues.__targetSelectValue;

    const blockId = existingId || this.createUniqueLegacyBlockId();
    const wrapped = `// OSOOS_JS_BLOCK_START id="${blockId}" type="${builder.id}"\n` +
                    `// BLOCK_PARAMS: ${encodeURIComponent(JSON.stringify(savedValues))}\n` +
                    `${res.code}\n` +
                    `// OSOOS_JS_BLOCK_END id="${blockId}"`;

    let revealStart;
    if (existingId) {
      const match = this.parseJsBlocks().find(b => b.id === existingId);
      if (!match) {
        this.showToastNotice('The legacy block no longer exists. Reopen it from the dashboard.');
        this.closeBlockConfig();
        return;
      }
      const lines = this.customJS.split(/\r?\n/);
      revealStart = lines.slice(0, match.startIndex).join('\n').length + (match.startIndex > 0 ? 1 : 0);
      lines.splice(match.startIndex, match.endIndex - match.startIndex + 1, ...wrapped.split('\n'));
      this.customJS = lines.join('\n');
    } else {
      const separator = this.customJS && !this.customJS.endsWith('\n') ? '\n' : '';
      revealStart = this.customJS.length + separator.length;
      this.customJS += `${separator}${wrapped}\n`;
    }
    this.textarea.value = this.customJS;
    this.app.saveProgress();
    this.app.history.saveState(existingId ? 'Update JS Block' : 'Insert JS Block');
    this.updateLineNumbers();

    // Scroll the editor to the new code and softly highlight it
    this.revealEditorRange(revealStart, revealStart + wrapped.length);

    this.renderBlocksDashboard();
    this.scanAndRenderVariables();
    this.closeBlockConfig();
    this.showToastNotice(existingId ? 'تم تحديث الكود بنجاح!' : 'تم إدراج الكود بنجاح!');
  }

  /* ==== Generated blocks management (dashboard list) ==== */

  parseJsBlocks() {
    const lines = this.customJS.split(/\r?\n/);
    const blocks = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const startMarker = line.match(/^\/\/\s*OSOOS_JS_BLOCK_START\b/);
      if (!current && startMarker) {
        const idMatch = line.match(/\bid="([^"]+)"/);
        const typeMatch = line.match(/\btype="([^"]+)"/);
        if (idMatch) {
          current = {
            id: idMatch[1],
            type: typeMatch ? typeMatch[1] : '',
            params: {},
            paramsRaw: '',
            metadataPresent: false,
            metadataValid: false,
            startIndex: i
          };
        }
        continue;
      }
      if (!current) continue;

      const endMarker = line.match(/^\/\/\s*OSOOS_JS_BLOCK_END\b.*\bid="([^"]+)"/);
      if (!endMarker || endMarker[1] !== current.id) continue;

      current.endIndex = i;
      current.endMarkerId = endMarker[1];
      const payloadLines = lines.slice(current.startIndex + 1, current.endIndex);
      const rawCodeLines = [];
      payloadLines.forEach((payloadLine, payloadIndex) => {
        const trimmed = payloadLine.trim();
        // Generated metadata is only valid in the first payload line. A later
        // comment with the same prefix belongs to the user's raw source.
        if (payloadIndex === 0 && trimmed.indexOf('// BLOCK_PARAMS:') === 0) {
          current.metadataPresent = true;
          current.paramsRaw = trimmed.substring(16).trim();
          try {
            const parsed = JSON.parse(decodeURIComponent(current.paramsRaw));
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Block params must be an object');
            current.params = parsed;
            current.metadataValid = true;
          } catch (err) {
            current.params = {};
            current.metadataValid = false;
            current.metadataError = err && err.message ? err.message : String(err);
          }
        } else {
          rawCodeLines.push(payloadLine);
        }
      });
      current.rawCode = rawCodeLines.join('\n');
      current.rawPayload = payloadLines.join('\n');
      current.wrappedCode = lines.slice(current.startIndex, current.endIndex + 1).join('\n');
      blocks.push(current);
      current = null;
    }
    return blocks;
  }

  renderBlocksDashboard() {
    const container = document.getElementById('js-blocks-dashboard');
    if (!container) return;

    const blocks = this.parseJsBlocks();

    if (blocks.length === 0) {
      container.innerHTML = `
        <div class="js-dashboard-title"><i class="fas fa-box-archive"></i> Legacy JavaScript blocks (0)</div>
        <div class="legacy-dashboard-empty" style="font-size: 8px; color: var(--text-muted); text-align: center; padding: 10px; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); margin-top: 6px;">
          No legacy blocks are used in this project. Create new behavior with the Interaction Builder.
        </div>`;
      return;
    }

    const lines = this.customJS.split(/\r?\n/);
    const escapeHtml = value => String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    let itemsHTML = '';
    blocks.forEach(b => {
      const dbItem = this.blocksDb.find(x => x.id === b.type);
      const catInfo = this.getCategoryInfo(dbItem ? dbItem.cat : '');
      const typeLabel = escapeHtml(dbItem ? dbItem.title : (b.type || 'Unknown legacy block'));
      const mapping = this.getLegacyBlockMapping(b.type);
      const mappingKind = mapping ? mapping.kind : 'legacyCustom';
      const category = dbItem ? dbItem.cat : 'legacy';

      let summary = '';
      for (let i = b.startIndex + 1; i < b.endIndex; i++) {
        const t = lines[i].trim();
        if (t && t.indexOf('//') !== 0) { summary = t; break; }
      }
      if (summary.length > 46) summary = summary.substring(0, 46) + '…';
      summary = summary.replace(/&/g, '&amp;').replace(/</g, '&lt;');

      itemsHTML += `
        <div class="js-dashboard-item legacy-js-block" data-legacy-block-id="${escapeHtml(b.id)}" data-legacy-type="${escapeHtml(b.type)}" data-legacy-category="${escapeHtml(category)}" data-legacy-mapping-kind="${escapeHtml(mappingKind)}">
          <div class="js-dashboard-item-row">
            <div class="js-dashboard-item-flow">
              <span class="cat-dot" style="background: ${catInfo.color};"></span>
              <span style="font-weight: bold; color: var(--text-main);">${typeLabel}</span>
              <small class="legacy-mapping-badge">${escapeHtml(mappingKind)}</small>
            </div>
            <div class="js-dashboard-actions">
              <button class="js-dashboard-btn edit" data-block-id="${escapeHtml(b.id)}" title="Edit this legacy block">
                <i class="fas fa-edit"></i>
              </button>
              <button class="js-dashboard-btn delete" data-block-id="${escapeHtml(b.id)}" title="Delete this legacy block">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <div class="js-block-summary">${summary}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="js-dashboard-title"><i class="fas fa-box-archive"></i> Legacy JavaScript blocks (${blocks.length}) · edit only</div>
      <div class="js-dashboard-list">${itemsHTML}</div>`;

    container.querySelectorAll('.js-dashboard-btn.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const entry = this.parseJsBlocks().find(x => x.id === btn.dataset.blockId);
        if (!entry) return;
        const blockDef = this.blocksDb.find(x => x.id === entry.type);
        const editableBlockDef = blockDef || {
          id: entry.type || 'unknown-legacy',
          title: entry.type || 'Unknown legacy block',
          cat: 'legacy',
          code: entry.rawCode || ''
        };
        this.openBlockConfig(editableBlockDef, entry);
        this.showToastNotice('Legacy block loaded in edit-only mode.');
      });
    });

    container.querySelectorAll('.js-dashboard-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('هل تريد حذف هذا الكود المولد نهائياً من المحرر؟')) {
          this.deleteJsBlock(btn.dataset.blockId);
        }
      });
    });
  }

  deleteJsBlock(id) {
    const match = this.parseJsBlocks().find(b => b.id === id);
    if (!match) return;

    const lines = this.customJS.split(/\r?\n/);
    lines.splice(match.startIndex, match.endIndex - match.startIndex + 1);
    this.customJS = lines.join('\n');

    if (this.currentLanguage === 'js') {
      this.textarea.value = this.customJS;
      this.updateLineNumbers();
    }
    this.app.saveProgress();
    this.app.history.saveState('Delete JS Block');

    if (this.activeBlockConfig && this.activeBlockConfig.existingId === id) {
      this.closeBlockConfig();
    }
    this.renderBlocksDashboard();
    this.scanAndRenderVariables();
    this.showToastNotice('تم حذف الكود المولد بنجاح');
  }

  /* ============================================================
     Visual Connection Builder — element-to-element JS links with
     an SVG arrow overlay (editor-only) and a Logic Popup.
     Code is wrapped in OSOOS_VISUAL_LINK comments, separate from
     OSOOS_INTERACTION and OSOOS_JS_BLOCK.
     ============================================================ */

  ensureElementId(el) {
    if (!el.id) {
      el.id = this.generateUniqueElementId(el.tagName);
      this.app.syncAll();
    }
    return el.id;
  }

  insertIntoTextarea(tx, text) {
    const start = typeof tx.selectionStart === 'number' ? tx.selectionStart : tx.value.length;
    const end = typeof tx.selectionEnd === 'number' ? tx.selectionEnd : tx.value.length;
    tx.value = tx.value.substring(0, start) + text + tx.value.substring(end);
    tx.selectionStart = tx.selectionEnd = start + text.length;
    tx.focus();
  }

  initVisualLinkModes() {
    const esc = (s) => this.escapeJSString(s);
    const ind = (s) => this.indentCode(s);
    const safeVar = (s, fb) => this.sanitizeVarName(s, fb);
    const quoteList = (raw) => String(raw || '')
      .split(',').map(x => x.trim()).filter(x => x !== '')
      .map(x => `'${esc(x)}'`).join(', ');

    this.visualLinkModes = {
      custom: {
        label: 'كود مخصص (اكتب بنفسك)',
        fields: [{ key: 'logic', type: 'code', label: 'المنطق المخصص:', default: 'targetElement.innerText = "تم الضغط";' }],
        body: (v) => String(v.logic === undefined ? '// اكتب الكود هنا' : v.logic)
      },
      text: {
        label: 'تغيير نص الهدف',
        fields: [{ key: 'text', type: 'text', dir: 'rtl', label: 'النص الجديد:', default: 'تم التغيير' }],
        body: (v) => `targetElement.innerText = '${esc(v.text)}';`
      },
      style: {
        label: 'تغيير style للهدف',
        fields: [
          { key: 'prop', type: 'text', label: 'الخاصية (مثال: color أو background-color):', default: 'color' },
          { key: 'val', type: 'text', label: 'القيمة:', default: '#f59e0b' }
        ],
        body: (v) => `targetElement.style['${(v.prop || 'color').trim().replace(/[^a-zA-Z-]/g, '')}'] = '${esc(v.val)}';`
      },
      toggleclass: {
        label: 'تبديل class على الهدف',
        fields: [{ key: 'className', type: 'text', label: 'اسم الكلاس:', default: 'active-card' }],
        body: (v) => `targetElement.classList.toggle('${esc((v.className || 'active-card').trim())}');`
      },
      action: {
        label: 'أكشن جاهز',
        fields: [{ key: 'action', type: 'select', label: 'اختر الأكشن:', options: [['hide', 'إخفاء الهدف'], ['show', 'إظهار الهدف'], ['shake', 'اهتزاز الهدف'], ['color', 'تلوين نص الهدف بالبرتقالي']], default: 'hide' }],
        body: (v) => {
          if (v.action === 'show') return "targetElement.style.display = 'block';";
          if (v.action === 'shake') return "targetElement.animate([\n  { transform: 'translateX(0)' },\n  { transform: 'translateX(-5px)' },\n  { transform: 'translateX(5px)' },\n  { transform: 'translateX(0)' }\n], { duration: 200 });";
          if (v.action === 'color') return "targetElement.style.color = '#f59e0b';";
          return "targetElement.style.display = 'none';";
        }
      },
      counter: {
        label: 'عداد Counter على الهدف',
        fields: [{ key: 'step', type: 'number', label: 'مقدار الزيادة كل مرة:', default: '1' }],
        body: (v) => `let count = Number(targetElement.dataset.count || 0);\ncount = count + ${parseInt(v.step, 10) || 1};\ntargetElement.dataset.count = count;\ntargetElement.innerText = count;`
      },
      'if': {
        label: 'شرط if',
        fields: [
          { key: 'left', type: 'text', label: 'القيمة الأولى (تعبير JS):', default: 'targetElement.innerText' },
          { key: 'op', type: 'select', label: 'المقارنة:', options: [['===', 'يساوي (===)'], ['!==', 'لا يساوي (!==)'], ['>', 'أكبر من (>)'], ['<', 'أصغر من (<)']], default: '===' },
          { key: 'right', type: 'text', label: "القيمة الثانية (رقم أو 'نص'):", default: "'نص'" },
          { key: 'then', type: 'code', label: 'الكود عند تحقق الشرط:', default: "targetElement.style.color = 'green';" }
        ],
        body: (v) => `if (${(v.left || 'true').trim()} ${v.op || '==='} ${(v.right || 'true').trim()}) {\n${ind(v.then || '// ...')}\n}`
      },
      variable: {
        label: 'تعريف متغير',
        fields: [
          { key: 'kind', type: 'select', label: 'النوع:', options: [['let', 'let — متغير قابل للتغيير'], ['const', 'const — قيمة ثابتة']], default: 'let' },
          { key: 'name', type: 'text', label: 'اسم المتغير (بالإنجليزية):', default: 'myValue' },
          { key: 'value', type: 'text', label: "القيمة الابتدائية (رقم أو 'نص'):", default: '0' },
          { key: 'placement', type: 'select', label: 'مكان الإدراج:', options: [['top', 'أعلى كود الرابط (يُنشأ مرة واحدة)'], ['handler', 'داخل الحدث (يُنشأ عند كل تنفيذ)']], default: 'top' }
        ],
        setup: (v) => v.placement === 'handler' ? '' : `${v.kind === 'const' ? 'const' : 'let'} ${safeVar(v.name, 'myValue')} = ${(v.value || '0').trim()};`,
        body: (v) => {
          const n = safeVar(v.name, 'myValue');
          const decl = `${v.kind === 'const' ? 'const' : 'let'} ${n} = ${(v.value || '0').trim()};\n`;
          const usage = `targetElement.innerText = ${n}; // مثال: عرض قيمة المتغير`;
          return v.placement === 'handler' ? decl + usage : usage;
        }
      },
      array: {
        label: 'مصفوفة (إنشاء واستخدام)',
        fields: [
          { key: 'name', type: 'text', label: 'اسم المصفوفة (بالإنجليزية):', default: 'items' },
          { key: 'values', type: 'text', dir: 'rtl', label: 'القيم الابتدائية (مفصولة بفاصلة):', default: 'عنصر1, عنصر2' },
          { key: 'op', type: 'select', label: 'ماذا يحدث عند التنفيذ؟', options: [['push', 'إضافة قيمة جديدة ثم عرض الكل'], ['read', 'قراءة آخر قيمة وعرضها'], ['show', 'عرض كل القيم']], default: 'push' },
          { key: 'pushValue', type: 'text', dir: 'rtl', label: 'القيمة المضافة (لخيار الإضافة):', default: 'قيمة جديدة' }
        ],
        setup: (v) => `let ${safeVar(v.name, 'items')} = [${quoteList(v.values)}];`,
        body: (v) => {
          const n = safeVar(v.name, 'items');
          if (v.op === 'read') return `targetElement.innerText = ${n}[${n}.length - 1] || '';`;
          if (v.op === 'show') return `targetElement.innerText = ${n}.join('، ');`;
          return `${n}.push('${esc(v.pushValue || 'قيمة جديدة')}');\ntargetElement.innerText = ${n}.join('، ');`;
        }
      },
      storage: {
        label: 'localStorage (تخزين البيانات)',
        fields: [
          { key: 'op', type: 'select', label: 'العملية:', options: [['set', 'حفظ قيمة (set)'], ['get', 'قراءة قيمة وعرضها على الهدف (get)'], ['remove', 'حذف قيمة (remove)']], default: 'set' },
          { key: 'k', type: 'text', label: 'اسم المفتاح (key):', default: 'name' },
          { key: 'valueExpr', type: 'text', label: "القيمة (تعبير JS — مثال: targetElement.innerText أو 'نص'):", default: 'targetElement.innerText' }
        ],
        body: (v) => {
          const key = esc((v.k || 'name').trim());
          if (v.op === 'get') return `targetElement.innerText = localStorage.getItem('${key}') || '';`;
          if (v.op === 'remove') return `localStorage.removeItem('${key}');`;
          return `localStorage.setItem('${key}', ${(v.valueExpr || "''").trim()});`;
        }
      }
    };
  }

  setupVisualLinks() {
    this.initVisualLinkModes();

    // Close small menus on outside clicks
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#js-link-menu-dropdown') && !e.target.closest('#bubble-js-link')) {
        const menu = document.getElementById('js-link-menu-dropdown');
        if (menu) menu.style.display = 'none';
      }
      if (!e.target.closest('#vl-var-menu') && !e.target.closest('#vl-insert-var-btn')) {
        const vm = document.getElementById('vl-var-menu');
        if (vm) vm.style.display = 'none';
      }
    });

    this.renderVisualLinksDashboard();
  }

  // Small menu shown next to the floating "ربط JS" bubble button
  toggleJsLinkMenu() {
    const menu = document.getElementById('js-link-menu-dropdown');
    if (!menu) return;
    if (menu.style.display === 'block') {
      menu.style.display = 'none';
      return;
    }
    const el = this.app.selectedElement;
    if (!el) return;

    menu.innerHTML = '';
    const mkItem = (icon, label, fn) => {
      const a = document.createElement('a');
      a.className = 'layers-dropdown-item';
      a.href = '#';
      a.innerHTML = `<span><i class="fas ${icon}" style="margin-left: 6px; color: var(--accent-orange); width: 12px;"></i>${label}</span>`;
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        menu.style.display = 'none';
        fn();
      });
      menu.appendChild(a);
    };

    mkItem('fa-magic', 'بناء تفاعل جديد', () => {
      const b = document.getElementById('tab-btn-js');
      if (b) b.click();
    });
    mkItem('fa-project-diagram', 'ربط هذا العنصر بعنصر آخر', () => this.startVisualLinkPicking(el));
    mkItem('fa-code', 'كتابة منطق مخصص', () => {
      const id = this.ensureElementId(el);
      this.openVisualLinkPopup({ sourceId: id, targetId: id, mode: 'custom' });
    });
    mkItem('fa-save', 'تعريف متغير لهذا العنصر', () => this.generateElementVariable(el));
    mkItem('fa-i-cursor', 'استخدامه في كود موجود', () => {
      this.generateElementVariable(el);
      const varName = this.getElementVariableName(el);
      const b = document.getElementById('tab-btn-js');
      if (b) b.click();
      const jsTab = document.querySelector('.editor-tab[data-lang="js"]');
      if (jsTab) jsTab.click();
      this.insertAtCursor(this.textarea, varName);
      this.customJS = this.textarea.value;
      this.app.saveProgress();
      this.updateLineNumbers();
    });

    menu.style.display = 'block';
  }

  startVisualLinkPicking(el) {
    const id = this.ensureElementId(el);
    this.pendingVisualLinkSourceId = id;
    this.isPickingTarget = true;
    this.pickingContext = 'visual-link';
    this.showToastNotice('🎯 اختر العنصر الذي سيتأثر بهذا التفاعل — اضغط عليه في المعاينة (Esc للإلغاء)', 4000);
  }

  parseVisualLinks() {
    const lines = this.customJS.split(/\r?\n/);
    const links = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.indexOf('// OSOOS_VISUAL_LINK_START') === 0) {
        const idMatch = line.match(/id="([^"]+)"/);
        if (idMatch) {
          current = { id: idMatch[1], sourceId: '', targetId: '', event: 'click', mode: 'custom', params: {}, startIndex: i };
        }
      } else if (current) {
        if (line.indexOf('// SOURCE_ID:') === 0) current.sourceId = line.substring(13).trim();
        else if (line.indexOf('// TARGET_ID:') === 0) current.targetId = line.substring(13).trim();
        else if (line.indexOf('// EVENT:') === 0) current.event = line.substring(9).trim();
        else if (line.indexOf('// MODE:') === 0) current.mode = line.substring(8).trim();
        else if (line.indexOf('// PARAMS:') === 0) {
          try {
            current.params = JSON.parse(decodeURIComponent(line.substring(10).trim()));
          } catch {
            current.params = {};
          }
        } else if (line.indexOf('// OSOOS_VISUAL_LINK_END') === 0) {
          current.endIndex = i;
          links.push(current);
          current = null;
        }
      }
    }
    return links;
  }

  // Each link is wrapped in an IIFE so sourceElement/targetElement/event are
  // available in every link without const collisions between links.
  generateVisualLinkCode(def) {
    const mode = this.visualLinkModes[def.mode] || this.visualLinkModes.custom;
    const params = def.params || {};
    const ind = (s) => this.indentCode(s);

    let body = mode.body ? mode.body(params) : '// ...';
    if (def.event === 'submit') {
      body = 'event.preventDefault();\n' + body;
    }
    const setup = mode.setup ? mode.setup(params) : '';

    let inner = '';
    inner += `  const sourceElement = document.getElementById('${def.sourceId}');\n`;
    inner += `  const targetElement = document.getElementById('${def.targetId}');\n`;
    inner += '  if (!sourceElement || !targetElement) { return; }\n';
    if (setup) inner += ind(setup) + '\n';
    inner += `  sourceElement.addEventListener('${def.event}', (event) => {\n`;
    inner += ind(ind(body)) + '\n';
    inner += '  });\n';

    return `// OSOOS_VISUAL_LINK_START id="${def.id}"\n` +
           `// SOURCE_ID: ${def.sourceId}\n` +
           `// TARGET_ID: ${def.targetId}\n` +
           `// EVENT: ${def.event}\n` +
           `// MODE: ${def.mode}\n` +
           `// PARAMS: ${encodeURIComponent(JSON.stringify(params))}\n` +
           '(function () {\n' +
           inner +
           '})();\n' +
           `// OSOOS_VISUAL_LINK_END id="${def.id}"`;
  }

  openVisualLinkPopup(seed, existing = null) {
    this.closeVisualLinkPopup();

    const src = existing ? existing.sourceId : seed.sourceId;
    const tgt = existing ? existing.targetId : seed.targetId;
    const ev = existing ? existing.event : 'click';
    const mode = existing ? existing.mode : (seed && seed.mode ? seed.mode : 'custom');
    const params = existing ? (existing.params || {}) : {};

    this.activeVisualLink = {
      existingId: existing ? existing.id : null,
      draftId: `link-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceId: src,
      targetId: tgt
    };
    this.previewLinkArrow = { sourceId: src, targetId: tgt };

    const srcEl = document.getElementById(src);
    const tgtEl = document.getElementById(tgt);
    const escapeLabel = value => String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const srcLabel = escapeLabel((srcEl ? srcEl.tagName.toLowerCase() : '؟') + '#' + src);
    const tgtLabel = escapeLabel((tgtEl ? tgtEl.tagName.toLowerCase() : '؟') + '#' + tgt);

    const events = ['click', 'mouseenter', 'mouseleave', 'input', 'change', 'submit', 'focus', 'blur', 'keydown'];
    const eventLabels = {
      click: 'عند النقر (click)', mouseenter: 'دخول الفأرة (mouseenter)', mouseleave: 'خروج الفأرة (mouseleave)',
      input: 'الكتابة (input)', change: 'تغيير القيمة (change)', submit: 'إرسال النموذج (submit)',
      focus: 'التركيز (focus)', blur: 'فقد التركيز (blur)', keydown: 'ضغط مفتاح (keydown)'
    };
    const evOptions = events.map(e2 => `<option value="${e2}" ${e2 === ev ? 'selected' : ''}>${eventLabels[e2]}</option>`).join('');
    const modeOptions = Object.keys(this.visualLinkModes)
      .map(k => `<option value="${k}" ${k === mode ? 'selected' : ''}>${this.visualLinkModes[k].label}</option>`).join('');

    const overlay = document.createElement('div');
    overlay.className = 'vl-popup-overlay';
    overlay.id = 'vl-popup-overlay';
    overlay.innerHTML = `
      <div class="vl-popup">
        <div class="vl-popup-header">
          <span class="vl-popup-title"><i class="fas fa-project-diagram"></i> ${existing ? 'تعديل الرابط البصري' : 'إنشاء رابط بصري جديد'}</span>
          <button type="button" class="block-config-close" id="vl-close" title="إغلاق">&times;</button>
        </div>
        <div class="vl-badges-row">
          <div class="vl-badge-group">
            <span class="js-linker-label">صاحب الحدث (Source)</span>
            <span class="vl-el-badge vl-src">${srcLabel}</span>
          </div>
          <i class="fas fa-long-arrow-alt-left vl-flow-arrow"></i>
          <div class="vl-badge-group">
            <span class="js-linker-label">المتأثر (Target)</span>
            <span class="vl-el-badge vl-tgt">${tgtLabel}</span>
          </div>
        </div>
        <div class="js-step-container">
          <div class="js-step-header"><span class="js-step-badge">1</span><span class="js-step-title">اختر الحدث (Event)</span></div>
          <div class="js-step-content"><select id="vl-event" class="js-linker-select">${evOptions}</select></div>
        </div>
        <div class="js-step-container">
          <div class="js-step-header"><span class="js-step-badge">2</span><span class="js-step-title">نوع المنطق (Logic Mode)</span></div>
          <div class="js-step-content">
            <select id="vl-mode" class="js-linker-select">${modeOptions}</select>
            <div id="vl-fields"></div>
          </div>
        </div>
        <div class="js-step-container">
          <div class="js-step-header"><span class="js-step-badge">3</span><span class="js-step-title">معاينة الكود الناتج</span></div>
          <div class="js-step-content"><pre id="vl-preview" class="js-code-preview" dir="ltr"></pre></div>
        </div>
        <div class="vl-popup-footer">
          <button type="button" id="vl-save" class="btn btn-primary" style="flex: 2;">
            <i class="fas fa-save"></i> ${existing ? 'تحديث الرابط' : 'حفظ الرابط'}
          </button>
          <button type="button" id="vl-cancel" class="btn btn-secondary" style="flex: 1;">إلغاء</button>
          ${existing ? '<button type="button" id="vl-delete" class="btn btn-secondary vl-delete-btn" title="حذف الرابط"><i class="fas fa-trash-alt"></i></button>' : ''}
        </div>
      </div>`;
    document.body.appendChild(overlay);

    this.renderVlFields(mode, params);

    overlay.querySelector('#vl-event').addEventListener('change', () => this.updateVisualLinkPreview());
    overlay.querySelector('#vl-mode').addEventListener('change', () => {
      this.renderVlFields(overlay.querySelector('#vl-mode').value, {});
      this.updateVisualLinkPreview();
    });
    overlay.querySelector('#vl-close').addEventListener('click', () => this.closeVisualLinkPopup());
    overlay.querySelector('#vl-cancel').addEventListener('click', () => this.closeVisualLinkPopup());
    overlay.querySelector('#vl-save').addEventListener('click', () => this.saveVisualLinkFromPopup());
    const delBtn = overlay.querySelector('#vl-delete');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (confirm('هل تريد حذف هذا الرابط البصري نهائياً؟')) {
          this.deleteVisualLink(this.activeVisualLink.existingId);
        }
      });
    }
    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay) this.closeVisualLinkPopup();
    });

    this._vlKeyHandler = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.closeVisualLinkPopup();
      }
    };
    document.addEventListener('keydown', this._vlKeyHandler, true);

    this.updateVisualLinkPreview();
    this.updateVisualLinkArrows();
  }

  closeVisualLinkPopup() {
    const overlay = document.getElementById('vl-popup-overlay');
    if (overlay) overlay.remove();
    if (this._vlKeyHandler) {
      document.removeEventListener('keydown', this._vlKeyHandler, true);
      this._vlKeyHandler = null;
    }
    this.activeVisualLink = null;
    this.previewLinkArrow = null;
    this.updateVisualLinkArrows();
  }

  renderVlFields(modeKey, params) {
    const holder = document.getElementById('vl-fields');
    if (!holder) return;
    const mode = this.visualLinkModes[modeKey] || this.visualLinkModes.custom;
    const escAttr = (s) => String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let html = '';
    mode.fields.forEach(f => {
      const val = params[f.key] !== undefined ? params[f.key] : f.default;
      const dir = f.dir || 'ltr';
      const align = dir === 'rtl' ? 'right' : 'left';
      if (f.type === 'code') {
        html += `
          <div class="js-linker-field-group">
            <span class="js-linker-label">${f.label}</span>
            <div class="vl-hint">المتغيرات الجاهزة: <code>sourceElement</code> · <code>targetElement</code> · <code>event</code></div>
            <textarea class="vl-field vl-code-input" data-key="${f.key}" rows="5" spellcheck="false">${escAttr(val)}</textarea>
            <div class="vl-var-row">
              <button type="button" class="btn btn-secondary" id="vl-insert-var-btn" style="height: 24px; font-size: 9px;">
                <i class="fas fa-plus"></i> إدراج متغير
              </button>
              <div class="vl-var-menu" id="vl-var-menu" style="display: none;"></div>
            </div>
          </div>`;
      } else if (f.type === 'select') {
        const opts = f.options.map(o => `<option value="${escAttr(o[0])}" ${String(val) === String(o[0]) ? 'selected' : ''}>${o[1]}</option>`).join('');
        html += `
          <div class="js-linker-field-group">
            <span class="js-linker-label">${f.label}</span>
            <select class="js-linker-select vl-field" data-key="${f.key}">${opts}</select>
          </div>`;
      } else {
        html += `
          <div class="js-linker-field-group">
            <span class="js-linker-label">${f.label}</span>
            <input type="${f.type === 'number' ? 'number' : 'text'}" class="js-linker-input vl-field" data-key="${f.key}" value="${escAttr(val)}" style="direction: ${dir}; text-align: ${align};">
          </div>`;
      }
    });
    holder.innerHTML = html;

    holder.querySelectorAll('.vl-field').forEach(fEl => {
      fEl.addEventListener(fEl.tagName === 'SELECT' ? 'change' : 'input', () => this.updateVisualLinkPreview());
    });

    const varBtn = holder.querySelector('#vl-insert-var-btn');
    if (varBtn) {
      const varMenu = holder.querySelector('#vl-var-menu');
      const codeBox = holder.querySelector('.vl-code-input');
      const snippets = [
        ['sourceElement', 'sourceElement'],
        ['targetElement', 'targetElement'],
        ['event', 'event'],
        ['localStorage', "localStorage.setItem('اسم_المفتاح', targetElement.innerText);"],
        ['قالب مصفوفة', "let items = ['قيمة1', 'قيمة2'];\nitems.push('قيمة جديدة');\ntargetElement.innerText = items.join('، ');"],
        ['قالب شرط if', "if (targetElement.innerText === 'نص') {\n  // الكود هنا\n}"],
        ['قالب عداد', "let count = Number(targetElement.dataset.count || 0);\ncount++;\ntargetElement.dataset.count = count;\ntargetElement.innerText = count;"]
      ];
      snippets.forEach(sn => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'vl-var-item';
        a.textContent = sn[0];
        a.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          varMenu.style.display = 'none';
          if (codeBox) {
            this.insertIntoTextarea(codeBox, sn[1]);
            this.updateVisualLinkPreview();
          }
        });
        varMenu.appendChild(a);
      });
      varBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        varMenu.style.display = varMenu.style.display === 'block' ? 'none' : 'block';
      });
    }
  }

  collectVisualLinkDef() {
    const overlay = document.getElementById('vl-popup-overlay');
    const def = {
      id: this.activeVisualLink.existingId || this.activeVisualLink.draftId,
      sourceId: this.activeVisualLink.sourceId,
      targetId: this.activeVisualLink.targetId,
      event: 'click',
      mode: 'custom',
      params: {}
    };
    if (!overlay) return def;
    const evSel = overlay.querySelector('#vl-event');
    const modeSel = overlay.querySelector('#vl-mode');
    if (evSel) def.event = evSel.value;
    if (modeSel) def.mode = modeSel.value;
    overlay.querySelectorAll('.vl-field').forEach(f => {
      def.params[f.dataset.key] = f.value;
    });
    return def;
  }

  updateVisualLinkPreview() {
    const preview = document.getElementById('vl-preview');
    if (!preview || !this.activeVisualLink) return;
    const def = this.collectVisualLinkDef();
    preview.innerHTML = this.renderCodePreview(this.generateVisualLinkCode(def));
  }

  saveVisualLinkFromPopup() {
    if (!this.activeVisualLink) return;
    const def = this.collectVisualLinkDef();

    if (!document.getElementById(def.sourceId) || !document.getElementById(def.targetId)) {
      this.showToastNotice('أحد العنصرين لم يعد موجوداً في الصفحة — لا يمكن حفظ الرابط');
      return;
    }

    const wrapped = this.generateVisualLinkCode(def);
    const existingId = this.activeVisualLink.existingId;
    const existing = existingId ? this.parseVisualLinks().find(l => l.id === existingId) : null;

    if (existing) {
      // Replace in place: same position, no duplication
      const lines = this.customJS.split(/\r?\n/);
      lines.splice(existing.startIndex, existing.endIndex - existing.startIndex + 1, ...wrapped.split('\n'));
      this.customJS = lines.join('\n');
    } else {
      this.customJS += `\n${wrapped}\n`;
    }

    if (this.currentLanguage === 'js') {
      this.textarea.value = this.customJS;
      this.updateLineNumbers();
    }
    this.app.saveProgress();
    this.app.history.saveState(existing ? 'Update Visual Link' : 'Create Visual Link');

    this.closeVisualLinkPopup();
    this.renderVisualLinksDashboard();
    this.scanAndRenderVariables();
    this.showToastNotice(existing ? 'تم تحديث الرابط البصري!' : 'تم إنشاء الرابط البصري بنجاح!');
  }

  deleteVisualLink(id) {
    const match = this.parseVisualLinks().find(l => l.id === id);
    if (!match) return;

    const lines = this.customJS.split(/\r?\n/);
    lines.splice(match.startIndex, match.endIndex - match.startIndex + 1);
    this.customJS = lines.join('\n');

    if (this.currentLanguage === 'js') {
      this.textarea.value = this.customJS;
      this.updateLineNumbers();
    }
    this.app.saveProgress();
    this.app.history.saveState('Delete Visual Link');

    delete this.hiddenLinkArrows[id];
    if (this.activeVisualLink && this.activeVisualLink.existingId === id) {
      this.closeVisualLinkPopup();
    }
    this.renderVisualLinksDashboard();
    this.scanAndRenderVariables();
    this.showToastNotice('تم حذف الرابط البصري');
  }

  renderVisualLinksDashboard() {
    const container = document.getElementById('js-visual-links-dashboard');
    if (!container) return;

    const links = this.parseVisualLinks();

    if (links.length === 0) {
      container.innerHTML = `
        <div class="js-dashboard-title"><i class="fas fa-project-diagram"></i> الروابط البصرية بين العناصر (0)</div>
        <div style="font-size: 8px; color: var(--text-muted); text-align: center; padding: 10px; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); margin-top: 6px;">
          لا توجد روابط بعد — اختر عنصراً ثم اضغط "ربط JS" ← "ربط هذا العنصر بعنصر آخر".
        </div>`;
      this.updateVisualLinkArrows();
      return;
    }

    let itemsHTML = '';
    links.forEach(l => {
      const modeLabel = typeof this.getVisualLinkModeLabel === 'function'
        ? this.getVisualLinkModeLabel(l)
        : ((this.visualLinkModes[l.mode] || {}).label || l.mode);
      const evLabel = this.getEventArabicLabel(l.event);
      const hidden = !!this.hiddenLinkArrows[l.id];
      const safe = typeof this.escapeVisualLinkDashboardValue === 'function'
        ? (value) => this.escapeVisualLinkDashboardValue(value)
        : (value) => String(value === undefined || value === null ? '' : value)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const safeId = safe(l.id);
      const safeEvent = safe(evLabel);
      const safeSource = safe(l.sourceId);
      const safeTarget = safe(l.targetId);
      const safeMode = safe(modeLabel);
      itemsHTML += `
        <div class="js-dashboard-item">
          <div class="js-dashboard-item-row">
            <div class="js-dashboard-item-flow vl-dash-flow" data-link-id="${safeId}" title="اضغط لتحديد العنصرين وإظهار السهم">
              عند <span class="js-item-event">${safeEvent}</span> لـ <span class="js-item-badge source">${safeSource}</span>
              ← <span style="font-weight: bold; color: var(--accent-orange);">${safeMode}</span>
              على <span class="js-item-badge target">${safeTarget}</span>
            </div>
            <div class="js-dashboard-actions">
              <button class="js-dashboard-btn vl-toggle-arrow" data-link-id="${safeId}" title="${hidden ? 'إظهار السهم' : 'إخفاء السهم'}">
                <i class="fas ${hidden ? 'fa-eye-slash' : 'fa-eye'}"></i>
              </button>
              <button class="js-dashboard-btn edit vl-edit" data-link-id="${safeId}" title="تعديل الرابط">
                <i class="fas fa-edit"></i>
              </button>
              <button class="js-dashboard-btn delete vl-del" data-link-id="${safeId}" title="حذف الرابط">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>`;
    });

    container.innerHTML = `
      <div class="js-dashboard-title"><i class="fas fa-project-diagram"></i> الروابط البصرية بين العناصر (${links.length})</div>
      <div class="js-dashboard-list">${itemsHTML}</div>`;

    container.querySelectorAll('.vl-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const entry = this.parseVisualLinks().find(x => x.id === btn.dataset.linkId);
        if (entry) this.openVisualLinkPopup(null, entry);
      });
    });
    container.querySelectorAll('.vl-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('هل تريد حذف هذا الرابط البصري نهائياً؟')) {
          this.deleteVisualLink(btn.dataset.linkId);
        }
      });
    });
    container.querySelectorAll('.vl-toggle-arrow').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.linkId;
        if (this.hiddenLinkArrows[id]) delete this.hiddenLinkArrows[id];
        else this.hiddenLinkArrows[id] = true;
        this.renderVisualLinksDashboard();
      });
    });
    container.querySelectorAll('.vl-dash-flow').forEach(flow => {
      flow.addEventListener('click', (e) => {
        e.stopPropagation();
        const entry = this.parseVisualLinks().find(x => x.id === flow.dataset.linkId);
        if (!entry) return;
        delete this.hiddenLinkArrows[entry.id];
        const sEl = document.getElementById(entry.sourceId);
        const tEl = document.getElementById(entry.targetId);
        if (tEl) tEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (sEl) {
          this.app.selectElement(sEl);
          sEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        this.updateVisualLinkArrows();
      });
    });

    this.updateVisualLinkArrows();
  }

  // Redraws the SVG arrows. Runs on selection changes, scroll, resize,
  // Safe Move drags, spacing drags and after undo/redo (hooked from
  // app.updateHighlighter and the dashboard renders) so arrows track elements.
  updateVisualLinkArrows() {
    const svg = document.getElementById('visual-links-overlay');
    if (!svg) return;

    // Cheap parse cache — customJS is rescanned only when it actually changed
    if (this._vlCacheJs !== this.customJS) {
      this._vlCacheJs = this.customJS;
      this._vlCacheLinks = this.parseVisualLinks();
    }
    const links = this._vlCacheLinks || [];

    svg.querySelectorAll('.vl-arrow').forEach(n => n.remove());
    if (document.body.classList.contains('preview-mode-active')) return;

    const toDraw = links.filter(l => !this.hiddenLinkArrows[l.id]);
    if (this.previewLinkArrow) {
      toDraw.push({ id: '__preview', sourceId: this.previewLinkArrow.sourceId, targetId: this.previewLinkArrow.targetId, preview: true });
    }
    if (toDraw.length === 0) return;

    const container = svg.parentElement;
    const cRect = container.getBoundingClientRect();
    const ns = 'http://www.w3.org/2000/svg';

    toDraw.forEach(l => {
      const s = document.getElementById(l.sourceId);
      const t = document.getElementById(l.targetId);
      if (!s || !t) return;
      const sR = s.getBoundingClientRect();
      const tR = t.getBoundingClientRect();
      if (sR.width === 0 && sR.height === 0) return;

      const x1 = sR.left + sR.width / 2 - cRect.left;
      const y1 = sR.top + sR.height / 2 - cRect.top;
      const x2 = tR.left + tR.width / 2 - cRect.left;
      const y2 = tR.top + tR.height / 2 - cRect.top;

      const lift = Math.max(26, Math.min(80, Math.abs(x2 - x1) * 0.2 + Math.abs(y2 - y1) * 0.2));
      const mx = (x1 + x2) / 2;
      const my = Math.min(y1, y2) - lift;

      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
      path.setAttribute('class', 'vl-arrow' + (l.preview ? ' vl-arrow-preview' : ''));
      path.setAttribute('marker-end', 'url(#vl-arrowhead)');
      if (!l.preview) {
        path.addEventListener('click', (e) => {
          e.stopPropagation();
          const entry = this.parseVisualLinks().find(x => x.id === l.id);
          if (entry) this.openVisualLinkPopup(null, entry);
        });
      }
      svg.appendChild(path);
    });
  }

  /* ==== Lightweight syntax highlighting for code previews ==== */

  highlightJS(code) {
    const escaped = String(code === undefined || code === null ? '' : code)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const pattern = /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(const|let|var|if|else|function|return|new|for|while|true|false|null|document|window)\b|\b(\d+(?:\.\d+)?)\b|\b(addEventListener|getElementById|querySelector|querySelectorAll|setTimeout|setInterval|clearInterval|alert|confirm|prompt|log|animate|scrollIntoView|scrollTo|setItem|getItem|removeItem)\b/g;

    return escaped.replace(pattern, (m, com, str, kw, num, fn) => {
      if (com) return `<span class="tok-comment">${com}</span>`;
      if (str) return `<span class="tok-string">${str}</span>`;
      if (kw) return `<span class="tok-keyword">${kw}</span>`;
      if (num) return `<span class="tok-number">${num}</span>`;
      if (fn) return `<span class="tok-fn">${fn}</span>`;
      return m;
    });
  }

  renderCodePreview(code) {
    const highlighted = this.highlightJS(code);
    return highlighted
      .split('\n')
      .map(line => `<span class="code-line">${line || ' '}</span>`)
      .join('');
  }

  /* ==== Code editor line numbers + insert flash ==== */

  setupLineNumbers() {
    this.gutter = document.getElementById('editor-line-numbers');
    this.lastLineCount = 0;
    if (!this.gutter) return;

    this.textarea.addEventListener('input', () => this.updateLineNumbers());
    this.textarea.addEventListener('scroll', () => {
      if (this.gutter) this.gutter.scrollTop = this.textarea.scrollTop;
    });
    this.updateLineNumbers();
  }

  updateLineNumbers() {
    if (!this.gutter) return;
    const count = (this.textarea.value.match(/\n/g) || []).length + 1;
    if (count !== this.lastLineCount) {
      this.lastLineCount = count;
      let out = '';
      for (let i = 1; i <= count; i++) out += i + '\n';
      this.gutter.textContent = out;
    }
    this.gutter.scrollTop = this.textarea.scrollTop;
  }

  flashEditorShell() {
    const shell = this.textarea.closest('.code-editor-shell');
    if (!shell) return;
    shell.classList.remove('code-flash');
    void shell.offsetWidth;
    shell.classList.add('code-flash');
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
    this.flashTimeout = setTimeout(() => shell.classList.remove('code-flash'), 1100);
  }

  revealEditorRange(start, end) {
    this.textarea.focus();
    // Collapse the caret to the end of the inserted code. Selecting the whole
    // range would make the next keystroke (or the next insert-at-cursor)
    // REPLACE the freshly inserted block — the flash effect highlights instead.
    const caret = Math.max(0, end);
    try {
      this.textarea.setSelectionRange(caret, caret);
    } catch { /* caret placement is cosmetic only */ }

    const totalLines = Math.max(1, this.lastLineCount || 1);
    const lineOfStart = this.textarea.value.substring(0, Math.max(0, start)).split('\n').length;
    const ratio = Math.max(0, (lineOfStart - 2) / totalLines);
    this.textarea.scrollTop = ratio * this.textarea.scrollHeight;
    if (this.gutter) this.gutter.scrollTop = this.textarea.scrollTop;

    this.lastSelectionStart = caret;
    this.lastSelectionEnd = caret;
    this.flashEditorShell();
  }

  setupFormatter() {
    const btn = document.getElementById('format-code-btn');
    if (btn) {
      btn.addEventListener('click', () => this.formatCurrentCode());
    }
  }

  formatCurrentCode() {
    const val = this.textarea.value.trim();
    if (!val) return;

    let formatted = '';
    if (this.currentLanguage === 'html') {
      formatted = this.formatHTML(val);
    } else if (this.currentLanguage === 'css') {
      formatted = this.formatCSS(val);
    } else if (this.currentLanguage === 'js') {
      formatted = this.formatJS(val);
    }

    if (formatted) {
      this.textarea.value = formatted;
      this.syncEditorToCanvas();
      this.updateLineNumbers();
      this.showToastNotice('تم تنسيق وترتيب الكود!');
    }
  }

  /* مولّد معرفات محصّن ضد التصادم: 4 خانات عشوائية كانت تعطي ~9000 قيمة فقط،
     فصفحة بمئة عنصر تصادم فيها محتمل بنسبة كبيرة ويكسر getElementById. */
  generateUniqueElementId(tagName) {
    const tag = String(tagName || 'el').toLowerCase();
    let candidate;
    do {
      candidate = `${tag}-${Math.random().toString(36).slice(2, 7)}${Date.now().toString(36).slice(-3)}`;
    } while (document.getElementById(candidate));
    return candidate;
  }

  formatCSS(css) {
    /* حماية النصوص والتعليقات وurl(...) قبل التقسيم: المقسّم كان يمزّق
       url(data:...;base64,...) و content: ";" ويكسر CSS المستخدم. */
    const guards = [];
    const protectedCss = String(css || '').replace(
      /(\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*')|("(?:[^"\\\n]|\\.)*")|(url\((?:[^()\\]|\\.)*\))/gi,
      (match) => {
        guards.push(match);
        return '' + (guards.length - 1) + '';
      }
    );

    let formatted = '';
    let depth = 0;
    let parts = protectedCss.split(/({|}|;)/g);
    
    parts.forEach(part => {
      let trimmed = part.trim();
      if (!trimmed) return;
      
      if (trimmed === '{') {
        formatted = formatted.trim() + ' {\n';
        depth += 2;
      } else if (trimmed === '}') {
        depth = Math.max(0, depth - 2);
        formatted = formatted.trim() + '\n' + ' '.repeat(depth) + '}\n';
      } else if (trimmed === ';') {
        formatted = formatted.trim() + ';\n';
      } else {
        formatted += ' '.repeat(depth) + trimmed;
      }
    });
    /* إعادة المقاطع المحمية كما كانت بالضبط */
    // The control-character sentinel cannot collide with authored CSS.
    // eslint-disable-next-line no-control-regex
    return formatted.trim().replace(/(\d+)/g, (match, index) => guards[Number(index)] !== undefined ? guards[Number(index)] : match);
  }

  formatJS(js) {
    // Protect strings and comments first: the brace/semicolon splitter used to
    // break literals like "a;b" or "x{y}" and corrupt the user's code.
    const guards = [];
    const protectedCode = js.replace(
      /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*')|("(?:[^"\\\n]|\\.)*")|(`(?:[^`\\]|\\.)*`)/g,
      (m) => {
        guards.push(m);
        return '\u0001' + (guards.length - 1) + '\u0001';
      }
    );

    let formatted = '';
    let depth = 0;
    let parts = protectedCode.split(/({|}|;)/g);

    parts.forEach(part => {
      let trimmed = part.trim();
      if (!trimmed) return;

      if (trimmed === '{') {
        formatted = formatted.trim() + ' {\n';
        depth += 2;
      } else if (trimmed === '}') {
        depth = Math.max(0, depth - 2);
        formatted = formatted.trim() + '\n' + ' '.repeat(depth) + '}\n';
      } else if (trimmed === ';') {
        formatted = formatted.trim() + ';\n';
      } else {
        formatted += ' '.repeat(depth) + trimmed;
      }
    });

    // The control-character sentinel cannot collide with authored JavaScript.
    // eslint-disable-next-line no-control-regex
    return formatted.replace(/\u0001(\d+)\u0001/g, (m, i) => guards[parseInt(i, 10)]).trim();
  }

  /* كانت بتعرض دايماً ✓ "تم إنجاز:" بالأخضر — حتى لرسائل الخطأ، فالخطأ كان
     يظهر بزيّ النجاح. النوع الافتراضي 'success' فكل النداءات القديمة زي ما هي. */
  showToastNotice(blockTitle, kind = 'success') {
    document.querySelectorAll('.toast-notice').forEach(el => el.remove());

    const toast = document.createElement('div');
    const type = ['success', 'error', 'warning'].includes(kind) ? kind : 'success';
    toast.className = `toast-notice toast-${type}`;
    const safeTitle = String(blockTitle === undefined || blockTitle === null ? '' : blockTitle)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const presets = {
      success: { icon: 'fa-check-circle', body: `تم إنجاز: <strong>[${safeTitle}]</strong>!`, ms: 1500 },
      error: { icon: 'fa-circle-exclamation', body: `<strong>${safeTitle}</strong>`, ms: 3500 },
      warning: { icon: 'fa-triangle-exclamation', body: `<strong>${safeTitle}</strong>`, ms: 3000 }
    };
    const preset = presets[type];
    toast.innerHTML = `<i class="fas ${preset.icon}"></i> ${preset.body}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, preset.ms);
  }

  getCleanCanvasHTML() {
    const canvas = document.getElementById('builder-canvas');
    const clone = canvas.cloneNode(true);

    const cleanNode = (node) => {
      // Presentation belongs to the CSS tab. syncAll migrates declarations to
      // managed rules; this defensive removal keeps the HTML view canonical.
      node.removeAttribute('style');
      node.removeAttribute('draggable');
      if (node.classList) {
        node.classList.remove('selected-element');
        node.classList.remove('drag-hover-container');
        node.classList.remove('hovered-canvas-element');
        node.classList.remove('move-mode-active');
        node.classList.remove('dom-tree-hover-preview');
        if (node.classList.length === 0) {
          node.removeAttribute('class');
        }
      }
      for (let i = 0; i < node.children.length; i++) {
        cleanNode(node.children[i]);
      }
    };

    cleanNode(clone);
    return this.formatHTML(clone.innerHTML);
  }

  // Deep-clean canvas HTML for export / final preview.
  // Unlike getCleanCanvasHTML (HTML tab), this also strips editor data
  // attributes; data-move-x/y must stay in the HTML tab so Safe Move
  // survives the editor-to-canvas round trip.
  getExportCleanHTML() {
    const canvas = document.getElementById('builder-canvas');
    const clone = canvas.cloneNode(true);

    // Defensive: drop any editor tooling that might have leaked into the canvas
    const editorOnlySelectors = [
      '.canvas-element-overlay', '.spacing-handle', '.overlay-dot', '.overlay-badge',
      '.floating-action-bubble', '.highlighter-layers-dropdown', '.spacing-inline-input',
      '.spacing-tooltip', '.drag-insert-indicator', '.toast-notice', '#toast-container',
      '#element-highlighter', '#visual-links-overlay', '.vl-popup-overlay', '.vl-arrow'
    ];
    editorOnlySelectors.forEach(sel => {
      clone.querySelectorAll(sel).forEach(node => node.remove());
    });

    const editorClasses = [
      'selected-element', 'hovered-canvas-element', 'drag-hover-container',
      'canvas-picker-target', 'move-mode-active', 'shake-reject'
    ];
    const editorAttributes = [
      'data-move-x', 'data-move-y', 'data-base-transform',
      'data-editor-id', 'data-internal', 'draggable'
    ];

    const cleanNode = (node) => {
      if (node.classList) {
        editorClasses.forEach(cls => node.classList.remove(cls));
        if (node.classList.length === 0) {
          node.removeAttribute('class');
        }
      }
      editorAttributes.forEach(attr => node.removeAttribute(attr));
      node.removeAttribute('style');
      for (let i = 0; i < node.children.length; i++) {
        cleanNode(node.children[i]);
      }
    };

    cleanNode(clone);
    return this.formatHTML(clone.innerHTML);
  }

  formatHTML(html) {
    let formatted = '';
    let reg = /(<[^>]+>)/g;
    let parts = html.split(reg);
    let pad = 0;
    
    parts.forEach(part => {
      if (!part.trim()) return;
      
      if (part.match(/^<\/\w/)) {
        pad -= 2;
      }
      formatted += ' '.repeat(Math.max(0, pad)) + part.trim() + '\n';
      if (part.match(/^<\w[^>]*[^/]>$/) && !part.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/)) {
        pad += 2;
      }
    });
    
    return formatted.trim();
  }

  setupInteractiveLinker() {
    this.linkerPanel = document.getElementById('js-interactive-linker-panel');
    this.editingInteractionId = null;
    this.targetElementType = 'same';
    this.updateInteractiveLinker();
  }

getAllCanvasElements() {
    const canvas = document.getElementById('builder-canvas');
    if (!canvas) return [];
    const all = canvas.querySelectorAll('*');
    return Array.from(all).map(el => {
      const tagName = el.tagName.toLowerCase();
      const id = el.id || '';
      const classes = el.className ? `.${el.className.replace('selected-element', '').trim().split(/\s+/)[0]}` : '';
      let cleanClasses = classes === '.' ? '' : classes;
      
      const dbItem = (typeof HTML_ELEMENTS_DB !== 'undefined') ? HTML_ELEMENTS_DB.find(x => x.tag === tagName) : null;
      const labelAr = dbItem ? dbItem.labelAr : tagName;
      
      return {
        element: el,
        id: id,
        tag: tagName,
        label: `${labelAr} <${tagName}${id ? '#' + id : ''}${cleanClasses}>`
      };
    });
  }

  updateInteractiveLinker() {
    if (!this.linkerPanel) return;
    
    const el = this.app.selectedElement;
    
    let activeInteraction = null;
    if (this.editingInteractionId) {
      const allInteractions = this.parseInteractions();
      activeInteraction = allInteractions.find(i => i.id === this.editingInteractionId);
    }
    
    if (!el && !activeInteraction) {
      this.linkerPanel.innerHTML = `
        <div class="js-linker-empty">
          <i class="fas fa-mouse-pointer"></i>
          <span style="font-size: 11px; font-weight: bold; color: var(--text-main);">لوحة ربط العناصر التفاعلية</span>
          <span style="font-size: 9px; color: var(--text-muted); line-height: 1.4;">اختر عنصراً من شاشة المعاينة لبدء بناء الأحداث التفاعلية بصرياً خطوة بخطوة.</span>
        </div>
        <div id="js-global-dashboard" class="js-dashboard-container"></div>
      `;
      this.renderGlobalInteractionsDashboard();
      this.renderBlocksDashboard();
      this.renderVisualLinksDashboard();
      return;
    }
    
    let sourceEl = el;
    if (!sourceEl && activeInteraction) {
      sourceEl = document.getElementById(activeInteraction.sourceId);
    }
    
    if (!sourceEl) {
      this.editingInteractionId = null;
      this.updateInteractiveLinker();
      return;
    }
    
    if (!sourceEl.id) {
      const tag = sourceEl.tagName.toLowerCase();
      sourceEl.id = this.generateUniqueElementId(tag);
      this.app.syncAll();
    }
    
    const sourceId = sourceEl.id;
    const sourceTag = sourceEl.tagName.toLowerCase();
    const suggestedSourceVar = this.getElementVariableName(sourceEl) || `${sourceTag}_${sourceId.split('-')[1] || Math.floor(Math.random()*1000)}`;
    
    const eventVal = activeInteraction ? activeInteraction.event : 'click';
    const actionVal = activeInteraction ? activeInteraction.action : 'custom';
    const paramVal = activeInteraction ? activeInteraction.param : '';
    /* param يعود خامًا من تعليق "// PARAM:" في الكود، وid/tag يأتيان من HTML قابل للتحرير.
       بلا تهريب كانت قيمة مثل: red" onmouseover="..." تُنفَّذ عند إعادة فتح التفاعل للتعديل.
       نفس escAttr المستخدَم في openBlockConfig و renderVlFields. */
    const escAttr = (s) => String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const targetValType = activeInteraction ? (activeInteraction.targetType || (activeInteraction.targetId === sourceId ? 'same' : 'other')) : this.targetElementType;
    
    const canvasElements = this.getAllCanvasElements();
    
    this.linkerPanel.innerHTML = `
      <div class="js-linker-card">
        <div class="js-linker-header">
          <span class="js-magic-icon-wrapper">
            <i class="fas fa-magic"></i>
          </span>
          <span class="js-linker-title">
            ${activeInteraction ? 'تعديل التفاعل البصري' : 'بناء تفاعل جديد'}
          </span>
          <span class="js-linker-el-badge">&lt;${escAttr(sourceTag)}#${escAttr(sourceId)}&gt;</span>
        </div>

        <div class="js-linker-field-group" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 8px; border-radius: var(--radius-sm); gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: bold; color: var(--text-muted);">اسم المتغير المقترح:</span>
            <span style="font-size: 10px; font-family: monospace; color: var(--accent-orange); font-weight: bold;">const ${suggestedSourceVar}</span>
          </div>
          <button id="linker-save-var-only-btn" class="btn btn-secondary" style="height: 22px; font-size: 9px; width: 100%;">
            <i class="fas fa-save"></i> إنشاء/حفظ متغير للعنصر
          </button>
        </div>

        <div class="js-step-container">
          <div class="js-step-header">
            <span class="js-step-badge">1</span>
            <span class="js-step-title">1. اختر الحدث (Event)</span>
          </div>
          <div class="js-step-content">
            <select id="linker-event-select" class="js-linker-select">
              <option value="click" ${eventVal === 'click' ? 'selected' : ''}>عند النقر (click)</option>
              <option value="mouseenter" ${eventVal === 'mouseenter' ? 'selected' : ''}>عند مرور الفأرة (hover)</option>
              <option value="mouseleave" ${eventVal === 'mouseleave' ? 'selected' : ''}>عند خروج الفأرة (mouseleave)</option>
              <option value="input" ${eventVal === 'input' ? 'selected' : ''}>عند الكتابة/إدخال قيمة (input)</option>
              <option value="change" ${eventVal === 'change' ? 'selected' : ''}>عند تغيير القيمة (change)</option>
              <option value="submit" ${eventVal === 'submit' ? 'selected' : ''}>عند إرسال النموذج (submit)</option>
              <option value="focus" ${eventVal === 'focus' ? 'selected' : ''}>عند التركيز (focus)</option>
              <option value="blur" ${eventVal === 'blur' ? 'selected' : ''}>عند فقد التركيز (blur)</option>
            </select>
          </div>
        </div>

        <div class="js-step-container">
          <div class="js-step-header">
            <span class="js-step-badge">2</span>
            <span class="js-step-title">2. اختر ماذا سيحدث (Action)</span>
          </div>
          <div class="js-step-content">
            <select id="linker-action-select" class="js-linker-select">
              <option value="custom" ${actionVal === 'custom' ? 'selected' : ''}>منطق مخصص (كتابة كود)</option>
              <option value="hide" ${actionVal === 'hide' ? 'selected' : ''}>إخفاء (hide)</option>
              <option value="show" ${actionVal === 'show' ? 'selected' : ''}>إظهار (show)</option>
              <option value="text" ${actionVal === 'text' ? 'selected' : ''}>تغيير النص الداخلي (innerText)</option>
              <option value="color" ${actionVal === 'color' ? 'selected' : ''}>تغيير لون النص (style.color)</option>
              <option value="addclass" ${actionVal === 'addclass' ? 'selected' : ''}>إضافة كلاس (classList.add)</option>
              <option value="removeclass" ${actionVal === 'removeclass' ? 'selected' : ''}>حذف كلاس (classList.remove)</option>
              <option value="toggleclass" ${actionVal === 'toggleclass' ? 'selected' : ''}>تبديل كلاس (classList.toggle)</option>
              <option value="alert" ${actionVal === 'alert' ? 'selected' : ''}>عرض رسالة تنبيه (alert)</option>
            </select>
            
            <div id="linker-param-group" style="display: none; flex-direction: column; gap: 4px;">
              <span class="js-linker-label" id="linker-param-label">القيمة الإضافية:</span>
              <input type="text" id="linker-action-param" class="js-linker-input" value="${escAttr(paramVal)}" placeholder="اكتب القيمة هنا..." style="direction: rtl; text-align: right;">
            </div>
          </div>
        </div>

        <div class="js-step-container">
          <div class="js-step-header">
            <span class="js-step-badge">3</span>
            <span class="js-step-title">3. اختر العنصر الذي سيتأثر (Target)</span>
          </div>
          <div class="js-step-content">
            <select id="linker-target-type-select" class="js-linker-select">
              <option value="same" ${targetValType === 'same' ? 'selected' : ''}>نفس العنصر المختار</option>
              <option value="parent" ${targetValType === 'parent' ? 'selected' : ''}>العنصر الأب المباشر</option>
              <option value="child" ${targetValType === 'child' ? 'selected' : ''}>أول عنصر ابن</option>
              <option value="other" ${targetValType === 'other' ? 'selected' : ''}>عنصر آخر في الصفحة (من القائمة)</option>
              <option value="pick" ${targetValType === 'pick' ? 'selected' : ''}>اختيار عنصر من المعاينة بالضغط عليه 🎯</option>
            </select>
            
            <div id="linker-target-select-group" style="display: ${(targetValType === 'other' || targetValType === 'pick') ? 'flex' : 'none'}; flex-direction: column; gap: 4px; margin-top: 6px;">
              <span class="js-linker-label" id="linker-target-select-label">العنصر المستهدف المحدد:</span>
              <select id="linker-target-select" class="js-linker-select" style="font-family: monospace; direction: ltr; text-align: left;">
              </select>
              <button type="button" id="linker-target-picker-btn" class="btn btn-secondary" style="height: 24px; font-size: 9px; width: 100%; display: ${targetValType === 'pick' ? 'block' : 'none'}; margin-top: 4px;">
                <i class="fas fa-crosshair"></i> ابدأ تحديد العنصر من المعاينة
              </button>
            </div>
          </div>
        </div>

        <div class="js-step-container">
          <div class="js-step-header">
            <span class="js-step-badge">4</span>
            <span class="js-step-title">4. راجع الكود الناتج</span>
          </div>
          <div class="js-step-content">
            <pre id="linker-code-preview" class="js-linker-code-preview js-code-preview" dir="ltr"></pre>
          </div>
        </div>

        <div class="js-step-container" style="background-color: transparent; border: none; padding: 0;">
          <div style="display: flex; gap: 6px;">
            <button id="linker-save-btn" class="btn btn-primary" style="flex: 2; height: 32px; font-weight: bold;">
              <i class="fas fa-save"></i> ${activeInteraction ? 'تحديث التفاعل' : '5. احفظ التفاعل'}
            </button>
            ${activeInteraction ? `
              <button id="linker-cancel-edit-btn" class="btn btn-secondary" style="flex: 1; height: 32px;">
                إلغاء
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <div id="js-global-dashboard" class="js-dashboard-container"></div>
    `;
    
    const saveVarOnlyBtn = document.getElementById('linker-save-var-only-btn');
    const eventSelect = document.getElementById('linker-event-select');
    const actionSelect = document.getElementById('linker-action-select');
    const actionParamInput = document.getElementById('linker-action-param');
    const targetTypeSelect = document.getElementById('linker-target-type-select');
    const targetSelectGroup = document.getElementById('linker-target-select-group');
    const targetSelect = document.getElementById('linker-target-select');
    const targetPickerBtn = document.getElementById('linker-target-picker-btn');
    const codePreview = document.getElementById('linker-code-preview');
    const saveBtn = document.getElementById('linker-save-btn');
    const cancelEditBtn = document.getElementById('linker-cancel-edit-btn');
    
    canvasElements.forEach(item => {
      if (item.id === 'builder-canvas') return;
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.label;
      if (!item.id) {
        // Elements without an id silently fell back to the source element.
        // Disable them and point the user to picking mode (assigns an id).
        opt.disabled = true;
        opt.textContent = item.label + ' — بدون معرف (استخدم 🎯 الاختيار من المعاينة)';
      }
      if (activeInteraction && item.id === activeInteraction.targetId) {
        opt.selected = true;
      }
      targetSelect.appendChild(opt);
    });
    
    saveVarOnlyBtn.addEventListener('click', () => {
      const decl = `const ${suggestedSourceVar} = document.getElementById('${sourceId}');`;
      if (this.customJS.includes(decl) || this.customJS.includes(`const ${suggestedSourceVar} =`)) {
        this.showToastNotice('المتغير موجود بالفعل!');
        return;
      }
      this.customJS += `\n// تعريف متغير لـ: ${sourceTag}#${sourceId}\n${decl}\n`;
      this.textarea.value = this.customJS;
      this.app.saveProgress();
      this.app.history.saveState('Save JS Variable');
      this.formatCurrentCode();
      this.scanAndRenderVariables();
      this.updateInteractiveLinker();
      this.showToastNotice(`تم إنشاء المتغير const ${suggestedSourceVar}`);
    });
    
    targetTypeSelect.addEventListener('change', () => {
      const type = targetTypeSelect.value;
      this.targetElementType = type;
      
      if (type === 'other') {
        targetSelectGroup.style.display = 'flex';
        targetPickerBtn.style.display = 'none';
      } else if (type === 'pick') {
        targetSelectGroup.style.display = 'flex';
        targetPickerBtn.style.display = 'block';
      } else {
        targetSelectGroup.style.display = 'none';
        targetPickerBtn.style.display = 'none';
      }
      
      updatePreview();
    });
    
    if (targetPickerBtn) {
      targetPickerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isPickingTarget = true;
        this.pickingContext = 'linker';
        this.showToastNotice('وضع تحديد الهدف: اضغط على أي عنصر في المعاينة لتحديده كهدف للتفاعل...');
      });
    }
    
    const updatePreview = () => {
      const eventName = eventSelect.value;
      const actionType = actionSelect.value;
      const actionParam = actionParamInput.value;
      const targetType = targetTypeSelect.value;
      
      const paramGroup = document.getElementById('linker-param-group');
      const paramLabel = document.getElementById('linker-param-label');
      
      if (actionType === 'text') {
        paramGroup.style.display = 'flex';
        paramLabel.textContent = 'النص الجديد:';
        actionParamInput.placeholder = 'أدخل النص الجديد هنا...';
      } else if (actionType === 'color') {
        paramGroup.style.display = 'flex';
        paramLabel.textContent = 'اللون (مثال: red أو #ff0000):';
        actionParamInput.placeholder = '#f59e0b';
      } else if (actionType === 'addclass' || actionType === 'removeclass' || actionType === 'toggleclass') {
        paramGroup.style.display = 'flex';
        paramLabel.textContent = 'اسم الفئة (CSS Class):';
        actionParamInput.placeholder = 'active-card';
      } else if (actionType === 'alert') {
        paramGroup.style.display = 'flex';
        paramLabel.textContent = 'محتوى التنبيه (Alert):';
        actionParamInput.placeholder = 'أدخل رسالة التنبيه هنا...';
      } else {
        paramGroup.style.display = 'none';
      }
      
      let targetId;
      let targetTag;
      
      if (targetType === 'same') {
        targetId = sourceId;
        targetTag = sourceTag;
      } else if (targetType === 'parent') {
        const parentEl = sourceEl.parentElement;
        if (parentEl && parentEl !== this.app.canvas) {
          if (!parentEl.id) {
            parentEl.id = `${parentEl.tagName.toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            this.app.syncAll();
          }
          targetId = parentEl.id;
          targetTag = parentEl.tagName.toLowerCase();
        } else {
          targetId = sourceId;
          targetTag = sourceTag;
        }
      } else if (targetType === 'child') {
        const childEl = sourceEl.firstElementChild;
        if (childEl) {
          if (!childEl.id) {
            childEl.id = `${childEl.tagName.toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            this.app.syncAll();
          }
          targetId = childEl.id;
          targetTag = childEl.tagName.toLowerCase();
        } else {
          targetId = sourceId;
          targetTag = sourceTag;
        }
      } else { // other or pick
        targetId = targetSelect.value || sourceId;
        const targetEl = document.getElementById(targetId);
        targetTag = targetEl ? targetEl.tagName.toLowerCase() : 'element';
      }
      
      const sourceVar = suggestedSourceVar;
      const targetVar = targetId === sourceId ? sourceVar : (this.getElementVariableName(document.getElementById(targetId)) || `${targetTag}_${targetId.split('-')[1] || Math.floor(Math.random()*1000)}`);
      
      const interactionId = activeInteraction ? activeInteraction.id : `interaction-${Math.floor(1000 + Math.random()*9000)}`;
      
      const previewCode = this.generatePreviewCode(
        interactionId,
        sourceId,
        sourceVar,
        targetId,
        targetVar,
        eventName,
        actionType,
        actionParam,
        targetType
      );

      codePreview.innerHTML = this.renderCodePreview(previewCode);
    };
    
    eventSelect.addEventListener('change', updatePreview);
    actionSelect.addEventListener('change', updatePreview);
    actionParamInput.addEventListener('input', updatePreview);
    targetSelect.addEventListener('change', updatePreview);
    
    updatePreview();
    
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        this.editingInteractionId = null;
        this.updateInteractiveLinker();
      });
    }
    
    saveBtn.addEventListener('click', () => {
      const eventName = eventSelect.value;
      const actionType = actionSelect.value;
      const actionParam = actionParamInput.value;
      const targetType = targetTypeSelect.value;
      
      let targetId = '';
      let targetTag = '';
      if (targetType === 'same') {
        targetId = sourceId;
        targetTag = sourceTag;
      } else if (targetType === 'parent') {
        const parentEl = sourceEl.parentElement;
        if (parentEl && parentEl !== this.app.canvas) {
          targetId = parentEl.id;
          targetTag = parentEl.tagName.toLowerCase();
        }
      } else if (targetType === 'child') {
        const childEl = sourceEl.firstElementChild;
        if (childEl) {
          targetId = childEl.id;
          targetTag = childEl.tagName.toLowerCase();
        }
      } else {
        targetId = targetSelect.value || sourceId;
        const targetEl = document.getElementById(targetId);
        targetTag = targetEl ? targetEl.tagName.toLowerCase() : 'element';
      }
      
      const sourceVar = suggestedSourceVar;
      const targetVar = targetId === sourceId ? sourceVar : (this.getElementVariableName(document.getElementById(targetId)) || `${targetTag}_${targetId.split('-')[1] || Math.floor(Math.random()*1000)}`);
      
      const interactionId = activeInteraction ? activeInteraction.id : `interaction-${Math.floor(1000 + Math.random()*9000)}`;
      
      const newCodeBlock = this.generatePreviewCode(
        interactionId,
        sourceId,
        sourceVar,
        targetId,
        targetVar,
        eventName,
        actionType,
        actionParam,
        targetType
      );
      
      if (activeInteraction) {
        const lines = this.customJS.split(/\r?\n/);
        const match = this.parseInteractions().find(i => i.id === activeInteraction.id);
        if (match) {
          lines.splice(match.startIndex, match.endIndex - match.startIndex + 1);
          this.customJS = lines.join('\n');
        }
      }
      
      this.customJS += `\n${newCodeBlock}\n`;
      this.textarea.value = this.customJS;
      this.app.saveProgress();
      this.app.history.saveState('Save JS Interaction');
      this.formatCurrentCode();
      
      this.editingInteractionId = null;
      this.updateInteractiveLinker();
      this.scanAndRenderVariables();
      this.showToastNotice(activeInteraction ? 'تم تحديث التفاعل البصري!' : 'تم حفظ التفاعل بنجاح!');
    });
    
    this.renderGlobalInteractionsDashboard();
    this.renderBlocksDashboard();
    this.renderVisualLinksDashboard();
  }

  handleTargetPicked(target) {
    if (!target) return;
    if (!target.id) {
      const tag = target.tagName.toLowerCase();
      target.id = `${tag}-${Math.floor(1000 + Math.random() * 9000)}`;
      this.app.syncAll();
    }
    this.isPickingTarget = false;

    // Route the picked element to the Visual Link flow when it initiated the pick
    if (this.pickingContext === 'visual-link') {
      this.pickingContext = null;
      const sourceId = this.pendingVisualLinkSourceId;
      this.pendingVisualLinkSourceId = null;
      if (sourceId) {
        this.openVisualLinkPopup({ sourceId: sourceId, targetId: target.id });
      }
      return;
    }

    // Route the picked element to the open Block Config panel when it initiated the pick
    if (this.pickingContext === 'block') {
      this.pickingContext = null;
      const blockTargetSel = document.getElementById('block-target-select');
      if (blockTargetSel) {
        let exists = false;
        for (let i = 0; i < blockTargetSel.options.length; i++) {
          if (blockTargetSel.options[i].value === `id:${target.id}`) {
            blockTargetSel.selectedIndex = i;
            exists = true;
            break;
          }
        }
        if (!exists) {
          const opt = document.createElement('option');
          opt.value = `id:${target.id}`;
          opt.textContent = `${target.tagName.toLowerCase()}#${target.id}`;
          opt.selected = true;
          blockTargetSel.appendChild(opt);
        }
      }
      this.showToastNotice(`تم تحديد العنصر المستهدف: <${target.tagName.toLowerCase()}#${target.id}>`);
      this.updateBlockPreview();
      return;
    }
    this.pickingContext = null;

    const targetSelect = document.getElementById('linker-target-select');
    if (targetSelect) {
      let exists = false;
      for (let i = 0; i < targetSelect.options.length; i++) {
        if (targetSelect.options[i].value === target.id) {
          targetSelect.selectedIndex = i;
          exists = true;
          break;
        }
      }
      if (!exists) {
        const opt = document.createElement('option');
        opt.value = target.id;
        opt.textContent = `${target.tagName.toLowerCase()}#${target.id}`;
        opt.selected = true;
        targetSelect.appendChild(opt);
      }
    }
    
    this.showToastNotice(`تم تحديد العنصر المستهدف: <${target.tagName.toLowerCase()}#${target.id}>`);
    
    const eventSelect = document.getElementById('linker-event-select');
    if (eventSelect) {
      eventSelect.dispatchEvent(new Event('change'));
    }
  }

  generatePreviewCode(id, sourceId, sourceVar, targetId, targetVar, eventName, actionType, actionParam, targetType) {
    let declarations = '';
    // Strip only THIS interaction's existing block before checking declarations.
    // Stripping ALL interaction blocks made a second interaction on the same
    // element redeclare the const -> SyntaxError in the exported script.
    const ownBlockRegex = new RegExp(
      '//\\s*OSOOS_INTERACTION_START id="' + id + '"[\\s\\S]*?//\\s*OSOOS_INTERACTION_END id="' + id + '"[^\\n]*',
      'g'
    );
    const cleanJSForCheck = this.customJS.replace(ownBlockRegex, '');
    
    if (!cleanJSForCheck.includes(`const ${sourceVar} =`)) {
      declarations += `const ${sourceVar} = document.getElementById('${sourceId}');\n`;
    }

    let actualTargetVar = targetVar;
    if (targetType === 'parent') {
      actualTargetVar = 'parentEl';
      declarations += `const ${actualTargetVar} = ${sourceVar}.parentElement;\n`;
    } else if (targetType === 'child') {
      actualTargetVar = 'childEl';
      declarations += `const ${actualTargetVar} = ${sourceVar}.firstElementChild;\n`;
    } else if (targetType === 'same') {
      actualTargetVar = sourceVar;
    } else {
      if (targetId && targetId !== sourceId && !cleanJSForCheck.includes(`const ${targetVar} =`)) {
        declarations += `const ${targetVar} = document.getElementById('${targetId}');\n`;
      }
    }

    let actionCode = '';
    /* قيمة المستخدم تدخل بين علامتي اقتباس في الكود المولّد — اقتباس واحد كان يكسره.
       التعريف هنا قبل switch عمدًا: كان داخل case 'color' فقط، وبقية الحالات التي
       تستدعي jsq كانت ترمي ReferenceError (TDZ) فتكسر المعاينة والحفظ بصمت. */
    const jsq = (value) => String(value === undefined || value === null ? '' : value)
      .replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n');
    switch (actionType) {
      case 'custom':
        actionCode = `  // اكتب منطقك البرمجي المخصص هنا للمستهدف ${actualTargetVar}\n  console.log("تم تفعيل الحدث!");`;
        break;
      case 'hide':
        actionCode = `  ${actualTargetVar}.style.display = 'none';`;
        break;
      case 'show':
        actionCode = `  ${actualTargetVar}.style.display = 'block';`;
        break;
      case 'shake':
        actionCode = `  ${actualTargetVar}.animate([\n    { transform: 'translateX(0)' },\n    { transform: 'translateX(-5px)' },\n    { transform: 'translateX(5px)' },\n    { transform: 'translateX(0)' }\n  ], { duration: 200 });`;
        break;
      case 'color': {
        const colorVal = actionParam || '#f59e0b';
        actionCode = `  ${actualTargetVar}.style.color = '${jsq(colorVal)}';`;
        break;
      }
      case 'text': {
        const textVal = actionParam || 'نص جديد';
        actionCode = `  ${actualTargetVar}.innerText = '${jsq(textVal)}';`;
        break;
      }
      case 'addclass': {
        const addClassVal = actionParam || 'active-card';
        actionCode = `  ${actualTargetVar}.classList.add('${jsq(addClassVal)}');`;
        break;
      }
      case 'removeclass': {
        const removeClassVal = actionParam || 'active-card';
        actionCode = `  ${actualTargetVar}.classList.remove('${jsq(removeClassVal)}');`;
        break;
      }
      case 'toggleclass': {
        const toggleClassVal = actionParam || 'active-card';
        actionCode = `  ${actualTargetVar}.classList.toggle('${jsq(toggleClassVal)}');`;
        break;
      }
      case 'alert': {
        const alertVal = actionParam || 'تنبيه!';
        actionCode = `  alert('${jsq(alertVal)}');`;
        break;
      }
    }

    return `// OSOOS_INTERACTION_START id="${id}"\n` +
           `// SOURCE_ID: ${sourceId}\n` +
           `// SOURCE_VAR: ${sourceVar}\n` +
           `// TARGET_ID: ${targetId || ''}\n` +
           `// TARGET_VAR: ${targetVar || ''}\n` +
           `// TARGET_TYPE: ${targetType}\n` +
           `// EVENT: ${eventName}\n` +
           `// ACTION: ${actionType}\n` +
           `// PARAM: ${actionParam}\n` +
           `${declarations}${sourceVar}.addEventListener('${eventName}', () => {\n${actionCode}\n});\n` +
           `// OSOOS_INTERACTION_END id="${id}"`;
  }

  parseInteractions() {
    const code = this.customJS;
    const lines = code.split(/\r?\n/);
    const interactions = [];
    let current = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('// OSOOS_INTERACTION_START')) {
        const idMatch = line.match(/id="([^"]+)"/);
        if (idMatch) {
          current = {
            id: idMatch[1],
            sourceId: '',
            sourceVar: '',
            targetId: '',
            targetVar: '',
            targetType: 'same',
            event: '',
            action: '',
            param: '',
            startIndex: i
          };
        }
      } else if (current) {
        if (line.startsWith('// SOURCE_ID:')) {
          current.sourceId = line.substring(13).trim();
        } else if (line.startsWith('// SOURCE_VAR:')) {
          current.sourceVar = line.substring(14).trim();
        } else if (line.startsWith('// TARGET_ID:')) {
          current.targetId = line.substring(13).trim();
        } else if (line.startsWith('// TARGET_VAR:')) {
          current.targetVar = line.substring(14).trim();
        } else if (line.startsWith('// TARGET_TYPE:')) {
          current.targetType = line.substring(15).trim();
        } else if (line.startsWith('// EVENT:')) {
          current.event = line.substring(9).trim();
        } else if (line.startsWith('// ACTION:')) {
          current.action = line.substring(10).trim();
        } else if (line.startsWith('// PARAM:')) {
          current.param = line.substring(9).trim();
        } else if (line.startsWith('// OSOOS_INTERACTION_END')) {
          current.endIndex = i;
          interactions.push(current);
          current = null;
        }
      }
    }
    return interactions;
  }

  renderGlobalInteractionsDashboard() {
    const dashboardContainer = document.getElementById('js-global-dashboard');
    if (!dashboardContainer) return;
    
    const interactions = this.parseInteractions();
    
    if (interactions.length === 0) {
      dashboardContainer.innerHTML = `
        <div class="js-dashboard-title">
          <i class="fas fa-link"></i>
          التفاعلات الحالية في الصفحة (0)
        </div>
        <div style="font-size: 8px; color: var(--text-muted); text-align: center; padding: 12px; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); margin-top: 6px;">
          لا توجد تفاعلات بصرية مسجلة في الصفحة حالياً.
        </div>
      `;
      return;
    }
    
    let itemsHTML = '';
    interactions.forEach(item => {
      const escapeHtml = value => String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const sourceBadge = escapeHtml(item.sourceId);
      const targetBadge = escapeHtml(item.targetId);
      const eventArabic = escapeHtml(this.getEventArabicLabel(item.event));
      const actionArabic = escapeHtml(this.getActionArabicLabel(item.action));
      
      itemsHTML += `
        <div class="js-dashboard-item">
          <div class="js-dashboard-item-row">
            <div class="js-dashboard-item-flow">
              عند <span class="js-item-event">${eventArabic}</span> لـ <span class="js-item-badge source">${sourceBadge}</span>
              ← افعل <span style="font-weight: bold; color: var(--accent-orange);">${actionArabic}</span> 
              على <span class="js-item-badge target">${targetBadge}</span>
            </div>
            <div class="js-dashboard-actions">
              <button class="js-dashboard-btn edit" data-id="${escapeHtml(item.id)}" title="تعديل هذا التفاعل">
                <i class="fas fa-edit"></i>
              </button>
              <button class="js-dashboard-btn delete" data-id="${escapeHtml(item.id)}" title="حذف هذا التفاعل من الكود">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          ${item.param ? `
            <div style="font-size: 8px; color: var(--text-muted); margin-top: 2px;">
              القيمة الإضافية: <span style="font-family: monospace; background: var(--bg-hover); padding: 1px 4px; border-radius: 2px; color: var(--text-main);">${escapeHtml(item.param)}</span>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    dashboardContainer.innerHTML = `
      <div class="js-dashboard-title" style="margin-bottom: 6px;">
        <i class="fas fa-link"></i>
        التفاعلات الحالية في الصفحة (${interactions.length})
      </div>
      <div class="js-dashboard-list">
        ${itemsHTML}
      </div>
    `;
    
    dashboardContainer.querySelectorAll('.js-dashboard-btn.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const match = interactions.find(item => item.id === id);
        if (match) {
          this.editingInteractionId = id;
          const el = document.getElementById(match.sourceId);
          if (el) {
            this.app.selectElement(el);
          } else {
            this.updateInteractiveLinker();
          }
          this.showToastNotice('تم تحميل التفاعل للتعديل');
        }
      });
    });
    
    dashboardContainer.querySelectorAll('.js-dashboard-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('هل تريد حذف هذا التفاعل البرمجي نهائياً من الكود؟')) {
          this.deleteInteraction(id);
          this.showToastNotice('تم حذف التفاعل بنجاح');
        }
      });
    });
  }

  deleteInteraction(id) {
    const lines = this.customJS.split(/\r?\n/);
    const interactions = this.parseInteractions();
    const match = interactions.find(i => i.id === id);
    if (!match) return;
    
    lines.splice(match.startIndex, match.endIndex - match.startIndex + 1);
    this.customJS = lines.join('\n');
    this.textarea.value = this.customJS;
    this.app.saveProgress();
    this.app.history.saveState('Delete JS Interaction');
    this.updateLineNumbers();
    
    if (this.editingInteractionId === id) {
      this.editingInteractionId = null;
    }
    
    this.updateInteractiveLinker();
    this.scanAndRenderVariables();
  }

  /* Update generated and hand-written references when an element identity is
     renamed. Only identifier-bearing contexts are touched; arbitrary strings
     (for example a colour equal to "#abc") remain byte-for-byte unchanged. */
  rewriteIdentityMetadata(value, options, key = '', parentKey = '', owner = null) {
    const oldId = String(options.oldId || '');
    const newId = String(options.newId || '');
    const classRenames = Array.isArray(options.classRenames) ? options.classRenames : [];
    const preserveOldClasses = new Set(options.preserveOldClasses || []);
    const idKeys = new Set([
      'sourceId', 'targetId', 'elementId', 'baseId', 'containerId', 'triggerId',
      'contentId', 'tabId', 'panelId', 'tabListId', 'panelsContainerId',
      'modalId', 'sidebarId', 'overlayId', 'openTriggerId', 'closeTriggerId'
    ]);
    const classKeys = new Set([
      'className', 'activeClass', 'openClass', 'buttonClass', 'panelClass',
      'itemClass', 'triggerClass', 'contentClass'
    ]);

    if (Array.isArray(value)) {
      return value.map(item => this.rewriteIdentityMetadata(item, options, '', key, null));
    }
    if (value && typeof value === 'object') {
      const next = {};
      Object.keys(value).forEach(childKey => {
        next[childKey] = this.rewriteIdentityMetadata(value[childKey], options, childKey, key, value);
      });
      return next;
    }
    if (typeof value !== 'string') return value;

    const descriptorId = key === 'id' && owner && (
      Object.prototype.hasOwnProperty.call(owner, 'selector') ||
      /(?:descriptor|target|source|element)/i.test(parentKey)
    );
    if (oldId && newId && value === oldId && (idKeys.has(key) || descriptorId)) return newId;

    if (/selector/i.test(key) && this.app.styleEngine) {
      return this.app.styleEngine.rewriteSelectorReferences(value, options);
    }
    if (classKeys.has(key)) {
      const rename = classRenames.find(item => item.oldClass === value);
      if (rename && !preserveOldClasses.has(rename.oldClass)) return rename.newClass;
    }
    return value;
  }

  rewriteEncodedIdentityMetadata(code, options) {
    const markerPattern = /(\/\/\s*(?:OSOOS_LOGIC_DATA|OSOOS_COMPONENT_DATA|BLOCK_PARAMS|PARAMS):\s*)([^\r\n]*)/g;
    return String(code || '').replace(markerPattern, (whole, prefix, rawPayload) => {
      const payload = rawPayload.trim();
      if (!payload) return whole;
      try {
        const decoded = JSON.parse(decodeURIComponent(payload));
        const rewritten = this.rewriteIdentityMetadata(decoded, options);
        return `${prefix}${encodeURIComponent(JSON.stringify(rewritten))}`;
      } catch {
        return whole;
      }
    });
  }

  rewriteSelectorCallsInJS(code, options) {
    if (!this.app.styleEngine) return code;
    /* Generated selectors are single-line literals. Keeping this deliberately
       narrow prevents edits inside template bodies or unrelated prose. */
    const selectorCall = /(\b(?:querySelector(?:All)?|closest|matches)\(\s*)(['"`])([^'"`\r\n]*)(\2)/g;
    return String(code || '').replace(selectorCall, (whole, prefix, quote, selector, closingQuote) => {
      const rewritten = this.app.styleEngine.rewriteSelectorReferences(selector, options);
      return `${prefix}${quote}${rewritten}${closingQuote}`;
    });
  }

  renameElementReferences(options = {}) {
    const oldId = String(options.oldId || '');
    const newId = String(options.newId || '');
    const classRenames = Array.isArray(options.classRenames) ? options.classRenames : [];
    if ((!oldId || !newId || oldId === newId) && !classRenames.length) return 0;

    const before = String(this.customJS || '');
    const definitionsBefore = JSON.stringify(this.interactionDefinitions || []);
    let code = this.rewriteEncodedIdentityMetadata(before, options);
    const escape = value => this.regexEscape(value);

    if (oldId && newId && oldId !== newId) {
      /* Structured block headers feed every dashboard/parser. */
      const headerPattern = new RegExp(`^(\\s*//\\s*(?:SOURCE_ID|TARGET_ID):\\s*)${escape(oldId)}(\\s*)$`, 'gm');
      code = code.replace(headerPattern, `$1${newId}$2`);

      /* Both generated code and normal user code commonly use this API. */
      const getByIdPattern = new RegExp(`(\\bgetElementById\\(\\s*)(['"\u0060])${escape(oldId)}\\2(\\s*\\))`, 'g');
      code = code.replace(getByIdPattern, (whole, prefix, quote, suffix) => `${prefix}${quote}${newId}${quote}${suffix}`);

      /* JSON descriptors embedded in generated executable component code. */
      const jsonIdPattern = new RegExp(`("(?:sourceId|targetId|elementId|baseId|containerId|triggerId|contentId|tabId|panelId|tabListId|panelsContainerId|modalId|sidebarId|overlayId|id)"\\s*:\\s*")${escape(oldId)}(")`, 'g');
      code = code.replace(jsonIdPattern, `$1${newId}$2`);
    }

    code = this.rewriteSelectorCallsInJS(code, options);

    /* classList references are safe to rename only when the old class stopped
       being used elsewhere. Shared identity classes may also be interaction
       state classes, so changing them globally would alter other elements. */
    const preserved = new Set(options.preserveOldClasses || []);
    classRenames.forEach(rename => {
      if (!rename.oldClass || !rename.newClass || preserved.has(rename.oldClass)) return;
      const classPattern = new RegExp(`(\\bclassList\\.(?:add|remove|toggle|contains|replace)\\(\\s*)(['"\u0060])${escape(rename.oldClass)}\\2`, 'g');
      code = code.replace(classPattern, (whole, prefix, quote) => `${prefix}${quote}${rename.newClass}${quote}`);
    });

    /* Keep open editor state and preview arrows consistent with the code. */
    ['activeVisualLink', 'previewLinkArrow', 'visualLinkDraft'].forEach(property => {
      if (!this[property] || typeof this[property] !== 'object') return;
      this[property] = this.rewriteIdentityMetadata(this[property], options);
    });
    if (Array.isArray(this.interactionDefinitions)) {
      this.interactionDefinitions = this.interactionDefinitions.map(definition =>
        this.rewriteIdentityMetadata(definition, options)
      );
    }
    if (this.pendingVisualLinkSourceId === oldId) this.pendingVisualLinkSourceId = newId;

    if (code === before && JSON.stringify(this.interactionDefinitions || []) === definitionsBefore) return 0;
    this.customJS = code;
    this._vlCacheJs = null;
    this.refreshEditorContent();
    if (typeof this.renderVisualLinksDashboard === 'function') this.renderVisualLinksDashboard();
    if (typeof this.renderGlobalInteractionsDashboard === 'function') this.renderGlobalInteractionsDashboard();
    if (typeof this.scanAndRenderVariables === 'function') this.scanAndRenderVariables();
    return 1;
  }

  getActionArabicLabel(action) {
    const labels = {
      custom: 'منطق مخصص',
      hide: 'إخفاء',
      show: 'إظهار',
      shake: 'اهتزاز وحركة',
      color: 'تغيير لون النص',
      text: 'تغيير النص الداخلي',
      addclass: 'إضافة كلاس',
      removeclass: 'حذف كلاس',
      toggleclass: 'تبديل كلاس',
      alert: 'عرض تنبيه'
    };
    return labels[action] || action;
  }

  /* id/varName كانوا بيتحطوا خام في new RegExp — id زي a(b) كان يرمي SyntaxError
     أو يطابق غلط. أي حرف خاص بيتهرّب دلوقتي. */
  /*
   * Remove builder-owned JavaScript that points at HTML which is about to be
   * deleted. Raw user JavaScript is deliberately left alone; only blocks with
   * OSOOS metadata (plus unused generated declarations) are eligible. The
   * caller performs the single sync/history commit after removing the HTML.
   */
  cleanupReferencesForDeletedElements(context = {}) {
    const deletedIds = context.deletedIds instanceof Set
      ? context.deletedIds
      : new Set(context.deletedIds || []);
    const selectorIsOrphan = typeof context.selectorIsOrphan === 'function'
      ? context.selectorIsOrphan
      : () => false;
    if (!deletedIds.size && !context.hasOrphanSelectors) {
      return { changed: false, visualLinks: 0, components: 0, interactions: 0, blocks: 0, variables: 0 };
    }

    const elementIdKey = key => key === '__targetId' ||
      /(?:source|target|element|trigger|content|panel|tab|container|modal|overlay|title|description|menu|wrapper|sidebar|navItem)Id$/i.test(key);
    const valueReferencesDeletedElement = (value, key = '', parent = null, depth = 0) => {
      if (depth > 24 || value === null || value === undefined) return false;
      if (typeof value === 'string') {
        if ((elementIdKey(key) || (key === 'id' && parent && Object.prototype.hasOwnProperty.call(parent, 'selector'))) && deletedIds.has(value)) {
          return true;
        }
        if ((key === 'selector' || /Selector$/i.test(key)) && value && selectorIsOrphan(value)) return true;
        return false;
      }
      if (Array.isArray(value)) {
        return value.some(item => valueReferencesDeletedElement(item, key, value, depth + 1));
      }
      if (typeof value !== 'object') return false;
      return Object.keys(value).some(childKey => valueReferencesDeletedElement(value[childKey], childKey, value, depth + 1));
    };

    const ranges = [];
    const removedLinkIds = [];
    const addRange = (entry, type) => {
      if (!entry || !Number.isInteger(entry.startIndex) || !Number.isInteger(entry.endIndex)) return;
      ranges.push({ startIndex: entry.startIndex, endIndex: entry.endIndex, type, id: entry.id || '' });
      if (type === 'visualLinks' || type === 'components') removedLinkIds.push(entry.id || '');
    };

    const core = typeof window !== 'undefined' ? window.VisualLogicCore : null;
    const visualLinks = typeof this.parseVisualLinks === 'function' ? this.parseVisualLinks() : [];
    visualLinks.forEach(link => {
      let linked = deletedIds.has(link.sourceId) || deletedIds.has(link.targetId) || valueReferencesDeletedElement(link);
      if (!linked && core && typeof core.getRelationships === 'function') {
        try {
          linked = core.getRelationships(link).some(relation =>
            deletedIds.has(relation.sourceId) || deletedIds.has(relation.targetId));
        } catch { /* Invalid legacy metadata is handled by its parser. */ }
      }
      if (linked) addRange(link, 'visualLinks');
    });

    const components = typeof this.parseComponents === 'function' ? this.parseComponents() : [];
    components.forEach(component => {
      if (valueReferencesDeletedElement(component.metadata || component)) addRange(component, 'components');
    });

    const interactions = typeof this.parseInteractions === 'function' ? this.parseInteractions() : [];
    interactions.forEach(interaction => {
      if (deletedIds.has(interaction.sourceId) || deletedIds.has(interaction.targetId)) addRange(interaction, 'interactions');
    });

    const blocks = typeof this.parseJsBlocks === 'function' ? this.parseJsBlocks() : [];
    blocks.forEach(block => {
      if (block.metadataValid && valueReferencesDeletedElement(block.params || {})) addRange(block, 'blocks');
    });

    const counts = { visualLinks: 0, components: 0, interactions: 0, blocks: 0 };
    const uniqueRanges = [];
    ranges
      .sort((a, b) => b.startIndex - a.startIndex || b.endIndex - a.endIndex)
      .forEach(range => {
        if (uniqueRanges.some(existing => range.startIndex >= existing.startIndex && range.endIndex <= existing.endIndex)) return;
        uniqueRanges.push(range);
        counts[range.type] += 1;
      });

    const lines = String(this.customJS || '').split(/\r?\n/);
    uniqueRanges.forEach(range => lines.splice(range.startIndex, range.endIndex - range.startIndex + 1));
    let nextJS = lines.join('\n');

    // Drop an unused declaration generated by "define a variable for this
    // element". If raw code still uses that variable, preserve it: raw source
    // has no reliable ownership boundary and must never be truncated by guess.
    let removedVariables = 0;
    const declarationPattern = /(^[ \t]*\/\/[^\n]*\n)?(^[ \t]*const\s+([A-Za-z_$][\w$]*)\s*=\s*document\.(?:getElementById\(\s*(["'])(.*?)\4\s*\)|querySelector\(\s*(["'])#(.*?)\6\s*\))\s*;?[ \t]*$)/gm;
    const declarations = [];
    let declarationMatch;
    while ((declarationMatch = declarationPattern.exec(nextJS)) !== null) {
      const elementId = declarationMatch[5] || declarationMatch[7] || '';
      if (!deletedIds.has(elementId)) continue;
      declarations.push({
        start: declarationMatch.index,
        end: declarationMatch.index + declarationMatch[0].length,
        variable: declarationMatch[3]
      });
    }
    declarations.reverse().forEach(declaration => {
      const withoutDeclaration = nextJS.slice(0, declaration.start) + nextJS.slice(declaration.end);
      const variableUse = new RegExp(`\\b${this.regexEscape(declaration.variable)}\\b`);
      if (variableUse.test(withoutDeclaration)) return;
      nextJS = withoutDeclaration;
      removedVariables += 1;
    });

    const changed = nextJS !== this.customJS;
    if (changed) {
      this.customJS = nextJS.replace(/\n{3,}/g, '\n\n').trimEnd();
      this._vlCacheJs = null;
      this._vlCacheLinks = [];
      removedLinkIds.filter(Boolean).forEach(id => {
        if (this.hiddenLinkArrows) delete this.hiddenLinkArrows[id];
        if (typeof this.removeInteractionDefinition === 'function') this.removeInteractionDefinition(id);
      });
      if (this.currentLanguage === 'js' && this.textarea) {
        this.textarea.value = this.customJS;
        this.updateLineNumbers();
      }
      const active = this.activeVisualLink;
      if (active && (deletedIds.has(active.sourceId) || deletedIds.has(active.targetId))) {
        if (typeof this.closeVisualLinkPopup === 'function') this.closeVisualLinkPopup();
      }
    }

    return Object.assign({ changed, variables: removedVariables }, counts);
  }

  regexEscape(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getElementVariableName(el) {
    if (!el || !el.id) return '';
    const regex = new RegExp(`const\\s+(\\w+)\\s*=\\s*document\\.getElementById\\('${this.regexEscape(el.id)}'\\);`);
    const match = this.customJS.match(regex);
    if (match) {
      return match[1];
    }
    return el.id.replace(/-/g, '_');
  }

  getEventArabicLabel(evt) {
    const labels = {
      click: 'عند النقر',
      mouseenter: 'عند دخول الفأرة',
      mouseleave: 'عند خروج الفأرة',
      input: 'عند الكتابة',
      change: 'عند التغيير',
      submit: 'عند الإرسال',
      focus: 'عند التركيز',
      blur: 'عند فقد التركيز'
    };
    return labels[evt] || 'حدث تفاعل';
  }

  parseAttachedEvents(varName) {
    const regex = new RegExp(`${this.regexEscape(varName)}\\.addEventListener\\(\\s*['"](\\w+)['"]\\s*,`, 'g');
    let match;
    const events = [];
    while ((match = regex.exec(this.customJS)) !== null) {
      events.push(match[1]);
    }
    return events;
  }

  removeEventListenerCode(varName, eventName) {
    const startPattern = new RegExp(`${this.regexEscape(varName)}\\.addEventListener\\(\\s*['"]${this.regexEscape(eventName)}['"]\\s*,`);
    const match = this.customJS.match(startPattern);
    if (!match) return;
    
    const startIndex = match.index;
    let openBrackets = 0;
    let closed = false;
    let endIndex = -1;
    
    for (let i = startIndex; i < this.customJS.length; i++) {
      if (this.customJS[i] === '{') openBrackets++;
      else if (this.customJS[i] === '}') {
        openBrackets--;
        if (openBrackets === 0) {
          const nextSub = this.customJS.substring(i, i + 10);
          const parenMatch = nextSub.match(/^\}\s*\);?/);
          if (parenMatch) {
            endIndex = i + parenMatch[0].length;
            closed = true;
            break;
          }
        }
      }
    }
    
    if (closed && endIndex !== -1) {
      let finalStart = startIndex;
      const beforeText = this.customJS.substring(0, startIndex);
      const commentMatch = beforeText.match(/\/\/[^\n]*\n\s*$/);
      if (commentMatch) {
        finalStart = startIndex - commentMatch[0].length;
      }
      
      this.customJS = this.customJS.substring(0, finalStart) + this.customJS.substring(endIndex);
      this.textarea.value = this.customJS;
      this.app.saveProgress();
      this.updateLineNumbers();
    }
  }

  renameVariable(elemId, oldVarName, newVarName) {
    if (!newVarName || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(newVarName)) {
      this.showToastNotice('اسم المتغير غير صالح!');
      return false;
    }
    
    const conflictCheck = new RegExp(`(const|let|var)\\s+${this.regexEscape(newVarName)}\\b`);
    const declarationPattern = new RegExp(`(const|let|var)\\s+${this.regexEscape(oldVarName)}\\b`);
    const conflictFound = this.customJS.replace(declarationPattern, '').match(conflictCheck);
    if (conflictFound) {
      this.showToastNotice('المتغير موجود بالفعل!');
      return false;
    }
    
    const regex = new RegExp(`\\b${this.regexEscape(oldVarName)}\\b`, 'g');
    this.customJS = this.customJS.replace(regex, newVarName);
    this.textarea.value = this.customJS;
    this.app.saveProgress();
    this.updateLineNumbers();
    this.scanAndRenderVariables();
    this.showToastNotice(`تم تغيير اسم المتغير إلى: ${newVarName}`);
    return true;
  }
}

export { CodeEditorManager };
