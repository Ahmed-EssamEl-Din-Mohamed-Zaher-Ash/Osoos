import './visualLogicCore.js';
import './compat/interaction-hub-core.umd.js';

export const interactionHubCore = globalThis.OsoosInteractionHubCore;

if (!interactionHubCore) {
  throw new Error('Interaction Hub Core failed to initialize as an ES module');
}

export default interactionHubCore;
