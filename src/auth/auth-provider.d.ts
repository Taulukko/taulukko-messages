import { ClientOnLineDTO } from "src/server/server-protocols-dtos";
import { WebSocket } from "src/ws";
export interface AuthProvider {
    validateOnClienteOnline(socket: WebSocket, data: ClientOnLineDTO): boolean;
}
