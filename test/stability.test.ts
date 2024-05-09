 import { assert } from "chai"; 
import { error } from 'winston';
import  {Server,Publisher,Subscriber,Message,serviceStatus} from '../index';
import { LogLevel, systemTopics } from '../src/common/names';


var semaphore:boolean; 
var lastError:Error; 

async function initServer(options={}){

  const server  = await Server.create(options);
  await server.open();
  return server;
}


describe('stability test', () => {
  it('init Server',async  () => {
    let server = await initServer();
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    server.forceClose();//close without exceptions

    server = await initServer({port:7778,localhost:"127.0.0.1"});

    assert.equal(server.data.port,7778);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    server.forceClose();//close without exceptions
  
  });


  


  it.skip('publish into a inexistent server',async  () => {
    const server = await initServer();

    assert.equal(server.publishers.length,0); 

    const publisher = await Publisher.create({
      server:"taulukko://notexist:7777"
    });
  //TODO
  });



  it('reconecting into a publisher need be restarted',async  () => {
    const NUMBER_OF_TESTS = 2;
    let times = 0;
   
    const server = await initServer();

    assert.equal(server.publishers.length,0);

    let publisher = await Publisher.create({ 
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
    await publisher.send("Hello World"); 

 
    assert.ifError( await receiveTheMessage()); 
    
     console.log("debug",1); 
    await subscriber.close(); 
    console.log("debug",2); 
 
    
    assert.equal(server.publishers.length,1,"Need keep 1 after subscriber close");
    assert.equal(server.subscribers.length,0,"Must be one  after the subscriber.open");
    assert.equal( subscriber.data.status,serviceStatus.STOPED,"Must be STOPED after  subscriber.close");

    console.log("debug",3); 

    subscriber = await Subscriber.create({ 
      topics:["topic.helloWorld","unexistentTopic" ], defaultLogLevel:LogLevel.ERROR
    });
    console.log("debug",4); 

    await subscriber.open();
    console.log("debug",5); 

    assert.equal(server.publishers.length,1,"Must be zero after the publisher.close");
    assert.equal(server.subscribers.length,1,"Must be one  after the subscriber.open");
    assert.equal(publisher.data.status,serviceStatus.ONLINE,"Must be ONLINE  after  publisher.open");

    console.log("debug",6); 

 
       
    cleanupGlobals();

    console.log("debug",7); 

    await publisher.send("Hello World"); 

    console.log("debug",8); 


    assert.ifError( await receiveTheMessage());

    console.log("debug",9); 


    assert.equal(server.subscribers.length,0,"Must be zero after the subscriber.close");
    assert.equal(publisher.data.status,serviceStatus.STOPED,"Must be STOPED after  publisher.close");

    console.log("debug",10); 


  }); 
  
  it.skip('Publisher with a retro configuration',async  () => {
    const server = await initServer();

    assert.equal(server.publishers.length,0); 

    const publisher = await Publisher.create({
      server:"taulukko://notexist:7777",
      retro:true
    }); 
    //TODO if the subscriber disconnect, when he enter, he receive all before your last conection
    
  }); 
  
  
  
  it.skip('Publisher disconnect and connect event',async  () => {
    const server = await initServer();

    //expect(server.publishers.length).toBe(0);

    const publisher = await Publisher.create({
      server:"taulukko://notexist:7777",
      retro:true
    }); 
    //TODO  
    
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
