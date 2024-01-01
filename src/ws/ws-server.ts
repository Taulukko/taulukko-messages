import { logerNames, serviceStatus} from "../server/names"; 
import { loggerFactory } from "../common/logger"; 

import * as http from "http";
import * as socketIo from "socket.io"; 

import { KeyTool,StringsUtil } from "taulukko-commons/util";
import { WSServerOptions } from "./";

const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

const keyTool: KeyTool = new KeyTool();

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
    this.id =  new StringsUtil().right(keyTool.build(1, 1),6); 
  }

  static create = (options:any):WSServer=>{
    return new WSServer(options);
  };

  get state():string{
    return this._state;
  }

  
  private validateStateChange(value:string):string{
    let valid:boolean = true;
    if(value==serviceStatus.STARTING && this._state != serviceStatus.RESTARTING)
    {
        valid = false;
    }
    if(value==serviceStatus.ONLINE && this._state != serviceStatus.STARTING)
    {
      valid=false;
    } 
    if(valid)
    {
      return "OK";
    }
    return `Invalid State active : ${this._state} new : ${value}` ;
  }

  set state(value:string){
    const validResult = this.validateStateChange(value);

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
      logger.trace("WSServer starting with options : " , this.options);
      const ret = new Promise<any>((resolve,reject)=>{ 
        this.server = http.createServer((req, res) => {     
            if(me.options.showDefaultMessage)
            {
                res.end(me.options.defaultMessage);
            }  
          
        }); 
        me.server.listen( me.options.port, () => {
          logger.trace("WSServer listen port : " , me.options.port);
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
      logger.trace("WSServer _bindEvents: " ,event, websocket.client.id);
 
      socket.on(event,(...data:any)=>{
        logger.trace("Evento recebido " ,data);
        listener(websocket,...data);
      }); 
    });
  };

  on = async  (event:string,listener:(...data:any)=>void) => {
    logger.trace("WSServer on : " ,event);
    this.globalEvents.set(event,listener);

    this.internalSocketsByClientId.forEach((socket,key)=>{
      const websocket = new  WebSocket({socket,id:this.id});
      logger.trace("WSServer on wsclient: " ,event, websocket.client.id);
 
      socket.on(event,(...data:any)=>{
        listener(websocket,...data);
      }); 
    });
   };

   close = async() => { 
    logger.trace("WSServer close ");
    if(this.state!=serviceStatus.ONLINE)
    {
      throw Error("State need be ONLINE");
    }
    this.io.close();
    this.server.close();  
    this.state = serviceStatus.STOPED;

  };
}




export class WebSocket { 
  private socket ;
  client: WebSocketClient;
  server: WebSocketServer;
  constructor(options:WebSocketOptions)
  {
    const clientOptions:WebSocketOptions = {...options};
    clientOptions.id =  (options.socket.client.id ) as string;
    this.client = new WebSocketClient(clientOptions);
    this.server = new WebSocketServer(options);
    this.socket = options.socket;
  }

  emit = async (event:string, ...args:any)=>
  {
    logger.trace("WSSocket emit : " , event, args); 
    const socket:socketIo.Socket = this.socket;
    socket.emit(event,...args);
  };

  send = (...args:any)=>
  {
    logger.trace("WSSocket send : " , args); 
    const socket:socketIo.Socket = this.socket;
    socket.send(...args);
  };
}

export class WebSocketClient { 
  id: string;
  constructor(options:WebSocketOptions){
    this.id = options.id;
  }
}

export class  WebSocketServer {
  id:string;
  constructor(options:WebSocketOptions){ 
    this.id = options.id;
  }
}