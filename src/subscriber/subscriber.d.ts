import { Listener, SubscriberProvider } from "./provider/subscriber-provider";
import { PearData } from "src/common/pear-data";
export declare class Subscriber implements SubscriberProvider {
    provider: SubscriberProvider;
    options: SubscriberOptions;
    private constructor();
    static create(options: any): Subscriber;
    open(): Promise<void>;
    close(): Promise<void>;
    get data(): PearData;
    on(listener: Listener): Promise<any>;
    forceClose(): Promise<void>;
    waitReconnect(): Promise<boolean>;
}
interface SubscriberOptions {
    provider: SubscriberProvider;
    topics: Array<string>;
}
export {};
