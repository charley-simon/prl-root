export declare class Logger {
    private enabled;
    constructor(enabled?: boolean);
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    debug(message: string, data?: any): void;
    disable(): void;
    enable(): void;
}
//# sourceMappingURL=Logger.d.ts.map