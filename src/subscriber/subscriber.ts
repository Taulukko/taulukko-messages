import { LogLevel , logerNames} from "../common/names";
import {Data} from "../common/data";
import { loggerFactory } from "../common/logger";
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
        defaultLogLevel: LogLevel.INFO,
        server:"taulukko:\\localhost:7777",
        topics: new Array()};
      options = Object.assign({}, defaults, options);
      this.options = options as SubscriberOptions;
      logger.options.defaultLevel = this.options.defaultLogLevel;
    }


    static create(options: any):Subscriber {
      const publisher =  new Subscriber(options);
      
      logger.trace("New subscriber created ", publisher);
       
      return publisher;
    }
    
    async open(){
      logger.trace("Subscriber open ");
      return await this.provider.open();
    }
    async close(){
      await this.provider.close();
    }
    get data():PearData  {
      return this.provider.data;
    }
    async on( listener:(message:Message)=>void){
      return await this.provider.on(listener);
    }

    async forceClose(): Promise<any> {
      return await this.provider.forceClose();
    }
  }
  
interface SubscriberOptions{
  defaultLogLevel:LogLevel,
  provider:SubscriberProvider,
  topics:Array<string>
}

