import { LogLevel } from "./names";

import { globalConfiguration } from "../global-configuration";

import * as moment from "moment"; 

class Logger {
  options:LoggerOptions;

  constructor(options:any){
    
    const defaults = {  };
    options = Object.assign({}, defaults, options);
    this.options = options as LoggerOptions;
  }

  public open(){
  }
  public close(){
  }

  /***Check if need be filtered, eg:
   * needBeFiltered(TRACE,any case ) = false
   * needBeFiltered(DEBUG,TRACE) = true
   * needBeFiltered(DEBUG,DEBUG) = false
   * needBeFiltered(DEBUG,ERROR) = false
   * needBeFiltered(INFO,CRITICAL) = false
   * needBeFiltered(INFO,DEBUG) = true
   * 
  */
  private needBeFiltered(defaultLevel:LogLevel,level:LogLevel):boolean
  {
    if(defaultLevel==LogLevel.DEBUG && ![LogLevel.CRITICAL,LogLevel.ERROR,LogLevel.INFO,LogLevel.DEBUG].find((i)=>i==level,false) )
    {
      return true;
    }

    if(defaultLevel==LogLevel.INFO && ![LogLevel.CRITICAL,LogLevel.ERROR,LogLevel.INFO].find((i)=>i==level,false))
    {
      return true;
    }

    if(defaultLevel==LogLevel.ERROR && ![LogLevel.CRITICAL,LogLevel.ERROR].find((i)=>i==level,false))
    {
      return true;
    }

    if(defaultLevel==LogLevel.CRITICAL && defaultLevel!=level)
    {
      return true;
    }

    return false;
  }
 

  public log(level:LogLevel,message?: any, ...optionalParams: any){

    const head:string = moment().format(globalConfiguration.log.pattern).replaceAll("LOGLEVEL",LogLevel[level]);
  
    if(message)
    {
      if(globalConfiguration.log.showInConsole)
      {
        globalConfiguration.log.consoleLog(head,message,...optionalParams);
      }
      return;
    }
    
    if(globalConfiguration.log.showInConsole)
    {
      globalConfiguration.log.consoleLog(head,...optionalParams);
    }
  }

  private common(level:LogLevel, message?: any, ...optionalParams: any)
  {
    if(this.needBeFiltered(globalConfiguration.log.level,level))
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
  public trace(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.TRACE,message,...optionalParams);
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
  public log5(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.TRACE,message,...optionalParams);
  }
  public log4(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.DEBUG,message,...optionalParams);
  }
  public log3(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.INFO,message,...optionalParams);
  }
  public log2(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.ERROR,message,...optionalParams);
  }
  public log1(message?: any, ...optionalParams: any)
  {
    this.common(LogLevel.CRITICAL,message,...optionalParams);
  }
}

interface LoggerOptions{ 
}

const factory = new Map<String,Logger>();
const defaultLogger = new Logger({});
defaultLogger.open();
factory.set("default",defaultLogger);

export var loggerFactory  = factory;

