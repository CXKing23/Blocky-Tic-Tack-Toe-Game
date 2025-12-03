'use strict';
let workspace = null;
let boards = []; // Array of 4 boards: each is 3x3
let currentBoardIndex = 0; // Index of the board currently being operated on by user logic
let currentPlayer = 'X';
let gameStated = false; // "Stated" meant "Started" probably. Renaming to avoid confusion? No, sticking to existing var.
// Actually, with multi-board async logic, we need to track execution state.
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
      // Board 0: Top Edge (0, 1)
      boards[0][0][1] = 'O';
      // Board 1: Right Edge (1, 2)
      boards[1][1][2] = 'O';
      // Board 2: Bottom Edge (2, 1)
      boards[2][2][1] = 'O';
      // Board 3: Left Edge (1, 0)
      boards[3][1][0] = 'O';

      computerDifficulty = 1;
    },
    checkMove: (row, col) => {
      // Goal: Place X at Center (2, 2 -> index 1, 1)
      if (row === 1 && col === 1) {
        return { success: false, message: "Bullseye! You took the center on all boards. But the game isn't over—prove you can convert this advantage into a WIN." };
      } else {
        return { success: false, message: "Focus! On at least one board, you ignored the open center. If the middle is free, take it!" };
      }
    },
    checkGameEnd: (winner) => {
      // Win on all boards?
      // Logic for game end checks aggregation of all boards elsewhere.
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
      // Computer 'O' in Center on all boards
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
      // Computer 'O' in a Corner (mirrored)
      // B0: Top-Left
      boards[0][0][0] = 'O';
      // B1: Top-Right
      boards[1][0][2] = 'O';
      // B2: Bottom-Right
      boards[2][2][2] = 'O';
      // B3: Bottom-Left
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

    // Initialize DOM for 4 boards
    initBoardsDOM();

    // Initialize Level 1
    loadLevel(1);
}

function initBoardsDOM() {
    const container = document.getElementById('boardsContainer');
    container.innerHTML = '';
    for(let i=0; i<4; i++) {
        const boardDiv = document.createElement('div');
        boardDiv.id = `board${i}`;
        boardDiv.className = 'board';
        // Cells
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

function restartGame() {
    // Reset all 4 boards
    boards = [];
    for(let i=0; i<4; i++) {
        boards.push([['', '', ''], ['', '', ''], ['', '', '']]);
    }

    currentPlayer = 'X';
    gameStated = false;
    isExecuting = false;
    playerMoved = false;

    updateBoard();
    document.getElementById('status').innerText = "Your turn (X)";

    const level = levels[currentLevel - 1];
    if (level.setup) {
        level.setup();
    }
    updateBoard(); // Update UI after setup changes

    // Check if Computer goes first (Level 4 & 5)
    // Note: In Multi-Board, if computer goes first, it goes on ALL boards.
    // However, restartGame puts pieces in setup.
    // For L4/L5, setup sets difficulty.
    // We need to trigger computer move on all boards.
    if (currentLevel >= 4) {
       currentPlayer = 'O';
       document.getElementById('status').innerText = "Computer's turn (O)";
       // We can't use `computerMove` directly because it expects to be called within execution context or handled specially.
       // But `computerMove` is now async and per-board?
       // Let's make a function to handle computer turn on all boards.
       executeComputerTurnAllBoards();
    }
}

async function executeComputerTurnAllBoards() {
    // Execute concurrently or sequentially? Sequentially for visual clarity.
    for(let i=0; i<4; i++) {
        currentBoardIndex = i;
        if (!isBoardGameOver(i)) {
            await computerMove();
        }
    }
    currentPlayer = 'X';
    document.getElementById('status').innerText = "Your turn (X)";
}

function runCode() {
    // If not "Continue", restart first.
    // Actually, button says "Run/Restart".
    // If user wants to just Run on fresh state, they click Run.
    restartGame();
    // Then execute.
    // Wait, restartGame is sync, but if Computer goes first, executeComputerTurnAllBoards is async?
    // If L4/L5, we need to wait for computer?
    // But `runCode` is user action.
    // If `currentLevel >= 4`, restartGame triggers computer move.
    // We should wait for that?
    // Actually, `runCode` executes USER code.
    // If it's O's turn, User code shouldn't run?
    // In L4/L5, O goes first. Then X.
    // So `runCode` should be allowed ONLY if it's X's turn?
    // Or `runCode` starts the "Game Loop"?
    // In Blockly games, usually "Run" executes the User's logic for the current state.

    // Let's assume `executeUserLogic` handles the flow.
    executeUserLogic();
}

function continueGame() {
    // Don't restart. Just run user logic on current state.
    executeUserLogic();
}

async function executeUserLogic() {
    if (isExecuting) return;
    isExecuting = true;

    // Reset Infinite Loop Trap
    window.LoopTrap = 1000;
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP =
        'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
    var code = javascript.javascriptGenerator.workspaceToCode(workspace);
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP = null;

    // Wrap code in async function
    // We need to iterate over all 4 boards.
    // The user code is written as if for one board.
    // We run it 4 times.

    // Note: If user code loops forever (Level 5), we need to be careful.
    // But Level 5 code `repeat until has player moved` is a loop.
    // The generated code must handle `hasPlayerMoved` correctly.

    try {
        for(let i=0; i<4; i++) {
            currentBoardIndex = i;
            playerMoved = false; // Reset for this board's turn

            // Skip if board is game over
            if (isBoardGameOver(i)) continue;

            // Execute User Code
            // We use a Function constructor to create an async function
            // We need to pass `placeX` etc into scope? No, they are global.
            const userAsyncFunc = new Function('return (async () => { ' + code + ' })()');
            await userAsyncFunc();

            // Check checks for this board
            const level = levels[currentLevel - 1];
            // We do checking inside placeX mostly.
        }

        // After user moves on all boards, check global win/loss?
        // Or trigger computer turn?

        // If game is not over, Computer moves.
        // Wait, did user move?
        // If user didn't move (e.g. empty code), we shouldn't trigger computer?
        // But "Continue" allows adding blocks.

        // Let's trigger Computer Move on all boards where X moved or it's O's turn.
        // Actually, turn structure:
        // X moves on valid boards.
        // Then O moves on valid boards.
        // Then pause.

        currentPlayer = 'O';
        document.getElementById('status').innerText = "Computer's turn (O)";
        await executeComputerTurnAllBoards();

        // Check Global Game End (Simul Logic)
        checkSimulStatus();

    } catch (e) {
        console.error(e);
        alert(e);
    } finally {
        isExecuting = false;
    }
}

function checkSimulStatus() {
    // Check if ALL boards are finished.
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
        // Evaluate Success based on Level
        const level = levels[currentLevel - 1];
        if (level.checkGameEnd) {
             // For Simul, we aggregate.
             // L1-3: Need 4 wins?
             // L4: Win or Tie.
             // L5: Tie.

             let success = false;
             let message = "";

             if (currentLevel <= 3) {
                 if (wins === 4) {
                     success = true;
                     message = level.checkGameEnd('X').message;
                 } else {
                     message = level.checkGameEnd('O').message; // Generic fail
                 }
             } else if (currentLevel === 4) {
                 if (losses === 0) {
                     success = true;
                     message = level.checkGameEnd('X').message;
                 } else {
                     message = level.checkGameEnd('O').message;
                 }
             } else if (currentLevel === 5) {
                 if (losses === 0 && wins === 0) { // All Ties
                     success = true;
                     message = level.checkGameEnd('Tie').message;
                 } else {
                     message = level.checkGameEnd('X').message; // Fail text
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
    // Check win
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

    row -= 1;
    col -= 1;
    const b = boards[currentBoardIndex];

    // Check bounds
    if (row < 0 || row >= 3 || col < 0 || col >= 3) {
        // Invalid bounds
        return;
    }

    // Check if empty
    if (b[row][col] !== '') {
        // Occupied. Return silently to allow "Continue" to work (skip existing moves).
        return;
    }

    // Place X
    b[row][col] = 'X';
    playerMoved = true;
    updateBoard();

    // Visual Delay
    await new Promise(r => setTimeout(r, 300));

    // Level Check (Intermediate feedback)
    const level = levels[currentLevel - 1];
    if (currentLevel <= 3 && level.checkMove) {
        const result = level.checkMove(row, col);
        if (!result.success) {
             // Negative feedback only? Or positive too?
             // "Bullseye!" is technically success logic but we return false to keep playing.
             updateJulesMessage(result.message);
        } else {
             updateJulesMessage(result.message);
        }
    }
}

function checkGameEnd(winner) {
    const level = levels[currentLevel - 1];
    if (level.checkGameEnd) {
        const result = level.checkGameEnd(winner);
        updateJulesMessage(result.message);
        if (result.success) {
             setTimeout(() => {
                if (currentLevel < 5) {
                    if (confirm(result.message + "\n\nProceed to next level?")) {
                        loadLevel(currentLevel + 1);
                    }
                } else {
                     alert("You are a Grandmaster! Curriculum Complete.");
                }
            }, 500);
        } else {
            // Failure
        }
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

  // Reset playerMoved so they must move again next turn
  playerMoved = false;

  // Calculate probability of playing optimally
  let optimalChance = (computerDifficulty - 1) * 0.25;
  let shouldPlayOptimally = Math.random() < optimalChance;

  let move = null;
  const b = boards[currentBoardIndex];

  if (shouldPlayOptimally) {
    move = getBestMove(b);
  }

  // Fallback to random
  if (!move) {
    let emptySquares = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (b[r][c] === '') {
          emptySquares.push({r, c});
        }
      }
  }

  // Execute Move
  if (move) {
    b[move.r][move.c] = 'O';
    updateBoard();
    await new Promise(r => setTimeout(r, 300));
  }
}

// NEW: Minimax Algorithm helper functions
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
    // Check rows, columns, and diagonals
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === player && board[i][1] === player && board[i][2] === player) return true;
        if (board[0][i] === player && board[1][i] === player && board[2][i] === player) return true;
    }
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
    return false;
}

function checkWin(player) {
    // Legacy support? Used by checkWin('X') calls in loop?
    // We used checkWinOnBoard now.
    return false;
}

function isBoardFull(board) {
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
    for(let i=0; i<4; i++) {
        const b = boards[i];
        const boardDiv = document.getElementById(`board${i}`);
        if (!boardDiv) continue; // Should be there
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                // Selector needs to scope to board
                let cell = boardDiv.querySelector(`.cell[data-row="${r+1}"][data-col="${c+1}"]`);
                cell.innerText = b[r][c];
            }
        }
    }
}
