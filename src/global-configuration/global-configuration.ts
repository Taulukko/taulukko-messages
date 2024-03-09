import { LogLevel, logerNames } from "../common/names";

class GlobalConfiguration{
    private logConfiguration:LogConfiguration ;
     
    private constructor(){
        this.logConfiguration = LogConfiguration.create({});
        console.log("this",this);
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

    private constructor(options:LogConfigurationOptions){
        const defaults = {level:LogLevel.INFO,showInConsole:false,consoleLog:console.log};
        options = Object.assign({}, defaults, options);
        this.level =options.level;
        this.showInConsole = options.showInConsole; 
        this.consoleLog = options.consoleLog;
    }
    public static create(options:LogConfigurationOptions):LogConfiguration{
        return new LogConfiguration(options);
    }
 
    
}

interface LogConfigurationOptions{
    level?:LogLevel,
    showInConsole?:boolean;
    consoleLog?:(...data:any[])=>void;
}

export var globalConfiguration =  GlobalConfiguration.create({});