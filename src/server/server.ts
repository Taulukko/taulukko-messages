import { DefaultServerProvider } from "./provider/default-server-provider";
import { ServerProvider } from "./provider/server-provider";
import { ServerData } from "./server-data";
import { loggerFactory } from "../common/logger"; 
import { logerNames ,LogLevel} from "../common/names";
import { ClientData } from "./client-data";




const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class Server implements ServerProvider { 
  options: ServerOptions;

  private constructor(options: any) {
    const defaultProvider:ServerProvider =   new DefaultServerProvider(options) ; 

    const defaults = { provider:  defaultProvider , defaultLogLevel: LogLevel.INFO };
    options = Object.assign({}, defaults, options);
    this.options = options as ServerOptions;
    logger.options.defaultLevel = this.options.defaultLogLevel; 
    logger.trace(logger.options.defaultLevel,this.options.defaultLogLevel);
  }

  static create(options: any = {} ) : Server{
    const server=  new Server(options);
    logger.trace("New server created ", server);
    return server;
  }
  
  public async open() {
    const ret =  this.options.provider.open();
    logger.trace("Server started on port: ", this.options.provider.data.port);
    return ret;
  }
  public async close(){
    const ret =  this.options.provider.close();
    logger.trace("Server stoped ");
    return ret
  }
  public async forceClose(){
    const ret = this.options.provider.forceClose();
    logger.trace("Server stoped (forced)");
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

  public async sendAll(topic:string,data:any){
    return this.options.provider.sendAll(topic,data);
  }
    
};
  
interface ServerOptions{
  defaultLogLevel:LogLevel,
  provider:ServerProvider
}


