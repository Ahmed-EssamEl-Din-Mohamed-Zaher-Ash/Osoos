/*
 * DOM Tree clarity and always-available drawer.
 *
 * This module decorates the tree rendered by DOMTreeManager. It never clones
 * tree nodes and never replaces their wrappers, so Symbol element references,
 * drag/drop delegation, selection and deletion keep working unchanged.
 */
(function domTreeClarityModule() {
  'use strict';

  if (window.DOMTreeClarity && window.DOMTreeClarity.version) {
    window.DOMTreeClarity.enhance();
    return;
  }

  const VERSION = '1.1.0';
  const ROOT_ID = 'dom-tree-root';
  const DRAWER_ID = 'dom-tree-clarity-drawer-root';
  const DIALOG_ID = 'dom-tree-clarity-dialog';
  const TITLE_ID = 'dom-tree-clarity-title';
  const INSTRUCTIONS_ID = 'dom-tree-clarity-instructions';
  const MOBILE_ELEMENTS_TAB_ID = 'dom-tree-mobile-elements-tab';
  const ELEMENTS_SWITCH_ID = 'dom-tree-elements-switch-btn';
  const DOCKED_QUERY = window.matchMedia('(min-width: 768px)');

  let root = null;
  let observer = null;
  let scheduled = false;
  let drawerRoot = null;
  let drawer = null;
  let drawerBody = null;
  let openButton = null;
  let previousFocus = null;
  let sectionPlaceholder = null;
  let treeSection = null;
  let closeTimer = null;
  let dockedWorkspaceState = null;
  let layoutListenerBound = false;
  let layoutResizeTimer = null;

  function ensureStyles() {
    const hasStyles = Array.from(document.styleSheets || []).some((sheet) => {
      try { return sheet.href && /(?:^|\/)dom-tree-clarity\.css(?:\?|$)/.test(sheet.href); }
      catch (error) { return false; }
    });
    if (hasStyles || document.querySelector(
      'link[data-dom-tree-clarity-styles], link[href*="dom-tree-clarity.css"]'
    )) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.domTreeClarityStyles = 'true';
    const activeScript = document.currentScript;
    link.href = activeScript && activeScript.src
      ? new URL('../css/dom-tree-clarity.css', activeScript.src).href
      : 'css/dom-tree-clarity.css';
    document.head.appendChild(link);
  }

  function createElement(tag, options = {}, children = []) {
    const element = document.createElement(tag);
    if (options.id) element.id = options.id;
    if (options.className) element.className = options.className;
    if (options.text !== undefined) element.textContent = options.text;
    Object.entries(options.attributes || {}).forEach(([name, value]) => {
      element.setAttribute(name, String(value));
    });
    children.forEach((child) => element.appendChild(child));
    return element;
  }

  function ensureInstructions() {
    let instructions = document.getElementById(INSTRUCTIONS_ID);
    if (!instructions) {
      instructions = createElement('p', {
        id: INSTRUCTIONS_ID,
        className: 'dom-tree-sr-only',
        text: 'استخدم السهمين أعلى وأسفل للتنقل، ويمين ويسار لفتح الفروع وطيها، وEnter أو المسافة لتحديد العنصر.'
      });
      document.body.appendChild(instructions);
    }
    root.setAttribute('aria-describedby', INSTRUCTIONS_ID);
    root.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space');
  }

  function createLegendToken(text, type) {
    return createElement('code', {
      className: `dom-tree-legend-token is-${type}`,
      text,
      attributes: { dir: 'ltr' }
    });
  }

  function ensureLegend() {
    const panelContent = root.closest('.panel-content') || root.parentElement;
    if (!panelContent) return;

    let legend = panelContent.querySelector(':scope > .dom-tree-clarity-legend');
    if (!legend) {
      legend = createElement('div', {
        className: 'dom-tree-clarity-legend',
        attributes: {
          role: 'note',
          'aria-label': 'دليل قراءة أسماء عناصر شجرة DOM'
        }
      }, [
        createElement('span', { className: 'dom-tree-legend-title' }, [
          createElement('i', { className: 'fas fa-circle-info', attributes: { 'aria-hidden': 'true' } }),
          createElement('span', { text: 'دليل الاسم' })
        ]),
        createLegendToken('<tag>', 'tag'),
        createLegendToken('#id', 'id'),
        createLegendToken('.class', 'class')
      ]);
      panelContent.insertBefore(legend, root);
    }
  }

  function ensureOpenButton() {
    const host = document.querySelector('.preview-header-left') || document.querySelector('.preview-header-bar');
    if (!host) return;

    openButton = document.getElementById('dom-tree-open-btn');
    if (openButton) return;

    openButton = createElement('button', {
      id: 'dom-tree-open-btn',
      className: 'dom-tree-open-btn',
      attributes: {
        type: 'button',
        'aria-controls': DIALOG_ID,
        'aria-expanded': 'false',
        'aria-haspopup': 'dialog',
        title: 'عرض الهيكل الكامل للصفحة'
      }
    }, [
      createElement('i', { className: 'fas fa-sitemap', attributes: { 'aria-hidden': 'true' } }),
      createElement('span', { className: 'dom-tree-open-label', text: 'شجرة DOM' }),
      createElement('span', {
        className: 'dom-tree-open-count',
        text: '0',
        attributes: { 'aria-hidden': 'true' }
      })
    ]);
    host.prepend(openButton);
    openButton.addEventListener('click', openDrawer);
  }

  function ensureDrawer() {
    drawerRoot = document.getElementById(DRAWER_ID);
    if (drawerRoot) {
      drawer = drawerRoot.querySelector('.dom-tree-drawer');
      drawerBody = drawerRoot.querySelector('.dom-tree-drawer-body');
      ensureDrawerControls();
      ensureElementsPanelSwitch();
      syncDrawerSemantics();
      return;
    }

    const backdrop = createElement('button', {
      className: 'dom-tree-drawer-backdrop',
      attributes: { type: 'button', tabindex: '-1', 'aria-label': 'إغلاق شجرة DOM' }
    });
    const closeButton = createElement('button', {
      className: 'dom-tree-drawer-close',
      attributes: { type: 'button', 'aria-label': 'إغلاق شجرة DOM', title: 'إغلاق' }
    }, [createElement('i', { className: 'fas fa-xmark', attributes: { 'aria-hidden': 'true' } })]);

    const mobileSwitch = createElement('div', {
      className: 'dom-tree-mobile-tabs',
      attributes: {
        role: 'group',
        'aria-label': '\u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u0628\u064a\u0646 \u0634\u062c\u0631\u0629 DOM \u0648\u0644\u0648\u062d\u0629 \u0627\u0644\u0639\u0646\u0627\u0635\u0631'
      }
    }, [
      createElement('button', {
        id: 'dom-tree-mobile-dom-tab',
        className: 'dom-tree-mobile-tab is-active',
        text: '\u0634\u062c\u0631\u0629 DOM',
        attributes: { type: 'button', 'aria-pressed': 'true' }
      }),
      createElement('button', {
        id: MOBILE_ELEMENTS_TAB_ID,
        className: 'dom-tree-mobile-tab',
        text: '\u0627\u0644\u0639\u0646\u0627\u0635\u0631',
        attributes: { type: 'button', 'aria-pressed': 'false', 'data-dom-tree-action': 'elements' }
      })
    ]);

    const header = createElement('header', { className: 'dom-tree-drawer-header' }, [
      createElement('span', { className: 'dom-tree-drawer-title-icon' }, [
        createElement('i', { className: 'fas fa-sitemap', attributes: { 'aria-hidden': 'true' } })
      ]),
      createElement('div', { className: 'dom-tree-drawer-heading' }, [
        createElement('strong', { id: TITLE_ID, text: 'شجرة DOM' }),
        createElement('span', { text: 'اختر عنصرًا، افتح فروعه أو اسحبه لإعادة الترتيب' })
      ]),
      createElement('span', {
        className: 'dom-tree-drawer-count',
        text: '0',
        attributes: { 'aria-label': 'عدد العناصر: 0' }
      }),
      closeButton,
      mobileSwitch
    ]);

    drawerBody = createElement('div', { className: 'dom-tree-drawer-body' });
    drawer = createElement('aside', {
      id: DIALOG_ID,
      className: 'dom-tree-drawer',
      attributes: {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': TITLE_ID,
        'aria-describedby': INSTRUCTIONS_ID,
        tabindex: '-1'
      }
    }, [header, drawerBody]);

    drawerRoot = createElement('div', {
      id: DRAWER_ID,
      className: 'dom-tree-drawer-root',
      attributes: { hidden: '', 'aria-hidden': 'true' }
    }, [backdrop, drawer]);

    document.body.appendChild(drawerRoot);
    backdrop.addEventListener('click', closeDrawer);
    closeButton.addEventListener('click', closeDrawer);
    drawerRoot.addEventListener('keydown', handleDrawerKeyDown);
    ensureDrawerControls();
    ensureElementsPanelSwitch();
    syncDrawerSemantics();
  }

  function isDockedLayout() {
    return DOCKED_QUERY.matches;
  }

  function syncDrawerSemantics() {
    if (!drawerRoot || !drawer) return;
    const docked = isDockedLayout();
    drawerRoot.dataset.layout = docked ? 'docked' : 'modal';

    if (docked) {
      drawer.setAttribute('role', 'region');
      drawer.removeAttribute('aria-modal');
      openButton?.removeAttribute('aria-haspopup');
    } else {
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      openButton?.setAttribute('aria-haspopup', 'dialog');
    }
  }

  function ensureDrawerControls() {
    if (!drawerRoot) return;
    const domTab = drawerRoot.querySelector('#dom-tree-mobile-dom-tab');
    const elementsTab = drawerRoot.querySelector(`#${MOBILE_ELEMENTS_TAB_ID}`);

    if (domTab && !domTab.dataset.domTreeBound) {
      domTab.dataset.domTreeBound = 'true';
      domTab.addEventListener('click', () => {
        const focusTarget = root?.querySelector('[role="treeitem"][tabindex="0"]') || drawer;
        focusTarget?.focus({ preventScroll: true });
      });
    }

    if (elementsTab && !elementsTab.dataset.domTreeBound) {
      elementsTab.dataset.domTreeBound = 'true';
      elementsTab.addEventListener('click', () => {
        const shell = window.responsiveShell;
        const panel = document.querySelector('.side-panel.panel-right');
        const revealPalette = () => {
          const htmlDetails = panel?.querySelector('.beginner-html-details');
          if (htmlDetails) htmlDetails.open = true;
        };

        closeDrawer({
          restoreFocus: false,
          afterClose: () => {
            revealPalette();
            if (!shell || typeof shell.showPanel !== 'function') {
              panel?.querySelector('input, button, [tabindex="0"]')?.focus({ preventScroll: true });
            }
          }
        });

        if (shell && typeof shell.showPanel === 'function') {
          shell.showPanel('elements', { focusPanel: true });
        }
        revealPalette();
      });
    }
  }

  function ensureElementsPanelSwitch() {
    const panel = document.querySelector('.side-panel.panel-right');
    const header = panel?.querySelector(':scope > .panel-header');
    if (!header || document.getElementById(ELEMENTS_SWITCH_ID)) return;

    const button = createElement('button', {
      id: ELEMENTS_SWITCH_ID,
      className: 'dom-tree-elements-switch-btn',
      attributes: {
        type: 'button',
        title: '\u0641\u062a\u062d \u0634\u062c\u0631\u0629 DOM',
        'aria-label': '\u0641\u062a\u062d \u0634\u062c\u0631\u0629 DOM'
      }
    }, [
      createElement('i', { className: 'fas fa-sitemap', attributes: { 'aria-hidden': 'true' } }),
      createElement('span', { text: '\u0634\u062c\u0631\u0629 DOM' })
    ]);

    header.appendChild(button);
    button.addEventListener('click', () => {
      const shell = window.responsiveShell;
      if (shell && typeof shell.showPanel === 'function' && shell.isCompact?.()) {
        shell.showPanel('canvas', { focusPanel: false });
      }
      openButton?.focus({ preventScroll: true });
      openDrawer();
    });
  }

  function getFocusableElements() {
    if (!drawer) return [];
    return Array.from(drawer.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => {
      if (element.closest('[hidden], .dom-tree-children[hidden]')) return false;
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  function readAttributeState(element, name) {
    return element?.hasAttribute(name) ? element.getAttribute(name) : null;
  }

  function restoreAttributeState(element, name, value) {
    if (!element) return;
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }

  function prepareDockedWorkspace() {
    const elementsPanel = document.querySelector('.side-panel.panel-right');
    const centerWorkspace = document.querySelector('.center-workspace');
    const responsiveBackdrop = document.getElementById('responsive-panel-backdrop');
    const htmlDetails = elementsPanel?.querySelector('.beginner-html-details');

    if (!dockedWorkspaceState) {
      dockedWorkspaceState = {
        elementsPanel,
        centerWorkspace,
        responsiveBackdrop,
        elementsPanelInert: !!elementsPanel?.inert,
        elementsPanelAriaHidden: readAttributeState(elementsPanel, 'aria-hidden'),
        centerWorkspaceInert: !!centerWorkspace?.inert,
        responsiveBackdropHidden: responsiveBackdrop ? responsiveBackdrop.hidden : true,
        elementsPanelCollapsed: !!elementsPanel?.classList.contains('collapsed'),
        htmlDetails,
        htmlDetailsOpen: !!htmlDetails?.open
      };
      if (htmlDetails) htmlDetails.open = true;
    }

    if (elementsPanel?.classList.contains('collapsed')) {
      if (typeof window.appInstance?.collapseRight === 'function') {
        window.appInstance.collapseRight(false);
      } else {
        elementsPanel.classList.remove('collapsed');
      }
    }

    if (elementsPanel) {
      elementsPanel.inert = false;
      elementsPanel.removeAttribute('aria-hidden');
    }
    if (centerWorkspace) centerWorkspace.inert = false;
    if (responsiveBackdrop) responsiveBackdrop.hidden = true;

    document.body.classList.add('dom-tree-drawer-docked');
    window.setTimeout(() => window.appInstance?.updateHighlighter?.(), 220);
  }

  function releaseDockedWorkspace() {
    document.body.classList.remove('dom-tree-drawer-docked');
    if (!dockedWorkspaceState) return;

    const state = dockedWorkspaceState;
    dockedWorkspaceState = null;

    if (state.elementsPanelCollapsed) {
      if (typeof window.appInstance?.collapseRight === 'function') {
        window.appInstance.collapseRight(true);
      } else {
        state.elementsPanel?.classList.add('collapsed');
      }
    }

    state.elementsPanel && (state.elementsPanel.inert = state.elementsPanelInert);
    state.centerWorkspace && (state.centerWorkspace.inert = state.centerWorkspaceInert);
    restoreAttributeState(state.elementsPanel, 'aria-hidden', state.elementsPanelAriaHidden);
    if (state.responsiveBackdrop) state.responsiveBackdrop.hidden = state.responsiveBackdropHidden;
    if (state.htmlDetails) state.htmlDetails.open = state.htmlDetailsOpen;

    if (window.responsiveShell?.isCompact?.()) {
      window.responsiveShell.syncViewport?.();
    }
    window.setTimeout(() => window.appInstance?.updateHighlighter?.(), 220);
  }

  function syncOpenLayout() {
    syncDrawerSemantics();
    if (!drawerRoot?.classList.contains('is-open')) return;

    if (isDockedLayout()) {
      prepareDockedWorkspace();
      return;
    }

    releaseDockedWorkspace();
    drawer?.focus({ preventScroll: true });
  }

  function handleGlobalEscape(event) {
    if (event.key !== 'Escape' || event.defaultPrevented || !drawerRoot?.classList.contains('is-open')) return;
    event.preventDefault();
    event.stopPropagation();
    closeDrawer();
  }

  function handleViewportResize() {
    if (layoutResizeTimer) window.clearTimeout(layoutResizeTimer);
    layoutResizeTimer = window.setTimeout(() => {
      layoutResizeTimer = null;
      syncDrawerSemantics();
      if (drawerRoot?.classList.contains('is-open') && isDockedLayout()) {
        prepareDockedWorkspace();
      }
    }, 180);
  }

  function handleDrawerKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== 'Tab' || isDockedLayout()) return;

    const focusable = getFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      drawer.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === drawer)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === drawer) {
      event.preventDefault();
      first.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function mountTreeInDrawer() {
    treeSection = root.closest('.dom-tree-section');
    if (!treeSection || !drawerBody) return false;

    if (!sectionPlaceholder || !sectionPlaceholder.isConnected) {
      sectionPlaceholder = document.createComment('dom-tree-section-home');
      treeSection.parentNode.insertBefore(sectionPlaceholder, treeSection);
    }
    drawerBody.appendChild(treeSection);
    return true;
  }

  function restoreTreeSection() {
    if (!treeSection || !sectionPlaceholder || !sectionPlaceholder.parentNode) return;
    sectionPlaceholder.parentNode.insertBefore(treeSection, sectionPlaceholder.nextSibling);
    sectionPlaceholder.remove();
    sectionPlaceholder = null;
  }

  function openDrawer() {
    ensureDrawer();
    if (!drawerRoot || drawerRoot.classList.contains('is-open')) return;
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (!mountTreeInDrawer()) return;

    syncDrawerSemantics();
    if (isDockedLayout()) prepareDockedWorkspace();

    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : openButton;
    drawerRoot.hidden = false;
    drawerRoot.setAttribute('aria-hidden', 'false');
    if ('inert' in drawerRoot) drawerRoot.inert = false;
    document.body.classList.add('dom-tree-drawer-open');
    if (openButton) openButton.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', handleGlobalEscape, true);

    window.requestAnimationFrame(() => {
      drawerRoot.classList.add('is-open');
      if (!isDockedLayout()) drawer.focus({ preventScroll: true });
    });
  }

  function closeDrawer(options = {}) {
    if (!drawerRoot || drawerRoot.hidden) return;
    if (!drawerRoot.classList.contains('is-open') && closeTimer) return;
    drawerRoot.classList.remove('is-open');
    document.body.classList.remove('dom-tree-drawer-open');
    if (openButton) openButton.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', handleGlobalEscape, true);

    const focusTarget = previousFocus && previousFocus.isConnected ? previousFocus : openButton;
    if (options.restoreFocus !== false && focusTarget) focusTarget.focus({ preventScroll: true });
    drawerRoot.setAttribute('aria-hidden', 'true');
    if ('inert' in drawerRoot) drawerRoot.inert = true;

    const finish = () => {
      restoreTreeSection();
      releaseDockedWorkspace();
      drawerRoot.hidden = true;
      closeTimer = null;
      if (typeof options.afterClose === 'function') options.afterClose();
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    closeTimer = window.setTimeout(finish, reducedMotion ? 0 : 210);
  }

  function splitLabel(rawLabel) {
    const raw = String(rawLabel || '').trim();
    const tagMatch = raw.match(/^([a-zA-Z][\w:-]*)/);
    if (!tagMatch) return [{ type: 'tag', value: raw || 'element' }];

    const tokens = [{ type: 'tag', value: tagMatch[1] }];
    const suffix = raw.slice(tagMatch[1].length);
    const tokenPattern = /([#.])([^#.]+)/g;
    let match;
    while ((match = tokenPattern.exec(suffix))) {
      tokens.push({ type: match[1] === '#' ? 'id' : 'class', value: `${match[1]}${match[2]}` });
    }
    if (tokens.length === 1 && suffix) tokens.push({ type: 'class', value: suffix });
    return tokens;
  }

  function accessibleNodeLabel(tokens, level) {
    const tag = tokens.find((token) => token.type === 'tag');
    const id = tokens.find((token) => token.type === 'id');
    const classes = tokens.filter((token) => token.type === 'class');
    const parts = [`عنصر ${tag ? tag.value : 'HTML'}`];
    if (id) parts.push(`المعرّف ${id.value.slice(1)}`);
    if (classes.length) parts.push(`الصنف ${classes.map((token) => token.value.slice(1)).join('، ')}`);
    parts.push(`المستوى ${level}`);
    return parts.join('، ');
  }

  function enhanceLabel(item) {
    const label = item.querySelector(':scope > .dom-tree-node-wrapper .dom-node-label');
    if (!label || label.querySelector('input, textarea, select, button, [contenteditable="true"]')) return;

    const alreadyEnhanced = !!label.querySelector(':scope > .dom-tree-label-token');
    let raw = alreadyEnhanced ? label.dataset.domTreeRawLabel : label.textContent.trim();
    if (!raw) raw = label.title || 'element';
    if (alreadyEnhanced && label.dataset.domTreeRawLabel === raw) {
      const tokens = splitLabel(raw);
      item.setAttribute('aria-label', accessibleNodeLabel(tokens, item.getAttribute('aria-level') || '1'));
      return;
    }

    const tokens = splitLabel(raw);
    const fragment = document.createDocumentFragment();
    tokens.forEach((token) => {
      fragment.appendChild(createElement('span', {
        className: `dom-tree-label-token dom-tree-label-${token.type}`,
        text: token.value,
        attributes: { dir: 'ltr', 'aria-hidden': 'true' }
      }));
    });
    label.replaceChildren(fragment);
    label.dataset.domTreeRawLabel = raw;
    label.title = raw;
    item.setAttribute('aria-label', accessibleNodeLabel(tokens, item.getAttribute('aria-level') || '1'));
    item.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space');
  }

  function updateTreePositions() {
    const groups = [root, ...root.querySelectorAll('.dom-tree-children[role="group"]')];
    groups.forEach((group) => {
      const items = Array.from(group.children).filter((child) => {
        return child.classList && child.classList.contains('dom-tree-item') && child.getAttribute('role') === 'treeitem';
      });
      items.forEach((item, index) => {
        item.setAttribute('aria-posinset', String(index + 1));
        item.setAttribute('aria-setsize', String(items.length));
      });
    });
  }

  function ensureEmptyState(count) {
    let emptyState = root.querySelector(':scope > .dom-tree-empty-state');
    const rootDropZone = root.querySelector(':scope > .dom-tree-root-drop-zone');
    if (rootDropZone) rootDropZone.tabIndex = -1;

    if (count > 0) {
      if (emptyState) emptyState.remove();
      return;
    }
    if (emptyState) return;

    emptyState = createElement('li', {
      className: 'dom-tree-empty-state',
      attributes: { role: 'none' }
    }, [
      createElement('i', { className: 'fas fa-sitemap', attributes: { 'aria-hidden': 'true' } }),
      createElement('div', { className: 'dom-tree-empty-copy', attributes: { role: 'status' } }, [
        createElement('strong', { text: 'شجرة الصفحة فارغة' }),
        createElement('span', { text: 'أضف مكوّنًا أو عنصر HTML، وسيظهر هنا بترتيبه الحقيقي داخل الصفحة.' })
      ])
    ]);
    root.insertBefore(emptyState, rootDropZone || null);
  }

  function updateCounts(count) {
    const openCount = openButton && openButton.querySelector('.dom-tree-open-count');
    if (openCount) openCount.textContent = String(count);

    const drawerCount = drawerRoot && drawerRoot.querySelector('.dom-tree-drawer-count');
    if (drawerCount) {
      drawerCount.textContent = String(count);
      drawerCount.setAttribute('aria-label', `عدد العناصر: ${count}`);
    }

    const panelHeader = treeSection && treeSection.querySelector(':scope > .panel-header');
    if (panelHeader) {
      let headerCount = panelHeader.querySelector('.dom-tree-header-count');
      if (!headerCount) {
        headerCount = createElement('span', { className: 'dom-tree-header-count', attributes: { 'aria-hidden': 'true' } });
        panelHeader.appendChild(headerCount);
      }
      headerCount.textContent = String(count);
    }
  }

  function enhance() {
    scheduled = false;
    const nextRoot = document.getElementById(ROOT_ID);
    if (!nextRoot) return;
    root = nextRoot;
    treeSection = root.closest('.dom-tree-section') || treeSection;

    root.classList.add('dom-tree-clarity-active');
    root.setAttribute('aria-label', 'شجرة DOM للصفحة');
    ensureInstructions();
    ensureLegend();
    ensureOpenButton();
    ensureDrawer();

    const items = Array.from(root.querySelectorAll('.dom-tree-item[role="treeitem"]'));
    items.forEach(enhanceLabel);
    updateTreePositions();
    ensureEmptyState(items.length);
    updateCounts(items.length);
  }

  function scheduleEnhance() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(enhance);
  }

  function observeTree() {
    if (!root) return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(scheduleEnhance);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'aria-selected', 'aria-expanded', 'hidden']
    });
  }

  function start() {
    ensureStyles();
    root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (!layoutListenerBound) {
      if (typeof DOCKED_QUERY.addEventListener === 'function') {
        DOCKED_QUERY.addEventListener('change', syncOpenLayout);
      } else {
        DOCKED_QUERY.addListener(syncOpenLayout);
      }
      layoutListenerBound = true;
      window.addEventListener('resize', handleViewportResize);
    }
    enhance();
    observeTree();
  }

  function destroy() {
    if (observer) observer.disconnect();
    observer = null;
    if (drawerRoot && !drawerRoot.hidden) closeDrawer();
    if (layoutListenerBound) {
      if (typeof DOCKED_QUERY.removeEventListener === 'function') {
        DOCKED_QUERY.removeEventListener('change', syncOpenLayout);
      } else {
        DOCKED_QUERY.removeListener(syncOpenLayout);
      }
      layoutListenerBound = false;
      window.removeEventListener('resize', handleViewportResize);
      if (layoutResizeTimer) window.clearTimeout(layoutResizeTimer);
      layoutResizeTimer = null;
    }
  }

  window.DOMTreeClarity = {
    version: VERSION,
    enhance,
    open: openDrawer,
    close: closeDrawer,
    destroy,
    isOpen: () => !!(drawerRoot && drawerRoot.classList.contains('is-open'))
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}());
