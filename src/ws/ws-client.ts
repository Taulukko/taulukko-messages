import { serviceStatus } from "../server/names";
import { WSServerOptions } from "./"; 
import * as socketIo from "socket.io"; 
import { KeyTool, StringsUtil } from "taulukko-commons";

const keytool = new KeyTool();

export class WSClient   {
    id:string;
    options:WSServerOptions; 
    io:socketIo.Server;
    internalSocketsByClientId:Map<string,socketIo.Socket> = new Map();
    globalEvents:Map<string,(...args:any)=>void> = new Map();
    _state:string = serviceStatus.STARTING;
  
  
    private constructor(options:any){
      const defaults = { port: 7777, showDefaultMessage:true, defaultMessage:"WSServer Server is Running"};
      options = Object.assign({}, defaults, options);
      this.options = options as WSServerOptions;
      this.id =  new StringsUtil().right(keytool.build(1, 1),6); 
    }
  
    static create = (options:any):WSClient=>{
      return new WSClient(options);
    };
}