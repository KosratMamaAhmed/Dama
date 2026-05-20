import { BoardType, Move, Player, Position } from './types';

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function getInitialBoard(): BoardType {
  const board: BoardType = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  let idCounter = 0;
  const gameSeed = Date.now().toString(36);

  // Player 2 (WHITE) top rows (moves down)
  for (let r = 1; r <= 2; r++) {
    for (let c = 0; c < 8; c++) board[r][c] = { id: `w-${gameSeed}-${idCounter++}`, player: 'WHITE', type: 'MAN' };
  }

  // Player 1 (CYAN) bottom rows (moves up)
  for (let r = 5; r <= 6; r++) {
    for (let c = 0; c < 8; c++) board[r][c] = { id: `c-${gameSeed}-${idCounter++}`, player: 'CYAN', type: 'MAN' };
  }

  return board;
}

export function getMovesForPiece(board: BoardType, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const isCyan = piece.player === 'CYAN';
  const dirs = piece.type === 'KING'
    ? [[1, 0], [-1, 0], [0, 1], [0, -1]]
    // CYAN moves up (r-1), WHITE moves down (r+1). Both can move left/right (0, 1) and (0, -1)
    : (isCyan ? [[-1, 0], [0, 1], [0, -1]] : [[1, 0], [0, 1], [0, -1]]);

  const moves: Move[] = [];

  if (piece.type === 'MAN') {
    for (const [dr, dc] of dirs) {
      // Step
      const sr = r + dr;
      const sc = c + dc;
      if (inBounds(sr, sc) && board[sr][sc] === null) {
        moves.push({ type: 'step', dest: { r: sr, c: sc } });
      }
      // Jump
      const jr = r + 2 * dr;
      const jc = c + 2 * dc;
      if (inBounds(jr, jc) && board[jr][jc] === null) {
        const midR = r + dr;
        const midC = c + dc;
        const midPiece = board[midR][midC];
        if (midPiece && midPiece.player !== piece.player) {
          moves.push({ type: 'jump', dest: { r: jr, c: jc }, captured: { r: midR, c: midC } });
        }
      }
    }
  } else {
    // KING Logic
    for (const [dr, dc] of dirs) {
      let dist = 1;
      let foundEnemy: Position | null = null;
      while (true) {
        const cr = r + dr * dist;
        const cc = c + dc * dist;
        if (!inBounds(cr, cc)) break;
        const curr = board[cr][cc];

        if (!foundEnemy) {
          if (curr === null) {
            moves.push({ type: 'step', dest: { r: cr, c: cc } });
          } else if (curr.player !== piece.player) {
            foundEnemy = { r: cr, c: cc };
          } else {
            break; // Blocked by friendly piece
          }
        } else {
          // Once an enemy is found, all subsequent empty squares are valid landing spots for a jump
          if (curr === null) {
            moves.push({ type: 'jump', dest: { r: cr, c: cc }, captured: foundEnemy });
          } else {
            break; // Blocked by a second piece (friendly or enemy)
          }
        }
        dist++;
      }
    }
  }

  return moves;
}

export function getAllValidMoves(board: BoardType, player: Player): { r: number, c: number, move: Move }[] {
  const allMoves: { r: number, c: number, move: Move }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.player === player) {
        const moves = getMovesForPiece(board, r, c);
        moves.forEach(move => {
          allMoves.push({ r, c, move });
        });
      }
    }
  }
  return allMoves;
}

export function hasAnyJumps(board: BoardType, player: Player): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.player === player) {
        const moves = getMovesForPiece(board, r, c);
        if (moves.some((m) => m.type === 'jump')) return true;
      }
    }
  }
  return false;
}

export function checkWinner(board: BoardType, nextTurn: Player): Player | null {
  let cyanCount = 0;
  let whiteCount = 0;
  let nextHasMoves = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.player === 'CYAN') cyanCount++;
        if (p.player === 'WHITE') whiteCount++;
        if (p.player === nextTurn && !nextHasMoves) {
          if (getMovesForPiece(board, r, c).length > 0) {
            nextHasMoves = true;
          }
        }
      }
    }
  }

  if (cyanCount === 0) return 'WHITE';
  if (whiteCount === 0) return 'CYAN';
  if (!nextHasMoves) return nextTurn === 'CYAN' ? 'WHITE' : 'CYAN';
  return null;
}
