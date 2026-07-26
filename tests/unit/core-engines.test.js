import { describe, expect, it } from 'vitest';
import visualLogicCore from '../../src/engines/visualLogicCore.js';
import interactionHubCore from '../../src/engines/interactionHubCore.js';

describe('bundled core engines', () => {
  it('loads Visual Logic Core through the Vite module graph', () => {
    expect(visualLogicCore.SCHEMA_VERSION).toBe(10);
    expect(typeof visualLogicCore.normalizeDefinition).toBe('function');
    expect(typeof visualLogicCore.generateExecutable).toBe('function');
    expect(typeof visualLogicCore.validateDefinition).toBe('function');
    expect(globalThis.VisualLogicCore).toBe(visualLogicCore);
  });

  it('loads Interaction Hub Core against the same Visual Logic instance', () => {
    expect(interactionHubCore.STARTER_CATALOG).toHaveLength(10);
    expect(typeof interactionHubCore.searchCatalog).toBe('function');
    expect(typeof interactionHubCore.buildStarterDraft).toBe('function');
    expect(globalThis.OsoosInteractionHubCore).toBe(interactionHubCore);
  });

  it('generates a schema-10 starter definition that the bundled core accepts', () => {
    const draft = interactionHubCore.buildStarterDraft(
      'counter',
      {
        sourceId: 'counter-button',
        displayId: 'counter-value'
      },
      visualLogicCore
    );

    expect(draft.schemaVersion).toBe(10);
    expect(visualLogicCore.validateDefinition(draft).valid).toBe(true);
    expect(visualLogicCore.generateExecutable(draft)).toContain(
      'addEventListener'
    );
  });

  it('generates readable modern interaction code without editor metadata or a global cleanup registry', () => {
    const draft = interactionHubCore.buildStarterDraft(
      'counter',
      {
        sourceId: 'add-button',
        displayId: 'counter-value'
      },
      visualLogicCore
    );

    const executable = visualLogicCore.generateExecutable(draft);
    const block = visualLogicCore.generateBlock(draft);
    const parsed = visualLogicCore.parseVisualLinks(block, [draft]);

    expect(executable.trimStart()).toMatch(/^\{/);
    expect(executable).toContain('addEventListener');
    expect(executable).not.toContain('(function');
    expect(executable).not.toContain('AbortController');
    expect(executable).not.toContain('__osoos_links');

    expect(block).toContain('// @osoos-interaction');
    expect(block).not.toContain('OSOOS_LOGIC_DATA');
    expect(block).not.toContain('SOURCE_ID:');
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      id: draft.id,
      startIndex: 0
    });
  });
});
