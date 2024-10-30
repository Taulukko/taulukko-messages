import { PublisherProvider } from "./publisher-provider";
import { WebSocket } from "../../ws/";
import { PearData } from "../../common/pear-data";
export declare class DefaultPublisherProvider implements PublisherProvider {
    private options;
    private status;
    private client;
    private id;
    private constructor();
    static create: (options: any) => DefaultPublisherProvider;
    send(...data: any): void;
    open: () => Promise<void>;
    private onDisconnect;
    waitReconnect: () => Promise<boolean>;
    onTaulukkoServerConnectionOK: (reject: any) => Promise<(websocket: WebSocket) => Promise<void>>;
    onTaulukkoServerRegisteredClient: (resolve: (ret: any) => void) => Promise<(websocket: WebSocket) => Promise<void>>;
    onTaulukkoServerUnregisteredClient: (reject: (ret: any) => void, me: DefaultPublisherProvider) => Promise<(websocket: WebSocket) => Promise<void>>;
    close: () => Promise<void>;
    forceClose: () => Promise<void>;
    get data(): PearData;
}
