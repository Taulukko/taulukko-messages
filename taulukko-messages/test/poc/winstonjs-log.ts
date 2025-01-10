import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
 
var transport = new DailyRotateFile({
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });


transport.on('rotate', function(oldFilename, newFilename) {
    // do something fun
  });


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [ 
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'info.log', level: 'info' }),
    //  new winston.transports.File({ filename: 'combined.log' }),
      transport
    ],
  });

  
 logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));



  logger.log({
    level: 'info',
    message: 'Info message!'
  });
  
 logger.error('Error message');
  
