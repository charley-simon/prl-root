import type { Graph, Frame, ActionDefinition, EngineMode, EngineConfig, EngineStepResult, PathQuery } from '../types';
export declare class Engine {
    private mode;
    private graph;
    private state;
    private pathFinder?;
    private resolver?;
    private scheduler?;
    private config;
    constructor(config: EngineConfig);
    static forPathfinding(graph: Graph, query: PathQuery): Engine;
    static forScheduling(graph: Graph, options: {
        stack: Frame[];
        actions: ActionDefinition[];
    }): Engine;
    static forNavigation(graph: Graph, options: {
        stack: Frame[];
    }): Engine;
    run(maxSteps?: number): Promise<EngineStepResult[]>;
    private runPathfind;
    private runNavigate;
    private runSchedule;
    getState(): any;
    getGraph(): Graph;
    getMode(): EngineMode;
}
//# sourceMappingURL=Engine.d.ts.map