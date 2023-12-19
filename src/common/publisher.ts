import {Data} from "./data";

export class Publisher {
    static create(options: {}):Publisher {
      throw new Error('Method not implemented.');
    }
    
    async open(){}
    async close(){}
    public data():Data  {
      throw new Error('Method not implemented.');
    }
    public send(topic:string, data:any){
  
    }
  }
  