import Colors = require('../lib/colors')

console.log('[' + 'INFO'.info +  '] everything is ok!');
console.log('[' + 'WARNING'.warning +'] this is a warnning!');
console.log('[' + 'DEBUG'.debug +'] wait! something is wrong!');
console.log('[' + 'ERROR'.error + '] ' + 'WTF! ERROR'.error);

Colors.theme({
    info: "bg_green",
    warning: "bg_yellow",
    debug: "bg_blue",
    error: ["bg_red", "underline"],
})

console.log('[' + 'INFO'.info +  '] everything is ok!');
console.log('[' + 'WARNING'.warning +'] this is a warnning!');
console.log('[' + 'DEBUG'.debug +'] wait! something is wrong!');
console.log('[' + 'ERROR'.error + '] ' + 'WTF! ERROR'.error);