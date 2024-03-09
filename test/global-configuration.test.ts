 
import { loggerFactory } from "../src/common/logger"; 
import { LogLevel,logerNames } from '../src/common/names';
import { assert } from "chai"; 
import * as sinon from "sinon";
import { globalConfiguration } from "../";

describe('global configuration api - log configuration', () => {
  before(function() {
    globalConfiguration.log.level = LogLevel.INFO;
    globalConfiguration.log.showInConsole = false;
  });
  afterEach(function() {
    globalConfiguration.log.level = LogLevel.INFO;
    globalConfiguration.log.showInConsole = false;
  });

  it('Default Global Configuration isnt null',async  () => {
    assert.isNotNull(globalConfiguration);     
  });

  it('Changing loglevel by global configuration',async  () => {
   
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = sinon.spy(logger, 'log');
    logger.trace("Trace");
    assert.isTrue(spy.notCalled,"trace wont be called because the default is info"); 
    globalConfiguration.log.level = LogLevel.TRACE;
    logger.trace("Trace");
    assert.isTrue(spy.calledOnce,"need be called when loglevel was change ");
    spy.restore();

  });

  it('Changing ShowInConsole property',async  () => {
    // sinon.spy(console, 'log') not work, so I need inject the console.log function
    let counter:number = 0;
    let consoleLog=(...data:any[])=>counter++;
    globalConfiguration.log.consoleLog = consoleLog;

    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
  
    logger.info("test");
    assert.isTrue(counter==0,"not can be called when showInConsole is False ");
    globalConfiguration.log.showInConsole = true;
    logger.info("test ok");
    assert.isTrue(counter==1,"need be called when showInConsole is True ");

  });
 
});