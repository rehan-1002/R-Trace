/**
 * ErrorBoundary.tsx — Global operational error boundary.
 * Catches runtime crashes and displays diagnostic error recovery UI.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught operational UI error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 'var(--space-8)',
            backgroundColor: 'var(--color-surface-base)',
            color: 'var(--color-text-primary)',
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'var(--font-family-base)',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: 'var(--space-6)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-state-critical)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h2
              style={{
                color: 'var(--color-state-critical)',
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Operational System Error
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {this.state.error?.message ?? 'An unexpected runtime error occurred.'}
            </p>
            {this.state.error?.stack && (
              <pre
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-surface-overlay)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-mono)',
                  color: 'var(--color-text-muted)',
                  overflowX: 'auto',
                  maxHeight: '160px',
                  marginBottom: 'var(--space-4)',
                }}
              >
                {this.state.error.stack}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text-inverse)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'bold',
                }}
              >
                Reload Interface
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.clear();
                  window.location.href = '/login';
                }}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--color-surface-overlay)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-surface-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                Reset Session & Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
