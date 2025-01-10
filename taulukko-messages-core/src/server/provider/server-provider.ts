 
import { ClientData } from "../client-data";
import { ServerData } from "../server-data";
 
export interface ServerProvider {
  close():any; 
  get data():ServerData;
  forceClose():any;
  open():any;
  get publishers():Array<ClientData>;
  get subscribers():Array<ClientData>;
  sendAll(data:any):any;
}

  