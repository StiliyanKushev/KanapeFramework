const { io } = require("socket.io-client");

// get the zombie id from shell_server
const zombieID = process.argv[2];

// connect to socket.io server
const socket = io('http://localhost:30437', { query: `id=${zombieID}` });

// handle disconnect
socket.on('terminate', () => process.exit());

// send input to shell_server's socket server on input
process.stdin.on('data', data => socket.emit('stdin', data.toString()))

// handle reverse shell data being sent
socket.on('stdout', data => {
    // convert to string if data is buffer
    data = data.toString();
    
    // print the stdin to terminal
    process.stdout.write(data);
})