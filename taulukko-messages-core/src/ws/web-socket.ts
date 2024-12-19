import { WebSocketClient } from "./web-socket-client"
import { WebSocketServer } from "./web-socket-server";

export interface WebSocket{
    socket:any;
    client:WebSocketClient;
    server:WebSocketServer;
}