export class HistoryState {
  constructor(canvasHTML, customCSS, customJS, interactions, selectedElementId) {
    this.canvasHTML = canvasHTML;
    this.customCSS = customCSS;
    this.customJS = customJS;
    this.interactions = Array.isArray(interactions)
      ? structuredClone(interactions)
      : [];
    this.selectedElementId = selectedElementId;
  }
}

export class HistoryManager {
  constructor(app, options = {}) {
    this.app = app;
    this.document = options.document || document;
    this.maxStates = options.maxStates || 20;
    this.undoStack = [];
    this.redoStack = [];
    this.isRestoring = false;
    this.debounceTimeout = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = Object.freeze({
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length
    });
    this.listeners.forEach(listener => listener(state));
  }

  saveState(_reason = '') {
    if (this.isRestoring) return;

    const canvas = this.document.getElementById('builder-canvas');
    if (!canvas) return;

    if (this.app.styleEngine) this.app.styleEngine.migrateInlineStyles(canvas);
    const canvasHTML =
      typeof this.app.getPersistentCanvasHTML === 'function'
        ? this.app.getPersistentCanvasHTML()
        : canvas.innerHTML;
    const customCSS = this.app.editor.customCSS;
    const customJS = this.app.editor.customJS;
    const interactions = typeof this.app.editor.getInteractionDefinitions === 'function'
      ? this.app.editor.getInteractionDefinitions()
      : (this.app.editor.interactionDefinitions || []);
    const selectedElementId = this.app.selectedElement
      ? this.app.selectedElement.id
      : null;

    const previousState = this.undoStack.at(-1);
    if (
      previousState?.canvasHTML === canvasHTML &&
      previousState.customCSS === customCSS &&
      previousState.customJS === customJS &&
      JSON.stringify(previousState.interactions || []) === JSON.stringify(interactions) &&
      previousState.selectedElementId === selectedElementId
    ) {
      return;
    }

    this.undoStack.push(
      new HistoryState(canvasHTML, customCSS, customJS, interactions, selectedElementId)
    );
    if (this.undoStack.length > this.maxStates) this.undoStack.shift();

    this.redoStack = [];
    this.updateButtons();
  }

  saveStateDebounced(reason = '', delay = 500) {
    if (this.isRestoring) return;
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.saveState(reason);
      this.debounceTimeout = null;
    }, delay);
  }

  flushPendingState(reason = 'Flush Pending State') {
    if (!this.debounceTimeout) return false;
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = null;
    this.saveState(reason);
    return true;
  }

  undo() {
    this.flushPendingState('Forced Debounce Save');
    if (this.undoStack.length <= 1) {
      this.app.showToastNotice?.('لا يوجد شيء للتراجع عنه');
      return;
    }

    this.isRestoring = true;
    this.redoStack.push(this.undoStack.pop());

    try {
      this.restoreState(this.undoStack.at(-1));
    } catch (error) {
      console.error('فشل استرجاع الحالة:', error);
    } finally {
      this.isRestoring = false;
    }

    this.updateButtons();
    this.app.showToastNotice?.('تراجع خطوة للخلف');
  }

  redo() {
    this.flushPendingState('Forced Debounce Save');
    if (!this.redoStack.length) {
      this.app.showToastNotice?.('لا يوجد شيء لإعادته');
      return;
    }

    this.isRestoring = true;
    const targetState = this.redoStack.pop();
    this.undoStack.push(targetState);

    try {
      this.restoreState(targetState);
    } catch (error) {
      console.error('فشل استرجاع الحالة:', error);
    } finally {
      this.isRestoring = false;
    }

    this.updateButtons();
    this.app.showToastNotice?.('إعادة خطوة للأمام');
  }

  restoreState(state) {
    const canvas = this.document.getElementById('builder-canvas');
    if (!canvas || !state) return;

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }

    canvas.innerHTML = state.canvasHTML;
    this.app.editor.customCSS = state.customCSS;
    this.app.editor.customJS = state.customJS;
    if (typeof this.app.editor.setInteractionDefinitions === 'function') {
      this.app.editor.setInteractionDefinitions(state.interactions || []);
    } else {
      this.app.editor.interactionDefinitions = structuredClone(state.interactions || []);
    }
    this.app.editor.refreshEditorContent();
    this.app.applyCustomCSS(state.customCSS);
    this.app.reattachCanvasListeners();

    let selectedElement = null;
    if (state.selectedElementId) {
      const escapedId =
        typeof CSS !== 'undefined' && CSS.escape
          ? CSS.escape(state.selectedElementId)
          : state.selectedElementId;
      try {
        selectedElement = canvas.querySelector(`#${escapedId}`);
      } catch {
        selectedElement = null;
      }
    }

    this.app.selectElement(selectedElement);
    this.app.domTree.render();
    this.app.properties.updatePanelFor(selectedElement);
    if (selectedElement) this.app.updateHighlighter();
    else this.app.highlighter.style.display = 'none';

    if (
      typeof this.app.refreshInteractionUIAfterStructureCleanup === 'function'
    ) {
      this.app.refreshInteractionUIAfterStructureCleanup();
    } else {
      this.app.editor.updateInteractiveLinker();
    }

    this.app.saveProgress();
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  updateButtons() {
    const undoButton = this.document.getElementById('header-undo');
    const redoButton = this.document.getElementById('header-redo');
    if (undoButton) undoButton.disabled = !this.canUndo();
    if (redoButton) redoButton.disabled = !this.canRedo();
    this.notify();
  }

  dispose() {
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.debounceTimeout = null;
    this.listeners.clear();
  }
}

export const historyService = Object.freeze({
  HistoryManager,
  HistoryState
});
