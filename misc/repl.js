/**
 * Example REPL server
 * 
 * Take in the word foo and log out bar
 * 
*/

//Dependencies
const repl = require('repl');

//Start the REPL

repl.start({
    prompt: '>',
    eval: (str) => {
        //Evaluation function for incoming inputs
        console.log('At the evaluation stage: ', str);

        // If the user said "foo", say "bar" to them
        if (str.indexOf('foo') > -1) {
            console.log('bar');
        }
    }
})
