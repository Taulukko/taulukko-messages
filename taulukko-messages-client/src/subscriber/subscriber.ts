 
import { DefaultSubscriberProvider } from "./provider/default-subscriberprovider";
import { Listener, SubscriberProvider,PearData } from "taulukko-messages-core"; 
 
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
      
      console.log("New subscriber created ", publisher);
       
      return publisher;
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
  
interface SubscriberOptions{ 
  provider:SubscriberProvider,
  topics:Array<string>
}

