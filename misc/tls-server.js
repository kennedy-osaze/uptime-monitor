/**
 * Example TLS Server
 * 
 * Listen to port 6000 and send the word "hello" to client 
*/

//Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

//Server options
const options = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};

const server = tls.createServer(options, (connection) => {
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
