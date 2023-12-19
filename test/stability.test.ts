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


 


test('publish into a inexistent server',async  () => {
  const server = await initServer();

  expect(server.publishers.length).toBe(0);

  const publisher = await Publisher.create({
    server:"taulukko://notexist:7777"
  });
 //TODO
});




test('reconecting into a publisher with problems',async  () => {
  const server = await initServer();

  expect(server.publishers.length).toBe(0);

  const publisher = await Publisher.create({
    server:"taulukko://notexist:7777"
  });
 //TODO
}); 

test('reconecting with a subscriber with problems',async  () => {
  const server = await initServer();

  expect(server.publishers.length).toBe(0);

  const publisher = await Publisher.create({
    server:"taulukko://notexist:7777"
  });
 //TODO
}); 
 
test('Publisher with a retro configuration',async  () => {
  const server = await initServer();

  expect(server.publishers.length).toBe(0);

  const publisher = await Publisher.create({
    server:"taulukko://notexist:7777",
    retro:true
  }); 
  //TODO if the subscriber disconnect, when he enter, he receive all before your last conection
  
}); 
 
 
 
test('Publisher disconnect and connect event',async  () => {
  const server = await initServer();

  expect(server.publishers.length).toBe(0);

  const publisher = await Publisher.create({
    server:"taulukko://notexist:7777",
    retro:true
  }); 
  //TODO  
  
});  