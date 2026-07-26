import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HistoryManager,
  HistoryState
} from '../../src/services/history/HistoryManager.js';

function createApp() {
  document.body.innerHTML = `
    <button id="header-undo"></button>
    <button id="header-redo"></button>
    <div id="element-highlighter"></div>
    <div id="builder-canvas"><p id="first">الأولى</p></div>
  `;

  const app = {
    selectedElement: null,
    editor: {
      customCSS: '',
      customJS: '',
      refreshEditorContent: vi.fn(),
      updateInteractiveLinker: vi.fn()
    },
    styleEngine: {
      migrateInlineStyles: vi.fn()
    },
    domTree: { render: vi.fn() },
    properties: { updatePanelFor: vi.fn() },
    highlighter: document.getElementById('element-highlighter'),
    getPersistentCanvasHTML: () =>
      document.getElementById('builder-canvas').innerHTML,
    applyCustomCSS: vi.fn(),
    reattachCanvasListeners: vi.fn(),
    selectElement: vi.fn(element => {
      app.selectedElement = element;
    }),
    updateHighlighter: vi.fn(),
    saveProgress: vi.fn(),
    showToastNotice: vi.fn()
  };

  return app;
}

describe('HistoryManager React service', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('deduplicates snapshots and keeps the original 20-state cap', () => {
    const app = createApp();
    const history = new HistoryManager(app);
    const canvas = document.getElementById('builder-canvas');

    history.saveState('initial');
    history.saveState('duplicate');
    expect(history.undoStack).toHaveLength(1);

    for (let index = 0; index < 25; index += 1) {
      canvas.innerHTML = `<p>${index}</p>`;
      history.saveState(`state-${index}`);
    }

    expect(history.undoStack).toHaveLength(20);
    expect(history.undoStack.at(-1).canvasHTML).toBe('<p>24</p>');
  });

  it('restores HTML, CSS, JS, selection and redo state', () => {
    const app = createApp();
    const history = new HistoryManager(app);
    const canvas = document.getElementById('builder-canvas');

    history.saveState('first');
    canvas.innerHTML = '<p id="second">الثانية</p>';
    app.editor.customCSS = '.second{}';
    app.editor.customJS = 'second()';
    app.selectedElement = canvas.querySelector('#second');
    history.saveState('second');

    history.undo();

    expect(canvas.innerHTML).toBe('<p id="first">الأولى</p>');
    expect(app.editor.customCSS).toBe('');
    expect(app.editor.customJS).toBe('');
    expect(history.canRedo()).toBe(true);
    expect(history.isRestoring).toBe(false);

    history.redo();

    expect(canvas.innerHTML).toBe('<p id="second">الثانية</p>');
    expect(app.editor.customCSS).toBe('.second{}');
    expect(app.editor.customJS).toBe('second()');
    expect(app.selectedElement?.id).toBe('second');
  });

  it('always releases the restoring lock after a failed restore', () => {
    const app = createApp();
    const history = new HistoryManager(app);
    history.undoStack = [
      new HistoryState('<p>one</p>', '', '', null),
      new HistoryState('<p>two</p>', '', '', null)
    ];
    vi.spyOn(history, 'restoreState').mockImplementation(() => {
      throw new Error('restore failed');
    });

    history.undo();

    expect(history.isRestoring).toBe(false);
    expect(history.canRedo()).toBe(true);
  });

  it('publishes button state for React subscribers', () => {
    const app = createApp();
    const history = new HistoryManager(app);
    const updates = [];
    history.subscribe(state => updates.push(state));

    history.updateButtons();

    expect(updates.at(-1)).toEqual({
      canUndo: false,
      canRedo: false,
      undoCount: 0,
      redoCount: 0
    });
    expect(document.getElementById('header-undo')).toBeDisabled();
    expect(document.getElementById('header-redo')).toBeDisabled();
  });
});
