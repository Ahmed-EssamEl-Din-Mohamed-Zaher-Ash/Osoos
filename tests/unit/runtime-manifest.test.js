import { describe, expect, it } from 'vitest';
import { LEGACY_RUNTIME_FILES } from '../../src/legacy-runtime/manifest.js';

describe('legacy runtime manifest', () => {
  it('preserves the authoritative Vanilla script order', () => {
    expect(LEGACY_RUNTIME_FILES).toEqual([
      'visual-logic-phase-a.js',
      'interaction-hub.js',
      'interaction-demo.js',
      'beginner-mode.js',
      'responsive-shell.js',
      'selection-toolbar-responsive.js',
      'dom-tree-clarity.js',
      'onboarding-tour.js'
    ]);
  });

  it('does not contain duplicate scripts', () => {
    expect(new Set(LEGACY_RUNTIME_FILES).size).toBe(LEGACY_RUNTIME_FILES.length);
  });
});
