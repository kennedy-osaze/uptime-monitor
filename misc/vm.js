/**
 * Example VM
*/

//Dependencies
const vm = require('vm');

//Define a context for the script to run in
const context = { foo: 20 };

//Define the script that should execute
const script = new vm.Script(`
    foo *= 2;
    var bar = foo + 1;
    var fizz = 20;
`);

//Run script
script.runInNewContext(context);
console.log(context);