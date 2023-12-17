import  {Server,Publisher,Subscriber,Message} from '../index';

async function initServer(options={}){

  const server  = await Server.create(options);
  await server.open();
  return server;
}


test('init Server',async  () => {
  let server = await initServer();

  expect(server.data().port).toBe(7777);
  expect(server.data().host).toBe("localhost");
  expect(server.data().online).toBe(true);
  expect(server.data().status).toBe("ONLINE");

  server.forceClose();//close without exceptions

  server = await initServer({port:7778,localhost:"127.0.0.1"});

  expect(server.data().port).toBe(7778);
  expect(server.data().host).toBe("127.0.0.1");
  expect(server.data().online).toBe(true);
  expect(server.data().status).toBe("ONLINE");

  server.forceClose();//close without exceptions
 
});



test('publish a string message',async  () => {
  const server = await initServer();

  expect(server.publishers.length).toBe(0);

  const publisher = await Publisher.create({
    server:"taulukko://localhost:7777"
  });

  expect(server.publishers.length).toBe(1);
  expect(server.publishers[0].status).toBe("CREATED");

  await publisher.open();

  expect(server.publishers[0].status).toBe("ONLINE");

  expect(server.publishers.length).toBe(1);

  expect(server.subscribers.length).toBe(0);

  let countMessages = 0;

  const subscriber = await Subscriber.create({
    server:"taulukko://localhost:7777",
    topics:["topic.helloWorld","unexistentTopic"],
    handler:(message:Message)=>{
      countMessages++;
      expect( message.topic).toBe("topic.helloWorld");
      expect(message.data).toBe("Hello World");
      expect(countMessages).toBe(1);
    }
  });

  expect(server.subscribers.length).toBe(1);

  expect(server.subscribers[0].status).toBe("CREATED");

  await subscriber.open();

  expect(server.subscribers[0].status).toBe("ONLINE");

  publisher.publish("topic.helloWorld","Hello World");

  subscriber.close();

  publisher.close();
  
  server.close();
});
 