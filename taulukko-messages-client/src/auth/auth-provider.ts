import { Message } from "..//common/message";
import { ClientOnLineDTO } from "../server/server-protocols-dtos";
import { WebSocket } from "../ws";

export interface AuthProvider  { 
  validateOnClienteOnline(socket: WebSocket, data: ClientOnLineDTO): boolean;    
}