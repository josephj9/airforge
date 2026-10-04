import { useCallback, useRef, useState } from 'react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  downloadBlob,
  paintStroke,
} from '../lib/drawing.js';

export function useDrawing() {
  // Keep point history in refs; only UI indicators need React state updates.
  const canvasRef = useRef(null),
    strokes = useRef([]),
    current = useRef(null);
  const brush = useRef({ width: 4, color: '#f0f0f0' });
  const [count, setCount] = useState(0),
    [drawing, setDrawing] = useState(false);
  // Repaint stored strokes so undo and resizing the displayed canvas preserve the sketch.
  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    strokes.current.forEach((s) => paintStroke(ctx, s));
    if (current.current) paintStroke(ctx, current.current);
  }, []);
  const end = useCallback(() => {
    if (current.current) {
      strokes.current.push(current.current);
      current.current = null;
      setCount(strokes.current.length);
    }
    setDrawing(false);
  }, []);
  const move = useCallback(
    (point, down) => {
      if (!point || !down) {
        end();
        return;
      }
      if (!current.current) {
        current.current = { ...brush.current, points: [point] };
        setDrawing(true);
      } else {
        const last = current.current.points.at(-1);
        if (Math.hypot(point.x - last.x, point.y - last.y) < 0.0008) return;
        current.current.points.push(point);
      }
      redraw();
    },
    [end, redraw],
  );
  const undo = useCallback(() => {
    end();
    strokes.current.pop();
    setCount(strokes.current.length);
    redraw();
  }, [end, redraw]);
  const clear = useCallback(() => {
    current.current = null;
    strokes.current = [];
    setCount(0);
    setDrawing(false);
    redraw();
  }, [redraw]);
  const exportPng = useCallback(() => {
    end();
    const output = document.createElement('canvas');
    output.width = CANVAS_WIDTH;
    output.height = CANVAS_HEIGHT;
    const ctx = output.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Dark ink on white is readable and ready for later sketch interpretation.
    strokes.current.forEach((s) => paintStroke(ctx, s, '#202020'));
    output.toBlob((blob) => {
      if (blob)
        downloadBlob(
          blob,
          `airforge-sketch-${new Date().toISOString().slice(0, 10)}.png`,
        );
    }, 'image/png');
  }, [end]);
  return { canvasRef, brush, count, drawing, move, end, undo, clear, exportPng };
}
