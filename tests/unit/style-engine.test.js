import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OsoosStyleEngine } from '../../src/services/styles/OsoosStyleEngine.js';

function createEngine() {
  const storedValues = new Map();
  vi.stubGlobal('localStorage', {
    clear: () => storedValues.clear(),
    getItem: key => (storedValues.has(key) ? storedValues.get(key) : null),
    removeItem: key => storedValues.delete(key),
    setItem: (key, value) => storedValues.set(key, String(value))
  });
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <div id="builder-canvas">
      <article id="card"><p id="copy">نص</p></article>
    </div>
    <textarea id="code-textarea"></textarea>
  `;
  const app = {
    canvas: document.getElementById('builder-canvas'),
    editor: {
      currentLanguage: 'css',
      customCSS: '',
      textarea: document.getElementById('code-textarea'),
      updateLineNumbers: vi.fn(),
      updateInteractiveLinker: vi.fn()
    },
    saveProgress: vi.fn()
  };
  const engine = new OsoosStyleEngine(app);
  app.styleEngine = engine;
  engine.init();
  return { app, engine };
}

describe('OsoosStyleEngine module', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('stores visual styles as generated CSS instead of inline declarations', () => {
    const { engine } = createEngine();
    const card = document.getElementById('card');

    expect(
      engine.setStyle(card, 'backgroundColor', 'rgb(1, 2, 3)', {
        commit: false
      })
    ).toBe(true);

    expect(card).not.toHaveAttribute('style');
    expect(engine.renderGeneratedCSS()).toContain(
      'background-color: rgb(1, 2, 3);'
    );
    expect(engine.renderGeneratedCSS()).toContain('#card');
  });

  it('keeps unmanaged CSS byte content outside the managed block', () => {
    const { engine } = createEngine();
    const card = document.getElementById('card');
    engine.setStyle(card, 'padding', '24px', { commit: false });

    const composed = engine.composeCSS('body { margin: 0; }\n.manual { color: red; }');

    expect(composed).toContain('body { margin: 0; }');
    expect(composed).toContain('.manual { color: red; }');
    expect(composed).toContain('/* OSOOS-GENERATED-STYLES:START */');
    expect(composed).toContain('padding: 24px;');
    expect(engine.stripManagedBlock(composed)).toContain('.manual');
    expect(engine.stripManagedBlock(composed)).not.toContain('padding: 24px');
  });

  it('scopes preview selectors under the builder canvas', () => {
    const { engine } = createEngine();
    const card = document.getElementById('card');
    engine.setStyle(card, 'color', 'red', { commit: false });

    expect(engine.renderPreviewCSS()).toContain('#builder-canvas #card');
  });

  it('migrates author inline styles without changing the canvas root style', () => {
    const { engine } = createEngine();
    const canvas = document.getElementById('builder-canvas');
    const card = document.getElementById('card');
    canvas.style.width = '375px';
    card.style.padding = '12px';
    card.style.borderRadius = '8px';

    expect(engine.migrateInlineStyles(canvas, { commit: false })).toBe(true);

    expect(canvas.style.width).toBe('375px');
    expect(card).not.toHaveAttribute('style');
    expect(engine.renderGeneratedCSS()).toContain('padding: 12px');
    expect(engine.renderGeneratedCSS()).toContain('border-radius: 8px');
  });
});
