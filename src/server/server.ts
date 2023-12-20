import {Data} from "src/common/data";


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
  
    public async sendAll(topic:string,data:any){
      throw new Error('Method not implemented.');
    }
      
  };
  
export interface ServerData extends Data {
    port:number;
    host:string;
  }
  