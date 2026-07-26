import { useEffect } from 'react';
import { loadLegacyRuntime } from './loadLegacyRuntime.js';

export function useLegacyRuntime() {
  useEffect(() => {
    void loadLegacyRuntime();
  }, []);
}
