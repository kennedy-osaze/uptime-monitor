/**
 * Example UDP Client
 * 
 * Sending a message to a UDP server on port 6000
*/

const dgram = require('dgram');

const client = dgram.createSocket('udp4');

//Define a message and pull it into a buffer
const message = 'This is a message';
const messageBuffer = Buffer.from(message);

//Send off the message
client.send(messageBuffer, 6000, 'localhost', (err) => {
    if (err) {
        console.error(err);
        client.close();
    }
});
