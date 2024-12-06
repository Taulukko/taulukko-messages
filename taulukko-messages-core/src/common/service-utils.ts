import { serviceStatus } from "./names";

export function validateStateChange(oldState:string,newState:string):string{
    let valid:boolean = true;
    if(newState==serviceStatus.STARTING && oldState != serviceStatus.RESTARTING)
    {
        valid = false;
    }
    if(newState==serviceStatus.ONLINE && oldState != serviceStatus.STARTING)
    {
      valid=false;
    } 
    if(valid)
    {
      return "OK";
    }
    return `Invalid State active : ${oldState} new : ${newState}` ;
  }