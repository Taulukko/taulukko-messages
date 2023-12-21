import { ServerData } from "src/server/server-data"; 
 
export interface Provider {
  open():any;
  close():any;
  forceClose():any;
  data():ServerData;
  publishers():Array<any>;
  subscribers():Array<any>;
  sendAll(topic:string,data:any):any;    
}