import './compat/interaction-tutorials.umd.js';

export const interactionTutorials = globalThis.OsoosInteractionTutorials;

if (!interactionTutorials) {
  throw new Error('Interaction Tutorials failed to initialize as an ES module');
}

export default interactionTutorials;
