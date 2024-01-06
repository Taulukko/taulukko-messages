import { WebSocket } from "src/ws";

export interface ClientData{
    id:string;
    topics:Array<string>;
    socket:WebSocket;
  }