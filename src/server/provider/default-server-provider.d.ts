import { ServerProvider } from "./server-provider";
import { ClientData } from "../client-data";
import { ServerData } from '../server-data';
import { WSServer, WSServerOptions } from "../../ws/";
import { AuthProvider } from "../../auth/auth-provider";
export declare class DefaultServerProvider implements ServerProvider {
    options: TaulukkoProviderOptions;
    status: string;
    wsServer: WSServer;
    private publisherList;
    private subscriberList;
    private auth;
    constructor(options: any);
    private onWSSocketConnection;
    private onWSDisconect;
    private onClientOnline;
    private onClientOffline;
    private onNewMessage;
    open(): Promise<void>;
    close(): Promise<void>;
    forceClose(): Promise<void>;
    get data(): ServerData;
    get publishers(): Array<ClientData>;
    get subscribers(): Array<ClientData>;
    d: any;
    sendAll(data: any): Promise<void>;
}
interface TaulukkoProviderOptions extends WSServerOptions {
    auth: AuthProvider;
}
export {};
