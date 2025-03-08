 
import {Message,PearData,  WSClient, WSServerOptions, WebSocket,SubscriberProvider,Listener,serviceStatus,protocolNames,clientTypes} from "taulukko-messages-core";  


export class DefaultSubscriberProvider implements SubscriberProvider {

  options:any;
  status:string; 
  client:WSClient;
  id:string;
  listeners : Array<Listener> = new Array(); 

  
 constructor(options:any){
   


    const defaults = { port: 7777, topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    this.status = serviceStatus.STARTING;
  }

 

  on = async (listener:  Listener)=> {
    
    this.listeners.push(listener);
  
      await this.client.on( protocolNames.NEW_MESSAGE,async (message:Message)=>{
        listener(message);
      });   
    };
 
  open = async () :Promise<void>  => { 
    if(this.status!==serviceStatus.STARTING && this.status!==serviceStatus.RESTARTING){
      throw Error("Subscriber already started");
    }
    

    const ret : Promise<void> = new Promise(async (resolve,reject)=>{
     
      this.client = WSClient.create(this.options);
      this.client.open(); 
      
      await this.onTaulukkoServerConnectionOK(resolve).then((onTaulukkoServerConnectionOK)=>{
        this.client.on(protocolNames.CONNECTION_OK,onTaulukkoServerConnectionOK );
      });

      await this.onTaulukkoServerRegisteredClient(resolve).then((onTaulukkoServerRegisteredClient)=>{
        this.client.on(protocolNames.REGISTERED,onTaulukkoServerRegisteredClient );
      });

      await this.onTaulukkoServerUnregisteredClient(resolve,this).then((onTaulukkoServerUnregisteredClient)=>{
        this.client.on(protocolNames.UNREGISTERED,onTaulukkoServerUnregisteredClient );
      });
   

      this.client.on('connect', () => {
       //console.info("Taulukko Subscriber Provider connection with server sucefull ");
      }); 
    
      this.client.on('disconnect',  this.onDisconnect);
    });
    return ret;
  };

  private  onDisconnect = () =>{
    
    if(this.status ===  serviceStatus.STOPED )
    {
      return;
    }
   
    console.error("Server disconnected, restarting the connection");
    this.client.close();
    this.status = serviceStatus.RESTARTING;
    let isOpenning = false;
    const handle = setInterval(async ()=>{
      
      isOpenning = false;
 
      try{
        if(isOpenning ||  this.status === serviceStatus.ONLINE )
          { 
            return;
          }
        isOpenning = true;
        clearInterval(handle);
        await this.open();
        isOpenning=false; 
      }
      catch(e)
      {
        isOpenning=false;
        console.error(e);
        clearInterval(handle);
      }
    },1000);
  };

  onTaulukkoServerConnectionOK = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{ 
        this.id = websocket.client.id; 
        await this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.SUBSCRIBER,id:this.id,topics:this.data.topics});
         
      });
  };

 
  onTaulukkoServerRegisteredClient = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{ 
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
         
          
          this.client.forceClose();
          
          resolve();
        }
      },100);  
    });
   return ret;
  };

  forceClose = async () : Promise<void> => { 
    try{
       this.close();
    }
    catch{
      console.warn("Taulukko Subscriber Provider error ");
    
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
      return ret;
  }
  
}

interface TaulukkoProviderOptions extends WSServerOptions{
  topics:Array<string>
}

