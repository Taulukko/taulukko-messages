import { ServerProvider } from "./provider/server-provider";
import { ServerData } from "./server-data";
import { ClientData } from "./client-data";
import { AuthProvider } from "../auth/auth-provider";
export declare class Server implements ServerProvider {
    options: ServerOptions;
    private constructor();
    static create(options?: any): Server;
    open(): Promise<any>;
    close(): Promise<any>;
    forceClose(): Promise<any>;
    get data(): ServerData;
    get publishers(): Array<ClientData>;
    get subscribers(): Array<ClientData>;
    sendAll(data: any): Promise<any>;
}
interface ServerOptions {
    provider: ServerProvider;
    auth?: AuthProvider;
}
export {};
