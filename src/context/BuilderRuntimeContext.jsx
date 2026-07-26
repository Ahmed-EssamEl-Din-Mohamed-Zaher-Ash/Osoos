import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore
} from 'react';

const BuilderRuntimeContext = createContext(null);

function subscribeToRuntime(onStoreChange) {
  window.addEventListener('osoos:react-runtime-ready', onStoreChange);
  return () => {
    window.removeEventListener('osoos:react-runtime-ready', onStoreChange);
  };
}

function getRuntimeSnapshot() {
  return window.appInstance || null;
}

function getServerRuntimeSnapshot() {
  return null;
}

export function BuilderRuntimeProvider({ children }) {
  const app = useSyncExternalStore(
    subscribeToRuntime,
    getRuntimeSnapshot,
    getServerRuntimeSnapshot
  );

  const value = useMemo(
    () => ({
      app,
      ready: Boolean(app?.projectManager)
    }),
    [app]
  );

  return (
    <BuilderRuntimeContext.Provider value={value}>
      {children}
    </BuilderRuntimeContext.Provider>
  );
}

export function useBuilderRuntime() {
  const context = useContext(BuilderRuntimeContext);
  if (!context) {
    throw new Error('useBuilderRuntime must be used inside BuilderRuntimeProvider');
  }
  return context;
}
