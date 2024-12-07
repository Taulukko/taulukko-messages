 
import { AuthProvider } from "./auth-provider";
import {ClientOnLineDTO , WebSocket } from "taulukko-messages-core";

 

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
      console.log("New SimpleAuth created ", server);
      return server;
    }
}

export interface SimpleAuthOptions{
  password:string
}