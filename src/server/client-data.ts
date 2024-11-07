import { WebSocket } from "../ws";

export interface ClientData{
    id:string;
    topics:Array<string>;
    socket:WebSocket;
  }