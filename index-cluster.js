/**
 * Entry point for the api
 */

//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

//Declare the app
const app = {};

app.init = function (callback) {
    //If we are on the master thread, start the workers and CLI
    if (cluster.isMaster) {
        //Start the workers
        workers.init();

        //Start the CLI, but make sure it start last
        setTimeout(() => {
            cli.init();

            callback();
        }, 50);

        //Fork the process
        const numOfCPU = os.cpus().length;console.log(numOfCPU);
        for (let i = 0; i < numOfCPU; i++) {
            cluster.fork();
        }
    } else {
        //If we are not on the master thread, start the http server
        server.init();
    }
}

//Self-invoking only if required directly
if (require.main === module) {
    app.init(() => {});
}

//Export the app
module.exports = app;
