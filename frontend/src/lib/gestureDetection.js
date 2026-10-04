export const GESTURE_CONFIG = Object.freeze({
  pinchStart: 0.3,
  pinchEnd: 0.46,
  debounceMs: 65,
  clearHoldMs: 1500,
  smoothingMs: 48,
});
const clamp = (v) => Math.max(0, Math.min(1, v));
const distance = (a, b, aspect) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);

// Distances are relative to palm size, so moving toward the camera does not
// change the pinch threshold. Hysteresis and a short dwell reject jitter.
export function createGestureTracker(config = GESTURE_CONFIG) {
  let pinching = false,
    candidateAt = null,
    palmAt = null,
    cleared = false;
  let point = null,
    lastAt = null,
    armed = false;
  function reset() {
    pinching = false;
    candidateAt = null;
    palmAt = null;
    cleared = false;
    point = null;
    lastAt = null;
    armed = false;
  }
  function update(landmarks, now, aspect = 4 / 3) {
    if (!landmarks || landmarks.length !== 21) {
      reset();
      return { point: null, drawing: false, clear: false, clearProgress: 0 };
    }
    const d = (a, b) => distance(landmarks[a], landmarks[b], aspect);
    const scale = Math.max(d(0, 9), d(5, 17), 0.01);
    const ratio = d(4, 8) / scale;
    // Require an open pinch after startup or hand loss before accepting ink.
    if (ratio > config.pinchEnd) armed = true;
    const wantsPinch = armed && ratio < (pinching ? config.pinchEnd : config.pinchStart);
    if (wantsPinch !== pinching) {
      candidateAt ??= now;
      if (now - candidateAt >= config.debounceMs) {
        pinching = wantsPinch;
        candidateAt = null;
      }
    } else candidateAt = null;
    // Mirror the index fingertip to match the preview, then smooth by elapsed time.
    const raw = { x: clamp(1 - landmarks[8].x), y: clamp(landmarks[8].y) };
    const alpha =
      lastAt === null ? 1 : 1 - Math.exp(-(now - lastAt) / config.smoothingMs);
    point = point
      ? { x: point.x + (raw.x - point.x) * alpha, y: point.y + (raw.y - point.y) * alpha }
      : raw;
    lastAt = now;
    const openPalm =
      !pinching &&
      ratio > 0.7 &&
      d(4, 17) > scale * 0.95 &&
      [
        [8, 6],
        [12, 10],
        [16, 14],
        [20, 18],
      ].every(([tip, pip]) => d(tip, 0) > d(pip, 0) * 1.18);
    // Emit one clear event per continuous open-palm hold, rather than every frame.
    let clear = false;
    if (openPalm) {
      palmAt ??= now;
      if (!cleared && now - palmAt >= config.clearHoldMs) {
        clear = true;
        cleared = true;
      }
    } else {
      palmAt = null;
      cleared = false;
    }
    return {
      point,
      drawing: pinching,
      clear,
      clearProgress:
        palmAt === null ? 0 : Math.min((now - palmAt) / config.clearHoldMs, 1),
    };
  }
  return { update, reset };
}
