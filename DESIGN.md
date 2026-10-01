# R-TRACE PWA Design System and Visual Direction

## 1. Design Intent

R-TRACE is an environmental and disaster-response product. Its visual language must communicate operational clarity, trust, precision, spatial awareness, and technical competence.

It must not look like a generic AI dashboard, startup landing page, SaaS admin template, or automatically generated UI kit.

The design should feel **engineered for field use**.

---

## 2. Visual Positioning

The interface should be:

- Precise
- Calm
- Dense where density is useful
- Hierarchical
- Geographic
- Technical without looking like a developer console
- Strong at a glance
- Legible on imperfect screens
- Responsive across phone, tablet, and desktop

It should avoid:

- Generic futuristic styling
- Decorative gradients
- Artificially rounded component collections
- Excessive glassmorphism
- Neon-on-black cyberpunk treatment
- Stock AI imagery
- Overly polished marketing-card compositions

---

## 3. No-AI-Slop Rules

The following are explicit design prohibitions.

### No generic gradients

Do not use:

- Purple-to-blue gradients
- Blue-to-purple AI backgrounds
- Rainbow gradients
- Gradient text
- Gradient borders used as decoration

Subtle tonal changes are acceptable only when they have a clear functional or cartographic reason.

### No emoji-based interface

Do not use emojis as icons, section markers, buttons, severity indicators, or navigation symbols.

Use a coherent icon system or custom vector marks.

### No Lucide-by-default styling

Do not automatically populate the entire interface with default Lucide icons. Icons, if used, should be chosen intentionally and styled as part of the product's visual language.

For high-value controls, custom SVG marks or a carefully selected icon library may be used.

### No AI pills

Avoid decorative labels such as:

- AI Powered
- AI Insight
- Smart Analysis
- Intelligent Mode
- Copilot
- AI Engine

especially when placed as badges merely to make a screen appear sophisticated.

Use direct information instead:

`Fire confidence 91%`

`Predicted spread: 1.7 km`

`Model update: 09:21:14`

### No AI-style section headings

Avoid generic headings such as:

- Intelligence Hub
- Smart Insights
- Next-Gen Analytics
- AI Command Center
- Neural Overview
- Smart Monitoring

Use concrete operational language:

- Live telemetry
- Fire analysis
- Sensor history
- Predicted spread
- Incident timeline
- Node health
- Official instructions

### No fake complexity

Do not add charts, cards, toggles, activity rings, animated counters, or dashboards simply because a modern product often has them.

Every component must answer a real user need.

### No fake data theater

Use actual hardware/edge data in the live demonstration. Mock data should be explicitly marked and isolated to development environments.

---

## 4. Color Strategy

Color is semantic, not decorative.

Suggested system:

- Neutral base for the main application surface.
- Strong dark text for primary information.
- Restrained secondary text.
- One stable R-TRACE brand accent.
- Hazard colors only where they communicate hazard state.
- Green for confirmed healthy/normal operational state where appropriate.
- Amber for warning states.
- Red for active/high-severity hazard states.
- Blue may be reserved for location, information, or navigation semantics rather than used as an all-purpose accent.

Do not let hazard colors dominate the entire interface when no hazard exists.

---

## 5. Typography

Typography is part of the information architecture.

Use a highly legible sans-serif with strong tabular numeral support where possible.

Recommended hierarchy:

- App title: large, restrained.
- Page title: clear and compact.
- Section title: medium weight, short.
- Metric label: small but readable.
- Metric value: strong numeric hierarchy.
- Units: visually subordinate but immediately adjacent.
- Timestamp: compact and explicit.

Avoid:

- Excessive uppercase text.
- Tiny gray labels.
- Huge centered hero typography inside operational screens.
- Text formatted to resemble an AI chat product.

---

## 6. Layout Principles

The desktop application should use a practical spatial composition:

```text
┌─────────────────────────────────────────────────────┐
│ Header / system state / account                     │
├───────────────┬──────────────────────┬──────────────┤
│ Navigation    │ Main operational     │ Context /    │
│               │ workspace            │ details      │
│               │                      │              │
│               │ Map / node / charts  │ Alerts       │
│               │                      │ Timeline     │
└───────────────┴──────────────────────┴──────────────┘
```

The map can become the primary canvas on incident-focused screens.

The live chart area should have enough vertical height to reveal trends without forcing the user to hunt for the graph.

---

## 7. The Adaptive Node View

The adaptive view should not merely swap text labels.

The information hierarchy itself should change.

### Shared shell

- Node identity
- Online state
- Last update
- Location
- Battery/power when available
- Connectivity
- Live/historical switch
- Incident status

### Fire-specific

- Temperature
- Smoke/gas
- Humidity
- Camera evidence
- Fire confidence
- Severity
- Fire risk/spread map

### Flood-specific

- Water level
- Rate of rise
- Rainfall
- Flood risk
- Inundation map

### AQI-specific

- AQI
- PM2.5
- PM10
- Pollutant trends
- Exposure map

### Landslide-specific

- Tilt
- Vibration
- Soil moisture
- Movement rate
- Slope risk

### Industrial-specific

- Gas concentrations
- PM values
- Exposure risk
- Wind/environmental context

---

## 8. Live Graph Design

Live graphs are primary information, not decoration.

Each graph should show:

- Metric name
- Current value
- Unit
- Time scale
- Current update state
- Trend line
- Key event markers when relevant

The line should be visually quiet enough to reveal the data shape.

Avoid exaggerated smoothing because it can visually suggest trends that do not exist.

Use a visible current-time edge and let the chart advance naturally.

---

## 9. State Design

Every major component should define:

### Normal

Data is current and within the expected operating state.

### Warning

A condition has exceeded a configured threshold or requires attention.

### Critical

A high-priority operational condition is active.

### Offline

No usable connection to the node or service.

### Stale

The application still has a previous reading but it is outside the live freshness window.

### Unknown

The system cannot establish enough information to classify the state.

Do not represent Offline or Unknown as green.

---

## 10. Map Design

The map should resemble an operational GIS interface rather than a travel app.

Principles:

- Minimal map decoration.
- Strong node markers.
- Clear selected-node state.
- Layer controls only when useful.
- Risk polygons should have sufficient transparency to preserve geographic context.
- Avoid excessive markers.
- Use clustering at large geographic extents.
- The legend must explain every non-obvious layer.

---

## 11. Motion

Motion should communicate change, not style.

Use animation for:

- Live value transitions where helpful.
- Node state changes.
- New incident arrival.
- Map event location changes.
- Connection state changes.

Avoid:

- Floating cards.
- Constant background motion.
- Decorative particles.
- Slow page transitions.
- Infinite spinning effects.
- Animation on every element.

Emergency information should remain visible even if animation is disabled.

---

## 12. Responsive Design

### Mobile

Prioritize:

1. Hazard/incident state.
2. Current live measurements.
3. Map.
4. Key action.
5. Timeline/details.

### Tablet

Use a two-region layout where possible.

### Desktop

Use map + live telemetry + contextual detail simultaneously.

Do not simply collapse the desktop dashboard into a long vertical list on mobile. Re-prioritize content deliberately.

---

## 13. Login and Role UX

The entry screen should clearly expose:

- Sign in
- Continue as guest where available

After authentication, role-specific navigation appears automatically.

Do not make the user choose their role in a dropdown.

---

## 14. Public Safety Language

Use concise and direct language.

Prefer:

`Fire detected at Node FN-001`

over:

`Our intelligent AI engine has detected a potential fire event.`

Prefer:

`No official evacuation order issued`

over:

`AI recommends that you evacuate.`

The distinction between evidence, prediction, report, and authority action must be visually explicit.

---

## 15. Component Philosophy

Build a small set of high-quality primitives rather than hundreds of one-off cards.

Core primitives:

- App shell
- Navigation rail
- Header
- Status strip
- Metric block
- Live chart
- Node selector
- Alert row
- Incident row
- Timeline
- Map layer control
- Evidence panel
- Action group
- Data table
- Connection indicator

A component should be reusable because its underlying information pattern is reusable, not because every page must look identical.
