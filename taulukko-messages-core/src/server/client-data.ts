import { WSSocket } from "../ws/ws-socket"; 

export interface ClientData{
    id:string;
    topics:Array<string>;
    socket:WSSocket;
  }