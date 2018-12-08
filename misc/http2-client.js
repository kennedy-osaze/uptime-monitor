/**
 * Example HTTP2 Client
 * 
 */

//Dependencies
const http2 = require('http2');

//Create client
const client = http2.connect('http://localhost:6000');
client.on('error', (error) => console.error(error));

//Create the request
const req = client.request({
    'path': '/'
});

req.on('response', (headers, flags) => {
    for (name in headers) {
        console.log(`${name}: ${headers[name]}`)
    }
});

//When a message is received, add the pieces of it together until the end is reached
req.setEncoding('utf8');
let data = '';
req.on('data', (chunk) => {
    data += chunk;
});

//When the message ends, log it out
req.on('end', () => {
    console.log(`\n${data}`);
    client.close();
});

//End the request
req.end();