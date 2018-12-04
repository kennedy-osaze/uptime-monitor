/**
 * These are server-related tasks
 * 
 */

//Dependencies
const fs = require('fs');
const url = require('url');
const util = require('util');
const path = require('path');
const http = require('http');
const https = require('https');
const { StringDecoder } = require('string_decoder');

const config = require('./config');
const helpers = require('./helpers');
const handlers = require('./handlers');

const debug = util.debuglog('server');

//Instantiate the server module object
const server = {};

if (config.envName === 'staging') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

//Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

//Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});

//All the server logic for both HTTP and HTTPS
server.unifiedServer = function (req, res) {
    //Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    //Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Get query string as an object
    const queryStringObject = parsedUrl.query;

    //Get the requested HTTP Method
    const method = req.method.toLowerCase();

    //Get request headers as an object
    const headers = req.headers;

    //Get the request payload, if any
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        //Choose the handler this request should go to. If one is not found, use the notFound handler
        let handler = (Object.prototype.hasOwnProperty.call(server.router, trimmedPath)) ? server.router[trimmedPath] : handlers.notFound;

        // if the request is within the public directory, use the public handler instead
        handler = (trimmedPath.indexOf('public/') > -1) ? handlers.public : handler;

        //Construct the data to be sent to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload': helpers.parseJsonToObject(buffer),
        };

        //Route the request to the handler specified in the router
        try {
            handler(data, (statusCode, payload, type = 'json') => {
                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, type);
            });
        } catch (err) {
            debug(err);
            
            let payload = { 'error': 'An unknown error has occurred' };
            server.processHandlerResponse(res, method, trimmedPath, 500, payload, 'json');
        }
    });
};

//Process the response from the handler
server.processHandlerResponse = function (res, method, trimmedPath, statusCode, payload, type) {
    //Use the status code called back by the handler or use a default status code of 200
    statusCode = (typeof (statusCode) === 'number') ? statusCode : 200;

    //Return the response parts that are content-specific
    let payloadString = '';
    const contentType = helpers.getContentType(type);

    res.setHeader('Content-Type', contentType);
    if (type === 'json') {
        payload = (typeof payload === "object") ? payload : {};
        payloadString = JSON.stringify(payload);
    } else {
        payloadString = (typeof payload !== undefined) ? payload : '';
    }

    // payload = (typeof payload === "object") ? payload : {};
    // payloadString = JSON.stringify(payload);

    // if (type === 'json') {
    //     res.setHeader('Content-Type', 'application/json');
    //     payload = (typeof payload === "object") ? payload : {};
    //     payloadString = JSON.stringify(payload);
    // } else if (contentType === 'html') {
    //     res.setHeader('Content-Type', 'text/html');
    //     payloadString = (typeof payload === 'string') ? payload : '';
    // }

    //Return the response parts that are common to all content-types
    res.writeHead(statusCode);
    res.end(payloadString);

    //If the response is 200, print green otherwise print reds
    if (statusCode === 200) {
        debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
    } else {
        debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
    }
};

//Define request Router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/settings': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'log-in': handlers.logIn,
    'dashboard': handlers.dashboard,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checkCreate,
    'checks/edit': handlers.checkEdit,

    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,

    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'example/error': handlers.exampleError,
};

//Init script
server.init = function () {
    //Start the HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `The server is listening on port ${config.httpPort}`);
    });

    //Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m', `The server is listening on port ${config.httpsPort}`);
    });
}

//Export server module
module.exports = server;
