# R-TRACE — Project Intelligence Brain

> **This document is the living project memory for R-TRACE.**
> It is updated after every iteration. Do not delete. Do not move.
> Every implementation phase must update this file.

---

## Meta

| Field | Value |
|---|---|
| Last Updated | 2026-09-28T16:34:00+05:30 |
| Current Phase | Phase 8 Complete (Phases 0 through 8 executed and verified) |
| Code Exists | YES |
| Files Modified This Session | 45+ source files created and wired |
| Active Framework | React 18 + TypeScript + Vite + Zustand + React Query |
| Git Initialized | YES |
| Master Plan | MASTER_IMPLEMENTATION_PLAN.md |

---

## Table of Contents

1. [What R-TRACE Is](#1-what-r-trace-is)
2. [What R-TRACE Must Become](#2-what-r-trace-must-become)
3. [Document Summary](#3-document-summary)
4. [Current Architecture](#4-current-architecture)
5. [Current Data System](#5-current-data-system)
6. [Current Node System](#6-current-node-system)
7. [Current Authentication](#7-current-authentication)
8. [Current PWA and Offline Capabilities](#8-current-pwa-and-offline-capabilities)
9. [Real-Time Readiness](#9-real-time-readiness)
10. [Design Compliance Status](#10-design-compliance-status)
11. [File Structure Assessment](#11-file-structure-assessment)
12. [Documentation vs Code Conflicts](#12-documentation-vs-code-conflicts)
13. [Implementation Readiness](#13-implementation-readiness)
14. [Anti-Patterns to Never Introduce](#14-anti-patterns-to-never-introduce)
15. [Node Type Reference](#15-node-type-reference)
16. [Data Contracts Reference](#16-data-contracts-reference)
17. [Role Reference](#17-role-reference)
18. [Alert and Incident Lifecycle](#18-alert-and-incident-lifecycle)
19. [Design Primitives Reference](#19-design-primitives-reference)
20. [Iteration Log](#20-iteration-log)

---

## 1. What R-TRACE Is

**R-TRACE** stands for **Resilient Multi-Hazard Environmental Intelligence Network**.

It is currently a **pre-implementation, greenfield specification repository**.

The workspace at `c:\Users\ASUS HN116WS\OneDrive\Desktop\R-Trace` contains:
- `PRD.md` — Product Requirements Document
- `FRD.md` — Functional Requirements Document
- `DESIGN.md` — Design System and Visual Direction
- `RULES.md` — Engineering and Product Rules
- `brain.md` — This file

No source code, no framework, no `package.json`, no `src/`, no `.git` exists yet.

---

## 2. What R-TRACE Must Become

An **offline-first, real-time Progressive Web App (PWA)** serving as the human-facing operational interface for a distributed physical multi-hazard environmental sensor network.

### Core Operative Principle

```
Operational Interface = f(userRole, selectedNodeType)
```

The UI does not swap text labels. The entire information hierarchy, charts, actions, and map layers change based on both inputs simultaneously.

### Key System Qualities

| Quality | Definition |
|---|---|
| Adaptive | Interface restructures for each combination of role + node type |
| Real-Time | Live telemetry via WebSocket from regional edge processors |
| Offline-First | Service Worker caching + local storage; edge connectivity survives cloud loss |
| Role-Controlled | Server-enforced permissions; frontend renders only what is permitted |
| Provenance-Strict | Sensor reading, model prediction, field report, and authority action are always visually distinct |
| Purpose-Built | Must not resemble a generic SaaS dashboard or AI marketing template |

### End-to-End Intended Data Path

```
Physical Sensor (ESP32)
  -> MQTT
  -> Regional Edge Processor (local)
  -> Sensor Fusion + Model Analysis
  -> WebSocket Event
  -> PWA Live Chart / Alert / Map Update
  -> Role-specific View
```

---

## 3. Document Summary

### 3.1 PRD.md (Product Requirements Document)

- Establishes product identity: one coherent PWA, not separate hazard apps
- Defines 5 target users: Admin, Authority, Disaster Worker, Citizen, Guest
- Establishes 5 hazard node types: Fire, Flood, AQI, Landslide, Industrial
- Flags Fire Node as the primary SIH judging demonstrator
- Mandates WebSocket for live telemetry; REST only for non-streaming operations
- Defines PWA install/cache/reconnect requirements
- Lists 10 Product Principles (live before decorative, evidence before interpretation, local resilience before cloud dependence, etc.)
- Establishes Non-Goals (no separate apps per hazard, no continuous video streams, no AI as final authority)

### 3.2 FRD.md (Functional Requirements Document)

- Contains 20 prioritized Functional Requirements (FR-001 to FR-020)
- Defines normalized sensor event contract:

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

- Defines LiveMetric TypeScript interface
- Defines 4 telemetry freshness states: live | delayed | stale | unknown
- Defines incident lifecycle: OBSERVED -> ANALYZING -> ALERTED -> ACKNOWLEDGED -> RESPONDING -> RESOLVED
- Documents per-node-type sensor requirements (Fire, Flood, AQI, Landslide, Industrial)
- Documents per-role functional boundaries (Admin, Authority, Worker, Citizen)
- Lists 5 acceptance test cases

### 3.3 DESIGN.md (Design System and Visual Direction)

- Visual positioning: precise, calm, dense, hierarchical, geographic, technically legible
- Hard prohibitions: purple/blue AI gradients, emojis as icons, bulk Lucide import, AI badge labels, AI-style headings, decorative components without user need, mock data in live demos
- Color is semantic: neutral base, hazard colors only for hazard states
- 6 semantic states: Normal, Warning, Critical, Offline, Stale, Unknown (never display Offline as green)
- 3-region desktop layout: Navigation Rail | Main Workspace+Map+Charts | Context+Alerts+Timeline
- 15 core design primitives
- Motion: only functional state change; no looping decorative animation
- Responsive: deliberate re-prioritization for mobile, not just column collapse

### 3.4 RULES.md (Engineering and Product Rules)

- One coherent PWA; never separate mini-apps per hazard
- WebSocket preferred for edge-to-PWA; MQTT preferred for sensor-to-edge
- No polling when persistent stream is available
- Automatic reconnect after transient WebSocket failure
- Bounded client-side buffers for live charts; update only affected components
- Server determines roles; client must never infer elevated permissions
- Stale data must display its timestamp; never display stale as live
- Code: modular by capability; shared configured primitives over copies; separate ingestion from display model; separate API/WS clients from UI components
- 8-point quality gate before merging any UI component

### 3.5 ARCHITECTURE FOR NO WAGE AND UNWANTED FILE CREATION.md

**STATUS: PHYSICALLY MISSING FROM REPOSITORY**
- Named in the project brief as the 5th authoritative planning document
- Does not exist in the repository or anywhere on the machine
- Core intent inferred from RULES.md sections 13 and 16: zero unnecessary file creation, zero premature abstraction, lean modular architecture
- ACTION REQUIRED: Ask user to locate or recreate this document before scaffolding

---

## 4. Current Architecture

| Layer | Status |
|---|---|
| Frontend Framework | NONE |
| Build System / Bundler | NONE |
| Directory Structure | Root-only (4 markdown docs + brain.md) |
| Routing | NONE |
| State Management | NONE |
| Component Library | NONE |
| API Client | NONE |
| WebSocket Client | NONE |
| Service Worker | NONE |
| PWA Manifest | NONE |
| Database / Storage | NONE |
| Authentication Layer | NONE |
| Backend / Server | NONE |
| Git Version Control | NONE |

---

## 5. Current Data System

| Aspect | Status |
|---|---|
| Mock Data Files | NONE |
| Real Sensor Data | NONE |
| Event Schemas Defined | YES (in FRD.md) |
| TypeScript Interfaces | NOT YET CODED |
| Data Stores | NONE |
| WebSocket Data Feed | NONE |
| REST API Client | NONE |
| IndexedDB / LocalStorage Layer | NONE |

Readiness for future real-time ingestion:
- Conceptually: HIGH — contracts are fully defined in FRD.md sections 5.2 and 6
- Implementation: ZERO — no ingestion, buffering, or subscription code exists

---

## 6. Current Node System

| Aspect | Status |
|---|---|
| Node type union defined | YES (documentation only) |
| Node type schemas coded | NO |
| Node selector UI | NO |
| Adaptive monitoring view | NO |
| Per-type metric configuration | NO |
| Node health monitoring | NO |

Node Type Union (as documented):

```typescript
type NodeType = 'FIRE' | 'FLOOD' | 'AQI' | 'LANDSLIDE' | 'INDUSTRIAL'
```

---

## 7. Current Authentication

| Aspect | Status |
|---|---|
| Login form | NONE |
| Session management | NONE |
| JWT / OAuth integration | NONE |
| Role-based route guards | NONE |
| Server-side role enforcement | NONE |
| Guest public routes | NONE |
| Mock users / stubs | NONE |

Roles documented: ADMIN | AUTHORITY | WORKER | CITIZEN + unauthenticated GUEST

---

## 8. Current PWA and Offline Capabilities

| Capability | Status |
|---|---|
| manifest.json | NONE |
| Service Worker registration | NONE |
| App shell caching | NONE |
| IndexedDB / CacheStorage layer | NONE |
| Online/offline event handler | NONE |
| Edge vs cloud connection state tracker | NONE |
| Stale data timestamp display | NONE |
| Queued actions (offline submit buffer) | NONE |

---

## 9. Real-Time Readiness

| Feature | Documented Requirement | Implementation Status |
|---|---|---|
| MQTT | Sensor-to-edge communication (ESP32 to gateway) | NOT IMPLEMENTED (hardware/edge layer) |
| WebSocket Client | Edge-to-PWA persistent live stream | NOT IMPLEMENTED |
| Bounded Chart Buffer | Live chart appending without re-render cascade | NOT IMPLEMENTED |
| Metric Freshness Classifier | live / delayed / stale / unknown | NOT IMPLEMENTED |
| Connection State Indicator | UI showing edge/cloud status | NOT IMPLEMENTED |
| Auto-Reconnect | Recover from transient WebSocket failure | NOT IMPLEMENTED |
| REST HTTP Client | Auth, node metadata, historical data, reports | NOT IMPLEMENTED |
| Hardware Integration | ESP32 sensor telemetry physical path | NOT IMPLEMENTED |

---

## 10. Design Compliance Status

Current state: CLEAN SLATE — no implementation exists to violate or comply with.

On implementation, the following must be verified:

| Rule | Watch For |
|---|---|
| No purple/blue AI gradients | Any gradient that reads "AI/tech brand" |
| No emoji in interface | Zero emoji anywhere in icons, labels, or indicators |
| No default Lucide everywhere | Each icon must have a justification |
| No AI marketing labels | No "Powered by AI", "Smart Analysis", "Intelligent Mode" anywhere |
| Semantic colors only | No decorative color that does not communicate state |
| 3-region layout | Navigation Rail / Main Workspace / Context Panel |
| 6 state types | Normal, Warning, Critical, Offline, Stale, Unknown — visually distinct |
| Stale is not green | A disconnected/stale node must never appear healthy |
| 15 primitives used | Build from primitives, not one-off cards |
| Units always shown | Every physical measurement displays unit adjacent to value |
| Timestamps always shown | Every live sensor value shows its source timestamp |

---

## 11. File Structure Assessment

### Current State

```
C:\Users\ASUS HN116WS\OneDrive\Desktop\R-Trace\
├── brain.md              <- This file (created iteration 0)
├── DESIGN.md             <- Visual & Design System (9,533 bytes)
├── FRD.md                <- Functional Requirements (10,935 bytes)
├── PRD.md                <- Product Requirements (10,532 bytes)
└── RULES.md              <- Engineering & Product Rules (7,420 bytes)
```

- No Git repository
- No source directories
- No configuration files
- Completely clean — zero unnecessary files

### Expected Future Minimal Structure (reference only — NOT created yet)

```
R-Trace/
├── brain.md
├── PRD.md / FRD.md / DESIGN.md / RULES.md
├── package.json
├── [bundler config]
├── public/
|   ├── manifest.webmanifest
|   └── [icons]
├── src/
|   ├── types/            <- Node, Metric, Role, Incident schemas
|   ├── shell/            <- App shell, nav rail, header, status strip
|   ├── nodes/            <- Adaptive node views (fire, flood, aqi, landslide, industrial)
|   ├── charts/           <- Live chart primitive
|   ├── map/              <- Map layer system
|   ├── incidents/        <- Incident lifecycle UI
|   ├── alerts/           <- Alert feed
|   ├── auth/             <- Login, session, role resolver
|   ├── realtime/         <- WebSocket client + buffer manager
|   ├── api/              <- REST client
|   ├── offline/          <- Service worker, cache strategy, queue
|   └── sw.js             <- Service worker entry
```

---

## 12. Documentation vs Code Conflicts

| # | Conflict Description |
|---|---|
| 1 | "Existing project" vs greenfield: The project brief instructs inspection of "existing routes, existing components, existing mock data." In reality, ZERO source code exists. The repository is documentation-only. |
| 2 | Missing 5th document: ARCHITECTURE FOR NO WAGE AND UNWANTED FILE CREATION.md is named as an authoritative document in the project brief but does not exist in the repository or anywhere on the machine. |
| 3 | No Git initialization: Planning documents exist but no version control is present. |

---

## 13. Implementation Readiness

### Ready (Specification Complete)

- Node type taxonomy and per-type sensor schemas (PRD.md section 7)
- Normalized sensor event contract (SENSOR_READING shape, FRD.md section 5.2)
- LiveMetric TypeScript interface (FRD.md section 6)
- Metric freshness state model (live | delayed | stale | unknown, FRD.md section 5.4)
- Incident lifecycle states (FRD.md section 12)
- Role definitions and per-role functional boundaries (FRD.md sections 15 to 18)
- Design system primitives list (DESIGN.md section 15)
- Desktop layout architecture (DESIGN.md section 6)
- Color semantic token strategy (DESIGN.md section 4)
- 5 acceptance test criteria (FRD.md section 21)
- 20 functional requirements (FRD.md section 2)

### Not Started

- Project scaffolding (framework, bundler, package manager)
- TypeScript type definitions
- Design token system
- App shell and navigation rail
- Header and status strip
- Adaptive node container and node selector
- All 5 node-specific monitoring views
- Live chart primitive with bounded buffer
- Map integration with layer system
- Authentication (login, session, role resolver, route guards)
- WebSocket client and reconnect logic
- REST API client
- Service Worker and PWA manifest
- Offline storage and queue layer
- Alert feed and incident lifecycle UI
- Worker field report submission
- Authority alert/instruction publishing

### Must NOT Be Changed Unnecessarily

- Do not build separate apps per hazard
- Do not introduce UI kit dependencies that violate the design rules
- Do not introduce polling mechanisms when WebSocket is available
- Do not trust client-side role inference
- Do not use decorative animation or glass effects
- Do not split the specification documents

---

## 14. Anti-Patterns to Never Introduce

| Category | Prohibited Pattern |
|---|---|
| Gradients | Purple-to-blue, blue-to-purple, rainbow, gradient text, gradient borders as decoration |
| Icons | Emoji as UI icons; unintentional bulk Lucide import |
| Labels | "AI Powered", "Smart Analysis", "Intelligent Mode", "Neural Overview", "Copilot" |
| Headings | "Intelligence Hub", "Next-Gen Analytics", "AI Command Center" |
| Layout | Giant centered hero inside operational screens; identical card grids; endless shadows |
| Effects | Glassmorphism everywhere; decorative particles; constant background motion |
| State | Displaying stale/offline node as green/healthy |
| Data | Fabricating node IDs, coordinates, or readings in production |
| Code | Business logic inside chart presentational components; API clients mixed with UI |
| Files | Unnecessary helper files, one-off utilities, boilerplate clutter |

---

## 15. Node Type Reference

### Fire Node (Primary SIH Flagship)

| Sensor | Unit | Live Chart |
|---|---|---|
| Temperature | C | YES |
| Humidity | % RH | YES |
| Smoke/Gas Level | ppm or index | YES |
| Camera Status | event | Event-triggered |
| GPS | lat/lng | Map overlay |
| Battery/Power | V or % | Status strip |
| Connectivity | state | Status strip |

Derived Intelligence:
- Fire Confidence (%) — model output, must be labeled as such
- Severity State: normal, watch, warning, critical
- Flame/Smoke Visual Detection — camera event
- Predicted Risk Zone — map polygon overlay

---

### Flood Node

| Sensor | Unit | Live Chart |
|---|---|---|
| Water Level | cm or m | YES |
| Rainfall | mm/hr | YES |
| Temperature | C | YES |
| GPS | lat/lng | Map overlay |

Derived Intelligence:
- Rate of Rise (cm/min)
- Flood Risk State
- Predicted Inundation Area — map polygon

---

### AQI Node

| Sensor | Unit | Live Chart |
|---|---|---|
| PM2.5 | ug/m3 | YES |
| PM10 | ug/m3 | YES |
| Gas Pollutants (configured) | ppm | YES |
| Temperature | C | YES |
| Humidity | % RH | YES |
| GPS | lat/lng | Map overlay |

Derived Intelligence:
- AQI Value (index)
- Pollutant Contribution breakdown
- Exposure Trend
- Local Risk State

---

### Landslide Node

| Sensor | Unit | Live Chart |
|---|---|---|
| Soil Moisture | % | YES |
| Tilt | degrees | YES |
| Vibration | g or event | YES |
| Temperature | C | YES |
| Rainfall (where available) | mm/hr | YES |
| GPS | lat/lng | Map overlay |

Derived Intelligence:
- Movement Rate
- Slope Anomaly State
- Instability State
- Risk Zone — map overlay

---

### Industrial Node

| Sensor | Unit | Live Chart |
|---|---|---|
| SO2 | ppm | YES |
| NO2 | ppm | YES |
| CO and other configured gases | ppm | YES |
| PM measurements | ug/m3 | YES |
| Temperature | C | YES |
| GPS | lat/lng | Map overlay |

Derived Intelligence:
- Gas Anomaly State
- Exposure Risk Level
- Affected Area — map polygon
- Hazard Severity

---

## 16. Data Contracts Reference

### Normalized Sensor Event (FRD.md section 5.2)

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

### LiveMetric Interface (FRD.md section 6)

```typescript
interface LiveMetric {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  timestamp: string | null;
  status: 'live' | 'delayed' | 'stale' | 'unknown';
}
```

### NodeType Union (FRD.md section 4.2)

```typescript
type NodeType = 'FIRE' | 'FLOOD' | 'AQI' | 'LANDSLIDE' | 'INDUSTRIAL'
```

### Incident Record Fields (FRD.md section 12)

```
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

---

## 17. Role Reference

| Role | Key Permissions |
|---|---|
| ADMIN | Create/disable users, assign roles, register nodes, monitor edge, audit logs, configure settings |
| AUTHORITY | View operational nodes, review telemetry, create/modify alerts, assign workers, publish official instructions |
| WORKER | View assigned incidents, submit field reports, send evidence, share location (explicit consent), update incident status within scope |
| CITIZEN | View public hazards, public alerts, safe zones, shelters, chatbot, submit public incident reports |
| GUEST | Safety-critical public information only, no account required |

Hard Rules:
- Server determines and enforces all roles
- Client must not infer elevated permissions
- Guest access must never expose private operational information
- Sessions expire according to chosen auth provider security model

---

## 18. Alert and Incident Lifecycle

### Incident Lifecycle

```
OBSERVED -> ANALYZING -> ALERTED -> ACKNOWLEDGED -> RESPONDING -> RESOLVED
```

- Authority-controlled state transitions are visually distinct from automated analytical states
- Role authorization is required for lifecycle transitions

### Alert Fields

```
Incident ID
Node ID
Hazard type
Timestamp
Location
Severity
Source (sensor / model / report / authority)
Confidence (where applicable)
Recommended or official action
Current lifecycle status
```

---

## 19. Design Primitives Reference

| Primitive | Purpose |
|---|---|
| App Shell | Outer container; hosts all panels |
| Navigation Rail | Left sidebar; role-adaptive; node selector entry |
| Header | System state, identity, account access |
| Status Strip | Connection state, last-sync time, edge/cloud health |
| Metric Block | A single measurement: label + value + unit + timestamp + freshness state |
| Live Chart | Streaming line chart: bounded buffer, metric name, unit, time scale, update state |
| Node Selector | Browsable list of nodes by type; shows health state inline |
| Alert Row | Single alert in feed: severity, source, timestamp, summary, action |
| Incident Row | Single incident: ID, node, type, status, last update |
| Timeline | Chronological event log with source labels |
| Map Layer Control | Toggle and legend for each map overlay |
| Evidence Panel | Camera or media evidence associated with an incident/event |
| Action Group | Context-specific role-permitted actions: acknowledge, assign, resolve |
| Data Table | Sortable/filterable structured data: historical, audit, nodes list |
| Connection Indicator | Edge and cloud connectivity state: live / delayed / stale / offline |

---

## 20. Iteration Log

| Iteration | Date | Phase | Summary | Files Modified |
|---|---|---|---|---|
| 0 | 2026-09-28T12:31:33+05:30 | Project Understanding | Read all 4 planning docs. Confirmed greenfield — zero source code exists. 5th architecture doc is missing. Produced full analysis. | brain.md created |
| 1 | 2026-09-28T15:02:33+05:30 | Master Implementation Plan | Produced MASTER_IMPLEMENTATION_PLAN.md. 18 ordered phases defined. Fire Node vertical slice designed. Data contracts specified. Offline/sync/security/performance plans complete. No code written. | brain.md updated |
| 2 | 2026-09-28T16:34:00+05:30 | Core Architecture & Vertical Slice (Phases 0–8) | Scaffolded React 18 + TS + Vite. Built complete domain types (Phase 1), CSS design tokens & typography (Phase 2), Auth & Role guards with mock fallback (Phase 3), Three-region AppShell & all operational routes (Phase 4), Mock/Live Data Abstraction layer (Phase 5), Declarative Node Registry & Adaptive Node Container for all 5 hazard types (Phase 6), Real-time WebSocket client, backoff reconnect, freshness classifier, bounded buffer & Zustand live/connection stores (Phase 7), HTML5 canvas streaming LiveChart & MetricBlock primitives with full Fire Node FN-001 vertical slice (Phase 8). Both typecheck and production build pass with 0 errors. | 45+ files created/modified |

---

*End of brain.md — Updated every iteration.*
