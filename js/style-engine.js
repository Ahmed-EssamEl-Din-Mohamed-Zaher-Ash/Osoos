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

  /*
   * Cascade cleanup helpers
   * -----------------------
   * A deleted HTML branch may be referenced by both inspector-managed rules
   * and hand-written CSS.  Selector lists are handled one branch at a time so
   * `.deleted-card, .shared-card` keeps the still-useful `.shared-card` rule.
   */
  splitSelectorList(selectorText) {
    const source = String(selectorText || '');
    const selectors = [];
    let start = 0;
    let quote = '';
    let escaped = false;
    let squareDepth = 0;
    let roundDepth = 0;

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (quote) {
        if (char === quote) quote = '';
        continue;
      }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === '[') squareDepth += 1;
      else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
      else if (char === '(') roundDepth += 1;
      else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
      else if (char === ',' && squareDepth === 0 && roundDepth === 0) {
        const part = source.slice(start, index).trim();
        if (part) selectors.push(part);
        start = index + 1;
      }
    }
    const tail = source.slice(start).trim();
    if (tail) selectors.push(tail);
    return selectors;
  }

  decodeCssIdentifier(identifier) {
    return String(identifier || '').replace(/\\([0-9a-fA-F]{1,6})(?:\s)?|\\(.)/g, (match, hex, escapedChar) => {
      if (hex) {
        try { return String.fromCodePoint(parseInt(hex, 16)); } catch (error) { return match; }
      }
      return escapedChar || '';
    });
  }

  selectorIdentityTokens(selectorText) {
    const source = String(selectorText || '');
    const ids = new Set();
    const classes = new Set();
    let quote = '';
    let inComment = false;

    const consumeIdentifier = start => {
      let cursor = start;
      let raw = '';
      while (cursor < source.length) {
        const char = source[cursor];
        if (char === '\\' && cursor + 1 < source.length) {
          raw += char;
          cursor += 1;
          let hexCount = 0;
          while (cursor < source.length && /[0-9a-fA-F]/.test(source[cursor]) && hexCount < 6) {
            raw += source[cursor++];
            hexCount += 1;
          }
          if (!hexCount) raw += source[cursor++];
          else if (cursor < source.length && /\s/.test(source[cursor])) raw += source[cursor++];
          continue;
        }
        if (/[a-zA-Z0-9_-]/.test(char) || char.charCodeAt(0) >= 128) {
          raw += char;
          cursor += 1;
          continue;
        }
        break;
      }
      return { value: this.decodeCssIdentifier(raw), end: cursor };
    };

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (inComment) {
        if (char === '*' && source[index + 1] === '/') { inComment = false; index += 1; }
        continue;
      }
      if (!quote && char === '/' && source[index + 1] === '*') { inComment = true; index += 1; continue; }
      if (quote) {
        if (char === '\\') index += 1;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char !== '#' && char !== '.') continue;
      const token = consumeIdentifier(index + 1);
      if (!token.value) continue;
      (char === '#' ? ids : classes).add(token.value);
      index = token.end - 1;
    }

    // Attribute selectors are also identity selectors, for example
    // [id="hero"] and [class~="feature-card"].
    source.replace(/\[\s*id\s*=\s*(["'])(.*?)\1\s*\]/gi, (match, q, value) => {
      if (value) ids.add(this.decodeCssIdentifier(value));
      return match;
    });
    source.replace(/\[\s*class\s*(?:=|~=)\s*(["'])(.*?)\1\s*\]/gi, (match, q, value) => {
      String(value || '').split(/\s+/).filter(Boolean).forEach(valuePart => classes.add(this.decodeCssIdentifier(valuePart)));
      return match;
    });

    return { ids, classes };
  }

  selectorReferencesIdentities(selectorText, identities = {}) {
    const removedIds = identities.ids instanceof Set ? identities.ids : new Set(identities.ids || []);
    const removedClasses = identities.classes instanceof Set ? identities.classes : new Set(identities.classes || []);
    const tokens = this.selectorIdentityTokens(selectorText);
    return Array.from(tokens.ids).some(id => removedIds.has(id)) ||
      Array.from(tokens.classes).some(className => removedClasses.has(className));
  }

  removeRulesForIdentities(identities = {}, commit = true) {
    let removed = 0;
    const nextRules = {};

    Object.values(this.rules).forEach(rule => {
      if (!rule) return;
      const selectors = this.splitSelectorList(rule.selector);
      const kept = selectors.filter(selector => !this.selectorReferencesIdentities(selector, identities));
      removed += selectors.length - kept.length;
      if (!kept.length) return;

      const selector = kept.join(', ');
      const nextRule = Object.assign({}, rule, { selector });
      const nextKey = this.makeRuleKey(selector, rule.breakpoint, rule.pseudo);
      if (nextRules[nextKey]) {
        // Two selector lists can collapse to the same surviving selector.
        // Preserve both declaration sets using normal later-rule precedence.
        nextRule.declarations = Object.assign({}, nextRules[nextKey].declarations, nextRule.declarations);
      }
      nextRules[nextKey] = nextRule;
    });

    this.rules = nextRules;
    if (removed && commit) this.commitToEditor();
    return removed;
  }

  _cssLeadingTriviaLength(segment) {
    let index = 0;
    while (index < segment.length) {
      if (/\s/.test(segment[index])) { index += 1; continue; }
      if (segment[index] === '/' && segment[index + 1] === '*') {
        const end = segment.indexOf('*/', index + 2);
        if (end === -1) return segment.length;
        index = end + 2;
        continue;
      }
      break;
    }
    return index;
  }

  _nextCssBoundary(source, start) {
    let quote = '';
    let roundDepth = 0;
    let squareDepth = 0;
    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === '\\') index += 1;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '/' && source[index + 1] === '*') {
        const end = source.indexOf('*/', index + 2);
        if (end === -1) return null;
        index = end + 1;
        continue;
      }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === '(') roundDepth += 1;
      else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
      else if (char === '[') squareDepth += 1;
      else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
      else if (!roundDepth && !squareDepth && (char === '{' || char === ';')) return { index, char };
    }
    return null;
  }

  _matchingCssBrace(source, openIndex) {
    let depth = 1;
    let quote = '';
    for (let index = openIndex + 1; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === '\\') index += 1;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '/' && source[index + 1] === '*') {
        const end = source.indexOf('*/', index + 2);
        if (end === -1) return source.length - 1;
        index = end + 1;
        continue;
      }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === '{') depth += 1;
      else if (char === '}') {
        depth -= 1;
        if (depth === 0) return index;
      }
    }
    return source.length - 1;
  }

  rewriteCssRules(css, shouldRemoveSelector) {
    const source = String(css || '');
    let output = '';
    let cursor = 0;

    while (cursor < source.length) {
      const boundary = this._nextCssBoundary(source, cursor);
      if (!boundary) { output += source.slice(cursor); break; }
      if (boundary.char === ';') {
        output += source.slice(cursor, boundary.index + 1);
        cursor = boundary.index + 1;
        continue;
      }

      const closeIndex = this._matchingCssBrace(source, boundary.index);
      const segment = source.slice(cursor, boundary.index);
      const triviaLength = this._cssLeadingTriviaLength(segment);
      const trivia = segment.slice(0, triviaLength);
      const rawHeader = segment.slice(triviaLength);
      const header = rawHeader.trim();
      const trailingWhitespace = (rawHeader.match(/\s*$/) || [''])[0];
      const body = source.slice(boundary.index + 1, closeIndex);

      if (!header) {
        output += source.slice(cursor, closeIndex + 1);
      } else if (header.startsWith('@')) {
        // Recursing through grouping at-rules keeps @media/@supports/@layer
        // intact and is harmless for declaration-only blocks such as
        // @font-face (their semicolon statements pass through unchanged).
        output += trivia + rawHeader + '{' + this.rewriteCssRules(body, shouldRemoveSelector) + '}';
      } else {
        const selectors = this.splitSelectorList(header);
        const kept = selectors.filter(selector => !shouldRemoveSelector(selector));
        if (!kept.length) {
          // Preserve surrounding comments/spacing, but drop the orphan rule.
          output += trivia;
        } else if (kept.length === selectors.length) {
          output += source.slice(cursor, closeIndex + 1);
        } else {
          output += trivia + kept.join(', ') + trailingWhitespace + '{' + body + '}';
        }
      }
      cursor = closeIndex + 1;
    }
    return output;
  }

  removeUnmanagedRulesForIdentities(css, identities = {}) {
    return this.rewriteCssRules(css, selector => this.selectorReferencesIdentities(selector, identities));
  }

  /*
   * Rename-safe selector helpers. Identity edits are intentionally handled in
   * the style engine instead of with a blind string replacement: `#abc` may be
   * a colour in declarations, and a shared `.card` must keep styling the other
   * cards when one element is renamed.
   */
  regexEscape(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  selectorTokenCandidates(value) {
    const raw = String(value === undefined || value === null ? '' : value);
    const escaped = this.escapeSelectorId(raw);
    return Array.from(new Set([escaped, raw].filter(Boolean)))
      .sort((left, right) => right.length - left.length);
  }

  selectorHasToken(selector, prefix, value) {
    return this.selectorTokenCandidates(value).some(candidate => {
      const pattern = new RegExp(`${this.regexEscape(prefix)}${this.regexEscape(candidate)}(?![-_a-zA-Z0-9\\u00A0-\\uFFFF])`, 'u');
      return pattern.test(String(selector || ''));
    });
  }

  replaceSelectorToken(selector, prefix, oldValue, newValue) {
    let result = String(selector || '');
    const replacement = `${prefix}${this.escapeSelectorId(newValue)}`;
    this.selectorTokenCandidates(oldValue).forEach(candidate => {
      const pattern = new RegExp(`${this.regexEscape(prefix)}${this.regexEscape(candidate)}(?![-_a-zA-Z0-9\\u00A0-\\uFFFF])`, 'gu');
      result = result.replace(pattern, replacement);
    });
    return result;
  }

  selectorHasAttributeIdentity(selector, attribute, value) {
    const pattern = /(\[\s*(id|class)\s*(~=|=)\s*)(?:"([^"]*)"|'([^']*)'|([^\]\s]+))(\s*\])/g;
    let match;
    while ((match = pattern.exec(String(selector || ''))) !== null) {
      const actualValue = match[4] !== undefined ? match[4] : (match[5] !== undefined ? match[5] : match[6]);
      if (match[2].toLowerCase() === String(attribute || '').toLowerCase() && actualValue === String(value || '')) return true;
    }
    return false;
  }

  replaceAttributeIdentity(selector, attribute, oldValue, newValue) {
    const expectedAttribute = String(attribute || '').toLowerCase();
    const expectedValue = String(oldValue || '');
    const pattern = /(\[\s*(id|class)\s*(~=|=)\s*)(?:"([^"]*)"|'([^']*)'|([^\]\s]+))(\s*\])/g;
    return String(selector || '').replace(pattern, (whole, prefix, name, operator, doubleQuoted, singleQuoted, bare, suffix) => {
      const actualValue = doubleQuoted !== undefined ? doubleQuoted : (singleQuoted !== undefined ? singleQuoted : bare);
      if (name.toLowerCase() !== expectedAttribute || actualValue !== expectedValue) return whole;
      const quote = doubleQuoted !== undefined ? '"' : (singleQuoted !== undefined ? "'" : '');
      return `${prefix}${quote}${newValue}${quote}${suffix}`;
    });
  }

  splitIdentitySelectorList(selector) {
    const parts = [];
    let start = 0;
    let squareDepth = 0;
    let roundDepth = 0;
    let quote = '';
    let escaped = false;
    const source = String(selector || '');
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === '[') squareDepth += 1;
      else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
      else if (char === '(') roundDepth += 1;
      else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
      else if (char === ',' && squareDepth === 0 && roundDepth === 0) {
        parts.push(source.slice(start, index).trim());
        start = index + 1;
      }
    }
    parts.push(source.slice(start).trim());
    return parts.filter(Boolean);
  }

  rewriteSelectorReferences(selector, options = {}) {
    const oldId = String(options.oldId || '');
    const newId = String(options.newId || '');
    const classRenames = Array.isArray(options.classRenames) ? options.classRenames : [];
    const preserveOldClasses = new Set(options.preserveOldClasses || []);

    const rewritten = [];
    this.splitIdentitySelectorList(selector).forEach(selectorPart => {
      const wasIdScoped = !!oldId && (
        this.selectorHasToken(selectorPart, '#', oldId) ||
        this.selectorHasAttributeIdentity(selectorPart, 'id', oldId)
      );
      let idRewritten = selectorPart;
      if (oldId && newId) {
        idRewritten = this.replaceSelectorToken(idRewritten, '#', oldId, newId);
        idRewritten = this.replaceAttributeIdentity(idRewritten, 'id', oldId, newId);
      }
      let variants = [idRewritten];

      classRenames.forEach(rename => {
        const oldClass = String(rename.oldClass || '');
        const newClass = String(rename.newClass || '');
        if (!oldClass || !newClass || oldClass === newClass) return;
        const next = [];
        variants.forEach(variant => {
          const hasClassReference = this.selectorHasToken(variant, '.', oldClass) ||
            this.selectorHasAttributeIdentity(variant, 'class', oldClass);
          if (!hasClassReference) {
            next.push(variant);
            return;
          }
          let changed = this.replaceSelectorToken(variant, '.', oldClass, newClass);
          changed = this.replaceAttributeIdentity(changed, 'class', oldClass, newClass);
          /* A global shared class keeps its old branch and gains the new one.
             An ID-scoped rule belongs only to the renamed element, so retaining
             an impossible #new.old branch would only leave dead CSS. */
          if (preserveOldClasses.has(oldClass) && !wasIdScoped) next.push(variant);
          next.push(changed);
        });
        variants = Array.from(new Set(next));
      });

      rewritten.push(...variants);
    });
    return Array.from(new Set(rewritten)).join(', ');
  }

  rewriteCssSelectorPreludes(css, options = {}) {
    const source = String(css || '');
    let output = '';
    let segmentStart = 0;
    let quote = '';
    let escaped = false;
    let inComment = false;

    const rewritePrelude = prelude => {
      const leading = (prelude.match(/^\s*/) || [''])[0];
      const trailing = (prelude.match(/\s*$/) || [''])[0];
      const core = prelude.slice(leading.length, prelude.length - trailing.length);
      if (!core || core.trim().startsWith('@')) return prelude;
      /* Leave comments byte-for-byte intact while rewriting selector tokens. */
      const guards = [];
      const protectedCore = core.replace(/\/\*[\s\S]*?\*\//g, comment => {
        guards.push(comment);
        return `\u0001${guards.length - 1}\u0001`;
      });
      const changed = this.rewriteSelectorReferences(protectedCore, options)
        .replace(/\u0001(\d+)\u0001/g, (match, index) => guards[Number(index)] || match);
      return `${leading}${changed}${trailing}`;
    };

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];
      if (inComment) {
        if (char === '*' && next === '/') { inComment = false; index += 1; }
        continue;
      }
      if (quote) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '/' && next === '*') { inComment = true; index += 1; continue; }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === '{') {
        output += rewritePrelude(source.slice(segmentStart, index)) + '{';
        segmentStart = index + 1;
      } else if (char === '}') {
        output += source.slice(segmentStart, index + 1);
        segmentStart = index + 1;
      }
    }
    return output + source.slice(segmentStart);
  }

  renameElementReferences(options = {}, commit = true) {
    const oldId = String(options.oldId || '');
    const newId = String(options.newId || '');
    const classRenames = Array.isArray(options.classRenames) ? options.classRenames : [];
    if ((!oldId || !newId || oldId === newId) && !classRenames.length) return 0;

    const nextRules = {};
    let changed = 0;
    Object.values(this.rules).forEach(rule => {
      if (!rule) return;
      const rewrittenSelector = this.rewriteSelectorReferences(rule.selector, options);
      if (rewrittenSelector !== rule.selector) changed += 1;
      /* Keep expanded selector branches as independent managed rules. This is
         important for pseudo states: `.old, .new` + `:hover` would otherwise
         render as `.old, .new:hover` and miss hover on the old shared branch. */
      this.splitIdentitySelectorList(rewrittenSelector).forEach(selector => {
        const nextRule = {
          selector,
          breakpoint: rule.breakpoint,
          pseudo: rule.pseudo,
          declarations: { ...rule.declarations }
        };
        const key = this.makeRuleKey(selector, rule.breakpoint, rule.pseudo);
        if (nextRules[key]) {
          nextRules[key].declarations = { ...nextRules[key].declarations, ...nextRule.declarations };
        } else {
          nextRules[key] = nextRule;
        }
      });
    });
    this.rules = nextRules;

    if (this.app.editor) {
      const unmanaged = this.stripManagedBlock(this.app.editor.customCSS || '');
      const rewritten = this.rewriteCssSelectorPreludes(unmanaged, options);
      if (rewritten !== unmanaged) changed += 1;
      this.app.editor.customCSS = rewritten;
    }
    if (this.activeSelector) {
      this.activeSelector = this.rewriteSelectorReferences(this.activeSelector, options);
    }
    if (commit) this.commitToEditor();
    else this.updatePreview();
    return changed;
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
