/**
 * Example TCP (Net) Client
 * 
 * Listen to port 6000 and send the word "hi" to server
*/

//Dependencies
const net = require('net');

//Define the message to send
const outboundMessage = 'hi';

//Create the client
const client = net.createConnection({ port: 6000 }, () => {
    //Send the message
    client.write(outboundMessage);
});

//When the server writes back, log what it sends then kill the client
client.on('data', (inboundMessage) => {
    const message = inboundMessage.toString();
    console.log(`I wrote ${outboundMessage} and they said ${message}`);

    client.end();
});


