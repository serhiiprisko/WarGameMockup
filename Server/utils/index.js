
var roomlist = require('../global').roomlist;
var playerlist = require('../global').playerlist;
var userController = require('../controller/userController');

// room operations
exports.findRoomById = function(id) {
    for (var i = 0; i < roomlist.length; i ++) {
        if (roomlist[i].id === id)
            return roomlist[i];
    }
    return null;
}

// player operations
exports.findPlayerById = function(id) {
    for (var i = 0; i < playerlist.length; i ++) {
        if (playerlist[i].id === id)
            return playerlist[i].player;
    }
    return null;
}

exports.findPlayerBySocket = function(socket) {
    for (var i = 0; i < playerlist.length; i ++) {
        if (playerlist[i].socket === socket)
            return playerlist[i].player;
    }
    return null;
}

exports.findPlayerByName = function(name) {
    for (var i = 0; i < playerlist.length; i ++) {
        if (playerlist[i].name === name)
            return playerlist[i].player;
    }
    return null;
}

exports.getPlayerRank = async function(user) {
    return await userController.getRank(user);
}

// other functions
exports.removeInArray = function(array, value) {
    for (var i = array.length - 1; i >= 0; i --) {
        if (array[i] === value) {
            array.splice(i, 1);
            return true;
        }
    }
    return false;
}

exports.containsInArray = function(array, value) {
    for (var i = array.length - 1; i >= 0; i --) {
        if (array[i] === value)
            return true;
    }
    return false;
}

exports.randomRange = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}