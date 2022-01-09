import generateModules from './utils/modules';
import { cmdClear } from './utils/cmd';
import { Module } from './classes/Module';

(async () => {
    const modules = await generateModules();
    let currentModule = modules.find(m => m.name === 'default');

    cmdClear();

    while(true){
        const input: string = await Module.prompt(`[kf/${currentModule.name}]$ `) as string;
        currentModule.exec(input);
    }
})();