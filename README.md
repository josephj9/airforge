# AirForge

A browser-based air-drawing studio. **Phase 1 only:** move your index finger to position a cursor, pinch to draw, and export your sketch. React/JSX, Vite, Tailwind CSS, MediaPipe Tasks Vision, Canvas, and a small FastAPI backend.

No Gemini calls, API keys, accounts, database, or publishing infrastructure are required. The camera feed never leaves the browser. Sketches are kept in memory and are lost on reload; use **Export sketch** to keep a PNG.

## Run locally

Prerequisites: Node.js 20.18+ (22 LTS recommended) and Python 3.12 for the backend. The drawing studio works independently of FastAPI.

```powershell
cd frontend
npm install
npm run dev
```

Open the localhost URL printed by Vite. Allow camera access when you click **Enable camera**. The install script copies MediaPipe WASM from the installed package into `public/wasm`; the model is downloaded from Google's versioned public URL on camera start. An internet connection is needed for that download. The model request contains no camera frames. To self-host it, download `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task` to `frontend/public/models/hand_landmarker.task`, copy `.env.example` to `.env`, and set `VITE_HAND_MODEL_URL=/models/hand_landmarker.task`.

In another terminal:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app:app --port 5000
```

On macOS/Linux, use `python3.12 -m venv .venv` and `.venv/bin/python` instead. Optional settings are in `backend/.env.example`; copy it to `.env` to change CORS origins. `GET http://localhost:5000/health` returns `{"status":"ok","service":"airforge","phase":1}` without external calls.

## Drawing controls

| Control | Action |
| --- | --- |
| Index finger | Move the mirrored cursor |
| Thumb + index pinch | Start a stroke; release to finish |
| Open palm for 1.5 seconds | Clear the canvas; visible progress indicates the hold |
| Undo / Ctrl+Z / Cmd+Z | Remove the most recent stroke |
| Trash button | Clear after confirmation |
| Brush slider | Set the thickness of new strokes |
| Grid button | Toggle the drawing guide (never exported) |
| Mouse mode | Click/touch and drag; stops the camera |
| Export sketch | Download a 1200 × 900 white PNG with dark ink |

Use one hand, good light, and a plain background. Separate thumb and index once after camera startup or hand loss to arm drawing. This avoids unintended strokes when a pinched hand reappears. Draw small shapes, then lift the pinch to reposition. Keep your fingers slightly curled when repositioning if you do not intend to trigger palm clearing. Switching tabs stops the camera; restart it on return.

## Architecture and tradeoffs

- `frontend/src/lib/gestureDetection.js`: pure, tested gesture state machine. Palm-relative distances with aspect-ratio correction, pinch thresholds of 0.30/0.46, 65 ms debounce, time-based exponential smoothing (48 ms), and one clear event per open-palm hold. Tune `GESTURE_CONFIG` after testing real hands/cameras.
- `hooks/useHandTracking.js`: camera permission/errors, model lifecycle, duplicate-frame rejection, hand-loss handling, and cleanup. GPU delegate with CPU fallback. Synchronous inference capped at 24 fps, one hand at 640 × 480 target resolution. A worker is a future improvement if slower hardware shows UI stalls.
- `hooks/useDrawing.js` and `lib/drawing.js`: normalized stroke coordinates, undo history, canvas redraw, and independent PNG rendering. Resizing the page does not alter the underlying drawing. Very large sketches can eventually slow full-history redraw; incremental rendering is a future optimization.
- `components/`: camera, canvas, toolbar, and gesture guide. Camera and drawing use separate surfaces. The cursor, placeholder illustration, skeleton, and grid are visual overlays and never enter the sketch image.
- `backend/app.py`, `config.py`, `routes/health.py`: FastAPI factory, explicit CORS origins, and health route. The browser does not need to send anything to FastAPI in this phase.

The frontend uses Vite 6 to support the available Node 20.18 environment. MediaPipe is pinned to keep its JS and locally copied WASM compatible. React Router, Sandpack, Gemini, Supabase, and ZIP dependencies are deliberately deferred to the phases that need them.

## Verify

```powershell
cd frontend
npm test
npm run build
npm run preview
```

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Gesture tests cover pinch hysteresis/debounce, startup arming, hand loss, smoothing/mirroring, hand-size invariance, and clear dwell/rearming. Backend tests cover health, CORS, and absence of generation endpoints.

Manual acceptance checks:

1. Enable camera and allow access. Verify the skeleton follows one hand and both preview and cursor are mirrored.
2. Separate fingers, pinch to draw, release to move, then pinch again. Verify separate strokes with no connecting line.
3. Briefly remove your hand. Existing ink must remain; separate fingers before drawing resumes.
4. Hold an open palm for 1.5 seconds. Verify progress and a single clear. Briefly opening a palm must not clear.
5. Draw with mouse/touch, change brush width, undo, toggle grid, resize the browser, and export. Verify the PNG contains only ink on white.
6. Deny permission, unplug the camera, or block the model URL. Verify an actionable error and working mouse mode.
7. Stop the camera, switch to Mouse, or switch tabs. Verify the browser camera indicator turns off.
8. Check desktop and mobile widths and keyboard navigation, including dialogs and Ctrl/Cmd+Z.

Real webcam quality must be verified manually on target hardware; synthetic landmarks cannot establish tracking quality or gesture comfort. Chrome or Edge on desktop is recommended. Camera access requires HTTPS or localhost; ordinary HTTP LAN IPs do not qualify.

Implementation verification: all 7 gesture tests and all 4 FastAPI tests passed; the Vite production build passed. HTTP checks confirmed the frontend, WASM asset, and hosted hand model were available. Interactive browser and physical-webcam checks were not run because no browser automation surface was available in the build session.

For this workspace only, a portable Python 3.12 runtime and backend dependencies were downloaded into the ignored `.tools` directory to run tests without a system Python installation. You can run the backend from the repository root with `.\.tools\python\python.exe -m uvicorn app:app --app-dir backend --port 5000`. Fresh clones should use the standard virtual-environment setup above.

## Deployment preparation (later phase)

No deployment is performed in Phase 1. When ready, Vercel can use `frontend` as its root, `npm run build` as build command, and `dist` as output. WASM assets are copied during install. `VITE_API_URL` is reserved for the future backend connection and is currently unused.

Render can use `backend` as root, Python 3.12, `pip install -r requirements.txt`, and `uvicorn app:app --host 0.0.0.0 --port $PORT`. Set `CORS_ORIGINS` to the exact frontend HTTPS origin; use `/health` for health checks. Uvicorn serves FastAPI on both Windows and Linux. No secrets belong in `VITE_` environment variables.

Phase 2 adds structured Gemini generation and isolated Sandpack preview/code editing. Phase 3 adds Supabase authentication, private saved projects, atomic quotas, and budget enforcement before public generation is enabled. Phase 4 adds isolated static publishing.

References: [MediaPipe Hand Landmarker for Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js), [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite).
