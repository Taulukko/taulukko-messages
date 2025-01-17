   
import {serviceStatus,PublisherProvider,protocolNames,clientTypes,Message,PearData,WSClient ,WebSocket, WSServerOptions } from "taulukko-messages-core"; 
import {   TaulukkoProviderOptions } from "./default-publisher-options";
 
export class DefaultPublisherProvider implements PublisherProvider {
  
  private options:TaulukkoProviderOptions; 
  private status:string; 
  private client:WSClient;
  private id:string;
 

  private constructor(options:TaulukkoProviderOptions){
    let host:string = "localhost";
    let port :number = 80;
 

    if(!options.topics || options.topics.length==0)
    { 
      throw new Error("Option topics:Array<String> are required");
    }
    

    if(options.server!=null)
    {
      const domainSlices = options.server.split("//");  
      
      const portSlices = domainSlices[domainSlices.length-1].split(":");
      host = portSlices[0];
      
      if(portSlices.length=2)
      {
        port = parseInt(portSlices[1]);
      } 
 
      options.server=null;
    }

    const defaults = { port,host ,topics:new Array()};
    this.options = Object.assign({}, defaults, options) as TaulukkoProviderOptions;

     
    const wsoptions =  this.options = Object.assign({}, this.options, {port,host});
 

    this.status = serviceStatus.STARTING;
  }

  static create = (options:any):DefaultPublisherProvider=>{  
    return new DefaultPublisherProvider(options);
  };

  send(...data: any) { 
    console.info("Taulukko Publisher Provider send " );
    if(this.status!=serviceStatus.ONLINE)
    {
      throw new Error("Publisher isn't open yet");
    } 

    this.options.topics.forEach((item,index)=>{ 
      const message:Message = Message.create({topic:item,data}); 
      this.client.emit(protocolNames.NEW_MESSAGE,message.struct); 
        
    });  
  }
 
  log = (data:string,datab:any="") => {
    console.log(data,datab); 
  };

  info = (data:string,datab:any="") => {
    console.info(data,datab); 
  };
  
  open = async  () :Promise<void>  => {

   
    if(this.status!==serviceStatus.STARTING && this.status!==serviceStatus.RESTARTING){
      throw Error("Publisher already started");
    }
    
    console.info("Taulukko Publisher Provider starting..." );
     
    const ret:Promise<void> = new Promise(async (resolve,reject)=>{

      if(this.options.timeout)
      {
        setTimeout(()=>{
          this.status = serviceStatus.FAIL;
          reject(new Error("Time out in publisher"));
        },this.options.timeout);
      }
     
      
      this.client = WSClient.create(this.options);
 
         
      await this.client.open(); 
         

      await this.onTaulukkoServerConnectionOK(resolve).then((onTaulukkoServerConnectionOK)=>{
        this.client.on(protocolNames.CONNECTION_OK,onTaulukkoServerConnectionOK );
      });
      await  this.onTaulukkoServerRegisteredClient(resolve).then((onTaulukkoServerRegisteredClient)=>{ 
        this.client.on(protocolNames.REGISTERED,onTaulukkoServerRegisteredClient );
      });
      await  this.onTaulukkoServerUnregisteredClient(reject,this).then((onTaulukkoServerUnregisteredClient)=>{
        this.client.on(protocolNames.UNREGISTERED,onTaulukkoServerUnregisteredClient );
      }); 
  
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
     console.info("Server disconnected, restarting the connection");
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
          console.error(e);
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


  onTaulukkoServerConnectionOK = async (resolve:any)=>{ 
 
    return  (async (websocket:WebSocket)=>{ 
      this.info("Publisher  onTaulukkoServerConnectionOK received"); 
      this.id = websocket.client.id; 
        if(this.options.timeout)
          { 
            setTimeout(()=>{
              resolve(new Error("Time out in publisher"));
            },this.options.timeout);
          } 
        this.client.emit(protocolNames.CLIENT_ONLINE,{type: clientTypes.PUBLISHER,id:this.id,topics:this.data.topics}); 
      });
  };

  onTaulukkoServerRegisteredClient = async (resolve: (ret:any)=>void )=>{ 
    const ret =  (async (websocket:WebSocket)=>{ 
        console.info("Taulukko Publisher Provider onTaulukkoServerRegisteredClient "); 
        this.status = serviceStatus.ONLINE; 
        resolve({})
      });
      return  ret;
  };

  onTaulukkoServerUnregisteredClient = async (reject: (ret:any)=>void , me:DefaultPublisherProvider)=>{
    const ret =  (async (websocket:WebSocket)=>{

      console.info("Taulukko Publisher Provider onTaulukkoServerUnregisteredClient");  
        this.status = serviceStatus.STOPED; 
        me.client.forceClose(); 
        try{
          reject({}); 
        }catch(e){
          //fine
          console.info("onTaulukkoServerUnregisteredClient error expected, so this is not a problem "); 
        }
       
      
      });
      return  ret;
  };
 

  close = async () : Promise<void> =>  {

    const ret : Promise<void> = new Promise(async (resolve,)=>{

      if(this.status!=serviceStatus.ONLINE){ 
        console.error("Publisher isnt open");
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
      console.info("Taulukko Publisher Provider finished"); 
    });

   return  ret;
  };

  forceClose = async () :Promise<void> => {
    console.info("Taulukko Publisher Provider forceClose ");
    try{
      this.close();
    }
    catch{
      console.warn("Taulukko Publisher Provider error in forceClose");
    }
    this.status = serviceStatus.STOPED;
    
  };

  get data() :PearData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE,topics:this.options.topics}; 
      return ret;
  }
}
