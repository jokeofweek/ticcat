var Constants = require('./constants.js');
var GameStore = require('./gamestore.js');

function sendError(res, error, code) {
  code = code || 400;
  res.send(code, {type: 'error', value: error});
}

function send(res, obj, code) {
  code = code || 200;
  res.send(code, {type: 'ok', value: obj});
}

function createRoute(req, res) {
  var id = GameStore.createGame(parseInt(req.params.size));
  send(res, {id: id});
}

function connectRoute(req, res) {
  var gameId = req.params.gameId;
  var reserveResult = GameStore.reserveSlot(gameId);
  if (reserveResult) {
    // Reserve a slot in the game.
    send(res, reserveResult);
  } else {
    sendError(res, 'No open player slots.');
  }
}

function statusRoute(req, res) {
  var gameId = req.params.gameId;
  send(res, GameStore.getGameStatus(gameId));
};

var setupRoutes = function(app) {
  // Only accept numeric sizes
  app.param('size', function(req, res, next, size) {
    var parsedSize = parseInt(size);
    if (isNaN(parsedSize)) {
      sendError(res, 'Non-numeric size.');
    } else if (parsedSize < Constants.MIN_SIZE || parsedSize > Constants.MAX_SIZE) {
      sendError(res, 'Size out of range. Allowable board sizes: [' + Constants.MIN_SIZE + ', ' + Constants.MAX_SIZE + ']');
    } else {
      next();
    }
  });

  // Only accept game IDs which exist
  app.param('gameId', function(req, res, next, gameId) {
    if (GameStore.gameExists(gameId)) {
      next();
    } else {
      sendError(res, 'Game does not exist.');
    }
  });

  app.get('/create/:size', createRoute);
  app.get('/connect/:gameId', connectRoute);
  app.get('/status/:gameId', statusRoute);
};

module.exports = {
  'setupRoutes': setupRoutes
};