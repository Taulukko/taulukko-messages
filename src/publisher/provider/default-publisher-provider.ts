 import {PublisherProvider} from "./publisher-provider";  
import {serviceStatus,logerNames,protocolNames,clientTypes} from "../../common/names";  
import { loggerFactory } from "../../common/log/logger";
import {WSClient ,WebSocket, WSServerOptions } from "../../ws/"; 
import { PearData } from "../../common/pear-data"; 
import { Message } from "../../common/message";  
import { Publisher } from "../publisher";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultPublisherProvider implements PublisherProvider {
  
  private options:TaulukkoProviderOptions; 
  private status:string; 
  private client:WSClient;
  private id:string;
 

  private constructor(options:any){
    let host:string = "localhost";
    let port :number = 80;

    if(options.server!=null)
    {
      const domainSlices = options.server.split("//");  
      
      const portSlices = domainSlices[domainSlices.length-1].split(":");
      host = portSlices[0];
      
      if(portSlices.length=2)
      {
        port = portSlices[1];
      } 
 
      options.server=null;
    }

    const defaults = { port,host ,topics:new Array()};
    this.options = Object.assign({}, defaults, options);

     
    const wsoptions =  this.options = Object.assign({}, this.options, {port,host});
 

    this.status = serviceStatus.STARTING;
  }

  static create = (options:any):DefaultPublisherProvider=>{  
    return new DefaultPublisherProvider(options);
  };

  send(...data: any) { 
    if(this.status!=serviceStatus.ONLINE)
    {
      throw new Error("Publisher isn't open yet");
    }
    this.options.topics.forEach((item,index)=>{
      const message:Message = Message.create({topic:item,data}); 
      this.client.emit(protocolNames.NEW_MESSAGE,message.struct); 
        
    }); 
  }
 
  
  open = async  () :Promise<void>  => {

  

    if(this.status!==serviceStatus.STARTING && this.status!==serviceStatus.RESTARTING){
      throw Error("Publisher already started");
    }
    
    logger.log5("Taulukko Publisher Provider starting with options : " );
     
    const ret:Promise<void> = new Promise(async (resolve,reject)=>{

      if(this.options.timeout)
      {
        setTimeout(()=>{
          this.status = serviceStatus.FAIL;
          reject(new Error("Time out in publisher"));
        },this.options.timeout);
      }
    
      logger.log4("Taulukko Publisher Provider preparing the connection with websocket " );
      
      this.client = WSClient.create(this.options);
 
         
      await this.client.open(); 
        

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
 
      logger.log5("Taulukko Publisher Provider finish open, start detect disconnect ");

    
      this.client.on('disconnect',  this.onDisconnect);
      
      
    });
    return ret;
  };
  private  onDisconnect = () =>{
 

    var cont:number = 0 ; 
    
    if(this.status ===  serviceStatus.STOPED )
    { 
      return;
    }
      logger.log0("Server disconnected, restarting the connection");
      this.client.forceClose();
      this.status = serviceStatus.RESTARTING;
      let isOpenning:boolean = false;
      const handle = setInterval(async ()=>{
        if(isOpenning &&  this.status === serviceStatus.RESTARTING)
          { 
            return;
          }
        try{ 
 
          isOpenning=true;
          await this.open( );
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

  waitReconnect = async () : Promise<boolean> => {
    return new Promise<boolean>((resolve)=>{
      const handle = setInterval( ()=>{
      
    
        if(this.status != serviceStatus.ONLINE)
        { 
          return;
        } 
        clearInterval(handle); 
        resolve(true); 
       
      },1000);
    });
  };


  onTaulukkoServerConnectionOK = async (reject: any)=>{ 
 
    return  (async (websocket:WebSocket)=>{ 
        logger.log5("  Publisher   onTaulukkoServerConnectionOK received");
        this.id = websocket.client.id;
        logger.log7( "this.socket",this.client,this.client.emit,protocolNames.CLIENT_ONLINE,clientTypes.PUBLISHER,this);
        if(this.options.timeout)
          {
            setTimeout(()=>{
              reject(new Error("Time out in publisher"));
            },this.options.timeout);
          }

        this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.PUBLISHER,id:this.id,topics:this.data.topics}); 
      });
  };

  onTaulukkoServerRegisteredClient = async (resolve: (ret:any)=>void )=>{ 
    const ret =  (async (websocket:WebSocket)=>{ 
        logger.log4("Taulukko Publisher Provider onTaulukkoServerRegisteredClient "); 
        this.status = serviceStatus.ONLINE; 
        resolve({})
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
        try{
          reject({}); 
        }catch(e){
          //fine
          logger.log7("onTaulukkoServerUnregisteredClient erro no reject "); 
        }
       
      
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
      },1000); 
      logger.log7("Taulukko Publisher Provider ends"); 
    });

   return  ret;
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

  
  
  get data() :PearData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE,topics:this.options.topics};
      logger.log7("get data ", ret);
      return ret;
  }
}

interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>;
  timeout?:number;
}
 