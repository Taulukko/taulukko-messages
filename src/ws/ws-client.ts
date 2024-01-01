import { validateStateChange } from "../common/service-utils";
import { logerNames, serviceStatus } from "../server/names";
import { WSClientOptions, WSServerOptions } from "./"; 
import * as socketIo from "socket.io"; 
import { KeyTool, StringsUtil } from "taulukko-commons";
import { loggerFactory } from "../common/logger";


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
const keytool = new KeyTool();

export class WSClient   {
    id:string;
    options:WSClientOptions; 
    io:socketIo.Server;
    internalSocketsByClientId:Map<string,socketIo.Socket> = new Map();
    globalEvents:Map<string,(...args:any)=>void> = new Map();
    _state:string = serviceStatus.STARTING;
  
  
    private constructor(options:any){
      const defaults = { port: 7777, showDefaultMessage:true, defaultMessage:"WS Server is Running"};
      options = Object.assign({}, defaults, options);
      this.options = options as WSServerOptions;
      this.id =  new StringsUtil().right(keytool.build(1, 1),6); 
    }
  
    static create = (options:any):WSClient=>{
      return new WSClient(options);
    };

    get state():string{
      return this._state;
    }

      

  set state(value:string){
    const validResult = validateStateChange(this._state, value);

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
    logger.trace("WSClient starting with options : " , this.options);
    const ret = new Promise<any>((resolve,reject)=>{ 
      this.state = serviceStatus.ONLINE;
     });
  
    return ret;
  };

  close = async() => { 
    logger.trace("WSServer close ");
    if(this.state!=serviceStatus.ONLINE)
    {
      throw Error("State need be ONLINE");
    }
   
    this.state = serviceStatus.STOPED;

  };
}