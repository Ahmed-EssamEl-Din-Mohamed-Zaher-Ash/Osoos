/* CSS Styling and Visual Box Model Editor Panel Management */

/* كتالوج الخطوط: عربية + إنجليزية. gf = اسم العائلة في رابط Google Fonts */
const OSOOS_FONT_CATALOG = [
  { family: 'Cairo', css: "'Cairo', sans-serif", label: 'القاهرة · Cairo', lang: 'ar', gf: 'Cairo:wght@400;700' },
  { family: 'Tajawal', css: "'Tajawal', sans-serif", label: 'تجوال · Tajawal', lang: 'ar', gf: 'Tajawal:wght@400;700' },
  { family: 'Almarai', css: "'Almarai', sans-serif", label: 'المراعي · Almarai', lang: 'ar', gf: 'Almarai:wght@400;700' },
  { family: 'Amiri', css: "'Amiri', serif", label: 'أميري · Amiri', lang: 'ar', gf: 'Amiri:wght@400;700' },
  { family: 'Changa', css: "'Changa', sans-serif", label: 'تشانغا · Changa', lang: 'ar', gf: 'Changa:wght@400;700' },
  { family: 'El Messiri', css: "'El Messiri', sans-serif", label: 'المسيري · El Messiri', lang: 'ar', gf: 'El+Messiri:wght@400;700' },
  { family: 'Noto Kufi Arabic', css: "'Noto Kufi Arabic', sans-serif", label: 'نوتو كوفي · Noto Kufi', lang: 'ar', gf: 'Noto+Kufi+Arabic:wght@400;700' },
  { family: 'Reem Kufi', css: "'Reem Kufi', sans-serif", label: 'ريم كوفي · Reem Kufi', lang: 'ar', gf: 'Reem+Kufi:wght@400;700' },
  { family: 'IBM Plex Sans Arabic', css: "'IBM Plex Sans Arabic', sans-serif", label: 'IBM Plex العربي', lang: 'ar', gf: 'IBM+Plex+Sans+Arabic:wght@400;700' },
  { family: 'Markazi Text', css: "'Markazi Text', serif", label: 'مركزي · Markazi', lang: 'ar', gf: 'Markazi+Text:wght@400;700' },
  { family: 'Inter', css: "'Inter', sans-serif", label: 'Inter', lang: 'en', gf: 'Inter:wght@400;700' },
  { family: 'Roboto', css: "'Roboto', sans-serif", label: 'Roboto', lang: 'en', gf: 'Roboto:wght@400;700' },
  { family: 'Poppins', css: "'Poppins', sans-serif", label: 'Poppins', lang: 'en', gf: 'Poppins:wght@400;700' },
  { family: 'Montserrat', css: "'Montserrat', sans-serif", label: 'Montserrat', lang: 'en', gf: 'Montserrat:wght@400;700' },
  { family: 'Lato', css: "'Lato', sans-serif", label: 'Lato', lang: 'en', gf: 'Lato:wght@400;700' },
  { family: 'Open Sans', css: "'Open Sans', sans-serif", label: 'Open Sans', lang: 'en', gf: 'Open+Sans:wght@400;700' },
  { family: 'Playfair Display', css: "'Playfair Display', serif", label: 'Playfair Display', lang: 'en', gf: 'Playfair+Display:wght@400;700' },
  { family: 'JetBrains Mono', css: "'JetBrains Mono', monospace", label: 'JetBrains Mono (أكواد)', lang: 'en', gf: 'JetBrains+Mono:wght@400;700' }
];
window.OSOOS_FONT_CATALOG = OSOOS_FONT_CATALOG;

/* شروح غنية لخصائص CSS — تُعرض في اللوحة الجانبية بنفس أسلوب البيلدر */
const CSS_DOC_DETAILS = {
  display: { title: 'display — طريقة العرض', values: [['block', 'ياخد سطراً كاملاً لوحده (div, p)'], ['inline', 'جنب النص ولا يقبل أبعاداً (span, a)'], ['inline-block', 'جنب غيره ويقبل عرضاً وارتفاعاً'], ['flex', 'حاوية ترتب أبناءها صفاً أو عموداً'], ['grid', 'شبكة صفوف وأعمدة'], ['none', 'إخفاء تام من الصفحة']], example: { code: 'display: flex;', note: 'flex يحوّل العنصر لحاوية ترتب أبناءها في صف أو عمود — أساس أغلب التخطيطات.' }, when: 'أول خاصية تلمسها لما تحتاج ترتيب عناصر جنب بعض.' },
  width: { title: 'width — العرض', example: { code: 'width: 100%;', note: '100% يملأ عرض الأب كاملاً، و320px عرض ثابت مهما تغيرت الشاشة.' }, when: 'استخدم % أو max-width للتجاوب بدل القيم الثابتة.' },
  height: { title: 'height — الارتفاع', example: { code: 'height: auto;', note: 'auto يخلي الارتفاع على قدر المحتوى — الأكثر أماناً.' } },
  'max-width': { title: 'max-width — أقصى عرض', example: { code: 'max-width: 600px;', note: 'العنصر يتمدد لحد 600px بس، وعلى الموبايل ينكمش طبيعي — سر التجاوب.' } },
  'aspect-ratio': { title: 'aspect-ratio — نسبة الأبعاد', example: { code: 'aspect-ratio: 16 / 9;', note: 'يحافظ على شكل مستطيل الفيديو مهما تغير العرض.' } },
  position: { title: 'position — نظام التموضع', values: [['static', 'الافتراضي — في مكانه الطبيعي ولا يقبل إزاحات'], ['relative', 'مكانه الطبيعي + يقبل إزاحة ويصير مرجعاً لأبنائه'], ['absolute', 'يخرج من التدفق ويتموضع نسبة لأقرب أب relative'], ['fixed', 'ثابت على الشاشة مهما مرّرت'], ['sticky', 'عادي حتى يلمس حافة الشاشة فيلتصق بها']], example: { code: 'position: absolute;', note: 'absolute يطلع العنصر من التدفق ويتموضع نسبة لأقرب أب position: relative.' }, when: 'top/left/right/bottom لا تعمل مع static (الافتراضي).' },
  'z-index': { title: 'z-index — ترتيب الطبقات', example: { code: 'z-index: 10;', note: 'الأعلى رقماً يظهر فوق — لا يعمل إلا مع عنصر متموضع (غير static).' } },
  color: { title: 'color — لون النص', example: { code: 'color: #f59e0b;', note: 'يلوّن النص وكل ما يرث منه داخل العنصر.' } },
  'background-color': { title: 'background-color — لون الخلفية', example: { code: 'background-color: #1a1a19;', note: 'لون مصمت خلف المحتوى. لو فيه تدرج فوقه، التدرج هو اللي يظهر.' } },
  'background-image': { title: 'background-image — خلفية صورة أو تدرج', example: { code: 'linear-gradient(90deg, #f59e0b, #3b82f6)', note: 'التدرج والصورة كلاهما background-image — تفعيل أحدهما يستبدل الآخر.' }, when: 'استخدم أداة «تدرج الخلفية» بالأعلى وهي تكتب القيمة الصحيحة عنك.' },
  'background-size': { title: 'background-size — حجم صورة الخلفية', values: [['cover', 'يملأ العنصر كاملاً ولو قص من الصورة'], ['contain', 'الصورة كاملة ولو ظهر فراغ'], ['auto', 'الحجم الأصلي للصورة'], ['100% 100%', 'تمدد كامل وقد يتشوه']], example: { code: 'background-size: cover;', note: 'مع background-position: center تحصل على خلفية أنيقة مهما كان مقاس الشاشة.' } },
  'border-radius': { title: 'border-radius — تدوير الزوايا', example: { code: 'border-radius: 12px;', note: '12px زوايا ناعمة، و50% يحوّل المربع لدائرة كاملة.' } },
  'box-shadow': { title: 'box-shadow — ظل الصندوق', example: { code: '0 4px 12px rgba(0,0,0,.25)', note: 'الترتيب: إزاحة X ثم Y ثم مقدار التمويه ثم اللون — الظل يعطي إحساس الارتفاع.' } },
  'text-shadow': { title: 'text-shadow — ظل النص', example: { code: 'text-shadow: 2px 2px 4px #000;', note: 'نفس فكرة box-shadow لكن على حروف النص نفسها — استخدم أداة «ظل النص».' } },
  'font-family': { title: 'font-family — عائلة الخط', example: { code: "font-family: 'Cairo', sans-serif;", note: 'الاسم الثاني (sans-serif) احتياطي لو الخط الأول ما اتحمّلش.' }, when: 'اختر من القائمة — الرابط المطلوب يتحقن تلقائياً عند التصدير.' },
  'font-size': { title: 'font-size — حجم الخط', example: { code: 'font-size: 16px;', note: '16px هو الافتراضي المريح للقراءة؛ العناوين 24px فأكثر.' } },
  'font-weight': { title: 'font-weight — وزن الخط', values: [['400', 'عادي — للفقرات'], ['500', 'متوسط — للتسميات المهمة'], ['700', 'عريض Bold — للعناوين']], example: { code: 'font-weight: 700;', note: 'لازم الخط نفسه يدعم الوزن — خطوط الكتالوج كلها فيها 400 و700.' } },
  'line-height': { title: 'line-height — ارتفاع السطر', example: { code: 'line-height: 1.6;', note: 'رقم بدون وحدة = مضاعف حجم الخط — 1.6 مريح للفقرات العربية.' } },
  'letter-spacing': { title: 'letter-spacing — تباعد الحروف', example: { code: 'letter-spacing: 1px;', note: 'انتبه: التباعد الكبير يكسر اتصال الحروف العربية.' } },
  'text-align': { title: 'text-align — محاذاة النص', values: [['right', 'يمين — بداية النص العربي'], ['center', 'وسط — للعناوين'], ['left', 'يسار — بداية الإنجليزية'], ['justify', 'ضبط الطرفين معاً — للفقرات الطويلة']], example: { code: 'text-align: center;', note: 'في الصفحات العربية RTL: right هو البداية الطبيعية.' } },
  opacity: { title: 'opacity — الشفافية', example: { code: 'opacity: 0.5;', note: 'من 0 (مخفي تماماً) إلى 1 (ظاهر تماماً) — يشمل العنصر وكل أبنائه.' } },
  overflow: { title: 'overflow — المحتوى الزائد', values: [['visible', 'الزائد يظهر خارج الحدود — الافتراضي'], ['hidden', 'الزائد يُقص ويختفي'], ['scroll', 'شريط تمرير دائم'], ['auto', 'شريط تمرير عند الحاجة فقط — الأذكى']], example: { code: 'overflow: auto;', note: 'حط ارتفاعاً محدداً + overflow: auto تحصل على صندوق قابل للتمرير.' } },
  transition: { title: 'transition — الانتقال الناعم', example: { code: 'transition: all 0.3s ease;', note: 'يخلي أي تغيير (لون، حجم…) يحصل بنعومة خلال 0.3 ثانية بدل القفز.' }, when: 'حطه على العنصر نفسه مش على :hover.' },
  transform: { title: 'transform — التحويل', example: { code: 'transform: scale(1.05);', note: 'تكبير/تدوير/إزاحة بدون التأثير على العناصر المجاورة — ممتاز مع hover.' } },
  filter: { title: 'filter — المؤثرات البصرية', example: { code: 'filter: blur(4px);', note: 'blur تمويه، brightness سطوع، grayscale أبيض وأسود — وتتجمع مع بعض.' } },
  'object-fit': { title: 'object-fit — احتواء الوسائط', values: [['cover', 'يملأ الأبعاد ويقص الزائد — الأجمل غالباً'], ['contain', 'الصورة كاملة ولو ساب فراغاً'], ['fill', 'يتمدد ليملأ وقد يتشوه'], ['none', 'الحجم الأصلي بدون تدخل']], example: { code: 'object-fit: cover;', note: 'الوصفة القياسية لصور البطاقات: width: 100% + height ثابت + cover.' }, when: 'تعمل على الصور والفيديو فقط وبعد تحديد أبعاد لهم.' },
  'flex-direction': { title: 'flex-direction — اتجاه الترتيب', values: [['row', 'صف أفقي — الافتراضي'], ['row-reverse', 'صف أفقي معكوس'], ['column', 'عمود رأسي'], ['column-reverse', 'عمود رأسي معكوس']], example: { code: 'flex-direction: column;', note: 'جرّب: حط 3 أزرار في div وبدّل بين row وcolumn ولاحظ الحركة.' }, when: 'تعمل فقط على العنصر اللي عليه display: flex.' },
  'justify-content': { title: 'justify-content — التوزيع الرئيسي', values: [['flex-start', 'مجمعين في البداية'], ['center', 'مجمعين في الوسط'], ['flex-end', 'مجمعين في النهاية'], ['space-between', 'أول ابن وآخر ابن على الطرفين والفراغ بينهم'], ['space-around', 'فراغ حول كل ابن'], ['space-evenly', 'فراغات متساوية تماماً']], example: { code: 'justify-content: space-between;', note: 'أشهر استخدام: شعار يمين وقائمة يسار في الهيدر.' }, when: 'على الحاوية الـ flex — يوزع على اتجاه flex-direction نفسه.' },
  'align-items': { title: 'align-items — المحاذاة المتقاطعة', values: [['stretch', 'الأبناء يتمددون لملء الارتفاع — الافتراضي'], ['center', 'توسيط على المحور المتعامد'], ['flex-start', 'عند البداية (أعلى الصف)'], ['flex-end', 'عند النهاية (أسفل الصف)'], ['baseline', 'محاذاة على خط جلوس الحروف']], example: { code: 'align-items: center;', note: 'مع justify-content: center تحصل على توسيط كامل أفقياً ورأسياً — أشهر وصفة في CSS.' } },
  gap: { title: 'gap — المسافة بين الأبناء', example: { code: 'gap: 12px;', note: 'مسافة نظيفة بين كل ابن وأخيه بدون هوامش تتراكب — أفضل من margin هنا.' } },
  'box-sizing': { title: 'box-sizing — حساب الأبعاد', values: [['content-box', 'العرض المحدد = المحتوى فقط، وpadding والحدود يتضافوا فوقه فيكبر العنصر — الافتراضي'], ['border-box', 'العرض المحدد يشمل المحتوى وpadding والحدود معاً — مقاسك هو مقاسك']], example: { code: 'box-sizing: border-box;', note: 'border-box يمنع مفاجآت القياسات — معظم المواقع الحديثة تطبقه على كل العناصر.' } },
  'flex-wrap': { title: 'flex-wrap — التفاف الأبناء', values: [['nowrap', 'الكل في سطر واحد ولو انضغطوا — الافتراضي'], ['wrap', 'اللي مش لاقي مكاناً ينزل سطراً جديداً'], ['wrap-reverse', 'ينزل سطراً جديداً لكن بترتيب معكوس']], example: { code: 'flex-wrap: wrap;', note: 'أساس البطاقات المتجاوبة: تتراص جنب بعض وتنزل تحت تلقائياً على الموبايل.' } },
  cursor: { title: 'cursor — شكل المؤشر', example: { code: 'cursor: pointer;', note: 'pointer (اليد) إشارة للمستخدم أن العنصر قابل للضغط.' } },
  'list-style-type': { title: 'list-style-type — شكل علامة القائمة', values: [['disc', '● دائرة مصمتة — افتراضي ul'], ['circle', '○ دائرة مفرغة'], ['square', '■ مربع'], ['decimal', '1. أرقام — افتراضي ol'], ['arabic-indic', '١. أرقام هندية عربية'], ['none', 'بدون علامة — للقوائم التصميمية كالمنيو']], example: { code: 'list-style-type: square;', note: 'تُطبق على عنصر القائمة ul أو ol نفسه، مش على li.' }, when: 'مش شايف الـ ul؟ حدد أي li ثم اضغط اسم ul في شريط المسار أعلى اللوحة.' },
  'list-style-position': { title: 'list-style-position — مكان العلامة', values: [['outside', 'العلامة خارج صندوق النص — الافتراضي'], ['inside', 'العلامة داخل النص وتلتف معه']], example: { code: 'list-style-position: inside;', note: 'inside مفيدة لما القائمة داخل مساحة ضيقة.' } },
  'padding-inline-start': { title: 'إزاحة القائمة من البداية', example: { code: 'padding-inline-start: 24px;', note: 'المسافة قبل العلامات من جهة البداية (يمين في العربية) — صفر يلصق القائمة بالحافة.' } },
  'row-gap': { title: 'row-gap — تباعد العناصر رأسياً', example: { code: 'display: grid; row-gap: 10px;', note: 'أداة «تباعد العناصر» تحوّل القائمة grid تلقائياً حتى يعمل التباعد بين كل li وأخيه.' } }
};

class PropertiesManager {
  constructor(app) {
    this.app = app;
    this.selectedElement = null;
    this.currentPseudoState = 'normal';
    this.activeBreakpoint = 'all';
    this.preferredUnit = 'px';
    this.backgroundObjectUrl = '';
    
    // Box model elements
    this.bmValues = {
      'margin-top': document.getElementById('bm-mt'),
      'margin-bottom': document.getElementById('bm-mb'),
      'margin-left': document.getElementById('bm-ml'),
      'margin-right': document.getElementById('bm-mr'),
      'padding-top': document.getElementById('bm-pt'),
      'padding-bottom': document.getElementById('bm-pb'),
      'padding-left': document.getElementById('bm-pl'),
      'padding-right': document.getElementById('bm-pr'),
    };
    this.bmDimensions = document.getElementById('bm-dimensions');
    this.selectorDisplay = document.getElementById('active-selector-display');
    
    // Sizing select options
    this.widthSelect = document.getElementById('prop-width-select');
    this.heightSelect = document.getElementById('prop-height-select');
    this.maxWidthSelect = document.getElementById('prop-max-width');
    this.overflowSelect = document.getElementById('prop-overflow');

    this.init();
  }

  init() {
    this.setupAccordions();
    this.setupBoxModelDrag();
    this.setupBoxModelDoubleClick();
    this.setupSegmentedControls();
    this.setupSliders();
    this.setupColorsAndGradients();
    this.setupGradientControls();
    this.setupTextEffects();
    this.setupFontTools();
    this.setupIconPicker();
    this.setupListControls();
    this.setupBorderAndRadius();
    this.setupSizingAndPosition();
    this.setupPseudoStates();
    this.setupElementEditors();
    this.setupCssGuidance();
    this.setupBoxShadow();
    this.setupCustomBreakpoints();
    this.setActiveBreakpoint('all', { resizeCanvas: false });
    this.syncSegmentActive('units-segmented', 'px');
    this.updatePanelFor(null);
  }

  getImportantState() {
    const checkbox = document.getElementById('prop-important');
    return !!(checkbox && checkbox.checked);
  }

  applyStyle(property, value, options = {}) {
    if (!this.selectedElement || !this.app.styleEngine) return false;
    const applied = this.app.styleEngine.setStyle(this.selectedElement, property, value, {
      breakpoint: options.breakpoint || this.activeBreakpoint,
      pseudo: options.pseudo || this.currentPseudoState,
      important: options.important === undefined ? this.getImportantState() : options.important
    });
    if (applied) {
      this.app.styleEngine.setContext({
        breakpoint: this.activeBreakpoint,
        pseudo: this.currentPseudoState,
        element: this.selectedElement
      });
      this.app.scheduleStyleSync(options.delay === undefined ? 90 : options.delay);
      this.app.updateHighlighter();
    }
    return applied;
  }

  applyStyles(declarations, options = {}) {
    if (!this.selectedElement || !this.app.styleEngine) return false;
    const applied = this.app.styleEngine.setStyles(this.selectedElement, declarations, {
      breakpoint: options.breakpoint || this.activeBreakpoint,
      pseudo: options.pseudo || this.currentPseudoState,
      important: options.important === undefined ? this.getImportantState() : options.important
    });
    if (applied) {
      this.app.styleEngine.setContext({
        breakpoint: this.activeBreakpoint,
        pseudo: this.currentPseudoState,
        element: this.selectedElement
      });
      this.app.scheduleStyleSync(options.delay === undefined ? 90 : options.delay);
      this.app.updateHighlighter();
    }
    return applied;
  }

  getStyleValue(property, fallback = '') {
    if (!this.selectedElement || !this.app.styleEngine) return fallback;
    return this.app.styleEngine.getStyleValue(this.selectedElement, property, {
      breakpoint: this.activeBreakpoint,
      pseudo: this.currentPseudoState
    }) || fallback;
  }

  normalizeLengthValue(raw, defaultUnit = this.preferredUnit || 'px') {
    const value = String(raw === undefined || raw === null ? '' : raw).trim();
    if (!value) return '';
    if (/^-?(?:\d+|\d*\.\d+)$/.test(value)) return `${value}${defaultUnit}`;
    return value;
  }

  setActiveBreakpoint(breakpoint, options = {}) {
    const next = breakpoint === 'all' || this.app.styleEngine.breakpoints[breakpoint]
      ? breakpoint
      : 'all';
    this.activeBreakpoint = next;

    const container = document.getElementById('breakpoints-segmented');
    if (container) {
      container.querySelectorAll('.segment-btn').forEach(button => {
        const active = button.dataset.val === next;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    this.app.styleEngine.setContext({
      breakpoint: next,
      pseudo: this.currentPseudoState,
      element: this.selectedElement
    });

    if (options.resizeCanvas !== false) {
      const width = next === 'all' ? '1440' : this.app.styleEngine.breakpoints[next].width;
      this.app.setCanvasViewport(width);
      document.querySelectorAll('.viewport-btn').forEach(button => {
        const active = button.dataset.width === width;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    this.updateBreakpointStatus();
    if (this.selectedElement) this.updatePanelFor(this.selectedElement);
  }

  updateBreakpointStatus() {
    const status = document.getElementById('responsive-editing-status');
    if (!status) return;
    if (this.activeBreakpoint === 'all') {
      status.innerHTML = '<strong>أساسي:</strong> التعديل يطبق على كل أحجام الشاشة.';
      status.dataset.scope = 'base';
      return;
    }
    const config = this.app.styleEngine.breakpoints[this.activeBreakpoint];
    /* query للـ breakpoint المخصص بييجي من prompt() وبيتخزن في localStorage —
       بلا تهريب كان بينفّذ HTML في كل جلسة عند اختيار الـ breakpoint. */
    status.innerHTML = `<strong>نطاق مستقل:</strong> أي تعديل الآن سيُحفظ داخل <code>@media ${this.escapeFontHtml(config.query)}</code> فقط.`;
    status.dataset.scope = this.activeBreakpoint;
  }

  // Setup accordion collapsible lists
  setupAccordions() {
    const summaries = document.querySelectorAll('.accordion-summary');
    summaries.forEach(summary => {
      summary.addEventListener('click', () => {
        const parent = summary.parentElement;
        parent.classList.toggle('open');
      });
    });
  }

  // Visual Box Model Drag-to-Adjust logic (Amber/Orange highlight)
  setupBoxModelDrag() {
    Object.keys(this.bmValues).forEach(prop => {
      const el = this.bmValues[prop];
      if (!el) return;

      el.addEventListener('mousedown', (e) => {
        if (!this.selectedElement || el.classList.contains('active-editing')) return;
        e.preventDefault();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const currentText = el.textContent.trim();
        const startVal = currentText === 'auto' ? 0 : (parseInt(currentText) || 0);
        
        const handleMouseMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = startY - moveEvent.clientY; 
          const delta = Math.round((deltaX + deltaY) / 2);
          
          let newVal = Math.max(0, startVal + delta);
          el.textContent = newVal;
          
          if (this.selectedElement) {
            this.applyStyle(prop, `${newVal}px`, { delay: 50 });
          }
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          /* سيبان الزرار برّه النافذة كان بيمنع التنظيف، فالسحبة اللي بعدها
             بتضيف زوج مستمعين تاني فوق الأول (القيمة بتتحرك مرتين). */
          window.removeEventListener('blur', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('blur', handleMouseUp);
      });
    });
  }

  // Visual Box Model Double-Click to Type Value
  setupBoxModelDoubleClick() {
    Object.keys(this.bmValues).forEach(prop => {
      const el = this.bmValues[prop];
      if (!el) return;

      el.addEventListener('dblclick', () => {
        if (!this.selectedElement) return;
        
        el.classList.add('active-editing');
        const originalText = el.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.style.width = '35px';
        input.style.fontSize = '9px';
        input.style.fontFamily = 'monospace';
        input.style.background = 'var(--bg-primary)';
        input.style.color = '#fff';
        input.style.border = '1px solid var(--accent-orange)';
        input.style.borderRadius = '2px';
        input.style.textAlign = 'center';
        input.style.outline = 'none';

        el.innerHTML = '';
        el.appendChild(input);
        input.focus();
        input.select();

        const commitValue = () => {
          const raw = input.value.trim();
          if (raw === 'auto') {
            el.textContent = 'auto';
            el.classList.remove('active-editing');
            if (this.selectedElement) {
              this.applyStyle(prop, 'auto');
            }
            return;
          }
          let num = parseInt(raw);
          if (isNaN(num)) num = 0;
          
          el.textContent = num;
          el.classList.remove('active-editing');
          
          if (this.selectedElement) {
            this.applyStyle(prop, `${num}px`);
          }
        };

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') commitValue();
          if (e.key === 'Escape') {
            el.textContent = originalText;
            el.classList.remove('active-editing');
          }
        });

        input.addEventListener('blur', commitValue);
      });
    });
  }

  // Setup Segmented controls (Display, Flex, Position, Text-align, Breakpoints)
  setupSegmentedControls() {
    const bindSegment = (containerId, styleName, callback = null, options = {}) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (!btn || !container.contains(btn)) return;
        if (!this.selectedElement && !options.allowWithoutSelection) return;
        
        container.querySelectorAll('.segment-btn').forEach(button => {
          const active = button === btn;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        
        const val = btn.dataset.val;
        if (styleName) this.applyStyle(styleName, val);
        
        if (callback) callback(val);
      });
    };

    // Bind Display segmented buttons
    bindSegment('display-segmented', 'display', (val) => {
      const flexSection = document.querySelector('.flex-only-section');
      const flexIndicator = document.getElementById('flex-status-indicator');
      
      if (val === 'flex' || val === 'inline-flex') {
        flexSection.style.display = 'flex';
        flexIndicator.textContent = val;
      } else {
        flexSection.style.display = 'none';
        flexIndicator.textContent = val;
      }
    });

    // Bind Flex layout controls
    bindSegment('flex-dir-segmented', 'flex-direction');
    bindSegment('justify-segmented', 'justify-content');
    bindSegment('align-segmented', 'align-items');
    bindSegment('flex-wrap-segmented', 'flex-wrap');
    bindSegment('align-content-segmented', 'align-content');
    bindSegment('flex-preset-segmented', 'flex');
    bindSegment('align-self-segmented', 'align-self');
    bindSegment('box-sizing-segmented', 'box-sizing');
    bindSegment('position-segmented', 'position', val => this.updatePositionFieldsState(val));
    bindSegment('font-weight-segmented', 'font-weight');
    bindSegment('text-align-segmented', 'text-align');
    bindSegment('object-fit-segmented', 'object-fit');
    bindSegment('units-segmented', '', val => {
      if (val === 'clamp' || val === 'calc') {
        this.preferredUnit = 'px';
        this.app.showToastNotice(`اكتب ${val}(...) مباشرة داخل حقل القيمة.`);
      } else {
        this.preferredUnit = val === 'percent' ? '%' : val;
      }
    }, { allowWithoutSelection: true });

    // Breakpoints change the editing scope; they are not a fake CSS property.
    bindSegment('breakpoints-segmented', '', val => this.setActiveBreakpoint(val), { allowWithoutSelection: true });
  }

  // Setup Slider controls (Gap, Font Size, Transitions, Blur, Brightness)
  setupSliders() {
    const bindSlider = (sliderId, valId, styleName, suffix = '') => {
      const slider = document.getElementById(sliderId);
      const valText = document.getElementById(valId);
      if (!slider || !valText) return;
      
      slider.addEventListener('input', () => {
        const val = slider.value + suffix;
        valText.textContent = val;
        
        if (this.selectedElement) {
          if (styleName.includes('filter:')) {
            const filterType = styleName.split(':')[1];
            this.applyFilterStyle(filterType, val);
          } else {
            this.applyStyle(styleName, val, { delay: 60 });
          }
        }
      });
    };

    bindSlider('prop-gap-slider', 'prop-gap-val', 'gap', 'px');
    bindSlider('prop-font-size-slider', 'prop-font-size-val', 'font-size', 'px');
    bindSlider('prop-blur-slider', 'prop-blur-val', 'filter:blur', 'px');
    bindSlider('prop-brightness-slider', 'prop-brightness-val', 'filter:brightness', '%');
    
    // Transition duration slider
    const durationSlider = document.getElementById('prop-transition-duration');
    const durationVal = document.getElementById('prop-transition-duration-val');
    if (durationSlider && durationVal) {
      durationSlider.addEventListener('input', () => {
        const ms = durationSlider.value;
        durationVal.textContent = `${ms}ms`;
        
        if (this.selectedElement) {
          const timing = document.getElementById('prop-transition-timing').value;
          const prop = document.getElementById('prop-transition-property').value;
          this.applyStyles({
            'transition-duration': `${ms}ms`,
            transition: `${prop} ${ms}ms ${timing}`
          }, { delay: 60 });
        }
      });
    }
  }

  // Sync color pickers with hex code fields
  setupColorsAndGradients() {
    const syncColor = (pickerId, textId, styleName) => {
      const picker = document.getElementById(pickerId);
      const text = document.getElementById(textId);
      if (!picker || !text) return;
      
      picker.addEventListener('input', () => {
        text.value = picker.value.toUpperCase();
        if (this.selectedElement) {
          this.applyStyle(styleName, picker.value, { delay: 60 });
        }
      });
      
      text.addEventListener('input', () => {
        let hex = text.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
          picker.value = hex;
          if (this.selectedElement) {
            this.applyStyle(styleName, hex, { delay: 60 });
          }
        }
      });
    };

    syncColor('prop-color', 'color-hex-text', 'color');
    syncColor('prop-bg', 'bg-hex-text', 'background-color');
    
    // Background image cover selection
    const bgSize = document.getElementById('prop-bg-size');
    if (bgSize) {
      bgSize.addEventListener('change', () => {
        if (this.selectedElement) {
          this.applyStyle('background-size', bgSize.value);
        }
      });
    }

    this.setupBackgroundImageControls();
  }

  setupBackgroundImageControls() {
    const chooseButton = document.getElementById('choose-bg-image-btn');
    const fileInput = document.getElementById('prop-bg-image-file');
    const urlInput = document.getElementById('prop-bg-image-url');
    const removeButton = document.getElementById('remove-bg-image-btn');
    const position = document.getElementById('prop-bg-position');
    const repeat = document.getElementById('prop-bg-repeat');
    const attachment = document.getElementById('prop-bg-attachment');

    const toCssUrl = source => {
      const clean = String(source || '').trim();
      if (!clean) return '';
      const escaped = clean.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]/g, '');
      return `url("${escaped}")`;
    };

    const applyUrl = () => {
      if (!urlInput || !this.selectedElement) return;
      const value = toCssUrl(urlInput.value);
      const valid = !value || !window.CSS || !CSS.supports || CSS.supports('background-image', value);
      urlInput.classList.toggle('css-value-invalid', !valid);
      urlInput.setAttribute('aria-invalid', String(!valid));
      if (valid) this.applyStyle('background-image', value);
    };

    if (chooseButton && fileInput) {
      chooseButton.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file || !this.selectedElement) return;
        if (!file.type.startsWith('image/')) {
          this.app.showToastNotice('اختر ملف صورة صالحًا للخلفية.');
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          this.app.showToastNotice('الصورة أكبر من 2MB. اضغطها أولاً للحفاظ على سرعة المشروع.');
          fileInput.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result || '');
          if (urlInput) urlInput.value = dataUrl;
          this.applyStyle('background-image', toCssUrl(dataUrl));
          this.app.showToastNotice('تمت إضافة صورة الخلفية داخل ملف CSS.');
        };
        reader.onerror = () => this.app.showToastNotice('تعذر قراءة ملف الصورة.');
        reader.readAsDataURL(file);
      });
    }

    if (urlInput) {
      urlInput.addEventListener('change', applyUrl);
      urlInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') applyUrl();
      });
    }

    if (removeButton) {
      removeButton.addEventListener('click', () => {
        if (urlInput) urlInput.value = '';
        if (fileInput) fileInput.value = '';
        this.applyStyle('background-image', '');
      });
    }

    [[position, 'background-position'], [repeat, 'background-repeat'], [attachment, 'background-attachment']]
      .forEach(([control, property]) => {
        if (!control) return;
        control.addEventListener('change', () => this.applyStyle(property, control.value));
      });
  }

  applyFilterStyle(type, value) {
    if (!this.selectedElement) return;
    
    // Retrieve the value from the active stylesheet context, not style="".
    let filters = this.getStyleValue('filter', '');
    
    // Remove existing instances of this filter type
    const regex = new RegExp(`${type}\\([^\\)]+\\)`, 'g');
    filters = filters.replace(regex, '').trim();
    
    // Append new filter value
    filters += ` ${type}(${value})`;
    this.applyStyle('filter', filters.trim(), { delay: 60 });
  }

  // Setup Border widths, styles, colors and corner radius values
  setupBorderAndRadius() {
    // Corner radius corner inputs
    const corners = ['prop-radius-1', 'prop-radius-2', 'prop-radius-3', 'prop-radius-4'];
    corners.forEach((id, index) => {
      const input = document.getElementById(id);
      if (!input) return;
      
      input.addEventListener('input', () => {
        if (!this.selectedElement) return;
        const val = input.value + 'px';
        const styles = [
          'border-top-left-radius',
          'border-top-right-radius',
          'border-bottom-right-radius',
          'border-bottom-left-radius'
        ];
        this.applyStyle(styles[index], val, { delay: 60 });
      });
    });

    // Border width, style and color picker
    const bWidth = document.getElementById('prop-border-width');
    const bStyle = document.getElementById('prop-border-style');
    const bColor = document.getElementById('prop-border-color');
    
    const applyBorder = () => {
      if (!this.selectedElement) return;
      this.applyStyles({
        'border-width': bWidth.value,
        'border-style': bStyle.value,
        'border-color': bColor.value
      }, { delay: 60 });
    };

    if (bWidth) bWidth.addEventListener('input', applyBorder);
    if (bStyle) bStyle.addEventListener('change', applyBorder);
    if (bColor) bColor.addEventListener('input', applyBorder);
  }

  // Setup width, height, overflow and positioning dropdown offsets
  setupSizingAndPosition() {
    const bindValueControl = (el, styleName, options = {}) => {
      if (!el) return;
      const applyValue = () => {
        if (!this.selectedElement) return;
        const raw = el.value === undefined ? '' : el.value;
        const value = options.length ? this.normalizeLengthValue(raw, options.unit || this.preferredUnit) : String(raw).trim();
        const supported = !value || !window.CSS || !CSS.supports || CSS.supports(styleName, value);
        el.classList.toggle('css-value-invalid', !supported);
        el.setAttribute('aria-invalid', String(!supported));
        if (supported) this.applyStyle(styleName, value, { delay: options.delay || 90 });
      };
      /* ربط واحد فقط: input كان يُتبع بـ change فيطبّق القيمة مرتين ويضاعف خطوات history */
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', applyValue);
    };

    bindValueControl(this.widthSelect, 'width', { length: true });
    bindValueControl(this.heightSelect, 'height', { length: true });
    bindValueControl(this.maxWidthSelect, 'max-width', { length: true });
    bindValueControl(this.overflowSelect, 'overflow');
    bindValueControl(document.getElementById('prop-min-width'), 'min-width', { length: true });
    bindValueControl(document.getElementById('prop-min-height'), 'min-height', { length: true });
    bindValueControl(document.getElementById('prop-max-height'), 'max-height', { length: true });
    bindValueControl(document.getElementById('prop-aspect-ratio'), 'aspect-ratio');
    
    // Offset fields: top, right, bottom, left
    const bindOffset = (id, styleName) => {
      const field = document.getElementById(id);
      if (!field) return;
      
      bindValueControl(field, styleName, { length: true, delay: 60 });
    };

    bindOffset('prop-top', 'top');
    bindOffset('prop-right', 'right');
    bindOffset('prop-bottom', 'bottom');
    bindOffset('prop-left', 'left');
    
    // Z-index field
    const zIndex = document.getElementById('prop-z-index');
    if (zIndex) {
      zIndex.addEventListener('input', () => {
        if (this.selectedElement) {
          this.applyStyle('z-index', zIndex.value, { delay: 60 });
        }
      });
    }

    // Float select
    const floatSel = document.getElementById('prop-float');
    if (floatSel) {
      floatSel.addEventListener('change', () => {
        if (this.selectedElement) {
          this.applyStyle('float', floatSel.value);
        }
      });
    }

    // Font Family selector
    const fontFamily = document.getElementById('prop-font-family');
    if (fontFamily) {
      fontFamily.addEventListener('change', () => {
        if (this.selectedElement) {
          this.applyStyle('font-family', fontFamily.value);
        }
      });
    }

    // Line height & letter spacing text boxes
    const lineH = document.getElementById('prop-line-height');
    if (lineH) {
      lineH.addEventListener('input', () => {
        if (this.selectedElement) {
          this.applyStyle('line-height', lineH.value, { delay: 60 });
        }
      });
    }

    const spacing = document.getElementById('prop-letter-spacing');
    if (spacing) {
      spacing.addEventListener('input', () => {
        if (this.selectedElement) {
          const val = this.normalizeLengthValue(spacing.value);
          this.applyStyle('letter-spacing', val, { delay: 60 });
        }
      });
    }

    // Flex container fine tuning.
    bindValueControl(document.getElementById('prop-row-gap'), 'row-gap', { length: true });
    bindValueControl(document.getElementById('prop-column-gap'), 'column-gap', { length: true });

    // Flex item properties are written to the selected child itself.
    bindValueControl(document.getElementById('prop-flex-value'), 'flex');
    bindValueControl(document.getElementById('prop-flex-grow'), 'flex-grow');
    bindValueControl(document.getElementById('prop-flex-shrink'), 'flex-shrink');
    bindValueControl(document.getElementById('prop-flex-basis'), 'flex-basis', { length: true });
    bindValueControl(document.getElementById('prop-flex-order'), 'order');
  }

  updatePositionFieldsState(positionValue) {
    const isStatic = positionValue === 'static';
    ['prop-top', 'prop-right', 'prop-bottom', 'prop-left'].forEach(id => {
      const field = document.getElementById(id);
      if (!field) return;
      field.disabled = isStatic;
      field.title = isStatic ? 'غيّر position من static أولاً حتى تعمل الإزاحة.' : '';
    });
  }

  // Setup hover and pseudo state simulation
  setupPseudoStates() {
    const row = document.getElementById('pseudo-states-row');
    if (!row) return;
    
    row.addEventListener('click', (e) => {
      const btn = e.target.closest('.pseudo-btn');
      if (!btn || !this.selectedElement) return;
      
      row.querySelectorAll('.pseudo-btn').forEach(button => {
        const active = button === btn;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      
      const state = btn.dataset.state;
      this.currentPseudoState = state;
      this.app.styleEngine.setContext({
        breakpoint: this.activeBreakpoint,
        pseudo: state,
        element: this.selectedElement
      });
      const selector = this.app.styleEngine.ensureElementSelector(this.selectedElement);
      const suffix = this.app.styleEngine.pseudoSuffix(state);
      this.selectorDisplay.textContent = selector + suffix;
      this.updatePanelFor(this.selectedElement);
    });
  }

  /* ── تدرج الخلفية: يقرأ النوع والزاوية واللونين ويكتب background-image فعلياً ── */
  setupGradientControls() {
    const type = document.getElementById('gradient-type');
    const color1 = document.getElementById('gradient-color-1');
    const color2 = document.getElementById('gradient-color-2');
    const angle = document.getElementById('gradient-angle');
    const angleVal = document.getElementById('gradient-angle-val');
    const angleRow = document.getElementById('gradient-angle-row');
    const preview = document.getElementById('gradient-live-preview');
    const swapButton = document.getElementById('gradient-swap-btn');
    if (!type || !color1 || !color2 || !angle) return;
    const compose = () => type.value === 'radial'
      ? `radial-gradient(circle, ${color1.value} 0%, ${color2.value} 100%)`
      : `linear-gradient(${angle.value}deg, ${color1.value} 0%, ${color2.value} 100%)`;
    const refresh = () => {
      if (angleRow) angleRow.style.display = type.value === 'linear' ? '' : 'none';
      if (angleVal) angleVal.textContent = `${angle.value}°`;
      if (preview) preview.style.background = type.value === 'none' ? 'transparent' : compose();
    };
    const apply = () => {
      refresh();
      if (!this.selectedElement) return;
      if (type.value === 'none') this.applyStyle('background-image', 'none');
      else this.applyStyle('background-image', compose(), { delay: 60 });
    };
    [color1, color2].forEach(input => input.addEventListener('input', apply));
    angle.addEventListener('input', apply);
    type.addEventListener('change', apply);
    if (swapButton) swapButton.addEventListener('click', () => {
      const temp = color1.value; color1.value = color2.value; color2.value = temp; apply();
    });
    refresh();
  }

  /* ── ظل النص وتدرج النص ── */
  setupTextEffects() {
    const byId = id => document.getElementById(id);
    const shadowX = byId('tshadow-x'), shadowY = byId('tshadow-y'), shadowBlur = byId('tshadow-blur'), shadowColor = byId('tshadow-color');
    if (shadowX && shadowY && shadowBlur && shadowColor) {
      const composeShadow = () => `${shadowX.value}px ${shadowY.value}px ${shadowBlur.value}px ${shadowColor.value}`;
      const applyShadow = () => { if (this.selectedElement) this.applyStyle('text-shadow', composeShadow(), { delay: 60 }); };
      [shadowX, shadowY, shadowBlur, shadowColor].forEach(input => input.addEventListener('input', applyShadow));
      const applyButton = byId('tshadow-apply'); if (applyButton) applyButton.addEventListener('click', applyShadow);
      const removeButton = byId('tshadow-remove');
      if (removeButton) removeButton.addEventListener('click', () => { if (this.selectedElement) this.applyStyle('text-shadow', 'none'); });
    }
    const gradColor1 = byId('tgrad-color-1'), gradColor2 = byId('tgrad-color-2'), gradAngle = byId('tgrad-angle');
    if (gradColor1 && gradColor2 && gradAngle) {
      const applyTextGradient = () => {
        if (!this.selectedElement) return;
        /* الوصفة القياسية: تدرج كخلفية + قصّها على شكل الحروف + نص شفاف */
        this.applyStyles({
          'background-image': `linear-gradient(${gradAngle.value}deg, ${gradColor1.value}, ${gradColor2.value})`,
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          'color': 'transparent'
        }, { delay: 60 });
      };
      [gradColor1, gradColor2, gradAngle].forEach(input => input.addEventListener('input', applyTextGradient));
      const applyButton = byId('tgrad-apply'); if (applyButton) applyButton.addEventListener('click', applyTextGradient);
      const removeButton = byId('tgrad-remove');
      if (removeButton) removeButton.addEventListener('click', () => {
        if (!this.selectedElement) return;
        this.applyStyles({ 'background-image': 'none', '-webkit-background-clip': 'initial', 'background-clip': 'initial', 'color': 'inherit' });
      });
    }
  }

  /* ── منتقي الأيقونات: يدرج <i class="fas ..."> داخل العنصر المحدد ── */
  setupIconPicker() {
    const openButton = document.getElementById('open-icon-picker-btn');
    if (!openButton) return;
    openButton.addEventListener('click', () => this.openIconPicker());
  }

  openIconPicker() {
    this._iconPickerOpener = document.activeElement;
    if (!this.selectedElement) {
      if (this.app.showToastNotice) this.app.showToastNotice('اختر عنصراً من المعاينة أولاً ثم أدرج الأيقونة');
      return;
    }
    let overlay = document.getElementById('icon-picker-overlay');
    if (!overlay) {
      const icons = [
        ['fa-heart', 'قلب'], ['fa-star', 'نجمة'], ['fa-check', 'صح'], ['fa-xmark', 'خطأ'], ['fa-user', 'مستخدم'], ['fa-users', 'مجموعة'],
        ['fa-house', 'منزل'], ['fa-magnifying-glass', 'بحث'], ['fa-cart-shopping', 'سلة'], ['fa-phone', 'هاتف'], ['fa-envelope', 'بريد'], ['fa-location-dot', 'موقع'],
        ['fa-calendar', 'تقويم'], ['fa-clock', 'ساعة'], ['fa-camera', 'كاميرا'], ['fa-image', 'صورة'], ['fa-video', 'فيديو'], ['fa-music', 'موسيقى'],
        ['fa-play', 'تشغيل'], ['fa-pause', 'إيقاف مؤقت'], ['fa-bell', 'جرس'], ['fa-gear', 'إعدادات'], ['fa-wrench', 'أدوات'], ['fa-trash', 'حذف'],
        ['fa-pen', 'قلم'], ['fa-copy', 'نسخ'], ['fa-download', 'تنزيل'], ['fa-upload', 'رفع'], ['fa-share', 'مشاركة'], ['fa-link', 'رابط'],
        ['fa-lock', 'قفل'], ['fa-unlock', 'فتح'], ['fa-key', 'مفتاح'], ['fa-shield', 'حماية'], ['fa-circle-info', 'معلومات'], ['fa-circle-question', 'سؤال'],
        ['fa-triangle-exclamation', 'تنبيه'], ['fa-thumbs-up', 'إعجاب'], ['fa-comment', 'تعليق'], ['fa-paper-plane', 'إرسال'], ['fa-globe', 'عالم'], ['fa-wifi', 'واي فاي'],
        ['fa-cloud', 'سحابة'], ['fa-sun', 'شمس'], ['fa-moon', 'قمر'], ['fa-fire', 'نار'], ['fa-bolt', 'برق'], ['fa-gift', 'هدية'],
        ['fa-tag', 'وسم'], ['fa-truck', 'شحن'], ['fa-credit-card', 'بطاقة'], ['fa-money-bill', 'نقود'], ['fa-chart-line', 'رسم بياني'], ['fa-bars', 'قائمة'],
        ['fa-arrow-right', 'سهم يمين'], ['fa-arrow-left', 'سهم يسار'], ['fa-arrow-up', 'سهم أعلى'], ['fa-arrow-down', 'سهم أسفل'], ['fa-plus', 'زائد'], ['fa-minus', 'ناقص'],
        ['fa-eye', 'عين'], ['fa-face-smile', 'ابتسامة'], ['fa-quote-right', 'اقتباس'], ['fa-graduation-cap', 'تعليم'], ['fa-briefcase', 'حقيبة عمل'], ['fa-code', 'كود']
      ];
      overlay = document.createElement('div');
      overlay.id = 'icon-picker-overlay';
      overlay.className = 'icon-picker-overlay';
      /* إتاحة: نافذة حوارية معلَنة، إغلاق بـ Escape، وإرجاع التركيز لمصدره */
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'اختر أيقونة');
      overlay.innerHTML = `<div class="icon-picker-dialog"><header><strong><i class="fas fa-icons" aria-hidden="true"></i> اختر أيقونة</strong><input type="text" id="icon-picker-search" placeholder="ابحث بالاسم أو بالعربية… (heart / قلب)" aria-label="ابحث عن أيقونة" dir="auto"><button type="button" id="icon-picker-close" class="btn btn-outline" aria-label="إغلاق">&times;</button></header><div class="icon-picker-grid" role="list">${icons.map(([icon, label]) => `<button type="button" class="icon-picker-item" data-icon="${icon}" data-search="${icon} ${label}" role="listitem" aria-label="${label}" title="${label}"><i class="fas ${icon}" aria-hidden="true"></i><span>${label}</span></button>`).join('')}</div></div>`;
      document.body.appendChild(overlay);
      const closeIconPicker = () => {
        overlay.hidden = true;
        if (this._iconPickerOpener && this._iconPickerOpener.focus) this._iconPickerOpener.focus();
        this._iconPickerOpener = null;
      };
      overlay.addEventListener('click', event => {
        if (event.target === overlay || event.target.closest('#icon-picker-close')) { closeIconPicker(); return; }
        const item = event.target.closest('.icon-picker-item');
        if (item) { this.insertIconIntoSelection(item.dataset.icon); closeIconPicker(); }
      });
      overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.stopPropagation(); closeIconPicker(); return; }
        /* حصر التركيز داخل النافذة أثناء فتحها */
        if (event.key !== 'Tab') return;
        const focusables = Array.from(overlay.querySelectorAll('button:not([hidden]), input')).filter(node => node.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      const search = overlay.querySelector('#icon-picker-search');
      if (search) search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        overlay.querySelectorAll('.icon-picker-item').forEach(item => { item.hidden = !!query && item.dataset.search.toLowerCase().indexOf(query) === -1; });
      });
    }
    overlay.hidden = false;
    const search = overlay.querySelector('#icon-picker-search');
    if (search) { search.value = ''; overlay.querySelectorAll('.icon-picker-item').forEach(item => { item.hidden = false; }); search.focus(); }
  }

  insertIconIntoSelection(iconClass) {
    if (!this.selectedElement) return;
    this.selectedElement.insertAdjacentHTML('beforeend', ` <i class="fas ${iconClass}"></i>`);
    if (this.app.history && this.app.history.saveState) this.app.history.saveState('إدراج أيقونة');
    if (this.app.domTree && this.app.domTree.render) this.app.domTree.render();
    if (this.app.showToastNotice) this.app.showToastNotice('تمت إضافة الأيقونة داخل العنصر المحدد — رابط FontAwesome سيُحقن تلقائياً عند التصدير');
  }

  /* ── الخطوط: قائمة بمعاينة حية + خط مخصص برابط أو ملف ── */
  notifyFonts(message) {
    if (this.app.showToastNotice) this.app.showToastNotice(message);
  }

  loadPersistedFontLinks() {
    if (this._fontLinksLoaded || !this.app.editor) return;
    this._fontLinksLoaded = true;
    const markers = (this.app.editor.customCSS || '').match(/\/\* OSOOS_FONT_LINK: (.*?) \*\//g) || [];
    markers.forEach(marker => {
      const payload = marker.replace('/* OSOOS_FONT_LINK:', '').replace('*/', '').trim();
      const [url, family] = payload.split('|').map(part => (part || '').trim());
      const safeUrl = this.sanitizeFontUrl(url);
      const safeFamily = this.sanitizeFontFamilyName(family);
      if (safeUrl) this.injectFontLinkTag(safeUrl);
      if (safeFamily && !this.customFonts.some(font => font.family === safeFamily)) {
        this.customFonts.push({ family: safeFamily, css: `'${safeFamily}', sans-serif`, label: `${safeFamily} (مخصص)`, custom: true });
      }
    });
  }

  /* الرابط يُكتب داخل تعليق CSS ووسم link: نمنع كسر التعليق وحقن سمات */
  sanitizeFontUrl(url) {
    const raw = String(url || '').trim();
    if (!/^https:\/\//i.test(raw)) return '';
    if (raw.indexOf('*/') !== -1 || raw.indexOf('|') !== -1) return '';
    try { return encodeURI(new URL(raw).href); } catch (error) { return ''; }
  }

  injectFontLinkTag(url) {
    const safeUrl = this.sanitizeFontUrl(url);
    if (!safeUrl) return false;
    /* المطابقة بالخاصية href لا بمحدد نصي — قيمة المستخدم لا تدخل querySelector */
    const exists = Array.from(document.querySelectorAll('link[data-osoos-font]'))
      .some(link => link.getAttribute('href') === safeUrl);
    if (exists) return true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = safeUrl;
    link.setAttribute('data-osoos-font', 'true');
    document.head.appendChild(link);
    return true;
  }

  registerCustomFontLink(url, family) {
    const safeUrl = this.sanitizeFontUrl(url);
    const safeFamily = this.sanitizeFontFamilyName(family);
    if (!safeUrl || !safeFamily) return false;
    this.injectFontLinkTag(safeUrl);
    if (this.app.editor) {
      const marker = `/* OSOOS_FONT_LINK: ${safeUrl} | ${safeFamily} */`;
      if ((this.app.editor.customCSS || '').indexOf(marker) === -1) {
        this.app.editor.customCSS = `${marker}\n${this.app.editor.customCSS || ''}`;
      }
    }
    if (!this.customFonts.some(font => font.family === safeFamily)) {
      this.customFonts.push({ family: safeFamily, css: `'${safeFamily}', sans-serif`, label: `${safeFamily} (مخصص)`, custom: true });
    }
    return true;
  }

  /* أسماء الخطوط نص حر من المستخدم ويُخزَّن في CSS المشروع — تعقيم إلزامي قبل أي innerHTML */
  escapeFontHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* عائلة الخط تدخل قاعدة CSS: نمنع كسر القاعدة أو التعليق */
  sanitizeFontFamilyName(value) {
    return String(value || '').replace(/[<>"'`;{}()\\]|\*\//g, '').trim().slice(0, 64);
  }

  buildFontListHtml() {
    const esc = value => this.escapeFontHtml(value);
    const section = (title, fonts) => fonts.length
      ? `<div class="font-picker-section">${esc(title)}</div>${fonts.map(font => `<button type="button" class="font-picker-item" data-font-css="${esc(font.css)}" data-font-label="${esc(font.label)}" style="font-family: ${esc(font.css)};"><span class="font-picker-name">${esc(font.label)}</span><span class="font-picker-sample">أبجد هوز Aa Bb 123</span></button>`).join('')}`
      : '';
    return section('خطوط عربية', OSOOS_FONT_CATALOG.filter(font => font.lang === 'ar'))
      + section('خطوط إنجليزية', OSOOS_FONT_CATALOG.filter(font => font.lang === 'en'))
      + section('خطوط مخصصة', this.customFonts || []);
  }

  setupFontTools() {
    const button = document.getElementById('font-picker-btn');
    const pop = document.getElementById('font-picker-pop');
    if (!button || !pop) return;
    this.customFonts = [];
    let previewBackup = null;
    const restorePreview = () => {
      if (this.selectedElement && previewBackup !== null) this.selectedElement.style.fontFamily = previewBackup;
      previewBackup = null;
    };
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    pop.setAttribute('role', 'listbox');
    pop.setAttribute('aria-label', 'قائمة الخطوط');
    button.addEventListener('click', () => {
      this.loadPersistedFontLinks();
      if (pop.hidden) pop.innerHTML = this.buildFontListHtml();
      pop.hidden = !pop.hidden;
      button.setAttribute('aria-expanded', String(!pop.hidden));
    });
    /* Escape يغلق القائمة ويرجّع التركيز للزر */
    pop.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      restorePreview();
      pop.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.focus();
    });
    document.addEventListener('click', event => {
      if (!pop.hidden && !pop.contains(event.target) && event.target !== button && !button.contains(event.target)) { restorePreview(); pop.hidden = true; }
    });
    /* معاينة حية: الوقوف على خط يطبقه مؤقتاً على العنصر المحدد */
    pop.addEventListener('mouseover', event => {
      const item = event.target.closest('[data-font-css]');
      if (!item || !this.selectedElement) return;
      if (previewBackup === null) previewBackup = this.selectedElement.style.fontFamily || '';
      this.selectedElement.style.fontFamily = item.dataset.fontCss;
    });
    pop.addEventListener('mouseleave', restorePreview);
    pop.addEventListener('click', event => {
      const item = event.target.closest('[data-font-css]');
      if (!item) return;
      restorePreview();
      if (this.selectedElement) this.applyStyle('font-family', item.dataset.fontCss);
      button.innerHTML = `${this.escapeFontHtml(item.dataset.fontLabel)} <i class="fas fa-chevron-down" style="font-size: 8px; opacity: .6;"></i>`;
      pop.hidden = true;
    });
    /* خط مخصص بالرابط */
    const addLinkButton = document.getElementById('add-font-link-btn');
    if (addLinkButton) addLinkButton.addEventListener('click', () => {
      this.loadPersistedFontLinks();
      const url = ((document.getElementById('custom-font-url') || {}).value || '').trim();
      const family = ((document.getElementById('custom-font-family') || {}).value || '').trim();
      if (!this.sanitizeFontUrl(url)) { this.notifyFonts('اكتب رابطاً صحيحاً يبدأ بـ https (بدون رموز غير مسموحة)'); return; }
      const safeFamily = this.sanitizeFontFamilyName(family);
      if (!safeFamily) { this.notifyFonts('اكتب اسم عائلة الخط (Family) بحروف وأرقام فقط'); return; }
      if (!this.registerCustomFontLink(url, safeFamily)) { this.notifyFonts('تعذّر إضافة الخط — راجع الرابط والاسم'); return; }
      if (this.app.scheduleStyleSync) this.app.scheduleStyleSync(50);
      this.notifyFonts(`تمت إضافة الخط ${safeFamily} — رابطه سيُحقن تلقائياً في head عند التصدير`);
    });
    /* خط مخصص برفع ملف → @font-face داخل CSS المشروع */
    const uploadButton = document.getElementById('upload-font-btn');
    const fileInput = document.getElementById('custom-font-file');
    if (uploadButton && fileInput) {
      uploadButton.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const family = this.sanitizeFontFamilyName(((document.getElementById('custom-font-family') || {}).value || '').trim() || file.name.replace(/\.[^.]+$/, '')) || 'CustomFont';
        const reader = new FileReader();
        reader.onload = () => {
          const format = /\.woff2$/i.test(file.name) ? 'woff2' : (/\.woff$/i.test(file.name) ? 'woff' : (/\.otf$/i.test(file.name) ? 'opentype' : 'truetype'));
          const fontFace = `@font-face {\n  font-family: '${family}';\n  src: url('${reader.result}') format('${format}');\n  font-display: swap;\n}`;
          if (this.app.editor) this.app.editor.customCSS = `${fontFace}\n${this.app.editor.customCSS || ''}`;
          const styleTag = document.createElement('style');
          styleTag.setAttribute('data-osoos-font', 'true');
          styleTag.textContent = fontFace;
          document.head.appendChild(styleTag);
          if (!this.customFonts.some(font => font.family === family)) {
            this.customFonts.push({ family, css: `'${family}'`, label: `${family} (مرفوع)`, custom: true });
          }
          if (this.app.scheduleStyleSync) this.app.scheduleStyleSync(50);
          this.notifyFonts(`تم تحويل الملف إلى @font-face وأصبح خط ${family} متاحاً في القائمة`);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      });
    }
  }

  /* ── تنسيق القوائم ul/ol ── */
  setupListControls() {
    const styleType = document.getElementById('prop-list-style-type');
    if (styleType) styleType.addEventListener('change', () => { if (this.selectedElement) this.applyStyle('list-style-type', styleType.value); });
    const stylePosition = document.getElementById('prop-list-style-position');
    if (stylePosition) stylePosition.addEventListener('change', () => { if (this.selectedElement) this.applyStyle('list-style-position', stylePosition.value); });
    const indent = document.getElementById('prop-list-indent');
    const indentVal = document.getElementById('prop-list-indent-val');
    if (indent) indent.addEventListener('input', () => {
      if (indentVal) indentVal.textContent = `${indent.value}px`;
      if (this.selectedElement) this.applyStyle('padding-inline-start', `${indent.value}px`, { delay: 60 });
    });
    const gap = document.getElementById('prop-list-gap');
    const gapVal = document.getElementById('prop-list-gap-val');
    if (gap) gap.addEventListener('input', () => {
      if (gapVal) gapVal.textContent = `${gap.value}px`;
      if (!this.selectedElement) return;
      const value = Number(gap.value);
      /* row-gap تحتاج حاوية grid؛ نتذكر display الأصلي ونستعيده عند التصفير
         بدل ترك العنصر grid للأبد. */
      if (value > 0) {
        if (this._listDisplayBackup === undefined) {
          const current = this.selectedElement.style.display || '';
          this._listDisplayBackup = current === 'grid' ? '' : current;
        }
        this.applyStyles({ display: 'grid', 'row-gap': `${value}px` }, { delay: 60 });
      } else {
        const restored = this._listDisplayBackup;
        this._listDisplayBackup = undefined;
        if (restored) this.applyStyles({ display: restored, 'row-gap': '0px' }, { delay: 60 });
        else this.applyStyles({ display: 'block', 'row-gap': '0px' }, { delay: 60 });
      }
    });
  }

  /* ── شريط المسار الأبوي: يحل مشكلة تحديد الأب المختفي (ul تحت li مثلاً) ── */
  renderAncestryBar(element) {
    const bar = document.getElementById('element-ancestry');
    if (!bar) return;
    if (!element) { bar.hidden = true; bar.innerHTML = ''; return; }
    const canvas = document.getElementById('builder-canvas');
    const chain = [];
    let node = element;
    while (node && node !== canvas && node.tagName && chain.length < 5) { chain.unshift(node); node = node.parentElement; }
    this._ancestryChain = chain;
    const listHint = element.tagName === 'LI'
      ? '<span class="ancestry-hint"><i class="fas fa-lightbulb"></i> لتنسيق القائمة كلها اضغط ul في المسار</span>'
      : '';
    bar.innerHTML = chain.map((item, index) => {
      const rawLabel = item.tagName.toLowerCase() + (item.id ? `#${item.id.length > 12 ? item.id.slice(0, 12) + '…' : item.id}` : '');
      /* الـ id بييجي من HTML اللي المستخدم يقدر يكتبه/يلزقه في تبويب الأكواد —
         كان بيتحقن خام هنا في نص العنصر وجوه title="..." كمان. */
      const label = this.escapeFontHtml(rawLabel);
      const isCurrent = index === chain.length - 1;
      return `${index ? '<i class="fas fa-angle-left ancestry-sep"></i>' : ''}<button type="button" class="ancestry-chip${isCurrent ? ' is-current' : ''}" data-ancestry-index="${index}" ${isCurrent ? 'disabled' : ''} title="${isCurrent ? 'العنصر المحدد حالياً' : `اضغط لتحديد ${label}`}">${label}</button>`;
    }).join('') + listHint;
    bar.hidden = false;
    if (!bar.dataset.bound) {
      bar.dataset.bound = 'true';
      bar.addEventListener('click', event => {
        const chip = event.target.closest('.ancestry-chip');
        if (!chip || chip.disabled) return;
        const target = (this._ancestryChain || [])[Number(chip.dataset.ancestryIndex)];
        if (target && this.app.selectElement) this.app.selectElement(target);
      });
      /* الوقوف على شريحة يبرز العنصر في المعاينة */
      bar.addEventListener('mouseover', event => {
        const chip = event.target.closest('.ancestry-chip');
        if (!chip || chip.disabled) return;
        const target = (this._ancestryChain || [])[Number(chip.dataset.ancestryIndex)];
        if (target) { this._ancestryOutlineTarget = target; target.style.outline = '2px dashed var(--accent-orange, #f59e0b)'; target.style.outlineOffset = '2px'; }
      });
      bar.addEventListener('mouseout', () => {
        if (this._ancestryOutlineTarget) { this._ancestryOutlineTarget.style.outline = ''; this._ancestryOutlineTarget.style.outlineOffset = ''; this._ancestryOutlineTarget = null; }
      });
    }
  }

  setupCssGuidance() {
    const panel = document.getElementById('css-properties-container');
    if (!panel || panel.dataset.guidanceReady === 'true') return;
    panel.dataset.guidanceReady = 'true';

    const controlProperties = {
      'display-segmented': 'display',
      'flex-dir-segmented': 'flex-direction',
      'flex-wrap-segmented': 'flex-wrap',
      'justify-segmented': 'justify-content',
      'align-segmented': 'align-items',
      'align-content-segmented': 'align-content',
      'prop-gap-slider': 'gap',
      'prop-row-gap': 'row-gap',
      'prop-column-gap': 'column-gap',
      'flex-preset-segmented': 'flex',
      'prop-flex-value': 'flex',
      'prop-flex-grow': 'flex-grow',
      'prop-flex-shrink': 'flex-shrink',
      'prop-flex-basis': 'flex-basis',
      'prop-flex-order': 'order',
      'align-self-segmented': 'align-self',
      'prop-width-select': 'width',
      'prop-height-select': 'height',
      'prop-min-width': 'min-width',
      'prop-max-width': 'max-width',
      'prop-min-height': 'min-height',
      'prop-max-height': 'max-height',
      'prop-aspect-ratio': 'aspect-ratio',
      'prop-overflow': 'overflow',
      'box-sizing-segmented': 'box-sizing',
      'position-segmented': 'position',
      'prop-top': 'top',
      'prop-right': 'right',
      'prop-bottom': 'bottom',
      'prop-left': 'left',
      'prop-z-index': 'z-index',
      'prop-float': 'float',
      'prop-color': 'color',
      'prop-bg': 'background-color',
      'prop-bg-image-url': 'background-image',
      'prop-bg-size': 'background-size',
      'prop-bg-position': 'background-position',
      'prop-bg-repeat': 'background-repeat',
      'prop-bg-attachment': 'background-attachment',
      'prop-border-width': 'border-width',
      'prop-border-style': 'border-style',
      'prop-border-color': 'border-color',
      'prop-font-family': 'font-family',
      'prop-font-size-slider': 'font-size',
      'font-weight-segmented': 'font-weight',
      'text-align-segmented': 'text-align',
      'prop-line-height': 'line-height',
      'prop-letter-spacing': 'letter-spacing',
      'prop-transition-duration': 'transition-duration',
      'prop-transition-property': 'transition-property',
      'object-fit-segmented': 'object-fit',
      'prop-blur-slider': 'filter',
      'prop-brightness-slider': 'filter'
    };

    Object.entries(controlProperties).forEach(([id, property]) => {
      const control = document.getElementById(id);
      if (!control) return;
      control.dataset.cssProperty = property;
      if (!control.dataset.scope) {
        control.dataset.scope = control.closest('.flex-container-controls')
          ? 'container'
          : (control.closest('.flex-item-controls') ? 'item' : 'element');
      }
    });

    const segmentProperties = {
      'display-segmented': 'display',
      'flex-dir-segmented': 'flex-direction',
      'flex-wrap-segmented': 'flex-wrap',
      'justify-segmented': 'justify-content',
      'align-segmented': 'align-items',
      'align-content-segmented': 'align-content',
      'flex-preset-segmented': 'flex',
      'align-self-segmented': 'align-self',
      'box-sizing-segmented': 'box-sizing',
      'position-segmented': 'position',
      'font-weight-segmented': 'font-weight',
      'text-align-segmented': 'text-align',
      'object-fit-segmented': 'object-fit'
    };
    Object.entries(segmentProperties).forEach(([id, property]) => {
      const container = document.getElementById(id);
      if (!container) return;
      container.querySelectorAll('.segment-btn').forEach(button => {
        button.dataset.cssProperty = property;
        button.setAttribute('aria-pressed', String(button.classList.contains('active')));
      });
    });

    panel.querySelectorAll('[data-css-property]').forEach(element => {
      const property = element.dataset.cssProperty;
      const scope = element.dataset.scope || (element.closest('.flex-container-controls')
        ? 'container'
        : (element.closest('.flex-item-controls') ? 'item' : 'element'));
      const value = element.classList.contains('segment-btn') ? element.dataset.val : '';
      element.dataset.cssHelp = this.getCssHelp(property, scope, value);
      if (!element.hasAttribute('aria-label') && element.classList.contains('segment-btn')) {
        element.setAttribute('aria-label', `${property}: ${value}`);
      }
    });

    panel.querySelectorAll('.css-prop-label, .accordion-summary').forEach(label => {
      if (label.dataset.cssHelp) return;
      const propertyControl = label.closest('.css-prop-row') && label.closest('.css-prop-row').querySelector('[data-css-property]');
      if (propertyControl) {
        label.dataset.cssHelp = propertyControl.dataset.cssHelp;
        label.dataset.cssProperty = propertyControl.dataset.cssProperty;
      } else if (label.classList.contains('accordion-summary')) {
        label.dataset.cssHelp = `افتح هذا القسم لتعديل ${label.textContent.trim()} على العنصر المحدد. التعديلات تُحفظ في ملف CSS.`;
      }
    });

    const breakpointHelp = {
      all: 'النمط الأساسي: يُطبّق على كل الشاشات، ويمكن لنطاقات الهاتف والتابلت والديسكتوب تجاوزه.',
      '375': 'نطاق الهاتف فقط: تُحفظ التعديلات داخل @media (max-width: 767px).',
      '768': 'نطاق التابلت فقط: تُحفظ التعديلات بين 768px و1199px.',
      '1200': 'نطاق الديسكتوب فقط: تُحفظ التعديلات من 1200px فأكثر.'
    };
    const breakpointContainer = document.getElementById('breakpoints-segmented');
    if (breakpointContainer) {
      breakpointContainer.querySelectorAll('.segment-btn').forEach(button => {
        button.dataset.cssHelp = breakpointHelp[button.dataset.val] || breakpointHelp.all;
      });
    }

    // A safe fallback gives every CSS-panel control a hover explanation,
    // including older controls that do not yet have a dedicated dictionary entry.
    panel.querySelectorAll('input, select, button, .css-prop-label').forEach(control => {
      if (control.dataset.cssHelp) return;
      const name = control.dataset.cssProperty || control.id || control.textContent.trim() || 'CSS';
      control.dataset.cssHelp = `أداة ${name}: تغيّر تنسيق العنصر المحدد، وتُحفظ النتيجة في ملف CSS ضمن نطاق الشاشة النشط.`;
    });

    /* اللوحة الجانبية التعليمية لخصائص CSS — نفس أسلوب لوحة شرح منشئ التفاعلات */
    const docPanel = document.createElement('aside');
    docPanel.id = 'css-doc-panel';
    docPanel.className = 'e13-doc-panel css-doc-panel';
    docPanel.hidden = true;
    document.body.appendChild(docPanel);

    const escapeHtml = value => String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const DOC_SELECTOR = '[data-css-help],[data-css-property]';

    const show = (target, origin) => {
      if (!target) return;
      const property = target.dataset.cssProperty || '';
      const helpText = target.dataset.cssHelp || (property ? this.getCssHelp(property, target.dataset.scope || 'element') : '');
      if (!property && !helpText) return;
      const details = CSS_DOC_DETAILS[property] || null;
      const title = details && details.title ? details.title : (property || 'خاصية CSS');
      /* القيمة الحية: الزر اللي واقف عليه ← الزر النشط حالياً ← قيمة الـ select */
      const hoverValue = (() => {
        const source = origin && origin.closest ? origin : target;
        const segment = source.closest ? source.closest('.segment-btn') : null;
        if (segment && segment.dataset.val !== undefined) return segment.dataset.val;
        const activeSegment = target.querySelector ? target.querySelector('.segment-btn.active') : null;
        if (activeSegment && activeSegment.dataset.val !== undefined) return activeSegment.dataset.val;
        if (source.tagName === 'SELECT') return source.value;
        if (target.tagName === 'SELECT') return target.value;
        const innerSelect = target.querySelector ? target.querySelector('select') : null;
        if (innerSelect) return innerSelect.value;
        return '';
      })();
      const valueEntry = hoverValue && details && details.values
        ? details.values.find(entry => entry[0] === hoverValue)
        : null;
      const valuesHtml = details && details.values && details.values.length
        ? `<div class="css-doc-values-title">كل القيم:</div><ul class="e13-doc-list css-doc-values">${details.values.map(([value, meaning]) => `<li${value === hoverValue ? ' class="is-active"' : ''}><code dir="ltr">${escapeHtml(value)}</code> — ${escapeHtml(meaning)}</li>`).join('')}</ul>`
        : '';
      let exampleHtml = '';
      if (hoverValue && property) {
        /* مثال حي يعكس القيمة اللي إنت عليها الآن، مش القيمة الافتراضية */
        const liveNote = valueEntry ? valueEntry[1] : '';
        exampleHtml = `<div class="e13-doc-example is-live"><span>القيمة دي بالتحديد</span><code dir="ltr">${escapeHtml(property)}: ${escapeHtml(hoverValue)};</code>${liveNote ? `<p>${escapeHtml(liveNote)}</p>` : (details && details.example && details.example.note ? `<p>${escapeHtml(details.example.note)}</p>` : '')}</div>`;
      } else if (details && details.example) {
        exampleHtml = `<div class="e13-doc-example"><span>مثال</span><code dir="ltr">${escapeHtml(details.example.code)}</code>${details.example.note ? `<p>${escapeHtml(details.example.note)}</p>` : ''}</div>`;
      }
      const whenHtml = details && details.when ? `<p class="e13-doc-when"><i class="fas fa-hand-point-left"></i> ${escapeHtml(details.when)}</p>` : '';
      docPanel.innerHTML = `<header><i class="fas fa-graduation-cap"></i><strong>${escapeHtml(title)}</strong></header>${helpText ? `<p>${escapeHtml(helpText)}</p>` : ''}${valuesHtml}${exampleHtml}${whenHtml}`;
      docPanel.style.visibility = 'hidden';
      docPanel.hidden = false;
      const panelRect = panel.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      let left = panelRect.left - 294;
      if (left < 8) left = 8;
      let top = targetRect.top - 10;
      const maxTop = window.innerHeight - docPanel.offsetHeight - 10;
      if (top > maxTop) top = maxTop;
      if (top < 10) top = 10;
      docPanel.style.left = `${left}px`;
      docPanel.style.top = `${top}px`;
      docPanel.style.visibility = '';
    };
    const hide = () => { docPanel.hidden = true; };

    panel.addEventListener('pointerover', event => {
      const target = event.target.closest(DOC_SELECTOR);
      if (target && panel.contains(target)) show(target, event.target);
    });
    /* تغيير الاختيار (select أو زر segmented) يحدّث الشرح فوراً للقيمة الجديدة */
    panel.addEventListener('change', event => {
      if (docPanel.hidden) return;
      const target = event.target.closest(DOC_SELECTOR);
      if (target) show(target, event.target);
    });
    panel.addEventListener('click', event => {
      if (docPanel.hidden) return;
      const segment = event.target.closest('.segment-btn');
      if (!segment) return;
      const target = segment.closest(DOC_SELECTOR);
      if (target) setTimeout(() => show(target, segment), 0);
    });
    panel.addEventListener('pointerout', event => {
      const from = event.target.closest(DOC_SELECTOR);
      const to = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest(DOC_SELECTOR) : null;
      if (from && from !== to) hide();
    });
    document.addEventListener('scroll', event => {
      if (docPanel.hidden) return;
      if (event.target && event.target.closest && event.target.closest('#css-doc-panel')) return;
      hide();
    }, true);
    panel.addEventListener('focusin', event => show(event.target.closest(DOC_SELECTOR), event.target));
    panel.addEventListener('focusout', hide);
  }

  getCssHelp(property, scope = 'element', value = '') {
    const descriptions = {
      display: 'يحدد طريقة عرض العنصر. flex يجعل العنصر حاوية تنظم أبناءه المباشرين.',
      'flex-direction': 'خاصية حاوية Flex: تحدد محور وترتيب الأبناء داخل العنصر المختار.',
      'flex-wrap': 'خاصية حاوية Flex: تسمح لأبناء العنصر بالانتقال إلى سطر أو عمود جديد.',
      'justify-content': 'خاصية حاوية Flex: توزع الأبناء على المحور الرئيسي.',
      'align-items': 'خاصية حاوية Flex: تحاذي الأبناء على المحور المتقاطع.',
      'align-content': 'خاصية حاوية Flex: توزع صفوف flex عند وجود wrap ومساحة إضافية.',
      gap: 'خاصية الحاوية: تضيف مسافة بين الأبناء دون إضافة هوامش خارجية.',
      'row-gap': 'المسافة بين صفوف الأبناء داخل الحاوية.',
      'column-gap': 'المسافة بين أعمدة الأبناء داخل الحاوية.',
      flex: 'خاصية عنصر Flex ابن: اختصار grow وshrink وbasis، وتُطبّق على العنصر المحدد نفسه.',
      'flex-grow': 'خاصية عنصر Flex ابن: مقدار تمدده لملء المساحة المتاحة.',
      'flex-shrink': 'خاصية عنصر Flex ابن: مقدار انكماشه عند ضيق المساحة.',
      'flex-basis': 'خاصية عنصر Flex ابن: حجمه الابتدائي قبل توزيع المساحة.',
      order: 'خاصية عنصر Flex ابن: ترتيبه البصري داخل الحاوية دون تغيير DOM.',
      'align-self': 'خاصية عنصر Flex ابن: تتجاوز align-items لهذا العنصر فقط.',
      width: 'عرض العنصر. يقبل px و% وrem وvw وcalc() وclamp() وغيرها.',
      height: 'ارتفاع العنصر. استخدم auto للمحتوى أو قيمة بوحدة واضحة.',
      'min-width': 'أقل عرض مسموح للعنصر.',
      'max-width': 'أكبر عرض مسموح؛ مفيد للتصميم المتجاوب.',
      'min-height': 'أقل ارتفاع مسموح للعنصر.',
      'max-height': 'أكبر ارتفاع مسموح للعنصر.',
      'aspect-ratio': 'يحافظ على نسبة العرض إلى الارتفاع، مثل 16 / 9.',
      overflow: 'يتحكم فيما يحدث للمحتوى الزائد عن أبعاد العنصر.',
      'box-sizing': 'border-box يُدخل padding وborder ضمن العرض والارتفاع المحددين.',
      position: 'يحدد نظام تموضع العنصر؛ offsets لا تعمل مع static.',
      top: 'إزاحة العنصر من الأعلى عندما تكون position غير static.',
      right: 'إزاحة العنصر من اليمين عندما تكون position غير static.',
      bottom: 'إزاحة العنصر من الأسفل عندما تكون position غير static.',
      left: 'إزاحة العنصر من اليسار عندما تكون position غير static.',
      'z-index': 'ترتيب الطبقات للعناصر المتموضعة.',
      'background-image': 'صورة خلفية من رابط أو ملف؛ تُحفظ كقاعدة داخل CSS.',
      'background-size': 'حجم صورة الخلفية؛ cover يملأ المساحة وcontain يعرض الصورة كاملة.',
      'background-position': 'موضع صورة الخلفية داخل العنصر.',
      'background-repeat': 'يتحكم في تكرار صورة الخلفية.',
      'object-fit': 'طريقة احتواء صورة أو فيديو داخل أبعاده المحددة.',
      filter: 'مؤثر بصري مثل blur أو brightness يُطبق على العنصر.'
    };
    let help = descriptions[property] || `خاصية CSS ${property}: تُطبّق على العنصر المحدد وتُحفظ في ملف CSS.`;
    if (scope === 'container') help = `على الحاوية/الأب: ${help}`;
    if (scope === 'item') help = `على الابن المحدد نفسه (ويُفضّل أن يكون أبوه display:flex): ${help}`;
    if (value) help += ` القيمة الحالية: ${value}.`;
    return help;
  }

  // Setup event listeners for contextual HTML editors (Image, Text, Link)
  setupElementEditors() {
    // 1. Image Editor Listeners
    const imgSrc = document.getElementById('prop-img-src');
    const imgAlt = document.getElementById('prop-img-alt');
    const imgFit = document.getElementById('prop-img-fit');
    const imgFile = document.getElementById('prop-img-file');
    const imgFileBtn = document.getElementById('prop-img-file-btn');
    const imgApply = document.getElementById('prop-img-apply');
    const imgCancel = document.getElementById('prop-img-cancel');
    const imgRemove = document.getElementById('prop-img-remove');
    const imgReplace = document.getElementById('prop-img-replace');

    if (imgSrc) imgSrc.addEventListener('input', () => this.applyLivePreview());
    if (imgAlt) imgAlt.addEventListener('input', () => this.applyLivePreview());
    if (imgFit) imgFit.addEventListener('change', () => this.applyLivePreview());

    if (imgFileBtn && imgFile) {
      imgFileBtn.addEventListener('click', () => imgFile.click());
    }
    if (imgReplace && imgFile) {
      imgReplace.addEventListener('click', () => imgFile.click());
    }

    if (imgFile) {
      imgFile.addEventListener('change', () => {
        const file = imgFile.files[0];
        if (!file) return;

        const warningDiv = document.getElementById('prop-img-size-warning');
        if (warningDiv) {
          if (file.size > 500 * 1024) {
            warningDiv.style.display = 'block';
          } else {
            warningDiv.style.display = 'none';
          }
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          if (imgSrc) {
            imgSrc.value = e.target.result;
            this.applyLivePreview();
            this.commitChanges('Choose Image File');
          }
        };
        reader.readAsDataURL(file);
      });
    }

    if (imgRemove) {
      imgRemove.addEventListener('click', () => {
        if (imgSrc) {
          imgSrc.value = '';
          this.applyLivePreview();
          this.commitChanges('Remove Image');
        }
      });
    }

    if (imgApply) {
      imgApply.addEventListener('click', () => {
        this.commitChanges('Apply Image Editor Changes');
      });
    }

    if (imgCancel) {
      imgCancel.addEventListener('click', () => {
        this.cancelChanges();
      });
    }

    // 2. Text Editor Listeners
    const textContent = document.getElementById('prop-text-content');
    const textMode = document.getElementById('prop-text-mode');
    const textApply = document.getElementById('prop-text-apply');
    const textCancel = document.getElementById('prop-text-cancel');
    const textRestore = document.getElementById('prop-text-restore');

    if (textContent) {
      textContent.addEventListener('input', () => this.applyLivePreview());
      textContent.addEventListener('keydown', (e) => {
        // Prevent Ctrl+Z propagation from triggering application undo/redo while typing
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.stopPropagation();
        }
      });
    }

    if (textMode) {
      textMode.addEventListener('change', () => {
        const warningDiv = document.getElementById('prop-text-html-warning');
        if (warningDiv) {
          warningDiv.style.display = textMode.value === 'innerHTML' ? 'block' : 'none';
        }
        this.applyLivePreview();
      });
    }

    if (textRestore) {
      textRestore.addEventListener('click', () => {
        if (this.selectedElement && textContent) {
          textContent.value = this.selectedElement.textContent || '';
          this.applyLivePreview();
        }
      });
    }

    if (textApply) {
      textApply.addEventListener('click', () => {
        this.commitChanges('Apply Text Content Changes');
      });
    }

    if (textCancel) {
      textCancel.addEventListener('click', () => {
        this.cancelChanges();
      });
    }

    // 3. Link Editor Listeners
    const linkText = document.getElementById('prop-link-text');
    const linkHref = document.getElementById('prop-link-href');
    const linkTarget = document.getElementById('prop-link-target');
    const linkRel = document.getElementById('prop-link-rel');
    const linkType = document.getElementById('prop-link-type');
    const linkApply = document.getElementById('prop-link-apply');
    const linkCancel = document.getElementById('prop-link-cancel');
    const linkTest = document.getElementById('prop-link-test');

    if (linkText) linkText.addEventListener('input', () => this.applyLivePreview());
    if (linkHref) linkHref.addEventListener('input', () => this.applyLivePreview());
    if (linkRel) linkRel.addEventListener('input', () => this.applyLivePreview());

    if (linkTarget) {
      linkTarget.addEventListener('change', () => {
        if (linkTarget.value === '_blank' && linkRel && !linkRel.value.trim()) {
          linkRel.value = 'noopener noreferrer';
        }
        this.applyLivePreview();
      });
    }

    if (linkType) {
      linkType.addEventListener('change', () => {
        if (!linkHref) return;
        let val = linkHref.value.trim();
        const type = linkType.value;
        if (type === 'mailto') {
          if (val && !val.startsWith('mailto:')) val = `mailto:${val}`;
        } else if (type === 'tel') {
          if (val && !val.startsWith('tel:')) val = `tel:${val}`;
        } else if (type === 'section') {
          if (val && !val.startsWith('#')) val = `#${val}`;
        } else if (type === 'external') {
          if (val && !val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('//') && !val.startsWith('#')) {
            val = `https://${val}`;
          }
        }
        linkHref.value = val;
        this.applyLivePreview();
      });
    }

    if (linkTest) {
      linkTest.addEventListener('click', () => {
        if (!linkHref) return;
        const href = linkHref.value.trim();
        if (!href) {
          alert('الرجاء إدخال رابط أولاً لتجربته.');
          return;
        }
        if (href.toLowerCase().startsWith('javascript:')) {
          alert('الروابط التي تحتوي على javascript: محظورة لأسباب أمنية.');
          return;
        }
        if (confirm(`هل تريد تجربة فتح الرابط (${href}) في تبويب جديد؟`)) {
          window.open(href, '_blank');
        }
      });
    }

    if (linkApply) {
      linkApply.addEventListener('click', () => {
        this.commitChanges('Apply Link Editor Changes');
      });
    }

    if (linkCancel) {
      linkCancel.addEventListener('click', () => {
        this.cancelChanges();
      });
    }
  }

  // Backup element properties on selection
  backupSelectedElement(element) {
    if (!element) {
      this.imgBackup = null;
      this.txtBackup = null;
      this.lnkBackup = null;
      return;
    }
    const tag = element.tagName.toLowerCase();

    if (tag === 'img') {
      this.imgBackup = {
        src: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        objectFit: this.app.styleEngine.getStyleValue(element, 'object-fit', {
          breakpoint: this.activeBreakpoint,
          pseudo: this.currentPseudoState
        }) || window.getComputedStyle(element).objectFit || ''
      };
    } else {
      this.imgBackup = null;
    }

    const isText = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'label', 'li', 'a'].includes(tag);
    if (isText) {
      this.txtBackup = {
        content: element.innerHTML || '',
        textContent: element.textContent || '',
        innerText: element.innerText || ''
      };
    } else {
      this.txtBackup = null;
    }

    if (tag === 'a') {
      this.lnkBackup = {
        textContent: element.textContent || '',
        href: element.getAttribute('href') || '',
        target: element.getAttribute('target') || '',
        rel: element.getAttribute('rel') || ''
      };
    } else {
      this.lnkBackup = null;
    }
  }

  // Populate editor inputs with current properties
  populateEditorFields(element) {
    if (!element) return;
    const tag = element.tagName.toLowerCase();

    // 1. Image fields
    if (tag === 'img') {
      const srcInput = document.getElementById('prop-img-src');
      const altInput = document.getElementById('prop-img-alt');
      const fitSelect = document.getElementById('prop-img-fit');
      const previewImg = document.getElementById('prop-img-preview');
      const previewPlaceholder = document.getElementById('prop-img-preview-placeholder');
      const warningDiv = document.getElementById('prop-img-size-warning');

      const src = element.getAttribute('src') || '';
      if (srcInput) srcInput.value = src;
      if (altInput) altInput.value = element.getAttribute('alt') || '';
      if (fitSelect) fitSelect.value = this.app.styleEngine.getStyleValue(element, 'object-fit', {
        breakpoint: this.activeBreakpoint,
        pseudo: this.currentPseudoState
      }) || window.getComputedStyle(element).objectFit || 'cover';

      if (previewImg && previewPlaceholder) {
        if (src) {
          previewImg.src = src;
          previewImg.style.display = 'block';
          previewPlaceholder.style.display = 'none';
        } else {
          previewImg.style.display = 'none';
          previewPlaceholder.style.display = 'block';
        }
      }
      if (warningDiv) {
        if (src.startsWith('data:') && src.length > 500 * 1024 * 1.33) {
          warningDiv.style.display = 'block';
        } else {
          warningDiv.style.display = 'none';
        }
      }
    }

    // 2. Text fields
    const isText = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'label', 'li', 'a'].includes(tag);
    if (isText && tag !== 'img') {
      const textVal = document.getElementById('prop-text-content');
      const textMode = document.getElementById('prop-text-mode');
      const warningDiv = document.getElementById('prop-text-html-warning');

      if (textMode) textMode.value = 'textContent';
      if (textVal) textVal.value = element.textContent || '';
      if (warningDiv) warningDiv.style.display = 'none';
    }

    // 3. Link fields
    if (tag === 'a') {
      const linkText = document.getElementById('prop-link-text');
      const linkHref = document.getElementById('prop-link-href');
      const linkTarget = document.getElementById('prop-link-target');
      const linkRel = document.getElementById('prop-link-rel');
      const linkType = document.getElementById('prop-link-type');

      const href = element.getAttribute('href') || '';
      const textVal = element.textContent || '';
      const target = element.getAttribute('target') || '_self';
      const rel = element.getAttribute('rel') || '';

      if (linkText) linkText.value = textVal;
      if (linkHref) linkHref.value = href;
      if (linkTarget) linkTarget.value = target;
      if (linkRel) linkRel.value = rel;
      if (linkType) linkType.value = this.detectLinkType(href);
    }
  }

  // Detect link type from href value
  detectLinkType(href) {
    if (!href) return 'external';
    if (href.startsWith('mailto:')) return 'mailto';
    if (href.startsWith('tel:')) return 'tel';
    if (href.startsWith('#')) return 'section';
    if (/^(https?:)?\/\//i.test(href)) return 'external';
    return 'internal';
  }

  // Apply real-time preview to element on canvas without saving history state
  applyLivePreview() {
    if (!this.selectedElement) return;
    const tag = this.selectedElement.tagName.toLowerCase();

    // 1. Image
    if (tag === 'img') {
      const srcInput = document.getElementById('prop-img-src');
      const altInput = document.getElementById('prop-img-alt');
      const fitSelect = document.getElementById('prop-img-fit');
      if (srcInput) this.selectedElement.setAttribute('src', srcInput.value);
      if (altInput) this.selectedElement.setAttribute('alt', altInput.value);
      if (fitSelect) this.applyStyle('object-fit', fitSelect.value);

      // Update thumbnail preview
      const previewImg = document.getElementById('prop-img-preview');
      const previewPlaceholder = document.getElementById('prop-img-preview-placeholder');
      if (previewImg && previewPlaceholder) {
        if (srcInput && srcInput.value) {
          previewImg.src = srcInput.value;
          previewImg.style.display = 'block';
          previewPlaceholder.style.display = 'none';
        } else {
          previewImg.style.display = 'none';
          previewPlaceholder.style.display = 'block';
        }
      }
    }

    // 2. Text
    const isText = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'label', 'li', 'a'].includes(tag);
    if (isText && tag !== 'img') {
      const textVal = document.getElementById('prop-text-content');
      const textMode = document.getElementById('prop-text-mode');
      if (textVal && textMode) {
        if (textMode.value === 'innerHTML') {
          this.selectedElement.innerHTML = textVal.value;
        } else if (textMode.value === 'innerText') {
          this.selectedElement.innerText = textVal.value;
        } else {
          this.selectedElement.textContent = textVal.value;
        }
      }
    }

    // 3. Link
    if (tag === 'a') {
      const linkText = document.getElementById('prop-link-text');
      const linkHref = document.getElementById('prop-link-href');
      const linkTarget = document.getElementById('prop-link-target');
      const linkRel = document.getElementById('prop-link-rel');

      if (linkText) this.selectedElement.textContent = linkText.value;
      if (linkHref) this.selectedElement.setAttribute('href', linkHref.value);
      if (linkTarget) {
        if (linkTarget.value === '_blank') {
          this.selectedElement.setAttribute('target', '_blank');
        } else {
          this.selectedElement.removeAttribute('target');
        }
      }
      if (linkRel) {
        if (linkRel.value) {
          this.selectedElement.setAttribute('rel', linkRel.value);
        } else {
          this.selectedElement.removeAttribute('rel');
        }
      }
    }

    this.app.updateHighlighter();
  }

  // Commit changes permanently and record history state
  commitChanges(actionName) {
    this.app.syncAll();
    this.app.history.saveState(actionName);
    this.backupSelectedElement(this.selectedElement);
    this.app.showToastNotice('تم تطبيق التعديلات بنجاح');
  }

  // Revert all properties to backup state
  cancelChanges() {
    if (!this.selectedElement) return;
    const tag = this.selectedElement.tagName.toLowerCase();

    if (tag === 'img' && this.imgBackup) {
      if (this.imgBackup.src) {
        this.selectedElement.setAttribute('src', this.imgBackup.src);
      } else {
        this.selectedElement.removeAttribute('src');
      }
      if (this.imgBackup.alt) {
        this.selectedElement.setAttribute('alt', this.imgBackup.alt);
      } else {
        this.selectedElement.removeAttribute('alt');
      }
      this.applyStyle('object-fit', this.imgBackup.objectFit || '');
    }

    const isText = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'label', 'li', 'a'].includes(tag);
    if (isText && tag !== 'img' && this.txtBackup) {
      this.selectedElement.innerHTML = this.txtBackup.content;
    }

    if (tag === 'a' && this.lnkBackup) {
      this.selectedElement.textContent = this.lnkBackup.textContent;
      if (this.lnkBackup.href) {
        this.selectedElement.setAttribute('href', this.lnkBackup.href);
      } else {
        this.selectedElement.removeAttribute('href');
      }
      if (this.lnkBackup.target) {
        this.selectedElement.setAttribute('target', this.lnkBackup.target);
      } else {
        this.selectedElement.removeAttribute('target');
      }
      if (this.lnkBackup.rel) {
        this.selectedElement.setAttribute('rel', this.lnkBackup.rel);
      } else {
        this.selectedElement.removeAttribute('rel');
      }
    }

    this.populateEditorFields(this.selectedElement);

    // Sync views without saving new progress history
    this.app.domTree.render();
    this.app.editor.refreshEditorContent();
    this.app.saveProgress(false);
    this.app.updateHighlighter();
    this.app.showToastNotice('تم إلغاء التعديلات بنجاح');
  }

  // Read properties of selected element to update the UI panel
  updatePanelFor(element) {
    const selectionChanged = element !== this.selectedElement;
    this.selectedElement = element;
    this.renderAncestryBar(element);
    
    // Rerender breakpoints segmented control to keep custom ones synced
    this.renderBreakpointsUI();
    
    if (!element) {
      this.currentPseudoState = 'normal';
      if (this.app.styleEngine) this.app.styleEngine.setContext({ pseudo: 'normal', element: null });
      this.selectorDisplay.textContent = 'لا يوجد عنصر محدد';
      Object.keys(this.bmValues).forEach(k => this.bmValues[k].textContent = '0');
      this.bmDimensions.textContent = '0 × 0';
      document.querySelectorAll('#css-properties-container .segmented-control:not(#breakpoints-segmented):not(#units-segmented) .segment-btn')
        .forEach(button => {
          button.classList.remove('active');
          button.setAttribute('aria-pressed', 'false');
        });
      
      const imageEditor = document.getElementById('accordion-image-editor');
      const textEditor = document.getElementById('accordion-text-editor');
      const linkEditor = document.getElementById('accordion-link-editor');
      if (imageEditor) imageEditor.style.display = 'none';
      if (textEditor) textEditor.style.display = 'none';
      if (linkEditor) linkEditor.style.display = 'none';
      /* لوحتا الظلال وفلاتر الصور كانوا بيفضلوا ظاهرين بصفوف العنصر المحذوف،
         والضغط عليهم بيوحي إن التعديل بيتحفظ وهو مش بيتحفظ. */
      this.updateBoxShadowPanel(null);
      const mediaFilters = document.getElementById('accordion-media-filters');
      if (mediaFilters) mediaFilters.style.display = 'none';
      const itemPanel = document.querySelector('.flex-item-controls');
      if (itemPanel) {
        itemPanel.classList.add('is-disabled-context');
        itemPanel.querySelectorAll('input, select, button').forEach(control => { control.disabled = true; });
      }
      const itemStatus = document.getElementById('flex-item-context-status');
      if (itemStatus) {
        itemStatus.classList.remove('valid');
        itemStatus.textContent = 'اختر ابناً داخل حاوية Flex.';
      }
      return;
    }

    if (selectionChanged) {
      this.currentPseudoState = 'normal';
      const pseudoRow = document.getElementById('pseudo-states-row');
      if (pseudoRow) {
        pseudoRow.querySelectorAll('.pseudo-btn').forEach(button => {
          const active = button.dataset.state === 'normal';
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
      }
    }
    this.app.styleEngine.setContext({
      breakpoint: this.activeBreakpoint,
      pseudo: this.currentPseudoState,
      element
    });
    
    // Update Selector display string
    let selector = this.app.styleEngine.ensureElementSelector(element);
    const rawClassName = element.getAttribute ? (element.getAttribute('class') || '') : '';
    if (rawClassName) {
      /* مطابقة الكلاس كاملاً لا كجزء نصي: الاستبدال بالـ substring كان يشوّه
         كلاسات المستخدم مثل my-selected-element-x. */
      const editorOnlyClasses = new Set(['selected-element', 'drag-hover-container', 'dom-tree-hover-preview', 'shake-reject']);
      const cleanClasses = rawClassName
        .split(/\s+/)
        .filter(className => className && !editorOnlyClasses.has(className));
      if (cleanClasses.length) {
        selector += `.${cleanClasses.join('.')}`;
      }
    }
    this.selectorDisplay.textContent = selector + this.app.styleEngine.pseudoSuffix(this.currentPseudoState);

    // Get computed styles
    const computed = window.getComputedStyle(element);
    const read = (property, fallback = '') => this.getStyleValue(property, computed.getPropertyValue(property).trim() || fallback);
    
    // Populate Box Model margins & paddings
    Object.keys(this.bmValues).forEach(prop => {
      const computedValue = computed.getPropertyValue(prop);
      let numValue = computedValue;
      if (computedValue.includes('px')) {
        numValue = parseInt(computedValue) || 0;
      }
      this.bmValues[prop].textContent = numValue;
    });
    
    // Update center width/height
    const rect = element.getBoundingClientRect();
    this.bmDimensions.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

    // Update Segmented Controls active classes
    const displayValue = read('display', computed.display);
    this.syncSegmentActive('display-segmented', displayValue);
    this.syncSegmentActive('flex-dir-segmented', read('flex-direction', computed.flexDirection));
    this.syncSegmentActive('flex-wrap-segmented', read('flex-wrap', computed.flexWrap));
    this.syncSegmentActive('justify-segmented', read('justify-content', computed.justifyContent));
    this.syncSegmentActive('align-segmented', read('align-items', computed.alignItems));
    this.syncSegmentActive('align-content-segmented', read('align-content', computed.alignContent));
    this.syncSegmentActive('box-sizing-segmented', read('box-sizing', computed.boxSizing));
    const positionValue = read('position', computed.position);
    this.syncSegmentActive('position-segmented', positionValue);
    this.updatePositionFieldsState(positionValue);
    this.syncSegmentActive('font-weight-segmented', read('font-weight', computed.fontWeight));
    this.syncSegmentActive('text-align-segmented', read('text-align', computed.textAlign));
    
    // Expand flex settings only if display is flex
    const flexSection = document.querySelector('.flex-only-section');
    const flexIndicator = document.getElementById('flex-status-indicator');
    if (displayValue === 'flex' || displayValue === 'inline-flex') {
      flexSection.style.display = 'flex';
      flexIndicator.textContent = displayValue;
      
      // Update gap slider
      const gapVal = parseInt(computed.gap) || 0;
      this.setSliderVal('prop-gap-slider', 'prop-gap-val', gapVal, 'px');
    } else {
      flexSection.style.display = 'none';
      flexIndicator.textContent = displayValue;
    }

    this.setFieldValue('prop-row-gap', read('row-gap', computed.rowGap));
    this.setFieldValue('prop-column-gap', read('column-gap', computed.columnGap));

    // Flex item context and values (properties apply to this child, not its parent).
    const parent = element.parentElement;
    const parentDisplay = parent && parent !== this.app.canvas ? window.getComputedStyle(parent).display : '';
    const parentIsFlex = parentDisplay === 'flex' || parentDisplay === 'inline-flex';
    const itemPanel = document.querySelector('.flex-item-controls');
    const itemStatus = document.getElementById('flex-item-context-status');
    if (itemPanel) {
      itemPanel.classList.toggle('is-disabled-context', !parentIsFlex);
      itemPanel.querySelectorAll('input, select, button').forEach(control => {
        control.disabled = !parentIsFlex;
      });
    }
    if (itemStatus) {
      itemStatus.classList.toggle('valid', parentIsFlex);
      itemStatus.textContent = parentIsFlex
        ? `الأب ${parent.tagName.toLowerCase()} يعمل بـ ${parentDisplay} — الخصائص التالية ستُضاف للابن المحدد.`
        : 'هذه خصائص للابن نفسه. اختر عنصراً أبوه display:flex أو inline-flex لتفعيلها.';
    }
    this.syncSegmentActive('flex-preset-segmented', read('flex', computed.flex));
    this.syncSegmentActive('align-self-segmented', read('align-self', computed.alignSelf));
    this.setFieldValue('prop-flex-value', read('flex', computed.flex));
    this.setFieldValue('prop-flex-grow', read('flex-grow', computed.flexGrow));
    this.setFieldValue('prop-flex-shrink', read('flex-shrink', computed.flexShrink));
    this.setFieldValue('prop-flex-basis', read('flex-basis', computed.flexBasis));
    this.setFieldValue('prop-flex-order', read('order', computed.order));
    
    // Sizing select fields
    this.setFieldValue('prop-width-select', read('width', computed.width || 'auto'));
    this.setFieldValue('prop-height-select', read('height', computed.height || 'auto'));
    this.setFieldValue('prop-min-width', read('min-width', computed.minWidth));
    this.setFieldValue('prop-max-width', read('max-width', computed.maxWidth));
    this.setFieldValue('prop-min-height', read('min-height', computed.minHeight));
    this.setFieldValue('prop-max-height', read('max-height', computed.maxHeight));
    this.setFieldValue('prop-aspect-ratio', read('aspect-ratio', computed.aspectRatio || 'auto'));
    this.setSelectValue('prop-overflow', read('overflow', computed.overflow));

    // Positions offsets
    this.setFieldValue('prop-top', read('top', computed.top));
    this.setFieldValue('prop-right', read('right', computed.right));
    this.setFieldValue('prop-bottom', read('bottom', computed.bottom));
    this.setFieldValue('prop-left', read('left', computed.left));
    const zIndexValue = read('z-index', computed.zIndex);
    this.setFieldValue('prop-z-index', zIndexValue === 'auto' ? '' : zIndexValue);
    this.setSelectValue('prop-float', read('float', computed.cssFloat || 'none'));

    // Colors
    const textHex = this.rgbToHex(computed.color);
    this.setFieldValue('color-hex-text', textHex);
    this.setFieldValue('prop-color', textHex);
    
    const bgHex = this.rgbToHex(computed.backgroundColor);
    this.setFieldValue('bg-hex-text', bgHex);
    this.setFieldValue('prop-bg', bgHex);
    const backgroundImage = read('background-image', computed.backgroundImage);
    const backgroundUrl = backgroundImage && backgroundImage !== 'none'
      ? backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
      : '';
    this.setFieldValue('prop-bg-image-url', backgroundUrl);
    this.setSelectValue('prop-bg-size', read('background-size', computed.backgroundSize || 'auto'));
    this.setSelectValue('prop-bg-position', read('background-position', computed.backgroundPosition || 'center center'));
    this.setSelectValue('prop-bg-repeat', read('background-repeat', computed.backgroundRepeat || 'repeat'));
    this.setSelectValue('prop-bg-attachment', read('background-attachment', computed.backgroundAttachment || 'scroll'));

    // Border Radius values
    this.setFieldValue('prop-radius-1', parseInt(computed.borderTopLeftRadius) || 0);
    this.setFieldValue('prop-radius-2', parseInt(computed.borderTopRightRadius) || 0);
    this.setFieldValue('prop-radius-3', parseInt(computed.borderBottomRightRadius) || 0);
    this.setFieldValue('prop-radius-4', parseInt(computed.borderBottomLeftRadius) || 0);
    
    // Border widths
    this.setFieldValue('prop-border-width', computed.borderWidth || '0px');
    this.setSelectValue('prop-border-style', computed.borderStyle === 'none' ? 'none' : computed.borderStyle);
    this.setFieldValue('prop-border-color', this.rgbToHex(computed.borderColor));

    // Typography
    this.setSliderVal('prop-font-size-slider', 'prop-font-size-val', parseInt(computed.fontSize) || 16, 'px');
    this.setSelectValue('prop-font-family', read('font-family', computed.fontFamily));
    this.setFieldValue('prop-line-height', read('line-height', computed.lineHeight || 'normal'));
    this.setFieldValue('prop-letter-spacing', read('letter-spacing', computed.letterSpacing || 'normal'));

    // Transitions
    const duration = parseInt(computed.transitionDuration) * 1000 || 300;
    this.setSliderVal('prop-transition-duration', 'prop-transition-duration-val', duration, 'ms');
    this.setSelectValue('prop-transition-timing', computed.transitionTimingFunction.split('(')[0] || 'ease');
    this.setSelectValue('prop-transition-property', computed.transitionProperty || 'all');

    // Contextual Panel: Media / Image Filters (show only for images)
    const mediaAccordion = document.getElementById('accordion-media-filters');
    const isImage = element.tagName.toLowerCase() === 'img';
    
    if (isImage) {
      mediaAccordion.style.display = 'block';
      this.syncSegmentActive('object-fit-segmented', computed.objectFit || 'cover');
      
      // Filter values
      const blurVal = this.parseFilterValue(computed.filter, 'blur', 'px') || 0;
      this.setSliderVal('prop-blur-slider', 'prop-blur-val', blurVal, 'px');
      
      const brightnessVal = this.parseFilterValue(computed.filter, 'brightness', '%') || 100;
      this.setSliderVal('prop-brightness-slider', 'prop-brightness-val', brightnessVal, '%');
      
      this.setSelectValue('prop-mask', read('mask', computed.mask || 'none'));
    } else {
      mediaAccordion.style.display = 'none';
    }

    // Phase D2: Toggling and populating Image Editor, Text Content Editor, and Link Editor
    const imageEditor = document.getElementById('accordion-image-editor');
    const textEditor = document.getElementById('accordion-text-editor');
    const linkEditor = document.getElementById('accordion-link-editor');

    const tagName = element.tagName.toLowerCase();
    const isLink = tagName === 'a';
    const isText = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'label', 'li', 'figcaption'].includes(tagName) || (element.children.length === 0 && element.textContent.trim().length > 0);

    // Call backup and populate methods
    this.backupSelectedElement(element);
    this.populateEditorFields(element);

    // Show/hide Image Editor
    if (imageEditor) {
      imageEditor.style.display = isImage ? 'block' : 'none';
    }

    // Show/hide Text Editor (exclude images and links to avoid redundancy)
    if (textEditor) {
      textEditor.style.display = (isText && !isImage && !isLink) ? 'block' : 'none';
    }

    // Show/hide Link Editor
    if (linkEditor) {
      linkEditor.style.display = isLink ? 'block' : 'none';
    }
    
    this.updateBoxShadowPanel(element);
  }

  // Helpers to synchronize states
  syncSegmentActive(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.querySelectorAll('.segment-btn').forEach(btn => {
      const active = btn.dataset.val === String(value);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  setSliderVal(sliderId, valId, value, suffix) {
    const slider = document.getElementById(sliderId);
    const text = document.getElementById(valId);
    if (slider && text) {
      slider.value = value;
      text.textContent = value + suffix;
    }
  }

  setSelectValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  setFieldValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  camelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  rgbToHex(rgb) {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return '#FFFFFF';
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d\.]+)?\)$/);
    if (!match) return '#FFFFFF';
    
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return ("#" + hex(match[1]) + hex(match[2]) + hex(match[3])).toUpperCase();
  }

  parseFilterValue(filterStr, name, suffix) {
    if (!filterStr || filterStr === 'none') return null;
    const regex = new RegExp(`${name}\\(([^\\)]+)\\)`);
    const match = filterStr.match(regex);
    if (!match) return null;
    
    const val = match[1].replace(suffix, '');
    return parseFloat(val);
  }

  // Box Shadow Editor
  setupBoxShadow() {
    const btnAdd = document.getElementById('add-shadow-layer');
    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.selectedElement) {
          this.app.showToastNotice('اختر عنصراً أولاً لإضافة ظل له.');
          return;
        }
        
        let shadowVal = this.getStyleValue('box-shadow', '').trim();
        let layers = this.splitShadows(shadowVal).map(s => this.parseSingleShadow(s)).filter(Boolean);
        
        // Add a default shadow layer
        layers.push({
          inset: false,
          x: '0px',
          y: '4px',
          blur: '8px',
          spread: '0px',
          color: 'rgba(0,0,0,0.15)',
          active: true
        });
        
        const newShadowVal = this.rebuildBoxShadowString(layers);
        this.applyStyle('box-shadow', newShadowVal);
        this.updateBoxShadowPanel(this.selectedElement);
        this.app.showToastNotice('تمت إضافة طبقة ظل جديدة.');
      });
    }
  }

  // Splits comma-separated shadows safely (ignoring commas inside parentheses)
  splitShadows(str) {
    if (!str || str === 'none') return [];
    const parts = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;
      if (char === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  // Parses a single shadow rule string
  parseSingleShadow(shadowPart) {
    let str = shadowPart.trim();
    if (!str || str === 'none') return null;
    
    let inset = false;
    if (str.includes('inset')) {
      inset = true;
      str = str.replace('inset', '').trim();
    }
    
    // Extract color (rgb, rgba, hex, or named color)
    let color = 'rgba(0, 0, 0, 0.15)';
    // Regex for rgb/rgba or hex color
    const colorRegex = /(rgba?\(.*?\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/;
    const colorMatch = str.match(colorRegex);
    if (colorMatch) {
      color = colorMatch[1];
      str = str.replace(color, '').trim();
    }
    
    // Extract length values
    const lengths = str.split(/\s+/).filter(Boolean);
    const x = lengths[0] || '0px';
    const y = lengths[1] || '0px';
    const blur = lengths[2] || '0px';
    const spread = lengths[3] || '0px';
    
    return { inset, x, y, blur, spread, color, active: true };
  }

  // Rebuilds the complete box-shadow CSS value
  rebuildBoxShadowString(layers) {
    const activeLayers = layers.filter(l => l.active);
    if (activeLayers.length === 0) return 'none';
    return activeLayers.map(l => {
      let parts = [];
      if (l.inset) parts.push('inset');
      parts.push(l.x, l.y, l.blur, l.spread, l.color);
      return parts.join(' ');
    }).join(', ');
  }

  // Renders the box-shadow layers list
  updateBoxShadowPanel(element) {
    const container = document.getElementById('shadow-layers-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (!element) {
      container.innerHTML = '<span style="font-size: 9px; color: var(--text-muted); text-align: center; display: block; padding: 10px 0;">لا يوجد عنصر محدد لعرض ظلاله.</span>';
      return;
    }
    
    let shadowVal = this.getStyleValue('box-shadow', '').trim();
    if (!shadowVal || shadowVal === 'none') {
      container.innerHTML = '<span style="font-size: 9px; color: var(--text-muted); text-align: center; display: block; padding: 10px 0;">لا توجد ظلال مضافة لهذا العنصر. اضغط "+ إضافة ظل" للبدء.</span>';
      return;
    }
    
    const layers = this.splitShadows(shadowVal).map(s => this.parseSingleShadow(s)).filter(Boolean);
    if (layers.length === 0) {
      container.innerHTML = '<span style="font-size: 9px; color: var(--text-muted); text-align: center; display: block; padding: 10px 0;">لا توجد ظلال مضافة لهذا العنصر.</span>';
      return;
    }
    
    layers.forEach((layer, index) => {
      const item = document.createElement('div');
      item.style.backgroundColor = 'var(--bg-tertiary)';
      item.style.border = '1px solid var(--border-color)';
      item.style.borderRadius = 'var(--radius-sm)';
      item.style.padding = '6px 8px';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.gap = '6px';
      
      const labelText = `${layer.inset ? 'inset ' : ''}${layer.x} ${layer.y} ${layer.blur} ${layer.color}`;
      
      // Header row
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.justifyContent = 'space-between';
      header.style.fontSize = '9px';
      header.style.fontFamily = 'monospace';
      
      const leftGroup = document.createElement('div');
      leftGroup.style.display = 'flex';
      leftGroup.style.alignItems = 'center';
      leftGroup.style.gap = '6px';
      leftGroup.style.color = layer.active ? 'var(--text-main)' : 'var(--text-muted)';
      
      const eyeIcon = document.createElement('i');
      eyeIcon.className = layer.active ? 'fas fa-eye' : 'fas fa-eye-slash';
      eyeIcon.style.cursor = 'pointer';
      eyeIcon.title = layer.active ? 'تعطيل الطبقة مؤقتاً' : 'تفعيل الطبقة';
      eyeIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        layer.active = !layer.active;
        const newShadowVal = this.rebuildBoxShadowString(layers);
        this.applyStyle('box-shadow', newShadowVal);
        this.updateBoxShadowPanel(element);
      });
      
      const desc = document.createElement('span');
      desc.textContent = `ظل #${index + 1}: ${labelText.length > 25 ? labelText.substring(0, 25) + '...' : labelText}`;
      desc.style.cursor = 'pointer';
      desc.addEventListener('click', () => {
        const details = item.querySelector('.shadow-details-edit');
        if (details) {
          details.style.display = details.style.display === 'none' ? 'flex' : 'none';
        }
      });
      
      leftGroup.appendChild(eyeIcon);
      leftGroup.appendChild(desc);
      
      const rightGroup = document.createElement('div');
      rightGroup.style.display = 'flex';
      rightGroup.style.alignItems = 'center';
      rightGroup.style.gap = '6px';
      
      const editIcon = document.createElement('i');
      editIcon.className = 'fas fa-cog';
      editIcon.style.cursor = 'pointer';
      editIcon.title = 'تعديل خصائص الظل';
      editIcon.addEventListener('click', () => {
        const details = item.querySelector('.shadow-details-edit');
        if (details) {
          details.style.display = details.style.display === 'none' ? 'flex' : 'none';
        }
      });
      
      const trashIcon = document.createElement('i');
      trashIcon.className = 'fas fa-trash-alt';
      trashIcon.style.color = 'var(--accent-red)';
      trashIcon.style.cursor = 'pointer';
      trashIcon.title = 'حذف هذا الظل';
      trashIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        layers.splice(index, 1);
        const newShadowVal = this.rebuildBoxShadowString(layers);
        this.applyStyle('box-shadow', newShadowVal);
        this.updateBoxShadowPanel(element);
        this.app.showToastNotice('تم حذف طبقة الظل.');
      });
      
      rightGroup.appendChild(editIcon);
      rightGroup.appendChild(trashIcon);
      
      header.appendChild(leftGroup);
      header.appendChild(rightGroup);
      item.appendChild(header);
      
      // Expandable detailed editing drawer
      const details = document.createElement('div');
      details.className = 'shadow-details-edit';
      details.style.display = 'none'; // hidden by default
      details.style.flexDirection = 'column';
      details.style.gap = '6px';
      details.style.borderTop = '1px dashed var(--border-color)';
      details.style.paddingTop = '6px';
      details.style.marginTop = '2px';
      
      // Sliders configuration: X, Y, Blur, Spread
      const makeSlider = (label, min, max, val, unit, callback) => {
        const row = document.createElement('div');
        row.className = 'css-prop-row';
        row.style.marginBottom = '2px';
        
        const spanLabel = document.createElement('span');
        spanLabel.className = 'css-prop-label';
        spanLabel.style.fontSize = '9px';
        spanLabel.textContent = label;
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'range-with-value';
        sliderContainer.style.flex = '1';
        
        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'prop-slider';
        input.min = min;
        input.max = max;
        input.value = parseInt(val) || 0;
        
        const spanVal = document.createElement('span');
        spanVal.className = 'slider-val';
        spanVal.textContent = `${input.value}${unit}`;
        
        input.addEventListener('input', () => {
          spanVal.textContent = `${input.value}${unit}`;
          callback(input.value + unit);
        });
        
        sliderContainer.appendChild(input);
        sliderContainer.appendChild(spanVal);
        row.appendChild(spanLabel);
        row.appendChild(sliderContainer);
        return row;
      };
      
      const updateLayer = () => {
        const newShadowVal = this.rebuildBoxShadowString(layers);
        this.applyStyle('box-shadow', newShadowVal, { delay: 60 });
        
        // update summary description
        const labelTextUpdated = `${layer.inset ? 'inset ' : ''}${layer.x} ${layer.y} ${layer.blur} ${layer.color}`;
        desc.textContent = `ظل #${index + 1}: ${labelTextUpdated.length > 25 ? labelTextUpdated.substring(0, 25) + '...' : labelTextUpdated}`;
      };
      
      // Append Sliders
      details.appendChild(makeSlider('إزاحة أفقية X', -50, 50, layer.x, 'px', (v) => { layer.x = v; updateLayer(); }));
      details.appendChild(makeSlider('إزاحة رأسية Y', -50, 50, layer.y, 'px', (v) => { layer.y = v; updateLayer(); }));
      details.appendChild(makeSlider('درجة التنعيم Blur', 0, 80, layer.blur, 'px', (v) => { layer.blur = v; updateLayer(); }));
      details.appendChild(makeSlider('درجة الانتشار Spread', -30, 30, layer.spread, 'px', (v) => { layer.spread = v; updateLayer(); }));
      
      // Color selector row
      const colorRow = document.createElement('div');
      colorRow.className = 'css-prop-row';
      colorRow.style.marginBottom = '2px';
      
      const colorLabel = document.createElement('span');
      colorLabel.className = 'css-prop-label';
      colorLabel.style.fontSize = '9px';
      colorLabel.textContent = 'لون الظل';
      
      const colorValWrapper = document.createElement('div');
      colorValWrapper.style.display = 'flex';
      colorValWrapper.style.alignItems = 'center';
      colorValWrapper.style.gap = '4px';
      
      const colorHexText = document.createElement('input');
      colorHexText.type = 'text';
      colorHexText.className = 'css-prop-field';
      colorHexText.style.width = '100px';
      colorHexText.style.height = '20px';
      colorHexText.style.fontSize = '9px';
      colorHexText.style.fontFamily = 'monospace';
      colorHexText.value = layer.color;
      
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.className = 'color-picker-swatch';
      colorPicker.style.border = 'none';
      colorPicker.style.width = '20px';
      colorPicker.style.height = '20px';
      colorPicker.style.padding = '0';
      colorPicker.style.background = 'none';
      colorPicker.style.cursor = 'pointer';
      colorPicker.value = this.rgbToHex(layer.color);
      
      colorPicker.addEventListener('input', () => {
        colorHexText.value = colorPicker.value.toUpperCase();
        layer.color = colorPicker.value;
        updateLayer();
      });
      
      colorHexText.addEventListener('input', () => {
        layer.color = colorHexText.value;
        updateLayer();
        const hex = this.rgbToHex(colorHexText.value);
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
          colorPicker.value = hex;
        }
      });
      
      colorValWrapper.appendChild(colorHexText);
      colorValWrapper.appendChild(colorPicker);
      colorRow.appendChild(colorLabel);
      colorRow.appendChild(colorValWrapper);
      details.appendChild(colorRow);
      
      // Inset Checkbox row
      const insetRow = document.createElement('div');
      insetRow.className = 'css-prop-row';
      insetRow.style.marginBottom = '2px';
      
      const insetLabel = document.createElement('span');
      insetLabel.className = 'css-prop-label';
      insetLabel.style.fontSize = '9px';
      insetLabel.textContent = 'ظل داخلي (inset)';
      
      const checkboxContainer = document.createElement('label');
      checkboxContainer.className = 'checkbox-container';
      
      const insetCheckbox = document.createElement('input');
      insetCheckbox.type = 'checkbox';
      insetCheckbox.checked = layer.inset;
      insetCheckbox.addEventListener('change', () => {
        layer.inset = insetCheckbox.checked;
        updateLayer();
      });
      
      const checkboxCustom = document.createElement('span');
      checkboxCustom.className = 'checkbox-custom';
      
      checkboxContainer.appendChild(insetCheckbox);
      checkboxContainer.appendChild(checkboxCustom);
      insetRow.appendChild(insetLabel);
      insetRow.appendChild(checkboxContainer);
      details.appendChild(insetRow);
      
      item.appendChild(details);
      container.appendChild(item);
    });
  }

  // Custom Breakpoints
  setupCustomBreakpoints() {
    const btnAdd = document.getElementById('add-media-query-btn');
    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const label = prompt('أدخل اسم أو تسمية الميديا كويري المخصصة (مثال: Mobile Small):');
        if (!label) return;
        
        const query = prompt('أدخل قاعدة الميديا كويري (مثال: (max-width: 480px)):', '(max-width: 480px)');
        if (!query) return;
        
        const widthValStr = prompt('أدخل عرض المعاينة بالبكسل لتكبير/تصغير مساحة العمل (مثال: 480):', '480');
        const widthVal = parseInt(widthValStr) || 480;
        
        const key = `custom_${widthVal}_${Date.now().toString(36)}`;
        
        this.app.styleEngine.breakpoints[key] = {
          label: `${label} · ≤${widthVal}px`,
          query: query,
          width: String(widthVal),
          isCustom: true
        };
        
        this.saveCustomBreakpointsToStorage();
        this.renderBreakpointsUI();
        this.setActiveBreakpoint(key);
        
        this.app.showToastNotice(`تمت إضافة شاشة مخصصة: ${label}`);
      });
    }
  }

  saveCustomBreakpointsToStorage() {
    const customBPs = {};
    Object.entries(this.app.styleEngine.breakpoints).forEach(([k, v]) => {
      if (v.isCustom) {
        customBPs[k] = v;
      }
    });
    localStorage.setItem('builder-custom-breakpoints', JSON.stringify(customBPs));
  }

  // Renders all breakpoints buttons dynamically
  renderBreakpointsUI() {
    const container = document.getElementById('breakpoints-segmented');
    if (!container) return;
    container.innerHTML = '';
    
    // 1. Add "all" base button
    const btnAll = document.createElement('button');
    btnAll.className = 'segment-btn';
    btnAll.dataset.val = 'all';
    btnAll.textContent = 'أساسي · الكل';
    if (this.activeBreakpoint === 'all') btnAll.classList.add('active');
    btnAll.setAttribute('aria-pressed', String(this.activeBreakpoint === 'all'));
    container.appendChild(btnAll);
    
    // Sort all other breakpoints in descending order of width
    const otherBreakpoints = Object.entries(this.app.styleEngine.breakpoints)
      .sort((a, b) => parseInt(b[1].width) - parseInt(a[1].width));
      
    otherBreakpoints.forEach(([key, bp]) => {
      const btn = document.createElement('button');
      btn.className = 'segment-btn';
      btn.dataset.val = key;
      
      const spanText = document.createElement('span');
      spanText.textContent = bp.label;
      btn.appendChild(spanText);
      
      if (bp.isCustom) {
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-times';
        deleteIcon.style.marginRight = '6px';
        deleteIcon.style.opacity = '0.5';
        deleteIcon.style.cursor = 'pointer';
        deleteIcon.title = 'حذف هذه الميديا كويري';
        
        deleteIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`هل أنت متأكد من حذف الميديا كويري المخصصة (${bp.label})؟`)) {
            // Delete breakpoint definition
            delete this.app.styleEngine.breakpoints[key];
            
            // Clean up custom rules matching this breakpoint
            Object.keys(this.app.styleEngine.rules).forEach(ruleKey => {
              if (ruleKey.startsWith(key + '|||')) {
                delete this.app.styleEngine.rules[ruleKey];
              }
            });
            this.app.styleEngine.commitToEditor();
            
            this.saveCustomBreakpointsToStorage();
            if (this.activeBreakpoint === key) {
              this.setActiveBreakpoint('all');
            } else {
              this.renderBreakpointsUI();
            }
            this.app.showToastNotice('تم حذف الميديا كويري المخصصة.');
          }
        });
        btn.appendChild(deleteIcon);
      }
      
      if (this.activeBreakpoint === key) btn.classList.add('active');
      btn.setAttribute('aria-pressed', String(this.activeBreakpoint === key));
      container.appendChild(btn);
    });
  }
}
