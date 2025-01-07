import { WSServerOptions } from "taulukko-messages-core";



export interface TaulukkoProviderOptions extends WSServerOptions{
    topics:Array<string>,
    timeout?:number,
    port:number,
    server:string|undefined,
    host:string|undefined
  }
   