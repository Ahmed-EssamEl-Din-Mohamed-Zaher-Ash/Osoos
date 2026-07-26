import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOMTreeManager } from '../../src/features/dom-tree/DOMTreeManager.js';

function createManager() {
  document.body.innerHTML = `
    <div class="tree-host"><ul id="dom-tree-root"></ul></div>
    <div id="builder-canvas">
      <ul id="source-list"><li id="moving-li">Moving</li></ul>
      <ul id="target-list"><li id="existing-li">Existing</li></ul>
    </div>
  `;

  const app = {
    selectedElement: null,
    dragDrop: {},
    selectElement: vi.fn()
  };
  return new DOMTreeManager(app);
}

function createWrapper(top = 0, height = 40) {
  const wrapper = document.createElement('div');
  wrapper.getBoundingClientRect = vi.fn(() => ({
    top,
    bottom: top + height,
    height,
    left: 0,
    right: 300,
    width: 300
  }));
  return wrapper;
}

describe('DOM tree adaptive drop placement', () => {
  let manager;

  beforeEach(() => {
    manager = createManager();
  });

  it('falls back from beside a ul to inside it for a restricted li', () => {
    const moving = document.getElementById('moving-li');
    const targetList = document.getElementById('target-list');
    const wrapper = createWrapper();

    expect(manager.getDropPosition(wrapper, targetList, 2)).toBe('before');

    const placement = manager.resolveDropPlacement(
      wrapper,
      targetList,
      2,
      position => manager.isDropAllowed(moving, targetList, position, false)
    );

    expect(placement).toEqual({ position: 'inside', allowed: true });
    expect(manager.moveElement(moving, targetList, placement.position)).toEqual({
      allowed: true,
      changed: true
    });
    expect(moving.parentElement).toBe(targetList);
  });

  it('falls back from inside a sibling li to the nearest valid list position', () => {
    const moving = document.getElementById('moving-li');
    const targetList = document.getElementById('target-list');
    const existing = document.getElementById('existing-li');
    const wrapper = createWrapper();
    targetList.appendChild(moving);

    expect(manager.getDropPosition(wrapper, existing, 18)).toBe('inside');

    const placement = manager.resolveDropPlacement(
      wrapper,
      existing,
      18,
      position => manager.isDropAllowed(moving, existing, position, false)
    );

    expect(placement).toEqual({ position: 'before', allowed: true });
    expect(manager.moveElement(moving, existing, placement.position).changed).toBe(
      true
    );
    expect([...targetList.children].map(node => node.id)).toEqual([
      'moving-li',
      'existing-li'
    ]);
  });

  it('keeps an invalid descendant drop rejected when no fallback is valid', () => {
    const sourceList = document.getElementById('source-list');
    const moving = document.getElementById('moving-li');
    const wrapper = createWrapper();

    const placement = manager.resolveDropPlacement(
      wrapper,
      moving,
      20,
      position => manager.isDropAllowed(sourceList, moving, position, false)
    );

    expect(placement.allowed).toBe(false);
  });
});
