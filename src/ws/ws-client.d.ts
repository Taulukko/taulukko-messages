import { WSClientOptions } from "./";
import * as socketIo from "socket.io";
import * as io from "socket.io-client";
export declare class WSClient {
    id: string;
    options: WSClientOptions;
    client: io.Socket;
    internalSocketsByClientId: Map<string, socketIo.Socket>;
    globalEvents: Map<string, (...args: any) => void>;
    _state: string;
    private constructor();
    static create: (options: any) => WSClient;
    get state(): string;
    set state(value: string);
    open: () => Promise<{}>;
    close: () => Promise<void>;
    forceClose: () => Promise<void>;
    emit: (event: string, ...data: any[]) => Promise<void>;
    on: (event: string, listener: (...data: any) => void) => Promise<void>;
}
