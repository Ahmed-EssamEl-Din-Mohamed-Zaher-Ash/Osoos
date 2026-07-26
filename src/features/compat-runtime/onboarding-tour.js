/*
 * Three-step Arabic onboarding tour for first-time Osoos users.
 *
 * The tour is deliberately isolated from the editor controller. It uses the
 * public beginner/responsive APIs when available and falls back to existing
 * DOM regions on the desktop layout. Completion (including an intentional
 * skip) is remembered locally so returning users are not interrupted.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'osoos:onboarding-tour-completed:v1';
  const ROOT_ID = 'osoos-onboarding-tour';
  const TEXT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, span, button, label, li, a';
  const AUTO_START_DELAY = 700;

  let controller = null;

  function ensureStylesheet() {
    if (document.querySelector('link[href*="onboarding-tour.css"], link[data-osoos-onboarding-styles]')) return;

    const link = document.createElement('link');
    const activeScript = document.currentScript;
    link.rel = 'stylesheet';
    link.dataset.osoosOnboardingStyles = 'true';
    link.href = activeScript?.src
      ? new URL('../css/onboarding-tour.css', activeScript.src).href
      : 'css/onboarding-tour.css';
    document.head.appendChild(link);
  }

  function readCompletion() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveCompletion(reason) {
    try {
      window.localStorage.setItem(STORAGE_KEY, reason === 'completed' ? 'completed' : 'skipped');
    } catch (error) {
      // The tour still works when storage is unavailable.
    }
  }

  function clearCompletion() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Storage may be unavailable in a private or sandboxed context.
    }
  }

  function isBeginnerMode() {
    const api = window.OsoosExperienceMode;
    if (api && typeof api.getMode === 'function') return api.getMode() === api.beginner;
    return document.body?.classList.contains('osoos-beginner-mode') !== false;
  }

  function isCompactLayout() {
    return window.matchMedia('(max-width: 1199px)').matches;
  }

  function correctFirstInstruction() {
    const panel = document.querySelector('.side-panel.panel-right');
    if (panel) {
      panel.setAttribute('aria-label', 'لوحة العناصر');
      const visibleTitle = panel.querySelector(':scope > .panel-header span:first-child');
      if (visibleTitle && !visibleTitle.dataset.onboardingLabelled) {
        visibleTitle.textContent = 'لوحة العناصر';
        visibleTitle.dataset.onboardingLabelled = 'true';
      }
    }

    const compactElementsButton = document.querySelector('[data-shell-panel="elements"]');
    if (compactElementsButton) {
      compactElementsButton.setAttribute('aria-label', 'لوحة العناصر');
      compactElementsButton.title = 'فتح لوحة العناصر';
    }

    const canvas = document.getElementById('builder-canvas');
    const oldInstruction = canvas && Array.from(canvas.querySelectorAll('p')).find(paragraph =>
      paragraph.textContent.includes('القائمة اليمنى')
    );
    if (!oldInstruction) return;

    oldInstruction.textContent = 'اختر مكوّنًا من لوحة العناصر، ثم حدّد نصًا لتعديله وعاين النتيجة.';
    const app = window.appInstance;
    app?.domTree?.render?.();
    app?.editor?.refreshEditorContent?.();
  }

  class OnboardingTour {
    constructor() {
      this.active = false;
      this.stepIndex = 0;
      this.root = null;
      this.card = null;
      this.spotlight = null;
      this.previousFocus = null;
      this.previousResponsivePanel = 'canvas';
      this.target = null;
      this.rafId = 0;
      this.autoStartTimer = null;
      this.boundPosition = () => this.schedulePosition();
      this.boundKeydown = event => this.handleKeydown(event);

      this.steps = [
        {
          title: 'ابدأ من لوحة العناصر',
          description: 'اختر مكوّنًا جاهزًا مثل واجهة البداية أو البطاقات. ستتم إضافته مباشرة إلى صفحتك.',
          hint: 'يمكنك لاحقًا إضافة العناصر بالنقر أو بالضغط على Enter أو Space.',
          icon: 'fa-shapes',
          target: () => {
            const beginnerPanel = document.querySelector('.beginner-components-panel');
            return beginnerPanel && getComputedStyle(beginnerPanel).display !== 'none'
              ? beginnerPanel
              : document.querySelector('.side-panel.panel-right');
          },
          prepare: () => this.prepareElementsStep()
        },
        {
          title: 'عدّل محتوى المكوّن',
          description: 'اختر نصًا داخل المكوّن، ثم اكتب المحتوى الجديد في محرر المحتوى واضغط «تطبيق».',
          hint: 'حدّدنا أول نص متاح لتوضيح مكان التعديل، من دون تغيير محتواه.',
          icon: 'fa-pen-to-square',
          target: () => {
            const editor = document.getElementById('accordion-text-editor');
            return editor && getComputedStyle(editor).display !== 'none'
              ? editor
              : document.querySelector('.preview-canvas-container');
          },
          prepare: () => this.prepareContentStep()
        },
        {
          title: 'عاين واحفظ',
          description: 'استخدم «معاينة» لرؤية الصفحة بلا أدوات التحرير. حفظك التلقائي مفعّل، ويمكنك إدارة الملفات أو تصديرها من الشريط نفسه.',
          hint: 'تحقق من مظهر الهاتف واللوحي قبل التصدير النهائي.',
          icon: 'fa-eye',
          target: () => document.querySelector('.app-header .header-actions') || document.getElementById('preview-toggle-btn'),
          prepare: () => this.preparePreviewStep()
        }
      ];
    }

    init() {
      correctFirstInstruction();
      window.addEventListener('osoos:experience-mode-change', event => {
        if (event.detail?.mode === 'beginner' && !this.active && !readCompletion()) {
          this.queueAutoStart();
        }
      });
      this.queueAutoStart();
    }

    queueAutoStart() {
      clearTimeout(this.autoStartTimer);
      if (readCompletion() || !isBeginnerMode()) return;
      this.autoStartTimer = setTimeout(() => {
        if (!readCompletion() && isBeginnerMode()) this.start();
      }, AUTO_START_DELAY);
    }

    start(options = {}) {
      const force = options.force === true;
      if (this.active || (!force && readCompletion()) || (!force && !isBeginnerMode())) return false;

      clearTimeout(this.autoStartTimer);
      correctFirstInstruction();
      this.active = true;
      this.stepIndex = 0;
      this.previousFocus = options.trigger || document.activeElement;
      this.previousResponsivePanel = document.body.dataset.responsivePanel || 'canvas';
      this.createUI();
      this.showStep(0);
      document.body.classList.add('osoos-tour-active');
      window.addEventListener('resize', this.boundPosition);
      window.addEventListener('scroll', this.boundPosition, true);
      document.addEventListener('keydown', this.boundKeydown, true);
      return true;
    }

    createUI() {
      document.getElementById(ROOT_ID)?.remove();
      const root = document.createElement('div');
      root.id = ROOT_ID;
      root.className = 'osoos-onboarding-tour';
      root.dir = 'rtl';
      root.innerHTML = `
        <div class="osoos-tour-shield" aria-hidden="true"></div>
        <div class="osoos-tour-spotlight" aria-hidden="true"></div>
        <section class="osoos-tour-card" role="dialog" aria-modal="true" aria-labelledby="osoos-tour-title" aria-describedby="osoos-tour-description" tabindex="-1">
          <div class="osoos-tour-progress-row">
            <span class="osoos-tour-step-label"></span>
            <div class="osoos-tour-dots" aria-hidden="true"></div>
          </div>
          <div class="osoos-tour-heading-row">
            <span class="osoos-tour-icon" aria-hidden="true"><i class="fas fa-shapes"></i></span>
            <h2 id="osoos-tour-title"></h2>
          </div>
          <p id="osoos-tour-description" class="osoos-tour-description"></p>
          <p class="osoos-tour-hint"><i class="fas fa-lightbulb" aria-hidden="true"></i><span></span></p>
          <div class="osoos-tour-actions">
            <button type="button" class="osoos-tour-skip">تخطي الجولة</button>
            <div class="osoos-tour-navigation">
              <button type="button" class="osoos-tour-previous">السابق</button>
              <button type="button" class="osoos-tour-next">التالي</button>
            </div>
          </div>
        </section>
        <p class="osoos-tour-live sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
      `;
      document.body.appendChild(root);

      this.root = root;
      this.card = root.querySelector('.osoos-tour-card');
      this.spotlight = root.querySelector('.osoos-tour-spotlight');
      root.querySelector('.osoos-tour-skip').addEventListener('click', () => this.finish('skipped'));
      root.querySelector('.osoos-tour-previous').addEventListener('click', () => this.previous());
      root.querySelector('.osoos-tour-next').addEventListener('click', () => this.next());
    }

    prepareElementsStep() {
      if (isCompactLayout() && window.responsiveShell?.showPanel) {
        window.responsiveShell.showPanel('elements', { focusPanel: false });
      } else {
        window.appInstance?.collapseRight?.(false);
      }

      const panel = document.querySelector('.side-panel.panel-right > .panel-content');
      if (panel) panel.scrollTop = 0;
    }

    prepareContentStep() {
      const app = window.appInstance;
      const canvas = document.getElementById('builder-canvas');
      let textElement = app?.selectedElement || null;

      if (!textElement?.matches?.(TEXT_SELECTOR)) {
        textElement = textElement?.querySelector?.(TEXT_SELECTOR) || canvas?.querySelector(TEXT_SELECTOR) || null;
      }
      if (textElement && typeof app?.selectElement === 'function') app.selectElement(textElement);

      if (isCompactLayout() && window.responsiveShell?.showPanel) {
        window.responsiveShell.showPanel('properties', { focusPanel: false });
      } else {
        app?.collapseLeft?.(false);
      }

      const accordion = document.getElementById('accordion-text-editor');
      if (accordion) {
        accordion.classList.add('open');
        const details = accordion.querySelector('.accordion-details');
        if (details) details.style.display = 'block';
        setTimeout(() => accordion.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
      }
    }

    preparePreviewStep() {
      if (isCompactLayout() && window.responsiveShell?.showPanel) {
        window.responsiveShell.showPanel('canvas', { focusPanel: false });
      }
      const preview = document.getElementById('preview-toggle-btn');
      setTimeout(() => preview?.scrollIntoView({ block: 'nearest', inline: 'nearest' }), 40);
    }

    showStep(index) {
      if (!this.active || !this.root) return;
      this.stepIndex = Math.max(0, Math.min(index, this.steps.length - 1));
      const step = this.steps[this.stepIndex];
      step.prepare?.();

      this.root.dataset.step = String(this.stepIndex + 1);
      this.root.querySelector('#osoos-tour-title').textContent = step.title;
      this.root.querySelector('#osoos-tour-description').textContent = step.description;
      this.root.querySelector('.osoos-tour-hint span').textContent = step.hint;
      this.root.querySelector('.osoos-tour-icon i').className = `fas ${step.icon}`;
      this.root.querySelector('.osoos-tour-step-label').textContent = `الخطوة ${this.stepIndex + 1} من ${this.steps.length}`;
      this.root.querySelector('.osoos-tour-live').textContent = `${step.title}. ${step.description}`;

      const dots = this.root.querySelector('.osoos-tour-dots');
      dots.innerHTML = this.steps.map((_, dotIndex) =>
        `<span class="${dotIndex === this.stepIndex ? 'active' : ''}"></span>`
      ).join('');

      const previous = this.root.querySelector('.osoos-tour-previous');
      const next = this.root.querySelector('.osoos-tour-next');
      previous.disabled = this.stepIndex === 0;
      next.textContent = this.stepIndex === this.steps.length - 1 ? 'إنهاء الجولة' : 'التالي';

      setTimeout(() => {
        if (!this.active) return;
        this.target = step.target?.() || null;
        this.position();
        next.focus({ preventScroll: true });
        window.dispatchEvent(new CustomEvent('osoos:onboarding-step', {
          detail: { step: this.stepIndex + 1, total: this.steps.length, title: step.title }
        }));
      }, isCompactLayout() ? 230 : 80);
    }

    next() {
      if (this.stepIndex >= this.steps.length - 1) {
        this.finish('completed');
        return;
      }
      this.showStep(this.stepIndex + 1);
    }

    previous() {
      if (this.stepIndex > 0) this.showStep(this.stepIndex - 1);
    }

    schedulePosition() {
      cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => this.position());
    }

    position() {
      if (!this.active || !this.spotlight || !this.card) return;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const padding = viewportWidth < 480 ? 6 : 10;
      const targetRect = this.target?.getBoundingClientRect?.();
      const validTarget = targetRect && targetRect.width > 1 && targetRect.height > 1;
      const fallback = {
        top: Math.max(72, viewportHeight * 0.2),
        left: Math.max(12, viewportWidth * 0.12),
        right: Math.min(viewportWidth - 12, viewportWidth * 0.88),
        bottom: Math.min(viewportHeight - 84, viewportHeight * 0.72)
      };
      const rect = validTarget ? targetRect : fallback;
      const left = Math.max(6, rect.left - padding);
      const top = Math.max(6, rect.top - padding);
      const right = Math.min(viewportWidth - 6, rect.right + padding);
      const bottom = Math.min(viewportHeight - 6, rect.bottom + padding);

      Object.assign(this.spotlight.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.max(1, right - left)}px`,
        height: `${Math.max(1, bottom - top)}px`
      });

      const cardRect = this.card.getBoundingClientRect();
      const gap = 14;
      let cardTop = bottom + gap;
      if (cardTop + cardRect.height > viewportHeight - 10) cardTop = top - cardRect.height - gap;
      if (cardTop < 10) cardTop = Math.max(10, viewportHeight - cardRect.height - 10);

      let cardLeft = Math.min(Math.max(10, right - cardRect.width), viewportWidth - cardRect.width - 10);
      if (viewportWidth < 560) cardLeft = Math.max(10, (viewportWidth - cardRect.width) / 2);
      Object.assign(this.card.style, { top: `${cardTop}px`, left: `${cardLeft}px` });
    }

    handleKeydown(event) {
      if (!this.active || !this.root) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.finish('skipped');
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(this.card.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) {
        event.preventDefault();
        this.card.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!this.card.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    finish(reason = 'completed') {
      if (!this.active) return false;
      this.active = false;
      cancelAnimationFrame(this.rafId);
      clearTimeout(this.autoStartTimer);
      window.removeEventListener('resize', this.boundPosition);
      window.removeEventListener('scroll', this.boundPosition, true);
      document.removeEventListener('keydown', this.boundKeydown, true);
      document.body.classList.remove('osoos-tour-active');
      this.root?.remove();
      this.root = null;
      this.card = null;
      this.spotlight = null;
      this.target = null;
      saveCompletion(reason);

      if (isCompactLayout() && window.responsiveShell?.showPanel) {
        window.responsiveShell.showPanel(this.previousResponsivePanel, { focusPanel: false });
      }

      const focusTarget = this.previousFocus;
      setTimeout(() => {
        if (focusTarget?.isConnected && typeof focusTarget.focus === 'function') {
          focusTarget.focus({ preventScroll: true });
        } else {
          document.getElementById('beginner-mode-toggle')?.focus({ preventScroll: true });
        }
      }, 0);

      window.dispatchEvent(new CustomEvent('osoos:onboarding-complete', {
        detail: { reason: reason === 'completed' ? 'completed' : 'skipped' }
      }));
      return true;
    }

    reset() {
      if (this.active) this.finish('skipped');
      clearCompletion();
      return true;
    }
  }

  function init() {
    if (controller) return;
    controller = new OnboardingTour();
    controller.init();
  }

  ensureStylesheet();

  window.OsoosOnboardingTour = Object.freeze({
    storageKey: STORAGE_KEY,
    start: options => {
      if (!controller) init();
      return controller.start(options);
    },
    finish: reason => controller?.finish(reason) || false,
    reset: () => {
      if (!controller) init();
      return controller.reset();
    },
    isActive: () => Boolean(controller?.active),
    getStep: () => controller?.active ? controller.stepIndex + 1 : 0,
    getCompletion: readCompletion
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
