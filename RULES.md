# R-TRACE PWA Rules

## 1. Product Rules

1. Build one coherent R-TRACE PWA, not separate mini-apps for each hazard.
2. The UI must adapt to both **user role** and **node type**.
3. Real-time telemetry is a first-class feature.
4. Offline-first behavior is a product requirement, not a future enhancement.
5. The local edge is allowed to remain useful when the cloud is unavailable.

---

## 2. No-AI-Slop Rules

### Forbidden by default

- Generic purple/blue AI gradients.
- Gradient text.
- Neon cyberpunk styling.
- Excessive glassmorphism.
- Excessive rounded rectangles.
- Giant centered hero layouts inside the app.
- Emoji as UI icons.
- Default Lucide icons everywhere.
- Decorative AI pills.
- Generic AI subheadings.
- Fake command-center language.
- Floating cards without an information reason.
- Endless shadows.
- Excessive blur.
- Excessive glass effects.
- Decorative particles.
- Generic chatbot-first layouts.
- Repeated labels such as "AI Powered" that do not add information.
- Random gradients used to imply intelligence.
- Mock charts with fabricated readings during actual demonstrations.

### Required instead

- Concrete language.
- Strong information hierarchy.
- Purpose-built layouts.
- Stable visual semantics.
- Real sensor data.
- Explicit timestamps.
- Explicit source/provenance.
- Functional maps.
- Clear state changes.

---

## 3. Icon Rules

1. Never use emoji as a substitute for proper interface iconography.
2. Do not blindly install or import a large icon set for one or two controls.
3. Prefer custom SVG marks or a deliberately selected icon family.
4. Icons must have a clear semantic role.
5. Icon style, stroke weight, corner treatment, and visual scale must remain consistent.

---

## 4. Typography Rules

1. No decorative typography in operational dashboards.
2. No giant all-caps blocks except compact labels where appropriate.
3. No ultra-light text for critical values.
4. Numbers must be easy to scan.
5. Always show units beside physical measurements.
6. Always show timestamps for live sensor values where relevant.
7. Avoid text that sounds written by a generic AI marketing template.

---

## 5. Color Rules

1. Color communicates state.
2. Do not use color as decoration when it has no semantic purpose.
3. Hazard colors must remain consistent across map, nodes, alerts, and charts.
4. A disconnected or stale node must never be shown as healthy green.
5. Do not use gradient backgrounds as a replacement for hierarchy.
6. Keep the normal-state interface mostly calm so real incidents stand out.

---

## 6. Layout Rules

1. Do not center every section.
2. Use asymmetric layouts when they improve scanning and spatial reasoning.
3. Do not build a page from a stack of identical cards.
4. Use the map as a primary workspace where geography matters.
5. Keep live telemetry near the node identity.
6. Keep high-priority actions near the state that justifies the action.
7. Do not hide critical status behind hover interactions.

---

## 7. Real-Time Rules

1. Do not poll live sensor values through repeated page fetches when a persistent stream is available.
2. Prefer WebSocket for edge-to-PWA telemetry/events.
3. Prefer MQTT for sensor-to-edge messaging.
4. Preserve source timestamps.
5. Do not silently display stale data as live.
6. Use bounded client-side buffers for live charts.
7. Update only the components affected by a sensor event.
8. Reconnect automatically after transient WebSocket failure.
9. Expose connection state to the user.
10. Measure actual latency; do not claim zero latency without measured evidence.

---

## 8. Data Rules

1. Raw sensor values must remain traceable to their source node.
2. Derived data must be distinguishable from raw data.
3. Model output must be distinguishable from human reports.
4. Official decisions must be clearly attributable to authorized authorities.
5. Do not fabricate node IDs, coordinates, alerts, or historical readings in production.
6. Test fixtures must be clearly separated from production data.

---

## 9. Adaptive UI Rules

The node type controls the monitoring vocabulary.

Example:

Fire Node:

- Temperature
- Smoke/gas
- Humidity
- Camera
- Fire analysis

Flood Node:

- Water level
- Rainfall
- Rate of rise
- Flood analysis

Never show unrelated metrics simply because the shared component library has them.

---

## 10. Authentication Rules

1. Never trust a role supplied only by the frontend.
2. The server determines roles and permissions.
3. Admin controls require authorized backend enforcement.
4. Guest access must never expose private operational information.
5. Citizen views must not expose sensitive worker or authority operations.
6. Sessions must expire and re-authenticate according to the chosen auth provider's security model.

---

## 11. Offline Rules

1. The PWA must remain navigable when cloud connectivity fails.
2. Local cached data must display its synchronization time.
3. The application must distinguish cloud loss from edge loss.
4. A node without telemetry is not equivalent to a safe node.
5. Queued actions must show their pending state.
6. Do not allow stale cached authority actions to appear as newly issued instructions.

---

## 12. Animation Rules

1. Animation must have a functional purpose.
2. Live events may animate briefly to attract attention.
3. Navigation transitions must be fast.
4. No looping decorative motion on operational pages.
5. No parallax-heavy effects that reduce usability.
6. Reduced-motion preferences must be respected.

---

## 13. Code Rules

1. Keep the codebase modular by capability, not by randomly generated screen names.
2. Prefer one shared component with configuration over copied versions of the same component.
3. Define node types and metrics with typed schemas.
4. Keep sensor ingestion models separate from display models.
5. Keep API clients and real-time clients separate from UI components.
6. Centralize formatting for units, timestamps, status labels, and numbers.
7. Do not place business logic directly inside presentational chart components.

---

## 14. Content Rules

Use operational nouns and verbs.

Good:

`Live telemetry`

`Node health`

`Predicted spread`

`Official status`

`Field report`

Bad:

`Smart insights`

`AI magic`

`Intelligent command center`

`Future-ready resilience hub`

Avoid hype. Let the system's behavior demonstrate the technology.

---

## 15. SIH Demonstration Rules

1. Demonstrate the hardware-to-PWA path with real sensor changes.
2. The chart must visibly update live.
3. Triggered incidents should be traceable to the node that generated them.
4. Do not hide latency or pretend a simulated event is a live hardware event.
5. Keep a clearly labeled demo/test mode if simulation is necessary.
6. The demonstration must show role-specific differences.
7. The demonstration must show what happens when connectivity is interrupted.

---

## 16. Quality Gate Before Merging Any UI

Ask:

- Does this component exist because a user needs it?
- Does it use real data or a clearly labeled fixture?
- Is its state unambiguous?
- Does its design look specific to R-TRACE?
- Did we accidentally create an AI-looking card/pill/gradient?
- Could this be removed without losing useful information?
- Does the UI remain understandable without animation?
- Does it work on the smallest supported viewport?

If the answer to the first or second question is no, do not merge it.
