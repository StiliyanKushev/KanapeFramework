import generateModules from './utils/modules';
import { cmdClear } from './utils/cmd';
import { Module } from './classes/Module';

// clear the console before execution.
cmdClear();

(async () => {
    Module.allModules = await generateModules();
    Module.switchTo('default');
    while(true){
        const input: string = await Module.prompt(`[kf/${Module.currentModule.name}]$ `) as string;
        Module.currentModule.exec(input);
    }
})();