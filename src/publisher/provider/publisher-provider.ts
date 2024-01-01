import { PearData } from "src/common/pear-data"; 

export interface PublisherProvider {
  send( ...data: any): any;
  close():any; 
  get data():PearData;
  forceClose():any;
  open():any;
  
}

 