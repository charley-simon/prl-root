import { Tracer } from './Tracer';
export class Telemetry {
    constructor() {
        this.tracer = new Tracer();
    }
    trace(event) {
        this.tracer.trace(event);
    }
    getTraces() {
        return this.tracer.getTraces();
    }
    clear() {
        this.tracer.clear();
    }
}
//# sourceMappingURL=Telemetry.js.map