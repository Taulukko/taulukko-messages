import { LogLevel, logerNames } from "../common/names";

class GlobalConfiguration{
    private logConfiguration:LogConfiguration ;
     
    private constructor(){
        this.logConfiguration = LogConfiguration.create({}); 
    }
    public static create(options:any):GlobalConfiguration{
        return new GlobalConfiguration();
    }
    public get log():LogConfiguration{
        return this.logConfiguration;
    }
}

class LogConfiguration{
    public level:LogLevel;
    public showInConsole:boolean;
    public consoleLog:(...data:any[])=>void;
    public pattern:string;

    private constructor(options:LogConfigurationOptions){
        const defaults = {level:LogLevel.WARNING,showInConsole:true,consoleLog:console.log,pattern:"YYYY-MM-DD HH:mm:ss.SSS [LOGLEVEL] - "};
        options = Object.assign({}, defaults, options);
        this.level =options.level;
        this.showInConsole = options.showInConsole; 
        this.consoleLog = options.consoleLog;
        this.pattern = options.pattern;
    }
    public static create(options:LogConfigurationOptions):LogConfiguration{
        return new LogConfiguration(options);
    }
    
}

interface LogConfigurationOptions{
    level?:LogLevel,
    showInConsole?:boolean;
    pattern?:string;
    consoleLog?:(...data:any[])=>void;
}

export var globalConfiguration =  GlobalConfiguration.create({});