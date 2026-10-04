/**
 * CameraFeedBlock.tsx — Live Visual Sentinel Camera & Computer Vision Feed
 * Integrates real-time video stream from the local Python Computer Vision server
 * (server/camera_server.py) or direct ESP32-CAM MJPEG stream.
 */

import { useState, useEffect } from 'react';
import './CameraFeedBlock.css';

interface CameraFeedBlockProps {
  nodeId: string;
  nodeType?: string;
}

interface ServerStatus {
  connected: boolean;
  source: string;
  fps: number;
  fireDetected: boolean;
  flameArea: number;
  timestamp: number;
}

export function CameraFeedBlock({ nodeId, nodeType = 'FIRE' }: CameraFeedBlockProps) {
  const [streamActive, setStreamActive] = useState<boolean>(true);
  const [streamKey, setStreamKey] = useState<number>(Date.now());
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>('http://localhost:5000/video_feed');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('http://localhost:5000/video_feed');

  // Poll server status every 2.5 seconds
  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/status', { mode: 'cors' });
        if (!res.ok) throw new Error('Status not OK');
        const data: ServerStatus = await res.json();
        if (mounted) {
          setStatus(data);
          setServerOnline(true);
        }
      } catch {
        if (mounted) {
          setServerOnline(false);
          setStatus(null);
        }
      }
    };

    void checkStatus();
    const interval = setInterval(checkStatus, 2500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    setStreamKey(Date.now());
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setStreamUrl(customInput.trim());
      setStreamKey(Date.now());
      setShowConfig(false);
    }
  };

  return (
    <section className="node-view__section" aria-labelledby="live-camera-heading">
      <div className="node-view__section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <h3 id="live-camera-heading" className="node-view__section-title">
            Optical Sentinel Surveillance
          </h3>
          <span
            className={`cam-status-pill ${serverOnline ? 'cam-status-pill--online' : 'cam-status-pill--offline'}`}
          >
            {serverOnline ? 'AI STREAM ONLINE' : 'STANDBY'}
          </span>
          {status?.fireDetected && (
            <span className="cam-status-pill cam-status-pill--alert">
              ⚠️ FLAME DETECTED
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button
            type="button"
            className="cam-control-btn"
            onClick={() => setStreamActive(!streamActive)}
          >
            {streamActive ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            className="cam-control-btn"
            onClick={handleRefresh}
            title="Reload video stream"
          >
            ↺ Reload
          </button>
          <button
            type="button"
            className="cam-control-btn"
            onClick={() => setShowConfig(!showConfig)}
            title="Configure Stream URL"
          >
            ⚙ Source
          </button>
          <a
            href="http://localhost:5000"
            target="_blank"
            rel="noreferrer"
            className="cam-control-btn cam-control-btn--link"
            title="Open in Standalone Tab"
          >
            Popout ↗
          </a>
        </div>
      </div>

      {showConfig && (
        <form className="cam-config-bar" onSubmit={handleApplyUrl}>
          <label htmlFor="stream-url-input">Stream URL:</label>
          <input
            id="stream-url-input"
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="http://localhost:5000/video_feed or http://192.168.43.x/stream"
          />
          <button type="submit" className="cam-control-btn cam-control-btn--primary">
            Apply
          </button>
          <button
            type="button"
            className="cam-control-btn"
            onClick={() => {
              setCustomInput('http://localhost:5000/video_feed');
              setStreamUrl('http://localhost:5000/video_feed');
              setStreamKey(Date.now());
            }}
          >
            Reset
          </button>
        </form>
      )}

      <div className="cam-feed-card">
        {streamActive ? (
          <div className="cam-feed-wrapper">
            <img
              key={streamKey}
              src={`${streamUrl}?_t=${streamKey}`}
              alt={`Live Sentinel Feed [${nodeId}]`}
              className="cam-feed-image"
              onError={() => setServerOnline(false)}
              onLoad={() => setServerOnline(true)}
            />

            {/* In-Frame Sentinel HUD Overlay */}
            <div className="cam-hud-overlay">
              <div className="cam-hud-row">
                <span className="cam-hud-tag cam-hud-tag--node">{nodeId} • {nodeType} OPTICAL SENTINEL</span>
                {status && (
                  <span className="cam-hud-tag cam-hud-tag--fps">
                    {status.fps.toFixed(1)} FPS
                  </span>
                )}
              </div>

              <div className="cam-hud-row">
                <span className="cam-hud-tag cam-hud-tag--source">
                  {status?.source ? status.source : 'Python CV Bridge'}
                </span>
                {status?.fireDetected ? (
                  <span className="cam-hud-tag cam-hud-tag--danger">
                    CRITICAL: FLAME AREA {Math.round(status.flameArea)}px
                  </span>
                ) : (
                  <span className="cam-hud-tag cam-hud-tag--safe">STATUS: PERIMETER CLEAR</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="cam-feed-placeholder">
            <p>Stream Paused</p>
            <button
              type="button"
              className="cam-control-btn cam-control-btn--primary"
              onClick={() => setStreamActive(true)}
            >
              Resume Live Feed
            </button>
          </div>
        )}

        {/* Server Info / Quick Connect Footer */}
        <div className="cam-feed-footer">
          <div className="cam-feed-meta">
            <span className="cam-dot" style={{ backgroundColor: serverOnline ? '#52c41a' : '#faad14' }} />
            <span>
              {serverOnline
                ? `Inference Active: ${status?.source || 'Local Computer Vision Server'}`
                : 'Python Computer Vision Server Offline'}
            </span>
          </div>

          {!serverOnline && (
            <div className="cam-offline-helper">
              To launch: <code>npm run cam:server</code> or <code>python server/camera_server.py 0</code>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
