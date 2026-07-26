import { beforeAll, describe, expect, it } from 'vitest';
import visualLogicCore from '../../src/engines/visualLogicCore.js';
import '../../src/features/compat-runtime/interaction-demo.js';

let demo;

beforeAll(() => {
  demo = globalThis.OsoosInteractionDemo;
});

function buttonDescriptor() {
  return demo.normalizeDescriptor({
    key: 'button-key',
    id: 'add-button',
    tag: 'button',
    textPreview: 'إضافة',
    sampleValue: 'إضافة',
    disabled: false,
    visible: true
  });
}

describe('purpose-driven interaction conditions', () => {
  it('uses direct execution by default and does not create a pointless branch', () => {
    const button = buttonDescriptor();
    const state = demo.createInitialState(button, [button]);
    const definition = demo.buildDefinition(state, visualLogicCore);

    expect(state.conditionEnabled).toBe(false);
    expect(definition.reads).toEqual([]);
    expect(definition.actions.some(action => action.type === 'branch')).toBe(false);
    expect(visualLogicCore.validateDefinition(definition).valid).toBe(true);
  });

  it('offers button-state checks instead of text emptiness checks', () => {
    const button = buttonDescriptor();
    const options = demo.operatorOptions(button);

    expect(options.map(option => option.value)).toEqual([
      'enabled',
      'disabled',
      'visible',
      'hidden',
      'hasClass'
    ]);
    expect(options.map(option => option.value)).not.toContain('notEmpty');
  });

  it('builds a valid element-state condition when the user enables a decision', () => {
    const button = buttonDescriptor();
    const state = demo.createInitialState(button, [button]);
    state.conditionEnabled = true;
    state.operator = 'enabled';

    const definition = demo.buildDefinition(state, visualLogicCore);
    const executable = visualLogicCore.generateExecutable(definition);

    expect(definition.reads[0].type).toBe('element');
    expect(definition.actions.some(action => action.type === 'branch')).toBe(true);
    expect(visualLogicCore.validateDefinition(definition).valid).toBe(true);
    expect(executable).toContain('.disabled');
  });
});
