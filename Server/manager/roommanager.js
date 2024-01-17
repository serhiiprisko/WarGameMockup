
var utils = require('../utils');
var global = require('../global');
var botmanager = require('./botmanager');

var roomlist = require('../global').roomlist;
var Table = require('../game/table').Table;

var max_room_id = 0;

exports.createRoom = function(name, bot) {
    var room = {
        id: max_room_id,
        name: name,
        table: null,
    }

    room.table = new Table(room);

    roomlist.push(room);
    max_room_id ++;

    if (bot > 0) {
        botmanager.createBot(room);
    }

    return room;
}

exports.registerSocket = function(socket) {
    let interval = setInterval(() => {
        let arr = [];
        for (var index = 0; index < roomlist.length; index ++) {
            const element = roomlist[index];
            if (element.table.playerlist.length < 2) {
                arr.push({
                    id: element.id,
                    name: element.name,
                });
            }
        }

        socket.emit('REQ_ROOMLIST_RESULT', {rooms: arr});
    }, 1000);

    return interval;
}

exports.unregisterSocket = function(socket, interval) {
    clearInterval(interval);
}

exports.terminateRoom = function(id) {
    const room = utils.findRoomById(id);
    if (room === null) return false;

    utils.removeInArray(roomlist, room);
    
    return true;
}