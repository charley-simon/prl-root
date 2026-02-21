export class Tracer {
    constructor() {
        this.events = [];
        this.listeners = [];
    }
    trace(event) {
        this.events.push(event);
        this.listeners.forEach(listener => listener(event));
    }
    on(listener) {
        this.listeners.push(listener);
    }
    getEvents() {
        return this.events;
    }
    getEventsByType(type) {
        return this.events.filter(e => e.type === type);
    }
}
//# sourceMappingURL=Tracer.js.map