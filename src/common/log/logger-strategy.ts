import { LogLevel } from "../index"; 

export interface LoggerStrategy{
  name:string;
  version:string;
  log(level:LogLevel,message?: any, ...optionalParams: any);
} 