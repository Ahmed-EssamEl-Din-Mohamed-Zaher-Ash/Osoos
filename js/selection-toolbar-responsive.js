/* Keep selected-element actions usable inside narrow canvases and on touch screens. */
(function () {
  'use strict';

  const MOBILE_QUERY = '(max-width: 767.98px)';
  const GAP = 8;

  const ACTION_LABELS = {
    'bubble-select-parent': 'تحديد العنصر الأب',
    'bubble-layers-btn': 'اختيار طبقة العنصر',
    'bubble-move': 'تحريك العنصر',
    'bubble-snap': 'تبديل المحاذاة إلى الشبكة',
    'bubble-reset-move': 'إعادة تعيين موضع العنصر',
    'bubble-js-link': 'ربط تفاعل JavaScript',
    'bubble-delete': 'حذف العنصر'
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

  class ResponsiveSelectionToolbar {
    constructor(app) {
      this.app = app;
      this.highlighter = document.getElementById('element-highlighter');
      this.bubble = this.highlighter && this.highlighter.querySelector('.floating-action-bubble');
      this.canvas = app && app.canvas ? app.canvas : document.getElementById('builder-canvas');
      this.wrapper = app && app.canvasWrapper ? app.canvasWrapper : document.querySelector('.preview-canvas-wrapper');
      this.mobileQuery = window.matchMedia(MOBILE_QUERY);
      this.positionFrame = 0;
      this.nativeMenus = [];
      this.lastMoreTrigger = null;
    }

    init() {
      if (!this.app || !this.highlighter || !this.bubble || !this.canvas || !this.wrapper) return false;
      if (this.bubble.classList.contains('selection-toolbar-enhanced')) return true;

      this.bubble.classList.add('selection-toolbar-enhanced');
      this.bubble.setAttribute('role', 'toolbar');
      this.bubble.setAttribute('aria-label', 'أدوات العنصر المحدد');
      this.bubble.setAttribute('aria-orientation', 'horizontal');

      this.buildGroups();
      this.enhanceActions();
      this.bindEvents();
      this.wrapAppUpdates();
      this.observeMenus();
      this.schedulePosition();
      return true;
    }

    action(id) {
      return document.getElementById(id);
    }

    actionOwner(button) {
      if (!button) return null;
      const parent = button.parentElement;
      if (parent && parent !== this.bubble && parent.parentElement === this.bubble) {
        parent.classList.add('selection-action-wrapper');
        return parent;
      }
      return button;
    }

    buildGroups() {
      const badge = document.getElementById('bubble-el-name');
      if (badge) badge.setAttribute('aria-hidden', 'true');

      this.primary = document.createElement('div');
      this.primary.className = 'selection-toolbar-primary';

      const primaryIds = ['bubble-layers-btn', 'bubble-move', 'bubble-js-link'];
      primaryIds.forEach(id => {
        const button = this.action(id);
        const owner = this.actionOwner(button);
        if (!button || !owner) return;
        button.dataset.selectionPrimaryAction = 'true';
        this.primary.appendChild(owner);
      });

      this.moreButton = document.createElement('button');
      this.moreButton.type = 'button';
      this.moreButton.id = 'selection-toolbar-more';
      this.moreButton.className = 'bubble-btn selection-toolbar-more-button';
      this.moreButton.setAttribute('aria-label', 'المزيد من إجراءات العنصر');
      this.moreButton.setAttribute('aria-haspopup', 'menu');
      this.moreButton.setAttribute('aria-expanded', 'false');
      this.moreButton.setAttribute('aria-controls', 'selection-toolbar-menu');
      this.moreButton.innerHTML = '<i class="fas fa-ellipsis-h" aria-hidden="true"></i><span>المزيد</span>';

      this.moreMenu = document.createElement('div');
      this.moreMenu.id = 'selection-toolbar-menu';
      this.moreMenu.className = 'selection-toolbar-menu';
      this.moreMenu.setAttribute('role', 'menu');
      this.moreMenu.setAttribute('aria-label', 'إجراءات إضافية للعنصر');
      this.moreMenu.hidden = true;

      ['bubble-select-parent', 'bubble-snap', 'bubble-reset-move', 'bubble-delete'].forEach(id => {
        const button = this.action(id);
        if (!button) return;
        button.dataset.selectionOverflowAction = 'true';
        button.setAttribute('role', 'menuitem');
        this.moreMenu.appendChild(button);
      });

      if (badge) this.bubble.appendChild(badge);
      this.bubble.append(this.primary, this.moreButton, this.moreMenu);
    }

    enhanceActions() {
      Object.entries(ACTION_LABELS).forEach(([id, label]) => {
        const button = this.action(id);
        if (!button) return;
        button.type = 'button';
        button.setAttribute('aria-label', label);
      });

      this.registerNativeMenu('bubble-layers-btn', 'highlighter-layers-dropdown');
      this.registerNativeMenu('bubble-js-link', 'js-link-menu-dropdown');
    }

    registerNativeMenu(buttonId, menuId) {
      const button = this.action(buttonId);
      const menu = document.getElementById(menuId);
      if (!button || !menu) return;
      button.setAttribute('aria-haspopup', 'menu');
      button.setAttribute('aria-controls', menuId);
      button.setAttribute('aria-expanded', 'false');
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', button.getAttribute('aria-label') || 'قائمة إجراءات');
      this.nativeMenus.push({ button, menu });
      this.decorateMenuItems(menu);
    }

    decorateMenuItems(menu) {
      menu.querySelectorAll('a, button').forEach(item => {
        item.setAttribute('role', 'menuitem');
        if (item.tagName === 'A' && !item.getAttribute('href')) item.href = '#';
      });
    }

    bindEvents() {
      this.moreButton.addEventListener('click', event => {
        event.stopPropagation();
        this.toggleMoreMenu(true);
      });

      this.moreButton.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        event.stopPropagation();
        this.openMoreMenu(event.key === 'ArrowDown' ? 'first' : 'last');
      });

      this.moreMenu.addEventListener('keydown', event => this.handleMenuKeydown(event));
      this.moreMenu.addEventListener('click', event => {
        const action = event.target.closest('button[role="menuitem"]');
        if (action && !action.disabled) window.setTimeout(() => this.closeMoreMenu(false), 0);
      }, true);

      this.nativeMenus.forEach(({ button }) => {
        button.addEventListener('click', () => {
          this.closeMoreMenu(false);
          window.requestAnimationFrame(() => {
            this.syncNativeMenus();
            this.fitOpenNativeMenus();
          });
        });
      });

      document.addEventListener('pointerdown', event => {
        if (!this.bubble.contains(event.target)) {
          this.closeMoreMenu(false);
          this.closeNativeMenus();
        }
      }, true);

      document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (!this.moreMenu.hidden) {
          event.preventDefault();
          event.stopPropagation();
          this.closeMoreMenu(true);
          return;
        }
        const openNative = this.nativeMenus.find(({ menu }) => this.isMenuOpen(menu));
        if (openNative) {
          event.preventDefault();
          event.stopPropagation();
          this.closeNativeMenus(openNative.button);
        }
      }, true);

      const schedule = () => this.schedulePosition();
      window.addEventListener('resize', schedule, { passive: true });
      window.addEventListener('scroll', schedule, { passive: true, capture: true });
      this.wrapper.addEventListener('scroll', schedule, { passive: true });
      if (this.mobileQuery.addEventListener) this.mobileQuery.addEventListener('change', schedule);
      else this.mobileQuery.addListener(schedule);

      if (typeof ResizeObserver === 'function') {
        this.resizeObserver = new ResizeObserver(schedule);
        this.resizeObserver.observe(this.canvas);
        this.resizeObserver.observe(this.wrapper);
        this.resizeObserver.observe(this.bubble);
      }
    }

    observeMenus() {
      this.nativeMenus.forEach(({ menu }) => {
        const observer = new MutationObserver(() => {
          this.decorateMenuItems(menu);
          this.syncNativeMenus();
          if (this.isMenuOpen(menu)) window.requestAnimationFrame(() => this.fitDropdown(menu));
        });
        observer.observe(menu, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'hidden', 'class']
        });
      });
    }

    wrapAppUpdates() {
      if (this.app.__responsiveSelectionToolbarWrapped) return;
      const originalUpdate = this.app.updateHighlighter.bind(this.app);
      this.app.updateHighlighter = (...args) => {
        const result = originalUpdate(...args);
        this.updateAccessibleName();
        this.schedulePosition();
        return result;
      };
      this.app.__responsiveSelectionToolbarWrapped = true;
    }

    updateAccessibleName() {
      const badge = document.getElementById('highlighter-badge');
      const name = badge && badge.textContent ? `: ${badge.textContent.trim()}` : '';
      this.bubble.setAttribute('aria-label', `أدوات العنصر المحدد${name}`);
    }

    menuItems() {
      return Array.from(this.moreMenu.querySelectorAll('button[role="menuitem"]')).filter(button => {
        const style = window.getComputedStyle(button);
        return !button.disabled && !button.hidden && style.display !== 'none' && style.visibility !== 'hidden';
      });
    }

    toggleMoreMenu(focusItem) {
      if (this.moreMenu.hidden) this.openMoreMenu(focusItem ? 'first' : null);
      else this.closeMoreMenu(true);
    }

    openMoreMenu(focusTarget) {
      this.closeNativeMenus();
      this.moreMenu.hidden = false;
      this.moreButton.setAttribute('aria-expanded', 'true');
      this.lastMoreTrigger = this.moreButton;
      this.positionMoreMenu();
      if (focusTarget) {
        const items = this.menuItems();
        const item = focusTarget === 'last' ? items[items.length - 1] : items[0];
        if (item) item.focus({ preventScroll: true });
      }
    }

    closeMoreMenu(restoreFocus) {
      if (this.moreMenu.hidden) return;
      this.moreMenu.hidden = true;
      this.moreButton.setAttribute('aria-expanded', 'false');
      if (restoreFocus && this.lastMoreTrigger && this.lastMoreTrigger.isConnected) {
        this.lastMoreTrigger.focus({ preventScroll: true });
      }
    }

    handleMenuKeydown(event) {
      const items = this.menuItems();
      if (!items.length) return;
      const current = items.indexOf(document.activeElement);
      let next = -1;
      if (event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % items.length;
      else if (event.key === 'ArrowUp') next = current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = items.length - 1;
      else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.closeMoreMenu(true);
        return;
      }
      if (next >= 0) {
        event.preventDefault();
        event.stopPropagation();
        items[next].focus({ preventScroll: true });
      }
    }

    isMenuOpen(menu) {
      const style = window.getComputedStyle(menu);
      return !menu.hidden && style.display !== 'none' && style.visibility !== 'hidden';
    }

    syncNativeMenus() {
      this.nativeMenus.forEach(({ button, menu }) => {
        button.setAttribute('aria-expanded', String(this.isMenuOpen(menu)));
      });
    }

    closeNativeMenus(focusButton) {
      this.nativeMenus.forEach(({ button, menu }) => {
        if (this.isMenuOpen(menu)) menu.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
      });
      if (focusButton && focusButton.isConnected) focusButton.focus({ preventScroll: true });
    }

    visibleBoundary() {
      const canvasRect = this.canvas.getBoundingClientRect();
      const wrapperRect = this.wrapper.getBoundingClientRect();
      let left = Math.max(canvasRect.left, wrapperRect.left);
      let right = Math.min(canvasRect.right, wrapperRect.right);
      let top = Math.max(canvasRect.top, wrapperRect.top);
      let bottom = Math.min(canvasRect.bottom, wrapperRect.bottom);
      if (right - left < 80 || bottom - top < 48) {
        left = wrapperRect.left;
        right = wrapperRect.right;
        top = wrapperRect.top;
        bottom = wrapperRect.bottom;
      }
      return { left, right, top, bottom, width: right - left, height: bottom - top };
    }

    schedulePosition() {
      if (this.positionFrame) return;
      this.positionFrame = window.requestAnimationFrame(() => {
        this.positionFrame = 0;
        this.positionToolbar();
      });
    }

    updateSheetBottom() {
      const nav = document.getElementById('responsive-panel-nav');
      let bottom = 0;
      if (nav) {
        const style = window.getComputedStyle(nav);
        const rect = nav.getBoundingClientRect();
        if (style.display !== 'none' && style.visibility !== 'hidden' && rect.height > 0) {
          bottom = Math.max(0, window.innerHeight - rect.top);
        }
      }
      this.bubble.style.setProperty('--selection-toolbar-sheet-bottom', `${Math.round(bottom)}px`);
    }

    positionToolbar() {
      if (!this.app.selectedElement || window.getComputedStyle(this.highlighter).display === 'none') return;
      this.updateAccessibleName();
      this.updateSheetBottom();

      if (this.mobileQuery.matches) {
        this.bubble.dataset.selectionPlacement = 'bottom-sheet';
        this.bubble.classList.remove('selection-toolbar-tight');
        this.bubble.style.removeProperty('--selection-toolbar-max-width');
        this.bubble.style.removeProperty('top');
        this.bubble.style.removeProperty('left');
        this.bubble.style.removeProperty('bottom');
        this.positionMoreMenu();
        this.fitOpenNativeMenus();
        return;
      }

      const boundary = this.visibleBoundary();
      this.bubble.style.setProperty('--selection-toolbar-max-width', `${Math.max(160, boundary.width - 2 * GAP)}px`);
      this.bubble.classList.toggle('selection-toolbar-tight', boundary.width < 360);

      /* Anchor to the real selected node. The legacy border overlay lives next
         to (not inside) the scrolling wrapper and can carry a stale scroll
         offset, while the element rect is always in viewport coordinates. */
      const anchorRect = this.app.selectedElement.getBoundingClientRect();
      const bubbleRect = this.bubble.getBoundingClientRect();
      const width = Math.min(bubbleRect.width, boundary.width);
      const desiredLeft = clamp(anchorRect.left, boundary.left, boundary.right - width);
      const aboveTop = anchorRect.top - bubbleRect.height - GAP;
      const belowTop = anchorRect.bottom + GAP;
      const fitsAbove = aboveTop >= boundary.top;
      const fitsBelow = belowTop + bubbleRect.height <= boundary.bottom;
      let desiredTop;
      let placement;

      if (fitsAbove || !fitsBelow) {
        desiredTop = fitsAbove ? aboveTop : clamp(aboveTop, boundary.top, boundary.bottom - bubbleRect.height);
        placement = fitsAbove ? 'above' : 'inside';
      } else {
        desiredTop = belowTop;
        placement = 'below';
      }

      /* Fixed positioning avoids inheriting the canvas wrapper's scroll offset.
         The legacy highlighter itself is absolutely positioned in a sibling of
         the scrolling canvas, so relative toolbar coordinates drift at scroll. */
      this.bubble.style.left = `${Math.round(desiredLeft)}px`;
      this.bubble.style.top = `${Math.round(desiredTop)}px`;
      this.bubble.style.bottom = 'auto';
      this.bubble.dataset.selectionPlacement = placement;
      this.positionMoreMenu();
      this.fitOpenNativeMenus();
    }

    positionMoreMenu() {
      if (this.moreMenu.hidden || this.mobileQuery.matches) {
        this.moreMenu.classList.remove('selection-menu-above');
        return;
      }
      this.moreMenu.classList.remove('selection-menu-above');
      const boundary = this.visibleBoundary();
      const bubbleRect = this.bubble.getBoundingClientRect();
      const menuRect = this.moreMenu.getBoundingClientRect();
      const roomBelow = boundary.bottom - bubbleRect.bottom;
      const roomAbove = bubbleRect.top - boundary.top;
      if (roomBelow < menuRect.height + 6 && roomAbove > roomBelow) {
        this.moreMenu.classList.add('selection-menu-above');
      }
    }

    fitOpenNativeMenus() {
      this.nativeMenus.forEach(({ menu }) => {
        if (this.isMenuOpen(menu)) this.fitDropdown(menu);
      });
    }

    fitDropdown(menu) {
      if (this.mobileQuery.matches) return;
      const boundary = this.visibleBoundary();
      const owner = menu.parentElement;
      if (!owner) return;

      menu.style.left = 'auto';
      menu.style.right = 'auto';
      menu.style.top = 'calc(100% + 6px)';
      menu.style.bottom = 'auto';

      const ownerRect = owner.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const desiredLeft = clamp(ownerRect.right - menuRect.width, boundary.left, boundary.right - menuRect.width);
      menu.style.left = `${Math.round(desiredLeft - ownerRect.left)}px`;

      if (menuRect.bottom > boundary.bottom && ownerRect.top - menuRect.height - 6 >= boundary.top) {
        menu.style.top = 'auto';
        menu.style.bottom = 'calc(100% + 6px)';
      }
    }
  }

  function boot() {
    if (window.responsiveSelectionToolbar) return;
    const app = window.appInstance;
    if (!app) {
      window.setTimeout(boot, 25);
      return;
    }
    const controller = new ResponsiveSelectionToolbar(app);
    if (controller.init()) window.responsiveSelectionToolbar = controller;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
