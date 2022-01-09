import Colors = require('../lib/colors');

console.log(`Color.enable(${"false".red})`)
Colors.enable(false);

console.log(Colors.colors("red", "red"));
console.log(Colors.colors("green", "green"));
console.log(Colors.colors("yellow", "yellow"));
console.log("red".red);
console.log("green".green);
console.log("yellow".yellow);

Colors.enable(true);
console.log(`Color.enable(${"true".green})`)

console.log(Colors.colors("red", "red"));
console.log(Colors.colors("green", "green"));
console.log(Colors.colors("yellow", "yellow"));
console.log("red".red);
console.log("green".green);
console.log("yellow".yellow);