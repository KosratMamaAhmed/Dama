import React, { useMemo } from 'react';
import { GameAction, GameState, Move, Position, BoardTheme } from '../types';
import Piece, { PieceDesignStyle } from './Piece';
import { getMovesForPiece, getAllValidMoves } from '../gameLogic';
import { RefreshCw, Home } from 'lucide-react';
import { Language } from '../translations';

interface BoardProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  theme: BoardTheme;
  disabled?: boolean;
  p1Name?: string;
  p2Name?: string;
  onRestart?: () => void;
  onGoHome?: () => void;
  lang?: Language;
  coachHintSource?: Position | null;
  coachHintDest?: Position | null;
  pieceStyle?: string;
}

export default function Board({
  gameState,
  dispatch,
  theme,
  disabled,
  p1Name,
  p2Name,
  onRestart,
  onGoHome,
  lang = 'KU',
  coachHintSource,
  coachHintDest,
  pieceStyle = 'CLASSIC',
}: BoardProps) {
  const { board, selectedPos, turn, winner } = gameState;

  // Pre-calculate global mandatory jumps if needed
  const globalMoves = useMemo(() => getAllValidMoves(board, turn), [board, turn]);
  const globalJumpSources = useMemo(() => {
    const jumps = globalMoves.filter(m => m.move.type === 'jump');
    return jumps.map(m => `${m.r},${m.c}`);
  }, [globalMoves]);

  // Compute highlighted moves for selected piece so user knows where they can move
  const validMoves = useMemo<Move[]>(() => {
    if (!selectedPos) return [];
    const allMoves = getMovesForPiece(board, selectedPos.r, selectedPos.c);
    if (allMoves.some((m) => m.type === 'jump')) {
      return allMoves.filter((m) => m.type === 'jump');
    }
    return allMoves;
  }, [board, selectedPos]);

  const handleSquareClick = (r: number, c: number) => {
    if (disabled) return;
    dispatch({ type: 'SELECT_OR_MOVE', payload: { r, c } });
  };

  // Define alternating square styles & outer board frames for our gorgeous themes
  const themeClasses = {
    CLASSIC: {
      outer: 'bg-slate-900/40 border-white/10 shadow-slate-950/50',
      lightSquare: 'bg-white/5 border-white/5',
      darkSquare: 'bg-black/35 shadow-inner border-black/10',
      hintColor: 'bg-cyan-400 group-hover:scale-125 shadow-[0_0_12px_#22d3ee]',
    },
    EMERALD: {
      outer: 'bg-emerald-950/40 border-emerald-500/20 shadow-emerald-950/50',
      lightSquare: 'bg-emerald-200/5 border-emerald-500/5',
      darkSquare: 'bg-emerald-950/50 shadow-inner border-emerald-950/30',
      hintColor: 'bg-emerald-400 group-hover:scale-125 shadow-[0_0_12px_#34d399]',
    },
    GOLD: {
      outer: 'bg-amber-950/40 border-amber-500/20 shadow-amber-950/50',
      lightSquare: 'bg-amber-200/5 border-amber-500/5',
      darkSquare: 'bg-amber-950/60 shadow-inner border-amber-950/30',
      hintColor: 'bg-amber-400 group-hover:scale-125 shadow-[0_0_12px_#fbbf24]',
    },
    ROYAL: {
      outer: 'bg-violet-950/40 border-violet-500/20 shadow-violet-950/50',
      lightSquare: 'bg-violet-200/5 border-violet-500/5',
      darkSquare: 'bg-violet-950/60 shadow-inner border-violet-950/30',
      hintColor: 'bg-violet-400 group-hover:scale-125 shadow-[0_0_12px_#a78bfa]',
    },
    KURDISH_WOOD: {
      outer: 'bg-[linear-gradient(135deg,#4a250b_0%,#240f01_100%)] border-amber-700/40 shadow-amber-950/80 shadow-[inset_0_2px_15px_rgba(0,0,0,0.6)]',
      lightSquare: 'bg-[linear-gradient(to_bottom_right,#7a350a_0%,#60290a_100%)] border-amber-900/20 text-amber-100/80',
      darkSquare: 'bg-[linear-gradient(to_bottom_right,#3d1702_0%,#1a0500_100%)] border-stone-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]',
      hintColor: 'bg-amber-500/80 group-hover:scale-110 shadow-[0_0_10px_rgba(245,158,11,0.6)]',
    },
    GOLD_BLACK: {
      outer: 'bg-gradient-to-br from-neutral-900 to-neutral-950 border-amber-500/30 shadow-neutral-950/80 shadow-[inset_0_2px_15px_rgba(245,158,11,0.15)]',
      lightSquare: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 border-amber-500/20 text-slate-100',
      darkSquare: 'bg-black border-neutral-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]',
      hintColor: 'bg-teal-400/80 group-hover:scale-110 shadow-[0_0_10px_rgba(45,212,191,0.6)]',
    },
    BLUE_BROWN: {
      outer: 'bg-gradient-to-br from-sky-950/80 to-amber-950/80 border-sky-500/20 shadow-sky-950/40',
      lightSquare: 'bg-gradient-to-br from-sky-500/40 via-sky-600/40 to-sky-700/40 border-sky-300/20 text-sky-100',
      darkSquare: 'bg-gradient-to-br from-amber-900/60 via-amber-950/60 to-stone-950/80 border-amber-900/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]',
      hintColor: 'bg-amber-300/80 group-hover:scale-110 shadow-[0_0_10px_rgba(252,211,77,0.6)]',
    },
    TOKYO_NEON: {
      outer: 'bg-slate-950 border-purple-500/30 shadow-purple-950/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      lightSquare: 'bg-zinc-900 border-purple-500/10',
      darkSquare: 'bg-black border-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.1)_inset]',
      hintColor: 'bg-cyan-400/80 group-hover:scale-110 shadow-[0_0_10px_rgba(34,211,238,0.6)]',
    },
    COSMIC_VOID: {
      outer: 'bg-[linear-gradient(135deg,#090514_0%,#120c24_100%)] border-indigo-500/20 shadow-indigo-950/60 shadow-[0_0_20px_rgba(99,102,241,0.1)]',
      lightSquare: 'bg-indigo-900/30 border-indigo-500/10 text-indigo-100/80',
      darkSquare: 'bg-[#05020a] border-indigo-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]',
      hintColor: 'bg-fuchsia-400/80 group-hover:scale-110 shadow-[0_0_10px_rgba(232,121,249,0.6)]',
    },
  }[theme];

  // Helper inside Board to assign piece designs per player according to selected Matchup
  const getPieceDesign = (player: 'CYAN' | 'WHITE', matchup: string): PieceDesignStyle => {
    if (matchup === 'KURD_IRAQ') return player === 'CYAN' ? 'KURD' : 'IRAQ';
    if (matchup === 'IRAN_USA') return player === 'CYAN' ? 'IRAN' : 'USA';
    if (matchup === 'IRAQ_KURD') return player === 'CYAN' ? 'IRAQ' : 'KURD';
    if (matchup === 'USA_IRAQ') return player === 'CYAN' ? 'USA' : 'IRAQ';
    if (matchup === 'BLACK_WHITE') return player === 'CYAN' ? 'BLACK' : 'WHITE';
    if (matchup === 'BLUE_BLACK') return player === 'CYAN' ? 'BLUE' : 'BLACK';
    if (matchup === 'GOLD_BLACK') return player === 'CYAN' ? 'GOLD' : 'BLACK';
    if (matchup === 'WHITE_RED') return player === 'CYAN' ? 'WHITE' : 'RED';
    if (matchup === 'ORANGE_GREEN') return player === 'CYAN' ? 'ORANGE' : 'GREEN';
    
    // Default fallbacks
    return player === 'CYAN' ? 'CLASSIC_CYAN' : 'CLASSIC_WHITE';
  };

  return (
    <div className={`relative w-full max-w-[95vw] sm:max-w-2xl aspect-square backdrop-blur-3xl border rounded-3xl p-1.5 sm:p-3 shadow-2xl transition-all duration-500 ${themeClasses.outer}`}>
      
      {/* Absolute Winner Celebration Overlay */}
      {winner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl pointer-events-none p-4">
          <div className="text-center p-6 bg-gradient-to-br from-cyan-900/90 to-indigo-900/90 border border-cyan-400/30 rounded-2xl shadow-2xl pointer-events-auto max-w-sm w-full font-sans">
            <div className="text-5xl animate-bounce mb-3 flex justify-center space-x-2 space-x-reverse drop-shadow-md">
              <span>🏆</span>
              <span>🎉</span>
              <span>✨</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white drop-shadow-md mb-1">
              {winner === 'CYAN' ? p1Name : p2Name}
            </h2>
            <div className="text-cyan-400 font-bold uppercase tracking-[0.2em] text-xs mt-2 bg-black/20 py-1.5 rounded-full border border-cyan-500/20">
              WINNER • براوە
            </div>

            {/* Quick Play Again and Home Actions inside winner overlay container */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={onRestart}
                className="flex items-center justify-center space-x-1.5 space-x-reverse bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black py-2.5 px-3 rounded-xl transition-all duration-300 active:scale-95 text-xs shadow-md shadow-cyan-950/25 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {lang === 'KU' ? 'دووبارە بکەرەوە' : lang === 'AR' ? 'اللعب مجدداً' : 'Play Again'}
                </span>
              </button>
              <button
                onClick={onGoHome}
                className="flex items-center justify-center space-x-1.5 space-x-reverse bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2.5 px-3 rounded-xl transition-all duration-300 active:scale-95 text-xs cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>
                  {lang === 'KU' ? 'سەرەتا' : lang === 'AR' ? 'القائمة' : 'Home'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5 sm:gap-1">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isSelected = selectedPos?.r === r && selectedPos?.c === c;
            
            // Highlight explicit mandatory jump OR inferred global mandatory jump before selection
            const isMustJumpExplicit = gameState.mustJumpPos?.r === r && gameState.mustJumpPos?.c === c;
            const isMustJumpImplicit = !gameState.mustJumpPos && globalJumpSources.includes(`${r},${c}`);
            const isMustJump = isMustJumpExplicit || isMustJumpImplicit;
            
            const validMove = validMoves.find((m) => m.dest.r === r && m.dest.c === c);
            const isLight = (r + c) % 2 === 0;

            const isCoachSource = coachHintSource?.r === r && coachHintSource?.c === c;
            const isCoachDest = coachHintDest?.r === r && coachHintDest?.c === c;
            
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  group relative flex items-center justify-center rounded-lg
                  border cursor-pointer transition-all duration-300 overflow-hidden
                  ${isLight ? themeClasses.lightSquare : themeClasses.darkSquare}
                  ${validMove ? 'bg-white/15 dark:bg-white/20 scale-[0.98] ring-inset ring-2 ring-cyan-400/50 shadow-lg' : 'hover:scale-[0.98]'}
                  ${isMustJump && !isSelected ? 'ring-2 sm:ring-4 ring-amber-500 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse' : ''}
                  ${isCoachSource ? 'ring-2 sm:ring-4 ring-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse' : ''}
                  ${isCoachDest ? 'ring-2 sm:ring-4 ring-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}
                `}
              >
                {/* Visual Coach Source and Dest overlays */}
                {isCoachSource && (
                  <div className="absolute inset-1 border-2 border-orange-500 rounded-full animate-ping pointer-events-none z-30 opacity-75" />
                )}
                {isCoachDest && (
                  <div className="absolute w-5 h-5 rounded-full border-4 border-yellow-400 animate-bounce pointer-events-none z-30" />
                )}

                {/* Highlight valid destination indicator */}
                {validMove && (
                  <div
                    className={`absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full z-0 transition-all duration-300 animate-pulse ${
                      validMove.type === 'jump'
                        ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                        : themeClasses.hintColor
                    }`}
                  />
                )}
                {piece && (
                  <Piece
                    piece={piece}
                    isSelected={isSelected}
                    theme={theme}
                    pieceStyle={getPieceDesign(piece.player, pieceStyle)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
