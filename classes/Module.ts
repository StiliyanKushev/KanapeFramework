import { cmdClear, cmdHelp } from './../utils/cmd';
import { cmdError } from '../utils/cmd';
const prompt = require("prompt-sync")({ sigint: true });

export class Module implements Module {
    public help = '[!] Module does not have a written help message.'.bg_white.red;
    public args: {
        cmd: string,
        handler: (value?) => void
    }[] = [];

    constructor(public name: string) { }

    public async exec(input:string) {
        // check for global commands
        if(Module.defaultArgs.find(m => m.arg === input)) {
            Module.defaultArgs.find(m => m.arg === input).handler(this);
        }
        else {
            // check for local
            const argument = this.args.find(a => input.startsWith(a.cmd));
            if(argument){
                if(argument.cmd.endsWith('=')){
                    // return setter value
                    const value = input.split('=').slice(1).join('=');
                    await argument.handler.bind(this, value).call();
                }
                else {
                    // return without value
                    await argument.handler.bind(this).call();
                }
            }
            
            // throw error 
            else cmdError(`"${input}" is not a valid command for module "${this.name}"`);
        }
    }

    static prompt(query: string) {
        return prompt(query) as string;
    }

    static defaultArgs: {
        arg: string,
        desc: string,
        handler: (module?: Module) => void,
    }[] = [
        {
            arg: 'help',
            desc: 'Prints the help message of the current module',
            handler: module => cmdHelp(module)
        },
        {
            arg: 'clear',
            desc: 'Clear the console.',
            handler: () => cmdClear()
        }
    ]

    static makeHelp(args:{
        arg: string,
        desc: string
    }[]):string{
        let helpMsg = ``;
        args = args.concat(Module.defaultArgs);
        args.map(arg => helpMsg += `${arg.arg}  --|>   "${arg.desc}"\n`)
        return helpMsg.bg_white.black;
    }
}