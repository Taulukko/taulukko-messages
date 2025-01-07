 
import { DefaultSubscriberProvider } from "./provider/default-subscriberprovider";
import { Listener, SubscriberProvider,PearData,SubscriberOptions } from "taulukko-messages-core"; 
 
export class Subscriber implements SubscriberProvider {
  provider: SubscriberProvider;
  options: SubscriberOptions;

    private constructor(options: any) {

      if(!options.topics || options.topics.length==0)
      { 
        throw new Error("Option topics:Array<String> are required");
      }

      
      
      this.provider = options.provider? options.provider: new DefaultSubscriberProvider(options) ;

      const defaults = { 
        provider:  new DefaultSubscriberProvider(options) ,  
        server:"taulukko:\\localhost:7777",
        topics: new Array()};
      options = Object.assign({}, defaults, options);
      this.options = options as SubscriberOptions;

      
      console.log("New subscriber created ", this);
       
  
    }


    static create(options: any):Subscriber {
      
      return   new Subscriber(options);
    }
    
    async open():Promise<void>{
      console.log("Subscriber open ");
      return await this.provider.open();
    }
    async close():Promise<void>{
      await this.provider.close();
    }
    get data():PearData  {
      return this.provider.data;
    }
    async on( listener:Listener){
      return await this.provider.on(listener);
    }

    async forceClose(): Promise<void> {
      return await this.provider.forceClose();
    }

    
    async waitReconnect():Promise<boolean>{
      return this.provider.waitReconnect();
    }
  }
  