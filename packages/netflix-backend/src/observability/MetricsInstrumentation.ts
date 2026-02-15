import { Instrumentation, Span } from "./Instrumentation";
import { MetricsCollector } from "./MetricsCollector";

export class MetricsInstrumentation implements Instrumentation {
  constructor(private collector: MetricsCollector) {}

  startSpan(name: string): Span {
    const span = this.collector.startSpan(name);
    return {
      end: (result?: unknown) => {
        span.end();
      },
      error: (err: unknown) => {
        span.end();
      },
    };
  }
}
