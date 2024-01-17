
var utils = require('../utils');
var roommanager = require('../manager/roommanager');
var playermanager = require('../manager/playermanager');
var global = require('../global');

exports.newSocket = function (socket, io) {
    let roomlist_interval = roommanager.registerSocket(socket);

    socket.on('REQ_REGISTER_PLAYER', function (data) {
        registerPlayer(socket, data);
    });

    socket.on('REQ_CREATE_ROOM', function (data) {
        createRoom(socket, data);
    });
    socket.on('REQ_JOIN_ROOM', function (data) {
        joinRoom(socket, data);
    });
    socket.on('REQ_LEAVE_ROOM', function (data) {
        leaveRoom(socket, data);
    });

    socket.on('REQ_PLAYER_ACTION', function (data) {
        doPlayerAction(data);
    });

//  socket disconnected
    socket.on('disconnect', () => {
        unregisterPlayer(socket);
        roommanager.unregisterSocket(socket, roomlist_interval);
        socket.removeAllListeners();
    });
}

function registerPlayer(socket, data) {
    data = JSON.parse(data);

    var name = data.name;
    playermanager.registerPlayer(socket, name);
}

function unregisterPlayer(socket) {
    playermanager.unregisterPlayer(socket);
}

function createRoom(socket, data) {
    data = JSON.parse(data);

    var name = data.name;
    var bot = parseInt(data.bot);
    roommanager.createRoom(name, bot);
}

function joinRoom(socket, data) {
    data = JSON.parse(data);

    var playerid = parseInt(data.playerid);
    var roomid = parseInt(data.roomid);
    var status = playermanager.joinRoom(utils.findRoomById(roomid), playerid);
    if (status !== global.ERROR_CODE.JOIN_SUCCESS)
        socket.emit('REQ_JOIN_ROOM_RESULT', {status: status});
}

function leaveRoom(socket, data) {
    data = JSON.parse(data);

    var id = parseInt(data.id);
    playermanager.leaveRoom(id);
}

function doPlayerAction(data) {
    data = JSON.parse(data);

    var id = parseInt(data.id);
    var action = data.action;

    playermanager.doPlayerAction(id, action);
}