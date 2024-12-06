import { loggerFactory } from "../common/log/logger";
import { AuthProvider } from "./auth-provider";
import { logerNames } from "../common/names";
import { ClientOnLineDTO } from "../server/server-protocols-dtos";
import { WebSocket } from "../ws";


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class SimpleAuth implements AuthProvider { 
    options: SimpleAuthOptions;
  
    private constructor(options: any) {
      
      const defaults = {};
      options = Object.assign({}, defaults, options);
      this.options = options as SimpleAuthOptions;  
    }

    validateOnClienteOnline(socket: WebSocket, data: ClientOnLineDTO): boolean {
      return false;
    }
  
    static create(options: any = {} ) : AuthProvider{
      const server=  new SimpleAuth(options);
      logger.log7("New SimpleAuth created ", server);
      return server;
    }
}

export interface SimpleAuthOptions{
  password:string
}