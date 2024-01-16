 
import { loggerFactory } from "../src/common/logger"; 
import { LogLevel,logerNames } from '../src/common/names';
import { assert } from "chai"; 
import * as sinon from "sinon";

describe('logger api', () => {

  it('Default Logger isnt null',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    assert.isNotNull(logger); 
  });

  it('Check if log function obey default level info ',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = sinon.spy(logger, 'log');
    logger.trace("Trace");
    assert.isTrue(spy.notCalled,"trace wont be called because the default is info");
    logger.critical("Critical error");
    assert.isTrue(spy.calledOnce,"need be called when a critical error ocorrus ");
    spy.restore();
  });

  it('Check if log function obey when change the log level ',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = sinon.spy(logger, 'log');
    logger.options.defaultLevel = LogLevel.TRACE;
    logger.trace("Trace");
    assert.isTrue(spy.calledOnce);
    spy.restore();
  });
    
});


describe('retro logger api', () => {

  it('Logger default not filter corretly',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = sinon.spy(logger, 'log');
    logger.options.defaultLevel = LogLevel.DEBUG;
    logger.trace("Trace");
    assert.isTrue(spy.notCalled);
    spy.restore();
  }); 
    
});