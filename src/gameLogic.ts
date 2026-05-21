import { BoardType, Move, Player, Position, Piece } from './types';

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function getInitialBoard(): BoardType {
  const board: BoardType = Array(8).fill(null).map(() => Array(8).fill(null));
  let idCounter = 0;
  
  // یاریزانی دووەم (سپی) - سەرەوە
  for (let r = 1; r <= 2; r++) {
    for (let c = 0; c < 8; c++) board[r][c] = { id: `w-${idCounter++}`, player: 'WHITE', type: 'MAN' };
  }
  // یاریزانی یەکەم (شین) - خوارەوە
  for (let r = 5; r <= 6; r++) {
    for (let c = 0; c < 8; c++) board[r][c] = { id: `c-${idCounter++}`, player: 'CYAN', type: 'MAN' };
  }
  return board;
}

export function getMovesForPiece(board: BoardType, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Move[] = [];
  
  if (piece.type === 'MAN') {
    // جووڵەی بەردی ئاسایی
    const forward = piece.player === 'CYAN' ? -1 : 1;
    const dirs = [[forward, 0], [0, 1], [0, -1]]; // پێشەوە، ڕاست، چەپ
    
    // پشکنینی جووڵەی ئاسایی
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && !board[nr][nc]) {
        moves.push({ type: 'step', dest: { r: nr, c: nc } });
      }
    }
    // پشکنینی خواردن (بازدان)
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      const jumpR = r + dr * 2, jumpC = c + dc * 2;
      if (inBounds(jumpR, jumpC)) {
        const midPiece = board[nr][nc];
        if (midPiece && midPiece.player !== piece.player && !board[jumpR][jumpC]) {
          moves.push({ type: 'jump', dest: { r: jumpR, c: jumpC }, captured: { r: nr, c: nc } });
        }
      }
    }
  } else if (piece.type === 'KING') {
    // جووڵەی شا (پارێزراو لە لۆپی بێکۆتا)
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // هەر چوار لا
    
    for (const [dr, dc] of dirs) {
      let step = 1;
      let pieceSeen = false;
      let capturedPos: Position | null = null;
      
      while (step < 8) { // پارێزەری سەلامەتی: هەرگیز لە ٨ هەنگاو زیاتر ناڕوات بۆ ڕێگریکردن لە جامبوون
        const nr = r + dr * step;
        const nc = c + dc * step;
        
        if (!inBounds(nr, nc)) break; // ئەگەر لە تەختە دەرچوو، بوەستە
        
        const currentSquare = board[nr][nc];
        
        if (!pieceSeen) {
          if (!currentSquare) {
            moves.push({ type: 'step', dest: { r: nr, c: nc } }); // دەتوانێت بڕواتە خانەی خاڵی
          } else if (currentSquare.player !== piece.player) {
            pieceSeen = true; // نەیارێکی بینی!
            capturedPos = { r: nr, c: nc };
          } else {
            break; // بەردی خۆی بینی، ڕێگاکە داخراوە
          }
        } else {
          // ئەگەر نەیارێکی بینیبێت، دەبێت باز بداتە سەر خانەی خاڵی
          if (!currentSquare) {
            moves.push({ type: 'jump', dest: { r: nr, c: nc }, captured: capturedPos! });
          } else {
            break; // ناتوانێت بەسەر دوو بەرددا باز بدات لە یەک کاتدا
          }
        }
        step++; // ئەمە زۆر گرنگە! ئەگەر ئەمە نەبێت یارییەکە سەد لە سەد جام دەبێت.
      }
    }
  }
  
  return moves;
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
  let cyanHasPieces = false;
  let whiteHasPieces = false;
  let nextHasMoves = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.player === 'CYAN') cyanHasPieces = true;
        if (p.player === 'WHITE') whiteHasPieces = true;
        if (p.player === nextTurn) {
          if (getMovesForPiece(board, r, c).length > 0) {
            nextHasMoves = true;
          }
        }
      }
    }
  }

  if (!cyanHasPieces) return 'WHITE';
  if (!whiteHasPieces) return 'CYAN';
  if (!nextHasMoves) return nextTurn === 'CYAN' ? 'WHITE' : 'CYAN';

  return null;
}