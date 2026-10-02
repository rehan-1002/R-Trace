/**
 * network.ts — Dynamic LAN and remote host resolution.
 * Automatically adapts API and WebSocket URLs to match the host machine,
 * allowing secondary laptops, tablets, and mobile devices on the same Wi-Fi
 * to connect directly without manual configuration.
 */

const CLOUD_API_URL = 'https://r-trace.onrender.com';
const CLOUD_WS_URL = 'wss://r-trace.onrender.com/ws';

export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  // 1. If explicit cloud URL is provided in env, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isHttps = window.location.protocol === 'https:';

    // 2. If running on GitHub Pages, Render, Vercel, Netlify, or any HTTPS remote host
    if (
      isHttps ||
      hostname.endsWith('.github.io') ||
      hostname.includes('render.com') ||
      hostname.includes('vercel.app') ||
      hostname.includes('netlify.app')
    ) {
      return CLOUD_API_URL;
    }

    // 3. If accessing via local Wi-Fi LAN IP (e.g. 192.168.x.x on mobile browser)
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname !== '127.0.0.1';
    if (isLanIp) {
      return `http://${hostname}:3001`;
    }
  }

  return envUrl || 'http://localhost:3001';
}

export function getWsUrl(): string {
  const envWs = import.meta.env.VITE_WS_URL;

  // 1. If explicit cloud WS URL is provided in env, use it
  if (envWs && !envWs.includes('localhost') && !envWs.includes('127.0.0.1')) {
    return envWs;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isHttps = window.location.protocol === 'https:';

    // 2. If running on GitHub Pages, Render, Vercel, Netlify, or any HTTPS remote host
    if (
      isHttps ||
      hostname.endsWith('.github.io') ||
      hostname.includes('render.com') ||
      hostname.includes('vercel.app') ||
      hostname.includes('netlify.app')
    ) {
      return CLOUD_WS_URL;
    }

    // 3. If accessing via local Wi-Fi LAN IP (e.g. 192.168.x.x)
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname !== '127.0.0.1';
    if (isLanIp) {
      return `ws://${hostname}:3001/ws`;
    }
  }

  return envWs || 'ws://localhost:3001/ws';
}

