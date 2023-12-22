import { logerNames} from "../server/names"; 
import { loggerFactory } from "../common/logger"; 

import * as http from "http";
import * as socketIo from "socket.io"; 


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class WSServer   {
  options:WSServerOptions;
  server:http.Server;
  io:socketIo.Server;
 

  constructor(options:any){
    const defaults = { port: 7777, showDefaultMessage:true, defaultMessage:"WSServer Server is Running"};
    options = Object.assign({}, defaults, options);
    this.options = options as WSServerOptions; 
  }

    open():Promise<any> {
      logger.trace("WSServer starting with options : " , this.options);
      const ret = new Promise<any>((resolve,reject)=>{
        this.server = http.createServer((req, res) => {     
            if(this.options.showDefaultMessage)
            {
                res.end(this.options.defaultMessage);
            }  
          
        });
        this.server.listen( this.options.port, () => {
          logger.trace("WSServer listen port : " , this.options.port); 
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
    logger.trace("WSServer ends ");

  } 
}

export interface WSServerOptions {
  port:number;
  defaultMessage:string;
  showDefaultMessage:boolean;
}