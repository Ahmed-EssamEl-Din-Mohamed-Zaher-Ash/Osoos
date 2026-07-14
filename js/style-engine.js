/* Stylesheet-backed visual styling for the builder canvas.
 *
 * The visual inspector never needs to persist declarations in style="".
 * Rules edited here are stored in a readable, managed block inside the CSS
 * editor and are previewed against the simulated canvas breakpoint.
 */

class OsoosStyleEngine {
  constructor(app) {
    this.app = app;
    this.rules = {};
    this.activeBreakpoint = 'all';
    this.activePseudo = 'normal';
    this.activeSelector = '';
    this.previewStyleTag = null;
    this.blockStart = '/* OSOOS-GENERATED-STYLES:START */';
    this.blockEnd = '/* OSOOS-GENERATED-STYLES:END */';
    this.dataPrefix = '/* OSOOS_STYLE_DATA:';
    this.breakpoints = {
      '375': {
        label: 'هاتف · حتى 767px',
        query: '(max-width: 767px)',
        width: '375'
      },
      '768': {
        label: 'تابلت · 768–1199px',
        query: '(min-width: 768px) and (max-width: 1199px)',
        width: '768'
      },
      '1200': {
        label: 'ديسكتوب · 1200px فأكثر',
        query: '(min-width: 1200px)',
        width: '1440'
      }
    };
    
    // Load custom breakpoints from localStorage
    try {
      const customBPs = JSON.parse(localStorage.getItem('builder-custom-breakpoints') || '{}');
      Object.assign(this.breakpoints, customBPs);
    } catch (e) {
      console.warn('Failed to load custom breakpoints in style engine:', e);
    }
  }

  init() {
    if (!this.previewStyleTag) {
      this.previewStyleTag = document.createElement('style');
      this.previewStyleTag.id = 'builder-managed-preview-styles';
      document.head.appendChild(this.previewStyleTag);
    }
    this.updatePreviewContext();
  }

  get managedBlockRegex() {
    return /\/\* OSOOS-GENERATED-STYLES:START \*\/[\s\S]*?\/\* OSOOS-GENERATED-STYLES:END \*\//g;
  }

  normalizeProperty(property) {
    return String(property || '')
      .trim()
      .replace(/[A-Z]/g, match => '-' + match.toLowerCase())
      .toLowerCase();
  }

  escapeSelectorId(id) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(id);
    return String(id).replace(/[^a-zA-Z0-9_-]/g, char => `\\${char}`);
  }

  ensureElementSelector(element) {
    if (!element || element === this.app.canvas) return '';
    if (!element.id) {
      const tag = element.tagName.toLowerCase();
      let candidate = '';
      do {
        candidate = `${tag}-${Math.random().toString(36).slice(2, 7)}`;
      } while (document.getElementById(candidate));
      element.id = candidate;
    }
    return `#${this.escapeSelectorId(element.id)}`;
  }

  makeRuleKey(selector, breakpoint = 'all', pseudo = 'normal') {
    return `${breakpoint}|||${pseudo}|||${selector}`;
  }

  getRule(selector, breakpoint = 'all', pseudo = 'normal', create = false) {
    const key = this.makeRuleKey(selector, breakpoint, pseudo);
    if (!this.rules[key] && create) {
      this.rules[key] = { selector, breakpoint, pseudo, declarations: {} };
    }
    return this.rules[key] || null;
  }

  isSupportedValue(property, value) {
    if (!property || value === '') return true;
    if (!window.CSS || typeof window.CSS.supports !== 'function') return true;
    try {
      return window.CSS.supports(property, String(value).replace(/\s*!important\s*$/i, '').trim());
    } catch (error) {
      return true;
    }
  }

  setStyle(element, property, value, options = {}) {
    const selector = this.ensureElementSelector(element);
    const cssProperty = this.normalizeProperty(property);
    if (!selector || !cssProperty) return false;

    const breakpoint = options.breakpoint || this.activeBreakpoint || 'all';
    const pseudo = options.pseudo || this.activePseudo || 'normal';
    let normalizedValue = value === null || value === undefined ? '' : String(value).trim();
    normalizedValue = normalizedValue.replace(/\s*!important\s*$/i, '').trim();

    if (normalizedValue && !this.isSupportedValue(cssProperty, normalizedValue)) return false;

    const rule = this.getRule(selector, breakpoint, pseudo, true);
    if (!normalizedValue) {
      delete rule.declarations[cssProperty];
    } else {
      rule.declarations[cssProperty] = {
        value: normalizedValue,
        important: !!options.important
      };
    }

    if (Object.keys(rule.declarations).length === 0) {
      delete this.rules[this.makeRuleKey(selector, breakpoint, pseudo)];
    }

    if (options.commit !== false) this.commitToEditor();
    return true;
  }

  setStyles(element, declarations, options = {}) {
    let changed = false;
    Object.entries(declarations || {}).forEach(([property, value]) => {
      changed = this.setStyle(element, property, value, { ...options, commit: false }) || changed;
    });
    if (changed && options.commit !== false) this.commitToEditor();
    return changed;
  }

  getStyleValue(element, property, options = {}) {
    /* قراءة بحتة: كانت بتنده ensureElementSelector فتزرع id عشوائي في أي عنصر
       بلا id لمجرد عرض اللوحة. لو مفيش id يبقى مفيش قواعد أصلاً -> '' زي ما هي. */
    const selector = this.existingElementSelector(element);
    if (!selector) return '';
    const cssProperty = this.normalizeProperty(property);
    const breakpoint = options.breakpoint || this.activeBreakpoint || 'all';
    const pseudo = options.pseudo || this.activePseudo || 'normal';
    const candidates = [
      this.getRule(selector, breakpoint, pseudo),
      breakpoint !== 'all' ? this.getRule(selector, 'all', pseudo) : null,
      pseudo !== 'normal' ? this.getRule(selector, breakpoint, 'normal') : null,
      breakpoint !== 'all' && pseudo !== 'normal' ? this.getRule(selector, 'all', 'normal') : null
    ];
    for (const rule of candidates) {
      const declaration = rule && rule.declarations[cssProperty];
      if (declaration) return declaration.value;
    }
    return '';
  }

  /* قراءة فقط: بترجع #id لو موجود، ومش بتزرع id جديد.
     ensureElementSelector بتزرع id — وده غلط في مسار الحذف (عنصر بيتشال أصلاً). */
  existingElementSelector(element) {
    if (!element || element === this.app.canvas || !element.id) return '';
    return `#${this.escapeSelectorId(element.id)}`;
  }

  removeSelector(elementOrSelector, commit = true) {
    const selector = typeof elementOrSelector === 'string'
      ? elementOrSelector
      : this.existingElementSelector(elementOrSelector);
    if (!selector) return 0;
    let removed = 0;
    Object.keys(this.rules).forEach(key => {
      if (this.rules[key].selector === selector) { delete this.rules[key]; removed++; }
    });
    if (removed && commit) this.commitToEditor();
    return removed;
  }

  /* حذف عنصر كان بيسيب قواعده في this.rules فتتصدّر في CSS النهائي للأبد —
     removeSelector كانت معرّفة ومحدش بينده عليها في المشروع كله.
     بننضف العنصر وكل أحفاده (اللي ليهم id) قبل ما يتشال من الشجرة. */
  removeSelectorDeep(element, commit = true) {
    if (!element || typeof element.querySelectorAll !== 'function') return 0;
    const selectors = new Set();
    [element, ...element.querySelectorAll('[id]')].forEach(node => {
      const selector = this.existingElementSelector(node);
      if (selector) selectors.add(selector);
    });
    if (!selectors.size) return 0;

    let removed = 0;
    Object.keys(this.rules).forEach(key => {
      if (selectors.has(this.rules[key].selector)) { delete this.rules[key]; removed++; }
    });
    if (removed && commit) this.commitToEditor();
    return removed;
  }

  pseudoSuffix(pseudo) {
    const suffixes = {
      normal: '',
      hover: ':hover',
      active: ':active',
      focus: ':focus',
      'nth-child': ':nth-child(odd)',
      before: '::before',
      after: '::after'
    };
    return suffixes[pseudo] || '';
  }

  renderDeclarations(rule, indent = '  ') {
    const declarations = { ...rule.declarations };
    if ((rule.pseudo === 'before' || rule.pseudo === 'after') && !declarations.content) {
      declarations.content = { value: '\"\"', important: false };
    }
    return Object.keys(declarations)
      .sort()
      .map(property => {
        const declaration = declarations[property];
        return `${indent}${property}: ${declaration.value}${declaration.important ? ' !important' : ''};`;
      })
      .join('\n');
  }

  renderRule(rule, selectorOverride = '', indent = '') {
    const selector = selectorOverride || `${rule.selector}${this.pseudoSuffix(rule.pseudo)}`;
    const declarationIndent = indent + '  ';
    return `${indent}${selector} {\n${this.renderDeclarations(rule, declarationIndent)}\n${indent}}`;
  }

  renderGeneratedCSS() {
    const entries = Object.values(this.rules)
      .filter(rule => rule && Object.keys(rule.declarations || {}).length)
      .sort((a, b) => {
        const order = { all: 0, '375': 1, '768': 2, '1200': 3 };
        return (order[a.breakpoint] - order[b.breakpoint]) ||
          a.selector.localeCompare(b.selector) || a.pseudo.localeCompare(b.pseudo);
      });
    if (!entries.length) return '';

    const lines = [this.blockStart, '/* مُدار من لوحة خصائص CSS — عدّل من اللوحة أو أضف قواعدك خارج هذا القسم. */'];

    entries.filter(rule => rule.breakpoint === 'all').forEach(rule => {
      lines.push(this.renderRule(rule));
    });

    /* كل البريكبوينتس بما فيها المخصصة — كانت الثابتة الثلاثة فقط تُكتب فتُحذف
       ستايلات البريكبوينت المخصص بصمت عند الحفظ/التصدير رغم ظهورها في المعاينة. */
    Object.keys(this.breakpoints).filter(key => key !== 'all').forEach(breakpoint => {
      const responsiveRules = entries.filter(rule => rule.breakpoint === breakpoint);
      if (!responsiveRules.length || !this.breakpoints[breakpoint]) return;
      lines.push(`@media ${this.breakpoints[breakpoint].query} {`);
      responsiveRules.forEach(rule => lines.push(this.renderRule(rule, '', '  ')));
      lines.push('}');
    });

    lines.push(this.blockEnd);
    return lines.join('\n\n');
  }

  stripManagedBlock(css) {
    return String(css || '').replace(this.managedBlockRegex, '').trim();
  }

  composeCSS(unmanagedCss) {
    const clean = this.stripManagedBlock(unmanagedCss);
    const generated = this.renderGeneratedCSS();
    return [clean, generated].filter(Boolean).join('\n\n');
  }

  getExportCSS(css) {
    return String(css || '').replace(/\/\* OSOOS_STYLE_DATA:\s*[^*]*\*\//g, '').trim();
  }

  loadFromCSS(css) {
    const source = String(css || '');
    const block = source.match(this.managedBlockRegex);
    this.rules = {};
    if (block && block[0]) {
      this.parseManagedRules(block[0]);
    }
    this.updatePreview();
    return this.stripManagedBlock(source);
  }

  parseManagedRules(blockText) {
    const style = document.createElement('style');
    style.dataset.osoosParser = 'true';
    style.textContent = String(blockText || '')
      .replace(this.blockStart, '')
      .replace(this.blockEnd, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    document.head.appendChild(style);

    const suffixes = [
      ['::before', 'before'],
      ['::after', 'after'],
      [':nth-child(odd)', 'nth-child'],
      [':hover', 'hover'],
      [':active', 'active'],
      [':focus', 'focus']
    ];
    const normalizeQuery = value => String(value || '').replace(/\s+/g, '').toLowerCase();
    const breakpointForQuery = query => {
      const normalized = normalizeQuery(query);
      const found = Object.keys(this.breakpoints).find(key => normalizeQuery(this.breakpoints[key].query) === normalized);
      if (found) return found;
      
      // Auto-register a custom breakpoint from parsed CSS media query!
      const widthMatch = query.match(/(max-width|min-width):\s*(\d+)px/);
      const parsedWidth = widthMatch ? widthMatch[2] : '1024';
      const label = `مخصصة · ${parsedWidth}px`;
      const key = `custom_${parsedWidth}_${Math.random().toString(36).substring(2, 7)}`;
      
      this.breakpoints[key] = {
        label: label,
        query: query,
        width: parsedWidth,
        isCustom: true
      };
      
      try {
        const customBPs = {};
        Object.entries(this.breakpoints).forEach(([k, v]) => {
          if (v.isCustom) customBPs[k] = v;
        });
        localStorage.setItem('builder-custom-breakpoints', JSON.stringify(customBPs));
      } catch (err) {
        console.warn('Failed to save custom breakpoint:', err);
      }
      
      return key;
    };

    const readStyleRule = (cssRule, breakpoint) => {
      let selector = cssRule.selectorText || '';
      let pseudo = 'normal';
      for (const [suffix, state] of suffixes) {
        if (selector.endsWith(suffix)) {
          selector = selector.slice(0, -suffix.length);
          pseudo = state;
          break;
        }
      }
      if (!selector) return;
      const declarations = {};
      for (let index = 0; index < cssRule.style.length; index += 1) {
        const property = cssRule.style[index];
        declarations[property] = {
          value: cssRule.style.getPropertyValue(property).trim(),
          important: cssRule.style.getPropertyPriority(property) === 'important'
        };
      }
      if (!Object.keys(declarations).length) return;
      this.rules[this.makeRuleKey(selector, breakpoint, pseudo)] = {
        selector,
        breakpoint,
        pseudo,
        declarations
      };
    };

    try {
      Array.from(style.sheet ? style.sheet.cssRules : []).forEach(rule => {
        if (rule.type === 1) {
          readStyleRule(rule, 'all');
        } else if (rule.type === 4) {
          const breakpoint = breakpointForQuery(rule.conditionText);
          Array.from(rule.cssRules || []).forEach(innerRule => {
            if (innerRule.type === 1) readStyleRule(innerRule, breakpoint);
          });
        }
      });
    } catch (error) {
      console.warn('تعذر تحليل قسم CSS المُدار؛ بقي CSS اليدوي محفوظاً.', error);
    } finally {
      style.remove();
    }
  }

  /* P1: كان كل tick للمنزلق (30–60 مرة/ثانية) يعيد توليد الـ CSS كامل + يعيد كتابة
     الـ textarea + يعيد ترقيم كل السطور. قسّمنا الشغل:

       • customCSS + الستايل الحي  → متزامن كما هو (سبعة أماكن تقرأ customCSS:
         الحفظ، التراجع، التصدير، علامات الخطوط… تأجيلها كان هيسبب CSS بايت).
       • كتابة الـ textarea وترقيم السطور → مؤجلة (عرض فقط، ومصدر الحقيقة هو
         customCSS نفسه، والـ textarea بيتملى من عنده أصلًا عند تبديل التبويب). */
  commitToEditor() {
    if (!this.app.editor) return;
    const nextCss = this.composeCSS(this.app.editor.customCSS || '');
    this.app.editor.customCSS = nextCss;

    if (this.app.customStyleTag) {
      this.app.customStyleTag.textContent = this.stripManagedBlock(nextCss);
    }
    this.updatePreview();

    this.scheduleTextareaSync();
  }

  scheduleTextareaSync(delay = 120) {
    if (this._textareaSyncTimer) clearTimeout(this._textareaSyncTimer);
    this._textareaSyncTimer = setTimeout(() => {
      this._textareaSyncTimer = null;
      this.syncTextareaNow();
    }, delay);
  }

  /* تفليش فوري: يُستدعى قبل أي شيء يعتمد على محتوى الـ textarea مباشرة */
  flushTextareaSync() {
    if (!this._textareaSyncTimer) return;
    clearTimeout(this._textareaSyncTimer);
    this._textareaSyncTimer = null;
    this.syncTextareaNow();
  }

  syncTextareaNow() {
    const editor = this.app.editor;
    if (!editor || editor.currentLanguage !== 'css' || !editor.textarea) return;
    const nextCss = editor.customCSS || '';
    const selectionStart = editor.textarea.selectionStart;
    const selectionEnd = editor.textarea.selectionEnd;
    editor.textarea.value = nextCss;
    editor.updateLineNumbers();
    const max = nextCss.length;
    editor.textarea.setSelectionRange(Math.min(selectionStart, max), Math.min(selectionEnd, max));
  }

  scopePreviewSelector(rule) {
    const suffix = this.pseudoSuffix(rule.pseudo);
    return `#builder-canvas ${rule.selector}${suffix}`;
  }

  renderPreviewCSS() {
    const entries = Object.values(this.rules).filter(rule => Object.keys(rule.declarations || {}).length);
    const output = [];
    entries.filter(rule => rule.breakpoint === 'all').forEach(rule => {
      output.push(this.renderRule(rule, this.scopePreviewSelector(rule)));
    });
    if (this.activeBreakpoint !== 'all') {
      entries.filter(rule => rule.breakpoint === this.activeBreakpoint).forEach(rule => {
        output.push(this.renderRule(rule, this.scopePreviewSelector(rule)));
      });
    }

    if (this.activePseudo !== 'normal' && this.activeSelector) {
      const forcedCandidates = [
        this.getRule(this.activeSelector, 'all', this.activePseudo),
        this.activeBreakpoint !== 'all'
          ? this.getRule(this.activeSelector, this.activeBreakpoint, this.activePseudo)
          : null
      ].filter(Boolean);
      forcedCandidates.forEach(rule => {
        const forcedSelector = `#builder-canvas[data-osoos-pseudo=\"${this.activePseudo}\"] ${rule.selector}`;
        output.push(this.renderRule(rule, forcedSelector));
      });
    }
    return output.join('\n\n');
  }

  updatePreview() {
    this.init();
    this.previewStyleTag.textContent = this.renderPreviewCSS();
  }

  updatePreviewContext() {
    if (!this.app.canvas) return;
    this.app.canvas.dataset.osoosBreakpoint = this.activeBreakpoint;
    this.app.canvas.dataset.osoosPseudo = this.activePseudo;
  }

  setContext({ breakpoint, pseudo, element } = {}) {
    if (breakpoint && (breakpoint === 'all' || this.breakpoints[breakpoint])) {
      this.activeBreakpoint = breakpoint;
    }
    if (pseudo) this.activePseudo = pseudo;
    if (element !== undefined) this.activeSelector = element ? this.ensureElementSelector(element) : '';
    this.updatePreviewContext();
    this.updatePreview();
  }

  migrateInlineStyles(root, options = {}) {
    if (!root) return false;
    const nodes = [root, ...root.querySelectorAll('[style]')];
    let changed = false;
    nodes.forEach(node => {
      if (node === root && node.id === 'builder-canvas') return;
      const style = node.style;
      if (!style || !style.length) return;
      const declarations = [];
      for (let index = 0; index < style.length; index += 1) {
        const property = style[index];
        if (property === 'outline' || property === 'outline-offset') continue;
        declarations.push({
          property,
          value: style.getPropertyValue(property).trim(),
          important: style.getPropertyPriority(property) === 'important'
        });
      }
      declarations.forEach(declaration => {
        if (!declaration.value) return;
        const didSet = this.setStyle(node, declaration.property, declaration.value, {
          breakpoint: options.breakpoint || 'all',
          pseudo: 'normal',
          important: declaration.important,
          commit: false
        });
        if (didSet) {
          style.removeProperty(declaration.property);
          changed = true;
        }
      });
      if (!style.cssText.trim()) node.removeAttribute('style');
    });
    if (changed && options.commit !== false) this.commitToEditor();
    return changed;
  }
}
