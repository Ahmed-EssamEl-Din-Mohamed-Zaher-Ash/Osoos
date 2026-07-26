/* Responsive workspace navigation for tablet and phone layouts. */
(function () {
  'use strict';

  class ResponsiveShellController {
    constructor() {
      this.compactQuery = window.matchMedia('(max-width: 1199px)');
      this.workspace = document.querySelector('.app-workspace');
      this.center = document.querySelector('.center-workspace');
      this.propertiesPanel = document.querySelector('.side-panel.panel-left');
      this.elementsPanel = document.querySelector('.side-panel.panel-right');
      this.activePanel = 'canvas';
      this.lastTrigger = null;
      this.resizeTimer = null;
    }

    init() {
      if (!this.workspace || !this.center || !this.propertiesPanel || !this.elementsPanel) return;

      this.createNavigation();
      this.bindExistingControls();
      this.compactQuery.addEventListener('change', () => this.syncViewport());
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          this.syncViewport();
          window.appInstance?.updateHighlighter?.();
        }, 120);
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && this.isCompact() && this.activePanel !== 'canvas') {
          event.preventDefault();
          this.showPanel('canvas', { restoreFocus: true });
        }
      });

      this.syncViewport(true);
    }

    createNavigation() {
      if (document.getElementById('responsive-panel-nav')) return;

      const backdrop = document.createElement('button');
      backdrop.type = 'button';
      backdrop.id = 'responsive-panel-backdrop';
      backdrop.className = 'responsive-panel-backdrop';
      backdrop.setAttribute('aria-label', 'إغلاق اللوحة والعودة إلى الصفحة');
      backdrop.hidden = true;
      backdrop.addEventListener('click', () => this.showPanel('canvas'));

      const nav = document.createElement('nav');
      nav.id = 'responsive-panel-nav';
      nav.className = 'responsive-panel-nav';
      nav.setAttribute('aria-label', 'أقسام مساحة التصميم');
      nav.innerHTML = `
        <button type="button" data-shell-panel="elements" aria-pressed="false">
          <i class="fas fa-shapes" aria-hidden="true"></i><span>العناصر</span>
        </button>
        <button type="button" data-shell-panel="canvas" aria-pressed="true">
          <i class="fas fa-pen-ruler" aria-hidden="true"></i><span>الصفحة</span>
        </button>
        <button type="button" data-shell-panel="properties" aria-pressed="false">
          <i class="fas fa-sliders" aria-hidden="true"></i><span>الخصائص</span>
        </button>
      `;
      nav.addEventListener('click', event => {
        const button = event.target.closest('[data-shell-panel]');
        if (!button) return;
        this.lastTrigger = button;
        this.showPanel(button.dataset.shellPanel, { focusPanel: button.dataset.shellPanel !== 'canvas' });
      });

      this.workspace.append(backdrop, nav);
      this.backdrop = backdrop;
      this.nav = nav;
    }

    bindExistingControls() {
      document.querySelectorAll('.sidebar-icon-btn').forEach(button => {
        button.addEventListener('click', () => {
          if (!this.isCompact()) return;
          this.lastTrigger = button;
          this.showPanel('properties');
        });
      });

      document.getElementById('expand-right-btn')?.addEventListener('click', () => {
        if (!this.isCompact()) return;
        this.showPanel('elements');
      });

      document.getElementById('collapse-left-btn')?.addEventListener('click', () => {
        if (!this.isCompact()) return;
        setTimeout(() => this.showPanel('canvas'), 0);
      });

      document.getElementById('collapse-right-btn')?.addEventListener('click', () => {
        if (!this.isCompact()) return;
        setTimeout(() => this.showPanel('canvas'), 0);
      });
    }

    isCompact() {
      return this.compactQuery.matches;
    }

    syncViewport(initial = false) {
      const compact = this.isCompact();
      document.body.classList.toggle('responsive-shell-compact', compact);

      if (!compact) {
        delete document.body.dataset.responsivePanel;
        this.center.inert = false;
        this.propertiesPanel.inert = false;
        this.elementsPanel.inert = false;
        this.propertiesPanel.removeAttribute('aria-hidden');
        this.elementsPanel.removeAttribute('aria-hidden');
        if (this.backdrop) this.backdrop.hidden = true;
        return;
      }

      if (initial || !['canvas', 'elements', 'properties'].includes(this.activePanel)) {
        this.activePanel = 'canvas';
      }
      this.showPanel(this.activePanel, { focusPanel: false });
    }

    showPanel(panel, options = {}) {
      if (!['canvas', 'elements', 'properties'].includes(panel)) panel = 'canvas';
      if (!this.isCompact()) return;

      const app = window.appInstance;
      if (panel === 'properties' && typeof app?.collapseLeft === 'function') app.collapseLeft(false);
      if (panel === 'elements' && typeof app?.collapseRight === 'function') app.collapseRight(false);

      this.activePanel = panel;
      document.body.dataset.responsivePanel = panel;
      const panelIsOpen = panel !== 'canvas';

      this.center.inert = panelIsOpen;
      this.propertiesPanel.inert = panel !== 'properties';
      this.elementsPanel.inert = panel !== 'elements';
      this.propertiesPanel.setAttribute('aria-hidden', String(panel !== 'properties'));
      this.elementsPanel.setAttribute('aria-hidden', String(panel !== 'elements'));
      if (this.backdrop) this.backdrop.hidden = !panelIsOpen;

      this.nav?.querySelectorAll('[data-shell-panel]').forEach(button => {
        const active = button.dataset.shellPanel === panel;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      if (options.focusPanel && panelIsOpen) {
        const targetPanel = panel === 'elements' ? this.elementsPanel : this.propertiesPanel;
        const focusTarget = targetPanel.querySelector('input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
        setTimeout(() => focusTarget?.focus({ preventScroll: true }), 180);
      } else if (options.restoreFocus) {
        const fallback = this.nav?.querySelector('[data-shell-panel="canvas"]');
        setTimeout(() => (this.lastTrigger || fallback)?.focus({ preventScroll: true }), 0);
      }

      setTimeout(() => app?.updateHighlighter?.(), 220);
    }
  }

  const start = () => {
    const controller = new ResponsiveShellController();
    controller.init();
    window.responsiveShell = controller;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
