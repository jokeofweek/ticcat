var crypto = require('crypto');
var util = require('./util.js');

var GAME_STATUS = {
  WIN_CIRCLE: 'win-o',
  WIN_CROSS: 'win-x',
  DRAW: 'draw',
  WAITING_CIRCLE: 'waiting-o',
  WAITING_CROSS: 'waiting-x',
  SETUP: 'setup'
};
Object.freeze(GAME_STATUS);

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
    // The turn keys (the first represents the turn that we are waiting for).
    // If less than 2 turn keys, than not all players are connected.
    keys: [],
    // The status of the game.
    status: GAME_STATUS.SETUP
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

  // If both slots are taken, change the status to waiting for circle move
  if (games[id].keys.length == 2) {
    games[id].status = GAME_STATUS.WAITING_CIRCLE;
  }

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

function getGameStatus(id) {
  return {
    board: util.formatBoard(games[id].board),
    status: games[id].status
  };
}

module.exports = {
  'createGame': createGame,
  'gameExists': gameExists,
  'reserveSlot': reserveSlot,
  'getGameStatus': getGameStatus
};