/**
 * Request Handlers
 */

//Dependencies
const config = require('./config');
const helpers = require('./helpers');
const dataStore = require('./data_store');

//Define Route Handlers
const handlers = {};

/**
 * HTML Handlers
 * 
 */

handlers.index = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free simple uptime monitoring of all sites for HTTP/HTTPS sites of all kinds. When your site goes down, we will send you a text to let you know',
            'body.class': 'index',
        };

        //Read in a template as a string
        helpers.getView('index', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

//favicon
handlers.favicon = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Read in the favicon data
        helpers.getStaticAsset('favicon.ico', (err, data) => {
            if (!err && data) {
                callback(200, undefined, 'favicon')
            } else {
                callback(500)
            }
        });
    } else {
        callback(405);
    }
};

handlers.public = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Get the filename being requested
        const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if (trimmedAssetName.length) {
            helpers.getStaticAsset(trimmedAssetName, (err, data) => {
                if (!err && data) {
                    // Determine the content type (default to plain text)
                    const extPosInAsset = trimmedAssetName.lastIndexOf('.');
                    const extOfAsset = (extPosInAsset > -1) ? trimmedAssetName.substr(extPosInAsset + 1) : false;
                    const contentType = extOfAsset || 'plain';

                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        }
    } else {
        callback(405);
    }
};

handlers.accountCreate = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Create Account',
            'head.description': 'Sign up is easy and only takes a few seconds',
            'body.class': 'create-account',
        };

        //Read in a template as a string
        helpers.getView('account/create', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

handlers.logIn = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Log into your account',
            'head.description': 'Please into your phone number and password to access your account',
            'body.class': 'account-login',
        };

        //Read in a template as a string
        helpers.getView('account/login', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
}

handlers.dashboard = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Welcome to your Dashboard',
            'head.description': '',
            'body.class': 'dashboard',
        };

        //Read in a template as a string
        helpers.getView('dashboard', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

//Edit your account settings
handlers.accountEdit = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Account Settings',
            'head.description': 'On this page, you can edit your account settings',
            'body.class': 'account-edit',
        };

        //Read in a template as a string
        helpers.getView('account/settings', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

handlers.accountDeleted = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Account Deleted',
            'head.description': 'Your account has been deleted',
            'body.class': 'account-deleted',
        };

        //Read in a template as a string
        helpers.getView('account/deleted', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

handlers.checkCreate = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Create a New Check',
            'head.description': 'Create a New Check',
            'body.class': 'checks-create',
        };

        //Read in a template as a string
        helpers.getView('checks/create', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

handlers.checksList = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Checks List',
            'head.description': 'The list of all checks created by me',
            'body.class': 'checks-index',
        };

        //Read in a template as a string
        helpers.getView('checks/index', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

handlers.checkEdit = function (data, callback) {
    //Reject any request that isn't get
    if (data.method === 'get') {
        //Prepare data for interpolation
        const data = {
            'head.title': 'Check Details',
            'head.description': 'Edit a Check',
            'body.class': 'check-edit',
        };

        //Read in a template as a string
        helpers.getView('checks/edit', data, (err, str) => {
            if (!err && str) {
                helpers.addTemplateLayouts(str, data, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

/**
 * JSON API Handlers
 * 
 */

//ExampleError Handler
handlers.exampleError = function (data, callback) {
    const err = new Error('This is an example error');
    throw err;
}

//Tokens handler
handlers.tokens = function (data, callback) {
    const allowableMethods = ['get', 'post', 'put', 'delete'];
    if (allowableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        //Method allowed
        callback(405);
    }
};

//Container for all the tokens methods
handlers._tokens = {};

//Tokens - post
//Required fields: phone and password
//Optional fields: none
handlers._tokens.post = function (data, callback) {
    const phone = (typeof data.payload.phone === 'string' && data.payload.phone.trim().length == 11) ? data.payload.phone : false;
    const password = (typeof data.payload.password === 'string' && data.payload.password.trim().length >= 8) ? data.payload.password : false;

    if (phone && password) {
        //Look up user with matching password
        dataStore.read('users', phone, (err, userData) => {
            if (!err && userData) {
                //Hash the password and compare it with that stored in the userData
                const hashedPassword = helpers.hash(password);
                if (hashedPassword === userData.password) {
                    //If valid, create a new token with a random name. Set expiration date 1 hour to the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + (24 * 1000 * 60 * 60);
                    const tokenObject = {
                        phone,
                        expires,
                        'id': tokenId,
                    };

                    //Store the token
                    dataStore.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                'error': 'Unable to create a new token'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        'error': 'Password did not match the specified user\'s'
                    });
                }

            } else {
                callback(400, {
                    'error': 'Could not find the specified user'
                });
            }
        });
    } else {
        callback(400, {
            'error': 'Missing required fields'
        })
    }
};

//Tokens - get
//Required fields: id
//Optional fields: none
handlers._tokens.get = function (data, callback) {
    const tokenId = (typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.length === 20) ? data.queryStringObject.id : false;

    if (tokenId) {
        //Look up phone number
        dataStore.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {
            'error': 'Missing token'
        });
    }
}

//Tokens - put
//Required fields: id, extend
//Optional fields: none
handlers._tokens.put = function (data, callback) {
    const tokenId = (typeof data.payload.id === 'string' && data.payload.id.trim().length == 20) ? data.payload.id : false;
    const extend = (typeof data.payload.extend === 'boolean' && data.payload.extend === true) ? true : false;

    if (tokenId && extend) {
        //Look up token
        dataStore.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                //Check to make sure token is not already expired
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + (24 * 1000 * 60 * 60);

                    //Store the new updates
                    dataStore.update('tokens', tokenId, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                'error': 'Could not update the token\'s expiration'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        'error': 'The token has already expired and cannot be extended'
                    });
                }
            } else {
                callback(400, {
                    'error': 'The specified token does not extend'
                });
            }
        });

    } else {
        callback(400, {
            'error': 'Missing required field(s) or field(s) is invalid'
        });
    }
};

//Tokens - delete
//Required fields: id,
//Optional fields: none,
handlers._tokens.delete = function (data, callback) {
    //Check that the id is valid
    const tokenId = (typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.length == 20) ? data.queryStringObject.id : false;

    if (tokenId) {
        //Look up token
        dataStore.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                dataStore.delete('tokens', tokenId, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            'error': 'Could not delete the specified token'
                        });
                    }
                });
            } else {
                callback(400, {
                    'error': 'Could not find the specified token'
                });
            }
        });
    } else {
        callback(400, {
            'error': 'Missing token'
        });
    }
};

//Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
    //Look up token
    dataStore.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            //Check that the token is for the user provided and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

//Users handler
handlers.users = function (data, callback) {
    const allowableMethods = ['get', 'post', 'put', 'delete'];
    if (allowableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        //Method allowed
        callback(405);
    }
};

//Container for users sub-methods
handlers._users = {};

//User = post
handlers._users.post = function (data, callback) {
    //Check that all required fields are filled out
    const firstName = (typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName : false;
    const lastName = (typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName : false;
    const phone = (typeof data.payload.phone === 'string' && data.payload.phone.trim().length == 11) ? data.payload.phone: false;
    const password = (typeof data.payload.password === 'string' && data.payload.password.trim().length >= 8) ? data.payload.password : false;
    const tosAgreement = (typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement == true) ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        //Make sure the user doesn't already exists
        dataStore.read('users', phone, (err, data) => {
            if (err) {
                //Hash the password
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    //Create user object
                    const userObject = {
                        firstName,
                        lastName,
                        phone,
                        password: hashedPassword,
                        'tosAgreement': true
                    };

                    dataStore.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                'error': 'Could not create the new user'
                            });
                        }
                    });
                } else {
                    callback(500, {'error': 'Unable to hash user\'s password' })
                }
            } else {
                //User already exists
                callback(400, {'error': 'A user with that phone number already exists'});
            }
        });
    } else {
        callback(400, {'error': 'Missing required fields'});
    }
};

// User - get
//Required data: phone
handlers._users.get = function (data, callback) {
    const phone = (typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.length == 11) ? data.queryStringObject.phone : false;

    if (phone) {
        //Get token from header
        const token = (typeof data.headers.token === 'string') ? data.headers.token : false;

        //Verify the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                //Look up phone number
                dataStore.read('users', phone, (err, data) => {
                    if (!err && data) {
                        //Remove the hashed password from the data object before returning it to the user
                        delete data.password;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(403, { 'error': 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, {'error': 'Missing phone number'});
    }
};

//Users - put
//Required field: phone
//Optional fields: firstName, lastName, password (at least of these fields is required)
handlers._users.put = function (data, callback) {
    //Check for required field
    const phone = (typeof data.payload.phone === 'string' && data.payload.phone.trim().length == 11) ? data.payload.phone : false;

    //Check for optional fields
    const firstName = (typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName : false;
    const lastName = (typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName : false;
    const password = (typeof data.payload.password === 'string' && data.payload.password.trim().length >= 8) ? data.payload.password : false;

    if (phone) {
        //Check if at least one of the optional fields is included
        if (firstName || lastName || password) {
            //Get token from header
            const token = (typeof data.headers.token === 'string') ? data.headers.token : false;

            //Verify the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    //Look up the user
                    dataStore.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            //Update the optional fields
                            if (firstName) {
                                userData.firstName = firstName;
                            }

                            if (lastName) {
                                userData.lastName = lastName;
                            }

                            if (password) {
                                userData.password = helpers.hash(password);
                            }

                            //Update users data
                            dataStore.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, { 'error': 'Unable to update the user' })
                                }
                            });
                        } else {
                            callback(400, { 'error': 'The specified user does not exists' });
                        }
                    });
                } else {
                    callback(403, { 'error': 'Missing required token in header, or token is invalid' });
                }
            });
        }
    } else {
        callback(400, {'error': 'Missing required field'})
    }
};

//Users - delete
handlers._users.delete = function (data, callback) {
    const phone = (typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.length == 11) ? data.queryStringObject.phone : false;

    if (phone) {
        //Get token from header
        const token = (typeof data.headers.token === 'string') ? data.headers.token : false;

        //Verify the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                //Look up phone number
                dataStore.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        dataStore.delete('users', phone, (err) => {
                            if (!err) {
                                //Delete each of the checks associated with the user
                                const userChecks = (typeof userData.checks === 'object' && userData.checks instanceof Array) ? userData.checks : [];
                                const checksToDelete = userChecks.length;

                                if (checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    
                                    //Loop through the checks
                                    userChecks.forEach(checkId => {
                                        //Delete the check
                                        dataStore.delete('checks', checkId, (err) => {
                                            checksDeleted++;
                                            if (err) {
                                                deletionErrors = true;
                                            }
                                            
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { 'error': 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfully' });
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback('500', { 'error': 'Could not delete the specified user' });
                            }
                        });
                    } else {
                        callback(400, { 'error': 'Could not find the specified user' });
                    }
                });
            } else {
                callback(403, { 'error': 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, {'error': 'Missing phone number'});
    }
};

//Checks handler
handlers.checks = function (data, callback) {
    const allowableMethods = ['get', 'post', 'put', 'delete'];
    if (allowableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        //Method allowed
        callback(405);
    }
};

//Container for all the tokens methods
handlers._checks = {};

//Checks - post
//Required fields: protocol, url, method, successCodes, timeoutSeconds
//Optional fields: none
handlers._checks.post = function (data, callback) {
    //Validate inputs
    const protocol = (typeof data.payload.protocol === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1) ? data.payload.protocol : false;
    let url = (typeof data.payload.url === 'string' && data.payload.url.trim().length > 0) ? data.payload.url : false;
    url && (url = url.replace(/(http:\/\/)|(https:\/\/)/, ''));
    const method = (typeof data.payload.method === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1) ? data.payload.method : false;
    const successCodes = (typeof data.payload.successCodes === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0) ? data.payload.successCodes : false;
    let timeoutSeconds = parseInt(data.payload.timeoutSeconds);
    timeoutSeconds = (timeoutSeconds && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5) ? timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token = (typeof data.headers.token === 'string') ? data.headers.token : false;

        //Look up the user by reading the token
        dataStore.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone;

                //Look up user
                dataStore.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        const userChecks = (typeof userData.checks === 'object' && userData.checks instanceof Array) ? userData.checks : [];
                        
                        //Verify that the user has the max-checks-per-user
                        if (userChecks.length < config.maxChecks) {
                            //Create a random id for the check
                            const checkId = helpers.createRandomString(20);

                            //Create the check object, and include the user's phone
                            const checkObject = {
                                'id': checkId,
                                userPhone,
                                protocol,
                                url,
                                method,
                                successCodes,
                                timeoutSeconds
                            };

                            //Save the check object
                            dataStore.create('checks', checkId, checkObject, (err) => {
                                if (!err) {
                                    //Add the check id to the user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    //Save the new user data
                                    dataStore.update('users', userData.phone, userData, (err) => {
                                        if (!err) {
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, {'error': 'Could not update the user with the new check'});   
                                        }
                                    });
                                } else {
                                    callback(500, {'error': 'Could not create the check object'});
                                }
                            });
                        } else {
                            callback(400, {
                                'error': `User already has the maximum number of checks (${config.maxChecks})`
                            });
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'error': 'Missing required inputs, or inputs are invalid'});
    }
};

//Checks - get
//Required fields: check id
//Optional fields: none
handlers._checks.get = function (data, callback) {
    const checkId = (typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.length === 20) ? data.queryStringObject.id : false;

    if (checkId) {
        //Look up the check
        dataStore.read('checks', checkId, (err, checkData) => {
            if (!err && checkData) {
                //Get token from header
                const token = (typeof data.headers.token === 'string') ? data.headers.token : false;

                //Verify the given token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        //Return the check data
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'error': 'Missing required check id'});
    }
}

//Checks - put
//Required fields: check id
//Optional fields: protocol, url, method, successCodes, timeoutSeconds (at least one of these must be provided)
handlers._checks.put = function (data, callback) {
    //Check for required field
    const checkId = (typeof data.payload.check === 'string' && data.payload.check.trim().length == 20) ? data.payload.check : false;

    //Check for optional fields
    const protocol = (typeof data.payload.protocol === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1) ? data.payload.protocol : false;
    const url = (typeof data.payload.url === 'string' && data.payload.url.trim().length > 0) ? data.payload.url : false;
    const method = (typeof data.payload.method === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1) ? data.payload.method : false;
    const successCodes = (typeof data.payload.successCodes === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0) ? data.payload.successCodes : false;
    const timeoutSeconds = (typeof data.payload.timeoutSeconds === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5) ? data.payload.timeoutSeconds : false;

    //Check to make sure check id is valid
    if (checkId) {
        //Check to make sure at least one of the optional fields is valid
        if (protocol || url || method || successCodes || timeoutSeconds) {
            //Look up the check
            dataStore.read('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    //Get token from header
                    const token = (typeof data.headers.token === 'string') ? data.headers.token : false;

                    //Verify the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            //Update the check where necessary
                            if (protocol) {
                                checkData.protocol = protocol;
                            }

                            if (url) {
                                checkData.url = url;
                            }

                            if (method) {
                                checkData.method = method;
                            }

                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            }

                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            //Update the check data
                            dataStore.update('checks', checkId, checkData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, { 'error': 'Could not update check data' })
                                }
                            });
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400, { 'error': 'Check id does not exists' });
                }
            });
        } else {
            callback(400, { 'error': 'Missing field(s) to update' });
        }
    } else {
        callback(400, { 'error': 'Missing required check id' });
    }
};

//Checks - delete
//Required fields: check id
//Optional fields: none
handlers._checks.delete = function (data, callback) {console.log(data);
    const checkId = (typeof data.queryStringObject.check === 'string' && data.queryStringObject.check.length === 20) ? data.queryStringObject.check : false;

    if (checkId) {
        //Look up check id
        dataStore.read('checks', checkId, (err, checkData) => {
            if (!err && checkData) {
                //Get token from header
                const token = (typeof data.headers.token === 'string') ? data.headers.token : false;

                //Verify the given token is valid for the phone number
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        //Delete the check data
                        dataStore.delete('checks', checkId, (err) => {
                            if (!err) {
                                //Look up the check owner
                                dataStore.read('users', checkData.userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        const userChecks = (typeof userData.checks === 'object' && userData.checks instanceof Array) ? userData.checks : [];

                                        //Remove the deleted check from the list of checks
                                        const checkPosition = userChecks.indexOf(checkId);
                                        
                                        if (checkPosition > -1) {
                                            userData.checks.splice(checkPosition, 1);
                                            
                                            //Re-save users data
                                            dataStore.update('users', checkData.userPhone, userData, (err) => {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { 'error': 'Could not update the user' });
                                                }
                                            });
                                        } else {
                                            callback(500, { 'error': 'Could not find the check on the user object, so could not remove it' });
                                        }
                                    } else {
                                        callback(500, {
                                            'error': 'Could not find the user who created the check, so could not remove the check from the list of checks on the user object'
                                        });
                                    }
                                });
                            } else {
                                callback(500, { 'error': 'Could not delete the specified check' });
                            }
                        });
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(400, { 'error': 'Check id does not exists' })
            }
        });
    } else {
        callback(400, { 'error': 'Missing check id' });
    }
}

//Ping handler
handlers.ping = function (data, callback) {
    //callback a http status code and a payload
    callback(200);
};

//Not Found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

//Export the module
module.exports = handlers;
