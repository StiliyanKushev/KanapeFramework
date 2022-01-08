import 'colors';
import fs from 'fs';

// CMD ARGUMENT RELATED STUFF
export let args: string[] = process.argv.slice(2);
/** Get an array of cmd arguments. */
export const getArgs = () => args;
/** Overwrite the cmd arguments array. Useful when inside of child_process or worker. */
export const setArgs = (newArgs: string[]) => args = newArgs;

// CMD HELPER FUNCTIONS AND CONSTANTS
export const helpMsg = 
`All Parameters:\n                        
--help              -> Shows this help menu.\n     
--verbose           -> Shows extra log messages.\n`
;

/** Clear the console. */
export const cmdClear = (): void => { process.stdout.write("\u001b[3J\u001b[2J\u001b[1J"); console.clear() }
/** Print help message to the console. */
export const cmdHelp = (): void => { console.log(helpMsg); cmdExit() }
/** Terminate the current process. */
export const cmdExit = (): void => process.exit(1);
/** Print an error message to the console and exit.
 * @param {string} err The error message to throw. */
export const cmdError = (err:string) => { console.log(err.bgWhite.red); cmdExit() }
/** Print a warning message to the console.
 * @param {string} msg The warning message to throw. */
export const cmdWarn = (msg:string) => console.log(`NOTE: ${msg}`.bgBlack.yellow);

/**
 * Print a log message to the console.
 * @param {string} msg The message to log to the console.
 * @param {boolean=} printTime Should the time be printed. 
 * The output format is as follows:
 * [log] - {msg}    OR    [log] - {msg} {n}sec
 * where n is seconds from last call of the function.
 * Same functionality as console.time */
let lastDate:number = null;
export const cmdLog = (msg:string, printTime=false) => {
    if(lastDate == null) lastDate = Date.now()
    if(msg != undefined)
    console.log(`[log] - ${msg}${printTime?' - '+((Date.now() - lastDate) / 1000)+'sec':''}`.gray);
    lastDate = Date.now();
}

/** Check for unknown arguments and throw error accordingly. */
export const cmdCheckArgs = () => {
    getArgs().map(arg => arg.startsWith('--') && !helpMsg.match(arg + ' ') &&
        cmdError(`Unknown argument: '${arg}'. Use --help for more info. `))
}

/** Get the value of a cmd argument.
 * @param {string} arg The argument you're checking the value of.
 * @param {'string'|'path'|'number'|'boolean'} type The expected type of the argument.
 */
export const getArgsVal = (arg:string, type:'string'|'path'|'number'|'boolean') => {
    let val = getArgs()[getArgs().indexOf(arg) + 1];

    if(getArgs().indexOf(arg) == -1) return undefined;
    if(val == undefined || val.startsWith('-')) 
    cmdError(`Argument '${arg}' expects a value. Use --help for more info.`);

    const typeOf = (v) => {
        if(v.toLowerCase() == 'true' || v.toLowerCase() == 'false') return 'boolean';
        return typeof v;
    }

    if(type == 'path'){
        if(fs.existsSync(val)) {
            if(!(fs.statSync(val).size == 0)) return val;
            cmdError(`File can not be empty when using ${arg}. Use '--help' for more info.`)
        }
        cmdError(`Wrong argument type for argument: '${arg}'` +
                  `\nExpected valid '${type}' but got invalid '${typeOf(val)}' - '${val}'`)
    }

    if(type == 'number'){
        if(!isNaN(Number(val))) return Number(val);
        cmdError(`Wrong argument type for argument: '${arg}'` +
                  `\nExpected '${type}' but got '${typeOf(val)}' - '${val}'`)
    }
    
    else if(type == 'boolean'){
        if(val.toLowerCase() == 'true') return true;
        if(val.toLowerCase() == 'false') return false;
        cmdError(`Wrong argument type for argument: '${arg}'` +
                  `\nExpected '${type}' but got '${typeOf(val)}' - '${val}'`)
    }

    return val;
}