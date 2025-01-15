import { LogLevel } from "taulukko-messages-client";
import {logerNames} from "../../global-configuration";
import { globalConfiguration } from "../global-configuration";

import * as moment from "moment";
import { LoggerStrategyFileSystemWinston } from "./logger-strategy-file-system-winston";
import { LoggerStrategy } from "./logger-strategy";
 

export class Logger {
  strategy:LoggerStrategy = LoggerStrategyFileSystemWinston.create({});
  options:LoggerOptions;

  private constructor(options:any){
    
    const defaults = {  };
    options = Object.assign({}, defaults, options);
    this.options = options as LoggerOptions;
  }

  static create(options:LoggerOptions):Logger
  {
    return new Logger(options);
  }

  public open(){
  }
  public close(){
  }

  private getHead(level:LogLevel):string{
    const head:string = moment().format(globalConfiguration.log.pattern).replaceAll("LOGLEVEL",LogLevel[level]);
    return head;
  }

  public log(level:LogLevel,message?: any, ...optionalParams: any){
     
    const head:string = moment().format(globalConfiguration.log.pattern).replaceAll("LOGLEVEL",LogLevel[level]);
    let error:boolean = false;

    if(message)
    {
       
      try{ 
        this.strategy.log(level, message,...optionalParams);
      }
      catch(e)
      { 
        const subHead:string = moment().format(globalConfiguration.log.pattern).replaceAll("LOGLEVEL",LogLevel[LogLevel.WARNING]);
        globalConfiguration.log.consoleLog(subHead,"Error when log into a strategy " + this.strategy.name + "@" + this.strategy.version,e);
        error=true;
      }
      
      if(error || globalConfiguration.log.showInConsole)
      { 
        globalConfiguration.log.consoleLog(head,message,...optionalParams);
      }
      return;
    }
    
    
    try{
      this.strategy.log(level, head+message,...optionalParams);
    }
    catch(e)
    {
      const subHead:string = moment().format(globalConfiguration.log.pattern).replaceAll("LOGLEVEL",LogLevel[LogLevel.WARNING]);  
      globalConfiguration.log.consoleLog(subHead,"Error when log into a strategy "  + this.strategy.name + "@" + this.strategy.version,e);
      error = true;
    }
    if(error || globalConfiguration.log.showInConsole)
    {
      globalConfiguration.log.consoleLog(head,...optionalParams);
    }
  }

  private common(level:LogLevel, message?: any, ...optionalParams: any)
  {
    const needBeFiltered:boolean =  globalConfiguration.log.level<level; 
    if(needBeFiltered)
    {
      return;
    } 
    if(message)
    { 
      this.log(level,message,...optionalParams);
    }
    else{
      this.log(level,...optionalParams);
    }
  }
  public notice(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.NOTICE,message,...optionalParams);
  }

  public emergency(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.EMERGENCY,message,...optionalParams);
  }
  public alert(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.ALERT,message,...optionalParams);
  }
  public debug(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.DEBUG,message,...optionalParams);
  }
  public info(message?: any, ...optionalParams: any)
  { 
    this.common(LogLevel.INFO,message,...optionalParams);
  }
  public error(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.ERROR,message,...optionalParams);
  }
  public critical(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.CRITICAL,message,...optionalParams);
  }
  public log7(message?: any, ...optionalParams: any)
  {
    this.common(7,message,...optionalParams);
  }
  public log6(message?: any, ...optionalParams: any)
  {
    this.common(6,message,...optionalParams);
  }
  public log5(message?: any, ...optionalParams: any)
  {
    this.common(5,message,...optionalParams);
  }
  public log4(message?: any, ...optionalParams: any)
  {
    this.common(4,message,...optionalParams);
  }
  public log3(message?: any, ...optionalParams: any)
  {
    this.common(3,message,...optionalParams);
  }
  public log2(message?: any, ...optionalParams: any)
  {
    this.common(2,message,...optionalParams);
  }
  public log1(message?: any, ...optionalParams: any)
  {
    this.common(1,message,...optionalParams);
  }

  public log0(message?: any, ...optionalParams: any)
  {
    this.common(0,message,...optionalParams);
  }
}

export interface LoggerOptions{
}

const factory = new Map<String,Logger>();
const defaultLogger = Logger.create({});
defaultLogger.open();
factory.set(logerNames.LOGGER_DEFAULT,defaultLogger);

export var loggerFactory  = factory;
