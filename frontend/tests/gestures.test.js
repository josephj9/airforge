import test from 'node:test';
import assert from 'node:assert/strict';
import { createGestureTracker } from '../src/lib/gestureDetection.js';

function hand(ratio = 0.8, palm = false) {
  const p = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.55, z: 0 }));
  p[0] = { x: 0.5, y: 0.9 };
  p[9] = { x: 0.5, y: 0.6 };
  p[5] = { x: 0.4, y: 0.65 };
  p[17] = { x: 0.6, y: 0.65 };
  p[8] = { x: 0.4, y: 0.3 };
  p[4] = { x: 0.4 - ratio * 0.3, y: 0.3 };
  for (const [tip, pip, x] of [
    [8, 6, 0.4],
    [12, 10, 0.5],
    [16, 14, 0.55],
    [20, 18, 0.6],
  ]) {
    p[pip] = { x, y: palm ? 0.55 : 0.2 };
    p[tip] = { x, y: 0.3 };
  }
  return p;
}

test('cursor is mirrored, bounded and smoothed', () => {
  const tracker = createGestureTracker();
  assert.equal(tracker.update(hand(), 0, 1).point.x, 0.6);
  const next = hand();
  next[8].x = 0.2;
  const { point } = tracker.update(next, 20, 1);
  assert.ok(point.x > 0.6 && point.x < 0.8);
});

test('startup pinch is ignored until fingers separate', () => {
  const tracker = createGestureTracker();
  tracker.update(hand(0.2), 0, 1);
  assert.equal(tracker.update(hand(0.2), 200, 1).drawing, false);
  tracker.update(hand(0.8), 220, 1);
  tracker.update(hand(0.2), 240, 1);
  assert.equal(tracker.update(hand(0.2), 320, 1).drawing, true);
});

test('pinch debouncing and hysteresis prevent threshold chatter', () => {
  const tracker = createGestureTracker();
  tracker.update(hand(), 0, 1);
  assert.equal(tracker.update(hand(0.2), 10, 1).drawing, false);
  assert.equal(tracker.update(hand(0.2), 80, 1).drawing, true);
  assert.equal(tracker.update(hand(0.38), 100, 1).drawing, true);
  assert.equal(tracker.update(hand(0.5), 120, 1).drawing, true);
  assert.equal(tracker.update(hand(0.5), 200, 1).drawing, false);
  assert.equal(tracker.update(hand(0.38), 300, 1).drawing, false);
});

test('hand loss stops ink immediately and requires release before resuming', () => {
  const tracker = createGestureTracker();
  tracker.update(hand(), 0, 1);
  tracker.update(hand(0.2), 10, 1);
  assert.equal(tracker.update(hand(0.2), 80, 1).drawing, true);
  assert.deepEqual(tracker.update(undefined, 100), {
    point: null,
    drawing: false,
    clear: false,
    clearProgress: 0,
  });
  assert.equal(tracker.update(hand(0.2), 200, 1).drawing, false);
  assert.equal(tracker.update(hand(0.2), 400, 1).drawing, false);
});

test('clear requires sustained open palm and fires only once per hold', () => {
  const tracker = createGestureTracker();
  assert.equal(tracker.update(hand(0.9, true), 0, 1).clear, false);
  assert.equal(tracker.update(hand(0.9, true), 1499, 1).clear, false);
  assert.equal(tracker.update(hand(0.9, true), 1500, 1).clear, true);
  assert.equal(tracker.update(hand(0.9, true), 3500, 1).clear, false);
  tracker.update(hand(0.9, false), 3600, 1);
  tracker.update(hand(0.9, true), 3700, 1);
  assert.equal(tracker.update(hand(0.9, true), 5200, 1).clear, true);
});

test('brief or interrupted palm does not clear', () => {
  const tracker = createGestureTracker();
  tracker.update(hand(0.9, true), 0, 1);
  tracker.update(hand(0.9, false), 1000, 1);
  const result = tracker.update(hand(0.9, true), 1600, 1);
  assert.equal(result.clear, false);
  assert.equal(result.clearProgress, 0);
});

test('pinch thresholds are invariant to hand scale', () => {
  for (const size of [0.5, 1, 1.5]) {
    const scaled = (ratio) =>
      hand(ratio).map((p) => ({
        x: 0.5 + (p.x - 0.5) * size,
        y: 0.5 + (p.y - 0.5) * size,
      }));
    const tracker = createGestureTracker();
    tracker.update(scaled(0.8), 0, 1);
    tracker.update(scaled(0.2), 10, 1);
    assert.equal(tracker.update(scaled(0.2), 100, 1).drawing, true);
  }
});
