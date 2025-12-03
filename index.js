'use strict';
let workspace = null;
let board = [['', '', ''], ['', '', ''], ['', '', '']];
let currentPlayer = 'X';
let gameOver = false;
let gameStated = false;
let computerDifficulty = 1;

let currentLevel = 1;

const levels = [
  {
    id: 1,
    name: "Level 1: The Edge Mistake",
    setup: () => {
      // Computer 'O' on side edge
      board[0][1] = 'O';
      computerDifficulty = 1; // Uses "Passive" AI
      updateBoard();
    },
    checkMove: (row, col) => {
      // Goal: Place X at Center (2, 2 -> index 1, 1)
      if (row === 1 && col === 1) {
        return { success: true, message: "Great job! You took the center." };
      } else {
        return { success: false, message: "You played on the edge! The center was open." };
      }
    },
    teachingPoint: "The center is key. If they miss it, take it!",
    hint: "Use `place_x_at(2, 2)`."
  },
  {
    id: 2,
    name: "Level 2: The Center Challenge",
    setup: () => {
      // Computer 'O' in Center
      board[1][1] = 'O';
      computerDifficulty = 1; // Uses "Passive" AI
      updateBoard();
    },
    checkMove: (row, col) => {
      // Goal: Place X in any Corner
      if ((row === 0 && col === 0) || (row === 0 && col === 2) || (row === 2 && col === 0) || (row === 2 && col === 2)) {
        return { success: true, message: "Smart move! Corners are safe." };
      } else {
        return { success: false, message: "Edges are dangerous when the center is taken!" };
      }
    },
    teachingPoint: "If the center is gone, grab a corner.",
    hint: "Try `place_x_at(1, 1)` or (3, 3)."
  },
  {
    id: 3,
    name: "Level 3: The Corner Trap",
    setup: () => {
      // Computer 'O' in a Corner
      board[0][0] = 'O';
      computerDifficulty = 1; // Uses "Passive" AI
      updateBoard();
    },
    checkMove: (row, col) => {
      // Goal: Check Center.
      if (row === 1 && col === 1) {
        return { success: true, message: "Perfect! You checked and took the center." };
      } else {
        return { success: false, message: "Always check the center first!" };
      }
    },
    teachingPoint: "Check the board state. If center is empty, take it.",
    hint: "Use `if` with `is_square_empty(2, 2)`."
  },
  {
    id: 4,
    name: "Level 4: Survival Mode",
    setup: () => {
      computerDifficulty = 3; // Semi-Smart
    },
    checkGameEnd: (winner) => {
      if (winner === 'X' || winner === 'Tie') {
         return { success: true, message: "You survived! Well done." };
      } else {
         return { success: false, message: "You lost. Prioritize blocking!" };
      }
    },
    teachingPoint: "Win > Block > Random.",
    hint: "Check for winning moves, then blocking moves."
  },
  {
    id: 5,
    name: "Level 5: The Grandmaster",
    setup: () => {
      computerDifficulty = 5; // Impossible
    },
    checkGameEnd: (winner) => {
      if (winner === 'Tie') {
        return { success: true, message: "Incredible! You forced a draw." };
      } else {
         return { success: false, message: "Perfect play requires a draw. Try again." };
      }
    },
    teachingPoint: "Optimal play leads to a Tie.",
    hint: "Don't make mistakes."
  }
];

function start() {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox-categories'),
    });
    loadLevel(1);
}

function loadLevel(levelId) {
    currentLevel = levelId;
    const level = levels[levelId - 1];
    document.getElementById('levelDisplay').innerText = level.name;
    updateJulesMessage(level.teachingPoint);
    restartGame();
}

function updateJulesMessage(msg) {
    document.getElementById('julesMessage').innerText = msg;
}

function restartGame() {
    board = [['', '', ''], ['', '', ''], ['', '', '']];
    currentPlayer = 'X'; 
    gameOver = false;
    gameStated = false;
    updateBoard();
    document.getElementById('status').innerText = "Your turn (X)";

    const level = levels[currentLevel - 1];
    if (level.setup) {
        level.setup();
    }

    if (currentLevel >= 4) {
       currentPlayer = 'O';
       document.getElementById('status').innerText = "Computer's turn (O)";
       computerMove();
    }
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
  let emptySquares = getEmptySquares();
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

        const level = levels[currentLevel - 1];

        // LOGIC CHECK FOR LEVELS 1-3
        if (currentLevel <= 3 && level.checkMove) {
            const result = level.checkMove(row, col);
            if (!result.success) {
                 updateJulesMessage(result.message + " " + (level.hint || ""));
                 // We let the game continue even on bad move, or we could stop?
                 // Let's let it continue but warn them.
            } else {
                 updateJulesMessage(result.message);
            }
        }

        if (checkWin('X')) {
            document.getElementById('status').innerText = 'You win!';
            gameOver = true;
            checkGameEnd('X');
        } else if (isBoardFull()) {
            document.getElementById('status').innerText = 'It\'s a draw!';
            gameOver = true;
            checkGameEnd('Tie');
        } else {
            currentPlayer = 'O';
            document.getElementById('status').innerText = "Computer's turn (O)";
            setTimeout(computerMove, 500);
        }
    } else {
        alert('Invalid move!');
    }
}

function checkGameEnd(winner) {
    const level = levels[currentLevel - 1];
    let success = false;
    
    // Levels 1-3: Must Win
    if (currentLevel <= 3) {
        if (winner === 'X') success = true;
    } 
    // Levels 4-5: Custom Logic
    else if (level.checkGameEnd) {
        const result = level.checkGameEnd(winner);
        success = result.success;
        updateJulesMessage(result.message);
    }

    if (success) {
         setTimeout(() => {
            if (currentLevel < 5) {
                if (confirm("Level Complete! Proceed to Level " + (currentLevel + 1) + "?")) {
                    loadLevel(currentLevel + 1);
                }
            } else {
                 alert("You are a Grandmaster! Curriculum Complete.");
            }
        }, 500);
    } else if (currentLevel <= 3 && winner !== 'X') {
        updateJulesMessage("Level Failed. You must WIN this level. Restarting...");
        setTimeout(() => loadLevel(currentLevel), 1500);
    }
}

function computerMove() {
  if (gameOver) return;

  let move = null;

  // STRATEGY SELECTION
  if (currentLevel <= 3) {
      // PASSIVE AI: Intentionally plays badly to allow forks/wins
      move = getWorstMove();
  } else {
      // COMPETITIVE AI: Levels 4 & 5
      let optimalChance = (computerDifficulty - 1) * 0.25; 
      if (Math.random() < optimalChance) {
        move = getBestMove(); // Minimax
      } else {
        move = getRandomMove();
      }
  }

  // Execute Move
  if (move) {
    board[move.r][move.c] = 'O';
    updateBoard();
    if (checkWin('O')) {
      document.getElementById('status').innerText = 'Computer wins!';
      gameOver = true;
      checkGameEnd('O');
    } else if (isBoardFull()) {
      document.getElementById('status').innerText = 'It\'s a draw!';
      gameOver = true;
      checkGameEnd('Tie');
    } else {
      currentPlayer = 'X';
      document.getElementById('status').innerText = "Your turn (X)";
    }
  }
}

// --- AI HELPERS ---

function getEmptySquares() {
  let empty = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === '') empty.push({r, c});
    }
  }
  return empty;
}

function getRandomMove() {
    let empty = getEmptySquares();
    if (empty.length > 0) return empty[Math.floor(Math.random() * empty.length)];
    return null;
}

// PASSIVE AI (Ensures user can win/fork)
function getWorstMove() {
    let empty = getEmptySquares();
    if (empty.length === 0) return null;

    // Filter out moves that would BLOCK the player (we WANT the player to win)
    let safeMoves = empty.filter(m => {
        // Does playing here stop X from winning?
        board[m.r][m.c] = 'X'; 
        let blocksWin = checkWin('X');
        board[m.r][m.c] = ''; // Undo
        return !blocksWin;
    });

    // Filter out moves that would make Computer WIN (we don't want to win)
    let badMoves = (safeMoves.length > 0 ? safeMoves : empty).filter(m => {
        board[m.r][m.c] = 'O';
        let winsGame = checkWin('O');
        board[m.r][m.c] = '';
        return !winsGame;
    });

    // If we have moves that don't block and don't win, pick one.
    if (badMoves.length > 0) {
        return badMoves[Math.floor(Math.random() * badMoves.length)];
    }
    
    // Fallback: Just random
    return empty[Math.floor(Math.random() * empty.length)];
}

// MINIMAX (Unbeatable)
function getBestMove() {
  let bestScore = -Infinity;
  let move = null;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === '') {
        board[r][c] = 'O';
        let score = minimax(board, 0, false);
        board[r][c] = ''; 
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
            if (board[r][c] === '') return false;
        }
    }
    return true;
}

function isSquareEmpty(row, col) {
    row -= 1; col -= 1;
    return row >= 0 && row < 3 && col >= 0 && col < 3 && board[row][col] === '';
}

function updateBoard() {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let cell = document.querySelector(`.cell[data-row="${r+1}"][data-col="${c+1}"]`);
            cell.innerText = board[r][c];
        }
    }
}
