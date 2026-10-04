const airInstructions = [
  ['Enable camera', 'Allow access and hold one hand in view.'],
  ['Move the cursor', 'Separate your fingers, then point with your index finger.'],
  ['Pinch to draw', 'Touch thumb to index finger. Release to stop.'],
  ['Open palm to clear', 'Hold for 1.5 seconds to erase all strokes.'],
];

const mouseInstructions = [
  ['Draw', 'Click and drag on the canvas. Touch also works.'],
  ['Undo', 'Remove the last stroke with Undo or Ctrl / Cmd + Z.'],
  ['Clear', 'Use Clear to remove all strokes.'],
  ['Export', 'Download your sketch with Export PNG.'],
];

export default function GestureControls({ mode }) {
  const instructions = mode === 'air' ? airInstructions : mouseInstructions;

  return (
    <section className="instructions" aria-labelledby="instructions-title">
      <div className="instructions-heading">
        <h2 id="instructions-title">How to draw</h2>
        <p>
          {mode === 'air' ? 'Use one hand in good lighting.' : 'Camera not required.'}
        </p>
      </div>
      <ol className="instruction-steps">
        {instructions.map(([title, description], index) => (
          <li key={title}>
            <span className="step-number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
