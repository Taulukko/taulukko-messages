import  {Server,Publisher,Subscriber,Message} from '../index';
import { assert } from "chai"; 

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



  it.skip('reconecting into a publisher with problems',async  () => {
    const server = await initServer();

    assert.equal(server.publishers.length,0); 

    const publisher = await Publisher.create({
      server:"taulukko://notexist:7777"
    });
  //TODO
  }); 

  it.skip('reconecting with a subscriber with problems',async  () => {
    const server = await initServer();

    assert.equal(server.publishers.length,0); 

    const publisher = await Publisher.create({
      server:"taulukko://notexist:7777"
    });
  //TODO
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
