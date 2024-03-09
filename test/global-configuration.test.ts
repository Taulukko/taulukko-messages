 
import { loggerFactory } from "../src/common/logger"; 
import { LogLevel,logerNames } from '../src/common/names';
import { assert } from "chai"; 
import * as sinon from "sinon";
import { globalConfiguration } from "../";

describe('global configuration api - log configuration', () => {
  before(function() {
    globalConfiguration.log.level = LogLevel.INFO;
  });
  afterEach(function() {
    globalConfiguration.log.level = LogLevel.INFO;
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
 
});