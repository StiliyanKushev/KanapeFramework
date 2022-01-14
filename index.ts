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
    Module.switchTo('default');
    while(true){
        const input: string = await Module.prompt(`[kf/${Module.currentModule.name}]$ `) as string;
        await Module.currentModule.exec(input);
    }
})();