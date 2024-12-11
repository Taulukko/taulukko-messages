import { logerNames, serviceStatus,validateStateChange,WSServerOptions, WebSocket } from "taulukko-messages-core"; 
import { loggerFactory } from "../common/log/logger";  
import * as jsEnv from "browser-or-node"; 
import * as socketIo from "socket.io";  
import { KeyTool, StringsUtil } from "taulukko-commons"; 
import * as http from "http";
 
 
const LOGGER = loggerFactory.get(logerNames.LOGGER_DEFAULT);

const KEY_TOOL: KeyTool = new KeyTool();

//see keytool documentation (head = clusterid+ processid + random)
const KEY_TOOL_HEAD_SIZE = 13;

var commonHttpType:http.Server|any=null;
  
if(jsEnv.isBrowser)
{ 
  console.log("Creating http browser");
   import("http").then(
    (httpBrowser)=>{
      commonHttpType = httpBrowser;
      console.log("Created http browser",commonHttpType);
    }
   ).catch((e)=>{
    console.error(e);
   }); 
 
}
else if (jsEnv.isNode)
{
  console.log("Creating http node");
  import("http").then(
   (httpNode)=>{
    
     commonHttpType = httpNode;
     console.log("Created http node",commonHttpType);
     console.log("Created htt0.createServer node",commonHttpType.createServer);
   }
  ).catch((e)=>{
   console.error(e);
  }); 

}
else{
  console.error("taulukko-message is supported only nto browser(not working) and node");
}

export class WSServer   {
  id:string;
  options:WSServerOptions;
  server:http.Server;
  io:socketIo.Server;
  internalSocketsByClientId:Map<string,socketIo.Socket> = new Map();
  globalEvents:Map<string,(...args:any)=>void> = new Map();
  _state:string = serviceStatus.STARTING;


  private   constructor  (options:any){ 
  
    const defaults = { port: 7777, showDefaultMessage:true, defaultMessage:"WSServer Server is Running"};
    options = Object.assign({}, defaults, options); 
    this.options = options as WSServerOptions;
    const key:string = KEY_TOOL.build(1, 1);
    this.id = new StringsUtil().right(key, key.length - KEY_TOOL_HEAD_SIZE);
   this.server = commonHttpType.Server;
  }

  static  create =   (options:any):  WSServer=>{
    console.log("Create ws-server");
    const wsServer:WSServer = new WSServer(options);
    
  
    return wsServer;
  };

  get state():string{
    return this._state;
  }

 

  set state(value:string){
    const validResult = validateStateChange(this._state,value);

    if(validResult!="OK")
    {
      throw new Error(validResult);
    }
   
    this._state = value;
  }

    open = ():Promise<any> => {
      const me = this;
      if(me.state!=serviceStatus.STARTING)
      {
        throw Error("State need be STARTING");
      }
      LOGGER.log7("WSServer starting with options : " , this.options);
      const ret = new Promise<any>((resolve,reject)=>{ 
        console.log("commonHttpType.createServer",commonHttpType.createServer);
        this.server = commonHttpType.createServer((req, res) => {     
            if(me.options.showDefaultMessage)
            {
                res.end(me.options.defaultMessage);
            }  
          
        }); 
        me.server.listen( me.options.port, () => { 
          LOGGER.log7("WSServer listen port : " , me.options.port);
        

          me.io = new socketIo.Server(me.server as any); 
         
          me.state = serviceStatus.ONLINE; 
          
          
          me.io.on('connection', async  (socket) => { 
             
              const websocket = new  WebSocket({socket,id:me.id});
              me.internalSocketsByClientId.set(websocket.client.id,socket); 
              
              await me._bindEvents(socket);  
             
              if(me.options.onConnection)
              { 
                me.options.onConnection(websocket);
              }  
           });

           
          resolve({});

        
        }); 
      
   
      });
      
      return ret;
    };

  _bindEvents = async  (socket:socketIo.Socket)=>{ 
    const websocket = new  WebSocket({socket,id:this.id});

    const me:WSServer = this;

    socket.on('disconnect', () => {
      if(!me.options.onDisconnect)
      {
        return;
      }
      me.options.onDisconnect(new  WebSocket({socket,id:me.id}));
      me.internalSocketsByClientId.delete(websocket.client.id);
    }); 

    this.globalEvents.forEach((listener,event)=>{ 
    
      LOGGER.log7("WSServer _bindEvents: " ,event, websocket.client.id);
 
      socket.on(event,(...data:any)=>{ 
        LOGGER.log7("Evento recebido " ,data);
        listener(websocket,...data); 

      }); 
    });
  };

  on = async  (event:string,listener:(...data:any)=>void) => { 
    this.globalEvents.set(event,listener);
 
    this.internalSocketsByClientId.forEach((socket,key)=>{ 
      const websocket = new  WebSocket({socket,id:this.id});
      LOGGER.log7("WSServer on wsclient: " ,event, websocket.client.id);
      LOGGER.log7("WSServer on : " ,socket.id);
      socket.on(event,(...data:any)=>{ 
        listener(websocket,...data);
      }); 
    });
   };

   close = async() => {  
    LOGGER.log7("WSServer close ");
    if(this.state!=serviceStatus.ONLINE)
    {
      throw Error("State need be ONLINE");
    }
    this.io.close();
    this.server.close();  
    this.state = serviceStatus.STOPED;

  };
}
 

 