import { Instrumentation } from "./Instrumentation";

/**
 * Wraps an object so that all async methods are instrumented.
 * Logs:
 * - method name
 * - parameters
 * - execution time
 * - result
 */
export function instrument<T extends object>(
  obj: T,
  instrumentation: Instrumentation,
): T {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);

      if (typeof orig !== "function") return orig;

      return async (...args: any[]) => {
        const span = instrumentation.startSpan(String(prop), { args });

        try {
          const result = await orig.apply(target, args);
          span.end(result);
          return result;
        } catch (err) {
          span.error(err);
          throw err;
        }
      };
    },
  });
}
