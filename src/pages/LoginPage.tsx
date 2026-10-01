/**
 * LoginPage.tsx — Authentication entry point.
 * DESIGN.md section 13: clearly exposes sign-in and guest option.
 * No marketing copy. No decorative gradients. Functional form.
 */

import { type FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect to the page the user tried to access, or dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel" role="main">
        <header className="login-header">
          <div className="login-wordmark">
            <span className="login-wordmark-rtrace">R-TRACE</span>
            <span className="login-wordmark-sub">Environmental Intelligence</span>
          </div>
        </header>

        <form
          className="login-form"
          onSubmit={(e) => { void handleSubmit(e); }}
          aria-label="Sign in"
          noValidate
        >
          <div className="login-form-group">
            <label htmlFor="login-email" className="login-label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
              disabled={submitting}
              aria-required="true"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password" className="login-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
              aria-required="true"
            />
          </div>

          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn-primary"
            disabled={submitting || !email || !password}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {import.meta.env.VITE_DATA_MODE === 'mock' && (
          <div className="login-demo-roles">
            <span className="login-demo-title">Quick Demo Login:</span>
            <div className="login-demo-grid">
              <button
                type="button"
                className="login-btn-demo"
                onClick={() => {
                  setEmail('authority@rtrace.internal');
                  setPassword('demo1234');
                }}
              >
                Authority
              </button>
              <button
                type="button"
                className="login-btn-demo"
                onClick={() => {
                  setEmail('worker@rtrace.internal');
                  setPassword('demo1234');
                }}
              >
                Worker
              </button>
              <button
                type="button"
                className="login-btn-demo"
                onClick={() => {
                  setEmail('citizen@rtrace.internal');
                  setPassword('demo1234');
                }}
              >
                Citizen
              </button>
              <button
                type="button"
                className="login-btn-demo"
                onClick={() => {
                  setEmail('admin@rtrace.internal');
                  setPassword('demo1234');
                }}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        <div className="login-divider" aria-hidden="true" />

        <div className="login-guest-section">
          <p className="login-guest-note">
            Public safety information is available without an account.
          </p>
          <a href="/public" className="login-btn-guest">
            Continue as guest
          </a>
        </div>
      </div>

      <div className="login-context" aria-hidden="true">
        <div className="login-context-inner">
          <p className="login-context-label">Resilient Multi-Hazard Environmental Intelligence Network</p>
          <div className="login-node-indicator">
            <span className="login-node-dot" />
            <span>Node network operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
