export type Player = 'CYAN' | 'WHITE';
export type PieceType = 'MAN' | 'KING';
export type GameMode = 'AI' | 'FRIEND';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type BoardTheme = 'CLASSIC' | 'EMERALD' | 'GOLD' | 'ROYAL' | 'KURDISH_WOOD' | 'GOLD_BLACK' | 'BLUE_BROWN' | 'TOKYO_NEON' | 'COSMIC_VOID';

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

export interface GameState {
  board: BoardType;
  turn: Player;
  selectedPos: Position | null;
  mustJumpPos: Position | null;
  winner: Player | null;
  history: { board: BoardType; turn: Player; mustJumpPos: Position | null }[];
}

export type GameAction =
  | { type: 'SELECT_OR_MOVE'; payload: Position }
  | { type: 'RESET_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'HYDRATE_STATE'; payload: GameState };
