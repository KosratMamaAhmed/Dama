import { BoardType, Difficulty, Move, Player, Position } from './types';
import { getMovesForPiece, hasAnyJumps } from './gameLogic';

function cloneBoard(board: BoardType): BoardType {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function getAllValidMoves(board: BoardType, player: Player): { r: number, c: number, move: Move }[] {
  let moves: { r: number, c: number, move: Move }[] = [];
  const mustJump = hasAnyJumps(board, player);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        const pieceMoves = getMovesForPiece(board, r, c);
        for (const m of pieceMoves) {
          if (!mustJump || m.type === 'jump') {
            moves.push({ r, c, move: m });
          }
        }
      }
    }
  }
  return moves;
}

// Emulate applying a move. Matches gameReducer exactly!
function applyMoveSimulated(
  board: BoardType,
  r: number,
  c: number,
  move: Move,
  player: Player
): { board: BoardType; nextTurnMustJump: Position | null; turnEnded: boolean } {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[r][c]!;
  nextBoard[r][c] = null;
  nextBoard[move.dest.r][move.dest.c] = piece;

  if (move.type === 'jump' && move.captured) {
    nextBoard[move.captured.r][move.captured.c] = null;
  }

  let turnEnded = true;
  let nextTurnMustJump: Position | null = null;
  let promoted = false;

  // Promotion
  if (piece.type === 'MAN') {
    if (piece.player === 'CYAN' && move.dest.r === 0) {
      piece.type = 'KING';
      promoted = true;
    } else if (piece.player === 'WHITE' && move.dest.r === 7) {
      piece.type = 'KING';
      promoted = true;
    }
  }

  // Multi-jump capability (only normal pieces if not promoted on this step)
  if (move.type === 'jump' && !promoted) {
    const nextMoves = getMovesForPiece(nextBoard, move.dest.r, move.dest.c);
    if (nextMoves.some((m) => m.type === 'jump')) {
      turnEnded = false;
      nextTurnMustJump = { r: move.dest.r, c: move.dest.c };
    }
  }

  return { board: nextBoard, nextTurnMustJump, turnEnded };
}

// Sophisticated board evaluator to power the intelligent Dama play
function evaluateBoard(board: BoardType, aiPlayer: Player): number {
  let score = 0;
  const oppPlayer: Player = aiPlayer === 'CYAN' ? 'WHITE' : 'CYAN';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = 0;
      // Base values
      if (piece.type === 'MAN') {
        val += 100;
        // Positional values - incentivize crossing towards enemy line
        if (piece.player === 'WHITE') {
          val += r * 15; // WHITE goes r: 0 -> 7
        } else {
          val += (7 - r) * 15; // CYAN goes r: 7 -> 0
        }
      } else {
        // KING worth much more due to range power
        val += 350;
      }

      // Safe edges (c=0 or c=7)
      if (c === 0 || c === 7) {
        val += 20;
      }

      // Stable backlines
      if (piece.player === 'WHITE' && r === 0) {
        val += 15;
      }
      if (piece.player === 'CYAN' && r === 7) {
        val += 15;
      }

      // Center occupation & pressure (columns 2, 3, 4, 5)
      if (c >= 2 && c <= 5) {
        val += 10;
        if (c === 3 || c === 4) {
          val += 10; // high center control
        }
      }

      if (piece.player === aiPlayer) {
        score += val;
      } else {
        score -= val;
      }
    }
  }

  return score;
}

// Minimax with Alpha-Beta pruning
function minimax(
  board: BoardType,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  currentTurn: Player,
  aiPlayer: Player,
  mustJumpPos: Position | null
): number {
  // Base case
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  const oppPlayer: Player = aiPlayer === 'CYAN' ? 'WHITE' : 'CYAN';
  let moves = getAllValidMoves(board, currentTurn);

  if (mustJumpPos) {
    moves = moves.filter((m) => m.r === mustJumpPos.r && m.c === mustJumpPos.c);
  }

  // End game checks
  if (moves.length === 0) {
    return isMaximizing ? -10000 + depth : 10000 - depth;
  }

  if (isMaximizing) {
    let maxVal = -Infinity;
    for (const m of moves) {
      const { board: nextBoard, nextTurnMustJump, turnEnded } = applyMoveSimulated(
        board,
        m.r,
        m.c,
        m.move,
        currentTurn
      );

      let val: number;
      if (turnEnded) {
        val = minimax(nextBoard, depth - 1, alpha, beta, false, oppPlayer, aiPlayer, null);
      } else {
        val = minimax(nextBoard, depth - 1, alpha, beta, true, currentTurn, aiPlayer, nextTurnMustJump);
      }

      maxVal = Math.max(maxVal, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break; // Prune
    }
    return maxVal;
  } else {
    let minVal = Infinity;
    for (const m of moves) {
      const { board: nextBoard, nextTurnMustJump, turnEnded } = applyMoveSimulated(
        board,
        m.r,
        m.c,
        m.move,
        currentTurn
      );

      let val: number;
      if (turnEnded) {
        val = minimax(nextBoard, depth - 1, alpha, beta, true, aiPlayer, aiPlayer, null);
      } else {
        val = minimax(nextBoard, depth - 1, alpha, beta, false, currentTurn, aiPlayer, nextTurnMustJump);
      }

      minVal = Math.min(minVal, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break; // Prune
    }
    return minVal;
  }
}

export function getAIMove(
  board: BoardType,
  difficulty: Difficulty,
  player: Player,
  mustJumpPos: Position | null
): { r: number, c: number, dest: Position } | null {
  let moves = getAllValidMoves(board, player);

  if (mustJumpPos) {
    moves = moves.filter((m) => m.r === mustJumpPos.r && m.c === mustJumpPos.c);
  }

  if (moves.length === 0) return null;

  // 1. EASY difficulty - Choose completely random move
  if (difficulty === 'EASY') {
    const selected = moves[Math.floor(Math.random() * moves.length)];
    return { r: selected.r, c: selected.c, dest: selected.move.dest };
  }

  // 2. MEDIUM difficulty - Minimax with depth 2 (solid play, protects pieces, makes no naive mistakes)
  if (difficulty === 'MEDIUM') {
    let bestVal = -Infinity;
    let bestMoves: typeof moves = [];

    for (const m of moves) {
      const { board: nextBoard, nextTurnMustJump, turnEnded } = applyMoveSimulated(
        board,
        m.r,
        m.c,
        m.move,
        player
      );

      const oppPlayer: Player = player === 'CYAN' ? 'WHITE' : 'CYAN';
      let val: number;
      if (turnEnded) {
        val = minimax(nextBoard, 2, -Infinity, Infinity, false, oppPlayer, player, null);
      } else {
        val = minimax(nextBoard, 2, -Infinity, Infinity, true, player, player, nextTurnMustJump);
      }

      if (val > bestVal) {
        bestVal = val;
        bestMoves = [m];
      } else if (val === bestVal) {
        bestMoves.push(m);
      }
    }

    const selected = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return { r: selected.r, c: selected.c, dest: selected.move.dest };
  }

  // 3. HARD difficulty - Minimax at depth 4
  if (difficulty === 'HARD') {
    let bestVal = -Infinity;
    let bestMoves: typeof moves = [];

    for (const m of moves) {
      const { board: nextBoard, nextTurnMustJump, turnEnded } = applyMoveSimulated(
        board,
        m.r,
        m.c,
        m.move,
        player
      );

      const oppPlayer: Player = player === 'CYAN' ? 'WHITE' : 'CYAN';
      let val: number;
      if (turnEnded) {
        val = minimax(nextBoard, 4, -Infinity, Infinity, false, oppPlayer, player, null);
      } else {
        val = minimax(nextBoard, 4, -Infinity, Infinity, true, player, player, nextTurnMustJump);
      }

      if (val > bestVal) {
        bestVal = val;
        bestMoves = [m];
      } else if (val === bestVal) {
        bestMoves.push(m);
      }
    }

    const selected = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return { r: selected.r, c: selected.c, dest: selected.move.dest };
  }

  // 4. EXPERT difficulty (Kurdish: لێهاتوو) - Advanced depth 5 solver with highly aggressive optimization
  if (difficulty === 'EXPERT') {
    let bestVal = -Infinity;
    let bestMoves: typeof moves = [];

    // Increase target search depth when search space is smaller (e.g. few candidate moves) for extra superhuman precision
    const targetDepth = moves.length <= 4 ? 6 : 5;

    for (const m of moves) {
      const { board: nextBoard, nextTurnMustJump, turnEnded } = applyMoveSimulated(
        board,
        m.r,
        m.c,
        m.move,
        player
      );

      const oppPlayer: Player = player === 'CYAN' ? 'WHITE' : 'CYAN';
      let val: number;
      if (turnEnded) {
        val = minimax(nextBoard, targetDepth, -Infinity, Infinity, false, oppPlayer, player, null);
      } else {
        val = minimax(nextBoard, targetDepth, -Infinity, Infinity, true, player, player, nextTurnMustJump);
      }

      // Add a small positional noise (1e-5) to prevent deterministic loop repeating in case of identical evaluations
      val += Math.random() * 0.05;

      if (val > bestVal) {
        bestVal = val;
        bestMoves = [m];
      } else if (val === bestVal) {
        bestMoves.push(m);
      }
    }

    const selected = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return { r: selected.r, c: selected.c, dest: selected.move.dest };
  }

  return null;
}
