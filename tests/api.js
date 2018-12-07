/**
 * API Tests
 * 
 */

//Dependencies
const assert = require('assert');
const http = require('http');

const app = require('../index.js');
const config = require('../lib/config');

const api = {};

//Helpers
const helpers = {};
helpers.makeGetRequest = function (path, callback) {
    //Configure the request details
    const requestDetails = {
        'protocol': 'http:',
        'hostname': 'localhost',
        'port': config.httpPort,
        'method': 'GET',
        'path': path,
        'headers': {
            'Content-Type': 'application/json'
        },
    };

    const request = http.request(requestDetails, (response) => {
        callback(response);
    });

    request.end();
};

//The main init function should be to run without throwing
api['api init should start without throwing'] = function (done) {
    assert.doesNotThrow(() => {
        app.init((err) => {
            done();
        });
    });
}

//Make a request to ping
api['/ping should respond to GET with 200'] = function (done) {
    helpers.makeGetRequest('/ping', (res) => {
        assert.equal(res.statusCode, 200);
        done();
    });
}

//Make a request to users
api['/users should respond to GET with 400'] = function (done) {
    helpers.makeGetRequest('/users', (res) => {
        assert.equal(res.statusCode, 400);
        done();
    });
}

//Make a request to a random path
api['A random path should respond to GET with 404'] = function (done) {
    helpers.makeGetRequest('/path/does/not/exist', (res) => {
        assert.equal(res.statusCode, 404);
        done();
    });
}

module.exports = api;