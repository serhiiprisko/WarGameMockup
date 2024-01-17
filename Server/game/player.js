
var global = require('../global');
var utils = require('../utils');
var playermanager = require('../manager/playermanager');

module.exports = {
    Player: Player
};
var EventEmitter = require('events').EventEmitter;
Player.prototype.__proto__ = EventEmitter.prototype;

function Player(playerinfo) {
    this.playerinfo = playerinfo;
}

Player.prototype.isBot = function() {
	return this.playerinfo.socket === null;
}

Player.prototype.rejoin = async function(socket) {
	this.playerinfo.alive = true;
	this.playerinfo.socket = socket;

	if (this.playerinfo.room != null) {
		socket.join('r' + this.playerinfo.room.id);
		this.refreshPlayer();
	}
	else {
		var rank = await utils.getPlayerRank(this.playerinfo.name);
        socket.emit('REQ_REGISTER_PLAYER_RESULT', {
			id: this.playerinfo.id,
			rank: rank
		});
	}
}

Player.prototype.lostConnection = function() {
	this.playerinfo.alive = false;

	var room = this.playerinfo.room;
	if (room != null)
		this.playerinfo.socket.leave('r' + room.id);
}

Player.prototype.setRoom = function(room) {
	if (room.table.addPlayer(this) === false)
		return false;
	if (this.isBot() === false)
		this.playerinfo.socket.join('r' + room.id);
	this.playerinfo.room = room;
	return true;
}

Player.prototype.leave = function() {
	if (this.playerinfo.room === null) return;
	if (this.playerinfo.alive === true && this.isBot() === false)
		this.playerinfo.socket.leave('r' + this.playerinfo.room.id);
	this.playerinfo.room = null;
}

Player.prototype.leaveByUser = function() {
	this.playerinfo.room.table.playerLeave(this.playerinfo.id);
	if (this.playerinfo.alive === true)
		this.playerinfo.socket.emit('REQ_LEAVE_ROOM_RESULT', { result: true });
	this.leave();
}

Player.prototype.refreshPlayer = function() {
	if (this.isBot()) return;
	var room = this.playerinfo.room;

    let emitdata = {
		status: global.ERROR_CODE.JOIN_SUCCESS,
		id: this.playerinfo.id,
		roomname: room.name,
		countdown: room.table.countdown,
		players: room.table.playerList(),
		state: room.table.state
	};

	this.playerinfo.socket.emit('REQ_JOIN_ROOM_RESULT', emitdata);
}

Player.prototype.refreshWinner = function(result) {
	if (this.isBot()) return;
	if (this.playerinfo.alive === false) return;
	
	let emitdata = {
		result: result
	};

	this.playerinfo.socket.emit('REQ_GAME_WINNER_RESULT', emitdata);
}