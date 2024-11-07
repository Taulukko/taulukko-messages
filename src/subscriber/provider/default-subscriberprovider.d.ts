import { SubscriberProvider, Listener } from "./subscriber-provider";
import { WSClient, WSServerOptions, WebSocket } from "../../ws";
import { PearData } from "../../common/pear-data";
export declare class DefaultSubscriberProvider implements SubscriberProvider {
    options: TaulukkoProviderOptions;
    status: string;
    client: WSClient;
    id: string;
    listeners: Array<Listener>;
    constructor(options: any);
    on: (listener: Listener) => Promise<void>;
    open: () => Promise<void>;
    private onDisconnect;
    onTaulukkoServerConnectionOK: (resolve: any) => Promise<(websocket: WebSocket) => Promise<void>>;
    onTaulukkoServerRegisteredClient: (resolve: any) => Promise<(websocket: WebSocket) => Promise<void>>;
    onTaulukkoServerUnregisteredClient: (resolve: (ret: any) => void, me: DefaultSubscriberProvider) => Promise<(websocket: WebSocket) => Promise<void>>;
    close: () => Promise<void>;
    forceClose: () => Promise<void>;
    waitReconnect: () => Promise<boolean>;
    get data(): PearData;
}
interface TaulukkoProviderOptions extends WSServerOptions {
    topics: Array<string>;
}
export {};
