import { LogLevel } from "taulukko-messages-client";  

export interface LoggerStrategy{
  name:string;
  version:string;
  log(level:LogLevel,message?: any, ...optionalParams: any);
} 