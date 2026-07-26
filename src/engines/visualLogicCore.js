import './compat/visual-logic-core.umd.js';

export const visualLogicCore = globalThis.VisualLogicCore;

if (!visualLogicCore) {
  throw new Error('Visual Logic Core failed to initialize as an ES module');
}

export default visualLogicCore;
