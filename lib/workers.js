/**
 * These are workers-related tasks
 * 
 */

//Dependencies
const util = require('util');
const url = require('url');
const http = require('http');
const https = require('https');
const logs = require('./logs');
const helpers = require('./helpers');
const dataStore = require('./data_store');

const debug = util.debuglog('workers');

const workers = {};

//Look up all checks, get their data, send to a validator
workers.gatherAllChecks = function () {
    //Get all the checks
    dataStore.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                //Read in the check data
                dataStore.read('checks', check, (err, checkData) => {
                    if (!err && checkData) {
                        //Pass it to the check validator, and let that function continue or log errors as needed
                        workers.validateCheckData(checkData);
                    } else {
                        debug("Error reading one of the checks' data");
                    }
                });
            });
        } else {
            debug("Error: Could not find any checks to process");
        }
    });
}

//Sanity-check the check data
workers.validateCheckData = function (checkData) {
    checkData = (typeof checkData === 'object' && checkData !== null) ? checkData : {};

    checkData.id = (typeof checkData.id === 'string' && checkData.id.trim().length === 20) ? checkData.id : false;
    checkData.userPhone = (typeof checkData.userPhone === 'string' && checkData.userPhone.trim().length === 11) ? checkData.userPhone : false;
    checkData.protocol = (typeof checkData.protocol === 'string' && ['https', 'http'].indexOf(checkData.protocol) > -1) ? checkData.protocol : false;
    checkData.url = (typeof checkData.url === 'string' && checkData.url.trim().length > 0) ? checkData.url : false;
    checkData.method = (typeof checkData.method === 'string' && ['get', 'post', 'put', 'delete'].indexOf(checkData.method) > -1) ? checkData.method : false;
    checkData.successCodes = (typeof checkData.successCodes === 'object' && checkData.successCodes instanceof Array && checkData.successCodes.length > 0) ? checkData.successCodes : false;
    checkData.timeoutSeconds = (typeof checkData.timeoutSeconds === 'number' && checkData.timeoutSeconds % 1 === 0 && checkData.timeoutSeconds >= 1 && checkData.timeoutSeconds <= 5) ? checkData.timeoutSeconds : false;

    //Set the keys that may not be set (if the workers have never seen these checks before)
    checkData.state = (typeof checkData.state === 'string' && ['up', 'down'].indexOf(checkData.state) > -1) ? checkData.state : 'down';
    checkData.lastChecked = (typeof checkData.lastChecked === 'number' && checkData.lastChecked > 0) ? checkData.lastChecked : false;

    //if all the checks pass, pass the data along to the next step in the process
    if (
        checkData.id &&
        checkData.userPhone &&
        checkData.protocol &&
        checkData.url &&
        checkData.method &&
        checkData.successCodes &&
        checkData.timeoutSeconds
    ) {
        workers.performCheck(checkData);
    } else {
        debug("Error: One of the checks is not properly formatted");
    }
}

//Perform the check, send the checkData and the outcome of the process to the next step in the process
workers.performCheck = function (checkData) {
    //Prepare the initial check outcome
    const checkOutcome = {
        'error': false,
        'responseCode': false
    };

    //Mark that the outcome has not been sent yet
    let outcomeSent = false;

    //Parse the hostname and the path out of the checkData
    const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path //using path and not "pathname because we want the querystring"

    //Construct the request
    const requestDetails = {
        'protocol': checkData.protocol + ':',
        'hostName': hostName,
        'method': checkData.method.toUpperCase(),
        'path': path,
        'timeout': checkData.timeoutSeconds * 1000
    };

    //Instantiate the request object (either using the http or https module)
    const requestProtocol = (checkData.protocol === 'http') ? http : https;
    const request = requestProtocol.request(requestDetails, res => {
      //Grab the status of the sent request
      const status = res.statusCode;

      //Update the outcome and parse the data along
      checkOutcome.responseCode = status;
      if (!outcomeSent) {
        workers.processCheckOutcome(checkData, checkOutcome);
        outcomeSent = true;
      }
    });

    //Bind to the error event so it doesn't get thrown
    request.on('error', (e) => {
        //Update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': e
        }

        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    //Bind to the timeout event
    request.on('timeout', (e) => {
        //Update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        }

        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    //End the request
    request.end();
}

//Process the check outcome, update the check data as needed and trigger an alert to the user when needed
//Special logic for accommodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = function (checkData, checkOutcome) {
    //Decide if the check is considered up or down in the current state
    const state = (!checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1) ? 'up' : 'down';
    
    //Decide if an alert is warranted
    const alertWarranted = (checkData.lastChecked && checkData.state !== state);

    const timeOfCheck = Date.now();
    //Log the outcome
    workers.log(checkData, checkOutcome, state, alertWarranted, timeOfCheck);

    //Update the check data
    const newCheckData = checkData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    dataStore.update('checks', checkData.id, newCheckData, (err) => {
        if (!err) {
            //Send the new check data to the next phase in the process if needed
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                debug('Check outcome has not changed, no alert needed');
            }
        } else {
            debug('Error trying to save updates to one of the checks');
        }
    });
};

//Alert user as to change in their check status
workers.alertUserToStatusChange = function (checkData) {
    const message = `Alert: Your check for ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} is currently ${checkData.state}`;

    helpers.sendTwilioSMS(checkData.userPhone, message, (err) => {
        if (!err) {
            debug('User was alerted to a status change in their check, via SMS: ', message)
        } else {
            debug('Error: Could not send an SMS alert to user who has a status change to their check');
        }
    });
}

workers.log = function (checkData, checkOutcome, state, alertWarranted, timeOfCheck) {
    //Form the log data
    const logData = {
        'check': checkData,
        'outcome': checkOutcome,
        'state': state,
        'alert': alertWarranted,
        'time': timeOfCheck
    };

    //Convert data to a string
    const logStr = JSON.stringify(logData);

    //Determine the name of the log file
    const logFilename = checkData.id;

    //Append the log string to the file
    logs.append(logFilename, logStr, (err) => {
        if (!err) {
            debug('Logging to file succeeded');
        } else {
            debug('Logging to file failed');
        }
    });
};

//Timer to execute the worker-process once per minute
workers.loop = function () {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 5);
};

//Timer to execute the log-rotation process once per day
workers.logRotationLoop = function () {
    setInterval(() => {
        workers.rotateLogs();
    }, 1000 * 24 * 3600);
};

//Rotate (compress the log files)
workers.rotateLogs = function () {
    //List all the (non-compressed) log files
    logs.list(false, (err, logFiles) => {
        if (!err && logFiles && logFiles.length) {
            logFiles.forEach(log => {
                //Compress the data to a different file
                const logId = log.replace('.log', '');
                const newFileId = logId + '-' + Date.now();
                
                logs.compress(logId, newFileId, (err) => {
                    if (!err) {
                        //Truncate the log
                        logs.truncate(logId, (err) => {
                            if (!err) {
                                debug('Success truncating log file');
                            } else {
                                debug('Error truncating log file');
                            }
                        });
                    } else {
                        debug('Error processing one of the log files: ', err);
                    }
                });
            });
        } else {
            debug('Error: Could not find any logs to rotate');
        }
    });
}

workers.init = function () {
    //Send to console in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    //Execute all the checks immediately
    workers.gatherAllChecks();

    //Call the loop so the checks will continue later on
    workers.loop();

    //Compress all the logs immediately
    workers.rotateLogs();

    //Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();
};

//Export workers module
module.exports = workers;
