# R-TRACE PWA Functional Requirements Document

## 1. Functional Scope

The R-TRACE PWA provides authentication, live node monitoring, adaptive node dashboards, map-based situational awareness, incidents, alerts, reports, response workflows, system health, historical analysis, and public safety information.

---

## 2. Functional Requirements Matrix

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | The system shall authenticate registered users and obtain their server-authorized role. | Must |
| FR-002 | The system shall support Guest public access to safety-critical public information. | Must |
| FR-003 | The system shall enforce role permissions server-side. | Must |
| FR-004 | The system shall display a live online/offline state for the edge connection. | Must |
| FR-005 | The system shall receive telemetry through a persistent real-time channel. | Must |
| FR-006 | The system shall render live charts without full page refresh. | Must |
| FR-007 | The system shall display only metrics relevant to the selected node type. | Must |
| FR-008 | The system shall allow users to switch among node types and individual nodes. | Must |
| FR-009 | The system shall display node location on an interactive map. | Must |
| FR-010 | The system shall maintain a node event timeline. | Must |
| FR-011 | The system shall display node health, including last-seen time and power/connectivity status when available. | Must |
| FR-012 | The system shall display model outputs separately from official decisions. | Must |
| FR-013 | The system shall create, acknowledge, update, and resolve incidents according to role permissions. | Must |
| FR-014 | The system shall support role-specific alerts. | Must |
| FR-015 | The system shall allow authorized workers to submit field reports. | Must |
| FR-016 | The system shall allow citizens to submit public incident reports. | Should |
| FR-017 | The system shall maintain a local cache for offline-first behavior. | Must |
| FR-018 | The system shall reconnect automatically after connection loss. | Must |
| FR-019 | The system shall support historical graph ranges. | Should |
| FR-020 | The system shall synchronize local edge data with central services when connectivity is available. | Should |

---

## 3. Authentication and Session Management

### 3.1 Login

The login flow shall support:

- Email/username as configured by the backend.
- Password or the chosen organization-supported authentication method.
- Session creation.
- Logout.
- Session expiry handling.
- Access denied handling.

### 3.2 Role resolution

The backend shall return a role and permissions set.

The client must not infer privileged permissions from UI selections.

### 3.3 Guest access

Guest users may access approved public pages without authentication.

Safety-critical public alerts must not require a logged-in account merely to be viewed.

---

## 4. Dashboard Requirements

### 4.1 Common dashboard

Every authenticated role shall receive an appropriate overview containing:

- Current connection state
- Relevant alerts
- Relevant incidents
- Relevant map context
- Recent activity

### 4.2 Adaptive node selection

When a node is selected, the application shall load its type-specific monitoring definition.

Conceptual configuration:

```ts
type NodeType =
  | 'FIRE'
  | 'FLOOD'
  | 'AQI'
  | 'LANDSLIDE'
  | 'INDUSTRIAL'
```

The node definition should specify:

- Available measurements
- Units
- Chart types
- Threshold definitions where configured
- Derived metrics
- Relevant map layers
- Relevant actions

---

## 5. Live Telemetry Requirements

### 5.1 Stream connection

The client shall open a persistent live connection after authentication or guest public-session initialization as appropriate.

### 5.2 Event handling

The client shall accept normalized events similar to:

```json
{
  "type": "SENSOR_READING",
  "nodeId": "FN-001",
  "nodeType": "FIRE",
  "metric": "temperature",
  "value": 43.8,
  "unit": "C",
  "timestamp": "2026-09-28T09:21:14Z"
}
```

### 5.3 Sensor batching

The edge may batch or sample events when required for transport efficiency, but the PWA shall preserve ordering and timestamps.

### 5.4 Stale data

Each metric shall have a freshness state determined from its timestamp and configured tolerance.

Possible display states:

- Live
- Delayed
- Stale
- Unknown

A stale metric must not be presented as live.

---

## 6. Live Chart Requirements

Each supported metric can have a live chart configuration.

```ts
interface LiveMetric {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  timestamp: string | null;
  status: 'live' | 'delayed' | 'stale' | 'unknown';
}
```

The chart component shall:

- Accept streaming points.
- Maintain a bounded point buffer.
- Draw without replacing unrelated application state.
- Handle missing points.
- Handle sensor disconnects.
- Display the current numeric value alongside the chart.
- Show the time window clearly.
- Support LIVE and historical modes.

Recommended initial live window: 60-120 seconds, configurable.

---

## 7. Fire Node Functional Requirements

The Fire Node page shall support:

### Monitoring

- Temperature
- Humidity
- Smoke/gas level
- Camera availability
- GPS/location
- Battery and connectivity where available

### Live visualization

- Temperature fluctuation graph
- Smoke/gas graph
- Humidity graph
- Event markers

### Analysis

- Fire confidence, when produced by the edge/model layer
- Severity state
- Flame/smoke visual-detection state
- Trend information

### Incident response

- Open incident
- View incident on map
- View relevant camera evidence
- Notify/route to authorized operational users
- View official status

---

## 8. Flood Node Requirements

The Flood Node view shall support:

- Water level live graph
- Rainfall live graph
- Rate-of-rise visualization
- Flood risk state
- Current and predicted flood zones
- Relevant shelters and infrastructure on the map

---

## 9. AQI Node Requirements

The AQI view shall support:

- AQI value
- PM2.5 live graph
- PM10 live graph
- Configured pollutant graphs
- Exposure trend
- Local air-quality status
- Historical trend

---

## 10. Landslide Node Requirements

The Landslide view shall support:

- Soil moisture live graph
- Tilt live graph
- Vibration/event visualization
- Movement rate
- Rainfall context where available
- Risk state
- Relevant map overlays

---

## 11. Industrial Node Requirements

The Industrial view shall support:

- Gas concentration graphs
- PM graphs
- Temperature context
- Anomaly state
- Exposure risk state
- Affected area map when available

---

## 12. Incidents

An incident record shall contain at minimum:

```text
Incident ID
Hazard type
Node ID
Location
Created time
Last updated time
Severity
Lifecycle status
Evidence references
Source types
Assigned workers
Authority status
```

### Incident lifecycle

`OBSERVED -> ANALYZING -> ALERTED -> ACKNOWLEDGED -> RESPONDING -> RESOLVED`

Transitions shall be role-authorized.

---

## 13. Alerts

Alerts shall be generated from configured event rules at the edge or backend.

The PWA shall support:

- Alert feed
- Alert detail
- Read/acknowledge state where permitted
- Priority/severity
- Source
- Timestamp
- Affected area
- Action/instruction

Public-facing alerts must be filtered to information approved for public display.

---

## 14. Map Functions

The map shall support layers based on permissions and selected node type.

Common layers:

- Nodes
- Incidents
- Public safe zones
- Shelters
- Roads

Specialized layers may include:

- Fire risk/spread
- Flood inundation
- Air-quality intensity
- Landslide risk
- Industrial exposure

Map updates from live events should not require a complete page reload.

---

## 15. Worker Functions

Authorized workers shall be able to:

- View assigned incidents.
- See incident details.
- Open navigation.
- Receive alerts.
- Submit text reports.
- Submit image/video/audio where supported.
- Share location where explicitly enabled.
- Update incident status within permission scope.
- Request assistance.

---

## 16. Authority Functions

Authorities shall be able to:

- View operational nodes.
- Review live telemetry.
- Review model outputs.
- Review worker reports.
- Create/modify authorized alerts.
- Assign workers.
- Manage response actions.
- Review evacuation planning information.
- Publish official instructions where authorized.

---

## 17. Admin Functions

Admins shall be able to:

- Create/disable users.
- Assign roles according to authorization policy.
- Register nodes.
- Modify node metadata.
- Monitor edge connectivity.
- Monitor system services.
- Review audit logs.
- Configure non-code operational settings within approved boundaries.

Sensitive model or safety thresholds should not be freely editable by ordinary users.

---

## 18. Citizen Functions

Citizens shall be able to:

- View public hazards.
- View nearby public alerts.
- View safe zones and shelters.
- Read official instructions.
- Use the public chatbot.
- Submit incident reports.
- Receive notifications when supported and consented.

Citizen telemetry views should expose only approved public information.

---

## 19. Offline Behavior

When internet connectivity is lost:

1. The service worker shall continue serving the installed application shell.
2. Previously synchronized public or role-authorized data shall remain accessible according to retention policy.
3. The UI shall clearly show the connection state.
4. Local edge connectivity shall be treated independently from cloud connectivity.
5. Queued user reports may be submitted later when permitted.
6. Stale data shall display its timestamp.

---

## 20. Error Handling

The system shall handle:

- Sensor missing
- Invalid reading
- Out-of-range reading
- Duplicate event
- Out-of-order event
- Node offline
- Edge offline
- WebSocket disconnect
- Historical query failure
- Map tile failure
- Authentication expiry
- Unauthorized action

The interface should explain what failed without exposing internal stack traces.

---

## 21. Acceptance Tests

### Live Fire chart

Given Fire Node FN-001 is online, when temperature readings change at the edge, the open Fire Node page shall display the new points without a manual refresh.

### Adaptive node page

Given a user switches from Fire Node to Flood Node, Fire-specific metrics shall disappear and Flood-specific metrics shall appear according to the node configuration.

### Role separation

Given a Citizen views a fire incident, internal worker assignment controls shall not be available.

### Node failure

Given no telemetry is received beyond the configured freshness window, the node shall show stale/offline state rather than continue displaying the last value as live.

### Offline operation

Given cloud connectivity is unavailable but the local edge remains reachable, the PWA shall continue receiving local live events.
