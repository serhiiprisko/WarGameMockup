
var roomlist = [] 
/*
    {
        id,
        name,
        room
    }
*/

var playerlist = []
/*
    {
        id,
        name,
        socket, // if socket === null, is a bot
        room,
        player,
        alive, // if he is online or offline
    }
*/

var io = null;

const ROOM_STATUS = {
    NOT_STARTED: 0,
    STARTED: 1,
    STOPPED: 2,
    ENDED: 3
}

const ERROR_CODE = {
    JOIN_SUCCESS: 0,
    JOIN_INVALID_ROOMID: 1,
    JOIN_INVALID_PLAYERID: 2,
    JOIN_FAILED: 3
}

module.exports = {
    roomlist: roomlist,
    playerlist: playerlist,
    io: io,
    ERROR_CODE: ERROR_CODE,
    ROOM_STATUS: ROOM_STATUS
}