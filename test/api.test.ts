
import  {Server,Publisher,Subscriber,Message,serviceStatus, globalConfiguration} from '../index';
import { LogLevel, logerNames, systemTopics } from '../src/common/names';
import { assert } from "chai"; 
import { Logger } from '../src/common';
import { loggerFactory } from '../src/common/log/logger';


var semaphore:boolean; 
var lastError:Error; 

async function initServer(options={}){
  try { 
    const defaults = {defaultLogLevel:LogLevel.ERROR};
    options = Object.assign({}, defaults, options); 
    const server  =  Server.create(options);
    await server.open();
    return server;
  } catch (error) {
    return null;
  }

}

 
describe.only("api.basics",  function test(options={}){
 
  it("Open server ",async function(){
    const server = await initServer();

    assert.equal(server.publishers.length,0,"server.ublishers need be start with zero");
   
    await server.close(); 
  }); 

  it("Open publisher ",async function(){ 
    const server = await initServer();

    assert.equal(server.publishers.length,0,"server.ublishers need be start with zero");


    const publisher = Publisher.create({ 
      topics:["topic.helloWorld","unexistentTopic"],
      defaultLogLevel:LogLevel.ERROR
    });

    assert.equal(server.publishers.length, 0,"server.publishers need be incremented after open");

    assert.equal(publisher.data.status,serviceStatus.STARTING,"Start state need be STARTING");
 
     
    await publisher.open();    
    
    assert.equal(server.publishers.length,1,"Publishers need be equal 1");

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Publishers need be equal ONLINE");

    assert.equal(server.publishers.length,1,"Publishers need be equal 1");

    assert.equal(server.subscribers.length,0,"Subscribers need be equal 0");  
 
    await publisher.send("topic.helloWorld","Hello World");
 

    setTimeout(async ()=>{ 
      await publisher.close(); 
  
      assert.equal(server.publishers.length,0,"Publishers need be equal 0");
     
     
      await server.close();  
    },5000);
    
  }); 

  
  
  it("Check if host config work ",async function(  ){


 
    const timeout:number = 500;

    const startTime:number  = new Date().getTime();

    let server1 =  await initServer({
        port:"7778",
        topics:["topic.helloWorld"] 
      });
   
   
    assert.isNotNull(server1);

    const publisher = Publisher.create({ 
      server:"taulukko://notexist:7778",
      topics:["topic.helloWorld","unexistentTopic"],
      defaultLogLevel:LogLevel.ERROR,
      timeout
    });

    assert.equal(publisher.data.status,serviceStatus.STARTING,"Start state need be STARTING");
 
    try{ 
      await publisher.open();
 

      assert.fail("Never can connect using a non existent server");
    }
    catch(e)
    { 
      assert.isNotNull(e); 
      assert.isTrue(e.message.toUpperCase().indexOf("TIME OUT")>=0,"Error havent timeout message " + e.toString());
      
    }

    const endTime:number  = new Date().getTime();
    const deltaTime:number = endTime - startTime;
 
    assert.isTrue(deltaTime >= timeout,"Timeout, the server should not exist" + deltaTime);

    assert.equal(publisher.data.status,serviceStatus.FAIL,"Start state need be FAIL");
 
    assert.equal(server1.publishers.length,0,"Publishers need be equal 0");   
    await publisher.forceClose(); 
    await server1.forceClose();  
     
  }); 

  
  it.only("Check if port config work ",async function(){
    this.timeout(5000);

    const startTime:number  = new Date().getTime();

    let server1 = null;
    
    setTimeout(async()=>{
      console.log("Abrindo o server certo");
      server1 = await initServer({
        port:"7777",
        topics:["topic.helloWorld"] 
      });
      console.log("O server certo foi aberto");
  
    },100);
   
    assert.isNull(server1);

    const server2 = await initServer({
      port:"8888",
      topics:["topic.helloWorld"] 
    });

    assert.isNotNull(server2);


    const publisher = Publisher.create({ 
      server:"taulukko://localhost:7777",
      topics:["topic.helloWorld","unexistentTopic"],
      defaultLogLevel:LogLevel.ERROR,
      timeout:3000
    });

    assert.equal(publisher.data.status,serviceStatus.STARTING,"Start state need be STARTING");
 
    console.log("teste 1");
    await publisher.open();    

    console.log("teste 2");

    const endTime:number  = new Date().getTime();
    const deltaTime:number = endTime - startTime;

   
    assert.equal(server2.publishers.length,0,"Publishers need be equal 0 in Server 2 because the port is not equal");
      
    await server2.close();

    assert.isTrue(deltaTime < 9000,"Ignored port");
 
    assert.equal(server1.publishers.length,1,"Publishers need be equal 1 in Server 1");

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Publishers need be equal ONLINE");

    assert.equal(server1.publishers.length,1,"Publishers need be equal 1");

    assert.equal(server1.subscribers.length,0,"Subscribers need be equal 0");  

    await publisher.send("topic.helloWorld","Hello World");


    await publisher.close();

    assert.equal(server1.publishers.length,0,"Publishers need be equal 0");
   
   
    await server1.close(); 
  }); 

  

  it('Open subscriber and receiving a string message',async  () => {

    const logger: Logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);
    //globalConfiguration.log.level = LogLevel.DEBUG;
    

    logger.debug("Api tests 1 : Before init Server");

    const server = await initServer();

    logger.debug("Api tests 2 : After init Server");

    assert.equal(server.publishers.length,0);

    logger.debug("Api tests 3 : Before create publisher");

    const publisher = await Publisher.create({ 
      topics:["topic.helloWorld"],
      defaultLogLevel:LogLevel.ERROR
    });

    logger.debug("Api tests 4 : After create publisher");

    assert.equal(server.publishers.length,0,"Must be zero before the publisher.open");
    assert.equal(publisher.data.status,serviceStatus.STARTING,"Must be STARTING before publisher.open");

    logger.debug("Api tests 5 : Before open publisher");

    await publisher.open();

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE after publisher.open");

    assert.equal(server.publishers.length,1,"Must be 1 after publisher.open");

    assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
 
    logger.debug("Api tests 6 : Before create subscriber");

    const subscriber = await Subscriber.create({ 
      topics:["topic.helloWorld","unexistentTopic" ], defaultLogLevel:LogLevel.ERROR
    });
    

    logger.debug("Api tests 7 : After create subscriber");


    assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
    assert.equal(server.publishers.length,1,"Must be 1 yet");

    assert.equal(subscriber.data.status,serviceStatus.STARTING,"Must be STARTING before open");

    logger.debug("Api tests 8 : Before open subscriber");

    await subscriber.open();

    logger.debug("Api tests 9 : After open subscriber");

    assert.equal(server.subscribers.length,1,"Must be 1 after open");

    assert.equal(subscriber.data.status,serviceStatus.ONLINE,"Must be ONLINE before open");
 

    await subscriber.on(async (message:Message)=>{
      try{
        logger.debug("Api tests 10 : After receive message");
        assert.equal(message.topic,"topic.helloWorld","Topic need be the same topic in the publisher.send");
        assert.equal(message.data, "Hello World","Message need be Hello World");
        assert.equal(server.subscribers.length,1,"subscribers need be 1 into the server");
        assert.equal(server.publishers.length,1,"publisher need be 1 into the server"); 
        logger.debug("Api tests 11 : Before subscriber close");

        await subscriber.close();
        logger.debug("Api tests 12 :After subscriber close"); 
        assert.equal(server.subscribers.length,0,"subscribers need be 0 into the server after subscriber close");
        assert.equal(server.publishers.length,1,"publisher need be 1 into the server after subscriber close");
        logger.debug("Api tests 13 :Before publisher close"); 
        await publisher.close(); 
        logger.debug("Api tests 14 :After publisher close"); 
        assert.equal(server.subscribers.length,0,"subscribers need be 0 into the server after publisher close");
        assert.equal(server.publishers.length,0,"publisher need be 0 into the server  after subscriber close"); 
        logger.debug("Api tests 15 : Before server close"); 
        await server.close(); 
        logger.debug("Api tests 16 : After server close");
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
 
    logger.debug("Api tests 16 : Beforesend message"); 

    await publisher.send("Hello World"); 
 
    logger.debug("Api tests 17 : After send message"); 

    assert.ifError( await receiveTheMessage()); 
    logger.debug("Api tests 18 : After receive the  message"); 

  });

  

  it('Open subscriber and receiving a string message, opening subscriber before publisher',async  () => {
    
    
    const server = await initServer();

    assert.equal(server.publishers.length,0);

    const publisher = await Publisher.create({ 
      topics:["topic.helloWorld"],
      defaultLogLevel:LogLevel.ERROR
    });

    assert.equal(server.publishers.length,0,"Must be zero before the publisher.open");
    assert.equal(publisher.data.status,serviceStatus.STARTING,"Must be STARTING before publisher.open");

    const subscriber = await Subscriber.create({ 
      topics:["topic.helloWorld","unexistentTopic" ], defaultLogLevel:LogLevel.ERROR
    });
    

    assert.equal(server.subscribers.length,0,"Must be 0 before subscriber.open");
    assert.equal(server.publishers.length,0,"Must be 1 yet");

    assert.equal(subscriber.data.status,serviceStatus.STARTING,"Must be STARTING before open");

    await subscriber.open();
    
    assert.equal(server.subscribers.length,1,"Must be 1 after open");

    await publisher.open();

    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE after publisher.open");

    assert.equal(server.publishers.length,1,"Must be 1 after publisher.open");

    assert.equal(server.subscribers.length,1,"Keep 1 after publisher.open");
  
    assert.equal(subscriber.data.status,serviceStatus.ONLINE,"Must be ONLINE before open");
 

    await subscriber.on(async (message:Message)=>{
      try{
       
        assert.equal(message.topic,"topic.helloWorld","Topic need be the same topic in the publisher.send");
        assert.equal(message.data, "Hello World","Message need be Hello World");
        assert.equal(server.subscribers.length,1,"subscribers need be 1 into the server");
        assert.equal(server.publishers.length,1,"publisher need be 1 into the server"); 
        await subscriber.close();
        assert.equal(server.subscribers.length,0,"subscribers need be 0 into the server after subscriber close");
        assert.equal(server.publishers.length,1,"publisher need be 1 into the server after subscriber close"); 
        await publisher.close(); 
        assert.equal(server.subscribers.length,0,"subscribers need be 0 into the server after publisher close");
        assert.equal(server.publishers.length,0,"publisher need be 0 into the server  after subscriber close"); 
        await server.close(); 
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
        
  });
  
  it('publish a string message for all',async  () => {
     const server = await initServer(); 
  
    let countMessages=0;
    const subscriber1 = await Subscriber.create({
      server:"taulukko://localhost:7777",
      topics:["topic.helloWorld1"] 
    }); 

    const subscriber2 = await Subscriber.create({
      server:"taulukko://localhost:7777", 
      topics:[ ] 
    }); 

    await subscriber1.open();
    await subscriber2.open();
    

    const onReceiveBradcast = async (message:Message)=>{
      
      try{
        countMessages++;
        assert.equal(message.topic,systemTopics.BROADCAST);
        assert.equal(message.data,"test");      
      }
      catch(e)
      { 
        semaphore = true;
      }
      finally{
        if(countMessages>1)
        {
          semaphore = true;
        }
      }
    };

    await subscriber1.on(onReceiveBradcast);
    await subscriber2.on(onReceiveBradcast);

    cleanupGlobals();
    await server.sendAll("test"); 

 
    assert.ifError( await receiveTheMessage()); 

    await subscriber1.close();
    await subscriber2.close();
    
    await server.close();

    assert.equal(countMessages,2); 

  });
  
  
  
});
 


//auxiliar functions

function receiveTheMessage():Promise<Error|null> {
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
      }
      else{
        resolve(null);
      }
    },100);
  });
}

function cleanupGlobals() {
  lastError = null;
  semaphore = false;

}
  