var Constants = require('./constants.js');

var SLOT = {
  NOTHING: '.',
  CIRCLE: "o",
  CROSS: "x"
};
Object.freeze(SLOT);

var WIN_RESULT = {
  CIRCLE: 2,
  CROSS: 3,
  DRAW: 1
};

Object.freeze(WIN_RESULT);

var createBoard = function(size) {
  var board = [];
  // Create board entry for each block (size * size blocks)
  for (var i = 0 ; i < size; i++) {
    for (var j =0; j < size; j++) {
      board.push(SLOT.NOTHING);
    }
  }

  return board;
};


// Create callbacks for checking along a row. We only need one instance of these
// as they are pure functions. We need one for each row.
var rowCallbacks = [];
for (var i = 0; i < Constants.MAX_SIZE; i++) {
  (function(row) {
    rowCallbacks.push(function(board, size, x) {
      console.log((row * size) + x);
      return board[(row * size) + x];
    });
  })(i);
}
// Similar thing for column callbacks
var columnCallbacks = [];
for (var i = 0; i < Constants.MAX_SIZE; i++) {
  (function(col) {
    columnCallbacks.push(function(board, size, x) {
      return board[(x * size) + col];
    });
  })(i);
}
// Top left to bottom right diagonal
var leftDiagCallback = function(board, size, i) {
  return board[(i * size) + i];
}
// Top right to bottom left diagonal
var rightDiagCallback = function(board, size, i) {
  return board[((i + 1) * size) - i - 1];
} 

/**
 * This function checks along a pattern to test whether every cell
 * matches the leading cell. This allows us to encapsulate checking
 * along a row or column. If so, then we return the appropriate win result.
 */
var winResult = function(board, size, callback) {
  var lead = callback(board, size, 0);
  if (lead == SLOT.NOTHING) return false;

  // Iterate through every position along the pattern
  for (var i = 1; i < size; i++) {
    if (callback(board, size, i) != lead) return false;
  }
  return lead == SLOT.CROSS ? WIN_RESULT.CROSS : WIN_RESULT.CIRCLE;
};

var getWinResult = function(board) {
  var size = Math.sqrt(board.length);
  var winner;

  // Iterate through each row/col, trying to find a winner
  for (var i = 0; i < size; i++) {
    winner = winResult(board, size, rowCallbacks[i]);
    if (winner) return winner;
    winner = winResult(board, size, columnCallbacks[i]);
    if (winner) return winner;
  }

  winner = winResult(board, size, leftDiagCallback);
  if (winner) return winner;
  winner = winResult(board, size, rightDiagCallback);
  if (winner) return winner;

  // If there is no winner at this point, then we need to iterate through
  // all cells and check for an empty spot. If there are none, then we draw
  for (var i = 0; i < board.length; i++) {
    if (board[i] == SLOT.NOTHING) return null;
  }

  return WIN_RESULT.DRAW;
};

var formatBoard = function(board) {
  var str = '';
  var size = Math.sqrt(board.length);
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      str += board[(i * size) + j];
    } 
    str += "\n";
  }
  return str;
};

module.exports = {
  'createBoard': createBoard,
  'getWinResult': getWinResult,
  'formatBoard': formatBoard,
  'SLOT': SLOT,
  'WIN_RESULT': WIN_RESULT
};