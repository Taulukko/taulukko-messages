import { LogLevel } from "../common/names";
import { PublisherProvider } from "./provider/publisher-provider";
import { PearData } from "../common/pear-data";
export declare class Publisher implements PublisherProvider {
    provider: PublisherProvider;
    options: PublisherOptions;
    private constructor();
    private validarUrl;
    private extractPort;
    private extractHost;
    static create(options: any): Publisher;
    open(): Promise<void>;
    close(): Promise<void>;
    forceClose(): Promise<void>;
    get data(): PearData;
    send(...data: any): Promise<any>;
    waitReconnect(): Promise<boolean>;
}
interface PublisherOptions {
    defaultLogLevel: LogLevel;
    provider: PublisherProvider;
    topics: Array<string>;
}
export {};
