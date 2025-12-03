'use strict';
let workspace = null;
let board = [['', '', ''], ['', '', ''], ['', '', '']];
let currentPlayer = 'X';
let gameOver = false;
let gameStated = false;
let computerDifficulty = 1;

let currentLevel = 1;
let playerMoved = false; // Tracks if user placed X successfully
let secretsUnlocked = false; // Tracks if secrets are unlocked

const levels = [
  {
    id: 1,
    name: "Level 1: The Center Strike",
    setup: () => {
      // Computer 'O' on side edge (row 1, col 2 -> index 0, 1)
      board[0][1] = 'O';
      computerDifficulty = 1; // Passive/Random
      updateBoard();
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
      // Computer 'O' in Center (row 2, col 2 -> index 1, 1)
      board[1][1] = 'O';
      computerDifficulty = 1; // Passive/Random
      updateBoard();
    },
    checkMove: (row, col) => {
      // Goal: Place X in any Corner
      // Corners: (0,0), (0,2), (2,0), (2,2)
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
      // Computer 'O' in a Corner (e.g., 1, 1 -> index 0, 0)
      board[0][0] = 'O';
      computerDifficulty = 1; // Passive/Random
      updateBoard();
    },
    checkMove: (row, col) => {
      // Goal: Check if Center is empty. If it is, take it!
      // Since O is in corner, Center IS empty. So taking it is the only correct move for this lesson.
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
      // Difficulty 3. Computer goes first.
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
      // Difficulty 5 (Optimal).
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
    // Create main workspace.
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox-categories'),
    });

    // Register callbacks
    workspace.registerToolboxCategoryCallback('HINTS', hintsCallback);
    workspace.registerToolboxCategoryCallback('SECRETS', secretsCallback);

    // Initialize Level 1
    loadLevel(1);
}

function hintsCallback(workspace) {
  const level = levels[currentLevel - 1];
  const xmlList = [];

  if (level && level.hints) {
    level.hints.forEach(hint => {
       const label = document.createElement('label');
       label.setAttribute('text', hint.text);
       xmlList.push(label);
       // Add a separator
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

    // Add solution as text or pre-made block (simulated as text label for now as code block generation is complex dynamically)
    // Or we can just put a label with the strategy explanation.
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
    // Locked
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
                 // Refresh toolbox?
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
    board = [['', '', ''], ['', '', ''], ['', '', '']];
    currentPlayer = 'X'; // Will be switched if Computer goes first
    gameOver = false;
    gameStated = false;
    playerMoved = false; // Reset move tracking
    updateBoard();
    document.getElementById('status').innerText = "Your turn (X)";

    const level = levels[currentLevel - 1];
    if (level.setup) {
        level.setup();
    }

    // Computer goes first in Level 4 and 5
    // In Level 1-3, setup puts a piece, effectively acting as first move.
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
        playerMoved = true; // Mark that player moved
        updateBoard();

        const level = levels[currentLevel - 1];

        // Check Move for Levels 1-3
        // Note: Logic updated for "play to end". Success is determined by checkGameEnd,
        // but checkMove gives immediate feedback.
        if (currentLevel <= 3 && level.checkMove) {
            const result = level.checkMove(row, col);

            // Only update message, do not end game on "success" unless specific condition met
            // Current instruction implies "prove you can convert... into a WIN".
            // So we never end game here for L1-3, unless it's a fail?
            // Actually, if they fail the move check (e.g. played on edge in L2), we might want to warn or let them lose naturally.
            // The feedback says "Trap detected! ... Reset and take a corner!".
            // This implies they should restart or lose.
            // I'll just show the message.
            updateJulesMessage(result.message);

            // Note: Previously we ended game on success. Now we don't.
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
    return row >= 0 && row < 3 && col >= 0 && col < 3 && board[row][col] === '';
}

function computerMove() {
  if (gameOver) return;

  // Reset playerMoved so they must move again next turn
  playerMoved = false;

  // Calculate probability of playing optimally
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
