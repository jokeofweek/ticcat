var crypto = require('crypto');
var util = require('./util.js');

var games = {};

function createGame(size) {
  var id = '';
  // Generate IDs until we hit one that isn't used.
  do {
    id = crypto.createHash('md5').update(new Date().getTime() + '' + Math.round((Math.random() * 20000))).digest('hex');
  } while (games[id]);

  games[id] = {
    // The actual game board
    board: util.createBoard(size),
    // If it is circle's turn
    isCircleTurn: true,
    // The turn keys (the first represents the turn that we are waiting for).
    // If less than 2 turn keys, than not all players are connected.
    keys: []
  };

  return id;
}

function gameExists(id) {
  return games[id] ? true : false;
}

module.exports = {
  'createGame': createGame,
  'gameExists': gameExists
};