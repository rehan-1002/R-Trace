/**
 * server/index.js — R-TRACE Backend & SQLite Time-Series Database
 * 
 * Provides:
 *  - Native SQLite storage (via node:sqlite in Node.js 22+)
 *  - High-throughput WebSocket server on /ws for live hardware streaming
 *  - REST API for node topology, historical telemetry, and auth
 *  - Automated alert trigger engine on sensor thresholds
 * 
 * Run: npm run server
 * Default Port: 3001
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'rtrace.db');

// ============================================================================
// 1. Initialize SQLite Database
// ============================================================================
const db = new DatabaseSync(DB_PATH);

// Enable Write-Ahead Logging (WAL) for high concurrency
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;

  -- 1. Sensor Telemetry Time-Series
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL,
    node_type TEXT NOT NULL,
    metric TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    timestamp_source TEXT DEFAULT 'edge'
  );
  CREATE INDEX IF NOT EXISTS idx_readings_query ON readings(node_id, metric, timestamp);

  -- 2. Nodes Registry
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    location_label TEXT,
    description TEXT,
    active INTEGER DEFAULT 1
  );

  -- 3. System Alerts
  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    node_id TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  -- 4. Users & Authentication
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL
  );
`);

console.log(`[R-TRACE DB] Connected to SQLite database: ${DB_PATH}`);

// ============================================================================
// 2. Seed Default Mumbai Nodes & Users (if empty)
// ============================================================================
const nodeCount = db.prepare('SELECT COUNT(*) as count FROM nodes').get().count;
if (nodeCount === 0) {
  console.log('[R-TRACE DB] Seeding 20 Mumbai, India nodes into SQLite...');
  const seedNodes = [
    // FIRE
    { id: 'FN-001', type: 'FIRE', label: 'Fire Sentinel Node (FN-001)', lat: 19.2011, lng: 73.1627, location_label: 'Dombivli / Kalyan Region (Maharashtra)', description: 'Primary live hardware node with DHT22, MQ-2, and GPS telemetry.' },
    { id: 'FN-002', type: 'FIRE', label: 'Aarey Forest Green Buffer', lat: 19.1485, lng: 72.8835, location_label: 'Aarey Colony Goregaon East', description: 'Ecological forest buffer zone fire sentinel tracking dry vegetation temperature anomalies.' },
    { id: 'FN-003', type: 'FIRE', label: 'Deonar Bio-Waste Perimeter', lat: 19.0558, lng: 72.9234, location_label: 'Chembur East Sector 3', description: 'Spontaneous combustion and methane flare early-warning node with thermal gradient tracking.' },
    { id: 'FN-004', type: 'FIRE', label: 'Dharavi Industrial Complex', lat: 19.0434, lng: 72.8567, location_label: 'Sion-Dharavi Transit Core', description: 'High-density urban settlement fire alert node with optical smoke obscuration and temperature rise.' },
    // FLOOD
    { id: 'FL-001', type: 'FLOOD', label: 'Mithi River Outfall - BKC', lat: 19.0657, lng: 72.8687, location_label: 'Bandra-Kurla Complex Bridge', description: 'Ultrasonic river depth gauge, tidal surge monitor, and hydraulic flow rate sensor at Mithi bottleneck.' },
    { id: 'FL-002', type: 'FLOOD', label: 'Hindmata Lowland Basin', lat: 19.0178, lng: 72.8478, location_label: 'Dadar East Lowland Sump', description: 'Severe waterlogging transit junction gauge monitoring street water level and drainage surcharge.' },
    { id: 'FL-003', type: 'FLOOD', label: 'Milan Subway Underpass', lat: 19.0886, lng: 72.8427, location_label: 'Santacruz West Subway', description: 'Critical vehicular underpass flood sensor with submerged hydrostatic pressure sensor.' },
    { id: 'FL-004', type: 'FLOOD', label: 'Poisar River Outfall', lat: 19.2064, lng: 72.8470, location_label: 'Kandivali West Stormwater Canal', description: 'Suburban stormwater canal level gauge tracking monsoon precipitation volume.' },
    // AQI
    { id: 'AQ-001', type: 'AQI', label: 'BKC Financial Commercial Core', lat: 19.0607, lng: 72.8644, location_label: 'Bandra East Central Avenue', description: 'Laser particle counter for PM2.5/PM10, vehicular emissions analyzer, and AQI calculation station.' },
    { id: 'AQ-002', type: 'AQI', label: 'Lower Parel Transit Corridor', lat: 18.9926, lng: 72.8258, location_label: 'Senapati Bapat Marg Junction', description: 'Urban street canyon air monitoring array recording high-density traffic exhaust.' },
    { id: 'AQ-003', type: 'AQI', label: 'Chembur-Mahul Industrial Belt', lat: 19.0062, lng: 72.8986, location_label: 'Mahul Road Refinery Buffer', description: 'Heavy industrial buffer air quality monitor measuring hazardous particulates and sulfur compounds.' },
    { id: 'AQ-004', type: 'AQI', label: 'Colaba Gateway Marine Promenade', lat: 18.9220, lng: 72.8347, location_label: 'South Mumbai Promenade', description: 'Coastal air quality baseline station measuring marine aerosols and background particulate levels.' },
    // LANDSLIDE
    { id: 'LS-001', type: 'LANDSLIDE', label: 'Malabar Hill Coastal Cliff', lat: 18.9548, lng: 72.7985, location_label: 'Walkeshwar Coastal Ridge', description: 'High-angle rock cliff inclinometer with subsurface soil moisture probe and acoustic shear detection.' },
    { id: 'LS-002', type: 'LANDSLIDE', label: 'Ghatkopar Hillside Slope', lat: 19.0988, lng: 72.9067, location_label: 'Asalpha-Bhatwadi Incline', description: 'Settlement slope stability sensor with multi-axis tiltmeters and micro-vibration geophones.' },
    { id: 'LS-003', type: 'LANDSLIDE', label: 'Kandivali Quarry Escarpment', lat: 19.2014, lng: 72.8711, location_label: 'Akurli Road Ridge Face', description: 'Quarry perimeter geophone array monitoring bedrock displacement and landslide vibration signatures.' },
    { id: 'LS-004', type: 'LANDSLIDE', label: 'Trombay Hill Ridge Sentinel', lat: 19.0163, lng: 72.9157, location_label: 'BARC Perimeter High Incline', description: 'Critical facility ridge stability node featuring dual-axis MEMS tiltmeters and soil saturation.' },
    // INDUSTRIAL
    { id: 'IN-001', type: 'INDUSTRIAL', label: 'Mahul Refinery Terminal Gate 4', lat: 19.0095, lng: 72.8950, location_label: 'Trombay Petroleum Corridor', description: 'Petrochemical terminal volatile organic compound (VOC) photoionization detector and thermal array.' },
    { id: 'IN-002', type: 'INDUSTRIAL', label: 'TTC Industrial Zone - Pawane', lat: 19.0880, lng: 73.0180, location_label: 'Navi Mumbai Chemical Belt', description: 'Chemical manufacturing zone fence-line monitor measuring toxic vapor release and combustible fumes.' },
    { id: 'IN-003', type: 'INDUSTRIAL', label: 'Sewri BPT Wharf & Bunkering', lat: 18.9980, lng: 72.8590, location_label: 'Mumbai Port Trust Wharf', description: 'Marine fuel bunkering and dockside hazardous gas monitor with flammable vapor detection.' },
    { id: 'IN-004', type: 'INDUSTRIAL', label: 'Kurla Scrap & Metal Yard', lat: 19.0650, lng: 72.8790, location_label: 'LBS Marg Industrial Cluster', description: 'Battery recycling and metal reprocessing fumes monitor with acid vapor detection.' }
  ];

  const insertNode = db.prepare(`
    INSERT INTO nodes (id, type, label, lat, lng, location_label, description, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const n of seedNodes) {
    insertNode.run(n.id, n.type, n.label, n.lat, n.lng, n.location_label, n.description);
  }
}

// Ensure FN-001 reflects live hardware deployment
db.exec(`
  UPDATE nodes 
  SET label = 'Fire Sentinel Node (FN-001)',
      location_label = 'Dombivli / Kalyan Region (Maharashtra)',
      lat = 19.2011,
      lng = 73.1627
  WHERE id = 'FN-001' AND (label LIKE '%Sanjay%' OR location_label LIKE '%SGNP%');
`);

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password, role, name)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertUser.run('u-admin', 'admin', 'admin123', 'ADMIN', 'Command Administrator');
  insertUser.run('u-authority', 'authority', 'auth123', 'AUTHORITY', 'Disaster Control Officer');
  insertUser.run('u-worker', 'worker', 'work123', 'WORKER', 'Field First Responder');
  insertUser.run('u-citizen', 'citizen', 'citizen123', 'CITIZEN', 'Mumbai Resident');
}

// Prepared statements for high performance
const insertReadingStmt = db.prepare(`
  INSERT INTO readings (node_id, node_type, metric, value, unit, timestamp, timestamp_source)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertAlertStmt = db.prepare(`
  INSERT INTO alerts (id, node_id, hazard_type, severity, message, timestamp)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const updateNodeLocationStmt = db.prepare(`
  UPDATE nodes SET lat = ?, lng = ?, location_label = ?, label = ? WHERE id = ?
`);

let lastGeocoded = { lat: 0, lng: 0, label: '' };

async function fetchPlaceName(lat, lng) {
  if (Math.abs(lat - lastGeocoded.lat) < 0.005 && Math.abs(lng - lastGeocoded.lng) < 0.005 && lastGeocoded.label) {
    return lastGeocoded.label;
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: { 'User-Agent': 'R-Trace-Monitor/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.town || addr.city_district || addr.city || '';
      const district = addr.county || addr.state_district || addr.city || 'Maharashtra';
      const label = locality ? `${locality}, ${district}` : district;
      if (label) {
        lastGeocoded = { lat, lng, label };
        return label;
      }
    }
  } catch {
    // Offline or rate-limited
  }

  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Live Deployment)`;
}

async function updateNodeLocation(nodeId, lat, lng) {
  try {
    const placeName = await fetchPlaceName(lat, lng);
    const nodeLabel = `Fire Node [${nodeId}] — ${placeName}`;

    updateNodeLocationStmt.run(lat, lng, placeName, nodeLabel, nodeId);
    console.log(`📍 [GPS Fix] ${nodeId} at ${placeName} (${lat.toFixed(6)}, ${lng.toFixed(6)})`);

    const locPayload = JSON.stringify({
      type: 'NODE_STATUS',
      nodeId,
      status: 'online',
      location: { lat, lng, label: placeName },
      nodeLabel,
      timestamp: new Date().toISOString()
    });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(locPayload);
    });
  } catch (err) {
    console.error('[GPS Update Error]', err);
  }
}

// ============================================================================
// 3. Express Application & REST Endpoints
// ============================================================================
const app = express();
app.use(cors());
app.use(express.json());

// Root Dashboard & Health
app.get('/', (req, res) => {
  const nodeCount = db.prepare('SELECT COUNT(*) as count FROM nodes').get().count;
  const readingCount = db.prepare('SELECT COUNT(*) as count FROM readings').get().count;
  res.json({
    service: 'R-TRACE Disaster Intelligence Backend',
    status: 'ONLINE',
    database: 'SQLite (WAL Mode Active)',
    registeredNodes: `${nodeCount} Mumbai locations active`,
    readingsStored: readingCount,
    uptimeSeconds: Math.round(process.uptime()),
    endpoints: {
      health: 'GET /health',
      nodes: 'GET /api/nodes',
      nodeDetail: 'GET /api/nodes/:nodeId',
      telemetryHistory: 'GET /api/nodes/:nodeId/history?metric=temperature',
      ingestTelemetry: 'POST /api/nodes/:nodeId/telemetry',
      login: 'POST /api/auth/login',
      websocket: 'wss://r-trace.onrender.com/ws'
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), db: 'sqlite' });
});

// GET /api/nodes — Get all registered nodes
app.get('/api/nodes', (req, res) => {
  const rows = db.prepare('SELECT * FROM nodes WHERE active = 1').all();
  const nodes = rows.map((r) => ({
    id: r.id,
    type: r.type,
    label: r.label,
    location: {
      lat: r.lat,
      lng: r.lng,
      label: r.location_label,
    },
    description: r.description,
    active: Boolean(r.active),
  }));
  res.json(nodes);
});

// GET /api/nodes/:nodeId — Get single node
app.get('/api/nodes/:nodeId', (req, res) => {
  const r = db.prepare('SELECT * FROM nodes WHERE id = ?').get(req.params.nodeId);
  if (!r) return res.status(404).json({ message: 'Node not found' });
  res.json({
    id: r.id,
    type: r.type,
    label: r.label,
    location: { lat: r.lat, lng: r.lng, label: r.location_label },
    description: r.description,
    active: Boolean(r.active),
  });
});

// GET /api/nodes/:nodeId/history — Retrieve time-series graph points
app.get('/api/nodes/:nodeId/history', (req, res) => {
  const { nodeId } = req.params;
  const { metric, limit = 100 } = req.query;

  if (!metric) {
    return res.status(400).json({ message: 'Missing required query param: metric' });
  }

  const rows = db.prepare(`
    SELECT timestamp, value
    FROM readings
    WHERE node_id = ? AND metric = ?
    ORDER BY timestamp ASC
    LIMIT ?
  `).all(nodeId, String(metric), Number(limit));

  const points = rows.map((row) => ({
    timestamp: new Date(row.timestamp).getTime(),
    value: Number(row.value),
  }));

  res.json(points);
});

// POST /api/nodes/:nodeId/telemetry — REST endpoint for hardware pushing readings
app.post('/api/nodes/:nodeId/telemetry', (req, res) => {
  const { nodeId } = req.params;
  const { nodeType, metric, value, unit, temperature, humidity, smoke, gas, lat, lng, latitude, longitude, timestamp = new Date().toISOString() } = req.body;
  const mappedNodeType = nodeType || 'FIRE';

  let ingestedCount = 0;

  // 1. Single metric payload
  if (metric && typeof value === 'number') {
    ingestAndBroadcast({
      type: 'SENSOR_READING',
      nodeId,
      nodeType: mappedNodeType,
      metric,
      value,
      unit: unit || '',
      timestamp,
      timestampSource: 'edge',
    });
    ingestedCount++;
  }

  // 2. Composite multi-sensor payload
  if (typeof temperature === 'number') {
    ingestAndBroadcast({
      type: 'SENSOR_READING',
      nodeId,
      nodeType: mappedNodeType,
      metric: 'temperature',
      value: temperature,
      unit: '°C',
      timestamp,
      timestampSource: 'edge',
    });
    ingestedCount++;
  }

  if (typeof humidity === 'number') {
    ingestAndBroadcast({
      type: 'SENSOR_READING',
      nodeId,
      nodeType: mappedNodeType,
      metric: 'humidity',
      value: humidity,
      unit: '% RH',
      timestamp,
      timestampSource: 'edge',
    });
    ingestedCount++;
  }

  const rawSmoke = smoke ?? gas ?? req.body.smokePpm;
  const smokeVal = typeof rawSmoke === 'number'
    ? rawSmoke
    : (req.body.gasDetected === true || rawSmoke === true ? 450 : (req.body.gasDetected === false ? 60 : undefined));

  if (typeof smokeVal === 'number') {
    ingestAndBroadcast({
      type: 'SENSOR_READING',
      nodeId,
      nodeType: mappedNodeType,
      metric: 'smoke',
      value: smokeVal,
      unit: 'ppm',
      timestamp,
      timestampSource: 'edge',
    });
    ingestedCount++;
  }

  const finalLat = Number(lat ?? latitude);
  const finalLng = Number(lng ?? longitude);
  if (!isNaN(finalLat) && !isNaN(finalLng) && finalLat !== 0 && finalLng !== 0) {
    updateNodeLocation(nodeId, finalLat, finalLng);
  }

  if (ingestedCount === 0) {
    return res.status(400).json({ message: 'Invalid payload: numeric value or sensor fields (temperature, humidity, smoke) required' });
  }

  res.status(201).json({ status: 'ingested', count: ingestedCount });
});

// POST /sensor — Direct compatibility with tutorial FIRE-01 / FN-001 format
app.post('/sensor', (req, res) => {
  const incomingId = req.body.node_id || req.body.nodeId || req.body.id;
  const mappedNodeId = (incomingId === 'FIRE-01' || !incomingId) ? 'FN-001' : incomingId;
  const { hazard, temperature, humidity, lat, lng, latitude, longitude } = req.body;
  const mappedNodeType = hazard || 'FIRE';

  console.log(`\n--- ${incomingId || 'FN-001'} SENSOR DATA RECEIVED ---`);
  if (typeof temperature === 'number') {
    console.log(`Temperature : ${temperature} °C`);
    ingestAndBroadcast({
      type: 'SENSOR_READING',
      nodeId: mappedNodeId,
      nodeType: mappedNodeType,
      metric: 'temperature',
      value: temperature,
      unit: '°C',
      timestamp: new Date().toISOString(),
      timestampSource: 'edge',
    });
  }

  if (typeof humidity === 'number') {
    console.log(`Humidity    : ${humidity} %`);
    ingestAndBroadcast({
      type: 'SENSOR_READING',
      nodeId: mappedNodeId,
      nodeType: mappedNodeType,
      metric: 'humidity',
      value: humidity,
      unit: '% RH',
      timestamp: new Date().toISOString(),
      timestampSource: 'edge',
    });
  }

  const rawSmoke = req.body.smoke ?? req.body.gas;
  const smokeVal = typeof rawSmoke === 'number'
    ? rawSmoke
    : (req.body.gasDetected === true || rawSmoke === true ? 450 : (req.body.gasDetected === false ? 60 : undefined));

  if (typeof smokeVal === 'number') {
    console.log(`Smoke / Gas : ${smokeVal} ppm`);
    ingestAndBroadcast({
      type: 'SENSOR_READING',
      nodeId: mappedNodeId,
      nodeType: mappedNodeType,
      metric: 'smoke',
      value: smokeVal,
      unit: 'ppm',
      timestamp: new Date().toISOString(),
      timestampSource: 'edge',
    });
  }

  const finalLat = Number(lat ?? latitude);
  const finalLng = Number(lng ?? longitude);
  if (!isNaN(finalLat) && !isNaN(finalLng) && finalLat !== 0 && finalLng !== 0) {
    console.log(`GPS Fix     : ${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}`);
    updateNodeLocation(mappedNodeId, finalLat, finalLng);
  }

  res.status(200).json({ status: 'ok', nodeId: mappedNodeId });
});

// POST /api/auth/login — User authentication
app.post('/api/auth/login', (req, res) => {
  const rawId = req.body.email || req.body.username || 'admin';
  const username = rawId.split('@')[0].trim().toLowerCase();
  const password = req.body.password;

  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    let role = 'ADMIN';
    let name = 'Command Administrator';
    if (username.includes('auth')) { role = 'AUTHORITY'; name = 'Disaster Control Officer'; }
    else if (username.includes('work')) { role = 'WORKER'; name = 'Field First Responder'; }
    else if (username.includes('cit')) { role = 'CITIZEN'; name = 'Mumbai Resident'; }

    const newId = `u-${username || 'demo'}`;
    try {
      db.prepare('INSERT OR IGNORE INTO users (id, username, password, role, name) VALUES (?, ?, ?, ?, ?)').run(
        newId, username, password || 'demo1234', role, name
      );
      user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    } catch {
      // Fallback
    }

    if (!user) {
      user = { id: newId, username, name, role };
    }
  }

  const token = `rt_jwt_${Buffer.from((user.username || 'admin') + ':' + Date.now()).toString('base64')}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
    expiresAt,
  });
});

// ============================================================================
// 4. WebSocket Server & Ingestion Engine
// ============================================================================
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function ingestAndBroadcast(reading) {
  try {
    // 1. Save reading into SQLite
    insertReadingStmt.run(
      reading.nodeId,
      reading.nodeType,
      reading.metric,
      reading.value,
      reading.unit,
      reading.timestamp,
      reading.timestampSource || 'edge'
    );

    // 2. Automated threshold checks
    checkThresholdAlerts(reading);

    // 3. Broadcast to all active browser dashboard clients
    const payload = JSON.stringify(reading);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  } catch (err) {
    console.error('[Ingest Error]', err);
  }
}

function checkThresholdAlerts(reading) {
  let alertMessage = null;
  let severity = 'WARNING';

  if (reading.nodeType === 'FIRE') {
    if (reading.metric === 'temperature' && reading.value > 62) {
      alertMessage = `CRITICAL THERMAL SPIKE on ${reading.nodeId}: Temperature reached ${reading.value}°C!`;
      severity = 'CRITICAL';
    } else if (reading.metric === 'smoke' && reading.value > 350) {
      alertMessage = `ELEVATED SMOKE on ${reading.nodeId}: Density reached ${reading.value} ppm!`;
    }
  } else if (reading.nodeType === 'FLOOD') {
    if (reading.metric === 'waterLevel' && reading.value > 2.5) {
      alertMessage = `FLOOD LEVEL EXCEEDED on ${reading.nodeId}: Water height at ${reading.value}m!`;
      severity = 'CRITICAL';
    }
  }

  if (alertMessage) {
    const alertId = `ALT-${Date.now()}`;
    insertAlertStmt.run(alertId, reading.nodeId, reading.nodeType, severity, alertMessage, reading.timestamp);
    const alertEvent = {
      type: 'ALERT',
      alertId,
      nodeId: reading.nodeId,
      hazardType: reading.nodeType,
      severity,
      message: alertMessage,
      timestamp: reading.timestamp,
    };
    const alertPayload = JSON.stringify(alertEvent);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(alertPayload);
    });
  }
}

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client or Hardware connected');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'AUTH') {
        ws.send(JSON.stringify({ type: 'AUTH_OK' }));
        return;
      }

      if (msg.type === 'SENSOR_READING' && msg.nodeId && msg.metric) {
        ingestAndBroadcast(msg);
      }
    } catch {
      // Ignored malformed frame
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

// ============================================================================
// 5. Start Server
// ============================================================================
server.listen(PORT, () => {
  console.log('=====================================================');
  console.log(`🚀 R-TRACE Backend & SQLite Database running on:`);
  console.log(`   - HTTP REST API: http://localhost:${PORT}`);
  console.log(`   - WebSocket URI: ws://localhost:${PORT}/ws`);
  console.log(`   - Database File: ${DB_PATH}`);
  console.log('=====================================================');
});

// ============================================================================
// 6. Offline USB Serial Bridge (Auto-detects ESP32 on USB COM Port)
// ============================================================================
let activeSerialPort = null;

async function checkAndConnectSerial() {
  if (activeSerialPort && activeSerialPort.isOpen) return;

  try {
    const { SerialPort } = await import('serialport');
    const { ReadlineParser } = await import('@serialport/parser-readline');
    const ports = await SerialPort.list();

    // Look for USB serial devices
    const espPort = ports.find((p) =>
      p.path &&
      (p.manufacturer?.includes('Silicon Labs') ||
       p.manufacturer?.includes('WCH') ||
       p.manufacturer?.includes('FTDI') ||
       p.vendorId ||
       p.path.startsWith('COM'))
    ) || ports[0];

    if (!espPort) return;

    activeSerialPort = new SerialPort({
      path: espPort.path,
      baudRate: 115200,
      autoOpen: true,
    });

    const parser = activeSerialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', (line) => {
      const cleanLine = line.trim();
      if (!cleanLine.startsWith('{') || !cleanLine.endsWith('}')) return;
      try {
        const data = JSON.parse(cleanLine);
        const targetNodeId = data.nodeId || data.node_id || 'FN-001';
        const targetNodeType = data.nodeType || data.hazard || 'FIRE';

        // 1. Dynamic GPS location update
        const latVal = Number(data.lat ?? data.latitude);
        const lngVal = Number(data.lng ?? data.longitude);
        if (!isNaN(latVal) && !isNaN(lngVal) && latVal !== 0 && lngVal !== 0) {
          updateNodeLocation(targetNodeId, latVal, lngVal);
        }

        // 2. Composite packet support (temperature & humidity in one object)
        if (typeof data.temperature === 'number') {
          console.log(`🌡️  [USB Serial] ${targetNodeId} -> Temperature : ${data.temperature.toFixed(2)} °C`);
          ingestAndBroadcast({
            type: 'SENSOR_READING',
            nodeId: targetNodeId,
            nodeType: targetNodeType,
            metric: 'temperature',
            value: data.temperature,
            unit: '°C',
            timestamp: new Date().toISOString(),
            timestampSource: 'edge',
          });
        }
        if (typeof data.humidity === 'number') {
          console.log(`💧 [USB Serial] ${targetNodeId} -> Humidity    : ${data.humidity.toFixed(2)} % RH`);
          ingestAndBroadcast({
            type: 'SENSOR_READING',
            nodeId: targetNodeId,
            nodeType: targetNodeType,
            metric: 'humidity',
            value: data.humidity,
            unit: '% RH',
            timestamp: new Date().toISOString(),
            timestampSource: 'edge',
          });
        }

        const rawSmoke = data.smoke ?? data.gas;
        const smokeVal = typeof rawSmoke === 'number'
          ? rawSmoke
          : (data.gasDetected === true || rawSmoke === true ? 450 : (data.gasDetected === false ? 60 : undefined));

        if (typeof smokeVal === 'number') {
          console.log(`💨 [USB Serial] ${targetNodeId} -> Smoke / Gas : ${smokeVal} ppm`);
          ingestAndBroadcast({
            type: 'SENSOR_READING',
            nodeId: targetNodeId,
            nodeType: targetNodeType,
            metric: 'smoke',
            value: smokeVal,
            unit: 'ppm',
            timestamp: new Date().toISOString(),
            timestampSource: 'edge',
          });
        }

        // 3. Single metric reading support
        if (data.metric && typeof data.value === 'number') {
          const reading = {
            type: 'SENSOR_READING',
            nodeId: targetNodeId,
            nodeType: targetNodeType,
            metric: data.metric,
            value: data.value,
            unit: data.unit || '',
            timestamp: new Date().toISOString(),
            timestampSource: 'edge',
          };
          console.log(`[USB Serial] ${reading.nodeId} -> ${reading.metric}: ${reading.value} ${reading.unit}`);
          ingestAndBroadcast(reading);
        }
      } catch {
        // Ignored non-json debug lines
      }
    });

    activeSerialPort.on('open', () => {
      console.log(`🔌 [USB Serial] Connected to ESP32 on ${espPort.path} (115200 baud)`);
    });

    activeSerialPort.on('close', () => {
      console.log('🔌 [USB Serial] ESP32 disconnected.');
      activeSerialPort = null;
    });

    activeSerialPort.on('error', (err) => {
      if (!err.message.includes('Access is denied') && !err.message.includes('busy')) {
        console.warn('🔌 [USB Serial Info]', err.message);
      }
      activeSerialPort = null;
    });
  } catch {
    // Serialport scan handled
  }
}

// Auto-scan for USB plug-in every 4 seconds
setInterval(checkAndConnectSerial, 4000);
checkAndConnectSerial();

