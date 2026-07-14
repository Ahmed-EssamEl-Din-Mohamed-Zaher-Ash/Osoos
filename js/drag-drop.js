/* Drag and Drop Management with Constraint Validation */

class DragDropManager {
  constructor(app) {
    this.app = app;
    this.draggedTag = null;
    this.currentHoverTarget = null;
    this.dropPosition = 'inside'; // 'before', 'after', 'inside'
    
    this.indicator = document.getElementById('drag-indicator');
    this.canvas = document.getElementById('builder-canvas');
    this.inputTypeModal = document.getElementById('input-type-modal');
    this.inputTypesContainer = document.getElementById('input-types-container');
    
    this.pendingDropTarget = null; // Used for deferred drops (like input types)
    this.pendingDropPosition = null;
    
    this.init();
  }

  init() {
    // Setup drop zone on the canvas
    this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.canvas.addEventListener('dragleave', () => this.handleDragLeave());
    this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
    
    // Close modal
    document.getElementById('close-modal-btn').addEventListener('click', () => {
      this.inputTypeModal.classList.remove('open');
    });
    
    this.setupInputTypeOptions();
  }

  // Set up the draggable items in the elements list
  makeDraggable(elementCard) {
    elementCard.setAttribute('draggable', 'true');
    elementCard.addEventListener('dragstart', (e) => {
      this.draggedTag = elementCard.dataset.tag;
      e.dataTransfer.setData('text/plain', this.draggedTag);
      e.dataTransfer.effectAllowed = 'copy';
      
      // Visual feedback of drag
      elementCard.style.opacity = '0.5';
    });

    elementCard.addEventListener('dragend', () => {
      elementCard.style.opacity = '1';
      this.hideIndicator();
      this.draggedTag = null;
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    if (!this.draggedTag) return;

    // Find the closest HTML element inside the canvas under the cursor
    const canvasRect = this.canvas.getBoundingClientRect();
    const target = e.target.closest('#builder-canvas *') || this.canvas;
    
    this.currentHoverTarget = target;
    
    // Check if target is a void element or canvas itself
    const targetInfo = getElementInfo(target.tagName.toLowerCase());
    const isVoid = targetInfo && targetInfo.type === 'void';
    
    if (target === this.canvas) {
      this.dropPosition = 'inside';
      this.showInsideIndicator(this.canvas);
      return;
    }

    // Determine insertion position (before, after, inside) based on vertical mouse offset
    const rect = target.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const threshold = rect.height * 0.25; // top/bottom 25%

    if (isVoid) {
      // Void elements can't have children; force before/after
      if (relativeY < rect.height / 2) {
        this.dropPosition = 'before';
        this.showEdgeIndicator(rect, 'before');
      } else {
        this.dropPosition = 'after';
        this.showEdgeIndicator(rect, 'after');
      }
    } else {
      if (relativeY < threshold) {
        this.dropPosition = 'before';
        this.showEdgeIndicator(rect, 'before');
      } else if (relativeY > rect.height - threshold) {
        this.dropPosition = 'after';
        this.showEdgeIndicator(rect, 'after');
      } else {
        this.dropPosition = 'inside';
        this.showInsideIndicator(target);
      }
    }
  }

  /* مسح كامل للكانفس في كل حركة ماوس (dragover) كان مكلفاً — نتتبع العنصر الواحد */
  clearHoverContainer() {
    if (this._hoverContainer) {
      this._hoverContainer.classList.remove('drag-hover-container');
      this._hoverContainer = null;
    }
  }

  markHoverContainer(target) {
    if (this._hoverContainer === target) return;
    this.clearHoverContainer();
    if (target) {
      target.classList.add('drag-hover-container');
      this._hoverContainer = target;
    }
  }

  showEdgeIndicator(rect, pos) {
    const canvasRect = this.canvas.getBoundingClientRect();
    this.indicator.style.display = 'block';
    this.indicator.style.width = `${rect.width}px`;
    this.indicator.style.height = '4px';
    this.indicator.style.left = `${rect.left - canvasRect.left + this.canvas.scrollLeft}px`;
    
    if (pos === 'before') {
      this.indicator.style.top = `${rect.top - canvasRect.top + this.canvas.scrollTop - 2}px`;
    } else {
      this.indicator.style.top = `${rect.bottom - canvasRect.top + this.canvas.scrollTop - 2}px`;
    }
    
    // Reset background to highlight insertion
    this.clearHoverContainer();
  }

  showInsideIndicator(target) {
    this.indicator.style.display = 'none';
    this.markHoverContainer(target !== this.canvas ? target : null);
  }

  hideIndicator() {
    this.indicator.style.display = 'none';
    if (this.canvas) {
      this.clearHoverContainer();
    }
  }

  handleDragLeave() {
    this.hideIndicator();
  }

  handleDrop(e) {
    e.preventDefault();
    this.hideIndicator();
    
    if (!this.draggedTag) return;
    
    const target = this.currentHoverTarget || this.canvas;
    const tag = this.draggedTag;
    
    // Validate constraints
    if (!this.validateConstraints(tag, target, this.dropPosition)) {
      this.playRejectAnimation(target);
      return;
    }
    
    // Special handling for input elements (choose type)
    if (tag === 'input') {
      this.pendingDropTarget = target;
      this.pendingDropPosition = this.dropPosition;
      this.openInputTypeModal();
      return;
    }
    
    // Regular insert
    this.insertElement(tag, target, this.dropPosition);
  }

  validateConstraints(draggedTag, target, position) {
    const dragInfo = getElementInfo(draggedTag);
    if (!dragInfo) return true;
    
    // Determine the actual container element
    let container = target;
    if (position !== 'inside') {
      container = target.parentElement;
    }
    
    if (container === this.canvas) {
      // Root level canvas allows most containers, but NOT highly restricted items like td, option, th, dt
      if (dragInfo.type === 'restricted' && !dragInfo.allowedParents.includes('builder-canvas')) {
        /* كان بيعرض أسماء الوسوم الخام هنا بينما الفرع التاني بيعرض أسماء عربية */
        const friendlyParents = dragInfo.allowedParents
          .map(tag => { const info = getElementInfo(tag); return info ? info.labelAr : tag; })
          .join(' أو ');
        this.showWarning(dragInfo.labelAr, `الموضع المسموح به: داخل ${friendlyParents} فقط!`);
        return false;
      }
      return true;
    }
    
    const containerTag = container.tagName.toLowerCase();
    
    // 1. Restricted elements must have valid parent container
    if (dragInfo.allowedParents) {
      if (!dragInfo.allowedParents.includes(containerTag)) {
        let parentFriendlyNames = dragInfo.allowedParents.map(t => {
          const info = getElementInfo(t);
          return info ? info.labelAr : t;
        }).join(' أو ');
        
        this.showWarning(dragInfo.labelAr, `الموضع المسموح به: داخل ${parentFriendlyNames} فقط. أضف الوالد أولاً!`);
        return false;
      }
    }
    
    // 2. Void elements inside canvas cannot accept children
    const containerInfo = getElementInfo(containerTag);
    if (containerInfo && containerInfo.type === 'void' && position === 'inside') {
      this.showWarning(containerInfo.labelAr, 'عنصر فارغ لا يقبل إدخال عناصر أخرى بداخله!');
      return false;
    }

    /* B2: نفس قواعد نموذج محتوى HTML اللي بتستخدمها شجرة DOM — مصدر واحد للحقيقة.
       من غير السطور دي كان السحب من اللوحة يسمح بـ <div> جوه <p> بينما نفس
       الحركة من الشجرة مرفوضة، والمتصفح بيعيد هيكلة الناتج بصمت بعدين. */
    const domTree = this.app && this.app.domTree;
    if (domTree && typeof domTree.checkContainerAcceptsChildTag === 'function') {
      const rule = domTree.checkContainerAcceptsChildTag(container, draggedTag);
      if (!rule.allowed) {
        this.showWarning(dragInfo.labelAr, rule.reason);
        return false;
      }
    }

    return true;
  }

  showWarning(elementName, message) {
    // Create floating warning tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'constraint-tooltip';
    tooltip.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>${elementName}</strong>: ${message}`;
    document.body.appendChild(tooltip);
    
    // Position near mouse or screen center
    tooltip.style.left = '50%';
    tooltip.style.top = '100px';
    tooltip.style.transform = 'translateX(-50%)';
    
    setTimeout(() => {
      tooltip.style.opacity = '0';
      setTimeout(() => tooltip.remove(), 300);
    }, 3500);
  }

  playRejectAnimation(target) {
    if (target === this.canvas) return;
    target.classList.add('shake-reject');
    setTimeout(() => {
      target.classList.remove('shake-reject');
    }, 400);
  }

  insertElement(tag, target, position, attributes = {}) {
    const elInfo = getElementInfo(tag);
    /* @font-face ليس وسماً حقيقياً: createElement('@font-face') يرمي
       InvalidCharacterError — نوجّه المستخدم لأداة الخطوط بدل الانهيار. */
    if (tag === '@font-face') {
      if (this.app.showToastNotice) {
        this.app.showToastNotice('لإضافة خط مخصص استخدم قسم «الخطوط» في لوحة التنسيق ← خط مخصص');
      }
      const fontArea = document.getElementById('custom-font-area');
      if (fontArea) { fontArea.open = true; fontArea.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      return;
    }
    const newEl = document.createElement(tag);
    
    // Apply custom default styling classes or contents
    this.applyElementDefaults(newEl, tag, attributes);
    
    // Insert into DOM
    if (position === 'inside') {
      target.appendChild(newEl);
    } else if (position === 'before') {
      target.parentNode.insertBefore(newEl, target);
    } else if (position === 'after') {
      target.parentNode.insertBefore(newEl, target.nextSibling);
    }
    
    // Let application handle selection and refresh code editor / DOM tree
    this.app.selectElement(newEl);
    this.app.syncAll();
    this.app.history.saveState('Add Element');
  }

  applyElementDefaults(el, tag, attributes) {
    // Unique ID generation
    /* معرف محصّن ضد التصادم — نفس مولّد المحرر */
    do {
      el.id = `${tag}-${Math.random().toString(36).slice(2, 7)}${Date.now().toString(36).slice(-3)}`;
    } while (document.getElementById(el.id) && document.getElementById(el.id) !== el);
    
    // Default text contents
    switch (tag) {
      case 'h1': el.textContent = 'عنوان رئيسي H1'; break;
      case 'h2': el.textContent = 'عنوان فرعي H2'; break;
      case 'h3': el.textContent = 'عنوان فرعي H3'; break;
      case 'p': el.textContent = 'نص فقرة جديد جاهز للتحرير والتعديل.'; break;
      case 'button': el.textContent = 'زر تفاعلي'; break;
      case 'a': 
        el.textContent = 'رابط تشعبي'; 
        el.href = '#'; 
        break;
      case 'span': el.textContent = 'نص مضمن'; break;
      case 'strong': el.textContent = 'نص مهم'; break;
      case 'b': el.textContent = 'غامق'; break;
      case 'em': el.textContent = 'توكيد مائل'; break;
      case 'i': el.textContent = 'مائل'; break;
      case 'li': el.textContent = 'عنصر قائمة جديد'; break;
      case 'th': el.textContent = 'عنوان عمود'; break;
      case 'td': el.textContent = 'بيانات خلية'; break;
      case 'img':
        el.src = '';
        el.alt = 'صورة افتراضية';
        break;
      case 'textarea':
        el.placeholder = 'أدخل نصاً هنا...';
        break;
      case 'select':
        // Add dummy options
        const opt1 = document.createElement('option');
        opt1.value = '1';
        opt1.textContent = 'الخيار الأول';
        const opt2 = document.createElement('option');
        opt2.value = '2';
        opt2.textContent = 'الخيار الثاني';
        el.appendChild(opt1);
        el.appendChild(opt2);
        break;
      case 'option':
        el.value = 'value';
        el.textContent = 'خيار جديد';
        break;
      case 'label':
        el.textContent = 'اسم الحقل:';
        break;
      case 'fieldset':
        const legend = document.createElement('legend');
        legend.textContent = 'عنوان المجموعة';
        el.appendChild(legend);
        break;
      case 'details':
        const summary = document.createElement('summary');
        summary.textContent = 'اضغط لعرض التفاصيل';
        el.appendChild(summary);
        const detailP = document.createElement('p');
        detailP.textContent = 'محتوى إضافي قابل للإخفاء والظهور عند التفاعل.';
        el.appendChild(detailP);
        break;
      case 'table':
        // Create basic 2x2 table automatically
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const trH = document.createElement('tr');
        const th1 = document.createElement('th'); th1.textContent = 'الاسم';
        const th2 = document.createElement('th'); th2.textContent = 'القيمة';
        trH.appendChild(th1); trH.appendChild(th2);
        thead.appendChild(trH);
        
        const trB = document.createElement('tr');
        const td1 = document.createElement('td'); td1.textContent = 'بيان 1';
        const td2 = document.createElement('td'); td2.textContent = 'رقم 2';
        trB.appendChild(td1); trB.appendChild(td2);
        tbody.appendChild(trB);
        
        el.appendChild(thead);
        el.appendChild(tbody);
        break;
    }
    
    // Apply specific attributes (like input type)
    for (let key in attributes) {
      el.setAttribute(key, attributes[key]);
    }
  }

  // Setup options for input modal
  setupInputTypeOptions() {
    const types = [
      'text', 'email', 'password', 'number', 'tel', 
      'url', 'date', 'time', 'color', 'range', 
      'file', 'checkbox', 'radio', 'hidden'
    ];
    
    this.inputTypesContainer.innerHTML = '';
    types.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'input-type-option';
      btn.textContent = t;
      btn.addEventListener('click', () => {
        this.inputTypeModal.classList.remove('open');
        if (this.pendingDropTarget) {
          this.insertElement('input', this.pendingDropTarget, this.pendingDropPosition, { type: t });
          this.pendingDropTarget = null;
          this.pendingDropPosition = null;
        }
      });
      this.inputTypesContainer.appendChild(btn);
    });
  }

  openInputTypeModal() {
    this.inputTypeModal.classList.add('open');
  }
}
