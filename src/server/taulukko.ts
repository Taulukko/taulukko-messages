 
import {Provider} from "../common/provider"; 
import { ServerData } from './server-data';
import * as serverStatus from "./server"; 

export class TaulukkoProvider implements Provider {
  options:TaulukkoProviderOptions;
  status:string;
 

  constructor(options:any){
    const defaults = { port: 7777 };
    options = Object.assign({}, defaults, options);
    this.options = options as TaulukkoProviderOptions;
    this.status = serverStatus.SERVER_STATUS_STARTING;
  }

  open() {
    this.status = serverStatus.SERVER_STATUS_ONLINE;
  }
  close() {
    this.status = serverStatus.SERVER_STATUS_STOPED;
  }
  forceClose() {
    try{
      this.close();
    }
    catch{
      //TODO:LOG
      this.status = serverStatus.SERVER_STATUS_STOPED;
    }
  }
  data(): ServerData {
    return {port:this.options.port, status: this.status ,
      online:this.status==serverStatus.SERVER_STATUS_ONLINE,
      offline:this.status!=serverStatus.SERVER_STATUS_ONLINE};
  }
  publishers(): any[] {
    throw new Error('Method not implemented.');
  }
  subscribers(): any[] {
    throw new Error('Method not implemented.');
  }
  sendAll(topic: string, data: any) {
    throw new Error('Method not implemented.');
  } 
}

interface TaulukkoProviderOptions {
  port:number;
}