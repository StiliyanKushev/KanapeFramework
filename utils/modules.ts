import fs from 'fs';
import path from 'path';

import { Module } from '../classes/Module';
import { cmdError } from './cmd';

// Generate a module for each index.ts in modules and fill the array.
const modulesFolderPath = path.join(__dirname, '../modules');
const _modulesFolder = fs.readdirSync(modulesFolderPath);

export default function(): Promise<Module[]> {
    const promise = Promise.all(_modulesFolder.map(async (folderName, idx) => {
        const _modulePath = `${modulesFolderPath}/${folderName}/index.ts`;
    
        // throw error if module doesn't have index.ts
        if(!fs.existsSync(_modulePath))
        cmdError(`Module '${folderName}' does not have an index.ts file."`);
    
        // push the module to the global array
        const _module = await import(_modulePath);
        const customModule = new _module.default(folderName, _module, idx);
        return customModule;
    }));

    return promise as any;
}