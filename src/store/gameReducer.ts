import { GameAction, GameState } from '../types';
import { checkWinner, getInitialBoard, getMovesForPiece, hasAnyJumps } from '../gameLogic';

export const initialGameState: GameState = {
  board: getInitialBoard(),
  turn: 'CYAN',
  selectedPos: null,
  mustJumpPos: null,
  winner: null,
  history: [],
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'HYDRATE_STATE') {
    return action.payload;
  }

  if (action.type === 'RESET_GAME') {
    return {
      ...initialGameState,
      board: getInitialBoard(),
      history: [],
    };
  }

  if (action.type === 'UNDO_MOVE') {
    if (state.history.length === 0) return state;
    const previous = state.history[state.history.length - 1];
    return {
      ...state,
      board: previous.board,
      turn: previous.turn,
      mustJumpPos: previous.mustJumpPos,
      selectedPos: null,
      winner: null,
      history: state.history.slice(0, -1),
    };
  }

  if (action.type === 'SELECT_OR_MOVE' && !state.winner) {
    const { r, c } = action.payload;
    const clickedPiece = state.board[r][c];

    // If selecting a piece of current player's color
    if (clickedPiece && clickedPiece.player === state.turn) {
      // Rule: If MUST jump combo is active, MUST select that piece
      if (state.mustJumpPos) {
        if (r !== state.mustJumpPos.r || c !== state.mustJumpPos.c) {
          return state;
        }
      } else {
        // Rule: Mandatory jump restriction
        const globalJumps = hasAnyJumps(state.board, state.turn);
        if (globalJumps) {
          const moves = getMovesForPiece(state.board, r, c);
          if (!moves.some((m) => m.type === 'jump')) {
            return state; // Can't select this, must pick piece with jump
          }
        }
      }
      return { ...state, selectedPos: { r, c } };
    }

    // Try executing a move to an empty square
    if (!clickedPiece && state.selectedPos) {
      const pos = state.selectedPos;
      const allMoves = getMovesForPiece(state.board, pos.r, pos.c);
      
      let validMoves = allMoves;
      // Filter out steps if any jump is available for this piece
      // (We already verified at selection that if global jumps exist, this piece HAS a jump)
      const hasJumps = allMoves.some((m) => m.type === 'jump');
      if (hasJumps) {
        validMoves = validMoves.filter((m) => m.type === 'jump');
      }

      const move = validMoves.find((m) => m.dest.r === r && m.dest.c === c);
      
      if (move) {
        // Prepare historical snapshot before mutating
        const snapshot = {
          board: state.board.map(row => row.map(cell => cell ? { ...cell } : null)),
          turn: state.turn,
          mustJumpPos: state.mustJumpPos ? { ...state.mustJumpPos } : null,
        };

        // Apply Move
        const newBoard = state.board.map((row) => [...row]);
        const piece = newBoard[pos.r][pos.c]!;
        newBoard[pos.r][pos.c] = null;
        newBoard[r][c] = piece;

        if (move.type === 'jump' && move.captured) {
          newBoard[move.captured.r][move.captured.c] = null;
        }

        let endTurn = true;
        let promoted = false;

        // Check Promotion
        if (piece.type === 'MAN') {
          if (piece.player === 'CYAN' && r === 0) {
            piece.type = 'KING';
            promoted = true;
          } else if (piece.player === 'WHITE' && r === 7) {
            piece.type = 'KING';
            promoted = true;
          }
        }

        // Multi-jump check
        if (move.type === 'jump' && !promoted) {
          const nextMoves = getMovesForPiece(newBoard, r, c);
          if (nextMoves.some((m) => m.type === 'jump')) {
            endTurn = false;
          }
        }

        const newHistory = [...state.history, snapshot];

        if (!endTurn) {
          return {
            ...state,
            board: newBoard,
            selectedPos: { r, c },
            mustJumpPos: { r, c },
            history: newHistory,
          };
        } else {
          const nextTurn = state.turn === 'CYAN' ? 'WHITE' : 'CYAN';
          const winner = checkWinner(newBoard, nextTurn);
          return {
            ...state,
            board: newBoard,
            turn: nextTurn,
            selectedPos: null,
            mustJumpPos: null,
            winner,
            history: newHistory,
          };
        }
      }
    }
  }

  return state;
}
