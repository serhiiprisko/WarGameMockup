
var playermanager = require('./playermanager');

var max_bot_id = 0;

exports.createBot = function(room) {
    var player = playermanager.registerBot('bot' + max_bot_id);
    playermanager.joinRoom(room, player.id);

    max_bot_id ++;
}