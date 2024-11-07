import { Message } from "../../common/message";
import { PearData } from "../../common/pear-data";
export interface SubscriberProvider {
    on(listener: Listener): Promise<any>;
    get data(): PearData;
    forceClose(): Promise<void>;
    open(): Promise<void>;
    close(): Promise<void>;
    waitReconnect(): Promise<boolean>;
}
export interface Listener {
    (message: Message): Promise<any>;
}
