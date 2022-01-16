import { Module } from './classes/Module';
import {
    cmdClear,
    cmdError,
    cmdExit,
} from './utils/cmd';
import generateModules from './utils/modules';

if (process.version != 'v14.18.2'){
    cmdError('NodeJS version v14.18.2 is required. Current version is ' + process.version);
    cmdExit();
}

// clear the console before execution.
cmdClear();

(async () => {
    Module.allModules = await generateModules();
    //Module.switchTo('default');
    Module.switchTo('shell_server');
    async function main(){
        await Module.prompt(`[kf/${Module.currentModule.name}]$ `, async input => {
            await Module.currentModule.__exec(input);
            setTimeout(main);
        })
    }
    await main();
})();