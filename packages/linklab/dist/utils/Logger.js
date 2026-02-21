export class Logger {
    constructor(enabled = true) {
        this.enabled = enabled;
    }
    info(message, data) {
        if (!this.enabled)
            return;
        console.log(`ℹ️  ${message}`, data ?? '');
    }
    warn(message, data) {
        if (!this.enabled)
            return;
        console.warn(`⚠️  ${message}`, data ?? '');
    }
    error(message, error) {
        if (!this.enabled)
            return;
        console.error(`❌ ${message}`, error ?? '');
    }
    debug(message, data) {
        if (!this.enabled)
            return;
        console.debug(`🔍 ${message}`, data ?? '');
    }
    disable() {
        this.enabled = false;
    }
    enable() {
        this.enabled = true;
    }
}
//# sourceMappingURL=Logger.js.map