 

export class Server {
  static create(options: {}) : Server{
    throw new Error('Method not implemented.');
  }
 
  public async open(){}
  public async close(){}
  public async forceClose(){}
  public data():ServerData  {
    throw new Error('Method not implemented.');
  }
  public publishers():Array<any>{
    throw new Error('Method not implemented.');
  }
  public subscribers():Array<any>{
    throw new Error('Method not implemented.');
  }
    
};



export class Publisher {
  static create(options: {}):Publisher {
    throw new Error('Method not implemented.');
  }
  
  async open(){}
  async close(){}
  public data():Data  {
    throw new Error('Method not implemented.');
  }
  public publish(topic:string, data:any){

  }
}


export class Subscriber {
  static create(options: {}) :Subscriber{
    throw new Error('Method not implemented.');
  }
  
  async open(){}
  async close(){}
  public data():Data  {
    throw new Error('Method not implemented.');
  }
}

export class Message {
  static create(options: {}) :Message{
    throw new Error('Method not implemented.');
  }
  topic:string;
  data:string;
}

export interface  Data {
  status:string;
  online:boolean;
  offline:boolean;
  
}


export interface ServerData extends Data {
  port:number;
  host:string;
}



