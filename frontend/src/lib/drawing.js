export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 900;

export function paintStroke(ctx, stroke, color = stroke.color) {
  if (!stroke.points.length) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const first = stroke.points[0];
  if (stroke.points.length === 1) {
    ctx.beginPath();
    ctx.arc(
      first.x * CANVAS_WIDTH,
      first.y * CANVAS_HEIGHT,
      stroke.width / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(first.x * CANVAS_WIDTH, first.y * CANVAS_HEIGHT);
  for (const p of stroke.points.slice(1))
    ctx.lineTo(p.x * CANVAS_WIDTH, p.y * CANVAS_HEIGHT);
  ctx.stroke();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
