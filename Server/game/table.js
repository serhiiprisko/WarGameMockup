
var utils = require('../utils');
var global = require('../global');
var roommanager = require('../manager/roommanager');
var userController = require('../controller/userController');

module.exports = {
    Table: Table
};
var EventEmitter = require('events').EventEmitter;
Table.prototype.__proto__ = EventEmitter.prototype;

const SHOOT_ACTION = 'shoot';
const HEAL_ACTION = 'heal';
const HEAL_SHIELD_ACTION = 'healShield';
const REFLECT_SHILED_ACTION = 'reflectShield';

function Table(room) {
	this.playerlist = []; // { player, health, heal_shield_charge, reflect_shield_charge, action }
	
	this.state = global.ROOM_STATUS.NOT_STARTED;
	this.countdown = -1;
	this.countdown_timer = null;
	this.roominfo = room;
	this.turn = -1;
}

Table.prototype.addPlayer = function(player) {
	for (var i = 0; i < this.playerlist.length; i ++) {
		if (this.playerlist[i].player.playerinfo.id === player.playerinfo.id)
			return true;
	}
	if (this.playerlist.length >= 2)
		return false;

	this.playerlist.push({
		player: player,
		health: 1000,
		heal_shield_charge: 2,
		reflect_shield_charge: 1,
		action: ''
	});
	this.broadcastPlayers();

	if (this.playerlist.length == 2)
		this.startGame();
	return true;
}

Table.prototype.startGame = function() {
	this.turn = 0;
	this.newTurn();
}

Table.prototype.newTurn = function() {
	this.state = global.ROOM_STATUS.STARTED;
	this.broadcastNewState();

	this.playerlist[0].action = '';
	this.playerlist[1].action = '';
	this.turn ++;
	if (this.turn % 5 == 0) {
		this.playerlist[0].heal_shield_charge ++;
		this.playerlist[1].heal_shield_charge ++;
		this.playerlist[0].reflect_shield_charge ++;
		this.playerlist[1].reflect_shield_charge ++;
	}
	if (this.playerlist[0].player.isBot()) {
		this.botAction(0);
	}
	if (this.playerlist[1].player.isBot()) {
		this.botAction(1);
	}
	this.countdown = 10;

	this.countdown_timer = setInterval(() => {
		this.broadcastCountDown();
		if (this.countdown == 0) {
			clearInterval(this.countdown_timer);
			this.countdown_timer = null;

			this.endTurn();
		}
		
		this.countdown --;
	}, 1000);
}

Table.prototype.checkEndTurn = function() {
	if (this.playerlist.length < 2)
		return;
	if (this.playerlist[0].action === '')
		return;
	if (this.playerlist[1].action === '')
		return;

	if (this.countdown_timer != null) {
		clearInterval(this.countdown_timer);
		this.countdown_timer = null;
		
		this.endTurn();
	}
}

Table.prototype.endTurn = function() {
	this.state = global.ROOM_STATUS.STOPPED;
	//this.broadcastNewState();

	this.checkGame();
	this.broadcastEndTurn();
	this.broadcastPlayers();

	setTimeout(() => {
		if (this.state != global.ROOM_STATUS.ENDED) {
			if (this.playerlist[0].health <= 0 || this.playerlist[1].health <= 0) // end game
				this.endGame();
			else
				this.newTurn();
		}
	}, 3000);
}

Table.prototype.checkGame = function() {
	var DAMAGE = 200;
	var REFLECT_DAMAGE = 200;
	var HEAL = 100;
	var HEAL_SHIELD = 100;

	if (this.playerlist[0].action === '') this.playerlist[0].action = SHOOT_ACTION; // set default action
	if (this.playerlist[1].action === '') this.playerlist[1].action = SHOOT_ACTION; // set default action
	var p1Action = this.playerlist[0].action;
	var p2Action = this.playerlist[1].action;

	//console.log('[Check Game]   p1Action = ' + p1Action + ', p2Action = ' + p2Action);
	//console.log('               p1Health = ' + this.playerlist[0].health + ', p2Health = ' + this.playerlist[1].health);

	if (p1Action === HEAL_SHIELD_ACTION) this.playerlist[0].heal_shield_charge --;
	if (p2Action === HEAL_SHIELD_ACTION) this.playerlist[1].heal_shield_charge --;
	if (p1Action === REFLECT_SHILED_ACTION) this.playerlist[0].reflect_shield_charge --;
	if (p2Action === REFLECT_SHILED_ACTION) this.playerlist[1].reflect_shield_charge --;

	switch (p1Action) {
		case SHOOT_ACTION:
			switch (p2Action) {
				case SHOOT_ACTION:
					this.playerlist[0].health -= DAMAGE;
					this.playerlist[1].health -= DAMAGE;
					break;
				case HEAL_ACTION:
					this.playerlist[1].health -= DAMAGE;
					this.playerlist[1].health += HEAL;
					break;
				case HEAL_SHIELD_ACTION:
					this.playerlist[1].health += HEAL_SHIELD;
					break;
				case REFLECT_SHILED_ACTION:
					this.playerlist[0].health -= REFLECT_DAMAGE;
					break;
			}
			break;
		case HEAL_ACTION:
			switch (p2Action) {
				case SHOOT_ACTION:
					this.playerlist[0].health -= DAMAGE;
					this.playerlist[0].health += HEAL;
					break;
				case HEAL_ACTION:
					this.playerlist[0].health += HEAL;
					this.playerlist[1].health += HEAL;
					break;
				case HEAL_SHIELD_ACTION:
					this.playerlist[0].health += HEAL;
					break;
				case REFLECT_SHILED_ACTION:
					this.playerlist[0].health += HEAL;
					break;
			}
			break;
		case HEAL_SHIELD_ACTION:
			switch (p2Action) {
				case SHOOT_ACTION:
					this.playerlist[0].health += HEAL_SHIELD;
					break;
				case HEAL_ACTION:
					this.playerlist[1].health += HEAL;
					break;
				case HEAL_SHIELD_ACTION:
					break;
				case REFLECT_SHILED_ACTION:
					break;
			}
			break;
		case REFLECT_SHILED_ACTION:
			switch (p2Action) {
				case SHOOT_ACTION:
					this.playerlist[1].health -= REFLECT_DAMAGE;
					break;
				case HEAL_ACTION:
					this.playerlist[1].health += HEAL;
					break;
				case HEAL_SHIELD_ACTION:
					break;
				case REFLECT_SHILED_ACTION:
					break;
			}
			break;
	}
	//console.log('[After Action] p1Health = ' + this.playerlist[0].health + ', p2Health = ' + this.playerlist[1].health);
}

Table.prototype.endGame = async function() {
	this.state = global.ROOM_STATUS.ENDED;
	if (this.countdown_timer != null) {
		clearInterval(this.countdown_timer);
		this.countdown_timer = null;
	}

	if (this.playerlist.length == 1) {
		roommanager.terminateRoom(this.roominfo.id);
		return;
	}

	if (this.playerlist[0].health <= 0 && this.playerlist[1].health <= 0) { // draw
		this.playerlist[0].player.refreshWinner('draw');
		this.playerlist[1].player.refreshWinner('draw');

		await userController.addScore(this.playerlist[0].player.playerinfo.name, 1);
		await userController.addScore(this.playerlist[1].player.playerinfo.name, 1);
	}
	else if (this.playerlist[0].health > 0) { // player1 won
		this.playerlist[0].player.refreshWinner('win');
		this.playerlist[1].player.refreshWinner('lose');

		await userController.addScore(this.playerlist[0].player.playerinfo.name, 3);
		await userController.addScore(this.playerlist[1].player.playerinfo.name, 0);
	}
	else { // player2 won
		this.playerlist[0].player.refreshWinner('lose');
		this.playerlist[1].player.refreshWinner('win');

		await userController.addScore(this.playerlist[0].player.playerinfo.name, 0);
		await userController.addScore(this.playerlist[1].player.playerinfo.name, 3);
	}

	await userController.refreshRanking();

	this.playerlist[0].player.leave();
	this.playerlist[1].player.leave();
	
	roommanager.terminateRoom(this.roominfo.id);
}

Table.prototype.findPlayerIndexById = function(pid) {
	for (var i = 0; i < this.playerlist.length; i ++) {
		if (this.playerlist[i].player.playerinfo.id === pid)
			return i;
	}
	return -1;
}

Table.prototype.botAction = function(index) {
	var p = this.playerlist[index];
	var actions = [SHOOT_ACTION, HEAL_ACTION, HEAL_SHIELD_ACTION, REFLECT_SHILED_ACTION];
	if (p.heal_shield_charge > 0) {
		if (utils.randomRange(0, 3) === 0)
			p.action = HEAL_SHIELD_ACTION;
	}
	if (p.action != '') return;
	if (p.reflect_shield_charge > 0) {
		if (utils.randomRange(0, 3) === 0)
			p.action = REFLECT_SHILED_ACTION;
	}
	if (p.action != '') return;
	p.action = actions[utils.randomRange(0, 2)];
}

Table.prototype.playerAction = function(id, action) {
	var i = this.findPlayerIndexById(id);
	if (i < 0) return false;
	var p = this.playerlist[i];
	if (action === HEAL_SHIELD_ACTION && p.heal_shield_charge <= 0) return false;
	if (action === REFLECT_SHILED_ACTION && p.reflect_shield_charge <= 0) return false;
	if (p.action != '') return false; // ignore, already take action
	p.action = action;

	this.checkEndTurn();
	return true;
}

Table.prototype.playerLeave = function(id) {
	var i = this.findPlayerIndexById(id);
	if (i < 0) return;
	this.playerlist[i].health = -1;
	if (this.playerlist[1 - i] != undefined)
		this.playerlist[1 - i].health = 1000;

	this.endGame();
}

Table.prototype.broadcast = function(header, packet) {
	global.io.sockets.in('r' + this.roominfo.id).emit(header, packet);
}

Table.prototype.playerList = function() {
	var plist = [];
	for (var i = 0; i < this.playerlist.length; i ++) {
		var p = this.playerlist[i];
		plist.push({
			id: p.player.playerinfo.id,
			name: p.player.playerinfo.name,
			health: p.health,
			heal_shield_charge: p.heal_shield_charge,
			reflect_shield_charge: p.reflect_shield_charge
		});
	}

	return plist;
}

Table.prototype.broadcastPlayers = function() {
	let emitdata = {
		players: this.playerList()
	}
	this.broadcast('REQ_GAME_PLAYERS', emitdata);
}

Table.prototype.broadcastNewState = function() {
	let emitdata = {
		state: this.state
	}
	this.broadcast('REQ_GAME_NEWSTATE', emitdata);
}

Table.prototype.broadcastCountDown = function() {
	let emitdata = {
		countdown: this.countdown
	}
	this.broadcast('REQ_GAME_COUNTDOWN', emitdata);
}

Table.prototype.broadcastEndTurn = function() {
	let emitdata = {
		p1Action: this.playerlist[0].action,
		p2Action: this.playerlist[1].action
	}
	this.broadcast('REQ_GAME_ENDTURN', emitdata);
}