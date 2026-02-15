import { Instrumentation, Span } from "./Instrumentation";

export class ConsoleInstrumentation implements Instrumentation {
  startSpan(name: string, context?: Record<string, unknown>): Span {
    const start = Date.now();

    console.log(`[SPAN START] ${name}`, context ?? "");

    return {
      end(result?: unknown) {
        console.log(
          `[SPAN END] ${name} (${Date.now() - start}ms)`,
          result ? { result } : "",
        );
      },
      error(error: unknown) {
        console.error(`[SPAN ERROR] ${name} (${Date.now() - start}ms)`, error);
      },
    };
  }
}
