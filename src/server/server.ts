import {Data} from "src/common/data";
import {Rabbit} from "src/strategy/rabbit";
import { Taulukko } from "src/strategy/taulukko";
import { Provider } from "src/provider";

export class Server {
  provider: Provider

  constructor() {
    const providers = [new Taulukko(), new Rabbit()]
    // TODO: get name from environment variable to send to canHandle
    this.provider = providers.find((strategy) => strategy.canHandle("default"));
    if (this.provider) {
      this.provider.run()
    } else {
      throw new Error("Provider not found.");
    }
  }

  static create(options: {}) : Server{
    throw new Error('Method not implemented.');
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
  
export interface ServerData extends Data {
  port:number;
  host:string;
}
  