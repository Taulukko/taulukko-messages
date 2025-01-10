 
import { WebSocketOptions  } from "./web-socket-options";
import { KeyTool } from "taulukko-commons";
import * as socketIo from "socket.io-client";  
import { WebSocketClient } from "./web-socket-client";
import { WebSocketServer } from "./web-socket-server";

const keyTool: KeyTool = new KeyTool();

export class WebSocket { 
    private socket ;
    client: WebSocketClient;
    server: WebSocketServer;
    constructor(options:WebSocketOptions)
    {
      const clientOptions:WebSocketOptions = {...options};
      clientOptions.id =  (options.socket.client.id ) as string;
      this.client = new WebSocketClient(options);
      this.server = new WebSocketServer(options);
      this.socket = options.socket;
    }
  
    emit = async (event:string, ...args:any)=>
    { 
      console.info("WSSocket emit : " , event, args); 
      const socket:socketIo.Socket = this.socket;
      socket.emit(event,...args); 

    };
  
    send = (...args:any)=>
    { 
 
      console.info("WSSocket send : " , args); 
      const socket:socketIo.Socket = this.socket;
      socket.send(...args);  

    };
  }