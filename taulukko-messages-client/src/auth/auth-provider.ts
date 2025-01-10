import { WebSocket,ClientOnLineDTO  } from "taulukko-messages-core";
 
export interface AuthProvider  { 
  validateOnClienteOnline(socket: WebSocket, data: ClientOnLineDTO): boolean;    
}