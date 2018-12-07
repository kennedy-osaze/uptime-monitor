/**
 * This is the test runner
*/

//Override the NODE_ENV variable
process.env.NODE_ENV = 'testing';

const unit = require('./unit');
const api = require('./api');

//Application logic for the test runner
const _app = {};

//Container for the test
_app.tests = {};

//Add test units
_app.tests.unit = unit;

//Add test api
_app.tests.api = api;

//Count all the tests
_app.countTests = function () {
    let counter = 0;

    for (const [type, subTests] of Object.entries(_app.tests)) {
        for (const [testName, testValue] of Object.entries(subTests)) {
            counter++;
        }
    }

    return counter;
};

//Run the test, collecting the errors and successes
_app.runTests = function () {
    const errors = [];
    const limit = _app.countTests();

    let successes = 0;
    let counter = 0;

    for (const [type, subTests] of Object.entries(_app.tests)) {
        for (const [testName, testValue] of Object.entries(subTests)) {
            (function () {
                //Call the test
                const tempTest = testName;
                
                try {
                    testValue(function () {
                        //Do something here...
                    });
                        //If it calls back without throwing, then it succeeded, so log it in green
                        console.log('\x1b[32m%s\x1b[0m', tempTest);
                    counter++;
                    successes++;

                    if (counter === limit) {
                        _app.produceTestReport(limit, successes, errors);
                    }
                } catch (e) {
                    // If it throws, it failed, so capture the error thrown and log it in red
                    errors.push({
                        name: testName,
                        'error': e
                    });

                    console.log('\x1b[31m%s\x1b[0m', tempTest);
                    counter++;

                    if (counter === limit) {
                        _app.produceTestReport(limit, successes, errors);
                    }
                }
            })();
        }
    }
};

//Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
    console.log("");
    console.log("-------------BEGIN TEST REPORT------------------");
    console.log("Total test: ", limit);
    console.log("Pass: ", successes);
    console.log("Fail: ", errors.length);
    console.log("");

    //If there are errors, print them in details
    if (errors.length > 0) {
        console.log("-------------BEGIN ERROR DETAILS------------------");

        errors.forEach((testError) => {
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error)
        });

        console.log("-------------END ERROR DETAILS------------------");
    }

    console.log("");
    console.log("-------------END TEST REPORT------------------");
    process.exit(0);
};

// Run the tests
_app.runTests();