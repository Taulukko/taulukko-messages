 
import { Logger, loggerFactory } from "../../src/common/log/logger"; 
import { LogLevel,logerNames } from '../../src/common/names';
import { globalConfiguration } from "../../src/global-configuration";
import { assert } from "chai"; 
import * as sinon from "sinon";

describe('logger file strategy', () => {
  before(function() {
    
  });
  afterEach(function() {
    
  });

  it('Simple logger test',async  () => {
    const logger = Logger.create({}); 
    logger.log0("Critical error");
    logger.log7("Verbosity message");
    //load file and check the message critical appears and verbosity not
  });
    
});