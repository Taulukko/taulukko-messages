 
import {Provider} from "./provider"; 
import { ServerData } from '../server/server-data';
import {serviceStatus} from "../common/names"; 
import { logerNames} from "../common/names"; 
import { loggerFactory } from "../common/logger";
import { WSServer,WSServerOptions } from "../ws"; 

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultProvider implements Provider {
  options:TaulukkoProviderOptions;
  status:string;
  wsServer:WSServer;
 

  constructor(options:any){
    const defaults = { port: 7777, defaultMessage:"Taulukko Message Server is Running" ,showDefaultMessage:true};
    options = Object.assign({}, defaults, options);
    this.options = options as TaulukkoProviderOptions;
    this.wsServer = WSServer.create(options);
    this.status = serviceStatus.STARTING;
  }

    async open() {
      logger.info("TaulukkoProvider starting with options : " , this.options);
      await  this.wsServer.open();
      this.status = serviceStatus.ONLINE;
    }

  async close() {
    await this.wsServer.close();
    this.status = serviceStatus.STOPED;
    logger.trace("TaulukkoProvider ends ");
  }
  async forceClose() {
    try{
      await this.close();
    }
    catch{
      //TODO:LOG
      this.status = serviceStatus.STOPED;
    }
    logger.trace("TaulukkoProvider ends (forced) ");
  }
  data(): ServerData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE};
      logger.trace("get data ", ret);
      return ret;
  }
  publishers(): any[] {
    throw new Error('Method not implemented.');
  }
  subscribers(): any[] {
    throw new Error('Method not implemented.');
  }
  async sendAll(topic: string, data: any) {
    throw new Error('Method not implemented.');
  } 
}

interface TaulukkoProviderOptions extends WSServerOptions{
}