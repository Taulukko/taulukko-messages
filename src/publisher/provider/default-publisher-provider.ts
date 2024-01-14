 import {PublisherProvider} from "./publisher-provider";  
import {serviceStatus,logerNames,protocolNames,clientTypes} from "../../common/names";  
import { loggerFactory } from "../../common/logger";
import {WSClient ,WebSocket, WSServerOptions } from "../../ws/"; 
import { PearData } from "../../common/pear-data"; 
import { Message } from "../../common/message";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultPublisherProvider implements PublisherProvider {
  
  options:TaulukkoProviderOptions;
  status:string; 
  client:WSClient;
  id:string;
 

  private constructor(options:any){
    const defaults = { port: 7777 ,topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    this.status = serviceStatus.STARTING;
  }

  static create = (options:any):DefaultPublisherProvider=>{
    return new DefaultPublisherProvider(options);
  };

  send(...data: any) {
    this.options.topics.forEach((item,index)=>{
      const message:Message = Message.create({topic:item,data});
      this.client.emit(protocolNames.NEW_MESSAGE,message.struct);
    }); 
  }

  open = async  ()   => {
      
    if(this.status!=serviceStatus.STARTING){
      throw Error("Publisher already started");
    }
    logger.trace("Taulukko Publisher Provider starting with options : " , this.options);
    
    const ret = new Promise(async (resolve,reject)=>{

      logger.trace("Taulukko Publisher Provider preparing the connection with websocket " );

      this.client = WSClient.create(this.options);
      await this.client.open();
      logger.trace("Taulukko Publisher Provider get connection with server ");

      
      await this.onTaulukkoServerConnectionOK(resolve).then((onTaulukkoServerConnectionOK)=>{
        this.client.on(protocolNames.CONNECTION_OK,onTaulukkoServerConnectionOK );
      });
      await  this.onTaulukkoServerRegisteredClient(resolve).then((onTaulukkoServerRegisteredClient)=>{
        this.client.on(protocolNames.REGISTERED,onTaulukkoServerRegisteredClient );
      });
      await  this.onTaulukkoServerUnregisteredClient(resolve).then((onTaulukkoServerUnregisteredClient)=>{
        this.client.on(protocolNames.UNREGISTERED,onTaulukkoServerUnregisteredClient );
      });
      logger.trace("Taulukko Publisher Provider listen connection ok from server ");

     
  
      this.client.on('connect', () => {
        logger.trace("Taulukko Publisher Provider connection with server sucefull ");
      });
      logger.trace("Taulukko Publisher Provider finish open, waiting for the connection ");
    
    });
    
    return ret;
  };

  onTaulukkoServerConnectionOK = async (_: any)=>{
    return  (async (websocket:WebSocket)=>{
        logger.trace("Taulukko Publisher Provider onTaulukkoServerConnectionOK ",websocket);
        this.id = websocket.client.id;
        logger.trace( "this.socket",this.client,this.client.emit,protocolNames.CLIENT_ONLINE,clientTypes.PUBLISHER,this);
        await this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.PUBLISHER,id:this.id,topics:this.data.topics});
      });
  };

  onTaulukkoServerRegisteredClient = async (resolve: (ret:any)=>void )=>{
    const ret =  (async (websocket:WebSocket)=>{
    
        logger.trace("Taulukko Publisher Provider onTaulukkoServerRegisteredClient ",websocket); 
        this.status = serviceStatus.ONLINE;
     
        resolve({}); 
    
      });
      return  ret;
  };

  onTaulukkoServerUnregisteredClient = async (resolve: (ret:any)=>void )=>{
    const ret =  (async (websocket:WebSocket)=>{

        logger.trace("Taulukko Publisher Provider onTaulukkoServerRegisteredClient ",websocket); 
        this.status = serviceStatus.STOPED;
        resolve({}); 
    
      });
      return  ret;
  };
 

  close = () : Promise<void> =>  {
    const ret : Promise<void> = new Promise(async (resolve,reject)=>{
      if(this.status!=serviceStatus.ONLINE){
        throw Error("Publisher isnt open");
      }
      await this.client.emit(protocolNames.CLIENT_OFFLINE,{type:clientTypes.PUBLISHER, id:this.id});
      
      const handle = setInterval(async ()=>{
        if(this.status == serviceStatus.STOPED)
        {
          clearInterval(handle);
          await this.client.close();
          resolve();
        }
      },100); 
      logger.trace("Taulukko Publisher Provider ends");
    });
   return ret;
  };

  forceClose = async () => {
    logger.trace("Taulukko Publisher Provider forceClose ");
    try{
      await this.close();
    }
    catch{
      logger.trace("Taulukko Publisher Provider error ");
    
    }
    this.status = serviceStatus.STOPED;
     
    
  };

  get data() :PearData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE,topics:this.options.topics};
      logger.trace("get data ", ret);
      return ret;
  }
}

interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>
}
 