/// <reference types="node" />
import * as http from "http";
import * as socketIo from "socket.io";
import { WSServerOptions } from "./";
export declare class WSServer {
    id: string;
    options: WSServerOptions;
    server: http.Server;
    io: socketIo.Server;
    internalSocketsByClientId: Map<string, socketIo.Socket>;
    globalEvents: Map<string, (...args: any) => void>;
    _state: string;
    private constructor();
    static create: (options: any) => WSServer;
    get state(): string;
    set state(value: string);
    open: () => Promise<any>;
    _bindEvents: (socket: socketIo.Socket) => Promise<void>;
    on: (event: string, listener: (...data: any) => void) => Promise<void>;
    close: () => Promise<void>;
}
