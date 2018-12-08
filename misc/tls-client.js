/**
 * Example TLS Client
 * 
 * Listen to port 6000 and send the word "hi" to server
*/

//Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

//Define the message to send
const outboundMessage = 'hi';

//Server options
const options = {
    'ca': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')), //only required because we're using a self-signed certificate
};

//Create the client
const client = tls.connect(6000, options, () => {
    //Send the message
    client.write(outboundMessage);
});

//When the server writes back, log what it sends then kill the client
client.on('data', (inboundMessage) => {
    const message = inboundMessage.toString();
    console.log(`I wrote ${outboundMessage} and they said ${message}`);

    client.end();
});


