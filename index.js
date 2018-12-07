/**
 * Entry point for the api
 */

//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

//Declare the app
const app = {};

app.init = function (callback) {
    //Start the server
    server.init();

    //Start the workers
    workers.init();

    //Start the CLI, but make sure it start last
    setTimeout(() => {
        cli.init();

        callback();
    }, 50)
}

//Self-invoking only if required directly
if (require.main === module) {
    app.init(() => {});
}

//Export the app
module.exports = app;
