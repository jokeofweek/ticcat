var playerSymbols = ['o', 'x'];

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

module.exports = {
  'gameName': 'tictactoe',
  'totalPlayers': 2,
  'createGame': function() {
    return {
      'board': ['.','.','.','.','.','.','.','.','.']
    };
  },
  'getNextPlayer': function(playerIndex) {
    return (playerIndex + 1) % 2;
  },
  'getPlayerSymbol': function(playerIndex) {
    return playerSymbols[playerIndex];
  },
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
  'isGameOver': function(gameState) {
    // Check if there is no remaining empty tiles.
    if (gameState.board.indexOf('.') == -1) {
      return true;
    }
    // Check if anyone won the gameState
    return (findWinner(gameState.board)) != -1;
  },
  'getWinner': function(gameState) {
    return findWinner(gameState.board);
  },
  'getStatus': function(gameState, turnKey) {
    return {
      'board': gameState.board.join('')
    }
  }
};