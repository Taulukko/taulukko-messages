 
import {Provider} from "../common/provider"; 
import { ServerData } from './server-data';
import {serverStatus} from "./names"; 
import { logerNames} from "./names"; 
import { loggerFactory } from "../common/logger"; 
 

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

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
    logger.trace("TaulukkoProvider start with options : " , this.options);
  }
  close() {
    this.status = serverStatus.SERVER_STATUS_STOPED;
    logger.trace("TaulukkoProvider ends ");

  }
  forceClose() {
    try{
      this.close();
    }
    catch{
      //TODO:LOG
      this.status = serverStatus.SERVER_STATUS_STOPED;
    }
    logger.trace("TaulukkoProvider ends (forced) ");
  }
  data(): ServerData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serverStatus.SERVER_STATUS_ONLINE,
      offline:this.status!=serverStatus.SERVER_STATUS_ONLINE};
      logger.trace("get data ", ret);
      return ret;
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