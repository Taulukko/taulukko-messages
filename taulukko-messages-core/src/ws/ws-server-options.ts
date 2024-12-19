import { WebSocket } from "./web-socket";

export interface WSServerOptions {
    port:number;
    defaultMessage:string;
    showDefaultMessage:boolean;
    onConnection:(socket:WebSocket)=>void;
    onDisconnect:(socket:WebSocket)=>void;
  }