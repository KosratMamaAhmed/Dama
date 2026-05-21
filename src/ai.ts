import { BoardType, Difficulty, Move, Player, Position } from './types';
import { getMovesForPiece, hasAnyJumps } from './gameLogic';

function cloneBoard(board: BoardType): BoardType {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function getAllValidMoves(board: BoardType, player: Player, mustJumpPos?: Position | null) {
  const moves: { r: number, c: number, move: Move }[] = [];
  
  if (mustJumpPos) {
    const { r, c } = mustJumpPos;
    const p = board[r][c];
    if (p && p.player === player) {
      getMovesForPiece(board, r, c).forEach(m => {
        if (m.type === 'jump') moves.push({ r, c, move: m });
      });
    }
    return moves;
  }

  const mustJump = hasAnyJumps(board, player);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.player === player) {
        getMovesForPiece(board, r, c).forEach(m => {
          if (!mustJump || m.type === 'jump') {
            moves.push({ r, c, move: m });
          }
        });
      }
    }
  }
  return moves;
}

// هەڵسەنگاندنی خێرای بۆرد بۆ ئەوەی مۆبایلەکە جام نەبێت بەڵام ڕۆبۆتەکە زیرەک بێت
function evaluateBoard(board: BoardType, aiPlayer: Player): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const isAI = piece.player === aiPlayer;
        let val = piece.type === 'KING' ? 25 : 5; // شا زۆر بەهێزە
        
        // خاڵی زیاتر بۆ کۆنتڕۆڵکردنی ناوەڕاستی تەختەکە (زیرەکی زیاتر دەدات بە ڕۆبۆت)
        if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
          val += 2;
        }
        
        // خاڵی زیاتر بۆ پاراستنی هێڵی دواوە (بەرگری دەکات)
        if (piece.type === 'MAN') {
           if ((isAI && aiPlayer === 'WHITE' && r === 0) || (!isAI && aiPlayer === 'CYAN' && r === 7)) {
             val += 3;
           }
        }
        
        score += isAI ? val : -val;
      }
    }
  }
  return score;
}

export function getAIMove(board: BoardType, difficulty: Difficulty, player: Player, mustJumpPos: Position | null) {
  const moves = getAllValidMoves(board, player, mustJumpPos);
  if (moves.length === 0) return null;

  // یاسای دامە: ئەگەر خواردن هەبێت دەبێت بخورێت
  const jumpMoves = moves.filter(m => m.move.type === 'jump');
  const validMoves = jumpMoves.length > 0 ? jumpMoves : moves;

  // ئەگەر ئاستەکە ئاسان بێت، بە هەڕەمەکی دەجووڵێت (بۆ کەسانی سەرەتا)
  if (difficulty === 'EASY') {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  let bestVal = -Infinity;
  let bestMoves: typeof validMoves = [];

  for (const m of validMoves) {
    const newBoard = cloneBoard(board);
    
    // جێبەجێکردنی جووڵەکە لە خەیاڵدا
    newBoard[m.move.dest.r][m.move.dest.c] = newBoard[m.r][m.c];
    newBoard[m.r][m.c] = null;
    if (m.move.captured) {
      newBoard[m.move.captured.r][m.move.captured.c] = null;
    }
    
    // پشکنینی بوون بە شا (Promotion)
    const destPiece = newBoard[m.move.dest.r][m.move.dest.c];
    if (destPiece && destPiece.type === 'MAN') {
      if ((destPiece.player === 'CYAN' && m.move.dest.r === 0) || (destPiece.player === 'WHITE' && m.move.dest.r === 7)) {
        newBoard[m.move.dest.r][m.move.dest.c] = { ...destPiece, type: 'KING' };
      }
    }

    let val = evaluateBoard(newBoard, player);
    
    // پێدانی کەمێک هەڕەمەکی بۆ ئەوەی ڕۆبۆتەکە هەردەم یەک جووڵە نەکاتەوە
    val += Math.random() * 0.8;

    if (val > bestVal) {
      bestVal = val;
      bestMoves = [m];
    } else if (val === bestVal) {
      bestMoves.push(m);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}