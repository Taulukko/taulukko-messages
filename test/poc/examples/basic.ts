import  {Server,Publisher,Subscriber,Message} from '../../../index'; 
(async ()=>{
    const server  =  Server.create();
    await server.open();


    const publisher = Publisher.create({ 
        topics:["topic.helloWorld"]
      });
    
    const subscriber1 = await Subscriber.create({ 
    topics:["topic.helloWorld"]
    });

    const subscriber2 = await Subscriber.create({ 
        topics:["topic.other"]
        });

        
    await publisher.open();
    await subscriber1.open();
    await subscriber2.open();

    
    await subscriber1.on(async (message:Message)=>{
        console.log("subscriber1:",message);       
    });
    
    await subscriber2.on(async (message:Message)=>{
        console.log("subscriber2:",message);       
    });

    await publisher.send("Hello World"); 

    await publisher.close();
    await subscriber1.close();
    await subscriber2.close();
    await server.close();
})();


     
     