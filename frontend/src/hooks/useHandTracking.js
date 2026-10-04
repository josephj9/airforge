import { useCallback, useEffect, useRef, useState } from 'react';
import { createGestureTracker } from '../lib/gestureDetection.js';
import { createHandLandmarker } from '../lib/mediapipe.js';

const empty = { point: null, drawing: false, clear: false, clearProgress: 0 };
const cameraErrors = {
  NotAllowedError:
    'Camera permission was denied. Allow camera access in your browser’s site settings, then try again.',
  NotFoundError: 'No camera found. Connect a webcam, or switch to mouse drawing.',
  NotReadableError:
    'Your camera is busy or unavailable. Close other camera apps and try again.',
};

export function useHandTracking(onGesture) {
  const videoRef = useRef(null);
  const callback = useRef(onGesture);
  // The animation loop reads the latest callback without restarting camera tracking.
  callback.current = onGesture;
  const runtime = useRef({ epoch: 0, frame: 0, stream: null, model: null });
  const [status, setStatus] = useState('off');
  const [error, setError] = useState('');
  const [gesture, setGesture] = useState(empty);
  const [landmarks, setLandmarks] = useState([]);

  const release = useCallback(() => {
    const r = runtime.current;
    // Invalidate pending camera/model startup work from an older session.
    r.epoch++;
    cancelAnimationFrame(r.frame);
    r.stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    r.stream = null;
    r.model?.close();
    r.model = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    callback.current(empty);
  }, []);

  const stop = useCallback(() => {
    release();
    setStatus('off');
    setGesture(empty);
    setLandmarks([]);
  }, [release]);

  const start = useCallback(async () => {
    release();
    const r = runtime.current,
      epoch = r.epoch;
    setError('');
    setStatus('loading');
    setGesture(empty);
    setLandmarks([]);
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          'Camera access requires HTTPS or localhost and a supported browser. You can still draw with a mouse.',
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
      });
      if (epoch !== r.epoch) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      r.stream = stream;
      stream.getVideoTracks()[0].onended = () => {
        stop();
        setError('The camera disconnected. Reconnect it and try again.');
      };
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      if (epoch !== r.epoch) return;
      const model = await createHandLandmarker();
      if (epoch !== r.epoch) {
        model.close();
        return;
      }
      r.model = model;
      const tracker = createGestureTracker();
      let lastVideoTime = -1,
        lastFrame = -Infinity;
      setStatus('active');
      const tick = (now) => {
        if (epoch !== r.epoch) return;
        try {
          // Inference is synchronous: cap at 24fps and never queue duplicate frames.
          if (
            video.readyState >= 2 &&
            video.currentTime !== lastVideoTime &&
            now - lastFrame >= 1000 / 24
          ) {
            lastFrame = now;
            lastVideoTime = video.currentTime;
            const result = model.detectForVideo(video, now);
            const hand = result.landmarks[0];
            const next = tracker.update(hand, now, video.videoWidth / video.videoHeight);
            setLandmarks(hand || []);
            setGesture(next);
            callback.current(next);
          }
          r.frame = requestAnimationFrame(tick);
        } catch (err) {
          stop();
          setError(`Hand tracking stopped: ${err.message}. Try restarting the camera.`);
        }
      };
      r.frame = requestAnimationFrame(tick);
    } catch (err) {
      if (epoch !== r.epoch) return;
      stop();
      setError(
        cameraErrors[err.name] ||
          err.message ||
          'Unable to start hand tracking. Please try again.',
      );
    }
  }, [release, stop]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      release();
    };
  }, [release, stop]);
  return { videoRef, status, error, gesture, landmarks, start, stop };
}
