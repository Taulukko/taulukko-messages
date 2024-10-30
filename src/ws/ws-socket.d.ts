import { WebSocketClient, WebSocketServer } from ".";
export declare class WSSocket {
    private socket;
    client: WebSocketClient;
    server: WebSocketServer;
    constructor(options: WebSocketOptions);
    emit: (event: string, ...args: any) => Promise<void>;
    send: (...args: any) => void;
}
