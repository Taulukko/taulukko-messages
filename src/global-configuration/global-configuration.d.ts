import { LogLevel } from "../common/names";
declare class GlobalConfiguration {
    private logConfiguration;
    private constructor();
    static create(options: any): GlobalConfiguration;
    get log(): LogConfiguration;
}
declare class LogConfiguration {
    level: LogLevel;
    showInConsole: boolean;
    consoleLog: (...data: any[]) => void;
    pattern: string;
    private constructor();
    static create(options: LogConfigurationOptions): LogConfiguration;
}
interface LogConfigurationOptions {
    level?: LogLevel;
    showInConsole?: boolean;
    pattern?: string;
    consoleLog?: (...data: any[]) => void;
}
export declare var globalConfiguration: GlobalConfiguration;
export {};
