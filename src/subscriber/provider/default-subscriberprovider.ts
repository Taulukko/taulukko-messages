 
import {SubscriberProvider,Listener} from "./subscriber-provider";  
import {serviceStatus,logerNames,protocolNames,clientTypes} from "../../common/names";  
import { loggerFactory } from "../../common/log/logger";
import {  WSServerOptions, WebSocket } from "../../ws";

import * as io from "socket.io-client";
import { Message } from "src/common/message";  
import { PearData } from "src/common/pear-data";
import { Server } from "socket.io";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);


export class DefaultSubscriberProvider implements SubscriberProvider {

  options:TaulukkoProviderOptions;
  status:string; 
  client:io.Socket;
  id:string;
  listeners : Array<Listener> = new Array(); 

  
 constructor(options:any){
    const defaults = { port: 7777, topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    this.status = serviceStatus.STARTING;
  }

 

  on = async (listener:  Listener)=> {
    logger.log7("Taulukko Subscriber Provider on: inserting a new listener " );
    this.listeners.push(listener);
    await this.client.on( protocolNames.NEW_MESSAGE,(message:Message)=>{

      listener(message)
    });  
    };
 
  open = async () :Promise<void>  => {
    if(this.status!==serviceStatus.STARTING && this.status!==serviceStatus.RESTARTING){
      throw Error("Subscriber already started");
    }
    logger.log7("Taulukko Subscriber Provider starting with options : " , this.options);

    const ret : Promise<void> = new Promise(async (resolve,reject)=>{
     logger.log7("Taulukko Subscriber Provider preparing the connection with websocket " );

      this.client = io.connect("http://localhost:7777");

      logger.log7("Taulukko Subscriber Provider get connection with server ");
       
      
      await this.onTaulukkoServerConnectionOK(resolve).then((onTaulukkoServerConnectionOK)=>{
        this.client.on(protocolNames.CONNECTION_OK,onTaulukkoServerConnectionOK );
      });

      await this.onTaulukkoServerRegisteredClient(resolve).then((onTaulukkoServerRegisteredClient)=>{
        this.client.on(protocolNames.REGISTERED,onTaulukkoServerRegisteredClient );
      });

      await this.onTaulukkoServerUnregisteredClient(resolve,this).then((onTaulukkoServerUnregisteredClient)=>{
        this.client.on(protocolNames.UNREGISTERED,onTaulukkoServerUnregisteredClient );
      });
  
      logger.log7("Taulukko Subscriber Provider listen connection ok from server ");

      this.client.on('connect', () => {
        logger.log7("Taulukko Subscriber Provider connection with server sucefull ");
      });
      logger.log7("Taulukko Subscriber Provider finish open, waiting for the connection ");
    
      this.client.on('disconnect',  this.onDisconnect);
    });
    return ret;
  };

  private  onDisconnect = () =>{
    
    if(this.status ===  serviceStatus.STOPED )
    {
      return;
    }
   
    logger.log0("Server disconnected, restarting the connection");
    this.client.close();
    this.status = serviceStatus.RESTARTING;
    let isOpenning = false;
    const handle = setInterval(async ()=>{
      try{
        if(isOpenning &&  this.status === serviceStatus.RESTARTING)
          { 
            return;
          }
        isOpenning = true;
        await this.open();
        clearInterval(handle);
        isOpenning=false; 
      }
      catch(e)
      {
        isOpenning=false;
        logger.error(e);
      }
    },1000);
  };

  onTaulukkoServerConnectionOK = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
        logger.log7("Taulukko Subscriber Provider onTaulukkoServerConnectionOK ",websocket);
        this.id = websocket.client.id;
        logger.log7( "this.socket",this.client,this.client.emit,protocolNames.CLIENT_ONLINE,clientTypes.SUBSCRIBER,this);
        await this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.SUBSCRIBER,id:this.id,topics:this.data.topics});
         
      });
  };

 
  onTaulukkoServerRegisteredClient = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
        logger.log7("Taulukko Subscriber Provider onTaulukkoServerRegisteredClient ",websocket); 
        if(this.status==serviceStatus.RESTARTING)
        {

          this.listeners.forEach((listener)=>{
            this.on(listener);
          });
        }
        this.status = serviceStatus.ONLINE; 
        resolve(); 
      });
  };

  
  onTaulukkoServerUnregisteredClient = async (resolve: (ret:any)=>void,me:DefaultSubscriberProvider )=>{
    const ret =  (async (websocket:WebSocket)=>{
        logger.log7("Taulukko Publisher Provider onTaulukkoServerRegisteredClient ",websocket); 
        this.status = serviceStatus.STOPED;
     
        try{
          me.client.close();
        }
        catch(e)
        {}
         
        resolve({}); 

      });
      return  ret;
  };
  
  close = () : Promise<void> =>  {

    const ret : Promise<void> = new Promise(async (resolve,reject)=>{
      if(this.status!=serviceStatus.ONLINE){
        throw Error("Subscriber isnt open");
      }
      await this.client.emit(protocolNames.CLIENT_OFFLINE,{type:clientTypes.SUBSCRIBER, id:this.id});
      const handle = setInterval(async ()=>{
        if(this.status == serviceStatus.STOPED)
        {
          clearInterval(handle);
          try{
            this.client.close();
          }
          catch(e)
          {}
          resolve();
        }
      },100); 
      logger.log7("Taulukko Subscriber Provider ends");
    });
   return ret;
  };

  forceClose = async () : Promise<void> => {
    logger.log7("Taulukko Subscriber Provider forceClose ");
    try{
       this.close();
    }
    catch{
      logger.log7("Taulukko Subscriber Provider error ");
    
    }
    this.status = serviceStatus.STOPED;
    
    
  };

  waitReconnect = async () : Promise<boolean> => {
    return new Promise<boolean>((resolve)=>{
      const handle = setInterval(async ()=>{
        
        if(this.status != serviceStatus.ONLINE)
        {
          return;
        }
        clearInterval(handle);
        resolve(true);
      },100);
    });
  };


  get data (): PearData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE,id:this.id,topics:this.options.topics};
      logger.log7("get data ", ret);
      return ret;
  }
  
}

interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>
}

