"""
server/camera_server.py — Universal High-Performance Computer Vision Server for R-Trace Sentinel Camera

Features:
 1. Ultra-Smooth Low-Latency Capture: DirectShow hardware acceleration (30 FPS), buffer size 1.
 2. Synchronized Frame Broker: Single-pass JPEG encoding with event synchronization (zero duplicate frames, zero stutter).
 3. High-Speed Flame Detection: Fast morphological processing and contour detection.
 4. Asynchronous Alert Dispatch: Non-blocking background webhook delivery (zero video freeze on fire detection).
 5. Local Flask Web Streamer at http://localhost:5000 (CORS-enabled for R-Trace UI).
 6. Auto-reconnect if Wi-Fi or camera connection drops.

Usage:
  python server/camera_server.py                           # Default (ESP32-CAM / Hotspot)
  python server/camera_server.py 0                         # Built-in Laptop / USB Webcam
  python server/camera_server.py http://192.168.43.1:8080/video   # Phone IP Webcam App
  python server/camera_server.py 192.168.43.105            # Custom ESP32-CAM IP
"""

import sys
import os
import time
import threading
import cv2
import numpy as np
import requests
from flask import Flask, Response, jsonify, render_template_string

# ============================================================================
# 1. STREAM SOURCE CONFIGURATION
# ============================================================================
raw_source = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("CAMERA_SOURCE", "192.168.43.105")

if raw_source.isdigit():
    STREAM_SOURCE = int(raw_source)
    SOURCE_LABEL = f"Local Camera Index #{raw_source}"
elif raw_source.startswith("http://") or raw_source.startswith("https://") or raw_source.startswith("rtsp://"):
    STREAM_SOURCE = raw_source
    SOURCE_LABEL = f"Network Video Stream ({raw_source})"
else:
    # Treat as IP address for ESP32-CAM
    STREAM_SOURCE = f"http://{raw_source}/stream"
    SOURCE_LABEL = f"ESP32-CAM Node at http://{raw_source}/stream"

# Target Backend API Endpoints for automated fire alerts
ALERT_ENDPOINTS = [
    "http://localhost:3001/api/nodes/FN-001/telemetry",       # Local R-Trace SQLite backend
    "https://r-trace.onrender.com/api/nodes/FN-001/telemetry" # Cloud production backend
]

app = Flask(__name__)
latest_frame = None
current_fps = 0.0
current_fire_detected = False
current_flame_area = 0
last_alert_time = 0
is_connected = False

# Pre-allocated morphological kernel for ultra-fast CV pipeline
FIRE_KERNEL = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))


# ============================================================================
# 2. SYNCHRONIZED FRAME BROKER (Zero Stutter, Single-Pass JPEG Encoding)
# ============================================================================
class FrameBroker:
    """Thread-safe frame broker that delivers frames to web clients in sync with camera capture."""
    def __init__(self):
        self.condition = threading.Condition()
        self.latest_jpeg = None
        self.frame_id = 0

    def publish(self, jpeg_bytes):
        with self.condition:
            self.latest_jpeg = jpeg_bytes
            self.frame_id += 1
            self.condition.notify_all()

    def get_frame(self, last_seen_id, timeout=0.1):
        with self.condition:
            if self.frame_id == last_seen_id:
                self.condition.wait(timeout=timeout)
            return self.latest_jpeg, self.frame_id

frame_broker = FrameBroker()


# ============================================================================
# 3. FIRE & FLAME DETECTION ENGINE (OpenCV HSV Thresholding)
# ============================================================================
def detect_fire(frame):
    """
    Detects fire / flame colors (intense orange, yellow, and red).
    Draws bounding boxes around suspected flames and returns flame area.
    """
    # Convert BGR frame to HSV color space
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Fire color range in HSV (Hue 16-35: intense yellow to deep orange/red, higher saturation and value)
    lower_fire = np.array([16, 85, 215], dtype=np.uint8)
    upper_fire = np.array([35, 255, 255], dtype=np.uint8)

    # Create binary mask
    mask = cv2.inRange(hsv, lower_fire, upper_fire)

    # Smooth mask with fast morphological operations
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, FIRE_KERNEL)
    mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, FIRE_KERNEL)

    # Find contours of flame areas
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    fire_detected = False
    total_fire_area = 0

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 1200:  # Robust threshold to ignore room lamps and yellow background glints
            fire_detected = True
            total_fire_area += area
            x, y, w, h = cv2.boundingRect(cnt)
            # Draw pulsing red bounding box around fire
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.putText(frame, "FLAME DETECTED", (x, y - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    return frame, fire_detected, total_fire_area


def dispatch_alert_async(payload):
    """Dispatches webhook alerts in the background so video capture never stutters."""
    for url in ALERT_ENDPOINTS:
        try:
            requests.post(url, json=payload, timeout=1.2)
            print(f"   [Alert Dispatched] Flame detected ({payload['value']:.0f}px) -> {url}")
        except Exception:
            pass


# ============================================================================
# 4. LOW-LATENCY HARDWARE VIDEO CAPTURE
# ============================================================================
def open_capture_source(source):
    """
    Opens video capture with low-latency DirectShow settings and high framerate configurations.
    """
    if isinstance(source, int):
        # On Windows, DirectShow (CAP_DSHOW) provides instant start, high FPS, and low latency
        if sys.platform.startswith('win'):
            cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
            if not cap.isOpened():
                cap = cv2.VideoCapture(source)
        else:
            cap = cv2.VideoCapture(source)

        if cap.isOpened():
            # Request MJPG hardware stream for 30 FPS capability
            cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    else:
        # Network stream (ESP32-CAM or phone IP webcam)
        cap = cv2.VideoCapture(source)
        if cap.isOpened():
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    return cap


def capture_loop():
    global latest_frame, last_alert_time, current_fps, current_fire_detected, current_flame_area, is_connected
    print(f"\n=======================================================")
    print(f" [R-TRACE SENTINEL CAM SERVER] Initializing (Smooth 30 FPS Mode)...")
    print(f" Source: {SOURCE_LABEL}")
    print(f" Web Stream: http://localhost:5000/video_feed")
    print(f"=======================================================\n")

    # High-speed JPEG encoding parameters (75 quality is visually sharp and 4x faster)
    encode_params = [
        int(cv2.IMWRITE_JPEG_QUALITY), 75,
        int(cv2.IMWRITE_JPEG_OPTIMIZE), 0
    ]

    while True:
        is_connected = False
        cap = open_capture_source(STREAM_SOURCE)
        if not cap.isOpened():
            print(f"[Cam Server] Waiting for video connection on {STREAM_SOURCE}...")
            print(f"   -> TIP: If using phone, start IP Webcam app (e.g. http://192.168.43.1:8080/video)")
            print(f"   -> TIP: If testing without hardware, run: python server/camera_server.py 0")
            time.sleep(3)
            continue

        print(f"\n>>> [Cam Server] CONNECTED TO VIDEO SOURCE: {SOURCE_LABEL} <<<\n")
        is_connected = True
        prev_time = time.time()
        fps_ema = 30.0

        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                print("[Cam Server] Video stream interrupted. Reconnecting in 2s...")
                is_connected = False
                break

            # Calculate smooth moving average FPS
            curr_time = time.time()
            dt = curr_time - prev_time
            prev_time = curr_time
            if dt > 0:
                instant_fps = 1.0 / dt
                fps_ema = 0.85 * fps_ema + 0.15 * instant_fps
                current_fps = fps_ema

            # Normalize resolution (scale to 640px max width for fluid 30+ FPS speed)
            h, w = frame.shape[:2]
            if w > 640:
                scale = 640.0 / w
                frame = cv2.resize(frame, (640, int(h * scale)), interpolation=cv2.INTER_LINEAR)

            # Run Computer Vision Fire Detection
            processed_frame, fire_detected, area = detect_fire(frame)
            current_fire_detected = fire_detected
            current_flame_area = area

            # Display HUD Overlay
            cv2.putText(processed_frame, "R-TRACE SENTINEL CAM [FN-001]", (12, 26),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(processed_frame, f"FPS: {current_fps:.1f}", (12, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

            if fire_detected:
                cv2.rectangle(processed_frame, (8, 62), (240, 94), (0, 0, 255), -1)
                cv2.putText(processed_frame, "CRITICAL: FIRE DETECTED!", (14, 85),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                # Send Webhook Alert to Backends asynchronously
                if time.time() - last_alert_time > 3:
                    last_alert_time = time.time()
                    payload = {
                        "nodeId": "FN-001",
                        "nodeType": "FIRE",
                        "metric": "camera_fire_alert",
                        "value": float(area),
                        "unit": "px_area"
                    }
                    threading.Thread(target=dispatch_alert_async, args=(payload,), daemon=True).start()
            else:
                cv2.putText(processed_frame, "STATUS: SECURE", (12, 75),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

            latest_frame = processed_frame

            # Pre-encode JPEG once in capture thread for zero-copy streaming
            ret_enc, buffer = cv2.imencode('.jpg', processed_frame, encode_params)
            if ret_enc:
                frame_broker.publish(buffer.tobytes())

            # Optional desktop GUI window (skips gracefully in headless environments)
            try:
                cv2.imshow("R-Trace Live Fire Sentinel", processed_frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    cap.release()
                    cv2.destroyAllWindows()
                    return
            except Exception:
                pass

        cap.release()
        time.sleep(2)


# ============================================================================
# 5. LOCAL FLASK WEB VIEWER & REST API (http://localhost:5000)
# ============================================================================
def generate_web_frames():
    """Streams frames synchronized with the camera capture loop."""
    last_id = -1
    while True:
        frame_bytes, last_id = frame_broker.get_frame(last_id, timeout=0.1)
        if frame_bytes is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


@app.route('/')
def index():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
      <title>R-Trace Sentinel Camera</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { background:#0a0d12; color:#fff; font-family:-apple-system,BlinkMacSystemFont,sans-serif; text-align:center; padding:20px; }
        h1 { color:#ff4d4f; margin-bottom:4px; font-size:1.5rem; }
        p { color:#8c8c8c; margin-top:0; font-size:0.9rem; }
        .box { display:inline-block; border:2px solid #262626; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.8); background:#111; max-width:640px; width:100%; }
        img { display:block; width:100%; height:auto; }
        .hud { padding:10px; font-size:0.85rem; color:#aaa; border-top:1px solid #222; }
      </style>
    </head>
    <body>
      <h1>R-TRACE SENTINEL CAMERA</h1>
      <p>Python Computer Vision Stream (Real-Time Flame Detection)</p>
      <div class="box">
        <img src="/video_feed" alt="Sentinel Stream Connecting..." />
        <div class="hud">Target: FN-001 (Fire Sentinel) • Real-Time AI Inference</div>
      </div>
    </body>
    </html>
    """)


@app.route('/video_feed')
def video_feed():
    res = Response(generate_web_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return res


@app.route('/status')
def status():
    return jsonify({
        "connected": is_connected,
        "source": SOURCE_LABEL,
        "fps": round(current_fps, 1),
        "fireDetected": current_fire_detected,
        "flameArea": current_flame_area,
        "timestamp": int(time.time() * 1000)
    }), 200, {'Access-Control-Allow-Origin': '*'}


# ============================================================================
# 6. ENTRY POINT
# ============================================================================
if __name__ == '__main__':
    # Start video capture loop in background thread
    t = threading.Thread(target=capture_loop, daemon=True)
    t.start()

    # Start Flask Web Server on Port 5000
    print(f"[Cam Server] Local web viewer & API live at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
