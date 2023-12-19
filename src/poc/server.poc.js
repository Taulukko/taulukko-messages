const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io');
var ioc = require( 'socket.io-client' );

const ioServer = io(server);



ioServer.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
    socket.on('teste', (a,b,c) => {
        console.log('teste2',a,b,c);
        socket.emit("teste2","back");
    });
    console.log(socket.handshake.headers.id);
    if(socket.handshake.headers.id)
    {
        sendWelcome=true;
        ioServer.emit("teste2","broadcast");

    }

});


 
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});



let socket = ioc.connect('http://localhost:3000');
// Handle the connection and disconnection events
socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

socket.on('teste2', (a) => {
    console.log('event teste2a:',a);
});

socket.emit("teste",1);




socket = ioc.connect('http://localhost:3000',{
    extraHeaders: {
      id: "1234"
    }
  });
 
socket.on('teste2', (a) => {
    console.log('event teste2b:',a);
});
 