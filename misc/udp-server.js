/**
 * Example UDP Server
 * 
 * Creating a UDP datagram server listening on 6000
*/

//Dependencies
const dgram = require('dgram');

//Create a server
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.log(`server error: \n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    //Do something with an incoming message or do something with the sender
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(6000);
