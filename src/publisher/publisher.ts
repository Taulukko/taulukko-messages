import { LogLevel , logerNames} from "../common/names"; 
import { loggerFactory } from "../common/logger";  
import { PublisherProvider } from "./provider/publisher-provider";
import { DefaultPublisherProvider } from "./provider/default-publisher-provider";
import { PearData } from "src/common/pear-data";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
export class Publisher implements PublisherProvider{
  provider: PublisherProvider;
  options: PublisherOptions;

    private constructor(options: any) {
      this.provider = options.provider? options.provider:   DefaultPublisherProvider.create(options) ;

      const defaults = { 
        provider:    DefaultPublisherProvider.create(options) , 
        defaultLogLevel: LogLevel.INFO,
        server:"taulukko:\\localhost:7777",
        topics: new Array()};
      options = Object.assign({}, defaults, options);
      this.options = options as PublisherOptions;
      logger.options.defaultLevel = this.options.defaultLogLevel;
    }


    static create(options: any):Publisher {
      const publisher =  new Publisher(options);
      
      logger.trace("New publisher created ", publisher);
       
      return publisher;
    }
    
    async open(){
      logger.info("Publisher open ");
      const ret = await this.provider.open();
      return ret; 
    }
    async close(){
      await this.provider.close();
    }
    
    async forceClose() {
      await this.provider.forceClose();
    }

    get data():PearData  {
      return this.provider.data;
    }
    async send( ...data:any){
      return this.provider.send(...data);
    }
  }
  
interface PublisherOptions{
  defaultLogLevel:LogLevel,
  provider:PublisherProvider,
  topics:Array<string>
}

