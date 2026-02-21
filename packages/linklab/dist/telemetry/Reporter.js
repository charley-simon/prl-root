import fs from 'fs';
import chalk from 'chalk';
export class Reporter {
    constructor(tracer, metrics) {
        this.tracer = tracer;
        this.metrics = metrics;
    }
    generateReport() {
        const m = this.metrics.getMetrics();
        let report = '\n';
        report += '═'.repeat(60) + '\n';
        report += '  ENGINE REPORT\n';
        report += '═'.repeat(60) + '\n\n';
        report += chalk.bold('RESOLUTIONS\n');
        report += `  Total: ${m.totalResolutions}\n`;
        report += `  Success: ${chalk.green(m.successfulResolutions)} (${pct(m.successfulResolutions, m.totalResolutions)}%)\n`;
        report += `  Failed: ${chalk.red(m.failedResolutions)} (${pct(m.failedResolutions, m.totalResolutions)}%)\n\n`;
        report += chalk.bold('CACHE\n');
        report += `  Hits: ${chalk.green(m.cacheHits)}\n`;
        report += `  Misses: ${chalk.yellow(m.cacheMisses)}\n`;
        report += `  Hit rate: ${chalk.cyan((m.cacheHitRate * 100).toFixed(1))}%\n\n`;
        report += chalk.bold('ACTIONS\n');
        report += `  Executed: ${m.actionsExecuted}\n`;
        report += `  Deferred: ${m.actionsDeferred}\n`;
        report += `  By type:\n`;
        Object.entries(m.actionsByType)
            .sort(([, a], [, b]) => b - a)
            .forEach(([name, count]) => {
            report += `    ${name}: ${count}\n`;
        });
        report += '\n';
        report += chalk.bold('PATHS\n');
        report += `  Found: ${chalk.green(m.pathsFound)}\n`;
        report += `  Not found: ${chalk.red(m.pathsNotFound)}\n`;
        report += `  Avg weight: ${m.avgPathWeight.toFixed(2)}\n`;
        report += `  Avg hops: ${m.avgPathHops.toFixed(2)}\n\n`;
        report += chalk.bold('RELATIONS\n');
        report += `  Most used: ${chalk.cyan(m.mostUsedRelation)}\n`;
        report += `  Usage:\n`;
        Object.entries(m.relationUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([name, count]) => {
            report += `    ${name}: ${count}\n`;
        });
        report += '\n';
        report += chalk.bold('PERFORMANCE\n');
        report += `  Total steps: ${m.totalSteps}\n`;
        report += `  Total duration: ${m.totalDuration.toFixed(0)}ms\n`;
        report += `  Avg step: ${m.avgStepDuration.toFixed(2)}ms\n\n`;
        report += '═'.repeat(60) + '\n';
        return report;
    }
    exportJSON(filepath) {
        const m = this.metrics.getMetrics();
        fs.writeFileSync(filepath, JSON.stringify(m, null, 2));
    }
    exportTimeline(filepath) {
        const events = this.tracer.getEvents();
        fs.writeFileSync(filepath, JSON.stringify(events, null, 2));
    }
}
function pct(num, total) {
    return total > 0 ? ((num / total) * 100).toFixed(1) : '0';
}
//# sourceMappingURL=Reporter.js.map