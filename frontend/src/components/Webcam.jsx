import { Camera, CameraOff, LoaderCircle } from 'lucide-react';

// Landmark index pairs form the hand skeleton drawn over the mirrored video.
const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

export default function Webcam({ tracking }) {
  const { videoRef, status, gesture, landmarks, start, stop } = tracking;
  const active = status === 'active',
    loading = status === 'loading';
  return (
    <section className="panel camera-panel">
      <div className="panel-heading">
        <div>
          <Camera size={16} />
          <h2>Camera</h2>
        </div>
        <span className={`badge ${active ? 'badge-active' : ''}`}>
          <i />
          {active ? 'Live' : 'Off'}
        </span>
      </div>
      <div className="panel-body">
        <div className="camera-stage">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={active || loading ? 'visible' : ''}
          />
          {active && (
            <svg
              className="hand-overlay"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {CONNECTIONS.map(
                ([a, b]) =>
                  landmarks[a] && (
                    <line
                      key={`${a}-${b}`}
                      x1={1 - landmarks[a].x}
                      y1={landmarks[a].y}
                      x2={1 - landmarks[b].x}
                      y2={landmarks[b].y}
                      stroke="#ffffff"
                      strokeWidth="0.005"
                    />
                  ),
              )}
              {landmarks.map((p, i) => (
                <circle
                  key={i}
                  cx={1 - p.x}
                  cy={p.y}
                  r={i === 8 ? 0.013 : 0.007}
                  fill={i === 8 && gesture.drawing ? '#ffffff' : '#bdbdbd'}
                />
              ))}
            </svg>
          )}
          {!active && (
            <div className="camera-empty">
              <Camera size={28} strokeWidth={1.5} className="empty-icon" />
              <h3>{loading ? 'Starting camera...' : 'Camera is off'}</h3>
              <p>
                {loading
                  ? 'Loading hand tracking. This may take a few seconds.'
                  : 'Enable your camera and allow access to start air drawing.'}
              </p>
              <button className="button primary" onClick={loading ? stop : start}>
                {loading ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <Camera size={16} />
                )}
                {loading ? 'Cancel setup' : 'Enable camera'}
              </button>
            </div>
          )}
          {active && (
            <div className="tracking-pill">
              <i className={gesture.point ? 'found' : ''} />
              {gesture.point
                ? gesture.drawing
                  ? 'Pinch detected · drawing'
                  : 'Hand detected · ready'
                : 'Show your hand to the camera'}
            </div>
          )}
        </div>
      </div>
      <div className="camera-footer">
        <span>
          {active ? 'Keep your hand in view' : 'You can also draw in Mouse mode'}
        </span>
        {active ? (
          <button onClick={stop} className="text-button">
            <CameraOff size={14} />
            Stop camera
          </button>
        ) : null}
      </div>
    </section>
  );
}
