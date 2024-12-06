// mockHttp.ts

import { EventEmitter } from 'events';

// Mock para IncomingMessage
export class IncomingMessage extends EventEmitter {
  public headers: Record<string, string> = {};
  public method?: string;
  public url?: string;

  constructor() {
    super();
  }
}

// Mock para ServerResponse
export class ServerResponse extends EventEmitter {
  public statusCode?: number;
  public headersSent: boolean = false;

  public writeHead(statusCode: number, headers?: Record<string, string>): this {
    this.statusCode = statusCode;
    this.headersSent = true;
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        this.setHeader(key, value);
      }
    }
    return this;
  }

  public setHeader(name: string, value: string): void {
    this.emit('header', { name, value });
  }

  public end(data?: any): void {
    this.emit('finish', data);
  }

  public write(chunk: any): void {
    this.emit('data', chunk);
  }
}

// Mock para ClientRequest
export class ClientRequest extends EventEmitter {
  public end(): void {
    this.emit('end');
  }

  public write(chunk: any): void {
    this.emit('data', chunk);
  }
}

// Mock para Server
export class Server extends EventEmitter {
  public listen(port: number,  callback?: () => void): this {
    console.log(`Mock server listening on localhost'}:${port}`);
    callback && callback();
    return this;
  }

  public close(callback?: () => void): void {
    callback && callback();
  }
}

// Funções de simulação que imitam as funções do módulo 'http'
export function createServer(
  requestListener?: (req: IncomingMessage, res: ServerResponse) => void
): Server {
  const server = new Server();
  if (requestListener) {
    server.on('request', requestListener);
  }
  return server;
}

export function request(
  options: { method?: string; hostname?: string; port?: number; path?: string },
  callback: (res: IncomingMessage) => void
): ClientRequest {
  const req = new ClientRequest();
  const res = new IncomingMessage();
  callback(res);
  return req;
}

export function get(
  options: { hostname?: string; port?: number; path?: string },
  callback: (res: IncomingMessage) => void
): ClientRequest {
  return request({ method: 'GET', ...options }, callback);
}
