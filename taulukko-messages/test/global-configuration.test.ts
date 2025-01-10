 
import { Logger } from "../src/common/log/logger"; 
import { LogLevel} from 'taulukko-messages-core';
import { assert } from "chai"; 
import * as sinon from "sinon";
import { globalConfiguration } from "../";

describe('global configuration api - log configuration', () => {
  before(function() {
    globalConfiguration.log.level = LogLevel.WARNING;
    globalConfiguration.log.showInConsole = false;
  });
  afterEach(function() {
    globalConfiguration.log.level = LogLevel.WARNING;
    globalConfiguration.log.showInConsole = false;
  });

  it('Default Global Configuration isnt null',async  () => {
    assert.isNotNull(globalConfiguration);     
  });

  it('Changing loglevel by global configuration',async  () => {
   
    const logger = Logger.create({}); 
    const spy = sinon.spy(logger, 'log');
    logger.log5("DEBUG");
    assert.isTrue(spy.notCalled,"trace wont be called because the default is info"); 
    globalConfiguration.log.level = LogLevel.DEBUG;
    logger.log6("INFO");
    assert.isTrue(spy.calledOnce,"need be called when loglevel was change ");
    spy.resetHistory();

  });

  it('Changing ShowInConsole property',async  () => {
    // sinon.spy(console, 'log') not work, so I need inject the console.log function
    let counter:number = 0;
    let consoleLog=(...data:any[])=> counter++ ;
    globalConfiguration.log.consoleLog = consoleLog;

    const logger = Logger.create({}); 
     
    logger.log0("test nok"); 
    assert.isTrue(counter==0,"not can be called when showInConsole is False ");
    globalConfiguration.log.showInConsole = true;
   
    logger.log0("test ok");
    
    assert.isTrue(counter==1,"need be called one time when showInConsole is True but called " + counter);

  });

  

  it('Changing pattern property',async  () => {
    // sinon.spy(console, 'log') not work, so I need inject the console.log function
    let lastMessage:string = null;
    let consoleLog=(message,...data:any[])=>{
      lastMessage=message};
    const level:LogLevel = globalConfiguration.log.level;
    globalConfiguration.log.level = 7;  
    globalConfiguration.log.consoleLog = consoleLog;
    globalConfiguration.log.pattern = "DD#MM#YYYY#HH#mm#ss#SSSS";
    globalConfiguration.log.showInConsole = true;
     
    const now:Date = new Date();

    const logger = Logger.create({}); 
  
    logger.log4("test");
    assert.isNotNull(lastMessage ," pattern cannot be null ");
    const partMessage:Array<string> = lastMessage.split('#');
    assert.equal(partMessage.length,7); 
    let monthFormated:string = (now.getMonth()+1).toString();
    monthFormated = ("0"+monthFormated).substring(monthFormated.length-1);
    assert.equal(partMessage[1],monthFormated);
    assert.equal(partMessage[2],now.getFullYear().toString());
    

  });
 
});