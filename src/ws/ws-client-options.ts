import { WebSocket } from ".";

export interface WSClientOptions {
    port:number;
    defaultMessage:string;
    showDefaultMessage:boolean;
    onConnection:(socket:WebSocket)=>void;
    onDisconnect:(socket:WebSocket)=>void;
  }