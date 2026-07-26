import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEYS,
  readWorkspace,
  writeEntriesAtomically,
  writeWorkspace
} from '../../src/services/storage/builderStorage.js';

class MemoryStorage {
  constructor(entries = {}) {
    this.data = new Map(Object.entries(entries));
    this.failOnKey = null;
  }

  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }

  setItem(key, value) {
    if (key === this.failOnKey) throw new Error(`quota:${key}`);
    this.data.set(key, String(value));
  }

  removeItem(key) {
    this.data.delete(key);
  }
}

describe('builder storage compatibility service', () => {
  it('keeps every persisted key byte-compatible', () => {
    expect(STORAGE_KEYS).toMatchObject({
      html: 'builder-html',
      css: 'builder-css',
      javascript: 'builder-js',
      pageSettings: 'builder-page-settings',
      customBreakpoints: 'builder-custom-breakpoints',
      workspace: 'osoos-project-workspace-v1',
      workspaceCorruptBackup: 'osoos-project-workspace-v1-corrupt-backup'
    });
  });

  it('rolls the whole canonical snapshot back after a partial write', () => {
    const storage = new MemoryStorage({
      'builder-html': '<main>old</main>',
      'builder-css': '.old{}',
      'builder-js': 'old()'
    });
    storage.failOnKey = 'builder-js';

    expect(() =>
      writeEntriesAtomically(
        [
          ['builder-html', '<main>new</main>'],
          ['builder-css', '.new{}'],
          ['builder-js', 'new()']
        ],
        storage
      )
    ).toThrow('quota:builder-js');

    expect(storage.getItem('builder-html')).toBe('<main>old</main>');
    expect(storage.getItem('builder-css')).toBe('.old{}');
    expect(storage.getItem('builder-js')).toBe('old()');
  });

  it('backs up corrupt workspace bytes before returning an empty result', () => {
    const corrupt = '{"version":1,"projects":[';
    const storage = new MemoryStorage({
      [STORAGE_KEYS.workspace]: corrupt
    });

    const result = readWorkspace(STORAGE_KEYS.workspace, storage);

    expect(result.workspace).toBeNull();
    expect(result.corrupt).toBe(true);
    expect(result.backupSaved).toBe(true);
    expect(storage.getItem(STORAGE_KEYS.workspaceCorruptBackup)).toBe(corrupt);
    expect(storage.getItem(STORAGE_KEYS.workspace)).toBe(corrupt);
  });

  it('round-trips workspace schema version 1 without reshaping it', () => {
    const storage = new MemoryStorage();
    const workspace = {
      version: 1,
      activeProjectId: 'project-1',
      projects: [
        {
          id: 'project-1',
          name: 'مشروعي',
          files: [],
          activeFileId: null,
          lastPageId: null
        }
      ]
    };

    writeWorkspace(workspace, STORAGE_KEYS.workspace, storage);

    expect(readWorkspace(STORAGE_KEYS.workspace, storage).workspace).toEqual(
      workspace
    );
  });
});
