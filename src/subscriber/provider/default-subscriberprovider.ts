 
import {SubscriberProvider} from "./subscriber-provider";  
import {serviceStatus,logerNames,protocolNames,clientTypes} from "../../server/names";  
import { loggerFactory } from "../../common/logger";
import {  WSServerOptions, WebSocket } from "../../ws";

import * as io from "socket.io-client";
import { Message } from "src/common/message";  
import { PearData } from "src/common/pear-data";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultSubscriberProvider implements SubscriberProvider {

  options:TaulukkoProviderOptions;
  status:string; 
  client:io.Socket;
  id:string;
 

  constructor(options:any){
    const defaults = { port: 7777, topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    this.status = serviceStatus.STARTING;
  }
  on = async (listener:    (message: Message) => Promise<any>)=> {
    logger.trace("Taulukko Subscriber Provider on: inserting a new listener " );
    this.options.topics.forEach(async(topic,index)=>{
      await this.client.on( protocolNames.NEW_MESSAGE,(message:Message)=>{
        console.log("Subscriber:onNewMessage");

        listener(message)
      }); 
    });
    };
 
  open = async () :Promise<any>  => {
    if(this.status!=serviceStatus.STARTING){
      throw Error("Subscriber already started");
    }
    logger.info("Taulukko Subscriber Provider starting with options : " , this.options);

    const ret = new Promise((resolve,reject)=>{
    

      logger.trace("Taulukko Subscriber Provider preparing the connection with websocket " );

      this.client = io.connect("http://localhost:7777");

      logger.trace("Taulukko Subscriber Provider get connection with server ");
       
      
      this.onTaulukkoServerConnectionOK(resolve).then((onTaulukkoServerConnectionOK)=>{
        this.client.on(protocolNames.CONNECTION_OK,onTaulukkoServerConnectionOK );
      });

      this.onTaulukkoServerRegisteredClient(resolve).then((onTaulukkoServerRegisteredClient)=>{
        this.client.on(protocolNames.REGISTERED,onTaulukkoServerRegisteredClient );
      });

  
      logger.trace("Taulukko Subscriber Provider listen connection ok from server ");

     
  
      this.client.on('connect', () => {
        logger.trace("Taulukko Subscriber Provider connection with server sucefull ");
      });
      logger.trace("Taulukko Subscriber Provider finish open, waiting for the connection ");
    
    });
    return ret;
  };

  onTaulukkoServerConnectionOK = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
        logger.trace("Taulukko Subscriber Provider onTaulukkoServerConnectionOK ",websocket);
        this.id = websocket.client.id;
        logger.trace( "this.socket",this.client,this.client.emit,protocolNames.CLIENT_ONLINE,clientTypes.SUBSCRIBER,this);
        await this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.SUBSCRIBER,id:this.id,topics:this.data.topics});
         
      });
  };

 
  onTaulukkoServerRegisteredClient = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
        logger.trace("Taulukko Subscriber Provider onTaulukkoServerRegisteredClient ",websocket); 
        this.status = serviceStatus.ONLINE; 
        resolve(); 
      });
  };
  
 

  close = async () =>  {
    
    if(this.status!=serviceStatus.ONLINE){
      throw Error("Subscriber isnt open");
    } 
    this.client.close();
    this.status = serviceStatus.STOPED;
    logger.trace("Taulukko Subscriber Provider ends ");
  };

  forceClose = async () => {
    logger.trace("Taulukko Subscriber Provider forceClose ");
    try{
      await this.close();
    }
    catch{
      logger.trace("Taulukko Subscriber Provider error ");
    
    }
    this.status = serviceStatus.STOPED;
    
    
  };

  get data (): PearData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE,id:this.id,topics:this.options.topics};
      logger.trace("get data ", ret);
      return ret;
  }
  
}

interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>
}

