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
  'applyMove': function(game, playerIndex, moveString) {
    // Make sure the move string is actually an integer.
    var move = parseInt(moveString);
    if (isNaN(move)) {
      return false;
    }
    // Make sure the move is in a valid location
    if (move < 0 || move >= 9 || game.board[move] != '.') {
      return false;
    }
    // Update the game's board to reflect this change.
    game.board[move] = playerSymbols[playerIndex];
  },
  'isGameOver': function(game) {
    // Check if there is no remaining empty tiles.
    if (game.board.indexOf('.') == -1) {
      return true;
    }
    // Check if anyone won the game
    return (findWinner(game.board)) != -1;
  }
};