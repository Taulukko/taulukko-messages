 
import {PublisherProvider} from "./publisher-provider";  
import {serverStatus,logerNames,protocolNames,clientTypes} from "../../server/names";  
import { loggerFactory } from "../../common/logger";
import { WSServerOptions, WebSocket } from "../../server/ws-server";

import * as io from "socket.io-client";
import { ProviderData } from "../provider-data";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultPublisherProvider implements PublisherProvider {
  options:TaulukkoProviderOptions;
  status:string; 
  client:io.Socket;
  id:string;
 

  constructor(options:any){
    const defaults = { port: 7777 ,topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    this.status = serverStatus.STARTING;
  }

  send(...data: any) {
    this.options.topics.forEach((item,index)=>{
      this.client.emit(item,...data);
    }); 
  }

  open =   () :Promise<any>  => {
    if(this.status!=serverStatus.STARTING){
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
        this.status = serverStatus.ONLINE; 
        resolve(); 
      });
  };

  close = async () =>  {
    
    if(this.status!=serverStatus.ONLINE){
      throw Error("Publisher isnt open");
    } 
    this.client.close();
    this.status = serverStatus.STOPED;
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
    this.status = serverStatus.STOPED;
     
    
  };

  get data() :ProviderData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serverStatus.ONLINE,
      offline:this.status!=serverStatus.ONLINE,topics:this.options.topics};
      logger.trace("get data ", ret);
      return ret;
  }
}

interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>
}
 