/**
 * reconnect.ts — Exponential backoff calculator with jitter.
 * Prevents reconnection storms during intermittent edge/cloud outages.
 * Master Implementation Plan section 6 (Phase 7).
 */

export interface BackoffOptions {
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitterMs?: number;
}

export class ReconnectStrategy {
  private attempts = 0;
  private readonly initialDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly factor: number;
  private readonly jitterMs: number;

  constructor(options: BackoffOptions = {}) {
    this.initialDelayMs = options.initialDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 30000;
    this.factor = options.factor ?? 2;
    this.jitterMs = options.jitterMs ?? 500;
  }

  public nextDelay(): number {
    const exponential = this.initialDelayMs * Math.pow(this.factor, this.attempts);
    const capped = Math.min(this.maxDelayMs, exponential);
    const jitter = (Math.random() * 2 - 1) * this.jitterMs;
    this.attempts++;
    return Math.max(0, Math.round(capped + jitter));
  }

  public reset(): void {
    this.attempts = 0;
  }

  public get currentAttempts(): number {
    return this.attempts;
  }
}
