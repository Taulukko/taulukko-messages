import { DefaultServerProvider } from "./provider/default-server-provider";
import { ClientData,logerNames,ServerData,ServerProvider,LogLevel } from "taulukko-messages-core";
import { loggerFactory } from "../common/log/logger"; 
import { AuthProvider } from "taulukko-messages-client";



const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class Server implements ServerProvider { 
  options: ServerOptions;

  private constructor(options: any) { 
    
    const defaultProvider:ServerProvider =   new DefaultServerProvider(options) ; 

    const defaults = { provider:  defaultProvider , defaultLogLevel: LogLevel.INFO };
    options = Object.assign({}, defaults, options);
    this.options = options as ServerOptions;
   }

  static create(options: any = {} ) : Server{ 
    const server=  new Server(options);
    logger.log7("New server created ", server);
    return server;
  }
  
  public async open() {
    const ret =  this.options.provider.open();
    logger.log7("Server started on port: ", this.options.provider.data.port);
    return ret;
  }
  public async close(){
    const ret =  this.options.provider.close();
    logger.log7("Server stoped ");
    return ret
  }
  public async forceClose(){
    const ret = this.options.provider.forceClose();
    logger.log7("Server stoped (forced)");
    return ret;
  }
  public get data():ServerData  {
    return this.options.provider.data;
  }
  public get publishers():Array<ClientData>{
    return this.options.provider.publishers;
  }
  public get subscribers():Array<ClientData>{
    return this.options.provider.subscribers;
  }

  public async sendAll(data:any){
    return this.options.provider.sendAll(data);
  }
    
};
  
interface ServerOptions{ 
  provider:ServerProvider,
  auth?:AuthProvider
}


