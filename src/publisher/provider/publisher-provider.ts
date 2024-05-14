import { PearData } from "src/common/pear-data"; 

export interface PublisherProvider {
  send( ...data: any): any;
  close():Promise<void>; 
  get data():PearData;
  forceClose():Promise<void>;
  open():Promise<void>;
  waitReconect(): Promise<boolean>;
}

 