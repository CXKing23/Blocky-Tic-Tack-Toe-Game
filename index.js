'use strict';
let workspace = null;
let board = [['', '', ''], ['', '', ''], ['', '', '']];
let currentPlayer = 'X';
let gameOver = false;
let gameStated = false;
let computerDifficulty = 1;

function start() {
    // Create main workspace.
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox-categories'),
    });
    restartGame();
}

function restartGame() {
    board = [['', '', ''], ['', '', ''], ['', '', '']];
    currentPlayer = 'X';
    gameOver = false;
    gameStated = false;
    updateBoard();
    document.getElementById('status').innerText = "Your turn (X)";
}

function runCode() {
    if (gameOver) return;
    if (gameStated) return;
    gameStated = true;
    window.LoopTrap = 1000;
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP =
        'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
    var code = javascript.javascriptGenerator.workspaceToCode(workspace);
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP = null;
    try {
        eval(code);
    } catch (e) {
        alert(e);
    }
}

function setDifficulty(diff) {
  computerDifficulty = parseInt(diff);
}

function placeRandomX() {
  if (gameOver) return;
  let emptySquares = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === '') {
        emptySquares.push({r, c});
      }
    }
  }
  
  if (emptySquares.length > 0) {
    let move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    placeX(move.r + 1, move.c + 1); 
  }
}

function placeX(row, col) {
    if (gameOver) return;
    row -= 1;
    col -= 1;
    if (row >= 0 && row < 3 && col >= 0 && col < 3 && board[row][col] === '') {
        board[row][col] = 'X';
        updateBoard();
        if (checkWin('X')) {
            document.getElementById('status').innerText = 'You win!';
            gameOver = true;
        } else if (isBoardFull()) {
            document.getElementById('status').innerText = 'It\'s a draw!';
            gameOver = true;
        } else {
            currentPlayer = 'O';
            document.getElementById('status').innerText = "Computer's turn (O)";
            computerMove();
        }
    } else {
        alert('Invalid move!');
    }
}

function isSquareEmpty(row, col) {
    row -= 1;
    col -= 1;
    return row >= 0 && row < 3 && col >= 0 && col < 3 && board[row][col] === '';
}

function computerMove() {
  if (gameOver) return;

  // Calculate probability of playing optimally
  // Level 1 (1-1)*0.25 = 0.0  (0% optimal, 100% random)
  // Level 5 (5-1)*0.25 = 1.0  (100% optimal, 0% random)
  let optimalChance = (computerDifficulty - 1) * 0.25;
  let shouldPlayOptimally = Math.random() < optimalChance;

  let move = null;

  if (shouldPlayOptimally) {
    move = getBestMove();
  }

  // Fallback to random if not playing optimally OR if optimal failed (shouldn't happen unless full)
  if (!move) {
    let emptySquares = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === '') {
          emptySquares.push({r, c});
        }
      }
    }
    if (emptySquares.length > 0) {
      move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
  }

  if (move) {
    board[move.r][move.c] = 'O';
    updateBoard();
    if (checkWin('O')) {
      document.getElementById('status').innerText = 'Computer wins!';
      gameOver = true;
    } else if (isBoardFull()) {
      document.getElementById('status').innerText = 'It\'s a draw!';
      gameOver = true;
    } else {
      currentPlayer = 'X';
      document.getElementById('status').innerText = "Your turn (X)";
    }
  }
}

// NEW: Minimax Algorithm helper functions
function getBestMove() {
  let bestScore = -Infinity;
  let move = null;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === '') {
        board[r][c] = 'O';
        let score = minimax(board, 0, false);
        board[r][c] = ''; // Undo move
        if (score > bestScore) {
          bestScore = score;
          move = { r, c };
        }
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  if (checkWin('O')) return 10 - depth;
  if (checkWin('X')) return depth - 10;
  if (isBoardFull()) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === '') {
          board[r][c] = 'O';
          let score = minimax(board, depth + 1, false);
          board[r][c] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === '') {
          board[r][c] = 'X';
          let score = minimax(board, depth + 1, true);
          board[r][c] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
}

function checkWin(player) {
    // Check rows, columns, and diagonals
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === player && board[i][1] === player && board[i][2] === player) return true;
        if (board[0][i] === player && board[1][i] === player && board[2][i] === player) return true;
    }
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
    return false;
}

function isBoardFull() {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === '') {
                return false;
            }
        }
    }
    return true;
}

function updateBoard() {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let cell = document.querySelector(`.cell[data-row="${r+1}"][data-col="${c+1}"]`);
            cell.innerText = board[r][c];
        }
    }
}