 
import { Message } from "../../common/message"; 
import { PearData } from "../../common/pear-data";
import {WSServerOptions} from "../../ws/ws-server-options";

export interface SubscriberProvider {
  on( listener:Listener):Promise<any>;
  get data():PearData;
  forceClose():Promise<void>;
  open():Promise<void>;
  close():Promise<void>;
  waitReconnect(): Promise<boolean>;
}

export interface Listener{
  (message: Message) : Promise<any>;
}


export interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>
}


export interface SubscriberOptions{ 
  provider:SubscriberProvider,
  topics:Array<string>
}

