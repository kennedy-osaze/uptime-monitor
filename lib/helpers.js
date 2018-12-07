/**
 * Helpers for various tasks
 * 
*/

//Dependencies
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const config = require('./config');

//Container for all the helpers
const helpers = {};

//Get a number
helpers.getANumber = function () {
    return 1;
}

//Create a SHA256 Hash
helpers.hash = function (str) {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

//Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

//Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function (stringLength) {
    stringLength = (typeof stringLength === 'number' && stringLength > 0) ? stringLength : false;
    
    if (stringLength) {
        //Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';

        //Start the final string
        var str = '';
        for (let i = 0; i < stringLength; i++) {
            //Get a random character from the possibleCharacters string
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            //Append this character to the final character
            str += randomCharacter;
        }

        return str;
    } else {
        return false;
    }
};

helpers.sendTwilioSMS = function (phone, message, callback) {
    //Validate parameters
    phone = (typeof phone === 'string' && phone.trim().length === 11) ? phone : false;
    message = (typeof message === 'string' && message.trim().length > 0 && message.trim().length <= 10) ? message : false;

    if (phone && message) {
        //Configure the request payload
        phone = (phone.startsWith('0')) ? phone.slice(1) : phone;
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+234' + phone, 
            'Body': message,
        };

        const payloadStr = querystring.stringify(payload);

        //Configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
            'auth': `${config.twilio.accountSid}:${config.twilio.authToken}`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payloadStr)
            }
        };

        //Instantiate the request object
        const request = https.request(requestDetails, (res) => {
            //Grab the status of the sent request
            const status = res.statusCode;

            //Callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback('Status code returned was: ' + status);
            }
        });

        //Bind to the error event so it doesn't get thrown
        request.on('error', (e) => {
            callback(e);
        });

        //Add the payload
        request.write(payloadStr);

        //End the request
        request.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

helpers.getView = function (view, data,  callback) {
    view = (typeof view === 'string' && view.length) ? view : false;
    data = (typeof data === 'object' && data !== null) ? data : {};

    if (view) {
        const viewFile = path.join(__dirname, '/../views', `${view}.html`);
        console.log(viewFile);
        fs.readFile(viewFile, 'utf8', (err, str) => {
            if (!err && str && str.length) {
                str = helpers.interpolate(str, data);
                callback(false, str);
            } else {
                callback('No view could be found');
            }
        });
    } else {
        callback('A valid view name was not specified');
    }
};

//Add the universal header and footer to a string, and pass the provided object to the header and footer for interpolation
helpers.addTemplateLayouts = function (str, data, callback) {
    str = (typeof str === 'string' && str.length) ? str : '';
    data = (typeof data === 'object' && data !== null) ? data : {};

    //Get the header
    helpers.getView('layouts/header', data, function (err, headerStr) {
        if (!err && headerStr) {
            //Get the footer
            helpers.getView('layouts/footer', data, function (err, footerStr) {
                if (!err && footerStr) {
                    
                    const completeStr = headerStr + str + footerStr;
                    callback(false, completeStr);
                } else {
                    callback('Could not find the footer layout');
                }
            });
        } else {
            callback('Could not find the header layout');
        }
    });
};

//Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = function (str, data) {
    str = (typeof str === 'string' && str.length) ? str : '';
    data = (typeof data === 'object' && data !== null) ? data : {};

    //Add the templateGlobals to the data object, prepending their key name with "global"
    for (var key in config.templateGlobals) {
        if (Object.hasOwnProperty.call(config.templateGlobals, key)) {
            data[`global.${key}`] = config.templateGlobals[key];
        }
    }

    //For each key in the data object, insert its value into the string at the corresponding placeholder
    for (var key in data) {
        if (Object.hasOwnProperty.call(data, key) && (typeof data[key] === 'string')) {
            const find = `{${key}}`;
            const replace = data[key];
            const regex = RegExp(find, 'g');
            str = str.replace(regex, replace);
        }
    }

    return str;
}

//Get the content of a public (static) asset
helpers.getStaticAsset = function (filename, callback) {
    filename = (typeof filename === 'string' && filename.length) ? filename : false;

    if (filename) {
        const publicFile = path.join(__dirname, '/../public', filename);

        fs.readFile(publicFile, (err, data) => {
            if (!err && data) {
                callback(false, data);
            } else {
                callback('No file could be found');
            }
        });
    } else {
        callback('A valid filename was not specified');
    }
};

helpers.getContentType = function (extension = '') {
    if (typeof extension !== 'string') {
        return '';
    }

    extension = extension.toLowerCase();

    const contentTypes = {
        
        'text/html': 'html',
        'text/css': 'css',
        'text/plain': 'plain',
        'image/jpeg': ['jpeg', 'jpg', 'jpe'],
        'image/x-icon': 'ico',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'application/javascript': 'js',
        'application/vnd.ms-fontobject': 'eot',
        'application/json': 'json',
        'application/x-font-ttf': 'ttf',
        'application/x-font-woff': 'woff',
        'application/x-font-woff2': 'woff2',
    };

    for (var type in contentTypes) {
        if (extension === contentTypes[type]) {
            return type;
        } else if (Array.isArray(contentTypes[type]) && contentTypes[type].includes(extension)) {
            return type;
        }
    }

    return '';
};

//Export Container
module.exports = helpers;
