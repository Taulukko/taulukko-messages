import { LogLevel , logerNames} from "../common/names";
import {Data} from "../common/data";
import { loggerFactory } from "../common/log/logger";
import { DefaultSubscriberProvider } from "./provider/default-subscriberprovider";
import { SubscriberProvider } from "./provider/subscriber-provider";
import { Message } from "src/common/message";
import { ClientData } from "src/server/client-data";
import { PearData } from "src/common/pear-data";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
export class Subscriber implements SubscriberProvider {
  provider: SubscriberProvider;
  options: SubscriberOptions;

    private constructor(options: any) {
      this.provider = options.provider? options.provider: new DefaultSubscriberProvider(options) ;

      const defaults = { 
        provider:  new DefaultSubscriberProvider(options) ,  
        server:"taulukko:\\localhost:7777",
        topics: new Array()};
      options = Object.assign({}, defaults, options);
      this.options = options as SubscriberOptions;
    }


    static create(options: any):Subscriber {
      const publisher =  new Subscriber(options);
      
      logger.log7("New subscriber created ", publisher);
       
      return publisher;
    }
    
    async open():Promise<void>{
      logger.log7("Subscriber open ");
      return await this.provider.open();
    }
    async close():Promise<void>{
      await this.provider.close();
    }
    get data():PearData  {
      return this.provider.data;
    }
    async on( listener:(message:Message)=>void){
      return await this.provider.on(listener);
    }

    async forceClose(): Promise<void> {
      return await this.provider.forceClose();
    }

    
    async waitReconnect():Promise<boolean>{
      return this.provider.waitReconnect();
    }
  }
  
interface SubscriberOptions{ 
  provider:SubscriberProvider,
  topics:Array<string>
}

