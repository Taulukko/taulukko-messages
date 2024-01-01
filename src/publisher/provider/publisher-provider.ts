import { ProviderData } from "../provider-data";

export interface PublisherProvider {
  send( ...data: any): any;
  close():any; 
  get data():ProviderData;
  forceClose():any;
  open():any;
  
}

 