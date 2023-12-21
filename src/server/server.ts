import { TaulukkoProvider } from "src/server/taulukko";
import { Provider } from "src/common/provider";
import { ServerData } from "./server-data";

export class Server implements Provider {
  provider: Provider;

  private constructor(options: any) {
    this.provider = options.provider? options.provider: new TaulukkoProvider(options) ;
  }

  static create(options: any = {} ) : Server{
    return new Server(options);
  }
  
  public async open(){}
  public async close(){}
  public async forceClose(){}
  public data():ServerData  {
    throw new Error('Method not implemented.');
  }
  public publishers():Array<any>{
    throw new Error('Method not implemented.');
  }
  public subscribers():Array<any>{
    throw new Error('Method not implemented.');
  }

  public async sendAll(topic:string,data:any){
    throw new Error('Method not implemented.');
  }
    
};
  

  