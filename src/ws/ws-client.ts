import { validateStateChange } from "../common/service-utils";
import { logerNames, serviceStatus } from "../common/names";
import { WSClientOptions, WSServerOptions } from "./";
import * as socketIo from "socket.io";
import { KeyTool, StringsUtil } from "taulukko-commons";
import { loggerFactory } from "../common/log/logger";
import * as io from "socket.io-client";
const LOGGER = loggerFactory.get(logerNames.LOGGER_DEFAULT);
const KEY_TOOL = new KeyTool();
//see keytool documentation (head = clusterid+ processid + random)
const KEY_TOOL_HEAD_SIZE = 13;

export class WSClient {
  id: string;
  options: WSClientOptions;
  client: io.Socket;
  internalSocketsByClientId: Map<string, socketIo.Socket> = new Map();
  globalEvents: Map<string, (...args: any) => void> = new Map();
  _state: string = serviceStatus.STARTING;

  private constructor(options: any) {
    const defaults = { port: 80, host:"localhost",showDefaultMessage: true, defaultMessage: "WS Server is Running" };
    options = Object.assign({}, defaults, options);
    this.options = options as WSClientOptions;
    const key:string = KEY_TOOL.build(1, 1);
    this.id = new StringsUtil().right(key, key.length - KEY_TOOL_HEAD_SIZE);
  }

  static create = (options: any): WSClient => { 
    return new WSClient(options);
  };

  get state(): string {
    return this._state;
  }

  set state(value: string) {
    const validResult = validateStateChange(this._state, value);
    if (validResult != "OK") {
      throw new Error(validResult);
    }

    this._state = value;
  }

  open = async () => {
      const me = this;
      if (me.state != serviceStatus.STARTING) { 
        throw Error("State need be STARTING");
      }
        
      LOGGER.log5("WSClient starting with options : ", this.options);
 
      const ret:Promise<{}> = new Promise((resolve,reject)=>{
        let success:boolean = false;
 
        if(me.options.timeout && !isNaN(this.options.timeout))
          { 
            
            setTimeout((args)=>{
              const wsclient:WSClient = args[0]; 
              if(success)
              { 
                return;
              } 
              this.forceClose();
              me.client.close();
             reject(new Error("Time out in open wsclient , take more then " + wsclient.options.timeout)); 
            },me.options.timeout,[me]); 

       
            me.client = io.connect("http://"+ this.options.host + ":"  + this.options.port );
           
          }
          else{ 
            me.client = io.connect("http://"+ this.options.host + ":"  + this.options.port );
          }
        me.client.on("connect_error", (err) => {  
          me.client.close();
          reject(new Error("Time2 out in open wsclient , take more then "  ));
        });
        
        me.client.on('connect', () => { 
          success=true; 
          LOGGER.log5("WSClient connection with server sucefull ");
          this.state = serviceStatus.ONLINE;
          resolve(true);
        });
 
      });

      return  ret;
  };

  close = async () => {
    LOGGER.log5("WSClient close ", this.state);
    if (this.state != serviceStatus.ONLINE) {
      throw Error("State need be ONLINE");
    }
    this.client.close();
   
  };

  forceClose = async () => {
    
     try{
      await this.close();
     }
     catch(e)
     {
      LOGGER.log7("forceClose error ", e);
      return;
     }
     finally{
      this.state = serviceStatus.STOPED;
     }
  };

  emit = async (event: string, ...data) => { 
    this.client.emit(event, ...data); 
  };

  on = async (event: string, listener: (...data: any) => void) => { 
    await this.client.on(event, listener); 
  };
}