
import { loggers } from "winston";
import { loggerFactory } from "../src/common/logger"; 
import { LogLevel,logerNames } from '../src/common/names';
 

describe('logger api', () => {

  test('Default Logger isnt null',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    expect(logger).not.toBeNull(); 
  });

  test('Check if log function obey default level ',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = jest.spyOn(logger, 'log');
    logger.trace("Trace");
    expect(spy).not.toHaveBeenCalled();
    logger.critical("Critical error");
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });
 
  

  test('Check if log function obey when change the log level ',async  () => {
    const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    const spy = jest.spyOn(logger, 'log');
    logger.options.defaultLevel = LogLevel.TRACE;
    logger.trace("Trace");
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });
 

 
});