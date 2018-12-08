/**
 * Example TCP (Net) Server
 * 
 * Listen to port 6000 and send the word "hello" to client 
*/

//Dependencies
const net = require('net');

const server = net.createServer((connection) => {
    //Send the word "hello"
    const outboundMessage = 'hello';
    connection.write(outboundMessage);

    //When the client writes something, log it out
    connection.on('data', (inboundMessage) => {
        const message = inboundMessage.toString();
        console.log(`I wrote ${outboundMessage} and they said ${message}`);
    });
});

server.listen(6000);
