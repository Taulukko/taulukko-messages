 import {PublisherProvider} from "./publisher-provider";  
import {serviceStatus,logerNames,protocolNames,clientTypes} from "../../common/names";  
import { loggerFactory } from "../../common/log/logger";
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

  open = async  () :Promise<void>  => {
      
    if(this.status!=serviceStatus.STARTING){
      throw Error("Publisher already started");
    }
   
    logger.log5("Taulukko Publisher Provider starting with options : " );
    
    const ret:Promise<void> = new Promise(async (resolve,reject)=>{

      logger.log4("Taulukko Publisher Provider preparing the connection with websocket " );

      this.client = WSClient.create(this.options);

      this.client.open();

      logger.log5("Taulukko Publisher Provider get connection with server ");

      await this.onTaulukkoServerConnectionOK(resolve).then((onTaulukkoServerConnectionOK)=>{
        this.client.on(protocolNames.CONNECTION_OK,onTaulukkoServerConnectionOK );
      });
      await  this.onTaulukkoServerRegisteredClient(resolve).then((onTaulukkoServerRegisteredClient)=>{
        this.client.on(protocolNames.REGISTERED,onTaulukkoServerRegisteredClient );
      });
      await  this.onTaulukkoServerUnregisteredClient(reject,this).then((onTaulukkoServerUnregisteredClient)=>{
        this.client.on(protocolNames.UNREGISTERED,onTaulukkoServerUnregisteredClient );
      });
      logger.log5("Taulukko Publisher Provider listen connection ok from server ");

       this.client.on('connect', () => {
        logger.log5("Taulukko Publisher Provider connection with server sucefull ");
      });
      logger.log5("Taulukko Publisher Provider finish open, waiting for the connection ");

      logger.log5("Taulukko Publisher Provider finish open, start detect disconnect ");

    
      this.client.on('disconnect',  this.onDisconnect);
      
    });
    
    return ret;
  };

  private  onDisconnect = () =>{
    //console.log("onDisconnect",this.status, serviceStatus.STOPED);
    if(this.status ===  serviceStatus.STOPED )
      {
        return;
      }
      //console.log("Server disconnected, restarting the connection");
      logger.log0("Server disconnected, restarting the connection");
      this.status = serviceStatus.RESTARTING;
  };

  onTaulukkoServerConnectionOK = async (_: any)=>{
    return  (async (websocket:WebSocket)=>{
        logger.log5("Taulukko Publisher Provider onTaulukkoServerConnectionOK ");
        this.id = websocket.client.id;
        logger.log7( "this.socket",this.client,this.client.emit,protocolNames.CLIENT_ONLINE,clientTypes.PUBLISHER,this);
        await this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.PUBLISHER,id:this.id,topics:this.data.topics});
      });
  };

  onTaulukkoServerRegisteredClient = async (resolve: (ret:any)=>void )=>{
    const ret =  (async (websocket:WebSocket)=>{
    
        logger.log4("Taulukko Publisher Provider onTaulukkoServerRegisteredClient "); 
        this.status = serviceStatus.ONLINE;
        resolve({}); 
    
      });
      return  ret;
  };

  onTaulukkoServerUnregisteredClient = async (reject: (ret:any)=>void , me:DefaultPublisherProvider)=>{
    const ret =  (async (websocket:WebSocket)=>{

        logger.log5("Taulukko Publisher Provider onTaulukkoServerUnregisteredClient"); 
        logger.log7("onTaulukkoServerUnregisteredClient resolvido com rejeição ",reject); 
        this.status = serviceStatus.STOPED; 
        me.client.forceClose();
        logger.log5("Taulukko Publisher Provider rejeitando em onTaulukkoServerUnregisteredClient"); 
        reject({}); 
      
      });
      return  ret;
  };
 

  close = async () : Promise<void> =>  {

    const ret : Promise<void> = new Promise(async (resolve,)=>{

      if(this.status!=serviceStatus.ONLINE){

        logger.error("Publisher isnt open");
        throw Error("Publisher isnt open");
      }

      await this.client.emit(protocolNames.CLIENT_OFFLINE,{type:clientTypes.PUBLISHER, id:this.id});

      const handle = setInterval(async ()=>{

        if(this.status == serviceStatus.STOPED)
        {

          clearInterval(handle);

          this.client.forceClose();

          resolve();

        }
      },100); 
      logger.log7("Taulukko Publisher Provider ends");
    });

   return ret;
  };

  forceClose = async () :Promise<void> => {
    logger.log7("Taulukko Publisher Provider forceClose ");
    try{
      this.close();
    }
    catch{
      logger.log7("Taulukko Publisher Provider error ");
    }
    this.status = serviceStatus.STOPED;
    
  };

  waitReconnect = async () : Promise<boolean> => {
    return false;
  };

  get data() :PearData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE,topics:this.options.topics};
      logger.log7("get data ", ret);
      return ret;
  }
}

interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>
}
 