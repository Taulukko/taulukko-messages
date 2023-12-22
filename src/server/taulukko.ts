 
import {Provider} from "../common/provider"; 
import { ServerData } from './server-data';
import {serverStatus} from "./names"; 
import { logerNames} from "./names"; 
import { loggerFactory } from "../common/logger"; 

import * as http from "http";
import * as socketIo from "socket.io"; 


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class TaulukkoProvider implements Provider {
  options:TaulukkoProviderOptions;
  status:string;
  server:http.Server;
  io:socketIo.Server;
 

  constructor(options:any){
    const defaults = { port: 7777 };
    options = Object.assign({}, defaults, options);
    this.options = options as TaulukkoProviderOptions;
    this.status = serverStatus.SERVER_STATUS_STARTING;
  }

    open():Promise<any> {
      logger.info("TaulukkoProvider starting with options : " , this.options);
      const ret = new Promise<any>((resolve,reject)=>{
        this.server = http.createServer((req, res) => {       
          res.end('Taulukko Message Server is Running');
        });
        this.server.listen( this.options.port, () => {
          logger.info("TaulukkoProvider listen port : " , this.options.port);
          this.status = serverStatus.SERVER_STATUS_ONLINE;
          resolve({});
        });
        this.io = new socketIo.Server(this.server);
        
        this.io.on('connection', (socket) => {
          console.log('Um usuário se conectou');
    
          socket.on('disconnect', () => {
          console.log('Um usuário se desconectou');
          });
    
          socket.emit('hello', 'Hello World from Socket.IO');
      });
   
    });
    return ret;
  }
  async close() {
    this.io.close();
    this.server.close();
    this.status = serverStatus.SERVER_STATUS_STOPED;
    logger.trace("TaulukkoProvider ends ");

  }
  async forceClose() {
    try{
      this.close();
    }
    catch{
      //TODO:LOG
      this.status = serverStatus.SERVER_STATUS_STOPED;
    }
    logger.trace("TaulukkoProvider ends (forced) ");
  }
  data(): ServerData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serverStatus.SERVER_STATUS_ONLINE,
      offline:this.status!=serverStatus.SERVER_STATUS_ONLINE};
      logger.trace("get data ", ret);
      return ret;
  }
  publishers(): any[] {
    throw new Error('Method not implemented.');
  }
  subscribers(): any[] {
    throw new Error('Method not implemented.');
  }
  async sendAll(topic: string, data: any) {
    throw new Error('Method not implemented.');
  } 
}

interface TaulukkoProviderOptions {
  port:number;
}