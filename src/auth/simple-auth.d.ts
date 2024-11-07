import { AuthProvider } from "./auth-provider";
import { ClientOnLineDTO } from "../server/server-protocols-dtos";
import { WebSocket } from "../ws";
export declare class SimpleAuth implements AuthProvider {
    options: SimpleAuthOptions;
    private constructor();
    validateOnClienteOnline(socket: WebSocket, data: ClientOnLineDTO): boolean;
    static create(options?: any): AuthProvider;
}
export interface SimpleAuthOptions {
    password: string;
}
