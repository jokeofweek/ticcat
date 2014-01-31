var crypto = require('crypto');
var util = require('./util.js');

var games = {};

var counter = 0;


function generateTurnKey() {
  return crypto.createHash('md5').update('turn' + (counter++) + new Date().getTime() + '' + Math.round((Math.random() * 20000))).digest('hex');
};

function createGame(size) {
  var id = '';
  // Generate IDs until we hit one that isn't used.
  do {
    id = crypto.createHash('md5').update('game' + new Date().getTime() + '' + Math.round((Math.random() * 20000))).digest('hex');
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

function hasSpace(id) {
  return games[id].keys.length != 2;
}

function reserveSlot(id) {
  var key = generateTurnKey();

  // If there's no space, return null
  if (games[id].keys.length == 2) {
    return null;
  }

  games[id].keys.push(key);

  return {
    // The turn key for the player
    key: key,
    // The type of the player (circle is first connection)
    type: games[id].keys.length == 2 ? util.SLOT.CROSS : util.SLOT.CIRCLE
  };
}

function gameExists(id) {
  return games[id] ? true : false;
}

module.exports = {
  'createGame': createGame,
  'gameExists': gameExists,
  'reserveSlot': reserveSlot
};