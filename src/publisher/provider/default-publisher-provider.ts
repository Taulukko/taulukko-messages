 
import {PublisherProvider} from "./publisher-provider";  
import {serviceStatus,logerNames,protocolNames,clientTypes} from "../../server/names";  
import { loggerFactory } from "../../common/logger";
import {WebSocket, WSClient, WSServerOptions } from "../../ws/"; 
import { PearData } from "src/common/pear-data"; 

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultPublisherProvider implements PublisherProvider {
  options:TaulukkoProviderOptions;
  status:string; 
  client:WSClient;
  id:string;
 

  constructor(options:any){
    const defaults = { port: 7777 ,topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    this.status = serviceStatus.STARTING;
  }

  send(...data: any) {
    this.options.topics.forEach((item,index)=>{
      this.client.emit(item,...data);
    }); 
  }

  open =   () :Promise<any>  => {
    if(this.status!=serviceStatus.STARTING){
      throw Error("Publisher already started");
    }
    logger.info("Taulukko Publisher Provider starting with options : " , this.options);

    const ret = new Promise((resolve,reject)=>{
    

      logger.trace("Taulukko Publisher Provider preparing the connection with websocket " );

      this.client = io.connect("http://localhost:7777");

      logger.trace("Taulukko Publisher Provider get connection with server ");

      
      this.onTaulukkoServerConnectionOK(resolve).then((onTaulukkoServerConnectionOK)=>{
        this.client.on(protocolNames.CONNECTION_OK,onTaulukkoServerConnectionOK );
      });

      this.onTaulukkoServerRegisteredClient(resolve).then((onTaulukkoServerRegisteredClient)=>{
        this.client.on(protocolNames.REGISTERED,onTaulukkoServerRegisteredClient );
      });

      logger.trace("Taulukko Publisher Provider listen connection ok from server ");

     
  
      this.client.on('connect', () => {
        logger.trace("Taulukko Publisher Provider connection with server sucefull ");
      });
      logger.trace("Taulukko Publisher Provider finish open, waiting for the connection ");
    
    });
    return ret;
  };

  onTaulukkoServerConnectionOK = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
        logger.trace("Taulukko Publisher Provider onTaulukkoServerConnectionOK ",websocket);
        this.id = websocket.client.id;
        logger.trace( "this.socket",this.client,this.client.emit,protocolNames.CLIENT_ONLINE,clientTypes.PUBLISHER,this);
        await this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.PUBLISHER,id:this.id,topics:this.data.topics});
         
      });
  };

  onTaulukkoServerRegisteredClient = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
        logger.trace("Taulukko Publisher Provider onTaulukkoServerRegisteredClient ",websocket); 
        this.status = serviceStatus.ONLINE; 
        resolve(); 
      });
  };

  close = async () =>  {
    
    if(this.status!=serviceStatus.ONLINE){
      throw Error("Publisher isnt open");
    } 
    this.client.close();
    this.status = serviceStatus.STOPED;
    logger.trace("Taulukko Publisher Provider ends ");
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
 