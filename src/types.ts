export type Player = 'CYAN' | 'WHITE';
export type PieceType = 'MAN' | 'KING';
export type GameMode = 'AI' | 'FRIEND';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type BoardTheme = 'CLASSIC_WOOD' | 'ROYAL_GOLD' | 'DARK_MARBLE';

export interface Piece {
  id: string;
  player: Player;
  type: PieceType;
}

export interface Position {
  r: number;
  c: number;
}

export type BoardType = (Piece | null)[][];

export interface Move {
  type: 'step' | 'jump';
  dest: Position;
  captured?: Position;
}

export interface HintPosition {
  r: number;
  c: number;
  dest?: Position;
}

export interface GameState {
  board: BoardType;
  turn: Player;
  selectedPos: Position | null;
  mustJumpPos: Position | null;
  winner: Player | null;
  history: { board: BoardType; turn: Player; mustJumpPos: Position | null }[];
  hintsLeft: number;
  hintPos: HintPosition | null;
  mustJumpWarning?: boolean;
}

export type GameAction =
  | { type: 'SELECT_OR_MOVE'; payload: Position }
  | { type: 'RESET_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'USE_HINT'; payload: HintPosition }
  | { type: 'HYDRATE_STATE'; payload: GameState }
  | { type: 'CLEAR_MUST_JUMP_WARNING' };
