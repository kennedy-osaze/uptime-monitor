/**
 * Unit Tests
 * 
 */

const helpers = require('../lib/helpers');
const assert = require('assert');
const logs = require('../lib/logs');
const exampleDebuggingProblem = require('../lib/example_debugging_problem');

//Holder for tests
const unit = {};

//Assert that the getANumber function returns a number
unit['helper.hash should return a number'] = function (done) {
    var val = helpers.getANumber();
    assert.equal(typeof val, 'number');
    done();
};

//Assert that the getANumber function returns 1
unit['helper.hash should return 1'] = function (done) {
    var val = helpers.getANumber();
    assert.equal(val, 1);
    done();
};

//Assert that the getANumber function returns 2
unit['helper.hash should return 2'] = function (done) {
    var val = helpers.getANumber();
    assert.equal(val, 2);
    done();
};

//Logs.list should callback an array and a false err
unit['log.list should callback a false err and an array of log names'] = function (done) {
    logs.list(true, (err, logFiles) => {
        assert.equal(err, false);
        assert.ok(logFiles instanceof Array);
        assert.ok(logFiles.length > 1);
        done();
    });
};

//Logs.truncate should not throw if the log id does not exists
unit['logs.truncate should not throw if the log id does not exists. It should callback an error instead'] = function (done) {
    assert.doesNotThrow(() => {
        logs.truncate('I do not exist', (err) => {
            assert.ok(err);
            done();
        });
    }, TypeError);
}

//exampleDebuggingProblem.init should not throw (but it does)
unit['exampleDebuggingProblem.init should not throw when called'] = function (done) {
    assert.doesNotThrow(() => {
        exampleDebuggingProblem.init();
    }, TypeError);
}

module.exports = unit;