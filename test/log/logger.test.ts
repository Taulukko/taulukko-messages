 
import { Logger, loggerFactory } from "../../src/common/log/logger"; 
import { LogLevel,logerNames } from '../../src/common/names';
import { globalConfiguration } from "../../src/global-configuration";
import { assert } from "chai"; 
import * as sinon from "sinon";

describe('logger api', () => {
  before(function() {
    globalConfiguration.log.level = LogLevel.WARNING;
  });
  afterEach(function() {
    globalConfiguration.log.level = LogLevel.WARNING;
  });

  it('Default Logger isnt null',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    assert.isNotNull(logger); 
  });
 
  it('Check if log function obey default level info',async  () => {

    //DEFAULT = WARNING (4)
    const logger = Logger.create({}); 
    let spy = sinon.spy(logger, 'log');
    logger.log6("Example"); 
    assert.isTrue(spy.notCalled,"trace wont be called because the default is 4");
    spy.resetHistory(); 
    logger.log0("Critical error");
    assert.isTrue(spy.calledOnce,"need be called when a critical error ocorrus ");
    spy.resetHistory();  
    logger.log4("Common info");
    assert.isTrue(spy.calledOnce,"need be called when is the same log level ");
    spy.resetHistory();
  });

  it('Check if log function obey when change the log level ',async  () => {
    const logger = Logger.create({}); 
    const spy = sinon.spy(logger, 'log'); 
   
    logger.log5("Test1");
    assert.isFalse(spy.calledOnce,"Access denied"); 
    spy.resetHistory();
    globalConfiguration.log.level = LogLevel.NOTICE;
    logger.log5("Test2");
    assert.isTrue(spy.calledOnce,"Is the same, access granted"); 
    spy.resetHistory(); 
    logger.log4("Test3");
    assert.isTrue(spy.calledOnce,"Is more critical, access granted"); 
    spy.resetHistory(); 
  });
    
});


describe('retro logger api', () => {

  it('Logger global not filter corretly',async  () => {
    const logger = Logger.create({}); 
    const spy = sinon.spy(logger, 'log');
    globalConfiguration.log.level = LogLevel.INFO;
    logger.log7("debug"); 
    assert.isTrue(spy.notCalled,"Cannot be called, need be filtered");
    spy.resetHistory();
  }); 
    
});