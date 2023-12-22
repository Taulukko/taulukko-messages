import { DefaultProvider } from "../provider/default-provider";
import { Provider } from "../provider/provider";
import { ServerData } from "./server-data";
import { loggerFactory } from "../common/logger"; 
import { logerNames ,LogLevel} from "./names";




const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class Server implements Provider {
  provider: Provider;
  options: ServerOptions;

  private constructor(options: any) {
    this.provider = options.provider? options.provider: new DefaultProvider(options) ;

    const defaults = { provider:  new DefaultProvider(options) , defaultLogLevel: LogLevel.INFO };
    options = Object.assign({}, defaults, options);
    this.options = options as ServerOptions;
    logger.options.defaultLevel = this.options.defaultLogLevel;
    console.log(logger.options.defaultLevel,this.options.defaultLogLevel);
  }

  static create(options: any = {} ) : Server{
    const server=  new Server(options);
    logger.trace("New server created ", server);
    return server;
  }
  
  public async open() {
    const ret =  this.provider.open();
    logger.trace("Server started on port: ", this.provider.data().port);
    return ret;
  }
  public async close(){
    const ret =  this.provider.close();
    logger.trace("Server stoped ");
    return ret
  }
  public async forceClose(){
    const ret = this.provider.forceClose();
    logger.trace("Server stoped (forced)");
    return ret;
  }
  public data():ServerData  {
    return this.provider.data();
  }
  public publishers():Array<any>{
    return this.provider.publishers();
  }
  public subscribers():Array<any>{
    return this.provider.subscribers();
  }

  public async sendAll(topic:string,data:any){
    return this.provider.sendAll(topic,data);
  }
    
};
  
interface ServerOptions{
  defaultLogLevel:LogLevel,
  provider:Provider
}


