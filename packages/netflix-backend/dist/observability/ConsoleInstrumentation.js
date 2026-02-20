"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleInstrumentation = void 0;
class ConsoleInstrumentation {
    startSpan(name, context) {
        const start = Date.now();
        console.log(`[SPAN START] ${name}`, context ?? "");
        return {
            end(result) {
                console.log(`[SPAN END] ${name} (${Date.now() - start}ms)`, result ? { result } : "");
            },
            error(error) {
                console.error(`[SPAN ERROR] ${name} (${Date.now() - start}ms)`, error);
            },
        };
    }
}
exports.ConsoleInstrumentation = ConsoleInstrumentation;
