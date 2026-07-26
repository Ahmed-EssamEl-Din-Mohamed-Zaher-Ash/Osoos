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

const resolveStorage = storage => storage || window.localStorage;

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

export const builderStorageService = Object.freeze({
  keys: STORAGE_KEYS,
  readWorkspace,
  writeEntriesAtomically,
  writeWorkspace
});
