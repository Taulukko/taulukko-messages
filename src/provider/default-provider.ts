 
import {Provider} from "./provider"; 
import { ServerData } from '../server/server-data';
import {serverStatus} from "../server/names"; 
import { logerNames} from "../server/names"; 
import { loggerFactory } from "../common/logger";
import { WSServer, WSServerOptions } from "src/server/ws-server";


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultProvider implements Provider {
  options:TaulukkoProviderOptions;
  status:string;
  wsServer:WSServer;
 

  constructor(options:any){
    const defaults = { port: 7777, defaultMessage:"Taulukko Message Server is Running" ,showDefaultMessage:true};
    options = Object.assign({}, defaults, options);
    this.options = options as TaulukkoProviderOptions;
    this.wsServer = new WSServer(options);
    this.status = serverStatus.SERVER_STATUS_STARTING;
  }

    async open() {
      logger.info("TaulukkoProvider starting with options : " , this.options);
      await  this.wsServer.open();
      this.status = serverStatus.SERVER_STATUS_ONLINE;
    }

  async close() {
    await this.wsServer.close();
    this.status = serverStatus.SERVER_STATUS_STOPED;
    logger.trace("TaulukkoProvider ends ");
  }
  async forceClose() {
    try{
      await this.close();
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
  async sendAll(topic: string, data: any) {
    throw new Error('Method not implemented.');
  } 
}

interface TaulukkoProviderOptions extends WSServerOptions{
}