 
import { loggerFactory } from "../src/common/logger"; 
import { LogLevel,logerNames } from '../src/common/names';
import { assert } from "chai"; 
import * as sinon from "sinon";

describe('logger api', () => {

  it('Default Logger isnt null',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    assert.isNotNull(logger); 
  });

  it('Check if log function obey default level ',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = sinon.spy(logger, 'log');
    logger.trace("Trace");
    assert.isTrue(spy.notCalled);
    logger.critical("Critical error");
    assert.isTrue(spy.calledOnce);
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