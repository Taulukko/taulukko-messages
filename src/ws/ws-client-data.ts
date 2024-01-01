export class WSClientData { 
    id: string;
    constructor(options:WebSocketOptions){
      this.id = options.id;
    }
  }