 import { assert } from "chai"; 
import { loggers } from 'winston';
import  {Server,Publisher,Subscriber,Message,serviceStatus} from '../index';
import { LogLevel, logerNames } from '../src/common/names';
import { Logger, loggerFactory } from "../src/common/log/logger";  
import { globalConfiguration } from "../src/global-configuration"; 
 

const DEFAULT_PORT:number = 7778;
var semaphore:boolean; 
var lastError:Error; 

async function initServer(options={}){

  const server  = await Server.create(options);
  await server.open();
  return server;
}


describe('stability test', () => {
  it('init Server',async  () => {
    let server = await initServer({port:7779,localhost:"127.0.0.1"});
    
    assert.equal(server.data.port,7779);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    server.forceClose();//close without exceptions

    server = await initServer({port:DEFAULT_PORT,localhost:"127.0.0.1"});

    assert.equal(server.data.port,DEFAULT_PORT);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    server.forceClose();//close without exceptions
  
  });
 
  it.skip('publish into a inexistent server with timeout but the server up before timeout',async  () => {
    const before:number = new Date().getTime();
    try{
     
      const publisher = await Publisher.create({
        server:"taulukko://notexist:" + DEFAULT_PORT, timeout:5000
      });
      await publisher.open();
    }
    catch(e)
    {
      assert.equal(e,"Erro");
      const after:number = new Date().getTime();
      const delta:number = after-before;
      assert.isTrue(delta > 5000);
      assert.isTrue(delta < 10000);

    }
    
  });

  it.skip('publish into a inexistent server with timeout but the server up before timeout',async  () => {
  

    let server =null;
    let serverOn = false;

    setTimeout(async ()=>{
      serverOn = true;
      server = await initServer()
    },1000);

    const publisher = Publisher.create({ 
      topics:["topic.helloWorld","unexistentTopic"],
      defaultLogLevel:LogLevel.ERROR, timeout:5000
    });

    assert.isTrue(serverOn,"Server must be off"); 
 
    await publisher.open(); 

    assert.equal(server.publishers.length,1,"Publishers need be equal 1"); 

    assert.isTrue(serverOn,"Server must be on"); 

    await publisher.close(); 
    await server.close(); 
  }); 
  
 it.skip('publish into a inexistent server without timeout but the server up before timeout',async  () => {
  
    let server =null;
    let serverOn = false;

    setTimeout(async ()=>{
      serverOn = true;
      server = await initServer()
    },1000);

    const publisher = Publisher.create({ 
      topics:["topic.helloWorld","unexistentTopic"],
      defaultLogLevel:LogLevel.ERROR 
    });

    assert.isTrue(serverOn,"Server must be off"); 

    await publisher.open(); 

    assert.equal(server.publishers.length,1,"Publishers need be equal 1"); 

    assert.isTrue(serverOn,"Server must be on"); 

    await publisher.close(); 
    await server.close(); 
  });

 it('reconecting into a publisher need be restarted',async  () => {
    const NUMBER_OF_TESTS = 2;
    let times = 0;
   
    const server = await initServer();

    assert.equal(server.publishers.length,0);

    let publisher = await Publisher.create({ 
      server:"taulukko://localhost:" + DEFAULT_PORT,
      topics:["topic.helloWorld"],
      defaultLogLevel:LogLevel.ERROR
    });

    assert.equal(server.publishers.length,0,"Must be zero before the publisher.open");
    assert.equal(publisher.data.status,serviceStatus.STARTING,"Must be STARTING before publisher.open");

    await publisher.open();

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE after publisher.open");

    assert.equal(server.publishers.length,1,"Must be 1 after publisher.open");

    assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
   const subscriber = await Subscriber.create({ 
      topics:["topic.helloWorld","unexistentTopic" ], defaultLogLevel:LogLevel.ERROR
    });
   assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
    assert.equal(server.publishers.length,1,"Must be 1 yet");

    assert.equal(subscriber.data.status,serviceStatus.STARTING,"Must be STARTING before open");

    await subscriber.open();

    assert.equal(server.subscribers.length,1,"Must be 1 after open");

    assert.equal(subscriber.data.status,serviceStatus.ONLINE,"Must be ONLINE before open");
   await subscriber.on(async (message:Message)=>{
      try{
      
        assert.equal(message.topic,"topic.helloWorld","Topic need be the same topic in the publisher.send");
        assert.equal(message.data, "Hello World","Message need be Hello World");
      
        
        if(++times==NUMBER_OF_TESTS)
        {
         await subscriber.close();
          await publisher.close(); 
          await server.close(); 
        }

         
      }catch(e){
        lastError=e; 
        await subscriber.forceClose();
        await publisher.forceClose();
        await server.forceClose();  
      }
      finally{ 

        semaphore = true;
      }
     
    }); 

    cleanupGlobals();
 
     
    await publisher.close(); 

    
    assert.equal(server.publishers.length,0,"Must be zero after the publisher.close");
    assert.equal(publisher.data.status,serviceStatus.STOPED,"Must be STOPED after  publisher.close");

    publisher = await Publisher.create({ 
      server:"taulukko://localhost:" + DEFAULT_PORT,
      topics:["topic.helloWorld"],
      defaultLogLevel:LogLevel.ERROR
    });

    await publisher.open();
     
    assert.equal(server.publishers.length,1,"Must be one  after the publisher.open");
    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE  after  publisher.open");
   await publisher.send("Hello World"); 
    
   assert.ifError( await receiveTheMessage()); 

    
   assert.equal(server.publishers.length,1,"Must be one  after the publisher.open");
    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE  after  publisher.open");
   cleanupGlobals();
   await publisher.send("Hello World"); 
   assert.ifError( await receiveTheMessage());

 
    assert.equal(server.publishers.length,0,"Must be zero after the publisher.close");
    assert.equal(publisher.data.status,serviceStatus.STOPED,"Must be STOPED after  publisher.close");

 
  }); 
 
  it('reconecting with a subscriber with problems',async  () => {
    const NUMBER_OF_TESTS = 2;
    let times = 0;
   
    const server = await initServer();

    assert.equal(server.publishers.length,0);

    let publisher = await Publisher.create({ 
      server:"taulukko://localhost:" + DEFAULT_PORT,
      topics:["topic.helloWorld"],
      defaultLogLevel:LogLevel.ERROR
    });

    assert.equal(server.publishers.length,0,"Must be zero before the publisher.open");
    assert.equal(publisher.data.status,serviceStatus.STARTING,"Must be STARTING before publisher.open");

    await publisher.open();

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE after publisher.open");

    assert.equal(server.publishers.length,1,"Must be 1 after publisher.open");

    assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
   let subscriber = await Subscriber.create({ 
      server:"taulukko://localhost:" + DEFAULT_PORT,
      topics:["topic.helloWorld","unexistentTopic" ], defaultLogLevel:LogLevel.ERROR
    });
   assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
    assert.equal(server.publishers.length,1,"Must be 1 yet");

    assert.equal(subscriber.data.status,serviceStatus.STARTING,"Must be STARTING before open");

    await subscriber.open();

    assert.equal(server.subscribers.length,1,"Must be 1 after open");

    assert.equal(subscriber.data.status,serviceStatus.ONLINE,"Must be ONLINE before open");
 
    const onNewMessage = async (message:Message)=>{
      try{
      
        assert.equal(message.topic,"topic.helloWorld","Topic need be the same topic in the publisher.send");
        assert.equal(message.data, "Hello World","Message need be Hello World");
      
        
        if(++times==NUMBER_OF_TESTS)
        {
         await subscriber.close();
          await publisher.close(); 
          await server.close(); 
        }

         
      }catch(e){
        lastError=e; 
        await subscriber.forceClose();
        await publisher.forceClose();
        await server.forceClose();  
      }
      finally{ 

        semaphore = true;
      }
     
    };

    await subscriber.on(onNewMessage); 

    cleanupGlobals();
    await publisher.send("Hello World"); 

 
    assert.ifError( await receiveTheMessage()); 
   await subscriber.close(); 
 
    assert.equal(server.publishers.length,1,"Need keep 1 after subscriber close");
    assert.equal(server.subscribers.length,0,"Must be one  after the subscriber.open");
    assert.equal( subscriber.data.status,serviceStatus.STOPED,"Must be STOPED after  subscriber.close");
   subscriber = await Subscriber.create({ 
      topics:["topic.helloWorld","unexistentTopic" ], defaultLogLevel:LogLevel.ERROR
    });
   await subscriber.open();

    await subscriber.on(onNewMessage); 
   assert.equal(server.publishers.length,1,"Must be zero after the publisher.close");
    assert.equal(server.subscribers.length,1,"Must be one  after the subscriber.open");
    assert.equal(subscriber.data.status,serviceStatus.ONLINE,"Must be ONLINE  after  publisher.open");

       
    cleanupGlobals();
   await publisher.send("Hello World"); 

   assert.ifError( await receiveTheMessage());

   assert.equal(server.subscribers.length,0,"Must be zero after the subscriber.close");
    assert.equal(publisher.data.status,serviceStatus.STOPED,"Must be STOPED after  publisher.close");

 }); 
  
  it.skip('Publisher with a retro configuration',async  () => {

    //if there is "retro" in the configuration, he needs to receive everything he lost since the last downtime

    const server = await initServer();

    assert.equal(server.publishers.length,0); 

    const publisher = await Publisher.create({
      server:"taulukko://notexist:" + DEFAULT_PORT, 
      retro:true
    }); 
    //TODO if the subscriber disconnect, when he enter, he receive all before your last conection
    
  }); 
    

});
 
const MINUTE = 60*1000;
const TIMEOUT = 10 * MINUTE;

describe('stability long time test', function ()  {
  this.timeout(TIMEOUT);
  it('Publisher and subscriber reconect after server restart',async  () => {
    const logger = Logger.create({});
    
    
    globalConfiguration.log.level = LogLevel.ALERT;
    globalConfiguration.log.showInConsole = true; 

    const NUMBER_OF_TESTS = 2;
    let times = 0;
   
    let server = await initServer();

    assert.equal(server.publishers.length,0);

    let publisher = await Publisher.create({ 
      server:"taulukko://localhost:" + DEFAULT_PORT,
      topics:["topic.helloWorld"],
      defaultLogLevel:LogLevel.ERROR
    });

    assert.equal(server.publishers.length,0,"Must be zero before the publisher.open");
    assert.equal(publisher.data.status,serviceStatus.STARTING,"Must be STARTING before publisher.open");

    await publisher.open();

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE after publisher.open");

    assert.equal(server.publishers.length,1,"Must be 1 after publisher.open");

    assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
   const subscriber = await Subscriber.create({ 
      topics:["topic.helloWorld","unexistentTopic" ], defaultLogLevel:LogLevel.ERROR
    });
   assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
    assert.equal(server.publishers.length,1,"Must be 1 yet");

    assert.equal(subscriber.data.status,serviceStatus.STARTING,"Must be STARTING before open");

    await subscriber.open();

    assert.equal(server.subscribers.length,1,"Must be 1 after open");

    assert.equal(subscriber.data.status,serviceStatus.ONLINE,"Must be ONLINE before open");
   await subscriber.on(async (message:Message)=>{
      try{
        logger.debug("Listener on,1");
        
        assert.equal(message.topic,"topic.helloWorld","Topic need be the same topic in the publisher.send");
        assert.equal(message.data, "Hello World","Message need be Hello World");
      
        logger.debug("Listener on,2",times);

        if(++times!=NUMBER_OF_TESTS)
        {
          return;
        }
        logger.debug("Listener on,3",times);

        await subscriber.close();
        await publisher.close(); 
        await server.close();
         
        logger.debug("Listener on,4",times);
      }catch(e){
        lastError=e; 
        await subscriber.forceClose();
        await publisher.forceClose();
        await server.forceClose();  
      }
      finally{ 

        semaphore = true;
      }
     
    }); 

    cleanupGlobals();
 
    await publisher.send("Hello World"); 
    
    assert.ifError( await receiveTheMessage()); 
 

    await server.close(); 
     
    
    assert.equal(server.publishers.length,0,"Publishers must be zero after the server.close");
    assert.equal(server.subscribers.length,0,"Subscribers must be zero after the server.close");
    assert.equal(server.data.status,serviceStatus.STOPED,"Must be STOPED after  server.close");
 
    server = await initServer();

    
      

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE  after  server.open");

    logger.debug("Debug 6 : After check online server");
    
    //observation: not use await because if the function (like waitReconnect) uses setInterval or setTimeout causes error
    //this happen only into a test enviroment
    //not work  assert.isTrue( await  publisher.waitReconnect() ); 
    publisher.waitReconnect().then(async (value)=>{ 
      if(!value){
        console.error("ERROR: publisher.waitReconnect");
      } 
    
      logger.debug("Debug 6.1 : After waitReconect publisher"); 
      subscriber.waitReconnect().then(
        async (value)=>{

          
          if(!value){console.error("ERROR: publisher.waitReconnect");} 

          logger.debug("Debug 6.2 : After waitReconect publisher"); 
 
          if(server.publishers.length!=1)
          {
            logger.debug("ERROR: publisher need be 1 after reconect");
          }
          logger.error("Debug 7 : publisher ok");
          if(server.subscribers.length!=1)
          {
            logger.error("ERROR: publisher need be 1 after reconect");
          }
              
         logger.debug("Debug 8 : Before send message");

         publisher.send("Hello World").then(async ()=>{
            logger.debug("Debug 9 : After send message");
            cleanupGlobals();

            logger.debug("Debug 10 : After Cleanup Globals");

            receiveTheMessage().then(()=>{

            logger.alert("END of Tests! Verify if there are errors above");
         
              
            }); 
         
         
          }
         );
      
  
         }
      );
 

    } ); 
     

  });
});

//auxiliar functions
function receiveTheMessage():Promise<Error|null> { 

  const TIME_TO_CHECK = 50;
  return new Promise((resolve,reject)=>{ 
    const handle = setInterval(()=>{ 
      if(!semaphore)
      {  
        
        return;
      }
      clearTimeout(handle);

      if(lastError)
      {
        reject(lastError);
        return;
      }

      resolve(null);
    },TIME_TO_CHECK);
    
  });
}

function cleanupGlobals() {
  lastError = null;
  semaphore = false;

}