export enum  LogLevel{
  TRACE=5,
  DEBUG=4,
  INFO=3,
  ERROR=2,
  CRITICAL=1 
}

class Logger {
  options:LoggerOptions;

  constructor(options:any){
    const defaults = { defaultLevel: LogLevel.INFO };
    options = Object.assign({}, defaults, options);
    this.options = options as LoggerOptions;
  }

  public open(){
  }
  public close(){
  }

  /***Compare if a is lesser or equal than be, eg:
   * isLesserOrEqualThan(TRACE,TRACE) = true
   * isLesserOrEqualThan(TRACE,DEBUG) = true
   * isLesserOrEqualThan(DEBUG,TRACE) = false
   * 
  */
  private isLesserOrEqualThan(a:LogLevel,b:LogLevel):boolean
  {

    if(a==LogLevel.DEBUG && b!= LogLevel.TRACE )
    {
      return false;
    }
    if(a==LogLevel.INFO &&  [LogLevel.TRACE,LogLevel.DEBUG,LogLevel.TRACE].find((i)=>i==b,false))
    {
      return false;
    }
    if(a==LogLevel.ERROR && [LogLevel.TRACE,LogLevel.DEBUG,LogLevel.INFO,LogLevel.ERROR].find((i)=>i==b,false))
    {
      return false;
    }
    if(a==LogLevel.CRITICAL && a!=b)
    {
      return false;
    }
    return true;
  }
  public log(level:LogLevel,message?: any, ...optionalParams: any[]){
    if(!this.isLesserOrEqualThan(this.options.defaultLevel,level))
    {
      return;
    }
    if(message)
    {
      console.log(message,optionalParams);
    }
    else{
      console.log(...optionalParams);
    }
  }
  private common(level:LogLevel, message?: any, ...optionalParams: any[])
  {
    if(message)
    {
      this.log(level,message,...optionalParams);
    }
    else{
      this.log(level,...optionalParams);
    }
  }
  public trace(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.TRACE,message,...optionalParams);
  }
  public debug(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.DEBUG,message,...optionalParams);
  }
  public info(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.INFO,message,...optionalParams);
  }
  public error(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.ERROR,message,...optionalParams);
  }
  public critical(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.CRITICAL,message,...optionalParams);
  }
  public log5(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.TRACE,message,...optionalParams);
  }
  public log4(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.DEBUG,message,...optionalParams);
  }
  public log3(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.INFO,message,...optionalParams);
  }
  public log2(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.ERROR,message,...optionalParams);
  }
  public log1(message?: any, ...optionalParams: any[])
  {
    this.common(LogLevel.CRITICAL,message,...optionalParams);
  }
}

interface LoggerOptions{
  defaultLevel:LogLevel
}

const factory = new Map<String,Logger>();
const defaultLogger = new Logger({});
defaultLogger.open();
factory.set("default",defaultLogger);

export var loggerFactory  = factory;

