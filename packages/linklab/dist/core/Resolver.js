import { Logger } from '../utils/Logger';
import { resolveFrame } from '../algorithms/resolveFrame';
export class Resolver {
    constructor(graph) {
        this.graph = graph;
        this.logger = new Logger();
    }
    async resolve(stack) {
        const unresolved = stack.filter(f => f.state === 'UNRESOLVED');
        if (unresolved.length === 0) {
            return stack;
        }
        const frame = unresolved[0];
        try {
            const resolved = await resolveFrame(frame, stack, this.graph.relations);
            if (resolved) {
                return stack.map(f => (f === frame ? resolved : f));
            }
            else {
                return stack.map(f => (f === frame ? { ...f, state: 'DEFERRED' } : f));
            }
        }
        catch (error) {
            this.logger.error(`Failed to resolve frame ${frame.entity}`, error);
            return stack.map(f => (f === frame ? { ...f, state: 'DEFERRED' } : f));
        }
    }
}
//# sourceMappingURL=Resolver.js.map