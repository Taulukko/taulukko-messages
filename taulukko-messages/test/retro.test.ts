import { LogLevel, Logger, logerNames } from '../src/common';
import  {globalConfiguration} from '../index';
import { loggerFactory } from '../src/common/log/logger';
import { assert } from 'chai';
 
 


describe('retro test', () => {
  it('#20240510-Corrigir o log ver #20240510',async  () => {

  let count:number =1;
  
  let logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
  const oldConsoleLog = globalConfiguration.log.consoleLog;
  const oldLevel = globalConfiguration.log.level;

  globalConfiguration.log.level = LogLevel.DEBUG;
  globalConfiguration.log.showInConsole = true;
 
  globalConfiguration.log.consoleLog = (head:string,message:string)=>{
    assert.notEqual(message.indexOf("teste"+count++),-1);
  };
  logger.debug("teste1");
  logger = Logger.create({});
  logger.debug("teste2");
  globalConfiguration.log.consoleLog = oldConsoleLog;
  globalConfiguration.log.level = oldLevel;

  });
});