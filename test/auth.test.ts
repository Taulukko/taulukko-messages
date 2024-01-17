import { SimpleAuth } from '../src/auth/simple-auth';
import  {Server,Publisher, Subscriber} from '../index';
import { assert } from "chai"; 
import { AuthProvider } from '../src/auth/auth-provider';
import { ClientOnLineDTO } from 'src/server/server-protocols-dtos';
import { WebSocket } from 'src/ws';

async function initServer(options={}){

  const server:Server  = await Server.create(options);
  await server.open();
  return server;
}
 


describe.skip('auth test - Simple Auth', () => {
  it('init Server with simple Auth',async  () => {
    const server:Server = await initServer({auth:SimpleAuth.create({password:"test123"})});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    server.forceClose();//close without exceptions
   }
  );

  it('start Publisher with a wrong password',async  () => {
    const server:Server = await initServer({auth:SimpleAuth.create({password:"test123"})});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const publisher:Publisher = Publisher.create({auth:SimpleAuth.create({password:"wrongPassword"})});

    assert.throws(publisher.open);

    server.forceClose();//close without exceptions
   }
  );

  it('start Subscriber with a wrong password',async  () => {
    const server:Server = await initServer({auth:SimpleAuth.create({password:"test123"})});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const subscriber:Subscriber = Subscriber.create({auth:SimpleAuth.create({password:"wrongPassword"})});

    assert.throws(subscriber.open);

    server.forceClose();//close without exceptions
   }
  );

  it('start Publisher with a correct password',async  () => {
    const server:Server = await initServer({auth:SimpleAuth.create({password:"test123"})});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const publisher:Publisher = Publisher.create({auth:SimpleAuth.create({password:"test123"})});

    assert.doesNotThrow(publisher.open);

    server.forceClose();//close without exceptions
   }
  );

  it('start Subscriber with a correct password',async  () => {
    const server:Server = await initServer({auth:SimpleAuth.create({password:"test123"})});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const subscriber:Subscriber = Subscriber.create({auth:SimpleAuth.create({password:"test123"})});

    assert.doesNotThrow(subscriber.open);

    server.forceClose();//close without exceptions
   }
  );

});

class CustomProviderTest implements AuthProvider{
  validateOnClienteOnline(socket: WebSocket, data: ClientOnLineDTO): boolean {
    throw new Error('Method not implemented.');
  }

}

describe.skip('auth test - Custom Auth', () => {
  it('init Server with custom Auth',async  () => {
    const server:Server = await initServer({auth:{}});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    server.forceClose();//close without exceptions
   }
  );

  it('start Publisher with a wrong password',async  () => {
    const server:Server = await initServer({auth:new CustomProviderTest()});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const publisher:Publisher = Publisher.create({auth:new CustomProviderTest()});

    assert.throws(publisher.open);

    server.forceClose();//close without exceptions
   }
  );

  it('start Subscriber with a wrong password',async  () => {
    const server:Server = await initServer({auth:new CustomProviderTest()});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const subscriber:Subscriber = Subscriber.create({auth:new CustomProviderTest()});

    assert.throws(subscriber.open);

    server.forceClose();//close without exceptions
   }
  );

  it('start Publisher with a correct password',async  () => {
    const server:Server = await initServer({auth:new CustomProviderTest()});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const publisher:Publisher = Publisher.create({auth:new CustomProviderTest()});

    assert.doesNotThrow(publisher.open);

    server.forceClose();//close without exceptions
   }
  );

  it('start Subscriber with a correct password',async  () => {
    const server:Server = await initServer({auth:new CustomProviderTest()});
    
    assert.equal(server.data.port,7777);
    assert.isTrue(server.data.online);
    assert.equal(server.data.status,"ONLINE");

    const subscriber:Subscriber = Subscriber.create({auth:new CustomProviderTest()});

    assert.doesNotThrow(subscriber.open);

    server.forceClose();//close without exceptions
   }
  );

});
