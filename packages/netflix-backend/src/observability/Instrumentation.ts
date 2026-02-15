export interface Instrumentation {
  startSpan(name: string, context?: Record<string, unknown>): Span;
}

export interface Span {
  end(result?: unknown): void;
  error(error: unknown): void;
}
