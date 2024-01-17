
var server = require('./express_setup').server;
var global = require('./global');
var database = require('./database');

// socketio setup
var io = require('socket.io') (server, 
    {
        cors: { origin: '*' },
        pingInterval: 10000,
        pingTimeout: 5000,
//        rememberTransport: false,
//        reconnect: false,
        secure: true
    }
);

database.init();
global.io = io;
// server engine
var socketcontroller = require('./controller/socketcontroller');
io.on('connection', function(socket) {
    socketcontroller.newSocket(socket, io);
});