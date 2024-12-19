import { WebSocket } from "../ws/web-socket"; 

export interface ClientData{
    id:string;
    topics:Array<string>;
    socket:WebSocket;
  }