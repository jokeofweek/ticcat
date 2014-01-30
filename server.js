var util = require('./util.js');

var board = util.createBoard(4);

var i = 0;
board[0] = util.SLOT.CROSS;
board[5] = util.SLOT.CROSS;
board[10] = util.SLOT.CROSS;
board[15] = util.SLOT.CROSS;

console.log(util.formatBoard(board));
console.log(util.getWinResult(board));