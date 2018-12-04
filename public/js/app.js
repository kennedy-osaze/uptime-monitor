/**
 * Front end logic for the application
 * 
 */

//Container for the front-end application
var app = {};

//Config
app.config = {
    'sessionToken': false,
    'alert': {},
};

//Ajax Client (for the RESTful API)

app.client = {};

//Interface for making API calls
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {
    //Set defaults
    headers = (typeof headers === 'object' && header !== null) ? headers : {};
    path = (typeof path === 'string') ? path : '/';
    method = (typeof method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) ? method.toUpperCase() : 'GET';
    queryStringObject = (typeof queryStringObject === 'object' && queryStringObject !== null) ? queryStringObject : {};
    payload = (typeof payload === 'object' && payload !== null) ? payload : {};
    callback = (typeof callback === 'function') ? callback : false;

    //For each query string parameter sent, add it to the path
    let requestUrl = path + '?';

    let counter = 0;
    for (let queryKey in queryStringObject) {
        if (Object.prototype.hasOwnProperty.call(queryStringObject, queryKey)) {
            counter++;

            //If at least one query string parameter has already been added prepend new ones with an ampersand
            if (counter > 1) {
                requestUrl += '&';
            }

            //Add the key and the value
            requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
        }
    }

    //Form the http request as a JSON type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    //For each header sent, add it to the request
    for (let headerKey in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, header)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    //If there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    //When the request response comes back, handle it;
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const response = xhr.responseText;

            //Callback if request
            if (callback) {
                try {
                    const parsedResponse = JSON.parse(response);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }
            }
        }
    };

    //Send the payload as JSON
    const payloadStr = JSON.stringify(payload);
    xhr.send(payloadStr);
};

//Bind the log out button
app.bindLogOutButton = function () {
    document.getElementById('log-out').addEventListener('click', function (e) {
        e.preventDefault();

        //Log user out
        app.logOutUser();
    });
};

//Log the user out and redirect them
app.logOutUser = function (redirectUser) {
    //Set redirectUser to default to true
    redirectUser = (typeof redirectUser === 'boolean') ? redirectUser : true;

    // Get the current token id
    const tokenId = (typeof app.config.sessionToken.id === 'string') ? app.config.sessionToken.id : false;

    //Send the current token to the token endpoint to delete it
    if (tokenId) {
        const queryStringObject = {
            'id': tokenId
        };
        app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, response) => {
            if (statusCode === 200) {
                //Set the app.config as false
                app.setSessionToken(false);

                if (redirectUser) {
                    //Set the alert message
                    const alert = {
                        'divId': 'alert-login',
                        'status': 'alert alert-success',
                        'message': 'You have successfully logged out'
                    };
                    sessionStorage.setItem('alert', JSON.stringify(alert));

                    //Send user to the login page
                    window.location = '/log-in';
                }
            }
        });
    }
};

app.displayAlert = function () {
    const alertString = sessionStorage.getItem('alert');
    if (typeof alertString === 'string') {
        const alert = JSON.parse(alertString);

        const messageContainer = document.querySelector(`#${alert.divId}`);
        messageContainer.innerHTML = alert.message;
        messageContainer.classList.add(...(alert.status.split(' ')));
        messageContainer.style.display = 'block';

        sessionStorage.removeItem('alert');
    }
}

app.bindForms = function () {
    if (document.querySelector('form')) {
        const allForms = document.querySelectorAll('form');
        for (let i = 0; i < allForms.length; i++) {
            allForms[i].addEventListener('submit', function (e) {
                //stop it from submitting
                e.preventDefault();
                
                const formId = this.id;
                const action = this.action;
                let method = this.method;

                //Hide the current error message (if it is currently shown due to a previous error)
                if (document.querySelector(`#${formId} .alert-container`)) {
                    document.querySelector(`#${formId} .alert-container`).style.display = 'none';
                }
                
                //Turn the inputs to a payload
                const payload = {};
                const elements = this.elements
                for (let i = 0; i < elements.length; i++) {
                    let element = elements[i];

                    if (element.type !== 'submit') {
                        //Determine the class of element and set value accordingly
                        let classOfElement = (typeof element.classList.value === 'string' && element.classList.value.length > 0) ? element.classList.value : '';

                        let value = (element.type === 'checkbox' && !classOfElement.includes('multiSelect')) ? element.checked : (!classOfElement.includes('intVal') ? element.value : parseInt(element.value));
                        let elementIsChecked = element.checked;

                        if (element.name === '_method') {
                            method = value;
                        } else {
                            //Create a payload field named "method" if the element name is actually httpMethod
                            if (element.name === 'httpMethod') {
                                element.name = 'method';
                            }

                            //If the same element has the class "multiSelect" add its value(s) as array elements
                            if (classOfElement.includes('multiSelect')) {
                                if (elementIsChecked) {
                                    payload[element.name] = (typeof payload[element.name] === 'object' && payload[element.name] instanceof Array) ? payload[element.name] : [];
                                    payload[element.name].push(value);
                                }
                            } else {
                                payload[element.name] = value;
                            }
                        }
                    }
                }
                
                //If the method is DELETE, the payload should be the queryStringObject instead
                const queryStringObject = (method === 'DELETE') ? payload : undefined;

                //Call the API
                app.client.request(undefined, action, method, queryStringObject, payload, (statusCode, response) => {
                    //Display an error on the form if needed
                    if (statusCode !== 200) {

                        //Is user not authorized
                        if (statusCode === 403) {
                            app.logOutUser();
                        } else {
                            let error = (typeof response.error === 'string') ? response.error : 'An error occurred, please try again';

                            //Set the message field with the error text
                            document.querySelector(`#${formId} .alert-container`).innerHTML = `<strong>Oops!</strong> ${error}`;

                            //Add alert class to error field
                            document.querySelector(`#${formId} .alert-container`).classList.add('alert', 'alert-danger');

                            //Show (or un-hide) the message field on the form
                            document.querySelector(`#${formId} .alert-container`).style.display = 'block';
                        }
                    } else {
                        //If successful, send to the form response process
                        app.formResponseProcessor(formId, payload, response);
                    }
                });
            });
        }
    }
};

app.formResponseProcessor = function (formId, payload, response) {
    const functionToCall = false;

    //If account creation was successful, try to log the user in
    if (formId === 'account-create') {
        // Take the phone and password, and use it to log the user in
        const logInPayload = {
            'phone': payload.phone,
            'password': payload.password,
        };

        app.client.request(undefined, 'api/tokens', 'POST', undefined, logInPayload, function (statusCode, newResponse) {
            // If successful, set the token and redirect the user
            if (statusCode === 200) {
                app.setSessionToken(newResponse);
                window.location = '/dashboard';
            } else {
                // Display an error on the form if needed
                document.querySelector(`#${formId} #message`).innerHTML = '<strong>Oops!</strong> An error occurred. Please try again.';
                document.querySelector(`#${formId} #message`).classList.add('alert', 'alert-danger');
                document.querySelector(`#${formId} #message`).style.display = 'block';
            }
        });
    }
    
    //If login was successful, redirect to dashboard
    if (formId === 'login') {
        app.setSessionToken(response);
        window.location = '/dashboard';
    }

    //If account update was successful, show success alert
    if (['account-details-form', 'password-form'].includes(formId)) {
        //Set the message field with the error text
        const message = (formId === 'account-details-form') ? 'Your account details have been set' : 'Your new password has been saved';
        document.querySelector(`#${formId} .alert-container`).innerHTML = message;

        //Add alert class to error field
        document.querySelector(`#${formId} .alert-container`).classList.add('alert', 'alert-success');

        //Show (or un-hide) the message field on the form
        document.querySelector(`#${formId} .alert-container`).style.display = 'block';
    }

    //If user just deleted their account, redirect to the account deleted page
    if (formId === 'account-delete') {
        app.logOutUser(false);
        window.location = '/account/deleted';
    }

    if (['checks-create', 'check-edit-form', 'checks-delete'].includes(formId)) {
        window.location = '/checks/all';
    }
};

//Get the session token from the localStorage and set it in the app.config
app.getSessionToken = function () {
    const tokenString = localStorage.getItem('token');
    if (typeof tokenString === 'string') {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            const isLoggedIn = (typeof token === 'object');
            app.setLoggedInClass(isLoggedIn);
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

//Set (or remove) the logged in class from the body
app.setLoggedInClass = function (isLoggedIn) {
    const target = document.querySelector("body");
    if (isLoggedIn) {
        target.classList.add('logged-in');
    } else {
        target.classList.remove('logged-in');
    }
};

//Set the session token in the app.config as well as the localStorage
app.setSessionToken = function (token) {
    const tokenString = JSON.stringify(token);

    app.config.sessionToken = token;
    localStorage.setItem('token', tokenString);
    
    const isLoggedIn = (typeof token === 'object');
    app.setLoggedInClass(isLoggedIn);
};

// Renew the token
app.renewToken = function (callback) {
    const currentToken = (typeof app.config.sessionToken === 'string') ? app.config.sessionToken : false;

    if (currentToken) {
        //Update the token with a new expiration
        const payload = { 'id': currentToken.id, 'extend': true };

        app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCode, response) => {
            //Display an error on the form if needed
            if (statusCode === 200) {
                //Get the new token details
                const queryStringObject = { 'id': currentToken.id };

                app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, (statusCode, response) => {
                    //Display an error on the form if needed
                    if (statusCode === 200) {
                        app.setSessionToken(response);
                    } else {
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            } else {
                app.setSessionToken(false);
                callback(true);
            }
        });
    } else {
        app.setSessionToken(false);
        callback(true);
    }
};

//Load data on a Page
app.loadDataOnPage = function () {
    //Get the current page from the body class
    const bodyClass = document.querySelector("body").classList;
    var pageClass = (typeof bodyClass[0] === 'string') ? bodyClass[0] : false;

    //Logic for account settings page
    if (pageClass === 'account-edit') {
        app.loadAccountSettingsPage();
    }

    if (pageClass === 'checks-index') {
        app.loadChecksListPage();
    }

    if (pageClass === 'check-edit') {
        app.loadChecksEditPage();
    }
};

//Load the account settings page
app.loadAccountSettingsPage = function () {
    //Get the phone number of the user from the current token or log the user out if none exists
    const phone = (typeof app.config.sessionToken.phone === 'string') ? app.config.sessionToken.phone : false;

    if (phone) {
        const queryStringObject = { phone };
        app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, response) => {
            if (statusCode === 200) {
                document.querySelector('#firstName').value = response.firstName;
                document.querySelector('#lastName').value = response.lastName;
                document.querySelector('#displayPhone').value = response.phone;

                //Put the hidden phone fields in both forms
                const hiddenPhoneInputs = document.querySelectorAll('input.hiddenPhone');
                hiddenPhoneInputs.forEach((input, key) => {
                    input.value = response.phone;
                });
            } else {
                //Status code other than 200 should log the user out (on the assumption that the api is down temporarily or the user token is bad)
                app.logOutUser();
            }
        });
    } else {
        app.logOutUser();
    }
};

//Load the check list page
app.loadChecksListPage = function () {
    //Get the phone number from the current token or log the user out if none exists
    const phone = (typeof app.config.sessionToken.phone === 'string') ? app.config.sessionToken.phone : false;

    document.getElementById('create-check-button').style.display = 'none';

    if (phone) {
        //Fetch the user data
        const queryStringObject = { phone };

        app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, response) => {
            if (statusCode === 200) {
                //Determine how many checks the user has
                const allChecks = (Array.isArray(response.checks) && response.checks.length > 0) ? response.checks : [];

                if (allChecks.length > 0) {
                    document.getElementById('no-checks-message').style.display = 'none';

                    allChecks.forEach((checkId) => {
                        const checkQueryStringObject = { id: checkId };

                        app.client.request(undefined, 'api/checks', 'GET', checkQueryStringObject, undefined, (statusCode, response) => {
                            if (statusCode === 200) {
                                //Insert check data into table row
                                const table = document.getElementById('check-table');
                                const tr = table.insertRow(-1);
                                const state = (typeof response.state === 'string') ? response.state : 'unknown';
                                const stateObj = { 'up': 'btn-success', 'down' : 'btn-danger', 'unknown': 'bg-slate' };

                                tr.insertCell(0).innerHTML = response.method.toUpperCase();
                                tr.insertCell(1).innerHTML = `${response.protocol}://`;
                                tr.insertCell(2).innerHTML = response.url;
                                
                                const tr3 = tr.insertCell(3);
                                tr3.classList.value = 'text-center';
                                tr3.innerHTML = `<span class="label ${stateObj[state]}">${state.toUpperCase()}</span>`;
                                tr.insertCell(4).innerHTML = `<a href="/checks/edit?id=${checkId}" class="btn btn-primary">Edit</a>`;

                            } else {
                                console.log('Error trying to load check:', checkId);
                            }
                        });
                    });

                    if (allChecks.length < 5) {
                        document.getElementById('create-check-button').style.display = 'block';
                    }
                } else {
                    document.getElementById('no-checks-message').style.display = 'table-row';
                    document.getElementById('create-check-button').style.display = 'block';
                }
            } else {
                app.logOutUser();
            }
        });
    } else {
        app.logOutUser();
    }
};

//Load the checks edit page
app.loadChecksEditPage = function () {
    // Get the check id from the query string, if none is found then redirect back to checks all page
    const splitUrlData = window.location.href.split('=');
    const checkId = (typeof splitUrlData[1] === 'string' && splitUrlData[1].length > 0) ? splitUrlData[1] : false;

    if (!checkId) {
        window.location = '/checks/all';
    }

    //Fetch the check data
    const checkQueryStringObject = { id: checkId };
    app.client.request(undefined, 'api/checks', 'GET', checkQueryStringObject, undefined, (statusCode, response) => {
        
        if (statusCode !== 200) {
            window.location = '/checks/all';
        }

        const hiddenInputs = document.querySelectorAll('input.hiddenCheckId');
        for (let i = 0; i < hiddenInputs.length; i++) {
            hiddenInputs[i].value = response.id;
        }
        
        //Load response data into form
        document.querySelector('#check-edit-form [name=httpMethod]').value = response.method;
        document.querySelector('#check-edit-form [name=protocol]').value = response.protocol;
        document.querySelector('#check-edit-form [name=url]').value = response.url;
        document.querySelector('#check-edit-form [name=timeoutSeconds]').value = response.timeoutSeconds;

        const successCodeCheckBoxes = document.querySelectorAll('#check-edit-form [name=successCodes]');
        for (let i = 0; i < successCodeCheckBoxes.length; i++) {
            if (response.successCodes.includes(parseInt(successCodeCheckBoxes[i].value))) {
                successCodeCheckBoxes[i].checked = true;
            }
        }
    });
};

// Loop to renew token often
app.tokenRenewalLoop = function () {
    setInterval(() => {
        app.renewToken((err) => {
            if (!err) {
                console.log("Token renewed successfully @ ", Date.now());
            }
        });
    }, 1000 * 60 * 60 * 24);
};

//Init (Bootstrapping)
app.init = function () {
    //Bind all form submissions
    app.bindForms();

    //Bind user log out
    app.bindLogOutButton();

    // Get the token from localStorage
    app.getSessionToken();

    //Display alerts
    app.displayAlert();

    // Renew token
    app.tokenRenewalLoop();

    //Load data on Page
    app.loadDataOnPage();
};

//Call the init processes after the windows load
window.onload = function () {
    app.init();
};
 