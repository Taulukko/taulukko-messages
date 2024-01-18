import  {Server,Publisher,Subscriber,Message,proccessStatus} from '../index';
import { LogLevel, serviceStatus } from '../src/common/names';
import { assert } from "chai"; 


var semaphore:boolean; 
var lastError:Error; 

async function initServer(options={}){
  const defaults = {defaultLogLevel:LogLevel.ERROR};
  options = Object.assign({}, defaults, options);
  const server  =  Server.create(options);
  await server.open();
  return server;
}

 
describe("api.basics",  function test(options={}){

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

    assert.equal(publisher.data.status,proccessStatus.STARTING,"Start state need be STARTING");
 
    await publisher.open();    

    assert.equal(server.publishers.length,1,"Publishers need be equal 1");

    assert.equal(publisher.data.status,proccessStatus.ONLINE,"Publishers need be equal ONLINE");

    assert.equal(server.publishers.length,1,"Publishers need be equal 1");

    assert.equal(server.subscribers.length,0,"Subscribers need be equal 0");  

    await publisher.send("topic.helloWorld","Hello World");


    await publisher.close();

    assert.equal(server.publishers.length,0,"Publishers need be equal 0");
   
   
    await server.close(); 
  }); 

  

  it('Open subscriber and receiving a string message',async  () => {
    
    
    const server = await initServer();

    assert.equal(server.publishers.length,0);

    const publisher = await Publisher.create({ 
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
 
  it.skip('publish a string message for all',async  () => {
    const server = await initServer(); 
  
    let countMessages=0;

    const subscriber = await Subscriber.create({
      server:"taulukko://localhost:7777",
      topics:["topic.helloWorld","unexistentTopic"],
      handler:(message:Message)=>{
        countMessages++;
      //  expect(["topic.helloWorld","unexistentTopic"] ).toContain(message.topic);
       // expect(message.data).toBe("Hello World");
      //  expect(countMessages).toBe(1);
      }
    }); 

    await subscriber.open();

    await server.sendAll("topic.helloWorld","test");
    await server.sendAll(null,"test2");

    await subscriber.close();
    
    await server.close();
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
  