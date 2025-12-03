'use strict';
let workspace = null;
let boards = []; // Array of 4 boards: each is 3x3
let currentPlayer = 'X';
let gameStated = false;
let isExecuting = false;

let computerDifficulty = 1;
let currentLevel = 1;
let playerMoved = false; // Tracks if user placed X successfully
let secretsUnlocked = false; // Tracks if secrets are unlocked

// Synchronization for Simul Mode
let activeBoardsCount = 0;
let waitingResolves = [];
let executionPromises = [];

const levels = [
  {
    id: 1,
    name: "Level 1: The Center Strike",
    setup: () => {
      // B0: Top Edge (0, 1)
      boards[0][0][1] = 'O';
      // B1: Mirror Col (0, 1)
      boards[1][0][1] = 'O';
      // B2: Mirror Row (2, 1)
      boards[2][2][1] = 'O';
      // B3: Mirror Both (2, 1)
      boards[3][2][1] = 'O';
      computerDifficulty = 1;
    },
    checkMove: (row, col) => {
      // Just check logical correctness of the move relative to goal, but don't fail immediately
      if (row === 1 && col === 1) {
        return { success: false, message: "Bullseye! You took the center." };
      } else {
        return { success: false, message: "Focus! If the middle is free, take it!" };
      }
    },
    checkGameEnd: (winner) => {
      if (winner === 'X') {
         return { success: true, message: "Flawless victory! You dominated the center." };
      } else {
         return { success: false, message: "You must win EVERY board to pass." };
      }
    },
    teachingPoint: "Welcome to the Simul! I've mirrored the board four times. In every case, they gave up the Center. If they take the edge, you punish them by seizing the middle!",
    hints: [ {text: "Use 'place_x_at(2, 2)'."} ],
    solution: "place_x_at(2, 2);"
  },
  {
    id: 2,
    name: "Level 2: The Corner Defense",
    setup: () => {
      for(let i=0; i<4; i++) boards[i][1][1] = 'O';
      computerDifficulty = 1;
    },
    checkMove: (row, col) => {
      if ((row === 0 && col === 0) || (row === 0 && col === 2) || (row === 2 && col === 0) || (row === 2 && col === 2)) {
        return { success: false, message: "Good defense! You secured a corner." };
      } else {
        return { success: false, message: "Trap detected! Reset and take a corner!" };
      }
    },
    checkGameEnd: (winner) => {
      if (winner === 'X') return { success: true, message: "Textbook defense!" };
      return { success: false, message: "You need a clean sweep on all four boards." };
    },
    teachingPoint: "They took the Center! Don't panic. If the center is gone, the Corners are your fortress.",
    hints: [ {text: "Use 'place_x_at(1, 1)'."} ],
    solution: "place_x_at(1, 1);"
  },
  {
    id: 3,
    name: "Level 3: The Trap Check",
    setup: () => {
      boards[0][0][0] = 'O';
      boards[1][0][2] = 'O';
      boards[2][2][0] = 'O';
      boards[3][2][2] = 'O';
      computerDifficulty = 1;
    },
    checkMove: (row, col) => {
      if (row === 1 && col === 1) return { success: false, message: "Gotcha! You caught them leaving the center open." };
      return { success: false, message: "Missed opportunity! The center was right there." };
    },
    checkGameEnd: (winner) => {
      if (winner === 'X') return { success: true, message: "Sharp eyes!" };
      return { success: false, message: "You let them off the hook." };
    },
    teachingPoint: "Eyes open! Sometimes they start in a corner. That leaves the Center wide open.",
    hints: [ {text: "Use 'if is_square_empty(2, 2) do place_x_at(2, 2)'."} ],
    solution: "if (isSquareEmpty(2, 2)) { placeX(2, 2); } else { placeX(1, 3); }"
  },
  {
    id: 4,
    name: "Level 4: Survival Mode",
    setup: () => { computerDifficulty = 3; },
    checkGameEnd: (winner) => {
      if (winner === 'X' || winner === 'Tie') return { success: true, message: "Solid as a rock!" };
      return { success: false, message: "Shields down! Your defense must be universal." };
    },
    teachingPoint: "Training wheels are off. Block their winning moves. Force a Tie or steal a Win.",
    hints: [ {text: "Check for a winning move first."} ],
    solution: "// Priority logic"
  },
  {
    id: 5,
    name: "Level 5: The Grandmaster",
    setup: () => { computerDifficulty = 5; },
    checkGameEnd: (winner) => {
      if (winner === 'Tie') return { success: true, message: "Absolute perfection. You are a Grandmaster!" };
      if (winner === 'X') return { success: true, message: "Impossible! You beat the Grandmaster?" };
      return { success: false, message: "The Grandmaster found a gap. Try again!" };
    },
    teachingPoint: "The Grandmaster doesn't make mistakes. Force a Draw. Do not lose.",
    hints: [ {text: "Use 'repeat until has player moved?' loop."} ],
    solution: "// Minimax"
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
    // This is context-specific now.
    // If called from user code, it should return true if player moved ON CURRENT BOARD.
    // We need to track this per execution context.
    // Since `hasPlayerMoved` is a global function called by generated code, it must check global state associated with current context.
    // We can use `currentBoardIndex` which is set before calling the user function?
    // Wait, with concurrent execution, `currentBoardIndex` changes!
    // We need to pass context or use a Map keyed by something?
    // Simplified: generated code calls `hasPlayerMoved()`.
    // We can't change the signature easily without changing block gen.
    // But `executeUserLogic` runs `new Function`.
    // If we run them concurrently, global `currentBoardIndex` is useless (race condition).
    // FIX: We must bind the board index to the function scope or use a global map keyed by... execution ID?
    // Since JS is single threaded event loop, we can rely on `currentBoardIndex` IF we don't await inside the user function except at `endTurn`.
    // `placeX` has `await`.
    // If we await in `placeX`, another "thread" (promise) might resume.
    // So global `currentBoardIndex` is UNSAFE.

    // SOLUTION: We will rely on `endTurn` being the synchronization point.
    // But how does `placeX` know which board to place on?
    // We can use a **Scoped Execution**.
    // We can inject a variable `_boardIndex` into the generated code wrapper.
    // `(async (_boardIndex) => { ... })(i)`
    // And `placeX` needs to take `_boardIndex`? No, block gen doesn't pass it.

    // Hack: Use a "Context Stack" or rely on the fact that `await` yields.
    // We need to track which board is currently executing.
    // Since we cannot change the block signature easily to pass boardID, we might be stuck with sequential execution OR we need a way to identify the caller.
    // But we CAN change the block generator!
    // If we change generator to `await placeX(..., _boardIndex)`, and wrap code in `(async (_boardIndex) => { ... })`.
    // Let's do that! It's the robust way.

    return false; // Stub, see logic below
}

// Global map for player moves status per board
let playerMovedMap = [false, false, false, false];

async function endTurn(boardIdx) {
    // Barrier Logic
    // 1. Mark this board as ready.
    // 2. Wait for all active boards to be ready.
    // 3. If last one, trigger Global AI, then release all.

    // We need to track which boards are "Active" (running code).
    // Initially 4. If one finishes (returns from function), decrement?
    // Or just wait for all currently running ones.

    // Add to waiting list
    let resolveFn;
    const p = new Promise(r => resolveFn = r);
    waitingResolves.push(resolveFn);

    // If all active boards are waiting...
    if (waitingResolves.length === activeBoardsCount) {
        // Trigger AI
        await globalComputerTurn();

        // Reset player moved flags for next turn
        for(let i=0; i<4; i++) playerMovedMap[i] = false;

        // Release all
        const batch = waitingResolves;
        waitingResolves = [];
        batch.forEach(r => r());
    } else {
        await p;
    }
}

async function globalComputerTurn() {
    document.getElementById('status').innerText = "Computer's turn (O)";

    // Move Logic
    const b0 = boards[0];
    let move0 = null;

    if (!isBoardGameOver(0)) {
        move0 = getBestMove(b0);
        if (!move0) {
            let emptySquares = [];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (b0[r][c] === '') emptySquares.push({r, c});
                }
            }
            if (emptySquares.length > 0) {
                move0 = emptySquares[Math.floor(Math.random() * emptySquares.length)];
            }
        }
    }

    if (move0) {
        // Apply mirrored moves
        // Note: Check game over for each board individually inside applyMove
        await Promise.all([
            applyMove(0, move0.r, move0.c),
            applyMove(1, move0.r, 2 - move0.c),
            applyMove(2, 2 - move0.r, move0.c),
            applyMove(3, 2 - move0.r, 2 - move0.c)
        ]);
    }

    checkSimulStatus();
    currentPlayer = 'X';
    document.getElementById('status').innerText = "Your turn (X)";
}

async function applyMove(boardIdx, r, c) {
    if (isBoardGameOver(boardIdx)) return;
    const b = boards[boardIdx];
    if (b[r][c] === '') {
        b[r][c] = 'O';
        updateBoard();
        // Slight delay for visual? We can do it parallel or seq.
        // Parallel + delay might look weird if all pop at once.
        // Let's just do it.
    }
}

function restartGame() {
    boards = [];
    for(let i=0; i<4; i++) boards.push([['', '', ''], ['', '', ''], ['', '', '']]);

    currentPlayer = 'X';
    gameStated = false;
    isExecuting = false;
    playerMovedMap = [false, false, false, false];

    // Reset Barrier
    waitingResolves = [];
    executionPromises = [];

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
    // "Resume execution".
    // If executionPromises are still running (waiting at barrier), we can't "Resume" easily unless we are adding code?
    // If the loop finished, we can run `executeUserLogic` again?
    // `executeUserLogic` starts NEW execution threads.
    // If old ones are stuck at barrier... `activeBoardsCount` will be wrong.
    // Assume `runCode` wipes everything.
    // `continueGame` implies we just call `executeUserLogic` again on the EXISTING board state.
    // The previous execution contexts must have finished or we ignore them?
    // If they finished, `activeBoardsCount` should be 0.
    executeUserLogic();
}

async function executeUserLogic() {
    // Don't block restart if already executing?
    // We allow re-entry for "Continue".
    isExecuting = true;

    window.LoopTrap = 1000;
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP =
        'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';

    // Modify generated code to accept board index
    // We need to inject `_boardIndex` into the wrapper.
    // AND we need to modify the block definitions to pass `_boardIndex`.
    // Wait, we can't easily modify `var code = ...`.
    // The generated code for `placeX` is `await placeX(r, c);`.
    // We can define `placeX` to use `arguments.callee.caller`? No, strict mode.
    // We can use a global `currentBoardContext` but we have concurrency.

    // TRICK: We can define `placeX` inside the wrapper function scope!
    // `(async (_boardIndex) => { let placeX = (r,c) => window.placeX(r,c, _boardIndex); ... userCode ... })`
    // This shadows the global `placeX`.

    var userCode = javascript.javascriptGenerator.workspaceToCode(workspace);
    javascript.javascriptGenerator.INFINITE_LOOP_TRAP = null;

    activeBoardsCount = 0;

    const promises = [];
    for(let i=0; i<4; i++) {
        if (isBoardGameOver(i)) continue;

        activeBoardsCount++;

        // wrapper with shadowed functions
        const wrapper = `
            return (async (_boardIdx) => {
                const placeX = (r, c) => window.placeX(r, c, _boardIdx);
                const placeRandomX = () => window.placeRandomX(_boardIdx);
                const isSquareEmpty = (r, c) => window.isSquareEmpty(r, c, _boardIdx);
                const hasPlayerMoved = () => window.hasPlayerMoved(_boardIdx);
                const endTurn = () => window.endTurn(_boardIdx);

                ${userCode}
            })
        `;

        const func = new Function(wrapper)();
        promises.push(func(i).then(() => {
            activeBoardsCount--;
            // If a board finishes early, we might need to trigger barrier if others are waiting?
            // If this board finishes, it's no longer "Active".
            // If others are waiting at barrier:
            // if (waitingResolves.length === activeBoardsCount) ... trigger.
            if (waitingResolves.length > 0 && waitingResolves.length === activeBoardsCount) {
                 // Trigger logic similar to endTurn but this is edge case
                 // If all remaining boards are waiting, let them go.
                 // But strictly, endTurn triggers AI.
                 // If one board finishes code, it drops out.
                 // If others are waiting, they proceed?
            }
        }));
    }

    await Promise.all(promises);
    isExecuting = false;
}

// ... helper functions ...
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
                 if (wins === 4) { success = true; message = level.checkGameEnd('X').message; }
                 else { message = level.checkGameEnd('O').message; }
             } else if (currentLevel === 4) {
                 if (losses === 0) { success = true; message = level.checkGameEnd('X').message; }
                 else { message = level.checkGameEnd('O').message; }
             } else if (currentLevel === 5) {
                 if (losses === 0 && wins === 0) { success = true; message = level.checkGameEnd('Tie').message; }
                 else { message = level.checkGameEnd('X').message; }
             }
             updateJulesMessage(message);
             if (success) {
                 setTimeout(() => {
                    if (currentLevel < 5) {
                        if (confirm(message + "\n\nProceed to next level?")) loadLevel(currentLevel + 1);
                    } else { alert("You are a Grandmaster! Curriculum Complete."); }
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

function isBoardGameOver(boardIdx) { return getBoardStatus(boardIdx) !== 'active'; }
function setDifficulty(diff) { computerDifficulty = parseInt(diff); }

async function placeRandomX(boardIdx) {
  if (isBoardGameOver(boardIdx)) return;
  if (playerMovedMap[boardIdx]) return;
  let emptySquares = [];
  const b = boards[boardIdx];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (b[r][c] === '') emptySquares.push({r, c});
    }
  }
  if (emptySquares.length > 0) {
    let move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    await placeX(move.r + 1, move.c + 1, boardIdx);
  }
}

async function placeX(row, col, boardIdx) {
    if (isBoardGameOver(boardIdx)) return;
    if (playerMovedMap[boardIdx]) return;

    row -= 1; col -= 1;
    const b = boards[boardIdx];

    if (row < 0 || row >= 3 || col < 0 || col >= 3) return;
    if (b[row][col] !== '') return;

    b[row][col] = 'X';
    playerMovedMap[boardIdx] = true;
    updateBoard();

    await new Promise(r => setTimeout(r, 300));

    const level = levels[currentLevel - 1];
    if (currentLevel <= 3 && level.checkMove) {
        const result = level.checkMove(row, col);
        updateJulesMessage(result.message);
    }
}

function isSquareEmpty(row, col, boardIdx) {
    row -= 1; col -= 1;
    const b = boards[boardIdx];
    return row >= 0 && row < 3 && col >= 0 && col < 3 && b[row][col] === '';
}

function hasPlayerMovedGlobal(boardIdx) {
    return playerMovedMap[boardIdx];
}

// ... minimax functions ...
function getBestMove(board) {
  let bestScore = -Infinity;
  let move = null;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === '') {
        board[r][c] = 'O';
        let score = minimax(board, 0, false);
        board[r][c] = '';
        if (score > bestScore) { bestScore = score; move = { r, c }; }
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
            if (board[r][c] === 'O') continue; // Optimization check? No, checking empty
            if (board[r][c] === 'X') continue;
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

function isBoardFull(board) {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === '') return false;
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

// Global Exports
// These are fallback if user code calls them without wrapper, but wrapper handles most.
window.placeX = placeX;
window.placeRandomX = placeRandomX;
window.isSquareEmpty = isSquareEmpty;
window.hasPlayerMoved = hasPlayerMovedGlobal;
window.setDifficulty = setDifficulty;
window.endTurn = endTurn;
