import { logerNames, serviceStatus} from "../server/names"; 
import { loggerFactory } from "../common/logger"; 

import * as http from "http";
import * as socketIo from "socket.io"; 

import { KeyTool,StringsUtil } from "taulukko-commons/util";
import { WSServerOptions, WebSocket } from "./";
import { validateStateChange } from "../common/service-utils";

const LOGGER = loggerFactory.get(logerNames.LOGGER_DEFAULT);

const KEY_TOOL: KeyTool = new KeyTool();

//see keytool documentation (head = clusterid+ processid + random)
const KEY_TOOL_HEAD_SIZE = 13;



export class WSServer   {
  id:string;
  options:WSServerOptions;
  server:http.Server;
  io:socketIo.Server;
  internalSocketsByClientId:Map<string,socketIo.Socket> = new Map();
  globalEvents:Map<string,(...args:any)=>void> = new Map();
  _state:string = serviceStatus.STARTING;


  private constructor(options:any){
    const defaults = { port: 7777, showDefaultMessage:true, defaultMessage:"WSServer Server is Running"};
    options = Object.assign({}, defaults, options);
    this.options = options as WSServerOptions;
    const key:string = KEY_TOOL.build(1, 1);
    this.id = new StringsUtil().right(key, key.length - KEY_TOOL_HEAD_SIZE);
  }

  static create = (options:any):WSServer=>{
    return new WSServer(options);
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
      LOGGER.trace("WSServer starting with options : " , this.options);
      const ret = new Promise<any>((resolve,reject)=>{ 
        this.server = http.createServer((req, res) => {     
            if(me.options.showDefaultMessage)
            {
                res.end(me.options.defaultMessage);
            }  
          
        }); 
        me.server.listen( me.options.port, () => {
          LOGGER.trace("WSServer listen port : " , me.options.port);
          me.state = serviceStatus.ONLINE; 
          resolve({});
        }); 
        me.io = new socketIo.Server(me.server); 
        
        me.io.on('connection', async  (socket) => {
            if(!me.options.onConnection)
            {
              return;
            } 

            const websocket = new  WebSocket({socket,id:me.id});
            me.internalSocketsByClientId.set(websocket.client.id,socket); 
            me.options.onConnection(websocket);

            await me._bindEvents(socket);
      
            socket.on('disconnect', () => {
              if(!me.options.onDisconnect)
              {
                return;
              }
              me.options.onDisconnect(new  WebSocket({socket,id:me.id}));
              me.internalSocketsByClientId.delete(websocket.client.id);
            });
      
         
         });
   
      });
      
      return ret;
    };

  _bindEvents = async  (socket:socketIo.Socket)=>{
    const websocket = new  WebSocket({socket,id:this.id});

    this.globalEvents.forEach((listener,event)=>{
      LOGGER.trace("WSServer _bindEvents: " ,event, websocket.client.id);
 
      socket.on(event,(...data:any)=>{
        LOGGER.trace("Evento recebido " ,data);
        listener(websocket,...data);
      }); 
    });
  };

  on = async  (event:string,listener:(...data:any)=>void) => {
    LOGGER.trace("WSServer on : " ,event);
    this.globalEvents.set(event,listener);

    this.internalSocketsByClientId.forEach((socket,key)=>{
      const websocket = new  WebSocket({socket,id:this.id});
      LOGGER.trace("WSServer on wsclient: " ,event, websocket.client.id);
 
      socket.on(event,(...data:any)=>{
        listener(websocket,...data);
      }); 
    });
   };

   close = async() => { 
    LOGGER.trace("WSServer close ");
    if(this.state!=serviceStatus.ONLINE)
    {
      throw Error("State need be ONLINE");
    }
    this.io.close();
    this.server.close();  
    this.state = serviceStatus.STOPED;

  };
}
 

 