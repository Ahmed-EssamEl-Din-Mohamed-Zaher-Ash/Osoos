/* DOM Tree Panel Management with accessible drag and drop reordering */

class DOMTreeManager {
  constructor(app) {
    this.app = app;
    this.rootContainer = document.getElementById('dom-tree-root');
    this.canvas = document.getElementById('builder-canvas');

    // Canvas nodes are kept by direct reference. IDs are user content and may be
    // missing, duplicated, or shared with controls outside the canvas.
    this.elementRefKey = typeof Symbol === 'function'
      ? Symbol('osoosDomTreeElement')
      : '__osoosDomTreeElement';
    this.draggedElement = null;
    this.dragSourceWrapper = null;
    this.currentDropNode = null;
    this.currentDropTarget = null;
    this.currentDropPosition = null;
    this.currentDropAllowed = false;

    // WeakSet keeps expansion state across tree renders without leaking removed
    // canvas nodes or adding editor-only identity attributes to user HTML.
    this.collapsedElements = new WeakSet();
    this.hoveredElement = null;
    this.rootDropZone = null;
    this.renderNodeCounter = 0;

    this.autoScrollDirection = 0;
    this.autoScrollTimer = null;
    this.paletteDraggedTag = '';

    this.setupAccessibility();
    this.setupEventDelegation();
  }

  setupAccessibility() {
    if (!this.rootContainer) return;

    this.rootContainer.setAttribute('role', 'tree');
    this.rootContainer.setAttribute('aria-label', 'شجرة عناصر الصفحة');

    const region = document.createElement('div');
    region.className = 'dom-tree-sr-only';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    this.rootContainer.parentElement.appendChild(region);
    this.statusRegion = region;
  }

  setupEventDelegation() {
    if (!this.rootContainer) return;

    this.rootContainer.addEventListener('click', (event) => this.handleTreeClick(event));
    this.rootContainer.addEventListener('mouseover', (event) => this.handleTreeMouseOver(event));
    this.rootContainer.addEventListener('mouseout', (event) => this.handleTreeMouseOut(event));
    this.rootContainer.addEventListener('dragstart', (event) => this.handleDragStart(event));
    this.rootContainer.addEventListener('dragover', (event) => this.handleDragOver(event));
    this.rootContainer.addEventListener('dragleave', (event) => this.handleDragLeave(event));
    this.rootContainer.addEventListener('drop', (event) => this.handleDrop(event));
    this.rootContainer.addEventListener('dragend', () => this.cleanupDragSession());
    this.rootContainer.addEventListener('keydown', (event) => this.handleTreeKeyDown(event));
  }

  /* P3: تغيير التحديد كان بيعيد بناء الشجرة كلها (كل <li> وكل أيقونة) رغم إن
     المطلوب تبديل صنف واحد. البناء الكامل بقى للتغيير الهيكلي بس. */
  updateSelectionOnly() {
    if (!this.rootContainer) return false;
    const wrappers = this.rootContainer.querySelectorAll('.dom-tree-node-wrapper');
    if (!wrappers.length) return false;

    const selected = this.app.selectedElement;
    let found = !selected;
    wrappers.forEach(wrapper => {
      const element = wrapper[this.elementRefKey];
      const isSelected = !!selected && element === selected;
      if (isSelected) found = true;
      wrapper.classList.toggle('selected', isSelected);
      const li = wrapper.closest('li');
      if (li) li.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    /* العنصر المحدد مش في الشجرة المرسومة (اتضاف/اتحذف) -> محتاجين بناء كامل */
    return found;
  }

  // Clear and rebuild the representation while retaining collapse and scroll state.
  render() {
    if (!this.rootContainer || !this.canvas) return;

    const scroller = this.getScrollContainer();
    const previousScrollTop = scroller ? scroller.scrollTop : 0;

    this.cleanupHoveredElement();
    this.clearDropFeedback(true);
    this.renderNodeCounter = 0;

    const fragment = document.createDocumentFragment();
    Array.from(this.canvas.children).forEach((child) => {
      fragment.appendChild(this.createTreeNode(child, 1));
    });

    this.rootDropZone = this.createRootDropZone();
    fragment.appendChild(this.rootDropZone);
    this.rootContainer.replaceChildren(fragment);

    const treeItems = Array.from(
      this.rootContainer.querySelectorAll('.dom-tree-item[role="treeitem"]')
    );
    treeItems.forEach((item) => { item.tabIndex = -1; });
    const selectedItem = treeItems.find((item) => {
      const wrapper = item.querySelector(':scope > .dom-tree-node-wrapper');
      return wrapper && wrapper.classList.contains('selected');
    });
    if (selectedItem || treeItems[0]) (selectedItem || treeItems[0]).tabIndex = 0;

    if (scroller) scroller.scrollTop = previousScrollTop;
  }

  createTreeNode(element, level = 1) {
    const li = document.createElement('li');
    li.className = 'dom-tree-item';
    li.setAttribute('role', 'treeitem');
    li.setAttribute('aria-level', String(level));
    li.setAttribute('aria-selected', this.app.selectedElement === element ? 'true' : 'false');
    li[this.elementRefKey] = element;
    if (element.id) li.dataset.id = element.id;

    const wrapper = document.createElement('div');
    wrapper.className = 'dom-tree-node-wrapper';
    wrapper[this.elementRefKey] = element;
    if (this.app.selectedElement === element) wrapper.classList.add('selected');

    const leftDiv = document.createElement('div');
    leftDiv.className = 'dom-node-left';

    const dragHandle = document.createElement('button');
    dragHandle.type = 'button';
    dragHandle.className = 'dom-drag-handle';
    dragHandle.draggable = true;
    dragHandle.setAttribute('aria-label', `اسحب لنقل ${this.getElementLabel(element)}`);
    dragHandle.setAttribute('aria-grabbed', 'false');
    dragHandle.setAttribute('title', 'اسحب لإعادة الترتيب أو التعشيق');
    dragHandle.innerHTML = '<i class="fas fa-grip-vertical" aria-hidden="true"></i>';
    leftDiv.appendChild(dragHandle);

    const children = Array.from(element.children || []);
    const hasChildren = children.length > 0;
    const isCollapsed = hasChildren && this.collapsedElements.has(element);

    let toggleControl;
    if (hasChildren) {
      toggleControl = document.createElement('button');
      toggleControl.type = 'button';
      toggleControl.className = 'dom-node-toggle';
      toggleControl.dataset.domAction = 'toggle';
      toggleControl.textContent = isCollapsed ? '►' : '▼';
      toggleControl.setAttribute('aria-label', isCollapsed ? 'توسيع الفرع' : 'طي الفرع');
      toggleControl.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    } else {
      toggleControl = document.createElement('span');
      toggleControl.className = 'dom-node-toggle dom-node-toggle-placeholder';
      toggleControl.setAttribute('aria-hidden', 'true');
    }
    leftDiv.appendChild(toggleControl);

    const icon = document.createElement('i');
    icon.className = this.getNodeIcon(element.tagName.toLowerCase());
    icon.setAttribute('aria-hidden', 'true');
    leftDiv.appendChild(icon);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'dom-node-label';
    nameSpan.textContent = this.getElementLabel(element);
    nameSpan.title = this.getElementLabel(element);
    leftDiv.appendChild(nameSpan);
    wrapper.appendChild(leftDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'dom-node-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'dom-action-btn';
    deleteBtn.dataset.domAction = 'delete';
    deleteBtn.setAttribute('aria-label', `حذف ${this.getElementLabel(element)}`);
    deleteBtn.setAttribute('title', 'حذف العنصر');
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
    actionsDiv.appendChild(deleteBtn);
    wrapper.appendChild(actionsDiv);
    li.appendChild(wrapper);

    if (hasChildren) {
      const childrenUl = document.createElement('ul');
      childrenUl.className = 'dom-tree-children';
      childrenUl.setAttribute('role', 'group');
      childrenUl.hidden = isCollapsed;
      childrenUl.id = `dom-tree-children-${++this.renderNodeCounter}`;
      li.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      li.setAttribute('aria-controls', childrenUl.id);
      toggleControl.setAttribute('aria-controls', childrenUl.id);

      children.forEach((child) => {
        childrenUl.appendChild(this.createTreeNode(child, level + 1));
      });
      li.appendChild(childrenUl);
    }

    return li;
  }

  createRootDropZone() {
    const zone = document.createElement('li');
    zone.className = 'dom-tree-root-drop-zone';
    zone.setAttribute('role', 'treeitem');
    zone.setAttribute('aria-level', '1');
    zone.setAttribute('aria-label', 'انقل العنصر إلى المستوى الجذري');
    zone.setAttribute('aria-hidden', 'true');
    zone.dataset.domRootDrop = 'true';
    zone.innerHTML = '<i class="fas fa-level-up-alt" aria-hidden="true"></i><span>إفلات في المستوى الجذري</span>';
    return zone;
  }

  getElementLabel(element) {
    const tag = element && element.tagName ? element.tagName.toLowerCase() : 'element';
    const elementId = element && typeof element.getAttribute === 'function'
      ? (element.getAttribute('id') || '').trim()
      : '';
    const rawClassName = element && typeof element.getAttribute === 'function'
      ? (element.getAttribute('class') || '')
      : '';
    const editorClasses = new Set([
      'selected-element',
      'drag-hover-container',
      'hovered-canvas-element',
      'move-mode-active',
      'shake-reject'
    ]);
    const classes = rawClassName.split(/\s+/).filter((className) => {
      return className && !editorClasses.has(className);
    });

    let label = tag;
    if (elementId) label += `#${elementId}`;
    if (classes.length) label += `.${classes[0]}`;
    return label;
  }

  getNodeIcon(tag) {
    switch (tag) {
      case 'div':
      case 'section':
      case 'article':
      case 'main':
      case 'header':
      case 'footer':
      case 'nav':
      case 'aside':
        return 'fas fa-folder';
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return 'fas fa-heading';
      case 'p':
        return 'fas fa-paragraph';
      case 'a':
        return 'fas fa-link';
      case 'img':
      case 'picture':
      case 'svg':
        return 'fas fa-image';
      case 'video':
      case 'audio':
        return 'fas fa-photo-video';
      case 'table':
        return 'fas fa-table';
      case 'ul':
      case 'ol':
        return 'fas fa-list-ul';
      case 'form':
        return 'fas fa-keyboard';
      case 'button':
        return 'fas fa-mouse-pointer';
      case 'input':
      case 'textarea':
      case 'select':
        return 'fas fa-check-square';
      default:
        return 'fas fa-code';
    }
  }

  handleTreeClick(event) {
    const wrapper = this.closestWithinRoot(event.target, '.dom-tree-node-wrapper');
    if (!wrapper) return;

    const element = wrapper[this.elementRefKey];
    if (!element) return;

    const action = this.closestWithinRoot(event.target, '[data-dom-action]');
    if (action && action.dataset.domAction === 'toggle') {
      event.preventDefault();
      event.stopPropagation();
      this.toggleBranch(wrapper, element, action);
      return;
    }

    if (action && action.dataset.domAction === 'delete') {
      event.preventDefault();
      event.stopPropagation();
      this.deleteElement(element);
      return;
    }

    event.stopPropagation();
    this.app.selectElement(element);
  }

  toggleBranch(wrapper, element, toggleButton) {
    const li = wrapper.parentElement;
    const childrenList = Array.from(li.children).find((child) => {
      return child.classList && child.classList.contains('dom-tree-children');
    });
    if (!childrenList) return;

    const willCollapse = !childrenList.hidden;
    childrenList.hidden = willCollapse;
    if (willCollapse) this.collapsedElements.add(element);
    else this.collapsedElements.delete(element);

    toggleButton.textContent = willCollapse ? '►' : '▼';
    toggleButton.setAttribute('aria-label', willCollapse ? 'توسيع الفرع' : 'طي الفرع');
    toggleButton.setAttribute('aria-expanded', willCollapse ? 'false' : 'true');
    li.setAttribute('aria-expanded', willCollapse ? 'false' : 'true');
  }

  handleTreeKeyDown(event) {
    const item = this.closestWithinRoot(event.target, '.dom-tree-item[role="treeitem"]');
    if (!item || event.target !== item) return;

    const items = Array.from(
      this.rootContainer.querySelectorAll('.dom-tree-item[role="treeitem"]')
    ).filter((candidate) => !candidate.closest('.dom-tree-children[hidden]'));
    const index = items.indexOf(item);
    const wrapper = item.querySelector(':scope > .dom-tree-node-wrapper');
    const element = wrapper && wrapper[this.elementRefKey];

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = items[Math.min(items.length - 1, Math.max(0, index + delta))];
      if (next) {
        item.tabIndex = -1;
        next.tabIndex = 0;
        next.focus();
      }
      return;
    }

    const toggle = wrapper && wrapper.querySelector('[data-dom-action="toggle"]');
    if (event.key === 'ArrowLeft' && toggle && item.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      this.toggleBranch(wrapper, element, toggle);
      return;
    }
    if (event.key === 'ArrowRight' && toggle && item.getAttribute('aria-expanded') === 'false') {
      event.preventDefault();
      this.toggleBranch(wrapper, element, toggle);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && element) {
      event.preventDefault();
      this.app.selectElement(element);
    }
  }

  deleteElement(element) {
    if (!this.canvas || !this.canvas.contains(element)) return;

    if (this.hoveredElement && (this.hoveredElement === element || element.contains(this.hoveredElement))) {
      this.cleanupHoveredElement();
    }

    if (typeof this.app.deleteCanvasElement === 'function' && this.app.deleteCanvasElement(element, 'Delete DOM node')) {
      this.announce('تم حذف العنصر من شجرة الصفحة مع تنظيف تنسيقه وتفاعلاته');
    }
  }

  handleTreeMouseOver(event) {
    if (this.draggedElement) return;
    const wrapper = this.closestWithinRoot(event.target, '.dom-tree-node-wrapper');
    if (!wrapper) return;
    if (event.relatedTarget && wrapper.contains(event.relatedTarget)) return;

    const element = wrapper[this.elementRefKey];
    if (!element || !element.classList) return;
    if (this.hoveredElement === element) return;

    this.cleanupHoveredElement();
    this.hoveredElement = element;
    element.classList.add('hovered-canvas-element');
  }

  handleTreeMouseOut(event) {
    const wrapper = this.closestWithinRoot(event.target, '.dom-tree-node-wrapper');
    if (!wrapper) return;
    if (event.relatedTarget && wrapper.contains(event.relatedTarget)) return;

    const element = wrapper[this.elementRefKey];
    if (this.hoveredElement === element) this.cleanupHoveredElement();
  }

  cleanupHoveredElement() {
    if (this.hoveredElement && this.hoveredElement.classList) {
      this.hoveredElement.classList.remove('hovered-canvas-element');
    }
    this.hoveredElement = null;
  }

  handleDragStart(event) {
    const handle = this.closestWithinRoot(event.target, '.dom-drag-handle');
    if (!handle) {
      event.preventDefault();
      return;
    }

    const wrapper = handle.closest('.dom-tree-node-wrapper');
    const element = wrapper && wrapper[this.elementRefKey];
    if (!element || !this.canvas || !this.canvas.contains(element)) {
      event.preventDefault();
      return;
    }

    this.cleanupHoveredElement();
    this.draggedElement = element;
    this.dragSourceWrapper = wrapper;
    wrapper.classList.add('is-dragging');
    wrapper.parentElement.setAttribute('aria-grabbed', 'true');
    handle.setAttribute('aria-grabbed', 'true');
    this.rootContainer.classList.add('dom-tree-drag-session');
    this.rootContainer.setAttribute('aria-dropeffect', 'move');
    if (this.rootDropZone) this.rootDropZone.setAttribute('aria-hidden', 'false');

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', 'osoos-dom-tree-node');
      event.dataTransfer.setData('text/domnode', 'direct-reference');
      if (typeof event.dataTransfer.setDragImage === 'function') {
        event.dataTransfer.setDragImage(wrapper, 16, 12);
      }
    }

    event.stopPropagation();
    this.announce(`بدأ نقل ${this.getElementLabel(element)}`);
  }

  /* ── إفلات عنصر جديد من لوحة العناصر على الشجرة مباشرة ── */
  getPaletteDragTag(event = null) {
    if (this.paletteDraggedTag) return this.paletteDraggedTag;
    const manager = this.app && this.app.dragDrop;
    if (!manager) return '';
    if (typeof manager.getDraggedPaletteTag === 'function') {
      return manager.getDraggedPaletteTag(event && event.dataTransfer);
    }
    return manager.draggedTag || '';
  }

  beginPaletteDrag(tag) {
    if (!tag || !this.rootContainer) return;
    this.paletteDraggedTag = tag;
    this.rootContainer.classList.add('dom-tree-drag-session', 'dom-tree-palette-drag-session');
    this.rootContainer.setAttribute('aria-dropeffect', 'copy');
    if (this.rootDropZone) this.rootDropZone.setAttribute('aria-hidden', 'false');
  }

  endPaletteDrag() {
    this.paletteDraggedTag = '';
    if (this.rootContainer) {
      this.rootContainer.classList.remove('dom-tree-palette-drag-session');
      if (!this.draggedElement) {
        this.rootContainer.classList.remove('dom-tree-drag-session');
        this.rootContainer.removeAttribute('aria-dropeffect');
      }
    }
    if (this.rootDropZone && !this.draggedElement) this.rootDropZone.setAttribute('aria-hidden', 'true');
    this.clearDropFeedback(true);
    this.stopAutoScroll();
  }

  isPaletteDropAllowed(tag, target, position) {
    const manager = this.app && this.app.dragDrop;
    if (manager && typeof manager.isInsertionAllowed === 'function') {
      return manager.isInsertionAllowed(tag, target, position);
    }

    const info = typeof getElementInfo === 'function' ? getElementInfo(tag) : null;
    const container = position === 'inside' ? target : (target === this.canvas ? this.canvas : target.parentElement);
    if (!container) return false;
    if (container === this.canvas) {
      return !(info && info.type === 'restricted' && info.allowedParents && !info.allowedParents.includes('builder-canvas'));
    }
    const containerTag = container.tagName.toLowerCase();
    if (info && info.allowedParents && !info.allowedParents.includes(containerTag)) return false;
    const containerInfo = typeof getElementInfo === 'function' ? getElementInfo(containerTag) : null;
    if (containerInfo && containerInfo.type === 'void' && position === 'inside') return false;
    return true;
  }

  handlePaletteDragOver(event) {
    const tag = this.getPaletteDragTag(event);
    if (!tag) return;
    if (!this.paletteDraggedTag) this.beginPaletteDrag(tag);
    event.preventDefault();
    event.stopPropagation();
    this.updateAutoScroll(event.clientY);

    const rootZone = this.closestWithinRoot(event.target, '.dom-tree-root-drop-zone');
    if (rootZone) {
      const allowed = this.isPaletteDropAllowed(tag, this.canvas, 'inside');
      this.setDropFeedback(rootZone, this.canvas, 'root', allowed);
      if (event.dataTransfer) event.dataTransfer.dropEffect = allowed ? 'copy' : 'none';
      return;
    }
    const wrapper = this.closestWithinRoot(event.target, '.dom-tree-node-wrapper');
    if (!wrapper) {
      this.clearDropFeedback();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none';
      return;
    }
    const target = wrapper[this.elementRefKey];
    if (!target) return;
    const position = this.getDropPosition(wrapper, target, event.clientY);
    const allowed = this.isPaletteDropAllowed(tag, target, position);
    this.setDropFeedback(wrapper, target, position, allowed);
    if (event.dataTransfer) event.dataTransfer.dropEffect = allowed ? 'copy' : 'none';
  }

  handlePaletteDrop(event) {
    const tag = this.getPaletteDragTag(event);
    if (!tag) return;
    event.preventDefault();
    event.stopPropagation();

    let target = null;
    let position = null;
    const rootZone = this.closestWithinRoot(event.target, '.dom-tree-root-drop-zone');
    if (rootZone) {
      target = this.canvas;
      position = 'inside';
    } else {
      const wrapper = this.closestWithinRoot(event.target, '.dom-tree-node-wrapper');
      if (wrapper) {
        target = wrapper[this.elementRefKey];
        position = this.currentDropTarget === target && this.currentDropPosition
          ? this.currentDropPosition
          : this.getDropPosition(wrapper, target, event.clientY);
      }
    }
    this.clearDropFeedback();
    this.stopAutoScroll();
    if (!target || !position) {
      this.endPaletteDrag();
      return;
    }

    /* validateConstraints تعرض رسالة تحذير عربية توضح المكان الصحيح عند الرفض */
    if (!this.app.dragDrop.validateConstraints(tag, target, position)) {
      this.endPaletteDrag();
      return;
    }

    if (tag === 'input') {
      this.app.dragDrop.pendingDropTarget = target;
      this.app.dragDrop.pendingDropPosition = position;
      this.app.dragDrop.pendingDropAnnouncement = true;
      if (position === 'inside' && target !== this.canvas) this.collapsedElements.delete(target);
      this.app.dragDrop.openInputTypeModal();
      this.endPaletteDrag();
      return;
    }
    if (position === 'inside' && target !== this.canvas) this.collapsedElements.delete(target);
    const inserted = this.app.dragDrop.insertElement(tag, target, position);
    this.endPaletteDrag();
    if (!inserted) return;
    this.announce(`تمت إضافة ${tag} ${position === 'inside' ? 'داخل' : 'بجوار'} ${this.getElementLabel(target)}`);
  }

  handleDragOver(event) {
    if (!this.draggedElement) {
      this.handlePaletteDragOver(event);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.updateAutoScroll(event.clientY);

    const rootZone = this.closestWithinRoot(event.target, '.dom-tree-root-drop-zone');
    if (rootZone) {
      const allowed = this.isDropAllowed(this.draggedElement, this.canvas, 'inside', false);
      this.setDropFeedback(rootZone, this.canvas, 'root', allowed);
      if (event.dataTransfer) event.dataTransfer.dropEffect = allowed ? 'move' : 'none';
      return;
    }

    const wrapper = this.closestWithinRoot(event.target, '.dom-tree-node-wrapper');
    if (!wrapper) {
      this.clearDropFeedback();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none';
      return;
    }

    const target = wrapper[this.elementRefKey];
    if (!target) return;

    const position = this.getDropPosition(wrapper, target, event.clientY);
    const allowed = this.isDropAllowed(this.draggedElement, target, position, false);
    this.setDropFeedback(wrapper, target, position, allowed);
    if (event.dataTransfer) event.dataTransfer.dropEffect = allowed ? 'move' : 'none';
  }

  handleDragLeave(event) {
    if (!this.draggedElement && !this.getPaletteDragTag(event)) return;
    const relatedTarget = event.relatedTarget;
    if (relatedTarget && this.rootContainer.contains(relatedTarget)) return;

    this.clearDropFeedback();
    this.stopAutoScroll();
  }

  handleDrop(event) {
    if (!this.draggedElement) {
      this.handlePaletteDrop(event);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const dragged = this.draggedElement;
    let target = null;
    let position = null;

    const rootZone = this.closestWithinRoot(event.target, '.dom-tree-root-drop-zone');
    if (rootZone) {
      target = this.canvas;
      position = 'inside';
    } else {
      const wrapper = this.closestWithinRoot(event.target, '.dom-tree-node-wrapper');
      if (wrapper) {
        target = wrapper[this.elementRefKey];
        position = this.currentDropTarget === target
          ? this.currentDropPosition
          : this.getDropPosition(wrapper, target, event.clientY);
      }
    }

    const result = target && position
      ? this.moveElement(dragged, target, position)
      : { allowed: false, changed: false };

    this.cleanupDragSession();

    if (result.changed) {
      if (position === 'inside' && target !== this.canvas) {
        this.collapsedElements.delete(target);
      }
      this.commitStructureChange(dragged, 'Reorder DOM node');
      this.announce(`تم نقل ${this.getElementLabel(dragged)}`);
    } else if (result.allowed) {
      this.announce('العنصر موجود بالفعل في هذا الموضع');
    }
  }

  getDropPosition(wrapper, target, clientY) {
    const rect = wrapper.getBoundingClientRect();
    const height = Math.max(rect.height, 1);
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / height));

    if (ratio < 0.28) return 'before';
    if (ratio > 0.72) return 'after';
    if (this.canContainChildren(target)) return 'inside';
    return ratio < 0.5 ? 'before' : 'after';
  }

  canContainChildren(element) {
    if (element === this.canvas) return true;
    if (!element || !element.tagName) return false;

    const tag = element.tagName.toLowerCase();
    const voidTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);
    if (voidTags.has(tag)) return false;

    const info = this.getElementInfoSafely(tag);
    return !(info && info.type === 'void');
  }

  isDropAllowed(dragged, target, position, notify) {
    const check = this.checkDropLocally(dragged, target, position);
    if (!check.allowed) {
      if (notify) this.reportInvalidDrop(dragged, check.reason);
      return false;
    }

    const validator = this.app.dragDrop && this.app.dragDrop.validateConstraints;
    if (notify && typeof validator === 'function') {
      try {
        return validator.call(
          this.app.dragDrop,
          dragged.tagName.toLowerCase(),
          target,
          position
        );
      } catch (error) {
        console.warn('DOM tree constraint validation failed; using local validation.', error);
      }
    }

    return true;
  }

  checkDropLocally(dragged, target, position) {
    if (!dragged || !target || !this.canvas) {
      return { allowed: false, reason: 'موضع الإفلات غير صالح.' };
    }
    if (!this.canvas.contains(dragged)) {
      return { allowed: false, reason: 'العنصر المنقول ليس داخل مساحة البناء.' };
    }
    if (target !== this.canvas && !this.canvas.contains(target)) {
      return { allowed: false, reason: 'هدف الإفلات ليس داخل مساحة البناء.' };
    }
    if (dragged === target) {
      return { allowed: false, reason: 'لا يمكن إفلات العنصر فوق نفسه.' };
    }

    const container = position === 'inside' ? target : target.parentElement;
    if (!container || (container !== this.canvas && !this.canvas.contains(container))) {
      return { allowed: false, reason: 'الحاوية المستهدفة غير صالحة.' };
    }
    if (container === dragged || dragged.contains(container)) {
      return { allowed: false, reason: 'لا يمكن نقل الأب إلى داخل أحد أبنائه.' };
    }
    if (position === 'inside' && !this.canContainChildren(target)) {
      return { allowed: false, reason: 'هذا العنصر لا يقبل عناصر بداخله.' };
    }

    const draggedTag = dragged.tagName.toLowerCase();
    const draggedInfo = this.getElementInfoSafely(draggedTag);
    if (draggedInfo && Array.isArray(draggedInfo.allowedParents)) {
      if (container === this.canvas) {
        if (draggedInfo.type === 'restricted' && !draggedInfo.allowedParents.includes('builder-canvas')) {
          return { allowed: false, reason: 'هذا العنصر يحتاج إلى والد HTML مخصص.' };
        }
      } else {
        const containerTag = container.tagName.toLowerCase();
        if (!draggedInfo.allowedParents.includes(containerTag)) {
          return { allowed: false, reason: `لا يمكن وضع ${draggedTag} داخل ${containerTag}.` };
        }
      }
    }

    const childRule = this.checkContainerAcceptsChild(container, dragged);
    if (!childRule.allowed) return childRule;

    return { allowed: true, reason: '' };
  }

  /* B2: كانت القواعد دي حبيسة مسار شجرة DOM، بينما السحب من اللوحة كان بيستخدم
     مدقق أضعف (allowedParents بس) فيسمح بـ <div> جوه <p>. النسخة دي تستقبل اسم
     الوسم بدل العنصر، عشان drag-drop تقدر تستدعي نفس القواعد قبل ما العنصر يتخلق. */
  checkContainerAcceptsChild(container, child) {
    const childTag = child && child.tagName ? child.tagName.toLowerCase() : '';
    return this.checkContainerAcceptsChildTag(container, childTag);
  }

  checkContainerAcceptsChildTag(container, childTag) {
    if (!container || container === this.canvas || !container.tagName || !childTag) {
      return { allowed: true, reason: '' };
    }

    const parentTag = container.tagName.toLowerCase();
    const strictParents = {
      head: new Set(['base', 'link', 'meta', 'noscript', 'script', 'style', 'template', 'title']),
      select: new Set(['option', 'optgroup', 'script', 'template']),
      optgroup: new Set(['option', 'script', 'template']),
      table: new Set(['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr', 'script', 'template']),
      thead: new Set(['tr', 'script', 'template']),
      tbody: new Set(['tr', 'script', 'template']),
      tfoot: new Set(['tr', 'script', 'template']),
      tr: new Set(['td', 'th', 'script', 'template']),
      colgroup: new Set(['col', 'script', 'template']),
      ul: new Set(['li', 'script', 'template']),
      ol: new Set(['li', 'script', 'template']),
      menu: new Set(['li', 'script', 'template']),
      dl: new Set(['dt', 'dd', 'div', 'script', 'template']),
      picture: new Set(['source', 'img', 'script', 'template'])
    };
    const textOnlyParents = new Set([
      'textarea', 'title', 'style', 'script', 'xmp', 'iframe',
      'noembed', 'noframes', 'plaintext'
    ]);

    if (textOnlyParents.has(parentTag)) {
      return { allowed: false, reason: `${parentTag} لا يقبل عناصر HTML بداخله.` };
    }
    if (strictParents[parentTag] && !strictParents[parentTag].has(childTag)) {
      return { allowed: false, reason: `لا يمكن وضع ${childTag} داخل ${parentTag}.` };
    }

    const blockLikeTags = new Set([
      'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'div',
      'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
      'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav',
      'ol', 'p', 'pre', 'section', 'table', 'ul'
    ]);
    if (parentTag === 'p' && blockLikeTags.has(childTag)) {
      return { allowed: false, reason: `لا يمكن وضع ${childTag} داخل فقرة p.` };
    }
    if (childTag === 'form' && container.closest('form')) {
      return { allowed: false, reason: 'لا يمكن تعشيق form داخل form آخر.' };
    }
    if (childTag === 'a' && container.closest('a')) {
      return { allowed: false, reason: 'لا يمكن تعشيق رابط a داخل رابط آخر.' };
    }

    const interactiveTags = new Set(['a', 'button', 'input', 'select', 'textarea', 'label']);
    if (parentTag === 'button' && interactiveTags.has(childTag)) {
      return { allowed: false, reason: `لا يمكن وضع ${childTag} تفاعلي داخل button.` };
    }

    return { allowed: true, reason: '' };
  }

  getElementInfoSafely(tag) {
    if (typeof getElementInfo !== 'function') return null;
    try {
      return getElementInfo(tag);
    } catch (error) {
      return null;
    }
  }

  reportInvalidDrop(dragged, reason) {
    // showWarning renders its label with innerHTML, so only pass the trusted tag
    // name rather than user-controlled id/class text.
    const label = dragged && dragged.tagName ? dragged.tagName.toLowerCase() : 'element';
    if (this.app.dragDrop && typeof this.app.dragDrop.showWarning === 'function') {
      this.app.dragDrop.showWarning(label, reason);
    } else {
      console.warn(`${label}: ${reason}`);
    }
    this.announce(reason);
  }

  moveElement(dragged, target, position) {
    if (!this.isDropAllowed(dragged, target, position, true)) {
      return { allowed: false, changed: false };
    }

    const oldParent = dragged.parentElement;
    const oldIndex = oldParent ? Array.from(oldParent.children).indexOf(dragged) : -1;

    try {
      if (position === 'inside') {
        target.appendChild(dragged);
      } else if (position === 'before') {
        target.parentNode.insertBefore(dragged, target);
      } else if (position === 'after') {
        target.parentNode.insertBefore(dragged, target.nextSibling);
      }
    } catch (error) {
      this.reportInvalidDrop(dragged, 'تعذر نقل العنصر إلى هذا الموضع.');
      console.warn('DOM tree move failed.', error);
      return { allowed: false, changed: false };
    }

    const newParent = dragged.parentElement;
    const newIndex = newParent ? Array.from(newParent.children).indexOf(dragged) : -1;
    return {
      allowed: true,
      changed: oldParent !== newParent || oldIndex !== newIndex
    };
  }

  setDropFeedback(node, target, position, allowed) {
    if (
      this.currentDropNode === node &&
      this.currentDropTarget === target &&
      this.currentDropPosition === position &&
      this.currentDropAllowed === allowed
    ) {
      return;
    }

    this.clearDropFeedback();
    this.currentDropNode = node;
    this.currentDropTarget = target;
    this.currentDropPosition = position;
    this.currentDropAllowed = allowed;

    if (!allowed) node.classList.add('is-drop-invalid');
    else if (position === 'root') node.classList.add('is-drop-root');
    else node.classList.add(`is-drop-${position}`);
  }

  clearDropFeedback(fullCleanup = false) {
    const clearNode = (node) => {
      if (!node || !node.classList) return;
      node.classList.remove(
        'is-drop-before',
        'is-drop-after',
        'is-drop-inside',
        'is-drop-root',
        'is-drop-invalid'
      );
    };

    clearNode(this.currentDropNode);
    if (fullCleanup && this.rootContainer) {
      this.rootContainer.querySelectorAll(
        '.is-drop-before, .is-drop-after, .is-drop-inside, .is-drop-root, .is-drop-invalid'
      ).forEach(clearNode);
    }

    this.currentDropNode = null;
    this.currentDropTarget = null;
    this.currentDropPosition = null;
    this.currentDropAllowed = false;
  }

  cleanupDragSession() {
    if (this.dragSourceWrapper) {
      this.dragSourceWrapper.classList.remove('is-dragging');
      if (this.dragSourceWrapper.parentElement) {
        this.dragSourceWrapper.parentElement.setAttribute('aria-grabbed', 'false');
      }
      const handle = this.dragSourceWrapper.querySelector('.dom-drag-handle');
      if (handle) handle.setAttribute('aria-grabbed', 'false');
    }

    if (this.rootContainer) {
      this.rootContainer.classList.remove('dom-tree-drag-session');
      this.rootContainer.removeAttribute('aria-dropeffect');
    }
    if (this.rootDropZone) this.rootDropZone.setAttribute('aria-hidden', 'true');

    this.clearDropFeedback(true);
    this.stopAutoScroll();
    this.draggedElement = null;
    this.dragSourceWrapper = null;
  }

  updateAutoScroll(clientY) {
    const scroller = this.getScrollContainer();
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight) {
      this.stopAutoScroll();
      return;
    }

    const rect = scroller.getBoundingClientRect();
    const edgeSize = Math.min(42, Math.max(24, rect.height * 0.15));
    let direction = 0;
    if (clientY < rect.top + edgeSize) direction = -1;
    else if (clientY > rect.bottom - edgeSize) direction = 1;

    if (direction === this.autoScrollDirection && this.autoScrollTimer) return;
    this.stopAutoScroll();
    this.autoScrollDirection = direction;
    if (!direction) return;

    this.autoScrollTimer = window.setInterval(() => {
      scroller.scrollTop += this.autoScrollDirection * 8;
    }, 16);
  }

  stopAutoScroll() {
    if (this.autoScrollTimer) window.clearInterval(this.autoScrollTimer);
    this.autoScrollTimer = null;
    this.autoScrollDirection = 0;
  }

  getScrollContainer() {
    if (!this.rootContainer) return null;
    return this.rootContainer.closest('.panel-content') || this.rootContainer.parentElement;
  }

  commitStructureChange(selection, reason) {
    if (typeof this.app.selectElement === 'function') this.app.selectElement(selection || null);
    else this.render();

    if (this.app.editor && typeof this.app.editor.refreshEditorContent === 'function') {
      this.app.editor.refreshEditorContent();
    }
    if (typeof this.app.saveProgress === 'function') this.app.saveProgress(false);
    if (this.app.history && typeof this.app.history.saveState === 'function') {
      this.app.history.saveState(reason);
    }
  }

  closestWithinRoot(target, selector) {
    let element = target;
    if (element && element.nodeType !== 1) element = element.parentElement;
    if (!element || typeof element.closest !== 'function') return null;

    const match = element.closest(selector);
    return match && this.rootContainer.contains(match) ? match : null;
  }

  announce(message) {
    if (!this.statusRegion) return;
    this.statusRegion.textContent = '';
    window.setTimeout(() => {
      if (this.statusRegion) this.statusRegion.textContent = message;
    }, 0);
  }
}
