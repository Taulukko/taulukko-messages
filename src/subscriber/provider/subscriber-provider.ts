import { Data } from "src/common/data";
import { Message } from "../../common/message";
import { SubscriberData } from "src/server/provider/server-provider";

export interface SubscriberProvider {
  on( listener:(message: Message)=>any):Promise<any>;
  close():Promise<any>; 
  get data():SubscriberData;
  forceClose():Promise<any>;
  open():Promise<any>;
  
}