 
import { Message } from "../../common/message"; 
import { PearData } from "src/common/pear-data";
export interface SubscriberProvider {
  on( listener:(message: Message)=>any):Promise<any>;
  close():Promise<any>; 
  get data():PearData;
  forceClose():Promise<any>;
  open():Promise<any>;
  
}