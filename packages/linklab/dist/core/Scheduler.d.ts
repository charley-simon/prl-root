import type { ActionDefinition, Frame, Graph, EngineResult, ActionState } from '../types';
export type SchedulerStepResult = {
    selectedAction: string;
    result: EngineResult;
    updatedStack?: Frame[];
};
export declare class Scheduler {
    private actions;
    private graph;
    private logger;
    private actionStates;
    constructor(actions: ActionDefinition[], graph: Graph);
    step(time: number, stack: Frame[]): Promise<SchedulerStepResult | null>;
    getAvailableActions(time: number, stack: Frame[]): ActionDefinition[];
    private updateActionState;
    getActionState(name: string): ActionState | undefined;
    getStack(): Frame[];
}
//# sourceMappingURL=Scheduler.d.ts.map