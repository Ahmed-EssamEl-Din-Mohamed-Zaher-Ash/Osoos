import { HTML_ELEMENTS_DB } from '../data/htmlElements.js';
import { DragDropManager } from '../features/canvas/DragDropManager.js';
import { DOMTreeManager } from '../features/dom-tree/DOMTreeManager.js';
import { CodeEditorManager } from '../features/editor/CodeEditorManager.js';
import { PropertiesManager } from '../features/inspector/PropertiesManager.js';
import { ProjectManager } from '../features/projects/ProjectManager.js';
import { HistoryManager } from '../services/history/HistoryManager.js';
import { OsoosStyleEngine } from '../services/styles/OsoosStyleEngine.js';
import JSZip from 'jszip';

/* Main Application Controller - Coordinates all panels and states */

class WebBuilderApp {
  constructor() {
    this.selectedElement = null;
    this.isMoveMode = false;
    this.isDraggingMove = false;
    this.isSnapEnabled = false;
    this.snapGridSize = 8;
    this.history = new HistoryManager(this);
    this.styleSyncTimer = null;
    
    // Components
    this.dragDrop = null;
    this.properties = null;
    this.editor = null;
    this.domTree = null;
    this.projectManager = null;
    this.interactionDemo = null;
    
    // UI Selectors
    this.canvas = document.getElementById('builder-canvas');
    this.canvasWrapper = document.querySelector('.preview-canvas-wrapper');
    this.highlighter = document.getElementById('element-highlighter');
    this.highlighterBadge = document.getElementById('highlighter-badge');
    this.breadcrumbs = document.getElementById('canvas-breadcrumbs');
    this.styleEngine = new OsoosStyleEngine(this);
    this.styleEngine.init();
    
    this.init();
  }

  init() {
    // 1. Initialize Managers
    this.dragDrop = new DragDropManager(this);
    this.properties = new PropertiesManager(this);
    this.editor = new CodeEditorManager(this);
    this.domTree = new DOMTreeManager(this);
    if (window.OsoosInteractionDemo && typeof window.OsoosInteractionDemo.createController === 'function') {
      this.interactionDemo = window.OsoosInteractionDemo.createController(this);
      this.interactionDemo.init();
    }

    // 2. Render Left and Right Lists
    this.renderElementsList();
    this.setupCategoryFilters();
    this.setupSearch();
    this.setupViewportResizer();
    this.setupGlobalEvents();
    this.setupHighlighterButtons();
    this.setupTabSwitcher();
    this.setupPageSettings();
    this.setupSpacingHandles();
    this.setupResizableAndCollapsiblePanels();

    // 3. Load Auto-saved content if exists
    this.loadSavedProgress();

    // Old projects and element defaults may still contain inline styles.
    // Move them once into the managed CSS stylesheet before showing code.
    this.styleEngine.migrateInlineStyles(this.canvas);
    
    // 4. Initial Synchronization
    this.reattachCanvasListeners();
    this.setWorkspaceMode('designer');
    this.syncAll();
    this.history.saveState('Initial State');

    // Initialize the multi-file layer last. This lets it migrate the fully
    // normalized legacy page and makes the saved active file the final view.
    this.projectManager = new ProjectManager(this);
    this.projectManager.readyPromise = this.projectManager.init();
  }

  // Populate HTML elements on the right panel
  renderElementsList(filterCat = 'all', searchQuery = '', displayFilter = '') {
    const listContainer = document.getElementById('elements-list-container');
    listContainer.innerHTML = '';
    
    // Group elements by category for better structure
    const categories = {
      'head': 'المشروع والرأس <head>',
      'structure': 'الحاويات الكتلية',
      'text': 'النصوص والعناوين',
      'lists-tables': 'القوائم والجداول',
      'media': 'الوسائط والتضمين',
      'forms': 'النماذج والإدخال',
      'other': 'روابط ودلالية أخرى'
    };

    let totalRendered = 0;

    Object.keys(categories).forEach(catKey => {
      // Filter elements in this category
      const filtered = HTML_ELEMENTS_DB.filter(el => {
        const matchesCategory = filterCat === 'all' || filterCat === el.category;
        const inThisCategoryGroup = el.category === catKey;
        
        const friendlySearch = el.labelAr.toLowerCase() + ' ' + el.tag.toLowerCase() + ' ' + el.nameAr.toLowerCase();
        const matchesSearch = !searchQuery || friendlySearch.includes(searchQuery.toLowerCase());
        
        const matchesDisplay = !displayFilter || el.type === displayFilter;

        return matchesCategory && inThisCategoryGroup && matchesSearch && matchesDisplay;
      });

      if (filtered.length > 0) {
        const catDiv = document.createElement('div');
        catDiv.className = 'element-category';
        
        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = `${categories[catKey]} (${filtered.length})`;
        catDiv.appendChild(title);
        
        const grid = document.createElement('div');
        grid.className = 'element-grid';
        
        filtered.forEach(el => {
          const card = document.createElement('div');
          card.className = 'element-card';
          card.dataset.tag = el.tag;
          card.title = el.desc;
          card.setAttribute('role', 'button');
          card.tabIndex = 0;
          card.setAttribute('aria-label', `إضافة ${el.labelAr} (${el.tag}) إلى الصفحة`);
          
          card.innerHTML = `
            <span class="element-dot ${el.type}"></span>
            <div style="display: flex; flex-direction: column;">
              <span class="element-name">${el.tag}</span>
              <span class="element-desc">${el.labelAr}</span>
            </div>
          `;
          
          this.dragDrop.makeDraggable(card);
          grid.appendChild(card);
          totalRendered++;
        });
        
        catDiv.appendChild(grid);
        listContainer.appendChild(catDiv);
      }
    });

    document.getElementById('elements-count').textContent = totalRendered;
  }

  setupCategoryFilters() {
    const filters = document.getElementById('category-filters');
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;
      
      filters.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      
      const cat = btn.dataset.cat;
      const searchVal = document.getElementById('elements-search').value;
      this.renderElementsList(cat, searchVal);
    });

    // Display subfilters (Block, Inline, Void, Restricted)
    document.querySelectorAll('.display-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const activeTab = filters.querySelector('.filter-tab.active');
        const searchVal = document.getElementById('elements-search').value;
        
        if (btn.classList.contains('active-subfilter')) {
          btn.classList.remove('active-subfilter');
          btn.style.textDecoration = 'none';
          this.renderElementsList(activeTab.dataset.cat, searchVal, '');
        } else {
          document.querySelectorAll('.display-filter-btn').forEach(b => {
            b.classList.remove('active-subfilter');
            b.style.textDecoration = 'none';
          });
          btn.classList.add('active-subfilter');
          btn.style.textDecoration = 'underline';
          this.renderElementsList(activeTab.dataset.cat, searchVal, type);
        }
      });
    });
  }

  setupSearch() {
    const search = document.getElementById('elements-search');
    search.addEventListener('input', () => {
      const activeTab = document.querySelector('#category-filters .filter-tab.active');
      const subfilter = document.querySelector('.display-filter-btn.active-subfilter');
      const subfilterVal = subfilter ? subfilter.dataset.type : '';
      
      this.renderElementsList(activeTab.dataset.cat, search.value, subfilterVal);
    });
  }

  setupViewportResizer() {
    document.querySelectorAll('.viewport-btn').forEach(btn => {
      if (btn.dataset.reactOwned === 'true') return;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const width = btn.dataset.width;
        this.setCanvasViewport(width);

        // The viewport and responsive editing context stay in sync, so a
        // width edited after choosing Mobile cannot leak into Desktop.
        const breakpointMap = { '375': '375', '768': '768', '1440': '1200' };
        if (this.properties && typeof this.properties.setActiveBreakpoint === 'function') {
          this.properties.setActiveBreakpoint(breakpointMap[width] || 'all', { resizeCanvas: false });
        }
      });
    });
  }

  setCanvasViewport(width) {
    if (String(width) === '1440' || String(width) === '1200' || String(width) === 'all') {
      this.canvas.style.width = '100%';
    } else {
      this.canvas.style.width = `${parseInt(width, 10) || 1440}px`;
    }
    window.dispatchEvent(
      new CustomEvent('osoos:viewport-change', {
        detail: { width: String(width) }
      })
    );
    setTimeout(() => this.updateHighlighter(), 120);
  }

  setupGlobalEvents() {
    // Selection click inside canvas
    this.canvas.addEventListener('click', (e) => {
      if (document.body.classList.contains('preview-mode-active')) return;
      e.stopPropagation();
      
      const target = e.target.closest('#builder-canvas *');
      if (target && target !== this.canvas) {
        // Links are editable objects in designer mode. Never let selecting one
        // navigate away from the workspace or change the current URL hash.
        if (target.closest('a')) e.preventDefault();
        if (this.editor && this.editor.isPickingTarget) {
          e.preventDefault();
          this.editor.handleTargetPicked(target);
          return;
        }
        this.selectElement(target);
      } else {
        if (this.editor && this.editor.isPickingTarget) return;
        this.selectElement(null);
      }
    });

    // Hover guide outline inside canvas via JavaScript
    this.canvas.addEventListener('mouseover', (e) => {
      if (document.body.classList.contains('preview-mode-active')) return;
      const target = e.target.closest('#builder-canvas *');
      if (target && target !== this.canvas) {
        // Clear all previous hover classes
        this.canvas.querySelectorAll('.hovered-canvas-element').forEach(el => {
          el.classList.remove('hovered-canvas-element');
        });
        target.classList.add('hovered-canvas-element');
      }
    });

    this.canvas.addEventListener('mouseout', (e) => {
      const target = e.target;
      if (target && target.classList) {
        target.classList.remove('hovered-canvas-element');
      }
    });

    // Sync highlighter size when window resizes or canvas scrolls
    window.addEventListener('resize', () => this.updateHighlighter());
    this.canvas.addEventListener('scroll', () => this.updateHighlighter());
    this.canvasWrapper.addEventListener('scroll', () => this.updateHighlighter());
    
    // Key bindings (Delete / Escape / Arrows keyboard nudge keys)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Contextual Demo owns Escape while its modal is open so selection and
        // focus can return to the element toolbar instead of being cleared.
        if (document.getElementById('interaction-demo-overlay')) return;
        if (this.editor && this.editor.isPickingTarget) {
          this.editor.isPickingTarget = false;
          this.editor.pickingContext = null;
          this.showToastNotice('تم إلغاء اختيار العنصر المستهدف');
        } else {
          if (this.isMoveMode) {
            this.exitMoveMode();
            this.updateHighlighter();
          } else {
            this.selectElement(null);
          }
        }
        return;
      }

      if (this.selectedElement && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Prevent deleting if user is typing inside an editor or box model input
        const active = document.activeElement;
        const isEditable = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.hasAttribute('contenteditable') ||
          active.isContentEditable ||
          active.closest('.code-editor') ||
          active.closest('.editor-area')
        );
        if (isEditable) return;

        e.preventDefault();
        this.deleteCanvasElement(this.selectedElement, 'Delete Element');
        return;
      }

      // Keyboard Nudge logic for Arrow keys
      if (this.selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Prevent nudging if focus is in an editable field
        const active = document.activeElement;
        const isEditable = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.hasAttribute('contenteditable') ||
          active.isContentEditable ||
          active.closest('.code-editor') ||
          active.closest('.editor-area')
        );
        if (isEditable) return;

        // Prevent page scroll and move element
        e.preventDefault();

        const el = this.selectedElement;
        let step = 1; // Default: 1px
        if (e.shiftKey) step = 10;
        else if (e.altKey) step = 0.5;

        let moveX = parseFloat(el.getAttribute('data-move-x')) || 0;
        let moveY = parseFloat(el.getAttribute('data-move-y')) || 0;

        let targetX = moveX;
        let targetY = moveY;

        if (e.key === 'ArrowRight') targetX += step;
        else if (e.key === 'ArrowLeft') targetX -= step;
        else if (e.key === 'ArrowUp') targetY -= step;
        else if (e.key === 'ArrowDown') targetY += step;

        // Apply grid snapping if enabled and Alt is not held
        if (this.isSnapEnabled && !e.altKey) {
          targetX = Math.round(targetX / this.snapGridSize) * this.snapGridSize;
          targetY = Math.round(targetY / this.snapGridSize) * this.snapGridSize;
        }

        el.setAttribute('data-move-x', targetX);
        el.setAttribute('data-move-y', targetY);

        let baseTransform = el.getAttribute('data-base-transform');
        if (baseTransform === null) {
          let currentTransform = (this.styleEngine && this.styleEngine.getStyleValue(el, 'transform', {
            breakpoint: this.properties.activeBreakpoint,
            pseudo: 'normal'
          })) || el.style.transform || '';
          let cleaned = currentTransform
            .replace(/translate(3d)?\([^)]+\)/g, '')
            .trim();
          el.setAttribute('data-base-transform', cleaned);
          baseTransform = cleaned;
        }

        let finalTransform = baseTransform;
        if (finalTransform) finalTransform += ' ';
        finalTransform += `translate(${targetX}px, ${targetY}px)`;
        this.styleEngine.setStyle(el, 'transform', finalTransform, {
          breakpoint: this.properties.activeBreakpoint,
          pseudo: 'normal'
        });
        el.style.removeProperty('transform');

        // Real-time updates
        this.updateHighlighter();
        this.scheduleStyleSync(60);
        this.properties.updatePanelFor(el);
        this.updateResetMoveButtonVisibility();
        this.history.saveStateDebounced('Keyboard Nudge', 600);

        // Show temporary tooltip
        const tooltip = document.getElementById('spacing-drag-tooltip');
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.innerHTML = `translateX: ${targetX}px<br>translateY: ${targetY}px`;
          const rect = el.getBoundingClientRect();
          tooltip.style.top = `${rect.bottom + 10}px`;
          tooltip.style.left = `${rect.left + (rect.width / 2) - 50}px`;
          
          if (this.nudgeTooltipTimeout) clearTimeout(this.nudgeTooltipTimeout);
          this.nudgeTooltipTimeout = setTimeout(() => {
            tooltip.style.display = 'none';
          }, 1500);
        }
      }

      // Ctrl + Z (Undo), Ctrl + Y (Redo), Ctrl + Shift + Z (Redo)
      const isZ = e.key === 'z' || e.key === 'Z';
      const isY = e.key === 'y' || e.key === 'Y';
      if (e.ctrlKey && (isZ || isY)) {
        const active = document.activeElement;
        const isEditable = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.hasAttribute('contenteditable') ||
          active.isContentEditable ||
          active.closest('.code-editor') ||
          active.closest('.editor-area')
        );
        if (isEditable) return; // Leave native undo/redo inside text boxes alone
        
        e.preventDefault();
        if (isZ) {
          if (e.shiftKey) {
            this.history.redo();
          } else {
            this.history.undo();
          }
        } else if (isY) {
          this.history.redo();
        }
      }
    });

    // Custom CSS styling injector
    this.customStyleTag = document.createElement('style');
    this.customStyleTag.id = 'builder-custom-styles';
    document.head.appendChild(this.customStyleTag);

    // Auto-save toggle status
    const autosave = document.getElementById('autosave-toggle');
    if (autosave.dataset.reactOwned !== 'true') autosave.addEventListener('change', () => {
      if (autosave.checked) this.saveProgress();
    });

    // Export HTML button
    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportProjectCode();
    });

    // Final Preview button (clean standalone render)
    const finalPreviewBtn = document.getElementById('final-preview-btn');
    if (finalPreviewBtn) {
      finalPreviewBtn.addEventListener('click', () => {
        this.openFinalPreview();
      });
    }

    // Preview mode toggle button
    const previewBtn = document.getElementById('preview-toggle-btn');
    previewBtn.addEventListener('click', () => {
      this.togglePreviewMode();
    });

    // Undo / Redo button click listeners
    const btnUndo = document.getElementById('header-undo');
    if (btnUndo && btnUndo.dataset.reactOwned !== 'true') {
      btnUndo.addEventListener('click', () => {
        this.history.undo();
      });
    }
    const btnRedo = document.getElementById('header-redo');
    if (btnRedo && btnRedo.dataset.reactOwned !== 'true') {
      btnRedo.addEventListener('click', () => {
        this.history.redo();
      });
    }
  }

  setupHighlighterButtons() {
    // Select parent button
    const btnSelectParent = document.getElementById('bubble-select-parent');
    if (btnSelectParent) {
      btnSelectParent.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.selectedElement) return;
        const parent = this.selectedElement.parentElement;
        if (parent && parent !== this.canvas) {
          this.selectElement(parent);
        }
      });
    }

    // Layers select button and dropdown
    const btnLayers = document.getElementById('bubble-layers-btn');
    const layersDropdown = document.getElementById('highlighter-layers-dropdown');
    
    if (btnLayers && layersDropdown) {
      btnLayers.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = layersDropdown.style.display === 'block';
        
        // Hide other dropdowns
        layersDropdown.style.display = isOpen ? 'none' : 'block';
        
        if (!isOpen && this.selectedElement) {
          // Populate layers dropdown dynamically
          layersDropdown.innerHTML = '';
          const el = this.selectedElement;
          
          // 1. Current Selected Element
          const curItem = document.createElement('a');
          curItem.className = 'layers-dropdown-item active';
          curItem.href = '#';
          curItem.innerHTML = `<span>العنصر الحالي</span><span class="layers-dropdown-item-label">&lt;${el.tagName.toLowerCase()}&gt;</span>`;
          curItem.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            layersDropdown.style.display = 'none';
            this.selectElement(el);
          });
          layersDropdown.appendChild(curItem);
          
          // 2. Direct Parent
          const parent = el.parentElement;
          if (parent && parent !== this.canvas) {
            const parentItem = document.createElement('a');
            parentItem.className = 'layers-dropdown-item';
            parentItem.href = '#';
            parentItem.innerHTML = `<span>الأب المباشر</span><span class="layers-dropdown-item-label">&lt;${parent.tagName.toLowerCase()}&gt;</span>`;
            parentItem.addEventListener('click', (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              layersDropdown.style.display = 'none';
              this.selectElement(parent);
            });
            layersDropdown.appendChild(parentItem);
          }
          
          // 3. Root Parent
          let root = el;
          while (root.parentElement && root.parentElement !== this.canvas) {
            root = root.parentElement;
          }
          if (root !== el && root !== parent) {
            const rootItem = document.createElement('a');
            rootItem.className = 'layers-dropdown-item';
            rootItem.href = '#';
            rootItem.innerHTML = `<span>الأب الأعلى</span><span class="layers-dropdown-item-label">&lt;${root.tagName.toLowerCase()}&gt;</span>`;
            rootItem.addEventListener('click', (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              layersDropdown.style.display = 'none';
              this.selectElement(root);
            });
            layersDropdown.appendChild(rootItem);
          }
          
          // 4. Direct Children
          const children = Array.from(el.children);
          if (children.length > 0) {
            const header = document.createElement('div');
            header.style.fontSize = '8px';
            header.style.color = 'var(--text-muted)';
            header.style.padding = '4px 10px';
            header.style.borderTop = '1px solid var(--border-color)';
            header.textContent = 'الأبناء المباشرون:';
            layersDropdown.appendChild(header);
            
            children.forEach(child => {
              const childItem = document.createElement('a');
              childItem.className = 'layers-dropdown-item';
              childItem.href = '#';
              childItem.innerHTML = `<span>ابن: &lt;${child.tagName.toLowerCase()}&gt;</span>`;
              childItem.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                layersDropdown.style.display = 'none';
                this.selectElement(child);
              });
              layersDropdown.appendChild(childItem);
            });
          }
        }
      });
      
      // Close dropdown if clicked elsewhere
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#highlighter-layers-dropdown') && !e.target.closest('#bubble-layers-btn')) {
          layersDropdown.style.display = 'none';
        }
      });
    }

    // «القواعد» هي التحكم الوحيد على مستوى العنصر؛ مركز JS بقي في الشريط الجانبي فقط.

    // Open the contextual Demo for the element currently selected on canvas.
    const demoBtn = document.getElementById('bubble-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.selectedElement) {
          this.showToastNotice('اختر عنصرًا أولًا لفتح قواعد التفاعل');
          return;
        }
        if (this.interactionDemo) {
          this.interactionDemo.syncSelection(this.selectedElement);
          this.interactionDemo.open(demoBtn, 'flow');
        }
      });
    }

    // Delete button
    const btnDelete = document.getElementById('bubble-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.selectedElement) return;
        this.deleteCanvasElement(this.selectedElement, 'Delete Element');
      });
    }

    // Toggle Move Mode button
    const btnMove = document.getElementById('bubble-move');
    if (btnMove) {
      btnMove.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.selectedElement) return;
        if (this.isMoveMode) {
          this.exitMoveMode();
        } else {
          this.enterMoveMode();
        }
      });
    }

    // Toggle Snap Mode button
    const btnSnap = document.getElementById('bubble-snap');
    if (btnSnap) {
      btnSnap.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isSnapEnabled = !this.isSnapEnabled;
        if (this.isSnapEnabled) {
          btnSnap.classList.add('active');
          btnSnap.innerHTML = `<i class="fas fa-th"></i> محاذاة: نعم`;
          this.showToastNotice('تم تفعيل المحاذاة للشبكة (8 بكسل)');
        } else {
          btnSnap.classList.remove('active');
          btnSnap.innerHTML = `<i class="fas fa-th"></i> محاذاة: لا`;
          this.showToastNotice('تم إلغاء تفعيل المحاذاة الشبكية');
        }
      });
    }

    // Reset move button
    const btnResetMove = document.getElementById('bubble-reset-move');
    if (btnResetMove) {
      btnResetMove.addEventListener('click', (e) => {
        e.stopPropagation();
        const el = this.selectedElement;
        if (!el) return;
        
        // Remove move data attributes
        el.removeAttribute('data-move-x');
        el.removeAttribute('data-move-y');
        
        const baseTransform = el.getAttribute('data-base-transform') || '';
        this.styleEngine.setStyle(el, 'transform', baseTransform, {
          breakpoint: this.properties.activeBreakpoint,
          pseudo: 'normal'
        });
        el.style.removeProperty('transform');
        el.removeAttribute('data-base-transform');
        
        this.updateResetMoveButtonVisibility();
        this.exitMoveMode();
        this.scheduleStyleSync(0);
        this.history.saveState('Reset Move');
        this.updateHighlighter();
        
        this.showToastNotice('تم إعادة تعيين موضع العنصر');
      });
    }

    // Drag move mousedown listener on highlighter overlay
    if (this.highlighter) {
      this.highlighter.addEventListener('mousedown', (e) => {
        if (!this.isMoveMode) return;
        // Skip spacing handles and bubble buttons
        if (e.target.classList.contains('spacing-handle') || e.target.classList.contains('overlay-dot')) return;
        if (e.target.closest('.floating-action-bubble')) return;
        
        this.startDragMove(e);
      });
    }
  }

  // Handle selected element state
  selectElement(el) {
    // Clear old selection border
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected-element');
    }
    
    // Hide layers dropdown menu
    const layersDropdown = document.getElementById('highlighter-layers-dropdown');
    if (layersDropdown) layersDropdown.style.display = 'none';

    this.exitMoveMode(); // Exit Move Mode on selection change

    this.selectedElement = el;
    
    if (el) {
      el.classList.add('selected-element');
      this.updateHighlighter();
      this.properties.updatePanelFor(el);
      this.updateBreadcrumbs(el);
      
      /* P3: تبديل صنف التحديد فقط. البناء الكامل بيرجع تلقائيًا لو العنصر
         مش موجود في الشجرة المرسومة (يعني حصل تغيير هيكلي فعلًا). */
      if (!this.domTree.updateSelectionOnly()) this.domTree.render();
      
      // Update interactive JavaScript linker panel
      this.editor.updateInteractiveLinker();

      // Update element name badge in floating toolbar
      const nameBadge = document.getElementById('bubble-el-name');
      if (nameBadge) {
        nameBadge.textContent = el.tagName.toLowerCase();
      }
      
      this.updateResetMoveButtonVisibility();

      // Update snap button active class and text
      const btnSnap = document.getElementById('bubble-snap');
      if (btnSnap) {
        if (this.isSnapEnabled) {
          btnSnap.classList.add('active');
          btnSnap.innerHTML = `<i class="fas fa-th"></i> محاذاة: نعم`;
        } else {
          btnSnap.classList.remove('active');
          btnSnap.innerHTML = `<i class="fas fa-th"></i> محاذاة: لا`;
        }
      }

      // If the selected element has an existing move offset, show the tooltip briefly
      const moveX = parseFloat(el.getAttribute('data-move-x')) || 0;
      const moveY = parseFloat(el.getAttribute('data-move-y')) || 0;
      if (moveX !== 0 || moveY !== 0) {
        const tooltip = document.getElementById('spacing-drag-tooltip');
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.innerHTML = `translateX: ${moveX}px<br>translateY: ${moveY}px`;
          const rect = el.getBoundingClientRect();
          tooltip.style.top = `${rect.bottom + 10}px`;
          tooltip.style.left = `${rect.left + (rect.width / 2) - 50}px`;
          
          if (this.nudgeTooltipTimeout) clearTimeout(this.nudgeTooltipTimeout);
          this.nudgeTooltipTimeout = setTimeout(() => {
            tooltip.style.display = 'none';
          }, 1500);
        }
      }
    } else {
      this.highlighter.style.display = 'none';
      this.properties.updatePanelFor(null);
      this.breadcrumbs.innerHTML = '<span style="color: var(--text-muted);">body</span>';
      if (!this.domTree.updateSelectionOnly()) this.domTree.render();
      this.editor.updateInteractiveLinker();
    }

    if (this.interactionDemo && typeof this.interactionDemo.handleSelectionChange === 'function') {
      this.interactionDemo.handleSelectionChange(el);
    }
  }

  // Snaps the orange highlighter border overlay onto the selected element
  updateHighlighter() {
    // Keep visual link arrows glued to their elements on every geometry
    // change (scroll, resize, Safe Move, spacing drags, selection...)
    if (this.editor && typeof this.editor.updateVisualLinkArrows === 'function') {
      this.editor.updateVisualLinkArrows();
    }

    if (!this.selectedElement) {
      this.highlighter.style.display = 'none';
      return;
    }

    const el = this.selectedElement;
    const elRect = el.getBoundingClientRect();
    const wrapperRect = this.canvasWrapper.getBoundingClientRect();

    // Check if element is out of viewport scroll
    if (elRect.bottom < wrapperRect.top || elRect.top > wrapperRect.bottom ||
        elRect.right < wrapperRect.left || elRect.left > wrapperRect.right) {
      this.highlighter.style.display = 'none';
      return;
    }

    // Position highlighter relative to canvas-wrapper
    this.highlighter.style.display = 'block';
    this.highlighter.style.width = `${elRect.width}px`;
    this.highlighter.style.height = `${elRect.height}px`;
    this.highlighter.style.top = `${elRect.top - wrapperRect.top + this.canvasWrapper.scrollTop}px`;
    this.highlighter.style.left = `${elRect.left - wrapperRect.left + this.canvasWrapper.scrollLeft}px`;

    // Set element badge name
    let badgeLabel = el.tagName.toLowerCase();
    if (el.id) badgeLabel += `#${el.id}`;
    this.highlighterBadge.textContent = badgeLabel;
  }

  updateBreadcrumbs(el) {
    this.breadcrumbs.innerHTML = '';
    let path = [];
    let current = el;
    while (current && current !== this.canvas) {
      path.unshift(current);
      current = current.parentElement;
    }
    path.unshift(this.canvas);
    
    path.forEach((node, index) => {
      if (index > 0) {
        const sep = document.createElement('span');
        sep.textContent = ' > ';
        sep.style.color = 'var(--text-muted)';
        sep.style.margin = '0 4px';
        this.breadcrumbs.appendChild(sep);
      }
      
      const link = document.createElement('span');
      let label = node === this.canvas ? 'body' : node.tagName.toLowerCase();
      if (node !== this.canvas && node.className) {
        const cleanClasses = node.className
          .replace('selected-element', '')
          .replace('drag-hover-container', '')
          .replace('hovered-canvas-element', '')
          .trim();
        if (cleanClasses) label += `.${cleanClasses.split(/\s+/)[0]}`;
      }
      link.textContent = label;
      link.style.cursor = 'pointer';
      link.style.color = 'var(--text-main)';
      link.style.fontWeight = node === el ? 'bold' : 'normal';
      link.addEventListener('click', (e) => {
        e.stopPropagation();
        if (node === this.canvas) {
          this.selectElement(null);
        } else {
          this.selectElement(node);
        }
      });
      this.breadcrumbs.appendChild(link);
    });
  }

  reattachCanvasListeners() {
    // Add custom hover/click guides inside the canvas elements
    const elements = this.canvas.querySelectorAll('*');
    elements.forEach(el => {
      // Elements inside must not default capture drag operations if we want custom dragging
      el.setAttribute('draggable', 'false');
    });
  }

  applyCustomCSS(css) {
    const unmanagedCss = this.styleEngine ? this.styleEngine.loadFromCSS(css) : css;
    this.customStyleTag.textContent = this.scopeCssForCanvas(unmanagedCss);
    // Recalculate highlighter sizes in case styling changes dimensions
    setTimeout(() => this.updateHighlighter(), 100);
  }

  scopeCssForCanvas(css) {
    const source = String(css || '');
    if (!source.trim()) return '';
    let previewSource = source;
    try {
      // Parse before wrapping so an unmatched brace cannot escape the scope.
      // Root page selectors become the canvas root, preserving body/:root
      // semantics in the designer while exports keep the original selectors.
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(source);
      previewSource = this.serializeCanvasPreviewRules(Array.from(sheet.cssRules || []));
    } catch {
      // The CSS tab is live and is often temporarily incomplete. The outer
      // scope still provides isolation until the next valid edit arrives.
    }
    return `@scope (#builder-canvas) {\n${previewSource}\n}`;
  }

  serializeCanvasPreviewRules(rules) {
    return Array.from(rules || []).map(rule => {
      if (rule.type === CSSRule.STYLE_RULE) {
        return `${this.mapPageRootSelectorsToCanvas(rule.selectorText)} { ${rule.style.cssText} }`;
      }

      const groupingRuleNames = new Set([
        'CSSMediaRule', 'CSSSupportsRule', 'CSSContainerRule',
        'CSSLayerBlockRule', 'CSSStartingStyleRule'
      ]);
      if (rule.cssRules && groupingRuleNames.has(rule.constructor && rule.constructor.name)) {
        const openBrace = rule.cssText.indexOf('{');
        if (openBrace !== -1) {
          const header = rule.cssText.slice(0, openBrace).trim();
          return `${header} {\n${this.serializeCanvasPreviewRules(Array.from(rule.cssRules))}\n}`;
        }
      }
      return rule.cssText;
    }).join('\n');
  }

  mapPageRootSelectorsToCanvas(selectorText) {
    return String(selectorText || '').replace(
      /(^|[\s>+~,(])(?:html|body|:root)(?=$|[\s>+~.#:[\]),])/gi,
      '$1:scope'
    ).replace(/:scope\s*>\s*:scope|:scope\s+:scope/g, ':scope');
  }

  /* Build the identity diff before an HTML branch disappears. This snapshot is
     shared by CSS and JavaScript cleanup so all deletion entry points produce
     exactly the same result. */
  createStructureRemovalContext(elements, options = {}) {
    const roots = Array.from(elements || [])
      .filter(element => element && element.nodeType === 1 && this.canvas && this.canvas.contains(element))
      .filter((element, index, all) => !all.some((other, otherIndex) => otherIndex !== index && other.contains(element)));
    const replacementRoot = options.replacementRoot || null;
    const nodes = [];
    roots.forEach(root => nodes.push(root, ...root.querySelectorAll('*')));
    const nodeSet = new Set(nodes);
    const isRemovedNode = node => nodeSet.has(node) || roots.some(root => root.contains(node));
    const editorClasses = new Set([
      'selected-element', 'hovered-canvas-element', 'drag-hover-container',
      'canvas-picker-target', 'move-mode-active', 'shake-reject',
      'dom-tree-hover-preview'
    ]);

    const replacementElements = replacementRoot && typeof replacementRoot.querySelectorAll === 'function'
      ? Array.from(replacementRoot.querySelectorAll('*'))
      : [];
    const remainingCanvasElements = !replacementRoot && this.canvas
      ? Array.from(this.canvas.querySelectorAll('*')).filter(node => !isRemovedNode(node))
      : [];
    const remainingElements = replacementRoot ? replacementElements : remainingCanvasElements;

    const candidateIds = new Set();
    const candidateClasses = new Set();
    nodes.forEach(node => {
      if (node.id) candidateIds.add(node.id);
      if (node.classList) node.classList.forEach(className => {
        if (!editorClasses.has(className)) candidateClasses.add(className);
      });
    });

    const remainingIds = new Set();
    const remainingClasses = new Set();
    remainingElements.forEach(node => {
      if (node.id) remainingIds.add(node.id);
      if (node.classList) node.classList.forEach(className => {
        if (!editorClasses.has(className)) remainingClasses.add(className);
      });
    });

    const deletedIds = new Set(Array.from(candidateIds).filter(id => !remainingIds.has(id)));
    const deletedClasses = new Set(Array.from(candidateClasses).filter(className => !remainingClasses.has(className)));
    const queryMatches = (root, selector) => {
      if (!root || !selector) return [];
      const matches = [];
      try {
        if (root.nodeType === 1 && root.matches && root.matches(selector)) matches.push(root);
        if (typeof root.querySelectorAll === 'function') matches.push(...root.querySelectorAll(selector));
      } catch { return []; }
      return matches;
    };
    const selectorIsOrphan = selector => {
      const touchedRemovedBranch = roots.some(root => queryMatches(root, selector).length > 0);
      if (!touchedRemovedBranch) return false;
      if (replacementRoot) return queryMatches(replacementRoot, selector).length === 0;
      return queryMatches(this.canvas, selector).every(node => isRemovedNode(node));
    };

    return {
      roots,
      nodes,
      deletedIds,
      deletedClasses,
      selectorIsOrphan,
      hasOrphanSelectors: roots.length > 0,
      replacementRoot
    };
  }

  cleanupStructureRemoval(elements, options = {}) {
    const context = this.createStructureRemovalContext(elements, options);
    const report = {
      cssManaged: 0,
      cssUnmanagedChanged: false,
      js: { changed: false, visualLinks: 0, components: 0, interactions: 0, blocks: 0, variables: 0 }
    };
    if (!context.roots.length) return Object.assign(report, { context });

    const identities = { ids: context.deletedIds, classes: context.deletedClasses };
    if (this.styleEngine && this.editor) {
      const currentCss = this.editor.customCSS || '';
      const unmanagedCss = this.styleEngine.stripManagedBlock(currentCss);
      const nextUnmanagedCss = this.styleEngine.removeUnmanagedRulesForIdentities(unmanagedCss, identities);
      report.cssUnmanagedChanged = nextUnmanagedCss !== unmanagedCss;
      report.cssManaged = this.styleEngine.removeRulesForIdentities(identities, false);
      if (report.cssManaged || report.cssUnmanagedChanged) {
        this.editor.customCSS = nextUnmanagedCss;
        this.styleEngine.commitToEditor();
      }
    }

    if (this.editor && typeof this.editor.cleanupReferencesForDeletedElements === 'function') {
      report.js = this.editor.cleanupReferencesForDeletedElements({
        deletedIds: context.deletedIds,
        selectorIsOrphan: context.selectorIsOrphan,
        hasOrphanSelectors: context.hasOrphanSelectors
      });
    }
    return Object.assign(report, { context });
  }

  refreshInteractionUIAfterStructureCleanup() {
    if (!this.editor) return;
    ['scanAndRenderVariables', 'renderBlocksDashboard', 'renderGlobalInteractionsDashboard',
      'renderComponentsManagementList', 'renderVisualLinksDashboard', 'updateInteractiveLinker',
      'updateVisualLinkArrows'].forEach(method => {
      if (typeof this.editor[method] === 'function') this.editor[method]();
    });
  }

  deleteCanvasElement(element, reason = 'Delete Element') {
    if (!element || !this.canvas || !this.canvas.contains(element) || element === this.canvas) return false;
    const selected = this.selectedElement;
    const nextSelection = selected && (selected === element || element.contains(selected)) ? null : selected;

    if (this.history && typeof this.history.flushPendingState === 'function') {
      this.history.flushPendingState('Flush pending state before delete');
    }
    this.cleanupStructureRemoval([element]);
    element.remove();
    this.selectElement(nextSelection);
    this.syncAll();
    this.refreshInteractionUIAfterStructureCleanup();
    this.history.saveState(reason);
    return true;
  }

  // Synchronization between UI Canvas, Code Editor, and DOM tree
  syncAll() {
    if (this.styleEngine) this.styleEngine.migrateInlineStyles(this.canvas);
    this.domTree.render();
    this.editor.refreshEditorContent();
    this.saveProgress();
  }

  // CSS controls update the stylesheet and preview immediately. Expensive
  // code-editor/autosave work is batched without rebuilding the DOM tree.
  scheduleStyleSync(delay = 90) {
    if (this.styleSyncTimer) clearTimeout(this.styleSyncTimer);
    this.styleSyncTimer = setTimeout(() => {
      this.styleSyncTimer = null;
      if (this.styleEngine) this.styleEngine.migrateInlineStyles(this.canvas);
      this.editor.refreshEditorContent();
      this.saveProgress();
      this.updateHighlighter();
    }, delay);
  }

  syncDOMTree(options = {}) {
    if (this.styleEngine) this.styleEngine.migrateInlineStyles(this.canvas);
    this.domTree.render();
    this.editor.refreshEditorContent({
      preserveSelection: options.preserveEditorSelection === true,
      selectionState: options.editorSelectionState || null
    });
    this.saveProgress();
  }

  getPersistentCanvasHTML() {
    const clone = this.canvas.cloneNode(true);
    const editorClasses = [
      'selected-element', 'hovered-canvas-element', 'drag-hover-container',
      'canvas-picker-target', 'move-mode-active', 'shake-reject'
    ];
    [clone, ...clone.querySelectorAll('*')].forEach(node => {
      if (node.classList) {
        editorClasses.forEach(className => node.classList.remove(className));
        if (!node.classList.length) node.removeAttribute('class');
      }
      node.removeAttribute('draggable');
      if (node.style) {
        node.style.removeProperty('outline');
        node.style.removeProperty('outline-offset');
        if (!node.style.cssText.trim()) node.removeAttribute('style');
      }
    });
    return clone.innerHTML;
  }

  // Load and save localStorage progress
  /* HTML محفوظ قد يحمل on*=... من لصق قديم؛ إعادة حقنه تشغّلها فوراً */
  sanitizeRestoredHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    const forbiddenTags = new Set([
      'script', 'style', 'iframe', 'object', 'embed', 'base', 'link', 'meta',
      'frame', 'frameset', 'svg', 'math', 'noscript', 'template'
    ]);
    const allowedTags = new Set([
      'div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside',
      'form', 'fieldset', 'figure', 'figcaption', 'details', 'summary', 'dialog',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'q', 'pre', 'code',
      'span', 'address', 'strong', 'b', 'em', 'i', 'u', 'small', 'mark', 'sub',
      'sup', 'del', 'ins', 'abbr', 'kbd', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'table', 'caption', 'colgroup', 'col', 'thead', 'tbody', 'tfoot', 'tr',
      'th', 'td', 'img', 'picture', 'video', 'audio', 'canvas', 'source', 'track',
      'input', 'textarea', 'select', 'option', 'label', 'button', 'legend',
      'datalist', 'progress', 'meter', 'output', 'optgroup', 'a', 'hr', 'br',
      'time', 'wbr'
    ]);
    const allowedAttributes = new Set([
      'id', 'class', 'title', 'lang', 'dir', 'hidden', 'tabindex', 'role',
      'contenteditable', 'style', 'href', 'src', 'action', 'formaction', 'target',
      'rel', 'download', 'alt', 'width', 'height', 'loading', 'decoding',
      'crossorigin', 'referrerpolicy', 'poster', 'controls', 'loop', 'muted',
      'playsinline', 'preload', 'kind', 'srclang', 'label', 'default', 'type',
      'name', 'value', 'placeholder', 'required', 'disabled', 'readonly',
      'checked', 'selected', 'multiple', 'min', 'max', 'step', 'minlength',
      'maxlength', 'pattern', 'accept', 'autocomplete', 'rows', 'cols', 'wrap',
      'for', 'form', 'method', 'enctype', 'colspan', 'rowspan', 'scope',
      'headers', 'datetime', 'open', 'start', 'reversed', 'low', 'high',
      'optimum'
    ]);
    const urlAttributes = new Set(['href', 'src', 'action', 'formaction', 'poster']);
    const safeUrl = (value, attributeName, tagName) => {
      const raw = String(value || '').trim();
      if (!raw) return true;
      // Normalize control and whitespace characters before protocol checks.
      // eslint-disable-next-line no-control-regex
      const compact = raw.replace(/[\u0000-\u0020\u007f]+/g, '');
      if (compact.startsWith('#') || compact.startsWith('/') || compact.startsWith('./') || compact.startsWith('../')) return true;
      if (!/^[a-z][a-z0-9+.-]*:/i.test(compact)) return true;
      const scheme = compact.slice(0, compact.indexOf(':')).toLowerCase();
      if (scheme === 'http' || scheme === 'https') return true;
      if (attributeName === 'href' && (scheme === 'mailto' || scheme === 'tel')) return true;
      if (attributeName === 'src' && (tagName === 'img' || tagName === 'source')) {
        return /^data:image\/(?:png|jpe?g|gif|webp|avif);/i.test(compact);
      }
      return false;
    };
    const safeInlineStyle = value => {
      const compact = String(value || '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0020\u007f]+/g, '')
        .toLowerCase();
      return !/(?:expression|behavior)\(|(?:url|image-set)\([^)]*(?:javascript:|data:text\/html)/i.test(compact)
        && !/@import/i.test(compact);
    };

    Array.from(template.content.querySelectorAll('*')).forEach(node => {
      const tagName = node.localName.toLowerCase();
      if (forbiddenTags.has(tagName)) {
        node.remove();
        return;
      }
      if (!allowedTags.has(tagName)) {
        node.replaceWith(...Array.from(node.childNodes));
        return;
      }

      Array.from(node.attributes || []).forEach(attribute => {
        const name = attribute.name.toLowerCase();
        const value = String(attribute.value || '');
        const isExtensibleSafeAttribute = name.startsWith('aria-') || name.startsWith('data-');
        if ((!allowedAttributes.has(name) && !isExtensibleSafeAttribute) ||
            (urlAttributes.has(name) && !safeUrl(value, name, tagName)) ||
            (name === 'style' && !safeInlineStyle(value))) {
          node.removeAttribute(attribute.name);
        }
      });

      if (tagName === 'a' && node.getAttribute('target') === '_blank') {
        const rel = new Set(String(node.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
        rel.add('noopener');
        rel.add('noreferrer');
        node.setAttribute('rel', Array.from(rel).join(' '));
      }
    });
    return template.innerHTML;
  }

  /* ── إعدادات الصفحة: الاتجاه واللغة والهوية ─────────────────────────────
     تُطبَّق حياً على الكانفس، تُحفظ مع المشروع، وتُحقن في وسم <html> عند التصدير. */

  getPageSettings() {
    const defaults = { dir: 'rtl', lang: 'ar', title: 'الموقع المصمم بواسطة منشئ البرمجة التفاعلية', description: '' };
    return Object.assign(defaults, this.pageSettings || {});
  }

  applyPageSettingsToCanvas() {
    const settings = this.getPageSettings();
    if (this.canvas) {
      this.canvas.setAttribute('dir', settings.dir);
      this.canvas.setAttribute('lang', settings.lang);
    }
    const previewBox = document.getElementById('page-dir-preview-box');
    if (previewBox) previewBox.setAttribute('dir', settings.dir === 'auto' ? 'rtl' : settings.dir);
  }

  setPageSetting(key, value) {
    this.pageSettings = Object.assign(this.getPageSettings(), { [key]: value });
    this.applyPageSettingsToCanvas();
    this.saveProgress(false);
    if (this.history && this.history.saveStateDebounced) this.history.saveStateDebounced('Page settings');
  }

  loadPageSettings() {
    try {
      const raw = localStorage.getItem('builder-page-settings');
      if (raw) this.pageSettings = JSON.parse(raw);
    } catch (error) {
      console.warn('تعذر تحميل إعدادات الصفحة.', error);
    }
    const settings = this.getPageSettings();
    const dirSegment = document.getElementById('page-dir-segmented');
    if (dirSegment) dirSegment.querySelectorAll('.segment-btn').forEach(button => {
      const active = button.dataset.val === settings.dir;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const langSelect = document.getElementById('page-lang-select');
    if (langSelect) langSelect.value = settings.lang;
    const titleInput = document.getElementById('page-title-input');
    if (titleInput) titleInput.value = settings.title;
    const descInput = document.getElementById('page-desc-input');
    if (descInput) descInput.value = settings.description;
    this.applyPageSettingsToCanvas();
  }

  setupPageSettings() {
    const dirSegment = document.getElementById('page-dir-segmented');
    if (dirSegment) dirSegment.addEventListener('click', event => {
      const button = event.target.closest('.segment-btn');
      if (!button) return;
      dirSegment.querySelectorAll('.segment-btn').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      this.setPageSetting('dir', button.dataset.val);
      /* اللغة تتبع الاتجاه افتراضياً عند أول اختيار لتفادي تعارض ar مع ltr */
      const langSelect = document.getElementById('page-lang-select');
      if (langSelect && button.dataset.val === 'ltr' && langSelect.value.indexOf('ar') === 0) {
        langSelect.value = 'en';
        this.setPageSetting('lang', 'en');
      }
    });
    const langSelect = document.getElementById('page-lang-select');
    if (langSelect) langSelect.addEventListener('change', () => this.setPageSetting('lang', langSelect.value));
    const titleInput = document.getElementById('page-title-input');
    if (titleInput) titleInput.addEventListener('input', () => this.setPageSetting('title', titleInput.value));
    const descInput = document.getElementById('page-desc-input');
    if (descInput) descInput.addEventListener('input', () => this.setPageSetting('description', descInput.value));
  }

  saveProgress(recordHistory = true) {
    /* B3: تسجيل التاريخ مستقل عن الحفظ المحلي.
       كان السطر ده تحت الخروج المبكر، فإطفاء "حفظ تلقائي" (إعداد تخزين)
       كان بيعطّل Undo بصمت للعمليات اللي بتعتمد على saveProgress وحدها.
       saveStateDebounced محمية أصلًا بـ isRestoring فمفيش تلوث أثناء التراجع. */
    if (recordHistory && this.history && typeof this.history.saveStateDebounced === 'function') {
      this.history.saveStateDebounced('Save Progress');
    }

    const autosave = document.getElementById('autosave-toggle');
    if (!autosave || !autosave.checked) return;

    const entries = [
      ['builder-html', this.getPersistentCanvasHTML()],
      ['builder-css', this.editor.customCSS],
      ['builder-js', this.editor.customJS],
      ['builder-interactions', JSON.stringify(
        typeof this.editor.getInteractionDefinitions === 'function'
          ? this.editor.getInteractionDefinitions()
          : (this.editor.interactionDefinitions || [])
      )],
      ['builder-page-settings', JSON.stringify(this.getPageSettings())]
    ];
    const projectSave = this.projectManager && !this.projectManager.isSwitching
      ? this.projectManager.saveFromEditor()
      : null;
    const localSnapshotSize = entries.reduce(
      (total, [key, value]) => total + key.length + String(value || '').length,
      0
    );
    const containsEmbeddedAsset = entries.some(([, value]) =>
      /data:[^,]+;base64,/i.test(String(value || ''))
    );
    const useExpandedStorageOnly = !!projectSave &&
      (containsEmbeddedAsset || localSnapshotSize > 1_500_000);

    if (useExpandedStorageOnly) {
      void Promise.resolve(projectSave).then(result => {
        if (!result || !result.saved) return;
        entries.forEach(([key]) => {
          try { localStorage.removeItem(key); } catch { /* IndexedDB remains authoritative. */ }
        });
        if (!this._expandedStorageNotified) {
          this._expandedStorageNotified = true;
          this.showToastNotice('تم حفظ المشروع وملفاته الكبيرة في تخزين المتصفح الموسّع');
          setTimeout(() => { this._expandedStorageNotified = false; }, 30000);
        }
      });
      return;
    }
    let previousValues = null;

    try {
      previousValues = entries.map(([key]) => localStorage.getItem(key));
      entries.forEach(([key, value]) => localStorage.setItem(key, value));
    } catch (error) {
      // localStorage is not transactional. Restore the complete canonical
      // triplet when possible so a partial write cannot hide phase backup data.
      if (previousValues) {
        try {
          entries.forEach(([key], index) => {
            const previousValue = previousValues[index];
            if (previousValue === null) localStorage.removeItem(key);
            else localStorage.setItem(key, previousValue);
          });
        } catch (rollbackError) {
          console.warn('تعذر التراجع عن حفظ محلي جزئي.', rollbackError);
        }
      }
      console.warn('تعذر حفظ تقدم المشروع محليًا.', error);
      if (projectSave) {
        void Promise.resolve(projectSave).then(result => {
          if (result && result.saved) {
            entries.forEach(([key]) => {
              try { localStorage.removeItem(key); } catch { /* IndexedDB remains authoritative. */ }
            });
            if (!this._expandedStorageNotified) {
              this._expandedStorageNotified = true;
              this.showToastNotice('تم الحفظ في تخزين المتصفح الموسّع بعد امتلاء الذاكرة الصغيرة');
              setTimeout(() => { this._expandedStorageNotified = false; }, 30000);
            }
            return;
          }
          if (!this._saveFailureNotified) {
            this._saveFailureNotified = true;
            this.showToastNotice('تعذّر الحفظ المحلي. احفظ المشروع في مجلد أو صدّره الآن');
            setTimeout(() => { this._saveFailureNotified = false; }, 30000);
          }
        });
      } else if (typeof this.showToastNotice === 'function' && !this._saveFailureNotified) {
        this._saveFailureNotified = true;
        this.showToastNotice('تعذّر الحفظ المحلي. احفظ المشروع في مجلد أو صدّره الآن');
        setTimeout(() => { this._saveFailureNotified = false; }, 30000);
      }
    }

  }

  loadSavedProgress() {
    const canonicalKeys = ['builder-html', 'builder-css', 'builder-js'];
    const phaseKeys = [
      'osoos-phase-a-builder-html',
      'osoos-phase-a-builder-css',
      'osoos-phase-a-builder-js'
    ];
    const migrationBackupKey = 'osoos-e1-phase-a-migration-backup-v1';
    let savedValues = [null, null, null];

    try {
      const canonicalValues = canonicalKeys.map(key => localStorage.getItem(key));
      const allCanonicalKeysAreAbsent = canonicalValues.every(value => value === null);

      if (!allCanonicalKeysAreAbsent) {
        // A partial canonical project is still canonical. Never fill its gaps
        // from the experimental namespace because that would mix projects.
        savedValues = canonicalValues;
      } else {
        const phaseValues = phaseKeys.map(key => localStorage.getItem(key));
        const completePhaseTripletExists = phaseValues.every(value => value !== null);

        if (completePhaseTripletExists) {
          const snapshot = JSON.stringify({
            backupVersion: 1,
            source: 'phase-a-experimental',
            keys: phaseKeys,
            values: {
              html: phaseValues[0],
              css: phaseValues[1],
              js: phaseValues[2]
            }
          });
          const existingSnapshot = localStorage.getItem(migrationBackupKey);

          // Preserve the first backup. A changed phase triplet requires a new,
          // explicit migration decision instead of overwriting that snapshot.
          if (existingSnapshot === null) {
            localStorage.setItem(migrationBackupKey, snapshot);
          }

          if (localStorage.getItem(migrationBackupKey) === snapshot) {
            savedValues = phaseValues;
          } else {
            /* B4: كان الفشل ده صامتًا تمامًا (console.warn بس) — المستخدم يلاقي
               كانفس فاضي وبياناته القديمة محبوسة في مفاتيح phase-a بلا أي تفسير. */
            console.warn('لم يتم استيراد بيانات النسخة التجريبية لأن نسخة E1 الاحتياطية غير مطابقة.');
            this._phaseMigrationBlocked = true;
          }
        }
      }
    } catch (error) {
      // Keep the editor defaults intact when storage is unavailable or a
      // migration snapshot cannot be written/read safely.
      console.warn('تعذر تحميل تقدم المشروع أو إنشاء نسخة ترحيل E1 آمنة.', error);
    }

    /* B4: نعرض الإشعار بعد ما تخلص الواجهة تحميلها عشان الـ toast يبان فعلًا */
    if (this._phaseMigrationBlocked) {
      this._phaseMigrationBlocked = false;
      setTimeout(() => {
        if (typeof this.showToastNotice === 'function') {
          this.showToastNotice('بياناتك القديمة (النسخة التجريبية) موجودة لكن لم تُستورد — راجع الإعدادات قبل الكتابة فوقها', 8000);
        }
      }, 1200);
    }

    const [savedHtml, savedCss, savedJs] = savedValues;
    let savedInteractions = [];
    try {
      const rawInteractions = localStorage.getItem('builder-interactions');
      const parsedInteractions = rawInteractions ? JSON.parse(rawInteractions) : [];
      savedInteractions = Array.isArray(parsedInteractions) ? parsedInteractions : [];
    } catch (error) {
      console.warn('تعذر قراءة بيانات التفاعلات المنفصلة؛ سيُستخدم ترحيل الكود القديم إن وُجد.', error);
    }
    if (savedHtml !== null) this.canvas.innerHTML = this.sanitizeRestoredHtml(savedHtml);
    if (savedCss !== null) {
      this.editor.customCSS = savedCss;
      this.applyCustomCSS(savedCss);
    }
    if (savedJs !== null) this.editor.customJS = savedJs;
    if (typeof this.editor.setInteractionDefinitions === 'function') {
      this.editor.setInteractionDefinitions(savedInteractions);
    } else {
      this.editor.interactionDefinitions = savedInteractions;
    }
    this.loadPageSettings();

    // Parsing dashboards is read-only: raw customJS remains untouched until
    // the user saves an interaction or a later normal autosave occurs.
    [
      'refreshEditorContent',
      'renderVisualLinksDashboard',
      'renderBlocksDashboard',
      'scanAndRenderVariables'
    ].forEach(methodName => {
      try {
        if (typeof this.editor[methodName] === 'function') this.editor[methodName]();
      } catch (error) {
        console.warn(`تعذر تحديث واجهة المحرر (${methodName}) مع الاحتفاظ بالكود الخام.`, error);
      }
    });
  }

  // Toggle Preview/Edit Modes
  togglePreviewMode() {
    const isEditing = !document.body.classList.contains('preview-mode-active');
    
    if (isEditing) {
      // Switching to Preview Mode
      document.body.classList.add('preview-mode-active');
      this.selectElement(null); // clear highlight
      
      // Hide all developer grids/sidebars
      document.querySelector('.side-panel.panel-left').style.display = 'none';
      document.querySelector('.side-panel.panel-right').style.display = 'none';
      document.querySelector('.thin-sidebar').style.display = 'none';
      document.querySelector('.bottom-panel').style.display = 'none';
      document.querySelector('.preview-header-bar').style.display = 'none';
      
      // Modify workspace grid columns
      document.querySelector('.app-workspace').style.gridTemplateColumns = '1fr';
      document.querySelector('.center-workspace').style.gridTemplateRows = '1fr';
      
      // Canvas background set to white preview
      this.canvas.style.borderRadius = '0';
      this.canvas.style.minHeight = '100vh';
      
      // Toggle button text
      document.getElementById('preview-toggle-btn').innerHTML = '<i class="fas fa-edit"></i> تعديل';
    } else {
      // Switching back to Editing Mode
      document.body.classList.remove('preview-mode-active');
      
      // Restore sidebars
      document.querySelector('.side-panel.panel-left').style.display = 'flex';
      document.querySelector('.side-panel.panel-right').style.display = 'flex';
      document.querySelector('.thin-sidebar').style.display = 'flex';
      document.querySelector('.bottom-panel').style.display = ''; // Clear display none
      document.querySelector('.preview-header-bar').style.display = 'flex';
      
      // Restore grid sizes using css properties and workspace modes
      document.querySelector('.app-workspace').style.removeProperty('grid-template-columns');
      document.querySelector('.center-workspace').style.removeProperty('grid-template-rows');
      this.setWorkspaceMode(this.workspaceMode || 'designer');
      
      // Restore canvas border
      this.canvas.style.borderRadius = '0 0 var(--radius-md) var(--radius-md)';
      this.canvas.style.minHeight = '480px';
      
      document.getElementById('preview-toggle-btn').innerHTML = '<i class="fas fa-eye"></i> معاينة';
      this.updateHighlighter();
    }
  }

  // Pre-export sanity checks. Never blocks on JS problems, only warns.
  validateExportContent() {
    const result = { isEmpty: false, warnings: [] };

    if (this.canvas.children.length === 0 && this.canvas.textContent.trim() === '') {
      result.isEmpty = true;
      return result;
    }

    const js = this.editor.customJS || '';

    // 1. IDs referenced in JS (Linker or manual code) that no longer exist in the canvas
    const referencedIds = new Set();
    const idRegex = /document\.getElementById\(\s*['"]([^'"]+)['"]\s*\)|document\.querySelector\(\s*['"]#([A-Za-z][\w-]*)['"]\s*\)/g;
    let match;
    while ((match = idRegex.exec(js)) !== null) {
      referencedIds.add(match[1] || match[2]);
    }
    const missingIds = [];
    referencedIds.forEach(id => {
      let found;
      try {
        found = this.canvas.querySelector(`#${CSS.escape(id)}`);
      } catch {
        found = null;
      }
      if (!found) missingIds.push('#' + id);
    });
    if (missingIds.length > 0) {
      result.warnings.push(`تنبيه: كود JS يستهدف عناصر غير موجودة في الصفحة: ${missingIds.join('، ')}`);
    }

    // 2. Obvious syntax errors in custom JS (warn only, export continues)
    try {
      new Function(js);
    } catch (err) {
      result.warnings.push(`تحذير: كود JavaScript يحتوي خطأ (${err.message})`);
    }

    return result;
  }

  // Builds a standalone document for Final Preview and compatibility checks.
  /* يجمع روابط الخطوط وFontAwesome المطلوبة فعلاً ويحقنها في <head> عند التصدير */
  buildExportFontLinks(css, html) {
    const links = [];
    const catalog = window.OSOOS_FONT_CATALOG || [];
    const usedFonts = catalog.filter(font => font.gf && (css || '').indexOf(font.family) !== -1);
    if (usedFonts.length) {
      links.push(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${usedFonts.map(font => `family=${font.gf}`).join('&')}&display=swap">`);
    }
    const markers = ((this.editor && this.editor.customCSS) || '').match(/\/\* OSOOS_FONT_LINK: (.*?) \*\//g) || [];
    markers.forEach(marker => {
      const url = marker.replace('/* OSOOS_FONT_LINK:', '').replace('*/', '').split('|')[0].trim();
      if (url && links.every(existing => existing.indexOf(url) === -1)) links.push(`<link rel="stylesheet" href="${url}">`);
    });
    if ((html || '').indexOf('fa-') !== -1) {
      links.push('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">');
    }
    return links.length ? `\n  ${links.join('\n  ')}` : '';
  }

  escapeHtmlAttribute(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* CSS المستخدم قد يحتوي </style> فيهرب من الوسم ويشغّل سكربتاً — نعطّل الهروب */
  sanitizeCssForInlineStyle(css) {
    return String(css || '')
      .replace(/<\/style/gi, '<\\/style')
      .replace(/<!--/g, '<\\!--');
  }

  buildExportDocument() {
    if (this.projectManager && typeof this.projectManager.buildActivePreviewDocument === 'function') {
      return this.projectManager.buildActivePreviewDocument();
    }
    const cleanHtml = this.editor.getExportCleanHTML();
    const css = this.sanitizeCssForInlineStyle(this.styleEngine
      ? this.styleEngine.getExportCSS(this.editor.customCSS || '')
      : (this.editor.customCSS || ''));
    // Prevent a stray </script> inside user JS from breaking the document
    const exportJS = typeof this.editor.getExportJavaScript === 'function'
      ? this.editor.getExportJavaScript()
      : (this.editor.customJS || '');
    const js = exportJS
      // Component metadata is builder-only; the standalone runtime needs the
      // generated IIFE but never reads this encoded editor payload.
      .replace(/^\s*\/\/ OSOOS_COMPONENT_DATA:.*(?:\r?\n|$)/gm, '')
      .replace(/<\/script/gi, '<\\/script');

    const page = this.getPageSettings();
    const pageDir = this.escapeHtmlAttribute(page.dir);
    const pageLang = this.escapeHtmlAttribute(page.lang);
    const pageTitle = this.escapeHtmlAttribute(page.title);
    const pageDesc = page.description ? `\n  <meta name="description" content="${this.escapeHtmlAttribute(page.description)}">` : '';

    return `<!DOCTYPE html>
<html lang="${pageLang}" dir="${pageDir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">${pageDesc}
  <title>${pageTitle}</title>${this.buildExportFontLinks(css, cleanHtml)}
  <style>
    /* Reset & base styling */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; }

    ${css}
  </style>
</head>
<body>

  ${cleanHtml}

  <script>
    ${js}
  </script>
</body>
</html>`;
  }

  // Export mode keeps presentation in a real CSS file. Final Preview still
  // uses buildExportDocument() so it can run safely inside srcdoc.
  buildExportAssets() {
    const cleanHtml = this.editor.getExportCleanHTML();
    const projectCss = this.styleEngine
      ? this.styleEngine.getExportCSS(this.editor.customCSS || '')
      : (this.editor.customCSS || '');
    const css = `/* Osoos project stylesheet */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; }

${projectCss}`;
    const exportJS = typeof this.editor.getExportJavaScript === 'function'
      ? this.editor.getExportJavaScript()
      : (this.editor.customJS || '');
    const js = exportJS
      .replace(/^\s*\/\/ OSOOS_COMPONENT_DATA:.*(?:\r?\n|$)/gm, '')
      .replace(/<\/script/gi, '<\\/script');
    const page = this.getPageSettings();
    const pageDir = this.escapeHtmlAttribute(page.dir);
    const pageLang = this.escapeHtmlAttribute(page.lang);
    const pageTitle = this.escapeHtmlAttribute(page.title);
    const pageDesc = page.description ? `\n  <meta name="description" content="${this.escapeHtmlAttribute(page.description)}">` : '';
    const html = `<!DOCTYPE html>
<html lang="${pageLang}" dir="${pageDir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">${pageDesc}
  <title>${pageTitle}</title>${this.buildExportFontLinks(projectCss, cleanHtml)}
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  ${cleanHtml}

  <script src="script.js"></script>
</body>
</html>`;
    return { html, css, js };
  }

  // Shows toasts one after another (showToastNotice displays a single toast at a time)
  showToastSequence(messages, duration = 3200) {
    messages.forEach((msg, i) => {
      setTimeout(() => this.showToastNotice(msg, duration - 400), i * duration);
    });
  }

  // Export clean HTML + an external stylesheet.
  // Pure download: does not touch the project, so no history state is recorded.
  exportProjectCode() {
    if (this.projectManager && typeof this.projectManager.exportProject === 'function') {
      this.projectManager.exportProject();
      return;
    }
    const validation = this.validateExportContent();
    if (validation.isEmpty) {
      this.showToastNotice('الصفحة فارغة — أضف عناصر إلى المعاينة قبل التصدير');
      return;
    }

    const assets = this.buildExportAssets();

    // Check if JSZip is loaded (online state)
    if (JSZip) {
      const zip = new JSZip();
      const folder = zip.folder('project');
      folder.file('index.html', assets.html);
      folder.file('styles.css', assets.css);
      folder.file('script.js', assets.js);

      zip.generateAsync({ type: 'blob' }).then((content) => {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'project.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToastSequence(['تم تصدير المشروع كملف ZIP يحتوي على 3 ملفات بنجاح', ...validation.warnings]);
      }).catch((err) => {
        console.error('Error generating zip:', err);
        this.downloadIndividualFiles(assets, validation);
      });
    } else {
      // Offline fallback: download individual files
      this.downloadIndividualFiles(assets, validation);
    }
  }

  downloadIndividualFiles(assets, validation) {
    const download = (content, type, filename) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    download(assets.js, 'application/javascript;charset=utf-8;', 'script.js');
    download(assets.css, 'text/css;charset=utf-8;', 'styles.css');
    download(assets.html, 'text/html;charset=utf-8;', 'index.html');

    this.showToastSequence(['تم تصدير الملفات الثلاثة بنجاح (تحميل فردي بسبب عدم الاتصال بمكتبة الضغط)', ...validation.warnings]);
  }

  // Final Preview: renders the exact exported document inside a fullscreen iframe
  openFinalPreview() {
    const validation = this.validateExportContent();
    if (validation.isEmpty) {
      this.showToastNotice('الصفحة فارغة — أضف عناصر إلى المعاينة قبل المعاينة النهائية');
      return;
    }
    if (validation.warnings.length > 0) {
      this.showToastSequence(validation.warnings);
    }

    const existing = document.getElementById('final-preview-overlay');
    if (existing) {
      if (typeof existing._osoosCleanup === 'function') existing._osoosCleanup();
      else existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'final-preview-overlay';
    overlay.className = 'final-preview-overlay';
    overlay.innerHTML = `
      <div class="final-preview-topbar">
        <span class="final-preview-title">
          <i class="fas fa-globe"></i>
          معاينة نهائية — النسخة النظيفة كما ستظهر بعد التصدير
        </span>
        <div class="final-preview-actions">
          <button type="button" class="btn btn-secondary" id="final-preview-export-btn">
            <i class="fas fa-download"></i> تصدير
          </button>
          <button type="button" class="btn btn-primary" id="final-preview-close-btn">
            <i class="fas fa-times"></i> إغلاق
          </button>
        </div>
      </div>
      <iframe class="final-preview-frame" id="final-preview-frame" title="معاينة نهائية"></iframe>
    `;
    document.body.appendChild(overlay);

    const frame = overlay.querySelector('#final-preview-frame');
    /* عزل المعاينة عن أصل البيلدر: كود المستخدم لا يصل إلى localStorage أو نافذة الأب */
    frame.setAttribute('sandbox', 'allow-scripts allow-modals allow-forms allow-popups');
    const previewAssets = this.projectManager &&
      typeof this.projectManager.buildActivePreviewAssets === 'function'
      ? this.projectManager.buildActivePreviewAssets()
      : this.buildExportAssets();
    const objectUrls = [];
    let previewDocument = previewAssets.html;
    const previewToken = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const previewBridge = `<script data-osoos-preview-bridge>
      window.addEventListener('message', (event) => {
        if (event.source !== parent || event.data?.type !== 'osoos:preview-code' || event.data?.token !== '${previewToken}') return;
        try { Function(event.data.code)(); }
        catch (error) { console.error('تعذر تشغيل JavaScript داخل المعاينة.', error); }
      }, { once: true });
    </script>`;
    if (previewAssets.css && previewDocument.includes('styles.css')) {
      const cssUrl = URL.createObjectURL(new Blob([previewAssets.css], { type: 'text/css;charset=utf-8' }));
      objectUrls.push(cssUrl);
      previewDocument = previewDocument.replace('href="styles.css"', `href="${cssUrl}"`);
    }
    if (previewAssets.js && previewDocument.includes('__OSOOS_PREVIEW_SCRIPT__')) {
      previewDocument = previewDocument.replace(
        /<script\s+data-osoos-page-script\s+src="__OSOOS_PREVIEW_SCRIPT__"><\/script>/,
        previewBridge
      );
    } else if (previewAssets.js && previewDocument.includes('src="script.js"')) {
      previewDocument = previewDocument.replace(
        /<script\s+src="script\.js"><\/script>/,
        previewBridge
      );
    }
    frame.srcdoc = previewDocument;
    frame.addEventListener('load', () => {
      frame.contentWindow?.postMessage({
        type: 'osoos:preview-code',
        token: previewToken,
        code: previewAssets.js || ''
      }, '*');
    }, { once: true });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closePreview();
      }
    };
    const closePreview = () => {
      document.removeEventListener('keydown', onKeyDown, true);
      objectUrls.forEach(url => URL.revokeObjectURL(url));
      overlay.remove();
    };
    overlay._osoosCleanup = closePreview;

    overlay.querySelector('#final-preview-close-btn').addEventListener('click', closePreview);
    overlay.querySelector('#final-preview-export-btn').addEventListener('click', () => {
      this.exportProjectCode();
    });
    // Capture phase so the editor's global Escape handler is not triggered
    document.addEventListener('keydown', onKeyDown, true);
  }

  // Sidebar Tab Switcher between CSS Properties and JS Logic Blocks
  setupTabSwitcher() {
    const btnCss = document.getElementById('tab-btn-css');
    const btnJs = document.getElementById('tab-btn-js');
    const btnDemo = document.getElementById('tab-btn-demo');
    const btnCode = document.getElementById('tab-btn-code');
    const btnSettings = document.getElementById('tab-btn-settings');
    const btnHistory = document.getElementById('tab-btn-history');
    
    const cssContainer = document.getElementById('css-properties-container');
    const jsContainer = document.getElementById('js-logic-blocks-container-sidebar');
    const demoContainer = document.getElementById('interaction-demo-panel');
    const settingsContainer = document.getElementById('settings-panel-container');
    const historyContainer = document.getElementById('history-panel-container');
    
    const panelTitle = document.getElementById('left-panel-title');
    const panelCount = document.getElementById('left-panel-count');

    const hideAllContainers = () => {
      if (cssContainer) cssContainer.style.display = 'none';
      if (jsContainer) jsContainer.style.display = 'none';
      if (demoContainer) demoContainer.style.display = 'none';
      if (settingsContainer) settingsContainer.style.display = 'none';
      if (historyContainer) historyContainer.style.display = 'none';
      if (this.interactionDemo) {
        this.interactionDemo.close({ restoreFocus: false });
      }
    };

    if (btnCss) {
      btnCss.addEventListener('click', () => {
        if (this.workspaceMode === 'designer' && btnCss.classList.contains('active')) {
          this.collapseLeft(!this.leftCollapsed);
          return;
        }
        this.collapseLeft(false);
        document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
        btnCss.classList.add('active');
        hideAllContainers();
        if (cssContainer) cssContainer.style.display = 'flex';
        if (panelTitle) panelTitle.textContent = 'التنسيق – كل خصائص CSS';
        if (panelCount) panelCount.style.display = 'inline';
        this.setWorkspaceMode('designer');
      });
    }

    if (btnJs) {
      btnJs.addEventListener('click', () => {
        if (this.workspaceMode === 'designer' && btnJs.classList.contains('active')) {
          this.collapseLeft(!this.leftCollapsed);
          return;
        }
        this.collapseLeft(false);
        document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
        btnJs.classList.add('active');
        hideAllContainers();
        if (jsContainer) jsContainer.style.display = 'flex';
        if (panelTitle) panelTitle.textContent = 'التفاعلات وJS';
        if (panelCount) panelCount.style.display = 'none';
        this.editor.updateInteractiveLinker();
        this.setWorkspaceMode('designer');
      });
    }

    if (btnDemo) {
      btnDemo.addEventListener('click', () => {
        if (this.workspaceMode === 'designer' && btnDemo.classList.contains('active')) {
          this.collapseLeft(false);
          if (this.interactionDemo) this.interactionDemo.open(btnDemo, 'flow');
          return;
        }
        this.collapseLeft(false);
        document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
        btnDemo.classList.add('active');
        hideAllContainers();
        if (demoContainer) demoContainer.style.display = 'flex';
        if (panelTitle) panelTitle.textContent = 'Demo — 2a و2b';
        if (panelCount) panelCount.style.display = 'none';
        this.setWorkspaceMode('designer');
        if (this.interactionDemo) this.interactionDemo.open(btnDemo, 'flow');
      });
    }

    if (btnCode) {
      btnCode.addEventListener('click', () => {
        if (btnCode.classList.contains('active') && this.workspaceMode === 'code') {
          // If clicked active Code tab, switch back to designer mode
          if (btnCss) btnCss.click();
          return;
        }
        
        // Save current collapse states before entering code mode
        this.designerLeftCollapsedState = this.leftCollapsed;
        this.designerRightCollapsedState = this.rightCollapsed;

        document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
        btnCode.classList.add('active');
        hideAllContainers();

        // Collapse both sidebars for maximum screen space in code editor
        this.collapseLeft(true);
        this.collapseRight(true);

        this.setWorkspaceMode('code');
      });
    }

    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        if (this.workspaceMode === 'designer' && btnSettings.classList.contains('active')) {
          this.collapseLeft(!this.leftCollapsed);
          return;
        }
        this.collapseLeft(false);
        document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
        btnSettings.classList.add('active');
        hideAllContainers();
        if (settingsContainer) settingsContainer.style.display = 'flex';
        if (panelTitle) panelTitle.textContent = 'الإعدادات العامة';
        if (panelCount) panelCount.style.display = 'none';
        this.setWorkspaceMode('designer');
      });
    }

    if (btnHistory) {
      btnHistory.addEventListener('click', () => {
        if (this.workspaceMode === 'designer' && btnHistory.classList.contains('active')) {
          this.collapseLeft(!this.leftCollapsed);
          return;
        }
        this.collapseLeft(false);
        document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
        btnHistory.classList.add('active');
        hideAllContainers();
        if (historyContainer) historyContainer.style.display = 'flex';
        if (panelTitle) panelTitle.textContent = 'تاريخ التغييرات';
        if (panelCount) panelCount.style.display = 'none';
        this.setWorkspaceMode('designer');
      });
    }
  }

  // Set workspace mode (designer with canvas, or fullscreen code editor)
  setWorkspaceMode(mode) {
    this.workspaceMode = mode;
    const centerWS = document.querySelector('.center-workspace');
    if (!centerWS) return;
    
    if (mode === 'code') {
      centerWS.classList.remove('mode-designer');
      centerWS.classList.add('mode-code');
      if (this.editor) {
        this.editor.refreshEditorContent();
      }
      if (this.domTree) {
        this.domTree.render();
      }
    } else {
      centerWS.classList.remove('mode-code');
      centerWS.classList.add('mode-designer');
      
      // Restore sidebars collapsed states
      if (this.designerLeftCollapsedState !== undefined) {
        this.collapseLeft(this.designerLeftCollapsedState);
      }
      if (this.designerRightCollapsedState !== undefined) {
        this.collapseRight(this.designerRightCollapsedState);
      }
      if (this.domTree) {
        this.domTree.render();
      }
    }
    setTimeout(() => this.updateHighlighter(), 200);
  }

  // Setup panel resizing (drag) and folding (collapse/expand)
  setupResizableAndCollapsiblePanels() {
    const workspace = document.querySelector('.app-workspace');
    const leftPanel = document.querySelector('.side-panel.panel-left');
    const rightPanel = document.querySelector('.side-panel.panel-right');
    const leftHandle = document.getElementById('left-resize-handle');
    const rightHandle = document.getElementById('right-resize-handle');
    
    const btnCollapseLeft = document.getElementById('collapse-left-btn');
    const btnCollapseRight = document.getElementById('collapse-right-btn');
    const btnExpandRight = document.getElementById('expand-right-btn');

    if (!workspace || !leftPanel || !rightPanel) return;

    // Track width configurations
    this.leftPanelWidth = 280;
    this.rightPanelWidth = 280;
    this.leftCollapsed = false;
    this.rightCollapsed = false;

    // Drag-to-resize Left Sidebar
    if (leftHandle) {
      leftHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        leftHandle.classList.add('active');
        
        const onMouseMove = (moveEvent) => {
          // Absolute X position minus thin sidebar width (48px)
          let newWidth = moveEvent.clientX - 48;
          if (newWidth < 180) newWidth = 180;
          if (newWidth > 600) newWidth = 600;
          
          this.leftPanelWidth = newWidth;
          workspace.style.setProperty('--left-panel-width', `${newWidth}px`);
          this.updateHighlighter();
        };
        
        const onMouseUp = () => {
          leftHandle.classList.remove('active');
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }

    // Drag-to-resize Right Sidebar
    if (rightHandle) {
      rightHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        rightHandle.classList.add('active');
        
        const onMouseMove = (moveEvent) => {
          let newWidth = window.innerWidth - moveEvent.clientX;
          if (newWidth < 180) newWidth = 180;
          if (newWidth > 600) newWidth = 600;
          
          this.rightPanelWidth = newWidth;
          workspace.style.setProperty('--right-panel-width', `${newWidth}px`);
          this.updateHighlighter();
        };
        
        const onMouseUp = () => {
          rightHandle.classList.remove('active');
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }

    // Collapse Left Sidebar function
    const collapseLeft = (collapse = true) => {
      this.leftCollapsed = collapse;
      workspace.dataset.leftCollapsed = String(collapse);
      
      const collapseIcon = btnCollapseLeft ? btnCollapseLeft.querySelector('i') : null;
      if (collapse) {
        leftPanel.classList.add('collapsed');
        workspace.style.setProperty('--left-panel-width', '0px');
        if (collapseIcon) collapseIcon.className = 'fas fa-chevron-left';
      } else {
        leftPanel.classList.remove('collapsed');
        workspace.style.setProperty('--left-panel-width', `${this.leftPanelWidth}px`);
        if (collapseIcon) collapseIcon.className = 'fas fa-chevron-right';
      }
      setTimeout(() => this.updateHighlighter(), 200);
    };

    if (btnCollapseLeft) {
      btnCollapseLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseLeft(!this.leftCollapsed);
      });
    }

    // Collapse Right Sidebar function
    const collapseRight = (collapse = true) => {
      this.rightCollapsed = collapse;
      workspace.dataset.rightCollapsed = String(collapse);
      
      if (collapse) {
        rightPanel.classList.add('collapsed');
        workspace.style.setProperty('--right-panel-width', '0px');
        if (btnExpandRight) btnExpandRight.style.display = 'flex';
      } else {
        rightPanel.classList.remove('collapsed');
        workspace.style.setProperty('--right-panel-width', `${this.rightPanelWidth}px`);
        if (btnExpandRight) btnExpandRight.style.display = 'none';
      }
      setTimeout(() => this.updateHighlighter(), 200);
    };

    if (btnCollapseRight) {
      btnCollapseRight.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseRight(true);
      });
    }

    if (btnExpandRight) {
      btnExpandRight.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseRight(false);
      });
    }

    // Expose folding methods on instance
    this.collapseLeft = collapseLeft;
    this.collapseRight = collapseRight;
  }

  setupSpacingHandles() {
    const tooltip = document.getElementById('spacing-drag-tooltip');
    
    // We target handles dynamically inside highlighter since they are already in the DOM
    const handles = this.highlighter.querySelectorAll('.spacing-handle');
    
    handles.forEach(handle => {
      // 1. Mouse down drag handler
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const el = this.selectedElement;
        if (!el) return;
        
        this.history.saveState('Start Spacing Drag');
        
        const prop = handle.dataset.prop; // e.g. marginTop, paddingLeft
        const styleProp = prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()); // margin-top, padding-left
        
        const startY = e.clientY;
        const startX = e.clientX;
        
        const computedStyle = window.getComputedStyle(el);
        const startVal = parseInt(computedStyle[prop]) || 0;
        const touchedStyleProps = new Set();
        
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.textContent = `${styleProp}: ${startVal}px`;
          tooltip.style.top = `${e.clientY + 15}px`;
          tooltip.style.left = `${e.clientX + 15}px`;
        }
        
        const onMouseMove = (moveEv) => {
          const deltaY = moveEv.clientY - startY;
          const deltaX = moveEv.clientX - startX;
          
          let diff = 0;
          if (prop === 'marginTop') diff = -deltaY;
          else if (prop === 'marginBottom') diff = deltaY;
          else if (prop === 'marginLeft') diff = -deltaX;
          else if (prop === 'marginRight') diff = deltaX;
          else if (prop === 'paddingTop') diff = deltaY; // inward padding-top
          else if (prop === 'paddingBottom') diff = -deltaY; // inward padding-bottom
          else if (prop === 'paddingLeft') diff = deltaX; // inward padding-left
          else if (prop === 'paddingRight') diff = -deltaX; // inward padding-right
          
          // Shift key: Slow down/micro adjust by dividing delta by 5
          if (moveEv.shiftKey) {
            diff = Math.round(diff * 0.2);
          }
          
          let newVal = startVal + diff;
          newVal = Math.max(0, newVal); // prevent negative spacing values
          
          const isAlt = moveEv.altKey;
          
          if (isAlt) {
            const isPadding = prop.startsWith('padding');
            const prefix = isPadding ? 'padding' : 'margin';
            const sides = ['Top', 'Right', 'Bottom', 'Left'];
            
            sides.forEach(s => {
              el.style[prefix + s] = `${newVal}px`;
              touchedStyleProps.add(`${prefix}-${s.toLowerCase()}`);
            });
            
            if (tooltip) {
              tooltip.textContent = `${prefix} (جميع الجهات): ${newVal}px`;
            }
          } else {
            el.style[prop] = `${newVal}px`;
            touchedStyleProps.add(styleProp);
            if (tooltip) {
              tooltip.textContent = `${styleProp}: ${newVal}px`;
            }
          }
          
          if (tooltip) {
            tooltip.style.top = `${moveEv.clientY + 15}px`;
            tooltip.style.left = `${moveEv.clientX + 15}px`;
          }
          
          this.properties.updatePanelFor(el);
          this.updateHighlighter();
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          if (tooltip) {
            tooltip.style.display = 'none';
          }

          const declarations = {};
          touchedStyleProps.forEach(property => {
            const value = el.style.getPropertyValue(property).trim();
            if (value) declarations[property] = value;
            el.style.removeProperty(property);
          });
          if (Object.keys(declarations).length) {
            this.styleEngine.setStyles(el, declarations, {
              breakpoint: this.properties.activeBreakpoint,
              pseudo: this.properties.currentPseudoState,
              important: this.properties.getImportantState()
            });
          }
          this.scheduleStyleSync(0);
          this.history.saveState('End Spacing Drag');
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      // 2. Double click inline input handler
      handle.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const el = this.selectedElement;
        if (!el) return;
        
        const prop = handle.dataset.prop;
        const computedStyle = window.getComputedStyle(el);
        const currentVal = computedStyle[prop] || '0px';
        
        // Remove existing input if any
        const existingInput = this.highlighter.querySelector('.spacing-inline-input');
        if (existingInput) existingInput.remove();
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'spacing-inline-input';
        input.value = currentVal;
        
        // Position input centered on the handle
        const handleRect = handle.getBoundingClientRect();
        const highlighterRect = this.highlighter.getBoundingClientRect();
        
        input.style.top = `${handleRect.top - highlighterRect.top + (handleRect.height / 2) - 10}px`;
        input.style.left = `${handleRect.left - highlighterRect.left + (handleRect.width / 2) - 25}px`;
        
        this.highlighter.appendChild(input);
        input.focus();
        input.select();
        
        const saveValue = () => {
          let val = input.value.trim();
          if (val) {
            this.history.saveState('Start Inline Spacing Edit');
            
            if (/^\d+$/.test(val)) val += 'px';
            
            const isAlt = e.altKey;
            if (isAlt) {
              const prefix = prop.startsWith('padding') ? 'padding' : 'margin';
              const sides = ['Top', 'Right', 'Bottom', 'Left'];
              const declarations = {};
              sides.forEach(s => {
                declarations[`${prefix}-${s.toLowerCase()}`] = val;
              });
              this.properties.applyStyles(declarations, { delay: 0 });
            } else {
              const styleProp = prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
              this.properties.applyStyle(styleProp, val, { delay: 0 });
            }

            this.properties.updatePanelFor(el);
            this.updateHighlighter();
            
            this.history.saveState('End Inline Spacing Edit');
          }
          input.remove();
        };
        
        input.addEventListener('keydown', (keyEv) => {
          if (keyEv.key === 'Enter') {
            keyEv.preventDefault();
            saveValue();
          } else if (keyEv.key === 'Escape') {
            keyEv.preventDefault();
            input.remove();
          }
        });
        
        input.addEventListener('blur', () => {
          saveValue();
        });
      });
    });
  }

  enterMoveMode() {
    this.isMoveMode = true;
    const btnMove = document.getElementById('bubble-move');
    if (btnMove) btnMove.classList.add('active');
    
    if (this.highlighter) {
      this.highlighter.classList.add('move-mode-active');
    }
    if (this.selectedElement) {
      this.selectedElement.classList.add('move-mode-active');
    }
    this.showToastNotice('تم تفعيل وضع التحريك الآمن: اسحب العنصر أو إطار التحديد لتحريكه.');
  }

  exitMoveMode() {
    this.isMoveMode = false;
    const btnMove = document.getElementById('bubble-move');
    if (btnMove) btnMove.classList.remove('active');
    
    if (this.highlighter) {
      this.highlighter.classList.remove('move-mode-active');
    }
    if (this.selectedElement) {
      this.selectedElement.classList.remove('move-mode-active');
    }
  }

  updateResetMoveButtonVisibility() {
    const btnResetMove = document.getElementById('bubble-reset-move');
    if (!btnResetMove) return;
    
    const el = this.selectedElement;
    if (!el) {
      btnResetMove.style.display = 'none';
      return;
    }
    
    const moveX = parseFloat(el.getAttribute('data-move-x')) || 0;
    const moveY = parseFloat(el.getAttribute('data-move-y')) || 0;
    const transform = el.style.transform || '';
    
    if (moveX !== 0 || moveY !== 0 || transform.includes('translate(') || transform.includes('translate3d(')) {
      btnResetMove.style.display = 'inline-block';
    } else {
      btnResetMove.style.display = 'none';
    }
  }

  startDragMove(e) {
    const el = this.selectedElement;
    if (!el) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    this.isDraggingMove = true;
    this.history.saveState('Start Drag Move');
    
    const startX = e.clientX;
    const startY = e.clientY;
    const originalManagedTransform = (this.styleEngine && this.styleEngine.getStyleValue(el, 'transform', {
      breakpoint: this.properties.activeBreakpoint,
      pseudo: 'normal'
    })) || '';
    
    // Preserve base transform (rotate, scale, etc.) by saving to attribute if not present
    let baseTransform = el.getAttribute('data-base-transform');
    if (baseTransform === null) {
      // Extract any pre-existing transform on the element, EXCEPT for translate
      let currentTransform = originalManagedTransform || el.style.transform || '';
      // Clean translate portion from the transform string
      let cleaned = currentTransform
        .replace(/translate(3d)?\([^)]+\)/g, '')
        .trim();
      el.setAttribute('data-base-transform', cleaned);
      baseTransform = cleaned;
    }
    
    // Parse current translate value from data attributes
    let startTx = parseFloat(el.getAttribute('data-move-x')) || 0;
    let startTy = parseFloat(el.getAttribute('data-move-y')) || 0;
    
    const originalTx = startTx;
    const originalTy = startTy;
    const originalTransform = el.style.transform || '';
    
    const tooltip = document.getElementById('spacing-drag-tooltip');
    
    if (tooltip) {
      tooltip.style.display = 'block';
      tooltip.innerHTML = `translateX: ${startTx}px<br>translateY: ${startTy}px`;
      tooltip.style.top = `${e.clientY + 15}px`;
      tooltip.style.left = `${e.clientX + 15}px`;
    }
    
    let rafId = null;
    
    const onMouseMove = (moveEv) => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const deltaX = moveEv.clientX - startX;
        const deltaY = moveEv.clientY - startY;
        
        let targetX = startTx + deltaX;
        let targetY = startTy + deltaY;
        
        // Apply grid snapping if enabled and Alt is not held
        if (this.isSnapEnabled && !moveEv.altKey) {
          targetX = Math.round(targetX / this.snapGridSize) * this.snapGridSize;
          targetY = Math.round(targetY / this.snapGridSize) * this.snapGridSize;
        }
        
        el.setAttribute('data-move-x', targetX);
        el.setAttribute('data-move-y', targetY);
        
        // Construct final transform by appending translate to base transform
        let finalTransform = baseTransform;
        if (finalTransform) finalTransform += ' ';
        finalTransform += `translate(${targetX}px, ${targetY}px)`;
        
        el.style.transform = finalTransform;
        
        if (tooltip) {
          tooltip.innerHTML = `translateX: ${targetX}px<br>translateY: ${targetY}px`;
          tooltip.style.top = `${moveEv.clientY + 15}px`;
          tooltip.style.left = `${moveEv.clientX + 15}px`;
        }
        
        this.updateHighlighter();
      });
    };
    
    const onMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
      
      this.isDraggingMove = false;
      
      if (tooltip) {
        tooltip.style.display = 'none';
      }

      const finalTransform = el.style.transform || originalManagedTransform;
      this.styleEngine.setStyle(el, 'transform', finalTransform, {
        breakpoint: this.properties.activeBreakpoint,
        pseudo: 'normal'
      });
      el.style.removeProperty('transform');
      this.updateResetMoveButtonVisibility();
      this.scheduleStyleSync(0);
      this.history.saveState('End Drag Move');
    };
    
    const onKeyDown = (keyEv) => {
      if (keyEv.key === 'Escape') {
        keyEv.preventDefault();
        if (rafId) cancelAnimationFrame(rafId);
        
        // Restore previous transform and data attributes
        el.setAttribute('data-move-x', originalTx);
        el.setAttribute('data-move-y', originalTy);
        el.style.transform = originalTransform;
        
        // If it was empty before, clear data-base-transform and move attributes
        if (originalTx === 0 && originalTy === 0) {
          el.removeAttribute('data-base-transform');
          el.removeAttribute('data-move-x');
          el.removeAttribute('data-move-y');
        }
        
        this.isDraggingMove = false;
        
        if (tooltip) {
          tooltip.style.display = 'none';
        }
        
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('keydown', onKeyDown);
        
        this.exitMoveMode();
        this.updateResetMoveButtonVisibility();
        this.updateHighlighter();
      }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
  }

  showToastNotice(message, duration = 2500) {
    let container = document.getElementById('toast-container');

    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.left = '20px';
      container.style.zIndex = '99999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      document.body.appendChild(container);
    }

    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');

    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'toast-notice';
    toast.textContent = message;
    
    toast.style.background = 'var(--bg-secondary)';
    toast.style.color = 'var(--text-main)';
    toast.style.border = '1px solid var(--border-color)';
    toast.style.borderRadius = '8px';
    toast.style.padding = '10px 14px';
    toast.style.fontSize = '12px';
    toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    toast.style.transform = 'translateY(8px)';
    toast.style.opacity = '0';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '6px';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-info-circle';
    icon.style.color = 'var(--accent-orange)';
    toast.prepend(icon);

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }
}

export { WebBuilderApp };
