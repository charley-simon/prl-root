import chalk from 'chalk';
export class Logger {
    constructor() {
        this.depth = 0;
    }
    log(event) {
        const indent = '  '.repeat(this.depth);
        switch (event.type) {
            case 'RESOLVE_START': {
                console.log(chalk.cyan(`${indent}🔍 Resolving ${event.entity}${event.id ? `(${event.id})` : ''}`));
                this.depth++;
                break;
            }
            case 'RESOLVE_SUCCESS': {
                this.depth = Math.max(0, this.depth - 1);
                console.log(chalk.green(`${indent}✅ Resolved ${event.entity} via ${event.relation}`));
                break;
            }
            case 'RESOLVE_FAIL': {
                this.depth = Math.max(0, this.depth - 1);
                console.log(chalk.red(`${indent}❌ Failed to resolve ${event.entity}: ${event.reason || 'No relation found'}`));
                break;
            }
            case 'ACTION_SELECT': {
                console.log(chalk.blue(`${indent}⚡ Selected action: ${event.action}`));
                this.depth++;
                break;
            }
            case 'ACTION_EXECUTE': {
                let color;
                if (event.result === 'SUCCESS') {
                    color = chalk.green;
                }
                else if (event.result === 'DEFER') {
                    color = chalk.yellow;
                }
                else {
                    color = chalk.red;
                }
                this.depth = Math.max(0, this.depth - 1);
                const icon = event.result === 'SUCCESS' ? '✓' : event.result === 'DEFER' ? '⏸' : '✗';
                console.log(color(`${indent}${icon} ${event.action}: ${event.result}${event.reason ? ` (${event.reason})` : ''}`));
                break;
            }
            case 'STEP_START': {
                console.log(chalk.magenta(`\n⏱️  Step ${event.time}`));
                console.log(chalk.gray('─'.repeat(60)));
                break;
            }
            case 'STEP_END': {
                console.log(chalk.gray(`${indent}📊 Resolved: ${event.resolvedCount || 0}, Unresolved: ${event.unresolvedCount || 0}, Deferred: ${event.deferredCount || 0}`));
                break;
            }
            case 'PATH_FOUND': {
                console.log(chalk.green(`${indent}🛤️  Path found: ${event.path?.nodes.join(' → ')} (weight: ${event.path?.totalWeight})`));
                break;
            }
            case 'PATH_NOT_FOUND': {
                console.log(chalk.red(`${indent}🚫 No path found from ${event.from} to ${event.to}`));
                break;
            }
            case 'GRAPH_TRAIN': {
                console.log(chalk.yellow(`${indent}🎓 Training graph with ${event.queryCount} queries...`));
                break;
            }
            case 'GRAPH_ADAPT': {
                console.log(chalk.yellow(`${indent}🔧 Adapting relation ${event.relation}: weight ${event.oldWeight} → ${event.newWeight}`));
                break;
            }
            default: {
                console.log(chalk.white(`${indent}📝 ${JSON.stringify(event)}`));
            }
        }
    }
    group(title, fn) {
        console.log(chalk.bold.white(`\n┌─ ${title}`));
        this.depth++;
        fn();
        this.depth = Math.max(0, this.depth - 1);
        console.log(chalk.bold.white(`└─ End ${title}\n`));
    }
    table(data) {
        console.table(data);
    }
    reset() {
        this.depth = 0;
    }
}
//# sourceMappingURL=Logger.js.map