import { loggerFactory } from "../common/logger";
import { WebSocketClient, WebSocketServer  } from ".";
import { logerNames } from "../server/names";
import { KeyTool } from "taulukko-commons";

import * as socketIo from "socket.io"; 
const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

const keyTool: KeyTool = new KeyTool();

export class WSSocket { 
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