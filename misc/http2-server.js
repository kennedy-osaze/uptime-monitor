/**
 * Example HTTP2 Server
 * 
*/

//Dependencies
const http2 = require('http2');

//Init the server
const server = http2.createServer();

//On a stream, send back hello world html
server.on('stream', (stream, headers) => {
    stream.respond({
        'content-type': 'text/html',
        'status': 200
    });

    stream.on('error', (error) => console.error(error));
    stream.end('<h1>Hello World</h1>');
});

//Listen on port 6000
server.listen(6000);
