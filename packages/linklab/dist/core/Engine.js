import { PathFinder } from './PathFinder';
import { Resolver } from './Resolver';
import { Scheduler } from './Scheduler';
export class Engine {
    constructor(config) {
        this.config = config;
        this.mode = config.mode;
        this.graph = config.graph;
        this.state = {};
        switch (this.mode) {
            case 'PATHFIND':
                this.pathFinder = new PathFinder(this.graph);
                break;
            case 'NAVIGATE':
                this.resolver = new Resolver(this.graph);
                this.state = { stack: config.initialStack || [] };
                break;
            case 'SCHEDULE':
                this.scheduler = new Scheduler(config.actions || [], this.graph);
                break;
        }
    }
    static forPathfinding(graph, query) {
        return new Engine({
            mode: 'PATHFIND',
            graph,
            pathQuery: query
        });
    }
    static forScheduling(graph, options) {
        return new Engine({
            mode: 'SCHEDULE',
            graph,
            initialStack: options.stack,
            actions: options.actions
        });
    }
    static forNavigation(graph, options) {
        return new Engine({
            mode: 'NAVIGATE',
            graph,
            initialStack: options.stack
        });
    }
    async run(maxSteps = 1) {
        switch (this.mode) {
            case 'PATHFIND':
                return this.runPathfind();
            case 'NAVIGATE':
                return this.runNavigate(maxSteps);
            case 'SCHEDULE':
                return this.runSchedule(maxSteps);
            default:
                throw new Error(`Unknown mode: ${this.mode}`);
        }
    }
    async runPathfind() {
        if (!this.pathFinder || !this.config.pathQuery) {
            throw new Error('PathFinder mode requires pathQuery');
        }
        const { from, to, maxPaths = 5 } = this.config.pathQuery;
        const paths = this.pathFinder.findAll(from, to, maxPaths);
        if (paths.length === 0) {
            return [
                {
                    time: 0,
                    mode: 'PATHFIND',
                    result: { type: 'FAIL', reason: 'No path found' }
                }
            ];
        }
        const bestPath = paths[0];
        this.state = { ...this.state, currentPath: bestPath };
        return [
            {
                time: 0,
                mode: 'PATHFIND',
                path: bestPath,
                result: {
                    type: 'SUCCESS',
                    data: { allPaths: paths }
                }
            }
        ];
    }
    async runNavigate(maxSteps) {
        if (!this.resolver) {
            throw new Error('Navigate mode requires Resolver');
        }
        const results = [];
        let currentStack = this.state.stack;
        for (let t = 0; t < maxSteps; t++) {
            const resolved = currentStack.filter((f) => f.state === 'RESOLVED').length;
            const unresolved = currentStack.filter((f) => f.state === 'UNRESOLVED').length;
            if (unresolved === 0) {
                results.push({
                    time: t,
                    mode: 'NAVIGATE',
                    phase: 'COMPLETE',
                    resolvedCount: resolved,
                    unresolvedCount: unresolved,
                    result: { type: 'SUCCESS' }
                });
                break;
            }
            currentStack = await this.resolver.resolve(currentStack);
            results.push({
                time: t,
                mode: 'NAVIGATE',
                phase: 'RESOLVE',
                resolvedCount: resolved,
                unresolvedCount: unresolved
            });
        }
        this.state.stack = currentStack;
        return results;
    }
    async runSchedule(maxSteps) {
        if (!this.scheduler) {
            throw new Error('Schedule mode requires Scheduler');
        }
        const results = [];
        const currentStack = this.state.stack;
        for (let t = 0; t < maxSteps; t++) {
            const stepResult = await this.scheduler.step(t, currentStack);
            if (!stepResult) {
                results.push({
                    time: t,
                    mode: 'SCHEDULE',
                    phase: 'COMPLETE',
                    result: { type: 'SUCCESS', reason: 'No more actions' }
                });
                break;
            }
            results.push({
                time: t,
                mode: 'SCHEDULE',
                phase: 'EXECUTE',
                selectedAction: stepResult.selectedAction,
                result: stepResult.result
            });
        }
        return results;
    }
    getState() {
        return this.state;
    }
    getGraph() {
        return this.graph;
    }
    getMode() {
        return this.mode;
    }
}
//# sourceMappingURL=Engine.js.map