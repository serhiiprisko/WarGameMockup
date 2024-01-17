
var utils = require('../utils');
var Player = require('../game/player').Player;
var global = require('../global');

var playerlist = require('../global').playerlist;
var max_player_id = 0;

exports.registerPlayer = async function(socket, name) {
    var existing_player = utils.findPlayerByName(name);
    if (existing_player != null) {
        existing_player.rejoin(socket);
        return;
    }

    var player = {
        id: max_player_id,
        name: name,
        socket: socket,
        room: null,
        player: null,
        alive: true
    }
    var p = new Player(player);
    player.player = p;
    
    playerlist.push(player);
    max_player_id ++;

    var rank = await utils.getPlayerRank(name);
    socket.emit('REQ_REGISTER_PLAYER_RESULT', {id: player.id, rank: rank});
}
exports.registerBot = function(name) {
    var player = {
        id: max_player_id,
        name: name,
        socket: null,
        room: null,
        player: null,
        alive: true
    }
    var p = new Player(player);
    player.player = p;
    
    playerlist.push(player);
    max_player_id ++;

    return player;
}

exports.unregisterPlayer = function(socket) {
    var existing_player = utils.findPlayerBySocket(socket);

    if (existing_player != null) {
        existing_player.lostConnection();
    }
}

exports.joinRoom = function(room, id) {
    var player = utils.findPlayerById(id);
    if (room === null)
        return global.ERROR_CODE.JOIN_INVALID_ROOMID;
    if (player === null)
        return global.ERROR_CODE.JOIN_INVALID_PLAYERID;
    if (player.setRoom(room) === false)
        return global.ERROR_CODE.JOIN_FAILED;

    player.refreshPlayer();
    return global.ERROR_CODE.JOIN_SUCCESS;
}

function getValidPlayer(id) {
    var player = utils.findPlayerById(id);
    if (player === null) return null;
    if (player.playerinfo.room === null) return null;

    return player;
}

exports.leaveRoom = function(id) {
    var player = getValidPlayer(id);
    if (player === null) return false;

    player.leaveByUser();
    return true;
}

exports.doPlayerAction = function(id, action) {
    var player = getValidPlayer(id);
    if (player === null) return false;

    player.playerinfo.room.table.playerAction(id, action);
    return true;
}

exports.terminatePlayer = function(player) {
    utils.removeInArray(playerlist, player);
}