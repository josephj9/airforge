export async function createHandLandmarker() {
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  const vision = await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}wasm`);
  const modelUrl =
    import.meta.env.VITE_HAND_MODEL_URL ||
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  const response = await fetch(modelUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok)
    throw new Error(
      'The hand-tracking model could not be downloaded. Check your connection and try again.',
    );
  const modelAssetBuffer = new Uint8Array(await response.arrayBuffer());
  const options = {
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.65,
    minTrackingConfidence: 0.65,
  };
  try {
    return await HandLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { modelAssetBuffer, delegate: 'GPU' },
    });
  } catch {
    return HandLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { modelAssetBuffer, delegate: 'CPU' },
    });
  }
}
