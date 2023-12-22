import { ServerData } from "../server/server-data"; 
 
export interface Provider {
  close():any; 
  data():ServerData;
  forceClose():any;
  open():any;
  publishers():Array<any>;
  subscribers():Array<any>;
  sendAll(topic:string,data:any):any;
}