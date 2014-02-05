/**
 * This class represents a sample game which can be loaded into the Ticcat
 * server.
 */

var playerSymbols = ['o', 'x'];


module.exports = {
  /**
   * This is the name of the game. This should be unique among all games
   * installed on a server. This key would be used in the /create/<key> URL.
   */
  'gameName': 'tictactoe',
  /**
   * This is the number of players that are required for a game.
   */
  'totalPlayers': 2,
  /**
   * This function creates a new game at the initial state. In our case,
   * it is an empty tic-tac-toe board.
   * @return {object} An object representing the game state.
   */
  'createGame': function() {
    return {
      'board': ['.','.','.','.','.','.','.','.','.']
    };
  },
  /**
   * This handles transitioning from one player to the next.
   * @param  {int} playerIndex The player whose current turn it is.
   * @return {int}             The player whose turn is next.
   */
  'getNextPlayer': function(playerIndex) {
    return (playerIndex + 1) % 2;
  },
  /**
   * This applies a player's move to the game state. 
   * @param  {object} gameState   The current game state to be updated.
   * @param  {int} playerIndex The player who is applying the turn.
   * @param  {string} moveString  The string representing the move.
   * @return {boolean}             True if the move was valid, else false.
   */
  'applyMove': function(gameState, playerIndex, moveString) {
    // Make sure the move string is actually an integer.
    var move = parseInt(moveString);
    if (isNaN(move)) {
      return false;
    }
    // Make sure the move is in a valid location
    if (move < 0 || move >= 9 || gameState.board[move] != '.') {
      return false;
    }
    // Update the gameState's board to reflect this change.
    gameState.board[move] = playerSymbols[playerIndex];
    return true;
  },
  /**
   * Checks whether a given game is over based on the state.
   * @param  {object} gameState The state of the game.
   * @return {boolean}           True if the game is over, else false.
   */
  'isGameOver': function(gameState) {
    // Check if there is no remaining empty tiles.
    if (gameState.board.indexOf('.') == -1) {
      return true;
    }
    // Check if anyone won the gameState
    return (findWinner(gameState.board)) != -1;
  },
  /**
   * Fetches the winner of a game state if there is one.
   * @param  {object} gameState The game state.
   * @return {int}           The index of the winner if there was one, else -1.
   */
  'getWinner': function(gameState) {
    return findWinner(gameState.board);
  },
  /**
   * Formats a game state for a given player. This is particularly important
   * for games where you can't observe the entire state (eg. you should only
   * see your cards).
   * @param  {object} gameState The state of the game.
   * @param  {int} playerIndex   The index of the player.
   * @return {object}           An object which is sent to the player
   *                               when they access /status/<game-id>/<turn-key>
   */
  'getStatus': function(gameState, playerIndex) {
    return {
      'board': gameState.board.join('')
    }
  }
};


function findWinner(board) {
  for (var i = 0; i < 3; i++) {
    // Check along every row
    if (board[3 * i] == board[(3 * i) + 1] && 
        board[3 * i] == board[(3 * i) + 2] &&
        board[3 * i] != '.') {
      return playerSymbols.indexOf(board[0]);  
    }
    // Check along every column
    if (board[i] == board[i + 3] &&
        board[i] == board[i + 6] &&
        board[i] != '.') {
      return playerSymbols.indexOf(board[0]);  
    }
  }
  
  // Check diagonals
  if (board[0] == board[4] && board[4] == board[8] && board[0] != '.') {
    return playerSymbols.indexOf(board[0]);
  }
  if (board[2] == board[4] && board[4] == board[6] && board[2] != '.') {
    return playerSymbols.indexOf(board[2]);
  }

  // No winner
  return -1;
}