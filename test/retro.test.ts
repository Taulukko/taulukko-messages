import  {Server,Publisher,Subscriber,Message} from '../index';

async function initServer(options={}){

  const server  = await Server.create(options);
  await server.open();
  return server;
}

 