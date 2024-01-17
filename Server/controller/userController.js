
var User = require('../models/users');
var logger = require('node-color-log');
var playerlist = require('../global').playerlist;

exports.refreshRanking = async function() {
  for (var i = 0; i < playerlist.length; i ++) {
    var p = playerlist[i];
    if (p.alive === true && p.player.isBot() === false) {
      p.socket.emit('REQ_PLAYER_RANK_RESULT', {rank: await exports.getRank(p.name)});
    }
  }
}

exports.getRank = async function(user) {
  try {
    const oneUser = await User.findOne({user: user});
    if (oneUser === null)
      return 0;
    var rank = await User.find({score: {$gt: oneUser.score}}).countDocuments() + 1
    return rank;
  } catch (err) {
    logger.error(err);
    return -1;
  }
}

exports.addScore = async function(user, score) {
  try {
    const oneUser = await User.findOne({user: user});
    if (oneUser === null) {
      var newUser = new User ({
        user: user,
        score: score
      });
      await newUser.save();
    }
    else {
      await oneUser.updateOne({
        score: oneUser.score + score
      });
    }
  } catch (err) {
    logger.error(err);
  }
}