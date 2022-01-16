import readline from 'readline';

import {
    cmdClear,
    cmdError,
    cmdExit,
    cmdHelp,
    cmdWarn,
} from '../utils/cmd';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Module implements Module {
    public help = '[!] Module does not have a help message.'.bg_white.red;
    public description = '[!] Module does not have a description.'.bg_white.red;
    public args: {
        arg: string,
        handler: (value?) => void,
        desc?: string,
    }[] = [];

    constructor(public name: string, public _constr,public _index:number) { }

    // lifecycle hooks
    public onStartup() { }
    public onClose(callback: () => void) { callback() }
    // end of lifecycle hooks

    public async __exec(input:string) {
        // Ctr-C was pressed
        if(input === null) { cmdExit(); return }

        // if enter was pressed
        if(input.trim().length === 0) return;

        const internal = Module.defaultArgs.find(m => input === m.arg || input.split('=')[0] + '=' === m.arg);
        const argument = this.args.find(a => input == a.arg || input.split('=')[0] + '=' === a.arg);
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

    static async prompt(query: string, callback: (value?:string) => void) {
        rl.question(query, await callback);
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
            arg: 'reset',
            desc: `Resets the current module's values.`,
            handler: () => Module._reset() 
        },
        {
            arg: 'cd=',
            desc: 'Switch to a different module. Example: cd=default',
            handler: module => Module.switchTo(module)
        },
    ]

    static currentModule: Module;
    static allModules: Module[] = [];

    static _reset(){
        const reseted = new Module.currentModule
        ._constr.default(
            Module.currentModule.name,
            Module.currentModule._constr,
            Module.currentModule._index,
        );

        Module.allModules[Module.currentModule._index] = reseted;
        Module.currentModule = reseted;
    }

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

        const _switch = (newModule:Module) => {
            if(Module.currentModule) {
                Module.currentModule.onClose(() => {
                    cmdClear();
                    Module._reset();
                    Module.currentModule = newModule;
                    Module.currentModule.onStartup();
                });
            }
            else {
                cmdClear();
                Module.currentModule = newModule;
                Module.currentModule.onStartup();
            }
        }

        if(typeof module === 'string'){
            const found = Module.allModules.find(m => m.name === module);
            if(found) _switch(found);
            else cmdWarn(`No module was found with the name "${module}"`);
        }
        else _switch(module);
    }
}