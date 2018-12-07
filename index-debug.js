/**
 * Entry point for the api
 */

//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/example_debugging_problem');

//Declare the app
const app = {};

app.init = function () {
    //Start the server
    debugger;
    server.init();
    debugger;

    //Start the workers
    workers.init();
    debugger;

    //Start the CLI, but make sure it start last
    setTimeout(() => {
        cli.init();
    }, 50)
    debugger;

    let foo = 1;
    console.log('Just declared and initialized foo');
    debugger;

    foo++;
    console.log('Just incremented foo');
    debugger;

    foo = foo * foo;
    console.log('Just squared foo');
    debugger;

    foo = foo.toString();
    console.log('Just converted foo to string');
    debugger;

    //Call init method that will throw error
    exampleDebuggingProblem.init();
    debugger;
}

//Execute
app.init();

//Export the app
module.exports = app;
