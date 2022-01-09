import 'colors.ts';
import fs from 'fs';
import { Module } from '../classes/Module';

// CMD ARGUMENT RELATED STUFF
export let args: string[] = process.argv.slice(2);
/** Get an array of cmd arguments. */
export const getArgs = () => args;
/** Overwrite the cmd arguments array. Useful when inside of child_process or worker. */
export const setArgs = (newArgs: string[]) => args = newArgs;

// CMD CONSTANT MESSAGES
export const logoMsg = 
`____ ____ ____ ____ ____ ____ _________ ____ ____ ____ ____ ____ ____ ____ ____ ____ 
||K |||a |||n |||a |||p |||e |||       |||F |||r |||a |||m |||e |||w |||o |||r |||k ||
||__|||__|||__|||__|||__|||__|||_______|||__|||__|||__|||__|||__|||__|||__|||__|||__||
|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/_______\\|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|
`;

/** Clear the console. */
export const cmdClear = (): void => { process.stdout.write("\u001b[3J\u001b[2J\u001b[1J"); console.clear(); cmdLogo() }
/** Print logo message to the console. */
export const cmdLogo = (): void => console.log(logoMsg)
/** Terminate the current process. */
export const cmdExit = (): void => process.exit(1);
/** Print an error message to the console and exit.
 * @param {string} err The error message to throw. */
export const cmdError = (err:string) => console.log(err.bg_white.red)
/** Print a warning message to the console.
 * @param {string} msg The warning message to throw. */
export const cmdWarn = (msg:string) => console.log(`NOTE: ${msg}`.bg_black.yellow)
/** Print help message to the console. */
export const cmdHelp = (module:Module): void => console.log(`\n[${module.description}]\n\n${module.help}\n`) 

/**
 * Print a log message to the console.
 * @param {string|undefined} msg The message to log to the console.
 * @param {boolean} [printTime=false] Should the time be printed. 
 * The output format is as follows:
 * [log] - {msg}    OR    [log] - {msg} {n}sec
 * where n is seconds from last call of the function.
 * Same functionality as console.time */
let lastDate:number = null;
export const cmdLog = (msg:string=undefined, printTime=false) => {
    if(lastDate == null) lastDate = Date.now()
    if(msg != undefined)
    console.log(`[log] - ${msg}${printTime?' - '+((Date.now() - lastDate) / 1000)+'sec':''}`.gray);
    lastDate = Date.now();
}

/** Check for unknown arguments and throw error accordingly. 
 * @param {Module} module The module you're currently using.
*/
export const cmdCheckArgs = (module:Module) => {
    getArgs().map(arg => arg.startsWith('--') && !module.help.match(arg + ' ') &&
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