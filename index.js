'use strict';
let workspace = null;
let boards = []; // Array of 4 boards: each is 3x3
let lastPlayerMoves = [null, null, null, null]; // Track last move per board {r, c}
let currentBoardIndex = 0; // Index of the board currently being operated on by user logic
let currentPlayer = 'X';
let gameStated = false;
let isExecuting = false;

let computerDifficulty = 1;

let currentLevel = 1;
let playerMoved = false; // Tracks if user placed X successfully
let secretsUnlocked = false; // Tracks if secrets are unlocked

const levels = [
  {
    id: 1,
    name: "Level 1: The Center Strike",
    setup: () => {
      // 4 boards, different edge taken
      boards[0][0][1] = 'O';
      boards[1][1][2] = 'O';
      boards[2][2][1] = 'O';
      boards[3][1][0] = 'O';
      computerDifficulty = 1;
    },
    checkMove: (row, col) => {
      if (row === 1 && col === 1) {
        return { success: false, message: "Bullseye! You took the center on all boards. But the game isn't over—prove you can convert this advantage into a WIN." };
      } else {
        return { success: false, message: "Focus! On at least one board, you ignored the open center. If the middle is free, take it!" };
      }
    },
    checkGameEnd: (winner) => {
      if (winner === 'X') {
         return { success: true, message: "Flawless victory! You dominated the center and cleaned up the rest. Your logic is solid." };
      } else {
         return { success: false, message: "You had the advantage, but you let it slip! You must win EVERY board to pass." };
      }
    },
    teachingPoint: "Welcome to the Simul! I've rotated the board four times. In every case, they gave up the Center. If they take the edge, you punish them by seizing the middle! Write one logic to conquer all four boards.",
    hints: [
       {text: "The center is Row 2, Col 2."},
       {text: "Use 'place_x_at(2, 2)'."}
    ],
    solution: "place_x_at(2, 2);"
  },
  {
    id: 2,
    name: "Level 2: The Corner Defense",
    setup: () => {
      for(let i=0; i<4; i++) {
        boards[i][1][1] = 'O';
      }
      computerDifficulty = 1;
    },
    checkMove: (row, col) => {
      if ((row === 0 && col === 0) || (row === 0 && col === 2) || (row === 2 && col === 0) || (row === 2 && col === 2)) {
        return { success: false, message: "Good defense! You secured a corner. Now, the hard part begins: Maneuver your way to a WIN." };
      } else {
        return { success: false, message: "Trap detected! You played an edge piece. Against a center start, that's game over. Reset and take a corner!" };
      }
    },
    checkGameEnd: (winner) => {
      if (winner === 'X') {
         return { success: true, message: "Textbook defense! You neutralized their center advantage and turned it into a win. Impressive." };
      } else {
         return { success: false, message: "Close, but 'almost' doesn't compile. You need a clean sweep on all four boards." };
      }
    },
    teachingPoint: "They took the Center! Don't panic. If the center is gone, the Corners are your fortress. Never play an edge against a center start, or you'll get trapped.",
    hints: [
      {text: "Corners are (1,1), (1,3), (3,1), (3,3)."},
      {text: "Use 'place_x_at(1, 1)'."}
    ],
    solution: "place_x_at(1, 1);"
  },
  {
    id: 3,
    name: "Level 3: The Trap Check",
    setup: () => {
      boards[0][0][0] = 'O';
      boards[1][0][2] = 'O';
      boards[2][2][2] = 'O';
      boards[3][2][0] = 'O';
      computerDifficulty = 1;
    },
    checkMove: (row, col) => {
      if (row === 1 && col === 1) {
        return { success: false, message: "Gotcha! You caught them leaving the center open. Now, finish the job. WIN the game." };
      } else {
        return { success: false, message: "Missed opportunity! The center was right there. Always check the most valuable square first." };
      }
    },
    checkGameEnd: (winner) => {
      if (winner === 'X') {
         return { success: true, message: "Sharp eyes! You recognized the state of the board and adapted. That's real coding." };
      } else {
         return { success: false, message: "You let them off the hook. When you have the advantage, you must close out the game." };
      }
    },
    teachingPoint: "Eyes open! Sometimes they start in a corner. That leaves the Center wide open. Use an if block: Check if the center is free. If it is, TAKE IT!",
    hints: [
       {text: "Check if (2,2) is empty."},
       {text: "Use 'if is_square_empty(2, 2) do place_x_at(2, 2)'."}
    ],
    solution: "if (isSquareEmpty(2, 2)) {\n  placeX(2, 2);\n} else {\n  placeX(1, 3);\n}"
  },
  {
    id: 4,
    name: "Level 4: Survival Mode",
    setup: () => {
      computerDifficulty = 3;
    },
    checkGameEnd: (winner) => {
      if (winner === 'X' || winner === 'Tie') {
         return { success: true, message: "Solid as a rock! You survived the onslaught on all four fronts. You're ready for the final test." };
      } else {
         return { success: false, message: "Shields down! You survived on some boards, but the AI broke through on one. Your defense must be universal." };
      }
    },
    teachingPoint: "Training wheels are off. The AI is smarter now. You might not win every time, but you cannot lose. Block their winning moves. Force a Tie or steal a Win.",
    hints: [
      {text: "Check for a winning move using 'checkWin' logic (manual checks)."},
      {text: "If no win, check if opponent has a winning move and block it."},
      {text: "Use 'place_x_random()' as a last resort."}
    ],
    solution: "// Complex logic omitted for brevity in variables, but user should implement priority."
  },
  {
    id: 5,
    name: "Level 5: The Grandmaster",
    setup: () => {
      computerDifficulty = 5;
    },
    checkGameEnd: (winner) => {
      if (winner === 'Tie') {
        return { success: true, message: "Absolute perfection. You held your ground against a perfect opponent 4 times in a row. You are a Grandmaster!" };
      } else if (winner === 'X') {
         return { success: true, message: "Impossible! You beat the Grandmaster?" };
      } else {
         return { success: false, message: "The Grandmaster found a gap in your logic. One mistake is all it takes. Try again!" };
      }
    },
    teachingPoint: "The Grandmaster doesn't make mistakes. A win here is impossible if they play perfectly. Your goal is perfection: Force a Draw. Do not lose.",
    hints: [
      {text: "Do NOT use 'place_x_random'."},
      {text: "Use 'repeat until has player moved?' loop."},
      {text: "Inside loop, iterate through cells to find the best move."}
    ],
    solution: "// Minimax or perfect heuristic needed."
  }
];

function start() {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox-categories'),
    });
    workspace.registerToolboxCategoryCallback('HINTS', hintsCallback);
    workspace.registerToolboxCategoryCallback('SECRETS', secretsCallback);
    initBoardsDOM();
    loadLevel(1);
}

function initBoardsDOM() {
    const container = document.getElementById('boardsContainer');
    container.innerHTML = '';
    for(let i=0; i<4; i++) {
        const boardDiv = document.createElement('div');
        boardDiv.id = `board${i}`;
        boardDiv.className = 'board';
        for(let r=1; r<=3; r++) {
            for(let c=1; c<=3; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                boardDiv.appendChild(cell);
            }
        }
        container.appendChild(boardDiv);
    }
}

function hintsCallback(workspace) {
  const level = levels[currentLevel - 1];
  const xmlList = [];
  if (level && level.hints) {
    level.hints.forEach(hint => {
       const label = document.createElement('label');
       label.setAttribute('text', hint.text);
       xmlList.push(label);
       const sep = document.createElement('sep');
       sep.setAttribute('gap', '10');
       xmlList.push(sep);
    });
  }
  return xmlList;
}

function secretsCallback(workspace) {
  const xmlList = [];
  if (secretsUnlocked) {
    const level = levels[currentLevel - 1];
    const label = document.createElement('label');
    label.setAttribute('text', "Solution for Level " + currentLevel + ":");
    xmlList.push(label);
    if (level && level.solution) {
        const solLabel = document.createElement('label');
        solLabel.setAttribute('text', level.solution);
        xmlList.push(solLabel);
    } else {
         const solLabel = document.createElement('label');
        solLabel.setAttribute('text', "Strategies are complex! Check Hints.");
        xmlList.push(solLabel);
    }
  } else {
    const label = document.createElement('label');
    label.setAttribute('text', "There is a Secrets tab... but it’s locked.");
    xmlList.push(label);
    const label2 = document.createElement('label');
    label2.setAttribute('text', "You’ll need the password.");
    xmlList.push(label2);
    setTimeout(() => {
        if (!secretsUnlocked) {
             const password = prompt("Enter password to unlock secrets:");
             if (password === "password") {
                 secretsUnlocked = true;
                 alert("Secrets unlocked! Click the category again.");
                 workspace.refreshToolboxSelection();
             }
        }
    }, 100);
  }
  return xmlList;
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

function hasPlayerMoved() {
    return playerMoved;
}

async function endTurn() {
    // End Turn block:
    // Triggers Computer move for the CURRENT board only.

    // Switch visual state
    document.getElementById('status').innerText = "Computer's turn (O)";

    // Execute computer move for THIS board
    if (!isBoardGameOver(currentBoardIndex)) {
        await computerMove();
    }

    // Check Status Logic
    checkSimulStatus();

    // Reset for next turn
    currentPlayer = 'X';
    playerMoved = false; // Reset move tracking so player can move again next turn
    document.getElementById('status').innerText = "Your turn (X)";
}

function restartGame() {
    boards = [];
    lastPlayerMoves = [null, null, null, null];
    for(let i=0; i<4; i++) {
        boards.push([['', '', ''], ['', '', ''], ['', '', '']]);
    }

    currentPlayer = 'X'; // Player Always Starts now
    gameStated = false;
    isExecuting = false;
    playerMoved = false;

    updateBoard();
    document.getElementById('status').innerText = "Your turn (X)";

    const level = levels[currentLevel - 1];
    if (level.setup) {
        level.setup();
    }
    updateBoard();
}

function runCode() {
    restartGame();
    executeUserLogic();
}

function continueGame() {
    executeUserLogic();
}

async function executeUserLogic() {
    if (isExecuting) return;
    isExecuting = true;

    window.LoopTrap = 1000;
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP =
        'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
    var code = javascript.javascriptGenerator.workspaceToCode(workspace);
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP = null;

    try {
        for(let i=0; i<4; i++) {
            currentBoardIndex = i;
            playerMoved = false; // Reset local tracking for double-move prevention

            if (isBoardGameOver(i)) continue;

            const userAsyncFunc = new Function('return (async () => { ' + code + ' })()');
            await userAsyncFunc();
        }
    } catch (e) {
        console.error(e);
        alert(e);
    } finally {
        isExecuting = false;
    }
}

function checkSimulStatus() {
    let allFinished = true;
    let wins = 0;
    let ties = 0;
    let losses = 0;

    for(let i=0; i<4; i++) {
        const status = getBoardStatus(i);
        if (status === 'active') allFinished = false;
        if (status === 'X') wins++;
        if (status === 'Tie') ties++;
        if (status === 'O') losses++;
    }

    if (allFinished) {
        const level = levels[currentLevel - 1];
        if (level.checkGameEnd) {
             let success = false;
             let message = "";

             if (currentLevel <= 3) {
                 if (wins === 4) {
                     success = true;
                     message = level.checkGameEnd('X').message;
                 } else {
                     message = level.checkGameEnd('O').message;
                 }
             } else if (currentLevel === 4) {
                 if (losses === 0) {
                     success = true;
                     message = level.checkGameEnd('X').message;
                 } else {
                     message = level.checkGameEnd('O').message;
                 }
             } else if (currentLevel === 5) {
                 if (losses === 0 && wins === 0) {
                     success = true;
                     message = level.checkGameEnd('Tie').message;
                 } else {
                     message = level.checkGameEnd('X').message;
                 }
             }

             updateJulesMessage(message);
             if (success) {
                 setTimeout(() => {
                    if (currentLevel < 5) {
                        if (confirm(message + "\n\nProceed to next level?")) {
                            loadLevel(currentLevel + 1);
                        }
                    } else {
                         alert("You are a Grandmaster! Curriculum Complete.");
                    }
                }, 500);
             }
        }
    }
}

function getBoardStatus(boardIdx) {
    const b = boards[boardIdx];
    if (checkWinOnBoard(b, 'X')) return 'X';
    if (checkWinOnBoard(b, 'O')) return 'O';
    if (isBoardFull(b)) return 'Tie';
    return 'active';
}

function isBoardGameOver(boardIdx) {
    return getBoardStatus(boardIdx) !== 'active';
}

function setDifficulty(diff) {
    computerDifficulty = parseInt(diff);
}

async function placeRandomX() {
  if (isBoardGameOver(currentBoardIndex)) return;
  if (playerMoved) return; // Prevent double moves

  let emptySquares = [];
  const b = boards[currentBoardIndex];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (b[r][c] === '') {
        emptySquares.push({r, c});
      }
    }
  }
  
  if (emptySquares.length > 0) {
    let move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    await placeX(move.r + 1, move.c + 1);
  }
}

async function placeX(row, col) {
    if (isBoardGameOver(currentBoardIndex)) return;
    if (playerMoved) return; // Prevent double moves

    row -= 1;
    col -= 1;
    const b = boards[currentBoardIndex];

    if (row < 0 || row >= 3 || col < 0 || col >= 3) return;
    if (b[row][col] !== '') return;

    b[row][col] = 'X';
    playerMoved = true;
    lastPlayerMoves[currentBoardIndex] = {r: row, c: col}; // Record move for Mirror AI
    updateBoard();

    await new Promise(r => setTimeout(r, 300));

    const level = levels[currentLevel - 1];
    if (currentLevel <= 3 && level.checkMove) {
        const result = level.checkMove(row, col);
        updateJulesMessage(result.message);
    }
}

function isSquareEmpty(row, col) {
    row -= 1;
    col -= 1;
    const b = boards[currentBoardIndex];
    return row >= 0 && row < 3 && col >= 0 && col < 3 && b[row][col] === '';
}

async function computerMove() {
  if (isBoardGameOver(currentBoardIndex)) return;

  // Mirror Logic
  const lastMove = lastPlayerMoves[currentBoardIndex];
  const b = boards[currentBoardIndex];
  let move = null;

  if (lastMove) {
      // Mirror across center
      let mr = 2 - lastMove.r;
      let mc = 2 - lastMove.c;
      if (b[mr][mc] === '') {
          move = {r: mr, c: mc};
      }
  }

  if (!move) {
     // Fallback
      let optimalChance = (computerDifficulty - 1) * 0.25;
      let shouldPlayOptimally = Math.random() < optimalChance;

      if (shouldPlayOptimally) {
        move = getBestMove(b);
      }

      if (!move) {
        let emptySquares = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            if (b[r][c] === '') {
              emptySquares.push({r, c});
            }
          }
        }
        if (emptySquares.length > 0) {
          move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        }
      }
  }

  if (move) {
    b[move.r][move.c] = 'O';
    updateBoard();
    await new Promise(r => setTimeout(r, 300));
  }
}

function getBestMove(board) {
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
  if (checkWinOnBoard(board, 'O')) return 10 - depth;
  if (checkWinOnBoard(board, 'X')) return depth - 10;
  if (isBoardFull(board)) return 0;

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

function checkWinOnBoard(board, player) {
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === player && board[i][1] === player && board[i][2] === player) return true;
        if (board[0][i] === player && board[1][i] === player && board[2][i] === player) return true;
    }
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
    return false;
}

function checkWin(player) { return false; }

function isBoardFull(board) {
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
    for(let i=0; i<4; i++) {
        const b = boards[i];
        const boardDiv = document.getElementById(`board${i}`);
        if (!boardDiv) continue;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                let cell = boardDiv.querySelector(`.cell[data-row="${r+1}"][data-col="${c+1}"]`);
                cell.innerText = b[r][c];
            }
        }
    }
}

// Expose functions globally
window.placeX = placeX;
window.placeRandomX = placeRandomX;
window.isSquareEmpty = isSquareEmpty;
window.hasPlayerMoved = hasPlayerMoved;
window.setDifficulty = setDifficulty;
window.endTurn = endTurn;
