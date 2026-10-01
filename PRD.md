# R-TRACE PWA Product Requirements Document

## 1. Product Identity

**Product:** R-TRACE Resilient Multi-Hazard Environmental Intelligence Network

**Product surface:** Offline-first Progressive Web App (PWA)

**Primary concept:** A single operational application that adapts its information architecture and controls according to the authenticated user's role and the selected environmental node type.

**Core principle:** The PWA is the human-facing operational layer of the R-TRACE system. It receives near-real-time telemetry and events from the regional edge, presents node-specific intelligence, supports disaster response workflows, and remains useful when cloud connectivity is unavailable.

---

## 2. Problem Statement

R-TRACE collects data from distributed multi-hazard sensor nodes, but raw readings alone are not useful to citizens, responders, or authorities. The application must turn live sensor streams into understandable, location-aware operational information without forcing every user through the same generic dashboard.

The product must solve five problems:

1. Provide a reliable real-time view of field conditions.
2. Adapt the interface to the selected node type instead of displaying irrelevant metrics.
3. Adapt access and actions to user role.
4. Continue operating through intermittent or absent cloud connectivity.
5. Clearly separate live sensor data, model-based analysis, field reports, and official authority decisions.

---

## 3. Product Goals

### Primary goals

- Deliver near-real-time node telemetry to the PWA with minimum practical latency.
- Provide a common application shell with adaptive node-specific views.
- Support Admin, Authority, Disaster Worker, Citizen, and Guest experiences.
- Provide live charts for the measurements relevant to each node.
- Provide incident, alert, map, report, and response workflows.
- Support offline-first operation through service-worker caching and local data storage.
- Keep the interface professional, information-dense, calm, and purpose-built.
- Make the hardware-to-software data path demonstrable during SIH judging.

### Secondary goals

- Provide historical sensor analysis.
- Provide node health and connectivity monitoring.
- Provide AI/model outputs where appropriate without presenting them as facts or official decisions.
- Synchronize local edge state with the central cloud when connectivity returns.

---

## 4. Non-Goals

The first release does not attempt to:

- Replace government emergency command systems.
- Automatically issue official evacuation orders without authorized human action.
- Depend entirely on cloud services for essential monitoring.
- Build separate web applications for every node type.
- Present every sensor metric to every user.
- Treat AI confidence as equivalent to official confirmation.
- Continuously stream high-bandwidth video from every camera under all conditions.

---

## 5. Target Users

### Admin

Manages nodes, users, system health, permissions, configuration, audit information, and platform-level settings.

### Authority

Monitors active incidents, reviews intelligence, coordinates resources and workers, and publishes authoritative instructions or alerts.

### Disaster Worker

Receives assignments, views relevant live conditions, navigates to incidents, sends field reports, and communicates with the authority layer.

### Citizen

Receives public hazard information, alerts, safe-zone information, official instructions, and can submit reports.

### Guest

Can access safety-critical public information without creating an account, subject to the public-information policy.

---

## 6. Core Product Experience

The application has one shared shell:

- Identity and role context
- Node/incident selector
- Live status
- Map
- Alerts
- Activity or event timeline
- Offline/connectivity state
- User account area

The content inside that shell changes based on two factors:

`userRole + selectedNodeType`

For example:

`Authority + Fire Node` produces a fire operational view.

`Citizen + the same Fire Node` produces a simplified public safety view.

The application must never force users to interpret raw, irrelevant telemetry.

---

## 7. Node Types

The initial node taxonomy is:

### Fire Node

Representative data:

- Smoke/gas level
- Temperature
- Humidity
- GPS
- Camera status and event imagery
- Connectivity
- Battery/power state

Derived intelligence may include:

- Fire confidence
- Severity
- Sensor anomaly
- Flame/smoke visual detection
- Predicted risk zone

### Flood Node

Representative data:

- Water level
- Rainfall
- Temperature
- GPS
- Connectivity
- Battery/power state

Derived intelligence may include:

- Water-level trend
- Rate of rise
- Flood risk state
- Predicted inundation area

### AQI Node

Representative data:

- PM2.5
- PM10
- Gas pollutants
- Temperature
- Humidity
- GPS

Derived intelligence may include:

- AQI
- Pollutant contribution
- Exposure trend
- Local risk state

### Landslide Node

Representative data:

- Soil moisture
- Tilt
- Vibration
- Temperature
- GPS
- Rainfall where available

Derived intelligence may include:

- Movement rate
- Slope anomaly
- Instability state
- Risk zone

### Industrial Node

Representative data:

- SO2
- NO2
- CO/other configured gases
- PM measurements
- Temperature
- GPS

Derived intelligence may include:

- Gas anomaly
- Exposure risk
- Affected area
- Hazard severity

---

## 8. Real-Time Requirements

### Data transport

Live telemetry must use a persistent event channel such as WebSocket from the regional edge to the PWA.

HTTP/REST is reserved for non-streaming operations such as:

- Authentication
- Node metadata
- Historical queries
- Reports
- Configuration
- User data

MQTT remains the preferred sensor-to-edge transport.

### Live graph requirements

Every node type must expose the relevant live metrics as streaming charts.

The UI must:

- Append incoming points without full-page reloads.
- Maintain a bounded client-side time window.
- Update only affected visual components.
- Preserve the chart while new data arrives.
- Show timestamps and units.
- Clearly distinguish live mode from historical mode.
- Show a stale-data or disconnected state instead of silently freezing.

### Latency principle

The product target is **minimum practical latency**, not a claim of zero latency. Actual end-to-end latency must be measured across sensing, transmission, edge processing, WebSocket delivery, and browser rendering.

---

## 9. PWA Requirements

The application must:

- Install from supported browsers.
- Work on desktop and mobile layouts.
- Cache the core application shell.
- Persist selected recent data locally where appropriate.
- Recover gracefully after network interruption.
- Reconnect live channels automatically.
- Surface edge/cloud connectivity state.
- Avoid destructive assumptions when data becomes stale.

Offline state must distinguish among:

- Live edge connection
- Live cloud connection
- Recently synchronized
- Local-only/offline
- Node itself offline

---

## 10. Authentication and Authorization

Authentication must be role-driven and server-enforced.

Roles:

`ADMIN | AUTHORITY | WORKER | CITIZEN`

Guest access is a public route, not a privileged role.

Frontend route protection is not sufficient. Backend/API/data-layer authorization must enforce permissions.

Example:

- Citizen can view public hazard information.
- Authority can view operational data and publish authorized instructions.
- Worker can access assigned incidents and submit reports.
- Admin can manage users and nodes.

---

## 11. Public Safety Model

The product must preserve information provenance.

Every consequential message should identify its source category where relevant:

- Live sensor data
- Model-based prediction
- Disaster worker report
- Official authority decision

Example:

`Fire confidence: 91%` is a model output.

`Evacuation order issued` is an official authority decision.

The interface must never visually blur these into one undifferentiated status.

---

## 12. Alerts

Alerts must be event-driven rather than dependent on repeatedly refreshing a page.

An alert can contain:

- Incident ID
- Node ID
- Hazard type
- Timestamp
- Location
- Severity
- Source
- Confidence where applicable
- Recommended or official action
- Current lifecycle status

Example lifecycle:

`OBSERVED -> ANALYZING -> ALERTED -> ACKNOWLEDGED -> RESPONDING -> RESOLVED`

Authority-controlled states must be explicitly separated from automated analytical states.

---

## 13. Maps

Maps are central to R-TRACE.

The PWA should support:

- Node locations
- Active incidents
- Hazard zones
- Predicted spread/inundation/risk overlays
- Shelters and safe zones
- Relevant infrastructure
- Worker locations for authorized users
- Incident selection from the map

The map should not become decorative. It must support actual operational decisions and navigation.

---

## 14. Fire Node Flagship Experience

The Fire Node should be the primary demonstrator for the end-to-end system.

Expected flow:

`Sensor change -> ESP32 -> transport -> edge processing -> sensor fusion -> camera event -> fire analysis -> WebSocket event -> live PWA graph -> incident -> map update -> role-specific alert`

The PWA must make this sequence visible during a demonstration.

---

## 15. Success Criteria

The first SIH-ready version is successful when:

- A physical node can produce telemetry that appears in the PWA without manual refresh.
- The Fire Node chart visibly responds to changing sensor values.
- Selecting a different node type changes the metrics and visual hierarchy.
- Different users see different permissions and actions.
- A node can appear online, degraded, or offline.
- An incident can be created from live conditions.
- The incident appears on the map and relevant role views.
- The PWA remains usable after cloud disconnection when a local edge connection is available.
- The interface looks like a purpose-built operational product rather than a generic AI-generated dashboard.

---

## 16. Product Principles

1. Live before decorative.
2. Context before density.
3. Evidence before interpretation.
4. Local resilience before cloud dependence.
5. Role-based information over universal dashboards.
6. Explicit state over ambiguous status.
7. Fast interactions over ornamental animation.
8. Deliberate typography over trendy UI patterns.
9. Real data paths over mock-data theater.
10. One coherent system instead of a collection of disconnected screens.
