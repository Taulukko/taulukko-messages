 
import { Message } from "../../common/message"; 
import { PearData } from "src/common/pear-data";
export interface SubscriberProvider {
  on( listener:(message: Message)=>any):Promise<any>;
  get data():PearData;
  forceClose():Promise<void>;
  open():Promise<void>;
  close():Promise<void>;
  waitReconnect(): Promise<boolean>;

  
}