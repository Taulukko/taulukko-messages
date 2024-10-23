import { LogLevel , logerNames} from "../common/names"; 
import { loggerFactory } from "../common/log/logger";  
import { PublisherProvider } from "./provider/publisher-provider";
import { DefaultPublisherProvider } from "./provider/default-publisher-provider";
import { PearData } from "src/common/pear-data";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
export class Publisher implements PublisherProvider{
  provider: PublisherProvider;
  options: PublisherOptions;

    private constructor(options: any) {
  
      const defaults = { 
        defaultLogLevel: LogLevel.INFO,
        server:"taulukko://localhost:7777",
        topics: new Array()};
      options = Object.assign({}, defaults, options);

      if(!this.validarUrl(options.server))
      {
        throw new Error(options.server + " isnt a correct url, eg: taulukko://localhost:7777 ");
      } 
      options.port = this.extractPort(options.server);
      options.host = this.extractHost(options.server);
 
      console.log("Publisher",options);
      this.provider = options.provider? options.provider:   DefaultPublisherProvider.create(options) ;
      this.options = options as PublisherOptions; 
    }

    private validarUrl(url: string): boolean {
      const padrao = /^taulukko:\/\/([a-zA-Z0-9.-]+|\d{1,3}(\.\d{1,3}){3}):\d+$/;
      return padrao.test(url);
   }

    private extractPort(server:string): number {
      return parseInt(server.split(":")[2]);
    }

    private extractHost(server:string): string {
      return server.split("//")[1].split(":")[0];
    }
    
    static create(options: any):Publisher {
      console.log("Publisher.create",options);
      const publisher =  new Publisher(options);
      
      logger.log7("New publisher created ", publisher);
       
      return publisher;
    }
    
    async open(){
      logger.info("Publisher open ");
      const ret = await this.provider.open();
      return ret; 
    }
    async close(){ 
      const ret  =  await this.provider.close(); 
      return ret;
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

    async waitReconnect():Promise<boolean>{
      return this.provider.waitReconnect();
    }
  }
  
interface PublisherOptions{
  defaultLogLevel:LogLevel,
  provider:PublisherProvider,
  topics:Array<string>
}


