/**
 * ContextPanel.tsx — Right context panel.
 * Hosts alerts feed, timeline, and contextual details.
 * DESIGN.md section 6 — Context / details panel.
 */

import type { ReactNode } from 'react';
import './ContextPanel.css';

interface ContextPanelProps {
  children?: ReactNode;
}

export function ContextPanel({ children }: ContextPanelProps) {
  return (
    <aside className="context-panel" aria-label="Context panel">
      {children ?? (
        <div className="context-panel__empty">
          <p className="context-panel__empty-text">
            Select a node or incident to see details.
          </p>
        </div>
      )}
    </aside>
  );
}
