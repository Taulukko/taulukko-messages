
import  {Server,Publisher,Subscriber,Message,proccessStatus} from '../index';
import { LogLevel, serviceStatus } from '../src/server/names';

import * as assert from 'assert';

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

    assert.equal(server.subscribers.length,0,"Publishers need be equal 0");  

    await publisher.send("topic.helloWorld","Hello World");

    await publisher.close();

    assert.equal(server.publishers.length,1,"Publishers need be equal 0");
   
   
    await server.close(); 
  }); 

  

  it.only('Open subscriber and receiving a string message',async  () => {
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

    subscriber.on(async (message:Message)=>{
      assert.equal(message.data.topic,"topic.helloWorld","Topic need be the same topic in the publisher.send");
      assert.equal(message.data, "Hello World","Message need be Hello World");
      await subscriber.close();
      assert.equal(server.subscribers.length,0,"");
      await publisher.close();

      assert.equal(server.subscribers.length,0,"");
      await server.close();
    });
 
    await publisher.send("Hello World"); 
  });
  
});
 

  