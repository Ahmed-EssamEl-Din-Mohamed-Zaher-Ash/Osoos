import StaticShell from './legacy-generated/StaticShell.jsx';
import { useLegacyRuntime } from './legacy-runtime/useLegacyRuntime.js';
import { BuilderRuntimeProvider } from './context/BuilderRuntimeContext.jsx';

export default function App() {
  useLegacyRuntime();
  return (
    <BuilderRuntimeProvider>
      <StaticShell />
    </BuilderRuntimeProvider>
  );
}
