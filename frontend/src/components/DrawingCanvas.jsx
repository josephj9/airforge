import { Crosshair, MousePointer2, Pencil } from 'lucide-react';
import { useRef } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../lib/drawing.js';

export default function DrawingCanvas({ drawing, mode, gesture, grid }) {
  const pointer = useRef(null);
  // Convert viewport pixels to normalized coordinates, independent of display size.
  const point = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  };
  const end = () => {
    pointer.current = null;
    drawing.end();
  };
  return (
    <section className="panel sketch-panel">
      <div className="panel-heading">
        <div>
          <Pencil size={16} />
          <h2>Canvas</h2>
        </div>
        <span className={`canvas-status ${drawing.drawing ? 'ink-active' : ''}`}>
          <i />
          {drawing.drawing ? 'Drawing' : 'Ready to draw'}
        </span>
      </div>
      <div className="panel-body">
        <div className={`canvas-stage ${grid ? 'show-grid' : ''}`}>
          <canvas
            ref={drawing.canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            aria-label="Sketch canvas. Select mouse mode to draw with a mouse or touch."
            style={{ cursor: mode === 'mouse' ? 'crosshair' : 'default' }}
            onPointerDown={(e) => {
              if (mode !== 'mouse' || e.button !== 0) return;
              pointer.current = e.pointerId;
              e.currentTarget.setPointerCapture(e.pointerId);
              drawing.move(point(e), true);
            }}
            onPointerMove={(e) => {
              if (mode === 'mouse' && pointer.current === e.pointerId)
                drawing.move(point(e), true);
            }}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={end}
          />
          {drawing.count === 0 && !drawing.drawing && (
            <div className="canvas-empty">
              <Pencil size={28} strokeWidth={1.5} className="empty-icon" />
              <h3>Canvas is empty</h3>
              <p>
                {mode === 'air'
                  ? 'Enable the camera, then pinch your thumb and index finger to draw.'
                  : 'Click or touch and drag to draw.'}
              </p>
            </div>
          )}
          {mode === 'air' && gesture.point && (
            <div
              className={`air-cursor ${gesture.drawing ? 'is-drawing' : ''}`}
              style={{
                left: `${gesture.point.x * 100}%`,
                top: `${gesture.point.y * 100}%`,
              }}
            />
          )}
          {mode === 'air' && gesture.clearProgress > 0 && (
            <div className="clear-progress" role="status">
              <span>Hold palm open to clear…</span>
              <div style={{ width: `${gesture.clearProgress * 100}%` }} />
            </div>
          )}
        </div>
      </div>
      <div className="canvas-footer">
        <span>
          {mode === 'air' ? <Crosshair size={14} /> : <MousePointer2 size={14} />}
          {mode === 'air' ? 'Air drawing' : 'Mouse drawing'}
          <span className="footer-dot">·</span>
          {drawing.count} {drawing.count === 1 ? 'stroke' : 'strokes'}
        </span>
        <span>Undo: Ctrl / Cmd + Z</span>
      </div>
    </section>
  );
}
