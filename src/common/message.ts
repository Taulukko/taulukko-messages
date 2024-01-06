import { KeyTool } from "taulukko-commons"; 

const keyTool = new KeyTool();

export class Message {
  private options:MessageOptions;
  private _id:string;

  private constructor(options: MessageOptions){
    this.options = options;
    this._id = keyTool.build(1,1);
  }
  static create(options: MessageOptions) :Message{
    return new Message(options);
  }
  
  get data():any{
    return this.options.data;
  }

  get topic():string{
    return this.options.topic;
  }

  get id():string{
    return this._id;
  }
}


export interface MessageOptions{
  topic:string;
  data:any;
}