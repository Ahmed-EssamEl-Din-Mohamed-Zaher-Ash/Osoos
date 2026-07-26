export const STORAGE_KEYS = Object.freeze({
  html: 'builder-html',
  css: 'builder-css',
  javascript: 'builder-js',
  pageSettings: 'builder-page-settings',
  customBreakpoints: 'builder-custom-breakpoints',
  workspace: 'osoos-project-workspace-v1',
  workspaceCorruptBackup: 'osoos-project-workspace-v1-corrupt-backup',
  experienceMode: 'osoos:experience-mode',
  onboardingCompleted: 'osoos:onboarding-tour-completed:v1',
  interactionHubIntro: 'osoos-interaction-hub-intro-v1',
  phaseMigrationBackup: 'osoos-e1-phase-a-migration-backup-v1'
});

const DATABASE_NAME = 'osoos-builder-storage';
const DATABASE_VERSION = 1;
const RECORDS_STORE = 'records';

const resolveStorage = storage => storage || window.localStorage;

function resolveIndexedDB(factory) {
  if (factory) return factory;
  if (typeof window !== 'undefined') return window.indexedDB;
  return globalThis.indexedDB;
}

function openDatabase(factory) {
  const indexedDBFactory = resolveIndexedDB(factory);
  if (!indexedDBFactory || typeof indexedDBFactory.open !== 'function') {
    return Promise.reject(new Error('IndexedDB is unavailable'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDBFactory.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(RECORDS_STORE)) {
        database.createObjectStore(RECORDS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open IndexedDB'));
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked'));
  });
}

async function readDatabaseRecord(key, factory) {
  const database = await openDatabase(factory);
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(RECORDS_STORE, 'readonly');
      const request = transaction.objectStore(RECORDS_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB read aborted'));
    });
  } finally {
    database.close();
  }
}

async function writeDatabaseRecord(key, value, factory) {
  const database = await openDatabase(factory);
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(RECORDS_STORE, 'readwrite');
      transaction.objectStore(RECORDS_STORE).put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB write failed'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB write aborted'));
    });
  } finally {
    database.close();
  }
}

export function writeEntriesAtomically(entries, storage) {
  const target = resolveStorage(storage);
  const previousValues = entries.map(([key]) => target.getItem(key));

  try {
    entries.forEach(([key, value]) => target.setItem(key, String(value ?? '')));
  } catch (error) {
    try {
      entries.forEach(([key], index) => {
        const previousValue = previousValues[index];
        if (previousValue === null) target.removeItem(key);
        else target.setItem(key, previousValue);
      });
    } catch (rollbackError) {
      error.rollbackError = rollbackError;
    }
    throw error;
  }
}

export function readWorkspace(storageKey = STORAGE_KEYS.workspace, storage) {
  const target = resolveStorage(storage);
  let raw = null;

  try {
    raw = target.getItem(storageKey);
    return {
      workspace: raw ? JSON.parse(raw) : null,
      corrupt: false,
      backupSaved: false,
      storageLocked: false,
      error: null
    };
  } catch (error) {
    let backupSaved = false;
    let storageLocked = false;

    try {
      target.setItem(`${storageKey}-corrupt-backup`, raw);
      backupSaved = true;
    } catch (backupError) {
      error.backupError = backupError;
      storageLocked = true;
    }

    return {
      workspace: null,
      corrupt: true,
      backupSaved,
      storageLocked,
      error
    };
  }
}

export function writeWorkspace(
  workspace,
  storageKey = STORAGE_KEYS.workspace,
  storage
) {
  const target = resolveStorage(storage);
  target.setItem(storageKey, JSON.stringify(workspace));
}

export async function readWorkspaceAsync(
  storageKey = STORAGE_KEYS.workspace,
  storage,
  indexedDBFactory
) {
  let indexedDbError = null;
  try {
    const workspace = await readDatabaseRecord(storageKey, indexedDBFactory);
    if (workspace) {
      return {
        workspace: typeof workspace === 'string' ? JSON.parse(workspace) : workspace,
        corrupt: false,
        backupSaved: false,
        storageLocked: false,
        error: null,
        backend: 'indexeddb'
      };
    }
  } catch (error) {
    indexedDbError = error;
  }

  const legacy = readWorkspace(storageKey, storage);
  return {
    ...legacy,
    error: legacy.error || indexedDbError,
    backend: legacy.workspace ? 'localstorage' : 'none'
  };
}

export async function writeWorkspaceAsync(
  workspace,
  storageKey = STORAGE_KEYS.workspace,
  storage,
  indexedDBFactory
) {
  try {
    await writeDatabaseRecord(storageKey, structuredClone(workspace), indexedDBFactory);
    const target = resolveStorage(storage);
    try {
      // The IndexedDB copy is now durable. Removing the old full JSON copy
      // releases localStorage quota previously consumed by assets and fonts.
      target.removeItem(storageKey);
    } catch { /* A locked localStorage does not invalidate the IndexedDB save. */ }
    return { saved: true, backend: 'indexeddb', error: null };
  } catch (indexedDbError) {
    try {
      writeWorkspace(workspace, storageKey, storage);
      return { saved: true, backend: 'localstorage', error: indexedDbError };
    } catch (localStorageError) {
      localStorageError.indexedDbError = indexedDbError;
      return { saved: false, backend: 'none', error: localStorageError };
    }
  }
}

export const builderStorageService = Object.freeze({
  keys: STORAGE_KEYS,
  readWorkspace,
  readWorkspaceAsync,
  writeEntriesAtomically,
  writeWorkspace,
  writeWorkspaceAsync
});
