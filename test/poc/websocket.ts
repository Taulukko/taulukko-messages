 

import * as http from "http";
import * as socketIo from "socket.io";
import * as clientSocketIO from "socket.io-client";

 

const server = http.createServer((req, res) => {
    res.end('Hello World from server');
});

const io = new socketIo.Server(server);

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
    });

    socket.on('helloFromClient', (text) => {
    });
    
    socket.emit("helloFromServer","world");
});

const PORT = 3000;
server.listen(PORT, () => {
});
 

const clientio =  clientSocketIO.connect("http://localhost:3000");

clientio.on('connect', () => {
    
    // Envia uma mensagem para o servidor
    clientio.emit('helloFromClient', 'Olá do cliente Socket.IO');
    
    // Recebe uma mensagem do servidor
    clientio.on('helloFromServer', (msg) => {
    });
 
});

   
   