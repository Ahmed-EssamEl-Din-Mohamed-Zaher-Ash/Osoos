import { describe, expect, it } from 'vitest';
import interactionTutorials from '../../src/engines/interactionTutorials.js';

describe('bundled interaction tutorials', () => {
  it('loads the complete validated Arabic catalog', () => {
    const tutorials = interactionTutorials.listTutorials();
    const validation = interactionTutorials.validateTutorials();

    expect(tutorials.length).toBeGreaterThanOrEqual(13);
    expect(new Set(tutorials.map(item => item.id)).size).toBe(tutorials.length);
    expect(validation).toEqual({ valid: true, errors: [] });
  });

  it('returns stable tutorial records by ID', () => {
    const summary = interactionTutorials.listTutorials()[0];
    const tutorial = interactionTutorials.getTutorial(summary.id);

    expect(tutorial.id).toBe(summary.id);
    expect(tutorial.steps.length).toBe(summary.stepCount);
    expect(tutorial.roles.length).toBe(summary.roleCount);
  });
});
