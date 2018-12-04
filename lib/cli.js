/**
 * These are CLI-related Tasks
 * 
 */

const readline = require('readline');
const util = require('util');
const Events = require('events');
const os = require('os');
const v8 = require('v8');
const data_store = require('./data_store');
const logs = require('./logs');
const helpers = require('./helpers');

class EventEmitter extends Events {};

const debug = util.debuglog('cli');
const eventEmitter = new EventEmitter();

//Instantiate the CLI module object
const cli = {};

//All commands that this CLI support
cli.commands = {
    'exit': 'Kill the CLI and the rest of the application',
    'man': 'Show this help page',
    'help' : 'Alias of the "man" command',
    'stats' : 'Get statistics on the underlying operating system and resource utilization',
    'list users' : 'Show a list of all the registered users of the system',
    'more user info --{userId}': 'Show details of a specific user',
    'list checks --up --down': 'Show a list of all active checks in the system, including their states; --up and --down flags are optional',
    'more check info --{checkId}' : 'Show details of a specified check',
    'list logs' : 'Show the list of all log files available to be read (compressed only)',
    'more log info --{logId}': 'Show details of a specified log file',
};

//Input Responder Object
cli.responders = {};

//Input Handlers
eventEmitter.on('man', (str) => {
    cli.responders.help();
});

eventEmitter.on('help', (str) => {
    cli.responders.help();
});

eventEmitter.on('exit', (str) => {
    cli.responders.exit();
});

eventEmitter.on('stats', (str) => {
    cli.responders.stats();
});

eventEmitter.on('list users', (str) => {
    cli.responders.listUsers();
});

eventEmitter.on('more user info', (str) => {
    cli.responders.moreUserInfo(str);
});

eventEmitter.on('list checks', (str) => {
    cli.responders.listChecks(str);
});

eventEmitter.on('more check info', (str) => {
    cli.responders.moreCheckInfo(str);
});

eventEmitter.on('list logs', (str) => {
    cli.responders.listLogs();
});

eventEmitter.on('more log info', (str) => {
    cli.responders.moreLogInfo(str);
});

//Help
cli.responders.help = function () {
    //Show a header for the help page that is as wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    //Show each command, followed by their description in white and yellow respectively
    for (const [command, description] of Object.entries(cli.commands)) {
        let line = `      \x1b[33m${command}      \x1b[0m`;
        const padding = 60 - line.length;

        for (let i = 0; i < padding; i++) {
            line += ' ';
        }
        
        line += description;
        console.log(line);
        cli.verticalSpace();
    }

    cli.verticalSpace(1);

    //End with another horizontal line
    cli.horizontalLine();
};

//Create a horizontal line across the screen
cli.horizontalLine = function () {
    //Get the available screen size
    const width = process.stdout.columns;
    
    let line = '';

    for (let i; i < width; i++) {
        line += '-';
    }

    console.log(line);
};

//Create a centered text on the screen
cli.centered = function (str) {
    str = (typeof str === 'string' && str.trim().length > 0) ? str.trim() : '';
    
    //Get the available screen size
    const width = process.stdout.columns;
    
    //Calculate the left-padding there should be
    const leftPadding = Math.floor((width - str.length) / 2);

    //Put in left-padding spaces before the string itself
    let line = '';

    for (let i = 0; i < leftPadding; i++) {
        line += ' ';
    }

    line += str;
    console.log(line);
};

cli.verticalSpace = function (lines) {
    lines = (typeof lines === 'number' && lines > 0) ? lines : 1;

    for (let i = 0; i < lines; i++) {
        console.log('');
    }
};

//Exit
cli.responders.exit = function () {
    process.exit(0);
};

//Stats
cli.responders.stats = function () {
    //Compile an object of stats
    const stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime': `${os.uptime()} seconds`,
    };

    //Create a header for the stats
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    //Log out each stat
    for (const [key, value] of Object.entries(stats)) {
        let line = `      \x1b[33m${key}      \x1b[0m`;
        const padding = 60 - line.length;

        for (let i = 0; i < padding; i++) {
            line += ' ';
        }

        line += value;
        console.log(line);
        cli.verticalSpace();
    }

    cli.verticalSpace(1);

    //End with another horizontal line
    cli.horizontalLine();
};

//List users
cli.responders.listUsers = function () {
    data_store.list('users', (err, userIds) => {
        if (!err && userIds.length > 0) {
            cli.verticalSpace();
            userIds.forEach((id) => {
                data_store.read('users', id, (err, user) => {
                    if (!err && user !== undefined) {
                        const noOfChecks = (Array.isArray(user.checks) && user.checks.length > 0) ? user.checks.length : 0;
                        const line = `Name: ${user.firstName} ${user.lastName} Phone: ${user.phone} Checks: ${noOfChecks}`;
                        console.log(line);
                        cli.verticalSpace();
                    }
                });
            });
        }
    });
};

//More user info
cli.responders.moreUserInfo = function (str) {
    //Get the id from the string provided
    const arr = str.split('--');
    const userId = (typeof arr[1] === 'string' && arr[1].trim().length > 0) ? arr[1].trim() : false;

    if (userId) {
        data_store.read('users', userId, (err, user) => {
            if (!err && user) {
                //Remove the hashed password
                delete user.password;

                //Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(user, { 'colors': true });
                cli.verticalSpace();
            }
        });
    }
};

//List checks
cli.responders.listChecks = function (str) {
    data_store.list('checks', (err, checkIds) => {
        if (!err && checkIds !== undefined && checkIds.length > 0) {
            cli.verticalSpace();
            checkIds.forEach((checkId) => {
                data_store.read('checks', checkId, (err, check) => {
                    if (!err && check !== undefined) {
                        const lowerString = str.toLowerCase();

                        //Get the state of the check, default to down
                        const state = (typeof check.state === 'string') ? check.state : 'down';

                        //Get the state of the check, default to unknown
                        const stateOrUnknown = (typeof check.state === 'string') ? check.state : 'unknown';

                        //If the user has specified the state, or hasn't specified any state, include the current check accordingly
                        
                        if (
                            (lowerString.indexOf(`--${state}`) > -1) ||
                            ((lowerString.indexOf('--down') == -1) && (lowerString.indexOf('--up') == -1))
                        ) {
                            const line = `ID: ${check.id} ${check.method.toUpperCase()} ${check.protocol}://${check.url} State: ${stateOrUnknown}`
                            console.log(line);
                            cli.verticalSpace();
                        }
                    }
                });
            });
        }
    });
};

//More check info
cli.responders.moreCheckInfo = function (str) {
    //Get the id from the string provided
    const arr = str.split('--');
    const checkId = (typeof arr[1] === 'string' && arr[1].trim().length > 0) ? arr[1].trim() : false;

    if (checkId) {
        data_store.read('checks', checkId, (err, check) => {
            if (!err && check) {

                //Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(check, { 'colors': true });
                cli.verticalSpace();
            }
        });
    }
};

//List logs
cli.responders.listLogs = function () {
    logs.list(true, (err, logFiles) => {
        if (!err && logFiles !== undefined && logFiles.length > 0) {
            cli.verticalSpace();
            logFiles.forEach((filename) => {
                if (filename.indexOf('-') > -1) {
                    console.log(filename);
                    cli.verticalSpace();
                }
            });
        }
    })
};

//More log info
cli.responders.moreLogInfo = function (str) {
    //Get the logFilename from the string provided
    const arr = str.split('--');
    const logFileName = (typeof arr[1] === 'string' && arr[1].trim().length > 0) ? arr[1].trim() : false;

    if (logFileName !== undefined) {
        cli.verticalSpace();
        //Decompress the log 
        logs.decompress(logFileName, (err, logString) => {
            if (!err && logString !== undefined) {
                //Split into lines
                const arr = logString.split('\n');
                arr.forEach((jsonString) => {
                    var logObject = helpers.parseJsonToObject(jsonString);
                    
                    if (logObject !== undefined && JSON.stringify(logObject) !== '{}') {
                        console.dir(logObject, { 'colors': true });
                        cli.verticalSpace();
                    }
                });
            }
        });
    }
};

//Input processor
cli.processInput = function (str) {
    str = (typeof str === 'string' && str.trim().length > 0) ? str.trim() : false;

    //Only process the input if the user actually wrote something, otherwise ignore
    if (str) {
        //Go through the possible inputs and emit an event when a match is found;
        let matchFound = false;

        for (command of Object.keys(cli.commands)) {
            command = command.replace(/--.*/g, '').trim();
            
            if (str.toLowerCase().indexOf(command) > -1) {
                matchFound = true;

                //Match an event matching the unique input, and include the full string given by the user
                eventEmitter.emit(command, str);
                break;
            }
        }

        //If no match found, tell the user to try again
        if (!matchFound) {
            console.log('Sorry, try again');
        }
    }
};

cli.init = function () {
    //Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

    //Start the interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    });

    //Create an initial prompt
    rl.prompt();

    //Handle each line of input separate
    rl.on('line', (input) => {
        //Send to the input processor
        cli.processInput(input);

        //Reinitialize the prompt afterwards
        rl.prompt();
    });

    //If the user stops the CLI, kill the associated process
    rl.on('close', () => {
        process.exit(0);
    })

};

module.exports = cli;
