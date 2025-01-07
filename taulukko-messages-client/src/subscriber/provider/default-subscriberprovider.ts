 
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
    console.info("Taulukko Subscriber Provider on: inserting a new listener "  );
    this.listeners.push(listener);
  
      await this.client.on( protocolNames.NEW_MESSAGE,async (message:Message)=>{
        listener(message);
      });   
    };
 
  open = async () :Promise<void>  => {
    console.info("Publisher Default Provider  open ");
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
        console.info("Taulukko Subscriber Provider connection with server sucefull ");
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
        console.error(e);
      }
    },1000);
  };

  onTaulukkoServerConnectionOK = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
      console.info("Taulukko Subscriber Provider onTaulukkoServerConnectionOK ");
        this.id = websocket.client.id; 
        await this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.SUBSCRIBER,id:this.id,topics:this.data.topics});
         
      });
  };

 
  onTaulukkoServerRegisteredClient = async (resolve)=>{
    return  (async (websocket:WebSocket)=>{
      console.info("Taulukko Subscriber Provider onTaulukkoServerRegisteredClient "); 
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
      console.info("Taulukko Publisher Provider onTaulukkoServerRegisteredClient "); 
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
      console.info("Taulukko Subscriber Provider finished");
    });
   return ret;
  };

  forceClose = async () : Promise<void> => {
    console.info("Taulukko Subscriber Provider forceClose ");
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

