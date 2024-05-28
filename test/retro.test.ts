import { LogLevel, Logger, logerNames } from '../src/common';
import  {Server,Publisher,Subscriber,Message, globalConfiguration} from '../index';
import { loggerFactory } from '../src/common/log/logger';
import { assert } from 'chai';

async function initServer(options={}){

  const server  = await Server.create(options);
  await server.open();
  return server;
}

 


describe.only('retro test', () => {
  it('#20240510-Corrigir o log ver #20240510',async  () => {

  let count:number =1;
  
  let logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
  globalConfiguration.log.level = LogLevel.DEBUG;
  globalConfiguration.log.showInConsole = true;
 
  globalConfiguration.log.consoleLog = (head:string,message:string)=>{
    assert.notEqual(message.indexOf("teste"+count++),-1);
  };
  logger.debug("teste1");
  logger = Logger.create({});
  logger.debug("teste2");

  });
});