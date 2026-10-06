import { useEffect, useRef, useState } from 'react';
import { Check, CircleAlert, ShieldCheck, X } from 'lucide-react';
import Webcam from './components/Webcam.jsx';
import DrawingCanvas from './components/DrawingCanvas.jsx';
import Toolbar from './components/Toolbar.jsx';
import GestureControls from './components/GestureControls.jsx';
import { useDrawing } from './hooks/useDrawing.js';
import { useHandTracking } from './hooks/useHandTracking.js';

export default function App() {
  const [mode, setModeState] = useState('air');
  const [thickness, setThickness] = useState(4);
  const [grid, setGrid] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState('');
  const drawing = useDrawing();
  const dialogRef = useRef(null);

  // Both input modes use the same stroke history and drawing operations.
  const tracking = useHandTracking((gesture) => {
    if (mode !== 'air' || confirmClear) {
      drawing.end();
      return;
    }

    if (gesture.clear) {
      drawing.clear();
      setNotice('Canvas cleared.');
    } else {
      drawing.move(gesture.point, gesture.drawing);
    }
  });

  const setMode = (next) => {
    drawing.end();
    setModeState(next);
    if (next === 'mouse') tracking.stop();
  };

  useEffect(() => {
    drawing.brush.current.width = thickness;
  }, [thickness, drawing.brush]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const keydown = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'z' &&
        !['INPUT', 'TEXTAREA'].includes(event.target.tagName) &&
        !confirmClear
      ) {
        event.preventDefault();
        drawing.undo();
      }
    };

    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [drawing.undo, confirmClear]);

  useEffect(() => {
    if (confirmClear) {
      drawing.end();
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [confirmClear, drawing.end]);

  const closeDialog = () => setConfirmClear(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-title">
          <h1>AirForge</h1>
        </div>
        <span className="privacy-note">
          <ShieldCheck size={15} />
          Camera footage stays on your device
        </span>
      </header>

      <main>
        <GestureControls mode={mode} />

        <Toolbar
          {...{ mode, setMode, thickness, setThickness, grid, setGrid, drawing }}
          requestClear={() => setConfirmClear(true)}
          exportSketch={() => {
            drawing.exportPng();
            setNotice('PNG download started.');
          }}
        />

        {tracking.error && (
          <div className="error-banner" role="alert">
            <CircleAlert size={18} />
            <span>{tracking.error}</span>
            {mode === 'air' && (
              <button className="text-button" onClick={() => setMode('mouse')}>
                Use mouse
              </button>
            )}
          </div>
        )}

        <div className="workspace-grid">
          <Webcam
            tracking={{
              ...tracking,
              start: () => {
                drawing.end();
                setModeState('air');
                tracking.start();
              },
            }}
          />
          <DrawingCanvas {...{ drawing, mode, grid }} gesture={tracking.gesture} />
        </div>

        <p className="workspace-note">
          Sketches are not saved automatically. Export a PNG to keep your drawing.
        </p>
      </main>

      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="clear-title"
        aria-describedby="clear-description"
        onCancel={closeDialog}
        onClose={closeDialog}
      >
        <button
          className="dialog-close icon-button"
          aria-label="Close dialog"
          onClick={closeDialog}
        >
          <X size={20} />
        </button>
        <h2 id="clear-title">Clear canvas?</h2>
        <p id="clear-description">
          This removes all strokes. Export a PNG first to keep this sketch.
        </p>
        <div className="dialog-actions">
          <button className="button" onClick={closeDialog}>
            Cancel
          </button>
          <button
            className="button primary"
            onClick={() => {
              drawing.clear();
              closeDialog();
              setNotice('Canvas cleared.');
            }}
          >
            Clear canvas
          </button>
        </div>
      </dialog>
    </div>
  );
}
