import {
    cmdClear,
    cmdError,
    cmdExit,
    cmdHelp,
    cmdWarn,
} from '../utils/cmd';

const prompt = require("prompt-sync")({ sigint: false });

export class Module implements Module {
    public help = '[!] Module does not have a help message.'.bg_white.red;
    public description = '[!] Module does not have a description.'.bg_white.red;
    public args: {
        arg: string,
        handler: (value?) => void,
        desc?: string,
    }[] = [];

    constructor(public name: string) { }

    public async exec(input:string) {
        // Ctr-C was pressed
        if(input === null) { cmdExit(); return }

        const internal = Module.defaultArgs.find(m => input.startsWith(m.arg));
        const argument = this.args.find(a => input.startsWith(a.arg));
        const final = internal || argument;
        if(final){
            if(final.arg.endsWith('=')){
                // return setter value
                const value = input.split('=').slice(1).join('=');
                await final.handler.bind(this, value).call();
            }
            else {
                // return without value
                await final.handler.bind(this).call();
            }
        }
        
        // throw error 
        else cmdError(`"${input}" is not a valid command for module "${this.name}"`);
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
            handler: () => {
                Module.currentModule.help = Module.makeHelp(Module.currentModule.args);
                cmdHelp(Module.currentModule);
            } 
        },
        {
            arg: 'clear',
            desc: 'Clear the console.',
            handler: () => cmdClear()
        },
        {
            arg: 'ls',
            desc: 'List all modules.',
            handler: () => Module.allModules.map(m => console.log(`[${m.name}] - ${m.description}`))
        },
        {
            arg: 'cd=',
            desc: 'Switch to a different module. Example: cd=default',
            handler: module => Module.switchTo(module)
        },
    ]

    static currentModule: Module;

    static allModules: Module[] = [];

    static makeHelp(args:{
        arg: string,
        desc?: string
    }[]):string {
        let longLine = '-------------------------------------------------------\n';
        args = [...Module.defaultArgs, { arg:'', desc:'' } ,...args];
        let helpMsg = longLine + '# Global\n' + longLine;
        args.map(arg => helpMsg += arg.arg.length > 0 ? `${arg.arg} ${arg.desc ? '"' + arg.desc + '"' :
                              "[!] Argument does not have a description.".bg_white.red}\n` : longLine + '# Module\n' + longLine);
        
        if(args.length === Module.defaultArgs.length + 1){
            // module has no args
            helpMsg += 'Module is empty and has no arguments.\n'
        }
        helpMsg += longLine;
        helpMsg = helpMsg.slice(0, -1);
        return helpMsg;
    }

    static switchTo(module: Module|string){
        if(!module || (typeof module == 'string' && module.trim().length === 0)) {
            cmdWarn('Module cannot be empty.');
            return;
        }

        if(typeof module === 'string'){
            const found = Module.allModules.find(m => m.name === module);
            if(found) Module.currentModule = found;
            else cmdWarn(`No module was found with the name "${module}"`);
        }
        else {
            Module.currentModule = module;
        }

        cmdClear();
    }
}