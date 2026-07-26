import { describe, expect, it } from 'vitest';
import {
  HTML_ELEMENTS_DB,
  getElementInfo
} from '../../src/data/htmlElements.js';

describe('HTML element catalog module', () => {
  it('contains unique semantic tag records', () => {
    const tags = HTML_ELEMENTS_DB.map(item => item.tag);

    expect(HTML_ELEMENTS_DB.length).toBeGreaterThanOrEqual(80);
    expect(new Set(tags).size).toBe(tags.length);
    expect(HTML_ELEMENTS_DB.every(item => item.nameAr && item.labelAr)).toBe(true);
  });

  it('preserves parent and element type constraints', () => {
    expect(getElementInfo('tr')).toMatchObject({
      tag: 'tr',
      type: 'restricted'
    });
    expect(getElementInfo('img')).toMatchObject({
      tag: 'img',
      type: 'void'
    });
    expect(getElementInfo('section')).toMatchObject({
      tag: 'section',
      type: 'block'
    });
  });

  it('returns undefined for unsupported tags', () => {
    expect(getElementInfo('not-a-real-tag')).toBeUndefined();
  });
});
