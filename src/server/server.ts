import { TaulukkoProvider } from "./taulukko";
import { Provider } from "../common/provider";
import { ServerData } from "./server-data";

export class Server implements Provider {
  provider: Provider;

  private constructor(options: any) {
    this.provider = options.provider? options.provider: new TaulukkoProvider(options) ;
  }

  static create(options: any = {} ) : Server{
    return new Server(options);
  }
  
  public async open(){
    return this.provider.open();
  }
  public async close(){
    return this.provider.close();
  }
  public async forceClose(){
    return this.provider.forceClose();
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
  
export const SERVER_STATUS_STARTING = "STARTING";
export const SERVER_STATUS_ONLINE = "ONLINE";
export const SERVER_STATUS_FAIL = "FAIL";
export const SERVER_STATUS_RESTARTING = "RESTARTING";
export const SERVER_STATUS_STOPED = "STOPED";

