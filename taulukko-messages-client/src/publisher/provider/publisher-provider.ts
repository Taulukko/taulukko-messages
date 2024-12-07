import { PearData } from "taulukko-messages-core"; 

export interface PublisherProvider {
  send( ...data: any): any;
  close():Promise<void>; 
  get data():PearData;
  forceClose():Promise<void>;
  open ():Promise<void>;
  waitReconnect(): Promise<boolean>; 
}

 