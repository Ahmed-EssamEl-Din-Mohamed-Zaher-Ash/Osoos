import { useEffect, useState } from 'react';
import { useBuilderRuntime } from '../../context/BuilderRuntimeContext.jsx';

const BREAKPOINT_MAP = Object.freeze({
  375: '375',
  768: '768',
  1440: '1200'
});

function normalizeViewport(width) {
  const value = String(width || '1440');
  return value === '375' || value === '768' ? value : '1440';
}

export function ViewportControls() {
  const { app } = useBuilderRuntime();
  const [viewport, setViewport] = useState('1440');

  useEffect(() => {
    const handleViewportChange = event => {
      setViewport(normalizeViewport(event.detail?.width));
    };
    window.addEventListener('osoos:viewport-change', handleViewportChange);
    return () => {
      window.removeEventListener('osoos:viewport-change', handleViewportChange);
    };
  }, []);

  const chooseViewport = width => {
    setViewport(width);
    if (!app) return;
    app.setCanvasViewport(width);
    app.properties?.setActiveBreakpoint?.(BREAKPOINT_MAP[width] || 'all', {
      resizeCanvas: false
    });
  };

  const options = [
    { width: '375', icon: 'fa-mobile-alt', label: '375' },
    { width: '768', icon: 'fa-tablet-alt', label: '768' },
    { width: '1440', icon: 'fa-desktop', label: '1440' }
  ];

  return (
    <div className="viewport-selector">
      {options.map(option => (
        <button
          className={`viewport-btn${viewport === option.width ? ' active' : ''}`}
          id={`vp-${option.width === '375' ? 'mobile' : option.width === '768' ? 'tablet' : 'desktop'}`}
          data-width={option.width}
          data-react-owned="true"
          key={option.width}
          onClick={() => chooseViewport(option.width)}
        >
          <i className={`fas ${option.icon}`}></i> {option.label}
        </button>
      ))}
    </div>
  );
}

export function AutosaveToggle() {
  const { app } = useBuilderRuntime();
  const [checked, setChecked] = useState(true);

  const handleChange = event => {
    const nextChecked = event.target.checked;
    setChecked(nextChecked);
    if (nextChecked) app?.saveProgress();
  };

  return (
    <label className="checkbox-container">
      <input
        type="checkbox"
        id="autosave-toggle"
        data-react-owned="true"
        checked={checked}
        onChange={handleChange}
      />
      <span className="checkbox-custom"></span>
      <span>حفظ تلقائي</span>
    </label>
  );
}

function useHistoryState() {
  const { app } = useBuilderRuntime();
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false
  });

  useEffect(() => {
    const history = app?.history;
    if (!history) return undefined;

    const update = state => {
      setHistoryState({
        canUndo: state?.canUndo ?? history.canUndo(),
        canRedo: state?.canRedo ?? history.canRedo()
      });
    };

    update();
    return history.subscribe(update);
  }, [app]);

  return { app, historyState };
}

export function UndoButton() {
  const { app, historyState } = useHistoryState();

  return (
    <button
      className="btn btn-icon btn-secondary"
      id="header-undo"
      title="تراجع (Ctrl+Z)"
      data-react-owned="true"
      disabled={!historyState.canUndo}
      style={{ padding: '6px 10px' }}
      onClick={() => app?.history.undo()}
    >
      <i className="fas fa-undo"></i>
    </button>
  );
}

export function RedoButton() {
  const { app, historyState } = useHistoryState();

  return (
    <button
      className="btn btn-icon btn-secondary"
      id="header-redo"
      title="إعادة (Ctrl+Y)"
      data-react-owned="true"
      disabled={!historyState.canRedo}
      style={{ padding: '6px 10px' }}
      onClick={() => app?.history.redo()}
    >
      <i className="fas fa-redo"></i>
    </button>
  );
}
