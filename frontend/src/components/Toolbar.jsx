import { Download, Grid2X2, Hand, MousePointer2, RotateCcw, Trash2 } from 'lucide-react';

export default function Toolbar({
  mode,
  setMode,
  thickness,
  setThickness,
  grid,
  setGrid,
  drawing,
  requestClear,
  exportSketch,
}) {
  const hasStrokes = drawing.count > 0 || drawing.drawing;

  return (
    <div className="toolbar" role="group" aria-label="Drawing tools">
      <div className="mode-switch" role="group" aria-label="Drawing input">
        <button
          className={mode === 'air' ? 'selected' : ''}
          aria-pressed={mode === 'air'}
          onClick={() => setMode('air')}
        >
          <Hand size={16} />
          Air draw
        </button>
        <button
          className={mode === 'mouse' ? 'selected' : ''}
          aria-pressed={mode === 'mouse'}
          onClick={() => setMode('mouse')}
        >
          <MousePointer2 size={16} />
          Mouse
        </button>
      </div>

      <label className="brush-label" htmlFor="brush">
        Brush
        <input
          id="brush"
          type="range"
          min="2"
          max="12"
          value={thickness}
          onChange={(event) => setThickness(Number(event.target.value))}
        />
        <span className="brush-value">{thickness}px</span>
      </label>

      <div className="toolbar-actions">
        <button
          className={`tool-button ${grid ? 'active' : ''}`}
          aria-pressed={grid}
          onClick={() => setGrid(!grid)}
          title="Toggle canvas grid"
        >
          <Grid2X2 size={16} />
          Grid
        </button>
        <button
          className="tool-button"
          title="Undo last stroke (Ctrl / Cmd + Z)"
          disabled={!hasStrokes}
          onClick={drawing.undo}
        >
          <RotateCcw size={16} />
          Undo
        </button>
        <button className="tool-button" disabled={!hasStrokes} onClick={requestClear}>
          <Trash2 size={16} />
          Clear
        </button>
        <button className="button primary" disabled={!hasStrokes} onClick={exportSketch}>
          <Download size={16} />
          Export PNG
        </button>
      </div>
    </div>
  );
}
