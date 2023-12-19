
import {Data} from "./data";

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
  