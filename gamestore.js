var crypto = require('crypto');
var fs = require('fs');

var games = {};
var gameTypes = {};

var counter = 0;

var STATUS = {
  SETUP: 'setup',
  PLAYING: 'playing',
  DRAW: 'draw',
  WIN: 'win'
};
Object.freeze(STATUS);

function generateTurnKey() {
  return crypto.createHash('md5').update('turn' + (counter++) + new Date().getTime() + '' + Math.round((Math.random() * 20000))).digest('hex');
};

module.exports = {
  /**
   * Instantiates all of the game types.
   */
  'loadGameTypes': function() {
    fs.readdirSync('./games/').forEach(function(file) {
      // Load the game and add it to the game types object.
      console.log("Loading game: " + file);
      var loaded = require('./games/' + file);
      gameTypes[loaded.gameName] = loaded;
    });
  },
  /**
   * This function instantiates a new game of a given type.
   * @param  {string} type The type of the game
   * @return {string?}      The ID of the game if it was succesfully created,
   *                            else null if no such game type exists.
   */
  'createGame': function(type) {
    // Make sure the type exists, else we have an error
    if (!gameTypes[type]) {
      return null;
    }

    // Generate the game ID.
    var id = '';
    // Generate IDs until we hit one that isn't used.
    do {
      id = crypto.createHash('md5').update('game' + new Date().getTime() + '' + Math.round((Math.random() * 20000))).digest('hex');
    } while (games[id]);

    // Create the actual game
    games[id] = {
      type: type,
      // The array of player turn keys
      keys: [],
      // The index of the current player, or if the game has been won,
      // the index of the winner.
      currentPlayer: 0,
      // The status of the game
      status: STATUS.SETUP,
      // The actual state
      state: gameTypes[type].createGame()
    }

    return id;
  },
  /**
   * Tests whether a given game actually exists
   * @param  {string} gameId The ID of the game.
   * @return {boolean}        True if a game exists with that gameId, else false
   */
  'gameExists': function(gameId) {
    return games[gameId] ? true : false;
  },
  /**
   * This function attempts to reserve a player slot in a game.
   * @param  {string} gameId The ID of the game
   * @return {object?}        Either an object containing the key and the
   *                                 player number, or null if there was no space.
   */
  'reserveSlot': function(gameId) {
    // Make sure there is space for another player
    if (games[gameId].keys.length == gameTypes[games[gameId].type].totalPlayers) {
      return null;
    }

    // Keep on generating a turnkey until we find an unused one
    var key;
    do {
      key = generateTurnKey();
    } while (games[gameId].keys.indexOf(key) != -1);

    // Add it to the set of keys
    games[gameId].keys.push(key);

    // If there are no more keys, update it to playing.
    if (games[gameId].keys.length == gameTypes[games[gameId].type].totalPlayers) {
      games[gameId].status = STATUS.PLAYING;
    }

    var playerIndex =  games[gameId].keys.length - 1;
    return {
      // The turn key for the player
      key: key,
      // The number of the player
      playerIndex: playerIndex,
      // The symbol of the player
      playerSymbol: gameTypes[games[gameId].type].getPlayerSymbol(playerIndex)
    };
  },
  /**
   * Fetches the given game status for a player.
   * @param  {string} gameId  The ID of the game.
   * @param  {string} turnKey The turn key of the player
   * @return {object?}         An object describing the current game state
   *                              for that player, or null if there is no such
   *                              player.
   */
  'getGameStatus': function(gameId, turnKey) {
    // Ensure the turnkey is valid.
    if (games[gameId].keys.indexOf(turnKey) == -1) {
      return null;
    }

    // Build the basic status object.
    var obj = {
      status: games[gameId].status,
      state: gameTypes[games[gameId].type].getStatus(games[gameId].state, turnKey)
    };

    // If the game is playing, we need to add the current player.
    if (games[gameId].status == STATUS.PLAYING) {
      obj.currentPlayer = games[gameId].currentPlayer
    }

    // If the game is over, we need to add the winning player.
    if (games[gameId].status == STATUS.WIN) {
      obj.winningPlayer = games[gameId].currentPlayer;
    }
    
    return obj;
  },
  /**
   * Checks whether it is a given player's turn to play in a game.
   * @param  {string} gameId  The game ID.
   * @param  {string} turnKey The turn key for that player.
   * @return {boolean}         True if it is that player's turn to play, else false.
   */
  'isTurn': function(gameId, turnKey) {
    return games[gameId].status == STATUS.PLAYING &&
        games[gameId].keys.indexOf(turnKey) == games[gameId].currentPlayer;
  },
  /**
   * This function allows a player to make a move for a given game.
   * @param  {string} gameId     The game ID.
   * @param  {string} turnKey    The turn key for the player.
   * @param  {string} moveString The string representing the move.
   * @return {boolean}            True if the move was valid, else false.
   */
  'applyMove': function(gameId, turnKey, moveString) {
    var game = games[gameId];
    var gameType = gameTypes[game.type];
    // Try to apply the move
    if (!gameType.applyMove(game.state, game.keys.indexOf(turnKey),
        moveString)) {
      return false;
    }

    // Check if the game is over, updating accordingly
    if (gameType.isGameOver(game.state)) {
      // Set the winner if there is one
      game.currentPlayer = gameType.getWinner(game.state);
      game.status = (game.currentPlayer != -1) ? 
          STATUS.WIN : STATUS.DRAW;
    } else {
      // Simply move on to the next player
      game.currentPlayer = gameType.getNextPlayer(games[gameId].currentPlayer);
    }

    // Move was succesfully applied!
    return true;
  }
}