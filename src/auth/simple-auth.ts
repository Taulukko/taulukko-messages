import { loggerFactory } from "../common/logger";
import { AuthProvider } from "./auth-provider";
import { logerNames } from "../common/names";
import { ClientOnLineDTO } from "src/server/server-protocols-dtos";
import { WebSocket } from "src/ws";


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class SimpleAuth implements AuthProvider { 
    options: SimpleAuthOptions;
  
    private constructor(options: any) {
      
      const defaults = {};
      options = Object.assign({}, defaults, options);
      this.options = options as SimpleAuthOptions;  
    }

    validateOnClienteOnline(socket: WebSocket, data: ClientOnLineDTO): boolean {
      throw new Error("Method not implemented.");
    }
  
    static create(options: any = {} ) : AuthProvider{
      const server=  new SimpleAuth(options);
      logger.trace("New SimpleAuth created ", server);
      return server;
    }
}

export interface SimpleAuthOptions{
  password:string
}