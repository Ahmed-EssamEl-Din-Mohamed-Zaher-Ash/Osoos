import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StaticShell from '../../src/legacy-generated/StaticShell.jsx';
import { BuilderRuntimeProvider } from '../../src/context/BuilderRuntimeContext.jsx';

function renderShell() {
  return render(
    <BuilderRuntimeProvider>
      <StaticShell />
    </BuilderRuntimeProvider>
  );
}

describe('React application shell', () => {
  it('preserves the CSS-sensitive landmarks and identifiers', () => {
    const { container } = renderShell();

    expect(container.querySelector('.app-container')).toBeInTheDocument();
    expect(container.querySelector('header.app-header')).toBeInTheDocument();
    expect(container.querySelector('aside.thin-sidebar')).toBeInTheDocument();
    expect(container.querySelector('section.panel-left')).toBeInTheDocument();
    expect(container.querySelector('main.center-workspace')).toBeInTheDocument();
    expect(container.querySelector('section.panel-right')).toBeInTheDocument();
    expect(container.querySelector('.bottom-panel')).toBeInTheDocument();
    expect(container.querySelector('#builder-canvas')).toBeInTheDocument();
    expect(container.querySelector('#code-textarea')).toBeInTheDocument();
    expect(container.querySelector('#dom-tree-root')).toBeInTheDocument();
    expect(container.querySelector('#input-type-modal')).toBeInTheDocument();
  });

  it('keeps the original RTL and accessibility contracts', () => {
    const { container } = renderShell();
    const canvas = container.querySelector('#builder-canvas');
    const textarea = container.querySelector('#code-textarea');

    expect(canvas).toBeInTheDocument();
    expect(textarea).toHaveAttribute('spellcheck', 'false');
    expect(container.querySelector('#autosave-toggle')).toBeChecked();
    expect(container.querySelector('#header-undo')).toBeDisabled();
    expect(container.querySelector('#header-redo')).toBeDisabled();
  });

  it('contains each legacy ID exactly once', () => {
    const { container } = renderShell();
    const ids = [...container.querySelectorAll('[id]')].map(node => node.id);

    expect(ids.length).toBe(238);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
