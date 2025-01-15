import { LogLevel } from  "taulukko-messages-client";
import { LoggerStrategy } from "./index";

import { globalConfiguration } from "../global-configuration"; 

import * as moment from "moment";

import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';


//TODO: Create configurations for this strategy
const transport = new DailyRotateFile({
  filename: 'taulukko-messages-%DATE%.log',
  dirname: 'log',
  datePattern: "YYYYMMDDHHmm",
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});
   

function fusionParameters(arg0: any[]): string {
  return arg0.reduce((previousValue,currentValue)=> previousValue.toString()+currentValue.toString()).toString();
}
 

const logger = winston.createLogger({
  level: LogLevel[globalConfiguration.log.level],
  levels: {
    DEBUG:7,
    INFO:6,
    NOTICE:5,
    WARNING:4,
    ERROR:3,
    CRITICAL:2,
    ALERT:1,
    EMERGENCY:0 
  },
  format: winston.format.json(),
  defaultMeta: { service: 'taulukko-messages' },
  transports: [   
    transport
  ],
});


logger.add(new winston.transports.Console({
  format: winston.format.simple(),
}));

export class LoggerStrategyFileSystemWinston implements LoggerStrategy{ 
  name:string = "LoggerStrategyFileSystemWinston";
  version:string = "1.00.00";
  
  private constructor(options: LoggerStrategyFileSystemOptions){
  }

  static create(options: LoggerStrategyFileSystemOptions){
    return new LoggerStrategyFileSystemWinston(options);
  }
  
  public log(level:LogLevel,message?: any, ...optionalParams: any){

    const head:string = moment().format(globalConfiguration.log.pattern).replaceAll("LOGLEVEL",LogLevel[level]);
  
    if(message)
    {     
      logger.log({
        level: LogLevel[globalConfiguration.log.level],
        head,
        optionalParams,
        message: message
      });
      
      return;
    }
    
    
    logger.log({
      level: LogLevel[globalConfiguration.log.level],
      message:fusionParameters([head,...optionalParams])
    });

  }
 
}

export interface LoggerStrategyFileSystemOptions{

}
