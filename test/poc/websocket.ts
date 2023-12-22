 

import * as http from "http";
import * as socketIo from "socket.io";
import * as clientSocketIO from "socket.io-client";

 

const server = http.createServer((req, res) => {
    res.end('Hello World from server');
});

const io = new socketIo.Server(server);

io.on('connection', (socket) => {
    console.log('Um usuário se conectou');

    socket.on('disconnect', () => {
    console.log('Um usuário se desconectou');
    });

    socket.emit('hello', 'Hello World from Socket.IO');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


const clientio =  clientSocketIO.connect("http://localhost:3000");

clientio.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');
    
    // Envia uma mensagem para o servidor
    clientio.emit('helloFromClient', 'Olá do cliente Socket.IO');
    
    // Recebe uma mensagem do servidor
    clientio.on('helloFromServer', (msg) => {
        console.log(msg);
    });
    });

