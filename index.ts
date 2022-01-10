import { Module } from './classes/Module';
import { cmdClear } from './utils/cmd';
import generateModules from './utils/modules';

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