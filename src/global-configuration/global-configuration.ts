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
    private constructor(){
        this.level = LogLevel.INFO;
    }
    public static create(options:any):LogConfiguration{
        return new LogConfiguration();
    }
 
}

export var globalConfiguration =  GlobalConfiguration.create({});