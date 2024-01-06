import { KeyTool } from "taulukko-commons"; 

const keyTool = new KeyTool();

export class Message {
  private options:MessageOptions;
  public id:string;
  public topic:string;
  public data:any;

  private constructor(options: MessageOptions){
    let defaults = {id:keyTool.build(1,1),topics:new Array()};
    this.options = Object.assign({}, defaults, options);
    this.id = this.options.id;
    this.topic = this.options.topic;
    this.data = this.options.data;
    
  }
  static create(options: MessageOptions) :Message{
    return new Message(options);
  }
   

}


export interface MessageOptions{
  id?:string;
  topic:string;
  data:any;
}

