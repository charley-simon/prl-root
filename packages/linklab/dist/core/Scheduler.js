import { Logger } from '../utils/Logger';
export class Scheduler {
    constructor(actions, graph) {
        this.actions = actions;
        this.graph = graph;
        this.logger = new Logger();
        this.actionStates = new Map(actions.map(a => [a.name, { cooldownUntil: 0, executionCount: 0 }]));
    }
    async step(time, stack) {
        const available = this.getAvailableActions(time, stack);
        if (available.length === 0) {
            return null;
        }
        const selected = available.reduce((best, action) => action.weight > best.weight ? action : best);
        this.logger.info(`[Scheduler] Executing action: ${selected.name}`);
        let result;
        let executionResult = [];
        try {
            executionResult = await selected.execute(stack, this.graph);
            result = {
                type: 'SUCCESS',
                data: executionResult
            };
        }
        catch (err) {
            result = {
                type: 'FAIL',
                reason: err instanceof Error ? err.message : String(err)
            };
            this.logger.error(`[Scheduler] Action failed: ${selected.name}`, err);
        }
        if (selected.onUse) {
            try {
                selected.onUse(stack, result);
            }
            catch (err) {
                this.logger.warn(`[Scheduler] onUse callback error`, err);
            }
        }
        this.updateActionState(selected.name, result, selected.cooldown ?? 0, time);
        return {
            selectedAction: selected.name,
            result,
            updatedStack: result.type === 'SUCCESS' ? executionResult : stack
        };
    }
    getAvailableActions(time, stack) {
        return this.actions.filter(action => {
            const state = this.actionStates.get(action.name);
            if (state.executed && action.terminal) {
                return false;
            }
            if (state.cooldownUntil > time) {
                return false;
            }
            if (action.maxExecutions !== undefined && state.executionCount >= action.maxExecutions) {
                return false;
            }
            if (!action.when) {
                return true;
            }
            try {
                return action.when(stack);
            }
            catch {
                return false;
            }
        });
    }
    updateActionState(name, result, cooldown, time) {
        const current = this.actionStates.get(name);
        const action = this.actions.find(a => a.name === name);
        this.actionStates.set(name, {
            cooldownUntil: result.type === 'DEFER' ? time + cooldown : 0,
            executionCount: current.executionCount + 1,
            lastResult: result,
            executed: action.terminal ? true : current.executed
        });
    }
    getActionState(name) {
        return this.actionStates.get(name);
    }
    getStack() {
        return [];
    }
}
//# sourceMappingURL=Scheduler.js.map