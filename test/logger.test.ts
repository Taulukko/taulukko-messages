 
import { loggerFactory } from "../src/common/logger"; 
import { LogLevel,logerNames } from '../src/common/names';
import { globalConfiguration } from "../src/global-configuration";
import { assert } from "chai"; 
import * as sinon from "sinon";

describe('logger api', () => {
  before(function() {
    globalConfiguration.log.level = LogLevel.INFO;
  });
  afterEach(function() {
    globalConfiguration.log.level = LogLevel.INFO;
  });

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
    globalConfiguration.log.level = LogLevel.TRACE;
    logger.trace("Trace");
    assert.isTrue(spy.calledOnce);
    spy.restore();
  });
    
});


describe('retro logger api', () => {

  it('Logger default not filter corretly',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = sinon.spy(logger, 'log');
    globalConfiguration.log.level = LogLevel.DEBUG;
    logger.trace("Trace");
    assert.isTrue(spy.notCalled);
    spy.restore();
  }); 
    
});