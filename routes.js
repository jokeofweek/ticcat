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
  // Attempt to create a new game.
  var id = GameStore.createGame(req.params.type);
  if (!id) {
    sendError(res, 'Invalid game type.');
  } else {
    send(res, {id: id});
  }
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
  send(res, GameStore.getGameStatus(req.params.gameId, req.params.turnKey));
};

function moveRoute(req, res) {
  // Ensure it is the right turn
  if (!GameStore.isTurn(req.params.gameId, req.params.turnKey)) {
    sendError(res, 'It is not currently your turn or the auth key was invalid.');
    return;
  } 

  // Try to apply the move
  if (GameStore.applyMove(req.params.gameId, req.params.turnKey, req.params.move)) {
    send(res, GameStore.getGameStatus(req.params.gameId));
  } else {
    sendError(res, 'The move was not valid.');
  }
};

var setupRoutes = function(app) {
  // Load the games
  GameStore.loadGameTypes();

  // Only accept game IDs which exist
  app.param('gameId', function(req, res, next, gameId) {
    if (GameStore.gameExists(gameId)) {
      next();
    } else {
      sendError(res, 'Game does not exist.');
    }
  });

  app.get('/create/:type', createRoute);
  app.get('/connect/:gameId', connectRoute);
  app.get('/status/:gameId/:turnKey', statusRoute);
  app.get('/move/:gameId/:turnKey/:move', moveRoute);
};

module.exports = {
  'setupRoutes': setupRoutes
};